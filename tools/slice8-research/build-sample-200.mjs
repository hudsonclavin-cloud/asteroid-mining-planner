import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SBDB_CHEAP_PATH_THRESHOLD_JD,
  mulberry32,
  pickSampleWithoutReplacement,
  readJson,
  writeJson,
} from './common.mjs';
import { fetchHorizonsJson, parseSingleState } from './horizons.mjs';
import { cartesianToElements } from '../slice7-research/state-to-elements.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'main-belt-top-10000.json');
const outputPath = path.join(dataDir, 'sample-200.json');

const SEED = 8;
const SAMPLE_COUNT = 200;
const DECILE_COUNT = 10;
const PER_DECILE = SAMPLE_COUNT / DECILE_COUNT;
const HORIZONS_ANCHOR_JD = 2461161.5;

function radiansToDegrees(value) {
  return (value * 180) / Math.PI;
}

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

function normalizeHorizonsElements(record, elements) {
  return {
    designation: record.designation,
    name: record.name,
    H: record.H,
    class: record.class,
    decile: record.decile,
    n: null,
    a: elements.a / 149_597_870.7,
    e: elements.e,
    i: radiansToDegrees(elements.i),
    om: radiansToDegrees(elements.om),
    w: radiansToDegrees(elements.w),
    ma: radiansToDegrees(elements.ma),
    epochTdbJd: elements.epoch_tdb_jd,
    dataSource: 'horizons-2026-05-01',
    sbdbEpochTdbJd: record.epoch,
  };
}

function normalizeSbdbElements(record) {
  return {
    designation: record.designation,
    name: record.name,
    H: record.H,
    class: record.class,
    decile: record.decile,
    n: record.n,
    a: record.a,
    e: record.e,
    i: record.i,
    om: record.om,
    w: record.w,
    ma: record.ma,
    epochTdbJd: record.epoch,
    dataSource: 'sbdb',
    sbdbEpochTdbJd: record.epoch,
  };
}

async function deriveElements(record) {
  if (record.epoch >= SBDB_CHEAP_PATH_THRESHOLD_JD) {
    return normalizeSbdbElements(record);
  }

  const payload = await fetchHorizonsJson(buildAnchorParams(record.designation));
  const state = parseSingleState(payload.result);
  const elements = cartesianToElements(state);
  return normalizeHorizonsElements(record, elements);
}

async function main() {
  const top10000 = await readJson(inputPath);
  if (top10000.length !== 10_000) {
    throw new Error(`Expected 10,000 bodies in ${inputPath}, got ${top10000.length}`);
  }

  const decileSize = top10000.length / DECILE_COUNT;
  const rng = mulberry32(SEED);
  const selected = [];

  for (let decileIndex = 0; decileIndex < DECILE_COUNT; decileIndex += 1) {
    const startIndex = decileIndex * decileSize;
    const endIndex = startIndex + decileSize;
    const decileRows = top10000.slice(startIndex, endIndex).map((record) => ({
      ...record,
      decile: decileIndex + 1,
    }));
    if (decileRows.length !== decileSize) {
      throw new Error(`Decile ${decileIndex + 1} expected ${decileSize} rows, got ${decileRows.length}`);
    }
    selected.push(...pickSampleWithoutReplacement(decileRows, PER_DECILE, rng));
  }

  const sampleRows = [];
  for (const record of selected) {
    sampleRows.push(await deriveElements(record));
  }

  sampleRows.sort((left, right) =>
    left.decile - right.decile ||
    left.H - right.H ||
    Number(left.designation) - Number(right.designation),
  );

  const countsByDecile = Object.fromEntries(
    Array.from({ length: DECILE_COUNT }, (_, index) => [String(index + 1), 0]),
  );
  for (const row of sampleRows) {
    countsByDecile[String(row.decile)] += 1;
  }

  await writeJson(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    seed: SEED,
    sampleCount: sampleRows.length,
    perDecile: PER_DECILE,
    countsByDecile,
    rows: sampleRows,
  });

  const sourceCounts = sampleRows.reduce(
    (counts, row) => {
      counts[row.dataSource] = (counts[row.dataSource] ?? 0) + 1;
      return counts;
    },
    {},
  );

  console.log(`wrote ${outputPath}`);
  console.log(`sample_count=${sampleRows.length}`);
  console.log(`source_counts=${JSON.stringify(sourceCounts)}`);
  console.log(`counts_by_decile=${JSON.stringify(countsByDecile)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
