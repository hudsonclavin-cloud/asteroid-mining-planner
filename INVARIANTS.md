# INVARIANTS.md — Technical facts agents must not violate

> These are constraints derived from founding docs and the engineering record.
> Each is cited to its source. If you think one is wrong, stop and report — do not silently override it.
> For process rules see AGENTS.md §2. For current project state see STATUS.md.

---

## §1. Repo and language rules

- **`src/v2/` is canonical.** All V2 work lives here. Pre-V2 dirs (`src/workers/`, `src/ui/`,
  `src/economics/`, `src/renderer/`, `src/state/`) are legacy and excluded from tsc. V2 code
  must not import from them.
- **TypeScript throughout.** No new `.js` files in `src/v2/`. Test files use `.mjs`
  (Node `--test` runner pattern).
- **MIT license throughout.** No copyleft dependency may be added without a new DEC.
  Source: `src/v2/SLICE_10_FOUNDING.md` OQ-3 closure.

---

## §2. Numerical and frame conventions

### Lambert convention (AMD-7, `src/v2/SLICE_11_FOUNDING.md`)

```
r1 = Earth heliocentric position at departure (depJD)
r2 = asteroid heliocentric position at arrival (depJD + tofDays)
vInfDep  = v1 − vEarth(dep)         ← departure excess velocity, heliocentric ECLIPTIC
vInfArr  = v2 − vAsteroid(arr)       ← arrival excess velocity, heliocentric ECLIPTIC
C3       = |vInfDep|²                ← km²/s²
selectedBranch = min-C3 converged branch
```

Units inside worker: meters, m/s, TDB seconds since J2000.
Message boundary: JD + `tofDays` (days, not seconds).

### C3 colormap (DEC-3 amendment, commit `b596f9f`, `src/v2/SLICE_11_FOUNDING.md`)

```
t = (log(C3_clamped) − log(1)) / (log(1000) − log(1))     clamped [0,1]
C3_MIN = 1 km²/s²     C3_MAX = 1000 km²/s²
Contours: 10, 30, 100, 300 km²/s²
```

Viridis: dark blue = low C3 (feasible), yellow = high C3 (infeasible).
Legend must state "logarithmic scale."
Verified anchors: C3=8.78→[52,98,139], C3=69.5→[61,171,121], C3=300→[142,210,80], C3>1000→[253,231,37].
C3=0 / sub-floor: clamp to t=0 (darkest), never NaN.

### Earth-departure Earth-state source (DEC-11C-5, `src/v2/SLICE_11_FOUNDING.md`)

Two-span split: the **porkchop worker** uses its OWN long-span Earth fixture at `src/v2/data/`
(2026–2040 departure window). The **3D scene** uses the 90-day runtime fixture
(`loadSolarSystemStatesBrowser`). Do not merge these two sources.

### DLA frame conversion (⚠ NOT YET LOCKED — verify before locking, `tools/slice12-research/DLA_RESEARCH_SUMMARY.md`)

Aster's Lambert output (vInfDep) is in **heliocentric ecliptic** frame. The DLA formula needs
**Earth equatorial** frame. One rotation required:

```
v∞,Z_equatorial = v∞,Y_ecliptic · sin(ε) + v∞,Z_ecliptic · cos(ε)
DLA = arcsin(v∞,Z_equatorial / |v∞|)
ε = 23.44°  (J2000 mean obliquity)
```

⚠ **Verify-before-lock**: validate against poliastro or a known mission's published DLA before
any DEC locks. Do not implement without an oracle verification gate.

---

## §3. Rendering rules

### Floating-origin rendering (`V2_FOUNDING_DOCUMENT.md` §3.1.1)

- Core positions: stored in **absolute heliocentric f64 meters**.
- GPU (f32): receives **camera-relative** positions — subtract anchor before upload.
- Downcast to f32 only at the final GPU upload boundary.

### Scene graph position rule (`V2_FOUNDING_DOCUMENT.md` §13 — Slice 6 Phase G lesson)

- Render-only tilt groups (`marsTiltGroup`, `saturnTiltGroup`) wrap the **body mesh only**.
- Child bodies (moons) are **siblings** of the tilt group, NOT children.
- Putting children inside a tilt group rotates them out of their canonical ICRF positions.

