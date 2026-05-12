import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'keplerian-accuracy-200.json');
const outputPath = path.join(dataDir, 'inv-013-band-analysis.json');

const BANDS = [
  { key: 'A', label: 'e < 0.1', min: 0, max: 0.1, inclusiveMax: false },
  { key: 'B', label: '0.1 <= e < 0.2', min: 0.1, max: 0.2, inclusiveMax: false },
  { key: 'C', label: '0.2 <= e < 0.3', min: 0.2, max: 0.3, inclusiveMax: false },
  { key: 'D', label: 'e >= 0.3', min: 0.3, max: Infinity, inclusiveMax: true },
];

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

function summarizeBand(rows, band) {
  const values = rows.map((row) => row.max_error_km).sort((left, right) => left - right);
  const maxErrorKm = values.at(-1);
  const meanMaxErrorKm = values.reduce((sum, value) => sum + value, 0) / values.length;
  const rmsOfMaxErrorKm = Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0) / values.length,
  );
  const p95ErrorKm = quantile(values, 0.95);
  return {
    key: band.key,
    label: band.label,
    count: rows.length,
    max_error_km: maxErrorKm,
    mean_max_error_km: meanMaxErrorKm,
    rms_max_error_km: rmsOfMaxErrorKm,
    p95_error_km: p95ErrorKm,
    suggested_bar_km: p95ErrorKm * 2,
    insufficient_sample: rows.length < 10,
    worst_body: {
      designation: rows.reduce((worst, row) => (row.max_error_km > worst.max_error_km ? row : worst)).designation,
      max_error_km: maxErrorKm,
    },
  };
}

function rowsForBand(rows, band) {
  return rows.filter((row) =>
    row.e >= band.min && (band.max === Infinity ? true : row.e < band.max),
  );
}

async function main() {
  const accuracy = await readJson(inputPath);
  const rows = accuracy.rows;
  if (!Array.isArray(rows) || rows.length !== 200) {
    throw new Error(`Expected 200 rows in ${inputPath}`);
  }

  const summaries = BANDS.map((band) => summarizeBand(rowsForBand(rows, band), band));
  const insufficientBands = summaries.filter((summary) => summary.insufficient_sample);

  const output = {
    generatedAtUtc: new Date().toISOString(),
    sourcePath: path.relative(process.cwd(), inputPath),
    sampleCount: rows.length,
    bands: summaries,
    insufficientBands: insufficientBands.map((band) => ({
      key: band.key,
      label: band.label,
      count: band.count,
    })),
  };

  await writeJson(outputPath, output);

  for (const summary of summaries) {
    console.log(
      `${summary.key} ${summary.label} count=${summary.count} max=${summary.max_error_km.toFixed(3)} ` +
        `p95=${summary.p95_error_km.toFixed(3)} suggested_bar=${summary.suggested_bar_km.toFixed(3)} ` +
        `insufficient_sample=${summary.insufficient_sample}`,
    );
  }
  if (insufficientBands.length) {
    console.log(`insufficient_bands=${JSON.stringify(output.insufficientBands)}`);
  }
  console.log(`wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
