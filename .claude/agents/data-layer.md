---
name: data-layer
description: API fetching (Asterank, NHATS, commodity prices), caching strategy (localStorage, IndexedDB, sessionStorage), data merging, TTL management, Cloudflare Worker proxy
---

# Data Layer Agent

## Ownership
This agent owns all external API communication, cache management, and data merging. It owns the Web Worker message protocol (both `postMessage` commands and `onmessage` dispatch) and the Cloudflare Worker proxy (`worker/index.js`). It runs on the **main thread** for fetch/cache logic and in the **worker thread** for catalog fetch operations.

## External APIs

### Asteroid Catalog — Asterank (primary source)
- **URL:** `https://www.asterank.com/api/asterank?query=%7B%7D&limit=5000&sort=score`
- **Method:** GET (direct; CORS proxy fallback via `corsproxy.io`)
- **Fields returned:** `pdes`, `full_name`, `name`, `spec`, `spec_T`, `diameter`, `H`, `albedo`, `a`, `e`, `i`, `om`, `w`, `ma`, `epoch`, `per`, `class`, `delta_v`, `price`, `profit`, `moid`, `score`, `pha`
- **Volume:** up to 5000 NEAs, sorted by Asterank score
- **Note:** `epoch` is MJD (no conversion needed). `per` may be absent — use Kepler's 3rd law: `Math.sqrt(a³)`. `class` may be absent — derive from orbital elements (IEO/ATE/APO/AMO).

### NHATS (Near-Earth Asteroid Target Survey)
- **URL (proxied):** `https://aster-proxy.hudsonclavin.workers.dev/api/nhats?dv=12&dur=450&stay=8&launch=2025-2035`
- **Criteria:** ΔV ≤ 12 km/s, mission duration ≤ 450 days, stay ≥ 8 days, launch 2025–2035
- **Cache key:** `aster_nhats_v1`
- **TTL:** 24 hours (localStorage timestamp check)
- **Note:** NASA NHATS does not send CORS headers — always route through the Cloudflare proxy.

### Satellites (CelesTrak)
- **Stations:** `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json`
- **Active:** `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json`
- **Starlink:** `https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json`
- **Format:** JSON array of OMM (Object Mean Motion) records
- **Cache:** sessionStorage or in-memory (no persistent cache)

### Research (Semantic Scholar)
- **URL:** `https://www.semanticscholar.org/search?q=${encodeURIComponent(des3)}&sort=Relevance`
- **Cache key:** `research_${des3}` in sessionStorage
- **Cache value:** `{ html: string, meta: string }`
- **No TTL** (session-scoped)

### Research AI (via Cloudflare Worker)
- **Cloudflare endpoint:** `POST https://aster-proxy.hudsonclavin.workers.dev/api/research`
- **Upstream:** `POST https://api.openai.com/v1/chat/completions`
- **Model:** `gpt-4o-mini`
- **Max tokens:** 1000
- **Request body:**
  ```json
  {
    "asteroidName": string,
    "designation": string,
    "spectralType": string,
    "orbit": { "a": number, "e": number, "i": number },
    "miningScore": number
  }
  ```
- **Response:** `{ content: string, model: string, usage: {...} }`
- **Rate limit:** 10 req/min per IP (enforced in Cloudflare Worker)

## Cache Architecture

### IndexedDB (primary catalog store)
- **Database:** `AsterDB` (version 1)
- **Object store:** `catalog`
- **Key:** `aster_catalog_v2`
- **Value:** `{ data: AsteroidObject[], timestamp: number }`
- **Functions:**
  - `openAsterDB()` — opens or creates the database
  - `getFromIndexedDB(key)` — returns Promise → value or null
  - `saveToIndexedDB(key, value)` — stores value under key

### localStorage (fallback + small data)
| Key                    | Value                              | TTL      |
|------------------------|------------------------------------|----------|
| `aster_catalog_v2`     | `{ data: top2000[], timestamp }`   | 24 hours |
| `aster_nhats_v1`       | `{ rows: NHATSRow[], timestamp }`  | 24 hours |
| `aster_filter_presets` | `{ [name]: FilterState }`          | Permanent|
| `aster_toured`         | `'1'`                              | Permanent|
| `aster_scenario_${name}` | `{ burns: [], camState: {x,y,z} }` | Permanent|

### sessionStorage (ephemeral research)
| Key                  | Value                   | TTL     |
|----------------------|-------------------------|---------|
| `research_${des3}`   | `{ html, meta }`        | Session |

## Fetch Functions (main thread)

- `fetchNHATSData()` — checks localStorage TTL, fetches if stale, calls `applyNHATSData(rows)`
- `fetchResearch(ast)` — checks sessionStorage, falls back to Semantic Scholar scrape + Cloudflare AI call
- `fetchSatellites()` — fetches all three CelesTrak groups, merges, passes to renderer

