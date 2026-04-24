import * as THREE from 'three';
// TODO: import from src/renderer/scene — scene, camera, controls
// TODO: import from src/renderer/scene/asteroids — asteroidData, asteroidCount
// TODO: import from src/physics — kep2cartJS, applyBurnJS
// TODO: import from src/utils — DEG, screenToNDC

// ─── Gizmo ────────────────────────────────────────────────────────────────────
function makeArrow(color: number, axisName: string): THREE.Group {
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.32, 8),
    new THREE.MeshBasicMaterial({ color, depthTest: false })
  );
  shaft.position.y = 0.16;
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.018, 0.08, 8),
    new THREE.MeshBasicMaterial({ color, depthTest: false })
  );
  tip.position.y = 0.36;
  const grp = new THREE.Group();
  grp.add(shaft, tip);
  grp.userData = { axis: axisName };
  return grp;
}

export const gizmoGroup = new THREE.Group();
export const arrowPrograde = makeArrow(0x00ff44, 'prograde');  // green
export const arrowNormal   = makeArrow(0x4488ff, 'normal');    // blue
export const arrowRadial   = makeArrow(0xff3344, 'radial');    // red
gizmoGroup.add(arrowPrograde, arrowNormal, arrowRadial);
gizmoGroup.visible = false;
gizmoGroup.renderOrder = 999;

// ─── Burn Mode State ──────────────────────────────────────────────────────────
export let burnModeActive = false;
export let burnDV = { p: 0, n: 0, r: 0 };
export let currentBurnElements: any = null;  // post-burn elements (radians/epoch_JD form)
export let lastBurnResult: any = null;       // latest apply_burn response
export let dragAxis: string | null = null;
export let dragStartScreen: { x: number; y: number } | null = null;
export let dragStartDV = 0;

// ─── Gizmo Drag ───────────────────────────────────────────────────────────────
export const gizmoRaycaster = new THREE.Raycaster();

export function initGizmo(scene: THREE.Scene): void {
  scene.add(gizmoGroup);
}

export function updateGizmo(deps: {
  burnModeActive: boolean;
  selectedId: number;
  asteroidData: any[];
  currentBurnElements: any;
  currentJD: number;
  camera: THREE.Camera;
  kep2cartJS: (...args: any[]) => any;
  DEG: number;
}): void {
  const {
    burnModeActive: active, selectedId, asteroidData, currentBurnElements: burnEl,
    currentJD, camera, kep2cartJS, DEG,
  } = deps;

  if (!active || selectedId < 0) return;
  const ast = asteroidData[selectedId];
  let state: any;
  try {
    if (burnEl) {
      state = kep2cartJS(burnEl.a, burnEl.e,
        burnEl.i, burnEl.Om,
        burnEl.w, burnEl.M0,
        burnEl.epoch_JD, currentJD);
    } else {
      state = kep2cartJS(ast.a, ast.e, ast.i*DEG, ast.om*DEG, ast.w*DEG, ast.ma*DEG, ast.epoch, currentJD);
    }
  } catch(_) { return; }

  gizmoGroup.position.set(state.x, state.y, state.z);

  const rv = new THREE.Vector3(state.x, state.y, state.z);
  const vv = new THREE.Vector3(state.vx, state.vy, state.vz);
  if (vv.lengthSq() < 1e-20) return;

  const v_hat = vv.clone().normalize();
  const h_hat = new THREE.Vector3().crossVectors(rv, vv).normalize();
  const r_hat = rv.clone().normalize();

  const up = new THREE.Vector3(0, 1, 0);
  arrowPrograde.quaternion.setFromUnitVectors(up, v_hat);
  arrowNormal.quaternion.setFromUnitVectors(up, h_hat);
  arrowRadial.quaternion.setFromUnitVectors(up, r_hat);

  const scale = camera.position.distanceTo(gizmoGroup.position) * 0.12;
  gizmoGroup.scale.setScalar(Math.max(0.05, scale));
}

