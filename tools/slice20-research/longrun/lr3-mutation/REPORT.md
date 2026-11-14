# LR3 — mutation campaign over core and porkchop

**LEADS-grade research evidence. A surviving mutant is a lead, not a verdict: some survivors are equivalent mutants (the change cannot alter any output).**

State: **PARTIAL: 778 of 2364**. Run in a throwaway copy of origin/main; node v22.23.4; cloud container (see the top-level report).

## Counts
| Measure | Count |
| --- | ---: |
| Mutants enumerated | 2364 |
| Mutants run | 778 |
| Killed (a test failed) | 586 |
| ... killed by a failing assertion / runtime error | 503 |
| ... killed by the TypeScript compile step inside a test | 83 |
| Timeout (counted with killed) | 13 |
| **SURVIVED** although at least one test executes the function | 178 |
| **SURVIVED** because no test executes the function at all | 1 |
| **SURVIVED** because no test imports the module | 0 |
| Error (source text did not match; not counted either way) | 0 |

## By tier (run order)
| Tier | What | Mutants | Run | Killed | (by compile) | Timeout | Survived (executed) | Survived (function never executed) | Survived (module never imported) | Survival rate of run |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | honesty layer, exported functions | 120 | 120 | 80 | 44 | 0 | 39 | 1 | 0 | 33.3% |
| 2 | math layer, exported functions | 911 | 615 | 473 | 36 | 13 | 129 | 0 | 0 | 21.0% |
| 3 | plumbing, exported functions | 53 | 13 | 11 | 2 | 0 | 2 | 0 | 0 | 15.4% |
| 4 | honesty + math, module-private helpers (beyond the dispatch scope) | 472 | 30 | 22 | 1 | 0 | 8 | 0 | 0 | 26.7% |
| 5 | view (porkchop-view.ts), exported functions | 576 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | n/a |
| 6 | plumbing + view, module-private helpers (beyond the dispatch scope) | 232 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | n/a |

Inside a tier the run order is a seeded shuffle, so a partly run tier is an unbiased sample of that tier.

