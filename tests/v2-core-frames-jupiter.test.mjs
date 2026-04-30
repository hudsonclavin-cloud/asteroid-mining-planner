import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-frames-jupiter');
const slice1FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-earth-moon-30d.json');
const slice3FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-jupiter-system-90d.json');

let compiledModulesPromise = null;

async function loadModules() {
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
          '--isolatedModules', 'true',
          path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
          path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' }
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');

      const [core, horizons] = await Promise.all([
        import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
      ]);

      return { core, horizons };
    })();
  }

  return compiledModulesPromise;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function norm6(state) {
  return Math.hypot(
    state.positionM.x,
    state.positionM.y,
    state.positionM.z,
    state.velocityMps.x,
    state.velocityMps.y,
    state.velocityMps.z,
  );
}

function diffNorm6(left, right) {
  return Math.hypot(
    left.positionM.x - right.positionM.x,
    left.positionM.y - right.positionM.y,
    left.positionM.z - right.positionM.z,
    left.velocityMps.x - right.velocityMps.x,
    left.velocityMps.y - right.velocityMps.y,
    left.velocityMps.z - right.velocityMps.z,
  );
}

function buildInterpolatingProvider(samples, interpolateBodyState) {
  const exact = new Map(samples.map((sample) => [sample.tdbSeconds, sample]));

  return (tdbSeconds) => {
    const exactSample = exact.get(tdbSeconds);
    if (exactSample) {
      return exactSample;
    }

    for (let i = 0; i < samples.length - 1; i++) {
      const s0 = samples[i];
      const s1 = samples[i + 1];
      if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
        return interpolateBodyState(s0, s1, tdbSeconds);
      }
    }

    throw new Error(`Missing bracketing anchor samples for tdbSeconds=${tdbSeconds}`);
  };
}

function computeTenChainRelativeError(state, fromFrame, toFrame, tdbSeconds, transformCanonicalState) {
  let current = state;
  for (let i = 0; i < 10; i++) {
    current = transformCanonicalState(current, fromFrame, toFrame, tdbSeconds);
    current = transformCanonicalState(current, toFrame, fromFrame, tdbSeconds);
  }
  return diffNorm6(current, state) / Math.max(norm6(state), 1);
}

test('Slice 3 boundary ingestion tags Galileans as FRAME_JUPITER_J2000_ICRF', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readJson(slice3FixturePath);
  const allStates = horizons.ingestSlice3Fixture(fixture);

  for (const bodyId of ['io', 'europa', 'ganymede', 'callisto']) {
    assert.ok(allStates[bodyId]?.length > 0, `${bodyId} states should be present`);
    assert.equal(allStates[bodyId][0].state.frame, core.FRAME_JUPITER_J2000_ICRF);
  }
  assert.equal(allStates.jupiter[0].state.frame, core.FRAME_HELIO_J2000_ICRF);
});

test('Slice 3 HELIO ↔ JUPITER round-trip stays within one-pass and ten-chain bounds', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readJson(slice3FixturePath);
  const allStates = horizons.ingestSlice3Fixture(fixture);
  const jupiterSamples = allStates.jupiter.map((sample) => sample.state);
  const ioSamples = allStates.io.map((sample) => sample.state);
  const interpolateBodyState = core.interpolateBodyState;

  core.configureFrameTransformHooks({
    jupiterHeliocentricStateProvider: buildInterpolatingProvider(jupiterSamples, interpolateBodyState),
  });

  const sampleIndices = [0, 180, 360, 540, 720, 900, 1080, 1260, 1440, 1800];
  let maxRoundTripError = 0;
  let maxChainTenError = 0;

  for (const index of sampleIndices) {
    const ioJupiter = ioSamples[index];
    const ioHelio = core.transformCanonicalState(
      ioJupiter,
      core.FRAME_JUPITER_J2000_ICRF,
      core.FRAME_HELIO_J2000_ICRF,
      ioJupiter.tdbSeconds,
    );

    const roundTripError = core.computeFrameRoundTripRelativeError(
      ioHelio,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_JUPITER_J2000_ICRF,
      ioHelio.tdbSeconds,
    );
    const chainTenError = computeTenChainRelativeError(
      ioHelio,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_JUPITER_J2000_ICRF,
      ioHelio.tdbSeconds,
      core.transformCanonicalState,
    );

    maxRoundTripError = Math.max(maxRoundTripError, roundTripError);
    maxChainTenError = Math.max(maxChainTenError, chainTenError);

    core.assertFrameRoundTrip(
      ioHelio,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_JUPITER_J2000_ICRF,
      ioHelio.tdbSeconds,
    );
    assert.ok(
      chainTenError < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR,
      `ten-chain relative error ${chainTenError} exceeded ${core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR}`
    );
  }

  console.log(`slice3MaxRoundTripError=${maxRoundTripError}`);
  console.log(`slice3MaxChainTenError=${maxChainTenError}`);

  core.resetFrameTransformHooks();
});

test('Slice 1 HELIO ↔ GCRS round-trip still works unchanged', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readJson(slice1FixturePath);
  const slice = horizons.ingestSlice1EarthMoonFixture(fixture);
  const earthByTime = new Map(slice.earth.map((sample) => [sample.state.tdbSeconds, sample.state]));

  core.configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds) {
      const earthState = earthByTime.get(tdbSeconds);
      assert.ok(earthState, `missing Earth anchor for t=${tdbSeconds}`);
      return earthState;
    },
  });

  const moonSample = slice.moon[0].state;
  const relativeError = core.computeFrameRoundTripRelativeError(
    moonSample,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_GCRS_EARTH,
    moonSample.tdbSeconds,
  );

  core.assertFrameRoundTrip(
    moonSample,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_GCRS_EARTH,
    moonSample.tdbSeconds,
  );
  assert.ok(relativeError < core.FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR);

  core.resetFrameTransformHooks();
});
