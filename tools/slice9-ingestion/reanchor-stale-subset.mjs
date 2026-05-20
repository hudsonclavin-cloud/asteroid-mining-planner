import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { cartesianToElements } from '../slice7-research/state-to-elements.mjs';
import { parseSingleState } from '../slice8-research/horizons.mjs';
import {
  AU_KM,
  COMMON_EPOCH_LABEL,
  COMMON_EPOCH_TDB_JD,
  HORIZONS_BASE_URL,
  VALIDATION_SAMPLE_COUNT,
  buildUrl,
  readJson,
  sleep,
  writeJsonAtomic,
} from '../slice9-research/common.mjs';
import { propagateKeplerian } from '../slice9-research/keplerian-offline.mjs';
import { recomputeDerivedFields } from './derived-fields.mjs';

const INGESTION_ROOT = path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(INGESTION_ROOT, 'data');
const FIXTURE_PATH = path.resolve(INGESTION_ROOT, '..', '..', 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const CHECKPOINT_PATH = path.join(DATA_DIR, 'reanchor-stale-checkpoint.json');
const SUMMARY_PATH = path.join(DATA_DIR, 'reanchor-stale-summary.json');
const TRUTH_CACHE_PATH = path.resolve(INGESTION_ROOT, '..', 'slice9-research', 'data', 'inv014-truth.json');

const STALE_THRESHOLD_DAYS = 180;
const CHECKPOINT_INTERVAL = 25;
const OFFENDER_SPOTCHECKS = ['2009 DN45', '2010 FS', '2024 AL6'];
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

function isEncounterFlagged(record) {
  return record.inv014Tier === 'not-kepler-safe';
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

function listOriginalStaleBodyIds(fixture) {
  return Object.entries(fixture.asteroids)
    .map(([bodyId, record]) => ({
      bodyId,
      designation: record.designation,
      stalenessDays: bodyStalenessDays(record),
    }))
    .filter((entry) => Number.isFinite(entry.stalenessDays) && entry.stalenessDays > STALE_THRESHOLD_DAYS)
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
    'Hybrid SBDB/Horizons: SBDB elements for fresh bodies, Horizons re-anchor at common epoch for stale subset';
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
    if (!['AMO', 'APO', 'ATE', 'IEO'].includes(record.orbitClass)) {
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
        if (!STANDARD_ASTEROID_CLASSES.has(record.orbitClass)) {
          break;
        }
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

export function applyReanchor(record, fetchedState) {
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
    staleThresholdDays: STALE_THRESHOLD_DAYS,
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    fixturePath: path.relative(path.resolve(INGESTION_ROOT, '..', '..'), FIXTURE_PATH),
    totalStaleBodies: inventoryBodyIds.length,
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
  if (checkpoint.staleThresholdDays !== STALE_THRESHOLD_DAYS) {
    throw new Error(
      `Checkpoint staleThresholdDays=${checkpoint.staleThresholdDays} does not match current ${STALE_THRESHOLD_DAYS}`,
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

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function propagateFromFixtureRecord(record, jdTdb) {
  return propagateKeplerian(
    {
      a: record.elements.aKm / AU_KM,
      e: record.elements.e,
      i: (record.elements.iRad * 180) / Math.PI,
      om: (record.elements.omRad * 180) / Math.PI,
      w: (record.elements.wRad * 180) / Math.PI,
      ma: (record.elements.maRad * 180) / Math.PI,
      epoch_tdb: record.elements.epochTdbJd,
    },
    jdTdb,
  );
}

function computeSpotCheck(record, truthDocument) {
  let maxErrorKm = 0;
  for (const truth of truthDocument.samples) {
    const propagated = propagateFromFixtureRecord(record, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    if (errorKm > maxErrorKm) {
      maxErrorKm = errorKm;
    }
  }
  return {
    designation: record.designation,
    anchorSource: record.anchorSource,
    epochTdbJd: record.elements.epochTdbJd,
    maxErrorKm,
  };
}

async function buildSummary(fixture, inventoryBodyIds, state, unresolvedBodies) {
  let truthCache = {};
  try {
    truthCache = await readJson(TRUTH_CACHE_PATH);
  } catch {
    truthCache = {};
  }

  const spotChecks = OFFENDER_SPOTCHECKS.flatMap((designation) => {
    const record = fixture.asteroids[toBodyId(designation)];
    const truthDocument = truthCache[designation];
    if (!record || !truthDocument || !Array.isArray(truthDocument.samples) || truthDocument.samples.length !== VALIDATION_SAMPLE_COUNT) {
      return [];
    }
    return [computeSpotCheck(record, truthDocument)];
  });

  return {
    generatedAtUtc: new Date().toISOString(),
    staleThresholdDays: STALE_THRESHOLD_DAYS,
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    totalBodies: fixture.catalog.totalBodies,
    totalStaleBodies: inventoryBodyIds.length,
    nextFetchIndex: state.nextFetchIndex,
    remainingCount: Math.max(0, inventoryBodyIds.length - state.nextFetchIndex),
    reanchoredCount: state.reanchoredCount,
    staleUnanchoredCount: state.staleUnanchoredCount,
    status: state.status,
    anchorSourceDistribution: anchorSourceDistribution(fixture),
    inv014TierDistribution: fixture.catalog.inv014TierDistribution,
    unresolvedBodies,
    offenderSpotChecks: spotChecks,
  };
}

async function saveProgress(fixture, inventoryBodyIds, state, unresolvedBodies) {
  recomputeCatalogSummaries(fixture);
  const checkpoint = createCheckpoint(inventoryBodyIds, state, unresolvedBodies);
  const summary = await buildSummary(fixture, inventoryBodyIds, state, unresolvedBodies);
  await writeJsonAtomic(FIXTURE_PATH, fixture);
  await writeJsonAtomic(CHECKPOINT_PATH, checkpoint);
  await writeJsonAtomic(SUMMARY_PATH, summary);
}

async function main() {
  const stopAfter = parseIntegerFlag('stop-after', null);
  const fixture = await readJson(FIXTURE_PATH);
  normalizeFixtureMetadata(fixture);

  const checkpoint = await loadCheckpoint();
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
    inventoryBodyIds = listOriginalStaleBodyIds(fixture);
    state = {
      nextFetchIndex: 0,
      reanchoredCount: 0,
      staleUnanchoredCount: 0,
      lastCompletedDesignation: null,
      status: 'in-progress',
    };
    unresolvedBodies = [];
  }

  const startIndex = state.nextFetchIndex;
  const endIndexExclusive =
    stopAfter === null
      ? inventoryBodyIds.length
      : Math.min(inventoryBodyIds.length, startIndex + stopAfter);

  console.log(
    `Slice 9 A.2b re-anchor starting at index ${startIndex}/${inventoryBodyIds.length}; processing through ${endIndexExclusive - 1}`,
  );

  for (let index = state.nextFetchIndex; index < endIndexExclusive; index += 1) {
    const bodyId = inventoryBodyIds[index];
    const record = fixture.asteroids[bodyId];
    if (!record) {
      throw new Error(`Fixture missing stale inventory body ${bodyId}`);
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
    `Slice 9 A.2b ${state.status}: processed ${state.nextFetchIndex}/${inventoryBodyIds.length}, reanchored=${state.reanchoredCount}, unresolved=${state.staleUnanchoredCount}`,
  );
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch(async (error) => {
    try {
      const fixture = await readJson(FIXTURE_PATH);
      normalizeFixtureMetadata(fixture);
      const checkpoint = (await loadCheckpoint()) ?? {};
      const inventoryBodyIds = checkpoint.inventoryBodyIds ?? listOriginalStaleBodyIds(fixture);
      const state = {
        nextFetchIndex: checkpoint.nextFetchIndex ?? 0,
        reanchoredCount: checkpoint.reanchoredCount ?? 0,
        staleUnanchoredCount: checkpoint.staleUnanchoredCount ?? 0,
        lastCompletedDesignation: checkpoint.lastCompletedDesignation ?? null,
        status: 'failed',
      };
      const unresolvedBodies = Array.isArray(checkpoint.unresolvedBodies) ? checkpoint.unresolvedBodies : [];
      await saveProgress(fixture, inventoryBodyIds, state, unresolvedBodies);
    } catch {
      // Best effort only; preserve the original failure below.
    }
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
