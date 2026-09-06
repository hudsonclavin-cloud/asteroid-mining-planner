#!/usr/bin/env node
/**
 * MEASUREMENT — C3 / vInf sensitivity to endpoint (arrival) state drift.
 * Dispatch: 2026-08-24 "C3 / dV SENSITIVITY TO ENDPOINT STATE DRIFT".
 *
 * Repo READ-ONLY. Lives OUTSIDE the repo; writes only:
 *   - <this dir>/build-v2c/                 (tsc output of repo modules, OUTSIDE the repo)
 *   - <this dir>/c3-drift-sensitivity-results.json
 *
 * Pipeline fidelity: this script mirrors tools/build/precompute-lambert-screen.mjs
 * (the producer of docs/lambert-screen-cache.json) exactly:
 *   - solver:      lambert() from src/v2/core/lambert/izzo.ts (single-rev, prograde
 *                  default; precompute-lambert-screen.mjs:72,257-262). NOTE: the live
 *                  porkchop worker uses lambertMultiRev; the CACHE was built with izzo
 *                  lambert — reproduction targets the cache, so izzo is used here.
 *   - Earth:       ingestSlice2Fixture(horizons 2026-2040) -> interpolateBodyStateSeries
 *   - asteroid:    ingestSlice9Fixture(nea-catalog) -> propagateKeplerianStateVectors
 *   - grid:        dep = utcStringToTdbSeconds('2026-01-01') + k*7d (<= 2040-12-31);
 *                  TOF = 182..1826 step 30 d (precompute:84-89,141-153)
 *   - quantities:  C3 = |v1 - vEarth|^2 (km^2/s^2); vInfDep, vInfArr (km/s)
 * All repo math; nothing reimplemented (INV-024 / dispatch C3).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = path.join(__dirname, 'build-v2c'); // OUTSIDE the repo
const RESULTS_JSON = path.join(__dirname, 'c3-drift-sensitivity-results.json');

// ---------- compile the repo modules OUT of the repo (same file list as the precompute) ----------
fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });
const tsc = spawnSync(process.execPath, [
  path.join(REPO, 'node_modules', 'typescript', 'bin', 'tsc'),
  '--pretty', 'false',
  '--outDir', BUILD,
  '--rootDir', path.join(REPO, 'src', 'v2'),
  '--module', 'NodeNext',
  '--target', 'ES2020',
  '--moduleResolution', 'NodeNext',
  '--isolatedModules', 'true',
  path.join(REPO, 'src', 'v2', 'core', 'lambert', 'izzo.ts'),
  path.join(REPO, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
  path.join(REPO, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
  path.join(REPO, 'src', 'v2', 'core', 'units.ts'),
  path.join(REPO, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
  path.join(REPO, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
  path.join(REPO, 'src', 'v2', 'boundary', 'horizons.ts'),
], { cwd: REPO, encoding: 'utf8' });
if (tsc.status !== 0) { console.error('tsc failed:', tsc.stdout, tsc.stderr); process.exit(1); }

const importJs = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { lambert } = await importJs('core/lambert/izzo.js');
const { propagateKeplerianStateVectors } = await importJs('core/propagators/keplerian.js');
const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await importJs('core/units/utc-to-tdb.js');
const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');

const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11; // km^3/s^2 (precompute:80)
const UNIX_TO_J2000_SECONDS = 946_728_000;

// ---------- grids (precompute:84-89, 141-153) ----------
const startTdb = utcStringToTdbSeconds('2026-01-01');
const endTdb = utcStringToTdbSeconds('2040-12-31');
const DEP_STEP_S = 7 * SECONDS_PER_DAY;
const departureTdbs = [];
for (let t = startTdb; t <= endTdb; t += DEP_STEP_S) departureTdbs.push(t);
const tofDaysList = [];
for (let d = 182; d <= 1826; d += 30) tofDaysList.push(d);

function tdbToUtcDateString(tdbSeconds) { // precompute:111-114
  return new Date((tdbSeconds + UNIX_TO_J2000_SECONDS - TDB_MINUS_UTC_SECONDS) * 1000)
    .toISOString().slice(0, 10);
}
const departureDateStrings = departureTdbs.map(tdbToUtcDateString);

// ---------- truth + catalog + cache ----------
const horizonsRaw = JSON.parse(fs.readFileSync(
  path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const earthSeries = ingestSlice2Fixture(horizonsRaw).earth.map((s) => s.state);
const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(
  path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
const cache = JSON.parse(fs.readFileSync(path.join(REPO, 'docs/lambert-screen-cache.json'), 'utf8'));
const cacheById = new Map(cache.bodies.map((b) => [b.bodyId, b]));

const kmFromM = (p) => [p.x / 1000, p.y / 1000, p.z / 1000];
const mag = (v) => Math.hypot(v[0], v[1], v[2]);
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cross3 = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

const earthAtDep = departureTdbs.map((t) => {
  const e = interpolateBodyStateSeries('earth', earthSeries, t);
  return { posKm: kmFromM(e.positionM), velKmps: kmFromM(e.velocityMps) };
});

/** Solve one cell exactly as the precompute does. r2Override optionally replaces the
 *  arrival POSITION (velocity stays nominal — synthetic position-drift model). */
