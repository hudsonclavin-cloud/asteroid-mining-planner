import * as THREE from 'three';

// TODO: import from src/renderer/scene/index (scene)
// TODO: import from src/utils/constants (TWO_PI, ORBIT_NEON)

const TWO_PI = 2 * Math.PI;

// ─── Orbit Lines ──────────────────────────────────────────────────────────────
export const ORBIT_NEON = {
  earth: 0x00d4ff,
  asteroid: 0x9b59ff,
  nhats: 0x00ffcc,
  transfer: 0xffaa00,
  redirect: 0x00ff88,
  burnBaseline: 0xdbeafe,
  burnNew: 0xff8c42,
  redirectBaseline: 0x6e74d8,
  iss: 0x00d4ff,
};

function makeGlowMaterial(
  color: number,
  opacity: number,
  options: { dashed?: boolean; dashSize?: number; gapSize?: number; depthWrite?: boolean } = {}
): THREE.LineBasicMaterial | THREE.LineDashedMaterial {
  const {
    dashed = false,
    dashSize = 0.03,
    gapSize = 0.02,
    depthWrite = false,
  } = options;
  const common = {
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite,
  };
  return dashed
    ? new THREE.LineDashedMaterial({ ...common, dashSize, gapSize })
    : new THREE.LineBasicMaterial(common);
}

export function makeGlowLine(
  geometry: THREE.BufferGeometry | null,
  color: number,
  opacity: number,
  options: { dashed?: boolean; haloScale?: number; haloOpacity?: number; dashSize?: number; gapSize?: number } = {}
): THREE.Group {
  const {
    dashed = false,
    haloScale = 1.003,
    haloOpacity = Math.max(0.08, (opacity || 0.8) * 0.18),
    dashSize = 0.03,
    gapSize = 0.02,
  } = options;
  const core = new THREE.Line(
    geometry ? geometry.clone() : new THREE.BufferGeometry(),
    makeGlowMaterial(color, opacity ?? 0.85, { dashed, dashSize, gapSize })
  );
  const halo = new THREE.Line(
    geometry ? geometry.clone() : new THREE.BufferGeometry(),
    makeGlowMaterial(color, haloOpacity, { dashed, dashSize, gapSize })
  );
  halo.scale.setScalar(haloScale);
  halo.renderOrder = 1;
  const group = new THREE.Group();
  group.add(core, halo);
  group.visible = false;
  group.userData.glow = { core, halo, dashed, dashSize, gapSize, color };
  return group;
}

export function makeDashedGlowLine(
  geometry: THREE.BufferGeometry | null,
  color: number,
  opacity: number,
  dashSize = 0.03,
  gapSize = 0.02,
  options: { dashed?: boolean; haloScale?: number; haloOpacity?: number; dashSize?: number; gapSize?: number } = {}
): THREE.Group {
  return makeGlowLine(geometry, color, opacity, { ...options, dashed: true, dashSize, gapSize });
}

export function setGlowLinePositions(target: THREE.Group, positions: Float32Array): void {
  const glow = target?.userData?.glow;
  if (!glow) return;
  [glow.core, glow.halo].forEach((line: THREE.Line) => {
    line.geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice() as Float32Array, 3));
    if (glow.dashed) {
      const pos = line.geometry.getAttribute('position');
      if (pos && pos.count > 1) line.computeLineDistances();
    }
  });
}

export function getOrbitGlowColor(ast: { nhats?: { accessible?: boolean } } | null | undefined): number {
  return ast?.nhats?.accessible ? ORBIT_NEON.nhats : ORBIT_NEON.asteroid;
}

// ─── Planet orbit rings ───────────────────────────────────────────────────────
// Semi-major axes for Mercury through Neptune (AU)
export const PLANET_SMA = [0.387, 0.723, 1.000, 1.524, 5.203, 9.537, 19.19, 30.07];

// TODO: import scene from src/renderer/scene/index
export function createPlanetOrbitRings(scene: THREE.Scene): THREE.Group {
  const planetOrbitGroup = new THREE.Group();
  PLANET_SMA.forEach((sma, idx) => {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= 128; j++) {
      const a = (j / 128) * TWO_PI;
      pts.push(new THREE.Vector3(Math.cos(a) * sma, 0, Math.sin(a) * sma));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const color = idx === 2 ? 0x00d4ff : 0x5a4fb3;
    const opacity = idx === 2 ? 0.82 : 0.24;
    planetOrbitGroup.add(makeGlowLine(geo, color, opacity, { haloOpacity: idx === 2 ? 0.22 : 0.08 }));
  });
  scene.add(planetOrbitGroup);
  return planetOrbitGroup;
}

// Module-scope orbit ring group stub — wired up when scene is available
// TODO: replace with import of scene and call createPlanetOrbitRings(scene)
export let planetOrbitGroup: THREE.Group = new THREE.Group();

// ─── Orbit geometry helpers ───────────────────────────────────────────────────

const DEG = Math.PI / 180;

/**
 * Rotate a point from the orbit plane to J2000 ecliptic coordinates.
 * Source: index.html lines 1755–1766.
 */
export function orbitPlaneToEcliptic(
  xOrb: number, yOrb: number,
  i_rad: number, Om_rad: number, w_rad: number
): { x: number; y: number; z: number } {
  const cosOm = Math.cos(Om_rad), sinOm = Math.sin(Om_rad);
  const cosI  = Math.cos(i_rad),  sinI  = Math.sin(i_rad);
  const cosW  = Math.cos(w_rad),  sinW  = Math.sin(w_rad);
  const Rxx = cosOm*cosW - sinOm*sinW*cosI;
  const Rxy = -(cosOm*sinW + sinOm*cosW*cosI);
  const Ryx = sinOm*cosW + cosOm*sinW*cosI;
  const Ryy = -(sinOm*sinW - cosOm*cosW*cosI);
  const Rzx = sinW*sinI;
  const Rzy = cosW*sinI;
  return { x: xOrb*Rxx + yOrb*Rxy, y: xOrb*Ryx + yOrb*Ryy, z: xOrb*Rzx + yOrb*Rzy };
}

/**
 * Sample N+1 points evenly around the full orbital ellipse (AU, scene coords).
 * Source: index.html lines 1769–1781.
 */
export function buildOrbitPoints(ast: any, steps: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const e = ast.e, a = ast.a;
  const i_rad = ast.i * DEG, Om_rad = ast.om * DEG, w_rad = ast.w * DEG;
  for (let k = 0; k <= steps; k++) {
    const nu = (TWO_PI * k) / steps;
    const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nu / 2), Math.sqrt(1 + e) * Math.cos(nu / 2));
    const r = a * (1 - e * Math.cos(E));
    const p = orbitPlaneToEcliptic(r * Math.cos(nu), r * Math.sin(nu), i_rad, Om_rad, w_rad);
    pts.push(new THREE.Vector3(p.x, p.y, p.z));
  }
  return pts;
}
