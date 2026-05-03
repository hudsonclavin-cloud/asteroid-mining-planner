import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-hermite');

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
  ],
  { cwd: repoRoot, encoding: 'utf8' }
);

if (tscResult.status !== 0) {
  console.error('FAIL tsc compilation');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}
console.log('PASS tsc compilation');

const { interpolateBodyState } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'interpolators', 'hermite.js')).href
);
const { assertInterpolationError } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'invariants', 'assertions.js')).href
);
const { AssertError, configureInvariantRuntime, resetInvariantRuntime } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'invariants', 'runtime.js')).href
);
const { FRAME_HELIO_J2000_ICRF } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'frames', 'ids.js')).href
);
const { createCanonicalState } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href
);

const FRAME = FRAME_HELIO_J2000_ICRF;

let failures = 0;

function pass(label) { console.log(`PASS ${label}`); }
function fail(label, detail) { console.error(`FAIL ${label}${detail ? ': ' + detail : ''}`); failures++; }
function assert(cond, label, detail) { cond ? pass(label) : fail(label, detail); }

// Synthetic samples 86400 s apart (one day)
const DT = 86400;
const s0 = {
  positionM: { x: 1e11, y: 2e11, z: 3e10 },
  velocityMps: { x: 1000, y: -500, z: 200 },
  frame: FRAME,
  tdbSeconds: 0,
};
const s1 = {
  positionM: {
    x: s0.positionM.x + s0.velocityMps.x * DT,
    y: s0.positionM.y + s0.velocityMps.y * DT,
    z: s0.positionM.z + s0.velocityMps.z * DT,
  },
  velocityMps: { x: 1000, y: -500, z: 200 },
  frame: FRAME,
  tdbSeconds: DT,
};

// Test 1: interpolate at t0 returns s0.positionM exactly
{
  const r = interpolateBodyState(s0, s1, s0.tdbSeconds);
  const dx = Math.abs(r.positionM.x - s0.positionM.x);
  const dy = Math.abs(r.positionM.y - s0.positionM.y);
  const dz = Math.abs(r.positionM.z - s0.positionM.z);
  const mag = Math.sqrt(s0.positionM.x**2 + s0.positionM.y**2 + s0.positionM.z**2);
  const relErr = Math.sqrt(dx*dx + dy*dy + dz*dz) / mag;
  assert(relErr < 1e-9, 'interpolate at t0 returns s0 position (rel err < 1e-9)', `relErr=${relErr}`);
}

// Test 2: interpolate at t1 returns s1.positionM exactly
{
  const r = interpolateBodyState(s0, s1, s1.tdbSeconds);
  const dx = Math.abs(r.positionM.x - s1.positionM.x);
  const dy = Math.abs(r.positionM.y - s1.positionM.y);
  const dz = Math.abs(r.positionM.z - s1.positionM.z);
  const mag = Math.sqrt(s1.positionM.x**2 + s1.positionM.y**2 + s1.positionM.z**2);
  const relErr = Math.sqrt(dx*dx + dy*dy + dz*dz) / mag;
  assert(relErr < 1e-9, 'interpolate at t1 returns s1 position (rel err < 1e-9)', `relErr=${relErr}`);
}

// Test 3: interpolate at midpoint produces valid finite result
{
  const r = interpolateBodyState(s0, s1, DT / 2);
  const finite = Number.isFinite(r.positionM.x) && Number.isFinite(r.positionM.y) && Number.isFinite(r.positionM.z);
  assert(finite, 'interpolate at midpoint returns finite position');
}

