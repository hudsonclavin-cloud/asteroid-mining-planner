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

const PRIMARY_APP_ORIGIN = 'https://hudsonclavin-cloud.github.io';
const DEV_APP_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8090',
  'http://127.0.0.1:8090',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMITS = {
  research: 10,
  proxy: 60,
};
const MAX_API_CACHE_ENTRIES = 128;

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
const apiCache = new Map(); // key: URL string, value: { data, expiry, fetchedAt }

function getAllowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
  return new Set([PRIMARY_APP_ORIGIN, ...DEV_APP_ORIGINS, ...configured]);
}

function pruneMap(map, now = Date.now()) {
  for (const [key, value] of map) {
    if (value && Number.isFinite(value.expiry) && value.expiry <= now) {
      map.delete(key);
    }
  }
}

function pruneRateLimitStore(now = Date.now()) {
  for (const [key, value] of rateLimitStore) {
    if (!value || !Number.isFinite(value.resetAt) || value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function setBoundedCacheEntry(map, key, value, maxEntries = MAX_API_CACHE_ENTRIES) {
  pruneMap(map);
  if (map.has(key)) map.delete(key);
  while (map.size >= maxEntries) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) break;
    map.delete(oldestKey);
  }
  map.set(key, value);
}

async function cachedProxyFetch(targetUrl, ttlMs) {
  const now    = Date.now();
  const cached = apiCache.get(targetUrl);
  const stale  = cached && now > cached.expiry;

  if (cached && !stale) return { data: cached.data, stale: false, fetchedAt: cached.fetchedAt };

  try {
    const r = await fetch(targetUrl, { cf: { cacheTtl: Math.floor(ttlMs / 1000) } });
    if (!r.ok) throw new Error(`Upstream HTTP ${r.status}`);
    const isJson = (r.headers.get('content-type') || '').includes('json');
    const data   = isJson ? await r.json() : await r.text();
    setBoundedCacheEntry(apiCache, targetUrl, { data, expiry: now + ttlMs, fetchedAt: now });
    return { data, stale: false, fetchedAt: now };
  } catch (err) {
    if (cached) return { data: cached.data, stale: true, fetchedAt: cached.fetchedAt }; // serve stale on upstream failure
    throw err;
  }
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

function checkRateLimit(ip, bucket = 'proxy', limit = RATE_LIMITS.proxy) {
  const now = Date.now();
  const key = `${bucket}:${ip}`;
  pruneRateLimitStore(now);
  let entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateLimitStore.set(key, entry);
  }
  entry.count++;
  return entry.count <= limit;
}

function isOriginAllowed(origin, env) {
  if (!origin) return false;
  try {
    const normalized = new URL(origin).origin;
    const parsed = new URL(normalized);
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return true;
    }
    return getAllowedOrigins(env).has(normalized);
  } catch (_) {
    return false;
  }
}

function resolveCorsOrigin(origin, env) {
  return isOriginAllowed(origin, env) ? new URL(origin).origin : PRIMARY_APP_ORIGIN;
}

function corsHeaders(origin, env) {
  const allowed = resolveCorsOrigin(origin, env);
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
}

function jsonResponse(body, status, origin, env, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env), ...extraHeaders },
  });
}

function rejectIfOriginDisallowed(origin, env, options = {}) {
  const { requireOrigin = false } = options;
  if (!origin) {
    return requireOrigin
      ? jsonResponse({ error: 'Origin required' }, 403, '', env)
      : null;
  }
  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ error: 'Origin not allowed' }, 403, origin, env);
  }
  return null;
}

function pickSearchParams(source, allowedKeys, transforms = {}) {
  const out = new URLSearchParams();
  for (const key of allowedKeys) {
    if (!source.has(key)) continue;
    const raw = source.get(key);
    const value = transforms[key] ? transforms[key](raw) : raw;
    if (value === null || value === undefined || value === '') continue;
    out.set(key, value);
  }
  return out;
}

function clampIntegerString(value, min, max, fallback) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return String(fallback);
  return String(Math.max(min, Math.min(max, n)));
}

function limitString(value, maxLen = 512) {
  const s = String(value || '').trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function parseFiniteOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeResearchPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const asteroidName = limitString(body.asteroidName, 120);
  const designation = limitString(body.designation, 120);
  if (!asteroidName && !designation) {
    return { ok: false, error: 'Request body must include asteroidName or designation' };
  }
  const spectralType = limitString(body.spectralType, 24);
  const deltaV = parseFiniteOrNull(body.deltaV_kms ?? body.delta_v_kms);
  const miningScore = parseFiniteOrNull(body.miningScore);
  const orbit = body.orbit && typeof body.orbit === 'object' && !Array.isArray(body.orbit)
    ? {
        a: parseFiniteOrNull(body.orbit.a),
        e: parseFiniteOrNull(body.orbit.e),
        i: parseFiniteOrNull(body.orbit.i),
      }
    : null;
  return {
    ok: true,
    value: {
      asteroidName: asteroidName || null,
      designation: designation || null,
      spectralType: spectralType || null,
      orbit,
      deltaV_kms: Number.isFinite(deltaV) ? Number(deltaV.toFixed(2)) : null,
      miningScore: Number.isFinite(miningScore) ? Number(miningScore.toFixed(1)) : null,
    },
  };
}

