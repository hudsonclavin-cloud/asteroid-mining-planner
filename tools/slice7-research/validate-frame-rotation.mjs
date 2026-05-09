import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GM_SUN_M3_S2,
  J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
  propagateKeplerian,
} from './keplerian-propagate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';
const HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const CRITICAL_RESIDUAL_KM = 100;
const TARGET_RESIDUAL_KM = 1;

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseVectorLine(line) {
  const matches = [...line.matchAll(/([A-Z]+)\s*=\s*([+-]?\d+\.\d+(?:E[+-]?\d+)?)/g)];
  return Object.fromEntries(matches.map(([, key, value]) => [key, Number(value)]));
}

function buildSbdbQueryUrl(designation) {
  return `${SBDB_QUERY_URL}?${new URLSearchParams({
    fields: 'pdes,name,class,epoch,e,a,i,om,w,ma,H,G,data_arc,condition_code',
    'sb-cdata': JSON.stringify({ OR: [`pdes|EQ|${designation}`] }),
    'full-prec': 'true',
  }).toString()}`;
}

async function fetchFullPrecisionElements(designation) {
  const response = await fetch(buildSbdbQueryUrl(designation));
  if (!response.ok) {
    throw new Error(`SBDB query failed for ${designation}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.data) || payload.data.length !== 1) {
    throw new Error(`Expected one SBDB full-precision row for ${designation}`);
  }

  const row = Object.fromEntries(
    payload.fields.map((field, index) => [field, payload.data[0][index] ?? null]),
  );

  return {
    designation: row.pdes,
    name: row.name || row.pdes,
    class: row.class,
    a: parseNumber(row.a),
    e: parseNumber(row.e),
    i: parseNumber(row.i),
    om: parseNumber(row.om),
    w: parseNumber(row.w),
    ma: parseNumber(row.ma),
    epoch_tdb: parseNumber(row.epoch),
    H: parseNumber(row.H),
    G: parseNumber(row.G),
    data_arc: parseNumber(row.data_arc),
    condition_code: parseNumber(row.condition_code),
  };
}

async function fetchHorizonsEpochState(designation, jdTdb) {
  const url = `${HORIZONS_URL}?${new URLSearchParams({
    format: 'json',
    COMMAND: `';${designation}'`,
    EPHEM_TYPE: 'VECTORS',
    CENTER: '500@10',
    OUT_UNITS: 'KM-S',
    REF_PLANE: 'FRAME',
    REF_SYSTEM: 'ICRF',
    VEC_TABLE: '2',
    TIME_TYPE: 'TDB',
    TLIST: String(jdTdb),
  }).toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Horizons epoch fetch failed for ${designation}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const lines = payload.result.split('\n');
  const soeIndex = lines.indexOf('$$SOE');
  if (soeIndex === -1 || !lines[soeIndex + 2]) {
    throw new Error(`Unable to parse Horizons epoch vector block for ${designation}`);
  }

  const position = parseVectorLine(lines[soeIndex + 2]);
  return {
    position_km: {
      x: position.X,
      y: position.Y,
      z: position.Z,
    },
    rawHeader: lines
      .find((line) => line.includes('Reference frame'))
      ?.trim(),
  };
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

async function validateBody(designation) {
  const elements = await fetchFullPrecisionElements(designation);
  const truth = await fetchHorizonsEpochState(designation, elements.epoch_tdb);
  const propagated = propagateKeplerian(elements, elements.epoch_tdb);
  const residualKm = vectorErrorKm(propagated.position_km, truth.position_km);
  const status =
    residualKm < TARGET_RESIDUAL_KM
      ? 'pass'
      : residualKm <= CRITICAL_RESIDUAL_KM
        ? 'warning'
        : 'critical';

  return {
    designation: elements.designation,
    name: elements.name,
    class: elements.class,
    epoch_tdb: elements.epoch_tdb,
    H: elements.H,
    residual_km: residualKm,
    reference_header: truth.rawHeader,
    status,
  };
}

async function main() {
  const eros = await validateBody('433');
  const vesta = await validateBody('4');
  const results = [eros, vesta];

  for (const result of results) {
    console.log(
      `${result.designation} ${result.name}: epoch residual ${result.residual_km.toFixed(6)} km (${result.reference_header})`,
    );
  }

  const critical = results.find((result) => result.residual_km > CRITICAL_RESIDUAL_KM);
  if (critical) {
    console.error('candidate causes if residual exceeds 100 km at epoch:');
    console.error('- wrong obliquity sign (X-axis rotation sign convention)');
    console.error('- wrong rotation axis (must be X)');
    console.error('- time-scale mismatch (TDB vs UTC/TT)');
    console.error('- perifocal-to-ecliptic Euler rotation ordering');
    throw new Error(
      `Frame validation failed for ${critical.designation} ${critical.name}: ${critical.residual_km} km`,
    );
  }

  const output = {
    generatedAtUtc: new Date().toISOString(),
    obliquity_arcsec: J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
    GM_sun_m3_s2: GM_SUN_M3_S2,
    target_residual_km: TARGET_RESIDUAL_KM,
    critical_residual_km: CRITICAL_RESIDUAL_KM,
    bodies: results,
  };

  const outputPath = path.join(dataDir, 'frame-validation.json');
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
