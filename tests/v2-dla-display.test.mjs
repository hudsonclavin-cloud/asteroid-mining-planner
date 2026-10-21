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
  assert.match(
    page,
    /Dogleg regime \(this cell\): AMBER — plane-matching from \$\{costCardState\.readout\.siteName\} is absorbed by launch geometry, below screening error bars; zero added ΔV, disclosed rather than fabricated\./,
  );
  assert.doesNotMatch(page, /m\/s[- ]per[- ]degree/);
});

test('DLA site, disclosure, and band legend remain visible when the contour toggle is off', () => {
  const page = fs.readFileSync(pagePath, 'utf8');
  const view = fs.readFileSync(viewPath, 'utf8');

  assert.doesNotMatch(page, /showDlaContours\s*\?/);
  assert.match(page, /key: 'dla-site-picker'/);
  assert.match(page, /key: 'dla-016d-disclosure'/);
  assert.match(view, /props\.showDlaOverlayControl === true\s*\?/);
  assert.equal(
    (view.match(/props\.showDlaOverlayControl === true && props\.showDlaContours === true/g) ?? []).length,
    1,
    'the contour drawing itself remains toggle-controlled while its legend does not',
  );
});
