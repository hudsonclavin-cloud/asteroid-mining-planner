import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cachePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

test('screen cache schema v2 provenance hashes match inputs and shipped cache bytes', () => {
  const fixtureBytes = readFileSync(cachePath);
  const cache = JSON.parse(fixtureBytes.toString('utf8'));
  const { metadata, bodies } = cache;

  assert.equal(metadata.schemaVersion, 2);
  assert.equal(bodies.some((body) => Object.hasOwn(body, 'bestWindows')), false);

  const provenance = metadata.provenance;
  assert.equal(provenance.generator?.treeClean, true);
  assert.equal(
    sha256File(path.join(repoRoot, 'tools', 'build', 'precompute-lambert-screen.mjs')),
    provenance.precomputeScriptSha256,
    'precomputeScriptSha256 matches the generator bytes',
  );
  assert.equal(
    sha256File(path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json')),
    provenance.catalogFixtureSha256,
    'catalogFixtureSha256 matches the catalog fixture bytes',
  );
  assert.equal(
    sha256File(path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json')),
    provenance.horizonsFixtureSha256,
    'horizonsFixtureSha256 matches the Horizons fixture bytes',
  );

  const shippedBytes = readFileSync(path.join(repoRoot, 'docs', 'lambert-screen-cache.json'));
  assert.ok(fixtureBytes.equals(shippedBytes), 'docs cache is byte-identical to the fixture');
});
