import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const accuracyPath = path.join(dataDir, 'keplerian-accuracy-200-eccentricity.json');
const outputPath = path.join(dataDir, 'inv-013-band-bars.json');
const slice7Path = path.join(__dirname, '..', 'slice7-research', 'data', 'keplerian-accuracy-anchored.json');

const BAND_ORDER = ['A', 'B', 'C', 'D'];
const BAND_LABELS = {
  A: 'e < 0.1',
  B: '0.1 ≤ e < 0.2',
  C: '0.2 ≤ e < 0.3',
  D: 'e ≥ 0.3',
};

function bandForEccentricity(e) {
  if (e < 0.1) return 'A';
  if (e < 0.2) return 'B';
  if (e < 0.3) return 'C';
  return 'D';
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

function summarizeBand(rows) {
  const errors = rows.map((row) => row.max_error_km);
  const sorted = [...errors].sort((a, b) => a - b);
  return {
    count: rows.length,
    min_error_km: sorted[0],
    median_error_km: percentile(errors, 0.5),
    max_error_km: sorted.at(-1),
    p50_error_km: percentile(errors, 0.5),
    p75_error_km: percentile(errors, 0.75),
    p95_error_km: percentile(errors, 0.95),
    p99_error_km: percentile(errors, 0.99),
  };
}

function recommendationForBand(band, summary, adjacentSummary, slice7ConstraintMaxError) {
  const p95x2 = summary.p95_error_km * 2;
  const tailRatio = summary.max_error_km / Math.max(summary.p95_error_km, 1e-9);
  const adjacentSimilar =
    adjacentSummary &&
    Math.max(summary.median_error_km, adjacentSummary.median_error_km) /
      Math.min(summary.median_error_km, adjacentSummary.median_error_km) <
      1.2 &&
    Math.max(summary.p95_error_km, adjacentSummary.p95_error_km) /
      Math.min(summary.p95_error_km, adjacentSummary.p95_error_km) <
      1.2;

  if (tailRatio > 3) {
    return 'Keep separate: upper-tail error distribution is materially broader than the band core.';
  }

  if (adjacentSimilar && slice7ConstraintMaxError === 0) {
    return 'Adjacent band statistics are similar; merging could be considered in a future larger-sample pass.';
  }

  if (adjacentSimilar && slice7ConstraintMaxError > 0) {
    return 'Numerically similar to an adjacent band, but keep separate for now because Slice 7 backward-compat constraints differ by band.';
  }

  if (p95x2 < 75_000) {
    return 'Current sample supports a sub-75,000 km bar with margin.';
  }

  return 'No merge/split recommendation from current sample; keep the tentative band boundary.';
}

async function main() {
  const round3 = await readJson(accuracyPath);
  const slice7 = await readJson(slice7Path);

  const round3Bands = new Map(BAND_ORDER.map((band) => [band, []]));
  for (const row of round3.rows) {
    round3Bands.get(row.band).push(row);
  }

  const slice7Bands = new Map(BAND_ORDER.map((band) => [band, []]));
  for (const row of slice7.asteroids) {
    const band = bandForEccentricity(row.derived_elements.e);
    slice7Bands.get(band).push({
      designation: row.designation,
      name: row.name,
      max_error_km: row.max_error_km,
      eccentricity: row.derived_elements.e,
    });
  }

  const results = {};
  for (let index = 0; index < BAND_ORDER.length; index += 1) {
    const band = BAND_ORDER[index];
    const rows = round3Bands.get(band);
    const summary = summarizeBand(rows);
    const slice7ConstraintRows = slice7Bands.get(band);
    const slice7ConstraintMaxError = slice7ConstraintRows.length
      ? Math.max(...slice7ConstraintRows.map((row) => row.max_error_km))
      : 0;
    const slice7LowerBound = slice7ConstraintMaxError * 1.5;
    const p95Times2 = summary.p95_error_km * 2;
    const derivedBar = Math.max(p95Times2, slice7LowerBound);
    const adjacentBand = BAND_ORDER[index + 1] ?? null;
    const adjacentSummary =
      adjacentBand && round3Bands.get(adjacentBand).length
        ? summarizeBand(round3Bands.get(adjacentBand))
        : null;

    results[band] = {
      band,
      bandLabel: BAND_LABELS[band],
      ...summary,
      slice7_constraint_bodies_in_band: slice7ConstraintRows,
      slice7_constraint_max_error_km: slice7ConstraintMaxError,
      slice7_constraint_lower_bound_km: slice7LowerBound,
      p95_times_2_km: p95Times2,
      derived_bar_km: derivedBar,
      recommendation: recommendationForBand(
        band,
        summary,
        adjacentSummary,
        slice7ConstraintMaxError,
      ),
    };
  }

  await writeJson(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    methodology: 'derived_bar_km = max(p95_error_km * 2, slice7_constraint_max_error_km * 1.5)',
    bands: results,
  });

  console.log(`wrote ${outputPath}`);
  for (const band of BAND_ORDER) {
    const entry = results[band];
    console.log(
      `${band} count=${entry.count} p95=${entry.p95_error_km.toFixed(3)}km slice7Floor=${entry.slice7_constraint_lower_bound_km.toFixed(3)}km derived=${entry.derived_bar_km.toFixed(3)}km`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
