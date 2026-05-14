import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GM_SUN_M3_S2, J2000_ECLIPTIC_OBLIQUITY_ARCSEC, propagateKeplerian } from '../slice7-research/keplerian-propagate.mjs';
import { fetchHorizonsJson, parseSamples } from './horizons.mjs';
import { readJson, sleep, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'horizons-anchors-200-eccentricity.json');
const outputPath = path.join(dataDir, 'keplerian-accuracy-200-eccentricity.json');

const VALIDATION_WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
  stepSize: "'1 d'",
};

const INTER_FETCH_SLEEP_MS = 3_000;
const MAX_ALLOWED_ERROR_KM = 500_000;

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

async function loadExistingRows() {
  try {
    const existing = await readJson(outputPath);
    return Array.isArray(existing.rows) ? existing.rows : [];
  } catch {
    return [];
  }
}

async function persist(rows) {
  const sorted = [...rows].sort((left, right) => right.max_error_km - left.max_error_km);
  const worst = sorted[0];
  const best = sorted.at(-1);
  await writeJson(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    validationWindow: VALIDATION_WINDOW,
    sampleCount: rows.length,
    obliquity_arcsec: J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
    GM_sun_m3_s2: GM_SUN_M3_S2,
    worstBody: worst
      ? {
          designation: worst.designation,
          max_error_km: worst.max_error_km,
          band: worst.band,
          e: worst.e,
          H: worst.H,
        }
      : null,
    bestBody: best
      ? {
          designation: best.designation,
          max_error_km: best.max_error_km,
          band: best.band,
          e: best.e,
          H: best.H,
        }
      : null,
    rows: sorted,
  });
}

async function summarizeBody(row) {
  const payload = await fetchHorizonsJson(buildTruthParams(row.designation));
  const samples = parseSamples(payload.result);
  if (samples.length !== 91) {
    throw new Error(`Expected 91 truth samples for ${row.designation}, got ${samples.length}`);
  }

  let maxErrorKm = 0;
  let sumSquaredErrorKm = 0;
  let epochErrorKm = null;
  let errorAt30dKm = null;
  let errorAt60dKm = null;
  let errorAt90dKm = null;

  for (let index = 0; index < samples.length; index += 1) {
    const truth = samples[index];
    const propagated = propagateKeplerian(row.propagationInput, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    if (index === 0) epochErrorKm = errorKm;
    if (index === 30) errorAt30dKm = errorKm;
    if (index === 60) errorAt60dKm = errorKm;
    if (index === 90) errorAt90dKm = errorKm;
    maxErrorKm = Math.max(maxErrorKm, errorKm);
    sumSquaredErrorKm += errorKm * errorKm;
  }

  if (maxErrorKm > MAX_ALLOWED_ERROR_KM) {
    throw new Error(
      `${row.designation} exceeded sanity threshold with max_error_km=${maxErrorKm}`,
    );
  }

  return {
    designation: row.designation,
    name: row.name,
    class: row.class,
    H: row.H,
    band: row.band,
    a_au: row.propagationInput.a,
    e: row.propagationInput.e,
    i_deg: row.propagationInput.i,
    om_deg: row.propagationInput.om,
    w_deg: row.propagationInput.w,
    ma_deg: row.propagationInput.ma,
    anchor_epoch_tdb_jd: row.anchorEpochTdbJd,
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
  const document = await readJson(inputPath);
  const rows = document.rows;
  if (!Array.isArray(rows) || rows.length !== 200) {
    throw new Error(`Expected 200 anchor rows in ${inputPath}`);
  }

  const existingRows = await loadExistingRows();
  const byDesignation = new Map(existingRows.map((row) => [row.designation, row]));
  const results = [...existingRows];

  for (const row of rows) {
    if (byDesignation.has(row.designation)) {
      continue;
    }

    const result = await summarizeBody(row);
    results.push(result);
    byDesignation.set(result.designation, result);
    await persist(results);
    console.log(
      `measured ${result.designation} band=${result.band} max=${result.max_error_km.toFixed(3)} km rms=${result.rms_error_km.toFixed(3)} km`,
    );
    await sleep(INTER_FETCH_SLEEP_MS);
  }

  await persist(results);
  const sorted = [...results].sort((left, right) => right.max_error_km - left.max_error_km);
  console.log(`wrote ${outputPath}`);
  console.log(`rows=${sorted.length}`);
  console.log(`worst=${sorted[0].designation} max=${sorted[0].max_error_km.toFixed(3)} km`);
  console.log(`best=${sorted.at(-1).designation} max=${sorted.at(-1).max_error_km.toFixed(3)} km`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
