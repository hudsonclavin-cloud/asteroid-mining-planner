import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const disclosure = fs.readFileSync(new URL('../src/v2/app/catalog-list/honesty-disclosure.ts', import.meta.url), 'utf8');
const earthMoon = fs.readFileSync(new URL('../v2/earth-moon/index.html', import.meta.url), 'utf8');
const about = fs.readFileSync(new URL('../src/v2/app/about/main.ts', import.meta.url), 'utf8');

test('public copy does not expose bare internal taxonomy identifiers or duplicated trust numbers', () => {
  const disclosureSurface = disclosure.slice(disclosure.indexOf('export function disclosureSections'));
  assert.doesNotMatch(disclosureSurface, /\b(?:OQ|DEC|INV)-\d/);
  assert.doesNotMatch(earthMoon, /Slice\s+\d/);
  const validationSurface = about.slice(about.indexOf('function ValidationSection'), about.indexOf('function AboutPage'));
  assert.doesNotMatch(validationSurface, /['\"](?:1\.18|3\.11|3\.60e-12|5\.74e-13)/);
});
