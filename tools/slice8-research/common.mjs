import fs from 'node:fs/promises';
import path from 'node:path';

export const BULK_TABLE_URL = 'https://ssd.jpl.nasa.gov/dat/ELEMENTS.NUMBR.gz';
export const SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';
export const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
export const J2000_TDB_JD = 2451545.0;
export const SECONDS_PER_DAY = 86_400;
export const SLICE8_MAIN_BELT_TARGET_COUNT = 10_000;
export const SBDB_CHEAP_PATH_THRESHOLD_JD = 2460311.5;
export const SBDB_CHEAP_PATH_THRESHOLD_LABEL = '2024-01-01 TDB';

const QUERY_RETRY_DELAYS_MS = [500, 1_500, 3_000];

export function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeName(name, fallback) {
  const trimmed = (name ?? '').trim();
  return trimmed || fallback;
}

export function parseBulkLine(line) {
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

export function parseBulkNumberedTable(text) {
  return text
    .split('\n')
    .map((line) => parseBulkLine(line))
    .filter(Boolean);
}

export function isMainBeltByOrbitalFilter(record) {
  return (
    record.a !== null &&
    record.e !== null &&
    record.a > 2.0 &&
    record.a < 3.5 &&
    record.e < 0.4
  );
}

export function buildOrFilterForDesignations(designations) {
  return JSON.stringify({
    OR: designations.map((designation) => `pdes|EQ|${designation}`),
  });
}

export function buildQueryUrl(params) {
  return `${SBDB_QUERY_URL}?${new URLSearchParams(params).toString()}`;
}

export async function fetchJson(url) {
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
    await sleep(QUERY_RETRY_DELAYS_MS[attempt]);
  }

  throw lastError;
}

export async function downloadBulkNumberedTable(zlib) {
  const response = await fetch(BULK_TABLE_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${BULK_TABLE_URL}`);
  }

  const compressed = Buffer.from(await response.arrayBuffer());
  return zlib.gunzipSync(compressed).toString('utf8');
}

export async function fetchBatchEnrichment(designations) {
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

export function rowToObject(fields, row) {
  return Object.fromEntries(fields.map((field, index) => [field, row[index] ?? null]));
}

export function mapMainBeltRecord(bulkRecord, enrichment) {
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

export function acceptMainBeltRecord(record) {
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

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function jdTdbToSecondsSinceJ2000(jdTdb) {
  return (jdTdb - J2000_TDB_JD) * SECONDS_PER_DAY;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSampleWithoutReplacement(items, count, rng) {
  if (count > items.length) {
    throw new Error(`Cannot sample ${count} items from pool of ${items.length}`);
  }

  const pool = [...items];
  const selected = [];
  for (let index = 0; index < count; index += 1) {
    const pickIndex = Math.floor(rng() * pool.length);
    selected.push(pool[pickIndex]);
    pool.splice(pickIndex, 1);
  }
  return selected;
}

