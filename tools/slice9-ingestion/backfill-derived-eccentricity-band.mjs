import path from 'node:path';

import { readJson, writeJsonAtomic } from '../slice9-research/common.mjs';

const INGESTION_ROOT = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(INGESTION_ROOT, '..', '..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const DIAGNOSTIC_SUMMARY_PATH = path.join(REPO_ROOT, 'tools', 'slice9-diagnostic', 'derived-fields-summary.json');

function eccentricityBandForBody(eccentricity) {
  if (eccentricity < 0.1) return 'A';
  if (eccentricity < 0.2) return 'B';
  if (eccentricity < 0.3) return 'C';
  return 'D';
}

async function main() {
  const [fixture, diagnosticSummary] = await Promise.all([
    readJson(FIXTURE_PATH),
    readJson(DIAGNOSTIC_SUMMARY_PATH),
  ]);

  const mismatches = diagnosticSummary.bandMismatches ?? [];
  if (mismatches.length !== 10) {
    throw new Error(`Expected 10 diagnostic band mismatches before backfill; found ${mismatches.length}`);
  }

  let updatedCount = 0;
  for (const mismatch of mismatches) {
    const record = fixture.asteroids[mismatch.bodyId];
    if (!record) {
      throw new Error(`Fixture missing diagnostic body ${mismatch.bodyId}`);
    }
    if (record.anchorSource !== 'horizons-reanchor') {
      throw new Error(`${mismatch.bodyId} expected horizons-reanchor; received ${String(record.anchorSource)}`);
    }

    const expectedBand = eccentricityBandForBody(record.elements.e);
    if (expectedBand !== mismatch.expectedBand) {
      throw new Error(
        `${mismatch.bodyId} expected band drifted since diagnostic: diagnostic=${mismatch.expectedBand} current=${expectedBand}`,
      );
    }

    if (record.eccentricityBand !== mismatch.storedBand) {
      throw new Error(
        `${mismatch.bodyId} stored band drifted since diagnostic: diagnostic=${mismatch.storedBand} current=${record.eccentricityBand}`,
      );
    }

    record.eccentricityBand = expectedBand;
    updatedCount += 1;
  }

  if (updatedCount !== 10) {
    throw new Error(`Expected to update 10 bodies; updated ${updatedCount}`);
  }

  await writeJsonAtomic(FIXTURE_PATH, fixture);
  console.log(`Backfilled eccentricityBand on ${updatedCount} re-anchored bodies`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
