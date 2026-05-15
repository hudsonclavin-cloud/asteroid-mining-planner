import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice8-performance');
const slice8FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');
const slice7ExpectedAccuracyPath = path.join(
  repoRoot,
  'tools',
  'slice7-research',
  'data',
  'keplerian-accuracy-anchored.json',
);
const AU_M = 149_597_870_700;

function compileModules() {
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
      path.join(repoRoot, 'src', 'v2', 'render', 'asteroid-cell-renderer.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let modulePromise;

async function loadModules() {
  if (!modulePromise) {
    compileModules();
    modulePromise = Promise.all([
      import(pathToFileURL(path.join(tempOutDir, 'render', 'asteroid-cell-renderer.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
      import('three'),
    ]).then(([cellRenderer, horizons, THREE]) => ({ cellRenderer, horizons, THREE }));
  }
  return modulePromise;
}

function createAnchorPositions(THREE, asteroids) {
  return asteroids.map((asteroid) => new THREE.Vector3(
    asteroid.anchorState.positionM.x,
    asteroid.anchorState.positionM.y,
    asteroid.anchorState.positionM.z,
  ));
}

function createCamera(THREE, position, lookAt, aspect = 16 / 9) {
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 1e15);
  camera.position.copy(position);
  camera.lookAt(lookAt);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

function visibleSlice7RegressionBodies(renderer, asteroids, regressionBodyIds) {
  const visible = new Set();
  for (const key of renderer.getOccupiedCellKeys()) {
    const cell = renderer.getCellAtKey(key);
    for (const bodyIndex of cell.visibleBodyIndices) {
      visible.add(asteroids[bodyIndex].bodyId);
    }
  }
  return regressionBodyIds.filter((bodyId) => visible.has(bodyId));
}

test('Slice 8 cell culling architecture produces sane visibility counts across key camera scenarios', async () => {
  const { cellRenderer, horizons, THREE } = await loadModules();
  const fixture = JSON.parse(fs.readFileSync(slice8FixturePath, 'utf8'));
  const catalog = horizons.ingestSlice8Fixture(fixture);
  const asteroids = Object.values(catalog.asteroids);
  const renderer = new cellRenderer.AsteroidCellRenderer(asteroids);
  const positions = createAnchorPositions(THREE, asteroids);
  const regressionBodyIds = JSON.parse(fs.readFileSync(slice7ExpectedAccuracyPath, 'utf8'))
    .asteroids
    .map((body) => `asteroid-${body.designation}`);

  renderer.setInstancedBodyIndices(asteroids.map((_, index) => index));

  const scenarios = [
    {
      name: 'outer-system-overview',
      anchorPositionM: { x: 0, y: 0, z: 0 },
      camera: createCamera(
        THREE,
        new THREE.Vector3(0, 0, 4 * AU_M),
        new THREE.Vector3(2.8 * AU_M, 0, 0),
      ),
      maxVisibleRatio: 0.6,
      maxVisibleCells: null,
    },
    {
      name: 'asteroid-belt-focus',
      anchorPositionM: { x: 0, y: 0, z: 0 },
      camera: createCamera(
        THREE,
        new THREE.Vector3(0, 0, 2.8 * AU_M),
        new THREE.Vector3(2.8 * AU_M, 0, 0),
      ),
      maxVisibleRatio: null,
      maxVisibleCells: null,
    },
    {
      name: 'focused-vesta-close-zoom',
      anchorPositionM: asteroids.find((asteroid) => asteroid.bodyId === 'asteroid-4').anchorState.positionM,
      camera: createCamera(
        THREE,
        new THREE.Vector3(0, 0, 10_000_000),
        new THREE.Vector3(0, 0, 0),
      ),
      maxVisibleRatio: null,
      maxVisibleCells: 12,
    },
  ];

  for (const scenario of scenarios) {
    renderer.setAnchorPositionM(scenario.anchorPositionM);
    renderer.update(positions, scenario.camera, { width: 1600, height: 900 });
    const stats = renderer.getCellStats();
    const visibleRegressionBodies = visibleSlice7RegressionBodies(renderer, asteroids, regressionBodyIds);
    const estimatedGpuDrawCount = stats.visibleCells;
    console.log(
      `[slice8-performance] ${scenario.name} bodies=${asteroids.length} occupiedCells=${stats.occupiedCells} visibleCells=${stats.visibleCells} visibleBodies=${stats.visibleBodies} estimatedGpuDrawCount=${estimatedGpuDrawCount} visibleSlice7RegressionBodies=${visibleRegressionBodies.length}`,
    );

    assert.ok(stats.visibleBodies > 0, `${scenario.name} should render some asteroid instances`);
    assert.ok(stats.visibleCells > 0, `${scenario.name} should keep at least one occupied cell visible`);
    if (scenario.maxVisibleRatio !== null) {
      assert.ok(
        stats.visibleCells / stats.occupiedCells < scenario.maxVisibleRatio,
        `${scenario.name} visibleCells/occupiedCells ratio was ${stats.visibleCells / stats.occupiedCells}, expected < ${scenario.maxVisibleRatio}`,
      );
    }
    if (scenario.maxVisibleCells !== null) {
      assert.ok(
        stats.visibleCells <= scenario.maxVisibleCells,
        `${scenario.name} should stay within ${scenario.maxVisibleCells} visible cells, received ${stats.visibleCells}`,
      );
    }
  }
});
