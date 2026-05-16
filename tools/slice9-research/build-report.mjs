import path from 'node:path';

import { DATA_DIR, readJson, writeTextAtomic } from './common.mjs';

const sbdbSummaryPath = path.join(DATA_DIR, 'sbdb-nea-summary.json');
const occupancyPath = path.join(DATA_DIR, 'occupancy-summary.json');
const inv014Path = path.join(DATA_DIR, 'inv014-sample-results.json');
const outputPath = path.join(path.dirname(DATA_DIR), 'SLICE_9_PRERESEARCH_REPORT.md');

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined) return 'n/a';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function tableFromObject(title, object) {
  const rows = Object.entries(object)
    .map(([key, value]) => `| ${key} | ${formatNumber(value)} |`)
    .join('\n');
  return `### ${title}\n\n| Bucket | Count |\n| --- | ---: |\n${rows}\n`;
}

function occupancyTable(rows) {
  const bodyRows = rows
    .map(
      (row) =>
        `| ${row.cellSizeAu} | ${formatNumber(row.occupiedCellCount)} | ${formatNumber(row.maxBodiesPerCell)} | ${formatNumber(row.medianBodiesPerCell, 1)} | ${formatNumber(row.p90BodiesPerCell, 1)} | ${formatNumber(row.fractionOfBodiesInDensestTenCells * 100, 1)}% |`,
    )
    .join('\n');
  return `| Cell size (AU) | Occupied cells | Max / cell | Median / cell | p90 / cell | Bodies in densest 10 cells |\n| ---: | ---: | ---: | ---: | ---: | ---: |\n${bodyRows}`;
}

function qualityThresholdTable(rows) {
  const bodyRows = rows
    .map(
      (row) =>
        `| ≤ ${row.maxConditionCode} | ≥ ${row.minDataArcDays} | ${formatNumber(row.keptCount)} | ${formatNumber(row.excludedCount)} |`,
    )
    .join('\n');
  return `| condition_code | data_arc days | Kept | Excluded |\n| ---: | ---: | ---: | ---: |\n${bodyRows}`;
}

function markdownForStratumSummary(summary) {
  const rows = Object.entries(summary)
    .map(
      ([key, value]) =>
        `| ${key} | ${formatNumber(value.count)} | ${formatNumber(value.median, 1)} | ${formatNumber(value.p90, 1)} | ${formatNumber(value.p95, 1)} | ${formatNumber(value.max, 1)} |`,
    )
    .join('\n');
  return `| Stratum | Count | Median max error km | p90 km | p95 km | Max km |\n| --- | ---: | ---: | ---: | ---: | ---: |\n${rows}`;
}

function markdownForWorstBodies(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.designation} | ${row.orbitClass} | ${row.eccentricityBand} | ${row.closeApproachFlag ? 'yes' : 'no'} | ${row.cadBodiesTriggered.join(', ') || 'none'} | ${formatNumber(row.maxErrorKm, 1)} |`,
    )
    .join('\n');
}

function encounterRecommendation(encounterSummary) {
  const flagged = encounterSummary['encounter-flagged'];
  const unflagged = encounterSummary['not-flagged'];
  if (!flagged || !unflagged) {
    return 'The bounded sample did not populate both encounter-flag states strongly enough to treat the close-approach flag as a standalone INV-014 tier predictor. Scoping should treat encounter-in-window as one explanatory feature, not as a sole boundary rule.';
  }

  const flaggedMedian = flagged.median ?? 0;
  const unflaggedMedian = unflagged.median ?? 0;
  const flaggedP95 = flagged.p95 ?? 0;
  const unflaggedP95 = unflagged.p95 ?? 0;

  if (flaggedMedian > unflaggedMedian * 1.5 || flaggedP95 > unflaggedP95 * 1.5) {
    return 'Encounter-flagged bodies show materially worse Keplerian error than the non-flagged split in this sample. Scoping should derive INV-014 tier boundaries from the encounter split plus the eccentricity-band tail behavior, rather than from eccentricity alone.';
  }

  return 'Encounter-in-window did not cleanly separate the sample into high-error and low-error populations. Scoping should derive INV-014 tiers from the measured error distributions themselves, with encounter-flag carried as a caution signal rather than a clean classifier.';
}

async function main() {
  const sbdbSummary = await readJson(sbdbSummaryPath);
  const occupancy = await readJson(occupancyPath);
  const inv014 = await readJson(inv014Path);

  const markdown = `# Slice 9 Pre-Research Report

## Scope

