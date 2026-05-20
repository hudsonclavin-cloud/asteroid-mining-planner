import fs from 'node:fs/promises';
import path from 'node:path';

import { readJson, writeJsonAtomic } from '../slice9-research/common.mjs';

const INGESTION_ROOT = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(INGESTION_ROOT, '..', '..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const TMP_PATH = `${FIXTURE_PATH}.tmp`;
const ANOMALY_TAIL_CLASSES = new Set(['ETC', 'HTC', 'JFC']);

function recomputeCatalogSummaries(fixture) {
  const classDistribution = new Map();
  const tierDistribution = new Map([
    ['visualization-tier', 0],
    ['planning-tier', 0],
    ['not-kepler-safe', 0],
  ]);
  let missingAbsoluteMagnitudeCount = 0;
  let anomalyTailCount = 0;

  for (const record of Object.values(fixture.asteroids)) {
    classDistribution.set(record.orbitClass, (classDistribution.get(record.orbitClass) ?? 0) + 1);
    tierDistribution.set(record.inv014Tier, (tierDistribution.get(record.inv014Tier) ?? 0) + 1);
    if (record.H === null) {
      missingAbsoluteMagnitudeCount += 1;
    }
    if (ANOMALY_TAIL_CLASSES.has(record.orbitClass)) {
      anomalyTailCount += 1;
    }
  }

  fixture.catalog.classDistribution = Object.fromEntries(
    [...classDistribution.entries()].sort(([left], [right]) =>
      String(left).localeCompare(String(right), 'en', { numeric: true }),
    ),
  );
  fixture.catalog.inv014TierDistribution = {
    'visualization-tier': tierDistribution.get('visualization-tier') ?? 0,
    'planning-tier': tierDistribution.get('planning-tier') ?? 0,
    'not-kepler-safe': tierDistribution.get('not-kepler-safe') ?? 0,
  };
  fixture.catalog.missingAbsoluteMagnitudeCount = missingAbsoluteMagnitudeCount;
  fixture.catalog.anomalyTailCount = anomalyTailCount;
}

async function main() {
  const fixture = await readJson(FIXTURE_PATH);
  let anomalyTailCount = 0;
  let alreadyNotSafe = 0;
  let retagged = 0;

  for (const record of Object.values(fixture.asteroids)) {
    if (!ANOMALY_TAIL_CLASSES.has(record.orbitClass)) continue;
    anomalyTailCount += 1;
    if (record.inv014Tier === 'not-kepler-safe') {
      alreadyNotSafe += 1;
      continue;
    }
    record.inv014Tier = 'not-kepler-safe';
    retagged += 1;
  }

  recomputeCatalogSummaries(fixture);
  await writeJsonAtomic(TMP_PATH, fixture);
  await fs.rename(TMP_PATH, FIXTURE_PATH);

  console.log(
    JSON.stringify(
      {
        anomalyTailCount,
        alreadyNotSafe,
        retagged,
        inv014TierDistribution: fixture.catalog.inv014TierDistribution,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
