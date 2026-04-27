# Slice 2 Interpolation Measurement Report

## Window

- Start: `2026-05-01`
- Stop: `2026-07-30`
- Daily cadence: `1d`
- Truth cadence: `6h`

## Horizons API Parameters

- `EPHEM_TYPE='VECTORS'`
- `REF_SYSTEM='ICRF'`
- `REF_PLANE='FRAME'`
- `TIME_TYPE='TDB'`
- `OUT_UNITS='KM-S'`
- `VEC_TABLE='2'`
- Centers:
  - Sun: `@ssb`
  - Mercury: `@sun`
  - Venus: `@sun`
  - Earth: `@sun`
  - Moon: `500@399` (explicit Earth geocenter; `@earth` was ambiguous in this API mode)
  - Mars: `@sun`

## Measured Errors

| Body | Interpolated truth points | Max linear error (km) | RMS linear error (km) | Max Hermite error (km) | RMS Hermite error (km) | Recommended cutover bar (km) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| sun | 270 | 0.208582 | 0.154208 | 0.00000354105 | 0.00000124501 | 0.00002 |
| mercury | 270 | 58500.373749 | 33157.321942 | 20.045560 | 6.843630 | 100 |
| venus | 270 | 10720.950171 | 8960.743515 | 0.181879 | 0.130624 | 1 |
| earth | 270 | 5448.009681 | 4527.467364 | 0.0906939 | 0.0355577 | 0.5 |
| moon | 270 | 2918.290643 | 2136.024256 | 4.976563 | 2.286379 | 20 |
| mars | 270 | 2861.438287 | 2287.658378 | 0.00893253 | 0.00528875 | 0.05 |

## Recommendation

Recommended Slice 2 cutover bars are set to `3 × max Hermite error`, rounded up to a clean number for each body. These bars are intended for daily sample caches interpolated to intermediate timesteps using cubic Hermite interpolation with Horizons-provided velocities.
