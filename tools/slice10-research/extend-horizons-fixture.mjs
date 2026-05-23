import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const outPath = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-inner-solar-system-2026-2040.json.new',
);

const WINDOW = {
  start: '2026-01-01',
  stop: '2040-12-31',
};

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

const BODIES = [
  { name: 'sun', command: '10', center: '@ssb', origin: 'ssb' },
  { name: 'mercury', command: '199', center: '@sun', origin: 'heliocentric' },
  { name: 'venus', command: '299', center: '@sun', origin: 'heliocentric' },
  { name: 'earth', command: '399', center: '@sun', origin: 'heliocentric' },
  { name: 'moon', command: '301', center: '500@399', origin: 'geocentric' },
  { name: 'mars', command: '499', center: '@sun', origin: 'heliocentric' },
];

function buildParams(body) {
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
    STEP_SIZE: '1d',
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

    samples.push([
      Number(jdMatch[1]),
      Number(positionMatch[1]),
      Number(positionMatch[2]),
      Number(positionMatch[3]),
      Number(velocityMatch[1]),
      Number(velocityMatch[2]),
      Number(velocityMatch[3]),
    ]);
  }

  return samples;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, label) {
  let attempt = 0;
  let lastError = null;
  while (attempt < 3) {
    attempt += 1;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error);
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt >= 3) {
        break;
      }
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
  throw new Error(`Horizons request failed for ${label}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function main() {
  const targets = {};

  for (const body of BODIES) {
    const params = buildParams(body);
    const url = buildUrl(params);
    console.log(`fetching ${body.name}: ${url}`);
    const payload = await fetchWithRetry(url, body.name);
    const records = parseSamples(payload.result);
    targets[body.name] = {
      targetId: body.command,
      center: body.center,
      origin: body.origin,
      records,
    };
    console.log(`parsed ${body.name}: ${records.length} records`);
  }

  const fixture = {
    source: 'NASA/JPL Horizons API',
    frame: 'ICRF/J2000',
    timeScale: 'TDB',
    units: {
      position: 'km',
      velocity: 'km/s',
      time: 'TDB Julian Date',
    },
    targets,
  };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  console.log(`written ${outPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
