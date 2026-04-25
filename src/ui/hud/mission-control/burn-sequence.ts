/**
 * Multi-burn sequence management for the mission planner.
 *
 * Source: index.html lines 5539–5572, 7119–7122, 7198–7238, 7272–7293
 *
 * Covers:
 *   - renderBurnEditTable()  — renders the mp-burn-table for mission-planner burns (mpBurns[])
 *   - onMpBurnChange()       — updates a single mpBurn ΔV and refreshes totals / 3D vectors
 *   - removeMpBurn()         — splices a burn from mpBurns[] and re-renders the table
 *   - updateMpBurnTotals()   — recomputes total ΔV and propellant display in the planner footer
 *   - addMpBurn()            — appends a new MCC burn entry (wired to btn-mp-add-burn)
 *   - renderBurnList()       — renders the gizmo-mode burn-list sidebar (burns[])
 *   - addGizmoBurn()         — appends a confirmed gizmo burn to burns[] (wired to btn-add-burn)
 *   - clearGizmoBurns()      — clears burns[] (wired to btn-clear-burns)
 *   - initBurnListEvents()   — wires click-delegation for burn-list delete / activate
 */

import {
  mpBurns,
  burns,
  activeBurnIdx, setActiveBurnIdx,
  burnDV, setBurnDV,
  currentBurnElements, setCurrentBurnElements,
  MAX_BURNS, BURN_COLORS,
  burnVectorArrows,
  burnOrbitLines,
  originalOrbitLine,
  newOrbitLine,
  missionConfig,
  optimalTrajectory,
  selectedId,
} from '../../../../state/index';
import { SPACECRAFT } from '../../../../economics/mission-costs/defaults';
import { jdToDate } from '../../../../utils/dates';
import { propellantKgNum } from '../../../../economics/mission-costs/index';
import { currentJD } from '../../../../utils/time-state';

// @ts-ignore — runtime global during transition
declare function drawBurnVectors(traj: unknown): void;
// @ts-ignore — runtime global during transition
declare function computeMultiBurnElements(idx: number): unknown;
// @ts-ignore — runtime global during transition
declare function recomputeAllBurnOrbits(): void;
// @ts-ignore — runtime global during transition
declare function updateBurnUI(): void;
// @ts-ignore — runtime global during transition
declare function toggleBurnMode(): void;

// ─── Mission-Planner burn table (mpBurns[]) ──────────────────────────────────

/**
 * Re-renders the mp-burn-table element from the current mpBurns array.
 * Source: index.html lines 5539–5551
 */
export function renderBurnEditTable(): void {
  const el = document.getElementById('mp-burn-table');
  if (!el) return;
  el.innerHTML = '<div class="mp-burn-row" style="font-size:8px;color:#4b5563;border-bottom:1px solid #1a2235;padding-bottom:3px;margin-bottom:4px"><span></span><span>BURN</span><span style="text-align:right">DATE</span><span style="text-align:right">ΔV km/s</span><span></span></div>' +
    mpBurns.map((b: { label: string; jd: number; dv_kms: number }, i: number) => `<div class="mp-burn-row">
      <span style="color:#4b5563">${i+1}</span>
      <span style="font-size:8px;color:#6a8a9a;overflow:hidden;text-overflow:ellipsis">${b.label}</span>
      <span style="font-size:8px;color:#4b5563;text-align:right">${jdToDate(b.jd).slice(0,7)}</span>
      <input type="number" step="0.001" min="0" max="30" value="${b.dv_kms.toFixed(3)}"
        onchange="onMpBurnChange(${i},this.value)">
      <button onclick="removeMpBurn(${i})" style="background:transparent;border:none;color:#4b5563;cursor:pointer;font-size:11px;padding:0">✕</button>
    </div>`).join('');
  updateMpBurnTotals();
}

/**
 * Handles ΔV input changes for a mission-planner burn entry.
 * Source: index.html lines 5553–5557
 */
export function onMpBurnChange(idx: number, val: string): void {
  mpBurns[idx].dv_kms = parseFloat(val) || 0;
  updateMpBurnTotals();
  if (optimalTrajectory && burnVectorArrows.length) drawBurnVectors(optimalTrajectory);
}

/**
 * Removes a burn entry from mpBurns[] by index and re-renders the table.
 * Source: index.html lines 5559–5562
 */
export function removeMpBurn(idx: number): void {
  mpBurns.splice(idx, 1);
  renderBurnEditTable();
}

/**
 * Recomputes and updates the total-ΔV and total-fuel footer display.
 * Source: index.html lines 5564–5572
 */
