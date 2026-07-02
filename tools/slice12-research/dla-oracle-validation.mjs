#!/usr/bin/env node

// DLA oracle validation vs poliastro.
//
// Default phase (Slice 12 Phase E extension, audit finding M-C): M=1 vInfDep
// VECTOR-DIRECTION validation against poliastro izzo multi-rev, both branches,
// branch correspondence established per-cell by minimum vector distance (never
// by assumed ordering). Writes data/dla-oracle-m1-vectors.json.
//
// Legacy phase (Phase A, OQ-12-3): M=0 same-state |dDLA| comparison. Run with
// `--m0`. The Phase A `branchMismatchCells` counter was DEAD CODE (declared,
// never incremented — single-branch solves on both sides have nothing to
// mismatch) and has been removed from the M=0 output; honest per-branch
// matching statistics live in the M=1 output instead.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice12-dla-validation');
const DATA_M0_PATH = path.join(repoRoot, 'tools', 'slice12-research', 'data', 'dla-oracle-validation.json');
const DATA_M0_NEW_PATH = `${DATA_M0_PATH}.new`;
const DATA_M1_PATH = path.join(repoRoot, 'tools', 'slice12-research', 'data', 'dla-oracle-m1-vectors.json');
const DATA_M1_NEW_PATH = `${DATA_M1_PATH}.new`;
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
const ANG_SEP_BAR_DEG = 1e-6;
const MIN_VALID_VINF_KMPS = 0.1;
// Apophis is the standard grid body; Bennu added because it is cheap (same grid,
// same spawn) and was a Slice 11 validation body.
const M1_BODY_DESIGNATIONS = ['99942', '101955'];

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

