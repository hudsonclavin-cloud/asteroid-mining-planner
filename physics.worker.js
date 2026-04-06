// Aster Physics Worker — Keplerian propagator + burn simulator
// Heliocentric Ecliptic J2000, positions in AU, velocities in km/s

const GM_sun = 1.327124400e20; // m³/s²
const AU = 1.496e11;           // m per AU
const J2000 = 2451545.0;       // JD of J2000 epoch
const TWO_PI = 2 * Math.PI;
const DEG = Math.PI / 180;
const GM_AU3_S2 = GM_sun / (AU * AU * AU); // ~3.964e-14 AU³/s²
const GM_earth  = 3.986004418e14;          // m³/s²
const R_earth   = 6.3781e6;               // m

// Standish 1992 planet elements at J2000 + secular rates
// Format: [a0, da, e0, de, i0, di, Om0, dOm, L0, dL, wb0, dwb]
// L = mean longitude (= Om + w + M), wb = longitude of perihelion (= Om + w)
// All angles in degrees; rates per Julian century
const PLANETS = [
  // Mercury
  [0.38709927, 0.00000037, 0.20563593, 0.00001906,
   7.00497902, -0.00594749, 48.33076593, -0.12534081,
   252.25032350, 149472.67411175, 77.45779628, 0.16047689],
  // Venus
  [0.72333566, 0.00000390, 0.00677672, -0.00004107,
   3.39467605, -0.00078890, 76.67984255, -0.27769418,
   181.97909950, 58517.81538729, 131.60246718, 0.00268329],
  // Earth
  [1.00000261, 0.00000562, 0.01671123, -0.00004392,
   -0.00001531, -0.01294668, 0.0, 0.0,
   100.46457166, 35999.37244981, 102.93768193, 0.32327364],
  // Mars
  [1.52371034, 0.00001847, 0.09339410, 0.00007882,
   1.84969142, -0.00813131, 49.55953891, -0.29257343,
   -4.55343205, 19140.30268499, -23.94362959, 0.44441088],
  // Jupiter
  [5.20288700, -0.00011607, 0.04838624, -0.00013253,
   1.30439695, -0.00183714, 100.47390909, 0.20469106,
   34.39644051, 3034.74612775, 14.72847983, 0.21252668],
  // Saturn
  [9.53667594, -0.00125060, 0.05386179, -0.00050991,
   2.48599187, 0.00193609, 113.66242448, -0.28867794,
   49.95424423, 1222.49362201, 92.59887831, -0.41897216],
  // Uranus
  [19.18916464, -0.00196176, 0.04725744, -0.00004397,
   0.77263783, -0.00242939, 74.01692503, 0.04240589,
   313.23810451, 428.48202785, 170.95427630, 0.40805281],
  // Neptune
  [30.06992276, 0.00026291, 0.00859048, 0.00005105,
   1.77004347, 0.00035372, 131.78422574, -0.00508664,
   -55.12002969, 218.45945325, 44.96476227, -0.32241464],
];

let asteroids = [];

