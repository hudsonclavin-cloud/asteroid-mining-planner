// B1 — Slice 6 INV-011 Cutover Validation Harness
// Validates per-body Hermite interpolation error against INV-011 cutover bars
// for Phobos and Deimos, carries Mars forward under INV-008, verifies
// HELIO <-> MARS frame round-trip bounds, and ensures the runtime assertions
// already in place stay green across the validation window.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice6-cutover');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-mars-system-90d.json');

const J2000_JD = 2451545.0;
const SECONDS_PER_DAY = 86400;

const BODY_CONFIG = {
  mars: {
    truthPath: path.join(repoRoot, 'tools', 'slice2-research', 'data', 'truth-mars.json'),
    barKm: 0.05,
    frameKey: 'helio',
  },
  phobos: {
    truthPath: path.join(repoRoot, 'tools', 'slice6-research', 'data', 'phobos-5m.json'),
    barKm: 5,
    frameKey: 'mars',
  },
  deimos: {
    truthPath: path.join(repoRoot, 'tools', 'slice6-research', 'data', 'deimos-15m.json'),
    barKm: 0.5,
    frameKey: 'mars',
  },
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function jdToTdbSeconds(jdTdb) {
  return (jdTdb - J2000_JD) * SECONDS_PER_DAY;
}

function computeRmsKm(errorsKm) {
  const meanSquare = errorsKm.reduce((sum, value) => sum + value * value, 0) / errorsKm.length;
  return Math.sqrt(meanSquare);
}

function sixAxisNorm(state) {
  return Math.hypot(
    state.positionM.x,
    state.positionM.y,
    state.positionM.z,
    state.velocityMps.x,
    state.velocityMps.y,
    state.velocityMps.z,
  );
}

function sixAxisDiffNorm(left, right) {
  return Math.hypot(
    left.positionM.x - right.positionM.x,
    left.positionM.y - right.positionM.y,
    left.positionM.z - right.positionM.z,
    left.velocityMps.x - right.velocityMps.x,
    left.velocityMps.y - right.velocityMps.y,
    left.velocityMps.z - right.velocityMps.z,
  );
}

function buildInterpolatingProvider(samples, interpolateBodyState) {
  const exact = new Map(samples.map((sample) => [sample.tdbSeconds, sample]));

  return (tdbSeconds) => {
    const exactSample = exact.get(tdbSeconds);
    if (exactSample) {
      return exactSample;
    }

    for (let i = 0; i < samples.length - 1; i++) {
      const s0 = samples[i];
      const s1 = samples[i + 1];
      if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
        return interpolateBodyState(s0, s1, tdbSeconds);
      }
    }

    throw new Error(`Missing bracketing anchor samples for tdbSeconds=${tdbSeconds}`);
  };
}

function computeTenChainRelativeError(state, fromFrame, toFrame, tdbSeconds, transformCanonicalState) {
  let current = state;
  for (let i = 0; i < 10; i++) {
    current = transformCanonicalState(current, fromFrame, toFrame, tdbSeconds);
    current = transformCanonicalState(current, toFrame, fromFrame, tdbSeconds);
  }
  return sixAxisDiffNorm(current, state) / Math.max(sixAxisNorm(state), 1);
}

function loadTruthStates(core, bodyId, truthPath, frame) {
  const raw = readJson(truthPath);
  return raw.samples.map((sample) =>
    core.createCanonicalState({
      frame,
      tdbSeconds: jdToTdbSeconds(sample.jdTdb),
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
      radiusM: core.BODY_CONSTANTS[bodyId].radiusM,
    }),
  );
}

function formatBodySummary(bodyId, summary) {
  return [
    bodyId.padEnd(9),
    `max=${summary.maxErrorKm.toFixed(6)} km`,
    `bar=${summary.barKm.toFixed(3)} km`,
    `rms=${summary.rmsErrorKm.toFixed(6)} km`,
    `checked=${summary.checkedPoints}`,
  ].join('  ');
}

console.log('Compiling v2 core and boundary for Slice 6 cutover...');
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
const allStates = horizons.ingestSlice6Fixture(fixture);

for (const bodyId of Object.keys(BODY_CONFIG)) {
  for (const sample of allStates[bodyId]) {
    core.assertCanonicalState(sample.state);
  }
}

const frames = {
  helio: core.FRAME_HELIO_J2000_ICRF,
  mars: core.FRAME_MARS_J2000_ICRF,
};

const bodySummaries = [];

