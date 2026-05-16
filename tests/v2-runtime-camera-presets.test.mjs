import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-runtime-camera-presets');

function compileRuntimeModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const result = spawnSync(
    tscBin,
    [
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
      path.join(repoRoot, 'src', 'v2', 'render', 'camera-tween.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let modulePromise;

async function loadModules() {
  if (!modulePromise) {
    compileRuntimeModule();
    modulePromise = Promise.all([
      import(pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'render', 'camera-tween.js')).href),
    ]).then(([runtime, tween]) => ({ runtime, tween }));
  }

  return modulePromise;
}

test('pressing t resolves to the top-down preset with the expected final orbit state', async () => {
  const { runtime } = await loadModules();
  const preset = runtime.getCameraPresetForKey('t');

  assert.ok(preset);
  assert.equal(preset.key, runtime.TOP_DOWN_PRESET_KEY);
  assert.equal(preset.focusBody, 'sun');
  assert.equal(preset.orbitState.polarRad, runtime.TOP_DOWN_ORBIT_POLAR_RAD);
  assert.equal(preset.orbitState.azimuthRad, runtime.TOP_DOWN_ORBIT_AZIMUTH_RAD);
  assert.equal(preset.orbitState.radiusM, runtime.TOP_DOWN_ORBIT_RADIUS_M);
  assert.equal(preset.durationMs, runtime.TOP_DOWN_PRESET_DURATION_MS);
});

test('camera tween locks controls during animation and releases them on completion', async () => {
  const { runtime, tween } = await loadModules();
  const preset = runtime.getCameraPresetForKey('t');
  assert.ok(preset);

  const orbitTween = {
    from: { radiusM: 7 * 149_597_870_700, polarRad: Math.PI / 3, azimuthRad: 0.5 },
    to: preset.orbitState,
    startMs: 100,
    durationMs: preset.durationMs,
  };

  assert.equal(runtime.isCameraControlsLocked(orbitTween, 100), true);
  assert.equal(runtime.isCameraControlsLocked(orbitTween, 599), true);
  assert.equal(runtime.isCameraControlsLocked(orbitTween, 1_100), false);

  const finalSample = tween.sampleCameraOrbitTween(orbitTween, 1_100);
  assert.ok(finalSample.completed);
  assert.ok(Math.abs(finalSample.state.polarRad - runtime.TOP_DOWN_ORBIT_POLAR_RAD) < 1e-9);
  assert.ok(finalSample.state.polarRad <= 0.05);
  assert.ok(Math.abs(finalSample.state.radiusM - runtime.TOP_DOWN_ORBIT_RADIUS_M) < 1e-3);
});

test('existing regression shortcuts remain intact while t is no longer mapped to Titan focus', async () => {
  const { runtime } = await loadModules();

  assert.equal(runtime.getCameraPresetForKey('='), null);
  assert.equal(runtime.getCameraPresetForKey('m'), null);
  assert.equal(runtime.getCameraPresetForKey('s'), null);
  assert.equal(runtime.getCameraPresetForKey('7'), null);
  assert.equal(runtime.getCameraPresetForKey('4'), null);

  const source = fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'), 'utf8');
  assert.ok(source.includes("m: 'mars'"));
  assert.ok(source.includes("s: 'saturn'"));
  assert.ok(source.includes("'7': 'jupiter'"));
  assert.ok(source.includes("'4': 'earth'"));
  assert.ok(!source.includes("t: 'titan'"));
});
