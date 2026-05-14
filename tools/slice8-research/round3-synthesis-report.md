# Slice 8 Pre-Research Round 3: Corrected Sample Design and Final INV-013 Recommendations

## Executive Summary

Round 3 reran the Slice 8 accuracy study with the corrected methodology established in Round 2:

- no SBDB-direct propagation path
- all sampled bodies re-anchored from Horizons VECTORS at `2026-05-01 TDB`
- sample stratified by eccentricity band instead of H decile alone
- 90-day validation window at 1-day cadence

The result is coherent and cutover-usable:

- all four eccentricity bands are sufficiently populated
- no body exceeded the `500,000 km` sanity-stop threshold
- derived INV-013 bars remain in the same regime as the Round 2 provisional `75,000 km` planning value
- all 18 Slice 7 sample bodies pass the Round 3 bars without widening beyond the built-in Slice 7 safety floor

Recommended Slice 8 architectural conclusions:

- `DEC-2`: confirmed — always Horizons re-anchor at `2026-05-01 TDB`
- `DEC-4`: use stratified INV-013 bars by eccentricity band
- `DEC-5`: recommend `H < 10.98` as the default adaptive orbit-line threshold

## Sample Design

Input population:

- `tools/slice8-research/data/main-belt-top-10000.json`

Band definitions:

- Band A: `e < 0.1`
- Band B: `0.1 ≤ e < 0.2`
- Band C: `0.2 ≤ e < 0.3`
- Band D: `e ≥ 0.3`

Top-10,000 population counts by band:

- Band A: `3384`
- Band B: `5118`
- Band C: `1382`
- Band D: `116`

Round 3 sample design:

- target `50` bodies per band
- total sample `200`
- within each band, selection stratified across that band's H-deciles
- seeded RNG: `8`

This corrected the Round 1 failure mode where `e ≥ 0.3` had only `2` sampled bodies.

## Accuracy Results Summary

Output artifact:

- `tools/slice8-research/data/keplerian-accuracy-200-eccentricity.json`

Overall sample summary:

- sample count: `200`
- median max error: `3,955.482 km`
- 95th percentile max error across all 200: `19,142.547 km`
- best body: `2257` at `1,980.453 km`
- worst body: `7085` at `77,488.926 km`

Stop-condition checks:

- Band D count `< 30`: not triggered (`116` bodies in Top 10,000)
- Any body `> 500,000 km`: not triggered
- Derived bars `~10x` above Round 2 planning value: not triggered
- Slice 7 backward-compat failure by `> 2x`: not triggered

## Per-Band Statistical Analysis

Output artifact:

- `tools/slice8-research/data/inv-013-band-bars.json`

Derived methodology:

`derived_bar_km = max(p95_error_km × 2, slice7_constraint_max_error_km × 1.5)`

This intentionally preserves Slice 7 backward compatibility even when the Round 3 sample itself would suggest a
tighter band bar.

### Band A — `e < 0.1`

- sample count: `50`
- min / median / max: `2,626.023 / 3,695.024 / 31,177.776 km`
- p95: `17,806.436 km`
- `p95 × 2`: `35,612.872 km`
- Slice 7 floor: `15,874.425 km`
- derived bar: `35,612.872 km`

Recommendation:

- keep separate for now
- statistically similar to Band B in the Round 3 sample, but the Slice 7 constraint structure differs

### Band B — `0.1 ≤ e < 0.2`

- sample count: `50`
- min / median / max: `2,521.174 / 3,788.741 / 17,850.929 km`
- p95: `15,158.259 km`
- `p95 × 2`: `30,316.518 km`
- Slice 7 floor: `52,970.092 km`
- derived bar: `52,970.092 km`

Recommendation:

- keep separate
- this is the clearest case where backward compatibility matters: `10 Hygiea` sets the Slice 7 floor

### Band C — `0.2 ≤ e < 0.3`

- sample count: `50`
- min / median / max: `1,980.453 / 4,275.151 / 77,488.926 km`
- p95: `18,844.038 km`
- `p95 × 2`: `37,688.076 km`
- Slice 7 floor: `12,483.011 km`
- derived bar: `37,688.076 km`

Recommendation:

- keep separate
- Band C has the broadest upper tail in the corrected sample; this is the strongest evidence against merging bands

### Band D — `e ≥ 0.3`

- sample count: `50`
- min / median / max: `2,113.649 / 4,210.163 / 29,163.667 km`
- p95: `21,878.775 km`
- `p95 × 2`: `43,757.550 km`
- Slice 7 floor: `6,616.992 km`
- derived bar: `43,757.550 km`

Recommendation:

- keep separate
- the band is adequately sampled in Round 3 and does not require merger into Band C

## Final INV-013 Recommendation

Exact derived values from Round 3:

- Band A: `35,612.872 km`
- Band B: `52,970.092 km`
- Band C: `37,688.076 km`
- Band D: `43,757.550 km`

Recommended founding-doc rounded values:

- Band A: `36,000 km`
- Band B: `53,000 km`
- Band C: `38,000 km`
- Band D: `44,000 km`

These are the recommended `DEC-4` values for the Slice 8 founding doc.

## Slice 7 Backward Compatibility

Output artifact:

- `tools/slice8-research/data/slice7-regression-validation.json`

Result:

- all `18` Slice 7 Round-2 sample bodies pass the Round 3 bars
- failing count: `0`
- tightest case: `10 Hygiea`
  - band: `B`
  - Slice 7 max: `35,313.394 km`
  - Round 3 band bar: `52,970.092 km`
  - ratio to bar: `0.6667`

So the Round 3 bars preserve Slice 7 without any additional widening pass.

## Orbit-Line H Threshold Analysis

Output artifact:

- `tools/slice8-research/data/h-threshold-analysis.json`

Deterministic thresholds from the Top-10,000 set:

- Top `500`: `H < 9.74`
- Top `1,000`: `H < 10.98`
- Top `1,500`: `H < 11.63`
- Top `2,000`: `H < 11.99`

Recommended default for `DEC-5`:

- `H < 10.98`

Reasoning:

- it preserves the exact Slice 7 top-1,000 brightness cut
- it is already product-proven visually
- it avoids expanding orbit-line density before Slice 8 rendering and performance work is in place

Secondary options if product wants denser orbit coverage later:

- `H < 11.63` for Top `1,500`
- `H < 11.99` for Top `2,000`

## Updated Slice 8 Architectural Inputs

### DEC-2

Confirmed:

- always Horizons re-anchor at `2026-05-01 TDB`
- SBDB remains selection and metadata only

### DEC-4

Recommended final stratified INV-013 bars:

- Band A `e < 0.1`: `36,000 km`
- Band B `0.1 ≤ e < 0.2`: `53,000 km`
- Band C `0.2 ≤ e < 0.3`: `38,000 km`
- Band D `e ≥ 0.3`: `44,000 km`

### DEC-5

Recommended adaptive orbit-line threshold:

- `H < 10.98`

### Phase A Ingestion Budget

If Slice 8 re-anchors the full Top-10,000 population with Horizons at `3s` between calls:

- `10,000 × 3s = 30,000s`
- `≈ 8.33 hours` minimum wall-clock
- with overhead, budget `≈ 8.5 hours`

This should be treated as a long-running batch job, not an interactive one-shot step.

## Final Recommendation

Round 3 clears Slice 8 pre-research:

- the corrected methodology is stable
- the four-band eccentricity model is viable
- the bars are empirically grounded
- Slice 7 remains backward-compatible
- the orbit-line threshold is now deterministic

Slice 8 is ready for the founding-doc pass with the values above.
