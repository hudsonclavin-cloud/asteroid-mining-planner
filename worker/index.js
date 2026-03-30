/**
 * aster-proxy — Cloudflare Worker
 *
 * Proxies POST /api/research from the Aster frontend to the Perplexity API.
 * Keeps PERPLEXITY_API_KEY server-side via a Cloudflare secret.
 *
 * Deploy:
 *   wrangler secret put PERPLEXITY_API_KEY
 *   wrangler deploy
 */

const ALLOWED_ORIGIN = 'https://hudsonclavin.github.io';
const RATE_LIMIT = 10;         // max requests per window per IP
const RATE_WINDOW_MS = 60_000; // 1 minute

/**
 * In-process rate limit store.
 * Persists within a single V8 isolate instance; resets on worker restart or
 * when Cloudflare spins up a new isolate. Best-effort — adequate for a hobby
 * project. For strict enforcement, use Durable Objects or CF Rate Limiting API.
 */
const rateLimitStore = new Map();

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
  // Reflect the allowed origin; default to ALLOWED_ORIGIN for non-browser callers.
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
 * Build a structured Perplexity prompt from the asteroid context the client
 * provides. All fields are optional — the prompt degrades gracefully.
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

    // ── Call Perplexity ──────────────────────────────────────────────────────
    let perplexityRes;
    try {
      perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
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

    if (!perplexityRes.ok) {
      const detail = await perplexityRes.text().catch(() => '');
      return jsonResponse(
        { error: 'Perplexity API error', status: perplexityRes.status, detail },
        502,
        origin,
      );
    }

    const data = await perplexityRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    return jsonResponse(
      { content, model: data.model, usage: data.usage },
      200,
      origin,
    );
  },
};
