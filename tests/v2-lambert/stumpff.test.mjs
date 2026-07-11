import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from '../helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-stumpff');

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
    path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'stumpff.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);

assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { stumpff_c2, stumpff_c3 } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'stumpff.js')).href
);

const TOL = 1e-13;

assert.ok(Math.abs(stumpff_c2(0) - 0.5) < TOL, `stumpff_c2(0) = ${stumpff_c2(0)}, expected 0.5`);
assert.ok(Math.abs(stumpff_c3(0) - 1 / 6) < TOL, `stumpff_c3(0) = ${stumpff_c3(0)}, expected 1/6`);

const c2_1_expected = 1 - Math.cos(1);
const c3_1_expected = 1 - Math.sin(1);
assert.ok(Math.abs(stumpff_c2(1) - c2_1_expected) < TOL, `stumpff_c2(1) = ${stumpff_c2(1)}, expected ${c2_1_expected}`);
assert.ok(Math.abs(stumpff_c3(1) - c3_1_expected) < TOL, `stumpff_c3(1) = ${stumpff_c3(1)}, expected ${c3_1_expected}`);

const c2_neg1_expected = Math.cosh(1) - 1;
const c3_neg1_expected = Math.sinh(1) - 1;
assert.ok(Math.abs(stumpff_c2(-1) - c2_neg1_expected) < TOL, `stumpff_c2(-1) = ${stumpff_c2(-1)}, expected ${c2_neg1_expected}`);
assert.ok(Math.abs(stumpff_c3(-1) - c3_neg1_expected) < TOL, `stumpff_c3(-1) = ${stumpff_c3(-1)}, expected ${c3_neg1_expected}`);

const small = 1e-8;
const c2_small_pos = stumpff_c2(small);
const c2_small_neg = stumpff_c2(-small);
const c3_small_pos = stumpff_c3(small);
const c3_small_neg = stumpff_c3(-small);
assert.ok(Math.abs(c2_small_pos - 0.5) < 1e-9, `stumpff_c2 continuity at psi=+small: ${c2_small_pos}`);
assert.ok(Math.abs(c2_small_neg - 0.5) < 1e-9, `stumpff_c2 continuity at psi=-small: ${c2_small_neg}`);
assert.ok(Math.abs(c3_small_pos - 1 / 6) < 1e-9, `stumpff_c3 continuity at psi=+small: ${c3_small_pos}`);
assert.ok(Math.abs(c3_small_neg - 1 / 6) < 1e-9, `stumpff_c3 continuity at psi=-small: ${c3_small_neg}`);

console.log('stumpff.test: PASS');
