# Slice 7 Asteroid Catalog Pre-Research Report

## Methodology

- SBDB ingestion used two paths:
  - Bulk numbered-asteroid ASCII table: `https://ssd.jpl.nasa.gov/dat/ELEMENTS.NUMBR.gz`
  - SBDB Query API enrichment: `https://ssd-api.jpl.nasa.gov/sbdb_query.api`
- Quality gates applied to the Top main-belt candidate pool:
  - drop `condition_code = 9`
  - drop `data_arc < 30 d`
  - drop `H = 99.00`
- Hybrid set follows the locked product decision:
  - Top `1,000` main-belt asteroids by `H`
  - `8` curated famous NEAs
- Propagation model is canonical two-body Keplerian propagation from osculating elements.
- Frame convention matches V2 native space:
  - source orbital elements are SBDB `J2000` ecliptic
  - propagation output rotates into `FRAME_HELIO_J2000_ICRF`
  - constant obliquity: `84381.448 arcsec = 23.43929111111111 deg`
- Validation window matches Slices 1-6:
  - `2026-05-01` through `2026-07-30`
  - `91` endpoint-inclusive daily samples per asteroid
- Horizons truth queries used:
  - `EPHEM_TYPE='VECTORS'`
  - `REF_SYSTEM='ICRF'`
  - `REF_PLANE='FRAME'`
  - `TIME_TYPE='TDB'`
  - `OUT_UNITS='KM-S'`
  - `VEC_TABLE='2'`
  - `CENTER='500@10'`
- Output artifacts live under `tools/slice7-research/`.

## Asteroid Set Summary

- Main-belt Top `1,000` cutoff: `H = 10.98`
  - cutoff body: `1057 Wanda`
  - cutoff timestamp file: `tools/slice7-research/data/main-belt-cutoff-h.txt`
- Curated famous NEAs: `8`
  - `101955 Bennu` (`APO`, `H=20.21`)
  - `99942 Apophis` (`ATE`, `H=19.09`)
  - `433 Eros` (`AMO`, `H=10.39`)
  - `25143 Itokawa` (`APO`, `H=19.26`)
  - `162173 Ryugu` (`APO`, `H=19.55`)
  - `4179 Toutatis` (`APO`, `H=15.29`)
  - `1620 Geographos` (`APO`, `H=15.26`)
  - `4769 Castalia` (`APO`, `H=17.40`)
- Quality-gate impact on the main-belt selection pass:
  - numbered records in bulk table: `887103`
  - orbital pre-filter (`2.0 < a < 3.5`, `e < 0.4`) pool: `846584`
  - dropped `H = 99.00`: `0`
  - enriched records scanned: `1125`
  - dropped `condition_code = 9`: `0`
  - dropped `data_arc < 30 d`: `0`
  - dropped non-`MBA` class after enrichment: `103`
  - dropped `neo = true`: `0`
  - accepted main-belt records: `1000`
- Notable inclusions:
  - main-belt set includes `1 Ceres`, `2 Pallas`, `4 Vesta`, `10 Hygiea`, `16 Psyche`
  - curated NEA set includes `Bennu`, `Apophis`, `Eros`
- Duplicate check:
  - no designation overlap between the `1000` main-belt records and the `8` curated NEAs

## Keplerian Accuracy Table

