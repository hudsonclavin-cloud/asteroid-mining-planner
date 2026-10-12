import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-delta-v');

function compileModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'delta-v.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
}

let modulePromise;

async function loadModule() {
  if (!modulePromise) {
    compileModule();
    modulePromise = import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'delta-v.js')).href);
  }
  return modulePromise;
}

test('ΔV stack is mode-aware: one-way omits departure and sample return uses symmetric-return assumption', async () => {
  const { buildDeltaVStack, DV_MARGIN_FRACTION, injectionDvFromC3, STATIONKEEPING_DV_KMPS } = await loadModule();
  const c3 = 25;
  const vInfArr = 4.5;
  const oneWay = buildDeltaVStack(c3, vInfArr, 'one-way');
  const sampleReturn = buildDeltaVStack(c3, vInfArr, 'sample-return');

  assert.equal(oneWay.departureKmps, 0);
  assert.equal(sampleReturn.departureKmps, vInfArr);
  assert.equal(oneWay.rendezvousKmps, vInfArr);
  assert.equal(sampleReturn.rendezvousKmps, vInfArr);
  assert.equal(
    oneWay.subtotalKmps,
    injectionDvFromC3(c3) + vInfArr + STATIONKEEPING_DV_KMPS,
  );
  assert.equal(
    sampleReturn.subtotalKmps,
    injectionDvFromC3(c3) + vInfArr + vInfArr + STATIONKEEPING_DV_KMPS,
  );
  assert.equal(oneWay.marginKmps, oneWay.subtotalKmps * DV_MARGIN_FRACTION);
  assert.ok(oneWay.totalKmps < sampleReturn.totalKmps);
});

test('D10 labels name margin bases and preserve the displayed value expressions', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'app', 'porkchop', 'main.ts'), 'utf8');

  assert.ok(source.includes('Margin (\${DETERMINISTIC_MARGIN_PERCENT}% of deterministic maneuver \\u0394V; stationkeeping not margined)'));
  assert.ok(source.includes('Margin (\${(DV_MARGIN_FRACTION * 100).toFixed(0)}% of full \\u0394V stack)'));
  assert.ok(source.includes('departure = arrival v\u221e under the symmetric-return assumption'));
  assert.ok(source.includes('stackState.breakdown.marginKmps.toFixed(3)'));
  assert.ok(source.includes('costCardState.marginMps.toFixed(0)'));
});