function dot3(left, right) {
    return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function cross3(left, right) {
    return [
        left[1] * right[2] - left[2] * right[1],
        left[2] * right[0] - left[0] * right[2],
        left[0] * right[1] - left[1] * right[0],
    ];
}

// atan2(|a x b|, a . b): numerically stable for near-zero separations. The naive
// acos(dot/(|a||b|)) formulation has a double-precision floor of sqrt(2*eps)
// ~ 1.2e-6 deg near theta=0 — the first M=1 run FAILED on exactly that floor
// (reported 1.9e-6 deg "separation" while componentwise deltas were 1.5e-14
// relative, physically bounding the true angle at ~8.5e-13 deg).
function angularSeparationDeg(left, right) {
    if (magnitude3(left) === 0 || magnitude3(right) === 0) {
        return null;
    }
    return Math.atan2(magnitude3(cross3(left, right)), dot3(left, right)) * (180 / Math.PI);
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
            path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'lambert-multi-rev.ts'),
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

function runPoliastro(poliastroPython, payload) {
    const pyResult = spawnSync(poliastroPython, [POLIASTRO_SCRIPT], {
        cwd: repoRoot,
        input: JSON.stringify(payload),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    if (pyResult.status !== 0) {
        throw new Error(pyResult.stderr || pyResult.stdout || 'dla-oracle-grid.py failed');
    }
    const parsed = JSON.parse(pyResult.stdout);
    if (!parsed.ok) {
        throw new Error(`dla-oracle-grid.py reported failure: ${parsed.error} (${parsed.depDate ?? ''}, ${parsed.tofDays ?? ''})`);
    }
    return parsed;
}

async function loadEnvironment() {
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
        byDesignation,
        earthSeries,
        departureDates,
        tofDaysGrid,
        interpolateBodyStateSeries,
        propagateKeplerianStateVectors,
    };
}

// ---------------------------------------------------------------------------
// Legacy Phase A: M=0 same-state |dDLA| comparison (run with --m0).
// ---------------------------------------------------------------------------
async function runM0Validation(env, poliastroPython) {
    const { lambert } = await importJs('core/lambert/izzo.js');
    const { dlaDegFromVInf } = await importJs('core/lambert/dla.js');

    const body = env.byDesignation.get('99942');
    if (!body) {
        throw new Error('Missing reference body 99942 (Apophis)');
    }

    const cells = [];
    const ours = [];

    for (const { depDate, departureTdbSeconds } of env.departureDates) {
        const earthState = env.interpolateBodyStateSeries('earth', env.earthSeries, departureTdbSeconds);
        const earthPositionKm = kmVectorFromMeters(earthState.positionM);
        const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

        for (const tofDays of env.tofDaysGrid) {
            const tofSeconds = tofDays * SECONDS_PER_DAY;
            const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
            const asteroidState = env.propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);
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

    const parsed = runPoliastro(poliastroPython, { muSunKm3S2: MU_SUN, mode: 'm0', cells });
    if (parsed.cells.length !== ours.length) {
        throw new Error(`Cell count mismatch: ours=${ours.length}, poliastro=${parsed.cells.length}`);
    }

    const deltas = [];
    const skippedLowVInf = [];
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
        schemaVersion: 2,
        generatedAt: isoNow(),
        harness: {
            entryPoint: 'tools/slice12-research/dla-oracle-validation.mjs --m0 (Phase A legacy phase)',
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
            maxAbsDeltaDeg: summary.maxAbsDeg,
            rmsDeltaDeg: summary.rmsDeg,
            maxCell,
        },
        // schemaVersion 2: the Phase A `branchMismatchCells` counter was removed —
        // it was dead code (never incremented; M=0 single-branch solves on both
        // sides have no branch selection to mismatch). Audit finding M-C; see the
        // OQ-12-3 closure correction and dla-oracle-m1-vectors.json for honest
        // per-branch matching statistics.
        skippedLowVInf,
    };

    writeJsonAtomic(DATA_M0_PATH, DATA_M0_NEW_PATH, output);
    console.log(`[m0] DLA oracle bar: max |delta| <= ${DLA_BAR_DEG} deg for |vInf| >= ${MIN_VALID_VINF_KMPS} km/s`);
    console.log(`[m0] compared=${deltas.length} skippedLowVInf=${skippedLowVInf.length}`);
    console.log(`[m0] maxAbsDeltaDeg=${summary.maxAbsDeg} rmsDeltaDeg=${summary.rmsDeg}`);
    console.log(`[m0] wrote ${DATA_M0_PATH}`);

    if (!output.bar.pass) {
        process.exitCode = 2;
    }
}

// ---------------------------------------------------------------------------
// Phase E extension: M=1 vInfDep vector-direction validation (default phase).
// ---------------------------------------------------------------------------
async function runM1VectorValidation(env, poliastroPython) {
    const { lambertMultiRev } = await importJs('core/lambert/lambert-multi-rev.js');
    const { dlaDegFromVInf } = await importJs('core/lambert/dla.js');

    const bodies = [];
    const skippedBodies = [];
    for (const designation of M1_BODY_DESIGNATIONS) {
        const body = env.byDesignation.get(designation);
        if (body) {
            bodies.push(body);
        } else {
            skippedBodies.push(designation);
        }
    }
    if (bodies.length === 0) {
        throw new Error(`None of the M=1 bodies found in catalog: ${M1_BODY_DESIGNATIONS.join(', ')}`);
    }

    const pyCells = [];
    const oursByIndex = [];

    for (const body of bodies) {
        for (const { depDate, departureTdbSeconds } of env.departureDates) {
            const earthState = env.interpolateBodyStateSeries('earth', env.earthSeries, departureTdbSeconds);
            const earthPositionKm = kmVectorFromMeters(earthState.positionM);
            const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

            for (const tofDays of env.tofDaysGrid) {
                const tofSeconds = tofDays * SECONDS_PER_DAY;
                const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
                const asteroidState = env.propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);
                const asteroidPositionKm = kmVectorFromMeters(asteroidState.positionM);

                // Production path replica: grid-compute.ts calls
                // lambertMultiRev(r1, r2, tofSeconds, mu, M, /* prograde */ true) and
                // selects the min-C3 converged branch (resolveSelectedBranch).
                const result = lambertMultiRev(earthPositionKm, asteroidPositionKm, tofSeconds, MU_SUN, 1, true);
                let ourSelected = null;
                if (result !== null) {
                    let bestC3 = Number.POSITIVE_INFINITY;
                    for (const branch of result.branches) {
                        if (!branch.converged) {
                            continue;
                        }
                        const vInfDep = subtract3(branch.v1, earthVelocityKmps);
                        const c3 = dot3(vInfDep, vInfDep);
                        if (c3 < bestC3) {
                            bestC3 = c3;
                            ourSelected = {
                                branchLabel: branch.branch,
                                vInfDep,
                                vInfDepMag: magnitude3(vInfDep),
                                dlaDeg: dlaDegFromVInf(vInfDep[0], vInfDep[1], vInfDep[2], MIN_VALID_VINF_KMPS),
                            };
                        }
                    }
                }

                oursByIndex.push({
                    body: body.designation,
                    depDate,
                    tofDays,
                    solverReturnedNull: result === null,
                    hasConvergedBranch: ourSelected !== null,
                    selected: ourSelected,
                });
                pyCells.push({
                    body: body.designation,
                    depDate,
                    tofDays,
                    earthPositionKm,
                    asteroidPositionKm,
                    earthVelocityKmps,
                });
            }
        }
    }

    const parsed = runPoliastro(poliastroPython, { muSunKm3S2: MU_SUN, mode: 'm1', cells: pyCells });
    if (parsed.cells.length !== oursByIndex.length) {
        throw new Error(`Cell count mismatch: ours=${oursByIndex.length}, poliastro=${parsed.cells.length}`);
    }

    const angSeps = [];
    const dDlas = [];
    const marginRatios = [];
    const ambiguousCells = [];
    const oursOnlyCells = [];
    const skippedLowVInf = [];
    let pyOnlyCount = 0;
    let bothUnsolvedCount = 0;
    let pyBothBranchesSolvedCount = 0;
    let pyOneBranchSolvedCount = 0;
    let maxCompRelErr = 0;
    let maxAngCell = null;
    let maxDDlaCell = null;
    let minMarginCell = null;
    const matchedBranchPairCounts = {};

    for (let index = 0; index < oursByIndex.length; index += 1) {
        const oursCell = oursByIndex[index];
        const refCell = parsed.cells[index];
        const solvedBranches = refCell.branches.filter((branch) => branch.solved);

        if (solvedBranches.length === 2) {
            pyBothBranchesSolvedCount += 1;
        } else if (solvedBranches.length === 1) {
            pyOneBranchSolvedCount += 1;
        }

        if (!oursCell.hasConvergedBranch && solvedBranches.length === 0) {
            bothUnsolvedCount += 1;
            continue;
        }
        if (!oursCell.hasConvergedBranch && solvedBranches.length > 0) {
            pyOnlyCount += 1;
            continue;
        }
        if (oursCell.hasConvergedBranch && solvedBranches.length === 0) {
            oursOnlyCells.push({ index, body: oursCell.body, depDate: oursCell.depDate, tofDays: oursCell.tofDays });
            continue;
        }

        const ours = oursCell.selected;
        if (ours.vInfDepMag < MIN_VALID_VINF_KMPS || ours.dlaDeg === null) {
            skippedLowVInf.push({ index, body: oursCell.body, depDate: oursCell.depDate, tofDays: oursCell.tofDays });
            continue;
        }

        // Branch correspondence by measurement: minimum vector distance to ours.
        let matched = null;
        let matchedDistance = Number.POSITIVE_INFINITY;
        for (const branch of solvedBranches) {
            const distance = magnitude3(subtract3(ours.vInfDep, branch.vInfDep));
            if (distance < matchedDistance) {
                matchedDistance = distance;
                matched = branch;
            }
        }

        if (solvedBranches.length === 2) {
            const interBranchDistance = magnitude3(subtract3(solvedBranches[0].vInfDep, solvedBranches[1].vInfDep));
            if (matchedDistance >= interBranchDistance) {
                // Tripwire (a): the two poliastro branches are closer to each other
                // than the matched branch is to ours — correspondence ambiguous.
                ambiguousCells.push({
                    index,
                    body: oursCell.body,
                    depDate: oursCell.depDate,
                    tofDays: oursCell.tofDays,
                    matchedDistance,
                    interBranchDistance,
                });
                continue;
            }
            const marginRatio = interBranchDistance / Math.max(matchedDistance, Number.MIN_VALUE);
            marginRatios.push(marginRatio);
            if (minMarginCell === null || marginRatio < minMarginCell.marginRatio) {
                minMarginCell = {
                    index,
                    body: oursCell.body,
                    depDate: oursCell.depDate,
                    tofDays: oursCell.tofDays,
                    marginRatio,
                    matchedDistance,
                    interBranchDistance,
                };
            }
        }

        const pairKey = `${ours.branchLabel}->${matched.lowpath ? 'lowpath' : 'highpath'}`;
        matchedBranchPairCounts[pairKey] = (matchedBranchPairCounts[pairKey] ?? 0) + 1;

        const angSepDeg = angularSeparationDeg(ours.vInfDep, matched.vInfDep);
        angSeps.push(angSepDeg);
        if (maxAngCell === null || angSepDeg > maxAngCell.angSepDeg) {
            maxAngCell = {
                index,
                body: oursCell.body,
                depDate: oursCell.depDate,
                tofDays: oursCell.tofDays,
                ourBranch: ours.branchLabel,
                matchedLowpath: matched.lowpath,
                angSepDeg,
                oursVInfDep: ours.vInfDep,
                poliastroVInfDep: matched.vInfDep,
            };
        }

        const delta = subtract3(ours.vInfDep, matched.vInfDep);
        const compRelErr = Math.max(Math.abs(delta[0]), Math.abs(delta[1]), Math.abs(delta[2])) / ours.vInfDepMag;
        if (compRelErr > maxCompRelErr) {
            maxCompRelErr = compRelErr;
        }

        if (matched.dlaDeg !== null) {
            const dDla = ours.dlaDeg - matched.dlaDeg;
            dDlas.push(dDla);
            if (maxDDlaCell === null || Math.abs(dDla) > Math.abs(maxDDlaCell.deltaDeg)) {
                maxDDlaCell = {
                    index,
                    body: oursCell.body,
                    depDate: oursCell.depDate,
                    tofDays: oursCell.tofDays,
                    oursDlaDeg: ours.dlaDeg,
                    poliastroDlaDeg: matched.dlaDeg,
                    deltaDeg: dDla,
                };
            }
        }
    }

    const angSummary = summarize(angSeps);
    const dDlaSummary = summarize(dDlas);
    const oursSolvedCount = oursByIndex.filter((cell) => cell.hasConvergedBranch).length;
    const minMarginRatio = marginRatios.length === 0 ? null : Math.min(...marginRatios);
    const pass =
        ambiguousCells.length === 0 &&
        oursOnlyCells.length === 0 &&
        angSummary.maxAbsDeg !== null &&
        angSummary.maxAbsDeg <= ANG_SEP_BAR_DEG &&
        dDlaSummary.maxAbsDeg !== null &&
        dDlaSummary.maxAbsDeg <= DLA_BAR_DEG;

    const output = {
        schemaVersion: 1,
        generatedAt: isoNow(),
        harness: {
            entryPoint: 'tools/slice12-research/dla-oracle-validation.mjs (default M=1 vector phase) with tools/slice12-research/dla-oracle-grid.py mode=m1',
            poliastroPython,
            bodies: bodies.map((body) => ({ designation: body.designation, name: body.name ?? body.designation })),
            skippedBodies,
            gridSizePerBody: { departure: GRID_DEPARTURE_COUNT, tof: GRID_TOF_COUNT },
            window: {
                departureStartUtc: DEPARTURE_START_UTC,
                departureEndUtc: DEPARTURE_END_UTC,
                tofMinDays: TOF_MIN_DAYS,
                tofMaxDays: TOF_MAX_DAYS,
            },
            productionPathReplica:
                'lambertMultiRev(r1, r2, tof, mu, M=1, prograde=true) + min-C3 converged branch selection, exactly as src/v2/porkchop/grid-compute.ts ships it',
        },
        bar: {
            angularSeparationDeg: ANG_SEP_BAR_DEG,
            maxAbsDlaDeg: DLA_BAR_DEG,
            minVInfKmps: MIN_VALID_VINF_KMPS,
            pass,
            justification:
                'Same states, same algorithm family (izzo multi-rev on both sides), closed-form postprocessing; the generous 1e-6 deg bar absorbs series-convergence differences (Slice 11 magnitude agreement was 3.6e-12 relative). Branch correspondence is established per-cell by minimum vector distance with a reported discrimination margin, never by assumed ordering. This closes the INV-021 gap: DLA is the first consumer of vInfDep COMPONENTS, and Slice 11 validated M=1 magnitudes only.',
        },
        summary: {
            totalCells: oursByIndex.length,
            oursM1SelectedCells: oursSolvedCount,
            comparedMatchedCells: angSeps.length,
            bothUnsolvedCells: bothUnsolvedCount,
            poliastroOnlySolvedCells: pyOnlyCount,
            oursOnlySolvedCells: oursOnlyCells.length,
            skippedLowVInfCells: skippedLowVInf.length,
            poliastroBothBranchesSolvedCells: pyBothBranchesSolvedCount,
            poliastroOneBranchSolvedCells: pyOneBranchSolvedCount,
            ambiguousBranchCells: ambiguousCells.length,
            maxAngularSeparationDeg: angSummary.maxAbsDeg,
            rmsAngularSeparationDeg: angSummary.rmsDeg,
            maxComponentRelErr: maxCompRelErr,
            maxAbsDeltaDlaDeg: dDlaSummary.maxAbsDeg,
            rmsDeltaDlaDeg: dDlaSummary.rmsDeg,
            minBranchDiscriminationMarginRatio: minMarginRatio,
            matchedBranchPairCounts,
            maxAngularSeparationCell: maxAngCell,
            maxDeltaDlaCell: maxDDlaCell,
            minMarginCell,
        },
        ambiguousCells,
        oursOnlyCells,
        skippedLowVInf,
        deadCounterNote:
            'The Phase A output field `branchMismatchCells` was dead code (declared, never incremented) and was removed in schemaVersion 2 of dla-oracle-validation.json; this file carries the honest per-branch matching statistics that counter pretended to be. Audit report M-C.',
        metricNote:
            'Angular separation uses atan2(|a x b|, a . b). The first run of this harness used acos(dot/(|a||b|)), whose double-precision floor (~1.2e-6 deg near zero) sat at the 1e-6 bar and produced a false FAIL (reported max 1.909e-6 deg while componentwise deltas of 1.49e-14 relative bound the true angle at ~8.5e-13 deg, and |dDLA| max was 5.6e-13 deg). The metric was corrected; the bar was NOT changed.',
    };

    writeJsonAtomic(DATA_M1_PATH, DATA_M1_NEW_PATH, output);
    console.log(`[m1] bars: angSep <= ${ANG_SEP_BAR_DEG} deg, |dDLA| <= ${DLA_BAR_DEG} deg, matched branches unambiguous`);
    console.log(`[m1] totalCells=${output.summary.totalCells} oursM1Selected=${oursSolvedCount} comparedMatched=${angSeps.length} bothUnsolved=${bothUnsolvedCount} pyOnly=${pyOnlyCount} oursOnly=${oursOnlyCells.length} ambiguous=${ambiguousCells.length}`);
    console.log(`[m1] maxAngSepDeg=${angSummary.maxAbsDeg} rmsAngSepDeg=${angSummary.rmsDeg} maxCompRelErr=${maxCompRelErr}`);
    console.log(`[m1] maxAbsDeltaDlaDeg=${dDlaSummary.maxAbsDeg} rmsDeltaDlaDeg=${dDlaSummary.rmsDeg}`);
    console.log(`[m1] minBranchDiscriminationMarginRatio=${minMarginRatio}`);
    console.log(`[m1] matchedBranchPairs=${JSON.stringify(matchedBranchPairCounts)}`);
    console.log(`[m1] ${pass ? 'PASS' : 'FAIL'}; wrote ${DATA_M1_PATH}`);

    if (ambiguousCells.length > 0) {
        process.exitCode = 3;
    } else if (!pass) {
        process.exitCode = 2;
    }
}

async function main() {
    compileRuntimeModules();
    const poliastroPython = resolvePython();
    const env = await loadEnvironment();

    if (process.argv.includes('--m0')) {
        await runM0Validation(env, poliastroPython);
        return;
    }
    await runM1VectorValidation(env, poliastroPython);
}

await main();
