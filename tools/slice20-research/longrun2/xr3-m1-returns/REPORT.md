# XR3 — LR2 with M=1 returns admitted

**LEADS-grade research evidence. Not validated. Nothing here enters a DEC, a test, a fixture or the site.**

State: **PARTIAL: 20506 of 41906** (LR2's seeded shuffle 2026111302, 4 shards; a partial run is the same kind of unbiased sample LR2's was). Status: all-return-cells-refused 697; ok 19,592; no-practical-window 217.

This XR reuses LR2's committed pipeline on purpose: `run-shard-m1.mjs` is a copy of LR2's `run-shard.mjs` with the return leg run at M=0 and M=1 (its header lists every change). It measures the effect of M=1, not the pipeline. The pipeline itself is what XR0 cross-checks.

**M=0 values against LR2's committed rows, same bodies:** 20,506 compared; primary error equal at 6 decimals for 20,506, primary computed for 20,506, secondary error for 20,506, status for 20,506.

## PRIMARY - compare path best practical window

| Bodies (paired) | returns | median \|error\| | p90 \|error\| | overcharge share | inside 0.08-5.1 km/s | above 5.1 | median computed km/s |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| all: 19,592 | M=0 only (LR2) | 8.998 | 17.950 | 97.3% | 18.9% | 81.0% | 1.396 |
|  | M=0 and M=1 | 9.280 | 18.182 | 97.4% | 16.4% | 83.5% | 1.065 |
| complete pairing windows: 10,886 | M=0 only (LR2) | 9.492 | 18.303 | 99.7% | 13.8% | 86.2% | 1.147 |
|  | M=0 and M=1 | 9.870 | 18.584 | 99.9% | 10.6% | 89.4% | 0.810 |
| truncated pairing windows: 8,706 | M=0 only (LR2) | 8.238 | 17.424 | 94.2% | 25.3% | 74.4% | 1.899 |
|  | M=0 and M=1 | 8.437 | 17.578 | 94.2% | 23.6% | 76.1% | 1.608 |
| tier L0: 2 | M=0 only (LR2) | 16.419 | 19.114 | 100.0% | 0.0% | 100.0% | 2.020 |
|  | M=0 and M=1 | 16.419 | 19.114 | 100.0% | 0.0% | 100.0% | 2.020 |
| tier L1: 4,792 | M=0 only (LR2) | 7.340 | 14.909 | 97.5% | 30.7% | 69.0% | 1.488 |
|  | M=0 and M=1 | 7.750 | 15.274 | 97.9% | 26.7% | 73.0% | 1.064 |
| tier L2: 14,798 | M=0 only (LR2) | 9.474 | 18.639 | 97.2% | 15.1% | 84.8% | 1.367 |
|  | M=0 and M=1 | 9.758 | 18.834 | 97.2% | 13.0% | 86.9% | 1.066 |

**How often an M=1 cell is the minimum:** 9,939 of 19,592 bodies (50.7%); left branch 9,323, right branch 616. Complete windows only: 7,134 of 10,886 (65.5%).
**By how much it beats the best M=0 cell when it does:** median 0.395 km/s, p90 1.360, p99 3.023, max 15.073; median relative gain 30.1%.
Error sign changes when M=1 is admitted: 24 bodies (24 from undercharge to overcharge; the computed value can only go down, so the error can only go up).
**Is the minimum a through-Sun arc? (beyond the dispatch)** Using LR1's flag on the chosen cells: the M=0 minimum is flagged for 1 bodies, the M=1 minimum for 8, the overall minimum for 1 (0 of them M=1). M=1 "wins" only because of a flagged arc for 0 bodies. Excluding flagged cells changes the minimum for 1 bodies (median increase 2.598 km/s, max 2.598). Over unflagged cells only, M=0 and M=1: median |error| 9.280 km/s, p90 18.182, overcharge share 97.4%, inside 0.08-5.1 km/s 16.4%; an M=1 cell is the minimum for 9,939 bodies (50.7%).
Return cells: 1,079,198,774 converged at M=0; 634,022,097 cells have a converged M=1 branch, 445,176,677 admissible cells have none; 387,695,926 refused. Bodies where only M=1 converges: 0.

Ten largest gains from M=1:
| Body | tier | class | best M=0 | best overall | branch | gain | error M=0 | error with M=1 | refused cells |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 2010 UB | L2 | APO | 35.387 | 20.315 | right | 15.073 | -31.384 | -16.311 | 72,200 |
| 2024 XY6 | L2 | AMO | 42.666 | 30.574 | right | 12.092 | -36.085 | -23.993 | 72,284 |
| 2025 GN1 | L1 | IEO | 11.235 | 3.042 | right | 8.193 | 10.539 | 18.733 | 0 |
| 2023 WK3 | L1 | IEO | 8.542 | 1.789 | left | 6.752 | 6.272 | 13.025 | 61,222 |
| 138127 | L1 | ATE | 8.606 | 2.036 | left | 6.570 | 7.254 | 13.824 | 0 |
| 2011 KY15 | L2 | ATE | 8.565 | 1.995 | left | 6.570 | 4.671 | 11.241 | 8,488 |
| 2025 AX | L1 | ATE | 8.318 | 2.296 | right | 6.022 | 13.775 | 19.797 | 47,263 |
| 2025 XN3 | L1 | ATE | 8.264 | 2.428 | left | 5.835 | 4.309 | 10.145 | 16,524 |
| 2005 WS3 | L1 | ATE | 8.185 | 2.447 | left | 5.738 | 5.460 | 11.198 | 0 |
| 2019 TL6 | L2 | ATE | 7.294 | 1.634 | left | 5.660 | 5.998 | 11.658 | 14,246 |

