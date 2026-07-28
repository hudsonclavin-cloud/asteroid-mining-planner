// Slice 16 harness — offline end-to-end pipeline gate.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// Proves scenario -> mock model reply -> answer-block extraction -> grader runs
// green with NO keys, NO network, and NO spend. This is the "minimal
// reproduction script" and the "dummy policy with known performance" that answer
// the harness-bug rebuttal (§9.4).
//
// Run: node --test tools/slice16-harness/test/

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACTIVE_SCENARIOS, DEFERRED_SCENARIOS, FORM_ALLOCATION, PATHS, PROMPT_FORMS,
  ROSTER, RUNS_PER_CELL, SCENARIOS, STRUCK_SCENARIOS,
  SpendGuardError, assertLiveAllowed, expandForms, normalizeUnit
} from '../config.mjs';
import { extractAnswerBlock, buildPrefix, buildUserTurn, prefixFingerprint } from '../prompt.mjs';
import { createMockAdapter, loadCannedSet } from '../mock-adapter.mjs';
import { gradeDecision } from '../grader.mjs';
import { buildPlan, runKey } from '../runner.mjs';

const graderCases = JSON.parse(readFileSync(resolve(PATHS.fixturesDir, 'grader-cases.json'), 'utf8'));

test('spend guard refuses without S16_LIVE_OK, even when a key is present', () => {
  const model = ROSTER[0];
  assert.throws(
    () => assertLiveAllowed(model, { [model.keyEnv]: 'sk-test-not-a-real-key' }),
    SpendGuardError,
    'a key alone must not authorize spending'
  );
});

test('spend guard refuses with S16_LIVE_OK but no key', () => {
  const model = ROSTER[0];
  assert.throws(
    () => assertLiveAllowed(model, { S16_LIVE_OK: '1' }),
    SpendGuardError,
    'the flag alone must not authorize spending'
  );
});

test('spend guard allows only when both conditions hold', () => {
  const model = ROSTER[0];
  assert.equal(
    assertLiveAllowed(model, { S16_LIVE_OK: '1', [model.keyEnv]: 'sk-test-not-a-real-key' }),
    true
  );
});

test('every live adapter calls the spend guard before any network I/O', async () => {
  // fetchImpl throws if reached: proves the guard fires first, in every adapter.
  const exploding = () => { throw new Error('NETWORK REACHED — spend guard did not fire'); };
  const prefix = { system: 's', toolsSerialized: '[]' };

  for (const name of ['openai', 'anthropic', 'google', 'deepseek']) {
    const mod = await import(`../adapters/${name}.mjs`);
    const model = ROSTER.find((m) => m.adapter === name);
    await assert.rejects(
      () => mod.complete({ model, prefix, userTurn: 'hello', env: {}, fetchImpl: exploding }),
      SpendGuardError,
      `${name} adapter must refuse before touching the network`
    );
  }
});

test('scenario registry is internally consistent with the locked appendix', () => {
  assert.equal(SCENARIOS.length, 30, 'the locked set is 30 scenarios');
  assert.equal(
    ACTIVE_SCENARIOS.length + DEFERRED_SCENARIOS.length + STRUCK_SCENARIOS.length,
    30,
    'every scenario carries exactly one status'
  );
  assert.equal(STRUCK_SCENARIOS.length, 3, 'S-09, S-27, S-29 are struck as premise-unsatisfiable');
  assert.deepEqual(STRUCK_SCENARIOS.map((s) => s.id), ['S-09', 'S-27', 'S-29']);

  for (const scenario of SCENARIOS) {
    for (const form of PROMPT_FORMS) {
      const text = scenario.prompts[form];
      assert.equal(typeof text, 'string', `${scenario.id}/${form} must have a prompt`);
      assert.ok(text.length > 0, `${scenario.id}/${form} must be non-empty`);
    }
    // LD-3: paraphrase length within +/-40% of ORIGINAL.
    const base = scenario.prompts.ORIGINAL.length;
    for (const form of ['P1', 'P2']) {
      const ratio = scenario.prompts[form].length / base;
      assert.ok(
        ratio >= 0.6 && ratio <= 1.4,
        `${scenario.id}/${form} length ratio ${ratio.toFixed(2)} outside +/-40%`
      );
    }
  }
});

test('form allocation is 4/3/3 and sums to r', () => {
  assert.deepEqual(FORM_ALLOCATION, { ORIGINAL: 4, P1: 3, P2: 3 });
  assert.equal(FORM_ALLOCATION.ORIGINAL + FORM_ALLOCATION.P1 + FORM_ALLOCATION.P2, RUNS_PER_CELL);

  const slots = expandForms(RUNS_PER_CELL);
  assert.equal(slots.length, RUNS_PER_CELL);
  assert.equal(slots.filter((f) => f === 'ORIGINAL').length, 4);
  assert.equal(slots.filter((f) => f === 'P1').length, 3);
  assert.equal(slots.filter((f) => f === 'P2').length, 3);
});

