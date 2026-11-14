#!/usr/bin/env node
// XR2 — physical-validity census of the OUTBOUND grid, one shard. RESUMABLE.
//
// The precompute script cannot be instrumented without editing it, so this is the dispatch's fallback:
// an independent sweep of the SAME screening grid with the production grid kernel computePorkchopGrid
// (which solves with lambert-multi-rev.ts at M = 0; the cache itself was built with izzo.ts).
//
// Per body, in catalog order (shard i takes catalog positions p with p % n == i):
//   A. SCREENING GRID - 783 departures (2026-01-01 + 7 d steps) x 55 TOF (182..1802 d, 30 d steps), the
//      grid of tools/build/precompute-lambert-screen.mjs:84-153. For every converged cell: the transfer
//      orbit's eccentricity and perihelion from the departure state (Earth position at departure, Lambert
//      v1), and the flag "perihelion below one solar radius AND the flown arc passes perihelion" (LR1's
//      definition, lib/common2.mjs). Also: which of the SHIPPED cache's cells for this body are flagged
//      (its minC3 cell and each of its bestWindows), and the kernel's own minimum C3 over the grid.
//   B. COMPARE GRID - the production computeCompareData with the compare page's arguments; the same
//      census over its 731 x 100 cells, and over the cells of the bestPractical window (the connected
//      component, 8-connectivity, of converged cells with C3 <= the resolved threshold that contains the
//      bestPractical argmin - rebuilt here by flood fill, because segmentWindows returns only summaries).
//
// Output: one NDJSON line per body in scratch, plus per-shard histograms of transfer perihelion by tier
// and by orbit class, rewritten with the checkpoint at least every 60 s.
//
// Usage: node census-shard.mjs --shard <i> --of <n> [--limit <bodies>] [--max-seconds <s>]
import fs from 'node:fs';
import path from 'node:path';
import {
  AU_KM, FILES, Q_HIST, SOLAR_RADIUS_KM, importV2, loadCache, loadCatalogBodies, loadEarthSeries, loadTiers,
  perihelionPassages, qBin, readStamp, repoRoot, scratchRoot, transferOrbit, writeJsonAtomic,
} from '../lib/common2.mjs';

console.debug = () => {};
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback;
};
const SHARD = Number(arg('shard', '0'));
const OF = Number(arg('of', '1'));
const LIMIT = Number(arg('limit', '0'));
const MAX_SECONDS = Number(arg('max-seconds', '0'));

readStamp();
const { computePorkchopGrid } = await importV2('porkchop/grid-compute.js');
const { computeCompareData } = await importV2('porkchop/compare-data.js');
const { LAUNCH_VEHICLES, SPACECRAFT_STATIONKEEPING_MPS, deterministicMarginMps } = await importV2('porkchop/launch-vehicles.js');
const { propagateKeplerianStateVectors, GM_SUN_M3_S2 } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');
const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await importV2('core/units/utc-to-tdb.js');
const MU = GM_SUN_M3_S2 / 1000 ** 3;

// Screening grid, read from the precompute script (constants at :84-90, loops at :141-153).
const SCREEN = { startUtc: '2026-01-01', endUtc: '2040-12-31', depStepDays: 7, tofMinDays: 182, tofMaxDays: 1826, tofStepDays: 30 };
const screenStartS = utcStringToTdbSeconds(SCREEN.startUtc);
const screenEndS = utcStringToTdbSeconds(SCREEN.endUtc);
const screenDepS = [];
for (let t = screenStartS; t <= screenEndS; t += SCREEN.depStepDays * SECONDS_PER_DAY) screenDepS.push(t);
const screenTofDays = [];
for (let d = SCREEN.tofMinDays; d <= SCREEN.tofMaxDays; d += SCREEN.tofStepDays) screenTofDays.push(d);
const NS_DEP = screenDepS.length; // 783
const NS_TOF = screenTofDays.length; // 55
// COPY of tdbToUtcDateString in the precompute script (:111-114): the cache's launchDate strings.
const tdbToUtcDateString = (tdbSeconds) => new Date((tdbSeconds + 946_728_000 - TDB_MINUS_UTC_SECONDS) * 1000).toISOString().slice(0, 10);
const screenDateIndex = new Map(screenDepS.map((t, i) => [tdbToUtcDateString(t), i]));
const screenTofIndex = new Map(screenTofDays.map((d, j) => [d, j]));
const screenGrid = {
  depStartJD: J2000_TDB_JULIAN_DATE + screenStartS / SECONDS_PER_DAY,
  depEndJD: J2000_TDB_JULIAN_DATE + screenStartS / SECONDS_PER_DAY + SCREEN.depStepDays * (NS_DEP - 1),
  tofMinDays: SCREEN.tofMinDays,
  tofMaxDays: screenTofDays[NS_TOF - 1],
  nDep: NS_DEP,
  nTof: NS_TOF,
};

