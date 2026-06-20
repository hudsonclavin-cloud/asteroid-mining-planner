# Planet Renderer Research — Provenance

## Primary artifacts

### Deep Research PDFs (ChatGPT Deep Research, 2026-06-20)

**Real-Time Planet Atmosphere and Lighting Rendering for Three.js r128.pdf**
- Generated via ChatGPT Deep Research
- Topics: atmosphere approach comparison (Fresnel vs Rayleigh/Mie vs O'Neil), day/night blending,
  cloud layer implementation, PBR material parameters by planet type, recommended architecture
  for a 20-body browser scene
- 11 pages, 42 citations
- Covers Dispatches T2 (lighting) and T3 (atmosphere)

**Free and Open Planet Texture Resources for Solar System Visualization.pdf**
- Generated via ChatGPT Deep Research
- Topics: texture source landscape (Solar System Scope, NASA Blue Marble, USGS Astrogeology,
  Björn Jónsson, JHT Planetary Pixel Emporium), normal/bump map availability by planet,
  NASA Blue Marble Earth textures in detail, KTX2/BasisU compression for Three.js r128,
  2K vs 4K resolution guidance at solar-system scale
- 6 pages, 26 citations
- Covers Dispatch T1 (surface textures)

### Perplexity outputs (2026-06-20)

**Atmosphere colors per planet**
- Query: correct atmospheric glow RGB hex values per planet as seen from space
- Output: per-planet limb glow and disk color hexes with spacecraft imagery citations
- Used in: T3 dispatch, `AtmosphereParams` color values

**Three.js r128 ShaderMaterial transparent/renderOrder behavior**
- Query: known issues with ShaderMaterial + transparent + depthWrite: false + AdditiveBlending
  + multiple overlapping atmosphere meshes in r128
- Output: sorting artifact explanation, explicit `renderOrder` ladder pattern, r128 vs r140+ delta
- Used in: T3 dispatch, `createAtmosphereMesh` renderOrder assignment

**NASA city lights texture**
- Query: NASA Earth at night texture source, download URL, license, alpha mask availability
- Output: SVS ID 30003 confirmed, no alpha mask, public-domain license, fragment shader blend required
- Used in: T1 follow-up dispatch (Earth night side), day/night blend shader pattern

**Solar System Scope texture pack**
- Query: Solar System Scope URL, included maps, license, resolution tiers
- Output: URL confirmed, CC BY 4.0, 2K and 8K tiers, full map type list including Earth specular TIFF
- Used in: T1 dispatch (texture sources), normal map planning

## Known gaps in this research

1. **Exact roughness/metalness studio values** are not published in the way film/game art
   breakdowns are. The PBR table in RESEARCH.md is derived from conventions + NASA surface
   descriptions, not disclosed shader sheets.

2. **"Rayleigh/Mie approximation"** covers a wide range — from Cesium's lightweight 6-parameter
   model to Bruneton/Hillaire's precomputed-LUT systems. RESEARCH.md uses "lightweight
   production variant" as the meaning, not the full spectrum.

3. **Normal map license clarity for Björn Jónsson and JHT** — both excellent sources, neither has
   uniformly machine-readable CC licensing across the full catalog. License must be verified
   per specific image page before redistribution.

4. **Solar System Scope Earth specular map** is listed as TIFF format. Conversion needed before
   use in Three.js r128 — not yet resolved.
