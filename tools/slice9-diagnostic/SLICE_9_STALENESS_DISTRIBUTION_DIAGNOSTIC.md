# Slice 9 Staleness Distribution Diagnostic

**Status:** COMPLETE (Tue 2026-05-19). Data only. No fixture mutation, no source changes.
**Purpose:** characterize the full 29,792-body 90-180d staleness population before any second re-anchor campaign or contract tightening is implemented.

## Q1 — Sample Design and Execution

- Population in band: 29,792 bodies
- Pre-existing horizons-reanchor bodies in band: 0
- Anomaly-tail bodies in band: 0
- Deterministic seed: 9019
- Sample size reached: 317
- Role counts:
  - viz-tier sample: 212
  - flagged validation sample: 105
- Cached truth overlap reused from prior research: 17
- CAD cache reused from prior research: 46

Stratification counts:

| Stratum | Count |
| --- | --- |
| AMO | >0.7 | 150-180d | not-flagged | 9 |
| AMO | 0.3-0.5 | 120-150d | not-flagged | 7 |
| AMO | 0.3-0.5 | 150-180d | encounter-flagged | 2 |
| AMO | 0.3-0.5 | 150-180d | not-flagged | 7 |
| AMO | 0.3-0.5 | 90-120d | not-flagged | 5 |
| AMO | 0.5-0.7 | 120-150d | not-flagged | 7 |
| AMO | 0.5-0.7 | 150-180d | not-flagged | 9 |
| AMO | 0.5-0.7 | 90-120d | not-flagged | 5 |
| AMO | e<0.3 | 120-150d | not-flagged | 7 |
| AMO | e<0.3 | 150-180d | encounter-flagged | 1 |
| AMO | e<0.3 | 150-180d | not-flagged | 7 |
| AMO | e<0.3 | 90-120d | not-flagged | 7 |
| APO | >0.7 | 120-150d | not-flagged | 7 |
| APO | >0.7 | 150-180d | not-flagged | 8 |
| APO | >0.7 | 90-120d | not-flagged | 7 |
| APO | 0.3-0.5 | 120-150d | not-flagged | 7 |
| APO | 0.3-0.5 | 150-180d | encounter-flagged | 24 |
| APO | 0.3-0.5 | 150-180d | not-flagged | 7 |
| APO | 0.3-0.5 | 90-120d | not-flagged | 7 |
| APO | 0.5-0.7 | 120-150d | not-flagged | 7 |
| APO | 0.5-0.7 | 150-180d | encounter-flagged | 23 |
| APO | 0.5-0.7 | 150-180d | not-flagged | 7 |
| APO | 0.5-0.7 | 90-120d | not-flagged | 7 |
| APO | e<0.3 | 120-150d | not-flagged | 7 |
| APO | e<0.3 | 150-180d | encounter-flagged | 25 |
| APO | e<0.3 | 150-180d | not-flagged | 8 |
| APO | e<0.3 | 90-120d | not-flagged | 6 |
| ATE | >0.7 | 150-180d | not-flagged | 7 |
| ATE | 0.3-0.5 | 150-180d | encounter-flagged | 15 |
| ATE | 0.3-0.5 | 150-180d | not-flagged | 9 |
| ATE | 0.3-0.5 | 90-120d | not-flagged | 1 |
| ATE | 0.5-0.7 | 120-150d | not-flagged | 3 |
| ATE | 0.5-0.7 | 150-180d | encounter-flagged | 1 |
| ATE | 0.5-0.7 | 150-180d | not-flagged | 8 |
| ATE | e<0.3 | 120-150d | not-flagged | 2 |
| ATE | e<0.3 | 150-180d | encounter-flagged | 14 |
| ATE | e<0.3 | 150-180d | not-flagged | 8 |
| IEO | >0.7 | 150-180d | not-flagged | 2 |
| IEO | 0.3-0.5 | 150-180d | not-flagged | 7 |
| IEO | 0.5-0.7 | 150-180d | not-flagged | 3 |
| IEO | e<0.3 | 150-180d | not-flagged | 7 |

## Q2 — Distribution Shape

- Shape verdict: **(b) graded: large over-envelope share without clean separation**
- Overall max-error distribution:
  - p25: 25,608.017
  - p50: 62,190.480 km
  - p75: 216,215.830
  - p90: 674,245.966 km
  - p95: 1,333,948.055 km
  - p99: 5,590,044.686
  - max: 24,184,328.102 km

Histogram by error bucket:

| Error bucket | Bodies |
| --- | --- |
| <1k | 0 |
| 1k-10k | 15 |
| 10k-50k | 128 |
| 50k-100k | 51 |
| 100k-1M | 99 |
| 1M-10M | 23 |
| 10M+ | 1 |

Fraction over the 50,000 km envelope by staleness sub-band:

| Sub-band | Bodies | Over 50k | Fraction |
| --- | --- | --- | --- |
| 120-150d | 54 | 26 | 48.1% |
| 150-180d | 218 | 123 | 56.4% |
| 90-120d | 45 | 25 | 55.6% |

Fraction over the envelope by orbital class:

| Class | Bodies | Over 50k | Fraction |
| --- | --- | --- | --- |
| AMO | 73 | 25 | 34.2% |
| APO | 157 | 113 | 72.0% |
| ATE | 68 | 33 | 48.5% |
| IEO | 19 | 3 | 15.8% |

Fraction over the envelope by eccentricity band:

| Eccentricity band | Bodies | Over 50k | Fraction |
| --- | --- | --- | --- |
| >0.7 | 40 | 12 | 30.0% |
| 0.3-0.5 | 98 | 54 | 55.1% |
| 0.5-0.7 | 80 | 46 | 57.5% |
| e<0.3 | 99 | 62 | 62.6% |

