# Slice 8 Asteroid Instancing Architecture

## Purpose

Documents the render-layer extension from Slice 7's `1,008`-body asteroid catalog to Slice 8's `10,008`-body catalog. Slice 7 proved the three-mode LOD architecture and orbit-line MVP. Slice 8 keeps that visual model, but must add aggressive visibility management so the same architecture can hold `60 fps` at `10x` population.

## Continuity From Slice 7

Slice 8 does not replace the Slice 7 asteroid renderer. It extends it.

- Points / InstancedMesh / focused Mesh remain the canonical three modes.
- Orbit lines remain render-layer artifacts, not propagation truth.
- Keplerian propagation still produces one canonical heliocentric truth position per asteroid.
- Render mode decisions remain downstream of `core/` truth.

The novelty in Slice 8 is not a new primitive. It is how visibility is bounded at catalog scale.

## Scale Change

| Slice | Bodies | Dominant render problem |
|---|---:|---|
| Slice 7 | `1,008` | many-body LOD and belt-band readability |
| Slice 8 | `10,008` | submission count, off-screen waste, and pickability at scale |

Rendering all `10,008` bodies every frame with naive instance submission is the wrong default even if the propagation math remains acceptable. Slice 8 therefore bundles GPU instancing with frustum culling and spatial indexing as one architectural package.

## Core Primitive

Slice 8 stays with `THREE.InstancedMesh` for resolved asteroids.

- one shared low-poly sphere geometry
- one or a small number of shared materials
- one instance transform per currently visible resolved asteroid
- one draw per batch rather than one draw per asteroid

This is the same primitive that already worked in Slice 7. The change is that Slice 8 does not submit every resolved asteroid every frame.

## Visibility Pipeline

Per Perplexity research, the canonical Slice 8 resolved-body flow is:

1. propagate asteroid truth positions from the shared anchor epoch
2. update or confirm each asteroid's cell/bin membership in a coarse spatial index
3. test cells against the camera frustum
4. gather only bodies from visible cells
5. repack visible instances into the front of the instance buffer
6. set `instancedMesh.count` to the visible-body count

This replaces "submit all `10,008` instances every frame" with "submit only the visible subset."

## LOD Modes At Scale

Slice 8 preserves Slice 7's representation rules:

1. `THREE.Points` for unresolved sub-pixel asteroids
2. `THREE.InstancedMesh` for resolved but non-focused asteroids
3. individual `Mesh` for the focused asteroid

What changes is the resolved-body path:

- Slice 7: all resolved asteroids could be submitted directly
- Slice 8: resolved asteroids must pass spatial-index-driven culling before they enter the visible instance range

Points mode still absorbs the unresolved majority. Focused Mesh mode still owns only one asteroid at a time.

## Per-Instance Data

Each visible resolved asteroid contributes:

- position from per-frame Keplerian propagation
- color from precomputed RGB triples
- scale derived from `estimatedRadiusM`
- optional instance id / lookup mapping for click-to-focus resolution

Low-polygon sphere geometry (`12-16` segments) remains the honest default. Slice 8 is not a shape-model slice.

## Frustum Culling Responsibility

Slice 8's renderer does not do per-instance frustum tests in isolation. The spatial index owns visibility broad-phase:

- cells are tested first
- only bodies in visible cells are considered for submission
- off-screen cells imply zero instance work for their contents

The renderer therefore depends on a static coarse spatial index rather than ad hoc instance-by-instance culling.

## Picking Responsibility

The same spatial index that accelerates frustum culling also becomes the broad-phase for picking:

- Points-mode hit tests can restrict candidates to cells intersected by the ray
- InstancedMesh hit tests can map `instanceId` back to asteroid identity
- Focused Mesh continues using the straightforward single-body path

This avoids maintaining two unrelated acceleration structures for the same moving population.

## Performance Target

Slice 8 is explicitly performance-constrained:

- `60 fps` at outer-system overview
- `60 fps` while zoomed into a focused asteroid
- `60 fps` while time-scrubbing

These are cutover criteria, not aspirations. The instancing architecture exists to meet them without abandoning the Slice 7 visual model.

## Orbit-Line Continuity

Adaptive orbit rendering carries forward the Phase H lesson:

- orbit lines remain the artifact that makes the asteroid belt read as a band
- Slice 8 keeps orbit lines only for the brightest subset (`H < 10.98`)
- the Points layer and the orbit-line layer work together; neither is sufficient alone at this population scale

This keeps the Slice 7 belt-band visual intact while avoiding a `10,008`-orbit line explosion.

## Non-Goals

- replacing `THREE.InstancedMesh` with a new rendering stack
- GPU Keplerian propagation
- wide-line orbit rendering
- additive orbit-line blending
- per-asteroid materials or shape libraries
- UI search / filter / label overlays

Slice 8 is a scale-up slice, not a rendering-style reboot.
