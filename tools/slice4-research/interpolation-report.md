# Slice 4 Interpolation Measurement Report

## Methodology

- Window: `2026-05-01` through `2026-07-30`
- Bodies in scope: Saturn, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus
- Candidate cadences measured: `1 d`, `12 h`, `6 h`, `3 h`
- Truth cadence: `30 m` for the baseline matrix; `15 m` for any conditional supplements
- Interpolation method: cubic Hermite using Horizons-provided positions and velocities
- Frames:
  - Saturn measured in its fetched heliocentric frame (`CENTER='@sun'`)
  - All seven moons measured in their fetched Saturn-centered frame (`CENTER='500@699'`)
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
| Saturn | 1 d | 0.202399 | 0.0703748 | 4230 |
| Saturn | 12 h | 0.0177869 | 0.00547578 | 4140 |
| Saturn | 6 h | 0.00129034 | 0.000430854 | 3960 |
| Saturn | 3 h | 0.000310849 | 0.000234471 | 3600 |
| Titan | 1 d | 95.992 | 50.818 | 4230 |
| Titan | 12 h | 6.034 | 3.218 | 4140 |
| Titan | 6 h | 0.377298 | 0.205781 | 3960 |
| Titan | 3 h | 0.0235973 | 0.0134943 | 3600 |
| Rhea | 1 d | 5012.81 | 3201.75 | 4230 |
| Rhea | 12 h | 321.20 | 207.34 | 4140 |
| Rhea | 6 h | 20.202 | 13.332 | 3960 |
| Rhea | 3 h | 1.265 | 0.875430 | 3600 |
| Iapetus | 1 d | 0.618783 | 0.254338 | 4230 |
| Iapetus | 12 h | 0.0451265 | 0.0164700 | 4140 |
| Iapetus | 6 h | 0.00283625 | 0.00106144 | 3960 |
| Iapetus | 3 h | 0.000186553 | 0.000104938 | 3600 |
| Tethys | 1 d | 78078.10 | 50083.77 | 4230 |
| Tethys | 12 h | 5626.02 | 3655.69 | 4140 |
| Tethys | 6 h | 364.16 | 242.05 | 3960 |
| Tethys | 3 h | 22.958 | 16.010 | 3600 |
| Dione | 1 d | 25321.76 | 16070.21 | 4230 |
| Dione | 12 h | 1697.22 | 1086.56 | 4140 |
| Dione | 6 h | 107.96 | 70.615 | 3960 |
| Dione | 3 h | 6.778 | 4.649 | 3600 |
| Mimas | 1 d | 428800.61 | 270355.38 | 4230 |
| Mimas | 12 h | 53648.07 | 32156.11 | 4140 |
| Mimas | 6 h | 4074.36 | 2388.55 | 3960 |
| Mimas | 3 h | 267.98 | 162.63 | 3600 |
| Enceladus | 1 d | 192439.81 | 121882.92 | 4230 |
| Enceladus | 12 h | 16130.06 | 10196.37 | 4140 |
| Enceladus | 6 h | 1084.70 | 697.35 | 3960 |
| Enceladus | 3 h | 69.043 | 46.497 | 3600 |

## Cadence Recommendation Per Body

- Saturn: recommend 1 d as the loosest cadence under the ~10 km target. Max 0.202399 km at 1 d.
- Titan: recommend 12 h as the loosest cadence under the ~10 km target. Max 6.034 km at 12 h.
- Rhea: recommend 3 h as the loosest cadence under the ~10 km target. Max 1.265 km at 3 h.
- Iapetus: recommend 1 d as the loosest cadence under the ~10 km target. Max 0.618783 km at 1 d.
- Tethys: recommend 1 h as the loosest cadence under the ~10 km target. Max 0.284336 km at 1 h.
- Dione: recommend 3 h as the loosest cadence under the ~10 km target. Max 6.778 km at 3 h.
- Mimas: recommend 1 h as the loosest cadence under the ~10 km target. Max 3.359 km at 1 h.
- Enceladus: recommend 1 h as the loosest cadence under the ~10 km target. Max 0.857091 km at 1 h.

## Recommended Cutover Bars Per Body

Suggested cutover bars are computed as `3 × max error`, rounded up to a clean number, using the recommended cadence for each body.

- Saturn: 1 d cadence, max 0.202399 km, suggested bar 1 km, honest margin 4.9x.
- Titan: 12 h cadence, max 6.034 km, suggested bar 20 km, honest margin 3.3x.
- Rhea: 3 h cadence, max 1.265 km, suggested bar 5 km, honest margin 4.0x.
- Iapetus: 1 d cadence, max 0.618783 km, suggested bar 2 km, honest margin 3.2x.
- Tethys: 1 h cadence, max 0.284336 km, suggested bar 1 km, honest margin 3.5x.
- Dione: 3 h cadence, max 6.778 km, suggested bar 50 km, honest margin 7.4x.
- Mimas: 1 h cadence, max 3.359 km, suggested bar 20 km, honest margin 6.0x.
- Enceladus: 1 h cadence, max 0.857091 km, suggested bar 5 km, honest margin 5.8x.

## Cadence Policy Recommendation

Per-body cadence is the correct Slice 4 policy. A shared cadence would waste storage on slow bodies like Saturn, Titan, and Iapetus while still under-serving fast local motion in the inner Saturn system. Mimas is the cadence driver at 1 h. Enceladus settles at 1 h. The Mimas supplement was required. The Enceladus supplement was required. Projected Saturn-system fixture size, if only the recommended cadences are retained in a single tuple-based fixture envelope matching the Slice 3 builder pattern, is about 1.76 MiB (1846463 bytes).

## Notes and Anomalies

