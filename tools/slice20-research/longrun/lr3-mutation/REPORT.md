# LR3 — mutation campaign over core and porkchop

**LEADS-grade research evidence. A surviving mutant is a lead, not a verdict: some survivors are equivalent mutants (the change cannot alter any output).**

State: **COMPLETE**. Run in a throwaway copy of origin/main; node v22.23.4; cloud container (see the top-level report).

## Counts
| Measure | Count |
| --- | ---: |
| Mutants enumerated | 2364 |
| Mutants run | 2364 |
| Killed (a test failed) | 1391 |
| ... killed by a failing assertion / runtime error | 1073 |
| ... killed by the TypeScript compile step inside a test | 318 |
| Timeout (counted with killed) | 22 |
| **SURVIVED** although at least one test executes the function | 923 |
| **SURVIVED** because no test executes the function at all | 28 |
| **SURVIVED** because no test imports the module | 0 |
| Error (source text did not match; not counted either way) | 0 |

## By tier (run order)
| Tier | What | Mutants | Run | Killed | (by compile) | Timeout | Survived (executed) | Survived (function never executed) | Survived (module never imported) | Survival rate of run |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | honesty layer, exported functions | 120 | 120 | 80 | 44 | 0 | 39 | 1 | 0 | 33.3% |
| 2 | math layer, exported functions | 911 | 911 | 693 | 46 | 19 | 199 | 0 | 0 | 21.8% |
| 3 | plumbing, exported functions | 53 | 53 | 33 | 8 | 0 | 20 | 0 | 0 | 37.7% |
| 4 | honesty + math, module-private helpers (beyond the dispatch scope) | 472 | 472 | 345 | 44 | 1 | 125 | 1 | 0 | 26.7% |
| 5 | view (porkchop-view.ts), exported functions | 576 | 576 | 214 | 171 | 2 | 360 | 0 | 0 | 62.5% |
| 6 | plumbing + view, module-private helpers (beyond the dispatch scope) | 232 | 232 | 26 | 5 | 0 | 180 | 26 | 0 | 88.8% |

Inside a tier the run order is a seeded shuffle, so a partly run tier is an unbiased sample of that tier.

