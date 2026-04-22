# Aster Physics Approximations — DEVLOG

## Phase 6 — Docs / Hygiene / Zero-Build Smoke Checks (2026-04-21)

This pass intentionally avoided renderer and worker code changes. The goal was to put
lightweight guardrails around the current Phase 6 surface using plain Node only.

### Added checks
- `tests/phase6-contract-smoke.test.mjs`
  - verifies every `./textures/...` asset referenced by `index.html` exists on disk
  - verifies `worker/README.md` route docs still match the routes implemented in `worker/index.js`
  - verifies every environment variable used by `worker/index.js` is documented
  - verifies the README's local-dev allowed origins include the currently supported ports
  - verifies `.gitignore` covers local Worker secrets and Wrangler state

### Why this matters
- Texture regressions were previously easy to miss until browser runtime because missing
  assets only surfaced as 404s.
- Worker docs had already started drifting from implementation details like supported
  local origins and optional env vars.
- Secret/Wrangler hygiene needed a repo-level check instead of a tribal-memory rule.

### Run
```bash
node --test tests/*.test.mjs
```

## Phase 12 — Moon, Hover Orbit Ellipse, Propagation Throttle

### What was already done (no changes needed)
Full Keplerian propagation was implemented in Phase 2: `kep2cart` (3D Euler rotations),
`propagateAsteroid` (MJD→JD conversion), `propagatePlanet` (Standish 1992 secular elements),
`solveKepler` (Newton-Raphson, 1e-12 tolerance), Float32Array buffer transfer, time-scrubber
→ worker → `applyPositions` pipeline, and `drawOrbitEllipse` (256-point Kepler sampling).

### Moon
**Method:** Simplified circular orbit. Computed in main thread from Earth's propagated
heliocentric position. No worker changes needed.

**Parameters:**
- SMA: 0.00257 AU (384,400 km)
- Period: 27.321582 days (sidereal)
- Mean longitude at J2000: 218.316°
- Ecliptic inclination: 5.145°

**Known approximation:** Ignores lunar eccentricity (0.0549) and the 18.6-year nodal
precession. Position accurate to ~1-2° for visual purposes.

### Hover Orbit Ellipse
Separate `hoverOrbitLine` / `hoverOrbitPts` geometry (dim gray, opacity 0.35) drawn via
`drawHoverOrbit()` when `hoveredId` changes. Hidden when an asteroid is clicked/selected
(replaced by the brighter cyan selection orbit).

### Propagation Throttle
Added `lastPropJD` guard in animate loop: `worker.postMessage` only fires when
`currentJD !== lastPropJD`. Eliminates redundant worker messages at 60fps when simulation
is paused. Scrubber `input` handler sets `lastPropJD = currentJD` to prevent the immediate
next animate frame from re-sending.

---

## Phase 11 — Real NEO Catalog (SBDB + Asterank + NHATS)

### Architecture

Three-source parallel data pipeline, all fetched in `physics.worker.js` via the new `fetch_catalog` command.

**Sources:**
- **JPL SBDB Query API** — primary/authoritative. All NEAs (IEO, ATE, APO, AMO classes) with H ≤ 22 (~3500 objects). Provides orbital elements (a, e, i, Ω, ω, M, epoch), physical properties (diameter, albedo), and spectral types (spec_B = SMASS, spec_T = Tholen).
- **Asterank API** — economic data. Up to 5000 asteroids sorted by mining score. Provides `price` (estimated value USD), `profit`, `delta_v`, `moid`, `pha`.
- **NHATS API** — accessibility data. Human-spaceflight-reachable targets (ΔV ≤ 12 km/s, duration ≤ 450 days). Provides `min_dv`, `min_dur`, `n_via_points`, `occ`.

**Merge:** SBDB is the primary record. Asterank and NHATS rows are cross-referenced by `pdes` (designation). Asteroids not in Asterank get estimated value from spectral type + diameter composition model (M-type: 100$/kg, S-type: 10$/kg, C-type: 50$/kg water).

### Epoch format
Both SBDB and Asterank return `epoch` as Julian Date (JD, e.g., 2458600.5 ≈ April 2019). All code uses `ast.epoch` directly as JD — no conversion needed. The default fallback epoch is 2451545.0 (J2000.0 in JD).

### LOD — Dust Cloud
If merged catalog > 3000 asteroids, the first 3000 (sorted by value) form the interactive `InstancedMesh` propagated by the worker. Overflow asteroids get a static `THREE.Points` dust cloud with positions computed once at load time via `keplerPosAU()` (inline Kepler solver, no worker).

### Caching
- IndexedDB (`AsterDB`, store `catalog`, key `aster_catalog_v1`) — stores full merged array, 24hr TTL.
- localStorage fallback — top 2000 asteroids if IndexedDB unavailable.
- NHATS rows also cached in `aster_nhats_v1` (localStorage) alongside catalog.
- On cache hit, `fetch_catalog` is skipped entirely; NHATS refreshes independently in background.

