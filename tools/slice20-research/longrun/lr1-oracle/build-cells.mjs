#!/usr/bin/env node
// LR1 step 1+2 — sample bodies and return cells, and solve them with the UNEDITED production kernel.
//
// Aster side of the K1 oracle dataset. For every sampled return cell the unedited
// computePorkchopGrid (src/v2/porkchop/grid-compute.ts) is called on a 1x1 grid with SWAPPED
// providers (DEC-20-1 mechanism):
//   getEarthStateAtTdbSeconds          -> the ASTEROID at departure (production Keplerian propagator)
//   propagateTargetStateAtTdbSeconds   -> EARTH at arrival (production linear-scan Hermite lookup)
// mapBranches keeps only magnitudes, so the v-infinity VECTORS are recomputed here from the
// branch's v1/v2 and the exact provider states the kernel was given:
//   vInfAsteroidDeparture = v1 - v_asteroid(t_dep)      vInfEarthArrival = v2 - v_Earth(t_arr)
// (ICRF axes, km/s). Writes <scratch>/lr1/lr1-cells.json for the Python oracle driver.
//
// Usage: node tools/slice20-research/longrun/lr1-oracle/build-cells.mjs
import fs from 'node:fs';
import path from 'node:path';
import {
  RUN_SEED, importV2, jdTdbToDate, loadCatalogBodies, loadEarthSeries, loadTiers, makeUtcMidnightToJdTdb,
  mulberry32, readBuildStamp, repoRoot, scratchRoot, seededShuffle, sha256File, writeJsonAtomic,
  CATALOG_FIXTURE_REL, EARTH_FIXTURE_REL, TIER_ARTIFACT_REL,
} from '../lib/common.mjs';

console.debug = () => {}; // lambertMultiRev logs every M>=1 cell below T_min; tool-side silence only

const stamp = readBuildStamp();
const { computePorkchopGrid } = await importV2('porkchop/grid-compute.js');
const { propagateKeplerianStateVectors, GM_SUN_M3_S2 } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');
const { assessPropagation } = await importV2('porkchop/propagation-guard.js');
const utcMidnightToJdTdb = makeUtcMidnightToJdTdb(J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY);

// ---- parameters (all recorded in the output) -------------------------------------------------
const SEED = RUN_SEED;
const N_BODIES = 40;
const CELLS_PER_BODY = 150;
const REQUIRED = ['433', '99942', '101955', '2000 SG344', '2008 HU4', '1998 KY26'];
const TIER_TARGET = { L0: 4, L1: 18, L2: 18 }; // required bodies count toward their tier
// Return grid = the compare-parity grid (DEC-20-2 "outbound parity"), read as asteroid DEPARTURE dates.
const GRID = {
  departureStartUtc: '2026-01-01',
  departureEndUtc: '2040-01-01',
  nDep: 731,
  nTof: 100,
  tofMinDays: 182.5,
  tofMaxDays: 1826.25,
};
const M_VALUES = [0, 1];
const MU_SUN_KM3_S2 = GM_SUN_M3_S2 / 1000 ** 3; // same expression as grid-compute.ts:9

// ---- data ------------------------------------------------------------------------------------
const earthSeries = await loadEarthSeries();
const earthFirstS = earthSeries[0].tdbSeconds;
const earthLastS = earthSeries[earthSeries.length - 1].tdbSeconds;
const earthLastJd = J2000_TDB_JULIAN_DATE + earthLastS / SECONDS_PER_DAY;
const bodies = await loadCatalogBodies();
const tiers = loadTiers();
const byDesignation = new Map(bodies.map((b) => [b.designation, b]));

// ---- body sample: stratified by fidelity tier, seeded ----------------------------------------
const chosen = [];
const notes = [];
const tierCount = { L0: 0, L1: 0, L2: 0 };
for (const des of REQUIRED) {
  const body = byDesignation.get(des);
  if (!body) {
    notes.push(`required body ${des}: ABSENT from catalog fixture`);
    continue;
  }
  const verdict = assessPropagation(body.elements);
  if (verdict.propagatable === false) {
    notes.push(`required body ${des}: not propagatable (${verdict.reason})`);
    continue;
  }
  const tier = tiers.get(des)?.tier ?? 'UNKNOWN';
  chosen.push({ body, tier, how: 'required' });
  tierCount[tier] = (tierCount[tier] ?? 0) + 1;
}
const sortedDesignations = bodies.map((b) => b.designation).sort();
const shuffled = seededShuffle(sortedDesignations, SEED);
const chosenSet = new Set(chosen.map((c) => c.body.designation));
for (const tier of ['L0', 'L1', 'L2']) {
  for (const des of shuffled) {
    if (tierCount[tier] >= TIER_TARGET[tier]) break;
    if (chosenSet.has(des)) continue;
    if ((tiers.get(des)?.tier ?? 'UNKNOWN') !== tier) continue;
    const body = byDesignation.get(des);
    const verdict = assessPropagation(body.elements);
    if (verdict.propagatable === false) {
      notes.push(`seeded draw ${des} (${tier}): skipped, not propagatable (${verdict.reason})`);
      continue;
    }
    chosen.push({ body, tier, how: 'seeded' });
    chosenSet.add(des);
    tierCount[tier] += 1;
  }
}
if (chosen.length !== N_BODIES) {
  notes.push(`body count ${chosen.length} != target ${N_BODIES} (tier counts ${JSON.stringify(tierCount)})`);
}

