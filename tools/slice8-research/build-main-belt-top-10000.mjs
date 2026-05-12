import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

import {
  SLICE8_MAIN_BELT_TARGET_COUNT,
  acceptMainBeltRecord,
  downloadBulkNumberedTable,
  fetchBatchEnrichment,
  isMainBeltByOrbitalFilter,
  mapMainBeltRecord,
  parseBulkNumberedTable,
  rowToObject,
  writeJson,
} from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const outputPath = path.join(dataDir, 'main-belt-top-10000.json');

const BATCH_SIZE = 25;
const ENRICHMENT_SCAN_LIMIT = 12_000;
const ENRICHMENT_FIELDS = [
  'spkid',
  'pdes',
  'full_name',
  'name',
  'class',
  'neo',
  'pha',
  'epoch',
  'e',
  'a',
  'i',
  'om',
  'w',
  'ma',
  'n',
  'H',
  'G',
  'data_arc',
  'condition_code',
];

async function main() {
  console.log('downloading bulk numbered-asteroid table');
  const bulkText = await downloadBulkNumberedTable(zlib);
  const numberedRecords = parseBulkNumberedTable(bulkText);
  const orbitalPool = numberedRecords.filter(isMainBeltByOrbitalFilter);
  const knownHBodies = orbitalPool.filter((record) => record.H !== 99);
  knownHBodies.sort((left, right) => left.H - right.H || left.a - right.a);

  const accepted = [];
  const seen = new Set();

  for (
    let startIndex = 0;
    startIndex < Math.min(knownHBodies.length, ENRICHMENT_SCAN_LIMIT);
    startIndex += BATCH_SIZE
  ) {
    const batch = knownHBodies.slice(startIndex, startIndex + BATCH_SIZE);
    if (!batch.length) break;

    const payloadRows = await fetchBatchEnrichment(batch.map((record) => record.designation));
    const enrichedByDesignation = new Map(
      payloadRows.map((row) => {
        const object = rowToObject(ENRICHMENT_FIELDS, row);
        return [object.pdes, object];
      }),
    );

    for (const bulkRecord of batch) {
      const enrichment = enrichedByDesignation.get(bulkRecord.designation);
      if (!enrichment) {
        throw new Error(`Missing SBDB enrichment for designation ${bulkRecord.designation}`);
      }

      const normalized = mapMainBeltRecord(bulkRecord, enrichment);
      if (!acceptMainBeltRecord(normalized)) {
        continue;
      }
      if (seen.has(normalized.designation)) {
        continue;
      }
      seen.add(normalized.designation);
      accepted.push(normalized);
      if (accepted.length === SLICE8_MAIN_BELT_TARGET_COUNT) {
        break;
      }
    }

    if (accepted.length === SLICE8_MAIN_BELT_TARGET_COUNT) {
      break;
    }
  }

  if (accepted.length !== SLICE8_MAIN_BELT_TARGET_COUNT) {
    throw new Error(
      `Unable to select ${SLICE8_MAIN_BELT_TARGET_COUNT} main-belt asteroids; only accepted ${accepted.length}`,
    );
  }

  await writeJson(outputPath, accepted);

  const cutoff = accepted.at(-1);
  console.log(`wrote ${outputPath}`);
  console.log(`records=${accepted.length}`);
  console.log(`cutoff_designation=${cutoff.designation}`);
  console.log(`cutoff_H=${cutoff.H}`);
  console.log(`1000th_H=${accepted[999].H}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
