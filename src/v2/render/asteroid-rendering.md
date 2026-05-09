# Slice 7 Asteroid Rendering

## Purpose

Documents the render-layer architecture for the Slice 7 asteroid catalog. Slice 7 introduces `~1,008` asteroid bodies, which is the first V2 slice where naive "one `Mesh` per body at all zoom levels" stops being the right default. The render path therefore uses three representation modes while preserving one canonical orbital truth path in `core/`.

## Rendering Truth

- Asteroid positions always come from canonical `core/` state in `FRAME_HELIO_J2000_ICRF`
- LOD selection is a render-only decision
- Changing representation mode may not alter position, velocity, focus target, or any `core/` data
- The same propagated asteroid state must drive both rendering and click-to-focus targeting

Slice 7 keeps honest-mode position truth intact while allowing the presentation primitive to change with apparent size.

## Three-Mode LOD Policy

Slice 7 uses three rendering modes:

1. `THREE.Points` for unresolved, sub-pixel asteroids
2. `THREE.InstancedMesh` for resolved but non-focused asteroids
3. Individual `Mesh` for the focused asteroid body

Transitions are driven by apparent diameter, not by raw world-space distance. This matters because apparent size is the honest visibility quantity; distance alone is not.

## Mode 1: Points

Points mode is the baseline representation for the majority of the catalog at heliocentric overview scales.

- Primitive: one shared `THREE.Points` draw for unresolved asteroids
- Material: custom shader material with additive blending
- Visual goal: soft-glow points that remain findable without pretending the asteroid is physically larger than it is
- Input data per point: camera-relative position, color, and any scalar needed for opacity or brightness falloff
- The point shader is a render-only readability aid, analogous in spirit to halo overlays but specific to asteroid catalog density

### Soft-Glow Shader Policy

The fragment shader for Points mode must:

- render a soft radial falloff rather than a hard square point sprite
- use additive blending
- fade to transparent at the point edge
- avoid writing any state back into `core/`

The shader is a readability device, not a physical scattering model. It is allowed because it does not move the asteroid or falsify the focus target.

## Mode 2: InstancedMesh

Instanced mode is for asteroids that have become resolved enough to merit body-like geometry but are not the active focused body.

- Primitive: one or a small number of shared `THREE.InstancedMesh` batches
- Geometry: sphere or other intentionally simplified body geometry
- Transform source: each instance matrix comes from the propagated asteroid state
- Use case: nearby or zoomed-in catalog bodies where a point sprite becomes visually insufficient

Instanced mode preserves batching while allowing a body to feel like a small object rather than a screen-space point.

## Mode 3: Focused Mesh

Focused mode is for the currently selected asteroid only.

- Primitive: individual `Mesh`
- Ownership: one focused-body render path at a time
- Use case: click-to-focus target, close inspection, and any per-body material detail that would be awkward in the instanced path

Slice 7 is click-to-focus only. Search and richer asteroid browsing remain deferred to Slice 9.

## Transition Rule

- LOD transitions are keyed off apparent diameter
- Apparent diameter is evaluated from current camera state and body radius
- Threshold values are render constants, tuned during implementation and cutover verification
- The thresholds must preserve visual continuity: no large pop, no transient disappearance, no disagreement between visible representation and focus target

The important architectural lock is the driver, not the exact numeric threshold: Slice 7 transitions on what the user can honestly see, not on an arbitrary distance bucket.

## Scene Composition

The asteroid catalog should be rendered as a sibling system within the existing `/v2/solar-system` scene, not as a separate camera or isolated sub-app.

- Planets and moons continue using the existing body render path
- Asteroids reuse the same heliocentric camera-relative subtraction discipline
- Slice 7 does not introduce a new frame, a new route, or a parallel truth hierarchy

## Focus Behavior

- Asteroids participate in click-to-focus only
- Focus target anchors derive from the same propagated heliocentric state used for rendering
- There is no asteroid search UI in Slice 7
- `ui-hud` remains frozen

The render path must not create a second focus-target computation that could drift from the displayed body. Slice 6's render-vs-focus mismatch lesson applies here too.

## Performance Note

The LOD split exists because Slice 7 is the first many-body slice.

- Catalog size: `1,008` bodies
- Continuous per-frame propagation is acceptable at this scale
- Continuous per-frame individual meshes for all bodies is unnecessary and wasteful
- Points plus batching is the honest performance architecture for the unresolved majority

This is the stepping stone to future catalog scales. If Slice 9 expands to tens of thousands of bodies, the same architectural division will likely remain, though propagation and batching may move further toward GPU execution.

## Non-Goals

- asteroid orbit trails
- labels or name overlays
- search UI
- photoreal asteroid shape models
- per-asteroid shader uniqueness across the whole catalog
- physical dust / coma rendering
- mission-planning fidelity

Slice 7 is a visualization-grade asteroid catalog, not a small-body simulation product.
