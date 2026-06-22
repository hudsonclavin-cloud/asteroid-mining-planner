import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-colormap');

async function loadModule() {
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
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'colormap.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  return import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'colormap.js')).href);
}

test('c3ToViridisRgb returns anchor colors at key stops and clamps above the ceiling', async () => {
  const colormap = await loadModule();

  assert.deepEqual(colormap.c3ToViridisRgb(0), [68, 1, 84]);
  assert.deepEqual(colormap.c3ToViridisRgb(7.5), [59, 82, 139]);
  assert.deepEqual(colormap.c3ToViridisRgb(15), [33, 145, 140]);
  assert.deepEqual(colormap.c3ToViridisRgb(22.5), [94, 201, 98]);
  assert.deepEqual(colormap.c3ToViridisRgb(30), [253, 231, 37]);
  assert.deepEqual(colormap.c3ToViridisRgb(999), [253, 231, 37]);
});

test('colorForPorkchopCell uses sentinel colors for no_solution and stall', async () => {
  const colormap = await loadModule();

  assert.deepEqual(colormap.colorForPorkchopCell('no_solution', null), [36, 36, 42]);
  assert.deepEqual(colormap.colorForPorkchopCell('stall', null), [255, 0, 180]);
  assert.deepEqual(colormap.colorForPorkchopCell('ok', 0), [68, 1, 84]);
});
