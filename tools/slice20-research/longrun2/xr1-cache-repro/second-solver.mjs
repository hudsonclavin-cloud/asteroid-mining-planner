#!/usr/bin/env node
// XR1 step 5 — second mechanism: can the catalog (izzo.ts) and the porkchop page (lambert-multi-rev.ts at
// M = 0) disagree about the same body?
//
//   node second-solver.mjs <recomputed-cache.json>
//
// For a seeded sample of bodies the SAME screening grid is swept here with BOTH production solvers on
// identical inputs. The loop mirrors tools/build/precompute-lambert-screen.mjs:141-153, 189-195, 239-294
// (same departure epochs in TDB seconds, same Earth states from the production lookup, same km
// conversion, same MU_SUN literal, same C3 arithmetic); only the solver call differs. The izzo result
// of this loop is also compared with both caches, which checks the loop itself.
//
// Sample: 300 bodies, seeded, stratified by shipped status (every body of a status with <= 30 members,
// the rest split evenly over the other statuses), plus every body whose status changed between the
// shipped and the recomputed cache. A separately labelled extra group, not part of the 300: the 25
// bodies whose shipped minC3 is nearest the 25 km^2/s^2 threshold, where a straddle is most likely.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES, RUN2_SEED, importV2, loadCatalogBodies, loadEarthSeries, quantile, readStamp, repoRoot, seededShuffle } from '../lib/common2.mjs';

console.debug = () => {};
const here = path.dirname(fileURLToPath(import.meta.url));
const [recomputedPath] = process.argv.slice(2);
readStamp();
const { lambert } = await importV2('core/lambert/izzo.js');
const { lambertMultiRev } = await importV2('core/lambert/lambert-multi-rev.js');
const { propagateKeplerianStateVectors } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await importV2('core/units/utc-to-tdb.js');

// constants and helpers copied from the precompute script (line numbers at 75606da)
const SECONDS_PER_DAY = 86_400; // :79
const MU_SUN = 1.32712440018e11; // :80
const FEASIBLE_C3_MAX = 25; // :90
const kmVec = (p) => [p.x / 1000, p.y / 1000, p.z / 1000]; // :99-105
const magnitude3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z); // :107-109
const tdbToUtcDateString = (t) => new Date((t + 946_728_000 - TDB_MINUS_UTC_SECONDS) * 1000).toISOString().slice(0, 10); // :111-114
const startTdb = utcStringToTdbSeconds('2026-01-01');
const endTdb = utcStringToTdbSeconds('2040-12-31');
const departureTdbs = [];
for (let t = startTdb; t <= endTdb; t += 7 * SECONDS_PER_DAY) departureTdbs.push(t); // :143-146
const tofDaysList = [];
for (let d = 182; d <= 1826; d += 30) tofDaysList.push(d); // :148-153
const earthSeries = await loadEarthSeries();
const earthStates = departureTdbs.map((t) => { const e = interpolateBodyStateSeries('earth', earthSeries, t); return { r: kmVec(e.positionM), v: kmVec(e.velocityMps) }; });
const dates = departureTdbs.map(tdbToUtcDateString);

const shipped = JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.cacheShipped), 'utf8'));
const recomputed = JSON.parse(fs.readFileSync(recomputedPath, 'utf8'));
const sBy = new Map(shipped.bodies.map((b) => [b.designation, b]));
const rBy = new Map(recomputed.bodies.map((b) => [b.designation, b]));
const catalog = new Map((await loadCatalogBodies()).map((b) => [b.designation, b]));

