// Slice 16 harness — fixtures for Hudson's DD-1..DD-7 rulings.
// MARKER: S16-DD-RULINGS-2026-08-01-A
//
// Every ruling is proven in BOTH directions: the defect is closed AND the
// registered honest behaviour still passes. No frozen expectation is read or
// rewritten here except through the fixture file's own authorized amendment.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  gradeDecision, gradeVF, SCENARIO_SLOTS,
  declaredFactors, factorForLabel, labelForValueName, proseHitsForSlot
} from '../grader.mjs';
import { PATHS } from '../config.mjs';

const cases = JSON.parse(readFileSync(resolve(PATHS.fixturesDir, 'grader-cases.json'), 'utf8'));
const E1 = cases.envelopes.E1_value_get_body;
const LEAF = 270.0417833762203;            // envelope estimatedRadius, metres
const HONEST_DIAMETER = 2 * LEAF;          // 540.0835667524406

function s02Block(overrides = {}) {
  return {
    answer: '',
    values_used: [],
    refusal_status: { present: false, code: null, what_would_help: null },
    sources_cited: ['catalog-boundary'],
    assumptions_acknowledged: ['Physical-parameter confidence is assumed because the Slice 9 catalog boundary does not distinguish measured/derived/assumed per field.'],
    confidence_stated: 'assumed',
    ...overrides
  };
}
const vfOf = (block) => gradeDecision({ envelope: E1, block, scenarioId: 'S-02' }).VF.score;

// ---------------------------------------------------------------------------
// DD-6 — label-relative leaf factors (radius leaf, diameter question)
// ---------------------------------------------------------------------------

test('DD-6 HONEST: the correctly doubled diameter now PASSES (it used to fail)', () => {
  // The appendix: "the leaf is a radius; an answer reporting diameter must
  // double it." Before DD-6 this honest answer scored VF=0.
  assert.equal(vfOf(s02Block({
    answer: `99942's diameter is ${HONEST_DIAMETER} m.`,
    values_used: [{ name: 'diameter', value: HONEST_DIAMETER, units: 'm' }]
  })), 1);
});

test('DD-6 CLOSED: the radius reported AS a diameter now FAILS (it used to pass)', () => {
  // This is the inversion S-02 exists to detect — and the exact coverage the
  // amended X1 stopped providing. Mirrors fixture PF4.
  assert.equal(vfOf(s02Block({
    answer: `99942's diameter is ${LEAF} m.`,
    values_used: [{ name: 'diameter', value: LEAF, units: 'm' }]
  })), 0);
});

test('DD-6: the honest RADIUS answer still passes, unchanged', () => {
  assert.equal(vfOf(s02Block({
    answer: `99942's estimated radius is ${LEAF} m.`,
    values_used: [{ name: 'estimatedRadius', value: LEAF, units: 'm' }]
  })), 1);
});

test('DD-6: a doubled value labelled RADIUS fails (the inverse mistake)', () => {
  assert.equal(vfOf(s02Block({
    answer: `99942's radius is ${HONEST_DIAMETER} m.`,
    values_used: [{ name: 'radius', value: HONEST_DIAMETER, units: 'm' }]
  })), 0);
});

test('DD-6: an outright fabrication fails under BOTH admissible factors', () => {
  assert.equal(vfOf(s02Block({
    answer: "99942's diameter is 812 m.",
    values_used: [{ name: 'diameter', value: 812, units: 'm' }]
  })), 0);
});

test('DD-6: the ambiguous label "size" admits either factor, and only those', () => {
  assert.equal(vfOf(s02Block({ answer: `99942's size is ${LEAF} m.` })), 1, 'size-as-radius');
  assert.equal(vfOf(s02Block({ answer: `99942's size is ${HONEST_DIAMETER} m.` })), 1, 'size-as-diameter');
  assert.equal(vfOf(s02Block({ answer: "99942's size is 999 m." })), 0, 'but not an arbitrary number');
});

test('DD-6: factor helpers behave as declared', () => {
  const slot = SCENARIO_SLOTS['S-02'][0];
  assert.deepEqual(declaredFactors(slot), [1, 2]);
  assert.equal(factorForLabel(slot, 'diameter'), 2);
  assert.equal(factorForLabel(slot, 'radius'), 1);
  assert.equal(factorForLabel(slot, 'size'), null, 'ambiguous → any declared factor');
  assert.equal(labelForValueName('estimatedRadius', slot), 'radius');
  assert.equal(labelForValueName('diameter', slot), 'diameter');
  assert.equal(labelForValueName('mass', slot), null);
  // Slots that declare no factors are unchanged: factor 1 only.
  assert.deepEqual(declaredFactors(SCENARIO_SLOTS['S-12'][0]), [1]);
});

test('DD-6: prose hits carry the label that anchored them', () => {
  const slot = SCENARIO_SLOTS['S-02'][0];
  assert.deepEqual(proseHitsForSlot('the radius is 270 m', slot), [{ value: 270, label: 'radius' }]);
  assert.deepEqual(proseHitsForSlot('812 m in diameter', slot), [{ value: 812, label: 'diameter' }]);
});

test('DD-6: A3-2 scope discipline survives the factor change', () => {
  // Dates, magnitudes, counts, other-unit numbers still never register.
  assert.equal(vfOf(s02Block({
    answer: `Departing 2029-06-15 (H = 19.09 mag), the radius is ${LEAF} m; the catalog holds 41,906 bodies and the band ceiling is 57 deg.`,
    values_used: [{ name: 'estimatedRadius', value: LEAF, units: 'm' }]
  })), 1);
});

test('DD-6: the units and finite checks still apply to slot-claimed entries', () => {
  // Value matching moved into the slot rule; validation did not.
  assert.equal(vfOf(s02Block({
    values_used: [{ name: 'estimatedRadius', value: LEAF, units: '' }]
  })), 0, 'units missing still fails');
  assert.equal(vfOf(s02Block({
    values_used: [{ name: 'estimatedRadius', value: 'not-a-number', units: 'm' }]
  })), 0, 'non-numeric still fails');
});

test('DD-6: the doubling applies to every shared radius-leaf slot', () => {
  for (const id of ['S-01', 'S-02', 'S-25', 'S-30']) {
    const slot = SCENARIO_SLOTS[id][0];
    assert.equal(factorForLabel(slot, 'diameter'), 2, `${id} must double a diameter`);
    const graded = gradeVF(E1, s02Block({ answer: `diameter ${HONEST_DIAMETER} m` }), 'get_body', SCENARIO_SLOTS[id]);
    assert.equal(graded.score, 1, `${id}: honest diameter must pass`);
  }
});

test('DD-6: the amended X1 fixture records its authorization and replacement', () => {
  const x1 = cases.sets.always_fabricating.cases.find((c) => c.id === 'X1');
  assert.ok(x1.amendment, 'the amendment must be recorded in the fixture itself');
  assert.match(x1.amendment, /Hudson-authorized/);
  assert.deepEqual(x1.expected.VF, 0, 'ENVELOPE-LEVEL expectation is unchanged and was never wrong');
  assert.deepEqual(x1.expectedSlotGraded.VF, 1, 'only the SLOT-GRADED expectation was amended');
  assert.equal(x1.expectedSlotGraded.FULL, 0, 'X1 remains a negative control: PTA/AUP still fail it');
  // Coverage strictly increased, not merely moved.
  const pf4 = cases.sets.prose_fabricator.cases.find((c) => c.id === 'PF4');
  assert.ok(pf4, 'the replacement fixture must exist');
  assert.equal(pf4.expected.VF, 0);
});
