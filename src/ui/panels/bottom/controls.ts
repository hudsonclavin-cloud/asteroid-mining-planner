// src/ui/panels/bottom/controls.ts
// Stage 8b extraction — panel open/close functions, tab switching, bottom bar button wiring
// TODO: import from src/ui/hud/selection — deselectAsteroid, selectedId
// TODO: import from src/ui/hud/status — setStatus, encodeStateToURL
// TODO: import from src/ui/panels/left/filters — exportFilteredCatalog

// ─── Panel open / close helpers ───────────────────────────────────────────────

/**
 * openRightPanel — slides the right panel into view by adding .panel-open.
 * Does NOT touch any right-panel content — purely CSS class management.
 */
export function openRightPanel(): void {
  document.getElementById('right-panel')!.classList.add('panel-open');
}

/**
 * closeRightPanel — removes .panel-open from the right panel (slide out).
 * Also handles the mp-mode class if the mission planner was active.
 */
export function closeRightPanel(): void {
  document.getElementById('right-panel')!.classList.remove('panel-open');
}

/**
 * openLeftPanel — shows the left filter/leaderboard panel and repositions the
 * toggle button. Mirrors toggleLeftPanel (open path only).
 */
export function openLeftPanel(leftPanelOpenRef: { value: boolean }): void {
  leftPanelOpenRef.value = true;
  const lp  = document.getElementById('left-panel');
  const btn = document.getElementById('btn-toggle-filters');
  if (lp)  lp.style.display  = 'block';
  if (btn) btn.style.left    = '280px';
}

/**
 * toggleLeftPanel — toggles the left panel between open and closed.
 * Reads and writes leftPanelOpenRef.value.
 */
export function toggleLeftPanel(leftPanelOpenRef: { value: boolean }): void {
  leftPanelOpenRef.value = !leftPanelOpenRef.value;
  const lp  = document.getElementById('left-panel');
  const btn = document.getElementById('btn-toggle-filters');
  if (lp)  lp.style.display = leftPanelOpenRef.value ? 'block' : 'none';
  if (btn) btn.style.left   = leftPanelOpenRef.value ? '280px' : '0';
}

// ─── Bottom bar + toolbar button wiring ──────────────────────────────────────

/**
 * initPanelControls — wires all panel-level, toolbar, and overlay button events:
 *   - btn-share: encode state to URL
 *   - btn-shortcut-hint: open keyboard shortcut overlay
 *   - btn-export-toolbar: export filtered catalog CSV
 *   - btn-close-panel: deselect asteroid (closes right panel)
 *   - btn-share-toolbar: encode state to URL (toolbar variant)
 *   - btn-shortcuts-toolbar: open shortcut overlay (toolbar variant)
 *
 * Must be called once after the DOM is ready.
 */
export function initPanelControls(
  // TODO: replace these parameter stubs with module-level imports once refactor complete
  encodeStateToURL: () => void,
  exportFilteredCatalog: () => void,
  deselectAsteroid: () => void,
): void {
  document.getElementById('btn-share')!.addEventListener('click', encodeStateToURL);
  document.getElementById('btn-shortcut-hint')!.addEventListener('click', () => {
    document.getElementById('shortcut-overlay')!.style.display = 'flex';
  });

  // Toolbar button wiring
  // btn-filters-toolbar removed — use the fixed #btn-toggle-filters tab instead
  document.getElementById('btn-export-toolbar')!.addEventListener('click', exportFilteredCatalog);

  document.getElementById('btn-close-panel')!.addEventListener('click', deselectAsteroid);

  document.getElementById('btn-share-toolbar')!.addEventListener('click', encodeStateToURL);
  document.getElementById('btn-shortcuts-toolbar')!.addEventListener('click', () => {
    document.getElementById('shortcut-overlay')!.style.display = 'flex';
  });
}
