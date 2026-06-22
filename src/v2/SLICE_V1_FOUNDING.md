# Slice V1 Founding Document — 3D Solar-System Renderer Upgrade

**Status:** SKELETON — DECs locked from research synthesis; OQs open pending implementation.
**Date opened:** 2026-06-22
**Slice designation:** V1 (first Visualization track slice).
**Sequence note:** The numeric sequence 9 → 10 → 11 → 11.5 → 12 → 20 is the mission-planning /
physics track. Slice 12 is reserved for Δv stack decomposition (confirmed: Slice 10 founding doc
§8 Architectural Notes, Slice 11 founding doc §7 Out of scope). This slice runs on a parallel
visualization track and does not consume a numeric slot. Future renderer work continues as V2, V3, etc.
**Research library:** src/v2/research/slice-renderer-planets/ (RESEARCH.md + PROVENANCE.md, committed 1dddb75)
**Prototype:** src/v2/prototypes/renderer-test/ (untracked, shader-validation only — see §3 INV-V1-003)

---

## §1. Slice intent

The v2 solar-system viewer currently renders all planetary bodies as flat colored spheres using
`MeshLambertMaterial`. The 3D scene is the user-facing surface of the entire project — the thing a
reviewer or user sees first, before they read about the Lambert solver or the porkchop plots. Flat
colored spheres at true solar-system scale undercut the project's credibility in the same way that a
physics paper with placeholder figures would.

Slice V1 delivers three layered upgrades to the 3D renderer:

1. **Surface textures (Phase A):** replace `MeshLambertMaterial` with `MeshPhongMaterial` on all
   bodies, wire the existing 2K Solar System Scope textures (already in `textures/`) as `.map`.
2. **Lighting tuning (Phase B):** fix the ambient/directional balance (ambient 1.5 → 0.08,
   directional 2.0 → 4.0) so that the terminator line becomes visible and night sides are dark.
3. **Atmosphere shaders (Phase C):** add per-body Fresnel glow shells for the seven atmosphered
   planets, and Earth-specific day/night blending with a soft terminator and cloud shell.

Slice V1 does NOT add new mission-planning capability. It does not touch the Lambert solver, the
porkchop renderer, or any physics worker. It is a renderer and asset upgrade only.

---

## §2. Inherited invariants

Slice V1 inherits and does not modify:

- **INV-001 through INV-013** (Slice 8: f64 core, floating-origin rendering, frame conventions)
- **INV-014** (Slice 9: three-gate visualization contract)
- **INV-016** (Slice 10: patched-conic honesty layer — extended by INV-V1-001 below to cover
  3D asset provenance)
- **INV-017 through INV-020** (Slice 11: porkchop renderer architecture)
- **Side-file + atomic-swap** for any long-running tracked-file mutation
- **Verify-before-lock** discipline (measure before threshold-locking)

---

## §3. New invariants

### INV-V1-001 — Data provenance for visual assets

Every visual asset referenced by the 3D renderer (textures, normal maps, cloud maps, ring maps,
night-light maps) must have a confirmed source and license documented before it ships. The
admissible sources are:

- **NASA imagery** — generally not subject to US copyright. Usage per NASA's imagery/media
  guidelines (credit required; no NASA endorsement implied). Authoritative provenance is the
  specific NASA SVS, Earthdata, or USGS Astrogeology page the asset was downloaded from.
