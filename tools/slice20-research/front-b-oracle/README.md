# Slice 20 Front B oracle

This W6 result was generated from committed W5 `f24c024` (`feat(k1): worker carries return-leg vectors with an explicit direction (DEC-20-10)`). The production modules were compiled into `C:\Users\hudso\s20-front-b-store\build-w5` with:

```text
node tools/slice20-research/overnight/lib/build.mjs C:\Users\hudso\aster-front-b C:\Users\hudso\s20-front-b-store\build-w5
```

Host and tool versions measured during the run: Windows laptop, Node `v26.7.0`, Python `3.12.10`, poliastro `0.17.0`, numpy `1.26.4`, astropy `5.3.4`, scipy `1.17.1`, and numba `0.66.0`. The independent Python driver is the copied ON2 driver in `tools/slice20-research/overnight/on2-oracle/oracle_driver.py`; no network was used.

## Sample and mapping

The sample is the run-1 ON2 body population: 100 bodies and a 40 x 40 return grid, with M = 0, 1, and 2. This produced 480,000 cells: 64,449 Earth-span refusals, 4,800 asteroid-propagation refusals, and 136,917 / 173,250 / 111,404 converged Aster branches for M0 / M1 / M2.

The mapping was re-verified from `src/v2/core/lambert/lambert-multi-rev.ts`: Aster `left` maps to izzo `low_path=False`, and Aster `right` maps to izzo `low_path=True`. The positive control reproduced the three run-1 cells bit-identically on the Aster side.

## Results

The izzo comparison had zero existence disagreements. Maximum Earth-arrival excess-velocity differences were:

| family | max |dv_inf_E| km/s | p95 |dv_inf_E| km/s | median |dv_inf_E| km/s |
|---|---:|---:|---:|
| M0 single | 2.0164021072024496e-12 | 1.0204393146541e-14 | 3.5527136788005e-15 |
| M1 left | 2.01640523697618e-12 | 1.00485917355762e-14 | 3.5527136788005e-15 |
| M1 right | 2.01641462626822e-12 | 1.06581410364015e-14 | 3.5527136788005e-15 |
| M2 left | 2.01539171880206e-12 | 1.00485917355762e-14 | 3.5527136788005e-15 |
| M2 right | 2.01437925714452e-12 | 1.0204393146541e-14 | 3.5527136788005e-15 |

The proposed izzo pass line is met: 0 existence disagreements and maximum `|dv_inf_E| = 2.01641462626822e-12 km/s <= 1e-9 km/s`.

The maximum/p95/median vector differences for every family are in `summary.json` under `vectorStats` for `dv1`, `dv2`, and `dvInfArr` (the latter is `|dv_inf_E|`).

Vallado M0 comparison had 136,494 default converged cells with maximum `|dv_inf_E| = 6.018206580500975e-7 km/s`, and 136,692 tight converged cells (`numiter=200`, `rtol=1e-12`) with maximum `9.531501341892306e-9 km/s`.

Independent universal-variable closure covered 295,291 branches. For transfer perihelion at least 0.1 AU, the maximum miss was `0.00014576278753497868 km` and the p95 was `0.000011760145116299347 km`, below the `1e-3 km` line. For lower-perihelion branches, the maximum relative specific-energy difference was `2.2842412777648434e-13` and the maximum relative angular-momentum difference was `9.273875119832752e-14`; W2 through-Sun branches are counted separately in `summary.json`.

## NHATS raw-data cross-check

`nhats-summary.json` uses only the committed raw NHATS responses and the saved `n2-agreement/horizons-states.json`. It follows the existing NHATS harness endpoint pipeline: calendar dates are 0h TDB; outbound is Earth at launch to the asteroid at arrival; return is the asteroid at departure to Earth at return. The return leg is fed to the production `computeReturnPorkchopGrid` at M = 0 with those same endpoint states. Earth-return `v_inf` is inverted from the published entry speed only for uncontrolled trajectories. Model-B control uses the harness-defined `mu_E = 398600.43550702266 km^3/s^2`, `R_E = 6378.1366 km`, and 125 km altitude.

Three uncontrolled and three controlled trajectories all matched the NHATS printed precision. The six selected rows and per-quantity differences are recorded in `nhats-summary.json`; the result is `pass: true`. The controlled model-B dV values were `0.1890093331531677`, `0.3301164483987167`, and `0.13916990501828685 km/s`, with maximum printed-value residual `0.00016990501828684224 km/s`.

## Files

- `summary.json`: compact four-lens oracle summary and full statistics.
- `nhats-summary.json`: six-row NHATS raw-data end-to-end check.
- `dataset.part1of24.jsonl.gz` through `dataset.part24of24.jsonl.gz`: 410,751 compact per-cell records; every compressed part is below 10 MB.
- `split-dataset.mjs`, `stamp-w6-input.mjs`, and `nhats-w6.mjs`: reproducibility helpers used for the recorded outputs.
