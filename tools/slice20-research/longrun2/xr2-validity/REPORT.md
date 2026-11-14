# XR2 — physical-validity census of the outbound and return grids

**LEADS-grade research evidence. Nothing here enters a DEC, a test, a fixture or the site.**

State: **COMPLETE** (outbound). A cell is *flagged* when its transfer orbit's perihelion is below one solar radius (695,700 km) **and** the flown arc passes perihelion: LR1's definition, copied with its source lines cited in `lib/common2.mjs`.

## The ruling-critical count
**Flagged cells that are, or are inside, a window the site shows: 0.**

| What is shown | checked | flagged |
| --- | ---: | ---: |
| The cache's minC3 cell (one per body) | 41,905 | 0 |
| The cache's bestWindows (up to five per body) | 209,525 | 0 |
| Compare's bestPractical window: the argmin cell | 41,444 | 0 |
| Compare's bestPractical window: any cell of the window | 41,444 windows, 1,364,717 cells | 0 windows, 0 cells |

**Zero.** No shipped minimum-C3 cell, no cached best window and no cell of any compare best-practical window flies through the Sun. On this evidence a perihelion refusal would change no number the site shows today; it would only remove cells nobody is shown as a best window.

Context: 0 compare windows contain a cell whose orbit has its perihelion inside the Sun but whose flown arc does not reach it (not flagged). The smallest transfer perihelion inside any compare window is 0.477 AU. Cache cells that could not be matched to the swept grid: 0.
The V2 site reads the cache's status, minC3 and isCoOrbital; no non-test module reads `bestWindows`, and `minC3Date` / `minC3TofDays` are returned only by the MCP tool (see XR1).

## Outbound, screening grid (the cache's grid)
783 departures (2026-01-01, 7 d steps) x 55 TOF (182 to 1802 d, 30 d steps) per body, swept with the production kernel `computePorkchopGrid` (lambert-multi-rev at M=0). The precompute script could not be instrumented without editing it. Bodies not propagatable: 2015 D1.

|  | bodies | cells swept | converged | flagged | flagged share | bodies with >= 1 flagged | perihelion < 1 solar radius | < 0.01 AU | < 0.1 AU | hyperbolic |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **all** | 41,905 | 1,804,638,825 | 1,804,638,824 | 5,563,614 | 0.308% | 39,920 | 2.414% | 4.145% | 17.13% | 16,302,520 |
| tier L0 | 10 | 430,650 | 430,650 | 3,156 | 0.733% | 10 | 3.165% | 5.035% | 18.17% | 10,053 |
| tier L1 | 10,150 | 437,109,750 | 437,109,749 | 669,844 | 0.153% | 9,168 | 2.772% | 4.627% | 17.55% | 907,576 |
| tier L2 | 31,745 | 1,367,098,425 | 1,367,098,425 | 4,890,614 | 0.358% | 30,742 | 2.299% | 3.990% | 17.00% | 15,384,891 |
| class AMO | 14,516 | 625,131,540 | 625,131,540 | 2,174,098 | 0.348% | 14,431 | 2.192% | 3.857% | 16.76% | 6,452,598 |
| class APO | 23,757 | 1,023,095,205 | 1,023,095,204 | 3,173,628 | 0.310% | 22,096 | 2.479% | 4.215% | 17.12% | 7,857,471 |
| class ATE | 3,387 | 145,861,155 | 145,861,155 | 67,146 | 0.046% | 3,150 | 2.875% | 4.824% | 18.59% | 0 |
| class ETC | 6 | 258,390 | 258,390 | 1,195 | 0.462% | 6 | 2.121% | 3.957% | 17.11% | 5,058 |
| class HTC | 36 | 1,550,340 | 1,550,340 | 76,782 | 4.953% | 36 | 5.033% | 8.430% | 27.35% | 1,353,387 |
| class IEO | 38 | 1,636,470 | 1,636,470 | 1,065 | 0.065% | 37 | 2.134% | 4.232% | 20.98% | 0 |
| class JFC | 165 | 7,105,725 | 7,105,725 | 69,700 | 0.981% | 164 | 2.501% | 4.463% | 18.41% | 634,006 |

Flagged cells per body: min 0, median 58, max 6297.

