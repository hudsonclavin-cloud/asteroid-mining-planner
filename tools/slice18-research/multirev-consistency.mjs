#!/usr/bin/env node
/**
 * MEASUREMENT — Front A: multi-rev solver consistency.
 * Dispatch 2026-08-24 + Hudson ruling 2026-08-26 (Step 1.2, then Q1 on the porkchop grid).
 *
 * Repo READ-ONLY. Lives OUTSIDE the repo; writes only:
 *   - <this dir>/build-v2m/                        (tsc output, OUTSIDE the repo)
 *   - <this dir>/multirev-consistency-results.json
 *
 * Repo math only, both solvers unmodified (INV-024 / C3):
 *   izzo lambert            src/v2/core/lambert/izzo.ts:60         (M!=0 rejected at :77-82)
 *   lambertMultiRev         src/v2/core/lambert/lambert-multi-rev.ts:276
 *   computePorkchopGrid     src/v2/porkchop/grid-compute.ts:157    (the live production grid fn)
 *   propagateKeplerianStateVectors  core/propagators/keplerian.ts:195
 *   interpolateBodyStateSeries      core/interpolators/hermite.ts
 *   ingestSlice2Fixture / ingestSlice9Fixture       boundary/horizons.ts, boundary/slice9-nea-catalog.ts
 *
 * Worker wiring reproduced verbatim from porkchop.worker.ts:138-141.
 * GRID_PARAMS reproduced from porkchop/main.ts:181-188 (the LIVE porkchop grid).
 * utcMidnightToJdTdb is mirrored from porkchop/main.ts:169-179 because it is a
 * page-local function with NO export (a date helper, not astrodynamics math).
 *
 * Units: C3 km^2/s^2, vInf km/s, TOF days, positions km, mu km^3/s^2.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = path.join(__dirname, 'build-v2m');
const RESULTS_JSON = path.join(__dirname, 'multirev-consistency-results.json');

fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });
const tsc = spawnSync(process.execPath, [
  path.join(REPO, 'node_modules', 'typescript', 'bin', 'tsc'),
  '--pretty', 'false', '--outDir', BUILD, '--rootDir', path.join(REPO, 'src', 'v2'),
  '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
  '--isolatedModules', 'true',
  path.join(REPO, 'src/v2/core/lambert/izzo.ts'),
  path.join(REPO, 'src/v2/core/lambert/lambert-multi-rev.ts'),
  path.join(REPO, 'src/v2/porkchop/grid-compute.ts'),
  path.join(REPO, 'src/v2/core/propagators/keplerian.ts'),
  path.join(REPO, 'src/v2/core/units/utc-to-tdb.ts'),
  path.join(REPO, 'src/v2/core/units.ts'),
  path.join(REPO, 'src/v2/core/interpolators/hermite.ts'),
  path.join(REPO, 'src/v2/boundary/slice9-nea-catalog.ts'),
  path.join(REPO, 'src/v2/boundary/horizons.ts'),
], { cwd: REPO, encoding: 'utf8' });
if (tsc.status !== 0) { console.error('tsc failed:', tsc.stdout, tsc.stderr); process.exit(1); }

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { lambert } = await imp('core/lambert/izzo.js');
const { lambertMultiRev } = await imp('core/lambert/lambert-multi-rev.js');
const { computePorkchopGrid } = await imp('porkchop/grid-compute.js');
const { propagateKeplerianStateVectors } = await imp('core/propagators/keplerian.js');
const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await imp('core/units/utc-to-tdb.js');
const { interpolateBodyStateSeries } = await imp('core/interpolators/hermite.js');
const { ingestSlice9Fixture } = await imp('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await imp('boundary/horizons.js');

const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11;          // km^3/s^2 (precompute:80)
const J2000_TDB_JULIAN_DATE = 2451545.0;  // core/units.ts:1
const UNIX_TO_J2000_SECONDS = 946_728_000;
const FEASIBLE_C3_MAX = 25;               // km^2/s^2 (precompute:90 / cache metadata)

const mag = (v) => Math.hypot(v[0], v[1], v[2]);
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const kmFromM = (p) => [p.x / 1000, p.y / 1000, p.z / 1000];
const rel = (a, b) => (b === 0 ? Math.abs(a) : Math.abs(a - b) / Math.abs(b));

// ---- data ----
const horizonsRaw = JSON.parse(fs.readFileSync(path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const earthSeries = ingestSlice2Fixture(horizonsRaw).earth.map((s) => s.state);
const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
const cache = JSON.parse(fs.readFileSync(path.join(REPO, 'docs/lambert-screen-cache.json'), 'utf8'));
const cacheById = new Map(cache.bodies.map((b) => [b.bodyId, b]));

// ================= GATE A — reproduce the cached Eros cell (cache params, izzo M=0) =================
const CACHED = { bodyId: 'asteroid-433', minC3: 1.6244339770173506, minC3Date: '2032-06-10',
  minC3TofDays: 272, vInfDep: 1.2745328465823667, vInfArr: 6.655866629635761 };
const startTdb = utcStringToTdbSeconds('2026-01-01');
const cacheDepTdbs = [];
for (let t = startTdb, end = utcStringToTdbSeconds('2040-12-31'); t <= end; t += 7 * SECONDS_PER_DAY) cacheDepTdbs.push(t);
const cacheDepDates = cacheDepTdbs.map((t) =>
  new Date((t + UNIX_TO_J2000_SECONDS - TDB_MINUS_UTC_SECONDS) * 1000).toISOString().slice(0, 10));
const gateDepIdx = cacheDepDates.indexOf(CACHED.minC3Date);
const gateDepTdb = cacheDepTdbs[gateDepIdx];
const gateTofS = CACHED.minC3TofDays * SECONDS_PER_DAY;
const eros = catalog.asteroids[CACHED.bodyId];
const gateEarth = interpolateBodyStateSeries('earth', earthSeries, gateDepTdb);
const gateEarthR = kmFromM(gateEarth.positionM), gateEarthV = kmFromM(gateEarth.velocityMps);
const gateArr = propagateKeplerianStateVectors(eros.elements, gateDepTdb + gateTofS);
const gateArrR = kmFromM(gateArr.positionM), gateArrV = kmFromM(gateArr.velocityMps);

const izzoRes = lambert(MU_SUN, gateEarthR, gateArrR, gateTofS); // M defaults to 0
if (!izzoRes.ok) { console.error('GATE A FAIL: izzo did not converge'); process.exit(2); }
const izzoC3 = mag(sub3(izzoRes.v1, gateEarthV)) ** 2;
const izzoVinfDep = mag(sub3(izzoRes.v1, gateEarthV));
const izzoVinfArr = mag(sub3(izzoRes.v2, gateArrV));
const gateA = { c3_rel: rel(izzoC3, CACHED.minC3), vInfDep_rel: rel(izzoVinfDep, CACHED.vInfDep), vInfArr_rel: rel(izzoVinfArr, CACHED.vInfArr) };
const gateAWorst = Math.max(...Object.values(gateA));
console.log('=== GATE A — cache reproduction (izzo M=0, cache grid params) ===');
console.log(`  C3      ${izzoC3} vs cached ${CACHED.minC3}   rel ${gateA.c3_rel.toExponential(3)}`);
console.log(`  vInfDep ${izzoVinfDep} vs ${CACHED.vInfDep}   rel ${gateA.vInfDep_rel.toExponential(3)}`);
console.log(`  vInfArr ${izzoVinfArr} vs ${CACHED.vInfArr}   rel ${gateA.vInfArr_rel.toExponential(3)}`);
if (gateAWorst > 1e-9) { console.error(`GATE A FAIL: worst rel ${gateAWorst} > 1e-9 — STOP`); process.exit(2); }
console.log(`  GATE A PASSED (worst rel ${gateAWorst.toExponential(3)})\n`);

// ================= STEP 1.2 — izzo M=0 vs lambertMultiRev M=0, same cell =================
// lambertMultiRev(r1, r2, tof, mu, M, lw) — 6th arg named `lw` but consumed as `prograde`
// (lambert-multi-rev.ts:50,83-87); grid-compute.ts:193 passes true. izzo defaults prograde=true.
const mrRes = lambertMultiRev(gateEarthR, gateArrR, gateTofS, MU_SUN, 0, true);
if (mrRes === null) { console.error('STEP 1.2 FAIL: lambertMultiRev returned null at M=0'); process.exit(2); }
const mrBranch = mrRes.branches[0];
const mrC3 = mag(sub3(mrBranch.v1, gateEarthV)) ** 2;
const mrVinfDep = mag(sub3(mrBranch.v1, gateEarthV));
const mrVinfArr = mag(sub3(mrBranch.v2, gateArrV));
const step12 = {
  izzo: { c3: izzoC3, vInfDep: izzoVinfDep, vInfArr: izzoVinfArr, x: izzoRes.x, iterations: izzoRes.iterations },
  multiRevM0: { c3: mrC3, vInfDep: mrVinfDep, vInfArr: mrVinfArr, x: mrBranch.x, branch: mrBranch.branch, converged: mrBranch.converged, branchCount: mrRes.branches.length },
  absDiff: { c3: mrC3 - izzoC3, vInfDep: mrVinfDep - izzoVinfDep, vInfArr: mrVinfArr - izzoVinfArr,
             v1: sub3(mrBranch.v1, izzoRes.v1), v2: sub3(mrBranch.v2, izzoRes.v2) },
  relDiff: { c3: rel(mrC3, izzoC3), vInfDep: rel(mrVinfDep, izzoVinfDep), vInfArr: rel(mrVinfArr, izzoVinfArr) },
};
const step12Worst = Math.max(step12.relDiff.c3, step12.relDiff.vInfDep, step12.relDiff.vInfArr);
console.log('=== STEP 1.2 — cross-solver agreement at M=0 (Eros cell) ===');
console.log(`  izzo            C3 ${izzoC3}  vInfDep ${izzoVinfDep}  vInfArr ${izzoVinfArr}  x ${izzoRes.x}`);
console.log(`  lambertMultiRev C3 ${mrC3}  vInfDep ${mrVinfDep}  vInfArr ${mrVinfArr}  x ${mrBranch.x}  branch '${mrBranch.branch}' branches=${mrRes.branches.length}`);
console.log(`  rel diffs: C3 ${step12.relDiff.c3.toExponential(3)}, vInfDep ${step12.relDiff.vInfDep.toExponential(3)}, vInfArr ${step12.relDiff.vInfArr.toExponential(3)}`);
if (step12Worst > 1e-6) { console.error(`STEP 1.2 TRIPWIRE: solvers disagree materially at M=0 (worst rel ${step12Worst}) — STOP`); process.exit(2); }
console.log(`  AGREE (worst rel ${step12Worst.toExponential(3)} <= 1e-6)\n`);

// ================= Q1 — porkchop's OWN grid, M=0 vs M=1 =================
// mirrored verbatim from porkchop/main.ts:169-179 (page-local, no export)
function utcMidnightToJdTdb(utcDate) {
  const utcMillis = Date.parse(`${utcDate}T00:00:00Z`);
  if (!Number.isFinite(utcMillis)) throw new Error(`Invalid UTC date '${utcDate}'`);
  const utcSecondsSinceUnix = utcMillis / 1000;
  const tdbSecondsSinceJ2000 = utcSecondsSinceUnix - UNIX_TO_J2000_SECONDS + 69.184;
  return J2000_TDB_JULIAN_DATE + tdbSecondsSinceJ2000 / SECONDS_PER_DAY;
}
const GRID_PARAMS = { // porkchop/main.ts:181-188
  depStartJD: utcMidnightToJdTdb('2026-01-01'),
  depEndJD: utcMidnightToJdTdb('2040-01-01'),
  tofMinDays: 182.5, tofMaxDays: 1826.25, nDep: 200, nTof: 100,
};
const deps = { // porkchop.worker.ts:138-141 verbatim wiring
  getEarthStateAtTdbSeconds: (t) => interpolateBodyStateSeries('earth', earthSeries, t),
  propagateTargetStateAtTdbSeconds: (el, t) => propagateKeplerianStateVectors(el, t),
};
const jdOf = (jd) => new Date(((jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY + UNIX_TO_J2000_SECONDS - TDB_MINUS_UTC_SECONDS) * 1000).toISOString().slice(0, 10);

// ---- sample selection (Front A Step 2.2 criteria) ----
const solvable = cache.bodies.filter((b) => {
  const c = catalog.asteroids[b.bodyId];
  return c && c.elements.e < 1 && (b.status === 'low_departure_c3' || b.status === 'high_departure_c3') && b.minC3 !== null;
});
const byId = (a, b) => a.bodyId.localeCompare(b.bodyId);
const chosen = new Map();
const add = (why, b) => { if (b && !chosen.has(b.bodyId)) chosen.set(b.bodyId, { ...b, why }); };
for (const id of ['asteroid-433', 'asteroid-163693', 'asteroid-2017 UR52', 'asteroid-1979 XB', 'asteroid-99942'])
  add('prior-measurement continuity', solvable.find((b) => b.bodyId === id));
[...solvable].filter((b) => b.minC3TofDays >= 1700).sort((a, b) => a.minC3 - b.minC3 || byId(a, b)).slice(0, 3)
  .forEach((b) => add(`cached TOF near upper end (${b.minC3TofDays} d)`, b));
const high = [...solvable].filter((b) => b.status === 'high_departure_c3').sort((a, b) => a.minC3 - b.minC3 || byId(a, b));
if (high.length) {
  add('HIGH C3 badge — lowest above threshold', high[0]);
  add('HIGH C3 badge — median', high[Math.floor(high.length / 2)]);
  add('HIGH C3 badge — highest', high[high.length - 1]);
}
const byA = [...solvable].map((b) => ({ b, aKm: catalog.asteroids[b.bodyId].elements.aM / 1000 }))
  .sort((x, y) => x.aKm - y.aKm || byId(x.b, y.b));
add('semi-major axis: minimum in pool', byA[0]?.b);
add('semi-major axis: median in pool', byA[Math.floor(byA.length / 2)]?.b);
add('semi-major axis: maximum in pool', byA[byA.length - 1]?.b);

console.log('=== SAMPLE (n=' + chosen.size + ') ===');
for (const b of chosen.values()) {
  const c = catalog.asteroids[b.bodyId];
  console.log(`  ${b.bodyId.padEnd(22)} e=${c.elements.e.toFixed(4)} a=${(c.elements.aM / 1000 / 149597870.7).toFixed(3)}AU U=${c.conditionCode} cachedMinC3=${b.minC3.toExponential(4)} (${b.status}, TOF ${b.minC3TofDays}d) — ${b.why}`);
}
console.log('');

function summarize(cells) {
  let minC3 = Infinity, at = null, ok = 0, noSol = 0, stall = 0;
  const status = new Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    status[i] = c.status;
    if (c.status === 'ok') {
      ok++;
      const br = c.branches[c.selectedBranch];
      if (br && Number.isFinite(br.c3) && br.c3 < minC3) { minC3 = br.c3; at = { depJD: c.depJD, date: jdOf(c.depJD), tofDays: c.tofDays, vInfDep: br.vInfDep, vInfArr: br.vInfArr, branch: br.branch }; }
    } else if (c.status === 'no_solution') noSol++;
    else stall++;
  }
  return { minC3: Number.isFinite(minC3) ? minC3 : null, at, ok, noSol, stall, status };
}

const results = { gateA: { cached: CACHED, recomputed: { c3: izzoC3, vInfDep: izzoVinfDep, vInfArr: izzoVinfArr }, relDiffs: gateA },
  step12, gridParams: { ...GRID_PARAMS, depStartDate: jdOf(GRID_PARAMS.depStartJD), depEndDate: jdOf(GRID_PARAMS.depEndJD),
    depStepDays: (GRID_PARAMS.depEndJD - GRID_PARAMS.depStartJD) / (GRID_PARAMS.nDep - 1),
    tofStepDays: (GRID_PARAMS.tofMaxDays - GRID_PARAMS.tofMinDays) / (GRID_PARAMS.nTof - 1) },
  feasibleC3Max: FEASIBLE_C3_MAX, bodies: {} };

for (const sel of chosen.values()) {
  const body = catalog.asteroids[sel.bodyId];
  const g0 = computePorkchopGrid(body.elements, GRID_PARAMS, 0, deps);
  const g1 = computePorkchopGrid(body.elements, GRID_PARAMS, 1, deps);
  const s0 = summarize(g0.cells), s1 = summarize(g1.cells);
  const total = g0.cells.length;

  let m1NoSol_m0Ok = 0, m1NotOk_m0Ok = 0, m0NotOk_m1Ok = 0;
  for (let i = 0; i < total; i++) {
    const a = s0.status[i], b = s1.status[i];
    if (b === 'no_solution' && a === 'ok') m1NoSol_m0Ok++;
    if (b !== 'ok' && a === 'ok') m1NotOk_m0Ok++;
    if (a !== 'ok' && b === 'ok') m0NotOk_m1Ok++;
  }
  const statusOf = (c3) => (c3 === null ? 'no-solution' : c3 <= FEASIBLE_C3_MAX ? 'low_departure_c3' : 'high_departure_c3');
  const st0 = statusOf(s0.minC3), st1 = statusOf(s1.minC3);

  results.bodies[sel.bodyId] = {
    selection: { why: sel.why, e: body.elements.e, aAU: body.elements.aM / 1000 / 149597870.7, conditionCode: body.conditionCode,
      cachedMinC3: sel.minC3, cachedStatus: sel.status, cachedDate: sel.minC3Date, cachedTofDays: sel.minC3TofDays },
    totalCells: total,
    M0: { minC3: s0.minC3, at: s0.at, okCells: s0.ok, noSolution: s0.noSol, stall: s0.stall },
    M1: { minC3: s1.minC3, at: s1.at, okCells: s1.ok, noSolution: s1.noSol, stall: s1.stall },
    cellCoverage: { m1NoSolution_but_m0Ok: m1NoSol_m0Ok, m1NoSolution_but_m0Ok_frac: m1NoSol_m0Ok / total,
      m1NotOk_but_m0Ok: m1NotOk_m0Ok, m1NotOk_but_m0Ok_frac: m1NotOk_m0Ok / total,
      m0NotOk_but_m1Ok: m0NotOk_m1Ok },
    comparison: { m0BeatsM1: s0.minC3 !== null && (s1.minC3 === null || s0.minC3 < s1.minC3),
      deltaC3_m1_minus_m0: s0.minC3 !== null && s1.minC3 !== null ? s1.minC3 - s0.minC3 : null,
      ratio_m1_over_m0: s0.minC3 !== null && s1.minC3 !== null && s0.minC3 !== 0 ? s1.minC3 / s0.minC3 : null },
    feasibility: { cachedBadge: sel.status, m0GridImplies: st0, m1GridImplies: st1,
      m0DiffersFromCached: st0 !== sel.status, m1DiffersFromCached: st1 !== sel.status, m0VsM1Differ: st0 !== st1 },
  };
  console.log(`--- ${sel.bodyId}: M0 minC3 ${s0.minC3 === null ? 'none' : s0.minC3.toExponential(6)} | M1 minC3 ${s1.minC3 === null ? 'none' : s1.minC3.toExponential(6)} | M1-blank-cells(M0 ok) ${m1NoSol_m0Ok}/${total} ---`);
}

fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2));
console.log(`\nresults written: ${RESULTS_JSON}`);
