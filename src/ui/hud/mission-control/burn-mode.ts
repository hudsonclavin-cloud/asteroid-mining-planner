// TODO: import THREE from 'three'
// TODO: import { renderer, camera, controls } from 'src/renderer/scene.ts'
// TODO: import { gizmoGroup, arrowPrograde, arrowNormal, arrowRadial, newOrbitLine, originalOrbitLine, burnMarker, ghostOriginal, ghostNew, burnOrbitLines, orbitLine } from 'src/renderer/burn-visuals.ts'
// TODO: import { burnModeActive, burnDV, currentBurnElements, lastBurnResult, dragAxis, dragStartScreen, dragStartDV, setBurnModeActive, setBurnDV, setCurrentBurnElements, setLastBurnResult, setDragAxis, setDragStartScreen, setDragStartDV } from 'src/ui/hud/mission-control/state.ts'
// TODO: import { selectedId, asteroidData } from 'src/data/catalog.ts'
// TODO: import { currentJD } from 'src/time/state.ts'
// TODO: import { kep2cartJS, applyBurnJS } from 'src/physics/kepler.ts'
// TODO: import { DEG } from 'src/physics/constants.ts'
// TODO: import { drawOrbitEllipse, drawOrbitFromElements } from 'src/renderer/orbits.ts'
// TODO: import { hideOrbitLabels, updateOrbitLabels } from 'src/ui/hud/burn-labels.ts'
// TODO: import { postApplyBurn, postCloseApproachScan } from 'src/workers/physics/client.ts'
// TODO: import { tsiolkovsky } from 'src/physics/rocket.ts'
// TODO: import { jdToDate } from 'src/utils/time.ts'

// ─── Burn Mode ────────────────────────────────────────────────────────────────

export function toggleBurnMode(): void {
  if (selectedId < 0) return; // TODO: import selectedId from src/data/catalog.ts
  if (burnModeActive) { // TODO: import burnModeActive from src/ui/hud/mission-control/state.ts
    cancelBurn();
  } else {
    burnModeActive = true;
    burnDV = { p: 0, n: 0, r: 0 };
    currentBurnElements = null;
    gizmoGroup.visible = true; // TODO: import gizmoGroup from src/renderer/burn-visuals.ts
    orbitLine.visible = false; // TODO: import orbitLine from src/renderer/orbits.ts
    document.getElementById('btn-burn-mode')!.classList.add('active-mode');
    document.getElementById('btn-burn-mode')!.textContent = '◼ EXIT BURN MODE [ESC]';
    document.getElementById('dv-display')!.style.display = 'flex';
    document.getElementById('burn-mode-badge')!.style.display = 'block';
    document.getElementById('burn-sequence')!.style.display = 'block';
    updateBurnUI();
  }
}

export function cancelBurn(): void {
  burnModeActive = false;
  burnDV = { p: 0, n: 0, r: 0 };
  currentBurnElements = null;
  lastBurnResult = null;
  gizmoGroup.visible = false;
  newOrbitLine.visible = false;     // TODO: import from src/renderer/burn-visuals.ts
  originalOrbitLine.visible = false;
  burnMarker.visible = false;
  ghostOriginal.visible = false;
  ghostNew.visible = false;
  burnOrbitLines.forEach((l: any) => { l.visible = false; });
  document.getElementById('btn-burn-mode')!.classList.remove('active-mode');
  document.getElementById('btn-burn-mode')!.textContent = '▶ BURN MODE [B]';
  document.getElementById('dv-display')!.style.display = 'none';
  document.getElementById('burn-mode-badge')!.style.display = 'none';
  document.getElementById('burn-panel')!.style.display = 'none';
  document.getElementById('porkchop-panel')!.style.display = 'none';
  document.getElementById('burn-sequence')!.style.display = 'none';
  hideOrbitLabels(); // TODO: import from src/ui/hud/burn-labels.ts
  if (selectedId >= 0) drawOrbitEllipse(asteroidData[selectedId]); // TODO: import from src/renderer/orbits.ts, src/data/catalog.ts
  orbitLine.visible = true;
}

export function updateBurnUI(): void {
  const total = Math.sqrt(burnDV.p**2 + burnDV.n**2 + burnDV.r**2);
  document.getElementById('dv-total')!.textContent = `ΔV TOTAL: ${total.toFixed(2)} km/s`;
  document.getElementById('dv-breakdown')!.textContent =
    `P:${burnDV.p >= 0 ? '+' : ''}${burnDV.p.toFixed(1)}  N:${burnDV.n >= 0 ? '+' : ''}${burnDV.n.toFixed(1)}  R:${burnDV.r >= 0 ? '+' : ''}${burnDV.r.toFixed(1)}`;
}

