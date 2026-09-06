# MEASUREMENT — C3 / vInf sensitivity to endpoint (arrival) state drift

Dispatch: 2026-08-24 "C3 / dV SENSITIVITY TO ENDPOINT STATE DRIFT" · executed 2026-08-25 by Claude Code against repo HEAD `46ff00f` · Repo READ-ONLY; all outputs outside the repo.

**Reproduce:** `node C:\Users\hudso\Documents\aster-slice18\c3-drift-sensitivity.mjs`
(compiles the repo's own modules with the repo's tsc into `build-v2c\` outside the repo; writes `c3-drift-sensitivity-results.json` alongside).

---

## ⚠️ LIMITATIONS — read first

1. **Perturbations are synthetic, at drift scales taken from PLANETS** (the prior measurement, `TWO_BODY_DRIFT_MEASUREMENT.md`: ~10³–10⁵ km over 1–15 y for Mercury/Venus/Mars — a floor, not an NEA estimate). No measured NEA drift exists in the repo; actual NEA model error could exceed the largest magnitude tested (10⁶ km) for encounter-perturbed bodies (e.g. Apophis post-2029).
2. **The Earth endpoint was NOT perturbed** — scope limit per the dispatch: the screen interpolates Earth from JPL-integrated truth (`porkchop.worker.ts:138-139`) rather than propagating it, so its error class differs from the asteroid endpoint's.
3. Perturbations were applied to arrival POSITION only; the asteroid's nominal velocity was kept for the vInfArr subtraction (a pure position-drift model; a real ephemeris error would also perturb velocity, second-order for these magnitudes).
4. No perturbed-asteroid truth exists in the repo to validate any of this against integrated reality.

## 1. What was measured, with which repo functions

For five catalog bodies: reproduce the cached best screening cell from stored inputs, then re-solve Lambert with the arrival position displaced by 10³/10⁴/10⁵/10⁶ km along three orbit-local directions, and compare the change in published quantities (C3 km²/s², vInfDep km/s, vInfArr km/s) against the C3 variation between adjacent screening-grid cells.

Repo functions (nothing reimplemented — INV-024 / dispatch C3):
- `lambert` — `src/v2/core/lambert/izzo.ts:60` (single-rev; defaults `M=0, prograde=true, rtol=1e-8, max_iter=35`; rejects M≠0 at izzo.ts:77-82)
- `propagateKeplerianStateVectors` — `src/v2/core/propagators/keplerian.ts:195`
- `interpolateBodyStateSeries` — `src/v2/core/interpolators/hermite.ts`
- `ingestSlice2Fixture` — `src/v2/boundary/horizons.ts`; `ingestSlice9Fixture` — `src/v2/boundary/slice9-nea-catalog.ts`
- `utcStringToTdbSeconds`, `TDB_MINUS_UTC_SECONDS` — `src/v2/core/units/utc-to-tdb.ts:28,41`
- Grid + constants mirrored from the cache producer `tools/build/precompute-lambert-screen.mjs:79-95,141-153` (MU_SUN = 1.32712440018e11 km³/s²; dep = 2026-01-01 UTC + k·7 d ≤ 2040-12-31; TOF 182…1826 step 30 d)

**Pipeline finding (dispatch-hypothesis correction, C4):** the dispatch named `lambertMultiRev` as the solver to use, but the CACHE — the reproduction target and the numbers the product publishes on catalog surfaces — was built with **izzo `lambert` (single-rev)**: `precompute-lambert-screen.mjs:72` imports it and `:257-262` calls `lambert(MU_SUN, earthKm, targetKm, tofSeconds)`. `lambertMultiRev` is the LIVE porkchop worker's solver (`grid-compute.ts:6,187-194`). This measurement uses izzo `lambert` because that is the path that produced the cached values; consequently "revolution-branch changes" cannot occur here (single-rev only) — reported as N/A in §7.

## 2. Reproduction gate (Step 1.4) — PASSED at machine precision, BEFORE any sensitivity numbers

Cached `asteroid-433` (Eros) best cell: minC3 **1.6244339770173506** km²/s² @ 2032-06-10, TOF 272 d; vInfDep 1.2745328465823667 km/s; vInfArr 6.655866629635761 km/s.

Recomputed from stored inputs (Earth interpolated from the 2026-2040 fixture at the departure epoch; asteroid two-body-propagated to departure+TOF; izzo lambert):

| quantity | recomputed | cached | relative diff |
|---|---|---|---|
| C3 | 1.62443397701735 km²/s² | 1.6244339770173506 | **4.1e-16** |
| vInfDep | 1.2745328465823664 km/s | 1.2745328465823667 | 1.7e-16 |
| vInfArr | 6.655866629635761 km/s | 6.655866629635761 | 0 (exact) |

**Tolerance achieved: ≤ 4.1e-16 relative (machine epsilon)** — the pipeline is reproduced bit-for-bit. Additionally, each measured body's full baseline grid argmin matched its cached minC3 to < 1e-9 relative (per-body gate in the script; all passed).

## 3. Body selection (criteria + chosen)

Pool: cache bodies with a solved status, non-null minC3, non-empty bestWindows, present in the catalog. Selected to span eccentricity, condition code, and minC3:

| body | why | e | U | minC3 (km²/s²) | best cell |
|---|---|---|---|---|---|
| asteroid-433 (Eros) | reproduction-gate body | 0.2229 | 0 | 1.6244 | 2032-06-10 / 272 d |
| asteroid-163693 (Atira, IEO) | S17 continuity; no practical window at tight Δ | 0.3222 | 0 | 7.1914 | 2027-05-13 / 182 d |
| asteroid-2017 UR52 | max eccentricity in pool (near-parabolic) | 0.9964 | 6 | 1462.95 | 2026-02-12 / 1802 d |
| asteroid-1979 XB | max condition code in pool | 0.7109 | **9** | 2.4063 | 2029-03-08 / 242 d |
| asteroid-99942 (Apophis) | lowest minC3 in pool (most accessible) | 0.1911 | 0 | 0.000206 | 2028-09-14 / 212 d |

## 4. Perturbation construction (Step 2)

At the nominal arrival state (r, v in heliocentric ICRF km / km/s, from `propagateKeplerianStateVectors`):
- **along-track** = v/|v| · **radial** = r/|r| (Sun→body) · **cross-track** = (r×v)/|r×v| (orbit normal)
- magnitudes 10³, 10⁴, 10⁵, 10⁶ km added to the arrival **position**; nominal velocity retained (limitation 3).
- Along-track magnitude ÷ arrival orbital speed = equivalent time shift (§6).

## 5. Sensitivity tables (per body: ΔC3 km²/s², Δ% of nominal C3, ΔvInf km/s)

**asteroid-433** (nominal C3 1.62443 km²/s², arr speed 30.932 km/s):

| dir | mag (km) | ΔC3 (km²/s²) | ΔC3 % | ΔvInfDep (km/s) | ΔvInfArr (km/s) |
|---|---|---|---|---|---|
| along | 1e3 | +1.579e-5 | 0.0010 | +6.195e-6 | +2.645e-5 |
| along | 1e4 | +1.582e-4 | 0.0097 | +6.206e-5 | +2.646e-4 |
| along | 1e5 | +1.608e-3 | 0.0990 | +6.307e-4 | +2.664e-3 |
| along | 1e6 | +1.870e-2 | 1.1512 | +7.315e-3 | +2.844e-2 |
| radial | 1e3 | +5.284e-5 | 0.0033 | +2.073e-5 | +5.041e-5 |
| radial | 1e4 | +5.296e-4 | 0.0326 | +2.077e-4 | +5.042e-4 |
| radial | 1e5 | +5.421e-3 | 0.3337 | +2.125e-3 | +5.052e-3 |
| radial | 1e6 | +6.667e-2 | 4.1043 | +2.589e-2 | +5.149e-2 |
| cross | 1e3 | −1.541e-4 | −0.0095 | −6.046e-5 | +1.232e-4 |
| cross | 1e4 | −1.536e-3 | −0.0946 | −6.028e-4 | +1.232e-3 |
| cross | 1e5 | −1.486e-2 | −0.9146 | −5.842e-3 | +1.232e-2 |
| cross | 1e6 | −9.832e-2 | −6.0523 | −3.917e-2 | +1.238e-1 |

**asteroid-163693** (nominal C3 7.19139, arr speed 34.928 km/s): along 1e5 → ΔC3 −1.235e-2 (−0.17%); radial 1e5 → −5.183e-2 (−0.72%); cross 1e5 → +1.488e-3 (+0.02%); at 1e6: −0.105 / −0.488 / +0.0905 (−1.46% / −6.79% / +1.26%). Full rows in the results JSON.

**asteroid-2017 UR52** (nominal C3 1462.95, arr speed 7.519 km/s): the least sensitive — at 1e5: ΔC3 +1.048e-2 / +1.958e-2 / +2.514e-2 (all ≤ 0.0017%); even 1e6 km moves C3 ≤ 0.0172%.

**asteroid-1979 XB** (nominal C3 2.40626, arr speed 39.099 km/s): at 1e5: +1.131e-2 (0.47%) / +6.206e-3 (0.26%) / +2.660e-2 (1.11%); at 1e6: +0.127 (5.28%) / +0.0952 (3.96%) / +0.3007 (12.50%).

**asteroid-99942 (Apophis)** (nominal C3 0.000206 km²/s² — near-zero, so PERCENTAGES are misleading; absolute values govern): at 1e5: ΔC3 +5.406e-5 (26.2%) / +4.813e-4 (233.2%) / +1.356e-3 (657.1%); at 1e6: +1.204e-3 / +2.055e-2 / +0.1340. Absolute deltas remain ≤ 0.134 km²/s² — still below this body's smallest neighbor-cell step (0.339, §7). The huge percentages are an artifact of the near-zero denominator.

## 6. Along-track perturbation as time shift (Step 2.2)

Equivalent time shift = magnitude ÷ arrival orbital speed. Against the grid's own quantization (7 d = 168 h departure, 30 d TOF):

| body | arr speed (km/s) | 1e3 km | 1e4 km | 1e5 km | 1e6 km |
|---|---|---|---|---|---|
| 433 | 30.932 | 0.01 h | 0.09 h | 0.90 h | 8.98 h |
| 163693 | 34.928 | 0.01 h | 0.08 h | 0.80 h | 7.95 h |
| 2017 UR52 | 7.519 | 0.04 h | 0.37 h | 3.69 h | 36.95 h |
| 1979 XB | 39.099 | 0.01 h | 0.07 h | 0.71 h | 7.10 h |
| 99942 | 28.406 | 0.01 h | 0.10 h | 0.98 h | 9.78 h |

Even a 10⁶ km along-track error is a ~7–37 h phase shift — a small fraction of one 168-h departure cell.

## 7. Grid-relative comparison and argmin stability (Step 4 — the decisive numbers)

Adjacent-cell C3 variation from each body's best cell (|ΔC3| to dep±7 d, TOF±30 d; units km²/s²):

| body | dep−7d | dep+7d | TOF−30d | TOF+30d | mean | min |
|---|---|---|---|---|---|---|
| 433 | 0.159 | 1.352 | 41.16 | 9.948 | 13.15 | 0.159 |
| 163693 | 14.69 | 4.967 | off-grid | 52.30 | 23.98 | 4.967 |
| 2017 UR52 | 4.498 | 19.76 | 11.45 | off-grid | 11.90 | 4.498 |
| 1979 XB | 5.952 | 11.43 | 112.2 | 558.0 | 171.9 | 5.952 |
| 99942 | 0.339 | 0.359 | 42.94 | 5.778 | 12.35 | 0.339 |

Ratio |ΔC3(perturbation)| / |ΔC3(one grid cell)| — at the 10⁵ km drift scale, worst direction per body:

| body | worst-direction |ΔC3| @1e5 km | ÷ mean neighbor | ÷ MIN neighbor |
|---|---|---|---|---|
| 433 | 1.486e-2 (cross) | 0.0011× | 0.094× |
| 163693 | 5.183e-2 (radial) | 0.0022× | 0.010× |
| 2017 UR52 | 2.514e-2 (cross) | 0.0021× | 0.0056× |
| 1979 XB | 2.660e-2 (cross) | 0.0002× | 0.0045× |
| 99942 | 1.356e-3 (cross) | 0.0001× | 0.0040× |

**Stated plainly: at the 10⁵ km drift scale, the C3 change from endpoint drift is 10×–250× SMALLER than the C3 change from moving one grid cell (vs the smallest neighbor), and 450×–10,000× smaller vs the mean neighbor.** Even at 10⁶ km the worst case (433 cross: 0.098 km²/s²) stays below its smallest neighbor step (0.159).

Argmin stability (does the optimal cell move? full-grid recompute with the perturbation applied in each cell's own local frame):

| body | @1e5 km (all 3 dirs) | @1e6 km |
|---|---|---|
| 433 | unchanged | unchanged (all dirs) |
| 163693 | unchanged | unchanged (all dirs) |
| 2017 UR52 | unchanged | unchanged (all dirs) |
| 1979 XB | unchanged | cross: **MOVED** (dep −35 d, TOF +30 d; new min C3 2.628 vs 2.406) |
| 99942 | unchanged | radial: **MOVED** (dep −28 d, TOF +30 d; 0.00431 vs 0.000206) · cross: **MOVED** (dep −91 d, TOF +90 d; 0.0495 vs 0.000206) |

**15/15 argmin unchanged at 10⁵ km; 3/15 moved at 10⁶ km** (worst-quality orbit 1979 XB and near-zero-C3 Apophis; the displaced minima remain within ~0.05 km²/s² of the originals).

Convergence: **zero solver failures** across all ~2.7M perturbed and baseline solves; revolution-branch changes are **N/A** (single-rev solver — see §1 pipeline finding).

## 8. Assumptions and everything not determinable

Assumptions: position-only perturbation (nominal velocity kept for vInfArr); the argmin test's systematic-error model (same local-frame direction at every cell); grid edges reported as "off-grid" where the best cell borders the TOF boundary; "drift scale" = 10⁵ km per the planet-floor measurement.

Not determinable from this measurement:
- Actual NEA drift magnitude and direction distribution (no NEA truth in the repo) — if real NEA model error reaches 10⁶–10⁷ km (plausible for encounter-perturbed bodies over a decade), the argmin instability seen at 10⁶ km becomes the operative regime; this measurement cannot say where real NEAs sit between the 10⁵ and 10⁶ regimes.
- Earth-endpoint sensitivity (deliberately out of scope).
- Sensitivity of the LIVE porkchop's numbers where `lambertMultiRev` selects among multi-rev branches — the single-rev cache path measured here cannot exhibit branch flips; whether drift-scale perturbation flips a multi-rev branch selection in the live worker is unmeasured.

## 9. Artifacts

- Script: `C:\Users\hudso\Documents\aster-slice18\c3-drift-sensitivity.mjs`
- Raw results: `C:\Users\hudso\Documents\aster-slice18\c3-drift-sensitivity-results.json`
- Out-of-repo build: `C:\Users\hudso\Documents\aster-slice18\build-v2c\`
- This file: `C:\Users\hudso\Documents\aster-slice18\C3_DRIFT_SENSITIVITY.md`

No file inside the repository was created or modified; no network call was made (every input is a committed repo file).
