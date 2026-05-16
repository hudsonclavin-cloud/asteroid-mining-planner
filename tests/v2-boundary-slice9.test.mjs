import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-slice9');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

const EXPECTED_TOTAL_BODIES = 41906;
const EXPECTED_CLASS_DISTRIBUTION = {
  AMO: 14516,
  APO: 23757,
  ATE: 3387,
  ETC: 6,
  HTC: 36,
  IEO: 38,
  JFC: 166,
};
const EXPECTED_TIER_DISTRIBUTION = {
  'visualization-tier': 41775,
  'planning-tier': 0,
  'not-kepler-safe': 131,
};
const EXPECTED_MISSING_H_COUNT = 210;
const EXPECTED_ANOMALY_TAIL_COUNT = 208;

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
          path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');

      const [core, slice9Catalog] = await Promise.all([
        import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href),
        import(pathToFileURL(path.join(tempOutDir, 'boundary', 'slice9-nea-catalog.js')).href),
      ]);

      return { core, slice9Catalog };
    })();
  }

  return compiledModulesPromise;
}

function readFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

function findAsteroid(catalog, designation) {
  const bodyId = `asteroid-${designation}`;
  const asteroid = catalog.asteroids[bodyId];
  assert.ok(asteroid, `Missing asteroid ${bodyId}`);
  return asteroid;
}

test('Slice 9 fixture exists and contains the live 41,906-body NEA catalog', () => {
  assert.ok(fs.existsSync(fixturePath), `Fixture not found: ${fixturePath}`);
  const fixture = readFixture();

  assert.equal(fixture.selectionSource, 'JPL SBDB Query API (sb-group=neo)');
  assert.equal(fixture.anchorSource, 'SBDB osculating elements propagated at element epoch');
  assert.equal(fixture.timeScale, 'TDB');
  assert.equal(fixture.propagation.method, 'keplerian-two-body');
  assert.equal(fixture.propagation.epochPolicy, 'per-body-sbdb-osculating-elements');
  assert.equal(fixture.catalog.totalBodies, EXPECTED_TOTAL_BODIES);
  assert.equal(Object.keys(fixture.asteroids).length, EXPECTED_TOTAL_BODIES);
  assert.deepEqual(fixture.catalog.classDistribution, EXPECTED_CLASS_DISTRIBUTION);
  assert.deepEqual(fixture.catalog.inv014TierDistribution, EXPECTED_TIER_DISTRIBUTION);
  assert.equal(fixture.catalog.missingAbsoluteMagnitudeCount, EXPECTED_MISSING_H_COUNT);
  assert.equal(fixture.catalog.anomalyTailCount, EXPECTED_ANOMALY_TAIL_COUNT);
});

test('Slice 9 boundary ingestion preserves the full catalog and tier counts', async () => {
  const { core, slice9Catalog } = await loadModules();
  const catalog = slice9Catalog.ingestSlice9Fixture(readFixture());

  assert.equal(catalog.frame, core.FRAME_HELIO_J2000_ICRF);
  assert.equal(catalog.catalog.totalBodies, EXPECTED_TOTAL_BODIES);
  assert.equal(Object.keys(catalog.asteroids).length, EXPECTED_TOTAL_BODIES);
  assert.deepEqual(catalog.catalog.classDistribution, EXPECTED_CLASS_DISTRIBUTION);
  assert.deepEqual(catalog.catalog.inv014TierDistribution, EXPECTED_TIER_DISTRIBUTION);
  assert.equal(catalog.closeApproachWindow.start, '2026-05-01');
  assert.equal(catalog.closeApproachWindow.stop, '2026-07-30');
  assert.equal(catalog.closeApproachWindow.distMaxAu, '0.05');
  assert.deepEqual(catalog.closeApproachWindow.bodies, ['Earth', 'Venus']);
});

test('Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies', async () => {
  const { core, slice9Catalog } = await loadModules();
  const catalog = slice9Catalog.ingestSlice9Fixture(readFixture());

  const eros = findAsteroid(catalog, '433');
  const bennu = findAsteroid(catalog, '101955');
  const apophis = findAsteroid(catalog, '99942');
  const atira = findAsteroid(catalog, '163693');
  const flagged = findAsteroid(catalog, '152637');
  const halley = findAsteroid(catalog, '1P');

  assert.equal(eros.class, 'AMO');
  assert.equal(eros.inv014Tier, 'visualization-tier');
  assert.equal(eros.H, 10.39);
  assert.equal(eros.elementsFrame, core.FRAME_HELIO_J2000_ECLIPTIC);

  assert.equal(bennu.class, 'APO');
  assert.equal(bennu.pha, true);
  assert.equal(bennu.inv014Tier, 'visualization-tier');
  assert.equal(bennu.eccentricityBand, 'C');

  assert.equal(apophis.class, 'ATE');
  assert.equal(apophis.inv014Tier, 'visualization-tier');
  assert.equal(apophis.H, 19.09);

  assert.equal(atira.class, 'IEO');
  assert.equal(atira.inv014Tier, 'visualization-tier');
  assert.equal(atira.H, 16.41);

  assert.equal(flagged.class, 'ATE');
  assert.equal(flagged.inv014Tier, 'not-kepler-safe');
  assert.equal(flagged.pha, true);

  assert.equal(halley.class, 'HTC');
  assert.equal(halley.H, null);
  assert.equal(halley.estimatedRadiusM, null);
  assert.equal(halley.inv014Tier, 'visualization-tier');
});

test('Slice 9 quality metadata and anchor semantics stay internally consistent', async () => {
  const { slice9Catalog } = await loadModules();
  const catalog = slice9Catalog.ingestSlice9Fixture(readFixture());

  let nullHCount = 0;
  let anomalyTailCount = 0;
  let notKeplerSafeCount = 0;

  for (const asteroid of Object.values(catalog.asteroids)) {
    assert.equal(
      asteroid.anchorState.tdbSeconds,
      asteroid.elements.epochTdbSeconds,
      `${asteroid.bodyId} anchor state epoch should match element epoch`,
    );
    assert.ok(asteroid.qualityRank >= 0 && asteroid.qualityRank <= 1, `${asteroid.bodyId} qualityRank`);
    if (asteroid.H === null) {
      nullHCount += 1;
      assert.equal(asteroid.estimatedRadiusM, null, `${asteroid.bodyId} radius must be null when H is null`);
    }
    if (!['AMO', 'APO', 'ATE', 'IEO'].includes(asteroid.class)) {
      anomalyTailCount += 1;
    }
    if (asteroid.inv014Tier === 'not-kepler-safe') {
      notKeplerSafeCount += 1;
    }
  }

  assert.equal(nullHCount, EXPECTED_MISSING_H_COUNT);
  assert.equal(anomalyTailCount, EXPECTED_ANOMALY_TAIL_COUNT);
  assert.equal(notKeplerSafeCount, EXPECTED_TIER_DISTRIBUTION['not-kepler-safe']);
});

test('Slice 9 browser loader fetches and ingests the NEA catalog fixture', async () => {
  const { slice9Catalog } = await loadModules();
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
    const catalog = await slice9Catalog.loadSlice9NeaCatalogFixture();
    assert.equal(catalog.catalog.totalBodies, EXPECTED_TOTAL_BODIES);
    assert.equal(Object.keys(catalog.asteroids).length, EXPECTED_TOTAL_BODIES);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
