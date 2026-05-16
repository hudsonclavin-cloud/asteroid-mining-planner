import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const DEFAULT_INPUT_PATHS = [
  path.join(__dirname, 'data', 'tycho2-mag75.tsv'),
  path.join(__dirname, 'data', 'tycho2-suppl1-mag75.tsv'),
];
const DEFAULT_OUTPUT_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'star-catalog-tycho2-mag75.bin');

const HEADER_MAGIC = 'TYC2BIN0';
const VERSION = 1;
const MAGNITUDE_LIMIT = 7.5;
const MAX_STAR_COUNT = 10_000;
const DEFAULT_RGB = [1.0, 0.95, 0.9];
const RECORD_SIZE_BYTES = 28;
const HEADER_SIZE_BYTES = 16;

function parseStringFlag(name, fallback) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : fallback;
}

function parseStringListFlag(name, fallback) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).split(',').filter(Boolean) : fallback;
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function kelvinToRgb(temperatureKelvin) {
  const temperature = Math.min(40_000, Math.max(2_000, temperatureKelvin)) / 100;

  let red;
  let green;
  let blue;

  if (temperature <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
    blue = temperature <= 19 ? 0 : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
    blue = 255;
  }

  const clamp = (component) => Math.min(1, Math.max(0, component / 255));
  return [clamp(red), clamp(green), clamp(blue)];
}

function bvToRgb(btMagnitude, vtMagnitude) {
  if (!Number.isFinite(btMagnitude) || !Number.isFinite(vtMagnitude)) {
    return DEFAULT_RGB;
  }

  const bv = Math.min(2.0, Math.max(-0.4, btMagnitude - vtMagnitude));
  const temperatureKelvin = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
  return kelvinToRgb(temperatureKelvin);
}

function raDecDegToUnitVector(raDeg, decDeg) {
  const raRad = (raDeg * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  const cosDec = Math.cos(decRad);
  return [
    cosDec * Math.cos(raRad),
    cosDec * Math.sin(raRad),
    Math.sin(decRad),
  ];
}

function parseTsvRows(rawText) {
  const rows = [];
  const lines = rawText.split(/\r?\n/);
  let headings = null;

  for (const line of lines) {
    if (!line || line.startsWith('#') || line.startsWith('----')) {
      continue;
    }

    const cells = line.split('\t');
    if (!headings) {
      if (cells[0] !== 'TYC1') {
        continue;
      }
      headings = cells;
      continue;
    }

    // Skip the units row immediately after headings.
    if (cells[0] === ' ') {
      continue;
    }

    if (cells.length !== headings.length) {
      continue;
    }

    const row = Object.fromEntries(headings.map((heading, index) => [heading, cells[index].trim()]));
    rows.push(row);
  }

  if (!headings) {
    throw new Error('Could not find Tycho-2 TSV headings');
  }

  return rows;
}

function buildCatalogRows(rawRows) {
  const filtered = [];
  let skippedMissingFields = 0;

  for (const row of rawRows) {
    const vtMagnitude = parseNumber(row.VTmag);
    const btMagnitude = parseNumber(row.BTmag);
    const raDeg = parseNumber(row._RAJ2000);
    const decDeg = parseNumber(row._DEJ2000);

    if (!Number.isFinite(vtMagnitude) || vtMagnitude > MAGNITUDE_LIMIT) {
      continue;
    }

    if (!Number.isFinite(raDeg) || !Number.isFinite(decDeg)) {
      skippedMissingFields += 1;
      continue;
    }

    filtered.push({
      tyc1: parseNumber(row.TYC1),
      tyc2: parseNumber(row.TYC2),
      tyc3: parseNumber(row.TYC3),
      hip: parseNumber(row.HIP),
      vtMagnitude,
      btMagnitude,
      raDeg,
      decDeg,
      direction: raDecDegToUnitVector(raDeg, decDeg),
      rgb: bvToRgb(btMagnitude, vtMagnitude),
    });
  }

  filtered.sort((left, right) => left.vtMagnitude - right.vtMagnitude);
  const selected = filtered.slice(0, MAX_STAR_COUNT);

  return {
    selected,
    skippedMissingFields,
    availableAfterMagnitudeFilter: filtered.length,
  };
}

async function main() {
  const inputPaths = parseStringListFlag('inputs', DEFAULT_INPUT_PATHS).map((entry) => path.resolve(entry));
  const outputPath = path.resolve(parseStringFlag('output', DEFAULT_OUTPUT_PATH));

  const allRawRows = [];
  for (const inputPath of inputPaths) {
    const rawText = await fs.readFile(inputPath, 'utf8');
    allRawRows.push(...parseTsvRows(rawText));
  }

  const dedupedRows = [];
  const seenKeys = new Set();
  for (const row of allRawRows) {
    const key = row.HIP?.trim()
      ? `hip:${row.HIP.trim()}`
      : `tyc:${row.TYC1?.trim() ?? ''}-${row.TYC2?.trim() ?? ''}-${row.TYC3?.trim() ?? ''}`;
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    dedupedRows.push(row);
  }

  const { selected, skippedMissingFields, availableAfterMagnitudeFilter } = buildCatalogRows(dedupedRows);

  const buffer = Buffer.alloc(HEADER_SIZE_BYTES + selected.length * RECORD_SIZE_BYTES);
  buffer.write(HEADER_MAGIC, 0, 'ascii');
  buffer.writeUInt32LE(VERSION, 8);
  buffer.writeUInt32LE(selected.length, 12);

  for (let index = 0; index < selected.length; index += 1) {
    const star = selected[index];
    const offset = HEADER_SIZE_BYTES + index * RECORD_SIZE_BYTES;
    buffer.writeFloatLE(star.direction[0], offset + 0);
    buffer.writeFloatLE(star.direction[1], offset + 4);
    buffer.writeFloatLE(star.direction[2], offset + 8);
    buffer.writeFloatLE(star.vtMagnitude, offset + 12);
    buffer.writeFloatLE(star.rgb[0], offset + 16);
    buffer.writeFloatLE(star.rgb[1], offset + 20);
    buffer.writeFloatLE(star.rgb[2], offset + 24);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);

  const gzipSizeBytes = zlib.gzipSync(buffer).byteLength;
  console.log(
    JSON.stringify(
        {
        sourceRows: dedupedRows.length,
        rawRowsBeforeDeduplication: allRawRows.length,
        availableAfterMagnitudeFilter,
        skippedMissingFields,
        selectedCount: selected.length,
        inputPaths,
        outputPath,
        rawSizeBytes: buffer.byteLength,
        gzipSizeBytes,
        brightest: {
          hip: selected[0]?.hip ?? null,
          vtMagnitude: selected[0]?.vtMagnitude ?? null,
          raDeg: selected[0]?.raDeg ?? null,
          decDeg: selected[0]?.decDeg ?? null,
        },
      },
      null,
      2,
    ),
  );
}

await main();