// Compare page arguments (src/v2/app/compare/main.ts:114-123, 142, 1062-1090), as LR2 recorded them.
const utcMidnightToJdTdb = (d) => J2000_TDB_JULIAN_DATE + (Date.parse(`${d}T00:00:00Z`) / 1000 - 946_728_000 + 69.184) / SECONDS_PER_DAY;
const earthSeries = await loadEarthSeries();
const earthAt = (t) => interpolateBodyStateSeries('earth', earthSeries, t); // production lookup (departure epochs only: cheap)
const shipped = loadCache(path.join(repoRoot, FILES.cacheShipped));
const shippedByDes = new Map(shipped.bodies.map((b) => [b.designation, b]));
const compareParams = {
  depStartJdTdb: utcMidnightToJdTdb('2026-01-01'), depEndJdTdb: utcMidnightToJdTdb('2040-01-01'), nDep: 731, nTof: 100,
  tofMinDays: 182.5, tofMaxDays: 1826.25, M: 0, thresholdMode: 'relative', deltaKm2S2: 5,
  absoluteKm2S2: shipped.metadata.feasibleC3MaxKm2S2, bMinCells: 2,
  earthSpanJdTdb: {
    firstSample: J2000_TDB_JULIAN_DATE + earthSeries[0].tdbSeconds / SECONDS_PER_DAY,
    lastSample: J2000_TDB_JULIAN_DATE + earthSeries[earthSeries.length - 1].tdbSeconds / SECONDS_PER_DAY,
  },
  vehicle: LAUNCH_VEHICLES[0],
  dvBudget: { rendezvousMps: 1000, stationkeepingMps: SPACECRAFT_STATIONKEEPING_MPS, marginMps: deterministicMarginMps(1000) },
};
const tiers = loadTiers();
const bodies = await loadCatalogBodies();
const mine = bodies.map((b, p) => [b, p]).filter(([, p]) => p % OF === SHARD);

const outDir = path.join(scratchRoot, 'xr2');
fs.mkdirSync(outDir, { recursive: true });
const tag = `${SHARD}of${OF}`;
const rowsPath = path.join(outDir, `outbound-${tag}.ndjson`);
const statePath = path.join(outDir, `outbound-state-${tag}.json`);

// ---- resume: rows are the durable record; histograms are saved with the same body count ----------
const newHist = () => new Array(Q_HIST.bins).fill(0);
let state = { histScreen: {}, histCompare: {}, bodiesInHist: 0 };
const done = new Set();
if (fs.existsSync(rowsPath) && fs.existsSync(statePath)) {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8')).hist;
  const lines = fs.readFileSync(rowsPath, 'utf8').split('\n').filter(Boolean);
  // keep exactly the rows the saved histograms cover; anything after the last checkpoint is redone
  const kept = lines.slice(0, state.bodiesInHist);
  fs.writeFileSync(rowsPath, kept.length ? `${kept.join('\n')}\n` : '');
  for (const line of kept) done.add(JSON.parse(line).des);
} else {
  fs.writeFileSync(rowsPath, '');
}
const fd = fs.openSync(rowsPath, 'a');
const histFor = (group, key) => { if (!group[key]) group[key] = newHist(); return group[key]; };

function census(cellIter, tierKey, classKey, histGroup) {
  // cellIter yields [r1, v1, tofSeconds, cell] for converged cells
  const hTier = histFor(histGroup, `tier:${tierKey}`);
  const hClass = histFor(histGroup, `class:${classKey}`);
  let converged = 0;
  let below01 = 0;
  let below001 = 0;
  let belowSun = 0;
  let flagged = 0;
  let hyperbolic = 0;
  let minQ = Infinity;
  const flaggedCells = [];
  for (const [r1, v1, tofS, cell] of cellIter) {
    converged += 1;
    const o = transferOrbit(r1, v1, MU);
    const b = qBin(o.q);
    hTier[b] += 1;
    hClass[b] += 1;
    if (o.ecc >= 1) hyperbolic += 1;
    if (o.q < minQ) minQ = o.q;
    if (o.q < 0.1 * AU_KM) {
      below01 += 1;
      if (o.q < 0.01 * AU_KM) below001 += 1;
      if (o.q < SOLAR_RADIUS_KM) {
        belowSun += 1;
        if (perihelionPassages(r1, v1, tofS, MU, o.ecc) >= 1) {
          flagged += 1;
          flaggedCells.push(cell);
        }
      }
    }
  }
  return { converged, below01, below001, belowSun, flagged, hyperbolic, minQ, flaggedCells };
}
const km = (o) => [o.x / 1000, o.y / 1000, o.z / 1000];

