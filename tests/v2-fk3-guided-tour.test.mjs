import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-fk3-guided-tour');

test('FK3 AMBER tour explains zero added Delta-V while RED still names dogleg', async () => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = spawnSync(process.execPath, [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'porkchop', 'fk3-guided-tour.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const module = await import(pathToFileURL(path.join(outDir, 'app', 'porkchop', 'fk3-guided-tour.js')).href);
  const amber = module.fk3TourStepBody(3, 'penalty');
  assert.equal(amber, 'This window needs a small plane change. At screening fidelity, launch geometry absorbs it with no added ΔV.');
  assert.match(amber, /launch geometry absorbs it with no added ΔV/);
  assert.match(module.fk3TourStepBody(3, 'red-no-price'), /not feasible/);
  assert.match(module.fk3TourStepBody(3, 'red-with-price'), /number is still there/);
});
