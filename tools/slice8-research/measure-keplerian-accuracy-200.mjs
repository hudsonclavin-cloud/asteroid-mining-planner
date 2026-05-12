import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GM_SUN_M3_S2, J2000_ECLIPTIC_OBLIQUITY_ARCSEC, propagateKeplerian } from '../slice7-research/keplerian-propagate.mjs';
import { fetchHorizonsJson, parseSamples } from './horizons.mjs';
import { readJson, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'sample-200.json');
const outputPath = path.join(dataDir, 'keplerian-accuracy-200.json');

const VALIDATION_WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
  stepSize: "'1 d'",
};

function buildTruthParams(designation) {
  return {
    format: 'json',
    COMMAND: `';${designation}'`,
    CENTER: '500@10',
    EPHEM_TYPE: 'VECTORS',
    REF_SYSTEM: 'ICRF',
    REF_PLANE: 'FRAME',
    TIME_TYPE: 'TDB',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '2',
    START_TIME: VALIDATION_WINDOW.start,
    STOP_TIME: VALIDATION_WINDOW.stop,
    STEP_SIZE: VALIDATION_WINDOW.stepSize,
  };
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

async function summarizeBody(row) {
  const payload = await fetchHorizonsJson(buildTruthParams(row.designation));
  const samples = parseSamples(payload.result);
  if (samples.length !== 91) {
    throw new Error(`Expected 91 truth samples for ${row.designation}, got ${samples.length}`);
  }

  const propagationInput = {
    a: row.a,
    e: row.e,
    i: row.i,
    om: row.om,
    w: row.w,
    ma: row.ma,
    epoch_tdb: row.epochTdbJd,
  };

  let maxErrorKm = 0;
  let sumSquaredErrorKm = 0;
  let epochErrorKm = null;
  let errorAt30dKm = null;
  let errorAt60dKm = null;
  let errorAt90dKm = null;

  for (let index = 0; index < samples.length; index += 1) {
    const truth = samples[index];
    const propagated = propagateKeplerian(propagationInput, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    if (index === 0) epochErrorKm = errorKm;
    if (index === 30) errorAt30dKm = errorKm;
    if (index === 60) errorAt60dKm = errorKm;
    if (index === 90) errorAt90dKm = errorKm;
    maxErrorKm = Math.max(maxErrorKm, errorKm);
    sumSquaredErrorKm += errorKm * errorKm;
  }

  return {
    designation: row.designation,
    name: row.name,
    class: row.class,
    H: row.H,
    decile: row.decile,
    dataSource: row.dataSource,
    epochTdbJd: row.epochTdbJd,
    sbdbEpochTdbJd: row.sbdbEpochTdbJd,
    a: row.a,
    e: row.e,
    i: row.i,
    om: row.om,
    w: row.w,
    ma: row.ma,
    epoch_error_km: epochErrorKm,
    max_error_km: maxErrorKm,
    rms_error_km: Math.sqrt(sumSquaredErrorKm / samples.length),
    error_at_30d_km: errorAt30dKm,
    error_at_60d_km: errorAt60dKm,
    error_at_90d_km: errorAt90dKm,
    truth_points_checked: samples.length,
  };
}

async function main() {
  const sampleDocument = await readJson(inputPath);
  const rows = sampleDocument.rows;
  if (!Array.isArray(rows) || rows.length !== 200) {
    throw new Error(`Expected 200 sampled rows in ${inputPath}`);
  }

  const results = [];
  for (const row of rows) {
    console.log(`measuring ${results.length + 1}/200 ${row.designation} ${row.name}`);
    results.push(await summarizeBody(row));
  }

  results.sort((left, right) => right.max_error_km - left.max_error_km);
  const worst = results[0];
  const best = results.at(-1);
  const bySource = results.reduce((map, row) => {
    const bucket = map.get(row.dataSource) ?? [];
    bucket.push(row);
    map.set(row.dataSource, bucket);
    return map;
  }, new Map());

  const output = {
    generatedAtUtc: new Date().toISOString(),
    validationWindow: VALIDATION_WINDOW,
    sampleCount: results.length,
    obliquity_arcsec: J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
    GM_sun_m3_s2: GM_SUN_M3_S2,
    byDataSource: Object.fromEntries(
      [...bySource.entries()].map(([dataSource, bucket]) => [
        dataSource,
        {
          count: bucket.length,
          max_error_km: Math.max(...bucket.map((row) => row.max_error_km)),
          rms_error_km: Math.sqrt(
            bucket.reduce((sum, row) => sum + row.rms_error_km * row.rms_error_km, 0) / bucket.length,
          ),
        },
      ]),
    ),
    worstBody: {
      designation: worst.designation,
      max_error_km: worst.max_error_km,
      e: worst.e,
      H: worst.H,
      dataSource: worst.dataSource,
    },
    bestBody: {
      designation: best.designation,
      max_error_km: best.max_error_km,
      e: best.e,
      H: best.H,
      dataSource: best.dataSource,
    },
    rows: results,
  };

  await writeJson(outputPath, output);
  console.log(`wrote ${outputPath}`);
  console.log(`worst=${worst.designation} max=${worst.max_error_km.toFixed(3)} km e=${worst.e}`);
  console.log(`best=${best.designation} max=${best.max_error_km.toFixed(3)} km e=${best.e}`);
  console.log(`by_data_source=${JSON.stringify(output.byDataSource)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