Transfer perihelion over all converged cells, deciles in AU (bin upper edges, 0.01 dex bins):
|  | p10 | p20 | p30 | p40 | p50 | p60 | p70 | p80 | p90 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **all** | 0.0398 | 0.132 | 0.263 | 0.407 | 0.562 | 0.708 | 0.832 | 0.933 | 0.977 |
| tier L0 | 0.0339 | 0.120 | 0.251 | 0.398 | 0.562 | 0.708 | 0.832 | 0.912 | 0.977 |
| tier L1 | 0.0363 | 0.129 | 0.257 | 0.407 | 0.550 | 0.692 | 0.813 | 0.912 | 0.977 |
| tier L2 | 0.0417 | 0.135 | 0.263 | 0.417 | 0.562 | 0.708 | 0.832 | 0.933 | 1.00 |
| class AMO | 0.0427 | 0.138 | 0.269 | 0.427 | 0.575 | 0.724 | 0.851 | 0.933 | 1.00 |
| class APO | 0.0398 | 0.132 | 0.263 | 0.417 | 0.562 | 0.708 | 0.832 | 0.933 | 0.977 |
| class ATE | 0.0331 | 0.115 | 0.234 | 0.363 | 0.501 | 0.631 | 0.741 | 0.851 | 0.955 |
| class ETC | 0.0437 | 0.132 | 0.257 | 0.398 | 0.537 | 0.676 | 0.813 | 0.933 | 1.00 |
| class HTC | 0.0135 | 0.0513 | 0.126 | 0.240 | 0.389 | 0.562 | 0.741 | 0.891 | 0.977 |
| class IEO | 0.0309 | 0.0933 | 0.182 | 0.275 | 0.380 | 0.479 | 0.589 | 0.692 | 0.794 |
| class JFC | 0.0347 | 0.117 | 0.240 | 0.389 | 0.537 | 0.692 | 0.813 | 0.933 | 1.00 |

## Outbound, compare grid
731 departures x 100 TOF per body through the production `computeCompareData`, the grid the compare page computes live.

|  | bodies | cells swept | converged | flagged | flagged share | bodies with >= 1 flagged | perihelion < 1 solar radius | < 0.01 AU | < 0.1 AU | hyperbolic |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **all** | 41,905 | 3,063,255,500 | 3,063,255,500 | 9,297,858 | 0.304% | 40,237 | 2.417% | 4.150% | 17.15% | 24,953,775 |
| tier L0 | 10 | 731,000 | 731,000 | 5,253 | 0.719% | 10 | 3.144% | 5.049% | 18.17% | 15,829 |
| tier L1 | 10,150 | 741,965,000 | 741,965,000 | 1,119,437 | 0.151% | 9,335 | 2.781% | 4.640% | 17.58% | 1,341,249 |
| tier L2 | 31,745 | 2,320,559,500 | 2,320,559,500 | 8,173,168 | 0.352% | 30,892 | 2.300% | 3.992% | 17.01% | 23,596,697 |
| class AMO | 14,516 | 1,061,119,600 | 1,061,119,600 | 3,633,217 | 0.342% | 14,443 | 2.195% | 3.861% | 16.77% | 9,772,775 |
| class APO | 23,757 | 1,736,636,700 | 1,736,636,700 | 5,303,690 | 0.305% | 22,344 | 2.483% | 4.220% | 17.13% | 11,868,283 |
| class ATE | 3,387 | 247,589,700 | 247,589,700 | 113,425 | 0.046% | 3,206 | 2.878% | 4.833% | 18.63% | 0 |
| class ETC | 6 | 438,600 | 438,600 | 1,979 | 0.451% | 6 | 2.093% | 3.935% | 17.07% | 8,066 |
| class HTC | 36 | 2,631,600 | 2,631,600 | 126,544 | 4.809% | 36 | 4.887% | 8.244% | 27.10% | 2,283,518 |
| class IEO | 38 | 2,777,800 | 2,777,800 | 1,848 | 0.067% | 38 | 2.161% | 4.276% | 21.02% | 0 |
| class JFC | 165 | 12,061,500 | 12,061,500 | 117,155 | 0.971% | 164 | 2.500% | 4.461% | 18.37% | 1,021,133 |

Flagged cells per body: min 0, median 96, max 10481.

