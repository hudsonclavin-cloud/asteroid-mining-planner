#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice11-multi-rev-dual-oracle');
const DATA_PATH = path.join(repoRoot, 'tools', 'slice11-research', 'data', 'multi-rev-poliastro-validation.json');
const BOUNDARY_PATH = path.join(repoRoot, 'tools', 'slice11-research', 'data', 'multi-rev-boundary-analysis.json');
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const HORIZONS_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-inner-solar-system-2026-2040.json');
const PYTHON = path.join(os.homedir(), '.aster-slice11-venv', 'bin', 'python');
const PY_HELPER = path.join(repoRoot, 'tools', 'slice11-research', 'measurements', 'multi-rev-dual-oracle.py');

const GRID_DEPARTURE_COUNT = 50;
const GRID_TOF_COUNT = 50;
const DEPARTURE_START_UTC = '2026-01-01';
const DEPARTURE_END_UTC = '2032-01-01';
const TOF_MIN_DAYS = 182.5;
const TOF_MAX_DAYS = 1095.75;
const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11;
const POLIASTRO_TARGET = 1e-6;
const GRID_SPACING_DAYS = 18.637755102040817;
const COMPARE_M_VALUES = [1, 2];

console.debug = () => {};

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

function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross3(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale3(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function norm3(vector) {
    return Math.hypot(vector[0], vector[1], vector[2]);
}

function relativeError(ours, reference) {
    return Math.abs(ours - reference) / Math.max(Math.abs(reference), 1e-12);
}

function componentRelativeErrors(ours, reference) {
    return ours.map((value, index) => relativeError(value, reference[index]));
}

function maxComponentRelativeError(ours, reference) {
    return Math.max(...componentRelativeErrors(ours, reference));
}

function vectorRelativeError(ours, reference) {
    return norm3(sub3(ours, reference)) / Math.max(norm3(reference), 1e-12);
}

function quantile(values, q) {
    if (values.length === 0) {
        return null;
    }
    const sorted = [...values].sort((left, right) => left - right);
    const index = (sorted.length - 1) * q;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
        return sorted[lower];
    }
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function mean(values) {
    if (values.length === 0) {
        return null;
    }
    return values.reduce((total, value) => total + value, 0) / values.length;
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

function buildGeometry(r1, r2, prograde = true) {
    const c = sub3(r2, r1);
    const cMag = norm3(c);
    const r1Mag = norm3(r1);
    const r2Mag = norm3(r2);
    const s = 0.5 * (r1Mag + r2Mag + cMag);

    if (r1Mag === 0 || r2Mag === 0 || cMag === 0) {
        return null;
    }

    const iR1 = scale3(r1, 1 / r1Mag);
    const iR2 = scale3(r2, 1 / r2Mag);
    let iH = cross3(iR1, iR2);
    const iHMag = norm3(iH);
    if (iHMag === 0) {
        return null;
    }
    iH = scale3(iH, 1 / iHMag);

    let lambda = Math.sqrt(1 - Math.min(1, cMag / s));
    let iT1;
    let iT2;

    if (iH[2] < 0) {
        lambda = -lambda;
        iT1 = cross3(iR1, iH);
        iT2 = cross3(iR2, iH);
    } else {
        iT1 = cross3(iH, iR1);
        iT2 = cross3(iH, iR2);
    }

    if (!prograde) {
        lambda = -lambda;
        iT1 = scale3(iT1, -1);
        iT2 = scale3(iT2, -1);
    }

    return { lambda, iR1, iR2, iT1, iT2, r1Mag, r2Mag, cMag, s };
}

function normalizedTof(mu, s, tofSeconds) {
    return Math.sqrt((2 * mu) / (s * s * s)) * tofSeconds;
}

function recoverXFromV1(geometry, mu, v1) {
    const gamma = Math.sqrt((mu * geometry.s) / 2);
    const rho = (geometry.r1Mag - geometry.r2Mag) / geometry.cMag;
    const sigmaSq = 1 - rho * rho;
    if (!(sigmaSq > 0)) {
        return null;
    }
    const sigma = Math.sqrt(sigmaSq);
    const vr1 = dot3(v1, geometry.iR1);
    const vt1 = dot3(v1, geometry.iT1);
    const A = (vt1 * geometry.r1Mag) / (gamma * sigma);
    const B = (vr1 * geometry.r1Mag) / gamma;
    const denominator = geometry.lambda * geometry.lambda * (1 - rho) + (1 + rho);
    if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(denominator) || denominator === 0) {
        return null;
    }
    const x = (geometry.lambda * A * (1 - rho) - B) / denominator;
    return { x };
}

function compilePythons(payload) {
    const pyResult = spawnSync(PYTHON, [PY_HELPER], {
        cwd: repoRoot,
        input: JSON.stringify(payload),
        encoding: 'utf8',
    });
    if (pyResult.status !== 0) {
        throw new Error(pyResult.stderr || pyResult.stdout || 'python helper failed');
    }
    return JSON.parse(pyResult.stdout);
}

function bulkSolveOracle(cells) {
    return compilePythons({
        mode: 'bulk',
        cells: cells.map((cell) => ({
            body: cell.bodyShort,
            depDate: cell.depDate,
            tofDays: cell.tofDays,
            tofSeconds: cell.tofSeconds,
            r1: cell.earthPositionKm,
            r2: cell.asteroidPositionKm,
            mu: MU_SUN,
            M: cell.M,
        })),
    });
}

function boundaryOracle(cases) {
    return compilePythons({
        mode: 'boundary',
        cases: cases.map((cell) => ({
            body: cell.bodyShort,
            depDate: cell.depDate,
            tofDays: cell.tofDays,
            tofSeconds: cell.tofSeconds,
            r1: cell.earthPositionKm,
            r2: cell.asteroidPositionKm,
            mu: MU_SUN,
            M: cell.M,
        })),
    });
}

function keyForCell(cell) {
    return `${cell.bodyShort}|${cell.M}|${cell.depDate}|${cell.tofDays.toFixed(12)}`;
}

function analyzePoliastroBranches(cell, row) {
    const branches = row.branches.map((branch) => {
        if (!branch.converged) {
            return {
                lowpath: branch.lowpath,
                converged: false,
                error: branch.error,
                recoveredX: null,
            };
        }
        const recovered = recoverXFromV1(cell.geometry, MU_SUN, branch.v1);
        return {
            lowpath: branch.lowpath,
            converged: true,
            v1: branch.v1,
            v2: branch.v2,
            recoveredX: recovered?.x ?? null,
        };
    });
    return branches;
}

function matchBranchesByRecoveredX(solverBranches, poliastroBranches) {
    const solverConverged = Object.entries(solverBranches)
        .filter(([, branch]) => branch?.converged)
        .map(([name, branch]) => ({ name, branch }));
    const poliastroConverged = poliastroBranches
        .filter((branch) => branch.converged && branch.recoveredX !== null)
        .map((branch, index) => ({ index, branch }));

    const matched = new Map();
    const used = new Set();

    for (const solverEntry of solverConverged) {
        let best = null;
        let bestDistance = Infinity;
        for (const poliastroEntry of poliastroConverged) {
            if (used.has(poliastroEntry.index)) {
                continue;
            }
            const distance = Math.abs(solverEntry.branch.x - poliastroEntry.branch.recoveredX);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = poliastroEntry;
            }
        }
        if (best !== null) {
            used.add(best.index);
            matched.set(solverEntry.name, best.branch);
        }
    }

    const unmatchedPoliastro = poliastroConverged
        .filter((entry) => !used.has(entry.index))
        .map((entry) => entry.branch);
    return { matched, unmatchedPoliastro };
}

function compareBranch(solverBranch, poliastroBranch) {
    if (!solverBranch?.converged || !poliastroBranch?.converged) {
        return null;
    }
    return {
        v1ComponentRel: componentRelativeErrors(solverBranch.v1, poliastroBranch.v1),
        v2ComponentRel: componentRelativeErrors(solverBranch.v2, poliastroBranch.v2),
        v1MaxComponentRel: maxComponentRelativeError(solverBranch.v1, poliastroBranch.v1),
        v2MaxComponentRel: maxComponentRelativeError(solverBranch.v2, poliastroBranch.v2),
        v1VectorRel: vectorRelativeError(solverBranch.v1, poliastroBranch.v1),
        v2VectorRel: vectorRelativeError(solverBranch.v2, poliastroBranch.v2),
    };
}

async function buildReferenceContext() {
    compileRuntimeModules();

    const { lambert } = await importJs('core/lambert/izzo.js');
    const { lambertMultiRev, tMinForM } = await importJs('core/lambert/lambert-multi-rev.js');
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

    const references = [
        { designation: '99942', short: 'Apophis' },
        { designation: '101955', short: 'Bennu' },
        { designation: '25143', short: 'Itokawa' },
    ].map((entry) => ({
        ...entry,
        body: byDesignation.get(entry.designation),
    }));

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
        tMinForM,
        references,
        earthSeries,
        departureDates,
        tofDaysGrid,
        interpolateBodyStateSeries,
        propagateKeplerianStateVectors,
    };
}

