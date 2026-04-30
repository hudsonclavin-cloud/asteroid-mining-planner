# Slice 3 Fixture Specification

## Overview

The Slice 3 fixture covers five Jupiter-system bodies over a 90-day window using per-body cadence. It extends the Slice 2 Horizons fixture model to mixed sampling density while preserving the same JSON envelope and the same boundary conversion rules.

- Bodies: Jupiter, Io, Europa, Ganymede, Callisto
- Window: 2026-05-01 to 2026-07-30
- Cadence policy: per-body cadence, not a shared timestep grid
- Storage location (when created): `tests/fixtures/v2/` — exact filename TBD at implementation time
- Format: single JSON envelope with one `targets` entry per body

## Horizons API Parameters

Matches the settings in `tools/slice3-research/fetch-horizons.mjs`.

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

Implementation note: `STEP_SIZE` values must be quoted strings such as `'1 d'` and `'12 h'`. The pre-research fetcher established that Horizons rejects the spaced values when the quotes are omitted.

## Body Cadence Table

| Body     | NAIF `COMMAND` | `CENTER`  | `STEP_SIZE` | Notes |
|----------|----------------|-----------|-------------|-------|
| Jupiter  | `599`          | `@sun`    | `'1 d'`     | Heliocentric ICRF J2000 |
| Io       | `501`          | `500@599` | `'1 h'`     | Jupiter geocenter explicit ID; `@jupiter` not tested but presumed similarly ambiguous in VECTORS mode |
| Europa   | `502`          | `500@599` | `'3 h'`     | Jupiter geocenter explicit ID |
| Ganymede | `503`          | `500@599` | `'6 h'`     | Jupiter geocenter explicit ID |
| Callisto | `504`          | `500@599` | `'12 h'`    | Jupiter geocenter explicit ID |

## JSON Envelope

Top-level structure extends the Slice 2 envelope while allowing each target's `records` array to carry its own timestamp grid:

```json
{
  "source": "NASA/JPL Horizons API",
  "frame": "ICRF/J2000",
  "timeScale": "TDB",
  "units": { "position": "km", "velocity": "km/s", "time": "TDB Julian Date" },
  "targets": {
    "jupiter":   { "targetId": "599", "center": "@sun",    "origin": "heliocentric",    "records": [...] },
    "io":        { "targetId": "501", "center": "500@599", "origin": "jupiter-centered", "records": [...] },
    "europa":    { "targetId": "502", "center": "500@599", "origin": "jupiter-centered", "records": [...] },
    "ganymede":  { "targetId": "503", "center": "500@599", "origin": "jupiter-centered", "records": [...] },
    "callisto":  { "targetId": "504", "center": "500@599", "origin": "jupiter-centered", "records": [...] }
  }
}
```

Each body's `records` array carries its own timestamp grid. The fixture is explicitly per-body cadence, not a uniform cadence across all five bodies.

## Record Format

Each entry in a `records` array is a 7-tuple (`HorizonsTupleRecord`):

```text
[tdb_julian_date, x_km, y_km, z_km, vx_km_s, vy_km_s, vz_km_s]
```

No tuple-shape change from Slice 2.

## Origin Tags and Frame Inference

- Jupiter target uses `"origin": "heliocentric"`.
- Galilean targets use `"origin": "jupiter-centered"`.
- The boundary `inferCanonicalFrame` implementation must resolve `"jupiter-centered"` to `FRAME_JUPITER_J2000_ICRF`.

## Frame Assignments After Ingestion

| Body     | Canonical V2 frame              |
|----------|---------------------------------|
| Jupiter  | `FRAME_HELIO_J2000_ICRF`        |
| Io       | `FRAME_JUPITER_J2000_ICRF`      |
| Europa   | `FRAME_JUPITER_J2000_ICRF`      |
| Ganymede | `FRAME_JUPITER_J2000_ICRF`      |
| Callisto | `FRAME_JUPITER_J2000_ICRF`      |

`FRAME_JUPITER_J2000_ICRF` is new in Slice 3.

## Boundary Conversion Responsibilities

These conversions happen in `src/v2/boundary/horizons.ts` at ingestion time. No km, km/s, or TDB Julian Date values may appear past the boundary layer.

| Raw Horizons value | Conversion | Canonical V2 value |
|--------------------|------------|-------------------|
| position in km     | `x * 1000` | position in meters |
| velocity in km/s   | `v * 1000` | velocity in m/s    |
| TDB Julian Date    | `(jd - 2451545.0) * 86400` | TDB seconds since J2000 |

## Cutover Bars

Reference invariant: `src/v2/core/invariants/INV-009.md`

| Body     | Cadence | Cutover bar |
|----------|---------|-------------|
| Jupiter  | `1 d`   | 50 km       |
| Io       | `1 h`   | 5 km        |
| Europa   | `3 h`   | 20 km       |
| Ganymede | `6 h`   | 20 km       |
| Callisto | `12 h`  | 50 km       |

## Implementation Note

`ingestSlice2Fixture` is the direct structural model. Slice 3 adds an `ingestSlice3Fixture` entry point that reuses the generic `ingestHorizonsFixture` / `ingestHorizonsTarget` pipeline and validates that all five expected target keys are present.

The existing generic pipeline already handles per-body cadence naturally because each target record array is independent. No shared timestep grid is required. The new work is target-key validation plus `jupiter-centered` frame inference to `FRAME_JUPITER_J2000_ICRF`.
