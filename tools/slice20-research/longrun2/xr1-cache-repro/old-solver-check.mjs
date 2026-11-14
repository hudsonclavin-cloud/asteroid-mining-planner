#!/usr/bin/env node
// XR1 discriminator — are the last-digit differences between the shipped and the recomputed cache caused by
// the SOURCE changes since the recorded solver commit, or by the machine that ran it?
//
//   node old-solver-check.mjs <dir with the recorded commit's core/lambert compiled to ESM> <recomputed.json>
//
// The first argument is a build of src/v2/core/lambert/{izzo,householder,hyp2f1b,initial-guess,tof,vec3}.ts
// exactly as they were at the cache's recorded solverCommit (extracted by hand with `git show` in a
// full-history clone and compiled with this repo's tsc; this script does not read git history).
// For the bodies with the largest shipped-versus-recomputed minC3 differences plus a seeded draw of other
// changed bodies, the screening grid is swept on THIS host with the old solver and with the current one.
// If old == current bit for bit here, the source changes cannot be what moved the shipped values.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FILES, RUN2_SEED, importV2, loadCatalogBodies, loadEarthSeries, readStamp, repoRoot, seededShuffle } from '../lib/common2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [oldBuildDir, recomputedPath] = process.argv.slice(2);
readStamp();
const { lambert: lambertNew } = await importV2('core/lambert/izzo.js');
const { lambert: lambertOld } = await import(pathToFileURL(path.join(oldBuildDir, 'core/lambert/izzo.js')).href);
const { propagateKeplerianStateVectors } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { utcStringToTdbSeconds } = await importV2('core/units/utc-to-tdb.js');

const MU_SUN = 1.32712440018e11;
const kmVec = (p) => [p.x / 1000, p.y / 1000, p.z / 1000];
const mag = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
const startTdb = utcStringToTdbSeconds('2026-01-01');
const endTdb = utcStringToTdbSeconds('2040-12-31');
const deps = [];
for (let t = startTdb; t <= endTdb; t += 7 * 86_400) deps.push(t);
const tofs = [];
for (let d = 182; d <= 1826; d += 30) tofs.push(d * 86_400);
const earthSeries = await loadEarthSeries();
const earth = deps.map((t) => { const e = interpolateBodyStateSeries('earth', earthSeries, t); return { r: kmVec(e.positionM), v: kmVec(e.velocityMps) }; });

const shipped = new Map(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.cacheShipped), 'utf8')).bodies.map((b) => [b.designation, b]));
const recomputed = new Map(JSON.parse(fs.readFileSync(recomputedPath, 'utf8')).bodies.map((b) => [b.designation, b]));
const changed = [...shipped.values()].filter((b) => recomputed.get(b.designation).minC3 !== b.minC3)
  .map((b) => ({ des: b.designation, rel: Math.abs(recomputed.get(b.designation).minC3 - b.minC3) / Math.abs(b.minC3) }))
  .sort((a, b) => b.rel - a.rel);
const unchanged = [...shipped.values()].filter((b) => b.minC3 !== null && recomputed.get(b.designation).minC3 === b.minC3).map((b) => b.designation).sort();
const pick = [
  ...changed.slice(0, 25).map((x) => [x.des, 'largest shipped-vs-recomputed difference']),
  ...seededShuffle(changed.slice(25).map((x) => x.des).sort(), RUN2_SEED + 31).slice(0, 50).map((d) => [d, 'seeded from the other changed bodies']),
  ...seededShuffle(unchanged, RUN2_SEED + 32).slice(0, 25).map((d) => [d, 'seeded from the unchanged bodies']),
];
const catalog = new Map((await loadCatalogBodies()).map((b) => [b.designation, b]));
const rows = [];
let cells = 0;
let cellsBitIdentical = 0;
for (const [des, why] of pick) {
  const body = catalog.get(des);
  let minOld = Infinity;
  let minNew = Infinity;
  for (let i = 0; i < deps.length; i += 1) {
    for (let j = 0; j < tofs.length; j += 1) {
      const target = propagateKeplerianStateVectors(body.elements, deps[i] + tofs[j]);
      const r2 = kmVec(target.positionM);
      const a = lambertOld(MU_SUN, earth[i].r, r2, tofs[j]);
      const b = lambertNew(MU_SUN, earth[i].r, r2, tofs[j]);
      cells += 1;
      const ca = a.ok ? mag(a.v1[0] - earth[i].v[0], a.v1[1] - earth[i].v[1], a.v1[2] - earth[i].v[2]) ** 2 : null;
      const cb = b.ok ? mag(b.v1[0] - earth[i].v[0], b.v1[1] - earth[i].v[1], b.v1[2] - earth[i].v[2]) ** 2 : null;
      if (ca === cb) cellsBitIdentical += 1;
      if (ca !== null && ca < minOld) minOld = ca;
      if (cb !== null && cb < minNew) minNew = cb;
    }
  }
  rows.push({ des, why, shipped: shipped.get(des).minC3, recomputed: recomputed.get(des).minC3, oldSolverHere: minOld, currentSolverHere: minNew, oldEqualsCurrentHere: minOld === minNew, oldHereEqualsShipped: minOld === shipped.get(des).minC3, currentHereEqualsRecomputed: minNew === recomputed.get(des).minC3 });
}
const result = {
  schema: 'aster-s20-longrun2-xr1-old-solver-check/1',
  generatedAtUtc: new Date().toISOString(),
  host: { node: process.version, platform: process.platform, arch: process.arch },
  bodies: rows.length, cells, cellsBitIdenticalOldVsCurrent: cellsBitIdentical,
  oldEqualsCurrentHere: rows.filter((r) => r.oldEqualsCurrentHere).length,
  oldSolverHereEqualsShipped: rows.filter((r) => r.oldHereEqualsShipped).length,
  currentSolverHereEqualsRecomputed: rows.filter((r) => r.currentHereEqualsRecomputed).length,
  byGroup: Object.fromEntries([...new Set(rows.map((r) => r.why))].map((w) => { const g = rows.filter((r) => r.why === w); return [w, { bodies: g.length, oldEqualsCurrentHere: g.filter((r) => r.oldEqualsCurrentHere).length, oldSolverHereEqualsShipped: g.filter((r) => r.oldHereEqualsShipped).length }]; })),
  rows,
};
fs.writeFileSync(path.join(here, 'xr1-old-solver-check.json'), `${JSON.stringify(result, null, 1)}\n`);
console.log(JSON.stringify({ ...result, rows: undefined }, null, 1));
