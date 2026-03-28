// Aster Physics Worker — Keplerian propagator
// Heliocentric Ecliptic J2000, positions in AU

const GM_sun = 1.327124400e20; // m³/s²
const AU = 1.496e11;           // m per AU
const J2000 = 2451545.0;       // JD of J2000 epoch
const TWO_PI = 2 * Math.PI;
const DEG = Math.PI / 180;

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

const PLANET_NAMES = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];

let asteroids = [];

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

// Convert Keplerian elements to heliocentric ecliptic Cartesian (AU)
// a_AU, e, i_rad, Om_rad, w_rad: orbital elements
// M0_rad: mean anomaly at epoch_JD
// t_JD: propagation time
function kep2cart(a_AU, e, i_rad, Om_rad, w_rad, M0_rad, epoch_JD, t_JD) {
  // Mean motion (rad/s)
  const a_m = a_AU * AU;
  const n = Math.sqrt(GM_sun / (a_m * a_m * a_m));

  // Mean anomaly at time t
  const dt = (t_JD - epoch_JD) * 86400.0; // seconds
  let M = M0_rad + n * dt;
  // Normalize M to [-π, π] for better NR convergence
  M = M - TWO_PI * Math.floor((M + Math.PI) / TWO_PI);

  // Eccentric anomaly
  const E = solveKepler(M, e);

  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  // Distance
  const r = a_AU * (1 - e * Math.cos(E));

  // Orbital plane coords
  const xo = r * Math.cos(nu);
  const yo = r * Math.sin(nu);

  // 3-1-3 Euler rotation: Ω (Om), i, ω (w) → ecliptic frame
  const cosOm = Math.cos(Om_rad), sinOm = Math.sin(Om_rad);
  const cosI  = Math.cos(i_rad),  sinI  = Math.sin(i_rad);
  const cosW  = Math.cos(w_rad),  sinW  = Math.sin(w_rad);

  const x = xo * (cosOm * cosW - sinOm * sinW * cosI) - yo * (cosOm * sinW + sinOm * cosW * cosI);
  const y = xo * (sinOm * cosW + cosOm * sinW * cosI) - yo * (sinOm * sinW - cosOm * cosW * cosI);
  const z = xo * (sinW * sinI) + yo * (cosW * sinI);

  return { x, y, z };
}

// Propagate a planet at Julian Date jd using Standish 1992 secular elements
function propagatePlanet(pIdx, jd) {
  const p = PLANETS[pIdx];
  const T = (jd - J2000) / 36525.0; // Julian centuries past J2000

  const a  = p[0] + p[1] * T;
  const e  = p[2] + p[3] * T;
  const i  = (p[4] + p[5] * T) * DEG;
  const Om = (p[6] + p[7] * T) * DEG;
  const L  = (p[8] + p[9] * T) * DEG;  // mean longitude
  const wb = (p[10] + p[11] * T) * DEG; // longitude of perihelion = Om + w

  const w  = wb - Om;            // argument of periapsis
  const M0 = L - wb;             // mean anomaly at J2000 (t_JD=jd, epoch_JD=jd → use as M directly)

  // kep2cart with epoch = J2000, M0 already propagated to current T
  // Since we computed M0 = L(t) - wb(t), this IS the current mean anomaly,
  // so we call with epoch_JD = jd so dt = 0
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

    // Planets (indices 0–23)
    for (let i = 0; i < 8; i++) {
      const pos = propagatePlanet(i, jd);
      buf[i * 3]     = pos.x;
      buf[i * 3 + 1] = pos.y;
      buf[i * 3 + 2] = pos.z;
    }

    // Asteroids (indices 24 onward)
    const base = 24;
    for (let i = 0; i < N; i++) {
      try {
        const pos = propagateAsteroid(asteroids[i], jd);
        buf[base + i * 3]     = pos.x;
        buf[base + i * 3 + 1] = pos.y;
        buf[base + i * 3 + 2] = pos.z;
      } catch (_) {
        buf[base + i * 3]     = 0;
        buf[base + i * 3 + 1] = 0;
        buf[base + i * 3 + 2] = 0;
      }
    }

    self.postMessage({ type: 'positions', buffer: buf }, [buf.buffer]);
  }
};
