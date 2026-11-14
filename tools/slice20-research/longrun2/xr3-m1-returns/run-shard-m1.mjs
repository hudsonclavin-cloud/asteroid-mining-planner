#!/usr/bin/env node
// XR3 — LR2's symmetric-return measurement with M = 1 returns admitted, one shard. RESUMABLE.
//
// This file is a COPY of tools/slice20-research/longrun/lr2-symmetric/run-shard.mjs (as merged on main)
// with the return leg extended, on purpose: XR3 measures the effect of admitting M = 1, not the pipeline.
// What changed against that file, and nothing else:
//   - pairedReturn() runs the unedited kernel twice over the same return grid, at M = 0 and at M = 1
//     (both M = 1 branches; the kernel selects the lower asteroid-departure |v-inf| per cell), and
//     reports the M = 0 minimum (LR2's quantity), the M = 1 minimum, and the minimum over both;
//   - the row carries errM0 (= LR2's err), errBest (M = 0 and M = 1) for the primary and the secondary
//     window;
//   - imports come from ../../longrun/lib/common.mjs; scratch files are named xr3-*;
//   - the indexed Earth lookup is re-verified against the production lookup at every start
//     (2,000 seeded epochs plus both endpoints, max abs difference must be exactly 0);
//   - BEYOND the dispatch, labelled as such everywhere: each chosen return cell also carries LR1's
//     validity flag (transfer perihelion below one solar radius AND the flown arc passes perihelion,
//     ../lib/common2.mjs), and the row carries the minimum over cells that are NOT flagged
//     (validM0, validM1, bestValid). XR2's return census found 2.6-2.9% of converged M = 1 branches
//     flagged, so an M = 1 minimum has to be shown not to be one of them.
//
// LEADS-grade research evidence only.
//
// Per body (order = seeded shuffle of the whole catalog; shard i takes positions p with p % n == i,
// so every shard, and any partial run, is an unbiased sample):
//   1. OUTBOUND, as the production compare path selects it: the production computeCompareData with
//      the compare page's own arguments (app/compare/main.ts:114-123, 1062-1090: 731x100, M=0,
//      2026-01-01..2040-01-01, TOF 182.5-1826.25 d, relative threshold, delta 5, B_min 2, conn8) and
//      the production providers. Best window = segmentation.bestPractical (DEC-17-3 / DEC-17-8).
//   2. ASSUMED return departure dV = production departureDvFromVInf(outbound vInfArr at that cell)
//      (porkchop/delta-v.ts:32-34), i.e. what the symmetric assumption charges today.
//   3. COMPUTED = minimum asteroid-departure |v-infinity| over the DEC-20-2 pairing window:
//      return departure t_d in [t_a + 8 d, t_a + 730.5 d] (723 columns, ~1.0007 d), TOF 182.5-1826.25 d
//      (100), M=0, from the UNEDITED computePorkchopGrid with swapped providers (DEC-20-1) and the
//      verified indexed Earth lookup (DEC-20-4). Cells whose Earth arrival is after the last Earth
//      sample are REFUSED (DEC-20-3), counted, never extrapolated.
//   4. Support (DEC-20-5): the body's support date (L1 encounter) against the asteroid DEPARTURE epoch
//      of each return cell; the chosen return cell is flagged when it departs at/after that date.
//   5. error = assumed - computed (sign kept).
//   6. SECONDARY (beyond the dispatch's procedure, labelled as such): the same measurement at the
//      outbound cell minimizing the production sample-return dV stack (S20_01 R3's "best stack").
//
// Progress: one NDJSON line per body, appended and flushed as it goes (the durable record), plus a
// checkpoint JSON rewritten at least every 60 s. A restart skips every body already in the NDJSON.
//
// Usage: node run-shard.mjs --shard <i> --of <n> [--max-seconds <s>] [--limit <bodies>]
import fs from 'node:fs';
import path from 'node:path';
import {
  importV2, loadCatalogBodies, loadEarthSeries, loadFeasibleC3Max, loadTiers, makeIndexedEarthLookup,
  makeUtcMidnightToJdTdb, mulberry32, readBuildStamp, scratchRoot, seededShuffle, writeJsonAtomic,
} from '../../longrun/lib/common.mjs';
import { SOLAR_RADIUS_KM, perihelionPassages, transferOrbit } from '../lib/common2.mjs';

