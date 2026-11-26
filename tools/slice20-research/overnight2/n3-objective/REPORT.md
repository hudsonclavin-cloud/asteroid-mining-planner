# N3 report - selection objective

## Status

`COMPLETE: 41,906 of 41,906 bodies; 52,382,500 cells; no worker failures; 1 body with no shown objective.`

The production-path census counted 7,081,945 Earth-refused cells
(`0.1351967737316852`) and 1,593,817 Sun-refused branches. The one body with no
selected objective is retained in the body table; it is the same propagation
refusal recorded by ON4 (`2015 D1`, bodyIndex 7092).

## Objective results

| objective | selected | none | screen-pass share | M=0 share | M=1 share | median TOF (d) | departure spread (d) |
|---|---:|---:|---:|---:|---:|---:|---:|
| A: minimum departure `v_inf` | 41905 | 1 | 0.03710774370600167 | 0.4566519508411884 | 0.5433480491588116 | 867.3958333333334 | 5113 |
| B: A restricted to screen | 38798 | 3108 | 1 | 0.38040620650548995 | 0.61959379349451 | 593.4375 | 5113 |
| C: departure `v_inf` + control dV | 41905 | 1 | 0.13525832239589547 | 0.406180646700871 | 0.5938193532991289 | 867.3958333333334 | 5113 |
| D: minimum arrival `v_inf` | 41905 | 1 | 0.9258561030903234 | 0.414222646462236 | 0.585777353537764 | 593.4375 | 5113 |

Catalog comparisons:

- B exists for `38798/41906 = 0.9258340094497208` of bodies.
- For bodies where B exists, B minus A departure `v_inf` is 0 km/s minimum,
  `5.755591214742551` km/s median, `13.561295155948056` km/s p90, and
  `42.59504832998952` km/s maximum.
- C passes the screen for `0.13525832239589547` of its selected bodies.
- A and C select the same production candidate for `0.09633695263095096` of
  bodies with both objectives; A and B agree for `0.040079385535336874` of
  bodies where B exists.
- Every objective's selected departure spans the entire coarse launch range:
  JD `2461041.500800741` through `2466154.500800741` (2026-01-01 through
  2040-01-01 calendar labels), a 5,113-day spread.

## NHATS sanity check

The committed NHATS N1 sample contains 100 bodies that also occur in the
catalog. For each body's committed `min_dv_traj` return leg, a positive
`vrel_arr_earth` is counted as needing control. Natural NHATS return `v_inf` is
derived by adding that control amount to `v_inf_at_12` for controlled records;
uncontrolled records invert the recorded entry speed at `r_EI`.

| quantity | NHATS min-dV return | Aster objective A | Aster objective C |
|---|---:|---:|---:|
| sample size | 100 | 100 | 100 |
| needs control / fails screen | 0.39 needs control | 0.83 fails screen | 0.49 fails screen |
| median natural `|v_inf_arr|` (km/s) | 4.493491742974737 | 6.617298438416716 | 4.600246221909481 |

The NHATS design optimizes a total round-trip design under its own launch and
stay constraints, while A-D use this Aster coarse grid and a different
selection rule. The side-by-side numbers therefore describe different
populations/objectives; they do not decide which objective is right.

## What this does not show

This run prices four selection objectives on the same coarse production grid.
It does not establish a DEC, choose the product headline, validate the grid at
production resolution, or prove that the NHATS subset generalizes to all
41,906 bodies. The body tables preserve the per-objective values for later
review.
