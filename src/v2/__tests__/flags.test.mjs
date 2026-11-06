import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-flags');

async function loadFlags() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext', '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'flags.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  return import(pathToFileURL(path.join(tempOutDir, 'flags.js')).href);
}

test('every feature flag defaults to OFF and the object is frozen', async () => {
  const flags = await loadFlags();
  const names = Object.keys(flags.FEATURE_FLAGS);
  assert.deepEqual(names.sort(), ['LIVE_DATA_ENABLED', 'LOW_THRUST_ENABLED']);
  for (const name of names) {
    assert.equal(flags.FEATURE_FLAGS[name], false, `${name} must default to false`);
    assert.equal(flags.isFlagEnabled(name), false);
  }
  assert.ok(Object.isFrozen(flags.FEATURE_FLAGS));
  assert.deepEqual(
    flags.listFlags().map((entry) => entry.enabled),
    names.map(() => false),
  );
});
