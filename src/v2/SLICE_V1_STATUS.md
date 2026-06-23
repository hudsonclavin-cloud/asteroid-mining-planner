# Slice V1 — Status & Resume Point

**Last updated:** 2026-06-22
**Parked behind:** Slice 11 Phase B (porkchop) — resume Slice V1 once porkchop Phase B is further along.

---

## Where this stands

- Founding doc: [src/v2/SLICE_V1_FOUNDING.md](SLICE_V1_FOUNDING.md)
  - First committed: 4ccad2f
  - Amended (asset acquisition audit, corrected TIFF filenames + ImageMagick commands): 13a3ddc
- **No renderer code has been written yet.** Nothing in `src/v2/render/` belongs to Slice V1.
- Prototype lives at `src/v2/prototypes/renderer-test/` (untracked — local dev only, never commits).

---

## Assets (DEC-V1-1)

| Asset | Filename | Status | Blocker |
|---|---|---|---|
| Earth clouds | `2k_earth_clouds.jpg` | Placed in `textures/` · UNCOMMITTED (ships with Phase C wiring) | — |
| Earth night map | `2k_earth_nightmap.jpg` | Raw TIF in `textures/_staging_v1/earth_lights_4800.tif` | ImageMagick not installed |
| Earth normal map | `2k_earth_normal.jpg` | Raw TIF in `textures/_staging_v1/2k_earth_normal_map.tif` | ImageMagick not installed |
| Earth specular map | `2k_earth_specular.jpg` | Raw TIF in `textures/_staging_v1/2k_earth_specular_map.tif` | ImageMagick not installed |

**Single blocker for all three TIF assets:** `brew install imagemagick`.
Once installed, run the three convert commands from DEC-V1-1 in `SLICE_V1_FOUNDING.md`.

---

## Dispatches drafted — NOT run

Four dispatches were drafted in the 2026-06-22 session. All are held, none executed.

**V1-A — Surface textures + MeshPhongMaterial**
- New file: `src/v2/render/planet-textures.ts`
- Edit: `runtime.ts` (MeshLambertMaterial → makePlanetMaterial, async texture loading)
- Edit: `NOTICE` (Solar System Scope CC BY 4.0 attribution)
- Ready to run.

**V1-B — Lighting tuning**
- Edit: `runtime.ts` only — four value changes: ambient `1.5→0.08`, sun `2.0→4.0`
- Ready to run after V1-A.

**V1-C1 — Fresnel atmosphere shells**
- New file: `src/v2/render/atmosphere.ts`
- Edit: `runtime.ts` (create atmosphere meshes, per-frame position sync)
- **MANDATORY STOP GATE:** reads the actual per-frame update loop in current `runtime.ts` before
  writing any sync code. Do not skip this gate — runtime.ts has changed since the code scan and
  assumed variable names / line numbers may be wrong.

**V1-C2 — Earth hero tier (day/night shader + cloud shell)**
- New file: `src/v2/render/earth-shader.ts`
- New asset: `textures/2k_earth_nightmap.jpg` (from TIF conversion)
- Edit: `runtime.ts` (Earth ShaderMaterial swap, cloud mesh, per-frame sun direction)
- **BLOCKED:** ImageMagick required for night-map TIF conversion.
- **MUST BE REWRITTEN** against what V1-C1's recon STOP gate finds. As drafted it uses variable
  names (`getHeliocentricState`, `renderRoots`) that are unverified against current `runtime.ts`.
  Do not run V1-C2 as-is — rewrite the sun-direction and cloud-sync sections after V1-C1 reports
  the actual per-frame loop structure.

---

## Resume sequence

1. Confirm porkchop (Slice 11 Phase B) is done enough to switch tracks.
2. `brew install imagemagick`
3. Run the three TIF conversion commands from DEC-V1-1 (founding doc §5).
4. Run V1-A → verify in browser → commit.
5. Run V1-B → verify terminator visible → commit.
6. Run V1-C1 → let its recon STOP gate report the actual per-frame loop structure.
7. **Rewrite** V1-C2's sun-direction and cloud-sync sections against what step 6 found, then run it.

---

## Known risks carried forward

- **Per-frame integration (hardest part):** atmosphere shells and cloud mesh must be repositioned
  every frame after the camera-relative / floating-origin transform. The prototype never tested
  this (INV-V1-003). This is where V1-C1 and V1-C2 will be hard.
- **OQ-V1-1 (Saturn ring vs atmosphere renderOrder):** unresolved. V1-C1's dispatch reads ring
  `renderOrder` values and reports — Hudson decides the fix.
- **INV-V1-001:** no fabricated assets. `night-lights-fallback.ts` is the named, deleted,
  prohibited example. Night map must be NASA SVS ID 30003 or Earth degrades gracefully to
  day-texture-only. No synthetic fallback ever.
