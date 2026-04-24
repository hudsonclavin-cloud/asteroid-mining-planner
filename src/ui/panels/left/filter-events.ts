// src/ui/panels/left/filter-events.ts
// Stage 8b extraction — filter event wiring block
// TODO: import from src/ui/panels/left/filters —
//   applyFilters, renderLeaderboard, updateDualRangeUI, fmtSliderVal
// TODO: import from src/ui/panels/left/filter-state —
//   filterDvMin, filterDvMax, filterValMin, filterValMax,
//   filterWindowStart, filterWindowEnd, filterNHATS, filterPHA, filterWater,
//   filterSpec, lbSortMode, activePresetKey, MISSION_DV_FILTER_MAX
// TODO: import from src/ui/panels/left/presets —
//   applyPreset, saveUserPreset, populateSavedPresets,
//   clearActivePresetSelection, resetFilters, exportFilteredCatalog
// TODO: import from src/ui/panels/right/tabs —
//   renderEconomicsTab, renderMaterialsTab
// TODO: import from src/ui/panels/right/research — fetchResearchBriefing
// TODO: import from src/data — asteroidData, selectedId
// TODO: import from src/ui/hud/status — setStatus

// ─── Phase 3: Filter event wiring ─────────────────────────────────────────────

/**
 * initFilterEvents — wires all filter-panel event listeners:
 *   - Dual-range ΔV sliders
 *   - Dual-range resource value sliders (log scale)
 *   - Mission window year inputs
 *   - Spectral type chips
 *   - NHATS / PHA / Water quick-toggle buttons
 *   - Leaderboard sort dropdown
 *   - Preset dropdown + save preset button
 *   - Reset-all button
 *   - Export filtered catalog button
 *   - Right panel tab switching (inspector / economics / materials / research)
 *   - Economics dry-mass / Isp inputs
 *   - Export report button
 *   - Materials price mode toggle + refresh
 *   - Load saved presets on init
 *   - Initialize dual-range fill UI
 *
 * Must be called once after the DOM is ready and asteroid data is loaded.
 * All cross-module dependencies are listed in the TODO imports above.
 */
