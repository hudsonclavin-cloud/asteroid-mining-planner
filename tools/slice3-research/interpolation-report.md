# Slice 3 Interpolation Measurement Report

## Methodology

- Window: `2026-05-01` through `2026-07-30`
- Bodies in scope: Jupiter, Io, Europa, Ganymede, Callisto
- Candidate cadences measured: `1 d`, `12 h`, `6 h`, `3 h`
- Truth cadence: `30 m`
- Interpolation method: cubic Hermite using Horizons-provided positions and velocities
- Frames:
  - Jupiter measured in its fetched heliocentric frame (`CENTER='@sun'`)
  - Galileans measured in their fetched Jupiter-centered frame (`CENTER='500@599'`)
- Horizons API parameters:
  - `EPHEM_TYPE='VECTORS'`
  - `REF_SYSTEM='ICRF'`
  - `REF_PLANE='FRAME'`
  - `TIME_TYPE='TDB'`
  - `OUT_UNITS='KM-S'`
  - `VEC_TABLE='2'`

## Per-Body Results

| Body | Cadence | Max error (km) | RMS error (km) | Truth points |
| --- | --- | ---: | ---: | ---: |
| Jupiter | 1 d | 7.143 | 4.244 | 4230 |
| Jupiter | 12 h | 0.527573 | 0.316213 | 4140 |
| Jupiter | 6 h | 0.0346985 | 0.0210464 | 3960 |
| Jupiter | 3 h | 0.00234404 | 0.00142857 | 3600 |
| Io | 1 d | 143273.20 | 90457.36 | 4230 |
| Io | 12 h | 10655.69 | 6741.76 | 4140 |
| Io | 6 h | 695.54 | 448.64 | 3960 |
| Io | 3 h | 43.944 | 29.713 | 3600 |
| Europa | 1 d | 17315.59 | 10488.38 | 4230 |
| Europa | 12 h | 1135.80 | 690.13 | 4140 |
| Europa | 6 h | 71.859 | 44.553 | 3960 |
| Europa | 3 h | 4.504 | 2.929 | 3600 |
| Ganymede | 1 d | 1665.65 | 1054.77 | 4230 |
| Ganymede | 12 h | 105.53 | 67.294 | 4140 |
| Ganymede | 6 h | 6.610 | 4.311 | 3960 |
| Ganymede | 3 h | 0.414147 | 0.282820 | 3600 |
| Callisto | 1 d | 110.89 | 63.339 | 4230 |
| Callisto | 12 h | 7.017 | 4.013 | 4140 |
| Callisto | 6 h | 0.440478 | 0.256650 | 3960 |
| Callisto | 3 h | 0.0275917 | 0.0168314 | 3600 |

## Cadence Recommendation Per Body

- Jupiter: recommend 1 d as the loosest cadence under the ~10 km target. max 7.143 km at 1 d.
- Io: recommend 3 h as the loosest cadence under the ~10 km target. 3 h still exceeds ~10 km; Io extension required.
- Europa: recommend 3 h as the loosest cadence under the ~10 km target. max 4.504 km at 3 h.
- Ganymede: recommend 6 h as the loosest cadence under the ~10 km target. max 6.610 km at 6 h.
- Callisto: recommend 12 h as the loosest cadence under the ~10 km target. max 7.017 km at 12 h.

## Recommended Cutover Bars Per Body

Suggested cutover bars are computed as `3 × max error`, rounded up to a clean number, using the recommended cadence for each body.

- Jupiter: 1 d cadence, max 7.143 km, suggested bar 50 km, honest margin 7.0x.
- Io: 3 h cadence, max 43.944 km, suggested bar 200 km, honest margin 4.6x.
- Europa: 3 h cadence, max 4.504 km, suggested bar 20 km, honest margin 4.4x.
- Ganymede: 6 h cadence, max 6.610 km, suggested bar 20 km, honest margin 3.0x.
- Callisto: 12 h cadence, max 7.017 km, suggested bar 50 km, honest margin 7.1x.

## Cadence Policy Recommendation

Per-body cadence is the better policy. A uniform cadence wastes storage on slow-changing bodies while still under-serving fast local motion in the Jupiter system, especially Io. The results support choosing the loosest cadence per body that stays under roughly 10 km max interpolation error, then setting each body's cutover bar from that measured max.

## Notes and Anomalies

- `CENTER='500@599'` worked on the first try for all four Galileans; no center-ambiguity workaround was required.
- Jupiter daily cadence is expected to be viable because the heliocentric motion is smooth over this window.
- Io is the most likely outlier because its orbital timescale is short relative to the coarser candidate cadences.
- Io exceeds the ~10 km target at 3 h cadence in this first-pass experiment, so the Io cadence extension is required.

## Data Provenance

- API endpoint: `https://ssd.jpl.nasa.gov/api/horizons.api`
- Cached data directory: `tools/slice3-research/data/`
- Jupiter: fetched 2026-04-29T23:51:29.617Z; cached files: tools/slice3-research/data/daily-jupiter.json, tools/slice3-research/data/12h-jupiter.json, tools/slice3-research/data/6h-jupiter.json, tools/slice3-research/data/3h-jupiter.json, tools/slice3-research/data/truth-jupiter.json
- Io: fetched 2026-04-29T23:51:31.343Z; cached files: tools/slice3-research/data/daily-io.json, tools/slice3-research/data/12h-io.json, tools/slice3-research/data/6h-io.json, tools/slice3-research/data/3h-io.json, tools/slice3-research/data/truth-io.json
- Europa: fetched 2026-04-29T23:51:33.060Z; cached files: tools/slice3-research/data/daily-europa.json, tools/slice3-research/data/12h-europa.json, tools/slice3-research/data/6h-europa.json, tools/slice3-research/data/3h-europa.json, tools/slice3-research/data/truth-europa.json
- Ganymede: fetched 2026-04-29T23:51:34.879Z; cached files: tools/slice3-research/data/daily-ganymede.json, tools/slice3-research/data/12h-ganymede.json, tools/slice3-research/data/6h-ganymede.json, tools/slice3-research/data/3h-ganymede.json, tools/slice3-research/data/truth-ganymede.json
- Callisto: fetched 2026-04-29T23:51:36.765Z; cached files: tools/slice3-research/data/daily-callisto.json, tools/slice3-research/data/12h-callisto.json, tools/slice3-research/data/6h-callisto.json, tools/slice3-research/data/3h-callisto.json, tools/slice3-research/data/truth-callisto.json

