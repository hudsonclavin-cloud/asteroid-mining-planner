import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Architecture guard only: this source scan enforces that C3 formatting has one
// shared owner; it is not a substitute for the render-behaviour tests.
test('C3 formatting is owned by C3Value outside the pure formatter', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'v2', 'app');
  const violations = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith('.ts') && !fullPath.endsWith(path.join('design', 'components', 'C3Value.ts'))) {
        const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
        lines.forEach((line, index) => {
          if (line.includes('formatC3(')) violations.push(`${fullPath}:${index + 1}`);
        });
      }
    }
  }
  walk(root);
  assert.deepEqual(violations, []);
});
