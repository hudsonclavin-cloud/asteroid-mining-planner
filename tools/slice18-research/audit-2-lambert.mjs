#!/usr/bin/env node
/**
 * MATH AUDIT script 2 — Lambert stack: BVP self-consistency, cross-solver, Householder
 * residuals, singular geometries, multi-rev branches, adversarial. Repo READ-ONLY.
 *
 * The BVP chain check is the load-bearing one: v1 from Lambert -> cartesianToElements ->
 * propagateKeplerianStateVectors(tof) must land on r2. Three independent code paths must
 * agree for it to pass; an error in any one of them breaks it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = 'C:/Users/hudso/Documents/aster-slice18/build-v2x';
const OUT = 'C:/Users/hudso/Documents/aster-slice18/audit/audit-2-results.json';

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { lambert } = await import(pathToFileURL('C:/Users/hudso/Documents/aster-slice18/build-v2m/core/lambert/izzo.js').href);
const { lambertMultiRev, tMinForM } = await imp('core/lambert/lambert-multi-rev.js');
const { householder } = await imp('core/lambert/householder.js');
const { initial_guess_single_rev } = await imp('core/lambert/initial-guess.js');
const { compute_y, tof_equation } = await imp('core/lambert/tof.js');
const { propagateKeplerianStateVectors } = await imp('core/propagators/keplerian.js');
const { cartesianToElements } = await import(pathToFileURL(path.join(REPO, 'tools/slice7-research/state-to-elements.mjs')).href);

const MU = 1.32712440018e11; // km^3/s^2 (Sun) — same value as the repo's GM_SUN
const AU = 149597870.7;
const J2000 = 2451545.0;
const SPD = 86400;
const R = { checks: {} };

/** r2 recovery through the three-function chain, in km. Rotation note: Lambert I/O is
 * frame-agnostic; we feed equatorial-frame vectors so cartesianToElements' inverse
 * rotation and the propagator's forward rotation exercise the real pipeline. */
function bvpResidualKm(r1, v1, tofSec, r2) {
  const el = cartesianToElements({ position_km: r1, velocity_km_per_s: [v1[0], v1[1], v1[2]], epoch_tdb_jd: J2000 });
  if (!(el.e < 1) || !(el.a > 0)) return { residual: null, reason: 'transfer conic not elliptic (e=' + el.e.toFixed(3) + ')' };
  const elP = { aM: el.a * 1000, e: el.e, iRad: el.i, omRad: el.om, wRad: el.w, maRad: el.ma, epochTdbSeconds: 0 };
  const s = propagateKeplerianStateVectors(elP, tofSec);
  return { residual: Math.hypot(s.positionM.x / 1000 - r2[0], s.positionM.y / 1000 - r2[1], s.positionM.z / 1000 - r2[2]) };
}

// geometry generator: r1 at 1 AU in ecliptic-ish plane, r2 by transfer angle/radius/z-offset
function makeGeometry(thetaDeg, r2AU, zFrac) {
  const th = (thetaDeg * Math.PI) / 180;
  const r1 = [AU, 0, 0];
  const r2 = [r2AU * AU * Math.cos(th), r2AU * AU * Math.sin(th), zFrac * r2AU * AU];
  return { r1, r2 };
}

