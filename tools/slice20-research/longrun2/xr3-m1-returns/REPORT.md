# XR3 — LR2 with M=1 returns admitted

**LEADS-grade research evidence. Not validated. Nothing here enters a DEC, a test, a fixture or the site.**

State: **COMPLETE** (LR2's seeded shuffle 2026111302, 4 shards; a partial run is the same kind of unbiased sample LR2's was). Status: all-return-cells-refused 1,451; ok 39,993; no-practical-window 461; outbound-refused:not-propagatable 1.

This XR reuses LR2's committed pipeline on purpose: `run-shard-m1.mjs` is a copy of LR2's `run-shard.mjs` with the return leg run at M=0 and M=1 (its header lists every change). It measures the effect of M=1, not the pipeline. The pipeline itself is what XR0 cross-checks.

**M=0 values against LR2's committed rows, same bodies:** 41,906 compared; primary error equal at 6 decimals for 41,906, primary computed for 41,906, secondary error for 41,906, status for 41,906.

## PRIMARY - compare path best practical window

| Bodies (paired) | returns | median \|error\| | p90 \|error\| | overcharge share | inside 0.08-5.1 km/s | above 5.1 | median computed km/s |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| all: 39,993 | M=0 only (LR2) | 8.972 | 17.838 | 97.3% | 18.8% | 81.0% | 1.401 |
|  | M=0 and M=1 | 9.262 | 18.062 | 97.4% | 16.2% | 83.6% | 1.065 |
| complete pairing windows: 22,210 | M=0 only (LR2) | 9.453 | 18.237 | 99.7% | 13.8% | 86.2% | 1.156 |
|  | M=0 and M=1 | 9.840 | 18.541 | 99.9% | 10.5% | 89.5% | 0.820 |
| truncated pairing windows: 17,783 | M=0 only (LR2) | 8.245 | 17.302 | 94.3% | 25.1% | 74.6% | 1.892 |
|  | M=0 and M=1 | 8.452 | 17.465 | 94.4% | 23.3% | 76.3% | 1.599 |
| tier L0: 10 | M=0 only (LR2) | 10.546 | 18.170 | 100.0% | 0.0% | 100.0% | 0.604 |
|  | M=0 and M=1 | 10.827 | 18.170 | 100.0% | 0.0% | 100.0% | 0.435 |
| tier L1: 9,875 | M=0 only (LR2) | 7.379 | 15.052 | 97.8% | 30.3% | 69.5% | 1.493 |
|  | M=0 and M=1 | 7.809 | 15.432 | 98.2% | 26.0% | 73.7% | 1.064 |
| tier L2: 30,108 | M=0 only (LR2) | 9.457 | 18.529 | 97.1% | 15.0% | 84.8% | 1.372 |
|  | M=0 and M=1 | 9.744 | 18.767 | 97.2% | 13.0% | 86.9% | 1.065 |

