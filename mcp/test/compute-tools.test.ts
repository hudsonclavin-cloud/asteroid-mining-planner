import assert from 'node:assert/strict';
import test from 'node:test';
import { ZodError } from 'zod';

import { validateLeafRefs } from '../src/envelope/index.js';
import { dlaFeasibilityInputSchema, runDlaFeasibility } from '../src/tools/dla-feasibility.js';
import { estimateMissionCostInputSchema, runEstimateMissionCost } from '../src/tools/estimate-mission-cost.js';
import { runExplainCell } from '../src/tools/explain-cell.js';
import { runGetValidationReport } from '../src/tools/get-validation-report.js';
import { porkchopScanInputSchema, runPorkchopScan } from '../src/tools/porkchop-scan.js';
import { readRepoJson, readRepoText } from '../src/resources/repo.js';

type PinnedFixture = {
  toleranceRel: number;
  cells: Array<{
    id: string;
    departureUtc: string;
    arrivalOffsetDays: number;
    M: 0 | 1 | 2;
    expected: {
      ok: boolean;
      c3Km2S2?: number;
      vInfDepKmps?: number;
      vInfArrKmps?: number;
    };
  }>;
};

const relError = (actual: number, expected: number): number =>
  Math.abs(actual - expected) / Math.max(1, Math.abs(expected));

async function loadPinnedFixture(): Promise<PinnedFixture> {
  return readRepoJson<PinnedFixture>('tests/fixtures/v2/lambert-multi-rev-pinned-cells.json');
}

