// S20_OVERNIGHT ON2: new return-leg harness. It copies no module from longrun/.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [buildDir, outputPath] = process.argv.slice(2);
if (!buildDir || !outputPath) throw new Error('usage: node build-return-cells.mjs <build-dir> <cells-json>');
const imp = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);
const [horizons, hermite, keplerian, lambert, catalog] = await Promise.all([
  imp('boundary/horizons.js'),
  imp('core/interpolators/hermite.js'),
  imp('core/propagators/keplerian.js'),
  imp('core/lambert/lambert-multi-rev.js'),
  imp('boundary/slice9-nea-catalog.js'),
]);
const repoRoot = path.resolve(import.meta.dirname, '../../../..');
const earthFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const catalogFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const tiersFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/tier-sizing-per-body.json'), 'utf8'));
const earthSeries = horizons.ingestSlice2Fixture(earthFixture).earth.map((sample) => sample.state);
const bodyMap = catalog.ingestSlice9Fixture(catalogFixture).asteroids;
const earthLastSeconds = earthSeries.at(-1).tdbSeconds;
const bodyList = Object.values(bodyMap);
const tierByBody = tiersFixture.records ?? {};
const lr1Summary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools/slice20-research/longrun/lr1-oracle/lr1-summary.json'), 'utf8'));
const lr1Designations = new Set(lr1Summary.perBody.map((row) => row.designation));

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffled(items, seed) {
  const out = items.slice();
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
function chooseBodies() {
  const l0 = bodyList.filter((b) => tierByBody[b.designation]?.tier === 'L0' && !lr1Designations.has(b.designation));
  const l1 = bodyList.filter((b) => tierByBody[b.designation]?.tier === 'L1' && !lr1Designations.has(b.designation));
  const l2 = bodyList.filter((b) => tierByBody[b.designation]?.tier === 'L2' && !lr1Designations.has(b.designation));
  return [
    ...lr1Designations,
  ].map((designation) => bodyList.find((b) => b.designation === designation)).filter(Boolean)
    .concat(shuffled(l1, 20261125).slice(0, 27))
    .concat(shuffled(l2, 20261125).slice(0, 26))
    .concat(l0);
}
const bodies = chooseBodies();
if (bodies.length !== 100) throw new Error(`expected 100 bodies, got ${bodies.length}`);

const MU_SUN_KM3_S2 = 132712440018;
const SECONDS_PER_DAY = 86400;
const depStartJd = 2461041.500800741;
const depEndJd = 2466154.500800741;
const tofMinDays = 182.5;
const tofMaxDays = 1826.25;
const depGrid = Array.from({ length: 40 }, (_, i) => depStartJd + (depEndJd - depStartJd) * i / 39);
const tofGrid = Array.from({ length: 40 }, (_, i) => tofMinDays + (tofMaxDays - tofMinDays) * i / 39);
const jdSeconds = (jd) => (jd - 2451545.0) * SECONDS_PER_DAY;
const earthAt = (seconds) => hermite.interpolateBodyStateSeries('earth', earthSeries, seconds);
const asteroidAt = (body, seconds) => keplerian.propagateKeplerianStateVectors(body.elements, seconds);
const vecKm = (v) => [v.x / 1000, v.y / 1000, v.z / 1000];
const vecKmps = (v) => [v.x / 1000, v.y / 1000, v.z / 1000];
const norm = (v) => Math.hypot(v[0], v[1], v[2]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function tMinInputs(r1, r2, tofSeconds, M) {
  const c = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
  const r1Mag = norm(r1); const r2Mag = norm(r2); const cMag = norm(c); const s = 0.5 * (r1Mag + r2Mag + cMag);
  const h = cross(r1.map((v) => v / r1Mag), r2.map((v) => v / r2Mag));
  const hMag = norm(h);
  const lambda = hMag === 0 ? null : (h[2] < 0 ? -1 : 1) * Math.sqrt(1 - Math.min(1, cMag / s));
  const T = Math.sqrt((2 * MU_SUN_KM3_S2) / (s ** 3)) * tofSeconds;
  const TMin = lambda === null ? null : lambert.tMinForM(lambda, M);
  return { lambda, T, TMin, normalizedMargin: TMin === null ? null : T - TMin };
}

const oldConsoleDebug = console.debug;
console.debug = () => {};
const cells = [];
const stats = { bodies: bodies.length, cells: 0, refusedEarth: 0, asteroidPropagationRefused: 0, asterNull: 0, asterBranches: { M0: 0, M1: 0, M2: 0 } };
for (const [bodyIndex, body] of bodies.entries()) {
  for (let depIndex = 0; depIndex < depGrid.length; depIndex += 1) {
    const depJd = depGrid[depIndex];
    const depSeconds = jdSeconds(depJd);
    let asteroidState = null;
    let asteroidError = null;
    try { asteroidState = asteroidAt(body, depSeconds); } catch (error) { asteroidError = `${error.name}: ${error.message}`; }
    const r1 = asteroidState ? vecKm(asteroidState.positionM) : null;
    const vAsteroid = asteroidState ? vecKmps(asteroidState.velocityMps) : null;
    for (let tofIndex = 0; tofIndex < tofGrid.length; tofIndex += 1) {
      const tofDays = tofGrid[tofIndex];
      const arrivalJd = depJd + tofDays;
      const arrivalSeconds = depSeconds + tofDays * SECONDS_PER_DAY;
      const base = { bodyIndex, designation: body.designation, tier: tierByBody[body.designation]?.tier ?? null, depIndex, tofIndex, depJd, tofDays, arrivalJd, r1, vAsteroid };
      for (const M of [0, 1, 2]) {
        stats.cells += 1;
        const id = `${body.designation}|${depIndex}|${tofIndex}|M${M}`;
        if (asteroidError) {
          cells.push({ ...base, id, M, status: 'asteroid_propagation_refused', asteroidError });
          stats.asteroidPropagationRefused += 1;
          continue;
        }
        if (arrivalSeconds > earthLastSeconds) {
          cells.push({ ...base, id, M, status: 'refused_earth' });
          stats.refusedEarth += 1;
          continue;
        }
        const earthState = earthAt(arrivalSeconds);
        const r2 = vecKm(earthState.positionM);
        const vEarth = vecKmps(earthState.velocityMps);
        let result = null;
        try { result = lambert.lambertMultiRev(r1, r2, tofDays * SECONDS_PER_DAY, MU_SUN_KM3_S2, M, true); } catch { result = null; }
        const asterBranches = result?.branches?.map((branch) => ({ branch: branch.branch, converged: branch.converged, x: branch.x, v1: branch.v1, v2: branch.v2 })) ?? [];
        if (!result) stats.asterNull += 1;
        for (const branch of asterBranches) if (branch.converged) stats.asterBranches[`M${M}`] += 1;
        const tmin = tMinInputs(r1, r2, tofDays * SECONDS_PER_DAY, M);
        cells.push({ ...base, id, M, status: result ? 'aster_result' : 'aster_null', r2, vEarth, asterBranches, tmin });
      }
    }
  }
  if ((bodyIndex + 1) % 10 === 0) console.log(`built ${bodyIndex + 1}/${bodies.length} bodies`);
}
console.debug = oldConsoleDebug;
const payload = {
  schema: 'aster-s20-overnight-on2-cells/1', generatedAtUtc: new Date().toISOString(), headCommit: 'b25a37b',
  muSunKm3S2: MU_SUN_KM3_S2, grid: { depStartJd, depEndJd, depCount: 40, tofMinDays, tofMaxDays, tofCount: 40, earthLastSeconds },
  selection: { seed: 20261125, count: bodies.length, lr1Count: 40, extraL0: bodies.filter((b) => !lr1Designations.has(b.designation) && tierByBody[b.designation]?.tier === 'L0').map((b) => b.designation), bodies: bodies.map((b) => ({ designation: b.designation, bodyId: b.bodyId, tier: tierByBody[b.designation]?.tier ?? null })) },
  stats, cells,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(payload), { encoding: 'utf8' });
console.log(JSON.stringify({ outputPath, ...stats, records: cells.length }, null, 2));
