# Halo Overlay System

## Purpose

At heliocentric scales, physically honest body geometry falls below the pixel threshold and becomes invisible. Halo overlays are screen-space artifacts that keep all bodies findable without altering their canonical positions or sizes.

## Trigger (DEC-3)

A halo appears when a body's apparent diameter drops below **3 pixels**.

Apparent diameter in pixels:

```
apparent_diameter_px = 2 × arctan(body_radius_m / camera_distance_m) × (viewport_height_px / fov_rad)
```

The 3-pixel threshold is uniform across all bodies. No per-body overrides.

## Architecture constraints

- Halos are `render/`-only. They have no `core/` dependency.
- Halos may not read from or write to canonical state.
- Halos consume already-projected screen-space data: body position in clip or NDC space, projected radius in pixels.
- Halos do not modify, mask, or shadow the underlying body geometry. The geometry renders beneath the halo at all times.
- Halo position may use linear interpolation for on-screen smoothing between frames. Cubic Hermite is not required for render-only artifacts.

## Implementation hints

- Screen-space sprite or instanced quad per body (six bodies in Slice 2).
- Color per body from `src/v2/core/constants/README.md` (render layer reads the color table; `core/` does not store colors).
- Compute projected size each frame from camera distance and body radius (both available in render layer).
- Toggle via a module-level config flag exported from `src/v2/render/halos.ts` (when implemented). No UI toggle in Slice 2 — `ui-hud` is frozen. Wire as a code constant; UI exposure deferred.

## Sun interaction (DEC-2)

The Sun uses a plain emissive sphere. No bloom, no post-processing pass. The Sun halo triggers at the same 3-pixel threshold as all other bodies and uses the same sprite mechanism.

## Performance constraint

Total halo render cost must not exceed **0.5 ms per frame** for all six bodies on the target machine class: Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display.

## Toggle state

Default: **on**. A consuming page may set the toggle flag to off before mount. The toggle state is render-layer only — it does not affect `core/` state or invariant checks.
