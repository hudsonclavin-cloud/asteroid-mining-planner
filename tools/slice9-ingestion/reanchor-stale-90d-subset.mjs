import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { cartesianToElements } from '../slice7-research/state-to-elements.mjs';
import { parseSingleState } from '../slice8-research/horizons.mjs';
import {
  COMMON_EPOCH_LABEL,
  COMMON_EPOCH_TDB_JD,
  HORIZONS_BASE_URL,
  buildUrl,
  readJson,
  sleep,
  writeJsonAtomic,
} from '../slice9-research/common.mjs';
import { recomputeDerivedFields } from './derived-fields.mjs';

const INGESTION_ROOT = path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(INGESTION_ROOT, 'data');
const REPO_ROOT = path.resolve(INGESTION_ROOT, '..', '..');

const LIVE_FIXTURE_PATH = path.join(REPO_ROOT, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const TMP_FIXTURE_PATH = `${LIVE_FIXTURE_PATH}.tmp`;
const CHECKPOINT_PATH = path.join(DATA_DIR, 'reanchor-90d-checkpoint.json');
const SUMMARY_PATH = path.join(DATA_DIR, 'reanchor-90d-summary.json');

const MIN_STALE_THRESHOLD_DAYS = 90;
const MAX_STALE_THRESHOLD_DAYS = 180;
const CHECKPOINT_INTERVAL = 25;
const ANOMALY_TAIL_CLASSES = new Set(['ETC', 'HTC', 'JFC']);
const STANDARD_ASTEROID_CLASSES = new Set(['AMO', 'APO', 'ATE', 'IEO']);
const MIN_QUERY_INTERVAL_MS = 1_050;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000];
const UNRESOLVED_ERROR_PATTERNS = [
  'no matches found',
  'cannot interpret',
  'multiple major-bodies match',
  'matching small-bodies',
  'target body name not recognized',
  'unknown target',
  'no ephemeris for target',
  'dxread',
  'out of bounds',
  'if an spk id, look-up with "des=',
];

let lastFetchStartedAt = 0;

function parseIntegerFlag(name, fallback = null) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  if (!arg) {
    return fallback;
  }
  const value = Number(arg.slice(name.length + 3));
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`--${name} must be a non-negative integer`);
  }
  return value;
}

function hasBooleanFlag(name) {
  return process.argv.includes(`--${name}`);
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim().length > 0))];
}

function buildSingleStateParams(command) {
  return {
    format: 'json',
    COMMAND: `';${command}'`,
    CENTER: '500@10',
    EPHEM_TYPE: 'VECTORS',
    REF_SYSTEM: 'ICRF',
    REF_PLANE: 'FRAME',
    TIME_TYPE: 'TDB',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '2',
    TLIST: String(COMMON_EPOCH_TDB_JD),
  };
}

async function fetchHorizonsJsonLenient(params) {
  const elapsedMs = Date.now() - lastFetchStartedAt;
  if (lastFetchStartedAt !== 0 && elapsedMs < MIN_QUERY_INTERVAL_MS) {
    await sleep(MIN_QUERY_INTERVAL_MS - elapsedMs);
  }

  const url = buildUrl(HORIZONS_BASE_URL, params);
  let lastError = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    lastFetchStartedAt = Date.now();
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      const payload = await response.json();
      if (payload.error) {
        throw new Error(`Horizons API error: ${payload.error}`);
      }
      if (typeof payload.result !== 'string' || payload.result.length === 0) {
        throw new Error('Horizons response did not include a result payload');
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }
  throw lastError;
}

function isUnresolvedHorizonsError(error) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return UNRESOLVED_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

function toBodyId(designation) {
  return `asteroid-${designation}`;
}

function bodyStalenessDays(record) {
  return COMMON_EPOCH_TDB_JD - Number(record.elements?.epochTdbJd);
}

