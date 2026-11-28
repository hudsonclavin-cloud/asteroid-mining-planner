import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-gm-earth');

test('GM_EARTH is the DE440 BODY399_GM value and observes raw line 116', async () => {
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
      path.join(repoRoot, 'src', 'v2', 'core', 'constants', 'physical.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  const { GM_EARTH_M3_S2 } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'constants', 'physical.js')).href,
  );
  const rawPath = path.join(repoRoot, 'tools', 'slice20-research', 'front-b-entry', 'raw', 'gm_de440.tpc');
  const expectedLine = 'BODY399_GM     = ( 3.9860043550702266D+05 )';
  const rawLine = fs.readFileSync(rawPath, 'utf8').split(/\r?\n/)[115];
  assert.equal(rawLine.trim(), expectedLine);
  const digits = rawLine.match(/BODY399_GM\s*=\s*\(\s*([0-9.]+)D\+05\s*\)/)?.[1];
  assert.ok(digits, `raw line did not contain DE440 digits: ${rawLine}`);
  assert.equal(GM_EARTH_M3_S2, Number(`${digits}e14`));
});
