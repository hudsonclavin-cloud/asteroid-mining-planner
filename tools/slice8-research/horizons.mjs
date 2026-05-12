import { HORIZONS_BASE_URL, sleep } from './common.mjs';

const MIN_QUERY_INTERVAL_MS = 1_050;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000];

let lastFetchStartedAt = 0;

export function buildUrl(params) {
  return `${HORIZONS_BASE_URL}?${new URLSearchParams(params).toString()}`;
}

function parseVectorLine(line) {
  const matches = [...line.matchAll(/([A-Z]+)\s*=\s*([+-]?\d+\.\d+(?:E[+-]?\d+)?)/g)];
  return Object.fromEntries(matches.map(([, key, value]) => [key, Number(value)]));
}

export function parseSingleState(resultText) {
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

export function parseSamples(resultText) {
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
  for (let index = 0; index < lines.length; index += 3) {
    const timeLine = lines[index];
    const positionLine = lines[index + 1];
    const velocityLine = lines[index + 2];
    if (!timeLine || !positionLine || !velocityLine) {
      throw new Error(`Unexpected Horizons vectors block shape near line index ${index}`);
    }

    const jdMatch = timeLine.match(/^([0-9.]+)\s*=\s*A\.D\.\s*(.+?)\s*TDB$/);
    if (!jdMatch) {
      throw new Error(`Unable to parse Horizons sample near line index ${index}`);
    }
    const position = parseVectorLine(positionLine);
    const velocity = parseVectorLine(velocityLine);
    samples.push({
      jdTdb: Number(jdMatch[1]),
      timestampTdb: jdMatch[2],
      positionKm: {
        x: position.X,
        y: position.Y,
        z: position.Z,
      },
      velocityKms: {
        x: velocity.VX,
        y: velocity.VY,
        z: velocity.VZ,
      },
    });
  }

  return samples;
}

export async function fetchHorizonsJson(params) {
  const elapsedMs = Date.now() - lastFetchStartedAt;
  if (lastFetchStartedAt !== 0 && elapsedMs < MIN_QUERY_INTERVAL_MS) {
    await sleep(MIN_QUERY_INTERVAL_MS - elapsedMs);
  }

  const url = buildUrl(params);
  let lastError = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    lastFetchStartedAt = Date.now();
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(`Horizons API error: ${payload.error}`);
      }
      if (!payload.result.includes('Reference frame : ICRF')) {
        throw new Error('Horizons response did not return ICRF reference frame');
      }
      return payload;
    }

    lastError = new Error(`HTTP ${response.status} for ${url}`);
    if (attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }
  }

  throw lastError;
}

