#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice12-dla-validation');
const DATA_PATH = path.join(repoRoot, 'tools', 'slice12-research', 'data', 'dla-oracle-validation.json');
const DATA_NEW_PATH = `${DATA_PATH}.new`;
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const HORIZONS_FIXTURE = path.join(
    repoRoot,
    'src',
    'v2',
    'data',
    'horizons-inner-solar-system-2026-2040.json'
);
const POLIASTRO_SCRIPT = path.join(repoRoot, 'tools', 'slice12-research', 'dla-oracle-grid.py');
const POLIASTRO_PYTHON_CANDIDATES = [
    process.env.POLIASTRO_PYTHON,
    path.join(os.homedir(), '.aster-slice11-venv', 'bin', 'python'),
    path.join(os.homedir(), '.aster-slice11-venv', 'Scripts', 'python.exe'),
    'python',
].filter(Boolean);

const GRID_DEPARTURE_COUNT = 25;
const GRID_TOF_COUNT = 25;
const DEPARTURE_START_UTC = '2026-01-01';
const DEPARTURE_END_UTC = '2032-01-01';
const TOF_MIN_DAYS = 182.5;
const TOF_MAX_DAYS = 1095.75;
const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11;
const DLA_BAR_DEG = 1e-6;
const MIN_VALID_VINF_KMPS = 0.1;

function isoNow() {
    return new Date().toISOString();
}