export function onPointerDown(
  e: PointerEvent,
  deps: {
    burnModeActive: boolean;
    camera: THREE.Camera;
    controls: { enabled: boolean };
    screenToNDC: (e: PointerEvent) => THREE.Vector2;
    setBurnDragState: (axis: string, screen: { x: number; y: number }, startDV: number) => void;
    burnDV: { p: number; n: number; r: number };
  }
): void {
  const { burnModeActive: active, camera, controls, screenToNDC, setBurnDragState, burnDV: dv } = deps;
  if (!active) return;
  const ndc = screenToNDC(e);
  gizmoRaycaster.setFromCamera(ndc as any, camera);
  const hits = gizmoRaycaster.intersectObjects(gizmoGroup.children, true);
  if (hits.length === 0) return;
  let obj: THREE.Object3D | null = hits[0].object;
  while (obj && !obj.userData.axis) obj = obj.parent;
  if (!obj) return;
  const axis = obj.userData.axis as string;
  setBurnDragState(axis, { x: e.clientX, y: e.clientY }, (dv as any)[axis[0]]);
  controls.enabled = false;
  e.stopPropagation();
}

export function onPointerMove(
  e: PointerEvent,
  deps: {
    dragAxis: string | null;
    dragStartScreen: { x: number; y: number } | null;
    dragStartDV: number;
    burnDV: { p: number; n: number; r: number };
    camera: THREE.Camera;
    missionPlanningActive: boolean;
    selectedId: number;
    asteroidMesh: THREE.InstancedMesh | null;
    asteroidCount: number;
    burnModeActive: boolean;
    earthLayerActive: boolean;
    positionCache: Float32Array;
    asteroidData: any[];
    hoveredId: number;
    renderer: THREE.WebGLRenderer;
    setWasDragging: (v: boolean) => void;
    setHoveredId: (id: number) => void;
    setBurnDV: (key: string, val: number) => void;
    previewBurn: () => void;
    updateBurnUI: () => void;
    showHoverEllipse: (ast: any) => void;
    hideHoverEllipse: () => void;
    getDisplayDeltaV: (ast: any) => number;
    formatValueDisplay: (v: number) => string;
    getDisplayValueUsd: (ast: any) => number;
    _clickVec3: THREE.Vector3;
  }
): void {
  const {
    dragAxis: axis, dragStartScreen: startScreen, dragStartDV: startDV,
    burnDV: dv, camera, missionPlanningActive, selectedId,
    asteroidMesh, asteroidCount, burnModeActive: active, earthLayerActive,
    positionCache, asteroidData, hoveredId, renderer,
    setWasDragging, setHoveredId, setBurnDV, previewBurn, updateBurnUI,
    showHoverEllipse, hideHoverEllipse,
    getDisplayDeltaV, formatValueDisplay, getDisplayValueUsd, _clickVec3,
  } = deps;

  if (!axis) {
    // Suppress hover highlights while an asteroid is selected or mission results are displayed
    if (missionPlanningActive || selectedId >= 0) {
      renderer.domElement.style.cursor = 'default';
      const tt = document.getElementById('asteroid-tooltip');
      if (tt) tt.style.display = 'none';
      hideHoverEllipse();
      setHoveredId(-1);
      return;
    }
    // Asteroid hover detection
    if (asteroidMesh && asteroidCount > 0 && !active && !earthLayerActive) {
      const rect = renderer.domElement.getBoundingClientRect();
      let bestDist = 18, bestId = -1;
      for (let i = 0; i < asteroidCount; i++) {
        if (positionCache.length < (i + 1) * 3) continue;
        _clickVec3.set(positionCache[i*3], positionCache[i*3+1], positionCache[i*3+2]);
        const p = _clickVec3.clone().project(camera);
        if (p.z > 1) continue;
        const sx = (p.x + 1) / 2 * rect.width + rect.left;
        const sy = (-p.y + 1) / 2 * rect.height + rect.top;
        const d = Math.hypot(e.clientX - sx, e.clientY - sy);
        if (d < bestDist) { bestDist = d; bestId = i; }
      }
      if (bestId !== hoveredId) {
        setHoveredId(bestId);
        const tt = document.getElementById('asteroid-tooltip');
        if (bestId >= 0 && tt) {
          const ast = asteroidData[bestId];
          const name = (ast.full_name || ast.pdes || '—').substring(0, 24);
          const spec = (ast.spec || ast.spec_T || '?').trim();
          tt.innerHTML = `<span style="color:#00d4ff">${name}</span><br>${spec}-type · ΔV ${getDisplayDeltaV(ast).toFixed(1)} km/s<br>${formatValueDisplay(getDisplayValueUsd(ast))}`;
          tt.style.display = 'block';
          renderer.domElement.style.cursor = 'pointer';
          if (bestId !== selectedId) showHoverEllipse(ast);
          else hideHoverEllipse();
        } else if (tt) {
          tt.style.display = 'none';
          renderer.domElement.style.cursor = 'default';
          hideHoverEllipse();
        }
      }
      if (hoveredId >= 0) {
        const tt = document.getElementById('asteroid-tooltip');
        if (tt) { tt.style.left = (e.clientX + 14) + 'px'; tt.style.top = (e.clientY - 8) + 'px'; }
      }
    }
    return;
  }
  setWasDragging(true);
  const arrowMap: Record<string, THREE.Group> = { prograde: arrowPrograde, normal: arrowNormal, radial: arrowRadial };
  const arrow = arrowMap[axis];
  const worldDir = new THREE.Vector3(0, 1, 0).applyQuaternion(arrow.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const projected = worldDir.clone().project(camera);
  projected.z = 0;
  const sd = (projected as THREE.Vector3).length() > 1e-5
    ? (projected as THREE.Vector3).normalize()
    : new THREE.Vector3(1, 0, 0);

  const delta = {
    x: (e.clientX - startScreen!.x) / window.innerWidth,
    y: -(e.clientY - startScreen!.y) / window.innerHeight,
  };
  const proj = delta.x * sd.x + delta.y * sd.y;
  const dist = camera.position.distanceTo(gizmoGroup.position);
  const sensitivity = 8 * Math.max(0.15, dist);
  const dvDelta = proj * sensitivity;

  const key = axis[0];
  const newVal = Math.round(Math.max(-12, Math.min(12, startDV + dvDelta)) * 10) / 10; // snap to 0.1 km/s
  setBurnDV(key, newVal);

  previewBurn();
  updateBurnUI();
}

export function onPointerUp(deps: {
  dragAxis: string | null;
  burnModeActive: boolean;
  selectedId: number;
  asteroidData: any[];
  currentJD: number;
  burnDV: { p: number; n: number; r: number };
  worker: Worker;
  controls: { enabled: boolean };
  clearDragAxis: () => void;
  DEG: number;
}): void {
  const {
    dragAxis: axis, burnModeActive: active, selectedId, asteroidData,
    currentJD, burnDV: dv, worker, controls, clearDragAxis, DEG,
  } = deps;

  if (axis) {
    clearDragAxis();
    controls.enabled = true;
    // Drag ended — fire a final apply_burn without preview flag to compute accurate MOID
    if (active && selectedId >= 0) {
      const ast = asteroidData[selectedId];
      if (ast) {
        const origEl = { a: ast.a, e: ast.e, i: ast.i*DEG, Om: ast.om*DEG, w: ast.w*DEG, M0: ast.ma*DEG, epoch_JD: ast.epoch };
        worker.postMessage({ cmd: 'apply_burn', elements: origEl, jd: currentJD, dv_p: dv.p, dv_n: dv.n, dv_r: dv.r });
      }
    }
  }
}
