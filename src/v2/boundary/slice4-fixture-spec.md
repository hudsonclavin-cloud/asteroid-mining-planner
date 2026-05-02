# Slice 4 Fixture Specification

## Overview

The Slice 4 fixture covers eight Saturn-system bodies over a 90-day window using per-body cadence. It extends the Slice 3 Horizons fixture model to mixed sampling density while preserving the same JSON envelope and the same boundary conversion rules.

- Bodies: Saturn, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus
- Window: 2026-05-01 to 2026-07-30
- Cadence policy: per-body cadence, not a shared timestep grid
- Three independent `1 h` cadence bodies: Tethys, Mimas, Enceladus
- Storage location (when created): `tests/fixtures/v2/` — exact filename TBD at implementation time
- Format: single JSON envelope with one `targets` entry per body
- Estimated fixture size: about `1.85 MB` from Slice 4 pre-research projection, up from Slice 3's `~780 KB`

## Horizons API Parameters

Matches the settings in `tools/slice4-research/fetch-horizons.mjs`.

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

Implementation note: `STEP_SIZE` values must be quoted strings such as `'1 d'` and `'12 h'`. The Slice 3 and Slice 4 pre-research fetchers established that Horizons rejects the spaced values when the quotes are omitted.

## Body Cadence Table

| Body       | NAIF `COMMAND` | `CENTER`  | `STEP_SIZE` | Notes |
|------------|----------------|-----------|-------------|-------|
| Saturn     | `699`          | `@sun`    | `'1 d'`     | Heliocentric ICRF J2000 |
| Titan      | `606`          | `500@699` | `'12 h'`    | Saturn geocenter explicit ID; `CENTER='500@699'` confirmed working in pre-research |
| Rhea       | `605`          | `500@699` | `'3 h'`     | Saturn geocenter explicit ID |
| Iapetus    | `608`          | `500@699` | `'1 d'`     | Saturn geocenter explicit ID; slowest moon (`79.33 d` period) tolerates daily cadence |
| Tethys     | `603`          | `500@699` | `'1 h'`     | Saturn geocenter explicit ID; surprise `1 h` cadence despite `1.89 d` period |
| Dione      | `604`          | `500@699` | `'3 h'`     | Saturn geocenter explicit ID |
| Mimas      | `601`          | `500@699` | `'1 h'`     | Saturn geocenter explicit ID; cadence driver (`0.94 d` period) |
| Enceladus  | `602`          | `500@699` | `'1 h'`     | Saturn geocenter explicit ID |

## JSON Envelope

Top-level structure extends the Slice 3 envelope while allowing each target's `records` array to carry its own timestamp grid:

```json
{
  "source": "NASA/JPL Horizons API",
  "frame": "ICRF/J2000",
  "timeScale": "TDB",
  "units": { "position": "km", "velocity": "km/s", "time": "TDB Julian Date" },
  "targets": {
    "saturn":     { "targetId": "699", "center": "@sun",    "origin": "heliocentric",    "records": [...] },
    "titan":      { "targetId": "606", "center": "500@699", "origin": "saturn-centered", "records": [...] },
    "rhea":       { "targetId": "605", "center": "500@699", "origin": "saturn-centered", "records": [...] },
    "iapetus":    { "targetId": "608", "center": "500@699", "origin": "saturn-centered", "records": [...] },
    "tethys":     { "targetId": "603", "center": "500@699", "origin": "saturn-centered", "records": [...] },
    "dione":      { "targetId": "604", "center": "500@699", "origin": "saturn-centered", "records": [...] },
    "mimas":      { "targetId": "601", "center": "500@699", "origin": "saturn-centered", "records": [...] },
    "enceladus":  { "targetId": "602", "center": "500@699", "origin": "saturn-centered", "records": [...] }
  }
}
```

Each body's `records` array carries its own timestamp grid. The fixture is explicitly per-body cadence, not a uniform cadence across all eight bodies.

## Record Format

Each entry in a `records` array is a 7-tuple (`HorizonsTupleRecord`):

```text
[tdb_julian_date, x_km, y_km, z_km, vx_km_s, vy_km_s, vz_km_s]
```

No tuple-shape change from Slice 2 or Slice 3.

## Origin Tags and Frame Inference

- Saturn target uses `"origin": "heliocentric"`.
- Saturnian moon targets use `"origin": "saturn-centered"`.
- The boundary `inferCanonicalFrame` implementation must resolve `"saturn-centered"` to `FRAME_SATURN_J2000_ICRF`.

## Frame Assignments After Ingestion

| Body       | Canonical V2 frame           |
|------------|------------------------------|
| Saturn     | `FRAME_HELIO_J2000_ICRF`     |
| Titan      | `FRAME_SATURN_J2000_ICRF`    |
| Rhea       | `FRAME_SATURN_J2000_ICRF`    |
| Iapetus    | `FRAME_SATURN_J2000_ICRF`    |
| Tethys     | `FRAME_SATURN_J2000_ICRF`    |
| Dione      | `FRAME_SATURN_J2000_ICRF`    |
| Mimas      | `FRAME_SATURN_J2000_ICRF`    |
| Enceladus  | `FRAME_SATURN_J2000_ICRF`    |

`FRAME_SATURN_J2000_ICRF` is new in Slice 4 and mirrors the `FRAME_JUPITER_J2000_ICRF` pattern introduced in Slice 3.

## Boundary Conversion Responsibilities

These conversions happen in `src/v2/boundary/horizons.ts` at ingestion time. No km, km/s, or TDB Julian Date values may appear past the boundary layer.

| Raw Horizons value | Conversion | Canonical V2 value |
|--------------------|------------|-------------------|
| position in km     | `x * 1000` | position in meters |
| velocity in km/s   | `v * 1000` | velocity in m/s    |
| TDB Julian Date    | `(jd - 2451545.0) * 86400` | TDB seconds since J2000 |

## Cutover Bars

Reference invariant: `src/v2/core/invariants/INV-010.md`

| Body       | Cadence | Cutover bar |
|------------|---------|-------------|
| Saturn     | `1 d`   | 1 km        |
| Titan      | `12 h`  | 20 km       |
| Rhea       | `3 h`   | 5 km        |
| Iapetus    | `1 d`   | 2 km        |
| Tethys     | `1 h`   | 1 km        |
| Dione      | `3 h`   | 50 km       |
| Mimas      | `1 h`   | 20 km       |
| Enceladus  | `1 h`   | 5 km        |

## Implementation Note

`ingestSlice4Fixture` is the direct structural extension of `ingestSlice3Fixture`. It should reuse the generic `ingestHorizonsFixture` / `ingestHorizonsTarget` pipeline and validate that all eight expected target keys are present.

The existing generic pipeline already handles per-body cadence naturally because each target record array is independent. No shared timestep grid is required. The new work is target-key validation plus `saturn-centered` frame inference to `FRAME_SATURN_J2000_ICRF`.

Fixture-size growth across slices is now material: Slice 2 was about `250 KB`, Slice 3 about `780 KB`, and Slice 4 projects to about `1.85 MB`. If a future slice such as Mars-system work forces another large cadence jump, SPK ingestion becomes a credible Slice 5+ pressure point.