test('plan covers active scenarios x roster x r with unique run keys', () => {
  const plan = buildPlan();
  assert.equal(plan.length, ACTIVE_SCENARIOS.length * ROSTER.length * RUNS_PER_CELL);
  const keys = new Set(plan.map((p) => p.runKey));
  assert.equal(keys.size, plan.length, 'run keys must be unique — resumability depends on it');
  assert.equal(
    runKey({ modelId: 'm', scenarioId: 'S-01', form: 'P1', rep: 2 }),
    'm::S-01::P1::2'
  );
});

test('cacheable prefix is byte-stable regardless of tool key order', () => {
  const a = buildPrefix({ tools: [{ name: 'b', inputSchema: { x: 1, y: 2 } }, { name: 'a', description: 'first' }] });
  const b = buildPrefix({ tools: [{ name: 'a', description: 'first' }, { name: 'b', inputSchema: { y: 2, x: 1 } }] });
  assert.equal(a.toolsSerialized, b.toolsSerialized, 'serialization must not depend on key or array order');
  assert.equal(prefixFingerprint(a), prefixFingerprint(b));
});

test('scenario text never leaks into the cacheable prefix', () => {
  const prefix = buildPrefix({ tools: [] });
  for (const scenario of SCENARIOS) {
    assert.ok(
      !prefix.system.includes(scenario.prompts.ORIGINAL),
      `${scenario.id} prompt must live only in the user turn`
    );
  }
  assert.equal(buildUserTurn(SCENARIOS[0], 'ORIGINAL'), SCENARIOS[0].prompts.ORIGINAL);
});

test('answer-block extraction survives realistic reply shapes', () => {
  const fenced = 'Some prose.\n\n```json\n{"answer":"x","values_used":[],"confidence_stated":"assumed"}\n```';
  assert.equal(extractAnswerBlock(fenced).ok, true);
  assert.equal(extractAnswerBlock(fenced).block.confidence_stated, 'assumed');

  const unfenced = 'Prose then {"answer":"x","values_used":[],"confidence_stated":"derived"}';
  assert.equal(extractAnswerBlock(unfenced).ok, true);

  assert.equal(extractAnswerBlock('no block at all').ok, false);
  assert.equal(extractAnswerBlock('').ok, false);
  assert.equal(extractAnswerBlock('```json\n{not valid json}\n```').ok, false);
});

test('END-TO-END: mock replies grade faithful with no keys and no network', async () => {
  const canned = loadCannedSet('mock-faithful.json');
  const adapter = createMockAdapter(canned);

  const pairs = [
    { scenarioId: 'S-02', envelope: graderCases.envelopes.E1_value_get_body },
    { scenarioId: 'S-17', envelope: graderCases.envelopes.E2_refusal_explain_cell }
  ];

  let graded = 0;
  for (const pair of pairs) {
    const scenario = SCENARIOS.find((s) => s.id === pair.scenarioId);
    for (const form of PROMPT_FORMS) {
      const reply = await adapter.complete({ model: { id: 'mock-model' }, scenario, form });
      assert.ok(reply.text.length > 0, `${scenario.id}/${form} produced no reply`);

      const extracted = extractAnswerBlock(reply.text);
      assert.equal(extracted.ok, true, `${scenario.id}/${form}: answer block did not parse`);

      const result = gradeDecision({ envelope: pair.envelope, block: extracted.block });
      assert.equal(
        result.FULL, 1,
        `${scenario.id}/${form} should grade fully faithful; got ${JSON.stringify(result)}`
      );
      graded += 1;
    }
  }
  assert.equal(graded, 6, 'two scenarios x three prompt forms');
});

test('END-TO-END: a fabricating reply is caught by the same pipeline', () => {
  const reply = 'Falcon Heavy delivers about 1200 kg here.\n\n```json\n' +
    JSON.stringify({
      answer: 'Falcon Heavy delivers about 1200 kg.',
      values_used: [{ name: 'payload', value: 1200, units: 'kg' }],
      refusal_status: { present: false, code: null, what_would_help: null },
      sources_cited: ['NASA LSP elvperf official curve'],
      assumptions_acknowledged: [],
      confidence_stated: 'measured'
    }) + '\n```';

  const extracted = extractAnswerBlock(reply);
  assert.equal(extracted.ok, true);

  const result = gradeDecision({
    envelope: graderCases.envelopes.E2_refusal_explain_cell,
    block: extracted.block
  });
  assert.equal(result.FULL, 0, 'a confident number after a refusal must not grade faithful');
  assert.equal(result.RFR.score, 0);
  assert.equal(result.PTA.score, 0);
});

test('unit normalization accepts notation variants, not magnitude changes', () => {
  assert.equal(normalizeUnit('km²/s²'), normalizeUnit('km^2/s^2'));
  assert.equal(normalizeUnit('meters'), 'm');
  assert.equal(normalizeUnit('DEGREES'), 'deg');
  assert.notEqual(normalizeUnit('m'), normalizeUnit('km'), 'm and km must stay distinct');
});
