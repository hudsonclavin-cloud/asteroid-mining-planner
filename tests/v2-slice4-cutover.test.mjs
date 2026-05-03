// B1 — Slice 4 INV-010 Cutover Validation Harness
// Validates per-body Hermite interpolation error against INV-010 cutover bars,
// verifies HELIO <-> SATURN frame round-trip bounds, and ensures the runtime
// assertions already in place stay green across the validation window.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice4-cutover');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-saturn-system-90d.json');
const dataDir = path.join(repoRoot, 'tools', 'slice4-research', 'data');

const J2000_JD = 2451545.0;
const SECONDS_PER_DAY = 86400;

const BODY_CONFIG = {
  saturn: { truthFile: 'truth-saturn.json', barKm: 1 },
  titan: { truthFile: 'truth-titan.json', barKm: 20 },
  rhea: { truthFile: 'truth-rhea.json', barKm: 5 },
  iapetus: { truthFile: 'truth-iapetus.json', barKm: 2 },
  tethys: { truthFile: 'truth-15m-tethys.json', barKm: 1 },
  dione: { truthFile: 'truth-dione.json', barKm: 50 },
  mimas: { truthFile: 'truth-15m-mimas.json', barKm: 20 },
  enceladus: { truthFile: 'truth-15m-enceladus.json', barKm: 5 },
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

function loadTruthStates(core, bodyId, truthFile, frame) {
  const raw = readJson(path.join(dataDir, truthFile));
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

console.log('Compiling v2 core and boundary for Slice 4 cutover...');
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
const allStates = horizons.ingestSlice4Fixture(fixture);

for (const bodyId of Object.keys(BODY_CONFIG)) {
  for (const sample of allStates[bodyId]) {
    core.assertCanonicalState(sample.state);
  }
}

const bodySummaries = [];

for (const [bodyId, { truthFile, barKm }] of Object.entries(BODY_CONFIG)) {
  const fixtureStates = allStates[bodyId].map((sample) => sample.state);
  const truthStates = loadTruthStates(core, bodyId, truthFile, fixtureStates[0].frame);
  const minTdb = fixtureStates[0].tdbSeconds;
  const maxTdb = fixtureStates.at(-1).tdbSeconds;
  const errorsKm = [];

  for (const truthState of truthStates) {
    if (truthState.tdbSeconds < minTdb || truthState.tdbSeconds > maxTdb) {
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
  console.log(`PASS INV-010 ${formatBodySummary(bodyId, summary)}`);
  assert.ok(maxErrorKm <= barKm, `${bodyId} max error ${maxErrorKm} km exceeded ${barKm} km`);
}

const saturnSamples = allStates.saturn.map((sample) => sample.state);
const mimasSamples = allStates.mimas.map((sample) => sample.state);
const mimasTruthStates = loadTruthStates(core, 'mimas', BODY_CONFIG.mimas.truthFile, core.FRAME_SATURN_J2000_ICRF);

core.configureFrameTransformHooks({
  saturnHeliocentricStateProvider: buildInterpolatingProvider(saturnSamples, core.interpolateBodyState),
});

let maxRoundTripError = 0;
let maxChainTenError = 0;

for (const truthState of mimasTruthStates) {
  const tdbSeconds = truthState.tdbSeconds;
  if (tdbSeconds < mimasSamples[0].tdbSeconds || tdbSeconds > mimasSamples.at(-1).tdbSeconds) {
    continue;
  }

  const mimasSaturn = core.interpolateBodyStateSeries('mimas', mimasSamples, tdbSeconds);
  const mimasHelio = core.transformCanonicalState(
    mimasSaturn,
    core.FRAME_SATURN_J2000_ICRF,
    core.FRAME_HELIO_J2000_ICRF,
    tdbSeconds,
  );

  core.assertCanonicalState(mimasHelio);
  core.assertFrameRoundTrip(
    mimasHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_SATURN_J2000_ICRF,
    tdbSeconds,
  );

  const roundTripError = core.computeFrameRoundTripRelativeError(
    mimasHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_SATURN_J2000_ICRF,
    tdbSeconds,
  );
  const chainTenError = computeTenChainRelativeError(
    mimasHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_SATURN_J2000_ICRF,
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
console.log('Slice 4 per-body interpolation summary:');
for (const summary of bodySummaries) {
  console.log(`  ${formatBodySummary(summary.bodyId, summary)}`);
}
console.log('');
console.log('Slice 4 frame round-trip summary:');
console.log(`  one-pass max relative error = ${maxRoundTripError}`);
console.log(`  ten-chain max relative error = ${maxChainTenError}`);
console.log(`  one-pass bound = ${core.FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR}`);
console.log(`  ten-chain bound = ${core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR}`);
console.log('');
console.log('Slice 4 cutover harness passed with zero runtime invariant violations.');
