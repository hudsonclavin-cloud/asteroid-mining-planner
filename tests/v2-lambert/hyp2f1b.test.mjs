import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-hyp2f1b');

fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
const tscResult = spawnSync(
  tscBin,
  [
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'hyp2f1b.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);

assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { hyp2f1b } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'hyp2f1b.js')).href
);

// Gauss hypergeometric function 2F1(3, 1; 5/2; x).
//
// Reference values verified against scipy.special.hyp2f1(3, 1, 2.5, x)
// in an independent Python environment (scipy is the canonical reference
// implementation for special functions in scientific computing).
//
// All reference values are exact-to-double-precision.
//
// History: the initial dispatch (Dispatch 8) shipped two wrong reference
// values (2.4 at x=0.5 and 1.1393... at x=0.1) sourced from Nova's
// half-remembered Wolfram check. The implementation was correct; the
// references were wrong. Dispatch 8c (this) replaces them with
// scipy-verified values across a broader x range.

const TOL = 1e-13;
const TOL_LARGE_X = 1e-10; // Looser tolerance for x close to 1 (slower convergence)

// Reference values from scipy.special.hyp2f1(3, 1, 2.5, x):
const REFERENCES = [
  { x: 0.0, expected: 1.0 },
  { x: 0.1, expected: 1.1354243666200301 },
  { x: 0.25, expected: 1.4183991523122907 },
  { x: 0.5, expected: 2.3561944901923448 }, // = 3π/4
  { x: 0.75, expected: 5.8367983046245788 },
];

for (const { x, expected } of REFERENCES) {
  const computed = hyp2f1b(x);
  const tol = x > 0.5 ? TOL_LARGE_X : TOL;
  const error = Math.abs(computed - expected);
  assert.ok(
    error < tol * Math.abs(expected),
    `hyp2f1b(${x}) = ${computed}, expected ${expected}, relative error ${error / Math.abs(expected)}`
  );
}

// At x = 0.5, verify the value is 3π/4 exactly (a known closed form for this 2F1)
const expectedHalf = 3 * Math.PI / 4;
const computedHalf = hyp2f1b(0.5);
assert.ok(
  Math.abs(computedHalf - expectedHalf) < TOL,
  `hyp2f1b(0.5) should equal 3π/4 = ${expectedHalf}, got ${computedHalf}`
);

// At x >= 1 returns Infinity
assert.equal(hyp2f1b(1), Infinity, 'hyp2f1b(1) is Infinity');
assert.equal(hyp2f1b(1.5), Infinity, 'hyp2f1b(1.5) is Infinity');

console.log('hyp2f1b.test: PASS');
