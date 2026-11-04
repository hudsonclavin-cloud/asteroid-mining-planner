import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('C3Value requires a typed grid descriptor', () => {
  const result = runTsc([
    '--pretty', 'false', '--noEmit', '--strict', '--module', 'NodeNext', '--target', 'ES2020',
    '--moduleResolution', 'NodeNext', '--skipLibCheck',
    path.join(repoRoot, 'tests', 'helpers', 'c3-value-type-check.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'type-level C3Value check failed');
});