| Body | Class | H | Max error (km) | RMS error (km) | Error @ 90d (km) | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Bennu | APO | 20.21 | 8,363,734.8 | 7,507,255.9 | 6,739,443.6 | Exact-epoch residual is effectively zero; long-span drift is dominated by propagating a 2011 SBDB solution into 2026 with two-body dynamics only |
| Hygiea | MBA | 5.65 | 258,309.2 | 177,398.8 | 258,309.2 | Largest main-belt residual in the sample |
| Laetitia | MBA | 5.97 | 143,909.3 | 104,710.3 | 143,909.3 | Above the nominal `100,000 km` target |
| Psyche | MBA | 6.20 | 123,839.9 | 81,839.7 | 123,839.9 | Above the nominal `100,000 km` target |
| Harmonia | MBA | 6.56 | 115,772.3 | 79,951.0 | 115,772.3 | Above the nominal `100,000 km` target |
| Wanda | MBA | 10.98 | 75,302.6 | 54,246.8 | 75,302.6 | Near the Top-1000 cutoff; remains under `100,000 km` |
| Eros | AMO | 10.39 | 47,340.7 | 33,001.5 | 47,340.7 | Famous NEA control remains comfortably under `100,000 km` |
| Eunomia | MBA | 5.43 | 36,869.5 | 25,640.8 | 36,869.5 | Stable within the visualization-grade band |
| Juno | MBA | 5.19 | 30,565.9 | 21,039.4 | 30,565.9 | Stable within the visualization-grade band |
| Toutatis | APO | 15.29 | 28,847.5 | 19,975.7 | 28,847.5 | Stable within the visualization-grade band |
| Ceres | MBA | 3.35 | 28,763.9 | 19,598.0 | 28,763.9 | Stable within the visualization-grade band |
| Pallas | MBA | 4.11 | 27,503.0 | 19,514.5 | 27,503.0 | Stable within the visualization-grade band |
| Vesta | MBA | 3.25 | 24,762.4 | 17,276.6 | 24,762.4 | Stable within the visualization-grade band |
| Geographos | APO | 15.26 | 24,690.3 | 22,839.0 | 21,966.7 | Stable within the visualization-grade band |
| Apophis | ATE | 19.09 | 20,386.9 | 14,461.1 | 20,386.9 | Stable within the visualization-grade band |
| Itokawa | APO | 19.26 | 16,826.2 | 10,662.4 | 16,826.2 | Stable within the visualization-grade band |
| Castalia | APO | 17.40 | 7,596.9 | 7,168.9 | 6,408.8 | Stable within the visualization-grade band |
| Ryugu | APO | 19.55 | 6,497.9 | 4,907.9 | 6,497.9 | Smallest residual in the sample |

Recommendation:

The locked `100,000 km` DEC-5 target is not empirically validated across this sample as-is. Excluding the Bennu outlier, the measured sample still reaches `258,309.2 km`, so an honest empirical bar for the current hybrid set is closer to `300,000 km` with only `1.16x` headroom over the worst non-Bennu sample. Bennu is qualitatively different: its SBDB osculating solution is anchored at `JD 2455562.5` (`2011-01-01 TDB`) and includes modeled non-gravitational parameters in SBDB, while Slice 7's propagation is intentionally vanilla two-body. Mission-planning fidelity remains out of scope; this remains visualization-grade only.

## Frame Rotation Validation

- `433 Eros` at SBDB epoch:
  - residual: `0.627903 km`
  - Horizons header: `Reference frame : ICRF`
- `4 Vesta` at SBDB epoch:
  - residual: `0.101656 km`
  - Horizons header: `Reference frame : ICRF`
- Conclusion:
  - the ecliptic-to-equatorial rotation is applied correctly
  - there is no sign, axis, time-scale, or Euler-order frame bug in the reference implementation

## Cutover Bars Proposed For INV-012

- Locked target from DEC-5:
  - asteroid position error: `100,000 km` at `1d` propagation cadence
- Pre-research finding:
  - this target is not empirically validated across the measured hybrid sample
  - worst non-Bennu sample: `258,309.2 km` (`10 Hygiea`)
  - Bennu outlier: `6,739,443.6 km` at the end of the validation window
- Honest proposal from the measured data:
  - if the cutover bar must be supported by this exact sample and this exact ingestion source, use `300,000 km`
  - if DEC-5 remains fixed at `100,000 km`, Slice 7 implementation will need an explicit exception/freshness policy for old-epoch or non-gravitational NEA solutions

## Open Questions Surfaced By Pre-Research

- Bennu epoch freshness:
  - SBDB currently returns Bennu with epoch `2455562.5` and orbit comment `See Farnocchia et al. 2021`
  - should Slice 7 accept very old SBDB epochs for curated NEAs, or require a freshness gate for the famous-body subset?
- Main-belt residual spread:
  - Hygiea, Laetitia, Psyche, and Harmonia all exceed `100,000 km`
  - does Slice 7 need a looser visualization-grade bar, or a refreshed-elements workflow, before cutover?
- Close-approach sensitivity:
  - Apophis remains moderate in this window despite its `2029` notoriety
  - Bennu is the only catastrophic outlier in the measured sample
- Selection policy:
  - is the curated eight-body NEA set sufficient for the product story, or should any famous-body additions be screened for epoch freshness first?

## Implementation Notes For Slice 7 Founding Doc