for (const [bodyId, { truthPath, barKm, frameKey }] of Object.entries(BODY_CONFIG)) {
  const fixtureStates = allStates[bodyId].map((sample) => sample.state);
  const truthStates = loadTruthStates(core, bodyId, truthPath, frames[frameKey]);
  const minTdb = fixtureStates[0].tdbSeconds;
  const maxTdb = fixtureStates.at(-1).tdbSeconds;
  const fixtureTimes = new Set(fixtureStates.map((state) => state.tdbSeconds));
  const errorsKm = [];

  for (const truthState of truthStates) {
    if (truthState.tdbSeconds <= minTdb || truthState.tdbSeconds >= maxTdb) {
      continue;
    }
    if (fixtureTimes.has(truthState.tdbSeconds)) {
      continue;
    }

    core.assertCanonicalState(truthState);

    const estimate = core.interpolateBodyStateSeries(bodyId, fixtureStates, truthState.tdbSeconds);
    core.assertCanonicalState(estimate);
    core.assertInterpolationError(estimate, truthState, bodyId);

    const dx = estimate.positionM.x - truthState.positionM.x;
    const dy = estimate.positionM.y - truthState.positionM.y;
    const dz = estimate.positionM.z - truthState.positionM.z;
    errorsKm.push(Math.sqrt(dx * dx + dy * dy + dz * dz) / 1000);
  }

  const maxErrorKm = Math.max(...errorsKm);
  const rmsErrorKm = computeRmsKm(errorsKm);
  const summary = {
    bodyId,
    barKm,
    maxErrorKm,
    rmsErrorKm,
    checkedPoints: errorsKm.length,
  };
  bodySummaries.push(summary);
  console.log(`PASS ${bodyId === 'mars' ? 'INV-008' : 'INV-011'} ${formatBodySummary(bodyId, summary)}`);
  assert.ok(maxErrorKm <= barKm, `${bodyId} max error ${maxErrorKm} km exceeded ${barKm} km`);
}

const marsSamples = allStates.mars.map((sample) => sample.state);
const phobosSamples = allStates.phobos.map((sample) => sample.state);
const phobosTruthStates = loadTruthStates(
  core,
  'phobos',
  BODY_CONFIG.phobos.truthPath,
  core.FRAME_MARS_J2000_ICRF,
);

core.configureFrameTransformHooks({
  marsHeliocentricStateProvider: buildInterpolatingProvider(marsSamples, core.interpolateBodyState),
});

let maxRoundTripError = 0;
let maxChainTenError = 0;

for (const truthState of phobosTruthStates) {
  const tdbSeconds = truthState.tdbSeconds;
  if (tdbSeconds < phobosSamples[0].tdbSeconds || tdbSeconds > phobosSamples.at(-1).tdbSeconds) {
    continue;
  }

  const phobosMars = core.interpolateBodyStateSeries('phobos', phobosSamples, tdbSeconds);
  const phobosHelio = core.transformCanonicalState(
    phobosMars,
    core.FRAME_MARS_J2000_ICRF,
    core.FRAME_HELIO_J2000_ICRF,
    tdbSeconds,
  );

  core.assertCanonicalState(phobosHelio);
  core.assertFrameRoundTrip(
    phobosHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_MARS_J2000_ICRF,
    tdbSeconds,
  );

  const roundTripError = core.computeFrameRoundTripRelativeError(
    phobosHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_MARS_J2000_ICRF,
    tdbSeconds,
  );
  const chainTenError = computeTenChainRelativeError(
    phobosHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_MARS_J2000_ICRF,
    tdbSeconds,
    core.transformCanonicalState,
  );

  maxRoundTripError = Math.max(maxRoundTripError, roundTripError);
  maxChainTenError = Math.max(maxChainTenError, chainTenError);

  assert.ok(
    chainTenError < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR,
    `ten-chain relative error ${chainTenError} exceeded ${core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR}`,
  );
}

core.resetFrameTransformHooks();
core.resetInvariantRuntime();

assert.equal(
  violations.length,
  0,
  `runtime invariant violations detected:\n${violations
    .map((violation) => `${violation.invariantId} ${violation.message} ${JSON.stringify(violation.details ?? {})}`)
    .join('\n')}`,
);

console.log('');
console.log('Slice 6 per-body interpolation summary:');
for (const summary of bodySummaries) {
  console.log(`  ${formatBodySummary(summary.bodyId, summary)}`);
}
console.log('');
console.log('Slice 6 frame round-trip summary:');
console.log(`  one-pass max relative error = ${maxRoundTripError}`);
console.log(`  ten-chain max relative error = ${maxChainTenError}`);
console.log(`  one-pass bound = ${core.FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR}`);
console.log(`  ten-chain bound = ${core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR}`);
console.log('');
console.log('Slice 6 cutover harness passed with zero runtime invariant violations.');
