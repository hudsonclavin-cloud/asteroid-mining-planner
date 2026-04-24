import { TWO_PI, GM_AU3_S2 } from '../constants/index.js';
import { mag, vscale, cross } from '../utils/vector.js';
import { propagateElements, cart2kep } from './keplerian/elements.js';
import { propagateAsteroid } from '../propagation/planets.js';

// Apply ΔV burn (km/s in prograde/normal/radial) and return new elements
export function applyBurn(ast_or_el: any, jd: number, dv_p: number, dv_n: number, dv_r: number) {
  let state: any;
  if (ast_or_el.epoch_JD !== undefined) {
    state = propagateElements(ast_or_el, jd);
  } else {
    state = propagateAsteroid(ast_or_el, jd);
  }

  const r_vec = [state.x, state.y, state.z];
  const v_vec = [state.vx, state.vy, state.vz];
  const r_m = mag(r_vec);
  const v_m = mag(v_vec);

  if (r_m < 1e-15 || v_m < 1e-15) return null;

  // Unit vectors: prograde, normal (h), radial
  const p_hat = vscale(v_vec, 1/v_m);
  const h_vec = cross(r_vec, v_vec);
  const h_m = mag(h_vec);
  const n_hat = h_m > 1e-15 ? vscale(h_vec, 1/h_m) : [0, 0, 1];
  const r_hat = vscale(r_vec, 1/r_m);

  const dvx = dv_p*p_hat[0] + dv_n*n_hat[0] + dv_r*r_hat[0];
  const dvy = dv_p*p_hat[1] + dv_n*n_hat[1] + dv_r*r_hat[1];
  const dvz = dv_p*p_hat[2] + dv_n*n_hat[2] + dv_r*r_hat[2];

  const vx_new = state.vx + dvx;
  const vy_new = state.vy + dvy;
  const vz_new = state.vz + dvz;

  return cart2kep(state.x, state.y, state.z, vx_new, vy_new, vz_new, jd);
}
