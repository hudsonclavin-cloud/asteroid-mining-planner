import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/v2/app/porkchop/main.ts', import.meta.url), 'utf8');

test('the dedicated delta-v stack visibly discloses its INV-016c model assumptions', () => {
  assert.equal((source.match(/key: 'stack-assumptions'/g) ?? []).length, 1);
  assert.match(
    source,
    /Assumptions: \$\{MISSION_MODE_LABELS\[selectedMode\]\}; impulsive, patched-conic, no gravity assists, no SEP; 200 km circular LEO/,
  );
  assert.match(source, /stationkeeping \$\{STATIONKEEPING_DV_KMPS\.toFixed\(3\)\} km\/s/);
  assert.match(source, /\$\{\(DV_MARGIN_FRACTION \* 100\)\.toFixed\(0\)\}% margin/);
});