// ─── Vector helpers ──────────────────────────────────────────────────────────
function mag(v) { return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); }
function dot(a,b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function cross(a,b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function vscale(v,s) { return [v[0]*s, v[1]*s, v[2]*s]; }
function vsub(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }

// Stumpff functions C(z) and S(z) for Lambert solver
function stumpff(z) {
  if (z > 1e-6) {
    const sq = Math.sqrt(z);
    return [(1 - Math.cos(sq)) / z, (sq - Math.sin(sq)) / (sq * sq * sq)];
  }
  if (z < -1e-6) {
    const sq = Math.sqrt(-z);
    return [(1 - Math.cosh(sq)) / z, (Math.sinh(sq) - sq) / (sq * sq * sq)];
  }
  return [0.5, 1/6];
}

// Solve Kepler's equation via Newton-Raphson
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// Keplerian elements → heliocentric ecliptic Cartesian (AU, km/s)
function kep2cart(a_AU, e, i_rad, Om_rad, w_rad, M0_rad, epoch_JD, t_JD) {
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
function cart2kep(x, y, z, vx_kms, vy_kms, vz_kms, t_JD) {
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
  }

  // Mean anomaly via eccentric anomaly
  const E_anom = 2 * Math.atan2(Math.sqrt(1-e)*Math.sin(nu_anom/2), Math.sqrt(1+e)*Math.cos(nu_anom/2));
  const M0 = E_anom - e * Math.sin(E_anom);

  return { a, e, i: inc, Om, w, M0, epoch_JD: t_JD, nu: nu_anom };
}

// Propagate a planet at Julian Date jd using Standish 1992 secular elements
function propagatePlanet(pIdx, jd) {
  const p = PLANETS[pIdx];
  const T = (jd - J2000) / 36525.0;

  const a  = p[0] + p[1] * T;
  const e  = p[2] + p[3] * T;
  const i  = (p[4] + p[5] * T) * DEG;
  const Om = (p[6] + p[7] * T) * DEG;
  const L  = (p[8] + p[9] * T) * DEG;
  const wb = (p[10] + p[11] * T) * DEG;

  const w  = wb - Om;
  const M0 = L - wb;

  return kep2cart(a, e, i, Om, w, M0, jd, jd);
}

// Propagate asteroid at Julian Date jd
function propagateAsteroid(ast, jd) {
  const a    = ast.a;
  const e    = ast.e;
  const i    = ast.i * DEG;
  const Om   = ast.om * DEG;
  const w    = ast.w * DEG;
  const M0   = ast.ma * DEG;
  const epochJD = ast.epoch + 2400000.5; // MJD → JD

  return kep2cart(a, e, i, Om, w, M0, epochJD, jd);
}

// Propagate using new cart2kep elements (stored with radians, epoch_JD)
function propagateElements(el, jd) {
  return kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, jd);
}

// Apply ΔV burn (km/s in prograde/normal/radial) and return new elements
function applyBurn(ast_or_el, jd, dv_p, dv_n, dv_r) {
  let state;
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

// MOID approximation: sample both orbits independently, find minimum pairwise distance
// Accuracy ~0.01 AU (see DEVLOG.md)
function moidApprox(el, jd_ref, nPts) {
  nPts = nPts || 120;
  const earthPts = [];
  const astPts = [];
  const T_earth = 365.25;
  const T_ast = Math.sqrt(el.a * el.a * el.a) * 365.25;

  for (let k = 0; k < nPts; k++) {
    const f = k / nPts;
    earthPts.push(propagatePlanet(2, jd_ref + f * T_earth));
    if (el.epoch_JD !== undefined) {
      astPts.push(kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, el.epoch_JD + f * T_ast));
    } else {
      const epochJD = el.epoch + 2400000.5;
      astPts.push(kep2cart(el.a, el.e, el.i*DEG, el.om*DEG, el.w*DEG, el.ma*DEG, epochJD, epochJD + f * T_ast));
    }
  }

  let minDist = Infinity;
  for (let j = 0; j < nPts; j++) {
    for (let k = 0; k < nPts; k++) {
      const dx = astPts[j].x - earthPts[k].x;
      const dy = astPts[j].y - earthPts[k].y;
      const dz = astPts[j].z - earthPts[k].z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d < minDist) minDist = d;
    }
  }
  return minDist;
}

// Close approach scan: find top N closest Earth approaches over `years` years
function closeApproachScan(el, jd_start, years, n) {
  years = years || 5;
  n = n || 730;
  const dt = years * 365.25 / n;
  const localMins = [];
  let prevDist = null;
  let prevJD = jd_start;

  for (let k = 0; k <= n; k++) {
    const jd = jd_start + k * dt;
    let pos;
    try {
      pos = el.epoch_JD !== undefined ? propagateElements(el, jd) : propagateAsteroid(el, jd);
    } catch(_) { prevDist = null; continue; }
    const earth = propagatePlanet(2, jd);
    const dx = pos.x - earth.x, dy = pos.y - earth.y, dz = pos.z - earth.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (prevDist !== null && dist > prevDist && prevDist < 1.0) {
      localMins.push({ jd: prevJD, dist: prevDist });
    }
    prevDist = dist;
    prevJD = jd;
  }

  localMins.sort((a, b) => a.dist - b.dist);
  return localMins.slice(0, 3);
}

