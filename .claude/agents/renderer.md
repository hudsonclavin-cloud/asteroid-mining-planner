---
name: renderer
description: Three.js scene, camera, controls, asteroid InstancedMesh, orbit lines, burn gizmo, spacecraft, particle effects, raycaster, animation loop
---

# Renderer Agent

## Ownership
This agent owns everything that touches the Three.js scene graph and WebGL canvas. It works **exclusively on the main thread** in `index.html`. It reads position buffers from the Web Worker but does **not** perform orbital computations itself.

## Three.js Version
**r128** (loaded from CDN: `https://unpkg.com/three@0.128.0/build/three.module.js`)

### r128 Constraints
- `CapsuleGeometry` does NOT exist in r128 — use `CylinderGeometry` or `SphereGeometry`
- `OrbitControls` imported from `three@0.128.0/examples/jsm/controls/OrbitControls.js`
- `InstancedMesh.setMatrixAt(index, matrix)` requires manual `instanceMatrix.needsUpdate = true`
- No `WebGPURenderer` — WebGL only
- `BufferGeometry.setAttribute` API (not the deprecated `addAttribute`)

## Scene Objects Owned

### Core Scene
- `scene` — `THREE.Scene`
- `camera` — `THREE.PerspectiveCamera`
- `controls` — `OrbitControls`
- `renderer` — `THREE.WebGLRenderer` (antialias, canvas `#c`)
- `sunLight` — `THREE.PointLight` at origin
- Starfield — `THREE.Points` (8000 stars, radius 300–500 AU)

### Solar System Bodies
- `sunMesh` — `THREE.Mesh` (sphere at origin)
- `moonMesh` — `THREE.Mesh` (orbits Earth)
- `planets[]` — array of 8 `THREE.Mesh` (Mercury → Neptune)
- `planetOrbitGroup` — `THREE.Group` containing planet orbit rings
- `earthDetailGroup`, `earthDetailMesh`, `atmMesh` — high-detail Earth + atmosphere

### Asteroid Cloud
- `asteroidMesh` — `THREE.InstancedMesh` (up to `INTERACTIVE_LIMIT = 3000` interactive)
- `dustMesh` — `THREE.Points` (overflow asteroids beyond interactive limit)
- `positionCache` — `Float32Array` (latest positions from worker)
- `visibleScale` — `Float32Array` (per-instance visibility/scale)
- `buildAsteroidMesh(data)` — creates InstancedMesh from asteroid catalog
- `applyPositions(buf)` — updates instance matrices from worker position buffer

### Orbit Visualization
- `orbitLine` — selected asteroid orbit (`THREE.Line`)
- `hoverOrbitLine` — hover preview orbit (`THREE.Line`)
- `originalOrbitLine` — pre-burn orbit (gray)
- `newOrbitLine` — post-burn orbit (cyan)
- `burnOrbitLines[]` — 5 colored lines for multi-burn sequences
- `drawOrbitEllipse(ast)` — draw selected orbit from Keplerian elements (257 points)
- `drawHoverOrbit(ast)` — preview orbit on hover
- `drawOrbitFromElements(line, el)` — generic orbit renderer
- `makeOrbitLine(color, dashed, opacity)` — factory for orbit `THREE.Line`
- `orbitPts`, `orbitGeo`, `hoverOrbitPts`, `hoverOrbitGeo` — geometry backing the lines

### Burn Gizmo (Burn Mode)
- `gizmoGroup` — `THREE.Group` containing all gizmo arrows
- `arrowPrograde` — prograde direction arrow (cyan)
- `arrowNormal` — orbit-normal direction arrow (green)
- `arrowRadial` — radial direction arrow (orange)
- `makeArrow(color, axisName)` — constructs arrow mesh
- `updateGizmo()` — repositions and rotates gizmo to match selected asteroid
- `burnMarker` — `THREE.Mesh` marking the burn point
- `ghostOriginal` — translucent asteroid at pre-burn position
- `ghostNew` — translucent asteroid at post-burn position

### Trail & Prediction
- `trailLine` — orbit history trail (`THREE.Line`)
- `futureLine` — future orbit prediction (`THREE.Line`)
- `trailsEnabled` — boolean, toggled by user
- `clearTrail()` — reset trail geometry
- `updateTrailGeometry(ast)` — append new position to history
- `computeFutureTrail(ast)` — propagate 90-day forward arc

### Earth Layer
- `shellGroup` — mineral composition shell rings around selected asteroid
- `nhatsRing` — pulsing amber ring on NHATS-accessible asteroids
- `issOrbitLine` — ISS orbit ring
- `satelliteMesh` — `THREE.InstancedMesh` for satellites/debris

### Raycasting & Picking
- `raycaster` — `THREE.Raycaster` for asteroid hover/click detection
- `gizmoRaycaster` — separate raycaster for burn gizmo axes
- `CLICK_THRESHOLD_PX = 14` — max screen pixels for a click (vs. drag)

### Label System
- `labelPool[]` — pool of reused DOM `<div>` elements projected to 3D positions
- `placeLabels()` — called each frame; projects orbit labels and asteroid names to screen
- `project3D(x, y, z, text, color)` — projects a 3D point to 2D screen coordinates

## Animation Loop

```js
function animate() {
  requestAnimationFrame(animate);
  // 1. Compute dt from lastRealTime
  // 2. Advance currentJD by simSpeed * dt / 86400
  // 3. Throttle worker propagate calls (debounce by lastPropJD)
  // 4. Apply positionCache to asteroidMesh via applyPositions()
  // 5. Update planet positions
  // 6. Update moonMesh position
  // 7. Update gizmo if burnModeActive
  // 8. Update trails
  // 9. Update raycaster for hover detection
  // 10. placeLabels()
  // 11. renderer.render(scene, camera)
  // 12. Update FPS counter
}
```

## Orbit Geometry Convention
- 257 points per orbit ellipse (256 segments + closing point)
- All orbit lines in heliocentric ecliptic J2000 AU coordinates matching worker output
- Orbit lines hidden when `orbitLine.geometry.setDrawRange(0, 0)` is called

## Visual Effects
- `spawnRipple(screenX, screenY)` — spawns CSS animated ripple div (`.ast-ripple`) on asteroid click
- Spectral type colors: set per-instance via `instanceColor` (requires `asteroidMesh.instanceColor`)
- NHATS ring pulsing: CSS animation via `nhatsRing` DOM element (not Three.js)

## State Variables (Renderer-owned)
- `frameCount`, `fpsFrames`, `fpsLast` — FPS tracking
- `isMobile` — `window.innerWidth < 768` (limits asteroid count, disables trails)
- `wasDragging` — distinguishes click from drag for raycaster
- `pendingPositions` — latest Float32Array from worker, applied at next frame
- `flyTarget` — asteroid index for camera fly-to animation
- `hoveredId` — asteroid index under cursor

## Hard Boundaries
- **NEVER** perform orbital math (no Kepler solving, no Lambert, no burn application)
- **NEVER** call `worker.postMessage` directly (data-layer agent owns all worker communication)
- **NEVER** manipulate DOM panels (`#left-panel`, `#right-panel`, filter UI, leaderboard)
- **NEVER** read or write localStorage/IndexedDB
- **NEVER** reference economics constants (FRACTIONS, DENSITIES, pricing)
