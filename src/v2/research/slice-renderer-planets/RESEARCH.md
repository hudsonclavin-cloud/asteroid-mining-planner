# Planet Renderer Research — Atmosphere, Textures, Lighting

**Generated:** 2026-06-20
**Applies to:** Renderer upgrade dispatches T1, T2, T3 (surface textures → lighting → atmosphere)
**Sources:** Two ChatGPT Deep Research PDFs + four Perplexity outputs (see PROVENANCE.md)

---

## Executive summary

For a Three.js r128 app rendering ~20 planets simultaneously at true solar-system scale, the
highest-value changes in order are:

1. **Wire the existing 2K textures** (already in `textures/`). Biggest visual delta per line of code.
2. **Drop ambient light from 1.5 → ~0.08** and raise sun directional to compensate. Terminator line
   appears immediately.
3. **Fresnel shell per atmosphered planet** for the fleet. Cheap, low uniform count, WebGL 1 safe.
4. **Earth as hero planet only**: full day/night blend + smoothed terminator + cloud shell + lightweight
   Rayleigh/Mie. Do not apply this to every planet.

Everything below is the evidence base for those four decisions.

---

## 1. Atmosphere shader approaches compared

Three families exist. They are not interchangeable.

| Approach | GLSL complexity | Uniform count | Perf cost | Visual accuracy | WebGL 1 risk |
|---|---|---|---|---|---|
| **Fresnel glow shell** | Very low | ~2 custom | Low | Silhouette only; no forward scatter, no dusk coloration | Low — no loops, no array indexing |
| **Sean O'Neil (GPU Gems 2 Ch. 16)** | High | ~19 explicit uniforms | 300–3000 computations/vertex | Best physical accuracy; models exponential density falloff + Rayleigh/Mie | High — uses while/do-while and heavy sample loops; fragile in WebGL 1 |
| **Rayleigh/Mie approximation** (Cesium-style) | Medium | ~6 core physical params | Moderate | Best realism/performance trade; Cesium's production model, Bruneton's simplified formulation | Medium — 3D LUTs require WebGL 2; single-shell approximation is WebGL 1 safe |

**Decision for this project:** Fresnel for the fleet, lightweight Rayleigh/Mie approximation for Earth
only. O'Neil is too expensive and too fragile in WebGL 1.

### WebGL 1 constraints that matter in r128

r128 can run on WebGL 1 or WebGL 2. Design the baseline for WebGL 1:

- Max **8 varying vectors**, **128 vertex uniform vectors**, **64 fragment uniform vectors**,
  **8 fragment texture units**
- Shader loops: only Appendix-A structured `for` loops. No `while`, no `do-while`.
- Fragment array indexing: restricted to GLSL ES 1.00 Appendix A forms.
- 3D textures (`texImage3D`) are WebGL 2 only. LUT-based atmospheres that use them are an
  enhancement path, not the baseline.

O'Neil's sample vertex shader alone uses ~16 explicit uniforms before application extras. That is
dangerously close to the WebGL 1 fragment limit and relies on loop forms that break in strict GLSL ES
1.00 environments. Cesium ships a simplified Rayleigh/Mie model precisely because the full GPU Gems
formulation does not scale to a production browser renderer.

### Tier architecture for 20 bodies

```
Airless bodies (Moon, Mercury, Phobos, Deimos, small moons):
  No atmosphere shell.

Thin-atmosphere / stylized (Mars, Uranus, Neptune, gas giants):
  Fresnel glow shell only. ~2 uniforms, 1 extra draw call.

Hero planet (Earth):
  Softened day/night blend + cloud shell + lightweight Rayleigh/Mie
  approximation on the atmosphere shell. Replaces or augments Fresnel.

Cinematic close-up target (future, one body at a time):
  O'Neil-class or precomputed atmosphere, but only for the featured body.
  Not applicable at current project scale.
```

---

## 2. Day/night blending for Earth

The standard approach: compute solar incidence (`dot(normal, sunDir)`), use that as blend weight
between a day albedo texture and a night emissive (city lights) texture.