export function updateGizmo(): void {
  if (!burnModeActive || selectedId < 0) return;
  const ast = asteroidData[selectedId];
  let state: any;
  try {
    if (currentBurnElements) {
      state = kep2cartJS( // TODO: import from src/physics/kepler.ts
        currentBurnElements.a, currentBurnElements.e,
        currentBurnElements.i, currentBurnElements.Om,
        currentBurnElements.w, currentBurnElements.M0,
        currentBurnElements.epoch_JD, currentJD // TODO: import currentJD from src/time/state.ts
      );
    } else {
      state = kep2cartJS(ast.a, ast.e, ast.i*DEG, ast.om*DEG, ast.w*DEG, ast.ma*DEG, ast.epoch, currentJD);
      // TODO: import DEG from src/physics/constants.ts
    }
  } catch(_) { return; }

  gizmoGroup.position.set(state.x, state.y, state.z);

  const rv = new THREE.Vector3(state.x, state.y, state.z); // TODO: import THREE from 'three'
  const vv = new THREE.Vector3(state.vx, state.vy, state.vz);
  if (vv.lengthSq() < 1e-20) return;

  const v_hat = vv.clone().normalize();
  const h_hat = new THREE.Vector3().crossVectors(rv, vv).normalize();
  const r_hat = rv.clone().normalize();

  const up = new THREE.Vector3(0, 1, 0);
  arrowPrograde.quaternion.setFromUnitVectors(up, v_hat); // TODO: import arrowPrograde, arrowNormal, arrowRadial from src/renderer/burn-visuals.ts
  arrowNormal.quaternion.setFromUnitVectors(up, h_hat);
  arrowRadial.quaternion.setFromUnitVectors(up, r_hat);

  const scale = camera.position.distanceTo(gizmoGroup.position) * 0.12; // TODO: import camera from src/renderer/scene.ts
  gizmoGroup.scale.setScalar(Math.max(0.05, scale));
}

export function previewBurn(): void {
  if (selectedId < 0) return;
  const total = Math.sqrt(burnDV.p**2 + burnDV.n**2 + burnDV.r**2);
  if (total < 0.001) {
    newOrbitLine.visible = false;
    originalOrbitLine.visible = false;
    burnMarker.visible = false;
    currentBurnElements = null;
    return;
  }

  const ast = asteroidData[selectedId];
  const newEl = applyBurnJS(ast, burnDV.p, burnDV.n, burnDV.r, currentJD); // TODO: import from src/physics/kepler.ts
  if (!newEl || newEl.a <= 0 || newEl.e >= 1) return;
  currentBurnElements = newEl;

  drawOrbitEllipse(ast); // TODO: import from src/renderer/orbits.ts
  // Copy original orbit to originalOrbitLine
  const origEl = {
    a: ast.a, e: ast.e, i: ast.i*DEG, Om: ast.om*DEG, w: ast.w*DEG, M0: ast.ma*DEG, epoch_JD: ast.epoch
  };
  drawOrbitFromElements(originalOrbitLine, origEl); // TODO: import from src/renderer/orbits.ts
  drawOrbitFromElements(newOrbitLine, newEl);
  orbitLine.visible = false;

  // Burn marker at current asteroid position
  const s = kep2cartJS(ast.a, ast.e, ast.i*DEG, ast.om*DEG, ast.w*DEG, ast.ma*DEG, ast.epoch, currentJD);
  burnMarker.position.set(s.x, s.y, s.z);
  burnMarker.visible = true;

  // Request worker to compute MOID and period changes
  postApplyBurn({ // TODO: import from src/workers/physics/client.ts
    elements: origEl,
    jd: currentJD,
    dv_p: burnDV.p,
    dv_n: burnDV.n,
    dv_r: burnDV.r,
    preview: true,
  });
}

export function onBurnResult(data: any): void {
  lastBurnResult = data;
  const ast = asteroidData[selectedId];
  if (!ast) return;

  document.getElementById('burn-panel')!.style.display = 'block';

  const origPeriod = data.orig_period_days;
  const newPeriod = data.period_days;

  document.getElementById('bp-a-before')!.textContent = `${ast.a.toFixed(3)} AU`;
  document.getElementById('bp-a-after')!.textContent = `${data.elements.a.toFixed(3)} AU`;
  document.getElementById('bp-e-before')!.textContent = ast.e.toFixed(4);
  document.getElementById('bp-e-after')!.textContent = data.elements.e.toFixed(4);
  document.getElementById('bp-i-before')!.textContent = `${ast.i.toFixed(2)}°`;
  document.getElementById('bp-i-after')!.textContent = `${(data.elements.i / DEG).toFixed(2)}°`; // TODO: import DEG from src/physics/constants.ts
  document.getElementById('bp-T-before')!.textContent = origPeriod ? `${origPeriod.toFixed(0)}d` : '—';
  document.getElementById('bp-T-after')!.textContent = newPeriod ? `${newPeriod.toFixed(0)}d` : '—';
  document.getElementById('bp-moid-before')!.textContent = ast.moid ? `${Number(ast.moid).toFixed(3)} AU` : '—';
  document.getElementById('bp-moid-after')!.textContent = data.moid_approx != null ? `${data.moid_approx.toFixed(3)} AU` : '—';

  const total = Math.sqrt(burnDV.p**2 + burnDV.n**2 + burnDV.r**2);
  document.getElementById('bp-dv')!.textContent = `${total.toFixed(2)} km/s`;
  document.getElementById('bp-fuel')!.textContent = tsiolkovsky(total); // TODO: import from src/physics/rocket.ts

  // Request close approach scan
  const origEl = { a: ast.a, e: ast.e, i: ast.i*DEG, Om: ast.om*DEG, w: ast.w*DEG, M0: ast.ma*DEG, epoch_JD: ast.epoch };
  postCloseApproachScan({ elements: data.elements, jd_start: currentJD, years: 5 }); // TODO: import from src/workers/physics/client.ts

  // Update orbit delta labels
  updateOrbitLabels(data.elements); // TODO: import from src/ui/hud/burn-labels.ts
}

