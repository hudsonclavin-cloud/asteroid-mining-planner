# LR1 — K1 return-leg oracle dataset (LEADS-grade, not a validation)

Run: CLOUD container (Linux, node v22.23.4), not the laptop the dispatch names; tripwire (a) waived by Hudson in-session 2026-11-14.
Repo HEAD 0d31cda3d1dca81d29f45092be26b94bb44294c1 (origin/main). Oracle: poliastro 0.17.0, numpy 1.26.4, astropy 5.3.4, scipy 1.17.1, numba 0.68.1, python 3.12.3.
**No pass/fail threshold is set in this run. The numbers below are stated, not judged.** The Slice 11 precedent (3.35e-14) is context, not a gate.

## What ran
- Bodies: 40 (tier counts {"L0":4,"L1":18,"L2":18}; seed 20261113). Required bodies present: 433, 99942, 101955, 2000 SG344, 2008 HU4, 1998 KY26.
- Return grid: 731 asteroid-departure dates 2026-01-01..2040-01-01 x 100 TOF 182.5-1826.25 d (73100 cells).
- Refused by DEC-20-3 (Earth arrival after the fixture end 2040-12-31 TDB, JD 2466519.5): **9329** of 73100 cells; admissible 63771. The count is body-independent (grid geometry only).
- Sampled: 150 admissible cells per body, M = 0, 1; converged branches compared: **14124** (M=0 single: 6000; M=1 left: 4062; M=1 right: 4062).
- Kernel check: converged branches where |recomputed v-infinity vector| differs from the kernel's own magnitude (exact float compare): 0.
- Sampling notes: seeded draw 2015 D1 (L0): skipped, not propagatable (non-positive-semi-major-axis).

## (a) Implementation agreement — poliastro izzo.lambert, full vectors
| Group | n | max \|Δv∞,E\| km/s | RMS \|Δv∞,E\| km/s | max \|Δv∞,ast-dep\| km/s | RMS \|Δv∞,ast-dep\| km/s | max \|Δv2\|/\|v2\| |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| M=0 single | 6000 | 1.614e-12 | 2.666e-14 | 1.493e-12 | 2.182e-14 | 4.659e-14 |
| M=1 left | 4062 | 1.420e-12 | 2.750e-14 | 1.292e-12 | 2.354e-14 | 4.684e-14 |
| M=1 right | 4062 | 1.521e-12 | 3.696e-14 | 1.395e-12 | 2.719e-14 | 4.697e-14 |
| all | 14124 | 1.614e-12 | 3.020e-14 | 1.493e-12 | 2.396e-14 | 4.697e-14 |

izzo errors (poliastro raised): 0.
Branch mapping was fixed a priori (right <-> lowpath=True, left <-> lowpath=False). Diagnostic, Aster branch against the OTHER lowpath value:
- M=1 left: n 4062, min 9.371e-2, median 3.167e+1, max 7.180e+1 km/s (other-path solver errors: 0).
- M=1 right: n 4062, min 9.371e-2, median 3.167e+1, max 7.180e+1 km/s (other-path solver errors: 0).

## (b) Formulation independence, M = 0 — poliastro vallado.lambert (universal variables)
| Setting | n solved | errors | max \|Δv∞,E\| km/s | RMS \|Δv∞,E\| km/s | max \|Δv∞,ast-dep\| km/s | RMS \|Δv∞,ast-dep\| km/s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| valladoDefault (numiter 35, rtol 1e-8) | 5994 | 6 | 3.420e-7 | 4.834e-8 | 3.764e-7 | 5.409e-8 |
| valladoTight (numiter 200, rtol 1e-12) | 5986 | 14 | 1.875e-10 | 6.720e-12 | 1.932e-10 | 7.217e-12 |

Short-way / long-way cells among M=0: 2995 / 3005 (the vallado flag is derived from (r1 x r2).z, see oracle_driver.py).

## (c) Endpoint closure — Aster's departure state propagated two-body for the TOF
| Group | n | farnocchia max miss km | farnocchia RMS miss km | cowell (rtol 1e-13) max miss km | cowell RMS miss km | max \|ΔE\|/\|E\| | max \|Δh\|/\|h\| |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| M=0 single | 6000 | 1.399e+0 | 1.820e-2 | 2.624e-2 | 7.103e-4 | 4.494e-13 | 1.382e-14 |
| M=1 left | 4062 | 1.241e-1 | 2.665e-3 | 3.249e+1 | 5.201e-1 | 4.180e-15 | 3.263e-14 |
| M=1 right | 4062 | 3.209e-2 | 8.952e-4 | 9.497e+0 | 1.922e-1 | 1.018e-14 | 1.107e-14 |
| all | 14124 | 1.399e+0 | 1.196e-2 | 3.249e+1 | 2.974e-1 | 4.494e-13 | 3.263e-14 |

Propagator errors: farnocchia 0, cowell 0.

### Closure by transfer-orbit perihelion (descriptive strata, not a gate)
The largest misses sit on cells whose Lambert transfer orbit is near-rectilinear: eccentricity ~0.99999 and a perihelion inside the Sun. On those cells the two poliastro propagators land far from EACH OTHER, so the miss there measures the propagators, not Aster. `propagator disagreement` = |r_farnocchia - r_cowell|.
Whether the flown arc reaches that perihelion is computed per cell from (r1, v1, TOF): an M=0 out-and-back arc usually does not; an arc that does pass it goes inside the Sun and is not flyable.
| Transfer perihelion q | cells (M0 / M1 left / M1 right) | bodies | farnocchia max / median miss km | cowell max / median miss km | propagator disagreement max / median km | izzo max \|Δv∞,E\| km/s | max \|ΔE\|/\|E\| | max e | min q km |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| q < 1 solar radius AND the flown arc passes perihelion (arc goes inside the Sun) | 219 (17 / 107 / 95) | 39 | 1.241e-1 / 4.760e-4 | 3.249e+1 / 7.038e-2 | 3.237e+1 / 6.982e-2 | 1.466e-12 | 5.596e-15 | 1.00309960 | 1056 |
| q < 1 solar radius, flown arc does not reach perihelion (out-and-back arc) | 140 (140 / 0 / 0) | 38 | 1.399e+0 / 5.510e-4 | 3.416e-3 / 4.648e-4 | 1.399e+0 / 8.042e-4 | 4.729e-13 | 4.392e-15 | 0.99999810 | 782 |
| 1 solar radius <= q < 0.1 AU | 2169 (865 / 638 / 666) | 40 | 1.745e-3 / 2.032e-5 | 3.012e-1 / 1.262e-3 | 3.003e-1 / 1.249e-3 | 4.055e-13 | 1.018e-14 | 1.01465391 | 696024 |
| q >= 0.1 AU | 11596 (4978 / 3317 / 3301) | 40 | 1.055e-4 / 2.287e-6 | 1.849e-2 / 3.754e-4 | 1.851e-2 / 3.749e-4 | 1.614e-12 | 4.494e-13 | 1.64570314 | 14982546 |