// Lambert solver (Bate-Mueller-White universal variable method)
// r1v, r2v: position vectors in AU; tof_days: time of flight in days
// Returns { v1, v2 } velocity vectors in km/s, or null on failure
function lambert(r1v, r2v, tof_days) {
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
  function tofZ(z) {
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

// ─── Izzo 2015 Lambert solver ─────────────────────────────────────────────────
// r1v, r2v: [x,y,z] in AU; tof_days: days; direction: 1=prograde, -1=retrograde
// Returns { v1, v2 } in km/s, or null on failure.
function izzoLambert(r1v, r2v, tof_days, direction) {
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
  const cross = [
    r1[1]*r2[2] - r1[2]*r2[1],
    r1[2]*r2[0] - r1[0]*r2[2],
    r1[0]*r2[1] - r1[1]*r2[0],
  ];
  const thetaGt180 = (direction === 1) ? (cross[2] < 0) : (cross[2] >= 0);

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
    r1hat[1]*cross[2] - r1hat[2]*cross[1],
    r1hat[2]*cross[0] - r1hat[0]*cross[2],
    r1hat[0]*cross[1] - r1hat[1]*cross[0],
  ]);
  const th2 = _unitVec([
    r2hat[1]*cross[2] - r2hat[2]*cross[1],
    r2hat[2]*cross[0] - r2hat[0]*cross[2],
    r2hat[0]*cross[1] - r2hat[1]*cross[0],
  ]);

  const f = 1 / 1000; // m/s → km/s
  return {
    v1: [(Vr1*r1hat[0] + Vt1*th1[0])*f, (Vr1*r1hat[1] + Vt1*th1[1])*f, (Vr1*r1hat[2] + Vt1*th1[2])*f],
    v2: [(Vr2*r2hat[0] + Vt2*th2[0])*f, (Vr2*r2hat[1] + Vt2*th2[1])*f, (Vr2*r2hat[2] + Vt2*th2[2])*f],
  };
}

function _izzTofDerivs(x, lam) {
  // Elliptic Lancaster-Blanchard TOF (Izzo 2015, Eq. 9) + derivatives
  const x2 = x * x;
  const omx2 = 1 - x2;
  if (omx2 < 1e-14) return { T: 1e30, dT: 0, d2T: 0, d3T: 0 };
  const inner = Math.max(0, 1 - lam * lam * omx2);
  const sqrtInner = Math.sqrt(inner);
  const b = lam * x;
  const T  = (Math.acos(x) + b * sqrtInner) / omx2;
  if (!isFinite(T)) return { T: 1e30, dT: 0, d2T: 0, d3T: 0 };
  const q  = (sqrtInner > 1e-14) ? b / sqrtInner : 0;
  const dT  = (1 - q * T) / omx2;
  const d2T = (2 * dT - q * dT * T + lam * lam) * (-x) / omx2;
  const d3T = (3 * d2T * x - 2 * dT + q * (T + T)) / omx2;
  return { T, dT, d2T, d3T };
}

function _unitVec(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n > 0 ? [v[0]/n, v[1]/n, v[2]/n] : [0, 0, 0];
}

// ─── Patched-conic helpers ────────────────────────────────────────────────────

// Compute patched-conic departure + arrival burns from a Lambert solution.
// v_earth, v_ast: heliocentric velocity vectors [km/s]
// v_t1, v_t2:    Lambert transfer velocities [km/s] at Earth and asteroid ends
// r_park_km:     parking orbit radius (km) from Earth centre
// Returns { dv_dep, dv_arr, C3, vinf_dep_mag, vinf_arr_mag }
function patchedConic(v_earth, v_t1, v_ast, v_t2, r_park_km) {
  const mu_e = 398600.4418; // km³/s²
  const rp   = r_park_km;

  const vinf_dep = [v_t1[0]-v_earth[0], v_t1[1]-v_earth[1], v_t1[2]-v_earth[2]];
  const vinf_dep_mag = Math.hypot(vinf_dep[0], vinf_dep[1], vinf_dep[2]);
  const C3 = vinf_dep_mag * vinf_dep_mag;

  const v_park = Math.sqrt(mu_e / rp);
  const v_hyp  = Math.sqrt(C3 + 2 * mu_e / rp);
  const dv_dep = v_hyp - v_park;

  const vinf_arr = [v_t2[0]-v_ast[0], v_t2[1]-v_ast[1], v_t2[2]-v_ast[2]];
  const dv_arr   = Math.hypot(vinf_arr[0], vinf_arr[1], vinf_arr[2]);

  return { dv_dep, dv_arr, C3, vinf_dep_mag, vinf_arr_mag: dv_arr };
}

