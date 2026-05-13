import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { propagateKeplerian } from '../slice7-research/keplerian-propagate.mjs';
import {
  cartesianToElements,
  elementsRadiansKmToPropagationInput,
} from '../slice7-research/state-to-elements.mjs';
import { parseSamples, parseSingleState } from './horizons.mjs';
import { readJson, sleep, writeJson } from './common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const samplePath = path.join(dataDir, 'sample-200.json');
const accuracyPath = path.join(dataDir, 'keplerian-accuracy-200.json');
const outputPath = path.join(dataDir, 'methodology-investigation.json');

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const MIN_QUERY_INTERVAL_MS = 3_000;
const RETRY_DELAYS_MS = [3_000, 6_000, 12_000];
const TRUTH_WINDOW_DAYS = 90;
const JD_2026_WINDOW_START = 2461161.5;
const SELECT_COUNT = 10;

let lastFetchStartedAt = 0;

function buildUrl(params) {
  return `${HORIZONS_BASE_URL}?${new URLSearchParams(params).toString()}`;
}

async function fetchHorizonsJson(params) {
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
    }
  }

  throw lastError;
}

function buildAnchorParams(designation, jdTdb) {
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
    TLIST: String(jdTdb),
  };
}

function buildTruthParams(designation, startJdTdb, stopJdTdb) {
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
    START_TIME: `JD${startJdTdb}`,
    STOP_TIME: `JD${stopJdTdb}`,
    STEP_SIZE: "'1 d'",
  };
}