function isExtensionCandidate(record) {
  const anchorSource = record.anchorSource ?? 'sbdb';
  const stalenessDays = bodyStalenessDays(record);
  return (
    anchorSource === 'sbdb' &&
    STANDARD_ASTEROID_CLASSES.has(record.orbitClass) &&
    !ANOMALY_TAIL_CLASSES.has(record.orbitClass) &&
    Number.isFinite(stalenessDays) &&
    stalenessDays > MIN_STALE_THRESHOLD_DAYS &&
    stalenessDays <= MAX_STALE_THRESHOLD_DAYS
  );
}

function listCandidateBodyIds(fixture) {
  return Object.entries(fixture.asteroids)
    .map(([bodyId, record]) => ({
      bodyId,
      designation: record.designation,
      stalenessDays: bodyStalenessDays(record),
    }))
    .filter(({ bodyId }) => isExtensionCandidate(fixture.asteroids[bodyId]))
    .sort((left, right) => {
      if (right.stalenessDays !== left.stalenessDays) {
        return right.stalenessDays - left.stalenessDays;
      }
      return left.designation.localeCompare(right.designation, 'en', { numeric: true });
    })
    .map((entry) => entry.bodyId);
}

function updateTopLevelMetadata(fixture) {
  fixture.anchorSource =
    'Hybrid SBDB/Horizons: SBDB elements for fresh bodies, Horizons re-anchor at common epoch for stale subsets';
  fixture.propagation.method = 'keplerian-two-body';
  fixture.propagation.epochPolicy = 'hybrid-per-body-sbdb-or-horizons-reanchor';
}

function normalizeBodyMetadata(record) {
  if (!record.anchorSource) {
    record.anchorSource = 'sbdb';
  }
  if (!('reanchorEpochTdbJd' in record)) {
    record.reanchorEpochTdbJd = null;
  }
}

function normalizeFixtureMetadata(fixture) {
  updateTopLevelMetadata(fixture);
  for (const record of Object.values(fixture.asteroids)) {
    normalizeBodyMetadata(record);
  }
}

function recomputeCatalogSummaries(fixture) {
  const classDistribution = new Map();
  const tierDistribution = new Map([
    ['visualization-tier', 0],
    ['planning-tier', 0],
    ['not-kepler-safe', 0],
  ]);
  let missingAbsoluteMagnitudeCount = 0;
  let anomalyTailCount = 0;

  for (const record of Object.values(fixture.asteroids)) {
    classDistribution.set(record.orbitClass, (classDistribution.get(record.orbitClass) ?? 0) + 1);
    tierDistribution.set(record.inv014Tier, (tierDistribution.get(record.inv014Tier) ?? 0) + 1);
    if (record.H === null) {
      missingAbsoluteMagnitudeCount += 1;
    }
    if (!STANDARD_ASTEROID_CLASSES.has(record.orbitClass)) {
      anomalyTailCount += 1;
    }
  }

  fixture.catalog.classDistribution = Object.fromEntries(
    [...classDistribution.entries()].sort(([left], [right]) =>
      String(left).localeCompare(String(right), 'en', { numeric: true }),
    ),
  );
  fixture.catalog.inv014TierDistribution = {
    'visualization-tier': tierDistribution.get('visualization-tier') ?? 0,
    'planning-tier': tierDistribution.get('planning-tier') ?? 0,
    'not-kepler-safe': tierDistribution.get('not-kepler-safe') ?? 0,
  };
  fixture.catalog.missingAbsoluteMagnitudeCount = missingAbsoluteMagnitudeCount;
  fixture.catalog.anomalyTailCount = anomalyTailCount;
}

function buildQueryCandidates(record) {
  const candidates = [record.designation];
  if (STANDARD_ASTEROID_CLASSES.has(record.orbitClass)) {
    candidates.push(String(record.spkId));
    if (record.name && record.name !== record.designation) {
      candidates.push(record.name);
    }
  }
  return unique(candidates);
}

