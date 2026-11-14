# LR3 — every surviving mutant, ranked by risk

**LEADS-grade research evidence. A surviving mutant is a lead, not a verdict: some survivors are equivalent mutants (the change cannot alter any output).**

State: COMPLETE. 951 survivors. "Suggested test" is a suggestion only; no test was written.

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

### 41. `porkchop/tier-disclosure.ts:116` — `fullTierDisclosure` — guard-removal
```diff
- if (date === null || dv === null) { return null; }
+ ;
```
Layer honesty. 5 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: fullTierDisclosure for a 'materially-degraded-delta-v' record with an unparseable encounter.cd, and for one with encounter.dvKmS = NaN: assert the result is null.
Assessment: REAL GAP (honesty). Without this guard a record whose date or delta-v cannot be formatted produces a disclosure sentence containing the text 'null' instead of no sentence. No test feeds fullTierDisclosure such a record.

### 42. `core/constants/asteroids.ts:56` — `assertFinitePositive` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(value) || value <= 0) { throw new Error(`${label} must be a finite positive number`); }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-slice9-live-runtime-integration.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: Call a public function that uses it with 0 and assert the error.
Assessment: Boundary not tested: a value of exactly 0.

### 43. `core/constants/asteroids.ts:62` — `isAsteroidBodyId` — relational-swap
```diff
- return bodyId.startsWith('asteroid-') && bodyId.length > 'asteroid-'.length;
+ return bodyId.startsWith('asteroid-') && bodyId.length >= 'asteroid-'.length;
```
Layer math. 2 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-runtime-focus.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 44. `core/constants/asteroids.ts:91` — `eccentricityBandForBody` — relational-swap
```diff
- if (!Number.isFinite(eccentricity) || eccentricity < 0) {
+ if (!Number.isFinite(eccentricity) || eccentricity <= 0) {
```
Layer math. 11 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 45. `core/frames/transform.ts:63` — `resolveHeliocentricAnchorState` — guard-removal (module-private helper)
```diff
- if (!provider) { failInvariant( 'INV-004', `${label} heliocentric anchor provider is not configured for frame transforms`, { tdbSeconds, frame } ); throw new Error('unrea ...
+ ;
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 46. `core/interpolators/hermite.ts:102` — `interpolateBodyStateSeries` — relational-swap
```diff
- for (let i = 0; i < samples.length - 1; i++) {
+ for (let i = 0; i <= samples.length - 1; i++) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 47. `core/interpolators/hermite.ts:105` — `interpolateBodyStateSeries` — relational-swap
```diff
- if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
+ if (tdbSeconds >= s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): an epoch equal to a sample time returns from the exact-match loop above, so the strict and non-strict comparisons agree on every reachable input. Equivalent.

### 48. `core/interpolators/hermite.ts:105` — `interpolateBodyStateSeries` — relational-swap
```diff
- if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
+ if (tdbSeconds > s0.tdbSeconds && tdbSeconds <= s1.tdbSeconds) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): an epoch equal to a sample time returns from the exact-match loop above, so the strict and non-strict comparisons agree on every reachable input. Equivalent.

### 49. `core/invariants/assertions.ts:49` — `invariantObject` — guard-removal (module-private helper)
```diff
- if (state === null || typeof state !== 'object' || Array.isArray(state)) { failInvariant(invariantId, message, { receivedType: typeof state }); throw new Error('unreachable'); }
+ ;
```
Layer honesty. 34 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice6.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-boundary-horizons.test.mjs`, `v2-boundary-slice2.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-slice2-cutover.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-boundary-slice4.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-dla-render.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 50. `core/invariants/assertions.ts:177` — `assertInterpolationError` — relational-swap
```diff
- if (errorM > barM) {
+ if (errorM >= barM) {
```
Layer honesty. 7 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: assertInterpolationError with a single-axis displacement of exactly the bar: assert it does NOT fire.
Assessment: Boundary not tested: an error exactly equal to the bar (the code allows it; the mutant refuses it).

