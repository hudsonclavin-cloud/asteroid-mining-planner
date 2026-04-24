// src/ui/panels/left/filters.ts
// Stage 8b extraction — filter panel + leaderboard rendering
// TODO: import from src/physics or src/data —
//   asteroidMesh, asteroidCount, asteroidData, filteredIds, selectedId,
//   positionCache
// TODO: import from src/ui/panels/left/filter-state —
//   filterDvMin, filterDvMax, filterValMin, filterValMax,
//   filterWindowStart, filterWindowEnd, filterNHATS, filterPHA, filterWater,
//   filterSpec, filterDV, filterDiam, filterInc, filterSMA,
//   lbSortMode, activePresetKey, MISSION_DV_FILTER_MAX
// TODO: import from src/utils/format — fmtUSD, fmtSliderVal
// TODO: import from src/physics/feasibility — computeFeasibilityMetrics
// TODO: import from src/physics/economics — resolveAsteroidEconomics
// TODO: import from src/ui/hud/selection — selectAsteroid, flyTo
// TODO: import from src/ui/hud/toolbar — updateToolbarHUD
// TODO: import from src/ui/hud/status — setStatus
// TODO: import from src/scene — spectralTypeColor
// TODO: import from src/physics/nhats — getAsteroidDV, getDisplayDeltaV, getDisplayDuration, getDisplayValueUsd, hasNhatsPlannerMismatch
// TODO: import THREE

// ─── Phase 3: Filter + Leaderboard ───────────────────────────────────────────

function getSpecKey(ast: any): string {
  const s = (ast.spec || ast.spec_T || '').trim().charAt(0).toUpperCase();
  if (['C', 'S', 'M', 'X', 'D'].includes(s)) return s;
  if (['B', 'P'].includes(s)) return 'C';
  return 'other';
}

// ─── Phase 7: log-scale value helpers ────────────────────────────────────────
function sliderPosToValue(pos: number): number {
  if (pos <= 0) return 0;
  if (pos >= 100) return 1e14;
  return Math.pow(10, (pos / 100) * Math.log10(1e14));
}

function valueToSliderPos(val: number): number {
  if (val <= 0) return 0;
  return Math.round((Math.log10(Math.max(1, val)) / Math.log10(1e14)) * 100);
}

function fmtSliderVal(pos: number): string {
  if (pos <= 0) return '$0';
  if (pos >= 100) return '$100T';
  // TODO: import fmtUSD from src/utils/format
  return fmtUSD(sliderPosToValue(pos));
}

// Placeholder — replaced by import at runtime
declare function fmtUSD(val: number | null): string;

export function updateDualRangeUI(
  prefix: string,
  minVal: number,
  maxVal: number,
  absMin: number,
  absMax: number,
  fmtFn: (v: number) => string,
): void {
  const range = absMax - absMin;
  const pctLo = Math.max(0, (minVal - absMin) / range) * 100;
  const pctHi = Math.min(100, (maxVal - absMin) / range) * 100;
  const fill = document.getElementById(prefix + '-fill');
  if (fill) { fill.style.left = pctLo + '%'; fill.style.width = (pctHi - pctLo) + '%'; }
  const disp = document.getElementById(prefix + '-range-display');
  if (disp) disp.textContent = fmtFn(minVal) + ' – ' + fmtFn(maxVal);
}

export function updateFilterBadge(
  filterDvMin: number,
  filterDvMax: number,
  filterValMin: number,
  filterValMax: number,
  filterWindowStart: number,
  filterWindowEnd: number,
  filterSpec: Record<string, boolean>,
  filterNHATS: boolean,
  filterPHA: boolean,
  filterWater: boolean,
  MISSION_DV_FILTER_MAX: number,
): void {
  let count = 0;
  if (filterDvMin > 0 || filterDvMax < MISSION_DV_FILTER_MAX) count++;
  if (filterValMin > 0 || filterValMax < 100) count++;
  if (filterWindowStart > 2025 || filterWindowEnd < 2045) count++;
  if (!filterSpec.C || !filterSpec.S || !filterSpec.M || !filterSpec.X || !filterSpec.D || !filterSpec.other) count++;
  if (filterNHATS) count++;
  if (filterPHA) count++;
  if (filterWater) count++;
  const badge = document.getElementById('filter-badge');
  const label = document.getElementById('active-filter-label');
  if (badge) { badge.style.display = count > 0 ? 'flex' : 'none'; badge.textContent = String(count); }
  if (label) label.textContent = count > 0 ? `${count} FILTER${count > 1 ? 'S' : ''} ACTIVE` : 'NO FILTERS ACTIVE';
  const toolbarBadge = document.getElementById('filter-badge-toolbar');
  if (toolbarBadge) { toolbarBadge.style.display = count > 0 ? 'inline' : 'none'; toolbarBadge.textContent = String(count); }
}

