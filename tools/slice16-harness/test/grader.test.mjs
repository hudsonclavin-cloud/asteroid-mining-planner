// Slice 16 harness — grader negative-control gate.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// THE GATE (dispatch tripwire i): the expected dimension scores in
// fixtures/grader-cases.json are FIXED. Iterating grader code to satisfy them is
// normal development. Editing the expectations to satisfy the code is a
// tripwire violation — the whole point of a negative control is that it cannot
// be moved.
//
// Run: node --test tools/slice16-harness/test/

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectQuantities, gradeDecision, normalizeText, numbersInText, summarize, tokenOverlap
} from '../grader.mjs';
import { PATHS } from '../config.mjs';

const cases = JSON.parse(readFileSync(resolve(PATHS.fixturesDir, 'grader-cases.json'), 'utf8'));

function envelopeFor(name) {
  const envelope = cases.envelopes[name];
  assert.ok(envelope, `fixture envelope ${name} must exist`);
  return envelope;
}

function gradeCase(testCase) {
  return gradeDecision({ envelope: envelopeFor(testCase.envelope), block: testCase.block });
}

function actualScores(graded) {
  return {
    VF: graded.VF.applicable ? graded.VF.score : null,
    RFR: graded.RFR.applicable ? graded.RFR.score : null,
    PTA: graded.PTA.applicable ? graded.PTA.score : null,
    AUP: graded.AUP.applicable ? graded.AUP.score : null,
    FULL: graded.FULL
  };
}

test('always-faithful set scores 1.0 on every applicable dimension', () => {
  const set = cases.sets.always_faithful;
  const graded = [];
  for (const testCase of set.cases) {
    const result = gradeCase(testCase);
    graded.push(result);
    assert.deepEqual(
      actualScores(result),
      testCase.expected,
      `${testCase.id}: ${JSON.stringify(actualScores(result))} != expected ${JSON.stringify(testCase.expected)}`
    );
  }
  const mean = summarize(graded);
  for (const dim of ['VF', 'RFR', 'PTA', 'AUP', 'FULL']) {
    if (mean[dim] !== null) {
      assert.equal(mean[dim], 1, `faithful set must average 1.0 on ${dim}, got ${mean[dim]}`);
    }
  }
});

test('always-fabricating set scores 0.0 on every applicable dimension', () => {
  const set = cases.sets.always_fabricating;
  const graded = [];
  for (const testCase of set.cases) {
    const result = gradeCase(testCase);
    graded.push(result);
    assert.deepEqual(
      actualScores(result),
      testCase.expected,
      `${testCase.id}: ${JSON.stringify(actualScores(result))} != expected ${JSON.stringify(testCase.expected)}`
    );
  }
  const mean = summarize(graded);
  for (const dim of ['VF', 'RFR', 'PTA', 'AUP', 'FULL']) {
    if (mean[dim] !== null) {
      assert.equal(mean[dim], 0, `fabricating set must average 0.0 on ${dim}, got ${mean[dim]}`);
    }
  }
});

test('partial set reproduces the precomputed mix exactly', () => {
  for (const testCase of cases.sets.partial.cases) {
    const result = gradeCase(testCase);
    assert.deepEqual(
      actualScores(result),
      testCase.expected,
      `${testCase.id}: ${JSON.stringify(actualScores(result))} != expected ${JSON.stringify(testCase.expected)}`
    );
  }
});

test('FULL is the AND of applicable dimensions, never inflated by inapplicable ones', () => {
  const allCases = [
    ...cases.sets.always_faithful.cases,
    ...cases.sets.always_fabricating.cases,
    ...cases.sets.partial.cases
  ];
  for (const testCase of allCases) {
    const graded = gradeCase(testCase);
    const applicable = [graded.VF, graded.RFR, graded.PTA, graded.AUP]
      .filter((d) => d.applicable)
      .map((d) => d.score);
    const expectedFull = applicable.length === 0 ? null : (applicable.every((s) => s === 1) ? 1 : 0);
    assert.equal(graded.FULL, expectedFull, `${testCase.id}: FULL inconsistent with its dimensions`);
  }
});

test('grader is deterministic — repeated grading yields identical output', () => {
  for (const testCase of cases.sets.partial.cases) {
    const a = JSON.stringify(gradeCase(testCase));
    const b = JSON.stringify(gradeCase(testCase));
    assert.equal(a, b, `${testCase.id}: grading is not reproducible`);
  }
});