## SECONDARY - best sample-return stack cell (beyond the original LR2 dispatch)

| Bodies (paired) | returns | median \|error\| | p90 \|error\| | overcharge share | inside 0.08-5.1 km/s | above 5.1 | median computed km/s |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| all: 18,529 | M=0 only (LR2) | 0.771 | 3.138 | 33.6% | 87.8% | 5.5% | 1.493 |
|  | M=0 and M=1 | 0.524 | 3.021 | 47.1% | 84.6% | 5.5% | 1.079 |
| complete pairing windows: 9,787 | M=0 only (LR2) | 0.619 | 2.023 | 40.2% | 91.8% | 0.4% | 1.234 |
|  | M=0 and M=1 | 0.402 | 1.573 | 58.5% | 87.2% | 0.5% | 0.830 |
| truncated pairing windows: 8,742 | M=0 only (LR2) | 1.050 | 5.510 | 26.2% | 83.3% | 11.1% | 1.932 |
|  | M=0 and M=1 | 0.799 | 5.435 | 34.4% | 81.6% | 11.0% | 1.542 |
| tier L0: 1 | M=0 only (LR2) | 1.843 | 1.843 | 100.0% | 100.0% | 0.0% | 0.191 |
|  | M=0 and M=1 | 1.843 | 1.843 | 100.0% | 100.0% | 0.0% | 0.191 |
| tier L1: 4,731 | M=0 only (LR2) | 0.924 | 2.638 | 23.7% | 91.0% | 3.2% | 1.616 |
|  | M=0 and M=1 | 0.547 | 2.118 | 37.9% | 87.3% | 3.2% | 1.078 |
| tier L2: 13,797 | M=0 only (LR2) | 0.722 | 3.491 | 37.0% | 86.7% | 6.2% | 1.448 |
|  | M=0 and M=1 | 0.518 | 3.417 | 50.3% | 83.6% | 6.2% | 1.079 |

**How often an M=1 cell is the minimum:** 11,109 of 18,529 bodies (60.0%); left branch 8,147, right branch 2,962. Complete windows only: 7,266 of 9,787 (74.2%).
**By how much it beats the best M=0 cell when it does:** median 0.389 km/s, p90 1.506, p99 2.791, max 14.712; median relative gain 28.5%.
Error sign changes when M=1 is admitted: 2,500 bodies (2,500 from undercharge to overcharge; the computed value can only go down, so the error can only go up).
**Is the minimum a through-Sun arc? (beyond the dispatch)** Using LR1's flag on the chosen cells: the M=0 minimum is flagged for 3 bodies, the M=1 minimum for 2, the overall minimum for 3 (0 of them M=1). M=1 "wins" only because of a flagged arc for 0 bodies. Excluding flagged cells changes the minimum for 3 bodies (median increase 0.336 km/s, max 1.168). Over unflagged cells only, M=0 and M=1: median |error| 0.524 km/s, p90 3.021, overcharge share 47.1%, inside 0.08-5.1 km/s 84.6%; an M=1 cell is the minimum for 11,109 bodies (60.0%).
Return cells: 1,008,529,577 converged at M=0; 645,834,415 cells have a converged M=1 branch, 362,695,162 admissible cells have none; 474,054,223 refused. Bodies where only M=1 converges: 0.

Ten largest gains from M=1:
| Body | tier | class | best M=0 | best overall | branch | gain | error M=0 | error with M=1 | refused cells |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 2025 BM | L2 | APO | 31.917 | 17.205 | right | 14.712 | -31.646 | -16.934 | 72,112 |
| 2006 WZ184 | L2 | APO | 27.884 | 16.418 | right | 11.466 | -27.586 | -16.120 | 72,085 |
| 2022 BR5 | L2 | APO | 28.685 | 18.119 | right | 10.566 | -27.668 | -17.102 | 72,081 |
| 2025 GN1 | L1 | IEO | 11.235 | 3.042 | right | 8.193 | -5.402 | 2.790 | 0 |
| 2020 YK | L2 | APO | 10.381 | 2.861 | left | 7.520 | -6.338 | 1.181 | 64,726 |
| 99907 | L2 | ATE | 9.164 | 2.692 | left | 6.473 | -0.564 | 5.909 | 23,361 |
| 2025 FV11 | L1 | APO | 12.234 | 6.214 | left | 6.020 | -10.440 | -4.420 | 68,962 |
| 2016 QE84 | L2 | APO | 9.130 | 3.913 | left | 5.217 | -5.666 | -0.449 | 64,127 |
| 2019 TL6 | L2 | ATE | 6.325 | 1.559 | left | 4.767 | -2.540 | 2.227 | 0 |
| 2011 KY15 | L2 | ATE | 8.158 | 3.439 | left | 4.719 | -5.228 | -0.509 | 14,833 |

## Files
- `xr3-m1-0of4.json` — 5715 rows, 1556092 bytes, sha256 9b0a62af12907178ba04ab47d9d6c4fc397d5684f329b44a509645e8938675e2
- `xr3-m1-1of4.json` — 5086 rows, 1385263 bytes, sha256 40280360c55427f4ab7b8e1aa49e22a0447a873d273268f2aa721206c1334d67
- `xr3-m1-2of4.json` — 5048 rows, 1375512 bytes, sha256 49acf8bee38ba22de3fa2c9f4c4ad7dad738c1a66a79919a455d0ceced9fc754
- `xr3-m1-3of4.json` — 4657 rows, 1267092 bytes, sha256 c5f198c08fc77de5a1f97067eabeff7985973963dfcb8e0299795c06da409f70
- `xr3-summary.json` — every aggregate above; `run-shard-m1.mjs`, `summarize.mjs`.

