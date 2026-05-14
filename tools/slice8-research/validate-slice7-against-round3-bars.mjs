import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const barsPath = path.join(dataDir, 'inv-013-band-bars.json');
const outputPath = path.join(dataDir, 'slice7-regression-validation.json');
const slice7Path = path.join(__dirname, '..', 'slice7-research', 'data', 'keplerian-accuracy-anchored.json');

function bandForEccentricity(e) {
  if (e < 0.1) return 'A';
  if (e < 0.2) return 'B';
  if (e < 0.3) return 'C';
  return 'D';
}

async function main() {
  const bars = await readJson(barsPath);
  const slice7 = await readJson(slice7Path);

  const rows = slice7.asteroids.map((row) => {
    const band = bandForEccentricity(row.derived_elements.e);
    const barKm = bars.bands[band].derived_bar_km;
    const ratioToBar = row.max_error_km / barKm;
    return {
      designation: row.designation,
      name: row.name,
      band,
      eccentricity: row.derived_elements.e,
      slice7_max_error_km: row.max_error_km,
      round3_band_bar_km: barKm,
      ratio_to_bar: ratioToBar,
      passes: row.max_error_km <= barKm,
    };
  });

  const failing = rows.filter((row) => !row.passes);
  if (failing.length > 0) {
    throw new Error(
      `Slice 7 backward-compat failed for ${failing
        .map((row) => `${row.designation}(${row.slice7_max_error_km} > ${row.round3_band_bar_km})`)
        .join(', ')}`,
    );
  }

  const byBand = rows.reduce((acc, row) => {
    const bucket = acc[row.band] ?? [];
    bucket.push(row);
    acc[row.band] = bucket;
    return acc;
  }, {});

  const worstMarginBody = [...rows].sort((left, right) => right.ratio_to_bar - left.ratio_to_bar)[0];

  await writeJson(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    sampleCount: rows.length,
    rows,
    summary: {
      failingCount: 0,
      worstMarginBody,
      byBand: Object.fromEntries(
        Object.entries(byBand).map(([band, bucket]) => [
          band,
          {
            count: bucket.length,
            max_ratio_to_bar: Math.max(...bucket.map((row) => row.ratio_to_bar)),
          },
        ]),
      ),
    },
  });

  console.log(`wrote ${outputPath}`);
  console.log(
    `worst_margin=${worstMarginBody.designation} band=${worstMarginBody.band} ratio_to_bar=${worstMarginBody.ratio_to_bar.toFixed(4)}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
