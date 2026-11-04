import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-coorbital-disclosure');

test('co-orbital disclosure attributes the rendered comparison to patched-conic methods', async () => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'honesty-disclosure.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const disclosure = await import(pathToFileURL(path.join(outDir, 'app', 'catalog-list', 'honesty-disclosure.js')).href);
  const text = disclosure.disclosureSections(null).map((section) => `${section.title} ${section.body}`).join(' ');
  assert.match(text, /patched-conic-versus-patched-conic comparison/);
  assert.doesNotMatch(text, /4-year horizon/);
  assert.doesNotMatch(text, /~1 km\/s/);
});
