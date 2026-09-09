# MATH-LAYER AUDIT — every equation, cross-checked

Slice 18 (Screening Fidelity) · executed 2026-09-06 by Claude Code against HEAD `6e89131` · repo READ-ONLY; nothing fixed, nothing modified, nothing pushed; zero network calls.

**Reproduce:** `audit-1-core.mjs`, `audit-2-lambert.mjs`, `audit-3-derived.mjs`, `part3-no-encounter-drift.mjs` (this directory), consuming the compiled repo modules in `../build-v2x` / `../build-v2m` / `../build-v2p` / `build-extra/`. Results JSONs alongside.

## VERDICT, first

**No defect that invalidates any committed measurement or locked DEC.** Two genuine defects found (both LOW severity, both unreachable from shipped product paths), eleven latent hazards catalogued, and every load-bearing computation passed independent verification at or near machine precision. The PART 3 gate opened; its measurement is reported at the end.

What a clean core does NOT establish: correctness of the v1 `src/physics/` legacy layer (out of v2 scope, unaudited), the app-layer ΔV/payload wiring beyond formula location (sourced-curve interpolation, spot-read only), or anything about JPL's orbit solutions themselves (the standing solution-vs-reality limitation).

---

## PART 1 — INVENTORY

**Scope audited in depth:** 17 files, ~2,160 lines of numerical code.
- `core/propagators/keplerian.ts` — Kepler solve + element→state propagation (ecliptic elements → perifocal → ecliptic → equatorial ICRF, obliquity applied exactly once)
- `core/lambert/` — `izzo.ts`, `lambert-multi-rev.ts`, `tof.ts`, `householder.ts`, `initial-guess.ts`, `hyp2f1b.ts`, `dla.ts`, `vec3.ts` (+ `stumpff.ts`, dead in v2)
- `core/interpolators/hermite.ts` — cubic Hermite state interpolation
- `core/units.ts`, `core/units/utc-to-tdb.ts` — JD/seconds/UTC↔TDB
- `tools/slice7-research/state-to-elements.mjs` — `cartesianToElements` (equatorial→ecliptic inverse rotation; feeds every drift measurement and the catalog re-anchor)
- `porkchop/grid-compute.ts` (C3/vInf/status mapping), `porkchop/colormap.ts`, `porkchop/composite-grid.ts`
- Constants: GM_SUN (2 sites, equal), obliquity 84381.448″, AU, TDB−UTC 69.184 s, C3 colormap anchors 1/1000, feasibility 25 km²/s², radius formula constant 1329, iteration caps (Kepler 50, Householder 35/50), tolerances (1e-12 rad, 1e-8 rtol, 1e-15 hyp2f1b), x²≤0.90 multi-rev limit, hermite cadences.
- Unit/frame conversion map: km↔m at the worker boundary and fixture ingestion; JD↔seconds in `units.ts` + `grid-compute.ts:76-78` + app `utcMidnightToJdTdb`; UTC→TDB in one module; **obliquity rotation in exactly two places** — forward in `keplerian.ts:87-95`, inverse in `state-to-elements.mjs` — plus `dla.ts`, which *deliberately* applies none and documents why (OQ-12-1: the pipeline frame is ICRF; applying the rotation there would inject ~23.4° of error — the repo's rejected error class, correctly avoided).

**Not reached (stated per 1.4):** v1 `src/physics/` (superseded); render/store/UI; `feasibility.ts` beyond a read; `frames/transform.ts` provider plumbing (no physical math in it); app-layer ΔV stack beyond locating that payload-at-C3 is sourced-curve interpolation, not a formula; `sampleOrbitEllipse` (render-only). Risk-ordering was: propagator → Lambert → cartesianToElements → unit/frame sites → interpolator → derived quantities → constants.

---

## DEFECTS (ordered by severity; none invalidating)

### F1 — LOW · izzo `lambert()` accepts negative TOF and returns `ok:true` with garbage velocities
`izzo.ts:62-145` — no `tof > 0` guard (`lambertMultiRev:287` has one: `!(tof > 0) → null`). Demonstrated: `tof = −100 d` → `ok:true, x = −1.743, |v1| = 62.4 km/s`. Mechanism: negative normalized T drives the Householder iterate below x = −1, **outside the solver's domain**, where `tof.ts compute_psi` silently returns 0 for x < −1 (`tof.ts:46-49` has branches for x∈[−1,1) and x>1 only) — the iteration then "converges" on a meaningless root. Two latent gaps compound: the missing input guard and the silent psi fallback.
**Found by:** adversarial input probe (2.10) + code reading. **Affects:** nothing shipped — every product path (grid linspace TOF ≥ 182.5 d, cache TOF ≥ 182 d) is strictly positive, and the porkchop path uses `lambertMultiRev`, which guards. No committed measurement used a non-positive TOF. **Not fixed, per hard stop 2.**

### F2 — LOW · izzo mislabels invalid input as `no_convergence`
NaN position, zero TOF, and Infinity TOF all surface as `reason: 'no_convergence'` rather than an invalid-input reason (NaN propagates through the iteration until the convergence test fails). Safe (never `ok:true`) but the failure taxonomy lies to a debugger. **Found by:** adversarial probes.

---

## LATENT HAZARDS (not defects; each verified or bounded)

| # | hazard | bound / evidence |
|---|---|---|
| L1 | Classical-element **ill-conditioning at i≈0 ∧ ν≈180°**: round-trip position error up to **7.2 km** (e=0.999, i=1e-6°, ν=179.5°). All other regimes ≤ 2.6 cm, most sub-mm. Nowhere acknowledged in code comments. | 245-case grid. Catalog re-anchored elements for very-low-i bodies carry km-scale conversion noise — 8 orders below the measured drift floor; every measurement's sanity gate (sub-metre at anchor, measured per body) guards the pipelines that matter. |
| L2 | **GM_SUN provenance**: comment says "IAU 2015 nominal" but 1.32712440018e20 is the DE430-era value (IAU 2015 nominal is 1.3271244e20; DE441 behind the Horizons truth uses …041e20). | Derived effect of the DE441 mismatch: ~1.7e-10 relative → **~15 km along-track over 19 years** — negligible vs the 10⁵ km floor. Value fine; label imprecise. |
| L3 | `cartesianToElements` **passes NaN through silently** (NaN in → a=NaN, e=NaN out, no throw). | Downstream `validateKeplerianElements` throws on non-finite — chain-safe; direct consumers must know. |
| L4 | σ-guard asymmetry: `lambertMultiRev` guards `sigmaSq < 0` (`:229`), izzo does not (`izzo.ts` sigma line). | Targeted probing (θ→1e-9, near-equal radii) could **not** reproduce a NaN — collinear inputs are caught earlier by `i_h_norm === 0`. Hardening asymmetry only. |
| L5 | `console.debug` per no-solution cell in `lambertMultiRev:320` — fires thousands of times per M=1 grid. | Log noise/perf only. |
| L6 | `interpolateBodyStateSeries` does an O(n) linear scan per call (plus a full equality pre-scan) against the 5,479-sample Earth series, ~20k calls per grid. | Correctness verified; cost only. |
| L7 | Colormap paints an `ok`-status cell with null C3 as **C3_MAX bright** via `?? C3_COLOR_MAX` — indistinct from deeply-infeasible. | Phase D investigation measured 0 such cells; still a silent default. |
| L8 | `core/lambert/stumpff.ts` is **dead code in v2** (no v2 importer; only v1 `src/physics/` has its own copy). | Inventory fact. |
| L9 | Kepler tolerance is on the Newton **step**, not the residual. | Measured worst residual across 17,280 solves: **1.8e-15 rad** — quadratic convergence makes the step criterion sufficient in practice; cap (50) never bound; cap exhaustion **throws** (no silent partial result). |
| L10 | `TDB_MINUS_UTC_SECONDS = 69.184` hardcodes the leap-second count (37). | Documented in-file with update instruction; breaks only if IERS adds a leap second. |
| L11 | `hyp2f1b` domain [0, 0.5] enforced only by the callers' x²≤0.90 limit; returns a truncated series silently if pushed. | Documented in-file; multi-rev clamp (Dispatch 37.5 margin) keeps callers inside. |

**Error-swallowing sweep (2.9):** remarkably clean — one UI `catch` (view error display, legitimate), one `?? 0` in `launch-vehicles.ts:265` (mode-dependent default, correct for one-way mode), izzo's `M ?? 0` default. `resolveSelectedBranch` **correctly skips non-converged branches** (`grid-compute.ts:145-147`), so `lambertMultiRev`'s deliberate return of non-converged branch data (AMD-1 payload) can never become a selected C3; no-branch-converged maps to `stall`, never silently to `ok`.

---

## PART 2 — WHAT PASSED, by check, with tolerances

| check (method) | result | would have caught |
|---|---|---|
| 2.1 circular orbit, 400 samples/period | radius & speed variation ≤ 6.1e-16 rel; period closure exact (0) | wrong mean motion/GM, period error |
| 2.1 i=0 orbit pole vs independently computed rotated ecliptic pole (0, −sin ε, cos ε) | pole error 1.2e-16 | wrong obliquity rotation direction, double/missing rotation |
| 2.1 e-boundary | e=0.999999999 accepted; e=1, e>1, e<0 throw RangeError — exactly as claimed | off-by-epsilon rejection |
| 2.3 energy + \|h\| conservation, 501 epochs × 2026–2046, 5 real bodies | energy ≤ 7.1e-14 rel (worst: e=0.996 body); \|h\| ≤ 3.7e-15 | E→state algebra or velocity-formula errors |
| 2.7 Kepler residual \|E − e sinE − M\|, 17,280 solves to e=0.9999 | worst **1.8e-15 rad**; 0 throws; *(first harness pass showed 2π — an aliasing bug in MY residual at M=−π, self-caught and corrected; disclosed)* | silent partial convergence |
| 2.2 round-trip grid, 245 cases incl. singular regimes | sub-mm typical; see L1 for the one bad corner | anomaly-conversion & inverse-rotation errors |
| 2.4 external oracle | solver files have **zero non-comment changes since the poliastro-validated commit `3560ff8`** (verified by filtered git diff) ⇒ the committed dual-oracle result (M=0 max rel err 3.35e-14 over 2,500 cells vs poliastro 0.17; M=1/M=2 dual-oracle per `multi-rev-poliastro-validation.json`) **binds today's HEAD**. Poliastro is not installed locally; no new oracle run (PyPI outside this run's network scope). | solver drift since validation |
| 2.5 cross-solver, 1,296 geometries (θ=1°→359° incl. 179.9/181, r₂ 0.7–2.5 AU, z to 0.3, TOF 30–1800 d) | izzo ≡ lambertMultiRev at M=0: **worst diff in x and in v: exactly 0** — bit-identical everywhere both solve; both/neither solve identically (1,296/1,296 agreement) | any divergence between the two implementations |
| 2.5 BVP chain: Lambert v1 → cartesianToElements → propagate(tof) → r2 | 1,022 elliptic cases: mean residual **9.3e-6 km (9 mm)**, worst 1.8e-3 km at θ=1°/1800 d; 274 hyperbolic-transfer skips correctly detected | wrong velocity algebra in ANY of the three chained functions |
| 2.5 solution physics | endpoint energy mismatch ≤ 2.3e-14, \|h\| ≤ 6.3e-14; retrograde BVP residual 1.07e-7 km | non-conic "solutions", broken retrograde path |
| 2.7 Householder actual residual \|T(x)−T*\|/T*, 360 pairs | ≤ 1.2e-15; ≤ 4 iterations; **cap never binds**; on cap izzo returns ok:false (no silent partial) | step-tolerance masking a bad root |
| multi-rev TMin boundary | 0.999×TMin → null, 1.02× → both branches, converged, BVP ≤ 1.2e-6 km (M=1 and M=2) | TMin guard error, false convergence flags |
| 2.10 adversarial | exact-180° → invalid_geometry/null (plane undefined — correct); θ→0 collinear → invalid_geometry; genuine small angles to 1e-9 rad → finite correct-magnitude solutions; NaN/Inf/mu=0/M=3/M=1-via-izzo all rejected safely — except F1/F2 above | silent wrong numbers |
| 2.6 interpolator convergence | decimation 2d/4d/8d → worst 1.59/24.7/362 km; **apparent order 3.87 ≈ 4** ✓; implied production (1-day Earth) worst ~0.1 km; confirms the recorded 14-day→7-day floor scaling (×16) used in Front B | wrong Hermite basis, dt scaling, bracketing |
| 2.8 DLA | closed-form angles exact (90/0/−45°); ε and NaN → null | formula/guard errors |
| 2.8 colormap | log anchors clamp exactly at 1 and 1000; status colors distinct; 8 luminance dips measured at ≤ **0.21/255** — sub-perceptual viridis-stop artifacts, not code error | anchor drift, non-monotone map |
| 2.8 composite + gridExtremes | 10,000-cell random synthetic: composite = per-cell min across families, **0 violations**; extremes bound all cells | selection inversion |
| 2.8 estimatedRadiusM | `(1329/√albedo)·10^(−H/5)·500` = standard H→diameter(km) × 500 → radius m: **formula correct** (spot: H=18, p=0.14 → 446 m radius, plausible); the recorded false-precision finding is about inputs, not the formula | formula error |
| units/time | `utcStringToTdbSeconds` ≡ app-layer `utcMidnightToJdTdb` **bit-identical**; JD↔seconds round-trip exact; 69.184 = 37 + 32.184 ✓; obliquity = 84381.448″ = IAU J2000 exactly | cross-implementation drift |

