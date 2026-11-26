# N4 report - paired-return census

## Status

`COMPLETE: 41,906 of 41,906 bodies; 41,905 outbound/paired grids; 1 recorded outbound propagation refusal.`

The one refused outbound body is `2015 D1` (`bodyIndex=7092`), with the
production propagation error `RangeError: aM must be > 0 for elliptical Kepler
propagation`. It is retained in the body table and counted as having no paired
shown cells.

## Catalog results

Each paired body has 1,000 unique return cells (40 departure samples x 25 TOF
samples), with both M=0 and M=1 evaluated inside each cell. Across the 41,905
paired grids:

- Total return cells: `41,905,000`.
- DEC-20-3 Earth-arrival refusals: `13,166,521`, or
  `0.3141992840949767` of paired cells.
- DEC-20-14 Sun-refused branches: `1,012,740`; non-converged/no-solution
  unique cells after Earth refusal: `100,224`.
- Shown cells: `28,638,255`; shown cells inside support:
  `22,846,400` (`0.7977581036274731` of shown cells).
- Zero shown paired cells: `3812/41906 = 0.09096549420130769`.
- Zero shown and screen-passing: `9065/41906 = 0.2163174724383143`.
- Zero shown and inside support: `0.26490240061089104`.

The DEC-20-3 condition matches the earlier 26.5% measurement: refuse a cell
when its Earth arrival is after the last fixture sample. The measured share is
different because the earlier run used a 723 x 100, M=0 grid and a different
outbound selection; this run uses 40 x 25 and both M families.

## Selected paired returns

There are 38,094 bodies with a selected A or C return; the remainder have no
shown paired cell. Results below are over those selected bodies.

| objective | screen-pass share | inside-support share | M=0 share | M=1 share | median total duration (d) | median crude v-inf sum (km/s) |
|---|---:|---:|---:|---:|---:|---:|
| A: minimum return departure `v_inf` | 0.04893159027668399 | 0.7957158607654748 | 0.540846327505644 | 0.45915367249435607 | 1704.0536858976507 | 3.1648461053331056 |
| C: return departure `v_inf` + entry control dV | 0.16530162230272483 | 0.7944295689609913 | 0.5569906021945713 | 0.4430093978054287 | 1672.6153846153368 | 5.202370835673167 |

A and C select the same return candidate for `0.13422061216989553` of bodies
with both picks. The median return `|v_inf_dep|` is
`1.2553893826967149` km/s for A and `3.267158774065467` km/s for C. The
median return `|v_inf_arr|` is `11.20839162831866` km/s for A and
`6.244216439922555` km/s for C.

The crude total is explicitly only the outbound `|v_inf_dep|` plus paired
return `|v_inf_dep|`; outbound C3 is also preserved per body, but is not added
to a speed quantity.

## By outbound arrival year

The year is the calendar label of the selected outbound arrival JD. Refused
share is among that year's paired cells; zero shares use all catalog bodies in
the year bucket.

| arrival year | bodies | refused share | zero shown | zero shown+screen |
|---:|---:|---:|---:|---:|
| 2026 | 447 | 0 | 0 | 0.07158836689038031 |
| 2027 | 1549 | 0 | 0 | 0.10329244673983215 |
| 2028 | 3101 | 0 | 0 | 0.09190583682683005 |
| 2029 | 2967 | 0 | 0 | 0.08459723626558814 |
| 2030 | 2888 | 0 | 0 | 0.09349030470914127 |
| 2031 | 2741 | 0 | 0 | 0.10069317767238234 |
| 2032 | 2946 | 0 | 0 | 0.10183299389002037 |
| 2033 | 2904 | 0.00004855371900826446 | 0 | 0.09022038567493113 |
| 2034 | 2842 | 0.02507107670654469 | 0 | 0.09359605911330049 |
| 2035 | 2653 | 0.13895401432340745 | 0 | 0.09498680738786279 |
| 2036 | 3057 | 0.3378233562315996 | 0 | 0.10336931632319267 |
| 2037 | 2797 | 0.5580933142652842 | 0 | 0.09974973185555953 |
| 2038 | 2950 | 0.7706349152542373 | 0 | 0.1528813559322034 |
| 2039 | 2839 | 0.9322057062345896 | 0 | 0.3430785487847834 |
| 2040 | 2888 | 0.9961443905817174 | 0.5107340720221607 | 0.8150969529085873 |
| 2041 | 2070 | 1 | 1 | 1 |
| 2042 | 245 | 1 | 1 | 1 |
| 2043 | 10 | 1 | 1 | 1 |
| 2044 | 11 | 1 | 1 | 1 |

## What this does not show

This run measures paired-grid availability and prices objectives A and C on a
coarse grid. It does not establish a DEC, decide the joint objective, validate
a production-resolution grid, or show that screen-passing means atmospheric
entry, capture, heating, landing, or recovery feasibility.
