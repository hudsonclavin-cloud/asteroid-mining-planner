// src/ui/overlays/tooltips.ts
// Stage 8b extraction — custom uncertainty popup system + porkchop/burn-vector tooltip wiring
// The "tooltip" system here covers three distinct popup mechanisms:
//   1. #unc-popup — uncertainty detail popup (Phase 9D)
//   2. #porkchop-tooltip — hover tooltip on the porkchop canvas
//   3. #burn-tooltip — hover tooltip on burn-vector arrows (wired in mission events)
// TODO: import from src/utils/format — fmtUSD
// TODO: import from src/utils/time — jdToDate
// TODO: import from src/physics/feasibility — computeFeasibilityMetrics (FeasibilityResult)
// TODO: import from src/physics/economics — computeMissionCost

// ─── Phase 9D: Uncertainty popup ──────────────────────────────────────────────

const _uncPopup = document.getElementById('unc-popup')!;
let _uncPopupTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * showTooltip (showUncPopup) — positions and shows the #unc-popup element with
 * the provided HTML content. Anchors below the triggering element; flips up if
 * it would overflow the viewport bottom. Clears any pending hide timer.
 *
 * @param el   The element that triggered the popup (used for positioning)
 * @param html HTML content to inject into the popup
 */
export function showTooltip(el: HTMLElement, html: string): void {
  if (_uncPopupTimer !== null) clearTimeout(_uncPopupTimer);
  _uncPopup.innerHTML = html;
  _uncPopup.style.display = 'block';
  const r = el.getBoundingClientRect();
  let top = r.bottom + 6, left = r.left;
  if (top + 160 > window.innerHeight) top = r.top - 10 - _uncPopup.offsetHeight;
  if (left + 270 > window.innerWidth) left = window.innerWidth - 275;
  _uncPopup.style.top  = top + 'px';
  _uncPopup.style.left = left + 'px';
}

/**
 * hideTooltip (hideUncPopup) — schedules the #unc-popup to be hidden after
 * `delay` milliseconds (or immediately if delay is 0 / omitted).
 *
 * @param delay Milliseconds to wait before hiding (default 0)
 */
export function hideTooltip(delay = 0): void {
  _uncPopupTimer = setTimeout(() => { _uncPopup.style.display = 'none'; }, delay);
}

/**
 * initTooltips — sets up global click-outside dismissal and mouseenter/leave
 * hover persistence for #unc-popup. Must be called once after DOM is ready.
 */
export function initTooltips(): void {
  document.addEventListener('click', e => {
    if (
      !(e.target as HTMLElement).closest('.unc-icon') &&
      !(e.target as HTMLElement).closest('#unc-popup')
    ) {
      hideTooltip(0);
    }
  });
  _uncPopup.addEventListener('mouseenter', () => {
    if (_uncPopupTimer !== null) clearTimeout(_uncPopupTimer);
  });
  _uncPopup.addEventListener('mouseleave', () => hideTooltip(200));
}

// ─── Uncertainty HTML helpers ─────────────────────────────────────────────────

const DV_SOURCE_LINKS: Record<string, string> = {
  nhats:             '<a href="https://cneos.jpl.nasa.gov/nhats/" target="_blank">NHATS (JPL)</a>',
  asterank:          '<a href="http://www.asterank.com/" target="_blank">Asterank DB</a>',
  'hohmann-visviva': 'Aster orbital estimate',
  lambert:           'Aster Lambert planner',
};

/**
 * dvUncHtml — builds the HTML snippet for a ΔV uncertainty popup.
 * @param fi  FeasibilityMetrics result from computeFeasibilityMetrics
 */
export function dvUncHtml(fi: any): string {
  const dv = fi.deltaV;
  const methodLabel: Record<string, string> = {
    nhats:             'NHATS verified',
    asterank:          'Asterank catalog',
    'hohmann-visviva': 'Vis-viva/Hohmann approx.',
    lambert:           'Aster Lambert planner',
  };
  const label = methodLabel[dv.method] || dv.method;
  const link  = DV_SOURCE_LINKS[dv.method] || dv.source;
  return `<div style="color:#00d4ff;margin-bottom:3px">ΔV Uncertainty</div>
Method: ${label}<br>Uncertainty: ±${dv.uncertainty} km/s<br>Source: ${link}`;
}

/**
 * costUncHtml — builds the HTML snippet for a mission cost uncertainty popup.
 * @param cost    { low, high } cost range from computeMissionCost
 * @param dvUnc   ΔV uncertainty string (e.g. '0.5')
 * @param opsDays Rough mission duration in days (for label)
 * @param fmtUSD  Formatter function — TODO: import from src/utils/format
 */
export function costUncHtml(
  cost: { low: number; high: number },
  dvUnc: number,
  opsDays: number,
  // TODO: import fmtUSD from src/utils/format
  fmtUSD: (v: number | null) => string,
): string {
  const margin = dvUnc > 1 ? '±25%' : '±15%';
  return `<div style="color:#00d4ff;margin-bottom:3px">Cost Range</div>
Launch vehicle pricing variance: ±10%<br>Operations uncertainty (${opsDays}d): ±15%<br>ΔV uncertainty widens margin: ${margin}<br>Range: ${fmtUSD(cost.low)} – ${fmtUSD(cost.high)}`;
}

// ─── Porkchop canvas tooltip wiring ──────────────────────────────────────────

/**
 * initPorkchopTooltip — attaches mousemove and mouseleave listeners to
 * #porkchop-canvas to drive the #porkchop-tooltip element.
 *
 * @param getPorkchopData  Function returning the current porkchop grid data
 * @param jdToDate         JD → ISO date string formatter
 */
export function initPorkchopTooltip(
  getPorkchopData: () => any,
  jdToDate: (jd: number) => string,
): void {
  const canvas  = document.getElementById('porkchop-canvas') as HTMLCanvasElement;
  const tooltip = document.getElementById('porkchop-tooltip')!;

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const porkchopData = getPorkchopData();
    if (!porkchopData) { tooltip.style.display = 'none'; return; }
    const rect = canvas.getBoundingClientRect();
    const ix   = Math.floor((e.clientX - rect.left) / rect.width  * porkchopData.nx);
    const iy   = Math.floor((e.clientY - rect.top)  / rect.height * porkchopData.ny);
    if (ix < 0 || ix >= porkchopData.nx || iy < 0 || iy >= porkchopData.ny) {
      tooltip.style.display = 'none'; return;
    }
    const dv  = porkchopData.grid[ix * porkchopData.ny + iy];
    const tof = porkchopData.tof_min + iy / (porkchopData.ny - 1) * (porkchopData.tof_max - porkchopData.tof_min);
    const jd  = porkchopData.jd_start + ix / (porkchopData.nx - 1) * (porkchopData.jd_end - porkchopData.jd_start);
    tooltip.style.display = 'block';
    tooltip.style.left    = (e.clientX - rect.left + 6) + 'px';
    tooltip.style.top     = (e.clientY - rect.top - 18) + 'px';
    tooltip.textContent   = `${jdToDate(jd)} | TOF:${tof.toFixed(0)}d | ΔV:${dv.toFixed(2)} km/s`;
  });

  canvas.addEventListener('mouseleave', () => {
    document.getElementById('porkchop-tooltip')!.style.display = 'none';
  });
}
