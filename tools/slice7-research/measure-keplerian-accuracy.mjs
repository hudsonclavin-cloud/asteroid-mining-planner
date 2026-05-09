import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GM_SUN_M3_S2,
  J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
  propagateKeplerian,
} from './keplerian-propagate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const horizonsTruthDir = path.join(dataDir, 'horizons-truth');
const SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';
const HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const EPOCH_SANITY_LIMIT_KM = 100;
const DAY_90_ALERT_KM = 1_000_000;

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseVectorLine(line) {
  const matches = [...line.matchAll(/([A-Z]+)\s*=\s*([+-]?\d+\.\d+(?:E[+-]?\d+)?)/g)];
  return Object.fromEntries(matches.map(([, key, value]) => [key, Number(value)]));
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function buildSbdbQueryUrl(designation) {
  return `${SBDB_QUERY_URL}?${new URLSearchParams({
    fields: 'pdes,name,class,epoch,e,a,i,om,w,ma,H,G,data_arc,condition_code',
    'sb-cdata': JSON.stringify({ OR: [`pdes|EQ|${designation}`] }),
    'full-prec': 'true',
  }).toString()}`;
}

async function fetchFullPrecisionElements(designation) {
  const response = await fetch(buildSbdbQueryUrl(designation));
  if (!response.ok) {
    throw new Error(`SBDB query failed for ${designation}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.data) || payload.data.length !== 1) {
    throw new Error(`Expected one SBDB full-precision row for ${designation}`);
  }

  const row = Object.fromEntries(
    payload.fields.map((field, index) => [field, payload.data[0][index] ?? null]),
  );

  return {
    designation: row.pdes,
    name: row.name || row.pdes,
    class: row.class,
    a: parseNumber(row.a),
    e: parseNumber(row.e),
    i: parseNumber(row.i),
    om: parseNumber(row.om),
    w: parseNumber(row.w),
    ma: parseNumber(row.ma),
    epoch_tdb: parseNumber(row.epoch),
    H: parseNumber(row.H),
    G: parseNumber(row.G),
    data_arc: parseNumber(row.data_arc),
    condition_code: parseNumber(row.condition_code),
  };
}

async function fetchHorizonsEpochPosition(designation, jdTdb) {
  const url = `${HORIZONS_URL}?${new URLSearchParams({
    format: 'json',
    COMMAND: `';${designation}'`,
    EPHEM_TYPE: 'VECTORS',
    CENTER: '500@10',
    OUT_UNITS: 'KM-S',
    REF_PLANE: 'FRAME',
    REF_SYSTEM: 'ICRF',
    VEC_TABLE: '2',
    TIME_TYPE: 'TDB',
    TLIST: String(jdTdb),
  }).toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Horizons epoch fetch failed for ${designation}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const lines = payload.result.split('\n');
  const soeIndex = lines.indexOf('$$SOE');
  if (soeIndex === -1 || !lines[soeIndex + 2]) {
    throw new Error(`Unable to parse Horizons epoch vector block for ${designation}`);
  }

  const position = parseVectorLine(lines[soeIndex + 2]);
  return { x: position.X, y: position.Y, z: position.Z };
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function summarizeAsteroid(body, truthSamples) {
  const propagationInput = { ...body, epoch_tdb: body.epoch };
  let maxErrorKm = 0;
  let sumSquaredErrorKm = 0;
  let errorAt30dKm = null;
  let errorAt60dKm = null;
  let errorAt90dKm = null;

  for (let index = 0; index < truthSamples.length; index += 1) {
    const truth = truthSamples[index];
    const propagated = propagateKeplerian(propagationInput, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    maxErrorKm = Math.max(maxErrorKm, errorKm);
    sumSquaredErrorKm += errorKm * errorKm;

    if (index === 30) errorAt30dKm = errorKm;
    if (index === 60) errorAt60dKm = errorKm;
    if (index === 90) errorAt90dKm = errorKm;
  }

  return {
    designation: body.designation,
    name: body.name,
    class: body.class,
    H: body.H,
    max_error_km: maxErrorKm,
    rms_error_km: Math.sqrt(sumSquaredErrorKm / truthSamples.length),
    error_at_30d_km: errorAt30dKm,
    error_at_60d_km: errorAt60dKm,
    error_at_90d_km: errorAt90dKm,
    truth_points_checked: truthSamples.length,
  };
}

function printSummaryTable(rows) {
  console.log('Body                 Class   H      EpochErr(km)   Max(km)      RMS(km)      90d(km)');
  console.log('-------------------  ------  -----  -------------  -----------  -----------  -----------');
  for (const row of rows) {
    const bodyLabel = `${row.designation} ${row.name}`.slice(0, 19).padEnd(19, ' ');
    const classLabel = String(row.class).padEnd(6, ' ');
    const hLabel = row.H.toFixed(2).padStart(5, ' ');
    const epochLabel = row.epoch_error_km.toFixed(3).padStart(13, ' ');
    const maxLabel = row.max_error_km.toFixed(1).padStart(11, ' ');
    const rmsLabel = row.rms_error_km.toFixed(1).padStart(11, ' ');
    const day90Label = row.error_at_90d_km.toFixed(1).padStart(11, ' ');
    console.log(`${bodyLabel}  ${classLabel}  ${hLabel}  ${epochLabel}  ${maxLabel}  ${rmsLabel}  ${day90Label}`);
  }
}

async function main() {
  const sampleBodies = await readJson(path.join(dataDir, 'sample-asteroids.json'));
  const results = [];

  for (const body of sampleBodies) {
    const truth = await readJson(
      path.join(horizonsTruthDir, `asteroid-${body.designation}-90d.json`),
    );

    const fullPrecision = await fetchFullPrecisionElements(body.designation);
    const epochTruth = await fetchHorizonsEpochPosition(
      body.designation,
      fullPrecision.epoch_tdb,
    );
    const epochPropagated = propagateKeplerian(fullPrecision, fullPrecision.epoch_tdb);
    const epochErrorKm = vectorErrorKm(epochPropagated.position_km, epochTruth);

    if (epochErrorKm > EPOCH_SANITY_LIMIT_KM) {
      throw new Error(
        `Epoch sanity gate failed for ${body.designation} ${body.name}: ${epochErrorKm} km`,
      );
    }

    if (truth.referenceFrameHeader !== 'ICRF') {
      throw new Error(
        `Truth frame mismatch for ${body.designation} ${body.name}: ${truth.referenceFrameHeader}`,
      );
    }

    const summary = summarizeAsteroid(body, truth.samples);
    results.push({ ...summary, epoch_error_km: epochErrorKm });
  }

  results.sort((left, right) => right.max_error_km - left.max_error_km);
  printSummaryTable(results);

  const day90Outliers = results.filter((row) => row.error_at_90d_km > DAY_90_ALERT_KM);
  if (day90Outliers.length) {
    console.error(
      `warning: ${day90Outliers.length} asteroid(s) exceed ${DAY_90_ALERT_KM} km at day 90: ${day90Outliers
        .map((row) => `${row.designation} ${row.name} (${row.error_at_90d_km.toFixed(1)} km)`)
        .join(', ')}`,
    );
  }

  const output = {
    generatedAtUtc: new Date().toISOString(),
    validation_window_days: 90,
    validation_window_start_tdb: '2026-05-01',
    validation_window_end_tdb: '2026-07-30',
    obliquity_arcsec: J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
    GM_sun_m3_s2: GM_SUN_M3_S2,
    epoch_sanity_limit_km: EPOCH_SANITY_LIMIT_KM,
    day_90_alert_km: DAY_90_ALERT_KM,
    asteroids: results,
  };

  const outputPath = path.join(dataDir, 'keplerian-accuracy.json');
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