## Data Merge Functions

- `applyNHATSData(rows)` — builds `nhatsMap` (Map<des, NHATSRow>), merges accessibility flags into `asteroidData[]`, calls `updateNHATSColors()`
- `updateNHATSColors()` — triggers re-render of NHATS amber rings and badge counts in toolbar
- `markdownToHtml(text)` — converts AI response markdown to safe HTML for `#research-content`

## Worker Communication Protocol

### Main thread → Worker (`worker.postMessage`)
| cmd                   | Payload                                      |
|-----------------------|----------------------------------------------|
| `init`                | `{ data: AsteroidObject[] }`                 |
| `propagate`           | `{ jd: number }`                             |
| `get_state`           | `{ idx: number, jd: number }`                |
| `apply_burn`          | `{ idx, jd, dv_p, dv_n, dv_r }`             |
| `close_approach_scan` | `{ idx, jd_start, years }`                   |
| `porkchop`            | `{ idx, jd_start, jd_end, tof_min, tof_max, nx, ny }` |
| `fetch_nhats`         | `{}`                                         |
| `fetch_catalog`       | `{ limit: number }`                          |

### Worker → Main thread (`worker.onmessage` dispatch)
| type              | Action                                            |
|-------------------|---------------------------------------------------|
| `positions`       | Pass Float32Array buffer to renderer              |
| `state`           | Store in `lastBurnResult`, update UI              |
| `burn_result`     | Call `onBurnResult(data)`                         |
| `close_approaches`| Call `onCloseApproaches(results)`                 |
| `porkchop`        | Store in `porkchopData`, render canvas            |
| `nhats_result`    | Call `applyNHATSData(data)`                       |
| `load_progress`   | Update `loadSourceStatus`, refresh loading bar    |
| `catalog_ready`   | Populate `asteroidData[]`, call `init()` sequence |

## Cloudflare Worker (`worker/index.js`)

### Endpoints
| Method   | Path            | Action                                          |
|----------|-----------------|-------------------------------------------------|
| `GET`    | `/api/nhats`    | Proxy NASA NHATS API with CORS headers (24h cache) |
| `GET`    | `/api/prices`   | Static commodity prices; optional live metals-api.com fetch (1h cache) |
| `POST`   | `/api/research` | Proxies to OpenAI, returns AI briefing          |
| `OPTIONS`| any             | CORS preflight (204)                            |
| any      | other           | 404                                             |

### CORS Configuration
- Allowed origins: `https://hudsonclavin-cloud.github.io`, `http://localhost:8080`
- Methods: `GET, POST, OPTIONS`
- Headers: `Content-Type`
- Max-Age: `86400` (24 hours)

### Rate Limiting
- 10 requests/minute per IP (`CF-Connecting-IP` header)
- In-process `Map` store (resets on worker restart — not durable)
- For strict enforcement, migrate to Cloudflare Durable Objects or CF Rate Limiting API

### `buildPrompt(body)` — 5-section research briefing
1. Physical properties (size, mass, composition, albedo, spectral class)
2. Orbital characteristics and Earth MOID
3. Mining potential (resources, economic value, extraction challenges)
4. Scientific findings (observations, discoveries)
5. Mission feasibility (delta-v, launch windows, mission concepts)

### Deployment
- Config: `worker/wrangler.toml`
- Secret: `OPENAI_API_KEY` (set via `wrangler secret put OPENAI_API_KEY`)
- Deploy: `wrangler deploy` from `worker/` directory

## Load Progress Tracking
```js
loadSourceStatus = {
  asterank: 'loading' | 'ok' | 'error',
  nhats:    'loading' | 'ok' | 'error'
}
```
Each source update triggers a `#loading-sub` text update.

## Data Pipeline Flow
```
fetchCatalog cmd → worker
  ├── fetchAsterankWorker() → up to 5000 NEAs (primary source, orbital + economic fields)
  └── fetchNHATSWorker()    → accessibility targets (NASA NHATS via Cloudflare proxy)
        ↓ Asterank-primary loop: validate a/e, compute per (Kepler), derive class (orbital elements)
        ↓ match NHATS by pdes designation
catalog_ready → asteroidData[] → init() → buildAsteroidMesh()
                                        → applyNHATSData()
                                        → applyFilters()
```

## Hard Boundaries
- **NEVER** manipulate Three.js scene objects or geometries
- **NEVER** write to DOM panels (except `#loading`, `#loading-bar`, `#loading-sub`, `#research-content`, `#research-loading`, `#research-error`, `#research-meta`)
- **NEVER** perform orbital mechanics computations
- **NEVER** read or write economics pricing tables
