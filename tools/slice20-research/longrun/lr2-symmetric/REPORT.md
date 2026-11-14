# LR2 — catalog-wide symmetric-return error

**UNVALIDATED until LR1 passes review. LEADS-grade research evidence; nothing here enters a DEC, a test or the site.**

State: **COMPLETE**. Bodies processed 41906 of 41906 (seeded shuffle 2026111302; shard i holds positions p % 3 == i, so a partial run is an unbiased sample).
Run: CLOUD container (node v22.23.4), production code at 0d31cda3d1dca81d29f45092be26b94bb44294c1 (src/v2 tree f4b51e15a93378f2a3ec2bdfd62bf4c0a1e5e9f2).

## What was measured, per body
- **Outbound** — the production `computeCompareData` with the compare page's arguments (731x100, M=0, 2026-01-01..2040-01-01, TOF 182.5-1826.25 d, relative threshold, delta 5, B_min 2). Window = `segmentation.bestPractical`.
- **Assumed** — `departureDvFromVInf(outbound vInfArr)` at that window: what the symmetric assumption charges today.
- **Computed** — minimum asteroid-departure |v∞| over return departures in [arrival + 8 d, arrival + 730.5 d] (723 columns) x TOF 182.5-1826.25 d (100), M=0, unedited kernel with swapped providers and the verified indexed Earth lookup. Cells arriving at Earth after the last Earth sample are refused and counted.
- **error = assumed − computed** (km/s, sign kept). Positive = the assumption overcharges.
- A **secondary** window is measured the same way: the outbound cell minimizing the production sample-return ΔV stack (S20_01 R3's "best stack"). It is beyond the dispatch's stated procedure and is labelled secondary everywhere.

Read this before using any number: the compare page itself is one-way and does not charge a return burn. The symmetric charge is applied on the porkchop page to whichever cell the user pins in sample-return mode (`app/porkchop/main.ts`). The primary rows answer "how wrong is the charge at the window compare recommends"; the secondary rows answer "how wrong is it at the window the sample-return stack itself would rank first".

## Status counts
| Status | Bodies |
| --- | ---: |
| ok | 39993 |
| all-return-cells-refused | 1451 |
| no-practical-window | 461 |
| outbound-refused:not-propagatable | 1 |

Tier counts in the processed set: L2 31745, L1 10150, L0 11. Bodies where both window definitions pick the same cell: 9.

## PRIMARY - compare path best practical window (the dispatch procedure)

Measured bodies: **39993** (bodies with a window: 41444).

|  | n | median \|error\| | p10 \|e\| | p90 \|e\| | p99 \|e\| | max \|e\| | signed p10 / p50 / p90 | overcharge share | undercharge share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **all** | 39993 | 8.972 | 3.405 | 17.838 | 28.362 | 65.424 | 3.214 / 8.944 / 17.819 | 97.3% | 2.7% |
| tier L2 | 30108 | 9.457 | 4.067 | 18.529 | 29.327 | 65.424 | 3.879 / 9.425 / 18.484 | 97.1% | 2.9% |
| tier L1 | 9875 | 7.379 | 2.288 | 15.052 | 23.956 | 36.103 | 2.216 / 7.368 / 15.030 | 97.8% | 2.2% |
| tier L0 | 10 | 10.546 | 7.364 | 18.170 | 19.626 | 19.787 | 7.364 / 10.546 / 18.170 | 100.0% | 0.0% |
| class APO | 22751 | 10.457 | 4.211 | 20.066 | 30.234 | 56.434 | 4.141 / 10.448 / 20.055 | 98.4% | 1.6% |
| class AMO | 13828 | 7.528 | 2.872 | 13.696 | 21.084 | 36.085 | 2.366 / 7.475 / 13.613 | 95.2% | 4.8% |
| class ATE | 3206 | 6.748 | 2.267 | 13.916 | 22.186 | 36.063 | 2.218 / 6.735 / 13.889 | 98.8% | 1.2% |
| class JFC | 153 | 12.444 | 6.546 | 22.810 | 43.756 | 46.714 | 6.526 / 12.399 / 22.601 | 98.0% | 2.0% |
| class IEO | 35 | 8.999 | 1.937 | 16.131 | 18.098 | 18.174 | 1.937 / 8.999 / 16.131 | 94.3% | 5.7% |
| class HTC | 15 | 12.505 | 2.060 | 63.749 | 65.378 | 65.424 | -12.223 / 0.334 / 63.749 | 53.3% | 46.7% |
| class ETC | 5 | 13.665 | 11.051 | 23.529 | 27.358 | 27.784 | 11.051 / 13.665 / 23.529 | 100.0% | 0.0% |
| L1, supported return cells only | 2079 | 6.939 | 2.139 | 13.919 | 22.838 | 32.704 | 2.078 / 6.936 / 13.908 | 98.4% | 1.6% |
| no return cell refused (complete window) | 22210 | 9.453 | 4.417 | 18.237 | 28.790 | 65.095 | 4.409 / 9.449 / 18.237 | 99.7% | 0.3% |
| up to half the return cells refused | 8160 | 9.417 | 4.333 | 18.305 | 28.434 | 65.424 | 4.333 / 9.417 / 18.305 | 99.8% | 0.2% |
| more than half the return cells refused | 9623 | 7.086 | 1.419 | 16.183 | 27.219 | 40.782 | -0.082 / 6.943 / 16.021 | 89.7% | 10.3% |

The last three rows split the measured bodies by how much of the pairing window DEC-20-3 refused. A refused cell cannot be the minimum, so on a truncated window `computed` is an upper bound on the full-window minimum and the error is pushed toward undercharge. The "complete window" row is the population with no such bias.

Against the DEC-20-7 interim range (0.08-5.1 km/s, six windows): 18.8% of measured bodies fall inside it, 0.2% below 0.08, 81.0% above 5.1.

Signed error histogram (km/s):
| bin | bodies | share |
| --- | ---: | ---: |
| below -10 | 74 | 0.2% |
| -10 to -5 | 106 | 0.3% |
| -5 to -2 | 287 | 0.7% |
| -2 to -1 | 230 | 0.6% |
| -1 to -0.5 | 171 | 0.4% |
| -0.5 to -0.1 | 160 | 0.4% |
| -0.1 to 0.1 | 98 | 0.2% |
| 0.1 to 0.5 | 216 | 0.5% |
| 0.5 to 1 | 286 | 0.7% |
| 1 to 2 | 847 | 2.1% |
| 2 to 5 | 5035 | 12.6% |
| 5 to 10 | 15719 | 39.3% |
| 10 and above | 16764 | 41.9% |

Medians at the chosen cells: assumed 10.810 km/s, computed 1.401 km/s, stay 127.1 d, return TOF 564.4 d, Earth-arrival |v∞| at the chosen return cell 11.141 km/s.

Refusals, support and convergence:
- Return cells: 2996401200 evaluated; **792784488 refused** (Earth arrival after the fixture end, 26.5%); 1 without convergence; 473381214 depart at or after the body's support date; 2203616711 converged.
- Bodies: 19234 have at least one refused return cell; 1451 have every return cell refused (no computed value); 0 have no converged return cell; 1 have at least one non-converged admissible cell.
- Support (L1 only, 9875 measured): the chosen return departs at or after the support date for **8389** bodies; the outbound window itself arrives after support for 6984; 7796 L1 bodies have no supported converged return cell.

## SECONDARY - outbound cell minimizing the production sample-return dV stack (beyond the dispatch procedure)

Measured bodies: **37842** (bodies with a window: 41905).

|  | n | median \|error\| | p10 \|e\| | p90 \|e\| | p99 \|e\| | max \|e\| | signed p10 / p50 / p90 | overcharge share | undercharge share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **all** | 37842 | 0.775 | 0.114 | 3.194 | 13.912 | 75.542 | -2.877 / -0.390 / 0.995 | 33.7% | 66.3% |
| tier L2 | 28119 | 0.728 | 0.110 | 3.544 | 14.959 | 75.542 | -3.132 / -0.294 / 1.132 | 37.0% | 63.0% |
| tier L1 | 9717 | 0.919 | 0.128 | 2.676 | 10.834 | 37.048 | -2.571 / -0.717 / 0.536 | 24.0% | 76.0% |
| tier L0 | 6 | 0.251 | 0.193 | 1.068 | 1.765 | 1.843 | -0.277 / -0.193 / 1.042 | 33.3% | 66.7% |
| class APO | 21456 | 0.714 | 0.107 | 2.994 | 13.778 | 62.878 | -2.442 / -0.240 / 1.335 | 38.8% | 61.2% |
| class AMO | 12936 | 0.773 | 0.116 | 3.751 | 14.650 | 41.761 | -3.653 / -0.512 / 0.662 | 30.0% | 70.0% |
| class ATE | 3275 | 1.226 | 0.214 | 2.816 | 9.417 | 31.985 | -2.788 / -1.179 / 0.249 | 14.9% | 85.1% |
| class JFC | 108 | 1.356 | 0.130 | 5.703 | 24.172 | 25.678 | -5.674 / -0.207 / 1.815 | 45.4% | 54.6% |
| class IEO | 37 | 1.424 | 0.233 | 5.231 | 7.023 | 7.254 | -5.231 / -1.253 / 0.375 | 18.9% | 81.1% |
| class HTC | 24 | 9.392 | 2.290 | 20.307 | 71.604 | 75.542 | -20.307 / -8.613 / 0.013 | 12.5% | 87.5% |
| class ETC | 6 | 1.722 | 0.833 | 5.474 | 8.194 | 8.497 | -1.967 / 0.833 / 5.228 | 66.7% | 33.3% |
| L1, supported return cells only | 1715 | 0.761 | 0.115 | 2.578 | 6.177 | 33.393 | -2.336 / -0.423 / 0.799 | 32.1% | 67.9% |
| no return cell refused (complete window) | 20019 | 0.612 | 0.097 | 2.035 | 3.920 | 16.820 | -1.640 / -0.197 / 1.144 | 40.3% | 59.7% |
| up to half the return cells refused | 8389 | 0.603 | 0.093 | 2.048 | 3.813 | 12.749 | -1.675 / -0.241 / 1.103 | 37.4% | 62.6% |
| more than half the return cells refused | 9434 | 1.958 | 0.264 | 8.491 | 23.672 | 75.542 | -8.491 / -1.810 / 0.416 | 16.4% | 83.6% |

The last three rows split the measured bodies by how much of the pairing window DEC-20-3 refused. A refused cell cannot be the minimum, so on a truncated window `computed` is an upper bound on the full-window minimum and the error is pushed toward undercharge. The "complete window" row is the population with no such bias.

Against the DEC-20-7 interim range (0.08-5.1 km/s, six windows): 87.3% of measured bodies fall inside it, 7.1% below 0.08, 5.6% above 5.1.

Signed error histogram (km/s):
| bin | bodies | share |
| --- | ---: | ---: |
| below -10 | 730 | 1.9% |
| -10 to -5 | 1354 | 3.6% |
| -5 to -2 | 4128 | 10.9% |
| -2 to -1 | 5824 | 15.4% |
| -1 to -0.5 | 5313 | 14.0% |
| -0.5 to -0.1 | 6096 | 16.1% |
| -0.1 to 0.1 | 3316 | 8.8% |
| 0.1 to 0.5 | 4525 | 12.0% |
| 0.5 to 1 | 2784 | 7.4% |
| 1 to 2 | 2346 | 6.2% |
| 2 to 5 | 1335 | 3.5% |
| 5 to 10 | 91 | 0.2% |
| 10 and above | 0 | 0.0% |

Medians at the chosen cells: assumed 0.976 km/s, computed 1.497 km/s, stay 261.2 d, return TOF 498.0 d, Earth-arrival |v∞| at the chosen return cell 11.595 km/s.

Refusals, support and convergence:
- Return cells: 3029731500 evaluated; **972306863 refused** (Earth arrival after the fixture end, 32.1%); 0 without convergence; 454099018 depart at or after the body's support date; 2057424637 converged.
- Bodies: 21886 have at least one refused return cell; 4063 have every return cell refused (no computed value); 0 have no converged return cell; 0 have at least one non-converged admissible cell.
- Support (L1 only, 9717 measured): the chosen return departs at or after the support date for **8342** bodies; the outbound window itself arrives after support for 8000; 8002 L1 bodies have no supported converged return cell.

## Extremes (ten each)
Read the "refused cells" column first: the largest undercharges sit on windows where almost every return cell was refused (of 72,300), so their `computed` is the minimum of a handful of cells, not of the pairing window.

**Primary — largest overcharge**

| Body | tier | class | outbound dep, TOF d | C3 | assumed | computed | error | return dep, TOF d | refused cells |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| 2010 L5 | L2 | HTC | 2033-01-21, 348.5 | 32.500 | 73.672 | 8.249 | 65.424 | 2035-04-19, 1826.3 | 5 |
| 55P | L2 | HTC | 2029-12-20, 531.2 | 18.516 | 74.374 | 9.279 | 65.095 | 2032-09-29, 1743.2 | 0 |
| 2005 T4 | L2 | HTC | 2033-02-11, 365.1 | 43.911 | 70.083 | 8.353 | 61.731 | 2035-04-26, 1809.6 | 79 |
| 2005 BW1 | L2 | APO | 2034-06-02, 182.5 | 28.459 | 57.612 | 1.178 | 56.434 | 2036-08-12, 929.7 | 3578 |
| 2008 Y12 | L2 | JFC | 2029-11-15, 232.3 | 4.925 | 47.128 | 0.413 | 46.714 | 2030-11-23, 1710.0 | 0 |
| 2015 EV | L2 | APO | 2026-07-09, 215.7 | 4.454 | 46.259 | 0.216 | 46.043 | 2027-03-28, 1079.1 | 0 |
| 2023 XF5 | L2 | APO | 2027-04-01, 232.3 | 11.791 | 45.141 | 0.650 | 44.491 | 2028-06-05, 1294.9 | 0 |
| 1999 J6 | L2 | JFC | 2030-08-29, 448.2 | 12.395 | 44.421 | 0.414 | 44.008 | 2032-06-11, 1826.3 | 0 |
| 2024 DG | L2 | APO | 2026-06-11, 199.1 | 69.622 | 47.844 | 3.897 | 43.947 | 2028-08-13, 581.0 | 0 |
| 2002 R5 | L2 | JFC | 2030-07-25, 331.9 | 22.954 | 44.230 | 0.706 | 43.524 | 2033-06-13, 1411.2 | 0 |

**Primary — largest undercharge**

| Body | tier | class | outbound dep, TOF d | C3 | assumed | computed | error | return dep, TOF d | refused cells |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| 397237 | L2 | APO | 2038-03-13, 830.0 | 71.667 | 5.567 | 41.986 | -36.420 | 2040-06-28, 182.5 | 72297 |
| 2024 XY6 | L2 | AMO | 2039-02-12, 481.4 | 11.300 | 6.581 | 42.666 | -36.085 | 2040-07-01, 182.5 | 72284 |
| 2010 UB | L2 | APO | 2038-11-20, 531.2 | 12.072 | 4.003 | 35.387 | -31.384 | 2040-05-28, 215.7 | 72200 |
| 529718 | L2 | APO | 2037-09-19, 979.5 | 73.048 | 7.317 | 37.666 | -30.349 | 2040-06-13, 199.1 | 72259 |
| 2018 XB4 | L1 | APO | 2039-10-01, 265.5 | 0.003 | 7.336 | 36.283 | -28.947 | 2040-07-01, 182.5 | 72299 |
| 2020 VB1 | L2 | AMO | 2039-03-05, 448.2 | 12.986 | 2.546 | 30.554 | -28.007 | 2040-06-03, 199.1 | 72261 |
| 2014 WN4 | L2 | AMO | 2038-12-25, 514.6 | 11.606 | 8.901 | 35.909 | -27.008 | 2040-06-14, 199.1 | 72253 |
| 2024 XL5 | L2 | AMO | 2039-01-22, 514.6 | 13.518 | 4.749 | 31.659 | -26.910 | 2040-07-01, 182.5 | 72296 |
| 482562 | L1 | APO | 2039-10-01, 265.5 | 12.117 | 13.749 | 39.897 | -26.148 | 2040-07-01, 182.5 | 72299 |
| 414P | L2 | JFC | 2038-12-04, 547.8 | 47.091 | 13.576 | 39.541 | -25.965 | 2040-06-12, 199.1 | 72278 |

**Secondary — largest overcharge**

| Body | tier | class | outbound dep, TOF d | C3 | assumed | computed | error | return dep, TOF d | refused cells |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| 2012 NJ | L2 | HTC | 2027-08-26, 1826.3 | 124.342 | 11.867 | 1.912 | 9.955 | 2032-09-26, 1411.2 | 0 |
| 2020 P4-B | L2 | ETC | 2035-10-06, 298.7 | 58.769 | 11.616 | 3.119 | 8.497 | 2038-04-01, 365.1 | 25675 |
| 2023 RU12 | L2 | APO | 2033-04-01, 365.1 | 20.831 | 8.821 | 0.660 | 8.162 | 2036-02-05, 282.1 | 303 |
| 2019 VE3 | L2 | APO | 2032-03-19, 398.3 | 31.963 | 9.359 | 1.367 | 7.992 | 2033-05-06, 182.5 | 0 |
| 2022 SC6 | L1 | APO | 2030-05-23, 248.9 | 50.038 | 9.163 | 1.201 | 7.962 | 2031-08-11, 464.8 | 0 |
| 374158 | L1 | APO | 2030-05-23, 365.1 | 176.585 | 8.869 | 0.990 | 7.879 | 2032-02-10, 630.8 | 0 |
| 2004 QX2 | L2 | APO | 2036-01-26, 481.4 | 169.465 | 8.077 | 0.391 | 7.686 | 2038-12-29, 232.3 | 38509 |
| 489900 | L2 | APO | 2033-12-16, 298.7 | 192.724 | 11.571 | 3.984 | 7.587 | 2036-10-10, 232.3 | 2582 |
| 2020 JL | L2 | AMO | 2028-04-27, 464.8 | 268.181 | 8.578 | 1.013 | 7.565 | 2030-10-15, 564.4 | 0 |
| 2025 QH4 | L2 | APO | 2028-02-24, 597.6 | 159.022 | 8.383 | 0.821 | 7.562 | 2029-11-10, 846.6 | 0 |

**Secondary — largest undercharge**

| Body | tier | class | outbound dep, TOF d | C3 | assumed | computed | error | return dep, TOF d | refused cells |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| 20D | L2 | HTC | 2037-11-21, 879.8 | 277.254 | 4.136 | 79.678 | -75.542 | 2040-04-27, 232.3 | 72137 |
| 2023 WQ7 | L2 | APO | 2035-05-26, 1826.3 | 266.999 | 0.855 | 63.733 | -62.878 | 2040-06-02, 199.1 | 72257 |
| 2005 T4 | L2 | HTC | 2034-11-03, 1826.3 | 249.978 | 5.814 | 64.233 | -58.419 | 2039-11-24, 398.3 | 70551 |
| 2015 HX176 | L2 | APO | 2038-04-03, 763.6 | 533.888 | 0.241 | 54.707 | -54.466 | 2040-05-14, 215.7 | 72203 |
| 2001 SS287 | L2 | AMO | 2036-11-08, 1294.9 | 117.918 | 1.078 | 42.840 | -41.761 | 2040-06-14, 199.1 | 72259 |
| 2017 HZ48 | L2 | APO | 2039-04-23, 414.9 | 45.905 | 0.616 | 41.769 | -41.153 | 2040-06-19, 182.5 | 72288 |
| 2022 GK2 | L2 | APO | 2038-07-24, 697.2 | 75.496 | 2.521 | 42.659 | -40.138 | 2040-06-30, 182.5 | 72297 |
| 2021 UM | L2 | AMO | 2038-10-23, 581.0 | 184.319 | 0.436 | 38.379 | -37.943 | 2040-06-14, 199.1 | 72260 |
| 2017 SR12 | L2 | AMO | 2038-10-30, 597.6 | 85.696 | 1.262 | 38.854 | -37.592 | 2040-07-01, 182.5 | 72295 |
| 2020 RO9 | L2 | AMO | 2038-11-06, 564.4 | 72.806 | 0.912 | 38.283 | -37.371 | 2040-06-14, 199.1 | 72255 |

## Files
- `lr2-symmetric-0of3.json` — 13969 rows, 4444121 bytes, sha256 0a908632da8966ddd3aad2c3e993af8d59c1f1870c314bb9b38130b38038db59
- `lr2-symmetric-1of3.json` — 13969 rows, 4441232 bytes, sha256 8dae1036b6e93e00031ba9f52b6b517471935f9c3c3bd5689438992889b80464
- `lr2-symmetric-2of3.json` — 13968 rows, 4440022 bytes, sha256 88a61427acf02b37f91a89b4a8951dea93c1b3c0d7163b30ce6bc4f880a96083
- `lr2-summary.json` — every aggregate above.
- `lookup-verification.json` — the LR2.1 gate result for the indexed Earth lookup.
- `verify-lookup.mjs`, `run-shard.mjs`, `summarize.mjs` — see README.md.

