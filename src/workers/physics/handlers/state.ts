import { asteroids, TWO_PI, GM_AU3_S2, DEG } from '../../../physics/constants/index.js';
import { propagateAsteroid } from '../../../physics/propagation/planets.js';
import { cart2kep } from '../../../physics/orbital/keplerian/elements.js';
import { applyBurn } from '../../../physics/orbital/burns.js';
import { moidApprox } from '../../../physics/orbital/moid.js';
import { closeApproachScan } from '../../../physics/orbital/moid.js';

export function handleGetState(msg: any): void {
  const ast = asteroids[msg.ast_idx];
  if (!ast) return;
  const jd = msg.jd;
  const state = propagateAsteroid(ast, jd);
  const el = cart2kep(state.x, state.y, state.z, state.vx, state.vy, state.vz, jd);
  (self as any).postMessage({ type: 'state', ...state, ...el });
}

export function handleApplyBurn(msg: any): void {
  const src = msg.elements || asteroids[msg.ast_idx];
  if (!src) return;
  const newEl = applyBurn(src, msg.jd, msg.dv_p || 0, msg.dv_n || 0, msg.dv_r || 0);
  if (!newEl) { (self as any).postMessage({ type: 'burn_result', error: 'Singular state' }); return; }

  const period_days = TWO_PI * Math.sqrt(Math.pow(newEl.a, 3) / GM_AU3_S2) / 86400;
  const origEl = src.epoch_JD !== undefined ? src : {
    a: src.a, e: src.e, i: src.i*DEG, Om: src.om*DEG, w: src.w*DEG, M0: src.ma*DEG,
    epoch_JD: src.epoch
  };
  const origPeriod = TWO_PI * Math.sqrt(Math.pow(origEl.a !== undefined ? origEl.a : src.a, 3) / GM_AU3_S2) / 86400;
  // Skip MOID during live drag (preview=true) — computed once on pointer-up
  const moid = msg.preview ? null : moidApprox(newEl, msg.jd, 120);

  (self as any).postMessage({
    type: 'burn_result',
    elements: newEl,
    period_days,
    orig_period_days: origPeriod,
    moid_approx: moid,
  });
}

export function handleCloseApproachScan(msg: any): void {
  const el = msg.elements;
  const results = closeApproachScan(el, msg.jd_start, msg.years || 5, 730);
  (self as any).postMessage({ type: 'close_approaches', results });
}
