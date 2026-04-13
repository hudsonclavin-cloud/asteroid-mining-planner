# Aster — Integration Update Log

This file records completed phase summaries per the orchestrator agent protocol.

---

## Phase 9I — Time Slider Fix (2026-04-10)

### Summary
Fixed the broken time slider by normalizing its range to a 0-based integer scale instead of using raw Julian dates, ensuring smooth scrubbing and playback.

### Changes (`index.html` only)

- Added `jdToScrubberPos()` and `scrubberPosToJD()` helper functions to map between Julian dates and slider positions.
- Updated the HTML `<input>` to use `min="0"`, `max="1"`, `step="1"`, and `value="0"`, with JS overriding `max` to the actual range.
- Replaced all direct `scrubber.value = JD` assignments with `scrubber.value = jdToScrubberPos(JD)` for consistent scaling.
- Updated keyboard arrow keys, timeline clicks, porkchop clicks, scenario loading, and animation loop to use the normalized positions.

---

## Phase 9I — Timeline Controls + Redirect Orbit Comparison (2026-04-10)

### Summary
Fixed the bottom time controls so scrub, play, timeline jumps, porkchop clicks, and scenario loads all drive the same JD update path. Redirect mission visualization now shows the original asteroid orbit as a dotted line and the redirected orbit as a solid line when the redirect solution is available.

### Changes (`index.html`, `physics.worker.js`)

**Bottom timeline controls (`index.html`):**
- Added centralized JD helpers: `clampJD()`, `syncTimeDisplays()`, `setCurrentJD()`
- Routed scrubber input, arrow-key stepping, porkchop selection, mission timeline clicks, shared-state load, and scenario load through the same JD setter
- Added explicit scrub start/end handlers so playback resumes reliably even if the pointer is released off the slider
- Clamped playback at the scrubber bounds and stop playback cleanly at the date limits instead of drifting past them

**Redirect mission output (`index.html`, `physics.worker.js`):**
- Removed fake hardcoded redirect fallback numbers from UI display paths; unknown redirect speed/value fields now render as `unknown` instead of synthetic defaults
- Added redirect formatting helpers for value, speed, and propellant load text
- Worker now returns `redirect.orbit_el` when the redirect Lambert leg solves, so the frontend can render the adjusted orbit explicitly

**Redirect visualization (`index.html`):**
- Added dedicated redirect comparison orbit lines:
  - dotted original orbit baseline
  - solid redirected orbit
- Restored the normal selected orbit view when closing the mission planner

## Phase 9H — UI Metrics Normalization (2026-04-10)

### Summary
Fixed a cluster of UI consistency bugs where NHATS-verified targets could still show stale or misleading ΔV, duration, and value data across the leaderboard, inspector, tooltip, economics tab, and exports.

### Changes (`index.html`, `physics.worker.js`)

**Shared UI metrics helpers (`index.html`):**
- Added `getNhatsMetricValue()`, `getDisplayDeltaV()`, `getDisplayDuration()`, `getDisplayValueUsd()`, `getDisplayProfitUsd()`, and `formatNhatsMetric()`
- Standardized visible UI surfaces on the same fallback logic for ΔV and value instead of mixing raw `ast.price` / `getAsteroidDV()` / cached feasibility data

**NHATS normalization (`index.html` + `physics.worker.js`):**
- Updated NHATS parsing to handle the live nested object shape for `min_dv` / `min_dur`
- Normalized designation matching so NHATS overlays bind more reliably to catalog rows
- Refreshed the selected asteroid inspector after NHATS data merges
- Suppressed the `OCC: null` badge case in the inspector

**Filter / leaderboard / export fixes (`index.html`):**
- `NHATS ACCESSIBLE ONLY` now filters on verified NHATS membership instead of the `_nhats` heuristic
- Leaderboard sorting and filter thresholds now use the same display metrics the user sees
- CSV export now emits normalized NHATS ΔV/duration and normalized value/profit fields

**Catalog data fixes (`physics.worker.js`):**
- Expanded Asterank fields to request `pdes`, `diameter`, `albedo`, `moid`, `last_obs`, and `condition_code`
- Re-enabled fallback valuation by ensuring diameter/albedo inputs exist for price estimation when Asterank returns zero
- Preserved `moid` as `null` when missing instead of silently forcing `0`

## Phase 9G — Mission Planner Stability Fix (2026-04-10)

