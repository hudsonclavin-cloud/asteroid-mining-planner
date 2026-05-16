import path from 'node:path';

import {
  CAD_API_URL,
  DATA_DIR,
  SBDB_QUERY_URL,
  buildUrl,
  bucketDataArcDays,
  fetchJson,
  incrementCount,
  normalizeSbdbRows,
  toSortedObject,
  writeJsonAtomic,
} from './common.mjs';

const outputRawPath = path.join(DATA_DIR, 'sbdb-nea-raw.json');
const outputSummaryPath = path.join(DATA_DIR, 'sbdb-nea-summary.json');

const SBDB_FIELDS = [
  'spkid',
  'pdes',
  'full_name',
  'class',
  'e',
  'a',
  'i',
  'om',
  'w',
  'ma',
  'epoch',
  'condition_code',
  'data_arc',
  'n_obs_used',
  'H',
  'sigma_a',
  'sigma_e',
].join(',');

function summarizeQuality(rows) {
  const classCounts = new Map();
  const conditionCounts = new Map();
  const dataArcCounts = new Map();
  let missingOrDegenerate = 0;
  let missingH = 0;

  for (const row of rows) {
    incrementCount(classCounts, row.orbitClass);
    incrementCount(conditionCounts, row.conditionCode === null ? 'missing' : String(row.conditionCode));
    incrementCount(dataArcCounts, bucketDataArcDays(row.dataArcDays));
    if (row.hasDegenerateElements) {
      missingOrDegenerate += 1;
    }
    if (row.hAbsMag === null) {
      missingH += 1;
    }
  }

  const candidateThresholds = [];
  for (const maxConditionCode of [3, 5, 7]) {
    for (const minDataArcDays of [7, 30]) {
      const keptCount = rows.filter((row) => {
        if (row.hasDegenerateElements) return false;
        if (row.conditionCode === null || row.conditionCode > maxConditionCode) return false;
        if (row.dataArcDays === null || row.dataArcDays < minDataArcDays) return false;
        return true;
      }).length;
      candidateThresholds.push({
        maxConditionCode,
        minDataArcDays,
        keptCount,
        excludedCount: rows.length - keptCount,
      });
    }
  }

  return {
    classDistribution: toSortedObject(classCounts),
    conditionCodeHistogram: toSortedObject(conditionCounts),
    dataArcBucketHistogram: toSortedObject(dataArcCounts),
    missingOrDegenerateCount: missingOrDegenerate,
    missingHCount: missingH,
    candidateQualityThresholds: candidateThresholds,
  };
}

async function main() {
  const url = buildUrl(SBDB_QUERY_URL, {
    fields: SBDB_FIELDS,
    'sb-group': 'neo',
    'full-prec': 'true',
  });
  const payload = await fetchJson(url);
  if (!Array.isArray(payload.data) || !Array.isArray(payload.fields)) {
    throw new Error('Unexpected SBDB payload shape for full NEO query');
  }

  const rows = normalizeSbdbRows(payload);
  const summary = summarizeQuality(rows);

  await writeJsonAtomic(outputRawPath, payload);
  await writeJsonAtomic(outputSummaryPath, {
    generatedAtUtc: new Date().toISOString(),
    source: SBDB_QUERY_URL,
    count: rows.length,
    fields: payload.fields,
    ...summary,
  });

  console.log(`wrote ${outputRawPath}`);
  console.log(`wrote ${outputSummaryPath}`);
  console.log(`neaCount=${rows.length}`);
  console.log(`classDistribution=${JSON.stringify(summary.classDistribution)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});