function writeJsonAtomic(filePath, tempPath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.renameSync(tempPath, filePath);
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

function magnitude3(vector) {
    return Math.hypot(vector[0], vector[1], vector[2]);
}

function summarize(values) {
    if (values.length === 0) {
        return { maxAbsDeg: null, rmsDeg: null };
    }
    const maxAbsDeg = values.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
    const rmsDeg = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
    return { maxAbsDeg, rmsDeg };
}

function compileRuntimeModules() {
    fs.rmSync(TEMP_OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEMP_OUT_DIR, { recursive: true });

    const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
    const tscResult = spawnSync(
        process.execPath,
        [
            tscBin,
            '--pretty',
            'false',
            '--outDir',
            TEMP_OUT_DIR,
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
            path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'izzo.ts'),
            path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'dla.ts'),
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

function resolvePython() {
    for (const candidate of POLIASTRO_PYTHON_CANDIDATES) {
        const check = spawnSync(candidate, ['-c', 'import poliastro; print(poliastro.__version__)'], {
            cwd: repoRoot,
            encoding: 'utf8',
        });
        if (check.status === 0) {
            return candidate;
        }
    }
    throw new Error(
        `Unable to locate Python with poliastro. Tried: ${POLIASTRO_PYTHON_CANDIDATES.join(', ')}`
    );
}

const importJs = async (relPath) => import(pathToFileURL(path.join(TEMP_OUT_DIR, relPath)).href);

async function main() {
    compileRuntimeModules();

    const poliastroPython = resolvePython();
    const { lambert } = await importJs('core/lambert/izzo.js');
    const { dlaDegFromVInf } = await importJs('core/lambert/dla.js');
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
    const body = byDesignation.get('99942');
    if (!body) {
        throw new Error('Missing reference body 99942 (Apophis)');
    }

    const rawHorizons = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
    const horizonsStates = ingestSlice2Fixture(rawHorizons);
    const earthSeries = horizonsStates.earth.map((sample) => sample.state);

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

    const cells = [];
    const ours = [];

    for (const { depDate, departureTdbSeconds } of departureDates) {
        const earthState = interpolateBodyStateSeries('earth', earthSeries, departureTdbSeconds);
        const earthPositionKm = kmVectorFromMeters(earthState.positionM);
        const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

        for (const tofDays of tofDaysGrid) {
            const tofSeconds = tofDays * SECONDS_PER_DAY;
            const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
            const asteroidState = propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);
            const asteroidPositionKm = kmVectorFromMeters(asteroidState.positionM);

            const result = lambert(MU_SUN, earthPositionKm, asteroidPositionKm, tofSeconds);
            if (!result.ok) {
                throw new Error(`Our Lambert solver failed at ${depDate} / ${tofDays}d: ${result.reason}`);
            }

            const vInfDep = subtract3(result.v1, earthVelocityKmps);
            const vInfDepMag = magnitude3(vInfDep);
            ours.push({
                depDate,
                tofDays,
                dlaDeg: dlaDegFromVInf(vInfDep[0], vInfDep[1], vInfDep[2], MIN_VALID_VINF_KMPS),
                vInfDepMag,
            });
            cells.push({
                depDate,
                tofDays,
                earthPositionKm,
                asteroidPositionKm,
                earthVelocityKmps,
            });
        }
    }

    const pyResult = spawnSync(poliastroPython, [POLIASTRO_SCRIPT], {
        cwd: repoRoot,
        input: JSON.stringify({ muSunKm3S2: MU_SUN, cells }),
        encoding: 'utf8',
    });
    if (pyResult.status !== 0) {
        throw new Error(pyResult.stderr || pyResult.stdout || 'dla-oracle-grid.py failed');
    }

    const parsed = JSON.parse(pyResult.stdout);
    if (!parsed.ok) {
        throw new Error(`dla-oracle-grid.py reported failure: ${parsed.error} (${parsed.depDate}, ${parsed.tofDays})`);
    }
    if (parsed.cells.length !== ours.length) {
        throw new Error(`Cell count mismatch: ours=${ours.length}, poliastro=${parsed.cells.length}`);
    }

    const deltas = [];
    const skippedLowVInf = [];
    const branchMismatches = [];
    let maxCell = null;

    for (let index = 0; index < ours.length; index += 1) {
        const oursCell = ours[index];
        const refCell = parsed.cells[index];
        if (oursCell.dlaDeg === null || refCell.dlaDeg === null || oursCell.vInfDepMag < MIN_VALID_VINF_KMPS || refCell.vInfDepMag < MIN_VALID_VINF_KMPS) {
            skippedLowVInf.push({ index, depDate: oursCell.depDate, tofDays: oursCell.tofDays });
            continue;
        }

        const deltaDeg = oursCell.dlaDeg - refCell.dlaDeg;
        deltas.push(deltaDeg);
        if (maxCell === null || Math.abs(deltaDeg) > Math.abs(maxCell.deltaDeg)) {
            maxCell = {
                index,
                depDate: oursCell.depDate,
                tofDays: oursCell.tofDays,
                oursDlaDeg: oursCell.dlaDeg,
                poliastroDlaDeg: refCell.dlaDeg,
                deltaDeg,
                oursVInfDepMag: oursCell.vInfDepMag,
                poliastroVInfDepMag: refCell.vInfDepMag,
            };
        }
    }

    const summary = summarize(deltas);
    const output = {
        schemaVersion: 1,
        generatedAt: isoNow(),
        harness: {
            entryPoint: 'tools/slice11-research/measurements/poliastro-validation.mjs pattern reused with tools/slice12-research/dla-oracle-grid.py',
            poliastroPython,
            body: { designation: body.designation, name: body.name ?? body.designation },
            gridSize: { departure: GRID_DEPARTURE_COUNT, tof: GRID_TOF_COUNT },
            window: {
                departureStartUtc: DEPARTURE_START_UTC,
                departureEndUtc: DEPARTURE_END_UTC,
                tofMinDays: TOF_MIN_DAYS,
                tofMaxDays: TOF_MAX_DAYS,
            },
        },
        bar: {
            maxAbsDlaDeg: DLA_BAR_DEG,
            minVInfKmps: MIN_VALID_VINF_KMPS,
            pass: summary.maxAbsDeg !== null && summary.maxAbsDeg <= DLA_BAR_DEG,
            justification:
                'Same states, same ICRF frame, and closed-form DLA algebra on solver vectors; 1e-6 deg absorbs solver representation differences.',
        },
        summary: {
            comparedCells: deltas.length,
            skippedLowVInfCells: skippedLowVInf.length,
            branchMismatchCells: branchMismatches.length,
            maxAbsDeltaDeg: summary.maxAbsDeg,
            rmsDeltaDeg: summary.rmsDeg,
            maxCell,
        },
        branchMismatches,
        skippedLowVInf,
    };

    writeJsonAtomic(DATA_PATH, DATA_NEW_PATH, output);
    console.log(`DLA oracle bar: max |delta| <= ${DLA_BAR_DEG} deg for |vInf| >= ${MIN_VALID_VINF_KMPS} km/s`);
    console.log(`compared=${deltas.length} skippedLowVInf=${skippedLowVInf.length} branchMismatches=${branchMismatches.length}`);
    console.log(`maxAbsDeltaDeg=${summary.maxAbsDeg} rmsDeltaDeg=${summary.rmsDeg}`);
    console.log(`wrote ${DATA_PATH}`);

    if (!output.bar.pass) {
        process.exitCode = 2;
    }
}

await main();
