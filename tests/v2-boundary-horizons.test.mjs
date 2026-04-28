import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary');

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
  const fixturePath = path.join(repoRoot, 'tests/fixtures/v2/horizons-earth-moon-30d.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

test('jdTdbToSecondsSinceJ2000 converts J2000-relative TDB days into seconds', async () => {
  const { core } = await loadModules();

  assert.equal(core.jdTdbToSecondsSinceJ2000(2451545.0), 0);
  assert.equal(core.jdTdbToSecondsSinceJ2000(2451545.5), 43200);
  assert.equal(core.jdTdbToSecondsSinceJ2000(2451544.5), -43200);
});

test('Slice 1 Earth/Moon fixture ingests into canonical meters, m/s, and aligned TDB seconds', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture();
  const canonical = horizons.ingestSlice1EarthMoonFixture(fixture);

  assert.equal(canonical.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(canonical.earth.length, fixture.targets.earth.records.length);
  assert.equal(canonical.moon.length, fixture.targets.moon.records.length);

  const rawEarth0 = fixture.targets.earth.records[0];
  const earth0 = canonical.earth[0];
  const moon0 = canonical.moon[0];
  const cosObliquity = Math.cos(core.J2000_ECLIPTIC_OBLIQUITY_RAD);
  const sinObliquity = Math.sin(core.J2000_ECLIPTIC_OBLIQUITY_RAD);
  const expectedEarth0Y = (rawEarth0[2] * cosObliquity - rawEarth0[3] * sinObliquity) * 1000;
  const expectedEarth0Z = (rawEarth0[2] * sinObliquity + rawEarth0[3] * cosObliquity) * 1000;
  const expectedTdbSeconds = core.jdTdbToSecondsSinceJ2000(rawEarth0[0]);

  assert.equal(earth0.targetKey, 'earth');
  assert.equal(earth0.state.tdbSeconds, expectedTdbSeconds);
  assert.equal(earth0.state.positionM.x, rawEarth0[1] * 1000);
  assert.ok(Math.abs(earth0.state.positionM.y - expectedEarth0Y) < 1e-3);
  assert.ok(Math.abs(earth0.state.positionM.z - expectedEarth0Z) < 1e-3);
  assert.equal(earth0.state.frame, core.FRAME_HELIO_J2000_ICRF);

  assert.equal(moon0.targetKey, 'moon');
  assert.equal(moon0.state.tdbSeconds, earth0.state.tdbSeconds);
  assert.equal(moon0.state.frame, core.FRAME_HELIO_J2000_ICRF);
});

test('convertHorizonsRecord accepts object-form records with Horizons-native aliases', async () => {
  const { core, horizons } = await loadModules();

  const sample = horizons.convertHorizonsRecord('earth', {
    jd: 2451545.25,
    x: 1,
    y: 2,
    z: 3,
    vx: 4,
    vy: 5,
    vz: 6,
  }, {
    targetId: '399',
    targetName: 'Earth',
    frame: 'ICRF',
    origin: 'heliocentric',
  });

  assert.equal(sample.state.tdbSeconds, 21600);
  assert.deepEqual(sample.state.positionM, { x: 1000, y: 2000, z: 3000 });
  assert.deepEqual(sample.state.velocityMps, { x: 4000, y: 5000, z: 6000 });
  assert.equal(sample.state.frame, core.FRAME_HELIO_J2000_ICRF);
});

test('convertHorizonsRecord rotates ecliptic J2000 vectors into canonical ICRF coordinates', async () => {
  const { core, horizons } = await loadModules();
  const sample = horizons.convertHorizonsRecord('earth', [2451545, 1, 2, 3, 4, 5, 6], {
    frame: 'Ecliptic of J2000.0',
    origin: 'heliocentric',
  });

  const cosObliquity = Math.cos(core.J2000_ECLIPTIC_OBLIQUITY_RAD);
  const sinObliquity = Math.sin(core.J2000_ECLIPTIC_OBLIQUITY_RAD);

  assert.equal(sample.state.positionM.x, 1000);
  assert.ok(Math.abs(sample.state.positionM.y - ((2 * cosObliquity - 3 * sinObliquity) * 1000)) < 1e-9);
  assert.ok(Math.abs(sample.state.positionM.z - ((2 * sinObliquity + 3 * cosObliquity) * 1000)) < 1e-9);
});