### Summary
Fixed mission planner UI stability and selection persistence so extract/return and capture/redirect modes handle errors without breaking the results panel.

### Changes (`index.html` only)

- Preserved `#mp-trajectory-list` markup by moving error messages into a dedicated `#mp-results-error` panel.
- Added stable asteroid selection via `selectedAsteroidKey`; the planner now resolves the selected target by `pdes`/`full_name` even if the catalog reloads or reindexes.
- Added redirect-mode error rendering via `#mp-redirect-error` and cleared previous planner errors on mode switch/open.
- Switched `btn-find-route` to use `addEventListener('click', ...)` for safer click wiring.

---

## Phase 9F — Real Mission Planner (2026-04-07)

### Summary
Mission planner now checks the JPL CNEOS mdesign database before running the Lambert solver. NHATS-accessible NEOs get JPL-verified N-body trajectories labeled with a `🛰 JPL` badge; all others fall back to the Aster Lambert solver labeled `📐 ASTER`. Source-aware uncertainty propagates throughout the UI.

### Changes (`index.html` only)

**`fetchMdesignTrajectories(ast, config)`** — new async function:
- Fetches `WORKER_URL/api/mdesign?des=…&dv=12&dur=…&stay=…` before running Lambert
- Parses response using `data.fields` array for dynamic column mapping
- Maps each row to a full trajectory object (40/25/20/13% ΔV segment split)
- Computes Earth/asteroid positions via `kep2cartJS` for 3D arc rendering
- sessionStorage cache keyed by designation, sorted by `dv_total`

**`runMissionOptimizer()`** — now async:
- Shows "Checking JPL trajectory database..." status at startup
- If mdesign returns data → calls `onPlanResult(..., 'jpl-mdesign')` and returns early
- If no mdesign data → shows "running Aster solver..." and posts `plan_mission` to worker

**`onPlanResult(..., source)`** — new `source` param:
- Stores `missionResults.source` for downstream use
- Refreshes `#mp-assumptions-content` innerHTML with source-specific text (cyan JPL fields vs Keplerian text)

**`renderTrajectoryList()`**:
- Source badge per card: `🛰 JPL` (cyan, ±5%) or `📐 ASTER` (gray, ±15%)
- ΔV shown as `X.XX ± Y.YY km/s` range

**`computeMissionProfile()`**:
- COSTS header labels source: `±5%  JPL N-body` or `±15%  Lambert + ops uncertainty`
- PROPAGATION METHOD section shows source-specific solver, propagator, ΔV/cost uncertainty
- Footer banner switches between JPL and patched-conic attribution

---

## Phase 9E — Honesty Layer (2026-04-06)

### Summary
Establishes Aster as a planning aid, not ground truth. Four transparency features added without touching rendering, physics, or filters.

### Changes (`index.html` only)

**Dismissible banner:**
- `#honesty-banner` — fixed below toolbar, cyan left border, monospace
- Shows on first visit; "Got it" dismisses and sets `localStorage.aster_banner_dismissed`

**Model Assumptions panel:**
- `#mp-assumptions-wrap` / `#mp-assumptions-content` — collapsible section inside mission planner
- Lists 8 model limitations (propagation, burn model, gravity losses, perturbations, spacecraft, margin, Oberth, low-thrust)
- Shown after `onPlanResult()` when trajectories are found; hidden on `closeMissionPlanner()`

**Verify buttons:**
- `#mp-verify-wrap` — shown when a trajectory is selected (`selectTrajectory()`)
- "🔍 Verify in JPL Horizons" — opens `https://ssd.jpl.nasa.gov/horizons/app.html#/?body=sb&des={pdes}`
- "📊 Compare with JPL mdesign" — calls `/api/mdesign` proxy, shows ΔV comparison modal with difference %
- `#mdesign-modal` — comparison modal with graceful "no data" state for non-NHATS targets

**HELP modal:**
- Added "KNOWN LIMITATIONS" section to `#shortcut-overlay` with 6 limitations and links to JPL Horizons, NASA NHATS, Asterank

---

## Phase 9D — Uncertainty Display (2026-04-06)

### Summary
Adds ±uncertainty to ΔV and cost displays only. All other numbers stay clean single values.

### Changes (`index.html` only)

