/**
 * Shareable URL encode/decode — base64-encodes app state into the URL hash.
 * Source: index.html lines ~4255–4360.
 */

import { selectedId, asteroidData, burns, missionConfig, selectedTrajIdx, _activeMissionType } from '../state/index';
import { currentJD } from './time-state';
import { camera } from '../renderer/scene/index';

/**
 * Build the share state object from current app state.
 * Returns null if no asteroid is selected.
 */
export function buildShareState(options: { includeMissionPlanner?: boolean } = {}): object | null {
  const { includeMissionPlanner = false } = options;
  if (selectedId < 0) return null;
  const ast = asteroidData[selectedId];
  const state: any = {
    des: ast.pdes || ast.full_name,
    jd: Math.round(currentJD),
    cam: { x: +camera.position.x.toFixed(3), y: +camera.position.y.toFixed(3), z: +camera.position.z.toFixed(3) },
    burns: burns.map((b: any) => ({ p: +b.dv_p.toFixed(4), r: +b.dv_r.toFixed(4), n: +b.dv_n.toFixed(4), jd: b.jd })),
  };
  if (includeMissionPlanner) {
    state.mp = {
      type: _activeMissionType,
      dest: missionConfig.destination, sc: missionConfig.spacecraft,
      lv: missionConfig.launchVehicle, rt: missionConfig.redirectTarget, rp: missionConfig.redirectPropulsion,
      ys: missionConfig.launchYearStart, ye: missionConfig.launchYearEnd, ti: selectedTrajIdx,
    };
  }
  return state;
}

/** Encode current state into window.location.hash and copy URL to clipboard. */
export function encodeStateToURL(state = buildShareState()): void {
  if (!state) { /* TODO: call setStatus */ return; }
  try {
    window.location.hash = btoa(JSON.stringify(state));
    navigator.clipboard.writeText(window.location.href).then(
      () => { /* TODO: setStatus('✓ URL copied to clipboard') */ },
      () => { /* TODO: setStatus('✓ URL encoded in address bar') */ }
    );
  } catch(err) {
    console.error('[Share]', err);
  }
}

/** Decode URL hash and return the state object, or null if absent/invalid. */
export function loadStateFromURL(): any | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try { return JSON.parse(atob(hash)); } catch(_) { return null; }
}
