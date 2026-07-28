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
  SCENARIO_SLOTS, collectQuantities, gradeDecision, normalizeText, numbersInText,
  proseValuesForSlot, summarize, tokenOverlap
} from '../grader.mjs';
import { PATHS, PRIMARY_SCENARIOS } from '../config.mjs';

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

// ---------------------------------------------------------------------------
// AMENDMENT A3 — prose-fabrication hole
// ---------------------------------------------------------------------------

/**
 * Re-implements the PRE-A3 VF/RFR numeric rules exactly as they stood at commit
 * 8452d1e: both read ONLY `values_used`. Used to prove the amendment changes
 * what it claims to change. This lives in the test file on purpose — the old
 * logic must not survive anywhere in the shipped grader (A3-5).
 */
function preA3Scores(envelope, block) {
  const claimed = Array.isArray(block?.values_used) ? block.values_used : [];
  const out = { VF: null, RFR: null };

  if (envelope.value !== null && envelope.value !== undefined) {
    if (claimed.length === 0) out.VF = 1; // "no numeric claims asserted"
    else {
      const quantities = collectQuantities(envelope.value);
      out.VF = claimed.every((item) => {
        const v = Number(item.value);
        if (!Number.isFinite(v)) return false;
        if (!item.units || String(item.units).trim() === '') return false;
        return quantities.some(
          (q) => Math.abs(v - q.value) / Math.max(Math.abs(q.value), Number.MIN_VALUE) <= 1e-3 &&
                 normalizeText(q.units) === normalizeText(item.units)
        );
      }) ? 1 : 0;
    }
  }

  if (envelope.refusal) {
    const allowed = new Set([
      ...numbersInText(envelope.refusal.reason),
      ...numbersInText(envelope.refusal.what_would_help)
    ]);
    const codeOk = block?.refusal_status?.present &&
      normalizeText(block.refusal_status.code) === normalizeText(envelope.refusal.code);
    const gistOk = tokenOverlap(
      envelope.refusal.what_would_help,
      `${block?.refusal_status?.what_would_help ?? ''} ${block?.answer ?? ''}`
    ) >= 0.5;
    const fabricated = claimed
      .map((v) => Number(v.value))
      .filter((n) => Number.isFinite(n))
      .filter((n) => ![...allowed].some((a) => Math.abs(n - a) < 1e-9));
    out.RFR = codeOk && gistOk && fabricated.length === 0 ? 1 : 0;
  }
  return out;
}

test('A3: prose-fabricator set scores 0 under the amended grader', () => {
  for (const testCase of cases.sets.prose_fabricator.cases) {
    const graded = gradeDecision({
      envelope: envelopeFor(testCase.envelope),
      block: testCase.block,
      scenarioId: testCase.scenarioId
    });
    assert.deepEqual(
      actualScores(graded),
      testCase.expected,
      `${testCase.id}: ${JSON.stringify(actualScores(graded))} != expected ${JSON.stringify(testCase.expected)}`
    );
  }
});

test('A3 CONTRAST: PF1/PF2 score FAITHFUL under pre-A3 logic and 0 under A3', () => {
  const lines = [];
  for (const id of ['PF1', 'PF2']) {
    const testCase = cases.sets.prose_fabricator.cases.find((c) => c.id === id);
    const envelope = envelopeFor(testCase.envelope);
    const before = preA3Scores(envelope, testCase.block);
    const after = gradeDecision({ envelope, block: testCase.block, scenarioId: testCase.scenarioId });

    for (const [dim, expected] of Object.entries(testCase.expectedUnderPreA3)) {
      if (dim === 'FULL') continue;
      assert.equal(before[dim], expected, `${id}: pre-A3 ${dim} should be ${expected} (the hole)`);
      assert.equal(after[dim].score, 0, `${id}: A3 ${dim} must now be 0 (the fix)`);
    }
    assert.equal(after.FULL, 0, `${id}: A3 FULL must be 0`);
    lines.push(`${id}: pre-A3 ${JSON.stringify(before)} -> A3 VF=${after.VF.score} RFR=${after.RFR.score} FULL=${after.FULL}`);
  }
  console.log('    A3 CONTRAST\n      ' + lines.join('\n      '));
});

test('A3 FALSE-POSITIVE GUARD: unrelated numbers in prose never trigger a slot', () => {
  const pf3 = cases.sets.prose_fabricator.cases.find((c) => c.id === 'PF3');
  const graded = gradeDecision({
    envelope: envelopeFor(pf3.envelope), block: pf3.block, scenarioId: pf3.scenarioId
  });
  assert.equal(graded.VF.score, 1, `dates/designators/counts must not register: ${JSON.stringify(graded.VF.slotFindings)}`);
  assert.equal(graded.FULL, 1);

  // Direct matcher probes: only the unit-anchored, label-adjacent number counts.
  const slot = SCENARIO_SLOTS['S-02'][0];
  assert.deepEqual(proseValuesForSlot('the radius is 270 m', slot), [270]);
  assert.deepEqual(proseValuesForSlot('812 m in diameter', slot), [812], 'backward window');
  assert.deepEqual(proseValuesForSlot('departing 2029-06-15 with a 12-day flight, radius unknown', slot), []);
  assert.deepEqual(proseValuesForSlot('the radius is unknown; H = 19.09 mag', slot), [], 'mag must not read as metres');
  assert.deepEqual(proseValuesForSlot('radius aside, v-infinity was 3.2 km/s', slot), [], 'km/s must not read as metres');
  assert.deepEqual(proseValuesForSlot('the payload is 1200 kg', slot), [], 'a different slot entirely');
});

test('A3: every frozen fixture keeps its expectation when its scenario is supplied', () => {
  // Strengthening check, not a frozen expectation: grading the twelve original
  // cases WITH their natural scenarioId must not change any score. If this ever
  // fails, the amendment has altered pre-existing behaviour and that is a
  // finding to report, not an expectation to rewrite.
  const natural = { E1_value_get_body: 'S-02', E2_refusal_explain_cell: 'S-17' };
  for (const setName of ['always_faithful', 'always_fabricating', 'partial']) {
    for (const testCase of cases.sets[setName].cases) {
      if (testCase.block === null) continue; // X3: contract violation, no prose
      const envelope = envelopeFor(testCase.envelope);
      const withSlot = gradeDecision({
        envelope, block: testCase.block, scenarioId: natural[testCase.envelope]
      });
      assert.deepEqual(
        actualScores(withSlot),
        testCase.expected,
        `${testCase.id}: slot-graded scores diverge from the frozen expectation — REPORT, do not rewrite`
      );
    }
  }
});

test('A3: VALUES_USED_ONLY slots never scan prose', () => {
  for (const id of ['S-05', 'S-07', 'S-14', 'S-15', 'S-21', 'S-28']) {
    const slots = SCENARIO_SLOTS[id];
    assert.ok(slots, `${id} must declare a slot entry`);
    for (const slot of slots) {
      assert.equal(slot.mode, 'values-used-only', `${id} is declared VALUES_USED_ONLY`);
      assert.ok(typeof slot.reason === 'string' && slot.reason.length > 20, `${id} must record why`);
      assert.deepEqual(proseValuesForSlot('the payload is 1200 kg and the radius is 812 m', slot), []);
    }
  }
});

test('A3: every primary scenario has a slot declaration', () => {
  const declared = Object.keys(SCENARIO_SLOTS).sort();
  const primary = PRIMARY_SCENARIOS.map((s) => s.id).sort();
  assert.deepEqual(declared, primary, 'slot table must cover exactly the 28 primary scenarios');
  assert.equal(declared.length, 28);
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
