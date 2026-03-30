# aster-proxy — Cloudflare Worker

Proxies `POST /api/research` requests from the Aster frontend
(`hudsonclavin.github.io`) to the Perplexity AI API.

The Perplexity API key is stored as a Cloudflare encrypted secret — it never
appears in source code or git history.

---

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+

---

## Deploy

```bash
# 1. Install Wrangler (Cloudflare's CLI)
npm install -g wrangler

# 2. Login to your Cloudflare account
wrangler login

# 3. Set the API key secret (you'll be prompted to paste it)
#    This is stored encrypted in Cloudflare — never committed to git.
wrangler secret put PERPLEXITY_API_KEY

# 4. Deploy from the worker/ directory
cd worker/
wrangler deploy
```

The worker will be live at:
```
https://aster-proxy.<your-cloudflare-subdomain>.workers.dev
```

---

## Local development

```bash
cd worker/
wrangler dev
```

Wrangler will prompt you to use a local `.dev.vars` file for secrets during dev.
Create `worker/.dev.vars` (gitignored):
```
PERPLEXITY_API_KEY=pplx-your-key-here
```

Then POST to `http://localhost:8787/api/research`.

> **Note:** CORS is locked to `https://hudsonclavin.github.io`. For local
> browser testing, temporarily add `http://localhost:8080` to `ALLOWED_ORIGIN`
> in `index.js` — don't commit that change.

---

## API reference

### `POST /api/research`

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| `asteroidName` | string | one of these | Human-readable name (e.g. `"433 Eros"`) |
| `designation` | string | one of these | Official designation (e.g. `"433"`) |
| `spectralType` | string | no | SMASS spectral class (`"S"`, `"C"`, etc.) |
| `orbit` | object | no | `{ a, e, i }` — SMA (AU), eccentricity, inclination (°) |
| `miningScore` | number | no | Aster composite mining score 0–100 |

**Example:**
```json
{
  "asteroidName": "433 Eros",
  "designation": "433",
  "spectralType": "S",
  "orbit": { "a": 1.458, "e": 0.223, "i": 10.83 },
  "miningScore": 72
}
```

**Success response `200`:**
```json
{
  "content": "## 433 Eros Research Briefing\n...",
  "model": "sonar",
  "usage": { "prompt_tokens": 180, "completion_tokens": 620 }
}
```

**Error responses:**

| Status | Meaning |
|---|---|
| 400 | Missing or malformed request body |
| 404 | Wrong path or method |
| 429 | Rate limit exceeded (10 req/min per IP) |
| 502 | Perplexity API unreachable or returned an error |

---

## Notes

- **Rate limiting:** 10 requests/minute per IP, tracked in-process. Resets if
  Cloudflare recycles the worker isolate. Adequate for a hobby project; for
  strict enforcement use Cloudflare Rate Limiting or Durable Objects.
- **CORS:** restricted to `https://hudsonclavin.github.io`.
- **Model:** `sonar` (Perplexity's search-augmented model). Change in
  `index.js` if needed.
- **Cost:** Cloudflare Workers free tier allows 100,000 requests/day. Perplexity
  charges per token — budget accordingly.
