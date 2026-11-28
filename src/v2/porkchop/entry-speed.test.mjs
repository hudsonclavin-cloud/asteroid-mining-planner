import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-entry-speed');

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
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'entry-speed.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
}

let modulePromise;

async function loadModule() {
  if (!modulePromise) {
    compileModule();
    modulePromise = import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'entry-speed.js')).href);
  }
  return modulePromise;
}

test('entry-speed constants and labels follow DEC-20-8', async () => {
  const module = await loadModule();
  assert.ok(Math.abs(module.NHATS_ENTRY_VINF_LIMIT_KMPS - 4.627) <= 1e-3);
  assert.equal(module.ENTRY_SPEED_METHOD_LABEL, 'entry-speed screen (two-body, inertial)');
  assert.equal(module.NHATS_ENTRY_SPEED_LABEL, 'NHATS: ≤ 12 km/s at 125 km');
  assert.equal(module.EARTH_MOON_CAPTURE_LABEL, 'Earth–Moon capture not evaluated');
});

test('three uncontrolled NHATS trajectories reproduce entry speed at printed precision', async () => {
  const { screenEntrySpeed } = await loadModule();
  const artifact = JSON.parse(fs.readFileSync(
    path.join(repoRoot, 'tools', 'slice20-research', 'nhats', 'n2-agreement', 'n2-agreement.json'),
    'utf8',
  ));
  const rows = artifact.rows.filter((row) => !row.entryControlled).slice(0, 3);
  assert.equal(rows.length, 3);
  for (const row of rows) {
    const screen = screenEntrySpeed(row.q.vinf_ret_earth);
    assert.equal(screen.naturalEntrySpeedKmps.toFixed(3), row.cmp.v_arr_earth.nhatsText, row.des);
    assert.equal(screen.exceedsLimit, false, row.des);
  }
});

test('three controlled NHATS trajectories use model-B control dV without returning 12.000', async () => {
  const { entryControlDvModelBKmps, screenEntrySpeed } = await loadModule();
  const artifact = JSON.parse(fs.readFileSync(
    path.join(repoRoot, 'tools', 'slice20-research', 'nhats', 'n2-agreement', 'n2-agreement.json'),
    'utf8',
  ));
  const rows = artifact.rows.filter((row) => row.entryControlled).slice(0, 3);
  assert.equal(rows.length, 3);
  for (const row of rows) {
    const screen = screenEntrySpeed(row.q.vinf_ret_earth);
    assert.equal(entryControlDvModelBKmps(row.q.vinf_ret_earth).toFixed(3), row.cmp.vrel_arr_earth.nhatsText, row.des);
    assert.equal(screen.exceedsLimit, true, row.des);
    assert.notEqual(screen.naturalEntrySpeedKmps.toFixed(3), '12.000', row.des);
  }
});
