# S20 A-cache run log

Phase 0: origin/main = da27cb5; node v26.7.0; npm 11.19.0; Windows. Baseline verification pending.

## npm ci
Started: 2026-11-16T16:24:04.5617696-05:00


> aster@0.1.0 prepare
> node tools/setup-hooks.mjs

setup-hooks: configured core.hooksPath = .githooks

added 20 packages, and audited 21 packages in 1h

7 packages are looking for funding
  run `npm fund` for details

5 vulnerabilities (1 moderate, 4 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
node.exe : npm warn install-scripts 1 package has install scripts not yet 
covered by allowScripts:
At line:1 char:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (npm warn instal...y allowScripts: 
   :String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm 
install-scripts approve <pkg>` to allow.
灮⁭楣攠楸㩴〠䘊湩獩敨㩤㈠㈰ⴶㄱㄭ吶㜱㐺㨷㘵㌮㠱㠰〶〭㨵〰ഊ
## Baseline npm run verify
Started: 2026-11-16T17:49:14.4090643-05:00

> aster@0.1.0 verify
> npm run typecheck:v2 && npm run test:all


> aster@0.1.0 typecheck:v2
> tsc --noEmit


> aster@0.1.0 test:all
> node tools/run-tests.mjs

Discovered 111 test files (per-file watchdog: 180000 ms):
src\v2\app\catalog-list\row.test.mjs
src\v2\boundary\c3-grid.test.mjs
src\v2\porkchop\colormap.test.mjs
src\v2\porkchop\composite-grid.test.mjs
src\v2\porkchop\delta-v.test.mjs
src\v2\porkchop\dual-m-compute.test.mjs
src\v2\porkchop\grid-compute.test.mjs
src\v2\porkchop\launch-vehicles.test.mjs
src\v2\porkchop\propagation-guard.test.mjs
src\v2\porkchop\support-boundary.test.mjs
tests\phase6-contract-smoke.test.mjs
tests\setup-hooks.test.mjs
tests\v2-a11y-floor.test.mjs
tests\v2-about-copy.test.mjs
tests\v2-about-evidence.test.mjs
tests\v2-architecture.test.mjs
tests\v2-boundary-horizons.test.mjs
tests\v2-boundary-slice2.test.mjs
tests\v2-boundary-slice4.test.mjs
tests\v2-boundary-slice6.test.mjs
tests\v2-boundary-slice7.test.mjs
tests\v2-boundary-slice8.test.mjs
tests\v2-boundary-slice9.test.mjs
tests\v2-boundary-star-catalog.test.mjs
tests\v2-c3-value-type.test.mjs
tests\v2-catalog-count-binding.test.mjs
tests\v2-catalog-empty.test.mjs
tests\v2-catalog-threshold-disclosure.test.mjs
tests\v2-compare-data.test.mjs
tests\v2-compare-honesty.test.mjs
tests\v2-compare-url.test.mjs
tests\v2-coorbital-disclosure.test.mjs
tests\v2-core-constants.test.mjs
tests\v2-core-frames-jupiter.test.mjs
tests\v2-core-frames-mars.test.mjs
tests\v2-core-frames-saturn.test.mjs
tests\v2-core-hermite-jupiter.test.mjs
tests\v2-core-hermite-mars.test.mjs
tests\v2-core-hermite-saturn.test.mjs
tests\v2-core-hermite.test.mjs
tests\v2-core-keplerian.test.mjs
tests\v2-core-orbit-sampling.test.mjs
tests\v2-derived-span-labels.test.mjs
tests\v2-design-architecture.test.mjs
tests\v2-design-components.test.mjs
tests\v2-design-tokens.test.mjs
tests\v2-dla-display.test.mjs
tests\v2-dla-render.test.mjs
tests\v2-ephemeris-hud.test.mjs
tests\v2-f2-characterization.test.mjs
tests\v2-fk3-guided-tour.test.mjs
tests\v2-golden\launch-vehicles.golden.test.mjs
tests\v2-lambert\dla.test.mjs
tests\v2-lambert\feasibility.test.mjs
tests\v2-lambert\householder.test.mjs
tests\v2-lambert\hyp2f1b.test.mjs
tests\v2-lambert\initial-guess.test.mjs
tests\v2-lambert\lambert-endtoend.test.mjs
tests\v2-lambert\lambert-multi-rev-rejection.test.mjs
tests\v2-lambert\lambert-multi-rev.test.mjs
tests\v2-lambert\stumpff.test.mjs
tests\v2-lambert\tof.test.mjs
tests\v2-lambert\utc-to-tdb.test.mjs
tests\v2-lambert\vec3.test.mjs
tests\v2-light-time.test.mjs
tests\v2-near-zero-c3.test.mjs
tests\v2-porkchop-honesty.test.mjs
tests\v2-public-copy-render.test.mjs
tests\v2-public-copy.test.mjs
tests\v2-render-asteroid-cell-renderer.test.mjs
tests\v2-render-asteroid-orbits.test.mjs
tests\v2-render-asteroid-points-shader.test.mjs
tests\v2-render-asteroid-renderer.test.mjs
tests\v2-render-halos.test.mjs
tests\v2-render-jupiter-oblate.test.mjs
tests\v2-render-mars-oblate.test.mjs
tests\v2-render-mars-system.test.mjs
tests\v2-render-saturn-oblate.test.mjs
tests\v2-render-saturn-rings.test.mjs
tests\v2-render-spatial-grid.test.mjs
tests\v2-render-star-catalog.test.mjs
tests\v2-render-star-renderer.test.mjs
tests\v2-resolve-catalog-body.test.mjs
tests\v2-runtime-camera-presets.test.mjs
tests\v2-runtime-date-hud.test.mjs
tests\v2-runtime-display-integrity.test.mjs
tests\v2-runtime-focus.test.mjs
tests\v2-runtime-hover-tooltips.test.mjs
tests\v2-segment-windows.test.mjs
tests\v2-shortcut-and-method.test.mjs
tests\v2-slice1-cutover.test.mjs
tests\v2-slice1-integration.test.mjs
tests\v2-slice2-cutover.test.mjs
tests\v2-slice3-cutover.test.mjs
tests\v2-slice4-cutover.test.mjs
tests\v2-slice5-cutover.test.mjs
tests\v2-slice6-cutover.test.mjs
tests\v2-slice7-cutover.test.mjs
tests\v2-slice8-cutover.test.mjs
tests\v2-slice8-performance.test.mjs
tests\v2-slice9-cutover.test.mjs
tests\v2-slice9-live-runtime-integration.test.mjs
tests\v2-slice9-perf-config.test.mjs
tests\v2-slice9-reanchor-derived.test.mjs
tests\v2-slice9-spatial-index-harness.test.mjs
tests\v2-symmetric-return.test.mjs
tests\v2-tier-disclosure.test.mjs
tests\v2-tier-legend-render.test.mjs
tests\v2-ui-overlay.test.mjs
tests\v2-ui-store.test.mjs
tests\v2-validation-provenance.test.mjs

(node:52996) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ 2018 LA (L0, verified impact): LOW C3 badge suppressed; C3 kept with the last-known-orbit context (2941.0023ms)
✔ 2015 D1 (L0, hyperbolic): "—" stays, PROP FAIL badge stays, no context is invented for a null C3 (0.4165ms)
✔ non-L0 rows are untouched: 433 (L2) and 99942 (L1) keep their badge and plain C3 (0.5416ms)
✔ near-zero C3 is a separate geometry flag and coexists with the screening status badge (0.5742ms)
✔ near-zero catalog disclosure remains byte-identical to the approved wording (0.2154ms)
✔ near-zero hide state replaces only the rendered value and badge, preserving the low-C3 badge and source value (0.2439ms)
✔ S18 Item 5: the tier badge tooltip is the full disclosure sentence, never the slug (0.4347ms)
✔ the rule is exactly {L0} x {low, high}: every other tier/status combination renders its badge (0.6501ms)
✔ catalog C3 grid label is derived from cache metadata and its tooltip carries the full grid details (0.4863ms)
✔ CK-12 catalog C3 uses the shared three-significant-figure rule across its display range (0.7719ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3066.482
✔ cached C3 grid descriptor and short label derive from cache metadata (1930.0418ms)
✔ requested C3 grid descriptor changes with the scan arguments (1897.276ms)
✔ porkchop grid dimension wording is derived rather than literal (2245.8551ms)
✔ T5 formatter output changes with its grid parameters (2075.3074ms)
✔ shared C3 grid label derives common step units from axis parameters (2076.9838ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10316.1232
✔ c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling (1893.0247ms)
✔ c3ToViridisRgb uses monotonic log normalization with a hard floor at C3 <= 1 (1866.6578ms)
✔ colorForPorkchopCell uses sentinel colors for no_solution and stall (1808.9795ms)
✔ non-finite C3 values use the existing no-solution colour (1912.34ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7563.3418
✔ both families solve: strictly lower C3 wins (1900.4038ms)
✔ exact tie goes to M=0 and is counted (0.1628ms)
✔ only one family solves: that family is taken — the measured defect (0.1331ms)
✔ neither solves: no_solution, but a stall is never collapsed (SLICE_11_FOUNDING.md:207) (0.1366ms)
✔ composite minimum is never worse than either single-family minimum (0.2649ms)
✔ per-cell provenance: every ok cell carries the M that produced it (0.8524ms)
✔ AMD-2: the compared C3 is the selected branch, not branch 0 (0.1636ms)
✔ misaligned or mismatched grids throw rather than mis-pair cells (0.3954ms)
✔ counts account for every cell exactly once (0.1363ms)
✔ gridExtremes: both extremes on a normal grid (0.2532ms)
✔ gridExtremes: no_solution and stall cells are excluded (0.1402ms)
✔ gridExtremes: zero solvable cells returns an explicit empty variant (0.1004ms)
✔ gridExtremes: ties resolve to the lowest array index, for both extremes (0.1213ms)
✔ gridExtremes: over a composite grid whose extremes come from different families (0.2173ms)
✔ composite never exceeds M=0 per-cell wherever M=0 solves (structural — catches selection inversion) (0.0997ms)
✔ composite max <= M=0 max WHEN M=0 coverage is a superset (onlyM1 === 0) (0.1099ms)
✔ the superset precondition is real: with onlyM1 > 0 the composite max CAN exceed M=0 max (0.1145ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1991.2105
✔ ΔV stack is mode-aware: one-way omits departure and sample return uses symmetric-return assumption (1931.4092ms)
✔ D10 labels name margin bases and preserve the displayed value expressions (1.0034ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2023.5425
✔ computeDualFamilyGrids issues exactly two messages, M=0 then M=1 (AMD-1) (2090.0469ms)
✔ computeDualFamilyGrids awaits sequentially — never two computes in flight (0.1652ms)
✔ computeDualFamilyGrids carries the request through unchanged, one M per message (0.3914ms)
✔ computeDualFamilyGrids returns both grids keyed by family (0.1367ms)
✔ computeDualFamilyGrids propagates a failure from either family unchanged (0.4507ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2172.0457
lambertMultiRev: no solution for M=1; T=0.579002371229731 < T_min=4.4030574920032794
✔ computePorkchopGrid round-trips three validated M=1 cells through JD+days boundary across the regime (2906.0815ms)
✔ computePorkchopGrid maps below-T_min cells to no_solution (1.4033ms)
✔ computePorkchopGrid selects the lower-C3 branch when both M=1 branches converge (0.599ms)
✔ computePorkchopGrid maps all-failed synthetic solver output to stall (0.2822ms)
✔ porkchop worker init bootstraps Earth state and strips velocity internals from outbound branches (0.4432ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3008.5593
✔ launch vehicle catalog matches locked DEC-13-1 anchors exactly (1855.028ms)
✔ payloadAtC3 interpolates linearly between published anchors (0.217ms)
✔ payloadAtC3 never extrapolates past short published curves (0.1695ms)
✔ New Glenn keeps C3=30 anchor, interpolates steep interior, and stops after it (0.2101ms)
✔ payloadAtC3 refuses non-finite C3 separately from beyond-curve inputs (0.1603ms)
✔ deliveredMassKg excludes injection by construction and applies mode departure only for sample return (1.0155ms)
✔ spacecraft budget total is mode-owned and preserves every supplied term (0.2542ms)
✔ deliveredMassKg rejects corrupted budgets and invalid modes with INVALID_INPUT, never BEYOND_CURVE or a number (0.2331ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1938.1701
✔ guard agrees with the propagator on every catalog body (verified by propagating, not by reading the guard) (2756.333ms)
✔ 2015 D1: the verdict carries the catalog eccentricity and the verbatim sentence (0.4226ms)
✔ message rounds the eccentricity to 4 decimals and invents nothing for a non-finite one (0.161ms)
✔ computeCompareData: 2015 D1 is refused as a value in place; 433 and 2018 LA are byte-identical to the historical path (4.2319ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2866.5527
✔ 99942: the boundary comes from the committed artifact, and the partition matches the per-column formulation (2008.8694ms)
✔ edge behaviour: an encounter before the window makes every cell unsupported; after the last arrival, none (4.1626ms)
✔ no boundary is invented: non-L1 tiers and records without an encounter yield undefined (17.5147ms)
✔ the unsupported-cell sentence is verbatim (0.2348ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2133.0975
✔ all texture assets referenced by legacy/index.html exist on disk (20.9935ms)
✔ legacy entry is frozen, noindexed, and points visitors to V2 (2.1328ms)
✔ worker README documents the worker routes implemented in worker/index.js (42.6516ms)
✔ worker README documents all environment variables used by worker/index.js (2.4326ms)
✔ worker README documents wildcard localhost development origin support (1.0581ms)
✔ physics worker no longer hardcodes NHATS and Asterank production route URLs (1.9575ms)
✔ .gitignore covers local worker secrets and wrangler state (1.0783ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 164.5418
✔ prepare hook installer is silent and successful outside a git worktree (117.9979ms)
✔ prepare hook installer configures hooksPath inside a git worktree (265.0975ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 477.2201
(node:65396) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ contrast utility matches WCAG reference pairs and the three lightness overrides (1892.7054ms)
✔ catalog row is keyboard-focusable and Enter activates the same handler as click (2266.0116ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4271.1548
✔ About decision record carries no emoji (tail2 F7) (2816.6904ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2927.1191
✔ About evidence links use rendered audit-copy VNodes and real heading fragments (1980.3693ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2067.9886
✔ src/v2 sources do not import internal modules outside src/v2 (85.5898ms)
✔ C3 grid label sites use derived formatters and contain no literal dimension labels (3.7649ms)
✔ INV-026 departure-end date is owned by grid-span.ts (82.7049ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 270.7168
✔ jdTdbToSecondsSinceJ2000 converts J2000-relative TDB days into seconds (1974.5839ms)
✔ Slice 1 Earth/Moon fixture ingests into canonical meters, m/s, and aligned TDB seconds (5.8624ms)
✔ convertHorizonsRecord accepts object-form records with Horizons-native aliases (0.8227ms)
✔ convertHorizonsRecord rotates ecliptic J2000 vectors into canonical ICRF coordinates (0.233ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2067.8191
✔ Slice 2 fixture file exists and parses as valid JSON (2.4729ms)
✔ Slice 2 fixture contains all six required target keys (1.3801ms)
✔ Each body in Slice 2 fixture has 90-92 records (91 ± 1) (1.6541ms)
✔ Moon records after ingestion have frame matching FRAME_GCRS_EARTH (2066.0312ms)
✔ All non-Moon bodies after ingestion have frame matching FRAME_HELIO_J2000_ICRF (5.8096ms)
✔ First Earth record position magnitude in meters is between 1.48e11 and 1.52e11 (~1 AU) (4.4079ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2172.1857
✔ Slice 4 fixture contains all eight required target keys (8.9932ms)
✔ Slice 4 fixture origin tags match heliocentric Saturn and saturn-centered moons (6.4766ms)
✔ inferCanonicalFrame maps saturn-centered origins to FRAME_SATURN_J2000_ICRF (2095.5378ms)
✔ Slice 4 tuple records ingest into canonical meters, m/s, TDB seconds, and Saturn-centered moon frames (75.4594ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2269.2838
✔ Slice 6 fixture contains all three required target keys (7.5494ms)
✔ Slice 6 fixture origin tags match heliocentric Mars and mars-centered moons (6.3695ms)
✔ inferCanonicalFrame maps mars-centered origins to FRAME_MARS_J2000_ICRF (2055.1298ms)
✔ Slice 6 tuple records ingest into canonical meters, m/s, TDB seconds, and Mars-centered moon frames (46.5362ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2213.0659
✔ Slice 7 fixture contains the 1008-body hybrid catalog and required asteroid ids (6.9079ms)
✔ Slice 7 boundary ingestion preserves all 1008 asteroid records and the 8 curated NEAs (2169.2385ms)
✔ Slice 7 boundary spot-checks preserve Vesta, Bennu, and Apophis metadata and heliocentric frame (13.6748ms)
✔ Slice 7 boundary ingestion preserves anchor-position round-trip at the anchor epoch (14.3865ms)
✔ Slice 7 browser loader fetches and ingests the asteroid catalog fixture (11.6207ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2306.7127
✔ Slice 8 fixture exists and contains the 10,008-body catalog (62.0811ms)
✔ Slice 8 boundary ingestion preserves all 10,008 asteroid records and the Slice 7 subset (2212.6362ms)
✔ Slice 8 boundary spot-checks preserve Vesta, Bennu, Apophis, and new extension bodies (129.0108ms)
✔ Slice 8 band distribution and orbit-line count match Round 3 within tolerance (110.567ms)
✔ Slice 8 browser loader fetches and ingests the asteroid catalog fixture (145.2907ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2773.0044
✔ Slice 9 fixture exists and contains the live 41,906-body NEA catalog (307.1864ms)
✔ Slice 9 boundary ingestion preserves the full catalog and tier counts (2553.4056ms)
✔ Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies (495.4886ms)
✔ Slice 9 quality metadata and anchor semantics stay internally consistent (523.7628ms)
✔ Slice 9 browser loader fetches and ingests the NEA catalog fixture (516.0035ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4546.8289
✔ load succeeds, count matches header, and Sirius sorts first (1902.986ms)
✔ positions are unit vectors, magnitudes are sane, and colors stay in range (6.2823ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1992.3468
✔ C3Value requires a typed grid descriptor (981.9208ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1073.2088
AboutPage is not exported; semantic intro assertion skipped by contract.
✔ catalog count constant is bound to the committed catalog data (2291.9881ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2374.2615
✔ catalog renders distinct loading, failed, and empty-after-filter states (2130.4796ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2211.2859
✔ CK-13 renders the cache-derived LOW C3 screening threshold in the catalog legend (2202.6842ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2297.8624
✔ grid-compute fills TOF-fastest (index = depIdx * nTof + tofIdx) (2196.2935ms)
✔ D-01 toSegmentGrid remaps grid-compute layout to departure-fastest (0.3038ms)
✔ D-01 LOCK: breadth is measured on the DEPARTURE axis (asymmetric grid) (1.3389ms)
✔ D-02 the departure epoch threaded into segmentation is span.requested.start (0.2461ms)
✔ D-02 BLIND SPOT: column 0 cannot discriminate the two anchors (0.1567ms)
✔ D-02 SENSITIVITY: a 69.184 s anchor shift does flip dateIso across a midnight straddle (0.148ms)
✔ D-02 computeCompareData threads the injected anchor into argmin.dateIso (0.8743ms)
✔ T1 compare result carries payload-at-C3 and the full spacecraft budget (0.304ms)
✔ T7 compare data preserves measured grid timing and exposes missing timing as zero (0.447ms)
✔ D-03 injected absoluteKm2S2 is used, never the module default of 25 (0.4168ms)
✔ D-03 injection changes membership, proving the value is load-bearing (0.3187ms)
✔ D-04 echo carries liveMin, delta, absolute, and grid geometry from the computation (0.2037ms)
✔ D-04 relative-mode threshold equals echoed liveMin + delta (0.1211ms)
✔ DEC-17-10 out-of-bounds departure window returns a structured refusal (0.0991ms)
✔ DEC-17-10 refusal is a value — a start before the first sample does not throw (0.1858ms)
✔ a grid with no converged cell refuses with no-convergence (0.0931ms)
✔ DEC-17-6 cap: bodies beyond 5 are refused with cap-exceeded, first 5 computed (0.7214ms)
✔ serial orchestration preserves input order and is deterministic (1.0862ms)
✔ deliveredMass is null on NO-PRACTICAL-WINDOW rather than a fabricated number (0.3714ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2314.829
(node:55652) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ T1 compare rows render the near-zero flag only for sub-threshold minima and preserve values (2681.6587ms)
✔ T2 compare hide state preserves practical order and dominance while replacing flagged values (2634.4495ms)
✔ T3 compare size factors are derived from the imported albedo constants in both directions (2577.1647ms)
✔ W3a compare flags an Apophis window arriving after support without changing ranking data (2847.1866ms)
✔ W3b compare exposes delivered-mass anchors, NASA contract context, and the New Glenn caveat (2555.8377ms)
✔ T7 compare badge refuses timing when any grid lacks a measurement (2796.6644ms)
✔ compare defines the breadth qualifier from B_min and the sampling interval (tail2 F7) (2329.2047ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 18527.7033
✔ parse: basic list, with and without leading ? and other params (1767.1685ms)
✔ parse: missing or empty parameter yields [] (0.1619ms)
✔ parse: dedupes, first occurrence wins (0.1071ms)
✔ parse: caps at 5 (0.1062ms)
✔ parse: junk is rejected, valid neighbors survive (0.1256ms)
✔ parse: URL-encoded internal spaces decode and survive (0.0868ms)
✔ serialize: joins, dedupes, caps, drops junk; empty yields empty string (0.134ms)
✔ round-trip: parse(serialize(x)) is the sanitized x (0.1366ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1869.2216
✔ co-orbital disclosure attributes the rendered comparison to patched-conic methods (1805.0865ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1904.3904
PASS tsc compilation
PASS BODY_CONSTANTS has key 'sun'
PASS BODY_CONSTANTS has key 'mercury'
PASS BODY_CONSTANTS has key 'venus'
PASS BODY_CONSTANTS has key 'earth'
PASS BODY_CONSTANTS has key 'moon'
PASS BODY_CONSTANTS has key 'mars'
PASS BODY_CONSTANTS has key 'phobos'
PASS BODY_CONSTANTS has key 'deimos'
PASS BODY_CONSTANTS has key 'jupiter'
PASS BODY_CONSTANTS has key 'io'
PASS BODY_CONSTANTS has key 'europa'
PASS BODY_CONSTANTS has key 'ganymede'
PASS BODY_CONSTANTS has key 'callisto'
PASS BODY_CONSTANTS has key 'saturn'
PASS BODY_CONSTANTS has key 'titan'
PASS BODY_CONSTANTS has key 'rhea'
PASS BODY_CONSTANTS has key 'iapetus'
PASS BODY_CONSTANTS has key 'tethys'
PASS BODY_CONSTANTS has key 'dione'
PASS BODY_CONSTANTS has key 'mimas'
PASS BODY_CONSTANTS has key 'enceladus'
PASS BODY_CONSTANTS['sun'].radiusM > 0
PASS BODY_CONSTANTS['mercury'].radiusM > 0
PASS BODY_CONSTANTS['venus'].radiusM > 0
PASS BODY_CONSTANTS['earth'].radiusM > 0
PASS BODY_CONSTANTS['moon'].radiusM > 0
PASS BODY_CONSTANTS['mars'].radiusM > 0
PASS BODY_CONSTANTS['phobos'].radiusM > 0
PASS BODY_CONSTANTS['deimos'].radiusM > 0
PASS BODY_CONSTANTS['jupiter'].radiusM > 0
PASS BODY_CONSTANTS['io'].radiusM > 0
PASS BODY_CONSTANTS['europa'].radiusM > 0
PASS BODY_CONSTANTS['ganymede'].radiusM > 0
PASS BODY_CONSTANTS['callisto'].radiusM > 0
PASS BODY_CONSTANTS['saturn'].radiusM > 0
PASS BODY_CONSTANTS['titan'].radiusM > 0
PASS BODY_CONSTANTS['rhea'].radiusM > 0
PASS BODY_CONSTANTS['iapetus'].radiusM > 0
PASS BODY_CONSTANTS['tethys'].radiusM > 0
PASS BODY_CONSTANTS['dione'].radiusM > 0
PASS BODY_CONSTANTS['mimas'].radiusM > 0
PASS BODY_CONSTANTS['enceladus'].radiusM > 0
PASS BODY_CONSTANTS['sun'].naifId > 0
PASS BODY_CONSTANTS['mercury'].naifId > 0
PASS BODY_CONSTANTS['venus'].naifId > 0
PASS BODY_CONSTANTS['earth'].naifId > 0
PASS BODY_CONSTANTS['moon'].naifId > 0
PASS BODY_CONSTANTS['mars'].naifId > 0
PASS BODY_CONSTANTS['phobos'].naifId > 0
PASS BODY_CONSTANTS['deimos'].naifId > 0
PASS BODY_CONSTANTS['jupiter'].naifId > 0
PASS BODY_CONSTANTS['io'].naifId > 0
PASS BODY_CONSTANTS['europa'].naifId > 0
PASS BODY_CONSTANTS['ganymede'].naifId > 0
PASS BODY_CONSTANTS['callisto'].naifId > 0
PASS BODY_CONSTANTS['saturn'].naifId > 0
PASS BODY_CONSTANTS['titan'].naifId > 0
PASS BODY_CONSTANTS['rhea'].naifId > 0
PASS BODY_CONSTANTS['iapetus'].naifId > 0
PASS BODY_CONSTANTS['tethys'].naifId > 0
PASS BODY_CONSTANTS['dione'].naifId > 0
PASS BODY_CONSTANTS['mimas'].naifId > 0
PASS BODY_CONSTANTS['enceladus'].naifId > 0
PASS BODY_CONSTANTS['sun'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mercury'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['venus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['earth'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['moon'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mars'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['phobos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['deimos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['jupiter'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['io'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['europa'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['ganymede'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['callisto'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['saturn'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['titan'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['rhea'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['iapetus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['tethys'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['dione'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mimas'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['enceladus'].vizColor in [0x000000, 0xFFFFFF]
PASS INV008_BARS_M has key 'sun'
PASS INV008_BARS_M has key 'mercury'
PASS INV008_BARS_M has key 'venus'
PASS INV008_BARS_M has key 'earth'
PASS INV008_BARS_M has key 'moon'
PASS INV008_BARS_M has key 'mars'
PASS INV008_BARS_M['sun'] > 0
PASS INV008_BARS_M['mercury'] > 0
PASS INV008_BARS_M['venus'] > 0
PASS INV008_BARS_M['earth'] > 0
PASS INV008_BARS_M['moon'] > 0
PASS INV008_BARS_M['mars'] > 0
PASS INV010_BARS_M has key 'saturn'
PASS INV010_BARS_M has key 'titan'
PASS INV010_BARS_M has key 'rhea'
PASS INV010_BARS_M has key 'iapetus'
PASS INV010_BARS_M has key 'tethys'
PASS INV010_BARS_M has key 'dione'
PASS INV010_BARS_M has key 'mimas'
PASS INV010_BARS_M has key 'enceladus'
PASS INV010_BARS_M['saturn'] > 0
PASS INV010_BARS_M['titan'] > 0
PASS INV010_BARS_M['rhea'] > 0
PASS INV010_BARS_M['iapetus'] > 0
PASS INV010_BARS_M['tethys'] > 0
PASS INV010_BARS_M['dione'] > 0
PASS INV010_BARS_M['mimas'] > 0
PASS INV010_BARS_M['enceladus'] > 0
PASS INV011_BARS_M has key 'phobos'
PASS INV011_BARS_M has key 'deimos'
PASS INV011_BARS_M['phobos'] > 0
PASS INV011_BARS_M['deimos'] > 0
PASS INTERPOLATION_ERROR_BARS_M has key 'sun'
PASS BODY_CADENCE_SECONDS has key 'sun'
PASS BODY_INTERPOLATION_INVARIANTS has key 'sun'
PASS INTERPOLATION_ERROR_BARS_M has key 'mercury'
PASS BODY_CADENCE_SECONDS has key 'mercury'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mercury'
PASS INTERPOLATION_ERROR_BARS_M has key 'venus'
PASS BODY_CADENCE_SECONDS has key 'venus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'venus'
PASS INTERPOLATION_ERROR_BARS_M has key 'earth'
PASS BODY_CADENCE_SECONDS has key 'earth'
PASS BODY_INTERPOLATION_INVARIANTS has key 'earth'
PASS INTERPOLATION_ERROR_BARS_M has key 'moon'
PASS BODY_CADENCE_SECONDS has key 'moon'
PASS BODY_INTERPOLATION_INVARIANTS has key 'moon'
PASS INTERPOLATION_ERROR_BARS_M has key 'mars'
PASS BODY_CADENCE_SECONDS has key 'mars'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mars'
PASS INTERPOLATION_ERROR_BARS_M has key 'phobos'
PASS BODY_CADENCE_SECONDS has key 'phobos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'phobos'
PASS INTERPOLATION_ERROR_BARS_M has key 'deimos'
PASS BODY_CADENCE_SECONDS has key 'deimos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'deimos'
PASS INTERPOLATION_ERROR_BARS_M has key 'jupiter'
PASS BODY_CADENCE_SECONDS has key 'jupiter'
PASS BODY_INTERPOLATION_INVARIANTS has key 'jupiter'
PASS INTERPOLATION_ERROR_BARS_M has key 'io'
PASS BODY_CADENCE_SECONDS has key 'io'
PASS BODY_INTERPOLATION_INVARIANTS has key 'io'
PASS INTERPOLATION_ERROR_BARS_M has key 'europa'
PASS BODY_CADENCE_SECONDS has key 'europa'
PASS BODY_INTERPOLATION_INVARIANTS has key 'europa'
PASS INTERPOLATION_ERROR_BARS_M has key 'ganymede'
PASS BODY_CADENCE_SECONDS has key 'ganymede'
PASS BODY_INTERPOLATION_INVARIANTS has key 'ganymede'
PASS INTERPOLATION_ERROR_BARS_M has key 'callisto'
PASS BODY_CADENCE_SECONDS has key 'callisto'
PASS BODY_INTERPOLATION_INVARIANTS has key 'callisto'
PASS INTERPOLATION_ERROR_BARS_M has key 'saturn'
PASS BODY_CADENCE_SECONDS has key 'saturn'
PASS BODY_INTERPOLATION_INVARIANTS has key 'saturn'
PASS INTERPOLATION_ERROR_BARS_M has key 'titan'
PASS BODY_CADENCE_SECONDS has key 'titan'
PASS BODY_INTERPOLATION_INVARIANTS has key 'titan'
PASS INTERPOLATION_ERROR_BARS_M has key 'rhea'
PASS BODY_CADENCE_SECONDS has key 'rhea'
PASS BODY_INTERPOLATION_INVARIANTS has key 'rhea'
PASS INTERPOLATION_ERROR_BARS_M has key 'iapetus'
PASS BODY_CADENCE_SECONDS has key 'iapetus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'iapetus'
PASS INTERPOLATION_ERROR_BARS_M has key 'tethys'
PASS BODY_CADENCE_SECONDS has key 'tethys'
PASS BODY_INTERPOLATION_INVARIANTS has key 'tethys'
PASS INTERPOLATION_ERROR_BARS_M has key 'dione'
PASS BODY_CADENCE_SECONDS has key 'dione'
PASS BODY_INTERPOLATION_INVARIANTS has key 'dione'
PASS INTERPOLATION_ERROR_BARS_M has key 'mimas'
PASS BODY_CADENCE_SECONDS has key 'mimas'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mimas'
PASS INTERPOLATION_ERROR_BARS_M has key 'enceladus'
PASS BODY_CADENCE_SECONDS has key 'enceladus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'enceladus'
PASS body-class tagging covers fixed bodies and asteroid ids
PASS BODY_CONSTANTS['jupiter'].naifId matches README
PASS BODY_CONSTANTS['jupiter'].radiusM matches README
PASS BODY_CONSTANTS['jupiter'].vizColor matches README
PASS BODY_CADENCE_SECONDS['jupiter'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['jupiter'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['jupiter'] matches Slice 3 invariant
PASS BODY_CONSTANTS['jupiter'].radiiM matches README triaxial values
PASS BODY_CONSTANTS['io'].naifId matches README
PASS BODY_CONSTANTS['io'].radiusM matches README
PASS BODY_CONSTANTS['io'].vizColor matches README
PASS BODY_CADENCE_SECONDS['io'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['io'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['io'] matches Slice 3 invariant
PASS BODY_CONSTANTS['europa'].naifId matches README
PASS BODY_CONSTANTS['europa'].radiusM matches README
PASS BODY_CONSTANTS['europa'].vizColor matches README
PASS BODY_CADENCE_SECONDS['europa'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['europa'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['europa'] matches Slice 3 invariant
PASS BODY_CONSTANTS['ganymede'].naifId matches README
PASS BODY_CONSTANTS['ganymede'].radiusM matches README
PASS BODY_CONSTANTS['ganymede'].vizColor matches README
PASS BODY_CADENCE_SECONDS['ganymede'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['ganymede'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['ganymede'] matches Slice 3 invariant
PASS BODY_CONSTANTS['callisto'].naifId matches README
PASS BODY_CONSTANTS['callisto'].radiusM matches README
PASS BODY_CONSTANTS['callisto'].vizColor matches README
PASS BODY_CADENCE_SECONDS['callisto'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['callisto'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['callisto'] matches Slice 3 invariant
PASS BODY_CONSTANTS['mars'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['mars'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['mars'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['mars'] matches Slice 6 invariant
PASS BODY_CONSTANTS['mars'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['phobos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['phobos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['phobos'] matches Slice 6 invariant
PASS INV011_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_CONSTANTS['phobos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['deimos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['deimos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['deimos'] matches Slice 6 invariant
PASS INV011_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_CONSTANTS['deimos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['saturn'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['saturn'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['saturn'] matches Slice 4 invariant
PASS INV010_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_CONSTANTS['saturn'].radiiM matches Slice 4 triaxial values
PASS BODY_CONSTANTS['titan'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['titan'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['titan'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['titan'] matches Slice 4 invariant
PASS INV010_BARS_M['titan'] matches Slice 4 bar
PASS BODY_CONSTANTS['rhea'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['rhea'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['rhea'] matches Slice 4 invariant
PASS INV010_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_CONSTANTS['iapetus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['iapetus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['iapetus'] matches Slice 4 invariant
PASS INV010_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_CONSTANTS['tethys'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['tethys'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['tethys'] matches Slice 4 invariant
PASS INV010_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_CONSTANTS['dione'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['dione'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['dione'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['dione'] matches Slice 4 invariant
PASS INV010_BARS_M['dione'] matches Slice 4 bar
PASS BODY_CONSTANTS['mimas'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['mimas'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['mimas'] matches Slice 4 invariant
PASS INV010_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_CONSTANTS['enceladus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['enceladus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['enceladus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['enceladus'] matches Slice 4 invariant
PASS INV010_BARS_M['enceladus'] matches Slice 4 bar
PASS SATURN_D_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_C_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_A_RING_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_HUYGENS_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_OUTER_RADIUS_M matches Slice 5 docs
PASS createAsteroidCatalogIndex ingests all 1008 asteroid records
PASS createAsteroidCatalogIndex identifies the 8 curated NEAs
PASS eccentricityBandForBody(0.0999) returns A
PASS eccentricityBandForBody(0.1) returns B
PASS eccentricityBandForBody(0.1999) returns B
PASS eccentricityBandForBody(0.2) returns C
PASS eccentricityBandForBody(0.2999) returns C
PASS eccentricityBandForBody(0.3) returns D
PASS hasOrbitLineForBody(10.97) returns true
PASS hasOrbitLineForBody(10.98) returns false
PASS hasOrbitLineForBody(10.99) returns false
PASS curated NEA designation 101955 remains flagged
PASS curated NEA designation 99942 remains flagged
PASS curated NEA designation 433 remains flagged
PASS curated NEA designation 25143 remains flagged
PASS curated NEA designation 162173 remains flagged
PASS curated NEA designation 4179 remains flagged
PASS curated NEA designation 1620 remains flagged
PASS curated NEA designation 4769 remains flagged
PASS asteroid lookup works by designation and SPK id for Bennu
PASS estimatedRadiusM matches the H-derived default-albedo formula for Bennu
PASS Slice 7 asteroid fixture entries can be extended with Slice 8 band and orbit-line metadata

All assertions passed.
✔ tests\v2-core-constants.test.mjs (2085.4546ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2091.8481
slice3MaxRoundTripError=0
slice3MaxChainTenError=0
✔ Slice 3 boundary ingestion tags Galileans as FRAME_JUPITER_J2000_ICRF (2366.866ms)
✔ Slice 3 HELIO ↔ JUPITER round-trip stays within one-pass and ten-chain bounds (29.0146ms)
✔ Slice 1 HELIO ↔ GCRS round-trip still works unchanged (4.8326ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2519.0003
slice6MarsMaxRoundTripError=0
slice6MarsMaxChainTenError=0
slice6MarsMoonMaxHelioRoundTripError=0
slice6MarsMoonMaxChainTenError=0
slice6MarsMoonMaxNativeRoundTripRelativeError=1.6947555828275902e-12
✔ Slice 6 HELIO ↔ MARS direct round-trip on Mars heliocentric states stays within bounds (2146.5163ms)
✔ Slice 6 HELIO ↔ MARS round-trip on interpolated Mars-centered moon states stays within bounds (28.3776ms)
✔ Slice 6 frame additions preserve GCRS, Jupiter, and Saturn paths (90.4487ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2356.5731
slice4SaturnMaxRoundTripError=0
slice4SaturnMaxChainTenError=0
slice4MoonMaxHelioRoundTripError=0
slice4MoonMaxChainTenError=0
slice4MoonMaxNativeRoundTripRelativeError=6.335544898437588e-13
✔ Slice 4 HELIO ↔ SATURN direct round-trip on Saturn heliocentric states stays within bounds (2025.7769ms)
✔ Slice 4 HELIO ↔ SATURN round-trip on interpolated Saturn-centered moon states stays within bounds (52.4209ms)
✔ Slice 4 frame additions preserve Jupiter and GCRS paths (29.3525ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2199.8237
slice3Hermite jupiter maxErrorKm=7.142806491701069 rmsErrorKm=4.199738159183813 barKm=50 checked=4319
slice3Hermite io maxErrorKm=0.5442963290723388 rmsErrorKm=0.33658103781622706 barKm=5 checked=8639
slice3Hermite europa maxErrorKm=4.50430937666286 rmsErrorKm=2.6736541902238957 barKm=20 checked=4319
slice3Hermite ganymede maxErrorKm=6.610468763880747 rmsErrorKm=4.127952978794724 barKm=20 checked=4319
slice3Hermite callisto maxErrorKm=7.016665103601909 rmsErrorKm=3.928974726508747 barKm=50 checked=4319
✔ Slice 3 Jupiter-system Hermite interpolation stays below INV-009 bars (2503.68ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2604.5495
slice6Hermite mars maxErrorKm=0.008932563975280729 rmsErrorKm=0.005288750696475446 barKm=0.05 checked=270
slice6Hermite phobos maxErrorKm=0.7787715830854933 rmsErrorKm=0.48601715486892844 barKm=5 checked=21600
slice6Hermite deimos maxErrorKm=0.11319505860637424 rmsErrorKm=0.08328683543873051 barKm=0.5 checked=6480
✔ Slice 6 Mars-system Hermite interpolation stays below INV-008/INV-011 bars with pre-research-matching error (2765.0994ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2879.3196
slice4Hermite saturn maxErrorKm=0.2023990147891148 rmsErrorKm=0.06964598071541636 barKm=1 checked=4319
slice4Hermite titan maxErrorKm=6.034245679338891 rmsErrorKm=3.150894748674291 barKm=20 checked=4319
slice4Hermite rhea maxErrorKm=1.2646108832459069 rmsErrorKm=0.7992468821770016 barKm=5 checked=4319
slice4Hermite iapetus maxErrorKm=0.6187833209615409 rmsErrorKm=0.25170364508742626 barKm=2 checked=4319
slice4Hermite tethys maxErrorKm=0.2843355703425951 rmsErrorKm=0.1812933392207793 barKm=1 checked=8639
slice4Hermite dione maxErrorKm=6.777691855843222 rmsErrorKm=4.24466979005391 barKm=50 checked=4319
slice4Hermite mimas maxErrorKm=3.3593358528420176 rmsErrorKm=1.8574590119921746 barKm=20 checked=8639
slice4Hermite enceladus maxErrorKm=0.8570913723667154 rmsErrorKm=0.5277623322167538 barKm=5 checked=8639
✔ Slice 4 Saturn-system Hermite interpolation stays below INV-010 bars (2723.9087ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2826.9624
PASS tsc compilation
PASS interpolate at t0 returns s0 position (rel err < 1e-9)
PASS interpolate at t1 returns s1 position (rel err < 1e-9)
PASS interpolate at midpoint returns finite position
PASS assertInterpolationError throws AssertError for Earth error 1000 m (> 500 m bar)
PASS Earth interpolation overflow routes to INV-008
PASS assertInterpolationError does not throw for Earth error 100 m (< 500 m bar)
PASS assertInterpolationError throws AssertError for Tethys error 1100 m (> 1 km bar)
PASS Tethys interpolation overflow routes to INV-010
PASS Tethys overflow includes bodyId detail
PASS Tethys overflow includes measuredErrorKm detail
PASS Tethys overflow includes barKm detail
PASS Tethys overflow includes cadence from constants
PASS assertInterpolationError does not throw in report mode for Enceladus overflow
PASS assertInterpolationError emits one report-mode violation for Enceladus overflow
PASS Report-mode Enceladus overflow routes to INV-010
PASS Report-mode Enceladus overflow includes bodyId detail
PASS Report-mode Enceladus overflow includes measuredErrorKm detail
PASS Report-mode Enceladus overflow includes barKm detail
PASS Report-mode Enceladus overflow includes tdbSeconds detail
PASS Report-mode Enceladus overflow includes cadence from constants
PASS assertInterpolationError throws AssertError for Phobos error 5100 m (> 5 km bar)
PASS Phobos interpolation overflow routes to INV-011
PASS Phobos overflow includes bodyId detail
PASS Phobos overflow includes measuredErrorKm detail
PASS Phobos overflow includes barKm detail
PASS Phobos overflow includes 30-minute cadence detail
PASS assertInterpolationError does not throw in report mode for Deimos overflow
PASS assertInterpolationError emits one report-mode violation for Deimos overflow
PASS Report-mode Deimos overflow routes to INV-011
PASS Report-mode Deimos overflow includes bodyId detail
PASS Report-mode Deimos overflow includes measuredErrorKm detail
PASS Report-mode Deimos overflow includes barKm detail
PASS Report-mode Deimos overflow includes tdbSeconds detail
PASS Report-mode Deimos overflow includes 1-hour cadence detail

All assertions passed.
✔ tests\v2-core-hermite.test.mjs (3985.5034ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3991.512
✔ propagateKeplerianStateVectors reproduces the fixture anchor state within one meter (1962.8283ms)
✔ forward 30d epoch shift then backward propagation returns to the initial state within one meter (3.9626ms)
✔ angular momentum and specific orbital energy remain conserved over 90 days (4.7851ms)
✔ high-e solver converges within the iteration cap (0.1535ms)
✔ production Keplerian port matches the round-2 Vesta day-90 research residual (5.1656ms)
✔ assertKeplerianError routes asteroid overflows to INV-012 (0.9424ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2090.9423
✔ Vesta orbit samples close cleanly at 64 segments (1839.6542ms)
✔ Apophis high-e orbit uses expected radius law across the sampled ellipse (5.3459ms)
✔ sampled orbit points satisfy the conic radius equation for Vesta (5.0817ms)
✔ sampled orbit vectors preserve the independently derived canonical orientation (4.2882ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1953.0502
✔ catalog and porkchop span labels derive full dates from their own parameters (4483.2099ms)
✔ catalog footer quotes the cache end and the porkchop grid end from their own constants (1854.6246ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6423.8601
✔ C3 formatting is owned by C3Value outside the pure formatter (36.5333ms)
✔ badge construction is owned by shared design components (23.4994ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 159.7551
✔ shared honesty components preserve the characterization fixture (2180.0481ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2291.754
✔ design tokens are deterministic and provenance-pinned (9.2143ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 141.6032
✔ DLA feasibility labels import the production view vocabulary (2360.6014ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2462.5499
(node:27356) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ DLA disclosure, site picker, and band legend render with contours off and on (14892.1952ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15024.1223
✔ tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning (1799.3943ms)
✔ tracking inside coverage mounts LIVE without a warning (1791.0944ms)
✔ outside coverage the HUD date line is marked clamped and Shift+N help tells the truth (1734.7967ms)
✔ coverage line gains a refresh-due notice in the last 14 days of coverage only (1756.2471ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7250.7805
✔ F2 characterization fixture records the HEAD honesty text across all three surfaces (0.8845ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.5544
✔ FK3 AMBER tour explains zero added Delta-V while RED still names dogleg (2004.5271ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2081.2932
✔ payloadAtC3 New Glenn/Standard C3=0 === 7180 kg (1.7088ms)
✔ payloadAtC3 New Glenn/Standard C3=5 === 6055 kg (0.1973ms)
✔ payloadAtC3 New Glenn/Standard C3=20 === 2365 kg (1.458ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=0 === 15010 kg (0.303ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=5 === 13677.5 kg (0.2347ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=20 === 10115 kg (0.203ms)
✔ payloadAtC3 Vulcan/VC6 C3=0 === 10850 kg (0.2385ms)
✔ payloadAtC3 Vulcan/VC6 C3=5 === 9990 kg (0.2163ms)
✔ payloadAtC3 Vulcan/VC6 C3=20 === 7630 kg (0.2443ms)
✔ deliveredMassKg New Glenn/Standard C3=5 one-way === 3494.511538898568 kg (0.6603ms)
✔ every launch-vehicle anchor carries a source-derived basis (0.2701ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 153.6342
✔ tests\v2-lambert\dla.test.mjs (1934.6902ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1940.7902
✔ tests\v2-lambert\feasibility.test.mjs (2017.4189ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2023.5933
householder.test: PASS
✔ tests\v2-lambert\householder.test.mjs (1981.2675ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1987.437
hyp2f1b.test: PASS
✔ tests\v2-lambert\hyp2f1b.test.mjs (1940.2453ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1950.0164
initial-guess.test: PASS
✔ tests\v2-lambert\initial-guess.test.mjs (1879.2375ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1884.8648
lambert-endtoend.test: PASS
✔ tests\v2-lambert\lambert-endtoend.test.mjs (1950.5002ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1956.7629
lambert-multi-rev-rejection.test: PASS
✔ tests\v2-lambert\lambert-multi-rev-rejection.test.mjs (2132.2447ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2145.0107
lambertMultiRev: no solution for M=1; T=0.5790023712295225 < T_min=4.403057492003494
lambertMultiRev: no solution for M=2; T=6.224170889575949 < T_min=7.768035471712736
lambertMultiRev: no solution for M=1; T=1.8936975346281286 < T_min=4.565433395618
lambertMultiRev: no solution for M=1; T=3.142611278377002 < T_min=4.589850624734614
lambertMultiRev: no solution for M=1; T=4.401579074102609 < T_min=4.711344422248995
lambertMultiRev: no solution for M=1; T=4.603344913728462 < T_min=4.73916181439084
lambertMultiRev: no solution for M=1; T=4.708577625250112 < T_min=4.754505056873685
lambertMultiRev: no solution for M=1; T=4.762318080262853 < T_min=4.762559475692091
lambertMultiRev: no solution for M=1; T=4.76252949463941 < T_min=4.762591453257581
lambertMultiRev: no solution for M=1; T=4.762582350055022 < T_min=4.762599448281306
lambertMultiRev: no solution for M=1; T=4.762595564022766 < T_min=4.7626014470767615
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambert-multi-rev.test: PASS
✔ tests\v2-lambert\lambert-multi-rev.test.mjs (3000.5602ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3006.9562
stumpff.test: PASS
✔ tests\v2-lambert\stumpff.test.mjs (2390.9205ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2396.5606
tof.test: PASS
✔ tests\v2-lambert\tof.test.mjs (2031.8091ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2039.8428
utc-to-tdb.test: PASS
✔ tests\v2-lambert\utc-to-tdb.test.mjs (1844.34ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1851.2133
vec3.test: PASS
✔ tests\v2-lambert\vec3.test.mjs (1805.8191ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1815.9532
✔ K4 light time uses Earth distance, two significant figures, and inherited tier caveats (1847.4817ms)
✔ K4 refuses every ruled invalid state without displaying a number (1929.6052ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3873.7932
✔ tests\v2-near-zero-c3.test.mjs (2063.0799ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2068.5853
✔ T3 Porkchop extremes and pinned readout flag, hide, and restore the same C3 source value (3797.3755ms)
✔ K7 pin callback publishes the newly pinned cell while replacement computation is pending (3613.3448ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7505.8995
(node:63676) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog disclosure renders plain-English public copy (2274.2082ms)
✔ About audit exhibits render plain-English titles and evidence labels (2384.7512ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4750.3182
✔ public disclosure sections render without internal taxonomy identifiers or duplicated trust numbers (1859.1714ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1947.4029
✔ construction distributes the Slice 8 catalog across the measured 1 AU cells (2289.1618ms)
✔ off-axis outer-system view culls some occupied cells (140.8419ms)
✔ focused close-zoom keeps visible cells in a small local neighborhood (128.0161ms)
✔ cells near the frustum edge stay visible across a +/-0.5 degree camera sweep (0.9457ms)
✔ raycastIntersectCells returns null for misses, hits the expected body, and reassigns across cells after position changes (4.8015ms)
✔ rendered instanced position matches the propagated world position used for focus truth (138.2488ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2852.0913
✔ orbit-batch geometry uses the expected concatenated vertex count (2070.7517ms)
✔ orbit-batch material matches the DEC-11 MVP line settings (31.2697ms)
✔ orbit-batch vertices for Vesta match the sampled ellipse positions (24.2052ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2226.1535
✔ asteroid points shader material constructs with additive soft-glow settings (2164.1922ms)
✔ ALIASED_POINT_SIZE_RANGE query falls back cleanly when no GL context exists (0.8147ms)
✔ per-point color attribute distinguishes curated NEAs from main-belt asteroids (5.4375ms)
✔ overview Vesta-sized points land in the tuned 4-8 px visibility band (2.5634ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2314.8594
✔ sub-pixel asteroid renders in Points mode (2212.5873ms)
✔ mid-zoom asteroid renders in InstancedMesh mode (3.8148ms)
✔ focused asteroid renders in individual Mesh mode when resolved (2.0146ms)
✔ hysteresis keeps a near-threshold asteroid stable around 1.7 px (0.1953ms)
✔ Points, InstancedMesh, and focused Mesh agree on world position (3.1002ms)
✔ focused asteroid gets a highlighted orbit while the main orbit batch stays visible in browse-scale focus (1.3619ms)
✔ main orbit batch fades out when the focused asteroid reaches close-inspection mesh mode (0.6799ms)
✔ main orbit batch excludes asteroids below the hasOrbitLine threshold while focused orbit highlight still works (0.8539ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2341.3704
✔ halo opacity stays at full base opacity below the full-visibility threshold (1918.6439ms)
✔ halo opacity fades linearly through the hysteresis transition zone (0.2122ms)
✔ halo opacity reaches zero at and above the invisible threshold (0.097ms)
✔ Saturn moon halo floors vary by moon size with Titan at least 3x Mimas (0.1336ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2013.0687
✔ Jupiter oblate mesh extents match documented radii (1942.6289ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2031.6867
✔ Mars oblate mesh extents match documented radii (1993.1244ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2090.7597
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:26220) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phobos rendered world position equals its heliocentric focus anchor (3209.8044ms)
✔ Deimos rendered world position equals its heliocentric focus anchor (57.5151ms)
✔ Mars body mesh receives the documented render-only tilt (73.6173ms)
✔ Mars moons do not inherit the render-only tilt (61.0907ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3502.6826
✔ Saturn oblate mesh extents match documented radii (2117.2319ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2222.9792
✔ Saturn ring local plane stays on XZ with +Y normals (2011.7674ms)
✔ Saturn main ring and Cassini geometry radii match spec (8.6251ms)
✔ Saturn ring opacity sampling preserves D/C/B/A ordering (0.2174ms)
✔ Saturn Cassini opacity peaks at the division center (0.1174ms)
✔ Saturn ring texture preserves multiple radial alpha levels (4.7808ms)
✔ Saturn ring substructure adds seven named sibling meshes under saturn-rings (4.0072ms)
✔ Saturn ring substructure radii match Slice 5 constants (3.4933ms)
✔ Saturn ring substructure renderOrder keeps gaps below ringlets and preserves Slice 4 meshes (2.9125ms)
✔ Saturn ring substructure preserves child ordering in inner-radius sequence (2.4966ms)
✔ Saturn Roche Division uses a fading texture rather than a flat-opacity band (4.7858ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2168.4866
✔ Vesta and Bennu anchor positions land in the measured 1 AU cells (2165.6528ms)
✔ cellBoundsKmForIndex returns a 1 AU box anchored to the configured grid (0.3397ms)
✔ positions outside the ±28 AU cube return null (0.1052ms)
✔ cellIndexForPositionKm round-trips into a containing cell bounds box (54.842ms)
✔ iterateAllPossibleCells covers the full 56x56x56 grid (24.6908ms)
✔ Slice 8 fixture occupies the measured ~178 cells at 1 AU resolution (46.9937ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2388.7954
✔ catalog binary loads without error and advertises the expected header (19.2505ms)
✔ star count is in the expected runtime range (14.817ms)
✔ Sirius is the brightest record and lands at the expected direction (10.5993ms)
✔ Polaris is present near the north celestial pole direction (11.3044ms)
✔ color values stay within [0, 1] for all records (12.8274ms)
✔ INV-014: at least 99% of star directions are unit-length within float32 tolerance (13.9949ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 173.3927
✔ constructor builds THREE.Points geometry with expected star attributes (2068.6866ms)
✔ INV-014 spot-check: Polaris direction in geometry matches the parsed catalog (4.2564ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2163.8805
✔ canonical bodyId and bare designation resolve to the same catalog body (2527.3801ms)
✔ unknown identifiers resolve to undefined — never a fallback body (99.9612ms)
✔ designations are unique across the whole catalog, so the fallback is unambiguous (43.5754ms)
✔ sampled equivalence across the catalog: designation lookup lands on the body with that id (1366.1387ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4198.1561
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:36532) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ pressing t resolves to the top-down preset with the expected final orbit state (2915.7051ms)
✔ camera tween locks controls during animation and releases them on completion (0.2357ms)
✔ existing regression shortcuts remain intact; Titan focus is on k, and t stays with the top-down preset (2.9053ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3011.9761
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-date-hud.test.mjs:51:34) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:55072) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ date HUD label formats TDB seconds into a readable date string (3175.1106ms)
✔ date HUD text updates from the current simulated TDB time (0.3132ms)
✔ runtime creates and removes the date HUD element symmetrically (0.3874ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3279.2756
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-display-integrity.test.mjs:50:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:25720) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ sun light fallback preserves true mesh anchor while keeping a stable fallback direction (2935.2648ms)
✔ viewport sizing falls back cleanly when mount rect is empty (0.1611ms)
✔ keyboard shortcut guard ignores editable targets and accepts canvas-like targets (0.1352ms)
✔ solar runtime source wires display integrity guards into the live interaction path (2.7753ms)
✔ inner and earth-moon runtimes mirror the corrected display patterns (2.9374ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3048.3339
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-focus.test.mjs:51:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:31184) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ focus from overview snaps to the target default radius (2982.5213ms)
✔ cross-body focus snaps to the new target default radius (0.3464ms)
✔ re-focusing the same body preserves the current zoom radius (0.235ms)
✔ asteroid focus uses the documented non-edge-on polar default (0.5396ms)
✔ asteroid focus radius uses the honest-scale default radius rule (0.4339ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3084.3106
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-hover-tooltips.test.mjs:52:40) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:27376) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ hover tooltip helper shows Earth text and hides on empty state (3534.7601ms)
✔ world-position projection maps screen center correctly (1.2763ms)
✔ hoverable bodies stay limited to the planet set through Saturn (1.4612ms)
✔ runtime wires the hover tooltip element, planet-only raycast path, and cleanup (0.4782ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3670.4676
✔ empty grid: no components, NO-PRACTICAL-WINDOW, relative threshold is Infinity (2017.1992ms)
✔ all cells below T: one component spanning the whole grid (1.0442ms)
✔ a non-converged hole splits a would-be single component (0.3209ms)
✔ tie exactly at T is included (c3 <= T, DEC-17-1) (0.1761ms)
✔ single-cell component exists in components but not in practical (B_min=2) (0.1567ms)
✔ grid of only singletons: NO-PRACTICAL-WINDOW (synthetic 163693 shape) (0.1973ms)
✔ diagonal-only adjacency joins under conn8 (0.1346ms)
✔ null-c3 cell is a hole even when flagged converged (0.1283ms)
✔ liveGridMin excludes non-converged and non-finite cells from the relative threshold (0.1545ms)
✔ all-Infinity converged grid under relative mode has no members (not a garbage component) (0.2345ms)
✔ argmin and derived outputs from a real segmentation run (0.3364ms)
✔ classifyComponents finds the true minimum on unsorted input (DEC-17-3) (0.108ms)
✔ threshold resolution: relative = liveMin + delta; absolute ignores liveMin (0.1466ms)
✔ conn4 is not implemented and throws; malformed grid shape throws (0.2175ms)
✔ property: random grids — component minima bound, practical subset, sort, cell conservation (1.3447ms)
✔ artifact 433 @min+5 conn8: threshold, derivation rules, B_min classification (0.1283ms)
✔ artifact 163693 @min+5 conn8: NO-PRACTICAL-WINDOW (0.0635ms)
✔ artifact 99942 @min+2 conn8: 4 practical of 12, best = global min component (0.089ms)
✔ artifact derivation rules: breadthCells/breadthDays/tofSpanDays are cell multiples (0.1178ms)
✔ artifact cross-check: pasted constants match the committed artifact, read at runtime (2.3683ms)
✔ artifact sort order restores under the module comparator (0.1806ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2120.6676
(node:54884) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ the shortcut overlay names middle-drag pan and compare renders its M=0 method (2629.0356ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2749.8301
✔ Slice 1 pure-Node cutover harness clears the numeric bar at fixture truth timesteps (2038.7844ms)
ℹ validatedSampleCount=121
ℹ maxEarthErrorKm=0
ℹ maxMoonErrorKm=0
ℹ maxRoundTripError=7.6457577540892395e-25
ℹ maxChainTenError=7.6457577540892395e-25
ℹ INV-005 not exercised: Slice 1 validates fixture truth timesteps without a propagator by contract
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2121.797
✔ Slice 1 Horizons fixture exists with Earth and Moon 30-day samples (2.4128ms)
✔ Slice 1 boundary ingress produces canonical heliocentric Earth/Moon states (2430.9099ms)
✔ Slice 1 core frame transform round-trip holds against the Earth anchor fixture (4.172ms)
✔ Slice 1 render path subtracts in f64 and only downcasts camera-relative values (3.2865ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2536.3938
Compiling v2 core and boundary...
PASS tsc compilation

PASS INV-008 sun     max_err=3.541e-6 km  bar=0.00002 km  (270 pts checked)
PASS INV-008 mercury max_err=2.005e+1 km  bar=100 km  (270 pts checked)
PASS INV-008 venus   max_err=1.819e-1 km  bar=1 km  (270 pts checked)
PASS INV-008 earth   max_err=9.069e-2 km  bar=0.5 km  (270 pts checked)
PASS INV-008 moon    max_err=4.977e+0 km  bar=20 km  (270 pts checked)
PASS INV-008 mars    max_err=8.933e-3 km  bar=0.05 km  (270 pts checked)

All six INV-008 cutover bars cleared. Phase C is UNBLOCKED.
✔ tests\v2-slice2-cutover.test.mjs (2116.3869ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2121.7677
Compiling v2 core and boundary for Slice 3 cutover...
PASS tsc compilation

PASS INV-009 jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
PASS INV-009 io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
PASS INV-009 europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
PASS INV-009 ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
PASS INV-009 callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 per-body interpolation summary:
  jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
  io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
  europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
  ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
  callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 3 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice3-cutover.test.mjs (3977.675ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3984.1857
Compiling v2 core and boundary for Slice 4 cutover...
PASS tsc compilation

PASS INV-010 saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
PASS INV-010 titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
PASS INV-010 rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
PASS INV-010 iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
PASS INV-010 tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
PASS INV-010 dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
PASS INV-010 mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
PASS INV-010 enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 per-body interpolation summary:
  saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
  titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
  rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
  iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
  tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
  dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
  mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
  enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 4 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice4-cutover.test.mjs (4489.4786ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4495.6772
Compiling Saturn runtime and ring helpers for Slice 5 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
PASS Slice 5 ring substructure meshes exist under saturn-rings
PASS renderOrder discipline preserved: baseline default, overlays explicit
PASS A ring outer radius matches exact 136,770 km PDS value
PASS Saturn default focus orbit stays non-edge-on (polar=1.047198 rad, view-normal angle=63.469 deg)
PASS Slice 4 Saturn moon cutover criteria remain green under Slice 5 regression gate
(node:22136) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice5-cutover.test.mjs (3349.9859ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3355.9206
Compiling v2 core and boundary for Slice 6 cutover...
PASS tsc compilation

PASS INV-008 mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
PASS INV-011 phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
PASS INV-011 deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 per-body interpolation summary:
  mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
  phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
  deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 6 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice6-cutover.test.mjs (7313.7224ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7320.2968
Compiling v2 core and boundary for Slice 7 cutover...
PASS tsc compilation

PASS INV-012 10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
PASS INV-012 16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
PASS INV-012 39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
PASS INV-012 40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
PASS INV-012 1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
PASS INV-012 1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
PASS INV-012 4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
PASS INV-012 15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
PASS INV-012 101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
PASS INV-012 162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
PASS INV-012 3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
PASS INV-012 2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
PASS INV-012 1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
PASS INV-012 433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
PASS INV-012 4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
PASS INV-012 4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
PASS INV-012 25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
PASS INV-012 99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 per-body propagation summary:
  10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
  16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
  39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
  40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
  1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
  1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
  4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
  15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
  101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
  162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
  3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
  2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
  1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
  433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
  4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
  4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
  25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
  99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice7-cutover.test.mjs (2359.8959ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2366.9199
Compiling v2 core and boundary for Slice 8 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 3) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}

Slice 8 per-band cutover summary:
  A count=50 max=23147.749445 km bar=35612.872326 km rms=3582.231183 km
  B count=50 max=49114.205128 km bar=52970.091742 km rms=4790.752314 km
  C count=50 max=31804.196407 km bar=37688.076110 km rms=3922.950118 km
  D count=50 max=29163.667462 km bar=43757.549716 km rms=4119.658435 km

Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.
(node:67136) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice8-cutover.test.mjs (3777.8169ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3786.0685
[slice8-performance] outer-system-overview bodies=10008 occupiedCells=178 visibleCells=72 visibleBodies=4234 estimatedGpuDrawCount=72 visibleSlice7RegressionBodies=9
[slice8-performance] asteroid-belt-focus bodies=10008 occupiedCells=178 visibleCells=55 visibleBodies=3126 estimatedGpuDrawCount=55 visibleSlice7RegressionBodies=3
[slice8-performance] focused-vesta-close-zoom bodies=10008 occupiedCells=178 visibleCells=14 visibleBodies=1084 estimatedGpuDrawCount=14 visibleSlice7RegressionBodies=1
✔ Slice 8 cell culling architecture produces sane visibility counts across key camera scenarios (2339.4896ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2454.0427
﹣ Slice 9 Phase A.3 three-gate cutover harness validates the committed contract and documents residual envelope exceedance (0.5016ms) # RETIRED 2026-07-12: fixture slice9-cutover-sample.json was never committed (.gitignore:17), unrecoverable, no generator. Expected values 26/58/66/61 were measured from the lost sample; a regenerated sample would reset them while faking continuity. See SLICE_9_FOUNDING.md amendment.
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 87.9764
✔ slice9 runtime normalization preserves finite render-critical asteroid fields (1995.7748ms)
✔ solar-system runtime is wired to the Slice 9 live catalog and Phase B canonical pipeline (2.7696ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2093.053
✔ Slice 9 perf config exposes the committed four partition modes and four camera states (0.5892ms)
✔ Slice 9 perf session rows format the observable measurement contract cleanly (0.2445ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.3951
✔ Slice 9 A.2b re-anchor recomputes derived fields after replacing elements (284.3634ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 391.539
▶ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components
  ✔ Partition correctness holds for uniform 0.5 AU and all hybrid candidates (29.4779ms)
  ✔ Hybrid structural validity holds for all candidate density triggers (16.5615ms)
  ✔ Body conservation holds across re-partition after time scrub (298.9293ms)
  ✔ Occupancy reproduction at 0.5 AU remains within the committed tolerance band (0.4461ms)
  ✔ Propagation CPU-time measurements report main-thread and worker-thread components without inferring frame budget (317.5679ms)
✔ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components (4013.2455ms)
ℹ Slice 9 uniform 0.5 AU occupancy: occupied=2060 baseline=2060 drift=0.00% maxBodies=1178 baselineMax=1177 drift=0.08%
ℹ Slice 9 propagation CPU-only timing: main median=12.336ms p95=23.295ms; worker roundtrip median=13.973ms p95=144.292ms; worker compute median=13.607ms p95=23.754ms; fallback bodies=1
ℹ Slice 9 offline propagation fallback bodies: 1 (2015 D1 [JFC])
ℹ Slice 9 hybrid summaries: D=200 coarse=544 subCells=2375 leafCells=2876 maxLeaf=266; D=500 coarse=544 subCells=1171 leafCells=1696 maxLeaf=473; D=1000 coarse=544 subCells=749 leafCells=1281 maxLeaf=810
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4172.8195
✔ symmetric-return disclosure is derived from the committed six-row artifact (120.518ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 226.9068
✔ the seven representative bodies render their sentences verbatim from the committed artifact (2013.8655ms)
✔ structurally blind splits by cause: 206 comets + 482 Jupiter-crossing = 688, each with its own sentence (338.0449ms)
✔ every one of the 41,906 bodies has a full sentence — no value is missing from committed data (28.3152ms)
✔ L1: the max-drift date traces to dv-scope-per-body.json, and the boundary is the EARLIEST material encounter, recomputed from the CAD snapshot (469.0374ms)
✔ impactor dates and the 3D drift trace to the truth fixture and nea-drift-results.json (43.4052ms)
✔ formatters: dates, million-km, m/s, AU — and no value is invented from junk (0.3054ms)
✔ a record missing its value yields null (omit), never a sentence with a hole (0.2133ms)
✔ L2 disclosure distinguishes a measured-but-unbounded body from an unmeasured body (8.8829ms)
✔ threshold provenance is verbatim and rides with every mention of 10^6 km; legend has one line per key (0.224ms)
✔ short labels never expose a slug (17.785ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3075.0482
(node:24916) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog tier legend renders both L2 disclosure phrases from the shared source (2305.1059ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2395.0593
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:77:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:83:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794869676002-0.24134301951871218:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794869676002-0.24134301951871218:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:340:29
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794869678844-0.027528835568201737:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794869678844-0.027528835568201737:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:374:29
}
(node:22612) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phase C overlay mounts with real Preact, reflects store subscriptions, and cleans up (2738.618ms)
✔ Phase C overlay converges through repeated store updates with finite fake-DOM layout metrics (2743.8532ms)
✔ runtime wires the Phase C.1 overlay mount and focus-request bridge without changing scene ownership (0.7021ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5582.819
(node:56816) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ ui store initial state matches the documented Phase C.1 defaults (2065.9462ms)
✔ ui store action functions update the state they claim to own (2076.9191ms)
✔ ui store readonly signals reflect dispatched state updates (2139.3272ms)
✔ focusRequestId increments monotonically on requestFocus() (2018.6449ms)
✔ focus-request subscription only fires when requestFocus increments (2285.3089ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10684.6392
✔ validation provenance scopes strict and observed payload figures and preserves magnitude-only wording (2.4871ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.4011

================ FINAL SUMMARY ================
files discovered:    111
files passed:        111
files failed:        0
files LOAD-TIMEOUT:  0
tests passed:        369
tests failed:        0
wall clock:          331.4s
accounting:          111 == 111 + 0 + 0 OK
Baseline npm run verify exit: 0
Finished: 2026-11-16T17:54:49.8651174-05:00

## Step 2 npm run verify
Started: 2026-11-16T17:56:11.3228739-05:00

> aster@0.1.0 verify
> npm run typecheck:v2 && npm run test:all


> aster@0.1.0 typecheck:v2
> tsc --noEmit


> aster@0.1.0 test:all
> node tools/run-tests.mjs

Discovered 111 test files (per-file watchdog: 180000 ms):
src\v2\app\catalog-list\row.test.mjs
src\v2\boundary\c3-grid.test.mjs
src\v2\porkchop\colormap.test.mjs
src\v2\porkchop\composite-grid.test.mjs
src\v2\porkchop\delta-v.test.mjs
src\v2\porkchop\dual-m-compute.test.mjs
src\v2\porkchop\grid-compute.test.mjs
src\v2\porkchop\launch-vehicles.test.mjs
src\v2\porkchop\propagation-guard.test.mjs
src\v2\porkchop\support-boundary.test.mjs
tests\phase6-contract-smoke.test.mjs
tests\setup-hooks.test.mjs
tests\v2-a11y-floor.test.mjs
tests\v2-about-copy.test.mjs
tests\v2-about-evidence.test.mjs
tests\v2-architecture.test.mjs
tests\v2-boundary-horizons.test.mjs
tests\v2-boundary-slice2.test.mjs
tests\v2-boundary-slice4.test.mjs
tests\v2-boundary-slice6.test.mjs
tests\v2-boundary-slice7.test.mjs
tests\v2-boundary-slice8.test.mjs
tests\v2-boundary-slice9.test.mjs
tests\v2-boundary-star-catalog.test.mjs
tests\v2-c3-value-type.test.mjs
tests\v2-catalog-count-binding.test.mjs
tests\v2-catalog-empty.test.mjs
tests\v2-catalog-threshold-disclosure.test.mjs
tests\v2-compare-data.test.mjs
tests\v2-compare-honesty.test.mjs
tests\v2-compare-url.test.mjs
tests\v2-coorbital-disclosure.test.mjs
tests\v2-core-constants.test.mjs
tests\v2-core-frames-jupiter.test.mjs
tests\v2-core-frames-mars.test.mjs
tests\v2-core-frames-saturn.test.mjs
tests\v2-core-hermite-jupiter.test.mjs
tests\v2-core-hermite-mars.test.mjs
tests\v2-core-hermite-saturn.test.mjs
tests\v2-core-hermite.test.mjs
tests\v2-core-keplerian.test.mjs
tests\v2-core-orbit-sampling.test.mjs
tests\v2-derived-span-labels.test.mjs
tests\v2-design-architecture.test.mjs
tests\v2-design-components.test.mjs
tests\v2-design-tokens.test.mjs
tests\v2-dla-display.test.mjs
tests\v2-dla-render.test.mjs
tests\v2-ephemeris-hud.test.mjs
tests\v2-f2-characterization.test.mjs
tests\v2-fk3-guided-tour.test.mjs
tests\v2-golden\launch-vehicles.golden.test.mjs
tests\v2-lambert\dla.test.mjs
tests\v2-lambert\feasibility.test.mjs
tests\v2-lambert\householder.test.mjs
tests\v2-lambert\hyp2f1b.test.mjs
tests\v2-lambert\initial-guess.test.mjs
tests\v2-lambert\lambert-endtoend.test.mjs
tests\v2-lambert\lambert-multi-rev-rejection.test.mjs
tests\v2-lambert\lambert-multi-rev.test.mjs
tests\v2-lambert\stumpff.test.mjs
tests\v2-lambert\tof.test.mjs
tests\v2-lambert\utc-to-tdb.test.mjs
tests\v2-lambert\vec3.test.mjs
tests\v2-light-time.test.mjs
tests\v2-near-zero-c3.test.mjs
tests\v2-porkchop-honesty.test.mjs
tests\v2-public-copy-render.test.mjs
tests\v2-public-copy.test.mjs
tests\v2-render-asteroid-cell-renderer.test.mjs
tests\v2-render-asteroid-orbits.test.mjs
tests\v2-render-asteroid-points-shader.test.mjs
tests\v2-render-asteroid-renderer.test.mjs
tests\v2-render-halos.test.mjs
tests\v2-render-jupiter-oblate.test.mjs
tests\v2-render-mars-oblate.test.mjs
tests\v2-render-mars-system.test.mjs
tests\v2-render-saturn-oblate.test.mjs
tests\v2-render-saturn-rings.test.mjs
tests\v2-render-spatial-grid.test.mjs
tests\v2-render-star-catalog.test.mjs
tests\v2-render-star-renderer.test.mjs
tests\v2-resolve-catalog-body.test.mjs
tests\v2-runtime-camera-presets.test.mjs
tests\v2-runtime-date-hud.test.mjs
tests\v2-runtime-display-integrity.test.mjs
tests\v2-runtime-focus.test.mjs
tests\v2-runtime-hover-tooltips.test.mjs
tests\v2-segment-windows.test.mjs
tests\v2-shortcut-and-method.test.mjs
tests\v2-slice1-cutover.test.mjs
tests\v2-slice1-integration.test.mjs
tests\v2-slice2-cutover.test.mjs
tests\v2-slice3-cutover.test.mjs
tests\v2-slice4-cutover.test.mjs
tests\v2-slice5-cutover.test.mjs
tests\v2-slice6-cutover.test.mjs
tests\v2-slice7-cutover.test.mjs
tests\v2-slice8-cutover.test.mjs
tests\v2-slice8-performance.test.mjs
tests\v2-slice9-cutover.test.mjs
tests\v2-slice9-live-runtime-integration.test.mjs
tests\v2-slice9-perf-config.test.mjs
tests\v2-slice9-reanchor-derived.test.mjs
tests\v2-slice9-spatial-index-harness.test.mjs
tests\v2-symmetric-return.test.mjs
tests\v2-tier-disclosure.test.mjs
tests\v2-tier-legend-render.test.mjs
tests\v2-ui-overlay.test.mjs
tests\v2-ui-store.test.mjs
tests\v2-validation-provenance.test.mjs

(node:35016) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ 2018 LA (L0, verified impact): LOW C3 badge suppressed; C3 kept with the last-known-orbit context (2810.6566ms)
✔ 2015 D1 (L0, hyperbolic): "—" stays, PROP FAIL badge stays, no context is invented for a null C3 (0.2913ms)
✔ non-L0 rows are untouched: 433 (L2) and 99942 (L1) keep their badge and plain C3 (0.3332ms)
✔ near-zero C3 is a separate geometry flag and coexists with the screening status badge (0.4068ms)
✔ near-zero catalog disclosure remains byte-identical to the approved wording (0.1885ms)
✔ near-zero hide state replaces only the rendered value and badge, preserving the low-C3 badge and source value (0.1789ms)
✔ S18 Item 5: the tier badge tooltip is the full disclosure sentence, never the slug (0.3853ms)
✔ the rule is exactly {L0} x {low, high}: every other tier/status combination renders its badge (0.3616ms)
✔ catalog C3 grid label is derived from cache metadata and its tooltip carries the full grid details (0.2223ms)
✔ CK-12 catalog C3 uses the shared three-significant-figure rule across its display range (0.2835ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2923.4415
✔ cached C3 grid descriptor and short label derive from cache metadata (2166.5062ms)
✔ requested C3 grid descriptor changes with the scan arguments (1827.2709ms)
✔ porkchop grid dimension wording is derived rather than literal (1862.9442ms)
✔ T5 formatter output changes with its grid parameters (2023.6148ms)
✔ shared C3 grid label derives common step units from axis parameters (1741.6544ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9708.5885
✔ c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling (1829.6111ms)
✔ c3ToViridisRgb uses monotonic log normalization with a hard floor at C3 <= 1 (1863.5614ms)
✔ colorForPorkchopCell uses sentinel colors for no_solution and stall (1991.3597ms)
✔ non-finite C3 values use the existing no-solution colour (1826.3138ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7623.4843
✔ both families solve: strictly lower C3 wins (1810.6154ms)
✔ exact tie goes to M=0 and is counted (0.1714ms)
✔ only one family solves: that family is taken — the measured defect (0.135ms)
✔ neither solves: no_solution, but a stall is never collapsed (SLICE_11_FOUNDING.md:207) (0.138ms)
✔ composite minimum is never worse than either single-family minimum (0.2569ms)
✔ per-cell provenance: every ok cell carries the M that produced it (0.1026ms)
✔ AMD-2: the compared C3 is the selected branch, not branch 0 (0.2025ms)
✔ misaligned or mismatched grids throw rather than mis-pair cells (0.3538ms)
✔ counts account for every cell exactly once (0.1291ms)
✔ gridExtremes: both extremes on a normal grid (0.2458ms)
✔ gridExtremes: no_solution and stall cells are excluded (0.1198ms)
✔ gridExtremes: zero solvable cells returns an explicit empty variant (0.09ms)
✔ gridExtremes: ties resolve to the lowest array index, for both extremes (0.1136ms)
✔ gridExtremes: over a composite grid whose extremes come from different families (0.2524ms)
✔ composite never exceeds M=0 per-cell wherever M=0 solves (structural — catches selection inversion) (0.1032ms)
✔ composite max <= M=0 max WHEN M=0 coverage is a superset (onlyM1 === 0) (0.1449ms)
✔ the superset precondition is real: with onlyM1 > 0 the composite max CAN exceed M=0 max (0.1203ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1896.3987
✔ ΔV stack is mode-aware: one-way omits departure and sample return uses symmetric-return assumption (1929.9464ms)
✔ D10 labels name margin bases and preserve the displayed value expressions (2.8214ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2058.0927
✔ computeDualFamilyGrids issues exactly two messages, M=0 then M=1 (AMD-1) (2199.0011ms)
✔ computeDualFamilyGrids awaits sequentially — never two computes in flight (0.1508ms)
✔ computeDualFamilyGrids carries the request through unchanged, one M per message (0.3675ms)
✔ computeDualFamilyGrids returns both grids keyed by family (0.1447ms)
✔ computeDualFamilyGrids propagates a failure from either family unchanged (0.7206ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2302.4066
lambertMultiRev: no solution for M=1; T=0.579002371229731 < T_min=4.4030574920032794
✔ computePorkchopGrid round-trips three validated M=1 cells through JD+days boundary across the regime (2965.6879ms)
✔ computePorkchopGrid maps below-T_min cells to no_solution (1.1705ms)
✔ computePorkchopGrid selects the lower-C3 branch when both M=1 branches converge (0.7037ms)
✔ computePorkchopGrid maps all-failed synthetic solver output to stall (0.8052ms)
✔ porkchop worker init bootstraps Earth state and strips velocity internals from outbound branches (0.5706ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3112.3123
✔ launch vehicle catalog matches locked DEC-13-1 anchors exactly (2025.1296ms)
✔ payloadAtC3 interpolates linearly between published anchors (0.2946ms)
✔ payloadAtC3 never extrapolates past short published curves (0.2309ms)
✔ New Glenn keeps C3=30 anchor, interpolates steep interior, and stops after it (0.217ms)
✔ payloadAtC3 refuses non-finite C3 separately from beyond-curve inputs (0.226ms)
✔ deliveredMassKg excludes injection by construction and applies mode departure only for sample return (0.5314ms)
✔ spacecraft budget total is mode-owned and preserves every supplied term (0.2673ms)
✔ deliveredMassKg rejects corrupted budgets and invalid modes with INVALID_INPUT, never BEYOND_CURVE or a number (0.319ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2127.6414
✔ guard agrees with the propagator on every catalog body (verified by propagating, not by reading the guard) (3027.8889ms)
✔ 2015 D1: the verdict carries the catalog eccentricity and the verbatim sentence (0.4644ms)
✔ message rounds the eccentricity to 4 decimals and invents nothing for a non-finite one (0.1642ms)
✔ computeCompareData: 2015 D1 is refused as a value in place; 433 and 2018 LA are byte-identical to the historical path (4.2362ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3161.3064
✔ 99942: the boundary comes from the committed artifact, and the partition matches the per-column formulation (2005.5617ms)
✔ edge behaviour: an encounter before the window makes every cell unsupported; after the last arrival, none (5.3063ms)
✔ no boundary is invented: non-L1 tiers and records without an encounter yield undefined (14.5392ms)
✔ the unsupported-cell sentence is verbatim (0.2199ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2139.6224
✔ all texture assets referenced by legacy/index.html exist on disk (5.5038ms)
✔ legacy entry is frozen, noindexed, and points visitors to V2 (2.235ms)
✔ worker README documents the worker routes implemented in worker/index.js (46.8594ms)
✔ worker README documents all environment variables used by worker/index.js (1.9364ms)
✔ worker README documents wildcard localhost development origin support (0.7047ms)
✔ physics worker no longer hardcodes NHATS and Asterank production route URLs (1.5968ms)
✔ .gitignore covers local worker secrets and wrangler state (0.8675ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 144.5167
✔ prepare hook installer is silent and successful outside a git worktree (137.3329ms)
✔ prepare hook installer configures hooksPath inside a git worktree (350.1605ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 600.502
(node:3712) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ contrast utility matches WCAG reference pairs and the three lightness overrides (1985.4754ms)
✔ catalog row is keyboard-focusable and Enter activates the same handler as click (2200.1348ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4284.5821
✔ About decision record carries no emoji (tail2 F7) (2782.6098ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2894.4952
✔ About evidence links use rendered audit-copy VNodes and real heading fragments (1919.8241ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2013.2277
✔ src/v2 sources do not import internal modules outside src/v2 (71.7386ms)
✔ C3 grid label sites use derived formatters and contain no literal dimension labels (3.7305ms)
✔ INV-026 departure-end date is owned by grid-span.ts (50.5156ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 220.613
✔ jdTdbToSecondsSinceJ2000 converts J2000-relative TDB days into seconds (2192.0709ms)
✔ Slice 1 Earth/Moon fixture ingests into canonical meters, m/s, and aligned TDB seconds (9.2232ms)
✔ convertHorizonsRecord accepts object-form records with Horizons-native aliases (0.9727ms)
✔ convertHorizonsRecord rotates ecliptic J2000 vectors into canonical ICRF coordinates (0.2603ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2339.7138
✔ Slice 2 fixture file exists and parses as valid JSON (4.2606ms)
✔ Slice 2 fixture contains all six required target keys (2.3099ms)
✔ Each body in Slice 2 fixture has 90-92 records (91 ± 1) (6.8711ms)
✔ Moon records after ingestion have frame matching FRAME_GCRS_EARTH (2256.7849ms)
✔ All non-Moon bodies after ingestion have frame matching FRAME_HELIO_J2000_ICRF (6.0716ms)
✔ First Earth record position magnitude in meters is between 1.48e11 and 1.52e11 (~1 AU) (6.2274ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2384.8928
✔ Slice 4 fixture contains all eight required target keys (9.5889ms)
✔ Slice 4 fixture origin tags match heliocentric Saturn and saturn-centered moons (12.9877ms)
✔ inferCanonicalFrame maps saturn-centered origins to FRAME_SATURN_J2000_ICRF (2139.5935ms)
✔ Slice 4 tuple records ingest into canonical meters, m/s, TDB seconds, and Saturn-centered moon frames (64.3756ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2323.4432
✔ Slice 6 fixture contains all three required target keys (8.4347ms)
✔ Slice 6 fixture origin tags match heliocentric Mars and mars-centered moons (4.4633ms)
✔ inferCanonicalFrame maps mars-centered origins to FRAME_MARS_J2000_ICRF (2205.8752ms)
✔ Slice 6 tuple records ingest into canonical meters, m/s, TDB seconds, and Mars-centered moon frames (40.3852ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2374.1895
✔ Slice 7 fixture contains the 1008-body hybrid catalog and required asteroid ids (11.3308ms)
✔ Slice 7 boundary ingestion preserves all 1008 asteroid records and the 8 curated NEAs (2068.094ms)
✔ Slice 7 boundary spot-checks preserve Vesta, Bennu, and Apophis metadata and heliocentric frame (13.0624ms)
✔ Slice 7 boundary ingestion preserves anchor-position round-trip at the anchor epoch (14.0577ms)
✔ Slice 7 browser loader fetches and ingests the asteroid catalog fixture (13.7635ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2220.3715
✔ Slice 8 fixture exists and contains the 10,008-body catalog (56.0303ms)
✔ Slice 8 boundary ingestion preserves all 10,008 asteroid records and the Slice 7 subset (2239.9476ms)
✔ Slice 8 boundary spot-checks preserve Vesta, Bennu, Apophis, and new extension bodies (164.5489ms)
✔ Slice 8 band distribution and orbit-line count match Round 3 within tolerance (108.3405ms)
✔ Slice 8 browser loader fetches and ingests the asteroid catalog fixture (112.8334ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2794.3291
✔ Slice 9 fixture exists and contains the live 41,906-body NEA catalog (311.184ms)
✔ Slice 9 boundary ingestion preserves the full catalog and tier counts (2478.849ms)
✔ Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies (442.0402ms)
✔ Slice 9 quality metadata and anchor semantics stay internally consistent (461.5563ms)
✔ Slice 9 browser loader fetches and ingests the NEA catalog fixture (465.8379ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4320.5978
✔ load succeeds, count matches header, and Sirius sorts first (1925.5451ms)
✔ positions are unit vectors, magnitudes are sane, and colors stay in range (7.4429ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2024.9596
✔ C3Value requires a typed grid descriptor (1077.7091ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1154.2805
AboutPage is not exported; semantic intro assertion skipped by contract.
✔ catalog count constant is bound to the committed catalog data (2259.8024ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2361.2361
✔ catalog renders distinct loading, failed, and empty-after-filter states (1915.4208ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2009.352
✔ CK-13 renders the cache-derived LOW C3 screening threshold in the catalog legend (2205.8884ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2302.4745
✔ grid-compute fills TOF-fastest (index = depIdx * nTof + tofIdx) (2022.4787ms)
✔ D-01 toSegmentGrid remaps grid-compute layout to departure-fastest (0.2847ms)
✔ D-01 LOCK: breadth is measured on the DEPARTURE axis (asymmetric grid) (1.2254ms)
✔ D-02 the departure epoch threaded into segmentation is span.requested.start (0.2089ms)
✔ D-02 BLIND SPOT: column 0 cannot discriminate the two anchors (0.1516ms)
✔ D-02 SENSITIVITY: a 69.184 s anchor shift does flip dateIso across a midnight straddle (0.137ms)
✔ D-02 computeCompareData threads the injected anchor into argmin.dateIso (1.1724ms)
✔ T1 compare result carries payload-at-C3 and the full spacecraft budget (0.222ms)
✔ T7 compare data preserves measured grid timing and exposes missing timing as zero (0.3021ms)
✔ D-03 injected absoluteKm2S2 is used, never the module default of 25 (0.2342ms)
✔ D-03 injection changes membership, proving the value is load-bearing (0.2257ms)
✔ D-04 echo carries liveMin, delta, absolute, and grid geometry from the computation (0.156ms)
✔ D-04 relative-mode threshold equals echoed liveMin + delta (0.1283ms)
✔ DEC-17-10 out-of-bounds departure window returns a structured refusal (0.1129ms)
✔ DEC-17-10 refusal is a value — a start before the first sample does not throw (0.1828ms)
✔ a grid with no converged cell refuses with no-convergence (0.0884ms)
✔ DEC-17-6 cap: bodies beyond 5 are refused with cap-exceeded, first 5 computed (0.9072ms)
✔ serial orchestration preserves input order and is deterministic (2.471ms)
✔ deliveredMass is null on NO-PRACTICAL-WINDOW rather than a fabricated number (0.4016ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2121.9444
(node:36884) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ T1 compare rows render the near-zero flag only for sub-threshold minima and preserve values (2657.7968ms)
✔ T2 compare hide state preserves practical order and dominance while replacing flagged values (2447.8497ms)
✔ T3 compare size factors are derived from the imported albedo constants in both directions (2396.4197ms)
✔ W3a compare flags an Apophis window arriving after support without changing ranking data (2542.7536ms)
✔ W3b compare exposes delivered-mass anchors, NASA contract context, and the New Glenn caveat (2388.1828ms)
✔ T7 compare badge refuses timing when any grid lacks a measurement (2341.2159ms)
✔ compare defines the breadth qualifier from B_min and the sampling interval (tail2 F7) (2357.2485ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 17229.2756
✔ parse: basic list, with and without leading ? and other params (1724.7516ms)
✔ parse: missing or empty parameter yields [] (0.1719ms)
✔ parse: dedupes, first occurrence wins (0.1273ms)
✔ parse: caps at 5 (0.1168ms)
✔ parse: junk is rejected, valid neighbors survive (0.1253ms)
✔ parse: URL-encoded internal spaces decode and survive (0.0951ms)
✔ serialize: joins, dedupes, caps, drops junk; empty yields empty string (0.1326ms)
✔ round-trip: parse(serialize(x)) is the sanitized x (0.1433ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1816.2682
✔ co-orbital disclosure attributes the rendered comparison to patched-conic methods (1830.1172ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1926.3872
PASS tsc compilation
PASS BODY_CONSTANTS has key 'sun'
PASS BODY_CONSTANTS has key 'mercury'
PASS BODY_CONSTANTS has key 'venus'
PASS BODY_CONSTANTS has key 'earth'
PASS BODY_CONSTANTS has key 'moon'
PASS BODY_CONSTANTS has key 'mars'
PASS BODY_CONSTANTS has key 'phobos'
PASS BODY_CONSTANTS has key 'deimos'
PASS BODY_CONSTANTS has key 'jupiter'
PASS BODY_CONSTANTS has key 'io'
PASS BODY_CONSTANTS has key 'europa'
PASS BODY_CONSTANTS has key 'ganymede'
PASS BODY_CONSTANTS has key 'callisto'
PASS BODY_CONSTANTS has key 'saturn'
PASS BODY_CONSTANTS has key 'titan'
PASS BODY_CONSTANTS has key 'rhea'
PASS BODY_CONSTANTS has key 'iapetus'
PASS BODY_CONSTANTS has key 'tethys'
PASS BODY_CONSTANTS has key 'dione'
PASS BODY_CONSTANTS has key 'mimas'
PASS BODY_CONSTANTS has key 'enceladus'
PASS BODY_CONSTANTS['sun'].radiusM > 0
PASS BODY_CONSTANTS['mercury'].radiusM > 0
PASS BODY_CONSTANTS['venus'].radiusM > 0
PASS BODY_CONSTANTS['earth'].radiusM > 0
PASS BODY_CONSTANTS['moon'].radiusM > 0
PASS BODY_CONSTANTS['mars'].radiusM > 0
PASS BODY_CONSTANTS['phobos'].radiusM > 0
PASS BODY_CONSTANTS['deimos'].radiusM > 0
PASS BODY_CONSTANTS['jupiter'].radiusM > 0
PASS BODY_CONSTANTS['io'].radiusM > 0
PASS BODY_CONSTANTS['europa'].radiusM > 0
PASS BODY_CONSTANTS['ganymede'].radiusM > 0
PASS BODY_CONSTANTS['callisto'].radiusM > 0
PASS BODY_CONSTANTS['saturn'].radiusM > 0
PASS BODY_CONSTANTS['titan'].radiusM > 0
PASS BODY_CONSTANTS['rhea'].radiusM > 0
PASS BODY_CONSTANTS['iapetus'].radiusM > 0
PASS BODY_CONSTANTS['tethys'].radiusM > 0
PASS BODY_CONSTANTS['dione'].radiusM > 0
PASS BODY_CONSTANTS['mimas'].radiusM > 0
PASS BODY_CONSTANTS['enceladus'].radiusM > 0
PASS BODY_CONSTANTS['sun'].naifId > 0
PASS BODY_CONSTANTS['mercury'].naifId > 0
PASS BODY_CONSTANTS['venus'].naifId > 0
PASS BODY_CONSTANTS['earth'].naifId > 0
PASS BODY_CONSTANTS['moon'].naifId > 0
PASS BODY_CONSTANTS['mars'].naifId > 0
PASS BODY_CONSTANTS['phobos'].naifId > 0
PASS BODY_CONSTANTS['deimos'].naifId > 0
PASS BODY_CONSTANTS['jupiter'].naifId > 0
PASS BODY_CONSTANTS['io'].naifId > 0
PASS BODY_CONSTANTS['europa'].naifId > 0
PASS BODY_CONSTANTS['ganymede'].naifId > 0
PASS BODY_CONSTANTS['callisto'].naifId > 0
PASS BODY_CONSTANTS['saturn'].naifId > 0
PASS BODY_CONSTANTS['titan'].naifId > 0
PASS BODY_CONSTANTS['rhea'].naifId > 0
PASS BODY_CONSTANTS['iapetus'].naifId > 0
PASS BODY_CONSTANTS['tethys'].naifId > 0
PASS BODY_CONSTANTS['dione'].naifId > 0
PASS BODY_CONSTANTS['mimas'].naifId > 0
PASS BODY_CONSTANTS['enceladus'].naifId > 0
PASS BODY_CONSTANTS['sun'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mercury'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['venus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['earth'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['moon'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mars'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['phobos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['deimos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['jupiter'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['io'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['europa'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['ganymede'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['callisto'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['saturn'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['titan'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['rhea'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['iapetus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['tethys'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['dione'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mimas'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['enceladus'].vizColor in [0x000000, 0xFFFFFF]
PASS INV008_BARS_M has key 'sun'
PASS INV008_BARS_M has key 'mercury'
PASS INV008_BARS_M has key 'venus'
PASS INV008_BARS_M has key 'earth'
PASS INV008_BARS_M has key 'moon'
PASS INV008_BARS_M has key 'mars'
PASS INV008_BARS_M['sun'] > 0
PASS INV008_BARS_M['mercury'] > 0
PASS INV008_BARS_M['venus'] > 0
PASS INV008_BARS_M['earth'] > 0
PASS INV008_BARS_M['moon'] > 0
PASS INV008_BARS_M['mars'] > 0
PASS INV010_BARS_M has key 'saturn'
PASS INV010_BARS_M has key 'titan'
PASS INV010_BARS_M has key 'rhea'
PASS INV010_BARS_M has key 'iapetus'
PASS INV010_BARS_M has key 'tethys'
PASS INV010_BARS_M has key 'dione'
PASS INV010_BARS_M has key 'mimas'
PASS INV010_BARS_M has key 'enceladus'
PASS INV010_BARS_M['saturn'] > 0
PASS INV010_BARS_M['titan'] > 0
PASS INV010_BARS_M['rhea'] > 0
PASS INV010_BARS_M['iapetus'] > 0
PASS INV010_BARS_M['tethys'] > 0
PASS INV010_BARS_M['dione'] > 0
PASS INV010_BARS_M['mimas'] > 0
PASS INV010_BARS_M['enceladus'] > 0
PASS INV011_BARS_M has key 'phobos'
PASS INV011_BARS_M has key 'deimos'
PASS INV011_BARS_M['phobos'] > 0
PASS INV011_BARS_M['deimos'] > 0
PASS INTERPOLATION_ERROR_BARS_M has key 'sun'
PASS BODY_CADENCE_SECONDS has key 'sun'
PASS BODY_INTERPOLATION_INVARIANTS has key 'sun'
PASS INTERPOLATION_ERROR_BARS_M has key 'mercury'
PASS BODY_CADENCE_SECONDS has key 'mercury'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mercury'
PASS INTERPOLATION_ERROR_BARS_M has key 'venus'
PASS BODY_CADENCE_SECONDS has key 'venus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'venus'
PASS INTERPOLATION_ERROR_BARS_M has key 'earth'
PASS BODY_CADENCE_SECONDS has key 'earth'
PASS BODY_INTERPOLATION_INVARIANTS has key 'earth'
PASS INTERPOLATION_ERROR_BARS_M has key 'moon'
PASS BODY_CADENCE_SECONDS has key 'moon'
PASS BODY_INTERPOLATION_INVARIANTS has key 'moon'
PASS INTERPOLATION_ERROR_BARS_M has key 'mars'
PASS BODY_CADENCE_SECONDS has key 'mars'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mars'
PASS INTERPOLATION_ERROR_BARS_M has key 'phobos'
PASS BODY_CADENCE_SECONDS has key 'phobos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'phobos'
PASS INTERPOLATION_ERROR_BARS_M has key 'deimos'
PASS BODY_CADENCE_SECONDS has key 'deimos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'deimos'
PASS INTERPOLATION_ERROR_BARS_M has key 'jupiter'
PASS BODY_CADENCE_SECONDS has key 'jupiter'
PASS BODY_INTERPOLATION_INVARIANTS has key 'jupiter'
PASS INTERPOLATION_ERROR_BARS_M has key 'io'
PASS BODY_CADENCE_SECONDS has key 'io'
PASS BODY_INTERPOLATION_INVARIANTS has key 'io'
PASS INTERPOLATION_ERROR_BARS_M has key 'europa'
PASS BODY_CADENCE_SECONDS has key 'europa'
PASS BODY_INTERPOLATION_INVARIANTS has key 'europa'
PASS INTERPOLATION_ERROR_BARS_M has key 'ganymede'
PASS BODY_CADENCE_SECONDS has key 'ganymede'
PASS BODY_INTERPOLATION_INVARIANTS has key 'ganymede'
PASS INTERPOLATION_ERROR_BARS_M has key 'callisto'
PASS BODY_CADENCE_SECONDS has key 'callisto'
PASS BODY_INTERPOLATION_INVARIANTS has key 'callisto'
PASS INTERPOLATION_ERROR_BARS_M has key 'saturn'
PASS BODY_CADENCE_SECONDS has key 'saturn'
PASS BODY_INTERPOLATION_INVARIANTS has key 'saturn'
PASS INTERPOLATION_ERROR_BARS_M has key 'titan'
PASS BODY_CADENCE_SECONDS has key 'titan'
PASS BODY_INTERPOLATION_INVARIANTS has key 'titan'
PASS INTERPOLATION_ERROR_BARS_M has key 'rhea'
PASS BODY_CADENCE_SECONDS has key 'rhea'
PASS BODY_INTERPOLATION_INVARIANTS has key 'rhea'
PASS INTERPOLATION_ERROR_BARS_M has key 'iapetus'
PASS BODY_CADENCE_SECONDS has key 'iapetus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'iapetus'
PASS INTERPOLATION_ERROR_BARS_M has key 'tethys'
PASS BODY_CADENCE_SECONDS has key 'tethys'
PASS BODY_INTERPOLATION_INVARIANTS has key 'tethys'
PASS INTERPOLATION_ERROR_BARS_M has key 'dione'
PASS BODY_CADENCE_SECONDS has key 'dione'
PASS BODY_INTERPOLATION_INVARIANTS has key 'dione'
PASS INTERPOLATION_ERROR_BARS_M has key 'mimas'
PASS BODY_CADENCE_SECONDS has key 'mimas'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mimas'
PASS INTERPOLATION_ERROR_BARS_M has key 'enceladus'
PASS BODY_CADENCE_SECONDS has key 'enceladus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'enceladus'
PASS body-class tagging covers fixed bodies and asteroid ids
PASS BODY_CONSTANTS['jupiter'].naifId matches README
PASS BODY_CONSTANTS['jupiter'].radiusM matches README
PASS BODY_CONSTANTS['jupiter'].vizColor matches README
PASS BODY_CADENCE_SECONDS['jupiter'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['jupiter'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['jupiter'] matches Slice 3 invariant
PASS BODY_CONSTANTS['jupiter'].radiiM matches README triaxial values
PASS BODY_CONSTANTS['io'].naifId matches README
PASS BODY_CONSTANTS['io'].radiusM matches README
PASS BODY_CONSTANTS['io'].vizColor matches README
PASS BODY_CADENCE_SECONDS['io'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['io'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['io'] matches Slice 3 invariant
PASS BODY_CONSTANTS['europa'].naifId matches README
PASS BODY_CONSTANTS['europa'].radiusM matches README
PASS BODY_CONSTANTS['europa'].vizColor matches README
PASS BODY_CADENCE_SECONDS['europa'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['europa'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['europa'] matches Slice 3 invariant
PASS BODY_CONSTANTS['ganymede'].naifId matches README
PASS BODY_CONSTANTS['ganymede'].radiusM matches README
PASS BODY_CONSTANTS['ganymede'].vizColor matches README
PASS BODY_CADENCE_SECONDS['ganymede'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['ganymede'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['ganymede'] matches Slice 3 invariant
PASS BODY_CONSTANTS['callisto'].naifId matches README
PASS BODY_CONSTANTS['callisto'].radiusM matches README
PASS BODY_CONSTANTS['callisto'].vizColor matches README
PASS BODY_CADENCE_SECONDS['callisto'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['callisto'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['callisto'] matches Slice 3 invariant
PASS BODY_CONSTANTS['mars'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['mars'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['mars'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['mars'] matches Slice 6 invariant
PASS BODY_CONSTANTS['mars'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['phobos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['phobos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['phobos'] matches Slice 6 invariant
PASS INV011_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_CONSTANTS['phobos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['deimos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['deimos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['deimos'] matches Slice 6 invariant
PASS INV011_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_CONSTANTS['deimos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['saturn'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['saturn'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['saturn'] matches Slice 4 invariant
PASS INV010_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_CONSTANTS['saturn'].radiiM matches Slice 4 triaxial values
PASS BODY_CONSTANTS['titan'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['titan'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['titan'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['titan'] matches Slice 4 invariant
PASS INV010_BARS_M['titan'] matches Slice 4 bar
PASS BODY_CONSTANTS['rhea'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['rhea'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['rhea'] matches Slice 4 invariant
PASS INV010_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_CONSTANTS['iapetus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['iapetus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['iapetus'] matches Slice 4 invariant
PASS INV010_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_CONSTANTS['tethys'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['tethys'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['tethys'] matches Slice 4 invariant
PASS INV010_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_CONSTANTS['dione'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['dione'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['dione'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['dione'] matches Slice 4 invariant
PASS INV010_BARS_M['dione'] matches Slice 4 bar
PASS BODY_CONSTANTS['mimas'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['mimas'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['mimas'] matches Slice 4 invariant
PASS INV010_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_CONSTANTS['enceladus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['enceladus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['enceladus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['enceladus'] matches Slice 4 invariant
PASS INV010_BARS_M['enceladus'] matches Slice 4 bar
PASS SATURN_D_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_C_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_A_RING_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_HUYGENS_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_OUTER_RADIUS_M matches Slice 5 docs
PASS createAsteroidCatalogIndex ingests all 1008 asteroid records
PASS createAsteroidCatalogIndex identifies the 8 curated NEAs
PASS eccentricityBandForBody(0.0999) returns A
PASS eccentricityBandForBody(0.1) returns B
PASS eccentricityBandForBody(0.1999) returns B
PASS eccentricityBandForBody(0.2) returns C
PASS eccentricityBandForBody(0.2999) returns C
PASS eccentricityBandForBody(0.3) returns D
PASS hasOrbitLineForBody(10.97) returns true
PASS hasOrbitLineForBody(10.98) returns false
PASS hasOrbitLineForBody(10.99) returns false
PASS curated NEA designation 101955 remains flagged
PASS curated NEA designation 99942 remains flagged
PASS curated NEA designation 433 remains flagged
PASS curated NEA designation 25143 remains flagged
PASS curated NEA designation 162173 remains flagged
PASS curated NEA designation 4179 remains flagged
PASS curated NEA designation 1620 remains flagged
PASS curated NEA designation 4769 remains flagged
PASS asteroid lookup works by designation and SPK id for Bennu
PASS estimatedRadiusM matches the H-derived default-albedo formula for Bennu
PASS Slice 7 asteroid fixture entries can be extended with Slice 8 band and orbit-line metadata

All assertions passed.
✔ tests\v2-core-constants.test.mjs (2037.1483ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2042.7649
slice3MaxRoundTripError=0
slice3MaxChainTenError=0
✔ Slice 3 boundary ingestion tags Galileans as FRAME_JUPITER_J2000_ICRF (2090.3811ms)
✔ Slice 3 HELIO ↔ JUPITER round-trip stays within one-pass and ten-chain bounds (28.0391ms)
✔ Slice 1 HELIO ↔ GCRS round-trip still works unchanged (5.8629ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2222.6987
slice6MarsMaxRoundTripError=0
slice6MarsMaxChainTenError=0
slice6MarsMoonMaxHelioRoundTripError=0
slice6MarsMoonMaxChainTenError=0
slice6MarsMoonMaxNativeRoundTripRelativeError=1.6947555828275902e-12
✔ Slice 6 HELIO ↔ MARS direct round-trip on Mars heliocentric states stays within bounds (1986.1795ms)
✔ Slice 6 HELIO ↔ MARS round-trip on interpolated Mars-centered moon states stays within bounds (28.0099ms)
✔ Slice 6 frame additions preserve GCRS, Jupiter, and Saturn paths (93.2437ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2218.8054
slice4SaturnMaxRoundTripError=0
slice4SaturnMaxChainTenError=0
slice4MoonMaxHelioRoundTripError=0
slice4MoonMaxChainTenError=0
slice4MoonMaxNativeRoundTripRelativeError=6.335544898437588e-13
✔ Slice 4 HELIO ↔ SATURN direct round-trip on Saturn heliocentric states stays within bounds (2057.7637ms)
✔ Slice 4 HELIO ↔ SATURN round-trip on interpolated Saturn-centered moon states stays within bounds (51.8653ms)
✔ Slice 4 frame additions preserve Jupiter and GCRS paths (27.2079ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2225.3918
slice3Hermite jupiter maxErrorKm=7.142806491701069 rmsErrorKm=4.199738159183813 barKm=50 checked=4319
slice3Hermite io maxErrorKm=0.5442963290723388 rmsErrorKm=0.33658103781622706 barKm=5 checked=8639
slice3Hermite europa maxErrorKm=4.50430937666286 rmsErrorKm=2.6736541902238957 barKm=20 checked=4319
slice3Hermite ganymede maxErrorKm=6.610468763880747 rmsErrorKm=4.127952978794724 barKm=20 checked=4319
slice3Hermite callisto maxErrorKm=7.016665103601909 rmsErrorKm=3.928974726508747 barKm=50 checked=4319
✔ Slice 3 Jupiter-system Hermite interpolation stays below INV-009 bars (2417.915ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2533.2032
slice6Hermite mars maxErrorKm=0.008932563975280729 rmsErrorKm=0.005288750696475446 barKm=0.05 checked=270
slice6Hermite phobos maxErrorKm=0.7787715830854933 rmsErrorKm=0.48601715486892844 barKm=5 checked=21600
slice6Hermite deimos maxErrorKm=0.11319505860637424 rmsErrorKm=0.08328683543873051 barKm=0.5 checked=6480
✔ Slice 6 Mars-system Hermite interpolation stays below INV-008/INV-011 bars with pre-research-matching error (2725.087ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2819.1995
slice4Hermite saturn maxErrorKm=0.2023990147891148 rmsErrorKm=0.06964598071541636 barKm=1 checked=4319
slice4Hermite titan maxErrorKm=6.034245679338891 rmsErrorKm=3.150894748674291 barKm=20 checked=4319
slice4Hermite rhea maxErrorKm=1.2646108832459069 rmsErrorKm=0.7992468821770016 barKm=5 checked=4319
slice4Hermite iapetus maxErrorKm=0.6187833209615409 rmsErrorKm=0.25170364508742626 barKm=2 checked=4319
slice4Hermite tethys maxErrorKm=0.2843355703425951 rmsErrorKm=0.1812933392207793 barKm=1 checked=8639
slice4Hermite dione maxErrorKm=6.777691855843222 rmsErrorKm=4.24466979005391 barKm=50 checked=4319
slice4Hermite mimas maxErrorKm=3.3593358528420176 rmsErrorKm=1.8574590119921746 barKm=20 checked=8639
slice4Hermite enceladus maxErrorKm=0.8570913723667154 rmsErrorKm=0.5277623322167538 barKm=5 checked=8639
✔ Slice 4 Saturn-system Hermite interpolation stays below INV-010 bars (2885.0618ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3003.6204
PASS tsc compilation
PASS interpolate at t0 returns s0 position (rel err < 1e-9)
PASS interpolate at t1 returns s1 position (rel err < 1e-9)
PASS interpolate at midpoint returns finite position
PASS assertInterpolationError throws AssertError for Earth error 1000 m (> 500 m bar)
PASS Earth interpolation overflow routes to INV-008
PASS assertInterpolationError does not throw for Earth error 100 m (< 500 m bar)
PASS assertInterpolationError throws AssertError for Tethys error 1100 m (> 1 km bar)
PASS Tethys interpolation overflow routes to INV-010
PASS Tethys overflow includes bodyId detail
PASS Tethys overflow includes measuredErrorKm detail
PASS Tethys overflow includes barKm detail
PASS Tethys overflow includes cadence from constants
PASS assertInterpolationError does not throw in report mode for Enceladus overflow
PASS assertInterpolationError emits one report-mode violation for Enceladus overflow
PASS Report-mode Enceladus overflow routes to INV-010
PASS Report-mode Enceladus overflow includes bodyId detail
PASS Report-mode Enceladus overflow includes measuredErrorKm detail
PASS Report-mode Enceladus overflow includes barKm detail
PASS Report-mode Enceladus overflow includes tdbSeconds detail
PASS Report-mode Enceladus overflow includes cadence from constants
PASS assertInterpolationError throws AssertError for Phobos error 5100 m (> 5 km bar)
PASS Phobos interpolation overflow routes to INV-011
PASS Phobos overflow includes bodyId detail
PASS Phobos overflow includes measuredErrorKm detail
PASS Phobos overflow includes barKm detail
PASS Phobos overflow includes 30-minute cadence detail
PASS assertInterpolationError does not throw in report mode for Deimos overflow
PASS assertInterpolationError emits one report-mode violation for Deimos overflow
PASS Report-mode Deimos overflow routes to INV-011
PASS Report-mode Deimos overflow includes bodyId detail
PASS Report-mode Deimos overflow includes measuredErrorKm detail
PASS Report-mode Deimos overflow includes barKm detail
PASS Report-mode Deimos overflow includes tdbSeconds detail
PASS Report-mode Deimos overflow includes 1-hour cadence detail

All assertions passed.
✔ tests\v2-core-hermite.test.mjs (2287.244ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2292.4571
✔ propagateKeplerianStateVectors reproduces the fixture anchor state within one meter (2120.0651ms)
✔ forward 30d epoch shift then backward propagation returns to the initial state within one meter (6.0894ms)
✔ angular momentum and specific orbital energy remain conserved over 90 days (4.3432ms)
✔ high-e solver converges within the iteration cap (0.1242ms)
✔ production Keplerian port matches the round-2 Vesta day-90 research residual (8.0698ms)
✔ assertKeplerianError routes asteroid overflows to INV-012 (1.5908ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2273.9324
✔ Vesta orbit samples close cleanly at 64 segments (1842.1345ms)
✔ Apophis high-e orbit uses expected radius law across the sampled ellipse (9.6764ms)
✔ sampled orbit points satisfy the conic radius equation for Vesta (5.5751ms)
✔ sampled orbit vectors preserve the independently derived canonical orientation (4.3443ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1946.1367
✔ catalog and porkchop span labels derive full dates from their own parameters (4402.2685ms)
✔ catalog footer quotes the cache end and the porkchop grid end from their own constants (1958.7391ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6462.0408
✔ C3 formatting is owned by C3Value outside the pure formatter (34.5736ms)
✔ badge construction is owned by shared design components (48.6024ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 167.1836
✔ shared honesty components preserve the characterization fixture (2049.6144ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2145.0937
✔ design tokens are deterministic and provenance-pinned (8.9405ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 145.6127
✔ DLA feasibility labels import the production view vocabulary (2474.7947ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2582.9938
(node:10664) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ DLA disclosure, site picker, and band legend render with contours off and on (14961.1494ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15119.1584
✔ tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning (1874.4642ms)
✔ tracking inside coverage mounts LIVE without a warning (2048.8638ms)
✔ outside coverage the HUD date line is marked clamped and Shift+N help tells the truth (1766.6102ms)
✔ coverage line gains a refresh-due notice in the last 14 days of coverage only (1741.6559ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7573.0153
✔ F2 characterization fixture records the HEAD honesty text across all three surfaces (1.5144ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 115.0268
✔ FK3 AMBER tour explains zero added Delta-V while RED still names dogleg (1925.5006ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2010.0304
✔ payloadAtC3 New Glenn/Standard C3=0 === 7180 kg (0.906ms)
✔ payloadAtC3 New Glenn/Standard C3=5 === 6055 kg (0.0971ms)
✔ payloadAtC3 New Glenn/Standard C3=20 === 2365 kg (1.0361ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=0 === 15010 kg (0.0879ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=5 === 13677.5 kg (0.065ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=20 === 10115 kg (0.0537ms)
✔ payloadAtC3 Vulcan/VC6 C3=0 === 10850 kg (0.0584ms)
✔ payloadAtC3 Vulcan/VC6 C3=5 === 9990 kg (0.0689ms)
✔ payloadAtC3 Vulcan/VC6 C3=20 === 7630 kg (0.0765ms)
✔ deliveredMassKg New Glenn/Standard C3=5 one-way === 3494.511538898568 kg (0.2374ms)
✔ every launch-vehicle anchor carries a source-derived basis (0.0929ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 187.3177
✔ tests\v2-lambert\dla.test.mjs (1876.9731ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1890.0828
✔ tests\v2-lambert\feasibility.test.mjs (1868.0224ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1873.4181
householder.test: PASS
✔ tests\v2-lambert\householder.test.mjs (1928.3058ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1935.092
hyp2f1b.test: PASS
✔ tests\v2-lambert\hyp2f1b.test.mjs (1896.4112ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1903.0774
initial-guess.test: PASS
✔ tests\v2-lambert\initial-guess.test.mjs (1889.6442ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1897.161
lambert-endtoend.test: PASS
✔ tests\v2-lambert\lambert-endtoend.test.mjs (2026.9681ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2034.1998
lambert-multi-rev-rejection.test: PASS
✔ tests\v2-lambert\lambert-multi-rev-rejection.test.mjs (1992.8697ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1999.6844
lambertMultiRev: no solution for M=1; T=0.5790023712295225 < T_min=4.403057492003494
lambertMultiRev: no solution for M=2; T=6.224170889575949 < T_min=7.768035471712736
lambertMultiRev: no solution for M=1; T=1.8936975346281286 < T_min=4.565433395618
lambertMultiRev: no solution for M=1; T=3.142611278377002 < T_min=4.589850624734614
lambertMultiRev: no solution for M=1; T=4.401579074102609 < T_min=4.711344422248995
lambertMultiRev: no solution for M=1; T=4.603344913728462 < T_min=4.73916181439084
lambertMultiRev: no solution for M=1; T=4.708577625250112 < T_min=4.754505056873685
lambertMultiRev: no solution for M=1; T=4.762318080262853 < T_min=4.762559475692091
lambertMultiRev: no solution for M=1; T=4.76252949463941 < T_min=4.762591453257581
lambertMultiRev: no solution for M=1; T=4.762582350055022 < T_min=4.762599448281306
lambertMultiRev: no solution for M=1; T=4.762595564022766 < T_min=4.7626014470767615
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambert-multi-rev.test: PASS
✔ tests\v2-lambert\lambert-multi-rev.test.mjs (2870.441ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2877.0188
stumpff.test: PASS
✔ tests\v2-lambert\stumpff.test.mjs (1889.853ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1895.2184
tof.test: PASS
✔ tests\v2-lambert\tof.test.mjs (1806.7305ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1812.3147
utc-to-tdb.test: PASS
✔ tests\v2-lambert\utc-to-tdb.test.mjs (1763.1441ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1770.5951
vec3.test: PASS
✔ tests\v2-lambert\vec3.test.mjs (1904.4471ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1912.8742
✔ K4 light time uses Earth distance, two significant figures, and inherited tier caveats (1715.4377ms)
✔ K4 refuses every ruled invalid state without displaying a number (1777.1992ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3584.9571
✔ tests\v2-near-zero-c3.test.mjs (1943.5026ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1948.937
✔ T3 Porkchop extremes and pinned readout flag, hide, and restore the same C3 source value (3835.5591ms)
✔ K7 pin callback publishes the newly pinned cell while replacement computation is pending (3616.4929ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7554.7993
(node:46280) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog disclosure renders plain-English public copy (2371.8812ms)
✔ About audit exhibits render plain-English titles and evidence labels (2294.7112ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4773.2332
✔ public disclosure sections render without internal taxonomy identifiers or duplicated trust numbers (1875.3785ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1959.6126
✔ construction distributes the Slice 8 catalog across the measured 1 AU cells (2265.3483ms)
✔ off-axis outer-system view culls some occupied cells (149.9935ms)
✔ focused close-zoom keeps visible cells in a small local neighborhood (152.359ms)
✔ cells near the frustum edge stay visible across a +/-0.5 degree camera sweep (1.6507ms)
✔ raycastIntersectCells returns null for misses, hits the expected body, and reassigns across cells after position changes (3.3711ms)
✔ rendered instanced position matches the propagated world position used for focus truth (128.5048ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2810.589
✔ orbit-batch geometry uses the expected concatenated vertex count (2038.6554ms)
✔ orbit-batch material matches the DEC-11 MVP line settings (32.4705ms)
✔ orbit-batch vertices for Vesta match the sampled ellipse positions (26.3105ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2202.7615
✔ asteroid points shader material constructs with additive soft-glow settings (2338.3133ms)
✔ ALIASED_POINT_SIZE_RANGE query falls back cleanly when no GL context exists (0.569ms)
✔ per-point color attribute distinguishes curated NEAs from main-belt asteroids (3.5797ms)
✔ overview Vesta-sized points land in the tuned 4-8 px visibility band (2.5855ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2464.9597
✔ sub-pixel asteroid renders in Points mode (2217.1301ms)
✔ mid-zoom asteroid renders in InstancedMesh mode (1.9976ms)
✔ focused asteroid renders in individual Mesh mode when resolved (2.7564ms)
✔ hysteresis keeps a near-threshold asteroid stable around 1.7 px (0.2507ms)
✔ Points, InstancedMesh, and focused Mesh agree on world position (3.1777ms)
✔ focused asteroid gets a highlighted orbit while the main orbit batch stays visible in browse-scale focus (1.0923ms)
✔ main orbit batch fades out when the focused asteroid reaches close-inspection mesh mode (0.7582ms)
✔ main orbit batch excludes asteroids below the hasOrbitLine threshold while focused orbit highlight still works (0.9633ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2341.7386
✔ halo opacity stays at full base opacity below the full-visibility threshold (1915.1218ms)
✔ halo opacity fades linearly through the hysteresis transition zone (0.3707ms)
✔ halo opacity reaches zero at and above the invisible threshold (0.2097ms)
✔ Saturn moon halo floors vary by moon size with Titan at least 3x Mimas (0.2682ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2047.6276
✔ Jupiter oblate mesh extents match documented radii (1959.8169ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2078.5857
✔ Mars oblate mesh extents match documented radii (1846.6692ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1946.794
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:28588) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phobos rendered world position equals its heliocentric focus anchor (2954.201ms)
✔ Deimos rendered world position equals its heliocentric focus anchor (69.6654ms)
✔ Mars body mesh receives the documented render-only tilt (45.035ms)
✔ Mars moons do not inherit the render-only tilt (39.717ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3214.1713
✔ Saturn oblate mesh extents match documented radii (1874.4548ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1976.962
✔ Saturn ring local plane stays on XZ with +Y normals (1959.785ms)
✔ Saturn main ring and Cassini geometry radii match spec (6.9787ms)
✔ Saturn ring opacity sampling preserves D/C/B/A ordering (0.2278ms)
✔ Saturn Cassini opacity peaks at the division center (0.1209ms)
✔ Saturn ring texture preserves multiple radial alpha levels (3.6646ms)
✔ Saturn ring substructure adds seven named sibling meshes under saturn-rings (3.7053ms)
✔ Saturn ring substructure radii match Slice 5 constants (3.0999ms)
✔ Saturn ring substructure renderOrder keeps gaps below ringlets and preserves Slice 4 meshes (2.7963ms)
✔ Saturn ring substructure preserves child ordering in inner-radius sequence (2.3686ms)
✔ Saturn Roche Division uses a fading texture rather than a flat-opacity band (3.2615ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2072.2642
✔ Vesta and Bennu anchor positions land in the measured 1 AU cells (1954.905ms)
✔ cellBoundsKmForIndex returns a 1 AU box anchored to the configured grid (0.2549ms)
✔ positions outside the ±28 AU cube return null (0.0911ms)
✔ cellIndexForPositionKm round-trips into a containing cell bounds box (40.343ms)
✔ iterateAllPossibleCells covers the full 56x56x56 grid (14.6078ms)
✔ Slice 8 fixture occupies the measured ~178 cells at 1 AU resolution (66.0482ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2187.6147
✔ catalog binary loads without error and advertises the expected header (35.3617ms)
✔ star count is in the expected runtime range (15.9149ms)
✔ Sirius is the brightest record and lands at the expected direction (9.9219ms)
✔ Polaris is present near the north celestial pole direction (15.2918ms)
✔ color values stay within [0, 1] for all records (16.4071ms)
✔ INV-014: at least 99% of star directions are unit-length within float32 tolerance (11.9446ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 210.5695
✔ constructor builds THREE.Points geometry with expected star attributes (1969.1278ms)
✔ INV-014 spot-check: Polaris direction in geometry matches the parsed catalog (5.3331ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2077.3537
✔ canonical bodyId and bare designation resolve to the same catalog body (2581.4928ms)
✔ unknown identifiers resolve to undefined — never a fallback body (95.6029ms)
✔ designations are unique across the whole catalog, so the fallback is unambiguous (30.0154ms)
✔ sampled equivalence across the catalog: designation lookup lands on the body with that id (1244.8297ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4084.5925
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:52744) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ pressing t resolves to the top-down preset with the expected final orbit state (2997.3016ms)
✔ camera tween locks controls during animation and releases them on completion (0.2605ms)
✔ existing regression shortcuts remain intact; Titan focus is on k, and t stays with the top-down preset (3.7275ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3112.8643
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-date-hud.test.mjs:51:34) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:13780) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ date HUD label formats TDB seconds into a readable date string (2768.274ms)
✔ date HUD text updates from the current simulated TDB time (0.55ms)
✔ runtime creates and removes the date HUD element symmetrically (1.1069ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2858.364
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-display-integrity.test.mjs:50:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:57368) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ sun light fallback preserves true mesh anchor while keeping a stable fallback direction (2961.9584ms)
✔ viewport sizing falls back cleanly when mount rect is empty (0.1655ms)
✔ keyboard shortcut guard ignores editable targets and accepts canvas-like targets (0.1253ms)
✔ solar runtime source wires display integrity guards into the live interaction path (3.3074ms)
✔ inner and earth-moon runtimes mirror the corrected display patterns (5.444ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3062.5321
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-focus.test.mjs:51:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:20016) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ focus from overview snaps to the target default radius (3144.8671ms)
✔ cross-body focus snaps to the new target default radius (0.1304ms)
✔ re-focusing the same body preserves the current zoom radius (0.553ms)
✔ asteroid focus uses the documented non-edge-on polar default (0.2757ms)
✔ asteroid focus radius uses the honest-scale default radius rule (0.2756ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3253.602
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-hover-tooltips.test.mjs:52:40) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:37796) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ hover tooltip helper shows Earth text and hides on empty state (2921.7991ms)
✔ world-position projection maps screen center correctly (3.3541ms)
✔ hoverable bodies stay limited to the planet set through Saturn (2.7864ms)
✔ runtime wires the hover tooltip element, planet-only raycast path, and cleanup (0.9126ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3081.0741
✔ empty grid: no components, NO-PRACTICAL-WINDOW, relative threshold is Infinity (1824.0674ms)
✔ all cells below T: one component spanning the whole grid (2.3021ms)
✔ a non-converged hole splits a would-be single component (0.6578ms)
✔ tie exactly at T is included (c3 <= T, DEC-17-1) (0.3823ms)
✔ single-cell component exists in components but not in practical (B_min=2) (0.3009ms)
✔ grid of only singletons: NO-PRACTICAL-WINDOW (synthetic 163693 shape) (0.3814ms)
✔ diagonal-only adjacency joins under conn8 (0.2369ms)
✔ null-c3 cell is a hole even when flagged converged (0.2288ms)
✔ liveGridMin excludes non-converged and non-finite cells from the relative threshold (0.3214ms)
✔ all-Infinity converged grid under relative mode has no members (not a garbage component) (0.3249ms)
✔ argmin and derived outputs from a real segmentation run (0.1788ms)
✔ classifyComponents finds the true minimum on unsorted input (DEC-17-3) (0.0869ms)
✔ threshold resolution: relative = liveMin + delta; absolute ignores liveMin (0.1456ms)
✔ conn4 is not implemented and throws; malformed grid shape throws (0.1876ms)
✔ property: random grids — component minima bound, practical subset, sort, cell conservation (1.6772ms)
✔ artifact 433 @min+5 conn8: threshold, derivation rules, B_min classification (0.197ms)
✔ artifact 163693 @min+5 conn8: NO-PRACTICAL-WINDOW (0.1059ms)
✔ artifact 99942 @min+2 conn8: 4 practical of 12, best = global min component (0.1253ms)
✔ artifact derivation rules: breadthCells/breadthDays/tofSpanDays are cell multiples (0.1658ms)
✔ artifact cross-check: pasted constants match the committed artifact, read at runtime (2.3951ms)
✔ artifact sort order restores under the module comparator (0.1649ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1950.1866
(node:9084) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ the shortcut overlay names middle-drag pan and compare renders its M=0 method (2465.8408ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2554.3266
✔ Slice 1 pure-Node cutover harness clears the numeric bar at fixture truth timesteps (1974.3143ms)
ℹ validatedSampleCount=121
ℹ maxEarthErrorKm=0
ℹ maxMoonErrorKm=0
ℹ maxRoundTripError=7.6457577540892395e-25
ℹ maxChainTenError=7.6457577540892395e-25
ℹ INV-005 not exercised: Slice 1 validates fixture truth timesteps without a propagator by contract
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2076.3817
✔ Slice 1 Horizons fixture exists with Earth and Moon 30-day samples (2.2989ms)
✔ Slice 1 boundary ingress produces canonical heliocentric Earth/Moon states (2155.1318ms)
✔ Slice 1 core frame transform round-trip holds against the Earth anchor fixture (3.654ms)
✔ Slice 1 render path subtracts in f64 and only downcasts camera-relative values (5.7324ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2273.2546
Compiling v2 core and boundary...
PASS tsc compilation

PASS INV-008 sun     max_err=3.541e-6 km  bar=0.00002 km  (270 pts checked)
PASS INV-008 mercury max_err=2.005e+1 km  bar=100 km  (270 pts checked)
PASS INV-008 venus   max_err=1.819e-1 km  bar=1 km  (270 pts checked)
PASS INV-008 earth   max_err=9.069e-2 km  bar=0.5 km  (270 pts checked)
PASS INV-008 moon    max_err=4.977e+0 km  bar=20 km  (270 pts checked)
PASS INV-008 mars    max_err=8.933e-3 km  bar=0.05 km  (270 pts checked)

All six INV-008 cutover bars cleared. Phase C is UNBLOCKED.
✔ tests\v2-slice2-cutover.test.mjs (2239.4262ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2245.2649
Compiling v2 core and boundary for Slice 3 cutover...
PASS tsc compilation

PASS INV-009 jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
PASS INV-009 io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
PASS INV-009 europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
PASS INV-009 ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
PASS INV-009 callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 per-body interpolation summary:
  jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
  io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
  europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
  ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
  callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 3 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice3-cutover.test.mjs (3864.3603ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3870.5666
Compiling v2 core and boundary for Slice 4 cutover...
PASS tsc compilation

PASS INV-010 saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
PASS INV-010 titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
PASS INV-010 rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
PASS INV-010 iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
PASS INV-010 tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
PASS INV-010 dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
PASS INV-010 mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
PASS INV-010 enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 per-body interpolation summary:
  saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
  titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
  rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
  iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
  tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
  dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
  mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
  enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 4 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice4-cutover.test.mjs (4410.4691ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4415.9748
Compiling Saturn runtime and ring helpers for Slice 5 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
PASS Slice 5 ring substructure meshes exist under saturn-rings
PASS renderOrder discipline preserved: baseline default, overlays explicit
PASS A ring outer radius matches exact 136,770 km PDS value
PASS Saturn default focus orbit stays non-edge-on (polar=1.047198 rad, view-normal angle=63.469 deg)
PASS Slice 4 Saturn moon cutover criteria remain green under Slice 5 regression gate
(node:33392) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice5-cutover.test.mjs (3128.4634ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3138.0792
Compiling v2 core and boundary for Slice 6 cutover...
PASS tsc compilation

PASS INV-008 mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
PASS INV-011 phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
PASS INV-011 deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 per-body interpolation summary:
  mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
  phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
  deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 6 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice6-cutover.test.mjs (6635.2382ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6643.2381
Compiling v2 core and boundary for Slice 7 cutover...
PASS tsc compilation

PASS INV-012 10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
PASS INV-012 16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
PASS INV-012 39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
PASS INV-012 40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
PASS INV-012 1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
PASS INV-012 1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
PASS INV-012 4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
PASS INV-012 15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
PASS INV-012 101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
PASS INV-012 162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
PASS INV-012 3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
PASS INV-012 2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
PASS INV-012 1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
PASS INV-012 433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
PASS INV-012 4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
PASS INV-012 4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
PASS INV-012 25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
PASS INV-012 99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 per-body propagation summary:
  10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
  16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
  39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
  40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
  1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
  1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
  4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
  15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
  101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
  162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
  3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
  2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
  1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
  433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
  4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
  4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
  25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
  99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice7-cutover.test.mjs (2219.3891ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2225.3197
Compiling v2 core and boundary for Slice 8 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 3) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}

Slice 8 per-band cutover summary:
  A count=50 max=23147.749445 km bar=35612.872326 km rms=3582.231183 km
  B count=50 max=49114.205128 km bar=52970.091742 km rms=4790.752314 km
  C count=50 max=31804.196407 km bar=37688.076110 km rms=3922.950118 km
  D count=50 max=29163.667462 km bar=43757.549716 km rms=4119.658435 km

Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.
(node:6448) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice8-cutover.test.mjs (3593.3714ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3599.5845
[slice8-performance] outer-system-overview bodies=10008 occupiedCells=178 visibleCells=72 visibleBodies=4234 estimatedGpuDrawCount=72 visibleSlice7RegressionBodies=9
[slice8-performance] asteroid-belt-focus bodies=10008 occupiedCells=178 visibleCells=55 visibleBodies=3126 estimatedGpuDrawCount=55 visibleSlice7RegressionBodies=3
[slice8-performance] focused-vesta-close-zoom bodies=10008 occupiedCells=178 visibleCells=14 visibleBodies=1084 estimatedGpuDrawCount=14 visibleSlice7RegressionBodies=1
✔ Slice 8 cell culling architecture produces sane visibility counts across key camera scenarios (2330.8119ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2432.086
﹣ Slice 9 Phase A.3 three-gate cutover harness validates the committed contract and documents residual envelope exceedance (0.8723ms) # RETIRED 2026-07-12: fixture slice9-cutover-sample.json was never committed (.gitignore:17), unrecoverable, no generator. Expected values 26/58/66/61 were measured from the lost sample; a regenerated sample would reset them while faking continuity. See SLICE_9_FOUNDING.md amendment.
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 95.3459
✔ slice9 runtime normalization preserves finite render-critical asteroid fields (1968.0401ms)
✔ solar-system runtime is wired to the Slice 9 live catalog and Phase B canonical pipeline (1.5019ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2051.4825
✔ Slice 9 perf config exposes the committed four partition modes and four camera states (1.114ms)
✔ Slice 9 perf session rows format the observable measurement contract cleanly (0.3713ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 96.8462
✔ Slice 9 A.2b re-anchor recomputes derived fields after replacing elements (314.8431ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 423.6185
▶ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components
  ✔ Partition correctness holds for uniform 0.5 AU and all hybrid candidates (60.1203ms)
  ✔ Hybrid structural validity holds for all candidate density triggers (10.0281ms)
  ✔ Body conservation holds across re-partition after time scrub (306.8211ms)
  ✔ Occupancy reproduction at 0.5 AU remains within the committed tolerance band (0.3813ms)
  ✔ Propagation CPU-time measurements report main-thread and worker-thread components without inferring frame budget (292.1779ms)
✔ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components (3929.7579ms)
ℹ Slice 9 uniform 0.5 AU occupancy: occupied=2060 baseline=2060 drift=0.00% maxBodies=1178 baselineMax=1177 drift=0.08%
ℹ Slice 9 propagation CPU-only timing: main median=15.649ms p95=30.012ms; worker roundtrip median=12.511ms p95=112.030ms; worker compute median=12.186ms p95=17.786ms; fallback bodies=1
ℹ Slice 9 offline propagation fallback bodies: 1 (2015 D1 [JFC])
ℹ Slice 9 hybrid summaries: D=200 coarse=544 subCells=2375 leafCells=2876 maxLeaf=266; D=500 coarse=544 subCells=1171 leafCells=1696 maxLeaf=473; D=1000 coarse=544 subCells=749 leafCells=1281 maxLeaf=810
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4058.5974
✔ symmetric-return disclosure is derived from the committed six-row artifact (124.8238ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 230.6084
✔ the seven representative bodies render their sentences verbatim from the committed artifact (2088.4274ms)
✔ structurally blind splits by cause: 206 comets + 482 Jupiter-crossing = 688, each with its own sentence (286.9096ms)
✔ every one of the 41,906 bodies has a full sentence — no value is missing from committed data (29.4224ms)
✔ L1: the max-drift date traces to dv-scope-per-body.json, and the boundary is the EARLIEST material encounter, recomputed from the CAD snapshot (480.1904ms)
✔ impactor dates and the 3D drift trace to the truth fixture and nea-drift-results.json (41.8327ms)
✔ formatters: dates, million-km, m/s, AU — and no value is invented from junk (0.3261ms)
✔ a record missing its value yields null (omit), never a sentence with a hole (0.2343ms)
✔ L2 disclosure distinguishes a measured-but-unbounded body from an unmeasured body (10.7823ms)
✔ threshold provenance is verbatim and rides with every mention of 10^6 km; legend has one line per key (0.2894ms)
✔ short labels never expose a slug (13.2102ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3063.6736
(node:49228) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog tier legend renders both L2 disclosure phrases from the shared source (2393.4956ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2478.1738
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870085835-0.45661038398768783:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870085835-0.45661038398768783:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:340:29
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870088398-0.5452182494543683:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870088398-0.5452182494543683:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:374:29
}
(node:64996) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phase C overlay mounts with real Preact, reflects store subscriptions, and cleans up (2648.4867ms)
✔ Phase C overlay converges through repeated store updates with finite fake-DOM layout metrics (2466.4849ms)
✔ runtime wires the Phase C.1 overlay mount and focus-request bridge without changing scene ownership (0.4023ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5228.4984
(node:24408) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ ui store initial state matches the documented Phase C.1 defaults (2162.5115ms)
✔ ui store action functions update the state they claim to own (1956.7145ms)
✔ ui store readonly signals reflect dispatched state updates (2055.3188ms)
✔ focusRequestId increments monotonically on requestFocus() (1997.5604ms)
✔ focus-request subscription only fires when requestFocus increments (2027.603ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10316.963
✔ validation provenance scopes strict and observed payload figures and preserves magnitude-only wording (3.4185ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 85.9451

================ FINAL SUMMARY ================
files discovered:    111
files passed:        111
files failed:        0
files LOAD-TIMEOUT:  0
tests passed:        370
tests failed:        0
wall clock:          322.4s
accounting:          111 == 111 + 0 + 0 OK
VERIFY_EXIT=0
Finished: 2026-11-16T18:01:39.0296616-05:00

## Step 3 npm run verify
Started: 2026-11-16T18:02:07.7967223-05:00

> aster@0.1.0 verify
> npm run typecheck:v2 && npm run test:all


> aster@0.1.0 typecheck:v2
> tsc --noEmit


> aster@0.1.0 test:all
> node tools/run-tests.mjs

Discovered 111 test files (per-file watchdog: 180000 ms):
src\v2\app\catalog-list\row.test.mjs
src\v2\boundary\c3-grid.test.mjs
src\v2\porkchop\colormap.test.mjs
src\v2\porkchop\composite-grid.test.mjs
src\v2\porkchop\delta-v.test.mjs
src\v2\porkchop\dual-m-compute.test.mjs
src\v2\porkchop\grid-compute.test.mjs
src\v2\porkchop\launch-vehicles.test.mjs
src\v2\porkchop\propagation-guard.test.mjs
src\v2\porkchop\support-boundary.test.mjs
tests\phase6-contract-smoke.test.mjs
tests\setup-hooks.test.mjs
tests\v2-a11y-floor.test.mjs
tests\v2-about-copy.test.mjs
tests\v2-about-evidence.test.mjs
tests\v2-architecture.test.mjs
tests\v2-boundary-horizons.test.mjs
tests\v2-boundary-slice2.test.mjs
tests\v2-boundary-slice4.test.mjs
tests\v2-boundary-slice6.test.mjs
tests\v2-boundary-slice7.test.mjs
tests\v2-boundary-slice8.test.mjs
tests\v2-boundary-slice9.test.mjs
tests\v2-boundary-star-catalog.test.mjs
tests\v2-c3-value-type.test.mjs
tests\v2-catalog-count-binding.test.mjs
tests\v2-catalog-empty.test.mjs
tests\v2-catalog-threshold-disclosure.test.mjs
tests\v2-compare-data.test.mjs
tests\v2-compare-honesty.test.mjs
tests\v2-compare-url.test.mjs
tests\v2-coorbital-disclosure.test.mjs
tests\v2-core-constants.test.mjs
tests\v2-core-frames-jupiter.test.mjs
tests\v2-core-frames-mars.test.mjs
tests\v2-core-frames-saturn.test.mjs
tests\v2-core-hermite-jupiter.test.mjs
tests\v2-core-hermite-mars.test.mjs
tests\v2-core-hermite-saturn.test.mjs
tests\v2-core-hermite.test.mjs
tests\v2-core-keplerian.test.mjs
tests\v2-core-orbit-sampling.test.mjs
tests\v2-derived-span-labels.test.mjs
tests\v2-design-architecture.test.mjs
tests\v2-design-components.test.mjs
tests\v2-design-tokens.test.mjs
tests\v2-dla-display.test.mjs
tests\v2-dla-render.test.mjs
tests\v2-ephemeris-hud.test.mjs
tests\v2-f2-characterization.test.mjs
tests\v2-fk3-guided-tour.test.mjs
tests\v2-golden\launch-vehicles.golden.test.mjs
tests\v2-lambert\dla.test.mjs
tests\v2-lambert\feasibility.test.mjs
tests\v2-lambert\householder.test.mjs
tests\v2-lambert\hyp2f1b.test.mjs
tests\v2-lambert\initial-guess.test.mjs
tests\v2-lambert\lambert-endtoend.test.mjs
tests\v2-lambert\lambert-multi-rev-rejection.test.mjs
tests\v2-lambert\lambert-multi-rev.test.mjs
tests\v2-lambert\stumpff.test.mjs
tests\v2-lambert\tof.test.mjs
tests\v2-lambert\utc-to-tdb.test.mjs
tests\v2-lambert\vec3.test.mjs
tests\v2-light-time.test.mjs
tests\v2-near-zero-c3.test.mjs
tests\v2-porkchop-honesty.test.mjs
tests\v2-public-copy-render.test.mjs
tests\v2-public-copy.test.mjs
tests\v2-render-asteroid-cell-renderer.test.mjs
tests\v2-render-asteroid-orbits.test.mjs
tests\v2-render-asteroid-points-shader.test.mjs
tests\v2-render-asteroid-renderer.test.mjs
tests\v2-render-halos.test.mjs
tests\v2-render-jupiter-oblate.test.mjs
tests\v2-render-mars-oblate.test.mjs
tests\v2-render-mars-system.test.mjs
tests\v2-render-saturn-oblate.test.mjs
tests\v2-render-saturn-rings.test.mjs
tests\v2-render-spatial-grid.test.mjs
tests\v2-render-star-catalog.test.mjs
tests\v2-render-star-renderer.test.mjs
tests\v2-resolve-catalog-body.test.mjs
tests\v2-runtime-camera-presets.test.mjs
tests\v2-runtime-date-hud.test.mjs
tests\v2-runtime-display-integrity.test.mjs
tests\v2-runtime-focus.test.mjs
tests\v2-runtime-hover-tooltips.test.mjs
tests\v2-segment-windows.test.mjs
tests\v2-shortcut-and-method.test.mjs
tests\v2-slice1-cutover.test.mjs
tests\v2-slice1-integration.test.mjs
tests\v2-slice2-cutover.test.mjs
tests\v2-slice3-cutover.test.mjs
tests\v2-slice4-cutover.test.mjs
tests\v2-slice5-cutover.test.mjs
tests\v2-slice6-cutover.test.mjs
tests\v2-slice7-cutover.test.mjs
tests\v2-slice8-cutover.test.mjs
tests\v2-slice8-performance.test.mjs
tests\v2-slice9-cutover.test.mjs
tests\v2-slice9-live-runtime-integration.test.mjs
tests\v2-slice9-perf-config.test.mjs
tests\v2-slice9-reanchor-derived.test.mjs
tests\v2-slice9-spatial-index-harness.test.mjs
tests\v2-symmetric-return.test.mjs
tests\v2-tier-disclosure.test.mjs
tests\v2-tier-legend-render.test.mjs
tests\v2-ui-overlay.test.mjs
tests\v2-ui-store.test.mjs
tests\v2-validation-provenance.test.mjs

(node:44908) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ 2018 LA (L0, verified impact): LOW C3 badge suppressed; C3 kept with the last-known-orbit context (2905.053ms)
✔ 2015 D1 (L0, hyperbolic): "—" stays, PROP FAIL badge stays, no context is invented for a null C3 (0.2528ms)
✔ non-L0 rows are untouched: 433 (L2) and 99942 (L1) keep their badge and plain C3 (0.3109ms)
✔ near-zero C3 is a separate geometry flag and coexists with the screening status badge (0.3212ms)
✔ near-zero catalog disclosure remains byte-identical to the approved wording (0.1373ms)
✔ near-zero hide state replaces only the rendered value and badge, preserving the low-C3 badge and source value (0.1481ms)
✔ S18 Item 5: the tier badge tooltip is the full disclosure sentence, never the slug (0.2894ms)
✔ the rule is exactly {L0} x {low, high}: every other tier/status combination renders its badge (0.3687ms)
✔ catalog C3 grid label is derived from cache metadata and its tooltip carries the full grid details (0.193ms)
✔ CK-12 catalog C3 uses the shared three-significant-figure rule across its display range (0.2619ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3014.6275
✔ cached C3 grid descriptor and short label derive from cache metadata (1900.9112ms)
✔ requested C3 grid descriptor changes with the scan arguments (1801.7981ms)
✔ porkchop grid dimension wording is derived rather than literal (1912.144ms)
✔ T5 formatter output changes with its grid parameters (1926.2817ms)
✔ shared C3 grid label derives common step units from axis parameters (1925.6907ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9555.2428
✔ c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling (1931.5541ms)
✔ c3ToViridisRgb uses monotonic log normalization with a hard floor at C3 <= 1 (2087.5795ms)
✔ colorForPorkchopCell uses sentinel colors for no_solution and stall (1939.3417ms)
✔ non-finite C3 values use the existing no-solution colour (2228.9106ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8285.5425
✔ both families solve: strictly lower C3 wins (1919.3222ms)
✔ exact tie goes to M=0 and is counted (0.1625ms)
✔ only one family solves: that family is taken — the measured defect (0.13ms)
✔ neither solves: no_solution, but a stall is never collapsed (SLICE_11_FOUNDING.md:207) (0.1264ms)
✔ composite minimum is never worse than either single-family minimum (0.2202ms)
✔ per-cell provenance: every ok cell carries the M that produced it (0.105ms)
✔ AMD-2: the compared C3 is the selected branch, not branch 0 (0.1198ms)
✔ misaligned or mismatched grids throw rather than mis-pair cells (0.3271ms)
✔ counts account for every cell exactly once (0.1247ms)
✔ gridExtremes: both extremes on a normal grid (0.2233ms)
✔ gridExtremes: no_solution and stall cells are excluded (0.1556ms)
✔ gridExtremes: zero solvable cells returns an explicit empty variant (0.0764ms)
✔ gridExtremes: ties resolve to the lowest array index, for both extremes (0.0776ms)
✔ gridExtremes: over a composite grid whose extremes come from different families (0.3419ms)
✔ composite never exceeds M=0 per-cell wherever M=0 solves (structural — catches selection inversion) (0.1927ms)
✔ composite max <= M=0 max WHEN M=0 coverage is a superset (onlyM1 === 0) (0.092ms)
✔ the superset precondition is real: with onlyM1 > 0 the composite max CAN exceed M=0 max (0.0732ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2018.4696
✔ ΔV stack is mode-aware: one-way omits departure and sample return uses symmetric-return assumption (1946.6404ms)
✔ D10 labels name margin bases and preserve the displayed value expressions (1.6905ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2053.0524
✔ computeDualFamilyGrids issues exactly two messages, M=0 then M=1 (AMD-1) (2100.6405ms)
✔ computeDualFamilyGrids awaits sequentially — never two computes in flight (0.1862ms)
✔ computeDualFamilyGrids carries the request through unchanged, one M per message (0.3609ms)
✔ computeDualFamilyGrids returns both grids keyed by family (0.1231ms)
✔ computeDualFamilyGrids propagates a failure from either family unchanged (0.4342ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2193.6437
lambertMultiRev: no solution for M=1; T=0.579002371229731 < T_min=4.4030574920032794
✔ computePorkchopGrid round-trips three validated M=1 cells through JD+days boundary across the regime (2951.5829ms)
✔ computePorkchopGrid maps below-T_min cells to no_solution (1.3774ms)
✔ computePorkchopGrid selects the lower-C3 branch when both M=1 branches converge (0.6175ms)
✔ computePorkchopGrid maps all-failed synthetic solver output to stall (0.2737ms)
✔ porkchop worker init bootstraps Earth state and strips velocity internals from outbound branches (0.3717ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3087.5154
✔ launch vehicle catalog matches locked DEC-13-1 anchors exactly (1821.3899ms)
✔ payloadAtC3 interpolates linearly between published anchors (0.1815ms)
✔ payloadAtC3 never extrapolates past short published curves (0.1377ms)
✔ New Glenn keeps C3=30 anchor, interpolates steep interior, and stops after it (0.1381ms)
✔ payloadAtC3 refuses non-finite C3 separately from beyond-curve inputs (0.1316ms)
✔ deliveredMassKg excludes injection by construction and applies mode departure only for sample return (0.3105ms)
✔ spacecraft budget total is mode-owned and preserves every supplied term (0.1395ms)
✔ deliveredMassKg rejects corrupted budgets and invalid modes with INVALID_INPUT, never BEYOND_CURVE or a number (1.0466ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1961.1284
✔ guard agrees with the propagator on every catalog body (verified by propagating, not by reading the guard) (2879.4783ms)
✔ 2015 D1: the verdict carries the catalog eccentricity and the verbatim sentence (1.0135ms)
✔ message rounds the eccentricity to 4 decimals and invents nothing for a non-finite one (0.3672ms)
✔ computeCompareData: 2015 D1 is refused as a value in place; 433 and 2018 LA are byte-identical to the historical path (6.0949ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3002.1658
✔ 99942: the boundary comes from the committed artifact, and the partition matches the per-column formulation (2060.5232ms)
✔ edge behaviour: an encounter before the window makes every cell unsupported; after the last arrival, none (6.0936ms)
✔ no boundary is invented: non-L1 tiers and records without an encounter yield undefined (14.3247ms)
✔ the unsupported-cell sentence is verbatim (0.228ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2180.5844
✔ all texture assets referenced by legacy/index.html exist on disk (7.1628ms)
✔ legacy entry is frozen, noindexed, and points visitors to V2 (2.1774ms)
✔ worker README documents the worker routes implemented in worker/index.js (1.0878ms)
✔ worker README documents all environment variables used by worker/index.js (0.9362ms)
✔ worker README documents wildcard localhost development origin support (0.5624ms)
✔ physics worker no longer hardcodes NHATS and Asterank production route URLs (1.1996ms)
✔ .gitignore covers local worker secrets and wrangler state (0.758ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 109.8103
✔ prepare hook installer is silent and successful outside a git worktree (126.6714ms)
✔ prepare hook installer configures hooksPath inside a git worktree (317.1245ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 537.2816
(node:41300) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ contrast utility matches WCAG reference pairs and the three lightness overrides (2003.2558ms)
✔ catalog row is keyboard-focusable and Enter activates the same handler as click (2062.9816ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4175.0708
✔ About decision record carries no emoji (tail2 F7) (2759.143ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2844.5093
✔ About evidence links use rendered audit-copy VNodes and real heading fragments (1963.0042ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2050.3551
✔ src/v2 sources do not import internal modules outside src/v2 (111.4335ms)
✔ C3 grid label sites use derived formatters and contain no literal dimension labels (2.6997ms)
✔ INV-026 departure-end date is owned by grid-span.ts (57.2618ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 250.8777
✔ jdTdbToSecondsSinceJ2000 converts J2000-relative TDB days into seconds (1978.5906ms)
✔ Slice 1 Earth/Moon fixture ingests into canonical meters, m/s, and aligned TDB seconds (7.4211ms)
✔ convertHorizonsRecord accepts object-form records with Horizons-native aliases (0.7738ms)
✔ convertHorizonsRecord rotates ecliptic J2000 vectors into canonical ICRF coordinates (0.2468ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2095.835
✔ Slice 2 fixture file exists and parses as valid JSON (2.4199ms)
✔ Slice 2 fixture contains all six required target keys (1.0079ms)
✔ Each body in Slice 2 fixture has 90-92 records (91 ± 1) (1.4499ms)
✔ Moon records after ingestion have frame matching FRAME_GCRS_EARTH (1976.5185ms)
✔ All non-Moon bodies after ingestion have frame matching FRAME_HELIO_J2000_ICRF (5.5077ms)
✔ First Earth record position magnitude in meters is between 1.48e11 and 1.52e11 (~1 AU) (3.8387ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2087.5746
✔ Slice 4 fixture contains all eight required target keys (13.9961ms)
✔ Slice 4 fixture origin tags match heliocentric Saturn and saturn-centered moons (11.6482ms)
✔ inferCanonicalFrame maps saturn-centered origins to FRAME_SATURN_J2000_ICRF (2266.9405ms)
✔ Slice 4 tuple records ingest into canonical meters, m/s, TDB seconds, and Saturn-centered moon frames (66.7993ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2439.2113
✔ Slice 6 fixture contains all three required target keys (8.0968ms)
✔ Slice 6 fixture origin tags match heliocentric Mars and mars-centered moons (5.2262ms)
✔ inferCanonicalFrame maps mars-centered origins to FRAME_MARS_J2000_ICRF (2034.673ms)
✔ Slice 6 tuple records ingest into canonical meters, m/s, TDB seconds, and Mars-centered moon frames (45.2554ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2190.1382
✔ Slice 7 fixture contains the 1008-body hybrid catalog and required asteroid ids (10.0006ms)
✔ Slice 7 boundary ingestion preserves all 1008 asteroid records and the 8 curated NEAs (2060.6848ms)
✔ Slice 7 boundary spot-checks preserve Vesta, Bennu, and Apophis metadata and heliocentric frame (14.1314ms)
✔ Slice 7 boundary ingestion preserves anchor-position round-trip at the anchor epoch (15.7043ms)
✔ Slice 7 browser loader fetches and ingests the asteroid catalog fixture (12.3529ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2237.0254
✔ Slice 8 fixture exists and contains the 10,008-body catalog (69.7111ms)
✔ Slice 8 boundary ingestion preserves all 10,008 asteroid records and the Slice 7 subset (2200.2416ms)
✔ Slice 8 boundary spot-checks preserve Vesta, Bennu, Apophis, and new extension bodies (137.3235ms)
✔ Slice 8 band distribution and orbit-line count match Round 3 within tolerance (121.392ms)
✔ Slice 8 browser loader fetches and ingests the asteroid catalog fixture (126.4684ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2775.0405
✔ Slice 9 fixture exists and contains the live 41,906-body NEA catalog (338.9012ms)
✔ Slice 9 boundary ingestion preserves the full catalog and tier counts (2427.5906ms)
✔ Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies (469.4889ms)
✔ Slice 9 quality metadata and anchor semantics stay internally consistent (520.1853ms)
✔ Slice 9 browser loader fetches and ingests the NEA catalog fixture (474.7185ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4373.3324
✔ load succeeds, count matches header, and Sirius sorts first (2010.6363ms)
✔ positions are unit vectors, magnitudes are sane, and colors stay in range (7.9603ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2102.4391
✔ C3Value requires a typed grid descriptor (1001.4102ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1087.1987
AboutPage is not exported; semantic intro assertion skipped by contract.
✔ catalog count constant is bound to the committed catalog data (2297.8938ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2410.9259
✔ catalog renders distinct loading, failed, and empty-after-filter states (2043.0392ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2139.5414
✔ CK-13 renders the cache-derived LOW C3 screening threshold in the catalog legend (2185.358ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2300.3728
✔ grid-compute fills TOF-fastest (index = depIdx * nTof + tofIdx) (2069.0632ms)
✔ D-01 toSegmentGrid remaps grid-compute layout to departure-fastest (0.3334ms)
✔ D-01 LOCK: breadth is measured on the DEPARTURE axis (asymmetric grid) (1.2865ms)
✔ D-02 the departure epoch threaded into segmentation is span.requested.start (0.2451ms)
✔ D-02 BLIND SPOT: column 0 cannot discriminate the two anchors (0.1504ms)
✔ D-02 SENSITIVITY: a 69.184 s anchor shift does flip dateIso across a midnight straddle (0.4604ms)
✔ D-02 computeCompareData threads the injected anchor into argmin.dateIso (1.5735ms)
✔ T1 compare result carries payload-at-C3 and the full spacecraft budget (0.3283ms)
✔ T7 compare data preserves measured grid timing and exposes missing timing as zero (0.5585ms)
✔ D-03 injected absoluteKm2S2 is used, never the module default of 25 (0.3437ms)
✔ D-03 injection changes membership, proving the value is load-bearing (0.2947ms)
✔ D-04 echo carries liveMin, delta, absolute, and grid geometry from the computation (0.2024ms)
✔ D-04 relative-mode threshold equals echoed liveMin + delta (0.1389ms)
✔ DEC-17-10 out-of-bounds departure window returns a structured refusal (0.104ms)
✔ DEC-17-10 refusal is a value — a start before the first sample does not throw (0.186ms)
✔ a grid with no converged cell refuses with no-convergence (0.0922ms)
✔ DEC-17-6 cap: bodies beyond 5 are refused with cap-exceeded, first 5 computed (0.6101ms)
✔ serial orchestration preserves input order and is deterministic (1.1079ms)
✔ deliveredMass is null on NO-PRACTICAL-WINDOW rather than a fabricated number (0.2671ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2186.7729
(node:45800) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ T1 compare rows render the near-zero flag only for sub-threshold minima and preserve values (2539.9482ms)
✔ T2 compare hide state preserves practical order and dominance while replacing flagged values (2470.0849ms)
✔ T3 compare size factors are derived from the imported albedo constants in both directions (2426.0611ms)
✔ W3a compare flags an Apophis window arriving after support without changing ranking data (2589.219ms)
✔ W3b compare exposes delivered-mass anchors, NASA contract context, and the New Glenn caveat (2455.5707ms)
✔ T7 compare badge refuses timing when any grid lacks a measurement (2382.3136ms)
✔ compare defines the breadth qualifier from B_min and the sampling interval (tail2 F7) (2385.4386ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 17360.9747
✔ parse: basic list, with and without leading ? and other params (2086.128ms)
✔ parse: missing or empty parameter yields [] (0.3744ms)
✔ parse: dedupes, first occurrence wins (0.3271ms)
✔ parse: caps at 5 (0.2809ms)
✔ parse: junk is rejected, valid neighbors survive (0.2206ms)
✔ parse: URL-encoded internal spaces decode and survive (0.0866ms)
✔ serialize: joins, dedupes, caps, drops junk; empty yields empty string (0.1356ms)
✔ round-trip: parse(serialize(x)) is the sanitized x (0.1479ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2201.7062
✔ co-orbital disclosure attributes the rendered comparison to patched-conic methods (1814.8267ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1912.1868
PASS tsc compilation
PASS BODY_CONSTANTS has key 'sun'
PASS BODY_CONSTANTS has key 'mercury'
PASS BODY_CONSTANTS has key 'venus'
PASS BODY_CONSTANTS has key 'earth'
PASS BODY_CONSTANTS has key 'moon'
PASS BODY_CONSTANTS has key 'mars'
PASS BODY_CONSTANTS has key 'phobos'
PASS BODY_CONSTANTS has key 'deimos'
PASS BODY_CONSTANTS has key 'jupiter'
PASS BODY_CONSTANTS has key 'io'
PASS BODY_CONSTANTS has key 'europa'
PASS BODY_CONSTANTS has key 'ganymede'
PASS BODY_CONSTANTS has key 'callisto'
PASS BODY_CONSTANTS has key 'saturn'
PASS BODY_CONSTANTS has key 'titan'
PASS BODY_CONSTANTS has key 'rhea'
PASS BODY_CONSTANTS has key 'iapetus'
PASS BODY_CONSTANTS has key 'tethys'
PASS BODY_CONSTANTS has key 'dione'
PASS BODY_CONSTANTS has key 'mimas'
PASS BODY_CONSTANTS has key 'enceladus'
PASS BODY_CONSTANTS['sun'].radiusM > 0
PASS BODY_CONSTANTS['mercury'].radiusM > 0
PASS BODY_CONSTANTS['venus'].radiusM > 0
PASS BODY_CONSTANTS['earth'].radiusM > 0
PASS BODY_CONSTANTS['moon'].radiusM > 0
PASS BODY_CONSTANTS['mars'].radiusM > 0
PASS BODY_CONSTANTS['phobos'].radiusM > 0
PASS BODY_CONSTANTS['deimos'].radiusM > 0
PASS BODY_CONSTANTS['jupiter'].radiusM > 0
PASS BODY_CONSTANTS['io'].radiusM > 0
PASS BODY_CONSTANTS['europa'].radiusM > 0
PASS BODY_CONSTANTS['ganymede'].radiusM > 0
PASS BODY_CONSTANTS['callisto'].radiusM > 0
PASS BODY_CONSTANTS['saturn'].radiusM > 0
PASS BODY_CONSTANTS['titan'].radiusM > 0
PASS BODY_CONSTANTS['rhea'].radiusM > 0
PASS BODY_CONSTANTS['iapetus'].radiusM > 0
PASS BODY_CONSTANTS['tethys'].radiusM > 0
PASS BODY_CONSTANTS['dione'].radiusM > 0
PASS BODY_CONSTANTS['mimas'].radiusM > 0
PASS BODY_CONSTANTS['enceladus'].radiusM > 0
PASS BODY_CONSTANTS['sun'].naifId > 0
PASS BODY_CONSTANTS['mercury'].naifId > 0
PASS BODY_CONSTANTS['venus'].naifId > 0
PASS BODY_CONSTANTS['earth'].naifId > 0
PASS BODY_CONSTANTS['moon'].naifId > 0
PASS BODY_CONSTANTS['mars'].naifId > 0
PASS BODY_CONSTANTS['phobos'].naifId > 0
PASS BODY_CONSTANTS['deimos'].naifId > 0
PASS BODY_CONSTANTS['jupiter'].naifId > 0
PASS BODY_CONSTANTS['io'].naifId > 0
PASS BODY_CONSTANTS['europa'].naifId > 0
PASS BODY_CONSTANTS['ganymede'].naifId > 0
PASS BODY_CONSTANTS['callisto'].naifId > 0
PASS BODY_CONSTANTS['saturn'].naifId > 0
PASS BODY_CONSTANTS['titan'].naifId > 0
PASS BODY_CONSTANTS['rhea'].naifId > 0
PASS BODY_CONSTANTS['iapetus'].naifId > 0
PASS BODY_CONSTANTS['tethys'].naifId > 0
PASS BODY_CONSTANTS['dione'].naifId > 0
PASS BODY_CONSTANTS['mimas'].naifId > 0
PASS BODY_CONSTANTS['enceladus'].naifId > 0
PASS BODY_CONSTANTS['sun'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mercury'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['venus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['earth'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['moon'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mars'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['phobos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['deimos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['jupiter'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['io'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['europa'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['ganymede'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['callisto'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['saturn'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['titan'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['rhea'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['iapetus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['tethys'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['dione'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mimas'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['enceladus'].vizColor in [0x000000, 0xFFFFFF]
PASS INV008_BARS_M has key 'sun'
PASS INV008_BARS_M has key 'mercury'
PASS INV008_BARS_M has key 'venus'
PASS INV008_BARS_M has key 'earth'
PASS INV008_BARS_M has key 'moon'
PASS INV008_BARS_M has key 'mars'
PASS INV008_BARS_M['sun'] > 0
PASS INV008_BARS_M['mercury'] > 0
PASS INV008_BARS_M['venus'] > 0
PASS INV008_BARS_M['earth'] > 0
PASS INV008_BARS_M['moon'] > 0
PASS INV008_BARS_M['mars'] > 0
PASS INV010_BARS_M has key 'saturn'
PASS INV010_BARS_M has key 'titan'
PASS INV010_BARS_M has key 'rhea'
PASS INV010_BARS_M has key 'iapetus'
PASS INV010_BARS_M has key 'tethys'
PASS INV010_BARS_M has key 'dione'
PASS INV010_BARS_M has key 'mimas'
PASS INV010_BARS_M has key 'enceladus'
PASS INV010_BARS_M['saturn'] > 0
PASS INV010_BARS_M['titan'] > 0
PASS INV010_BARS_M['rhea'] > 0
PASS INV010_BARS_M['iapetus'] > 0
PASS INV010_BARS_M['tethys'] > 0
PASS INV010_BARS_M['dione'] > 0
PASS INV010_BARS_M['mimas'] > 0
PASS INV010_BARS_M['enceladus'] > 0
PASS INV011_BARS_M has key 'phobos'
PASS INV011_BARS_M has key 'deimos'
PASS INV011_BARS_M['phobos'] > 0
PASS INV011_BARS_M['deimos'] > 0
PASS INTERPOLATION_ERROR_BARS_M has key 'sun'
PASS BODY_CADENCE_SECONDS has key 'sun'
PASS BODY_INTERPOLATION_INVARIANTS has key 'sun'
PASS INTERPOLATION_ERROR_BARS_M has key 'mercury'
PASS BODY_CADENCE_SECONDS has key 'mercury'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mercury'
PASS INTERPOLATION_ERROR_BARS_M has key 'venus'
PASS BODY_CADENCE_SECONDS has key 'venus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'venus'
PASS INTERPOLATION_ERROR_BARS_M has key 'earth'
PASS BODY_CADENCE_SECONDS has key 'earth'
PASS BODY_INTERPOLATION_INVARIANTS has key 'earth'
PASS INTERPOLATION_ERROR_BARS_M has key 'moon'
PASS BODY_CADENCE_SECONDS has key 'moon'
PASS BODY_INTERPOLATION_INVARIANTS has key 'moon'
PASS INTERPOLATION_ERROR_BARS_M has key 'mars'
PASS BODY_CADENCE_SECONDS has key 'mars'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mars'
PASS INTERPOLATION_ERROR_BARS_M has key 'phobos'
PASS BODY_CADENCE_SECONDS has key 'phobos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'phobos'
PASS INTERPOLATION_ERROR_BARS_M has key 'deimos'
PASS BODY_CADENCE_SECONDS has key 'deimos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'deimos'
PASS INTERPOLATION_ERROR_BARS_M has key 'jupiter'
PASS BODY_CADENCE_SECONDS has key 'jupiter'
PASS BODY_INTERPOLATION_INVARIANTS has key 'jupiter'
PASS INTERPOLATION_ERROR_BARS_M has key 'io'
PASS BODY_CADENCE_SECONDS has key 'io'
PASS BODY_INTERPOLATION_INVARIANTS has key 'io'
PASS INTERPOLATION_ERROR_BARS_M has key 'europa'
PASS BODY_CADENCE_SECONDS has key 'europa'
PASS BODY_INTERPOLATION_INVARIANTS has key 'europa'
PASS INTERPOLATION_ERROR_BARS_M has key 'ganymede'
PASS BODY_CADENCE_SECONDS has key 'ganymede'
PASS BODY_INTERPOLATION_INVARIANTS has key 'ganymede'
PASS INTERPOLATION_ERROR_BARS_M has key 'callisto'
PASS BODY_CADENCE_SECONDS has key 'callisto'
PASS BODY_INTERPOLATION_INVARIANTS has key 'callisto'
PASS INTERPOLATION_ERROR_BARS_M has key 'saturn'
PASS BODY_CADENCE_SECONDS has key 'saturn'
PASS BODY_INTERPOLATION_INVARIANTS has key 'saturn'
PASS INTERPOLATION_ERROR_BARS_M has key 'titan'
PASS BODY_CADENCE_SECONDS has key 'titan'
PASS BODY_INTERPOLATION_INVARIANTS has key 'titan'
PASS INTERPOLATION_ERROR_BARS_M has key 'rhea'
PASS BODY_CADENCE_SECONDS has key 'rhea'
PASS BODY_INTERPOLATION_INVARIANTS has key 'rhea'
PASS INTERPOLATION_ERROR_BARS_M has key 'iapetus'
PASS BODY_CADENCE_SECONDS has key 'iapetus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'iapetus'
PASS INTERPOLATION_ERROR_BARS_M has key 'tethys'
PASS BODY_CADENCE_SECONDS has key 'tethys'
PASS BODY_INTERPOLATION_INVARIANTS has key 'tethys'
PASS INTERPOLATION_ERROR_BARS_M has key 'dione'
PASS BODY_CADENCE_SECONDS has key 'dione'
PASS BODY_INTERPOLATION_INVARIANTS has key 'dione'
PASS INTERPOLATION_ERROR_BARS_M has key 'mimas'
PASS BODY_CADENCE_SECONDS has key 'mimas'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mimas'
PASS INTERPOLATION_ERROR_BARS_M has key 'enceladus'
PASS BODY_CADENCE_SECONDS has key 'enceladus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'enceladus'
PASS body-class tagging covers fixed bodies and asteroid ids
PASS BODY_CONSTANTS['jupiter'].naifId matches README
PASS BODY_CONSTANTS['jupiter'].radiusM matches README
PASS BODY_CONSTANTS['jupiter'].vizColor matches README
PASS BODY_CADENCE_SECONDS['jupiter'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['jupiter'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['jupiter'] matches Slice 3 invariant
PASS BODY_CONSTANTS['jupiter'].radiiM matches README triaxial values
PASS BODY_CONSTANTS['io'].naifId matches README
PASS BODY_CONSTANTS['io'].radiusM matches README
PASS BODY_CONSTANTS['io'].vizColor matches README
PASS BODY_CADENCE_SECONDS['io'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['io'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['io'] matches Slice 3 invariant
PASS BODY_CONSTANTS['europa'].naifId matches README
PASS BODY_CONSTANTS['europa'].radiusM matches README
PASS BODY_CONSTANTS['europa'].vizColor matches README
PASS BODY_CADENCE_SECONDS['europa'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['europa'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['europa'] matches Slice 3 invariant
PASS BODY_CONSTANTS['ganymede'].naifId matches README
PASS BODY_CONSTANTS['ganymede'].radiusM matches README
PASS BODY_CONSTANTS['ganymede'].vizColor matches README
PASS BODY_CADENCE_SECONDS['ganymede'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['ganymede'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['ganymede'] matches Slice 3 invariant
PASS BODY_CONSTANTS['callisto'].naifId matches README
PASS BODY_CONSTANTS['callisto'].radiusM matches README
PASS BODY_CONSTANTS['callisto'].vizColor matches README
PASS BODY_CADENCE_SECONDS['callisto'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['callisto'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['callisto'] matches Slice 3 invariant
PASS BODY_CONSTANTS['mars'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['mars'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['mars'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['mars'] matches Slice 6 invariant
PASS BODY_CONSTANTS['mars'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['phobos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['phobos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['phobos'] matches Slice 6 invariant
PASS INV011_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_CONSTANTS['phobos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['deimos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['deimos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['deimos'] matches Slice 6 invariant
PASS INV011_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_CONSTANTS['deimos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['saturn'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['saturn'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['saturn'] matches Slice 4 invariant
PASS INV010_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_CONSTANTS['saturn'].radiiM matches Slice 4 triaxial values
PASS BODY_CONSTANTS['titan'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['titan'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['titan'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['titan'] matches Slice 4 invariant
PASS INV010_BARS_M['titan'] matches Slice 4 bar
PASS BODY_CONSTANTS['rhea'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['rhea'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['rhea'] matches Slice 4 invariant
PASS INV010_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_CONSTANTS['iapetus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['iapetus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['iapetus'] matches Slice 4 invariant
PASS INV010_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_CONSTANTS['tethys'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['tethys'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['tethys'] matches Slice 4 invariant
PASS INV010_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_CONSTANTS['dione'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['dione'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['dione'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['dione'] matches Slice 4 invariant
PASS INV010_BARS_M['dione'] matches Slice 4 bar
PASS BODY_CONSTANTS['mimas'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['mimas'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['mimas'] matches Slice 4 invariant
PASS INV010_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_CONSTANTS['enceladus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['enceladus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['enceladus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['enceladus'] matches Slice 4 invariant
PASS INV010_BARS_M['enceladus'] matches Slice 4 bar
PASS SATURN_D_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_C_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_A_RING_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_HUYGENS_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_OUTER_RADIUS_M matches Slice 5 docs
PASS createAsteroidCatalogIndex ingests all 1008 asteroid records
PASS createAsteroidCatalogIndex identifies the 8 curated NEAs
PASS eccentricityBandForBody(0.0999) returns A
PASS eccentricityBandForBody(0.1) returns B
PASS eccentricityBandForBody(0.1999) returns B
PASS eccentricityBandForBody(0.2) returns C
PASS eccentricityBandForBody(0.2999) returns C
PASS eccentricityBandForBody(0.3) returns D
PASS hasOrbitLineForBody(10.97) returns true
PASS hasOrbitLineForBody(10.98) returns false
PASS hasOrbitLineForBody(10.99) returns false
PASS curated NEA designation 101955 remains flagged
PASS curated NEA designation 99942 remains flagged
PASS curated NEA designation 433 remains flagged
PASS curated NEA designation 25143 remains flagged
PASS curated NEA designation 162173 remains flagged
PASS curated NEA designation 4179 remains flagged
PASS curated NEA designation 1620 remains flagged
PASS curated NEA designation 4769 remains flagged
PASS asteroid lookup works by designation and SPK id for Bennu
PASS estimatedRadiusM matches the H-derived default-albedo formula for Bennu
PASS Slice 7 asteroid fixture entries can be extended with Slice 8 band and orbit-line metadata

All assertions passed.
✔ tests\v2-core-constants.test.mjs (1927.6777ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1932.8267
slice3MaxRoundTripError=0
slice3MaxChainTenError=0
✔ Slice 3 boundary ingestion tags Galileans as FRAME_JUPITER_J2000_ICRF (2256.4059ms)
✔ Slice 3 HELIO ↔ JUPITER round-trip stays within one-pass and ten-chain bounds (28.3776ms)
✔ Slice 1 HELIO ↔ GCRS round-trip still works unchanged (4.1749ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2391.41
slice6MarsMaxRoundTripError=0
slice6MarsMaxChainTenError=0
slice6MarsMoonMaxHelioRoundTripError=0
slice6MarsMoonMaxChainTenError=0
slice6MarsMoonMaxNativeRoundTripRelativeError=1.6947555828275902e-12
✔ Slice 6 HELIO ↔ MARS direct round-trip on Mars heliocentric states stays within bounds (2069.6364ms)
✔ Slice 6 HELIO ↔ MARS round-trip on interpolated Mars-centered moon states stays within bounds (45.4304ms)
✔ Slice 6 frame additions preserve GCRS, Jupiter, and Saturn paths (113.1021ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2329.4793
slice4SaturnMaxRoundTripError=0
slice4SaturnMaxChainTenError=0
slice4MoonMaxHelioRoundTripError=0
slice4MoonMaxChainTenError=0
slice4MoonMaxNativeRoundTripRelativeError=6.335544898437588e-13
✔ Slice 4 HELIO ↔ SATURN direct round-trip on Saturn heliocentric states stays within bounds (2177.5573ms)
✔ Slice 4 HELIO ↔ SATURN round-trip on interpolated Saturn-centered moon states stays within bounds (49.7366ms)
✔ Slice 4 frame additions preserve Jupiter and GCRS paths (31.3405ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2356.2541
slice3Hermite jupiter maxErrorKm=7.142806491701069 rmsErrorKm=4.199738159183813 barKm=50 checked=4319
slice3Hermite io maxErrorKm=0.5442963290723388 rmsErrorKm=0.33658103781622706 barKm=5 checked=8639
slice3Hermite europa maxErrorKm=4.50430937666286 rmsErrorKm=2.6736541902238957 barKm=20 checked=4319
slice3Hermite ganymede maxErrorKm=6.610468763880747 rmsErrorKm=4.127952978794724 barKm=20 checked=4319
slice3Hermite callisto maxErrorKm=7.016665103601909 rmsErrorKm=3.928974726508747 barKm=50 checked=4319
✔ Slice 3 Jupiter-system Hermite interpolation stays below INV-009 bars (2557.437ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2651.2113
slice6Hermite mars maxErrorKm=0.008932563975280729 rmsErrorKm=0.005288750696475446 barKm=0.05 checked=270
slice6Hermite phobos maxErrorKm=0.7787715830854933 rmsErrorKm=0.48601715486892844 barKm=5 checked=21600
slice6Hermite deimos maxErrorKm=0.11319505860637424 rmsErrorKm=0.08328683543873051 barKm=0.5 checked=6480
✔ Slice 6 Mars-system Hermite interpolation stays below INV-008/INV-011 bars with pre-research-matching error (2714.3692ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2815.9743
slice4Hermite saturn maxErrorKm=0.2023990147891148 rmsErrorKm=0.06964598071541636 barKm=1 checked=4319
slice4Hermite titan maxErrorKm=6.034245679338891 rmsErrorKm=3.150894748674291 barKm=20 checked=4319
slice4Hermite rhea maxErrorKm=1.2646108832459069 rmsErrorKm=0.7992468821770016 barKm=5 checked=4319
slice4Hermite iapetus maxErrorKm=0.6187833209615409 rmsErrorKm=0.25170364508742626 barKm=2 checked=4319
slice4Hermite tethys maxErrorKm=0.2843355703425951 rmsErrorKm=0.1812933392207793 barKm=1 checked=8639
slice4Hermite dione maxErrorKm=6.777691855843222 rmsErrorKm=4.24466979005391 barKm=50 checked=4319
slice4Hermite mimas maxErrorKm=3.3593358528420176 rmsErrorKm=1.8574590119921746 barKm=20 checked=8639
slice4Hermite enceladus maxErrorKm=0.8570913723667154 rmsErrorKm=0.5277623322167538 barKm=5 checked=8639
✔ Slice 4 Saturn-system Hermite interpolation stays below INV-010 bars (2930.9482ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3025.1657
PASS tsc compilation
PASS interpolate at t0 returns s0 position (rel err < 1e-9)
PASS interpolate at t1 returns s1 position (rel err < 1e-9)
PASS interpolate at midpoint returns finite position
PASS assertInterpolationError throws AssertError for Earth error 1000 m (> 500 m bar)
PASS Earth interpolation overflow routes to INV-008
PASS assertInterpolationError does not throw for Earth error 100 m (< 500 m bar)
PASS assertInterpolationError throws AssertError for Tethys error 1100 m (> 1 km bar)
PASS Tethys interpolation overflow routes to INV-010
PASS Tethys overflow includes bodyId detail
PASS Tethys overflow includes measuredErrorKm detail
PASS Tethys overflow includes barKm detail
PASS Tethys overflow includes cadence from constants
PASS assertInterpolationError does not throw in report mode for Enceladus overflow
PASS assertInterpolationError emits one report-mode violation for Enceladus overflow
PASS Report-mode Enceladus overflow routes to INV-010
PASS Report-mode Enceladus overflow includes bodyId detail
PASS Report-mode Enceladus overflow includes measuredErrorKm detail
PASS Report-mode Enceladus overflow includes barKm detail
PASS Report-mode Enceladus overflow includes tdbSeconds detail
PASS Report-mode Enceladus overflow includes cadence from constants
PASS assertInterpolationError throws AssertError for Phobos error 5100 m (> 5 km bar)
PASS Phobos interpolation overflow routes to INV-011
PASS Phobos overflow includes bodyId detail
PASS Phobos overflow includes measuredErrorKm detail
PASS Phobos overflow includes barKm detail
PASS Phobos overflow includes 30-minute cadence detail
PASS assertInterpolationError does not throw in report mode for Deimos overflow
PASS assertInterpolationError emits one report-mode violation for Deimos overflow
PASS Report-mode Deimos overflow routes to INV-011
PASS Report-mode Deimos overflow includes bodyId detail
PASS Report-mode Deimos overflow includes measuredErrorKm detail
PASS Report-mode Deimos overflow includes barKm detail
PASS Report-mode Deimos overflow includes tdbSeconds detail
PASS Report-mode Deimos overflow includes 1-hour cadence detail

All assertions passed.
✔ tests\v2-core-hermite.test.mjs (2063.9357ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2069.36
✔ propagateKeplerianStateVectors reproduces the fixture anchor state within one meter (2158.3585ms)
✔ forward 30d epoch shift then backward propagation returns to the initial state within one meter (4.0554ms)
✔ angular momentum and specific orbital energy remain conserved over 90 days (4.5565ms)
✔ high-e solver converges within the iteration cap (0.1548ms)
✔ production Keplerian port matches the round-2 Vesta day-90 research residual (5.492ms)
✔ assertKeplerianError routes asteroid overflows to INV-012 (0.827ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2285.6086
✔ Vesta orbit samples close cleanly at 64 segments (1901.1624ms)
✔ Apophis high-e orbit uses expected radius law across the sampled ellipse (5.9112ms)
✔ sampled orbit points satisfy the conic radius equation for Vesta (5.9751ms)
✔ sampled orbit vectors preserve the independently derived canonical orientation (4.2504ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2023.9706
✔ catalog and porkchop span labels derive full dates from their own parameters (4613.9692ms)
✔ catalog footer quotes the cache end and the porkchop grid end from their own constants (1796.2153ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6485.3825
✔ C3 formatting is owned by C3Value outside the pure formatter (39.7666ms)
✔ badge construction is owned by shared design components (35.2038ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 164.8238
✔ shared honesty components preserve the characterization fixture (2003.3005ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2083.8366
✔ design tokens are deterministic and provenance-pinned (5.7048ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 129.9375
✔ DLA feasibility labels import the production view vocabulary (2316.7179ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2401.1298
(node:36476) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ DLA disclosure, site picker, and band legend render with contours off and on (14914.3432ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15064.4974
✔ tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning (1917.3685ms)
✔ tracking inside coverage mounts LIVE without a warning (1774.5123ms)
✔ outside coverage the HUD date line is marked clamped and Shift+N help tells the truth (1933.1925ms)
✔ coverage line gains a refresh-due notice in the last 14 days of coverage only (1857.2303ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7639.4221
✔ F2 characterization fixture records the HEAD honesty text across all three surfaces (0.557ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 106.2271
✔ FK3 AMBER tour explains zero added Delta-V while RED still names dogleg (2298.6424ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2408.336
✔ payloadAtC3 New Glenn/Standard C3=0 === 7180 kg (0.7476ms)
✔ payloadAtC3 New Glenn/Standard C3=5 === 6055 kg (0.0887ms)
✔ payloadAtC3 New Glenn/Standard C3=20 === 2365 kg (0.0633ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=0 === 15010 kg (0.7371ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=5 === 13677.5 kg (0.0876ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=20 === 10115 kg (0.0625ms)
✔ payloadAtC3 Vulcan/VC6 C3=0 === 10850 kg (0.0595ms)
✔ payloadAtC3 Vulcan/VC6 C3=5 === 9990 kg (0.0728ms)
✔ payloadAtC3 Vulcan/VC6 C3=20 === 7630 kg (0.0938ms)
✔ deliveredMassKg New Glenn/Standard C3=5 one-way === 3494.511538898568 kg (0.2713ms)
✔ every launch-vehicle anchor carries a source-derived basis (0.0898ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 150.3835
✔ tests\v2-lambert\dla.test.mjs (2039.4731ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2052.2264
✔ tests\v2-lambert\feasibility.test.mjs (2090.5256ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2098.9094
householder.test: PASS
✔ tests\v2-lambert\householder.test.mjs (1945.6116ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1951.4651
hyp2f1b.test: PASS
✔ tests\v2-lambert\hyp2f1b.test.mjs (1961.5669ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1971.2831
initial-guess.test: PASS
✔ tests\v2-lambert\initial-guess.test.mjs (2023.6772ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2029.3446
lambert-endtoend.test: PASS
✔ tests\v2-lambert\lambert-endtoend.test.mjs (2060.5999ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2066.3132
lambert-multi-rev-rejection.test: PASS
✔ tests\v2-lambert\lambert-multi-rev-rejection.test.mjs (1992.6737ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2001.7213
lambertMultiRev: no solution for M=1; T=0.5790023712295225 < T_min=4.403057492003494
lambertMultiRev: no solution for M=2; T=6.224170889575949 < T_min=7.768035471712736
lambertMultiRev: no solution for M=1; T=1.8936975346281286 < T_min=4.565433395618
lambertMultiRev: no solution for M=1; T=3.142611278377002 < T_min=4.589850624734614
lambertMultiRev: no solution for M=1; T=4.401579074102609 < T_min=4.711344422248995
lambertMultiRev: no solution for M=1; T=4.603344913728462 < T_min=4.73916181439084
lambertMultiRev: no solution for M=1; T=4.708577625250112 < T_min=4.754505056873685
lambertMultiRev: no solution for M=1; T=4.762318080262853 < T_min=4.762559475692091
lambertMultiRev: no solution for M=1; T=4.76252949463941 < T_min=4.762591453257581
lambertMultiRev: no solution for M=1; T=4.762582350055022 < T_min=4.762599448281306
lambertMultiRev: no solution for M=1; T=4.762595564022766 < T_min=4.7626014470767615
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambert-multi-rev.test: PASS
✔ tests\v2-lambert\lambert-multi-rev.test.mjs (3012.8594ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3020.1332
stumpff.test: PASS
✔ tests\v2-lambert\stumpff.test.mjs (1974.3729ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1979.9993
tof.test: PASS
✔ tests\v2-lambert\tof.test.mjs (2010.3997ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2021.6486
utc-to-tdb.test: PASS
✔ tests\v2-lambert\utc-to-tdb.test.mjs (1956.7486ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1962.534
vec3.test: PASS
✔ tests\v2-lambert\vec3.test.mjs (1964.0891ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1973.9171
✔ K4 light time uses Earth distance, two significant figures, and inherited tier caveats (1915.0385ms)
✔ K4 refuses every ruled invalid state without displaying a number (2142.2873ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4158.0399
✔ tests\v2-near-zero-c3.test.mjs (2075.8887ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2082.5185
✔ T3 Porkchop extremes and pinned readout flag, hide, and restore the same C3 source value (3942.044ms)
✔ K7 pin callback publishes the newly pinned cell while replacement computation is pending (3739.5625ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7804.0451
(node:38376) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog disclosure renders plain-English public copy (2248.4541ms)
✔ About audit exhibits render plain-English titles and evidence labels (2197.8366ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4539.4582
✔ public disclosure sections render without internal taxonomy identifiers or duplicated trust numbers (1965.0518ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2055.6267
✔ construction distributes the Slice 8 catalog across the measured 1 AU cells (2551.102ms)
✔ off-axis outer-system view culls some occupied cells (143.3402ms)
✔ focused close-zoom keeps visible cells in a small local neighborhood (123.5893ms)
✔ cells near the frustum edge stay visible across a +/-0.5 degree camera sweep (1.4319ms)
✔ raycastIntersectCells returns null for misses, hits the expected body, and reassigns across cells after position changes (2.5212ms)
✔ rendered instanced position matches the propagated world position used for focus truth (142.7453ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3095.5253
✔ orbit-batch geometry uses the expected concatenated vertex count (2233.0554ms)
✔ orbit-batch material matches the DEC-11 MVP line settings (24.5706ms)
✔ orbit-batch vertices for Vesta match the sampled ellipse positions (21.9118ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2383.4724
✔ asteroid points shader material constructs with additive soft-glow settings (2266.072ms)
✔ ALIASED_POINT_SIZE_RANGE query falls back cleanly when no GL context exists (0.6469ms)
✔ per-point color attribute distinguishes curated NEAs from main-belt asteroids (4.5084ms)
✔ overview Vesta-sized points land in the tuned 4-8 px visibility band (1.9234ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2366.5598
✔ sub-pixel asteroid renders in Points mode (2152.0585ms)
✔ mid-zoom asteroid renders in InstancedMesh mode (1.5954ms)
✔ focused asteroid renders in individual Mesh mode when resolved (1.8653ms)
✔ hysteresis keeps a near-threshold asteroid stable around 1.7 px (0.0998ms)
✔ Points, InstancedMesh, and focused Mesh agree on world position (1.6562ms)
✔ focused asteroid gets a highlighted orbit while the main orbit batch stays visible in browse-scale focus (0.9296ms)
✔ main orbit batch fades out when the focused asteroid reaches close-inspection mesh mode (0.5029ms)
✔ main orbit batch excludes asteroids below the hasOrbitLine threshold while focused orbit highlight still works (0.6096ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2280.8318
✔ halo opacity stays at full base opacity below the full-visibility threshold (1970.0494ms)
✔ halo opacity fades linearly through the hysteresis transition zone (0.1744ms)
✔ halo opacity reaches zero at and above the invisible threshold (0.0902ms)
✔ Saturn moon halo floors vary by moon size with Titan at least 3x Mimas (0.1201ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2074.7456
✔ Jupiter oblate mesh extents match documented radii (1859.6182ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1958.4138
✔ Mars oblate mesh extents match documented radii (1951.5272ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2061.9058
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:49272) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phobos rendered world position equals its heliocentric focus anchor (3071.5462ms)
✔ Deimos rendered world position equals its heliocentric focus anchor (48.0664ms)
✔ Mars body mesh receives the documented render-only tilt (49.0279ms)
✔ Mars moons do not inherit the render-only tilt (35.2796ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3325.0149
✔ Saturn oblate mesh extents match documented radii (1910.1558ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2013.6055
✔ Saturn ring local plane stays on XZ with +Y normals (1816.312ms)
✔ Saturn main ring and Cassini geometry radii match spec (7.4766ms)
✔ Saturn ring opacity sampling preserves D/C/B/A ordering (0.2021ms)
✔ Saturn Cassini opacity peaks at the division center (0.1065ms)
✔ Saturn ring texture preserves multiple radial alpha levels (3.4548ms)
✔ Saturn ring substructure adds seven named sibling meshes under saturn-rings (3.8685ms)
✔ Saturn ring substructure radii match Slice 5 constants (3.9813ms)
✔ Saturn ring substructure renderOrder keeps gaps below ringlets and preserves Slice 4 meshes (3.3962ms)
✔ Saturn ring substructure preserves child ordering in inner-radius sequence (2.3826ms)
✔ Saturn Roche Division uses a fading texture rather than a flat-opacity band (2.7933ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1935.6206
✔ Vesta and Bennu anchor positions land in the measured 1 AU cells (2004.3299ms)
✔ cellBoundsKmForIndex returns a 1 AU box anchored to the configured grid (0.5416ms)
✔ positions outside the ±28 AU cube return null (0.2135ms)
✔ cellIndexForPositionKm round-trips into a containing cell bounds box (69.0113ms)
✔ iterateAllPossibleCells covers the full 56x56x56 grid (25.8161ms)
✔ Slice 8 fixture occupies the measured ~178 cells at 1 AU resolution (59.1648ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2260.5412
✔ catalog binary loads without error and advertises the expected header (21.6089ms)
✔ star count is in the expected runtime range (16.633ms)
✔ Sirius is the brightest record and lands at the expected direction (12.578ms)
✔ Polaris is present near the north celestial pole direction (13.0525ms)
✔ color values stay within [0, 1] for all records (14.4989ms)
✔ INV-014: at least 99% of star directions are unit-length within float32 tolerance (15.2535ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 208.5899
✔ constructor builds THREE.Points geometry with expected star attributes (1891.0252ms)
✔ INV-014 spot-check: Polaris direction in geometry matches the parsed catalog (4.3026ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1993.7406
✔ canonical bodyId and bare designation resolve to the same catalog body (2576.858ms)
✔ unknown identifiers resolve to undefined — never a fallback body (92.005ms)
✔ designations are unique across the whole catalog, so the fallback is unambiguous (31.4677ms)
✔ sampled equivalence across the catalog: designation lookup lands on the body with that id (1298.0935ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4137.3115
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:25496) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ pressing t resolves to the top-down preset with the expected final orbit state (3010.1431ms)
✔ camera tween locks controls during animation and releases them on completion (0.2586ms)
✔ existing regression shortcuts remain intact; Titan focus is on k, and t stays with the top-down preset (2.9627ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3110.5171
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-date-hud.test.mjs:51:34) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:11576) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ date HUD label formats TDB seconds into a readable date string (3088.8197ms)
✔ date HUD text updates from the current simulated TDB time (0.1711ms)
✔ runtime creates and removes the date HUD element symmetrically (0.2935ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3194.3983
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-display-integrity.test.mjs:50:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:56532) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ sun light fallback preserves true mesh anchor while keeping a stable fallback direction (3397.7383ms)
✔ viewport sizing falls back cleanly when mount rect is empty (0.1747ms)
✔ keyboard shortcut guard ignores editable targets and accepts canvas-like targets (0.3122ms)
✔ solar runtime source wires display integrity guards into the live interaction path (3.8472ms)
✔ inner and earth-moon runtimes mirror the corrected display patterns (3.6216ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3525.018
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-focus.test.mjs:51:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:67300) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ focus from overview snaps to the target default radius (2873.173ms)
✔ cross-body focus snaps to the new target default radius (0.1485ms)
✔ re-focusing the same body preserves the current zoom radius (0.1127ms)
✔ asteroid focus uses the documented non-edge-on polar default (0.0931ms)
✔ asteroid focus radius uses the honest-scale default radius rule (0.1997ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3009.3674
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-hover-tooltips.test.mjs:52:40) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:28356) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ hover tooltip helper shows Earth text and hides on empty state (3065.9777ms)
✔ world-position projection maps screen center correctly (1.1303ms)
✔ hoverable bodies stay limited to the planet set through Saturn (1.9482ms)
✔ runtime wires the hover tooltip element, planet-only raycast path, and cleanup (0.6557ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3234.1519
✔ empty grid: no components, NO-PRACTICAL-WINDOW, relative threshold is Infinity (1911.7425ms)
✔ all cells below T: one component spanning the whole grid (1.578ms)
✔ a non-converged hole splits a would-be single component (0.2687ms)
✔ tie exactly at T is included (c3 <= T, DEC-17-1) (0.1627ms)
✔ single-cell component exists in components but not in practical (B_min=2) (0.1291ms)
✔ grid of only singletons: NO-PRACTICAL-WINDOW (synthetic 163693 shape) (0.1733ms)
✔ diagonal-only adjacency joins under conn8 (0.1077ms)
✔ null-c3 cell is a hole even when flagged converged (0.1105ms)
✔ liveGridMin excludes non-converged and non-finite cells from the relative threshold (0.228ms)
✔ all-Infinity converged grid under relative mode has no members (not a garbage component) (0.2272ms)
✔ argmin and derived outputs from a real segmentation run (0.2179ms)
✔ classifyComponents finds the true minimum on unsorted input (DEC-17-3) (0.0748ms)
✔ threshold resolution: relative = liveMin + delta; absolute ignores liveMin (0.1474ms)
✔ conn4 is not implemented and throws; malformed grid shape throws (0.1879ms)
✔ property: random grids — component minima bound, practical subset, sort, cell conservation (1.1831ms)
✔ artifact 433 @min+5 conn8: threshold, derivation rules, B_min classification (0.1174ms)
✔ artifact 163693 @min+5 conn8: NO-PRACTICAL-WINDOW (0.0644ms)
✔ artifact 99942 @min+2 conn8: 4 practical of 12, best = global min component (0.0771ms)
✔ artifact derivation rules: breadthCells/breadthDays/tofSpanDays are cell multiples (0.1085ms)
✔ artifact cross-check: pasted constants match the committed artifact, read at runtime (3.2213ms)
✔ artifact sort order restores under the module comparator (0.5606ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2042.466
(node:49588) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ the shortcut overlay names middle-drag pan and compare renders its M=0 method (2558.4317ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2660.9807
✔ Slice 1 pure-Node cutover harness clears the numeric bar at fixture truth timesteps (2048.0139ms)
ℹ validatedSampleCount=121
ℹ maxEarthErrorKm=0
ℹ maxMoonErrorKm=0
ℹ maxRoundTripError=7.6457577540892395e-25
ℹ maxChainTenError=7.6457577540892395e-25
ℹ INV-005 not exercised: Slice 1 validates fixture truth timesteps without a propagator by contract
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2156.421
✔ Slice 1 Horizons fixture exists with Earth and Moon 30-day samples (2.8041ms)
✔ Slice 1 boundary ingress produces canonical heliocentric Earth/Moon states (2185.51ms)
✔ Slice 1 core frame transform round-trip holds against the Earth anchor fixture (3.9584ms)
✔ Slice 1 render path subtracts in f64 and only downcasts camera-relative values (3.0572ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2310.2668
Compiling v2 core and boundary...
PASS tsc compilation

PASS INV-008 sun     max_err=3.541e-6 km  bar=0.00002 km  (270 pts checked)
PASS INV-008 mercury max_err=2.005e+1 km  bar=100 km  (270 pts checked)
PASS INV-008 venus   max_err=1.819e-1 km  bar=1 km  (270 pts checked)
PASS INV-008 earth   max_err=9.069e-2 km  bar=0.5 km  (270 pts checked)
PASS INV-008 moon    max_err=4.977e+0 km  bar=20 km  (270 pts checked)
PASS INV-008 mars    max_err=8.933e-3 km  bar=0.05 km  (270 pts checked)

All six INV-008 cutover bars cleared. Phase C is UNBLOCKED.
✔ tests\v2-slice2-cutover.test.mjs (2124.6117ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2133.3347
Compiling v2 core and boundary for Slice 3 cutover...
PASS tsc compilation

PASS INV-009 jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
PASS INV-009 io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
PASS INV-009 europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
PASS INV-009 ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
PASS INV-009 callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 per-body interpolation summary:
  jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
  io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
  europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
  ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
  callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 3 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice3-cutover.test.mjs (3954.3522ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3960.6344
Compiling v2 core and boundary for Slice 4 cutover...
PASS tsc compilation

PASS INV-010 saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
PASS INV-010 titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
PASS INV-010 rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
PASS INV-010 iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
PASS INV-010 tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
PASS INV-010 dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
PASS INV-010 mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
PASS INV-010 enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 per-body interpolation summary:
  saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
  titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
  rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
  iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
  tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
  dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
  mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
  enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 4 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice4-cutover.test.mjs (4670.2228ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4676.3192
Compiling Saturn runtime and ring helpers for Slice 5 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
PASS Slice 5 ring substructure meshes exist under saturn-rings
PASS renderOrder discipline preserved: baseline default, overlays explicit
PASS A ring outer radius matches exact 136,770 km PDS value
PASS Saturn default focus orbit stays non-edge-on (polar=1.047198 rad, view-normal angle=63.469 deg)
PASS Slice 4 Saturn moon cutover criteria remain green under Slice 5 regression gate
(node:9992) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice5-cutover.test.mjs (3243.1589ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3251.6593
Compiling v2 core and boundary for Slice 6 cutover...
PASS tsc compilation

PASS INV-008 mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
PASS INV-011 phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
PASS INV-011 deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 per-body interpolation summary:
  mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
  phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
  deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 6 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice6-cutover.test.mjs (7118.6596ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7126.5029
Compiling v2 core and boundary for Slice 7 cutover...
PASS tsc compilation

PASS INV-012 10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
PASS INV-012 16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
PASS INV-012 39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
PASS INV-012 40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
PASS INV-012 1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
PASS INV-012 1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
PASS INV-012 4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
PASS INV-012 15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
PASS INV-012 101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
PASS INV-012 162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
PASS INV-012 3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
PASS INV-012 2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
PASS INV-012 1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
PASS INV-012 433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
PASS INV-012 4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
PASS INV-012 4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
PASS INV-012 25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
PASS INV-012 99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 per-body propagation summary:
  10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
  16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
  39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
  40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
  1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
  1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
  4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
  15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
  101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
  162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
  3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
  2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
  1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
  433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
  4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
  4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
  25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
  99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice7-cutover.test.mjs (2187.3739ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2195.3462
Compiling v2 core and boundary for Slice 8 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 3) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}

Slice 8 per-band cutover summary:
  A count=50 max=23147.749445 km bar=35612.872326 km rms=3582.231183 km
  B count=50 max=49114.205128 km bar=52970.091742 km rms=4790.752314 km
  C count=50 max=31804.196407 km bar=37688.076110 km rms=3922.950118 km
  D count=50 max=29163.667462 km bar=43757.549716 km rms=4119.658435 km

Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.
(node:30528) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice8-cutover.test.mjs (3545.8445ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3555.1245
[slice8-performance] outer-system-overview bodies=10008 occupiedCells=178 visibleCells=72 visibleBodies=4234 estimatedGpuDrawCount=72 visibleSlice7RegressionBodies=9
[slice8-performance] asteroid-belt-focus bodies=10008 occupiedCells=178 visibleCells=55 visibleBodies=3126 estimatedGpuDrawCount=55 visibleSlice7RegressionBodies=3
[slice8-performance] focused-vesta-close-zoom bodies=10008 occupiedCells=178 visibleCells=14 visibleBodies=1084 estimatedGpuDrawCount=14 visibleSlice7RegressionBodies=1
✔ Slice 8 cell culling architecture produces sane visibility counts across key camera scenarios (2402.3408ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2508.28
﹣ Slice 9 Phase A.3 three-gate cutover harness validates the committed contract and documents residual envelope exceedance (0.5045ms) # RETIRED 2026-07-12: fixture slice9-cutover-sample.json was never committed (.gitignore:17), unrecoverable, no generator. Expected values 26/58/66/61 were measured from the lost sample; a regenerated sample would reset them while faking continuity. See SLICE_9_FOUNDING.md amendment.
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 88.4904
✔ slice9 runtime normalization preserves finite render-critical asteroid fields (1994.242ms)
✔ solar-system runtime is wired to the Slice 9 live catalog and Phase B canonical pipeline (1.6056ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2082.1045
✔ Slice 9 perf config exposes the committed four partition modes and four camera states (1.3251ms)
✔ Slice 9 perf session rows format the observable measurement contract cleanly (0.5368ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 117.8056
✔ Slice 9 A.2b re-anchor recomputes derived fields after replacing elements (318.0603ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 400.6088
▶ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components
  ✔ Partition correctness holds for uniform 0.5 AU and all hybrid candidates (26.3682ms)
  ✔ Hybrid structural validity holds for all candidate density triggers (17.1814ms)
  ✔ Body conservation holds across re-partition after time scrub (300.3184ms)
  ✔ Occupancy reproduction at 0.5 AU remains within the committed tolerance band (0.6492ms)
  ✔ Propagation CPU-time measurements report main-thread and worker-thread components without inferring frame budget (310.5664ms)
✔ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components (4028.8292ms)
ℹ Slice 9 uniform 0.5 AU occupancy: occupied=2060 baseline=2060 drift=0.00% maxBodies=1178 baselineMax=1177 drift=0.08%
ℹ Slice 9 propagation CPU-only timing: main median=14.271ms p95=23.850ms; worker roundtrip median=12.834ms p95=126.368ms; worker compute median=12.584ms p95=18.534ms; fallback bodies=1
ℹ Slice 9 offline propagation fallback bodies: 1 (2015 D1 [JFC])
ℹ Slice 9 hybrid summaries: D=200 coarse=544 subCells=2375 leafCells=2876 maxLeaf=266; D=500 coarse=544 subCells=1171 leafCells=1696 maxLeaf=473; D=1000 coarse=544 subCells=749 leafCells=1281 maxLeaf=810
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4174.4485
✔ symmetric-return disclosure is derived from the committed six-row artifact (104.0324ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 206.4395
✔ the seven representative bodies render their sentences verbatim from the committed artifact (2034.6639ms)
✔ structurally blind splits by cause: 206 comets + 482 Jupiter-crossing = 688, each with its own sentence (328.3726ms)
✔ every one of the 41,906 bodies has a full sentence — no value is missing from committed data (18.5464ms)
✔ L1: the max-drift date traces to dv-scope-per-body.json, and the boundary is the EARLIEST material encounter, recomputed from the CAD snapshot (434.1077ms)
✔ impactor dates and the 3D drift trace to the truth fixture and nea-drift-results.json (38.9376ms)
✔ formatters: dates, million-km, m/s, AU — and no value is invented from junk (0.2985ms)
✔ a record missing its value yields null (omit), never a sentence with a hole (0.2167ms)
✔ L2 disclosure distinguishes a measured-but-unbounded body from an unmeasured body (8.5947ms)
✔ threshold provenance is verbatim and rides with every mention of 10^6 km; legend has one line per key (0.225ms)
✔ short labels never expose a slug (13.3041ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2993.8379
(node:12836) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog tier legend renders both L2 disclosure phrases from the shared source (2373.5941ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2461.3935
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870446259-0.5439182539107651:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870446259-0.5439182539107651:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:340:29
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870448890-0.16791407607266728:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794870448890-0.16791407607266728:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:374:29
}
(node:5576) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phase C overlay mounts with real Preact, reflects store subscriptions, and cleans up (2787.5733ms)
✔ Phase C overlay converges through repeated store updates with finite fake-DOM layout metrics (2530.7812ms)
✔ runtime wires the Phase C.1 overlay mount and focus-request bridge without changing scene ownership (0.5795ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5427.7598
(node:20116) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ ui store initial state matches the documented Phase C.1 defaults (2080.1751ms)
✔ ui store action functions update the state they claim to own (2176.0146ms)
✔ ui store readonly signals reflect dispatched state updates (2067.4915ms)
✔ focusRequestId increments monotonically on requestFocus() (1996.0793ms)
✔ focus-request subscription only fires when requestFocus increments (2284.2096ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10706.3754
✔ validation provenance scopes strict and observed payload figures and preserves magnitude-only wording (2.5508ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 96.8086

================ FINAL SUMMARY ================
files discovered:    111
files passed:        111
files failed:        0
files LOAD-TIMEOUT:  0
tests passed:        370
tests failed:        0
wall clock:          328.1s
accounting:          111 == 111 + 0 + 0 OK
VERIFY_EXIT=0
Finished: 2026-11-16T18:07:39.9611395-05:00

## Step 4 K2 proxy equivalence
Current v1 docs cache SHA256: bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206
Result: PASS; bins/counts/overflow/noWindow/catalogSize/lowestSample identical; counted=41422; noWindow=484; overflow=0.
Skyhook checkout present: C:\Users\hudso\skyhook. build-snapshots.mjs not run; its generated outputs are outside this step's file scope.

## Regeneration host and v1 fixture
node -v: v26.7.0
npm -v: 11.19.0
OS/process facts: {"node":"v26.7.0","npm":"record npm --version separately","platform":"win32","arch":"x64","osRelease":"10.0.26200","osVersion":"Windows 11 Home"}
cache-v1 bytes=34499477 sha256=bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206

## Step 6 cache regeneration
Started: 2026-11-17T13:22:11.5539714-05:00
Departure grid: 783 dates
TOF grid:       55 TOFs
Grid per body:  43065
Precomputing Earth states at all departure dates...
  Precomputed 783 Earth states
Loading catalog...
  Catalog size: 41906
  250 / 41906 bodies, 9s elapsed, ETA 1554s, 1154k solves/s
  500 / 41906 bodies, 28s elapsed, ETA 2286s, 780k solves/s
  750 / 41906 bodies, 53s elapsed, ETA 2891s, 613k solves/s
  1000 / 41906 bodies, 79s elapsed, ETA 3241s, 544k solves/s
  1250 / 41906 bodies, 104s elapsed, ETA 3385s, 517k solves/s
  1500 / 41906 bodies, 125s elapsed, ETA 3356s, 519k solves/s
  1750 / 41906 bodies, 146s elapsed, ETA 3353s, 516k solves/s
  2000 / 41906 bodies, 171s elapsed, ETA 3409s, 504k solves/s
  2250 / 41906 bodies, 196s elapsed, ETA 3452s, 495k solves/s
  2500 / 41906 bodies, 224s elapsed, ETA 3533s, 480k solves/s
  2750 / 41906 bodies, 250s elapsed, ETA 3558s, 474k solves/s
  3000 / 41906 bodies, 275s elapsed, ETA 3572s, 469k solves/s
  3250 / 41906 bodies, 300s elapsed, ETA 3563s, 467k solves/s
  3500 / 41906 bodies, 323s elapsed, ETA 3544s, 467k solves/s
  3750 / 41906 bodies, 337s elapsed, ETA 3432s, 479k solves/s
  4000 / 41906 bodies, 358s elapsed, ETA 3394s, 481k solves/s
  4250 / 41906 bodies, 382s elapsed, ETA 3383s, 479k solves/s
  4500 / 41906 bodies, 409s elapsed, ETA 3399s, 474k solves/s
  4750 / 41906 bodies, 434s elapsed, ETA 3393s, 472k solves/s
  5000 / 41906 bodies, 458s elapsed, ETA 3382s, 470k solves/s
  5250 / 41906 bodies, 482s elapsed, ETA 3368s, 469k solves/s
  5500 / 41906 bodies, 506s elapsed, ETA 3351s, 468k solves/s
  5750 / 41906 bodies, 531s elapsed, ETA 3340s, 466k solves/s
  6000 / 41906 bodies, 555s elapsed, ETA 3324s, 465k solves/s
  6250 / 41906 bodies, 581s elapsed, ETA 3314s, 463k solves/s
  6500 / 41906 bodies, 609s elapsed, ETA 3318s, 460k solves/s
  6750 / 41906 bodies, 634s elapsed, ETA 3302s, 458k solves/s
  7000 / 41906 bodies, 658s elapsed, ETA 3283s, 458k solves/s
  7250 / 41906 bodies, 682s elapsed, ETA 3262s, 457k solves/s
  7500 / 41906 bodies, 706s elapsed, ETA 3241s, 457k solves/s
  7750 / 41906 bodies, 733s elapsed, ETA 3231s, 455k solves/s
  8000 / 41906 bodies, 758s elapsed, ETA 3212s, 455k solves/s
  8250 / 41906 bodies, 782s elapsed, ETA 3188s, 455k solves/s
  8500 / 41906 bodies, 806s elapsed, ETA 3167s, 454k solves/s
  8750 / 41906 bodies, 829s elapsed, ETA 3143s, 454k solves/s
  9000 / 41906 bodies, 853s elapsed, ETA 3119s, 454k solves/s
  9250 / 41906 bodies, 877s elapsed, ETA 3097s, 454k solves/s
  9500 / 41906 bodies, 901s elapsed, ETA 3075s, 454k solves/s
  9750 / 41906 bodies, 924s elapsed, ETA 3049s, 454k solves/s
  10000 / 41906 bodies, 948s elapsed, ETA 3026s, 454k solves/s
  10250 / 41906 bodies, 975s elapsed, ETA 3012s, 453k solves/s
  10500 / 41906 bodies, 999s elapsed, ETA 2989s, 452k solves/s
  10750 / 41906 bodies, 1023s elapsed, ETA 2965s, 452k solves/s
  11000 / 41906 bodies, 1054s elapsed, ETA 2961s, 450k solves/s
  11250 / 41906 bodies, 1078s elapsed, ETA 2939s, 449k solves/s
  11500 / 41906 bodies, 1102s elapsed, ETA 2913s, 450k solves/s
  11750 / 41906 bodies, 1124s elapsed, ETA 2884s, 450k solves/s
  12000 / 41906 bodies, 1148s elapsed, ETA 2861s, 450k solves/s
  12250 / 41906 bodies, 1168s elapsed, ETA 2828s, 452k solves/s
  12500 / 41906 bodies, 1193s elapsed, ETA 2806s, 451k solves/s
  12750 / 41906 bodies, 1217s elapsed, ETA 2783s, 451k solves/s
  13000 / 41906 bodies, 1241s elapsed, ETA 2760s, 451k solves/s
  13250 / 41906 bodies, 1266s elapsed, ETA 2737s, 451k solves/s
  13500 / 41906 bodies, 1278s elapsed, ETA 2690s, 455k solves/s
  13750 / 41906 bodies, 1300s elapsed, ETA 2662s, 456k solves/s
  14000 / 41906 bodies, 1323s elapsed, ETA 2637s, 456k solves/s
  14250 / 41906 bodies, 1347s elapsed, ETA 2615s, 455k solves/s
  14500 / 41906 bodies, 1372s elapsed, ETA 2593s, 455k solves/s
  14750 / 41906 bodies, 1396s elapsed, ETA 2571s, 455k solves/s
  15000 / 41906 bodies, 1424s elapsed, ETA 2554s, 454k solves/s
  15250 / 41906 bodies, 1449s elapsed, ETA 2532s, 453k solves/s
  15500 / 41906 bodies, 1473s elapsed, ETA 2509s, 453k solves/s
  15750 / 41906 bodies, 1500s elapsed, ETA 2491s, 452k solves/s
  16000 / 41906 bodies, 1524s elapsed, ETA 2468s, 452k solves/s
  16250 / 41906 bodies, 1548s elapsed, ETA 2444s, 452k solves/s
  16500 / 41906 bodies, 1569s elapsed, ETA 2416s, 453k solves/s
  16750 / 41906 bodies, 1593s elapsed, ETA 2393s, 453k solves/s
  17000 / 41906 bodies, 1618s elapsed, ETA 2370s, 453k solves/s
  17250 / 41906 bodies, 1642s elapsed, ETA 2348s, 452k solves/s
  17500 / 41906 bodies, 1667s elapsed, ETA 2325s, 452k solves/s
  17750 / 41906 bodies, 1691s elapsed, ETA 2302s, 452k solves/s
  18000 / 41906 bodies, 1716s elapsed, ETA 2279s, 452k solves/s
  18250 / 41906 bodies, 1741s elapsed, ETA 2257s, 451k solves/s
  18500 / 41906 bodies, 1765s elapsed, ETA 2233s, 451k solves/s
  18750 / 41906 bodies, 1789s elapsed, ETA 2209s, 451k solves/s
  19000 / 41906 bodies, 1813s elapsed, ETA 2186s, 451k solves/s
  19250 / 41906 bodies, 1838s elapsed, ETA 2163s, 451k solves/s
  19500 / 41906 bodies, 1862s elapsed, ETA 2140s, 451k solves/s
  19750 / 41906 bodies, 1887s elapsed, ETA 2117s, 451k solves/s
  20000 / 41906 bodies, 1912s elapsed, ETA 2094s, 451k solves/s
  20250 / 41906 bodies, 1936s elapsed, ETA 2071s, 450k solves/s
  20500 / 41906 bodies, 1963s elapsed, ETA 2050s, 450k solves/s
  20750 / 41906 bodies, 1988s elapsed, ETA 2027s, 450k solves/s
  21000 / 41906 bodies, 2011s elapsed, ETA 2002s, 450k solves/s
  21250 / 41906 bodies, 2029s elapsed, ETA 1972s, 451k solves/s

## Step 6 regeneration retry (resumed by Hudson)
Started: 2026-11-17T22:19:56.020Z
Generator PID: 15864
Departure grid: 783 dates
TOF grid:       55 TOFs
Grid per body:  43065
Precomputing Earth states at all departure dates...
  Precomputed 783 Earth states
Loading catalog...
  Catalog size: 41906
  250 / 41906 bodies, 9s elapsed, ETA 1503s, 1194k solves/s
  500 / 41906 bodies, 19s elapsed, ETA 1584s, 1126k solves/s
  750 / 41906 bodies, 27s elapsed, ETA 1460s, 1214k solves/s
  1000 / 41906 bodies, 34s elapsed, ETA 1379s, 1277k solves/s
  1250 / 41906 bodies, 41s elapsed, ETA 1333s, 1314k solves/s
  1500 / 41906 bodies, 48s elapsed, ETA 1292s, 1346k solves/s
  1750 / 41906 bodies, 55s elapsed, ETA 1261s, 1372k solves/s
  2000 / 41906 bodies, 62s elapsed, ETA 1237s, 1389k solves/s
  2250 / 41906 bodies, 69s elapsed, ETA 1217s, 1403k solves/s
  2500 / 41906 bodies, 76s elapsed, ETA 1200s, 1415k solves/s
  2750 / 41906 bodies, 83s elapsed, ETA 1187s, 1420k solves/s
  3000 / 41906 bodies, 91s elapsed, ETA 1175s, 1426k solves/s
  3250 / 41906 bodies, 98s elapsed, ETA 1162s, 1433k solves/s
  3500 / 41906 bodies, 105s elapsed, ETA 1150s, 1439k solves/s
  3750 / 41906 bodies, 112s elapsed, ETA 1136s, 1446k solves/s
  4000 / 41906 bodies, 119s elapsed, ETA 1127s, 1448k solves/s
  4250 / 41906 bodies, 127s elapsed, ETA 1126s, 1441k solves/s
  4500 / 41906 bodies, 135s elapsed, ETA 1121s, 1437k solves/s
  4750 / 41906 bodies, 148s elapsed, ETA 1158s, 1382k solves/s
  5000 / 41906 bodies, 167s elapsed, ETA 1235s, 1286k solves/s
  5250 / 41906 bodies, 187s elapsed, ETA 1308s, 1207k solves/s
  5500 / 41906 bodies, 203s elapsed, ETA 1347s, 1164k solves/s
  5750 / 41906 bodies, 224s elapsed, ETA 1405s, 1108k solves/s
  6000 / 41906 bodies, 242s elapsed, ETA 1451s, 1066k solves/s
  6250 / 41906 bodies, 261s elapsed, ETA 1488s, 1032k solves/s
  6500 / 41906 bodies, 281s elapsed, ETA 1529s, 997k solves/s
  6750 / 41906 bodies, 300s elapsed, ETA 1561s, 970k solves/s
  7000 / 41906 bodies, 319s elapsed, ETA 1592s, 945k solves/s
  7250 / 41906 bodies, 338s elapsed, ETA 1615s, 924k solves/s
  7500 / 41906 bodies, 357s elapsed, ETA 1637s, 905k solves/s
  7750 / 41906 bodies, 376s elapsed, ETA 1657s, 888k solves/s
  8000 / 41906 bodies, 395s elapsed, ETA 1674s, 872k solves/s
  8250 / 41906 bodies, 415s elapsed, ETA 1692s, 856k solves/s
  8500 / 41906 bodies, 434s elapsed, ETA 1706s, 843k solves/s
  8750 / 41906 bodies, 453s elapsed, ETA 1718s, 831k solves/s
  9000 / 41906 bodies, 474s elapsed, ETA 1732s, 818k solves/s
  9250 / 41906 bodies, 493s elapsed, ETA 1742s, 807k solves/s
  9500 / 41906 bodies, 514s elapsed, ETA 1754s, 796k solves/s
  9750 / 41906 bodies, 534s elapsed, ETA 1761s, 786k solves/s
  10000 / 41906 bodies, 554s elapsed, ETA 1767s, 778k solves/s
  10250 / 41906 bodies, 572s elapsed, ETA 1766s, 772k solves/s
  10500 / 41906 bodies, 592s elapsed, ETA 1769s, 764k solves/s
  10750 / 41906 bodies, 610s elapsed, ETA 1769s, 759k solves/s
  11000 / 41906 bodies, 629s elapsed, ETA 1767s, 753k solves/s
  11250 / 41906 bodies, 645s elapsed, ETA 1759s, 751k solves/s
  11500 / 41906 bodies, 665s elapsed, ETA 1758s, 745k solves/s
  11750 / 41906 bodies, 684s elapsed, ETA 1756s, 739k solves/s
  12000 / 41906 bodies, 702s elapsed, ETA 1751s, 736k solves/s
  12250 / 41906 bodies, 721s elapsed, ETA 1746s, 731k solves/s
  12500 / 41906 bodies, 739s elapsed, ETA 1739s, 728k solves/s
  12750 / 41906 bodies, 759s elapsed, ETA 1736s, 723k solves/s
  13000 / 41906 bodies, 779s elapsed, ETA 1732s, 719k solves/s
  13250 / 41906 bodies, 797s elapsed, ETA 1724s, 716k solves/s
  13500 / 41906 bodies, 815s elapsed, ETA 1716s, 713k solves/s
  13750 / 41906 bodies, 835s elapsed, ETA 1711s, 709k solves/s
  14000 / 41906 bodies, 854s elapsed, ETA 1702s, 706k solves/s
  14250 / 41906 bodies, 873s elapsed, ETA 1694s, 703k solves/s
  14500 / 41906 bodies, 892s elapsed, ETA 1686s, 700k solves/s
  14750 / 41906 bodies, 910s elapsed, ETA 1675s, 698k solves/s
  15000 / 41906 bodies, 928s elapsed, ETA 1665s, 696k solves/s
  15250 / 41906 bodies, 948s elapsed, ETA 1657s, 693k solves/s
  15500 / 41906 bodies, 968s elapsed, ETA 1648s, 690k solves/s
  15750 / 41906 bodies, 986s elapsed, ETA 1638s, 688k solves/s
  16000 / 41906 bodies, 1006s elapsed, ETA 1629s, 685k solves/s
  16250 / 41906 bodies, 1025s elapsed, ETA 1618s, 683k solves/s
  16500 / 41906 bodies, 1043s elapsed, ETA 1606s, 681k solves/s
  16750 / 41906 bodies, 1062s elapsed, ETA 1595s, 679k solves/s
  17000 / 41906 bodies, 1081s elapsed, ETA 1584s, 677k solves/s
  17250 / 41906 bodies, 1101s elapsed, ETA 1573s, 675k solves/s
  17500 / 41906 bodies, 1120s elapsed, ETA 1562s, 673k solves/s
  17750 / 41906 bodies, 1138s elapsed, ETA 1549s, 672k solves/s
  18000 / 41906 bodies, 1157s elapsed, ETA 1536s, 670k solves/s
  18250 / 41906 bodies, 1173s elapsed, ETA 1520s, 670k solves/s
  18500 / 41906 bodies, 1191s elapsed, ETA 1507s, 669k solves/s
  18750 / 41906 bodies, 1210s elapsed, ETA 1495s, 667k solves/s
  19000 / 41906 bodies, 1228s elapsed, ETA 1481s, 666k solves/s
  19250 / 41906 bodies, 1245s elapsed, ETA 1466s, 666k solves/s
  19500 / 41906 bodies, 1264s elapsed, ETA 1452s, 664k solves/s
  19750 / 41906 bodies, 1282s elapsed, ETA 1439s, 663k solves/s
  20000 / 41906 bodies, 1302s elapsed, ETA 1426s, 662k solves/s
  20250 / 41906 bodies, 1318s elapsed, ETA 1409s, 662k solves/s
  20500 / 41906 bodies, 1337s elapsed, ETA 1396s, 660k solves/s
  20750 / 41906 bodies, 1356s elapsed, ETA 1383s, 659k solves/s
  21000 / 41906 bodies, 1373s elapsed, ETA 1367s, 659k solves/s
  21250 / 41906 bodies, 1387s elapsed, ETA 1348s, 660k solves/s
  21500 / 41906 bodies, 1406s elapsed, ETA 1335s, 658k solves/s
  21750 / 41906 bodies, 1424s elapsed, ETA 1320s, 658k solves/s
  22000 / 41906 bodies, 1442s elapsed, ETA 1305s, 657k solves/s
  22250 / 41906 bodies, 1453s elapsed, ETA 1283s, 660k solves/s
  22500 / 41906 bodies, 1460s elapsed, ETA 1259s, 664k solves/s
  22750 / 41906 bodies, 1467s elapsed, ETA 1236s, 668k solves/s
  23000 / 41906 bodies, 1474s elapsed, ETA 1212s, 672k solves/s
  23250 / 41906 bodies, 1481s elapsed, ETA 1189s, 676k solves/s
  23500 / 41906 bodies, 1488s elapsed, ETA 1166s, 680k solves/s
  23750 / 41906 bodies, 1495s elapsed, ETA 1143s, 684k solves/s
  24000 / 41906 bodies, 1503s elapsed, ETA 1121s, 688k solves/s
  24250 / 41906 bodies, 1510s elapsed, ETA 1099s, 692k solves/s
  24500 / 41906 bodies, 1517s elapsed, ETA 1078s, 696k solves/s
  24750 / 41906 bodies, 1524s elapsed, ETA 1056s, 700k solves/s
  25000 / 41906 bodies, 1531s elapsed, ETA 1035s, 703k solves/s
  25250 / 41906 bodies, 1537s elapsed, ETA 1014s, 707k solves/s
  25500 / 41906 bodies, 1544s elapsed, ETA 994s, 711k solves/s
  25750 / 41906 bodies, 1551s elapsed, ETA 973s, 715k solves/s
  26000 / 41906 bodies, 1558s elapsed, ETA 953s, 719k solves/s
  26250 / 41906 bodies, 1565s elapsed, ETA 934s, 722k solves/s
  26500 / 41906 bodies, 1573s elapsed, ETA 914s, 726k solves/s
  26750 / 41906 bodies, 1580s elapsed, ETA 895s, 729k solves/s
  27000 / 41906 bodies, 1586s elapsed, ETA 876s, 733k solves/s
  27250 / 41906 bodies, 1593s elapsed, ETA 857s, 736k solves/s
  27500 / 41906 bodies, 1600s elapsed, ETA 838s, 740k solves/s
  27750 / 41906 bodies, 1607s elapsed, ETA 820s, 744k solves/s
  28000 / 41906 bodies, 1614s elapsed, ETA 802s, 747k solves/s
  28250 / 41906 bodies, 1621s elapsed, ETA 784s, 750k solves/s
  28500 / 41906 bodies, 1628s elapsed, ETA 766s, 754k solves/s
  28750 / 41906 bodies, 1635s elapsed, ETA 748s, 757k solves/s
  29000 / 41906 bodies, 1642s elapsed, ETA 731s, 761k solves/s
  29250 / 41906 bodies, 1649s elapsed, ETA 714s, 764k solves/s
  29500 / 41906 bodies, 1656s elapsed, ETA 696s, 767k solves/s
  29750 / 41906 bodies, 1663s elapsed, ETA 680s, 770k solves/s
  30000 / 41906 bodies, 1670s elapsed, ETA 663s, 774k solves/s
  30250 / 41906 bodies, 1677s elapsed, ETA 646s, 777k solves/s
  30500 / 41906 bodies, 1684s elapsed, ETA 630s, 780k solves/s
  30750 / 41906 bodies, 1691s elapsed, ETA 614s, 783k solves/s
  31000 / 41906 bodies, 1699s elapsed, ETA 598s, 786k solves/s
  31250 / 41906 bodies, 1707s elapsed, ETA 582s, 789k solves/s
  31500 / 41906 bodies, 1714s elapsed, ETA 566s, 792k solves/s
  31750 / 41906 bodies, 1721s elapsed, ETA 550s, 795k solves/s
  32000 / 41906 bodies, 1728s elapsed, ETA 535s, 798k solves/s
  32250 / 41906 bodies, 1735s elapsed, ETA 519s, 801k solves/s
  32500 / 41906 bodies, 1742s elapsed, ETA 504s, 804k solves/s
  32750 / 41906 bodies, 1749s elapsed, ETA 489s, 807k solves/s
  33000 / 41906 bodies, 1756s elapsed, ETA 474s, 809k solves/s
  33250 / 41906 bodies, 1763s elapsed, ETA 459s, 812k solves/s
  33500 / 41906 bodies, 1770s elapsed, ETA 444s, 815k solves/s
  33750 / 41906 bodies, 1777s elapsed, ETA 429s, 818k solves/s
  34000 / 41906 bodies, 1784s elapsed, ETA 415s, 821k solves/s
  34250 / 41906 bodies, 1791s elapsed, ETA 400s, 824k solves/s
  34500 / 41906 bodies, 1798s elapsed, ETA 386s, 827k solves/s
  34750 / 41906 bodies, 1805s elapsed, ETA 372s, 829k solves/s
  35000 / 41906 bodies, 1812s elapsed, ETA 357s, 832k solves/s
  35250 / 41906 bodies, 1819s elapsed, ETA 343s, 835k solves/s
  35500 / 41906 bodies, 1826s elapsed, ETA 329s, 837k solves/s
  35750 / 41906 bodies, 1833s elapsed, ETA 316s, 840k solves/s
  36000 / 41906 bodies, 1840s elapsed, ETA 302s, 843k solves/s
  36250 / 41906 bodies, 1847s elapsed, ETA 288s, 845k solves/s
  36500 / 41906 bodies, 1854s elapsed, ETA 275s, 848k solves/s
  36750 / 41906 bodies, 1860s elapsed, ETA 261s, 851k solves/s
  37000 / 41906 bodies, 1868s elapsed, ETA 248s, 853k solves/s
  37250 / 41906 bodies, 1875s elapsed, ETA 234s, 856k solves/s
  37500 / 41906 bodies, 1893s elapsed, ETA 222s, 853k solves/s
  37750 / 41906 bodies, 1911s elapsed, ETA 210s, 850k solves/s
  38000 / 41906 bodies, 1931s elapsed, ETA 198s, 848k solves/s
  38250 / 41906 bodies, 1949s elapsed, ETA 186s, 845k solves/s
  38500 / 41906 bodies, 1968s elapsed, ETA 174s, 842k solves/s
  38750 / 41906 bodies, 1988s elapsed, ETA 162s, 839k solves/s
  39000 / 41906 bodies, 2006s elapsed, ETA 149s, 837k solves/s
  39250 / 41906 bodies, 2022s elapsed, ETA 137s, 836k solves/s
  39500 / 41906 bodies, 2041s elapsed, ETA 124s, 833k solves/s
  39750 / 41906 bodies, 2057s elapsed, ETA 112s, 832k solves/s
  40000 / 41906 bodies, 2075s elapsed, ETA 99s, 830k solves/s
  40250 / 41906 bodies, 2095s elapsed, ETA 86s, 828k solves/s
  40500 / 41906 bodies, 2114s elapsed, ETA 73s, 825k solves/s
  40750 / 41906 bodies, 2134s elapsed, ETA 61s, 822k solves/s
  41000 / 41906 bodies, 2154s elapsed, ETA 48s, 820k solves/s
  41250 / 41906 bodies, 2172s elapsed, ETA 35s, 818k solves/s
  41500 / 41906 bodies, 2189s elapsed, ETA 21s, 816k solves/s
  41750 / 41906 bodies, 2208s elapsed, ETA 8s, 814k solves/s

Precompute complete in 2222.2s
Total solves: 1804638825
Solves/sec:   812k

Status breakdown:
  low_departure_c3             41422 (98.85%)
  high_departure_c3            483 (1.15%)
  lambert_unconvergeable       0 (0.00%)
  propagator_failed            1 (0.00%)
Co-orbital bodies tagged: 130

Cache written: tests\fixtures\v2\lambert-screen-cache.json (7892 KB)

GENERATOR_EXIT=0
GENERATOR_SIGNAL=none
Finished: 2026-11-17T22:57:02.242Z

## Step 7 acceptance diff PASS
v1 sha256=bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206
v2 sha256=961bd7af7d6dfdea6936b10882302f750860f6d0534d7b425db685e28ac55469
status matrix diagonal; 0 body-order, coOrbital, C3 text, near-zero, color, date, and TOF changes; 0 unexpected metadata differences.
minC3 max relative difference=2.1173720492082248e-13; median=0; finite pairs=41905.
Sizes bytes raw/gzip-9/brotli-11: v1=34499477/8251154/6342245; v2=8081586/1054003/760328.

## Step 9 npm run verify
Started: 2026-11-17T18:03:19.9668365-05:00

> aster@0.1.0 verify
> npm run typecheck:v2 && npm run test:all


> aster@0.1.0 typecheck:v2
> tsc --noEmit


> aster@0.1.0 test:all
> node tools/run-tests.mjs

Discovered 111 test files (per-file watchdog: 180000 ms):
src\v2\app\catalog-list\row.test.mjs
src\v2\boundary\c3-grid.test.mjs
src\v2\porkchop\colormap.test.mjs
src\v2\porkchop\composite-grid.test.mjs
src\v2\porkchop\delta-v.test.mjs
src\v2\porkchop\dual-m-compute.test.mjs
src\v2\porkchop\grid-compute.test.mjs
src\v2\porkchop\launch-vehicles.test.mjs
src\v2\porkchop\propagation-guard.test.mjs
src\v2\porkchop\support-boundary.test.mjs
tests\phase6-contract-smoke.test.mjs
tests\setup-hooks.test.mjs
tests\v2-a11y-floor.test.mjs
tests\v2-about-copy.test.mjs
tests\v2-about-evidence.test.mjs
tests\v2-architecture.test.mjs
tests\v2-boundary-horizons.test.mjs
tests\v2-boundary-slice2.test.mjs
tests\v2-boundary-slice4.test.mjs
tests\v2-boundary-slice6.test.mjs
tests\v2-boundary-slice7.test.mjs
tests\v2-boundary-slice8.test.mjs
tests\v2-boundary-slice9.test.mjs
tests\v2-boundary-star-catalog.test.mjs
tests\v2-c3-value-type.test.mjs
tests\v2-catalog-count-binding.test.mjs
tests\v2-catalog-empty.test.mjs
tests\v2-catalog-threshold-disclosure.test.mjs
tests\v2-compare-data.test.mjs
tests\v2-compare-honesty.test.mjs
tests\v2-compare-url.test.mjs
tests\v2-coorbital-disclosure.test.mjs
tests\v2-core-constants.test.mjs
tests\v2-core-frames-jupiter.test.mjs
tests\v2-core-frames-mars.test.mjs
tests\v2-core-frames-saturn.test.mjs
tests\v2-core-hermite-jupiter.test.mjs
tests\v2-core-hermite-mars.test.mjs
tests\v2-core-hermite-saturn.test.mjs
tests\v2-core-hermite.test.mjs
tests\v2-core-keplerian.test.mjs
tests\v2-core-orbit-sampling.test.mjs
tests\v2-derived-span-labels.test.mjs
tests\v2-design-architecture.test.mjs
tests\v2-design-components.test.mjs
tests\v2-design-tokens.test.mjs
tests\v2-dla-display.test.mjs
tests\v2-dla-render.test.mjs
tests\v2-ephemeris-hud.test.mjs
tests\v2-f2-characterization.test.mjs
tests\v2-fk3-guided-tour.test.mjs
tests\v2-golden\launch-vehicles.golden.test.mjs
tests\v2-lambert\dla.test.mjs
tests\v2-lambert\feasibility.test.mjs
tests\v2-lambert\householder.test.mjs
tests\v2-lambert\hyp2f1b.test.mjs
tests\v2-lambert\initial-guess.test.mjs
tests\v2-lambert\lambert-endtoend.test.mjs
tests\v2-lambert\lambert-multi-rev-rejection.test.mjs
tests\v2-lambert\lambert-multi-rev.test.mjs
tests\v2-lambert\stumpff.test.mjs
tests\v2-lambert\tof.test.mjs
tests\v2-lambert\utc-to-tdb.test.mjs
tests\v2-lambert\vec3.test.mjs
tests\v2-light-time.test.mjs
tests\v2-near-zero-c3.test.mjs
tests\v2-porkchop-honesty.test.mjs
tests\v2-public-copy-render.test.mjs
tests\v2-public-copy.test.mjs
tests\v2-render-asteroid-cell-renderer.test.mjs
tests\v2-render-asteroid-orbits.test.mjs
tests\v2-render-asteroid-points-shader.test.mjs
tests\v2-render-asteroid-renderer.test.mjs
tests\v2-render-halos.test.mjs
tests\v2-render-jupiter-oblate.test.mjs
tests\v2-render-mars-oblate.test.mjs
tests\v2-render-mars-system.test.mjs
tests\v2-render-saturn-oblate.test.mjs
tests\v2-render-saturn-rings.test.mjs
tests\v2-render-spatial-grid.test.mjs
tests\v2-render-star-catalog.test.mjs
tests\v2-render-star-renderer.test.mjs
tests\v2-resolve-catalog-body.test.mjs
tests\v2-runtime-camera-presets.test.mjs
tests\v2-runtime-date-hud.test.mjs
tests\v2-runtime-display-integrity.test.mjs
tests\v2-runtime-focus.test.mjs
tests\v2-runtime-hover-tooltips.test.mjs
tests\v2-segment-windows.test.mjs
tests\v2-shortcut-and-method.test.mjs
tests\v2-slice1-cutover.test.mjs
tests\v2-slice1-integration.test.mjs
tests\v2-slice2-cutover.test.mjs
tests\v2-slice3-cutover.test.mjs
tests\v2-slice4-cutover.test.mjs
tests\v2-slice5-cutover.test.mjs
tests\v2-slice6-cutover.test.mjs
tests\v2-slice7-cutover.test.mjs
tests\v2-slice8-cutover.test.mjs
tests\v2-slice8-performance.test.mjs
tests\v2-slice9-cutover.test.mjs
tests\v2-slice9-live-runtime-integration.test.mjs
tests\v2-slice9-perf-config.test.mjs
tests\v2-slice9-reanchor-derived.test.mjs
tests\v2-slice9-spatial-index-harness.test.mjs
tests\v2-symmetric-return.test.mjs
tests\v2-tier-disclosure.test.mjs
tests\v2-tier-legend-render.test.mjs
tests\v2-ui-overlay.test.mjs
tests\v2-ui-store.test.mjs
tests\v2-validation-provenance.test.mjs

(node:40604) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ 2018 LA (L0, verified impact): LOW C3 badge suppressed; C3 kept with the last-known-orbit context (2790.6763ms)
✔ 2015 D1 (L0, hyperbolic): "—" stays, PROP FAIL badge stays, no context is invented for a null C3 (0.2786ms)
✔ non-L0 rows are untouched: 433 (L2) and 99942 (L1) keep their badge and plain C3 (0.3512ms)
✔ near-zero C3 is a separate geometry flag and coexists with the screening status badge (0.3838ms)
✔ near-zero catalog disclosure remains byte-identical to the approved wording (0.169ms)
✔ near-zero hide state replaces only the rendered value and badge, preserving the low-C3 badge and source value (0.1706ms)
✔ S18 Item 5: the tier badge tooltip is the full disclosure sentence, never the slug (0.5386ms)
✔ the rule is exactly {L0} x {low, high}: every other tier/status combination renders its badge (0.4082ms)
✔ catalog C3 grid label is derived from cache metadata and its tooltip carries the full grid details (0.2226ms)
✔ CK-12 catalog C3 uses the shared three-significant-figure rule across its display range (0.3118ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2930.9426
✔ cached C3 grid descriptor and short label derive from cache metadata (2205.7646ms)
✔ requested C3 grid descriptor changes with the scan arguments (2205.3621ms)
✔ porkchop grid dimension wording is derived rather than literal (2781.0551ms)
✔ T5 formatter output changes with its grid parameters (2724.5724ms)
✔ shared C3 grid label derives common step units from axis parameters (2868.9007ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 12894.4258
✔ c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling (2901.1322ms)
✔ c3ToViridisRgb uses monotonic log normalization with a hard floor at C3 <= 1 (2210.3297ms)
✔ colorForPorkchopCell uses sentinel colors for no_solution and stall (2193.5564ms)
✔ non-finite C3 values use the existing no-solution colour (2331.2605ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9791.5428
✔ both families solve: strictly lower C3 wins (1987.8173ms)
✔ exact tie goes to M=0 and is counted (0.201ms)
✔ only one family solves: that family is taken — the measured defect (0.1517ms)
✔ neither solves: no_solution, but a stall is never collapsed (SLICE_11_FOUNDING.md:207) (0.1558ms)
✔ composite minimum is never worse than either single-family minimum (0.2718ms)
✔ per-cell provenance: every ok cell carries the M that produced it (0.114ms)
✔ AMD-2: the compared C3 is the selected branch, not branch 0 (0.3354ms)
✔ misaligned or mismatched grids throw rather than mis-pair cells (0.5325ms)
✔ counts account for every cell exactly once (0.2057ms)
✔ gridExtremes: both extremes on a normal grid (0.4741ms)
✔ gridExtremes: no_solution and stall cells are excluded (0.1459ms)
✔ gridExtremes: zero solvable cells returns an explicit empty variant (0.0923ms)
✔ gridExtremes: ties resolve to the lowest array index, for both extremes (0.1138ms)
✔ gridExtremes: over a composite grid whose extremes come from different families (0.1203ms)
✔ composite never exceeds M=0 per-cell wherever M=0 solves (structural — catches selection inversion) (0.0961ms)
✔ composite max <= M=0 max WHEN M=0 coverage is a superset (onlyM1 === 0) (0.0893ms)
✔ the superset precondition is real: with onlyM1 > 0 the composite max CAN exceed M=0 max (0.0695ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2140.687
✔ ΔV stack is mode-aware: one-way omits departure and sample return uses symmetric-return assumption (2568.2175ms)
✔ D10 labels name margin bases and preserve the displayed value expressions (1.2027ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2678.4943
✔ computeDualFamilyGrids issues exactly two messages, M=0 then M=1 (AMD-1) (2189.0442ms)
✔ computeDualFamilyGrids awaits sequentially — never two computes in flight (0.1452ms)
✔ computeDualFamilyGrids carries the request through unchanged, one M per message (0.3058ms)
✔ computeDualFamilyGrids returns both grids keyed by family (0.1129ms)
✔ computeDualFamilyGrids propagates a failure from either family unchanged (0.3863ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2337.0524
lambertMultiRev: no solution for M=1; T=0.579002371229731 < T_min=4.4030574920032794
✔ computePorkchopGrid round-trips three validated M=1 cells through JD+days boundary across the regime (4587.1829ms)
✔ computePorkchopGrid maps below-T_min cells to no_solution (8.2891ms)
✔ computePorkchopGrid selects the lower-C3 branch when both M=1 branches converge (2.266ms)
✔ computePorkchopGrid maps all-failed synthetic solver output to stall (0.7925ms)
✔ porkchop worker init bootstraps Earth state and strips velocity internals from outbound branches (1.0947ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4755.0986
✔ launch vehicle catalog matches locked DEC-13-1 anchors exactly (2074.8138ms)
✔ payloadAtC3 interpolates linearly between published anchors (0.137ms)
✔ payloadAtC3 never extrapolates past short published curves (0.0954ms)
✔ New Glenn keeps C3=30 anchor, interpolates steep interior, and stops after it (0.0975ms)
✔ payloadAtC3 refuses non-finite C3 separately from beyond-curve inputs (0.1018ms)
✔ deliveredMassKg excludes injection by construction and applies mode departure only for sample return (0.2493ms)
✔ spacecraft budget total is mode-owned and preserves every supplied term (0.1034ms)
✔ deliveredMassKg rejects corrupted budgets and invalid modes with INVALID_INPUT, never BEYOND_CURVE or a number (1.0191ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2206.1688
✔ guard agrees with the propagator on every catalog body (verified by propagating, not by reading the guard) (4311.7141ms)
✔ 2015 D1: the verdict carries the catalog eccentricity and the verbatim sentence (1.4291ms)
✔ message rounds the eccentricity to 4 decimals and invents nothing for a non-finite one (0.4411ms)
✔ computeCompareData: 2015 D1 is refused as a value in place; 433 and 2018 LA are byte-identical to the historical path (18.6138ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4478.77
✔ 99942: the boundary comes from the committed artifact, and the partition matches the per-column formulation (2794.089ms)
✔ edge behaviour: an encounter before the window makes every cell unsupported; after the last arrival, none (7.6437ms)
✔ no boundary is invented: non-L1 tiers and records without an encounter yield undefined (15.162ms)
✔ the unsupported-cell sentence is verbatim (0.2386ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2930.7333
✔ all texture assets referenced by legacy/index.html exist on disk (19.2276ms)
✔ legacy entry is frozen, noindexed, and points visitors to V2 (5.2973ms)
✔ worker README documents the worker routes implemented in worker/index.js (40.4731ms)
✔ worker README documents all environment variables used by worker/index.js (3.0321ms)
✔ worker README documents wildcard localhost development origin support (1.2026ms)
✔ physics worker no longer hardcodes NHATS and Asterank production route URLs (2.194ms)
✔ .gitignore covers local worker secrets and wrangler state (0.5592ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 202.1636
✔ prepare hook installer is silent and successful outside a git worktree (166.5809ms)
✔ prepare hook installer configures hooksPath inside a git worktree (459.2234ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 769.5657
(node:66572) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ contrast utility matches WCAG reference pairs and the three lightness overrides (2803.6709ms)
✔ catalog row is keyboard-focusable and Enter activates the same handler as click (3042.8844ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6009.4349
✔ About decision record carries no emoji (tail2 F7) (4260.9787ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4458.2773
✔ About evidence links use rendered audit-copy VNodes and real heading fragments (2229.8215ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2379.487
✔ src/v2 sources do not import internal modules outside src/v2 (101.1049ms)
✔ C3 grid label sites use derived formatters and contain no literal dimension labels (2.5534ms)
✔ INV-026 departure-end date is owned by grid-span.ts (61.584ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 313.8717
✔ jdTdbToSecondsSinceJ2000 converts J2000-relative TDB days into seconds (2210.8976ms)
✔ Slice 1 Earth/Moon fixture ingests into canonical meters, m/s, and aligned TDB seconds (5.876ms)
✔ convertHorizonsRecord accepts object-form records with Horizons-native aliases (0.6607ms)
✔ convertHorizonsRecord rotates ecliptic J2000 vectors into canonical ICRF coordinates (0.2303ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2373.585
✔ Slice 2 fixture file exists and parses as valid JSON (4.2115ms)
✔ Slice 2 fixture contains all six required target keys (1.9834ms)
✔ Each body in Slice 2 fixture has 90-92 records (91 ± 1) (2.8615ms)
✔ Moon records after ingestion have frame matching FRAME_GCRS_EARTH (3739.0879ms)
✔ All non-Moon bodies after ingestion have frame matching FRAME_HELIO_J2000_ICRF (17.9907ms)
✔ First Earth record position magnitude in meters is between 1.48e11 and 1.52e11 (~1 AU) (22.2342ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3992.4318
✔ Slice 4 fixture contains all eight required target keys (16.6079ms)
✔ Slice 4 fixture origin tags match heliocentric Saturn and saturn-centered moons (11.9223ms)
✔ inferCanonicalFrame maps saturn-centered origins to FRAME_SATURN_J2000_ICRF (2400.0807ms)
✔ Slice 4 tuple records ingest into canonical meters, m/s, TDB seconds, and Saturn-centered moon frames (71.5983ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2651.0017
✔ Slice 6 fixture contains all three required target keys (13.4277ms)
✔ Slice 6 fixture origin tags match heliocentric Mars and mars-centered moons (9.7301ms)
✔ inferCanonicalFrame maps mars-centered origins to FRAME_MARS_J2000_ICRF (3463.6776ms)
✔ Slice 6 tuple records ingest into canonical meters, m/s, TDB seconds, and Mars-centered moon frames (103.9827ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3757.0775
✔ Slice 7 fixture contains the 1008-body hybrid catalog and required asteroid ids (15.4635ms)
✔ Slice 7 boundary ingestion preserves all 1008 asteroid records and the 8 curated NEAs (2147.7144ms)
✔ Slice 7 boundary spot-checks preserve Vesta, Bennu, and Apophis metadata and heliocentric frame (13.6524ms)
✔ Slice 7 boundary ingestion preserves anchor-position round-trip at the anchor epoch (17.2556ms)
✔ Slice 7 browser loader fetches and ingests the asteroid catalog fixture (13.4548ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2345.1225
✔ Slice 8 fixture exists and contains the 10,008-body catalog (60.0391ms)
✔ Slice 8 boundary ingestion preserves all 10,008 asteroid records and the Slice 7 subset (2695.6026ms)
✔ Slice 8 boundary spot-checks preserve Vesta, Bennu, Apophis, and new extension bodies (140.621ms)
✔ Slice 8 band distribution and orbit-line count match Round 3 within tolerance (205.6406ms)
✔ Slice 8 browser loader fetches and ingests the asteroid catalog fixture (238.0182ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3490.7047
✔ Slice 9 fixture exists and contains the live 41,906-body NEA catalog (269.2434ms)
✔ Slice 9 boundary ingestion preserves the full catalog and tier counts (3302.2049ms)
✔ Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies (797.3313ms)
✔ Slice 9 quality metadata and anchor semantics stay internally consistent (842.1439ms)
✔ Slice 9 browser loader fetches and ingests the NEA catalog fixture (892.0829ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6533.4048
✔ load succeeds, count matches header, and Sirius sorts first (2701.2286ms)
✔ positions are unit vectors, magnitudes are sane, and colors stay in range (6.671ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2820.1222
✔ C3Value requires a typed grid descriptor (1336.1866ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1517.3422
AboutPage is not exported; semantic intro assertion skipped by contract.
✔ catalog count constant is bound to the committed catalog data (2895.6125ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3077.6957
✔ catalog renders distinct loading, failed, and empty-after-filter states (2466.5733ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2613.0384
✔ CK-13 renders the cache-derived LOW C3 screening threshold in the catalog legend (3227.874ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3349.0136
✔ grid-compute fills TOF-fastest (index = depIdx * nTof + tofIdx) (2712.8668ms)
✔ D-01 toSegmentGrid remaps grid-compute layout to departure-fastest (0.273ms)
✔ D-01 LOCK: breadth is measured on the DEPARTURE axis (asymmetric grid) (1.2792ms)
✔ D-02 the departure epoch threaded into segmentation is span.requested.start (0.5424ms)
✔ D-02 BLIND SPOT: column 0 cannot discriminate the two anchors (0.4477ms)
✔ D-02 SENSITIVITY: a 69.184 s anchor shift does flip dateIso across a midnight straddle (0.4627ms)
✔ D-02 computeCompareData threads the injected anchor into argmin.dateIso (2.0462ms)
✔ T1 compare result carries payload-at-C3 and the full spacecraft budget (0.2502ms)
✔ T7 compare data preserves measured grid timing and exposes missing timing as zero (0.2934ms)
✔ D-03 injected absoluteKm2S2 is used, never the module default of 25 (0.6373ms)
✔ D-03 injection changes membership, proving the value is load-bearing (0.527ms)
✔ D-04 echo carries liveMin, delta, absolute, and grid geometry from the computation (0.3131ms)
✔ D-04 relative-mode threshold equals echoed liveMin + delta (0.2297ms)
✔ DEC-17-10 out-of-bounds departure window returns a structured refusal (0.1559ms)
✔ DEC-17-10 refusal is a value — a start before the first sample does not throw (0.2853ms)
✔ a grid with no converged cell refuses with no-convergence (0.1464ms)
✔ DEC-17-6 cap: bodies beyond 5 are refused with cap-exceeded, first 5 computed (1.0757ms)
✔ serial orchestration preserves input order and is deterministic (2.0766ms)
✔ deliveredMass is null on NO-PRACTICAL-WINDOW rather than a fabricated number (0.1686ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2860.5802
(node:66728) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ T1 compare rows render the near-zero flag only for sub-threshold minima and preserve values (3992.8506ms)
✔ T2 compare hide state preserves practical order and dominance while replacing flagged values (3496.8456ms)
✔ T3 compare size factors are derived from the imported albedo constants in both directions (2880.6362ms)
✔ W3a compare flags an Apophis window arriving after support without changing ranking data (2729.7724ms)
✔ W3b compare exposes delivered-mass anchors, NASA contract context, and the New Glenn caveat (4547.9623ms)
✔ T7 compare badge refuses timing when any grid lacks a measurement (3909.4765ms)
✔ compare defines the breadth qualifier from B_min and the sampling interval (tail2 F7) (3365.081ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 25076.5241
✔ parse: basic list, with and without leading ? and other params (2206.2992ms)
✔ parse: missing or empty parameter yields [] (0.1574ms)
✔ parse: dedupes, first occurrence wins (0.1231ms)
✔ parse: caps at 5 (0.0979ms)
✔ parse: junk is rejected, valid neighbors survive (0.1374ms)
✔ parse: URL-encoded internal spaces decode and survive (0.0858ms)
✔ serialize: joins, dedupes, caps, drops junk; empty yields empty string (0.1325ms)
✔ round-trip: parse(serialize(x)) is the sanitized x (0.1397ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2339.0931
✔ co-orbital disclosure attributes the rendered comparison to patched-conic methods (2103.5716ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2201.4138
PASS tsc compilation
PASS BODY_CONSTANTS has key 'sun'
PASS BODY_CONSTANTS has key 'mercury'
PASS BODY_CONSTANTS has key 'venus'
PASS BODY_CONSTANTS has key 'earth'
PASS BODY_CONSTANTS has key 'moon'
PASS BODY_CONSTANTS has key 'mars'
PASS BODY_CONSTANTS has key 'phobos'
PASS BODY_CONSTANTS has key 'deimos'
PASS BODY_CONSTANTS has key 'jupiter'
PASS BODY_CONSTANTS has key 'io'
PASS BODY_CONSTANTS has key 'europa'
PASS BODY_CONSTANTS has key 'ganymede'
PASS BODY_CONSTANTS has key 'callisto'
PASS BODY_CONSTANTS has key 'saturn'
PASS BODY_CONSTANTS has key 'titan'
PASS BODY_CONSTANTS has key 'rhea'
PASS BODY_CONSTANTS has key 'iapetus'
PASS BODY_CONSTANTS has key 'tethys'
PASS BODY_CONSTANTS has key 'dione'
PASS BODY_CONSTANTS has key 'mimas'
PASS BODY_CONSTANTS has key 'enceladus'
PASS BODY_CONSTANTS['sun'].radiusM > 0
PASS BODY_CONSTANTS['mercury'].radiusM > 0
PASS BODY_CONSTANTS['venus'].radiusM > 0
PASS BODY_CONSTANTS['earth'].radiusM > 0
PASS BODY_CONSTANTS['moon'].radiusM > 0
PASS BODY_CONSTANTS['mars'].radiusM > 0
PASS BODY_CONSTANTS['phobos'].radiusM > 0
PASS BODY_CONSTANTS['deimos'].radiusM > 0
PASS BODY_CONSTANTS['jupiter'].radiusM > 0
PASS BODY_CONSTANTS['io'].radiusM > 0
PASS BODY_CONSTANTS['europa'].radiusM > 0
PASS BODY_CONSTANTS['ganymede'].radiusM > 0
PASS BODY_CONSTANTS['callisto'].radiusM > 0
PASS BODY_CONSTANTS['saturn'].radiusM > 0
PASS BODY_CONSTANTS['titan'].radiusM > 0
PASS BODY_CONSTANTS['rhea'].radiusM > 0
PASS BODY_CONSTANTS['iapetus'].radiusM > 0
PASS BODY_CONSTANTS['tethys'].radiusM > 0
PASS BODY_CONSTANTS['dione'].radiusM > 0
PASS BODY_CONSTANTS['mimas'].radiusM > 0
PASS BODY_CONSTANTS['enceladus'].radiusM > 0
PASS BODY_CONSTANTS['sun'].naifId > 0
PASS BODY_CONSTANTS['mercury'].naifId > 0
PASS BODY_CONSTANTS['venus'].naifId > 0
PASS BODY_CONSTANTS['earth'].naifId > 0
PASS BODY_CONSTANTS['moon'].naifId > 0
PASS BODY_CONSTANTS['mars'].naifId > 0
PASS BODY_CONSTANTS['phobos'].naifId > 0
PASS BODY_CONSTANTS['deimos'].naifId > 0
PASS BODY_CONSTANTS['jupiter'].naifId > 0
PASS BODY_CONSTANTS['io'].naifId > 0
PASS BODY_CONSTANTS['europa'].naifId > 0
PASS BODY_CONSTANTS['ganymede'].naifId > 0
PASS BODY_CONSTANTS['callisto'].naifId > 0
PASS BODY_CONSTANTS['saturn'].naifId > 0
PASS BODY_CONSTANTS['titan'].naifId > 0
PASS BODY_CONSTANTS['rhea'].naifId > 0
PASS BODY_CONSTANTS['iapetus'].naifId > 0
PASS BODY_CONSTANTS['tethys'].naifId > 0
PASS BODY_CONSTANTS['dione'].naifId > 0
PASS BODY_CONSTANTS['mimas'].naifId > 0
PASS BODY_CONSTANTS['enceladus'].naifId > 0
PASS BODY_CONSTANTS['sun'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mercury'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['venus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['earth'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['moon'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mars'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['phobos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['deimos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['jupiter'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['io'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['europa'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['ganymede'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['callisto'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['saturn'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['titan'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['rhea'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['iapetus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['tethys'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['dione'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mimas'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['enceladus'].vizColor in [0x000000, 0xFFFFFF]
PASS INV008_BARS_M has key 'sun'
PASS INV008_BARS_M has key 'mercury'
PASS INV008_BARS_M has key 'venus'
PASS INV008_BARS_M has key 'earth'
PASS INV008_BARS_M has key 'moon'
PASS INV008_BARS_M has key 'mars'
PASS INV008_BARS_M['sun'] > 0
PASS INV008_BARS_M['mercury'] > 0
PASS INV008_BARS_M['venus'] > 0
PASS INV008_BARS_M['earth'] > 0
PASS INV008_BARS_M['moon'] > 0
PASS INV008_BARS_M['mars'] > 0
PASS INV010_BARS_M has key 'saturn'
PASS INV010_BARS_M has key 'titan'
PASS INV010_BARS_M has key 'rhea'
PASS INV010_BARS_M has key 'iapetus'
PASS INV010_BARS_M has key 'tethys'
PASS INV010_BARS_M has key 'dione'
PASS INV010_BARS_M has key 'mimas'
PASS INV010_BARS_M has key 'enceladus'
PASS INV010_BARS_M['saturn'] > 0
PASS INV010_BARS_M['titan'] > 0
PASS INV010_BARS_M['rhea'] > 0
PASS INV010_BARS_M['iapetus'] > 0
PASS INV010_BARS_M['tethys'] > 0
PASS INV010_BARS_M['dione'] > 0
PASS INV010_BARS_M['mimas'] > 0
PASS INV010_BARS_M['enceladus'] > 0
PASS INV011_BARS_M has key 'phobos'
PASS INV011_BARS_M has key 'deimos'
PASS INV011_BARS_M['phobos'] > 0
PASS INV011_BARS_M['deimos'] > 0
PASS INTERPOLATION_ERROR_BARS_M has key 'sun'
PASS BODY_CADENCE_SECONDS has key 'sun'
PASS BODY_INTERPOLATION_INVARIANTS has key 'sun'
PASS INTERPOLATION_ERROR_BARS_M has key 'mercury'
PASS BODY_CADENCE_SECONDS has key 'mercury'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mercury'
PASS INTERPOLATION_ERROR_BARS_M has key 'venus'
PASS BODY_CADENCE_SECONDS has key 'venus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'venus'
PASS INTERPOLATION_ERROR_BARS_M has key 'earth'
PASS BODY_CADENCE_SECONDS has key 'earth'
PASS BODY_INTERPOLATION_INVARIANTS has key 'earth'
PASS INTERPOLATION_ERROR_BARS_M has key 'moon'
PASS BODY_CADENCE_SECONDS has key 'moon'
PASS BODY_INTERPOLATION_INVARIANTS has key 'moon'
PASS INTERPOLATION_ERROR_BARS_M has key 'mars'
PASS BODY_CADENCE_SECONDS has key 'mars'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mars'
PASS INTERPOLATION_ERROR_BARS_M has key 'phobos'
PASS BODY_CADENCE_SECONDS has key 'phobos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'phobos'
PASS INTERPOLATION_ERROR_BARS_M has key 'deimos'
PASS BODY_CADENCE_SECONDS has key 'deimos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'deimos'
PASS INTERPOLATION_ERROR_BARS_M has key 'jupiter'
PASS BODY_CADENCE_SECONDS has key 'jupiter'
PASS BODY_INTERPOLATION_INVARIANTS has key 'jupiter'
PASS INTERPOLATION_ERROR_BARS_M has key 'io'
PASS BODY_CADENCE_SECONDS has key 'io'
PASS BODY_INTERPOLATION_INVARIANTS has key 'io'
PASS INTERPOLATION_ERROR_BARS_M has key 'europa'
PASS BODY_CADENCE_SECONDS has key 'europa'
PASS BODY_INTERPOLATION_INVARIANTS has key 'europa'
PASS INTERPOLATION_ERROR_BARS_M has key 'ganymede'
PASS BODY_CADENCE_SECONDS has key 'ganymede'
PASS BODY_INTERPOLATION_INVARIANTS has key 'ganymede'
PASS INTERPOLATION_ERROR_BARS_M has key 'callisto'
PASS BODY_CADENCE_SECONDS has key 'callisto'
PASS BODY_INTERPOLATION_INVARIANTS has key 'callisto'
PASS INTERPOLATION_ERROR_BARS_M has key 'saturn'
PASS BODY_CADENCE_SECONDS has key 'saturn'
PASS BODY_INTERPOLATION_INVARIANTS has key 'saturn'
PASS INTERPOLATION_ERROR_BARS_M has key 'titan'
PASS BODY_CADENCE_SECONDS has key 'titan'
PASS BODY_INTERPOLATION_INVARIANTS has key 'titan'
PASS INTERPOLATION_ERROR_BARS_M has key 'rhea'
PASS BODY_CADENCE_SECONDS has key 'rhea'
PASS BODY_INTERPOLATION_INVARIANTS has key 'rhea'
PASS INTERPOLATION_ERROR_BARS_M has key 'iapetus'
PASS BODY_CADENCE_SECONDS has key 'iapetus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'iapetus'
PASS INTERPOLATION_ERROR_BARS_M has key 'tethys'
PASS BODY_CADENCE_SECONDS has key 'tethys'
PASS BODY_INTERPOLATION_INVARIANTS has key 'tethys'
PASS INTERPOLATION_ERROR_BARS_M has key 'dione'
PASS BODY_CADENCE_SECONDS has key 'dione'
PASS BODY_INTERPOLATION_INVARIANTS has key 'dione'
PASS INTERPOLATION_ERROR_BARS_M has key 'mimas'
PASS BODY_CADENCE_SECONDS has key 'mimas'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mimas'
PASS INTERPOLATION_ERROR_BARS_M has key 'enceladus'
PASS BODY_CADENCE_SECONDS has key 'enceladus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'enceladus'
PASS body-class tagging covers fixed bodies and asteroid ids
PASS BODY_CONSTANTS['jupiter'].naifId matches README
PASS BODY_CONSTANTS['jupiter'].radiusM matches README
PASS BODY_CONSTANTS['jupiter'].vizColor matches README
PASS BODY_CADENCE_SECONDS['jupiter'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['jupiter'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['jupiter'] matches Slice 3 invariant
PASS BODY_CONSTANTS['jupiter'].radiiM matches README triaxial values
PASS BODY_CONSTANTS['io'].naifId matches README
PASS BODY_CONSTANTS['io'].radiusM matches README
PASS BODY_CONSTANTS['io'].vizColor matches README
PASS BODY_CADENCE_SECONDS['io'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['io'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['io'] matches Slice 3 invariant
PASS BODY_CONSTANTS['europa'].naifId matches README
PASS BODY_CONSTANTS['europa'].radiusM matches README
PASS BODY_CONSTANTS['europa'].vizColor matches README
PASS BODY_CADENCE_SECONDS['europa'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['europa'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['europa'] matches Slice 3 invariant
PASS BODY_CONSTANTS['ganymede'].naifId matches README
PASS BODY_CONSTANTS['ganymede'].radiusM matches README
PASS BODY_CONSTANTS['ganymede'].vizColor matches README
PASS BODY_CADENCE_SECONDS['ganymede'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['ganymede'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['ganymede'] matches Slice 3 invariant
PASS BODY_CONSTANTS['callisto'].naifId matches README
PASS BODY_CONSTANTS['callisto'].radiusM matches README
PASS BODY_CONSTANTS['callisto'].vizColor matches README
PASS BODY_CADENCE_SECONDS['callisto'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['callisto'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['callisto'] matches Slice 3 invariant
PASS BODY_CONSTANTS['mars'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['mars'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['mars'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['mars'] matches Slice 6 invariant
PASS BODY_CONSTANTS['mars'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['phobos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['phobos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['phobos'] matches Slice 6 invariant
PASS INV011_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_CONSTANTS['phobos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['deimos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['deimos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['deimos'] matches Slice 6 invariant
PASS INV011_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_CONSTANTS['deimos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['saturn'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['saturn'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['saturn'] matches Slice 4 invariant
PASS INV010_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_CONSTANTS['saturn'].radiiM matches Slice 4 triaxial values
PASS BODY_CONSTANTS['titan'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['titan'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['titan'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['titan'] matches Slice 4 invariant
PASS INV010_BARS_M['titan'] matches Slice 4 bar
PASS BODY_CONSTANTS['rhea'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['rhea'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['rhea'] matches Slice 4 invariant
PASS INV010_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_CONSTANTS['iapetus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['iapetus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['iapetus'] matches Slice 4 invariant
PASS INV010_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_CONSTANTS['tethys'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['tethys'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['tethys'] matches Slice 4 invariant
PASS INV010_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_CONSTANTS['dione'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['dione'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['dione'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['dione'] matches Slice 4 invariant
PASS INV010_BARS_M['dione'] matches Slice 4 bar
PASS BODY_CONSTANTS['mimas'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['mimas'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['mimas'] matches Slice 4 invariant
PASS INV010_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_CONSTANTS['enceladus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['enceladus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['enceladus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['enceladus'] matches Slice 4 invariant
PASS INV010_BARS_M['enceladus'] matches Slice 4 bar
PASS SATURN_D_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_C_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_A_RING_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_HUYGENS_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_OUTER_RADIUS_M matches Slice 5 docs
PASS createAsteroidCatalogIndex ingests all 1008 asteroid records
PASS createAsteroidCatalogIndex identifies the 8 curated NEAs
PASS eccentricityBandForBody(0.0999) returns A
PASS eccentricityBandForBody(0.1) returns B
PASS eccentricityBandForBody(0.1999) returns B
PASS eccentricityBandForBody(0.2) returns C
PASS eccentricityBandForBody(0.2999) returns C
PASS eccentricityBandForBody(0.3) returns D
PASS hasOrbitLineForBody(10.97) returns true
PASS hasOrbitLineForBody(10.98) returns false
PASS hasOrbitLineForBody(10.99) returns false
PASS curated NEA designation 101955 remains flagged
PASS curated NEA designation 99942 remains flagged
PASS curated NEA designation 433 remains flagged
PASS curated NEA designation 25143 remains flagged
PASS curated NEA designation 162173 remains flagged
PASS curated NEA designation 4179 remains flagged
PASS curated NEA designation 1620 remains flagged
PASS curated NEA designation 4769 remains flagged
PASS asteroid lookup works by designation and SPK id for Bennu
PASS estimatedRadiusM matches the H-derived default-albedo formula for Bennu
PASS Slice 7 asteroid fixture entries can be extended with Slice 8 band and orbit-line metadata

All assertions passed.
✔ tests\v2-core-constants.test.mjs (2697.6626ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2709.0856
slice3MaxRoundTripError=0
slice3MaxChainTenError=0
✔ Slice 3 boundary ingestion tags Galileans as FRAME_JUPITER_J2000_ICRF (2954.5804ms)
✔ Slice 3 HELIO ↔ JUPITER round-trip stays within one-pass and ten-chain bounds (30.6266ms)
✔ Slice 1 HELIO ↔ GCRS round-trip still works unchanged (4.5638ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3116.8185
slice6MarsMaxRoundTripError=0
slice6MarsMaxChainTenError=0
slice6MarsMoonMaxHelioRoundTripError=0
slice6MarsMoonMaxChainTenError=0
slice6MarsMoonMaxNativeRoundTripRelativeError=1.6947555828275902e-12
✔ Slice 6 HELIO ↔ MARS direct round-trip on Mars heliocentric states stays within bounds (2788.0453ms)
✔ Slice 6 HELIO ↔ MARS round-trip on interpolated Mars-centered moon states stays within bounds (37.4528ms)
✔ Slice 6 frame additions preserve GCRS, Jupiter, and Saturn paths (96.9249ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3010.1571
slice4SaturnMaxRoundTripError=0
slice4SaturnMaxChainTenError=0
slice4MoonMaxHelioRoundTripError=0
slice4MoonMaxChainTenError=0
slice4MoonMaxNativeRoundTripRelativeError=6.335544898437588e-13
✔ Slice 4 HELIO ↔ SATURN direct round-trip on Saturn heliocentric states stays within bounds (2604.2605ms)
✔ Slice 4 HELIO ↔ SATURN round-trip on interpolated Saturn-centered moon states stays within bounds (84.9965ms)
✔ Slice 4 frame additions preserve Jupiter and GCRS paths (48.3888ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2910.3338
slice3Hermite jupiter maxErrorKm=7.142806491701069 rmsErrorKm=4.199738159183813 barKm=50 checked=4319
slice3Hermite io maxErrorKm=0.5442963290723388 rmsErrorKm=0.33658103781622706 barKm=5 checked=8639
slice3Hermite europa maxErrorKm=4.50430937666286 rmsErrorKm=2.6736541902238957 barKm=20 checked=4319
slice3Hermite ganymede maxErrorKm=6.610468763880747 rmsErrorKm=4.127952978794724 barKm=20 checked=4319
slice3Hermite callisto maxErrorKm=7.016665103601909 rmsErrorKm=3.928974726508747 barKm=50 checked=4319
✔ Slice 3 Jupiter-system Hermite interpolation stays below INV-009 bars (3459.1047ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3655.0688
slice6Hermite mars maxErrorKm=0.008932563975280729 rmsErrorKm=0.005288750696475446 barKm=0.05 checked=270
slice6Hermite phobos maxErrorKm=0.7787715830854933 rmsErrorKm=0.48601715486892844 barKm=5 checked=21600
slice6Hermite deimos maxErrorKm=0.11319505860637424 rmsErrorKm=0.08328683543873051 barKm=0.5 checked=6480
✔ Slice 6 Mars-system Hermite interpolation stays below INV-008/INV-011 bars with pre-research-matching error (3918.3833ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4092.4838
slice4Hermite saturn maxErrorKm=0.2023990147891148 rmsErrorKm=0.06964598071541636 barKm=1 checked=4319
slice4Hermite titan maxErrorKm=6.034245679338891 rmsErrorKm=3.150894748674291 barKm=20 checked=4319
slice4Hermite rhea maxErrorKm=1.2646108832459069 rmsErrorKm=0.7992468821770016 barKm=5 checked=4319
slice4Hermite iapetus maxErrorKm=0.6187833209615409 rmsErrorKm=0.25170364508742626 barKm=2 checked=4319
slice4Hermite tethys maxErrorKm=0.2843355703425951 rmsErrorKm=0.1812933392207793 barKm=1 checked=8639
slice4Hermite dione maxErrorKm=6.777691855843222 rmsErrorKm=4.24466979005391 barKm=50 checked=4319
slice4Hermite mimas maxErrorKm=3.3593358528420176 rmsErrorKm=1.8574590119921746 barKm=20 checked=8639
slice4Hermite enceladus maxErrorKm=0.8570913723667154 rmsErrorKm=0.5277623322167538 barKm=5 checked=8639
✔ Slice 4 Saturn-system Hermite interpolation stays below INV-010 bars (4419.2747ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4600.5372
PASS tsc compilation
PASS interpolate at t0 returns s0 position (rel err < 1e-9)
PASS interpolate at t1 returns s1 position (rel err < 1e-9)
PASS interpolate at midpoint returns finite position
PASS assertInterpolationError throws AssertError for Earth error 1000 m (> 500 m bar)
PASS Earth interpolation overflow routes to INV-008
PASS assertInterpolationError does not throw for Earth error 100 m (< 500 m bar)
PASS assertInterpolationError throws AssertError for Tethys error 1100 m (> 1 km bar)
PASS Tethys interpolation overflow routes to INV-010
PASS Tethys overflow includes bodyId detail
PASS Tethys overflow includes measuredErrorKm detail
PASS Tethys overflow includes barKm detail
PASS Tethys overflow includes cadence from constants
PASS assertInterpolationError does not throw in report mode for Enceladus overflow
PASS assertInterpolationError emits one report-mode violation for Enceladus overflow
PASS Report-mode Enceladus overflow routes to INV-010
PASS Report-mode Enceladus overflow includes bodyId detail
PASS Report-mode Enceladus overflow includes measuredErrorKm detail
PASS Report-mode Enceladus overflow includes barKm detail
PASS Report-mode Enceladus overflow includes tdbSeconds detail
PASS Report-mode Enceladus overflow includes cadence from constants
PASS assertInterpolationError throws AssertError for Phobos error 5100 m (> 5 km bar)
PASS Phobos interpolation overflow routes to INV-011
PASS Phobos overflow includes bodyId detail
PASS Phobos overflow includes measuredErrorKm detail
PASS Phobos overflow includes barKm detail
PASS Phobos overflow includes 30-minute cadence detail
PASS assertInterpolationError does not throw in report mode for Deimos overflow
PASS assertInterpolationError emits one report-mode violation for Deimos overflow
PASS Report-mode Deimos overflow routes to INV-011
PASS Report-mode Deimos overflow includes bodyId detail
PASS Report-mode Deimos overflow includes measuredErrorKm detail
PASS Report-mode Deimos overflow includes barKm detail
PASS Report-mode Deimos overflow includes tdbSeconds detail
PASS Report-mode Deimos overflow includes 1-hour cadence detail

All assertions passed.
✔ tests\v2-core-hermite.test.mjs (3047.9381ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3059.0067
✔ propagateKeplerianStateVectors reproduces the fixture anchor state within one meter (2145.1002ms)
✔ forward 30d epoch shift then backward propagation returns to the initial state within one meter (4.0638ms)
✔ angular momentum and specific orbital energy remain conserved over 90 days (5.8092ms)
✔ high-e solver converges within the iteration cap (0.1249ms)
✔ production Keplerian port matches the round-2 Vesta day-90 research residual (8.1131ms)
✔ assertKeplerianError routes asteroid overflows to INV-012 (1.433ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2288.1488
✔ Vesta orbit samples close cleanly at 64 segments (2650.8526ms)
✔ Apophis high-e orbit uses expected radius law across the sampled ellipse (6.6819ms)
✔ sampled orbit points satisfy the conic radius equation for Vesta (5.5569ms)
✔ sampled orbit vectors preserve the independently derived canonical orientation (4.6709ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2790.4926
✔ catalog and porkchop span labels derive full dates from their own parameters (4864.7211ms)
✔ catalog footer quotes the cache end and the porkchop grid end from their own constants (2063.1544ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7066.4966
✔ C3 formatting is owned by C3Value outside the pure formatter (64.281ms)
✔ badge construction is owned by shared design components (32.3526ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 195.7245
✔ shared honesty components preserve the characterization fixture (2662.0644ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2789.1256
✔ design tokens are deterministic and provenance-pinned (14.6544ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 166.3001
✔ DLA feasibility labels import the production view vocabulary (2855.8061ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2993.7543
(node:46060) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ DLA disclosure, site picker, and band legend render with contours off and on (17014.7575ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 17250.0328
✔ tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning (2558.6151ms)
✔ tracking inside coverage mounts LIVE without a warning (1922.6344ms)
✔ outside coverage the HUD date line is marked clamped and Shift+N help tells the truth (2120.5544ms)
✔ coverage line gains a refresh-due notice in the last 14 days of coverage only (2058.4487ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8860.9634
✔ F2 characterization fixture records the HEAD honesty text across all three surfaces (1.5563ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 135.7372
✔ FK3 AMBER tour explains zero added Delta-V while RED still names dogleg (2417.3996ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2545.4686
✔ payloadAtC3 New Glenn/Standard C3=0 === 7180 kg (0.9582ms)
✔ payloadAtC3 New Glenn/Standard C3=5 === 6055 kg (0.109ms)
✔ payloadAtC3 New Glenn/Standard C3=20 === 2365 kg (0.075ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=0 === 15010 kg (0.8132ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=5 === 13677.5 kg (0.1117ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=20 === 10115 kg (0.0728ms)
✔ payloadAtC3 Vulcan/VC6 C3=0 === 10850 kg (0.0703ms)
✔ payloadAtC3 Vulcan/VC6 C3=5 === 9990 kg (0.0916ms)
✔ payloadAtC3 Vulcan/VC6 C3=20 === 7630 kg (0.1182ms)
✔ deliveredMassKg New Glenn/Standard C3=5 one-way === 3494.511538898568 kg (0.3249ms)
✔ every launch-vehicle anchor carries a source-derived basis (0.1109ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 229.3806
✔ tests\v2-lambert\dla.test.mjs (2662.5127ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2669.5604
✔ tests\v2-lambert\feasibility.test.mjs (2634.8405ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2640.9619
householder.test: PASS
✔ tests\v2-lambert\householder.test.mjs (2217.9768ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2227.0648
hyp2f1b.test: PASS
✔ tests\v2-lambert\hyp2f1b.test.mjs (2442.6417ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2456.0052
initial-guess.test: PASS
✔ tests\v2-lambert\initial-guess.test.mjs (2494.6813ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2502.9483
lambert-endtoend.test: PASS
✔ tests\v2-lambert\lambert-endtoend.test.mjs (2683.8125ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2692.4517
lambert-multi-rev-rejection.test: PASS
✔ tests\v2-lambert\lambert-multi-rev-rejection.test.mjs (2380.2734ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2391.2807
lambertMultiRev: no solution for M=1; T=0.5790023712295225 < T_min=4.403057492003494
lambertMultiRev: no solution for M=2; T=6.224170889575949 < T_min=7.768035471712736
lambertMultiRev: no solution for M=1; T=1.8936975346281286 < T_min=4.565433395618
lambertMultiRev: no solution for M=1; T=3.142611278377002 < T_min=4.589850624734614
lambertMultiRev: no solution for M=1; T=4.401579074102609 < T_min=4.711344422248995
lambertMultiRev: no solution for M=1; T=4.603344913728462 < T_min=4.73916181439084
lambertMultiRev: no solution for M=1; T=4.708577625250112 < T_min=4.754505056873685
lambertMultiRev: no solution for M=1; T=4.762318080262853 < T_min=4.762559475692091
lambertMultiRev: no solution for M=1; T=4.76252949463941 < T_min=4.762591453257581
lambertMultiRev: no solution for M=1; T=4.762582350055022 < T_min=4.762599448281306
lambertMultiRev: no solution for M=1; T=4.762595564022766 < T_min=4.7626014470767615
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambert-multi-rev.test: PASS
✔ tests\v2-lambert\lambert-multi-rev.test.mjs (4003.1453ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4010.3153
stumpff.test: PASS
✔ tests\v2-lambert\stumpff.test.mjs (2282.2599ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2291.9937
tof.test: PASS
✔ tests\v2-lambert\tof.test.mjs (2366.4722ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2373.9157
utc-to-tdb.test: PASS
✔ tests\v2-lambert\utc-to-tdb.test.mjs (2544.1892ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2553.3792
vec3.test: PASS
✔ tests\v2-lambert\vec3.test.mjs (2454.6929ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2465.6702
✔ K4 light time uses Earth distance, two significant figures, and inherited tier caveats (2383.1774ms)
✔ K4 refuses every ruled invalid state without displaying a number (2468.7294ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5008.9533
✔ tests\v2-near-zero-c3.test.mjs (2510.6844ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2518.0419
✔ T3 Porkchop extremes and pinned readout flag, hide, and restore the same C3 source value (4592.2274ms)
✔ K7 pin callback publishes the newly pinned cell while replacement computation is pending (4366.803ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9106.416
(node:7104) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog disclosure renders plain-English public copy (2833.8793ms)
✔ About audit exhibits render plain-English titles and evidence labels (3758.0675ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6758.2023
✔ public disclosure sections render without internal taxonomy identifiers or duplicated trust numbers (2299.0235ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2482.6525
✔ construction distributes the Slice 8 catalog across the measured 1 AU cells (3561.1182ms)
✔ off-axis outer-system view culls some occupied cells (347.8999ms)
✔ focused close-zoom keeps visible cells in a small local neighborhood (312.8933ms)
✔ cells near the frustum edge stay visible across a +/-0.5 degree camera sweep (2.2539ms)
✔ raycastIntersectCells returns null for misses, hits the expected body, and reassigns across cells after position changes (13.2007ms)
✔ rendered instanced position matches the propagated world position used for focus truth (302.5382ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4750.6371
✔ orbit-batch geometry uses the expected concatenated vertex count (2608.9114ms)
✔ orbit-batch material matches the DEC-11 MVP line settings (26.1253ms)
✔ orbit-batch vertices for Vesta match the sampled ellipse positions (35.4712ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2836.8574
✔ asteroid points shader material constructs with additive soft-glow settings (2867.9835ms)
✔ ALIASED_POINT_SIZE_RANGE query falls back cleanly when no GL context exists (1.6873ms)
✔ per-point color attribute distinguishes curated NEAs from main-belt asteroids (7.4914ms)
✔ overview Vesta-sized points land in the tuned 4-8 px visibility band (3.909ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3061.5264
✔ sub-pixel asteroid renders in Points mode (2803.2888ms)
✔ mid-zoom asteroid renders in InstancedMesh mode (1.8488ms)
✔ focused asteroid renders in individual Mesh mode when resolved (2.4787ms)
✔ hysteresis keeps a near-threshold asteroid stable around 1.7 px (0.122ms)
✔ Points, InstancedMesh, and focused Mesh agree on world position (2.5572ms)
✔ focused asteroid gets a highlighted orbit while the main orbit batch stays visible in browse-scale focus (1.5316ms)
✔ main orbit batch fades out when the focused asteroid reaches close-inspection mesh mode (0.7666ms)
✔ main orbit batch excludes asteroids below the hasOrbitLine threshold while focused orbit highlight still works (1.0983ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2988.2148
✔ halo opacity stays at full base opacity below the full-visibility threshold (2090.3043ms)
✔ halo opacity fades linearly through the hysteresis transition zone (0.3557ms)
✔ halo opacity reaches zero at and above the invisible threshold (0.1898ms)
✔ Saturn moon halo floors vary by moon size with Titan at least 3x Mimas (0.2613ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2200.876
✔ Jupiter oblate mesh extents match documented radii (2834.3819ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2994.3216
✔ Mars oblate mesh extents match documented radii (2705.8693ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2866.7392
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:37684) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phobos rendered world position equals its heliocentric focus anchor (5385.6844ms)
✔ Deimos rendered world position equals its heliocentric focus anchor (76.6415ms)
✔ Mars body mesh receives the documented render-only tilt (100.7149ms)
✔ Mars moons do not inherit the render-only tilt (108.5429ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5863.625
✔ Saturn oblate mesh extents match documented radii (2549.7656ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2697.5218
✔ Saturn ring local plane stays on XZ with +Y normals (2393.9333ms)
✔ Saturn main ring and Cassini geometry radii match spec (17.4433ms)
✔ Saturn ring opacity sampling preserves D/C/B/A ordering (0.567ms)
✔ Saturn Cassini opacity peaks at the division center (0.3198ms)
✔ Saturn ring texture preserves multiple radial alpha levels (5.6992ms)
✔ Saturn ring substructure adds seven named sibling meshes under saturn-rings (7.3768ms)
✔ Saturn ring substructure radii match Slice 5 constants (7.7661ms)
✔ Saturn ring substructure renderOrder keeps gaps below ringlets and preserves Slice 4 meshes (6.2185ms)
✔ Saturn ring substructure preserves child ordering in inner-radius sequence (4.3763ms)
✔ Saturn Roche Division uses a fading texture rather than a flat-opacity band (7.297ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2590.4601
✔ Vesta and Bennu anchor positions land in the measured 1 AU cells (2862.2716ms)
✔ cellBoundsKmForIndex returns a 1 AU box anchored to the configured grid (0.2848ms)
✔ positions outside the ±28 AU cube return null (0.1256ms)
✔ cellIndexForPositionKm round-trips into a containing cell bounds box (93.8823ms)
✔ iterateAllPossibleCells covers the full 56x56x56 grid (42.7824ms)
✔ Slice 8 fixture occupies the measured ~178 cells at 1 AU resolution (76.8718ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3312.8651
✔ catalog binary loads without error and advertises the expected header (28.6952ms)
✔ star count is in the expected runtime range (24.4937ms)
✔ Sirius is the brightest record and lands at the expected direction (11.4741ms)
✔ Polaris is present near the north celestial pole direction (11.1595ms)
✔ color values stay within [0, 1] for all records (13.3277ms)
✔ INV-014: at least 99% of star directions are unit-length within float32 tolerance (20.076ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 248.1777
✔ constructor builds THREE.Points geometry with expected star attributes (2582.436ms)
✔ INV-014 spot-check: Polaris direction in geometry matches the parsed catalog (5.0151ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2723.8799
✔ canonical bodyId and bare designation resolve to the same catalog body (2871.5326ms)
✔ unknown identifiers resolve to undefined — never a fallback body (148.4458ms)
✔ designations are unique across the whole catalog, so the fallback is unambiguous (85.6395ms)
✔ sampled equivalence across the catalog: designation lookup lands on the body with that id (2832.22ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6107.1033
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:25028) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ pressing t resolves to the top-down preset with the expected final orbit state (3648.414ms)
✔ camera tween locks controls during animation and releases them on completion (0.775ms)
✔ existing regression shortcuts remain intact; Titan focus is on k, and t stays with the top-down preset (3.4988ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3791.6698
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-date-hud.test.mjs:51:34) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:52228) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ date HUD label formats TDB seconds into a readable date string (4501.888ms)
✔ date HUD text updates from the current simulated TDB time (0.5864ms)
✔ runtime creates and removes the date HUD element symmetrically (0.7567ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4699.6226
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-display-integrity.test.mjs:50:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:47044) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ sun light fallback preserves true mesh anchor while keeping a stable fallback direction (4524.3965ms)
✔ viewport sizing falls back cleanly when mount rect is empty (0.9342ms)
✔ keyboard shortcut guard ignores editable targets and accepts canvas-like targets (0.6721ms)
✔ solar runtime source wires display integrity guards into the live interaction path (3.5823ms)
✔ inner and earth-moon runtimes mirror the corrected display patterns (4.7745ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4695.1866
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-focus.test.mjs:51:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:10960) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ focus from overview snaps to the target default radius (5103.7405ms)
✔ cross-body focus snaps to the new target default radius (0.393ms)
✔ re-focusing the same body preserves the current zoom radius (0.5262ms)
✔ asteroid focus uses the documented non-edge-on polar default (0.2527ms)
✔ asteroid focus radius uses the honest-scale default radius rule (0.2155ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5281.8854
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-hover-tooltips.test.mjs:52:40) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:12996) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ hover tooltip helper shows Earth text and hides on empty state (3639.1691ms)
✔ world-position projection maps screen center correctly (2.4024ms)
✔ hoverable bodies stay limited to the planet set through Saturn (1.4905ms)
✔ runtime wires the hover tooltip element, planet-only raycast path, and cleanup (1.176ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3830.5139
✔ empty grid: no components, NO-PRACTICAL-WINDOW, relative threshold is Infinity (2100.148ms)
✔ all cells below T: one component spanning the whole grid (2.5536ms)
✔ a non-converged hole splits a would-be single component (1.0244ms)
✔ tie exactly at T is included (c3 <= T, DEC-17-1) (0.5516ms)
✔ single-cell component exists in components but not in practical (B_min=2) (0.4057ms)
✔ grid of only singletons: NO-PRACTICAL-WINDOW (synthetic 163693 shape) (0.541ms)
✔ diagonal-only adjacency joins under conn8 (0.3098ms)
✔ null-c3 cell is a hole even when flagged converged (0.2638ms)
✔ liveGridMin excludes non-converged and non-finite cells from the relative threshold (0.3403ms)
✔ all-Infinity converged grid under relative mode has no members (not a garbage component) (0.415ms)
✔ argmin and derived outputs from a real segmentation run (0.4105ms)
✔ classifyComponents finds the true minimum on unsorted input (DEC-17-3) (0.2102ms)
✔ threshold resolution: relative = liveMin + delta; absolute ignores liveMin (0.2868ms)
✔ conn4 is not implemented and throws; malformed grid shape throws (0.3669ms)
✔ property: random grids — component minima bound, practical subset, sort, cell conservation (1.7422ms)
✔ artifact 433 @min+5 conn8: threshold, derivation rules, B_min classification (0.1501ms)
✔ artifact 163693 @min+5 conn8: NO-PRACTICAL-WINDOW (0.0619ms)
✔ artifact 99942 @min+2 conn8: 4 practical of 12, best = global min component (0.0735ms)
✔ artifact derivation rules: breadthCells/breadthDays/tofSpanDays are cell multiples (0.1032ms)
✔ artifact cross-check: pasted constants match the committed artifact, read at runtime (2.5358ms)
✔ artifact sort order restores under the module comparator (0.6069ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2243.1473
(node:42048) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ the shortcut overlay names middle-drag pan and compare renders its M=0 method (2764.2242ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2868.836
✔ Slice 1 pure-Node cutover harness clears the numeric bar at fixture truth timesteps (2531.9671ms)
ℹ validatedSampleCount=121
ℹ maxEarthErrorKm=0
ℹ maxMoonErrorKm=0
ℹ maxRoundTripError=7.6457577540892395e-25
ℹ maxChainTenError=7.6457577540892395e-25
ℹ INV-005 not exercised: Slice 1 validates fixture truth timesteps without a propagator by contract
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2650.4952
✔ Slice 1 Horizons fixture exists with Earth and Moon 30-day samples (2.7996ms)
✔ Slice 1 boundary ingress produces canonical heliocentric Earth/Moon states (3094.4221ms)
✔ Slice 1 core frame transform round-trip holds against the Earth anchor fixture (10.0698ms)
✔ Slice 1 render path subtracts in f64 and only downcasts camera-relative values (9.8833ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3308.5616
Compiling v2 core and boundary...
PASS tsc compilation

PASS INV-008 sun     max_err=3.541e-6 km  bar=0.00002 km  (270 pts checked)
PASS INV-008 mercury max_err=2.005e+1 km  bar=100 km  (270 pts checked)
PASS INV-008 venus   max_err=1.819e-1 km  bar=1 km  (270 pts checked)
PASS INV-008 earth   max_err=9.069e-2 km  bar=0.5 km  (270 pts checked)
PASS INV-008 moon    max_err=4.977e+0 km  bar=20 km  (270 pts checked)
PASS INV-008 mars    max_err=8.933e-3 km  bar=0.05 km  (270 pts checked)

All six INV-008 cutover bars cleared. Phase C is UNBLOCKED.
✔ tests\v2-slice2-cutover.test.mjs (2452.2102ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2465.6742
Compiling v2 core and boundary for Slice 3 cutover...
PASS tsc compilation

PASS INV-009 jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
PASS INV-009 io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
PASS INV-009 europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
PASS INV-009 ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
PASS INV-009 callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 per-body interpolation summary:
  jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
  io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
  europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
  ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
  callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 3 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice3-cutover.test.mjs (5881.5653ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5888.3599
Compiling v2 core and boundary for Slice 4 cutover...
PASS tsc compilation

PASS INV-010 saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
PASS INV-010 titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
PASS INV-010 rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
PASS INV-010 iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
PASS INV-010 tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
PASS INV-010 dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
PASS INV-010 mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
PASS INV-010 enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 per-body interpolation summary:
  saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
  titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
  rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
  iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
  tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
  dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
  mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
  enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 4 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice4-cutover.test.mjs (6859.0559ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6866.2595
Compiling Saturn runtime and ring helpers for Slice 5 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
PASS Slice 5 ring substructure meshes exist under saturn-rings
PASS renderOrder discipline preserved: baseline default, overlays explicit
PASS A ring outer radius matches exact 136,770 km PDS value
PASS Saturn default focus orbit stays non-edge-on (polar=1.047198 rad, view-normal angle=63.469 deg)
PASS Slice 4 Saturn moon cutover criteria remain green under Slice 5 regression gate
(node:13532) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice5-cutover.test.mjs (3893.404ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3899.2458
Compiling v2 core and boundary for Slice 6 cutover...
PASS tsc compilation

PASS INV-008 mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
PASS INV-011 phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
PASS INV-011 deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 per-body interpolation summary:
  mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
  phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
  deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 6 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice6-cutover.test.mjs (11463.2459ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11470.7361
Compiling v2 core and boundary for Slice 7 cutover...
PASS tsc compilation

PASS INV-012 10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
PASS INV-012 16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
PASS INV-012 39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
PASS INV-012 40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
PASS INV-012 1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
PASS INV-012 1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
PASS INV-012 4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
PASS INV-012 15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
PASS INV-012 101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
PASS INV-012 162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
PASS INV-012 3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
PASS INV-012 2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
PASS INV-012 1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
PASS INV-012 433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
PASS INV-012 4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
PASS INV-012 4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
PASS INV-012 25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
PASS INV-012 99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 per-body propagation summary:
  10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
  16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
  39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
  40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
  1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
  1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
  4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
  15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
  101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
  162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
  3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
  2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
  1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
  433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
  4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
  4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
  25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
  99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice7-cutover.test.mjs (3296.2082ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3303.2712
Compiling v2 core and boundary for Slice 8 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 3) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}

Slice 8 per-band cutover summary:
  A count=50 max=23147.749445 km bar=35612.872326 km rms=3582.231183 km
  B count=50 max=49114.205128 km bar=52970.091742 km rms=4790.752314 km
  C count=50 max=31804.196407 km bar=37688.076110 km rms=3922.950118 km
  D count=50 max=29163.667462 km bar=43757.549716 km rms=4119.658435 km

Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.
(node:65468) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice8-cutover.test.mjs (6788.3665ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6808.2478
[slice8-performance] outer-system-overview bodies=10008 occupiedCells=178 visibleCells=72 visibleBodies=4234 estimatedGpuDrawCount=72 visibleSlice7RegressionBodies=9
[slice8-performance] asteroid-belt-focus bodies=10008 occupiedCells=178 visibleCells=55 visibleBodies=3126 estimatedGpuDrawCount=55 visibleSlice7RegressionBodies=3
[slice8-performance] focused-vesta-close-zoom bodies=10008 occupiedCells=178 visibleCells=14 visibleBodies=1084 estimatedGpuDrawCount=14 visibleSlice7RegressionBodies=1
✔ Slice 8 cell culling architecture produces sane visibility counts across key camera scenarios (2821.4465ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2949.6717
﹣ Slice 9 Phase A.3 three-gate cutover harness validates the committed contract and documents residual envelope exceedance (1.4315ms) # RETIRED 2026-07-12: fixture slice9-cutover-sample.json was never committed (.gitignore:17), unrecoverable, no generator. Expected values 26/58/66/61 were measured from the lost sample; a regenerated sample would reset them while faking continuity. See SLICE_9_FOUNDING.md amendment.
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 160.4847
✔ slice9 runtime normalization preserves finite render-critical asteroid fields (2642.9663ms)
✔ solar-system runtime is wired to the Slice 9 live catalog and Phase B canonical pipeline (3.4471ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2871.5116
✔ Slice 9 perf config exposes the committed four partition modes and four camera states (0.6019ms)
✔ Slice 9 perf session rows format the observable measurement contract cleanly (0.2549ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 109.4778
✔ Slice 9 A.2b re-anchor recomputes derived fields after replacing elements (367.8832ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 530.7366
▶ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components
  ✔ Partition correctness holds for uniform 0.5 AU and all hybrid candidates (52.1909ms)
  ✔ Hybrid structural validity holds for all candidate density triggers (30.4054ms)
  ✔ Body conservation holds across re-partition after time scrub (807.718ms)
  ✔ Occupancy reproduction at 0.5 AU remains within the committed tolerance band (1.4542ms)
  ✔ Propagation CPU-time measurements report main-thread and worker-thread components without inferring frame budget (694.2557ms)
✔ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components (7828.4212ms)
ℹ Slice 9 uniform 0.5 AU occupancy: occupied=2060 baseline=2060 drift=0.00% maxBodies=1178 baselineMax=1177 drift=0.08%
ℹ Slice 9 propagation CPU-only timing: main median=35.731ms p95=43.992ms; worker roundtrip median=39.328ms p95=286.696ms; worker compute median=38.511ms p95=49.556ms; fallback bodies=1
ℹ Slice 9 offline propagation fallback bodies: 1 (2015 D1 [JFC])
ℹ Slice 9 hybrid summaries: D=200 coarse=544 subCells=2375 leafCells=2876 maxLeaf=266; D=500 coarse=544 subCells=1171 leafCells=1696 maxLeaf=473; D=1000 coarse=544 subCells=749 leafCells=1281 maxLeaf=810
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8020.4686
✔ symmetric-return disclosure is derived from the committed six-row artifact (141.3364ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 285.4042
✔ the seven representative bodies render their sentences verbatim from the committed artifact (3440.5105ms)
✔ structurally blind splits by cause: 206 comets + 482 Jupiter-crossing = 688, each with its own sentence (343.8239ms)
✔ every one of the 41,906 bodies has a full sentence — no value is missing from committed data (30.986ms)
✔ L1: the max-drift date traces to dv-scope-per-body.json, and the boundary is the EARLIEST material encounter, recomputed from the CAD snapshot (697.7435ms)
✔ impactor dates and the 3D drift trace to the truth fixture and nea-drift-results.json (93.1344ms)
✔ formatters: dates, million-km, m/s, AU — and no value is invented from junk (0.8449ms)
✔ a record missing its value yields null (omit), never a sentence with a hole (0.6388ms)
✔ L2 disclosure distinguishes a measured-but-unbounded body from an unmeasured body (31.3385ms)
✔ threshold provenance is verbatim and rides with every mention of 10^6 km; legend has one line per key (1.9827ms)
✔ short labels never expose a slug (31.7359ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4866.282
(node:31172) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog tier legend renders both L2 disclosure phrases from the shared source (2855.2119ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2946.9061
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957027132-0.5379674639983429:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957027132-0.5379674639983429:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:340:29
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957030627-0.0934711879476483:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957030627-0.0934711879476483:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:374:29
}
(node:36700) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phase C overlay mounts with real Preact, reflects store subscriptions, and cleans up (3061.0651ms)
✔ Phase C overlay converges through repeated store updates with finite fake-DOM layout metrics (3320.0625ms)
✔ runtime wires the Phase C.1 overlay mount and focus-request bridge without changing scene ownership (0.8563ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6543.2433
(node:38968) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ ui store initial state matches the documented Phase C.1 defaults (2421.4625ms)
✔ ui store action functions update the state they claim to own (2872.1168ms)
✔ ui store readonly signals reflect dispatched state updates (2624.075ms)
✔ focusRequestId increments monotonically on requestFocus() (2903.3009ms)
✔ focus-request subscription only fires when requestFocus increments (2554.5334ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 13467.6082
✔ validation provenance scopes strict and observed payload figures and preserves magnitude-only wording (4.0694ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 188.7129

================ FINAL SUMMARY ================
files discovered:    111
files passed:        111
files failed:        0
files LOAD-TIMEOUT:  0
tests passed:        369
tests failed:        0
wall clock:          436.8s
accounting:          111 == 111 + 0 + 0 OK
VERIFY_EXIT=0
Finished: 2026-11-17T18:10:44.6172037-05:00

## Step 10 npm run build
Started: 2026-11-17T18:11:39.7555318-05:00

> aster@0.1.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 130 modules transformed.
rendering chunks...
computing gzip size...
docs/v2/about/index.html                                              0.87 kB │ gzip:     0.46 kB
docs/index.html                                                       0.94 kB │ gzip:     0.41 kB
docs/v2/earth-moon/index.html                                         1.01 kB │ gzip:     0.52 kB
docs/v2/inner-solar-system/index.html                                 1.02 kB │ gzip:     0.52 kB
docs/v2/index.html                                                    1.15 kB │ gzip:     0.59 kB
docs/v2/compare/index.html                                            1.26 kB │ gzip:     0.54 kB
docs/v2/solar-system/index.html                                       1.37 kB │ gzip:     0.55 kB
docs/v2/porkchop/index.html                                           1.93 kB │ gzip:     0.70 kB
docs/assets/asteroid-propagation-worker-7DDT4qvy.js                   2.82 kB
docs/assets/validation-provenance-DUvzvU-t.json                       6.52 kB │ gzip:     2.34 kB
docs/assets/porkchop.worker-WAXxJDr5.js                              11.76 kB
docs/legacy/index.html                                               48.69 kB │ gzip:    11.61 kB
docs/assets/horizons-inner-system-rolling-COKYn11o.json             200.06 kB │ gzip:    57.97 kB
docs/assets/star-catalog-tycho2-mag75-Lh18dL25.bin                1,120.02 kB
docs/assets/horizons-jupiter-system-rolling-D7NnnMbz.json         1,295.81 kB │ gzip:   370.43 kB
docs/assets/horizons-mars-system-rolling-BbEEuyA2.json            2,463.35 kB │ gzip:   693.43 kB
docs/assets/horizons-saturn-system-rolling-d_v3Lj_T.json          3,074.74 kB │ gzip:   873.07 kB
docs/assets/horizons-inner-solar-system-2026-2040-Bl0fvEH3.json   7,214.10 kB │ gzip: 2,054.80 kB
docs/assets/nea-catalog-slice9-BkYibDG0.json                     52,969.83 kB │ gzip: 8,116.23 kB
docs/assets/legacy-DBnyUIUO.css                                      21.01 kB │ gzip:     4.56 kB
docs/assets/modulepreload-polyfill-B5Qt9EMX.js                        0.71 kB │ gzip:     0.40 kB
docs/assets/resolve-catalog-body-Cy-9Ep-i.js                          3.73 kB │ gzip:     1.17 kB
docs/assets/aboutV2-DL_Fcx9X.js                                      10.10 kB │ gzip:     4.35 kB
docs/assets/grid-span-CKXl0bRI.js                                    14.47 kB │ gzip:     5.58 kB
docs/assets/store-DURZ-68X.js                                        16.78 kB │ gzip:     6.59 kB
docs/assets/global-style-CBLOWN73.js                                 25.81 kB │ gzip:     9.51 kB
docs/assets/display-body-label-C5FVfzMz.js                           27.43 kB │ gzip:     9.41 kB
docs/assets/porkchopV2-CU68GLWB.js                                   32.40 kB │ gzip:    11.34 kB
docs/assets/compareV2-Cdr7Y37T.js                                    33.47 kB │ gzip:    13.09 kB
docs/assets/solarSystemV2-DMCzKWJd.js                               104.39 kB │ gzip:    34.64 kB
docs/assets/legacy-C6NkCVYx.js                                      177.52 kB │ gzip:    58.69 kB
docs/assets/three.module-CFyvS0yg.js                                513.11 kB │ gzip:   129.23 kB
System.Management.Automation.RemoteException
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.43s
BUILD_EXIT=0
Finished: 2026-11-17T18:11:45.3833247-05:00

Step 10: npm run build PASS (Vite 5.4.21, exit 0). docs/lambert-screen-cache.json byte-identical to fixture, 8,081,586 bytes, SHA256 961bd7af7d6dfdea6936b10882302f750860f6d0534d7b425db685e28ac55469.
New entry bundles: compareV2-Cdr7Y37T.js; solarSystemV2-DMCzKWJd.js. Updated shared bundle: store-DURZ-68X.js.

## Step 11 mutation check 1: altered one Horizons byte; expected test failure
✖ screen cache schema v2 provenance hashes match inputs and shipped cache bytes (136.1946ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 272.2308

✖ failing tests:

test at tests\v2-screen-cache-provenance.test.mjs:15:1
✖ screen cache schema v2 provenance hashes match inputs and shipped cache bytes (136.1946ms)
  AssertionError [ERR_ASSERTION]: horizonsFixtureSha256 matches the Horizons fixture bytes
  + actual - expected
  
  + '784e89c7be995ec3b8b97adf0fe51e52c312f630d029205146ed396111d5da46'
  - 'b278dd5567f30266593c49bf4fef203e7570d3613187fd112dc7015109a39c15'
  
      at TestContext.<anonymous> (file:///C:/Users/hudso/AppData/Local/Temp/s20-a-cache/mut/tests/v2-screen-cache-provenance.test.mjs:35:10)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1397:25)
      at Test.start (node:internal/test_runner/test:1257:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: '784e89c7be995ec3b8b97adf0fe51e52c312f630d029205146ed396111d5da46',
    expected: 'b278dd5567f30266593c49bf4fef203e7570d3613187fd112dc7015109a39c15',
    operator: 'strictEqual',
    diff: 'simple'
  }

## Step 11 mutation check 2: appended one space to generator; expected test failure
✖ screen cache schema v2 provenance hashes match inputs and shipped cache bytes (72.6196ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 239.8953

✖ failing tests:

test at tests\v2-screen-cache-provenance.test.mjs:15:1
✖ screen cache schema v2 provenance hashes match inputs and shipped cache bytes (72.6196ms)
  AssertionError [ERR_ASSERTION]: precomputeScriptSha256 matches the generator bytes
  + actual - expected
  
  + 'e623f9c0420451bee8b0e02ad4f23d0372cea6efcf576ee5c203aa1f67ae68b3'
  - '60f3a3fca9728d4f0bfc83d97a8ea1b686ffda3baf471a806b4a3ea7c14daa37'
  
      at TestContext.<anonymous> (file:///C:/Users/hudso/AppData/Local/Temp/s20-a-cache/mut/tests/v2-screen-cache-provenance.test.mjs:25:10)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1397:25)
      at Test.start (node:internal/test_runner/test:1257:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: 'e623f9c0420451bee8b0e02ad4f23d0372cea6efcf576ee5c203aa1f67ae68b3',
    expected: '60f3a3fca9728d4f0bfc83d97a8ea1b686ffda3baf471a806b4a3ea7c14daa37',
    operator: 'strictEqual',
    diff: 'simple'
  }

## Step 11 mutation check 3: restored both inputs; expected test pass
✔ screen cache schema v2 provenance hashes match inputs and shipped cache bytes (160.6093ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 298.027

## Step 12 npm run verify
Started: 2026-11-17T18:14:39.0738177-05:00

> aster@0.1.0 verify
> npm run typecheck:v2 && npm run test:all


> aster@0.1.0 typecheck:v2
> tsc --noEmit


> aster@0.1.0 test:all
> node tools/run-tests.mjs

Discovered 112 test files (per-file watchdog: 180000 ms):
src\v2\app\catalog-list\row.test.mjs
src\v2\boundary\c3-grid.test.mjs
src\v2\porkchop\colormap.test.mjs
src\v2\porkchop\composite-grid.test.mjs
src\v2\porkchop\delta-v.test.mjs
src\v2\porkchop\dual-m-compute.test.mjs
src\v2\porkchop\grid-compute.test.mjs
src\v2\porkchop\launch-vehicles.test.mjs
src\v2\porkchop\propagation-guard.test.mjs
src\v2\porkchop\support-boundary.test.mjs
tests\phase6-contract-smoke.test.mjs
tests\setup-hooks.test.mjs
tests\v2-a11y-floor.test.mjs
tests\v2-about-copy.test.mjs
tests\v2-about-evidence.test.mjs
tests\v2-architecture.test.mjs
tests\v2-boundary-horizons.test.mjs
tests\v2-boundary-slice2.test.mjs
tests\v2-boundary-slice4.test.mjs
tests\v2-boundary-slice6.test.mjs
tests\v2-boundary-slice7.test.mjs
tests\v2-boundary-slice8.test.mjs
tests\v2-boundary-slice9.test.mjs
tests\v2-boundary-star-catalog.test.mjs
tests\v2-c3-value-type.test.mjs
tests\v2-catalog-count-binding.test.mjs
tests\v2-catalog-empty.test.mjs
tests\v2-catalog-threshold-disclosure.test.mjs
tests\v2-compare-data.test.mjs
tests\v2-compare-honesty.test.mjs
tests\v2-compare-url.test.mjs
tests\v2-coorbital-disclosure.test.mjs
tests\v2-core-constants.test.mjs
tests\v2-core-frames-jupiter.test.mjs
tests\v2-core-frames-mars.test.mjs
tests\v2-core-frames-saturn.test.mjs
tests\v2-core-hermite-jupiter.test.mjs
tests\v2-core-hermite-mars.test.mjs
tests\v2-core-hermite-saturn.test.mjs
tests\v2-core-hermite.test.mjs
tests\v2-core-keplerian.test.mjs
tests\v2-core-orbit-sampling.test.mjs
tests\v2-derived-span-labels.test.mjs
tests\v2-design-architecture.test.mjs
tests\v2-design-components.test.mjs
tests\v2-design-tokens.test.mjs
tests\v2-dla-display.test.mjs
tests\v2-dla-render.test.mjs
tests\v2-ephemeris-hud.test.mjs
tests\v2-f2-characterization.test.mjs
tests\v2-fk3-guided-tour.test.mjs
tests\v2-golden\launch-vehicles.golden.test.mjs
tests\v2-lambert\dla.test.mjs
tests\v2-lambert\feasibility.test.mjs
tests\v2-lambert\householder.test.mjs
tests\v2-lambert\hyp2f1b.test.mjs
tests\v2-lambert\initial-guess.test.mjs
tests\v2-lambert\lambert-endtoend.test.mjs
tests\v2-lambert\lambert-multi-rev-rejection.test.mjs
tests\v2-lambert\lambert-multi-rev.test.mjs
tests\v2-lambert\stumpff.test.mjs
tests\v2-lambert\tof.test.mjs
tests\v2-lambert\utc-to-tdb.test.mjs
tests\v2-lambert\vec3.test.mjs
tests\v2-light-time.test.mjs
tests\v2-near-zero-c3.test.mjs
tests\v2-porkchop-honesty.test.mjs
tests\v2-public-copy-render.test.mjs
tests\v2-public-copy.test.mjs
tests\v2-render-asteroid-cell-renderer.test.mjs
tests\v2-render-asteroid-orbits.test.mjs
tests\v2-render-asteroid-points-shader.test.mjs
tests\v2-render-asteroid-renderer.test.mjs
tests\v2-render-halos.test.mjs
tests\v2-render-jupiter-oblate.test.mjs
tests\v2-render-mars-oblate.test.mjs
tests\v2-render-mars-system.test.mjs
tests\v2-render-saturn-oblate.test.mjs
tests\v2-render-saturn-rings.test.mjs
tests\v2-render-spatial-grid.test.mjs
tests\v2-render-star-catalog.test.mjs
tests\v2-render-star-renderer.test.mjs
tests\v2-resolve-catalog-body.test.mjs
tests\v2-runtime-camera-presets.test.mjs
tests\v2-runtime-date-hud.test.mjs
tests\v2-runtime-display-integrity.test.mjs
tests\v2-runtime-focus.test.mjs
tests\v2-runtime-hover-tooltips.test.mjs
tests\v2-screen-cache-provenance.test.mjs
tests\v2-segment-windows.test.mjs
tests\v2-shortcut-and-method.test.mjs
tests\v2-slice1-cutover.test.mjs
tests\v2-slice1-integration.test.mjs
tests\v2-slice2-cutover.test.mjs
tests\v2-slice3-cutover.test.mjs
tests\v2-slice4-cutover.test.mjs
tests\v2-slice5-cutover.test.mjs
tests\v2-slice6-cutover.test.mjs
tests\v2-slice7-cutover.test.mjs
tests\v2-slice8-cutover.test.mjs
tests\v2-slice8-performance.test.mjs
tests\v2-slice9-cutover.test.mjs
tests\v2-slice9-live-runtime-integration.test.mjs
tests\v2-slice9-perf-config.test.mjs
tests\v2-slice9-reanchor-derived.test.mjs
tests\v2-slice9-spatial-index-harness.test.mjs
tests\v2-symmetric-return.test.mjs
tests\v2-tier-disclosure.test.mjs
tests\v2-tier-legend-render.test.mjs
tests\v2-ui-overlay.test.mjs
tests\v2-ui-store.test.mjs
tests\v2-validation-provenance.test.mjs

(node:45840) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ 2018 LA (L0, verified impact): LOW C3 badge suppressed; C3 kept with the last-known-orbit context (3654.4198ms)
✔ 2015 D1 (L0, hyperbolic): "—" stays, PROP FAIL badge stays, no context is invented for a null C3 (0.6767ms)
✔ non-L0 rows are untouched: 433 (L2) and 99942 (L1) keep their badge and plain C3 (1.0281ms)
✔ near-zero C3 is a separate geometry flag and coexists with the screening status badge (0.9917ms)
✔ near-zero catalog disclosure remains byte-identical to the approved wording (0.466ms)
✔ near-zero hide state replaces only the rendered value and badge, preserving the low-C3 badge and source value (0.4647ms)
✔ S18 Item 5: the tier badge tooltip is the full disclosure sentence, never the slug (0.8458ms)
✔ the rule is exactly {L0} x {low, high}: every other tier/status combination renders its badge (0.9786ms)
✔ catalog C3 grid label is derived from cache metadata and its tooltip carries the full grid details (0.5182ms)
✔ CK-12 catalog C3 uses the shared three-significant-figure rule across its display range (0.6928ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3874.942
✔ cached C3 grid descriptor and short label derive from cache metadata (2184.3696ms)
✔ requested C3 grid descriptor changes with the scan arguments (2545.7359ms)
✔ porkchop grid dimension wording is derived rather than literal (2233.528ms)
✔ T5 formatter output changes with its grid parameters (2899.3267ms)
✔ shared C3 grid label derives common step units from axis parameters (2549.5776ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 12571.7056
✔ c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling (2345.9752ms)
✔ c3ToViridisRgb uses monotonic log normalization with a hard floor at C3 <= 1 (2101.5367ms)
✔ colorForPorkchopCell uses sentinel colors for no_solution and stall (2185.637ms)
✔ non-finite C3 values use the existing no-solution colour (2247.6617ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9013.955
✔ both families solve: strictly lower C3 wins (2572.1309ms)
✔ exact tie goes to M=0 and is counted (0.1504ms)
✔ only one family solves: that family is taken — the measured defect (0.1317ms)
✔ neither solves: no_solution, but a stall is never collapsed (SLICE_11_FOUNDING.md:207) (0.1254ms)
✔ composite minimum is never worse than either single-family minimum (0.3501ms)
✔ per-cell provenance: every ok cell carries the M that produced it (0.1646ms)
✔ AMD-2: the compared C3 is the selected branch, not branch 0 (0.1063ms)
✔ misaligned or mismatched grids throw rather than mis-pair cells (0.5451ms)
✔ counts account for every cell exactly once (0.1532ms)
✔ gridExtremes: both extremes on a normal grid (0.2378ms)
✔ gridExtremes: no_solution and stall cells are excluded (0.1018ms)
✔ gridExtremes: zero solvable cells returns an explicit empty variant (0.0761ms)
✔ gridExtremes: ties resolve to the lowest array index, for both extremes (0.0909ms)
✔ gridExtremes: over a composite grid whose extremes come from different families (0.215ms)
✔ composite never exceeds M=0 per-cell wherever M=0 solves (structural — catches selection inversion) (0.1301ms)
✔ composite max <= M=0 max WHEN M=0 coverage is a superset (onlyM1 === 0) (0.106ms)
✔ the superset precondition is real: with onlyM1 > 0 the composite max CAN exceed M=0 max (0.3012ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2672.9098
✔ ΔV stack is mode-aware: one-way omits departure and sample return uses symmetric-return assumption (2425.2653ms)
✔ D10 labels name margin bases and preserve the displayed value expressions (1.9703ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2566.3425
✔ computeDualFamilyGrids issues exactly two messages, M=0 then M=1 (AMD-1) (2490.1927ms)
✔ computeDualFamilyGrids awaits sequentially — never two computes in flight (0.174ms)
✔ computeDualFamilyGrids carries the request through unchanged, one M per message (0.3357ms)
✔ computeDualFamilyGrids returns both grids keyed by family (0.1169ms)
✔ computeDualFamilyGrids propagates a failure from either family unchanged (0.4222ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2645.7416
lambertMultiRev: no solution for M=1; T=0.579002371229731 < T_min=4.4030574920032794
✔ computePorkchopGrid round-trips three validated M=1 cells through JD+days boundary across the regime (4531.6895ms)
✔ computePorkchopGrid maps below-T_min cells to no_solution (5.2915ms)
✔ computePorkchopGrid selects the lower-C3 branch when both M=1 branches converge (2.9712ms)
✔ computePorkchopGrid maps all-failed synthetic solver output to stall (1.22ms)
✔ porkchop worker init bootstraps Earth state and strips velocity internals from outbound branches (2.2813ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4741.4445
✔ launch vehicle catalog matches locked DEC-13-1 anchors exactly (2445.0683ms)
✔ payloadAtC3 interpolates linearly between published anchors (0.1333ms)
✔ payloadAtC3 never extrapolates past short published curves (0.0934ms)
✔ New Glenn keeps C3=30 anchor, interpolates steep interior, and stops after it (0.0956ms)
✔ payloadAtC3 refuses non-finite C3 separately from beyond-curve inputs (0.0917ms)
✔ deliveredMassKg excludes injection by construction and applies mode departure only for sample return (0.2388ms)
✔ spacecraft budget total is mode-owned and preserves every supplied term (0.7961ms)
✔ deliveredMassKg rejects corrupted budgets and invalid modes with INVALID_INPUT, never BEYOND_CURVE or a number (0.1969ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2568.9249
✔ guard agrees with the propagator on every catalog body (verified by propagating, not by reading the guard) (4968.9792ms)
✔ 2015 D1: the verdict carries the catalog eccentricity and the verbatim sentence (0.7465ms)
✔ message rounds the eccentricity to 4 decimals and invents nothing for a non-finite one (0.4091ms)
✔ computeCompareData: 2015 D1 is refused as a value in place; 433 and 2018 LA are byte-identical to the historical path (10.5678ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5133.9643
✔ 99942: the boundary comes from the committed artifact, and the partition matches the per-column formulation (2588.359ms)
✔ edge behaviour: an encounter before the window makes every cell unsupported; after the last arrival, none (6.0365ms)
✔ no boundary is invented: non-L1 tiers and records without an encounter yield undefined (23.3916ms)
✔ the unsupported-cell sentence is verbatim (0.2593ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2762.6884
✔ all texture assets referenced by legacy/index.html exist on disk (11.5069ms)
✔ legacy entry is frozen, noindexed, and points visitors to V2 (2.994ms)
✔ worker README documents the worker routes implemented in worker/index.js (1.2891ms)
✔ worker README documents all environment variables used by worker/index.js (2.0489ms)
✔ worker README documents wildcard localhost development origin support (2.0745ms)
✔ physics worker no longer hardcodes NHATS and Asterank production route URLs (2.3633ms)
✔ .gitignore covers local worker secrets and wrangler state (0.5111ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 148.8338
✔ prepare hook installer is silent and successful outside a git worktree (176.5129ms)
✔ prepare hook installer configures hooksPath inside a git worktree (455.4276ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 783.8508
(node:51312) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ contrast utility matches WCAG reference pairs and the three lightness overrides (2485.2449ms)
✔ catalog row is keyboard-focusable and Enter activates the same handler as click (2619.8618ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5289.5646
✔ About decision record carries no emoji (tail2 F7) (3068.7548ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3187.7835
✔ About evidence links use rendered audit-copy VNodes and real heading fragments (2081.7747ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2177.6885
✔ src/v2 sources do not import internal modules outside src/v2 (97.7587ms)
✔ C3 grid label sites use derived formatters and contain no literal dimension labels (3.8359ms)
✔ INV-026 departure-end date is owned by grid-span.ts (133.4028ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 343.2715
✔ jdTdbToSecondsSinceJ2000 converts J2000-relative TDB days into seconds (2680.4349ms)
✔ Slice 1 Earth/Moon fixture ingests into canonical meters, m/s, and aligned TDB seconds (5.7295ms)
✔ convertHorizonsRecord accepts object-form records with Horizons-native aliases (0.6416ms)
✔ convertHorizonsRecord rotates ecliptic J2000 vectors into canonical ICRF coordinates (0.2499ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2820.638
✔ Slice 2 fixture file exists and parses as valid JSON (4.7677ms)
✔ Slice 2 fixture contains all six required target keys (2.5029ms)
✔ Each body in Slice 2 fixture has 90-92 records (91 ± 1) (3.2447ms)
✔ Moon records after ingestion have frame matching FRAME_GCRS_EARTH (2087.9896ms)
✔ All non-Moon bodies after ingestion have frame matching FRAME_HELIO_J2000_ICRF (5.4596ms)
✔ First Earth record position magnitude in meters is between 1.48e11 and 1.52e11 (~1 AU) (4.2647ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2243.8547
✔ Slice 4 fixture contains all eight required target keys (17.9384ms)
✔ Slice 4 fixture origin tags match heliocentric Saturn and saturn-centered moons (15.7064ms)
✔ inferCanonicalFrame maps saturn-centered origins to FRAME_SATURN_J2000_ICRF (2436.06ms)
✔ Slice 4 tuple records ingest into canonical meters, m/s, TDB seconds, and Saturn-centered moon frames (62.0948ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2669.3049
✔ Slice 6 fixture contains all three required target keys (9.914ms)
✔ Slice 6 fixture origin tags match heliocentric Mars and mars-centered moons (6.9818ms)
✔ inferCanonicalFrame maps mars-centered origins to FRAME_MARS_J2000_ICRF (2391.4423ms)
✔ Slice 6 tuple records ingest into canonical meters, m/s, TDB seconds, and Mars-centered moon frames (55.9538ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2577.3719
✔ Slice 7 fixture contains the 1008-body hybrid catalog and required asteroid ids (6.2501ms)
✔ Slice 7 boundary ingestion preserves all 1008 asteroid records and the 8 curated NEAs (2131.4718ms)
✔ Slice 7 boundary spot-checks preserve Vesta, Bennu, and Apophis metadata and heliocentric frame (11.7294ms)
✔ Slice 7 boundary ingestion preserves anchor-position round-trip at the anchor epoch (15.1345ms)
✔ Slice 7 browser loader fetches and ingests the asteroid catalog fixture (11.7779ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2281.1027
✔ Slice 8 fixture exists and contains the 10,008-body catalog (51.2371ms)
✔ Slice 8 boundary ingestion preserves all 10,008 asteroid records and the Slice 7 subset (2239.6729ms)
✔ Slice 8 boundary spot-checks preserve Vesta, Bennu, Apophis, and new extension bodies (117.6706ms)
✔ Slice 8 band distribution and orbit-line count match Round 3 within tolerance (111.5348ms)
✔ Slice 8 browser loader fetches and ingests the asteroid catalog fixture (115.8542ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2785.2301
✔ Slice 9 fixture exists and contains the live 41,906-body NEA catalog (281.1425ms)
✔ Slice 9 boundary ingestion preserves the full catalog and tier counts (3313.1662ms)
✔ Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies (1000.8462ms)
✔ Slice 9 quality metadata and anchor semantics stay internally consistent (1002.7462ms)
✔ Slice 9 browser loader fetches and ingests the NEA catalog fixture (1043.1407ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6902.2414
✔ load succeeds, count matches header, and Sirius sorts first (2327.3808ms)
✔ positions are unit vectors, magnitudes are sane, and colors stay in range (8.4418ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2422.4148
✔ C3Value requires a typed grid descriptor (1529.065ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1670.5963
AboutPage is not exported; semantic intro assertion skipped by contract.
✔ catalog count constant is bound to the committed catalog data (2233.9758ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2367.8212
✔ catalog renders distinct loading, failed, and empty-after-filter states (2636.0589ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2770.5051
✔ CK-13 renders the cache-derived LOW C3 screening threshold in the catalog legend (2201.8392ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2337.4407
✔ grid-compute fills TOF-fastest (index = depIdx * nTof + tofIdx) (2076.7564ms)
✔ D-01 toSegmentGrid remaps grid-compute layout to departure-fastest (0.2654ms)
✔ D-01 LOCK: breadth is measured on the DEPARTURE axis (asymmetric grid) (1.3012ms)
✔ D-02 the departure epoch threaded into segmentation is span.requested.start (0.2265ms)
✔ D-02 BLIND SPOT: column 0 cannot discriminate the two anchors (0.1516ms)
✔ D-02 SENSITIVITY: a 69.184 s anchor shift does flip dateIso across a midnight straddle (0.1363ms)
✔ D-02 computeCompareData threads the injected anchor into argmin.dateIso (0.6742ms)
✔ T1 compare result carries payload-at-C3 and the full spacecraft budget (0.3444ms)
✔ T7 compare data preserves measured grid timing and exposes missing timing as zero (0.3061ms)
✔ D-03 injected absoluteKm2S2 is used, never the module default of 25 (0.2432ms)
✔ D-03 injection changes membership, proving the value is load-bearing (0.247ms)
✔ D-04 echo carries liveMin, delta, absolute, and grid geometry from the computation (0.1651ms)
✔ D-04 relative-mode threshold equals echoed liveMin + delta (0.1284ms)
✔ DEC-17-10 out-of-bounds departure window returns a structured refusal (0.096ms)
✔ DEC-17-10 refusal is a value — a start before the first sample does not throw (0.162ms)
✔ a grid with no converged cell refuses with no-convergence (0.0772ms)
✔ DEC-17-6 cap: bodies beyond 5 are refused with cap-exceeded, first 5 computed (0.677ms)
✔ serial orchestration preserves input order and is deterministic (1.0029ms)
✔ deliveredMass is null on NO-PRACTICAL-WINDOW rather than a fabricated number (0.2444ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2191.9738
(node:65204) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ T1 compare rows render the near-zero flag only for sub-threshold minima and preserve values (2781.6216ms)
✔ T2 compare hide state preserves practical order and dominance while replacing flagged values (2378.1369ms)
✔ T3 compare size factors are derived from the imported albedo constants in both directions (2912.0943ms)
✔ W3a compare flags an Apophis window arriving after support without changing ranking data (3159.7638ms)
✔ W3b compare exposes delivered-mass anchors, NASA contract context, and the New Glenn caveat (3098.0146ms)
✔ T7 compare badge refuses timing when any grid lacks a measurement (2701.1741ms)
✔ compare defines the breadth qualifier from B_min and the sampling interval (tail2 F7) (3165.2854ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 20309.1427
✔ parse: basic list, with and without leading ? and other params (2117.5692ms)
✔ parse: missing or empty parameter yields [] (0.1589ms)
✔ parse: dedupes, first occurrence wins (0.13ms)
✔ parse: caps at 5 (0.1224ms)
✔ parse: junk is rejected, valid neighbors survive (0.1341ms)
✔ parse: URL-encoded internal spaces decode and survive (0.0878ms)
✔ serialize: joins, dedupes, caps, drops junk; empty yields empty string (0.137ms)
✔ round-trip: parse(serialize(x)) is the sanitized x (0.132ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2207.7081
✔ co-orbital disclosure attributes the rendered comparison to patched-conic methods (2332.1548ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2424.7511
PASS tsc compilation
PASS BODY_CONSTANTS has key 'sun'
PASS BODY_CONSTANTS has key 'mercury'
PASS BODY_CONSTANTS has key 'venus'
PASS BODY_CONSTANTS has key 'earth'
PASS BODY_CONSTANTS has key 'moon'
PASS BODY_CONSTANTS has key 'mars'
PASS BODY_CONSTANTS has key 'phobos'
PASS BODY_CONSTANTS has key 'deimos'
PASS BODY_CONSTANTS has key 'jupiter'
PASS BODY_CONSTANTS has key 'io'
PASS BODY_CONSTANTS has key 'europa'
PASS BODY_CONSTANTS has key 'ganymede'
PASS BODY_CONSTANTS has key 'callisto'
PASS BODY_CONSTANTS has key 'saturn'
PASS BODY_CONSTANTS has key 'titan'
PASS BODY_CONSTANTS has key 'rhea'
PASS BODY_CONSTANTS has key 'iapetus'
PASS BODY_CONSTANTS has key 'tethys'
PASS BODY_CONSTANTS has key 'dione'
PASS BODY_CONSTANTS has key 'mimas'
PASS BODY_CONSTANTS has key 'enceladus'
PASS BODY_CONSTANTS['sun'].radiusM > 0
PASS BODY_CONSTANTS['mercury'].radiusM > 0
PASS BODY_CONSTANTS['venus'].radiusM > 0
PASS BODY_CONSTANTS['earth'].radiusM > 0
PASS BODY_CONSTANTS['moon'].radiusM > 0
PASS BODY_CONSTANTS['mars'].radiusM > 0
PASS BODY_CONSTANTS['phobos'].radiusM > 0
PASS BODY_CONSTANTS['deimos'].radiusM > 0
PASS BODY_CONSTANTS['jupiter'].radiusM > 0
PASS BODY_CONSTANTS['io'].radiusM > 0
PASS BODY_CONSTANTS['europa'].radiusM > 0
PASS BODY_CONSTANTS['ganymede'].radiusM > 0
PASS BODY_CONSTANTS['callisto'].radiusM > 0
PASS BODY_CONSTANTS['saturn'].radiusM > 0
PASS BODY_CONSTANTS['titan'].radiusM > 0
PASS BODY_CONSTANTS['rhea'].radiusM > 0
PASS BODY_CONSTANTS['iapetus'].radiusM > 0
PASS BODY_CONSTANTS['tethys'].radiusM > 0
PASS BODY_CONSTANTS['dione'].radiusM > 0
PASS BODY_CONSTANTS['mimas'].radiusM > 0
PASS BODY_CONSTANTS['enceladus'].radiusM > 0
PASS BODY_CONSTANTS['sun'].naifId > 0
PASS BODY_CONSTANTS['mercury'].naifId > 0
PASS BODY_CONSTANTS['venus'].naifId > 0
PASS BODY_CONSTANTS['earth'].naifId > 0
PASS BODY_CONSTANTS['moon'].naifId > 0
PASS BODY_CONSTANTS['mars'].naifId > 0
PASS BODY_CONSTANTS['phobos'].naifId > 0
PASS BODY_CONSTANTS['deimos'].naifId > 0
PASS BODY_CONSTANTS['jupiter'].naifId > 0
PASS BODY_CONSTANTS['io'].naifId > 0
PASS BODY_CONSTANTS['europa'].naifId > 0
PASS BODY_CONSTANTS['ganymede'].naifId > 0
PASS BODY_CONSTANTS['callisto'].naifId > 0
PASS BODY_CONSTANTS['saturn'].naifId > 0
PASS BODY_CONSTANTS['titan'].naifId > 0
PASS BODY_CONSTANTS['rhea'].naifId > 0
PASS BODY_CONSTANTS['iapetus'].naifId > 0
PASS BODY_CONSTANTS['tethys'].naifId > 0
PASS BODY_CONSTANTS['dione'].naifId > 0
PASS BODY_CONSTANTS['mimas'].naifId > 0
PASS BODY_CONSTANTS['enceladus'].naifId > 0
PASS BODY_CONSTANTS['sun'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mercury'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['venus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['earth'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['moon'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mars'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['phobos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['deimos'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['jupiter'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['io'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['europa'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['ganymede'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['callisto'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['saturn'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['titan'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['rhea'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['iapetus'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['tethys'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['dione'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['mimas'].vizColor in [0x000000, 0xFFFFFF]
PASS BODY_CONSTANTS['enceladus'].vizColor in [0x000000, 0xFFFFFF]
PASS INV008_BARS_M has key 'sun'
PASS INV008_BARS_M has key 'mercury'
PASS INV008_BARS_M has key 'venus'
PASS INV008_BARS_M has key 'earth'
PASS INV008_BARS_M has key 'moon'
PASS INV008_BARS_M has key 'mars'
PASS INV008_BARS_M['sun'] > 0
PASS INV008_BARS_M['mercury'] > 0
PASS INV008_BARS_M['venus'] > 0
PASS INV008_BARS_M['earth'] > 0
PASS INV008_BARS_M['moon'] > 0
PASS INV008_BARS_M['mars'] > 0
PASS INV010_BARS_M has key 'saturn'
PASS INV010_BARS_M has key 'titan'
PASS INV010_BARS_M has key 'rhea'
PASS INV010_BARS_M has key 'iapetus'
PASS INV010_BARS_M has key 'tethys'
PASS INV010_BARS_M has key 'dione'
PASS INV010_BARS_M has key 'mimas'
PASS INV010_BARS_M has key 'enceladus'
PASS INV010_BARS_M['saturn'] > 0
PASS INV010_BARS_M['titan'] > 0
PASS INV010_BARS_M['rhea'] > 0
PASS INV010_BARS_M['iapetus'] > 0
PASS INV010_BARS_M['tethys'] > 0
PASS INV010_BARS_M['dione'] > 0
PASS INV010_BARS_M['mimas'] > 0
PASS INV010_BARS_M['enceladus'] > 0
PASS INV011_BARS_M has key 'phobos'
PASS INV011_BARS_M has key 'deimos'
PASS INV011_BARS_M['phobos'] > 0
PASS INV011_BARS_M['deimos'] > 0
PASS INTERPOLATION_ERROR_BARS_M has key 'sun'
PASS BODY_CADENCE_SECONDS has key 'sun'
PASS BODY_INTERPOLATION_INVARIANTS has key 'sun'
PASS INTERPOLATION_ERROR_BARS_M has key 'mercury'
PASS BODY_CADENCE_SECONDS has key 'mercury'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mercury'
PASS INTERPOLATION_ERROR_BARS_M has key 'venus'
PASS BODY_CADENCE_SECONDS has key 'venus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'venus'
PASS INTERPOLATION_ERROR_BARS_M has key 'earth'
PASS BODY_CADENCE_SECONDS has key 'earth'
PASS BODY_INTERPOLATION_INVARIANTS has key 'earth'
PASS INTERPOLATION_ERROR_BARS_M has key 'moon'
PASS BODY_CADENCE_SECONDS has key 'moon'
PASS BODY_INTERPOLATION_INVARIANTS has key 'moon'
PASS INTERPOLATION_ERROR_BARS_M has key 'mars'
PASS BODY_CADENCE_SECONDS has key 'mars'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mars'
PASS INTERPOLATION_ERROR_BARS_M has key 'phobos'
PASS BODY_CADENCE_SECONDS has key 'phobos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'phobos'
PASS INTERPOLATION_ERROR_BARS_M has key 'deimos'
PASS BODY_CADENCE_SECONDS has key 'deimos'
PASS BODY_INTERPOLATION_INVARIANTS has key 'deimos'
PASS INTERPOLATION_ERROR_BARS_M has key 'jupiter'
PASS BODY_CADENCE_SECONDS has key 'jupiter'
PASS BODY_INTERPOLATION_INVARIANTS has key 'jupiter'
PASS INTERPOLATION_ERROR_BARS_M has key 'io'
PASS BODY_CADENCE_SECONDS has key 'io'
PASS BODY_INTERPOLATION_INVARIANTS has key 'io'
PASS INTERPOLATION_ERROR_BARS_M has key 'europa'
PASS BODY_CADENCE_SECONDS has key 'europa'
PASS BODY_INTERPOLATION_INVARIANTS has key 'europa'
PASS INTERPOLATION_ERROR_BARS_M has key 'ganymede'
PASS BODY_CADENCE_SECONDS has key 'ganymede'
PASS BODY_INTERPOLATION_INVARIANTS has key 'ganymede'
PASS INTERPOLATION_ERROR_BARS_M has key 'callisto'
PASS BODY_CADENCE_SECONDS has key 'callisto'
PASS BODY_INTERPOLATION_INVARIANTS has key 'callisto'
PASS INTERPOLATION_ERROR_BARS_M has key 'saturn'
PASS BODY_CADENCE_SECONDS has key 'saturn'
PASS BODY_INTERPOLATION_INVARIANTS has key 'saturn'
PASS INTERPOLATION_ERROR_BARS_M has key 'titan'
PASS BODY_CADENCE_SECONDS has key 'titan'
PASS BODY_INTERPOLATION_INVARIANTS has key 'titan'
PASS INTERPOLATION_ERROR_BARS_M has key 'rhea'
PASS BODY_CADENCE_SECONDS has key 'rhea'
PASS BODY_INTERPOLATION_INVARIANTS has key 'rhea'
PASS INTERPOLATION_ERROR_BARS_M has key 'iapetus'
PASS BODY_CADENCE_SECONDS has key 'iapetus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'iapetus'
PASS INTERPOLATION_ERROR_BARS_M has key 'tethys'
PASS BODY_CADENCE_SECONDS has key 'tethys'
PASS BODY_INTERPOLATION_INVARIANTS has key 'tethys'
PASS INTERPOLATION_ERROR_BARS_M has key 'dione'
PASS BODY_CADENCE_SECONDS has key 'dione'
PASS BODY_INTERPOLATION_INVARIANTS has key 'dione'
PASS INTERPOLATION_ERROR_BARS_M has key 'mimas'
PASS BODY_CADENCE_SECONDS has key 'mimas'
PASS BODY_INTERPOLATION_INVARIANTS has key 'mimas'
PASS INTERPOLATION_ERROR_BARS_M has key 'enceladus'
PASS BODY_CADENCE_SECONDS has key 'enceladus'
PASS BODY_INTERPOLATION_INVARIANTS has key 'enceladus'
PASS body-class tagging covers fixed bodies and asteroid ids
PASS BODY_CONSTANTS['jupiter'].naifId matches README
PASS BODY_CONSTANTS['jupiter'].radiusM matches README
PASS BODY_CONSTANTS['jupiter'].vizColor matches README
PASS BODY_CADENCE_SECONDS['jupiter'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['jupiter'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['jupiter'] matches Slice 3 invariant
PASS BODY_CONSTANTS['jupiter'].radiiM matches README triaxial values
PASS BODY_CONSTANTS['io'].naifId matches README
PASS BODY_CONSTANTS['io'].radiusM matches README
PASS BODY_CONSTANTS['io'].vizColor matches README
PASS BODY_CADENCE_SECONDS['io'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['io'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['io'] matches Slice 3 invariant
PASS BODY_CONSTANTS['europa'].naifId matches README
PASS BODY_CONSTANTS['europa'].radiusM matches README
PASS BODY_CONSTANTS['europa'].vizColor matches README
PASS BODY_CADENCE_SECONDS['europa'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['europa'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['europa'] matches Slice 3 invariant
PASS BODY_CONSTANTS['ganymede'].naifId matches README
PASS BODY_CONSTANTS['ganymede'].radiusM matches README
PASS BODY_CONSTANTS['ganymede'].vizColor matches README
PASS BODY_CADENCE_SECONDS['ganymede'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['ganymede'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['ganymede'] matches Slice 3 invariant
PASS BODY_CONSTANTS['callisto'].naifId matches README
PASS BODY_CONSTANTS['callisto'].radiusM matches README
PASS BODY_CONSTANTS['callisto'].vizColor matches README
PASS BODY_CADENCE_SECONDS['callisto'] matches Slice 3 cadence
PASS INTERPOLATION_ERROR_BARS_M['callisto'] matches Slice 3 bar
PASS BODY_INTERPOLATION_INVARIANTS['callisto'] matches Slice 3 invariant
PASS BODY_CONSTANTS['mars'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['mars'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['mars'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['mars'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['mars'] matches Slice 6 invariant
PASS BODY_CONSTANTS['mars'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['phobos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['phobos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['phobos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['phobos'] matches Slice 6 invariant
PASS INV011_BARS_M['phobos'] matches Slice 6 bar
PASS BODY_CONSTANTS['phobos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['deimos'].naifId matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].radiusM matches Slice 6 docs
PASS BODY_CONSTANTS['deimos'].vizColor matches Slice 6 docs
PASS BODY_CADENCE_SECONDS['deimos'] matches Slice 6 cadence
PASS INTERPOLATION_ERROR_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_INTERPOLATION_INVARIANTS['deimos'] matches Slice 6 invariant
PASS INV011_BARS_M['deimos'] matches Slice 6 bar
PASS BODY_CONSTANTS['deimos'].radiiM matches Slice 6 triaxial values
PASS BODY_CONSTANTS['saturn'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['saturn'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['saturn'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['saturn'] matches Slice 4 invariant
PASS INV010_BARS_M['saturn'] matches Slice 4 bar
PASS BODY_CONSTANTS['saturn'].radiiM matches Slice 4 triaxial values
PASS BODY_CONSTANTS['titan'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['titan'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['titan'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['titan'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['titan'] matches Slice 4 invariant
PASS INV010_BARS_M['titan'] matches Slice 4 bar
PASS BODY_CONSTANTS['rhea'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['rhea'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['rhea'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['rhea'] matches Slice 4 invariant
PASS INV010_BARS_M['rhea'] matches Slice 4 bar
PASS BODY_CONSTANTS['iapetus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['iapetus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['iapetus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['iapetus'] matches Slice 4 invariant
PASS INV010_BARS_M['iapetus'] matches Slice 4 bar
PASS BODY_CONSTANTS['tethys'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['tethys'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['tethys'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['tethys'] matches Slice 4 invariant
PASS INV010_BARS_M['tethys'] matches Slice 4 bar
PASS BODY_CONSTANTS['dione'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['dione'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['dione'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['dione'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['dione'] matches Slice 4 invariant
PASS INV010_BARS_M['dione'] matches Slice 4 bar
PASS BODY_CONSTANTS['mimas'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['mimas'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['mimas'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['mimas'] matches Slice 4 invariant
PASS INV010_BARS_M['mimas'] matches Slice 4 bar
PASS BODY_CONSTANTS['enceladus'].naifId matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].radiusM matches Slice 4 docs
PASS BODY_CONSTANTS['enceladus'].vizColor matches Slice 4 docs
PASS BODY_CADENCE_SECONDS['enceladus'] matches Slice 4 cadence
PASS INTERPOLATION_ERROR_BARS_M['enceladus'] matches Slice 4 bar
PASS BODY_INTERPOLATION_INVARIANTS['enceladus'] matches Slice 4 invariant
PASS INV010_BARS_M['enceladus'] matches Slice 4 bar
PASS SATURN_D_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_C_RING_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_A_RING_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_INNER_RADIUS_M matches Slice 4 docs
PASS SATURN_CASSINI_DIVISION_OUTER_RADIUS_M matches Slice 4 docs
PASS SATURN_HUYGENS_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ENCKE_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_KEELER_GAP_OUTER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_INNER_RADIUS_M matches Slice 5 docs
PASS SATURN_ROCHE_DIVISION_OUTER_RADIUS_M matches Slice 5 docs
PASS createAsteroidCatalogIndex ingests all 1008 asteroid records
PASS createAsteroidCatalogIndex identifies the 8 curated NEAs
PASS eccentricityBandForBody(0.0999) returns A
PASS eccentricityBandForBody(0.1) returns B
PASS eccentricityBandForBody(0.1999) returns B
PASS eccentricityBandForBody(0.2) returns C
PASS eccentricityBandForBody(0.2999) returns C
PASS eccentricityBandForBody(0.3) returns D
PASS hasOrbitLineForBody(10.97) returns true
PASS hasOrbitLineForBody(10.98) returns false
PASS hasOrbitLineForBody(10.99) returns false
PASS curated NEA designation 101955 remains flagged
PASS curated NEA designation 99942 remains flagged
PASS curated NEA designation 433 remains flagged
PASS curated NEA designation 25143 remains flagged
PASS curated NEA designation 162173 remains flagged
PASS curated NEA designation 4179 remains flagged
PASS curated NEA designation 1620 remains flagged
PASS curated NEA designation 4769 remains flagged
PASS asteroid lookup works by designation and SPK id for Bennu
PASS estimatedRadiusM matches the H-derived default-albedo formula for Bennu
PASS Slice 7 asteroid fixture entries can be extended with Slice 8 band and orbit-line metadata

All assertions passed.
✔ tests\v2-core-constants.test.mjs (2179.801ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2184.9804
slice3MaxRoundTripError=0
slice3MaxChainTenError=0
✔ Slice 3 boundary ingestion tags Galileans as FRAME_JUPITER_J2000_ICRF (2479.5959ms)
✔ Slice 3 HELIO ↔ JUPITER round-trip stays within one-pass and ten-chain bounds (22.2534ms)
✔ Slice 1 HELIO ↔ GCRS round-trip still works unchanged (3.2795ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2648.3943
slice6MarsMaxRoundTripError=0
slice6MarsMaxChainTenError=0
slice6MarsMoonMaxHelioRoundTripError=0
slice6MarsMoonMaxChainTenError=0
slice6MarsMoonMaxNativeRoundTripRelativeError=1.6947555828275902e-12
✔ Slice 6 HELIO ↔ MARS direct round-trip on Mars heliocentric states stays within bounds (1996.9148ms)
✔ Slice 6 HELIO ↔ MARS round-trip on interpolated Mars-centered moon states stays within bounds (39.9101ms)
✔ Slice 6 frame additions preserve GCRS, Jupiter, and Saturn paths (98.5195ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2236.536
slice4SaturnMaxRoundTripError=0
slice4SaturnMaxChainTenError=0
slice4MoonMaxHelioRoundTripError=0
slice4MoonMaxChainTenError=0
slice4MoonMaxNativeRoundTripRelativeError=6.335544898437588e-13
✔ Slice 4 HELIO ↔ SATURN direct round-trip on Saturn heliocentric states stays within bounds (2450.4187ms)
✔ Slice 4 HELIO ↔ SATURN round-trip on interpolated Saturn-centered moon states stays within bounds (44.3569ms)
✔ Slice 4 frame additions preserve Jupiter and GCRS paths (26.6794ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2638.1242
slice3Hermite jupiter maxErrorKm=7.142806491701069 rmsErrorKm=4.199738159183813 barKm=50 checked=4319
slice3Hermite io maxErrorKm=0.5442963290723388 rmsErrorKm=0.33658103781622706 barKm=5 checked=8639
slice3Hermite europa maxErrorKm=4.50430937666286 rmsErrorKm=2.6736541902238957 barKm=20 checked=4319
slice3Hermite ganymede maxErrorKm=6.610468763880747 rmsErrorKm=4.127952978794724 barKm=20 checked=4319
slice3Hermite callisto maxErrorKm=7.016665103601909 rmsErrorKm=3.928974726508747 barKm=50 checked=4319
✔ Slice 3 Jupiter-system Hermite interpolation stays below INV-009 bars (2378.4633ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2484.1662
slice6Hermite mars maxErrorKm=0.008932563975280729 rmsErrorKm=0.005288750696475446 barKm=0.05 checked=270
slice6Hermite phobos maxErrorKm=0.7787715830854933 rmsErrorKm=0.48601715486892844 barKm=5 checked=21600
slice6Hermite deimos maxErrorKm=0.11319505860637424 rmsErrorKm=0.08328683543873051 barKm=0.5 checked=6480
✔ Slice 6 Mars-system Hermite interpolation stays below INV-008/INV-011 bars with pre-research-matching error (3107.0359ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3269.4316
slice4Hermite saturn maxErrorKm=0.2023990147891148 rmsErrorKm=0.06964598071541636 barKm=1 checked=4319
slice4Hermite titan maxErrorKm=6.034245679338891 rmsErrorKm=3.150894748674291 barKm=20 checked=4319
slice4Hermite rhea maxErrorKm=1.2646108832459069 rmsErrorKm=0.7992468821770016 barKm=5 checked=4319
slice4Hermite iapetus maxErrorKm=0.6187833209615409 rmsErrorKm=0.25170364508742626 barKm=2 checked=4319
slice4Hermite tethys maxErrorKm=0.2843355703425951 rmsErrorKm=0.1812933392207793 barKm=1 checked=8639
slice4Hermite dione maxErrorKm=6.777691855843222 rmsErrorKm=4.24466979005391 barKm=50 checked=4319
slice4Hermite mimas maxErrorKm=3.3593358528420176 rmsErrorKm=1.8574590119921746 barKm=20 checked=8639
slice4Hermite enceladus maxErrorKm=0.8570913723667154 rmsErrorKm=0.5277623322167538 barKm=5 checked=8639
✔ Slice 4 Saturn-system Hermite interpolation stays below INV-010 bars (2905.0977ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3002.294
PASS tsc compilation
PASS interpolate at t0 returns s0 position (rel err < 1e-9)
PASS interpolate at t1 returns s1 position (rel err < 1e-9)
PASS interpolate at midpoint returns finite position
PASS assertInterpolationError throws AssertError for Earth error 1000 m (> 500 m bar)
PASS Earth interpolation overflow routes to INV-008
PASS assertInterpolationError does not throw for Earth error 100 m (< 500 m bar)
PASS assertInterpolationError throws AssertError for Tethys error 1100 m (> 1 km bar)
PASS Tethys interpolation overflow routes to INV-010
PASS Tethys overflow includes bodyId detail
PASS Tethys overflow includes measuredErrorKm detail
PASS Tethys overflow includes barKm detail
PASS Tethys overflow includes cadence from constants
PASS assertInterpolationError does not throw in report mode for Enceladus overflow
PASS assertInterpolationError emits one report-mode violation for Enceladus overflow
PASS Report-mode Enceladus overflow routes to INV-010
PASS Report-mode Enceladus overflow includes bodyId detail
PASS Report-mode Enceladus overflow includes measuredErrorKm detail
PASS Report-mode Enceladus overflow includes barKm detail
PASS Report-mode Enceladus overflow includes tdbSeconds detail
PASS Report-mode Enceladus overflow includes cadence from constants
PASS assertInterpolationError throws AssertError for Phobos error 5100 m (> 5 km bar)
PASS Phobos interpolation overflow routes to INV-011
PASS Phobos overflow includes bodyId detail
PASS Phobos overflow includes measuredErrorKm detail
PASS Phobos overflow includes barKm detail
PASS Phobos overflow includes 30-minute cadence detail
PASS assertInterpolationError does not throw in report mode for Deimos overflow
PASS assertInterpolationError emits one report-mode violation for Deimos overflow
PASS Report-mode Deimos overflow routes to INV-011
PASS Report-mode Deimos overflow includes bodyId detail
PASS Report-mode Deimos overflow includes measuredErrorKm detail
PASS Report-mode Deimos overflow includes barKm detail
PASS Report-mode Deimos overflow includes tdbSeconds detail
PASS Report-mode Deimos overflow includes 1-hour cadence detail

All assertions passed.
✔ tests\v2-core-hermite.test.mjs (2299.4297ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2305.2587
✔ propagateKeplerianStateVectors reproduces the fixture anchor state within one meter (2136.0775ms)
✔ forward 30d epoch shift then backward propagation returns to the initial state within one meter (4.1282ms)
✔ angular momentum and specific orbital energy remain conserved over 90 days (4.1534ms)
✔ high-e solver converges within the iteration cap (0.3356ms)
✔ production Keplerian port matches the round-2 Vesta day-90 research residual (6.4774ms)
✔ assertKeplerianError routes asteroid overflows to INV-012 (0.8601ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2272.7373
✔ Vesta orbit samples close cleanly at 64 segments (2401.6573ms)
✔ Apophis high-e orbit uses expected radius law across the sampled ellipse (5.0046ms)
✔ sampled orbit points satisfy the conic radius equation for Vesta (3.9701ms)
✔ sampled orbit vectors preserve the independently derived canonical orientation (4.346ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2531.2412
✔ catalog and porkchop span labels derive full dates from their own parameters (5065.9071ms)
✔ catalog footer quotes the cache end and the porkchop grid end from their own constants (1993.7499ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7171.1406
✔ C3 formatting is owned by C3Value outside the pure formatter (45.8905ms)
✔ badge construction is owned by shared design components (43.5176ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 201.1457
✔ shared honesty components preserve the characterization fixture (1979.6748ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2105.857
✔ design tokens are deterministic and provenance-pinned (18.5485ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 132.82
✔ DLA feasibility labels import the production view vocabulary (2621.9098ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2703.504
(node:12272) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ DLA disclosure, site picker, and band legend render with contours off and on (16667.0094ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16907.1276
✔ tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning (2325.6444ms)
✔ tracking inside coverage mounts LIVE without a warning (2201.6511ms)
✔ outside coverage the HUD date line is marked clamped and Shift+N help tells the truth (2092.5828ms)
✔ coverage line gains a refresh-due notice in the last 14 days of coverage only (2172.3999ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9015.9056
✔ F2 characterization fixture records the HEAD honesty text across all three surfaces (0.7883ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 148.9692
✔ FK3 AMBER tour explains zero added Delta-V while RED still names dogleg (2277.516ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2446.4061
✔ payloadAtC3 New Glenn/Standard C3=0 === 7180 kg (0.7397ms)
✔ payloadAtC3 New Glenn/Standard C3=5 === 6055 kg (0.0895ms)
✔ payloadAtC3 New Glenn/Standard C3=20 === 2365 kg (0.7043ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=0 === 15010 kg (0.0799ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=5 === 13677.5 kg (0.0686ms)
✔ payloadAtC3 Falcon Heavy/Expendable C3=20 === 10115 kg (0.053ms)
✔ payloadAtC3 Vulcan/VC6 C3=0 === 10850 kg (0.0507ms)
✔ payloadAtC3 Vulcan/VC6 C3=5 === 9990 kg (0.0717ms)
✔ payloadAtC3 Vulcan/VC6 C3=20 === 7630 kg (0.0676ms)
✔ deliveredMassKg New Glenn/Standard C3=5 one-way === 3494.511538898568 kg (0.2687ms)
✔ every launch-vehicle anchor carries a source-derived basis (0.0955ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 181.4467
✔ tests\v2-lambert\dla.test.mjs (2325.7045ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2338.321
✔ tests\v2-lambert\feasibility.test.mjs (2702.2257ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2707.7811
householder.test: PASS
✔ tests\v2-lambert\householder.test.mjs (2410.1515ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2421.5614
hyp2f1b.test: PASS
✔ tests\v2-lambert\hyp2f1b.test.mjs (2515.3062ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2523.1423
initial-guess.test: PASS
✔ tests\v2-lambert\initial-guess.test.mjs (2280.6987ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2290.2573
lambert-endtoend.test: PASS
✔ tests\v2-lambert\lambert-endtoend.test.mjs (2570.6057ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2578.3226
lambert-multi-rev-rejection.test: PASS
✔ tests\v2-lambert\lambert-multi-rev-rejection.test.mjs (2470.3985ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2483.39
lambertMultiRev: no solution for M=1; T=0.5790023712295225 < T_min=4.403057492003494
lambertMultiRev: no solution for M=2; T=6.224170889575949 < T_min=7.768035471712736
lambertMultiRev: no solution for M=1; T=1.8936975346281286 < T_min=4.565433395618
lambertMultiRev: no solution for M=1; T=3.142611278377002 < T_min=4.589850624734614
lambertMultiRev: no solution for M=1; T=4.401579074102609 < T_min=4.711344422248995
lambertMultiRev: no solution for M=1; T=4.603344913728462 < T_min=4.73916181439084
lambertMultiRev: no solution for M=1; T=4.708577625250112 < T_min=4.754505056873685
lambertMultiRev: no solution for M=1; T=4.762318080262853 < T_min=4.762559475692091
lambertMultiRev: no solution for M=1; T=4.76252949463941 < T_min=4.762591453257581
lambertMultiRev: no solution for M=1; T=4.762582350055022 < T_min=4.762599448281306
lambertMultiRev: no solution for M=1; T=4.762595564022766 < T_min=4.7626014470767615
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambertMultiRev: no solution for M=1; T=4.762602171023708 < T_min=4.762602446480416
lambert-multi-rev.test: PASS
✔ tests\v2-lambert\lambert-multi-rev.test.mjs (3207.5328ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3218.8769
stumpff.test: PASS
✔ tests\v2-lambert\stumpff.test.mjs (2209.0976ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2215.4924
tof.test: PASS
✔ tests\v2-lambert\tof.test.mjs (2381.5124ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2386.9526
utc-to-tdb.test: PASS
✔ tests\v2-lambert\utc-to-tdb.test.mjs (2341.7114ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2351.1361
vec3.test: PASS
✔ tests\v2-lambert\vec3.test.mjs (2486.012ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2495.5395
✔ K4 light time uses Earth distance, two significant figures, and inherited tier caveats (2228.891ms)
✔ K4 refuses every ruled invalid state without displaying a number (2529.0533ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4883.2066
✔ tests\v2-near-zero-c3.test.mjs (2496.3296ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2503.5934
✔ T3 Porkchop extremes and pinned readout flag, hide, and restore the same C3 source value (4443.3809ms)
✔ K7 pin callback publishes the newly pinned cell while replacement computation is pending (3885.1173ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8476.1978
(node:44588) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog disclosure renders plain-English public copy (2917.0538ms)
✔ About audit exhibits render plain-English titles and evidence labels (2721.3144ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5800.2597
✔ public disclosure sections render without internal taxonomy identifiers or duplicated trust numbers (2358.0567ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2469.7479
✔ construction distributes the Slice 8 catalog across the measured 1 AU cells (2542.9171ms)
✔ off-axis outer-system view culls some occupied cells (143.7624ms)
✔ focused close-zoom keeps visible cells in a small local neighborhood (121.9283ms)
✔ cells near the frustum edge stay visible across a +/-0.5 degree camera sweep (1.5303ms)
✔ raycastIntersectCells returns null for misses, hits the expected body, and reassigns across cells after position changes (2.4304ms)
✔ rendered instanced position matches the propagated world position used for focus truth (125.8265ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3122.3391
✔ orbit-batch geometry uses the expected concatenated vertex count (2694.2784ms)
✔ orbit-batch material matches the DEC-11 MVP line settings (23.6557ms)
✔ orbit-batch vertices for Vesta match the sampled ellipse positions (21.6488ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2818.7031
✔ asteroid points shader material constructs with additive soft-glow settings (2466.7957ms)
✔ ALIASED_POINT_SIZE_RANGE query falls back cleanly when no GL context exists (1.4344ms)
✔ per-point color attribute distinguishes curated NEAs from main-belt asteroids (10.2507ms)
✔ overview Vesta-sized points land in the tuned 4-8 px visibility band (4.3553ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2603.3752
✔ sub-pixel asteroid renders in Points mode (2821.1472ms)
✔ mid-zoom asteroid renders in InstancedMesh mode (2.799ms)
✔ focused asteroid renders in individual Mesh mode when resolved (2.5749ms)
✔ hysteresis keeps a near-threshold asteroid stable around 1.7 px (0.2637ms)
✔ Points, InstancedMesh, and focused Mesh agree on world position (3.6118ms)
✔ focused asteroid gets a highlighted orbit while the main orbit batch stays visible in browse-scale focus (1.6987ms)
✔ main orbit batch fades out when the focused asteroid reaches close-inspection mesh mode (0.5421ms)
✔ main orbit batch excludes asteroids below the hasOrbitLine threshold while focused orbit highlight still works (0.664ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2969.5132
✔ halo opacity stays at full base opacity below the full-visibility threshold (2221.2253ms)
✔ halo opacity fades linearly through the hysteresis transition zone (0.1501ms)
✔ halo opacity reaches zero at and above the invisible threshold (0.0833ms)
✔ Saturn moon halo floors vary by moon size with Titan at least 3x Mimas (0.1191ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2330.698
✔ Jupiter oblate mesh extents match documented radii (2309.8579ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2385.8356
✔ Mars oblate mesh extents match documented radii (2432.0253ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2524.8656
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-render-mars-system/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:13316) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phobos rendered world position equals its heliocentric focus anchor (5261.6701ms)
✔ Deimos rendered world position equals its heliocentric focus anchor (106.5508ms)
✔ Mars body mesh receives the documented render-only tilt (77.7086ms)
✔ Mars moons do not inherit the render-only tilt (59.7547ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5649.4268
✔ Saturn oblate mesh extents match documented radii (2249.7966ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2365.6737
✔ Saturn ring local plane stays on XZ with +Y normals (2125.2931ms)
✔ Saturn main ring and Cassini geometry radii match spec (11.3707ms)
✔ Saturn ring opacity sampling preserves D/C/B/A ordering (0.4998ms)
✔ Saturn Cassini opacity peaks at the division center (0.1617ms)
✔ Saturn ring texture preserves multiple radial alpha levels (3.7295ms)
✔ Saturn ring substructure adds seven named sibling meshes under saturn-rings (5.2491ms)
✔ Saturn ring substructure radii match Slice 5 constants (4.9887ms)
✔ Saturn ring substructure renderOrder keeps gaps below ringlets and preserves Slice 4 meshes (3.8832ms)
✔ Saturn ring substructure preserves child ordering in inner-radius sequence (3.1587ms)
✔ Saturn Roche Division uses a fading texture rather than a flat-opacity band (4.357ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2285.7564
✔ Vesta and Bennu anchor positions land in the measured 1 AU cells (2174.3297ms)
✔ cellBoundsKmForIndex returns a 1 AU box anchored to the configured grid (0.4149ms)
✔ positions outside the ±28 AU cube return null (0.1311ms)
✔ cellIndexForPositionKm round-trips into a containing cell bounds box (55.3288ms)
✔ iterateAllPossibleCells covers the full 56x56x56 grid (27.1313ms)
✔ Slice 8 fixture occupies the measured ~178 cells at 1 AU resolution (44.3536ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2407.8132
✔ catalog binary loads without error and advertises the expected header (28.5793ms)
✔ star count is in the expected runtime range (23.0604ms)
✔ Sirius is the brightest record and lands at the expected direction (12.4071ms)
✔ Polaris is present near the north celestial pole direction (10.8814ms)
✔ color values stay within [0, 1] for all records (24.1273ms)
✔ INV-014: at least 99% of star directions are unit-length within float32 tolerance (17.7494ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 264.4145
✔ constructor builds THREE.Points geometry with expected star attributes (2420.4607ms)
✔ INV-014 spot-check: Polaris direction in geometry matches the parsed catalog (2.6222ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2589.3394
✔ canonical bodyId and bare designation resolve to the same catalog body (2865.8607ms)
✔ unknown identifiers resolve to undefined — never a fallback body (168.8209ms)
✔ designations are unique across the whole catalog, so the fallback is unambiguous (77.2872ms)
✔ sampled equivalence across the catalog: designation lookup lands on the body with that id (2912.2383ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6264.0247
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-camera-presets/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:26452) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ pressing t resolves to the top-down preset with the expected final orbit state (4170.1131ms)
✔ camera tween locks controls during animation and releases them on completion (0.5538ms)
✔ existing regression shortcuts remain intact; Titan focus is on k, and t stays with the top-down preset (4.4392ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4379.3149
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-date-hud/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-date-hud.test.mjs:51:34) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:66504) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ date HUD label formats TDB seconds into a readable date string (4053.7468ms)
✔ date HUD text updates from the current simulated TDB time (0.3614ms)
✔ runtime creates and removes the date HUD element symmetrically (1.658ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4199.0752
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-display-integrity/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-display-integrity.test.mjs:50:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:34752) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ sun light fallback preserves true mesh anchor while keeping a stable fallback direction (3590.6137ms)
✔ viewport sizing falls back cleanly when mount rect is empty (1.1206ms)
✔ keyboard shortcut guard ignores editable targets and accepts canvas-like targets (1.7098ms)
✔ solar runtime source wires display integrity guards into the live interaction path (7.1451ms)
✔ inner and earth-moon runtimes mirror the corrected display patterns (5.4699ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3737.0709
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-focus/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-focus.test.mjs:51:39) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:54304) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ focus from overview snaps to the target default radius (3988.3249ms)
✔ cross-body focus snaps to the new target default radius (0.8293ms)
✔ re-focusing the same body preserves the current zoom radius (0.7779ms)
✔ asteroid focus uses the documented non-edge-on polar default (0.3321ms)
✔ asteroid focus radius uses the honest-scale default radius rule (0.5723ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4149.0349
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-runtime-hover-tooltips/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async TestContext.<anonymous> (file:///C:/Users/hudso/aster-a-cache/tests/v2-runtime-hover-tooltips.test.mjs:52:40) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
(node:19552) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ hover tooltip helper shows Earth text and hides on empty state (3437.8278ms)
✔ world-position projection maps screen center correctly (7.6489ms)
✔ hoverable bodies stay limited to the planet set through Saturn (2.5348ms)
✔ runtime wires the hover tooltip element, planet-only raycast path, and cleanup (5.6261ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3646.9857
✔ screen cache schema v2 provenance hashes match inputs and shipped cache bytes (155.7902ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 267.054
✔ empty grid: no components, NO-PRACTICAL-WINDOW, relative threshold is Infinity (2208.4103ms)
✔ all cells below T: one component spanning the whole grid (1.6501ms)
✔ a non-converged hole splits a would-be single component (0.2945ms)
✔ tie exactly at T is included (c3 <= T, DEC-17-1) (0.1742ms)
✔ single-cell component exists in components but not in practical (B_min=2) (0.1363ms)
✔ grid of only singletons: NO-PRACTICAL-WINDOW (synthetic 163693 shape) (0.1694ms)
✔ diagonal-only adjacency joins under conn8 (0.1191ms)
✔ null-c3 cell is a hole even when flagged converged (0.1157ms)
✔ liveGridMin excludes non-converged and non-finite cells from the relative threshold (0.1654ms)
✔ all-Infinity converged grid under relative mode has no members (not a garbage component) (0.19ms)
✔ argmin and derived outputs from a real segmentation run (0.1817ms)
✔ classifyComponents finds the true minimum on unsorted input (DEC-17-3) (0.0994ms)
✔ threshold resolution: relative = liveMin + delta; absolute ignores liveMin (0.2094ms)
✔ conn4 is not implemented and throws; malformed grid shape throws (0.2748ms)
✔ property: random grids — component minima bound, practical subset, sort, cell conservation (1.3098ms)
✔ artifact 433 @min+5 conn8: threshold, derivation rules, B_min classification (0.1276ms)
✔ artifact 163693 @min+5 conn8: NO-PRACTICAL-WINDOW (0.0634ms)
✔ artifact 99942 @min+2 conn8: 4 practical of 12, best = global min component (0.0762ms)
✔ artifact derivation rules: breadthCells/breadthDays/tofSpanDays are cell multiples (0.1014ms)
✔ artifact cross-check: pasted constants match the committed artifact, read at runtime (2.4488ms)
✔ artifact sort order restores under the module comparator (0.631ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2329.3354
(node:57544) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ the shortcut overlay names middle-drag pan and compare renders its M=0 method (3166.5865ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3301.5487
✔ Slice 1 pure-Node cutover harness clears the numeric bar at fixture truth timesteps (2111.2983ms)
ℹ validatedSampleCount=121
ℹ maxEarthErrorKm=0
ℹ maxMoonErrorKm=0
ℹ maxRoundTripError=7.6457577540892395e-25
ℹ maxChainTenError=7.6457577540892395e-25
ℹ INV-005 not exercised: Slice 1 validates fixture truth timesteps without a propagator by contract
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2223.7539
✔ Slice 1 Horizons fixture exists with Earth and Moon 30-day samples (1.9635ms)
✔ Slice 1 boundary ingress produces canonical heliocentric Earth/Moon states (2470.5989ms)
✔ Slice 1 core frame transform round-trip holds against the Earth anchor fixture (5.8914ms)
✔ Slice 1 render path subtracts in f64 and only downcasts camera-relative values (4.7877ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2601.6208
Compiling v2 core and boundary...
PASS tsc compilation

PASS INV-008 sun     max_err=3.541e-6 km  bar=0.00002 km  (270 pts checked)
PASS INV-008 mercury max_err=2.005e+1 km  bar=100 km  (270 pts checked)
PASS INV-008 venus   max_err=1.819e-1 km  bar=1 km  (270 pts checked)
PASS INV-008 earth   max_err=9.069e-2 km  bar=0.5 km  (270 pts checked)
PASS INV-008 moon    max_err=4.977e+0 km  bar=20 km  (270 pts checked)
PASS INV-008 mars    max_err=8.933e-3 km  bar=0.05 km  (270 pts checked)

All six INV-008 cutover bars cleared. Phase C is UNBLOCKED.
✔ tests\v2-slice2-cutover.test.mjs (2156.5906ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2163.0688
Compiling v2 core and boundary for Slice 3 cutover...
PASS tsc compilation

PASS INV-009 jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
PASS INV-009 io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
PASS INV-009 europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
PASS INV-009 ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
PASS INV-009 callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 per-body interpolation summary:
  jupiter    max=7.142806 km  bar=50.000 km  rms=4.198766 km  checked=4321
  io         max=0.544296 km  bar=5.000 km  rms=0.336542 km  checked=8641
  europa     max=4.504309 km  bar=20.000 km  rms=2.673035 km  checked=4321
  ganymede   max=6.610469 km  bar=20.000 km  rms=4.126998 km  checked=4321
  callisto   max=7.016665 km  bar=50.000 km  rms=3.928065 km  checked=4321

Slice 3 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 3 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice3-cutover.test.mjs (5009.7037ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5015.3074
Compiling v2 core and boundary for Slice 4 cutover...
PASS tsc compilation

PASS INV-010 saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
PASS INV-010 titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
PASS INV-010 rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
PASS INV-010 iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
PASS INV-010 tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
PASS INV-010 dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
PASS INV-010 mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
PASS INV-010 enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 per-body interpolation summary:
  saturn     max=0.202399 km  bar=1.000 km  rms=0.069630 km  checked=4321
  titan      max=6.034246 km  bar=20.000 km  rms=3.150165 km  checked=4321
  rhea       max=1.264611 km  bar=5.000 km  rms=0.799062 km  checked=4321
  iapetus    max=0.618783 km  bar=2.000 km  rms=0.251645 km  checked=4321
  tethys     max=0.284336 km  bar=1.000 km  rms=0.181272 km  checked=8641
  dione      max=6.777692 km  bar=50.000 km  rms=4.243687 km  checked=4321
  mimas      max=3.359336 km  bar=20.000 km  rms=1.857244 km  checked=8641
  enceladus  max=0.857091 km  bar=5.000 km  rms=0.527701 km  checked=8641

Slice 4 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 4 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice4-cutover.test.mjs (6309.3874ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6319.7826
Compiling Saturn runtime and ring helpers for Slice 5 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice5-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
PASS Slice 5 ring substructure meshes exist under saturn-rings
PASS renderOrder discipline preserved: baseline default, overlays explicit
PASS A ring outer radius matches exact 136,770 km PDS value
PASS Saturn default focus orbit stays non-edge-on (polar=1.047198 rad, view-normal angle=63.469 deg)
PASS Slice 4 Saturn moon cutover criteria remain green under Slice 5 regression gate
(node:57524) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice5-cutover.test.mjs (4052.1817ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4062.7095
Compiling v2 core and boundary for Slice 6 cutover...
PASS tsc compilation

PASS INV-008 mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
PASS INV-011 phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
PASS INV-011 deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 per-body interpolation summary:
  mars       max=0.008933 km  bar=0.050 km  rms=0.005289 km  checked=270
  phobos     max=0.778772 km  bar=5.000 km  rms=0.486017 km  checked=21600
  deimos     max=0.113195 km  bar=0.500 km  rms=0.083287 km  checked=6480

Slice 6 frame round-trip summary:
  one-pass max relative error = 0
  ten-chain max relative error = 0
  one-pass bound = 2.220446049250313e-15
  ten-chain bound = 2.220446049250313e-14

Slice 6 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice6-cutover.test.mjs (11130.9012ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11141.9882
Compiling v2 core and boundary for Slice 7 cutover...
PASS tsc compilation

PASS INV-012 10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
PASS INV-012 16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
PASS INV-012 39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
PASS INV-012 40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
PASS INV-012 1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
PASS INV-012 1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
PASS INV-012 4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
PASS INV-012 15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
PASS INV-012 101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
PASS INV-012 162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
PASS INV-012 3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
PASS INV-012 2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
PASS INV-012 1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
PASS INV-012 433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
PASS INV-012 4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
PASS INV-012 4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
PASS INV-012 25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
PASS INV-012 99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 per-body propagation summary:
  10        max=35313.394494 km  bar=100000.000 km  rms=15843.203198 km  checked=91
  16        max=22510.437018 km  bar=100000.000 km  rms=9934.157572 km  checked=91
  39        max=13853.815196 km  bar=100000.000 km  rms=6299.076428 km  checked=91
  40        max=10582.950158 km  bar=100000.000 km  rms=4807.639350 km  checked=91
  1057      max=8322.007643 km  bar=100000.000 km  rms=3746.584747 km  checked=91
  1620      max=4411.328196 km  bar=100000.000 km  rms=1731.052524 km  checked=91
  4179      max=4390.632922 km  bar=100000.000 km  rms=1992.573240 km  checked=91
  15        max=4295.037728 km  bar=100000.000 km  rms=1934.547010 km  checked=91
  101955    max=4236.441416 km  bar=100000.000 km  rms=1827.048434 km  checked=91
  162173    max=4121.988502 km  bar=100000.000 km  rms=1708.699708 km  checked=91
  3         max=3796.189940 km  bar=100000.000 km  rms=1755.910621 km  checked=91
  2         max=3757.864316 km  bar=100000.000 km  rms=1746.869012 km  checked=91
  1         max=3312.749953 km  bar=100000.000 km  rms=1503.129062 km  checked=91
  433       max=3277.433929 km  bar=100000.000 km  rms=1431.094510 km  checked=91
  4         max=3210.757864 km  bar=100000.000 km  rms=1496.219335 km  checked=91
  4769      max=2989.236042 km  bar=100000.000 km  rms=1352.585431 km  checked=91
  25143     max=1707.318429 km  bar=100000.000 km  rms=802.067300 km  checked=91
  99942     max=1506.197562 km  bar=100000.000 km  rms=623.834074 km  checked=91

Slice 7 cutover harness passed with zero runtime invariant violations.
✔ tests\v2-slice7-cutover.test.mjs (2448.6743ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2461.6654
Compiling v2 core and boundary for Slice 8 cutover...
PASS tsc compilation

Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-slice8-cutover/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 3) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}

Slice 8 per-band cutover summary:
  A count=50 max=23147.749445 km bar=35612.872326 km rms=3582.231183 km
  B count=50 max=49114.205128 km bar=52970.091742 km rms=4790.752314 km
  C count=50 max=31804.196407 km bar=37688.076110 km rms=3922.950118 km
  D count=50 max=29163.667462 km bar=43757.549716 km rms=4119.658435 km

Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.
(node:56496) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ tests\v2-slice8-cutover.test.mjs (4343.8489ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4353.4439
[slice8-performance] outer-system-overview bodies=10008 occupiedCells=178 visibleCells=72 visibleBodies=4234 estimatedGpuDrawCount=72 visibleSlice7RegressionBodies=9
[slice8-performance] asteroid-belt-focus bodies=10008 occupiedCells=178 visibleCells=55 visibleBodies=3126 estimatedGpuDrawCount=55 visibleSlice7RegressionBodies=3
[slice8-performance] focused-vesta-close-zoom bodies=10008 occupiedCells=178 visibleCells=14 visibleBodies=1084 estimatedGpuDrawCount=14 visibleSlice7RegressionBodies=1
✔ Slice 8 cell culling architecture produces sane visibility counts across key camera scenarios (2454.6839ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2557.3303
﹣ Slice 9 Phase A.3 three-gate cutover harness validates the committed contract and documents residual envelope exceedance (0.774ms) # RETIRED 2026-07-12: fixture slice9-cutover-sample.json was never committed (.gitignore:17), unrecoverable, no generator. Expected values 26/58/66/61 were measured from the lost sample; a regenerated sample would reset them while faking continuity. See SLICE_9_FOUNDING.md amendment.
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 114.606
✔ slice9 runtime normalization preserves finite render-critical asteroid fields (2176.0497ms)
✔ solar-system runtime is wired to the Slice 9 live catalog and Phase B canonical pipeline (1.4434ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2275.138
✔ Slice 9 perf config exposes the committed four partition modes and four camera states (0.6225ms)
✔ Slice 9 perf session rows format the observable measurement contract cleanly (0.2755ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 105.7992
✔ Slice 9 A.2b re-anchor recomputes derived fields after replacing elements (249.9939ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 388.5762
▶ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components
  ✔ Partition correctness holds for uniform 0.5 AU and all hybrid candidates (110.5282ms)
  ✔ Hybrid structural validity holds for all candidate density triggers (37.5922ms)
  ✔ Body conservation holds across re-partition after time scrub (714.213ms)
  ✔ Occupancy reproduction at 0.5 AU remains within the committed tolerance band (0.7462ms)
  ✔ Propagation CPU-time measurements report main-thread and worker-thread components without inferring frame budget (721.0645ms)
✔ Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components (5704.1791ms)
ℹ Slice 9 uniform 0.5 AU occupancy: occupied=2060 baseline=2060 drift=0.00% maxBodies=1178 baselineMax=1177 drift=0.08%
ℹ Slice 9 propagation CPU-only timing: main median=41.280ms p95=53.965ms; worker roundtrip median=42.272ms p95=257.612ms; worker compute median=41.553ms p95=45.617ms; fallback bodies=1
ℹ Slice 9 offline propagation fallback bodies: 1 (2015 D1 [JFC])
ℹ Slice 9 hybrid summaries: D=200 coarse=544 subCells=2375 leafCells=2876 maxLeaf=266; D=500 coarse=544 subCells=1171 leafCells=1696 maxLeaf=473; D=1000 coarse=544 subCells=749 leafCells=1281 maxLeaf=810
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5891.0253
✔ symmetric-return disclosure is derived from the committed six-row artifact (137.0967ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 244.5255
✔ the seven representative bodies render their sentences verbatim from the committed artifact (2356.5076ms)
✔ structurally blind splits by cause: 206 comets + 482 Jupiter-crossing = 688, each with its own sentence (291.8226ms)
✔ every one of the 41,906 bodies has a full sentence — no value is missing from committed data (22.2158ms)
✔ L1: the max-drift date traces to dv-scope-per-body.json, and the boundary is the EARLIEST material encounter, recomputed from the CAD snapshot (677.5027ms)
✔ impactor dates and the 3D drift trace to the truth fixture and nea-drift-results.json (97.2809ms)
✔ formatters: dates, million-km, m/s, AU — and no value is invented from junk (1.4139ms)
✔ a record missing its value yields null (omit), never a sentence with a hole (0.9422ms)
✔ L2 disclosure distinguishes a measured-but-unbounded body from an unmeasured body (27.1462ms)
✔ threshold provenance is verbatim and rides with every mention of 10^6 km; legend has one line per key (0.7017ms)
✔ short labels never expose a slug (32.0043ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3692.5892
(node:46556) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ catalog tier legend renders both L2 disclosure phrases from the shared source (2689.3475ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2776.4959
Failed to load Lambert screen cache: [TypeError: Failed to parse URL from /lambert-screen-cache.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:75:32
      at loadLambertScreenCacheAsync (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/lambert-screen-cache.js:81:7)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:41:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26 {
    code: 'ERR_INVALID_URL',
    input: '/lambert-screen-cache.json'
  }
}
Failed to load fidelity tier assignments: [TypeError: Failed to parse URL from /tier-sizing-per-body.json] {
  [cause]: TypeError: Invalid URL
      at new URL (node:internal/url:862:25)
      at new Request (node:internal/deps/undici/undici:12715:25)
      at fetch (node:internal/deps/undici/undici:13679:25)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadTierAssignments (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/boundary/tier-assignments.js:8:28)
      at file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/catalog-list/panel.js:51:1
      at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
      at async node:internal/modules/esm/loader:650:26
      at async Promise.all (index 0) {
    code: 'ERR_INVALID_URL',
    input: '/tier-sizing-per-body.json'
  }
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957665642-0.4808652873029946:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957665642-0.4808652873029946:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:340:29
}
Phase C failed to initialize porkchop client for overlay [TypeError: fetch failed] {
  [cause]: Error: not implemented... yet...
      at makeNetworkError (node:internal/deps/undici/undici:12443:35)
      at schemeFetch (node:internal/deps/undici/undici:14050:34)
      at mainFetch (node:internal/deps/undici/undici:13898:30)
      at fetching (node:internal/deps/undici/undici:13867:7)
      at fetch (node:internal/deps/undici/undici:13728:20)
      at fetch (node:internal/deps/undici/undici:18606:10)
      at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)
      at loadPorkchopEarthStateSeries (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957668506-0.9423090216879224:107:28)
      at Module.mountPhaseCOverlay (file:///C:/Users/hudso/aster-a-cache/.tmp-tests/v2-ui-overlay/app/ui-overlay/overlay.js?cacheBust=1794957668506-0.9423090216879224:290:35)
      at file:///C:/Users/hudso/aster-a-cache/tests/v2-ui-overlay.test.mjs:374:29
}
(node:39284) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ Phase C overlay mounts with real Preact, reflects store subscriptions, and cleans up (2910.5732ms)
✔ Phase C overlay converges through repeated store updates with finite fake-DOM layout metrics (2782.4448ms)
✔ runtime wires the Phase C.1 overlay mount and focus-request bridge without changing scene ownership (0.3517ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5847.8527
(node:26744) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ ui store initial state matches the documented Phase C.1 defaults (2288.9192ms)
✔ ui store action functions update the state they claim to own (2243.9708ms)
✔ ui store readonly signals reflect dispatched state updates (2619.3756ms)
✔ focusRequestId increments monotonically on requestFocus() (2477.8199ms)
✔ focus-request subscription only fires when requestFocus increments (2665.1192ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 12415.0129
✔ validation provenance scopes strict and observed payload figures and preserves magnitude-only wording (1.5915ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 104.6767

================ FINAL SUMMARY ================
files discovered:    112
files passed:        112
files failed:        0
files LOAD-TIMEOUT:  0
tests passed:        370
tests failed:        0
wall clock:          395.9s
accounting:          112 == 112 + 0 + 0 OK
VERIFY_EXIT=0
Finished: 2026-11-17T18:21:21.4183149-05:00

## Step 12 npm --prefix mcp test
Started: 2026-11-17T18:21:31.4804212-05:00

> aster-mission-mcp@0.1.0 test
> npm run build && node --test dist/mcp/test/*.js


> aster-mission-mcp@0.1.0 build
> tsc -p .

src/index.ts(2,27): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/index.ts(3,38): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/stdio.js' or its corresponding type declarations.
src/resources/reference.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/resources/reference.ts(172,6): error TS7006: Parameter 'resourceUri' implicitly has an 'any' type.
src/tools/catalog.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/compute-shared.ts(262,5): error TS2322: Type 'number | Readonly<{ readonly kind: "non-finite-c3"; }>' is not assignable to type 'number'.
  Type 'Readonly<{ readonly kind: "non-finite-c3"; }>' is not assignable to type 'number'.
src/tools/dla-feasibility.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/dla-feasibility.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/dla-feasibility.ts(42,12): error TS7006: Parameter 'args' implicitly has an 'any' type.
src/tools/envelope-schema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/estimate-mission-cost.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/estimate-mission-cost.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/estimate-mission-cost.ts(49,12): error TS7006: Parameter 'args' implicitly has an 'any' type.
src/tools/explain-cell.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/explain-cell.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/explain-cell.ts(52,12): error TS7006: Parameter 'args' implicitly has an 'any' type.
src/tools/get-body.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/get-body.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/get-body.ts(23,14): error TS7031: Binding element 'designation' implicitly has an 'any' type.
src/tools/get-validation-report.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/get-validation-report.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/get-validation-report.ts(62,12): error TS7006: Parameter 'args' implicitly has an 'any' type.
src/tools/porkchop-scan.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/porkchop-scan.ts(2,37): error TS2307: Cannot find module '@modelcontextprotocol/sdk/types.js' or its corresponding type declarations.
src/tools/porkchop-scan.ts(3,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/porkchop-scan.ts(76,12): error TS7006: Parameter 'args' implicitly has an 'any' type.
src/tools/search-bodies.ts(1,32): error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/mcp.js' or its corresponding type declarations.
src/tools/search-bodies.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/tools/search-bodies.ts(31,14): error TS7031: Binding element 'query' implicitly has an 'any' type.
src/tools/search-bodies.ts(31,21): error TS7031: Binding element 'orbitClass' implicitly has an 'any' type.
src/tools/search-bodies.ts(31,33): error TS7031: Binding element 'screeningStatus' implicitly has an 'any' type.
src/tools/search-bodies.ts(31,50): error TS7031: Binding element 'limit' implicitly has an 'any' type.
src/tools/search-bodies.ts(31,57): error TS7031: Binding element 'cursor' implicitly has an 'any' type.
test/compute-tools.test.ts(3,26): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
MCP_TEST_EXIT=1
Finished: 2026-11-17T18:21:34.9617747-05:00