- INV-012 wording draft:
  - "Asteroid catalog bodies propagated from SBDB osculating elements shall remain within the Slice 7 visualization-grade bar against Horizons truth over the validation window. The bar and any freshness exceptions must be stated explicitly for curated NEAs whose SBDB epochs materially predate the validation window."
- `slice7-fixture-spec.md` notes:
  - numbered-asteroid JSON should preserve `designation`, `name`, `a`, `e`, `i`, `om`, `w`, `ma`, `epoch`, `H`, `G`, `condition_code`, `data_arc`, `class`, `neo`, `pha`
  - ingestion should preserve the source epoch exactly; do not silently normalize old epochs away
- Asteroid constants module shape:
  - one catalog metadata module should be sufficient for `designation`, photometry, class, and any famous-body labels
  - there is no new frame constant; reuse `FRAME_HELIO_J2000_ICRF`
- `BodyId` naming:
  - prefer stable string ids such as `asteroid-4`, `asteroid-101955`, `asteroid-99942`
  - numeric designation ids avoid alias churn (`Bennu` vs `101955 Bennu`) while staying reversible

## Files Produced

- `tools/slice7-research/fetch-sbdb.mjs`
- `tools/slice7-research/fetch-horizons-asteroids.mjs`
- `tools/slice7-research/keplerian-propagate.mjs`
- `tools/slice7-research/test-keplerian.mjs`
- `tools/slice7-research/measure-keplerian-accuracy.mjs`
- `tools/slice7-research/validate-frame-rotation.mjs`
- `tools/slice7-research/research-report.md`
- `tools/slice7-research/data/main-belt-top-1000.json`
- `tools/slice7-research/data/famous-neas.json`
- `tools/slice7-research/data/main-belt-cutoff-h.txt`
- `tools/slice7-research/data/main-belt-selection-stats.json`
- `tools/slice7-research/data/sample-asteroids.json`
- `tools/slice7-research/data/keplerian-accuracy.json`
- `tools/slice7-research/data/frame-validation.json`
- `tools/slice7-research/data/horizons-truth/*.json`

## Round 2: Horizons-Anchored Re-Measurement

### Why Round 2 Was Necessary

Round 1 proved the two-body propagator and frame math were fundamentally sound, but it also exposed a source-data problem: SBDB epochs are heterogeneous. Bennu was the clearest failure mode. SBDB supplied Bennu's osculating elements at `JD 2455562.5` (`2011-01-01 TDB`), so a two-body propagation from 2011 to the 2026 validation window accumulated a completely non-representative visualization error. That was not the product question Slice 7 actually needs to answer.

Round 2 changes only the anchor source:

- SBDB remains the canonical source for body selection and metadata enrichment.
- Horizons becomes the canonical source for propagation anchor state at a uniform recent epoch.

This isolates the Slice 7 question correctly: given a recent heliocentric anchor state for each selected asteroid, how well does vanilla two-body Keplerian propagation hold over the 90-day validation window?

### Refined Methodology

- SBDB role:
  - select the Top `1000` main-belt bodies after quality gates
  - provide `H`, `G`, orbit class, `condition_code`, `data_arc`, and designation metadata
- Horizons role:
  - provide one heliocentric `ICRF` Cartesian anchor state per selected asteroid
  - uniform anchor epoch: `JD 2461161.5` (`2026-05-01 00:00:00 TDB`)
- Round 2 flow:
  1. Fetch Cartesian anchor states for all `1008` selected bodies into `horizons-anchors.json`
  2. Convert anchor state to osculating elements
  3. Propagate forward with the existing `keplerian-propagate.mjs` unchanged
  4. Compare against the existing round-1 Horizons truth window

DEC-2 refinement for the founding doc:

- SBDB is canonical for inventory and metadata.
- Horizons is canonical for recent propagation anchor state.
- Slice 7 therefore uses two ingestion sources with distinct purposes, not one source pretending to satisfy both.

### Re-Measured Accuracy Table

