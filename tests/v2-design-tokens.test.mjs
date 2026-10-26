import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generateTokens } from '../tools/design/gen-tokens.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokensPath = fileURLToPath(new URL('../src/v2/app/design/tokens.json', import.meta.url));
const provenancePath = fileURLToPath(new URL('../src/v2/app/design/tokens.provenance.json', import.meta.url));
const generatedPath = fileURLToPath(new URL('../src/v2/app/design/tokens.ts', import.meta.url));

test('design tokens are deterministic and provenance-pinned', async () => {
  const [source, generated, provenance] = await Promise.all([
    readFile(tokensPath, 'utf8'),
    readFile(generatedPath, 'utf8'),
    readFile(provenancePath, 'utf8').then(JSON.parse),
  ]);
  assert.equal(generateTokens(JSON.parse(source)), generated);
  assert.equal(createHash('sha256').update(source).digest('hex'), provenance.sha256);
  assert.equal(Buffer.byteLength(source), provenance.bytes);
});
