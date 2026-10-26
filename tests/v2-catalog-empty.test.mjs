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

function renderedText(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(renderedText).join('');
  return renderedText(value.props?.children);
}

test('catalog renders distinct loading, failed, and empty-after-filter states', async () => {
  const empty = await loadEmpty();
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: true, screeningLoaded: true, tierLoadState: 'failed' }), 'tiers-not-loaded');
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: false, screeningLoaded: false, tierLoadState: 'loading' }), 'loading');
  assert.equal(empty.catalogEmptyReason({ catalogLoaded: true, screeningLoaded: true, tierLoadState: 'loaded' }), 'no-matches');

  const loadingText = renderedText(empty.renderEmpty('loading'));
  assert.equal(loadingText, 'Loading the catalog\u2026');
  assert.doesNotMatch(loadingText, /\(0\)|No catalog loaded/);
  assert.equal(renderedText(empty.renderCatalogHeading('loading', 0)), 'Loading the catalog\u2026');
  assert.doesNotMatch(renderedText(empty.renderCatalogHeading('loading', 0)), /\(0\)|No catalog loaded/);
  assert.equal(
    renderedText(empty.renderEmpty('tiers-not-loaded')),
    "Fidelity tiers didn't load, so tier filters are unavailable. Reload to try again.",
  );
  assert.equal(renderedText(empty.renderEmpty('no-matches')), 'No bodies match the current filters.');
});