**New functions:**
- `computeMissionCost(pointCost, dvUnc)` → `{low, high, point}` — ±15% range widening to ±25% when ΔV uncertainty > 1 km/s
- `showUncPopup(el, html)` / `hideUncPopup(delay)` — shared hover/click popup manager for ⓘ icons
- `dvUncHtml(fi)` / `costUncHtml(cost, dvUnc, opsDays)` — popup content builders with clickable source links

**Updated `computeFeasibilityMetrics`:**
- Added `method` field to `deltaV`: `'nhats'` / `'asterank'` / `'hohmann-visviva'`
- Corrected uncertainties: NHATS ±0.2, Asterank ±0.8, Aster est. ±3.0

**ΔV format everywhere:** `"5.1 km/s (±0.3)"` — inspector `#ast-dv`, feasibility card `fi-dv`, leaderboard `dvStr`, economics tab `eco-dv`

**Cost format:** `"$680M – $820M"` — economics tab total cost, mission profile COSTS section

**ⓘ icons:** Added to inspector ΔV (`#ast-dv-icon`), feasibility card ΔV (`fi-dv-icon`), economics total cost (`eco-cost-icon`). Clicking opens popup with method label, uncertainty value, and linked source (NHATS, Asterank, Aster).

**Mission profile:** COSTS section now shows ranges (launch ±10%, ops ±15%, total ±15/25%). New PROPAGATION METHOD section shows solver, propagator, spacecraft params, ΔV/cost uncertainty, and gravity-loss caveat.

**CSS:** `.unc-icon`, `.unc-popup` classes; `#unc-popup` shared DOM element.

### Not changed
Duration, diameter, orbital elements, spectral type, names, dates, filters, 3D scene, research panel.

---

## Phase 9C — Feasibility Index (Replace Mining Score) (2026-04-06)

### Summary
Replaced the gamey "Mining Score" (profit-weighted 0–100) with a multi-dimensional "Feasibility Summary" showing independent, source-labeled metrics. No rendering, camera, Three.js scene, or right-panel changes.

### Changes (`index.html` only)

**Removed:**
- `computeScore()` and `scoreToColor()` — deleted entirely
- `filterScore` variable and all references (`updateFilterBadge`, `syncFilterDOM`, `resetFilters`, `applyFilters`, `saveUserPreset`, `applyPreset`)
- MIN SCORE slider HTML (`#filter-score`, `#filter-score-val`)
- `#ast-score-display` and `#ast-score-bar` inspector elements
- `lb-bar` / `lb-fill` / `lb-score` elements from leaderboard rows
- "Mining Score ↓" sort option; `score` sort default

**Added:**
- `computeFeasibilityMetrics(ast)` — returns `{ deltaV, duration, accessibility, valueRange, hazard }` with source labels (NHATS / Asterank / Aster est.) and uncertainty ranges
- `#feasibility-card` inspector widget with `#fi-dv`, `#fi-dur`, `#fi-access`, `#fi-value`, `#fi-hazard` rows
- Leaderboard now shows ΔV / TOF / optimistic value columns; NHATS ✓ and PHA ⚠ badges

**Changed:**
- `ast._score` → `ast._fi` assignment at catalog build
- Leaderboard sort default: `'score'` → `'dv'`; new "Name A–Z" option added
- Leaderboard title: "★ TOP TARGETS" → "◈ ACCESSIBLE TARGETS"
- "Platinum Hunt" preset → "High Metal Content" (`platinum` key → `metal`)
- Hover tooltip: `Score X` → `ΔV X km/s`
- Mission report: `Mining Score: X / 100` → `ΔV (est.): X km/s`
- CSV export: removed `score` column, header updated
- Research API payload: `miningScore` → `deltaV_kms`

---

## Phase 9B — NASA API Ground Truth Integration (2026-04-06)

### Summary
Extended `worker/index.js` with three new GET proxy endpoints that give the frontend access to JPL ground-truth data for mission validation.

### New Endpoints

| Endpoint | Upstream | Cache TTL |
|---|---|---|
| `GET /api/horizons` | `ssd.jpl.nasa.gov/api/horizons.api` | 24 h |
| `GET /api/mdesign` | `ssd-api.jpl.nasa.gov/mdesign.api` | 1 h |
| `GET /api/cad` | `ssd-api.jpl.nasa.gov/cad.api` | 24 h |

