# Slice 6 Mars System Pre-Research Report

## Methodology

- Horizons API parameters follow the Slice 4 inheritance unchanged:
  - `EPHEM_TYPE='VECTORS'`
  - `REF_SYSTEM='ICRF'`
  - `REF_PLANE='FRAME'`
  - `TIME_TYPE='TDB'`
  - `OUT_UNITS='KM-S'`
  - `VEC_TABLE='2'`
- Validation window: `2026-05-01` through `2026-07-30` (`90` days, producing `91` endpoint-inclusive daily samples for Mars and the corresponding dense moon series).
- Mars was fetched heliocentrically with `CENTER='500@10'`.
- Phobos and Deimos were fetched Mars-centered with `CENTER='500@499'`.
- Cadence measurement uses cubic Hermite interpolation against denser Horizons truth, matching the Slice 4 measurement pattern:
  - Phobos truth: `5m`
  - Deimos truth: `15m`
- Body radii come from `vendor/naif/pck00010.tpc`.
- Output artifacts:
  - `tools/slice6-research/fetch-horizons.mjs`
  - `tools/slice6-research/measure-interpolation.mjs`
  - `tools/slice6-research/pck-extraction.md`
  - `tools/slice6-research/data/*.json`
  - `tools/slice6-research/research-report.md`

## Body Constants

| Body | Source radii a/b/c (km) | Render policy | Derived note |
| --- | --- | --- | --- |
| Mars | `3396.19 / 3396.19 / 3376.20` | Oblate ellipsoid | Flattening `(a - c) / a = 0.00589` (`0.589%`) |
| Phobos | `13.0 / 11.4 / 9.1` | Sphere using `a` only | Triaxial spread `(a - c) / a = 30.0%` |
| Deimos | `7.8 / 6.0 / 5.1` | Sphere using `a` only | Triaxial spread `(a - c) / a = 34.6%` |

Mars mass cross-reference:

- NASA Mars fact sheet mass: `0.64169 × 10^24 kg` (`6.4169e23 kg`)
- NASA Mars fact sheet equatorial/polar radii: `3396.2 km / 3376.2 km`
- `pck00010.tpc` and the NASA fact sheet align to expected rounding precision.

Mars alignment conclusion:

- Slice 2's existing Mars documentation already matches `pck00010.tpc`.
- No Mars constants discrepancy was surfaced by Slice 6 pre-research.

## Phobos Cadence Measurements

| Cadence | Max error (km) | RMS error (km) | Margin to 5 km bar | Recommendation |
| --- | ---: | ---: | ---: | --- |
| 1h | 12.320749 | 7.346832 | 0.4× | Reject |
| 30m | 0.778772 | 0.486017 | 6.4× | Recommended production cadence |
| 15m | 0.038589 | 0.034440 | 129.6× | Overkill for Slice 6 |

Recommendation:

Slice 6 should use `30m` cadence for Phobos. It is the loosest cadence that still clears a plausible `5 km` bar with honest `6.4×` headroom while avoiding the large fixture growth and unnecessary density of `15m`. `1h` is empirically unacceptable at `12.320749 km` max error.

## Deimos Cadence Measurements

| Cadence | Max error (km) | RMS error (km) | Margin to 0.5 km bar | Recommendation |
| --- | ---: | ---: | ---: | --- |
| 1h | 0.113195 | 0.083287 | 4.4× | Recommended production cadence |
| 30m | 0.007079 | 0.007060 | 70.6× | Overkill for Slice 6 |

Recommendation:

Slice 6 should use `1h` cadence for Deimos. The measured max error is only `0.113195 km`, which comfortably clears a `0.5 km` bar with `4.4×` headroom.

## Proposed Cutover Bars For INV-011

- Mars:
  - Existing Slice 2 founding-doc bar remains `0.05 km` at `1d` cadence.
  - Dispatch note: the Slice 6 task text said “Mars: `1 km` at `1d` (matches Slice 2 Mars existing bar)”, but the current founding document and tests both codify `Mars = 0.05 km`.
  - Pre-research does not revise Mars here; Slice 6 founding-doc work should resolve that wording inconsistency explicitly.
- Phobos:
  - Proposed cadence: `30m`
  - Measured max: `0.778772 km`
  - Proposed bar: `5 km`
  - Honest headroom: `6.4×`
- Deimos:
  - Proposed cadence: `1h`
  - Measured max: `0.113195 km`
  - Proposed bar: `0.5 km`
  - Honest headroom: `4.4×`

## Open Questions Surfaced By Pre-Research

- Mars bar wording inconsistency:
  - The Slice 6 dispatch text says Mars should use `1 km` at `1d`.
  - The current founding doc and tests say Mars uses `0.05 km`.
  - Slice 6 founding-doc work needs to choose one explicitly rather than assuming they already match.
- Phobos visual adequacy:
  - `30m` cadence is clearly good enough numerically (`0.778772 km` max), but Phobos is only `26 km` across on its longest axis.
  - Even so, the measured error is only about `3.0%` of Phobos's full `a`-axis diameter, which is acceptable for honest-mode visual cutover.
- SPK pressure signal:
  - The trigger condition named in the dispatch did not surface.
  - `15m` Phobos cadence is far below `5 km` error, so Slice 6 does not empirically justify SPK ingestion yet.
  - The real empirical red line from this pre-research is instead that `1h` Phobos cadence fails badly, so Slice 6 must keep the moon on a denser fixture cadence.

## Files Produced

- `tools/slice6-research/fetch-horizons.mjs`
- `tools/slice6-research/measure-interpolation.mjs`
- `tools/slice6-research/pck-extraction.md`
- `tools/slice6-research/research-report.md`
- `tools/slice6-research/data/mars-1d.json`
- `tools/slice6-research/data/phobos-5m.json`
- `tools/slice6-research/data/phobos-15m.json`
- `tools/slice6-research/data/phobos-30m.json`
- `tools/slice6-research/data/phobos-1h.json`
- `tools/slice6-research/data/deimos-15m.json`
- `tools/slice6-research/data/deimos-30m.json`
- `tools/slice6-research/data/deimos-1h.json`
- `tools/slice6-research/data/cadence-measurements.json`
