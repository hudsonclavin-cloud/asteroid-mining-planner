import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-tier-legend-render');

function renderedText(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(renderedText).join('');
  return renderedText(value.props?.children);
}

async function loadLegendModules() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'panel.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  globalThis.fetch = async () => { throw new Error('expected test fetch refusal'); };
  console.error = () => {};
  try {
    const panel = await import(pathToFileURL(path.join(outDir, 'app', 'catalog-list', 'panel.js')).href);
    const disclosure = await import(pathToFileURL(path.join(outDir, 'porkchop', 'tier-disclosure.js')).href);
    return { panel, disclosure };
  } finally {
    await Promise.resolve();
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
}

test('catalog tier legend renders both L2 disclosure phrases from the shared source', async () => {
  const { panel, disclosure } = await loadLegendModules();
  const text = renderedText(panel.renderTierLegend());
  assert.match(text, new RegExp(disclosure.L2_DISCLOSURE_TEXT.measuredUnbounded.legend));
  assert.match(text, new RegExp(disclosure.L2_DISCLOSURE_TEXT.unmeasured.legend));
  assert.doesNotMatch(text, /unbounded or unmeasured/);
});