Constants for the strata: AU 149597870.7 km, nominal solar radius 695700 km.
Read against the kernel: grid-compute.ts and lambert-multi-rev.ts contain no check on the transfer orbit's perihelion, so the 219 sampled branches in the first row (1.55% of 14124) are reported as converged although the arc passes inside the Sun. 77 of them are the branch the kernel selects for its cell; the smallest asteroid-departure |v∞| among them is 9.307 km/s.

## Outliers and errors (every one listed, or the first 25 with the total)
Rule: a cell is listed when its value exceeds 100 x the metric's median in its group. This is a reading aid, not a threshold.
- (a) izzo |Δv∞,E|, M=0 single: median 3.972e-15, p99 5.222e-14, max 1.614e-12; 2 cell(s) above the rule.
  - `2020 WG5|453|28|M0|single` value 1.614e-12 (dep 2034-09-08, TOF 647.40 d, x -0.599398, |v∞,E| 41.7627 km/s, transfer e 0.6004606, q 6.48e-1 AU)
  - `2024 XA1|230|80|M0|single` value 4.729e-13 (dep 2030-05-30, TOF 1510.78 d, x -0.737845, |v∞,E| 47.6271 km/s, transfer e 0.9999981, q 5.23e-6 AU)
- (a) izzo |Δv∞,E|, M=1 left: median 3.972e-15, p99 5.629e-14, max 1.420e-12; 2 cell(s) above the rule.
  - `2020 WG5|453|28|M1|left` value 1.420e-12 (dep 2034-09-08, TOF 647.40 d, x -0.164482, |v∞,E| 38.1649 km/s, transfer e 0.1672097, q 8.90e-1 AU)
  - `2024 XA1|230|80|M1|left` value 5.540e-13 (dep 2030-05-30, TOF 1510.78 d, x -0.532231, |v∞,E| 45.6451 km/s, transfer e 0.9999960, q 7.06e-6 AU)
- (a) izzo |Δv∞,E|, M=1 right: median 3.972e-15, p99 5.424e-14, max 1.521e-12; 3 cell(s) above the rule.
  - `2020 WG5|453|28|M1|right` value 1.521e-12 (dep 2034-09-08, TOF 647.40 d, x 0.426479, |v∞,E| 39.7876 km/s, transfer e 0.4259882, q 7.30e-1 AU)
  - `2024 XA1|230|80|M1|right` value 1.466e-12 (dep 2030-05-30, TOF 1510.78 d, x 0.699737, |v∞,E| 47.1006 km/s, transfer e 0.9999798, q 4.96e-5 AU)
  - `2000 SG344|503|60|M1|right` value 4.055e-13 (dep 2035-08-25, TOF 1178.71 d, x 0.879105, |v∞,E| 39.5434 km/s, transfer e 0.9591851, q 8.90e-2 AU)
- (a) izzo |Δv∞,ast-dep|, M=0 single: median 3.553e-15, p99 3.223e-14, max 1.493e-12; 1 cell(s) above the rule.
  - `2020 WG5|453|28|M0|single` value 1.493e-12 (dep 2034-09-08, TOF 647.40 d, x -0.599398, |v∞,E| 41.7627 km/s, transfer e 0.6004606, q 6.48e-1 AU)
- (a) izzo |Δv∞,ast-dep|, M=1 left: median 3.662e-15, p99 3.646e-14, max 1.292e-12; 1 cell(s) above the rule.
  - `2020 WG5|453|28|M1|left` value 1.292e-12 (dep 2034-09-08, TOF 647.40 d, x -0.164482, |v∞,E| 38.1649 km/s, transfer e 0.1672097, q 8.90e-1 AU)
- (a) izzo |Δv∞,ast-dep|, M=1 right: median 3.662e-15, p99 4.204e-14, max 1.395e-12; 3 cell(s) above the rule.
  - `2020 WG5|453|28|M1|right` value 1.395e-12 (dep 2034-09-08, TOF 647.40 d, x 0.426479, |v∞,E| 39.7876 km/s, transfer e 0.4259882, q 7.30e-1 AU)
  - `2024 XA1|230|80|M1|right` value 5.926e-13 (dep 2030-05-30, TOF 1510.78 d, x 0.699737, |v∞,E| 47.1006 km/s, transfer e 0.9999798, q 4.96e-5 AU)
  - `2000 SG344|503|60|M1|right` value 4.238e-13 (dep 2035-08-25, TOF 1178.71 d, x 0.879105, |v∞,E| 39.5434 km/s, transfer e 0.9591851, q 8.90e-2 AU)
