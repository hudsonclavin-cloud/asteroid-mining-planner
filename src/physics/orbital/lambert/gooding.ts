import { GM_AU3_S2 } from '../../constants/index.js';
import { mag, dot, vscale, vsub } from '../../utils/vector.js';
import { stumpff } from './stumpff.js';
import { AU } from '../../constants/index.js';

// Lambert solver (Bate-Mueller-White universal variable method)
// r1v, r2v: position vectors in AU; tof_days: time of flight in days
// Returns { v1, v2 } velocity vectors in km/s, or null on failure
export function lambert(r1v: number[], r2v: number[], tof_days: number): { v1: number[]; v2: number[] } | null {
  const tof_s = tof_days * 86400;
  const mu = GM_AU3_S2;
  const r1 = mag(r1v), r2 = mag(r2v);
  if (r1 < 1e-10 || r2 < 1e-10) return null;

  const cos_dnu = Math.max(-1, Math.min(1, dot(r1v, r2v) / (r1 * r2)));
  // Determine transfer direction from cross product z-component
  const cz = r1v[0]*r2v[1] - r1v[1]*r2v[0];
  const sin_dnu = (cz >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, 1 - cos_dnu*cos_dnu));

  const denom = 1 - cos_dnu;
  if (Math.abs(denom) < 1e-8) return null;

  const A = sin_dnu * Math.sqrt(r1 * r2 / denom);
  if (!isFinite(A) || Math.abs(A) < 1e-10) return null;

  // tof(z): compute transfer time for universal variable z
  function tofZ(z: number): number {
    const [C, S] = stumpff(z);
    if (C < 1e-15) return Infinity;
    const y = r1 + r2 + A * (z * S - 1) / Math.sqrt(C);
    if (y <= 0) return Infinity;
    const x = Math.sqrt(y / C);
    const t = (x*x*x*S + A*Math.sqrt(y)) / Math.sqrt(mu);
    return isFinite(t) ? t : Infinity;
  }

  // Newton-Raphson with finite differences
  let z = 0;
  for (let iter = 0; iter < 50; iter++) {
    const t = tofZ(z);
    if (!isFinite(t)) { z += 0.5; continue; }
    const dz = Math.max(1e-5, Math.abs(z) * 0.002);
    const tp = tofZ(z + dz);
    if (!isFinite(tp)) { z -= 0.1; continue; }
    const dtdz = (tp - t) / dz;
    if (Math.abs(dtdz) < 1e-20) break;
    const step = (tof_s - t) / dtdz;
    z += Math.max(-20, Math.min(20, step));
    if (Math.abs(step) < 1e-7) break;
  }

  const [C, S] = stumpff(z);
  if (C < 1e-15) return null;
  const y = r1 + r2 + A * (z * S - 1) / Math.sqrt(C);
  if (y <= 0) return null;

  const f = 1 - y / r1;
  const g = A * Math.sqrt(y / mu);
  const gdot = 1 - y / r2;
  if (Math.abs(g) < 1e-15) return null;

  const v1_AU_s = vscale(vsub(r2v, vscale(r1v, f)), 1/g);
  const v2_AU_s = vscale(vsub(vscale(r2v, gdot), r1v), 1/g);

  const conv = AU / 1000; // AU/s → km/s
  return {
    v1: vscale(v1_AU_s, conv),
    v2: vscale(v2_AU_s, conv),
  };
}
