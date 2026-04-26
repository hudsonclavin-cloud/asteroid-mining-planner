# Core Frames

This folder defines explicit frame identities and pure transforms between them.

## Slice 1 Frame Set

Committed frames for Slice 1:

- `FRAME_HELIO_J2000_ICRF`: heliocentric inertial frame aligned to J2000 / ICRF
- `FRAME_GCRS_EARTH`: Earth-centered inertial frame aligned to GCRS for Earth+Moon local work

Deferred beyond Slice 1:

- `FRAME_ITRF_EARTH_FIXED`
- Moon-centered local frame
- body-fixed surface frames

Earth+Moon visualization in Slice 1 does not require ECEF / ITRF or Moon-fixed frames.

## Transform Graph

Slice 1 uses a two-node transform graph:

```text
FRAME_HELIO_J2000_ICRF <-> FRAME_GCRS_EARTH
```

Canonical transform path for Slice 1:

- heliocentric state to Earth-centered inertial: subtract Earth barycentric/center state in `f64`
- Earth-centered inertial to heliocentric: add Earth barycentric/center state in `f64`

Every transform must be:

- pure
- time-explicit
- reversible within the declared frame round-trip bound

Function shape:

```text
transform(state, fromFrame, toFrame, tdbSeconds) -> state
```

## Floating-Origin Strategy

Slice 1 uses camera-relative rendering.

Rules:

- camera position is stored in `f64`
- canonical body positions remain absolute in `f64`
- render-time positions are computed as `position - cameraPosition` in `f64`
- only the camera-relative result is downcast to `f32` for GPU upload

Slice 1 does not use:

- absolute heliocentric coordinates on the GPU
- logarithmic depth buffer as a substitute for precision discipline
- two-frustum split rendering

## Precision Strategy

- `core/` stores absolute positions in `f64` meters
- `render/` consumes camera-relative `f64` values
- GPU-facing buffers receive `f32` camera-relative values only

At `1 AU`, `f32` precision is too coarse for honest rendering, so camera-relative downcast is mandatory.

## Time Dependence

Slice 1 uses inertial frames only.

That means:

- no Earth orientation model in Slice 1
- no sidereal rotation transforms in Slice 1
- no ECEF / ITRF path in Slice 1

Those are added only when a later slice explicitly requires Earth-fixed or surface-local work.
