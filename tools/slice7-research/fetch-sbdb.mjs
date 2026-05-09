import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

const BULK_TABLE_URL = 'https://ssd.jpl.nasa.gov/dat/ELEMENTS.NUMBR.gz';
const SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';
const MAIN_BELT_TARGET_COUNT = 1000;
const BATCH_SIZE = 25;
const MAX_CANDIDATE_SCAN = 2500;
const QUERY_RETRY_DELAYS_MS = [500, 1500, 3000];

const CURATED_NEA_DESIGNATIONS = [
  '101955', // Bennu
  '99942', // Apophis
  '433', // Eros
  '25143', // Itokawa
  '162173', // Ryugu
  '4179', // Toutatis
  '1620', // Geographos
  '4769', // Castalia
];

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeName(name, fallback) {
  const trimmed = (name ?? '').trim();
  return trimmed || fallback;
}

function parseBulkLine(line) {
  if (!line.trim() || line.startsWith(' Num') || line.startsWith('------')) {
    return null;
  }

  const designation = line.slice(0, 6).trim();
  const name = line.slice(6, 24).trim();
  const rest = line
    .slice(24)
    .trim()
    .split(/\s+/);

  if (rest.length < 10) {
    throw new Error(`Unexpected ELEMENTS.NUMBR row shape: '${line}'`);
  }

  const [epochMjd, a, e, i, w, om, ma, H, G, ...refParts] = rest;
  return {
    designation,
    name,
    epoch_mjd: parseNumber(epochMjd),
    a: parseNumber(a),
    e: parseNumber(e),
    i: parseNumber(i),
    w: parseNumber(w),
    om: parseNumber(om),
    ma: parseNumber(ma),
    H: parseNumber(H),
    G: parseNumber(G),
    ref: refParts.join(' ').trim(),
  };
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

async function fetchJson(url) {
  let lastError = null;

  for (let attempt = 0; attempt <= QUERY_RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    }

    lastError = new Error(`HTTP ${response.status} for ${url}`);
    if (attempt === QUERY_RETRY_DELAYS_MS.length) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, QUERY_RETRY_DELAYS_MS[attempt]));
  }

  throw lastError;
}

