import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-slice6');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-mars-system-90d.json');

const REQUIRED_KEYS = ['mars', 'phobos', 'deimos'];
const MARS_MOON_KEYS = ['phobos', 'deimos'];

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

test('Slice 6 fixture contains all three required target keys', () => {
  const fixture = readFixture();
  for (const key of REQUIRED_KEYS) {
    assert.ok(fixture.targets[key], `Missing target: ${key}`);
  }
});

test('Slice 6 fixture origin tags match heliocentric Mars and mars-centered moons', () => {
  const fixture = readFixture();

  assert.equal(fixture.targets.mars.origin, 'heliocentric');
  for (const key of MARS_MOON_KEYS) {
    assert.equal(fixture.targets[key].origin, 'mars-centered', `${key} has unexpected origin`);
  }
});

test('inferCanonicalFrame maps mars-centered origins to FRAME_MARS_J2000_ICRF', async () => {
  const { core, horizons } = await loadModules();

  assert.equal(
    horizons.inferCanonicalFrame('ICRF/J2000', 'mars-centered'),
    core.FRAME_MARS_J2000_ICRF,
  );
  assert.equal(
    horizons.inferCanonicalFrame(undefined, 'MARS-CENTERED'),
    core.FRAME_MARS_J2000_ICRF,
  );
});

test('Slice 6 tuple records ingest into canonical meters, m/s, TDB seconds, and Mars-centered moon frames', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture();
  const allStates = horizons.ingestSlice6Fixture(fixture);

  const rawMars0 = fixture.targets.mars.records[0];
  const mars0 = allStates.mars[0];
  const rawPhobos0 = fixture.targets.phobos.records[0];
  const phobos0 = allStates.phobos[0];
  const rawDeimos0 = fixture.targets.deimos.records[0];
  const deimos0 = allStates.deimos[0];

  assert.equal(mars0.targetKey, 'mars');
  assert.equal(mars0.sourceOrigin, 'heliocentric');
  assert.equal(mars0.state.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(mars0.state.tdbSeconds, core.jdTdbToSecondsSinceJ2000(rawMars0[0]));

  assert.equal(phobos0.targetKey, 'phobos');
  assert.equal(phobos0.sourceOrigin, 'mars-centered');
  assert.equal(phobos0.state.frame, core.FRAME_MARS_J2000_ICRF);
  assert.equal(phobos0.state.tdbSeconds, core.jdTdbToSecondsSinceJ2000(rawPhobos0[0]));

  assert.equal(deimos0.targetKey, 'deimos');
  assert.equal(deimos0.sourceOrigin, 'mars-centered');
  assert.equal(deimos0.state.frame, core.FRAME_MARS_J2000_ICRF);
  assert.equal(deimos0.state.tdbSeconds, core.jdTdbToSecondsSinceJ2000(rawDeimos0[0]));

  assert.deepEqual(phobos0.state.positionM, {
    x: rawPhobos0[1] * 1000,
    y: rawPhobos0[2] * 1000,
    z: rawPhobos0[3] * 1000,
  });
  assert.deepEqual(deimos0.state.velocityMps, {
    x: rawDeimos0[4] * 1000,
    y: rawDeimos0[5] * 1000,
    z: rawDeimos0[6] * 1000,
  });
});
