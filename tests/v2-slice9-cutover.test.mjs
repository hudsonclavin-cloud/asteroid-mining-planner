import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { AU_KM, COMMON_EPOCH_TDB_JD } from '../tools/slice9-research/common.mjs';
import { propagateKeplerian } from '../tools/slice9-research/keplerian-offline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const samplePath = path.join(repoRoot, 'tools', 'slice9-research', 'data', 'slice9-cutover-sample.json');
const cutoverTruthPath = path.join(repoRoot, 'tools', 'slice9-research', 'data', 'slice9-cutover-truth.json');
const cutoverCadPath = path.join(repoRoot, 'tools', 'slice9-research', 'data', 'slice9-cutover-cad.json');
const invTruthPath = path.join(repoRoot, 'tools', 'slice9-research', 'data', 'inv014-truth.json');
const stalenessTruthPath = path.join(
  repoRoot,
  'tools',
  'slice9-diagnostic',
  'data',
  'staleness-distribution-truth.json',
);

const ANOMALY_TAIL_CLASSES = new Set(['ETC', 'HTC', 'JFC']);
const STALE_THRESHOLD_DAYS = 90;
const RESIDUAL_ALERT_RATE = 0.05;
const ENVELOPE_KM = 50_000;
const RETIRED_REASON =
  'RETIRED 2026-07-12: fixture slice9-cutover-sample.json was never ' +
  'committed (.gitignore:17), unrecoverable, no generator. Expected ' +
  'values 26/58/66/61 were measured from the lost sample; a regenerated ' +
  'sample would reset them while faking continuity. See ' +
  'SLICE_9_FOUNDING.md amendment.';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function maxErrorKm(record, truthBody) {
  let maxKm = 0;
  for (const samplePoint of truthBody.samples) {
    const estimate = propagateFromFixture(record, samplePoint.jdTdb);
    const errorKm = vectorErrorKm(estimate.position_km, samplePoint.positionKm);
    if (errorKm > maxKm) maxKm = errorKm;
  }
  return maxKm;
}

function isEncounterFlagged(sampleBody, cadFlags) {
  const fromCad = cadFlags[sampleBody.designation]?.flagged ?? sampleBody.closeApproachFlag ?? false;
  if (
    typeof sampleBody.closeApproachFlag === 'boolean' &&
    sampleBody.closeApproachFlag !== fromCad
  ) {
    throw new Error(
      `CAD/sample flag disagreement for ${sampleBody.designation}: sample=${sampleBody.closeApproachFlag} cad=${fromCad}`,
    );
  }
  return fromCad;
}

function stalenessDays(record) {
  return COMMON_EPOCH_TDB_JD - record.elements.epochTdbJd;
}

function passesGate1(sampleBody, cadFlags) {
  return !isEncounterFlagged(sampleBody, cadFlags);
}

function passesGate2(record) {
  return stalenessDays(record) <= STALE_THRESHOLD_DAYS || record.anchorSource === 'horizons-reanchor';
}

function passesGate3(record) {
  return !ANOMALY_TAIL_CLASSES.has(record.orbitClass);
}

function nearlyPct(numerator, denominator) {
  return denominator === 0 ? 0 : (numerator / denominator) * 100;
}

