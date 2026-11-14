#!/usr/bin/env node
// XR0 — independent cross-check of LR2's primary symmetric-return measurement.
//
// Deliberately UNLIKE LR2's pipeline (tools/slice20-research/longrun/lr2-symmetric/):
//   - imports nothing from tools/slice20-research/longrun/ (no run-shard.mjs, no summarize.mjs, no
//     lib/common.mjs, no indexed Earth lookup);
//   - Earth is read with the PRODUCTION linear-scan lookup (interpolateBodyStateSeries), slow on purpose;
//   - LR2 ran the grid kernel computePorkchopGrid with swapped providers and an injected solver wrapper.
//     This script never calls computePorkchopGrid or computeCompareData. It loops over the cells itself
//     and calls the solver lambertMultiRev directly, for the outbound grid and for the return grid;
//   - LR2 refused a cell by handing the kernel a NaN Earth position. This script tests the arrival epoch
//     and skips the cell;
//   - no shards, no shuffle: the first 500 bodies in catalog order, plus every body named in LR2's
//     extremes tables, plus the three S20_01 R3 bodies used as the gate.
// What it shares with LR2, because these ARE the definitions being measured: the production solver,
// propagator, Earth interpolation and segmentWindows; the compare page's grid constants; DEC-20-2's
// pairing window; LR2's stated return-grid resolution (723 x 100) - the minimum over a grid depends on
// the grid, so a different resolution would measure discretisation, not the pipeline.
//
//   node crosscheck.mjs run      [--limit n]     compute (resumable; one NDJSON line per body in scratch)
//   node crosscheck.mjs report                   join with LR2's committed shards, write the evidence
//
// Scratch: env LONGRUN2_SCRATCH (required). Nothing is written inside the repo by `run`.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..', '..');
const scratch = process.env.LONGRUN2_SCRATCH;
if (!scratch) throw new Error('set LONGRUN2_SCRATCH to a directory outside the repo');
const workDir = path.join(scratch, 'xr0');
const buildDir = path.join(workDir, 'build');
const rowsPath = path.join(workDir, 'rows.ndjson');
const checkpointPath = path.join(workDir, 'checkpoint.json');
const command = process.argv[2];
const argValue = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback;
};

// ---- definitions, each with where it was read ---------------------------------------------------
// Compare page grid: src/v2/app/compare/main.ts:114-123 and :1062-1075.
const COMPARE = { startUtc: '2026-01-01', endUtc: '2040-01-01', nDep: 731, nTof: 100, tofMinDays: 182.5, tofMaxDays: 1826.25 };
// DEC-17-8 (segment-windows.ts header): relative threshold, delta 5 km2/s2, B_min 2 cells, conn8.
const SEGMENT = { thresholdMode: 'relative', deltaKm2S2: 5, absoluteKm2S2: 25, connectivity: 8, bMinCells: 2 };
// DEC-20-2 (src/v2/SLICE_20_FOUNDING.md): t_d in [t_a + S_min, t_a + S_max], S_min = 8 d, S_max = 730.5 d,
// TOF 182.5-1826.25 d, objective = minimum asteroid-departure |v_inf|. Column and row counts are LR2's
// (lr2-symmetric/README.md: 723 departure columns, 100 TOF values, M = 0).
const PAIRING = { stayMinDays: 8, stayMaxDays: 730.5, nDep: 723, nTof: 100, tofMinDays: 182.5, tofMaxDays: 1826.25 };
// Time convention of the compare page (app/compare/main.ts:95-108): TDB - UTC = 69.184 s, J2000 TDB JD 2451545.0.
const J2000_JD = 2451545.0;
const DAY_S = 86400;
const utcMidnightToJdTdb = (isoDate) => J2000_JD + (Date.parse(`${isoDate}T00:00:00Z`) / 1000 - 946_728_000 + 69.184) / DAY_S;
const GATE = [ // S20_01-REPORT.md R3, min-C3 rows, M = 0 column (km/s, three printed decimals)
  { des: '433', assumed: 6.905, computed: 3.034 },
  { des: '99942', assumed: 5.841, computed: 1.092 },
  { des: '2000 SG344', assumed: 1.389, computed: 0.148 },
];

