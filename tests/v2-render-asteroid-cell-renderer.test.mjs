import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-asteroid-cell-renderer');
const slice8FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');
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
      path.join(repoRoot, 'src', 'v2', 'render', 'spatial-grid.ts'),
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
      import(pathToFileURL(path.join(tempOutDir, 'render', 'spatial-grid.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
      import('three'),
    ]).then(([cellRenderer, grid, horizons, core, THREE]) => ({
      cellRenderer,
      grid,
      horizons,
      core,
      THREE,
    }));
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

function createMockAsteroid(core, designation, positionM, overrides = {}) {
  return {
    bodyId: `asteroid-${designation}`,
    bodyClass: 'asteroid',
    designation,
    spkId: overrides.spkId ?? (Number(designation.replace(/\D+/g, '')) || 1),
    name: null,
    class: overrides.class ?? 'MBA',
    isCuratedNea: overrides.isCuratedNea ?? false,
    neo: overrides.neo ?? false,
    pha: overrides.pha ?? false,
    H: overrides.H ?? 10,
    G: overrides.G ?? 0.15,
    estimatedRadiusM: overrides.estimatedRadiusM ?? 10_000,
    elementsFrame: core.FRAME_HELIO_J2000_ECLIPTIC,
    anchorState: core.createCanonicalState({
      frame: core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds: 0,
      positionM,
      velocityMps: { x: 0, y: 0, z: 0 },
      radiusM: overrides.estimatedRadiusM ?? 10_000,
    }),
    elements: {
      aM: Math.hypot(positionM.x, positionM.y, positionM.z),
      e: 0,
      iRad: 0,
      omRad: 0,
      wRad: 0,
      maRad: 0,
      epochTdbSeconds: 0,
    },
    eccentricityBand: 'A',
    hasOrbitLine: true,
  };
}

async function loadSlice8Bodies() {
  const { horizons } = await loadModules();
  const fixture = JSON.parse(fs.readFileSync(slice8FixturePath, 'utf8'));
  const catalog = horizons.ingestSlice8Fixture(fixture);
  return Object.values(catalog.asteroids);
}

test('construction distributes the Slice 8 catalog across the measured 1 AU cells', async () => {
  const { cellRenderer, grid, THREE } = await loadModules();
  const asteroids = await loadSlice8Bodies();
  const renderer = new cellRenderer.AsteroidCellRenderer(asteroids);
  const bodyIndexById = new Map(asteroids.map((asteroid, index) => [asteroid.bodyId, index]));

  const stats = renderer.getCellStats();
  const occupiedKeys = renderer.getOccupiedCellKeys();
  const totalBodies = occupiedKeys.reduce((sum, key) => sum + renderer.getCellAtKey(key).bodyIndices.length, 0);

  assert.ok(stats.occupiedCells >= 173 && stats.occupiedCells <= 183);
  assert.equal(stats.occupiedCells, occupiedKeys.length);
  assert.equal(totalBodies, 10_008);

  for (const bodyId of ['asteroid-4', 'asteroid-101955', 'asteroid-99942']) {
    const bodyIndex = bodyIndexById.get(bodyId);
    const asteroid = asteroids[bodyIndex];
    const cellIndex = grid.cellIndexForPositionKm(new THREE.Vector3(
      asteroid.anchorState.positionM.x / 1000,
      asteroid.anchorState.positionM.y / 1000,
      asteroid.anchorState.positionM.z / 1000,
    ));
    assert.ok(cellIndex, `${bodyId} should remain inside the configured grid`);
    const cell = renderer.getCellAtKey(grid.cellKeyForIndex(cellIndex));
    assert.ok(cell, `${bodyId} cell should exist`);
    assert.ok(cell.bodyIndices.includes(bodyIndex), `${bodyId} should be assigned to its measured cell`);
  }
});

test('off-axis outer-system view culls some occupied cells', async () => {
  const { cellRenderer, THREE } = await loadModules();
  const asteroids = await loadSlice8Bodies();
  const renderer = new cellRenderer.AsteroidCellRenderer(asteroids);
  const positions = createAnchorPositions(THREE, asteroids);
  renderer.setAnchorPositionM({ x: 0, y: 0, z: 0 });
  renderer.setInstancedBodyIndices(asteroids.map((_, index) => index));

  const camera = createCamera(
    THREE,
    new THREE.Vector3(0, 0, 4 * AU_M),
    new THREE.Vector3(2.8 * AU_M, 0, 0),
  );

  renderer.update(positions, camera, { width: 1600, height: 900 });
  const stats = renderer.getCellStats();

  assert.ok(stats.visibleCells > 0);
  assert.ok(stats.visibleCells < stats.occupiedCells);
  assert.ok(stats.visibleBodies > 0);
});

test('focused close-zoom keeps visible cells in a small local neighborhood', async () => {
  const { cellRenderer, THREE } = await loadModules();
  const asteroids = await loadSlice8Bodies();
  const renderer = new cellRenderer.AsteroidCellRenderer(asteroids);
  const positions = createAnchorPositions(THREE, asteroids);
  const vestaIndex = asteroids.findIndex((asteroid) => asteroid.bodyId === 'asteroid-4');
  const vesta = asteroids[vestaIndex];
  renderer.setAnchorPositionM(vesta.anchorState.positionM);
  renderer.setInstancedBodyIndices(asteroids.map((_, index) => index));

  const camera = createCamera(
    THREE,
    new THREE.Vector3(0, 0, 25_000_000),
    new THREE.Vector3(0, 0, 0),
  );

  renderer.update(positions, camera, { width: 1600, height: 900 });
  const stats = renderer.getCellStats();

  assert.ok(stats.visibleCells > 0);
  assert.ok(stats.visibleCells <= 14, `expected a tightly bounded close-zoom neighborhood, received ${stats.visibleCells} visible cells`);
});

test('cells near the frustum edge stay visible across a +/-0.5 degree camera sweep', async () => {
  const { cellRenderer, core, THREE } = await loadModules();
  const distanceM = 5 * AU_M;
  const edgeAngleDeg = 36.5;
  const theta = THREE.MathUtils.degToRad(edgeAngleDeg);
  const mockBodies = [
    createMockAsteroid(core, 'edge', {
      x: distanceM * Math.sin(theta),
      y: 0,
      z: distanceM * Math.cos(theta),
    }),
  ];
  const renderer = new cellRenderer.AsteroidCellRenderer(mockBodies);
  const positions = createAnchorPositions(THREE, mockBodies);
  renderer.setAnchorPositionM({ x: 0, y: 0, z: 0 });
  renderer.setInstancedBodyIndices([0]);

  for (const yawDeg of [-0.5, 0, 0.5]) {
    const yaw = THREE.MathUtils.degToRad(yawDeg);
    const camera = createCamera(
      THREE,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)),
    );
    renderer.update(positions, camera, { width: 1600, height: 900 });
    const stats = renderer.getCellStats();
    assert.equal(
      stats.visibleCells,
      1,
      `expected the edge cell to remain visible at yaw ${yawDeg} degrees`,
    );
  }
});