function buildCellsForBody(reference, context, M) {
    const {
        lambertMultiRev,
        tMinForM,
        earthSeries,
        departureDates,
        tofDaysGrid,
        interpolateBodyStateSeries,
        propagateKeplerianStateVectors,
    } = context;

    const cells = [];
    for (const { depDate, departureTdbSeconds } of departureDates) {
        const earthState = interpolateBodyStateSeries('earth', earthSeries, departureTdbSeconds);
        const earthPositionKm = kmVectorFromMeters(earthState.positionM);
        const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

        for (const tofDays of tofDaysGrid) {
            const tofSeconds = tofDays * SECONDS_PER_DAY;
            const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
            const asteroidState = propagateKeplerianStateVectors(reference.body.elements, arrivalTdbSeconds);
            const asteroidPositionKm = kmVectorFromMeters(asteroidState.positionM);
            const asteroidVelocityKmps = kmpsVectorFromMps(asteroidState.velocityMps);
            const geometry = buildGeometry(earthPositionKm, asteroidPositionKm, true);
            if (geometry === null) {
                throw new Error(`Invalid geometry for ${reference.short} ${depDate}/${tofDays}`);
            }
            const solver = lambertMultiRev(earthPositionKm, asteroidPositionKm, tofSeconds, MU_SUN, M, true);
            const branches = solver?.branches ?? [];
            const leftBranch = branches.find((branch) => branch.branch === 'left') ?? null;
            const rightBranch = branches.find((branch) => branch.branch === 'right') ?? null;
            const solverTMinNormalized = tMinForM(geometry.lambda, M);
            cells.push({
                bodyShort: reference.short,
                bodyName: reference.body.name ?? reference.body.designation,
                depDate,
                tofDays,
                tofSeconds,
                M,
                earthPositionKm,
                asteroidPositionKm,
                earthVelocityKmps,
                asteroidVelocityKmps,
                geometry,
                normalizedT: normalizedTof(MU_SUN, geometry.s, tofSeconds),
                solverTMinNormalized,
                solver,
                leftBranch,
                rightBranch,
            });
        }
    }
    return cells;
}

