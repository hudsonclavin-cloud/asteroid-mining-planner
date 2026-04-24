import { GM_sun, AU } from '../../constants/index.js';

// ─── Izzo 2015 Lambert solver ─────────────────────────────────────────────────
// r1v, r2v: [x,y,z] in AU; tof_days: days; direction: 1=prograde, -1=retrograde
// Returns { v1, v2 } in km/s, or null on failure.
export function izzoLambert(r1v: number[], r2v: number[], tof_days: number, direction?: number): { v1: number[]; v2: number[] } | null {
  direction = direction || 1;
  const tof = tof_days * 86400; // seconds
  const mu  = GM_sun;

  const r1 = r1v.map(v => v * AU);
  const r2 = r2v.map(v => v * AU);
  const r1n = Math.hypot(r1[0], r1[1], r1[2]);
  const r2n = Math.hypot(r2[0], r2[1], r2[2]);
  if (r1n < 1e3 || r2n < 1e3 || tof <= 0) return null;

  const c = Math.hypot(r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]);
  const s = (r1n + r2n + c) / 2;
  if (s < 1e3 || c < 1e3) return null;

  // Cross product for transfer direction
  const crossVec = [
    r1[1]*r2[2] - r1[2]*r2[1],
    r1[2]*r2[0] - r1[0]*r2[2],
    r1[0]*r2[1] - r1[1]*r2[0],
  ];
  const thetaGt180 = (direction === 1) ? (crossVec[2] < 0) : (crossVec[2] >= 0);

  const lambda2 = 1 - c / s;
  let lambda = Math.sqrt(Math.max(0, lambda2));
  if (thetaGt180) lambda = -lambda;

  // Non-dimensional TOF
  const T = tof * Math.sqrt(2 * mu / (s * s * s));
  if (!isFinite(T) || T <= 0) return null;

  // Initial guess
  const sqL = Math.sqrt(1 - lambda * lambda);
  const T0 = Math.acos(lambda) + lambda * sqL;
  let x = (T >= T0) ? (T0 / T - 1) : Math.min(0.98, T0 / T);

  // Householder 3rd-order iterations
  for (let iter = 0; iter < 60; iter++) {
    const { T: Tx, dT, d2T, d3T } = _izzTofDerivs(x, lambda);
    const dx = Tx - T;
    if (Math.abs(dx) < 1e-12 * (Math.abs(T) + 1)) break;
    if (Math.abs(dT) < 1e-20) break;
    const h2 = d2T / (2 * dT);
    const h3 = d3T / (6 * dT) - h2 * h2;
    const step = dx / (dT * (1 + dx * (h2 + dx * h3)));
    x -= step;
    if (x <= -1) x = -0.99;
    else if (x >= 1) x = 0.99;
  }
  if (!isFinite(x) || Math.abs(x) >= 1) return null;

  // Recover velocities
  const gamma = Math.sqrt(mu * s / 2);
  const rho   = (r1n - r2n) / c;
  const sigma = Math.sqrt(Math.max(0, 1 - rho * rho));
  const y     = Math.sqrt(Math.max(0, 1 - lambda2 * (1 - x * x)));
  if (y < 1e-10) return null;

  const Vr1 =  gamma * ((lambda * y - x) - rho * (lambda * y + x)) / r1n;
  const Vr2 = -gamma * ((lambda * y - x) + rho * (lambda * y + x)) / r2n;
  const Vt1 =  gamma * sigma * (y + lambda * x) / r1n;
  const Vt2 =  gamma * sigma * (y + lambda * x) / r2n;

  const r1hat = r1.map(v => v / r1n);
  const r2hat = r2.map(v => v / r2n);
  const th1 = _unitVec([
    r1hat[1]*crossVec[2] - r1hat[2]*crossVec[1],
    r1hat[2]*crossVec[0] - r1hat[0]*crossVec[2],
    r1hat[0]*crossVec[1] - r1hat[1]*crossVec[0],
  ]);
  const th2 = _unitVec([
    r2hat[1]*crossVec[2] - r2hat[2]*crossVec[1],
    r2hat[2]*crossVec[0] - r2hat[0]*crossVec[2],
    r2hat[0]*crossVec[1] - r2hat[1]*crossVec[0],
  ]);

  const f = 1 / 1000; // m/s → km/s
  return {
    v1: [(Vr1*r1hat[0] + Vt1*th1[0])*f, (Vr1*r1hat[1] + Vt1*th1[1])*f, (Vr1*r1hat[2] + Vt1*th1[2])*f],
    v2: [(Vr2*r2hat[0] + Vt2*th2[0])*f, (Vr2*r2hat[1] + Vt2*th2[1])*f, (Vr2*r2hat[2] + Vt2*th2[2])*f],
  };
}

export function _izzTofDerivs(x: number, lam: number): { T: number; dT: number; d2T: number; d3T: number } {
  // Elliptic Lancaster-Blanchard TOF (Izzo 2015, Eq. 9) + derivatives
  // T(x) = (acos(x) + λx·sqrt(1-x²)) / (1-x²)
  const x2 = x * x;
  const omx2 = 1 - x2;
  if (omx2 < 1e-14) return { T: 1e30, dT: 0, d2T: 0, d3T: 0 };
  const sqrtOmx2 = Math.sqrt(omx2);
  const T  = (Math.acos(x) + lam * x * sqrtOmx2) / omx2;
  if (!isFinite(T)) return { T: 1e30, dT: 0, d2T: 0, d3T: 0 };
  const q  = (sqrtOmx2 > 1e-14) ? (lam * x) / sqrtOmx2 : 0;
  const dT  = (1 - q * T) / omx2;
  const d2T = (2 * dT - q * dT * T + lam * lam) * (-x) / omx2;
  const d3T = (3 * d2T * x - 2 * dT + q * (T + T)) / omx2;
  return { T, dT, d2T, d3T };
}

export function _unitVec(v: number[]): number[] {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n > 0 ? [v[0]/n, v[1]/n, v[2]/n] : [0, 0, 0];
}
