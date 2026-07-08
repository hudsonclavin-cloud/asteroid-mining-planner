import assert from 'node:assert/strict';
import test from 'node:test';

import { validateLeafRefs } from '../src/envelope/index.js';
import { runExplainCell } from '../src/tools/explain-cell.js';
import { porkchopScanInputSchema, runPorkchopScan } from '../src/tools/porkchop-scan.js';
import { readRepoJson } from '../src/resources/repo.js';

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

test('T16 porkchop_scan grid cap is a Zod error and ephemeris miss is an out_of_envelope refusal', async () => {
  assert.throws(
    () =>
      porkchopScanInputSchema.parse({
        designation: '433',
        departureStart: '2032-06-10',
        departureEnd: '2032-06-11',
        tofMinDays: 200,
        tofMaxDays: 300,
        gridDeparture: 201,
        gridTof: 100
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
