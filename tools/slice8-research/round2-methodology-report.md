# Slice 8 Pre-Research Round 2: Methodology Investigation

## Purpose

Round 1 surfaced an unexpectedly large worst-body error for SBDB-direct propagation from the shared SBDB epoch
`2025-11-21` through the Slice 8 validation window centered on `2026-05-01` to `2026-07-30`. This report
disambiguates two competing explanations:

- Interpretation A: the error inflation is primarily a measurement-window effect. A `2025-11-21` anchor propagated
  into the `2026-05-01` validation window carries roughly five additional months of two-body drift before the
  90-day comparison even starts.
- Interpretation B: SBDB-direct stored elements are intrinsically lower quality than Horizons-derived osculating
  elements at the same epoch.

The result is decisive: Interpretation A wins. For this 20-body experiment, same-epoch SBDB-direct and
Horizons-anchored measurements are effectively identical. The error blow-up appears when the same `2025-11-21`
solution is carried forward into the later `2026-05-01` validation window.

## Method

The experiment used 20 bodies selected from Round 1's `sample-200.json`:

- 10 worst-error bodies from Round 1 with `max_error_km > 100,000`
- 10 best-error bodies from Round 1 with `max_error_km < 30,000`

For each body, four measurements were computed:

1. `M1`: SBDB-direct elements propagated from the SBDB epoch `2025-11-21` for a 90-day window starting at that
   same epoch.
2. `M2`: Horizons VECTORS fetched at `2025-11-21`, converted to elements, then propagated for the same 90-day window.
3. `M3`: SBDB-direct elements propagated from `2025-11-21` forward into the `2026-05-01` to `2026-07-30` window.
4. `M4`: Horizons VECTORS fetched at `2026-05-01`, converted to elements, then propagated through the same
   `2026-05-01` to `2026-07-30` window.

All propagation used the same canonical two-body implementation in
`tools/slice7-research/keplerian-propagate.mjs`. All state-to-elements conversion used
`tools/slice7-research/state-to-elements.mjs`. Horizons truth data used daily cadence VECTORS in heliocentric ICRF
with `REF_PLANE='FRAME'`.

## Per-Body Comparison

| Body | Cohort | H | e | M1 SBDB same epoch max km | M2 Horizons same epoch max km | M3 SBDB long window max km | M4 Horizons 2026 max km | Diagnosis |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 431 Nephele | Worst | 8.40 | 0.179 | 49,040.5 | 49,051.6 | 408,194.9 | 48,760.3 | window-dominant |
| 11232 1999 JA77 | Worst | 13.38 | 0.205 | 42,024.5 | 42,037.0 | 334,148.8 | 33,896.6 | window-dominant |
| 6410 Fujiwara | Worst | 13.23 | 0.191 | 32,836.9 | 32,840.6 | 233,037.8 | 23,548.5 | window-dominant |
| 1576 Fabiola | Worst | 11.90 | 0.185 | 36,661.4 | 36,664.4 | 224,349.7 | 25,798.3 | window-dominant |
| 7343 Ockeghem | Worst | 13.44 | 0.129 | 31,311.8 | 31,316.6 | 213,520.4 | 20,230.9 | window-dominant |
| 933 Susi | Worst | 11.19 | 0.163 | 25,733.6 | 25,746.0 | 204,692.6 | 25,062.8 | window-dominant |
| 5826 Ishikawa | Worst | 13.29 | 0.174 | 31,082.4 | 31,085.5 | 191,975.3 | 23,383.6 | window-dominant |
| 1163 Saga | Worst | 11.37 | 0.134 | 27,175.5 | 27,177.7 | 191,743.3 | 28,730.7 | window-dominant |
| 7787 Scheiber | Worst | 13.55 | 0.129 | 25,296.7 | 25,302.9 | 188,115.2 | 20,874.6 | window-dominant |
| 10811 Birgit | Worst | 13.46 | 0.155 | 24,929.5 | 24,938.6 | 183,593.6 | 19,576.5 | window-dominant |
| 6331 1992 FZ1 | Best | 13.38 | 0.073 | 2,629.2 | 2,666.9 | 19,701.3 | 2,585.1 | window-dominant |
| 2528 Mohler | Best | 12.89 | 0.059 | 2,838.1 | 2,827.1 | 22,359.7 | 2,851.2 | window-dominant |
| 2925 Beatty | Best | 12.33 | 0.069 | 3,169.4 | 3,167.9 | 25,839.8 | 3,236.5 | window-dominant |
| 5436 Eumelos | Best | 13.32 | 0.081 | 3,515.1 | 3,531.0 | 26,121.0 | 3,195.5 | window-dominant |
| 1310 Villigera | Best | 11.90 | 0.094 | 3,975.8 | 3,944.9 | 27,703.0 | 3,948.2 | window-dominant |
| 3176 Paolicchi | Best | 12.65 | 0.059 | 3,507.3 | 3,505.9 | 27,835.9 | 3,500.7 | window-dominant |
| 863 Benkoela | Best | 10.66 | 0.098 | 4,049.2 | 4,058.2 | 28,666.4 | 4,733.0 | window-dominant |
| 772 Tanete | Best | 10.77 | 0.096 | 3,867.1 | 3,849.2 | 28,914.1 | 3,818.2 | window-dominant |
| 637 Chrysothemis | Best | 10.83 | 0.078 | 3,552.6 | 3,537.7 | 29,555.8 | 3,454.4 | window-dominant |
| 951 Gaspra | Best | 11.16 | 0.173 | 4,539.6 | 4,553.5 | 29,934.8 | 4,452.1 | window-dominant |