| Body | Class | H | Round 1 max (km) | Round 2 max (km) | Round 1 RMS (km) | Round 2 RMS (km) | Round 1 @90d (km) | Round 2 @90d (km) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hygiea | MBA | 5.65 | 258,309.2 | 35,313.4 | 177,398.8 | 15,843.2 | 258,309.2 | 35,313.4 |
| Psyche | MBA | 6.20 | 123,839.9 | 22,510.4 | 81,839.7 | 9,934.2 | 123,839.9 | 22,510.4 |
| Laetitia | MBA | 5.97 | 143,909.3 | 13,853.8 | 104,710.3 | 6,299.1 | 143,909.3 | 13,853.8 |
| Harmonia | MBA | 6.56 | 115,772.3 | 10,583.0 | 79,951.0 | 4,807.6 | 115,772.3 | 10,583.0 |
| Wanda | MBA | 10.98 | 75,302.6 | 8,322.0 | 54,246.8 | 3,746.6 | 75,302.6 | 8,322.0 |
| Geographos | APO | 15.26 | 24,690.3 | 4,411.3 | 22,839.0 | 1,731.1 | 21,966.7 | 4,411.3 |
| Toutatis | APO | 15.29 | 28,847.5 | 4,390.6 | 19,975.7 | 1,992.6 | 28,847.5 | 4,390.6 |
| Eunomia | MBA | 5.43 | 36,869.5 | 4,295.0 | 25,640.8 | 1,934.5 | 36,869.5 | 4,295.0 |
| Bennu | APO | 20.21 | 8,363,734.8 | 4,236.4 | 7,507,255.9 | 1,827.0 | 6,739,443.6 | 4,236.4 |
| Ryugu | APO | 19.55 | 6,497.9 | 4,122.0 | 4,907.9 | 1,708.7 | 6,497.9 | 4,122.0 |
| Juno | MBA | 5.19 | 30,565.9 | 3,796.2 | 21,039.4 | 1,755.9 | 30,565.9 | 3,796.2 |
| Pallas | MBA | 4.11 | 27,503.0 | 3,757.9 | 19,514.5 | 1,746.9 | 27,503.0 | 3,757.9 |
| Ceres | MBA | 3.35 | 28,763.9 | 3,312.7 | 19,598.0 | 1,503.1 | 28,763.9 | 3,312.7 |
| Eros | AMO | 10.39 | 47,340.7 | 3,277.4 | 33,001.5 | 1,431.1 | 47,340.7 | 3,277.4 |
| Vesta | MBA | 3.25 | 24,762.4 | 3,210.8 | 17,276.6 | 1,496.2 | 24,762.4 | 3,210.8 |
| Castalia | APO | 17.40 | 7,596.9 | 2,989.2 | 7,168.9 | 1,352.6 | 6,408.8 | 2,989.2 |
| Itokawa | APO | 19.26 | 16,826.2 | 1,707.3 | 10,662.4 | 802.1 | 16,826.2 | 1,707.3 |
| Apophis | ATE | 19.09 | 20,386.9 | 1,506.2 | 14,461.1 | 623.8 | 20,386.9 | 1,506.2 |

### Side-by-Side Interpretation

- Worst sampled round-1 body excluding Bennu:
  - `10 Hygiea` at `258,309.2 km`
- Worst sampled round-2 body:
  - `10 Hygiea` at `35,313.4 km`
- Bennu specifically:
  - round 1 max: `8,363,734.8 km`
  - round 2 max: `4,236.4 km`
  - round 1 day-90: `6,739,443.6 km`
  - round 2 day-90: `4,236.4 km`
  - day-90 improvement: about `1591x`

The Bennu result confirms the diagnosis from round 1. The catastrophic error was driven by stale anchor epoch, not by a deeper failure of two-body Kepler propagation over a 90-day visualization window.

### Updated INV-012 Recommendation

- Proposed bar:
  - keep `INV-012 = 100,000 km` at `1d` cadence
- Empirical support after round 2:
  - worst sampled body: `35,313.4 km` (`10 Hygiea`)
  - margin to `100,000 km`: `2.83x`
- Interpretation:
  - the locked `100,000 km` target is now empirically validated across the representative 18-body sample
  - the round-2 anchor policy is a necessary precondition for that statement to remain honest

### Round 2 Files Added

- `tools/slice7-research/fetch-horizons-anchors.mjs`
- `tools/slice7-research/state-to-elements.mjs`
- `tools/slice7-research/test-state-to-elements.mjs`
- `tools/slice7-research/measure-keplerian-anchored.mjs`
- `tools/slice7-research/data/horizons-anchors.json`
- `tools/slice7-research/data/keplerian-accuracy-anchored.json`
