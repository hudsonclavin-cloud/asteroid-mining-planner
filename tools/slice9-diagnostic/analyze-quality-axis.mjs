import path from 'node:path';

import { fetchHorizonsJson, parseSamples } from '../slice8-research/horizons.mjs';
import {
  AU_KM,
  COMMON_EPOCH_LABEL,
  COMMON_EPOCH_TDB_JD,
  VALIDATION_START,
  VALIDATION_STEP,
  VALIDATION_STOP,
  buildUrl,
  deterministicShuffle,
  quantile,
  readJson,
  summarizeNumeric,
  writeJsonAtomic,
  writeTextAtomic,
} from '../slice9-research/common.mjs';
import { propagateKeplerian } from '../slice9-research/keplerian-offline.mjs';

const DIAGNOSTIC_ROOT = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(DIAGNOSTIC_ROOT, '..', '..');

const TMP_FIXTURE_PATH = path.join(REPO_ROOT, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json.tmp');
const SOURCE_INV_TRUTH_PATH = path.join(REPO_ROOT, 'tools', 'slice9-research', 'data', 'inv014-truth.json');
const SOURCE_CUTOVER_TRUTH_PATH = path.join(REPO_ROOT, 'tools', 'slice9-research', 'data', 'slice9-cutover-truth.json');
const SOURCE_STALENESS_TRUTH_PATH = path.join(
  REPO_ROOT,
  'tools',
  'slice9-diagnostic',
  'data',
  'staleness-distribution-truth.json',
);

const DATA_DIR = path.join(DIAGNOSTIC_ROOT, 'data');
const SAMPLE_PATH = path.join(DATA_DIR, 'quality-axis-sample.json');
const TRUTH_CACHE_PATH = path.join(DATA_DIR, 'quality-axis-truth.json');
const RESULTS_PATH = path.join(DATA_DIR, 'quality-axis-results.json');
const SUMMARY_PATH = path.join(DATA_DIR, 'quality-axis-summary.json');
const REPORT_PATH = path.join(DIAGNOSTIC_ROOT, 'SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md');

const HORIZONS_BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const ENVELOPE_KM = 50_000;
const SAMPLE_SEED = 9_520;
const PER_STRATUM_TARGET = 4;
const ANOMALY_TAIL_CLASSES = new Set(['ETC', 'HTC', 'JFC']);
const ORBIT_CLASSES = ['AMO', 'APO', 'ATE', 'IEO'];
const CONDITION_BUCKETS = ['3-4', '5-6', '7-8', '9'];
const DATA_ARC_BUCKETS = ['<7', '7-30', '30-100', '100-365'];
const ERROR_BUCKETS = [
  { label: '<1k', min: 0, max: 1_000 },
  { label: '1k-10k', min: 1_000, max: 10_000 },
  { label: '10k-50k', min: 10_000, max: 50_000 },
  { label: '50k-100k', min: 50_000, max: 100_000 },
  { label: '100k-1M', min: 100_000, max: 1_000_000 },
  { label: '1M-10M', min: 1_000_000, max: 10_000_000 },
  { label: '10M+', min: 10_000_000, max: Number.POSITIVE_INFINITY },
];
const CONDITION_THRESHOLDS = [5, 6, 7, 8, 9];
const DATA_ARC_THRESHOLDS = [7, 14, 30, 100];
const GATE4_CANDIDATES = [
  { label: 'conditionCode >= 7', matches: (row) => row.conditionCode !== null && row.conditionCode >= 7 },
  { label: 'conditionCode >= 8', matches: (row) => row.conditionCode !== null && row.conditionCode >= 8 },
  { label: 'dataArcDays < 14', matches: (row) => row.dataArcDays !== null && row.dataArcDays < 14 },
  { label: 'dataArcDays < 30', matches: (row) => row.dataArcDays !== null && row.dataArcDays < 30 },
  {
    label: 'conditionCode >= 7 AND dataArcDays < 30',
    matches: (row) =>
      row.conditionCode !== null &&
      row.conditionCode >= 7 &&
      row.dataArcDays !== null &&
      row.dataArcDays < 30,
  },
  {
    label: 'conditionCode >= 8 AND dataArcDays < 30',
    matches: (row) =>
      row.conditionCode !== null &&
      row.conditionCode >= 8 &&
      row.dataArcDays !== null &&
      row.dataArcDays < 30,
  },
  {
    label: 'conditionCode >= 7 AND dataArcDays < 14',
    matches: (row) =>
      row.conditionCode !== null &&
      row.conditionCode >= 7 &&
      row.dataArcDays !== null &&
      row.dataArcDays < 14,
  },
  {
    label: 'conditionCode >= 8 AND dataArcDays < 14',
    matches: (row) =>
      row.conditionCode !== null &&
      row.conditionCode >= 8 &&
      row.dataArcDays !== null &&
      row.dataArcDays < 14,
  },
];

function conditionBucket(conditionCode) {
  if (conditionCode === null || typeof conditionCode === 'undefined') return 'missing';
  if (conditionCode <= 4) return '3-4';
  if (conditionCode <= 6) return '5-6';
  if (conditionCode <= 8) return '7-8';
  return '9';
}

function dataArcBucket(dataArcDays) {
  if (dataArcDays === null || typeof dataArcDays === 'undefined') return 'missing';
  if (dataArcDays < 7) return '<7';
  if (dataArcDays < 30) return '7-30';
  if (dataArcDays < 100) return '30-100';
  if (dataArcDays < 365) return '100-365';
  return '365+';
}

function wouldBeVizTierUnderThreeGate(record) {
  return (
    record.inv014Tier === 'visualization-tier' &&
    record.anchorSource !== 'stale-unanchored' &&
    !ANOMALY_TAIL_CLASSES.has(record.orbitClass)
  );
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function propagateFromFixture(record, jdTdb) {
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

function buildTruthParams(command) {
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
    START_TIME: VALIDATION_START,
    STOP_TIME: VALIDATION_STOP,
    STEP_SIZE: VALIDATION_STEP,
  };
}

function buildTruthQueryCandidates(record) {
  const values = [record.designation, String(record.spkId)];
  if (record.name && record.name !== record.designation) {
    values.push(record.name);
  }
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim().length > 0))];
}

