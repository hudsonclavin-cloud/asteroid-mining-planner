import { GM_sun, AU, TWO_PI, GM_AU3_S2 } from '../../constants/index.js';
import { mag, dot, cross, vscale, vsub } from '../../utils/vector.js';
import { wrapToTwoPi } from '../../utils/angle.js';
import { solveKepler } from './kepler.js';

// Keplerian elements → heliocentric ecliptic Cartesian (AU, km/s)
export function kep2cart(a_AU: number, e: number, i_rad: number, Om_rad: number, w_rad: number, M0_rad: number, epoch_JD: number, t_JD: number) {
  const a_m = a_AU * AU;
  const n = Math.sqrt(GM_sun / (a_m * a_m * a_m));
  const dt = (t_JD - epoch_JD) * 86400.0;
  let M = M0_rad + n * dt;
  M = M - TWO_PI * Math.floor((M + Math.PI) / TWO_PI);
  const E = solveKepler(M, e);

  const nu = 2 * Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2));
  const r = a_AU * (1 - e * Math.cos(E));
  const r_m = r * AU;
  const xo = r * Math.cos(nu);
  const yo = r * Math.sin(nu);

  // Orbital plane velocity (m/s)
  const sqrtGMa = Math.sqrt(GM_sun * a_m);
  const vxo = -(sqrtGMa / r_m) * Math.sin(E);
  const vyo =  (sqrtGMa / r_m) * Math.sqrt(1 - e * e) * Math.cos(E);

  // 3-1-3 Euler rotation: Ω, i, ω → ecliptic frame
  const cosOm = Math.cos(Om_rad), sinOm = Math.sin(Om_rad);
  const cosI  = Math.cos(i_rad),  sinI  = Math.sin(i_rad);
  const cosW  = Math.cos(w_rad),  sinW  = Math.sin(w_rad);

  const Rxx = cosOm*cosW - sinOm*sinW*cosI;
  const Rxy = -(cosOm*sinW + sinOm*cosW*cosI);
  const Ryx = sinOm*cosW + cosOm*sinW*cosI;
  const Ryy = -(sinOm*sinW - cosOm*cosW*cosI);
  const Rzx = sinW*sinI;
  const Rzy = cosW*sinI;

  return {
    x: xo*Rxx + yo*Rxy,
    y: xo*Ryx + yo*Ryy,
    z: xo*Rzx + yo*Rzy,
    vx: (vxo*Rxx + vyo*Rxy) / 1000,
    vy: (vxo*Ryx + vyo*Ryy) / 1000,
    vz: (vxo*Rzx + vyo*Rzy) / 1000,
  };
}

// Cartesian (AU, km/s) → Keplerian elements
export function cart2kep(x: number, y: number, z: number, vx_kms: number, vy_kms: number, vz_kms: number, t_JD: number) {
  const mu = GM_AU3_S2; // AU³/s²
  const vx = vx_kms * 1000 / AU;
  const vy = vy_kms * 1000 / AU;
  const vz = vz_kms * 1000 / AU;

  const r_vec = [x, y, z];
  const v_vec = [vx, vy, vz];
  const r = mag(r_vec);
  const v2 = dot(v_vec, v_vec);

  const h_vec = cross(r_vec, v_vec);
  const h = mag(h_vec);

  // Node vector: [0,0,1] × h_vec = [-hy, hx, 0]
  const n_vec = [-h_vec[1], h_vec[0], 0];
  const n_mag = Math.sqrt(n_vec[0]*n_vec[0] + n_vec[1]*n_vec[1]);

  // Eccentricity vector: (v × h)/μ - r̂
  const vxh = cross(v_vec, h_vec);
  const e_vec = vsub(vscale(vxh, 1/mu), vscale(r_vec, 1/r));
  const e = mag(e_vec);

  // Semi-major axis (vis-viva)
  const a = 1 / (2/r - v2/mu);
  if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(e) || e >= 1) return null;

  // Inclination
  const inc = Math.acos(Math.max(-1, Math.min(1, h_vec[2] / h)));

  // RAAN (Ω)
  let Om = 0;
  if (n_mag > 1e-10) {
    Om = Math.acos(Math.max(-1, Math.min(1, n_vec[0] / n_mag)));
    if (n_vec[1] < 0) Om = TWO_PI - Om;
  }

  // Argument of periapsis (ω)
  let w = 0;
  if (n_mag > 1e-10 && e > 1e-10) {
    w = Math.acos(Math.max(-1, Math.min(1, dot(n_vec, e_vec) / (n_mag * e))));
    if (e_vec[2] < 0) w = TWO_PI - w;
  }

  // True anomaly (ν)
  let nu_anom = 0;
  if (e > 1e-10) {
    nu_anom = Math.acos(Math.max(-1, Math.min(1, dot(e_vec, r_vec) / (e * r))));
    if (dot(r_vec, v_vec) < 0) nu_anom = TWO_PI - nu_anom;
  } else if (n_mag > 1e-10) {
    const cosU = Math.max(-1, Math.min(1, dot(n_vec, r_vec) / (n_mag * r)));
    let u = Math.acos(cosU);
    if (z < 0) u = TWO_PI - u;
    w = 0;
    nu_anom = u;
  } else {
    nu_anom = wrapToTwoPi(Math.atan2(y, x));
    w = 0;
    Om = 0;
  }

  // Mean anomaly via eccentric anomaly
  let M0;
  if (e > 1e-10) {
    const E_anom = 2 * Math.atan2(Math.sqrt(1-e)*Math.sin(nu_anom/2), Math.sqrt(1+e)*Math.cos(nu_anom/2));
    M0 = E_anom - e * Math.sin(E_anom);
  } else {
    M0 = nu_anom;
  }
  if (![a, e, inc, Om, w, M0].every(Number.isFinite)) return null;

  return { a, e, i: inc, Om, w, M0: wrapToTwoPi(M0), epoch_JD: t_JD, nu: wrapToTwoPi(nu_anom) };
}

// Propagate using cart2kep elements (stored with radians, epoch_JD)
export function propagateElements(el: { a: number; e: number; i: number; Om: number; w: number; M0: number; epoch_JD: number }, jd: number) {
  return kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, jd);
}
