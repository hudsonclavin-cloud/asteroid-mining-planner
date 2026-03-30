# Aster Physics Approximations — DEVLOG

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