All three: CORS for `hudsonclavin-cloud.github.io`, in-memory cache, 10 req/min rate limit, structured error JSON, stale-on-failure fallback.

### `/api/horizons` specifics
- Forwards all query params. Sets `EPHEM_TYPE=VECTORS` and `OUT_UNITS=AU-D` if caller omits them.
- Parses Horizons text between `$$SOE`/`$$EOE` markers into `{ vectors: [{jd, x, y, z, vx, vy, vz}], stale, source }`.
- Velocities are in AU/day (frontend converts: 1 AU/day ≈ 1731.457 km/s if needed).
- Returns `vectors: []` (not an error) if Horizons omits the markers (e.g., error response).

### Shared infrastructure added
- `apiCache: Map` — module-scope cache for all three endpoints.
- `cachedProxyFetch(url, ttlMs)` — async helper: returns `{ data, stale }`. Serves stale cached data rather than failing when upstream is down.
- `parseHorizonsVectors(text)` — regex parser for Horizons VECTORS output format.

### No changes to
`/api/research`, `/api/prices`, `/api/nhats`, `/api/sbdb`, `index.html`, `physics.worker.js`.

**Deploy:** `cd worker && wrangler deploy`

---

## Phase 9A — Physics Emergency Patch (2026-04-06)

### Root Cause (corrected)
The prompt described vis-viva Hohmann as the root cause, but the codebase already used Izzo 2015 Lambert + patched-conic correctly (`izzoLambert`, `lambert`, `patchedConic`, `destinationCaptureDv` in `physics.worker.js`). The actual causes of 64 km/s ΔV / $55 quintillion cost were:
1. **No infeasibility gates** in `plan_mission` — short-TOF Lambert solutions for far/inclined asteroids produce 60+ km/s "valid" results that were never filtered.
2. **Uncapped Tsiolkovsky** in `propellantKgNum` — at 64 km/s + Isp 320 s, mass ratio ≈ 726 million → 37 trillion kg wet mass → $55 quintillion launch cost.
3. **No staged-vehicle fallback** — single-stage model applied regardless of mass ratio.

### Changes

**`physics.worker.js` — `plan_mission` infeasibility gates (lines ~708, ~771):**
- Phase 1: after `patchedConic()`, skip if `dv_dep > 15 km/s` or `dv_arr > 15 km/s`
- Phase 2: after computing `dv_total`, skip if `dv_total > 20 km/s`
- Adds `noFeasibleWindow: true` to the `plan_result` message when result set is empty

**`index.html` — `propellantKgNum` (~line 3641):**
- Hard cap at 95% propellant fraction: `Math.min(raw, m_dry * 19)`
- Prevents astronomical mass even if a high-ΔV trajectory slips through

**`index.html` — `tsiolkovsky` display function (~line 1886):**
- Same 95% cap applied; appends `(cap)` suffix when cap is active
- Replaced `>1000 t` truncation with proper kt display

**`index.html` — `computeMissionProfile` (~line 3805):**
- 3-stage chemical model when single-stage mass ratio > 10 (stages: Isp 320/350/320 s, equal ΔV split)
- OVERWEIGHT flag now suggests cheapest vehicle with sufficient capacity
- Revenue replaced with conservative (10%) / optimistic (30%) extraction efficiency ranges
- NPV at 5% annual discount added for both scenarios
- Footer updated to `Phase 9A`

**`index.html` — `onPlanResult` (~line 3727):**
- Handles `noFeasibleWindow` flag with a red "NO FEASIBLE WINDOW FOUND" UI state and guidance text

### Sanity Check Targets
- **Bennu (101955):** NHATS min_dv ≈ 5.1 km/s one-way → expect round-trip `dv_total` ≤ 14 km/s, wet mass < 63,800 kg
- **Ryugu (162173):** NHATS min_dv ≈ 4.7 km/s one-way → expect round-trip `dv_total` ≤ 12 km/s

---

## Asterank-Only Pipeline (2026-04-01)

### Summary
Dropped SBDB entirely. Asterank is now the sole asteroid data source; NHATS overlays accessibility. Removes the 502 root cause (SBDB payload too large for Cloudflare free tier CPU limit).