**The key is the softening curve, not the shader architecture.** A hard threshold at `ndotl == 0.0`
looks synthetic. Use `smoothstep` or a logistic remap.

### Reference fragment shader pattern (browser-safe)

```glsl
vec3 N = normalize(worldNormal);
vec3 L = normalize(sunDir);
float ndotl = dot(N, L);

// Soften the terminator — key to realism
float dayMask   = smoothstep(-0.12, 0.12, ndotl);

// City lights fade out before full daylight
float nightMask = 1.0 - smoothstep(-0.25, 0.05, ndotl);

vec3 dayColor   = texture2D(u_dayMap, uv).rgb;
vec3 nightColor = texture2D(u_nightMap, uv).rgb * nightMask * u_cityGain;

vec3 color = mix(nightColor, dayColor, dayMask);
```

### Why the terminator is hard to get right

Three reasons real Earth's terminator is soft:
1. Atmospheric scattering — dawn/dusk are not binary events
2. Surface relief perturbs the effective normal (normal map helps here)
3. Clouds cast soft structure across the boundary and visually break any clean seam

Adding a normal map and a cloud shell does more for terminator realism than a heavier atmosphere
shader.

### City lights texture notes

- **Source:** NASA SVS ID 30003 ("Earth's City Lights")
- **Files:** `dmsp_4096.tif` (4096×2048 grayscale) + `earth_lights_4800.tif` (4800×2400 colorized)
- **License:** NASA imagery is generally not subject to US copyright. Public-domain-equivalent for
  educational/informational use. Must not imply NASA endorsement.
- **No alpha mask available.** The night texture must be blended in the fragment shader against
  the day map — there is no NASA-published cloud-masked alpha version.
- **Practical note:** Night maps are approximations. The NASA Black Marble product also includes
  lightning, gas flares, fishing fleets, lava, and auroras — not only city lights.

---

## 3. Cloud layer implementation

**Recommended approach:** Separate sphere shell, scaled 1.005–1.01× above the surface sphere.

Three options in order of cost:

| Approach | Cost | Notes |
|---|---|---|
| **Photo cloud map + alpha + UV scroll** | Cheapest | Use `alphaMap` in Three.js. Animate via `Texture.offset`. WebGL 1 safe. Obvious at close range (repetition). |
| **Two-layer scroll (different speeds)** | Low | Second slower layer adds parallax. Same mechanism. |
| **Procedural noise** | High | Better variation, no tiling. Can require `Data3DTexture` (WebGL 2 only). Too expensive for a 20-body scene. |

**Recommendation:** Photo cloud map + alpha + UV scroll. The Sangil Lee Earth shader uses cloud
texture sampling plus cloud shadow projection onto the ground sphere — that combination is worth
more than upgrading to procedural generation.

**Three.js reminder:** Transparent objects render after opaque ones and have sorting requirements.
Cloud shells with `transparent: true` should use conservative depth settings.

### Cloud texture source

Solar System Scope includes `2k_earth_clouds.jpg`. NASA SVS also publishes a 2048×1024 cloud
alpha frame set from "Global cloud cover on a flat map with transparency" — useful if a specific
scientific snapshot is wanted over an artist composite.

---

## 4. PBR material parameters by planet type

Published exact roughness/metalness values for planets are not available in game-art style
documentation. The table below is derived from PBR conventions (Unreal, Blender Principled BSDF)
+ NASA surface descriptions. All planets are **metalness = 0** (dielectrics, not metals).