async function fetchReanchorState(record) {
  const candidates = buildQueryCandidates(record);
  let lastUnresolvedError = null;

  for (const command of candidates) {
    try {
      const payload = await fetchHorizonsJsonLenient(buildSingleStateParams(command));
      if (!payload.result.includes('$$SOE') || !payload.result.includes('$$EOE')) {
        lastUnresolvedError = new Error('Horizons response did not include a vectors block');
        continue;
      }
      return {
        command,
        state: parseSingleState(payload.result),
      };
    } catch (error) {
      if (isUnresolvedHorizonsError(error)) {
        lastUnresolvedError = error;
        continue;
      }
      throw error;
    }
  }

  return {
    command: candidates[0] ?? record.designation,
    state: null,
    unresolvedReason:
      lastUnresolvedError instanceof Error ? lastUnresolvedError.message : 'Horizons target unresolved',
  };
}

function applyReanchor(record, fetchedState) {
  const elements = cartesianToElements(fetchedState.state);
  record.anchor = {
    epochTdbJd: fetchedState.state.epoch_tdb_jd,
    positionKm: [...fetchedState.state.position_km],
    velocityKmPerS: [...fetchedState.state.velocity_km_per_s],
  };
  record.elements = {
    aKm: elements.a,
    e: elements.e,
    iRad: elements.i,
    omRad: elements.om,
    wRad: elements.w,
    maRad: elements.ma,
    epochTdbJd: elements.epoch_tdb_jd,
  };
  record.anchorSource = 'horizons-reanchor';
  record.reanchorEpochTdbJd = fetchedState.state.epoch_tdb_jd;
  recomputeDerivedFields(record);
}

function markStaleUnanchored(record) {
  record.anchorSource = 'stale-unanchored';
  record.reanchorEpochTdbJd = null;
  record.inv014Tier = 'not-kepler-safe';
}

function createCheckpoint(inventoryBodyIds, state, unresolvedBodies) {
  return {
    version: 1,
    generatedAtUtc: new Date().toISOString(),
    minStaleThresholdDays: MIN_STALE_THRESHOLD_DAYS,
    maxStaleThresholdDays: MAX_STALE_THRESHOLD_DAYS,
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    fixturePath: path.relative(REPO_ROOT, LIVE_FIXTURE_PATH),
    tmpFixturePath: path.relative(REPO_ROOT, TMP_FIXTURE_PATH),
    totalCandidateBodies: inventoryBodyIds.length,
    inventoryBodyIds,
    nextFetchIndex: state.nextFetchIndex,
    reanchoredCount: state.reanchoredCount,
    staleUnanchoredCount: state.staleUnanchoredCount,
    lastCompletedDesignation: state.lastCompletedDesignation,
    status: state.status,
    unresolvedBodies,
  };
}

async function loadCheckpoint() {
  try {
    return await readJson(CHECKPOINT_PATH);
  } catch {
    return null;
  }
}

function ensureResumeConsistency(checkpoint) {
  if (
    checkpoint.minStaleThresholdDays !== MIN_STALE_THRESHOLD_DAYS ||
    checkpoint.maxStaleThresholdDays !== MAX_STALE_THRESHOLD_DAYS
  ) {
    throw new Error(
      `Checkpoint threshold window ${checkpoint.minStaleThresholdDays}-${checkpoint.maxStaleThresholdDays} does not match current ${MIN_STALE_THRESHOLD_DAYS}-${MAX_STALE_THRESHOLD_DAYS}`,
    );
  }
  if (checkpoint.commonEpochTdbJd !== COMMON_EPOCH_TDB_JD) {
    throw new Error(
      `Checkpoint commonEpochTdbJd=${checkpoint.commonEpochTdbJd} does not match current ${COMMON_EPOCH_TDB_JD}`,
    );
  }
  if (!Array.isArray(checkpoint.inventoryBodyIds) || checkpoint.inventoryBodyIds.length === 0) {
    throw new Error('Checkpoint must define non-empty inventoryBodyIds');
  }
}

