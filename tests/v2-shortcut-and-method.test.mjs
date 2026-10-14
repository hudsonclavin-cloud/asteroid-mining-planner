import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const runtime = fs.readFileSync(new URL('../src/v2/app/solar-system/runtime.ts', import.meta.url), 'utf8');
const compare = fs.readFileSync(new URL('../src/v2/app/compare/main.ts', import.meta.url), 'utf8');

test('the shortcut overlay names middle-drag pan and compare discloses its M=0 method', () => {
  assert.match(runtime, /\['right-drag \/ middle-drag \/ Shift\+drag', 'pan the view'\]/);
  assert.match(runtime, /panDragActive = event\.button === 2 \|\| event\.button === 1/);
  assert.match(compare, /Method — single-revolution \(M=0\) Lambert patched-conic screen/);
  assert.match(compare, /M: 0,/);
});
