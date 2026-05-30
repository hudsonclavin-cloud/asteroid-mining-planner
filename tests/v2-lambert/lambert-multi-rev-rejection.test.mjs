import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-multi-rev-rejection');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'izzo.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { lambert } = await import(pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'izzo.js')).href);

const MU_SUN = 1.32712440018e11;

// Known-converging heliocentric transfer geometry.
const r1 = [148000000, 25000000, 12000000];
const r2 = [185000000, 30000000, 15000000];
const tof = 49 * 86400;

const result0 = lambert(MU_SUN, r1, r2, tof);
assert.ok(result0.ok, `M=0 case should succeed; got reason=${result0.reason}`);

const resultExplicit0 = lambert(MU_SUN, r1, r2, tof, { M: 0 });
assert.ok(resultExplicit0.ok, `M=0 explicit case should succeed; got reason=${resultExplicit0.reason}`);

const result1 = lambert(MU_SUN, r1, r2, tof, { M: 1 });
assert.ok(!result1.ok, 'M=1 case should fail (not supported in Slice 10)');
assert.equal(
    result1.reason,
    'multi_rev_not_supported',
    `expected multi_rev_not_supported, got ${result1.reason}`
);

const result2 = lambert(MU_SUN, r1, r2, tof, { M: 2 });
assert.ok(!result2.ok, 'M=2 case should fail (not supported in Slice 10)');
assert.equal(
    result2.reason,
    'multi_rev_not_supported',
    `expected multi_rev_not_supported, got ${result2.reason}`
);

const resultNeg = lambert(MU_SUN, r1, r2, tof, { M: -1 });
assert.ok(!resultNeg.ok, 'M=-1 case should fail (not supported in Slice 10)');
assert.equal(resultNeg.reason, 'multi_rev_not_supported');

console.log('lambert-multi-rev-rejection.test: PASS');
