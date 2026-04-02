# Aster — Integration Update Log

This file records completed phase summaries per the orchestrator agent protocol.

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
