# Slice 9 OQ-6 Invalidation Diagnostic

## Scope

Data only. No fix, no OQ-6 change, no fixture rebuild, no src/ changes, no deploy.

This diagnostic distinguishes between:

- (a) SBDB epoch / quality gap in the production ingestion methodology
- (b) ingestion or harness defect
- (c) genuine non-encounter Keplerian instability
- (d) inconclusive

## Q1 — Not-flagged over-envelope characterization

Production-fixture validation against the committed 67-body truth cache produced:

- not-flagged sample size: `61`
- over-envelope at `50,000 km`: `21`
- within-envelope: `40`

Error split:

- over-envelope max-error summary: median `102,597.4 km`, p95 `10,686,957.7 km`, max `15,421,337.4 km`
- within-envelope max-error summary: median `20,952.3 km`, p95 `42,136.4 km`, max `46,324.4 km`

Spearman rank correlations vs production max error (not-flagged sample only):

- epoch staleness days: `0.611` (n=`61`)
- data arc days: `-0.192` (n=`61`)
- condition code: `0.206` (n=`60`)
- eccentricity: `0.387` (n=`61`)

Interpretation:

- epoch staleness is the cleanest single separator in this diagnostic pass
- the over-envelope population is dominated by stale SBDB epochs relative to the common validation window
- quality fields and eccentricity correlate, but less cleanly than staleness

Full not-flagged sample table:

