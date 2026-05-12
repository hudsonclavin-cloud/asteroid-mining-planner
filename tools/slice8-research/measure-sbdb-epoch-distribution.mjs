import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SBDB_CHEAP_PATH_THRESHOLD_JD,
  SBDB_CHEAP_PATH_THRESHOLD_LABEL,
  readJson,
  writeJson,
} from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'main-belt-top-10000.json');
const outputPath = path.join(dataDir, 'sbdb-epoch-distribution.json');

function jdToUnixMs(jd) {
  return (jd - 2440587.5) * 86_400_000;
}

function jdToIsoDate(jd) {
  return new Date(jdToUnixMs(jd)).toISOString().slice(0, 10);
}

function jdToUtcYear(jd) {
  return new Date(jdToUnixMs(jd)).getUTCFullYear();
}

function quantile(sortedValues, p) {
  if (!sortedValues.length) return null;
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sortedValues[lower];
  }
  const fraction = index - lower;
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * fraction;
}

async function main() {
  const bodies = await readJson(inputPath);
  if (bodies.length !== 10_000) {
    throw new Error(`Expected 10,000 bodies in ${inputPath}, got ${bodies.length}`);
  }

  const sortedEpochs = bodies.map((body) => body.epoch).sort((left, right) => left - right);
  const histogramByYear = {};
  let cheapPathCount = 0;
  let horizonsPathCount = 0;
  let epochSum = 0;

  for (const body of bodies) {
    if (!Number.isFinite(body.epoch)) {
      throw new Error(`Non-finite epoch for ${body.designation}`);
    }
    epochSum += body.epoch;
    const year = String(jdToUtcYear(body.epoch));
    histogramByYear[year] = (histogramByYear[year] ?? 0) + 1;
    if (body.epoch >= SBDB_CHEAP_PATH_THRESHOLD_JD) {
      cheapPathCount += 1;
    } else {
      horizonsPathCount += 1;
    }
  }

  const oldestRecord = bodies.reduce((oldest, body) => (body.epoch < oldest.epoch ? body : oldest));
  const newestRecord = bodies.reduce((newest, body) => (body.epoch > newest.epoch ? body : newest));

  const output = {
    generatedAtUtc: new Date().toISOString(),
    sourcePath: path.relative(process.cwd(), inputPath),
    bodyCount: bodies.length,
    cheapPathThreshold: {
      jdTdb: SBDB_CHEAP_PATH_THRESHOLD_JD,
      label: SBDB_CHEAP_PATH_THRESHOLD_LABEL,
    },
    histogramByYear,
    counts: {
      cheapPath: cheapPathCount,
      horizonsPath: horizonsPathCount,
      total: bodies.length,
    },
    summary: {
      meanEpochJdTdb: epochSum / bodies.length,
      meanEpochDateUtc: jdToIsoDate(epochSum / bodies.length),
      medianEpochJdTdb: quantile(sortedEpochs, 0.5),
      medianEpochDateUtc: jdToIsoDate(quantile(sortedEpochs, 0.5)),
      p05EpochJdTdb: quantile(sortedEpochs, 0.05),
      p95EpochJdTdb: quantile(sortedEpochs, 0.95),
      oldestEpochJdTdb: oldestRecord.epoch,
      oldestEpochDateUtc: jdToIsoDate(oldestRecord.epoch),
      oldestDesignation: oldestRecord.designation,
      newestEpochJdTdb: newestRecord.epoch,
      newestEpochDateUtc: jdToIsoDate(newestRecord.epoch),
      newestDesignation: newestRecord.designation,
    },
  };

  await writeJson(outputPath, output);

  console.log(`wrote ${outputPath}`);
  console.log(`cheap_path=${cheapPathCount}`);
  console.log(`horizons_path=${horizonsPathCount}`);
  console.log(`median_epoch=${output.summary.medianEpochDateUtc}`);
  console.log(`oldest_epoch=${output.summary.oldestEpochDateUtc} ${oldestRecord.designation}`);
  console.log(`newest_epoch=${output.summary.newestEpochDateUtc} ${newestRecord.designation}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
