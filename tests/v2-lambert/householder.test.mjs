import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from '../helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-householder');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'householder.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'tof.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'hyp2f1b.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'initial-guess.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { householder } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'householder.js')).href
);
const { tof_equation, compute_y } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'tof.js')).href
);
const { initial_guess_single_rev } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'initial-guess.js')).href
);

const RTOL = 1e-8;
const MAX_ITER = 35;

const CASES = [
    { lam: 0.5,  T_star: 2.0, x_final: -0.19936806620615735,  expected_iters_max: 5 },
    { lam: 0.5,  T_star: 1.0, x_final:  0.33746029623214918,  expected_iters_max: 5 },
    { lam: 0.5,  T_star: 0.7, x_final:  0.74440607961617844,  expected_iters_max: 6 },
    { lam: 0.3,  T_star: 1.5, x_final:  0.026974724916094265, expected_iters_max: 5 },
    { lam: 0.9,  T_star: 2.5, x_final: -0.41426131320430387,  expected_iters_max: 5 },
    { lam: 0.0,  T_star: 1.5, x_final:  0.036941284043637265, expected_iters_max: 5 },
    { lam: -0.5, T_star: 2.0, x_final: -0.1413814421957873,   expected_iters_max: 5 },
    { lam: 0.7,  T_star: 0.5, x_final:  0.83446805533644408,  expected_iters_max: 7 },
];

const TOL_X = 1e-12;
const TOL_ROUNDTRIP = 1e-12;

for (const c of CASES) {
    const x_0 = initial_guess_single_rev(c.T_star, c.lam);
    const result = householder(x_0, c.T_star, c.lam, 0, RTOL, MAX_ITER);

    assert.ok(
        result.ok,
        `Householder failed to converge for (lam=${c.lam}, T_star=${c.T_star}): ${result.reason}`
    );

    const x_err = Math.abs(result.x - c.x_final);
    assert.ok(
        x_err < TOL_X * Math.max(1, Math.abs(c.x_final)),
        `x_final mismatch for (lam=${c.lam}, T_star=${c.T_star}): got ${result.x}, expected ${c.x_final}, diff ${x_err}`
    );

    const y_final = compute_y(result.x, c.lam);
    const f_final = tof_equation(result.x, y_final, c.T_star, c.lam, 0);
    assert.ok(
        Math.abs(f_final) < TOL_ROUNDTRIP,
        `Round-trip check failed for (lam=${c.lam}, T_star=${c.T_star}): T(x_final) - T_star = ${f_final}`
    );

    assert.ok(
        result.iterations <= c.expected_iters_max,
        `Too many iterations for (lam=${c.lam}, T_star=${c.T_star}): ${result.iterations} (expected <= ${c.expected_iters_max})`
    );
}

{
    const x_0 = initial_guess_single_rev(0.5, 0.7);
    const result = householder(x_0, 0.5, 0.7, 0, RTOL, 1);
    assert.equal(result.ok, false, 'Householder should report no convergence at max_iter=1');
    assert.equal(result.reason, 'no_convergence');
    assert.equal(result.iterations, 1);
}

console.log('householder.test: PASS');
