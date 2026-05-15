import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  buildSlice8CutoverSample,
  INV013_BARS_KM,
  SLICE8_CUTOVER_PER_BAND_COUNT,
} from '../tools/slice8-ingestion/slice8-cutover-sample.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice8-cutover');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');
const truthPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'slice8-cutover-truth.json');
const slice7ExpectedAccuracyPath = path.join(
  repoRoot,
  'tools',
  'slice7-research',
  'data',
  'keplerian-accuracy-anchored.json',
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function computeRmsKm(errorsKm) {
  const meanSquare = errorsKm.reduce((sum, value) => sum + value * value, 0) / errorsKm.length;
  return Math.sqrt(meanSquare);
}

function formatBandSummary(band, summary) {
  return `${band} count=${summary.count} max=${summary.maxErrorKm.toFixed(6)} km bar=${summary.barKm.toFixed(6)} km rms=${summary.rmsErrorKm.toFixed(6)} km`;
}

console.log('Compiling v2 core and boundary for Slice 8 cutover...');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
const tscResult = spawnSync(
  tscBin,
  [
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);

if (tscResult.status !== 0) {
  console.error('FAIL tsc compilation');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}
console.log('PASS tsc compilation\n');

assert.ok(fs.existsSync(truthPath), `Missing Slice 8 truth cache at ${truthPath}. Run node tools/slice8-ingestion/fetch-cutover-truth.mjs first.`);

const [core, horizons] = await Promise.all([
  import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
  import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
]);

const fixture = readJson(fixturePath);
const truth = readJson(truthPath);
const catalog = horizons.ingestSlice8Fixture(fixture);
const sample = buildSlice8CutoverSample(fixture.asteroids);
const truthByBodyId = new Map((truth.bodies ?? []).map((body) => [body.bodyId, body]));
const expectedSlice7 = readJson(slice7ExpectedAccuracyPath);

assert.equal(sample.flat.length, SLICE8_CUTOVER_PER_BAND_COUNT * 4, 'Slice 8 cutover sample should contain 200 bodies');
assert.equal(truth.bodies.length, sample.flat.length, 'Slice 8 truth cache should match the deterministic sample size');

const violations = [];
core.configureInvariantRuntime({
  mode: 'report',
  onViolation(violation) {
    violations.push(violation);
  },
});

const bandSummaries = {
  A: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.A, rmsErrors: [] },
  B: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.B, rmsErrors: [] },
  C: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.C, rmsErrors: [] },
  D: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.D, rmsErrors: [] },
};

for (const sampled of sample.flat) {
  const asteroid = catalog.asteroids[sampled.bodyId];
  assert.ok(asteroid, `Missing asteroid ${sampled.bodyId} from Slice 8 fixture`);
  core.assertCanonicalState(asteroid.anchorState);

  const truthBody = truthByBodyId.get(sampled.bodyId);
  assert.ok(truthBody, `Missing truth cache for ${sampled.bodyId}`);
  assert.equal(truthBody.eccentricityBand, asteroid.eccentricityBand, `${sampled.bodyId} band mismatch between fixture and truth cache`);
  assert.equal(truthBody.sampleCount, 91, `${sampled.bodyId} truth cache must contain 91 samples`);

  const errorsKm = [];
  for (const samplePoint of truthBody.samples) {
    const truthState = core.createCanonicalState({
      frame: core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds: core.jdTdbToSecondsSinceJ2000(samplePoint.jdTdb),
      positionM: {
        x: samplePoint.positionKm.x * 1000,
        y: samplePoint.positionKm.y * 1000,
        z: samplePoint.positionKm.z * 1000,
      },
      velocityMps: {
        x: samplePoint.velocityKms.x * 1000,
        y: samplePoint.velocityKms.y * 1000,
        z: samplePoint.velocityKms.z * 1000,
      },
      radiusM: asteroid.estimatedRadiusM,
    });

    const estimate = core.propagateKeplerianState(
      asteroid.elements,
      truthState.tdbSeconds,
      { radiusM: asteroid.estimatedRadiusM },
    );
    core.assertCanonicalState(estimate);
    core.assertKeplerianError(estimate, truthState, asteroid.bodyId);

    const dx = estimate.positionM.x - truthState.positionM.x;
    const dy = estimate.positionM.y - truthState.positionM.y;
    const dz = estimate.positionM.z - truthState.positionM.z;
    errorsKm.push(Math.sqrt(dx * dx + dy * dy + dz * dz) / 1000);
  }

  const maxErrorKm = Math.max(...errorsKm);
  const rmsErrorKm = computeRmsKm(errorsKm);
  const bandSummary = bandSummaries[asteroid.eccentricityBand];
  bandSummary.count += 1;
  bandSummary.maxErrorKm = Math.max(bandSummary.maxErrorKm, maxErrorKm);
  bandSummary.rmsErrors.push(rmsErrorKm);

  assert.ok(
    maxErrorKm <= bandSummary.barKm,
    `${sampled.bodyId} max error ${maxErrorKm} km exceeded INV-013 band ${asteroid.eccentricityBand} bar ${bandSummary.barKm} km`,
  );
}

for (const expected of expectedSlice7.asteroids) {
  const asteroid = catalog.asteroids[`asteroid-${expected.designation}`];
  assert.ok(asteroid, `Missing Slice 7 regression asteroid asteroid-${expected.designation}`);
  const barKm = INV013_BARS_KM[asteroid.eccentricityBand];
  assert.ok(
    expected.max_error_km <= barKm,
    `Slice 7 regression asteroid ${expected.designation} exceeded Slice 8 band ${asteroid.eccentricityBand} bar: ${expected.max_error_km} km > ${barKm} km`,
  );
}

core.resetInvariantRuntime();

assert.equal(
  violations.length,
  0,
  `runtime invariant violations detected:\n${violations
    .map((violation) => `${violation.invariantId} ${violation.message} ${JSON.stringify(violation.details ?? {})}`)
    .join('\n')}`,
);

console.log('');
console.log('Slice 8 per-band cutover summary:');
for (const band of ['A', 'B', 'C', 'D']) {
  const summary = bandSummaries[band];
  const rmsErrorKm = computeRmsKm(summary.rmsErrors);
  console.log(`  ${formatBandSummary(band, { ...summary, rmsErrorKm })}`);
  assert.equal(summary.count, SLICE8_CUTOVER_PER_BAND_COUNT, `Band ${band} should contribute 50 sampled bodies`);
}
console.log('');
console.log('Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.');