function compile() {
  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.mkdirSync(buildDir, { recursive: true });
  const entries = [
    'core/lambert/lambert-multi-rev.ts', 'core/propagators/keplerian.ts', 'core/interpolators/hermite.ts',
    'boundary/slice9-nea-catalog.ts', 'boundary/horizons.ts', 'porkchop/segment-windows.ts', 'porkchop/delta-v.ts',
  ];
  const tsc = spawnSync(process.execPath, [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '--pretty', 'false', '--outDir', buildDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'), '--module', 'NodeNext', '--target', 'ES2020',
    '--moduleResolution', 'NodeNext', '--isolatedModules', 'true', '--skipLibCheck', 'true',
    ...entries.map((e) => path.join(repoRoot, 'src', 'v2', e)),
  ], { cwd: repoRoot, encoding: 'utf8' });
  if (tsc.status !== 0) throw new Error(`tsc failed: ${tsc.stdout}${tsc.stderr}`);
}
const load = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);

async function run() {
  fs.mkdirSync(workDir, { recursive: true });
  compile();
  console.debug = () => {};
  const { lambertMultiRev } = await load('core/lambert/lambert-multi-rev.js');
  const { propagateKeplerianStateVectors, GM_SUN_M3_S2 } = await load('core/propagators/keplerian.js');
  const { interpolateBodyStateSeries } = await load('core/interpolators/hermite.js');
  const { ingestSlice9Fixture } = await load('boundary/slice9-nea-catalog.js');
  const { ingestSlice2Fixture } = await load('boundary/horizons.js');
  const { segmentWindows } = await load('porkchop/segment-windows.js');
  const { departureDvFromVInf } = await load('porkchop/delta-v.js');
  const MU = GM_SUN_M3_S2 / 1000 ** 3; // km^3/s^2

  const earth = ingestSlice2Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'))).earth.map((s) => s.state);
  const earthEndS = earth[earth.length - 1].tdbSeconds; // DEC-20-3: last Earth sample
  const earthAt = (t) => interpolateBodyStateSeries('earth', earth, t); // production linear scan
  const catalog = Object.values(ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'))).asteroids);
  const byDes = new Map(catalog.map((b) => [b.designation, b]));

  // body list: gate bodies, first 500 in catalog order, every body in LR2's extremes tables
  const lr2Summary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools/slice20-research/longrun/lr2-symmetric/lr2-summary.json'), 'utf8'));
  const extremes = [...new Set(Object.values(lr2Summary.extremes).flat().map((x) => x.des))];
  const list = [];
  const seen = new Set();
  const push = (des, why) => { if (!seen.has(des) && byDes.has(des)) { seen.add(des); list.push({ des, why }); } };
  for (const g of GATE) push(g.des, 'gate');
  catalog.slice(0, 500).forEach((b) => push(b.designation, 'first-500'));
  for (const des of extremes) push(des, 'lr2-extreme');
  const limit = Number(argValue('limit', '0'));

  const km = (o) => [o.x / 1000, o.y / 1000, o.z / 1000];
  const outStartJd = utcMidnightToJdTdb(COMPARE.startUtc);
  const outEndJd = utcMidnightToJdTdb(COMPARE.endUtc);
  const outStep = (outEndJd - outStartJd) / (COMPARE.nDep - 1);
  const tofStep = (COMPARE.tofMaxDays - COMPARE.tofMinDays) / (COMPARE.nTof - 1);

  function measure(body) {
    const row = { des: body.designation, status: 'ok' };
    // ---- outbound grid, own loop --------------------------------------------------------------
    const nDep = COMPARE.nDep;
    const nTof = COMPARE.nTof;
    const cells = new Array(nDep * nTof); // segment-windows layout: index = depIdx + nDep * tofIdx
    const vArr = new Float64Array(nDep * nTof).fill(Number.NaN);
    const c3s = new Float64Array(nDep * nTof).fill(Number.NaN);
    try {
      for (let i = 0; i < nDep; i += 1) {
        const depJd = outStartJd + outStep * i;
        const depS = (depJd - J2000_JD) * DAY_S;
        const e = earthAt(depS);
        const r1 = km(e.positionM);
        const vE = km(e.velocityMps);
        for (let j = 0; j < nTof; j += 1) {
          const tofDays = COMPARE.tofMinDays + tofStep * j;
          const tofS = tofDays * DAY_S;
          const a = propagateKeplerianStateVectors(body.elements, depS + tofS);
          const sol = lambertMultiRev(r1, km(a.positionM), tofS, MU, 0, true);
          const idx = i + nDep * j;
          const br = sol === null ? null : sol.branches.find((b) => b.converged);
          if (!br) { cells[idx] = { c3: null, converged: false }; continue; }
          const vA = km(a.velocityMps);
          const vInfDep = Math.hypot(br.v1[0] - vE[0], br.v1[1] - vE[1], br.v1[2] - vE[2]);
          vArr[idx] = Math.hypot(br.v2[0] - vA[0], br.v2[1] - vA[1], br.v2[2] - vA[2]);
          c3s[idx] = vInfDep * vInfDep;
          cells[idx] = { c3: c3s[idx], converged: true };
        }
      }
    } catch (error) {
      if (error instanceof RangeError) { row.status = 'not-propagatable'; return row; }
      throw error;
    }
    const seg = segmentWindows(
      { nDep, nTof, depStartJd: outStartJd, depCellDays: outStep, tofMinDays: COMPARE.tofMinDays, tofCellDays: tofStep, cells },
      SEGMENT,
    );
    if (seg.bestPractical === null) { row.status = 'no-practical-window'; return row; }
    const di = Math.round((seg.bestPractical.argmin.depJd - outStartJd) / outStep);
    const ti = Math.round((seg.bestPractical.argmin.tofDays - COMPARE.tofMinDays) / tofStep);
    const idx = di + nDep * ti;
    if (c3s[idx] !== seg.bestPractical.c3) { row.status = 'argmin-not-located'; return row; }
    row.outDepJd = outStartJd + outStep * di;
    row.outTofDays = COMPARE.tofMinDays + tofStep * ti;
    row.outC3 = c3s[idx];
    row.assumed = departureDvFromVInf(vArr[idx]); // what the symmetric assumption charges (delta-v.ts:32-34)

    // ---- paired return, own loop, solver called directly ---------------------------------------
    const arrivalJd = row.outDepJd + row.outTofDays;
    const retStart = arrivalJd + PAIRING.stayMinDays;
    const retEnd = arrivalJd + PAIRING.stayMaxDays;
    const retStep = (retEnd - retStart) / (PAIRING.nDep - 1);
    const retTofStep = (PAIRING.tofMaxDays - PAIRING.tofMinDays) / (PAIRING.nTof - 1);
    let refused = 0;
    let noSolution = 0;
    let solved = 0;
    let best = Infinity;
    let bestDep = null;
    let bestTof = null;
    for (let i = 0; i < PAIRING.nDep; i += 1) {
      const depJd = retStart + retStep * i;
      const depS = (depJd - J2000_JD) * DAY_S;
      let asteroid = null;
      for (let j = 0; j < PAIRING.nTof; j += 1) {
        const tofDays = PAIRING.tofMinDays + retTofStep * j;
        const tofS = tofDays * DAY_S;
        const arrS = depS + tofS;
        if (arrS > earthEndS) { refused += 1; continue; } // DEC-20-3: refused, never extrapolated
        if (asteroid === null) {
          const s = propagateKeplerianStateVectors(body.elements, depS);
          asteroid = { r: km(s.positionM), v: km(s.velocityMps) };
        }
        const sol = lambertMultiRev(asteroid.r, km(earthAt(arrS).positionM), tofS, MU, 0, true);
        const br = sol === null ? null : sol.branches.find((b) => b.converged);
        if (!br) { noSolution += 1; continue; }
        solved += 1;
        const v = Math.hypot(br.v1[0] - asteroid.v[0], br.v1[1] - asteroid.v[1], br.v1[2] - asteroid.v[2]);
        if (v < best) { best = v; bestDep = depJd; bestTof = tofDays; }
      }
    }
    row.retCells = PAIRING.nDep * PAIRING.nTof;
    row.retRefused = refused;
    row.retSolved = solved;
    row.retNoSolution = noSolution;
    if (bestDep === null) { row.status = refused === row.retCells ? 'all-return-cells-refused' : 'no-return-convergence'; return row; }
    row.computed = best;
    row.retDepJd = bestDep;
    row.retTofDays = bestTof;
    row.error = row.assumed - best;
    return row;
  }

  // resume
  const done = new Map();
  if (fs.existsSync(rowsPath)) {
    for (const line of fs.readFileSync(rowsPath, 'utf8').split('\n')) {
      if (!line) continue;
      try { const r = JSON.parse(line); done.set(r.des, r); } catch { /* torn last line: redo */ }
    }
    fs.writeFileSync(rowsPath, [...done.values()].map((r) => JSON.stringify(r)).join('\n') + (done.size ? '\n' : ''));
  }
  const fd = fs.openSync(rowsPath, 'a');
  const started = Date.now();
  let processed = 0;
  let lastCheckpoint = 0;
  const checkpoint = (state) => {
    fs.writeFileSync(`${checkpointPath}.tmp`, `${JSON.stringify({ state, total: list.length, done: done.size, processedThisRun: processed, secondsThisRun: Math.round((Date.now() - started) / 1000), updatedAtUtc: new Date().toISOString(), node: process.version }, null, 2)}\n`);
    fs.renameSync(`${checkpointPath}.tmp`, checkpointPath);
    lastCheckpoint = Date.now();
  };
  checkpoint('running');
  for (const item of list) {
    if (done.has(item.des)) continue;
    if (limit > 0 && processed >= limit) break;
    const t0 = Date.now();
    const row = measure(byDes.get(item.des));
    row.why = item.why;
    row.ms = Date.now() - t0;
    fs.writeSync(fd, `${JSON.stringify(row)}\n`);
    done.set(row.des, row);
    processed += 1;
    if (item.why === 'gate') {
      const g = GATE.find((x) => x.des === row.des);
      const ok = row.status === 'ok' && Math.abs(row.assumed - g.assumed) < 0.0005 && Math.abs(row.computed - g.computed) < 0.0005;
      console.log(`gate ${row.des}: assumed ${row.assumed?.toFixed(4)} (S20_01 ${g.assumed}), computed ${row.computed?.toFixed(4)} (S20_01 ${g.computed}) -> ${ok ? 'REPRODUCED' : 'NOT REPRODUCED'} [${row.ms} ms]`);
      if (!ok) { fs.closeSync(fd); checkpoint('halted:gate'); console.log('GATE FAILED: XR0 halts'); process.exit(3); }
    }
    if (Date.now() - lastCheckpoint > 60_000) { fs.fsyncSync(fd); checkpoint('running'); }
  }
  fs.closeSync(fd);
  checkpoint(done.size === list.length ? 'complete' : 'stopped');
  console.log(JSON.stringify({ state: done.size === list.length ? 'complete' : 'stopped', done: done.size, total: list.length, seconds: Math.round((Date.now() - started) / 1000) }));
}

function report() {
  const rows = fs.readFileSync(rowsPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const cp = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  const lr2Dir = path.join(repoRoot, 'tools/slice20-research/longrun/lr2-symmetric');
  const lr2 = new Map();
  const lr2Files = fs.readdirSync(lr2Dir).filter((f) => /^lr2-symmetric-\d+of\d+\.json$/.test(f)).sort();
  for (const f of lr2Files) {
    const shard = JSON.parse(fs.readFileSync(path.join(lr2Dir, f), 'utf8'));
    const col = Object.fromEntries(shard.columns.map((c, i) => [c, i]));
    for (const r of shard.rows) lr2.set(r[col.des], Object.fromEntries(shard.columns.map((c, i) => [c, r[i]])));
  }
  // optional: LR2's full-precision NDJSON, if this host still has it in the first run's scratch (NOT committed evidence)
  const fullDir = argValue('lr2-full', '');
  const full = new Map();
  if (fullDir && fs.existsSync(fullDir)) {
    for (const f of fs.readdirSync(fullDir).filter((x) => /^rows-\d+of\d+\.ndjson$/.test(x))) {
      for (const line of fs.readFileSync(path.join(fullDir, f), 'utf8').split('\n')) {
        if (!line) continue;
        try { const r = JSON.parse(line); full.set(r.des, r); } catch { /* ignore */ }
      }
    }
  }
  const r6 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : x ?? null); // LR2's committed rounding
  const FIELDS = [ // [name, xr0 value, lr2 committed column], in the order "first field that differs" is reported
    ['status', (x) => x.status, 'status'],
    ['window: outbound departure JD', (x) => r6(x.outDepJd), 'outDepJdTdb'],
    ['window: outbound TOF days', (x) => r6(x.outTofDays), 'outTofDays'],
    ['window: outbound C3', (x) => r6(x.outC3), 'outC3'],
    ['assumed', (x) => r6(x.assumed), 'assumedKmS'],
    ['refused count', (x) => x.retRefused ?? null, 'retRefused'],
    ['computed', (x) => r6(x.computed), 'computedKmS'],
    ['return departure JD', (x) => r6(x.retDepJd), 'retDepJdTdb'],
    ['return TOF days', (x) => r6(x.retTofDays), 'retTofDays'],
    ['error', (x) => r6(x.error), 'errorKmS'],
  ];
  const compared = [];
  const missing = [];
  for (const x of rows) {
    const y = lr2.get(x.des);
    if (!y) { missing.push(x.des); continue; }
    let firstDiff = null;
    const diffs = [];
    for (const [name, pick, column] of FIELDS) {
      const a = pick(x);
      const b = y[column] ?? null;
      if (a !== b) { diffs.push({ field: name, xr0: a, lr2: b }); if (!firstDiff) firstDiff = name; }
    }
    const f = full.get(x.des);
    const fullDelta = f && typeof x.error === 'number' && typeof f.err === 'number' ? {
      dError: Math.abs(x.error - f.err), dAssumed: Math.abs(x.assumed - f.assumed), dComputed: Math.abs(x.computed - f.ret.computed),
      bitIdentical: x.error === f.err && x.assumed === f.assumed && x.computed === f.ret.computed && x.outDepJd === f.oDep && x.outTofDays === f.oTof && x.outC3 === f.oC3,
    } : null;
    compared.push({
      des: x.des, why: x.why, status: x.status, agree: diffs.length === 0, firstDiff, diffs,
      xr0: { outDepJd: r6(x.outDepJd), outTofDays: r6(x.outTofDays), outC3: r6(x.outC3), assumed: r6(x.assumed), computed: r6(x.computed), retRefused: x.retRefused ?? null, error: r6(x.error) },
      lr2: { outDepJd: y.outDepJdTdb, outTofDays: y.outTofDays, outC3: y.outC3, assumed: y.assumedKmS, computed: y.computedKmS, retRefused: y.retRefused, error: y.errorKmS },
      dErrorCommitted: typeof x.error === 'number' && typeof y.errorKmS === 'number' ? Math.abs(r6(x.error) - y.errorKmS) : null,
      fullPrecision: fullDelta, ms: x.ms,
    });
  }
  const agree = compared.filter((c) => c.agree);
  const differ = compared.filter((c) => !c.agree);
  const q = (arr, p) => { if (!arr.length) return null; const s = arr.slice().sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos); const hi = Math.ceil(pos); return s[lo] + (s[hi] - s[lo]) * (pos - lo); };
  const dErr = compared.map((c) => c.dErrorCommitted).filter((v) => v !== null);
  const fullRows = compared.filter((c) => c.fullPrecision);
  const gateRows = rows.filter((r) => r.why === 'gate').map((r) => { const g = GATE.find((x) => x.des === r.des); return { des: r.des, assumed: r.assumed, computed: r.computed, s2001Assumed: g.assumed, s2001Computed: g.computed, reproduced: Math.abs(r.assumed - g.assumed) < 0.0005 && Math.abs(r.computed - g.computed) < 0.0005 }; });
  const validates = differ.length === 0 && missing.length === 0 && compared.length > 0;
  const summary = {
    schema: 'aster-s20-longrun2-xr0/1',
    generatedAtUtc: new Date().toISOString(),
    state: cp.state === 'complete' ? 'COMPLETE' : `PARTIAL: ${cp.done} of ${cp.total}`,
    node: cp.node,
    bodiesComputed: rows.length,
    bodiesByReason: rows.reduce((acc, r) => ({ ...acc, [r.why]: (acc[r.why] ?? 0) + 1 }), {}),
    statusCounts: rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {}),
    lr2ShardsRead: lr2Files,
    compared: compared.length,
    notInLr2: missing,
    agreeAtCommittedPrecision: agree.length,
    differ: differ.length,
    comparisonPrecision: 'LR2 committed its rows rounded to 6 decimals; XR0 values are rounded the same way (Math.round(x * 1e6) / 1e6) and compared for exact equality, field by field',
    maxAbsDErrorKmS: dErr.length ? Math.max(...dErr) : null,
    medianAbsDErrorKmS: q(dErr, 0.5),
    measuredWithError: dErr.length,
    fullPrecision: fullRows.length ? {
      note: 'against LR2\'s full-precision scratch NDJSON found on this host; that file is NOT committed evidence',
      compared: fullRows.length,
      bitIdentical: fullRows.filter((c) => c.fullPrecision.bitIdentical).length,
      maxAbsDErrorKmS: Math.max(...fullRows.map((c) => c.fullPrecision.dError)),
      maxAbsDAssumedKmS: Math.max(...fullRows.map((c) => c.fullPrecision.dAssumed)),
      maxAbsDComputedKmS: Math.max(...fullRows.map((c) => c.fullPrecision.dComputed)),
    } : null,
    gate: gateRows,
    verdict: validates ? 'VALIDATES' : 'BREAKS',
    disagreements: differ,
    secondsPerBodyMedian: q(rows.map((r) => r.ms / 1000), 0.5),
    definitions: { COMPARE, SEGMENT, PAIRING },
  };
  fs.writeFileSync(path.join(here, 'xr0-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(path.join(here, 'xr0-rows.json'), `${JSON.stringify({ schema: 'aster-s20-longrun2-xr0-rows/1', note: 'XR0 values at full precision; lr2 values as committed (6 decimals)', rows: compared.map((c) => ({ des: c.des, why: c.why, status: c.status, agree: c.agree, firstDiff: c.firstDiff, xr0Full: rows.find((r) => r.des === c.des), lr2: c.lr2 })) })}\n`);

  const L = [];
  const row = (cols) => L.push(`| ${cols.join(' | ')} |`);
  const f6 = (x) => (typeof x === 'number' ? x.toFixed(6) : String(x));
  L.push('# XR0 — independent cross-check of the LR2 symmetric-return measurement');
  L.push('');
  L.push(`**VERDICT: this ${summary.verdict} LR2's primary column** on the ${compared.length} bodies compared.`);
  L.push('');
  L.push(`State: ${summary.state}. ${rows.length} bodies computed (${Object.entries(summary.bodiesByReason).map(([k, v]) => `${v} ${k}`).join(', ')}); ${compared.length} joined to LR2's committed rows${missing.length ? `; ${missing.length} not found in LR2 (${missing.join(', ')})` : ''}.`);
  L.push('');
  L.push('## What the verdict covers');
  L.push('- It covers LR2\'s PRIMARY column (the compare-path best practical window): the window found, the assumed burn, the refused-cell count, the computed minimum, the cell it sits on, and the error.');
  L.push('- It checks the pipeline: grid construction, locating the window\'s cell, the endpoint swap, the Earth lookup, the refusal rule, the minimum search and the subtraction. Two paths that share none of that code give the same numbers.');
  L.push('- It does not check what both sides share by definition: the production solver (LR1 compared it with poliastro), the propagator, `segmentWindows`, or the choice of a 723 x 100 return grid.');
  L.push('- It does not cover LR2\'s secondary (best-stack) column, which the dispatch did not ask XR0 to re-derive.');
  L.push(`- Sample: ${compared.length} of 41,906 bodies, not random: the first 500 in catalog order (all of them numbered objects) plus LR2\'s most extreme rows, which are where a pipeline fault would most plausibly show.`);
  L.push('');
  L.push('## What is different about this path');
  L.push('- No file from `tools/slice20-research/longrun/` is imported or copied.');
  L.push('- Earth is read with the production linear-scan lookup. LR2 used its own bisection lookup.');
  L.push('- The outbound grid and the return grid are looped here cell by cell with direct calls to `lambertMultiRev`. LR2 ran `computeCompareData` for the outbound leg and the grid kernel `computePorkchopGrid` with swapped providers for the return leg; neither function is called here.');
  L.push('- A return cell arriving at Earth after the last Earth sample is skipped by an epoch test. LR2 fed the kernel a NaN position and returned null from an injected solver wrapper.');
  L.push('- Body order: the first 500 in catalog order plus every body in LR2\'s extremes tables. LR2 used a seeded shuffle in three shards.');
  L.push('- Shared on purpose, because they define the quantity: the production solver, propagator, Earth interpolation, `segmentWindows` and `departureDvFromVInf`; the compare page\'s grid; DEC-20-2\'s pairing window; LR2\'s 723 x 100 return grid.');
  L.push('');
  L.push('## Gate: three known rows (S20_01 R3, min-C3 windows, M=0)');
  row(['Body', 'assumed here', 'S20_01', 'computed here', 'S20_01', 'reproduced']);
  row(['---', '---:', '---:', '---:', '---:', '---']);
  for (const g of gateRows) row([g.des, g.assumed.toFixed(4), g.s2001Assumed, g.computed.toFixed(4), g.s2001Computed, g.reproduced ? 'yes' : 'NO']);
  L.push('');
  L.push('## Comparison with LR2\'s committed rows');
  L.push(`${summary.comparisonPrecision}.`);
  L.push('');
  row(['Measure', 'Value']);
  row(['---', '---:']);
  row(['Bodies compared', compared.length]);
  row(['Agree on every field at the committed precision', agree.length]);
  row(['Differ on at least one field', differ.length]);
  row(['Bodies with an error value on both sides', dErr.length]);
  row(['max \\|Δerror\\| km/s (committed precision)', summary.maxAbsDErrorKmS === null ? 'n/a' : summary.maxAbsDErrorKmS.toExponential(3)]);
  row(['median \\|Δerror\\| km/s (committed precision)', summary.medianAbsDErrorKmS === null ? 'n/a' : summary.medianAbsDErrorKmS.toExponential(3)]);
  L.push('');
  L.push(`Status values on this side: ${Object.entries(summary.statusCounts).map(([k, v]) => `${k} ${v}`).join('; ')}. Status is one of the compared fields.`);
  L.push('');
  if (summary.fullPrecision) {
    const fp = summary.fullPrecision;
    L.push('### Beyond the committed precision (not committed evidence on the LR2 side)');
    L.push(`LR2's full-precision working file was still in the first run's scratch on this host. Against it, for the ${fp.compared} bodies with an error on both sides: **${fp.bitIdentical} are bit-identical** in window, assumed, computed and error; max |Δerror| ${fp.maxAbsDErrorKmS.toExponential(3)} km/s, max |Δassumed| ${fp.maxAbsDAssumedKmS.toExponential(3)}, max |Δcomputed| ${fp.maxAbsDComputedKmS.toExponential(3)}.`);
    L.push('');
  }
  L.push('## Every disagreeing body');
  if (differ.length === 0) {
    L.push('None.');
  } else {
    row(['Body', 'first field that differs', 'XR0', 'LR2', 'XR0 error', 'LR2 error', 'all differing fields']);
    row(['---', '---', '---:', '---:', '---:', '---:', '---']);
    for (const d of differ) row([d.des, d.firstDiff, f6(d.diffs[0].xr0), f6(d.diffs[0].lr2), f6(d.xr0.error), f6(d.lr2.error), d.diffs.map((x) => x.field).join('; ')]);
  }
  L.push('');
  L.push('## Files');
  L.push('- `crosscheck.mjs` — `run` (compute, resumable) and `report` (this file).');
  L.push('- `xr0-summary.json` — every number above; `xr0-rows.json` — both sides, per body.');
  L.push('');
  fs.writeFileSync(path.join(here, 'REPORT.md'), `${L.join('\n')}\n`);
  console.log(JSON.stringify({ state: summary.state, compared: compared.length, agree: agree.length, differ: differ.length, maxAbsDError: summary.maxAbsDErrorKmS, verdict: summary.verdict, fullPrecision: summary.fullPrecision, statusCounts: summary.statusCounts }, null, 1));
}

if (command === 'run') await run();
else if (command === 'report') report();
else { console.error('usage: crosscheck.mjs run|report'); process.exit(2); }
