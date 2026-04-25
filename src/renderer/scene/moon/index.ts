import * as THREE from 'three';

// TODO: import from src/utils/constants (TWO_PI, J2000, DEG, AU_KM)
// TODO: import from src/renderer/scene/index (scene)
// TODO: import from src/renderer/scene/orbits/index (makeDashedGlowLine, setGlowLinePoints)
// TODO: import from src/renderer/scene/planets (planets)

const TWO_PI = 2 * Math.PI;
const J2000 = 2451545.0;
const DEG = Math.PI / 180;
const AU_KM = 1.496e11 / 1000;

// ─── Moon ─────────────────────────────────────────────────────────────────────
export const MOON_DISPLAY_RADIUS = 0.0015;
export const MOON_TRUE_RADIUS_KM = 1737.4;
export const MOON_A_AU = 384400 / AU_KM;
export const MOON_PERIOD_DAYS = 27.321661;
export const MOON_INCLINATION = 5.145 * DEG;
export const MOON_NODE_J2000 = 125.08 * DEG;
export const MOON_NODE_PERIOD_DAYS = 6798.38;
export const moonMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
export const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(MOON_DISPLAY_RADIUS, 12, 12), moonMat);
moonMesh.userData.baseRadius = MOON_DISPLAY_RADIUS;
moonMesh.userData.trueRadiusKm = MOON_TRUE_RADIUS_KM;
// TODO: scene.add(moonMesh) — call after scene is available
(function() {
  new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}2k_moon.jpg`,
    tex => { moonMat.map = tex; moonMat.color.setHex(0xffffff); moonMat.needsUpdate = true; },
    undefined, e => console.warn('[tex] moon failed:', (e as Error)?.message || 'load error'));
})();
// TODO: moonOrbitLine uses makeDashedGlowLine from src/renderer/scene/orbits/index
// export const moonOrbitLine = makeDashedGlowLine(new THREE.BufferGeometry(), 0x7cbcff, 0.46, 0.00018, 0.0001, { haloOpacity: 0.08 });
// TODO: scene.add(moonOrbitLine) — call after scene is available

export function physicalRadiusToSceneAU(radiusKm: number): number {
  return radiusKm / AU_KM;
}

export function moonRelativeSceneState(jd: number): { x: number; y: number; z: number } {
  const angle = ((TWO_PI / MOON_PERIOD_DAYS) * (jd - J2000)) % TWO_PI;
  const node = (MOON_NODE_J2000 - (TWO_PI / MOON_NODE_PERIOD_DAYS) * (jd - J2000)) % TWO_PI;
  const cosNode = Math.cos(node), sinNode = Math.sin(node);
  const cosI = Math.cos(MOON_INCLINATION), sinI = Math.sin(MOON_INCLINATION);
  const xOrb = MOON_A_AU * Math.cos(angle);
  const yOrb = MOON_A_AU * Math.sin(angle);
  return {
    x: xOrb * cosNode - yOrb * cosI * sinNode,
    y: xOrb * sinNode + yOrb * cosI * cosNode,
    z: yOrb * sinI,
  };
}

// TODO: import setGlowLinePoints from src/renderer/scene/orbits/index
// TODO: import moonOrbitLine (once makeDashedGlowLine is importable)
// TODO: import planets from src/renderer/scene/planets
export function updateMoonOrbitVisualization(
  jd: number,
  moonOrbitLine: THREE.Group,
  planets: THREE.Mesh[],
  setGlowLinePoints: (target: THREE.Group, points: THREE.Vector3[]) => void
): void {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 128; i++) {
    const rel = moonRelativeSceneState(jd + (i / 128) * MOON_PERIOD_DAYS);
    pts.push(new THREE.Vector3(rel.x, rel.y, rel.z));
  }
  setGlowLinePoints(moonOrbitLine, pts);
  moonOrbitLine.position.copy(planets[2].position);
}