## By file (most survivors first)
| File | Layer | Mutants | Run | Killed | Survived | ... of which the function is executed by a test | Survival rate of run |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `core/lambert/stumpff.ts` | math | 53 | 38 | 17 | 21 | 21 | 55.3% |
| `porkchop/segment-windows.ts` | math | 77 | 46 | 31 | 15 | 15 | 32.6% |
| `core/lambert/lambert-multi-rev.ts` | math | 263 | 43 | 29 | 14 | 14 | 32.6% |
| `core/propagators/keplerian.ts` | math | 140 | 69 | 55 | 14 | 14 | 20.3% |
| `core/frames/transform.ts` | math | 50 | 25 | 15 | 10 | 10 | 40.0% |
| `core/invariants/assertions.ts` | honesty | 71 | 55 | 45 | 10 | 10 | 18.2% |
| `porkchop/tier-disclosure.ts` | honesty | 19 | 19 | 9 | 10 | 10 | 52.6% |
| `core/lambert/izzo.ts` | math | 90 | 64 | 55 | 9 | 9 | 14.1% |
| `core/constants/asteroids.ts` | math | 41 | 27 | 19 | 8 | 8 | 29.6% |
| `porkchop/format-c3.ts` | honesty | 9 | 9 | 1 | 8 | 8 | 88.9% |
| `core/interpolators/hermite.ts` | math | 99 | 30 | 23 | 7 | 7 | 23.3% |
| `porkchop/compare-data.ts` | math | 51 | 34 | 27 | 7 | 7 | 20.6% |
| `core/lambert/householder.ts` | math | 33 | 19 | 13 | 6 | 6 | 31.6% |
| `porkchop/propagation-guard.ts` | honesty | 10 | 10 | 4 | 6 | 6 | 60.0% |
| `core/invariants/round-trip.ts` | honesty | 23 | 14 | 9 | 5 | 5 | 35.7% |
| `porkchop/delta-v.ts` | math | 11 | 10 | 5 | 5 | 5 | 50.0% |
| `porkchop/launch-vehicles.ts` | math | 44 | 26 | 21 | 5 | 5 | 19.2% |
| `porkchop/composite-grid.ts` | math | 58 | 36 | 32 | 4 | 4 | 11.1% |
| `core/lambert/dla.ts` | math | 13 | 6 | 3 | 3 | 3 | 50.0% |
| `core/lambert/tof.ts` | math | 128 | 64 | 61 | 3 | 3 | 4.7% |
| `porkchop/grid-compute.ts` | math | 69 | 19 | 16 | 3 | 3 | 15.8% |
| `porkchop/support-boundary.ts` | honesty | 9 | 9 | 7 | 2 | 1 | 22.2% |
| `core/lambert/hyp2f1b.ts` | math | 21 | 10 | 9 | 1 | 1 | 10.0% |
| `core/lambert/vec3.ts` | math | 32 | 24 | 23 | 1 | 1 | 4.2% |
| `porkchop/colormap.ts` | plumbing | 37 | 10 | 9 | 1 | 1 | 10.0% |
| `porkchop/porkchop-client.ts` | plumbing | 9 | 1 | 0 | 1 | 1 | 100.0% |
| `core/constants/bodies.ts` | math | 1 | 0 | 0 | 0 | 0 | n/a |
| `core/constants/near-zero-c3.ts` | honesty | 1 | 1 | 1 | 0 | 0 | 0.0% |
| `core/invariants/runtime.ts` | honesty | 2 | 1 | 1 | 0 | 0 | 0.0% |
| `core/lambert/feasibility.ts` | math | 5 | 3 | 3 | 0 | 0 | 0.0% |
| `core/lambert/initial-guess.ts` | math | 68 | 46 | 46 | 0 | 0 | 0.0% |
| `core/units.ts` | math | 4 | 2 | 2 | 0 | 0 | 0.0% |
| `core/units/utc-to-tdb.ts` | math | 5 | 3 | 3 | 0 | 0 | 0.0% |
| `porkchop/compare-url.ts` | plumbing | 9 | 0 | 0 | 0 | 0 | n/a |
| `porkchop/near-zero-c3.ts` | honesty | 3 | 3 | 3 | 0 | 0 | 0.0% |
| `porkchop/porkchop-view.ts` | view | 796 | 0 | 0 | 0 | 0 | n/a |
| `porkchop/porkchop.worker.ts` | plumbing | 10 | 2 | 2 | 0 | 0 | 0.0% |

## Functions no test executes
Every mutant inside these survives by construction: no discovered test file calls the function. This is measured (V8 function coverage at baseline), not inferred.

| File | Function | Exported | Layer | Mutants | Test files importing the module |
| --- | --- | --- | --- | ---: | ---: |
| `porkchop/support-boundary.ts` | `boundaryTofDaysAtDeparture` | yes | honesty | 1 | 16 |

## How tests were chosen, and the check on that choice
- Import graph, measured: each of the discovered test files was run once unmutated and the modules it compiled into `.tmp-tests/` were recorded.
- Function level, measured: the same run recorded, through `NODE_V8_COVERAGE`, which top-level functions each test executed. A mutant is run against the tests that import its module and executed its function. A test that never calls the function runs identical instructions with or without the mutant.
- Check: 0 surviving mutants were re-run against every importing test with the pruning off (0 test-file runs). Still surviving: 0. Killed only without pruning: 0.
- Test files failing unmutated in the copy (excluded, cannot kill anything): none.
- "Killed by compile" means the test's own tsc step rejected the mutant. That is a kill by the type system, not by an assertion.

## Survivors ranked by risk
179 survivors in total: 178 in functions that tests do execute, 1 in functions no test executes (tabled above).
Ranking: honesty and math layers first, then by operator (guard removal, then comparison and sign changes, then arithmetic and argument swaps, then loop bounds, then 0.1% constant nudges), exported functions before helpers.
The 40 highest-ranked executed survivors in the honesty and math layers follow. **Every survivor, with its diff and the tests that ran, is in `SURVIVORS.md`** and in `lr3-mutation.json`.

