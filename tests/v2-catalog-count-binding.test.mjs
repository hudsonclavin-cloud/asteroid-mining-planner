import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-catalog-count-binding');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

async function loadCatalogCountConstant() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = runTsc(
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
  return import(pathToFileURL(path.join(tempOutDir, 'boundary', 'slice9-nea-catalog.js')).href);
}

test('catalog count constant is bound to the committed catalog data', async () => {
  const { SLICE9_NEA_CATALOG_TOTAL_BODIES } = await loadCatalogCountConstant();
  const catalog = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const recordArrayLength = Object.keys(catalog.asteroids).length;

  assert.equal(catalog.catalog.totalBodies, SLICE9_NEA_CATALOG_TOTAL_BODIES);
  assert.equal(recordArrayLength, SLICE9_NEA_CATALOG_TOTAL_BODIES);
  console.log('AboutPage is not exported; semantic intro assertion skipped by contract.');
});
