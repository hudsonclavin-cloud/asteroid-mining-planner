# aster-proxy — Cloudflare Worker

Cloudflare Worker for Aster's browser-facing API routes.

Current routes:

- `POST /api/research`
- `GET /api/prices`
- `GET /api/asterank`
- `GET /api/nhats`
- `GET /api/horizons`
- `GET /api/cad`

## Security Model

- `OPENAI_API_KEY` stays in Cloudflare secrets.
- `POST /api/research` requires an allowed browser `Origin`.
- Allowed origins default to:
  - `https://hudsonclavin-cloud.github.io`
  - any local dev origin on `http://localhost:<port>` or `http://127.0.0.1:<port>`
- Additional origins can be added with the `ALLOWED_ORIGINS` environment variable as a comma-separated list.
- Research requests are rate-limited to `10/min/IP`.
- Proxy GET routes are rate-limited to `60/min/IP`.
- Upstream error bodies are not returned to clients.

## Deploy

```bash
cd worker
wrangler secret put OPENAI_API_KEY
wrangler deploy
```

Optional:

```bash
# comma-separated exact origins
wrangler secret put ALLOWED_ORIGINS

# optional live metals source for /api/prices
wrangler secret put METALS_API_KEY
```

The worker runs from [wrangler.toml](/Users/hudsonclavin/asteroid-mining-planner/worker/wrangler.toml).

## Local Dev

```bash
cd worker
wrangler dev
```

Create `worker/.dev.vars`:

```env
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=http://staging.example.com,https://preview.example.com
METALS_API_KEY=optional-live-pricing-key
```

The repo should ignore `worker/.dev.vars`.

## Research API

### `POST /api/research`

Request body:

```json
{
  "asteroidName": "433 Eros",
  "designation": "433",
  "spectralType": "S",
  "orbit": { "a": 1.458, "e": 0.223, "i": 10.83 },
  "deltaV_kms": 6.11
}
```

Accepted optional planner context fields:

- `deltaV_kms`
- `miningScore`

At least one of these is required:

- `asteroidName`
- `designation`

Success response:

```json
{
  "content": "## Research briefing ...",
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 500
  }
}
```

Common errors:

- `400` invalid JSON or missing asteroid identity
- `403` missing/disallowed origin
- `429` rate limit exceeded
- `502` upstream unavailable/error
- `503` `OPENAI_API_KEY` missing

## Proxy Routes

The GET proxy routes only forward a small allowlisted set of query params. That is intentional. Do not widen those pass-throughs casually.

## Zero-Build Smoke Checks

From the repo root:

```bash
node --test tests/*.test.mjs
```

Current checks cover:

- texture asset references in `index.html`
- route/env-var drift between `worker/index.js` and this README
- local secret / Wrangler hygiene in `.gitignore`
