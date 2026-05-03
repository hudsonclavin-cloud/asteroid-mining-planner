# Saturn Rings Rendering

## Purpose

Saturn's rings are the defining visible feature of the Saturn system at any zoom that resolves the planet. Slice 4 renders the rings as a render-layer artifact that lives in `FRAME_SATURN_J2000_ICRF`, tilted `26.7°` from the frame `Z` axis at the render layer to align with Saturn's equatorial plane.

The ring system is a visual truth artifact, not a physics participant. It must not mutate canonical state, affect interpolation, or alter any `core/` invariant.

## Source Citations

- Ring radii: PDS Ring-Moon Systems Node, "Vital Statistics for Saturn's Rings" — `https://pds-rings.seti.org/saturn/saturn_rings_table.html`
- Ring mass: Iess et al., "Measurement and implications of Saturn's gravity field and ring mass", *Science* 364 (2019), doi:`10.1126/science.aat2965`

The radii below use the exact PDS table values rather than rounded secondary summaries.

## Ring System Geometry

- D ring inner radius: `66,900,000 m` from Saturn center
- C ring inner radius: `74,491,000 m` from Saturn center
- A ring outer radius: `136,770,000 m` from Saturn center
- Cassini Division inner radius: `117,500,000 m`
- Cassini Division outer radius: `122,050,000 m`
- Total ring system mass: `1.54e19 kg`
- Ring plane tilt: `26.7°` from Saturn's orbital plane, applied as a render-only tilt from the `FRAME_SATURN_J2000_ICRF` `Z` axis so the ring plane matches Saturn's equator
- Vertical thickness: `10-30 m`; a zero-thickness render is structurally accurate for Slice 4

## Render Policy

- Render as a single semi-transparent disk or annulus in `FRAME_SATURN_J2000_ICRF`
- Implementation hint: Three.js `RingGeometry` or equivalent custom annulus geometry with the chosen inner radius and outer radius
- Tilt the disk `26.7°` from the `FRAME_SATURN_J2000_ICRF` `Z` axis at the render layer so that the ring plane matches Saturn's equatorial plane
- The preferred outer boundary is the A ring outer radius at `136,770,000 m`
- The preferred inner boundary is the D ring inner radius at `66,900,000 m`; using the C ring inner boundary at `74,491,000 m` is also acceptable if the faint D ring is intentionally omitted from the first-pass visual
- Use an alpha gradient to encode broad radial density variation:
  - low alpha in the D ring if rendered (`66,900 km` to `74,491 km`)
  - low-to-medium alpha in the C ring (`74,491 km` to `91,975 km`)
  - high alpha in the B ring (`91,975 km` to `117,570 km`)
  - medium alpha in the A ring (`122,050 km` to `136,770 km`)
- The gradient is a render-layer choice; it does not need to match exact optical-depth profiles so long as it preserves structural plausibility
- Cassini Division must be rendered as an explicit darker band spanning `117,500,000 m` to `122,050,000 m`

The Cassini Division is visible from Earth-based telescopes and is a defining visual property of Saturn. Honest representation includes it.

## Deferred Features

Slice 4 explicitly does not include:

- Cassini Division substructure such as Huygens Gap, Encke Gap, or other multi-banded detail
- Individual ringlets within the A and B rings
- Particle-level ring rendering or any particle dynamics
- Shadow casting from Saturn onto the rings or from the rings onto Saturn
- Anisotropic phase scattering or viewing-angle-dependent brightness
- B-ring spokes or other transient radial features
- E ring, F ring, and other diffuse outer rings

## Architectural Pattern

- Saturn rings should live in a dedicated render module such as `src/v2/render/saturn-rings.ts`
- The module is render-layer only; it does not modify `core/` state and does not affect physics
- The render contract established here is Saturn-specific for Slice 4
- A future generalized `PlanetRing` or `Rings` primitive may support Jupiter, Uranus, and Neptune once another slice actually needs it

## Existing Implementation References

These references are precedent patterns, not binding implementation targets:

- Celestia: composite ring texture mapped onto a disk separate from the planet body
- Stellarium: tilted ring disk with real-time tilt handling
- NASA Eyes: textured annulus with ring-shadow support
- Early SpaceEngine: single textured disk with procedural variation
- Current SpaceEngine: optional volumetric ring mode, deferred for Slice 4