test('raycastIntersectCells returns null for misses, hits the expected body, and reassigns across cells after position changes', async () => {
  const { cellRenderer, grid, core, THREE } = await loadModules();
  const mockBodies = [
    createMockAsteroid(core, '1001', { x: 1.2 * AU_M, y: 0, z: 0 }),
    createMockAsteroid(core, '1002', { x: 2.4 * AU_M, y: 0.1 * AU_M, z: 0 }),
    createMockAsteroid(core, '1003', { x: -3.1 * AU_M, y: 0, z: 0.2 * AU_M }),
  ];
  const renderer = new cellRenderer.AsteroidCellRenderer(mockBodies);
  const positions = createAnchorPositions(THREE, mockBodies);
  renderer.setAnchorPositionM({ x: 0, y: 0, z: 0 });
  renderer.setInstancedBodyIndices([0, 1, 2]);

  const camera = createCamera(
    THREE,
    new THREE.Vector3(0, 0, 5 * AU_M),
    new THREE.Vector3(1.2 * AU_M, 0, 0),
  );

  renderer.update(positions, camera, { width: 1200, height: 800 });

  const miss = renderer.raycastIntersectCells(new THREE.Ray(
    camera.position.clone(),
    new THREE.Vector3(0, 1, 0).normalize(),
  ));
  assert.equal(miss, null);

  const hitDirection = positions[0].clone().sub(camera.position).normalize();
  const hit = renderer.raycastIntersectCells(new THREE.Ray(camera.position.clone(), hitDirection));
  assert.ok(hit);
  assert.equal(hit.bodyIndex, 0);

  const oldKey = grid.cellKeyForIndex(grid.cellIndexForPositionKm(new THREE.Vector3(
    positions[0].x / 1000,
    positions[0].y / 1000,
    positions[0].z / 1000,
  )));
  const movedPositions = positions.map((position) => position.clone());
  movedPositions[0] = new THREE.Vector3(5.1 * AU_M, 0, 0);

  for (let frame = 0; frame < 60; frame += 1) {
    renderer.update(movedPositions, camera, { width: 1200, height: 800 });
  }

  const newIndex = grid.cellIndexForPositionKm(new THREE.Vector3(
    movedPositions[0].x / 1000,
    movedPositions[0].y / 1000,
    movedPositions[0].z / 1000,
  ));
  assert.ok(newIndex);
  const newKey = grid.cellKeyForIndex(newIndex);
  assert.notEqual(newKey, oldKey);
  assert.ok(renderer.getCellAtKey(newKey).bodyIndices.includes(0));
  assert.ok(!renderer.getCellAtKey(oldKey)?.bodyIndices.includes(0));
});

