import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viewPath = path.join(repoRoot, 'src', 'v2', 'porkchop', 'porkchop-view.ts');
const pagePath = path.join(repoRoot, 'src', 'v2', 'app', 'porkchop', 'main.ts');

test('AMBER DLA display names the raised-inclination regime without implying a numeric ΔV penalty', () => {
  const source = fs.readFileSync(viewPath, 'utf8');

  assert.match(source, /AMBER:\s*'Raised inclination'/);
  assert.doesNotMatch(source, /AMBER:\s*'Penalized'/);
  assert.match(
    source,
    /Advisory: Raised-inclination injection[^']*negligible ΔV/,
  );
  const page = fs.readFileSync(pagePath, 'utf8');
  assert.match(page, /effective ceiling is only ~39 deg/);
  assert.doesNotMatch(page, /~34-39 deg/);
});
