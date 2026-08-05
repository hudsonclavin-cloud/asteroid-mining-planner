#!/usr/bin/env node
/**
 * OQ-7: Characterize Keplerian-propagation drift for Earth co-orbital NEAs.
 *
 * Co-orbital definition (per INV-016 Amendment 2026-05-27):
 *   e <= 0.1 AND inclination <= 5 deg AND |a - 1 AU| <= 0.05 AU
 *
 * For each co-orbital body:
 *   1. If in NHATS with min_dv_traj:
 *      use NHATS launch date and TOF, run Aster v2 Lambert, compare absolute
 *      v_inf_dep deviation against NHATS v_dep_earth.
 *   2. If not in NHATS:
 *      record a synthetic Aster v2 pipeline output at 2030-01-01 and 1 year TOF.
 *
 * Outputs:
 *   - console summary report
 *   - detail JSON
 *   - cached NHATS payloads under tests/fixtures/v2/oq7-nhats-coorbital/
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'oq7-coorbital');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const tscResult = spawnSync(
  process.execPath,
  [
    tscBin,
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

const SECONDS_PER_DAY = 86_400;
const MU_SUN = 1.32712440018e11;
const AU_KM = 149_597_870.7;

const E_MAX = 0.1;
const I_MAX_RAD = (5 * Math.PI) / 180;
const A_DELTA_KM = 0.05 * AU_KM;
const SYNTHETIC_DEPARTURE_UTC = '2030-01-01';
const SYNTHETIC_TOF_SECONDS = 365 * SECONDS_PER_DAY;

const HORIZONS_FIXTURE = path.join(
  repoRoot,
  'src',
  'v2',
  'data',
  'horizons-inner-solar-system-2026-2040.json',
);
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const cacheDir = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'oq7-nhats-coorbital');
fs.mkdirSync(cacheDir, { recursive: true });

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

function median(values) {
  if (values.length === 0) {
    return NaN;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getNhatsRecord(designation) {
  const safeKey = designation.replace(/[ /\\]/g, '_');
  const cachePath = path.join(cacheDir, `${safeKey}.json`);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  const desUrl = encodeURIComponent(designation);
  const url = `https://ssd-api.jpl.nasa.gov/nhats.api?des=${desUrl}`;
  const response = await fetch(url);
  if (response.status === 429) {
    throw new Error(`NHATS rate-limited request for ${designation} (HTTP 429)`);
  }
  if (!response.ok) {
    if (response.status === 404) {
      const stub = { _not_in_nhats: true, designation };
      fs.writeFileSync(cachePath, JSON.stringify(stub, null, 2));
      return stub;
    }
    throw new Error(`NHATS API returned ${response.status} for ${designation}`);
  }

  const data = await response.json();
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  await sleep(100);
  return data;
}

console.log('Loading Earth ephemeris...');
const horizonsRaw = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
const horizonsStates = ingestSlice2Fixture(horizonsRaw);
const earthSeries = horizonsStates.earth.map((sample) => sample.state);
const earthMinTdbSeconds = earthSeries[0].tdbSeconds;
const earthMaxTdbSeconds = earthSeries[earthSeries.length - 1].tdbSeconds;

function earthStateAt(tdbSeconds) {
  return interpolateBodyStateSeries('earth', earthSeries, tdbSeconds);
}

console.log('Loading NEA catalog...');
const catalogRaw = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
const canonicalCatalog = ingestSlice9Fixture(catalogRaw);
const bodies = Object.values(canonicalCatalog.asteroids);

const coorbital = bodies.filter((body) => {
  const e = body.elements.e;
  const i = body.elements.iRad;
  const aKm = body.elements.aM / 1000;
  return e <= E_MAX && i <= I_MAX_RAD && Math.abs(aKm - AU_KM) <= A_DELTA_KM;
});

console.log(`Co-orbital subset: ${coorbital.length} of ${bodies.length} catalog bodies`);
console.log(
  `Criteria: e <= ${E_MAX}, i <= ${I_MAX_RAD.toFixed(4)} rad (5°), |a - 1 AU| <= ${A_DELTA_KM.toFixed(0)} km (0.05 AU)`,
);
console.log('');

if (coorbital.length === 0) {
  console.log('No co-orbital bodies found. Nothing to measure.');
  process.exit(0);
}

const results = [];
let processed = 0;

console.log(`Querying NHATS and running Lambert for ${coorbital.length} co-orbital bodies...`);
for (const body of coorbital) {
  let nhatsRecord;
  try {
    nhatsRecord = await getNhatsRecord(body.designation);
  } catch (error) {
    console.error(`NHATS error for ${body.designation}: ${error.message}`);
    throw error;
  }

  if (nhatsRecord._not_in_nhats || !nhatsRecord.min_dv_traj) {
    const departureTdb = utcStringToTdbSeconds(SYNTHETIC_DEPARTURE_UTC);
    const arrivalTdb = departureTdb + SYNTHETIC_TOF_SECONDS;
    try {
      const targetState = propagateKeplerianStateVectors(body.elements, arrivalTdb);
      const earth = earthStateAt(departureTdb);
      const lambertResult = lambert(
        MU_SUN,
        kmVectorFromMeters(earth.positionM),
        kmVectorFromMeters(targetState.positionM),
        SYNTHETIC_TOF_SECONDS,
      );

      if (lambertResult.ok) {
        const vInfDep = subtract3(lambertResult.v1, kmpsVectorFromMps(earth.velocityMps));
        results.push({
          designation: body.designation,
          orbitClass: body.orbitClass,
          status: 'not_in_nhats',
          our_v_inf_dep: magnitude3(vInfDep),
        });
      } else {
        results.push({
          designation: body.designation,
          orbitClass: body.orbitClass,
          status: 'lambert_failed_not_in_nhats',
          reason: lambertResult.reason,
        });
      }
    } catch (error) {
      results.push({
        designation: body.designation,
        orbitClass: body.orbitClass,
        status: 'propagator_failed_not_in_nhats',
        error: String(error),
      });
    }
  } else {
    const traj = nhatsRecord.min_dv_traj;
    try {
      const departureTdb = utcStringToTdbSeconds(traj.launch);
      if (departureTdb < earthMinTdbSeconds || departureTdb > earthMaxTdbSeconds) {
        results.push({
          designation: body.designation,
          orbitClass: body.orbitClass,
          status: 'outside_earth_ephemeris_range',
          launch: traj.launch,
        });
        processed += 1;
        if (processed % 25 === 0) {
          console.log(`  ${processed}/${coorbital.length}...`);
        }
        continue;
      }
      const tofSeconds = parseFloat(traj.dur_out) * SECONDS_PER_DAY;
      const arrivalTdb = departureTdb + tofSeconds;

      const earth = earthStateAt(departureTdb);
      const targetState = propagateKeplerianStateVectors(body.elements, arrivalTdb);
      const lambertResult = lambert(
        MU_SUN,
        kmVectorFromMeters(earth.positionM),
        kmVectorFromMeters(targetState.positionM),
        tofSeconds,
      );

      if (!lambertResult.ok) {
        results.push({
          designation: body.designation,
          orbitClass: body.orbitClass,
          status: 'lambert_failed_in_nhats',
          reason: lambertResult.reason,
        });
      } else {
        const vInfDep = subtract3(lambertResult.v1, kmpsVectorFromMps(earth.velocityMps));
        const ourVInfMag = magnitude3(vInfDep);
        const nhatsVInf = parseFloat(traj.v_dep_earth);
        results.push({
          designation: body.designation,
          orbitClass: body.orbitClass,
          status: 'compared',
          launch: traj.launch,
          tof_days: parseFloat(traj.dur_out),
          nhats_v_inf_dep: nhatsVInf,
          our_v_inf_dep: ourVInfMag,
          abs_dev_km_s: Math.abs(ourVInfMag - nhatsVInf),
          nhats_c3: parseFloat(traj.c3),
        });
      }
    } catch (error) {
      results.push({
        designation: body.designation,
        orbitClass: body.orbitClass,
        status: 'glue_error',
        error: String(error),
      });
    }
  }

  processed += 1;
  if (processed % 25 === 0) {
    console.log(`  ${processed}/${coorbital.length}...`);
  }
}

console.log('Done.\n');

const compared = results.filter((result) => result.status === 'compared');
const notInNhats = results.filter((result) => result.status === 'not_in_nhats');
const outsideEarthRange = results.filter(
  (result) => result.status === 'outside_earth_ephemeris_range',
);
const errors = results.filter((result) =>
  result.status === 'nhats_error' ||
  result.status === 'lambert_failed_in_nhats' ||
  result.status === 'lambert_failed_not_in_nhats' ||
  result.status === 'propagator_failed_not_in_nhats' ||
  result.status === 'glue_error',
);

console.log('===== OQ-7: Co-orbital Drift Population Report =====');
console.log('');
console.log(`Catalog size:              ${bodies.length}`);
console.log(`Co-orbital subset:         ${coorbital.length} (${((100 * coorbital.length) / bodies.length).toFixed(2)}%)`);
console.log(`  In NHATS w/ comparison:  ${compared.length}`);
console.log(`  Not in NHATS:            ${notInNhats.length}`);
console.log(`  NHATS launch outside 2026-2040 Earth ephemeris window: ${outsideEarthRange.length}`);
console.log(`  Errors:                  ${errors.length}`);
console.log('');

let medianDev = NaN;
let maxDev = NaN;
let above01 = 0;
let above10 = 0;
let above20 = 0;

if (compared.length > 0) {
  const devs = compared.map((result) => result.abs_dev_km_s);
  medianDev = median(devs);
  maxDev = Math.max(...devs);
  above01 = devs.filter((d) => d > 0.1).length;
  above10 = devs.filter((d) => d > 1.0).length;
  above20 = devs.filter((d) => d > 2.0).length;

  console.log('Deviation distribution (absolute km/s on v_inf_dep):');
  console.log(`  median:    ${medianDev.toFixed(4)}`);
  console.log(`  max:       ${maxDev.toFixed(4)}`);
  console.log(`  > 0.1 km/s (stable bound exceeded): ${above01}/${compared.length}`);
  console.log(`  > 1.0 km/s:                          ${above10}/${compared.length}`);
  console.log(`  > 2.0 km/s (co-orbital bound exceeded): ${above20}/${compared.length}`);
  console.log('');

  const sortedByDev = [...compared].sort((a, b) => b.abs_dev_km_s - a.abs_dev_km_s);
  console.log('Top 10 worst-deviation co-orbital targets:');
  console.log('  designation              orbitClass  launch       NHATS v_inf  ours v_inf  abs Δ km/s');
  for (const result of sortedByDev.slice(0, 10)) {
    console.log(
      `  ${result.designation.padEnd(22)} ${(result.orbitClass || '').padEnd(11)} ${result.launch}   ${result.nhats_v_inf_dep.toFixed(3).padStart(8)}     ${result.our_v_inf_dep.toFixed(3).padStart(8)}    ${result.abs_dev_km_s.toFixed(4)}`,
    );
  }
  console.log('');
}

if (errors.length > 0) {
  console.log('Errors (first 10):');
  for (const result of errors.slice(0, 10)) {
    console.log(`  ${result.designation}: ${result.status} ${result.reason || result.error || ''}`);
  }
  console.log('');
}

const orbitClassCount = {};
for (const body of coorbital) {
  orbitClassCount[body.orbitClass] = (orbitClassCount[body.orbitClass] || 0) + 1;
}

console.log('Orbit-class distribution of co-orbital subset:');
for (const [orbitClass, count] of Object.entries(orbitClassCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${orbitClass.padEnd(8)} ${count}`);
}
console.log('');

const detailOut = path.join(repoRoot, 'tools', 'slice10-research', 'coorbital-drift-detail.json');
fs.writeFileSync(
  detailOut,
  JSON.stringify(
    {
      metadata: {
        catalog_size: bodies.length,
        coorbital_count: coorbital.length,
        criteria: { e_max: E_MAX, i_max_rad: I_MAX_RAD, a_delta_km: A_DELTA_KM },
        timestamp: new Date().toISOString(),
      },
      summary: {
        compared_count: compared.length,
        not_in_nhats_count: notInNhats.length,
        outside_earth_ephemeris_range_count: outsideEarthRange.length,
        error_count: errors.length,
        median_abs_dev_km_s: Number.isFinite(medianDev) ? medianDev : null,
        max_abs_dev_km_s: Number.isFinite(maxDev) ? maxDev : null,
        above_0_1_count: above01,
        above_1_0_count: above10,
        above_2_0_count: above20,
      },
      orbit_class_distribution: orbitClassCount,
      results,
    },
    null,
    2,
  ),
);

console.log(`Detail JSON written to: ${path.relative(repoRoot, detailOut)}`);
console.log('===== End Report =====');