- (c) farnocchia miss, M=0 single: median 3.041e-6, p99 9.392e-4, max 1.399e+0; 145 cell(s) above the rule.
  - `2024 XA1|230|80|M0|single` value 1.399e+0 (dep 2030-05-30, TOF 1510.78 d, x -0.737845, |v∞,E| 47.6271 km/s, transfer e 0.9999981, q 5.23e-6 AU)
  - `2008 HU4|237|68|M0|single` value 1.615e-1 (dep 2030-07-18, TOF 1311.54 d, x -0.886109, |v∞,E| 48.6268 km/s, transfer e 0.9999840, q 3.87e-5 AU)
  - `2000 SG344|503|60|M0|single` value 4.284e-2 (dep 2035-08-25, TOF 1178.71 d, x -0.883184, |v∞,E| 47.5825 km/s, transfer e 0.9999872, q 2.89e-5 AU)
  - `2018 LA|276|57|M0|single` value 1.184e-2 (dep 2031-04-18, TOF 1128.90 d, x -0.862162, |v∞,E| 47.0276 km/s, transfer e 0.9999156, q 1.86e-4 AU)
  - `2000 SG344|136|99|M0|single` value 1.100e-2 (dep 2028-08-10, TOF 1826.25 d, x -0.905881, |v∞,E| 47.2607 km/s, transfer e 0.9997911, q 6.24e-4 AU)
  - `2010 UA7|253|88|M0|single` value 8.973e-3 (dep 2030-11-08, TOF 1643.61 d, x -0.644988, |v∞,E| 48.2795 km/s, transfer e 0.9999344, q 1.97e-4 AU)
  - `2022 FZ3|465|51|M0|single` value 6.110e-3 (dep 2034-12-01, TOF 1029.28 d, x -0.809699, |v∞,E| 46.5659 km/s, transfer e 0.9999497, q 1.06e-4 AU)
  - `1998 KY26|143|32|M0|single` value 6.027e-3 (dep 2028-09-28, TOF 713.81 d, x -0.823099, |v∞,E| 45.0069 km/s, transfer e 0.9997705, q 3.80e-4 AU)
  - `2020 VY4|33|64|M0|single` value 5.568e-3 (dep 2026-08-20, TOF 1245.13 d, x -0.885345, |v∞,E| 48.0198 km/s, transfer e 0.9996869, q 7.30e-4 AU)
  - `2019 UU4|405|67|M0|single` value 5.402e-3 (dep 2033-10-07, TOF 1294.94 d, x -0.833095, |v∞,E| 47.9765 km/s, transfer e 0.9998724, q 3.10e-4 AU)
  - `2018 LA|508|65|M0|single` value 4.980e-3 (dep 2035-09-29, TOF 1261.73 d, x -0.783229, |v∞,E| 48.1525 km/s, transfer e 0.9996684, q 8.01e-4 AU)
  - `2019 NC|19|24|M0|single` value 4.745e-3 (dep 2026-05-14, TOF 580.98 d, x 0.082126, |v∞,E| 47.9988 km/s, transfer e 0.9999227, q 1.74e-4 AU)
  - `99942|426|94|M0|single` value 4.216e-3 (dep 2034-03-03, TOF 1743.23 d, x -0.906911, |v∞,E| 47.9544 km/s, transfer e 0.9995077, q 1.42e-3 AU)
  - `99942|432|94|M0|single` value 3.897e-3 (dep 2034-04-14, TOF 1743.23 d, x -0.899008, |v∞,E| 47.9483 km/s, transfer e 0.9990858, q 2.65e-3 AU)
  - `2022 WJ1|445|75|M0|single` value 3.186e-3 (dep 2034-07-14, TOF 1427.77 d, x -0.692475, |v∞,E| 47.5908 km/s, transfer e 0.9999381, q 1.67e-4 AU)
  - `2019 LB|174|93|M0|single` value 3.120e-3 (dep 2029-05-03, TOF 1726.63 d, x -0.872030, |v∞,E| 48.7385 km/s, transfer e 0.9994292, q 1.65e-3 AU)
  - `2008 HU4|591|32|M0|single` value 3.095e-3 (dep 2037-05-02, TOF 713.81 d, x -0.825714, |v∞,E| 45.6402 km/s, transfer e 0.9995932, q 6.72e-4 AU)
  - `2024 UK5|239|31|M0|single` value 2.550e-3 (dep 2030-08-01, TOF 697.21 d, x -0.826703, |v∞,E| 44.7534 km/s, transfer e 0.9996718, q 5.31e-4 AU)
  - `1998 KY26|323|54|M0|single` value 2.468e-3 (dep 2032-03-12, TOF 1079.09 d, x -0.817762, |v∞,E| 46.9812 km/s, transfer e 0.9991226, q 1.90e-3 AU)
  - `2010 UA7|53|84|M0|single` value 2.316e-3 (dep 2027-01-07, TOF 1577.20 d, x -0.631061, |v∞,E| 47.7572 km/s, transfer e 0.9996181, q 1.12e-3 AU)
  - `101955|143|85|M0|single` value 2.287e-3 (dep 2028-09-28, TOF 1593.80 d, x -0.899788, |v∞,E| 48.6712 km/s, transfer e 0.9997603, q 6.55e-4 AU)
  - `2012 XE133|124|91|M0|single` value 2.254e-3 (dep 2028-05-18, TOF 1693.42 d, x -0.902219, |v∞,E| 48.0823 km/s, transfer e 0.9994877, q 1.46e-3 AU)
  - `2019 AV6|86|30|M0|single` value 2.233e-3 (dep 2027-08-26, TOF 680.61 d, x -0.760876, |v∞,E| 45.2648 km/s, transfer e 0.9998761, q 2.03e-4 AU)
  - `2022 WJ1|687|14|M0|single` value 2.136e-3 (dep 2039-03-05, TOF 414.95 d, x -0.520544, |v∞,E| 44.5061 km/s, transfer e 0.9999309, q 9.05e-5 AU)
  - `2023 CK1|15|95|M0|single` value 2.076e-3 (dep 2026-04-16, TOF 1759.84 d, x -0.897728, |v∞,E| 47.7067 km/s, transfer e 0.9987503, q 3.65e-3 AU)
  - ... 120 more in lr1-summary.json / the dataset
