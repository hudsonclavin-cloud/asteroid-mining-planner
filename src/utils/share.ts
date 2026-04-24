/**
 * Shareable URL encode/decode — base64-encodes app state into the URL hash.
 * Source: index.html lines ~4255–4360.
 *
 * TODO: import selectedId, asteroidData, currentJD, camera, burns, missionConfig,
 *       selectedTrajIdx, _activeMissionType from their src/ modules once Stage 9 wires.
 */

/**
 * Build the share state object from current app state.
 * Returns null if no asteroid is selected.
 */
export function buildShareState(options: { includeMissionPlanner?: boolean } = {}): object | null {
  // TODO: resolve from module singletons in Stage 9
  const { includeMissionPlanner = false } = options;
  // @ts-ignore — runtime globals during transition
  if (typeof selectedId === 'undefined' || selectedId < 0) return null;
  // @ts-ignore
  const ast = asteroidData[selectedId];
  const state: any = {
    // @ts-ignore
    des: ast.pdes || ast.full_name,
    // @ts-ignore
    jd: Math.round(currentJD),
    // @ts-ignore
    cam: { x: +camera.position.x.toFixed(3), y: +camera.position.y.toFixed(3), z: +camera.position.z.toFixed(3) },
    // @ts-ignore
    burns: burns.map((b: any) => ({ p: +b.dv_p.toFixed(4), r: +b.dv_r.toFixed(4), n: +b.dv_n.toFixed(4), jd: b.jd })),
  };
  if (includeMissionPlanner) {
    state.mp = {
      // @ts-ignore
      type: _activeMissionType, dest: missionConfig.destination, sc: missionConfig.spacecraft,
      // @ts-ignore
      lv: missionConfig.launchVehicle, rt: missionConfig.redirectTarget, rp: missionConfig.redirectPropulsion,
      // @ts-ignore
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
