import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-light-time');

async function loadLightTime() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'light-time.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  return import(pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'light-time.js')).href);
}

test('K4 light time uses Earth distance, two significant figures, and inherited tier caveats', async () => {
  const { buildLightTimeReadout } = await loadLightTime();
  const au = 149_597_870_700;
  const oneAu = buildLightTimeReadout(au, null, 'ok');
  assert.equal(oneAu.kind, 'value');
  assert.equal(oneAu.seconds, 499.00478383615643);
  assert.match(oneAu.text, /^Light time from Earth: 8\.3 min \(1\.0 AU ÷ c\)$/);

  assert.match(buildLightTimeReadout(59.4 * 299_792_458, null, 'ok').text, /59 s/);
  assert.match(buildLightTimeReadout(61 * 299_792_458, null, 'ok').text, /1\.0 min/);
  assert.match(buildLightTimeReadout(au, 'L1', 'ok').text, /Fidelity tier L1 applies/);
  assert.match(buildLightTimeReadout(au, 'L2', 'ok').text, /Fidelity tier L2 applies/);
});

test('K4 refuses every ruled invalid state without displaying a number', async () => {
  const { buildLightTimeReadout } = await loadLightTime();
  for (const [distanceM, tier, status, reason] of [
    [149_597_870_700, 'L0', 'ok', 'L0'],
    [149_597_870_700, null, 'prop-fail', 'PROP FAIL'],
    [Number.NaN, null, 'ok', 'non-finite distance'],
    [null, null, 'no-selection', 'no selection'],
  ]) {
    const readout = buildLightTimeReadout(distanceM, tier, status);
    assert.equal(readout.kind, 'refusal');
    assert.equal(readout.reason, reason);
    assert.match(readout.text, new RegExp(`^Light time: — \\(${reason}\\)$`));
  }
});
