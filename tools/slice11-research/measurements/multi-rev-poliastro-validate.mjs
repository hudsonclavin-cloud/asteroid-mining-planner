#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice11-multi-rev-validation');
const DATA_PATH = path.join(repoRoot, 'tools', 'slice11-research', 'data', 'multi-rev-poliastro-validation.json');
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const HORIZONS_FIXTURE = path.join(
    repoRoot,
    'src',
    'v2',
    'data',
    'horizons-inner-solar-system-2026-2040.json'
);
const POLIASTRO_SCRIPT = path.join(repoRoot, 'tools', 'slice11-research', 'measurements', 'poliastro-grid.py');
const POLIASTRO_PYTHON = path.join(os.homedir(), '.aster-slice11-venv', 'bin', 'python');

const GRID_DEPARTURE_COUNT = 50;
const GRID_TOF_COUNT = 50;
const DEPARTURE_START_UTC = '2026-01-01';
const DEPARTURE_END_UTC = '2032-01-01';
const TOF_MIN_DAYS = 182.5;
const TOF_MAX_DAYS = 1095.75;
const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11;
const POLIASTRO_TARGET = 1e-6;
const TOF_SELF_CONSISTENCY_TARGET = 1e-8;

function isoNow() {
    return new Date().toISOString();
}

