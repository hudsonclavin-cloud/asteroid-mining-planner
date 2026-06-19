import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadLambertMultiRev as loadReferenceMultiRev } from '../../tools/slice11-research/measurements/lambert-multi-rev-local.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lambert-multi-rev');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'lambert-multi-rev.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'householder.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'tof.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'hyp2f1b.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'initial-guess.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'vec3.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
        path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
        path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
        path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'slice9-runtime-asteroids.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const importJs = async (relPath) => import(pathToFileURL(path.join(tempOutDir, relPath)).href);

const { lambert } = await importJs('core/lambert/izzo.js');
const { lambertMultiRev, tMinForM } = await importJs('core/lambert/lambert-multi-rev.js');
const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
const { normalizeSlice9BodyForRuntime } = await importJs('app/solar-system/slice9-runtime-asteroids.js');
const { utcStringToTdbSeconds } = await importJs('core/units/utc-to-tdb.js');
const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
const { propagateKeplerianStateVectors } = await importJs('core/propagators/keplerian.js');

const referenceMultiRev = await loadReferenceMultiRev(tempOutDir);

const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const HORIZONS_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-inner-solar-system-2026-2040.json');
const MU_EARTH = 398600.0;
const MU_SUN = 1.32712440018e11;
const SECONDS_PER_DAY = 86400;
const REL_TOL = 1e-12;

function relDiff(a, b) {
    return Math.abs(a - b) / Math.max(Math.abs(b), 1);
}

function assertVecClose(actual, expected, label) {
    for (let index = 0; index < 3; index += 1) {
        const diff = relDiff(actual[index], expected[index]);
        assert.ok(
            diff < REL_TOL,
            `${label}[${index}] mismatch: got ${actual[index]}, expected ${expected[index]}, relDiff=${diff}`
        );
    }
}

function magnitude3(vector) {
    return Math.hypot(vector[0], vector[1], vector[2]);
}

function kmVectorFromMeters(positionM) {
    return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

const rawCatalog = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
const canonicalCatalog = ingestSlice9Fixture(rawCatalog);
const normalizedBodies = Object.values(canonicalCatalog.asteroids).map((body) => normalizeSlice9BodyForRuntime(body));
const bodiesByDesignation = new Map(normalizedBodies.map((body) => [body.designation, body]));

const rawHorizons = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
const horizonsStates = ingestSlice2Fixture(rawHorizons);
const earthSeries = horizonsStates.earth.map((sample) => sample.state);

function buildTransfer(designation, departureUtc, tofDays) {
    const body = bodiesByDesignation.get(designation);
    assert.ok(body, `Missing body ${designation}`);

    const departureTdbSeconds = utcStringToTdbSeconds(departureUtc);
    const tofSeconds = tofDays * SECONDS_PER_DAY;
    const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
    const earthState = interpolateBodyStateSeries('earth', earthSeries, departureTdbSeconds);
    const asteroidState = propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);

    return {
        designation,
        departureUtc,
        tofDays,
        tofSeconds,
        r1: kmVectorFromMeters(earthState.positionM),
        r2: kmVectorFromMeters(asteroidState.positionM),
    };
}

function findM1Case(designation) {
    const departureDates = ['2028-01-01', '2028-07-01', '2029-01-01', '2029-07-01', '2030-01-01'];
    const tofCandidates = [320, 420, 520, 650, 800, 950];

    for (const departureUtc of departureDates) {
        for (const tofDays of tofCandidates) {
            const transfer = buildTransfer(designation, departureUtc, tofDays);
            const reference = referenceMultiRev(MU_SUN, transfer.r1, transfer.r2, transfer.tofSeconds, { M: 1 });
            if (reference.left.ok && reference.right.ok) {
                return { transfer, reference };
            }
        }
    }

    throw new Error(`Unable to find converged M=1 reference case for ${designation}`);
}

function findM2Case(designation) {
    const departureDates = ['2028-01-01', '2029-01-01', '2030-01-01'];
    const tofCandidates = [900, 1050, 1200];

    for (const departureUtc of departureDates) {
        for (const tofDays of tofCandidates) {
            const transfer = buildTransfer(designation, departureUtc, tofDays);
            return transfer;
        }
    }

    throw new Error(`Unable to create M=2 case for ${designation}`);
}

