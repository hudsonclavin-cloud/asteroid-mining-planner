#!/usr/bin/env node
// XR2 step 4 — the same validity census on the RETURN grid, 400 seeded bodies, so LR1's 1.55% (219 of
// 14,124 sampled converged branches) has a larger sample. RESUMABLE (one NDJSON line per body).
//
// Population as in LR1 (tools/slice20-research/longrun/lr1-oracle/build-cells.mjs): the return grid is
// the compare-parity grid read as asteroid DEPARTURE dates (731 dates 2026-01-01..2040-01-01 x 100 TOF
// 182.5-1826.25 d), M = 0 and M = 1, only cells whose Earth arrival is not after the last Earth sample,
// every CONVERGED BRANCH counted (M = 1 left and right separately). LR1 sampled 150 cells per body on 40
// tier-stratified bodies; here every admissible cell of 400 bodies drawn by one seeded shuffle of the
// whole catalog (no stratification) is counted.
// Kernel: the unedited computePorkchopGrid with swapped providers (asteroid at departure, Earth at
// arrival). Earth lookup: the bisection lookup LR2 verified, re-verified here at every start.
//
// Usage: node return-census.mjs [--bodies 400] [--limit n]
import fs from 'node:fs';
import path from 'node:path';
import {
  AU_KM, Q_HIST, RUN2_SEED, SOLAR_RADIUS_KM, importV2, loadCatalogBodies, loadEarthSeries, loadTiers,
  makeIndexedEarthLookup, mulberry32, perihelionPassages, qBin, readStamp, scratchRoot, seededShuffle,
  transferOrbit, writeJsonAtomic,
} from '../lib/common2.mjs';

console.debug = () => {};
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback; };
const N_BODIES = Number(arg('bodies', '400'));
const LIMIT = Number(arg('limit', '0'));

readStamp();
const { computePorkchopGrid } = await importV2('porkchop/grid-compute.js');
const { lambertMultiRev } = await importV2('core/lambert/lambert-multi-rev.js');
const { propagateKeplerianStateVectors, GM_SUN_M3_S2 } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries, interpolateBodyState } = await importV2('core/interpolators/hermite.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');
const { assessPropagation } = await importV2('porkchop/propagation-guard.js');
const MU = GM_SUN_M3_S2 / 1000 ** 3;

const earthSeries = await loadEarthSeries();
const earthIndexed = makeIndexedEarthLookup(earthSeries, interpolateBodyState);
const earthLastS = earthIndexed.lastTdbSeconds;
{
  const rand = mulberry32(RUN2_SEED + 7);
  const epochs = [earthIndexed.firstTdbSeconds, earthLastS];
  for (let k = 0; k < 2000; k += 1) epochs.push(earthIndexed.firstTdbSeconds + rand() * (earthLastS - earthIndexed.firstTdbSeconds));
  for (const t of epochs) {
    const a = interpolateBodyStateSeries('earth', earthSeries, t);
    const b = earthIndexed(t);
    for (const k of ['x', 'y', 'z']) if (a.positionM[k] !== b.positionM[k] || a.velocityMps[k] !== b.velocityMps[k]) throw new Error(`indexed Earth lookup differs from production at ${t}`);
  }
}
const utcMidnightToJdTdb = (d) => J2000_TDB_JULIAN_DATE + (Date.parse(`${d}T00:00:00Z`) / 1000 - 946_728_000 + 69.184) / SECONDS_PER_DAY;
const GRID = { depStartJD: utcMidnightToJdTdb('2026-01-01'), depEndJD: utcMidnightToJdTdb('2040-01-01'), tofMinDays: 182.5, tofMaxDays: 1826.25, nDep: 731, nTof: 100 };
const REFUSED = Object.freeze({ positionM: { x: Number.NaN, y: Number.NaN, z: Number.NaN }, velocityMps: { x: Number.NaN, y: Number.NaN, z: Number.NaN } });
const solveRefusing = (r1, r2, tof, mu, M, lw) => (r2[0] !== r2[0] ? null : lambertMultiRev(r1, r2, tof, mu, M, lw));
const km = (o) => [o.x / 1000, o.y / 1000, o.z / 1000];

const tiers = loadTiers();
const catalog = await loadCatalogBodies();
const byDes = new Map(catalog.map((b) => [b.designation, b]));
const order = seededShuffle(catalog.map((b) => b.designation).sort(), RUN2_SEED + 2);
const chosen = [];
const skipped = [];
for (const des of order) {
  if (chosen.length >= N_BODIES) break;
  if (assessPropagation(byDes.get(des).elements).propagatable === false) { skipped.push(des); continue; }
  chosen.push(des);
}

