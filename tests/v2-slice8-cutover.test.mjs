import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  buildSlice8CutoverSample,
  INV013_BARS_KM,
  SLICE8_CUTOVER_PER_BAND_COUNT,
} from '../tools/slice8-ingestion/slice8-cutover-sample.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice8-cutover');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');
const truthPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'slice8-cutover-truth.json');
const slice7ExpectedAccuracyPath = path.join(
  repoRoot,
  'tools',
  'slice7-research',
  'data',
  'keplerian-accuracy-anchored.json',
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function computeRmsKm(errorsKm) {
  const meanSquare = errorsKm.reduce((sum, value) => sum + value * value, 0) / errorsKm.length;
  return Math.sqrt(meanSquare);
}

function formatBandSummary(band, summary) {
  return `${band} count=${summary.count} max=${summary.maxErrorKm.toFixed(6)} km bar=${summary.barKm.toFixed(6)} km rms=${summary.rmsErrorKm.toFixed(6)} km`;
}

function createPerspectiveCamera(THREE, position, lookAt, aspect = 16 / 9) {
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 1e15);
  camera.position.copy(position);
  camera.lookAt(lookAt);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

function cameraDistanceForDiameterPx(radiusM, targetDiameterPx, viewportHeightPx, fovRad) {
  const angularDiameter = targetDiameterPx * (fovRad / viewportHeightPx);
  return radiusM / Math.tan(angularDiameter / 2);
}

function buildSingleAsteroidRendererAtDiameter({
  asteroid,
  catalogBodies = [asteroid],
  targetDiameterPx,
  focused = false,
  viewport = { width: 1280, height: 720 },
}) {
  const asteroidRenderer = new render.AsteroidRenderer(catalogBodies);
  const camera = new THREE.PerspectiveCamera(45, viewport.width / viewport.height, 1, 1e15);
  const distance = cameraDistanceForDiameterPx(
    asteroid.estimatedRadiusM,
    targetDiameterPx,
    viewport.height,
    (camera.fov * Math.PI) / 180,
  );
  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  asteroidRenderer.setFocusedAsteroid(focused ? asteroid.bodyId : null);
  asteroidRenderer.update({
    anchorPositionM: asteroid.anchorState.positionM,
    camera,
    tdbSeconds: asteroid.elements.epochTdbSeconds,
    viewport,
  });
  return { asteroidRenderer, camera };
}

console.log('Compiling v2 core and boundary for Slice 8 cutover...');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
const tscResult = spawnSync(
  tscBin,
  [
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
    path.join(repoRoot, 'src', 'v2', 'render', 'index.ts'),
    path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);

if (tscResult.status !== 0) {
  console.error('FAIL tsc compilation');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}
console.log('PASS tsc compilation\n');

assert.ok(fs.existsSync(truthPath), `Missing Slice 8 truth cache at ${truthPath}. Run node tools/slice8-ingestion/fetch-cutover-truth.mjs first.`);

const [core, horizons, render, runtime, THREE] = await Promise.all([
  import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
  import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
  import(pathToFileURL(path.join(tempOutDir, 'render', 'index.js')).href),
  import(pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href),
  import('three'),
]);

const fixture = readJson(fixturePath);
const truth = readJson(truthPath);
const catalog = horizons.ingestSlice8Fixture(fixture);
const asteroidBodies = Object.values(catalog.asteroids);
const sample = buildSlice8CutoverSample(fixture.asteroids);
const truthByBodyId = new Map((truth.bodies ?? []).map((body) => [body.bodyId, body]));
const expectedSlice7 = readJson(slice7ExpectedAccuracyPath);

assert.equal(sample.flat.length, SLICE8_CUTOVER_PER_BAND_COUNT * 4, 'Slice 8 cutover sample should contain 200 bodies');
assert.equal(truth.bodies.length, sample.flat.length, 'Slice 8 truth cache should match the deterministic sample size');

const violations = [];
core.configureInvariantRuntime({
  mode: 'report',
  onViolation(violation) {
    violations.push(violation);
  },
});

const bandSummaries = {
  A: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.A, rmsErrors: [] },
  B: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.B, rmsErrors: [] },
  C: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.C, rmsErrors: [] },
  D: { count: 0, maxErrorKm: 0, barKm: INV013_BARS_KM.D, rmsErrors: [] },
};