### 1. `core/constants/asteroids.ts:66` — `toAsteroidBodyId` — guard-removal
```diff
- if (typeof designation !== 'string' || designation.length === 0) { throw new Error('Asteroid designation must be a non-empty string'); }
+ ;
```
Layer math. 7 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 2. `core/constants/asteroids.ts:91` — `eccentricityBandForBody` — guard-removal
```diff
- if (!Number.isFinite(eccentricity) || eccentricity < 0) { throw new Error('Asteroid eccentricity must be a finite non-negative number'); }
+ ;
```
Layer math. 11 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 3. `core/constants/asteroids.ts:107` — `hasOrbitLineForBody` — guard-removal
```diff
- if (!Number.isFinite(absoluteMagnitude)) { throw new Error('Asteroid absolute magnitude H must be finite'); }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-slice9-live-runtime-integration.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 4. `core/constants/asteroids.ts:122` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (!isAsteroidBodyId(asteroid.bodyId)) { throw new Error(`Invalid asteroid body id "${asteroid.bodyId}"`); }
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 5. `core/constants/asteroids.ts:130` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (asteroid.elementsFrame !== FRAME_HELIO_J2000_ECLIPTIC) { throw new Error( `Asteroid "${asteroid.bodyId}" must use ${FRAME_HELIO_J2000_ECLIPTIC}; received ${asteroid.elementsFrame}`,  ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 6. `core/constants/asteroids.ts:139` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (typeof asteroid.eccentricityBand !== 'undefined' && asteroid.eccentricityBand !== expectedBand) { throw new Error( `Asteroid "${asteroid.bodyId}" eccentricityBand mismatch: expec ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 7. `core/constants/asteroids.ts:146` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (typeof asteroid.hasOrbitLine !== 'undefined' && asteroid.hasOrbitLine !== expectedHasOrbitLine) { throw new Error( `Asteroid "${asteroid.bodyId}" hasOrbitLine mismatch: expected ${ex ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 8. `core/frames/transform.ts:206` — `transformCanonicalState` — guard-removal
```diff
- if (fromFrame === toFrame) { return { ...state, frame: toFrame, }; }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 9. `core/interpolators/hermite.ts:87` — `interpolateBodyStateSeries` — guard-removal
```diff
- if (samples.length === 0) { failInvariant( getInterpolationInvariantId(bodyId), `Cannot interpolate empty sample series for body '${bodyId}'`, { bodyId, tdbSeconds, expectedCaden ...
+ ;
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 10. `core/lambert/izzo.ts:126` — `lambert` — guard-removal
```diff
- if (!result.ok) { return { ok: false, reason: 'no_convergence' }; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 11. `core/lambert/lambert-multi-rev.ts:140` — `tMinForM` — guard-removal
```diff
- if (M === 0) { return 0; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 12. `core/lambert/lambert-multi-rev.ts:145` — `tMinForM` — guard-removal
```diff
- if (xAtMinimum === null) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 13. `core/lambert/lambert-multi-rev.ts:150` — `tMinForM` — guard-removal
```diff
- if (!Number.isFinite(yAtMinimum)) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 14. `core/lambert/lambert-multi-rev.ts:287` — `lambertMultiRev` — guard-removal
```diff
- if (!(tof > 0) || !(mu > 0)) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 15. `core/lambert/lambert-multi-rev.ts:301` — `lambertMultiRev` — guard-removal
```diff
- if (!solved.ok) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 16. `core/lambert/lambert-multi-rev.ts:306` — `lambertMultiRev` — guard-removal
```diff
- if (branch === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 17. `core/lambert/lambert-multi-rev.ts:316` — `lambertMultiRev` — guard-removal
```diff
- if (TMin === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 18. `core/lambert/lambert-multi-rev.ts:332` — `lambertMultiRev` — guard-removal
```diff
- if (branches.length === 0) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 19. `core/lambert/tof.ts:31` — `compute_y` — guard-removal
```diff
- if (arg < 0) return NaN;
+ ;
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 20. `core/propagators/keplerian.ts:167` — `sampleOrbitEllipse` — guard-removal
```diff
- if (!Number.isInteger(segmentCount) || segmentCount < 3) { throw new RangeError('segmentCount must be an integer >= 3'); }
+ ;
```
Layer math. 5 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 21. `core/propagators/keplerian.ts:205` — `propagateKeplerianStateVectors` — guard-removal
```diff
- if (gmM3S2 <= 0) { throw new RangeError('gmM3S2 must be > 0'); }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 22. `porkchop/compare-data.ts:202` — `toSegmentGrid` — guard-removal
```diff
- if (cells.length !== nDep * nTof) { throw new Error( `grid shape mismatch: nDep ${nDep} × nTof ${nTof} != cells.length ${cells.length}`, ); }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 23. `porkchop/composite-grid.ts:70` — `selectedC3` — guard-removal
```diff
- if (cell.status !== 'ok' || cell.selectedBranch === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 24. `porkchop/format-c3.ts:13` — `formatC3` — guard-removal
```diff
- if (c3 === null) { return '—'; }
+ ;
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(null): assert the em dash.
Assessment: REAL GAP (honesty, small). With this guard gone formatC3(null) falls through to the non-finite branch and returns the text 'null' instead of the dash. No test calls formatC3(null).

### 25. `porkchop/format-c3.ts:16` — `formatC3` — guard-removal
```diff
- if (!Number.isFinite(c3)) { return String(c3); }
+ ;
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. For NaN and for +/-Infinity the code below this guard produces the same strings ('NaN', 'Infinity', '-Infinity') as String(c3).

### 26. `porkchop/launch-vehicles.ts:217` — `payloadAtC3` — guard-removal
```diff
- if (!first || !last || c3 < first.c3 || c3 > last.c3) { // C3 < 0 is impossible in the grid; treat it as outside the published curve // instead of inventing an extrapolated payload below the f ...
+ ;
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 27. `porkchop/launch-vehicles.ts:284` — `deliveredMassKg` — guard-removal
```diff
- if (!Number.isFinite(dvSpacecraftMps)) { return INVALID_INPUT; }
+ ;
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 28. `porkchop/propagation-guard.ts:75` — `assessPropagation` — guard-removal
```diff
- if (!Number.isFinite(elements[key])) { return refuse('non-finite-element', elements.e); }
+ ;
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: For each of the seven element keys, call assessPropagation with that one element set to NaN (and once to Infinity) on otherwise valid elements; assert propagatable === false and reason === 'non-finite-element'.
Assessment: REAL GAP (honesty). With this guard gone, a NaN semi-major axis passes every later check (NaN <= 0 is false) and assessPropagation returns propagatable: true. No test hands the guard a non-finite element.

### 29. `porkchop/propagation-guard.ts:82` — `assessPropagation` — guard-removal
```diff
- if (elements.e < 0 || elements.e >= 1) { return refuse('eccentricity-not-elliptical', elements.e); }
+ ;
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with aM > 0 and e = 1.2, and again with e = -0.1: assert propagatable === false and reason === 'eccentricity-not-elliptical'.
Assessment: REAL GAP (honesty). The tests refuse only hyperbolic bodies whose semi-major axis is already <= 0, so the earlier aM check does the refusing and the eccentricity check never decides anything. The refusal reason is not asserted either.

### 30. `porkchop/support-boundary.ts:34` — `supportBoundaryFor` — guard-removal
```diff
- if (!Number.isFinite(tier.encounter.jd)) { return undefined; }
+ ;
```
Layer honesty. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/support-boundary.test.mjs`, `v2-dla-render.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: supportBoundaryFor of an L1 record with encounter.jd = NaN: assert undefined.
Assessment: Defensive branch not tested: an L1 record whose encounter.jd is not finite. Without the guard such a record yields a boundary with a NaN epoch, and every later comparison against it is false (nothing is flagged unsupported).

### 31. `porkchop/tier-disclosure.ts:72` — `formatMetersPerSecond` — guard-removal
```diff
- if (!Number.isFinite(dvKmS) || dvKmS < 0) { return null; }
+ ;
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(NaN), formatMetersPerSecond(Infinity) and formatMetersPerSecond(-0.001): assert null for each.
Assessment: REAL GAP (honesty). Without this guard a NaN or negative delta-v is formatted ('NaN', '-12.0') and flows into the disclosure sentence. No test passes one.

### 32. `porkchop/tier-disclosure.ts:116` — `fullTierDisclosure` — guard-removal
```diff
- if (date === null || dv === null) { return null; }
+ ;
```
Layer honesty. 5 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: fullTierDisclosure for a 'materially-degraded-delta-v' record with an unparseable encounter.cd, and for one with encounter.dvKmS = NaN: assert the result is null.
Assessment: REAL GAP (honesty). Without this guard a record whose date or delta-v cannot be formatted produces a disclosure sentence containing the text 'null' instead of no sentence. No test feeds fullTierDisclosure such a record.

### 33. `core/constants/asteroids.ts:62` — `isAsteroidBodyId` — relational-swap
```diff
- return bodyId.startsWith('asteroid-') && bodyId.length > 'asteroid-'.length;
+ return bodyId.startsWith('asteroid-') && bodyId.length >= 'asteroid-'.length;
```
Layer math. 2 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-runtime-focus.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 34. `core/interpolators/hermite.ts:105` — `interpolateBodyStateSeries` — relational-swap
```diff
- if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
+ if (tdbSeconds >= s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 35. `core/interpolators/hermite.ts:105` — `interpolateBodyStateSeries` — relational-swap
```diff
- if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
+ if (tdbSeconds > s0.tdbSeconds && tdbSeconds <= s1.tdbSeconds) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 36. `core/invariants/assertions.ts:177` — `assertInterpolationError` — relational-swap
```diff
- if (errorM > barM) {
+ if (errorM >= barM) {
```
Layer honesty. 7 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: assertInterpolationError with a single-axis displacement of exactly the bar: assert it does NOT fire.
Assessment: Boundary not tested: an error exactly equal to the bar (the code allows it; the mutant refuses it).

### 37. `core/invariants/assertions.ts:203` — `assertKeplerianError` — relational-swap
```diff
- if (errorM > ASTEROID_KEPLERIAN_ERROR_BAR_M) {
+ if (errorM >= ASTEROID_KEPLERIAN_ERROR_BAR_M) {
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: assertKeplerianError with a single-axis displacement of exactly ASTEROID_KEPLERIAN_ERROR_BAR_M: assert it does NOT fire.
Assessment: Boundary not tested: an error exactly equal to the 100,000 km bar.

### 38. `core/invariants/round-trip.ts:54` — `assertFrameRoundTrip` — relational-swap
```diff
- if (relativeError >= FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR) {
+ if (relativeError > FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR) {
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Hard to construct with real transforms; a unit test of the comparison with an injected error value would pin it. Low priority.
Assessment: Boundary not tested: a round-trip error exactly equal to 10 x Number.EPSILON.

### 39. `core/lambert/householder.ts:48` — `householder` — relational-swap
```diff
- for (let iter = 1; iter <= max_iter; iter++) {
+ for (let iter = 1; iter < max_iter; iter++) {
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 40. `core/lambert/izzo.ts:107` — `lambert` — relational-swap
```diff
- if (i_h[2] < 0) {
+ if (i_h[2] <= 0) {
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

## Files
- `mutate.mjs` (enumerate / baseline / run), `plan.mjs` (priority order), `report.mjs` (this report).
- `lr3-mutation.json` — every mutant with its outcome, the tier and file tables, the baseline test list.
- `SURVIVORS.md` — every survivor, ranked.
- `survivor-notes.json` — hand-written notes merged into the survivor blocks (when present).