function anchorSourceDistribution(fixture) {
  const distribution = {
    sbdb: 0,
    'horizons-reanchor': 0,
    'stale-unanchored': 0,
  };
  for (const record of Object.values(fixture.asteroids)) {
    normalizeBodyMetadata(record);
    distribution[record.anchorSource] += 1;
  }
  return distribution;
}

async function buildSummary(fixture, inventoryBodyIds, state, unresolvedBodies) {
  return {
    generatedAtUtc: new Date().toISOString(),
    minStaleThresholdDays: MIN_STALE_THRESHOLD_DAYS,
    maxStaleThresholdDays: MAX_STALE_THRESHOLD_DAYS,
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    totalBodies: fixture.catalog.totalBodies,
    totalCandidateBodies: inventoryBodyIds.length,
    nextFetchIndex: state.nextFetchIndex,
    remainingCount: Math.max(0, inventoryBodyIds.length - state.nextFetchIndex),
    reanchoredCount: state.reanchoredCount,
    staleUnanchoredCount: state.staleUnanchoredCount,
    status: state.status,
    anchorSourceDistribution: anchorSourceDistribution(fixture),
    inv014TierDistribution: fixture.catalog.inv014TierDistribution,
    unresolvedBodies,
  };
}

async function saveProgress(fixture, inventoryBodyIds, state, unresolvedBodies) {
  recomputeCatalogSummaries(fixture);
  const checkpoint = createCheckpoint(inventoryBodyIds, state, unresolvedBodies);
  const summary = await buildSummary(fixture, inventoryBodyIds, state, unresolvedBodies);
  await writeJsonAtomic(TMP_FIXTURE_PATH, fixture);
  await writeJsonAtomic(CHECKPOINT_PATH, checkpoint);
  await writeJsonAtomic(SUMMARY_PATH, summary);
}

