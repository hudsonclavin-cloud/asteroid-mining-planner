import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-saturn-oblate');

function compileRenderHelper() {
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
      path.join(repoRoot, 'src', 'v2', 'render', 'saturn-oblate.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(
    result.status,
    0,
    `tsc compilation failed\n${result.stderr || result.stdout}`,
  );
}

function radiusFromExtent(min, max) {
  return (max - min) / 2;
}

test('Saturn oblate mesh extents match documented radii', async () => {
  compileRenderHelper();

  const THREE = await import('three');
  const module = await import(
    pathToFileURL(path.join(tempOutDir, 'render', 'saturn-oblate.js')).href
  );

  const {
    createSaturnOblateMesh,
    SATURN_EQUATORIAL_RADIUS_M,
    SATURN_POLAR_RADIUS_M,
    SATURN_POLAR_SCALE,
  } = module;

  const mesh = createSaturnOblateMesh();
  mesh.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(mesh);
  const xRadius = radiusFromExtent(bounds.min.x, bounds.max.x);
  const yRadius = radiusFromExtent(bounds.min.y, bounds.max.y);
  const zRadius = radiusFromExtent(bounds.min.z, bounds.max.z);
  const toleranceM = 1e-3;

  assert.ok(Math.abs(SATURN_POLAR_SCALE - (54364 / 60268)) <= 1e-12);
  assert.ok(Math.abs(xRadius - SATURN_EQUATORIAL_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(zRadius - SATURN_EQUATORIAL_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(yRadius - SATURN_POLAR_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(xRadius - 60_268_000.0) <= toleranceM);
  assert.ok(Math.abs(yRadius - 54_364_000.0) <= toleranceM);
  assert.ok(Math.abs(zRadius - 60_268_000.0) <= toleranceM);
});