// ---------- 2.4/2.5: cross-solver + BVP over a geometry sweep ----------
{
  const thetas = [1, 5, 30, 60, 90, 120, 150, 170, 175, 179, 179.9, 181, 190, 225, 270, 315, 355, 359];
  const r2s = [0.7, 1.0, 1.52, 2.5];
  const zs = [0, 0.05, 0.3];
  const tofsDays = [30, 90, 200, 400, 900, 1800];
  let n = 0, solvedBoth = 0, izzoOnly = 0, mrOnly = 0, neither = 0;
  let worstXDiff = 0, worstVDiff = 0, worstBvp = { residual: -1 }, bvpCount = 0, bvpSum = 0;
  let worstEnergyMismatch = 0, worstHMismatch = 0, nonEllipticSkips = 0;
  let capBind = 0, worstIter = 0;
  for (const th of thetas) for (const r2AU of r2s) for (const z of zs) for (const days of tofsDays) {
    n += 1;
    const { r1, r2 } = makeGeometry(th, r2AU, z);
    const tof = days * SPD;
    const a = lambert(MU, r1, r2, tof, { M: 0, prograde: true });
    const b = lambertMultiRev(r1, r2, tof, MU, 0, true);
    if (a.ok && b !== null) {
      solvedBoth += 1;
      const bb = b.branches[0];
      worstXDiff = Math.max(worstXDiff, Math.abs(a.x - bb.x));
      for (let k = 0; k < 3; k += 1) {
        worstVDiff = Math.max(worstVDiff, Math.abs(a.v1[k] - bb.v1[k]), Math.abs(a.v2[k] - bb.v2[k]));
      }
      worstIter = Math.max(worstIter, a.iterations);
      if (a.iterations >= 35) capBind += 1;
      // physics: energy and |h| equal at both endpoints of the solution conic
      const E1 = (a.v1[0] ** 2 + a.v1[1] ** 2 + a.v1[2] ** 2) / 2 - MU / Math.hypot(...r1);
      const E2 = (a.v2[0] ** 2 + a.v2[1] ** 2 + a.v2[2] ** 2) / 2 - MU / Math.hypot(...r2);
      worstEnergyMismatch = Math.max(worstEnergyMismatch, Math.abs((E1 - E2) / E1));
      const h1 = Math.hypot(r1[1] * a.v1[2] - r1[2] * a.v1[1], r1[2] * a.v1[0] - r1[0] * a.v1[2], r1[0] * a.v1[1] - r1[1] * a.v1[0]);
      const h2 = Math.hypot(r2[1] * a.v2[2] - r2[2] * a.v2[1], r2[2] * a.v2[0] - r2[0] * a.v2[2], r2[0] * a.v2[1] - r2[1] * a.v2[0]);
      worstHMismatch = Math.max(worstHMismatch, Math.abs((h1 - h2) / h1));
      const bvp = bvpResidualKm(r1, a.v1, tof, r2);
      if (bvp.residual === null) { nonEllipticSkips += 1; }
      else { bvpCount += 1; bvpSum += bvp.residual; if (bvp.residual > worstBvp.residual) worstBvp = { residual: bvp.residual, at: { th, r2AU, z, days } }; }
    } else if (a.ok) izzoOnly += 1;
    else if (b !== null) mrOnly += 1;
    else neither += 1;
  }
  R.checks.crossSolverAndBvp = {
    method: 'izzo vs lambertMultiRev M=0 + BVP chain (Lambert->elements->propagate->r2) over 1,296 geometries',
    cases: n, solvedBoth, izzoOnly, mrOnly, neither,
    worstXDiff, worstV1V2DiffKmS: worstVDiff,
    bvp: { count: bvpCount, meanResidualKm: bvpSum / bvpCount, worst: worstBvp, nonEllipticSkips },
    energyEndpointMismatchRelMax: worstEnergyMismatch,
    angMomEndpointMismatchRelMax: worstHMismatch,
    iterations: { worst: worstIter, capBindingCount: capBind },
    wouldCatch: 'solver divergence between implementations, wrong velocity algebra (BVP misses r2), non-conic solutions, silent cap-bound partial convergence',
  };
}

// ---------- 2.7: Householder ACTUAL residual (not step size) ----------
{
  let worstT = 0, worstAt = null, okCount = 0;
  for (const lam of [-0.9, -0.5, 0, 0.5, 0.9, 0.99]) {
    for (let ti = 0; ti < 60; ti += 1) {
      const T = 0.2 + ti * 0.5;
      const x0 = initial_guess_single_rev(T, lam);
      const res = householder(x0, T, lam, 0, 1e-8, 35);
      if (!res.ok) continue;
      okCount += 1;
      const y = compute_y(res.x, lam);
      const resid = Math.abs(tof_equation(res.x, y, T, lam, 0)) / T;
      if (resid > worstT) { worstT = resid; worstAt = { lam, T, x: res.x, iters: res.iterations }; }
    }
  }
  R.checks.householderResidual = {
    method: '|T(x_solved) - T*|/T* directly evaluated after convergence, 360 (lambda, T) pairs',
    solved: okCount, worstRelResidual: worstT, worstAt,
    wouldCatch: 'tolerance-on-step masking a poorly converged root (step small but residual large)',
  };
}

