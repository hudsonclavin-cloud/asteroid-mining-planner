# Slice 8 Fixture Specification

## Purpose

Specifies the JSON envelope contract for the Slice 8 asteroid catalog fixture. Slice 8 keeps Slice 7's anchor-and-elements architecture, but scales the catalog from `1,008` to `10,008` bodies and adds two new per-body contract fields needed for catalog-scale rendering: `eccentricityBand` for INV-013 and `hasOrbitLine` for adaptive orbit rendering.

## Overview

- Bodies: `10,008` asteroids total
- Composition: Top `10,000` main-belt asteroids by `H` plus the `8` curated NEAs carried forward from Slice 7
- Storage location: `tests/fixtures/v2/asteroid-catalog-slice8.json`
- Anchor epoch: `2026-05-01 00:00:00 TDB` (`JD 2461161.5`)
- Propagation method: continuous per-frame Keplerian two-body propagation
- Elements frame: `FRAME_HELIO_J2000_ECLIPTIC`
- New Slice 8 contract fields:
  - `eccentricityBand`
  - `hasOrbitLine`

## Source Roles

Slice 8 retains Slice 7's two-source split, but DEC-2 is now stricter:

| Source | Role |
|---|---|
| JPL SBDB | Selection and metadata only (`designation`, `name`, `H`, `G`, orbit class, `condition_code`, `data_arc`, `neo`, `pha`) |
| JPL Horizons VECTORS | All propagation anchors at the uniform Slice 8 epoch |

SBDB-direct propagation is forbidden in Slice 8. Round 2 methodology investigation showed that the apparent "smart-staleness" optimization was window-dominant noise, not a safe optimization path.

## JSON Envelope

```json
{
  "selectionSource": "JPL SBDB",
  "anchorSource": "NASA/JPL Horizons API",
  "frame": "ICRF/J2000 runtime target",
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
    "totalBodies": 10008,
    "mainBeltCount": 10000,
    "curatedNeaCount": 8,
    "mainBeltCutoffH": 13.52,
    "orbitLineThresholdH": 10.98
  },
  "asteroids": {
    "asteroid-4": {
      "designation": "4",
      "spkId": 4,
      "name": "Vesta",
      "class": "MBA",
      "isCuratedNea": false,
      "H": 3.25,
      "G": 0.32,
      "estimatedRadiusM": 262000,
      "anchorPositionKm": [313034558.0, -116635043.9, -87524475.9],
      "anchorVelocityKmPerS": [9.5597, 16.5247, 5.3363],
      "elements": {
        "aKm": 353263117.9,
        "e": 0.0901909088,
        "iRad": 0.1246856270,
        "omRad": 1.8099367754,
        "wRad": 2.6439008521,
        "maRad": 1.2319040669,
        "epochTdbJd": 2461161.5
      },
      "elementsFrame": "FRAME_HELIO_J2000_ECLIPTIC",
      "eccentricityBand": "A",
      "hasOrbitLine": true
    }
  }
}
```

## Per-Body Record Contract

Each Slice 8 asteroid record preserves:

- identity and metadata:
  - `designation`
  - `spkId`
  - `name`
  - `class`
  - `isCuratedNea`
  - `H`
  - `G`
- estimated visible scale:
  - `estimatedRadiusM`
- uniform Horizons anchor:
  - `anchorPositionKm`
  - `anchorVelocityKmPerS`
- propagation state:
  - `elements.aKm`
  - `elements.e`
  - `elements.iRad`
  - `elements.omRad`
  - `elements.wRad`
  - `elements.maRad`
  - `elements.epochTdbJd`
  - `elementsFrame`
- Slice 8 rendering metadata:
  - `eccentricityBand`
  - `hasOrbitLine`

## New Slice 8 Fields

### `eccentricityBand`

Required enum used by INV-013:

| Band | Rule |
|---|---|
| `A` | `e < 0.1` |
| `B` | `0.1 ≤ e < 0.2` |
| `C` | `0.2 ≤ e < 0.3` |
| `D` | `e ≥ 0.3` |

### `hasOrbitLine`

Boolean derived from DEC-5:

- `true` when `H < 10.98`
- `false` otherwise

This preserves the Slice 7 orbit-line density visual by giving orbit lines to the top `~1,000` brightest main-belt bodies plus any curated NEAs that satisfy the implementation's carry-forward policy.

## Frame Assignment After Ingestion

Stored elements remain ecliptic-derived:

| Stored field | Meaning |
|---|---|
| `elementsFrame` | `FRAME_HELIO_J2000_ECLIPTIC` |
| runtime scene frame | `FRAME_HELIO_J2000_ICRF` |

Slice 8 preserves the Slice 7.1 contract cleanup: the fixture labels stored elements honestly as ecliptic-derived, and runtime propagation applies the documented ecliptic-to-equatorial rotation to reach the canonical heliocentric scene frame.

## Fixture Construction Process

Phase A construction reuses the Slice 7 asset base rather than rebuilding all `10,008` anchors from scratch in one monolith:

1. Reuse Slice 7's existing `1,008` asteroid anchors and metadata directly.
2. Extend the inventory to the remaining `9,000` main-belt bodies from the Top `10,000` set.
3. Fetch Horizons VECTORS for those `9,000` bodies at `JD 2461161.5`.
4. Derive ecliptic-oriented classical elements from those anchors.
5. Assign `eccentricityBand` and `hasOrbitLine` per the Slice 8 contract.

## Boundary Conversion Responsibilities

Boundary ingestion remains parallel to Slice 7:

| Raw fixture value | Conversion | Canonical V2 value |
|---|---|---|
| `anchorPositionKm` | `x * 1000` | anchor position in meters |
| `anchorVelocityKmPerS` | `v * 1000` | anchor velocity in m/s |
| `elements.aKm` | `a * 1000` | semi-major axis in meters |
| `elements.epochTdbJd` | `(jd - 2451545.0) * 86400` | TDB seconds since J2000 |
| `elements.iRad`, `omRad`, `wRad`, `maRad` | no unit change | radians |

## Size And Budget

- Population: `10,008` bodies
- Expected artifact size: roughly `~10 MB`
- Phase A Horizons budget: reuse `1,008` existing anchors, fetch `9,000` additional anchors

At the enforced `3 s` request interval from pre-research, the remaining `9,000` anchor fetches imply an `~8 hour` ingestion floor before retries and file-write overhead.

## Validation

- Reference invariant: `src/v2/core/invariants/INV-013.md`
- Validation source: `tools/slice8-research/round3-synthesis-report.md`
- Backward-compat guard: all `18` Slice 7 sampled bodies pass the derived Slice 8 band bars

Slice 8's fixture is not just "more of Slice 7." It is the boundary artifact that carries the data needed for catalog-scale rendering, stratified cutover analysis, and adaptive orbit-line decisions without reopening the propagation architecture itself.
