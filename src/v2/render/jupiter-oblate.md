# Jupiter Oblate Rendering

## Purpose

Jupiter is significantly oblate. Honest mode cannot render Jupiter as a sphere using a single radius without discarding visually meaningful truth, so Slice 3 renders Jupiter as an oblate ellipsoid while deliberately simplifying the Galileans to spheres.

- Equatorial-to-polar ratio: `71492 / 66854 = 1.0694`
- Polar-to-equatorial ratio: `66854 / 71492 = 0.9351`
- Flattening: about `6.5%`

This document defines the Jupiter oblate render and the deliberate spherical simplification for Io, Europa, Ganymede, and Callisto.

## Jupiter Geometry

Source: `vendor/naif/pck00010.tpc`, line `3406`

- Equatorial radius `a = 71,492,000 m`
- Equatorial radius `b = 71,492,000 m`
- Polar radius `c = 66,854,000 m`
- Flattening ratio `c / a = 0.9351`

Slice 3 render policy:

- Jupiter uses all three axes in render geometry
- The render is axis-aligned with `FRAME_JUPITER_J2000_ICRF`
- The rotational axis is the frame `Z` axis

## Implementation Hint

Pick the simplest correct path:

- Construct a Three.js `SphereGeometry` using the equatorial radius as the base radius
- Apply non-uniform scaling on the rotational axis so that `scale.y = c / a = 0.9351` if the scene convention uses `Y` as the visual up / spin axis
- If a dedicated `EllipsoidGeometry` exists in the implementation context, it is also acceptable
- A custom geometry is acceptable only if the simpler paths prove insufficient

Whatever path is used, the result must place Jupiter's rotational axis along the `FRAME_JUPITER_J2000_ICRF` `Z` axis. No ad hoc local-axis convention should leak into `core/`.

## Rotation

- Jupiter's oblate figure is axis-aligned with `FRAME_JUPITER_J2000_ICRF`
- No body-fixed rotation animation in Slice 3
- No texture-spin system in Slice 3

Body rotation rendering remains deferred. Slice 3 uses a static axis-aligned oblate figure only.

## Sub-Pixel Implication

Oblateness becomes visibly meaningful only when Jupiter's apparent screen diameter exceeds about `30 px` on the target display class (Apple Silicon Mac, integrated GPU, single 4K display).

Rules:

- Above about `30 px`, the oblate figure is visually meaningful and should be rendered honestly
- Below about `30 px`, oblate vs. spherical Jupiter is visually indistinguishable in practice
- Below the existing halo trigger of `3 px`, the render falls back to the Slice 2 halo policy: halo only, render-layer artifact, no mutation of canonical state

## Galilean Rendering Simplification

Io, Europa, Ganymede, and Callisto render as spheres in Slice 3 using their `a` radius from `pck00010`:

- Io: `1,829,400 m`
- Europa: `1,562,600 m`
- Ganymede: `2,631,200 m`
- Callisto: `2,410,300 m`

Rationale:

- Io and Europa have minor triaxial variation in the kernel, but that difference is sub-percent
- At any zoom level that frames the Galileans together around Jupiter, the triaxial deviation is sub-pixel
- Ganymede and Callisto are already spherical in the kernel entries used here

So the spherical simplification for all four Galileans is deliberate and honest for Slice 3.

## Future-Slice Note

Saturn (Slice 4) is more oblate than Jupiter at roughly `10%` flattening. The oblate rendering pattern defined here should be reused as-is for Saturn unless a later slice introduces a more general ellipsoid render primitive.