**How often an M=1 cell is the minimum:** 20,455 of 39,993 bodies (51.1%); left branch 19,208, right branch 1,247. Complete windows only: 14,626 of 22,210 (65.9%).
**By how much it beats the best M=0 cell when it does:** median 0.402 km/s, p90 1.370, p99 3.027, max 15.073; median relative gain 30.2%.
Error sign changes when M=1 is admitted: 52 bodies (52 from undercharge to overcharge; the computed value can only go down, so the error can only go up).
**Is the minimum a through-Sun arc? (beyond the dispatch)** Using LR1's flag on the chosen cells: the M=0 minimum is flagged for 1 body, the M=1 minimum for 15 bodies, the overall minimum for 1 body (0 of them M=1). M=1 "wins" only because of a flagged arc for 0 bodies. Excluding flagged cells changes the minimum for 1 body (median increase 2.598 km/s, max 2.598). Over unflagged cells only, M=0 and M=1: median |error| 9.262 km/s, p90 18.062, overcharge share 97.4%, inside 0.08-5.1 km/s 16.2%; an M=1 cell is the minimum for 20,455 bodies (51.1%).
Bodies whose chosen minimum (LR2's M=0 value or the overall one) is a flagged arc, every one listed. Note the refused-cell counts: each pairing window lost most of its 72,300 cells to the fixture end, so the minimum was taken over 10 admissible cells.
| Body | tier | class | minimum km/s | M | transfer perihelion AU | eccentricity | return TOF d | minimum over unflagged cells | admissible / refused cells |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 154300 | L1 | APO | 14.936 | 0 | 0.00311 | 0.9965109 | 182.5 | 17.534 | 10 / 72,290 |

Return cells: 2,203,616,711 converged at M=0; 1,296,031,188 cells have a converged M=1 branch, 907,585,524 admissible cells have none; 792,784,488 refused. Bodies where only M=1 converges: 0.

Ten largest gains from M=1:
| Body | tier | class | best M=0 | best overall | branch | gain | error M=0 | error with M=1 | refused cells |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 2010 UB | L2 | APO | 35.387 | 20.315 | right | 15.073 | -31.384 | -16.311 | 72,200 |
| 2014 WN4 | L2 | AMO | 35.909 | 23.096 | right | 12.813 | -27.008 | -14.195 | 72,253 |
| 2024 XY6 | L2 | AMO | 42.666 | 30.574 | right | 12.092 | -36.085 | -23.993 | 72,284 |
| 66391 | L1 | ATE | 11.759 | 0.722 | left | 11.037 | 8.893 | 19.929 | 22,783 |
| 2021 PH27 | L1 | IEO | 12.014 | 3.504 | right | 8.510 | 10.159 | 18.669 | 0 |
| 2025 GN1 | L1 | IEO | 11.235 | 3.042 | right | 8.193 | 10.539 | 18.733 | 0 |
| 2023 WK3 | L1 | IEO | 8.542 | 1.789 | left | 6.752 | 6.272 | 13.025 | 61,222 |
| 480808 | L1 | ATE | 8.430 | 1.697 | left | 6.734 | 6.517 | 13.251 | 0 |
| 138127 | L1 | ATE | 8.606 | 2.036 | left | 6.570 | 7.254 | 13.824 | 0 |
| 2011 KY15 | L2 | ATE | 8.565 | 1.995 | left | 6.570 | 4.671 | 11.241 | 8,488 |

## SECONDARY - best sample-return stack cell (beyond the original LR2 dispatch)

| Bodies (paired) | returns | median \|error\| | p90 \|error\| | overcharge share | inside 0.08-5.1 km/s | above 5.1 | median computed km/s |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| all: 37,842 | M=0 only (LR2) | 0.775 | 3.194 | 33.7% | 87.3% | 5.6% | 1.497 |
|  | M=0 and M=1 | 0.526 | 3.082 | 47.0% | 84.2% | 5.6% | 1.076 |
| complete pairing windows: 20,019 | M=0 only (LR2) | 0.612 | 2.035 | 40.3% | 91.3% | 0.4% | 1.235 |
|  | M=0 and M=1 | 0.399 | 1.547 | 58.4% | 87.0% | 0.5% | 0.828 |
| truncated pairing windows: 17,823 | M=0 only (LR2) | 1.065 | 5.644 | 26.3% | 82.9% | 11.4% | 1.940 |
|  | M=0 and M=1 | 0.813 | 5.553 | 34.2% | 81.2% | 11.3% | 1.552 |
| tier L0: 6 | M=0 only (LR2) | 0.251 | 1.068 | 33.3% | 100.0% | 0.0% | 0.763 |
|  | M=0 and M=1 | 0.482 | 1.553 | 83.3% | 100.0% | 0.0% | 0.344 |
| tier L1: 9,717 | M=0 only (LR2) | 0.919 | 2.676 | 24.0% | 90.4% | 3.3% | 1.614 |
|  | M=0 and M=1 | 0.535 | 2.097 | 38.1% | 86.7% | 3.2% | 1.058 |
| tier L2: 28,119 | M=0 only (LR2) | 0.728 | 3.544 | 37.0% | 86.3% | 6.4% | 1.455 |
|  | M=0 and M=1 | 0.522 | 3.494 | 50.1% | 83.4% | 6.4% | 1.084 |

**How often an M=1 cell is the minimum:** 22,586 of 37,842 bodies (59.7%); left branch 16,593, right branch 5,993. Complete windows only: 14,855 of 20,019 (74.2%).
**By how much it beats the best M=0 cell when it does:** median 0.389 km/s, p90 1.534, p99 2.840, max 14.712; median relative gain 28.8%.
Error sign changes when M=1 is admitted: 5,033 bodies (5,033 from undercharge to overcharge; the computed value can only go down, so the error can only go up).
**Is the minimum a through-Sun arc? (beyond the dispatch)** Using LR1's flag on the chosen cells: the M=0 minimum is flagged for 6 bodies, the M=1 minimum for 3 bodies, the overall minimum for 6 bodies (0 of them M=1). M=1 "wins" only because of a flagged arc for 0 bodies. Excluding flagged cells changes the minimum for 5 bodies (median increase 1.168 km/s, max 4.563). Over unflagged cells only, M=0 and M=1: median |error| 0.526 km/s, p90 3.082, overcharge share 47.0%, inside 0.08-5.1 km/s 84.2%; an M=1 cell is the minimum for 22,586 bodies (59.7%).
Bodies whose chosen minimum (LR2's M=0 value or the overall one) is a flagged arc, every one listed. Note the refused-cell counts: each pairing window lost most of its 72,300 cells to the fixture end, so the minimum was taken over 3 to 1,101 admissible cells.
| Body | tier | class | minimum km/s | M | transfer perihelion AU | eccentricity | return TOF d | minimum over unflagged cells | admissible / refused cells |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 523822 | L2 | APO | 30.753 | 0 | 0.000946 | 1.001039 | 199.1 | 35.316 | 43 / 72,257 |
| 2025 NT1 | L2 | AMO | 15.514 | 0 | 0.000566 | 0.9997397 | 365.1 | 15.850 | 1,101 / 71,199 |
| 2017 FA102 | L1 | APO | 14.765 | 0 | 0.000278 | 0.9998622 | 199.1 | 15.932 | 21 / 72,279 |
| 2022 FC2 | L2 | APO | 15.009 | 0 | 0.00176 | 0.998793 | 182.5 | 18.668 | 10 / 72,290 |
| 2023 TJ | L2 | APO | 16.568 | 0 | 0.00403 | 0.9990212 | 182.5 | 16.645 | 14 / 72,286 |
| 2022 GK2 | L2 | APO | 42.659 | 0 | 0.00199 | 1.002897 | 182.5 | none (every admissible cell is flagged) | 3 / 72,297 |

Return cells: 2,057,424,637 converged at M=0; 1,317,855,474 cells have a converged M=1 branch, 739,569,163 admissible cells have none; 972,306,863 refused. Bodies where only M=1 converges: 0.

Ten largest gains from M=1:
| Body | tier | class | best M=0 | best overall | branch | gain | error M=0 | error with M=1 | refused cells |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 2025 BM | L2 | APO | 31.917 | 17.205 | right | 14.712 | -31.646 | -16.934 | 72,112 |
| 2017 HZ48 | L2 | APO | 41.769 | 29.566 | right | 12.202 | -41.153 | -28.950 | 72,288 |
| 2006 WZ184 | L2 | APO | 27.884 | 16.418 | right | 11.466 | -27.586 | -16.120 | 72,085 |
| 2022 BR5 | L2 | APO | 28.685 | 18.119 | right | 10.566 | -27.668 | -17.102 | 72,081 |
| 2025 GN1 | L1 | IEO | 11.235 | 3.042 | right | 8.193 | -5.402 | 2.790 | 0 |
| 2020 YK | L2 | APO | 10.381 | 2.861 | left | 7.520 | -6.338 | 1.181 | 64,726 |
| 2021 PH27 | L1 | IEO | 10.974 | 3.530 | right | 7.444 | -5.116 | 2.328 | 0 |
| 66391 | L1 | ATE | 10.819 | 3.720 | left | 7.098 | -6.446 | 0.652 | 62,103 |
| 99907 | L2 | ATE | 9.164 | 2.692 | left | 6.473 | -0.564 | 5.909 | 23,361 |
| 2010 LK68 | L2 | APO | 30.833 | 24.804 | right | 6.029 | -30.339 | -24.310 | 72,176 |

## Files
- `xr3-m1-0of4.json` — 10477 rows, 2851726 bytes, sha256 d3a00190341f7c546b64c2a4ff2a5c40f89bf9006967cf0e9578b5e663efb7f9
- `xr3-m1-1of4.json` — 10477 rows, 2851506 bytes, sha256 47c17777695852ba3b4f2d9c3870e9a358fedd14b5d4db87574b1f3787071024
- `xr3-m1-2of4.json` — 10476 rows, 2851572 bytes, sha256 fb84bfa2af38631baa91eee6df193fdd131b95d5b6e5189ece5aef858ceac6fd
- `xr3-m1-3of4.json` — 10476 rows, 2849207 bytes, sha256 27f34f48b1174bd4fece6428c4414b325157afa0cf94826322c861123c97bac6
- `xr3-summary.json` — every aggregate above; `run-shard-m1.mjs`, `summarize.mjs`.