// TODO: import _DIM_COLOR from src/scene — const _DIM_COLOR = new THREE.Color(0x0d0d12)
declare const _DIM_COLOR: any;

/**
 * applyFilters — iterates over all asteroids, applies active filter state to
 * instance colours (amber for NHATS, spectral for others, dim for non-match),
 * rebuilds filteredIds, updates the badge/counter, calls renderLeaderboard.
 */
export function applyFilters(
  // TODO: all these will be module-level imports once refactor is complete
  asteroidMesh: any,
  asteroidCount: number,
  asteroidData: any[],
  filteredIdsRef: { value: Array<{ i: number; dv: number }> },
  filterDvMin: number,
  filterDvMax: number,
  filterValMin: number,
  filterValMax: number,
  filterWindowStart: number,
  filterWindowEnd: number,
  filterNHATS: boolean,
  filterPHA: boolean,
  filterWater: boolean,
  filterSpec: Record<string, boolean>,
  filterDiam: number,
  filterInc: number,
  filterSMA: number,
  MISSION_DV_FILTER_MAX: number,
  THREE: any,
  getDisplayDeltaV: (ast: any) => number,
  getAsteroidDV: (ast: any) => number,
  getDisplayValueUsd: (ast: any) => number | null,
  spectralTypeColor: (ast: any) => any,
  updateToolbarHUD: () => void,
): void {
  if (!asteroidMesh || asteroidCount === 0) return;
  let matchCount = 0;
  filteredIdsRef.value = [];
  const amber = new THREE.Color(0xfbbf24);
  const dimColor = new THREE.Color(0x0d0d12);
  const valLo = sliderPosToValue(filterValMin);
  const valHi = sliderPosToValue(filterValMax);

  for (let i = 0; i < asteroidCount; i++) {
    const ast = asteroidData[i];
    let vis = true;
    const dv = getDisplayDeltaV(ast);
    const sk = getSpecKey(ast);

    if (dv < filterDvMin || dv > filterDvMax) vis = false;
    if ((ast._diam_m || 0) < filterDiam) vis = false;
    if ((Number(ast.i) || 0) > filterInc) vis = false;
    if ((Number(ast.a) || 1) > filterSMA) vis = false;
    if (!filterSpec[sk]) vis = false;
    if (filterNHATS && !ast.nhats?.accessible) vis = false;
    if (filterPHA && ast.pha !== 'Y') vis = false;
    if (filterWater && !['C', 'D'].includes(sk)) vis = false;

    // Resource value (log scale)
    const price = getDisplayValueUsd(ast);
    if (filterValMax < 100 && price !== null && price > valHi) vis = false;
    if (filterValMin > 0 && (price === null || price < valLo)) vis = false;

    // Mission window — only gates NHATS-accessible targets (2025–2035 is the NHATS query range)
    if (ast.nhats?.accessible) {
      if (filterWindowEnd < 2025 || filterWindowStart > 2035) vis = false;
    }

    // Dim non-matching via color instead of scale
    if (vis) {
      asteroidMesh.setColorAt(i, ast.nhats?.accessible ? amber : spectralTypeColor(ast));
      matchCount++;
      filteredIdsRef.value.push({ i, dv: getAsteroidDV(asteroidData[i]) });
    } else {
      asteroidMesh.setColorAt(i, dimColor);
    }
  }

  asteroidMesh.instanceMatrix.needsUpdate = true;
  asteroidMesh.instanceColor.needsUpdate = true;
  const fc = document.getElementById('filter-count');
  if (fc) fc.textContent = `${matchCount} / ${asteroidCount}`;
  updateFilterBadge(
    filterDvMin, filterDvMax, filterValMin, filterValMax,
    filterWindowStart, filterWindowEnd, filterSpec,
    filterNHATS, filterPHA, filterWater, MISSION_DV_FILTER_MAX,
  );
  renderLeaderboard(filteredIdsRef.value, asteroidData, 'dv', -1);
  updateToolbarHUD();
}

/**
 * rebuildFilteredList — alias used by external callers (e.g. after NHATS data
 * arrives) to trigger a full filter pass and leaderboard rebuild.
 */
export function rebuildFilteredList(applyFiltersFn: () => void): void {
  applyFiltersFn();
}

