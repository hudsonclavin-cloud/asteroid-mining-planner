import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-integration');

let compiledModulesPromise = null;

async function loadCompiledSlice1Modules() {
  if (!compiledModulesPromise) {
    compiledModulesPromise = (async () => {
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
          path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
          path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
          path.join(repoRoot, 'src', 'v2', 'render', 'index.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' }
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');

      const [core, boundary, render] = await Promise.all([
        import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'render', 'index.js')).href),
      ]);

      return { core, boundary, render };
    })();
  }

  return compiledModulesPromise;
}

function loadSlice1Fixture() {
  const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-earth-moon-30d.json');
  const text = fs.readFileSync(fixturePath, 'utf8');
  return JSON.parse(text);
}

test('Slice 1 Horizons fixture exists with Earth and Moon 30-day samples', () => {
  const fixture = loadSlice1Fixture();

  assert.equal(fixture.source, 'JPL Horizons API');
  assert.ok(Array.isArray(fixture.targets?.earth?.records));
  assert.ok(Array.isArray(fixture.targets?.moon?.records));
  assert.ok(fixture.targets.earth.records.length >= 31);
  assert.equal(fixture.targets.earth.records.length, fixture.targets.moon.records.length);
});

test('Slice 1 boundary ingress produces canonical heliocentric Earth/Moon states', async () => {
  const { core, boundary } = await loadCompiledSlice1Modules();
  const fixture = loadSlice1Fixture();
  const slice = boundary.ingestSlice1EarthMoonFixture(fixture);
  const expectedSamples = fixture.targets.earth.records.length;

  assert.equal(slice.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(slice.earth.length, expectedSamples);
  assert.equal(slice.moon.length, expectedSamples);

  for (const sample of [slice.earth[0], slice.moon[0], slice.earth.at(-1), slice.moon.at(-1)]) {
    core.assertCanonicalState(sample.state);
    assert.equal(sample.state.frame, core.FRAME_HELIO_J2000_ICRF);
  }
});

test('Slice 1 core frame transform round-trip holds against the Earth anchor fixture', async () => {
  const { core, boundary } = await loadCompiledSlice1Modules();
  const fixture = loadSlice1Fixture();
  const slice = boundary.ingestSlice1EarthMoonFixture(fixture);

  const earthByTime = new Map(slice.earth.map((sample) => [sample.state.tdbSeconds, sample.state]));
  core.configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds) {
      const match = earthByTime.get(tdbSeconds);
      assert.ok(match, `missing Earth state for t=${tdbSeconds}`);
      return match;
    },
  });

  const moonSample = slice.moon[0].state;
  const moonInGcrs = core.transformCanonicalState(
    moonSample,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_GCRS_EARTH,
    moonSample.tdbSeconds,
  );
  assert.equal(moonInGcrs.frame, core.FRAME_GCRS_EARTH);

  core.assertFrameRoundTrip(
    moonSample,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_GCRS_EARTH,
    moonSample.tdbSeconds,
  );

  core.resetFrameTransformHooks();
});

test('Slice 1 render path subtracts in f64 and only downcasts camera-relative values', async () => {
  const { boundary, render } = await loadCompiledSlice1Modules();
  const fixture = loadSlice1Fixture();
  const slice = boundary.ingestSlice1EarthMoonFixture(fixture);

  const cameraPosition = slice.earth[0].state.positionM;
  const moonPosition = slice.moon[0].state.positionM;
  const projection = render.projectCanonicalPositionToRenderF32(moonPosition, cameraPosition);

  assert.equal(
    projection.relativeF64.x,
    moonPosition.x - cameraPosition.x,
  );
  assert.ok(Number.isFinite(projection.renderF32.x));
  assert.ok(projection.renderF32 instanceof Object);

  const buffer = render.writeCameraRelativePositionsToF32Buffer(
    [slice.earth[0].state.positionM, slice.moon[0].state.positionM],
    cameraPosition,
  );
  assert.equal(buffer.length, 6);
  assert.equal(buffer[0], 0);
  assert.equal(buffer[1], 0);
  assert.equal(buffer[2], 0);
});