async function downloadBulkNumberedTable() {
  const response = await fetch(BULK_TABLE_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${BULK_TABLE_URL}`);
  }

  const compressed = Buffer.from(await response.arrayBuffer());
  return zlib.gunzipSync(compressed).toString('utf8');
}

function parseBulkNumberedTable(text) {
  return text
    .split('\n')
    .map((line) => parseBulkLine(line))
    .filter(Boolean);
}

function isMainBeltByOrbitalFilter(record) {
  return (
    record.a !== null &&
    record.e !== null &&
    record.a > 2.0 &&
    record.a < 3.5 &&
    record.e < 0.4
  );
}

function buildOrFilterForDesignations(designations) {
  return JSON.stringify({
    OR: designations.map((designation) => `pdes|EQ|${designation}`),
  });
}

function buildQueryUrl(params) {
  return `${SBDB_QUERY_URL}?${new URLSearchParams(params).toString()}`;
}

async function fetchBatchEnrichment(designations) {
  const url = buildQueryUrl({
    fields:
      'spkid,pdes,full_name,name,class,neo,pha,epoch,e,a,i,om,w,ma,n,H,G,data_arc,condition_code',
    'sb-cdata': buildOrFilterForDesignations(designations),
    'full-prec': 'true',
  });
  const payload = await fetchJson(url);
  if (!Array.isArray(payload.data)) {
    throw new Error(`Unexpected SBDB query payload for designations ${designations.join(', ')}`);
  }
  return payload.data;
}

function rowToObject(fields, row) {
  return Object.fromEntries(fields.map((field, index) => [field, row[index] ?? null]));
}

function mapMainBeltRecord(bulkRecord, enrichment) {
  const fallbackName = bulkRecord.name || bulkRecord.designation;
  return {
    designation: enrichment.pdes,
    name: normalizeName(enrichment.name, fallbackName),
    a: bulkRecord.a,
    e: bulkRecord.e,
    i: bulkRecord.i,
    om: bulkRecord.om,
    w: bulkRecord.w,
    ma: bulkRecord.ma,
    n: parseNumber(enrichment.n),
    epoch: parseNumber(enrichment.epoch),
    H: bulkRecord.H,
    G: bulkRecord.G,
    condition_code: parseNumber(enrichment.condition_code),
    data_arc: parseNumber(enrichment.data_arc),
    class: enrichment.class,
    neo: enrichment.neo === 'Y',
    pha: enrichment.pha === 'Y',
  };
}

function mapNeaRecord(payloadRecord) {
  const fallbackName = normalizeName(payloadRecord.full_name, payloadRecord.pdes);
  return {
    designation: payloadRecord.pdes,
    name: normalizeName(payloadRecord.name, fallbackName),
    a: parseNumber(payloadRecord.a),
    e: parseNumber(payloadRecord.e),
    i: parseNumber(payloadRecord.i),
    om: parseNumber(payloadRecord.om),
    w: parseNumber(payloadRecord.w),
    ma: parseNumber(payloadRecord.ma),
    n: parseNumber(payloadRecord.n),
    epoch: parseNumber(payloadRecord.epoch),
    H: parseNumber(payloadRecord.H),
    G: parseNumber(payloadRecord.G),
    condition_code: parseNumber(payloadRecord.condition_code),
    data_arc: parseNumber(payloadRecord.data_arc),
    class: payloadRecord.class,
    neo: payloadRecord.neo === 'Y',
    pha: payloadRecord.pha === 'Y',
  };
}

function acceptMainBeltRecord(record) {
  return (
    record.class === 'MBA' &&
    record.condition_code !== 9 &&
    record.data_arc !== null &&
    record.data_arc >= 30 &&
    record.H !== null &&
    record.H !== 99 &&
    record.neo === false
  );
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true });

  console.log(`downloading bulk asteroid table: ${BULK_TABLE_URL}`);
  const bulkText = await downloadBulkNumberedTable();
  const numberedRecords = parseBulkNumberedTable(bulkText);
  const mainBeltOrbitalPool = numberedRecords.filter(isMainBeltByOrbitalFilter);
  const knownHMainBeltPool = mainBeltOrbitalPool.filter((record) => record.H !== 99);
  knownHMainBeltPool.sort((left, right) => left.H - right.H || left.a - right.a);

  const bulkByDesignation = new Map(
    knownHMainBeltPool.map((record) => [record.designation, record]),
  );

  const selectionStats = {
    fetchedAtUtc: new Date().toISOString(),
    bulk_table_url: BULK_TABLE_URL,
    numbered_records_total: numberedRecords.length,
    main_belt_orbital_pool: mainBeltOrbitalPool.length,
    dropped_unknown_h_99: mainBeltOrbitalPool.length - knownHMainBeltPool.length,
    candidate_scan_limit: MAX_CANDIDATE_SCAN,
    enrichment_batches: 0,
    enriched_records_scanned: 0,
    dropped_condition_code_9: 0,
    dropped_data_arc_lt_30d: 0,
    dropped_non_mba_class: 0,
    dropped_neo_flag: 0,
    accepted_main_belt_records: 0,
  };

  const acceptedMainBelt = [];
  const seenAccepted = new Set();

  for (let start = 0; start < Math.min(knownHMainBeltPool.length, MAX_CANDIDATE_SCAN); start += BATCH_SIZE) {
    const batch = knownHMainBeltPool.slice(start, start + BATCH_SIZE);
    if (!batch.length) break;
    selectionStats.enrichment_batches += 1;
    selectionStats.enriched_records_scanned += batch.length;
    const payloadRows = await fetchBatchEnrichment(batch.map((record) => record.designation));
    const fields = [
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

    const enrichedByDesignation = new Map(
      payloadRows.map((row) => {
        const object = rowToObject(fields, row);
        return [object.pdes, object];
      }),
    );

    for (const bulkRecord of batch) {
      const enrichment = enrichedByDesignation.get(bulkRecord.designation);
      if (!enrichment) {
        throw new Error(`Missing SBDB enrichment for designation ${bulkRecord.designation}`);
      }

      const normalized = mapMainBeltRecord(bulkRecord, enrichment);
      if (normalized.class !== 'MBA') {
        selectionStats.dropped_non_mba_class += 1;
        continue;
      }
      if (normalized.neo) {
        selectionStats.dropped_neo_flag += 1;
        continue;
      }
      if (normalized.condition_code === 9) {
        selectionStats.dropped_condition_code_9 += 1;
        continue;
      }
      if (normalized.data_arc === null || normalized.data_arc < 30) {
        selectionStats.dropped_data_arc_lt_30d += 1;
        continue;
      }
      if (seenAccepted.has(normalized.designation)) {
        continue;
      }
      seenAccepted.add(normalized.designation);
      acceptedMainBelt.push(normalized);
      if (acceptedMainBelt.length === MAIN_BELT_TARGET_COUNT) {
        break;
      }
    }

    if (acceptedMainBelt.length === MAIN_BELT_TARGET_COUNT) {
      break;
    }
  }

  if (acceptedMainBelt.length !== MAIN_BELT_TARGET_COUNT) {
    throw new Error(
      `Unable to select ${MAIN_BELT_TARGET_COUNT} main-belt asteroids; only accepted ${acceptedMainBelt.length}`,
    );
  }

  selectionStats.accepted_main_belt_records = acceptedMainBelt.length;

  const cutoffRecord = acceptedMainBelt.at(-1);
  const cutoffText = `${cutoffRecord.H} ${new Date().toISOString()}\n`;

  const neaFields = [
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
  const famousNeaRows = await fetchBatchEnrichment(CURATED_NEA_DESIGNATIONS);
  if (famousNeaRows.length !== CURATED_NEA_DESIGNATIONS.length) {
    throw new Error(
      `Expected ${CURATED_NEA_DESIGNATIONS.length} curated NEA rows, got ${famousNeaRows.length}`,
    );
  }

  const famousNeas = famousNeaRows
    .map((row) => rowToObject(neaFields, row))
    .sort(
      (left, right) =>
        CURATED_NEA_DESIGNATIONS.indexOf(left.pdes) - CURATED_NEA_DESIGNATIONS.indexOf(right.pdes),
    )
    .map(mapNeaRecord);

  for (const nea of famousNeas) {
    if (!nea.neo) {
      throw new Error(`Curated NEA ${nea.designation} did not return neo=true`);
    }
  }

  const duplicateDesignations = famousNeas
    .map((record) => record.designation)
    .filter((designation) => seenAccepted.has(designation));
  if (duplicateDesignations.length) {
    throw new Error(`Duplicate designations between main-belt and NEA sets: ${duplicateDesignations.join(', ')}`);
  }

  await writeJson(path.join(dataDir, 'main-belt-top-1000.json'), acceptedMainBelt);
  await writeJson(path.join(dataDir, 'famous-neas.json'), famousNeas);
  await fs.writeFile(path.join(dataDir, 'main-belt-cutoff-h.txt'), cutoffText, 'utf8');
  await writeJson(path.join(dataDir, 'main-belt-selection-stats.json'), selectionStats);

  console.log(`main-belt-top-1000.json records: ${acceptedMainBelt.length}`);
  console.log(`famous-neas.json records: ${famousNeas.length}`);
  console.log(`main-belt cutoff H: ${cutoffRecord.H}`);
  console.log(
    `gate summary: orbital_pool=${selectionStats.main_belt_orbital_pool}, ` +
      `drop_H99=${selectionStats.dropped_unknown_h_99}, ` +
      `drop_cc9=${selectionStats.dropped_condition_code_9}, ` +
      `drop_arc_lt30=${selectionStats.dropped_data_arc_lt_30d}, ` +
      `drop_class=${selectionStats.dropped_non_mba_class}, ` +
      `accepted=${selectionStats.accepted_main_belt_records}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
