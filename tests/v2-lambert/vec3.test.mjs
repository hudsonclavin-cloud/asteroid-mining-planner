import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from '../helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-vec3');

fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscResult = runTsc(
[
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'vec3.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);

assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { add, sub, scale, dot, cross, norm, normalize } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'vec3.js')).href
);

const a = [1, 2, 3];
const b = [4, 5, 6];

assert.deepEqual(add(a, b), [5, 7, 9], 'add');
assert.deepEqual(sub(a, b), [-3, -3, -3], 'sub');
assert.deepEqual(scale(a, 2), [2, 4, 6], 'scale');
assert.equal(dot(a, b), 1 * 4 + 2 * 5 + 3 * 6, 'dot');
assert.deepEqual(cross([1, 0, 0], [0, 1, 0]), [0, 0, 1], 'cross i x j = k');
assert.deepEqual(cross([0, 1, 0], [0, 0, 1]), [1, 0, 0], 'cross j x k = i');
assert.deepEqual(cross([0, 0, 1], [1, 0, 0]), [0, 1, 0], 'cross k x i = j');
assert.equal(norm([3, 4, 0]), 5, 'norm 3-4-5');
assert.equal(norm([0, 0, 0]), 0, 'norm zero');

const n = normalize([3, 4, 0]);
assert.ok(Math.abs(n[0] - 0.6) < 1e-15, 'normalize x');
assert.ok(Math.abs(n[1] - 0.8) < 1e-15, 'normalize y');
assert.ok(Math.abs(n[2]) < 1e-15, 'normalize z');
assert.throws(() => normalize([0, 0, 0]), /zero vector/, 'normalize zero throws');

console.log('vec3.test: PASS');