function solveCell(body, depIdx, tofDays, r2Override = null) {
  const depTdb = departureTdbs[depIdx];
  const tofSeconds = tofDays * SECONDS_PER_DAY;
  const arr = propagateKeplerianStateVectors(body.elements, depTdb + tofSeconds);
  const r2 = r2Override ?? kmFromM(arr.positionM);
  const vAst = kmFromM(arr.velocityMps);
  const earth = earthAtDep[depIdx];
  const res = lambert(MU_SUN, earth.posKm, r2, tofSeconds); // izzo, M=0, prograde=true (defaults)
  if (!res.ok) return { ok: false, reason: res.reason, arrPosKm: r2, arrVelKmps: vAst };
  const vInfDepV = sub3(res.v1, earth.velKmps);
  const vInfArrV = sub3(res.v2, vAst);
  return {
    ok: true,
    c3: mag(vInfDepV) ** 2,          // km^2/s^2
    vInfDep: mag(vInfDepV),           // km/s
    vInfArr: mag(vInfArrV),           // km/s
    arrPosKm: kmFromM(arr.positionM), // nominal arrival position (even when overridden)
    arrVelKmps: vAst,
  };
}

/** Local orbit-frame unit vectors at the (nominal) arrival state. */
function unitVectors(arrPosKm, arrVelKmps) {
  const along = scale3(arrVelKmps, 1 / mag(arrVelKmps));       // parallel to velocity
  const radial = scale3(arrPosKm, 1 / mag(arrPosKm));          // Sun->body position direction
  const h = cross3(arrPosKm, arrVelKmps);
  const crossT = scale3(h, 1 / mag(h));                        // orbit-plane normal (r x v)
  return { along, radial, cross: crossT };
}

// ---------- STEP 1.4 REPRODUCTION GATE (Eros asteroid-433, cached best cell) ----------
const GATE = {
  bodyId: 'asteroid-433',
  minC3: 1.6244339770173506, minC3Date: '2032-06-10', minC3TofDays: 272,
  vInfDep: 1.2745328465823667, vInfArr: 6.655866629635761,
};
const eros = catalog.asteroids[GATE.bodyId];
const gateDepIdx = departureDateStrings.indexOf(GATE.minC3Date);
if (gateDepIdx < 0) { console.error('GATE FAIL: departure date not on grid'); process.exit(2); }
const gateCell = solveCell(eros, gateDepIdx, GATE.minC3TofDays);
if (!gateCell.ok) { console.error('GATE FAIL: solver did not converge on gate cell'); process.exit(2); }
const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
const gateDiffs = {
  c3_rel: rel(gateCell.c3, GATE.minC3),
  vInfDep_rel: rel(gateCell.vInfDep, GATE.vInfDep),
  vInfArr_rel: rel(gateCell.vInfArr, GATE.vInfArr),
};
const gateWorst = Math.max(...Object.values(gateDiffs));
console.log('=== REPRODUCTION GATE (asteroid-433 @ 2032-06-10, TOF 272 d) ===');
console.log(`  recomputed C3      = ${gateCell.c3} km^2/s^2 (cached ${GATE.minC3})`);
console.log(`  recomputed vInfDep = ${gateCell.vInfDep} km/s (cached ${GATE.vInfDep})`);
console.log(`  recomputed vInfArr = ${gateCell.vInfArr} km/s (cached ${GATE.vInfArr})`);
console.log(`  relative diffs: c3 ${gateDiffs.c3_rel.toExponential(3)}, vInfDep ${gateDiffs.vInfDep_rel.toExponential(3)}, vInfArr ${gateDiffs.vInfArr_rel.toExponential(3)}`);
if (gateWorst > 1e-9) { console.error(`GATE FAIL: worst relative diff ${gateWorst} > 1e-9 — STOP`); process.exit(2); }
console.log(`  GATE PASSED (worst relative diff ${gateWorst.toExponential(3)} <= 1e-9)\n`);

