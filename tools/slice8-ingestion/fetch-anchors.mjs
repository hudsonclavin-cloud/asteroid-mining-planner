import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const INVENTORY_PATH = path.join(repoRoot, 'tools', 'slice8-research', 'data', 'main-belt-top-10000.json');
const EXISTING_ANCHORS_PATH = path.join(repoRoot, 'tools', 'slice7-research', 'data', 'horizons-anchors.json');

const DEFAULT_OUTPUT_PATH = path.join(__dirname, 'data', 'horizons-anchors-9000.json');
const DEFAULT_CHECKPOINT_PATH = path.join(__dirname, 'checkpoint.json');

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const ANCHOR_EPOCH_TDB_JD = 2461161.5;
const ANCHOR_TIME_LABEL = '2026-05-01 00:00:00 TDB';
const DEFAULT_RATE_MS = 3_000;
const DEFAULT_CHUNK_SIZE = 1_000;
const RETRY_DELAYS_MS = [3_000, 10_000, 30_000];

const MIN_POSITION_MAGNITUDE_KM = 170_000_000;
const MAX_POSITION_MAGNITUDE_KM = 750_000_000;
const MIN_VELOCITY_MAGNITUDE_KM_PER_S = 5;
const MAX_VELOCITY_MAGNITUDE_KM_PER_S = 40;

function parseIntegerFlag(name, fallback = null) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  if (!arg) {
    return fallback;
  }
  const raw = Number(arg.slice(name.length + 3));
  if (!Number.isInteger(raw) || raw < 0) {
    throw new Error(`--${name} must be a non-negative integer`);
  }
  return raw;
}

