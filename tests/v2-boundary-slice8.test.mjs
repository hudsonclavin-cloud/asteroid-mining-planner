import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-slice8');
const slice7FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');
const slice8FixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');
const EXPECTED_ANCHOR_EPOCH_TDB_JD = 2461161.5;
const EXPECTED_BAND_DISTRIBUTION = { A: 3384, B: 5118, C: 1382, D: 116 };
const EXPECTED_ORBIT_LINE_COUNT = 998;
const TOLERANCE = 10;

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
          path.join(repoRoot, 'src', 'v2', 'boundary', 'slice8-asteroid-catalog.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');

      const [core, horizons, slice8Catalog] = await Promise.all([
        import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'slice8-asteroid-catalog.js')).href),
      ]);

      return { core, horizons, slice8Catalog };
    })();
  }

  return compiledModulesPromise;
}

function readFixture(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findAsteroid(catalog, bodyId) {
  const asteroid = catalog.asteroids[bodyId];
  assert.ok(asteroid, `Missing asteroid ${bodyId}`);
  return asteroid;
}

function countBands(asteroids) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  let orbitLines = 0;
  for (const asteroid of Object.values(asteroids)) {
    counts[asteroid.eccentricityBand] += 1;
    if (asteroid.hasOrbitLine) orbitLines += 1;
  }
  return { counts, orbitLines };
}

test('Slice 8 fixture exists and contains the 10,008-body catalog', () => {
  assert.ok(fs.existsSync(slice8FixturePath), `Fixture not found: ${slice8FixturePath}`);
  const fixture = readFixture(slice8FixturePath);

  assert.equal(fixture.selectionSource, 'JPL SBDB');
  assert.equal(fixture.anchorSource, 'NASA/JPL Horizons API');
  assert.equal(fixture.timeScale, 'TDB');
  assert.equal(fixture.propagation.method, 'keplerian-two-body');
  assert.equal(fixture.propagation.anchorEpochTdbJd, EXPECTED_ANCHOR_EPOCH_TDB_JD);
  assert.equal(fixture.catalog.totalBodies, 10008);
  assert.equal(fixture.catalog.mainBeltCount, 10000);
  assert.equal(fixture.catalog.curatedNeaCount, 8);
  assert.equal(fixture.catalog.orbitLineThresholdH, 10.98);
  assert.equal(Object.keys(fixture.asteroids).length, 10008);
});

test('Slice 8 boundary ingestion preserves all 10,008 asteroid records and the Slice 7 subset', async () => {
  const { core, horizons } = await loadModules();
  const slice7Fixture = readFixture(slice7FixturePath);
  const slice8Fixture = readFixture(slice8FixturePath);
  const catalog = horizons.ingestSlice8Fixture(slice8Fixture);

  assert.equal(catalog.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(catalog.catalog.totalBodies, 10008);
  assert.equal(Object.keys(catalog.asteroids).length, 10008);
  assert.equal(
    catalog.propagation.anchorEpochTdbSeconds,
    core.jdTdbToSecondsSinceJ2000(EXPECTED_ANCHOR_EPOCH_TDB_JD),
  );

  for (const bodyId of Object.keys(slice7Fixture.asteroids)) {
    assert.ok(catalog.asteroids[bodyId], `Slice 7 subset missing ${bodyId}`);
  }

  const curatedNeaCount = Object.values(catalog.asteroids).filter((asteroid) => asteroid.isCuratedNea).length;
  assert.equal(curatedNeaCount, 8);
});

test('Slice 8 boundary spot-checks preserve Vesta, Bennu, Apophis, and new extension bodies', async () => {
  const { core, horizons } = await loadModules();
  const fixture = readFixture(slice8FixturePath);
  const catalog = horizons.ingestSlice8Fixture(fixture);

  const vesta = findAsteroid(catalog, 'asteroid-4');
  const bennu = findAsteroid(catalog, 'asteroid-101955');
  const apophis = findAsteroid(catalog, 'asteroid-99942');
  const philia = findAsteroid(catalog, 'asteroid-280');
  const extensionTail = findAsteroid(catalog, 'asteroid-12280');

  assert.equal(vesta.class, 'MBA');
  assert.equal(vesta.isCuratedNea, false);
  assert.equal(vesta.eccentricityBand, 'A');
  assert.equal(vesta.hasOrbitLine, true);
  assert.equal(vesta.elementsFrame, core.FRAME_HELIO_J2000_ECLIPTIC);

  assert.equal(bennu.class, 'APO');
  assert.equal(bennu.isCuratedNea, true);
  assert.equal(bennu.eccentricityBand, 'C');
  assert.equal(bennu.hasOrbitLine, false);

  assert.equal(apophis.class, 'ATE');
  assert.equal(apophis.isCuratedNea, true);
  assert.equal(apophis.eccentricityBand, 'B');
  assert.equal(apophis.hasOrbitLine, false);

  assert.equal(philia.class, 'MBA');
  assert.equal(philia.isCuratedNea, false);
  assert.equal(philia.H, 10.98);
  assert.equal(philia.hasOrbitLine, false);

  assert.equal(extensionTail.class, 'MBA');
  assert.equal(extensionTail.isCuratedNea, false);
  assert.equal(extensionTail.anchorState.frame, core.FRAME_HELIO_J2000_ICRF);
});

test('Slice 8 band distribution and orbit-line count match Round 3 within tolerance', async () => {
  const { horizons } = await loadModules();
  const fixture = readFixture(slice8FixturePath);
  const catalog = horizons.ingestSlice8Fixture(fixture);
  const { counts, orbitLines } = countBands(catalog.asteroids);

  for (const band of Object.keys(EXPECTED_BAND_DISTRIBUTION)) {
    const delta = Math.abs(counts[band] - EXPECTED_BAND_DISTRIBUTION[band]);
    assert.ok(
      delta <= TOLERANCE,
      `Band ${band} drifted by ${delta}; expected ${EXPECTED_BAND_DISTRIBUTION[band]}, got ${counts[band]}`,
    );
  }
  assert.ok(
    Math.abs(orbitLines - EXPECTED_ORBIT_LINE_COUNT) <= 10,
    `Orbit-line count drifted too far: expected ~${EXPECTED_ORBIT_LINE_COUNT}, got ${orbitLines}`,
  );
});

test('Slice 8 browser loader fetches and ingests the asteroid catalog fixture', async () => {
  const { slice8Catalog } = await loadModules();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async json() {
      return readFixture(slice8FixturePath);
    },
  });

  try {
    const catalog = await slice8Catalog.loadSlice8AsteroidCatalogFixture();
    assert.equal(catalog.catalog.totalBodies, 10008);
    assert.equal(Object.keys(catalog.asteroids).length, 10008);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
