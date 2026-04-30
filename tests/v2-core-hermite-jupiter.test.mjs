import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-hermite-jupiter');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-jupiter-system-90d.json');
const dataDir = path.join(repoRoot, 'tools', 'slice3-research', 'data');
const J2000_JD = 2451545.0;
const SECONDS_PER_DAY = 86400;

const BODY_CONFIG = {
  jupiter: { truthFile: 'truth-jupiter.json', barKm: 50 },
  io: { truthFile: 'truth-15m-io.json', barKm: 5 },
  europa: { truthFile: 'truth-europa.json', barKm: 20 },
  ganymede: { truthFile: 'truth-ganymede.json', barKm: 20 },
  callisto: { truthFile: 'truth-callisto.json', barKm: 50 },
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

function loadTruthStates(core, bodyId, truthFile, frame) {
  const raw = readJson(path.join(dataDir, truthFile));
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

test('Slice 3 Jupiter-system Hermite interpolation stays below INV-009 bars', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readJson(fixturePath);
  const allStates = horizons.ingestSlice3Fixture(fixture);

  for (const [bodyId, { truthFile, barKm }] of Object.entries(BODY_CONFIG)) {
    const fixtureSamples = allStates[bodyId].map((sample) => sample.state);
    const truthStates = loadTruthStates(core, bodyId, truthFile, fixtureSamples[0].frame);
    const truthByTime = new Map(truthStates.map((state) => [state.tdbSeconds, state]));
    const errorsKm = [];

    for (const truthState of truthStates) {
      const tdbSeconds = truthState.tdbSeconds;
      if (tdbSeconds <= fixtureSamples[0].tdbSeconds || tdbSeconds >= fixtureSamples.at(-1).tdbSeconds) {
        continue;
      }

      let estimate = null;
      for (const fixtureState of fixtureSamples) {
        if (fixtureState.tdbSeconds === tdbSeconds) {
          estimate = fixtureState;
          break;
        }
      }
      if (!estimate) {
        estimate = core.interpolateBodyStateSeries(bodyId, fixtureSamples, tdbSeconds);
      }

      core.assertInterpolationError(estimate, truthState, bodyId);

      const dx = estimate.positionM.x - truthState.positionM.x;
      const dy = estimate.positionM.y - truthState.positionM.y;
      const dz = estimate.positionM.z - truthState.positionM.z;
      errorsKm.push(Math.sqrt(dx * dx + dy * dy + dz * dz) / 1000);
    }

    const maxErrorKm = Math.max(...errorsKm);
    const rmsErrorKm = computeRmsKm(errorsKm);

    console.log(
      `slice3Hermite ${bodyId} maxErrorKm=${maxErrorKm} rmsErrorKm=${rmsErrorKm} barKm=${barKm} checked=${errorsKm.length}`
    );
    assert.ok(maxErrorKm <= barKm, `${bodyId} max error ${maxErrorKm} km exceeded ${barKm} km`);
  }
});
