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

// @ts-ignore — runtime global during transition
declare const mpBurns: Array<{ label: string; jd: number; dv_kms: number }>;
// @ts-ignore — runtime global during transition
declare let burns: Array<{ dv_p: number; dv_n: number; dv_r: number; jd: number }>;
// @ts-ignore — runtime global during transition
declare let activeBurnIdx: number;
// @ts-ignore — runtime global during transition
declare let burnDV: { p: number; n: number; r: number };
// @ts-ignore — runtime global during transition
declare let currentBurnElements: unknown;
// @ts-ignore — runtime global during transition
declare const currentJD: number;
// @ts-ignore — runtime global during transition
declare const MAX_BURNS: number;
// @ts-ignore — runtime global during transition
declare const BURN_COLORS: number[];
// @ts-ignore — runtime global during transition
declare const SPACECRAFT: Record<string, { isp: number; dry_kg: number }>;
// @ts-ignore — runtime global during transition
declare const missionConfig: { spacecraft: string };
// @ts-ignore — runtime global during transition
declare const optimalTrajectory: unknown;
// @ts-ignore — runtime global during transition
declare const burnVectorArrows: unknown[];
// @ts-ignore — runtime global during transition
declare const burnOrbitLines: Array<{ visible: boolean }>;
// @ts-ignore — runtime global during transition
declare const newOrbitLine: { visible: boolean };
// @ts-ignore — runtime global during transition
declare const originalOrbitLine: { visible: boolean };
// @ts-ignore — runtime global during transition
declare function jdToDate(jd: number): string;
// @ts-ignore — runtime global during transition
declare function propellantKgNum(dv: number, isp: number, dryKg: number): number;
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
// @ts-ignore — runtime global during transition
declare let selectedId: number;

// ─── Mission-Planner burn table (mpBurns[]) ──────────────────────────────────

/**
 * Re-renders the mp-burn-table element from the current mpBurns array.
 * Source: index.html lines 5539–5551
 */
export function renderBurnEditTable(): void {
  const el = document.getElementById('mp-burn-table');
  if (!el) return;
  el.innerHTML = '<div class="mp-burn-row" style="font-size:8px;color:#4b5563;border-bottom:1px solid #1a2235;padding-bottom:3px;margin-bottom:4px"><span></span><span>BURN</span><span style="text-align:right">DATE</span><span style="text-align:right">ΔV km/s</span><span></span></div>' +
    // @ts-ignore — runtime global during transition
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
  // @ts-ignore — runtime global during transition
  mpBurns[idx].dv_kms = parseFloat(val) || 0;
  updateMpBurnTotals();
  if (optimalTrajectory && burnVectorArrows.length) drawBurnVectors(optimalTrajectory);
}

/**
 * Removes a burn entry from mpBurns[] by index and re-renders the table.
 * Source: index.html lines 5559–5562
 */
export function removeMpBurn(idx: number): void {
  // @ts-ignore — runtime global during transition
  mpBurns.splice(idx, 1);
  renderBurnEditTable();
}

/**
 * Recomputes and updates the total-ΔV and total-fuel footer display.
 * Source: index.html lines 5564–5572
 */
export function updateMpBurnTotals(): void {
  // @ts-ignore — runtime global during transition
  const sc = SPACECRAFT[missionConfig.spacecraft] || SPACECRAFT.medium;
  // @ts-ignore — runtime global during transition
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
  // @ts-ignore — runtime global during transition
  const lastJD = mpBurns.length ? mpBurns[mpBurns.length-1].jd + 15 : currentJD;
  // @ts-ignore — runtime global during transition
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
  // @ts-ignore — runtime global during transition
  if (burns.length === 0) {
    container.innerHTML = '<div style="font-size:10px;color:#4b5563;padding:6px 0">NO BURNS SAVED</div>';
    const totalEl = document.getElementById('total-dv-val');
    if (totalEl) totalEl.textContent = '0.0';
    return;
  }

  let totalDV = 0;
  // @ts-ignore — runtime global during transition
  container.innerHTML = burns.map((b: { dv_p: number; dv_n: number; dv_r: number; jd: number }, i: number) => {
    const dv = Math.sqrt(b.dv_p**2 + b.dv_n**2 + b.dv_r**2);
    totalDV += dv;
    // @ts-ignore — runtime global during transition
    const colorHex = '#' + BURN_COLORS[i].toString(16).padStart(6, '0');
    // @ts-ignore — runtime global during transition
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
  // @ts-ignore — runtime global during transition
  if (burns.length >= MAX_BURNS) return;
  if (selectedId < 0) return;
  // @ts-ignore — runtime global during transition
  const total = Math.sqrt(burnDV.p**2 + burnDV.n**2 + burnDV.r**2);
  if (total < 0.001) return;
  // @ts-ignore — runtime global during transition
  burns.push({ dv_p: burnDV.p, dv_n: burnDV.n, dv_r: burnDV.r, jd: currentJD });
  // @ts-ignore — runtime global during transition
  activeBurnIdx = burns.length - 1;
  // @ts-ignore — runtime global during transition
  burnDV = { p: 0, n: 0, r: 0 };
  // @ts-ignore — runtime global during transition
  currentBurnElements = computeMultiBurnElements(activeBurnIdx);
  renderBurnList();
  recomputeAllBurnOrbits();
  updateBurnUI();
}

/**
 * Clears all gizmo burns and resets visual state.
 * Wired to btn-clear-burns in index.html (lines 7212–7221).
 */
export function clearGizmoBurns(): void {
  // @ts-ignore — runtime global during transition
  burns = [];
  // @ts-ignore — runtime global during transition
  activeBurnIdx = -1;
  // @ts-ignore — runtime global during transition
  currentBurnElements = null;
  // @ts-ignore — runtime global during transition
  burnOrbitLines.forEach((l: { visible: boolean }) => { l.visible = false; });
  // @ts-ignore — runtime global during transition
  newOrbitLine.visible = false;
  // @ts-ignore — runtime global during transition
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
      // @ts-ignore — runtime global during transition
      burns.splice(idx, 1);
      // @ts-ignore — runtime global during transition
      if (activeBurnIdx >= burns.length) activeBurnIdx = burns.length - 1;
      renderBurnList();
      recomputeAllBurnOrbits();
      return;
    }
    const item = target.closest('.burn-item');
    if (item) {
      // @ts-ignore — runtime global during transition
      activeBurnIdx = parseInt((item as HTMLElement).dataset.idx ?? '0');
      renderBurnList();
    }
  });
}
