import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchHorizonsJson, parseSamples } from '../slice8-research/horizons.mjs';
import {
  buildSlice8CutoverSample,
  INV013_BARS_KM,
  SLICE8_CUTOVER_PER_BAND_COUNT,
  SLICE8_CUTOVER_SAMPLE_SEED,
} from './slice8-cutover-sample.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');
const outputPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'slice8-cutover-truth.json');
const anchorEpochTdbJd = 2461161.5;
const refresh = process.argv.includes('--refresh');

function buildTruthParams(designation) {
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
    START_TIME: '2026-05-01',
    STOP_TIME: '2026-07-30',
    STEP_SIZE: "'1 d'",
  };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJsonAtomic(filePath, document) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function main() {
  const fixture = await readJson(fixturePath);
  const sample = buildSlice8CutoverSample(fixture.asteroids);

  let existingBodies = new Map();
  if (!refresh) {
    try {
      const existing = await readJson(outputPath);
      existingBodies = new Map((existing.bodies ?? []).map((body) => [body.bodyId, body]));
    } catch {}
  }

  const fetchedBodies = [];
  for (const body of sample.flat) {
    const cached = existingBodies.get(body.bodyId);
    if (cached && Array.isArray(cached.samples) && cached.samples.length === 91) {
      fetchedBodies.push(cached);
      console.log(`cache hit: ${body.bodyId}`);
      continue;
    }

    const params = buildTruthParams(body.designation);
    console.log(`fetching ${body.bodyId} (${body.eccentricityBand})`);
    const payload = await fetchHorizonsJson(params);
    const samples = parseSamples(payload.result);
    fetchedBodies.push({
      designation: body.designation,
      bodyId: body.bodyId,
      name: body.name,
      class: body.class,
      H: body.H,
      eccentricityBand: body.eccentricityBand,
      params,
      sampleCount: samples.length,
      samples,
    });
  }

  fetchedBodies.sort((left, right) => left.bodyId.localeCompare(right.bodyId, 'en', { numeric: true }));

  const document = {
    version: 1,
    generatedAtUtc: new Date().toISOString(),
    source: 'NASA/JPL Horizons API',
    anchorEpochTdbJd,
    truthWindow: {
      startTime: '2026-05-01',
      stopTime: '2026-07-30',
      stepSize: '1 d',
      sampleCount: 91,
    },
    sampleSeed: SLICE8_CUTOVER_SAMPLE_SEED,
    perBandCount: SLICE8_CUTOVER_PER_BAND_COUNT,
    barsKm: INV013_BARS_KM,
    bodies: fetchedBodies,
  };

  await writeJsonAtomic(outputPath, document);
  console.log(`wrote ${path.relative(repoRoot, outputPath)} (${fetchedBodies.length} bodies)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
