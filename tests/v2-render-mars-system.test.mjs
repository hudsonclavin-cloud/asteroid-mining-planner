import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-mars-system');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-mars-system-90d.json');

function compileMarsRuntimeSupport() {
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
      path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(
    result.status,
    0,
    `tsc compilation failed\n${result.stderr || result.stdout}`,
  );
}

let compiledModulesPromise;

async function loadCompiledModules() {
  if (!compiledModulesPromise) {
    compileMarsRuntimeSupport();
    compiledModulesPromise = Promise.all([
      import(pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
      import('three'),
    ]).then(([runtime, core, horizons, THREE]) => ({ runtime, core, horizons, THREE }));
  }

  return compiledModulesPromise;
}

function readFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

function interpolateProvider(core, samples) {
  return (tdbSeconds) => core.interpolateBodyStateSeries('mars', samples, tdbSeconds);
}

function vectorLength(vec) {
  return Math.hypot(vec.x, vec.y, vec.z);
}

async function buildMarsSystemForBody(bodyId) {
  const { runtime, core, horizons, THREE } = await loadCompiledModules();
  const fixture = readFixture();
  const states = horizons.ingestSlice6Fixture(fixture);
  const marsStates = states.mars.map((sample) => sample.state);
  const moonStates = states[bodyId].map((sample) => sample.state);
  const moonState = moonStates[0];
  const tdbSeconds = moonState.tdbSeconds;

  core.configureFrameTransformHooks({
    marsHeliocentricStateProvider: interpolateProvider(core, marsStates),
  });

  try {
    const marsHelio = core.interpolateBodyStateSeries('mars', marsStates, tdbSeconds);
    const moonHelio = core.transformCanonicalState(
      moonState,
      core.FRAME_MARS_J2000_ICRF,
      core.FRAME_HELIO_J2000_ICRF,
      tdbSeconds,
    );

    const { marsSystemGroup, marsTiltGroup, marsCenteredGroup } = runtime.createMarsSystemRenderGroups();
    const marsMesh = new THREE.Object3D();
    marsMesh.name = 'mars-mesh';
    const phobosMesh = new THREE.Object3D();
    phobosMesh.name = 'phobos-mesh';
    const deimosMesh = new THREE.Object3D();
    deimosMesh.name = 'deimos-mesh';
    marsTiltGroup.add(marsMesh);
    marsCenteredGroup.add(phobosMesh, deimosMesh);

    const anchor = moonHelio.positionM;
    marsSystemGroup.position.set(
      marsHelio.positionM.x - anchor.x,
      marsHelio.positionM.y - anchor.y,
      marsHelio.positionM.z - anchor.z,
    );
    phobosMesh.position.set(
      states.phobos[0].state.positionM.x,
      states.phobos[0].state.positionM.y,
      states.phobos[0].state.positionM.z,
    );
    deimosMesh.position.set(
      states.deimos[0].state.positionM.x,
      states.deimos[0].state.positionM.y,
      states.deimos[0].state.positionM.z,
    );
    marsSystemGroup.updateMatrixWorld(true);

    return {
      runtime,
      core,
      THREE,
      marsSystemGroup,
      marsTiltGroup,
      marsCenteredGroup,
      marsMesh,
      phobosMesh,
      deimosMesh,
      moonHelio,
    };
  } finally {
    core.resetFrameTransformHooks();
  }
}

test('Phobos rendered world position equals its heliocentric focus anchor', async () => {
  const { THREE, phobosMesh } = await buildMarsSystemForBody('phobos');
  const world = new THREE.Vector3();
  phobosMesh.getWorldPosition(world);
  assert.ok(vectorLength(world) <= 1, `expected Phobos render/focus mismatch <= 1 m, got ${vectorLength(world)} m`);
});

test('Deimos rendered world position equals its heliocentric focus anchor', async () => {
  const { THREE, deimosMesh } = await buildMarsSystemForBody('deimos');
  const world = new THREE.Vector3();
  deimosMesh.getWorldPosition(world);
  assert.ok(vectorLength(world) <= 1, `expected Deimos render/focus mismatch <= 1 m, got ${vectorLength(world)} m`);
});

test('Mars body mesh receives the documented render-only tilt', async () => {
  const { THREE, runtime, marsMesh } = await buildMarsSystemForBody('phobos');
  const worldQuaternion = new THREE.Quaternion();
  marsMesh.getWorldQuaternion(worldQuaternion);
  const expected = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(runtime.MARS_RENDER_TILT_RAD, 0, 0),
  );
  assert.ok(worldQuaternion.angleTo(expected) <= 1e-12, `expected Mars tilt quaternion match, got angle ${worldQuaternion.angleTo(expected)}`);
});

test('Mars moons do not inherit the render-only tilt', async () => {
  const { THREE, phobosMesh, deimosMesh } = await buildMarsSystemForBody('phobos');
  const identity = new THREE.Quaternion();
  const phobosQuaternion = new THREE.Quaternion();
  const deimosQuaternion = new THREE.Quaternion();
  phobosMesh.getWorldQuaternion(phobosQuaternion);
  deimosMesh.getWorldQuaternion(deimosQuaternion);
  assert.ok(phobosQuaternion.angleTo(identity) <= 1e-12, `expected Phobos world rotation ~identity, got ${phobosQuaternion.angleTo(identity)}`);
  assert.ok(deimosQuaternion.angleTo(identity) <= 1e-12, `expected Deimos world rotation ~identity, got ${deimosQuaternion.angleTo(identity)}`);
});
