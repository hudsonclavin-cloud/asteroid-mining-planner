import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lowthrust-types');

async function loadTypes() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext', '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'lowthrust', 'types.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  return import(pathToFileURL(path.join(tempOutDir, 'lowthrust', 'types.js')).href);
}

const engine = { name: 'test-ion', thrustN: 0.09, ispS: 3_000, powerW: 2_500 };

test('exhaust velocity and thrust acceleration follow Isp*g0 and F/m', async () => {
  const t = await loadTypes();
  assert.equal(t.STANDARD_GRAVITY_MPS2, 9.80665);
  assert.equal(t.exhaustVelocityMps(engine), 3_000 * 9.80665);
  assert.equal(t.thrustAccelerationMps2(engine, 1_000), 0.09 / 1_000);
  assert.throws(() => t.thrustAccelerationMps2(engine, 0), TypeError);
  assert.throws(() => t.exhaustVelocityMps({ ...engine, ispS: NaN }), TypeError);
});

test('validateLowThrustLeg accepts an ordered thrust/coast leg and names the first violation otherwise', async () => {
  const t = await loadTypes();
  const good = {
    departJD: 2_461_041.5,
    arriveJD: 2_461_441.5,
    segments: [
      { startJD: 2_461_041.5, endJD: 2_461_141.5, throttle: 1, direction: 'tangential' },
      { startJD: 2_461_141.5, endJD: 2_461_341.5, throttle: 0, direction: 'tangential' },
      { startJD: 2_461_341.5, endJD: 2_461_441.5, throttle: 0.5, direction: 'custom', vector: [1, 0, 0] },
    ],
  };
  assert.equal(t.validateLowThrustLeg(good), null);
  assert.match(t.validateLowThrustLeg({ ...good, arriveJD: good.departJD }), /precede/);
  assert.match(t.validateLowThrustLeg({ ...good, segments: [{ ...good.segments[0], throttle: 1.5 }] }), /throttle/);
  assert.match(t.validateLowThrustLeg({ ...good, segments: [{ ...good.segments[2], vector: undefined }] }), /custom/);
  assert.match(t.validateLowThrustLeg({ ...good, segments: [good.segments[1], good.segments[0]] }), /before the previous/);
  assert.match(t.validateLowThrustLeg({ ...good, segments: [{ ...good.segments[0], endJD: good.arriveJD + 1 }] }), /after the leg arrives/);
  assert.match(t.validateLowThrustLeg({ ...good, departJD: NaN }), /finite/);
});
