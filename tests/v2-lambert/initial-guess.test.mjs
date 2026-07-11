import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from '../helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-initial-guess');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'initial-guess.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { initial_guess_single_rev, initial_guess_multi_rev } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'initial-guess.js')).href
);

const TOL = 1e-13;

const SINGLE_REV_CASES = [
    { lam: 0.5,  T: 5.0,    x_0: -0.55580983760844871 },
    // Middle-branch cases regenerated from poliastro/core/iod.py after fixing the Eq. 30 interpolation.
    { lam: 0.5,  T: 1.0,    x_0:  0.3390118241523543  },
    { lam: 0.5,  T: 0.3,    x_0:  2.4217443249701311  },
    { lam: 0.0,  T: 2.0,    x_0: -0.14874451963081137 },
    { lam: 0.0,  T: 0.5,    x_0:  1.5555555555555554  },
    { lam: 0.9,  T: 3.0,    x_0: -0.57087539875259963 },
    { lam: 0.9,  T: 0.1,    x_0:  1.8897082963650313  },
    { lam: -0.5, T: 2.0,    x_0: -0.11632397308891218 },
    { lam: 0.3,  T: 1.5,    x_0:  0.027591773840089928},
];

for (const c of SINGLE_REV_CASES) {
    const x_0 = initial_guess_single_rev(c.T, c.lam);
    const tol = TOL * Math.max(1, Math.abs(c.x_0));
    assert.ok(
        Math.abs(x_0 - c.x_0) < tol,
        `initial_guess_single_rev(T=${c.T}, lam=${c.lam}) = ${x_0}, expected ${c.x_0}, diff ${x_0 - c.x_0}`
    );
}

const MULTI_REV_CASES = [
    { lam: 0.5, T:  3.0, M: 1, x_0l: -0.41920372071857415, x_0r: 0.59007077903356264 },
    { lam: 0.5, T:  8.0, M: 1, x_0l: -0.64905765783153235, x_0r: 0.76356837454861903 },
    { lam: 0.3, T:  4.0, M: 1, x_0l: -0.49496835370214648, x_0r: 0.64905765783153235 },
    { lam: 0.3, T: 10.0, M: 2, x_0l: -0.61248889022828401, x_0r: 0.69004929624445088 },
    { lam: 0.7, T:  6.0, M: 1, x_0l: -0.59007077903356275, x_0r: 0.7205671923475987  },
];

for (const c of MULTI_REV_CASES) {
    const { x_0l, x_0r } = initial_guess_multi_rev(c.T, c.lam, c.M);
    const tol_l = TOL * Math.max(1, Math.abs(c.x_0l));
    const tol_r = TOL * Math.max(1, Math.abs(c.x_0r));
    assert.ok(
        Math.abs(x_0l - c.x_0l) < tol_l,
        `initial_guess_multi_rev lower (T=${c.T}, lam=${c.lam}, M=${c.M}): got ${x_0l}, expected ${c.x_0l}`
    );
    assert.ok(
        Math.abs(x_0r - c.x_0r) < tol_r,
        `initial_guess_multi_rev upper (T=${c.T}, lam=${c.lam}, M=${c.M}): got ${x_0r}, expected ${c.x_0r}`
    );
}

console.log('initial-guess.test: PASS');