export function updateMpBurnTotals(): void {
  const sc = SPACECRAFT[missionConfig.spacecraft] || SPACECRAFT.medium;
  const totalDv = mpBurns.reduce((s: number, b: { dv_kms: number }) => s + b.dv_kms, 0);
  const fuelKg  = propellantKgNum(totalDv, sc.isp, sc.dry_kg);
  const dvEl   = document.getElementById('mp-total-dv');
  const fuelEl = document.getElementById('mp-total-fuel');
  if (dvEl)   dvEl.textContent   = totalDv.toFixed(3);
  if (fuelEl) fuelEl.textContent = Math.round(fuelKg).toLocaleString();
}

/**
 * Appends a new MCC burn to mpBurns[] and re-renders the table.
 * Intended to be called from the btn-mp-add-burn click handler.
 * Source: index.html lines 7119–7123
 */
export function addMpBurn(): void {
  const lastJD = mpBurns.length ? mpBurns[mpBurns.length-1].jd + 15 : currentJD;
  mpBurns.push({ label:`${mpBurns.length+1} · MCC`, jd:lastJD, dv_kms:0.050 });
  renderBurnEditTable();
}

// ─── Gizmo-mode burn list (burns[]) ──────────────────────────────────────────

/**
 * Re-renders the gizmo-mode burn-list sidebar from the current burns array.
 * Source: index.html lines 7272–7293
 */
export function renderBurnList(): void {
  const container = document.getElementById('burn-list');
  if (!container) return;
  if (burns.length === 0) {
    container.innerHTML = '<div style="font-size:10px;color:#4b5563;padding:6px 0">NO BURNS SAVED</div>';
    const totalEl = document.getElementById('total-dv-val');
    if (totalEl) totalEl.textContent = '0.0';
    return;
  }

  let totalDV = 0;
  container.innerHTML = burns.map((b: { dv_p: number; dv_n: number; dv_r: number; jd: number }, i: number) => {
    const dv = Math.sqrt(b.dv_p**2 + b.dv_n**2 + b.dv_r**2);
    totalDV += dv;
    const colorHex = '#' + BURN_COLORS[i].toString(16).padStart(6, '0');
    return `<div class="burn-item ${i === activeBurnIdx ? 'active-burn' : ''}" data-idx="${i}" style="border-left-color:${colorHex}">
      <span class="bi-num" style="color:${colorHex}">#${i+1}</span>
      <span class="bi-date">${jdToDate(b.jd)}</span>
      <span class="bi-dv">${dv.toFixed(1)} km/s</span>
      <button class="bi-del" data-idx="${i}">✕</button>
    </div>`;
  }).join('');
  const totalEl = document.getElementById('total-dv-val');
  if (totalEl) totalEl.textContent = totalDV.toFixed(2);
}

/**
 * Confirms the current gizmo ΔV as a new burn entry in burns[].
 * Wired to btn-add-burn in index.html (lines 7198–7210).
 */
export function addGizmoBurn(): void {
  if (burns.length >= MAX_BURNS) return;
  if (selectedId < 0) return;
  const total = Math.sqrt(burnDV.p**2 + burnDV.n**2 + burnDV.r**2);
  if (total < 0.001) return;
  burns.push({ dv_p: burnDV.p, dv_n: burnDV.n, dv_r: burnDV.r, jd: currentJD });
  setActiveBurnIdx(burns.length - 1);
  setBurnDV({ p: 0, n: 0, r: 0 });
  setCurrentBurnElements(computeMultiBurnElements(activeBurnIdx));
  renderBurnList();
  recomputeAllBurnOrbits();
  updateBurnUI();
}

/**
 * Clears all gizmo burns and resets visual state.
 * Wired to btn-clear-burns in index.html (lines 7212–7221).
 */
export function clearGizmoBurns(): void {
  burns.length = 0;
  setActiveBurnIdx(-1);
  setCurrentBurnElements(null);
  burnOrbitLines.forEach((l: { visible: boolean }) => { l.visible = false; });
  newOrbitLine.visible = false;
  originalOrbitLine.visible = false;
  renderBurnList();
  updateBurnUI();
}

/**
 * Wires click-delegation on the burn-list container for delete and activate actions.
 * Wired to the burn-list element in index.html (lines 7223–7238).
 */
export function initBurnListEvents(): void {
  const list = document.getElementById('burn-list');
  if (!list) return;
  list.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const del = target.closest('.bi-del');
    if (del) {
      const idx = parseInt((del as HTMLElement).dataset.idx ?? '0');
      burns.splice(idx, 1);
      if (activeBurnIdx >= burns.length) setActiveBurnIdx(burns.length - 1);
      renderBurnList();
      recomputeAllBurnOrbits();
      return;
    }
    const item = target.closest('.burn-item');
    if (item) {
      setActiveBurnIdx(parseInt((item as HTMLElement).dataset.idx ?? '0'));
      renderBurnList();
    }
  });
}
