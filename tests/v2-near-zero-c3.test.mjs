import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-near-zero-c3');
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
  path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
]);
assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);

const {
  NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2,
  isNearZeroC3Degenerate,
} = await import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href);

assert.equal(
  NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2,
  0.1,
  'near-zero C3 threshold matches the disclosure value',
);
assert.equal(isNearZeroC3Degenerate(0.099999), true, 'strictly below threshold is flagged');
assert.equal(isNearZeroC3Degenerate(0.1), false, 'threshold itself is not flagged');
assert.equal(isNearZeroC3Degenerate(0.100001), false, 'just above threshold is not flagged');
assert.equal(isNearZeroC3Degenerate(1.62), false, 'normal planning C3 is not flagged');
assert.equal(isNearZeroC3Degenerate(null), false, 'null is not flagged');
assert.equal(isNearZeroC3Degenerate(Number.NaN), false, 'NaN is not flagged');
assert.equal(isNearZeroC3Degenerate(Number.POSITIVE_INFINITY), false, 'Infinity is not flagged');
