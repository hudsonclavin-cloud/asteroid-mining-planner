#!/usr/bin/env node
/**
 * FRONT B PHASE 3, STEP 10 — the product-visible consequence.
 *
 * For each NEA-band body: compute the LIVE porkchop grid (200x100, DEC-5 composite of
 * M=0 and M=1) twice —
 *   SHIPPED: arrival states from propagateKeplerianStateVectors(catalog elements, t)
 *            (verbatim what porkchop.worker.ts does), and
 *   TRUTH:   arrival states hermite-interpolated from the committed JPL truth fixture
 *            (interpolateBodyStateSeries — the repo's own interpolator).
 * The TRUTH grid applies the MEASURED drift per cell, in magnitude AND direction, at
 * every arrival epoch — strictly stronger than perturbing one cell synthetically.
 *
 * Reported per body: does the composite argmin move; where to; C3 delta at the shipped
 * argmin cell; max per-cell |dC3|; badge-relevant threshold crossings at 25 km^2/s^2.
 *
 * Cross-check (different artifact, different day): shipped M=0/M=1 minima must
 * reproduce multirev-consistency-results.json for the 5 overlap bodies.
 *
 * Repo math only; no frame rotation of my own (truth ICRF, propagator ICRF).
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const HERE = 'C:/Users/hudso/Documents/aster-slice18';
const BUILD = path.join(HERE, 'build-v2x');
const OUT = path.join(HERE, 'nea-argmin-consequence-results.json');

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { computePorkchopGrid } = await imp('porkchop/grid-compute.js');
const { compositeGrids, minSelectedC3, selectedC3 } = await imp('porkchop/composite-grid.js');
const { propagateKeplerianStateVectors } = await imp('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await imp('core/interpolators/hermite.js');
const { ingestSlice9Fixture } = await imp('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await imp('boundary/horizons.js');

const SPD = 86400;
const J2000 = 2451545.0;
const jdToSec = (jd) => (jd - J2000) * SPD;
const jdToIso = (jd) => new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10);

const earthSeries = ingestSlice2Fixture(JSON.parse(fs.readFileSync(
  path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'))).earth.map((s) => s.state);
const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(
  path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
const catByDes = new Map(Object.values(catalog.asteroids).map((b) => [b.designation, b]));
const truth = JSON.parse(fs.readFileSync(
  path.join(REPO, 'tests/fixtures/v2/nea-drift-truth-2026-2046.json'), 'utf8'));
const multirev = JSON.parse(fs.readFileSync(path.join(HERE, 'multirev-consistency-results.json'), 'utf8'));

// LIVE porkchop grid (app/porkchop/main.ts:181-188 convention, reproduced as before)
const utcMidnightToJdTdb = (d) => J2000 + (Date.parse(d + 'T00:00:00Z') / 1000 - 946728000 + 69.184) / SPD;
const GRID = {
  depStartJD: utcMidnightToJdTdb('2026-01-01'),
  depEndJD: utcMidnightToJdTdb('2040-01-01'),
  tofMinDays: 182.5, tofMaxDays: 1826.25, nDep: 200, nTof: 100,
};
const FEASIBLE_C3 = 25;

/** Truth records -> CanonicalState[] for the repo interpolator. km->m, km/s->m/s. */
function truthSeries(des) {
  return truth.targets[des].records.map((r) => ({
    positionM: { x: r[1] * 1000, y: r[2] * 1000, z: r[3] * 1000 },
    velocityMps: { x: r[4] * 1000, y: r[5] * 1000, z: r[6] * 1000 },
    tdbSeconds: jdToSec(r[0]),
    frame: 'FRAME_HELIO_J2000_ICRF',
  }));
}

function grids(bodyElements, targetProvider) {
  const deps = {
    getEarthStateAtTdbSeconds: (t) => interpolateBodyStateSeries('earth', earthSeries, t),
    propagateTargetStateAtTdbSeconds: targetProvider,
  };
  const g0 = computePorkchopGrid(bodyElements, GRID, 0, deps);
  const g1 = computePorkchopGrid(bodyElements, GRID, 1, deps);
  return compositeGrids(g0.cells, g1.cells);
}

const NEAS = Object.entries(truth.targets).filter(([, t]) => t.band === 'nea').map(([d]) => d);
const results = { generatedAtUtc: new Date().toISOString(), grid: GRID, bodies: {}, crossCheck: {} };