// Compute destination-capture ΔV on return.
// v_inf_mag: arrival v-infinity at Earth [km/s]
function destinationCaptureDv(v_inf_mag, destination, r_park_km) {
  const mu_e = 398600.4418;
  const rp   = r_park_km;
  const v_circ = Math.sqrt(mu_e / rp);
  const v_hyp  = Math.sqrt(v_inf_mag * v_inf_mag + 2 * mu_e / rp);
  const dv_leo = v_hyp - v_circ;
  const extras = { leo:0, geo:1.5, l1:0.5, l2:0.5, lunar:1.7, mars:0.9 };
  return dv_leo + (extras[destination] || 0);
}

// Heuristic: flag low-C3 departures as lunar-assist candidates (v_inf < 3.2 km/s → C3 < ~10)
function checkLunarAssist(vinf_dep_mag) {
  return vinf_dep_mag < 3.2;
}

// ─── Message handler ─────────────────────────────────────────────────────────
self.onmessage = function(e) {
  const msg = e.data;

  if (msg.cmd === 'init') {
    asteroids = msg.asteroids || [];
    return;
  }

  if (msg.cmd === 'propagate') {
    const jd = msg.jd;
    const N = asteroids.length;
    const total = (8 + N) * 3;
    const buf = new Float32Array(total);

    for (let i = 0; i < 8; i++) {
      const pos = propagatePlanet(i, jd);
      buf[i*3]   = pos.x;
      buf[i*3+1] = pos.y;
      buf[i*3+2] = pos.z;
    }

    const base = 24;
    for (let i = 0; i < N; i++) {
      try {
        const pos = propagateAsteroid(asteroids[i], jd);
        buf[base+i*3]   = pos.x;
        buf[base+i*3+1] = pos.y;
        buf[base+i*3+2] = pos.z;
      } catch(_) {
        buf[base+i*3]   = 0;
        buf[base+i*3+1] = 0;
        buf[base+i*3+2] = 0;
      }
    }

    self.postMessage({ type: 'positions', buffer: buf }, [buf.buffer]);
    return;
  }

  if (msg.cmd === 'get_state') {
    const ast = asteroids[msg.ast_idx];
    if (!ast) return;
    const jd = msg.jd;
    const state = propagateAsteroid(ast, jd);
    const el = cart2kep(state.x, state.y, state.z, state.vx, state.vy, state.vz, jd);
    self.postMessage({ type: 'state', ...state, ...el });
    return;
  }

  if (msg.cmd === 'apply_burn') {
    const src = msg.elements || asteroids[msg.ast_idx];
    if (!src) return;
    const newEl = applyBurn(src, msg.jd, msg.dv_p || 0, msg.dv_n || 0, msg.dv_r || 0);
    if (!newEl) { self.postMessage({ type: 'burn_result', error: 'Singular state' }); return; }

    const period_days = TWO_PI * Math.sqrt(Math.pow(newEl.a, 3) / GM_AU3_S2) / 86400;
    const origEl = src.epoch_JD !== undefined ? src : {
      a: src.a, e: src.e, i: src.i*DEG, Om: src.om*DEG, w: src.w*DEG, M0: src.ma*DEG,
      epoch_JD: src.epoch + 2400000.5
    };
    const origPeriod = TWO_PI * Math.sqrt(Math.pow(origEl.a !== undefined ? origEl.a : src.a, 3) / GM_AU3_S2) / 86400;
    const moid = moidApprox(newEl, msg.jd, 120);

    self.postMessage({
      type: 'burn_result',
      elements: newEl,
      period_days,
      orig_period_days: origPeriod,
      moid_approx: moid,
    });
    return;
  }

  if (msg.cmd === 'close_approach_scan') {
    const el = msg.elements;
    const results = closeApproachScan(el, msg.jd_start, msg.years || 5, 730);
    self.postMessage({ type: 'close_approaches', results });
    return;
  }

  if (msg.cmd === 'porkchop') {
    const ast = msg.ast;
    const { jd_start, jd_end, tof_min, tof_max, nx, ny } = msg;
    const burnEl = msg.burn_elements || null;

    const grid = new Float32Array(nx * ny);

    for (let i = 0; i < nx; i++) {
      const t1 = jd_start + i / (nx - 1) * (jd_end - jd_start);
      let r1, v_ast;
      try {
        const s1 = burnEl ? propagateElements(burnEl, t1) : propagateAsteroid(ast, t1);
        r1 = [s1.x, s1.y, s1.z];
        v_ast = [s1.vx, s1.vy, s1.vz];
      } catch(_) {
        for (let j = 0; j < ny; j++) grid[i*ny+j] = 20;
        continue;
      }

      for (let j = 0; j < ny; j++) {
        const tof = tof_min + j / (ny - 1) * (tof_max - tof_min);
        const t2 = t1 + tof;
        try {
          const earth2 = propagatePlanet(2, t2);
          const r2 = [earth2.x, earth2.y, earth2.z];
          const v_earth2 = [earth2.vx, earth2.vy, earth2.vz];

          const lam = lambert(r1, r2, tof);
          if (!lam) { grid[i*ny+j] = 20; continue; }

          const dv_dep = Math.sqrt(
            Math.pow(lam.v1[0]-v_ast[0],2) +
            Math.pow(lam.v1[1]-v_ast[1],2) +
            Math.pow(lam.v1[2]-v_ast[2],2)
          );
          const dv_arr = Math.sqrt(
            Math.pow(lam.v2[0]-v_earth2[0],2) +
            Math.pow(lam.v2[1]-v_earth2[1],2) +
            Math.pow(lam.v2[2]-v_earth2[2],2)
          );
          grid[i*ny+j] = Math.min(20, dv_dep + dv_arr);
        } catch(_) {
          grid[i*ny+j] = 20;
        }
      }
    }

    self.postMessage({ type: 'porkchop', grid, nx, ny, jd_start, jd_end, tof_min, tof_max }, [grid.buffer]);
    return;
  }

  if (msg.cmd === 'plan_mission') {
    const { ast, jd_start, jd_end, destination, parkingAlt_km, spacecraft, stayDays: stayMsg } = msg;
    const r_park_km = 6371 + (parkingAlt_km || 400);
    const STAY_DEF  = { light: 14, medium: 45, heavy: 90 };
    const stayDays  = stayMsg || STAY_DEF[spacecraft] || 45;

    const STEP_DEP  = 15;
    const TOF_STEPS = 24;
    const TOF_MIN   = 60, TOF_MAX = 600;

    const totalDeps = Math.ceil((jd_end - jd_start) / STEP_DEP);
    let depIdx = 0;
    const phase1 = [];

    // ── Phase 1: outbound Lambert grid ──────────────────────────────────────
    for (let jd_dep = jd_start; jd_dep <= jd_end; jd_dep += STEP_DEP) {
      depIdx++;
      if (depIdx % 15 === 0) {
        self.postMessage({
          type: 'plan_progress',
          pct: 0.5 * depIdx / totalDeps,
          label: `Phase 1/2 — Scanning outbound windows (${depIdx}/${totalDeps} dates)...`,
        });
      }

      let earthDep;
      try { earthDep = propagatePlanet(2, jd_dep); } catch(_) { continue; }
      const r1 = [earthDep.x, earthDep.y, earthDep.z];
      const ve  = [earthDep.vx, earthDep.vy, earthDep.vz];

      for (let step = 0; step <= TOF_STEPS; step++) {
        const tof    = TOF_MIN + (TOF_MAX - TOF_MIN) * step / TOF_STEPS;
        const jd_arr = jd_dep + tof;

        let astArr;
        try { astArr = propagateAsteroid(ast, jd_arr); } catch(_) { continue; }
        const r2 = [astArr.x, astArr.y, astArr.z];
        const va  = [astArr.vx, astArr.vy, astArr.vz];

        let lam = izzoLambert(r1, r2, tof);
        if (!lam) lam = lambert(r1, r2, tof);
        if (!lam) continue;

        const pc = patchedConic(ve, lam.v1, va, lam.v2, r_park_km);
        if (!pc) continue;
        if (pc.dv_dep > 15 || pc.dv_arr > 15) continue; // infeasible single-burn

        phase1.push({
          jd_dep, jd_arr, tof,
          dv_dep: pc.dv_dep, dv_arr: pc.dv_arr,
          dv_mcc: 0.02 * (pc.dv_dep + pc.dv_arr),
          C3: pc.C3,
          vinf_dep: pc.vinf_dep_mag,
          vinf_arr: pc.vinf_arr_mag,
          earthPos: { x: r1[0], y: r1[1], z: r1[2] },
          astPos:   { x: r2[0], y: r2[1], z: r2[2] },
        });
      }
    }

    // Keep top 30 outbound by combined outbound ΔV
    phase1.sort((a, b) => (a.dv_dep + a.dv_arr) - (b.dv_dep + b.dv_arr));
    const candidates = phase1.slice(0, 30);

    // ── Phase 2: return Lambert + destination capture ────────────────────────
    const results = [];
    for (let ci = 0; ci < candidates.length; ci++) {
      const c = candidates[ci];
      self.postMessage({
        type: 'plan_progress',
        pct: 0.5 + 0.5 * (ci + 1) / candidates.length,
        label: `Phase 2/2 — Return trajectories (${ci+1}/${candidates.length})...`,
      });

      const jd_ret_dep = c.jd_arr + stayDays;
      let bestReturn = null;

      for (let rs = 0; rs <= 20; rs++) {
        const ret_tof     = 60 + 540 * rs / 20;
        const jd_ret_arr  = jd_ret_dep + ret_tof;

        let astDep, earthArr;
        try { astDep  = propagateAsteroid(ast, jd_ret_dep); } catch(_) { continue; }
        try { earthArr = propagatePlanet(2, jd_ret_arr);    } catch(_) { continue; }

        const rr1 = [astDep.x,   astDep.y,   astDep.z];
        const rr2 = [earthArr.x, earthArr.y, earthArr.z];
        const vad = [astDep.vx,  astDep.vy,  astDep.vz];
        const ved = [earthArr.vx,earthArr.vy,earthArr.vz];

        let lam = izzoLambert(rr1, rr2, ret_tof);
        if (!lam) lam = lambert(rr1, rr2, ret_tof);
        if (!lam) continue;

        const dv_ret_dep = Math.hypot(lam.v1[0]-vad[0], lam.v1[1]-vad[1], lam.v1[2]-vad[2]);
        const vinf_ret   = Math.hypot(lam.v2[0]-ved[0], lam.v2[1]-ved[1], lam.v2[2]-ved[2]);
        const dv_cap     = destinationCaptureDv(vinf_ret, destination, r_park_km);
        const total_return = dv_ret_dep + dv_cap;

        if (!bestReturn || total_return < bestReturn.total_return) {
          bestReturn = { dv_return: dv_ret_dep, dv_capture: dv_cap,
            vinf_return: vinf_ret, tof_return: ret_tof, jd_ret_arr, total_return };
        }
      }
      if (!bestReturn) continue;

      const mcc = c.dv_mcc + 0.02 * bestReturn.dv_return;
      const dv_total = c.dv_dep + c.dv_arr + mcc + bestReturn.dv_return + bestReturn.dv_capture;
      if (dv_total > 20) continue; // infeasible round-trip

      results.push({
        jd_dep:    c.jd_dep,
        jd_arr:    c.jd_arr,
        jd_ret_dep,
        jd_ret_arr: bestReturn.jd_ret_arr,
        tof:        c.tof,
        tof_return: bestReturn.tof_return,
        stay_days:  stayDays,
        dv_dep:     +c.dv_dep.toFixed(3),
        dv_arr:     +c.dv_arr.toFixed(3),
        dv_mcc:     +mcc.toFixed(3),
        dv_return:  +bestReturn.dv_return.toFixed(3),
        dv_capture: +bestReturn.dv_capture.toFixed(3),
        dv_total:   +dv_total.toFixed(3),
        C3:         +c.C3.toFixed(3),
        vinf_dep:   +c.vinf_dep.toFixed(3),
        vinf_arr:   +c.vinf_arr.toFixed(3),
        vinf_return:+bestReturn.vinf_return.toFixed(3),
        lunarAssist: checkLunarAssist(c.vinf_dep),
        earthPos:   c.earthPos,
        astPos:     c.astPos,
      });
    }

    results.sort((a, b) => a.dv_total - b.dv_total);
    const top = results.slice(0, 10);
    self.postMessage({ type: 'plan_result', results: top, noFeasibleWindow: top.length === 0 });
    return;
  }

  if (msg.cmd === 'query_pos') {
    const { jd, planetIdx, reqId } = msg;
    try {
      const s = propagatePlanet(planetIdx, jd);
      self.postMessage({ type: 'query_pos_result', reqId, ok: true,
        x: s.x, y: s.y, z: s.z, vx: s.vx, vy: s.vy, vz: s.vz });
    } catch(e) {
      self.postMessage({ type: 'query_pos_result', reqId, ok: false });
    }
    return;
  }

  if (msg.cmd === 'fetch_nhats') {
    (async function() {
      const urls = [
        'https://aster-proxy.hudsonclavin.workers.dev/api/nhats?dv=12&dur=450&stay=8&launch=2025-2035',
        'https://aster-proxy.hudsonclavin.workers.dev/api/nhats?dv=12&dur=450&stay=8',
      ];
      for (const url of urls) {
        try {
          console.log('[NHATS worker] fetching:', url);
          const r = await fetch(url);
          console.log('[NHATS worker] status:', r.status, r.ok);
          if (!r.ok) { console.warn('[NHATS worker] HTTP error:', r.status); continue; }
          const json = await r.json();
          console.log('[NHATS worker] raw keys:', Object.keys(json));
          const rows = json.data || json.nhats || [];
          console.log('[NHATS worker] parsed', rows.length, 'rows');
          self.postMessage({ type: 'nhats_result', ok: true, data: rows });
          return;
        } catch(err) {
          console.warn('[NHATS worker] fetch error:', err.message);
        }
      }
      self.postMessage({ type: 'nhats_result', ok: false, error: 'All NHATS URLs failed' });
    })();
    return;
  }

  if (msg.cmd === 'fetch_catalog') {
    (async function() {
      const limit = msg.limit || 5000;
      const CORS_PROXY = 'https://corsproxy.io/?';

      // ── Asterank: broad query, sorted by score ────────────────────────────
      const ASTERANK_URL = 'https://www.asterank.com/api/asterank?' +
        'query=%7B%7D&limit=5000&sort=score';

      // ── NHATS: human-accessible targets ──────────────────────────────────
      const NHATS_URL = 'https://aster-proxy.hudsonclavin.workers.dev/api/nhats?dv=12&dur=450&stay=8&launch=2025-2035';

      async function fetchAsterankWorker() {
        try {
          let r = await fetch(ASTERANK_URL);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const rows = await r.json();
          console.log('[Catalog] Asterank:', rows.length, 'rows');
          self.postMessage({ type: 'load_progress', source: 'asterank', status: 'ok', count: rows.length });
          return rows;
        } catch(err1) {
          console.warn('[Catalog] Asterank direct failed, trying proxy:', err1.message);
          try {
            const r = await fetch(CORS_PROXY + encodeURIComponent(ASTERANK_URL));
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const rows = await r.json();
            console.log('[Catalog] Asterank (proxy):', rows.length, 'rows');
            self.postMessage({ type: 'load_progress', source: 'asterank', status: 'ok', count: rows.length });
            return rows;
          } catch(err2) {
            console.warn('[Catalog] Asterank proxy also failed:', err2.message);
            self.postMessage({ type: 'load_progress', source: 'asterank', status: 'error', error: err2.message });
            return [];
          }
        }
      }

      async function fetchNHATSWorker() {
        const urls = [NHATS_URL, 'https://aster-proxy.hudsonclavin.workers.dev/api/nhats?dv=12&dur=450&stay=8'];
        for (const url of urls) {
          try {
            const r = await fetch(url);
            if (!r.ok) continue;
            const json = await r.json();
            const rows = json.data || json.nhats || [];
            console.log('[Catalog] NHATS:', rows.length, 'rows');
            self.postMessage({ type: 'load_progress', source: 'nhats', status: 'ok', count: rows.length });
            return rows;
          } catch(_) {}
        }
        self.postMessage({ type: 'load_progress', source: 'nhats', status: 'error', error: 'offline' });
        return [];
      }

      // Fetch in parallel
      const [asterankRows, nhatsRows] = await Promise.all([
        fetchAsterankWorker(), fetchNHATSWorker()
      ]);

      const nhatsLookup = new Map();
      for (const row of nhatsRows) {
        const key = (row.des || '').trim();
        if (key) nhatsLookup.set(key, row);
      }

      // ── Estimate value for asteroids not in Asterank ──────────────────────
      function estimateValue(specStr, diamKm, albedoStr) {
        const d = Number(diamKm) || 0;
        if (d <= 0) return 0;
        const dM = d * 1000;
        const vol = (4 / 3) * Math.PI * Math.pow(dM / 2, 3);
        const s = (specStr || '').trim().charAt(0).toUpperCase();
        const density = (s === 'M' || s === 'E') ? 5000 : (s === 'S' || s === 'Q') ? 2700 : 1700;
        const valuePerKg = (s === 'M' || s === 'E') ? 100 : (s === 'S' || s === 'Q') ? 10 : 50;
        return vol * density * valuePerKg;
      }

      // ── Build catalog from Asterank (primary source) ─────────────────────
      const catalog = [];
      for (const row of asterankRows) {
        const a = Number(row.a);
        const e = Number(row.e);
        if (!a || a <= 0 || e < 0 || e >= 1) continue;

        const pdes     = String(row.pdes || row.full_name || '').trim();
        const epoch    = Number(row.epoch) || 51544.5; // Asterank gives MJD directly
        const diameter = Number(row.diameter) || 0;
        const specRaw  = String(row.spec || row.spec_T || '').trim();
        const per      = Number(row.per) || Math.sqrt(a * a * a); // Kepler's 3rd law: T = a^1.5 yr

        // Derive NEA class from orbital elements when Asterank omits it
        let astClass = String(row.class || '').trim();
        if (!astClass) {
          const q = a * (1 - e); // perihelion AU
          const Q = a * (1 + e); // aphelion  AU
          if (Q < 0.983)      astClass = 'IEO';
          else if (a < 1.0)   astClass = 'ATE';
          else if (q < 1.017) astClass = 'APO';
          else                astClass = 'AMO';
        }

        const nhatsRow = nhatsLookup.get(pdes) ||
                         nhatsLookup.get(pdes.replace(/\s+.*/, ''));

        catalog.push({
          a, e,
          i:         Number(row.i)       || 0,
          om:        Number(row.om)      || 0,
          w:         Number(row.w)       || 0,
          ma:        Number(row.ma)      || 0,
          epoch, per,
          pdes,
          full_name: String(row.full_name || row.name || pdes).trim(),
          name:      String(row.name     || '').trim(),
          class:     astClass,
          pha:       row.pha  || 'N',
          H:         Number(row.H)       || 20,
          diameter,
          albedo:    Number(row.albedo)  || 0.15,
          spec:      specRaw || 'C',
          spec_T:    String(row.spec_T   || specRaw || '').trim(),
          price:     Number(row.price)   || estimateValue(specRaw, diameter, 0.15),
          profit:    Number(row.profit)  || 0,
          moid:      Number(row.moid)    || 0,
          delta_v:   Number(row.delta_v) || 0,
          nhats: nhatsRow ? {
            accessible:    true,
            minDv:         nhatsRow.min_dv,
            minDur:        nhatsRow.min_dur,
            nTrajectories: nhatsRow.n_via_points,
            stayTime:      nhatsRow.min_stay,
            occ:           nhatsRow.occ,
          } : { accessible: false },
          _nhats: !!nhatsRow,
        });
      }

      // Sort by value descending, trim to limit
      catalog.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      const trimmed = catalog.slice(0, limit);

      console.log('[Catalog] Asterank →', catalog.length, 'valid, sending', trimmed.length, 'asteroids');
      self.postMessage({ type: 'catalog_ready', data: trimmed, nhatsRows });
    })();
    return;
  }
};
