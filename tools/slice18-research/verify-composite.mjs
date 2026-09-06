#!/usr/bin/env node
/**
 * PHASE 3.4 VERIFICATION — composite selection against real grids.
 * Repo READ-ONLY; this script and its build live OUTSIDE the repo.
 *
 * Check A (load-bearing): the M=0-only view reproduces the cached minC3.
 *   Reconstructs the CACHE grid exactly inside computePorkchopGrid's linspace:
 *   dep 2026-01-01 + k*7 d, 783 points (last = start + 5474 d); TOF 182..1802 step
 *   30 d, 55 points. Cache used izzo; the view uses lambertMultiRev — the Front A
 *   measurement proved these bit-identical at M=0, so an exact match is expected.
 * Check B: composite min <= each single-family min. TRUE BY CONSTRUCTION under
 *   strict-lower-with-M=0-ties; kept because it catches a selection bug.
 * Check C: exact-tie count (expected ~0 in float64; a real count is a signal).
 * Plus: cells the composite rescues (M=1 blank where M=0 solves), and the live
 *   porkchop grid for the five previously-empty bodies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = path.join(__dirname, 'build-v2p');

fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });
const tsc = spawnSync(process.execPath, [
  path.join(REPO, 'node_modules', 'typescript', 'bin', 'tsc'),
  '--pretty', 'false', '--outDir', BUILD, '--rootDir', path.join(REPO, 'src', 'v2'),
  '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
  '--isolatedModules', 'true',
  path.join(REPO, 'src/v2/porkchop/grid-compute.ts'),
  path.join(REPO, 'src/v2/porkchop/composite-grid.ts'),
  path.join(REPO, 'src/v2/core/propagators/keplerian.ts'),
  path.join(REPO, 'src/v2/core/units/utc-to-tdb.ts'),
  path.join(REPO, 'src/v2/core/units.ts'),
  path.join(REPO, 'src/v2/core/interpolators/hermite.ts'),
  path.join(REPO, 'src/v2/boundary/slice9-nea-catalog.ts'),
  path.join(REPO, 'src/v2/boundary/horizons.ts'),
], { cwd: REPO, encoding: 'utf8' });
if (tsc.status !== 0) { console.error('tsc failed:', tsc.stdout, tsc.stderr); process.exit(1); }

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { computePorkchopGrid } = await imp('porkchop/grid-compute.js');
const { compositeGrids, minSelectedC3 } = await imp('porkchop/composite-grid.js');
const { propagateKeplerianStateVectors } = await imp('core/propagators/keplerian.js');
const { utcStringToTdbSeconds } = await imp('core/units/utc-to-tdb.js');
const { interpolateBodyStateSeries } = await imp('core/interpolators/hermite.js');
const { ingestSlice9Fixture } = await imp('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await imp('boundary/horizons.js');

const SECONDS_PER_DAY = 86_400;
const J2000_JD = 2451545.0;

const earthSeries = ingestSlice2Fixture(JSON.parse(fs.readFileSync(
  path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'))).earth.map((s) => s.state);
const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(
  path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
const cache = JSON.parse(fs.readFileSync(path.join(REPO, 'docs/lambert-screen-cache.json'), 'utf8'));
const cacheById = new Map(cache.bodies.map((b) => [b.bodyId, b]));

const deps = { // porkchop.worker.ts:138-141 wiring
  getEarthStateAtTdbSeconds: (t) => interpolateBodyStateSeries('earth', earthSeries, t),
  propagateTargetStateAtTdbSeconds: (el, t) => propagateKeplerianStateVectors(el, t),
};

// --- cache grid, reproduced exactly as a linspace ---
const startJD = J2000_JD + utcStringToTdbSeconds('2026-01-01') / SECONDS_PER_DAY;
const CACHE_GRID = {
  depStartJD: startJD,
  depEndJD: startJD + 782 * 7,   // 783 points, exactly 7 d apart
  tofMinDays: 182,
  tofMaxDays: 1802,              // 55 points, exactly 30 d apart
  nDep: 783,
  nTof: 55,
};
// --- the live porkchop grid (app/porkchop/main.ts:181-188) ---
const utcMidnightToJdTdb = (d) => J2000_JD + (Date.parse(`${d}T00:00:00Z`) / 1000 - 946_728_000 + 69.184) / SECONDS_PER_DAY;
const LIVE_GRID = {
  depStartJD: utcMidnightToJdTdb('2026-01-01'),
  depEndJD: utcMidnightToJdTdb('2040-01-01'),
  tofMinDays: 182.5, tofMaxDays: 1826.25, nDep: 200, nTof: 100,
};

const BODIES = ['asteroid-433', 'asteroid-163693', 'asteroid-99942', 'asteroid-1979 XB', 'asteroid-2021 CG6'];
const PREVIOUSLY_EMPTY = ['asteroid-2017 UR52', 'asteroid-12P', 'asteroid-2025 VP', 'asteroid-2022 BG4', 'asteroid-2014 PP69'];

const rel = (a, b) => (b === 0 ? Math.abs(a) : Math.abs(a - b) / Math.abs(b));
let worstGateAbs = 0;
let worstGateRel = 0;
let totalTies = 0;
let monotonicityFailures = 0;

console.log('=== CHECK A (load-bearing): M=0-only view reproduces cached minC3, on the cache grid ===');
for (const id of BODIES) {
  const body = catalog.asteroids[id];
  const cached = cacheById.get(id);
  const g0 = computePorkchopGrid(body.elements, CACHE_GRID, 0, deps);
  const best = minSelectedC3(g0.cells);
  const r = rel(best.c3, cached.minC3);
  const abs = Math.abs(best.c3 - cached.minC3);
  worstGateRel = Math.max(worstGateRel, r);
  worstGateAbs = Math.max(worstGateAbs, abs);
  console.log(`  ${id.padEnd(20)} abs ${abs.toExponential(3)} km2/s2 | rel ${r.toExponential(3)} | margin x${(1e-9/abs).toFixed(0)} below the 1e-9 abs gate`);
}
console.log(`  worst ABSOLUTE difference: ${worstGateAbs.toExponential(3)} km2/s2 (gate: <= 1e-9 abs, ruled 2026-08-31)`);
console.log(`  worst relative difference: ${worstGateRel.toExponential(3)} — relative is the WRONG instrument near zero C3 (Apophis minC3 ~2.06e-4)`);
const gateAPass = worstGateAbs <= 1e-9;
console.log(gateAPass ? '  GATE A: PASSED' : '  GATE A: FAILED on the absolute threshold');

console.log('=== CHECKS B + C: composite on the LIVE porkchop grid ===');
for (const id of [...BODIES, ...PREVIOUSLY_EMPTY]) {
  const body = catalog.asteroids[id];
  const cached = cacheById.get(id);
  const g0 = computePorkchopGrid(body.elements, LIVE_GRID, 0, deps);
  const g1 = computePorkchopGrid(body.elements, LIVE_GRID, 1, deps);
  const { cells, counts } = compositeGrids(g0.cells, g1.cells);

  const m0Min = minSelectedC3(g0.cells);
  const m1Min = minSelectedC3(g1.cells);
  const cMin = minSelectedC3(cells);
  totalTies += counts.exactTies;

  const okB = cMin !== null
    && (m0Min === null || cMin.c3 <= m0Min.c3)
    && (m1Min === null || cMin.c3 <= m1Min.c3);
  if (!okB) monotonicityFailures += 1;

  const fmt = (x) => (x === null ? 'none' : x.c3.toPrecision(7));
  console.log(`  ${id}`);
  console.log(`    M0 min ${fmt(m0Min)} | M1 min ${fmt(m1Min)} | COMPOSITE min ${fmt(cMin)} (from M=${cMin?.cell.M}) | B:${okB ? 'ok' : 'FAIL'}`);
  console.log(`    rescued cells (M1 blank, M0 solves): ${counts.onlyM0} / ${counts.total}` +
              ` | onlyM1 ${counts.onlyM1} | m0Won ${counts.m0Won} | m1Won ${counts.m1Won}` +
              ` | ties ${counts.exactTies} | neither ${counts.neither} (stall-preserved ${counts.neitherStall})`);
  console.log(`    cached badge: ${cached.status} (minC3 ${cached.minC3.toPrecision(6)})`);
}

console.log('');
console.log(`CHECK B — monotonicity failures: ${monotonicityFailures} (true by construction; catches selection bugs only)`);
console.log(`CHECK C — exact float64 ties across all tested bodies: ${totalTies}`);