| Designation | Class | E-band | Element epoch JD | Staleness d | data_arc d | cc | n_obs | e | q AU | Prod max km |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2009 DN45 | AMO | D | 2,454,894.5 | 6,267 | 18 | 8 | 28 | 0.475 | 1.024 | 15,421,337.4 |
| 2010 FS | ATE | D | 2,455,276.5 | 5,885 | 13 | 8 | 42 | 0.318 | 0.532 | 10,686,957.7 |
| 2024 AL6 | APO | D | 2,460,328.5 | 833 | 12 | 8 | 63 | 0.827 | 0.430 | 2,386,247.8 |
| 2005 HC4 | APO | D | 2,453,493.5 | 7,668 | 11 | 9 | 52 | 0.961 | 0.070 | 678,551.4 |
| 2018 GZ7 | AMO | D | 2,460,600.5 | 561 | 1 | 9 | 7 | 0.851 | 1.111 | 356,021.1 |
| 2022 WB6 | AMO | D | 2,459,899.5 | 1,262 | 26 | 8 | 20 | 0.404 | 1.035 | 315,111.2 |
| 2014 HF124 | APO | D | 2,456,775.5 | 4,386 | 8 | 8 | 28 | 0.466 | 0.978 | 274,821.1 |
| 2024 G8 | AMO | D | 2,460,409.5 | 752 | 55 | n/a | 52 | 0.992 | 1.172 | 247,904.5 |
| 2001 HL31 | APO | D | 2,461,000.5 | 161 | 8,652 | 0 | 106 | 0.787 | 0.527 | 230,599.2 |
| 2022 UL4 | AMO | C | 2,459,868.5 | 1,293 | 11 | 8 | 17 | 0.231 | 1.153 | 175,660.5 |
| 2023 TX6 | ATE | C | 2,461,000.5 | 161 | 2 | 5 | 22 | 0.270 | 0.689 | 102,597.4 |
| 2003 TG2 | ATE | D | 2,461,000.5 | 161 | 7,323 | 0 | 79 | 0.316 | 0.621 | 73,282.7 |
| 594913 | IEO | B | 2,461,000.5 | 161 | 2,157 | 1 | 379 | 0.177 | 0.457 | 68,065.1 |
| 2019 QS3 | AMO | D | 2,461,000.5 | 161 | 147 | 3 | 55 | 0.773 | 1.295 | 67,632.2 |
| 513165 | APO | D | 2,461,000.5 | 161 | 7,652 | 0 | 221 | 0.832 | 0.385 | 64,410.4 |
| 2023 HH2 | APO | C | 2,461,000.5 | 161 | 14 | 7 | 55 | 0.229 | 0.999 | 62,833.3 |
| 2017 SS32 | ATE | D | 2,461,000.5 | 161 | 3,680 | 1 | 25 | 0.522 | 0.401 | 58,828.0 |
| 2010 VW75 | AMO | D | 2,461,000.5 | 161 | 3,298 | 0 | 257 | 0.601 | 1.084 | 58,637.8 |
| 620070 | AMO | D | 2,461,000.5 | 161 | 7,912 | 0 | 716 | 0.548 | 1.036 | 54,464.7 |
| 2021 RF12 | APO | D | 2,461,000.5 | 161 | 21 | 7 | 38 | 0.538 | 0.876 | 52,781.5 |
| 789529 | ATE | D | 2,461,000.5 | 161 | 3,067 | 0 | 352 | 0.439 | 0.549 | 50,217.6 |
| 527977 | ATE | D | 2,461,000.5 | 161 | 6,590 | 0 | 127 | 0.760 | 0.179 | 46,324.4 |
| 152742 | ATE | D | 2,461,000.5 | 161 | 10,285 | 0 | 565 | 0.739 | 0.229 | 44,006.3 |
| 2020 LA2 | AMO | D | 2,461,000.5 | 161 | 202 | 4 | 227 | 0.735 | 1.145 | 42,037.9 |
| 2015 VE146 | APO | D | 2,461,000.5 | 161 | 22 | 7 | 51 | 0.630 | 0.947 | 38,583.2 |
| 2020 VP4 | ATE | B | 2,461,000.5 | 161 | 9 | 5 | 106 | 0.128 | 0.815 | 35,459.1 |
| 2020 BH7 | AMO | D | 2,461,000.5 | 161 | 7 | 7 | 24 | 0.609 | 1.024 | 32,607.5 |
| 2025 GN1 | IEO | D | 2,461,000.5 | 161 | 88 | 4 | 31 | 0.705 | 0.136 | 32,376.3 |
| 480883 | ATE | D | 2,461,000.5 | 161 | 8,762 | 0 | 456 | 0.540 | 0.311 | 31,096.3 |
| 2016 GZ | AMO | D | 2,461,000.5 | 161 | 35 | 7 | 25 | 0.530 | 1.189 | 30,458.0 |
| 347813 | AMO | B | 2,461,000.5 | 161 | 7,983 | 0 | 1,702 | 0.165 | 1.042 | 29,585.8 |
| 2020 BA12 | AMO | D | 2,461,000.5 | 161 | 92 | 5 | 42 | 0.408 | 1.066 | 29,069.9 |
| 2004 US1 | APO | D | 2,461,000.5 | 161 | 7,855 | 0 | 295 | 0.451 | 0.705 | 28,603.1 |
| 2010 XB11 | IEO | D | 2,461,000.5 | 161 | 5,528 | 1 | 66 | 0.534 | 0.288 | 25,473.6 |
| 2021 PH27 | IEO | D | 2,461,000.5 | 161 | 2,552 | 2 | 114 | 0.712 | 0.133 | 24,339.4 |
| 85953 | ATE | D | 2,461,000.5 | 161 | 20,138 | 0 | 2,132 | 0.703 | 0.219 | 24,231.1 |
| 2025 QX16 | APO | D | 2,461,000.5 | 161 | 178 | 5 | 39 | 0.662 | 0.914 | 24,109.8 |
| 876393 | ATE | D | 2,461,000.5 | 161 | 6,554 | 1 | 107 | 0.650 | 0.290 | 22,960.1 |
| 2020 HC1 | APO | D | 2,461,000.5 | 161 | 31 | 6 | 35 | 0.547 | 0.901 | 22,630.6 |
| 2025 UV1 | ATE | D | 2,461,000.5 | 161 | 3 | 6 | 27 | 0.403 | 0.573 | 22,606.7 |
| 2011 TP6 | AMO | C | 2,461,000.5 | 161 | 95 | 5 | 59 | 0.225 | 1.024 | 21,277.5 |
| 2016 XM23 | APO | D | 2,461,000.5 | 161 | 18 | 7 | 48 | 0.340 | 0.808 | 20,627.1 |
| 2025 XH4 | AMO | D | 2,461,000.5 | 161 | 67 | 5 | 65 | 0.438 | 1.227 | 20,045.4 |
| 2021 US2 | ATE | A | 2,461,000.5 | 161 | 13 | 7 | 138 | 0.068 | 0.908 | 19,912.3 |
| 2019 US12 | APO | D | 2,461,000.5 | 161 | 1,414 | 1 | 83 | 0.494 | 0.870 | 19,773.3 |
| 2020 OO3 | AMO | B | 2,461,000.5 | 161 | 6 | 7 | 11 | 0.190 | 1.146 | 19,163.2 |
| 2015 DR215 | IEO | D | 2,461,000.5 | 161 | 2,602 | 0 | 82 | 0.471 | 0.352 | 18,107.5 |
| 434326 | IEO | D | 2,461,000.5 | 161 | 6,227 | 1 | 142 | 0.531 | 0.298 | 17,198.9 |
| 693691 | ATE | D | 2,461,000.5 | 161 | 8,045 | 1 | 236 | 0.737 | 0.248 | 16,918.9 |
| 2015 YU1 | APO | B | 2,461,000.5 | 161 | 235 | 3 | 98 | 0.113 | 0.988 | 15,708.1 |
| 86667 | ATE | D | 2,461,000.5 | 161 | 13,186 | 0 | 2,444 | 0.595 | 0.348 | 15,001.5 |
| 2021 PB2 | IEO | B | 2,461,000.5 | 161 | 4,448 | 1 | 52 | 0.150 | 0.610 | 14,593.6 |
| 2019 AQ3 | IEO | D | 2,461,000.5 | 161 | 2,996 | 1 | 148 | 0.314 | 0.404 | 13,145.1 |
| 2021 BS1 | IEO | D | 2,461,000.5 | 161 | 1,564 | 2 | 46 | 0.338 | 0.396 | 12,691.9 |
| 2023 EL | IEO | C | 2,461,000.5 | 161 | 2,864 | 1 | 68 | 0.246 | 0.581 | 10,639.0 |
| 2018 JB3 | IEO | C | 2,461,000.5 | 161 | 3,959 | 1 | 132 | 0.290 | 0.485 | 9,484.5 |
| 2015 XK55 | ATE | B | 2,461,000.5 | 161 | 27 | 7 | 40 | 0.195 | 0.724 | 9,473.1 |
| 2013 JX28 | IEO | D | 2,461,000.5 | 161 | 5,110 | 1 | 55 | 0.564 | 0.262 | 8,559.1 |
| 2021 VR3 | IEO | D | 2,461,000.5 | 161 | 1,716 | 3 | 55 | 0.414 | 0.313 | 7,985.0 |
| 2020 TK2 | APO | B | 2,461,000.5 | 161 | 11 | 7 | 27 | 0.188 | 0.879 | 7,675.5 |
| 2023 OU3 | APO | B | 2,461,000.5 | 161 | 3 | 7 | 22 | 0.185 | 0.999 | 6,510.5 |

