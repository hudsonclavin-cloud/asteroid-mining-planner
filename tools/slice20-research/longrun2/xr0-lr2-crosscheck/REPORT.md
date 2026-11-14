# XR0 — independent cross-check of the LR2 symmetric-return measurement

**VERDICT: this VALIDATES LR2's primary column** on the 540 bodies compared.

State: COMPLETE. 540 bodies computed (3 gate, 498 first-500, 39 lr2-extreme); 540 joined to LR2's committed rows.

## What the verdict covers
- It covers LR2's PRIMARY column (the compare-path best practical window): the window found, the assumed burn, the refused-cell count, the computed minimum, the cell it sits on, and the error.
- It checks the pipeline: grid construction, locating the window's cell, the endpoint swap, the Earth lookup, the refusal rule, the minimum search and the subtraction. Two paths that share none of that code give the same numbers.
- It does not check what both sides share by definition: the production solver (LR1 compared it with poliastro), the propagator, `segmentWindows`, or the choice of a 723 x 100 return grid.
- It does not cover LR2's secondary (best-stack) column, which the dispatch did not ask XR0 to re-derive.
- Sample: 540 of 41,906 bodies, not random: the first 500 in catalog order (all of them numbered objects) plus LR2's most extreme rows, which are where a pipeline fault would most plausibly show.

## What is different about this path
- No file from `tools/slice20-research/longrun/` is imported or copied.
- Earth is read with the production linear-scan lookup. LR2 used its own bisection lookup.
- The outbound grid and the return grid are looped here cell by cell with direct calls to `lambertMultiRev`. LR2 ran `computeCompareData` for the outbound leg and the grid kernel `computePorkchopGrid` with swapped providers for the return leg; neither function is called here.
- A return cell arriving at Earth after the last Earth sample is skipped by an epoch test. LR2 fed the kernel a NaN position and returned null from an injected solver wrapper.
- Body order: the first 500 in catalog order plus every body in LR2's extremes tables. LR2 used a seeded shuffle in three shards.
- Shared on purpose, because they define the quantity: the production solver, propagator, Earth interpolation, `segmentWindows` and `departureDvFromVInf`; the compare page's grid; DEC-20-2's pairing window; LR2's 723 x 100 return grid.

## Gate: three known rows (S20_01 R3, min-C3 windows, M=0)
| Body | assumed here | S20_01 | computed here | S20_01 | reproduced |
| --- | ---: | ---: | ---: | ---: | --- |
| 433 | 6.9049 | 6.905 | 3.0337 | 3.034 | yes |
| 99942 | 5.8407 | 5.841 | 1.0916 | 1.092 | yes |
| 2000 SG344 | 1.3891 | 1.389 | 0.1476 | 0.148 | yes |

## Comparison with LR2's committed rows
LR2 committed its rows rounded to 6 decimals; XR0 values are rounded the same way (Math.round(x * 1e6) / 1e6) and compared for exact equality, field by field.

| Measure | Value |
| --- | ---: |
| Bodies compared | 540 |
| Agree on every field at the committed precision | 540 |
| Differ on at least one field | 0 |
| Bodies with an error value on both sides | 503 |
| max \|Δerror\| km/s (committed precision) | 0.000e+0 |
| median \|Δerror\| km/s (committed precision) | 0.000e+0 |

Status values on this side: ok 503; all-return-cells-refused 15; no-practical-window 22. Status is one of the compared fields.

### Beyond the committed precision (not committed evidence on the LR2 side)
LR2's full-precision working file was still in the first run's scratch on this host. Against it, for the 503 bodies with an error on both sides: **503 are bit-identical** in window, assumed, computed and error; max |Δerror| 0.000e+0 km/s, max |Δassumed| 0.000e+0, max |Δcomputed| 0.000e+0.

## Every disagreeing body
None.

## Files
- `crosscheck.mjs` — `run` (compute, resumable) and `report` (this file).
- `xr0-summary.json` — every number above; `xr0-rows.json` — both sides, per body.