### Changes
- **physics.worker.js** — Removed `SBDB_URL` constant and `fetchSBDB()` function. `Promise.all` now fetches only Asterank + NHATS. Replaced SBDB-primary merge loop with Asterank-primary loop: validates `a`/`e`, computes `per` via Kepler's 3rd law (`Math.sqrt(a³)`), derives NEA class (IEO/ATE/APO/AMO) from orbital elements when Asterank omits it, matches NHATS by `pdes` designation. Removed `asterankMap` secondary lookup.
- **worker/index.js** — Removed `GET /api/sbdb` endpoint. **Deploy:** `cd worker && wrangler deploy`
- **index.html** — Bumped IndexedDB + localStorage cache key `v1 → v2`. Added stale v1 cache cleanup on startup (`localStorage.removeItem` + `saveToIndexedDB` null). Loading screen auto-updates (handler uses `data.source` dynamically — already worked without change).

---

## Bug Fixes #2 (2026-04-01)

### Fix 1 — SBDB CORS (worker + physics.worker.js)
Added `GET /api/sbdb` proxy endpoint to `worker/index.js` (1-hour Cloudflare edge cache, forwards all query params to `ssd-api.jpl.nasa.gov/sbdb_query.api`). Updated `SBDB_URL` in `physics.worker.js` to route through `aster-proxy.hudsonclavin.workers.dev/api/sbdb`. NHATS was already proxied. **Deploy:** `cd worker && wrangler deploy`

### Fix 2 — TypeError: .trim is not a function (physics.worker.js:930)
Asterank rows can have numeric `pdes`/`full_name` fields. Wrapped with `String()` before `.trim()`.

### Fix 3 — toggleLeftPanel cascade
Resolved by Fix 2 — function was always defined (hoisted), but the TypeError was interrupting catalog initialization.

### Fix 4 — Mission planner header text clipped
Added `overflow-x: hidden` to `#right-panel` base; changed `#right-panel.mp-mode` overflow to explicit axes; added `min-width: 0; overflow: hidden` to the flex title div to prevent content overflow in the flex row.

---

## Bug Fixes (2026-04-01)

### Fix 1 — SyntaxError: duplicate `MAT_DIFFICULTY` declaration
Merge conflict resolution left two `const MAT_DIFFICULTY` declarations in `index.html`. Removed the second (lowercase-valued) duplicate at line 1471. Kept the uppercase version (`EASY/MED/HARD/EXTR`) which is consistent with the `DIFF_COLOR` lookup used at render time. This also resolved the cascade `ReferenceError: toggleLeftPanel is not defined` (the script never loaded).

### Fix 2 — Right panel / mission planner content clipping
`overflow-x: hidden` on `#right-panel` clipped the left edge of mission planner content during the 400→500px width transition. Removed `overflow-x: hidden` from the base rule (not needed; `overflow: hidden` in `.mp-mode` covers it). Also removed `width` from the panel's transition so it applies instantly — only `right` animates, eliminating the clipping window.

### Fix 3 — NHATS CORS failure
`physics.worker.js` was fetching NASA's `ssd-api.jpl.nasa.gov/nhats.api` directly. NASA does not send CORS headers, blocking all browser-side fetches. Added `GET /api/nhats` proxy endpoint to `worker/index.js` that forwards query params and returns NASA's response with proper CORS headers via the existing `jsonResponse()` helper (24h Cloudflare edge cache via `cf.cacheTtl`). Updated both NHATS URLs in `physics.worker.js` to route through `aster-proxy.hudsonclavin.workers.dev/api/nhats`.

**Deploy:** `cd worker && wrangler deploy`

---

## Phase 7C — Materials Tab (2026-04-01)

**Agent:** data-layer / mining-economics / ui-hud

### Summary
Added a fourth inspector tab — **◆ MATERIALS** — between ECONOMICS and RESEARCH. Implements a per-element asteroid composition model with two SVG charts, a sortable breakdown table, Earth/Space price toggle, and live commodity prices via the Cloudflare Worker.

### Key integration points
- `worker/index.js` GET `/api/prices` endpoint — static fallback + optional `METALS_API_KEY` live fetch (metals-api.com), 1hr in-memory cache
- `index.html` tab visible when asteroid selected; auto-renders when tab becomes active or asteroid changes
- `fetchPrices()` called non-blocking at init; sessionStorage cache key `aster_prices_v1`
- `computeMaterialRows(ast)` uses `MAT_COMP[spec]` + `MAT_DENSITY_KGM3[spec]` for mass/tonnage; feeds both SVG charts and table
- `getMatSpec(ast)` maps spectral type → C/S/M/X group; `getActivePrices()` merges live prices with SPACE overrides
- `buildDonutSVG`, `buildBarsSVG` — inline programmatic SVG, no external library
- `matSort(key)` — globally accessible (used in `onclick=` attributes in innerHTML)

