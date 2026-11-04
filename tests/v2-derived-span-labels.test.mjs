import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const disclosureOutDir = path.join(repoRoot, '.tmp-tests', 'v2-derived-span-labels-disclosure');
const porkchopOutDir = path.join(repoRoot, '.tmp-tests', 'v2-derived-span-labels-porkchop');

async function loadDisclosure() {
  fs.rmSync(disclosureOutDir, { recursive: true, force: true });
  fs.mkdirSync(disclosureOutDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', disclosureOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'honesty-disclosure.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return import(pathToFileURL(path.join(disclosureOutDir, 'app', 'catalog-list', 'honesty-disclosure.js')).href);
}

async function loadPorkchopLabels() {
  const mainPath = path.join(repoRoot, 'src', 'v2', 'app', 'porkchop', 'main.ts');
  fs.rmSync(porkchopOutDir, { recursive: true, force: true });
  fs.mkdirSync(porkchopOutDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', porkchopOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', mainPath,
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const emittedPath = path.join(porkchopOutDir, 'app', 'porkchop', 'main.js');
  const emitted = fs.readFileSync(emittedPath, 'utf8');
  const mountStart = emitted.indexOf("const mount = document.getElementById('app');");
  const mountEnd = emitted.indexOf('\n// OQ-13-3', mountStart);
  assert.notEqual(mountStart, -1, 'porkchop module mount should be present in emitted source');
  assert.notEqual(mountEnd, -1, 'porkchop mount guard should have a bounded block');
  const withoutMount = `${emitted.slice(0, mountStart)}const mount = null;${emitted.slice(mountEnd)}`;
  const renderStart = withoutMount.lastIndexOf('render(h(PorkchopDedicatedPage');
  assert.notEqual(renderStart, -1, 'porkchop render call should be present in emitted source');
  fs.writeFileSync(emittedPath, withoutMount.slice(0, renderStart));
  return import(`${pathToFileURL(emittedPath).href}?span=${Date.now()}`);
}

test('catalog and porkchop span labels derive full dates from their own parameters', async () => {
  const disclosure = await loadDisclosure();
  const porkchop = await loadPorkchopLabels();
  assert.equal(disclosure.screeningWindowLabel({ startUtc: '2026-01-01', endUtc: '2040-12-31' }), '2026-01-01–2040-12-31');
  assert.equal(porkchop.PORKCHOP_DEPARTURE_SPAN_LABEL, '2026-01-01–2040-01-01');
  assert.match(`Grid spans ${porkchop.PORKCHOP_DEPARTURE_SPAN_LABEL}`, /Grid spans 2026-01-01–2040-01-01/);
});

test('catalog footer quotes the cache end and the porkchop grid end from their own constants', async () => {
  const disclosure = await loadDisclosure();
  const span = await import(pathToFileURL(path.join(porkchopOutDir, 'porkchop', 'grid-span.js')).href);
  const footer = disclosure.footerText({ startUtc: '2026-01-01', endUtc: '2040-12-31' });
  assert.ok(footer.includes('cached departures through 2040-12-31'), footer);
  assert.ok(footer.includes(`the porkchop grid ends ${span.PORKCHOP_DEPARTURE_END_UTC}`), footer);
  assert.equal(span.PORKCHOP_DEPARTURE_END_UTC, '2040-01-01');
  assert.equal(disclosure.footerText(null), 'Patched-conic screen');
});