/**
 * Build a structured prompt from the asteroid context the client provides.
 * All fields are optional — the prompt degrades gracefully.
 */
function buildPrompt({ asteroidName, designation, spectralType, orbit, deltaV_kms, miningScore }) {
  const name = asteroidName || designation || 'unknown';
  const orbitSummary = orbit
    ? `semi-major axis ${orbit.a ?? '?'} AU, eccentricity ${orbit.e ?? '?'}, inclination ${orbit.i ?? '?'}°`
    : 'orbital elements not provided';
  const plannerContext = Number.isFinite(deltaV_kms)
    ? `${deltaV_kms.toFixed(2)} km/s screening delta-v`
    : Number.isFinite(miningScore)
      ? `screening score ${miningScore.toFixed(1)} / 100`
      : 'no planner context provided';

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

Aster planner context: ${plannerContext}.

Be concise and data-driven. Use bullet points where helpful. If information is uncertain or \
unavailable, say so rather than speculating. Keep total response under 800 words.`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    const isResearchRoute = url.pathname === '/api/research';

    // ── Preflight ────────────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      const originError = rejectIfOriginDisallowed(origin, env, { requireOrigin: isResearchRoute });
      if (originError) return originError;
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    // ── GET /api/prices ──────────────────────────────────────────────────────
    if (url.pathname === '/api/prices' && request.method === 'GET') {
      if (priceCache && Date.now() - priceCacheTime < PRICE_CACHE_TTL) {
        return jsonResponse(priceCache, 200, origin, env);
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
            return jsonResponse(priceCache, 200, origin, env);
          }
        } catch (_) {}
      }
      // Fallback to static prices
      priceCache = { prices: STATIC_PRICES, source: 'static', timestamp: Date.now() };
      priceCacheTime = Date.now();
      return jsonResponse(priceCache, 200, origin, env);
    }

    // ── GET /api/nhats ───────────────────────────────────────────────────────
    if (url.pathname === '/api/nhats' && request.method === 'GET') {
      const originError = rejectIfOriginDisallowed(origin, env);
      if (originError) return originError;
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip, 'proxy', RATE_LIMITS.proxy)) {
        return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin, env);
      }
      const nasaUrl = new URL('https://ssd-api.jpl.nasa.gov/nhats.api');
      const params = pickSearchParams(url.searchParams, ['dv', 'dur', 'stay', 'des'], {
        dv: v => clampIntegerString(v, 1, 30, 12),
        dur: v => clampIntegerString(v, 1, 1500, 450),
        stay: v => clampIntegerString(v, 0, 365, 8),
        des: v => limitString(v, 64),
      });
      if (!params.has('dv')) params.set('dv', '12');
      if (!params.has('dur')) params.set('dur', '450');
      if (!params.has('stay')) params.set('stay', '8');
      nasaUrl.search = params.toString();
      try {
        const { data, stale } = await cachedProxyFetch(nasaUrl.toString(), 24 * 60 * 60 * 1000);
        const body = typeof data === 'object' && data !== null ? { ...data, stale } : { raw: data, stale };
        return jsonResponse(body, 200, origin, env);
      } catch (_) {
        return jsonResponse({ error: 'NHATS upstream unavailable' }, 502, origin, env);
      }
    }

    // ── GET /api/horizons ────────────────────────────────────────────────────
    if (url.pathname === '/api/horizons' && request.method === 'GET') {
      const originError = rejectIfOriginDisallowed(origin, env);
      if (originError) return originError;
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip, 'proxy', RATE_LIMITS.proxy)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin, env);
      const target = new URL('https://ssd.jpl.nasa.gov/api/horizons.api');
      const params = pickSearchParams(url.searchParams, ['COMMAND', 'CENTER', 'START_TIME', 'STOP_TIME', 'STEP_SIZE', 'EPHEM_TYPE', 'OUT_UNITS', 'REF_PLANE', 'REF_SYSTEM', 'VEC_TABLE', 'CSV_FORMAT', 'OBJ_DATA', 'MAKE_EPHEM', 'format'], {
        COMMAND: v => limitString(v, 128),
        CENTER: v => limitString(v, 64),
        START_TIME: v => limitString(v, 64),
        STOP_TIME: v => limitString(v, 64),
        STEP_SIZE: v => limitString(v, 32),
        EPHEM_TYPE: v => limitString(v, 32),
        OUT_UNITS: v => limitString(v, 16),
        REF_PLANE: v => limitString(v, 16),
        REF_SYSTEM: v => limitString(v, 16),
        VEC_TABLE: v => limitString(v, 8),
        CSV_FORMAT: v => limitString(v, 8),
        OBJ_DATA: v => limitString(v, 8),
        MAKE_EPHEM: v => limitString(v, 8),
        format: v => limitString(v, 8),
      });
      target.search = params.toString();
      if (!target.searchParams.has('EPHEM_TYPE')) target.searchParams.set('EPHEM_TYPE', 'VECTORS');
      if (!target.searchParams.has('OUT_UNITS'))  target.searchParams.set('OUT_UNITS',  'AU-D');
      try {
        const { data, stale } = await cachedProxyFetch(target.toString(), 24 * 60 * 60 * 1000);
        const vectors = parseHorizonsVectors(typeof data === 'string' ? data : JSON.stringify(data));
        return jsonResponse({ vectors, stale, source: 'JPL Horizons' }, 200, origin, env);
      } catch (_) {
        return jsonResponse({ error: 'Horizons upstream unavailable' }, 502, origin, env);
      }
    }

    // ── GET /api/asterank ────────────────────────────────────────────────────
    if (url.pathname === '/api/asterank' && request.method === 'GET') {
      const originError = rejectIfOriginDisallowed(origin, env);
      if (originError) return originError;
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip, 'proxy', RATE_LIMITS.proxy)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin, env);
      const upUrl = new URL('https://www.asterank.com/api/asterank');
      const params = pickSearchParams(url.searchParams, ['query', 'limit', 'sort', 'fields'], {
        query: v => limitString(v, 800),
        limit: v => clampIntegerString(v, 1, 2000, 500),
        sort: v => limitString(v, 64),
        fields: v => limitString(v, 512),
      });
      upUrl.search = params.toString();
      try {
        const { data } = await cachedProxyFetch(upUrl.toString(), 6 * 60 * 60 * 1000); // 6-hour cache
        return jsonResponse(data, 200, origin, env);
      } catch (_) {
        return jsonResponse({ error: 'Asterank upstream unavailable' }, 502, origin, env);
      }
    }

    // ── GET /api/cad ─────────────────────────────────────────────────────────
    if (url.pathname === '/api/cad' && request.method === 'GET') {
      const originError = rejectIfOriginDisallowed(origin, env);
      if (originError) return originError;
      const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
      if (!checkRateLimit(ip, 'proxy', RATE_LIMITS.proxy)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin, env);
      const target = new URL('https://ssd-api.jpl.nasa.gov/cad.api');
      const params = pickSearchParams(url.searchParams, ['date-min', 'date-max', 'dist-max', 'sort', 'des', 'body', 'limit', 'fullname'], {
        'date-min': v => limitString(v, 32),
        'date-max': v => limitString(v, 32),
        'dist-max': v => limitString(v, 32),
        sort: v => limitString(v, 32),
        des: v => limitString(v, 64),
        body: v => limitString(v, 32),
        limit: v => clampIntegerString(v, 1, 200, 50),
        fullname: v => limitString(v, 128),
      });
      target.search = params.toString();
      try {
        const { data, stale } = await cachedProxyFetch(target.toString(), 24 * 60 * 60 * 1000);
        return jsonResponse({ ...(typeof data === 'object' ? data : { raw: data }), stale }, 200, origin, env);
      } catch (_) {
        return jsonResponse({ error: 'CAD upstream unavailable' }, 502, origin, env);
      }
    }

    // ── Route guard ──────────────────────────────────────────────────────────
    if (url.pathname !== '/api/research' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404, origin, env);
    }

    const originError = rejectIfOriginDisallowed(origin, env, { requireOrigin: true });
    if (originError) return originError;

    // ── Rate limiting ────────────────────────────────────────────────────────
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    if (!checkRateLimit(ip, 'research', RATE_LIMITS.research)) {
      return jsonResponse(
        { error: 'Rate limit exceeded. Max 10 requests per minute per IP.' },
        429,
        origin,
        env,
      );
    }

    // ── Parse request body ───────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, origin, env);
    }

    const parsedPayload = sanitizeResearchPayload(body);
    if (!parsedPayload.ok) return jsonResponse({ error: parsedPayload.error }, 400, origin, env);
    const promptPayload = parsedPayload.value;

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ error: 'Research service unavailable' }, 503, origin, env);
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
          messages: [{ role: 'user', content: buildPrompt(promptPayload) }],
        }),
      });
    } catch (_) {
      return jsonResponse(
        { error: 'Research upstream unavailable' },
        502,
        origin,
        env,
      );
    }

    if (!openAIRes.ok) {
      return jsonResponse(
        { error: 'Research upstream error', status: openAIRes.status },
        502,
        origin,
        env,
      );
    }

    const data = await openAIRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    return jsonResponse(
      { content, model: data.model, usage: data.usage },
      200,
      origin,
      env,
    );
  },
};
