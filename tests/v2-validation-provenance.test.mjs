import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const provenancePath = path.join(repoRoot, 'src', 'v2', 'data', 'validation-provenance.json');

test('validation provenance scopes strict and observed payload figures and preserves magnitude-only wording', () => {
  const doc = JSON.parse(fs.readFileSync(provenancePath, 'utf8'));
  const magnitude = doc.rows.find((row) => row.id === 'lambert-multirev-magnitude');
  const strict = doc.rows.find((row) => row.id === 'cost-oracle-strict');
  const observed = doc.rows.find((row) => row.id === 'cost-oracle-observed');
  assert.match(magnitude.note, /Magnitude only/);
  assert.match(magnitude.note, /vector directions/);
  assert.match(strict.scope, /C3 = 15, 25, and 35/);
  assert.match(strict.scope, /40-55 anchor segment/);
  assert.match(observed.scope, /22 non-absent/);
  assert.match(observed.scope, /40-55 anchor segment/);
});
