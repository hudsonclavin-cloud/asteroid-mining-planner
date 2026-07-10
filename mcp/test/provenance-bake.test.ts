import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const generatedPath = resolve(
  fileURLToPath(new URL('../src/generated/baked-provenance.json', import.meta.url))
);

test('baked provenance exists with package commit and bake timestamp', async () => {
  const baked = JSON.parse(await readFile(generatedPath, 'utf8')) as {
    commit?: string;
    bakedAt?: string;
    dirty?: boolean;
  };

  assert.match(baked.commit ?? '', /^[0-9a-f]{40}$/);
  assert.equal(new Date(baked.bakedAt ?? '').toISOString(), baked.bakedAt);
  assert.equal(typeof baked.dirty, 'boolean');
});
