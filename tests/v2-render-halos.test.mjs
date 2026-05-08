import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-halos');

function compileHalosModule() {
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
      path.join(repoRoot, 'src', 'v2', 'render', 'halos.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(
    result.status,
    0,
    `tsc compilation failed\n${result.stderr || result.stdout}`,
  );
}

let halosModulePromise;

async function loadHalosModule() {
  if (!halosModulePromise) {
    compileHalosModule();
    halosModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'render', 'halos.js')).href
    );
  }

  return halosModulePromise;
}

test('halo opacity stays at full base opacity below the full-visibility threshold', async () => {
  const {
    HALO_BASE_OPACITY,
    HALO_FULL_VISIBILITY_MAX_DIAMETER_PX,
    getHaloOpacityForApparentDiameterPx,
  } = await loadHalosModule();

  assert.equal(getHaloOpacityForApparentDiameterPx(1), HALO_BASE_OPACITY);
  assert.equal(
    getHaloOpacityForApparentDiameterPx(HALO_FULL_VISIBILITY_MAX_DIAMETER_PX),
    HALO_BASE_OPACITY,
  );
});

test('halo opacity fades linearly through the hysteresis transition zone', async () => {
  const {
    HALO_BASE_OPACITY,
    getHaloOpacityForApparentDiameterPx,
  } = await loadHalosModule();

  const opacityAtThreePx = getHaloOpacityForApparentDiameterPx(3);
  assert.ok(
    Math.abs(opacityAtThreePx - HALO_BASE_OPACITY * 0.4) <= 1e-12,
    `expected 40% of base opacity at 3 px, got ${opacityAtThreePx}`,
  );
});

test('halo opacity reaches zero at and above the invisible threshold', async () => {
  const {
    HALO_INVISIBLE_MIN_DIAMETER_PX,
    getHaloOpacityForApparentDiameterPx,
  } = await loadHalosModule();

  assert.equal(
    getHaloOpacityForApparentDiameterPx(HALO_INVISIBLE_MIN_DIAMETER_PX),
    0,
  );
  assert.equal(getHaloOpacityForApparentDiameterPx(5), 0);
});
