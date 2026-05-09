import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const truthDir = path.join(dataDir, 'horizons-truth');

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const VALIDATION_WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
  stepSize: "'1 d'",
};
const refresh = process.argv.includes('--refresh');

const BRIGHTNESS_SAMPLE_DESIGNATIONS = ['4', '2', '10', '16'];
const ECCENTRICITY_BINS = [
  [0.0, 0.05],
  [0.05, 0.1],
  [0.1, 0.15],
  [0.15, 0.2],
  [0.2, 0.3],
];
const FAMOUS_NEA_DESIGNATIONS = [
  '101955',
  '99942',
  '433',
  '25143',
  '162173',
  '4179',
  '1620',
  '4769',
];

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

function buildDatasetParams(designation) {
  return {
    format: 'json',
    COMMAND: `';${designation}'`,
    CENTER: '500@10',
    EPHEM_TYPE: 'VECTORS',
    REF_SYSTEM: 'ICRF',
    REF_PLANE: 'FRAME',
    TIME_TYPE: 'TDB',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '2',
    START_TIME: VALIDATION_WINDOW.start,
    STOP_TIME: VALIDATION_WINDOW.stop,
    STEP_SIZE: VALIDATION_WINDOW.stepSize,
  };
}

function chooseSampleSet(mainBelt, famousNeas) {
  const cutoffBody = mainBelt.at(-1);
  const chosen = new Set([...BRIGHTNESS_SAMPLE_DESIGNATIONS, cutoffBody.designation]);

  const brightnessSample = BRIGHTNESS_SAMPLE_DESIGNATIONS.map((designation) =>
    mainBelt.find((record) => record.designation === designation),
  );
  brightnessSample.push(cutoffBody);

  const eccentricitySample = [];
  for (const [minE, maxE] of ECCENTRICITY_BINS) {
    const match = mainBelt.find(
      (record) =>
        !chosen.has(record.designation) &&
        record.e >= minE &&
        record.e < maxE,
    );
    if (!match) {
      throw new Error(`Unable to find main-belt sample for eccentricity bin [${minE}, ${maxE})`);
    }
    chosen.add(match.designation);
    eccentricitySample.push({
      ...match,
      sample_reason: `eccentricity_${minE.toFixed(2)}_${maxE.toFixed(2)}`,
    });
  }

  return [
    ...brightnessSample.map((record, index) => ({
      ...record,
      sample_reason: index < 4 ? 'brightness_anchor' : 'brightness_cutoff',
    })),
    ...eccentricitySample,
    ...famousNeas.map((record) => ({
      ...record,
      sample_reason: 'curated_nea',
    })),
  ];
}

async function fetchDataset(record) {
  const outputPath = path.join(truthDir, `asteroid-${record.designation}-90d.json`);
  if (!refresh) {
    try {
      await fs.access(outputPath);
      console.log(`cache hit: ${path.relative(process.cwd(), outputPath)}`);
      return;
    } catch {}
  }

  const params = buildDatasetParams(record.designation);
  const url = buildUrl(params);
  console.log(`fetching ${record.designation} ${record.name}: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Horizons request failed for asteroid ${record.designation}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`Horizons API error for asteroid ${record.designation}: ${payload.error}`);
  }

  if (!payload.result.includes('Reference frame : ICRF')) {
    throw new Error(`Horizons asteroid ${record.designation} did not return ICRF reference frame`);
  }

  const samples = parseSamples(payload.result);
  const document = {
    source: 'NASA/JPL Horizons API',
    fetchedAtUtc: new Date().toISOString(),
    designation: record.designation,
    name: record.name,
    class: record.class,
    H: record.H,
    params,
    sampleCount: samples.length,
    referenceFrameHeader: 'ICRF',
    samples,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  console.log(`saved ${path.relative(process.cwd(), outputPath)} (${samples.length} samples)`);
}

async function main() {
  await fs.mkdir(truthDir, { recursive: true });

  const mainBelt = JSON.parse(
    await fs.readFile(path.join(dataDir, 'main-belt-top-1000.json'), 'utf8'),
  );
  const famousNeas = JSON.parse(
    await fs.readFile(path.join(dataDir, 'famous-neas.json'), 'utf8'),
  );
  const sampleSet = chooseSampleSet(mainBelt, famousNeas);
  if (sampleSet.length !== 18) {
    throw new Error(`Expected 18 sample asteroids, got ${sampleSet.length}`);
  }

  await fs.writeFile(
    path.join(dataDir, 'sample-asteroids.json'),
    `${JSON.stringify(sampleSet, null, 2)}\n`,
    'utf8',
  );

  for (const record of sampleSet) {
    await fetchDataset(record);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