export function initFilterEvents(
  // TODO: replace these parameter stubs with module-level imports
  applyFilters: () => void,
  renderLeaderboard: () => void,
  updateDualRangeUI: (
    prefix: string,
    minVal: number,
    maxVal: number,
    absMin: number,
    absMax: number,
    fmtFn: (v: number) => string,
  ) => void,
  fmtSliderVal: (pos: number) => string,
  clearActivePresetSelection: () => void,
  resetFilters: () => void,
  applyPreset: (key: string) => void,
  saveUserPreset: (name: string) => void,
  populateSavedPresets: () => void,
  exportFilteredCatalog: () => void,
  renderEconomicsTab: (id: number) => void,
  renderMaterialsTab: (id: number) => void,
  fetchResearch: (ast: any) => void,
  exportMissionReport: () => void,
  fetchPrices: (force?: boolean) => Promise<void>,
  setStatus: (msg: string, autoFade: boolean) => void,
  // Mutable state refs (will be module-level vars after full refactor)
  state: {
    filterDvMin: number;
    filterDvMax: number;
    filterValMin: number;
    filterValMax: number;
    filterWindowStart: number;
    filterWindowEnd: number;
    filterNHATS: boolean;
    filterPHA: boolean;
    filterWater: boolean;
    filterSpec: Record<string, boolean>;
    lbSortMode: string;
    matPriceMode: string;
    selectedId: number;
    asteroidData: any[];
    MISSION_DV_FILTER_MAX: number;
  },
): void {
  // Dual-range ΔV
  const dvMinEl = document.getElementById('dv-min') as HTMLInputElement | null;
  const dvMaxEl = document.getElementById('dv-max') as HTMLInputElement | null;
  if (dvMinEl && dvMaxEl) {
    dvMinEl.addEventListener('input', () => {
      if (+dvMinEl.value > +dvMaxEl.value) dvMinEl.value = dvMaxEl.value;
      clearActivePresetSelection();
      state.filterDvMin = +dvMinEl.value;
      updateDualRangeUI('dv', state.filterDvMin, state.filterDvMax, 0, state.MISSION_DV_FILTER_MAX, v => v.toFixed(1) + ' km/s');
      applyFilters();
    });
    dvMaxEl.addEventListener('input', () => {
      if (+dvMaxEl.value < +dvMinEl.value) dvMaxEl.value = dvMinEl.value;
      clearActivePresetSelection();
      state.filterDvMax = +dvMaxEl.value;
      updateDualRangeUI('dv', state.filterDvMin, state.filterDvMax, 0, state.MISSION_DV_FILTER_MAX, v => v.toFixed(1) + ' km/s');
      applyFilters();
    });
  }

  // Dual-range value (log scale)
  const valMinEl = document.getElementById('val-min') as HTMLInputElement | null;
  const valMaxEl = document.getElementById('val-max') as HTMLInputElement | null;
  if (valMinEl && valMaxEl) {
    valMinEl.addEventListener('input', () => {
      if (+valMinEl.value > +valMaxEl.value) valMinEl.value = valMaxEl.value;
      clearActivePresetSelection();
      state.filterValMin = +valMinEl.value;
      updateDualRangeUI('val', state.filterValMin, state.filterValMax, 0, 100, fmtSliderVal);
      applyFilters();
    });
    valMaxEl.addEventListener('input', () => {
      if (+valMaxEl.value < +valMinEl.value) valMaxEl.value = valMinEl.value;
      clearActivePresetSelection();
      state.filterValMax = +valMaxEl.value;
      updateDualRangeUI('val', state.filterValMin, state.filterValMax, 0, 100, fmtSliderVal);
      applyFilters();
    });
  }

  // Mission window year inputs
  const winStartEl = document.getElementById('filter-win-start') as HTMLInputElement | null;
  const winEndEl   = document.getElementById('filter-win-end') as HTMLInputElement | null;
  if (winStartEl) winStartEl.addEventListener('input', () => {
    clearActivePresetSelection();
    state.filterWindowStart = Math.min(+winStartEl.value, state.filterWindowEnd);
    applyFilters();
  });
  if (winEndEl) winEndEl.addEventListener('input', () => {
    clearActivePresetSelection();
    state.filterWindowEnd = Math.max(+winEndEl.value, state.filterWindowStart);
    applyFilters();
  });

  // Spectral type chips
  document.querySelectorAll('.spec-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      clearActivePresetSelection();
      const k = (btn as HTMLElement).dataset.spec!;
      state.filterSpec[k] = !state.filterSpec[k];
      btn.classList.toggle('active', state.filterSpec[k]);
      applyFilters();
    });
  });

  // Quick toggle buttons
  ['nhats', 'pha', 'water'].forEach(key => {
    const el = document.getElementById('filter-' + key);
    if (!el) return;
    el.addEventListener('click', () => {
      clearActivePresetSelection();
      const on = el.dataset.on === 'true';
      el.dataset.on = String(!on);
      if (key === 'nhats') state.filterNHATS = !on;
      else if (key === 'pha') state.filterPHA = !on;
      else if (key === 'water') state.filterWater = !on;
      applyFilters();
    });
  });

  // Sort dropdown
  const sortSel = document.getElementById('lb-sort-select') as HTMLSelectElement | null;
  if (sortSel) sortSel.addEventListener('change', () => {
    state.lbSortMode = sortSel.value; renderLeaderboard();
  });

  // Preset dropdown
  const presetSel = document.getElementById('filter-preset-select') as HTMLSelectElement | null;
  if (presetSel) presetSel.addEventListener('change', () => {
    if (presetSel.value) { applyPreset(presetSel.value); }
  });

  // Save preset button
  const saveBtn = document.getElementById('btn-save-preset');
  if (saveBtn) saveBtn.addEventListener('click', () => {
    const name = prompt('Preset name:');
    if (name) saveUserPreset(name);
    else setStatus('Preset save canceled', true);
  });

  // Reset all button
  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  // Export filtered catalog
  const exportCatBtn = document.getElementById('btn-export-catalog');
  if (exportCatBtn) exportCatBtn.addEventListener('click', exportFilteredCatalog);

  // Right panel tabs
  document.getElementById('panel-tabs')!.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('.tab-btn') as HTMLElement | null;
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-inspector')!.style.display  = tab === 'inspector'  ? 'flex'  : 'none';
    document.getElementById('tab-economics')!.style.display  = tab === 'economics'  ? 'block' : 'none';
    document.getElementById('tab-materials')!.style.display  = tab === 'materials'  ? 'block' : 'none';
    document.getElementById('tab-research')!.style.display   = tab === 'research'   ? 'block' : 'none';
    if (tab === 'economics' && state.selectedId >= 0) renderEconomicsTab(state.selectedId);
    if (tab === 'materials' && state.selectedId >= 0) renderMaterialsTab(state.selectedId);
    if (tab === 'research'  && state.selectedId >= 0) {
      const ast = state.asteroidData[state.selectedId];
      if (ast) fetchResearch(ast);
    }
  });

  ['eco-dry-mass', 'eco-isp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { if (state.selectedId >= 0) renderEconomicsTab(state.selectedId); });
  });

  document.getElementById('btn-export-report')!.addEventListener('click', exportMissionReport);

  // Materials: price mode toggle + refresh
  document.getElementById('mat-price-toggle')!.addEventListener('click', () => {
    state.matPriceMode = state.matPriceMode === 'earth' ? 'space' : 'earth';
    if (state.selectedId >= 0) renderMaterialsTab(state.selectedId);
    setStatus(state.matPriceMode === 'space' ? 'Materials view: in-space prices' : 'Materials view: Earth prices', true);
  });
  document.getElementById('mat-price-refresh')!.addEventListener('click', async () => {
    await fetchPrices(true);
    if (state.selectedId >= 0) renderMaterialsTab(state.selectedId);
  });

  // Load saved presets on init
  populateSavedPresets();
  // Initialize dual-range fill UI
  updateDualRangeUI('dv', state.filterDvMin, state.filterDvMax, 0, state.MISSION_DV_FILTER_MAX, v => v.toFixed(1) + ' km/s');
  updateDualRangeUI('val', state.filterValMin, state.filterValMax, 0, 100, fmtSliderVal);
}