- **Solar System Scope textures** — CC BY 4.0. Attribution required. URL:
  https://www.solarsystemscope.com/textures/. Currently the source of all 11 texture files
  already in `textures/` (confirmed by research, filename pattern `2k_[body].jpg` matches
  Solar System Scope's public pack exactly).

Per-asset provenance is tracked in the NOTICE file (repo root) and in the asset inventory table
in §5 DEC-V1-1.

**What is forbidden:** any visual asset whose geographic, compositional, or brightness data is
generated procedurally from guesses or interpolation and rendered as if real — without disclosure.

**Named example:** the `night-lights-fallback.ts` file created in the prototype (Earth city-light
clusters invented from hardcoded lon/lat estimates) was deleted 2026-06-21 before any commit
because it would have rendered fabricated geography as planetary data. This file is the canonical
example of what INV-V1-001 prohibits. The night map must be the real NASA SVS ID 30003 asset
or nothing; there is no fallback that invents data.

This invariant extends INV-016 (patched-conic honesty layer) to the renderer: the deployed app
surfaces physics-model limitations via disclosure banners; the renderer must hold the same bar for
its data inputs.

### INV-V1-002 — WebGL 1 compatibility baseline for all shaders

r128 can run on WebGL 1 or WebGL 2. All custom ShaderMaterial code in Slice V1 must compile and
run on a WebGL 1 baseline:

- Shader loops: only Appendix-A structured `for` forms. No `while`, no `do-while`.
- Maximum uniforms: stay well under 64 fragment uniform vectors (WebGL 1 minimum).
- Maximum varyings: stay under 8 varying vectors.
- No `texImage3D` / `Data3DTexture` (WebGL 2 only). Atmosphere shaders that require 3D LUTs
  are an enhancement path beyond Slice V1, not the baseline.

WebGL 2 features may be used as optional enhancements if guarded by capability detection, but
the baseline scene must render correctly without them.

### INV-V1-003 — Prototype is shader-validation only; it does not validate integration

The prototype at `src/v2/prototypes/renderer-test/` tested Fresnel GLSL, the day/night
terminator shader, and the lighting balance in isolation. It explicitly did NOT test:

- Per-frame atmosphere shell co-positioning with moving oblate planets in a camera-relative /
  floating-origin coordinate system (planets were at fixed positions).
- The renderOrder sorting artifact (planets did not overlap on-screen).

No claim of "it works" for integration should be inferred from the prototype. The prototype
validated shaders; integration is validated by Phase C dispatches in the real runtime.

---

## §4. Open Questions (OQs)

### OQ-V1-1 — Saturn ring vs atmosphere shell renderOrder

**Status: OPEN.**

Saturn has both a procedural ring system (saturn-rings.ts, multiple `THREE.RingGeometry`
meshes with explicit `renderOrder` values) and, after Slice V1, an atmosphere shell. The correct
`renderOrder` relationship between the rings and the atmosphere shell has not been tested.

**Why open:** the rings use `THREE.AdditiveBlending` and have their own `renderOrder` hierarchy
from saturn-rings.ts. Adding an atmosphere shell with `renderOrder = 1000 + index` may conflict
with or overdraw the ring rendering depending on camera angle. The failure mode is ring structure
disappearing under the atmosphere shell at certain viewing angles.

**Resolution criterion:** verified in browser at Phase C, looking at Saturn from multiple camera
angles including ring-plane edge-on. Fix is either: adjust ring `renderOrder` values in
saturn-rings.ts, or give Saturn's atmosphere shell a `renderOrder` below the ring floor.

### OQ-V1-2 — Earth specular map format (TIFF)

**Status: OPEN.**

Solar System Scope's Earth specular map is distributed as a `.tif` file. Three.js r128's
`TextureLoader` routes all loads through `ImageLoader`, which decodes via the browser's native
`Image` element. TIFF is not in the browser-native image format set (PNG, JPEG, WebP, GIF,
AVIF). A TIFF will silently fail or throw at load time.

**Resolution criterion:** before Phase A ships, the specular map must be converted to JPEG or PNG
as a documented acquisition step. A bash one-liner using ImageMagick (`convert
earth_specular.tif earth_specular.jpg`) is sufficient; the output goes in `textures/`.
This is a data-processing step, not a code change.

**Why it matters:** without the specular map, Earth uses flat Phong shininess across the full
sphere, meaning oceans and continents reflect identically. The research explicitly flags that
Earth with one flat roughness value produces "either dead oceans or plastic continents." The
specular mask is the correct fix (see RESEARCH.md §4).

### OQ-V1-3 — Lightweight Rayleigh/Mie Earth atmosphere

**Status: OPEN — deferred to a future sub-dispatch after Phase C.**

The research recommends that Earth as the hero planet eventually gets a lightweight Rayleigh/Mie
atmosphere approximation (Cesium-style: 6 core physical parameters) rather than the Fresnel shell
that all other atmosphered planets receive. This was the "Earth hero tier" in the research.

Phase C as scoped in this founding doc ships only the Fresnel shell for all bodies including
Earth. The Rayleigh/Mie upgrade for Earth specifically is out of scope for Phase C and is
deferred to a Slice V1.1 sub-dispatch once Phase C is verified. It was not prototyped and has no
GLSL implementation yet.

**Resolution criterion:** Slice V1.1 founding note or sub-dispatch, after Phase C is closed.
It is captured here as an OQ so it is not lost.

### OQ-V1-4 — Texture encoding API in r128

**Status: OPEN — STOP gate in Phase A dispatch.**

Three.js r128 uses `.encoding = THREE.sRGBEncoding` (value 3001) to declare that a texture
contains sRGB data. The `.colorSpace` property and `THREE.SRGBColorSpace` constant used in
r140+ do not exist in r128. The prototype confirmed this difference.

**Resolution criterion:** Phase A dispatch must explicitly use `.encoding = THREE.sRGBEncoding`
for all loaded textures, verified by a STOP gate that confirms no tsc errors or runtime
"Invalid encoding" warnings appear in the browser console on texture load.

---

## §5. Locked DECs

### DEC-V1-1 — Data provenance and asset inventory

**Decision:** every visual asset shipped in the 3D renderer is listed in the table below with
source URL, license, current status, and any required processing step. No asset ships without a
row here. The NOTICE file is updated in the Phase A commit to add Solar System Scope attribution.

#### Asset inventory

| Asset | Filename | Source | License | Status | Processing required |
|---|---|---|---|---|---|
| Sun | `2k_sun.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Mercury | `2k_mercury.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Venus surface | `2k_venus_surface.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Earth day | `2k_earth_daymap.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Moon | `2k_moon.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Mars | `2k_mars.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Jupiter | `2k_jupiter.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Saturn | `2k_saturn.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Saturn rings | `2k_saturn_ring_alpha.png` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Uranus | `2k_uranus.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Neptune | `2k_neptune.jpg` | Solar System Scope | CC BY 4.0 | ✓ In repo | None |
| Earth night (city lights) | `2k_earth_nightmap.jpg` | NASA SVS ID 30003 | Public domain (US Gov) | **✗ Missing — Phase C prerequisite** | Download `earth_lights_4800.tif` from https://svs.gsfc.nasa.gov/30003/ · Resize to 4096×2048 JPEG · Rename to `2k_earth_nightmap.jpg` · Place in `textures/` |
| Earth clouds | `2k_earth_clouds.jpg` | Solar System Scope | CC BY 4.0 | **✗ Missing — Phase C prerequisite** | Download from https://www.solarsystemscope.com/textures/ · 2K version |
| Earth normal map | `2k_earth_normal.jpg` | Solar System Scope | CC BY 4.0 | **✗ Missing — future (OQ-V1-2 context)** | Download from Solar System Scope · Native JPEG (not the TIFF specular) |
| Earth specular map | `2k_earth_specular.jpg` | Solar System Scope | CC BY 4.0 | **✗ Missing — OQ-V1-2 blocks** | Download `2k_earth_specular.tif` · Convert: `convert 2k_earth_specular.tif 2k_earth_specular.jpg` (ImageMagick) · Place in `textures/` |

**The fabricated fallback is prohibited by INV-V1-001.** The night map column shows no
processing path that generates data — only a download path for the real NASA asset. If the night
map is not present, the day/night Earth shader does not activate; Earth displays day texture only
with lighting-only terminator. That degraded state is honest. Fabricated geography is not.

**NOTICE file update:** Phase A commit adds Solar System Scope to the NOTICE file, crediting
https://www.solarsystemscope.com/textures/ under CC BY 4.0.

### DEC-V1-2 — Per-body rendering tier architecture

**Decision:** each body receives exactly one of four tiers, locked below. This is not a
configurability question — the tier for each body is a decision, not a parameter.

#### Tier definitions

**Tier 0 — Opaque Phong, texture only (no atmosphere shell)**
Used for: airless bodies where an atmosphere shell would be physically wrong.
Bodies: Sun (MeshBasicMaterial, emissive), Moon, Mercury, Phobos, Deimos, Io, Europa, Ganymede,
Callisto, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus.
Rationale: adding a Fresnel glow to the Moon or Mercury is inaccurate. Europa and Enceladus have
very thin tenuous atmospheres that are not visible from orbit. These bodies look better with zero
glow than with a fake limb haze.

**Tier 1 — Phong + texture + Fresnel atmosphere shell**
Used for: bodies with a real, observable atmosphere that shows as a limb glow in spacecraft
imagery.
Bodies: Venus, Mars, Jupiter, Saturn, Uranus, Neptune.
Fresnel power and color per body are locked in the prototype's `atmosphere.ts` and derived from
spacecraft imagery (see RESEARCH.md §6). They are production constants, not tunable parameters.

**Tier 2 — Earth hero tier**
Used for: Earth only.
Adds to Tier 1: day/night ShaderMaterial with `smoothstep(-0.12, 0.12, ndotl)` soft terminator,
city-lights blend (requires real NASA SVS night map per DEC-V1-1), rotating cloud shell (requires
Solar System Scope cloud map per DEC-V1-1), Fresnel atmosphere shell.
Rayleigh/Mie Earth atmosphere: **out of scope for Slice V1** (OQ-V1-3). Deferred to Slice V1.1.

**Tier 3 — future (not in Slice V1)**
Reserved for a potential hero close-up path (O'Neil or precomputed Bruneton atmosphere,
one body at a time). Not implemented, not prototyped, not dispatched.

#### Oblate Y-scales (locked from mission constants)
These match the values in `BODY_CONSTANTS` / the oblate mesh factory files:
- Jupiter: `scale.y = 0.934`
- Saturn: `scale.y = 0.9021`
- Mars: `scale.y = 0.9939`

The atmosphere shell for each oblate body inherits this Y-scale explicitly (it is a sibling
mesh, not a child — see DEC-V1-4). Any future change to these values in `BODY_CONSTANTS`
requires a corresponding update here.

### DEC-V1-3 — Surface material: MeshPhongMaterial

**Decision:** upgrade from `MeshLambertMaterial` to `MeshPhongMaterial` on all non-Sun bodies.
Do not use `MeshStandardMaterial`.

**Rationale:**
- `MeshPhongMaterial` is the material used in the V1 codebase for textured planets. It is
  proven in this repo with this Three.js version.
- `shininess` and `specular` map directly and intuitively to the PBR roughness ranges in the
  research (high roughness → low shininess; low roughness → high shininess). This is calibrated
  per body in the dispatch.
- `MeshStandardMaterial` (PBR: roughness/metalness) would require per-planet roughness
  calibration with no validated reference values. The research confirmed that "published film and
  game breakdowns rarely disclose exact roughness/metalness values for planets." The research
  provides ranges, not point values. Phong `shininess` is easier to tune visually against
  spacecraft imagery.

**PBR upgrade path:** `MeshStandardMaterial` is the appropriate long-term upgrade if a future
slice adds roughness maps, normal maps, and per-pixel ocean specular to Earth. It is explicitly
deferred, not rejected. When that work arrives, it replaces this DEC with a new version.

**Sun exception:** the Sun uses `MeshBasicMaterial` (unlit, self-emissive). It is not
illuminated by the directional light — it is the source. This is unchanged from the current
implementation.

### DEC-V1-4 — Integration contract: atmosphere shells and per-frame sync

**This DEC locks two things the prototype explicitly did not test.** Both are where T3
(Phase C) will be hard. Each has a STOP gate in its dispatch.

#### DEC-V1-4a — Atmosphere shells are scene-level siblings, not planet children

Atmosphere shells must be added to the scene at the same level as planet meshes (`scene.add`),
NOT as children of the planet mesh (`planetMesh.add`). This is because oblate planets apply a
non-uniform Y-scale (`mesh.scale.set(1, 0.9021, 1)` for Saturn). If the atmosphere shell were
a child, it would inherit that scale twice — once from the parent's transform and once from its
own geometry — producing an incorrectly-scaled shell.

**Consequence:** atmosphere shells do not move with their planet automatically. They must be
repositioned every frame.

#### DEC-V1-4b — Per-frame repositioning order dependency

The v2 renderer uses a camera-relative (floating-origin) coordinate system. Planet positions
are recomputed each frame from JPL Horizons ephemeris data, then expressed relative to the
current camera anchor before being applied to mesh positions.

**The insertion point for atmosphere repositioning MUST be determined by reading the current
per-frame loop in runtime.ts at Phase C dispatch time.** Do not assume the sequence or line
numbers below are accurate — they are a hypothesis from a 2026-06-20 code scan, and runtime.ts
has changed since (porkchop worker instantiation, Slice 11 work). The porkchop track failed
twice from scanned runtime.ts assumptions that didn't match current code. This DEC applies that
lesson preemptively.

**Hypothesis (from 2026-06-20 scan, near line 1140 — verify before use):**
```
1. Compute planet world positions from ephemeris
2. Apply camera-relative offset (subtract camera anchor)
3. Set planetMesh.position = camera-relative result
4. Set sunLight.position = camera-relative sun position
```

**If the scanned sequence is confirmed at Phase C dispatch time**, atmosphere shells belong
after step 3 — after the camera-relative transform has been applied to the planet mesh:
```
3b. (NEW) Set atmosphereMesh.position = planetMesh.position
```
**Not before step 3.** Copying a raw world-space position before the camera-relative offset is
applied will place the shell at the wrong location.

**If the actual loop structure differs** (e.g., planet positions are set via a parent
Object3D, a group, or a different update order), STOP and surface the actual pattern before
writing any atmosphere sync code. The principle is fixed — atmosphere position must be copied
from the planet mesh after whatever transform brings the planet to its final scene position — but
the mechanism must be read from current code, not assumed from the scan.

**STOP gate for Phase C dispatch:**
1. Read the current per-frame loop in runtime.ts in full before writing any atmosphere sync.
2. Report the actual code location and sequence in the dispatch report.
3. After implementation, verify in the browser that each atmosphere shell moves in exact sync
   with its planet as simulation time scrubs and as the camera orbits.
4. No atmosphere shell drifts from its planet. If any drift is observed, STOP — it means the
   sync is happening at the wrong point in the frame loop.

#### DEC-V1-4c — renderOrder ladder

All opaque planet meshes: `renderOrder = 0` (Three.js default).
All atmosphere shells: `renderOrder = 1000 + planetIndex`, where `planetIndex` is a stable
integer (0 = Earth, 1 = Venus, 2 = Mars, 3 = Jupiter, 4 = Saturn, 5 = Uranus, 6 = Neptune).

**Why this is necessary:** with `transparent: true` and `depthWrite: false`, Three.js routes
atmosphere shells through its transparent render pass and sorts them by depth-center. When the
camera orbits the real (moving, clustered) solar system, shell depth-center ties can flip on
every frame, causing one planet's atmosphere to suddenly render in front of another's. Explicit
`renderOrder` bypasses automatic sort-order and makes draw sequence deterministic.

**What the prototype verified and did not verify:**
- Verified: the GLSL is correct; the per-body color, intensity, and power values produce the
  intended limb glow in isolation.
- NOT verified: the sorting-artifact case. In the prototype, planets were fixed and
  well-separated and their atmosphere shells never overlapped on screen. The prototype cannot
  reproduce the failure mode the renderOrder ladder exists to fix.
- This DEC is therefore validated by the research (Perplexity r128 ShaderMaterial output,
  confirmed in RESEARCH.md §6), not by the prototype.

**STOP gate for Phase C dispatch:** after atmosphere shells are live in the real runtime,
orbit the camera to a position where two or more planets are visually close (e.g., inner solar
system view where Earth, Venus, and Mars cluster near inferior conjunction). Verify no
atmosphere shell pops or flickers as the camera moves. Report before committing.

---

## §6. Phase breakdown

**Phase A — Surface textures (~2 dispatches)**
- New file: `src/v2/render/planet-textures.ts`
  - `makePlanetMaterial(bodyId, vizColor)` → `MeshPhongMaterial`
  - `loadAndApplyTexture(material, bodyId, loader)` → async texture load + `.map` application
  - Per-body `shininess` / `specular` table from RESEARCH.md §4
- Edit: `src/v2/app/solar-system/runtime.ts` — replace all `MeshLambertMaterial` with calls to
  `makePlanetMaterial()`, wire `TextureLoader` for all 11 in-repo textures
- Edit: `NOTICE` — add Solar System Scope attribution (CC BY 4.0)
- Encoding: use `tex.encoding = THREE.sRGBEncoding` (r128 API, not `tex.colorSpace`)
- STOP gate: confirm texture requests succeed (200 OK) in DevTools Network tab for all 10 bodies
- Commit: `feat(renderer): wire 2K planet textures, MeshLambertMaterial → MeshPhongMaterial`

**Phase B — Lighting tuning (~1 dispatch)**
- Edit: `src/v2/app/solar-system/runtime.ts` — four value changes only:
  - `AmbientLight` intensity: `1.5` → `0.08`
  - `AmbientLight` color: `0x404060` → `0x060810`
  - `DirectionalLight` intensity: `2.0` → `4.0`
  - `DirectionalLight` color: `0xffffff` → `0xfffde8`
- STOP gate: confirm terminator visible on Earth and Moon; confirm night side is dark but not
  pure black; confirm halo system (halos.ts) still renders correctly for distant bodies
- Commit: `feat(renderer): realistic ambient/directional balance for planet terminator`

**Phase C — Atmosphere shaders (~3–4 dispatches)**

*Phase C prerequisite:* download and place `2k_earth_nightmap.jpg` and `2k_earth_clouds.jpg`
per DEC-V1-1. Confirm both present before Phase C dispatch is written. If not present, Phase C
ships Fresnel shells only (Tier 1 bodies) and defers Earth hero tier to Phase C.2 once assets
arrive.

*Phase C.1 — Fresnel atmosphere shell (all Tier 1 bodies):*
- New file: `src/v2/render/atmosphere.ts` — `createAtmosphereMesh(planetMesh, params,
  renderOrderIndex)`, per-body constants, GLSL from prototype
- Edit: `src/v2/app/solar-system/runtime.ts` — create atmosphere meshes after planet meshes;
  add to per-frame position update loop (DEC-V1-4b STOP gate here)
- STOP gate A: per-frame sync (DEC-V1-4b). Report code location.
- STOP gate B: renderOrder verification at clustered camera angle (DEC-V1-4c)
- STOP gate C: Saturn rings vs atmosphere shell interaction (OQ-V1-1). If conflict found,
  resolve before committing.
- Commit: `feat(renderer): Fresnel atmosphere shells for Venus, Mars, Jupiter, Saturn, Uranus, Neptune`

*Phase C.2 — Earth hero tier:*
- New file: `src/v2/render/earth-shader.ts` — day/night ShaderMaterial, `buildEarthMaterial()`,
  `updateSunDir()`
- Edit: `src/v2/app/solar-system/runtime.ts` — Earth uses ShaderMaterial instead of Phong;
  cloud shell added at 1.005× radius; per-frame sun direction update
- Prerequisite: `2k_earth_nightmap.jpg` and `2k_earth_clouds.jpg` must be present (DEC-V1-1)
- STOP gate: night/day boundary is soft (smoothstep visible, no hard line at ndotl=0); city
  lights visible on night side; clouds rotate independently of surface
- Commit: `feat(renderer): Earth hero tier — day/night shader + cloud shell`

**Phase D — Verification (~1–2 dispatches)**
- tsc --noEmit clean
- All atmosphere shells verified in browser across multiple views
- Earth terminator verified: soft transition, city lights on night side, cloud separation
- Saturn ring/atmosphere interaction verified (OQ-V1-1 closed or updated)
- Halo system unchanged
- Asteroid field rendering unchanged
- Porkchop route unaffected

**Phase E — Deploy**
- `npm run build` passes
- Docs committed and pushed
- Live site updated

---

## §7. Out of scope for Slice V1

These are explicitly deferred and must not appear in V1 dispatches:

- **Rayleigh/Mie Earth atmosphere** (OQ-V1-3): deferred to Slice V1.1
- **Normal maps** for any body: no validated acquisition path; rocky-body DEMs require
  processing steps not in scope. Deferred.
- **Earth specular map** (OQ-V1-2): blocked on TIFF-to-JPEG conversion. Deferred to Phase D
  or Slice V1.1 depending on when the conversion is done.
- **PBR upgrade to MeshStandardMaterial** (DEC-V1-3): deferred explicitly
- **O'Neil / precomputed atmosphere for any body** (Tier 3): deferred
- **Moons of Jupiter and Saturn getting textures**: Io, Europa, Ganymede, Callisto, Titan etc.
  have no textures in repo and no acquisition path documented. Deferred.
- **Touches to mission-planning code**: no changes to Lambert solver, porkchop renderer,
  screening cache, or physics worker in any V1 dispatch
- **Slice V1 has no vite.config.ts changes**: the prototype's `v2/renderer-test/` entry is NOT
  added to rollupOptions — it exists for local dev only and is deleted after Phase D closes

---

## §8. Engineering record

**2026-06-20:** Research committed at 1dddb75. Two Deep Research PDFs (atmosphere techniques,
texture sources) + four Perplexity outputs synthesized into RESEARCH.md. Key decisions from
research: Fresnel for the fleet, Earth as hero, 2K correct at solar-system scale, MeshPhongMaterial
over MeshStandardMaterial, all textures NASA or CC BY 4.0 only.

**2026-06-20/21:** Prototype built in src/v2/prototypes/renderer-test/ (untracked). Validated:
Fresnel GLSL, day/night smoothstep terminator, MeshPhongMaterial shininess values, lighting
balance, renderOrder strategy, Saturn ring geometry. Did not validate: per-frame atmosphere
sync in floating-origin system, renderOrder sorting artifact under real camera movement.

**2026-06-21:** Procedural night-lights fallback (`night-lights-fallback.ts`) deleted before any
commit. It invented city-light geography from hardcoded lon/lat estimates and rendered it as
Earth data. INV-V1-001 codifies why this was wrong and names this file as the canonical example
of what is prohibited. The correct night map is NASA SVS ID 30003; the correct state when it
is absent is day-texture-only Earth, not fabricated data.

**2026-06-22:** This founding document written and locked. T1–T3 informal dispatches (drafted
during prototype session) are superseded by the Phase A–C structure above. They are inputs to
this document, not the dispatches themselves. Dispatches are written against this founding doc,
with DEC-V1-4 STOP gates baked in.