### 51. `core/invariants/assertions.ts:203` — `assertKeplerianError` — relational-swap
```diff
- if (errorM > ASTEROID_KEPLERIAN_ERROR_BAR_M) {
+ if (errorM >= ASTEROID_KEPLERIAN_ERROR_BAR_M) {
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: assertKeplerianError with a single-axis displacement of exactly ASTEROID_KEPLERIAN_ERROR_BAR_M: assert it does NOT fire.
Assessment: Boundary not tested: an error exactly equal to the 100,000 km bar.

### 52. `core/invariants/round-trip.ts:54` — `assertFrameRoundTrip` — relational-swap
```diff
- if (relativeError >= FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR) {
+ if (relativeError > FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR) {
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Hard to construct with real transforms; a unit test of the comparison with an injected error value would pin it. Low priority.
Assessment: Boundary not tested: a round-trip error exactly equal to 10 x Number.EPSILON.

### 53. `core/lambert/dla.ts:24` — `dlaDegFromVInf` — relational-swap
```diff
- if (!Number.isFinite(mag) || mag < epsilonMag) {
+ if (!Number.isFinite(mag) || mag <= epsilonMag) {
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: dlaDegFromVInf with a magnitude exactly at the epsilon: assert the documented side.
Assessment: Boundary not tested: |v-infinity| exactly equal to the epsilon below which DLA is refused.

### 54. `core/lambert/householder.ts:48` — `householder` — relational-swap
```diff
- for (let iter = 1; iter <= max_iter; iter++) {
+ for (let iter = 1; iter < max_iter; iter++) {
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed unless the iteration budget is ever tightened.
Assessment: Reading (not executed): one iteration fewer in a budget of 35+; convergence takes a handful. Equivalent for every tested input.

### 55. `core/lambert/householder.ts:61` — `householder` — relational-swap
```diff
- if (Math.abs(delta) < rtol) {
+ if (Math.abs(delta) <= rtol) {
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: An assertion on the iteration count for a reference single-rev case.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 56. `core/lambert/hyp2f1b.ts:28` — `hyp2f1b` — relational-swap
```diff
- for (let n = 0; n < MAX_ITER; n++) {
+ for (let n = 0; n <= MAX_ITER; n++) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: hyp2f1b pinned against a reference value at x = 0.9 to 1e-9 (the accuracy the solver header claims) would catch a series stopped early.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. (Here the "root-finder" is a series summed until it stops changing.)

### 57. `core/lambert/hyp2f1b.ts:31` — `hyp2f1b` — relational-swap
```diff
- if (Math.abs(newResult - result) < RTOL * Math.abs(newResult)) {
+ if (Math.abs(newResult - result) <= RTOL * Math.abs(newResult)) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: hyp2f1b pinned against a reference value at x = 0.9 to 1e-9 (the accuracy the solver header claims) would catch a series stopped early.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. (Here the "root-finder" is a series summed until it stops changing.)

### 58. `core/lambert/initial-guess.ts:32` — `initial_guess_single_rev` — relational-swap
```diff
- if (T >= T_0) {
+ if (T > T_0) {
```
Layer math. 6 test file(s) executed this function and still passed (24 import the module): `v2-lambert/initial-guess.test.mjs`, `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Boundaries not tested: T exactly equal to T_0 or T_1, where the initial-guess formula switches. Reading: the solver converges from either formula.

### 59. `core/lambert/initial-guess.ts:34` — `initial_guess_single_rev` — relational-swap
```diff
- } else if (T <= T_1) {
+ } else if (T < T_1) {
```
Layer math. 6 test file(s) executed this function and still passed (24 import the module): `v2-lambert/initial-guess.test.mjs`, `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Boundaries not tested: T exactly equal to T_0 or T_1, where the initial-guess formula switches. Reading: the solver converges from either formula.

### 60. `core/lambert/izzo.ts:107` — `lambert` — relational-swap
```diff
- if (i_h[2] < 0) {
+ if (i_h[2] <= 0) {
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 61. `core/lambert/izzo.ts:108` — `lambert` — sign-flip
```diff
- lam = -lam;
+ lam = lam;
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 62. `core/lambert/izzo.ts:117` — `lambert` — sign-flip
```diff
- lam = -lam;
+ lam = lam;
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 63. `core/lambert/izzo.ts:118` — `lambert` — sign-flip
```diff
- i_t1 = scale(i_t1, -1);
+ i_t1 = scale(i_t1, 1);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 64. `core/lambert/izzo.ts:119` — `lambert` — sign-flip
```diff
- i_t2 = scale(i_t2, -1);
+ i_t2 = scale(i_t2, 1);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 65. `core/lambert/lambert-multi-rev.ts:113` — `halleyForTMin` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(y) || y === 0) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 66. `core/lambert/lambert-multi-rev.ts:120` — `halleyForTMin` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(fPrime) || !Number.isFinite(fDoublePrime) || fDoublePrime === 0) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 67. `core/lambert/lambert-multi-rev.ts:125` — `halleyForTMin` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(fTriplePrime) || !Number.isFinite(denominator) || denominator === 0) { return null; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 68. `core/lambert/lambert-multi-rev.ts:161` — `solveOneBranch` — guard-removal (module-private helper)
```diff
- if (x * x > MULTI_REV_X_SQUARED_LIMIT) { return { x, converged: false }; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An M = 1 input whose right-branch root lies beyond x = sqrt(0.90) = 0.9487 (large normalized T): assert the result is non-null and that branch has converged === false. The assertion must not accept null.
Assessment: REAL GAP, measured with a second-order check. solveOneBranch has two fail-closed checks on x squared > 0.90: one on x at the top of the loop (line 161) and one on the new iterate (line 195). Each survives alone because the other refuses the same case one step later. Deleting BOTH at once (done by hand in a spare throwaway copy, outside the campaign) still leaves lambert-multi-rev.test.mjs and grid-compute.test.mjs passing - the only two test files that execute this function. Read from the test: its boundary-case block accepts either a null result or all-non-converged branches, and its other M = 1 case has x squared well under the limit. So no committed test fails when the 0.90 fail-closed limit is removed entirely.

### 69. `core/lambert/lambert-multi-rev.ts:166` — `solveOneBranch` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(y) || y === 0) { return { x, converged: false }; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 70. `core/lambert/lambert-multi-rev.ts:179` — `solveOneBranch` — guard-removal (module-private helper)
```diff
- if ( !Number.isFinite(fValue) || !Number.isFinite(fPrime) || !Number.isFinite(fDoublePrime) || !Number.isFinite(fTriplePrime) || !Number.isF ...
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 71. `core/lambert/lambert-multi-rev.ts:192` — `solveOneBranch` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(next)) { return { x, converged: false }; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 72. `core/lambert/lambert-multi-rev.ts:195` — `solveOneBranch` — guard-removal (module-private helper)
```diff
- if (next * next > MULTI_REV_X_SQUARED_LIMIT) { return { x: next, converged: false }; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An M = 1 input whose right-branch root lies beyond x = sqrt(0.90) = 0.9487 (large normalized T): assert the result is non-null and that branch has converged === false. The assertion must not accept null.
Assessment: REAL GAP, measured with a second-order check. solveOneBranch has two fail-closed checks on x squared > 0.90: one on x at the top of the loop (line 161) and one on the new iterate (line 195). Each survives alone because the other refuses the same case one step later. Deleting BOTH at once (done by hand in a spare throwaway copy, outside the campaign) still leaves lambert-multi-rev.test.mjs and grid-compute.test.mjs passing - the only two test files that execute this function. Read from the test: its boundary-case block accepts either a null result or all-non-converged branches, and its other M = 1 case has x squared well under the limit. So no committed test fails when the 0.90 fail-closed limit is removed entirely.

### 73. `core/lambert/lambert-multi-rev.ts:222` — `velocityFromX` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(y)) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A direct test is not possible (module-private); a lambertMultiRev call at the edge of the x domain asserting null would reach the first guard.
Assessment: Defensive branches not tested (non-finite y; negative or zero sigma squared). sigmaSq is 0 only for collinear r1, r2, which buildGeometry already refuses.

### 74. `core/lambert/lambert-multi-rev.ts:229` — `velocityFromX` — guard-removal (module-private helper)
```diff
- if (sigmaSq < 0) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A direct test is not possible (module-private); a lambertMultiRev call at the edge of the x domain asserting null would reach the first guard.
Assessment: Defensive branches not tested (non-finite y; negative or zero sigma squared). sigmaSq is 0 only for collinear r1, r2, which buildGeometry already refuses.

### 75. `core/lambert/lambert-multi-rev.ts:264` — `makeBranch` — guard-removal (module-private helper)
```diff
- if (velocities === null) { return null; }
+ ;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: See velocityFromX.
Assessment: Defensive branch not tested (velocity reconstruction returning null).

### 76. `core/lambert/lambert-multi-rev.ts:287` — `lambertMultiRev` — relational-swap
```diff
- if (!(tof > 0) || !(mu > 0)) {
+ if (!(tof >= 0) || !(mu > 0)) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Covered by the tof = 0 / mu = 0 cases above.
Assessment: Boundary not tested: tof exactly 0 and mu exactly 0.

### 77. `core/lambert/lambert-multi-rev.ts:287` — `lambertMultiRev` — relational-swap
```diff
- if (!(tof > 0) || !(mu > 0)) {
+ if (!(tof > 0) || !(mu >= 0)) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Covered by the tof = 0 / mu = 0 cases above.
Assessment: Boundary not tested: tof exactly 0 and mu exactly 0.

### 78. `core/lambert/lambert-multi-rev.ts:319` — `lambertMultiRev` — relational-swap
```diff
- if (T < TMin) {
+ if (T <= TMin) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Low priority (exact floating-point equality); documentable as a convention instead.
Assessment: Boundary not tested: normalized T exactly equal to T_min (the code solves; the mutant refuses).

### 79. `core/lambert/stumpff.ts:24` — `stumpff_c2` — relational-swap
```diff
- if (psi > SERIES_CUTOFF) {
+ if (psi >= SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 80. `core/lambert/stumpff.ts:28` — `stumpff_c2` — relational-swap
```diff
- if (psi < -SERIES_CUTOFF) {
+ if (psi <= -SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 81. `core/lambert/stumpff.ts:36` — `stumpff_c3` — relational-swap
```diff
- if (psi > SERIES_CUTOFF) {
+ if (psi >= SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 82. `core/lambert/stumpff.ts:40` — `stumpff_c3` — relational-swap
```diff
- if (psi < -SERIES_CUTOFF) {
+ if (psi <= -SERIES_CUTOFF) {
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 83. `core/lambert/tof.ts:31` — `compute_y` — relational-swap
```diff
- if (arg < 0) return NaN;
+ if (arg <= 0) return NaN;
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_y at lambda = 1, x = 0 (argument 1 - lambda^2 (1 - x^2) = 0): assert 0, not NaN.
Assessment: Boundary not tested: the argument exactly 0 (the code returns 0; the mutant returns NaN).

### 84. `core/lambert/tof.ts:66` — `tof_equation` — relational-swap
```diff
- if (M === 0 && x > SQRT_0_6 && x < SQRT_1_4) {
+ if (M === 0 && x >= SQRT_0_6 && x < SQRT_1_4) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed unless the series accuracy claim itself is to be pinned.
Assessment: Boundary not tested: x exactly at the edges of the series window (sqrt(0.6), sqrt(1.4)) where tof_equation switches formula. Reading: both formulas agree there to the series accuracy, so the result is the same within tolerance.

### 85. `core/lambert/tof.ts:66` — `tof_equation` — relational-swap
```diff
- if (M === 0 && x > SQRT_0_6 && x < SQRT_1_4) {
+ if (M === 0 && x > SQRT_0_6 && x <= SQRT_1_4) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed unless the series accuracy claim itself is to be pinned.
Assessment: Boundary not tested: x exactly at the edges of the series window (sqrt(0.6), sqrt(1.4)) where tof_equation switches formula. Reading: both formulas agree there to the series accuracy, so the result is the same within tolerance.

### 86. `core/propagators/keplerian.ts:42` — `assertFiniteNumber` — guard-removal (module-private helper)
```diff
- if (!Number.isFinite(value)) { throw new RangeError(`${label} must be finite`); }
+ ;
```
Layer math. 11 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 87. `core/propagators/keplerian.ts:59` — `validateKeplerianElements` — guard-removal (module-private helper)
```diff
- if (elements.e < 0 || elements.e >= 1) { throw new RangeError('e must be in [0, 1) for elliptical Kepler propagation'); }
+ ;
```
Layer math. 11 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 88. `core/propagators/keplerian.ts:113` — `solveKeplerEquation` — relational-swap
```diff
- if (eccentricity < 0 || eccentricity >= 1) {
+ if (eccentricity < 0 || eccentricity > 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: solveKeplerEquation(M, 1) and (M, 1.0005): assert the RangeError.
Assessment: Boundary not tested: eccentricity exactly 1 (and just above) handed to solveKeplerEquation.

### 89. `core/propagators/keplerian.ts:120` — `solveKeplerEquation` — relational-swap
```diff
- let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
+ let eccentricAnomaly = eccentricity <= 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: None needed.
Assessment: Boundary not tested: the starting guess switches at eccentricity exactly 0.8 and mean anomaly exactly 0. Reading: both guesses converge to the same root, so the result is unchanged; equivalent in outcome.

### 90. `core/propagators/keplerian.ts:120` — `solveKeplerEquation` — relational-swap
```diff
- let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
+ let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly > 0 ? Math.PI : -Math.PI);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: None needed.
Assessment: Boundary not tested: the starting guess switches at eccentricity exactly 0.8 and mean anomaly exactly 0. Reading: both guesses converge to the same root, so the result is unchanged; equivalent in outcome.

### 91. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — relational-swap
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration <= maxIterations; iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Only a test at very high eccentricity near perihelion, asserting the iteration count or a tolerance near 1e-12, would see these. Low priority.
Assessment: Reading (not executed): Newton converges in a handful of iterations, far below the iteration cap, and a 0.1% looser tolerance changes the result below test tolerances. Convergence-budget mutants; equivalent for every tested input.

### 92. `core/propagators/keplerian.ts:127` — `solveKeplerEquation` — relational-swap
```diff
- if (Math.abs(delta) <= tolerance) {
+ if (Math.abs(delta) < tolerance) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 93. `core/propagators/keplerian.ts:167` — `sampleOrbitEllipse` — relational-swap
```diff
- if (!Number.isInteger(segmentCount) || segmentCount < 3) {
+ if (!Number.isInteger(segmentCount) || segmentCount <= 3) {
```
Layer math. 5 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 94. `core/propagators/keplerian.ts:205` — `propagateKeplerianStateVectors` — relational-swap
```diff
- if (gmM3S2 <= 0) {
+ if (gmM3S2 < 0) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: propagateKeplerianStateVectors with options.gmM3S2 = 0 and = -1: assert the RangeError.
Assessment: Guard not tested: a non-positive GM handed to propagateKeplerianStateVectors.

### 95. `porkchop/compare-data.ts:228` — `toSegmentCell` — guard-removal (module-private helper)
```diff
- if (!cell || cell.status !== 'ok' || cell.selectedBranch === null) { return { c3: null, converged: false }; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 96. `porkchop/compare-data.ts:232` — `toSegmentCell` — guard-removal (module-private helper)
```diff
- if (!branch) { return { c3: null, converged: false }; }
+ ;
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 97. `porkchop/compare-data.ts:278` — `computeCompareData` — relational-swap
```diff
- params.depStartJdTdb < params.earthSpanJdTdb.firstSample ||
+ params.depStartJdTdb <= params.earthSpanJdTdb.firstSample ||
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: computeCompareData with depStartJdTdb === earthSpanJdTdb.firstSample: assert it is not refused.
Assessment: Boundary not tested: a departure window starting exactly on the first Earth sample (the code accepts it; the mutant refuses it).

### 98. `porkchop/compare-data.ts:279` — `computeCompareData` — relational-swap
```diff
- params.depEndJdTdb > params.earthSpanJdTdb.lastSample
+ params.depEndJdTdb >= params.earthSpanJdTdb.lastSample
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 99. `porkchop/composite-grid.ts:193` — `minSelectedC3` — relational-swap
```diff
- if (best === null || c3 < best.c3) {
+ if (best === null || c3 <= best.c3) {
```
Layer math. 1 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`.
Suggested test: minSelectedC3 on a grid with a duplicated minimum: assert the returned cell is the first.
Assessment: Tie not tested: two cells with exactly the same minimum C3 (first wins in the code; last wins under the mutant).

### 100. `porkchop/format-c3.ts:20` — `formatC3` — relational-swap
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude <= 1e-4 || magnitude >= 1e5)) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(1e-4): assert '0.000100' (the mutant returns '1.00e-4').
Assessment: Boundary not tested: |C3| exactly 1e-4, where the format switches to exponential.

### 101. `porkchop/format-c3.ts:20` — `formatC3` — relational-swap
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude < 1e-4 || magnitude > 1e5)) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(1e5): assert '1.00e+5' (the mutant returns '100000').
Assessment: Boundary not tested: |C3| exactly 1e5.

### 102. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — relational-swap
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 0; index <= vehicle.curve.length - 1; index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): the loop only reaches the extra index when no bracket matched, which the range guard above already excludes for an in-range C3. Equivalent for every reachable input.

### 103. `porkchop/launch-vehicles.ts:232` — `payloadAtC3` — relational-swap
```diff
- if (left.c3 < c3 && c3 < right.c3) {
+ if (left.c3 <= c3 && c3 < right.c3) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): an exact anchor match returns from the loop above, so left.c3 === c3 never reaches this comparison. Equivalent.

### 104. `porkchop/launch-vehicles.ts:232` — `payloadAtC3` — relational-swap
```diff
- if (left.c3 < c3 && c3 < right.c3) {
+ if (left.c3 < c3 && c3 <= right.c3) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 105. `porkchop/propagation-guard.ts:79` — `assessPropagation` — relational-swap
```diff
- if (elements.aM <= 0) {
+ if (elements.aM < 0) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with aM = 0 on otherwise valid elements: assert the refusal and reason === 'non-positive-semi-major-axis'.
Assessment: Boundary not tested: aM exactly 0.

### 106. `porkchop/propagation-guard.ts:82` — `assessPropagation` — relational-swap
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e <= 0 || elements.e >= 1) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with e = 0 and aM > 0: assert propagatable === true.
Assessment: Boundary not tested: e exactly 0. Under the mutant a circular orbit would be refused.

### 107. `porkchop/propagation-guard.ts:82` — `assessPropagation` — relational-swap
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e < 0 || elements.e > 1) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with e = 1 and aM > 0: assert the refusal and reason === 'eccentricity-not-elliptical'.
Assessment: Boundary not tested: e exactly 1 with a positive semi-major axis.

### 108. `porkchop/segment-windows.ts:116` — `liveGridMin` — relational-swap
```diff
- if (cell.converged && cell.c3 !== null && Number.isFinite(cell.c3) && cell.c3 < min) {
+ if (cell.converged && cell.c3 !== null && Number.isFinite(cell.c3) && cell.c3 <= min) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 109. `porkchop/segment-windows.ts:155` — `classifyComponents` — relational-swap
```diff
- if (best === null || component.minC3 < best.minC3) {
+ if (best === null || component.minC3 <= best.minC3) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 110. `porkchop/segment-windows.ts:213` — `segmentWindows` — relational-swap
```diff
- for (let seed = 0; seed < cells.length; seed++) {
+ for (let seed = 0; seed <= cells.length; seed++) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 111. `porkchop/segment-windows.ts:220` — `segmentWindows` — sign-flip
```diff
- let argDep = -1;
+ let argDep = 1;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): argDep and argTof are overwritten by the first cell popped (its C3 is below the Infinity start value), so the starting value never survives. Equivalent.

### 112. `porkchop/segment-windows.ts:221` — `segmentWindows` — sign-flip
```diff
- let argTof = -1;
+ let argTof = 1;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): argDep and argTof are overwritten by the first cell popped (its C3 is below the Infinity start value), so the starting value never survives. Equivalent.

### 113. `porkchop/segment-windows.ts:235` — `segmentWindows` — relational-swap
```diff
- c3 < minC3 ||
+ c3 <= minC3 ||
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A component with a duplicated minimum at two departure columns: assert argmin is the earlier one.
Assessment: Tie-break not tested: two cells in one component with exactly equal C3 (the code keeps the earliest departure, then the lowest TOF index).

### 114. `porkchop/segment-windows.ts:236` — `segmentWindows` — relational-swap
```diff
- (c3 === minC3 && (depIdx < argDep || (depIdx === argDep && tofIdx < argTof)))
+ (c3 === minC3 && (depIdx <= argDep || (depIdx === argDep && tofIdx < argTof)))
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A component with a duplicated minimum at two departure columns: assert argmin is the earlier one.
Assessment: Tie-break not tested: two cells in one component with exactly equal C3 (the code keeps the earliest departure, then the lowest TOF index).

### 115. `porkchop/segment-windows.ts:236` — `segmentWindows` — relational-swap
```diff
- (c3 === minC3 && (depIdx < argDep || (depIdx === argDep && tofIdx < argTof)))
+ (c3 === minC3 && (depIdx < argDep || (depIdx === argDep && tofIdx <= argTof)))
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 116. `porkchop/segment-windows.ts:242` — `segmentWindows` — relational-swap
```diff
- if (depIdx < minDep) minDep = depIdx;
+ if (depIdx <= minDep) minDep = depIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Assigning minDep = depIdx when they are already equal changes nothing.

### 117. `porkchop/segment-windows.ts:243` — `segmentWindows` — relational-swap
```diff
- if (depIdx > maxDep) maxDep = depIdx;
+ if (depIdx >= maxDep) maxDep = depIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Assigning minDep = depIdx when they are already equal changes nothing.

### 118. `porkchop/segment-windows.ts:244` — `segmentWindows` — relational-swap
```diff
- if (tofIdx < minTof) minTof = tofIdx;
+ if (tofIdx <= minTof) minTof = tofIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 119. `porkchop/segment-windows.ts:245` — `segmentWindows` — relational-swap
```diff
- if (tofIdx > maxTof) maxTof = tofIdx;
+ if (tofIdx >= maxTof) maxTof = tofIdx;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 120. `porkchop/segment-windows.ts:250` — `segmentWindows` — relational-swap
```diff
- if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) {
+ if (nDepIdx < 0 || nDepIdx > nDep || nTofIdx < 0 || nTofIdx >= nTof) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 121. `porkchop/segment-windows.ts:250` — `segmentWindows` — relational-swap
```diff
- if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) {
+ if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx > nTof) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 122. `porkchop/tier-disclosure.ts:63` — `formatMillionKm` — relational-swap
```diff
- if (!Number.isFinite(km) || km <= 0) {
+ if (!Number.isFinite(km) || km < 0) {
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: formatMillionKm(0): assert null (the mutant returns '0 million').
Assessment: Boundary not tested: a drift of exactly 0 km.

### 123. `porkchop/tier-disclosure.ts:72` — `formatMetersPerSecond` — relational-swap
```diff
- if (!Number.isFinite(dvKmS) || dvKmS < 0) {
+ if (!Number.isFinite(dvKmS) || dvKmS <= 0) {
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(0): assert '0.0' (the mutant returns null).
Assessment: Boundary not tested: a delta-v of exactly 0.

### 124. `porkchop/tier-disclosure.ts:76` — `formatMetersPerSecond` — relational-swap
```diff
- if (mps >= 100) {
+ if (mps > 100) {
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(0.1): assert '100' (the mutant returns '100.0').
Assessment: Boundary not tested: exactly 100 m/s, where the format switches from one decimal to a grouped integer.

### 125. `core/frames/transform.ts:213` — `transformCanonicalState` — argument-swap
```diff
- assertSupportedTransform(fromFrame, toFrame);
+ assertSupportedTransform(toFrame, fromFrame);
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Read from the source: assertSupportedTransform accepts a pair in either order.

### 126. `core/frames/transform.ts:244` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, earthState!.positionM),
+ positionM: addVec3(earthState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 127. `core/frames/transform.ts:245` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, earthState!.velocityMps),
+ velocityMps: addVec3(earthState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 128. `core/frames/transform.ts:271` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, marsState!.positionM),
+ positionM: addVec3(marsState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 129. `core/frames/transform.ts:272` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, marsState!.velocityMps),
+ velocityMps: addVec3(marsState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 130. `core/frames/transform.ts:289` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, saturnState!.positionM),
+ positionM: addVec3(saturnState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 131. `core/frames/transform.ts:290` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, saturnState!.velocityMps),
+ velocityMps: addVec3(saturnState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 132. `core/frames/transform.ts:297` — `transformCanonicalState` — argument-swap
```diff
- positionM: addVec3(state.positionM, jupiterState!.positionM),
+ positionM: addVec3(jupiterState!.positionM, state.positionM),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 133. `core/frames/transform.ts:298` — `transformCanonicalState` — argument-swap
```diff
- velocityMps: addVec3(state.velocityMps, jupiterState!.velocityMps),
+ velocityMps: addVec3(jupiterState!.velocityMps, state.velocityMps),
```
Layer math. 9 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Vector addition is commutative.

### 134. `core/interpolators/hermite.ts:102` — `interpolateBodyStateSeries` — arithmetic-swap
```diff
- for (let i = 0; i < samples.length - 1; i++) {
+ for (let i = 0; i < samples.length + 1; i++) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Out-of-range epoch: assert the failure is the interpolation invariant (by id).
Assessment: Reading (not executed): the extra iteration is reached only for an out-of-range epoch, where it throws a TypeError before the invariant failure. Tests that expect "throws" pass either way.

### 135. `core/interpolators/hermite.ts:106` — `interpolateBodyStateSeries` — argument-swap
```diff
- return interpolateBodyState(s0, s1, tdbSeconds);
+ return interpolateBodyState(s1, s0, tdbSeconds);
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed (a bit-exact pin would catch it, but nothing depends on the bit pattern except DEC-20-4-style exact-equality checks).
Assessment: EQUIVALENT UP TO ROUNDING. Verified on the Earth series (2,000 epochs): swapping the bracket samples changes position by at most 6.1e-5 m and any component by at most 1.5e-11 relative. A cubic Hermite through two states is the same curve from either end.

### 136. `core/interpolators/hermite.ts:117` — `interpolateBodyStateSeries` — arithmetic-swap
```diff
- maxTdbSeconds: samples[samples.length - 1]?.tdbSeconds ?? samples[0].tdbSeconds,
+ maxTdbSeconds: samples[samples.length + 1]?.tdbSeconds ?? samples[0].tdbSeconds,
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Out-of-range epoch: assert context.maxTdbSeconds equals the last sample time.
Assessment: Low: maxTdbSeconds in the out-of-range failure context is not asserted.

### 137. `core/invariants/assertions.ts:173` — `assertInterpolationError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx - dy * dy + dz * dz);
```
Layer honesty. 7 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Same test: an error just over the bar spread across all three axes must fire the invariant; add a y-only case.
Assessment: Same gap as the previous mutant, on the y term.

### 138. `core/invariants/assertions.ts:173` — `assertInterpolationError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx + dy * dy - dz * dz);
```
Layer honesty. 7 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: assertInterpolationError with the estimate displaced by bar x 0.6 on each of x, y and z (norm about 1.04 x bar): assert the invariant fires. Repeat with the displacement on z only.
Assessment: REAL GAP (the interpolation error-bar invariant). With a minus sign in the norm, an error that is mostly along z gives a negative radicand, the square root is NaN, NaN > bar is false, and the invariant stays silent. The tests never present a failing case with error on more than one axis.

### 139. `core/invariants/assertions.ts:201` — `assertKeplerianError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx - dy * dy + dz * dz);
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Same test, plus a y-only displacement just over the bar.
Assessment: Same gap as the previous mutant, on the y term.

### 140. `core/invariants/assertions.ts:201` — `assertKeplerianError` — arithmetic-swap
```diff
- const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
+ const errorM = Math.sqrt(dx * dx + dy * dy - dz * dz);
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: assertKeplerianError with the estimate displaced by bar x 0.6 on each axis, and with a z-only displacement just over the bar: assert INV-012 fires.
Assessment: REAL GAP (INV-012, the Keplerian error bar). Same mechanism as the interpolation assertion: a z-dominated error makes the radicand negative and the assertion can no longer fire.

### 141. `core/invariants/assertions.ts:209` — `assertKeplerianError` — arithmetic-swap
```diff
- measuredErrorKm: errorM / 1000,
+ measuredErrorKm: errorM * 1000,
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: On a failing assertKeplerianError call, assert context.measuredErrorKm equals the displacement in km.
Assessment: The failure's reported context is not asserted: tests check that INV-012 fires, not the measuredErrorKm it reports. Under the mutant the reported error is a million times too large.

### 142. `core/invariants/assertions.ts:210` — `assertKeplerianError` — arithmetic-swap
```diff
- barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M / 1000,
+ barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M * 1000,
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: On a failing assertKeplerianError call, assert context.barKm === 100000.
Assessment: The failure's reported bar (barKm) is not asserted.

### 143. `core/invariants/round-trip.ts:43` — `computeFrameRoundTripRelativeError` — argument-swap
```diff
- return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
+ return sixAxisDiffNorm(sample, roundTripped) / Math.max(sixAxisNorm(sample), 1);
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. sixAxisDiffNorm is a hypot of differences, so swapping its arguments cannot change the value.

### 144. `core/invariants/round-trip.ts:43` — `computeFrameRoundTripRelativeError` — argument-swap
```diff
- return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
+ return sixAxisDiffNorm(roundTripped, sample) / Math.max(1, sixAxisNorm(sample));
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.max is commutative.

### 145. `core/lambert/dla.ts:20` — `dlaDegFromVInf` — argument-swap
```diff
- const mag = Math.hypot(vx, vy, vz);
+ const mag = Math.hypot(vy, vx, vz);
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.hypot is symmetric in its arguments.

### 146. `core/lambert/dla.ts:20` — `dlaDegFromVInf` — argument-swap
```diff
- const mag = Math.hypot(vx, vy, vz);
+ const mag = Math.hypot(vx, vz, vy);
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.hypot is symmetric in its arguments.

### 147. `core/lambert/dla.ts:28` — `dlaDegFromVInf` — argument-swap
```diff
- const sinDla = Math.min(1, Math.max(-1, vz / mag));
+ const sinDla = Math.min(Math.max(-1, vz / mag), 1);
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.min and Math.max are commutative.

### 148. `core/lambert/dla.ts:28` — `dlaDegFromVInf` — argument-swap
```diff
- const sinDla = Math.min(1, Math.max(-1, vz / mag));
+ const sinDla = Math.min(1, Math.max(vz / mag, -1));
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.min and Math.max are commutative.

### 149. `core/lambert/householder.ts:56` — `householder` — arithmetic-swap
```diff
- const numerator = fval * (fder * fder - (fval * fder2) / 2);
+ const numerator = fval * (fder * fder - (fval / fder2) / 2);
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that asserts the iteration count for a reference case (Izzo reports 2-3 for single-rev) would pin the update formula.
Assessment: Reading (not executed): these change the Householder update step, not the equation being solved, so the iteration still lands on the same root to within the tolerance (it may take more iterations). Convergence-rate mutants.

### 150. `core/lambert/householder.ts:57` — `householder` — arithmetic-swap
```diff
- const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / 6;
+ const denominator = fder * (fder * fder - fval * fder2) - (fder3 * fval * fval) / 6;
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that asserts the iteration count for a reference case (Izzo reports 2-3 for single-rev) would pin the update formula.
Assessment: Reading (not executed): these change the Householder update step, not the equation being solved, so the iteration still lands on the same root to within the tolerance (it may take more iterations). Convergence-rate mutants.

### 151. `core/lambert/hyp2f1b.ts:31` — `hyp2f1b` — arithmetic-swap
```diff
- if (Math.abs(newResult - result) < RTOL * Math.abs(newResult)) {
+ if (Math.abs(newResult + result) < RTOL * Math.abs(newResult)) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: hyp2f1b pinned against a reference value at x = 0.9 to 1e-9 (the accuracy the solver header claims) would catch a series stopped early.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. (Here the "root-finder" is a series summed until it stops changing.)

### 152. `core/lambert/hyp2f1b.ts:31` — `hyp2f1b` — arithmetic-swap
```diff
- if (Math.abs(newResult - result) < RTOL * Math.abs(newResult)) {
+ if (Math.abs(newResult - result) < RTOL / Math.abs(newResult)) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: hyp2f1b pinned against a reference value at x = 0.9 to 1e-9 (the accuracy the solver header claims) would catch a series stopped early.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. (Here the "root-finder" is a series summed until it stops changing.)

### 153. `core/lambert/izzo.ts:84` — `lambert` — argument-swap
```diff
- const c = sub(r2, r1);
+ const c = sub(r1, r2);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 154. `core/lambert/izzo.ts:103` — `lambert` — argument-swap
```diff
- let lam = Math.sqrt(1 - Math.min(1.0, c_norm / s));
+ let lam = Math.sqrt(1 - Math.min(c_norm / s, 1.0));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 155. `core/lambert/izzo.ts:109` — `lambert` — argument-swap
```diff
- i_t1 = cross(i_r1, i_h);
+ i_t1 = cross(i_h, i_r1);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 156. `core/lambert/izzo.ts:110` — `lambert` — argument-swap
```diff
- i_t2 = cross(i_r2, i_h);
+ i_t2 = cross(i_h, i_r2);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 157. `core/lambert/izzo.ts:141` — `lambert` — argument-swap
```diff
- const v1: Vec3 = add(scale(i_r1, V_r1), scale(i_t1, V_t1));
+ const v1: Vec3 = add(scale(i_t1, V_t1), scale(i_r1, V_r1));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 158. `core/lambert/izzo.ts:142` — `lambert` — argument-swap
```diff
- const v2: Vec3 = add(scale(i_r2, V_r2), scale(i_t2, V_t2));
+ const v2: Vec3 = add(scale(i_t2, V_t2), scale(i_r2, V_r2));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 159. `core/lambert/stumpff.ts:26` — `stumpff_c2` — arithmetic-swap
```diff
- return (1 - Math.cos(sq)) / psi;
+ return (1 - Math.cos(sq)) * psi;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 160. `core/lambert/stumpff.ts:30` — `stumpff_c2` — arithmetic-swap
```diff
- return (1 - Math.cosh(sq)) / psi;
+ return (1 - Math.cosh(sq)) * psi;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 161. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 + psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 162. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 - (psi * psi) / 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 163. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) * 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 164. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / 720 + (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 165. `core/lambert/stumpff.ts:32` — `stumpff_c2` — arithmetic-swap
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) * 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 166. `core/lambert/stumpff.ts:38` — `stumpff_c3` — arithmetic-swap
```diff
- return (sq - Math.sin(sq)) / (psi * sq);
+ return (sq - Math.sin(sq)) * (psi * sq);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 167. `core/lambert/stumpff.ts:38` — `stumpff_c3` — arithmetic-swap
```diff
- return (sq - Math.sin(sq)) / (psi * sq);
+ return (sq - Math.sin(sq)) / (psi / sq);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 168. `core/lambert/stumpff.ts:42` — `stumpff_c3` — arithmetic-swap
```diff
- return (Math.sinh(sq) - sq) / (-psi * sq);
+ return (Math.sinh(sq) - sq) * (-psi * sq);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 169. `core/lambert/stumpff.ts:42` — `stumpff_c3` — arithmetic-swap
```diff
- return (Math.sinh(sq) - sq) / (-psi * sq);
+ return (Math.sinh(sq) - sq) / (-psi / sq);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 170. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 + psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 171. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 - (psi * psi) / 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 172. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) * 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 173. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / 5040 + (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 174. `core/lambert/stumpff.ts:44` — `stumpff_c3` — arithmetic-swap
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) * 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 175. `core/lambert/vec3.ts:44` — `normalize` — arithmetic-swap
```diff
- return [a[0] / n, a[1] / n, a[2] / n];
+ return [a[0] / n, a[1] / n, a[2] * n];
```
Layer math. 1 test file(s) executed this function and still passed (23 import the module): `v2-lambert/vec3.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 176. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — arithmetic-swap
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < maxIterations; iteration -= 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 177. `core/propagators/keplerian.ts:218` — `propagateKeplerianStateVectors` — arithmetic-swap
```diff
- const orbitalRadiusM = elements.aM * denominator;
+ const orbitalRadiusM = elements.aM / denominator;
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 178. `porkchop/compare-data.ts:259` — `computeCompareData` — argument-swap
```diff
- const tofCellDays = cellWidth(params.tofMinDays, params.tofMaxDays, params.nTof);
+ const tofCellDays = cellWidth(params.tofMaxDays, params.tofMinDays, params.nTof);
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: In the asymmetric-grid test, also assert bestPractical.argmin.tofDays against the known cell and tofSpanDays >= 0.
Assessment: REAL GAP (math, compare). With the TOF cell width computed from (max, min) it is negative, so every argmin TOF and every tofSpanDays that compare reports is wrong. The two tests that run this only check departure-direction quantities.

### 179. `porkchop/compare-data.ts:259` — `computeCompareData` — argument-swap
```diff
- const tofCellDays = cellWidth(params.tofMinDays, params.tofMaxDays, params.nTof);
+ const tofCellDays = cellWidth(params.tofMinDays, params.nTof, params.tofMaxDays);
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Same assertion: argmin.tofDays and tofSpanDays on a grid whose TOF step is known.
Assessment: REAL GAP (math, compare). cellWidth(min, nTof, max) passes the cell count as the end of the range; same unasserted TOF quantities as the neighbouring mutant.

### 180. `porkchop/compare-data.ts:270` — `computeCompareData` — arithmetic-swap
```diff
- `'${body.bodyId}' is selection ${index + 1} of ${bodies.length}`,
+ `'${body.bodyId}' is selection ${index - 1} of ${bodies.length}`,
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Assert the detail string of a cap-exceeded refusal (selection 6 of 6).
Assessment: Low: the mutated number appears only in the cap-exceeded refusal detail text, which is not asserted.

### 181. `porkchop/compare-data.ts:364` — `computeCompareData` — arithmetic-swap
```diff
- params.dvBudget.marginMps +
+ params.dvBudget.marginMps -
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Assert echo.dvBudgetMps equals rendezvous + stationkeeping + margin for the budget passed in.
Assessment: The echoed dvBudgetMps is not asserted, so adding or subtracting the margin in it goes unnoticed. It is a displayed provenance value (D-04).

### 182. `porkchop/composite-grid.ts:139` — `compositeGrids` — arithmetic-swap
```diff
- fromM0 += 1;
+ fromM0 -= 1;
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 183. `porkchop/composite-grid.ts:155` — `compositeGrids` — arithmetic-swap
```diff
- fromM0 += 1;
+ fromM0 -= 1;
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 184. `porkchop/composite-grid.ts:159` — `compositeGrids` — arithmetic-swap
```diff
- fromM1 += 1;
+ fromM1 -= 1;
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 185. `porkchop/delta-v.ts:23` — `injectionDvFromC3` — arithmetic-swap
```diff
- const circularVelocityKmps = Math.sqrt(muKm3PerS2 / parkingRadiusKm);
+ const circularVelocityKmps = Math.sqrt(muKm3PerS2 * parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: Pin injectionDvFromC3 against an independently computed value: C3 = 0 gives 3.2243 km/s and C3 = 10 gives 3.6695 km/s from the 6,578.137 km parking orbit (values printed by the production function at 0d31cda; confirm them by hand or against an oracle before pinning). Assert to 1e-6.
Assessment: REAL GAP (math, shipped dV stack). Read from the test file: delta-v.test.mjs asserts the structure of the stack (departure is 0 or the arrival v-infinity, margin is the fraction of the subtotal, one-way total is below sample-return total) and never a numeric value of injectionDvFromC3. The other test that runs it (v2-dla-render) passes too. The injection formula is unpinned.

### 186. `porkchop/delta-v.ts:24` — `injectionDvFromC3` — arithmetic-swap
```diff
- const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) / parkingRadiusKm);
+ const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 / muKm3PerS2) / parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 187. `porkchop/delta-v.ts:24` — `injectionDvFromC3` — arithmetic-swap
```diff
- const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) / parkingRadiusKm);
+ const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) * parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: Pin injectionDvFromC3 against an independently computed value: C3 = 0 gives 3.2243 km/s and C3 = 10 gives 3.6695 km/s from the 6,578.137 km parking orbit (values printed by the production function at 0d31cda; confirm them by hand or against an oracle before pinning). Assert to 1e-6.
Assessment: REAL GAP (math, shipped dV stack). Read from the test file: delta-v.test.mjs asserts the structure of the stack (departure is 0 or the arrival v-infinity, margin is the fraction of the subtotal, one-way total is below sample-return total) and never a numeric value of injectionDvFromC3. The other test that runs it (v2-dla-render) passes too. The injection formula is unpinned.

### 188. `porkchop/delta-v.ts:25` — `injectionDvFromC3` — arithmetic-swap
```diff
- return hyperbolicPerigeeVelocityKmps - circularVelocityKmps;
+ return hyperbolicPerigeeVelocityKmps + circularVelocityKmps;
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: Pin injectionDvFromC3 against an independently computed value: C3 = 0 gives 3.2243 km/s and C3 = 10 gives 3.6695 km/s from the 6,578.137 km parking orbit (values printed by the production function at 0d31cda; confirm them by hand or against an oracle before pinning). Assert to 1e-6.
Assessment: REAL GAP (math, shipped dV stack). Read from the test file: delta-v.test.mjs asserts the structure of the stack (departure is 0 or the arrival v-infinity, margin is the fraction of the subtotal, one-way total is below sample-return total) and never a numeric value of injectionDvFromC3. The other test that runs it (v2-dla-render) passes too. The injection formula is unpinned.

### 189. `porkchop/delta-v.ts:56` — `buildDeltaVStack` — arithmetic-swap
```diff
- totalKmps: subtotalKmps + marginKmps,
+ totalKmps: subtotalKmps - marginKmps,
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: Assert totalKmps === subtotalKmps + marginKmps on a concrete stack, and pin one total (C3 = 10, v-infinity 3, one-way: 7.5015 km/s at 0d31cda; confirm independently before pinning).
Assessment: REAL GAP (math, shipped dV stack). The total is only compared between modes (one-way < sample-return), which stays true when the margin is subtracted instead of added.

### 190. `porkchop/grid-compute.ts:164` — `computePorkchopGrid` — argument-swap
```diff
- const depGridJd = buildLinspace(gridParams.depStartJD, gridParams.depEndJD, gridParams.nDep);
+ const depGridJd = buildLinspace(gridParams.depEndJD, gridParams.depStartJD, gridParams.nDep);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: On a grid with nDep >= 3 and distinct start/end: assert cells[0].depJD === depStartJD, cells[(nDep-1)*nTof].depJD === depEndJD and that depJD is non-decreasing with index.
Assessment: REAL GAP (math, grid kernel). With the departure linspace built from (end, start) the grid is computed in reverse departure order. The three test files that run computePorkchopGrid still pass, so none of them pins which departure date sits at index 0. Every consumer indexes cells as depIdx * nTof + tofIdx.

### 191. `porkchop/grid-compute.ts:165` — `computePorkchopGrid` — argument-swap
```diff
- const tofGridDays = buildLinspace(gridParams.tofMinDays, gridParams.tofMaxDays, gridParams.nTof);
+ const tofGridDays = buildLinspace(gridParams.tofMaxDays, gridParams.tofMinDays, gridParams.nTof);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: On a grid with nTof >= 3: assert cells[0].tofDays === tofMinDays, cells[nTof-1].tofDays === tofMaxDays and that tofDays increases inside a departure row.
Assessment: REAL GAP (math, grid kernel). Same as the departure axis, for time of flight: with (max, min) the TOF axis is reversed and no test notices.

### 192. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — arithmetic-swap
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 0; index < vehicle.curve.length + 1; index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): the loop only reaches the extra index when no bracket matched, which the range guard above already excludes for an in-range C3. Equivalent for every reachable input.

### 193. `porkchop/segment-windows.ts:104` — `compareByMinC3` — arithmetic-swap
```diff
- return a.argmin.depJd - b.argmin.depJd;
+ return a.argmin.depJd + b.argmin.depJd;
```
Layer math. 2 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`.
Suggested test: compareByMinC3 on two components with equal minC3 and different depJd, both orders: assert the sign.
Assessment: Tie-break not tested: two components with exactly equal minC3 (DEC-17: ties go to the earlier departure, then the shorter TOF).

### 194. `porkchop/segment-windows.ts:106` — `compareByMinC3` — arithmetic-swap
```diff
- return a.argmin.tofDays - b.argmin.tofDays;
+ return a.argmin.tofDays + b.argmin.tofDays;
```
Layer math. 2 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`.
Suggested test: compareByMinC3 on two components with equal minC3 and different depJd, both orders: assert the sign.
Assessment: Tie-break not tested: two components with exactly equal minC3 (DEC-17: ties go to the earlier departure, then the shorter TOF).

### 195. `porkchop/segment-windows.ts:248` — `segmentWindows` — arithmetic-swap
```diff
- const nDepIdx = depIdx + dDep;
+ const nDepIdx = depIdx - dDep;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 196. `porkchop/segment-windows.ts:249` — `segmentWindows` — arithmetic-swap
```diff
- const nTofIdx = tofIdx + dTof;
+ const nTofIdx = tofIdx - dTof;
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 197. `porkchop/support-boundary.ts:55` — `boundaryTofDaysAtDeparture` — arithmetic-swap
```diff
- return boundary.encounterJd - depJD;
+ return boundary.encounterJd + depJD;
```
Layer honesty. No test executes `boundaryTofDaysAtDeparture` (16 test file(s) import the module; none calls it).
Suggested test: boundaryTofDaysAtDeparture(depJD, boundary) for a known encounter: assert encounterJd - depJD, and that isArrivalAfterEncounter flips exactly at that TOF.
Assessment: No test calls boundaryTofDaysAtDeparture at all (measured by function coverage), although it is exported and draws the support boundary curve.

### 198. `core/constants/asteroids.ts:56` — `assertFinitePositive` — relational-swap (module-private helper)
```diff
- if (!Number.isFinite(value) || value <= 0) {
+ if (!Number.isFinite(value) || value < 0) {
```
Layer math. 3 test file(s) executed this function and still passed (66 import the module): `v2-core-constants.test.mjs`, `v2-slice9-live-runtime-integration.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: Call a public function that uses it with 0 and assert the error.
Assessment: Boundary not tested: a value of exactly 0.

### 199. `core/lambert/lambert-multi-rev.ts:74` — `buildGeometry` — relational-swap (module-private helper)
```diff
- if (iH[2] < 0) {
+ if (iH[2] <= 0) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Low priority (an exact floating-point boundary). r1 and r2 chosen so that (r1 x r2).z === 0 with a non-zero cross product would pin the convention.
Assessment: Boundary not tested: the orbit normal exactly in the XY plane (iH[2] === 0), where the prograde sense is decided.

### 200. `core/lambert/lambert-multi-rev.ts:84` — `buildGeometry` — sign-flip (module-private helper)
```diff
- lambda = -lambda;
+ lambda = lambda;
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: lambertMultiRev with lw = false compared against a reference solution, asserting the full v1 and v2 vectors.
Assessment: REAL GAP for the retrograde option only. The sign flips inside the if (!prograde) block survive: no multi-rev test passes lw = false (grep of the two multi-rev test files finds none). The production grid always passes true (grid-compute.ts:193), so nothing shipped takes this branch today.

### 201. `core/lambert/lambert-multi-rev.ts:85` — `buildGeometry` — sign-flip (module-private helper)
```diff
- iT1 = scale(iT1, -1);
+ iT1 = scale(iT1, 1);
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: lambertMultiRev with lw = false compared against a reference solution, asserting the full v1 and v2 vectors.
Assessment: REAL GAP for the retrograde option only. The sign flips inside the if (!prograde) block survive: no multi-rev test passes lw = false (grep of the two multi-rev test files finds none). The production grid always passes true (grid-compute.ts:193), so nothing shipped takes this branch today.

### 202. `core/lambert/lambert-multi-rev.ts:86` — `buildGeometry` — sign-flip (module-private helper)
```diff
- iT2 = scale(iT2, -1);
+ iT2 = scale(iT2, 1);
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: lambertMultiRev with lw = false compared against a reference solution, asserting the full v1 and v2 vectors.
Assessment: REAL GAP for the retrograde option only. The sign flips inside the if (!prograde) block survive: no multi-rev test passes lw = false (grep of the two multi-rev test files finds none). The production grid always passes true (grid-compute.ts:193), so nothing shipped takes this branch today.

### 203. `core/lambert/lambert-multi-rev.ts:103` — `initialGuessMultiRev` — sign-flip (module-private helper)
```diff
- return clamp(x0Left, -1 + EPSILON, -EPSILON);
+ return clamp(x0Left, -1 + EPSILON, EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 204. `core/lambert/lambert-multi-rev.ts:111` — `halleyForTMin` — relational-swap (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter <= MAX_ITER; iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 205. `core/lambert/lambert-multi-rev.ts:130` — `halleyForTMin` — relational-swap (module-private helper)
```diff
- if (Math.abs(next - x) < RTOL) {
+ if (Math.abs(next - x) <= RTOL) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 206. `core/lambert/lambert-multi-rev.ts:160` — `solveOneBranch` — relational-swap (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter <= MAX_ITER; iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 207. `core/lambert/lambert-multi-rev.ts:161` — `solveOneBranch` — relational-swap (module-private helper)
```diff
- if (x * x > MULTI_REV_X_SQUARED_LIMIT) {
+ if (x * x >= MULTI_REV_X_SQUARED_LIMIT) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Low priority (an exact floating-point boundary); a unit test on the comparison with an injected x would pin it.
Assessment: Boundary not tested: x squared exactly equal to the 0.90 fail-closed limit.

### 208. `core/lambert/lambert-multi-rev.ts:195` — `solveOneBranch` — relational-swap (module-private helper)
```diff
- if (next * next > MULTI_REV_X_SQUARED_LIMIT) {
+ if (next * next >= MULTI_REV_X_SQUARED_LIMIT) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Low priority (an exact floating-point boundary); a unit test on the comparison with an injected x would pin it.
Assessment: Boundary not tested: x squared exactly equal to the 0.90 fail-closed limit.

### 209. `core/lambert/lambert-multi-rev.ts:198` — `solveOneBranch` — relational-swap (module-private helper)
```diff
- if (Math.abs(next - x) < RTOL) {
+ if (Math.abs(next - x) <= RTOL) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 210. `core/lambert/lambert-multi-rev.ts:229` — `velocityFromX` — relational-swap (module-private helper)
```diff
- if (sigmaSq < 0) {
+ if (sigmaSq <= 0) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A direct test is not possible (module-private); a lambertMultiRev call at the edge of the x domain asserting null would reach the first guard.
Assessment: Defensive branches not tested (non-finite y; negative or zero sigma squared). sigmaSq is 0 only for collinear r1, r2, which buildGeometry already refuses.

### 211. `core/lambert/tof.ts:42` — `compute_psi` — relational-swap (module-private helper)
```diff
- if (x >= -1 && x < 1) {
+ if (x > -1 && x < 1) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_psi (through tof_equation) at x = 1 exactly and x = -1 exactly, asserting the documented branch value.
Assessment: Boundaries not tested: x exactly -1, exactly 1 and just outside (the elliptic / hyperbolic / parabolic switch).

### 212. `core/lambert/tof.ts:42` — `compute_psi` — relational-swap (module-private helper)
```diff
- if (x >= -1 && x < 1) {
+ if (x >= -1 && x <= 1) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_psi (through tof_equation) at x = 1 exactly and x = -1 exactly, asserting the documented branch value.
Assessment: Boundaries not tested: x exactly -1, exactly 1 and just outside (the elliptic / hyperbolic / parabolic switch).

### 213. `core/lambert/tof.ts:45` — `compute_psi` — relational-swap (module-private helper)
```diff
- if (x > 1) {
+ if (x >= 1) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_psi (through tof_equation) at x = 1 exactly and x = -1 exactly, asserting the documented branch value.
Assessment: Boundaries not tested: x exactly -1, exactly 1 and just outside (the elliptic / hyperbolic / parabolic switch).

### 214. `core/propagators/keplerian.ts:56` — `validateKeplerianElements` — relational-swap (module-private helper)
```diff
- if (elements.aM <= 0) {
+ if (elements.aM < 0) {
```
Layer math. 11 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: propagateKeplerianStateVectors with aM = 0: assert the RangeError.
Assessment: Boundary not tested: aM exactly 0.

### 215. `core/propagators/keplerian.ts:59` — `validateKeplerianElements` — relational-swap (module-private helper)
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e < 0 || elements.e > 1) {
```
Layer math. 11 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 216. `core/propagators/keplerian.ts:103` — `normalizeSignedAngleRadians` — relational-swap (module-private helper)
```diff
- return wrapped > Math.PI ? wrapped - TWO_PI : wrapped;
+ return wrapped >= Math.PI ? wrapped - TWO_PI : wrapped;
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 217. `porkchop/compare-data.ts:241` — `cellWidth` — relational-swap (module-private helper)
```diff
- return count <= 1 ? 0 : (end - start) / (count - 1);
+ return count < 1 ? 0 : (end - start) / (count - 1);
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 218. `porkchop/grid-compute.ts:148` — `resolveSelectedBranch` — relational-swap (module-private helper)
```diff
- if (branch.c3 < selectedC3) {
+ if (branch.c3 <= selectedC3) {
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 219. `porkchop/launch-vehicles.ts:201` — `isNonNegativeFinite` — relational-swap (module-private helper)
```diff
- const isNonNegativeFinite = (value: number): boolean => Number.isFinite(value) && value >= 0;
+ const isNonNegativeFinite = (value: number): boolean => Number.isFinite(value) && value > 0;
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 220. `core/interpolators/hermite.ts:102` — `interpolateBodyStateSeries` — loop-bound-plus-1
```diff
- for (let i = 0; i < samples.length - 1; i++) {
+ for (let i = 0; i < ((samples.length - 1) + 1); i++) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: Out-of-range epoch: assert the failure is the interpolation invariant (by id).
Assessment: Reading (not executed): the extra iteration is reached only for an out-of-range epoch, where it throws a TypeError before the invariant failure. Tests that expect "throws" pass either way.

### 221. `core/invariants/assertions.ts:87` — `walkObjectKeys` — argument-swap (module-private helper)
```diff
- visitor(nextPath, key, nestedValue);
+ visitor(key, nextPath, nestedValue);
```
Layer honesty. 34 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice6.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-boundary-horizons.test.mjs`, `v2-boundary-slice2.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-slice2-cutover.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-boundary-slice4.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-dla-render.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 222. `core/invariants/assertions.ts:87` — `walkObjectKeys` — argument-swap (module-private helper)
```diff
- visitor(nextPath, key, nestedValue);
+ visitor(nextPath, nestedValue, key);
```
Layer honesty. 34 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice6.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-boundary-horizons.test.mjs`, `v2-boundary-slice2.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-slice2-cutover.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-boundary-slice4.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-dla-render.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 223. `core/invariants/assertions.ts:88` — `walkObjectKeys` — argument-swap (module-private helper)
```diff
- walkObjectKeys(nestedValue, visitor, nextPath);
+ walkObjectKeys(visitor, nestedValue, nextPath);
```
Layer honesty. 34 test file(s) executed this function and still passed (54 import the module): `v2-core-hermite.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice6.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-boundary-horizons.test.mjs`, `v2-boundary-slice2.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-slice2-cutover.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-boundary-slice4.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-boundary-slice8.test.mjs`, `v2-slice8-performance.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-render-asteroid-cell-renderer.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-resolve-catalog-body.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-boundary-slice9.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-dla-render.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 224. `core/invariants/round-trip.ts:12` — `sixAxisNorm` — argument-swap (module-private helper)
```diff
- state.positionM.x,
+ (multi-line statement replaced by: state.positionM.y,
    state.positionM.x)
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.hypot is symmetric in its arguments.

### 225. `core/invariants/round-trip.ts:16` — `sixAxisNorm` — argument-swap (module-private helper)
```diff
- state.velocityMps.y,
+ (multi-line statement replaced by: state.velocityMps.z,
    state.velocityMps.y)
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.hypot is symmetric in its arguments.

### 226. `core/invariants/round-trip.ts:23` — `sixAxisDiffNorm` — argument-swap (module-private helper)
```diff
- left.positionM.x - right.positionM.x,
+ (multi-line statement replaced by: left.positionM.y - right.positionM.y,
    left.positionM.x - right.positionM.x)
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.hypot is symmetric in its arguments.

### 227. `core/invariants/round-trip.ts:27` — `sixAxisDiffNorm` — argument-swap (module-private helper)
```diff
- left.velocityMps.y - right.velocityMps.y,
+ (multi-line statement replaced by: left.velocityMps.z - right.velocityMps.z,
    left.velocityMps.y - right.velocityMps.y)
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.hypot is symmetric in its arguments.

### 228. `core/invariants/runtime.ts:19` — `defaultViolationHandler` — argument-swap (module-private helper)
```diff
- console.error('[v2-core invariant]', violation);
+ console.error(violation, '[v2-core invariant]');
```
Layer honesty. No test executes `defaultViolationHandler` (57 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 229. `core/lambert/householder.ts:48` — `householder` — loop-start-plus-1
```diff
- for (let iter = 1; iter <= max_iter; iter++) {
+ for (let iter = 2; iter <= max_iter; iter++) {
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed unless the iteration budget is ever tightened.
Assessment: Reading (not executed): one iteration fewer in a budget of 35+; convergence takes a handful. Equivalent for every tested input.

### 230. `core/lambert/householder.ts:48` — `householder` — loop-bound-minus-1
```diff
- for (let iter = 1; iter <= max_iter; iter++) {
+ for (let iter = 1; iter <= ((max_iter) - 1); iter++) {
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: An assertion on the iteration count for a reference single-rev case.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 231. `core/lambert/hyp2f1b.ts:28` — `hyp2f1b` — loop-bound-minus-1
```diff
- for (let n = 0; n < MAX_ITER; n++) {
+ for (let n = 0; n < ((MAX_ITER) - 1); n++) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): one term fewer in a series that converges well before the cap. Equivalent for every tested input.

### 232. `core/lambert/hyp2f1b.ts:28` — `hyp2f1b` — loop-bound-plus-1
```diff
- for (let n = 0; n < MAX_ITER; n++) {
+ for (let n = 0; n < ((MAX_ITER) + 1); n++) {
```
Layer math. 3 test file(s) executed this function and still passed (25 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/hyp2f1b.test.mjs`, `v2-lambert/tof.test.mjs`.
Suggested test: hyp2f1b pinned against a reference value at x = 0.9 to 1e-9 (the accuracy the solver header claims) would catch a series stopped early.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. (Here the "root-finder" is a series summed until it stops changing.)

### 233. `core/lambert/lambert-multi-rev.ts:47` — `clamp` — argument-swap (module-private helper)
```diff
- return Math.min(max, Math.max(min, value));
+ return Math.min(Math.max(min, value), max);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.min and Math.max are commutative.

### 234. `core/lambert/lambert-multi-rev.ts:47` — `clamp` — argument-swap (module-private helper)
```diff
- return Math.min(max, Math.max(min, value));
+ return Math.min(max, Math.max(value, min));
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.min and Math.max are commutative.

### 235. `core/lambert/lambert-multi-rev.ts:51` — `buildGeometry` — argument-swap (module-private helper)
```diff
- const c = sub(r2, r1);
+ const c = sub(r1, r2);
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 236. `core/lambert/lambert-multi-rev.ts:70` — `buildGeometry` — argument-swap (module-private helper)
```diff
- let lambda = Math.sqrt(1 - Math.min(1, cMag / s));
+ let lambda = Math.sqrt(1 - Math.min(cMag / s, 1));
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. Math.min is commutative.

### 237. `core/lambert/lambert-multi-rev.ts:103` — `initialGuessMultiRev` — argument-swap (module-private helper)
```diff
- return clamp(x0Left, -1 + EPSILON, -EPSILON);
+ return clamp(-1 + EPSILON, x0Left, -EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 238. `core/lambert/lambert-multi-rev.ts:103` — `initialGuessMultiRev` — arithmetic-swap (module-private helper)
```diff
- return clamp(x0Left, -1 + EPSILON, -EPSILON);
+ return clamp(x0Left, -1 - EPSILON, -EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 239. `core/lambert/lambert-multi-rev.ts:105` — `initialGuessMultiRev` — argument-swap (module-private helper)
```diff
- return clamp(x0Right, EPSILON, 1 - EPSILON);
+ return clamp(EPSILON, x0Right, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 240. `core/lambert/lambert-multi-rev.ts:105` — `initialGuessMultiRev` — arithmetic-swap (module-private helper)
```diff
- return clamp(x0Right, EPSILON, 1 - EPSILON);
+ return clamp(x0Right, EPSILON, 1 + EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 241. `core/lambert/lambert-multi-rev.ts:111` — `halleyForTMin` — arithmetic-swap (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < MAX_ITER; iter -= 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 242. `core/lambert/lambert-multi-rev.ts:119` — `halleyForTMin` — argument-swap (module-private helper)
```diff
- const fDoublePrime = tof_equation_pp(x, y, TAtX, fPrime, lambda);
+ const fDoublePrime = tof_equation_pp(x, y, TAtX, lambda, fPrime);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 243. `core/lambert/lambert-multi-rev.ts:124` — `halleyForTMin` — arithmetic-swap (module-private helper)
```diff
- const denominator = 2 * fDoublePrime * fDoublePrime - fPrime * fTriplePrime;
+ const denominator = 2 * fDoublePrime * fDoublePrime + fPrime * fTriplePrime;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 244. `core/lambert/lambert-multi-rev.ts:124` — `halleyForTMin` — arithmetic-swap (module-private helper)
```diff
- const denominator = 2 * fDoublePrime * fDoublePrime - fPrime * fTriplePrime;
+ const denominator = 2 * fDoublePrime * fDoublePrime - fPrime / fTriplePrime;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 245. `core/lambert/lambert-multi-rev.ts:129` — `halleyForTMin` — argument-swap (module-private helper)
```diff
- const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(-1 + EPSILON, x - (2 * fPrime * fDoublePrime) / denominator, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 246. `core/lambert/lambert-multi-rev.ts:129` — `halleyForTMin` — arithmetic-swap (module-private helper)
```diff
- const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 - EPSILON, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 247. `core/lambert/lambert-multi-rev.ts:129` — `halleyForTMin` — arithmetic-swap (module-private helper)
```diff
- const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 + EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 248. `core/lambert/lambert-multi-rev.ts:160` — `solveOneBranch` — arithmetic-swap (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < MAX_ITER; iter -= 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 249. `core/lambert/lambert-multi-rev.ts:177` — `solveOneBranch` — arithmetic-swap (module-private helper)
```diff
- fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;
+ fPrime * (fPrime * fPrime + fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 250. `core/lambert/lambert-multi-rev.ts:177` — `solveOneBranch` — arithmetic-swap (module-private helper)
```diff
- fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;
+ fPrime * (fPrime * fPrime - fValue / fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 251. `core/lambert/lambert-multi-rev.ts:177` — `solveOneBranch` — arithmetic-swap (module-private helper)
```diff
- fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;
+ fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) * 6;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 252. `core/lambert/lambert-multi-rev.ts:191` — `solveOneBranch` — argument-swap (module-private helper)
```diff
- const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(-1 + EPSILON, x - numerator / denominator, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 253. `core/lambert/lambert-multi-rev.ts:191` — `solveOneBranch` — arithmetic-swap (module-private helper)
```diff
- const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - numerator / denominator, -1 - EPSILON, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 254. `core/lambert/lambert-multi-rev.ts:191` — `solveOneBranch` — arithmetic-swap (module-private helper)
```diff
- const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 + EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 255. `core/lambert/lambert-multi-rev.ts:239` — `velocityFromX` — argument-swap (module-private helper)
```diff
- const v1 = add(scale(iR1, radial1), scale(iT1, tangential1));
+ const v1 = add(scale(iT1, tangential1), scale(iR1, radial1));
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A direct test is not possible (module-private); a lambertMultiRev call at the edge of the x domain asserting null would reach the first guard.
Assessment: Defensive branches not tested (non-finite y; negative or zero sigma squared). sigmaSq is 0 only for collinear r1, r2, which buildGeometry already refuses.

### 256. `core/lambert/lambert-multi-rev.ts:240` — `velocityFromX` — argument-swap (module-private helper)
```diff
- const v2 = add(scale(iR2, radial2), scale(iT2, tangential2));
+ const v2 = add(scale(iT2, tangential2), scale(iR2, radial2));
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A direct test is not possible (module-private); a lambertMultiRev call at the edge of the x domain asserting null would reach the first guard.
Assessment: Defensive branches not tested (non-finite y; negative or zero sigma squared). sigmaSq is 0 only for collinear r1, r2, which buildGeometry already refuses.

### 257. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — loop-start-plus-1
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 1; iteration < maxIterations; iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Only a test at very high eccentricity near perihelion, asserting the iteration count or a tolerance near 1e-12, would see these. Low priority.
Assessment: Reading (not executed): Newton converges in a handful of iterations, far below the iteration cap, and a 0.1% looser tolerance changes the result below test tolerances. Convergence-budget mutants; equivalent for every tested input.

### 258. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — loop-bound-minus-1
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < ((maxIterations) - 1); iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Only a test at very high eccentricity near perihelion, asserting the iteration count or a tolerance near 1e-12, would see these. Low priority.
Assessment: Reading (not executed): Newton converges in a handful of iterations, far below the iteration cap, and a 0.1% looser tolerance changes the result below test tolerances. Convergence-budget mutants; equivalent for every tested input.

### 259. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — loop-bound-plus-1
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < ((maxIterations) + 1); iteration += 1) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Only a test at very high eccentricity near perihelion, asserting the iteration count or a tolerance near 1e-12, would see these. Low priority.
Assessment: Reading (not executed): Newton converges in a handful of iterations, far below the iteration cap, and a 0.1% looser tolerance changes the result below test tolerances. Convergence-budget mutants; equivalent for every tested input.

### 260. `porkchop/grid-compute.ts:72` — `buildLinspace` — arithmetic-swap (module-private helper)
```diff
- const step = (end - start) / (count - 1);
+ const step = (end - start) * (count - 1);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 261. `porkchop/grid-compute.ts:72` — `buildLinspace` — arithmetic-swap (module-private helper)
```diff
- const step = (end - start) / (count - 1);
+ const step = (end - start) / (count + 1);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 262. `porkchop/grid-compute.ts:101` — `magnitude3` — argument-swap (module-private helper)
```diff
- return Math.hypot(x, y, z);
+ return Math.hypot(y, x, z);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 263. `porkchop/grid-compute.ts:101` — `magnitude3` — argument-swap (module-private helper)
```diff
- return Math.hypot(x, y, z);
+ return Math.hypot(x, z, y);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 264. `porkchop/grid-compute.ts:116` — `mapBranches` — arithmetic-swap (module-private helper)
```diff
- const vInfArrX = branch.v2[0] - asteroidVelocityKmps[0];
+ const vInfArrX = branch.v2[0] + asteroidVelocityKmps[0];
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 265. `porkchop/grid-compute.ts:117` — `mapBranches` — arithmetic-swap (module-private helper)
```diff
- const vInfArrY = branch.v2[1] - asteroidVelocityKmps[1];
+ const vInfArrY = branch.v2[1] + asteroidVelocityKmps[1];
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 266. `porkchop/grid-compute.ts:118` — `mapBranches` — arithmetic-swap (module-private helper)
```diff
- const vInfArrZ = branch.v2[2] - asteroidVelocityKmps[2];
+ const vInfArrZ = branch.v2[2] + asteroidVelocityKmps[2];
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 267. `porkchop/grid-compute.ts:119` — `mapBranches` — argument-swap (module-private helper)
```diff
- const vInfDep = magnitude3(vInfDepX, vInfDepY, vInfDepZ);
+ const vInfDep = magnitude3(vInfDepY, vInfDepX, vInfDepZ);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 268. `porkchop/grid-compute.ts:119` — `mapBranches` — argument-swap (module-private helper)
```diff
- const vInfDep = magnitude3(vInfDepX, vInfDepY, vInfDepZ);
+ const vInfDep = magnitude3(vInfDepX, vInfDepZ, vInfDepY);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 269. `porkchop/grid-compute.ts:120` — `mapBranches` — argument-swap (module-private helper)
```diff
- const vInfArr = magnitude3(vInfArrX, vInfArrY, vInfArrZ);
+ const vInfArr = magnitude3(vInfArrY, vInfArrX, vInfArrZ);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. magnitude3 is Math.hypot, symmetric in its arguments.

### 270. `porkchop/grid-compute.ts:120` — `mapBranches` — argument-swap (module-private helper)
```diff
- const vInfArr = magnitude3(vInfArrX, vInfArrY, vInfArrZ);
+ const vInfArr = magnitude3(vInfArrX, vInfArrZ, vInfArrY);
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 271. `porkchop/grid-compute.ts:121` — `mapBranches` — argument-swap (module-private helper)
```diff
- const dlaDeg = branch.converged ? dlaDegFromVInf(vInfDepX, vInfDepY, vInfDepZ) : null;
+ const dlaDeg = branch.converged ? dlaDegFromVInf(vInfDepY, vInfDepX, vInfDepZ) : null;
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 272. `porkchop/grid-compute.ts:121` — `mapBranches` — argument-swap (module-private helper)
```diff
- const dlaDeg = branch.converged ? dlaDegFromVInf(vInfDepX, vInfDepY, vInfDepZ) : null;
+ const dlaDeg = branch.converged ? dlaDegFromVInf(vInfDepX, vInfDepZ, vInfDepY) : null;
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 273. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — loop-start-plus-1
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 1; index < vehicle.curve.length - 1; index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 274. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — loop-bound-plus-1
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 0; index < ((vehicle.curve.length - 1) + 1); index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 275. `porkchop/segment-windows.ts:213` — `segmentWindows` — loop-bound-plus-1
```diff
- for (let seed = 0; seed < cells.length; seed++) {
+ for (let seed = 0; seed < ((cells.length) + 1); seed++) {
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 276. `core/interpolators/hermite.ts:102` — `interpolateBodyStateSeries` — constant-nudge
```diff
- for (let i = 0; i < samples.length - 1; i++) {
+ for (let i = 0; i < samples.length - (1 * 1.001); i++) {
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 277. `core/interpolators/hermite.ts:117` — `interpolateBodyStateSeries` — constant-nudge
```diff
- maxTdbSeconds: samples[samples.length - 1]?.tdbSeconds ?? samples[0].tdbSeconds,
+ maxTdbSeconds: samples[samples.length - (1 * 1.001)]?.tdbSeconds ?? samples[0].tdbSeconds,
```
Layer math. 12 test file(s) executed this function and still passed (57 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-core-hermite-mars.test.mjs`, `v2-core-hermite-jupiter.test.mjs`, `v2-core-hermite-saturn.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-render-mars-system.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 278. `core/invariants/assertions.ts:209` — `assertKeplerianError` — constant-nudge
```diff
- measuredErrorKm: errorM / 1000,
+ measuredErrorKm: errorM / (1000 * 1.001),
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Same assertion, to better than 0.1%.
Assessment: Same unasserted context value as the previous mutant.

### 279. `core/invariants/assertions.ts:210` — `assertKeplerianError` — constant-nudge
```diff
- barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M / 1000,
+ barKm: ASTEROID_KEPLERIAN_ERROR_BAR_M / (1000 * 1.001),
```
Layer honesty. 3 test file(s) executed this function and still passed (54 import the module): `v2-core-keplerian.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Same assertion, exact.
Assessment: Same unasserted context value as the previous mutant.

### 280. `core/invariants/round-trip.ts:43` — `computeFrameRoundTripRelativeError` — constant-nudge
```diff
- return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
+ return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), (1 * 1.001));
```
Layer honesty. 8 test file(s) executed this function and still passed (54 import the module): `v2-core-frames-mars.test.mjs`, `v2-core-frames-saturn.test.mjs`, `v2-slice1-cutover.test.mjs`, `v2-core-frames-jupiter.test.mjs`, `v2-slice1-integration.test.mjs`, `v2-slice3-cutover.test.mjs`, `v2-slice4-cutover.test.mjs`, `v2-slice6-cutover.test.mjs`.
Suggested test: None needed unless near-zero states become a supported input.
Assessment: Equivalent in practice: the floor of 1 only matters for a state whose six-axis norm is between 1 and 1.001 (metres and metres per second); real states are ~1e11.

### 281. `core/lambert/dla.ts:28` — `dlaDegFromVInf` — constant-nudge
```diff
- const sinDla = Math.min(1, Math.max(-1, vz / mag));
+ const sinDla = Math.min((1 * 1.001), Math.max(-1, vz / mag));
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: dlaDegFromVInf(0, 0, v): assert exactly 90.
Assessment: Reading (not executed): |vz / mag| cannot exceed 1 by more than rounding, so an upper clamp of 1.001 only matters at exactly vertical v-infinity, where asin(1 + rounding) would be NaN.

### 282. `core/lambert/dla.ts:28` — `dlaDegFromVInf` — constant-nudge
```diff
- const sinDla = Math.min(1, Math.max(-1, vz / mag));
+ const sinDla = Math.min(1, Math.max(-(1 * 1.001), vz / mag));
```
Layer math. 4 test file(s) executed this function and still passed (20 import the module): `v2-lambert/dla.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: dlaDegFromVInf(0, 0, -v): assert exactly -90.
Assessment: Reading (not executed): vz / mag cannot be below -1 by more than rounding, so a lower clamp of -1.001 matters only at exactly vertical v-infinity.

### 283. `core/lambert/householder.ts:56` — `householder` — constant-nudge
```diff
- const numerator = fval * (fder * fder - (fval * fder2) / 2);
+ const numerator = fval * (fder * fder - (fval * fder2) / (2 * 1.001));
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that asserts the iteration count for a reference case (Izzo reports 2-3 for single-rev) would pin the update formula.
Assessment: Reading (not executed): these change the Householder update step, not the equation being solved, so the iteration still lands on the same root to within the tolerance (it may take more iterations). Convergence-rate mutants.

### 284. `core/lambert/householder.ts:57` — `householder` — constant-nudge
```diff
- const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / 6;
+ const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / (6 * 1.001);
```
Layer math. 5 test file(s) executed this function and still passed (23 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A test that asserts the iteration count for a reference case (Izzo reports 2-3 for single-rev) would pin the update formula.
Assessment: Reading (not executed): these change the Householder update step, not the equation being solved, so the iteration still lands on the same root to within the tolerance (it may take more iterations). Convergence-rate mutants.

### 285. `core/lambert/izzo.ts:69` — `lambert` — constant-nudge
```diff
- const rtol = opts.rtol ?? 1e-8;
+ const rtol = opts.rtol ?? (1e-8 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 286. `core/lambert/izzo.ts:70` — `lambert` — constant-nudge
```diff
- const max_iter = opts.max_iter ?? 35;
+ const max_iter = opts.max_iter ?? (35 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 287. `core/lambert/izzo.ts:103` — `lambert` — constant-nudge
```diff
- let lam = Math.sqrt(1 - Math.min(1.0, c_norm / s));
+ let lam = Math.sqrt(1 - Math.min((1.0 * 1.001), c_norm / s));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 288. `core/lambert/izzo.ts:118` — `lambert` — constant-nudge
```diff
- i_t1 = scale(i_t1, -1);
+ i_t1 = scale(i_t1, -(1 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 289. `core/lambert/izzo.ts:119` — `lambert` — constant-nudge
```diff
- i_t2 = scale(i_t2, -1);
+ i_t2 = scale(i_t2, -(1 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (4 import the module): `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`.
Suggested test: One izzo test with r1 x r2 pointing to -Z and one with prograde: false, each compared with a reference velocity.
Assessment: LOWER RISK. At 0d31cda no V2 production module imports this file; the grid uses lambert-multi-rev.ts. The three test files that run it never use a geometry with the orbit normal pointing south (i_h[2] < 0) or the retrograde option, so the sign handling is unpinned.

### 290. `core/lambert/lambert-multi-rev.ts:284` — `lambertMultiRev` — constant-nudge
```diff
- if (!Number.isInteger(M) || M < 0 || M > 2) {
+ if (!Number.isInteger(M) || M < 0 || M > (2 * 1.001)) {
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. M is checked to be an integer first, so M > 2 and M > 2.002 agree.

### 291. `core/lambert/stumpff.ts:32` — `stumpff_c2` — constant-nudge
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / (24 * 1.001) + (psi * psi) / 720 - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 292. `core/lambert/stumpff.ts:32` — `stumpff_c2` — constant-nudge
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / (720 * 1.001) - (psi * psi * psi) / 40320;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 293. `core/lambert/stumpff.ts:32` — `stumpff_c2` — constant-nudge
```diff
- return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
+ return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / (40320 * 1.001);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 294. `core/lambert/stumpff.ts:44` — `stumpff_c3` — constant-nudge
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / (120 * 1.001) + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 295. `core/lambert/stumpff.ts:44` — `stumpff_c3` — constant-nudge
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / (5040 * 1.001) - (psi * psi * psi) / 362880;
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 296. `core/lambert/stumpff.ts:44` — `stumpff_c3` — constant-nudge
```diff
- return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
+ return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / (362880 * 1.001);
```
Layer math. 1 test file(s) executed this function and still passed (1 import the module): `v2-lambert/stumpff.test.mjs`.
Suggested test: Either pin stumpff_c2 / stumpff_c3 at one value per branch (elliptic, hyperbolic, series) against a reference, or record that the module is unused.
Assessment: LOW RISK. At 0d31cda no V2 production module imports this file (grep over src/v2 and mcp/src; the legacy solver under src/physics has its own copy). Only its own test runs it, and that test does not pin the series or the hyperbolic branch.

### 297. `core/propagators/keplerian.ts:113` — `solveKeplerEquation` — constant-nudge
```diff
- if (eccentricity < 0 || eccentricity >= 1) {
+ if (eccentricity < 0 || eccentricity >= (1 * 1.001)) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: solveKeplerEquation(M, 1) and (M, 1.0005): assert the RangeError.
Assessment: Boundary not tested: eccentricity exactly 1 (and just above) handed to solveKeplerEquation.

### 298. `core/propagators/keplerian.ts:117` — `solveKeplerEquation` — constant-nudge
```diff
- const tolerance = options.toleranceRad ?? 1e-12;
+ const tolerance = options.toleranceRad ?? (1e-12 * 1.001);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Only a test at very high eccentricity near perihelion, asserting the iteration count or a tolerance near 1e-12, would see these. Low priority.
Assessment: Reading (not executed): Newton converges in a handful of iterations, far below the iteration cap, and a 0.1% looser tolerance changes the result below test tolerances. Convergence-budget mutants; equivalent for every tested input.

### 299. `core/propagators/keplerian.ts:118` — `solveKeplerEquation` — constant-nudge
```diff
- const maxIterations = options.maxIterations ?? 50;
+ const maxIterations = options.maxIterations ?? (50 * 1.001);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 300. `core/propagators/keplerian.ts:120` — `solveKeplerEquation` — constant-nudge
```diff
- let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
+ let eccentricAnomaly = eccentricity < (0.8 * 1.001) ? meanAnomaly : (meanAnomaly >= 0 ? Math.PI : -Math.PI);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 301. `core/propagators/keplerian.ts:122` — `solveKeplerEquation` — constant-nudge
```diff
- for (let iteration = 0; iteration < maxIterations; iteration += 1) {
+ for (let iteration = 0; iteration < maxIterations; iteration += (1 * 1.001)) {
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: Only a test at very high eccentricity near perihelion, asserting the iteration count or a tolerance near 1e-12, would see these. Low priority.
Assessment: Reading (not executed): Newton converges in a handful of iterations, far below the iteration cap, and a 0.1% looser tolerance changes the result below test tolerances. Convergence-budget mutants; equivalent for every tested input.

### 302. `core/propagators/keplerian.ts:124` — `solveKeplerEquation` — constant-nudge
```diff
- const fp = 1 - eccentricity * Math.cos(eccentricAnomaly);
+ const fp = (1 * 1.001) - eccentricity * Math.cos(eccentricAnomaly);
```
Layer math. 9 test file(s) executed this function and still passed (59 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 303. `core/propagators/keplerian.ts:167` — `sampleOrbitEllipse` — constant-nudge
```diff
- if (!Number.isInteger(segmentCount) || segmentCount < 3) {
+ if (!Number.isInteger(segmentCount) || segmentCount < (3 * 1.001)) {
```
Layer math. 5 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 304. `porkchop/compare-data.ts:270` — `computeCompareData` — constant-nudge
```diff
- `'${body.bodyId}' is selection ${index + 1} of ${bodies.length}`,
+ `'${body.bodyId}' is selection ${index + (1 * 1.001)} of ${bodies.length}`,
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: Assert the detail string of a cap-exceeded refusal (selection 6 of 6).
Assessment: Low: the mutated number appears only in the cap-exceeded refusal detail text, which is not asserted.

### 305. `porkchop/composite-grid.ts:139` — `compositeGrids` — constant-nudge
```diff
- fromM0 += 1;
+ fromM0 += (1 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: On a small composite with a known split, assert counts.fromM0 and counts.fromM1 exactly.
Assessment: The per-family provenance counters (cells taken from M = 0 / from M = 1) are not asserted as exact integers: adding 1.001 per cell goes unnoticed.

### 306. `porkchop/composite-grid.ts:155` — `compositeGrids` — constant-nudge
```diff
- fromM0 += 1;
+ fromM0 += (1 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 307. `porkchop/composite-grid.ts:159` — `compositeGrids` — constant-nudge
```diff
- fromM1 += 1;
+ fromM1 += (1 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (14 import the module): `src/v2/porkchop/composite-grid.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: On a small composite with a known split, assert counts.fromM0 and counts.fromM1 exactly.
Assessment: The per-family provenance counters (cells taken from M = 0 / from M = 1) are not asserted as exact integers: adding 1.001 per cell goes unnoticed.

### 308. `porkchop/delta-v.ts:24` — `injectionDvFromC3` — constant-nudge
```diff
- const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + (2 * muKm3PerS2) / parkingRadiusKm);
+ const hyperbolicPerigeeVelocityKmps = Math.sqrt(c3Km2PerS2 + ((2 * 1.001) * muKm3PerS2) / parkingRadiusKm);
```
Layer math. 2 test file(s) executed this function and still passed (3 import the module): `src/v2/porkchop/delta-v.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: Pin injectionDvFromC3 against an independently computed value: C3 = 0 gives 3.2243 km/s and C3 = 10 gives 3.6695 km/s from the 6,578.137 km parking orbit (values printed by the production function at 0d31cda; confirm them by hand or against an oracle before pinning). Assert to 1e-6.
Assessment: REAL GAP (math, shipped dV stack). Read from the test file: delta-v.test.mjs asserts the structure of the stack (departure is 0 or the arrival v-infinity, margin is the fraction of the subtotal, one-way total is below sample-return total) and never a numeric value of injectionDvFromC3. The other test that runs it (v2-dla-render) passes too. The injection formula is unpinned.

### 309. `porkchop/format-c3.ts:20` — `formatC3` — constant-nudge
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude < (1e-4 * 1.001) || magnitude >= 1e5)) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(1.0005e-4): assert the plain (non-exponential) form.
Assessment: Same switch point as the line above, reached through the constant.

### 310. `porkchop/format-c3.ts:20` — `formatC3` — constant-nudge
```diff
- if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
+ if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= (1e5 * 1.001))) {
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatC3(100_050): assert the exponential form.
Assessment: Same switch point as the line above, reached through the constant.

### 311. `porkchop/format-c3.ts:21` — `formatC3` — constant-nudge
```diff
- return c3.toExponential(2);
+ return c3.toExponential((2 * 1.001));
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toExponential truncates its argument to an integer.

### 312. `porkchop/format-c3.ts:23` — `formatC3` — constant-nudge
```diff
- const precise = c3.toPrecision(3);
+ const precise = c3.toPrecision((3 * 1.001));
```
Layer honesty. 5 test file(s) executed this function and still passed (18 import the module): `src/v2/app/catalog-list/row.test.mjs`, `v2-design-components.test.mjs`, `v2-dla-render.test.mjs`, `v2-a11y-floor.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toPrecision truncates its argument to an integer.

### 313. `porkchop/launch-vehicles.ts:229` — `payloadAtC3` — constant-nudge
```diff
- for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
+ for (let index = 0; index < vehicle.curve.length - (1 * 1.001); index += 1) {
```
Layer math. 4 test file(s) executed this function and still passed (8 import the module): `src/v2/porkchop/launch-vehicles.test.mjs`, `v2-compare-data.test.mjs`, `v2-dla-render.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 314. `porkchop/propagation-guard.ts:82` — `assessPropagation` — constant-nudge
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e < 0 || elements.e >= (1 * 1.001)) {
```
Layer honesty. 4 test file(s) executed this function and still passed (23 import the module): `src/v2/porkchop/propagation-guard.test.mjs`, `v2-compare-data.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: assessPropagation with e = 1.0005 and aM > 0: assert the refusal.
Assessment: Same boundary as the line above, reached through the constant: e in [1, 1.001) with aM > 0 is never tested.

### 315. `porkchop/segment-windows.ts:205` — `segmentWindows` — constant-nudge
```diff
- member[i] = 1;
+ member[i] = (1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. member and visited are Uint8Array; 1.001 is stored as 1.

### 316. `porkchop/segment-windows.ts:217` — `segmentWindows` — constant-nudge
```diff
- visited[seed] = 1;
+ visited[seed] = (1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. member and visited are Uint8Array; 1.001 is stored as 1.

### 317. `porkchop/segment-windows.ts:220` — `segmentWindows` — constant-nudge
```diff
- let argDep = -1;
+ let argDep = -(1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): argDep and argTof are overwritten by the first cell popped (its C3 is below the Infinity start value), so the starting value never survives. Equivalent.

### 318. `porkchop/segment-windows.ts:221` — `segmentWindows` — constant-nudge
```diff
- let argTof = -1;
+ let argTof = -(1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 319. `porkchop/segment-windows.ts:255` — `segmentWindows` — constant-nudge
```diff
- visited[nIdx] = 1;
+ visited[nIdx] = (1 * 1.001);
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 320. `porkchop/tier-disclosure.ts:66` — `formatMillionKm` — constant-nudge
```diff
- const millions = Number((km / 1e6).toPrecision(3));
+ const millions = Number((km / (1e6 * 1.001)).toPrecision(3));
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: formatMillionKm(253_600_000): assert '254 million' (the mutant gives '253 million').
Assessment: Weak gap. The tested value rounds to the same three significant figures after a 0.1% change, so the divisor is pinned only to about 0.2%.

### 321. `porkchop/tier-disclosure.ts:66` — `formatMillionKm` — constant-nudge
```diff
- const millions = Number((km / 1e6).toPrecision(3));
+ const millions = Number((km / 1e6).toPrecision((3 * 1.001)));
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toPrecision truncates its argument to an integer.

### 322. `porkchop/tier-disclosure.ts:76` — `formatMetersPerSecond` — constant-nudge
```diff
- if (mps >= 100) {
+ if (mps >= (100 * 1.001)) {
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: formatMetersPerSecond(0.10005): assert '100' (the mutant returns '100.0' or '100.1').
Assessment: Same switch point as the line above, reached through the constant.

### 323. `porkchop/tier-disclosure.ts:79` — `formatMetersPerSecond` — constant-nudge
```diff
- return mps.toFixed(1);
+ return mps.toFixed((1 * 1.001));
```
Layer honesty. 3 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`, `src/v2/app/catalog-list/row.test.mjs`, `v2-compare-honesty.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toFixed truncates its argument to an integer, so toFixed(1.001) is toFixed(1).

### 324. `porkchop/tier-disclosure.ts:83` — `formatAu` — constant-nudge
```diff
- return Number.isFinite(au) ? au.toFixed(2) : null;
+ return Number.isFinite(au) ? au.toFixed((2 * 1.001)) : null;
```
Layer honesty. 1 test file(s) executed this function and still passed (21 import the module): `v2-tier-disclosure.test.mjs`.
Suggested test: None needed.
Assessment: EQUIVALENT MUTANT. toFixed truncates its argument to an integer, so toFixed(2.002) is toFixed(2).

### 325. `core/lambert/lambert-multi-rev.ts:111` — `halleyForTMin` — loop-start-plus-1 (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 1; iter < MAX_ITER; iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 326. `core/lambert/lambert-multi-rev.ts:111` — `halleyForTMin` — loop-bound-minus-1 (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < ((MAX_ITER) - 1); iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 327. `core/lambert/lambert-multi-rev.ts:111` — `halleyForTMin` — loop-bound-plus-1 (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < ((MAX_ITER) + 1); iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 328. `core/lambert/lambert-multi-rev.ts:160` — `solveOneBranch` — loop-start-plus-1 (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 1; iter < MAX_ITER; iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 329. `core/lambert/lambert-multi-rev.ts:160` — `solveOneBranch` — loop-bound-minus-1 (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < ((MAX_ITER) - 1); iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 330. `core/lambert/lambert-multi-rev.ts:160` — `solveOneBranch` — loop-bound-plus-1 (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < ((MAX_ITER) + 1); iter += 1) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 331. `core/lambert/lambert-multi-rev.ts:70` — `buildGeometry` — constant-nudge (module-private helper)
```diff
- let lambda = Math.sqrt(1 - Math.min(1, cMag / s));
+ let lambda = Math.sqrt(1 - Math.min((1 * 1.001), cMag / s));
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: None needed.
Assessment: Reading (not executed): cMag / s cannot exceed 1 (triangle inequality: the chord is at most the semiperimeter), so the clamp at 1 versus 1.001 differs only if rounding pushes the ratio above 1.

### 332. `core/lambert/lambert-multi-rev.ts:85` — `buildGeometry` — constant-nudge (module-private helper)
```diff
- iT1 = scale(iT1, -1);
+ iT1 = scale(iT1, -(1 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: lambertMultiRev with lw = false compared against a reference solution, asserting the full v1 and v2 vectors.
Assessment: REAL GAP for the retrograde option only. The sign flips inside the if (!prograde) block survive: no multi-rev test passes lw = false (grep of the two multi-rev test files finds none). The production grid always passes true (grid-compute.ts:193), so nothing shipped takes this branch today.

### 333. `core/lambert/lambert-multi-rev.ts:86` — `buildGeometry` — constant-nudge (module-private helper)
```diff
- iT2 = scale(iT2, -1);
+ iT2 = scale(iT2, -(1 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 334. `core/lambert/lambert-multi-rev.ts:97` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), 2 / 3);
+ const leftBase = Math.pow(((M + (1 * 1.001)) * Math.PI) / (8 * T), 2 / 3);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 335. `core/lambert/lambert-multi-rev.ts:97` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), 2 / 3);
+ const leftBase = Math.pow(((M + 1) * Math.PI) / ((8 * 1.001) * T), 2 / 3);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 336. `core/lambert/lambert-multi-rev.ts:97` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), 2 / 3);
+ const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), (2 * 1.001) / 3);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 337. `core/lambert/lambert-multi-rev.ts:97` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), 2 / 3);
+ const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), 2 / (3 * 1.001));
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 338. `core/lambert/lambert-multi-rev.ts:98` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const rightBase = Math.pow((8 * T) / (M * Math.PI), 2 / 3);
+ const rightBase = Math.pow(((8 * 1.001) * T) / (M * Math.PI), 2 / 3);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 339. `core/lambert/lambert-multi-rev.ts:98` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const rightBase = Math.pow((8 * T) / (M * Math.PI), 2 / 3);
+ const rightBase = Math.pow((8 * T) / (M * Math.PI), (2 * 1.001) / 3);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 340. `core/lambert/lambert-multi-rev.ts:98` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const rightBase = Math.pow((8 * T) / (M * Math.PI), 2 / 3);
+ const rightBase = Math.pow((8 * T) / (M * Math.PI), 2 / (3 * 1.001));
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 341. `core/lambert/lambert-multi-rev.ts:99` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const x0Left = (leftBase - 1) / (leftBase + 1);
+ const x0Left = (leftBase - (1 * 1.001)) / (leftBase + 1);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 342. `core/lambert/lambert-multi-rev.ts:99` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const x0Left = (leftBase - 1) / (leftBase + 1);
+ const x0Left = (leftBase - 1) / (leftBase + (1 * 1.001));
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 343. `core/lambert/lambert-multi-rev.ts:100` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const x0Right = (rightBase - 1) / (rightBase + 1);
+ const x0Right = (rightBase - (1 * 1.001)) / (rightBase + 1);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 344. `core/lambert/lambert-multi-rev.ts:100` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- const x0Right = (rightBase - 1) / (rightBase + 1);
+ const x0Right = (rightBase - 1) / (rightBase + (1 * 1.001));
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 345. `core/lambert/lambert-multi-rev.ts:103` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- return clamp(x0Left, -1 + EPSILON, -EPSILON);
+ return clamp(x0Left, -(1 * 1.001) + EPSILON, -EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 346. `core/lambert/lambert-multi-rev.ts:105` — `initialGuessMultiRev` — constant-nudge (module-private helper)
```diff
- return clamp(x0Right, EPSILON, 1 - EPSILON);
+ return clamp(x0Right, EPSILON, (1 * 1.001) - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: Only an assertion on iteration count (or on the initial guess itself, exported for the purpose) would see these. Low priority; note that a starting guess pushed outside (-1, 1) is caught by the clamp.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route.

### 347. `core/lambert/lambert-multi-rev.ts:109` — `halleyForTMin` — constant-nudge (module-private helper)
```diff
- let x = 0.1;
+ let x = (0.1 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 348. `core/lambert/lambert-multi-rev.ts:111` — `halleyForTMin` — constant-nudge (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < MAX_ITER; iter += (1 * 1.001)) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 349. `core/lambert/lambert-multi-rev.ts:124` — `halleyForTMin` — constant-nudge (module-private helper)
```diff
- const denominator = 2 * fDoublePrime * fDoublePrime - fPrime * fTriplePrime;
+ const denominator = (2 * 1.001) * fDoublePrime * fDoublePrime - fPrime * fTriplePrime;
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 350. `core/lambert/lambert-multi-rev.ts:129` — `halleyForTMin` — constant-nudge (module-private helper)
```diff
- const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - ((2 * 1.001) * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 351. `core/lambert/lambert-multi-rev.ts:129` — `halleyForTMin` — constant-nudge (module-private helper)
```diff
- const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -(1 * 1.001) + EPSILON, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 352. `core/lambert/lambert-multi-rev.ts:129` — `halleyForTMin` — constant-nudge (module-private helper)
```diff
- const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, (1 * 1.001) - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: tMinForM pinned at several lambda values to a tolerance near 1e-10 would catch a wrong minimum; a direct test with a lambda that makes the derivatives degenerate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The guards in this function (non-finite y, zero or non-finite derivatives) are also never reached by a test.

### 353. `core/lambert/lambert-multi-rev.ts:160` — `solveOneBranch` — constant-nudge (module-private helper)
```diff
- for (let iter = 0; iter < MAX_ITER; iter += 1) {
+ for (let iter = 0; iter < MAX_ITER; iter += (1 * 1.001)) {
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 354. `core/lambert/lambert-multi-rev.ts:175` — `solveOneBranch` — constant-nudge (module-private helper)
```diff
- const numerator = fValue * (fPrime * fPrime - (fValue * fDoublePrime) / 2);
+ const numerator = fValue * (fPrime * fPrime - (fValue * fDoublePrime) / (2 * 1.001));
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 355. `core/lambert/lambert-multi-rev.ts:177` — `solveOneBranch` — constant-nudge (module-private helper)
```diff
- fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;
+ fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / (6 * 1.001);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 356. `core/lambert/lambert-multi-rev.ts:191` — `solveOneBranch` — constant-nudge (module-private helper)
```diff
- const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - numerator / denominator, -(1 * 1.001) + EPSILON, 1 - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 357. `core/lambert/lambert-multi-rev.ts:191` — `solveOneBranch` — constant-nudge (module-private helper)
```diff
- const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 - EPSILON);
+ const next = clamp(x - numerator / denominator, -1 + EPSILON, (1 * 1.001) - EPSILON);
```
Layer math. 2 test file(s) executed this function and still passed (20 import the module): `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: An assertion on the iteration count for a reference M = 1 case would pin the update formula; a constructed non-finite intermediate would pin the guards.
Assessment: Reading (not executed): an iteration-path mutant. It changes the starting point, the step or the iteration budget of a root-finder, not the equation being solved, so the solver still lands on the same root within its tolerance. The pinned-value tests check the answer, not the route. The non-finite guards in the loop are never reached by a test.

### 358. `core/lambert/tof.ts:42` — `compute_psi` — constant-nudge (module-private helper)
```diff
- if (x >= -1 && x < 1) {
+ if (x >= -(1 * 1.001) && x < 1) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_psi (through tof_equation) at x = 1 exactly and x = -1 exactly, asserting the documented branch value.
Assessment: Boundaries not tested: x exactly -1, exactly 1 and just outside (the elliptic / hyperbolic / parabolic switch).

### 359. `core/lambert/tof.ts:42` — `compute_psi` — constant-nudge (module-private helper)
```diff
- if (x >= -1 && x < 1) {
+ if (x >= -1 && x < (1 * 1.001)) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_psi (through tof_equation) at x = 1 exactly and x = -1 exactly, asserting the documented branch value.
Assessment: Boundaries not tested: x exactly -1, exactly 1 and just outside (the elliptic / hyperbolic / parabolic switch).

### 360. `core/lambert/tof.ts:45` — `compute_psi` — constant-nudge (module-private helper)
```diff
- if (x > 1) {
+ if (x > (1 * 1.001)) {
```
Layer math. 7 test file(s) executed this function and still passed (24 import the module): `v2-lambert/householder.test.mjs`, `v2-lambert/lambert-endtoend.test.mjs`, `v2-lambert/tof.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `v2-lambert/lambert-multi-rev-rejection.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: compute_psi (through tof_equation) at x = 1 exactly and x = -1 exactly, asserting the documented branch value.
Assessment: Boundaries not tested: x exactly -1, exactly 1 and just outside (the elliptic / hyperbolic / parabolic switch).

### 361. `core/propagators/keplerian.ts:59` — `validateKeplerianElements` — constant-nudge (module-private helper)
```diff
- if (elements.e < 0 || elements.e >= 1) {
+ if (elements.e < 0 || elements.e >= (1 * 1.001)) {
```
Layer math. 11 test file(s) executed this function and still passed (59 import the module): `v2-core-orbit-sampling.test.mjs`, `v2-render-asteroid-orbits.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `v2-lambert/lambert-multi-rev.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`, `v2-core-keplerian.test.mjs`, `v2-boundary-slice7.test.mjs`, `v2-slice7-cutover.test.mjs`, `v2-render-asteroid-renderer.test.mjs`, `v2-render-asteroid-points-shader.test.mjs`, `v2-slice8-cutover.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 362. `porkchop/compare-data.ts:241` — `cellWidth` — constant-nudge (module-private helper)
```diff
- return count <= 1 ? 0 : (end - start) / (count - 1);
+ return count <= (1 * 1.001) ? 0 : (end - start) / (count - 1);
```
Layer math. 2 test file(s) executed this function and still passed (4 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 363. `porkchop/grid-compute.ts:68` — `buildLinspace` — constant-nudge (module-private helper)
```diff
- if (count <= 1) {
+ if (count <= (1 * 1.001)) {
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 364. `porkchop/grid-compute.ts:72` — `buildLinspace` — constant-nudge (module-private helper)
```diff
- const step = (end - start) / (count - 1);
+ const step = (end - start) / (count - (1 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (19 import the module): `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`, `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 365. `porkchop/segment-windows.ts:95` — `jdToIsoDate` — constant-nudge (module-private helper)
```diff
- return new Date((jd - 2440587.5) * 86_400_000).toISOString().slice(0, 10);
+ return new Date((jd - 2440587.5) * 86_400_000).toISOString().slice(0, (10 * 1.001));
```
Layer math. 3 test file(s) executed this function and still passed (5 import the module): `v2-segment-windows.test.mjs`, `v2-compare-data.test.mjs`, `src/v2/porkchop/propagation-guard.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 366. `porkchop/porkchop-client.ts:44` — `createPorkchopClient` — guard-removal
```diff
- if (!message || typeof message !== 'object') { return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 367. `porkchop/porkchop-client.ts:56` — `createPorkchopClient` — guard-removal
```diff
- if (message.type === 'error') { const error = new Error(message.reason); if (!isReady) { readyReject?.(error); readyResolve = null; readyReject = null; retu ...
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 368. `porkchop/porkchop-client.ts:58` — `createPorkchopClient` — guard-removal
```diff
- if (!isReady) { readyReject?.(error); readyResolve = null; readyReject = null; return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 369. `porkchop/porkchop-client.ts:77` — `createPorkchopClient` — guard-removal
```diff
- if (!isReady) { readyReject?.(error); readyResolve = null; readyReject = null; return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 370. `porkchop/porkchop-client.ts:96` — `createPorkchopClient` — guard-removal
```diff
- if (disposed) { throw new Error('Porkchop client has been disposed'); }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 371. `porkchop/porkchop-client.ts:99` — `createPorkchopClient` — guard-removal
```diff
- if (pendingRequest !== null) { throw new Error('Porkchop client already has a compute in flight'); }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (14 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 372. `porkchop/porkchop.worker.ts:107` — `installPorkchopWorker` — guard-removal
```diff
- if (!message || typeof message !== 'object') { return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (15 import the module): `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 373. `porkchop/porkchop.worker.ts:120` — `installPorkchopWorker` — guard-removal
```diff
- if (message.type !== 'compute-grid') { return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (15 import the module): `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 374. `porkchop/porkchop.worker.ts:124` — `installPorkchopWorker` — guard-removal
```diff
- if (earthStateSeries.length === 0) { scope.postMessage({ type: 'error', reason: 'Porkchop worker received compute-grid before init', }); return; }
+ ;
```
Layer plumbing. 1 test file(s) executed this function and still passed (15 import the module): `src/v2/porkchop/grid-compute.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 375. `porkchop/colormap.ts:23` — `clamp01` — guard-removal (module-private helper)
```diff
- if (value <= 0) { return 0; }
+ ;
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 376. `porkchop/colormap.ts:26` — `clamp01` — guard-removal (module-private helper)
```diff
- if (value >= 1) { return 1; }
+ ;
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 377. `porkchop/colormap.ts:46` — `c3ToViridisRgb` — relational-swap
```diff
- for (let index = 1; index < VIRIDIS_STOPS.length; index += 1) {
+ for (let index = 1; index <= VIRIDIS_STOPS.length; index += 1) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 378. `porkchop/colormap.ts:49` — `c3ToViridisRgb` — relational-swap
```diff
- if (normalized > next.t) {
+ if (normalized >= next.t) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 379. `porkchop/compare-url.ts:46` — `parseCompareBodies` — sign-flip
```diff
- if (questionIdx !== -1) {
+ if (questionIdx !== 1) {
```
Layer plumbing. 1 test file(s) executed this function and still passed (3 import the module): `v2-compare-url.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 380. `porkchop/colormap.ts:40` — `c3ToViridisRgb` — argument-swap
```diff
- const c3ClampedToFloor = Math.max(c3Km2S2, C3_COLOR_MIN);
+ const c3ClampedToFloor = Math.max(C3_COLOR_MIN, c3Km2S2);
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 381. `porkchop/colormap.ts:42` — `c3ToViridisRgb` — arithmetic-swap
```diff
- (Math.log(c3ClampedToFloor) - Math.log(C3_COLOR_MIN)) /
+ (Math.log(c3ClampedToFloor) + Math.log(C3_COLOR_MIN)) /
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 382. `porkchop/colormap.ts:43` — `c3ToViridisRgb` — arithmetic-swap
```diff
- (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
+ (Math.log(C3_COLOR_MAX) + Math.log(C3_COLOR_MIN)),
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 383. `porkchop/colormap.ts:60` — `c3ToViridisRgb` — arithmetic-swap
```diff
- return VIRIDIS_STOPS[VIRIDIS_STOPS.length - 1].rgb;
+ return VIRIDIS_STOPS[VIRIDIS_STOPS.length + 1].rgb;
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 384. `porkchop/colormap.ts:23` — `clamp01` — relational-swap (module-private helper)
```diff
- if (value <= 0) {
+ if (value < 0) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 385. `porkchop/colormap.ts:26` — `clamp01` — relational-swap (module-private helper)
```diff
- if (value >= 1) {
+ if (value > 1) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 386. `porkchop/colormap.ts:46` — `c3ToViridisRgb` — loop-bound-plus-1
```diff
- for (let index = 1; index < VIRIDIS_STOPS.length; index += 1) {
+ for (let index = 1; index < ((VIRIDIS_STOPS.length) + 1); index += 1) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 387. `porkchop/colormap.ts:60` — `c3ToViridisRgb` — constant-nudge
```diff
- return VIRIDIS_STOPS[VIRIDIS_STOPS.length - 1].rgb;
+ return VIRIDIS_STOPS[VIRIDIS_STOPS.length - (1 * 1.001)].rgb;
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 388. `porkchop/compare-url.ts:46` — `parseCompareBodies` — constant-nudge
```diff
- if (questionIdx !== -1) {
+ if (questionIdx !== -(1 * 1.001)) {
```
Layer plumbing. 1 test file(s) executed this function and still passed (3 import the module): `v2-compare-url.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 389. `porkchop/compare-url.ts:47` — `parseCompareBodies` — constant-nudge
```diff
- query = query.slice(questionIdx + 1);
+ query = query.slice(questionIdx + (1 * 1.001));
```
Layer plumbing. 1 test file(s) executed this function and still passed (3 import the module): `v2-compare-url.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 390. `porkchop/colormap.ts:26` — `clamp01` — constant-nudge (module-private helper)
```diff
- if (value >= 1) {
+ if (value >= (1 * 1.001)) {
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 391. `porkchop/colormap.ts:27` — `clamp01` — constant-nudge (module-private helper)
```diff
- return 1;
+ return (1 * 1.001);
```
Layer plumbing. 3 test file(s) executed this function and still passed (16 import the module): `src/v2/porkchop/colormap.test.mjs`, `v2-porkchop-honesty.test.mjs`, `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 392. `porkchop/porkchop-view.ts:549` — `getSelectedBranchDla` — guard-removal
```diff
- if (cell.status !== 'ok' || cell.selectedBranch === null) { return null; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 393. `porkchop/porkchop-view.ts:600` — `buildContourSegments` — guard-removal
```diff
- if (bottomLeft === null || bottomRight === null || topRight === null || topLeft === null) { continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 394. `porkchop/porkchop-view.ts:608` — `buildContourSegments` — guard-removal
```diff
- if (v0 === null || v1 === null || v2 === null || v3 === null) { continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 395. `porkchop/porkchop-view.ts:618` — `buildContourSegments` — guard-removal
```diff
- if (edgePairs.length === 0) { continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 396. `porkchop/porkchop-view.ts:714` — `PorkchopView` — guard-removal
```diff
- if (propagation.propagatable === false) { // S18 Item 1: never hand a non-elliptical orbit to the worker — the // propagator throws RangeError on it (keplerian.ts validateKeplerianElements ...
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 397. `porkchop/porkchop-view.ts:752` — `PorkchopView` — guard-removal
```diff
- if (cancelled) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 398. `porkchop/porkchop-view.ts:759` — `PorkchopView` — guard-removal
```diff
- if (cancelled) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 399. `porkchop/porkchop-view.ts:798` — `PorkchopView` — guard-removal
```diff
- if (!context) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 400. `porkchop/porkchop-view.ts:806` — `PorkchopView` — guard-removal
```diff
- if (!offscreenContext) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 401. `porkchop/porkchop-view.ts:843` — `PorkchopView` — guard-removal
```diff
- if (!isArrivalAfterEncounter(cell, boundary)) { continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 402. `porkchop/porkchop-view.ts:866` — `PorkchopView` — guard-removal
```diff
- if (tofIndex < 0 || tofIndex > props.gridParams.nTof - 1) { started = false; continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 403. `porkchop/porkchop-view.ts:899` — `PorkchopView` — guard-removal
```diff
- if (cell.status !== 'ok' || cell.M !== 1) { continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 404. `porkchop/porkchop-view.ts:908` — `PorkchopView` — guard-removal
```diff
- if (cell !== minimumCell && (depIndex + rowFromTop) % 2 !== 0) { continue; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 405. `porkchop/porkchop-view.ts:980` — `PorkchopView` — guard-removal
```diff
- if (indices === null) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 406. `porkchop/porkchop-view.ts:1108` — `PorkchopView` — guard-removal
```diff
- if (indices === null) { props.onGlobalMinimumCellRectChange?.(null); return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 407. `porkchop/porkchop-view.ts:1132` — `PorkchopView` — guard-removal
```diff
- if ( props.pinGlobalMinimumRequestId === undefined || props.pinGlobalMinimumRequestId <= 0 || globalMinimumCell === null ) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 408. `porkchop/porkchop-view.ts:1248` — `PorkchopView` — guard-removal
```diff
- if (cells === null || props.validatedTarget === undefined) { return; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 409. `porkchop/porkchop-view.ts:259` — `buildDlaContourLevels` — sign-flip
```diff
- { value: -site.iMinDeg, strokeStyle: '#22c55e' },
+ { value: site.iMinDeg, strokeStyle: '#22c55e' },
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 410. `porkchop/porkchop-view.ts:261` — `buildDlaContourLevels` — sign-flip
```diff
- { value: -site.dlaCeilingDeg, strokeStyle: '#ef4444' },
+ { value: site.dlaCeilingDeg, strokeStyle: '#ef4444' },
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.

### 411. `porkchop/porkchop-view.ts:318` — `getCellAtGridIndices` — guard-removal (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) { return null; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 412. `porkchop/porkchop-view.ts:331` — `getCellAtCoordinates` — guard-removal (module-private helper)
```diff
- if (rect.width <= 0 || rect.height <= 0) { return null; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 413. `porkchop/porkchop-view.ts:376` — `buildPinnedReadout` — guard-removal (module-private helper)
```diff
- if (cell.status !== 'ok' || cell.selectedBranch === null) { return { status: cell.status, depJD: cell.depJD, arrivalJD: cell.depJD + cell.tofDays, tofDays: cell.tofDays,  ...
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 414. `porkchop/porkchop-view.ts:414` — `renderFeasibilityBadge` — guard-removal (module-private helper)
```diff
- if (feasibility === null) { return null; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 415. `porkchop/porkchop-view.ts:437` — `getGridIndicesForCell` — guard-removal (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) { return null; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 416. `porkchop/porkchop-view.ts:527` — `getSelectedBranchC3` — guard-removal (module-private helper)
```diff
- if (cell.status !== 'ok' || cell.selectedBranch === null) { return null; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 417. `porkchop/porkchop-view.ts:557` — `interpolateEdge` — guard-removal (module-private helper)
```diff
- if (delta === 0) { return 0.5; }
+ ;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that drives this guard's condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.

### 418. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — relational-swap
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 0; depIndex <= gridParams.nDep - 1; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 419. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — relational-swap
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex <= gridParams.nTof - 1; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 420. `porkchop/porkchop-view.ts:613` — `buildContourSegments` — relational-swap
```diff
- (v0 >= level ? 1 : 0) |
+ (v0 > level ? 1 : 0) |
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 421. `porkchop/porkchop-view.ts:614` — `buildContourSegments` — relational-swap
```diff
- (v1 >= level ? 2 : 0) |
+ (v1 > level ? 2 : 0) |
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 422. `porkchop/porkchop-view.ts:615` — `buildContourSegments` — relational-swap
```diff
- (v2 >= level ? 4 : 0) |
+ (v2 > level ? 4 : 0) |
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 423. `porkchop/porkchop-view.ts:616` — `buildContourSegments` — relational-swap
```diff
- (v3 >= level ? 8 : 0);
+ (v3 > level ? 8 : 0);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 424. `porkchop/porkchop-view.ts:840` — `PorkchopView` — relational-swap
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex <= props.gridParams.nDep; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 425. `porkchop/porkchop-view.ts:841` — `PorkchopView` — relational-swap
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex <= props.gridParams.nTof; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 426. `porkchop/porkchop-view.ts:853` — `PorkchopView` — relational-swap
```diff
- props.gridParams.nTof > 1
+ props.gridParams.nTof >= 1
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 427. `porkchop/porkchop-view.ts:863` — `PorkchopView` — relational-swap
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex <= props.gridParams.nDep; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 428. `porkchop/porkchop-view.ts:866` — `PorkchopView` — relational-swap
```diff
- if (tofIndex < 0 || tofIndex > props.gridParams.nTof - 1) {
+ if (tofIndex <= 0 || tofIndex > props.gridParams.nTof - 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 429. `porkchop/porkchop-view.ts:866` — `PorkchopView` — relational-swap
```diff
- if (tofIndex < 0 || tofIndex > props.gridParams.nTof - 1) {
+ if (tofIndex < 0 || tofIndex >= props.gridParams.nTof - 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 430. `porkchop/porkchop-view.ts:1134` — `PorkchopView` — relational-swap
```diff
- props.pinGlobalMinimumRequestId <= 0 ||
+ props.pinGlobalMinimumRequestId < 0 ||
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 431. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — arithmetic-swap
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 0; depIndex < gridParams.nDep + 1; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 432. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — arithmetic-swap
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < gridParams.nTof + 1; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 433. `porkchop/porkchop-view.ts:595` — `buildContourSegments` — argument-swap
```diff
- const bottomLeft = getCellAtGridIndices(depIndex, tofIndex, cells, gridParams);
+ const bottomLeft = getCellAtGridIndices(tofIndex, depIndex, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 434. `porkchop/porkchop-view.ts:596` — `buildContourSegments` — argument-swap
```diff
- const bottomRight = getCellAtGridIndices(depIndex + 1, tofIndex, cells, gridParams);
+ const bottomRight = getCellAtGridIndices(tofIndex, depIndex + 1, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 435. `porkchop/porkchop-view.ts:596` — `buildContourSegments` — arithmetic-swap
```diff
- const bottomRight = getCellAtGridIndices(depIndex + 1, tofIndex, cells, gridParams);
+ const bottomRight = getCellAtGridIndices(depIndex - 1, tofIndex, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 436. `porkchop/porkchop-view.ts:597` — `buildContourSegments` — argument-swap
```diff
- const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + 1, cells, gridParams);
+ const topRight = getCellAtGridIndices(tofIndex + 1, depIndex + 1, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 437. `porkchop/porkchop-view.ts:597` — `buildContourSegments` — arithmetic-swap
```diff
- const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + 1, cells, gridParams);
+ const topRight = getCellAtGridIndices(depIndex - 1, tofIndex + 1, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 438. `porkchop/porkchop-view.ts:597` — `buildContourSegments` — arithmetic-swap
```diff
- const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + 1, cells, gridParams);
+ const topRight = getCellAtGridIndices(depIndex + 1, tofIndex - 1, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 439. `porkchop/porkchop-view.ts:598` — `buildContourSegments` — argument-swap
```diff
- const topLeft = getCellAtGridIndices(depIndex, tofIndex + 1, cells, gridParams);
+ const topLeft = getCellAtGridIndices(tofIndex + 1, depIndex, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 440. `porkchop/porkchop-view.ts:598` — `buildContourSegments` — arithmetic-swap
```diff
- const topLeft = getCellAtGridIndices(depIndex, tofIndex + 1, cells, gridParams);
+ const topLeft = getCellAtGridIndices(depIndex, tofIndex - 1, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 441. `porkchop/porkchop-view.ts:623` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v0, v1), tofIndex, gridParams),
+ () => getDisplayCoordinatesForGridPoint(tofIndex, depIndex + interpolateEdge(level, v0, v1), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 442. `porkchop/porkchop-view.ts:623` — `buildContourSegments` — arithmetic-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v0, v1), tofIndex, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex - interpolateEdge(level, v0, v1), tofIndex, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 443. `porkchop/porkchop-view.ts:623` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v0, v1), tofIndex, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(v0, level, v1), tofIndex, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 444. `porkchop/porkchop-view.ts:623` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v0, v1), tofIndex, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v1, v0), tofIndex, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 445. `porkchop/porkchop-view.ts:624` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
+ () => getDisplayCoordinatesForGridPoint(tofIndex + interpolateEdge(level, v1, v2), depIndex + 1, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 446. `porkchop/porkchop-view.ts:624` — `buildContourSegments` — arithmetic-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex - 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 447. `porkchop/porkchop-view.ts:624` — `buildContourSegments` — arithmetic-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex - interpolateEdge(level, v1, v2), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 448. `porkchop/porkchop-view.ts:624` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(v1, level, v2), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 449. `porkchop/porkchop-view.ts:624` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v2, v1), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 450. `porkchop/porkchop-view.ts:625` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
+ () => getDisplayCoordinatesForGridPoint(tofIndex + 1, depIndex + interpolateEdge(level, v3, v2), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 451. `porkchop/porkchop-view.ts:625` — `buildContourSegments` — arithmetic-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex - interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 452. `porkchop/porkchop-view.ts:625` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(v3, level, v2), tofIndex + 1, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 453. `porkchop/porkchop-view.ts:625` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v2, v3), tofIndex + 1, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 454. `porkchop/porkchop-view.ts:625` — `buildContourSegments` — arithmetic-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex - 1, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 455. `porkchop/porkchop-view.ts:626` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(level, v0, v3), gridParams),
+ () => getDisplayCoordinatesForGridPoint(tofIndex + interpolateEdge(level, v0, v3), depIndex, gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 456. `porkchop/porkchop-view.ts:626` — `buildContourSegments` — arithmetic-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(level, v0, v3), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex - interpolateEdge(level, v0, v3), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 457. `porkchop/porkchop-view.ts:626` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(level, v0, v3), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(v0, level, v3), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 458. `porkchop/porkchop-view.ts:626` — `buildContourSegments` — argument-swap
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(level, v0, v3), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(level, v3, v0), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 459. `porkchop/porkchop-view.ts:666` — `PorkchopView` — arithmetic-swap
```diff
- (count, cell) => count + (isNearZeroC3Degenerate(getSelectedBranchC3(cell)) ? 1 : 0),
+ (count, cell) => count - (isNearZeroC3Degenerate(getSelectedBranchC3(cell)) ? 1 : 0),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 460. `porkchop/porkchop-view.ts:672` — `PorkchopView` — argument-swap
```diff
- () => (familyGrids === null ? null : compositeGrids(familyGrids.m0.cells, familyGrids.m1.cells)),
+ () => (familyGrids === null ? null : compositeGrids(familyGrids.m1.cells, familyGrids.m0.cells)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 461. `porkchop/porkchop-view.ts:738` — `PorkchopView` — arithmetic-swap
```diff
- return { cells: grids.m0.cells, compute_ms: grids.m0.compute_ms + grids.m1.compute_ms };
+ return { cells: grids.m0.cells, compute_ms: grids.m0.compute_ms - grids.m1.compute_ms };
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 462. `porkchop/porkchop-view.ts:747` — `PorkchopView` — arithmetic-swap
```diff
- return { cells: grids.m0.cells, compute_ms: grids.m0.compute_ms + grids.m1.compute_ms };
+ return { cells: grids.m0.cells, compute_ms: grids.m0.compute_ms - grids.m1.compute_ms };
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 463. `porkchop/porkchop-view.ts:810` — `PorkchopView` — argument-swap
```diff
- const image = offscreenContext.createImageData(HEATMAP_PIXEL_WIDTH, HEATMAP_PIXEL_HEIGHT);
+ const image = offscreenContext.createImageData(HEATMAP_PIXEL_HEIGHT, HEATMAP_PIXEL_WIDTH);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 464. `porkchop/porkchop-view.ts:817` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof + 1 - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 465. `porkchop/porkchop-view.ts:817` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof - 1 + tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 466. `porkchop/porkchop-view.ts:818` — `PorkchopView` — arithmetic-swap
```diff
- const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) * 4;
+ const pixelOffset = (rowFromTop / HEATMAP_PIXEL_WIDTH + depIndex) * 4;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 467. `porkchop/porkchop-view.ts:818` — `PorkchopView` — arithmetic-swap
```diff
- const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) * 4;
+ const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH - depIndex) * 4;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 468. `porkchop/porkchop-view.ts:818` — `PorkchopView` — arithmetic-swap
```diff
- const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) * 4;
+ const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) / 4;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 469. `porkchop/porkchop-view.ts:820` — `PorkchopView` — arithmetic-swap
```diff
- image.data[pixelOffset + 1] = rgb[1];
+ image.data[pixelOffset - 1] = rgb[1];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 470. `porkchop/porkchop-view.ts:821` — `PorkchopView` — arithmetic-swap
```diff
- image.data[pixelOffset + 2] = rgb[2];
+ image.data[pixelOffset - 2] = rgb[2];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 471. `porkchop/porkchop-view.ts:822` — `PorkchopView` — arithmetic-swap
```diff
- image.data[pixelOffset + 3] = 255;
+ image.data[pixelOffset - 3] = 255;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 472. `porkchop/porkchop-view.ts:827` — `PorkchopView` — argument-swap
```diff
- context.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
+ context.clearRect(0, 0, DISPLAY_HEIGHT, DISPLAY_WIDTH);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 473. `porkchop/porkchop-view.ts:829` — `PorkchopView` — argument-swap
```diff
- context.drawImage(offscreen, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
+ context.drawImage(offscreen, 0, 0, DISPLAY_HEIGHT, DISPLAY_WIDTH);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 474. `porkchop/porkchop-view.ts:836` — `PorkchopView` — arithmetic-swap
```diff
- const cellWidthPx = DISPLAY_WIDTH / props.gridParams.nDep;
+ const cellWidthPx = DISPLAY_WIDTH * props.gridParams.nDep;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 475. `porkchop/porkchop-view.ts:837` — `PorkchopView` — arithmetic-swap
```diff
- const cellHeightPx = DISPLAY_HEIGHT / props.gridParams.nTof;
+ const cellHeightPx = DISPLAY_HEIGHT * props.gridParams.nTof;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 476. `porkchop/porkchop-view.ts:840` — `PorkchopView` — arithmetic-swap
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex -= 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 477. `porkchop/porkchop-view.ts:841` — `PorkchopView` — arithmetic-swap
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex -= 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 478. `porkchop/porkchop-view.ts:842` — `PorkchopView` — arithmetic-swap
```diff
- const cell = cells[depIndex * props.gridParams.nTof + tofIndex];
+ const cell = cells[depIndex / props.gridParams.nTof + tofIndex];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 479. `porkchop/porkchop-view.ts:842` — `PorkchopView` — arithmetic-swap
```diff
- const cell = cells[depIndex * props.gridParams.nTof + tofIndex];
+ const cell = cells[depIndex * props.gridParams.nTof - tofIndex];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 480. `porkchop/porkchop-view.ts:846` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof + 1 - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 481. `porkchop/porkchop-view.ts:846` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof - 1 + tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 482. `porkchop/porkchop-view.ts:847` — `PorkchopView` — argument-swap
```diff
- context.fillRect(depIndex * cellWidthPx, rowFromTop * cellHeightPx, cellWidthPx, cellHeightPx);
+ context.fillRect(rowFromTop * cellHeightPx, depIndex * cellWidthPx, cellWidthPx, cellHeightPx);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 483. `porkchop/porkchop-view.ts:847` — `PorkchopView` — arithmetic-swap
```diff
- context.fillRect(depIndex * cellWidthPx, rowFromTop * cellHeightPx, cellWidthPx, cellHeightPx);
+ context.fillRect(depIndex / cellWidthPx, rowFromTop * cellHeightPx, cellWidthPx, cellHeightPx);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 484. `porkchop/porkchop-view.ts:847` — `PorkchopView` — arithmetic-swap
```diff
- context.fillRect(depIndex * cellWidthPx, rowFromTop * cellHeightPx, cellWidthPx, cellHeightPx);
+ context.fillRect(depIndex * cellWidthPx, rowFromTop / cellHeightPx, cellWidthPx, cellHeightPx);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 485. `porkchop/porkchop-view.ts:847` — `PorkchopView` — argument-swap
```diff
- context.fillRect(depIndex * cellWidthPx, rowFromTop * cellHeightPx, cellWidthPx, cellHeightPx);
+ context.fillRect(depIndex * cellWidthPx, rowFromTop * cellHeightPx, cellHeightPx, cellWidthPx);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 486. `porkchop/porkchop-view.ts:854` — `PorkchopView` — arithmetic-swap
```diff
- ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) / (props.gridParams.nTof - 1)
+ ? (props.gridParams.tofMaxDays + props.gridParams.tofMinDays) / (props.gridParams.nTof - 1)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 487. `porkchop/porkchop-view.ts:854` — `PorkchopView` — arithmetic-swap
```diff
- ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) / (props.gridParams.nTof - 1)
+ ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) * (props.gridParams.nTof - 1)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 488. `porkchop/porkchop-view.ts:854` — `PorkchopView` — arithmetic-swap
```diff
- ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) / (props.gridParams.nTof - 1)
+ ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) / (props.gridParams.nTof + 1)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 489. `porkchop/porkchop-view.ts:863` — `PorkchopView` — arithmetic-swap
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex -= 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 490. `porkchop/porkchop-view.ts:864` — `PorkchopView` — arithmetic-swap
```diff
- const column = cells[depIndex * props.gridParams.nTof];
+ const column = cells[depIndex / props.gridParams.nTof];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 491. `porkchop/porkchop-view.ts:865` — `PorkchopView` — arithmetic-swap
```diff
- const tofIndex = (boundaryTofDaysAtDeparture(column.depJD, boundary) - props.gridParams.tofMinDays) / tofCellDays;
+ const tofIndex = (boundaryTofDaysAtDeparture(column.depJD, boundary) + props.gridParams.tofMinDays) / tofCellDays;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 492. `porkchop/porkchop-view.ts:865` — `PorkchopView` — arithmetic-swap
```diff
- const tofIndex = (boundaryTofDaysAtDeparture(column.depJD, boundary) - props.gridParams.tofMinDays) / tofCellDays;
+ const tofIndex = (boundaryTofDaysAtDeparture(column.depJD, boundary) - props.gridParams.tofMinDays) * tofCellDays;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 493. `porkchop/porkchop-view.ts:866` — `PorkchopView` — arithmetic-swap
```diff
- if (tofIndex < 0 || tofIndex > props.gridParams.nTof - 1) {
+ if (tofIndex < 0 || tofIndex > props.gridParams.nTof + 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 494. `porkchop/porkchop-view.ts:870` — `PorkchopView` — argument-swap
```diff
- const { x, y } = getDisplayCoordinatesForGridPoint(depIndex, tofIndex, props.gridParams);
+ const { x, y } = getDisplayCoordinatesForGridPoint(tofIndex, depIndex, props.gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 495. `porkchop/porkchop-view.ts:872` — `PorkchopView` — argument-swap
```diff
- context.lineTo(x, y);
+ context.lineTo(y, x);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 496. `porkchop/porkchop-view.ts:874` — `PorkchopView` — argument-swap
```diff
- context.moveTo(x, y);
+ context.moveTo(y, x);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 497. `porkchop/porkchop-view.ts:887` — `PorkchopView` — arithmetic-swap
```diff
- const cellWidthPx = DISPLAY_WIDTH / props.gridParams.nDep;
+ const cellWidthPx = DISPLAY_WIDTH * props.gridParams.nDep;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 498. `porkchop/porkchop-view.ts:888` — `PorkchopView` — arithmetic-swap
```diff
- const cellHeightPx = DISPLAY_HEIGHT / props.gridParams.nTof;
+ const cellHeightPx = DISPLAY_HEIGHT * props.gridParams.nTof;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 499. `porkchop/porkchop-view.ts:889` — `PorkchopView` — argument-swap
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max(Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3), 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 500. `porkchop/porkchop-view.ts:889` — `PorkchopView` — argument-swap
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max(1, Math.min(Math.min(cellWidthPx, cellHeightPx) / 3, 2));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 501. `porkchop/porkchop-view.ts:889` — `PorkchopView` — argument-swap
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max(1, Math.min(2, Math.min(cellHeightPx, cellWidthPx) / 3));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 502. `porkchop/porkchop-view.ts:889` — `PorkchopView` — arithmetic-swap
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) * 3));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 503. `porkchop/porkchop-view.ts:902` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof + 1 - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 504. `porkchop/porkchop-view.ts:902` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof - 1 + tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 505. `porkchop/porkchop-view.ts:908` — `PorkchopView` — arithmetic-swap
```diff
- if (cell !== minimumCell && (depIndex + rowFromTop) % 2 !== 0) {
+ if (cell !== minimumCell && (depIndex - rowFromTop) % 2 !== 0) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 506. `porkchop/porkchop-view.ts:912` — `PorkchopView` — argument-swap
```diff
- depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2,
+ (multi-line statement replaced by: rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / 2,
            depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 507. `porkchop/porkchop-view.ts:912` — `PorkchopView` — arithmetic-swap
```diff
- depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2,
+ depIndex / cellWidthPx + (cellWidthPx - dotSize) / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 508. `porkchop/porkchop-view.ts:912` — `PorkchopView` — arithmetic-swap
```diff
- depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2,
+ depIndex * cellWidthPx - (cellWidthPx - dotSize) / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 509. `porkchop/porkchop-view.ts:912` — `PorkchopView` — arithmetic-swap
```diff
- depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2,
+ depIndex * cellWidthPx + (cellWidthPx + dotSize) / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 510. `porkchop/porkchop-view.ts:912` — `PorkchopView` — arithmetic-swap
```diff
- depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2,
+ depIndex * cellWidthPx + (cellWidthPx - dotSize) * 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 511. `porkchop/porkchop-view.ts:913` — `PorkchopView` — arithmetic-swap
```diff
- rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / 2,
+ rowFromTop / cellHeightPx + (cellHeightPx - dotSize) / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 512. `porkchop/porkchop-view.ts:913` — `PorkchopView` — arithmetic-swap
```diff
- rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / 2,
+ rowFromTop * cellHeightPx - (cellHeightPx - dotSize) / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 513. `porkchop/porkchop-view.ts:913` — `PorkchopView` — arithmetic-swap
```diff
- rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / 2,
+ rowFromTop * cellHeightPx + (cellHeightPx + dotSize) / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 514. `porkchop/porkchop-view.ts:913` — `PorkchopView` — arithmetic-swap
```diff
- rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / 2,
+ rowFromTop * cellHeightPx + (cellHeightPx - dotSize) * 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 515. `porkchop/porkchop-view.ts:929` — `PorkchopView` — argument-swap
```diff
- context.moveTo(segment.x1, segment.y1);
+ context.moveTo(segment.y1, segment.x1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 516. `porkchop/porkchop-view.ts:930` — `PorkchopView` — argument-swap
```diff
- context.lineTo(segment.x2, segment.y2);
+ context.lineTo(segment.y2, segment.x2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 517. `porkchop/porkchop-view.ts:947` — `PorkchopView` — argument-swap
```diff
- context.moveTo(segment.x1, segment.y1);
+ context.moveTo(segment.y1, segment.x1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 518. `porkchop/porkchop-view.ts:948` — `PorkchopView` — argument-swap
```diff
- context.lineTo(segment.x2, segment.y2);
+ context.lineTo(segment.y2, segment.x2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 519. `porkchop/porkchop-view.ts:962` — `PorkchopView` — argument-swap
```diff
- context.moveTo(segment.x1, segment.y1);
+ context.moveTo(segment.y1, segment.x1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 520. `porkchop/porkchop-view.ts:963` — `PorkchopView` — argument-swap
```diff
- context.lineTo(segment.x2, segment.y2);
+ context.lineTo(segment.y2, segment.x2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 521. `porkchop/porkchop-view.ts:984` — `PorkchopView` — argument-swap
```diff
- indices.depIndex,
+ (multi-line statement replaced by: indices.tofIndex,
        indices.depIndex)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 522. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — argument-swap
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(rect.width - 188, Math.max(event.clientX - rect.left + 12, 8)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 523. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — argument-swap
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(8, event.clientX - rect.left + 12), rect.width - 188),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 524. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — arithmetic-swap
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(event.clientX + rect.left + 12, 8), rect.width - 188),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 525. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — arithmetic-swap
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(event.clientX - rect.left - 12, 8), rect.width - 188),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 526. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — arithmetic-swap
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width + 188),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 527. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — argument-swap
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(rect.height - 108, Math.max(event.clientY - rect.top + 12, 8)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 528. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — argument-swap
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(8, event.clientY - rect.top + 12), rect.height - 108),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 529. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — arithmetic-swap
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(event.clientY + rect.top + 12, 8), rect.height - 108),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 530. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — arithmetic-swap
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(event.clientY - rect.top - 12, 8), rect.height - 108),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 531. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — arithmetic-swap
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height + 108),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 532. `porkchop/porkchop-view.ts:1055` — `PorkchopView` — argument-swap
```diff
- props.validatedTarget.depJD,
+ (multi-line statement replaced by: props.validatedTarget.tofDays,
      props.validatedTarget.depJD)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 533. `porkchop/porkchop-view.ts:1113` — `PorkchopView` — arithmetic-swap
```diff
- const cellWidth = canvasRect.width / props.gridParams.nDep;
+ const cellWidth = canvasRect.width * props.gridParams.nDep;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 534. `porkchop/porkchop-view.ts:1114` — `PorkchopView` — arithmetic-swap
```diff
- const cellHeight = canvasRect.height / props.gridParams.nTof;
+ const cellHeight = canvasRect.height * props.gridParams.nTof;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 535. `porkchop/porkchop-view.ts:1115` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - indices.tofIndex;
+ const rowFromTop = props.gridParams.nTof + 1 - indices.tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 536. `porkchop/porkchop-view.ts:1115` — `PorkchopView` — arithmetic-swap
```diff
- const rowFromTop = props.gridParams.nTof - 1 - indices.tofIndex;
+ const rowFromTop = props.gridParams.nTof - 1 + indices.tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 537. `porkchop/porkchop-view.ts:1117` — `PorkchopView` — arithmetic-swap
```diff
- left: canvasRect.left + indices.depIndex * cellWidth,
+ left: canvasRect.left - indices.depIndex * cellWidth,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 538. `porkchop/porkchop-view.ts:1117` — `PorkchopView` — arithmetic-swap
```diff
- left: canvasRect.left + indices.depIndex * cellWidth,
+ left: canvasRect.left + indices.depIndex / cellWidth,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 539. `porkchop/porkchop-view.ts:1118` — `PorkchopView` — arithmetic-swap
```diff
- top: canvasRect.top + rowFromTop * cellHeight,
+ top: canvasRect.top - rowFromTop * cellHeight,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 540. `porkchop/porkchop-view.ts:1118` — `PorkchopView` — arithmetic-swap
```diff
- top: canvasRect.top + rowFromTop * cellHeight,
+ top: canvasRect.top + rowFromTop / cellHeight,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 541. `porkchop/porkchop-view.ts:1160` — `PorkchopView` — argument-swap
```diff
- computeMs === null ? '' : `worker compute ${formatNumber(computeMs, 1)} ms.`,
+ computeMs === null ? '' : `worker compute ${formatNumber(1, computeMs)} ms.`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 542. `porkchop/porkchop-view.ts:1173` — `PorkchopView` — argument-swap
```diff
- h('span', { style: 'font-weight:700;' }, 'Transfer family'),
+ h('span', 'Transfer family', { style: 'font-weight:700;' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 543. `porkchop/porkchop-view.ts:1252` — `PorkchopView` — argument-swap
```diff
- props.validatedTarget.depJD,
+ (multi-line statement replaced by: props.validatedTarget.tofDays,
                  props.validatedTarget.depJD)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 544. `porkchop/porkchop-view.ts:1273` — `PorkchopView` — argument-swap
```diff
- ? h('div', { style: 'font-size:15px;color:#ff8ba7;padding:18px 0;line-height:1.5;' }, propagation.message)
+ ? h('div', propagation.message, { style: 'font-size:15px;color:#ff8ba7;padding:18px 0;line-height:1.5;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 545. `porkchop/porkchop-view.ts:1275` — `PorkchopView` — argument-swap
```diff
- ? h('div', { style: 'font-size:15px;padding:18px 0;' }, 'Loading screening data…')
+ ? h('div', 'Loading screening data…', { style: 'font-size:15px;padding:18px 0;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 546. `porkchop/porkchop-view.ts:1277` — `PorkchopView` — argument-swap
```diff
- ? h('div', { style: 'font-size:15px;color:#ff8ba7;padding:18px 0;' }, error)
+ ? h('div', error, { style: 'font-size:15px;color:#ff8ba7;padding:18px 0;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 547. `porkchop/porkchop-view.ts:1284` — `PorkchopView` — argument-swap
```diff
- h('span', null, `TOF ↑ ${tofMaxLabel}`),
+ (multi-line statement replaced by: h('span', null, `${depStartLabel} → ${depEndLabel}`),
                h('span', null, `TOF ↑ ${tofMaxLabel}`))
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 548. `porkchop/porkchop-view.ts:1284` — `PorkchopView` — argument-swap
```diff
- h('span', null, `TOF ↑ ${tofMaxLabel}`),
+ h(null, 'span', `TOF ↑ ${tofMaxLabel}`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 549. `porkchop/porkchop-view.ts:1284` — `PorkchopView` — argument-swap
```diff
- h('span', null, `TOF ↑ ${tofMaxLabel}`),
+ h('span', `TOF ↑ ${tofMaxLabel}`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 550. `porkchop/porkchop-view.ts:1285` — `PorkchopView` — argument-swap
```diff
- h('span', null, `${depStartLabel} → ${depEndLabel}`),
+ h(null, 'span', `${depStartLabel} → ${depEndLabel}`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 551. `porkchop/porkchop-view.ts:1285` — `PorkchopView` — argument-swap
```diff
- h('span', null, `${depStartLabel} → ${depEndLabel}`),
+ h('span', `${depStartLabel} → ${depEndLabel}`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 552. `porkchop/porkchop-view.ts:1300` — `PorkchopView` — argument-swap
```diff
- style: `${TOOLTIP_STYLE};left:${formatNumber(hoverTooltipPosition.x, 0)}px;top:${formatNumber(hoverTooltipPosition.y, 0)}px;`,
+ style: `${TOOLTIP_STYLE};left:${formatNumber(0, hoverTooltipPosition.x)}px;top:${formatNumber(hoverTooltipPosition.y, 0)}px;`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 553. `porkchop/porkchop-view.ts:1300` — `PorkchopView` — argument-swap
```diff
- style: `${TOOLTIP_STYLE};left:${formatNumber(hoverTooltipPosition.x, 0)}px;top:${formatNumber(hoverTooltipPosition.y, 0)}px;`,
+ style: `${TOOLTIP_STYLE};left:${formatNumber(hoverTooltipPosition.x, 0)}px;top:${formatNumber(0, hoverTooltipPosition.y)}px;`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 554. `porkchop/porkchop-view.ts:1302` — `PorkchopView` — argument-swap
```diff
- h('div', { style: 'font-weight:600;margin-bottom:6px;' }, 'Hover cell'),
+ h('div', 'Hover cell', { style: 'font-weight:600;margin-bottom:6px;' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 555. `porkchop/porkchop-view.ts:1303` — `PorkchopView` — argument-swap
```diff
- h('div', null, `Status: ${hoverReadout.status}`),
+ h(null, 'div', `Status: ${hoverReadout.status}`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 556. `porkchop/porkchop-view.ts:1303` — `PorkchopView` — argument-swap
```diff
- h('div', null, `Status: ${hoverReadout.status}`),
+ h('div', `Status: ${hoverReadout.status}`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 557. `porkchop/porkchop-view.ts:1305` — `PorkchopView` — argument-swap
```diff
- ? h('div', null, `Family: M=${hoverReadout.M}`)
+ ? h(null, 'div', `Family: M=${hoverReadout.M}`)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 558. `porkchop/porkchop-view.ts:1305` — `PorkchopView` — argument-swap
```diff
- ? h('div', null, `Family: M=${hoverReadout.M}`)
+ ? h('div', `Family: M=${hoverReadout.M}`, null)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 559. `porkchop/porkchop-view.ts:1307` — `PorkchopView` — argument-swap
```diff
- h('div', null, `Departure: ${formatJdTdb(hoverReadout.depJD)}`),
+ h(null, 'div', `Departure: ${formatJdTdb(hoverReadout.depJD)}`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 560. `porkchop/porkchop-view.ts:1307` — `PorkchopView` — argument-swap
```diff
- h('div', null, `Departure: ${formatJdTdb(hoverReadout.depJD)}`),
+ h('div', `Departure: ${formatJdTdb(hoverReadout.depJD)}`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 561. `porkchop/porkchop-view.ts:1308` — `PorkchopView` — argument-swap
```diff
- h('div', null, `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`),
+ h(null, 'div', `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 562. `porkchop/porkchop-view.ts:1308` — `PorkchopView` — argument-swap
```diff
- h('div', null, `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`),
+ h('div', `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 563. `porkchop/porkchop-view.ts:1308` — `PorkchopView` — argument-swap
```diff
- h('div', null, `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`),
+ h('div', null, `TOF: ${formatNumber(3, hoverReadout.tofDays)} d`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 564. `porkchop/porkchop-view.ts:1310` — `PorkchopView` — argument-swap
```diff
- 'div',
+ (multi-line statement replaced by: null,
                        'div')
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 565. `porkchop/porkchop-view.ts:1311` — `PorkchopView` — argument-swap
```diff
- null,
+ (multi-line statement replaced by: `C3: ${hoverReadout.c3 === null ? 'n/a' : `${formatNumber(hoverReadout.c3, 6)} km²/s²`}`,
                        null)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 566. `porkchop/porkchop-view.ts:1312` — `PorkchopView` — argument-swap
```diff
- `C3: ${hoverReadout.c3 === null ? 'n/a' : `${formatNumber(hoverReadout.c3, 6)} km²/s²`}`,
+ `C3: ${hoverReadout.c3 === null ? 'n/a' : `${formatNumber(6, hoverReadout.c3)} km²/s²`}`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 567. `porkchop/porkchop-view.ts:1317` — `PorkchopView` — argument-swap
```diff
- { style: 'margin-top:6px;max-width:220px;white-space:normal;color:#fbbf24;font-style:italic;' },
+ (multi-line statement replaced by: unsupportedCellMessage(props.supportBoundary),
                            { style: 'margin-top:6px;max-width:220px;white-space:normal;color:#fbbf24;font-style:italic;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 568. `porkchop/porkchop-view.ts:1335` — `PorkchopView` — argument-swap
```diff
- h('span', null, `TOF ↓ ${tofMinLabel}`),
+ h(null, 'span', `TOF ↓ ${tofMinLabel}`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 569. `porkchop/porkchop-view.ts:1335` — `PorkchopView` — argument-swap
```diff
- h('span', null, `TOF ↓ ${tofMinLabel}`),
+ h('span', `TOF ↓ ${tofMinLabel}`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 570. `porkchop/porkchop-view.ts:1343` — `PorkchopView` — argument-swap
```diff
- h('span', null, '1'),
+ h(null, 'span', '1'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 571. `porkchop/porkchop-view.ts:1343` — `PorkchopView` — argument-swap
```diff
- h('span', null, '1'),
+ h('span', '1', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 572. `porkchop/porkchop-view.ts:1344` — `PorkchopView` — argument-swap
```diff
- h('span', null, '10'),
+ h(null, 'span', '10'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 573. `porkchop/porkchop-view.ts:1344` — `PorkchopView` — argument-swap
```diff
- h('span', null, '10'),
+ h('span', '10', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 574. `porkchop/porkchop-view.ts:1345` — `PorkchopView` — argument-swap
```diff
- h('span', null, '100'),
+ (multi-line statement replaced by: h('span', null, '1000'),
                    h('span', null, '100'))
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 575. `porkchop/porkchop-view.ts:1345` — `PorkchopView` — argument-swap
```diff
- h('span', null, '100'),
+ h(null, 'span', '100'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 576. `porkchop/porkchop-view.ts:1345` — `PorkchopView` — argument-swap
```diff
- h('span', null, '100'),
+ h('span', '100', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 577. `porkchop/porkchop-view.ts:1346` — `PorkchopView` — argument-swap
```diff
- h('span', null, '1000'),
+ h(null, 'span', '1000'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 578. `porkchop/porkchop-view.ts:1346` — `PorkchopView` — argument-swap
```diff
- h('span', null, '1000'),
+ h('span', '1000', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 579. `porkchop/porkchop-view.ts:1348` — `PorkchopView` — argument-swap
```diff
- h('div', { style: 'font-size:10px;opacity:0.7;width:280px;text-align:right;' }, 'logarithmic scale'),
+ h('div', 'logarithmic scale', { style: 'font-size:10px;opacity:0.7;width:280px;text-align:right;' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 580. `porkchop/porkchop-view.ts:1385` — `PorkchopView` — argument-swap
```diff
- h('div', { style: 'font-size:15px;font-weight:600;margin-bottom:6px;' }, 'Grid extremes'),
+ h('div', 'Grid extremes', { style: 'font-size:15px;font-weight:600;margin-bottom:6px;' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 581. `porkchop/porkchop-view.ts:1392` — `PorkchopView` — argument-swap
```diff
- ? h('div', { style: 'font-size:13px;opacity:0.75;' }, 'Computing…')
+ ? h('div', 'Computing…', { style: 'font-size:13px;opacity:0.75;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 582. `porkchop/porkchop-view.ts:1394` — `PorkchopView` — argument-swap
```diff
- ? h('div', { style: 'font-size:13px;opacity:0.75;' }, 'No solvable cells in this grid.')
+ ? h('div', 'No solvable cells in this grid.', { style: 'font-size:13px;opacity:0.75;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 583. `porkchop/porkchop-view.ts:1409` — `PorkchopView` — argument-swap
```diff
- h('div', { style: 'font-weight:600;margin-bottom:2px;' }, label),
+ h('div', label, { style: 'font-weight:600;margin-bottom:2px;' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 584. `porkchop/porkchop-view.ts:1429` — `PorkchopView` — argument-swap
```diff
- h('div', { style: 'font-size:15px;font-weight:600;margin-bottom:10px;' }, 'Pinned cell'),
+ h('div', 'Pinned cell', { style: 'font-size:15px;font-weight:600;margin-bottom:10px;' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 585. `porkchop/porkchop-view.ts:1431` — `PorkchopView` — argument-swap
```diff
- ? h('div', { style: 'font-size:13px;opacity:0.75;' }, 'Click a cell to pin departure/arrival values.')
+ ? h('div', 'Click a cell to pin departure/arrival values.', { style: 'font-size:13px;opacity:0.75;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 586. `porkchop/porkchop-view.ts:1435` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Status'),
+ h(null, 'span', 'Status'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 587. `porkchop/porkchop-view.ts:1435` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Status'),
+ h('span', 'Status', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 588. `porkchop/porkchop-view.ts:1436` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.status),
+ h(null, 'span', pinnedReadout.status),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 589. `porkchop/porkchop-view.ts:1436` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.status),
+ h('span', pinnedReadout.status, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 590. `porkchop/porkchop-view.ts:1437` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Departure'),
+ h(null, 'span', 'Departure'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 591. `porkchop/porkchop-view.ts:1437` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Departure'),
+ h('span', 'Departure', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 592. `porkchop/porkchop-view.ts:1438` — `PorkchopView` — argument-swap
```diff
- h('span', null, formatJdTdb(pinnedReadout.depJD)),
+ h(null, 'span', formatJdTdb(pinnedReadout.depJD)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 593. `porkchop/porkchop-view.ts:1438` — `PorkchopView` — argument-swap
```diff
- h('span', null, formatJdTdb(pinnedReadout.depJD)),
+ h('span', formatJdTdb(pinnedReadout.depJD), null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 594. `porkchop/porkchop-view.ts:1439` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Arrival'),
+ h(null, 'span', 'Arrival'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 595. `porkchop/porkchop-view.ts:1439` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Arrival'),
+ h('span', 'Arrival', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 596. `porkchop/porkchop-view.ts:1440` — `PorkchopView` — argument-swap
```diff
- h('span', null, formatJdTdb(pinnedReadout.arrivalJD)),
+ h(null, 'span', formatJdTdb(pinnedReadout.arrivalJD)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 597. `porkchop/porkchop-view.ts:1440` — `PorkchopView` — argument-swap
```diff
- h('span', null, formatJdTdb(pinnedReadout.arrivalJD)),
+ h('span', formatJdTdb(pinnedReadout.arrivalJD), null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 598. `porkchop/porkchop-view.ts:1441` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'TOF'),
+ h(null, 'span', 'TOF'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 599. `porkchop/porkchop-view.ts:1441` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'TOF'),
+ h('span', 'TOF', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 600. `porkchop/porkchop-view.ts:1442` — `PorkchopView` — argument-swap
```diff
- h('span', null, `${formatNumber(pinnedReadout.tofDays, 3)} d`),
+ h(null, 'span', `${formatNumber(pinnedReadout.tofDays, 3)} d`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 601. `porkchop/porkchop-view.ts:1442` — `PorkchopView` — argument-swap
```diff
- h('span', null, `${formatNumber(pinnedReadout.tofDays, 3)} d`),
+ h('span', `${formatNumber(pinnedReadout.tofDays, 3)} d`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 602. `porkchop/porkchop-view.ts:1443` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'M'),
+ h(null, 'span', 'M'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 603. `porkchop/porkchop-view.ts:1443` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'M'),
+ h('span', 'M', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 604. `porkchop/porkchop-view.ts:1444` — `PorkchopView` — argument-swap
```diff
- h('span', null, String(pinnedReadout.M)),
+ h(null, 'span', String(pinnedReadout.M)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 605. `porkchop/porkchop-view.ts:1444` — `PorkchopView` — argument-swap
```diff
- h('span', null, String(pinnedReadout.M)),
+ h('span', String(pinnedReadout.M), null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 606. `porkchop/porkchop-view.ts:1445` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Branch'),
+ h(null, 'span', 'Branch'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 607. `porkchop/porkchop-view.ts:1445` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Branch'),
+ h('span', 'Branch', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 608. `porkchop/porkchop-view.ts:1446` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.selectedBranchLabel ?? 'n/a'),
+ h(null, 'span', pinnedReadout.selectedBranchLabel ?? 'n/a'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 609. `porkchop/porkchop-view.ts:1446` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.selectedBranchLabel ?? 'n/a'),
+ h('span', pinnedReadout.selectedBranchLabel ?? 'n/a', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 610. `porkchop/porkchop-view.ts:1447` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Branch index'),
+ h(null, 'span', 'Branch index'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 611. `porkchop/porkchop-view.ts:1447` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'Branch index'),
+ h('span', 'Branch index', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 612. `porkchop/porkchop-view.ts:1448` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.selectedBranchIndex === null ? 'n/a' : String(pinnedReadout.selectedBranchIndex)),
+ h(null, 'span', pinnedReadout.selectedBranchIndex === null ? 'n/a' : String(pinnedReadout.selectedBranchIndex)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 613. `porkchop/porkchop-view.ts:1448` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.selectedBranchIndex === null ? 'n/a' : String(pinnedReadout.selectedBranchIndex)),
+ h('span', pinnedReadout.selectedBranchIndex === null ? 'n/a' : String(pinnedReadout.selectedBranchIndex), null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 614. `porkchop/porkchop-view.ts:1449` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'C3'),
+ h(null, 'span', 'C3'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 615. `porkchop/porkchop-view.ts:1449` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'C3'),
+ h('span', 'C3', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 616. `porkchop/porkchop-view.ts:1451` — `PorkchopView` — argument-swap
```diff
- 'span',
+ (multi-line statement replaced by: null,
              'span')
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 617. `porkchop/porkchop-view.ts:1464` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'DLA'),
+ h(null, 'span', 'DLA'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 618. `porkchop/porkchop-view.ts:1464` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'DLA'),
+ h('span', 'DLA', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 619. `porkchop/porkchop-view.ts:1468` — `PorkchopView` — argument-swap
```diff
- pinnedReadout.dlaDeg === null ? '—' : `${formatNumber(pinnedReadout.dlaDeg, 1)}°`,
+ pinnedReadout.dlaDeg === null ? '—' : `${formatNumber(1, pinnedReadout.dlaDeg)}°`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 620. `porkchop/porkchop-view.ts:1474` — `PorkchopView` — argument-swap
```diff
- { style: 'font-size:11px;color:#93a4bf;white-space:nowrap;' },
+ (multi-line statement replaced by: `· ${pinnedReadout.siteName}`,
                    { style: 'font-size:11px;color:#93a4bf;white-space:nowrap;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 621. `porkchop/porkchop-view.ts:1478` — `PorkchopView` — argument-swap
```diff
- h('span', null, ''),
+ h(null, 'span', ''),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 622. `porkchop/porkchop-view.ts:1478` — `PorkchopView` — argument-swap
```diff
- h('span', null, ''),
+ h('span', '', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 623. `porkchop/porkchop-view.ts:1481` — `PorkchopView` — argument-swap
```diff
- { style: 'font-size:11px;line-height:1.45;color:#93a4bf;font-style:italic;' },
+ (multi-line statement replaced by: 'Screening estimate. Actual launch geometry may differ (see azimuth constraints).',
              { style: 'font-size:11px;line-height:1.45;color:#93a4bf;font-style:italic;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 624. `porkchop/porkchop-view.ts:1486` — `PorkchopView` — argument-swap
```diff
- h('span', { key: 'unsupported-label' }, ''),
+ h('span', '', { key: 'unsupported-label' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 625. `porkchop/porkchop-view.ts:1489` — `PorkchopView` — argument-swap
```diff
- { key: 'unsupported-text', style: 'font-size:11px;line-height:1.45;color:#fbbf24;font-style:italic;' },
+ (multi-line statement replaced by: unsupportedCellMessage(props.supportBoundary),
                    { key: 'unsupported-text', style: 'font-size:11px;line-height:1.45;color:#fbbf24;font-style:italic;' })
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 626. `porkchop/porkchop-view.ts:1496` — `PorkchopView` — argument-swap
```diff
- h('span', { key: 'amber-advisory-label' }, ''),
+ h('span', '', { key: 'amber-advisory-label' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 627. `porkchop/porkchop-view.ts:1506` — `PorkchopView` — argument-swap
```diff
- h('span', { key: 'red-advisory-label' }, ''),
+ h('span', '', { key: 'red-advisory-label' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 628. `porkchop/porkchop-view.ts:1517` — `PorkchopView` — argument-swap
```diff
- h('span', { key: 'expected-c3-label' }, 'Expected C3'),
+ h('span', 'Expected C3', { key: 'expected-c3-label' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 629. `porkchop/porkchop-view.ts:1518` — `PorkchopView` — argument-swap
```diff
- h('span', { key: 'expected-c3-value' }, `${formatNumber(props.validatedTarget.expectedC3, 2)} km²/s²`),
+ h('span', `${formatNumber(props.validatedTarget.expectedC3, 2)} km²/s²`, { key: 'expected-c3-value' }),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 630. `porkchop/porkchop-view.ts:1518` — `PorkchopView` — argument-swap
```diff
- h('span', { key: 'expected-c3-value' }, `${formatNumber(props.validatedTarget.expectedC3, 2)} km²/s²`),
+ h('span', { key: 'expected-c3-value' }, `${formatNumber(2, props.validatedTarget.expectedC3)} km²/s²`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 631. `porkchop/porkchop-view.ts:1520` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'v∞ dep'),
+ h(null, 'span', 'v∞ dep'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 632. `porkchop/porkchop-view.ts:1520` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'v∞ dep'),
+ h('span', 'v∞ dep', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 633. `porkchop/porkchop-view.ts:1521` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`),
+ h(null, 'span', pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 634. `porkchop/porkchop-view.ts:1521` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`),
+ h('span', pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 635. `porkchop/porkchop-view.ts:1521` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`),
+ h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(6, pinnedReadout.vInfDep)} km/s`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 636. `porkchop/porkchop-view.ts:1522` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'v∞ arr'),
+ (multi-line statement replaced by: h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
            h('span', null, 'v∞ arr'))
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 637. `porkchop/porkchop-view.ts:1522` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'v∞ arr'),
+ h(null, 'span', 'v∞ arr'),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 638. `porkchop/porkchop-view.ts:1522` — `PorkchopView` — argument-swap
```diff
- h('span', null, 'v∞ arr'),
+ h('span', 'v∞ arr', null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 639. `porkchop/porkchop-view.ts:1523` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
+ h(null, 'span', pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 640. `porkchop/porkchop-view.ts:1523` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
+ h('span', pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`, null),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 641. `porkchop/porkchop-view.ts:1523` — `PorkchopView` — argument-swap
```diff
- h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
+ h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(6, pinnedReadout.vInfArr)} km/s`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 642. `porkchop/porkchop-view.ts:270` — `jdTdbToDateParts` — relational-swap (module-private helper)
```diff
- if (z >= 2_299_161) {
+ if (z > 2_299_161) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 643. `porkchop/porkchop-view.ts:280` — `jdTdbToDateParts` — relational-swap (module-private helper)
```diff
- const month = e < 14 ? e - 1 : e - 13;
+ const month = e <= 14 ? e - 1 : e - 13;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 644. `porkchop/porkchop-view.ts:281` — `jdTdbToDateParts` — relational-swap (module-private helper)
```diff
- const year = month > 2 ? c - 4_716 : c - 4_715;
+ const year = month >= 2 ? c - 4_716 : c - 4_715;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 645. `porkchop/porkchop-view.ts:301` — `buildLegendGradient` — relational-swap (module-private helper)
```diff
- for (let index = 0; index <= sampleCount; index += 1) {
+ for (let index = 0; index < sampleCount; index += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 646. `porkchop/porkchop-view.ts:318` — `getCellAtGridIndices` — relational-swap (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
+ if (depIndex < 0 || depIndex > gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 647. `porkchop/porkchop-view.ts:318` — `getCellAtGridIndices` — relational-swap (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
+ if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex > gridParams.nTof) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 648. `porkchop/porkchop-view.ts:331` — `getCellAtCoordinates` — relational-swap (module-private helper)
```diff
- if (rect.width <= 0 || rect.height <= 0) {
+ if (rect.width < 0 || rect.height <= 0) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 649. `porkchop/porkchop-view.ts:331` — `getCellAtCoordinates` — relational-swap (module-private helper)
```diff
- if (rect.width <= 0 || rect.height <= 0) {
+ if (rect.width <= 0 || rect.height < 0) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 650. `porkchop/porkchop-view.ts:354` — `getNearestCellForTarget` — relational-swap (module-private helper)
```diff
- const depStep = gridParams.nDep <= 1
+ const depStep = gridParams.nDep < 1
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 651. `porkchop/porkchop-view.ts:357` — `getNearestCellForTarget` — relational-swap (module-private helper)
```diff
- const tofStep = gridParams.nTof <= 1
+ const tofStep = gridParams.nTof < 1
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 652. `porkchop/porkchop-view.ts:424` — `getGridIndicesForCell` — relational-swap (module-private helper)
```diff
- const depStep = gridParams.nDep <= 1
+ const depStep = gridParams.nDep < 1
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 653. `porkchop/porkchop-view.ts:427` — `getGridIndicesForCell` — relational-swap (module-private helper)
```diff
- const tofStep = gridParams.nTof <= 1
+ const tofStep = gridParams.nTof < 1
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 654. `porkchop/porkchop-view.ts:437` — `getGridIndicesForCell` — relational-swap (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
+ if (depIndex <= 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 655. `porkchop/porkchop-view.ts:437` — `getGridIndicesForCell` — relational-swap (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
+ if (depIndex < 0 || depIndex > gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 656. `porkchop/porkchop-view.ts:437` — `getGridIndicesForCell` — relational-swap (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
+ if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex <= 0 || tofIndex >= gridParams.nTof) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 657. `porkchop/porkchop-view.ts:437` — `getGridIndicesForCell` — relational-swap (module-private helper)
```diff
- if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
+ if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex > gridParams.nTof) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 658. `porkchop/porkchop-view.ts:538` — `findGlobalMinimumCell` — relational-swap (module-private helper)
```diff
- if (c3 !== null && c3 < minimumC3) {
+ if (c3 !== null && c3 <= minimumC3) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.

### 659. `porkchop/porkchop-view.ts:266` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const shiftedJulianDay = jdTdb + 0.5;
+ const shiftedJulianDay = jdTdb - 0.5;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 660. `porkchop/porkchop-view.ts:268` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const fractionalDay = shiftedJulianDay - z;
+ const fractionalDay = shiftedJulianDay + z;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 661. `porkchop/porkchop-view.ts:271` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const alpha = Math.floor((z - 1_867_216.25) / 36_524.25);
+ const alpha = Math.floor((z + 1_867_216.25) / 36_524.25);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 662. `porkchop/porkchop-view.ts:271` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const alpha = Math.floor((z - 1_867_216.25) / 36_524.25);
+ const alpha = Math.floor((z - 1_867_216.25) * 36_524.25);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 663. `porkchop/porkchop-view.ts:272` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- a = z + 1 + alpha - Math.floor(alpha / 4);
+ a = z - 1 + alpha - Math.floor(alpha / 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 664. `porkchop/porkchop-view.ts:272` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- a = z + 1 + alpha - Math.floor(alpha / 4);
+ a = z + 1 - alpha - Math.floor(alpha / 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 665. `porkchop/porkchop-view.ts:272` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- a = z + 1 + alpha - Math.floor(alpha / 4);
+ a = z + 1 + alpha + Math.floor(alpha / 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 666. `porkchop/porkchop-view.ts:272` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- a = z + 1 + alpha - Math.floor(alpha / 4);
+ a = z + 1 + alpha - Math.floor(alpha * 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 667. `porkchop/porkchop-view.ts:274` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const b = a + 1_524;
+ const b = a - 1_524;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 668. `porkchop/porkchop-view.ts:275` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const c = Math.floor((b - 122.1) / 365.25);
+ const c = Math.floor((b + 122.1) / 365.25);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 669. `porkchop/porkchop-view.ts:275` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const c = Math.floor((b - 122.1) / 365.25);
+ const c = Math.floor((b - 122.1) * 365.25);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 670. `porkchop/porkchop-view.ts:276` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const d = Math.floor(365.25 * c);
+ const d = Math.floor(365.25 / c);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 671. `porkchop/porkchop-view.ts:277` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const e = Math.floor((b - d) / 30.6001);
+ const e = Math.floor((b + d) / 30.6001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 672. `porkchop/porkchop-view.ts:277` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const e = Math.floor((b - d) / 30.6001);
+ const e = Math.floor((b - d) * 30.6001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 673. `porkchop/porkchop-view.ts:278` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const exactDay = b - d - Math.floor(30.6001 * e) + fractionalDay;
+ const exactDay = b + d - Math.floor(30.6001 * e) + fractionalDay;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 674. `porkchop/porkchop-view.ts:278` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const exactDay = b - d - Math.floor(30.6001 * e) + fractionalDay;
+ const exactDay = b - d + Math.floor(30.6001 * e) + fractionalDay;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 675. `porkchop/porkchop-view.ts:278` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const exactDay = b - d - Math.floor(30.6001 * e) + fractionalDay;
+ const exactDay = b - d - Math.floor(30.6001 / e) + fractionalDay;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 676. `porkchop/porkchop-view.ts:278` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const exactDay = b - d - Math.floor(30.6001 * e) + fractionalDay;
+ const exactDay = b - d - Math.floor(30.6001 * e) - fractionalDay;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 677. `porkchop/porkchop-view.ts:280` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const month = e < 14 ? e - 1 : e - 13;
+ const month = e < 14 ? e + 1 : e - 13;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 678. `porkchop/porkchop-view.ts:280` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const month = e < 14 ? e - 1 : e - 13;
+ const month = e < 14 ? e - 1 : e + 13;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 679. `porkchop/porkchop-view.ts:281` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const year = month > 2 ? c - 4_716 : c - 4_715;
+ const year = month > 2 ? c + 4_716 : c - 4_715;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 680. `porkchop/porkchop-view.ts:281` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- const year = month > 2 ? c - 4_716 : c - 4_715;
+ const year = month > 2 ? c - 4_716 : c + 4_715;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 681. `porkchop/porkchop-view.ts:282` — `jdTdbToDateParts` — arithmetic-swap (module-private helper)
```diff
- return { year, monthIndex: month - 1, day };
+ return { year, monthIndex: month + 1, day };
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 682. `porkchop/porkchop-view.ts:302` — `buildLegendGradient` — arithmetic-swap (module-private helper)
```diff
- const fraction = index / sampleCount;
+ const fraction = index * sampleCount;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 683. `porkchop/porkchop-view.ts:304` — `buildLegendGradient` — arithmetic-swap (module-private helper)
```diff
- Math.log(C3_COLOR_MIN) + fraction * (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
+ Math.log(C3_COLOR_MIN) - fraction * (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 684. `porkchop/porkchop-view.ts:304` — `buildLegendGradient` — arithmetic-swap (module-private helper)
```diff
- Math.log(C3_COLOR_MIN) + fraction * (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
+ Math.log(C3_COLOR_MIN) + fraction / (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 685. `porkchop/porkchop-view.ts:304` — `buildLegendGradient` — arithmetic-swap (module-private helper)
```diff
- Math.log(C3_COLOR_MIN) + fraction * (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
+ Math.log(C3_COLOR_MIN) + fraction * (Math.log(C3_COLOR_MAX) + Math.log(C3_COLOR_MIN)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 686. `porkchop/porkchop-view.ts:307` — `buildLegendGradient` — argument-swap (module-private helper)
```diff
- stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * 100, 2)}%`);
+ stops.push(`${rgbToCss(rgb)} ${formatNumber(2, fraction * 100)}%`);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 687. `porkchop/porkchop-view.ts:307` — `buildLegendGradient` — arithmetic-swap (module-private helper)
```diff
- stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * 100, 2)}%`);
+ stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction / 100, 2)}%`);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 688. `porkchop/porkchop-view.ts:334` — `getCellAtCoordinates` — argument-swap (module-private helper)
```diff
- const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - 1);
+ const x = Math.min(rect.width - 1, Math.max(event.clientX - rect.left, 0));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 689. `porkchop/porkchop-view.ts:334` — `getCellAtCoordinates` — argument-swap (module-private helper)
```diff
- const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - 1);
+ const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 690. `porkchop/porkchop-view.ts:334` — `getCellAtCoordinates` — arithmetic-swap (module-private helper)
```diff
- const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - 1);
+ const x = Math.min(Math.max(event.clientX + rect.left, 0), rect.width - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 691. `porkchop/porkchop-view.ts:334` — `getCellAtCoordinates` — arithmetic-swap (module-private helper)
```diff
- const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - 1);
+ const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width + 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 692. `porkchop/porkchop-view.ts:335` — `getCellAtCoordinates` — argument-swap (module-private helper)
```diff
- const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - 1);
+ const y = Math.min(rect.height - 1, Math.max(event.clientY - rect.top, 0));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 693. `porkchop/porkchop-view.ts:335` — `getCellAtCoordinates` — argument-swap (module-private helper)
```diff
- const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - 1);
+ const y = Math.min(Math.max(0, event.clientY - rect.top), rect.height - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 694. `porkchop/porkchop-view.ts:335` — `getCellAtCoordinates` — arithmetic-swap (module-private helper)
```diff
- const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - 1);
+ const y = Math.min(Math.max(event.clientY + rect.top, 0), rect.height - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 695. `porkchop/porkchop-view.ts:335` — `getCellAtCoordinates` — arithmetic-swap (module-private helper)
```diff
- const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - 1);
+ const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height + 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 696. `porkchop/porkchop-view.ts:337` — `getCellAtCoordinates` — argument-swap (module-private helper)
```diff
- gridParams.nDep - 1,
+ (multi-line statement replaced by: Math.floor((x / rect.width) * gridParams.nDep),
    gridParams.nDep - 1)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 697. `porkchop/porkchop-view.ts:337` — `getCellAtCoordinates` — arithmetic-swap (module-private helper)
```diff
- gridParams.nDep - 1,
+ gridParams.nDep + 1,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 698. `porkchop/porkchop-view.ts:341` — `getCellAtCoordinates` — argument-swap (module-private helper)
```diff
- gridParams.nTof - 1,
+ (multi-line statement replaced by: Math.floor((y / rect.height) * gridParams.nTof),
    gridParams.nTof - 1)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 699. `porkchop/porkchop-view.ts:341` — `getCellAtCoordinates` — arithmetic-swap (module-private helper)
```diff
- gridParams.nTof - 1,
+ gridParams.nTof + 1,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 700. `porkchop/porkchop-view.ts:356` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD + gridParams.depStartJD) / (gridParams.nDep - 1);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 701. `porkchop/porkchop-view.ts:356` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD - gridParams.depStartJD) * (gridParams.nDep - 1);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 702. `porkchop/porkchop-view.ts:356` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep + 1);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 703. `porkchop/porkchop-view.ts:359` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays + gridParams.tofMinDays) / (gridParams.nTof - 1);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 704. `porkchop/porkchop-view.ts:359` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays - gridParams.tofMinDays) * (gridParams.nTof - 1);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 705. `porkchop/porkchop-view.ts:359` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof + 1);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 706. `porkchop/porkchop-view.ts:363` — `getNearestCellForTarget` — argument-swap (module-private helper)
```diff
- gridParams.nDep - 1,
+ (multi-line statement replaced by: Math.max(0, Math.round((targetDepJD - gridParams.depStartJD) / depStep)),
        gridParams.nDep - 1)
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 707. `porkchop/porkchop-view.ts:363` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- gridParams.nDep - 1,
+ gridParams.nDep + 1,
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 708. `porkchop/porkchop-view.ts:364` — `getNearestCellForTarget` — argument-swap (module-private helper)
```diff
- Math.max(0, Math.round((targetDepJD - gridParams.depStartJD) / depStep)),
+ Math.max(Math.round((targetDepJD - gridParams.depStartJD) / depStep), 0),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 709. `porkchop/porkchop-view.ts:364` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- Math.max(0, Math.round((targetDepJD - gridParams.depStartJD) / depStep)),
+ Math.max(0, Math.round((targetDepJD + gridParams.depStartJD) / depStep)),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 710. `porkchop/porkchop-view.ts:364` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- Math.max(0, Math.round((targetDepJD - gridParams.depStartJD) / depStep)),
+ Math.max(0, Math.round((targetDepJD - gridParams.depStartJD) * depStep)),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 711. `porkchop/porkchop-view.ts:369` — `getNearestCellForTarget` — argument-swap (module-private helper)
```diff
- gridParams.nTof - 1,
+ (multi-line statement replaced by: Math.max(0, Math.round((targetTofDays - gridParams.tofMinDays) / tofStep)),
        gridParams.nTof - 1)
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 712. `porkchop/porkchop-view.ts:369` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- gridParams.nTof - 1,
+ gridParams.nTof + 1,
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 713. `porkchop/porkchop-view.ts:370` — `getNearestCellForTarget` — argument-swap (module-private helper)
```diff
- Math.max(0, Math.round((targetTofDays - gridParams.tofMinDays) / tofStep)),
+ Math.max(Math.round((targetTofDays - gridParams.tofMinDays) / tofStep), 0),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 714. `porkchop/porkchop-view.ts:370` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- Math.max(0, Math.round((targetTofDays - gridParams.tofMinDays) / tofStep)),
+ Math.max(0, Math.round((targetTofDays + gridParams.tofMinDays) / tofStep)),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 715. `porkchop/porkchop-view.ts:370` — `getNearestCellForTarget` — arithmetic-swap (module-private helper)
```diff
- Math.max(0, Math.round((targetTofDays - gridParams.tofMinDays) / tofStep)),
+ Math.max(0, Math.round((targetTofDays - gridParams.tofMinDays) * tofStep)),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 716. `porkchop/porkchop-view.ts:372` — `getNearestCellForTarget` — argument-swap (module-private helper)
```diff
- return getCellAtGridIndices(depIndex, tofIndex, cells, gridParams);
+ return getCellAtGridIndices(tofIndex, depIndex, cells, gridParams);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 717. `porkchop/porkchop-view.ts:372` — `getNearestCellForTarget` — argument-swap (module-private helper)
```diff
- return getCellAtGridIndices(depIndex, tofIndex, cells, gridParams);
+ return getCellAtGridIndices(depIndex, tofIndex, gridParams, cells);
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 718. `porkchop/porkchop-view.ts:380` — `buildPinnedReadout` — arithmetic-swap (module-private helper)
```diff
- arrivalJD: cell.depJD + cell.tofDays,
+ arrivalJD: cell.depJD - cell.tofDays,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 719. `porkchop/porkchop-view.ts:399` — `buildPinnedReadout` — arithmetic-swap (module-private helper)
```diff
- arrivalJD: cell.depJD + cell.tofDays,
+ arrivalJD: cell.depJD - cell.tofDays,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 720. `porkchop/porkchop-view.ts:426` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD + gridParams.depStartJD) / (gridParams.nDep - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 721. `porkchop/porkchop-view.ts:426` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD - gridParams.depStartJD) * (gridParams.nDep - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 722. `porkchop/porkchop-view.ts:426` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep + 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 723. `porkchop/porkchop-view.ts:429` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays + gridParams.tofMinDays) / (gridParams.nTof - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 724. `porkchop/porkchop-view.ts:429` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays - gridParams.tofMinDays) * (gridParams.nTof - 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 725. `porkchop/porkchop-view.ts:429` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof + 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 726. `porkchop/porkchop-view.ts:432` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : Math.round((cell.depJD - gridParams.depStartJD) / depStep);
+ : Math.round((cell.depJD + gridParams.depStartJD) / depStep);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 727. `porkchop/porkchop-view.ts:432` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : Math.round((cell.depJD - gridParams.depStartJD) / depStep);
+ : Math.round((cell.depJD - gridParams.depStartJD) * depStep);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 728. `porkchop/porkchop-view.ts:435` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : Math.round((cell.tofDays - gridParams.tofMinDays) / tofStep);
+ : Math.round((cell.tofDays + gridParams.tofMinDays) / tofStep);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 729. `porkchop/porkchop-view.ts:435` — `getGridIndicesForCell` — arithmetic-swap (module-private helper)
```diff
- : Math.round((cell.tofDays - gridParams.tofMinDays) / tofStep);
+ : Math.round((cell.tofDays - gridParams.tofMinDays) * tofStep);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 730. `porkchop/porkchop-view.ts:449` — `getDisplayCoordinatesForIndices` — argument-swap (module-private helper)
```diff
- return getDisplayCoordinatesForGridPoint(depIndex, tofIndex, gridParams);
+ return getDisplayCoordinatesForGridPoint(tofIndex, depIndex, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 731. `porkchop/porkchop-view.ts:457` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- const cellWidth = DISPLAY_WIDTH / gridParams.nDep;
+ const cellWidth = DISPLAY_WIDTH * gridParams.nDep;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 732. `porkchop/porkchop-view.ts:458` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- const cellHeight = DISPLAY_HEIGHT / gridParams.nTof;
+ const cellHeight = DISPLAY_HEIGHT * gridParams.nTof;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 733. `porkchop/porkchop-view.ts:459` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- const rowFromTop = gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = gridParams.nTof + 1 - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 734. `porkchop/porkchop-view.ts:459` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- const rowFromTop = gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = gridParams.nTof - 1 + tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 735. `porkchop/porkchop-view.ts:461` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- x: depIndex * cellWidth + cellWidth / 2,
+ x: depIndex / cellWidth + cellWidth / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 736. `porkchop/porkchop-view.ts:461` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- x: depIndex * cellWidth + cellWidth / 2,
+ x: depIndex * cellWidth - cellWidth / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 737. `porkchop/porkchop-view.ts:461` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- x: depIndex * cellWidth + cellWidth / 2,
+ x: depIndex * cellWidth + cellWidth * 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 738. `porkchop/porkchop-view.ts:462` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- y: rowFromTop * cellHeight + cellHeight / 2,
+ y: rowFromTop / cellHeight + cellHeight / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 739. `porkchop/porkchop-view.ts:462` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- y: rowFromTop * cellHeight + cellHeight / 2,
+ y: rowFromTop * cellHeight - cellHeight / 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 740. `porkchop/porkchop-view.ts:462` — `getDisplayCoordinatesForGridPoint` — arithmetic-swap (module-private helper)
```diff
- y: rowFromTop * cellHeight + cellHeight / 2,
+ y: rowFromTop * cellHeight + cellHeight * 2,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 741. `porkchop/porkchop-view.ts:476` — `drawMarker` — argument-swap (module-private helper)
```diff
- context.arc(x, y, radius, 0, Math.PI * 2);
+ context.arc(y, x, radius, 0, Math.PI * 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 742. `porkchop/porkchop-view.ts:476` — `drawMarker` — argument-swap (module-private helper)
```diff
- context.arc(x, y, radius, 0, Math.PI * 2);
+ context.arc(x, y, radius, Math.PI * 2, 0);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 743. `porkchop/porkchop-view.ts:476` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.arc(x, y, radius, 0, Math.PI * 2);
+ context.arc(x, y, radius, 0, Math.PI / 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 744. `porkchop/porkchop-view.ts:484` — `drawMarker` — argument-swap (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(y, x - radius - 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 745. `porkchop/porkchop-view.ts:484` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(x + radius - 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 746. `porkchop/porkchop-view.ts:484` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(x - radius + 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 747. `porkchop/porkchop-view.ts:485` — `drawMarker` — argument-swap (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(y, x + radius + 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 748. `porkchop/porkchop-view.ts:485` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(x - radius + 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 749. `porkchop/porkchop-view.ts:485` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(x + radius - 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 750. `porkchop/porkchop-view.ts:486` — `drawMarker` — argument-swap (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(y - radius - 4, x);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 751. `porkchop/porkchop-view.ts:486` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(x, y + radius - 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 752. `porkchop/porkchop-view.ts:486` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(x, y - radius + 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 753. `porkchop/porkchop-view.ts:487` — `drawMarker` — argument-swap (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(y + radius + 4, x);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 754. `porkchop/porkchop-view.ts:487` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(x, y - radius + 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 755. `porkchop/porkchop-view.ts:487` — `drawMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(x, y + radius - 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 756. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — argument-swap (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(y - radius, x - radius, radius * 2, radius * 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 757. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(x + radius, y - radius, radius * 2, radius * 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 758. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(x - radius, y + radius, radius * 2, radius * 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 759. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(x - radius, y - radius, radius / 2, radius * 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 760. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(x - radius, y - radius, radius * 2, radius / 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 761. `porkchop/porkchop-view.ts:518` — `drawSquareMarker` — argument-swap (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(y, x - radius - 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 762. `porkchop/porkchop-view.ts:518` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(x + radius - 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 763. `porkchop/porkchop-view.ts:518` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(x - radius + 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 764. `porkchop/porkchop-view.ts:519` — `drawSquareMarker` — argument-swap (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(y, x + radius + 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 765. `porkchop/porkchop-view.ts:519` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(x - radius + 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 766. `porkchop/porkchop-view.ts:519` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(x + radius - 4, y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 767. `porkchop/porkchop-view.ts:520` — `drawSquareMarker` — argument-swap (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(y - radius - 4, x);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 768. `porkchop/porkchop-view.ts:520` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(x, y + radius - 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 769. `porkchop/porkchop-view.ts:520` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(x, y - radius + 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 770. `porkchop/porkchop-view.ts:521` — `drawSquareMarker` — argument-swap (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(y + radius + 4, x);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 771. `porkchop/porkchop-view.ts:521` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(x, y - radius + 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 772. `porkchop/porkchop-view.ts:521` — `drawSquareMarker` — arithmetic-swap (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(x, y + radius - 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 773. `porkchop/porkchop-view.ts:556` — `interpolateEdge` — arithmetic-swap (module-private helper)
```diff
- const delta = endValue - startValue;
+ const delta = endValue + startValue;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 774. `porkchop/porkchop-view.ts:560` — `interpolateEdge` — argument-swap (module-private helper)
```diff
- return Math.min(1, Math.max(0, (level - startValue) / delta));
+ return Math.min(Math.max(0, (level - startValue) / delta), 1);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 775. `porkchop/porkchop-view.ts:560` — `interpolateEdge` — argument-swap (module-private helper)
```diff
- return Math.min(1, Math.max(0, (level - startValue) / delta));
+ return Math.min(1, Math.max((level - startValue) / delta, 0));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.

### 776. `porkchop/porkchop-view.ts:560` — `interpolateEdge` — arithmetic-swap (module-private helper)
```diff
- return Math.min(1, Math.max(0, (level - startValue) / delta));
+ return Math.min(1, Math.max(0, (level + startValue) / delta));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 777. `porkchop/porkchop-view.ts:560` — `interpolateEdge` — arithmetic-swap (module-private helper)
```diff
- return Math.min(1, Math.max(0, (level - startValue) / delta));
+ return Math.min(1, Math.max(0, (level - startValue) * delta));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.

### 778. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — loop-start-plus-1
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 1; depIndex < gridParams.nDep - 1; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 779. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — loop-bound-minus-1
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((gridParams.nDep - 1) - 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 780. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — loop-bound-plus-1
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((gridParams.nDep - 1) + 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 781. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — loop-start-plus-1
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 1; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 782. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — loop-bound-minus-1
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < ((gridParams.nTof - 1) - 1); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 783. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — loop-bound-plus-1
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < ((gridParams.nTof - 1) + 1); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 784. `porkchop/porkchop-view.ts:812` — `PorkchopView` — loop-start-plus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 1; depIndex < props.gridParams.nDep; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 785. `porkchop/porkchop-view.ts:812` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((props.gridParams.nDep) - 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 786. `porkchop/porkchop-view.ts:813` — `PorkchopView` — loop-start-plus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 1; tofIndex < props.gridParams.nTof; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 787. `porkchop/porkchop-view.ts:813` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < ((props.gridParams.nTof) - 1); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 788. `porkchop/porkchop-view.ts:840` — `PorkchopView` — loop-start-plus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 1; depIndex < props.gridParams.nDep; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 789. `porkchop/porkchop-view.ts:840` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((props.gridParams.nDep) - 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 790. `porkchop/porkchop-view.ts:840` — `PorkchopView` — loop-bound-plus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((props.gridParams.nDep) + 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 791. `porkchop/porkchop-view.ts:841` — `PorkchopView` — loop-start-plus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 1; tofIndex < props.gridParams.nTof; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 792. `porkchop/porkchop-view.ts:841` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < ((props.gridParams.nTof) - 1); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 793. `porkchop/porkchop-view.ts:841` — `PorkchopView` — loop-bound-plus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < ((props.gridParams.nTof) + 1); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 794. `porkchop/porkchop-view.ts:863` — `PorkchopView` — loop-start-plus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 1; depIndex < props.gridParams.nDep; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 795. `porkchop/porkchop-view.ts:863` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((props.gridParams.nDep) - 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 796. `porkchop/porkchop-view.ts:863` — `PorkchopView` — loop-bound-plus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((props.gridParams.nDep) + 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 797. `porkchop/porkchop-view.ts:896` — `PorkchopView` — loop-start-plus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 1; depIndex < props.gridParams.nDep; depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 798. `porkchop/porkchop-view.ts:896` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < ((props.gridParams.nDep) - 1); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 799. `porkchop/porkchop-view.ts:897` — `PorkchopView` — loop-start-plus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 1; tofIndex < props.gridParams.nTof; tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 800. `porkchop/porkchop-view.ts:897` — `PorkchopView` — loop-bound-minus-1
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < ((props.gridParams.nTof) - 1); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 801. `porkchop/porkchop-view.ts:575` — `buildContourSegments` — constant-nudge
```diff
- 2: [[0, 1]],
+ 2: [[0, (1 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 802. `porkchop/porkchop-view.ts:576` — `buildContourSegments` — constant-nudge
```diff
- 3: [[3, 1]],
+ 3: [[(3 * 1.001), 1]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 803. `porkchop/porkchop-view.ts:576` — `buildContourSegments` — constant-nudge
```diff
- 3: [[3, 1]],
+ 3: [[3, (1 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 804. `porkchop/porkchop-view.ts:577` — `buildContourSegments` — constant-nudge
```diff
- 4: [[1, 2]],
+ 4: [[(1 * 1.001), 2]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 805. `porkchop/porkchop-view.ts:577` — `buildContourSegments` — constant-nudge
```diff
- 4: [[1, 2]],
+ 4: [[1, (2 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 806. `porkchop/porkchop-view.ts:578` — `buildContourSegments` — constant-nudge
```diff
- 5: [[3, 2], [0, 1]],
+ 5: [[(3 * 1.001), 2], [0, 1]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 807. `porkchop/porkchop-view.ts:578` — `buildContourSegments` — constant-nudge
```diff
- 5: [[3, 2], [0, 1]],
+ 5: [[3, (2 * 1.001)], [0, 1]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 808. `porkchop/porkchop-view.ts:578` — `buildContourSegments` — constant-nudge
```diff
- 5: [[3, 2], [0, 1]],
+ 5: [[3, 2], [0, (1 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 809. `porkchop/porkchop-view.ts:580` — `buildContourSegments` — constant-nudge
```diff
- 7: [[3, 2]],
+ 7: [[(3 * 1.001), 2]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 810. `porkchop/porkchop-view.ts:580` — `buildContourSegments` — constant-nudge
```diff
- 7: [[3, 2]],
+ 7: [[3, (2 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 811. `porkchop/porkchop-view.ts:581` — `buildContourSegments` — constant-nudge
```diff
- 8: [[2, 3]],
+ 8: [[(2 * 1.001), 3]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 812. `porkchop/porkchop-view.ts:581` — `buildContourSegments` — constant-nudge
```diff
- 8: [[2, 3]],
+ 8: [[2, (3 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 813. `porkchop/porkchop-view.ts:582` — `buildContourSegments` — constant-nudge
```diff
- 9: [[0, 2]],
+ 9: [[0, (2 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 814. `porkchop/porkchop-view.ts:583` — `buildContourSegments` — constant-nudge
```diff
- 10: [[0, 3], [1, 2]],
+ 10: [[0, (3 * 1.001)], [1, 2]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 815. `porkchop/porkchop-view.ts:583` — `buildContourSegments` — constant-nudge
```diff
- 10: [[0, 3], [1, 2]],
+ 10: [[0, 3], [(1 * 1.001), 2]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 816. `porkchop/porkchop-view.ts:583` — `buildContourSegments` — constant-nudge
```diff
- 10: [[0, 3], [1, 2]],
+ 10: [[0, 3], [1, (2 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 817. `porkchop/porkchop-view.ts:584` — `buildContourSegments` — constant-nudge
```diff
- 11: [[1, 2]],
+ 11: [[(1 * 1.001), 2]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 818. `porkchop/porkchop-view.ts:584` — `buildContourSegments` — constant-nudge
```diff
- 11: [[1, 2]],
+ 11: [[1, (2 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 819. `porkchop/porkchop-view.ts:585` — `buildContourSegments` — constant-nudge
```diff
- 12: [[1, 3]],
+ 12: [[(1 * 1.001), 3]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 820. `porkchop/porkchop-view.ts:585` — `buildContourSegments` — constant-nudge
```diff
- 12: [[1, 3]],
+ 12: [[1, (3 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 821. `porkchop/porkchop-view.ts:586` — `buildContourSegments` — constant-nudge
```diff
- 13: [[0, 1]],
+ 13: [[0, (1 * 1.001)]],
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 822. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — constant-nudge
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 0; depIndex < gridParams.nDep - (1 * 1.001); depIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 823. `porkchop/porkchop-view.ts:593` — `buildContourSegments` — constant-nudge
```diff
- for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
+ for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 824. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — constant-nudge
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < gridParams.nTof - (1 * 1.001); tofIndex += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 825. `porkchop/porkchop-view.ts:594` — `buildContourSegments` — constant-nudge
```diff
- for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 826. `porkchop/porkchop-view.ts:596` — `buildContourSegments` — constant-nudge
```diff
- const bottomRight = getCellAtGridIndices(depIndex + 1, tofIndex, cells, gridParams);
+ const bottomRight = getCellAtGridIndices(depIndex + (1 * 1.001), tofIndex, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 827. `porkchop/porkchop-view.ts:597` — `buildContourSegments` — constant-nudge
```diff
- const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + 1, cells, gridParams);
+ const topRight = getCellAtGridIndices(depIndex + (1 * 1.001), tofIndex + 1, cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 828. `porkchop/porkchop-view.ts:597` — `buildContourSegments` — constant-nudge
```diff
- const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + 1, cells, gridParams);
+ const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + (1 * 1.001), cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 829. `porkchop/porkchop-view.ts:598` — `buildContourSegments` — constant-nudge
```diff
- const topLeft = getCellAtGridIndices(depIndex, tofIndex + 1, cells, gridParams);
+ const topLeft = getCellAtGridIndices(depIndex, tofIndex + (1 * 1.001), cells, gridParams);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 830. `porkchop/porkchop-view.ts:613` — `buildContourSegments` — constant-nudge
```diff
- (v0 >= level ? 1 : 0) |
+ (v0 >= level ? (1 * 1.001) : 0) |
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 831. `porkchop/porkchop-view.ts:614` — `buildContourSegments` — constant-nudge
```diff
- (v1 >= level ? 2 : 0) |
+ (v1 >= level ? (2 * 1.001) : 0) |
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 832. `porkchop/porkchop-view.ts:615` — `buildContourSegments` — constant-nudge
```diff
- (v2 >= level ? 4 : 0) |
+ (v2 >= level ? (4 * 1.001) : 0) |
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 833. `porkchop/porkchop-view.ts:616` — `buildContourSegments` — constant-nudge
```diff
- (v3 >= level ? 8 : 0);
+ (v3 >= level ? (8 * 1.001) : 0);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 834. `porkchop/porkchop-view.ts:624` — `buildContourSegments` — constant-nudge
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + (1 * 1.001), tofIndex + interpolateEdge(level, v1, v2), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 835. `porkchop/porkchop-view.ts:625` — `buildContourSegments` — constant-nudge
```diff
- () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
+ () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + (1 * 1.001), gridParams),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 836. `porkchop/porkchop-view.ts:666` — `PorkchopView` — constant-nudge
```diff
- (count, cell) => count + (isNearZeroC3Degenerate(getSelectedBranchC3(cell)) ? 1 : 0),
+ (count, cell) => count + (isNearZeroC3Degenerate(getSelectedBranchC3(cell)) ? (1 * 1.001) : 0),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 837. `porkchop/porkchop-view.ts:817` — `PorkchopView` — constant-nudge
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof - (1 * 1.001) - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 838. `porkchop/porkchop-view.ts:818` — `PorkchopView` — constant-nudge
```diff
- const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) * 4;
+ const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) * (4 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 839. `porkchop/porkchop-view.ts:820` — `PorkchopView` — constant-nudge
```diff
- image.data[pixelOffset + 1] = rgb[1];
+ image.data[pixelOffset + (1 * 1.001)] = rgb[1];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 840. `porkchop/porkchop-view.ts:821` — `PorkchopView` — constant-nudge
```diff
- image.data[pixelOffset + 2] = rgb[2];
+ image.data[pixelOffset + (2 * 1.001)] = rgb[2];
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 841. `porkchop/porkchop-view.ts:822` — `PorkchopView` — constant-nudge
```diff
- image.data[pixelOffset + 3] = 255;
+ image.data[pixelOffset + (3 * 1.001)] = 255;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 842. `porkchop/porkchop-view.ts:822` — `PorkchopView` — constant-nudge
```diff
- image.data[pixelOffset + 3] = 255;
+ image.data[pixelOffset + 3] = (255 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 843. `porkchop/porkchop-view.ts:840` — `PorkchopView` — constant-nudge
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 844. `porkchop/porkchop-view.ts:841` — `PorkchopView` — constant-nudge
```diff
- for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
+ for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 845. `porkchop/porkchop-view.ts:846` — `PorkchopView` — constant-nudge
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof - (1 * 1.001) - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 846. `porkchop/porkchop-view.ts:853` — `PorkchopView` — constant-nudge
```diff
- props.gridParams.nTof > 1
+ props.gridParams.nTof > (1 * 1.001)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 847. `porkchop/porkchop-view.ts:854` — `PorkchopView` — constant-nudge
```diff
- ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) / (props.gridParams.nTof - 1)
+ ? (props.gridParams.tofMaxDays - props.gridParams.tofMinDays) / (props.gridParams.nTof - (1 * 1.001))
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 848. `porkchop/porkchop-view.ts:855` — `PorkchopView` — constant-nudge
```diff
- : 1;
+ : (1 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 849. `porkchop/porkchop-view.ts:857` — `PorkchopView` — constant-nudge
```diff
- context.lineWidth = 1.5;
+ context.lineWidth = (1.5 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 850. `porkchop/porkchop-view.ts:859` — `PorkchopView` — constant-nudge
```diff
- context.setLineDash([5, 4]);
+ context.setLineDash([(5 * 1.001), 4]);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 851. `porkchop/porkchop-view.ts:859` — `PorkchopView` — constant-nudge
```diff
- context.setLineDash([5, 4]);
+ context.setLineDash([5, (4 * 1.001)]);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 852. `porkchop/porkchop-view.ts:863` — `PorkchopView` — constant-nudge
```diff
- for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
+ for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 853. `porkchop/porkchop-view.ts:866` — `PorkchopView` — constant-nudge
```diff
- if (tofIndex < 0 || tofIndex > props.gridParams.nTof - 1) {
+ if (tofIndex < 0 || tofIndex > props.gridParams.nTof - (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 854. `porkchop/porkchop-view.ts:889` — `PorkchopView` — constant-nudge
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max((1 * 1.001), Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 855. `porkchop/porkchop-view.ts:889` — `PorkchopView` — constant-nudge
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max(1, Math.min((2 * 1.001), Math.min(cellWidthPx, cellHeightPx) / 3));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 856. `porkchop/porkchop-view.ts:889` — `PorkchopView` — constant-nudge
```diff
- const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / 3));
+ const dotSize = Math.max(1, Math.min(2, Math.min(cellWidthPx, cellHeightPx) / (3 * 1.001)));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 857. `porkchop/porkchop-view.ts:899` — `PorkchopView` — constant-nudge
```diff
- if (cell.status !== 'ok' || cell.M !== 1) {
+ if (cell.status !== 'ok' || cell.M !== (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 858. `porkchop/porkchop-view.ts:902` — `PorkchopView` — constant-nudge
```diff
- const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = props.gridParams.nTof - (1 * 1.001) - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 859. `porkchop/porkchop-view.ts:908` — `PorkchopView` — constant-nudge
```diff
- if (cell !== minimumCell && (depIndex + rowFromTop) % 2 !== 0) {
+ if (cell !== minimumCell && (depIndex + rowFromTop) % (2 * 1.001) !== 0) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 860. `porkchop/porkchop-view.ts:912` — `PorkchopView` — constant-nudge
```diff
- depIndex * cellWidthPx + (cellWidthPx - dotSize) / 2,
+ depIndex * cellWidthPx + (cellWidthPx - dotSize) / (2 * 1.001),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 861. `porkchop/porkchop-view.ts:913` — `PorkchopView` — constant-nudge
```diff
- rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / 2,
+ rowFromTop * cellHeightPx + (cellHeightPx - dotSize) / (2 * 1.001),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 862. `porkchop/porkchop-view.ts:924` — `PorkchopView` — constant-nudge
```diff
- context.lineWidth = 1.2;
+ context.lineWidth = (1.2 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 863. `porkchop/porkchop-view.ts:941` — `PorkchopView` — constant-nudge
```diff
- context.lineWidth = 1.2;
+ context.lineWidth = (1.2 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 864. `porkchop/porkchop-view.ts:943` — `PorkchopView` — constant-nudge
```diff
- context.setLineDash([3, 3]);
+ context.setLineDash([(3 * 1.001), 3]);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 865. `porkchop/porkchop-view.ts:943` — `PorkchopView` — constant-nudge
```diff
- context.setLineDash([3, 3]);
+ context.setLineDash([3, (3 * 1.001)]);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 866. `porkchop/porkchop-view.ts:956` — `PorkchopView` — constant-nudge
```diff
- context.lineWidth = 2;
+ context.lineWidth = (2 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 867. `porkchop/porkchop-view.ts:958` — `PorkchopView` — constant-nudge
```diff
- context.setLineDash([8, 5]);
+ context.setLineDash([(8 * 1.001), 5]);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 868. `porkchop/porkchop-view.ts:958` — `PorkchopView` — constant-nudge
```diff
- context.setLineDash([8, 5]);
+ context.setLineDash([8, (5 * 1.001)]);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 869. `porkchop/porkchop-view.ts:994` — `PorkchopView` — constant-nudge
```diff
- drawCellMarker(extremes.minimum.cell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.10)', 11);
+ drawCellMarker(extremes.minimum.cell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.10)', (11 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 870. `porkchop/porkchop-view.ts:995` — `PorkchopView` — constant-nudge
```diff
- drawCellMarker(extremes.maximum.cell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.10)', 11, drawSquareMarker);
+ drawCellMarker(extremes.maximum.cell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.10)', (11 * 1.001), drawSquareMarker);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 871. `porkchop/porkchop-view.ts:998` — `PorkchopView` — constant-nudge
```diff
- drawCellMarker(pinnedCell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.22)', 8);
+ drawCellMarker(pinnedCell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.22)', (8 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 872. `porkchop/porkchop-view.ts:999` — `PorkchopView` — constant-nudge
```diff
- drawCellMarker(hoverCell, 'rgba(167,243,208,0.95)', 'rgba(167,243,208,0.16)', 6);
+ drawCellMarker(hoverCell, 'rgba(167,243,208,0.95)', 'rgba(167,243,208,0.16)', (6 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 873. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — constant-nudge
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(event.clientX - rect.left + (12 * 1.001), 8), rect.width - 188),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 874. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — constant-nudge
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(event.clientX - rect.left + 12, (8 * 1.001)), rect.width - 188),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 875. `porkchop/porkchop-view.ts:1032` — `PorkchopView` — constant-nudge
```diff
- x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
+ x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - (188 * 1.001)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 876. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — constant-nudge
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(event.clientY - rect.top + (12 * 1.001), 8), rect.height - 108),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 877. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — constant-nudge
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(event.clientY - rect.top + 12, (8 * 1.001)), rect.height - 108),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 878. `porkchop/porkchop-view.ts:1033` — `PorkchopView` — constant-nudge
```diff
- y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
+ y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - (108 * 1.001)),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 879. `porkchop/porkchop-view.ts:1083` — `PorkchopView` — constant-nudge
```diff
- const tofMinLabel = `${formatNumber(props.gridParams.tofMinDays, 1)} d`;
+ const tofMinLabel = `${formatNumber(props.gridParams.tofMinDays, (1 * 1.001))} d`;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 880. `porkchop/porkchop-view.ts:1084` — `PorkchopView` — constant-nudge
```diff
- const tofMaxLabel = `${formatNumber(props.gridParams.tofMaxDays, 1)} d`;
+ const tofMaxLabel = `${formatNumber(props.gridParams.tofMaxDays, (1 * 1.001))} d`;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 881. `porkchop/porkchop-view.ts:1115` — `PorkchopView` — constant-nudge
```diff
- const rowFromTop = props.gridParams.nTof - 1 - indices.tofIndex;
+ const rowFromTop = props.gridParams.nTof - (1 * 1.001) - indices.tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 882. `porkchop/porkchop-view.ts:1160` — `PorkchopView` — constant-nudge
```diff
- computeMs === null ? '' : `worker compute ${formatNumber(computeMs, 1)} ms.`,
+ computeMs === null ? '' : `worker compute ${formatNumber(computeMs, (1 * 1.001))} ms.`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 883. `porkchop/porkchop-view.ts:1308` — `PorkchopView` — constant-nudge
```diff
- h('div', null, `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`),
+ h('div', null, `TOF: ${formatNumber(hoverReadout.tofDays, (3 * 1.001))} d`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 884. `porkchop/porkchop-view.ts:1312` — `PorkchopView` — constant-nudge
```diff
- `C3: ${hoverReadout.c3 === null ? 'n/a' : `${formatNumber(hoverReadout.c3, 6)} km²/s²`}`,
+ `C3: ${hoverReadout.c3 === null ? 'n/a' : `${formatNumber(hoverReadout.c3, (6 * 1.001))} km²/s²`}`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 885. `porkchop/porkchop-view.ts:1358` — `PorkchopView` — constant-nudge
```diff
- h('span', null, `min direct inclination (iMin): ${formatNumber(launchSite.iMinDeg, 1)}° from ${launchSite.name}`),
+ h('span', null, `min direct inclination (iMin): ${formatNumber(launchSite.iMinDeg, (1 * 1.001))}° from ${launchSite.name}`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 886. `porkchop/porkchop-view.ts:1372` — `PorkchopView` — constant-nudge
```diff
- : `max direct declination (ceiling): ${formatNumber(launchSite.dlaCeilingDeg, 1)}° from ${launchSite.name}`,
+ : `max direct declination (ceiling): ${formatNumber(launchSite.dlaCeilingDeg, (1 * 1.001))}° from ${launchSite.name}`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 887. `porkchop/porkchop-view.ts:1415` — `PorkchopView` — constant-nudge
```diff
- : `${formatNumber(entry.c3, 6)} km²/s² (${formatJdC3GridLabel(props.gridParams)}) · Departure ${formatJdTdb(entry.cell.depJD)} · TOF ${formatNumber(entry.cell.tofDays, 3)} d · Family M=${entry.cell.M}` +
+ : `${formatNumber(entry.c3, (6 * 1.001))} km²/s² (${formatJdC3GridLabel(props.gridParams)}) · Departure ${formatJdTdb(entry.cell.depJD)} · TOF ${formatNumber(entry.cell.tofDays, 3)} d · Family M=${entry.cell.M}` +
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 888. `porkchop/porkchop-view.ts:1415` — `PorkchopView` — constant-nudge
```diff
- : `${formatNumber(entry.c3, 6)} km²/s² (${formatJdC3GridLabel(props.gridParams)}) · Departure ${formatJdTdb(entry.cell.depJD)} · TOF ${formatNumber(entry.cell.tofDays, 3)} d · Family M=${entry.cell.M}` +
+ : `${formatNumber(entry.c3, 6)} km²/s² (${formatJdC3GridLabel(props.gridParams)}) · Departure ${formatJdTdb(entry.cell.depJD)} · TOF ${formatNumber(entry.cell.tofDays, (3 * 1.001))} d · Family M=${entry.cell.M}` +
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 889. `porkchop/porkchop-view.ts:1442` — `PorkchopView` — constant-nudge
```diff
- h('span', null, `${formatNumber(pinnedReadout.tofDays, 3)} d`),
+ h('span', null, `${formatNumber(pinnedReadout.tofDays, (3 * 1.001))} d`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 890. `porkchop/porkchop-view.ts:1457` — `PorkchopView` — constant-nudge
```diff
- : `${formatNumber(pinnedReadout.c3, 6)} km²/s² (${formatJdC3GridLabel(props.gridParams)})`,
+ : `${formatNumber(pinnedReadout.c3, (6 * 1.001))} km²/s² (${formatJdC3GridLabel(props.gridParams)})`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 891. `porkchop/porkchop-view.ts:1468` — `PorkchopView` — constant-nudge
```diff
- pinnedReadout.dlaDeg === null ? '—' : `${formatNumber(pinnedReadout.dlaDeg, 1)}°`,
+ pinnedReadout.dlaDeg === null ? '—' : `${formatNumber(pinnedReadout.dlaDeg, (1 * 1.001))}°`,
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 892. `porkchop/porkchop-view.ts:1518` — `PorkchopView` — constant-nudge
```diff
- h('span', { key: 'expected-c3-value' }, `${formatNumber(props.validatedTarget.expectedC3, 2)} km²/s²`),
+ h('span', { key: 'expected-c3-value' }, `${formatNumber(props.validatedTarget.expectedC3, (2 * 1.001))} km²/s²`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 893. `porkchop/porkchop-view.ts:1521` — `PorkchopView` — constant-nudge
```diff
- h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`),
+ h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, (6 * 1.001))} km/s`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 894. `porkchop/porkchop-view.ts:1523` — `PorkchopView` — constant-nudge
```diff
- h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
+ h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, (6 * 1.001))} km/s`),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 895. `porkchop/porkchop-view.ts:301` — `buildLegendGradient` — loop-start-plus-1 (module-private helper)
```diff
- for (let index = 0; index <= sampleCount; index += 1) {
+ for (let index = 1; index <= sampleCount; index += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the FIRST element's contribution.

### 896. `porkchop/porkchop-view.ts:301` — `buildLegendGradient` — loop-bound-minus-1 (module-private helper)
```diff
- for (let index = 0; index <= sampleCount; index += 1) {
+ for (let index = 0; index <= ((sampleCount) - 1); index += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test whose input has at least two elements and asserts on the LAST element's contribution.

### 897. `porkchop/porkchop-view.ts:301` — `buildLegendGradient` — loop-bound-plus-1 (module-private helper)
```diff
- for (let index = 0; index <= sampleCount; index += 1) {
+ for (let index = 0; index <= ((sampleCount) + 1); index += 1) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.

### 898. `porkchop/porkchop-view.ts:266` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const shiftedJulianDay = jdTdb + 0.5;
+ const shiftedJulianDay = jdTdb + (0.5 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 899. `porkchop/porkchop-view.ts:270` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- if (z >= 2_299_161) {
+ if (z >= (2_299_161 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 900. `porkchop/porkchop-view.ts:271` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const alpha = Math.floor((z - 1_867_216.25) / 36_524.25);
+ const alpha = Math.floor((z - (1_867_216.25 * 1.001)) / 36_524.25);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 901. `porkchop/porkchop-view.ts:271` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const alpha = Math.floor((z - 1_867_216.25) / 36_524.25);
+ const alpha = Math.floor((z - 1_867_216.25) / (36_524.25 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 902. `porkchop/porkchop-view.ts:272` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- a = z + 1 + alpha - Math.floor(alpha / 4);
+ a = z + (1 * 1.001) + alpha - Math.floor(alpha / 4);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 903. `porkchop/porkchop-view.ts:272` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- a = z + 1 + alpha - Math.floor(alpha / 4);
+ a = z + 1 + alpha - Math.floor(alpha / (4 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 904. `porkchop/porkchop-view.ts:274` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const b = a + 1_524;
+ const b = a + (1_524 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 905. `porkchop/porkchop-view.ts:275` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const c = Math.floor((b - 122.1) / 365.25);
+ const c = Math.floor((b - (122.1 * 1.001)) / 365.25);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 906. `porkchop/porkchop-view.ts:275` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const c = Math.floor((b - 122.1) / 365.25);
+ const c = Math.floor((b - 122.1) / (365.25 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 907. `porkchop/porkchop-view.ts:276` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const d = Math.floor(365.25 * c);
+ const d = Math.floor((365.25 * 1.001) * c);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 908. `porkchop/porkchop-view.ts:277` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const e = Math.floor((b - d) / 30.6001);
+ const e = Math.floor((b - d) / (30.6001 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 909. `porkchop/porkchop-view.ts:278` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const exactDay = b - d - Math.floor(30.6001 * e) + fractionalDay;
+ const exactDay = b - d - Math.floor((30.6001 * 1.001) * e) + fractionalDay;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 910. `porkchop/porkchop-view.ts:280` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const month = e < 14 ? e - 1 : e - 13;
+ const month = e < (14 * 1.001) ? e - 1 : e - 13;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 911. `porkchop/porkchop-view.ts:280` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const month = e < 14 ? e - 1 : e - 13;
+ const month = e < 14 ? e - (1 * 1.001) : e - 13;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 912. `porkchop/porkchop-view.ts:280` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const month = e < 14 ? e - 1 : e - 13;
+ const month = e < 14 ? e - 1 : e - (13 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 913. `porkchop/porkchop-view.ts:281` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const year = month > 2 ? c - 4_716 : c - 4_715;
+ const year = month > (2 * 1.001) ? c - 4_716 : c - 4_715;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 914. `porkchop/porkchop-view.ts:281` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const year = month > 2 ? c - 4_716 : c - 4_715;
+ const year = month > 2 ? c - (4_716 * 1.001) : c - 4_715;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 915. `porkchop/porkchop-view.ts:281` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- const year = month > 2 ? c - 4_716 : c - 4_715;
+ const year = month > 2 ? c - 4_716 : c - (4_715 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 916. `porkchop/porkchop-view.ts:282` — `jdTdbToDateParts` — constant-nudge (module-private helper)
```diff
- return { year, monthIndex: month - 1, day };
+ return { year, monthIndex: month - (1 * 1.001), day };
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 917. `porkchop/porkchop-view.ts:287` — `formatJdTdb` — constant-nudge (module-private helper)
```diff
- return `${year} ${MONTH_LABELS[monthIndex]} ${String(day).padStart(2, '0')}`;
+ return `${year} ${MONTH_LABELS[monthIndex]} ${String(day).padStart((2 * 1.001), '0')}`;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 918. `porkchop/porkchop-view.ts:300` — `buildLegendGradient` — constant-nudge (module-private helper)
```diff
- const sampleCount = 12;
+ const sampleCount = (12 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 919. `porkchop/porkchop-view.ts:301` — `buildLegendGradient` — constant-nudge (module-private helper)
```diff
- for (let index = 0; index <= sampleCount; index += 1) {
+ for (let index = 0; index <= sampleCount; index += (1 * 1.001)) {
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 920. `porkchop/porkchop-view.ts:307` — `buildLegendGradient` — constant-nudge (module-private helper)
```diff
- stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * 100, 2)}%`);
+ stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * (100 * 1.001), 2)}%`);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 921. `porkchop/porkchop-view.ts:307` — `buildLegendGradient` — constant-nudge (module-private helper)
```diff
- stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * 100, 2)}%`);
+ stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * 100, (2 * 1.001))}%`);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 922. `porkchop/porkchop-view.ts:334` — `getCellAtCoordinates` — constant-nudge (module-private helper)
```diff
- const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - 1);
+ const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - (1 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 923. `porkchop/porkchop-view.ts:335` — `getCellAtCoordinates` — constant-nudge (module-private helper)
```diff
- const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - 1);
+ const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - (1 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 924. `porkchop/porkchop-view.ts:354` — `getNearestCellForTarget` — constant-nudge (module-private helper)
```diff
- const depStep = gridParams.nDep <= 1
+ const depStep = gridParams.nDep <= (1 * 1.001)
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 925. `porkchop/porkchop-view.ts:356` — `getNearestCellForTarget` — constant-nudge (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - (1 * 1.001));
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 926. `porkchop/porkchop-view.ts:357` — `getNearestCellForTarget` — constant-nudge (module-private helper)
```diff
- const tofStep = gridParams.nTof <= 1
+ const tofStep = gridParams.nTof <= (1 * 1.001)
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 927. `porkchop/porkchop-view.ts:359` — `getNearestCellForTarget` — constant-nudge (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - (1 * 1.001));
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 928. `porkchop/porkchop-view.ts:363` — `getNearestCellForTarget` — constant-nudge (module-private helper)
```diff
- gridParams.nDep - 1,
+ gridParams.nDep - (1 * 1.001),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 929. `porkchop/porkchop-view.ts:369` — `getNearestCellForTarget` — constant-nudge (module-private helper)
```diff
- gridParams.nTof - 1,
+ gridParams.nTof - (1 * 1.001),
```
Layer view. No test executes `getNearestCellForTarget` (13 test file(s) import the module; none calls it).
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 930. `porkchop/porkchop-view.ts:424` — `getGridIndicesForCell` — constant-nudge (module-private helper)
```diff
- const depStep = gridParams.nDep <= 1
+ const depStep = gridParams.nDep <= (1 * 1.001)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 931. `porkchop/porkchop-view.ts:426` — `getGridIndicesForCell` — constant-nudge (module-private helper)
```diff
- : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
+ : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - (1 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 932. `porkchop/porkchop-view.ts:427` — `getGridIndicesForCell` — constant-nudge (module-private helper)
```diff
- const tofStep = gridParams.nTof <= 1
+ const tofStep = gridParams.nTof <= (1 * 1.001)
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 933. `porkchop/porkchop-view.ts:429` — `getGridIndicesForCell` — constant-nudge (module-private helper)
```diff
- : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
+ : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - (1 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 934. `porkchop/porkchop-view.ts:459` — `getDisplayCoordinatesForGridPoint` — constant-nudge (module-private helper)
```diff
- const rowFromTop = gridParams.nTof - 1 - tofIndex;
+ const rowFromTop = gridParams.nTof - (1 * 1.001) - tofIndex;
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 935. `porkchop/porkchop-view.ts:461` — `getDisplayCoordinatesForGridPoint` — constant-nudge (module-private helper)
```diff
- x: depIndex * cellWidth + cellWidth / 2,
+ x: depIndex * cellWidth + cellWidth / (2 * 1.001),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 936. `porkchop/porkchop-view.ts:462` — `getDisplayCoordinatesForGridPoint` — constant-nudge (module-private helper)
```diff
- y: rowFromTop * cellHeight + cellHeight / 2,
+ y: rowFromTop * cellHeight + cellHeight / (2 * 1.001),
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 937. `porkchop/porkchop-view.ts:476` — `drawMarker` — constant-nudge (module-private helper)
```diff
- context.arc(x, y, radius, 0, Math.PI * 2);
+ context.arc(x, y, radius, 0, Math.PI * (2 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 938. `porkchop/porkchop-view.ts:479` — `drawMarker` — constant-nudge (module-private helper)
```diff
- context.lineWidth = 2;
+ context.lineWidth = (2 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 939. `porkchop/porkchop-view.ts:484` — `drawMarker` — constant-nudge (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(x - radius - (4 * 1.001), y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 940. `porkchop/porkchop-view.ts:485` — `drawMarker` — constant-nudge (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(x + radius + (4 * 1.001), y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 941. `porkchop/porkchop-view.ts:486` — `drawMarker` — constant-nudge (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(x, y - radius - (4 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 942. `porkchop/porkchop-view.ts:487` — `drawMarker` — constant-nudge (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(x, y + radius + (4 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 943. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(x - radius, y - radius, radius * (2 * 1.001), radius * 2);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 944. `porkchop/porkchop-view.ts:510` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.rect(x - radius, y - radius, radius * 2, radius * 2);
+ context.rect(x - radius, y - radius, radius * 2, radius * (2 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 945. `porkchop/porkchop-view.ts:513` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.lineWidth = 2;
+ context.lineWidth = (2 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 946. `porkchop/porkchop-view.ts:518` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.moveTo(x - radius - 4, y);
+ context.moveTo(x - radius - (4 * 1.001), y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 947. `porkchop/porkchop-view.ts:519` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.lineTo(x + radius + 4, y);
+ context.lineTo(x + radius + (4 * 1.001), y);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 948. `porkchop/porkchop-view.ts:520` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.moveTo(x, y - radius - 4);
+ context.moveTo(x, y - radius - (4 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 949. `porkchop/porkchop-view.ts:521` — `drawSquareMarker` — constant-nudge (module-private helper)
```diff
- context.lineTo(x, y + radius + 4);
+ context.lineTo(x, y + radius + (4 * 1.001));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 950. `porkchop/porkchop-view.ts:558` — `interpolateEdge` — constant-nudge (module-private helper)
```diff
- return 0.5;
+ return (0.5 * 1.001);
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

### 951. `porkchop/porkchop-view.ts:560` — `interpolateEdge` — constant-nudge (module-private helper)
```diff
- return Math.min(1, Math.max(0, (level - startValue) / delta));
+ return Math.min((1 * 1.001), Math.max(0, (level - startValue) / delta));
```
Layer view. 1 test file(s) executed this function and still passed (13 import the module): `v2-dla-render.test.mjs`.
Suggested test: A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).

