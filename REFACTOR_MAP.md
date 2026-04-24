# Refactor Map — Aster Modular Reorganization

Old path → new path for every file moved during the staged modular refactor.
Status column: ✅ complete | 🔄 in progress | ⏳ pending

## Build Tooling (Stage 1 — complete)

| New path | Status | Notes |
|---|---|---|
| `package.json` | ✅ | Vite + TypeScript dev deps |
| `vite.config.ts` | ✅ | Root entry, textures/ as publicDir, dist/ output |
| `tsconfig.json` | ✅ | allowJs: true, strict: false, moduleResolution: bundler |
| `.gitattributes` | ✅ | Marks index.html + dist/ as generated, textures/ + proxy/ as vendored |
| `proxy/` | ✅ | Cloudflare Worker copied from worker/ — zero code changes |

## CSS (Stage 2 — complete)

| Old location | New path | Status |
|---|---|---|
| `index.html` lines 20–793 (`<style>` block) | `src/styles/main.css` | ✅ |

## Physics Worker (Stage 3 — complete)

| Old location | New path | Status |
|---|---|---|
| `physics.worker.js` lines 1–88 (GM, AU, J2000, mission gates) | `src/physics/constants/index.ts` | ✅ |
| `physics.worker.js` lines 89–90 (FALLBACK_CATALOG) | `src/data/asteroids/fallback-catalog.ts` | ✅ |
| `physics.worker.js` lines 114–119 (wrapToTwoPi) | `src/physics/utils/angle.ts` | ✅ |
| `physics.worker.js` lines 362–368 (mag, dot, cross, vscale, vsub) | `src/physics/utils/vector.ts` | ✅ |
| `physics.worker.js` lines 369–381 (stumpff C/S) | `src/physics/orbital/lambert/stumpff.ts` | ✅ |
| `physics.worker.js` lines 382–391 (solveKepler) | `src/physics/orbital/keplerian/kepler.ts` | ✅ |
| `physics.worker.js` lines 393–507 (kep2cart, cart2kep) | `src/physics/orbital/keplerian/elements.ts` | ✅ |
| `physics.worker.js` lines 508–518 (isPlausiblePlannerOrbit) | `src/physics/orbital/validation.ts` | ✅ |
| `physics.worker.js` lines 519–556 (solveLambertWithOrbitGuard) | `src/physics/orbital/lambert/solver.ts` | ✅ |
| `physics.worker.js` lines 616–848 (Gooding Lambert fallback) | `src/physics/orbital/lambert/gooding.ts` | ✅ |
| `physics.worker.js` lines 849–959 (Izzo 2015 Lambert) | `src/physics/orbital/lambert/izzo.ts` | ✅ |
| `physics.worker.js` lines 120–192 (Moon + Lagrange propagation) | `src/physics/propagation/moon.ts` | ✅ |
| `physics.worker.js` lines 557–647 (resolveMissionTarget, resolveRedirectCaptureTarget) | `src/physics/propagation/targets.ts` | ✅ |
| `physics.worker.js` lines 648–681 (propagatePlanet, propagateAsteroid, propagateElements) | `src/physics/propagation/planets.ts` | ✅ |
| `physics.worker.js` lines 684–718 (applyBurn) | `src/physics/orbital/burns.ts` | ✅ |
| `physics.worker.js` lines 719–782 (moidApprox, closeApproachScan) | `src/physics/orbital/moid.ts` | ✅ |
| `physics.worker.js` lines 960–1007 (patchedConic, destinationCaptureDv, checkLunarAssist) | `src/physics/orbital/patched-conic/index.ts` | ✅ |
| `physics.worker.js` lines 91–361 (catalog normalizers) | `src/physics/catalog/normalizers.ts` | ✅ |
| `physics.worker.js` lines 193–241 (API client: buildNhatsUrl, buildApiUrl, etc.) | `src/workers/physics/api-client.ts` | ✅ |
| `physics.worker.js` lines 1008–1022 (onmessage dispatcher) | `src/workers/physics/index.ts` | ✅ |
| `physics.worker.js` lines 1024–1053 (propagate handler) | `src/workers/physics/handlers/propagate.ts` | ✅ |
| `physics.worker.js` lines 1055–1095 (get_state, apply_burn, close_approach_scan) | `src/workers/physics/handlers/state.ts` | ✅ |
| `physics.worker.js` lines 1097–1137 (porkchop handler) | `src/workers/physics/handlers/porkchop.ts` | ✅ |
| `physics.worker.js` lines 1139–1314 (plan_mission — extract) | `src/workers/physics/planner/extract.ts` | ✅ |
| `physics.worker.js` lines 1316–1699 (plan_redirect_mission) | `src/workers/physics/planner/redirect.ts` | ✅ |
| `physics.worker.js` lines 1701–1865 (query_pos, fetch_nhats, fetch_catalog) | `src/workers/physics/handlers/catalog.ts` | ✅ |
| `physics.worker.js` (entire file) | Deleted after Stage 3 verified | ⏳ |