function parseCostOracle(text: string) {
  const strictMax = Number(text.match(/\*\*Max \|error\|:\*\* ([0-9.]+)% \(New Glenn @ C3=15\)/)?.[1]);
  const strictRms = Number(text.match(/## STRICT verdict: PASS[\s\S]*?\*\*RMS \|error\|:\*\* ([0-9.]+)%/)?.[1]);
  const observedMax = Number(text.match(/\*\*Max \|error\|:\*\* ([0-9.]+)% \(New Glenn @ C3=25\)/)?.[1]);
  const observedRms = Number(text.match(/## OBSERVED summary[\s\S]*?\*\*RMS \|error\|:\*\* ([0-9.]+)%/)?.[1]);
  return { strictMax, strictRms, observedMax, observedRms };
}

test('T12 explain_cell lambert stage matches the pinned fixture', async () => {
  const fixture = await loadPinnedFixture();
  const sample = fixture.cells.find((cell) => cell.id === 'apophis-M0');
  assert(sample);

  const envelope = await runExplainCell({
    designation: '99942',
    departureDate: sample.departureUtc,
    tofDays: sample.arrivalOffsetDays,
    M: sample.M
  });

  assert.equal(envelope.refusal, undefined);
  const lambertStage = (envelope.value as { stages: Array<Record<string, unknown>> }).stages.find(
    (stage) => stage.stage === 'lambert'
  ) as Record<string, { value: number }>;
  assert(lambertStage);
  assert(relError(lambertStage.c3.value, sample.expected.c3Km2S2!) <= fixture.toleranceRel);
  assert(relError(lambertStage.vInfDep.value, sample.expected.vInfDepKmps!) <= fixture.toleranceRel);
  assert(relError(lambertStage.vInfArr.value, sample.expected.vInfArrKmps!) <= fixture.toleranceRel);
});

test('T13 explain_cell infeasible M2 inputs return feasible:false without refusal', async () => {
  const envelope = await runExplainCell({
    designation: '99942',
    departureDate: '2028-01-31',
    tofDays: 182,
    M: 2
  });

  assert.equal(envelope.refusal, undefined);
  assert.equal((envelope.value as { feasible: boolean }).feasible, false);
});

test('T14 explain_cell returns out_of_envelope when vehicle curve domain is exceeded', async () => {
  const fixture = await loadPinnedFixture();
  const sample = fixture.cells.find((cell) => cell.id === 'apophis-M0');
  assert(sample);

  const envelope = await runExplainCell({
    designation: '99942',
    departureDate: sample.departureUtc,
    tofDays: sample.arrivalOffsetDays,
    M: sample.M,
    vehicleId: 'falcon-heavy-expendable'
  });

  assert.equal(envelope.refusal?.code, 'out_of_envelope');
  assert.match(envelope.refusal?.reason ?? '', /0 through 55 km\^2\/s\^2/);
});

test('T15 porkchop_scan tiny grid reports coverage, sorted best cells, and infeasible counts', async () => {
  const envelope = await runPorkchopScan({
    designation: '99942',
    departureStart: '2028-01-31',
    departureEnd: '2028-02-01',
    tofMinDays: 182,
    tofMaxDays: 900,
    M: 2,
    gridDeparture: 5,
    gridTof: 5,
    topN: 5
  });

  assert.equal(envelope.refusal, undefined);
  assert.equal(envelope.coverage?.total, 25);
  const value = envelope.value as {
    summary: { feasibleCells: { value: number }; infeasibleCells: { value: number } };
    bestCells: Array<{ c3: { value: number } }>;
  };
  assert.equal(value.summary.feasibleCells.value + value.summary.infeasibleCells.value, 25);
  assert(value.summary.infeasibleCells.value > 0);
  for (let index = 1; index < value.bestCells.length; index += 1) {
    assert(value.bestCells[index - 1]!.c3.value <= value.bestCells[index]!.c3.value);
  }
});

test('T16 porkchop_scan grid cap is an input error and ephemeris miss is an out_of_envelope refusal', async () => {
  // E3-a regression guard: the input schema must be a plain ZodObject (has .shape)
  // so tools/list renders its properties. A .superRefine() wrapper (ZodEffects) has
  // no .shape and rendered empty properties — do not reintroduce it.
  assert.ok(porkchopScanInputSchema.shape.tofMinDays, 'porkchop_scan input schema must expose properties');

  // Cross-field cap now enforced in the handler as an InvalidParams input error.
  await assert.rejects(
    runPorkchopScan({
      designation: '433',
      departureStart: '2032-06-10',
      departureEnd: '2032-06-11',
      tofMinDays: 200,
      tofMaxDays: 300,
      M: 0,
      gridDeparture: 201,
      gridTof: 100,
      topN: 5
    }),
    /<= 20000/
  );

  const envelope = await runPorkchopScan({
    designation: '433',
    departureStart: '2025-01-01',
    departureEnd: '2025-01-10',
    tofMinDays: 200,
    tofMaxDays: 300,
    M: 0,
    gridDeparture: 5,
    gridTof: 5,
    topN: 5
  });
  assert.equal(envelope.refusal?.code, 'out_of_envelope');
});

test('T17 every explain_cell quantity leaf carries confidence and resolving sourceIds', async () => {
  const envelope = await runExplainCell({
    designation: '433',
    departureDate: '2032-06-10',
    tofDays: 272,
    M: 0,
    vehicleId: 'falcon-heavy-expendable',
    siteId: 'cape-canaveral'
  });

  assert.equal(envelope.refusal, undefined);
  const quantities: Array<{ confidence?: string; sourceIds?: string[] }> = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === 'object') {
      const maybeQuantity = value as { value?: unknown; units?: unknown; confidence?: string; sourceIds?: string[] };
      if (typeof maybeQuantity.value === 'number' && typeof maybeQuantity.units === 'string') {
        quantities.push(maybeQuantity);
      }
      Object.values(value).forEach(visit);
    }
  };
  visit(envelope.value);

  assert(quantities.length > 0);
  for (const leaf of quantities) {
    assert.equal(typeof leaf.confidence, 'string');
    assert(Array.isArray(leaf.sourceIds));
    assert((leaf.sourceIds?.length ?? 0) > 0);
  }
  assert.deepEqual(validateLeafRefs(envelope), []);
});

test('T18 dla_feasibility returns a DLA quantity and RED sites as values, not refusals', async () => {
  const envelope = await runDlaFeasibility({
    designation: '99942',
    departureDate: '2027-04-07',
    tofDays: 903.4868421052632,
    M: 2
  });

  assert.equal(envelope.refusal, undefined);
  const value = envelope.value as {
    dla: { value: number; frame: string };
    sites: Array<{ siteId: string; feasible: boolean; marginDeg: { value: number } }>;
  };
  assert.equal(value.dla.frame, 'ICRF/equatorial');
  const cape = value.sites.find((site) => site.siteId === 'cape-canaveral');
  assert(cape);
  assert.equal(cape.feasible, false);
  assert(cape.marginDeg.value < 0);
});

test('T19 dla_feasibility unknown siteId is a Zod error and dates beyond 2040 refuse out_of_envelope', async () => {
  assert.throws(
    () =>
      dlaFeasibilityInputSchema.parse({
        designation: '99942',
        departureDate: '2032-06-10',
        tofDays: 272,
        siteId: 'ksc'
      }),
    ZodError
  );

  const envelope = await runDlaFeasibility({
    designation: '99942',
    departureDate: '2041-01-01',
    tofDays: 272,
    M: 0
  });
  assert.equal(envelope.refusal?.code, 'out_of_envelope');
  assert.match(envelope.refusal?.reason ?? '', /through 2040-/);
});

test('T20 estimate_mission_cost happy path keeps measured payload leaves and assumed top-level confidence', async () => {
  const envelope = await runEstimateMissionCost({
    designation: '433',
    departureDate: '2032-06-10',
    tofDays: 272,
    M: 0,
    vehicleId: 'falcon-heavy-expendable'
  });

  assert.equal(envelope.refusal, undefined);
  assert.equal(envelope.confidence, 'assumed');
  const value = envelope.value as {
    payloadAtC3: { confidence: string; sourceIds: string[] };
    deliveredMass: { value: number };
  };
  assert(value.deliveredMass.value > 0);
  assert.equal(value.payloadAtC3.confidence, 'measured');
  assert(value.payloadAtC3.sourceIds.includes('launch-vehicles'));
  assert.deepEqual(validateLeafRefs(envelope), []);
  assert((envelope.assumptions ?? []).some((entry) => entry.includes('Margin policy: deterministic 5%')));
});

test('T21 estimate_mission_cost refuses out_of_envelope beyond a vehicle curve domain', async () => {
  const fixture = await loadPinnedFixture();
  const sample = fixture.cells.find((cell) => cell.id === 'apophis-M0');
  assert(sample);

  const envelope = await runEstimateMissionCost({
    designation: '99942',
    departureDate: sample.departureUtc,
    tofDays: sample.arrivalOffsetDays,
    M: sample.M,
    vehicleId: 'falcon-heavy-expendable'
  });

  assert.equal(envelope.refusal?.code, 'out_of_envelope');
  assert.match(envelope.refusal?.reason ?? '', /0 through 55 km\^2\/s\^2/);
});

test('T22 estimate_mission_cost flags RED selected sites without hiding the mass math', async () => {
  const envelope = await runEstimateMissionCost({
    designation: '99942',
    departureDate: '2027-04-07',
    tofDays: 903.4868421052632,
    M: 2,
    vehicleId: 'falcon-heavy-expendable',
    siteId: 'cape-canaveral'
  });

  assert.equal(envelope.refusal, undefined);
  const value = envelope.value as {
    deliveredMass: { value: number };
    site: { siteFeasible: boolean };
  };
  assert(value.deliveredMass.value > 0);
  assert.equal(value.site.siteFeasible, false);
  assert((envelope.assumptions ?? []).some((entry) => entry.includes('siteFeasible:false')));
});

test('T23 get_validation_report(all) keeps all class labels distinct and sourceIds resolvable', async () => {
  const envelope = await runGetValidationReport({ section: 'all' });

  assert.equal(envelope.refusal, undefined);
  const sections = (envelope.value as unknown as {
    sections: {
      lambert_m0: { label: string };
      lambert_multirev: { label: string };
      dla_vectors: { label: string };
      cost_oracle: { strict: { label: string }; observed: { label: string } };
    };
  }).sections;
  assert.equal(sections.lambert_m0.label, 'M=0 vs poliastro');
  assert.match(sections.lambert_multirev.label, /magnitude/i);
  assert.equal(sections.cost_oracle.strict.label, 'STRICT');
  assert.equal(sections.cost_oracle.observed.label, 'OBSERVED');
  assert.deepEqual(validateLeafRefs(envelope), []);
});

test('T24 get_validation_report figures match the committed artifacts', async () => {
  const [lambertM0, multiRev, dlaVectors, costOracleText] = await Promise.all([
    readRepoJson<{ summary: { maxRelErrorAcrossBodies: number } }>('tools/slice11-research/data/poliastro-validation.json'),
    readRepoJson<{ overallMaxRelError: number }>('tools/slice11-research/data/multi-rev-poliastro-validation.json'),
    readRepoJson<{ summary: { maxAngularSeparationDeg: number; maxAbsDeltaDlaDeg: number } }>('tools/slice12-research/data/dla-oracle-m1-vectors.json'),
    readRepoText('tools/slice13-research/elvperf/oracle/oracle-report.md')
  ]);
  const oracle = parseCostOracle(costOracleText);
  const envelope = await runGetValidationReport({ section: 'all' });
  const sections = (envelope.value as unknown as {
    sections: {
      lambert_m0: { maxRelError: { value: number } };
      lambert_multirev: { maxRelError: { value: number } };
      dla_vectors: { maxAngularSeparationDeg: { value: number }; maxAbsDeltaDlaDeg: { value: number } };
      cost_oracle: { strict: { maxErrorPct: { value: number }; rmsErrorPct: { value: number } }; observed: { maxErrorPct: { value: number }; rmsErrorPct: { value: number } } };
    };
  }).sections;

  assert.equal(sections.lambert_m0.maxRelError.value, lambertM0.summary.maxRelErrorAcrossBodies);
  assert.equal(sections.lambert_multirev.maxRelError.value, multiRev.overallMaxRelError);
  assert.equal(sections.dla_vectors.maxAngularSeparationDeg.value, dlaVectors.summary.maxAngularSeparationDeg);
  assert.equal(sections.dla_vectors.maxAbsDeltaDlaDeg.value, dlaVectors.summary.maxAbsDeltaDlaDeg);
  assert.equal(sections.cost_oracle.strict.maxErrorPct.value, oracle.strictMax);
  assert.equal(sections.cost_oracle.strict.rmsErrorPct.value, oracle.strictRms);
  assert.equal(sections.cost_oracle.observed.maxErrorPct.value, oracle.observedMax);
  assert.equal(sections.cost_oracle.observed.rmsErrorPct.value, oracle.observedRms);
});
