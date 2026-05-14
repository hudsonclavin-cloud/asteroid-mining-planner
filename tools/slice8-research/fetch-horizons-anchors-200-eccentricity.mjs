import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, sleep, writeJson } from './common.mjs';
import { fetchHorizonsJson, parseSingleState } from './horizons.mjs';
import {
  cartesianToElements,
  elementsRadiansKmToPropagationInput,
  elementsToCartesianAtEpoch,
} from '../slice7-research/state-to-elements.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'sample-200-eccentricity.json');
const outputPath = path.join(dataDir, 'horizons-anchors-200-eccentricity.json');

const HORIZONS_ANCHOR_JD = 2461161.5;
const INTER_FETCH_SLEEP_MS = 3_000;

function buildAnchorParams(designation) {
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
    TLIST: String(HORIZONS_ANCHOR_JD),
  };
}

function assertFiniteVector(values, label, designation) {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new Error(`${designation} has non-finite ${label} value`);
    }
  }
}

function toOutputRow(record, state, elements) {
  return {
    designation: record.designation,
    name: record.name,
    H: record.H,
    class: record.class,
    band: record.band,
    sbdb_epoch_jd: record.sbdb_epoch_jd,
    anchorEpochTdbJd: state.epoch_tdb_jd,
    anchorPositionKm: state.position_km,
    anchorVelocityKmPerS: state.velocity_km_per_s,
    elementsAtAnchor: {
      a_km: elements.a,
      e: elements.e,
      i_rad: elements.i,
      om_rad: elements.om,
      w_rad: elements.w,
      ma_rad: elements.ma,
      epoch_tdb_jd: elements.epoch_tdb_jd,
    },
  };
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
  await writeJson(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    anchorEpochTdbJd: HORIZONS_ANCHOR_JD,
    sampleCount: rows.length,
    rows,
  });
}

async function main() {
  const sample = await readJson(inputPath);
  const records = sample.rows;
  if (!Array.isArray(records) || records.length !== 200) {
    throw new Error(`Expected 200 sample rows in ${inputPath}`);
  }

  const existingRows = await loadExistingRows();
  const byDesignation = new Map(existingRows.map((row) => [row.designation, row]));
  const rows = [...existingRows];

  for (const record of records) {
    if (byDesignation.has(record.designation)) {
      continue;
    }

    const payload = await fetchHorizonsJson(buildAnchorParams(record.designation));
    const state = parseSingleState(payload.result);
    assertFiniteVector(state.position_km, 'position', record.designation);
    assertFiniteVector(state.velocity_km_per_s, 'velocity', record.designation);

    const elements = cartesianToElements(state);
    const roundTrip = elementsToCartesianAtEpoch(elements);
    const propagationInput = elementsRadiansKmToPropagationInput(elements);

    const row = toOutputRow(record, state, elements);
    row.roundTripErrorKm = Math.hypot(
      roundTrip.position_km.x - state.position_km[0],
      roundTrip.position_km.y - state.position_km[1],
      roundTrip.position_km.z - state.position_km[2],
    );
    row.propagationInput = propagationInput;

    rows.push(row);
    byDesignation.set(row.designation, row);
    await persist(rows.sort((left, right) => Number(left.designation) - Number(right.designation)));

    console.log(
      `fetched ${record.designation} band=${record.band} anchorEpoch=${state.epoch_tdb_jd} roundTripErrorKm=${row.roundTripErrorKm}`,
    );
    await sleep(INTER_FETCH_SLEEP_MS);
  }

  const finalRows = rows.sort((left, right) => Number(left.designation) - Number(right.designation));
  await persist(finalRows);
  console.log(`wrote ${outputPath}`);
  console.log(`rows=${finalRows.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