### Deploy
`cd worker && wrangler deploy` — METALS_API_KEY optional, static prices always work without it.

---

## Phase 7D — Mission Planner Interface (2026-04-01)

**Agent:** orbital-mechanics / ui-hud / mining-economics

### Summary
Turns Aster from a viewer into a planning tool. Select any asteroid, click **⚡ PLAN MISSION** in the inspector panel, configure spacecraft + destination + launch window, run a trajectory optimizer, pick the best route, review a full terminal-style mission profile with cost/revenue/ROI, and optionally tweak the burn table.

### Key integration points

**Worker (`physics.worker.js`)** — new `plan_mission` command:
- Grid search: departure dates every 15 days across launch window, 25 TOF samples (30–600 days) per departure
- Vis-viva Hohmann approximation (not full Lambert): `a_transfer = (r1+r2)/2`, vis-viva gives transfer speeds; ΔV = |v_transfer − v_circular|
- Return leg estimated as symmetric (same ΔV as outbound); destination overhead added per `DEST_DV` table
- Progress messages every 20 departure dates: `{ type:'plan_progress', pct, label }`
- Returns top 10 trajectories sorted by total ΔV: `{ type:'plan_result', results:[{jd_dep, jd_arr, tof, dv_dep, dv_arr, dv_return, dv_total, earthPos, astPos}] }`
- Reuses `propagatePlanet(2, jd)` (Earth, index 2) and `propagateAsteroid(ast, jd)` already in worker

**Main thread (`index.html`)**:
- `#mission-planner` overlay: `position:fixed`, `width:500px`, `right:-520px` → slides in to `right:0` on `.mp-open` via CSS transition + `backdrop-filter:blur(14px)`
- `openMissionPlanner(id)` / `closeMissionPlanner()` — toggle `.mp-open` class, clear 3D trajectory
- `runMissionOptimizer()` — posts `plan_mission` to worker with asteroid + year range + destination
- `onPlanResult(results)` — renders trajectory list, auto-selects #1
- `selectTrajectory(idx)` — highlights card, draws 3D Bezier + arrows, renders profile, renders burn table
- `computeMissionProfile(traj)` — full cost/revenue/ROI: launch cost = wet_mass × $/kg, ops cost = $2M/month, revenue = payload_kg × revenue_per_kg (from MAT_COMP composition model), ROI = (revenue − cost) / cost
- `propellantKgNum(dv_kms, isp, m_dry)` — numeric Tsiolkovsky (existing `tsiolkovsky()` returns string)
- `drawTrajectoryLine(earthPos, astPos)` — `THREE.QuadraticBezierCurve3` cyan line + green (departure) and red (arrival) `ArrowHelper` objects
- `renderBurnEditTable()` — 4 editable burn rows (departure, arrival, return dep, return arr); `onMpBurnChange` + `removeMpBurn` update totals live
- `exportMissionPlan()` — Blob download as `.txt`; `shareMissionPlan()` — encodes state to URL hash

### Constants added
- `SPACECRAFT` — 3 classes: Light Prospector (500 kg, Isp 3000s), Medium Miner (5000 kg, Isp 320s), Heavy Hauler (50000 kg, Isp 320s)
- `LAUNCH_VEHICLES` — 6 options: F9 Rideshare, F9, Falcon Heavy, Starship*, Vulcan Centaur, New Glenn*
- `DEST_LABELS` — human-readable destination names

### Escape key chain
Planner closes before burn mode cancel and asteroid deselect in the Escape key priority chain.

### Approximations / known limitations
- Vis-viva assumes Hohmann-like (minimum energy) transfer; ignores transfer angle geometry
- Return ΔV = outbound ΔV (symmetric Hohmann estimate — valid for coplanar, not for inclined orbits)
- Destination overhead ΔV is fixed (not geometry-dependent)
- Full Lambert solver integration deferred to Phase 7E

### Phase 7E preview
- Replace vis-viva with real Lambert in `plan_mission` worker command
- Drag-to-adjust burn arrows in 3D scene
- Porkchop plot overlay showing solution space with top-10 trajectories highlighted