### Atmosphere shells (`src/v2/SLICE_V1_FOUNDING.md` V1-C1)

- Atmosphere shells: `scene.add()` as **scene-level siblings** — NOT planet children.
  Reason: oblate bodies use non-uniform Y-scale; children inherit it. Atmosphere must be spherical.
- Per-frame: copy position from `renderRoots.get(bodyId).position` immediately after
  `root.position.set()` in the body loop (~`runtime.ts` line 1235).
- renderOrder: Earth 1000 / Venus 1001 / Mars 1002 / Jupiter 1003 / Saturn 1004.

### Scene children take scene-relative coordinates — never camera-relative

Any object added to the scene (via `scene.add(...)`) must have its `.position` set in
**scene-relative coordinates** — i.e. `worldPos − anchorPosM`. Camera-relative
coordinates (`worldPos − anchorPosM − cameraPos`) are for objects **parented to the camera**,
not scene children.

**Concrete rule for halos and similar sprites:** if a sprite is `scene.add()`-ed, feed it
`positionRelScene`. If distance-from-camera is needed for size or opacity math, pass a
separate scalar `distanceToCameraM`. Do not conflate the two into a single vector.

Source: halo frame bug diagnosed and fixed 2026-07-01 (commits `5c9451e`, `dc44751`).
Symptom: all planet dots rendered offset from their true positions by `−camLocal`.

### Three.js r128 API constraints

| Correct (r128) | Wrong (newer) | Reason |
|----------------|---------------|--------|
| `texture.encoding = THREE.sRGBEncoding` | `texture.colorSpace` | Added in r152 |
| `texture.encoding = THREE.LinearEncoding` | (same) | Normal/specular maps |
| Manual camera controls | `THREE.OrbitControls` from CDN | Not in r128 bundle |
| CylinderGeometry + SphereGeometry | `THREE.CapsuleGeometry` | Added in r142 |

---

## §4. Math-layer validation oracles

### Lambert solver

- **Primary oracle:** poliastro 0.17.
- **Dual-oracle required** for boundary-case work (T_min, M transitions): poliastro + f64
  boundary scan.
- Validation tolerance: max relative error ≤ 1e-6. Measured result (Dispatch 39): 3.6e-12.
  Source: `src/v2/SLICE_11_FOUNDING.md` AMD-3.

### DLA (Slice 12, not yet in production)

Validate against poliastro-computed DLA for a known mission OR against NASA/JPL Trajectory Browser
for an Apophis/Bennu porkchop before any DEC is locked.

---

## §5. Windows-specific constraints

### tsc spawn

```javascript
const tsc = process.execPath;
const script = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
// spawn: [tsc, script, ...args]
```

Do NOT use bare `'tsc'` — it is not on PATH in Windows build environments.

### Build script

`npm run build` only. Do NOT add `touch docs/.nojekyll` — the `copy-nojekyll` vite plugin handles
this cross-platform. The Unix `touch` command does not exist on Windows.

### ImageMagick

`magick.exe` explicitly. Do NOT use `convert` — Windows ships a `convert.exe` filesystem tool
that is not ImageMagick.

---

## §6. Invariant index

| INV | Source | Rule summary |
|-----|--------|--------------|
| INV-001..013 | `V2_FOUNDING_DOCUMENT.md` | f64 core, f32 GPU, floating-origin, frame conventions, propagation bounds |
| INV-014 | `src/v2/SLICE_9_FOUNDING.md` | Three-gate visualization tier (viz-tier / not-kepler-safe) |
| INV-015 | `src/v2/SLICE_10_FOUNDING.md` | Lambert solver must trace to a peer-reviewed algorithm |
| INV-016 | `src/v2/SLICE_10_FOUNDING.md` | Patched-conic honesty layer: every C3/ΔV carries a fidelity tag |
| INV-016c | `src/v2/SLICE_11_FOUNDING.md` | ΔV stack assumptions must be disclosed (200km LEO, 150m/s stationkeeping, 10% margin) |
| INV-017..020 | `src/v2/SLICE_11_FOUNDING.md` | Porkchop renderer: one component, worker-only compute, bookmarkable URL, no partial renders |
| INV-V1-001 | `src/v2/SLICE_V1_FOUNDING.md` | Visual asset provenance must be confirmed before shipping (CC/public domain) |
