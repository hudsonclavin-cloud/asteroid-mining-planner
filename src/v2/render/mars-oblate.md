# Mars Oblate Rendering

## Purpose

Slice 6 renders Mars as an oblate ellipsoid using all three `pck00010` axes, replacing Slice 2's spherical Mars representation. Mars's flattening is about `0.59%` (`a = 3396.19 km`, `c = 3376.20 km`), much less pronounced than Saturn's `9.8%` or Jupiter's `6.5%`, but architecturally consistent with the V2 oblate-rendering pattern.

## Render-Only Tilt

Mars's axial tilt is `25.19°` relative to its orbital plane. Per the V2 architectural pattern established in Slice 4 (`saturn-oblate.md`), tilt is applied as a render-layer rotation at `marsTiltGroup`, not at the `FRAME_MARS_J2000_ICRF` core frame. `FRAME_MARS_J2000_ICRF` stays ICRF-aligned per the Slice 3-4 frame discipline.

## Hierarchy

```text
marsSystemGroup
  ├── marsTiltGroup // rotation.x = MARS_RENDER_TILT_RAD ≈ 0.4395 (25.19°)
  │   └── mars body mesh (oblate ellipsoid)
  └── marsCenteredGroup
      ├── phobos mesh (sphere)
      └── deimos mesh (sphere)
```

`marsCenteredGroup` is a sibling of `marsTiltGroup`, not a child. Phobos and Deimos states live in `FRAME_MARS_J2000_ICRF`, which is already canonically ICRF-aligned. Applying Mars's render-only axial tilt to the moon group would rotate moon positions out of their canonical ICRF orientation, causing the rendered moon positions to disagree with focus-target anchors computed via `getHeliocentricState`. The render-only tilt is geometry-presentation only, applied to Mars body mesh, not to other bodies in the Mars system. This matches the Saturn precedent (`saturnTiltGroup` contains Saturn body and rings only; Saturn moons are siblings).

## Geometry

Source: `vendor/naif/pck00010.tpc`, line `3390`, confirmed by `tools/slice6-research/pck-extraction.md`

- Equatorial radius `a = 3,396,190 m`
- Equatorial radius `b = 3,396,190 m`
- Polar radius `c = 3,376,200 m`
- Flattening ratio `c / a ≈ 0.9941`

Implementation hint:

- Construct a Three.js `SphereGeometry` using the equatorial radius as the base radius
- Apply non-uniform scaling on the rotational axis so that `scale.y = c / a ≈ 0.9941` if the scene convention uses `Y` as the visual up / spin axis
- If a dedicated `EllipsoidGeometry` exists in the implementation context, it is also acceptable
- A custom geometry is acceptable only if the simpler paths prove insufficient

Whatever path is used, the result must place Mars's rotational axis `25.19°` from the `FRAME_MARS_J2000_ICRF` `Z` axis at the render layer. No ad hoc local-axis convention should leak into `core/`.

## Critical: Default Mars-Focused Camera Must Not Be Edge-On To The Tilted Equatorial Plane

Per the §13 Slice 5 known limitation, render-only `X`-axis tilt interacts with a default focus camera positioned along the `X` axis to produce mathematical edge-on coincidence. Slice 5 fix (commit `8f3c30e`) used `orbitPolar = π/3` (`60°` polar) for Saturn focus to avoid this. Slice 6 must apply the same discipline: default Mars focus orbit angles must produce a non-edge-on view of Mars's tilted equatorial plane.

Phobos and Deimos orbit close to Mars's equatorial plane. An edge-on view of Mars's tilt would put both moon orbits on a near-line, making moons hard to find via direct observation (halos would still find them, but the visual cutover criterion is body visibility from default focus, per §11).

## Rotation

- Mars's oblate figure is tilted `25.19°` from the `FRAME_MARS_J2000_ICRF` `Z` axis at the render layer
- No body-fixed rotation animation in Slice 6
- No texture-spin system in Slice 6

Body rotation rendering remains deferred. Slice 6 uses a static render-only tilted oblate figure only.

## Verification Protocol

Slice 6 cutover verification per §11 requires:

- Default outer-system overview camera shows Mars at honest sub-pixel scale (Mars's apparent diameter from `7 AU` is similar in magnitude to Saturn's at the same distance)
- User-driven Mars focus (key mapping chosen at implementation) shows Mars body and moons **without** manual camera orbit needed
- Mars renders as an oblate ellipsoid (very subtle flattening, may not be visually distinguishable from a sphere at typical zoom — that is expected given `0.59%` flattening)
- Phobos and Deimos visible as tiny halos initially, resolved as bodies at high zoom

## Out Of Scope

- Mars surface terrain (Olympus Mons, Valles Marineris, polar ice caps)
- Atmospheric haze rendering
- Body-fixed rotation animation
- Triaxial Phobos rendering (Slice 6 ships spherical Phobos despite `30%` triaxial spread)
- Triaxial Deimos rendering (Slice 6 ships spherical Deimos despite `34.6%` triaxial spread)
