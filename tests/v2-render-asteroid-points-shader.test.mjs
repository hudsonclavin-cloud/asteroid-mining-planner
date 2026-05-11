import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-asteroid-points-shader');

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
      path.join(repoRoot, 'src', 'v2', 'render', 'asteroid-points-shader.ts'),
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
      import(pathToFileURL(path.join(tempOutDir, 'render', 'asteroid-points-shader.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'render', 'asteroid-renderer.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
      import('three'),
    ]).then(([shader, renderer, core, THREE]) => ({ shader, renderer, core, THREE }));
  }

  return modulePromise;
}

function createMockAsteroid(core, designation, isCuratedNea) {
  return {
    bodyId: `asteroid-${designation}`,
    bodyClass: 'asteroid',
    designation,
    spkId: Number(designation),
    name: null,
    class: isCuratedNea ? 'APO' : 'MBA',
    isCuratedNea,
    neo: isCuratedNea,
    pha: false,
    H: isCuratedNea ? 18 : 9,
    G: 0.15,
    estimatedRadiusM: 8000,
    elementsFrame: core.FRAME_HELIO_J2000_ICRF,
    anchorState: core.createCanonicalState({
      frame: core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds: 0,
      positionM: { x: 250_000_000_000, y: 0, z: 0 },
      velocityMps: { x: 0, y: 0, z: 0 },
      radiusM: 8000,
    }),
    elements: {
      aM: 250_000_000_000,
      e: 0,
      iRad: 0,
      omRad: 0,
      wRad: 0,
      maRad: 0,
      epochTdbSeconds: 0,
    },
  };
}

function assertVectorApprox(actual, expected, tolerance = 1e-6) {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    assert.ok(Math.abs(actual[i] - expected[i]) <= tolerance);
  }
}

test('asteroid points shader material constructs with additive soft-glow settings', async () => {
  const { shader, THREE } = await loadModules();
  const material = shader.createAsteroidPointsShaderMaterial();
  assert.ok(material instanceof THREE.ShaderMaterial);
  assert.equal(material.blending, THREE.AdditiveBlending);
  assert.equal(material.transparent, true);
  assert.equal(material.depthTest, true);
  assert.equal(material.depthWrite, false);
  assert.equal(material.uniforms.uOpacity.value, shader.ASTEROID_POINTS_DEFAULT_OPACITY);
  assert.equal(material.uniforms.uScale.value, shader.ASTEROID_POINTS_DEFAULT_SCALE);
  assert.equal(material.uniforms.uMaxPointSize.value, shader.ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX);
  assert.ok(typeof material.vertexShader === 'string' && material.vertexShader.includes('gl_PointSize'));
  assert.ok(typeof material.fragmentShader === 'string' && material.fragmentShader.includes('gl_PointCoord'));
});

test('ALIASED_POINT_SIZE_RANGE query falls back cleanly when no GL context exists', async () => {
  const { shader } = await loadModules();
  assert.deepEqual(
    shader.resolveAliasedPointSizeRange(null),
    [1, shader.ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX],
  );
  assert.deepEqual(
    shader.resolveAliasedPointSizeRange({
      ALIASED_POINT_SIZE_RANGE: 0x846d,
      getParameter() {
        return [2, 128];
      },
    }),
    [2, 128],
  );
});

test('per-point color attribute distinguishes curated NEAs from main-belt asteroids', async () => {
  const { renderer, shader, core } = await loadModules();
  const mainBelt = createMockAsteroid(core, '4', false);
  const curatedNea = createMockAsteroid(core, '101955', true);
  const asteroidRenderer = new renderer.AsteroidRenderer([mainBelt, curatedNea]);
  asteroidRenderer.update({
    anchorPositionM: { x: 250_000_000_000, y: 0, z: 0 },
    camera: { fov: 45, position: { x: 0, y: 0, z: 5_000_000_000 } },
    tdbSeconds: 0,
    viewport: { width: 1280, height: 720 },
  });

  const colorByBodyId = new Map();
  const colorAttribute = asteroidRenderer.pointsGeometry.attributes.color;
  for (let i = 0; i < asteroidRenderer.getPointBodyIds().length; i += 1) {
    const bodyId = asteroidRenderer.getPointBodyIds()[i];
    colorByBodyId.set(bodyId, [
      colorAttribute.getX(i),
      colorAttribute.getY(i),
      colorAttribute.getZ(i),
    ]);
  }

  const expectedMain = shader.getAsteroidPointColor(mainBelt);
  const expectedNea = shader.getAsteroidPointColor(curatedNea);
  assertVectorApprox(colorByBodyId.get(mainBelt.bodyId), [expectedMain.r, expectedMain.g, expectedMain.b]);
  assertVectorApprox(colorByBodyId.get(curatedNea.bodyId), [expectedNea.r, expectedNea.g, expectedNea.b]);
  assert.notDeepEqual(colorByBodyId.get(mainBelt.bodyId), colorByBodyId.get(curatedNea.bodyId));
});

test('overview Vesta-sized points land in the tuned 4-8 px visibility band', async () => {
  const { renderer, shader, core, THREE } = await loadModules();
  const asteroid = createMockAsteroid(core, '4', false);
  const asteroidRenderer = new renderer.AsteroidRenderer([asteroid]);
  const camera = new THREE.PerspectiveCamera(45, 1440 / 900, 1, 1e15);
  camera.position.set(1_047_185_094_900, 0, 0);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  asteroidRenderer.update({
    anchorPositionM: { x: 0, y: 0, z: 0 },
    camera,
    tdbSeconds: 0,
    viewport: { width: 1440, height: 900 },
  });

  const sizeAttribute = asteroidRenderer.pointsGeometry.attributes.aSize;
  const material = asteroidRenderer.pointsMaterial;
  assert.equal(asteroidRenderer.pointsGeometry.drawRange.count, 1);
  assert.ok(material instanceof THREE.ShaderMaterial);
  const positionAttribute = asteroidRenderer.pointsGeometry.attributes.position;
  const worldPosition = [
    positionAttribute.getX(0),
    positionAttribute.getY(0),
    positionAttribute.getZ(0),
  ];
  const mvPosition = new THREE.Vector4(worldPosition[0], worldPosition[1], worldPosition[2], 1).applyMatrix4(
    camera.matrixWorldInverse,
  );
  const depth = Math.max(1e-6, -mvPosition.z);
  const computedPointSize = Math.min(
    Math.max((sizeAttribute.getX(0) * material.uniforms.uScale.value) / depth, 1),
    material.uniforms.uMaxPointSize.value,
  );
  assert.ok(computedPointSize >= 4);
  assert.ok(computedPointSize <= 8);
});
