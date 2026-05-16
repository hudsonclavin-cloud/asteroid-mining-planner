import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-boundary-star-catalog');
const catalogPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'star-catalog-tycho2-mag75.bin');

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
      path.join(repoRoot, 'src', 'v2', 'boundary', 'star-catalog-tycho2.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let boundaryModulePromise;

async function loadBoundaryModule() {
  if (!boundaryModulePromise) {
    compileModules();
    boundaryModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'boundary', 'star-catalog-tycho2.js')).href
    );
  }

  return boundaryModulePromise;
}

function loadRawBuffer() {
  const nodeBuffer = fs.readFileSync(catalogPath);
  return nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength,
  );
}

function findNearestStar(catalog, expectedDirection) {
  let bestIndex = -1;
  let bestCloseness = -Infinity;

  for (let index = 0; index < catalog.count; index += 1) {
    const offset = index * 3;
    const closeness =
      catalog.positions[offset] * expectedDirection[0] +
      catalog.positions[offset + 1] * expectedDirection[1] +
      catalog.positions[offset + 2] * expectedDirection[2];
    if (closeness > bestCloseness) {
      bestCloseness = closeness;
      bestIndex = index;
    }
  }

  return { index: bestIndex, closeness: bestCloseness };
}

function raDecDegToUnitVector(raDeg, decDeg) {
  const raRad = (raDeg * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  const cosDec = Math.cos(decRad);
  return [
    cosDec * Math.cos(raRad),
    cosDec * Math.sin(raRad),
    Math.sin(decRad),
  ];
}

test('load succeeds, count matches header, and Sirius sorts first', async () => {
  const starCatalog = await loadBoundaryModule();
  const originalFetch = globalThis.fetch;
  const arrayBuffer = loadRawBuffer();

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async arrayBuffer() {
      return arrayBuffer;
    },
  });

  try {
    const catalog = await starCatalog.loadStarCatalog();
    assert.equal(catalog.count, 10_000);
    assert.equal(catalog.positions.length, catalog.count * 3);
    assert.equal(catalog.magnitudes.length, catalog.count);
    assert.equal(catalog.colors.length, catalog.count * 3);

    const siriusDirection = raDecDegToUnitVector(101.2871554119, -16.7161158679);
    const sirius = findNearestStar(catalog, siriusDirection);
    assert.equal(sirius.index, 0);
    assert.ok(sirius.closeness > 0.999999);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('positions are unit vectors, magnitudes are sane, and colors stay in range', async () => {
  const starCatalog = await loadBoundaryModule();
  const catalog = starCatalog.parseStarCatalog(loadRawBuffer());

  for (let index = 0; index < catalog.count; index += 1) {
    const positionOffset = index * 3;
    const magnitude = Math.hypot(
      catalog.positions[positionOffset],
      catalog.positions[positionOffset + 1],
      catalog.positions[positionOffset + 2],
    );
    assert.ok(Math.abs(magnitude - 1) <= 1e-4);
    assert.ok(catalog.magnitudes[index] >= -2 && catalog.magnitudes[index] <= 8);
    assert.ok(
      catalog.colors[positionOffset] >= 0 && catalog.colors[positionOffset] <= 1 &&
      catalog.colors[positionOffset + 1] >= 0 && catalog.colors[positionOffset + 1] <= 1 &&
      catalog.colors[positionOffset + 2] >= 0 && catalog.colors[positionOffset + 2] <= 1,
    );
  }
});
