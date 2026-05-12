# Slice 7 Asteroid Catalog Architecture

## Purpose

Documents the canonical `core/` architecture for the Slice 7 asteroid catalog. Slice 7 adds `1,008` asteroid bodies, a second propagation method, and a new ingestion split between SBDB and Horizons. This document exists so the catalog does not accrete as an ad hoc exception to the Slice 1-6 body model.

## Catalog Composition

Slice 7's body set is fixed by product decision:

- Top `1,000` main-belt asteroids by absolute magnitude `H`
- `8` curated famous NEAs:
  - Bennu (`101955`)
  - Apophis (`99942`)
  - Eros (`433`)
  - Itokawa (`25143`)
  - Ryugu (`162173`)
  - Toutatis (`4179`)
  - Geographos (`1620`)
  - Castalia (`4769`)

Total catalog size: `1,008` bodies.

Main-belt cutoff from pre-research: `H = 10.98` (`1057 Wanda` was the 1000th accepted body after quality gating).

## Source Split

Slice 7 uses two sources on purpose:

| Source | Canonical responsibility |
|---|---|
| JPL SBDB | selection, photometry, class, and metadata |
| JPL Horizons VECTORS | propagation anchor state at a uniform recent epoch |

This split is the round-2 correction to Slice 7 pre-research. SBDB is not the propagation anchor because epoch freshness is heterogeneous across bodies.

## Selection Rules

The inventory is selected once per fixture rebuild under the following policy:

- start from the numbered-asteroid SBDB bulk table
- filter main-belt candidates by orbital envelope
- sort by increasing `H`
- drop `H = 99.00`
- drop `condition_code = 9`
- drop `data_arc < 30 days`
- take Top `1,000`
- append the curated `8` NEAs
- verify no duplicates

The selection policy is inventory logic, not runtime logic. Runtime consumes the already-selected catalog.

## Anchor-Epoch Discipline

Slice 7's propagation anchor is uniform:

- anchor epoch: `2026-05-01 00:00:00 TDB`
- anchor source: Horizons VECTORS with `CENTER='500@10'`, `REF_SYSTEM='ICRF'`, `REF_PLANE='FRAME'`
- one anchor state per asteroid

This discipline is mandatory. Pre-research round 1 showed the failure mode: Bennu's stale SBDB epoch (`2011-01-01 TDB`) produced multi-million-kilometer drift over the Slice 7 validation window. Re-anchoring the full catalog at the window start reduced Bennu's day-90 drift to `4,236 km`.

If the fixture window changes materially, the anchors must be rebuilt. Carrying old anchors into a new time window is forbidden.

## Propagation Policy

Slice 7 introduces a second propagation method:

- planetary and moon bodies from Slices 1-6 continue using Hermite interpolation over stored samples
- asteroid catalog bodies use Keplerian two-body propagation from osculating elements

Keplerian does not replace Hermite. The two paths coexist in `core/`, selected by body class.

## Element Derivation

The production propagation path does not use SBDB's bulk-table osculating elements directly.

Instead:

1. fetch one equatorial Horizons anchor state per asteroid
2. derive osculating elements from that Cartesian state
3. propagate from those derived elements

The committed Slice 7 fixture stores those derived classical elements in heliocentric J2000 ecliptic orientation. Runtime propagation then applies the DEC-7 ecliptic-to-equatorial rotation so returned states remain aligned to canonical heliocentric ICRF.

## Frame Policy

- all propagated Slice 7 asteroid states live in `FRAME_HELIO_J2000_ICRF`
- stored asteroid classical elements are labeled `FRAME_HELIO_J2000_ECLIPTIC`
- Slice 7 introduces no new frame id
- asteroid propagation is heliocentric from the start; no planet-centered asteroid subframe is created

Slice 7 extends body count and propagation diversity, not the frame graph.

## Accuracy Contract

Slice 7 is visualization grade, not mission-planning grade.

- invariant: `INV-012`
- bar: `100,000 km`
- validation cadence: `1 d`
- validation window: `2026-05-01` to `2026-07-30`
- worst sampled round-2 body: Hygiea at `35,313 km`
- margin to bar: `2.83x`

The bar is intentionally loose relative to planetary-slice bars because the catalog serves visual context, not navigation.

## Runtime Scale

Slice 7 introduces continuous propagation for `1,008` bodies.

- approximate steady-state evaluation rate at `60 fps`: `~60,000` propagations per second
- acceptable on the target machine class for Slice 7 scale
- future slices at much larger catalog size may need GPU-assisted propagation or more aggressive batching

## Body Id Convention

Catalog bodies should use stable ids keyed by designation:

- `asteroid-4`
- `asteroid-101955`
- `asteroid-99942`

Designation-based ids are preferred over name-based ids because designation is stable and reversible.

## Relationship To Render

`core/` owns:

- membership in the `1,008`-body catalog
- metadata needed for identity and filtering
- anchor state
- derived osculating elements
- propagated heliocentric state
- INV-012 enforcement

`render/` owns:

- Points vs. InstancedMesh vs. focused Mesh presentation
- shader choices
- apparent-diameter LOD thresholds

The render layer may never derive its own independent orbital truth.

## Known Architectural Constraint

Slice 7's empirical accuracy statement assumes the validation window begins at or after the anchor epoch. A far-future scrub outside the validated horizon will accumulate two-body drift. That is acceptable for Slice 7 because the product decision is explicitly visualization-grade and the cutover bar is bound to the validated window, not to arbitrary multi-year propagation.
