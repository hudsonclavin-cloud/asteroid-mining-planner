import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-catalog-empty');

async function loadEmpty() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'empty.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return import(pathToFileURL(path.join(outDir, 'app', 'catalog-list', 'empty.js')).href);
}

test('catalog distinguishes tier load failure/latency from a real empty filter', async () => {
  const empty = await loadEmpty();
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: true, screeningLoaded: true, tierLoadState: 'failed' }), 'tiers-not-loaded');
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: true, screeningLoaded: true, tierLoadState: 'loading' }), 'tiers-not-loaded');
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: true, screeningLoaded: true, tierLoadState: 'loaded' }), 'no-matches');
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: false, screeningLoaded: true, tierLoadState: 'loaded' }), 'no-data');
});