### Loading overlay
`#loading-sub` text updates as each source responds via `load_progress` worker messages.
Format: `SBDB ✓ 3412  ·  ASTERANK ✓ 4983  ·  NHATS ✓ 2165`

---

## Phase 2 — Burn Simulator

### 1. MOID Approximation
**Method:** Sample each orbit at 120 evenly-spaced mean anomaly positions (independent of time). Find minimum pairwise distance across all 120×120 = 14,400 pairs.

**Known error:** ±0.01 AU for typical NEAs with low-to-moderate eccentricity. The real MOID requires solving a 16th-degree polynomial system (Gronchi 2005). Sampled MOID is systematically overestimated (never underestimated) since it cannot find the true closest point between samples.

**Impact:** Acceptable for mission planning display. Do not use for hazard assessment.

---

### 2. Lambert Solver — Short-Arc Only
**Method:** Bate-Mueller-White universal variable method (1971). Newton-Raphson iteration on the universal variable `z` with finite-difference `dt/dz`.

**Known limitation:** The solver uses the transfer direction determined by the z-component of `r1 × r2`. For transfers near 180° (cos(Δν) ≈ −1) the geometry is near-singular and returns `null`. Long-arc retrograde solutions are not attempted.

**Impact:** Porkchop plots may have thin bands of missing data near 180° transfer angles. These are flagged as 20 km/s (maximum colormap value).

---

### 3. Porkchop Plot — No Perturbations
**Method:** Keplerian-only position propagation for both asteroid and Earth. Grid resolution: 50×40 (departure × TOF).

**Known error:** JPL Horizons uses a full N-body integration with J2, lunar, radiation pressure perturbations. Keplerian propagation accumulates ~0.1° error per year for inner planets, ~0.5° for outer asteroids. Over 5-year departure windows, launch date errors of ±3–5 days are expected.

**Impact:** Use porkchop for mission planning orientation, not for trajectory design. Verify optimal windows with JPL Horizons.

---

### 4. Impulsive Burn Approximation
**Method:** ΔV applied instantaneously at the current position. New orbit computed via `cart2kep` from the post-burn state vector.

**Known error:** Real thrusters burn for minutes to hours (finite burn losses ≈ 2–5% of ΔV for typical burns). Impulsive model overestimates efficiency.

**Impact:** Small for high-Isp engines. Add ~3% margin to ΔV budget for detailed mission design.

---

### 5. Fuel Mass Model
**Method:** Single-stage Tsiolkovsky rocket equation: `m_prop = m_dry × (exp(ΔV/(g0×Isp)) - 1)`, Isp = 450 s, m_dry = 1000 kg.

**Known limitation:** Actual spacecraft sizing requires iterative mass budget (structure, power, payload, margins). 1000 kg dry mass and 450 s Isp are rough estimates for a xenon-propelled spacecraft.

**Impact:** Order-of-magnitude fuel mass estimate only.

---

### 6. cart2kep Edge Cases
- Near-circular orbits (e < 1e-10): argument of periapsis undefined, set to 0.
- Near-equatorial orbits (inclination ≈ 0): RAAN undefined, set to 0.
- Both handled with clamped `acos` inputs to prevent NaN from floating-point error.

---

*Last updated: Phase 3 implementation, 2026-03-27*

---

## Phase 3 — Mining Intelligence Layer

### Composite Score Formula
- `profit_score = log10(max(1, profit_USD)) / 12` — divisor 12 because log10($1T) ≈ 12
- `access_score = 1 - min(12, ΔV_kms)/12` — hard cap at 12 km/s (mission infeasible beyond that)
- `size_score = min(1, log10(max(1, diameter_m))/6)` — ~0.5 for 1 km, ~0.83 for 10 km
- Weights 0.4/0.4/0.2: equal emphasis on economic return and mission feasibility; size secondary
- Score is independent of current filter state; computed once in `buildAsteroidMesh`

### Score Color Mapping
- 0–33: `#7f1d1d` (dim red — low value/accessibility)
- 34–66: `#92400e` (amber — moderate)
- 67–85: `#4af7c4` (cyan — good target)
- 86–100: `#fef3c7` (white-gold — elite target)

### Resource Value Model
- Water price: $1,000/kg in-space ($1M/ton) — estimated in-situ propellant market value (Keck Institute 2012). **CAVEAT:** this market does not yet exist; treat as upper bound.
- Iron/nickel: $0.15/kg (Earth spot price, no extraction margin)
- M-type metals: $30/kg (rough blended PGM estimate; actual composition unknown)
- Densities: C=1400, S=2700, M=5300, D=1200 kg/m³ (Carry 2012 mean values)
- Uses H-derived diameter (albedo=0.15 assumed); if `ast.diameter` available, prefer that

### Mission Cost Model (Economics Tab)
- Launch cost: spacecraft_mass × $2,700/kg (Falcon 9 commercial rate, 2024)
- Total cost multiplier: 1.8× (accounts for operations, insurance, development amortization)
- ΔV uses single-stage Tsiolkovsky with user-configurable Isp (default 450 s) and dry mass (default 1000 kg)
- **Known limitation:** real missions range 1.5–5× launch cost overhead; this is planning-level only

