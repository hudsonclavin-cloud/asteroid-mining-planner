import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from '../helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-hyp2f1b');

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

// Reference values from scipy.special.hyp2f1(3, 1, 2.5, x):
const REFERENCES = [
  { x: 0.0, expected: 1.0 },
  { x: 0.1, expected: 1.1354243666200301 },
  { x: 0.25, expected: 1.4183991523122907 },
  { x: 0.3, expected: 1.5444243078411781 },
  { x: 0.5, expected: 2.3561944901923448 }, // = 3π/4
];

for (const { x, expected } of REFERENCES) {
  const computed = hyp2f1b(x);
  const error = Math.abs(computed - expected);
  assert.ok(
    error < TOL * Math.abs(expected),
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

// ============================================================
// Contract documentation: hyp2f1b is accurate for x in [0, 0.5].
// Outside that range, the truncated series produces increasingly
// wrong values. These tests document where the contract breaks.
// ============================================================

const xIn = 0.5;
const oursIn = hyp2f1b(xIn);
const refIn = 2.356194490192345;
assert.ok(
  Math.abs(oursIn - refIn) / refIn < 1e-12,
  `hyp2f1b(0.5) = ${oursIn}, expected ~${refIn}, relative diff ${Math.abs(oursIn - refIn) / refIn}`
);

const xHigh = 0.99;
const oursHigh = hyp2f1b(xHigh);
const refHigh = 596.9839630207517;
const relErrHigh = Math.abs(oursHigh - refHigh) / Math.abs(refHigh);
assert.ok(
  relErrHigh > 1e-4,
  `hyp2f1b(0.99) precision should be degraded (>1e-4 rel err), but got ${relErrHigh}. If this fails, the helper improved unexpectedly — update the contract.`
);

const xSevere = 0.999;
const oursSevere = hyp2f1b(xSevere);
const refSevere = 18654.32779357236;
const relErrSevere = Math.abs(oursSevere - refSevere) / Math.abs(refSevere);
assert.ok(
  relErrSevere > 1e-2,
  `hyp2f1b(0.999) should have severe error (>1e-2 rel err), got ${relErrSevere}`
);

// At x >= 1 returns Infinity
assert.equal(hyp2f1b(1), Infinity, 'hyp2f1b(1) is Infinity');
assert.equal(hyp2f1b(1.5), Infinity, 'hyp2f1b(1.5) is Infinity');

console.log('hyp2f1b.test: PASS');