This dispatch is data only. It does not choose Slice 9 architecture, build a fixture, touch \`src/v2/\`, or publish anything. It exists to answer the two open scoping questions:

- \`OQ-1\`: real NEA spatial occupancy at catalog scale
- \`OQ-6\`: what evidence the future INV-014 tier boundaries should be derived from

## Task 1 — Live SBDB NEA Catalog

- live NEA count: \`${formatNumber(sbdbSummary.count)}\`
- source: JPL SBDB query API with \`sb-group=neo\`

${tableFromObject('Class Distribution', sbdbSummary.classDistribution)}

${tableFromObject('Condition Code Histogram', sbdbSummary.conditionCodeHistogram)}

${tableFromObject('Data-Arc Histogram', sbdbSummary.dataArcBucketHistogram)}

Additional quality notes:

- missing / degenerate element rows: \`${formatNumber(sbdbSummary.missingOrDegenerateCount)}\`
- missing \`H\`: \`${formatNumber(sbdbSummary.missingHCount)}\`

Candidate exclusion-count table (reported only; no threshold chosen):

${qualityThresholdTable(sbdbSummary.candidateQualityThresholds)}

## Task 2 — Spatial Occupancy at Common Epoch

- common epoch: \`${occupancy.commonEpochLabel}\`
- propagatable rows: \`${formatNumber(occupancy.propagatableRowCount)}\`
- excluded rows at this stage: \`${formatNumber(occupancy.excludedRowCount)}\`

${occupancyTable(occupancy.occupancyTable)}

Heliocentric distance distribution at the common epoch:

- min: \`${formatNumber(occupancy.heliocentricDistanceKm.min, 1)} km\`
- median: \`${formatNumber(occupancy.heliocentricDistanceKm.median, 1)} km\`
- p90: \`${formatNumber(occupancy.heliocentricDistanceKm.p90, 1)} km\`
- p95: \`${formatNumber(occupancy.heliocentricDistanceKm.p95, 1)} km\`
- max: \`${formatNumber(occupancy.heliocentricDistanceKm.max, 1)} km\`

Axis extents in the renderer's ICRF scene frame:

- X: \`${formatNumber(occupancy.axisExtentKm.minXKm, 1)} .. ${formatNumber(occupancy.axisExtentKm.maxXKm, 1)} km\`
- Y: \`${formatNumber(occupancy.axisExtentKm.minYKm, 1)} .. ${formatNumber(occupancy.axisExtentKm.maxYKm, 1)} km\`
- Z: \`${formatNumber(occupancy.axisExtentKm.minZKm, 1)} .. ${formatNumber(occupancy.axisExtentKm.maxZKm, 1)} km\`

## Task 3 — INV-014 Bounded Accuracy Sample

- sample seed: \`${inv014.sampleSeed}\`
- sample count: \`${formatNumber(inv014.summary.sampleCount)}\`
- common Horizons anchor epoch: \`${inv014.commonEpochLabel}\`
- CAD close-approach window: \`${inv014.closeApproachWindow.start}\` to \`${inv014.closeApproachWindow.stop}\`
- CAD bodies checked: \`${inv014.closeApproachWindow.bodies.join(', ')}\`
- CAD distance threshold: \`${inv014.closeApproachWindow.distMaxAu} au\`

Per-class x eccentricity-band x encounter-flag distribution:

${markdownForStratumSummary(inv014.summary.stratumSummary)}

Encounter-flag split only:

${markdownForStratumSummary(inv014.summary.encounterSummary)}

Worst sampled bodies:

| Designation | Class | E-band | Encounter-flagged | Bodies triggered | Max km |
| --- | --- | --- | --- | --- | ---: |
${markdownForWorstBodies(inv014.summary.worstBodies)}

Evidence for future INV-014 tier derivation:

- ${encounterRecommendation(inv014.summary.encounterSummary)}
- The future visual-grade tier should be derived from the measured distribution tails in these sampled strata, not from planning guesses.
- The future "not Kepler-safe" threshold should be set during scoping from the measured worst-case tails plus the encounter diagnostics above, not from a fixed eccentricity cutoff alone.

## OPEN — FOR SCOPING

These decisions remain open by design. This dispatch provides the numbers but does not decide them.

1. \`OQ-1\` spatial partitioning choice
   - data now in hand: occupied-cell counts, densest-cell load, median/p90 occupancy, and heliocentric spatial extent for \`0.25 / 0.5 / 1.0 / 2.0 AU\` bins
   - scoping still decides: uniform-grid cell size vs alternative structure, and final scene bounds

2. \`OQ-6\` INV-014 tier design
   - data now in hand: stratified 90-day Kepler-vs-Horizons errors by class, eccentricity band, and encounter flag
   - scoping still decides: the actual numeric tier boundaries and whether encounter-in-window is a primary boundary signal or a secondary caution flag

## Anomalies / Notes

- This report intentionally does not build a Slice 9 fixture or any renderer code.
- Correct top-down expectations from Slice 8.5 carry forward: a physically correct orbit batch can look ring-like without being a perfect circle.
- If future scoping wants a stricter or broader close-approach definition than the CAD \`0.05 au\` window used here, that should be an explicit DEC, not an implicit measurement-script tweak.
`;

  await writeTextAtomic(outputPath, `${markdown}\n`);
  console.log(`wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});

