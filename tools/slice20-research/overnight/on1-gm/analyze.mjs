import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [originBuild, patchBuild, outputPath] = process.argv.slice(2);
if (!originBuild || !patchBuild || !outputPath) throw new Error('usage: node analyze.mjs <origin-build> <patch-a-build> <output-json>');
const imp = (root, rel) => import(pathToFileURL(path.join(root, rel)).href);
const [grid, hermite, keplerian, horizons, catalog, deltaOrigin, deltaPatch] = await Promise.all([
  imp(originBuild, 'porkchop/grid-compute.js'),
  imp(originBuild, 'core/interpolators/hermite.js'),
  imp(originBuild, 'core/propagators/keplerian.js'),
  imp(originBuild, 'boundary/horizons.js'),
  imp(originBuild, 'boundary/slice9-nea-catalog.js'),
  imp(originBuild, 'porkchop/delta-v.js'),
  imp(patchBuild, 'porkchop/delta-v.js'),
]);
const repoRoot = path.resolve(import.meta.dirname, '../../../..');
const earthFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const catalogFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const earthSeries = horizons.ingestSlice2Fixture(earthFixture).earth.map((sample) => sample.state);
const bodyMap = catalog.ingestSlice9Fixture(catalogFixture).asteroids;
const bodies = Object.values(bodyMap);
const earth = (tdbSeconds) => hermite.interpolateBodyStateSeries('earth', earthSeries, tdbSeconds);
const target = (elements, tdbSeconds) => keplerian.propagateKeplerianStateVectors(elements, tdbSeconds);
const deps = { getEarthStateAtTdbSeconds: earth, propagateTargetStateAtTdbSeconds: target };
const secondsPerDay = 86400;
const startJd = 2461041.500800741;
const endJd = 2466154.500800741;
const gridParams = { depStartJD: startJd, depEndJD: endJd, tofMinDays: 182.5, tofMaxDays: 1826.25, nDep: 200, nTof: 100 };
const oldConsoleDebug = console.debug;
console.debug = () => {};

function selectedCell(cell) {
  if (cell.status !== 'ok' || cell.selectedBranch === null) return null;
  return cell.branches[cell.selectedBranch];
}

function stackFor(delta, c3, vInfArr) {
  const modes = {};
  for (const mode of ['one-way', 'sample-return']) modes[mode] = delta.buildDeltaVStack(c3, vInfArr, mode);
  return modes;
}

function deltaSummary(input) {
  const out = {};
  for (const mode of Object.keys(input.origin)) {
    out[mode] = {};
    for (const key of Object.keys(input.origin[mode])) {
      const a = input.origin[mode][key];
      const b = input.patch[mode][key];
      out[mode][key] = { origin: a, patchA: b, absoluteChange: Math.abs(b - a) };
    }
  }
  return out;
}

function summarize(records) {
  const byMode = {};
  for (const mode of ['one-way', 'sample-return']) {
    const keys = Object.keys(records[0]?.delta[mode] ?? {});
    byMode[mode] = {};
    for (const key of keys) {
      const values = records.map((r) => r.delta[mode][key].absoluteChange).sort((a, b) => a - b);
      const median = values.length ? (values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2) : null;
      byMode[mode][key] = { count: values.length, max: values.at(-1) ?? null, median };
    }
  }
  return byMode;
}

function makeRecord(id, c3, vInfArr, provenance) {
  const origin = stackFor(deltaOrigin, c3, vInfArr);
  const patch = stackFor(deltaPatch, c3, vInfArr);
  return { id, provenance, c3, vInfArr, delta: deltaSummary({ origin, patch }) };
}

const showcaseBody = bodies.find((body) => body.designation === '2020 FK3');
if (!showcaseBody) throw new Error('2020 FK3 not found in catalog');
const showcaseGrids = [0, 1].map((M) => grid.computePorkchopGrid(showcaseBody.elements, gridParams, M, deps));
const showcaseCells = showcaseGrids.flatMap((result) => result.cells.map((cell) => ({ cell, branch: selectedCell(cell) }))).filter((item) => item.branch !== null);
showcaseCells.sort((a, b) => a.branch.c3 - b.branch.c3);
const showcase = showcaseCells[0];

const pinned = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/lambert-multi-rev-pinned-cells.json'), 'utf8')).cells;
const fixtureRecords = pinned.filter((cell) => cell.expected?.ok).map((cell) => makeRecord(cell.id, cell.expected.c3Km2S2, cell.expected.vInfArrKmps, 'lambert-multi-rev-pinned-cells.json'));

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = mulberry32(20261125);
const randomRecords = [];
let attempts = 0;
while (randomRecords.length < 2000 && attempts < 30000) {
  attempts += 1;
  const body = bodies[Math.floor(rand() * bodies.length)];
  const depJD = startJd + rand() * (endJd - startJd);
  const tofDays = 182.5 + rand() * (1826.25 - 182.5);
  try {
    const result = grid.computePorkchopGrid(body.elements, { depStartJD: depJD, depEndJD: depJD, tofMinDays: tofDays, tofMaxDays: tofDays, nDep: 1, nTof: 1 }, 0, deps);
    const branch = selectedCell(result.cells[0]);
    if (branch) randomRecords.push(makeRecord(`${body.designation}|${depJD}|${tofDays}|M0`, branch.c3, branch.vInfArr, 'seeded-random-M0'));
  } catch {
    // Catalog entries ruled out by the production elliptical propagator are not converged cells.
  }
}

const showcaseRecord = makeRecord(
  `2020 FK3|${showcase.cell.depJD}|${showcase.cell.tofDays}|M${showcase.cell.M}|${showcase.branch.branch}`,
  showcase.branch.c3,
  showcase.branch.vInfArr,
  'production-200x100-global-minimum',
);
const allRecords = [showcaseRecord, ...fixtureRecords, ...randomRecords];
console.debug = oldConsoleDebug;
const result = {
  schema: 'aster-s20-overnight-on1-gm/1',
  generatedAtUtc: new Date().toISOString(),
  constants: { originKm3S2: deltaOrigin.EARTH_MU_KM3_PER_S2, patchAKm3S2: deltaPatch.EARTH_MU_KM3_PER_S2 },
  earthLiteralInventory: [
    'src/v2/porkchop/delta-v.ts:3,20 — EARTH_MU_KM3_PER_S2 = 398600.4418',
    'src/physics/constants/index.ts:11 — GM_earth = 3.986004418e14 m³/s²',
    'src/physics/orbital/patched-conic/index.ts:11,34-35 — 398600.4418 km³/s²',
    'src/renderer/scene/earth/satellites.ts:46,138 — 3.986e14 m³/s²',
    'mcp/src/resources/reference.ts:5,141 — imports and returns the V2 constant; no separate literal',
  ],
  inputs: { showcase: showcaseRecord, pinned: fixtureRecords, randomCount: randomRecords.length, randomAttempts: attempts, seed: 20261125 },
  summaries: summarize(allRecords),
  records: allRecords,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, { encoding: 'utf8' });
console.log(JSON.stringify({ outputPath, showcase: showcaseRecord.id, randomCount: randomRecords.length, randomAttempts: attempts }, null, 2));