### NHATS Approximation
- Primary: `delta_v ≤ 12 km/s` — coarse approximation pending API load
- Secondary: real NHATS API fetch (`ssd-api.jpl.nasa.gov/nhats.api`) attempted on init; merged on success, silently skipped on CORS failure
- Designation matching: exact `pdes` string match; ~5–10% expected mismatches due to format differences

---

## Phase 2 Bug Fixes (QA Session — 2026-03-29)

- **Asteroid click:** replaced 3D raycaster with 12px screen-space proximity search — `findClosestAsteroidToClick()` iterates all visible instances, projects to screen, finds closest within threshold
- **Gizmo drag:** `wasDragging` flag set in `onPointerMove`, checked + cleared at top of click handler — prevents the pointer-up → click sequence from deselecting the asteroid
- **Porkchop:** offscreen canvas at native 50×40 resolution, scaled via `ctx.drawImage()` to full 308×180 with `imageSmoothingEnabled = false`; marker position scaled proportionally
- **ΔV field:** `getAsteroidDV(ast)` tries `delta_v/dv/min_dv` fields then falls back to Shoemaker-Helin perihelion approximation (perihelion velocity delta + half-weighted inclination penalty, converted AU/yr → km/s, clamped [3, 12]); displayed with `(est)` suffix when fallback used
- **Scenario save:** validation reordered — name check before selection check, both show `setStatus()` feedback; success shows `✓ Scenario "name" saved`

---

## Phase 4 — Earth Layer (2026-03-29)

### Satellite Propagator Approximation
**Method:** Mean-motion propagator using OMM fields (MEAN_MOTION, ECCENTRICITY, INCLINATION, RA_OF_ASC_NODE, ARG_OF_PERICENTER, MEAN_ANOMALY, EPOCH). Semi-major axis from `a = (GM_earth/n²)^(1/3)`. Newton-Raphson eccentric anomaly (8 iterations). Standard 3-1-3 ECI rotation.

**Known limitation:** This is NOT full SGP4. Omits J2 zonal harmonic, atmospheric drag, solar radiation pressure, lunar/solar gravity. Errors grow roughly:
- LEO: ~1–5 km/day from J2; ~10 km/day with drag at 200 km altitude
- MEO/GPS: ~0.1 km/day (drag negligible, J2 minor)
- GEO: ~1 km/week (station-keeping not modeled)

**Impact:** Visually plausible for display; do not use for conjunction analysis or maneuver planning.

### Zoom Trigger Threshold
- Earth layer activates when camera is within 0.15 AU of `planets[2]` (Earth)
- 0.15 AU ≈ 22.4 million km — inside Venus closest approach distance
- Satellite positions updated every 3rd frame; ISS orbit redrawn every 30 frames

### Satellite Cache
- CelesTrak OMM JSON cached in localStorage (6-hour TTL, key `aster_satellites_v1`)
- Groups: stations, active, starlink — deduplicated by NORAD_CAT_ID
- Instance cap: 8,000 satellites (InstancedMesh limit for 60fps performance)

---

## Phase 5 — Polish, Export & Sharing (2026-03-29)