function measure(body) {
  const tier = tiers.get(body.designation)?.tier ?? 'null';
  const row = { des: body.designation, tier, cls: body.orbitClass };
  // ---- A. screening grid ------------------------------------------------------------------------
  const earthR = new Map();
  let grid;
  try {
    grid = computePorkchopGrid(body.elements, screenGrid, 0, {
      getEarthStateAtTdbSeconds: (t) => { const s = earthAt(t); earthR.set(t, km(s.positionM)); return s; },
      propagateTargetStateAtTdbSeconds: (elements, t) => propagateKeplerianStateVectors(elements, t),
    });
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    row.status = 'not-propagatable';
    return row;
  }
  const depSOf = (depJD) => (depJD - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY; // the kernel's own conversion
  let kMin = Infinity;
  let kMinIdx = -1;
  const cells = grid.cells;
  const iterScreen = function* iter() {
    for (let idx = 0; idx < cells.length; idx += 1) {
      const c = cells[idx];
      if (c.status !== 'ok') continue;
      const br = c.branches[c.selectedBranch];
      if (br.c3 < kMin) { kMin = br.c3; kMinIdx = idx; }
      yield [earthR.get(depSOf(c.depJD)), br.v1, c.tofDays * SECONDS_PER_DAY, idx];
    }
  };
  const a = census(iterScreen(), tier, body.orbitClass, state.histScreen);
  const flaggedSet = new Set(a.flaggedCells);
  const cellIndexOf = (launchDate, tofDays) => {
    const i = screenDateIndex.get(launchDate);
    const j = screenTofIndex.get(tofDays);
    return i === undefined || j === undefined ? -1 : i * NS_TOF + j;
  };
  const sh = shippedByDes.get(body.designation);
  const shown = { minC3CellFlagged: 0, bestWindowsFlagged: [], unmatched: 0 };
  if (sh && sh.minC3Date !== null) {
    const idx = cellIndexOf(sh.minC3Date, sh.minC3TofDays);
    if (idx < 0) shown.unmatched += 1;
    else if (flaggedSet.has(idx)) shown.minC3CellFlagged = 1;
    sh.bestWindows.forEach((w, k) => {
      const wi = cellIndexOf(w.launchDate, w.tofDays);
      if (wi < 0) shown.unmatched += 1;
      else if (flaggedSet.has(wi)) shown.bestWindowsFlagged.push(k);
    });
  }
  row.scr = {
    cells: cells.length, converged: a.converged, below01Au: a.below01, below001Au: a.below001, belowSun: a.belowSun,
    flagged: a.flagged, hyperbolic: a.hyperbolic, minQKm: Number.isFinite(a.minQ) ? a.minQ : null,
    kernelMinC3: Number.isFinite(kMin) ? kMin : null,
    kernelMinDate: kMinIdx >= 0 ? tdbToUtcDateString(screenDepS[Math.floor(kMinIdx / NS_TOF)]) : null,
    kernelMinTof: kMinIdx >= 0 ? screenTofDays[kMinIdx % NS_TOF] : null,
    shippedMinC3CellFlagged: shown.minC3CellFlagged, shippedBestWindowsFlagged: shown.bestWindowsFlagged, shippedCellsUnmatched: shown.unmatched,
  };

  // ---- B. compare grid and its bestPractical window ----------------------------------------------
  const [cmp] = computeCompareData([{ bodyId: body.bodyId, bodyElements: body.elements }], compareParams, {
    getEarthStateAtTdbSeconds: earthAt,
    propagateTargetStateAtTdbSeconds: (elements, t) => propagateKeplerianStateVectors(elements, t),
  });
  if (!cmp.ok) { row.cmp = { status: `refused:${cmp.reason}` }; return row; }
  const cc = cmp.grid.cells; // index = depIdx * nTof + tofIdx
  const nDep = compareParams.nDep;
  const nTof = compareParams.nTof;
  const earthByCol = new Array(nDep);
  for (let i = 0; i < nDep; i += 1) earthByCol[i] = km(earthAt(depSOf(cc[i * nTof].depJD)).positionM);
  const iterCompare = function* iter() {
    for (let idx = 0; idx < cc.length; idx += 1) {
      const c = cc[idx];
      if (c.status !== 'ok') continue;
      yield [earthByCol[Math.floor(idx / nTof)], c.branches[c.selectedBranch].v1, c.tofDays * SECONDS_PER_DAY, idx];
    }
  };
  const b = census(iterCompare(), tier, body.orbitClass, state.histCompare);
  row.cmp = { status: 'ok', cells: cc.length, converged: b.converged, below01Au: b.below01, below001Au: b.below001, belowSun: b.belowSun, flagged: b.flagged, hyperbolic: b.hyperbolic, minQKm: Number.isFinite(b.minQ) ? b.minQ : null };
  const best = cmp.segmentation.bestPractical;
  if (best === null) { row.cmp.window = 'no-practical-window'; return row; }
  const depCell = (compareParams.depEndJdTdb - compareParams.depStartJdTdb) / (nDep - 1);
  const tofCell = (compareParams.tofMaxDays - compareParams.tofMinDays) / (nTof - 1);
  const di = Math.round((best.argmin.depJd - compareParams.depStartJdTdb) / depCell);
  const ti = Math.round((best.argmin.tofDays - compareParams.tofMinDays) / tofCell);
  const T = cmp.segmentation.threshold.valueKm2S2;
  const member = (i, j) => {
    const c = cc[i * nTof + j];
    if (c.status !== 'ok') return false;
    const v = c.branches[c.selectedBranch];
    return v.converged && Number.isFinite(v.c3) && v.c3 <= T;
  };
  const seen = new Uint8Array(cc.length);
  const stack = [[di, ti]];
  seen[di * nTof + ti] = 1;
  const flaggedCmp = new Set(b.flaggedCells);
  let windowCells = 0;
  let windowFlagged = 0;
  let windowBelowSun = 0;
  let windowMinQ = Infinity;
  while (stack.length) {
    const [i, j] = stack.pop();
    const idx = i * nTof + j;
    windowCells += 1;
    if (flaggedCmp.has(idx)) windowFlagged += 1;
    const o = transferOrbit(earthByCol[i], cc[idx].branches[cc[idx].selectedBranch].v1, MU);
    if (o.q < SOLAR_RADIUS_KM) windowBelowSun += 1;
    if (o.q < windowMinQ) windowMinQ = o.q;
    for (let dI = -1; dI <= 1; dI += 1) {
      for (let dJ = -1; dJ <= 1; dJ += 1) {
        if (dI === 0 && dJ === 0) continue;
        const ni = i + dI;
        const nj = j + dJ;
        if (ni < 0 || ni >= nDep || nj < 0 || nj >= nTof) continue;
        const nIdx = ni * nTof + nj;
        if (seen[nIdx] || !member(ni, nj)) continue;
        seen[nIdx] = 1;
        stack.push([ni, nj]);
      }
    }
  }
  const argminIdx = di * nTof + ti;
  const argminOrbit = transferOrbit(earthByCol[di], cc[argminIdx].branches[cc[argminIdx].selectedBranch].v1, MU);
  row.cmp.window = {
    c3: best.c3, depJd: best.argmin.depJd, tofDays: best.argmin.tofDays, cells: windowCells, flagged: windowFlagged,
    belowSun: windowBelowSun, minQKm: windowMinQ, argminFlagged: flaggedCmp.has(argminIdx) ? 1 : 0,
    argminQKm: argminOrbit.q, argminEcc: argminOrbit.ecc,
  };
  return row;
}

const started = Date.now();
let processed = 0;
let lastSave = Date.now();
let rowsSinceSave = [];
const save = (stateName) => {
  // rows first (durable), then the histograms that cover exactly those rows
  if (rowsSinceSave.length) { fs.writeSync(fd, rowsSinceSave.join('')); fs.fsyncSync(fd); rowsSinceSave = []; }
  state.bodiesInHist = done.size;
  writeJsonAtomic(statePath, {
    shard: SHARD, of: OF, state: stateName, total: mine.length, done: done.size, processedThisRun: processed,
    secondsThisRun: Math.round((Date.now() - started) / 1000), updatedAtUtc: new Date().toISOString(), node: process.version,
    screenGrid: { ...SCREEN, nDep: NS_DEP, nTof: NS_TOF }, qHist: Q_HIST, constants: { AU_KM, SOLAR_RADIUS_KM, MU },
    hist: state,
  });
  lastSave = Date.now();
};
let stop = 'complete';
for (const [body] of mine) {
  if (done.has(body.designation)) continue;
  if (LIMIT > 0 && processed >= LIMIT) { stop = 'limit'; break; }
  if (MAX_SECONDS > 0 && (Date.now() - started) / 1000 > MAX_SECONDS) { stop = 'time-box'; break; }
  const t0 = Date.now();
  const row = measure(body);
  row.ms = Date.now() - t0;
  rowsSinceSave.push(`${JSON.stringify(row)}\n`);
  done.add(body.designation);
  processed += 1;
  if (Date.now() - lastSave > 60_000) save('running');
}
save(stop === 'complete' && done.size === mine.length ? 'complete' : `stopped:${stop}`);
fs.closeSync(fd);
console.log(JSON.stringify({ shard: tag, state: stop, done: done.size, total: mine.length, processed, seconds: Math.round((Date.now() - started) / 1000) }));