function writeJson(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function buildLinspace(start, end, count) {
    if (count <= 1) {
        return [start];
    }
    const step = (end - start) / (count - 1);
    return Array.from({ length: count }, (_, index) => start + step * index);
}

function kmVectorFromMeters(positionM) {
    return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

function kmpsVectorFromMps(velocityMps) {
    return [velocityMps.x / 1000, velocityMps.y / 1000, velocityMps.z / 1000];
}

function subtract3(left, right) {
    return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function cross3(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function scale3(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function magnitude3(vector) {
    return Math.hypot(vector[0], vector[1], vector[2]);
}

function relativeError(ours, reference) {
    return Math.abs(ours - reference) / Math.max(Math.abs(reference), 1e-12);
}

function summarizeErrors(values) {
    if (values.length === 0) {
        return { max: null, mean: null };
    }
    const sum = values.reduce((total, value) => total + value, 0);
    return {
        max: values.reduce((best, value) => Math.max(best, value), 0),
        mean: sum / values.length,
    };
}

function compileRuntimeModules() {
    fs.rmSync(TEMP_OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEMP_OUT_DIR, { recursive: true });

    const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
    const tscResult = spawnSync(
        tscBin,
        [
            '--pretty', 'false',
            '--outDir', TEMP_OUT_DIR,
            '--rootDir', path.join(repoRoot, 'src', 'v2'),
            '--module', 'NodeNext',
            '--target', 'ES2020',
            '--moduleResolution', 'NodeNext',
            '--isolatedModules', 'true',
            path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'izzo.ts'),
            path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'lambert-multi-rev.ts'),
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
    if (tscResult.status !== 0) {
        throw new Error(tscResult.stderr || tscResult.stdout || 'TypeScript compile failed');
    }
}

const importJs = async (relPath) => import(pathToFileURL(path.join(TEMP_OUT_DIR, relPath)).href);

function normalizeAngle(angle) {
    const twoPi = 2 * Math.PI;
    let normalized = angle % twoPi;
    if (normalized < 0) {
        normalized += twoPi;
    }
    return normalized;
}

function orbitalTofFromState(r1, r2, v1, mu, M) {
    const r1Mag = magnitude3(r1);
    const v1Mag = magnitude3(v1);
    const h = cross3(r1, v1);
    const hMag = magnitude3(h);
    if (!(r1Mag > 0) || !(hMag > 0)) {
        return null;
    }

    const eVec = sub3(scale3(cross3(v1, h), 1 / mu), scale3(r1, 1 / r1Mag));
    const e = magnitude3(eVec);
    const a = 1 / (2 / r1Mag - (v1Mag * v1Mag) / mu);
    if (!Number.isFinite(a) || a <= 0 || e >= 1) {
        return null;
    }

    const hHat = scale3(h, 1 / hMag);
    const pHat = e > 1e-12 ? scale3(eVec, 1 / e) : scale3(r1, 1 / r1Mag);
    const qHatRaw = cross3(hHat, pHat);
    const qHatMag = magnitude3(qHatRaw);
    if (!(qHatMag > 0)) {
        return null;
    }
    const qHat = scale3(qHatRaw, 1 / qHatMag);

    const nu1 = normalizeAngle(Math.atan2(dot3(r1, qHat), dot3(r1, pHat)));
    const nu2 = normalizeAngle(Math.atan2(dot3(r2, qHat), dot3(r2, pHat)));

    const eccentricAnomaly = (nu) =>
        normalizeAngle(
            2 *
                Math.atan2(
                    Math.sqrt(1 - e) * Math.sin(nu / 2),
                    Math.sqrt(1 + e) * Math.cos(nu / 2)
                )
        );

    const E1 = eccentricAnomaly(nu1);
    const E2 = eccentricAnomaly(nu2);
    const meanAnomaly = (E) => E - e * Math.sin(E);
    let deltaM = meanAnomaly(E2) - meanAnomaly(E1);
    if (deltaM < 0) {
        deltaM += 2 * Math.PI;
    }

    const meanMotion = Math.sqrt(mu / (a * a * a));
    return (deltaM + 2 * Math.PI * M) / meanMotion;
}

async function buildReferenceContext() {
    compileRuntimeModules();

    const { lambert } = await importJs('core/lambert/izzo.js');
    const { lambertMultiRev } = await importJs('core/lambert/lambert-multi-rev.js');
    const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
    const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
    const { normalizeSlice9BodyForRuntime } = await importJs('app/solar-system/slice9-runtime-asteroids.js');
    const { utcStringToTdbSeconds } = await importJs('core/units/utc-to-tdb.js');
    const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
    const { propagateKeplerianStateVectors } = await importJs('core/propagators/keplerian.js');

    const rawCatalog = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
    const canonicalCatalog = ingestSlice9Fixture(rawCatalog);
    const bodies = Object.values(canonicalCatalog.asteroids).map((body) => normalizeSlice9BodyForRuntime(body));
    const byDesignation = new Map(bodies.map((body) => [body.designation, body]));

    const rawHorizons = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
    const horizonsStates = ingestSlice2Fixture(rawHorizons);
    const earthSeries = horizonsStates.earth.map((sample) => sample.state);

    const references = ['99942', '101955', '25143'].map((designation) => {
        const body = byDesignation.get(designation);
        if (!body) {
            throw new Error(`Missing reference body ${designation}`);
        }
        return body;
    });

    const departureDates = buildLinspace(
        utcStringToTdbSeconds(DEPARTURE_START_UTC),
        utcStringToTdbSeconds(DEPARTURE_END_UTC),
        GRID_DEPARTURE_COUNT
    ).map((tdbSeconds) => ({
        depDate: new Date((tdbSeconds / SECONDS_PER_DAY + 2451545 - 2440587.5) * SECONDS_PER_DAY * 1000)
            .toISOString()
            .slice(0, 10),
        departureTdbSeconds: tdbSeconds,
    }));
    const tofDaysGrid = buildLinspace(TOF_MIN_DAYS, TOF_MAX_DAYS, GRID_TOF_COUNT);

    return {
        lambert,
        lambertMultiRev,
        references,
        earthSeries,
        departureDates,
        tofDaysGrid,
        interpolateBodyStateSeries,
        propagateKeplerianStateVectors,
    };
}

function buildCellsForBody(body, earthSeries, departureDates, tofDaysGrid, interpolateBodyStateSeries, propagateKeplerianStateVectors) {
    const cells = [];
    for (const { depDate, departureTdbSeconds } of departureDates) {
        const earthState = interpolateBodyStateSeries('earth', earthSeries, departureTdbSeconds);
        const earthPositionKm = kmVectorFromMeters(earthState.positionM);
        const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

        for (const tofDays of tofDaysGrid) {
            const tofSeconds = tofDays * SECONDS_PER_DAY;
            const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
            const asteroidState = propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);
            const asteroidPositionKm = kmVectorFromMeters(asteroidState.positionM);
            const asteroidVelocityKmps = kmpsVectorFromMps(asteroidState.velocityMps);

            cells.push({
                depDate,
                tofDays,
                tofSeconds,
                earthPositionKm,
                asteroidPositionKm,
                earthVelocityKmps,
                asteroidVelocityKmps,
            });
        }
    }
    return cells;
}

function runPpoliastroGrid(cells) {
    const pyResult = spawnSync(POLIASTRO_PYTHON, [POLIASTRO_SCRIPT], {
        cwd: repoRoot,
        input: JSON.stringify({ muSunKm3S2: MU_SUN, cells }),
        encoding: 'utf8',
    });
    if (pyResult.status !== 0) {
        throw new Error(pyResult.stderr || pyResult.stdout || 'poliastro-grid.py failed');
    }

    const parsed = JSON.parse(pyResult.stdout);
    if (!parsed.ok) {
        throw new Error(`poliastro-grid.py reported failure: ${parsed.error} (${parsed.depDate}, ${parsed.tofDays})`);
    }
    return parsed.cells;
}

function summarizeM0(body, cells, lambert) {
    const ours = [];
    for (const cell of cells) {
        const result = lambert(MU_SUN, cell.earthPositionKm, cell.asteroidPositionKm, cell.tofSeconds);
        if (!result.ok) {
            throw new Error(`M=0 lambert failed for ${body.designation} at ${cell.depDate}/${cell.tofDays}: ${result.reason}`);
        }
        const vInfDep = subtract3(result.v1, cell.earthVelocityKmps);
        const vInfArr = subtract3(result.v2, cell.asteroidVelocityKmps);
        ours.push({
            c3: magnitude3(vInfDep) ** 2,
            vInfDep: magnitude3(vInfDep),
            vInfArr: magnitude3(vInfArr),
        });
    }

    const reference = runPpoliastroGrid(cells);
    const cellErrors = [];
    for (let index = 0; index < ours.length; index += 1) {
        const oursCell = ours[index];
        const referenceCell = reference[index];
        const c3Rel = relativeError(oursCell.c3, referenceCell.c3);
        const depRel = relativeError(oursCell.vInfDep, referenceCell.vInfDep);
        const arrRel = relativeError(oursCell.vInfArr, referenceCell.vInfArr);
        cellErrors.push(Math.max(c3Rel, depRel, arrRel));
    }

    const summary = summarizeErrors(cellErrors);
    return {
        body: body.name ?? body.designation,
        M: 0,
        totalCells: cells.length,
        convergedCells: cells.length,
        maxRelError: summary.max,
        meanRelError: summary.mean,
        failedCells: 0,
        passesAuditTarget: summary.max !== null && summary.max <= POLIASTRO_TARGET,
        poliastro_compared: true,
    };
}

function summarizeMultiRev(body, cells, lambertMultiRev, M) {
    let convergedCells = 0;
    let failedCells = 0;
    let returnedCells = 0;
    let nonFiniteCells = 0;
    const tofErrors = [];

    for (const cell of cells) {
        const result = lambertMultiRev(cell.earthPositionKm, cell.asteroidPositionKm, cell.tofSeconds, MU_SUN, M, true);
        if (result === null) {
            failedCells += 1;
            continue;
        }

        returnedCells += 1;
        const convergedBranches = result.branches.filter((branch) => branch.converged);
        if (convergedBranches.length > 0) {
            convergedCells += 1;
        }
        for (const branch of convergedBranches) {
            if (![...branch.v1, ...branch.v2].every(Number.isFinite)) {
                nonFiniteCells += 1;
                continue;
            }

            const reconstructedTof = orbitalTofFromState(
                cell.earthPositionKm,
                cell.asteroidPositionKm,
                branch.v1,
                MU_SUN,
                M
            );
            if (reconstructedTof === null || !Number.isFinite(reconstructedTof)) {
                nonFiniteCells += 1;
                continue;
            }

            tofErrors.push(Math.abs(reconstructedTof - cell.tofSeconds) / cell.tofSeconds);
        }
    }

    const summary = summarizeErrors(tofErrors);
    return {
        body: body.name ?? body.designation,
        M,
        totalCells: cells.length,
        convergedCells,
        maxRelError: summary.max,
        meanRelError: summary.mean,
        failedCells,
        passesAuditTarget: summary.max !== null && summary.max <= TOF_SELF_CONSISTENCY_TARGET,
        poliastro_compared: false,
        returnedCells,
        nonFiniteCells,
        selfConsistencyCheckedCells: tofErrors.length,
    };
}

async function main() {
    if (!fs.existsSync(POLIASTRO_PYTHON)) {
        throw new Error(`Expected poliastro python at ${POLIASTRO_PYTHON}`);
    }

    const {
        lambert,
        lambertMultiRev,
        references,
        earthSeries,
        departureDates,
        tofDaysGrid,
        interpolateBodyStateSeries,
        propagateKeplerianStateVectors,
    } = await buildReferenceContext();

    const rows = [];
    for (const body of references) {
        const cells = buildCellsForBody(
            body,
            earthSeries,
            departureDates,
            tofDaysGrid,
            interpolateBodyStateSeries,
            propagateKeplerianStateVectors
        );

        rows.push(summarizeM0(body, cells, lambert));
        rows.push(summarizeMultiRev(body, cells, lambertMultiRev, 1));
        rows.push(summarizeMultiRev(body, cells, lambertMultiRev, 2));
    }

    const overallMaxRelError = rows.reduce((best, row) => {
        if (row.maxRelError === null) {
            return best;
        }
        return Math.max(best, row.maxRelError);
    }, 0);

    const output = {
        generated: isoNow(),
        sliceVersion: '11-phase-a',
        solverCommit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).stdout.trim(),
        bodies: ['Apophis', 'Bennu', 'Itokawa'],
        M_values: [0, 1, 2],
        gridSize: '50x50',
        tolerance_target: POLIASTRO_TARGET,
        results: rows,
        overallMaxRelError,
        overallPassesAuditTarget: rows.every((row) => row.passesAuditTarget),
    };

    writeJson(DATA_PATH, output);
    console.log(`wrote ${DATA_PATH}`);
}

await main();
