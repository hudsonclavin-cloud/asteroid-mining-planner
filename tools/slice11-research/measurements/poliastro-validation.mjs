#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice11-m3');
const DATA_PATH = path.join(repoRoot, 'tools', 'slice11-research', 'data', 'poliastro-validation.json');
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const HORIZONS_FIXTURE = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-inner-solar-system-2026-2040.json',
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
const ERROR_THRESHOLD = 0.001;

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

function magnitude3(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function relativeError(ours, reference) {
  return Math.abs(ours - reference) / Math.max(Math.abs(reference), 1e-12);
}

function summarizeErrors(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const rms = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
  const p95Index = Math.min(sorted.length - 1, Math.floor(0.95 * (sorted.length - 1)));
  return {
    maxRel: sorted[sorted.length - 1],
    rmsRel: rms,
    p95Rel: sorted[p95Index],
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
      path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
      path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'slice9-runtime-asteroids.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  if (tscResult.status !== 0) {
    throw new Error(tscResult.stderr || tscResult.stdout || 'TypeScript compile failed');
  }
}

const importJs = async (relPath) => import(pathToFileURL(path.join(TEMP_OUT_DIR, relPath)).href);

async function main() {
  if (!fs.existsSync(POLIASTRO_PYTHON)) {
    throw new Error(`Expected poliastro python at ${POLIASTRO_PYTHON}`);
  }

  compileRuntimeModules();

  const { lambert } = await importJs('core/lambert/izzo.js');
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

  const references = ['99942', '101955', '25143'].map((designation) => {
    const body = byDesignation.get(designation);
    if (!body) {
      throw new Error(`Missing reference body ${designation}`);
    }
    return body;
  });

  const rawHorizons = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
  const horizonsStates = ingestSlice2Fixture(rawHorizons);
  const earthSeries = horizonsStates.earth.map((sample) => sample.state);

  const departureDates = buildLinspace(
    utcStringToTdbSeconds(DEPARTURE_START_UTC),
    utcStringToTdbSeconds(DEPARTURE_END_UTC),
    GRID_DEPARTURE_COUNT,
  ).map((tdbSeconds) => ({
    depDate: new Date(
      (tdbSeconds / SECONDS_PER_DAY + 2451545 - 2440587.5) * SECONDS_PER_DAY * 1000,
    )
      .toISOString()
      .slice(0, 10),
    departureTdbSeconds: tdbSeconds,
  }));
  const tofDaysGrid = buildLinspace(TOF_MIN_DAYS, TOF_MAX_DAYS, GRID_TOF_COUNT);

  const bodyReports = [];
  let maxRelErrorAcrossBodies = 0;

  for (const body of references) {
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
        const asteroidVelocityKmps = kmpsVectorFromMps(asteroidState.velocityMps);

        const result = lambert(MU_SUN, earthPositionKm, asteroidPositionKm, tofSeconds);
        if (!result.ok) {
          throw new Error(`Our Lambert solver failed for ${body.designation} at ${depDate} / ${tofDays}d: ${result.reason}`);
        }

        const vInfDep = subtract3(result.v1, earthVelocityKmps);
        const vInfArr = subtract3(result.v2, asteroidVelocityKmps);
        ours.push({
          depDate,
          tofDays,
          c3: magnitude3(vInfDep) ** 2,
          vInfDep: magnitude3(vInfDep),
          vInfArr: magnitude3(vInfArr),
        });
        cells.push({
          depDate,
          tofDays,
          earthPositionKm,
          asteroidPositionKm,
          earthVelocityKmps,
          asteroidVelocityKmps,
        });
      }
    }

    const pyResult = spawnSync(
      POLIASTRO_PYTHON,
      [POLIASTRO_SCRIPT],
      {
        cwd: repoRoot,
        input: JSON.stringify({ muSunKm3S2: MU_SUN, cells }),
        encoding: 'utf8',
      },
    );
    if (pyResult.status !== 0) {
      throw new Error(pyResult.stderr || pyResult.stdout || `poliastro-grid.py failed for ${body.designation}`);
    }

    const parsed = JSON.parse(pyResult.stdout);
    if (!parsed.ok) {
      throw new Error(`poliastro-grid.py reported failure for ${body.designation}: ${parsed.error} (${parsed.depDate}, ${parsed.tofDays})`);
    }
    if (parsed.cells.length !== ours.length) {
      throw new Error(`Cell count mismatch for ${body.designation}: ours=${ours.length}, poliastro=${parsed.cells.length}`);
    }

    const c3Errors = [];
    const depErrors = [];
    const arrErrors = [];
    let cellsExceeding = 0;

    for (let index = 0; index < ours.length; index += 1) {
      const oursCell = ours[index];
      const refCell = parsed.cells[index];
      const c3Rel = relativeError(oursCell.c3, refCell.c3);
      const depRel = relativeError(oursCell.vInfDep, refCell.vInfDep);
      const arrRel = relativeError(oursCell.vInfArr, refCell.vInfArr);
      c3Errors.push(c3Rel);
      depErrors.push(depRel);
      arrErrors.push(arrRel);
      if (c3Rel > ERROR_THRESHOLD || depRel > ERROR_THRESHOLD || arrRel > ERROR_THRESHOLD) {
        cellsExceeding += 1;
      }
    }

    const c3Summary = summarizeErrors(c3Errors);
    const depSummary = summarizeErrors(depErrors);
    const arrSummary = summarizeErrors(arrErrors);
    maxRelErrorAcrossBodies = Math.max(
      maxRelErrorAcrossBodies,
      c3Summary.maxRel,
      depSummary.maxRel,
      arrSummary.maxRel,
    );

    bodyReports.push({
      bodyId: body.bodyId,
      designation: body.designation,
      displayName: body.name ?? body.designation,
      errors: {
        c3: c3Summary,
        v_inf_dep: depSummary,
        v_inf_arr: arrSummary,
      },
      cellsExceeding01pct: cellsExceeding,
    });

    console.log(`${body.designation.padEnd(8)} maxRel=${Math.max(c3Summary.maxRel, depSummary.maxRel, arrSummary.maxRel).toExponential(3)} cells>0.1%=${cellsExceeding}`);
  }

  const output = {
    schemaVersion: 1,
    generatedAt: isoNow(),
    gridSize: { departure: GRID_DEPARTURE_COUNT, tof: GRID_TOF_COUNT },
    bodies: bodyReports,
    summary: {
      maxRelErrorAcrossBodies,
      validationPasses: bodyReports.every((body) => body.cellsExceeding01pct === 0),
    },
  };

  writeJson(DATA_PATH, output);
  console.log(`wrote ${DATA_PATH}`);
}

await main();