Transfer perihelion over all converged cells, deciles in AU (bin upper edges, 0.01 dex bins):
|  | p10 | p20 | p30 | p40 | p50 | p60 | p70 | p80 | p90 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **all** | 0.0398 | 0.132 | 0.263 | 0.407 | 0.562 | 0.708 | 0.832 | 0.933 | 0.977 |
| tier L0 | 0.0331 | 0.120 | 0.251 | 0.407 | 0.562 | 0.708 | 0.832 | 0.912 | 0.977 |
| tier L1 | 0.0363 | 0.129 | 0.257 | 0.407 | 0.550 | 0.692 | 0.813 | 0.912 | 0.977 |
| tier L2 | 0.0417 | 0.135 | 0.263 | 0.417 | 0.562 | 0.708 | 0.832 | 0.933 | 1.00 |
| class AMO | 0.0427 | 0.138 | 0.269 | 0.427 | 0.575 | 0.724 | 0.851 | 0.933 | 1.00 |
| class APO | 0.0398 | 0.132 | 0.263 | 0.417 | 0.562 | 0.708 | 0.832 | 0.933 | 0.977 |
| class ATE | 0.0331 | 0.115 | 0.234 | 0.363 | 0.501 | 0.631 | 0.741 | 0.851 | 0.955 |
| class ETC | 0.0447 | 0.132 | 0.257 | 0.398 | 0.537 | 0.676 | 0.813 | 0.933 | 1.00 |
| class HTC | 0.0138 | 0.0525 | 0.126 | 0.240 | 0.389 | 0.575 | 0.741 | 0.891 | 0.977 |
| class IEO | 0.0302 | 0.0933 | 0.178 | 0.275 | 0.380 | 0.479 | 0.589 | 0.692 | 0.794 |
| class JFC | 0.0347 | 0.117 | 0.240 | 0.389 | 0.537 | 0.692 | 0.813 | 0.933 | 1.00 |

## Bonus from the same sweep: kernel minimum C3 against the shipped cache, every body
bonus from the same sweep: the kernel (lambert-multi-rev, M=0) minimum over the screening grid against the shipped izzo value, ALL bodies. The kernel reaches each departure epoch through a Julian date, so its epochs differ from the script's by rounding (well under a millisecond); XR1 step 5 repeats this on identical epochs for 300 bodies.
Bodies 41,905: max relative difference 1.199e-8, median 8.440e-12; same argmin cell for 41,905, a different cell for 0; bodies on opposite sides of 25 km²/s²: 0.

## Return grid, 400 seeded bodies
State: COMPLETE. 400 bodies drawn by one seeded shuffle of the catalog (seed 20261116; tiers L1 116, L2 284), every admissible cell of the 731 x 100 return grid (25,508,400 cells; 3,731,600 refused for Earth arrival after the fixture end), M=0 and M=1, every converged branch.

| Group | converged branches | perihelion < 1 solar radius | flagged | flagged share | flagged AND selected by the kernel | bodies with >= 1 flagged | LR1 (40 bodies, 150 cells each) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| M=0 | 25,508,400 | 619,805 | 79,648 | 0.312% | 79,648 | 365 | 17 of 6,000 (0.283%) |
| M=1 left | 15,648,717 | 403,052 | 403,052 | 2.576% | 163,199 | 400 | 107 of 4,062 |
| M=1 right | 15,648,717 | 450,860 | 450,860 | 2.881% | 108,506 | 400 | 95 of 4,062 |
| **all** | 56,805,834 |  | 933,560 | 1.643% |  |  | 219 of 14,124 (1.551%) |

Smallest asteroid-departure |v∞| on any flagged return branch: 3.974 km/s (LR1 saw 9.307 km/s in its sample).

## Files
- `xr2-outbound-0of3.json` — 13969 bodies, 2245849 bytes, sha256 9bf748848fecdf5ec2269359e18927186c841cdefe84506f002f1dcf009e02ef
- `xr2-outbound-1of3.json` — 13969 bodies, 2245293 bytes, sha256 74756f5d3d94cf0b123d605a74148d0a6ca51ee0c51b778a1a269a3fce784076
- `xr2-outbound-2of3.json` — 13968 bodies, 2244957 bytes, sha256 7a7f951662cca489961a727da8ae13f29757b1f13aba52752b1c58c0b67f5ad1
- `xr2-summary.json` — every aggregate above; `xr2-return-census.json` — the return census with per-body counts.
- `census-shard.mjs`, `return-census.mjs`, `summarize.mjs`; shared definitions in `../lib/common2.mjs`.

