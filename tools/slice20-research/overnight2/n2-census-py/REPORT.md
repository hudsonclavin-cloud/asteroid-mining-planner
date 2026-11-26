# N2 report: independent ON4 headlines

## Method and validation

The sample is the first 2,000 bodies of the committed seeded order in `tools/slice20-research/overnight/on4-census/order.json`. The coarse grid is 50 departure samples by 25 TOF samples over 2026-01-01 through 2040-01-01, with TOF 182.5 through 1826.25 days and M=0/M=1. The independent code uses `muSun=132712440018` km^3/s^2, `muEarth=398600.43550702266` km^3/s^2, `rEI=6503.1366` km, and the `vEI <= 12 km/s` screen.

The independent Kepler/Hermite propagation was checked against 20 deterministic production-build samples. Maximum position difference was `0.000002636716156766587` km; maximum velocity difference was `5.903121699947708e-13` km/s. This is below the 1 km hold threshold.

## Headline comparison

| Headline | Run 1 | N2 | Wilson 95% interval, run 1 | Wilson 95% interval, N2 |
|---|---:|---:|---|---|
| Best selected cell fails screen | 1938/2000 = 0.969 | 1938/2000 = 0.969 | 0.9604592717918264 - 0.9757425378583581 | 0.9604592717918264 - 0.9757425378583581 |
| Zero shown cells pass screen | 157/2000 = 0.0785 | 157/2000 = 0.0785 | 0.06750431532799306 - 0.09111175553010317 | 0.06750431532799306 - 0.09111175553010317 |

Share deltas are exactly `0` percentage points for both headlines. The verdict is:

`ON4 REPRODUCED (shares within 0.1 pp, 1 of 2,000 bodies disagree)`.

## Body-level agreement

1,999 of 2,000 bodies agreed on selected cell, selected-cell screen verdict, and zero-passing verdict. One body disagreed:

`2021 WZ5` (`bodyIndex=1964`):

- Run 1 selected `depJd=2464067.562025231`, `TOF=593.4375 d`, M=1/right, `|v_inf_dep|=0.15115724731830243 km/s`, `|v_inf_arr|=2.1512441240502054 km/s`, `vEI=11.278962019489134 km/s`; shown 1081, shown+screen 170.
- N2 selected `depJd=2461771.9293721695`, `TOF=319.47916666666663 d`, M=0/single, `|v_inf_dep|=0.5332410107686619 km/s`, `|v_inf_arr|=2.305041409992549 km/s`, `vEI=11.309303641586352 km/s`; shown 1081, shown+screen 169.
- The selected screen verdict and zero-passing verdict still agree.

This one selected-cell disagreement is a local branch/grid numerical-selection difference and does not change either catalog headline share. It is recorded, not suppressed.

## What this does not show

This re-derivation supports the two ON4 headline shares for the same 2,000 bodies and grid. It does not validate the full 41,906-body census, establish a production-resolution result, or decide which selection objective is correct.
