import * as THREE from 'three';

// TODO: import from src/renderer/scene/planets (planets)
// TODO: import from src/renderer/scene/index (sunMesh)

// ─── Planet + Sun textures (same-origin, no CORS) ─────────────────────────────
export function initTextures(
  planets: THREE.Mesh[],
  sunMesh: THREE.Mesh
): void {
  (function() {
    const loader = new THREE.TextureLoader();
    const texMap: [number, string][] = [
      [0, '2k_mercury.jpg'], [1, '2k_venus_surface.jpg'],
      [2, '2k_earth_daymap.jpg'], [3, '2k_mars.jpg'],
      [4, '2k_jupiter.jpg'], [5, '2k_saturn.jpg'],
      [6, '2k_uranus.jpg'], [7, '2k_neptune.jpg'],
    ];
    texMap.forEach(([i, f]) => loader.load('./textures/' + f,
      tex => {
        (planets[i].material as THREE.MeshPhongMaterial).map = tex;
        (planets[i].material as THREE.MeshPhongMaterial).color.setHex(0xffffff);
        (planets[i].material as THREE.MeshPhongMaterial).needsUpdate = true;
      },
      undefined, e => console.warn(`[tex] planet ${i} (${f}) failed:`, (e as Error)?.message || 'load error')));
    loader.load('./textures/2k_sun.jpg',
      tex => {
        (sunMesh.material as THREE.MeshBasicMaterial).map = tex;
        (sunMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
        (sunMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
      },
      undefined, e => console.warn('[tex] sun failed:', (e as Error)?.message || 'load error'));
    // Saturn ring texture — find the dedicated ring mesh by stable metadata, with geometry fallback
    const satRing = planets[5]?.children.find(c =>
      (c as THREE.Mesh)?.userData?.saturnRing ||
      c?.name === 'saturn-ring' ||
      (c as THREE.Mesh)?.geometry?.type === 'TorusGeometry' ||
      (c as THREE.Mesh)?.geometry?.type === 'RingGeometry'
    ) as THREE.Mesh | undefined;
    if (satRing) loader.load('./textures/2k_saturn_ring_alpha.png',
      tex => {
        (satRing.material as THREE.MeshPhongMaterial).map = tex;
        (satRing.material as THREE.MeshPhongMaterial).alphaMap = tex;
        (satRing.material as THREE.MeshPhongMaterial).needsUpdate = true;
      },
      undefined, e => console.warn('[tex] saturn ring failed:', (e as Error)?.message || 'load error'));
    else console.warn('[tex] saturn ring mesh not found — ring texture skipped');
  })();
}
