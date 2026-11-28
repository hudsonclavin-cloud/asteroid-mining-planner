import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-return-pinned-cells');
const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests', 'fixtures', 'v2', 'return-pinned-cells.json'), 'utf8'));
const earthFixturePath = path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json');
const catalogFixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

function compileModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(process.execPath, [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', '--skipLibCheck', 'true',
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'grid-compute.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'lambert-multi-rev.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
}

async function loadModules() {
  compileModules();
  const [grid, keplerian, hermite, units, horizons, catalog] = await Promise.all([
    import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'grid-compute.js')).href),
    import(pathToFileURL(path.join(tempOutDir, 'core', 'propagators', 'keplerian.js')).href),
    import(pathToFileURL(path.join(tempOutDir, 'core', 'interpolators', 'hermite.js')).href),
    import(pathToFileURL(path.join(tempOutDir, 'core', 'units.js')).href),
    import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
    import(pathToFileURL(path.join(tempOutDir, 'boundary', 'slice9-nea-catalog.js')).href),
  ]);
  const earth = horizons.ingestSlice2Fixture(JSON.parse(fs.readFileSync(earthFixturePath, 'utf8'))).earth.map((sample) => sample.state);
  const bodies = new Map(Object.values(catalog.ingestSlice9Fixture(JSON.parse(fs.readFileSync(catalogFixturePath, 'utf8'))).asteroids).map((body) => [body.designation, body]));
  return { ...grid, ...keplerian, ...hermite, ...units, earth, bodies };
}

const toCanon = (state) => ({
  frame: 'FRAME_HELIO_J2000_ICRF',
  tdbSeconds: state.tdbSeconds,
  positionM: state.positionM,
  velocityMps: state.velocityMps,
});
const vectorError = (actual, expected) => Math.max(...actual.map((value, index) => Math.abs(value - expected[index])));

test('return kernel matches the pinned izzo vectors for M0, M1, and M2 cases', async () => {
  const modules = await loadModules();
  for (const pinned of fixture.cases) {
    const body = modules.bodies.get(pinned.designation);
    assert.ok(body, `catalog body ${pinned.designation} exists`);
    const departureTdbSeconds = modules.jdTdbToSecondsSinceJ2000(pinned.depJD);
    const arrivalTdbSeconds = departureTdbSeconds + pinned.tofDays * 86_400;
    const asteroid = modules.propagateKeplerianStateVectors(body.elements, departureTdbSeconds);
    const earth = modules.interpolateBodyStateSeries('earth', modules.earth, arrivalTdbSeconds);
    const result = modules.computeReturnPorkchopGrid(
      body.elements,
      {
        depStartJD: pinned.depJD,
        depEndJD: pinned.depJD,
        tofMinDays: pinned.tofDays,
        tofMaxDays: pinned.tofDays,
        nDep: 1,
        nTof: 1,
        earthMaxTdbSeconds: modules.earth.at(-1).tdbSeconds,
      },
      pinned.M,
      {
        getEarthStateAtTdbSeconds: (tdbSeconds) => {
          assert.ok(Math.abs(tdbSeconds - arrivalTdbSeconds) <= 1e-3, `${pinned.id}: Earth arrival epoch`);
          return toCanon(earth);
        },
        propagateTargetStateAtTdbSeconds: (elements, tdbSeconds) => {
          assert.strictEqual(elements, body.elements);
          assert.ok(Math.abs(tdbSeconds - departureTdbSeconds) <= 1e-3, `${pinned.id}: asteroid departure epoch`);
          return toCanon(asteroid);
        },
      },
    );
    const branch = result.cells[0].branches.find((candidate) => candidate.branch === pinned.branch);
    assert.ok(branch?.converged, `${pinned.id}: pinned branch converged`);
    assert.ok(vectorError(branch.v1, pinned.v1KmS) <= 1e-9, `${pinned.id}: v1 vector`);
    assert.ok(vectorError(branch.v2, pinned.v2KmS) <= 1e-9, `${pinned.id}: v2 vector`);
    assert.ok(vectorError(branch.vInfE, pinned.vInfEKmS) <= 1e-9, `${pinned.id}: vInfE vector`);
  }
});
