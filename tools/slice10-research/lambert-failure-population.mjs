#!/usr/bin/env node
/**
 * OQ-2: Characterize Lambert convergence failure population across the full NEA catalog.
 *
 * For each NEA:
 *   1. Propagate the asteroid to a sweep of arrival dates
 *   2. Compute Earth state at a single representative departure date
 *   3. Run the Lambert solver across the TOF sweep
 *   4. Record per-body success/failure counts and failure modes
 *
 * Output:
 *   - console summary report
 *   - detail JSON committed as engineering record
 *
 * Run:
 *   node tools/slice10-research/lambert-failure-population.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'oq2-population');
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
    path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'slice9-runtime-asteroids.ts'),
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
const { utcStringToTdbSeconds } = await importJs('core/units/utc-to-tdb.js');
const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
const { normalizeSlice9BodyForRuntime } = await importJs('app/solar-system/slice9-runtime-asteroids.js');

const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11; // km^3/s^2

const DEPARTURE_UTC = '2030-01-01';
const TOF_DAYS_MIN = 182;
const TOF_DAYS_MAX = 1826;
const TOF_STEP_DAYS = 30;
const PROGRESS_INTERVAL = 5000;

const departureTdbSeconds = utcStringToTdbSeconds(DEPARTURE_UTC);
const tofDaysList = [];
for (let t = TOF_DAYS_MIN; t <= TOF_DAYS_MAX; t += TOF_STEP_DAYS) {
  tofDaysList.push(t);
}
const TOFS_PER_BODY = tofDaysList.length;

const HORIZONS_FIXTURE = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-inner-solar-system-2026-2040.json',
);
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

function kmVectorFromMeters(positionM) {
  return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

console.log('Loading Earth ephemeris...');
const horizonsRaw = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
const horizonsStates = ingestSlice2Fixture(horizonsRaw);
const earthSeries = horizonsStates.earth.map((sample) => sample.state);
const earthAtDeparture = interpolateBodyStateSeries('earth', earthSeries, departureTdbSeconds);
const earthPositionAtDeparture = kmVectorFromMeters(earthAtDeparture.positionM);

console.log('Loading NEA catalog...');
const catalogRaw = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
const canonicalCatalog = ingestSlice9Fixture(catalogRaw);
const normalizedCatalog = Object.values(canonicalCatalog.asteroids).map((body) =>
  normalizeSlice9BodyForRuntime(body),
);

console.log(`Catalog size: ${normalizedCatalog.length} bodies`);
console.log(`Departure date: ${DEPARTURE_UTC}`);
console.log(
  `TOF sweep: ${TOF_DAYS_MIN}-${TOF_DAYS_MAX} days, step ${TOF_STEP_DAYS} -> ${TOFS_PER_BODY} TOFs per body`,
);
console.log(`Total Lambert solves: ${normalizedCatalog.length * TOFS_PER_BODY}`);
console.log('');

const perBodyStats = [];
const failureModeTally = { no_convergence: 0, invalid_geometry: 0, propagator_error: 0 };
const orbitClassFailureCount = {};

const tStart = Date.now();
let bodiesProcessed = 0;

for (const body of normalizedCatalog) {
  let ok = 0;
  let noConv = 0;
  let invalidGeom = 0;
  let propErr = 0;

  for (const tofDays of tofDaysList) {
    const tofSeconds = tofDays * SECONDS_PER_DAY;
    const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;

    let r2;
    try {
      const state = propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);
      r2 = kmVectorFromMeters(state.positionM);
    } catch (_error) {
      propErr += 1;
      failureModeTally.propagator_error += 1;
      continue;
    }

    const result = lambert(MU_SUN, earthPositionAtDeparture, r2, tofSeconds);
    if (result.ok) {
      ok += 1;
    } else if (result.reason === 'no_convergence') {
      noConv += 1;
      failureModeTally.no_convergence += 1;
    } else if (result.reason === 'invalid_geometry') {
      invalidGeom += 1;
      failureModeTally.invalid_geometry += 1;
    }
  }

  const allFailed = ok === 0;
  perBodyStats.push({
    designation: body.designation,
    spkId: body.spkId,
    orbitClass: body.class,
    attempts: TOFS_PER_BODY,
    ok,
    no_conv: noConv,
    invalid_geom: invalidGeom,
    prop_err: propErr,
    all_failed: allFailed,
  });

  if (allFailed) {
    orbitClassFailureCount[body.class] = (orbitClassFailureCount[body.class] || 0) + 1;
  }

  bodiesProcessed += 1;
  if (bodiesProcessed % PROGRESS_INTERVAL === 0) {
    const elapsed = (Date.now() - tStart) / 1000;
    const rate = bodiesProcessed / elapsed;
    const eta = (normalizedCatalog.length - bodiesProcessed) / rate;
    console.log(
      `  ${bodiesProcessed} / ${normalizedCatalog.length} bodies, ${elapsed.toFixed(1)}s elapsed, ETA ${eta.toFixed(1)}s`,
    );
  }
}

const tElapsed = (Date.now() - tStart) / 1000;
console.log(`Catalog sweep complete: ${normalizedCatalog.length} bodies in ${tElapsed.toFixed(1)}s`);
console.log('');

const totalAttempts = normalizedCatalog.length * TOFS_PER_BODY;
const totalOk = perBodyStats.reduce((sum, body) => sum + body.ok, 0);
const totalFailed = totalAttempts - totalOk;

const bodiesAllOk = perBodyStats.filter((body) => body.ok === TOFS_PER_BODY).length;
const bodiesSomeOk = perBodyStats.filter((body) => body.ok > 0 && body.ok < TOFS_PER_BODY).length;
const bodiesAllFailed = perBodyStats.filter((body) => body.all_failed).length;
const bodiesHighFailure = perBodyStats.filter(
  (body) => body.ok > 0 && body.ok / body.attempts < 0.5,
).length;

console.log('===== OQ-2: Lambert Failure Population Report =====');
console.log('');
console.log(`Departure date:       ${DEPARTURE_UTC} UTC`);
console.log(`TOF sweep:            ${TOF_DAYS_MIN}-${TOF_DAYS_MAX} days, ${TOFS_PER_BODY} points per body`);
console.log(`Catalog size:         ${normalizedCatalog.length} NEAs`);
console.log(`Total Lambert solves: ${totalAttempts}`);
console.log(`Wall time:            ${tElapsed.toFixed(1)}s (${(totalAttempts / tElapsed).toFixed(0)} solves/s)`);
console.log('');
console.log('Aggregate convergence:');
console.log(`  Successful solves:  ${totalOk} (${((100 * totalOk) / totalAttempts).toFixed(3)}%)`);
console.log(`  Failed solves:      ${totalFailed} (${((100 * totalFailed) / totalAttempts).toFixed(3)}%)`);
console.log('');
console.log('Failure mode breakdown:');
console.log(`  no_convergence:     ${failureModeTally.no_convergence}`);
console.log(`  invalid_geometry:   ${failureModeTally.invalid_geometry}`);
console.log(`  propagator_error:   ${failureModeTally.propagator_error}`);
console.log('');
console.log('Per-body classification:');
console.log(`  All ${TOFS_PER_BODY} TOFs OK:              ${bodiesAllOk} (${((100 * bodiesAllOk) / normalizedCatalog.length).toFixed(2)}%)`);
console.log(`  Mixed (some OK):                ${bodiesSomeOk} (${((100 * bodiesSomeOk) / normalizedCatalog.length).toFixed(2)}%)`);
console.log(`  No OK (all failed):             ${bodiesAllFailed} (${((100 * bodiesAllFailed) / normalizedCatalog.length).toFixed(2)}%)`);
console.log(`  High-failure (>50% fail, some OK): ${bodiesHighFailure} (${((100 * bodiesHighFailure) / normalizedCatalog.length).toFixed(2)}%)`);
console.log('');
console.log('Orbit-class distribution of all-failed bodies:');
const orbitClassEntries = Object.entries(orbitClassFailureCount).sort((a, b) => b[1] - a[1]);
for (const [orbitClass, count] of orbitClassEntries) {
  console.log(`  ${orbitClass.padEnd(8)} ${count}`);
}
console.log('');

const allFailedBodies = perBodyStats.filter((body) => body.all_failed);
console.log('Sample of all-failed bodies (first 20):');
for (const body of allFailedBodies.slice(0, 20)) {
  console.log(
    `  ${body.designation.padEnd(20)} class=${body.orbitClass}  spk=${body.spkId}  no_conv=${body.no_conv} invalid_geom=${body.invalid_geom} prop_err=${body.prop_err}`,
  );
}
console.log('');

const detailedOutPath = path.join(
  repoRoot,
  'tools',
  'slice10-research',
  'lambert-failure-population-detail.json',
);
fs.writeFileSync(
  detailedOutPath,
  JSON.stringify(
    {
      metadata: {
        departure_utc: DEPARTURE_UTC,
        tof_days_min: TOF_DAYS_MIN,
        tof_days_max: TOF_DAYS_MAX,
        tof_step_days: TOF_STEP_DAYS,
        tofs_per_body: TOFS_PER_BODY,
        catalog_size: normalizedCatalog.length,
        wall_time_seconds: tElapsed,
      },
      aggregate: {
        total_attempts: totalAttempts,
        total_ok: totalOk,
        total_failed: totalFailed,
        failure_modes: failureModeTally,
      },
      per_body_summary: {
        all_ok: bodiesAllOk,
        mixed: bodiesSomeOk,
        all_failed: bodiesAllFailed,
        high_failure_rate: bodiesHighFailure,
      },
      orbit_class_failures: orbitClassFailureCount,
      per_body_stats: perBodyStats,
      all_failed_bodies: allFailedBodies.map((body) => ({
        designation: body.designation,
        spkId: body.spkId,
        orbitClass: body.orbitClass,
        no_conv: body.no_conv,
        invalid_geom: body.invalid_geom,
        prop_err: body.prop_err,
      })),
    },
    null,
    2,
  ),
);

console.log(
  `Detailed per-body stats written to: ${path.relative(repoRoot, detailedOutPath)}`,
);
console.log('');
console.log('===== End Report =====');
