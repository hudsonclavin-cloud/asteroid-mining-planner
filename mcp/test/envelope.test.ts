import assert from 'node:assert/strict';
import test from 'node:test';

import {
  confidenceMin,
  makeEnvelope,
  quantity,
  refuse,
  validateLeafRefs,
  type SourceRef
} from '../src/envelope/index.js';

const measuredRepo: SourceRef = {
  id: 'fixture',
  kind: 'repo',
  path: 'tests/fixtures/v2/lambert-multi-rev-pinned-cells.json',
  commit: 'd726f3d',
  confidence: 'measured'
};

const derivedComputation: SourceRef = {
  id: 'solver',
  kind: 'computation',
  method: 'lambert transfer solve',
  code: {
    path: 'src/v2/core/lambert',
    commit: 'd726f3d'
  },
  confidence: 'derived'
};

test('quantity rejects non-finite values and empty units', () => {
  assert.throws(() => quantity(Number.NaN, 'km/s'), /finite/);
  assert.throws(() => quantity(Number.POSITIVE_INFINITY, 'km/s'), /finite/);
  assert.throws(() => quantity(1, '   '), /units/);
});

test('makeEnvelope computes weakest-link confidence and envelope version', () => {
  const envelope = makeEnvelope({
    tool: 'explain_cell',
    value: {
      c3: quantity(12.5, 'km^2/s^2', {
        confidence: 'measured',
        sourceIds: ['fixture']
      }),
      deliveredMass: quantity(4821.72578002563, 'kg', {
        confidence: 'derived',
        sourceIds: ['solver']
      })
    },
    confidence: 'measured',
    provenance: [measuredRepo, derivedComputation],
    assumptions: ['patched-conic screening model'],
    validity_envelope: 'Pinned Slice 15 fixture cell only'
  });

  assert.equal(envelope.envelope_version, '1');
  assert.equal(envelope.confidence, 'derived');
  assert.equal(envelope.value?.deliveredMass.units, 'kg');
  assert.deepEqual(validateLeafRefs(envelope), []);
});

test('makeEnvelope rejects null value and empty provenance', () => {
  assert.throws(
    () =>
      makeEnvelope({
        tool: 'explain_cell',
        value: null,
        provenance: [measuredRepo],
        validity_envelope: 'fixture'
      }),
    /non-null value/
  );

  assert.throws(
    () =>
      makeEnvelope({
        tool: 'explain_cell',
        value: { c3: quantity(1, 'km^2/s^2') },
        provenance: [],
        validity_envelope: 'fixture'
      }),
    /non-empty provenance/
  );
});

test('makeEnvelope rejects non-finite numbers anywhere in the value path', () => {
  assert.throws(
    () =>
      makeEnvelope({
        tool: 'explain_cell',
        value: { nested: { bad: Number.NEGATIVE_INFINITY } },
        provenance: [measuredRepo],
        validity_envelope: 'fixture'
      }),
    /Non-finite number/
  );
});

test('mixed-provenance envelopes require quantity leaf confidence and sourceIds', () => {
  assert.throws(
    () =>
      makeEnvelope({
        tool: 'explain_cell',
        value: { c3: quantity(12.5, 'km^2/s^2') },
        provenance: [measuredRepo, derivedComputation],
        validity_envelope: 'fixture'
      }),
    /require confidence/
  );

  assert.throws(
    () =>
      makeEnvelope({
        tool: 'explain_cell',
        value: {
          c3: quantity(12.5, 'km^2/s^2', {
            confidence: 'measured'
          })
        },
        provenance: [measuredRepo, derivedComputation],
        validity_envelope: 'fixture'
      }),
    /require sourceIds/
  );
});

test('validateLeafRefs reports dangling source ids', () => {
  const envelope = {
    envelope_version: '1' as const,
    tool: 'explain_cell',
    value: {
      c3: quantity(12.5, 'km^2/s^2', {
        confidence: 'measured',
        sourceIds: ['missing', 'fixture']
      })
    },
    confidence: 'measured' as const,
    provenance: [measuredRepo],
    assumptions: [],
    validity_envelope: 'fixture'
  };

  assert.deepEqual(validateLeafRefs(envelope), ['missing']);
});

test('makeEnvelope rejects dangling source ids', () => {
  assert.throws(
    () =>
      makeEnvelope({
        tool: 'explain_cell',
        value: {
          c3: quantity(12.5, 'km^2/s^2', {
            confidence: 'measured',
            sourceIds: ['missing']
          })
        },
        provenance: [measuredRepo],
        validity_envelope: 'fixture'
      }),
    /not found in provenance/
  );
});

test('refuse returns value null and rejects invalid refusal codes', () => {
  const envelope = refuse(
    'estimate_mission_cost',
    'out_of_envelope',
    'No published payload data past this C3.',
    'Provide a sourced vehicle payload anchor at or beyond the requested C3.',
    { validity_envelope: 'Published launch-vehicle curve only' }
  );

  assert.equal(envelope.value, null);
  assert.equal(envelope.refusal?.code, 'out_of_envelope');
  assert.equal(envelope.confidence, 'assumed');

  assert.throws(
    () =>
      refuse(
        'estimate_mission_cost',
        'negative_answer' as never,
        'No transfer exists.',
        'Nothing.'
      ),
    /Unknown refusal code/
  );
});

test('confidenceMin orders assumed below derived below measured', () => {
  assert.equal(confidenceMin([measuredRepo, derivedComputation]), 'derived');
  assert.equal(
    confidenceMin([
      measuredRepo,
      derivedComputation,
      {
        id: 'catalog',
        kind: 'external',
        name: 'catalog snapshot',
        retrieved: '2026-07-07',
        confidence: 'assumed'
      }
    ]),
    'assumed'
  );
});
