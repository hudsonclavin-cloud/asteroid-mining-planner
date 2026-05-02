# Saturn Oblate Rendering

## Purpose

Saturn is more oblate than Jupiter. Honest mode cannot render Saturn as a sphere using a single radius without discarding visually meaningful truth, so Slice 4 renders Saturn as an oblate ellipsoid while deliberately simplifying the seven major moons to spheres.

- Equatorial-to-polar ratio: `60268 / 54364 = 1.1086`
- Polar-to-equatorial ratio: `54364 / 60268 = 0.9019`
- Flattening: about `9.8%`

For comparison, Slice 3 documented Jupiter at `c / a = 0.9351` and about `6.5%` flattening. Saturn's figure is therefore more visibly flattened.

## Saturn Geometry

Source: `vendor/naif/pck00010.tpc`, line `3422`, confirmed by `tools/slice4-research/pck-extraction.md`

- Equatorial radius `a = 60,268,000 m`
- Equatorial radius `b = 60,268,000 m`
- Polar radius `c = 54,364,000 m`
- Flattening ratio `c / a = 0.9019`

Slice 4 render policy:

- Saturn uses all three axes in render geometry
- The render is axis-aligned with `FRAME_SATURN_J2000_ICRF`
- The rotational axis is the frame `Z` axis

## Implementation Hint

Pick the simplest correct path:

- Construct a Three.js `SphereGeometry` using the equatorial radius as the base radius
- Apply non-uniform scaling on the rotational axis so that `scale.y = c / a = 0.9019` if the scene convention uses `Y` as the visual up / spin axis
- If a dedicated `EllipsoidGeometry` exists in the implementation context, it is also acceptable
- A custom geometry is acceptable only if the simpler paths prove insufficient

Whatever path is used, the result must place Saturn's rotational axis along the `FRAME_SATURN_J2000_ICRF` `Z` axis. No ad hoc local-axis convention should leak into `core/`.

## Rotation

- Saturn's oblate figure is axis-aligned with `FRAME_SATURN_J2000_ICRF`
- No body-fixed rotation animation in Slice 4
- No texture-spin system in Slice 4

Body rotation rendering remains deferred. Slice 4 uses a static axis-aligned oblate figure only.

## Sub-Pixel Implication

Oblateness becomes visibly meaningful only when Saturn's apparent screen diameter exceeds about `25 px` on the target display class (Apple Silicon Mac, integrated GPU, single 4K display).

Rules:

- Above about `25 px`, the oblate figure is visually meaningful and should be rendered honestly
- Below about `25 px`, oblate vs. spherical Saturn is visually indistinguishable in practice
- Below the existing halo trigger of `3 px`, the render falls back to the Slice 2 halo policy: halo only, render-layer artifact, no mutation of canonical state

## Moon Rendering Simplification

Titan, Rhea, Iapetus, Tethys, Dione, Mimas, and Enceladus render as spheres in Slice 4 using their `a` radius from `pck00010`.

Rationale:

- Several Saturnian moons are measurably triaxial in `pck00010`, especially Mimas, Enceladus, Tethys, and Iapetus
- At any zoom level that frames the Saturn system honestly, the triaxial deviation of these moons is sub-pixel relative to the camera framing pressure created by Saturn and the ring system
- Reusing the Galilean simplification keeps the render contract consistent across outer-planet slices

So the spherical simplification for all seven major Saturnian moons is deliberate and honest for Slice 4.

## Future-Slice Note

Uranus and Neptune are also oblate at lower but still real flattening ratios. The oblate rendering pattern defined here and in `src/v2/render/jupiter-oblate.md` should be reused for those slices unless later work introduces a more general ellipsoid render primitive or body-specific triaxial requirements.
