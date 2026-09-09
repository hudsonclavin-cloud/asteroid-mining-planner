#!/usr/bin/env node
/**
 * MATH AUDIT script 1 — propagator core: closed forms, conservation, round-trips,
 * Kepler convergence, adversarial inputs. Repo READ-ONLY; writes only to audit/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = 'C:/Users/hudso/Documents/aster-slice18/build-v2x';
const OUT = 'C:/Users/hudso/Documents/aster-slice18/audit/audit-1-results.json';

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { propagateKeplerianStateVectors, solveKeplerEquation, GM_SUN_M3_S2 } = await imp('core/propagators/keplerian.js');
const { ingestSlice9Fixture } = await imp('boundary/slice9-nea-catalog.js');
const { cartesianToElements } = await import(pathToFileURL(path.join(REPO, 'tools/slice7-research/state-to-elements.mjs')).href);

const AU_M = 149597870.7e3;
const SPD = 86400;
const J2000 = 2451545.0;
const EPS_OBL = (84381.448 * Math.PI) / (180 * 3600);
const R = { checks: {} };
const mag = (v) => Math.hypot(v.x, v.y, v.z);

// ---------- 2.1 CLOSED FORMS ----------
// (a) circular orbit: |r| and |v| constant; period = 2*pi*sqrt(a^3/mu) closes the orbit.
{
  const a = AU_M;
  const el = { aM: a, e: 0, iRad: 0.3, omRad: 1.1, wRad: 0.7, maRad: 0.2, epochTdbSeconds: 0 };
  const P = 2 * Math.PI * Math.sqrt(a ** 3 / GM_SUN_M3_S2);
  let rMin = Infinity, rMax = -Infinity, vMin = Infinity, vMax = -Infinity;
  for (let k = 0; k <= 400; k += 1) {
    const s = propagateKeplerianStateVectors(el, (k / 400) * P);
    const r = mag(s.positionM), v = mag(s.velocityMps);
    rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
    vMin = Math.min(vMin, v); vMax = Math.max(vMax, v);
  }
  const s0 = propagateKeplerianStateVectors(el, 0);
  const sP = propagateKeplerianStateVectors(el, P);
  R.checks.circular = {
    method: 'closed-form: e=0 orbit, 400 samples over one period',
    radiusRelVariation: (rMax - rMin) / rMax,
    speedRelVariation: (vMax - vMin) / vMax,
    periodClosureRelPos: mag({ x: sP.positionM.x - s0.positionM.x, y: sP.positionM.y - s0.positionM.y, z: sP.positionM.z - s0.positionM.z }) / AU_M,
    wouldCatch: 'wrong mean motion, wrong GM, non-uniform circular motion, period error',
  };
}
// (b) equatorial (i=0) orbit: orbit pole in OUTPUT frame must equal the obliquity-rotated
// ecliptic pole (0, -sin eps, cos eps) — an independent check of the rotation direction.
{
  const el = { aM: 1.2 * AU_M, e: 0.3, iRad: 0, omRad: 0, wRad: 0.5, maRad: 1.0, epochTdbSeconds: 0 };
  const s1 = propagateKeplerianStateVectors(el, 0);
  const s2 = propagateKeplerianStateVectors(el, 5e6);
  const h = {
    x: s1.positionM.y * s1.velocityMps.z - s1.positionM.z * s1.velocityMps.y,
    y: s1.positionM.z * s1.velocityMps.x - s1.positionM.x * s1.velocityMps.z,
    z: s1.positionM.x * s1.velocityMps.y - s1.positionM.y * s1.velocityMps.x,
  };
  const hm = mag(h);
  const expected = { x: 0, y: -Math.sin(EPS_OBL), z: Math.cos(EPS_OBL) };
  R.checks.equatorialPole = {
    method: 'closed-form: i=0 orbit pole vs independently computed rotated ecliptic pole',
    poleDotExpected: (h.x * expected.x + h.y * expected.y + h.z * expected.z) / hm,
    poleError: Math.hypot(h.x / hm - expected.x, h.y / hm - expected.y, h.z / hm - expected.z),
    wouldCatch: 'wrong obliquity rotation direction or double/missing rotation',
  };
  void s2;
}
// (c) e >= 1 rejection boundary
{
  const tryE = (e) => {
    try { propagateKeplerianStateVectors({ aM: AU_M, e, iRad: 0, omRad: 0, wRad: 0, maRad: 0, epochTdbSeconds: 0 }, 1000); return 'accepted'; }
    catch (err) { return 'rejected: ' + err.constructor.name; }
  };
  R.checks.eBoundary = {
    method: 'boundary probe',
    'e=0.999999999': tryE(0.999999999),
    'e=1': tryE(1),
    'e=1.0000001': tryE(1.0000001),
    'e=-1e-16': tryE(-1e-16),
    wouldCatch: 'rejection not exactly at the claimed e>=1 boundary',
  };
}

// ---------- 2.3 CONSERVED QUANTITIES over 2026-2046 ----------
{
  const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
  const rows = {};
  for (const des of ['433', '99942', '2017 UR52', '105140', '2021 CG6']) {
    const b = Object.values(catalog.asteroids).find((x) => x.designation === des);
    const el = b.elements;
    let e0 = null, h0 = null, eMaxRel = 0, hMaxRel = 0;
    for (let k = 0; k <= 500; k += 1) {
      const t = ((2461041.5 - J2000) + (k / 500) * 7305) * SPD;
      const s = propagateKeplerianStateVectors(el, t);
      const r = mag(s.positionM), v = mag(s.velocityMps);
      const energy = (v * v) / 2 - GM_SUN_M3_S2 / r;
      const h = mag({
        x: s.positionM.y * s.velocityMps.z - s.positionM.z * s.velocityMps.y,
        y: s.positionM.z * s.velocityMps.x - s.positionM.x * s.velocityMps.z,
        z: s.positionM.x * s.velocityMps.y - s.positionM.y * s.velocityMps.x,
      });
      if (e0 === null) { e0 = energy; h0 = h; continue; }
      eMaxRel = Math.max(eMaxRel, Math.abs((energy - e0) / e0));
      hMaxRel = Math.max(hMaxRel, Math.abs((h - h0) / h0));
    }
    rows[des] = { energyMaxRelDrift: eMaxRel, angMomMaxRelDrift: hMaxRel };
  }
  R.checks.conservation = {
    method: 'specific energy + |h| at 501 epochs across 2026-2046, catalog elements',
    rows,
    wouldCatch: 'algebra errors in the E->state mapping, velocity formula errors, GM inconsistency between position and velocity',
  };
}

// ---------- 2.7 KEPLER CONVERGENCE SWEEP ----------
{
  let worstResid = 0, worstAt = null, throwCount = 0;
  const es = [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99, 0.996, 0.999, 0.9999];
  for (const e of es) {
    for (let k = 0; k < 1440; k += 1) {
      const M = -Math.PI + (k / 1440) * 2 * Math.PI;
      try {
        const E = solveKeplerEquation(M, e);
        const resid = Math.abs(E - e * Math.sin(E) - ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) > Math.PI
          ? E - e * Math.sin(E) - M
          : E - e * Math.sin(E) - M);
        const r = Math.abs(E - e * Math.sin(E) - M);
        if (r > worstResid) { worstResid = r; worstAt = { e, M }; }
        void resid;
      } catch { throwCount += 1; }
    }
  }
  R.checks.keplerSweep = {
    method: 'residual |E - e sinE - M| after solve, 12 eccentricities x 1440 mean anomalies (17,280 solves)',
    worstResidualRad: worstResid, worstAt, throwCount,
    wouldCatch: 'silent partial convergence (tolerance on step, not residual), divergence at high e near M=0',
  };
}

// ---------- 2.2 ROUND-TRIP GRID incl. singular regimes ----------
{
  const D2R = Math.PI / 180;
  const grid = [];
  for (const e of [0, 1e-8, 0.1, 0.5, 0.9, 0.99, 0.999]) {
    for (const iDeg of [0, 1e-6, 30, 90, 150, 179.9, 180]) {
      for (const maDeg of [0, 90, 179.5, 180.5, 270]) {
        grid.push({ e, iDeg, maDeg });
      }
    }
  }
  let worst = null;
  const regimes = {};
  for (const g of grid) {
    const el = { aM: 1.7 * AU_M, e: g.e, iRad: g.iDeg * D2R, omRad: 0.9, wRad: 2.2, maRad: g.maDeg * D2R, epochTdbSeconds: 7.5e8 };
    const s = propagateKeplerianStateVectors(el, el.epochTdbSeconds);
    const rec = cartesianToElements({
      position_km: [s.positionM.x / 1000, s.positionM.y / 1000, s.positionM.z / 1000],
      velocity_km_per_s: [s.velocityMps.x / 1000, s.velocityMps.y / 1000, s.velocityMps.z / 1000],
      epoch_tdb_jd: J2000 + el.epochTdbSeconds / SPD,
    });
    const el2 = { aM: rec.a * 1000, e: rec.e, iRad: rec.i, omRad: rec.om, wRad: rec.w, maRad: rec.ma, epochTdbSeconds: el.epochTdbSeconds };
    let posErrM;
    try {
      const s2 = propagateKeplerianStateVectors(el2, el.epochTdbSeconds);
      posErrM = mag({ x: s2.positionM.x - s.positionM.x, y: s2.positionM.y - s.positionM.y, z: s2.positionM.z - s.positionM.z });
    } catch (err) {
      posErrM = 'THREW: ' + err.message;
    }
    const key = `e=${g.e >= 0.99 ? 'high' : g.e <= 1e-8 ? '~0' : 'mid'},i=${g.iDeg >= 179 ? '~180' : g.iDeg <= 1e-5 ? '~0' : 'mid'}`;
    const prev = regimes[key];
    const err = typeof posErrM === 'number' ? posErrM : Infinity;
    if (!prev || err > prev.posErrM_num) regimes[key] = { posErrM: posErrM, posErrM_num: err, at: g };
    if (typeof posErrM === 'number' && (worst === null || posErrM > worst.posErrM)) worst = { posErrM, at: g };
  }
  for (const k of Object.keys(regimes)) delete regimes[k].posErrM_num;
  R.checks.roundTrip = {
    method: 'elements -> state (propagator) -> cartesianToElements -> state again; position residual, 245-case grid',
    worst, byRegime: regimes,
    wouldCatch: 'inverse-rotation mismatch, anomaly-conversion errors (incl. tan(nu/2) near apoapsis), singular-regime blowups',
  };
}

// ---------- 2.10 ADVERSARIAL ----------
{
  const probe = (label, fn) => {
    try { const v = fn(); return label + ': returned ' + (v === null ? 'null' : typeof v === 'object' ? 'object' : String(v)); }
    catch (err) { return label + ': threw ' + err.constructor.name; }
  };
  const base = { aM: AU_M, e: 0.2, iRad: 0.1, omRad: 0, wRad: 0, maRad: 0, epochTdbSeconds: 0 };
  R.checks.adversarialPropagator = [
    probe('aM=-1', () => propagateKeplerianStateVectors({ ...base, aM: -1 }, 0)),
    probe('aM=0', () => propagateKeplerianStateVectors({ ...base, aM: 0 }, 0)),
    probe('e=NaN', () => propagateKeplerianStateVectors({ ...base, e: NaN }, 0)),
    probe('ma=Infinity', () => propagateKeplerianStateVectors({ ...base, maRad: Infinity }, 0)),
    probe('t=NaN', () => propagateKeplerianStateVectors(base, NaN)),
    probe('t=1e30 (huge)', () => { const s = propagateKeplerianStateVectors(base, 1e30); return Number.isFinite(s.positionM.x) ? 'finite state' : 'NON-FINITE STATE'; }),
    probe('gm=-1', () => propagateKeplerianStateVectors(base, 0, { gmM3S2: -1 })),
  ];
  R.checks.adversarialC2E = [
    probe('zero position', () => cartesianToElements({ position_km: [0, 0, 0], velocity_km_per_s: [1, 1, 1], epoch_tdb_jd: J2000 })),
    probe('zero velocity', () => { const r = cartesianToElements({ position_km: [1.5e8, 0, 0], velocity_km_per_s: [0, 0, 0], epoch_tdb_jd: J2000 }); return 'e=' + r.e.toFixed(3) + ' a=' + r.a.toExponential(2); }),
    probe('hyperbolic state', () => { const r = cartesianToElements({ position_km: [1.5e8, 0, 0], velocity_km_per_s: [0, 60, 0], epoch_tdb_jd: J2000 }); return 'a=' + r.a.toExponential(3) + ' e=' + r.e.toFixed(4) + ' (caller must validate)'; }),
    probe('NaN position', () => { const r = cartesianToElements({ position_km: [NaN, 0, 0], velocity_km_per_s: [0, 30, 0], epoch_tdb_jd: J2000 }); return 'a=' + r.a + ' e=' + r.e + ' <- SILENT NaN?'; }),
  ];
}

fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
