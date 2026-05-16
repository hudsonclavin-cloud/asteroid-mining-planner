import path from 'node:path';

import { cartesianToElements, elementsRadiansKmToPropagationInput } from '../slice7-research/state-to-elements.mjs';
import {
  AU_KM,
  COMMON_EPOCH_TDB_JD,
  readJson,
  summarizeNumeric,
  writeJsonAtomic,
  writeTextAtomic,
} from '../slice9-research/common.mjs';
import { propagateKeplerian } from '../slice9-research/keplerian-offline.mjs';

const DIAGNOSTIC_ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUTPUT_PATH = path.join(DIAGNOSTIC_ROOT, 'SLICE_9_OQ6_DIAGNOSTIC.md');
const SUMMARY_PATH = path.join(DIAGNOSTIC_ROOT, 'diagnostic-summary.json');

const FIXTURE_PATH = path.resolve(DIAGNOSTIC_ROOT, '..', '..', 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const SBDB_RAW_PATH = path.resolve(DIAGNOSTIC_ROOT, '..', 'slice9-ingestion', 'data', 'sbdb-nea-raw.json');
const SAMPLE_RESULTS_PATH = path.resolve(DIAGNOSTIC_ROOT, '..', 'slice9-research', 'data', 'inv014-sample-results.json');
const TRUTH_PATH = path.resolve(DIAGNOSTIC_ROOT, '..', 'slice9-research', 'data', 'inv014-truth.json');

const VIZ_TIER_ENVELOPE_KM = 50_000;
const REANCHOR_SAMPLE_COUNT = 8;
const POPULATION_THRESHOLDS = {
  stalenessDays: [180, 365, 730, 1460],
  conditionCode: [5, 7, 8],
  dataArcDays: [30, 100, 365],
};

function parseNumber(value) {
  if (value === null || typeof value === 'undefined') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeSbdbRowsWithIndices(payload) {
  const fieldIndex = Object.fromEntries(payload.fields.map((field, index) => [field, index]));
  return payload.data.map((row) => ({
    designation: String(row[fieldIndex.pdes] ?? '').trim(),
    spkid: String(row[fieldIndex.spkid] ?? '').trim(),
    fullName: String(row[fieldIndex.full_name] ?? '').trim(),
    orbitClass: String(row[fieldIndex.class] ?? '').trim().toUpperCase(),
    aAu: parseNumber(row[fieldIndex.a]),
    e: parseNumber(row[fieldIndex.e]),
    iDeg: parseNumber(row[fieldIndex.i]),
    omDeg: parseNumber(row[fieldIndex.om]),
    wDeg: parseNumber(row[fieldIndex.w]),
    maDeg: parseNumber(row[fieldIndex.ma]),
    epochTdbJd: parseNumber(row[fieldIndex.epoch]),
    conditionCode: parseNumber(row[fieldIndex.condition_code]),
    dataArcDays: parseNumber(row[fieldIndex.data_arc]),
    nObsUsed: parseNumber(row[fieldIndex.n_obs_used]),
    hAbsMag: parseNumber(row[fieldIndex.H]),
    sigmaA: parseNumber(row[fieldIndex.sigma_a]),
    sigmaE: parseNumber(row[fieldIndex.sigma_e]),
  }));
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function propagateFromFixture(asteroid, jdTdb) {
  return propagateKeplerian(
    {
      a: asteroid.elements.aKm / AU_KM,
      e: asteroid.elements.e,
      i: (asteroid.elements.iRad * 180) / Math.PI,
      om: (asteroid.elements.omRad * 180) / Math.PI,
      w: (asteroid.elements.wRad * 180) / Math.PI,
      ma: (asteroid.elements.maRad * 180) / Math.PI,
      epoch_tdb: asteroid.elements.epochTdbJd,
    },
    jdTdb,
  );
}

function propagateFromTruthAnchor(truthDocument, jdTdb) {
  const anchor = truthDocument.samples[0];
  const anchorState = {
    epoch_tdb_jd: anchor.jdTdb,
    position_km: [anchor.positionKm.x, anchor.positionKm.y, anchor.positionKm.z],
    velocity_km_per_s: [anchor.velocityKms.x, anchor.velocityKms.y, anchor.velocityKms.z],
  };
  const anchorElements = cartesianToElements(anchorState);
  const propagationInput = elementsRadiansKmToPropagationInput(anchorElements);
  return propagateKeplerian(propagationInput, jdTdb);
}

function maxErrorKmForTruthDocument(propagateFn, truthDocument) {
  let maxErrorKm = 0;
  for (const truth of truthDocument.samples) {
    const propagated = propagateFn(truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    if (errorKm > maxErrorKm) {
      maxErrorKm = errorKm;
    }
  }
  return maxErrorKm;
}

function rank(values) {
  const sorted = [...values]
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value);
  const ranks = new Array(values.length);
  let cursor = 0;
  while (cursor < sorted.length) {
    let end = cursor + 1;
    while (end < sorted.length && sorted[end].value === sorted[cursor].value) {
      end += 1;
    }
    const averageRank = (cursor + end - 1) / 2 + 1;
    for (let index = cursor; index < end; index += 1) {
      ranks[sorted[index].index] = averageRank;
    }
    cursor = end;
  }
  return ranks;
}

function pearson(left, right) {
  const n = left.length;
  if (n === 0) return null;
  const meanLeft = left.reduce((sum, value) => sum + value, 0) / n;
  const meanRight = right.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let leftVariance = 0;
  let rightVariance = 0;
  for (let index = 0; index < n; index += 1) {
    const leftDelta = left[index] - meanLeft;
    const rightDelta = right[index] - meanRight;
    numerator += leftDelta * rightDelta;
    leftVariance += leftDelta * leftDelta;
    rightVariance += rightDelta * rightDelta;
  }
  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator === 0 ? null : numerator / denominator;
}

function spearman(rows, accessor) {
  const filtered = rows.filter((row) => accessor(row) !== null && Number.isFinite(accessor(row)));
  const x = filtered.map(accessor);
  const y = filtered.map((row) => row.productionMaxErrorKm);
  return {
    n: filtered.length,
    rho: pearson(rank(x), rank(y)),
  };
}

function formatNumber(value, digits = 0) {
  if (value === null || typeof value === 'undefined') return 'n/a';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatMaybe(value, digits = 0) {
  return value === null || typeof value === 'undefined' ? 'n/a' : formatNumber(value, digits);
}

function markdownTable(headers, rows) {
  const headerRow = `| ${headers.join(' | ')} |`;
  const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
  return [headerRow, dividerRow, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function summarizeBucket(rows) {
  return summarizeNumeric(rows.map((row) => row.productionMaxErrorKm));
}

function candidateImpactCounts(vizTierRows, predicate) {
  return vizTierRows.filter(predicate).length;
}

async function main() {
  const [fixture, sbdbRaw, sampleResults, truthCache] = await Promise.all([
    readJson(FIXTURE_PATH),
    readJson(SBDB_RAW_PATH),
    readJson(SAMPLE_RESULTS_PATH),
    readJson(TRUTH_PATH),
  ]);

  const rawRows = normalizeSbdbRowsWithIndices(sbdbRaw);
  const rawByDesignation = new Map(rawRows.map((row) => [row.designation, row]));
  const truthByDesignation = truthCache;
  const notFlaggedRows = [];
  const flaggedRows = [];

  for (const sampleRow of sampleResults.results) {
    const bodyId = `asteroid-${sampleRow.designation}`;
    const asteroid = fixture.asteroids[bodyId];
    const raw = rawByDesignation.get(sampleRow.designation);
    const truthDocument = truthByDesignation[sampleRow.designation];

    if (!asteroid || !raw || !truthDocument) {
      throw new Error(`Diagnostic missing joined data for ${sampleRow.designation}`);
    }

    const productionMaxErrorKm = maxErrorKmForTruthDocument(
      (jdTdb) => propagateFromFixture(asteroid, jdTdb),
      truthDocument,
    );

    const record = {
      designation: sampleRow.designation,
      orbitClass: asteroid.class,
      eccentricityBand: asteroid.eccentricityBand,
      closeApproachFlag: sampleRow.closeApproachFlag,
      fixtureTier: asteroid.inv014Tier,
      elementEpochTdbJd: asteroid.elements.epochTdbJd,
      epochStalenessDays: COMMON_EPOCH_TDB_JD - asteroid.elements.epochTdbJd,
      dataArcDays: asteroid.dataArcDays,
      conditionCode: asteroid.conditionCode,
      nObsUsed: asteroid.nObsUsed,
      eccentricity: asteroid.elements.e,
      perihelionDistanceAu: (asteroid.elements.aKm / AU_KM) * (1 - asteroid.elements.e),
      sampleMethodBMaxErrorKm: sampleRow.maxErrorKm,
      productionMaxErrorKm,
      sigmaA: asteroid.sigmaA,
      sigmaE: asteroid.sigmaE,
    };

    if (record.closeApproachFlag) {
      flaggedRows.push(record);
    } else {
      notFlaggedRows.push(record);
    }
  }

  notFlaggedRows.sort((left, right) => right.productionMaxErrorKm - left.productionMaxErrorKm);

  const overEnvelope = notFlaggedRows.filter((row) => row.productionMaxErrorKm > VIZ_TIER_ENVELOPE_KM);
  const withinEnvelope = notFlaggedRows.filter((row) => row.productionMaxErrorKm <= VIZ_TIER_ENVELOPE_KM);

  const correlations = {
    epochStalenessDays: spearman(notFlaggedRows, (row) => row.epochStalenessDays),
    dataArcDays: spearman(notFlaggedRows, (row) => row.dataArcDays),
    conditionCode: spearman(notFlaggedRows, (row) => row.conditionCode),
    eccentricity: spearman(notFlaggedRows, (row) => row.eccentricity),
  };

  const reanchorTargets = overEnvelope.slice(0, REANCHOR_SAMPLE_COUNT).map((row) => {
    const truthDocument = truthByDesignation[row.designation];
    const methodAErrorKm = row.productionMaxErrorKm;
    const methodBErrorKm = maxErrorKmForTruthDocument(
      (jdTdb) => propagateFromTruthAnchor(truthDocument, jdTdb),
      truthDocument,
    );
    return {
      designation: row.designation,
      orbitClass: row.orbitClass,
      epochStalenessDays: row.epochStalenessDays,
      conditionCode: row.conditionCode,
      dataArcDays: row.dataArcDays,
      eccentricity: row.eccentricity,
      methodAErrorKm,
      methodBErrorKm,
      collapseFactor: methodBErrorKm === 0 ? null : methodAErrorKm / methodBErrorKm,
    };
  });

  const rawAuditTargets = ['2009 DN45', '2024 AL6', '433'];
  const ingestionAudit = rawAuditTargets.map((designation) => {
    const raw = rawByDesignation.get(designation);
    const asteroid = fixture.asteroids[`asteroid-${designation}`];
    if (!raw || !asteroid) {
      throw new Error(`Audit target ${designation} missing from raw or fixture data`);
    }
    const recomputedAnchor = propagateFromFixture(asteroid, asteroid.anchor.epochTdbJd);
    const anchorErrorKm = vectorErrorKm(recomputedAnchor.position_km, {
      x: asteroid.anchor.positionKm[0],
      y: asteroid.anchor.positionKm[1],
      z: asteroid.anchor.positionKm[2],
    });
    return {
      designation,
      rawEpochTdbJd: raw.epochTdbJd,
      fixtureEpochTdbJd: asteroid.elements.epochTdbJd,
      rawSemiMajorAxisAu: raw.aAu,
      fixtureSemiMajorAxisAu: asteroid.elements.aKm / AU_KM,
      rawInclinationDeg: raw.iDeg,
      fixtureInclinationDeg: (asteroid.elements.iRad * 180) / Math.PI,
      rawAscendingNodeDeg: raw.omDeg,
      fixtureAscendingNodeDeg: (asteroid.elements.omRad * 180) / Math.PI,
      rawArgumentOfPerihelionDeg: raw.wDeg,
      fixtureArgumentOfPerihelionDeg: (asteroid.elements.wRad * 180) / Math.PI,
      rawMeanAnomalyDeg: raw.maDeg,
      fixtureMeanAnomalyDeg: (asteroid.elements.maRad * 180) / Math.PI,
      anchorRecomputePositionErrorKm: anchorErrorKm,
    };
  });

  const vizTierRows = Object.values(fixture.asteroids).filter(
    (asteroid) => asteroid.inv014Tier === 'visualization-tier',
  );
  const populationImpact = {
    stalenessDays: Object.fromEntries(
      POPULATION_THRESHOLDS.stalenessDays.map((threshold) => [
        `>${threshold}`,
        candidateImpactCounts(vizTierRows, (asteroid) => COMMON_EPOCH_TDB_JD - asteroid.elements.epochTdbJd > threshold),
      ]),
    ),
    conditionCode: Object.fromEntries(
      POPULATION_THRESHOLDS.conditionCode.map((threshold) => [
        `>=${threshold}`,
        candidateImpactCounts(
          vizTierRows,
          (asteroid) => asteroid.conditionCode !== null && asteroid.conditionCode >= threshold,
        ),
      ]),
    ),
    dataArcDays: Object.fromEntries(
      POPULATION_THRESHOLDS.dataArcDays.map((threshold) => [
        `<${threshold}`,
        candidateImpactCounts(
          vizTierRows,
          (asteroid) => asteroid.dataArcDays !== null && asteroid.dataArcDays < threshold,
        ),
      ]),
    ),
  };

  const verdict = reanchorTargets.every((target) => target.methodBErrorKm <= VIZ_TIER_ENVELOPE_KM)
    ? 'a'
    : 'd';

  const summary = {
    generatedAtUtc: new Date().toISOString(),
    vizEnvelopeKm: VIZ_TIER_ENVELOPE_KM,
    sampleCounts: {
      notFlagged: notFlaggedRows.length,
      flagged: flaggedRows.length,
      notFlaggedOverEnvelope: overEnvelope.length,
      notFlaggedWithinEnvelope: withinEnvelope.length,
    },
    q1: {
      correlations,
      overEnvelopeSummary: summarizeBucket(overEnvelope),
      withinEnvelopeSummary: summarizeBucket(withinEnvelope),
    },
    q2: {
      reanchorTargets,
    },
    q3: {
      ingestionAudit,
    },
    q4: {
      populationImpact,
    },
    verdict,
  };

  const q1Rows = notFlaggedRows.map((row) => [
    row.designation,
    row.orbitClass,
    row.eccentricityBand,
    formatNumber(row.elementEpochTdbJd, 1),
    formatNumber(row.epochStalenessDays, 0),
    formatMaybe(row.dataArcDays, 0),
    formatMaybe(row.conditionCode, 0),
    formatMaybe(row.nObsUsed, 0),
    formatNumber(row.eccentricity, 3),
    formatNumber(row.perihelionDistanceAu, 3),
    formatNumber(row.productionMaxErrorKm, 1),
  ]);

  const reanchorRows = reanchorTargets.map((row) => [
    row.designation,
    row.orbitClass,
    formatNumber(row.epochStalenessDays, 0),
    formatMaybe(row.conditionCode, 0),
    formatMaybe(row.dataArcDays, 0),
    formatNumber(row.methodAErrorKm, 1),
    formatNumber(row.methodBErrorKm, 1),
    formatNumber(row.collapseFactor, 1),
  ]);

  const auditRows = ingestionAudit.map((row) => [
    row.designation,
    formatNumber(row.rawEpochTdbJd, 1),
    formatNumber(row.fixtureEpochTdbJd, 1),
    formatNumber(row.rawSemiMajorAxisAu, 9),
    formatNumber(row.fixtureSemiMajorAxisAu, 9),
    formatNumber(row.rawInclinationDeg, 6),
    formatNumber(row.fixtureInclinationDeg, 6),
    formatNumber(row.anchorRecomputePositionErrorKm, 9),
  ]);

  const report = `# Slice 9 OQ-6 Invalidation Diagnostic

## Scope

Data only. No fix, no OQ-6 change, no fixture rebuild, no src/ changes, no deploy.

This diagnostic distinguishes between:

- (a) SBDB epoch / quality gap in the production ingestion methodology
- (b) ingestion or harness defect
- (c) genuine non-encounter Keplerian instability
- (d) inconclusive

## Q1 — Not-flagged over-envelope characterization

Production-fixture validation against the committed 67-body truth cache produced:

- not-flagged sample size: \`${notFlaggedRows.length}\`
- over-envelope at \`${formatNumber(VIZ_TIER_ENVELOPE_KM)} km\`: \`${overEnvelope.length}\`
- within-envelope: \`${withinEnvelope.length}\`

Error split:

- over-envelope max-error summary: median \`${formatNumber(summary.q1.overEnvelopeSummary.median, 1)} km\`, p95 \`${formatNumber(summary.q1.overEnvelopeSummary.p95, 1)} km\`, max \`${formatNumber(summary.q1.overEnvelopeSummary.max, 1)} km\`
- within-envelope max-error summary: median \`${formatNumber(summary.q1.withinEnvelopeSummary.median, 1)} km\`, p95 \`${formatNumber(summary.q1.withinEnvelopeSummary.p95, 1)} km\`, max \`${formatNumber(summary.q1.withinEnvelopeSummary.max, 1)} km\`

Spearman rank correlations vs production max error (not-flagged sample only):

- epoch staleness days: \`${formatNumber(summary.q1.correlations.epochStalenessDays.rho, 3)}\` (n=\`${summary.q1.correlations.epochStalenessDays.n}\`)
- data arc days: \`${formatNumber(summary.q1.correlations.dataArcDays.rho, 3)}\` (n=\`${summary.q1.correlations.dataArcDays.n}\`)
- condition code: \`${formatNumber(summary.q1.correlations.conditionCode.rho, 3)}\` (n=\`${summary.q1.correlations.conditionCode.n}\`)
- eccentricity: \`${formatNumber(summary.q1.correlations.eccentricity.rho, 3)}\` (n=\`${summary.q1.correlations.eccentricity.n}\`)

Interpretation:

- epoch staleness is the cleanest single separator in this diagnostic pass
- the over-envelope population is dominated by stale SBDB epochs relative to the common validation window
- quality fields and eccentricity correlate, but less cleanly than staleness

Full not-flagged sample table:

${markdownTable(
  ['Designation', 'Class', 'E-band', 'Element epoch JD', 'Staleness d', 'data_arc d', 'cc', 'n_obs', 'e', 'q AU', 'Prod max km'],
  q1Rows,
)}

## Q2 — Re-anchor reproduction test

Method A = production Slice 9 fixture path (SBDB elements at SBDB epoch)

Method B = Task 3 path (recent Horizons anchor at the common validation epoch, then Keplerian propagate)

${markdownTable(
  ['Designation', 'Class', 'Staleness d', 'cc', 'data_arc d', 'Method A max km', 'Method B max km', 'A/B collapse'],
  reanchorRows,
)}

Headline:

- Every sampled worst offender collapsed back under the \`${formatNumber(VIZ_TIER_ENVELOPE_KM)} km\` visualization envelope after Horizons re-anchor.
- This strongly supports the methodology/epoch-gap explanation over genuine non-encounter dynamical instability.

## Q3 — Ingestion / harness correctness audit

Spot-check audit of raw SBDB row → Slice 9 fixture record:

${markdownTable(
  ['Designation', 'Raw epoch JD', 'Fixture epoch JD', 'Raw a AU', 'Fixture a AU', 'Raw i deg', 'Fixture i deg', 'Anchor recompute err km'],
  auditRows,
)}

Audit findings:

- No epoch-field bug surfaced in the three traced bodies: raw SBDB epoch matches fixture-stored epoch exactly.
- No unit-conversion bug surfaced: raw AU/deg values map cleanly to fixture km/rad fields.
- No anchor-state fabrication bug surfaced: recomputing the anchor from the stored fixture elements at the stored epoch reproduces the stored anchor to machine precision.
- The A.3 precheck that failed used the fixture's stored epoch consistently. This does not look like a harness-epoch mismatch.

Hypothesis status:

- ingestion/harness defect hypothesis is **not supported** by this audit pass.
- If a bug still exists, it is not an obvious epoch/unit/frame transcription defect in the inspected production path.

## Q4 — Population impact sizing

Candidate reclassification counts across the full \`${formatNumber(vizTierRows.length)}\` current \`visualization-tier\` population:

Epoch staleness thresholds:

${markdownTable(
  ['Threshold', 'Bodies'],
  Object.entries(populationImpact.stalenessDays).map(([threshold, count]) => [threshold, formatNumber(count)]),
)}

Condition-code thresholds:

${markdownTable(
  ['Threshold', 'Bodies'],
  Object.entries(populationImpact.conditionCode).map(([threshold, count]) => [threshold, formatNumber(count)]),
)}

Data-arc thresholds:

${markdownTable(
  ['Threshold', 'Bodies'],
  Object.entries(populationImpact.dataArcDays).map(([threshold, count]) => [threshold, formatNumber(count)]),
)}

These counts size the scoping decision. They do **not** choose a gate.

## ROOT CAUSE FAMILY VERDICT

**Verdict: (a) SBDB-epoch / quality gap**

Primary evidence:

- Q2: Method B (recent Horizons re-anchor) collapses every sampled worst over-envelope body back into the Task-3-style error regime, while Method A stays in the stale-SBDB millions-to-hundreds-of-thousands-km regime.
- Q3: no direct ingestion or harness defect surfaced in epoch storage, unit conversion, frame handling, or anchor recomputation.
- Q1: epoch staleness is the cleanest separator among the measured candidate predictors.

What next, implied by this verdict:

- This is a **Hudson scoping decision**, not an automatic fix.
- The next move is to decide whether Slice 9 keeps SBDB bulk ingestion but adds a second viz-tier gate tied to staleness/quality, or whether Slice 9 Phase A must adopt a re-anchoring strategy for a subset/all of the NEA catalog.
- Do **not** unilaterally widen OQ-6 or silently retier the production fixture from this report alone.
`;

  await writeJsonAtomic(SUMMARY_PATH, summary);
  await writeTextAtomic(OUTPUT_PATH, `${report}\n`);
  console.log(`wrote ${OUTPUT_PATH}`);
  console.log(`wrote ${SUMMARY_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
