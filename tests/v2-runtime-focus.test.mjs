import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-runtime-focus');

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
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(
    result.status,
    0,
    `tsc compilation failed\n${result.stderr || result.stdout}`,
  );
}

let runtimeModulePromise;

async function loadRuntimeModule() {
  if (!runtimeModulePromise) {
    compileRuntimeModule();
    runtimeModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href
    );
  }

  return runtimeModulePromise;
}

test('focus from overview snaps to the target default radius', async () => {
  const { resolveFocusOrbitRadius } = await loadRuntimeModule();

  assert.equal(
    resolveFocusOrbitRadius('outer-system-overview', 'phobos', 7 * 149_597_870_700),
    413_000,
  );
  assert.equal(
    resolveFocusOrbitRadius('outer-system-overview', 'mars', 7 * 149_597_870_700),
    60_000_000,
  );
});

test('cross-body focus snaps to the new target default radius', async () => {
  const { resolveFocusOrbitRadius } = await loadRuntimeModule();

  assert.equal(resolveFocusOrbitRadius('mars', 'phobos', 60_000_000), 413_000);
  assert.equal(resolveFocusOrbitRadius('mars', 'deimos', 60_000_000), 407_800);
  assert.equal(resolveFocusOrbitRadius('phobos', 'mars', 413_000), 60_000_000);
});

test('re-focusing the same body preserves the current zoom radius', async () => {
  const { resolveFocusOrbitRadius } = await loadRuntimeModule();

  assert.equal(resolveFocusOrbitRadius('mars', 'mars', 12_345_678), 12_345_678);
  assert.equal(resolveFocusOrbitRadius('phobos', 'phobos', 987_654), 987_654);
});

test('asteroid focus uses the documented non-edge-on polar default', async () => {
  const { ASTEROID_FOCUS_ORBIT_POLAR_RAD } = await loadRuntimeModule();

  assert.equal(ASTEROID_FOCUS_ORBIT_POLAR_RAD, Math.PI / 3);
});

test('asteroid focus radius uses the honest-scale default radius rule', async () => {
  const { getDefaultAsteroidFocusRadius, resolveFocusOrbitRadius } = await loadRuntimeModule();

  assert.equal(getDefaultAsteroidFocusRadius(1_000), 5_000);
  assert.equal(getDefaultAsteroidFocusRadius(50_000), 250_000);
  assert.equal(
    resolveFocusOrbitRadius('outer-system-overview', 'asteroid-101955', 7 * 149_597_870_700, {
      estimatedRadiusM: 1_000,
    }),
    5_000,
  );
});
