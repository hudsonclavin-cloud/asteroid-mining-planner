/**
 * Mission planner error panel helpers.
 * Source: index.html lines 4441–4468.
 */

import { _activeMissionType } from '../../../state/index';

export function clearPlannerError(): void {
  ['mp-results-error', 'mp-redirect-error'].forEach(id => {
    const errEl = document.getElementById(id);
    if (errEl) {
      errEl.style.display = 'none';
      errEl.innerHTML = '';
    }
  });
}

export function showPlannerError(err: unknown): void {
  const msg = typeof err === 'string' ? err : ((err as any)?.message || 'Unknown error');
  ['mp-computing', 'mp-results', 'mp-profile', 'mp-burns', 'mp-actions', 'mp-redirect-results'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const isRedirect = _activeMissionType === 'redirect';
  const errEl = document.getElementById(isRedirect ? 'mp-redirect-error' : 'mp-results-error');
  const panel = document.getElementById(isRedirect ? 'mp-redirect-results' : 'mp-results');
  if (errEl) {
    errEl.innerHTML =
      `<div style="color:#f87171;padding:16px;border:1px solid #f87171;font-size:11px;line-height:1.6">` +
      `<div style="font-weight:bold;margin-bottom:6px;letter-spacing:0.08em">&#9888; MISSION PLANNER ERROR</div>` +
      `<div>${msg}</div>` +
      `<div style="margin-top:8px;color:#4b5563">Check console for details. Try selecting a different asteroid or adjusting launch window.</div>` +
      `</div>`;
    errEl.style.display = 'block';
  }
  if (panel) panel.style.display = 'block';
  console.error('[MissionPlanner]', err);
}