- (c) farnocchia miss, M=1 left: median 2.518e-6, p99 5.235e-4, max 1.241e-1; 75 cell(s) above the rule.
  - `2024 XA1|230|80|M1|left` value 1.241e-1 (dep 2030-05-30, TOF 1510.78 d, x -0.532231, |v∞,E| 45.6451 km/s, transfer e 0.9999960, q 7.06e-6 AU)
  - `2008 HU4|237|68|M1|left` value 9.515e-2 (dep 2030-07-18, TOF 1311.54 d, x -0.812087, |v∞,E| 46.3423 km/s, transfer e 0.9999700, q 4.58e-5 AU)
  - `2000 SG344|503|60|M1|left` value 6.377e-2 (dep 2035-08-25, TOF 1178.71 d, x -0.807038, |v∞,E| 45.1085 km/s, transfer e 0.9999758, q 3.44e-5 AU)
  - `2010 UA7|343|85|M1|left` value 1.081e-2 (dep 2032-07-30, TOF 1593.80 d, x -0.798819, |v∞,E| 46.5425 km/s, transfer e 0.9998554, q 2.51e-4 AU)
  - `2022 FZ3|465|51|M1|left` value 6.111e-3 (dep 2034-12-01, TOF 1029.28 d, x -0.674977, |v∞,E| 43.8517 km/s, transfer e 0.9998959, q 1.38e-4 AU)
  - `2022 WJ1|445|75|M1|left` value 5.888e-3 (dep 2034-07-14, TOF 1427.77 d, x -0.431512, |v∞,E| 45.5302 km/s, transfer e 0.9998610, q 2.39e-4 AU)
  - `2019 UU4|405|67|M1|left` value 4.908e-3 (dep 2033-10-07, TOF 1294.94 d, x -0.718126, |v∞,E| 45.6621 km/s, transfer e 0.9997479, q 3.86e-4 AU)
  - `2010 UA7|253|88|M1|left` value 4.771e-3 (dep 2030-11-08, TOF 1643.61 d, x -0.310624, |v∞,E| 46.4764 km/s, transfer e 0.9998477, q 2.96e-4 AU)
  - `2019 UU4|286|40|M1|left` value 3.046e-3 (dep 2031-06-27, TOF 846.64 d, x -0.731298, |v∞,E| 43.0566 km/s, transfer e 0.9998193, q 2.10e-4 AU)
  - `2024 UK5|418|14|M1|left` value 2.855e-3 (dep 2034-01-06, TOF 414.95 d, x -0.574570, |v∞,E| 39.0075 km/s, transfer e 0.9998649, q 9.98e-5 AU)
  - `2005 YO128|9|97|M1|left` value 2.657e-3 (dep 2026-03-05, TOF 1793.04 d, x -0.852745, |v∞,E| 47.2840 km/s, transfer e 0.9992918, q 1.31e-3 AU)
  - `99248|331|82|M1|left` value 2.457e-3 (dep 2032-05-07, TOF 1543.99 d, x -0.825912, |v∞,E| 44.6610 km/s, transfer e 0.9992973, q 1.19e-3 AU)
  - `99942|26|48|M1|left` value 2.332e-3 (dep 2026-07-02, TOF 979.47 d, x -0.754326, |v∞,E| 44.6876 km/s, transfer e 0.9998163, q 2.34e-4 AU)
  - `2025 BZ2|592|38|M1|left` value 1.994e-3 (dep 2037-05-09, TOF 813.43 d, x -0.443211, |v∞,E| 42.6997 km/s, transfer e 0.9998186, q 2.17e-4 AU)
  - `2022 FZ3|178|69|M1|left` value 1.969e-3 (dep 2029-05-31, TOF 1328.14 d, x -0.814052, |v∞,E| 45.8260 km/s, transfer e 0.9985086, q 2.28e-3 AU)
  - `2008 QU3|18|37|M1|left` value 1.730e-3 (dep 2026-05-07, TOF 796.83 d, x -0.733935, |v∞,E| 42.0857 km/s, transfer e 0.9994234, q 6.40e-4 AU)
  - `2000 SG344|136|99|M1|left` value 1.722e-3 (dep 2028-08-10, TOF 1826.25 d, x -0.845859, |v∞,E| 45.3521 km/s, transfer e 0.9996229, q 7.10e-4 AU)
  - `2018 LA|276|57|M1|left` value 1.615e-3 (dep 2031-04-18, TOF 1128.90 d, x -0.770343, |v∞,E| 44.3950 km/s, transfer e 0.9998357, q 2.29e-4 AU)
  - `99942|432|94|M1|left` value 1.506e-3 (dep 2034-04-14, TOF 1743.23 d, x -0.834159, |v∞,E| 45.9377 km/s, transfer e 0.9983448, q 3.03e-3 AU)
  - `2020 VY4|33|64|M1|left` value 1.498e-3 (dep 2026-08-20, TOF 1245.13 d, x -0.810745, |v∞,E| 45.5960 km/s, transfer e 0.9994163, q 8.58e-4 AU)
  - `810074|472|59|M1|left` value 1.466e-3 (dep 2035-01-19, TOF 1162.11 d, x -0.384695, |v∞,E| 44.6334 km/s, transfer e 0.9993291, q 9.86e-4 AU)
  - `2010 UA7|13|99|M1|left` value 1.202e-3 (dep 2026-04-02, TOF 1826.25 d, x -0.496899, |v∞,E| 46.0304 km/s, transfer e 0.9984273, q 3.14e-3 AU)
  - `2024 UK5|550|85|M1|left` value 1.197e-3 (dep 2036-07-19, TOF 1593.80 d, x -0.835257, |v∞,E| 45.3889 km/s, transfer e 0.9988113, q 2.05e-3 AU)
  - `2005 YO128|231|88|M1|left` value 1.104e-3 (dep 2030-06-06, TOF 1643.61 d, x -0.823430, |v∞,E| 45.8144 km/s, transfer e 0.9979514, q 3.61e-3 AU)
  - `2019 LB|147|97|M1|left` value 1.090e-3 (dep 2028-10-26, TOF 1793.04 d, x -0.830332, |v∞,E| 45.2583 km/s, transfer e 0.9978236, q 4.05e-3 AU)
  - ... 50 more in lr1-summary.json / the dataset