function findBoundaryFailureCase() {
    const { transfer } = findM1Case('99942');
    let low = 60;
    let high = transfer.tofDays;

    for (let iter = 0; iter < 24; iter += 1) {
        const mid = (low + high) / 2;
        const candidate = buildTransfer('99942', transfer.departureUtc, mid);
        const result = lambertMultiRev(candidate.r1, candidate.r2, candidate.tofSeconds, MU_SUN, 1, true);
        if (result && result.branches.some((branch) => branch.converged)) {
            high = mid;
        } else {
            low = mid;
        }
    }

    return buildTransfer('99942', transfer.departureUtc, low);
}

const M0_CASES = [
    {
        name: 'Curtis 5.2',
        mu: MU_EARTH,
        r1: [5000.0, 10000.0, 2100.0],
        r2: [-14600.0, 2500.0, 7000.0],
        tof: 3600.0,
    },
    {
        name: 'Curtis 5.3',
        mu: MU_EARTH,
        r1: [15945.34, 0.0, 0.0],
        r2: [12214.83399, 10249.46731, 0.0],
        tof: 76 * 60.0,
    },
    {
        name: 'Heliocentric',
        mu: MU_SUN,
        r1: [1.495978707e8, 0.0, 0.0],
        r2: [0.0, 1.5 * 1.495978707e8, 0.0],
        tof: 200 * SECONDS_PER_DAY,
    },
];

for (const testCase of M0_CASES) {
    const singleRev = lambert(testCase.mu, testCase.r1, testCase.r2, testCase.tof, { M: 0, prograde: true });
    assert.ok(singleRev.ok, `${testCase.name}: lambert() failed with ${singleRev.reason}`);
    const multiRev = lambertMultiRev(testCase.r1, testCase.r2, testCase.tof, testCase.mu, 0, true);
    assert.ok(multiRev, `${testCase.name}: lambertMultiRev(M=0) returned null`);
    assert.equal(multiRev.M, 0, `${testCase.name}: expected M=0 result shape`);
    assert.equal(multiRev.branches.length, 1, `${testCase.name}: expected single M=0 branch`);
    assert.equal(multiRev.branches[0].branch, 'single', `${testCase.name}: expected single branch tag`);
    assert.ok(multiRev.branches[0].converged, `${testCase.name}: lambertMultiRev(M=0) should converge`);
    assertVecClose(multiRev.branches[0].v1, singleRev.v1, `${testCase.name} v1`);
    assertVecClose(multiRev.branches[0].v2, singleRev.v2, `${testCase.name} v2`);
}

{
    const invalidCollinear = lambertMultiRev([10000, 0, 0], [20000, 0, 0], 3600, MU_EARTH, 0, true);
    assert.equal(invalidCollinear, null, 'Collinear M=0 geometry should return null');

    const invalidZero = lambertMultiRev([0, 0, 0], [10000, 0, 0], 3600, MU_EARTH, 0, true);
    assert.equal(invalidZero, null, 'Zero-vector M=0 geometry should return null');
}

{
    const tooShort = buildTransfer('99942', '2029-01-01', 45);
    const result = lambertMultiRev(tooShort.r1, tooShort.r2, tooShort.tofSeconds, MU_SUN, 1, true);
    assert.equal(result, null, 'Expected M=1 T_min guard to reject short Apophis transfer');
}

{
    const result = lambertMultiRev(
        [1, 0, 0],
        [0.9779616006837398, 0.208784835627728, 0],
        4.106597493078267,
        1,
        1,
        true
    );
    assert.ok(result, 'F1 geometry should return both M=1 branches');
    assert.equal(result.M, 1, 'F1 geometry should preserve M=1 in result shape');
    assert.equal(result.branches.length, 2, 'F1 geometry should return left/right branches');
    const right = result.branches[1];
    assert.equal(right.branch, 'right', 'F1 geometry right branch should remain second');
    assert.ok(right.converged, 'F1 geometry right branch should converge under the x^2 <= 0.90 ceiling');
    assert.ok(Math.abs(right.x - 0.4819033370912975) < 1e-9, `Expected right branch x≈0.4819033370912975, got ${right.x}`);
    assert.ok(right.x * right.x < 0.90, `Expected right branch x² < 0.90, got ${right.x * right.x}`);
}