function parseStringFlag(name, fallback) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function buildUrl(params) {
  return `${HORIZONS_BASE_URL}?${new URLSearchParams(params).toString()}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function magnitude(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function parseVectorLine(line) {
  const matches = [...line.matchAll(/([A-Z]+)\s*=\s*([+-]?\d+\.\d+(?:E[+-]?\d+)?)/g)];
  return Object.fromEntries(matches.map(([, key, value]) => [key, Number(value)]));
}

function parseSingleState(resultText) {
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

  if (lines.length < 3) {
    throw new Error('Horizons response did not contain one complete vectors sample');
  }

  const timeLine = lines[0];
  const positionLine = lines[1];
  const velocityLine = lines[2];
  const timeMatch = timeLine.match(/^([0-9.]+)\s*=\s*A\.D\.\s*(.+?)\s*TDB$/);
  if (!timeMatch) {
    throw new Error('Unable to parse Horizons timestamp line');
  }

  const position = parseVectorLine(positionLine);
  const velocity = parseVectorLine(velocityLine);
  return {
    epoch_tdb_jd: Number(timeMatch[1]),
    timestamp_tdb: timeMatch[2],
    position_km: [position.X, position.Y, position.Z],
    velocity_km_per_s: [velocity.VX, velocity.VY, velocity.VZ],
  };
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
    TLIST: String(ANCHOR_EPOCH_TDB_JD),
  };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, document) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
}

function buildDeltaInventory(mainBelt, existingAnchorDocument, requestedLimit) {
  const existingDesignations = new Set(existingAnchorDocument.bodies.map((body) => body.designation));
  const delta = mainBelt
    .filter((body) => !existingDesignations.has(body.designation))
    .map((body) => ({
      designation: body.designation,
      spk_id: Number(body.designation),
      name: body.name,
      class: body.class,
      H: body.H,
      sbdb_epoch_jd: body.epoch,
    }));

  if (requestedLimit === null) {
    return delta;
  }

  return delta.slice(0, requestedLimit);
}

async function loadCheckpoint(checkpointPath) {
  try {
    return await readJson(checkpointPath);
  } catch {
    return null;
  }
}

async function loadExistingOutput(outputPath) {
  try {
    return await readJson(outputPath);
  } catch {
    return null;
  }
}

async function fetchAnchorState(record) {
  const params = buildDatasetParams(record.designation);
  const url = buildUrl(params);
  let retriesUsed = 0;
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error);
      }
      if (typeof payload.result !== 'string' || !payload.result.includes('Reference frame : ICRF')) {
        throw new Error('Horizons response did not confirm ICRF frame');
      }

      return {
        params,
        retriesUsed,
        state: parseSingleState(payload.result),
      };
    } catch (error) {
      lastError = error;
      if (attempt >= RETRY_DELAYS_MS.length) {
        break;
      }
      const delayMs = RETRY_DELAYS_MS[attempt];
      retriesUsed += 1;
      console.warn(
        `fetch failed for ${record.designation} ${record.name}: ${
          error instanceof Error ? error.message : String(error)
        }; retrying in ${delayMs} ms`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error(
    `Horizons request failed for ${record.designation} ${record.name}: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

function validateAnchorBody(record, state) {
  const positionMagnitudeKm = magnitude(state.position_km);
  const velocityMagnitudeKmPerS = magnitude(state.velocity_km_per_s);
  const components = [...state.position_km, ...state.velocity_km_per_s];
  const hasNonFiniteComponent = components.some((value) => !Number.isFinite(value));

  if (hasNonFiniteComponent || positionMagnitudeKm === 0 || velocityMagnitudeKmPerS === 0) {
    throw new Error(`Invalid state for ${record.designation}: non-finite or zero-magnitude vector`);
  }

  if (positionMagnitudeKm < MIN_POSITION_MAGNITUDE_KM || positionMagnitudeKm > MAX_POSITION_MAGNITUDE_KM) {
    throw new Error(
      `Position magnitude out of expected main-belt range for ${record.designation}: ${positionMagnitudeKm} km`,
    );
  }

  if (
    velocityMagnitudeKmPerS < MIN_VELOCITY_MAGNITUDE_KM_PER_S ||
    velocityMagnitudeKmPerS > MAX_VELOCITY_MAGNITUDE_KM_PER_S
  ) {
    throw new Error(
      `Velocity magnitude out of expected main-belt range for ${record.designation}: ${velocityMagnitudeKmPerS} km/s`,
    );
  }

  return {
    position_magnitude_km: positionMagnitudeKm,
    velocity_magnitude_km_per_s: velocityMagnitudeKmPerS,
  };
}

function buildAnchorBody(record, params, state, sanity) {
  return {
    designation: record.designation,
    spk_id: record.spk_id,
    name: record.name,
    class: record.class,
    H: record.H,
    epoch_tdb_jd: state.epoch_tdb_jd,
    timestamp_tdb: state.timestamp_tdb,
    position_km: state.position_km,
    velocity_km_per_s: state.velocity_km_per_s,
    position_magnitude_km: sanity.position_magnitude_km,
    velocity_magnitude_km_per_s: sanity.velocity_magnitude_km_per_s,
    params,
  };
}

function validateChunk(chunkBodies, expectedChunkSize) {
  if (chunkBodies.length === 0) {
    return;
  }

  if (chunkBodies.length > expectedChunkSize) {
    throw new Error(`Chunk size exceeded expected size ${expectedChunkSize}`);
  }

  for (const body of chunkBodies) {
    validateAnchorBody(body, {
      position_km: body.position_km,
      velocity_km_per_s: body.velocity_km_per_s,
    });
  }
}

function createOutputDocument(inventory, options) {
  return {
    source: 'NASA/JPL Horizons API',
    generatedAtUtc: new Date().toISOString(),
    anchor_epoch_tdb_jd: ANCHOR_EPOCH_TDB_JD,
    anchor_time_label: ANCHOR_TIME_LABEL,
    params: buildDatasetParams('4'),
    bodyCountExpected: inventory.length,
    selectionInventoryPath: path.relative(repoRoot, INVENTORY_PATH),
    existingAnchorSourcePath: path.relative(repoRoot, EXISTING_ANCHORS_PATH),
    reusedExistingAnchorCount: 1008,
    newAnchorCountExpected: inventory.length,
    chunkSize: options.chunkSize,
    rateLimitMs: options.rateMs,
    bodies: [],
  };
}

function createCheckpointDocument(options, inventoryLength, state, status) {
  return {
    version: 1,
    generatedAtUtc: new Date().toISOString(),
    anchorEpochTdbJd: ANCHOR_EPOCH_TDB_JD,
    requestedLimit: options.limit,
    chunkSize: options.chunkSize,
    rateLimitMs: options.rateMs,
    outputPath: options.outputPath,
    nextFetchIndex: state.nextFetchIndex,
    fetchedCount: state.fetchedCount,
    expectedCount: inventoryLength,
    completedChunks: state.completedChunks,
    retryCount: state.retryCount,
    lastCompletedDesignation: state.lastCompletedDesignation,
    status,
  };
}

async function saveProgress(outputPath, outputDocument, checkpointPath, checkpointDocument) {
  outputDocument.generatedAtUtc = new Date().toISOString();
  await writeJson(outputPath, outputDocument);
  await writeJson(checkpointPath, checkpointDocument);
}

function ensureResumeConsistency(checkpoint, options, inventoryLength) {
  if (checkpoint.requestedLimit !== options.limit) {
    throw new Error(
      `Checkpoint limit mismatch: expected ${String(options.limit)}, found ${String(checkpoint.requestedLimit)}`,
    );
  }
  if (checkpoint.outputPath && path.resolve(checkpoint.outputPath) !== path.resolve(options.outputPath)) {
    throw new Error('Checkpoint output path mismatch');
  }
  if (checkpoint.expectedCount !== inventoryLength) {
    throw new Error(`Checkpoint inventory length mismatch: expected ${inventoryLength}, found ${checkpoint.expectedCount}`);
  }
}

async function main() {
  const options = {
    limit: parseIntegerFlag('limit', null),
    chunkSize: parseIntegerFlag('chunk-size', DEFAULT_CHUNK_SIZE),
    rateMs: parseIntegerFlag('rate-ms', DEFAULT_RATE_MS),
    stopAfter: parseIntegerFlag('stop-after', null),
    outputPath: path.resolve(repoRoot, parseStringFlag('output', path.relative(repoRoot, DEFAULT_OUTPUT_PATH))),
    checkpointPath: path.resolve(repoRoot, parseStringFlag('checkpoint', path.relative(repoRoot, DEFAULT_CHECKPOINT_PATH))),
    refresh: hasFlag('refresh'),
  };

  const mainBelt = await readJson(INVENTORY_PATH);
  const existingAnchors = await readJson(EXISTING_ANCHORS_PATH);
  const inventory = buildDeltaInventory(mainBelt, existingAnchors, options.limit);
  const existingOutput = options.refresh ? null : await loadExistingOutput(options.outputPath);
  const existingCheckpoint = options.refresh ? null : await loadCheckpoint(options.checkpointPath);

  const outputDocument = existingOutput ?? createOutputDocument(inventory, options);
  const bodyMap = new Map(outputDocument.bodies.map((body) => [body.designation, body]));

  if (existingCheckpoint) {
    ensureResumeConsistency(existingCheckpoint, options, inventory.length);
  }

  const state = {
    nextFetchIndex: existingCheckpoint?.nextFetchIndex ?? outputDocument.bodies.length,
    fetchedCount: existingCheckpoint?.fetchedCount ?? outputDocument.bodies.length,
    completedChunks: existingCheckpoint?.completedChunks ?? Math.floor(outputDocument.bodies.length / options.chunkSize),
    retryCount: existingCheckpoint?.retryCount ?? 0,
    lastCompletedDesignation: existingCheckpoint?.lastCompletedDesignation ?? null,
  };

  if (outputDocument.bodyCountExpected !== inventory.length) {
    throw new Error(`Output file expected ${outputDocument.bodyCountExpected} bodies, but current inventory has ${inventory.length}`);
  }

  let lastFetchStartedAt = 0;
  let chunkBodies = [];
  let fetchedThisRun = 0;

  for (let index = state.nextFetchIndex; index < inventory.length; index += 1) {
    const record = inventory[index];
    if (bodyMap.has(record.designation)) {
      state.nextFetchIndex = index + 1;
      state.fetchedCount = bodyMap.size;
      state.lastCompletedDesignation = record.designation;
      continue;
    }

    const elapsedMs = Date.now() - lastFetchStartedAt;
    if (lastFetchStartedAt !== 0 && elapsedMs < options.rateMs) {
      await sleep(options.rateMs - elapsedMs);
    }

    lastFetchStartedAt = Date.now();
    console.log(`fetching ${index + 1}/${inventory.length}: ${record.designation} ${record.name}`);
    const { params, retriesUsed, state: anchorState } = await fetchAnchorState(record);
    state.retryCount += retriesUsed;

    const sanity = validateAnchorBody(record, anchorState);
    const body = buildAnchorBody(record, params, anchorState, sanity);
    bodyMap.set(record.designation, body);
    chunkBodies.push(body);

    state.nextFetchIndex = index + 1;
    state.fetchedCount = bodyMap.size;
    state.lastCompletedDesignation = record.designation;
    fetchedThisRun += 1;

    outputDocument.bodies = inventory
      .map((inventoryRecord) => bodyMap.get(inventoryRecord.designation))
      .filter(Boolean);

    if (chunkBodies.length === options.chunkSize) {
      validateChunk(chunkBodies, options.chunkSize);
      state.completedChunks += 1;
      await saveProgress(
        options.outputPath,
        outputDocument,
        options.checkpointPath,
        createCheckpointDocument(options, inventory.length, state, 'running'),
      );
      console.log(`validated chunk ${state.completedChunks} (${chunkBodies.length} bodies)`);
      chunkBodies = [];
    }

    if (options.stopAfter !== null && fetchedThisRun >= options.stopAfter) {
      if (chunkBodies.length > 0) {
        validateChunk(chunkBodies, options.chunkSize);
      }
      await saveProgress(
        options.outputPath,
        outputDocument,
        options.checkpointPath,
        createCheckpointDocument(options, inventory.length, state, 'stopped'),
      );
      console.log(`intentional stop-after reached at ${fetchedThisRun} fetched bodies`);
      process.exitCode = 130;
      return;
    }
  }

  if (chunkBodies.length > 0) {
    validateChunk(chunkBodies, options.chunkSize);
  }

  if (outputDocument.bodies.length !== inventory.length) {
    throw new Error(`Expected ${inventory.length} bodies, got ${outputDocument.bodies.length}`);
  }

  await saveProgress(
    options.outputPath,
    outputDocument,
    options.checkpointPath,
    createCheckpointDocument(options, inventory.length, state, 'complete'),
  );

  console.log(`wrote ${path.relative(repoRoot, options.outputPath)} (${outputDocument.bodies.length} bodies)`);
  console.log(`reused existing Slice 7 anchors: 1008`);
  console.log(`fetched new anchors this run: ${fetchedThisRun}`);
  console.log(`total retries: ${state.retryCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