async function readWorkingFixture(checkpoint) {
  if (checkpoint) {
    try {
      return await readJson(TMP_FIXTURE_PATH);
    } catch {
      throw new Error(`Checkpoint exists at ${CHECKPOINT_PATH}, but working temp fixture is missing at ${TMP_FIXTURE_PATH}`);
    }
  }

  const liveFixture = await readJson(LIVE_FIXTURE_PATH);
  try {
    await readJson(TMP_FIXTURE_PATH);
    throw new Error(`Refusing to start a fresh run because temp fixture already exists at ${TMP_FIXTURE_PATH}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('Refusing to start a fresh run')
    ) {
      throw error;
    }
  }
  return liveFixture;
}

async function main() {
  const stopAfter = parseIntegerFlag('stop-after', null);
  const inventoryOnly = hasBooleanFlag('inventory-only');
  const checkpoint = await loadCheckpoint();
  const fixture = await readWorkingFixture(checkpoint);
  normalizeFixtureMetadata(fixture);

  let inventoryBodyIds;
  let state;
  let unresolvedBodies;

  if (checkpoint) {
    ensureResumeConsistency(checkpoint);
    inventoryBodyIds = checkpoint.inventoryBodyIds;
    state = {
      nextFetchIndex: checkpoint.nextFetchIndex,
      reanchoredCount: checkpoint.reanchoredCount,
      staleUnanchoredCount: checkpoint.staleUnanchoredCount,
      lastCompletedDesignation: checkpoint.lastCompletedDesignation ?? null,
      status: 'in-progress',
    };
    unresolvedBodies = Array.isArray(checkpoint.unresolvedBodies) ? checkpoint.unresolvedBodies : [];
  } else {
    inventoryBodyIds = listCandidateBodyIds(fixture);
    state = {
      nextFetchIndex: 0,
      reanchoredCount: 0,
      staleUnanchoredCount: 0,
      lastCompletedDesignation: null,
      status: 'in-progress',
    };
    unresolvedBodies = [];
  }

  if (inventoryOnly) {
    console.log(
      JSON.stringify(
        {
          minStaleThresholdDays: MIN_STALE_THRESHOLD_DAYS,
          maxStaleThresholdDays: MAX_STALE_THRESHOLD_DAYS,
          candidateCount: inventoryBodyIds.length,
          checkpointStatus: checkpoint?.status ?? null,
          nextFetchIndex: state.nextFetchIndex,
          reanchoredCount: state.reanchoredCount,
          staleUnanchoredCount: state.staleUnanchoredCount,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!checkpoint) {
    await writeJsonAtomic(TMP_FIXTURE_PATH, fixture);
  }

  const startIndex = state.nextFetchIndex;
  const endIndexExclusive =
    stopAfter === null
      ? inventoryBodyIds.length
      : Math.min(inventoryBodyIds.length, startIndex + stopAfter);

  console.log(
    `Slice 9 A.2b 90d extension starting at index ${startIndex}/${inventoryBodyIds.length}; processing through ${endIndexExclusive - 1}`,
  );

  for (let index = state.nextFetchIndex; index < endIndexExclusive; index += 1) {
    const bodyId = inventoryBodyIds[index];
    const record = fixture.asteroids[bodyId];
    if (!record) {
      throw new Error(`Fixture missing candidate body ${bodyId}`);
    }

    const fetched = await fetchReanchorState(record);
    if (fetched.state) {
      applyReanchor(record, fetched);
      state.reanchoredCount += 1;
    } else {
      markStaleUnanchored(record);
      state.staleUnanchoredCount += 1;
      unresolvedBodies.push({
        bodyId,
        designation: record.designation,
        spkId: record.spkId,
        reason: fetched.unresolvedReason,
      });
    }

    state.nextFetchIndex = index + 1;
    state.lastCompletedDesignation = record.designation;

    if (
      state.nextFetchIndex % CHECKPOINT_INTERVAL === 0 ||
      state.nextFetchIndex === endIndexExclusive ||
      state.nextFetchIndex === inventoryBodyIds.length
    ) {
      await saveProgress(fixture, inventoryBodyIds, state, unresolvedBodies);
      console.log(
        `checkpoint ${state.nextFetchIndex}/${inventoryBodyIds.length} reanchored=${state.reanchoredCount} unresolved=${state.staleUnanchoredCount}`,
      );
    }
  }

  state.status = state.nextFetchIndex >= inventoryBodyIds.length ? 'completed' : 'partial';
  await saveProgress(fixture, inventoryBodyIds, state, unresolvedBodies);
  console.log(
    `Slice 9 A.2b 90d extension ${state.status}: processed ${state.nextFetchIndex}/${inventoryBodyIds.length}, reanchored=${state.reanchoredCount}, unresolved=${state.staleUnanchoredCount}`,
  );
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch(async (error) => {
    try {
      const checkpoint = (await loadCheckpoint()) ?? null;
      const fixture = await readWorkingFixture(checkpoint);
      normalizeFixtureMetadata(fixture);
      const inventoryBodyIds = checkpoint?.inventoryBodyIds ?? listCandidateBodyIds(fixture);
      const state = {
        nextFetchIndex: checkpoint?.nextFetchIndex ?? 0,
        reanchoredCount: checkpoint?.reanchoredCount ?? 0,
        staleUnanchoredCount: checkpoint?.staleUnanchoredCount ?? 0,
        lastCompletedDesignation: checkpoint?.lastCompletedDesignation ?? null,
        status: 'failed',
      };
      const unresolvedBodies = Array.isArray(checkpoint?.unresolvedBodies) ? checkpoint.unresolvedBodies : [];
      await saveProgress(fixture, inventoryBodyIds, state, unresolvedBodies);
    } catch {
      // Best effort only; preserve the original failure below.
    }
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
