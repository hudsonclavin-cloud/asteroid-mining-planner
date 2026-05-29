#!/usr/bin/env node
/**
 * Phase C.1: Precompute Lambert screening cache for the full NEA catalog.
 *
 * For each NEA in the Slice 9 catalog, run Lambert across the Slice 10
 * screening grid and emit per-body min-C3 + best-5 windows + status tags.
 *
 * Output:
 *   tests/fixtures/v2/lambert-screen-cache.json
 *
 * Run:
 *   node tools/build/precompute-lambert-screen.mjs
 *
 * Expected runtime:
 *   30-60 minutes single-threaded, based on OQ-2 measured solve rates.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'lambert-screen-precompute');
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
    path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);
if (tscResult.status !== 0) {
  console.error('TypeScript compile failed:');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}

const importJs = async (relPath) => import(pathToFileURL(path.join(tempOutDir, relPath)).href);

const { lambert } = await importJs('core/lambert/izzo.js');
const { propagateKeplerianStateVectors } = await importJs('core/propagators/keplerian.js');
const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await importJs('core/units/utc-to-tdb.js');
const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');

const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11; // km^3/s^2
const AU_KM = 149_597_870.7;
const UNIX_TO_J2000_SECONDS = 946_728_000;

const SCREENING_START_UTC = '2026-01-01';
const SCREENING_END_UTC = '2040-12-31';
const DEPARTURE_GRID_SPACING_DAYS = 7;
const TOF_MIN_DAYS = 182;
const TOF_MAX_DAYS = 1826;
const TOF_GRID_SPACING_DAYS = 30;
const FEASIBLE_C3_MAX = 25;

const COORBITAL_E_MAX = 0.1;
const COORBITAL_I_MAX_RAD = (5 * Math.PI) / 180;
const COORBITAL_A_DELTA_KM = 0.05 * AU_KM;

const MAX_RUNTIME_SECONDS = 75 * 60;
const PROGRESS_INTERVAL = 250;

function kmVectorFromMeters(positionM) {
  return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

function kmpsVectorFromMps(velocityMps) {
  return [velocityMps.x / 1000, velocityMps.y / 1000, velocityMps.z / 1000];
}

function magnitude3(vector) {
  return Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
}

function subtract3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function tdbToUtcDateString(tdbSeconds) {
  const utcSecondsSinceUnix = tdbSeconds + UNIX_TO_J2000_SECONDS - TDB_MINUS_UTC_SECONDS;
  return new Date(utcSecondsSinceUnix * 1000).toISOString().slice(0, 10);
}

function round3(value) {
  return Math.round(value * 1_000) / 1_000;
}

function maybeInsertBestWindow(bestWindows, candidate) {
  let insertAt = 0;
  while (insertAt < bestWindows.length && bestWindows[insertAt].c3 <= candidate.c3) {
    insertAt += 1;
  }
  if (insertAt >= 5) {
    return;
  }
  bestWindows.splice(insertAt, 0, candidate);
  if (bestWindows.length > 5) {
    bestWindows.pop();
  }
}

const startTdb = utcStringToTdbSeconds(SCREENING_START_UTC);
const endTdb = utcStringToTdbSeconds(SCREENING_END_UTC);
const departureTdbs = [];
for (let t = startTdb; t <= endTdb; t += DEPARTURE_GRID_SPACING_DAYS * SECONDS_PER_DAY) {
  departureTdbs.push(t);
}

const tofDaysList = [];
const tofSecondsList = [];
for (let d = TOF_MIN_DAYS; d <= TOF_MAX_DAYS; d += TOF_GRID_SPACING_DAYS) {
  tofDaysList.push(d);
  tofSecondsList.push(d * SECONDS_PER_DAY);
}

console.log(`Departure grid: ${departureTdbs.length} dates`);
console.log(`TOF grid:       ${tofSecondsList.length} TOFs`);
console.log(`Grid per body:  ${departureTdbs.length * tofSecondsList.length}`);

const HORIZONS_FIXTURE = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-inner-solar-system-2026-2040.json',
);
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

console.log('Precomputing Earth states at all departure dates...');
const horizonsRaw = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
const horizonsStates = ingestSlice2Fixture(horizonsRaw);
const earthSeries = horizonsStates.earth.map((sample) => sample.state);
const departureDateStrings = departureTdbs.map((t) => tdbToUtcDateString(t));
const earthStates = departureTdbs.map((t) => {
  const earth = interpolateBodyStateSeries('earth', earthSeries, t);
  return {
    positionKm: kmVectorFromMeters(earth.positionM),
    velocityKmPerS: kmpsVectorFromMps(earth.velocityMps),
  };
});
console.log(`  Precomputed ${earthStates.length} Earth states`);

console.log('Loading catalog...');
const catalogRaw = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
const canonicalCatalog = ingestSlice9Fixture(catalogRaw);
const bodies = Object.values(canonicalCatalog.asteroids);
console.log(`  Catalog size: ${bodies.length}`);

const results = [];
let totalSolves = 0;
const tStart = Date.now();
let bodiesProcessed = 0;

for (const body of bodies) {
  const e = body.elements.e;
  const iRad = body.elements.iRad;
  const aKm = body.elements.aM / 1000;
  const isCoOrbital =
    e <= COORBITAL_E_MAX &&
    iRad <= COORBITAL_I_MAX_RAD &&
    Math.abs(aKm - AU_KM) <= COORBITAL_A_DELTA_KM;

  let minC3 = Number.POSITIVE_INFINITY;
  let minC3Date = null;
  let minC3TofDays = null;
  const bestWindows = [];
  let propagatorFailed = false;
  let lambertFailed = false;
  let anyOk = false;

  for (let depIdx = 0; depIdx < departureTdbs.length; depIdx += 1) {
    const depTdb = departureTdbs[depIdx];
    const earth = earthStates[depIdx];

    for (let tofIdx = 0; tofIdx < tofSecondsList.length; tofIdx += 1) {
      const tofSeconds = tofSecondsList[tofIdx];
      const tofDays = tofDaysList[tofIdx];
      const arrTdb = depTdb + tofSeconds;

      let targetState;
      try {
        targetState = propagateKeplerianStateVectors(body.elements, arrTdb);
      } catch (_error) {
        propagatorFailed = true;
        continue;
      }

      totalSolves += 1;
      const result = lambert(
        MU_SUN,
        earth.positionKm,
        kmVectorFromMeters(targetState.positionM),
        tofSeconds,
      );

      if (!result.ok) {
        lambertFailed = true;
        continue;
      }

      anyOk = true;
      const vInfDepVec = subtract3(result.v1, earth.velocityKmPerS);
      const vInfDepMag = magnitude3(vInfDepVec);
      const c3 = vInfDepMag * vInfDepMag;
      const vInfArrVec = subtract3(result.v2, kmpsVectorFromMps(targetState.velocityMps));
      const vInfArrMag = magnitude3(vInfArrVec);

      if (c3 < minC3) {
        minC3 = c3;
        minC3Date = departureDateStrings[depIdx];
        minC3TofDays = tofDays;
      }

      if (c3 <= FEASIBLE_C3_MAX) {
        maybeInsertBestWindow(bestWindows, {
          launchDate: departureDateStrings[depIdx],
          tofDays,
          c3: round3(c3),
          vInfDep: round3(vInfDepMag),
          vInfArr: round3(vInfArrMag),
        });
      }
    }
  }

  let status;
  if (!anyOk) {
    status = propagatorFailed ? 'propagator_failed' : 'lambert_unconvergeable';
  } else if (minC3 <= FEASIBLE_C3_MAX) {
    status = 'feasible';
  } else {
    status = 'high_c3';
  }

  results.push({
    bodyId: body.bodyId,
    spkId: body.spkId,
    designation: body.designation,
    status,
    minC3: anyOk ? round3(minC3) : null,
    minC3Date: anyOk ? minC3Date : null,
    minC3TofDays: anyOk ? minC3TofDays : null,
    bestWindows,
    isCoOrbital,
  });

  bodiesProcessed += 1;
  if (bodiesProcessed % PROGRESS_INTERVAL === 0) {
    const elapsed = (Date.now() - tStart) / 1000;
    if (elapsed > MAX_RUNTIME_SECONDS) {
      console.error(
        `Runtime exceeded ${MAX_RUNTIME_SECONDS}s at ${bodiesProcessed} bodies; stopping to report regression.`,
      );
      process.exit(1);
    }
    const rateBodies = bodiesProcessed / elapsed;
    const eta = (bodies.length - bodiesProcessed) / rateBodies;
    console.log(
      `  ${bodiesProcessed} / ${bodies.length} bodies, ${elapsed.toFixed(0)}s elapsed, ETA ${eta.toFixed(0)}s, ${(totalSolves / elapsed / 1000).toFixed(0)}k solves/s`,
    );
  }
}

const tElapsed = (Date.now() - tStart) / 1000;
console.log(`\nPrecompute complete in ${tElapsed.toFixed(1)}s`);
console.log(`Total solves: ${totalSolves}`);
console.log(`Solves/sec:   ${(totalSolves / tElapsed / 1000).toFixed(0)}k`);

const byStatus = {
  feasible: 0,
  high_c3: 0,
  lambert_unconvergeable: 0,
  propagator_failed: 0,
};
let coOrbitalCount = 0;
for (const result of results) {
  byStatus[result.status] += 1;
  if (result.isCoOrbital) {
    coOrbitalCount += 1;
  }
}

console.log('\nStatus breakdown:');
for (const [status, count] of Object.entries(byStatus)) {
  console.log(`  ${status.padEnd(28)} ${count} (${((100 * count) / results.length).toFixed(2)}%)`);
}
console.log(`Co-orbital bodies tagged: ${coOrbitalCount}`);

if (coOrbitalCount !== 130) {
  console.error(`Co-orbital count mismatch: expected 130 from OQ-7, received ${coOrbitalCount}`);
  process.exit(1);
}

const cache = {
  metadata: {
    generatedAt: new Date().toISOString(),
    catalogSize: results.length,
    screeningWindow: { startUtc: SCREENING_START_UTC, endUtc: SCREENING_END_UTC },
    departureGridSpacingDays: DEPARTURE_GRID_SPACING_DAYS,
    tofGridSpacingDays: TOF_GRID_SPACING_DAYS,
    tofMinDays: TOF_MIN_DAYS,
    tofMaxDays: TOF_MAX_DAYS,
    feasibleC3MaxKm2S2: FEASIBLE_C3_MAX,
    coorbitalCriteria: {
      eMax: COORBITAL_E_MAX,
      iMaxRad: COORBITAL_I_MAX_RAD,
      aDeltaKm: COORBITAL_A_DELTA_KM,
    },
    totalSolves,
    wallTimeSeconds: tElapsed,
  },
  bodies: results,
};

const outPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');
fs.writeFileSync(outPath, JSON.stringify(cache));
const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`\nCache written: ${path.relative(repoRoot, outPath)} (${sizeKb} KB)`);
