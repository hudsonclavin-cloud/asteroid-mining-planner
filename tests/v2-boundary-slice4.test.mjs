import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-slice4');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-saturn-system-90d.json');

const REQUIRED_KEYS = ['saturn', 'titan', 'rhea', 'iapetus', 'tethys', 'dione', 'mimas', 'enceladus'];
const SATURN_MOON_KEYS = ['titan', 'rhea', 'iapetus', 'tethys', 'dione', 'mimas', 'enceladus'];

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

function readFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

test('Slice 4 fixture contains all eight required target keys', () => {
  const fixture = readFixture();
  for (const key of REQUIRED_KEYS) {
    assert.ok(fixture.targets[key], `Missing target: ${key}`);
  }
});

test('Slice 4 fixture origin tags match heliocentric Saturn and saturn-centered moons', () => {
  const fixture = readFixture();

  assert.equal(fixture.targets.saturn.origin, 'heliocentric');
  for (const key of SATURN_MOON_KEYS) {
    assert.equal(fixture.targets[key].origin, 'saturn-centered', `${key} has unexpected origin`);
  }
});

test('inferCanonicalFrame maps saturn-centered origins to FRAME_SATURN_J2000_ICRF', async () => {
  const { core, horizons } = await loadModules();

  assert.equal(
    horizons.inferCanonicalFrame('ICRF/J2000', 'saturn-centered'),
    core.FRAME_SATURN_J2000_ICRF,
  );
  assert.equal(
    horizons.inferCanonicalFrame(undefined, 'SATURN-CENTERED'),
    core.FRAME_SATURN_J2000_ICRF,
  );
});

test('Slice 4 tuple records ingest into canonical meters, m/s, TDB seconds, and Saturn-centered moon frames', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture();
  const allStates = horizons.ingestSlice4Fixture(fixture);

  const rawSaturn0 = fixture.targets.saturn.records[0];
  const saturn0 = allStates.saturn[0];
  const rawTitan0 = fixture.targets.titan.records[0];
  const titan0 = allStates.titan[0];

  assert.equal(saturn0.targetKey, 'saturn');
  assert.equal(saturn0.sourceOrigin, 'heliocentric');
  assert.equal(saturn0.state.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(saturn0.state.tdbSeconds, core.jdTdbToSecondsSinceJ2000(rawSaturn0[0]));
  assert.deepEqual(saturn0.state.positionM, {
    x: rawSaturn0[1] * 1000,
    y: rawSaturn0[2] * 1000,
    z: rawSaturn0[3] * 1000,
  });
  assert.deepEqual(saturn0.state.velocityMps, {
    x: rawSaturn0[4] * 1000,
    y: rawSaturn0[5] * 1000,
    z: rawSaturn0[6] * 1000,
  });

  assert.equal(titan0.targetKey, 'titan');
  assert.equal(titan0.sourceOrigin, 'saturn-centered');
  assert.equal(titan0.state.frame, core.FRAME_SATURN_J2000_ICRF);
  assert.equal(titan0.state.tdbSeconds, core.jdTdbToSecondsSinceJ2000(rawTitan0[0]));
  assert.deepEqual(titan0.state.positionM, {
    x: rawTitan0[1] * 1000,
    y: rawTitan0[2] * 1000,
    z: rawTitan0[3] * 1000,
  });
  assert.deepEqual(titan0.state.velocityMps, {
    x: rawTitan0[4] * 1000,
    y: rawTitan0[5] * 1000,
    z: rawTitan0[6] * 1000,
  });
});