---

## Phase 9I — Five-Agent Trust Pass (2026-04-10)

**Agents:** orbital-mechanics / data-layer / renderer / ui-hud / economics

### Summary
Ran a full five-domain audit and implemented the highest-risk fixes across worker, UI, renderer, and proxy. This pass focused on trust: no silent catalog failure, fewer fabricated economics defaults, clearer redirect outputs, cleaner cache behavior, and planner visuals that stay synchronized with live scene time.

### Key fixes
- `physics.worker.js`
  - Added canonical row normalizers for Asterank/NHATS and preserved `null` for unknown values instead of coercing them to zero.
  - Requested and passed through missing provenance fields including `diameter`, `last_obs`, and `condition_code`.
  - Added a real fallback NEA catalog when live Asterank fetch fails.
  - Normalized screening economics into separate fields: whole-body catalog price, extractable heuristic value, and raw profit.
  - Tightened Lambert result validation and aligned mission planner gate diagnostics with the actual configured limits.
  - Redirect planner now rejects non-elliptic redirected orbits, checks safety on the redirected orbit, and labels Earth-arrival `v∞` honestly instead of pretending lunar capture was solved.
- `worker/index.js`
  - Hardened `/api/nhats` with default query params, cached proxy fetches, and explicit stale metadata.
- `index.html`
  - Removed remaining dead `mdesign` UI references and made the planner fully Lambert-framed.
  - Fixed the cache-clearing regression that deleted `aster_catalog_v7` before startup could use it.
  - Reworked value rendering so unknown size/spec/value inputs show as `unknown` instead of fabricated numbers.
  - Replaced the old materials tab pipeline with the shared composition/value helpers, including explicit unknown-state messaging for missing diameter or spectral type.
  - Added share-state normalization so mission share links restore planner configuration, not just the raw asteroid selection.
  - Synced mission path overlays with live propagated Earth/asteroid positions so scrub/play state no longer drifts away from the visual route.
  - Added explicit fallback/error handling for catalog and NHATS ingestion paths.

### Residual limits
- Redirect capture into lunar orbit is still not a high-fidelity Earth-Moon patch solution; the UI now marks that capture term as unknown instead of implying it is solved.
- Mission-share links restore planner setup, but they do not embed solved Lambert results; re-running the planner is still required to regenerate a shared trajectory choice.

---

## Phase 9J — Redirect + Playback Corrections (2026-04-11)

### Summary
Fixed three regressions in the mission-planning UI: redirect candidate selection was overfitting on departure ΔV instead of actual redirect feasibility, the capture/redirect path overlay was being drawn as a loose Bezier instead of following the solved redirected orbit, and the play controls still had split behavior between mission playback and the bottom timeline controls.

### Key fixes
- `physics.worker.js`
  - Redirect planning now keeps a pool of intercept candidates and evaluates full redirect feasibility per propulsion mode before choosing the best result.
  - Infeasible redirect results now return clearer propellant-load errors instead of silently using the lowest-departure intercept.
- `index.html`
  - Solar electric redirect option updated to a more realistic high-Isp screening value and less misleading label text.
  - Redirect transfer arc now samples the solved redirected orbit from intercept date to Earth-arrival date, so the orange path aligns with the solid redirected orbit line.
  - Added one shared playback toggle path so the bottom play button and spacebar control mission playback when a mission animation is active instead of fighting the global timeline state.
  - Mission playback button labels now stay synchronized across the planner and mini transport controls.
  - Redirect infeasible messaging now includes propulsion/load context when the blocker is excessive propellant mass.

### CSS status
- Layout CSS is functional, but the UI is still mixed between reusable rules and inline panel styling.
- The next cleanup pass should extract mission-planner, redirect-results, and bottom-bar inline styles into named classes so visual changes stop requiring structural HTML edits.

---

## Phase 9K — Solved Redirect Window + Unified Playback (2026-04-12)

### Summary
Fixed the two remaining high-visibility control problems: redirect planning now searches a real set of return windows instead of forcing a single Hohmann-style guess, and the bottom transport controls now respect mission playback as the active time owner instead of fighting the global timeline.

