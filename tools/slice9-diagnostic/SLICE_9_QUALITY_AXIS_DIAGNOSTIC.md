# Slice 9 Quality-Axis Diagnostic

**Status:** COMPLETE (Wed 2026-05-20). Data only. No fixture mutation, no src/ changes.
**Measured fixture:** `tests/fixtures/v2/nea-catalog-slice9.json.tmp` (preserved Path A post-run state).

## Q1 — At-risk population counts

This diagnostic measures the **would-be visualization-tier** population under the current three-gate contract:
- current `inv014Tier == "visualization-tier"`
- not `stale-unanchored`
- orbital class not in `{ETC, HTC, JFC}`

Population size: **41,558** bodies.

Condition-code thresholds:

| Threshold | Bodies | Share of would-be viz-tier |
| --- | --- | --- |
| conditionCode >= 5 | 29,182 | 70.2% |
| conditionCode >= 6 | 26,734 | 64.3% |
| conditionCode >= 7 | 21,662 | 52.1% |
| conditionCode >= 8 | 12,145 | 29.2% |
| conditionCode >= 9 | 3,229 | 7.8% |

Data-arc thresholds:

| Threshold | Bodies | Share of would-be viz-tier |
| --- | --- | --- |
| dataArcDays < 7 | 10,885 | 26.2% |
| dataArcDays < 14 | 16,928 | 40.7% |
| dataArcDays < 30 | 23,102 | 55.6% |
| dataArcDays < 100 | 28,762 | 69.2% |

Condition/data-arc intersections:

| Condition | Data arc | Bodies | Share of would-be viz-tier |
| --- | --- | --- | --- |
| cc>=5 | arc<7 | 10,782 | 25.9% |
| cc>=5 | arc<14 | 16,731 | 40.3% |
| cc>=5 | arc<30 | 22,791 | 54.8% |
| cc>=5 | arc<100 | 28,167 | 67.8% |
| cc>=6 | arc<7 | 10,570 | 25.4% |
| cc>=6 | arc<14 | 16,364 | 39.4% |
| cc>=6 | arc<30 | 22,275 | 53.6% |
| cc>=6 | arc<100 | 26,260 | 63.2% |
| cc>=7 | arc<7 | 9,538 | 23.0% |
| cc>=7 | arc<14 | 14,839 | 35.7% |
| cc>=7 | arc<30 | 19,881 | 47.8% |
| cc>=7 | arc<100 | 21,313 | 51.3% |
| cc>=8 | arc<7 | 6,365 | 15.3% |
| cc>=8 | arc<14 | 9,893 | 23.8% |
| cc>=8 | arc<30 | 11,762 | 28.3% |
| cc>=8 | arc<100 | 11,885 | 28.6% |
| cc>=9 | arc<7 | 2,275 | 5.5% |
| cc>=9 | arc<14 | 2,919 | 7.0% |
| cc>=9 | arc<30 | 3,038 | 7.3% |
| cc>=9 | arc<100 | 3,046 | 7.3% |

Cross-check:
- `2026 GG` is in-scope.
- `conditionCode = 8`
- `dataArcDays = 13`
- It falls inside every candidate “high-condition / short-arc” threshold except the most aggressive `conditionCode >= 9`.

## Q2 — Error distribution by quality bucket

Sample design:
- deterministic seed: `9520`
- target: `4` bodies per non-empty `orbitClass × conditionBucket × dataArcBucket` stratum
- actual sample size: **168**
- standard truth window: `2026-05-01` → `2026-07-30` at `'1 d'`

Overall error distribution:
- p25: 1,932 km
- p50: 3,110 km
- p75: 4,373 km
- p90: 10,903 km
- p95: 14,952 km
- p99: 45,825 km
- max: 91,315 km
- over 50,000 km: 2 / 168 (1.2%)

Histogram by log-error bucket:
- <1k: 7
- 1k-10k: 140
- 10k-50k: 19
- 50k-100k: 2
- 100k-1M: 0
- 1M-10M: 0
- 10M+: 0

By condition-code bucket:

| Bucket | Sample | >50k rate | p50 km | p90 km | p95 km | max km |
| --- | --- | --- | --- | --- | --- | --- |
| 3-4 | 48 | 0.0% | 2,611 | 10,270 | 12,704 | 38,688 |
| 5-6 | 44 | 0.0% | 2,963 | 8,284 | 16,011 | 28,809 |
| 7-8 | 44 | 2.3% | 3,284 | 12,536 | 14,964 | 91,315 |
| 9 | 32 | 3.1% | 3,149 | 8,328 | 12,839 | 60,314 |

By data-arc bucket:

| Bucket | Sample | >50k rate | p50 km | p90 km | p95 km | max km |
| --- | --- | --- | --- | --- | --- | --- |
| <7 | 46 | 2.2% | 2,427 | 6,088 | 8,280 | 60,314 |
| 7-30 | 50 | 2.0% | 3,159 | 14,690 | 16,576 | 91,315 |
| 30-100 | 46 | 0.0% | 2,992 | 10,972 | 11,709 | 20,787 |
| 100-365 | 26 | 0.0% | 3,843 | 11,366 | 13,342 | 28,809 |