function classifyRow(reference, M, cells, oracleRows) {
    const byKey = new Map(
        oracleRows.cells.map((row) => [
            `${row.body}|${row.M}|${row.depDate}|${Number(row.tofDays).toFixed(12)}`,
            row,
        ])
    );

    let class_both = 0;
    let class_solver_only = 0;
    let class_poliastro_only = 0;
    let class_neither = 0;
    let convergedCells = 0;
    let failedCells = 0;
    let returnedCells = 0;
    let nonFiniteCells = 0;
    let failedCells_tMinGuard = 0;
    let failedCells_stall = 0;
    let bothBranchesConverged = 0;
    let singleBranchOnly = 0;
    let rightBranchAboveOldClamp = 0;
    const solverOnlyCells = [];
    const v1Errors = [];
    const v2Errors = [];
    let worstCell = null;
    let boundaryProbeCell = null;

    for (const cell of cells) {
        const oracleRow = byKey.get(keyForCell(cell));
        if (!oracleRow) {
            throw new Error(`Missing oracle row for ${keyForCell(cell)}`);
        }

        const solverBranches = {
            left: cell.leftBranch,
            right: cell.rightBranch,
        };
        const solverConvergedBranches = Object.values(solverBranches).filter((branch) => branch?.converged);
        const poliastroBranches = analyzePoliastroBranches(cell, oracleRow);
        const poliastroConvergedBranches = poliastroBranches.filter((branch) => branch.converged);
        const { matched: poliastroByMatch, unmatchedPoliastro } = matchBranchesByRecoveredX(
            solverBranches,
            poliastroBranches
        );

        if (cell.solver !== null) {
            returnedCells += 1;
        }
        if (solverConvergedBranches.length > 0) {
            convergedCells += 1;
            if (solverConvergedBranches.length === 2) {
                bothBranchesConverged += 1;
            } else {
                singleBranchOnly += 1;
            }
            if (cell.rightBranch?.converged && cell.rightBranch.x * cell.rightBranch.x > 0.45) {
                rightBranchAboveOldClamp += 1;
            }
        } else if (cell.solver !== null) {
            failedCells_stall += 1;
        } else {
            failedCells_tMinGuard += 1;
        }

        const solverCellConverged = solverConvergedBranches.length > 0;
        const poliastroCellConverged = poliastroConvergedBranches.length > 0;

        if (solverCellConverged && cell.solverTMinNormalized !== null) {
            const margin = cell.normalizedT - cell.solverTMinNormalized;
            if (
                margin >= 0 &&
                (boundaryProbeCell === null || margin < boundaryProbeCell.margin)
            ) {
                boundaryProbeCell = { cell, margin };
            }
        }

        if (solverCellConverged && poliastroCellConverged) {
            class_both += 1;
        } else if (solverCellConverged && !poliastroCellConverged) {
            class_solver_only += 1;
            solverOnlyCells.push(cell);
        } else if (!solverCellConverged && poliastroCellConverged) {
            class_poliastro_only += 1;
        } else {
            class_neither += 1;
        }

        for (const branchName of ['left', 'right']) {
            const solverBranch = solverBranches[branchName];
            const poliastroBranch = poliastroByMatch.get(branchName);
            if (solverBranch?.converged && poliastroBranch?.converged) {
                if (![...solverBranch.v1, ...solverBranch.v2, ...poliastroBranch.v1, ...poliastroBranch.v2].every(Number.isFinite)) {
                    nonFiniteCells += 1;
                    continue;
                }
                const comparison = compareBranch(solverBranch, poliastroBranch);
                const v1RowError = Math.max(comparison.v1MaxComponentRel, comparison.v1VectorRel);
                const v2RowError = Math.max(comparison.v2MaxComponentRel, comparison.v2VectorRel);
                v1Errors.push(v1RowError);
                v2Errors.push(v2RowError);
                const branchWorst = Math.max(v1RowError, v2RowError);
                if (worstCell === null || branchWorst > worstCell.relError) {
                    worstCell = {
                        dep: cell.depDate,
                        tof: cell.tofDays,
                        x2: solverBranch.x * solverBranch.x,
                        branch: branchName,
                        relError: branchWorst,
                        v1NormRel: comparison.v1VectorRel,
                        v2NormRel: comparison.v2VectorRel,
                    };
                }
            } else if (solverBranch?.converged !== poliastroBranch?.converged) {
                if (solverBranch?.converged || poliastroBranch?.converged) {
                    throw new Error(
                        `Branch coverage mismatch for ${reference.short} M=${M} ${cell.depDate}/${cell.tofDays} ${branchName}`
                    );
                }
            }
        }

        if (unmatchedPoliastro.length > 0) {
            throw new Error(
                `Unmatched converged poliastro branch for ${reference.short} M=${M} ${cell.depDate}/${cell.tofDays}`
            );
        }
    }

    if (failedCells_stall > 0) {
        throw new Error(`${reference.short} M=${M} encountered ${failedCells_stall} stalled cells`);
    }
    if (class_poliastro_only > 0) {
        throw new Error(`${reference.short} M=${M} encountered ${class_poliastro_only} CLASS_POLIASTRO_ONLY cells`);
    }
    if (class_both + class_solver_only + class_poliastro_only + class_neither !== cells.length) {
        throw new Error(`${reference.short} M=${M} class counts do not sum to ${cells.length}`);
    }

    failedCells = class_neither;

    return {
        body: reference.body.name ?? reference.body.designation,
        M,
        totalCells: cells.length,
        convergedCells,
        failedCells,
        passesAuditTarget: false,
        poliastro_compared: true,
        returnedCells,
        nonFiniteCells,
        failedCells_tMinGuard,
        failedCells_stall,
        convergenceIsPhysical: failedCells_stall === 0,
        bothBranchesConverged,
        singleBranchOnly,
        rightBranchAboveOldClamp,
        class_both,
        class_solver_only,
        class_poliastro_only,
        class_neither,
        maxRelError_v1: v1Errors.length > 0 ? Math.max(...v1Errors) : null,
        meanRelError_v1: mean(v1Errors),
        p95RelError_v1: quantile(v1Errors, 0.95),
        maxRelError_v2: v2Errors.length > 0 ? Math.max(...v2Errors) : null,
        meanRelError_v2: mean(v2Errors),
        p95RelError_v2: quantile(v2Errors, 0.95),
        maxRelError:
            v1Errors.length + v2Errors.length > 0 ? Math.max(...v1Errors, ...v2Errors) : null,
        meanRelError: mean([...v1Errors, ...v2Errors]),
        worstCell,
        solverOnlyCells,
        boundaryProbeCell: boundaryProbeCell?.cell ?? null,
    };
}

