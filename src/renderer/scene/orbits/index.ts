import * as THREE from 'three';
import { solveKepler } from '../../../physics/orbital/keplerian/kepler';
import { kep2cart } from '../../../physics/orbital/keplerian/elements';
import { _arcAnchors } from '../../../state/index';

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

// ─── Glow line helpers ────────────────────────────────────────────────────────
// Source: index.html lines 2048–2093

export function showGlowLine(group: THREE.Group | null | undefined): void {
  if (!group) return;
  group.visible = true;
  const g = group.userData?.glow;
  if (g?.dashed) {
    if (g.core) (g.core as THREE.Line).computeLineDistances();
    if (g.halo) (g.halo as THREE.Line).computeLineDistances();
  }
}

export function setGlowLineColor(target: THREE.Group | null | undefined, color: number, opacity?: number, haloOpacity: number | null = null): void {
  const glow = target?.userData?.glow;
  if (!glow) return;
  const nextHaloOpacity = haloOpacity ?? Math.max(0.08, (opacity ?? 0.8) * 0.18);
  glow.color = color;
  [glow.core, glow.halo].forEach((line: any, idx: number) => {
    if (!line?.material) return;
    line.material.color.setHex(color);
    line.material.opacity = idx === 0 ? (opacity ?? line.material.opacity) : nextHaloOpacity;
    line.material.needsUpdate = true;
  });
}

export function setGlowLinePoints(target: THREE.Group | null | undefined, points: THREE.Vector3[]): void {
  const glow = target?.userData?.glow;
  if (!glow) return;
  [glow.core, glow.halo].forEach((line: any) => {
    line.geometry.setFromPoints(points);
    if (glow.dashed) {
      const pos = line.geometry.getAttribute('position');
      if (pos && pos.count > 1) line.computeLineDistances();
    }
  });
}

// ─── Orbit element helpers ────────────────────────────────────────────────────
// Source: index.html lines 2130–2186

export function asteroidToOrbitElements(ast: any): { a: number; e: number; i: number; Om: number; w: number; M0: number; epoch_JD: number } {
  const DEG = Math.PI / 180;
  return { a: ast.a, e: ast.e, i: ast.i * DEG, Om: ast.om * DEG, w: ast.w * DEG, M0: ast.ma * DEG, epoch_JD: ast.epoch };
}

export function buildOrbitPointsFromElements(el: { a: number; e: number; i: number; Om: number; w: number }, steps = 256): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const { a, e, i, Om, w } = el;
  const cosOm = Math.cos(Om), sinOm = Math.sin(Om);
  const cosI  = Math.cos(i),  sinI  = Math.sin(i);
  const cosW  = Math.cos(w),  sinW  = Math.sin(w);
  const Rxx = cosOm*cosW - sinOm*sinW*cosI;
  const Rxy = -(cosOm*sinW + sinOm*cosW*cosI);
  const Ryx = sinOm*cosW + cosOm*sinW*cosI;
  const Ryy = -(sinOm*sinW - cosOm*cosW*cosI);
  const Rzx = sinW*sinI;
  const Rzy = cosW*sinI;
  for (let k = 0; k <= steps; k++) {
    const M_step = (k / steps) * TWO_PI - Math.PI;
    const E_step = solveKepler(M_step, e);
    const nu = 2 * Math.atan2(Math.sqrt(1+e)*Math.sin(E_step/2), Math.sqrt(1-e)*Math.cos(E_step/2));
    const r = a * (1 - e * Math.cos(E_step));
    const xo = r * Math.cos(nu), yo = r * Math.sin(nu);
    pts.push(new THREE.Vector3(xo*Rxx + yo*Rxy, xo*Ryx + yo*Ryy, xo*Rzx + yo*Rzy));
  }
  return pts;
}

export function drawOrbitFromElements(line: THREE.Group | null | undefined, el: any): void {
  setGlowLinePoints(line, buildOrbitPointsFromElements(el, 256));
  if (line) line.visible = true;
}

export function validateArcPoints(points: THREE.Vector3[], label: string): boolean {
  const MAX_AU = 5.5;
  for (const p of points) {
    if (p.length() > MAX_AU) {
      console.error(`[Aster] ${label} arc out of bounds: ${p.length().toFixed(1)} AU`);
      return false;
    }
  }
  return true;
}

export function buildOrbitSegmentPoints(
  el: { a: number; e: number; i: number; Om: number; w: number; M0: number; epoch_JD: number } | null,
  jdStart: number,
  jdEnd: number,
  steps = 96
): THREE.Vector3[] {
  if (!el || !Number.isFinite(jdStart) || !Number.isFinite(jdEnd) || jdEnd <= jdStart) return [];
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const jd = jdStart + (jdEnd - jdStart) * (i / steps);
    const state = kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, jd);
    pts.push(new THREE.Vector3(state.x, state.y, state.z));
  }
  return pts;
}

// ─── Arc label anchors ────────────────────────────────────────────────────────
// Source: index.html line 2410

export function setArcAnchorFromGlowLine(key: number, glowGroup: THREE.Group | null | undefined, text: string, frac = 0.5): void {
  const pos = (glowGroup as any)?.userData?.glow?.core?.geometry?.attributes?.position?.array;
  if (!pos || pos.length < 6) { _arcAnchors[key] = null; return; }
  const nPts = pos.length / 3;
  const idx  = Math.max(0, Math.min(nPts - 1, Math.round(frac * (nPts - 1))));
  _arcAnchors[key] = { pos: new THREE.Vector3(pos[idx*3], pos[idx*3+1], pos[idx*3+2]), text };
}

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
