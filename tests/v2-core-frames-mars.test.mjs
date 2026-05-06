import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-frames-mars');
const slice1FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-earth-moon-30d.json');
const slice3FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-jupiter-system-90d.json');
const slice4FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-saturn-system-90d.json');
const slice6FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-mars-system-90d.json');

const MARS_MOON_BODY_IDS = ['phobos', 'deimos'];

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

function selectRepresentativeIntervalIndices(sampleCount) {
  const maxIntervalIndex = sampleCount - 2;
  return [...new Set([
    0,
    Math.floor(maxIntervalIndex / 6),
    Math.floor(maxIntervalIndex / 3),
    Math.floor(maxIntervalIndex / 2),
    Math.floor((2 * maxIntervalIndex) / 3),
    Math.floor((5 * maxIntervalIndex) / 6),
    maxIntervalIndex,
  ])];
}

function buildMarsFixtureStates(core) {
  const fixture = readJson(slice6FixturePath);
  const allStates = {};

  for (const [bodyId, target] of Object.entries(fixture.targets)) {
    const frame =
      bodyId === 'mars'
        ? core.FRAME_HELIO_J2000_ICRF
        : core.FRAME_MARS_J2000_ICRF;

    allStates[bodyId] = target.records.map((record) =>
      core.createCanonicalState({
        frame,
        tdbSeconds: core.jdTdbToSecondsSinceJ2000(record[0]),
        positionM: {
          x: core.kilometersToMeters(record[1]),
          y: core.kilometersToMeters(record[2]),
          z: core.kilometersToMeters(record[3]),
        },
        velocityMps: {
          x: core.kilometersPerSecondToMetersPerSecond(record[4]),
          y: core.kilometersPerSecondToMetersPerSecond(record[5]),
          z: core.kilometersPerSecondToMetersPerSecond(record[6]),
        },
        radiusM: core.BODY_CONSTANTS[bodyId].radiusM,
      })
    );
  }

  return allStates;
}

test('Slice 6 HELIO ↔ MARS direct round-trip on Mars heliocentric states stays within bounds', async () => {
  const { core } = await loadModules();
  const allStates = buildMarsFixtureStates(core);
  const marsSamples = allStates.mars;

  core.configureFrameTransformHooks({
    marsHeliocentricStateProvider: buildInterpolatingProvider(
      marsSamples,
      core.interpolateBodyState,
    ),
  });

  const sampleIndices = [0, 15, 30, 45, 60, 75, 90];
  let maxRoundTripError = 0;
  let maxChainTenError = 0;

  for (const index of sampleIndices) {
    const marsState = marsSamples[index];
    const roundTripError = core.computeFrameRoundTripRelativeError(
      marsState,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_MARS_J2000_ICRF,
      marsState.tdbSeconds,
    );
    const chainTenError = computeTenChainRelativeError(
      marsState,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_MARS_J2000_ICRF,
      marsState.tdbSeconds,
      core.transformCanonicalState,
    );

    maxRoundTripError = Math.max(maxRoundTripError, roundTripError);
    maxChainTenError = Math.max(maxChainTenError, chainTenError);

    core.assertFrameRoundTrip(
      marsState,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_MARS_J2000_ICRF,
      marsState.tdbSeconds,
    );
    assert.ok(
      chainTenError < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR,
      `ten-chain relative error ${chainTenError} exceeded ${core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR}`
    );
  }

  console.log(`slice6MarsMaxRoundTripError=${maxRoundTripError}`);
  console.log(`slice6MarsMaxChainTenError=${maxChainTenError}`);

  core.resetFrameTransformHooks();
});