// ---------- multi-rev: branch physics + TMin boundary exactness ----------
{
  const { r1, r2 } = makeGeometry(120, 1.3, 0.1);
  const lamGeom = (() => { // recompute lambda for TMin scaling, mirrors solver internals
    const c = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
    const cM = Math.hypot(...c), r1M = Math.hypot(...r1), r2M = Math.hypot(...r2);
    const s = 0.5 * (r1M + r2M + cM);
    return { s, lambda: Math.sqrt(1 - cM / s) };
  })();
  const rows = [];
  for (const M of [1, 2]) {
    const TMin = tMinForM(lamGeom.lambda, M);
    const tofAtTMin = TMin / Math.sqrt((2 * MU) / (lamGeom.s ** 3));
    const below = lambertMultiRev(r1, r2, tofAtTMin * 0.999, MU, M, true);
    const above = lambertMultiRev(r1, r2, tofAtTMin * 1.02, MU, M, true);
    let branchChecks = null;
    if (above !== null) {
      branchChecks = above.branches.map((br) => {
        const bvp = bvpResidualKm(r1, [br.v1[0], br.v1[1], br.v1[2]], tofAtTMin * 1.02 * SPD / SPD, r2);
        // note: tof passed in seconds below
        const bvp2 = bvpResidualKm(r1, [br.v1[0], br.v1[1], br.v1[2]], tofAtTMin * 1.02, r2);
        void bvp;
        return { branch: br.branch, converged: br.converged, x: +br.x.toFixed(6), bvpResidualKm: bvp2.residual ?? bvp2.reason };
      });
    }
    rows.push({ M, TMinNormalized: TMin, belowTMin: below === null ? 'null (correct)' : 'RETURNED A RESULT', justAbove: above === null ? 'null' : above.branches.length + ' branches', branchChecks });
  }
  R.checks.multiRevBranches = {
    method: 'TMin boundary probe (0.999x and 1.02x) + BVP residual per returned branch, M=1 and M=2',
    rows,
    wouldCatch: 'TMin guard off by a factor, non-converged branch marked converged, branch velocities not solving the BVP',
  };
}

// ---------- singularities + adversarial ----------
{
  const probe = (label, fn) => {
    try {
      const v = fn();
      return { label, outcome: v };
    } catch (err) { return { label, outcome: 'threw ' + err.constructor.name + ': ' + err.message.slice(0, 60) }; }
  };
  const describe = (res) => {
    if (res === null) return 'null';
    if (res.ok === false) return 'ok:false reason=' + res.reason;
    const v = res.ok ? res.v1 : res.branches[0].v1;
    const finite = v.every ? v.every(Number.isFinite) : Number.isFinite(v[0]);
    return (res.ok ? 'ok:true' : 'branches:' + res.branches.length) + (finite ? ' finite v' : ' *** NON-FINITE v ***');
  };
  const r1 = [AU, 0, 0];
  R.checks.adversarial = [
    probe('exact 180 deg transfer (izzo)', () => describe(lambert(MU, r1, [-AU, 0, 0], 200 * SPD))),
    probe('exact 180 deg transfer (multiRev)', () => { const r = lambertMultiRev(r1, [-AU, 0, 0], 200 * SPD, MU, 0, true); return r === null ? 'null' : describe(r); }),
    probe('theta -> 0 (r2 = 1.000001*r1, izzo) — sigma NaN probe', () => describe(lambert(MU, r1, [AU * 1.000001, 0, 0], 200 * SPD))),
    probe('theta -> 0 (multiRev)', () => { const r = lambertMultiRev(r1, [AU * 1.000001, 0, 0], 200 * SPD, MU, 0, true); return r === null ? 'null' : describe(r); }),
    probe('identical positions (izzo)', () => describe(lambert(MU, r1, [AU, 0, 0], 200 * SPD))),
    probe('zero tof (izzo)', () => describe(lambert(MU, r1, [0, AU, 0], 0))),
    probe('zero tof (multiRev)', () => { const r = lambertMultiRev(r1, [0, AU, 0], 0, MU, 0, true); return r === null ? 'null (correct)' : describe(r); }),
    probe('negative tof (izzo)', () => describe(lambert(MU, r1, [0, AU, 0], -SPD))),
    probe('NaN position (izzo)', () => describe(lambert(MU, [NaN, 0, 0], [0, AU, 0], 200 * SPD))),
    probe('NaN position (multiRev)', () => { const r = lambertMultiRev([NaN, 0, 0], [0, AU, 0], 200 * SPD, MU, 0, true); return r === null ? 'null (correct)' : describe(r); }),
    probe('Infinity tof (izzo)', () => describe(lambert(MU, r1, [0, AU, 0], Infinity))),
    probe('mu=0 (multiRev)', () => { const r = lambertMultiRev(r1, [0, AU, 0], 200 * SPD, 0, 0, true); return r === null ? 'null (correct)' : describe(r); }),
    probe('M=3 (multiRev)', () => { const r = lambertMultiRev(r1, [0, AU, 0], 2000 * SPD, MU, 3, true); return describe(r); }),
    probe('M=1 via izzo (documented rejection)', () => describe(lambert(MU, r1, [0, AU, 0], 900 * SPD, { M: 1 }))),
    probe('retrograde (izzo prograde=false) + BVP', () => {
      const res = lambert(MU, r1, [0, AU, 0], 250 * SPD, { prograde: false });
      if (!res.ok) return 'ok:false ' + res.reason;
      const bvp = bvpResidualKm(r1, [res.v1[0], res.v1[1], res.v1[2]], 250 * SPD, [0, AU, 0]);
      return 'ok:true, BVP residual ' + (bvp.residual === null ? bvp.reason : bvp.residual.toExponential(2) + ' km');
    }),
  ];
}

fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
