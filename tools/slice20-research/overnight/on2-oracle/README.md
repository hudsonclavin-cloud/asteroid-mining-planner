# ON2 — Return-leg oracle at M = 0, 1, 2

## Method and production mapping

This is a new harness under `on2-oracle/`; it imports no code from `longrun/`, `longrun2/`, or `nhats/`. `build-return-cells.mjs` uses the production compiled Keplerian propagator, the Earth fixture plus production Hermite interpolation, and the production Sun GM `132712440018` km^3/s^2. For a return, `r1` is the asteroid at departure and `r2` is Earth at arrival. The Lambert call is the same production call shape shown in `src/v2/porkchop/grid-compute.ts:175-194`: `(r1, r2, tofSeconds, MU_SUN_KM3_S2, M, true)`.

The Aster branch mapping was fixed from source before comparison. `src/v2/core/lambert/lambert-multi-rev.ts:96-106` clamps the negative-x initial guess for `left` and the positive-x initial guess for `right`; `:276-335` solves both branches for M >= 1. Poliastro's `izzo.lambert` mapping in `oracle_driver.py:121-125` therefore uses Aster left → `low_path=False` and Aster right → `low_path=True`. This is a code-derived mapping, not a fit from the results.

The sample is LR1's 40 bodies plus 60 seeded additions and every remaining L0 body, for 100 bodies total. The grid is 40 departures across 2026-01-01..2040-01-01 TDB by 40 TOF samples across 182.5..1826.25 days. Earth arrivals after the fixture's 2040-12-31 endpoint are recorded as `refused_earth`; the nonpositive-a propagation case is recorded separately as `asteroid_propagation_refused`. `oracle_driver.py` compares Aster and poliastro vectors, and runs poliastro Vallado for M=0 at default and LR1-tight settings.

Closure is independent of both Lambert solvers: the Python driver propagates `(r1, Aster v1)` with a universal-variable Stumpff formulation, first testing a circular orbit and the LR1 cell `433|0|24|M0|single`. It records miss distance, relative specific-energy difference, and relative angular-momentum difference. Through-Sun branches are flagged when perihelion is below 695,700 km and the propagated arc passes perihelion.

## Results

- 480,000 cells were generated. `refusedEarth=64,449`, `asteroidPropagationRefused=4,800`, and the Aster converged branch counts were M0 `136,917`, M1 `173,250`, M2 `111,404`.
- Existence disagreements were zero for every M and branch. M0 had 136,917 `both`; M1 had 86,625 `both` and 50,292 `neither` per branch; M2 had 55,702 `both` and 81,215 `neither` per branch.
- Maximum `|dv_inf_arr|` between Aster and izzo was M0 `2.0164021072024496e-12`, M1 `2.016414626268222e-12`, and M2 `2.015391718802059e-12` km/s.
- Vallado M0 maximum `|dv_inf_arr|` was `6.018206580500975e-7` km/s at defaults and `9.531501341892306e-9` km/s with LR1-tight settings.
- Universal-variable closure covered 295,291 branches. For M2 with perihelion >= 0.1 AU, the maximum miss was `0.00009181310883287565` km and the p95 was `0.000007240281631917516` km. The M2 through-Sun share was `0.028588519727823336`.
- LR1 re-derivation: M0 had 6,000 records and M1 had 8,124; Aster was bit-identical for 5,920 and 8,050 respectively. The new path's max Aster vector differences were `1.4210854715202004e-14` km/s (M0) and `5.684341886080802e-14` km/s (M1). The max izzo differences were `1.4495071809506044e-12` and `1.5170087408478139e-12` km/s. Verdict: **LR1 DIFFERS** because the recorded izzo maxima exceed the requested `1e-12` comparison line, despite the Aster side being effectively identical.

Exact per-cell derived values are in `summary.json` and the 24 independently gzip-compressed dataset parts. To reconstruct the JSONL dataset, decompress `dataset.part1of24.jsonl.gz` through `dataset.part24of24.jsonl.gz` in order and concatenate the resulting byte streams.

## REPORT section text

ON2 M=2: cells **480000**; existence disagreements **0**; max `|dv_inf_arr|` izzo M0/M1/M2 **2.0164021072024496e-12 / 2.016414626268222e-12 / 2.015391718802059e-12 km/s**; Vallado M0 **6.018206580500975e-7 km/s default, 9.531501341892306e-9 km/s tight**; closure max (>=0.1 AU) **0.00014576278753497868 km (M0; M2 was 0.00009181310883287565 km)**; LR1 **DIFFERS**. The M=2 solver comparison had no existence disagreements; the LR1 verdict is kept as a measured result because the re-derived izzo maximum exceeded `1e-12` km/s.