for (const sampled of sample.flat) {
  const asteroid = catalog.asteroids[sampled.bodyId];
  assert.ok(asteroid, `Missing asteroid ${sampled.bodyId} from Slice 8 fixture`);
  core.assertCanonicalState(asteroid.anchorState);

  const truthBody = truthByBodyId.get(sampled.bodyId);
  assert.ok(truthBody, `Missing truth cache for ${sampled.bodyId}`);
  assert.equal(truthBody.eccentricityBand, asteroid.eccentricityBand, `${sampled.bodyId} band mismatch between fixture and truth cache`);
  assert.equal(truthBody.sampleCount, 91, `${sampled.bodyId} truth cache must contain 91 samples`);

  const errorsKm = [];
  for (const samplePoint of truthBody.samples) {
    const truthState = core.createCanonicalState({
      frame: core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds: core.jdTdbToSecondsSinceJ2000(samplePoint.jdTdb),
      positionM: {
        x: samplePoint.positionKm.x * 1000,
        y: samplePoint.positionKm.y * 1000,
        z: samplePoint.positionKm.z * 1000,
      },
      velocityMps: {
        x: samplePoint.velocityKms.x * 1000,
        y: samplePoint.velocityKms.y * 1000,
        z: samplePoint.velocityKms.z * 1000,
      },
      radiusM: asteroid.estimatedRadiusM,
    });

    const estimate = core.propagateKeplerianState(
      asteroid.elements,
      truthState.tdbSeconds,
      { radiusM: asteroid.estimatedRadiusM },
    );
    core.assertCanonicalState(estimate);
    core.assertKeplerianError(estimate, truthState, asteroid.bodyId);

    const dx = estimate.positionM.x - truthState.positionM.x;
    const dy = estimate.positionM.y - truthState.positionM.y;
    const dz = estimate.positionM.z - truthState.positionM.z;
    errorsKm.push(Math.sqrt(dx * dx + dy * dy + dz * dz) / 1000);
  }

  const maxErrorKm = Math.max(...errorsKm);
  const rmsErrorKm = computeRmsKm(errorsKm);
  const bandSummary = bandSummaries[asteroid.eccentricityBand];
  bandSummary.count += 1;
  bandSummary.maxErrorKm = Math.max(bandSummary.maxErrorKm, maxErrorKm);
  bandSummary.rmsErrors.push(rmsErrorKm);

  assert.ok(
    maxErrorKm <= bandSummary.barKm,
    `${sampled.bodyId} max error ${maxErrorKm} km exceeded INV-013 band ${asteroid.eccentricityBand} bar ${bandSummary.barKm} km`,
  );
}

for (const expected of expectedSlice7.asteroids) {
  const asteroid = catalog.asteroids[`asteroid-${expected.designation}`];
  assert.ok(asteroid, `Missing Slice 7 regression asteroid asteroid-${expected.designation}`);
  const barKm = INV013_BARS_KM[asteroid.eccentricityBand];
  assert.ok(
    expected.max_error_km <= barKm,
    `Slice 7 regression asteroid ${expected.designation} exceeded Slice 8 band ${asteroid.eccentricityBand} bar: ${expected.max_error_km} km > ${barKm} km`,
  );
}

core.resetInvariantRuntime();

assert.equal(
  violations.length,
  0,
  `runtime invariant violations detected:\n${violations
    .map((violation) => `${violation.invariantId} ${violation.message} ${JSON.stringify(violation.details ?? {})}`)
    .join('\n')}`,
);

console.log('');
console.log('Slice 8 per-band cutover summary:');
for (const band of ['A', 'B', 'C', 'D']) {
  const summary = bandSummaries[band];
  const rmsErrorKm = computeRmsKm(summary.rmsErrors);
  console.log(`  ${formatBandSummary(band, { ...summary, rmsErrorKm })}`);
  assert.equal(summary.count, SLICE8_CUTOVER_PER_BAND_COUNT, `Band ${band} should contribute 50 sampled bodies`);
}
console.log('');
const bodyIndexById = new Map(asteroidBodies.map((asteroid, index) => [asteroid.bodyId, index]));
const anchorPositions = asteroidBodies.map((asteroid) => new THREE.Vector3(
  asteroid.anchorState.positionM.x,
  asteroid.anchorState.positionM.y,
  asteroid.anchorState.positionM.z,
));

const cellRenderer = new render.AsteroidCellRenderer(asteroidBodies);
const occupiedCellKeys = cellRenderer.getOccupiedCellKeys();
const totalBodiesInCells = occupiedCellKeys.reduce(
  (sum, key) => sum + cellRenderer.getCellAtKey(key).bodyIndices.length,
  0,
);
assert.equal(totalBodiesInCells, asteroidBodies.length, 'cell-as-mesh partition must account for all 10,008 bodies');