console.debug = () => {};

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback;
};
const SHARD = Number(arg('shard', '0'));
const OF = Number(arg('of', '1'));
const MAX_SECONDS = Number(arg('max-seconds', '0'));
const LIMIT = Number(arg('limit', '0'));
const ONLY = arg('only', ''); // comma-separated designations: measure and print, write nothing
if (!Number.isInteger(SHARD) || !Number.isInteger(OF) || SHARD < 0 || SHARD >= OF) throw new Error('bad --shard/--of');

const LR2_SEED = 2026111302;
const RETURN_GRID = { stayMinDays: 8, stayMaxDays: 730.5, nDep: 723, nTof: 100, tofMinDays: 182.5, tofMaxDays: 1826.25, M: [0, 1] };
// The compare page's locked constants (src/v2/app/compare/main.ts:114-123, 142). Read by eye from
// source; they are module-private there. Only the grid/threshold ones affect window selection.
const COMPARE = {
  departureStartUtc: '2026-01-01', departureEndUtc: '2040-01-01', nDep: 731, nTof: 100,
  tofMinDays: 182.5, tofMaxDays: 1826.25, M: 0, thresholdMode: 'relative', deltaKm2S2: 5, bMinCells: 2,
  referenceRendezvousMps: 1000,
};

const stamp = readBuildStamp();
const { computePorkchopGrid } = await importV2('porkchop/grid-compute.js');
const { computeCompareData } = await importV2('porkchop/compare-data.js');
const { departureDvFromVInf, buildDeltaVStack } = await importV2('porkchop/delta-v.js');
const { LAUNCH_VEHICLES, SPACECRAFT_STATIONKEEPING_MPS, deterministicMarginMps } = await importV2('porkchop/launch-vehicles.js');
const { propagateKeplerianStateVectors, GM_SUN_M3_S2 } = await importV2('core/propagators/keplerian.js');
const MU_KM3_S2 = GM_SUN_M3_S2 / 1000 ** 3;
const { interpolateBodyStateSeries, interpolateBodyState } = await importV2('core/interpolators/hermite.js');
const { lambertMultiRev } = await importV2('core/lambert/lambert-multi-rev.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');
const { supportBoundaryFor } = await importV2('porkchop/support-boundary.js');
const utcMidnightToJdTdb = makeUtcMidnightToJdTdb(J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY);

const earthSeries = await loadEarthSeries();
const earthIndexed = makeIndexedEarthLookup(earthSeries, interpolateBodyState);
const earthLastS = earthIndexed.lastTdbSeconds;
{
  // gate, at every start: the indexed lookup must reproduce the production lookup exactly
  const rand = mulberry32(20261114);
  const span = earthIndexed.lastTdbSeconds - earthIndexed.firstTdbSeconds;
  const epochs = [earthIndexed.firstTdbSeconds, earthIndexed.lastTdbSeconds];
  for (let k = 0; k < 2000; k += 1) epochs.push(earthIndexed.firstTdbSeconds + rand() * span);
  for (const t of epochs) {
    const a = interpolateBodyStateSeries('earth', earthSeries, t);
    const b = earthIndexed(t);
    if (a.positionM.x !== b.positionM.x || a.positionM.y !== b.positionM.y || a.positionM.z !== b.positionM.z
      || a.velocityMps.x !== b.velocityMps.x || a.velocityMps.y !== b.velocityMps.y || a.velocityMps.z !== b.velocityMps.z) {
      throw new Error(`indexed Earth lookup differs from production at ${t}: XR3 halts`);
    }
  }
}
const earthFirstJd = J2000_TDB_JULIAN_DATE + earthIndexed.firstTdbSeconds / SECONDS_PER_DAY; // compare page: tdbSecondsToJd
const earthLastJd = J2000_TDB_JULIAN_DATE + earthLastS / SECONDS_PER_DAY;
const bodies = await loadCatalogBodies();
const tiers = loadTiers();
const absoluteKm2S2 = loadFeasibleC3Max();
const byDesignation = new Map(bodies.map((b) => [b.designation, b]));
const order = seededShuffle(bodies.map((b) => b.designation).sort(), LR2_SEED);
const mine = order.filter((_, position) => position % OF === SHARD);

const outDir = path.join(scratchRoot, 'xr3');
fs.mkdirSync(outDir, { recursive: true });
const tag = `${SHARD}of${OF}`;
const ndjsonPath = path.join(outDir, `xr3-rows-${tag}.ndjson`);
const checkpointPath = path.join(outDir, `xr3-checkpoint-${tag}.json`);