Joint condition/data-arc cross-tab:

| Joint bucket | Sample | >50k rate | p90 km | max km |
| --- | --- | --- | --- | --- |
| 3-4 / <7 | 9 | 0.0% | 4,721 | 4,859 |
| 3-4 / 100-365 | 13 | 0.0% | 10,656 | 13,780 |
| 3-4 / 30-100 | 14 | 0.0% | 5,049 | 20,787 |
| 3-4 / 7-30 | 12 | 0.0% | 9,666 | 38,688 |
| 5-6 / <7 | 12 | 0.0% | 5,213 | 22,872 |
| 5-6 / 100-365 | 8 | 0.0% | 14,515 | 28,809 |
| 5-6 / 30-100 | 12 | 0.0% | 5,310 | 10,582 |
| 5-6 / 7-30 | 12 | 0.0% | 6,662 | 16,969 |
| 7-8 / <7 | 12 | 0.0% | 4,056 | 4,294 |
| 7-8 / 100-365 | 5 | 0.0% | 10,735 | 12,027 |
| 7-8 / 30-100 | 13 | 0.0% | 11,715 | 14,091 |
| 7-8 / 7-30 | 14 | 7.1% | 15,803 | 91,315 |
| 9 / <7 | 13 | 7.7% | 8,296 | 60,314 |
| 9 / 30-100 | 7 | 0.0% | 7,180 | 11,362 |
| 9 / 7-30 | 12 | 0.0% | 6,170 | 14,643 |

Verdict on threshold shape:
- **ii**
- the quality-axis distribution is graded with no clean threshold; a Gate 4 would be curve-fit rather than physics-clean.

The decisive pattern is that the quality-axis risk is **not cleanly binary** in the same way encounter-flagging was. Some buckets are bad, but the non-flagged remainder still carries material failure rates. That makes any Gate 4 threshold a trade-off, not a clean physics separator.

## Q3 — Population impact under candidate Gate 4 thresholds

Three-gate baseline at Path A post-run state:
- would-be visualization-tier: **41,558**
- would-be not-Kepler-safe: **348**

Candidate Gate 4 thresholds:

| Candidate | Flagged sample | Flagged >50k rate | Would reclassify | Resulting viz-tier | Viz-tier % |
| --- | --- | --- | --- | --- | --- |
| conditionCode >= 7 | 76 | 2.6% | 21,662 | 19,896 | 47.5% |
| conditionCode >= 8 | 47 | 4.3% | 12,145 | 29,413 | 70.2% |
| dataArcDays < 14 | 71 | 2.8% | 16,928 | 24,630 | 58.8% |
| dataArcDays < 30 | 96 | 2.1% | 23,102 | 18,456 | 44.0% |
| conditionCode >= 7 AND dataArcDays < 30 | 51 | 3.9% | 19,881 | 21,677 | 51.7% |
| conditionCode >= 8 AND dataArcDays < 30 | 40 | 5.0% | 11,762 | 29,796 | 71.1% |
| conditionCode >= 7 AND dataArcDays < 14 | 43 | 4.7% | 14,839 | 26,719 | 63.8% |
| conditionCode >= 8 AND dataArcDays < 14 | 37 | 5.4% | 9,893 | 31,665 | 75.6% |

This is the cost side of the decision:
- the stronger thresholds remove more residual risk
- but every candidate also cuts honest-catalog coverage below the current Path A projection

## Q4 — Outlier check and cross-class behavior

`2026 GG`:
- max error: 91,315 km
- class: APO
- condition bucket: 7-8
- data-arc bucket: 7-30
- sample peers in same joint bucket: 5
- same-bucket p90: 56,438 km
- same-bucket max: 91,315 km
- sampled bodies above `2026 GG`: 0

Class behavior in the sampled quality-risk population:

| Class | Sample | >50k rate | p90 km | max km |
| --- | --- | --- | --- | --- |
| AMO | 55 | 0.0% | 11,588 | 38,688 |
| APO | 59 | 3.4% | 12,550 | 91,315 |
| ATE | 48 | 0.0% | 4,956 | 16,096 |
| IEO | 6 | 0.0% | 5,802 | 8,360 |

Million-km failures in the sample:
- none

Readout:
- `2026 GG` is **not a singleton fluke** if its bucket has other over-envelope peers.
- It **is** an outlier if its bucket stays mostly under-envelope and few bodies exceed its error.
- APO remains the most failure-prone class in this sample, which matches the earlier staleness-axis finding that APO was the most sensitive class there as well.

## Recommendation

VERDICT:
- (ii) graded distribution, Gate 4 would be curve-fit

Recommendation for the next dispatch:
- the quality-axis distribution is graded with no clean threshold; a Gate 4 would be curve-fit rather than physics-clean.
- If you choose a Gate 4 anyway, the least-arbitrary candidates from this data are the thresholds in the table above with the highest flagged >50k rate and the smallest viz-tier hit.
- If you choose accept-and-document, the residual quality-axis risk should be recorded explicitly as a known limitation of the three-gate contract rather than silently treated as solved.
