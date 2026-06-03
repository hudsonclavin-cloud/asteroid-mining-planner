#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice11-m1');
const DATA_PATH = path.join(repoRoot, 'tools', 'slice11-research', 'data', 'lambert-grid-timing.json');
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const SCREEN_CACHE_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');
const HORIZONS_FIXTURE = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-inner-solar-system-2026-2040.json',
);

const GRID_DEPARTURE_COUNT = 200;
const GRID_TOF_COUNT = 100;
const RUNS_PER_BODY = 3;
const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11;

const DEPARTURE_START_UTC = '2026-01-01';
const DEPARTURE_END_UTC = '2040-01-01';
const TOF_MIN_DAYS = 182.5;
const TOF_MAX_DAYS = 1826.25;

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function isoNow() {
  return new Date().toISOString();
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

function buildLinspace(start, end, count) {
  if (count <= 1) {
    return [start];
  }
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + step * index);
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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

function pickFirst(candidates, used, predicate = () => true) {
  return candidates.find((candidate) => !used.has(candidate.bodyId) && predicate(candidate)) ?? null;
}

async function loadResearchInputs() {
  const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
  const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
  const { normalizeSlice9BodyForRuntime } = await importJs('app/solar-system/slice9-runtime-asteroids.js');
  const { utcStringToTdbSeconds } = await importJs('core/units/utc-to-tdb.js');

  const rawCatalog = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
  const canonicalCatalog = ingestSlice9Fixture(rawCatalog);
  const bodies = Object.values(canonicalCatalog.asteroids).map((body) => normalizeSlice9BodyForRuntime(body));
  const byDesignation = new Map(bodies.map((body) => [body.designation, body]));
  const byBodyId = new Map(bodies.map((body) => [body.bodyId, body]));
  const sortedBodies = [...bodies].sort((left, right) => left.spkId - right.spkId);

  const rawScreenCache = JSON.parse(fs.readFileSync(SCREEN_CACHE_FIXTURE, 'utf8'));
  const coOrbitalBodyIds = rawScreenCache.bodies
    .filter((body) => body.isCoOrbital)
    .map((body) => body.bodyId);

  const rawHorizons = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
  const horizonsStates = ingestSlice2Fixture(rawHorizons);
  const earthSeries = horizonsStates.earth.map((sample) => sample.state);

  return {
    bodies,
    byDesignation,
    byBodyId,
    sortedBodies,
    coOrbitalBodyIds,
    earthSeries,
    utcStringToTdbSeconds,
  };
}

function selectBodies({ byDesignation, byBodyId, sortedBodies, coOrbitalBodyIds }) {
  const orbitBodies = sortedBodies.filter((body) =>
    body.class === 'APO' || body.class === 'ATE' || body.class === 'AMO' || body.class === 'IEO',
  );
  const used = new Set();
  const selected = [];

  function add(label, body, allowNull = false) {
    if (!body) {
      if (allowNull) {
        return;
      }
      throw new Error(`Unable to satisfy sample slot: ${label}`);
    }
    used.add(body.bodyId);
    selected.push({
      selectionReason: label,
      bodyId: body.bodyId,
      designation: body.designation,
      displayName: body.name ?? body.designation,
      orbitClass: body.class,
      eccentricity: body.elements.e,
      body,
    });
  }

  add('close-approach', byDesignation.get('99942'));
  add('well-known-target', byDesignation.get('101955'));
  add('sample-return-target', byDesignation.get('25143'));
  add('representative-apo', pickFirst(orbitBodies, used, (body) => body.class === 'APO'));
  add('representative-ate', pickFirst(orbitBodies, used, (body) => body.class === 'ATE'));
  add('representative-amo', pickFirst(orbitBodies, used, (body) => body.class === 'AMO'));
  const ieo = pickFirst(orbitBodies, used, (body) => body.class === 'IEO');
  add('representative-ieo', ieo ?? pickFirst(orbitBodies, used, (body) => body.class === 'APO'));
  add(
    'co-orbital',
    pickFirst(
      coOrbitalBodyIds.map((bodyId) => byBodyId.get(bodyId)).filter(Boolean),
      used,
    ),
  );
  add('high-eccentricity', pickFirst([...orbitBodies].sort((l, r) => r.elements.e - l.elements.e), used, (body) => body.elements.e > 0.5));
  add('low-eccentricity', pickFirst([...orbitBodies].sort((l, r) => l.elements.e - r.elements.e), used, (body) => body.elements.e < 0.1));

  if (selected.length !== 10) {
    throw new Error(`Expected 10 selected bodies, received ${selected.length}`);
  }
  return selected;
}

function runWorker(payload) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const worker = new Worker(new URL(import.meta.url), { workerData: payload });
    worker.once('message', (message) => {
      const wallMs = Date.now() - startedAt;
      resolve({ ...message, wallMs });
    });
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

async function main() {
  compileRuntimeModules();
  const { earthSeries, utcStringToTdbSeconds, ...catalogContext } = await loadResearchInputs();
  const selectedBodies = selectBodies(catalogContext);

  const departureStartTdbSeconds = utcStringToTdbSeconds(DEPARTURE_START_UTC);
  const departureEndTdbSeconds = utcStringToTdbSeconds(DEPARTURE_END_UTC);
  const departureGrid = buildLinspace(departureStartTdbSeconds, departureEndTdbSeconds, GRID_DEPARTURE_COUNT);
  const tofDaysGrid = buildLinspace(TOF_MIN_DAYS, TOF_MAX_DAYS, GRID_TOF_COUNT);

  const measurementStart = Date.now();
  const bodies = [];

  for (const selected of selectedBodies) {
    const runs = [];
    for (let runIndex = 0; runIndex < RUNS_PER_BODY; runIndex += 1) {
      const result = await runWorker({
        tempOutDir: TEMP_OUT_DIR,
        earthSeries,
        body: selected.body,
        departureGrid,
        tofDaysGrid,
      });
      runs.push(result.wallMs);
    }

    const medianMs = median(runs);
    bodies.push({
      selectionReason: selected.selectionReason,
      bodyId: selected.bodyId,
      designation: selected.designation,
      displayName: selected.displayName,
      orbitClass: selected.orbitClass,
      eccentricity: selected.eccentricity,
      runs,
      medianMs,
    });
    console.log(
      `${selected.designation.padEnd(12)} ${selected.selectionReason.padEnd(20)} median ${medianMs.toFixed(0)} ms`,
    );
  }

  const perBodyMedians = bodies.map((body) => body.medianMs);
  const output = {
    schemaVersion: 1,
    generatedAt: isoNow(),
    gridSize: { departure: GRID_DEPARTURE_COUNT, tof: GRID_TOF_COUNT },
    gridSpan: {
      departureStart: DEPARTURE_START_UTC,
      departureEnd: DEPARTURE_END_UTC,
      tofMinDays: TOF_MIN_DAYS,
      tofMaxDays: TOF_MAX_DAYS,
    },
    bodies,
    summary: {
      perBodyMedianMs: {
        min: Math.min(...perBodyMedians),
        max: Math.max(...perBodyMedians),
        median: median(perBodyMedians),
      },
      totalRunMs: Date.now() - measurementStart,
    },
  };

  writeJson(DATA_PATH, output);
  console.log(`wrote ${DATA_PATH}`);
}

async function workerMain() {
  const { lambert } = await import(pathToFileURL(path.join(workerData.tempOutDir, 'core/lambert/izzo.js')).href);
  const { propagateKeplerianStateVectors } = await import(
    pathToFileURL(path.join(workerData.tempOutDir, 'core/propagators/keplerian.js')).href
  );
  const { interpolateBodyStateSeries } = await import(
    pathToFileURL(path.join(workerData.tempOutDir, 'core/interpolators/hermite.js')).href
  );

  const startedAt = Date.now();
  let solvedCells = 0;
  let failedCells = 0;

  for (const departureTdbSeconds of workerData.departureGrid) {
    const earthState = interpolateBodyStateSeries('earth', workerData.earthSeries, departureTdbSeconds);
    const earthPositionKm = kmVectorFromMeters(earthState.positionM);
    const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

    for (const tofDays of workerData.tofDaysGrid) {
      const tofSeconds = tofDays * SECONDS_PER_DAY;
      const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
      const asteroidState = propagateKeplerianStateVectors(workerData.body.elements, arrivalTdbSeconds);
      const asteroidPositionKm = kmVectorFromMeters(asteroidState.positionM);
      const asteroidVelocityKmps = kmpsVectorFromMps(asteroidState.velocityMps);
      const result = lambert(MU_SUN, earthPositionKm, asteroidPositionKm, tofSeconds);
      if (!result.ok) {
        failedCells += 1;
        continue;
      }

      const vInfDep = subtract3(result.v1, earthVelocityKmps);
      const vInfArr = subtract3(result.v2, asteroidVelocityKmps);
      const c3 = magnitude3(vInfDep) ** 2;
      const vInfDepMag = magnitude3(vInfDep);
      const vInfArrMag = magnitude3(vInfArr);
      if (!Number.isFinite(c3) || !Number.isFinite(vInfDepMag) || !Number.isFinite(vInfArrMag)) {
        throw new Error(`Non-finite Lambert metrics for ${workerData.body.designation}`);
      }
      solvedCells += 1;
    }
  }

  parentPort.postMessage({
    computeMs: Date.now() - startedAt,
    solvedCells,
    failedCells,
  });
}

if (isMainThread) {
  await main();
} else {
  await workerMain();
}
