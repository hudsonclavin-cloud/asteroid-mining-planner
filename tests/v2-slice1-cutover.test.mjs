import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice1-cutover');

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
          path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
          path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' }
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');

      const [core, boundary] = await Promise.all([
        import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
      ]);

      return { core, boundary };
    })();
  }

  return compiledModulesPromise;
}

function readFixture() {
  const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-earth-moon-30d.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

function rotateEclipticJ2000ToIcrf(vector, obliquityRad) {
  const cosObliquity = Math.cos(obliquityRad);
  const sinObliquity = Math.sin(obliquityRad);

  return {
    x: vector.x,
    y: vector.y * cosObliquity - vector.z * sinObliquity,
    z: vector.y * sinObliquity + vector.z * cosObliquity,
  };
}

function fixtureTupleToExpectedState(record, core) {
  const [jdTdb, xKm, yKm, zKm, vxKmS, vyKmS, vzKmS] = record;

  const positionM = rotateEclipticJ2000ToIcrf(
    {
      x: core.kilometersToMeters(xKm),
      y: core.kilometersToMeters(yKm),
      z: core.kilometersToMeters(zKm),
    },
    core.J2000_ECLIPTIC_OBLIQUITY_RAD
  );

  const velocityMps = rotateEclipticJ2000ToIcrf(
    {
      x: core.kilometersPerSecondToMetersPerSecond(vxKmS),
      y: core.kilometersPerSecondToMetersPerSecond(vyKmS),
      z: core.kilometersPerSecondToMetersPerSecond(vzKmS),
    },
    core.J2000_ECLIPTIC_OBLIQUITY_RAD
  );

  return {
    positionM,
    velocityMps,
    tdbSeconds: core.jdTdbToSecondsSinceJ2000(jdTdb),
    frame: core.FRAME_HELIO_J2000_ICRF,
  };
}

function vectorErrorMagnitude(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function canonicalRelativeError(left, right) {
  const diffNorm = Math.hypot(
    left.positionM.x - right.positionM.x,
    left.positionM.y - right.positionM.y,
    left.positionM.z - right.positionM.z,
    left.velocityMps.x - right.velocityMps.x,
    left.velocityMps.y - right.velocityMps.y,
    left.velocityMps.z - right.velocityMps.z
  );

  const baseNorm = Math.hypot(
    right.positionM.x,
    right.positionM.y,
    right.positionM.z,
    right.velocityMps.x,
    right.velocityMps.y,
    right.velocityMps.z
  );

  return diffNorm / Math.max(baseNorm, 1);
}

function chainTenTransforms(core, state) {
  let current = state;

  for (let i = 0; i < 5; i++) {
    current = core.transformCanonicalState(
      current,
      core.FRAME_HELIO_J2000_ICRF,
      core.FRAME_GCRS_EARTH,
      state.tdbSeconds
    );
    current = core.transformCanonicalState(
      current,
      core.FRAME_GCRS_EARTH,
      core.FRAME_HELIO_J2000_ICRF,
      state.tdbSeconds
    );
  }

  return current;
}

test('Slice 1 pure-Node cutover harness clears the numeric bar at fixture truth timesteps', async (t) => {
  const { core, boundary } = await loadModules();
  const fixture = readFixture();
  const slice = boundary.ingestSlice1EarthMoonFixture(fixture);
  const expectedSampleCount = fixture.targets.earth.records.length;

  assert.ok(expectedSampleCount > 0);
  assert.equal(expectedSampleCount, fixture.targets.moon.records.length);
  assert.equal(slice.earth.length, expectedSampleCount);
  assert.equal(slice.moon.length, expectedSampleCount);

  const earthByTime = new Map(slice.earth.map((sample) => [sample.state.tdbSeconds, sample.state]));
  core.configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds) {
      const earthState = earthByTime.get(tdbSeconds);
      assert.ok(earthState, `missing Earth anchor at tdbSeconds=${tdbSeconds}`);
      return earthState;
    },
  });

  let maxEarthErrorM = 0;
  let maxMoonErrorM = 0;
  let maxRoundTripError = 0;
  let maxChainTenError = 0;
  let invariantSampleChecks = 0;

  try {
    for (let i = 0; i < slice.earth.length; i++) {
      const earthSample = slice.earth[i].state;
      const moonSample = slice.moon[i].state;
      const expectedEarth = fixtureTupleToExpectedState(fixture.targets.earth.records[i], core);
      const expectedMoon = fixtureTupleToExpectedState(fixture.targets.moon.records[i], core);

      const earthErrorM = vectorErrorMagnitude(earthSample.positionM, expectedEarth.positionM);
      const moonErrorM = vectorErrorMagnitude(moonSample.positionM, expectedMoon.positionM);

      maxEarthErrorM = Math.max(maxEarthErrorM, earthErrorM);
      maxMoonErrorM = Math.max(maxMoonErrorM, moonErrorM);

      assert.ok(earthErrorM < 1000, `Earth fixture error exceeded 1 km at index ${i}: ${earthErrorM} m`);
      assert.ok(moonErrorM < 1000, `Moon fixture error exceeded 1 km at index ${i}: ${moonErrorM} m`);
      assert.equal(earthSample.tdbSeconds, expectedEarth.tdbSeconds);
      assert.equal(moonSample.tdbSeconds, expectedMoon.tdbSeconds);

      for (const sample of [earthSample, moonSample]) {
        core.assertCanonicalUnits(sample);
        core.assertFiniteState(sample);
        core.assertFrameTag(sample);
        core.assertPhysicalTruthOnly(sample);
        core.assertCanonicalState(sample);
        invariantSampleChecks += 1;

        const roundTripError = core.computeFrameRoundTripRelativeError(
          sample,
          core.FRAME_HELIO_J2000_ICRF,
          core.FRAME_GCRS_EARTH,
          sample.tdbSeconds
        );
        maxRoundTripError = Math.max(maxRoundTripError, roundTripError);
        core.assertFrameRoundTrip(
          sample,
          core.FRAME_HELIO_J2000_ICRF,
          core.FRAME_GCRS_EARTH,
          sample.tdbSeconds
        );

        const chained = chainTenTransforms(core, sample);
        const chainTenError = canonicalRelativeError(chained, sample);
        maxChainTenError = Math.max(maxChainTenError, chainTenError);
        assert.ok(
          chainTenError < core.FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR,
          `10-transform chain exceeded bound at t=${sample.tdbSeconds}: ${chainTenError}`
        );
      }
    }
  } finally {
    core.resetFrameTransformHooks();
  }

  assert.equal(invariantSampleChecks, expectedSampleCount * 2);
  t.diagnostic(`validatedSampleCount=${expectedSampleCount}`);
  t.diagnostic(`maxEarthErrorKm=${maxEarthErrorM / 1000}`);
  t.diagnostic(`maxMoonErrorKm=${maxMoonErrorM / 1000}`);
  t.diagnostic(`maxRoundTripError=${maxRoundTripError}`);
  t.diagnostic(`maxChainTenError=${maxChainTenError}`);
  t.diagnostic('INV-005 not exercised: Slice 1 validates fixture truth timesteps without a propagator by contract');
});