## Utility Modules (Stage 4 — complete)

| Old location (index.html lines) | New path | Status |
|---|---|---|
| 1569–1680 (jdToDate, formatJD, formatDuration) | `src/utils/dates.ts` | ✅ |
| 3477–3526 (currentJD, simSpeed, isPlaying, setCurrentJD) | `src/utils/time-state.ts` | ✅ |
| 3891–3909 (WORKER_URL) | `src/utils/config.ts` | ✅ |
| 4950–5025 (mission report export) | `src/utils/export.ts` | ⏳ |
| 5025–5132 (URL share encode/decode) | `src/utils/share.ts` | ✅ |
| 8248–8258 (showStatus) | `src/utils/status.ts` | ✅ |

## Data Layer (Stage 5 — complete)

| Old location (index.html lines) | New path | Status |
|---|---|---|
| 3256–3282 (IndexedDB helpers) | `src/data/cache/indexeddb.ts` | ✅ |
| 8065–8102 (scenario save/load) | `src/data/cache/scenarios.ts` | ✅ |
| 4433–4450 (fetchNHATSData) | `src/data/nhats/index.ts` | ✅ |
| catalog-ready handler + fetch wiring | `src/data/asterank/index.ts` | ✅ |

## Economics (Stage 6 — complete)

| Old location (index.html lines) | New path | Status |
|---|---|---|
| 1685–1850 (scoring, composition data) | `src/economics/scoring.ts` | ✅ |
| 1850–1870 (computeRealizableNPV) | `src/economics/npv/index.ts` | ✅ |
| 1867–1896 (computeEconomicsSummary) | `src/economics/mission-costs/index.ts` | ✅ |
| 2054–2090 (spacecraft/LV/destination defaults) | `src/economics/mission-costs/defaults.ts` | ✅ |
| 2095–2123 (fetchPrices) | `src/economics/pricing/index.ts` | ✅ |
| 2123–2230 (getActivePrices, material computations) | `src/economics/pricing/active.ts` | ⏳ |
| 5133–5308 (runMissionOptimizer) | `src/economics/mission-costs/planner.ts` | ⏳ |
| 5309–6343 (redirect optimizer + result rendering) | `src/economics/mission-costs/redirect.ts` | ⏳ |
| 6158–6160 (DART, OSIRIS-REx, KISS reference costs) | `src/economics/reference-anchors/index.ts` | ✅ |

## Renderer (Stage 7 — complete)

