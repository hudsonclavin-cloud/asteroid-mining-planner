// TODO: import THREE from 'three'
// TODO: import { renderer, camera, controls, raycaster } from 'src/renderer/scene.ts'
// TODO: import { asteroidData, asteroidCount, asteroidMesh, visibleScale, positionCache, selectedId, selectedAsteroidKey } from 'src/data/catalog.ts'
// TODO: import { earthLayerActive, satelliteMesh, satelliteData } from 'src/ui/hud/earth-layer.ts'
// TODO: import { flyTarget } from 'src/renderer/camera.ts'
// TODO: import { burnModeActive, cancelBurn } from 'src/ui/hud/mission-control/burn-mode.ts'
// TODO: import { computeFeasibilityMetrics, computeEconomicsSummary, resolveAsteroidEconomics, computeWholeBodyValueSummary, computeMissionCost } from 'src/physics/feasibility.ts'
// TODO: import { COMPOSITIONS, getMatSpec } from 'src/data/compositions.ts'
// TODO: import { fmtUSD, formatValueDisplay, formatNhatsMetric, getPriceSourceLabel, getCatalogSourceLabel } from 'src/utils/format.ts'
// TODO: import { showUncPopup, hideUncPopup, dvUncHtml, costUncHtml } from 'src/ui/overlays/popups.ts'
// TODO: import { drawOrbitEllipse, updateOrbitEllipse, hoverOrbitLine, hideHoverEllipse, orbitLine, nhatsRing } from 'src/renderer/orbits.ts'
// TODO: import { trailsEnabled, clearTrail, updateOrbitEllipse as updateTrail } from 'src/renderer/trails.ts'
// TODO: import { renderLeaderboard } from 'src/ui/panels/left/leaderboard.ts'
// TODO: import { renderEconomicsTab, renderMaterialsTab } from 'src/ui/panels/right/tabs.ts'
// TODO: import { fetchResearch } from 'src/data/research.ts'
// TODO: import { updateToolbarHUD } from 'src/ui/hud/toolbar.ts'
// TODO: import { missionPlanningActive } from 'src/ui/hud/mission-control/state.ts'
// TODO: import { hasNhatsPlannerMismatch } from 'src/data/nhats.ts'
// TODO: import { filteredIds, asteroidCount as totalCount } from 'src/data/filters.ts'

// ─── Selection constants ──────────────────────────────────────────────────────
const CLICK_THRESHOLD_PX = 14;
const _clickMat4 = new THREE.Matrix4(); // TODO: import THREE from 'three'
const _clickVec3 = new THREE.Vector3(); // TODO: import THREE from 'three'

/**
 * Find the closest asteroid or satellite to the given screen coordinates,
 * within CLICK_THRESHOLD_PX pixels.
 */
export function findClosestObjectToClick(
  clientX: number,
  clientY: number
): { id: number; type: 'asteroid' | 'satellite' } {
  const rect = renderer.domElement.getBoundingClientRect(); // TODO: import renderer from src/renderer/scene.ts
  let bestDist = CLICK_THRESHOLD_PX, bestId = -1, bestType: 'asteroid' | 'satellite' = 'asteroid';

  // Check asteroids (skip filtered-out)
  if (asteroidMesh && asteroidCount > 0) {
    for (let i = 0; i < asteroidCount; i++) {
      if (visibleScale.length > i && visibleScale[i] < 0.01) continue;
      asteroidMesh.getMatrixAt(i, _clickMat4);
      _clickVec3.setFromMatrixPosition(_clickMat4);
      const p = _clickVec3.clone().project(camera); // TODO: import camera from src/renderer/scene.ts
      if (p.z > 1) continue;
      const sx = (p.x*0.5+0.5)*rect.width, sy = (-p.y*0.5+0.5)*rect.height;
      const d = Math.sqrt((clientX-rect.left-sx)**2 + (clientY-rect.top-sy)**2);
      if (d < bestDist) { bestDist=d; bestId=i; bestType='asteroid'; }
    }
  }

  // Check satellites when Earth layer active
  if (earthLayerActive && satelliteMesh && satelliteData.length > 0) { // TODO: import from src/ui/hud/earth-layer.ts
    const count = Math.min(satelliteData.length, 8000);
    for (let i = 0; i < count; i++) {
      satelliteMesh.getMatrixAt(i, _clickMat4);
      _clickVec3.setFromMatrixPosition(_clickMat4);
      const p = _clickVec3.clone().project(camera);
      if (p.z > 1) continue;
      const sx = (p.x*0.5+0.5)*rect.width, sy = (-p.y*0.5+0.5)*rect.height;
      const d = Math.sqrt((clientX-rect.left-sx)**2 + (clientY-rect.top-sy)**2);
      if (d < bestDist) { bestDist=d; bestId=i; bestType='satellite'; }
    }
  }

  return { id: bestId, type: bestType };
}

