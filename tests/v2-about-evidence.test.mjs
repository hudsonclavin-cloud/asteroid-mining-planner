import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const aboutCopy = fs.readFileSync(new URL('../src/v2/app/about/audit-copy.ts', import.meta.url), 'utf8');
const aboutSource = fs.readFileSync(new URL('../src/v2/app/about/main.ts', import.meta.url), 'utf8');
const slice13 = fs.readFileSync(new URL('../src/v2/SLICE_13_FOUNDING.md', import.meta.url), 'utf8');
const invariants = fs.readFileSync(new URL('../INVARIANTS.md', import.meta.url), 'utf8');

test('About evidence links use real heading fragments and a current invariant exhibit pin', () => {
  assert.match(aboutCopy, /anchor: '8-engineering-record-running-log'/);
  assert.match(aboutSource, /invariants:[\s\S]*?commit: 'b1075f3'/);
  assert.match(slice13, /^## §8\. Engineering record \(running log\)$/m);
  const invariantIds = [...invariants.matchAll(/^\| (INV-[^ |]+)/gm)].map((match) => match[1]);
  assert.ok(invariantIds.length > 0);
});
