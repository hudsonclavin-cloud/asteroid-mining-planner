# Slice 8 Spatial Index Architecture

## Purpose

Documents the broad-phase spatial indexing architecture for Slice 8 asteroid rendering. Slice 8's `10,008`-body catalog adds enough moving bodies that frustum culling and picking can no longer be treated as incidental loops over the entire population. A coarse static spatial structure is therefore part of the render architecture, not an optimization afterthought.

## Scope

The Slice 8 spatial index serves two jobs:

1. frustum culling for resolved asteroid rendering
2. broad-phase acceleration for click-to-focus raycasting

It does not own propagation truth. `core/` still owns propagated asteroid positions.

## Rejected Patterns

Per Perplexity research and Slice 8 scope:

- not `three-mesh-bvh`
  - excellent for static mesh raycasting
  - poor documented fit for a continuously moving many-instance population
- not per-frame BVH rebuild
  - too expensive at `10k` moving bodies
- not a per-asteroid scene-graph tree
  - too much bookkeeping for too little visibility gain

Slice 8 needs a coarse structure whose update cost is stable and predictable.

## Recommended Approach

Phase A measurement locked the implementation to a uniform grid. The original Thursday planning guess used `8 AU` cells, but the real `10,008`-body fixture showed that choice was useless for culling: `10,007` bodies collapsed into the central cell. The production Slice 8 baseline is therefore a `1 AU` uniform grid over the same heliocentric cube.

## Uniform Grid Baseline

### Static Volume

- heliocentric coordinate space
- approximately `50 AU` cube covering the inner system, the main belt, and the near-Jupiter range relevant to the visible catalog
- fixed `1 AU` cell size

This yields a small coarse set of bins rather than a deep adaptive hierarchy.

### Measurement-Grounded Cell Size Revision

Measured against the real Slice 8 fixture:

- `8 AU`: `2` occupied cells, rejected because culling is effectively useless
- `4 AU`: `9` occupied cells, rejected as too coarse
- `2 AU`: `47` occupied cells, rejected because culling leverage is still weak
- `1 AU`: `178` occupied cells, max `368` bodies per cell, chosen
- `0.5 AU`: `773` occupied cells, rejected due to scene-graph overhead risk

The original Thursday planning assumption was wrong. Slice 8 corrects it before cell-as-mesh renderer implementation rather than carrying a broken partition into A2.

### Per-Cell State

Each cell tracks:

- its fixed AABB in heliocentric coordinates
- the asteroid ids currently assigned to it
- any precomputed indexing metadata needed for visible-instance repacking

Cells themselves are static. Only body-to-cell membership changes.

## Update Strategy

Asteroid positions move every frame, but cell membership changes rarely relative to render cadence.

Recommended flow:

1. propagate positions
2. test whether a body has crossed its current cell boundary
3. only when it has crossed, remove from old cell and append to new cell
4. leave all other memberships untouched

This is cheaper than treating the entire structure as rebuildable every frame.

## Frustum Culling

Broad-phase culling runs at the cell level:

1. build camera frustum from the active camera
2. test each cell AABB against the frustum
3. reject cells wholly outside
4. gather only bodies from intersecting cells
5. repack visible resolved asteroids into the front of the instancing buffer

The goal is not mathematically minimal visibility. The goal is to skip obviously off-screen work with a coarse, cheap test.

## Picking

Click-to-focus reuses the same structure:

1. cast the picking ray in heliocentric scene space
2. traverse candidate cells intersected by the ray
3. test only bodies assigned to those cells
4. resolve the nearest hit into asteroid identity

This makes the spatial index dual-purpose instead of maintaining separate culling and picking structures.

## Performance Estimate

Measured occupancy from the real fixture:

- `178` occupied cells at `1 AU`
- worst occupied cell contains `368` bodies
- average occupied cell contains `~56` bodies

Per-camera visible-cell counts remain a Phase A runtime measurement question, but the production partition is now grounded in the actual `10,008`-body data rather than pre-research guesses.

## Tradeoffs

### Uniform Grid

Pros:

- simplest implementation
- predictable memory layout
- easy cell-AABB frustum tests
- straightforward debugability

Cons:

- wastes space in sparse regions
- cell density may be uneven across the catalog

### Loose Octree

Pros:

- more adaptive to uneven density
- fewer empty nodes in sparse regions

Cons:

- more bookkeeping
- more complex update logic for moving bodies
- harder to debug under Slice 8's time box

### Spatial Hashing

Pros:

- attractive for sparse or unbounded distributions

Cons:

- less explicit geometric reasoning for frustum and ray traversal
- more implementation complexity than the uniform-grid baseline buys at `10k` scale

## Phase A Decision Boundary

Phase A has already resolved the high-level structure choice and the cell size:

- keep the simpler uniform grid
- use `1 AU` cells

The remaining question is whether that measured partition actually clears the `60 fps` cutover bar on target hardware.

## Relationship To Slice 8 Cutover

The spatial index is cutover-relevant, not optional:

- off-screen cells must be culled correctly
- click-to-focus must still resolve correctly in Points, InstancedMesh, and focused Mesh modes
- the renderer must preserve the same propagated truth path used in Slice 7

If Slice 8 clears visual correctness but misses `60 fps`, the spatial index has failed its reason for existing.
