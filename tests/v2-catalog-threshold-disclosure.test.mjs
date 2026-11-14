import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-catalog-threshold-disclosure');

test('CK-13 renders the cache-derived LOW C3 screening threshold in the catalog legend', async () => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'threshold-disclosure.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const { renderLowC3ThresholdLegend } = await import(
    `${pathToFileURL(path.join(outDir, 'app', 'catalog-list', 'threshold-disclosure.js')).href}?ck13=${Date.now()}`,
  );
  const cache = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json'), 'utf8'));
  const threshold = cache.metadata.feasibleC3MaxKm2S2;
  const legend = renderLowC3ThresholdLegend(threshold);
  assert.equal(legend.type, 'div');
  assert.equal(legend.props.children, 'LOW C3: below 25.0 km²/s² (the screening threshold)');
  assert.equal(legend.props.title, legend.props.children);
  assert.match(legend.props.children, new RegExp(String(threshold)));
});
