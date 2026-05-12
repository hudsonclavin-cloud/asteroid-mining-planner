# Slice 7 Fixture Specification

## Purpose

Specifies the JSON envelope contract for Slice 7 asteroid catalog fixtures. Slice 7 introduces a fundamentally different fixture shape than prior slices: instead of time-series state-vector records at fixed cadence, asteroids store osculating orbital elements plus a uniform anchor epoch, then propagate continuously at runtime via Keplerian two-body math.

## Overview

- Bodies: `1,008` asteroids total
- Composition: Top `1,000` main-belt asteroids by `H` plus `8` curated famous NEAs
- Window the pre-research bars were validated against: `2026-05-01` to `2026-07-30`
- Propagation method: continuous per-frame Keplerian two-body propagation
- Storage location (when created): `tests/fixtures/v2/asteroid-catalog-slice7.json`
- Runtime loader path: `src/v2/app/solar-system/loader.ts` fetches this same fixture artifact directly
- Format: single JSON envelope with one catalog entry per asteroid
- New architectural fact: the fixture is an anchor-and-elements catalog, not a sampled time series

## Source Roles

Slice 7 uses two canonical upstream sources with distinct purposes:

| Source | Role |
|---|---|
| JPL SBDB | Inventory selection and metadata (`designation`, `name`, `H`, `G`, orbit class, `condition_code`, `data_arc`, `neo`, `pha`) |
| JPL Horizons VECTORS | Uniform anchor state at the Slice 7 anchor epoch (`2026-05-01 00:00:00 TDB`) |

SBDB is not the propagation anchor. Pre-research round 2 codified this split after round 1 surfaced catastrophic epoch-staleness drift for bodies such as Bennu.

## Horizons API Parameters For Anchor Fetch

Matches the settings in `tools/slice7-research/fetch-horizons-anchors.mjs`.

| Parameter | Value |
|---|---|
| `EPHEM_TYPE` | `VECTORS` |
| `REF_SYSTEM` | `ICRF` |
| `REF_PLANE` | `FRAME` |
| `TIME_TYPE` | `TDB` |
| `OUT_UNITS` | `KM-S` |
| `VEC_TABLE` | `2` |
| `CENTER` | `500@10` |
| `TLIST` | `2461161.5` |

Implementation note: asteroid `COMMAND` values use semicolon-prefixed numeric designations (for example `';4'`, `';101955'`, `';99942'`).

## JSON Envelope

Top-level structure differs from Slice 2-6 fixtures because there is no `records` array per target:

```json
{
  "selectionSource": "JPL SBDB",
  "anchorSource": "NASA/JPL Horizons API",
  "frame": "ICRF/J2000",
  "timeScale": "TDB",
  "units": {
    "anchorPosition": "km",
    "anchorVelocity": "km/s",
    "anchorTime": "TDB Julian Date",
    "semiMajorAxis": "km",
    "angles": "radians"
  },
  "propagation": {
    "method": "keplerian-two-body",
    "anchorEpochTdbJd": 2461161.5
  },
  "catalog": {
    "totalBodies": 1008,
    "mainBeltCount": 1000,
    "curatedNeaCount": 8,
    "mainBeltCutoffH": 10.98
  },
  "asteroids": {
    "asteroid-4": {
      "designation": "4",
      "spkId": 4,
      "name": "Vesta",
      "class": "MBA",
      "neo": false,
      "pha": false,
      "H": 3.25,
      "G": 0.32,
      "conditionCode": 0,
      "dataArcDays": 25743,
      "anchor": {
        "epochTdbJd": 2461161.5,
        "positionKm": [313034558.0074239, -116635043.9303863, -87524475.95403573],
        "velocityKmPerS": [9.55972246425402, 16.5246906087923, 5.336285711692855]
      },
      "elements": {
        "aKm": 353263117.90161544,
        "e": 0.09019090883117112,
        "iRad": 0.1246856270233961,
        "omRad": 1.809936775424747,
        "wRad": 2.6439008520838208,
        "maRad": 1.2319040668975099,
        "epochTdbJd": 2461161.5
      }
    }
  }
}
```

## Body Id Convention

- Runtime `BodyId` values for the catalog should be stable string ids of the form `asteroid-<designation>`.
- Examples: `asteroid-4`, `asteroid-101955`, `asteroid-99942`
- Numeric designations are preferred over display names because names can change or gain aliases while numeric designations remain stable and reversible.