- `CENTER='500@699'` worked on the first try for all seven Saturnian moons; no center-ambiguity workaround was required.
- Saturn daily cadence is expected to be viable because the heliocentric motion is smooth over this 90-day window.
- Mimas at 3 h is the new cadence cliff: max error is 267.98 km, so the supplement is required.
- Enceladus at 3 h exceeds the ~10 km target (69.043 km), so a denser supplement is required.
- Tethys at 3 h exceeds the ~10 km target (22.958 km), so a denser supplement is required.
- The Mimas supplement is incorporated into the recommendation set below.
- The Enceladus supplement is incorporated into the recommendation set below.

## Data Provenance

- API endpoint: `https://ssd.jpl.nasa.gov/api/horizons.api`
- Cached data directory: `tools/slice4-research/data/`
- Saturn: fetched 2026-05-02T15:57:02.860Z; cached files: tools/slice4-research/data/daily-saturn.json, tools/slice4-research/data/12h-saturn.json, tools/slice4-research/data/6h-saturn.json, tools/slice4-research/data/3h-saturn.json, tools/slice4-research/data/truth-saturn.json
- Titan: fetched 2026-05-02T15:57:04.626Z; cached files: tools/slice4-research/data/daily-titan.json, tools/slice4-research/data/12h-titan.json, tools/slice4-research/data/6h-titan.json, tools/slice4-research/data/3h-titan.json, tools/slice4-research/data/truth-titan.json
- Rhea: fetched 2026-05-02T15:57:06.381Z; cached files: tools/slice4-research/data/daily-rhea.json, tools/slice4-research/data/12h-rhea.json, tools/slice4-research/data/6h-rhea.json, tools/slice4-research/data/3h-rhea.json, tools/slice4-research/data/truth-rhea.json
- Iapetus: fetched 2026-05-02T15:57:08.160Z; cached files: tools/slice4-research/data/daily-iapetus.json, tools/slice4-research/data/12h-iapetus.json, tools/slice4-research/data/6h-iapetus.json, tools/slice4-research/data/3h-iapetus.json, tools/slice4-research/data/truth-iapetus.json
- Tethys: fetched 2026-05-02T15:57:10.027Z; cached files: tools/slice4-research/data/daily-tethys.json, tools/slice4-research/data/12h-tethys.json, tools/slice4-research/data/6h-tethys.json, tools/slice4-research/data/3h-tethys.json, tools/slice4-research/data/truth-tethys.json
- Dione: fetched 2026-05-02T15:57:11.769Z; cached files: tools/slice4-research/data/daily-dione.json, tools/slice4-research/data/12h-dione.json, tools/slice4-research/data/6h-dione.json, tools/slice4-research/data/3h-dione.json, tools/slice4-research/data/truth-dione.json
- Mimas: fetched 2026-05-02T15:57:13.568Z; cached files: tools/slice4-research/data/daily-mimas.json, tools/slice4-research/data/12h-mimas.json, tools/slice4-research/data/6h-mimas.json, tools/slice4-research/data/3h-mimas.json, tools/slice4-research/data/truth-mimas.json
- Enceladus: fetched 2026-05-02T15:57:15.431Z; cached files: tools/slice4-research/data/daily-enceladus.json, tools/slice4-research/data/12h-enceladus.json, tools/slice4-research/data/6h-enceladus.json, tools/slice4-research/data/3h-enceladus.json, tools/slice4-research/data/truth-enceladus.json

## Mimas Cadence Extension

The baseline 30-minute-truth matrix left Mimas above the ~10 km target at 3 h, so a denser extension was run against 15 m truth.

| Cadence | Max error (km) | RMS error (km) | Truth points |
| --- | ---: | ---: | ---: |
| 1 d | 428800.61 | 268928.69 | 8550 |
| 12 h | 53648.07 | 31812.18 | 8460 |
| 6 h | 4074.36 | 2336.04 | 8280 |
| 3 h | 267.98 | 155.03 | 7920 |
| 1 h | 3.359 | 2.145 | 6480 |
| 30 m | 0.210263 | 0.181886 | 4320 |

Recommendation: use 1 h for Mimas. Max error is 3.359 km at 1 h.


## Enceladus Cadence Extension

The baseline 30-minute-truth matrix left Enceladus above the ~10 km target at 3 h, so a denser extension was run against 15 m truth.

| Cadence | Max error (km) | RMS error (km) | Truth points |
| --- | ---: | ---: | ---: |
| 1 d | 192439.81 | 121239.73 | 8550 |
| 12 h | 16130.06 | 10087.31 | 8460 |
| 6 h | 1084.70 | 682.02 | 8280 |
| 3 h | 69.043 | 44.324 | 7920 |
| 1 h | 0.857091 | 0.609372 | 6480 |
| 30 m | 0.0536029 | 0.0516503 | 4320 |

Recommendation: use 1 h for Enceladus. Max error is 0.857091 km at 1 h.


## Tethys Cadence Extension

The baseline 30-minute-truth matrix left Tethys above the ~10 km target at 3 h, so a denser extension was run against 15 m truth.

| Cadence | Max error (km) | RMS error (km) | Truth points |
| --- | ---: | ---: | ---: |
| 1 d | 78078.10 | 49819.47 | 8550 |
| 12 h | 5626.02 | 3616.59 | 8460 |
| 6 h | 364.16 | 236.73 | 8280 |
| 3 h | 22.958 | 15.262 | 7920 |
| 1 h | 0.284336 | 0.209327 | 6480 |
| 30 m | 0.0177903 | 0.0177419 | 4320 |

Recommendation: use 1 h for Tethys. Max error is 0.284336 km at 1 h.