/**
 * Select an asteroid by index, populating the right panel with its data.
 */
export function selectAsteroid(id: number): void {
  selectedId = id;
  const ast = asteroidData[id];
  selectedAsteroidKey = ast ? ((ast.pdes || ast.full_name || '').trim() || null) : null;
  clearTrail(); // TODO: import from src/renderer/trails.ts
  if (!ast) return;

  const name = ast.full_name || ast.pdes || ast.name || '—';
  const spec = (ast.spec || ast.spec_B || ast.spec_T || ast.taxonomy || '?').trim();
  const diam = ast.diameter ? `${Number(ast.diameter).toFixed(2)} km`
    : (ast.H ? `~${(1329 / Math.sqrt(0.15) * Math.pow(10, -ast.H / 5)).toFixed(1)} km (est)` : '—');

  document.getElementById('ast-name')!.textContent = name;
  document.getElementById('ast-type')!.textContent = spec;
  document.getElementById('ast-type-note')!.textContent = spec && spec !== '?'
    ? 'spectral taxonomy; composition remains uncertain'
    : 'spectral taxonomy unavailable';
  document.getElementById('ast-diam')!.textContent = diam;
  document.getElementById('ast-sma')!.textContent = Number.isFinite(Number(ast.a)) ? `${Number(ast.a).toFixed(4)} AU` : '—';
  document.getElementById('ast-ecc')!.textContent = Number.isFinite(Number(ast.e)) ? Number(ast.e).toFixed(5) : '—';
  document.getElementById('ast-inc')!.textContent = Number.isFinite(Number(ast.i)) ? `${Number(ast.i).toFixed(3)}°` : '—';
  const fi_early = computeFeasibilityMetrics(ast); // TODO: import from src/physics/feasibility.ts
  const dv_val   = fi_early.deltaV.value;
  const dv_unc   = fi_early.deltaV.uncertainty;
  document.getElementById('ast-dv')!.textContent = `${dv_val.toFixed(2)} (±${dv_unc}) km/s`;
  const dvIcon = document.getElementById('ast-dv-icon');
  if (dvIcon) {
    dvIcon.style.display = 'inline-block';
    dvIcon.onclick = e => { e!.stopPropagation(); showUncPopup(dvIcon, dvUncHtml(fi_early)); }; // TODO: import from src/ui/overlays/popups.ts
    dvIcon.onmouseleave = () => hideUncPopup(300);
  }
  document.getElementById('ast-moid')!.textContent = Number.isFinite(Number(ast.moid)) ? `${Number(ast.moid).toFixed(4)} AU` : '—';
  document.getElementById('ast-last-obs')!.textContent = ast.last_obs || 'unknown';
  document.getElementById('ast-cond-code')!.textContent = ast.condition_code !== null && ast.condition_code !== undefined ? String(ast.condition_code) : 'unknown';
  document.getElementById('ast-source')!.textContent = getCatalogSourceLabel(ast); // TODO: import from src/utils/format.ts
  // Phase 3: composition + resource value + score
  const spec3 = (ast.spec || ast.spec_B || ast.spec_T || ast.taxonomy || '').trim().charAt(0).toUpperCase();
  const mappedSpec = getMatSpec(ast); // TODO: import from src/data/compositions.ts
  const compText = COMPOSITIONS[spec3] // TODO: import COMPOSITIONS from src/data/compositions.ts
    || (mappedSpec ? COMPOSITIONS[mappedSpec] : null)
    || ((ast.spec || ast.spec_B || ast.spec_T || ast.taxonomy) ? 'Composition model not available' : 'No composition data');
  document.getElementById('ast-composition')!.textContent = compText;

  const econ3 = resolveAsteroidEconomics(ast); // TODO: import from src/physics/feasibility.ts
  const massModel3 = econ3.massModel;
  const wholeBody3 = computeWholeBodyValueSummary(ast); // TODO: import from src/physics/feasibility.ts

  const displayPrice  = econ3.extractableValueUsd;
  const displayProfit = econ3.rawProfitUsd;
  document.getElementById('ast-value-source')!.textContent = `${econ3.extractableValueSource}; ${getPriceSourceLabel()}`;
  document.getElementById('ast-resource-model')!.textContent = massModel3
    ? `${massModel3.spec}-type density model, H/diameter-derived mass`
    : 'unknown size or spectral model';
  document.getElementById('ast-price')!.textContent  = formatValueDisplay(displayPrice); // TODO: import from src/utils/format.ts
  document.getElementById('ast-profit')!.textContent = formatValueDisplay(displayProfit);

  document.getElementById('ast-water-val')!.textContent = formatValueDisplay(wholeBody3.waterValueUsd);
  document.getElementById('ast-metal-val')!.textContent = formatValueDisplay(wholeBody3.metalValueUsd);
  document.getElementById('ast-total-val')!.textContent = formatValueDisplay(wholeBody3.totalValueUsd);
  const fi = fi_early; // reuse already-computed metrics
  const dvDisp  = `${fi.deltaV.value.toFixed(2)} km/s (±${fi.deltaV.uncertainty})`;
  const durDisp = `${Math.round(fi.duration.value)} days  [${fi.duration.source}]`;
  const accDisp = fi.accessibility.nhatsVerified
    ? `✓ ${fi.accessibility.trajectoryCount} NHATS trajectories${hasNhatsPlannerMismatch(ast) ? ' · exceeds 10 km/s planner gate' : ''}` // TODO: import hasNhatsPlannerMismatch from src/data/nhats.ts
    : 'Not in NHATS catalog';
  const valLo_fi = fi.valueRange.conservative, valHi_fi = fi.valueRange.optimistic;
  const valDisp = valHi_fi !== null ? `${fmtUSD(valLo_fi)} – ${fmtUSD(valHi_fi)}` : 'unknown'; // TODO: import fmtUSD from src/utils/format.ts
  const hazDisp = fi.hazard.riskLevel === 'high' ? '⚠ PHA (high)'
                : fi.hazard.riskLevel === 'low'  ? `Low (MOID ${fi.hazard.moid?.toFixed(3)} AU)`
                : fi.hazard.riskLevel === 'unknown' ? 'unknown'
                : fi.hazard.moid !== null          ? `None (MOID ${fi.hazard.moid?.toFixed(3)} AU)`
                : 'None';
  const fiDvEl = document.getElementById('fi-dv')!;
  fiDvEl.innerHTML = `ΔV: ${dvDisp} [${fi.deltaV.source}] <span class="unc-icon" id="fi-dv-icon">ⓘ</span>`;
  const fiDvIcon = document.getElementById('fi-dv-icon');
  if (fiDvIcon) {
    fiDvIcon.onclick = e => { e!.stopPropagation(); showUncPopup(fiDvIcon, dvUncHtml(fi)); };
    fiDvIcon.onmouseleave = () => hideUncPopup(300);
  }
  document.getElementById('fi-dur')!.textContent    = 'TOF: ' + durDisp;
  document.getElementById('fi-access')!.textContent = 'PATHS: ' + accDisp;
  document.getElementById('fi-value')!.textContent  = 'VALUE: ' + valDisp;
  document.getElementById('fi-hazard')!.textContent = 'HAZARD: ' + hazDisp;
  document.getElementById('feasibility-card')!.style.display = 'block';

  const nhatsBadge = document.getElementById('nhats-badge')!;
  if (ast.nhats?.accessible) {
    const occText = ast.nhats.occ ? `  ·  OCC: ${ast.nhats.occ}` : '';
    document.getElementById('nhats-details')!.textContent =
      `Min ΔV: ${formatNhatsMetric(ast.nhats.minDv, 'dv', 2)} km/s  ·  Duration: ${formatNhatsMetric(ast.nhats.minDur, 'dur', 0)}d  ·  Trajectories: ${ast.nhats.nTrajectories}${occText}`;
    nhatsBadge.style.display = 'block';
  } else {
    nhatsBadge.style.display = 'none';
  }

  // Reset research tab — clear stale content from previous selection
  document.getElementById('research-content')!.style.display = 'none';
  document.getElementById('research-meta')!.style.display    = 'none';
  document.getElementById('research-error')!.style.display   = 'none';
  document.getElementById('research-loading')!.style.display = 'none';
  document.getElementById('research-prompt-hint')!.style.display = 'block';
  // Auto-fetch if research tab is already active
  if (document.querySelector('.tab-btn[data-tab="research"]')?.classList.contains('active')) {
    fetchResearch(ast); // TODO: import from src/data/research.ts
  }

  const des3 = ast.pdes || ast.full_name || '';
  (document.getElementById('link-jpl') as HTMLAnchorElement).href =
    `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(des3)}`;
  (document.getElementById('link-papers') as HTMLAnchorElement).href =
    `https://www.semanticscholar.org/search?q=${encodeURIComponent(ast.full_name || des3)}&sort=Relevance`;

  document.getElementById('panel-idle')!.style.display = 'none';
  document.getElementById('panel-data')!.style.display = 'flex';

  // Auto-render active tab content on asteroid change
  const activeTab = document.querySelector('.tab-btn.active') as HTMLElement | null;
  if (activeTab && activeTab.dataset.tab === 'economics') {
    renderEconomicsTab(id); // TODO: import from src/ui/panels/right/tabs.ts
  }
  if (activeTab && activeTab.dataset.tab === 'materials') {
    renderMaterialsTab(id); // TODO: import from src/ui/panels/right/tabs.ts
  }

  renderLeaderboard(); // TODO: import from src/ui/panels/left/leaderboard.ts
  drawOrbitEllipse(ast); // TODO: import from src/renderer/orbits.ts
  hoverOrbitLine.visible = false; // clear hover preview when selection confirmed

  // Exit burn mode on new selection
  if (burnModeActive) cancelBurn(); // TODO: import from src/ui/hud/mission-control/burn-mode.ts

  hideHoverEllipse(); // TODO: import from src/renderer/orbits.ts
  if (trailsEnabled) updateOrbitEllipse(ast); // TODO: import from src/renderer/trails.ts

  // Slide-in right panel
  document.getElementById('right-panel')!.classList.add('panel-open');

  // Gentle camera nudge toward selected asteroid
  if (positionCache.length > id * 3 + 2) {
    const tx = positionCache[id*3], ty = positionCache[id*3+1], tz = positionCache[id*3+2];
    const camDist = camera.position.length();
    camera.position.lerp(new THREE.Vector3(tx, ty, tz).normalize().multiplyScalar(camDist * 0.92), 0.08);
    controls.target.lerp(new THREE.Vector3(tx * 0.1, ty * 0.1, tz * 0.1), 0.1); // TODO: import controls from src/renderer/scene.ts
    controls.update();
  }

  updateToolbarHUD(); // TODO: import from src/ui/hud/toolbar.ts
}