- (c) farnocchia miss, M=1 right: median 3.752e-6, p99 1.138e-3, max 3.209e-2; 82 cell(s) above the rule.
  - `2024 XA1|177|68|M1|right` value 3.209e-2 (dep 2029-05-24, TOF 1311.54 d, x 0.885509, |v∞,E| 48.1675 km/s, transfer e 0.9999810, q 4.32e-5 AU)
  - `2024 UK5|66|64|M1|right` value 2.253e-2 (dep 2027-04-08, TOF 1245.13 d, x 0.838149, |v∞,E| 47.2612 km/s, transfer e 0.9999125, q 1.90e-4 AU)
  - `2024 XA1|230|80|M1|right` value 2.054e-2 (dep 2030-05-30, TOF 1510.78 d, x 0.699737, |v∞,E| 47.1006 km/s, transfer e 0.9999798, q 4.96e-5 AU)
  - `2024 XA1|515|98|M1|right` value 1.646e-2 (dep 2035-11-17, TOF 1809.65 d, x 0.884496, |v∞,E| 48.7770 km/s, transfer e 0.9999547, q 1.28e-4 AU)
  - `2000 SG344|11|75|M1|right` value 1.426e-2 (dep 2026-03-19, TOF 1427.77 d, x 0.890703, |v∞,E| 47.6637 km/s, transfer e 0.9998843, q 2.80e-4 AU)
  - `2015 HQ11|605|48|M1|right` value 1.158e-2 (dep 2037-08-08, TOF 979.47 d, x 0.845904, |v∞,E| 45.9379 km/s, transfer e 0.9999131, q 1.61e-4 AU)
  - `2020 WG5|366|90|M1|right` value 1.157e-2 (dep 2033-01-07, TOF 1676.82 d, x 0.897956, |v∞,E| 47.5618 km/s, transfer e 0.9998625, q 3.71e-4 AU)
  - `2026 KA|204|98|M1|right` value 9.531e-3 (dep 2029-11-29, TOF 1809.65 d, x 0.830423, |v∞,E| 48.6703 km/s, transfer e 0.9998936, q 2.98e-4 AU)
  - `2020 WG5|631|38|M1|right` value 7.777e-3 (dep 2038-02-06, TOF 813.43 d, x 0.723823, |v∞,E| 44.8995 km/s, transfer e 0.9999296, q 1.11e-4 AU)
  - `433|285|91|M1|right` value 7.034e-3 (dep 2031-06-20, TOF 1693.42 d, x 0.887548, |v∞,E| 48.2908 km/s, transfer e 0.9998656, q 3.64e-4 AU)
  - `2018 LA|132|42|M1|right` value 6.307e-3 (dep 2028-07-13, TOF 879.85 d, x 0.776427, |v∞,E| 46.5924 km/s, transfer e 0.9998889, q 1.88e-4 AU)
  - `2025 PK2|360|58|M1|right` value 6.224e-3 (dep 2032-11-26, TOF 1145.51 d, x 0.872954, |v∞,E| 47.5353 km/s, transfer e 0.9998062, q 4.03e-4 AU)
  - `810074|472|59|M1|right` value 5.866e-3 (dep 2035-01-19, TOF 1162.11 d, x 0.596471, |v∞,E| 46.4588 km/s, transfer e 0.9998926, q 2.09e-4 AU)
  - `2022 SX7|391|60|M1|right` value 5.554e-3 (dep 2033-07-01, TOF 1178.71 d, x 0.848427, |v∞,E| 47.2350 km/s, transfer e 0.9998901, q 2.31e-4 AU)
  - `2005 YO128|314|98|M1|right` value 4.626e-3 (dep 2032-01-09, TOF 1809.65 d, x 0.903128, |v∞,E| 48.6374 km/s, transfer e 0.9998343, q 4.71e-4 AU)
  - `2016 LG49|187|75|M1|right` value 4.319e-3 (dep 2029-08-02, TOF 1427.77 d, x 0.864183, |v∞,E| 46.8715 km/s, transfer e 0.9993869, q 1.47e-3 AU)
  - `1998 KY26|486|57|M1|right` value 4.250e-3 (dep 2035-04-27, TOF 1128.90 d, x 0.859412, |v∞,E| 45.6972 km/s, transfer e 0.9995842, q 8.50e-4 AU)
  - `99942|157|56|M1|right` value 4.124e-3 (dep 2029-01-04, TOF 1112.30 d, x 0.855214, |v∞,E| 47.2454 km/s, transfer e 0.9997587, q 4.88e-4 AU)
  - `2022 SX7|309|72|M1|right` value 3.750e-3 (dep 2031-12-05, TOF 1377.95 d, x 0.858985, |v∞,E| 47.4931 km/s, transfer e 0.9995016, q 1.17e-3 AU)
  - `2008 QU3|361|92|M1|right` value 3.589e-3 (dep 2032-12-03, TOF 1710.03 d, x 0.896018, |v∞,E| 47.2740 km/s, transfer e 0.9994574, q 1.48e-3 AU)
  - `2023 CK1|236|81|M1|right` value 3.378e-3 (dep 2030-07-11, TOF 1527.39 d, x 0.814246, |v∞,E| 48.5049 km/s, transfer e 0.9990833, q 2.28e-3 AU)
  - `2019 LB|136|96|M1|right` value 2.782e-3 (dep 2028-08-10, TOF 1776.44 d, x 0.899451, |v∞,E| 47.0989 km/s, transfer e 0.9996878, q 8.76e-4 AU)
  - `101955|495|80|M1|right` value 2.745e-3 (dep 2035-06-30, TOF 1510.78 d, x 0.879063, |v∞,E| 47.6899 km/s, transfer e 0.9998569, q 3.58e-4 AU)
  - `2012 XE133|56|30|M1|right` value 2.656e-3 (dep 2027-01-28, TOF 680.61 d, x 0.794554, |v∞,E| 45.7030 km/s, transfer e 0.9998267, q 2.46e-4 AU)
  - `2022 WJ1|105|93|M1|right` value 2.561e-3 (dep 2028-01-06, TOF 1726.63 d, x 0.873412, |v∞,E| 47.5766 km/s, transfer e 0.9993425, q 1.80e-3 AU)
  - ... 57 more in lr1-summary.json / the dataset
- (c) cowell miss, M=0 single: median 1.469e-4, p99 2.204e-3, max 2.624e-2; 2 cell(s) above the rule.
  - `2019 WM3|523|86|M0|single` value 2.624e-2 (dep 2036-01-12, TOF 1610.40 d, x -0.899544, |v∞,E| 41.6967 km/s, transfer e 0.9745755, q 6.91e-2 AU)
  - `2024 XA1|177|68|M0|single` value 1.612e-2 (dep 2029-05-24, TOF 1311.54 d, x -0.889079, |v∞,E| 42.5247 km/s, transfer e 0.9820028, q 4.23e-2 AU)
