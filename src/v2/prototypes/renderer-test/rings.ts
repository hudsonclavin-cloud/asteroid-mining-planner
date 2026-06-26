/**
 * PROTOTYPE — rings.ts
 *
 * Minimal Saturn ring for the prototype scene.
 * The production codebase already has a sophisticated procedural ring system
 * in src/v2/render/saturn-rings.ts (470 lines, 7 gap/ringlet features).
 * This is a simpler version that loads the existing 2k_saturn_ring_alpha.png
 * texture already in the repo.
 *
 * Ring geometry: THREE.RingGeometry (flat disc).
 * Material: MeshBasicMaterial with the alpha texture.
 *   - transparent: true, depthWrite: false, side: THREE.DoubleSide
 *   - AdditiveBlending for a subtle glow-through effect
 *
 * Real inner/outer ring radii (relative to Saturn equatorial radius):
 *   D ring:  1.11 – 1.236
 *   C ring:  1.236 – 1.525
 *   B ring:  1.525 – 1.950  ← main visible bright ring
 *   Cassini: 1.950 – 2.025  ← gap
 *   A ring:  2.025 – 2.267
 *   F ring:  ~2.326         ← thin
 *
 * For the prototype, simplified to: inner=1.25×, outer=2.3×, 128 segments.
 */

import * as THREE from 'three';

export async function addSaturnRings(
  scene: THREE.Scene,
  saturnMesh: THREE.Mesh,
  loader: THREE.TextureLoader,
  base: string,
): Promise<THREE.Mesh | null> {
  const r = (saturnMesh.geometry as THREE.SphereGeometry).parameters.radius;

  // Load the ring alpha texture already in textures/
  let ringTex: THREE.Texture | null = null;
  try {
    ringTex = await new Promise<THREE.Texture>((res, rej) => {
      loader.load(`${base}2k_saturn_ring_alpha.png`, res, undefined, rej);
    });
  } catch {
    console.warn('[renderer-test] Saturn ring texture not found — using procedural fallback');
    ringTex = buildProceduralRingTexture();
  }

  // RingGeometry UV maps radially: u=0 inner rim, u=1 outer rim.
  // innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength
  const geo = new THREE.RingGeometry(r * 1.25, r * 2.3, 128, 4);

  // Remap UVs so the texture wraps radially (not the default which is odd for rings)
  remapRingUVs(geo);

  const mat = new THREE.MeshBasicMaterial({
    map:         ringTex,
    transparent: true,
    depthWrite:  false,
    side:        THREE.DoubleSide,
    blending:    THREE.AdditiveBlending,
    opacity:     0.9,
  });

  const rings = new THREE.Mesh(geo, mat);
  rings.position.copy(saturnMesh.position);

  // Tilt rings 26.7° to match Saturn's axial tilt
  rings.rotation.x = Math.PI / 2;
  rings.rotation.y = 0;
  rings.rotation.z = THREE.MathUtils.degToRad(26.7);

  // Render after opaque planet, before atmosphere shells
  rings.renderOrder = 100;
  scene.add(rings);
  return rings;
}

/**
 * Remaps RingGeometry UVs so u goes from 0 (inner) to 1 (outer) radially.
 * Three.js default RingGeometry UV is reasonable but not ideal for a radial texture.
 */
function remapRingUVs(geo: THREE.RingGeometry): void {
  const pos = geo.attributes.position;
  const uv  = geo.attributes.uv as THREE.BufferAttribute;
  const inner = geo.parameters.innerRadius;
  const outer = geo.parameters.outerRadius;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  uv.needsUpdate = true;
}

/** Simple procedural ring texture as a fallback. */
function buildProceduralRingTexture(): THREE.Texture {
  const W = 512;
  const H = 1;
  const data = new Uint8Array(W * H * 4); // RGBA

  for (let x = 0; x < W; x++) {
    const t = x / W;

    // Cassini division: gap at ~62% across
    const cassini = t > 0.60 && t < 0.66 ? 0 : 1;

    // B ring (inner bright): 0–0.60
    // A ring (outer):        0.66–0.95
    // F ring (thin):         0.96–0.99
    let alpha = 0;
    if (t < 0.1)       alpha = t / 0.1 * 0.4;         // C ring (faint)
    else if (t < 0.60) alpha = 0.85;                   // B ring (bright)
    else if (t < 0.66) alpha = 0;                      // Cassini gap
    else if (t < 0.95) alpha = 0.6 - (t - 0.66) * 0.8; // A ring (fades out)
    else if (t < 0.99) alpha = 0.3;                    // F ring
    alpha *= cassini;

    const i = x * 4;
    data[i + 0] = Math.round(200 * alpha);  // R
    data[i + 1] = Math.round(180 * alpha);  // G
    data[i + 2] = Math.round(150 * alpha);  // B
    data[i + 3] = Math.round(255 * alpha);  // A
  }

  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}