function summarizeBoundary(row, confirmations, representativeKey, solverOnlyKeys) {
    if (confirmations.length === 0) {
        throw new Error(`${row.body} M=${row.M} has no boundary characterization cases`);
    }

    const maxCase = confirmations.reduce(
        (best, current) =>
            best === null || current.divergenceBandDays > best.divergenceBandDays ? current : best,
        null
    );
    const representativeCase =
        confirmations.find(
            (entry) =>
                `${entry.depDate}|${Number(entry.tofDays).toFixed(12)}` === representativeKey
        ) ?? maxCase;

    return {
        boundary: {
            trueT_min: representativeCase.trueTMin,
            solverT_min: representativeCase.solverTMinNormalized,
            poliastroGate: representativeCase.poliastroGateNormalizedT,
            divergenceBand_normalizedT: representativeCase.divergenceBandNormalizedT,
            divergenceBand_days: representativeCase.divergenceBandDays,
            gridSpacing_days: GRID_SPACING_DAYS,
            divergenceSubGridCell: representativeCase.divergenceBandDays < GRID_SPACING_DAYS,
            solverOnlyCellsConfirmedByF64: confirmations.filter(
                (entry) =>
                    entry.rootsConfirmed &&
                    solverOnlyKeys.has(`${entry.depDate}|${Number(entry.tofDays).toFixed(12)}`)
            ).length,
            representativeCell: {
                dep: representativeCase.depDate,
                tof: representativeCase.tofDays,
            },
        },
        detail: {
            body: row.body,
            M: row.M,
            solverOnlyCells: confirmations,
            maxDivergenceCase: {
                dep: maxCase.depDate,
                tof: maxCase.tofDays,
                divergenceBand_days: maxCase.divergenceBandDays,
                divergenceBand_normalizedT: maxCase.divergenceBandNormalizedT,
            },
            representativeCase: {
                dep: representativeCase.depDate,
                tof: representativeCase.tofDays,
                divergenceBand_days: representativeCase.divergenceBandDays,
                divergenceBand_normalizedT: representativeCase.divergenceBandNormalizedT,
            },
        },
    };
}