## Per-Asteroid Record Contract

Each asteroid entry must preserve:

- SBDB inventory metadata:
  - `designation`
  - `spkId`
  - `name`
  - `class`
  - `neo`
  - `pha`
  - `H`
  - `G`
  - `conditionCode`
  - `dataArcDays`
- Horizons anchor state:
  - `anchor.epochTdbJd`
  - `anchor.positionKm`
  - `anchor.velocityKmPerS`
- Derived propagation state:
  - `elements.aKm`
  - `elements.e`
  - `elements.iRad`
  - `elements.omRad`
  - `elements.wRad`
  - `elements.maRad`
  - `elements.epochTdbJd`
  - `elementsFrame = FRAME_HELIO_J2000_ECLIPTIC`

The production propagation path uses derived ecliptic-oriented classical elements plus a runtime ecliptic-to-equatorial rotation, not raw SBDB bulk-table elements.

## Frame Assignment After Ingestion

All Slice 7 asteroid bodies live in the existing heliocentric root frame:

| Body class | Canonical V2 frame |
|---|---|
| All Slice 7 asteroids | `FRAME_HELIO_J2000_ICRF` |

No new frame constant is introduced. Slice 7 extends body count and propagation method, not the frame graph.

## Boundary Conversion Responsibilities

These conversions happen in `src/v2/boundary/` at ingestion time. No km, km/s, or TDB Julian Date values may appear past the boundary layer.

| Raw fixture value | Conversion | Canonical V2 value |
|---|---|---|
| `anchor.positionKm` | `x * 1000` | anchor position in meters |
| `anchor.velocityKmPerS` | `v * 1000` | anchor velocity in m/s |
| `anchor.epochTdbJd` | `(jd - 2451545.0) * 86400` | anchor time in TDB seconds since J2000 |
| `elements.aKm` | `a * 1000` | semi-major axis in meters |
| `elements.iRad`, `omRad`, `wRad`, `maRad` | no unit change | radians in canonical propagation state |

## Rotation Discipline

- SBDB-published osculating elements are J2000 ecliptic and require the DEC-7 ecliptic-to-equatorial rotation if used directly.
- Slice 7's production path does not use SBDB elements directly for propagation.
- Horizons anchor vectors are fetched with `REF_PLANE='FRAME'`, so the anchor state itself is J2000 equatorial / ICRF.
- The committed Slice 7 fixture stores classical elements in heliocentric J2000 ecliptic orientation.
- Runtime propagation rotates the propagated ecliptic result into the canonical heliocentric ICRF scene frame via the DEC-7 obliquity transform.

## Validation

- Reference invariant: `src/v2/core/invariants/INV-012.md`
- Cutover bar: `100,000 km` at `1 d` truth cadence
- Validation sample: `18` representative bodies spanning the main belt and all `8` curated NEAs
- Empirical measurement provenance: `tools/slice7-research/data/keplerian-accuracy-anchored.json`
- Worst sampled round-2 body: Hygiea at `35,313 km`, leaving `2.83x` margin to the bar

## Anchor-Epoch Discipline

The anchor epoch is part of the fixture contract, not an incidental implementation detail.

- Slice 7 anchor epoch: `2026-05-01 00:00:00 TDB`
- If the validation window or production window moves materially, anchors must be re-fetched from Horizons at the new window start.
- Reusing stale anchors across far-future windows is forbidden. Bennu demonstrated the failure mode in pre-research round 1: a stale `2011-01-01` SBDB epoch produced multi-million-kilometer drift over the Slice 7 window.

## Implementation Note

`ingestSlice7Fixture` is not a thin extension of the Slice 3 / 4 / 6 `records`-array pipeline. It is a parallel ingestion path that:

1. validates the `1,008`-body hybrid catalog shape
2. preserves SBDB metadata for labeling and filtering
3. converts a single Horizons anchor state per body into canonical metric units
4. preserves the derived ecliptic-oriented osculating elements for continuous runtime propagation
5. assigns every asteroid to `FRAME_HELIO_J2000_ICRF`

The runtime then propagates each asteroid continuously from the shared anchor epoch rather than interpolating between stored samples.
