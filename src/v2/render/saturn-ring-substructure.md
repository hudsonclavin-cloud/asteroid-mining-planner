# Saturn Ring Substructure Rendering

## Purpose

Slice 5 extends the Slice 4 single-disk + Cassini Division band ring rendering by adding seven visible substructure features as sibling render meshes. This is render-layer only work: no `core/` data model changes, no new frames, no new fixtures, and no new interpolation or invariant work.

## Architectural Pattern

Slice 5 uses GPT-5 Option B: multiple concentric `RingGeometry` instances. Each named feature renders as its own sibling mesh under the existing `saturnRingsGroup`. The existing Slice 4 single-disk + Cassini Division band remains in place; Slice 5 substructure meshes are additive overlays on top of that baseline.

## Feature Inventory

All radii below are meters, matching the `core/` and `render/` unit contract. Source of record: `tools/slice5-research/ring-substructure.json`.

- Huygens Gap
  - Type: gap
  - Radii: `117,500,000 m` to `117,930,000 m`
  - Visual character: not empty; contains Huygens Ringlet and is visibly dark elsewhere
  - Shepherd moon: none
- Huygens Ringlet
  - Type: ringlet
  - Radii: `117,806,000 m` to `117,824,000 m`
  - Visual character: dense narrow ringlet within Huygens Gap
  - Shepherd moon: none
- Laplace Gap
  - Type: gap
  - Radii: `119,845,000 m` to `120,086,000 m`
  - Visual character: not empty; contains Laplace Ringlet
  - Shepherd moon: none
- Laplace Ringlet
  - Type: ringlet
  - Radii: `120,037,000 m` to `120,078,000 m`
  - Visual character: dense narrow ringlet inside Cassini Division
  - Shepherd moon: none
- Encke Gap
  - Type: gap
  - Radii: `133,423,000 m` to `133,745,000 m`
  - Visual character: not empty; contains faint ringlets, maintained by shepherd moon Pan
  - Shepherd moon: `Pan`
- Keeler Gap
  - Type: gap
  - Radii: `136,487,000 m` to `136,522,000 m`
  - Visual character: maintained by shepherd moon Daphnis; edges and moon-driven structures visible
  - Shepherd moon: `Daphnis`
- Roche Division
  - Type: division
  - Radii: `136,770,000 m` to `139,380,000 m`
  - Visual character: tenuous separation between A ring and F ring, not a clean empty gap
  - Shepherd moon: none

## Rendering Strategy Per Feature Type

- Gap features (`Huygens Gap`, `Laplace Gap`, `Encke Gap`, `Keeler Gap`) render as transparent or near-transparent annular meshes that visually punch holes in the parent ring zone.
  - `Huygens Gap` and `Laplace Gap` punch through the existing Cassini Division band.
  - `Encke Gap` and `Keeler Gap` punch through the existing A-ring portion of the main ring disk.
- Ringlet features (`Huygens Ringlet`, `Laplace Ringlet`) render as slightly brighter narrow annular meshes nested inside their parent gaps.
- Division features (`Roche Division`) render as a faint transition zone that fades from the A-ring outer opacity toward near-zero opacity at the outer radius.

## Material Details

The material contract is qualitative rather than numerically fixed:

- Gap meshes should be darker and lower-alpha than their surrounding parent region.
- Ringlet meshes should be slightly brighter and higher-alpha than the surrounding gap they inhabit.
- Roche Division should read as a faint fading continuation beyond the main A ring, not as a sharp opaque band.

Exact alpha/color tuning may change during implementation, but the visual principle is stable: gaps subtract, ringlets restore a narrow bright structure, and the Roche Division fades outward.

## Z-Fighting And Render Ordering

All Slice 5 features sit at the same `Z` position as the parent ring disk in Saturn's equatorial plane. Use explicit Three.js `renderOrder` to control draw order:

- existing single-disk ring mesh first
- existing Cassini Division band second
- Slice 5 sub-features after that in inner-radius-ascending order

Within the same parent gap:

- gap mesh renders before ringlet mesh
- `Huygens Gap` renders before `Huygens Ringlet`
- `Laplace Gap` renders before `Laplace Ringlet`

This ordering keeps narrow ringlets from being visually swallowed by the larger transparent cutout beneath them.

## Tilt

Slice 5 reuses the Slice 4 render-only `26.7°` static tilt. All Slice 5 substructure meshes are children of the existing `saturnTiltGroup`. No new tilt machinery is introduced.

## Frame Contract

All Slice 5 features live in the same render-layer frame as the existing Saturn rings. No new `core/` frame, no new transform path, and no new state conversion logic is introduced. Slice 5 is render-layer only.

## Out Of Scope For Slice 5

Deferred features recorded in `tools/slice5-research/ring-substructure.json` but not rendered in Slice 5:

- `Herschel Gap`
- `Herschel Ringlet`
- `Russell Gap`
- `Jeffreys Gap`
- `Kuiper Gap`
- `Bessel Gap`
- `Barnard Gap`
- `F ring`
- `E ring`
- `Spokes`
- `Ring shadows`
- `Anisotropic phase scattering`
- `Particle-level dynamics`
