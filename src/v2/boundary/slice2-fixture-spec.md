# Slice 2 Fixture Specification

## Overview

The Slice 2 fixture covers six solar-system bodies at daily cadence over a 90-day window. It is the Horizons truth source for Slice 2 validation, extending the Slice 1 Earth/Moon fixture to the full inner solar system.

- Bodies: Sun, Mercury, Venus, Earth, Moon, Mars
- Window: 2026-05-01 to 2026-07-30 (inclusive; ~91 daily records per body)
- Storage location (when created): `tests/fixtures/v2/` — exact filename TBD at implementation time
- Format: same JSON envelope as `tests/fixtures/v2/horizons-earth-moon-30d.json`

## Horizons API parameters

Matches the settings in `tools/slice2-research/fetch-horizons.mjs`.

| Parameter     | Value       |
|---------------|-------------|
| `EPHEM_TYPE`  | `VECTORS`   |
| `REF_SYSTEM`  | `ICRF`      |
| `REF_PLANE`   | `FRAME`     |
| `TIME_TYPE`   | `TDB`       |
| `OUT_UNITS`   | `KM-S`      |
| `VEC_TABLE`   | `2`         |
| `START_TIME`  | `2026-05-01`|
| `STOP_TIME`   | `2026-07-30`|
| `STEP_SIZE`   | `1d`        |

### Center IDs per body

| Body    | NAIF `COMMAND` | `CENTER`    | Notes |
|---------|---------------|-------------|-------|
| Sun     | `10`          | `@ssb`      | SSB-relative; places Sun origin at Solar System Barycenter. Treated as `FRAME_HELIO_J2000_ICRF` at ingestion. |
| Mercury | `199`         | `@sun`      | Heliocentric ICRF J2000 |
| Venus   | `299`         | `@sun`      | Heliocentric ICRF J2000 |
| Earth   | `399`         | `@sun`      | Heliocentric ICRF J2000 |
| Moon    | `301`         | `500@399`   | **Must use numeric geocenter ID.** `@earth` is ambiguous in VECTORS mode and may resolve to the Earth-Moon barycenter rather than the geocenter. |
| Mars    | `499`         | `@sun`      | Heliocentric ICRF J2000 |

## JSON envelope

Top-level structure (same outer shape as Slice 1):

```json
{
  "source": "NASA/JPL Horizons API",
  "frame": "ICRF/J2000",
  "timeScale": "TDB",
  "units": { "position": "km", "velocity": "km/s", "time": "TDB Julian Date" },
  "targets": {
    "sun":     { "targetId": "10",  "center": "@ssb",    "origin": "ssb",        "records": [...] },
    "mercury": { "targetId": "199", "center": "@sun",    "origin": "heliocentric","records": [...] },
    "venus":   { "targetId": "299", "center": "@sun",    "origin": "heliocentric","records": [...] },
    "earth":   { "targetId": "399", "center": "@sun",    "origin": "heliocentric","records": [...] },
    "moon":    { "targetId": "301", "center": "500@399", "origin": "geocentric",  "records": [...] },
    "mars":    { "targetId": "499", "center": "@sun",    "origin": "heliocentric","records": [...] }
  }
}
```

The Moon target carries `"origin": "geocentric"` so that `inferCanonicalFrame` in `boundary/horizons.ts` resolves to `FRAME_GCRS_EARTH`.

## Record format

Each entry in a `records` array is a 7-tuple (`HorizonsTupleRecord`):

```
[tdb_julian_date, x_km, y_km, z_km, vx_km_s, vy_km_s, vz_km_s]
```

No format change from Slice 1.

## Frame assignments after ingestion

| Body    | Canonical V2 frame              |
|---------|---------------------------------|
| Sun     | `FRAME_HELIO_J2000_ICRF`        |
| Mercury | `FRAME_HELIO_J2000_ICRF`        |
| Venus   | `FRAME_HELIO_J2000_ICRF`        |
| Earth   | `FRAME_HELIO_J2000_ICRF`        |
| Moon    | `FRAME_GCRS_EARTH`              |
| Mars    | `FRAME_HELIO_J2000_ICRF`        |

## Boundary conversion responsibilities

These conversions happen in `src/v2/boundary/horizons.ts` at ingestion time. No km, km/s, or TDB Julian Date values may appear past the boundary layer.

| Raw Horizons value | Conversion | Canonical V2 value |
|--------------------|------------|-------------------|
| position in km     | `x * 1000` | position in meters |
| velocity in km/s   | `v * 1000` | velocity in m/s    |
| TDB Julian Date    | `(jd - 2451545.0) * 86400` | TDB seconds since J2000 |

## Ingestion template

`ingestSlice1EarthMoonFixture` in `src/v2/boundary/horizons.ts` is the model. Slice 2 adds an `ingestSlice2Fixture` entry point that calls the existing generic `ingestHorizonsFixture` pipeline and validates that all six expected target keys are present. No changes to the shared conversion pipeline are required.

## Cutover bars

From `tools/slice2-research/interpolation-report.md` (3 × max Hermite error, rounded up):

| Body    | Cutover bar |
|---------|------------|
| Sun     | 0.00002 km |
| Mercury | 100 km     |
| Venus   | 1 km       |
| Earth   | 0.5 km     |
| Moon    | 20 km      |
| Mars    | 0.05 km    |

These bars are codified as INV-008.