/**
 * Move the camera fly-target to the given asteroid index's cached position.
 */
export function flyTo(astIdx: number): void {
  if (!positionCache.length) return;
  const x = positionCache[astIdx*3], y = positionCache[astIdx*3+1], z = positionCache[astIdx*3+2];
  flyTarget = { x, y, z, dist: 2, progress: 0 }; // TODO: import flyTarget setter from src/renderer/camera.ts
}

// ─── Module-level declarations for cross-module deps ─────────────────────────
// TODO: replace all declares below with real imports once modules are extracted

declare const THREE: any;
declare const renderer: any;
declare const camera: any;
declare const controls: any;
declare let asteroidMesh: any;
declare let asteroidCount: number;
declare let visibleScale: Float32Array;
declare let positionCache: Float32Array;
declare let asteroidData: any[];
declare let selectedId: number;
declare let selectedAsteroidKey: string | null;
declare let earthLayerActive: boolean;
declare let satelliteMesh: any;
declare let satelliteData: any[];
declare let flyTarget: any;
declare let burnModeActive: boolean;
declare let trailsEnabled: boolean;
declare let hoverOrbitLine: any;
declare let orbitLine: any;
declare let nhatsRing: any;
declare function cancelBurn(): void;
declare function clearTrail(): void;
declare function updateOrbitEllipse(ast: any): void;
declare function drawOrbitEllipse(ast: any): void;
declare function hideHoverEllipse(): void;
declare function computeFeasibilityMetrics(ast: any): any;
declare function resolveAsteroidEconomics(ast: any): any;
declare function computeWholeBodyValueSummary(ast: any): any;
declare function computeMissionCost(cost: number, unc: any): any;
declare const COMPOSITIONS: Record<string, string>;
declare function getMatSpec(ast: any): string | null;
declare function fmtUSD(v: number): string;
declare function formatValueDisplay(v: number): string;
declare function formatNhatsMetric(v: any, type: string, dec: number): string;
declare function getPriceSourceLabel(): string;
declare function getCatalogSourceLabel(ast: any): string;
declare function showUncPopup(el: HTMLElement, html: string): void;
declare function hideUncPopup(delay: number): void;
declare function dvUncHtml(fi: any): string;
declare function costUncHtml(rng: any, unc: any, days: number): string;
declare function renderLeaderboard(): void;
declare function renderEconomicsTab(id: number): void;
declare function renderMaterialsTab(id: number): void;
declare function fetchResearch(ast: any): void;
declare function updateToolbarHUD(): void;
declare function hasNhatsPlannerMismatch(ast: any): boolean;