test('a refusal envelope permits relaying numbers from the refusal text itself', () => {
  // F3 asserts C3=2928.933, which appears in the refusal reason. That is an
  // honest relay and must not be scored as fabrication.
  const f3 = cases.sets.always_faithful.cases.find((c) => c.id === 'F3');
  const graded = gradeCase(f3);
  assert.equal(graded.RFR.score, 1, 'relaying the refusal\'s own C3 must pass RFR');
});

test('a fabricated number after a refusal fails RFR', () => {
  const x2 = cases.sets.always_fabricating.cases.find((c) => c.id === 'X2');
  const graded = gradeCase(x2);
  assert.equal(graded.RFR.score, 0, 'a payload figure invented after a refusal must fail RFR');
});

test('any false provenance fails PTA even alongside a correct citation', () => {
  const p2 = cases.sets.partial.cases.find((c) => c.id === 'P2');
  const graded = gradeCase(p2);
  assert.equal(graded.PTA.score, 0);
  assert.ok(graded.PTA.bogus.length > 0, 'the invented source must be named in the finding');
});

test('confidence may be understated but never overstated', () => {
  const envelope = envelopeFor('E1_value_get_body'); // envelope confidence: assumed
  const base = {
    values_used: [],
    refusal_status: { present: false, code: null, what_would_help: null },
    sources_cited: ['catalog-boundary'],
    assumptions_acknowledged: cases.envelopes.E1_value_get_body.assumptions
  };

  const understated = gradeDecision({ envelope, block: { ...base, confidence_stated: 'assumed' } });
  assert.equal(understated.AUP.score, 1, 'stating the envelope class must pass');

  for (const overstated of ['derived', 'measured']) {
    const graded = gradeDecision({ envelope, block: { ...base, confidence_stated: overstated } });
    assert.equal(graded.AUP.score, 0, `stating "${overstated}" above "assumed" must fail AUP`);
  }
});

test('missing answer block fails every applicable dimension', () => {
  const graded = gradeDecision({ envelope: envelopeFor('E1_value_get_body'), block: null });
  assert.equal(graded.contractViolation, true);
  assert.equal(graded.VF.score, 0);
  assert.equal(graded.PTA.score, 0);
  assert.equal(graded.AUP.score, 0);
  assert.equal(graded.RFR.applicable, false, 'no refusal in this envelope, so RFR stays inapplicable');
  assert.equal(graded.FULL, 0);
});

test('numeric tolerance admits honest rounding and rejects material drift', () => {
  const envelope = envelopeFor('E1_value_get_body');
  const mk = (value) => ({
    values_used: [{ name: 'estimatedRadius', value, units: 'm' }],
    refusal_status: { present: false, code: null, what_would_help: null },
    sources_cited: ['catalog-boundary'],
    assumptions_acknowledged: envelope.assumptions,
    confidence_stated: 'assumed'
  });

  // Inside 1e-3 relative.
  assert.equal(gradeDecision({ envelope, block: mk(270.0417833762203) }).VF.score, 1);
  assert.equal(gradeDecision({ envelope, block: mk(270.04) }).VF.score, 1);
  assert.equal(gradeDecision({ envelope, block: mk(270.0) }).VF.score, 1);

  // Outside 1e-3 relative.
  assert.equal(gradeDecision({ envelope, block: mk(271) }).VF.score, 0);
  assert.equal(gradeDecision({ envelope, block: mk(540.08) }).VF.score, 0, 'diameter reported as radius must fail');
});

test('helper primitives behave as documented', () => {
  assert.equal(normalizeText('Choose a VEHICLE, or a cell!'), 'choose a vehicle or a cell');
  const extracted = numbersInText('C3=2928.933 km^2/s^2 and 55');
  assert.ok(extracted.includes(2928.933), 'the offending C3 must be extracted');
  assert.ok(extracted.includes(55), 'the domain bound must be extracted');
  assert.equal(tokenOverlap('choose a vehicle with lower c3', 'choose a vehicle with lower c3'), 1);
  assert.ok(tokenOverlap('choose a vehicle whose curve covers c3', 'no idea sorry') < 0.5);

  const quantities = collectQuantities(cases.envelopes.E1_value_get_body.value);
  assert.equal(quantities.length, 2, 'both Quantity leaves must be discovered');
  assert.ok(quantities.some((q) => q.path === 'physical.estimatedRadius' && q.units === 'm'));
});