// ---- --only: spot check, no files ---------------------------------------------------------------
// (function declarations below are hoisted; module-level constants they use are defined above this
// point or before the first call)
const runOnly = () => {
  for (const des of ONLY.split(',').map((x) => x.trim()).filter(Boolean)) {
    const body = byDesignation.get(des);
    console.log(JSON.stringify(body ? measureBody(body) : { des, status: 'absent-from-catalog' }));
  }
};

// ---- resume ------------------------------------------------------------------------------------
const done = new Set();
if (!ONLY && fs.existsSync(ndjsonPath)) {
  const text = fs.readFileSync(ndjsonPath, 'utf8');
  const lines = text.split('\n');
  let validBytes = 0;
  for (const line of lines) {
    if (line.length === 0) { validBytes += 1; continue; }
    try {
      done.add(JSON.parse(line).des);
      validBytes += Buffer.byteLength(line, 'utf8') + 1;
    } catch {
      break; // a torn last line from a crash: drop it and redo that body
    }
  }
  if (validBytes < Buffer.byteLength(text, 'utf8')) fs.truncateSync(ndjsonPath, Math.min(validBytes, Buffer.byteLength(text, 'utf8')));
}
const fd = ONLY ? null : fs.openSync(ndjsonPath, 'a');

const compareParams = {
  depStartJdTdb: utcMidnightToJdTdb(COMPARE.departureStartUtc),
  depEndJdTdb: utcMidnightToJdTdb(COMPARE.departureEndUtc),
  nDep: COMPARE.nDep,
  nTof: COMPARE.nTof,
  tofMinDays: COMPARE.tofMinDays,
  tofMaxDays: COMPARE.tofMaxDays,
  M: COMPARE.M,
  thresholdMode: COMPARE.thresholdMode,
  deltaKm2S2: COMPARE.deltaKm2S2,
  absoluteKm2S2,
  bMinCells: COMPARE.bMinCells,
  earthSpanJdTdb: { firstSample: earthFirstJd, lastSample: earthLastJd },
  vehicle: LAUNCH_VEHICLES[0],
  dvBudget: {
    rendezvousMps: COMPARE.referenceRendezvousMps,
    stationkeepingMps: SPACECRAFT_STATIONKEEPING_MPS,
    marginMps: deterministicMarginMps(COMPARE.referenceRendezvousMps),
  },
};
// Production providers, exactly as app/compare/main.ts:1088-1092 wires them.
const outboundDeps = {
  getEarthStateAtTdbSeconds: (t) => interpolateBodyStateSeries('earth', earthSeries, t),
  propagateTargetStateAtTdbSeconds: (elements, t) => propagateKeplerianStateVectors(elements, t),
};
const depCellDays = (compareParams.depEndJdTdb - compareParams.depStartJdTdb) / (COMPARE.nDep - 1);
const tofCellDays = (COMPARE.tofMaxDays - COMPARE.tofMinDays) / (COMPARE.nTof - 1);

