import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-tof');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'tof.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'hyp2f1b.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { compute_y, tof_equation, tof_equation_p, tof_equation_pp, tof_equation_ppp } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'tof.js')).href
);

const TOL = 1e-12;
const TOL_LOOSE = 1e-10;

const CASES = [
    { x: 0.0,  lam: 0.5, y: 0.8660254037844386,  T: 1.480210253088817,    dT: -2.0,                ddT: 4.7293058938612642,  dddT: -16.0 },
    { x: 0.5,  lam: 0.3, y: 0.96566039579139828, T: 0.92722114826440272,  dT: -0.77494418327620951, ddT: 1.1984986453235502,  dddT: -2.6836114219316287 },
    { x: -0.5, lam: 0.7, y: 0.79529868602934339, T: 3.630741542886343,    dT: -10.503195758885866,  ddT: 50.460965620651791,  dddT: -346.44096588840739 },
    { x: 0.9,  lam: 0.2, y: 0.99619275243298167, T: 0.70374114236232121,  dT: -0.44970464067954552, ddT: 0.54257540207249855, dddT: -0.95317323751528882 },
    { x: 1.5,  lam: 0.4, y: 1.0954451150103321,  T: 0.47099587620249395,  dT: -0.23580212905030079, ddT: 0.21898808321253543, dddT: -0.29110552014140217 },
    { x: 0.0,  lam: 0.9, y: 0.43588989435406728, T: 0.8433277167149229,   dT: -2.0,                ddT: 5.8748645499775609,  dddT: -16.0 },
    { x: 0.3,  lam: 0.0, y: 1.0,                 T: 1.128832177904042,    dT: -1.0813747691058926,  ddT: 1.9389388791794366,  dddT: -5.0321170401871687 },
];

for (const c of CASES) {
    const yComputed = compute_y(c.x, c.lam);
    assert.ok(
        Math.abs(yComputed - c.y) < TOL * Math.max(1, Math.abs(c.y)),
        `compute_y(${c.x}, ${c.lam}) = ${yComputed}, expected ${c.y}`
    );
}

for (const c of CASES) {
    const TComputed = tof_equation(c.x, c.y, 0.0, c.lam, 0);
    assert.ok(
        Math.abs(TComputed - c.T) < TOL_LOOSE * Math.max(1, Math.abs(c.T)),
        `tof_equation(x=${c.x}, lam=${c.lam}) = ${TComputed}, expected ${c.T}`
    );
}

for (const c of CASES) {
    const dTComputed = tof_equation_p(c.x, c.y, c.T, c.lam);
    assert.ok(
        Math.abs(dTComputed - c.dT) < TOL_LOOSE * Math.max(1, Math.abs(c.dT)),
        `tof_equation_p(x=${c.x}, lam=${c.lam}) = ${dTComputed}, expected ${c.dT}`
    );
}

for (const c of CASES) {
    const ddTComputed = tof_equation_pp(c.x, c.y, c.T, c.dT, c.lam);
    assert.ok(
        Math.abs(ddTComputed - c.ddT) < TOL_LOOSE * Math.max(1, Math.abs(c.ddT)),
        `tof_equation_pp(x=${c.x}, lam=${c.lam}) = ${ddTComputed}, expected ${c.ddT}`
    );
}

for (const c of CASES) {
    const dddTComputed = tof_equation_ppp(c.x, c.y, c.T, c.dT, c.ddT, c.lam);
    assert.ok(
        Math.abs(dddTComputed - c.dddT) < TOL_LOOSE * Math.max(1, Math.abs(c.dddT)),
        `tof_equation_ppp(x=${c.x}, lam=${c.lam}) = ${dddTComputed}, expected ${c.dddT}`
    );
}

const TAnalytical = tof_equation(0, 1, 0, 0, 0);
assert.ok(
    Math.abs(TAnalytical - Math.PI / 2) < 1e-15,
    `T(x=0, lambda=0) should equal pi/2 = ${Math.PI / 2}, got ${TAnalytical}`
);

console.log('tof.test: PASS');