## By file (most survivors first)
| File | Layer | Mutants | Run | Killed | Survived | ... of which the function is executed by a test | Survival rate of run |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `porkchop/porkchop-view.ts` | view | 796 | 796 | 236 | 560 | 534 | 70.4% |
| `core/lambert/lambert-multi-rev.ts` | math | 263 | 263 | 171 | 92 | 92 | 35.0% |
| `core/propagators/keplerian.ts` | math | 140 | 140 | 112 | 28 | 28 | 20.0% |
| `core/lambert/stumpff.ts` | math | 53 | 53 | 27 | 26 | 26 | 49.1% |
| `porkchop/segment-windows.ts` | math | 77 | 77 | 51 | 26 | 26 | 33.8% |
| `porkchop/grid-compute.ts` | math | 69 | 69 | 51 | 18 | 18 | 26.1% |
| `core/lambert/izzo.ts` | math | 90 | 90 | 73 | 17 | 17 | 18.9% |
| `core/constants/asteroids.ts` | math | 41 | 41 | 25 | 16 | 16 | 39.0% |
| `core/invariants/assertions.ts` | honesty | 71 | 71 | 57 | 14 | 14 | 19.7% |
| `porkchop/colormap.ts` | plumbing | 37 | 37 | 23 | 14 | 14 | 37.8% |
| `porkchop/compare-data.ts` | math | 51 | 51 | 39 | 12 | 12 | 23.5% |
| `core/frames/transform.ts` | math | 50 | 50 | 39 | 11 | 11 | 22.0% |
| `core/interpolators/hermite.ts` | math | 99 | 99 | 89 | 10 | 10 | 10.1% |
| `core/lambert/tof.ts` | math | 128 | 128 | 118 | 10 | 10 | 7.8% |
| `porkchop/launch-vehicles.ts` | math | 44 | 44 | 34 | 10 | 10 | 22.7% |
| `porkchop/tier-disclosure.ts` | honesty | 19 | 19 | 9 | 10 | 10 | 52.6% |
| `core/invariants/round-trip.ts` | honesty | 23 | 23 | 15 | 8 | 8 | 34.8% |
| `core/lambert/householder.ts` | math | 33 | 33 | 25 | 8 | 8 | 24.2% |
| `porkchop/composite-grid.ts` | math | 58 | 58 | 50 | 8 | 8 | 13.8% |
| `porkchop/format-c3.ts` | honesty | 9 | 9 | 1 | 8 | 8 | 88.9% |
| `core/lambert/dla.ts` | math | 13 | 13 | 6 | 7 | 7 | 53.8% |
| `core/lambert/hyp2f1b.ts` | math | 21 | 21 | 14 | 7 | 7 | 33.3% |
| `porkchop/delta-v.ts` | math | 11 | 11 | 5 | 6 | 6 | 54.5% |
| `porkchop/porkchop-client.ts` | plumbing | 9 | 9 | 3 | 6 | 6 | 66.7% |
| `porkchop/propagation-guard.ts` | honesty | 10 | 10 | 4 | 6 | 6 | 60.0% |
| `porkchop/compare-url.ts` | plumbing | 9 | 9 | 6 | 3 | 3 | 33.3% |
| `porkchop/porkchop.worker.ts` | plumbing | 10 | 10 | 7 | 3 | 3 | 30.0% |
| `core/lambert/initial-guess.ts` | math | 68 | 68 | 66 | 2 | 2 | 2.9% |
| `porkchop/support-boundary.ts` | honesty | 9 | 9 | 7 | 2 | 1 | 22.2% |
| `core/invariants/runtime.ts` | honesty | 2 | 2 | 1 | 1 | 0 | 50.0% |
| `core/lambert/vec3.ts` | math | 32 | 32 | 31 | 1 | 1 | 3.1% |
| `core/units/utc-to-tdb.ts` | math | 5 | 5 | 4 | 1 | 1 | 20.0% |
| `core/constants/bodies.ts` | math | 1 | 1 | 1 | 0 | 0 | 0.0% |
| `core/constants/near-zero-c3.ts` | honesty | 1 | 1 | 1 | 0 | 0 | 0.0% |
| `core/lambert/feasibility.ts` | math | 5 | 5 | 5 | 0 | 0 | 0.0% |
| `core/units.ts` | math | 4 | 4 | 4 | 0 | 0 | 0.0% |
| `porkchop/near-zero-c3.ts` | honesty | 3 | 3 | 3 | 0 | 0 | 0.0% |

## Functions no test executes
Every mutant inside these survives by construction: no discovered test file calls the function. This is measured (V8 function coverage at baseline), not inferred.

| File | Function | Exported | Layer | Mutants | Test files importing the module |
| --- | --- | --- | --- | ---: | ---: |
| `core/invariants/runtime.ts` | `defaultViolationHandler` | no | honesty | 1 | 57 |
| `porkchop/support-boundary.ts` | `boundaryTofDaysAtDeparture` | yes | honesty | 1 | 16 |
| `porkchop/porkchop-view.ts` | `getNearestCellForTarget` | no | view | 26 | 13 |

## How tests were chosen, and the check on that choice
- Import graph, measured: each of the discovered test files was run once unmutated and the modules it compiled into `.tmp-tests/` were recorded.
- Function level, measured: the same run recorded, through `NODE_V8_COVERAGE`, which top-level functions each test executed. A mutant is run against the tests that import its module and executed its function. A test that never calls the function runs identical instructions with or without the mutant.
- Check: 12 surviving mutants were re-run against every importing test with the pruning off (142 test-file runs). Still surviving: 12. Killed only without pruning: 0.
- Test files failing unmutated in the copy (excluded, cannot kill anything): none.
- "Killed by compile" means the test's own tsc step rejected the mutant. That is a kill by the type system, not by an assertion.