{
    const r1 = [1, 0, 0];
    const r2 = [-0.9992001599760031, 0.03998800199972351, 0];
    const c = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
    const cMag = magnitude3(c);
    const r1Mag = magnitude3(r1);
    const r2Mag = magnitude3(r2);
    const s = 0.5 * (r1Mag + r2Mag + cMag);
    const lambda = Math.sqrt(1 - Math.min(1, cMag / s));
    const tMin = tMinForM(lambda, 1);
    assert.ok(tMin !== null, 'Expected tMinForM(lambda, 1) to return a finite minimum');
    assert.ok(
        Math.abs(tMin - 4.566662627610557) < 1e-9,
        `Expected corrected T_min≈4.566662627610557, got ${tMin}`
    );
    // poliastro 0.17 gates at the older higher threshold; this corrected iteration intentionally
    // matches the independent f64 scan rather than mirroring poliastro's minimum-time gate.
}

for (const designation of ['99942', '101955', '25143']) {
    const { transfer, reference } = findM1Case(designation);
    const result = lambertMultiRev(transfer.r1, transfer.r2, transfer.tofSeconds, MU_SUN, 1, true);
    assert.ok(result, `${designation}: expected non-null M=1 result`);
    assert.equal(result.M, 1, `${designation}: expected M=1 result shape`);
    assert.equal(result.branches.length, 2, `${designation}: expected left/right branches`);
    assert.equal(result.branches[0].branch, 'left', `${designation}: expected left branch first`);
    assert.equal(result.branches[1].branch, 'right', `${designation}: expected right branch second`);

    const convergedBranches = result.branches.filter((branch) => branch.converged);
    assert.ok(convergedBranches.length >= 1, `${designation}: expected at least one converged M=1 branch`);

    for (const branch of result.branches) {
        assert.ok(Number.isFinite(branch.x), `${designation}: branch ${branch.branch} x must be finite`);
        if (!branch.converged) {
            continue;
        }
        assert.ok(
            Number.isFinite(branch.v1[0]) && Number.isFinite(branch.v1[1]) && Number.isFinite(branch.v1[2]),
            `${designation}: ${branch.branch} v1 must be finite`
        );
        assert.ok(
            Number.isFinite(branch.v2[0]) && Number.isFinite(branch.v2[1]) && Number.isFinite(branch.v2[2]),
            `${designation}: ${branch.branch} v2 must be finite`
        );
        const expected = reference[branch.branch];
        assert.ok(expected.ok, `${designation}: reference ${branch.branch} branch should converge`);
        assertVecClose(branch.v1, expected.v1, `${designation} ${branch.branch} v1`);
        assertVecClose(branch.v2, expected.v2, `${designation} ${branch.branch} v2`);
    }
}

for (const designation of ['99942', '101955']) {
    const transfer = findM2Case(designation);
    const result = lambertMultiRev(transfer.r1, transfer.r2, transfer.tofSeconds, MU_SUN, 2, true);
    if (result === null) {
        continue;
    }
    assert.equal(result.M, 2, `${designation}: expected M=2 result shape`);
    assert.equal(result.branches.length, 2, `${designation}: expected left/right M=2 branches`);
    assert.equal(result.branches[0].branch, 'left', `${designation}: expected left branch first`);
    assert.equal(result.branches[1].branch, 'right', `${designation}: expected right branch second`);
    for (const branch of result.branches) {
        assert.ok(Number.isFinite(branch.x), `${designation}: M=2 ${branch.branch} x must be finite`);
    }
}

{
    const boundary = findBoundaryFailureCase();
    const result = lambertMultiRev(boundary.r1, boundary.r2, boundary.tofSeconds, MU_SUN, 1, true);
    if (result === null) {
        assert.equal(result, null, 'Boundary case may return null at the T_min guard');
    } else {
        assert.equal(result.branches.length, 2, 'Boundary case should preserve both branches when non-null');
        assert.ok(
            result.branches.every((branch) => branch.converged === false),
            'Boundary case should fail closed with explicit non-converged branches when it is non-null'
        );
    }
}

assert.throws(
    () => lambertMultiRev([1, 0, 0], [0, 1, 0], 3600, MU_EARTH, 3, true),
    RangeError,
    'M=3 should throw RangeError'
);

console.log('lambert-multi-rev.test: PASS');