- (c) cowell miss, M=1 left: median 8.243e-4, p99 7.675e-2, max 3.249e+1; 38 cell(s) above the rule.
  - `2024 XA1|230|80|M1|left` value 3.249e+1 (dep 2030-05-30, TOF 1510.78 d, x -0.532231, |v∞,E| 45.6451 km/s, transfer e 0.9999960, q 7.06e-6 AU)
  - `2000 SG344|503|60|M1|left` value 5.257e+0 (dep 2035-08-25, TOF 1178.71 d, x -0.807038, |v∞,E| 45.1085 km/s, transfer e 0.9999758, q 3.44e-5 AU)
  - `2008 HU4|237|68|M1|left` value 2.865e+0 (dep 2030-07-18, TOF 1311.54 d, x -0.812087, |v∞,E| 46.3423 km/s, transfer e 0.9999700, q 4.58e-5 AU)
  - `2022 WJ1|445|75|M1|left` value 1.938e+0 (dep 2034-07-14, TOF 1427.77 d, x -0.431512, |v∞,E| 45.5302 km/s, transfer e 0.9998610, q 2.39e-4 AU)
  - `2010 UA7|343|85|M1|left` value 9.901e-1 (dep 2032-07-30, TOF 1593.80 d, x -0.798819, |v∞,E| 46.5425 km/s, transfer e 0.9998554, q 2.51e-4 AU)
  - `99942|26|48|M1|left` value 7.084e-1 (dep 2026-07-02, TOF 979.47 d, x -0.754326, |v∞,E| 44.6876 km/s, transfer e 0.9998163, q 2.34e-4 AU)
  - `2025 PK2|536|69|M1|left` value 5.821e-1 (dep 2036-04-12, TOF 1328.14 d, x -0.821588, |v∞,E| 45.7379 km/s, transfer e 0.9996540, q 5.29e-4 AU)
  - `2022 FZ3|465|51|M1|left` value 5.540e-1 (dep 2034-12-01, TOF 1029.28 d, x -0.674977, |v∞,E| 43.8517 km/s, transfer e 0.9998959, q 1.38e-4 AU)
  - `2000 SG344|136|99|M1|left` value 4.093e-1 (dep 2028-08-10, TOF 1826.25 d, x -0.845859, |v∞,E| 45.3521 km/s, transfer e 0.9996229, q 7.10e-4 AU)
  - `2005 YO128|9|97|M1|left` value 3.306e-1 (dep 2026-03-05, TOF 1793.04 d, x -0.852745, |v∞,E| 47.2840 km/s, transfer e 0.9992918, q 1.31e-3 AU)
  - `2018 LA|276|57|M1|left` value 3.107e-1 (dep 2031-04-18, TOF 1128.90 d, x -0.770343, |v∞,E| 44.3950 km/s, transfer e 0.9998357, q 2.29e-4 AU)
  - `2022 WJ1|594|57|M1|left` value 3.073e-1 (dep 2037-05-23, TOF 1128.90 d, x -0.254436, |v∞,E| 44.2782 km/s, transfer e 0.9993070, q 1.07e-3 AU)
  - `2019 UU4|405|67|M1|left` value 2.649e-1 (dep 2033-10-07, TOF 1294.94 d, x -0.718126, |v∞,E| 45.6621 km/s, transfer e 0.9997479, q 3.86e-4 AU)
  - `2010 UA7|253|88|M1|left` value 2.211e-1 (dep 2030-11-08, TOF 1643.61 d, x -0.310624, |v∞,E| 46.4764 km/s, transfer e 0.9998477, q 2.96e-4 AU)
  - `1998 KY26|143|32|M1|left` value 2.210e-1 (dep 2028-09-28, TOF 713.81 d, x -0.700266, |v∞,E| 41.3724 km/s, transfer e 0.9995089, q 5.14e-4 AU)
  - `2026 KA|315|80|M1|left` value 1.982e-1 (dep 2032-01-16, TOF 1510.78 d, x -0.530337, |v∞,E| 45.6756 km/s, transfer e 0.9984486, q 2.72e-3 AU)
  - `2025 BZ2|592|38|M1|left` value 1.965e-1 (dep 2037-05-09, TOF 813.43 d, x -0.443211, |v∞,E| 42.6997 km/s, transfer e 0.9998186, q 2.17e-4 AU)
  - `2026 KA|358|98|M1|left` value 1.941e-1 (dep 2032-11-12, TOF 1809.65 d, x -0.810002, |v∞,E| 45.9990 km/s, transfer e 0.9996667, q 6.27e-4 AU)
  - `433|381|74|M1|left` value 1.862e-1 (dep 2033-04-22, TOF 1411.16 d, x -0.788550, |v∞,E| 46.8782 km/s, transfer e 0.9989306, q 1.71e-3 AU)
  - `2019 UU4|286|40|M1|left` value 1.577e-1 (dep 2031-06-27, TOF 846.64 d, x -0.731298, |v∞,E| 43.0566 km/s, transfer e 0.9998193, q 2.10e-4 AU)
  - `101955|143|85|M1|left` value 1.521e-1 (dep 2028-09-28, TOF 1593.80 d, x -0.835506, |v∞,E| 46.6321 km/s, transfer e 0.9995630, q 7.53e-4 AU)
  - `2019 LB|174|93|M1|left` value 1.515e-1 (dep 2029-05-03, TOF 1726.63 d, x -0.787558, |v∞,E| 46.8129 km/s, transfer e 0.9989384, q 1.94e-3 AU)
  - `2019 AV6|86|30|M1|left` value 1.510e-1 (dep 2027-08-26, TOF 680.61 d, x -0.580746, |v∞,E| 41.6528 km/s, transfer e 0.9997085, q 3.03e-4 AU)
  - `2000 SG344|555|39|M1|left` value 1.455e-1 (dep 2036-08-23, TOF 830.04 d, x -0.748590, |v∞,E| 43.0557 km/s, transfer e 0.9995041, q 5.66e-4 AU)
  - `2019 LB|147|97|M1|left` value 1.403e-1 (dep 2028-10-26, TOF 1793.04 d, x -0.830332, |v∞,E| 45.2583 km/s, transfer e 0.9978236, q 4.05e-3 AU)
  - ... 13 more in lr1-summary.json / the dataset
