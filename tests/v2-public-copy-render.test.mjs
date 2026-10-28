import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { h } from 'preact';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-public-copy-render');
const internalCopy = /\b(?:OQ|DEC|INV|AMD)-\d|Slice \d|later slices|\u00a7|aster\.[A-Za-z0-9_.-]+/;

function renderedText(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(renderedText).join('');
  return renderedText(value.props?.children);
}

async function loadModules() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'panel.ts'),
    path.join(repoRoot, 'src', 'v2', 'app', 'about', 'audit-copy.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  globalThis.fetch = async () => { throw new Error('expected test fetch refusal'); };
  console.error = () => {};
  try {
    const panel = await import(pathToFileURL(path.join(outDir, 'app', 'catalog-list', 'panel.js')).href);
    const audit = await import(pathToFileURL(path.join(outDir, 'app', 'about', 'audit-copy.js')).href);
    return { panel, audit };
  } finally {
    await Promise.resolve();
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
}

test('catalog disclosure renders plain-English public copy', async () => {
  const { panel } = await loadModules();
  const text = renderedText(panel.renderPopover());
  assert.doesNotMatch(text, internalCopy);
  assert.match(text, /a future version/);
});

test('About audit exhibits render plain-English titles and evidence labels', async () => {
  const { audit } = await loadModules();
  const nodes = audit.renderAboutAuditItems((title, body, artifact) =>
    h('div', null, title, body, artifact.label));
  const text = renderedText(nodes);
  assert.doesNotMatch(text, internalCopy);
  assert.match(text, /Lambert solver audit cycle/);
  assert.match(text, /Mission-cost audit/);
});