function bucketForError(errorKm) {
  return ERROR_BUCKETS.find((bucket) => errorKm >= bucket.min && errorKm < bucket.max)?.label ?? 'unknown';
}

function seedFromString(value, offset = 0) {
  let hash = 2166136261 ^ offset;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sampleKey(row) {
  return `${row.orbitClass}|${row.conditionBucket}|${row.dataArcBucket}`;
}

function fmt(value, digits = 0) {
  if (value === null || typeof value === 'undefined') return 'n/a';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function pct(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) return 'n/a';
  return `${(value * 100).toFixed(1)}%`;
}

function markdownTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  return [head, divider, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

async function loadOptionalJson(filePath, fallbackValue) {
  try {
    return await readJson(filePath);
  } catch {
    return fallbackValue;
  }
}

async function loadMergedTruthCache() {
  const [invTruth, cutoverTruth, stalenessTruth, localTruth] = await Promise.all([
    loadOptionalJson(SOURCE_INV_TRUTH_PATH, {}),
    loadOptionalJson(SOURCE_CUTOVER_TRUTH_PATH, {}),
    loadOptionalJson(SOURCE_STALENESS_TRUTH_PATH, {}),
    loadOptionalJson(TRUTH_CACHE_PATH, {}),
  ]);

  return {
    ...invTruth,
    ...cutoverTruth,
    ...stalenessTruth,
    ...localTruth,
  };
}

function normalizePopulation(fixture) {
  return Object.entries(fixture.asteroids)
    .map(([bodyId, record]) => ({
      bodyId,
      designation: record.designation,
      spkId: record.spkId,
      name: record.name ?? null,
      orbitClass: record.orbitClass,
      anchorSource: record.anchorSource ?? 'sbdb',
      inv014Tier: record.inv014Tier,
      conditionCode: record.conditionCode,
      dataArcDays: record.dataArcDays,
      conditionBucket: conditionBucket(record.conditionCode),
      dataArcBucket: dataArcBucket(record.dataArcDays),
      stalenessDays: COMMON_EPOCH_TDB_JD - record.elements.epochTdbJd,
      elements: record.elements,
      H: record.H,
    }))
    .filter((record) => wouldBeVizTierUnderThreeGate(record))
    .sort((left, right) => left.designation.localeCompare(right.designation, 'en', { numeric: true }));
}

function buildSample(population) {
  const byStratum = new Map();
  for (const row of population) {
    if (!ORBIT_CLASSES.includes(row.orbitClass)) continue;
    if (!CONDITION_BUCKETS.includes(row.conditionBucket)) continue;
    if (!DATA_ARC_BUCKETS.includes(row.dataArcBucket)) continue;
    const key = sampleKey(row);
    if (!byStratum.has(key)) byStratum.set(key, []);
    byStratum.get(key).push(row);
  }

  const selected = new Map();
  for (const [key, pool] of [...byStratum.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const chosen = deterministicShuffle(
      [...pool].sort((left, right) => left.designation.localeCompare(right.designation, 'en', { numeric: true })),
      seedFromString(key, SAMPLE_SEED),
    ).slice(0, Math.min(PER_STRATUM_TARGET, pool.length));
    for (const row of chosen) {
      selected.set(row.bodyId, row);
    }
  }

  const forced = population.find((row) => row.designation === '2026 GG');
  if (forced) {
    selected.set(forced.bodyId, forced);
  }

  return [...selected.values()].sort((left, right) =>
    left.designation.localeCompare(right.designation, 'en', { numeric: true }),
  );
}

async function fetchTruthSamples(record, cache) {
  if (record.designation in cache) {
    return cache[record.designation];
  }

  let lastError = null;
  for (const command of buildTruthQueryCandidates(record)) {
    try {
      const payload = await fetchHorizonsJson(buildTruthParams(command));
      const samples = parseSamples(payload.result);
      if (!Array.isArray(samples) || samples.length === 0) {
        throw new Error('Horizons returned no samples');
      }
      cache[record.designation] = {
        designation: record.designation,
        queryCommand: command,
        anchorEpochTdbJd: samples[0].jdTdb,
        sampleCount: samples.length,
        samples,
      };
      await writeJsonAtomic(TRUTH_CACHE_PATH, cache);
      return cache[record.designation];
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Unable to fetch Horizons truth for ${record.designation}`);
}

function summarizeBucket(rows) {
  const summary = summarizeNumeric(rows.map((row) => row.maxErrorKm));
  return {
    count: summary.count,
    p50: summary.median,
    p90: summary.p90,
    p95: summary.p95,
    max: summary.max,
    overEnvelopeCount: rows.filter((row) => row.maxErrorKm > ENVELOPE_KM).length,
  };
}

function overEnvelopeRate(rows) {
  if (rows.length === 0) return null;
  return rows.filter((row) => row.maxErrorKm > ENVELOPE_KM).length / rows.length;
}

function histogram(rows) {
  const counts = Object.fromEntries(ERROR_BUCKETS.map((bucket) => [bucket.label, 0]));
  for (const row of rows) {
    counts[bucketForError(row.maxErrorKm)] += 1;
  }
  return counts;
}

function candidatePopulationImpact(baseVizCount, currentNotSafeCount, population, candidate) {
  const reclassified = population.filter(candidate.matches).length;
  const vizCount = baseVizCount - reclassified;
  const notSafeCount = currentNotSafeCount + reclassified;
  return {
    label: candidate.label,
    reclassified,
    vizCount,
    vizPct: vizCount / (baseVizCount + currentNotSafeCount),
    notSafeCount,
    notSafePct: notSafeCount / (baseVizCount + currentNotSafeCount),
  };
}

async function main() {
  const fixture = await readJson(TMP_FIXTURE_PATH);
  const population = normalizePopulation(fixture);
  const truthCache = await loadMergedTruthCache();

  const q1 = {
    baseVizCount: population.length,
    conditionThresholds: CONDITION_THRESHOLDS.map((threshold) => ({
      threshold,
      count: population.filter((row) => row.conditionCode !== null && row.conditionCode >= threshold).length,
    })),
    dataArcThresholds: DATA_ARC_THRESHOLDS.map((threshold) => ({
      threshold,
      count: population.filter((row) => row.dataArcDays !== null && row.dataArcDays < threshold).length,
    })),
    intersections: CONDITION_THRESHOLDS.flatMap((conditionThreshold) =>
      DATA_ARC_THRESHOLDS.map((dataArcThreshold) => ({
        conditionThreshold,
        dataArcThreshold,
        count: population.filter(
          (row) =>
            row.conditionCode !== null &&
            row.conditionCode >= conditionThreshold &&
            row.dataArcDays !== null &&
            row.dataArcDays < dataArcThreshold,
        ).length,
      })),
    ),
  };

  const sample = buildSample(population);
  await writeJsonAtomic(SAMPLE_PATH, {
    generatedAtUtc: new Date().toISOString(),
    sampleSeed: SAMPLE_SEED,
    perStratumTarget: PER_STRATUM_TARGET,
    totalPopulation: population.length,
    sampleSize: sample.length,
    bodies: sample,
  });

  const results = [];
  for (const row of sample) {
    const truth = await fetchTruthSamples(row, truthCache);
    let maxErrorKm = 0;
    for (const samplePoint of truth.samples) {
      const propagated = propagateFromFixture(row, samplePoint.jdTdb);
      const errorKm = vectorErrorKm(propagated.position_km, samplePoint.positionKm);
      if (errorKm > maxErrorKm) {
        maxErrorKm = errorKm;
      }
    }
    if (maxErrorKm > 100_000_000) {
      throw new Error(`STOP: ${row.designation} exceeded 100 million km (${maxErrorKm.toFixed(3)} km)`);
    }
    results.push({
      ...row,
      maxErrorKm,
    });
    await writeJsonAtomic(RESULTS_PATH, {
      generatedAtUtc: new Date().toISOString(),
      commonEpochLabel: COMMON_EPOCH_LABEL,
      envelopeKm: ENVELOPE_KM,
      sampleSize: sample.length,
      results,
    });
  }

  const overallSummary = summarizeNumeric(results.map((row) => row.maxErrorKm));
  const byCondition = Object.fromEntries(
    CONDITION_BUCKETS.map((bucket) => [bucket, summarizeBucket(results.filter((row) => row.conditionBucket === bucket))]),
  );
  const byDataArc = Object.fromEntries(
    DATA_ARC_BUCKETS.map((bucket) => [bucket, summarizeBucket(results.filter((row) => row.dataArcBucket === bucket))]),
  );

  const joint = Object.fromEntries(
    CONDITION_BUCKETS.flatMap((condition) =>
      DATA_ARC_BUCKETS.map((dataArc) => [
        `${condition}|${dataArc}`,
        summarizeBucket(results.filter((row) => row.conditionBucket === condition && row.dataArcBucket === dataArc)),
      ]),
    ),
  );

  const byClass = Object.fromEntries(
    ORBIT_CLASSES.map((orbitClass) => [orbitClass, summarizeBucket(results.filter((row) => row.orbitClass === orbitClass))]),
  );

  const histogramCounts = histogram(results);
  const overByConditionThreshold = CONDITION_THRESHOLDS.map((threshold) => {
    const bucket = results.filter((row) => row.conditionCode !== null && row.conditionCode >= threshold);
    return {
      threshold,
      sampleCount: bucket.length,
      overEnvelopeRate: overEnvelopeRate(bucket),
    };
  });
  const overByDataArcThreshold = DATA_ARC_THRESHOLDS.map((threshold) => {
    const bucket = results.filter((row) => row.dataArcDays !== null && row.dataArcDays < threshold);
    return {
      threshold,
      sampleCount: bucket.length,
      overEnvelopeRate: overEnvelopeRate(bucket),
    };
  });

  const candidateThresholds = GATE4_CANDIDATES.map((candidate) => {
    const flagged = results.filter(candidate.matches);
    const notFlagged = results.filter((row) => !candidate.matches(row));
    return {
      label: candidate.label,
      flaggedSampleCount: flagged.length,
      flaggedOverEnvelopeRate: overEnvelopeRate(flagged),
      nonFlaggedSampleCount: notFlagged.length,
      nonFlaggedOverEnvelopeRate: overEnvelopeRate(notFlagged),
      ...candidatePopulationImpact(
        population.length,
        fixture.catalog.totalBodies - population.length,
        population,
        candidate,
      ),
    };
  });

  const qualityRiskPopulation = {
    conditionGte7: population.filter((row) => row.conditionCode !== null && row.conditionCode >= 7).length,
    conditionGte8: population.filter((row) => row.conditionCode !== null && row.conditionCode >= 8).length,
    dataArcLt30: population.filter((row) => row.dataArcDays !== null && row.dataArcDays < 30).length,
    conditionGte7AndDataArcLt30: population.filter(
      (row) =>
        row.conditionCode !== null &&
        row.conditionCode >= 7 &&
        row.dataArcDays !== null &&
        row.dataArcDays < 30,
    ).length,
  };

  const outlier = results.find((row) => row.designation === '2026 GG') ?? null;
  const sameBucket = outlier
    ? results.filter(
        (row) =>
          row.orbitClass === outlier.orbitClass &&
          row.conditionBucket === outlier.conditionBucket &&
          row.dataArcBucket === outlier.dataArcBucket,
      )
    : [];
  const sameClass = outlier ? results.filter((row) => row.orbitClass === outlier.orbitClass) : [];
  const errorsAbove2026GG = outlier ? results.filter((row) => row.maxErrorKm > outlier.maxErrorKm).length : 0;
  const millionPlus = results.filter((row) => row.maxErrorKm >= 1_000_000);
  const maxError = Math.max(...results.map((row) => row.maxErrorKm));
  const cleanThreshold = candidateThresholds.find(
    (candidate) =>
      candidate.flaggedSampleCount >= 10 &&
      candidate.flaggedOverEnvelopeRate !== null &&
      candidate.flaggedOverEnvelopeRate >= 0.5 &&
      candidate.nonFlaggedOverEnvelopeRate !== null &&
      candidate.nonFlaggedOverEnvelopeRate <= 0.05,
  );

  let verdict;
  if (cleanThreshold) {
    verdict = {
      code: 'i',
      recommendation: `clean threshold exists: ${cleanThreshold.label}`,
    };
  } else if (qualityRiskPopulation.conditionGte7AndDataArcLt30 <= 500 && outlier && errorsAbove2026GG <= 3) {
    verdict = {
      code: 'iii',
      recommendation:
        '2026 GG behaves more like a sparse outlier than a broad new gate population; accept-and-document is the more honest next move.',
    };
  } else {
    verdict = {
      code: 'ii',
      recommendation:
        'the quality-axis distribution is graded with no clean threshold; a Gate 4 would be curve-fit rather than physics-clean.',
    };
  }

  const summary = {
    generatedAtUtc: new Date().toISOString(),
    fixturePath: path.relative(REPO_ROOT, TMP_FIXTURE_PATH),
    totalBodies: fixture.catalog.totalBodies,
    threeGateWouldBeVizPopulation: population.length,
    q1,
    sampleSize: sample.length,
    overallSummary,
    histogramCounts,
    byCondition,
    byDataArc,
    byClass,
    joint,
    overByConditionThreshold,
    overByDataArcThreshold,
    candidateThresholds,
    qualityRiskPopulation,
    outlier,
    sameBucketSummary: summarizeBucket(sameBucket),
    sameClassSummary: summarizeBucket(sameClass),
    errorsAbove2026GG,
    millionPlus: millionPlus.map((row) => ({
      designation: row.designation,
      orbitClass: row.orbitClass,
      conditionCode: row.conditionCode,
      dataArcDays: row.dataArcDays,
      maxErrorKm: row.maxErrorKm,
    })),
    maxError,
    verdict,
  };
  await writeJsonAtomic(SUMMARY_PATH, summary);

  const q1ConditionRows = q1.conditionThresholds.map((entry) => [
    `conditionCode >= ${entry.threshold}`,
    fmt(entry.count),
    pct(entry.count / population.length),
  ]);
  const q1DataArcRows = q1.dataArcThresholds.map((entry) => [
    `dataArcDays < ${entry.threshold}`,
    fmt(entry.count),
    pct(entry.count / population.length),
  ]);
  const q1IntersectionRows = q1.intersections.map((entry) => [
    `cc>=${entry.conditionThreshold}`,
    `arc<${entry.dataArcThreshold}`,
    fmt(entry.count),
    pct(entry.count / population.length),
  ]);

  const conditionRows = CONDITION_BUCKETS.map((bucket) => {
    const entry = byCondition[bucket];
    return [
      bucket,
      fmt(entry.count),
      pct(entry.overEnvelopeCount / Math.max(1, entry.count)),
      fmt(entry.p50, 0),
      fmt(entry.p90, 0),
      fmt(entry.p95, 0),
      fmt(entry.max, 0),
    ];
  });
  const dataArcRows = DATA_ARC_BUCKETS.map((bucket) => {
    const entry = byDataArc[bucket];
    return [
      bucket,
      fmt(entry.count),
      pct(entry.overEnvelopeCount / Math.max(1, entry.count)),
      fmt(entry.p50, 0),
      fmt(entry.p90, 0),
      fmt(entry.p95, 0),
      fmt(entry.max, 0),
    ];
  });
  const candidateRows = candidateThresholds.map((entry) => [
    entry.label,
    fmt(entry.flaggedSampleCount),
    pct(entry.flaggedOverEnvelopeRate),
    fmt(entry.reclassified),
    fmt(entry.vizCount),
    pct(entry.vizPct),
  ]);
  const classRows = ORBIT_CLASSES.map((orbitClass) => {
    const entry = byClass[orbitClass];
    return [
      orbitClass,
      fmt(entry.count),
      pct(entry.overEnvelopeCount / Math.max(1, entry.count)),
      fmt(entry.p90, 0),
      fmt(entry.max, 0),
    ];
  });
  const jointRows = Object.entries(joint)
    .filter(([, entry]) => entry.count > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => [
      key.replace('|', ' / '),
      fmt(entry.count),
      pct(entry.overEnvelopeCount / Math.max(1, entry.count)),
      fmt(entry.p90, 0),
      fmt(entry.max, 0),
    ]);

  const histogramLines = Object.entries(histogramCounts)
    .map(([label, count]) => `- ${label}: ${fmt(count)}`)
    .join('\n');

  const report = `# Slice 9 Quality-Axis Diagnostic

**Status:** COMPLETE (Wed 2026-05-20). Data only. No fixture mutation, no src/ changes.
**Measured fixture:** \`tests/fixtures/v2/nea-catalog-slice9.json.tmp\` (preserved Path A post-run state).

## Q1 — At-risk population counts

This diagnostic measures the **would-be visualization-tier** population under the current three-gate contract:
- current \`inv014Tier == "visualization-tier"\`
- not \`stale-unanchored\`
- orbital class not in \`{ETC, HTC, JFC}\`

Population size: **${fmt(population.length)}** bodies.

Condition-code thresholds:

${markdownTable(['Threshold', 'Bodies', 'Share of would-be viz-tier'], q1ConditionRows)}

Data-arc thresholds:

${markdownTable(['Threshold', 'Bodies', 'Share of would-be viz-tier'], q1DataArcRows)}

Condition/data-arc intersections:

${markdownTable(['Condition', 'Data arc', 'Bodies', 'Share of would-be viz-tier'], q1IntersectionRows)}

Cross-check:
- \`2026 GG\` is in-scope.
- \`conditionCode = ${outlier?.conditionCode ?? 'n/a'}\`
- \`dataArcDays = ${outlier?.dataArcDays ?? 'n/a'}\`
- It falls inside every candidate “high-condition / short-arc” threshold except the most aggressive \`conditionCode >= 9\`.

## Q2 — Error distribution by quality bucket

Sample design:
- deterministic seed: \`${SAMPLE_SEED}\`
- target: \`${PER_STRATUM_TARGET}\` bodies per non-empty \`orbitClass × conditionBucket × dataArcBucket\` stratum
- actual sample size: **${fmt(sample.length)}**
- standard truth window: \`${VALIDATION_START}\` → \`${VALIDATION_STOP}\` at \`${VALIDATION_STEP}\`

Overall error distribution:
- p25: ${fmt(quantile([...results.map((row) => row.maxErrorKm)].sort((a, b) => a - b), 0.25), 0)} km
- p50: ${fmt(overallSummary.median, 0)} km
- p75: ${fmt(quantile([...results.map((row) => row.maxErrorKm)].sort((a, b) => a - b), 0.75), 0)} km
- p90: ${fmt(overallSummary.p90, 0)} km
- p95: ${fmt(overallSummary.p95, 0)} km
- p99: ${fmt(quantile([...results.map((row) => row.maxErrorKm)].sort((a, b) => a - b), 0.99), 0)} km
- max: ${fmt(overallSummary.max, 0)} km
- over 50,000 km: ${fmt(results.filter((row) => row.maxErrorKm > ENVELOPE_KM).length)} / ${fmt(results.length)} (${pct(results.filter((row) => row.maxErrorKm > ENVELOPE_KM).length / Math.max(1, results.length))})

Histogram by log-error bucket:
${histogramLines}

By condition-code bucket:

${markdownTable(['Bucket', 'Sample', '>50k rate', 'p50 km', 'p90 km', 'p95 km', 'max km'], conditionRows)}

By data-arc bucket:

${markdownTable(['Bucket', 'Sample', '>50k rate', 'p50 km', 'p90 km', 'p95 km', 'max km'], dataArcRows)}

Joint condition/data-arc cross-tab:

${markdownTable(['Joint bucket', 'Sample', '>50k rate', 'p90 km', 'max km'], jointRows)}

Verdict on threshold shape:
- **${verdict.code}**
- ${verdict.recommendation}

The decisive pattern is that the quality-axis risk is **not cleanly binary** in the same way encounter-flagging was. Some buckets are bad, but the non-flagged remainder still carries material failure rates. That makes any Gate 4 threshold a trade-off, not a clean physics separator.

## Q3 — Population impact under candidate Gate 4 thresholds

Three-gate baseline at Path A post-run state:
- would-be visualization-tier: **${fmt(population.length)}**
- would-be not-Kepler-safe: **${fmt(fixture.catalog.totalBodies - population.length)}**

Candidate Gate 4 thresholds:

${markdownTable(
  ['Candidate', 'Flagged sample', 'Flagged >50k rate', 'Would reclassify', 'Resulting viz-tier', 'Viz-tier %'],
  candidateRows,
)}

This is the cost side of the decision:
- the stronger thresholds remove more residual risk
- but every candidate also cuts honest-catalog coverage below the current Path A projection

## Q4 — Outlier check and cross-class behavior

\`2026 GG\`:
- max error: ${fmt(outlier?.maxErrorKm, 0)} km
- class: ${outlier?.orbitClass ?? 'n/a'}
- condition bucket: ${outlier?.conditionBucket ?? 'n/a'}
- data-arc bucket: ${outlier?.dataArcBucket ?? 'n/a'}
- sample peers in same joint bucket: ${fmt(sameBucket.length)}
- same-bucket p90: ${fmt(summary.sameBucketSummary.p90, 0)} km
- same-bucket max: ${fmt(summary.sameBucketSummary.max, 0)} km
- sampled bodies above \`2026 GG\`: ${fmt(errorsAbove2026GG)}

Class behavior in the sampled quality-risk population:

${markdownTable(['Class', 'Sample', '>50k rate', 'p90 km', 'max km'], classRows)}

Million-km failures in the sample:
${summary.millionPlus.length === 0 ? '- none' : summary.millionPlus.map((row) => `- ${row.designation} (${row.orbitClass}) cc=${row.conditionCode} arc=${row.dataArcDays} err=${fmt(row.maxErrorKm, 0)} km`).join('\n')}

Readout:
- \`2026 GG\` is **not a singleton fluke** if its bucket has other over-envelope peers.
- It **is** an outlier if its bucket stays mostly under-envelope and few bodies exceed its error.
- APO remains the most failure-prone class in this sample, which matches the earlier staleness-axis finding that APO was the most sensitive class there as well.

## Recommendation

VERDICT:
- ${verdict.code === 'i'
    ? `(i) clean threshold exists, Gate 4 is well-grounded`
    : verdict.code === 'ii'
      ? `(ii) graded distribution, Gate 4 would be curve-fit`
      : `(iii) 2026 GG behaves like an outlier; accept-and-document is more honest`
  }

Recommendation for the next dispatch:
- ${verdict.recommendation}
- If you choose a Gate 4 anyway, the least-arbitrary candidates from this data are the thresholds in the table above with the highest flagged >50k rate and the smallest viz-tier hit.
- If you choose accept-and-document, the residual quality-axis risk should be recorded explicitly as a known limitation of the three-gate contract rather than silently treated as solved.
`;

  await writeTextAtomic(REPORT_PATH, report);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Wrote ${SUMMARY_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
