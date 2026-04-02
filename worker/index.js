/**
 * aster-proxy — Cloudflare Worker
 *
 * Proxies POST /api/research from the Aster frontend to the OpenAI API.
 * Keeps OPENAI_API_KEY server-side via a Cloudflare secret.
 *
 * Deploy:
 *   wrangler secret put OPENAI_API_KEY
 *   wrangler deploy
 */

const ALLOWED_ORIGINS = new Set([
  'https://hudsonclavin-cloud.github.io',
  'http://localhost:8080',
]);
const RATE_LIMIT = 10;         // max requests per window per IP
const RATE_WINDOW_MS = 60_000; // 1 minute

const pricesCache = { data: null, at: 0 };
const PRICE_CACHE_MS = 60 * 60 * 1000; // 1 hour

const FALLBACK_PRICES = {
  gold: 92000, silver: 1050, platinum: 31000, palladium: 32000,
  iridium: 52000, copper: 9.5, nickel: 16, cobalt: 28,
  iron: 0.12, rareEarth: 250, water: 0, carbon: 0.5, silicates: 0.01,
};

/**
 * In-process rate limit store.
 * Persists within a single V8 isolate instance; resets on worker restart or
 * when Cloudflare spins up a new isolate. Best-effort — adequate for a hobby
 * project. For strict enforcement, use Durable Objects or CF Rate Limiting API.
 */
const rateLimitStore = new Map();

// ── Static commodity prices + in-memory cache for /api/prices ────────────────
const STATIC_PRICES = {
  water: 0, iron: 0.12, nickel: 16, cobalt: 28, pgm: 31000,
  gold: 92000, silver: 1050, copper: 9.50, carbon: 0.50,
  silicates: 0.01, rareEarth: 250,
};
let priceCache = null;
let priceCacheTime = 0;
const PRICE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateLimitStore.set(ip, entry);
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://hudsonclavin-cloud.github.io';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/**
 * Build a structured prompt from the asteroid context the client provides.
 * All fields are optional — the prompt degrades gracefully.
 */
function buildPrompt({ asteroidName, designation, spectralType, orbit, miningScore }) {
  const name = asteroidName || designation || 'unknown';
  const orbitSummary = orbit
    ? `semi-major axis ${orbit.a ?? '?'} AU, eccentricity ${orbit.e ?? '?'}, inclination ${orbit.i ?? '?'}°`
    : 'orbital elements not provided';

  return `You are an expert planetary scientist and space mission analyst. \
Provide a concise research briefing on the asteroid ${name} covering these five areas:

1. Physical properties — estimated size, mass, bulk composition, albedo, rotation period; \
spectral class is ${spectralType || 'unknown'}.
2. Orbital characteristics — ${orbitSummary}; MOID with Earth if known.
3. Mining potential — accessible resources (water ice, silicates, metals, PGMs), estimated \
economic value, extraction challenges.
4. Scientific findings — notable ground-based or spacecraft observations, peer-reviewed \
discoveries, flyby or rendezvous data.
5. Mission feasibility — rendezvous delta-v, known launch windows, any proposed or funded \
mission concepts.

Aster composite mining score for context: ${miningScore ?? 'N/A'} / 100.

Be concise and data-driven. Use bullet points where helpful. If information is uncertain or \
unavailable, say so rather than speculating. Keep total response under 800 words.`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // ── Preflight ────────────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── GET /api/prices ──────────────────────────────────────────────────────
    if (url.pathname === '/api/prices' && request.method === 'GET') {
      if (priceCache && Date.now() - priceCacheTime < PRICE_CACHE_TTL) {
        return jsonResponse(priceCache, 200, origin);
      }
      // Try live metals API if key is configured (optional)
      if (env.METALS_API_KEY) {
        try {
          const r = await fetch(
            `https://metals-api.com/api/latest?access_key=${env.METALS_API_KEY}&base=USD&symbols=XAU,XAG,XPT,XPD,COPPER,NICKEL,COBALT`,
            { cf: { cacheTtl: 3600 } }
          );
          if (r.ok) {
            const raw = await r.json();
            const oz2kg = 1 / 32.1507; // troy oz → kg
            priceCache = {
              prices: {
                ...STATIC_PRICES,
                gold:    raw.rates?.XAU ? 1 / (raw.rates.XAU * oz2kg) : STATIC_PRICES.gold,
                silver:  raw.rates?.XAG ? 1 / (raw.rates.XAG * oz2kg) : STATIC_PRICES.silver,
                pgm:     raw.rates?.XPT ? 1 / (raw.rates.XPT * oz2kg) : STATIC_PRICES.pgm,
                nickel:  raw.rates?.NICKEL ? raw.rates.NICKEL          : STATIC_PRICES.nickel,
                cobalt:  raw.rates?.COBALT ? raw.rates.COBALT          : STATIC_PRICES.cobalt,
                copper:  raw.rates?.COPPER ? raw.rates.COPPER          : STATIC_PRICES.copper,
              },
              source: 'metals-api',
              timestamp: Date.now(),
            };
            priceCacheTime = Date.now();
            return jsonResponse(priceCache, 200, origin);
          }
        } catch (_) {}
      }
      // Fallback to static prices
      priceCache = { prices: STATIC_PRICES, source: 'static', timestamp: Date.now() };
      priceCacheTime = Date.now();
      return jsonResponse(priceCache, 200, origin);
    }

    // ── Route guard ──────────────────────────────────────────────────────────
    if (url.pathname !== '/api/research' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }

    // ── Rate limiting ────────────────────────────────────────────────────────
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    if (!checkRateLimit(ip)) {
      return jsonResponse(
        { error: 'Rate limit exceeded. Max 10 requests per minute per IP.' },
        429,
        origin,
      );
    }

    // ── Parse request body ───────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
    }

    const { asteroidName, designation } = body;
    if (!asteroidName && !designation) {
      return jsonResponse(
        { error: 'Request body must include at least asteroidName or designation' },
        400,
        origin,
      );
    }

    // ── Call OpenAI ──────────────────────────────────────────────────────────
    let openAIRes;
    try {
      openAIRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [{ role: 'user', content: buildPrompt(body) }],
        }),
      });
    } catch (err) {
      return jsonResponse(
        { error: 'Upstream fetch failed', detail: err.message },
        502,
        origin,
      );
    }

    if (!openAIRes.ok) {
      const detail = await openAIRes.text().catch(() => '');
      return jsonResponse(
        { error: 'OpenAI API error', status: openAIRes.status, detail },
        502,
        origin,
      );
    }

    const data = await openAIRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    return jsonResponse(
      { content, model: data.model, usage: data.usage },
      200,
      origin,
    );
  },
};