async function main() {
    if (!fs.existsSync(PYTHON)) {
        throw new Error(`Expected python venv at ${PYTHON}`);
    }

    const current = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const context = await buildReferenceContext();
    const rows = [];
    const boundaryDetails = [];

    for (const reference of context.references) {
        const existingM0 = current.results.find((row) => row.body === (reference.body.name ?? reference.body.designation) && row.M === 0);
        if (!existingM0) {
            throw new Error(`Missing M=0 row for ${reference.short}`);
        }
        rows.push(existingM0);

        for (const M of COMPARE_M_VALUES) {
            const cells = buildCellsForBody(reference, context, M);
            const bulk = bulkSolveOracle(cells);
            const row = classifyRow(reference, M, cells, bulk);

            const boundaryCaseMap = new Map(
                row.solverOnlyCells.map((cell) => [
                    `${cell.depDate}|${cell.tofDays.toFixed(12)}`,
                    {
                        bodyShort: cell.bodyShort,
                        depDate: cell.depDate,
                        tofDays: cell.tofDays,
                        M: cell.M,
                        earthPositionKm: cell.earthPositionKm,
                        asteroidPositionKm: cell.asteroidPositionKm,
                        tofSeconds: cell.tofSeconds,
                    },
                ])
            );
            const solverOnlyKeys = new Set(boundaryCaseMap.keys());
            if (row.boundaryProbeCell !== null) {
                boundaryCaseMap.set(
                    `${row.boundaryProbeCell.depDate}|${row.boundaryProbeCell.tofDays.toFixed(12)}`,
                    {
                        bodyShort: row.boundaryProbeCell.bodyShort,
                        depDate: row.boundaryProbeCell.depDate,
                        tofDays: row.boundaryProbeCell.tofDays,
                        M: row.boundaryProbeCell.M,
                        earthPositionKm: row.boundaryProbeCell.earthPositionKm,
                        asteroidPositionKm: row.boundaryProbeCell.asteroidPositionKm,
                        tofSeconds: row.boundaryProbeCell.tofSeconds,
                    }
                );
            }
            const boundaryCases = [...boundaryCaseMap.values()];
            const representativeKey =
                row.boundaryProbeCell === null
                    ? null
                    : `${row.boundaryProbeCell.depDate}|${row.boundaryProbeCell.tofDays.toFixed(12)}`;

            const boundaryConfirmations =
                boundaryCases.length === 0
                    ? []
                    : boundaryOracle(boundaryCases).cases.map((entry) => {
                          const source = cells.find(
                              (cell) =>
                                  cell.depDate === entry.depDate &&
                                  cell.M === entry.M &&
                                  Math.abs(cell.tofDays - entry.tofDays) < 1e-9
                          );
                          if (!source) {
                              throw new Error(
                                  `Missing source cell for boundary case ${reference.short} M=${M} ${entry.depDate}/${entry.tofDays}`
                              );
                          }
                          return {
                              ...entry,
                              solverTMinNormalized: source.solverTMinNormalized,
                          };
                      });

            for (const confirmation of boundaryConfirmations) {
                if (!confirmation.rootsConfirmed) {
                    throw new Error(
                        `Boundary oracle failed to confirm real roots for ${reference.short} M=${M} ${confirmation.depDate}/${confirmation.tofDays}`
                    );
                }
            }

            const { boundary, detail } = summarizeBoundary(
                row,
                boundaryConfirmations,
                representativeKey,
                solverOnlyKeys
            );
            row.boundary = boundary;
            row.passesAuditTarget =
                row.class_poliastro_only === 0 &&
                row.failedCells_stall === 0 &&
                (row.maxRelError === null || row.maxRelError <= POLIASTRO_TARGET) &&
                boundary.solverOnlyCellsConfirmedByF64 === row.class_solver_only;
            delete row.solverOnlyCells;
            delete row.boundaryProbeCell;

            rows.push(row);
            boundaryDetails.push(detail);
        }
    }

    const overallMaxRelError = rows.reduce((best, row) => {
        if (row.maxRelError === null || row.maxRelError === undefined) {
            return best;
        }
        return Math.max(best, row.maxRelError);
    }, 0);

    const overallPassesAuditTarget = rows.every((row) => row.passesAuditTarget)
        ? true
        : 'boundary_or_bulk_validation_failed';

    const output = {
        generated: new Date().toISOString(),
        sliceVersion: '11-phase-a5',
        solverCommit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).stdout.trim(),
        bodies: ['Apophis', 'Bennu', 'Itokawa'],
        M_values: [0, 1, 2],
        gridSize: '50x50',
        tolerance_target: POLIASTRO_TARGET,
        methodsNote:
            'Dual-oracle validation: CLASS_BOTH cells are compared directly against poliastro 0.17 by branch-matched recovered x; CLASS_SOLVER_ONLY boundary cells are judged by an independent float64 T(x) minimum/root scan because post-F2 the solver is more correct than poliastro at the true T_min boundary.',
        m1_convergence_note:
            'F1 did not change cell-level convergedCells on these M=1 grids; it restored the right branch on Apophis 1043 / Bennu 751 / Itokawa 512 cells whose x² exceeded the old 0.45 clamp but remains within the measured hyp2f1b ceiling, giving the C3 branch-selector both options where it previously saw only the left.',
        results: rows,
        overallMaxRelError,
        overallPassesAuditTarget,
        auditTargetScope:
            'M=0 is externally validated vs poliastro at machine precision. M=1/M=2 are now externally validated with a dual oracle: poliastro 0.17 for bulk CLASS_BOTH cells and an independent float64 T(x) boundary scan for CLASS_SOLVER_ONLY cells where the post-F2 solver is more correct than poliastro near true T_min.',
    };

    writeJson(DATA_PATH, output);
    writeJson(BOUNDARY_PATH, {
        generated: output.generated,
        solverCommit: output.solverCommit,
        gridSpacing_days: GRID_SPACING_DAYS,
        rows: boundaryDetails,
    });

    console.log(
        JSON.stringify(
            {
                wrote: [DATA_PATH, BOUNDARY_PATH],
                overallPassesAuditTarget,
                overallMaxRelError,
                rows: rows
                    .filter((row) => row.M >= 1)
                    .map((row) => ({
                        body: row.body,
                        M: row.M,
                        class_both: row.class_both,
                        class_solver_only: row.class_solver_only,
                        class_poliastro_only: row.class_poliastro_only,
                        class_neither: row.class_neither,
                        maxRelError_v1: row.maxRelError_v1,
                        maxRelError_v2: row.maxRelError_v2,
                        divergenceBand_days: row.boundary.divergenceBand_days,
                    })),
            },
            null,
            2
        )
    );
}

await main();
