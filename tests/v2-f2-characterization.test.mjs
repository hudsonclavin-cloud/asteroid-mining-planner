import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'v2', 'f2-rendered-text.json'), 'utf8'));

test('F2 characterization fixture records the HEAD honesty text across all three surfaces', () => {
  assert.equal(fixture.generatedFrom, 'HEAD 6ae930c (before F2 migration)');
  assert.equal(fixture.surfaces.catalog.normal, 'C3 4.21 km²/s² (cached screen: 25.7 d × 16.6 d steps)');
  assert.equal(fixture.surfaces.compare.normal, '4.21 km²/s² (requested grid)');
  assert.equal(fixture.surfaces.porkchop.normal, 'Payload at C3 = 4.21 km²/s²');
  for (const surface of Object.values(fixture.surfaces)) {
    assert.equal(surface.nearZero, 'near-zero C3');
    assert.equal(surface.hideOn, 'near-zero-C3 window hidden (1)');
    assert.equal(surface.refusal, '—');
    assert.equal(surface.emptyNoWindow, 'No solvable cells in this grid.');
  }
});