| Planet class | Metalness | Roughness | Rationale |
|---|---|---|---|
| Moon, Mercury, Mars (regolith worlds) | 0.0 | 0.80–1.00 | Dusty, cratered, visually diffuse. Iron oxides on Mars are not metallic. |
| Earth (land) | 0.0 | 0.75–1.00 | Rock, soil, vegetation, desert — all rough dielectrics. |
| Earth (ocean) | 0.0 | 0.02–0.12 | Water is dielectric (IOR ≈ 1.33). Low roughness for coherent glints without a specular map. |
| Io / volcanic | 0.0 | 0.60–0.90 crust, 0.10–0.30 lava | Sulfur/SO2 frost is dielectric. Hot lava: lower roughness + emissive, not metallic. |
| Icy moons (Europa, Enceladus) | 0.0 | 0.35–0.75 | Clean fresh ice is lower roughness; cracked/dirty terrain higher. |
| Gas giants (Jupiter, Saturn) | 0.0 | 0.90–1.00 | Wrong material model — gas giants have no solid surface. Use fully-rough nonmetal + atmospheric shading. The visible layer is clouds, not a BRDF surface. |
| Ice giants (Uranus, Neptune) | 0.0 | 0.92–1.00 | Same caveat as gas giants. Atmosphere shading dominates. |

**Critical Earth note:** Do not use one flat roughness value. Earth with uniform roughness produces
either dead oceans or plastic continents. The correct approach is a land/ocean split, either via a
roughness map or a specular mask. Solar System Scope provides an Earth specular map
(`2k_earth_specular.tif`) for exactly this.

**Application to current codebase (MeshPhongMaterial):** The PBR roughness values above map
approximately to Phong `shininess` as follows:
- High roughness (0.8–1.0) → `shininess: 3–8`
- Medium roughness (0.35–0.75) → `shininess: 15–40`
- Low roughness (0.02–0.12) → `shininess: 60–120`

---

## 5. Atmosphere limb colors per planet

Derived from true-color spacecraft imagery (Voyager, Cassini, Hubble, ISS airglow observations).
These are **limb glow hex values** for the Fresnel atmosphere shell, not the overall planet disk color.

| Planet | Limb glow hex | Disk color hex | Notes |
|---|---|---|---|
| Earth | `#2E7D32` / `#C2185B` | `#2F6DB3` | Upper atmosphere airglow is multi-color (green, red, purple, yellow layers). Single-hex approximation: `#4488ff`. |
| Venus | `#E0D08A` | `#D8C58A` | Pale yellow cloud tops. Not orange. UV structure visible; visible-color appearance is yellow-white cream. |
| Mars | `#7BA6D8` | `#C65A3A` | Atmosphere glow is cool blue-green (UV nightglow). Surface is rust red. Glow must be faint, not red. |
| Jupiter | `#E0B08A` | `#B8845A` | Warm limb haze, muted — not neon. Tan/orange-brown disk. |
| Saturn | `#E8D7A8` | `#D8C08A` | Pale gold with subtle belts. Limb haze is soft and muted, with some bluer high-altitude scattering. |
| Uranus | `#B8E3E6` | `#A8D8E8` | Pale aqua — recent Voyager rebalancing confirms lighter than older images. |
| Neptune | `#4D7DCC` | `#3F5FB5` | Deeper blue than Uranus; methane absorption dominates. |

**How atmospheric pressure affects color:** Higher pressure → deeper cloud layers visible → warmer
colors (tan/brown/orange). Lower pressure / limb view → high-altitude Rayleigh scattering →
lighter, bluer appearance. This is why Jupiter zones are whiter than belts, and why giant planet
limbs often look lighter than their disk centers.

---

## 6. renderOrder strategy for atmosphere shells in r128

**The problem:** With `transparent: true` and `depthWrite: false`, atmosphere shells enter Three.js's
transparent render pass and are sorted automatically. With ~10 shells in a scene, the sort order can
flip with camera movement, causing one planet's atmosphere to appear in front of another's.

**This is a sorting artifact, not z-fighting.** Z-fighting (depth-buffer precision collision) does not
apply here because `depthWrite: false` prevents the depth buffer competing. The issue is transparent
object ordering.

**Solution: explicit `renderOrder` ladder.**

```typescript
// Opaque planets: renderOrder = 0 (default)
// Atmosphere shells: renderOrder = 1000 + planetIndex

atmosphereMeshes.forEach((mesh, i) => {
  mesh.renderOrder = 1000 + i;
});
```

