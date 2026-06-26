/**
 * PROTOTYPE — materials.ts
 *
 * MeshPhongMaterial factory for all non-Earth planets.
 * Research basis: Deep Research PDF 1 (PBR table), codebase scan (V1 used MeshPhongMaterial).
 *
 * Decision: MeshPhongMaterial, NOT MeshStandardMaterial.
 * Reason: proven in V1, simpler API, direct shininess control that maps cleanly
 * to the roughness ranges from the research. MeshStandardMaterial upgrade is a
 * future dispatch if PBR accuracy becomes a priority.
 *
 * Research PBR → Phong shininess mapping:
 *   roughness 0.80–1.00 → shininess  3–8    (rocky/regolith)
 *   roughness 0.35–0.75 → shininess 15–40   (icy moons)
 *   roughness 0.02–0.12 → shininess 60–120  (ocean/ice glint)
 *   gas giants: roughness 0.90–1.00 BUT should be treated as atmospheric
 *   shading problem, not a hard surface — use shininess ~25-35 so
 *   the directional light produces gentle limb highlight without plastic look.
 *
 * Specular color encodes surface type:
 *   Rock/dust: 0x111111 (barely visible specular)
 *   Ocean:     0x2244aa (blue tint, physically correct — water is dielectric)
 *   Ice:       0x88bbcc (icy sheen)
 *   Gas giant: 0x222222 (muted, let atmosphere shell handle visual interest)
 */

import * as THREE from 'three';

interface PhongSpec {
  shininess: number;
  specular:  number;
}

// All metalness = 0 (all planets are dielectrics, not metals).
// Specular colors derived from PBR material types.
const PHONG_TABLE: Record<string, PhongSpec> = {
  sun:       { shininess:   0, specular: 0x000000 }, // MeshBasicMaterial, no lighting
  mercury:   { shininess:   5, specular: 0x111111 }, // dry regolith
  venus:     { shininess:   5, specular: 0x111111 }, // thick cloud deck, matte
  earth:     { shininess:  15, specular: 0x2244aa }, // ocean glint (blue, dielectric water)
  moon:      { shininess:   3, specular: 0x111111 }, // lunar regolith
  mars:      { shininess:   5, specular: 0x111111 }, // iron oxide dust
  phobos:    { shininess:   3, specular: 0x111111 },
  deimos:    { shininess:   3, specular: 0x111111 },
  jupiter:   { shininess:  30, specular: 0x222222 }, // cloud bands — no hard surface
  io:        { shininess:   8, specular: 0x111111 }, // sulfur frost
  europa:    { shininess:  60, specular: 0x88bbcc }, // clean water ice
  ganymede:  { shininess:  10, specular: 0x111111 }, // dirty ice/rock
  callisto:  { shininess:   5, specular: 0x111111 }, // ancient dark ice
  saturn:    { shininess:  30, specular: 0x222222 }, // cloud bands
  titan:     { shininess:   8, specular: 0x111111 }, // thick haze
  rhea:      { shininess:  20, specular: 0x88bbcc }, // icy moon
  iapetus:   { shininess:   8, specular: 0x111111 }, // dark/bright two-tone
  tethys:    { shininess:  25, specular: 0x88bbcc }, // clean ice
  dione:     { shininess:  20, specular: 0x88bbcc }, // ice
  mimas:     { shininess:  20, specular: 0x88bbcc }, // Death Star moon, icy
  enceladus: { shininess:  60, specular: 0x88bbcc }, // freshest ice in solar system
  uranus:    { shininess:  35, specular: 0x334455 }, // pale aqua ice giant
  neptune:   { shininess:  35, specular: 0x334455 }, // deep blue ice giant
};

/**
 * Returns a MeshPhongMaterial configured for the given body.
 * vizColor: from BODY_CONSTANTS (used as the initial color until texture loads).
 * Once texture is applied, call whiten(material) to set color to 0xffffff
 * so the texture shows true color rather than being tinted.
 */
export function makePlanetMaterial(bodyId: string, vizColor: number): THREE.MeshPhongMaterial {
  if (bodyId === 'sun') {
    // Sun is self-illuminated — MeshBasicMaterial, ignore lighting.
    // Cast is intentional: caller can check instanceof if needed.
    return new THREE.MeshPhongMaterial({ color: vizColor, emissive: vizColor, shininess: 0 });
  }

  const spec = PHONG_TABLE[bodyId] ?? { shininess: 5, specular: 0x111111 };
  return new THREE.MeshPhongMaterial({
    color:     vizColor,
    shininess: spec.shininess,
    specular:  new THREE.Color(spec.specular),
  });
}

/**
 * Applies a loaded texture to a MeshPhongMaterial and whitens its color.
 * Must be called inside the TextureLoader callback AFTER tex is ready.
 *
 * colorSpace must be set to SRGBColorSpace so colors aren't doubled-gamma.
 * needsUpdate = true tells Three.js to re-upload the material to the GPU.
 */
export function applyTexture(
  material: THREE.MeshPhongMaterial,
  tex: THREE.Texture,
): void {
  // r128 uses .encoding, not .colorSpace (.colorSpace was added in r140+)
  (tex as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
  material.map = tex;
  material.color.setHex(0xffffff); // white base so texture shows true color
  material.needsUpdate = true;
}

/**
 * Async helper: loads a texture and applies it to a material.
 * Returns the texture so the caller can also apply it elsewhere (e.g. normalMap).
 */
export function loadTexture(
  url: string,
  loader: THREE.TextureLoader,
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        // r128: sRGBEncoding = 3001
        (tex as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
        resolve(tex);
      },
      undefined,
      reject,
    );
  });
}

/** Texture filename map — all from Solar System Scope (CC BY 4.0). */
export const TEXTURE_FILES: Record<string, string> = {
  sun:     '2k_sun.jpg',
  mercury: '2k_mercury.jpg',
  venus:   '2k_venus_surface.jpg',
  earth:   '2k_earth_daymap.jpg',
  moon:    '2k_moon.jpg',
  mars:    '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn:  '2k_saturn.jpg',
  uranus:  '2k_uranus.jpg',
  neptune: '2k_neptune.jpg',
};

/** Night lights texture filename — NASA SVS ID 30003 (public domain). */
export const EARTH_NIGHT_FILE = '2k_earth_nightmap.jpg'; // needs download — not in repo yet