### Orbital Trail Rendering
- Past trail: 90 samples at 1-day intervals behind `currentJD`, `LineBasicMaterial` cyan (#4af7c4), opacity 0.55
- Future projection: 90 samples forward, `LineDashedMaterial` blue (#60a5fa), opacity 0.35; `computeLineDistances()` required for dashes to render
- Trails update when `|currentJD - lastTrailJD| > 1` to avoid per-frame recompute; cleared on asteroid deselect
- Mobile: trail steps reduced to 45, trails default off

### CSS Label Pool
- 20 pre-created `<div>` elements projected each frame via `vec.project(camera)`
- Labels rendered: 8 planet names + selected asteroid name (cyan) + top 5 leaderboard targets (amber)
- Culled if off-screen or behind camera (z > 1 or z < -1)

### Shareable URL
- State encoded: `{ des, jd, cam: {x,y,z}, burns: [{p,r,n}] }`
- Encoding: `btoa(JSON.stringify(state))` → `window.location.hash`
- Load: retry loop at 100ms intervals, max 30 attempts, waits for asteroid data to arrive

### Mobile Degradation
- Detection: `window.innerWidth < 768 || navigator.maxTouchPoints > 1`
- Asteroid limit: 500 (vs 2000), satellite limit: 2000 (vs 8000), trails disabled by default
- Dynamic limits via `window.ASTEROID_LIMIT` and `window.SAT_LIMIT` checked at fetch time

### Onboarding Tour
- 5-step positioned tooltip overlay, localStorage gated (`aster_toured` key)
- Skip + Next/Done buttons; tour restarts if localStorage cleared

*Last updated: Phase 5 complete, 2026-03-29*

---

## Phase 6 — NHATS Real Data Overlay (2026-03-30)

### Architecture

The NHATS fetch is delegated to the physics Web Worker via `cmd: 'fetch_nhats'`. The worker issues a `fetch()` call to the JPL NHATS API and posts back raw JSON rows. The main thread owns all localStorage operations (workers have no localStorage access).

**Call sequence:**
1. `init()` calls `fetchNHATSData()` after `buildAsteroidMesh()` returns
2. `fetchNHATSData()` checks `aster_nhats_v1` in localStorage (24-hour TTL)
3. Cache hit → `applyNHATSData(cached.data)` directly
4. Cache miss → `worker.postMessage({ cmd: 'fetch_nhats', url: NHATS_URL })`
5. Worker fetches, posts `{ type: 'nhats_result', ok, data }`
6. Main thread caches response, calls `applyNHATSData(data.data)`

### NHATS API
- **URL:** `https://ssd-api.jpl.nasa.gov/nhats.api?dv=12&dur=450&stay=8&launch=2025-2035`
- **Parameters:** max ΔV = 12 km/s, max duration = 450 days, min stay = 8 days, launch window 2025–2035
- **Response fields used:** `des`, `min_dv`, `min_dur`, `n_via_points`, `min_stay`, `occ`
- **Cache TTL:** 24 hours (matches satellite cache pattern)

### Designation Matching
- Key: `ast.pdes.trim()` matched against `row.des.trim()`
- Expected match rate: ~5–20% of loaded synthetic asteroids (NHATS catalog ≈ 100–200 targets)
- Non-matching asteroids retain their `_nhats` boolean approximation from Phase 3 (dv ≤ 12 km/s)

### Visual Indicators
- **Color:** NHATS-verified asteroids recolored amber `#fbbf24` via `asteroidMesh.setColorAt()` — overrides score-based color
- **Pulsing ring:** `THREE.RingGeometry` billboard on selected NHATS asteroid, opacity pulsed via `Math.sin(Date.now() * 0.002) * 0.3 + 0.5`

### Info Panel
- `#nhats-badge` div shown/hidden in `selectAsteroid()`; displays minDv, minDur, nTrajectories, OCC
- Export report: `NHATS Status: VERIFIED (JPL)` | `ESTIMATED` | `NO`

### Failure Handling
- Worker fetch error → `setStatus('NHATS: offline', false)` — persistent, no autoFade
- App continues with score-based `_nhats` approximation from Phase 3

*Last updated: Phase 6 NHATS overlay complete, 2026-03-30*

---

## Phase 7 — Advanced Multi-Parameter Filter Panel (2026-03-30)

### Filter State Changes
- Replaced `filterDV` single cap (12 km/s) with `filterDvMin`/`filterDvMax` dual range (0–15 km/s)
- Added `filterValMin`/`filterValMax` log-scale value filter (slider pos 0–100 → $0–$100T)
- Added `filterWindowStart`/`filterWindowEnd` mission window (2025–2045, gates NHATS targets only)
- Existing `filterScore`, `filterSpec`, `filterNHATS`, `filterPHA`, `filterWater` retained

### Dim-instead-of-Hide
- Changed non-matching asteroid appearance from scale 0.0001 (invisible) to `setColorAt(i, 0x0d0d12)` (10% dim)
- All asteroids remain in the InstancedMesh at scale 1.0; `instanceColor.needsUpdate = true` on each filter call
- Performance: same O(N) loop, ~same wall time as before

### Dual-Range Slider
- Two overlapping `<input type="range">` elements with transparent backgrounds
- Track fill div (`#dv-fill`, `#val-fill`) positioned via `left`/`width` percentage CSS
- Crossover prevented: min handler clamps value ≤ max; max handler clamps value ≥ min

### Log-Scale Value Slider
- `sliderPosToValue(pos)`: `Math.pow(10, pos/100 * log10(1e14))` — pos 50 ≈ $1B, pos 75 ≈ $10T
- `fmtSliderVal(pos)` calls existing `fmtUSD()` for consistent display

### Presets
- 4 built-in presets: Easy Reach, Platinum Hunt, Near-Term, Deep Space
- User presets: `localStorage.setItem('aster_filter_presets', JSON.stringify({key: {...}}))`
- Preset select `<optgroup>` separates built-in from saved; `populateSavedPresets()` rebuilds on save

### Sort
- Replaced 4 `.sort-btn` buttons with `<select id="lb-sort-select">`
- Added 'duration' sort: `ast.nhats?.minDur ?? 9999` ascending (NHATS asteroids first)

### Export Filtered Catalog
- `exportFilteredCatalog()` exports up to 500 filtered asteroids as CSV
- Columns: designation, spec_type, score, delta_v_kms, value_usd, profit_usd, diameter_km, inclination_deg, nhats_*, occ

*Last updated: Phase 7 advanced filters complete, 2026-03-30*

---

## Phase 8 — Cloudflare Worker: Perplexity AI Research Proxy (2026-03-30)

### Architecture

A Cloudflare Worker (`worker/index.js`) proxies `POST /api/research` from the GitHub Pages frontend to the Perplexity API. The `PERPLEXITY_API_KEY` is stored as a Cloudflare encrypted secret — it never appears in source code or git history.

**Request flow:**
1. Browser POSTs `{ asteroidName, designation, spectralType, orbit, miningScore }` to the worker URL
2. Worker validates the request, checks rate limit, parses body
3. Worker calls `buildPrompt()` to construct a structured 5-section research briefing prompt
4. Worker POSTs to `https://api.perplexity.ai/chat/completions` with `Authorization: Bearer ${env.PERPLEXITY_API_KEY}`
5. Worker extracts `choices[0].message.content` and returns `{ content, model, usage }` to the browser

### Rate Limiting
- **Method:** In-process `Map<ip, {count, resetAt}>` at module scope (10 req/min per IP)
- **Known limitation:** Resets on V8 isolate restart or when Cloudflare spins up a new isolate; not strictly enforced across all worker instances
- **Impact:** Best-effort for a hobby project. For strict enforcement, use Cloudflare Rate Limiting API or Durable Objects.

### CORS
- Restricted to `https://hudsonclavin.github.io`
- Preflight (OPTIONS) returns 204 with `Access-Control-Allow-Origin/Methods/Headers`
- Non-allowed origins receive the hardcoded `ALLOWED_ORIGIN` value (browser will block the response)

### Prompt Construction (`buildPrompt`)
Generates a structured prompt covering 5 areas:
1. Physical properties — size, mass, composition, albedo, rotation period; spectral class
2. Orbital characteristics — SMA, eccentricity, inclination, MOID
3. Mining potential — resources, estimated value, extraction challenges
4. Scientific findings — observations, missions, discoveries
5. Mission feasibility — ΔV, launch windows, mission concepts

All fields are optional — prompt degrades gracefully with "unknown" / "orbital elements not provided" fallbacks. Response capped at 800 words.

### Model
- `sonar` (Perplexity's search-augmented model, real-time web search included)
- `max_tokens: 1000`

### Files Created
- `worker/index.js` — Cloudflare Worker source
- `worker/wrangler.toml` — Wrangler config (`name=aster-proxy`, `compatibility_date=2024-11-01`)
- `worker/README.md` — Full deployment guide with API reference, error codes, local dev instructions

### Deploy
```bash
wrangler secret put PERPLEXITY_API_KEY
cd worker/ && wrangler deploy
```

*Last updated: Phase 8 complete, 2026-03-30*

---

## Phase 9 — Frontend Research Tab (Perplexity Integration) (2026-03-31)

### Architecture

The right panel gains a third tab — **⬡ RESEARCH** — that POSTs to the Cloudflare Worker (`WORKER_URL`) when clicked with an asteroid selected. The tab is lazy: it never auto-fetches on asteroid selection (avoids burning API quota on every click); it only fetches when the user explicitly opens the tab.

**Fetch trigger logic:**
- Tab click + `selectedId >= 0` → `fetchResearch(ast)`
- Tab already active when a new asteroid is selected → `fetchResearch(ast)` (auto-refreshes)

### Cache
- `sessionStorage` keyed by `research_<pdes>` (falls back to `full_name`)
- Stores `{ html, meta }` — the rendered HTML string + token usage line
- Scope: session only (cleared on tab close); no TTL needed since asteroid data doesn't change mid-session

### Markdown Rendering (`markdownToHtml`)
Lightweight inline renderer — no library:
- `## / ###` headings → `<h2>/<h3>` (styled cyan, 10px)
- `**bold**` → `<strong>` (color `#e5e7eb`)
- `* item` / `- item` lines → `<li>` wrapped in `<ul>`
- Double newlines → `</p><p>`
- Bare text lines → wrapped in `<p>`

### `WORKER_URL` Constant
Added near top of `<script>` alongside Asterank/CORS constants:
```javascript
const WORKER_URL = 'https://aster-proxy.YOUR_SUBDOMAIN.workers.dev';
```
Developer replaces `YOUR_SUBDOMAIN` after `wrangler deploy`. No secrets in client code.

### UI States (5 divs inside `#tab-research`)
| Div | Shown when |
|---|---|
| `#research-prompt-hint` | No fetch triggered yet (initial state after asteroid select) |
| `#research-loading` | Fetch in-flight |
| `#research-error` | Fetch failed or non-OK status |
| `#research-content` | Success — HTML injected via `.innerHTML` |
| `#research-meta` | Success — token usage line below content |

### Reset on Asteroid Change
`selectAsteroid()` resets all 5 divs to initial state (hint visible, all others hidden) so stale content from the previous asteroid never flashes.

*Last updated: Phase 9 complete, 2026-03-31*

---

## Phase 8 Amendment — Swap to OpenAI (2026-03-31)

Replaced Perplexity `sonar` with OpenAI `gpt-4o-mini` in `worker/index.js`.

| | Before | After |
|---|---|---|
| API URL | `https://api.perplexity.ai/chat/completions` | `https://api.openai.com/v1/chat/completions` |
| Model | `sonar` | `gpt-4o-mini` |
| Secret | `PERPLEXITY_API_KEY` | `OPENAI_API_KEY` |

Response shape (`choices[0].message.content`) is identical — no frontend changes required.
To redeploy: `wrangler secret put OPENAI_API_KEY` then `wrangler deploy`.

---

## Phase 10 — NASA Mission-Control UI + NHATS Fix (2026-03-31)

### Summary
Three concurrent workstreams: NHATS reliability fix, Research panel verification, and full UI overhaul.

### NHATS Fix (`physics.worker.js`)
- Removed `mode: 'cors'` from worker fetch (was blocking JPL cross-origin requests)
- Added two-URL fallback: primary with `launch=2025-2035`, secondary without
- Handle both `json.data` and `json.nhats` response shapes
- Added `console.log` breadcrumbs at every stage: fetch start, HTTP status, row count, postMessage
- Frontend: added breadcrumbs to `fetchNHATSData()`, `applyNHATSData()`, and `nhats_result` handler
- On failure: updates `#hud-nhats` to `NHATS: OFFLINE` and auto-retries after 30s
- On success: updates `#hud-nhats` to `NHATS: N TARGETS`

### UI Overhaul (`index.html`)

#### Font + Color System
- Font: Space Mono replacing JetBrains Mono
- Background: `#0a0e1a` (deep space navy)
- Accent: `#00d4ff` (cyan) replacing `#4af7c4` (green)
- Body text: `#c8d6e5`, borders: `#1a2235`

#### Top Toolbar (48px)
- `◈ ASTER` logo + center action buttons (FILTERS, EXPORT, SHARE, HELP)
- Right HUD readouts: date, asteroid count, selected target, filter status, NHATS count, FPS
- All buttons wired; filter badge synced to toolbar via `updateFilterBadge()`
- `updateToolbarHUD()` called from `applyFilters()`, `selectAsteroid()`, `deselectAsteroid()`

#### Asteroid Rendering
- Colors by spectral type: C/B=blue `#4488ff`, S/Q/A=orange `#ff8844`, M/E/P=gold `#ffcc00`, X/V/T=purple `#cc66ff`, unknown=cyan `#00d4ff`
- Size by log-scaled resource value: min 0.6×, max 2.0× (`log10(price)/14`)
- Base geometry increased from 0.002 to 0.003 AU radius

#### Interactivity
- Hover detection: 18px proximity threshold, tooltip with name/type/score/value, pointer cursor
- Click ripple: CSS `@keyframes rippleOut` animation spawned at click coordinates
- Right panel: slide-in from off-screen right (`transition: right 0.3s ease`, `.panel-open`)
- Camera nudge: 8% lerp toward selected asteroid on select
- `deselectAsteroid()`: hides panel, clears orbit line/trail/ring
- Escape key: closes shortcut overlay → exits burn mode → deselects asteroid (priority chain)

#### Filter Panel
- Spectral chip colors per type match 3D asteroid colors
- Left panel + bottom bar restyled to match new palette
- Custom scrollbar styling

*Last updated: Phase 10 complete, 2026-03-31*

---

## Phase 7B — Keplerian Propagation Completion (2026-04-01)

### What Was Already Implemented
`solveKepler`, `kep2cart`, `propagateAsteroid`, the `'propagate'` worker command, `applyPositions`, and the time scrubber → JD → worker → positions pipeline were all functional from prior phases. No changes to `physics.worker.js`.

### Moon
- Added `moonMesh` (gray sphere, r=0.0015 AU, 8×8 segments) to the scene after planet creation
- `updateMoonPosition(jd)`: simplified circular orbit, `a=0.00257 AU`, `period=27.32 days`, epoch=J2000
- Moon position computed on the main thread (one object, cheap); called from `applyPositions()` after planet positions are set
- **Known limitation:** Orbit is circular and in the ecliptic plane. Real Moon inclination ≈5.1° to ecliptic and ~6.7° to equator; libration, nodal regression all ignored. Sufficient for gravity-assist visualization context.

### Orbital Ellipse Trail
- Replaced time-based 90-step past/future trail (`updateTrailGeometry` / `computeFutureTrail`) with a static 100-point orbital ellipse (`updateOrbitEllipse`)
- `buildOrbitPoints(ast, steps)`: samples true anomaly 0→2π evenly, converts to Cartesian via `orbitPlaneToEcliptic()` (3-1-3 rotation extracted from `kep2cartJS`)
- Ellipse is time-invariant — computed once on asteroid selection, not per frame
- `futureLine` hidden when ellipse mode active (dashed future arc no longer meaningful for full-orbit display)
- **Bug fixed:** old trail code did `p.x / AU_m` (dividing AU by 1.496e11 = essentially zero). New code operates in AU directly, matching the scene coordinate system.

### Hover Orbital Ellipse
- `showHoverEllipse(ast)` / `hideHoverEllipse()`: lazy-creates a single `hoverEllipseLine` (`THREE.Line`, cyan `#00d4ff`, opacity 0.25)
- Wired to `onPointerMove` hover detection: shows on hover if asteroid ≠ selected, hides on hover-out
- Does not show when hovering the already-selected asteroid (selection ellipse via `trailLine` is already visible)

### JD-Change Guard
- Introduced `lastSentJD = null`; `'propagate'` message only sent when `currentJD !== lastSentJD`
- Eliminates per-frame worker messages when simulation is paused (`simSpeed === 0`)
- Scrubber `input` event continues to post directly (unchanged) for responsive scrubbing

*Last updated: Phase 7B complete, 2026-04-01*

---

## Phase 7C — Materials Tab: Composition Model + Live Commodity Prices (2026-04-01)

### Overview

Added a fourth right-panel tab — **◆ MATERIALS** — between ECONOMICS and RESEARCH. The tab shows a per-element composition model for the selected asteroid, mass-based tonnage estimates, two SVG charts, a sortable breakdown table, an Earth/Space price toggle, and live commodity prices via the Cloudflare Worker.

### Composition Model

Four spectral group templates (`MAT_COMP`), each a mass-percentage map over 11 tracked materials:

| Group | Dominant materials | Notes |
|---|---|---|
| C (carbonaceous) | silicates 65%, water 10%, iron 15% | water-rich; low PGM |
| S (silicaceous) | silicates 68%, iron 22%, nickel 3% | driest; moderate metals |
| M (metallic) | iron 88%, nickel 7% | negligible water; highest PGM |
| X (unknown) | silicates 67%, iron 18%, water 5% | blended average |

Spectral type mapping: `B/P/D → C`, `Q/A → S`, `E → M`, everything else → `X`.

**Known limitation:** These are order-of-magnitude mean compositions. Individual asteroids vary enormously — Ryugu (Cg) has ~5% water by mass; some C-types may have <0.1%. Do not use for mission resource planning without independent spectral analysis.

### Mass Estimation

`mass = (4/3)π r³ × ρ` where `r = diameter/2` (meters) and `ρ` is the spectral-group bulk density:

| Group | ρ (kg/m³) | Source |
|---|---|---|
| C | 1300 | Carry 2012 mean |
| S | 2700 | Carry 2012 mean |
| M | 5300 | Carry 2012 mean |
| X | 2000 | blended estimate |

Diameter source priority: `ast._diam_m` (set by existing enrichment code) → fallback 100 m.

**Known limitation:** Bulk density is a group mean. Actual values span ±40% (macro-porosity, composition variance). Mass estimates carry ~2× uncertainty.

### Commodity Prices

**Static fallback prices** (hardcoded):
- Water: $0/kg Earth, $50,000/kg space (Keck Institute in-situ estimate)
- Iron: $0.12/kg, Nickel: $16/kg, Cobalt: $28/kg, PGMs: $31,000/kg
- Gold: $92,000/kg, Silver: $1,050/kg, Copper: $9.50/kg
- Carbon: $0.50/kg Earth, $10,000/kg space; Silicates: $0.01/kg Earth, $5,000/kg space
- Rare Earth: $250/kg

**Live prices:** `GET /api/prices` on the Cloudflare Worker attempts `metals-api.com` if `METALS_API_KEY` is configured. Troy oz → kg: `1 / (rate_per_oz × (1/32.1507))`. Metals-API symbols: XAU, XAG, XPT, XPD, COPPER, NICKEL, COBALT. Falls back to static if key absent or request fails.

**Client caching:** `sessionStorage` key `aster_prices_v1` (session duration, no TTL — prices don't change significantly within a session). Force-refresh via ↺ button.

**Space price mode:** pressing "EARTH PRICES" toggles to "SPACE PRICES" which overlays `STATIC_PRICES_SPACE` overrides (water, carbon, silicates jump dramatically). `getActivePrices()` merges the live base with the space overrides.

### SVG Charts

**Donut chart** (`buildDonutSVG`): Arc paths via `A` SVG command. Only shows materials with ≥0.1% mass. Legend right of ring (max 8 entries). Center label shows total mass in metric tons (T/B/M/k suffixes). Native browser `<title>` tooltips on segments show "Material: X% · Y Mt".

**Horizontal bar chart** (`buildBarsSVG`): Top 10 materials by economic value, sorted descending, bar width proportional to max value in set. Shows material name, bar (colored per `MAT_COLORS_HEX`), and value label.

Both charts are inline programmatic SVG — no library, no canvas, no DOM manipulation after `innerHTML` set.

### Sortable Table

`buildMaterialsTable` renders an HTML table with clickable `<th>` headers (`onclick="matSort('key')"`). Columns: MATERIAL, MASS%, TONNAGE, $/KG, VALUE, EXTRACT difficulty. `matSort()` toggles ascending/descending on repeated click. Current sort indicated with ▲/▼ suffix and `sorted` CSS class. TOTAL row always at bottom regardless of sort.

Extraction difficulty badges (`easy/medium/hard/extreme`) use color-coded `mat-badge` spans styled in the `<style>` block.

### Cloudflare Worker Changes (`worker/index.js`)

- CORS: `'POST, OPTIONS'` → `'GET, POST, OPTIONS'`
- Added `STATIC_PRICES`, `priceCache`, `priceCacheTime`, `PRICE_CACHE_TTL = 1hr` at module scope
- Added `GET /api/prices` route before the existing route guard; in-memory 1-hour cache; optional metals-api.com live fetch; static fallback always works without any secrets

**Deploy:** `cd worker && wrangler deploy` — `METALS_API_KEY` is optional; leaving it unset returns static prices.

### Integration Points

- `fetchPrices()` called non-blocking in `init()` (after `fetchNHATSData()`)
- Tab switch handler includes `tab-materials` display toggle + `renderMaterialsTab(selectedId)` on activation
- `selectAsteroid()` calls `renderMaterialsTab(id)` when materials tab is active
- No auto-fetch on asteroid select when tab is inactive (same lazy pattern as research tab)

*Last updated: Phase 7C complete, 2026-04-01*

---

## Phase 7D — Mission Planner Interface (2026-04-01)

### Trajectory Optimizer: Vis-Viva Approximation

**Method:** Grid search over departure dates (every 15 days) and transfer times-of-flight (30–600 days, 25 samples). For each (departure, TOF) pair:

1. Compute Earth position at departure: `r1 = |propagatePlanet(2, jd_dep)|` (AU)
2. Compute asteroid position at arrival: `r2 = |propagateAsteroid(ast, jd_arr)|` (AU)
3. Minimum-energy transfer ellipse: `a_transfer = (r1 + r2) / 2`
4. Vis-viva transfer speed at each endpoint: `v = sqrt(GM * (2/r - 1/a))`
5. ΔV = |v_transfer − v_circular| at each endpoint

Return trip estimated as symmetric (same Hohmann ΔV as outbound). Destination overhead added as fixed table value.

**Known errors:**
- Hohmann assumption ignores transfer angle geometry (ignores the fact that the actual ΔV depends on the angle between r1 and r2, not just their magnitudes). For coplanar, opposite-side transfers the error can be ±30–50%.
- Return ΔV = outbound ΔV ignores inclination differences between return geometry.
- Destination overhead is constant, not geometry-dependent.
- Expected error vs full Lambert: ±0.5–3 km/s per leg for typical NEAs. Useful for ranking; not for mission design.

**Impact:** Suitable for identifying top-10 candidate windows. Use porkchop (full Lambert) for detailed analysis. Full Lambert replaces vis-viva in Phase 7E.

### 3D Trajectory Visualization

**Method:** `THREE.QuadraticBezierCurve3` from Earth position to asteroid position, with a control point elevated 30% of the horizontal separation distance above the ecliptic midpoint. 100 sample points rendered as `THREE.Line`.

**Known limitation:** Curve is a visual approximation — it does not follow the actual Keplerian transfer trajectory. Real heliocentric transfer arcs are conic sections; the Bezier is purely illustrative. Phase 7E will replace this with a propagated Keplerian arc.

Departure arrow: `THREE.ArrowHelper` (green) at Earth position, pointing toward asteroid.
Arrival arrow: `THREE.ArrowHelper` (red) at asteroid position, pointing back (retro-burn direction).

### Mission Cost Model

- **Launch cost:** wet_mass (dry + propellant) × $/kg for selected launch vehicle
- **Spacecraft cost:** fixed per class (Light $50M, Medium $180M, Heavy $500M)
- **Operations cost:** $2M/month × mission_duration_months
- **Propellant mass:** Tsiolkovsky single-stage `m_prop = m_dry × (exp(ΔV/(g0×Isp)) − 1)` for total ΔV
- **Known limitation:** Single-stage Tsiolkovsky for the total ΔV is conservative (overestimates propellant). Real missions stage propellant across burns. Adds ~10–40% propellant margin.

### Revenue Model

Revenue = payload_capacity_kg × revenue_per_kg, where revenue_per_kg is derived from the Phase 7C Materials composition model:

`revenue_per_kg = Σ (comp[material] / 100) × price[material]`

This uses the same `MAT_COMP[spec]` table as the MATERIALS tab. Revenue is in Earth prices by default (unless space price toggle is active in MATERIALS tab when the planner is opened).

**Known limitation:** Payload capacity (200/2000/20000 kg) is treated as fully extractable ore — no efficiency loss, no minimum viable asteroid density check.

### Editable Burn Table

4 pre-filled burns: departure, arrival, return departure, return arrival. Each burn shows date + editable ΔV input. Total ΔV and propellant mass recalculate on each change. Mid-course corrections (MCCs) can be added. "Reset to Optimal" reverts to auto-optimizer result.

*Last updated: Phase 7D complete, 2026-04-01*
