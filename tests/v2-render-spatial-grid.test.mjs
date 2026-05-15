import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-spatial-grid');
const slice8FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');

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
      path.join(repoRoot, 'src', 'v2', 'render', 'spatial-grid.ts'),
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
      import(pathToFileURL(path.join(tempOutDir, 'render', 'spatial-grid.js')).href),
      import('three'),
    ]).then(([grid, THREE]) => ({ grid, THREE }));
  }
  return modulePromise;
}

function loadFixture() {
  return JSON.parse(fs.readFileSync(slice8FixturePath, 'utf8'));
}

test('Vesta and Bennu anchor positions land in the measured 1 AU cells', async () => {
  const { grid, THREE } = await loadModules();
  const fixture = loadFixture();
  const vesta = fixture.asteroids['asteroid-4'];
  const bennu = fixture.asteroids['asteroid-101955'];

  const vestaIndex = grid.cellIndexForPositionKm(new THREE.Vector3(...vesta.anchor.positionKm));
  const bennuIndex = grid.cellIndexForPositionKm(new THREE.Vector3(...bennu.anchor.positionKm));

  assert.deepEqual(vestaIndex, { x: 2, y: -1, z: -1 });
  assert.deepEqual(bennuIndex, { x: -1, y: 0, z: 0 });
});

test('cellBoundsKmForIndex returns a 1 AU box anchored to the configured grid', async () => {
  const { grid } = await loadModules();
  const bounds = grid.cellBoundsKmForIndex({ x: 0, y: 0, z: 0 });
  const size = bounds.getSize(bounds.min.clone());
  const expectedCellSizeKm = grid.SPATIAL_GRID_CELL_SIZE_AU * 149_597_870.7;
  const expectedMinKm = 0;

  assert.ok(Math.abs(bounds.min.x - expectedMinKm) < 1e-6);
  assert.ok(Math.abs(bounds.min.y - expectedMinKm) < 1e-6);
  assert.ok(Math.abs(bounds.min.z - expectedMinKm) < 1e-6);
  assert.ok(Math.abs(size.x - expectedCellSizeKm) < 1e-6);
  assert.ok(Math.abs(size.y - expectedCellSizeKm) < 1e-6);
  assert.ok(Math.abs(size.z - expectedCellSizeKm) < 1e-6);
});

test('positions outside the ±28 AU cube return null', async () => {
  const { grid, THREE } = await loadModules();
  const outside = new THREE.Vector3(29 * 149_597_870.7, 0, 0);
  assert.equal(grid.cellIndexForPositionKm(outside), null);
});

test('cellIndexForPositionKm round-trips into a containing cell bounds box', async () => {
  const { grid, THREE } = await loadModules();
  const fixture = loadFixture();
  const apophis = fixture.asteroids['asteroid-99942'];
  const position = new THREE.Vector3(...apophis.anchor.positionKm);
  const index = grid.cellIndexForPositionKm(position);
  assert.ok(index, 'Apophis should remain inside the configured grid');
  const bounds = grid.cellBoundsKmForIndex(index);
  assert.equal(bounds.containsPoint(position), true);
});

test('iterateAllPossibleCells covers the full 56x56x56 grid', async () => {
  const { grid } = await loadModules();
  const allCells = [...grid.iterateAllPossibleCells()];
  assert.equal(allCells.length, 175_616);
  assert.deepEqual(allCells[0], { x: -28, y: -28, z: -28 });
  assert.deepEqual(allCells.at(-1), { x: 27, y: 27, z: 27 });
});

test('Slice 8 fixture occupies the measured ~178 cells at 1 AU resolution', async () => {
  const { grid, THREE } = await loadModules();
  const fixture = loadFixture();
  const occupied = new Set();

  for (const asteroid of Object.values(fixture.asteroids)) {
    const index = grid.cellIndexForPositionKm(new THREE.Vector3(...asteroid.anchor.positionKm));
    assert.ok(index, 'All Slice 8 asteroids should remain inside the configured grid');
    occupied.add(grid.cellKeyForIndex(index));
  }

  assert.ok(
    occupied.size >= 173 && occupied.size <= 183,
    `Expected occupied cell count near 178 at 1 AU resolution, received ${occupied.size}`,
  );
});
