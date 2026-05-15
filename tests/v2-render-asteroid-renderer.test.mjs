import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-asteroid-renderer');

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
      path.join(repoRoot, 'src', 'v2', 'render', 'asteroid-renderer.ts'),
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
      import(pathToFileURL(path.join(tempOutDir, 'render', 'asteroid-renderer.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
      import('three'),
    ]).then(([renderer, core, THREE]) => ({ renderer, core, THREE }));
  }

  return modulePromise;
}

function createMockAsteroid(core, designation, overrides = {}) {
  const epochTdbSeconds = 0;
  const aM = overrides.aM ?? 250_000_000_000;
  const estimatedRadiusM = overrides.estimatedRadiusM ?? 10_000;
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
    estimatedRadiusM,
    elementsFrame: core.FRAME_HELIO_J2000_ECLIPTIC,
    anchorState: core.createCanonicalState({
      frame: core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds: epochTdbSeconds,
      positionM: { x: aM, y: 0, z: 0 },
      velocityMps: { x: 0, y: 0, z: 0 },
      radiusM: estimatedRadiusM,
    }),
    elements: {
      aM,
      e: 0,
      iRad: 0,
      omRad: 0,
      wRad: 0,
      maRad: 0,
      epochTdbSeconds,
    },
    eccentricityBand: overrides.eccentricityBand ?? 'A',
    hasOrbitLine: overrides.hasOrbitLine ?? true,
  };
}

function cameraDistanceForDiameterPx(radiusM, targetDiameterPx, viewportHeightPx, fovRad) {
  const angularDiameter = targetDiameterPx * (fovRad / viewportHeightPx);
  return radiusM / Math.tan(angularDiameter / 2);
}

async function buildRendererWithCamera(targetDiameterPx, options = {}) {
  const { renderer, core, THREE } = await loadModules();
  const asteroid = createMockAsteroid(core, options.designation ?? '4', options.asteroidOverrides);
  const asteroidRenderer = new renderer.AsteroidRenderer([asteroid]);
  const camera = new THREE.PerspectiveCamera(45, 1280 / 720, 1, 1e15);
  const worldPosition = { x: asteroid.elements.aM, y: 0, z: 0 };
  const distance = cameraDistanceForDiameterPx(
    asteroid.estimatedRadiusM,
    targetDiameterPx,
    720,
    (camera.fov * Math.PI) / 180,
  );
  camera.position.set(0, 0, distance);
  asteroidRenderer.setFocusedAsteroid(options.focused ? asteroid.bodyId : null);
  asteroidRenderer.update({
    anchorPositionM: worldPosition,
    camera,
    tdbSeconds: asteroid.elements.epochTdbSeconds,
    viewport: { width: 1280, height: 720 },
  });
  return { renderer, THREE, asteroidRenderer, asteroid };
}

test('sub-pixel asteroid renders in Points mode', async () => {
  const { asteroidRenderer, asteroid } = await buildRendererWithCamera(1.2);
  assert.equal(asteroidRenderer.getAsteroidRenderMode(asteroid.bodyId), 'points');
  assert.deepEqual(asteroidRenderer.getPointBodyIds(), [asteroid.bodyId]);
  assert.equal(asteroidRenderer.instancedMesh.count, 0);
  assert.equal(asteroidRenderer.focusedMesh.visible, false);
});

test('mid-zoom asteroid renders in InstancedMesh mode', async () => {
  const { asteroidRenderer, asteroid } = await buildRendererWithCamera(2.5);
  assert.equal(asteroidRenderer.getAsteroidRenderMode(asteroid.bodyId), 'instanced');
  assert.deepEqual(asteroidRenderer.getInstancedBodyIds(), [asteroid.bodyId]);
  assert.equal(asteroidRenderer.pointsGeometry.drawRange.count, 0);
  assert.equal(asteroidRenderer.focusedMesh.visible, false);
});

test('focused asteroid renders in individual Mesh mode when resolved', async () => {
  const { asteroidRenderer, asteroid } = await buildRendererWithCamera(40, { focused: true });
  assert.equal(asteroidRenderer.getAsteroidRenderMode(asteroid.bodyId), 'mesh');
  assert.equal(asteroidRenderer.focusedMesh.visible, true);
  assert.equal(asteroidRenderer.getFocusedMeshBodyId(), asteroid.bodyId);
  assert.equal(asteroidRenderer.instancedMesh.count, 0);
});

test('hysteresis keeps a near-threshold asteroid stable around 1.7 px', async () => {
  const { renderer } = await loadModules();
  assert.equal(renderer.classifyAsteroidRenderMode(1.7, 'instanced', false), 'instanced');
  assert.equal(renderer.classifyAsteroidRenderMode(1.7, 'points', false), 'points');
  assert.equal(renderer.classifyAsteroidRenderMode(1.6, 'instanced', false), 'instanced');
  assert.equal(renderer.classifyAsteroidRenderMode(1.4, 'instanced', false), 'points');
  assert.equal(renderer.classifyAsteroidRenderMode(1.8, 'points', false), 'points');
  assert.equal(renderer.classifyAsteroidRenderMode(2.1, 'points', false), 'instanced');
});

