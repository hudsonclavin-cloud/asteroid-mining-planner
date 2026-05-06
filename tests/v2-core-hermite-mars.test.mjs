import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-hermite-mars');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-mars-system-90d.json');
const slice2DataDir = path.join(repoRoot, 'tools', 'slice2-research', 'data');
const slice6DataDir = path.join(repoRoot, 'tools', 'slice6-research', 'data');
const J2000_JD = 2451545.0;
const SECONDS_PER_DAY = 86400;
const ERROR_TOLERANCE_KM = 1e-6;

const BODY_CONFIG = {
  mars: {
    truthPath: path.join(slice2DataDir, 'truth-mars.json'),
    frameKey: 'helio',
    barKm: 0.05,
    expectedMaxErrorKm: 0.00893253,
    expectedRmsErrorKm: 0.00528875,
    expectedCheckedPoints: 270,
  },
  phobos: {
    truthPath: path.join(slice6DataDir, 'phobos-5m.json'),
    frameKey: 'mars',
    barKm: 5,
    expectedMaxErrorKm: 0.7787715830870973,
    expectedRmsErrorKm: 0.48601715486893415,
    expectedCheckedPoints: 21600,
  },
  deimos: {
    truthPath: path.join(slice6DataDir, 'deimos-15m.json'),
    frameKey: 'mars',
    barKm: 0.5,
    expectedMaxErrorKm: 0.11319505860795823,
    expectedRmsErrorKm: 0.08328683543873142,
    expectedCheckedPoints: 6480,
  },
};

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

function jdToTdbSeconds(jdTdb) {
  return (jdTdb - J2000_JD) * SECONDS_PER_DAY;
}

function loadTruthStates(core, bodyId, truthPath, frame) {
  const raw = readJson(truthPath);
  return raw.samples.map((sample) =>
    core.createCanonicalState({
      frame,
      tdbSeconds: jdToTdbSeconds(sample.jdTdb),
      positionM: {
        x: sample.positionKm.x * 1000,
        y: sample.positionKm.y * 1000,
        z: sample.positionKm.z * 1000,
      },
      velocityMps: {
        x: sample.velocityKms.x * 1000,
        y: sample.velocityKms.y * 1000,
        z: sample.velocityKms.z * 1000,
      },
      radiusM: core.BODY_CONSTANTS[bodyId].radiusM,
    })
  );
}

function computeRmsKm(errorsKm) {
  const meanSquare = errorsKm.reduce((sum, value) => sum + value * value, 0) / errorsKm.length;
  return Math.sqrt(meanSquare);
}

test('Slice 6 Mars-system Hermite interpolation stays below INV-008/INV-011 bars with pre-research-matching error', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readJson(fixturePath);
  const allStates = horizons.ingestSlice6Fixture(fixture);

  const frames = {
    helio: core.FRAME_HELIO_J2000_ICRF,
    mars: core.FRAME_MARS_J2000_ICRF,
  };

  for (const [bodyId, config] of Object.entries(BODY_CONFIG)) {
    const fixtureSamples = allStates[bodyId].map((sample) => sample.state);
    const truthStates = loadTruthStates(core, bodyId, config.truthPath, frames[config.frameKey]);
    const fixtureTimes = new Set(fixtureSamples.map((sample) => sample.tdbSeconds));
    const errorsKm = [];

    for (const truthState of truthStates) {
      const tdbSeconds = truthState.tdbSeconds;
      if (tdbSeconds <= fixtureSamples[0].tdbSeconds || tdbSeconds >= fixtureSamples.at(-1).tdbSeconds) {
        continue;
      }
      if (fixtureTimes.has(tdbSeconds)) {
        continue;
      }

      const estimate = core.interpolateBodyStateSeries(bodyId, fixtureSamples, tdbSeconds);
      core.assertInterpolationError(estimate, truthState, bodyId);

      const dx = estimate.positionM.x - truthState.positionM.x;
      const dy = estimate.positionM.y - truthState.positionM.y;
      const dz = estimate.positionM.z - truthState.positionM.z;
      errorsKm.push(Math.sqrt(dx * dx + dy * dy + dz * dz) / 1000);
    }

    const maxErrorKm = Math.max(...errorsKm);
    const rmsErrorKm = computeRmsKm(errorsKm);

    console.log(
      `slice6Hermite ${bodyId} maxErrorKm=${maxErrorKm} rmsErrorKm=${rmsErrorKm} barKm=${config.barKm} checked=${errorsKm.length}`
    );

    assert.equal(errorsKm.length, config.expectedCheckedPoints, `${bodyId} checked-point count drifted`);
    assert.ok(maxErrorKm <= config.barKm, `${bodyId} max error ${maxErrorKm} km exceeded ${config.barKm} km`);
    assert.ok(
      Math.abs(maxErrorKm - config.expectedMaxErrorKm) <= ERROR_TOLERANCE_KM,
      `${bodyId} max error ${maxErrorKm} km drifted from pre-research ${config.expectedMaxErrorKm} km`
    );
    assert.ok(
      Math.abs(rmsErrorKm - config.expectedRmsErrorKm) <= ERROR_TOLERANCE_KM,
      `${bodyId} RMS error ${rmsErrorKm} km drifted from pre-research ${config.expectedRmsErrorKm} km`
    );
  }
});