for (const des of NEAS) {
  const cat = catByDes.get(des);
  const series = truthSeries(des);

  const shipped = grids(cat.elements, (el, t) => propagateKeplerianStateVectors(el, t));
  const truthG = grids(cat.elements, (el, t) => interpolateBodyStateSeries(des, series, t));

  const sMin = minSelectedC3(shipped.cells);
  const tMin = minSelectedC3(truthG.cells);

  // per-cell comparison
  let maxAbsDc3 = 0; let maxAbsDc3At = null;
  let statusChanges = 0; let bothOk = 0;
  let crossings = 0; // cells whose feasibility side of 25 km^2/s^2 flips
  for (let i = 0; i < shipped.cells.length; i += 1) {
    const cs = selectedC3(shipped.cells[i]);
    const ct = selectedC3(truthG.cells[i]);
    if ((cs === null) !== (ct === null)) { statusChanges += 1; continue; }
    if (cs === null || ct === null) continue;
    bothOk += 1;
    const d = Math.abs(ct - cs);
    if (d > maxAbsDc3) { maxAbsDc3 = d; maxAbsDc3At = { depJD: shipped.cells[i].depJD, tofDays: shipped.cells[i].tofDays }; }
    if ((cs <= FEASIBLE_C3) !== (ct <= FEASIBLE_C3)) crossings += 1;
  }

  // dC3 at the shipped argmin cell, evaluated in the truth grid at the SAME cell index
  let dC3AtShippedArgmin = null;
  if (sMin !== null) {
    const idx = shipped.cells.indexOf(sMin.cell);
    const ct = selectedC3(truthG.cells[idx]);
    dC3AtShippedArgmin = ct === null ? 'shipped argmin cell has NO solution in the truth grid' : ct - sMin.c3;
  }

  const moved = sMin !== null && tMin !== null &&
    (sMin.cell.depJD !== tMin.cell.depJD || sMin.cell.tofDays !== tMin.cell.tofDays);

  results.bodies[des] = {
    shippedMin: sMin === null ? null : { c3: sMin.c3, dep: jdToIso(sMin.cell.depJD), tofDays: +sMin.cell.tofDays.toFixed(2), M: sMin.cell.M },
    truthMin: tMin === null ? null : { c3: tMin.c3, dep: jdToIso(tMin.cell.depJD), tofDays: +tMin.cell.tofDays.toFixed(2), M: tMin.cell.M },
    argminMoved: moved,
    argminShiftDays: moved ? +((tMin.cell.depJD - sMin.cell.depJD)).toFixed(1) : 0,
    minC3Delta: sMin !== null && tMin !== null ? tMin.c3 - sMin.c3 : null,
    dC3AtShippedArgmin,
    maxAbsDc3, maxAbsDc3At: maxAbsDc3At ? { dep: jdToIso(maxAbsDc3At.depJD), tofDays: +maxAbsDc3At.tofDays.toFixed(2) } : null,
    bothOk, statusChanges, feasibilityCrossings25: crossings,
  };
  const b = results.bodies[des];
  console.log(des.padEnd(11) +
    (b.argminMoved ? 'ARGMIN MOVED  ' : 'argmin same   ') +
    'shipped ' + (b.shippedMin ? b.shippedMin.c3.toPrecision(6) + ' @' + b.shippedMin.dep + '/M' + b.shippedMin.M : 'none').padEnd(30) +
    'truth ' + (b.truthMin ? b.truthMin.c3.toPrecision(6) + ' @' + b.truthMin.dep + '/M' + b.truthMin.M : 'none').padEnd(30) +
    'dMin ' + (b.minC3Delta === null ? 'n/a' : b.minC3Delta.toExponential(2)).padEnd(10) +
    'max|dC3| ' + b.maxAbsDc3.toExponential(2) + ' statusChg ' + b.statusChanges + ' xings ' + b.feasibilityCrossings25);
}

// ---- cross-check shipped baselines vs the multirev artifact (independent path) ----
for (const des of ['asteroid-433', 'asteroid-163693', 'asteroid-99942', 'asteroid-1979 XB', 'asteroid-2021 CG6']) {
  const plain = des.replace('asteroid-', '');
  const prior = multirev.bodies[des];
  if (!prior || !results.bodies[plain]) continue;
  const cat = catByDes.get(plain);
  const deps = {
    getEarthStateAtTdbSeconds: (t) => interpolateBodyStateSeries('earth', earthSeries, t),
    propagateTargetStateAtTdbSeconds: (el, t) => propagateKeplerianStateVectors(el, t),
  };
  const g0 = computePorkchopGrid(cat.elements, GRID, 0, deps);
  const g1 = computePorkchopGrid(cat.elements, GRID, 1, deps);
  const m0 = minSelectedC3(g0.cells); const m1 = minSelectedC3(g1.cells);
  results.crossCheck[plain] = {
    m0_now: m0 === null ? null : m0.c3, m0_prior: prior.M0.minC3,
    m1_now: m1 === null ? null : m1.c3, m1_prior: prior.M1.minC3,
    m0_match: m0 !== null && prior.M0.minC3 !== null && Math.abs(m0.c3 - prior.M0.minC3) < 1e-9,
    m1_match: (m1 === null && prior.M1.minC3 === null) || (m1 !== null && prior.M1.minC3 !== null && Math.abs(m1.c3 - prior.M1.minC3) < 1e-9),
  };
}
console.log('\ncross-check vs multirev artifact:', JSON.stringify(results.crossCheck, null, 1));

fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log('\nresults written: ' + OUT);
