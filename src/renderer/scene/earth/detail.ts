import * as THREE from 'three';
import { planets } from '../planets';
import { moonMesh } from '../moon/index';
// TODO: import from src/renderer/scene — scene, shellGroup
// TODO: import from src/renderer/scene/earth — createProceduralLandOverlay
// TODO: import from src/renderer/scene/earth/satellites — satelliteMesh, satellitesEnabled, satelliteData, fetchSatellites
// TODO: import from src/renderer/scene/moon — issOrbitLine, applyMoonOrbitVisualState

// ─── Phase 4: Earth Detail + Orbital Shells ──────────────────────────────────
export const earthDetailGroup = new THREE.Group();

const earthDetailMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.0425, 32, 32),
  new THREE.MeshPhongMaterial({ color: 0x1a6b9e, specular: 0x4488bb, shininess: 40 })
);
earthDetailGroup.add(earthDetailMesh);

// createProceduralLandOverlay is injected at init time (cross-module dep)
let _proceduralLand: THREE.Mesh | null = null;

const atmMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.045, 32, 32),
  new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
);
earthDetailGroup.add(atmMesh);

const eqPts4: THREE.Vector3[] = [];
for (let _j4 = 0; _j4 <= 128; _j4++) {
  const _a4 = (_j4/128) * Math.PI * 2;
  eqPts4.push(new THREE.Vector3(Math.cos(_a4)*0.0425, 0, Math.sin(_a4)*0.0425));
}
earthDetailGroup.add(new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(eqPts4),
  new THREE.LineBasicMaterial({ color: 0x2255aa, transparent: true, opacity: 0.4 })
));

function kmToAU(km: number): number { return km * 6.67e-6; }

function makeShellRing(radiusAU: number, color: number, opacity: number, tube = 0.0002): THREE.Mesh {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radiusAU, tube, 2, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
  );
  ring.rotation.x = Math.PI / 2;
  return ring;
}

export const shellGroup = new THREE.Group();
shellGroup.add(makeShellRing(0.0425 + kmToAU(400),   0x3b82f6, 0.3));
shellGroup.add(makeShellRing(0.0425 + kmToAU(2000),  0x3b82f6, 0.15));
shellGroup.add(makeShellRing(0.0425 + kmToAU(20200), 0x10b981, 0.2));
shellGroup.add(makeShellRing(0.0425 + kmToAU(35786), 0xfbbf24, 0.5, 0.0006));

export let earthLayerActive = false;

export function initEarthDetail(deps: {
  scene: THREE.Scene;
  createProceduralLandOverlay: (radius: number, detail: number, opacity: number) => THREE.Mesh;
}): void {
  const { scene, createProceduralLandOverlay } = deps;

  _proceduralLand = createProceduralLandOverlay(0.0425 * 1.001, 26, 0.7);
  earthDetailGroup.add(_proceduralLand);

  earthDetailGroup.visible = false;
  scene.add(earthDetailGroup);

  shellGroup.visible = false;
  scene.add(shellGroup);
}

export function activateEarthLayer(deps: {
  planets: THREE.Object3D[];
  satelliteMesh: THREE.InstancedMesh | null;
  satellitesEnabled: boolean;
  satelliteData: any[];
  issOrbitLine: THREE.Line | null;
  applyMoonOrbitVisualState: () => void;
  setStatus: (msg: string, warn?: boolean) => void;
  fetchSatellites: () => void;
  setEarthLayerActive: (v: boolean) => void;
}): void {
  const {
    planets, satelliteMesh, satellitesEnabled, satelliteData,
    issOrbitLine, applyMoonOrbitVisualState, setStatus, fetchSatellites,
    setEarthLayerActive,
  } = deps;

  earthLayerActive = true;
  setEarthLayerActive(true);
  const earthPos = planets[2].position;
  earthDetailGroup.position.copy(earthPos);
  shellGroup.position.copy(earthPos);
  earthDetailGroup.visible = true;
  shellGroup.visible = true;
  planets[2].visible = false;
  if (satelliteMesh) satelliteMesh.visible = satellitesEnabled;
  if (issOrbitLine) issOrbitLine.visible = true;
  document.getElementById('earth-hud')!.style.display = 'block';
  applyMoonOrbitVisualState();
  setStatus('EARTH LAYER — satellite orbits active', true);
  if (satellitesEnabled && satelliteData.length === 0) fetchSatellites();
}

export function deactivateEarthLayer(deps: {
  planets: THREE.Object3D[];
  satelliteMesh: THREE.InstancedMesh | null;
  issOrbitLine: THREE.Line | null;
  applyMoonOrbitVisualState: () => void;
  selectedSatId: number;
  setSelectedSatId: (id: number) => void;
  setEarthLayerActive: (v: boolean) => void;
}): void {
  const {
    planets, satelliteMesh, issOrbitLine, applyMoonOrbitVisualState,
    selectedSatId, setSelectedSatId, setEarthLayerActive,
  } = deps;

  earthLayerActive = false;
  setEarthLayerActive(false);
  earthDetailGroup.visible = false;
  shellGroup.visible = false;
  planets[2].visible = true;
  if (satelliteMesh) satelliteMesh.visible = false;
  if (issOrbitLine) issOrbitLine.visible = false;
  document.getElementById('earth-hud')!.style.display = 'none';
  applyMoonOrbitVisualState();
  if (selectedSatId >= 0) {
    setSelectedSatId(-1);
    document.getElementById('sat-panel')!.style.display = 'none';
    document.getElementById('panel-idle')!.style.display = 'block';
  }
}

// ─── Capture target position ──────────────────────────────────────────────────
// Source: index.html lines 7495–7521

export function getCaptureTargetPosition(capture: any): { x: number; y: number; z: number } | null {
  if (!capture) return null;
  if (capture.targetPos && Number.isFinite(capture.targetPos.x) && Number.isFinite(capture.targetPos.y) && Number.isFinite(capture.targetPos.z)) {
    if (capture.target_body !== 'moon' && capture.target_body !== 'el4' && capture.target_body !== 'el5') {
      return capture.targetPos;
    }
  }
  if (!planets[2]) return null;
  if (capture.target_body === 'moon') {
    return { x: moonMesh.position.x, y: moonMesh.position.y, z: moonMesh.position.z };
  }
  const earthPos = planets[2].position;
  const moonDx = moonMesh.position.x - earthPos.x;
  const moonDy = moonMesh.position.y - earthPos.y;
  const moonDz = moonMesh.position.z - earthPos.z;
  if (capture.target_body === 'el4' || capture.target_body === 'el5') {
    const sign = capture.target_body === 'el4' ? 1 : -1;
    const cos60 = 0.5;
    const sin60 = sign * Math.sqrt(3) / 2;
    return {
      x: earthPos.x + moonDx * cos60 - moonDy * sin60,
      y: earthPos.y + moonDx * sin60 + moonDy * cos60,
      z: earthPos.z + moonDz,
    };
  }
  return capture.targetPos || null;
}