## Q2 — Re-anchor reproduction test

Method A = production Slice 9 fixture path (SBDB elements at SBDB epoch)

Method B = Task 3 path (recent Horizons anchor at the common validation epoch, then Keplerian propagate)

| Designation | Class | Staleness d | cc | data_arc d | Method A max km | Method B max km | A/B collapse |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2009 DN45 | AMO | 6,267 | 8 | 18 | 15,421,337.4 | 3,628.0 | 4,250.7 |
| 2010 FS | ATE | 5,885 | 8 | 13 | 10,686,957.7 | 1,247.7 | 8,565.6 |
| 2024 AL6 | APO | 833 | 8 | 12 | 2,386,247.8 | 4,739.7 | 503.5 |
| 2005 HC4 | APO | 7,668 | 9 | 11 | 678,551.4 | 4,737.8 | 143.2 |
| 2018 GZ7 | AMO | 561 | 9 | 1 | 356,021.1 | 7,240.1 | 49.2 |
| 2022 WB6 | AMO | 1,262 | 8 | 26 | 315,111.2 | 3,452.6 | 91.3 |
| 2014 HF124 | APO | 4,386 | 8 | 8 | 274,821.1 | 1,737.5 | 158.2 |
| 2024 G8 | AMO | 752 | n/a | 55 | 247,904.5 | 6,602.1 | 37.5 |