**INV-026 note:** the math-layer literals (GM, obliquity, colormap anchors) never render on a trust surface directly; the constants that do render (LEO radius, stationkeeping, margin in the ΔV copy) print from named constants. No INV-026 violation found in the audited scope; the GM comment mislabel (L2) is the only provenance defect.

---

## PART 3 — the gated measurement (gate OPENED)

**Premise confirmed by the data:** 11 of 17 NEA-band bodies have NO labelled close approach, yet 9 of those 11 still exceed 10⁶ km drift. An encounter-date-only disclosure would mark them "honest throughout," falsely.

**3.1 — what predicts no-encounter drift** (n=11; Spearman vs max drift): **e: 0.56, Q: 0.49, a: 0.47** — the mutually-correlated orbit-shape family; q: −0.03, i: 0.15, min-Earth-distance: 0.17 — nothing. The top four drifters either have Q = 16–19 AU (Jupiter's neighborhood — a perturber absent from both the planet fixture and the 0.1 AU CAD labels) or repeated sub-threshold Earth passes at 20–23M km (0.13–0.15 AU — exactly the "not nothing" passes the dispatch flagged). Counterexample that kills any single-variable rule: 2017 UR52 (e=0.996, Q=705 AU) drifts only 8M km — near-parabolic but slow-moving through the window. **n=11 makes this a hypothesis, not a disclosure basis.**

**3.2 — the δv estimate works.** Derived in-audit (not imported): tan(θ/2) = μ/(d·v²), δv = 2v·sin(θ/2); predicted post-encounter drift rate ≈ δv per unit time:

| case | δv | predicted rate | measured/predicted |
|---|---|---|---|
| 99942 (38k km) | 2.78 km/s | 87.6M km/yr | **2.58** (large-deflection + resonant-return amplification) |
| 2012 UE34 (110k km) | 1.18 km/s | 37.3M km/yr | **1.07** |
| 2025 HH (127k km) | 0.79 km/s | 24.8M km/yr | 0.48 (window-edge limited) |
| 163693–Venus (11.9M km) | 4 m/s | 0.13M km/yr | below secular rate → correctly predicts the measured null |
| 2019 SE9–Earth (5.1M km) | 23 m/s | 0.71M km/yr | below secular rate → correctly predicts the measured null |

It reproduces the hits within a factor ≤2.6, and **explains the nulls**: an encounter matters when δv × (time remaining) exceeds the body's secular drift. A computed physical quantity replaces a tuned distance threshold — categorically the better instrument, as the dispatch conjectured.

**3.3 — honestly computable catalog-wide:** per-encounter dates + δv (one CAD call — `dist`, `v_rel`, plus committed GM values; and the CAD `dist-max` can be raised past 0.1 AU to capture the 0.13–0.15 AU repeated passes, and it does include Jupiter rows); the non-existence flag (already in the data). **Not computable:** drift for the ~94% no-encounter majority (needs per-body truth or a shape-based model validated on far more than n=11); solution-vs-reality error (structurally unmeasurable); anything for the comet band beyond "not-kepler-safe."

---

## SELF-VERIFICATION LEDGER

- **Oracle-of-oracle:** every check method was first exercised on a closed-form case (circular orbit, exact angles, exact clamps) so a disagreement is attributable.
- **Different-method pairs:** propagator ↔ closed forms + conservation; Lambert ↔ propagator via the BVP chain (three independent code paths must agree); izzo ↔ lambertMultiRev (independent implementations, bit-identical); Kepler solve ↔ direct residual evaluation; Hermite ↔ decimation scaling; time scales ↔ two independent implementations compared bit-level; committed poliastro record ↔ git-diff immutability proof.
- **Self-caught errors (disclosed):** (1) Kepler-sweep residual aliasing at M=−π (harness, corrected); (2) first θ→0 probe used an exactly-collinear vector and tested nothing (corrected with genuine small angles); (3) audit-2's first run had a leftover duplicate BVP call in the multi-rev block (harmless, removed from consideration).
- **Measured:** every tolerance above. **Derived:** GM-mismatch km effect, δv predictions, implied production interpolation error. **Inferred (labelled):** Jupiter attribution for high-Q drifters [Likely]; sub-perceptual colormap dips being viridis-stop artifacts.
- **Could not verify:** poliastro re-run (not installed; scope); DE441 GM effect (derived only); v1 physics layer; app ΔV wiring beyond formula location; whether CAD's predicted 2040s encounter distances are themselves solution-sensitive for high-U bodies.