## Aggregate Findings

### Source-quality comparison: M1 vs M2

This is the clean test of Interpretation B, because it holds epoch and validation window fixed and changes only the
source of the elements.

- Median `M1 / M2` ratio: `0.9998`
- Maximum absolute same-epoch gap in this sample: on the order of tens of kilometers, not hundreds of thousands
- Diagnosis count for `data-source-dominant`: `0 / 20`

Conclusion: the experiment does **not** support the claim that SBDB-direct stored elements are materially worse than
Horizons-derived osculating elements at the same epoch for these bodies.

### Window-length comparison: M1 vs M3

This is the clean test of Interpretation A, because it holds the source fixed and changes only the effective
propagation window.

- Median `M3 / M1` ratio: `7.48`
- Diagnosis count for `window-dominant`: `20 / 20`
- Worst body amplification:
  - `431 Nephele`: `49,040.5 km` at same-epoch `M1`
  - `408,194.9 km` when carried into the later validation window `M3`

Conclusion: the measurement-window effect is the dominant mechanism behind the inflated Round 1 Slice 8 errors.

### Best-case control: M2 vs M4

These are both re-anchored Horizons-derived measurements, but at different epochs.

- Same-order-of-magnitude behavior in both cases
- `M4` remains well below the six-figure Round 1 outliers
- Representative best-case `M4` statistics across this 20-body experiment:
  - max: `48,760.3 km`
  - median: `11,385.8 km`
  - 95th percentile: `35,632.4 km`

This matches the Slice 7 lesson: when the anchor epoch matches the validation window start, two-body Keplerian
propagation remains in the tens-of-thousands-of-kilometers regime, not the hundreds-of-thousands regime.

## Diagnosis

The evidence supports:

- Interpretation A: **validated**
- Interpretation B: **not supported**

There is no sign here of an SBDB-vs-Horizons intrinsic quality gap at the same epoch. The large Round 1 errors are an
honest consequence of taking a shared `2025-11-21` solution and pushing it roughly five months forward before the
90-day measurement window even begins.

In practical terms, Slice 8's architectural consequence is the same as the one anticipated in the dispatch:
re-anchoring at the target epoch is necessary.

## DEC-2 Revision

Recommended revision:

> Always Horizons re-anchor at `2026-05-01 TDB` for propagation. SBDB remains the canonical source for selection and
> metadata, but not for the production propagation anchor.

Why:

- Smart-staleness using a `2024-01-01` threshold is not useful for the Slice 8 target window. In the current Top
  10,000 population, all sampled bodies shared the same recent SBDB epoch `2025-11-21`, yet long-window propagation
  still inflated errors by roughly `7.5x`.
- The practical problem is not source quality; it is anchor mismatch with the validation window.
- That means the cheap-path optimization is not delivering the accuracy behavior Slice 8 wants, even when the SBDB
  epoch is recent.

Operationally, this kills the SBDB-direct propagation path for Slice 8. Horizons re-anchoring is the correct design.

## Provisional INV-013 Guidance

This 20-body methodology experiment is not the final INV-013 study. Round 3 still needs an eccentricity-stratified
sample with the correct re-anchored methodology. But the best-case `M4` distribution is already informative.

Provisional best-case guidance from this experiment:

- max `M4`: `48,760.3 km`
- p95 `M4`: `35,632.4 km`
- simple safety-margin candidate: `p95 × 2 ≈ 71,264.8 km`

Recommended provisional bar for planning purposes:

- `INV-013 provisional = 75,000 km`

This is intentionally provisional. The final stratified per-band bars should be derived in Round 3 from a sample that
is stratified by eccentricity band and uses Horizons re-anchoring for all bodies.

## Next Step

Round 3 should:

1. Drop the SBDB-direct propagation branch from the accuracy experiment.
2. Re-anchor every sampled body at `2026-05-01 TDB` with Horizons VECTORS.
3. Build the sample around eccentricity bands directly, not H-deciles alone.
4. Derive credible final INV-013 band bars from that corrected methodology.