test('Points, InstancedMesh, and focused Mesh agree on world position', async () => {
  const { THREE } = await loadModules();
  const pointsCase = await buildRendererWithCamera(1.2, { designation: '401' });
  const instancedCase = await buildRendererWithCamera(2.5, { designation: '402' });
  const focusedCase = await buildRendererWithCamera(40, {
    designation: '403',
    focused: true,
    asteroidOverrides: { isCuratedNea: true, class: 'APO', neo: true, pha: true },
  });

  const pointsWorld = pointsCase.asteroidRenderer.getAsteroidWorldPosition(pointsCase.asteroid.bodyId);
  const instancedWorld = instancedCase.asteroidRenderer.getAsteroidWorldPosition(instancedCase.asteroid.bodyId);
  const focusedWorld = focusedCase.asteroidRenderer.getAsteroidWorldPosition(focusedCase.asteroid.bodyId);

  const pointsDraw = new THREE.Vector3(
    pointsCase.asteroidRenderer.pointsGeometry.attributes.position.getX(0),
    pointsCase.asteroidRenderer.pointsGeometry.attributes.position.getY(0),
    pointsCase.asteroidRenderer.pointsGeometry.attributes.position.getZ(0),
  );
  const instancedMatrix = new THREE.Matrix4();
  instancedCase.asteroidRenderer.instancedMesh.getMatrixAt(0, instancedMatrix);
  const instancedDraw = new THREE.Vector3().setFromMatrixPosition(instancedMatrix);
  const focusedDraw = new THREE.Vector3();
  focusedCase.asteroidRenderer.focusedMesh.getWorldPosition(focusedDraw);

  assert.ok(pointsDraw.distanceTo(pointsWorld) <= 1e-3);
  assert.ok(instancedDraw.distanceTo(instancedWorld) <= 1e-3);
  assert.ok(focusedDraw.distanceTo(focusedWorld) <= 1e-3);
});

test('focused asteroid gets a highlighted orbit while the main orbit batch stays visible in browse-scale focus', async () => {
  const { asteroidRenderer, asteroid } = await buildRendererWithCamera(2.5, {
    designation: '404',
    focused: true,
  });

  assert.equal(asteroidRenderer.getAsteroidRenderMode(asteroid.bodyId), 'instanced');
  assert.equal(asteroidRenderer.getFocusedOrbitBodyId(), asteroid.bodyId);
  assert.equal(asteroidRenderer.orbitBatch.lineSegments.visible, true);
  assert.equal(asteroidRenderer.getMainOrbitOpacity(), 0.12);
  assert.equal(asteroidRenderer.orbitBatch.rangesByBodyId.size, 1);
});

test('main orbit batch fades out when the focused asteroid reaches close-inspection mesh mode', async () => {
  const { asteroidRenderer, asteroid } = await buildRendererWithCamera(120, {
    designation: '405',
    focused: true,
  });

  assert.equal(asteroidRenderer.getAsteroidRenderMode(asteroid.bodyId), 'mesh');
  assert.equal(asteroidRenderer.getFocusedOrbitBodyId(), asteroid.bodyId);
  assert.equal(asteroidRenderer.getMainOrbitOpacity(), 0);
  assert.equal(asteroidRenderer.orbitBatch.lineSegments.visible, false);
});

test('main orbit batch excludes asteroids below the hasOrbitLine threshold while focused orbit highlight still works', async () => {
  const { renderer, core, THREE } = await loadModules();
  const bright = createMockAsteroid(core, '406', { hasOrbitLine: true });
  const dim = createMockAsteroid(core, '407', { hasOrbitLine: false, isCuratedNea: true, class: 'APO' });
  const asteroidRenderer = new renderer.AsteroidRenderer([bright, dim]);
  const camera = new THREE.PerspectiveCamera(45, 1280 / 720, 1, 1e15);
  camera.position.set(0, 0, 5_000_000);

  asteroidRenderer.setFocusedAsteroid(dim.bodyId);
  asteroidRenderer.update({
    anchorPositionM: dim.anchorState.positionM,
    camera,
    tdbSeconds: dim.elements.epochTdbSeconds,
    viewport: { width: 1280, height: 720 },
  });

  assert.equal(asteroidRenderer.orbitBatch.rangesByBodyId.size, 1);
  assert.equal(asteroidRenderer.orbitBatch.rangesByBodyId.has(bright.bodyId), true);
  assert.equal(asteroidRenderer.orbitBatch.rangesByBodyId.has(dim.bodyId), false);
  assert.equal(asteroidRenderer.getFocusedOrbitBodyId(), dim.bodyId);
});