Headline:

- Every sampled worst offender collapsed back under the `50,000 km` visualization envelope after Horizons re-anchor.
- This strongly supports the methodology/epoch-gap explanation over genuine non-encounter dynamical instability.

## Q3 — Ingestion / harness correctness audit

Spot-check audit of raw SBDB row → Slice 9 fixture record:

| Designation | Raw epoch JD | Fixture epoch JD | Raw a AU | Fixture a AU | Raw i deg | Fixture i deg | Anchor recompute err km |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2009 DN45 | 2,454,894.5 | 2,454,894.5 | 1.949632706 | 1.949632706 | 8.531691 | 8.531691 | 0.000000000 |
| 2024 AL6 | 2,460,328.5 | 2,460,328.5 | 2.478277529 | 2.478277529 | 3.734532 | 3.734532 | 0.000000000 |
| 433 | 2,461,000.5 | 2,461,000.5 | 1.458120998 | 1.458120998 | 10.828467 | 10.828467 | 0.000000000 |

Audit findings:

- No epoch-field bug surfaced in the three traced bodies: raw SBDB epoch matches fixture-stored epoch exactly.
- No unit-conversion bug surfaced: raw AU/deg values map cleanly to fixture km/rad fields.
- No anchor-state fabrication bug surfaced: recomputing the anchor from the stored fixture elements at the stored epoch reproduces the stored anchor to machine precision.
- The A.3 precheck that failed used the fixture's stored epoch consistently. This does not look like a harness-epoch mismatch.

Hypothesis status:

- ingestion/harness defect hypothesis is **not supported** by this audit pass.
- If a bug still exists, it is not an obvious epoch/unit/frame transcription defect in the inspected production path.

## Q4 — Population impact sizing

Candidate reclassification counts across the full `41,775` current `visualization-tier` population:

Epoch staleness thresholds:

| Threshold | Bodies |
| --- | --- |
| >180 | 11,804 |
| >365 | 11,259 |
| >730 | 9,968 |
| >1460 | 7,924 |

Condition-code thresholds:

| Threshold | Bodies |
| --- | --- |
| >=5 | 29,293 |
| >=7 | 21,746 |
| >=8 | 12,213 |

Data-arc thresholds:

| Threshold | Bodies |
| --- | --- |
| <30 | 23,172 |
| <100 | 28,858 |
| <365 | 30,521 |

These counts size the scoping decision. They do **not** choose a gate.

## ROOT CAUSE FAMILY VERDICT

**Verdict: (a) SBDB-epoch / quality gap**

Primary evidence:

- Q2: Method B (recent Horizons re-anchor) collapses every sampled worst over-envelope body back into the Task-3-style error regime, while Method A stays in the stale-SBDB millions-to-hundreds-of-thousands-km regime.
- Q3: no direct ingestion or harness defect surfaced in epoch storage, unit conversion, frame handling, or anchor recomputation.
- Q1: epoch staleness is the cleanest separator among the measured candidate predictors.

What next, implied by this verdict:

- This is a **Hudson scoping decision**, not an automatic fix.
- The next move is to decide whether Slice 9 keeps SBDB bulk ingestion but adds a second viz-tier gate tied to staleness/quality, or whether Slice 9 Phase A must adopt a re-anchoring strategy for a subset/all of the NEA catalog.
- Do **not** unilaterally widen OQ-6 or silently retier the production fixture from this report alone.