const outDir = path.join(scratchRoot, 'xr2');
fs.mkdirSync(outDir, { recursive: true });
const rowsPath = path.join(outDir, 'return-census.ndjson');
const done = new Map();
if (fs.existsSync(rowsPath)) {
  for (const line of fs.readFileSync(rowsPath, 'utf8').split('\n')) { if (!line) continue; try { const r = JSON.parse(line); done.set(r.des, r); } catch { /* torn line: redo */ } }
  fs.writeFileSync(rowsPath, [...done.values()].map((r) => JSON.stringify(r)).join('\n') + (done.size ? '\n' : ''));
}
const fd = fs.openSync(rowsPath, 'a');
const GROUPS = ['M0 single', 'M1 left', 'M1 right'];
const blank = () => Object.fromEntries(GROUPS.map((g) => [g, { converged: 0, below01Au: 0, belowSun: 0, flagged: 0, flaggedSelected: 0, minFlaggedVInfDep: null, hist: new Array(Q_HIST.bins).fill(0) }]));

function measure(body) {
  const stats = blank();
  let admissible = 0;
  let refused = 0;
  for (const M of [0, 1]) {
    const asteroidR = new Map();
    const grid = computePorkchopGrid(body.elements, GRID, M, {
      getEarthStateAtTdbSeconds: (t) => { const s = propagateKeplerianStateVectors(body.elements, t); asteroidR.set(t, km(s.positionM)); return s; },
      propagateTargetStateAtTdbSeconds: (_e, t) => (t > earthLastS ? REFUSED : earthIndexed(t)),
      solveLambert: solveRefusing,
    });
    for (const c of grid.cells) {
      const depS = (c.depJD - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
      const tofS = c.tofDays * SECONDS_PER_DAY;
      if (depS + tofS > earthLastS) { if (M === 0) refused += 1; continue; } // DEC-20-3
      if (M === 0) admissible += 1;
      const r1 = asteroidR.get(depS);
      for (let k = 0; k < c.branches.length; k += 1) {
        const br = c.branches[k];
        if (!br.converged) continue;
        const g = stats[M === 0 ? 'M0 single' : br.branch === 'left' ? 'M1 left' : 'M1 right'];
        g.converged += 1;
        const o = transferOrbit(r1, br.v1, MU);
        g.hist[qBin(o.q)] += 1;
        if (o.q < 0.1 * AU_KM) {
          g.below01Au += 1;
          if (o.q < SOLAR_RADIUS_KM) {
            g.belowSun += 1;
            if (perihelionPassages(r1, br.v1, tofS, MU, o.ecc) >= 1) {
              g.flagged += 1;
              if (c.selectedBranch === k) g.flaggedSelected += 1;
              if (g.minFlaggedVInfDep === null || br.vInfDep < g.minFlaggedVInfDep) g.minFlaggedVInfDep = br.vInfDep;
            }
          }
        }
      }
    }
  }
  return { des: body.designation, tier: tiers.get(body.designation)?.tier ?? null, cls: body.orbitClass, admissibleCells: admissible, refusedCells: refused, stats };
}

const started = Date.now();
let processed = 0;
for (const des of chosen) {
  if (done.has(des)) continue;
  if (LIMIT > 0 && processed >= LIMIT) break;
  const t0 = Date.now();
  const row = measure(byDes.get(des));
  row.ms = Date.now() - t0;
  fs.writeSync(fd, `${JSON.stringify(row)}\n`);
  done.set(des, row);
  processed += 1;
  if (processed % 20 === 0) writeJsonAtomic(path.join(outDir, 'return-census-checkpoint.json'), { state: 'running', done: done.size, total: chosen.length, updatedAtUtc: new Date().toISOString() }, true);
}
fs.closeSync(fd);
writeJsonAtomic(path.join(outDir, 'return-census-checkpoint.json'), {
  state: done.size >= chosen.length ? 'complete' : 'stopped', done: done.size, total: chosen.length, skippedNotPropagatable: skipped,
  seed: RUN2_SEED + 2, grid: GRID, updatedAtUtc: new Date().toISOString(), node: process.version, secondsThisRun: Math.round((Date.now() - started) / 1000),
}, true);
console.log(JSON.stringify({ state: done.size >= chosen.length ? 'complete' : 'stopped', done: done.size, total: chosen.length, skipped, seconds: Math.round((Date.now() - started) / 1000) }));
