import path from 'node:path';

import { fetchHorizonsJson, parseSamples } from '../slice8-research/horizons.mjs';
import {
  CAD_API_URL,
  COMMON_EPOCH_LABEL,
  COMMON_EPOCH_TDB_JD,
  VALIDATION_SAMPLE_COUNT,
  VALIDATION_START,
  VALIDATION_STEP,
  VALIDATION_STOP,
  AU_KM,
  buildUrl,
  deterministicShuffle,
  fetchJson,
  quantile,
  readJson,
  summarizeNumeric,
  writeJsonAtomic,
  writeTextAtomic,
} from '../slice9-research/common.mjs';
import { propagateKeplerian } from '../slice9-research/keplerian-offline.mjs';

const DIAGNOSTIC_ROOT = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(DIAGNOSTIC_ROOT, '..', '..');

const FIXTURE_PATH = path.join(REPO_ROOT, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const SOURCE_CAD_CACHE_PATH = path.join(REPO_ROOT, 'tools', 'slice9-research', 'data', 'cad-flags.json');
const SOURCE_TRUTH_CACHE_PATH = path.join(REPO_ROOT, 'tools', 'slice9-research', 'data', 'inv014-truth.json');

const DATA_DIR = path.join(DIAGNOSTIC_ROOT, 'data');
const SAMPLE_PATH = path.join(DATA_DIR, 'staleness-distribution-sample.json');
const CAD_CACHE_PATH = path.join(DATA_DIR, 'staleness-distribution-cad.json');
const TRUTH_CACHE_PATH = path.join(DATA_DIR, 'staleness-distribution-truth.json');
const RESULTS_PATH = path.join(DATA_DIR, 'staleness-distribution-results.json');
const SUMMARY_PATH = path.join(DATA_DIR, 'staleness-distribution-summary.json');
const REPORT_PATH = path.join(DIAGNOSTIC_ROOT, 'SLICE_9_STALENESS_DISTRIBUTION_DIAGNOSTIC.md');

const SAMPLE_SEED = 9_019;
const VIZ_TARGET_PER_STRATUM = 7;
const CAD_BODIES = ['Earth', 'Venus'];
const CAD_DIST_MAX_AU = '0.05';
const ENVELOPE_KM = 50_000;
const STALENESS_BANDS = [
  { label: '90-120d', minExclusive: 90, maxInclusive: 120 },
  { label: '120-150d', minExclusive: 120, maxInclusive: 150 },
  { label: '150-180d', minExclusive: 150, maxInclusive: 180 },
];
const ERROR_BUCKETS = [
  { label: '<1k', min: 0, max: 1_000 },
  { label: '1k-10k', min: 1_000, max: 10_000 },
  { label: '10k-50k', min: 10_000, max: 50_000 },
  { label: '50k-100k', min: 50_000, max: 100_000 },
  { label: '100k-1M', min: 100_000, max: 1_000_000 },
  { label: '1M-10M', min: 1_000_000, max: 10_000_000 },
  { label: '10M+', min: 10_000_000, max: Number.POSITIVE_INFINITY },
];
const CUTOVER_CLUSTER = [
  '2026 BX4',
  '2026 FP',
  '2011 EP51',
  '2022 SW20',
  '2026 GG',
  '2009 TL8',
  '2019 CO1',
  '2025 OD15',
  '2013 XF22',
  '462736',
  '2022 BG4',
  '2023 XH2',
];

function seedFromString(value, offset = 0) {
  let hash = 2166136261 ^ offset;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stalenessBandLabel(stalenessDays) {
  if (stalenessDays > 90 && stalenessDays <= 120) return '90-120d';
  if (stalenessDays > 120 && stalenessDays <= 150) return '120-150d';
  if (stalenessDays > 150 && stalenessDays <= 180) return '150-180d';
  return 'out-of-band';
}

function researchEccentricityBand(eccentricity) {
  if (eccentricity < 0.3) return 'e<0.3';
  if (eccentricity < 0.5) return '0.3-0.5';
  if (eccentricity < 0.7) return '0.5-0.7';
  return '>0.7';
}

function bucketForError(errorKm) {
  return ERROR_BUCKETS.find((bucket) => errorKm >= bucket.min && errorKm < bucket.max)?.label ?? 'unknown';
}

function sampleRoleForRecord(record) {
  return record.inv014Tier === 'not-kepler-safe' ? 'flagged-validation-sample' : 'viz-tier-sample';
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

function toBodyId(designation) {
  return `asteroid-${designation}`;
}

function normalizeStalenessPopulation(fixture) {
  return Object.entries(fixture.asteroids)
    .map(([bodyId, record]) => {
      const stalenessDays = COMMON_EPOCH_TDB_JD - record.elements.epochTdbJd;
      return {
        bodyId,
        designation: record.designation,
        spkId: record.spkId,
        name: record.name ?? null,
        orbitClass: record.orbitClass,
        eccentricityBand: researchEccentricityBand(record.elements.e),
        inv014Tier: record.inv014Tier,
        anchorSource: record.anchorSource ?? 'sbdb',
        stalenessDays,
        stalenessBand: stalenessBandLabel(stalenessDays),
        elements: record.elements,
      };
    })
    .filter((record) => record.stalenessBand !== 'out-of-band')
    .sort((left, right) => left.designation.localeCompare(right.designation, 'en', { numeric: true }));
}

function partitionByStratum(records) {
  const byStratum = new Map();
  for (const record of records) {
    const key = `${record.orbitClass}|${record.eccentricityBand}|${record.stalenessBand}|${sampleRoleForRecord(record)}`;
    if (!byStratum.has(key)) {
      byStratum.set(key, []);
    }
    byStratum.get(key).push(record);
  }
  return byStratum;
}

function selectDeterministicSubset(records, count, seedLabel) {
  return deterministicShuffle(
    [...records].sort((left, right) => left.designation.localeCompare(right.designation, 'en', { numeric: true })),
    seedFromString(seedLabel, SAMPLE_SEED),
  ).slice(0, Math.min(count, records.length));
}

function buildSample(population) {
  const byStratum = partitionByStratum(population);
  const selected = new Map();

  for (const [key, pool] of [...byStratum.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const isFlaggedStratum = key.endsWith('|flagged-validation-sample');
    const chosen = isFlaggedStratum
      ? pool
      : selectDeterministicSubset(pool, VIZ_TARGET_PER_STRATUM, `viz|${key}`);
    for (const record of chosen) {
      selected.set(record.bodyId, {
        ...record,
        sampleRole: isFlaggedStratum ? 'flagged-validation-sample' : 'viz-tier-sample',
      });
    }
  }

  for (const designation of CUTOVER_CLUSTER) {
    const bodyId = toBodyId(designation);
    const existing = selected.get(bodyId);
    if (existing) continue;
    const record = population.find((entry) => entry.bodyId === bodyId);
    if (record) {
      selected.set(bodyId, {
        ...record,
        sampleRole: sampleRoleForRecord(record),
      });
    }
  }

  return [...selected.values()].sort((left, right) =>
    left.designation.localeCompare(right.designation, 'en', { numeric: true }),
  );
}

async function loadOptionalJson(filePath, fallbackValue) {
  try {
    return await readJson(filePath);
  } catch {
    return fallbackValue;
  }
}

async function fetchCadFlag(designation, cache) {
  if (designation in cache) {
    return cache[designation];
  }

  const bodyResults = {};
  let flagged = false;
  for (const body of CAD_BODIES) {
    const payload = await fetchJson(
      buildUrl(CAD_API_URL, {
        des: designation,
        body,
        'date-min': VALIDATION_START,
        'date-max': VALIDATION_STOP,
        'dist-max': CAD_DIST_MAX_AU,
        sort: 'date',
      }),
    );
    const count = Number(payload.count ?? 0);
    bodyResults[body] = {
      count,
      first: Array.isArray(payload.data) && payload.data.length > 0 ? payload.data[0] : null,
    };
    if (count > 0) {
      flagged = true;
    }
  }

  cache[designation] = {
    flagged,
    window: {
      start: VALIDATION_START,
      stop: VALIDATION_STOP,
      distMaxAu: CAD_DIST_MAX_AU,
      bodies: CAD_BODIES,
    },
    bodyResults,
  };
  await writeJsonAtomic(CAD_CACHE_PATH, cache);
  return cache[designation];
}

function buildTruthQueryCandidates(record) {
  const candidates = [record.designation, String(record.spkId)];
  if (record.name && record.name !== record.designation) {
    candidates.push(record.name);
  }
  return [...new Set(candidates.filter((value) => value && value.trim().length > 0))];
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
      if (samples.length !== VALIDATION_SAMPLE_COUNT) {
        throw new Error(
          `Expected ${VALIDATION_SAMPLE_COUNT} truth samples for ${record.designation}, got ${samples.length}`,
        );
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
  throw lastError ?? new Error(`Unable to fetch truth for ${record.designation}`);
}

function propagateFromRecord(record, jdTdb) {
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

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function maxErrorKm(record, truthDocument) {
  let max = 0;
  for (const truth of truthDocument.samples) {
    const propagated = propagateFromRecord(record, truth.jdTdb);
    const error = vectorErrorKm(propagated.position_km, truth.positionKm);
    if (error > max) {
      max = error;
    }
  }
  return max;
}

function summarizeSample(sample) {
  const roleCounts = {};
  const stratumCounts = {};
  for (const record of sample) {
    roleCounts[record.sampleRole] = (roleCounts[record.sampleRole] ?? 0) + 1;
    const flagLabel = record.closeApproachFlag ? 'encounter-flagged' : 'not-flagged';
    const key = `${record.orbitClass} | ${record.eccentricityBand} | ${record.stalenessBand} | ${flagLabel}`;
    stratumCounts[key] = (stratumCounts[key] ?? 0) + 1;
  }
  return {
    total: sample.length,
    roleCounts,
    stratumCounts: Object.fromEntries(Object.entries(stratumCounts).sort(([left], [right]) => left.localeCompare(right))),
  };
}

function errorHistogram(results) {
  const counts = Object.fromEntries(ERROR_BUCKETS.map((bucket) => [bucket.label, 0]));
  for (const result of results) {
    counts[bucketForError(result.maxErrorKm)] += 1;
  }
  return counts;
}

function summarizeFractions(rows, predicate) {
  const total = rows.length;
  const over = rows.filter(predicate).length;
  return {
    total,
    over,
    fraction: total === 0 ? null : over / total,
  };
}

function extendedStats(values) {
  const finite = values.filter((value) => Number.isFinite(value)).sort((left, right) => left - right);
  if (finite.length === 0) {
    return {
      count: 0,
      min: null,
      p25: null,
      median: null,
      p75: null,
      p90: null,
      p95: null,
      p99: null,
      max: null,
    };
  }
  return {
    count: finite.length,
    min: finite[0],
    p25: quantile(finite, 0.25),
    median: quantile(finite, 0.5),
    p75: quantile(finite, 0.75),
    p90: quantile(finite, 0.9),
    p95: quantile(finite, 0.95),
    p99: quantile(finite, 0.99),
    max: finite.at(-1),
  };
}

function byKeySummary(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return Object.fromEntries(
    [...map.entries()]
      .sort(([left], [right]) => String(left).localeCompare(String(right)))
      .map(([key, group]) => [key, summarizeFractions(group, (row) => row.maxErrorKm > ENVELOPE_KM)]),
  );
}

function classifyDistributionShape(results) {
  const overall = summarizeNumeric(results.map((row) => row.maxErrorKm));
  const over = results.filter((row) => row.maxErrorKm > ENVELOPE_KM).length;
  const fractionOver = over / results.length;
  const catastrophic = results.filter((row) => row.maxErrorKm >= 1_000_000).length / results.length;

  if (fractionOver < 0.2) return { code: 'c', rationale: 'mostly fine' };
  if (fractionOver > 0.7) return { code: 'd', rationale: 'mostly bad' };
  if (catastrophic >= 0.1 && overall.median !== null && overall.median < ENVELOPE_KM) {
    return { code: 'a', rationale: 'bimodal: most fine, meaningful catastrophic tail' };
  }
  return { code: 'b', rationale: 'graded: large over-envelope share without clean separation' };
}

function countThresholdPopulation(fixture, thresholdDays) {
  let count = 0;
  for (const record of Object.values(fixture.asteroids)) {
    const staleness = COMMON_EPOCH_TDB_JD - record.elements.epochTdbJd;
    if (record.anchorSource === 'sbdb' && staleness > thresholdDays) {
      count += 1;
    }
  }
  return count;
}

function anomalyTailVizCount(fixture) {
  let count = 0;
  for (const record of Object.values(fixture.asteroids)) {
    if (['ETC', 'HTC', 'JFC'].includes(record.orbitClass) && record.inv014Tier === 'visualization-tier') {
      count += 1;
    }
  }
  return count;
}

function markdownTable(headers, rows) {
  const headerRow = `| ${headers.join(' | ')} |`;
  const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
  return [headerRow, dividerRow, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function pct(value) {
  if (value === null || typeof value === 'undefined') return 'n/a';
  return `${(value * 100).toFixed(1)}%`;
}

function fmt(value, digits = 0) {
  if (value === null || typeof value === 'undefined') return 'n/a';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPathRecommendation(shapeCode, classFractions, eccFractions, pathCThresholds, candidateD) {
  if (shapeCode === 'd') {
    return {
      path: 'A',
      reasoning:
        'The measured 90-180d population is mostly over-envelope, so brute-force re-anchor is the only path that preserves honest coverage without writing off a huge fraction of the catalog.',
    };
  }
  if (shapeCode === 'c') {
    return {
      path: 'C',
      reasoning:
        'The measured band is mostly within-envelope, so a tighter staleness gate without more Horizons work is the lowest-cost honest option.',
    };
  }

  if (
    shapeCode === 'b' &&
    pathCThresholds.every((entry) => entry.finalVizFraction < 0.5) &&
    candidateD.finalVizFraction < 0.7
  ) {
    return {
      path: 'A',
      reasoning:
        'The measured band is graded rather than cleanly separable, and the no-Horizons alternatives collapse honest viz-tier coverage to 28-48% of the catalog. Re-anchoring the band is the only path that preserves the full-catalog thesis.',
    };
  }

  const eccD = classFractions;
  void eccD;
  const highE = ['0.5-0.7', '>0.7']
    .map((key) => eccFractions[key]?.fraction ?? 0)
    .filter((value) => value !== null);
  const lowE = ['e<0.3', '0.3-0.5']
    .map((key) => eccFractions[key]?.fraction ?? 0)
    .filter((value) => value !== null);
  const avgHighE = highE.length === 0 ? 0 : highE.reduce((sum, value) => sum + value, 0) / highE.length;
  const avgLowE = lowE.length === 0 ? 0 : lowE.reduce((sum, value) => sum + value, 0) / lowE.length;

  if (avgHighE - avgLowE >= 0.2) {
    return {
      path: 'D',
      reasoning:
        'The measured error rate is materially higher in the higher-e bands, supporting a hybrid threshold by orbital character rather than a single global T.',
    };
  }

  return {
    path: 'A/C ambiguous',
    reasoning:
      'The measured band is neither mostly fine nor cleanly separable by eccentricity, so the remaining decision is cost-vs-coverage between brute-force re-anchor and a tighter global staleness cutoff.',
  };
}

async function main() {
  const fixture = await readJson(FIXTURE_PATH);
  const sourceCadCache = await loadOptionalJson(SOURCE_CAD_CACHE_PATH, {});
  const sourceTruthCache = await loadOptionalJson(SOURCE_TRUTH_CACHE_PATH, {});
  const cadCache = await loadOptionalJson(CAD_CACHE_PATH, {});
  const truthCache = await loadOptionalJson(TRUTH_CACHE_PATH, {});

  for (const [designation, value] of Object.entries(sourceCadCache)) {
    if (!(designation in cadCache)) cadCache[designation] = value;
  }
  for (const [designation, value] of Object.entries(sourceTruthCache)) {
    if (!(designation in truthCache)) truthCache[designation] = value;
  }

  const population = normalizeStalenessPopulation(fixture);
  const anomalyTailCount = population.filter((row) => ['ETC', 'HTC', 'JFC'].includes(row.orbitClass)).length;
  const preexistingReanchored = population.filter((row) => row.anchorSource === 'horizons-reanchor').length;
  const sample = buildSample(population);

  const resolvedSample = [];
  for (const record of sample) {
    const cad = await fetchCadFlag(record.designation, cadCache);
    const truth = await fetchTruthSamples(record, truthCache);
    const measured = {
      ...record,
      closeApproachFlag: cad.flagged,
      cadBodiesTriggered: Object.entries(cad.bodyResults)
        .filter(([, value]) => value.count > 0)
        .map(([body]) => body),
      maxErrorKm: maxErrorKm(record, truth),
    };
    if (measured.maxErrorKm > 100_000_000) {
      throw new Error(
        `Qualitative regime change: ${measured.designation} exceeded 100 million km (${measured.maxErrorKm})`,
      );
    }
    resolvedSample.push(measured);
  }

  const summary = summarizeSample(resolvedSample);
  const overallStats = extendedStats(resolvedSample.map((row) => row.maxErrorKm));
  const histogram = errorHistogram(resolvedSample);
  const byStalenessBand = byKeySummary(resolvedSample, (row) => row.stalenessBand);
  const byOrbitClass = byKeySummary(resolvedSample, (row) => row.orbitClass);
  const byEccentricityBand = byKeySummary(resolvedSample, (row) => row.eccentricityBand);
  const shape = classifyDistributionShape(resolvedSample);

  const cutoverClusterResults = CUTOVER_CLUSTER.map((designation) => {
    const result = resolvedSample.find((row) => row.designation === designation);
    return result
      ? {
          designation,
          maxErrorKm: result.maxErrorKm,
          stalenessBand: result.stalenessBand,
          orbitClass: result.orbitClass,
          eccentricityBand: result.eccentricityBand,
        }
      : null;
  }).filter(Boolean);

  const cutoverClusterExpectedBodies = CUTOVER_CLUSTER.filter((designation) =>
    population.some((row) => row.designation === designation),
  );
  const cutoverClusterWithinExpected =
    cutoverClusterResults.length === cutoverClusterExpectedBodies.length &&
    cutoverClusterResults.every((row) => row.maxErrorKm >= 50_000 && row.maxErrorKm <= 1_000_000);

  const oldCutoverSample = await loadOptionalJson(
    path.join(REPO_ROOT, 'tools', 'slice9-research', 'data', 'slice9-cutover-sample.json'),
    null,
  );
  let oldCutoverWouldClassify = null;
  if (oldCutoverSample?.bodies) {
    const sampleBodies = oldCutoverSample.bodies.filter((row) => row.sampleRole === 'viz-tier-sample');
    const wouldMove = sampleBodies.filter((row) => row.stalenessDays > 90).length;
    oldCutoverWouldClassify = {
      totalVizTier: sampleBodies.length,
      wouldMoveByT90: wouldMove,
      wouldRemainVizByT90: sampleBodies.length - wouldMove,
    };
  }

  const currentTierDistribution = fixture.catalog.inv014TierDistribution;
  const anomalyTailViz = anomalyTailVizCount(fixture);
  const currentViz = currentTierDistribution['visualization-tier'];
  const currentNotSafe = currentTierDistribution['not-kepler-safe'];

  const empiricalA2bUnresolvedRate = 58 / 11_805;
  const pathAReanchorCandidates = population.filter((row) => row.anchorSource === 'sbdb').length;
  const pathAExpectedUnresolved = Math.round(pathAReanchorCandidates * empiricalA2bUnresolvedRate);
  const pathAExpectedViz = currentViz - pathAExpectedUnresolved - anomalyTailViz;
  const pathAExpectedNotSafe = currentNotSafe + pathAExpectedUnresolved + anomalyTailViz;

  const pathCThresholds = [30, 60, 90].map((threshold) => {
    const staleCount = countThresholdPopulation(fixture, threshold);
    const finalViz = currentViz - staleCount - anomalyTailViz;
    const finalNotSafe = currentNotSafe + staleCount + anomalyTailViz;
    return {
      threshold,
      staleCount,
      finalViz,
      finalVizFraction: finalViz / fixture.catalog.totalBodies,
      finalNotSafe,
      finalNotSafeFraction: finalNotSafe / fixture.catalog.totalBodies,
    };
  });

  const candidateD = {
    description: 'T = 180d for e<0.3, T = 90d for e>=0.3',
    staleCount: population.filter((row) => row.anchorSource === 'sbdb').filter((row) => {
      const threshold = row.eccentricityBand === 'e<0.3' ? 180 : 90;
      return row.stalenessDays > threshold;
    }).length,
  };
  candidateD.finalViz = currentViz - candidateD.staleCount - anomalyTailViz;
  candidateD.finalVizFraction = candidateD.finalViz / fixture.catalog.totalBodies;
  candidateD.finalNotSafe = currentNotSafe + candidateD.staleCount + anomalyTailViz;
  candidateD.finalNotSafeFraction = candidateD.finalNotSafe / fixture.catalog.totalBodies;

  const recommendation = formatPathRecommendation(
    shape.code,
    byOrbitClass,
    byEccentricityBand,
    pathCThresholds,
    candidateD,
  );

  const output = {
    generatedAtUtc: new Date().toISOString(),
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    sampleSeed: SAMPLE_SEED,
    population: {
      total: population.length,
      anomalyTailCount,
      preexistingReanchored,
      flaggedCount: population.filter((row) => row.inv014Tier === 'not-kepler-safe').length,
      vizCount: population.filter((row) => row.inv014Tier === 'visualization-tier').length,
    },
    sample: {
      summary,
      bodies: resolvedSample,
    },
    results: {
      overallStats,
      histogram,
      byStalenessBand,
      byOrbitClass,
      byEccentricityBand,
      shape,
      cutoverClusterResults,
      cutoverClusterWithinExpected,
      oldCutoverWouldClassify,
    },
    pathAnalysis: {
      pathA: {
        candidateCount: pathAReanchorCandidates,
        empiricalA2bUnresolvedRate,
        minimumHoursAt1050msPerBody: (pathAReanchorCandidates * 1.05) / 3600,
        expectedUnresolved: pathAExpectedUnresolved,
        expectedFinalViz: pathAExpectedViz,
        expectedFinalVizFraction: pathAExpectedViz / fixture.catalog.totalBodies,
        expectedFinalNotSafe: pathAExpectedNotSafe,
      },
      pathCThresholds,
      pathD: candidateD,
    },
    recommendation,
  };

  const q1Rows = Object.entries(summary.stratumCounts).map(([key, count]) => [key, fmt(count)]);
  const q2HistogramRows = Object.entries(histogram).map(([bucket, count]) => [bucket, fmt(count)]);
  const q2BandRows = Object.entries(byStalenessBand).map(([band, stats]) => [
    band,
    fmt(stats.total),
    fmt(stats.over),
    pct(stats.fraction),
  ]);
  const q2ClassRows = Object.entries(byOrbitClass).map(([orbitClass, stats]) => [
    orbitClass,
    fmt(stats.total),
    fmt(stats.over),
    pct(stats.fraction),
  ]);
  const q2EccRows = Object.entries(byEccentricityBand).map(([band, stats]) => [
    band,
    fmt(stats.total),
    fmt(stats.over),
    pct(stats.fraction),
  ]);
  const q3PathCRows = pathCThresholds.map((entry) => [
    `T=${entry.threshold}d`,
    fmt(entry.staleCount),
    fmt(entry.finalViz),
    pct(entry.finalVizFraction),
    fmt(entry.finalNotSafe),
    pct(entry.finalNotSafeFraction),
  ]);
  const q4ClusterRows = cutoverClusterResults.map((entry) => [
    entry.designation,
    entry.orbitClass,
    entry.eccentricityBand,
    entry.stalenessBand,
    fmt(entry.maxErrorKm, 3),
  ]);
  const worstRows = [...resolvedSample]
    .sort((left, right) => right.maxErrorKm - left.maxErrorKm)
    .slice(0, 20)
    .map((entry) => [
      entry.designation,
      entry.orbitClass,
      entry.eccentricityBand,
      entry.stalenessBand,
      entry.closeApproachFlag ? 'flagged' : 'not-flagged',
      fmt(entry.maxErrorKm, 3),
    ]);

  const report = `# Slice 9 Staleness Distribution Diagnostic

**Status:** COMPLETE (Tue 2026-05-19). Data only. No fixture mutation, no source changes.
**Purpose:** characterize the full 29,792-body 90-180d staleness population before any second re-anchor campaign or contract tightening is implemented.

## Q1 — Sample Design and Execution

- Population in band: ${fmt(population.length)} bodies
- Pre-existing horizons-reanchor bodies in band: ${fmt(preexistingReanchored)}
- Anomaly-tail bodies in band: ${fmt(anomalyTailCount)}
- Deterministic seed: ${SAMPLE_SEED}
- Sample size reached: ${fmt(summary.total)}
- Role counts:
  - viz-tier sample: ${fmt(summary.roleCounts['viz-tier-sample'] ?? 0)}
  - flagged validation sample: ${fmt(summary.roleCounts['flagged-validation-sample'] ?? 0)}
- Cached truth overlap reused from prior research: ${fmt(Object.keys(sourceTruthCache).filter((designation) => resolvedSample.some((row) => row.designation === designation)).length)}
- CAD cache reused from prior research: ${fmt(Object.keys(sourceCadCache).filter((designation) => resolvedSample.some((row) => row.designation === designation)).length)}

Stratification counts:

${markdownTable(['Stratum', 'Count'], q1Rows)}

## Q2 — Distribution Shape

- Shape verdict: **(${shape.code}) ${shape.rationale}**
- Overall max-error distribution:
  - p25: ${fmt(overallStats.min === null ? null : overallStats.p25 ?? null, 3)}
  - p50: ${fmt(overallStats.median, 3)} km
  - p75: ${fmt(overallStats.p75 ?? null, 3)}
  - p90: ${fmt(overallStats.p90, 3)} km
  - p95: ${fmt(overallStats.p95, 3)} km
  - p99: ${fmt(overallStats.p99 ?? null, 3)}
  - max: ${fmt(overallStats.max, 3)} km

Histogram by error bucket:

${markdownTable(['Error bucket', 'Bodies'], q2HistogramRows)}

Fraction over the ${fmt(ENVELOPE_KM)} km envelope by staleness sub-band:

${markdownTable(['Sub-band', 'Bodies', 'Over 50k', 'Fraction'], q2BandRows)}

Fraction over the envelope by orbital class:

${markdownTable(['Class', 'Bodies', 'Over 50k', 'Fraction'], q2ClassRows)}

Fraction over the envelope by eccentricity band:

${markdownTable(['Eccentricity band', 'Bodies', 'Over 50k', 'Fraction'], q2EccRows)}

Worst measured bodies:

${markdownTable(['Designation', 'Class', 'e band', 'Staleness band', 'CAD flag', 'Max error km'], worstRows)}

## Q3 — Path Cost / Benefit

### Path A — Re-anchor all ${fmt(pathAReanchorCandidates)} sbdb bodies in the 90-180d band

- Minimum fetch time at the locked 1.05s throttle: ${fmt(output.pathAnalysis.pathA.minimumHoursAt1050msPerBody, 2)} hours
- Empirical unresolved rate reused from A.2b: ${pct(output.pathAnalysis.pathA.empiricalA2bUnresolvedRate)}
- Expected unresolved bodies: ${fmt(output.pathAnalysis.pathA.expectedUnresolved)}
- Expected final viz-tier count (including the already-committed anomaly-tail class exclusion): ${fmt(output.pathAnalysis.pathA.expectedFinalViz)} (${pct(output.pathAnalysis.pathA.expectedFinalVizFraction)})
- Expected final not-Kepler-safe count: ${fmt(output.pathAnalysis.pathA.expectedFinalNotSafe)}

### Path C — Tighten T, no more Horizons

${markdownTable(['Threshold', 'Staleness-only not-safe add', 'Final viz-tier', 'Viz %', 'Final not-safe', 'Not-safe %'], q3PathCRows)}

### Path D — Candidate hybrid by orbital character

- Candidate function: ${candidateD.description}
- Staleness-only not-safe add: ${fmt(candidateD.staleCount)}
- Final viz-tier: ${fmt(candidateD.finalViz)} (${pct(candidateD.finalVizFraction)})
- Final not-Kepler-safe: ${fmt(candidateD.finalNotSafe)} (${pct(candidateD.finalNotSafeFraction)})

## Q4 — Cross-checks

- 12-body 161d cutover cluster reproduced prior signal: ${cutoverClusterWithinExpected ? 'YES' : 'NO'}
- Cluster values:

${markdownTable(['Designation', 'Class', 'e band', 'Staleness band', 'Max error km'], q4ClusterRows)}

- Prior 78-body cutover viz-tier sample under a pure T=90 staleness gate:
  - would remain viz-tier: ${oldCutoverWouldClassify ? fmt(oldCutoverWouldClassify.wouldRemainVizByT90) : 'n/a'}
  - would move out of viz-tier: ${oldCutoverWouldClassify ? fmt(oldCutoverWouldClassify.wouldMoveByT90) : 'n/a'}
- Any horizons-reanchor bodies already inside the 90-180d band before a second campaign: ${fmt(preexistingReanchored)}

## Data-Driven Path Recommendation

**Recommendation:** ${recommendation.path}

${recommendation.reasoning}

Supporting evidence:
- The band shape is classified as **(${shape.code}) ${shape.rationale}**
- ${fmt(resolvedSample.filter((row) => row.maxErrorKm > ENVELOPE_KM).length)} of ${fmt(resolvedSample.length)} sampled bodies exceeded the ${fmt(ENVELOPE_KM)} km envelope
- Anomaly-tail bodies are absent from this 90-180d population (${fmt(anomalyTailCount)} bodies in band), so the decision here is purely about the staleness axis

## Notes

- This diagnostic does not modify the fixture, contract, or runner.
- The already-committed three-offender re-anchor proof from A.2b remains valid; this diagnostic only measures the 90-180d sbdb population the second amendment exposed.
`;

  await writeJsonAtomic(SAMPLE_PATH, {
    generatedAtUtc: new Date().toISOString(),
    sampleSeed: SAMPLE_SEED,
    totalPopulation: population.length,
    bodies: resolvedSample.map(({ maxErrorKm, cadBodiesTriggered, closeApproachFlag, ...record }) => record),
    summary,
  });
  await writeJsonAtomic(RESULTS_PATH, output);
  await writeJsonAtomic(SUMMARY_PATH, {
    population: output.population,
    sampleSummary: summary,
    results: {
      overallStats,
      histogram,
      byStalenessBand,
      byOrbitClass,
      byEccentricityBand,
      shape,
      cutoverClusterWithinExpected,
    },
    pathAnalysis: output.pathAnalysis,
    recommendation,
  });
  await writeTextAtomic(REPORT_PATH, report);

  console.log(
    `Slice 9 staleness diagnostic complete: sample=${summary.total} shape=${shape.code} overEnvelope=${resolvedSample.filter((row) => row.maxErrorKm > ENVELOPE_KM).length}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