// ---- return grid (same linspace arithmetic as grid-compute.ts buildLinspace) ------------------
const depStartJd = utcMidnightToJdTdb(GRID.departureStartUtc);
const depEndJd = utcMidnightToJdTdb(GRID.departureEndUtc);
const depStep = (depEndJd - depStartJd) / (GRID.nDep - 1);
const tofStep = (GRID.tofMaxDays - GRID.tofMinDays) / (GRID.nTof - 1);
const depJdAt = (i) => depStartJd + depStep * i;
const tofAt = (j) => GRID.tofMinDays + tofStep * j;
// Earth-arrival epoch exactly as the kernel computes it (grid-compute.ts:176,182-183).
const arrivalSeconds = (depJd, tofDays) => (depJd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY + tofDays * SECONDS_PER_DAY;

const admissible = [];
let refusedCells = 0;
let beforeFixtureCells = 0;
for (let i = 0; i < GRID.nDep; i += 1) {
  for (let j = 0; j < GRID.nTof; j += 1) {
    const arr = arrivalSeconds(depJdAt(i), tofAt(j));
    if (arr > earthLastS) refusedCells += 1; // DEC-20-3: refused, never extrapolated
    else if (arr < earthFirstS) beforeFixtureCells += 1;
    else admissible.push([i, j]);
  }
}

// 150 cells "spread over the return grid": the admissible list (departure-major order) is cut into
// 150 contiguous chunks and one cell is drawn per chunk with the seeded PRNG, so departure dates are
// evenly covered and TOF is uniform inside each chunk. A separate PRNG stream per body.
function sampleCells(bodyIndex) {
  const rand = mulberry32((SEED ^ Math.imul(bodyIndex + 1, 0x9e3779b1)) >>> 0);
  const picks = [];
  for (let k = 0; k < CELLS_PER_BODY; k += 1) {
    const lo = Math.floor((k * admissible.length) / CELLS_PER_BODY);
    const hi = Math.floor(((k + 1) * admissible.length) / CELLS_PER_BODY);
    picks.push(admissible[lo + Math.floor(rand() * (hi - lo))]);
  }
  return picks;
}

const vec = (o) => [o.x / 1000, o.y / 1000, o.z / 1000]; // m -> km, m/s -> km/s (same /1000 as the kernel)
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mag3 = (a) => Math.hypot(a[0], a[1], a[2]); // same Math.hypot as grid-compute.ts magnitude3

const records = [];
const perBody = [];
let magnitudeMismatches = 0;
const startedAt = Date.now();
chosen.forEach(({ body, tier, how }, bodyIndex) => {
  const cells = sampleCells(bodyIndex);
  const stats = { designation: body.designation, tier, how, orbitClass: body.orbitClass, cells: cells.length, byM: {} };
  for (const M of M_VALUES) {
    const s = { cellsOk: 0, cellsNoSolution: 0, cellsStall: 0, branchesConverged: 0, branchesNotConverged: 0 };
    for (const [i, j] of cells) {
      const depJd = depJdAt(i);
      const tofDays = tofAt(j);
      let asteroidAtDeparture = null;
      let earthAtArrival = null;
      const result = computePorkchopGrid(
        body.elements,
        { depStartJD: depJd, depEndJD: depJd, tofMinDays: tofDays, tofMaxDays: tofDays, nDep: 1, nTof: 1 },
        M,
        {
          getEarthStateAtTdbSeconds: (t) => {
            asteroidAtDeparture = propagateKeplerianStateVectors(body.elements, t);
            return asteroidAtDeparture;
          },
          propagateTargetStateAtTdbSeconds: (_elements, t) => {
            earthAtArrival = interpolateBodyStateSeries('earth', earthSeries, t);
            return earthAtArrival;
          },
        },
      );
      const cell = result.cells[0];
      if (cell.status === 'no_solution') s.cellsNoSolution += 1;
      else if (cell.status === 'stall') s.cellsStall += 1;
      else s.cellsOk += 1;
      const r1 = vec(asteroidAtDeparture.positionM);
      const r2 = vec(earthAtArrival.positionM);
      const vAst = vec(asteroidAtDeparture.velocityMps);
      const vEarth = vec(earthAtArrival.velocityMps);
      for (const branch of cell.branches) {
        if (!branch.converged) {
          s.branchesNotConverged += 1;
          continue;
        }
        s.branchesConverged += 1;
        const vInfDepVec = sub3(branch.v1, vAst);
        const vInfArrVec = sub3(branch.v2, vEarth);
        if (mag3(vInfDepVec) !== branch.vInfDep || mag3(vInfArrVec) !== branch.vInfArr) magnitudeMismatches += 1;
        records.push({
          id: `${body.designation}|${i}|${j}|M${M}|${branch.branch}`,
          designation: body.designation,
          tier,
          depIdx: i,
          tofIdx: j,
          depJdTdb: depJd,
          tofDays,
          tofSeconds: tofDays * SECONDS_PER_DAY,
          arrJdTdb: depJd + tofDays,
          M,
          branch: branch.branch,
          x: branch.x,
          selected: cell.selectedBranch !== null && cell.branches[cell.selectedBranch] === branch,
          r1Km: r1,
          r2Km: r2,
          vAsteroidDepKmS: vAst,
          vEarthArrKmS: vEarth,
          aster: {
            v1KmS: [...branch.v1],
            v2KmS: [...branch.v2],
            vInfAsteroidDepartureKmS: vInfDepVec,
            vInfEarthArrivalKmS: vInfArrVec,
            vInfDepMagKernel: branch.vInfDep,
            vInfArrMagKernel: branch.vInfArr,
          },
        });
      }
    }
    stats.byM[`M${M}`] = s;
  }
  perBody.push(stats);
});

const out = {
  schema: 'aster-s20-longrun-lr1-cells/1',
  label: 'LEADS-grade research evidence. Not a validation. No pass/fail threshold is set.',
  generatedAtUtc: new Date().toISOString(),
  headCommit: stamp.head,
  node: process.version,
  seed: SEED,
  muSunKm3S2: MU_SUN_KM3_S2,
  frame: 'ICRF axes, heliocentric, km and km/s (fixture frame ICRF/J2000, TDB)',
  kernel: 'computePorkchopGrid (src/v2/porkchop/grid-compute.ts), unedited, 1x1 grid per cell, swapped providers, lw=true (prograde)',
  earthLookup: 'production interpolateBodyStateSeries (linear scan)',
  inputs: {
    [EARTH_FIXTURE_REL]: sha256File(path.join(repoRoot, EARTH_FIXTURE_REL)),
    [CATALOG_FIXTURE_REL]: sha256File(path.join(repoRoot, CATALOG_FIXTURE_REL)),
    [TIER_ARTIFACT_REL]: sha256File(path.join(repoRoot, TIER_ARTIFACT_REL)),
  },
  grid: {
    ...GRID,
    depStartJdTdb: depStartJd,
    depEndJdTdb: depEndJd,
    depStepDays: depStep,
    tofStepDays: tofStep,
    totalCells: GRID.nDep * GRID.nTof,
    earthFixtureLastJdTdb: earthLastJd,
    earthFixtureLastDateTdb: jdTdbToDate(earthLastJd),
    refusedCellsEarthArrivalAfterFixtureEnd: refusedCells,
    cellsEarthArrivalBeforeFixtureStart: beforeFixtureCells,
    admissibleCells: admissible.length,
    refusalRule: 'arrivalTdbSeconds > last Earth sample tdbSeconds (DEC-20-3); arrival computed as the kernel computes it',
  },
  sampling: {
    bodies: N_BODIES,
    tierTarget: TIER_TARGET,
    tierCount,
    required: REQUIRED,
    cellsPerBody: CELLS_PER_BODY,
    cellRule: 'admissible cells in departure-major order, 150 contiguous chunks, one seeded draw per chunk',
    mValues: M_VALUES,
    notes,
  },
  checks: {
    kernelMagnitudeVsRecomputedVectorMismatches: magnitudeMismatches,
    note: 'count of converged branches where |recomputed vector| !== kernel vInfDep/vInfArr (exact float compare)',
  },
  perBody,
  recordCount: records.length,
  computeMs: Date.now() - startedAt,
  records,
};
const outPath = path.join(scratchRoot, 'lr1', 'lr1-cells.json');
writeJsonAtomic(outPath, out);
console.log(JSON.stringify({
  outPath, bytes: fs.statSync(outPath).size, bodies: chosen.length, tierCount, records: records.length,
  refusedCells, admissible: admissible.length, magnitudeMismatches, computeMs: out.computeMs, notes,
}, null, 2));
