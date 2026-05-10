import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-slice7');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');

const REQUIRED_BODY_IDS = ['asteroid-4', 'asteroid-101955', 'asteroid-99942'];
const EXPECTED_ANCHOR_EPOCH_TDB_JD = 2461161.5;

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
          path.join(repoRoot, 'src', 'v2', 'boundary', 'slice7-asteroid-catalog.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');

      const [core, horizons, slice7Catalog] = await Promise.all([
        import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'slice7-asteroid-catalog.js')).href),
      ]);

      return { core, horizons, slice7Catalog };
    })();
  }

  return compiledModulesPromise;
}

function readFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

function findAsteroid(catalog, bodyId) {
  const asteroid = catalog.asteroids[bodyId];
  assert.ok(asteroid, `Missing asteroid ${bodyId}`);
  return asteroid;
}

function positionErrorM(left, right) {
  return Math.hypot(
    left.x - right.x,
    left.y - right.y,
    left.z - right.z,
  );
}

test('Slice 7 fixture contains the 1008-body hybrid catalog and required asteroid ids', () => {
  assert.ok(fs.existsSync(fixturePath), `Fixture not found: ${fixturePath}`);
  const fixture = readFixture();

  assert.equal(fixture.selectionSource, 'JPL SBDB');
  assert.equal(fixture.anchorSource, 'NASA/JPL Horizons API');
  assert.equal(fixture.frame, 'ICRF/J2000');
  assert.equal(fixture.timeScale, 'TDB');
  assert.equal(fixture.propagation.method, 'keplerian-two-body');
  assert.equal(fixture.propagation.anchorEpochTdbJd, EXPECTED_ANCHOR_EPOCH_TDB_JD);
  assert.equal(fixture.catalog.totalBodies, 1008);
  assert.equal(fixture.catalog.mainBeltCount, 1000);
  assert.equal(fixture.catalog.curatedNeaCount, 8);
  assert.equal(Object.keys(fixture.asteroids).length, 1008);

  for (const bodyId of REQUIRED_BODY_IDS) {
    assert.ok(fixture.asteroids[bodyId], `Missing asteroid: ${bodyId}`);
  }
});

test('Slice 7 boundary ingestion preserves all 1008 asteroid records and the 8 curated NEAs', async () => {
  const { core, horizons } = await loadModules();
  const catalog = horizons.ingestSlice7Fixture(readFixture());

  assert.equal(catalog.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(catalog.catalog.totalBodies, 1008);
  assert.equal(Object.keys(catalog.asteroids).length, 1008);
  assert.equal(
    catalog.propagation.anchorEpochTdbSeconds,
    core.jdTdbToSecondsSinceJ2000(EXPECTED_ANCHOR_EPOCH_TDB_JD),
  );

  const curatedNeaCount = Object.values(catalog.asteroids).filter((asteroid) => asteroid.isCuratedNea).length;
  assert.equal(curatedNeaCount, 8);
});

test('Slice 7 boundary spot-checks preserve Vesta, Bennu, and Apophis metadata and heliocentric frame', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture();
  const catalog = horizons.ingestSlice7Fixture(fixture);

  const vesta = findAsteroid(catalog, 'asteroid-4');
  const bennu = findAsteroid(catalog, 'asteroid-101955');
  const apophis = findAsteroid(catalog, 'asteroid-99942');

  assert.equal(vesta.class, 'MBA');
  assert.equal(vesta.isCuratedNea, false);
  assert.equal(vesta.H, 3.25);
  assert.equal(vesta.elementsFrame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(vesta.anchorState.frame, core.FRAME_HELIO_J2000_ICRF);

  assert.equal(bennu.class, 'APO');
  assert.equal(bennu.isCuratedNea, true);
  assert.equal(bennu.H, 20.21);
  assert.equal(bennu.anchorState.frame, core.FRAME_HELIO_J2000_ICRF);

  assert.equal(apophis.class, 'ATE');
  assert.equal(apophis.isCuratedNea, true);
  assert.equal(apophis.H, 19.09);
  assert.equal(apophis.anchorState.frame, core.FRAME_HELIO_J2000_ICRF);

  assert.equal(vesta.anchorState.tdbSeconds, core.jdTdbToSecondsSinceJ2000(fixture.asteroids['asteroid-4'].anchor.epochTdbJd));
});

test('Slice 7 boundary ingestion preserves anchor-position round-trip at the anchor epoch', async () => {
  const { core, horizons } = await loadModules();
  const catalog = horizons.ingestSlice7Fixture(readFixture());
  const vesta = findAsteroid(catalog, 'asteroid-4');

  const propagated = core.propagateKeplerianStateVectors(vesta.elements, vesta.anchorState.tdbSeconds);
  const errorM = positionErrorM(propagated.positionM, vesta.anchorState.positionM);
  assert.ok(errorM <= 1, `expected <= 1 meter anchor round-trip error, got ${errorM} m`);
});

test('Slice 7 browser loader fetches and ingests the asteroid catalog fixture', async () => {
  const { slice7Catalog } = await loadModules();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async json() {
      return readFixture();
    },
  });

  try {
    const catalog = await slice7Catalog.loadSlice7AsteroidCatalogFixture();
    assert.equal(catalog.catalog.totalBodies, 1008);
    assert.equal(Object.keys(catalog.asteroids).length, 1008);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
