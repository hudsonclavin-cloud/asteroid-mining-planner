import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'honesty-disclosure.ts');

test('co-orbital disclosure attributes the comparison to patched-conic methods', () => {
  const source = fs.readFileSync(sourcePath, 'utf8');
  assert.match(source, /patched-conic-versus-patched-conic comparison/);
  assert.doesNotMatch(source, /4-year horizon/);
  assert.doesNotMatch(source, /~1 km\/s/);
});
