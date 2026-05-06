# Slice 6 Fixture Specification

## Purpose

Specifies the JSON envelope contract for Slice 6 fixtures. Slice 6 introduces three new fixture entries — Mars (re-fetched heliocentrically for Slice 6 cutover validation), Phobos (Mars-centered, `30-minute` cadence), and Deimos (Mars-centered, `1-hour` cadence). Slice 6 does not introduce a new architectural fixture pattern; it extends the per-body cadence approach from Slices 3-4.

## Overview

- Bodies: Mars, Phobos, Deimos
- Window: `2026-05-01` to `2026-07-30`
- Cadence policy: per-body cadence, not a shared timestep grid
- Storage location (when created): `tests/fixtures/v2/horizons-mars-system-90d.json`
- Format: single JSON envelope with one `targets` entry per body
- Estimated fixture size: about `3-4 MB`, continuing the growth trend from Slice 4

## Horizons API Parameters

Matches the settings in `tools/slice6-research/fetch-horizons.mjs`.

| Parameter     | Value        |
|---------------|--------------|
| `EPHEM_TYPE`  | `VECTORS`    |
| `REF_SYSTEM`  | `ICRF`       |
| `REF_PLANE`   | `FRAME`      |
| `TIME_TYPE`   | `TDB`        |
| `OUT_UNITS`   | `KM-S`       |
| `VEC_TABLE`   | `2`          |
| `START_TIME`  | `2026-05-01` |
| `STOP_TIME`   | `2026-07-30` |

Implementation note: `STEP_SIZE` values must be quoted strings such as `'30 m'` and `'1 h'`. This is inherited from the Slice 3-5 Horizons fetcher pattern.

## Body Cadence Table

| Body   | NAIF `COMMAND` | `CENTER`   | `STEP_SIZE` | Notes |
|--------|----------------|------------|-------------|-------|
| Mars   | `499`          | `500@10`   | `'1 d'`     | Heliocentric ICRF J2000 |
| Phobos | `401`          | `500@499`  | `'30 m'`    | Mars geocenter explicit ID; `CENTER='500@499'` confirmed working in pre-research |
| Deimos | `402`          | `500@499`  | `'1 h'`     | Mars geocenter explicit ID |

## JSON Envelope

Top-level structure mirrors the Slice 4 envelope while allowing each target's `records` array to carry its own timestamp grid:

```json
{
  "source": "NASA/JPL Horizons API",
  "frame": "ICRF/J2000",
  "timeScale": "TDB",
  "units": { "position": "km", "velocity": "km/s", "time": "TDB Julian Date" },
  "targets": {
    "mars":   { "targetId": "499", "center": "500@10",  "origin": "heliocentric", "records": [...] },
    "phobos": { "targetId": "401", "center": "500@499", "origin": "mars-centered", "records": [...] },
    "deimos": { "targetId": "402", "center": "500@499", "origin": "mars-centered", "records": [...] }
  }
}
```

Each body's `records` array carries its own timestamp grid. The fixture is explicitly per-body cadence, not a uniform cadence across all three bodies.

## Record Format

Each entry in a `records` array is a 7-tuple (`HorizonsTupleRecord`):

```text
[tdb_julian_date, x_km, y_km, z_km, vx_km_s, vy_km_s, vz_km_s]
```

No tuple-shape change from Slice 2, Slice 3, or Slice 4.

## Body-Specific Record Counts

- Mars: about `91` records over `90` days at `1 d`
- Phobos: about `4,320` interval records / `4,321` endpoint-inclusive samples over `90` days at `30 m`
- Deimos: about `2,160` interval records / `2,161` endpoint-inclusive samples over `90` days at `1 h`

## Origin Tags and Frame Inference

- Mars target uses `"origin": "heliocentric"`.
- Phobos and Deimos targets use `"origin": "mars-centered"`.
- The boundary `inferCanonicalFrame` implementation must resolve `"mars-centered"` to `FRAME_MARS_J2000_ICRF`.

## Frame Assignments After Ingestion

| Body   | Canonical V2 frame        |
|--------|---------------------------|
| Mars   | `FRAME_HELIO_J2000_ICRF`  |
| Phobos | `FRAME_MARS_J2000_ICRF`   |
| Deimos | `FRAME_MARS_J2000_ICRF`   |

`FRAME_MARS_J2000_ICRF` is new in Slice 6 and mirrors the `FRAME_JUPITER_J2000_ICRF` and `FRAME_SATURN_J2000_ICRF` pattern introduced in earlier planet-system slices.

## Boundary Conversion Responsibilities

These conversions happen in `src/v2/boundary/horizons.ts` at ingestion time. No km, km/s, or TDB Julian Date values may appear past the boundary layer.

| Raw Horizons value | Conversion | Canonical V2 value |
|--------------------|------------|-------------------|
| position in km     | `x * 1000` | position in meters |
| velocity in km/s   | `v * 1000` | velocity in m/s    |
| TDB Julian Date    | `(jd - 2451545.0) * 86400` | TDB seconds since J2000 |

## Validation

- Reference invariant: `src/v2/core/invariants/INV-011.md`
- Phobos cutover bar: `5 km` at `30 m`
- Deimos cutover bar: `0.5 km` at `1 h`
- Mars keeps its existing INV-008 cutover bar: `0.05 km` at `1 d`
- Empirical measurement provenance: `tools/slice6-research/research-report.md`

## Implementation Note

`ingestSlice6Fixture` is the direct structural extension of the existing `ingestSlice3Fixture` / `ingestSlice4Fixture` pattern. It should reuse the generic `ingestHorizonsFixture` / `ingestHorizonsTarget` pipeline and validate that all three expected target keys are present.

The existing generic pipeline already handles per-body cadence naturally because each target record array is independent. No shared timestep grid is required. The new work is target-key validation plus `mars-centered` frame inference to `FRAME_MARS_J2000_ICRF`.
