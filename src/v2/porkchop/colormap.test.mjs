import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-colormap');

function normalizeC3ForTest(c3Km2S2, min, max) {
  const c3ClampedToFloor = Math.max(c3Km2S2, min);
  const normalized =
    (Math.log(c3ClampedToFloor) - Math.log(min)) / (Math.log(max) - Math.log(min));
  if (normalized <= 0) {
    return 0;
  }
  if (normalized >= 1) {
    return 1;
  }
  return normalized;
}

async function loadModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(
    process.execPath,
    [
      tscBin,
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'colormap.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  return import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'colormap.js')).href);
}

test('c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling', async () => {
  const colormap = await loadModule();

  assert.deepEqual(colormap.c3ToViridisRgb(0.5), [68, 1, 84]);
  assert.deepEqual(colormap.c3ToViridisRgb(8.78), [52, 98, 139]);
  assert.deepEqual(colormap.c3ToViridisRgb(30), [34, 143, 140]);
  assert.deepEqual(colormap.c3ToViridisRgb(69.5), [61, 171, 121]);
  assert.deepEqual(colormap.c3ToViridisRgb(300), [142, 210, 80]);
  assert.deepEqual(colormap.c3ToViridisRgb(1500), [253, 231, 37]);
});

test('c3ToViridisRgb uses monotonic log normalization with a hard floor at C3 <= 1', async () => {
  const colormap = await loadModule();
  const samples = [0.5, 1, 8.78, 30, 69.5, 300, 1000, 1500];
  const normalized = samples.map((c3) =>
    normalizeC3ForTest(c3, colormap.C3_COLOR_MIN, colormap.C3_COLOR_MAX),
  );

  assert.deepEqual(colormap.c3ToViridisRgb(0.5), colormap.c3ToViridisRgb(1));
  assert.equal(normalized[0], 0);
  assert.equal(normalized[1], 0);
  assert.ok(normalized.every((t) => !Number.isNaN(t)));
  for (let index = 1; index < normalized.length; index += 1) {
    assert.ok(normalized[index] >= normalized[index - 1]);
  }
});

test('colorForPorkchopCell uses sentinel colors for no_solution and stall', async () => {
  const colormap = await loadModule();

  assert.deepEqual(colormap.colorForPorkchopCell('no_solution', null), [36, 36, 42]);
  assert.deepEqual(colormap.colorForPorkchopCell('stall', null), [255, 0, 180]);
  assert.deepEqual(colormap.colorForPorkchopCell('ok', 0), [68, 1, 84]);
});