// Test 4: assertInterpolationError throws for Earth error > 500 m
{
  configureInvariantRuntime({ mode: 'throw' });
  const estimate = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 0,
    positionM: { x: 1000, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  const truth = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 0,
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  let error = null;
  try {
    assertInterpolationError(estimate, truth, 'earth');
  } catch (e) {
    error = e;
  }
  assert(error instanceof AssertError, 'assertInterpolationError throws AssertError for Earth error 1000 m (> 500 m bar)');
  assert(error?.invariantId === 'INV-008', 'Earth interpolation overflow routes to INV-008', `got ${error?.invariantId}`);
  resetInvariantRuntime();
}

// Test 5: assertInterpolationError passes for Earth error < 500 m
{
  configureInvariantRuntime({ mode: 'throw' });
  const estimate = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 0,
    positionM: { x: 100, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  const truth = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 0,
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  let threw = false;
  try {
    assertInterpolationError(estimate, truth, 'earth');
  } catch (e) {
    threw = true;
  }
  assert(!threw, 'assertInterpolationError does not throw for Earth error 100 m (< 500 m bar)');
  resetInvariantRuntime();
}

// Test 6: assertInterpolationError throws for Tethys error > 1 km and routes to INV-010.
{
  configureInvariantRuntime({ mode: 'throw' });
  const estimate = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 0,
    positionM: { x: 1_100, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  const truth = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 0,
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  let error = null;
  try {
    assertInterpolationError(estimate, truth, 'tethys');
  } catch (e) {
    error = e;
  }
  assert(error instanceof AssertError, 'assertInterpolationError throws AssertError for Tethys error 1100 m (> 1 km bar)');
  assert(error?.invariantId === 'INV-010', 'Tethys interpolation overflow routes to INV-010', `got ${error?.invariantId}`);
  assert(error?.details?.bodyId === 'tethys', 'Tethys overflow includes bodyId detail', `got ${JSON.stringify(error?.details)}`);
  assert(error?.details?.measuredErrorKm === 1.1, 'Tethys overflow includes measuredErrorKm detail', `got ${JSON.stringify(error?.details)}`);
  assert(error?.details?.barKm === 1, 'Tethys overflow includes barKm detail', `got ${JSON.stringify(error?.details)}`);
  assert(error?.details?.expectedCadenceSeconds === 3600, 'Tethys overflow includes cadence from constants', `got ${JSON.stringify(error?.details)}`);
  resetInvariantRuntime();
}

// Test 7: assertInterpolationError reports INV-010 violations in report mode without throwing.
{
  const violations = [];
  configureInvariantRuntime({
    mode: 'report',
    onViolation(violation) {
      violations.push(violation);
    },
  });
  const estimate = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 123,
    positionM: { x: 6_000, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });
  const truth = createCanonicalState({
    frame: FRAME,
    tdbSeconds: 123,
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
  });

  let threw = false;
  try {
    assertInterpolationError(estimate, truth, 'enceladus');
  } catch (e) {
    threw = true;
  }

  assert(!threw, 'assertInterpolationError does not throw in report mode for Enceladus overflow');
  assert(violations.length === 1, 'assertInterpolationError emits one report-mode violation for Enceladus overflow', `got ${violations.length}`);
  assert(violations[0]?.invariantId === 'INV-010', 'Report-mode Enceladus overflow routes to INV-010', `got ${violations[0]?.invariantId}`);
  assert(violations[0]?.details?.bodyId === 'enceladus', 'Report-mode Enceladus overflow includes bodyId detail', `got ${JSON.stringify(violations[0]?.details)}`);
  assert(violations[0]?.details?.measuredErrorKm === 6, 'Report-mode Enceladus overflow includes measuredErrorKm detail', `got ${JSON.stringify(violations[0]?.details)}`);
  assert(violations[0]?.details?.barKm === 5, 'Report-mode Enceladus overflow includes barKm detail', `got ${JSON.stringify(violations[0]?.details)}`);
  assert(violations[0]?.details?.tdbSeconds === 123, 'Report-mode Enceladus overflow includes tdbSeconds detail', `got ${JSON.stringify(violations[0]?.details)}`);
  assert(violations[0]?.details?.expectedCadenceSeconds === 3600, 'Report-mode Enceladus overflow includes cadence from constants', `got ${JSON.stringify(violations[0]?.details)}`);
  resetInvariantRuntime();
}

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll assertions passed.');
}
