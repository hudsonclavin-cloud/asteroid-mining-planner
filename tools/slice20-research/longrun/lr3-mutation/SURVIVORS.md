# LR3 — every surviving mutant, ranked by risk

**LEADS-grade research evidence. A surviving mutant is a lead, not a verdict: some survivors are equivalent mutants (the change cannot alter any output).**

State: PARTIAL: 778 of 2364. 179 survivors. "Suggested test" is a suggestion only; no test was written.

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

### 41. `core/lambert/izzo.ts:108` — `lambert` — sign-flip
```diff
- lam = -lam;
+ lam = lam;
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 42. `core/lambert/izzo.ts:117` — `lambert` — sign-flip
```diff
- lam = -lam;
+ lam = lam;
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 43. `core/lambert/izzo.ts:118` — `lambert` — sign-flip
```diff
- i_t1 = scale(i_t1, -1);
+ i_t1 = scale(i_t1, 1);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 44. `core/lambert/lambert-multi-rev.ts:125` — `halleyForTMin` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(fTriplePrime) || !Number.isFinite(denominator) || denominator === 0) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 45. `core/lambert/lambert-multi-rev.ts:287` — `lambertMultiRev` — relational-swap
```diff
- if (!(tof > 0) || !(mu > 0)) {
+ if (!(tof >= 0) || !(mu > 0)) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 46. `core/lambert/lambert-multi-rev.ts:287` — `lambertMultiRev` — relational-swap
```diff
- if (!(tof > 0) || !(mu > 0)) {
+ if (!(tof > 0) || !(mu >= 0)) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 47. `core/lambert/stumpff.ts:24` — `stumpff_c2` — relational-swap
```diff
- if (psi > SERIES_CUTOFF) {
+ if (psi >= SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 48. `core/lambert/stumpff.ts:28` — `stumpff_c2` — relational-swap
```diff
- if (psi < -SERIES_CUTOFF) {
+ if (psi <= -SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 49. `core/lambert/stumpff.ts:36` — `stumpff_c3` — relational-swap
```diff
- if (psi > SERIES_CUTOFF) {
+ if (psi >= SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 50. `core/lambert/stumpff.ts:40` — `stumpff_c3` — relational-swap
```diff
- if (psi < -SERIES_CUTOFF) {
+ if (psi <= -SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 51. `core/lambert/tof.ts:31` — `compute_y` — relational-swap
```diff
- if (arg < 0) return NaN;
+ if (arg <= 0) return NaN;
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 52. `core/propagators/keplerian.ts:113` — `solveKeplerEquation` — relational-swap
```diff
- if (eccentricity < 0 || eccentricity >= 1) {
+ if (eccentricity < 0 || eccentricity > 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 53. `core/propagators/keplerian.ts:120` — `solveKeplerEquation` — relational-swap
```diff
- let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
+ let eccentricAnomaly = eccentricity <= 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 54. `core/propagators/keplerian.ts:120` — `solveKeplerEquation` — relational-swap
```diff
- let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
+ let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly > 0 ? Math.PI : -Math.PI);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 55. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — relational-swap
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration <= maxIterations; iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 56. `core/propagators/keplerian.ts:205` — `propagateKeplerianStateVectors` — relational-swap
```diff
- if (gmM3S2 <= 0) {
+ if (gmM3S2 < 0) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 57. `porkchop/compare-data.ts:278` — `computeCompareData` — relational-swap
```diff
- params.depStartJdTdb < params.earthSpanJdTdb.firstSample ||
+ params.depStartJdTdb <= params.earthSpanJdTdb.firstSample ||
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 58. `porkchop/composite-grid.ts:193` — `minSelectedC3` — relational-swap
```diff
- if (best === null || c3 < best.c3) {
+ if (best === null || c3 <= best.c3) {
```
Layer math. 1 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 59. `porkchop/format-c3.ts:20` — `formatC3` — relational-swap
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude <= 1e-4 || magnitude >= 1e5)) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(1e-4): assert '0.000100' (the mutant returns '1.00e-4').
Assessment: Boundary not tested: |C3| exactly 1e-4, where the format switches to exponential.

### 60. `porkchop/format-c3.ts:20` — `formatC3` — relational-swap
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude < 1e-4 || magnitude > 1e5)) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(1e5): assert '1.00e+5' (the mutant returns '100000').
Assessment: Boundary not tested: |C3| exactly 1e5.

### 61. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — relational-swap
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 0; index <= vehicle.curve.length - 1; index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 62. `porkchop/launch-vehicles.ts:232` — `payloadAtC3` — relational-swap
```diff
- if (left.c3 < c3 && c3 < right.c3) {
+ if (left.c3 <= c3 && c3 < right.c3) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 63. `porkchop/propagation-guard.ts:79` — `assessPropagation` — relational-swap
```diff
- if (elements.aM <= 0) {
+ if (elements.aM < 0) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with aM = 0 on otherwise valid elements: assert the refusal and reason === 'non-positive-semi-major-axis'.
Assessment: Boundary not tested: aM exactly 0.

### 64. `porkchop/propagation-guard.ts:82` — `assessPropagation` — relational-swap
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e <= 0 || elements.e >= 1) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with e = 0 and aM > 0: assert propagatable === true.
Assessment: Boundary not tested: e exactly 0. Under the mutant a circular orbit would be refused.

### 65. `porkchop/propagation-guard.ts:82` — `assessPropagation` — relational-swap
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e < 0 || elements.e > 1) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with e = 1 and aM > 0: assert the refusal and reason === 'eccentricity-not-elliptical'.
Assessment: Boundary not tested: e exactly 1 with a positive semi-major axis.

### 66. `porkchop/segment-windows.ts:220` — `segmentWindows` — sign-flip
```diff
- let argDep = -1;
+ let argDep = 1;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 67. `porkchop/segment-windows.ts:221` — `segmentWindows` — sign-flip
```diff
- let argTof = -1;
+ let argTof = 1;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 68. `porkchop/segment-windows.ts:235` — `segmentWindows` — relational-swap
```diff
- c3 < minC3 ||
+ c3 <= minC3 ||
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 69. `porkchop/segment-windows.ts:236` — `segmentWindows` — relational-swap
```diff
- (c3 === minC3 && (depIdx < argDep || (depIdx === argDep && tofIdx < argTof)))
+ (c3 === minC3 && (depIdx <= argDep || (depIdx === argDep && tofIdx < argTof)))
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 70. `porkchop/segment-windows.ts:242` — `segmentWindows` — relational-swap
```diff
- if (depIdx < minDep) minDep = depIdx;
+ if (depIdx <= minDep) minDep = depIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 71. `porkchop/segment-windows.ts:243` — `segmentWindows` — relational-swap
```diff
- if (depIdx > maxDep) maxDep = depIdx;
+ if (depIdx >= maxDep) maxDep = depIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 72. `porkchop/segment-windows.ts:245` — `segmentWindows` — relational-swap
```diff
- if (tofIdx > maxTof) maxTof = tofIdx;
+ if (tofIdx >= maxTof) maxTof = tofIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 73. `porkchop/segment-windows.ts:250` — `segmentWindows` — relational-swap
```diff
- if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) {
+ if (nDepIdx < 0 || nDepIdx > nDep || nTofIdx < 0 || nTofIdx >= nTof) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 74. `porkchop/segment-windows.ts:250` — `segmentWindows` — relational-swap
```diff
- if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) {
+ if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx > nTof) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 75. `porkchop/tier-disclosure.ts:63` — `formatMillionKm` — relational-swap
```diff
- if (!Number.isFinite(km) || km <= 0) {
+ if (!Number.isFinite(km) || km < 0) {
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: formatMillionKm(0): assert null (the mutant returns '0 million').
Assessment: Boundary not tested: a drift of exactly 0 km.

### 76. `porkchop/tier-disclosure.ts:72` — `formatMetersPerSecond` — relational-swap
```diff
- if (!Number.isFinite(dvKmS) || dvKmS < 0) {
+ if (!Number.isFinite(dvKmS) || dvKmS <= 0) {
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(0): assert '0.0' (the mutant returns null).
Assessment: Boundary not tested: a delta-v of exactly 0.

### 77. `porkchop/tier-disclosure.ts:76` — `formatMetersPerSecond` — relational-swap
```diff
- if (mps >= 100) {
+ if (mps > 100) {
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(0.1): assert '100' (the mutant returns '100.0').
Assessment: Boundary not tested: exactly 100 m/s, where the format switches from one decimal to a grouped integer.

### 78. `core/frames/transform.ts:213` — `transformCanonicalState` — argument-swap
```diff
- assertSupportedTransform(fromFrame, toFrame);
+ assertSupportedTransform(toFrame, fromFrame);
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 79. `core/frames/transform.ts:244` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, earthState!.positionM),
+ positionM: addVec3(earthState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 80. `core/frames/transform.ts:245` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, earthState!.velocityMps),
+ velocityMps: addVec3(earthState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 81. `core/frames/transform.ts:271` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, marsState!.positionM),
+ positionM: addVec3(marsState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 82. `core/frames/transform.ts:272` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, marsState!.velocityMps),
+ velocityMps: addVec3(marsState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 83. `core/frames/transform.ts:289` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, saturnState!.positionM),
+ positionM: addVec3(saturnState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 84. `core/frames/transform.ts:290` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, saturnState!.velocityMps),
+ velocityMps: addVec3(saturnState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 85. `core/frames/transform.ts:297` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, jupiterState!.positionM),
+ positionM: addVec3(jupiterState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 86. `core/frames/transform.ts:298` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, jupiterState!.velocityMps),
+ velocityMps: addVec3(jupiterState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 87. `core/interpolators/hermite.ts:102` — `interpolateBodyStateSeries` — arithmetic-swap
```diff
- for (let i = 0; i < samples.length - 1; i++) {
+ for (let i = 0; i < samples.length + 1; i++) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 88. `core/interpolators/hermite.ts:106` — `interpolateBodyStateSeries` — argument-swap
```diff
- return interpolateBodyState(s0, s1, tdbSeconds);
+ return interpolateBodyState(s1, s0, tdbSeconds);
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 89. `core/interpolators/hermite.ts:117` — `interpolateBodyStateSeries` — arithmetic-swap
```diff
- maxTdbSeconds: samples[samples.length - 1]?.tdbSeconds ?? samples[0].tdbSeconds,
+ maxTdbSeconds: samples[samples.length + 1]?.tdbSeconds ?? samples[0].tdbSeconds,
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 90. `core/invariants/assertions.ts:173` — `assertInterpolationError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx - dy * dy + dz * dz);
```
Layer honesty. 7 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Same test: an error just over the bar spread across all three axes must fire the invariant; add a y-only case.
Assessment: Same gap as the previous mutant, on the y term.

### 91. `core/invariants/assertions.ts:173` — `assertInterpolationError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx + dy * dy - dz * dz);
```
Layer honesty. 7 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: assertInterpolationError with the estimate displaced by bar x 0.6 on each of x, y and z (norm about 1.04 x bar): assert the invariant fires. Repeat with the displacement on z only.
Assessment: REAL GAP (the interpolation error-bar invariant). With a minus sign in the norm, an error that is mostly along z gives a negative radicand, the square root is NaN, NaN > bar is false, and the invariant stays silent. The tests never present a failing case with error on more than one axis.

### 92. `core/invariants/assertions.ts:201` — `assertKeplerianError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx - dy * dy + dz * dz);
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Same test, plus a y-only displacement just over the bar.
Assessment: Same gap as the previous mutant, on the y term.

### 93. `core/invariants/assertions.ts:201` — `assertKeplerianError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx + dy * dy - dz * dz);
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: assertKeplerianError with the estimate displaced by bar x 0.6 on each axis, and with a z-only displacement just over the bar: assert INV-012 fires.
Assessment: REAL GAP (INV-012, the Keplerian error bar). Same mechanism as the interpolation assertion: a z-dominated error makes the radicand negative and the assertion can no longer fire.

### 94. `core/invariants/assertions.ts:209` — `assertKeplerianError` — arithmetic-swap
```diff
- measuredErrorKm: errorM / 1000,
+ measuredErrorKm: errorM * 1000,
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: On a failing assertKeplerianError call, assert context.measuredErrorKm equals the displacement in km.
Assessment: The failure's reported context is not asserted: tests check that INV-012 fires, not the measuredErrorKm it reports. Under the mutant the reported error is a million times too large.

### 95. `core/invariants/assertions.ts:210` — `assertKeplerianError` — arithmetic-swap
```diff
- barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M / 1000,
+ barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M * 1000,
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: On a failing assertKeplerianError call, assert context.barKm === 100000.
Assessment: The failure's reported bar (barKm) is not asserted.

### 96. `core/invariants/round-trip.ts:43` — `computeFrameRoundTripRelativeError` — argument-swap
```diff
- return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
+ return sixAxisDiffNorm(sample, roundTripped) / Math.max(sixAxisNorm(sample), 1);
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. sixAxisDiffNorm is a hypot of differences, so swapping its arguments cannot change the value.

### 97. `core/invariants/round-trip.ts:43` — `computeFrameRoundTripRelativeError` — argument-swap
```diff
- return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
+ return sixAxisDiffNorm(roundTripped, sample) / Math.max(1, sixAxisNorm(sample));
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.max is commutative.

### 98. `core/lambert/dla.ts:20` — `dlaDegFromVInf` — argument-swap
```diff
- const mag = Math.hypot(vx, vy, vz);
+ const mag = Math.hypot(vy, vx, vz);
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 99. `core/lambert/dla.ts:20` — `dlaDegFromVInf` — argument-swap
```diff
- const mag = Math.hypot(vx, vy, vz);
+ const mag = Math.hypot(vx, vz, vy);
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 100. `core/lambert/householder.ts:56` — `householder` — arithmetic-swap
```diff
- const numerator = fval * (fder * fder - (fval * fder2) / 2);
+ const numerator = fval * (fder * fder - (fval / fder2) / 2);
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 101. `core/lambert/householder.ts:57` — `householder` — arithmetic-swap
```diff
- const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / 6;
+ const denominator = fder * (fder * fder - fval * fder2) - (fder3 * fval * fval) / 6;
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 102. `core/lambert/izzo.ts:103` — `lambert` — argument-swap
```diff
- let lam = Math.sqrt(1 - Math.min(1.0, c_norm / s));
+ let lam = Math.sqrt(1 - Math.min(c_norm / s, 1.0));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 103. `core/lambert/izzo.ts:109` — `lambert` — argument-swap
```diff
- i_t1 = cross(i_r1, i_h);
+ i_t1 = cross(i_h, i_r1);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 104. `core/lambert/stumpff.ts:26` — `stumpff_c2` — arithmetic-swap
```diff
- return (1 - Math.cos(sq)) / psi;
+ return (1 - Math.cos(sq)) * psi;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 105. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 - (psi * psi) / 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 106. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) * 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 107. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / 720 + (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 108. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) * 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 109. `core/lambert/stumpff.ts:38` — `stumpff_c3` — arithmetic-swap
```diff
- return (sq - Math.sin(sq)) / (psi * sq);
+ return (sq - Math.sin(sq)) * (psi * sq);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 110. `core/lambert/stumpff.ts:42` — `stumpff_c3` — arithmetic-swap
```diff
- return (Math.sinh(sq) - sq) / (-psi * sq);
+ return (Math.sinh(sq) - sq) / (-psi / sq);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 111. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 + psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 112. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 - (psi * psi) / 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 113. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) * 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 114. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / 5040 + (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 115. `core/lambert/vec3.ts:44` — `normalize` — arithmetic-swap
```diff
- return [a[0] / n, a[1] / n, a[2] / n];
+ return [a[0] / n, a[1] / n, a[2] * n];
```
Layer math. 1 test file(s) executed this function and still passed (23 import the module): `v2-lambert/vec3.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 116. `porkchop/compare-data.ts:259` — `computeCompareData` — argument-swap
```diff
- const tofCellDays = cellWidth(params.tofMinDays, params.tofMaxDays, params.nTof);
+ const tofCellDays = cellWidth(params.tofMaxDays, params.tofMinDays, params.nTof);
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 117. `porkchop/compare-data.ts:259` — `computeCompareData` — argument-swap
```diff
- const tofCellDays = cellWidth(params.tofMinDays, params.tofMaxDays, params.nTof);
+ const tofCellDays = cellWidth(params.tofMinDays, params.nTof, params.tofMaxDays);
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 118. `porkchop/compare-data.ts:270` — `computeCompareData` — arithmetic-swap
```diff
- `'${body.bodyId}' is selection ${index + 1} of ${bodies.length}`,
+ `'${body.bodyId}' is selection ${index - 1} of ${bodies.length}`,
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 119. `porkchop/compare-data.ts:364` — `computeCompareData` — arithmetic-swap
```diff
- params.dvBudget.marginMps +
+ params.dvBudget.marginMps -
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 120. `porkchop/delta-v.ts:23` — `injectionDvFromC3` — arithmetic-swap
```diff
- const circularVelocityKmps = Math.sqrt(muKm3PerS2 / parkingRadiusKm);
+ const circularVelocityKmps = Math.sqrt(muKm3PerS2 * parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 121. `porkchop/delta-v.ts:24` — `injectionDvFromC3` — arithmetic-swap
```diff
- const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) / parkingRadiusKm);
+ const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) * parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 122. `porkchop/delta-v.ts:25` — `injectionDvFromC3` — arithmetic-swap
```diff
- return hyperbolicPerigeeVelocityKmps - circularVelocityKmps;
+ return hyperbolicPerigeeVelocityKmps + circularVelocityKmps;
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 123. `porkchop/delta-v.ts:56` — `buildDeltaVStack` — arithmetic-swap
```diff
- totalKmps: subtotalKmps + marginKmps,
+ totalKmps: subtotalKmps - marginKmps,
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 124. `porkchop/grid-compute.ts:164` — `computePorkchopGrid` — argument-swap
```diff
- const depGridJd = buildLinspace(gridParams.depStartJD, gridParams.depEndJD, gridParams.nDep);
+ const depGridJd = buildLinspace(gridParams.depEndJD, gridParams.depStartJD, gridParams.nDep);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 125. `porkchop/grid-compute.ts:165` — `computePorkchopGrid` — argument-swap
```diff
- const tofGridDays = buildLinspace(gridParams.tofMinDays, gridParams.tofMaxDays, gridParams.nTof);
+ const tofGridDays = buildLinspace(gridParams.tofMaxDays, gridParams.tofMinDays, gridParams.nTof);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 126. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — arithmetic-swap
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 0; index < vehicle.curve.length + 1; index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 127. `porkchop/segment-windows.ts:104` — `compareByMinC3` — arithmetic-swap
```diff
- return a.argmin.depJd - b.argmin.depJd;
+ return a.argmin.depJd + b.argmin.depJd;
```
Layer math. 2 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 128. `porkchop/segment-windows.ts:106` — `compareByMinC3` — arithmetic-swap
```diff
- return a.argmin.tofDays - b.argmin.tofDays;
+ return a.argmin.tofDays + b.argmin.tofDays;
```
Layer math. 2 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 129. `porkchop/support-boundary.ts:55` — `boundaryTofDaysAtDeparture` — arithmetic-swap
```diff
- return boundary.encounterJd - depJD;
+ return boundary.encounterJd + depJD;
```
Layer honesty. No test executes `boundaryTofDaysAtDeparture` (16 test file(s) import the module; none calls it).
Suggested test: boundaryTofDaysAtDeparture(depJD, boundary) for a known encounter: assert encounterJd - depJD, and that isArrivalAfterEncounter flips exactly at that TOF.
Assessment: No test calls boundaryTofDaysAtDeparture at all (measured by function coverage), although it is exported and draws the support boundary curve.

### 130. `core/lambert/lambert-multi-rev.ts:130` — `halleyForTMin` — relational-swap (module-private helper)
```diff
- if (Math.abs(next - x) < RTOL) {
+ if (Math.abs(next - x) <= RTOL) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 131. `core/lambert/tof.ts:45` — `compute_psi` — relational-swap (module-private helper)
```diff
- if (x > 1) {
+ if (x >= 1) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 132. `core/propagators/keplerian.ts:56` — `validateKeplerianElements` — relational-swap (module-private helper)
```diff
- if (elements.aM <= 0) {
+ if (elements.aM < 0) {
```
Layer math. 11 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 133. `core/interpolators/hermite.ts:102` — `interpolateBodyStateSeries` — loop-bound-plus-1
```diff
- for (let i = 0; i < samples.length - 1; i++) {
+ for (let i = 0; i < ((samples.length - 1) + 1); i++) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 134. `core/invariants/round-trip.ts:16` — `sixAxisNorm` — argument-swap (module-private helper)
```diff
- state.velocityMps.y,
+ (multi-line statement replaced by: state.velocityMps.z,
    state.velocityMps.y)
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 135. `core/lambert/householder.ts:48` — `householder` — loop-start-plus-1
```diff
- for (let iter = 1; iter <= max_iter; iter++) {
+ for (let iter = 2; iter <= max_iter; iter++) {
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 136. `core/lambert/hyp2f1b.ts:28` — `hyp2f1b` — loop-bound-minus-1
```diff
- for (let n = 0; n < MAX_ITER; n++) {
+ for (let n = 0; n < ((MAX_ITER) - 1); n++) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 137. `core/lambert/lambert-multi-rev.ts:124` — `halleyForTMin` — arithmetic-swap (module-private helper)
```diff
- const denominator = 2 * fDoublePrime * fDoublePrime - fPrime * fTriplePrime;
+ const denominator = 2 * fDoublePrime * fDoublePrime + fPrime * fTriplePrime;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 138. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — loop-start-plus-1
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 1; iteration < maxIterations; iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 139. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — loop-bound-minus-1
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < ((maxIterations) - 1); iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 140. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — loop-bound-plus-1
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < ((maxIterations) + 1); iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 141. `porkchop/grid-compute.ts:120` — `mapBranches` — argument-swap (module-private helper)
```diff
- const vInfArr = magnitude3(vInfArrX, vInfArrY, vInfArrZ);
+ const vInfArr = magnitude3(vInfArrY, vInfArrX, vInfArrZ);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 142. `core/invariants/assertions.ts:209` — `assertKeplerianError` — constant-nudge
```diff
- measuredErrorKm: errorM / 1000,
+ measuredErrorKm: errorM / (1000 * 1.001),
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Same assertion, to better than 0.1%.
Assessment: Same unasserted context value as the previous mutant.

### 143. `core/invariants/assertions.ts:210` — `assertKeplerianError` — constant-nudge
```diff
- barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M / 1000,
+ barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M / (1000 * 1.001),
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Same assertion, exact.
Assessment: Same unasserted context value as the previous mutant.

### 144. `core/invariants/round-trip.ts:43` — `computeFrameRoundTripRelativeError` — constant-nudge
```diff
- return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
+ return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), (1 * 1.001));
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed unless near-zero states become a supported input.
Assessment: Equivalent in practice: the floor of 1 only matters for a state whose six-axis norm is between 1 and 1.001 (metres and metres per second); real states are ~1e11.

### 145. `core/lambert/dla.ts:28` — `dlaDegFromVInf` — constant-nudge
```diff
- const sinDla = Math.min(1, Math.max(-1, vz / mag));
+ const sinDla = Math.min((1 * 1.001), Math.max(-1, vz / mag));
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 146. `core/lambert/householder.ts:56` — `householder` — constant-nudge
```diff
- const numerator = fval * (fder * fder - (fval * fder2) / 2);
+ const numerator = fval * (fder * fder - (fval * fder2) / (2 * 1.001));
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 147. `core/lambert/householder.ts:57` — `householder` — constant-nudge
```diff
- const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / 6;
+ const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / (6 * 1.001);
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 148. `core/lambert/izzo.ts:70` — `lambert` — constant-nudge
```diff
- const max_iter = opts.max_iter ?? 35;
+ const max_iter = opts.max_iter ?? (35 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 149. `core/lambert/izzo.ts:119` — `lambert` — constant-nudge
```diff
- i_t2 = scale(i_t2, -1);
+ i_t2 = scale(i_t2, -(1 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 150. `core/lambert/stumpff.ts:32` — `stumpff_c2` — constant-nudge
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / (24 * 1.001) + (psi * psi) / 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 151. `core/lambert/stumpff.ts:32` — `stumpff_c2` — constant-nudge
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / (720 * 1.001) - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 152. `core/lambert/stumpff.ts:32` — `stumpff_c2` — constant-nudge
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / (40320 * 1.001);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 153. `core/lambert/stumpff.ts:44` — `stumpff_c3` — constant-nudge
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / (120 * 1.001) + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 154. `core/lambert/stumpff.ts:44` — `stumpff_c3` — constant-nudge
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / (5040 * 1.001) - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 155. `core/lambert/stumpff.ts:44` — `stumpff_c3` — constant-nudge
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / (362880 * 1.001);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 156. `core/propagators/keplerian.ts:113` — `solveKeplerEquation` — constant-nudge
```diff
- if (eccentricity < 0 || eccentricity >= 1) {
+ if (eccentricity < 0 || eccentricity >= (1 * 1.001)) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 157. `core/propagators/keplerian.ts:117` — `solveKeplerEquation` — constant-nudge
```diff
- const tolerance = options.toleranceRad ?? 1e-12;
+ const tolerance = options.toleranceRad ?? (1e-12 * 1.001);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 158. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — constant-nudge
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < maxIterations; iteration += (1 * 1.001)) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 159. `porkchop/compare-data.ts:270` — `computeCompareData` — constant-nudge
```diff
- `'${body.bodyId}' is selection ${index + 1} of ${bodies.length}`,
+ `'${body.bodyId}' is selection ${index + (1 * 1.001)} of ${bodies.length}`,
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 160. `porkchop/composite-grid.ts:139` — `compositeGrids` — constant-nudge
```diff
- fromM0 += 1;
+ fromM0 += (1 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 161. `porkchop/composite-grid.ts:159` — `compositeGrids` — constant-nudge
```diff
- fromM1 += 1;
+ fromM1 += (1 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 162. `porkchop/delta-v.ts:24` — `injectionDvFromC3` — constant-nudge
```diff
- const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) / parkingRadiusKm);
+ const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + ((2 * 1.001) * muKm3PerS2) / parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 163. `porkchop/format-c3.ts:20` — `formatC3` — constant-nudge
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude < (1e-4 * 1.001) || magnitude >= 1e5)) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(1.0005e-4): assert the plain (non-exponential) form.
Assessment: Same switch point as the line above, reached through the constant.

### 164. `porkchop/format-c3.ts:20` — `formatC3` — constant-nudge
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= (1e5 * 1.001))) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(100_050): assert the exponential form.
Assessment: Same switch point as the line above, reached through the constant.

### 165. `porkchop/format-c3.ts:21` — `formatC3` — constant-nudge
```diff
- return c3.toExponential(2);
+ return c3.toExponential((2 * 1.001));
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toExponential truncates its argument to an integer.

### 166. `porkchop/format-c3.ts:23` — `formatC3` — constant-nudge
```diff
- const precise = c3.toPrecision(3);
+ const precise = c3.toPrecision((3 * 1.001));
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toPrecision truncates its argument to an integer.

### 167. `porkchop/propagation-guard.ts:82` — `assessPropagation` — constant-nudge
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e < 0 || elements.e >= (1 * 1.001)) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with e = 1.0005 and aM > 0: assert the refusal.
Assessment: Same boundary as the line above, reached through the constant: e in [1, 1.001) with aM > 0 is never tested.

### 168. `porkchop/segment-windows.ts:205` — `segmentWindows` — constant-nudge
```diff
- member[i] = 1;
+ member[i] = (1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 169. `porkchop/segment-windows.ts:217` — `segmentWindows` — constant-nudge
```diff
- visited[seed] = 1;
+ visited[seed] = (1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 170. `porkchop/segment-windows.ts:220` — `segmentWindows` — constant-nudge
```diff
- let argDep = -1;
+ let argDep = -(1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 171. `porkchop/segment-windows.ts:255` — `segmentWindows` — constant-nudge
```diff
- visited[nIdx] = 1;
+ visited[nIdx] = (1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 172. `porkchop/tier-disclosure.ts:66` — `formatMillionKm` — constant-nudge
```diff
- const millions = Number((km / 1e6).toPrecision(3));
+ const millions = Number((km / (1e6 * 1.001)).toPrecision(3));
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: formatMillionKm(253_600_000): assert '254 million' (the mutant gives '253 million').
Assessment: Weak gap. The tested value rounds to the same three significant figures after a 0.1% change, so the divisor is pinned only to about 0.2%.

### 173. `porkchop/tier-disclosure.ts:66` — `formatMillionKm` — constant-nudge
```diff
- const millions = Number((km / 1e6).toPrecision(3));
+ const millions = Number((km / 1e6).toPrecision((3 * 1.001)));
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toPrecision truncates its argument to an integer.

### 174. `porkchop/tier-disclosure.ts:76` — `formatMetersPerSecond` — constant-nudge
```diff
- if (mps >= 100) {
+ if (mps >= (100 * 1.001)) {
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(0.10005): assert '100' (the mutant returns '100.0' or '100.1').
Assessment: Same switch point as the line above, reached through the constant.

### 175. `porkchop/tier-disclosure.ts:79` — `formatMetersPerSecond` — constant-nudge
```diff
- return mps.toFixed(1);
+ return mps.toFixed((1 * 1.001));
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toFixed truncates its argument to an integer, so toFixed(1.001) is toFixed(1).

### 176. `porkchop/tier-disclosure.ts:83` — `formatAu` — constant-nudge
```diff
- return Number.isFinite(au) ? au.toFixed(2) : null;
+ return Number.isFinite(au) ? au.toFixed((2 * 1.001)) : null;
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toFixed truncates its argument to an integer, so toFixed(2.002) is toFixed(2).

### 177. `core/lambert/lambert-multi-rev.ts:99` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const x0Left = (leftBase - 1) / (leftBase + 1);
+ const x0Left = (leftBase - (1 * 1.001)) / (leftBase + 1);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 178. `porkchop/porkchop-client.ts:44` — `createPorkchopClient` — guard-removal
```diff
- if (!message || typeof message !== 'object') { return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 179. `porkchop/colormap.ts:49` — `c3ToViridisRgb` — relational-swap
```diff
- if (normalized > next.t) {
+ if (normalized >= next.t) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