- (c) cowell miss, M=1 right: median 1.098e-3, p99 1.809e-1, max 9.497e+0; 61 cell(s) above the rule.
  - `2024 XA1|230|80|M1|right` value 9.497e+0 (dep 2030-05-30, TOF 1510.78 d, x 0.699737, |v∞,E| 47.1006 km/s, transfer e 0.9999798, q 4.96e-5 AU)
  - `2024 UK5|66|64|M1|right` value 4.867e+0 (dep 2027-04-08, TOF 1245.13 d, x 0.838149, |v∞,E| 47.2612 km/s, transfer e 0.9999125, q 1.90e-4 AU)
  - `2000 SG344|11|75|M1|right` value 3.687e+0 (dep 2026-03-19, TOF 1427.77 d, x 0.890703, |v∞,E| 47.6637 km/s, transfer e 0.9998843, q 2.80e-4 AU)
  - `2026 KA|204|98|M1|right` value 2.448e+0 (dep 2029-11-29, TOF 1809.65 d, x 0.830423, |v∞,E| 48.6703 km/s, transfer e 0.9998936, q 2.98e-4 AU)
  - `101955|495|80|M1|right` value 1.723e+0 (dep 2035-06-30, TOF 1510.78 d, x 0.879063, |v∞,E| 47.6899 km/s, transfer e 0.9998569, q 3.58e-4 AU)
  - `2024 XA1|177|68|M1|right` value 1.480e+0 (dep 2029-05-24, TOF 1311.54 d, x 0.885509, |v∞,E| 48.1675 km/s, transfer e 0.9999810, q 4.32e-5 AU)
  - `2015 HQ11|605|48|M1|right` value 1.351e+0 (dep 2037-08-08, TOF 979.47 d, x 0.845904, |v∞,E| 45.9379 km/s, transfer e 0.9999131, q 1.61e-4 AU)
  - `2025 PK2|360|58|M1|right` value 9.701e-1 (dep 2032-11-26, TOF 1145.51 d, x 0.872954, |v∞,E| 47.5353 km/s, transfer e 0.9998062, q 4.03e-4 AU)
  - `2005 YO128|314|98|M1|right` value 9.612e-1 (dep 2032-01-09, TOF 1809.65 d, x 0.903128, |v∞,E| 48.6374 km/s, transfer e 0.9998343, q 4.71e-4 AU)
  - `1998 KY26|127|75|M1|right` value 8.845e-1 (dep 2028-06-08, TOF 1427.77 d, x 0.878598, |v∞,E| 46.8134 km/s, transfer e 0.9998890, q 2.67e-4 AU)
  - `2022 WJ1|445|75|M1|right` value 8.209e-1 (dep 2034-07-14, TOF 1427.77 d, x 0.629551, |v∞,E| 46.5665 km/s, transfer e 0.9995118, q 1.13e-3 AU)
  - `2022 WJ1|496|57|M1|right` value 8.000e-1 (dep 2035-07-07, TOF 1128.90 d, x 0.653987, |v∞,E| 46.5933 km/s, transfer e 0.9998426, q 3.05e-4 AU)
  - `810074|472|59|M1|right` value 6.754e-1 (dep 2035-01-19, TOF 1162.11 d, x 0.596471, |v∞,E| 46.4588 km/s, transfer e 0.9998926, q 2.09e-4 AU)
  - `2018 LA|132|42|M1|right` value 6.627e-1 (dep 2028-07-13, TOF 879.85 d, x 0.776427, |v∞,E| 46.5924 km/s, transfer e 0.9998889, q 1.88e-4 AU)
  - `2022 SX7|391|60|M1|right` value 6.217e-1 (dep 2033-07-01, TOF 1178.71 d, x 0.848427, |v∞,E| 47.2350 km/s, transfer e 0.9998901, q 2.31e-4 AU)
  - `2025 PK2|445|31|M1|right` value 5.922e-1 (dep 2034-07-14, TOF 697.21 d, x 0.707196, |v∞,E| 44.1834 km/s, transfer e 0.9998415, q 2.23e-4 AU)
  - `433|285|91|M1|right` value 5.581e-1 (dep 2031-06-20, TOF 1693.42 d, x 0.887548, |v∞,E| 48.2908 km/s, transfer e 0.9998656, q 3.64e-4 AU)
  - `2008 QU3|361|92|M1|right` value 5.165e-1 (dep 2032-12-03, TOF 1710.03 d, x 0.896018, |v∞,E| 47.2740 km/s, transfer e 0.9994574, q 1.48e-3 AU)
  - `2020 WG5|366|90|M1|right` value 5.129e-1 (dep 2033-01-07, TOF 1676.82 d, x 0.897956, |v∞,E| 47.5618 km/s, transfer e 0.9998625, q 3.71e-4 AU)
  - `2026 KA|352|97|M1|right` value 4.919e-1 (dep 2032-10-01, TOF 1793.04 d, x 0.899378, |v∞,E| 46.8563 km/s, transfer e 0.9987132, q 3.64e-3 AU)
  - `2019 LB|136|96|M1|right` value 4.803e-1 (dep 2028-08-10, TOF 1776.44 d, x 0.899451, |v∞,E| 47.0989 km/s, transfer e 0.9996878, q 8.76e-4 AU)
  - `1998 KY26|486|57|M1|right` value 4.672e-1 (dep 2035-04-27, TOF 1128.90 d, x 0.859412, |v∞,E| 45.6972 km/s, transfer e 0.9995842, q 8.50e-4 AU)
  - `2024 XA1|298|64|M1|right` value 4.104e-1 (dep 2031-09-19, TOF 1245.13 d, x 0.874312, |v∞,E| 46.4099 km/s, transfer e 0.9989376, q 2.34e-3 AU)
  - `2019 NC|158|79|M1|right` value 4.036e-1 (dep 2029-01-11, TOF 1494.18 d, x 0.568147, |v∞,E| 46.5718 km/s, transfer e 0.9989754, q 2.34e-3 AU)
  - `2022 FZ3|108|79|M1|right` value 3.964e-1 (dep 2028-01-27, TOF 1494.18 d, x 0.884564, |v∞,E| 46.4081 km/s, transfer e 0.9985474, q 3.62e-3 AU)
  - ... 36 more in lr1-summary.json / the dataset
- (b) valladoDefault |Δv∞,E|, M=0: median 2.437e-8, p99 1.678e-7, max 3.420e-7; 0 cell(s) above the rule; solver errors 6.
  - error `2026 KA|719|1|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.0853631, q 9.85e-1 AU, TOF 199.10 d)
  - error `2019 NC|334|11|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.0636540, q 9.81e-1 AU, TOF 365.14 d)
  - error `2019 NC|336|4|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.0968093, q 4.16e-1 AU, TOF 248.91 d)
  - error `2019 NC|551|0|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.2723032, q 5.13e-1 AU, TOF 182.50 d)
  - error `2019 NC|667|1|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.6457031, q 9.98e-1 AU, TOF 199.10 d)
  - error `810074|569|0|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.0958165, q 9.69e-1 AU, TOF 182.50 d)