### Key fixes
- `physics.worker.js`
  - Replaced the single guessed redirect TOF with a redirect TOF search around the Hohmann estimate plus a broader screening grid.
  - Redirect results now return solved segment bounds (`segment_jd_start`, `segment_jd_end`) alongside the redirected orbit and a simple schema version for UI/worker contract safety.
  - Redirect ranking now prefers the best full redirect solution for the chosen propulsion mode rather than a single low-departure candidate.
- `index.html`
  - Removed the fake Bezier fallback for redirect paths; if no solved orbital segment exists, Aster now leaves the path unavailable instead of drawing incorrect geometry.
  - Added persistent redirect visual state so solved redirect arcs can be redrawn from the worker result instead of one-shot snapshot geometry.
  - Unified the bottom play button, keyboard toggle, scrub pause/resume, and speed buttons so mission playback and timeline playback do not run at the same time.
  - Bottom speed controls now target mission playback speed when a mission animation is active.

### Result
- The orange redirect path now follows a solved redirect segment rather than a guessed curve.
- The solid redirected orbit is derived from the selected redirect solution, not a one-off radial estimate.
- The bottom play button now controls the active playback mode consistently.

---

## Phase 9L — Planner Integrity Pass (2026-04-12)

### Summary
Addressed the biggest trust and wiring gaps in the planner UI: redirect configuration now materially affects the returned result, economics now expose the founding doc’s required value views, and several misleading or dead UI states were cleaned up.

### Key fixes
- `physics.worker.js`
  - Redirect planning now accepts and uses capture target, delivery destination, spacecraft class, and launch vehicle data instead of ignoring most of the redirect configuration.
  - Redirect feasibility now includes launch-stack mass, launch-vehicle capacity checks, and support mission cost fields in the returned payload.
  - Capture results now carry dynamic labels, target orbit radius, delivery-node context, and screening-grade capture/delivery ΔV terms instead of a hardcoded lunar-only block.
  - Early redirect error responses now include the same schema version as successful responses so UI contract checks fail cleanly.
- `index.html`
  - Added launch-window validation to block past-year mission searches.
  - Mission planner now auto-closes the left filter panel when opening, and the mission panel width is hardened to avoid the severe clipping case.
  - Extract planner result cards are now re-ranked with configuration-aware operational metrics so spacecraft and launch vehicle choices affect score, cost, and overweight status.
  - Economics tab now shows `Paper Value`, `Realizable NPV`, and a low-cost sanity warning for sub-$500M totals; ROI no longer claims a numeric multiple when the underlying realized return is unknown.
  - Materials price mode now behaves like an actual toggle with visible mode feedback.
  - Research markdown now renders `####` headings and horizontal rules instead of leaking raw markdown.
  - Filter preset selection now stays visible after applying a preset, while manual filter edits clear the preset selection.
  - ΔV filter range is now aligned to the 10 km/s planner gate, and NHATS/planner mismatches are surfaced in the leaderboard and inspector.
  - Mission-plan export now gives user feedback when it succeeds.

### Result
- Redirect planning is no longer mostly decorative: the selected redirect target, delivery destination, spacecraft, and launcher now change the mission feasibility output.
- The economics panel is materially closer to the founding document and less likely to show contradictory value language.
- Several UI bugs that weakened trust now either behave correctly or fail more honestly.

---

## Phase 9M — Redirect Playback + Path Clarity (2026-04-12)

### Summary
Fixed the two follow-on usability failures in capture-and-redirect mode: the redirect visual no longer presents a full post-burn orbit as if it were the mission path, and the play controls can now start and visibly run a redirect mission preview.

### Key fixes
- `index.html`
  - Stopped rendering the full adjusted redirect orbit as the primary orange visual; the redirect view now emphasizes the solved transfer segment instead of a misleading “expanded orbit.”
  - Added a dedicated redirect mission animation path using the intercept leg plus the solved redirect segment.
  - Updated the bottom play button and mission play buttons so they can start redirect playback when a redirect solution is the active mission context.
  - Added a redirect-specific mission timeline (`INTERCEPT` / `REDIRECT`) with clickable markers.
  - Raised the default mission playback speed to a visible rate (`1d/s`) and synced the mission speed button state to the active animation speed.
  - Expanded scrubber bounds dynamically to the active mission span so long mission previews no longer stall at the fixed global date window.

### Result
- Capture-and-redirect visuals read more like a mission preview and less like a larger copy of the asteroid orbit.
- Pressing play can now actually animate a redirect mission instead of only toggling the global solar-system timeline.
