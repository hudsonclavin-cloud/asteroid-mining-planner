// Shared body-id resolution tests (Slice 18 close-out, Item 2).
//
// /v2/porkchop/?body=433 answered "Body not found" while
// /v2/compare/?bodies=433 worked, because the compare page resolved a bare
// designation (22d4fa7) and the porkchop page looked up the canonical
// 'asteroid-433' key only. Both now call resolveSlice9CatalogBody. These
// tests pin the rule against the committed catalog fixture and prove, by
// counting, that the designation fallback cannot be ambiguous.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-resolve-catalog-body');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

const EXPECTED_TOTAL_BODIES = 41_906;

let modulesPromise = null;
async function loadModules() {
  if (modulesPromise === null) {
    modulesPromise = (async () => {
      fs.rmSync(tempOutDir, { recursive: true, force: true });
      fs.mkdirSync(tempOutDir, { recursive: true });
      const result = runTsc([
        '--pretty', 'false',
        '--outDir', tempOutDir,
        '--rootDir', path.join(repoRoot, 'src', 'v2'),
        '--module', 'NodeNext',
        '--target', 'ES2020',
        '--moduleResolution', 'NodeNext',
        '--isolatedModules', 'true',
        path.join(repoRoot, 'src', 'v2', 'boundary', 'resolve-catalog-body.ts'),
        path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
      ]);
      assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
      const resolver = await import(pathToFileURL(path.join(tempOutDir, 'boundary', 'resolve-catalog-body.js')).href);
      const slice9 = await import(pathToFileURL(path.join(tempOutDir, 'boundary', 'slice9-nea-catalog.js')).href);
      const catalog = slice9.ingestSlice9Fixture(JSON.parse(fs.readFileSync(fixturePath, 'utf8')));
      return { resolve: resolver.resolveSlice9CatalogBody, catalog };
    })();
  }
  return modulesPromise;
}

test('canonical bodyId and bare designation resolve to the same catalog body', async () => {
  const { resolve, catalog } = await loadModules();
  for (const designation of ['433', '99942', '2018 LA', '2015 D1', '2020 FK3']) {
    const byId = resolve(catalog, `asteroid-${designation}`);
    const byDesignation = resolve(catalog, designation);
    assert.ok(byId, `asteroid-${designation} must be in the fixture`);
    assert.equal(byDesignation, byId, `'${designation}' must resolve to the very same body object as its bodyId`);
    assert.equal(byId.designation, designation);
    assert.equal(byId.bodyId, `asteroid-${designation}`);
  }
});

test('unknown identifiers resolve to undefined — never a fallback body', async () => {
  const { resolve, catalog } = await loadModules();
  for (const junk of ['', 'nope', 'asteroid-', 'asteroid-433 ', ' 433', '00433', 'Eros']) {
    assert.equal(resolve(catalog, junk), undefined, `'${junk}' must not resolve`);
  }
});

test('designations are unique across the whole catalog, so the fallback is unambiguous', async () => {
  const { catalog } = await loadModules();
  const bodies = Object.values(catalog.asteroids);
  assert.equal(bodies.length, EXPECTED_TOTAL_BODIES);
  const designations = new Set(bodies.map((body) => body.designation));
  assert.equal(designations.size, EXPECTED_TOTAL_BODIES, 'one designation per body');
  // And the canonical key is exactly the designation-derived id, so the two
  // forms name the same thing by construction, not by coincidence.
  const mismatched = Object.entries(catalog.asteroids)
    .filter(([key, body]) => key !== `asteroid-${body.designation}` || body.bodyId !== key)
    .map(([key]) => key);
  assert.deepEqual(mismatched, []);
});

test('sampled equivalence across the catalog: designation lookup lands on the body with that id', async () => {
  const { resolve, catalog } = await loadModules();
  const bodies = Object.values(catalog.asteroids);
  let checked = 0;
  for (let index = 0; index < bodies.length; index += 397) {
    const body = bodies[index];
    assert.equal(resolve(catalog, body.designation), body);
    assert.equal(resolve(catalog, body.bodyId), body);
    checked += 1;
  }
  assert.ok(checked >= 100, `sampled ${checked} bodies`);
});