test('Slice 9 Phase A.3 three-gate cutover harness validates the committed contract and documents residual envelope exceedance', { skip: RETIRED_REASON }, async (t) => {
  const fixture = readJson(fixturePath);
  const sample = readJson(samplePath);
  const cutoverTruth = readJson(cutoverTruthPath);
  const cutoverCad = readJson(cutoverCadPath);
  const invTruth = readJson(invTruthPath);
  const stalenessTruth = readJson(stalenessTruthPath);
  const mergedTruth = {
    ...invTruth,
    ...stalenessTruth,
    ...cutoverTruth,
  };

  assert.equal(sample.summary.total, 162, 'Slice 9 cutover sample should remain the committed 162-body set');
  assert.equal(sample.bodies.length, 162, 'Slice 9 cutover sample body list should contain 162 entries');

  const gate1Bodies = [];
  const gate2Bodies = [];
  const gate3Bodies = [];
  const vizTierBodies = [];
  const residualFailures = [];

  for (const sampled of sample.bodies) {
    const record = fixture.asteroids[sampled.bodyId];
    assert.ok(record, `Missing fixture body for ${sampled.bodyId}`);

    const gate1 = passesGate1(sampled, cutoverCad);
    const gate2 = passesGate2(record);
    const gate3 = passesGate3(record);

    if (!gate1) gate1Bodies.push({ sampled, record });
    if (!gate2) gate2Bodies.push({ sampled, record });
    if (!gate3) gate3Bodies.push({ sampled, record });

    const expectedTier = gate1 && gate2 && gate3 ? 'visualization-tier' : 'not-kepler-safe';
    assert.equal(
      record.inv014Tier,
      expectedTier,
      `${sampled.designation} expected ${expectedTier} from the committed three-gate contract`,
    );

    if (expectedTier === 'visualization-tier') {
      vizTierBodies.push({ sampled, record });
    }
  }

  await t.test('Gate 1: encounter-flagged bodies are not-kepler-safe', () => {
    assert.equal(gate1Bodies.length, 26, 'Expected 26 encounter-flagged bodies in the committed cutover sample');
    for (const { sampled, record } of gate1Bodies) {
      assert.equal(record.inv014Tier, 'not-kepler-safe', `${sampled.designation} must be not-kepler-safe`);
    }
  });

  await t.test('Gate 2: stale-and-unanchored bodies are not-kepler-safe', () => {
    assert.equal(gate2Bodies.length, 58, 'Expected 58 stale-unanchored bodies in the committed cutover sample');
    for (const { sampled, record } of gate2Bodies) {
      assert.equal(record.anchorSource, 'stale-unanchored', `${sampled.designation} must remain stale-unanchored`);
      assert.equal(record.inv014Tier, 'not-kepler-safe', `${sampled.designation} must be not-kepler-safe`);
    }
  });

  await t.test('Gate 3: anomaly-tail classes are not-kepler-safe', () => {
    assert.equal(gate3Bodies.length, 66, 'Expected 66 anomaly-tail bodies in the committed cutover sample');
    for (const { sampled, record } of gate3Bodies) {
      assert.ok(ANOMALY_TAIL_CLASSES.has(record.orbitClass), `${sampled.designation} must be anomaly-tail`);
      assert.equal(record.inv014Tier, 'not-kepler-safe', `${sampled.designation} must be not-kepler-safe`);
    }
  });

  await t.test('Three-gate viz-tier rule and residual envelope exceedance stay within the documented bound', () => {
    assert.equal(vizTierBodies.length, 61, 'Expected 61 viz-tier bodies in the committed cutover sample after Gate 3');

    for (const { sampled, record } of vizTierBodies) {
      const truthBody = mergedTruth[sampled.designation];
      assert.ok(truthBody, `Missing cached Horizons truth for viz-tier body ${sampled.designation}`);
      const measuredMaxErrorKm = maxErrorKm(record, truthBody);
      if (measuredMaxErrorKm > ENVELOPE_KM) {
        residualFailures.push({
          designation: sampled.designation,
          orbitClass: record.orbitClass,
          anchorSource: record.anchorSource,
          conditionCode: record.conditionCode,
          dataArcDays: record.dataArcDays,
          stalenessDays: stalenessDays(record),
          maxErrorKm: measuredMaxErrorKm,
        });
      }
    }

    const residualRate = residualFailures.length / vizTierBodies.length;
    t.diagnostic(
      `Slice 9 residual envelope-exceedance: ${residualFailures.length}/${vizTierBodies.length} = ${residualRate.toFixed(4)} (${nearlyPct(residualFailures.length, vizTierBodies.length).toFixed(1)}%)`,
    );
    if (residualFailures.length > 0) {
      t.diagnostic(
        `Residual failures: ${residualFailures
          .map((row) => `${row.designation} ${row.maxErrorKm.toFixed(3)} km cc=${row.conditionCode ?? 'n/a'} arc=${row.dataArcDays ?? 'n/a'}d`)
          .join('; ')}`,
      );
    }

    assert.ok(
      residualRate <= RESIDUAL_ALERT_RATE,
      `Slice 9 residual envelope-exceedance rate ${residualFailures.length}/${vizTierBodies.length} = ${(residualRate * 100).toFixed(2)}% exceeded the 5% documented-alert bound`,
    );
  });

  t.diagnostic(
    `Slice 9 gate summary: gate1=${gate1Bodies.length}/26 gate2=${gate2Bodies.length}/58 gate3=${gate3Bodies.length}/66 viz=${vizTierBodies.length}/61 residual=${residualFailures.length}/${vizTierBodies.length}`,
  );
});