test('rendered instanced position matches the propagated world position used for focus truth', async () => {
  const { cellRenderer, grid, THREE } = await loadModules();
  const asteroids = await loadSlice8Bodies();
  const renderer = new cellRenderer.AsteroidCellRenderer(asteroids);
  const positions = createAnchorPositions(THREE, asteroids);
  const bennuIndex = asteroids.findIndex((asteroid) => asteroid.bodyId === 'asteroid-101955');
  const bennu = asteroids[bennuIndex];
  renderer.setAnchorPositionM(bennu.anchorState.positionM);
  renderer.setInstancedBodyIndices(asteroids.map((_, index) => index));

  const camera = createCamera(
    THREE,
    new THREE.Vector3(0, 0, 15_000_000),
    new THREE.Vector3(0, 0, 0),
  );

  renderer.update(positions, camera, { width: 1200, height: 800 });

  const cellIndex = grid.cellIndexForPositionKm(new THREE.Vector3(
    bennu.anchorState.positionM.x / 1000,
    bennu.anchorState.positionM.y / 1000,
    bennu.anchorState.positionM.z / 1000,
  ));
  assert.ok(cellIndex);
  const cell = renderer.getCellAtKey(grid.cellKeyForIndex(cellIndex));
  const instanceId = cell.visibleBodyIndices.indexOf(bennuIndex);
  assert.ok(instanceId >= 0, 'Bennu should be visible in its occupied instanced cell');

  const matrix = new THREE.Matrix4();
  cell.mesh.getMatrixAt(instanceId, matrix);
  const renderedPosition = new THREE.Vector3().setFromMatrixPosition(matrix);
  const expectedWorldPosition = positions[bennuIndex].clone().sub(new THREE.Vector3(
    bennu.anchorState.positionM.x,
    bennu.anchorState.positionM.y,
    bennu.anchorState.positionM.z,
  ));

  assert.ok(renderedPosition.distanceTo(expectedWorldPosition) <= 1e-3);
});