Higher `renderOrder` draws later and wins additive accumulation. Keep the order consistent with
the intended front-to-back convention. Do not rely on scene-insertion order or automatic depth
sorting alone when the camera can orbit.

**Full atmosphere mesh settings:**
```typescript
{
  transparent: true,
  depthWrite: false,
  depthTest: true,        // keep this — still test against opaque planets
  blending: THREE.AdditiveBlending,
  side: THREE.FrontSide,
  renderOrder: 1000 + planetIndex
}
```

**r128 vs r140+:** The transparent-rendering model is preserved across versions. Explicit
`renderOrder` is the correct fix in both eras.

---

## 7. Texture sources — landscape and recommendations

### Source comparison

| Source | License | Coverage | Map types | Quality | Gotchas |
|---|---|---|---|---|---|
| **Solar System Scope** | CC BY 4.0 | All 8 planets + Moon + Sun + Saturn rings | Albedo, night, clouds, normal, specular (Earth has all five) | 2K and 8K for most bodies | Uranus, Neptune may be 2K only |
| **NASA Blue Marble / BMNG** | Public domain (US gov) | Earth only | Day albedo (2048×1024 or monthly 3600×1800) | Authoritative | Fragmented — no single portal |
| **NASA SVS City Lights** | Public domain | Earth night | Grayscale 4096×2048, colorized 4800×2400 | Good for WebGL | No alpha mask; blend in shader |
| **USGS Astrogeology / Astropedia** | Public domain / "access: none" | Mercury, Venus, Mars, Moon | DEMs, color mosaics, radar mosaics | Scientifically authoritative | Raw data (GeoTIFF/PDS), not CG-ready |
| **Björn Jónsson** | "Publicly available, cite origin" | Jupiter, Saturn, Neptune, Europa — best giant-planet coverage | Albedo (very high res — 20000×10000 Europa) | Excellent | License varies per page/host; not uniformly CC |
| **JHT Planetary Pixel Emporium** | Copyrighted, per-page permission | All planets + some moons | Albedo, bump maps, normal maps | Good | Site is bot-protected; licenses are per-file; some assets CC BY-NC-SA, some paid |

### Practical recommendation

The cleanest legally safe stack:
- **Solar System Scope** (CC BY 4.0) as the primary artist pack for all bodies.
  Provides exactly the filenames already in `textures/` (`2k_earth_daymap.jpg`, etc.)
- **NASA SVS** for Earth city lights (SVS ID 30003) and supplementary Blue Marble products.
- **USGS Astropedia** if normal maps need to be derived from DEMs for rocky bodies
  (Mercury, Mars, Moon — generate from MESSENGER/MOLA data).
- **Björn Jónsson** for highest-quality giant-planet textures if license can be verified per
  specific image page.

### Normal map availability

| Body | Ready-made normal map | Source |
|---|---|---|
| Earth | Yes | Solar System Scope (CC BY 4.0), `2k_earth_normal.jpg` |
| Mars | Some community versions | JHT (check per-page license) |
| Mercury | Derive from DEM | USGS Astropedia MESSENGER DEM, 64px/degree, no access constraints |
| Venus | Derive from DEM | USGS Magellan topo/radar mosaic, public domain |
| Moon | Derive from DEM | NASA/USGS LOLA DEM |
| Jupiter, Saturn, Uranus, Neptune | No meaningful terrain normal | Use subtle procedural bump or mild noise; there is no solid surface to derive from |

**Key finding:** For gas/ice giants, any "normal map" in the wild is a synthetic cloud-relief
enhancement or stylistic shading aid, not terrain data. The correct approach for WebGL is:
color texture alone for honest whole-disk shots, optionally layered with very subtle procedural
noise to avoid flat specular response.

---

## 8. Texture compression and resolution

### Resolution guidance

At true solar-system scale, most planets are strongly minified most of the time. Mipmaps dominate
what is actually visible on screen, not the source resolution.

