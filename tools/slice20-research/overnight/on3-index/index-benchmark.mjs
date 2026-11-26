import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

const [buildDir, outputPath] = process.argv.slice(2);
if (!buildDir || !outputPath) throw new Error('usage: node index-benchmark.mjs <build-dir> <results-json>');
const imp = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);
const [horizons, hermite, invariants, catalog] = await Promise.all([
  imp('boundary/horizons.js'), imp('core/interpolators/hermite.js'), imp('core/invariants/runtime.js'), imp('boundary/slice9-nea-catalog.js'),
]);
const repoRoot = path.resolve(import.meta.dirname, '../../../..');
const earthFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const catalogFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const samples = horizons.ingestSlice2Fixture(earthFixture).earth.map((sample) => sample.state);
const bodies = Object.values(catalog.ingestSlice9Fixture(catalogFixture).asteroids);
const minT = samples[0].tdbSeconds; const maxT = samples.at(-1).tdbSeconds;
const stateComponents = (s) => [s.positionM.x, s.positionM.y, s.positionM.z, s.velocityMps.x, s.velocityMps.y, s.velocityMps.z];
function indexedLookup(t) {
  if (samples.length === 0) return hermite.interpolateBodyStateSeries('earth', samples, t);
  if (t < minT || t > maxT) {
    invariants.failInvariant('INV-008', `Requested interpolation time is outside available sample range for body 'earth'`, { bodyId: 'earth', tdbSeconds: t, minTdbSeconds: minT, maxTdbSeconds: maxT, expectedCadenceSeconds: 86400 });
  }
  let lo = 0; let hi = samples.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1; const value = samples[mid].tdbSeconds;
    if (value === t) return samples[mid];
    if (value < t) lo = mid + 1; else hi = mid - 1;
  }
  const left = Math.max(0, hi); const right = Math.min(samples.length - 1, left + 1);
  return hermite.interpolateBodyState(samples[left], samples[right], t);
}
function linearLookup(t) { return hermite.interpolateBodyStateSeries('earth', samples, t); }
function thrown(fn, t) { try { fn(t); return null; } catch (error) { return { name: error.name, message: error.message }; } }
function compare(a, b) { const av = stateComponents(a); const bv = stateComponents(b); return Math.max(...av.map((v, i) => Math.abs(v - bv[i]))); }
function mulberry32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const testEpochs = [];
for (const sample of samples) {
  testEpochs.push(sample.tdbSeconds, sample.tdbSeconds - 1e-6 * 86400, sample.tdbSeconds + 1e-6 * 86400);
}
for (let i = 0; i < samples.length - 1; i += 1) testEpochs.push((samples[i].tdbSeconds + samples[i + 1].tdbSeconds) / 2);
const random = mulberry32(20261125); const randomEpochs = Array.from({ length: 1_000_000 }, () => minT + random() * (maxT - minT));
let maxDifference = 0; let nonzeroDifferences = 0; const mismatches = []; let identityCount = 0;
for (const t of [...testEpochs, ...randomEpochs]) {
  try {
    const a = linearLookup(t); const b = indexedLookup(t); const diff = compare(a, b); maxDifference = Math.max(maxDifference, diff); if (diff !== 0) { nonzeroDifferences += 1; if (mismatches.length < 10) mismatches.push({ t, diff }); }
    identityCount += 1;
  } catch (aError) {
    const bError = thrown(indexedLookup, t); if (!bError || aError.name !== bError.name || aError.message !== bError.message) mismatches.push({ t, linear: { name: aError.name, message: aError.message }, indexed: bError });
  }
}
const outsideEpochs = [minT - 1, maxT + 1, minT - 1e-6 * 86400, maxT + 1e-6 * 86400];
const outside = outsideEpochs.map((t) => ({ t, linear: thrown(linearLookup, t), indexed: thrown(indexedLookup, t) }));
const warm = (fn, epochs) => { let sum = 0; const start = performance.now(); for (const t of epochs) sum += stateComponents(fn(t))[0]; return { ms: performance.now() - start, sum }; };
for (let i = 0; i < 2; i += 1) { warm(linearLookup, randomEpochs); warm(indexedLookup, randomEpochs); }
const linearTimes = []; const indexedTimes = [];
for (let i = 0; i < 5; i += 1) { linearTimes.push(warm(linearLookup, randomEpochs).ms); indexedTimes.push(warm(indexedLookup, randomEpochs).ms); }
const med = (a) => { const x = a.slice().sort((u, v) => u - v); return x[Math.floor(x.length / 2)]; };

const selectedDesignations = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools/slice20-research/longrun/lr1-oracle/lr1-summary.json'), 'utf8')).perBody.slice(0, 20).map((row) => row.designation);
const selectedBodies = selectedDesignations.map((d) => bodies.find((b) => b.designation === d)).filter(Boolean);
const depGrid = Array.from({ length: 200 }, (_, i) => 2461041.500800741 + (2466154.500800741 - 2461041.500800741) * i / 199);
const tofGrid = Array.from({ length: 100 }, (_, i) => 182.5 + (1826.25 - 182.5) * i / 99);
function gridTiming(kind, fn) {
  let sum = 0; let refused = 0; const start = performance.now();
  for (const body of selectedBodies) {
    for (const depJd of depGrid) for (const tofDays of tofGrid) {
      const depSeconds = (depJd - 2451545) * 86400; const arrivalSeconds = depSeconds + tofDays * 86400;
      const lookupEpoch = kind === 'return' ? arrivalSeconds : depSeconds;
      if (lookupEpoch < minT || lookupEpoch > maxT) { refused += 1; continue; }
      // The same Earth lookup is made once for each family, matching the M=0 + M=1 timing budget.
      sum += stateComponents(fn(lookupEpoch))[0]; sum += stateComponents(fn(lookupEpoch))[0];
    }
  }
  return { seconds: (performance.now() - start) / 1000, sum, refused };
}
const returnLinear = gridTiming('return', linearLookup); const returnIndexed = gridTiming('return', indexedLookup);
const outboundLinear = gridTiming('outbound', linearLookup); const outboundIndexed = gridTiming('outbound', indexedLookup);
const result = {
  schema: 'aster-s20-overnight-on3-index/1', generatedAtUtc: new Date().toISOString(), sampleCount: samples.length, spanSeconds: { min: minT, max: maxT },
  identity: { cases: testEpochs.length + randomEpochs.length, nonzeroDifferences, maxAbsDifference: maxDifference, identityCount, mismatches, outside },
  timing: { randomEpochCount: randomEpochs.length, linearMs: linearTimes, indexedMs: indexedTimes, linearMedianMs: med(linearTimes), indexedMedianMs: med(indexedTimes), speedupPerCall: med(linearTimes) / med(indexedTimes), selectedBodies: selectedDesignations, returnGrid: { cells: 200 * 100 * 20, families: 2, linearSeconds: returnLinear.seconds, indexedSeconds: returnIndexed.seconds, speedup: returnLinear.seconds / returnIndexed.seconds }, outboundGrid: { cells: 200 * 100 * 20, families: 2, linearSeconds: outboundLinear.seconds, indexedSeconds: outboundIndexed.seconds, speedup: outboundLinear.seconds / outboundIndexed.seconds } },
  algorithm: 'Production is a linear scan with exact-node return, then strict bracket; the index uses exact-node binary search, then the same production Hermite evaluator and the same INV-008 bounds refusal.',
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true }); fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8'); console.log(JSON.stringify(result, null, 2));
