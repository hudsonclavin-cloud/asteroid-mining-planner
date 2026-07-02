import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-feasibility');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'feasibility.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { classifyFeasibility, CAPE_CANAVERAL, VANDENBERG_SFB, LAUNCH_SITES } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'lambert', 'feasibility.js')).href
);

// Site catalog shape (AMD-12-1): classification fields iMinDeg/dlaCeilingDeg present and sourced.
assert.equal(LAUNCH_SITES.length, 2);
assert.deepEqual(
    { ...CAPE_CANAVERAL },
    { name: 'Cape Canaveral', latitudeDeg: 28.5, iMinDeg: 28.5, iMaxDeg: 57, dlaCeilingDeg: 57 }
);
assert.deepEqual(
    { ...VANDENBERG_SFB },
    { name: 'Vandenberg SFB', latitudeDeg: 34.7, iMinDeg: 70, iMaxDeg: 104, dlaCeilingDeg: 90 }
);

// Cape bands — bit-identical to pre-AMD-12-1 behavior (iMin = latitude at a due-east site).
// GREEN: |DLA| <= 28.5 (inclusive, DEC-12-3 convention preserved).
assert.equal(classifyFeasibility(0, CAPE_CANAVERAL), 'GREEN');
assert.equal(classifyFeasibility(20, CAPE_CANAVERAL), 'GREEN');
assert.equal(classifyFeasibility(28.5, CAPE_CANAVERAL), 'GREEN');
assert.equal(classifyFeasibility(-28.5, CAPE_CANAVERAL), 'GREEN');
// AMBER: 28.5 < |DLA| <= 57 (raise parking-orbit inclination).
assert.equal(classifyFeasibility(28.500000001, CAPE_CANAVERAL), 'AMBER');
assert.equal(classifyFeasibility(45, CAPE_CANAVERAL), 'AMBER');
assert.equal(classifyFeasibility(57, CAPE_CANAVERAL), 'AMBER');
assert.equal(classifyFeasibility(-45, CAPE_CANAVERAL), 'AMBER');
// RED: |DLA| > 57 (dogleg).
assert.equal(classifyFeasibility(57.000000001, CAPE_CANAVERAL), 'RED');
assert.equal(classifyFeasibility(60, CAPE_CANAVERAL), 'RED');
assert.equal(classifyFeasibility(-60, CAPE_CANAVERAL), 'RED');
assert.equal(classifyFeasibility(90, CAPE_CANAVERAL), 'RED');

// Vandenberg bands — the AMD-12-1 fix. GREEN edge is iMin=70 (NOT latitude 34.7):
// low declinations are reachable from the 70 deg minimum-inclination orbit at no penalty.
assert.equal(classifyFeasibility(10, VANDENBERG_SFB), 'GREEN');
assert.equal(classifyFeasibility(45, VANDENBERG_SFB), 'GREEN'); // was AMBER pre-amendment
assert.equal(classifyFeasibility(69.9, VANDENBERG_SFB), 'GREEN');
assert.equal(classifyFeasibility(70, VANDENBERG_SFB), 'GREEN');
assert.equal(classifyFeasibility(-70, VANDENBERG_SFB), 'GREEN');
// AMBER: 70 < |DLA| <= 90 (raise toward polar).
assert.equal(classifyFeasibility(70.5, VANDENBERG_SFB), 'AMBER');
assert.equal(classifyFeasibility(85, VANDENBERG_SFB), 'AMBER');
assert.equal(classifyFeasibility(90, VANDENBERG_SFB), 'AMBER');
assert.equal(classifyFeasibility(-90, VANDENBERG_SFB), 'AMBER');
// RED: |DLA| > 90 — unreachable from real DLA (arcsin range), asserted at function level
// so the ceiling semantics (90, not raw iMax=104) are pinned.
assert.equal(classifyFeasibility(90.5, VANDENBERG_SFB), 'RED');
assert.equal(classifyFeasibility(104, VANDENBERG_SFB), 'RED');
assert.equal(classifyFeasibility(110, VANDENBERG_SFB), 'RED');

// Null and non-finite guard (audit M-A): unclassifiable inputs return null, never a band.
assert.equal(classifyFeasibility(null, CAPE_CANAVERAL), null);
assert.equal(classifyFeasibility(Number.NaN, CAPE_CANAVERAL), null);
assert.equal(classifyFeasibility(Number.POSITIVE_INFINITY, CAPE_CANAVERAL), null);
assert.equal(classifyFeasibility(Number.NEGATIVE_INFINITY, VANDENBERG_SFB), null);
assert.equal(classifyFeasibility(Number.NaN, VANDENBERG_SFB), null);

// -0 is a valid DLA (equatorial asymptote).
assert.equal(classifyFeasibility(-0, CAPE_CANAVERAL), 'GREEN');