const REFUSED_STATE = Object.freeze({
  positionM: Object.freeze({ x: Number.NaN, y: Number.NaN, z: Number.NaN }),
  velocityMps: Object.freeze({ x: Number.NaN, y: Number.NaN, z: Number.NaN }),
});
// Pass-through to the production solver; a refused cell (NaN Earth position) is never solved.
const solveLambertRefusing = (r1, r2, tof, mu, M, lw) => (r2[0] !== r2[0] ? null : lambertMultiRev(r1, r2, tof, mu, M, lw));
const kernelArrivalSeconds = (depJd, tofDays) => (depJd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY + tofDays * SECONDS_PER_DAY;

/**
 * Paired return for an outbound window arriving at arrivalJd. Unedited kernel, swapped providers, run at
 * M = 0 and at M = 1 over the same grid. `computed` (and dep, tof, vArrE, afterSup) is the M = 0 minimum,
 * exactly LR2's quantity; `m1` holds the M = 1 minimum; `best` the minimum over both (exact ties to M = 0).
 */
function pairedReturn(body, boundary, arrivalJd) {
  const t1 = performance.now();
  const gridParams = {
    depStartJD: arrivalJd + RETURN_GRID.stayMinDays,
    depEndJD: arrivalJd + RETURN_GRID.stayMaxDays,
    tofMinDays: RETURN_GRID.tofMinDays,
    tofMaxDays: RETURN_GRID.tofMaxDays,
    nDep: RETURN_GRID.nDep,
    nTof: RETURN_GRID.nTof,
  };
  const deps = {
    getEarthStateAtTdbSeconds: (t) => propagateKeplerianStateVectors(body.elements, t), // asteroid at departure
    propagateTargetStateAtTdbSeconds: (_elements, t) => (t > earthLastS ? REFUSED_STATE : earthIndexed(t)), // Earth at arrival
    solveLambert: solveLambertRefusing,
  };
  // LR1's validity flag for one cell's selected branch (evaluated lazily: only for cells that would
  // lower a running minimum, so the cost is a handful of evaluations per grid)
  const asteroidKm = new Map();
  const validity = (cell) => {
    const depS = (cell.depJD - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
    let r1 = asteroidKm.get(depS);
    if (r1 === undefined) {
      const st = propagateKeplerianStateVectors(body.elements, depS);
      r1 = [st.positionM.x / 1000, st.positionM.y / 1000, st.positionM.z / 1000];
      asteroidKm.set(depS, r1);
    }
    const br = cell.branches[cell.selectedBranch];
    const o = transferOrbit(r1, br.v1, MU_KM3_S2);
    const flagged = o.q < SOLAR_RADIUS_KM && perihelionPassages(r1, br.v1, cell.tofDays * SECONDS_PER_DAY, MU_KM3_S2, o.ecc) >= 1;
    return { qKm: o.q, ecc: o.ecc, flagged: flagged ? 1 : 0 };
  };
  const scan = (grid) => {
    let refused = 0;
    let ok = 0;
    let noConv = 0;
    let unsupported = 0;
    let min = Infinity;
    let minCell = null;
    let minSup = Infinity;
    let minSupCell = null;
    let minValid = Infinity;
    let minValidCell = null;
    for (const c of grid.cells) {
      if (kernelArrivalSeconds(c.depJD, c.tofDays) > earthLastS) {
        refused += 1; // DEC-20-3
        continue;
      }
      const afterSupport = boundary !== undefined && c.depJD >= boundary.encounterJd; // DEC-20-5: departure epoch
      if (afterSupport) unsupported += 1;
      if (c.status !== 'ok') {
        noConv += 1;
        continue;
      }
      ok += 1;
      const v = c.branches[c.selectedBranch].vInfDep; // asteroid-departure |v-inf| under the swap
      if (v < min) { min = v; minCell = c; }
      if (!afterSupport && v < minSup) { minSup = v; minSupCell = c; }
      if (v < minValid && validity(c).flagged === 0) { minValid = v; minValidCell = c; }
    }
    return { refused, ok, noConv, unsupported, min, minCell, minSup, minSupCell, minValid, minValidCell };
  };
  const g0 = scan(computePorkchopGrid(body.elements, gridParams, 0, deps));
  const ms0 = Math.round(performance.now() - t1);
  const t2 = performance.now();
  const g1 = scan(computePorkchopGrid(body.elements, gridParams, 1, deps));
  const out = {
    ms: ms0, msM1: Math.round(performance.now() - t2), cells: RETURN_GRID.nDep * RETURN_GRID.nTof,
    refused: g0.refused, ok: g0.ok, noConv: g0.noConv, unsup: g0.unsupported,
    m1Ok: g1.ok, m1NoSolution: g1.noConv,
  };
  const describe = (cell) => {
    const br = cell.branches[cell.selectedBranch];
    const val = validity(cell);
    return { v: br.vInfDep, dep: cell.depJD, tof: cell.tofDays, vArrE: br.vInfArr, M: cell.M, branch: br.branch, afterSup: boundary ? (cell.depJD >= boundary.encounterJd ? 1 : 0) : 0, qKm: val.qKm, ecc: val.ecc, flagged: val.flagged };
  };
  if (g1.minCell !== null) {
    out.m1 = describe(g1.minCell);
    if (g1.minSupCell !== null) out.m1Sup = g1.minSup;
  }
  if (g0.minCell === null && g1.minCell === null) {
    out.status = g0.refused === out.cells ? 'all-return-cells-refused' : 'no-return-convergence';
    return out;
  }
  out.status = g0.minCell === null ? 'm1-only' : 'ok';
  if (g0.minCell !== null) {
    const d0 = describe(g0.minCell);
    out.computedFlagged = d0.flagged; // is LR2's M = 0 minimum itself a through-Sun arc?
    out.computed = d0.v;
    out.dep = d0.dep;
    out.tof = d0.tof;
    out.vArrE = d0.vArrE; // Earth-arrival |v-inf| (reported, not ranked)
    out.afterSup = d0.afterSup;
    if (g0.minSupCell !== null) {
      out.computedSup = g0.minSup;
      out.depSup = g0.minSupCell.depJD;
      out.tofSup = g0.minSupCell.tofDays;
    }
  }
  // minimum over M = 0 and M = 1; an exact tie stays with M = 0 (DEC-20-2 keeps AMD-2's tie rule)
  const m1Wins = g1.minCell !== null && (g0.minCell === null || g1.min < g0.min);
  out.best = m1Wins ? describe(g1.minCell) : describe(g0.minCell);
  out.m1Wins = m1Wins ? 1 : 0;
  // the same three minima over cells that are NOT flagged (beyond the dispatch; see the header)
  if (g0.minValidCell !== null) out.validM0 = g0.minValid;
  if (g1.minValidCell !== null) out.validM1 = g1.minValid;
  if (g0.minValidCell !== null || g1.minValidCell !== null) {
    const m1WinsValid = g1.minValidCell !== null && (g0.minValidCell === null || g1.minValid < g0.minValid);
    out.bestValid = describe(m1WinsValid ? g1.minValidCell : g0.minValidCell);
    out.m1WinsValid = m1WinsValid ? 1 : 0;
  }
  const supCandidates = [g0.minSupCell !== null ? g0.minSup : Infinity, g1.minSupCell !== null ? g1.minSup : Infinity];
  if (Number.isFinite(Math.min(...supCandidates))) out.bestSup = Math.min(...supCandidates);
  return out;
}

function measureBody(body) {
  const tier = tiers.get(body.designation);
  const boundary = supportBoundaryFor(tier);
  const row = {
    des: body.designation,
    tier: tier?.tier ?? null,
    cls: body.orbitClass,
    supJd: boundary ? boundary.encounterJd : null,
    status: 'ok',
  };
  const t0 = performance.now();
  const [result] = computeCompareData([{ bodyId: body.bodyId, bodyElements: body.elements }], compareParams, outboundDeps);
  row.msOut = Math.round(performance.now() - t0);
  if (!result.ok) {
    row.status = `outbound-refused:${result.reason}`;
    return row;
  }
  row.liveMinC3 = result.echo.liveMin;
  row.nComp = result.segmentation.components.length;
  row.nPractical = result.segmentation.practical.length;

  // ---- SECONDARY window (beyond the dispatch's procedure; S20_01 R3's second definition) -------
  // The cell minimizing the production sample-return dV stack over the same outbound grid. Kept
  // because S20_01 R3 found the error changes sign between the min-C3 window and this one, and the
  // DEC-20-7 interim range was drawn from both kinds. Labelled secondary everywhere.
  let stackMin = Infinity;
  let stackCell = null;
  for (const c of result.grid.cells) {
    if (c.status !== 'ok' || c.selectedBranch === null) continue;
    const br = c.branches[c.selectedBranch];
    const total = buildDeltaVStack(br.c3, br.vInfArr, 'sample-return').totalKmps;
    if (total < stackMin) { stackMin = total; stackCell = c; }
  }
  if (stackCell !== null) {
    const br = stackCell.branches[stackCell.selectedBranch];
    const arrivalJd = stackCell.depJD + stackCell.tofDays;
    row.sDep = stackCell.depJD;
    row.sTof = stackCell.tofDays;
    row.sC3 = br.c3;
    row.sVArr = br.vInfArr;
    row.sStack = stackMin;
    row.sAssumed = departureDvFromVInf(br.vInfArr);
    row.sOAfterSup = boundary ? (arrivalJd >= boundary.encounterJd ? 1 : 0) : 0;
    const ret = pairedReturn(body, boundary, arrivalJd);
    row.sRet = ret;
    if (typeof ret.computed === 'number') row.sErr = row.sAssumed - ret.computed; // M = 0 only (LR2's)
    if (ret.best) row.sErrBest = row.sAssumed - ret.best.v; // M = 0 and M = 1
    if (ret.bestValid) row.sErrBestValid = row.sAssumed - ret.bestValid.v; // unflagged cells only
  }

  // ---- PRIMARY window: the compare path's best practical window -------------------------------
  const best = result.segmentation.bestPractical;
  if (best === null) {
    row.status = 'no-practical-window';
    return row;
  }
  // Locate the argmin cell in the kernel's layout (index = depIdx * nTof + tofIdx).
  const depIdx = Math.round((best.argmin.depJd - compareParams.depStartJdTdb) / depCellDays);
  const tofIdx = Math.round((best.argmin.tofDays - COMPARE.tofMinDays) / tofCellDays);
  const cell = result.grid.cells[depIdx * COMPARE.nTof + tofIdx];
  const branch = cell && cell.selectedBranch !== null ? cell.branches[cell.selectedBranch] : undefined;
  if (!branch || branch.c3 !== best.c3 || cell.depJD !== best.argmin.depJd || cell.tofDays !== best.argmin.tofDays) {
    row.status = 'argmin-cell-mismatch'; // never expected; recorded rather than papered over
    return row;
  }
  const arrivalJd = cell.depJD + cell.tofDays; // support-boundary.ts arrivalJd()
  row.oDep = cell.depJD;
  row.oTof = cell.tofDays;
  row.oC3 = branch.c3;
  row.oVArr = branch.vInfArr;
  row.assumed = departureDvFromVInf(branch.vInfArr);
  row.oAfterSup = boundary ? (arrivalJd >= boundary.encounterJd ? 1 : 0) : 0;
  const ret = pairedReturn(body, boundary, arrivalJd);
  row.ret = ret;
  if (!ret.best) {
    row.status = ret.status;
    return row;
  }
  if (ret.status !== 'ok') row.status = ret.status; // 'm1-only': no M = 0 cell converged, an M = 1 cell did
  if (typeof ret.computed === 'number') row.err = row.assumed - ret.computed; // M = 0 only (LR2's)
  row.errBest = row.assumed - ret.best.v; // M = 0 and M = 1
  if (ret.bestValid) row.errBestValid = row.assumed - ret.bestValid.v; // unflagged cells only
  return row;
}

// ---- main loop ---------------------------------------------------------------------------------
if (ONLY) {
  runOnly();
  process.exit(0);
}
const startedAt = Date.now();
let processedThisRun = 0;
let lastCheckpoint = 0;
const writeCheckpoint = (state) => {
  writeJsonAtomic(checkpointPath, {
    shard: SHARD, of: OF, state, total: mine.length, done: done.size, processedThisRun,
    elapsedSecondsThisRun: Math.round((Date.now() - startedAt) / 1000),
    secondsPerBodyThisRun: processedThisRun ? (Date.now() - startedAt) / 1000 / processedThisRun : null,
    updatedAtUtc: new Date().toISOString(), srcV2Tree: stamp.srcV2Tree, baseCommit: stamp.head, node: process.version,
    seed: LR2_SEED, returnGrid: RETURN_GRID, compare: COMPARE, absoluteKm2S2,
  }, true);
  lastCheckpoint = Date.now();
};
writeCheckpoint('running');
let stopReason = 'complete';
for (const des of mine) {
  if (done.has(des)) continue;
  if (MAX_SECONDS > 0 && (Date.now() - startedAt) / 1000 > MAX_SECONDS) { stopReason = 'time-box'; break; }
  if (LIMIT > 0 && processedThisRun >= LIMIT) { stopReason = 'limit'; break; }
  let row;
  try {
    row = measureBody(byDesignation.get(des));
  } catch (error) {
    row = { des, tier: tiers.get(des)?.tier ?? null, cls: byDesignation.get(des)?.orbitClass ?? null, status: `error:${String(error && error.message ? error.message : error).slice(0, 160)}` };
  }
  fs.writeSync(fd, `${JSON.stringify(row)}\n`);
  done.add(des);
  processedThisRun += 1;
  if (Date.now() - lastCheckpoint > 60_000) {
    fs.fsyncSync(fd);
    writeCheckpoint('running');
  }
}
fs.fsyncSync(fd);
fs.closeSync(fd);
writeCheckpoint(stopReason === 'complete' && done.size === mine.length ? 'complete' : `stopped:${stopReason}`);
console.log(JSON.stringify({ shard: tag, state: stopReason, done: done.size, total: mine.length, processedThisRun, seconds: Math.round((Date.now() - startedAt) / 1000) }));
