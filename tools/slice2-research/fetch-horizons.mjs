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

const BODIES = [
  { name: 'sun', command: '10', center: '@ssb' },
  { name: 'mercury', command: '199', center: '@sun' },
  { name: 'venus', command: '299', center: '@sun' },
  { name: 'earth', command: '399', center: '@sun' },
  { name: 'moon', command: '301', center: '500@399' },
  { name: 'mars', command: '499', center: '@sun' },
];

function buildParams(body, stepSize) {
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
    STEP_SIZE: stepSize,
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

async function fetchDataset(body, stepSize, outputPath) {
  try {
    await fs.access(outputPath);
    console.log(`cache hit: ${path.relative(process.cwd(), outputPath)}`);
    return;
  } catch {}

  const params = buildParams(body, stepSize);
  const url = buildUrl(params);
  console.log(`fetching ${body.name} ${stepSize}: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Horizons request failed for ${body.name} ${stepSize}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`Horizons API error for ${body.name} ${stepSize}: ${payload.error}`);
  }

  const samples = parseSamples(payload.result);
  const document = {
    source: 'NASA/JPL Horizons API',
    fetchedAtUtc: new Date().toISOString(),
    body: body.name,
    command: body.command,
    center: body.center,
    stepSize,
    startTime: WINDOW.start,
    stopTime: WINDOW.stop,
    params,
    sampleCount: samples.length,
    samples,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  console.log(`saved ${path.relative(process.cwd(), outputPath)} (${samples.length} samples)`);
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true });

  for (const body of BODIES) {
    const dailyPath = path.join(dataDir, `daily-${body.name}.json`);
    const truthPath = path.join(dataDir, `truth-${body.name}.json`);
    await fetchDataset(body, '1d', dailyPath);
    await fetchDataset(body, '6h', truthPath);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
