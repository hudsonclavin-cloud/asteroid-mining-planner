import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-slice2');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-inner-system-90d.json');

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

test('Slice 2 fixture file exists and parses as valid JSON', () => {
  assert.ok(fs.existsSync(fixturePath), `Fixture not found: ${fixturePath}`);
  const fixture = readFixture();
  assert.equal(typeof fixture, 'object');
  assert.ok(fixture !== null);
});

test('Slice 2 fixture contains all six required target keys', () => {
  const fixture = readFixture();
  const required = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
  for (const key of required) {
    assert.ok(fixture.targets[key], `Missing target: ${key}`);
  }
});

test('Each body in Slice 2 fixture has 90-92 records (91 ± 1)', () => {
  const fixture = readFixture();
  const bodies = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
  for (const body of bodies) {
    const count = fixture.targets[body].records.length;
    assert.ok(count >= 90 && count <= 92, `${body} has ${count} records, expected 90-92`);
  }
});

test('Moon records after ingestion have frame matching FRAME_GCRS_EARTH', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture();
  const allStates = horizons.ingestSlice2Fixture(fixture);
  const moonStates = allStates.moon;

  assert.ok(Array.isArray(moonStates) && moonStates.length > 0, 'Moon states must be non-empty');
  for (const sample of moonStates) {
    assert.equal(
      sample.state.frame,
      core.FRAME_GCRS_EARTH,
      `Moon state has unexpected frame: ${sample.state.frame}`,
    );
  }
});

test('All non-Moon bodies after ingestion have frame matching FRAME_HELIO_J2000_ICRF', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture();
  const allStates = horizons.ingestSlice2Fixture(fixture);
  const nonMoonBodies = ['sun', 'mercury', 'venus', 'earth', 'mars'];

  for (const body of nonMoonBodies) {
    const states = allStates[body];
    assert.ok(Array.isArray(states) && states.length > 0, `${body} states must be non-empty`);
    for (const sample of states) {
      assert.equal(
        sample.state.frame,
        core.FRAME_HELIO_J2000_ICRF,
        `${body} state has unexpected frame: ${sample.state.frame}`,
      );
    }
  }
});

test('First Earth record position magnitude in meters is between 1.48e11 and 1.52e11 (~1 AU)', async () => {
  const { horizons } = await loadModules();
  const fixture = readFixture();
  const allStates = horizons.ingestSlice2Fixture(fixture);
  const earth0 = allStates.earth[0].state;

  const mag = Math.sqrt(
    earth0.positionM.x ** 2 +
    earth0.positionM.y ** 2 +
    earth0.positionM.z ** 2,
  );

  assert.ok(
    mag >= 1.48e11 && mag <= 1.52e11,
    `Earth position magnitude ${mag.toExponential(4)} is outside expected 1 AU range [1.48e11, 1.52e11]`,
  );
});