export function onCloseApproaches(results: any[]): void {
  if (results && results.length > 0) {
    const best = results[0];
    document.getElementById('bp-approach')!.textContent = `${jdToDate(best.jd)} (${best.dist.toFixed(3)} AU)`; // TODO: import jdToDate from src/utils/time.ts
  } else {
    document.getElementById('bp-approach')!.textContent = 'None within 5yr';
  }
}

export function updateOrbitLabels(newEl: any): void {
  // Find perihelion point of new orbit and project to screen
  if (!newEl) { hideOrbitLabels(); return; } // TODO: import from src/ui/hud/burn-labels.ts
  const perihelion = kep2cartJS(newEl.a, newEl.e, newEl.i, newEl.Om, newEl.w, 0, newEl.epoch_JD, newEl.epoch_JD);
  const period = TWO_PI * Math.sqrt(newEl.a**3 / GM_AU3_S2) / 86400; // TODO: import TWO_PI, GM_AU3_S2 from src/physics/constants.ts
  const ast = asteroidData[selectedId];

  const pv = new THREE.Vector3(perihelion.x, perihelion.y, perihelion.z);
  pv.project(camera);
  const sx = (pv.x * 0.5 + 0.5) * window.innerWidth;
  const sy = (-pv.y * 0.5 + 0.5) * window.innerHeight;

  const lPeri = document.getElementById('label-perihelion')!;
  const lPeriod = document.getElementById('label-period')!;
  lPeri.style.display = 'block';
  lPeri.style.left = sx + 'px';
  lPeri.style.top = (sy - 14) + 'px';
  lPeri.textContent = `q=${( newEl.a*(1-newEl.e) ).toFixed(3)} AU`;

  const origPeriod = TWO_PI * Math.sqrt(ast.a**3 / GM_AU3_S2) / 86400;
  const dPeriod = period - origPeriod;
  lPeriod.style.display = 'block';
  lPeriod.style.left = sx + 'px';
  lPeriod.style.top = (sy - 28) + 'px';
  lPeriod.textContent = `T${dPeriod >= 0 ? '+' : ''}${dPeriod.toFixed(0)}d`;
}

export function hideOrbitLabels(): void {
  ['label-perihelion','label-period','label-moid'].forEach(id => {
    document.getElementById(id)!.style.display = 'none';
  });
}

// ─── Module-level declarations for cross-module deps ─────────────────────────
// TODO: replace all declares below with real imports once modules are extracted

declare const THREE: any;
declare const camera: any;
declare let burnModeActive: boolean;
declare let burnDV: { p: number; n: number; r: number };
declare let currentBurnElements: any;
declare let lastBurnResult: any;
declare let dragAxis: string | null;
declare let dragStartScreen: any;
declare let dragStartDV: number;
declare let selectedId: number;
declare let asteroidData: any[];
declare let currentJD: number;
declare let gizmoGroup: any;
declare let arrowPrograde: any;
declare let arrowNormal: any;
declare let arrowRadial: any;
declare let newOrbitLine: any;
declare let originalOrbitLine: any;
declare let burnMarker: any;
declare let ghostOriginal: any;
declare let ghostNew: any;
declare let burnOrbitLines: any[];
declare let orbitLine: any;
declare const DEG: number;
declare const TWO_PI: number;
declare const GM_AU3_S2: number;
declare function kep2cartJS(...args: any[]): any;
declare function applyBurnJS(...args: any[]): any;
declare function drawOrbitEllipse(ast: any): void;
declare function drawOrbitFromElements(line: any, el: any): void;
declare function postApplyBurn(params: any): void;
declare function postCloseApproachScan(params: any): void;
declare function tsiolkovsky(dv: number): string;
declare function jdToDate(jd: number): string;
declare function updateOrbitLabels(el: any): void;