/**
 * renderLeaderboard — sorts filteredIds according to lbSortMode and renders up
 * to 50 rows into #leaderboard-list. Each row is clickable and calls
 * selectAsteroid / flyTo.
 */
export function renderLeaderboard(
  filteredIds: Array<{ i: number; dv: number }>,
  asteroidData: any[],
  lbSortMode: string,
  selectedId: number,
  // TODO: import these helpers
  getDisplayValueUsd?: (ast: any) => number | null,
  getDisplayDeltaV?: (ast: any) => number,
  getDisplayDuration?: (ast: any) => number,
  computeFeasibilityMetrics?: (ast: any) => any,
  selectAsteroid?: (idx: number) => void,
  flyTo?: (idx: number) => void,
): void {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;

  const sorted = [...filteredIds];
  if      (lbSortMode === 'value')    sorted.sort((a, b) => ((getDisplayValueUsd?.(asteroidData[b.i]) ?? -Infinity) - (getDisplayValueUsd?.(asteroidData[a.i]) ?? -Infinity)));
  else if (lbSortMode === 'diam')     sorted.sort((a, b) => (asteroidData[b.i]._diam_m || 0) - (asteroidData[a.i]._diam_m || 0));
  else if (lbSortMode === 'duration') sorted.sort((a, b) => (getDisplayDuration?.(asteroidData[a.i]) ?? 0) - (getDisplayDuration?.(asteroidData[b.i]) ?? 0));
  else if (lbSortMode === 'name')     sorted.sort((a, b) => (asteroidData[a.i].full_name || '').localeCompare(asteroidData[b.i].full_name || ''));
  else                                sorted.sort((a, b) => (getDisplayDeltaV?.(asteroidData[a.i]) ?? 0) - (getDisplayDeltaV?.(asteroidData[b.i]) ?? 0)); // dv default

  const top50 = sorted.slice(0, 50);
  container.innerHTML = top50.map(({ i: idx }, rank) => {
    const ast = asteroidData[idx];
    const sk = getSpecKey(ast);
    const skClass = ['C', 'S', 'M', 'X', 'D'].includes(sk) ? sk : 'O';
    const fi = computeFeasibilityMetrics?.(ast) ?? { deltaV: { value: 0, uncertainty: '?' }, duration: { value: 0, source: '' }, valueRange: { optimistic: null }, accessibility: { nhatsVerified: false }, hazard: { riskLevel: '' } };

    // TODO: import hasNhatsPlannerMismatch from src/physics/nhats
    declare function hasNhatsPlannerMismatch(ast: any): boolean;

    const dvStr  = `${fi.deltaV.value.toFixed(1)} (±${fi.deltaV.uncertainty})`;
    const durStr = fi.duration.value > 0 ? Math.round(fi.duration.value) + (fi.duration.source !== 'NHATS' ? '*' : '') : '—';
    const valStr = fi.valueRange.optimistic !== null ? fmtUSD(fi.valueRange.optimistic) : 'unknown';
    const nhBadge = fi.accessibility.nhatsVerified
      ? '<span style="color:#00d4ff;font-size:8px;margin-left:3px" title="NHATS verified">✓</span>'
      : '';
    const hazBadge = fi.hazard.riskLevel === 'high'
      ? '<span style="color:#ef4444;font-size:8px;margin-left:3px" title="PHA">⚠</span>'
      : '';
    const gateBadge = hasNhatsPlannerMismatch(ast)
      ? '<span style="color:#fbbf24;font-size:8px;margin-left:3px" title="NHATS uses a different accessibility model than the 10 km/s planner departure gate">ΔV!</span>'
      : '';
    const name = (ast.full_name || ast.pdes || '—').substring(0, 14);
    return `<div class="lb-row ${selectedId === idx ? 'lb-selected' : ''}" data-idx="${idx}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1px">
        <span style="font-size:9px;color:#c8d6e5">${name}${nhBadge}${hazBadge}${gateBadge}</span>
        <span class="lb-type lb-type-${skClass}" style="font-size:8px">${skClass}</span>
      </div>
      <div style="display:flex;gap:6px;font-size:8px;color:#6a8a9a">
        <span title="Delta-V">ΔV <span style="color:#00d4ff">${dvStr}</span></span>
        <span title="Mission duration">TOF <span style="color:#c8d6e5">${durStr}d</span></span>
        <span title="Screening-grade extractable value estimate" style="margin-left:auto">${valStr}</span>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('.lb-row').forEach(row => {
    row.addEventListener('click', () => {
      const idx = parseInt((row as HTMLElement).dataset.idx ?? '-1');
      selectAsteroid?.(idx);
      flyTo?.(idx);
    });
  });
}