function selectBodies(sampleRows, accuracyRows) {
  const sampleByDesignation = new Map(sampleRows.map((row) => [row.designation, row]));
  const worst = accuracyRows
    .filter((row) => row.max_error_km > 100_000)
    .slice(0, SELECT_COUNT)
    .map((row) => sampleByDesignation.get(row.designation));
  const best = [...accuracyRows]
    .reverse()
    .filter((row) => row.max_error_km < 30_000)
    .slice(0, SELECT_COUNT)
    .map((row) => sampleByDesignation.get(row.designation));

  if (worst.length !== SELECT_COUNT || best.length !== SELECT_COUNT) {
    throw new Error(`Expected ${SELECT_COUNT} worst and ${SELECT_COUNT} best bodies`);
  }

  return [
    ...worst.map((row) => ({ ...row, cohort: 'worst' })),
    ...best.map((row) => ({ ...row, cohort: 'best' })),
  ];
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function measureAgainstTruth(propagationInput, truthSamples) {
  let maxErrorKm = 0;
  let sumSquaredErrorKm = 0;

  for (const truth of truthSamples) {
    const propagated = propagateKeplerian(propagationInput, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    maxErrorKm = Math.max(maxErrorKm, errorKm);
    sumSquaredErrorKm += errorKm * errorKm;
  }

  return {
    maxErrorKm,
    rmsErrorKm: Math.sqrt(sumSquaredErrorKm / truthSamples.length),
  };
}

function diagnosisFor(body) {
  const m1 = body.measurements.m1_sbdb_direct_same_epoch.maxErrorKm;
  const m2 = body.measurements.m2_horizons_anchored_same_epoch.maxErrorKm;
  const m3 = body.measurements.m3_sbdb_direct_long_window.maxErrorKm;
  const m4 = body.measurements.m4_horizons_anchored_2026.maxErrorKm;

  const sourceRatio = m1 / Math.max(m2, 1e-9);
  const windowRatio = m3 / Math.max(m1, 1e-9);
  const bestCaseConsistencyRatio = Math.max(m2, m4) / Math.max(Math.min(m2, m4), 1e-9);

  const sourceDominant = sourceRatio >= 2;
  const windowDominant = windowRatio >= 2;

  return {
    label:
      sourceDominant && windowDominant
        ? 'both'
        : sourceDominant
          ? 'data-source-dominant'
          : windowDominant
            ? 'window-dominant'
            : 'neither',
    sourceRatio,
    windowRatio,
    bestCaseConsistencyRatio,
  };
}

function summarize(results) {
  const counts = results.reduce((acc, row) => {
    acc[row.diagnosis] = (acc[row.diagnosis] ?? 0) + 1;
    return acc;
  }, {});

  const sourceRatios = results.map((row) => row.diagnosisMetrics.sourceRatio);
  const windowRatios = results.map((row) => row.diagnosisMetrics.windowRatio);
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  let recommendedDec2Revision = 'Always Horizons re-anchor at 2026-05-01 TDB; no SBDB-direct path.';
  let combinedEvidence = 'Both source quality and window length materially contribute.';
  if ((counts['window-dominant'] ?? 0) > (counts['data-source-dominant'] ?? 0) && !(counts['both'] ?? 0)) {
    combinedEvidence = 'Measurement-window length is the dominant effect.';
    recommendedDec2Revision = 'Keep SBDB for metadata only and re-anchor at 2026-05-01 TDB for propagation.';
  } else if ((counts['data-source-dominant'] ?? 0) > (counts['window-dominant'] ?? 0) && !(counts['both'] ?? 0)) {
    combinedEvidence = 'Data-source quality is the dominant effect.';
  }

  return {
    diagnosisCounts: counts,
    medianSourceRatio: median(sourceRatios),
    medianWindowRatio: median(windowRatios),
    interpretation_a_evidence:
      `Median window-length ratio m3/m1 = ${median(windowRatios).toFixed(2)}; ` +
      `${counts['window-dominant'] ?? 0} bodies classified window-dominant.`,
    interpretation_b_evidence:
      `Median source ratio m1/m2 = ${median(sourceRatios).toFixed(2)}; ` +
      `${counts['data-source-dominant'] ?? 0} bodies classified data-source-dominant.`,
    combined_evidence: combinedEvidence,
    recommended_dec2_revision: recommendedDec2Revision,
  };
}

async function truthSamplesFor(designation, startJdTdb) {
  const stopJdTdb = startJdTdb + TRUTH_WINDOW_DAYS;
  const payload = await fetchHorizonsJson(buildTruthParams(designation, startJdTdb, stopJdTdb));
  const samples = parseSamples(payload.result);
  if (samples.length !== 91) {
    throw new Error(`Expected 91 truth samples for ${designation}, got ${samples.length}`);
  }
  return samples;
}

async function anchorElementsFor(designation, jdTdb) {
  const payload = await fetchHorizonsJson(buildAnchorParams(designation, jdTdb));
  const state = parseSingleState(payload.result);
  const elements = cartesianToElements(state);
  return elementsRadiansKmToPropagationInput(elements);
}

async function main() {
  const sampleDocument = await readJson(samplePath);
  const accuracyDocument = await readJson(accuracyPath);
  const selectedBodies = selectBodies(sampleDocument.rows, accuracyDocument.rows);
  const investigationBodies = [];

  for (const body of selectedBodies) {
    console.log(`investigating ${body.cohort} ${body.designation} ${body.name}`);
    const sameEpochTruth = await truthSamplesFor(body.designation, body.epochTdbJd);
    const longWindowTruth = await truthSamplesFor(body.designation, JD_2026_WINDOW_START);

    const sbdbElements = {
      a: body.a,
      e: body.e,
      i: body.i,
      om: body.om,
      w: body.w,
      ma: body.ma,
      epoch_tdb: body.epochTdbJd,
    };

    const horizonsSameEpochElements = await anchorElementsFor(body.designation, body.epochTdbJd);
    const horizons2026Elements = await anchorElementsFor(body.designation, JD_2026_WINDOW_START);

    const record = {
      designation: body.designation,
      name: body.name,
      cohort: body.cohort,
      h: body.H,
      eccentricity: body.e,
      sbdbEpochTdbJd: body.epochTdbJd,
      measurements: {
        m1_sbdb_direct_same_epoch: measureAgainstTruth(sbdbElements, sameEpochTruth),
        m2_horizons_anchored_same_epoch: measureAgainstTruth(horizonsSameEpochElements, sameEpochTruth),
        m3_sbdb_direct_long_window: measureAgainstTruth(sbdbElements, longWindowTruth),
        m4_horizons_anchored_2026: measureAgainstTruth(horizons2026Elements, longWindowTruth),
      },
    };

    const diagnosisMetrics = diagnosisFor(record);
    investigationBodies.push({
      ...record,
      diagnosis: diagnosisMetrics.label,
      diagnosisMetrics,
    });

    await writeJson(outputPath, {
      generatedAtUtc: new Date().toISOString(),
      bodies: investigationBodies,
      summary: investigationBodies.length === selectedBodies.length ? summarize(investigationBodies) : null,
    });
  }

  const finalOutput = {
    generatedAtUtc: new Date().toISOString(),
    bodies: investigationBodies,
    summary: summarize(investigationBodies),
  };
  await writeJson(outputPath, finalOutput);
  console.log(`wrote ${outputPath}`);
  console.log(JSON.stringify(finalOutput.summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