cellRenderer.setAnchorPositionM({ x: 0, y: 0, z: 0 });
cellRenderer.setInstancedBodyIndices(asteroidBodies.map((_, index) => index));
const cullingCamera = createPerspectiveCamera(
  THREE,
  new THREE.Vector3(0, 0, 4 * 149_597_870_700),
  new THREE.Vector3(2.8 * 149_597_870_700, 0, 0),
);
cellRenderer.update(anchorPositions, cullingCamera, { width: 1600, height: 900 });

for (const key of occupiedCellKeys) {
  const cell = cellRenderer.getCellAtKey(key);
  assert.ok(cell.mesh.count <= cell.bodyIndices.length, `cell ${key} instance count exceeded its assigned bodies`);
  assert.equal(cell.mesh.count, cell.visibleBodyIndices.length, `cell ${key} visible-body mapping should match mesh.count`);
}

for (const expected of expectedSlice7.asteroids) {
  const asteroid = catalog.asteroids[`asteroid-${expected.designation}`];
  const bodyIndex = bodyIndexById.get(asteroid.bodyId);
  const cellIndex = render.cellIndexForPositionKm(new THREE.Vector3(
    asteroid.anchorState.positionM.x / 1000,
    asteroid.anchorState.positionM.y / 1000,
    asteroid.anchorState.positionM.z / 1000,
  ));
  assert.ok(cellIndex, `Slice 7 regression asteroid ${expected.designation} should remain inside the Slice 8 spatial grid`);
  const cell = cellRenderer.getCellAtKey(render.cellKeyForIndex(cellIndex));
  assert.ok(cell?.bodyIndices.includes(bodyIndex), `Slice 7 regression asteroid ${expected.designation} should remain assigned to its spatial cell`);
}

const focusedSubset = [
  catalog.asteroids['asteroid-4'],
  catalog.asteroids['asteroid-101955'],
];
const subsetRenderer = new render.AsteroidRenderer(focusedSubset);
const vesta = focusedSubset[0];
const focusCamera = createPerspectiveCamera(
  THREE,
  new THREE.Vector3(0, 0, 5_000_000),
  new THREE.Vector3(0, 0, 0),
);
subsetRenderer.update({
  anchorPositionM: vesta.anchorState.positionM,
  camera: focusCamera,
  tdbSeconds: vesta.elements.epochTdbSeconds,
  viewport: { width: 1280, height: 720 },
});

const rayDirection = new THREE.Vector3(0, 0, 0).sub(focusCamera.position).normalize();
const directCellHit = subsetRenderer.raycastIntersectCells(new THREE.Ray(focusCamera.position.clone(), rayDirection));
assert.equal(directCellHit, vesta.bodyId, 'cell ray-march should resolve Vesta in the focused subset');

const raycaster = new THREE.Raycaster();
raycaster.ray.origin.copy(focusCamera.position);
raycaster.ray.direction.copy(rayDirection);
let resolvedByRuntimePath = null;
const intersections = raycaster.intersectObjects(subsetRenderer.getRaycastTargets(), false);
for (const intersection of intersections) {
  resolvedByRuntimePath = subsetRenderer.resolveIntersection(intersection);
  if (resolvedByRuntimePath) {
    break;
  }
}
if (!resolvedByRuntimePath) {
  resolvedByRuntimePath = subsetRenderer.raycastIntersectCells(raycaster.ray);
}
assert.equal(resolvedByRuntimePath, vesta.bodyId, 'runtime picking path should resolve Vesta through the cell renderer');

const { asteroidRenderer: pointsRenderer, camera: pointsCamera } = buildSingleAsteroidRendererAtDiameter({
  asteroid: catalog.asteroids['asteroid-4'],
  targetDiameterPx: 1.2,
});
assert.equal(pointsRenderer.getAsteroidRenderMode('asteroid-4'), 'points');
const pointsRaycaster = new THREE.Raycaster();
pointsRaycaster.ray.origin.copy(pointsCamera.position);
pointsRaycaster.ray.direction.set(0, 0, 0).sub(pointsCamera.position).normalize();
const pointHits = pointsRaycaster.intersectObject(pointsRenderer.points, false);
assert.ok(pointHits.length > 0, 'Points-mode picking should intersect a sub-pixel asteroid');
assert.equal(
  pointsRenderer.resolveIntersection(pointHits[0]),
  'asteroid-4',
  'Points-mode picking should resolve the targeted asteroid body id',
);

