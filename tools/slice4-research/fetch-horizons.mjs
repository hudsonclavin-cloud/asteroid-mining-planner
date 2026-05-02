import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

const WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
};

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const SLOW_FETCH_WARNING_MS = 5 * 60 * 1000;
const refresh = process.argv.includes('--refresh');
const mimasExtension = process.argv.includes('--mimas-extension');
const enceladusExtension = process.argv.includes('--enceladus-extension');
const tethysExtension = process.argv.includes('--tethys-extension');

const BODIES = [
  { name: 'saturn', command: '699', center: '@sun' },
  { name: 'titan', command: '606', center: '500@699' },
  { name: 'rhea', command: '605', center: '500@699' },
  { name: 'iapetus', command: '608', center: '500@699' },
  { name: 'tethys', command: '603', center: '500@699' },
  { name: 'dione', command: '604', center: '500@699' },
  { name: 'mimas', command: '601', center: '500@699' },
  { name: 'enceladus', command: '602', center: '500@699' },
];

const CADENCES = [
  { label: 'daily', stepSize: "'1 d'" },
  { label: '12h', stepSize: "'12 h'" },
  { label: '6h', stepSize: "'6 h'" },
  { label: '3h', stepSize: "'3 h'" },
  { label: 'truth', stepSize: "'30 m'" },
];

const EXTENSION_CADENCES = [
  { label: '1h', stepSize: "'1 h'" },
  { label: '30m', stepSize: "'30 m'" },
  { label: 'truth-15m', stepSize: "'15 m'" },
];

function buildParams(body, cadence) {
  return {
    format: 'json',
    COMMAND: body.command,
    CENTER: body.center,
    EPHEM_TYPE: 'VECTORS',
    REF_SYSTEM: 'ICRF',
    REF_PLANE: 'FRAME',
    TIME_TYPE: 'TDB',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '2',
    START_TIME: WINDOW.start,
    STOP_TIME: WINDOW.stop,
    STEP_SIZE: cadence.stepSize,
  };
}

function buildUrl(params) {
  return `${HORIZONS_BASE_URL}?${new URLSearchParams(params).toString()}`;
}

function parseSamples(resultText) {
  const startIndex = resultText.indexOf('$$SOE');
  const endIndex = resultText.indexOf('$$EOE');
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error('Horizons response did not contain a $$SOE/$$EOE vectors block');
  }

  const block = resultText.slice(startIndex + 5, endIndex).trim();
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const samples = [];
  for (let i = 0; i < lines.length; i += 3) {
    const timeLine = lines[i];
    const positionLine = lines[i + 1];
    const velocityLine = lines[i + 2];

    if (!timeLine || !positionLine || !velocityLine) {
      throw new Error(`Unexpected Horizons vectors block shape near line index ${i}`);
    }

    const jdMatch = timeLine.match(/^([0-9.]+)\s*=\s*A\.D\.\s*(.+?)\s*TDB$/);
    const positionMatch = positionLine.match(
      /^X\s*=\s*([+-]?\d+(?:\.\d+)?E[+-]?\d+)\s+Y\s*=\s*([+-]?\d+(?:\.\d+)?E[+-]?\d+)\s+Z\s*=\s*([+-]?\d+(?:\.\d+)?E[+-]?\d+)$/i,
    );
    const velocityMatch = velocityLine.match(
      /^VX\s*=\s*([+-]?\d+(?:\.\d+)?E[+-]?\d+)\s+VY\s*=\s*([+-]?\d+(?:\.\d+)?E[+-]?\d+)\s+VZ\s*=\s*([+-]?\d+(?:\.\d+)?E[+-]?\d+)$/i,
    );

    if (!jdMatch || !positionMatch || !velocityMatch) {
      throw new Error(`Unable to parse Horizons sample near line index ${i}`);
    }

    samples.push({
      jdTdb: Number(jdMatch[1]),
      timestampTdb: jdMatch[2],
      positionKm: {
        x: Number(positionMatch[1]),
        y: Number(positionMatch[2]),
        z: Number(positionMatch[3]),
      },
      velocityKms: {
        x: Number(velocityMatch[1]),
        y: Number(velocityMatch[2]),
        z: Number(velocityMatch[3]),
      },
    });
  }

  return samples;
}

async function fetchDataset(body, cadence) {
  const outputPath = path.join(dataDir, `${cadence.label}-${body.name}.json`);

  if (!refresh) {
    try {
      await fs.access(outputPath);
      console.log(`cache hit: ${path.relative(process.cwd(), outputPath)}`);
      return;
    } catch {}
  }

  const params = buildParams(body, cadence);
  const url = buildUrl(params);
  const startedAt = Date.now();
  console.log(`fetching ${body.name} ${cadence.label}: ${url}`);

  const response = await fetch(url);
  const elapsedMs = Date.now() - startedAt;
  if (elapsedMs > SLOW_FETCH_WARNING_MS) {
    console.warn(
      `warning: ${body.name} ${cadence.label} fetch took ${(elapsedMs / 1000).toFixed(1)}s (>300s)`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Horizons request failed for ${body.name} ${cadence.label}: HTTP ${response.status}`,
    );
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`Horizons API error for ${body.name} ${cadence.label}: ${payload.error}`);
  }

  const samples = parseSamples(payload.result);
  const document = {
    source: 'NASA/JPL Horizons API',
    fetchedAtUtc: new Date().toISOString(),
    body: body.name,
    command: body.command,
    center: body.center,
    cadence: cadence.label,
    stepSize: cadence.stepSize,
    startTime: WINDOW.start,
    stopTime: WINDOW.stop,
    params,
    sampleCount: samples.length,
    samples,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  console.log(
    `saved ${path.relative(process.cwd(), outputPath)} (${samples.length} samples, ${(elapsedMs / 1000).toFixed(1)}s)`,
  );
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true });

  const extensionFlags = [
    ['mimas', mimasExtension],
    ['enceladus', enceladusExtension],
    ['tethys', tethysExtension],
  ].filter(([, enabled]) => enabled);

  if (extensionFlags.length > 1) {
    throw new Error('Only one extension flag may be used at a time');
  }

  const bodies =
    extensionFlags.length === 0
      ? BODIES
      : BODIES.filter((body) => body.name === extensionFlags[0][0]);
  const cadences = extensionFlags.length === 0 ? CADENCES : EXTENSION_CADENCES;

  for (const body of bodies) {
    for (const cadence of cadences) {
      await fetchDataset(body, cadence);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
