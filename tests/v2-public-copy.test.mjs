import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-public-copy');

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

test('public disclosure sections render without internal taxonomy identifiers or duplicated trust numbers', async () => {
  const disclosure = await loadDisclosure();
  const sections = disclosure.disclosureSections({ startUtc: '2026-01-01', endUtc: '2040-12-31' });
  const disclosureSurface = sections.map((section) => `${section.title} ${section.body}`).join(' ');
  assert.doesNotMatch(disclosureSurface, /\b(?:OQ|DEC|INV)-\d/);

  // Architecture guard: the earth-moon entry is a checked-in HTML boundary;
  // its public copy is intentionally tested as the shipped document.
  const earthMoon = fs.readFileSync(path.join(repoRoot, 'v2', 'earth-moon', 'index.html'), 'utf8');
  assert.doesNotMatch(earthMoon, /Slice\s+\d/);

  // Architecture guard: the About validation component must source trust
  // figures from validation-provenance.json, so duplicated numeric literals
  // cannot be distinguished from the data in a rendered string.
  const about = fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'app', 'about', 'main.ts'), 'utf8');
  const validationSurface = about.slice(about.indexOf('function ValidationSection'), about.indexOf('function AboutPage'));
  assert.doesNotMatch(validationSurface, /['"](?:1\.18|3\.11|3\.60e-12|5\.74e-13)/);
});
