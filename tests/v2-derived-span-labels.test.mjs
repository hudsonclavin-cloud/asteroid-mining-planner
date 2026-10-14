import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-derived-span-labels');

async function loadDisclosure() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'honesty-disclosure.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return import(pathToFileURL(path.join(outDir, 'app', 'catalog-list', 'honesty-disclosure.js')).href);
}

test('catalog and porkchop span labels derive full dates from their own parameters', async () => {
  const disclosure = await loadDisclosure();
  assert.equal(disclosure.screeningWindowLabel({ startUtc: '2026-01-01', endUtc: '2040-12-31' }), '2026-01-01–2040-12-31');
  const source = fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'app', 'porkchop', 'main.ts'), 'utf8');
  assert.match(source, /PORKCHOP_DEPARTURE_SPAN_LABEL = `\$\{jdTdbToUtcDateString\(GRID_PARAMS\.depStartJD\)\}–\$\{jdTdbToUtcDateString\(GRID_PARAMS\.depEndJD\)\}`/);
  assert.match(source, /Grid spans \$\{PORKCHOP_DEPARTURE_SPAN_LABEL\}/);
  assert.doesNotMatch(source, /Grid spans 2026–2040/);
});
