import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-asteroid-orbits');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');

let modulePromise;

function compileModules() {
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
      path.join(repoRoot, 'src', 'v2', 'render', 'asteroid-orbits.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

async function loadModules() {
  if (!modulePromise) {
    compileModules();
    modulePromise = Promise.all([
      import(pathToFileURL(path.join(tempOutDir, 'render', 'asteroid-orbits.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'core', 'propagators', 'keplerian.js')).href),
      import('three'),
    ]).then(([orbits, horizons, keplerian, THREE]) => ({ orbits, horizons, keplerian, THREE }));
  }

  return modulePromise;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('orbit-batch geometry uses the expected concatenated vertex count', async () => {
  const { orbits, horizons } = await loadModules();
  const fixture = readJson(fixturePath);
  const catalog = horizons.ingestSlice7Fixture(fixture);
  const asteroids = Object.values(catalog.asteroids);
  const batch = orbits.createAsteroidOrbitBatch(asteroids);
  const expectedVertices = asteroids.reduce(
    (sum, asteroid) => sum + orbits.getAsteroidOrbitSegmentCount(asteroid) * 2,
    0,
  );

  assert.equal(batch.geometry.attributes.position.count, expectedVertices);
  assert.equal(batch.rangesByBodyId.size, asteroids.length);
});

test('orbit-batch material matches the DEC-11 MVP line settings', async () => {
  const { orbits, horizons, THREE } = await loadModules();
  const fixture = readJson(fixturePath);
  const catalog = horizons.ingestSlice7Fixture(fixture);
  const batch = orbits.createAsteroidOrbitBatch(Object.values(catalog.asteroids));

  assert.ok(batch.material instanceof THREE.LineBasicMaterial);
  assert.equal(batch.material.color.getHex(), orbits.ASTEROID_ORBIT_BASE_COLOR_HEX);
  assert.equal(batch.material.opacity, orbits.ASTEROID_ORBIT_BASE_OPACITY);
  assert.equal(batch.material.transparent, true);
  assert.equal(batch.material.depthTest, true);
  assert.equal(batch.material.depthWrite, false);
  assert.equal(batch.material.blending, THREE.NormalBlending);
});

test('orbit-batch vertices for Vesta match the sampled ellipse positions', async () => {
  const { orbits, horizons, keplerian } = await loadModules();
  const fixture = readJson(fixturePath);
  const catalog = horizons.ingestSlice7Fixture(fixture);
  const asteroids = Object.values(catalog.asteroids);
  const batch = orbits.createAsteroidOrbitBatch(asteroids);
  const vesta = catalog.asteroids['asteroid-4'];
  const range = batch.rangesByBodyId.get(vesta.bodyId);

  assert.ok(range, 'Missing Vesta orbit range');
  const expectedSamples = keplerian.sampleOrbitEllipse(vesta.elements, range.segmentCount);
  const positionAttribute = batch.geometry.attributes.position;
  const firstStartIndex = range.vertexOffset;
  const firstEndIndex = range.vertexOffset + 1;

  assert.equal(positionAttribute.getX(firstStartIndex), Math.fround(expectedSamples[0].x));
  assert.equal(positionAttribute.getY(firstStartIndex), Math.fround(expectedSamples[0].y));
  assert.equal(positionAttribute.getZ(firstStartIndex), Math.fround(expectedSamples[0].z));
  assert.equal(positionAttribute.getX(firstEndIndex), Math.fround(expectedSamples[1].x));
  assert.equal(positionAttribute.getY(firstEndIndex), Math.fround(expectedSamples[1].y));
  assert.equal(positionAttribute.getZ(firstEndIndex), Math.fround(expectedSamples[1].z));
});