// ---- sample ----------------------------------------------------------------------------------------
const SAMPLE = 300;
const byStatus = new Map();
for (const b of shipped.bodies) { if (!byStatus.has(b.status)) byStatus.set(b.status, []); byStatus.get(b.status).push(b.designation); }
const chosen = new Map();
const add = (des, why) => { if (!chosen.has(des)) chosen.set(des, why); };
for (const b of shipped.bodies) if (rBy.get(b.designation) && rBy.get(b.designation).status !== b.status) add(b.designation, 'status-changed');
const small = [...byStatus.entries()].filter(([, v]) => v.length <= 30);
const large = [...byStatus.entries()].filter(([, v]) => v.length > 30).sort((a, b) => a[0].localeCompare(b[0]));
for (const [st, list] of small) for (const des of list.slice().sort()) add(des, `all of status ${st}`);
const remaining = Math.max(0, SAMPLE - chosen.size);
large.forEach(([st, list], k) => {
  const quota = Math.floor(remaining / large.length) + (k < remaining % large.length ? 1 : 0);
  let taken = 0;
  for (const des of seededShuffle(list.slice().sort(), RUN2_SEED + 100 + k)) {
    if (taken >= quota) break;
    if (chosen.has(des)) continue;
    add(des, `seeded from status ${st}`);
    taken += 1;
  }
});
const sampleSize = chosen.size;
const nearest = shipped.bodies.filter((b) => b.minC3 !== null).slice().sort((a, b) => Math.abs(a.minC3 - FEASIBLE_C3_MAX) - Math.abs(b.minC3 - FEASIBLE_C3_MAX)).slice(0, 25);
for (const b of nearest) if (!chosen.has(b.designation)) chosen.set(b.designation, 'extra: nearest the 25 threshold');

