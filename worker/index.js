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

// ── Shared cache for NASA API proxies ────────────────────────────────────────
const apiCache = new Map(); // key: URL string, value: { data, expiry, cachedAt }

async function cachedProxyFetch(targetUrl, ttlMs) {
  const now    = Date.now();
  const cached = apiCache.get(targetUrl);
  const stale  = cached && now > cached.expiry;

  if (cached && !stale) return { data: cached.data, stale: false, cachedAt: cached.cachedAt || now };

  try {
    const r = await fetch(targetUrl, { cf: { cacheTtl: Math.floor(ttlMs / 1000) } });
    if (!r.ok) throw new Error(`Upstream HTTP ${r.status}`);
    const isJson = (r.headers.get('content-type') || '').includes('json');
    const data   = isJson ? await r.json() : await r.text();
    apiCache.set(targetUrl, { data, expiry: now + ttlMs, cachedAt: now });
    return { data, stale: false, cachedAt: now };
  } catch (err) {
    if (cached) return { data: cached.data, stale: true, cachedAt: cached.cachedAt || now }; // serve stale on upstream failure
    throw err;
  }
}

function extractSignatureVersion(data) {
  return data && typeof data === 'object' ? (data.signature?.version || null) : null;
}

function wrapProxyObject(data, stale, cachedAt, sourceOverride) {
  const meta = {
    ok: true,
    source: sourceOverride || (data && typeof data === 'object' ? data.signature?.source : null) || 'proxy',
    signatureVersion: extractSignatureVersion(data),
    stale: !!stale,
    cachedAt: cachedAt || Date.now(),
  };
  if (data && typeof data === 'object' && !Array.isArray(data)) return { ...data, ...meta };
  return { ...meta, data, raw: data };
}

// ── Parse JPL Horizons VECTORS text output → [{jd, x, y, z, vx, vy, vz}] ───
// Horizons wraps each epoch block between $$SOE / $$EOE markers:
//   2459000.500000000 = A.D. 2020-Jun-06 ...
//   X = -7.87E-01 Y = -5.99E-01 Z = -2.60E-01
//   VX= 1.02E-02  VY= -1.47E-02  VZ= -6.40E-03
function parseHorizonsVectors(text) {
  const soe = text.indexOf('$$SOE');
  const eoe = text.indexOf('$$EOE');
  if (soe === -1 || eoe === -1) return [];
  const body    = text.slice(soe + 5, eoe);
  const records = [];
  const blocks  = body.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const numRe   = /[-+]?\d+\.?\d*[eE][-+]?\d+|[-+]?\d+\.\d+/g;
  for (const block of blocks) {
    const lines   = block.split('\n').map(l => l.trim());
    const jd      = parseFloat(lines[0]);
    if (isNaN(jd)) continue;
    const xyzLine = lines.find(l => /^X\s*=/.test(l)) || '';
    const vLine   = lines.find(l => /^VX\s*=/.test(l)) || '';
    const xyz     = [...xyzLine.matchAll(numRe)].map(m => parseFloat(m[0]));
    const v       = [...vLine.matchAll(numRe)].map(m => parseFloat(m[0]));
    if (xyz.length < 3 || v.length < 3) continue;
    records.push({ jd, x: xyz[0], y: xyz[1], z: xyz[2], vx: v[0], vy: v[1], vz: v[2] });
  }
  return records;
}

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

function resolveAllowedOrigin(origin) {
  if (!origin) return 'https://hudsonclavin-cloud.github.io';
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  try {
    const url = new URL(origin);
    const isGithubPages = url.protocol === 'https:' && url.hostname.endsWith('.github.io');
    const isLocalDev = (url.protocol === 'http:' || url.protocol === 'https:')
      && /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
    if (isGithubPages || isLocalDev) return origin;
  } catch (_) {}
  return 'https://hudsonclavin-cloud.github.io';
}