test('Slice 6 HELIO ↔ MARS round-trip on interpolated Mars-centered moon states stays within bounds', async () => {
  const { core } = await loadModules();
  const allStates = buildMarsFixtureStates(core);
  const marsSamples = allStates.mars;

  core.configureFrameTransformHooks({
    marsHeliocentricStateProvider: buildInterpolatingProvider(
      marsSamples,
      core.interpolateBodyState,
    ),
  });

  let maxHelioRoundTripError = 0;
  let maxChainTenError = 0;
  let maxNativeRoundTripRelativeError = 0;

  for (const bodyId of MARS_MOON_BODY_IDS) {
    const moonSamples = allStates[bodyId];

    for (const intervalIndex of selectRepresentativeIntervalIndices(moonSamples.length)) {
      const left = moonSamples[intervalIndex];
      const right = moonSamples[intervalIndex + 1];
      const tdbSeconds = (left.tdbSeconds + right.tdbSeconds) / 2;
      const moonMars = core.interpolateBodyStateSeries(bodyId, moonSamples, tdbSeconds);
      const moonHelio = core.transformCanonicalState(
        moonMars,
        core.FRAME_MARS_J2000_ICRF,
        core.FRAME_HELIO_J2000_ICRF,
        tdbSeconds,
      );
      const moonMarsRoundTripped = core.transformCanonicalState(
        moonHelio,
        core.FRAME_HELIO_J2000_ICRF,
        core.FRAME_MARS_J2000_ICRF,
        tdbSeconds,
      );

      const helioRoundTripError = core.computeFrameRoundTripRelativeError(
        moonHelio,
        core.FRAME_HELIO_J2000_ICRF,
        core.FRAME_MARS_J2000_ICRF,
        tdbSeconds,
      );
      const chainTenError = computeTenChainRelativeError(
        moonHelio,
        core.FRAME_HELIO_J2000_ICRF,
        core.FRAME_MARS_J2000_ICRF,
        tdbSeconds,
        core.transformCanonicalState,
      );
      const nativeRoundTripRelativeError =
        diffNorm6(moonMarsRoundTripped, moonMars) / Math.max(norm6(moonMars), 1);

      maxHelioRoundTripError = Math.max(maxHelioRoundTripError, helioRoundTripError);
      maxChainTenError = Math.max(maxChainTenError, chainTenError);
      maxNativeRoundTripRelativeError = Math.max(
        maxNativeRoundTripRelativeError,
        nativeRoundTripRelativeError,
      );

      core.assertFrameRoundTrip(
        moonHelio,
        core.FRAME_HELIO_J2000_ICRF,
        core.FRAME_MARS_J2000_ICRF,
        tdbSeconds,
      );
      assert.ok(
        chainTenError < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR,
        `ten-chain relative error ${chainTenError} exceeded ${core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR}`
      );
      assert.ok(
        nativeRoundTripRelativeError < 2e-12,
        `${bodyId} native relative round-trip error ${nativeRoundTripRelativeError} exceeded 2e-12`
      );
    }
  }

  console.log(`slice6MarsMoonMaxHelioRoundTripError=${maxHelioRoundTripError}`);
  console.log(`slice6MarsMoonMaxChainTenError=${maxChainTenError}`);
  console.log(`slice6MarsMoonMaxNativeRoundTripRelativeError=${maxNativeRoundTripRelativeError}`);

  core.resetFrameTransformHooks();
});

test('Slice 6 frame additions preserve GCRS, Jupiter, and Saturn paths', async () => {
  const { core, horizons } = await loadModules();

  const slice1Fixture = readJson(slice1FixturePath);
  const slice1 = horizons.ingestSlice1EarthMoonFixture(slice1Fixture);
  const earthByTime = new Map(slice1.earth.map((sample) => [sample.state.tdbSeconds, sample.state]));

  core.configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds) {
      const earthState = earthByTime.get(tdbSeconds);
      assert.ok(earthState, `missing Earth anchor for t=${tdbSeconds}`);
      return earthState;
    },
  });

  const moonSample = slice1.moon[0].state;
  core.assertFrameRoundTrip(
    moonSample,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_GCRS_EARTH,
    moonSample.tdbSeconds,
  );
  assert.ok(
    computeTenChainRelativeError(
      moonSample,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_GCRS_EARTH,
      moonSample.tdbSeconds,
      core.transformCanonicalState,
    ) < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR
  );

  core.resetFrameTransformHooks();

  const slice3Fixture = readJson(slice3FixturePath);
  const slice3 = horizons.ingestSlice3Fixture(slice3Fixture);
  const jupiterSamples = slice3.jupiter.map((sample) => sample.state);
  const ioSamples = slice3.io.map((sample) => sample.state);

  core.configureFrameTransformHooks({
    jupiterHeliocentricStateProvider: buildInterpolatingProvider(
      jupiterSamples,
      core.interpolateBodyState,
    ),
  });

  const ioSample = ioSamples[180];
  const ioHelio = core.transformCanonicalState(
    ioSample,
    core.FRAME_JUPITER_J2000_ICRF,
    core.FRAME_HELIO_J2000_ICRF,
    ioSample.tdbSeconds,
  );

  core.assertFrameRoundTrip(
    ioHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_JUPITER_J2000_ICRF,
    ioHelio.tdbSeconds,
  );
  assert.ok(
    computeTenChainRelativeError(
      ioHelio,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_JUPITER_J2000_ICRF,
      ioHelio.tdbSeconds,
      core.transformCanonicalState,
    ) < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR
  );

  core.resetFrameTransformHooks();

  const slice4Fixture = readJson(slice4FixturePath);
  const slice4 = horizons.ingestSlice4Fixture(slice4Fixture);
  const saturnSamples = slice4.saturn.map((sample) => sample.state);
  const titanSamples = slice4.titan.map((sample) => sample.state);

  core.configureFrameTransformHooks({
    saturnHeliocentricStateProvider: buildInterpolatingProvider(
      saturnSamples,
      core.interpolateBodyState,
    ),
  });

  const titanSample = titanSamples[90];
  const titanHelio = core.transformCanonicalState(
    titanSample,
    core.FRAME_SATURN_J2000_ICRF,
    core.FRAME_HELIO_J2000_ICRF,
    titanSample.tdbSeconds,
  );

  core.assertFrameRoundTrip(
    titanHelio,
    core.FRAME_HELIO_J2000_ICRF,
    core.FRAME_SATURN_J2000_ICRF,
    titanHelio.tdbSeconds,
  );
  assert.ok(
    computeTenChainRelativeError(
      titanHelio,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_SATURN_J2000_ICRF,
      titanHelio.tdbSeconds,
      core.transformCanonicalState,
    ) < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR
  );

  core.resetFrameTransformHooks();
});
