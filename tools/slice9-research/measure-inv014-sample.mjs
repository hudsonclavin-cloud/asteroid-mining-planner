import path from 'node:path';

import { cartesianToElements, elementsRadiansKmToPropagationInput } from '../slice7-research/state-to-elements.mjs';
import { fetchHorizonsJson, parseSamples } from '../slice8-research/horizons.mjs';
import {
  CAD_API_URL,
  COMMON_EPOCH_TDB_JD,
  COMMON_EPOCH_LABEL,
  DATA_DIR,
  VALIDATION_SAMPLE_COUNT,
  VALIDATION_START,
  VALIDATION_STEP,
  VALIDATION_STOP,
  buildUrl,
  deterministicShuffle,
  eccentricityBand,
  fetchJson,
  kmVectorMagnitude,
  normalizeSbdbRows,
  quantile,
  readJson,
  summarizeNumeric,
  toSortedObject,
  writeJsonAtomic,
} from './common.mjs';
import { propagateKeplerian } from './keplerian-offline.mjs';

const inputRawPath = path.join(DATA_DIR, 'sbdb-nea-raw.json');
const cadCachePath = path.join(DATA_DIR, 'cad-flags.json');
const truthCachePath = path.join(DATA_DIR, 'inv014-truth.json');
const outputPath = path.join(DATA_DIR, 'inv014-sample-results.json');

const SAMPLE_SEED = 9;
const TARGET_PER_FLAG_PER_STRATUM = 4;
const MAX_CAD_CANDIDATES_PER_STRATUM = 80;
const CAD_DIST_MAX_AU = '0.05';
const CAD_BODIES = ['Earth', 'Venus'];

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
    START_TIME: VALIDATION_START,
    STOP_TIME: VALIDATION_STOP,
    STEP_SIZE: VALIDATION_STEP,
  };
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function stratumKeyForRow(row) {
  return `${row.orbitClass}|${row.eccentricityBand}`;
}

function classificationLabel(flagged) {
  return flagged ? 'encounter-flagged' : 'not-flagged';
}

async function loadOptionalJson(filePath, fallbackValue) {
  try {
    return await readJson(filePath);
  } catch {
    return fallbackValue;
  }
}

async function fetchCadFlag(designation, cadCache) {
  if (designation in cadCache) {
    return cadCache[designation];
  }

  const bodyResults = {};
  let flagged = false;

  for (const body of CAD_BODIES) {
    const url = buildUrl(CAD_API_URL, {
      des: designation,
      body,
      'date-min': VALIDATION_START,
      'date-max': VALIDATION_STOP,
      'dist-max': CAD_DIST_MAX_AU,
      sort: 'date',
    });
    const payload = await fetchJson(url);
    const count = Number(payload.count ?? 0);
    bodyResults[body] = {
      count,
      first: Array.isArray(payload.data) && payload.data.length > 0 ? payload.data[0] : null,
    };
    if (count > 0) {
      flagged = true;
    }
  }

  cadCache[designation] = {
    flagged,
    window: {
      start: VALIDATION_START,
      stop: VALIDATION_STOP,
      distMaxAu: CAD_DIST_MAX_AU,
      bodies: CAD_BODIES,
    },
    bodyResults,
  };
  await writeJsonAtomic(cadCachePath, cadCache);
  return cadCache[designation];
}

function truthSamplesToAnchorState(sample) {
  return {
    epoch_tdb_jd: sample.jdTdb,
    position_km: [sample.positionKm.x, sample.positionKm.y, sample.positionKm.z],
    velocity_km_per_s: [sample.velocityKms.x, sample.velocityKms.y, sample.velocityKms.z],
  };
}

async function fetchTruthSamples(designation, truthCache) {
  if (designation in truthCache) {
    return truthCache[designation];
  }

  const payload = await fetchHorizonsJson(buildTruthParams(designation));
  const samples = parseSamples(payload.result);
  if (samples.length !== VALIDATION_SAMPLE_COUNT) {
    throw new Error(`Expected ${VALIDATION_SAMPLE_COUNT} truth samples for ${designation}, got ${samples.length}`);
  }

  truthCache[designation] = {
    designation,
    anchorEpochTdbJd: samples[0].jdTdb,
    sampleCount: samples.length,
    samples,
  };
  await writeJsonAtomic(truthCachePath, truthCache);
  return truthCache[designation];
}