## Survivors ranked by risk
951 survivors in total: 923 in functions that tests do execute, 28 in functions no test executes (tabled above).
Ranking: honesty and math layers first, then by operator (guard removal, then comparison and sign changes, then arithmetic and argument swaps, then loop bounds, then 0.1% constant nudges), exported functions before helpers.
The 40 highest-ranked executed survivors in the honesty and math layers follow. **Every survivor, with its diff and the tests that ran, is in `SURVIVORS.md`** and in `lr3-mutation.json`.

### 1. `core/constants/asteroids.ts:66` — `toAsteroidBodyId` — guard-removal
```diff
- if (typeof designation !== 'string' || designation.length === 0) { throw new Error('Asteroid designation must be a non-empty string'); }
+ ;
```
Layer math. 7 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 2. `core/constants/asteroids.ts:77` — `deriveAsteroidDiameterKmFromAbsoluteMagnitude` — guard-removal
```diff
- if (!Number.isFinite(absoluteMagnitude)) { throw new Error('Asteroid absolute magnitude H must be finite'); }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-slice9-live-runtime-integration.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 3. `core/constants/asteroids.ts:91` — `eccentricityBandForBody` — guard-removal
```diff
- if (!Number.isFinite(eccentricity) || eccentricity < 0) { throw new Error('Asteroid eccentricity must be a finite non-negative number'); }
+ ;
```
Layer math. 11 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 4. `core/constants/asteroids.ts:107` — `hasOrbitLineForBody` — guard-removal
```diff
- if (!Number.isFinite(absoluteMagnitude)) { throw new Error('Asteroid absolute magnitude H must be finite'); }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-slice9-live-runtime-integration.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 5. `core/constants/asteroids.ts:122` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (!isAsteroidBodyId(asteroid.bodyId)) { throw new Error(`Invalid asteroid body id "${asteroid.bodyId}"`); }
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 6. `core/constants/asteroids.ts:125` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (asteroid.bodyId !== toAsteroidBodyId(asteroid.designation)) { throw new Error( `Asteroid body id "${asteroid.bodyId}" does not match designation "${asteroid.designation}"`, );  ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 7. `core/constants/asteroids.ts:130` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (asteroid.elementsFrame !== FRAME_HELIO_J2000_ECLIPTIC) { throw new Error( `Asteroid "${asteroid.bodyId}" must use ${FRAME_HELIO_J2000_ECLIPTIC}; received ${asteroid.elementsFrame}`,  ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 8. `core/constants/asteroids.ts:139` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (typeof asteroid.eccentricityBand !== 'undefined' && asteroid.eccentricityBand !== expectedBand) { throw new Error( `Asteroid "${asteroid.bodyId}" eccentricityBand mismatch: expec ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 9. `core/constants/asteroids.ts:146` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (typeof asteroid.hasOrbitLine !== 'undefined' && asteroid.hasOrbitLine !== expectedHasOrbitLine) { throw new Error( `Asteroid "${asteroid.bodyId}" hasOrbitLine mismatch: expected ${ex ...
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 10. `core/constants/asteroids.ts:152` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (byBodyId.has(asteroid.bodyId)) { throw new Error(`Duplicate asteroid body id "${asteroid.bodyId}"`); }
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 11. `core/constants/asteroids.ts:155` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (byDesignation.has(asteroid.designation)) { throw new Error(`Duplicate asteroid designation "${asteroid.designation}"`); }
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 12. `core/constants/asteroids.ts:158` — `createAsteroidCatalogIndex` — guard-removal
```diff
- if (bySpkId.has(asteroid.spkId)) { throw new Error(`Duplicate asteroid SPK id "${asteroid.spkId}"`); }
+ ;
```
Layer math. 1 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`.
Suggested test: One test per guard: a catalog with exactly that defect, asserting the thrown error.
Assessment: Validation guards not tested. One test file runs this function and none of its catalog-consistency refusals (wrong body id form, id/designation mismatch, wrong frame, band or orbit-line mismatch, duplicate id / designation / SPK id) is exercised with a bad record.

### 13. `core/frames/transform.ts:206` — `transformCanonicalState` — guard-removal
```diff
- if (fromFrame === toFrame) { return { ...state, frame: toFrame, }; }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: transformCanonicalState(state, F, F, t): assert the state comes back unchanged with frame F.
Assessment: Identity transform not tested. Without this early return a transform from a frame to itself reaches assertSupportedTransform, which rejects the pair and throws INV-004. No test asks for from === to.

### 14. `core/interpolators/hermite.ts:87` — `interpolateBodyStateSeries` — guard-removal
```diff
- if (samples.length === 0) { failInvariant( getInterpolationInvariantId(bodyId), `Cannot interpolate empty sample series for body '${bodyId}'`, { bodyId, tdbSeconds, expectedCaden ...
+ ;
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: interpolateBodyStateSeries with an empty array: assert the failure is the interpolation invariant (by id), not just that something throws.
Assessment: Guard not tested: an empty sample series. Without it the function still fails, but with a TypeError from samples[0] instead of the INV-008 invariant.

### 15. `core/lambert/hyp2f1b.ts:31` — `hyp2f1b` — guard-removal
```diff
- if (Math.abs(newResult - result) < RTOL * Math.abs(newResult)) { return newResult; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: hyp2f1b pinned against a reference value at x = 0.9 to 1e-9 (the accuracy the solver header claims) would catch a series stopped early.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. (Here the "root-finder" is a series summed until it stops changing.)

### 16. `core/lambert/izzo.ts:126` — `lambert` — guard-removal
```diff
- if (!result.ok) { return { ok: false, reason: 'no_convergence' }; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 17. `core/lambert/lambert-multi-rev.ts:140` — `tMinForM` — guard-removal
```diff
- if (M === 0) { return 0; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM(lambda, 0): assert exactly 0.
Assessment: tMinForM(lambda, 0) === 0 is not asserted directly. Reading: lambertMultiRev never calls tMinForM with M = 0, so this matters only to direct callers.

### 18. `core/lambert/lambert-multi-rev.ts:145` — `tMinForM` — guard-removal
```diff
- if (xAtMinimum === null) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A direct tMinForM call at a lambda for which the Halley iteration does not converge, asserting null.
Assessment: Defensive branches not tested (Halley iteration failing, non-finite y at the minimum).

### 19. `core/lambert/lambert-multi-rev.ts:150` — `tMinForM` — guard-removal
```diff
- if (!Number.isFinite(yAtMinimum)) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A direct tMinForM call at a lambda for which the Halley iteration does not converge, asserting null.
Assessment: Defensive branches not tested (Halley iteration failing, non-finite y at the minimum).

### 20. `core/lambert/lambert-multi-rev.ts:287` — `lambertMultiRev` — guard-removal
```diff
- if (!(tof > 0) || !(mu > 0)) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: lambertMultiRev with tof = 0, tof = -1 and mu = 0: assert null for each.
Assessment: Guard not tested: a non-positive time of flight or mu. Without it the solver runs on tof <= 0.

### 21. `core/lambert/lambert-multi-rev.ts:301` — `lambertMultiRev` — guard-removal
```diff
- if (!solved.ok) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Find or construct an M = 0 input for which householder returns ok === false (or inject one) and assert lambertMultiRev returns null rather than a branch.
Assessment: Guard not tested: an M = 0 solve whose Householder iteration reports not-ok. No test produces a non-converging M = 0 case, so the null return is unpinned.

### 22. `core/lambert/lambert-multi-rev.ts:306` — `lambertMultiRev` — guard-removal
```diff
- if (branch === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test with inputs that make compute_y non-finite (lambda and x at the edge of the domain), asserting null.
Assessment: Defensive branch not tested (velocity reconstruction returning null, T_min not found, no branch built). Reading: these need non-finite intermediate values; no test reaches them.

### 23. `core/lambert/lambert-multi-rev.ts:316` — `lambertMultiRev` — guard-removal
```diff
- if (TMin === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test with inputs that make compute_y non-finite (lambda and x at the edge of the domain), asserting null.
Assessment: Defensive branch not tested (velocity reconstruction returning null, T_min not found, no branch built). Reading: these need non-finite intermediate values; no test reaches them.

### 24. `core/lambert/lambert-multi-rev.ts:332` — `lambertMultiRev` — guard-removal
```diff
- if (branches.length === 0) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test with inputs that make compute_y non-finite (lambda and x at the edge of the domain), asserting null.
Assessment: Defensive branch not tested (velocity reconstruction returning null, T_min not found, no branch built). Reading: these need non-finite intermediate values; no test reaches them.

### 25. `core/lambert/tof.ts:31` — `compute_y` — guard-removal
```diff
- if (arg < 0) return NaN;
+ ;
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Without the guard the function takes Math.sqrt of a negative number, which is NaN, the same value the guard returns.

### 26. `core/propagators/keplerian.ts:113` — `solveKeplerEquation` — guard-removal
```diff
- if (eccentricity < 0 || eccentricity >= 1) { throw new RangeError('eccentricity must be in [0, 1) for elliptical propagation'); }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 27. `core/propagators/keplerian.ts:167` — `sampleOrbitEllipse` — guard-removal
```diff
- if (!Number.isInteger(segmentCount) || segmentCount < 3) { throw new RangeError('segmentCount must be an integer >= 3'); }
+ ;
```
Layer math. 5 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: sampleOrbitEllipse(elements, 2.5) and (elements, 0): assert the RangeError.
Assessment: Guard not tested: sampleOrbitEllipse with a non-integer or too-small segment count.

### 28. `core/propagators/keplerian.ts:205` — `propagateKeplerianStateVectors` — guard-removal
```diff
- if (gmM3S2 <= 0) { throw new RangeError('gmM3S2 must be > 0'); }
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: propagateKeplerianStateVectors with options.gmM3S2 = 0 and = -1: assert the RangeError.
Assessment: Guard not tested: a non-positive GM handed to propagateKeplerianStateVectors.

### 29. `core/units/utc-to-tdb.ts:50` — `utcStringToTdbSeconds` — guard-removal
```diff
- if (!Number.isFinite(utcMs)) { throw new Error(`Cannot parse UTC date string: ${utcString}`); }
+ ;
```
Layer math. 11 test file(s) executed this function and still passed (11 import the module): `v2-lambert/utc-to-tdb.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-runtime-hover-tooltips.test.mjs`, `v2-runtime-camera-presets.test.mjs`, `v2-slice5-cutover.test.mjs`, `v2-runtime-date-hud.test.mjs`, `v2-runtime-display-integrity.test.mjs`, `v2-runtime-focus.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-render-mars-system.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 30. `porkchop/compare-data.ts:202` — `toSegmentGrid` — guard-removal
```diff
- if (cells.length !== nDep * nTof) { throw new Error( `grid shape mismatch: nDep ${nDep} × nTof ${nTof} != cells.length ${cells.length}`, ); }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: toSegmentGrid with one cell too few: assert it throws the shape-mismatch error.
Assessment: Defensive branch not tested: a cells array whose length is not nDep * nTof.

### 31. `porkchop/composite-grid.ts:70` — `selectedC3` — guard-removal
```diff
- if (cell.status !== 'ok' || cell.selectedBranch === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: selectedC3 on a cell with status "stall" and a populated branches array: assert null.
Assessment: Reading (not executed): without the guard a non-ok cell falls through to the branch lookup, which yields undefined and so null for a null selectedBranch; a stall cell that still carries a selected branch would differ. No test has one.

### 32. `porkchop/format-c3.ts:13` — `formatC3` — guard-removal
```diff
- if (c3 === null) { return '—'; }
+ ;
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(null): assert the em dash.
Assessment: REAL GAP (honesty, small). With this guard gone formatC3(null) falls through to the non-finite branch and returns the text 'null' instead of the dash. No test calls formatC3(null).

### 33. `porkchop/format-c3.ts:16` — `formatC3` — guard-removal
```diff
- if (!Number.isFinite(c3)) { return String(c3); }
+ ;
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. For NaN and for +/-Infinity the code below this guard produces the same strings ('NaN', 'Infinity', '-Infinity') as String(c3).

### 34. `porkchop/launch-vehicles.ts:217` — `payloadAtC3` — guard-removal
```diff
- if (!first || !last || c3 < first.c3 || c3 > last.c3) { // C3 < 0 is impossible in the grid; treat it as outside the published curve // instead of inventing an extrapolated payload below the f ...
+ ;
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Verified: with this guard removed an out-of-range C3 matches no anchor and no bracket and reaches the final return BEYOND_CURVE; payloadAtC3 returns BEYOND_CURVE just outside both ends of the curve.

### 35. `porkchop/launch-vehicles.ts:284` — `deliveredMassKg` — guard-removal
```diff
- if (!Number.isFinite(dvSpacecraftMps)) { return INVALID_INPUT; }
+ ;
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: deliveredMassKg with marginMps = NaN: assert the INVALID_INPUT sentinel.
Assessment: Defensive branch not tested: a budget whose sum is not finite (for example a NaN margin). Without the guard deliveredMassKg returns NaN instead of INVALID_INPUT.

### 36. `porkchop/propagation-guard.ts:75` — `assessPropagation` — guard-removal
```diff
- if (!Number.isFinite(elements[key])) { return refuse('non-finite-element', elements.e); }
+ ;
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: For each of the seven element keys, call assessPropagation with that one element set to NaN (and once to Infinity) on otherwise valid elements; assert propagatable === false and reason === 'non-finite-element'.
Assessment: REAL GAP (honesty). With this guard gone, a NaN semi-major axis passes every later check (NaN <= 0 is false) and assessPropagation returns propagatable: true. No test hands the guard a non-finite element.

### 37. `porkchop/propagation-guard.ts:82` — `assessPropagation` — guard-removal
```diff
- if (elements.e < 0 || elements.e >= 1) { return refuse('eccentricity-not-elliptical', elements.e); }
+ ;
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with aM > 0 and e = 1.2, and again with e = -0.1: assert propagatable === false and reason === 'eccentricity-not-elliptical'.
Assessment: REAL GAP (honesty). Read from propagation-guard.test.mjs: the only refusal it drives through assessPropagation is a non-positive semi-major axis (it asserts reason === 'non-positive-semi-major-axis'). The eccentricity check never decides anything in a test, so deleting it changes no result.

### 38. `porkchop/segment-windows.ts:103` — `compareByMinC3` — guard-removal
```diff
- if (a.argmin.depJd !== b.argmin.depJd) { return a.argmin.depJd - b.argmin.depJd; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 39. `porkchop/support-boundary.ts:34` — `supportBoundaryFor` — guard-removal
```diff
- if (!Number.isFinite(tier.encounter.jd)) { return undefined; }
+ ;
```
Layer honesty. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/support-boundary.test.mjs`, `v2-dla-render.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: supportBoundaryFor of an L1 record with encounter.jd = NaN: assert undefined.
Assessment: Defensive branch not tested: an L1 record whose encounter.jd is not finite. Without the guard such a record yields a boundary with a NaN epoch, and every later comparison against it is false (nothing is flagged unsupported).

### 40. `porkchop/tier-disclosure.ts:72` — `formatMetersPerSecond` — guard-removal
```diff
- if (!Number.isFinite(dvKmS) || dvKmS < 0) { return null; }
+ ;
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(NaN), formatMetersPerSecond(Infinity) and formatMetersPerSecond(-0.001): assert null for each.
Assessment: REAL GAP (honesty). Without this guard a NaN or negative delta-v is formatted ('NaN', '-12.0') and flows into the disclosure sentence. No test passes one.

## Files
- `mutate.mjs` (enumerate / baseline / run), `plan.mjs` (priority order), `report.mjs` (this report).
- `lr3-mutation.json` — every mutant with its outcome, the tier and file tables, the baseline test list.
- `SURVIVORS.md` — every survivor, ranked.
- `survivor-notes.json` — hand-written notes merged into the survivor blocks (when present).

