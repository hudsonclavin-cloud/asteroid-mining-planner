import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const inputPath = path.join(dataDir, 'main-belt-top-10000.json');
const outputPath = path.join(dataDir, 'h-threshold-analysis.json');

function histogram(values, binWidth = 0.25) {
  const counts = new Map();
  for (const value of values) {
    const bucketStart = Math.floor(value / binWidth) * binWidth;
    const label = `${bucketStart.toFixed(2)}-${(bucketStart + binWidth).toFixed(2)}`;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  const rows = await readJson(inputPath);
  if (!Array.isArray(rows) || rows.length !== 10_000) {
    throw new Error(`Expected 10,000 rows in ${inputPath}`);
  }

  const Hs = rows.map((row) => row.H);
  const output = {
    generatedAtUtc: new Date().toISOString(),
    sampleCount: rows.length,
    thresholds: {
      top500_h_lt: rows[499].H,
      top1000_h_lt: rows[999].H,
      top1500_h_lt: rows[1499].H,
      top2000_h_lt: rows[1999].H,
    },
    bodiesAtThresholds: {
      top500: {
        designation: rows[499].designation,
        name: rows[499].name,
        H: rows[499].H,
      },
      top1000: {
        designation: rows[999].designation,
        name: rows[999].name,
        H: rows[999].H,
      },
      top1500: {
        designation: rows[1499].designation,
        name: rows[1499].name,
        H: rows[1499].H,
      },
      top2000: {
        designation: rows[1999].designation,
        name: rows[1999].name,
        H: rows[1999].H,
      },
    },
    histogram: histogram(Hs),
  };

  await writeJson(outputPath, output);
  console.log(`wrote ${outputPath}`);
  console.log(`top500_h_lt=${output.thresholds.top500_h_lt}`);
  console.log(`top1000_h_lt=${output.thresholds.top1000_h_lt}`);
  console.log(`top1500_h_lt=${output.thresholds.top1500_h_lt}`);
  console.log(`top2000_h_lt=${output.thresholds.top2000_h_lt}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
