import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const outputPath = path.join(dataDir, 'horizons-anchors.json');

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const ANCHOR_EPOCH_TDB_JD = 2461161.5;
const ANCHOR_TIME_LABEL = '2026-05-01 00:00:00 TDB';
const MIN_QUERY_INTERVAL_MS = 1_050;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000];
const refresh = process.argv.includes('--refresh');

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
    throw new Error('Horizons anchor response did not contain one complete vectors sample');
  }

  const timeLine = lines[0];
  const positionLine = lines[1];
  const velocityLine = lines[2];
  const timeMatch = timeLine.match(/^([0-9.]+)\s*=\s*A\.D\.\s*(.+?)\s*TDB$/);
  if (!timeMatch) {
    throw new Error('Unable to parse Horizons anchor timestamp line');
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

function buildBodyInventory(mainBelt, famousNeas) {
  return [...mainBelt, ...famousNeas].map((record) => ({
    designation: record.designation,
    spk_id: Number(record.designation),
    name: record.name,
    class: record.class,
    H: record.H,
  }));
}

async function loadExistingDocument() {
  if (refresh) {
    return null;
  }

  try {
    return await readJson(outputPath);
  } catch {
    return null;
  }
}

async function fetchAnchorState(record) {
  const params = buildDatasetParams(record.designation);
  const url = buildUrl(params);

  let lastError = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(`Horizons API error for ${record.designation} ${record.name}: ${payload.error}`);
      }
      if (!payload.result.includes('Reference frame : ICRF')) {
        throw new Error(`Horizons anchor for ${record.designation} ${record.name} did not return ICRF`);
      }
      const state = parseSingleState(payload.result);
      return { params, state };
    }

    lastError = new Error(
      `Horizons anchor request failed for ${record.designation} ${record.name}: HTTP ${response.status}`,
    );
    if (attempt < RETRY_DELAYS_MS.length) {
      const delayMs = RETRY_DELAYS_MS[attempt];
      console.warn(`${lastError.message}; retrying in ${delayMs} ms`);
      await sleep(delayMs);
      continue;
    }
  }

  throw lastError;
}

function validateState(record, state) {
  const positionMagKm = magnitude(state.position_km);
  const velocityMagKms = magnitude(state.velocity_km_per_s);
  const hasNonFiniteComponent =
    [...state.position_km, ...state.velocity_km_per_s].some(
      (value) => !Number.isFinite(value),
    );
  const zeroPosition = positionMagKm === 0;
  const zeroVelocity = velocityMagKms === 0;

  if (hasNonFiniteComponent || zeroPosition || zeroVelocity) {
    throw new Error(`Invalid anchor state for ${record.designation} ${record.name}: ${JSON.stringify(state)}`);
  }

  return {
    position_magnitude_km: positionMagKm,
    velocity_magnitude_km_per_s: velocityMagKms,
  };
}

async function writeDocument(document) {
  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true });

  const mainBelt = await readJson(path.join(dataDir, 'main-belt-top-1000.json'));
  const famousNeas = await readJson(path.join(dataDir, 'famous-neas.json'));
  const inventory = buildBodyInventory(mainBelt, famousNeas);
  const existing = await loadExistingDocument();

  const bodyMap = new Map(existing?.bodies?.map((body) => [body.designation, body]) ?? []);
  const document = existing ?? {
    source: 'NASA/JPL Horizons API',
    generatedAtUtc: new Date().toISOString(),
    anchor_epoch_tdb_jd: ANCHOR_EPOCH_TDB_JD,
    anchor_time_label: ANCHOR_TIME_LABEL,
    params: buildDatasetParams('4'),
    bodyCountExpected: inventory.length,
    bodies: [],
  };

  let lastFetchStartedAt = 0;
  for (let index = 0; index < inventory.length; index += 1) {
    const record = inventory[index];
    if (bodyMap.has(record.designation)) {
      continue;
    }

    const elapsedMs = Date.now() - lastFetchStartedAt;
    if (lastFetchStartedAt !== 0 && elapsedMs < MIN_QUERY_INTERVAL_MS) {
      await sleep(MIN_QUERY_INTERVAL_MS - elapsedMs);
    }

    lastFetchStartedAt = Date.now();
    console.log(
      `fetching anchor ${index + 1}/${inventory.length}: ${record.designation} ${record.name}`,
    );
    const { params, state } = await fetchAnchorState(record);
    const sanity = validateState(record, state);
    bodyMap.set(record.designation, {
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
    });

    document.generatedAtUtc = new Date().toISOString();
    document.bodies = inventory
      .map((body) => bodyMap.get(body.designation))
      .filter(Boolean);
    await writeDocument(document);
  }

  if (document.bodies.length !== inventory.length) {
    throw new Error(
      `Expected ${inventory.length} anchor bodies, got ${document.bodies.length}`,
    );
  }

  console.log(`wrote ${path.relative(process.cwd(), outputPath)} (${document.bodies.length} bodies)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
