// B1 — Slice 7 INV-012 Cutover Validation Harness
// Validates per-body Keplerian propagation error against INV-012 for the
// 18-body representative sample, checks numerical parity with the round-2
// pre-research measurements, and ensures runtime assertions stay green.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice7-cutover');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');
const truthDir = path.join(repoRoot, 'tools', 'slice7-research', 'data', 'horizons-truth');
const expectedAccuracyPath = path.join(
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

function formatBodySummary(designation, summary) {
  return [
    designation.toString().padEnd(8),
    `max=${summary.maxErrorKm.toFixed(6)} km`,
    `bar=${summary.barKm.toFixed(3)} km`,
    `rms=${summary.rmsErrorKm.toFixed(6)} km`,
    `checked=${summary.checkedPoints}`,
  ].join('  ');
}

console.log('Compiling v2 core and boundary for Slice 7 cutover...');
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

const [core, horizons] = await Promise.all([
  import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
  import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
]);

const violations = [];
core.configureInvariantRuntime({
  mode: 'report',
  onViolation(violation) {
    violations.push(violation);
  },
});

const fixture = readJson(fixturePath);
const catalog = horizons.ingestSlice7Fixture(fixture);
const expectedAccuracy = readJson(expectedAccuracyPath);
const barKm = core.ASTEROID_KEPLERIAN_ERROR_BAR_M / 1000;
const bodySummaries = [];

for (const asteroid of Object.values(catalog.asteroids)) {
  core.assertCanonicalState(asteroid.anchorState);
}

for (const expected of expectedAccuracy.asteroids) {
  const designation = expected.designation;
  const bodyId = `asteroid-${designation}`;
  const asteroid = catalog.asteroids[bodyId];
  assert.ok(asteroid, `Missing asteroid ${bodyId} from production fixture`);

  const truthPath = path.join(truthDir, `asteroid-${designation}-90d.json`);
  const truth = readJson(truthPath);
  const errorsKm = [];

  for (const sample of truth.samples) {
    const truthState = core.createCanonicalState({
      frame: core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds: core.jdTdbToSecondsSinceJ2000(sample.jdTdb),
      positionM: {
        x: sample.positionKm.x * 1000,
        y: sample.positionKm.y * 1000,
        z: sample.positionKm.z * 1000,
      },
      velocityMps: {
        x: sample.velocityKms.x * 1000,
        y: sample.velocityKms.y * 1000,
        z: sample.velocityKms.z * 1000,
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
  const errorAt90dKm = errorsKm[errorsKm.length - 1];
  const summary = {
    designation,
    name: expected.name,
    class: expected.class,
    H: expected.H,
    barKm,
    maxErrorKm,
    rmsErrorKm,
    errorAt90dKm,
    checkedPoints: errorsKm.length,
  };

  bodySummaries.push(summary);

  assert.ok(maxErrorKm <= barKm, `${designation} max error ${maxErrorKm} km exceeded ${barKm} km`);
  assert.ok(
    Math.abs(maxErrorKm - expected.max_error_km) <= 1e-6,
    `${designation} max_error_km drifted from pre-research: expected ${expected.max_error_km}, got ${maxErrorKm}`,
  );
  assert.ok(
    Math.abs(rmsErrorKm - expected.rms_error_km) <= 1e-6,
    `${designation} rms_error_km drifted from pre-research: expected ${expected.rms_error_km}, got ${rmsErrorKm}`,
  );
  assert.ok(
    Math.abs(errorAt90dKm - expected.error_at_90d_km) <= 1e-6,
    `${designation} error_at_90d_km drifted from pre-research: expected ${expected.error_at_90d_km}, got ${errorAt90dKm}`,
  );

  console.log(`PASS INV-012 ${formatBodySummary(designation, summary)}`);
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
console.log('Slice 7 per-body propagation summary:');
for (const summary of bodySummaries) {
  console.log(`  ${formatBodySummary(summary.designation, summary)}`);
}
console.log('');
console.log('Slice 7 cutover harness passed with zero runtime invariant violations.');
