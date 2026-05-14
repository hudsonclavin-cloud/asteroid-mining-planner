import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  mulberry32,
  pickSampleWithoutReplacement,
  readJson,
  writeJson,
} from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'main-belt-top-10000.json');
const outputPath = path.join(dataDir, 'sample-200-eccentricity.json');

const SEED = 8;
const TARGET_PER_BAND = 50;
const DECILE_COUNT = 10;
const TARGET_PER_DECILE = 5;

function getBand(record) {
  if (record.e < 0.1) return 'A';
  if (record.e < 0.2) return 'B';
  if (record.e < 0.3) return 'C';
  return 'D';
}

function sortByBrightness(left, right) {
  return (
    left.H - right.H ||
    Number(left.designation) - Number(right.designation)
  );
}

function splitIntoDeciles(records) {
  const deciles = [];
  for (let index = 0; index < DECILE_COUNT; index += 1) {
    const start = Math.floor((index * records.length) / DECILE_COUNT);
    const end = Math.floor(((index + 1) * records.length) / DECILE_COUNT);
    deciles.push(
      records.slice(start, end).map((record) => ({
        ...record,
        hDecileWithinBand: index + 1,
      })),
    );
  }
  return deciles;
}

function makeOutputRow(record) {
  return {
    designation: record.designation,
    name: record.name,
    H: record.H,
    class: record.class,
    a: record.a,
    e: record.e,
    i: record.i,
    om: record.om,
    w: record.w,
    ma: record.ma,
    sbdb_epoch_jd: record.epoch,
    band: record.band,
    hDecileWithinBand: record.hDecileWithinBand,
  };
}

function sampleBand(records, rng) {
  if (records.length < TARGET_PER_BAND) {
    return records.map(makeOutputRow);
  }

  const sorted = [...records].sort(sortByBrightness);
  const deciles = splitIntoDeciles(sorted);
  const selected = [];
  const leftovers = [];

  for (const decileRows of deciles) {
    const takeCount = Math.min(TARGET_PER_DECILE, decileRows.length);
    const chosen = pickSampleWithoutReplacement(decileRows, takeCount, rng);
    const chosenSet = new Set(chosen.map((record) => record.designation));
    selected.push(...chosen);
    leftovers.push(
      ...decileRows.filter((record) => !chosenSet.has(record.designation)),
    );
  }

  if (selected.length < TARGET_PER_BAND) {
    selected.push(
      ...pickSampleWithoutReplacement(
        leftovers,
        TARGET_PER_BAND - selected.length,
        rng,
      ),
    );
  }

  return selected.map(makeOutputRow).sort(sortByBrightness);
}

async function main() {
  const records = await readJson(inputPath);
  if (!Array.isArray(records) || records.length !== 10_000) {
    throw new Error(`Expected 10,000 records in ${inputPath}`);
  }

  const bandPools = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  for (const record of records) {
    const band = getBand(record);
    bandPools[band].push({ ...record, band });
  }

  if (bandPools.D.length < 30) {
    throw new Error(
      `Band D has only ${bandPools.D.length} bodies in Top 10,000; rescoping required.`,
    );
  }

  const rng = mulberry32(SEED);
  const selectedRows = [
    ...sampleBand(bandPools.A, rng),
    ...sampleBand(bandPools.B, rng),
    ...sampleBand(bandPools.C, rng),
    ...sampleBand(bandPools.D, rng),
  ].sort((left, right) => {
    const bandOrder = left.band.localeCompare(right.band);
    return bandOrder || sortByBrightness(left, right);
  });

  const countsByBand = selectedRows.reduce(
    (counts, row) => {
      counts[row.band] = (counts[row.band] ?? 0) + 1;
      return counts;
    },
    { A: 0, B: 0, C: 0, D: 0 },
  );

  const countsByBandDecile = selectedRows.reduce((counts, row) => {
    const key = `${row.band}${row.hDecileWithinBand}`;
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  await writeJson(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    seed: SEED,
    targetPerBand: TARGET_PER_BAND,
    countsInTop10000ByBand: {
      A: bandPools.A.length,
      B: bandPools.B.length,
      C: bandPools.C.length,
      D: bandPools.D.length,
    },
    sampledCountsByBand: countsByBand,
    sampledCountsByBandDecile: countsByBandDecile,
    rows: selectedRows,
  });

  console.log(`wrote ${outputPath}`);
  console.log(`total=${selectedRows.length}`);
  console.log(`top10000_counts_by_band=${JSON.stringify({
    A: bandPools.A.length,
    B: bandPools.B.length,
    C: bandPools.C.length,
    D: bandPools.D.length,
  })}`);
  console.log(`sampled_counts_by_band=${JSON.stringify(countsByBand)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
