// src/ui/modals/honesty-banner.ts
// Stage 8b extraction — honesty banner toggle and model assumptions panel
// TODO: import from src/data — asteroidData, selectedId

// ─── Phase 9E: Honesty Layer ──────────────────────────────────────────────────

/**
 * initHonestyBanner — shows #honesty-banner on first visit (unless dismissed
 * previously) and wires the "Got it" dismiss button. Dismissal is persisted in
 * localStorage under 'aster_banner_dismissed'.
 *
 * Also wires:
 *   - #mp-assumptions-toggle: expand/collapse the model-assumptions block inside
 *     the mission planner panel.
 *   - #mp-verify-horizons: open JPL Horizons in a new tab for the selected
 *     asteroid.
 *
 * @param getSelectedAsteroid  Function returning the currently-selected asteroid
 *                             data object (or null/undefined if none selected).
 */
export function initHonestyBanner(
  // TODO: replace with module-level import once refactor is complete
  getSelectedAsteroid: () => any,
): void {
  // Banner — shown on first visit, dismissible
  (function() {
    if (localStorage.getItem('aster_banner_dismissed')) return;
    const b = document.getElementById('honesty-banner')!;
    b.style.display = 'flex';
    document.getElementById('banner-dismiss')!.onclick = () => {
      localStorage.setItem('aster_banner_dismissed', '1');
      b.style.display = 'none';
    };
  })();

  // Model assumptions toggle
  (document.getElementById('mp-assumptions-toggle') as HTMLElement).onclick = function(this: HTMLElement) {
    const c = document.getElementById('mp-assumptions-content')!;
    const open = c.style.display !== 'none';
    c.style.display = open ? 'none' : 'block';
    this.textContent = 'MODEL ASSUMPTIONS ' + (open ? '▶' : '▼');
  };

  // Verify with JPL Horizons
  (document.getElementById('mp-verify-horizons') as HTMLElement).onclick = function() {
    const ast = getSelectedAsteroid();
    if (!ast) return;
    const des = encodeURIComponent((ast.pdes || ast.full_name || '').trim());
    window.open(`https://ssd.jpl.nasa.gov/horizons/app.html#/?body=sb&des=${des}`, '_blank');
  };
}
