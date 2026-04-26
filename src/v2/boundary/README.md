# V2 Boundary

`boundary/` owns external adapters and conversions at the edge of the system.

Boundary code may convert formats. It may not redefine core truth.

## External Source Contract

No external units, frames, or time standards may appear past `boundary/`.

Every external value is converted at ingestion into canonical `core/` representation:

- position: meters
- velocity: meters per second
- frame: `FRAME_HELIO_J2000_ICRF` or `FRAME_GCRS_EARTH`
- time: TDB seconds since J2000

## Source Map

| Source | App endpoint | Native units | Native frame | Native time | Conversion location |
| --- | --- | --- | --- | --- | --- |
| JPL Horizons vectors | `/api/horizons` | `km`, `km/s` | ICRF / J2000 inertial vectors | TDB Julian Date | `boundary/horizons.ts` |
| Asterank catalog | `/api/asterank` | `AU`, degrees, scalar screening fields | heliocentric ecliptic J2000 orbital elements | source epoch Julian Date | `boundary/asterank.ts` |
| NHATS accessibility data | `/api/nhats` | mixed screening fields | mixed / source-defined | source-defined | `boundary/nhats.ts` |

## Conversion Rules

### Horizons

- convert `km` to `m`
- convert `km/s` to `m/s`
- convert TDB Julian Date to TDB seconds since J2000
- tag frame as `FRAME_HELIO_J2000_ICRF` unless a different inertial source frame is explicitly declared and normalized

### Asterank

- convert semimajor axis from `AU` to `m`
- convert angular quantities from degrees to radians
- convert source epoch Julian Date into canonical TDB seconds since J2000
- normalize orbital elements into the canonical heliocentric inertial representation used by `core/`
- records whose source time/frame ambiguity cannot be normalized must remain screening-only and may not enter Slice 1 truth validation

### NHATS

- treat NHATS as screening metadata, not truth ephemeris
- normalize any imported scalar values into canonical units at ingress
- any mixed or underspecified frame/time metadata is blocked from `core/` truth paths

## Legacy Bridge Rule

Legacy bridge adapters may exist only at top-level mount points.

Rules:

- they may copy or map legacy data into canonical `v2` records
- they may not expose legacy units, frames, or mutable globals to `core/`
- they may not create import dependencies from `src/v2/` into legacy runtime code