// ---------- body selection (Step 3.1) ----------
const pool = cache.bodies.filter((b) =>
  (b.status === 'low_departure_c3' || b.status === 'high_departure_c3') &&
  b.minC3 !== null && b.bestWindows.length > 0 && catalog.asteroids[b.bodyId]);
const withMeta = pool.map((b) => {
  const c = catalog.asteroids[b.bodyId];
  return { bodyId: b.bodyId, designation: b.designation, minC3: b.minC3,
    e: c.elements.e, conditionCode: c.conditionCode, name: c.name };
});
const chosen = new Map();
const take = (label, entry) => { if (entry && !chosen.has(entry.bodyId)) chosen.set(entry.bodyId, { ...entry, why: label }); };
take('reproduction-gate body (e=0.223, U=0, mid minC3)', withMeta.find((b) => b.bodyId === 'asteroid-433'));
take('S17 continuity body (IEO Atira; no practical window at tight thresholds)', withMeta.find((b) => b.bodyId === 'asteroid-163693'));
const sortedByE = [...withMeta].sort((a, b) => b.e - a.e);
for (const cand of sortedByE) { if (!chosen.has(cand.bodyId)) { take('max eccentricity in pool', cand); break; } }
const sortedByU = [...withMeta].filter((b) => Number.isInteger(b.conditionCode)).sort((a, b) => b.conditionCode - a.conditionCode);
for (const cand of sortedByU) { if (!chosen.has(cand.bodyId)) { take(`max condition code in pool (U=${cand.conditionCode})`, cand); break; } }
const sortedByC3 = [...withMeta].sort((a, b) => a.minC3 - b.minC3);
for (const cand of sortedByC3) { if (!chosen.has(cand.bodyId)) { take('lowest minC3 in pool (most accessible)', cand); break; } }
console.log('=== BODIES SELECTED ===');
for (const b of chosen.values()) console.log(`  ${b.bodyId} (${b.designation}${b.name ? ', ' + b.name : ''}): e=${b.e.toFixed(4)}, U=${b.conditionCode}, minC3=${b.minC3.toFixed(4)} — ${b.why}`);
console.log('');

// ---------- measurement ----------
const MAGS_KM = [1e3, 1e4, 1e5, 1e6];
const DIRS = ['along', 'radial', 'cross'];
const ARGMIN_MAGS_KM = [1e5, 1e6];
const results = { gate: { recomputed: { c3: gateCell.c3, vInfDep: gateCell.vInfDep, vInfArr: gateCell.vInfArr }, cached: GATE, relativeDiffs: gateDiffs }, bodies: {} };
const convergenceFailures = [];