function corsHeaders(origin) {
  const allowed = resolveAllowedOrigin(origin);
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

    // ── GET /api/nhats ───────────────────────────────────────────────────────
    if (url.pathname === '/api/nhats' && request.method === 'GET') {
      const nasaUrl = new URL('https://ssd-api.jpl.nasa.gov/nhats.api');
      if (!url.searchParams.has('dv')) nasaUrl.searchParams.set('dv', '12');
      if (!url.searchParams.has('dur')) nasaUrl.searchParams.set('dur', '450');
      if (!url.searchParams.has('stay')) nasaUrl.searchParams.set('stay', '8');
      for (const [k, v] of url.searchParams) nasaUrl.searchParams.set(k, v);
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(nasaUrl.toString(), 24 * 60 * 60 * 1000);
        const body = wrapProxyObject(data, stale, cachedAt, 'NASA/JPL NHATS API');
        return jsonResponse(body, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'NHATS proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/horizons ────────────────────────────────────────────────────
    if (url.pathname === '/api/horizons' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
      const target = new URL('https://ssd.jpl.nasa.gov/api/horizons.api');
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      if (!target.searchParams.has('EPHEM_TYPE')) target.searchParams.set('EPHEM_TYPE', 'VECTORS');
      if (!target.searchParams.has('OUT_UNITS'))  target.searchParams.set('OUT_UNITS',  'AU-D');
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(target.toString(), 24 * 60 * 60 * 1000);
        const vectors = parseHorizonsVectors(typeof data === 'string' ? data : JSON.stringify(data));
        return jsonResponse({
          ok: true,
          source: 'NASA/JPL Horizons API',
          signatureVersion: extractSignatureVersion(data),
          stale: !!stale,
          cachedAt: cachedAt || Date.now(),
          vectors,
        }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Horizons proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/horizons-lookup ─────────────────────────────────────────────
    if (url.pathname === '/api/horizons-lookup' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
      const target = new URL('https://ssd.jpl.nasa.gov/api/horizons_lookup.api');
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      if (!target.searchParams.has('format')) target.searchParams.set('format', 'json');
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(target.toString(), 7 * 24 * 60 * 60 * 1000);
        return jsonResponse(wrapProxyObject(data, stale, cachedAt, 'NASA/JPL Horizons Lookup API'), 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Horizons lookup proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/sbdb-query ──────────────────────────────────────────────────
    if (url.pathname === '/api/sbdb-query' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
      const target = new URL('https://ssd-api.jpl.nasa.gov/sbdb_query.api');
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(target.toString(), 12 * 60 * 60 * 1000);
        return jsonResponse(wrapProxyObject(data, stale, cachedAt, 'NASA/JPL SBDB Query API'), 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'SBDB query proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/sbdb ────────────────────────────────────────────────────────
    if (url.pathname === '/api/sbdb' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
      const target = new URL('https://ssd-api.jpl.nasa.gov/sbdb.api');
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(target.toString(), 24 * 60 * 60 * 1000);
        return jsonResponse(wrapProxyObject(data, stale, cachedAt, 'NASA/JPL SBDB API'), 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'SBDB proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/asterank ────────────────────────────────────────────────────
    if (url.pathname === '/api/asterank' && request.method === 'GET') {
      const upUrl = new URL('https://www.asterank.com/api/asterank');
      for (const [k, v] of url.searchParams) upUrl.searchParams.set(k, v);
      try {
        const { data } = await cachedProxyFetch(upUrl.toString(), 6 * 60 * 60 * 1000); // 6-hour cache
        return jsonResponse(data, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Asterank proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/cad ─────────────────────────────────────────────────────────
    if (url.pathname === '/api/cad' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
      const target = new URL('https://ssd-api.jpl.nasa.gov/cad.api');
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(target.toString(), 24 * 60 * 60 * 1000);
        return jsonResponse(wrapProxyObject(data, stale, cachedAt, 'NASA/JPL CAD API'), 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'CAD proxy failed', detail: err.message }, 502, origin);
      }
    }

    // ── GET /api/sentry ──────────────────────────────────────────────────────
    if (url.pathname === '/api/sentry' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
      const target = new URL('https://ssd-api.jpl.nasa.gov/sentry.api');
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
      try {
        const { data, stale, cachedAt } = await cachedProxyFetch(target.toString(), 24 * 60 * 60 * 1000);
        return jsonResponse(wrapProxyObject(data, stale, cachedAt, 'NASA/JPL Sentry API'), 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Sentry proxy failed', detail: err.message }, 502, origin);
      }
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