// ---- sweep -----------------------------------------------------------------------------------------
const rows = [];
for (const [des, why] of chosen) {
  const body = catalog.get(des);
  const out = { des, why, cells: 0, bothConverged: 0, onlyIzzo: 0, onlyMultiRev: 0, neither: 0, propagatorFailed: 0, maxCellRelC3Diff: 0 };
  let izMin = Infinity; let izCell = null;
  let mrMin = Infinity; let mrCell = null;
  for (let i = 0; i < departureTdbs.length; i += 1) {
    const earth = earthStates[i];
    for (let j = 0; j < tofDaysList.length; j += 1) {
      const tofSeconds = tofDaysList[j] * SECONDS_PER_DAY;
      out.cells += 1;
      let target;
      try { target = propagateKeplerianStateVectors(body.elements, departureTdbs[i] + tofSeconds); } catch { out.propagatorFailed += 1; continue; }
      const r2 = kmVec(target.positionM);
      const a = lambert(MU_SUN, earth.r, r2, tofSeconds);
      const m = lambertMultiRev(earth.r, r2, tofSeconds, MU_SUN, 0, true);
      const mb = m === null ? null : m.branches.find((x) => x.converged) ?? null;
      let c3a = null; let c3m = null;
      if (a.ok) { const v = magnitude3(a.v1[0] - earth.v[0], a.v1[1] - earth.v[1], a.v1[2] - earth.v[2]); c3a = v * v; if (c3a < izMin) { izMin = c3a; izCell = [dates[i], tofDaysList[j]]; } }
      if (mb) { const v = magnitude3(mb.v1[0] - earth.v[0], mb.v1[1] - earth.v[1], mb.v1[2] - earth.v[2]); c3m = v * v; if (c3m < mrMin) { mrMin = c3m; mrCell = [dates[i], tofDaysList[j]]; } }
      if (c3a !== null && c3m !== null) { out.bothConverged += 1; const rel = Math.abs(c3a - c3m) / Math.abs(c3a); if (rel > out.maxCellRelC3Diff) out.maxCellRelC3Diff = rel; }
      else if (c3a !== null) out.onlyIzzo += 1;
      else if (c3m !== null) out.onlyMultiRev += 1;
      else out.neither += 1;
    }
  }
  const s = sBy.get(des);
  const r = rBy.get(des);
  const rel = (x, y) => (x === null || y === null || !Number.isFinite(x) || !Number.isFinite(y) ? null : Math.abs(x - y) / Math.abs(y));
  const side = (x) => (x === null || !Number.isFinite(x) ? null : x <= FEASIBLE_C3_MAX ? 'low' : 'high');
  out.shippedStatus = s.status;
  out.shippedMinC3 = s.minC3;
  out.recomputedMinC3 = r ? r.minC3 : null;
  out.izzoLoopMinC3 = Number.isFinite(izMin) ? izMin : null;
  out.multiRevMinC3 = Number.isFinite(mrMin) ? mrMin : null;
  out.izzoLoopCell = izCell;
  out.multiRevCell = mrCell;
  out.izzoLoopEqualsRecomputedBitwise = out.izzoLoopMinC3 === out.recomputedMinC3;
  out.izzoLoopEqualsShippedBitwise = out.izzoLoopMinC3 === out.shippedMinC3;
  out.relMultiRevVsShipped = rel(out.multiRevMinC3, s.minC3);
  out.relMultiRevVsRecomputed = rel(out.multiRevMinC3, out.recomputedMinC3);
  out.sameArgminCell = izCell !== null && mrCell !== null && izCell[0] === mrCell[0] && izCell[1] === mrCell[1];
  out.straddlesThreshold = side(out.multiRevMinC3) !== side(s.minC3) || side(out.multiRevMinC3) !== side(out.recomputedMinC3);
  rows.push(out);
}
const inSample = rows.filter((r) => !r.why.startsWith('extra'));
const stat = (list, key) => { const v = list.map((r) => r[key]).filter((x) => x !== null && Number.isFinite(x)).sort((a, b) => a - b); return v.length ? { n: v.length, max: v[v.length - 1], median: quantile(v, 0.5), p90: quantile(v, 0.9) } : { n: 0 }; };
const tally = (list) => ({
  bodies: list.length,
  cells: list.reduce((a, r) => a + r.cells, 0),
  bothConverged: list.reduce((a, r) => a + r.bothConverged, 0),
  onlyIzzoConverged: list.reduce((a, r) => a + r.onlyIzzo, 0),
  onlyMultiRevConverged: list.reduce((a, r) => a + r.onlyMultiRev, 0),
  neitherConverged: list.reduce((a, r) => a + r.neither, 0),
  propagatorFailedCells: list.reduce((a, r) => a + r.propagatorFailed, 0),
  relMinC3MultiRevVsShipped: stat(list, 'relMultiRevVsShipped'),
  relMinC3MultiRevVsRecomputed: stat(list, 'relMultiRevVsRecomputed'),
  maxPerCellRelC3Diff: Math.max(0, ...list.map((r) => r.maxCellRelC3Diff)),
  sameArgminCell: list.filter((r) => r.sameArgminCell).length,
  differentArgminCell: list.filter((r) => r.izzoLoopCell !== null && r.multiRevCell !== null && !r.sameArgminCell).map((r) => ({ des: r.des, izzo: r.izzoLoopCell, multiRev: r.multiRevCell, izzoMinC3: r.izzoLoopMinC3, multiRevMinC3: r.multiRevMinC3 })),
  straddleThreshold: list.filter((r) => r.straddlesThreshold).map((r) => ({ des: r.des, shipped: r.shippedMinC3, recomputed: r.recomputedMinC3, multiRev: r.multiRevMinC3 })),
  izzoLoopEqualsRecomputedBitwise: list.filter((r) => r.izzoLoopEqualsRecomputedBitwise).length,
  izzoLoopEqualsShippedBitwise: list.filter((r) => r.izzoLoopEqualsShippedBitwise).length,
});
const result = {
  schema: 'aster-s20-longrun2-xr1-second-solver/1',
  label: 'LEADS-grade research evidence.',
  generatedAtUtc: new Date().toISOString(),
  node: process.version,
  seed: RUN2_SEED,
  grid: { departures: departureTdbs.length, tofs: tofDaysList.length, cellsPerBody: departureTdbs.length * tofDaysList.length },
  threshold: FEASIBLE_C3_MAX,
  sample: { size: sampleSize, reasons: inSample.reduce((acc, r) => ({ ...acc, [r.why]: (acc[r.why] ?? 0) + 1 }), {}), shippedStatusSizes: Object.fromEntries([...byStatus.entries()].map(([k, v]) => [k, v.length])) },
  inSample: tally(inSample),
  extraNearestThreshold: tally(rows.filter((r) => r.why.startsWith('extra'))),
  rows,
};
fs.writeFileSync(path.join(here, 'xr1-second-solver.json'), `${JSON.stringify(result)}\n`);
console.log(JSON.stringify({ sample: result.sample, inSample: { ...result.inSample, differentArgminCell: result.inSample.differentArgminCell.length, straddleThreshold: result.inSample.straddleThreshold }, extra: { ...result.extraNearestThreshold, differentArgminCell: result.extraNearestThreshold.differentArgminCell.length } }, null, 1));