for (const sel of chosen.values()) {
  const body = catalog.asteroids[sel.bodyId];
  const cached = cacheById.get(sel.bodyId);

  // baseline full grid (also yields neighbors + argmin)
  let best = { c3: Infinity, depIdx: -1, tofDays: -1 };
  const gridC3 = new Map(); // `${depIdx}:${tofDays}` -> c3 | null
  for (let di = 0; di < departureTdbs.length; di++) {
    for (const tof of tofDaysList) {
      const cell = solveCell(body, di, tof);
      gridC3.set(`${di}:${tof}`, cell.ok ? cell.c3 : null);
      if (cell.ok && cell.c3 < best.c3) best = { c3: cell.c3, depIdx: di, tofDays: tof };
    }
  }
  const baselineVsCache = rel(best.c3, cached.minC3);
  if (baselineVsCache > 1e-9) {
    console.error(`PER-BODY GATE FAIL ${sel.bodyId}: baseline grid argmin C3 ${best.c3} vs cached ${cached.minC3} (rel ${baselineVsCache}) — STOP`);
    process.exit(2);
  }
  const nominal = solveCell(body, best.depIdx, best.tofDays);
  const units = unitVectors(nominal.arrPosKm, nominal.arrVelKmps);
  const arrSpeedKmps = mag(nominal.arrVelKmps);

  // perturbation matrix at the best cell
  const perturbations = [];
  for (const dir of DIRS) {
    for (const magKm of MAGS_KM) {
      const r2p = add3(nominal.arrPosKm, scale3(units[dir], magKm));
      const p = solveCell(body, best.depIdx, best.tofDays, r2p);
      if (!p.ok) {
        convergenceFailures.push({ bodyId: sel.bodyId, dir, magKm, reason: p.reason });
        perturbations.push({ dir, magKm, ok: false, reason: p.reason });
        continue;
      }
      perturbations.push({
        dir, magKm, ok: true,
        c3: p.c3, vInfDep: p.vInfDep, vInfArr: p.vInfArr,
        dC3: p.c3 - nominal.c3, dC3_pct: (p.c3 - nominal.c3) / nominal.c3 * 100,
        dVInfDep: p.vInfDep - nominal.vInfDep, dVInfDep_pct: (p.vInfDep - nominal.vInfDep) / nominal.vInfDep * 100,
        dVInfArr: p.vInfArr - nominal.vInfArr, dVInfArr_pct: (p.vInfArr - nominal.vInfArr) / nominal.vInfArr * 100,
        alongTrack_timeShift_hours: dir === 'along' ? magKm / arrSpeedKmps / 3600 : null,
      });
    }
  }

  // grid-adjacent C3 variation (one dep step = 7 d; one TOF step = 30 d)
  const neighbors = {};
  const nb = (label, di, tof) => {
    if (di < 0 || di >= departureTdbs.length) { neighbors[label] = 'off-grid'; return; }
    if (tof < tofDaysList[0] || tof > tofDaysList[tofDaysList.length - 1]) { neighbors[label] = 'off-grid'; return; }
    const c3 = gridC3.get(`${di}:${tof}`);
    neighbors[label] = c3 === null || c3 === undefined ? 'no-solution'
      : { c3, dC3_from_best: c3 - best.c3 };
  };
  nb('dep-7d', best.depIdx - 1, best.tofDays);
  nb('dep+7d', best.depIdx + 1, best.tofDays);
  nb('tof-30d', best.depIdx, best.tofDays - 30);
  nb('tof+30d', best.depIdx, best.tofDays + 30);
  const neighborDeltas = Object.values(neighbors).filter((v) => typeof v === 'object').map((v) => Math.abs(v.dC3_from_best));
  const meanNeighborDelta = neighborDeltas.length ? neighborDeltas.reduce((a, b) => a + b, 0) / neighborDeltas.length : null;
  const minNeighborDelta = neighborDeltas.length ? Math.min(...neighborDeltas) : null;

  // grid-relative ratios at the drift scales
  const gridRelative = {};
  for (const dir of DIRS) {
    for (const magKm of ARGMIN_MAGS_KM) {
      const p = perturbations.find((q) => q.dir === dir && q.magKm === magKm);
      if (p?.ok && meanNeighborDelta) {
        gridRelative[`${dir}@${magKm.toExponential(0)}km`] = {
          absDC3: Math.abs(p.dC3),
          ratio_vs_meanNeighbor: Math.abs(p.dC3) / meanNeighborDelta,
          ratio_vs_minNeighbor: minNeighborDelta ? Math.abs(p.dC3) / minNeighborDelta : null,
        };
      }
    }
  }

  // argmin stability: full-grid recompute with per-cell perturbation (systematic
  // direction in each cell's own local frame — synthetic model of a persistent
  // ephemeris-model error)
  const argminStability = {};
  for (const dir of DIRS) {
    for (const magKm of ARGMIN_MAGS_KM) {
      let pBest = { c3: Infinity, depIdx: -1, tofDays: -1 };
      for (let di = 0; di < departureTdbs.length; di++) {
        for (const tof of tofDaysList) {
          const base = solveCell(body, di, tof); // nominal arrival state for units
          if (!base.ok && base.arrPosKm === undefined) continue;
          const u = unitVectors(base.arrPosKm, base.arrVelKmps)[dir];
          const p = solveCell(body, di, tof, add3(base.arrPosKm, scale3(u, magKm)));
          if (p.ok && p.c3 < pBest.c3) pBest = { c3: p.c3, depIdx: di, tofDays: tof };
        }
      }
      argminStability[`${dir}@${magKm.toExponential(0)}km`] = {
        moved: pBest.depIdx !== best.depIdx || pBest.tofDays !== best.tofDays,
        baseline: { date: departureDateStrings[best.depIdx], tofDays: best.tofDays, c3: best.c3 },
        perturbed: { date: departureDateStrings[pBest.depIdx], tofDays: pBest.tofDays, c3: pBest.c3 },
        dep_shift_days: (pBest.depIdx - best.depIdx) * 7,
        tof_shift_days: pBest.tofDays - best.tofDays,
      };
    }
  }

  results.bodies[sel.bodyId] = {
    selection: sel, cachedMinC3: cached.minC3, baselineArgminRelDiffVsCache: baselineVsCache,
    bestCell: { date: departureDateStrings[best.depIdx], tofDays: best.tofDays, c3: best.c3,
      vInfDep: nominal.vInfDep, vInfArr: nominal.vInfArr, arrSpeedKmps },
    perturbations, neighbors, meanNeighborDelta, minNeighborDelta, gridRelative, argminStability,
  };
  console.log(`--- ${sel.bodyId} done (best ${departureDateStrings[best.depIdx]} / ${best.tofDays} d, C3 ${best.c3.toFixed(6)}) ---`);
}