function analyzeBody(row, flagInfo, truthDocument) {
  const anchorState = truthSamplesToAnchorState(truthDocument.samples[0]);
  const anchorElements = cartesianToElements(anchorState);
  const propagationInput = elementsRadiansKmToPropagationInput(anchorElements);

  let maxErrorKm = 0;
  let sumSquaredErrorKm = 0;
  const dailyErrorsKm = [];

  for (const truth of truthDocument.samples) {
    const propagated = propagateKeplerian(propagationInput, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    dailyErrorsKm.push(errorKm);
    maxErrorKm = Math.max(maxErrorKm, errorKm);
    sumSquaredErrorKm += errorKm * errorKm;
  }

  const sortedErrors = [...dailyErrorsKm].sort((left, right) => left - right);

  return {
    designation: row.designation,
    spkid: row.spkid,
    fullName: row.fullName,
    orbitClass: row.orbitClass,
    eccentricityBand: row.eccentricityBand,
    closeApproachFlag: flagInfo.flagged,
    conditionCode: row.conditionCode,
    dataArcDays: row.dataArcDays,
    hAbsMag: row.hAbsMag,
    aAu: row.aAu,
    e: row.e,
    iDeg: row.iDeg,
    anchorEpochTdbJd: truthDocument.anchorEpochTdbJd,
    anchorDistanceKm: kmVectorMagnitude({
      x: anchorState.position_km[0],
      y: anchorState.position_km[1],
      z: anchorState.position_km[2],
    }),
    maxErrorKm,
    medianErrorKm: quantile(sortedErrors, 0.5),
    p90ErrorKm: quantile(sortedErrors, 0.9),
    rmsErrorKm: Math.sqrt(sumSquaredErrorKm / dailyErrorsKm.length),
    truthPointsChecked: dailyErrorsKm.length,
    cadBodiesTriggered: Object.entries(flagInfo.bodyResults)
      .filter(([, value]) => value.count > 0)
      .map(([body]) => body),
  };
}

function summarizeResults(results) {
  const byStratum = {};
  const byEncounterFlag = {};

  for (const result of results) {
    const stratumKey = `${result.orbitClass} | ${result.eccentricityBand} | ${classificationLabel(result.closeApproachFlag)}`;
    const encounterKey = classificationLabel(result.closeApproachFlag);
    (byStratum[stratumKey] ??= []).push(result.maxErrorKm);
    (byEncounterFlag[encounterKey] ??= []).push(result.maxErrorKm);
  }

  const stratumSummary = Object.fromEntries(
    Object.entries(byStratum)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => [key, summarizeNumeric(values)]),
  );
  const encounterSummary = Object.fromEntries(
    Object.entries(byEncounterFlag)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => [key, summarizeNumeric(values)]),
  );

  const worstBodies = [...results]
    .sort((left, right) => right.maxErrorKm - left.maxErrorKm)
    .slice(0, 15)
    .map((result) => ({
      designation: result.designation,
      orbitClass: result.orbitClass,
      eccentricityBand: result.eccentricityBand,
      closeApproachFlag: result.closeApproachFlag,
      maxErrorKm: result.maxErrorKm,
      cadBodiesTriggered: result.cadBodiesTriggered,
    }));

  return {
    sampleCount: results.length,
    stratumSummary,
    encounterSummary,
    worstBodies,
  };
}

async function main() {
  const payload = await readJson(inputRawPath);
  const rows = normalizeSbdbRows(payload).filter(
    (row) => !row.hasDegenerateElements && ['AMO', 'APO', 'ATE', 'IEO'].includes(row.orbitClass),
  );

  const cadCache = await loadOptionalJson(cadCachePath, {});
  const truthCache = await loadOptionalJson(truthCachePath, {});

  const pools = new Map();
  for (const row of rows) {
    const key = stratumKeyForRow(row);
    if (!pools.has(key)) {
      pools.set(key, []);
    }
    pools.get(key).push(row);
  }

  const sampleRows = [];
  const sampleDiagnostics = [];

  const shuffledStrata = [...pools.entries()].sort(([left], [right]) => left.localeCompare(right));
  for (const [stratumKey, pool] of shuffledStrata) {
    const [orbitClass, band] = stratumKey.split('|');
    const orderedPool = deterministicShuffle(pool, SAMPLE_SEED + orbitClass.length * 31 + band.length * 17);
    const flagged = [];
    const unflagged = [];
    let scanned = 0;

    for (const candidate of orderedPool) {
      if (scanned >= MAX_CAD_CANDIDATES_PER_STRATUM) break;
      const flagInfo = await fetchCadFlag(candidate.designation, cadCache);
      scanned += 1;
      if (flagInfo.flagged) {
        if (flagged.length < TARGET_PER_FLAG_PER_STRATUM) {
          flagged.push(candidate);
        }
      } else if (unflagged.length < TARGET_PER_FLAG_PER_STRATUM) {
        unflagged.push(candidate);
      }

      if (
        flagged.length >= TARGET_PER_FLAG_PER_STRATUM &&
        unflagged.length >= TARGET_PER_FLAG_PER_STRATUM
      ) {
        break;
      }
    }

    sampleRows.push(...flagged, ...unflagged);
    sampleDiagnostics.push({
      orbitClass,
      eccentricityBand: band,
      poolSize: pool.length,
      scannedCandidates: scanned,
      selectedFlagged: flagged.length,
      selectedUnflagged: unflagged.length,
      hitTarget: flagged.length >= TARGET_PER_FLAG_PER_STRATUM && unflagged.length >= TARGET_PER_FLAG_PER_STRATUM,
    });
  }

  const results = [];
  for (const row of sampleRows) {
    const flagInfo = cadCache[row.designation];
    const truth = await fetchTruthSamples(row.designation, truthCache);
    results.push(analyzeBody(row, flagInfo, truth));
  }

  const summary = summarizeResults(results);
  await writeJsonAtomic(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    sampleSeed: SAMPLE_SEED,
    validationWindow: {
      start: VALIDATION_START,
      stop: VALIDATION_STOP,
      step: VALIDATION_STEP,
      sampleCount: VALIDATION_SAMPLE_COUNT,
    },
    closeApproachWindow: {
      start: VALIDATION_START,
      stop: VALIDATION_STOP,
      bodies: CAD_BODIES,
      distMaxAu: CAD_DIST_MAX_AU,
    },
    sampleDiagnostics,
    summary,
    results,
  });

  console.log(`wrote ${outputPath}`);
  console.log(`sampleCount=${results.length}`);
  console.log(`encounterSummary=${JSON.stringify(summary.encounterSummary)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});