- 2K (2048×1024): delivers ~650 pixels of unique detail across a planet's diameter at the equator.
  Correct for any planet below ~600–700 screen pixels — which is most planets most of the time.
- 4K (4096×2048): threshold ~1300 pixels. Correct for Earth when it is a hero object filling the
  viewport, or for close-approach inspection modes.
- 8K / 16K: warranted only for tiled terrain LOD or sustained full-screen close-up. Do not use as
  the default for a 20-body solar system scene.

**Memory (uncompressed RGBA8):**
- 2K: ~8 MiB without mipmaps, ~10.7 MiB with full mip chain
- 4K: ~32 MiB without mipmaps, ~42.7 MiB with full mip chain

**Memory (ASTC 4×4, 8 bpp):**
- 2K: ~2.0 / 2.7 MiB (no/full mipmaps)
- 4K: ~8.0 / 10.7 MiB

### Compression recommendation for Three.js r128

| Format | Use for | Notes |
|---|---|---|
| **KTX2 + BasisU (ETC1S)** | Main albedo/diffuse maps | Best combination of network size + GPU residency. Three.js `KTX2Loader` transcodes to platform GPU format. |
| **KTX2 + BasisU (UASTC)** | Normal maps, specular maps | Higher quality; avoids ringing on sharp detail. Encode as linear (not sRGB). |
| **WebP / JPEG** | Fallback / auxiliary textures | Smaller network size; does NOT stay GPU-compressed after upload. Fine for textures that don't need long GPU residency. |
| **PNG** | Source assets only | Do not ship PNG to production WebGL. |

**Note:** KTX2/BasisU requires `KTX2Loader.detectSupport(renderer)` before loading, since the
transcoded GPU format depends on hardware capabilities.

---

## 9. Key decisions for T1–T3 dispatches informed by this research

| Decision | Research basis |
|---|---|
| Use `MeshPhongMaterial` not `MeshStandardMaterial` | Proven in V1; simpler API; Phong `shininess` maps directly to the roughness ranges above |
| Fresnel shell for fleet | Deep Research PDF 1, p. 1: "Fresnel shell for the fleet" is the production recommendation |
| Earth-specific day/night blend (T3b, future) | `smoothstep(-0.12, 0.12, ndotl)` terminator pattern from Sangil Lee shader, confirmed by Deep Research |
| Earth normal map from Solar System Scope | Only cleanly CC-licensed ready-made normal map found; `2k_earth_normal.jpg` exists |
| Earth specular mask | `2k_earth_specular.tif` from Solar System Scope; land vs ocean split is required for realistic Earth |
| Gas giants: no atmosphere normal, use color only | No physically meaningful terrain normal exists for Jupiter/Saturn/Uranus/Neptune |
| Explicit `renderOrder` ladder for atmosphere shells | r128 transparent sorting; `renderOrder = 1000 + planetIndex` pattern |
| 2K textures are correct resolution at solar-system scale | 2K delivers ~650px equatorial detail — honest for true-scale navigation |
| City lights: blend in shader, no alpha mask | NASA SVS ID 30003 provides no cloud-masked alpha; must blend via `smoothstep` terminator factor |

---

## 10. Open questions not resolved by this research

| OQ | Status |
|---|---|
| Exact `renderOrder` values when Saturn rings interact with atmosphere shell | Rings are `THREE.RingGeometry` with `MeshBasicMaterial`; their `renderOrder` relative to the atmosphere shell is untested. May need experiment. |
| Solar System Scope Earth specular map format | Listed as TIFF. Three.js r128 `TextureLoader` does not natively decode TIFF. Needs conversion to JPEG/PNG or KTX2 before use. |
| Lightweight Rayleigh/Mie approximation for Earth (T3b) | Not implemented in T3. This research establishes Cesium's 6-parameter model as the reference. Shader code is not in this document — needs a separate implementation dispatch. |
| Oblate atmosphere shell depth ordering | Jupiter/Saturn atmosphere shells have `scale.y = 0.934 / 0.9021`. Whether this interacts with sorting or depth is untested. |