- (b) valladoTight |Δv∞,E|, M=0: median 2.319e-12, p99 1.931e-11, max 1.875e-10; 0 cell(s) above the rule; solver errors 14.
  - error `99942|157|56|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.8224987, q 3.74e-1 AU, TOF 1112.30 d)
  - error `2000 SG344|11|75|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.8382269, q 4.02e-1 AU, TOF 1427.77 d)
  - error `2000 SG344|674|19|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.6546154, q 4.26e-1 AU, TOF 497.97 d)
  - error `1998 KY26|127|75|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.8730940, q 3.16e-1 AU, TOF 1427.77 d)
  - error `1998 KY26|486|57|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.5261256, q 1.01e+0 AU, TOF 1128.90 d)
  - error `2024 BX1|558|71|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.6081663, q 9.44e-1 AU, TOF 1361.35 d)
  - error `2024 XA1|298|64|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.7092091, q 6.62e-1 AU, TOF 1245.13 d)
  - error `2024 XA1|522|10|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.8564479, q 1.40e-1 AU, TOF 348.54 d)
  - error `2008 QU3|361|92|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.6443368, q 9.98e-1 AU, TOF 1710.03 d)
  - error `2019 NC|667|1|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 1.6457031, q 9.98e-1 AU, TOF 199.10 d)
  - error `2005 YO128|314|98|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.7408903, q 7.54e-1 AU, TOF 1809.65 d)
  - error `2020 VY4|201|33|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.7206418, q 4.46e-1 AU, TOF 730.42 d)
  - error `2020 WG5|366|90|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.6410382, q 9.93e-1 AU, TOF 1676.82 d)
  - error `2015 HQ11|605|48|M0|single`: RuntimeError: Maximum number of iterations reached (transfer e 0.7486199, q 4.86e-1 AU, TOF 979.47 d)

## Per-body convergence (Aster kernel)
| Body | tier | class | M=0 ok / no-solution / stall | M=1 ok / no-solution / stall | M=1 branches converged / not |
| --- | --- | --- | --- | --- | --- |
| 433 | L2 | AMO | 150 / 0 / 0 | 113 / 37 / 0 | 226 / 0 |
| 99942 | L1 | ATE | 150 / 0 / 0 | 129 / 21 / 0 | 258 / 0 |
| 101955 | L1 | APO | 150 / 0 / 0 | 119 / 31 / 0 | 238 / 0 |
| 2000 SG344 | L1 | ATE | 150 / 0 / 0 | 130 / 20 / 0 | 260 / 0 |
| 2008 HU4 | L1 | APO | 150 / 0 / 0 | 126 / 24 / 0 | 252 / 0 |
| 1998 KY26 | L1 | APO | 150 / 0 / 0 | 119 / 31 / 0 | 238 / 0 |
| 2024 BX1 | L0 | APO | 150 / 0 / 0 | 118 / 32 / 0 | 236 / 0 |
| 2024 XA1 | L0 | APO | 150 / 0 / 0 | 91 / 59 / 0 | 182 / 0 |
| 2018 LA | L0 | APO | 150 / 0 / 0 | 116 / 34 / 0 | 232 / 0 |
| 2022 WJ1 | L0 | APO | 150 / 0 / 0 | 85 / 65 / 0 | 170 / 0 |
| 2008 QU3 | L1 | ATE | 150 / 0 / 0 | 122 / 28 / 0 | 244 / 0 |
| 2025 PK2 | L1 | APO | 150 / 0 / 0 | 122 / 28 / 0 | 244 / 0 |
| 2019 LB | L1 | APO | 150 / 0 / 0 | 116 / 34 / 0 | 232 / 0 |
| 2026 KA | L1 | APO | 150 / 0 / 0 | 60 / 90 / 0 | 120 / 0 |
| 2024 UK5 | L1 | ATE | 150 / 0 / 0 | 128 / 22 / 0 | 256 / 0 |
| 2010 UA7 | L1 | AMO | 150 / 0 / 0 | 50 / 100 / 0 | 100 / 0 |
| 2019 NC | L1 | AMO | 150 / 0 / 0 | 25 / 125 / 0 | 50 / 0 |
| 2017 UD | L1 | APO | 150 / 0 / 0 | 116 / 34 / 0 | 232 / 0 |
| 2005 YO128 | L1 | ATE | 150 / 0 / 0 | 129 / 21 / 0 | 258 / 0 |
| 2020 VY4 | L1 | ATE | 150 / 0 / 0 | 122 / 28 / 0 | 244 / 0 |
| 2005 OK3 | L1 | AMO | 150 / 0 / 0 | 59 / 91 / 0 | 118 / 0 |
| 2012 XE133 | L1 | ATE | 150 / 0 / 0 | 130 / 20 / 0 | 260 / 0 |
| 2020 WG5 | L1 | APO | 150 / 0 / 0 | 109 / 41 / 0 | 218 / 0 |
| 810074 | L2 | APO | 150 / 0 / 0 | 66 / 84 / 0 | 132 / 0 |
| 2013 VN13 | L2 | APO | 150 / 0 / 0 | 110 / 40 / 0 | 220 / 0 |
| 138095 | L2 | AMO | 150 / 0 / 0 | 92 / 58 / 0 | 184 / 0 |
| 2015 HQ11 | L2 | APO | 150 / 0 / 0 | 108 / 42 / 0 | 216 / 0 |
| 886456 | L2 | APO | 150 / 0 / 0 | 113 / 37 / 0 | 226 / 0 |
| 2022 SX7 | L2 | AMO | 150 / 0 / 0 | 108 / 42 / 0 | 216 / 0 |
| 2019 AV6 | L2 | AMO | 150 / 0 / 0 | 114 / 36 / 0 | 228 / 0 |
| 99248 | L2 | APO | 150 / 0 / 0 | 80 / 70 / 0 | 160 / 0 |
| 2026 CV2 | L2 | APO | 150 / 0 / 0 | 50 / 100 / 0 | 100 / 0 |
| 2026 HB | L2 | APO | 150 / 0 / 0 | 74 / 76 / 0 | 148 / 0 |
| 2025 BZ2 | L2 | APO | 150 / 0 / 0 | 105 / 45 / 0 | 210 / 0 |
| 2019 WM3 | L2 | APO | 150 / 0 / 0 | 110 / 40 / 0 | 220 / 0 |
| 2019 UU4 | L2 | AMO | 150 / 0 / 0 | 111 / 39 / 0 | 222 / 0 |
| 2016 LG49 | L2 | APO | 150 / 0 / 0 | 110 / 40 / 0 | 220 / 0 |
| 2023 CK1 | L2 | AMO | 150 / 0 / 0 | 116 / 34 / 0 | 232 / 0 |
| 2022 FZ3 | L2 | APO | 150 / 0 / 0 | 106 / 44 / 0 | 212 / 0 |
| 2013 BD18 | L2 | APO | 150 / 0 / 0 | 55 / 95 / 0 | 110 / 0 |

## Files
- `lr1-oracle.part1of1.json.gz` — 8695618 bytes gzip, 14124 records, sha256 ee646f298491befe17a32e8639e2ee45e9b18b3ae6f1185a4edca0a49ac7da66
- `lr1-summary.json` — every aggregate in this report, uncompressed.
- `build-cells.mjs`, `oracle_driver.py`, `report.mjs` — the three steps; see README.md.

