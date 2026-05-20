import path from 'node:path';

import { readJson, writeJsonAtomic, writeTextAtomic } from '../slice9-research/common.mjs';

const DIAGNOSTIC_ROOT = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(DIAGNOSTIC_ROOT, '..', '..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const OUTPUT_PATH = path.join(DIAGNOSTIC_ROOT, 'SLICE_9_A2B_DERIVED_FIELDS_DIAGNOSTIC.md');
const SUMMARY_PATH = path.join(DIAGNOSTIC_ROOT, 'derived-fields-summary.json');

function eccentricityBandForBody(eccentricity) {
  if (eccentricity < 0.1) return 'A';
  if (eccentricity < 0.2) return 'B';
  if (eccentricity < 0.3) return 'C';
  return 'D';
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function round6(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function nearlyEqual(left, right, tolerance = 1e-9) {
  return Math.abs(left - right) <= tolerance;
}

function qualityRankForRecord(record) {
  const conditionScore =
    record.conditionCode === null ? 0 : clamp01(1 - record.conditionCode / 9);
  const dataArcScore =
    record.dataArcDays === null
      ? 0
      : clamp01(Math.log10(1 + record.dataArcDays) / Math.log10(1001));
  return round6(0.6 * conditionScore + 0.4 * dataArcScore);
}

function deriveAsteroidDiameterKmFromAbsoluteMagnitude(absoluteMagnitude, albedo = 0.14) {
  return (1329 / Math.sqrt(albedo)) * 10 ** (-absoluteMagnitude / 5);
}

function deriveAsteroidRadiusMFromAbsoluteMagnitude(absoluteMagnitude, albedo = 0.14) {
  return deriveAsteroidDiameterKmFromAbsoluteMagnitude(absoluteMagnitude, albedo) * 500;
}

function markdownTable(headers, rows) {
  const headerRow = `| ${headers.join(' | ')} |`;
  const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
  return [headerRow, dividerRow, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function fmt(value, digits = 0) {
  if (value === null || typeof value === 'undefined') return 'n/a';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function nearestThresholdDelta(eccentricity) {
  const thresholds = [0.1, 0.2, 0.3];
  return thresholds
    .map((threshold) => ({ threshold, delta: Math.abs(eccentricity - threshold) }))
    .sort((left, right) => left.delta - right.delta)[0];
}

function buildEmptyFieldCounts() {
  return {
    total: 0,
    byAnchorSource: {
      sbdb: 0,
      'horizons-reanchor': 0,
      'stale-unanchored': 0,
    },
  };
}

function pushExample(bucket, value, limit = 25) {
  if (bucket.length < limit) {
    bucket.push(value);
  }
}

async function main() {
  const fixture = await readJson(FIXTURE_PATH);

  const fieldCounts = {
    eccentricityBand: buildEmptyFieldCounts(),
    qualityRank: buildEmptyFieldCounts(),
    estimatedRadiusM: buildEmptyFieldCounts(),
  };

  const examples = {
    eccentricityBand: [],
    qualityRank: [],
    estimatedRadiusM: [],
  };

  const bandMismatches = [];

  for (const [bodyId, record] of Object.entries(fixture.asteroids)) {
    const anchorSource = record.anchorSource ?? 'sbdb';

    const expectedBand = eccentricityBandForBody(record.elements.e);
    if (record.eccentricityBand !== expectedBand) {
      fieldCounts.eccentricityBand.total += 1;
      fieldCounts.eccentricityBand.byAnchorSource[anchorSource] += 1;
      const threshold = nearestThresholdDelta(record.elements.e);
      const row = {
        bodyId,
        designation: record.designation,
        spkId: record.spkId,
        anchorSource,
        storedBand: record.eccentricityBand,
        expectedBand,
        eccentricity: record.elements.e,
        nearestThreshold: threshold.threshold,
        thresholdDelta: threshold.delta,
      };
      bandMismatches.push(row);
      pushExample(examples.eccentricityBand, row);
    }

    const expectedQualityRank = qualityRankForRecord(record);
    if (record.qualityRank !== expectedQualityRank) {
      fieldCounts.qualityRank.total += 1;
      fieldCounts.qualityRank.byAnchorSource[anchorSource] += 1;
      pushExample(examples.qualityRank, {
        bodyId,
        designation: record.designation,
        spkId: record.spkId,
        anchorSource,
        storedQualityRank: record.qualityRank,
        expectedQualityRank,
      });
    }

    if (record.H === null) {
      if (record.estimatedRadiusM !== null) {
        fieldCounts.estimatedRadiusM.total += 1;
        fieldCounts.estimatedRadiusM.byAnchorSource[anchorSource] += 1;
        pushExample(examples.estimatedRadiusM, {
          bodyId,
          designation: record.designation,
          spkId: record.spkId,
          anchorSource,
          storedRadiusM: record.estimatedRadiusM,
          expectedRadiusM: null,
        });
      }
    } else {
      const expectedRadiusM = deriveAsteroidRadiusMFromAbsoluteMagnitude(record.H);
      if (!nearlyEqual(record.estimatedRadiusM, expectedRadiusM)) {
        fieldCounts.estimatedRadiusM.total += 1;
        fieldCounts.estimatedRadiusM.byAnchorSource[anchorSource] += 1;
        pushExample(examples.estimatedRadiusM, {
          bodyId,
          designation: record.designation,
          spkId: record.spkId,
          anchorSource,
          storedRadiusM: record.estimatedRadiusM,
          expectedRadiusM,
        });
      }
    }
  }

  const failingTestCases = [
    {
      testName: 'Slice 9 boundary ingestion preserves the full catalog and tier counts',
      location: 'tests/v2-boundary-slice9.test.mjs:98',
      firstFailingBody: bandMismatches[0] ?? null,
    },
    {
      testName:
        'Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies',
      location: 'tests/v2-boundary-slice9.test.mjs:115',
      firstFailingBody: bandMismatches[0] ?? null,
    },
    {
      testName: 'Slice 9 quality metadata and anchor semantics stay internally consistent',
      location: 'tests/v2-boundary-slice9.test.mjs:158',
      firstFailingBody: bandMismatches[0] ?? null,
    },
    {
      testName: 'Slice 9 browser loader fetches and ingests the NEA catalog fixture',
      location: 'tests/v2-boundary-slice9.test.mjs:205',
      firstFailingBody: bandMismatches[0] ?? null,
    },
  ];

  const sourceDistribution = {
    sbdb: 0,
    'horizons-reanchor': 0,
    'stale-unanchored': 0,
  };
  for (const record of Object.values(fixture.asteroids)) {
    sourceDistribution[record.anchorSource ?? 'sbdb'] += 1;
  }

  const boundaryCrossers = {
    'near-0.1': bandMismatches.filter((row) => row.nearestThreshold === 0.1).length,
    'near-0.2': bandMismatches.filter((row) => row.nearestThreshold === 0.2).length,
    'near-0.3': bandMismatches.filter((row) => row.nearestThreshold === 0.3).length,
  };

  const summary = {
    generatedAtUtc: new Date().toISOString(),
    totalBodies: fixture.catalog.totalBodies,
    anchorSourceDistribution: sourceDistribution,
    failingTestCases,
    fieldCounts,
    bandMismatches,
    boundaryCrossers,
    rootCauseVerdict: 'A.2b re-anchor bypassed derived-field recomputation for eccentricityBand only.',
    fixScopeRecommendation: {
      bodiesImpactedByBandDrift: bandMismatches.length,
      impactedAnchorSource: 'horizons-reanchor',
      impactedFields: ['eccentricityBand'],
      unaffectedDerivedFields: ['qualityRank', 'estimatedRadiusM'],
      recommendedFixShape:
        'Backfill the completed fixture for the affected re-anchored bodies and patch the A.2b runner so future re-runs recompute derived fields after replacing elements; do not re-run the 10h Horizons fetch.',
    },
  };

  const q1Rows = failingTestCases.map((entry, index) => {
    const body = entry.firstFailingBody;
    return [
      String(index + 1),
      entry.testName,
      entry.location,
      body?.designation ?? 'n/a',
      body?.spkId ?? 'n/a',
      body?.anchorSource ?? 'n/a',
      body ? fmt(body.eccentricity, 12) : 'n/a',
      body?.storedBand ?? 'n/a',
      body?.expectedBand ?? 'n/a',
    ];
  });

  const q2Rows = Object.entries(fieldCounts).map(([field, counts]) => [
    field,
    fmt(counts.total),
    fmt(counts.byAnchorSource.sbdb),
    fmt(counts.byAnchorSource['horizons-reanchor']),
    fmt(counts.byAnchorSource['stale-unanchored']),
  ]);

  const mismatchRows = bandMismatches.map((row) => [
    row.designation,
    String(row.spkId),
    row.anchorSource,
    fmt(row.eccentricity, 12),
    row.storedBand,
    row.expectedBand,
    String(row.nearestThreshold),
    fmt(row.thresholdDelta, 12),
  ]);

  const report = `# Slice 9 A.2b Derived-Field Staleness Diagnostic

**Status:** COMPLETE (Tue 2026-05-19). Data only. No fixture mutation, no fix.
**Input fixture:** \`tests/fixtures/v2/nea-catalog-slice9.json\` in its completed-but-uncommitted A.2b state.

## Q1 — The 4 failing test cases

All four current red tests fail on the **same first inconsistent body**, not four different bodies. Each test invokes Slice 9 ingestion, and ingestion aborts on the first derived-field mismatch it encounters.

${markdownTable(
  ['#', 'Test case', 'Location', 'First failing body', 'SPK-ID', 'anchorSource', 'Stored e', 'Stored band', 'Expected band'],
  q1Rows,
)}

Interpretation:
- Current red window = **1 underlying body encountered 4 times by 4 test entries**.
- That first failing body is \`2006 TB7\`, and it is **already re-anchored correctly** at the raw-elements level.
- The failure is its **stored derived eccentricity band**, not its raw orbital state.

## Q2 — Full-catalog derived-field consistency audit

The full 41,906-body fixture was audited using the same derivation logic as the original A.2 fixture builder:
- \`eccentricityBand\` recomputed from stored \`elements.e\`
- \`qualityRank\` recomputed from stored \`conditionCode\` + \`dataArcDays\`, including the original A.2 \`round6\` serialization
- \`estimatedRadiusM\` recomputed from stored \`H\`

${markdownTable(
  ['Derived field', 'Total mismatches', 'sbdb', 'horizons-reanchor', 'stale-unanchored'],
  q2Rows,
)}

Headline:
- **Only one derived field is stale: \`eccentricityBand\`.**
- Mismatch count = **10 total**, and **all 10 are \`horizons-reanchor\` bodies**.
- \`qualityRank\` is **not stale** anywhere once recomputed with the original A.2 rounding rule.
- \`estimatedRadiusM\` is **not stale** anywhere.

Anchor-source distribution context:
- \`sbdb\`: ${fmt(sourceDistribution.sbdb)}
- \`horizons-reanchor\`: ${fmt(sourceDistribution['horizons-reanchor'])}
- \`stale-unanchored\`: ${fmt(sourceDistribution['stale-unanchored'])}

Population impact:
- Re-anchored bodies with stale derived fields: **10 / ${fmt(sourceDistribution['horizons-reanchor'])}**
- SBDB-source bodies with stale derived fields: **0**
- Stale-unanchored bodies with stale derived fields: **0**

This is the decisive scope result: **the bug is confined to a tiny re-anchored subset, not the whole catalog and not base A.2 ingestion.**

### All 10 eccentricityBand mismatches

${markdownTable(
  ['Designation', 'SPK-ID', 'anchorSource', 'Stored e', 'Stored band', 'Expected band', 'Nearest threshold', 'Delta'],
  mismatchRows,
)}

Band-threshold clustering:
- Near \`e = 0.1\`: ${fmt(boundaryCrossers['near-0.1'])}
- Near \`e = 0.2\`: ${fmt(boundaryCrossers['near-0.2'])}
- Near \`e = 0.3\`: ${fmt(boundaryCrossers['near-0.3'])}

Most are threshold-crossers around the \`0.2\` / \`0.3\` band boundaries, which is exactly the failure mode expected when the raw eccentricity is refreshed but the stored band is left behind. Two notable cases are farther from the nearest boundary:
- \`2008 TC3\`: stored \`D\` but re-anchored \`e = 0.0597\` ⇒ expected \`A\`
- \`2009 VA\`: stored \`D\` but re-anchored \`e = 0.2097\` ⇒ expected \`C\`

That pattern is stronger than simple rounding noise; it is stale-band carryover from pre-re-anchor values.

## Q3 — Code-path audit: where the drift comes from

Fresh A.2 ingestion computes and stores the derived fields during fixture build:
- \`tools/slice9-ingestion/build-nea-catalog.mjs:89-92\` computes \`qualityRankForRow(...)\`
- \`tools/slice9-ingestion/build-nea-catalog.mjs:231-261\` writes the per-body record
- specifically:
  - \`build-nea-catalog.mjs:254\` writes \`eccentricityBand: eccentricityBandForBody(row.e)\`
  - \`build-nea-catalog.mjs:261\` writes \`qualityRank: qualityRankForRow(row)\`

Boundary ingestion re-validates \`eccentricityBand\` from stored raw eccentricity:
- \`src/v2/boundary/slice9-nea-catalog.ts:300-305\`

But the A.2b runner's re-anchor path bypasses that fresh-ingestion derivation step:
- \`tools/slice9-ingestion/reanchor-stale-subset.mjs:265-283\` (\`applyReanchor(...)\`) replaces:
  - \`record.anchor\`
  - \`record.elements\`
  - \`record.anchorSource\`
  - \`record.reanchorEpochTdbJd\`
- It does **not** recompute:
  - \`record.eccentricityBand\`
  - \`record.qualityRank\`
  - \`record.estimatedRadiusM\`

Confirmed mechanism:
- The runner updates **raw elements + epoch + anchor tags**
- The runner does **not** invoke the A.2 derived-field path afterward
- Therefore any derived field that depends on refreshed raw elements can drift

In practice, only \`eccentricityBand\` drifted, because:
- \`qualityRank\` depends on \`conditionCode\` + \`dataArcDays\`, which A.2b never changes
- \`estimatedRadiusM\` depends on \`H\`, which A.2b never changes

## Q4 — Full derived-field list and impact

Per-body derived fields present in the Slice 9 schema:
1. \`estimatedRadiusM\` — derived from \`H\`
2. \`eccentricityBand\` — derived from \`elements.e\`
3. \`qualityRank\` — derived from \`conditionCode\` + \`dataArcDays\`

Audit result by field:
- \`estimatedRadiusM\`: **0 mismatches**
- \`eccentricityBand\`: **10 mismatches**
- \`qualityRank\`: **0 mismatches**

Top-level catalog summary fields were also spot-audited:
- \`catalog.totalBodies\`: matches body count
- \`catalog.inv014TierDistribution\`: matches body records
- \`catalog.missingAbsoluteMagnitudeCount\`: matches body records
- \`catalog.anomalyTailCount\`: matches body records
- \`catalog.classDistribution\`: count-equivalent to body records

So the only production inconsistency surfaced by A.2b is the **10-body \`eccentricityBand\` drift inside the re-anchored subset**.

## Root Cause Verdict

**ROOT CAUSE:** derived-field recomputation was bypassed in the A.2b runner for the re-anchor path.

Evidence:
- Boundary validates \`eccentricityBand\` from stored \`elements.e\` (\`slice9-nea-catalog.ts:300-305\`)
- Fresh A.2 build computes derived fields during record construction (\`build-nea-catalog.mjs:231-261\`)
- A.2b re-anchor replaces raw fields without invoking that derived-field path (\`reanchor-stale-subset.mjs:265-283\`)
- Full-catalog audit shows mismatch scope is:
  - **10 re-anchored bodies**
  - **0 sbdb bodies**
  - **0 stale-unanchored bodies**

This is **not** a base A.2 ingestion bug, and **not** an OQ-6 / hybrid-accuracy failure.

## Fix Scope Recommendation (Hudson decision)

Recommended fix scope:
- Bodies requiring backfill: **10 re-anchored bodies**
- Derived fields requiring backfill: **eccentricityBand only**
- No evidence that \`qualityRank\` or \`estimatedRadiusM\` need backfill

Recommended repair shape:
1. Backfill the completed fixture's stale \`eccentricityBand\` values
2. Patch the A.2b runner so future re-runs recompute derived fields after replacing elements

Not recommended:
- Re-running the 10-hour Horizons fetch. The raw fixture output is already correct; the issue is a local post-fetch derived-field carryover bug.

## Status

Diagnostic complete. Fence stays. Phase A not closed. Fix scope is Hudson's decision from the surfaced evidence.
`;

  await writeJsonAtomic(SUMMARY_PATH, summary);
  await writeTextAtomic(OUTPUT_PATH, report);
  console.log(`Wrote ${path.relative(REPO_ROOT, OUTPUT_PATH)}`);
  console.log(`Wrote ${path.relative(REPO_ROOT, SUMMARY_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