const bennu = catalog.asteroids['asteroid-101955'];
const { asteroidRenderer: bennuRenderer, camera: bennuCamera } = buildSingleAsteroidRendererAtDiameter({
  asteroid: bennu,
  catalogBodies: [vesta, bennu],
  targetDiameterPx: 2.5,
});
assert.equal(bennuRenderer.getAsteroidRenderMode(bennu.bodyId), 'instanced');
const bennuRay = new THREE.Ray(
  bennuCamera.position.clone(),
  new THREE.Vector3(0, 0, 0).sub(bennuCamera.position).normalize(),
);
assert.equal(
  bennuRenderer.raycastIntersectCells(bennuRay),
  bennu.bodyId,
  'Bennu should remain pickable through the instanced cell renderer path',
);

const vestaWorld = subsetRenderer.getAsteroidWorldPosition(vesta.bodyId);
const vestaCellIndex = render.cellIndexForPositionKm(new THREE.Vector3(
  vesta.anchorState.positionM.x / 1000,
  vesta.anchorState.positionM.y / 1000,
  vesta.anchorState.positionM.z / 1000,
));
assert.ok(vestaCellIndex, 'Vesta should remain inside the Slice 8 spatial grid');
const vestaCell = subsetRenderer.cellRenderer.getCellAtKey(render.cellKeyForIndex(vestaCellIndex));
assert.ok(vestaCell, 'Vesta should resolve to an occupied Slice 8 cell');
const vestaSubsetIndex = focusedSubset.findIndex((asteroid) => asteroid.bodyId === vesta.bodyId);
assert.notEqual(vestaSubsetIndex, -1, 'Vesta should exist in the focused subset');
const vestaInstanceId = vestaCell.visibleBodyIndices.indexOf(vestaSubsetIndex);
assert.notEqual(vestaInstanceId, -1, 'Vesta should be visible inside its occupied cell');
const vestaInstancedMatrix = new THREE.Matrix4();
vestaCell.mesh.getMatrixAt(vestaInstanceId, vestaInstancedMatrix);
const vestaInstancedDraw = new THREE.Vector3().setFromMatrixPosition(vestaInstancedMatrix);
assert.ok(
  vestaInstancedDraw.distanceTo(vestaWorld) <= 1e-3,
  'Instanced render position must match Vesta world position before focus',
);

subsetRenderer.setFocusedAsteroid(resolvedByRuntimePath);
subsetRenderer.update({
  anchorPositionM: vesta.anchorState.positionM,
  camera: focusCamera,
  tdbSeconds: vesta.elements.epochTdbSeconds,
  viewport: { width: 1280, height: 720 },
});
assert.equal(subsetRenderer.getFocusedAsteroidBodyId(), vesta.bodyId);
assert.equal(subsetRenderer.getFocusedMeshBodyId(), vesta.bodyId);
const focusedDraw = new THREE.Vector3();
subsetRenderer.focusedMesh.getWorldPosition(focusedDraw);
assert.ok(
  focusedDraw.distanceTo(subsetRenderer.getAsteroidWorldPosition(vesta.bodyId)) <= 1e-3,
  'Focused mesh position must match Vesta world position after focus',
);

const bennuFocused = buildSingleAsteroidRendererAtDiameter({
  asteroid: bennu,
  catalogBodies: [vesta, bennu],
  targetDiameterPx: 40,
  focused: true,
});
assert.equal(bennuFocused.asteroidRenderer.getFocusedMeshBodyId(), bennu.bodyId);
const bennuFocusedDraw = new THREE.Vector3();
bennuFocused.asteroidRenderer.focusedMesh.getWorldPosition(bennuFocusedDraw);
assert.ok(
  bennuFocusedDraw.distanceTo(bennuFocused.asteroidRenderer.getAsteroidWorldPosition(bennu.bodyId)) <= 1e-3,
  'Focused mesh position must match Bennu world position in a different spatial cell',
);

const hud = {
  textContent: '',
  style: {
    display: 'none',
  },
};
runtime.renderFocusedAsteroidHud(hud, vesta);
assert.equal(hud.textContent, `${vesta.designation} · ${vesta.class}`);
assert.equal(hud.style.display, 'block');
runtime.renderFocusedAsteroidHud(hud, null);
assert.equal(hud.textContent, '');
assert.equal(hud.style.display, 'none');

console.log('Slice 8 cutover harness passed with zero runtime invariant violations and all Slice 7 regression bodies preserved.');