Worst measured bodies:

| Designation | Class | e band | Staleness band | CAD flag | Max error km |
| --- | --- | --- | --- | --- | --- |
| 2026 JM2 | ATE | e<0.3 | 150-180d | flagged | 24,184,328.102 |
| 2026 JH2 | APO | 0.5-0.7 | 150-180d | flagged | 6,607,407.486 |
| 2026 JX3 | APO | e<0.3 | 150-180d | flagged | 6,591,211.486 |
| 2026 JO | APO | 0.3-0.5 | 150-180d | flagged | 5,612,135.618 |
| 2026 JV3 | APO | 0.3-0.5 | 150-180d | flagged | 5,474,067.292 |
| 2026 JQ1 | APO | e<0.3 | 150-180d | flagged | 3,624,649.168 |
| 2026 JO1 | APO | 0.5-0.7 | 150-180d | flagged | 3,310,321.091 |
| 2026 JF | APO | 0.3-0.5 | 150-180d | flagged | 2,592,346.930 |
| 2025 YL1 | APO | >0.7 | 120-150d | not-flagged | 2,024,767.421 |
| 2026 KB | APO | 0.3-0.5 | 150-180d | flagged | 1,981,166.868 |
| 2026 JA | ATE | e<0.3 | 150-180d | flagged | 1,851,227.091 |
| 2026 JD1 | APO | 0.5-0.7 | 150-180d | flagged | 1,504,353.098 |
| 2026 JE1 | APO | e<0.3 | 150-180d | flagged | 1,438,913.422 |
| 2026 JN1 | APO | 0.5-0.7 | 150-180d | flagged | 1,384,771.974 |
| 2026 BA6 | APO | 0.3-0.5 | 90-120d | not-flagged | 1,350,383.352 |
| 2026 JM1 | APO | e<0.3 | 150-180d | flagged | 1,343,444.318 |
| 2026 JF2 | APO | 0.5-0.7 | 150-180d | flagged | 1,331,573.990 |
| 2026 JW2 | APO | 0.3-0.5 | 150-180d | flagged | 1,311,615.783 |
| 2026 JX1 | APO | 0.5-0.7 | 150-180d | flagged | 1,136,258.101 |
| 2025 XW2 | APO | 0.5-0.7 | 120-150d | not-flagged | 1,058,798.660 |

## Q3 — Path Cost / Benefit

### Path A — Re-anchor all 29,792 sbdb bodies in the 90-180d band

- Minimum fetch time at the locked 1.05s throttle: 8.69 hours
- Empirical unresolved rate reused from A.2b: 0.5%
- Expected unresolved bodies: 146
- Expected final viz-tier count (including the already-committed anomaly-tail class exclusion): 41,412 (98.8%)
- Expected final not-Kepler-safe count: 494

### Path C — Tighten T, no more Horizons

| Threshold | Staleness-only not-safe add | Final viz-tier | Viz % | Final not-safe | Not-safe % |
| --- | --- | --- | --- | --- | --- |
| T=30d | 29,993 | 11,565 | 27.6% | 30,341 | 72.4% |
| T=60d | 29,869 | 11,689 | 27.9% | 30,217 | 72.1% |
| T=90d | 29,792 | 11,766 | 28.1% | 30,140 | 71.9% |

### Path D — Candidate hybrid by orbital character

- Candidate function: T = 180d for e<0.3, T = 90d for e>=0.3
- Staleness-only not-safe add: 21,524
- Final viz-tier: 20,034 (47.8%)
- Final not-Kepler-safe: 21,872 (52.2%)

## Q4 — Cross-checks

- 12-body 161d cutover cluster reproduced prior signal: YES
- Cluster values:

| Designation | Class | e band | Staleness band | Max error km |
| --- | --- | --- | --- | --- |
| 2026 BX4 | IEO | e<0.3 | 150-180d | 690,833.558 |
| 2026 FP | ATE | e<0.3 | 150-180d | 308,056.220 |
| 2011 EP51 | ATE | 0.3-0.5 | 150-180d | 194,555.126 |
| 2022 SW20 | ATE | 0.5-0.7 | 150-180d | 166,745.461 |
| 2009 TL8 | AMO | 0.5-0.7 | 150-180d | 77,181.793 |
| 2019 CO1 | APO | e<0.3 | 150-180d | 77,003.149 |
| 2025 OD15 | AMO | >0.7 | 150-180d | 76,899.802 |
| 2013 XF22 | AMO | 0.5-0.7 | 150-180d | 63,792.830 |
| 462736 | APO | >0.7 | 150-180d | 58,394.482 |
| 2022 BG4 | AMO | >0.7 | 150-180d | 50,336.171 |
| 2023 XH2 | ATE | 0.3-0.5 | 150-180d | 50,002.931 |

- Prior 78-body cutover viz-tier sample under a pure T=90 staleness gate:
  - would remain viz-tier: 33
  - would move out of viz-tier: 45
- Any horizons-reanchor bodies already inside the 90-180d band before a second campaign: 0

## Data-Driven Path Recommendation

**Recommendation:** A

The measured band is graded rather than cleanly separable, and the no-Horizons alternatives collapse honest viz-tier coverage to 28-48% of the catalog. Re-anchoring the band is the only path that preserves the full-catalog thesis.

Supporting evidence:
- The band shape is classified as **(b) graded: large over-envelope share without clean separation**
- 174 of 317 sampled bodies exceeded the 50,000 km envelope
- Anomaly-tail bodies are absent from this 90-180d population (0 bodies in band), so the decision here is purely about the staleness axis

## Notes

- This diagnostic does not modify the fixture, contract, or runner.
- The already-committed three-offender re-anchor proof from A.2b remains valid; this diagnostic only measures the 90-180d sbdb population the second amendment exposed.
