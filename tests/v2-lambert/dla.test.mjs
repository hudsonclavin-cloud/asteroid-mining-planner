import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-dla');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const tscResult = spawnSync(
    process.execPath,
    [
        tscBin,
        '--pretty',
        'false',
        '--outDir',
        tempOutDir,
        '--rootDir',
        path.join(repoRoot, 'src', 'v2'),
        '--module',
        'NodeNext',
        '--target',
        'ES2020',
        '--moduleResolution',
        'NodeNext',
        '--isolatedModules',
        'true',
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'dla.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { dlaDegFromVInf } = await import(pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'dla.js')).href);

function assertClose(actual, expected, toleranceDeg, label) {
    assert.equal(typeof actual, 'number', `${label}: expected number, got ${actual}`);
    assert.ok(Math.abs(actual - expected) <= toleranceDeg, `${label}: got ${actual}, expected ${expected}`);
}

assert.equal(dlaDegFromVInf(4, -7, 0), 0);
assert.equal(dlaDegFromVInf(0, 0, 5), 90);
assert.equal(dlaDegFromVInf(0, 0, -5), -90);
assertClose(dlaDegFromVInf(3, 0, 3), 45, 1e-12, '45-degree fixture');
assertClose(dlaDegFromVInf(1, 2, 2), 41.810314895778596, 1e-12, 'asymmetric fixture');
assert.equal(dlaDegFromVInf(1e-4, 0, 0), null);

const pole = dlaDegFromVInf(0, 0, 1);
assert.equal(Number.isNaN(pole), false);
assert.equal(pole, 90);

const positive = dlaDegFromVInf(1.25, -0.75, 2.5);
const negative = dlaDegFromVInf(1.25, -0.75, -2.5);
assertClose(negative, -positive, 1e-12, 'negative-Z symmetry');
