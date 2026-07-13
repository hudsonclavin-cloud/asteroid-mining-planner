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

### DLA frame convention (DEC-12-2, LOCKED — measured; do NOT reintroduce the rotation)

DLA components are already ICRF/equatorial (OQ-12-1 measured: Earth velocity Z-component from
the porkchop worker's own fixture reaches 11.715 km/s, impossible in an ecliptic frame);
DLA = asin(vZ/|v|) directly, NO rotation. See `src/v2/SLICE_12_FOUNDING.md` OQ-12-1 / DEC-12-2
and the doc comment in `src/v2/core/lambert/dla.ts`. The pre-lock research summary's
ecliptic→equatorial obliquity rotation was REJECTED by that measurement — applying it would
introduce up to ~23.4° of silent error.

### Frame-by-measurement (INV-021, `src/v2/SLICE_12_FOUNDING.md` §3)

**INV-021 (frame-by-measurement):** Any quantity derived from the *components* (not magnitude) of a Lambert output vector must have its reference frame established by numerical measurement at the consuming boundary before first use — never inferred from a label or doc comment. Rationale: magnitudes are frame-invariant, so all prior validation (OQ-3, machine-precision C3 agreement) says nothing about component frames; and the 2026-07-01 halo bug demonstrated that frame-labeling errors survive multiple recons while producing plausible-looking output.

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

### Launch-feasibility disclosure (INV-016d, `src/v2/SLICE_12_FOUNDING.md` §3)

**INV-016d (honesty extension):** Any launch-feasibility display must disclose, in a discoverable surface, (i) the launch site assumed and its parameters, (ii) the band model used to classify feasibility, and (iii) that dogleg/plane-change costs are advisory and NOT included in the displayed ΔV stack. Same disclosure pattern as INV-016c.

**AMENDED (Slice 13, DEC-13-3 — clause (iii) superseded; clauses (i)–(ii) unchanged):** dogleg cost is now a labeled line in the mission cost card, priced per the two-regime screening model — GREEN: none; AMBER: zero added ΔV with an explicit disclosure that plane-matching is launch-geometry class (~1 m/s-per-degree, JPL DESCANSO evidence), below screening error bars; RED: a "not feasible at screening fidelity" verdict panel, never a fabricated number. The INV-016e disclosure surface states the regime applied to each cell. The vehicle-agnostic ΔV stack panel remains unpriced physics; the two shipped advisory strings were updated in the same commit as this amendment (`src/v2/app/porkchop/main.ts` INV-016d disclosure text, `src/v2/porkchop/porkchop-view.ts` RED advisory). See `src/v2/SLICE_13_FOUNDING.md` §2 / DEC-13-3.

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
`node_modules/.bin/tsc` shims return `status:null` under `spawnSync` on Windows — never spawn the shim; always use `process.execPath` + `node_modules/typescript/bin/tsc`.

### Build script

`npm run build` only. Do NOT add `touch docs/.nojekyll` — the `copy-nojekyll` vite plugin handles
this cross-platform. The Unix `touch` command does not exist on Windows.

### ImageMagick

`magick.exe` explicitly. Do NOT use `convert` — Windows ships a `convert.exe` filesystem tool
that is not ImageMagick.

### Evidence artifact tracking (INV-034)

Any file referenced by a founding document, INVARIANTS.md, or a test as
committed evidence MUST be git-tracked. Evidence directories under an ignored
glob require an explicit `!` exception at commit time. Verification:
`git check-ignore -v <path>` returns nothing for every claimed-committed
artifact. Born from the Slice 9 A.3 cutover sample -- described as "the
committed 162-body set" (`SLICE_9_FOUNDING.md:202`, `:350-353`), silently
excluded by `.gitignore:17`, never committed, unrecoverable.

---

## §6. Invariant index

| INV | Source | Rule summary |
|-----|--------|--------------|
| INV-001..013 | `V2_FOUNDING_DOCUMENT.md` | f64 core, f32 GPU, floating-origin, frame conventions, propagation bounds |
| INV-014 | `src/v2/SLICE_9_FOUNDING.md` | Three-gate visualization tier (viz-tier / not-kepler-safe) |
| INV-015 | `src/v2/SLICE_10_FOUNDING.md` | Lambert solver must trace to a peer-reviewed algorithm |
| INV-016 | `src/v2/SLICE_10_FOUNDING.md` | Patched-conic honesty layer: every C3/ΔV carries a fidelity tag |
| INV-016c | `src/v2/SLICE_11_FOUNDING.md` | ΔV stack assumptions must be disclosed (200km LEO, 150m/s stationkeeping, 10% margin) |
| INV-016d | `src/v2/SLICE_12_FOUNDING.md` (amended `SLICE_13_FOUNDING.md`) | Launch-feasibility displays must disclose the assumed site + parameters, the band model, and — originally — that dogleg costs are advisory / not in the ΔV stack. **AMENDED Slice 13 (DEC-13-3):** dogleg is now priced in the mission cost card per the two-regime model (GREEN none / AMBER zero-with-disclosure / RED verdict); see body §3. |
| INV-016e | `src/v2/SLICE_13_FOUNDING.md` | Cost-card honesty: the mission cost card discloses (i) vehicle curve source + as-of date, (ii) interpolation method, (iii) screening Isp + mission mode, (iv) margin policy, (v) the dogleg cost regime applied to the cell — same disclosure pattern as INV-016c/d |
| INV-017..020 | `src/v2/SLICE_11_FOUNDING.md` | Porkchop renderer: one component, worker-only compute, bookmarkable URL, no partial renders |
| INV-021 | `src/v2/SLICE_12_FOUNDING.md` | Component-derived quantities (e.g. DLA): reference frame established by numerical measurement at the consuming boundary, never inferred from a label |
| INV-022 | `src/v2/SLICE_13_FOUNDING.md` | Sourced vehicle data: every launch-vehicle anchor carries provenance (source, as-of date, official-published vs estimated) adjacent to the number; no anchor enters the data module without a source |
| INV-023 | `src/v2/SLICE_13_FOUNDING.md` | No extrapolation: payload computed only by interpolation between published anchors; past a vehicle's last anchor an explicit "beyond published curve" state, never an extrapolated number |
| INV-024 | `src/v2/SLICE_14_FOUNDING.md` | Anti-porting: the physics / orbital-mechanics layer is re-derived in-repo; external astrodynamics libraries (poliastro, adam_core, or successors) serve as validation oracles only — never imported, ported, or transcribed |
| INV-025 | `src/v2/SLICE_14_FOUNDING.md` | Public-copy taxonomy rule: user-facing copy never exposes internal taxonomy identifiers (slice/DEC/INV numbers, dispatch names) without plain-English framing; artifacts introduced by what they demonstrate, never by bare internal ID |
| INV-026 | `src/v2/SLICE_14_FOUNDING.md` | Trust-surface provenance: every numeric claim on a public validation/trust surface renders from a single committed provenance artifact (JSON), never from literals in component code |
| INV-027 | `src/v2/SLICE_15_FOUNDING.md` | No math in the `mcp/` layer: adapters only; math belongs in `src/v2/core/` and receives math-layer treatment |
| INV-028 | `src/v2/SLICE_15_FOUNDING.md` | Evidence envelope on every tool result; refusal is a result. No bare numbers, thrown exceptions for domain limits, or silent interpolation |
| INV-029 | `src/v2/SLICE_15_FOUNDING.md` | Tool budget hard cap 8; a ninth tool is a founding-doc amendment, never a dispatch |
| INV-030 | `src/v2/SLICE_15_FOUNDING.md` | Browser app builds green after every extraction commit; site and server share the core, so drift is the failure mode |
| INV-031 | `src/v2/SLICE_15_FOUNDING.md` | Eval gate before publish: the 10-pair eval must pass with answers verified against the repo, never model memory |
| INV-032 | `src/v2/SLICE_15_FOUNDING.md` | No non-finite numbers cross the wire; NaN/Infinity reaching an envelope value path is a bug-class refusal or error, never serialized |
| INV-033 | `src/v2/SLICE_15_FOUNDING.md` | Anti-fabrication: no SourceRef path, commit, count, or URL enters any envelope, fixture, or provenance artifact unless confirmed to exist and match |
| INV-034 | `src/v2/SLICE_9_FOUNDING.md` amendment 2026-07-12 | Evidence-artifact tracking: any file claimed as committed evidence by a founding doc, INVARIANTS.md, or a test must be git-tracked; ignored evidence directories require explicit `!` exceptions and `git check-ignore -v <path>` must return nothing |
| INV-V1-001 | `src/v2/SLICE_V1_FOUNDING.md` | Visual asset provenance must be confirmed before shipping (CC/public domain) |
