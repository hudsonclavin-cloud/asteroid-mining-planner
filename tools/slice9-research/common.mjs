import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';
export const CAD_API_URL = 'https://ssd-api.jpl.nasa.gov/cad.api';
export const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

export const COMMON_EPOCH_TDB_JD = 2461161.5;
export const COMMON_EPOCH_LABEL = '2026-05-01 TDB';
export const VALIDATION_START = '2026-05-01';
export const VALIDATION_STOP = '2026-07-30';
export const VALIDATION_STEP = "'1 d'";
export const VALIDATION_SAMPLE_COUNT = 91;

export const AU_KM = 149_597_870.7;
export const SECONDS_PER_DAY = 86_400;

const QUERY_RETRY_DELAYS_MS = [500, 1_500, 3_000, 5_000];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESEARCH_ROOT = __dirname;
export const DATA_DIR = path.join(__dirname, 'data');

export function buildUrl(base, params) {
  return `${base}?${new URLSearchParams(params).toString()}`;
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 0; attempt <= QUERY_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      lastError = new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < QUERY_RETRY_DELAYS_MS.length) {
      await sleep(QUERY_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}

export function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function bucketDataArcDays(days) {
  if (days === null) return 'missing';
  if (days < 7) return '<7d';
  if (days < 30) return '7-30d';
  if (days < 100) return '30-100d';
  if (days < 1000) return '100-1000d';
  return '>1000d';
}

export function normalizeSbdbClass(value) {
  const code = String(value ?? '').trim().toUpperCase();
  return code || 'missing';
}

export function eccentricityBand(eccentricity) {
  if (eccentricity < 0.3) return 'e<0.3';
  if (eccentricity < 0.5) return '0.3-0.5';
  if (eccentricity < 0.7) return '0.5-0.7';
  return '>0.7';
}

export function rowToObject(fields, row) {
  return Object.fromEntries(fields.map((field, index) => [field, row[index] ?? null]));
}

export function normalizeSbdbRows(payload) {
  const fields = payload.fields ?? [];
  const rows = payload.data ?? [];
  return rows.map((row) => {
    const entry = rowToObject(fields, row);
    const designation = String(entry.pdes ?? '').trim();
    const spkid = String(entry.spkid ?? '').trim();
    const conditionCode = parseNumber(entry.condition_code);
    const dataArcDays = parseNumber(entry.data_arc);
    const aAu = parseNumber(entry.a);
    const e = parseNumber(entry.e);
    const iDeg = parseNumber(entry.i);
    const omDeg = parseNumber(entry.om);
    const wDeg = parseNumber(entry.w);
    const maDeg = parseNumber(entry.ma);
    const epochTdbJd = parseNumber(entry.epoch);
    const hAbsMag = parseNumber(entry.H);
    const sigmaA = parseNumber(entry.sigma_a);
    const sigmaE = parseNumber(entry.sigma_e);
    const nObsUsed = parseNumber(entry.n_obs_used);
    const orbitClass = normalizeSbdbClass(entry.class);
    const degenerate =
      designation.length === 0 ||
      spkid.length === 0 ||
      aAu === null ||
      e === null ||
      iDeg === null ||
      omDeg === null ||
      wDeg === null ||
      maDeg === null ||
      epochTdbJd === null ||
      !Number.isFinite(aAu) ||
      !Number.isFinite(e) ||
      !Number.isFinite(iDeg) ||
      !Number.isFinite(omDeg) ||
      !Number.isFinite(wDeg) ||
      !Number.isFinite(maDeg) ||
      !Number.isFinite(epochTdbJd) ||
      aAu <= 0 ||
      e < 0 ||
      e >= 1;

    return {
      designation,
      spkid,
      fullName: String(entry.full_name ?? '').trim(),
      orbitClass,
      aAu,
      e,
      iDeg,
      omDeg,
      wDeg,
      maDeg,
      epochTdbJd,
      conditionCode,
      dataArcDays,
      nObsUsed,
      hAbsMag,
      sigmaA,
      sigmaE,
      dataArcBucket: bucketDataArcDays(dataArcDays),
      eccentricityBand: Number.isFinite(e) ? eccentricityBand(e) : 'missing',
      hasDegenerateElements: degenerate,
    };
  });
}

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function writeJsonAtomic(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}

export async function writeTextAtomic(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, value, 'utf8');
  await fs.rename(tempPath, filePath);
}

export function incrementCount(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

export function toSortedObject(map) {
  return Object.fromEntries(
    [...map.entries()].sort(([left], [right]) => String(left).localeCompare(String(right), 'en', { numeric: true })),
  );
}

export function quantile(sortedValues, fraction) {
  if (sortedValues.length === 0) return null;
  const index = (sortedValues.length - 1) * fraction;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }
  const lower = sortedValues[lowerIndex];
  const upper = sortedValues[upperIndex];
  return lower + (upper - lower) * (index - lowerIndex);
}

export function summarizeNumeric(values) {
  const finite = values.filter((value) => Number.isFinite(value)).sort((left, right) => left - right);
  if (finite.length === 0) {
    return {
      count: 0,
      min: null,
      median: null,
      p90: null,
      p95: null,
      max: null,
    };
  }

  return {
    count: finite.length,
    min: finite[0],
    median: quantile(finite, 0.5),
    p90: quantile(finite, 0.9),
    p95: quantile(finite, 0.95),
    max: finite.at(-1),
  };
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

export function deterministicShuffle(items, seed) {
  const rng = mulberry32(seed);
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool;
}

export function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

export function kmVectorMagnitude(vectorKm) {
  return Math.hypot(vectorKm.x, vectorKm.y, vectorKm.z);
}