results.convergenceFailures = convergenceFailures;
fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2));
console.log(`\nresults written: ${RESULTS_JSON}`);

// compact console tables
for (const [bodyId, r] of Object.entries(results.bodies)) {
  console.log(`\n=== ${bodyId} (best ${r.bestCell.date}/${r.bestCell.tofDays}d, C3 ${r.bestCell.c3.toFixed(4)} km2/s2, arr speed ${r.bestCell.arrSpeedKmps.toFixed(3)} km/s) ===`);
  console.log('  dir     magKm    dC3(km2/s2)   dC3%      dvInfDep(km/s)  dvInfArr(km/s)  tShift');
  for (const p of r.perturbations) {
    if (!p.ok) { console.log(`  ${p.dir.padEnd(7)} ${p.magKm.toExponential(0).padStart(6)}  CONVERGENCE FAILURE (${p.reason})`); continue; }
    const t = p.alongTrack_timeShift_hours === null ? '' : `${p.alongTrack_timeShift_hours.toFixed(2)} h`;
    console.log(`  ${p.dir.padEnd(7)} ${p.magKm.toExponential(0).padStart(6)}  ${p.dC3.toExponential(3).padStart(11)}  ${p.dC3_pct.toFixed(4).padStart(8)}  ${p.dVInfDep.toExponential(3).padStart(13)}  ${p.dVInfArr.toExponential(3).padStart(13)}  ${t}`);
  }
  console.log(`  neighbors |dC3|: mean ${r.meanNeighborDelta?.toExponential(3)} min ${r.minNeighborDelta?.toExponential(3)} km2/s2`);
  for (const [k, v] of Object.entries(r.gridRelative)) console.log(`  grid-ratio ${k}: |dC3| ${v.absDC3.toExponential(3)} -> x${v.ratio_vs_meanNeighbor.toFixed(3)} of mean-neighbor step`);
  for (const [k, v] of Object.entries(r.argminStability)) console.log(`  argmin ${k}: ${v.moved ? `MOVED dep ${v.dep_shift_days >= 0 ? '+' : ''}${v.dep_shift_days}d, tof ${v.tof_shift_days >= 0 ? '+' : ''}${v.tof_shift_days}d` : 'unchanged'}`);
}
if (convergenceFailures.length) console.log(`\nCONVERGENCE FAILURES: ${JSON.stringify(convergenceFailures)}`);
else console.log('\nno convergence failures');