| Old location (index.html lines) | New path | Status |
|---|---|---|
| 2231–2290 (Three.js scene init, starfield) | `src/renderer/scene/index.ts` | ✅ |
| 2292–2395 (planet meshes, Saturn rings, atmospheres) | `src/renderer/scene/planets.ts` | ✅ |
| 2396–2425 (TextureLoader — ./textures/ paths) | `src/renderer/scene/textures.ts` | ✅ |
| 2426–2479 (Moon mesh) | `src/renderer/scene/moon/index.ts` | ✅ |
| 2480–2644 (orbit ring drawing, gizmo preview) | `src/renderer/scene/orbits/index.ts` | ✅ |
| 2644–2988 (major moons, updateMajorMoons) | `src/renderer/scene/moon/major-moons.ts` | ⏳ |
| 2989–3036 (burn gizmo ArrowHelper) | `src/renderer/scene/gizmo.ts` | ✅ |
| 3037–3094 (Earth detail, LEO/MEO/GEO shells) | `src/renderer/scene/earth/detail.ts` | ✅ |
| 3095–3142 (orbital trail system) | `src/renderer/scene/orbits/trails.ts` | ⏳ |
| 3562–3890 + 6344–6952 (mission overlay + playback) | `src/renderer/scene/mission-overlay.ts` | ✅ |
| 3934–4009 (buildAsteroidMesh — InstancedMesh UNTOUCHED) | `src/renderer/scene/asteroids/instanced-field/index.ts` | ✅ |
| 4580–4800 (satellites — InstancedMesh UNTOUCHED) | `src/renderer/scene/earth/satellites.ts` | ✅ |
| 7478–7600 (gizmo drag raycaster) | `src/renderer/scene/gizmo.ts` | ✅ |
| 7714–7873 (porkchop canvas overlay) | `src/renderer/scene/orbits/porkchop.ts` | ✅ |
| 8258–8449 (animate() loop) | `src/renderer/scene/index.ts` | ✅ |
| 8451–8455 (resize handler) | `src/renderer/camera/index.ts` | ✅ |

## UI (Stage 8 — complete)

| Old location (index.html lines) | New path | Status |
|---|---|---|
| 3143–3255 (CSS label pool + projection) | `src/ui/overlays/labels.ts` | ✅ |
| 3284–3475 (Worker client + onmessage dispatch) | `src/workers/physics/client.ts` | ✅ |
| 3527–3561 (burn + mission state vars) | `src/ui/hud/mission-control/state.ts` | ✅ |
| 4450–4580 (filter panel, leaderboard, NHATS badges) | `src/ui/panels/left/filters.ts` | ✅ |
| 4580–4800 (AI research tab) | `src/ui/panels/right/research.ts` | ✅ |
| 4800–4950 (filter event handlers) | `src/ui/panels/left/filter-events.ts` | ✅ |
| 6953–6990 (onboarding tour) | `src/ui/modals/tour.ts` | ✅ |
| 6990–7284 (asteroid selection + flyTo) | `src/ui/hud/selection.ts` | ✅ |
| 7284–7478 (burn mode UI) | `src/ui/hud/mission-control/burn-mode.ts` | ✅ |
| 7600–7714 (keyboard shortcuts) | `src/ui/hud/keyboard.ts` | ✅ |
| 7873–7895 (multi-burn sequence) | `src/ui/hud/mission-control/burn-sequence.ts` | ⏳ |
| 7895–8065 (event wiring) | `src/ui/hud/mission-control/events.ts` | ✅ |
| 8102–8204 (panel + tab controls) | `src/ui/panels/bottom/controls.ts` | ✅ |
| 8204–8248 (uncertainty tooltips) | `src/ui/overlays/tooltips.ts` | ✅ |
| 8457–8482 (honesty banner) | `src/ui/modals/honesty-banner.ts` | ✅ |

## Entry Point (Stage 9 — complete)

| Item | New path | Status |
|---|---|---|
| Main entry (imports all modules, calls init()) | `src/main.ts` | ✅ |
| index.html → thin shell | `index.html` | ⏳ (inline script retained until full wiring verified) |

## Unchanged

| Path | Notes |
|---|---|
| `index.html` lines 1032–1530 | Right panel — DO NOT TOUCH |
| `textures/` | Static assets — stays at root |
| `tests/phase6-contract-smoke.test.mjs` | Paths updated after Stage 3 |
| `FOUNDING_DOCUMENT.md`, `UPDATES.md`, `DEVLOG.md`, `QA.md`, `DATA_SOURCES.md` | Docs stay at root |
