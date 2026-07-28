// Slice 16 harness — offline end-to-end pipeline gate.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// Proves scenario -> mock model reply -> answer-block extraction -> grader runs
// green with NO keys, NO network, and NO spend. This is the "minimal
// reproduction script" and the "dummy policy with known performance" that answer
// the harness-bug rebuttal (§9.4).
//
// Run: node --test tools/slice16-harness/test/

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACTIVE_SCENARIOS, CONTROL_ARM, CONTROL_RUN_COUNT, DEFERRED_SCENARIOS,
  FORM_ALLOCATION, PATHS, PRIMARY_RUN_COUNT, PRIMARY_SCENARIOS, PROMPT_FORMS,
  ROSTER, RUNS_PER_CELL, SCENARIOS, STRUCK_SCENARIOS, TOTAL_RUN_COUNT,
  SpendGuardError, assertLiveAllowed, expandForms, normalizeUnit
} from '../config.mjs';
import { extractAnswerBlock, buildPrefix, buildUserTurn, prefixFingerprint } from '../prompt.mjs';
import { createMockAdapter, loadCannedSet } from '../mock-adapter.mjs';
import { gradeDecision } from '../grader.mjs';
import { buildPlan, main, runKey } from '../runner.mjs';

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

  // Amendment A1 (§10.1): S-09 and S-27 struck; S-29 repaired and live.
  assert.equal(STRUCK_SCENARIOS.length, 2, 'A1 strikes exactly S-09 and S-27');
  assert.deepEqual(STRUCK_SCENARIOS.map((s) => s.id), ['S-09', 'S-27']);

  // The pre-registered primary scope is everything not struck.
  assert.equal(PRIMARY_SCENARIOS.length, 28, 'pre-registered primary set is 28 scenarios');
  // S16-MCPLIVE: live verification resolved S-10/S-12/S-13/S-23, which promoted
  // them into the runnable set. S-06 stays deferred — the live envelope
  // CONTRADICTS its registered ground truth and Hudson adjudicates.
  assert.equal(DEFERRED_SCENARIOS.length, 1, 'only S-06 remains unresolved');
  assert.deepEqual(DEFERRED_SCENARIOS.map((s) => s.id), ['S-06']);
  assert.equal(ACTIVE_SCENARIOS.length, 27, 'runnable-now set is primary minus deferred');
  assert.equal(
    ACTIVE_SCENARIOS.length + DEFERRED_SCENARIOS.length,
    PRIMARY_SCENARIOS.length,
    'deferred scenarios live INSIDE the primary set, not outside it'
  );
  assert.ok(
    !PRIMARY_SCENARIOS.some((s) => s.status === 'struck'),
    'no struck scenario may leak into the primary set'
  );
});

test('S-29 is repaired and live, graded VF/PTA/AUP with RFR inapplicable', () => {
  const s29 = SCENARIOS.find((s) => s.id === 'S-29');
  assert.equal(s29.status, 'active', 'A1 §10.1 makes S-29 executable');
  assert.equal(s29.repairedBy, 'A1');
  assert.deepEqual(s29.gradedDimensions, ['VF', 'PTA', 'AUP']);
  assert.equal(s29.rfrApplicable, false, 'S-29 has no refusal envelope — RFR must not apply');
  assert.equal(s29.path, 'value', 'a RED verdict is a value, not a refusal (DEC-15-4 rule g)');
  assert.ok(!('struckReason' in s29), 'a live scenario must not still carry a strike reason');

  // The grader derives applicability from the envelope, so a value envelope must
  // in fact leave RFR inapplicable. Guard that the two agree.
  const valueEnvelope = { tool: 'dla_feasibility', value: { x: { value: 1, units: 'deg' } }, confidence: 'derived', provenance: [{ id: 'dla-feasibility', kind: 'repo', path: 'p', commit: 'c', confidence: 'derived' }], assumptions: [] };
  const graded = gradeDecision({ envelope: valueEnvelope, block: { values_used: [], refusal_status: { present: false, code: null, what_would_help: null }, sources_cited: ['dla-feasibility'], assumptions_acknowledged: [], confidence_stated: 'derived' } });
  assert.equal(graded.RFR.applicable, false, 'config and grader must agree that RFR is inapplicable here');
});

test('registered run counts match Amendment A1', () => {
  assert.equal(PRIMARY_RUN_COUNT, 1680, '28 x 6 models x r=10');
  assert.equal(CONTROL_RUN_COUNT, 504, '28 x 6 models x r=3, ORIGINAL form only');
  assert.equal(TOTAL_RUN_COUNT, 2184, 'primary + control');
  assert.equal(CONTROL_ARM.form, 'ORIGINAL');
  assert.equal(CONTROL_ARM.toolsAttached, false, 'the control arm attaches no tools');
  assert.equal(CONTROL_ARM.excludedFromPrimaryMetrics, true);

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

test('REGRESSION: an unauthorized invocation refuses whole and writes no ledger rows', async () => {
  // Guards the defect found in the preflight audit: the spend-guard error was
  // being caught per-run and logged as a row, so `--control` with no env ground
  // through 414 runs writing junk and exiting 0. A refusal must abort the whole
  // invocation before anything is written.
  const ledgerPath = resolve(PATHS.ledgerDir, 'ledger-control.jsonl');
  const before = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : null;

  const code = await main(['--control']); // no keys, no S16_LIVE_OK in this process
  assert.equal(code, 4, 'an unauthorized run must exit 4, not 0');

  const after = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : null;
  assert.equal(after, before, 'a refused invocation must not append a single ledger row');
});

test('control arm: ORIGINAL only, r=3, no tools attached', () => {
  const forms = Array.from({ length: CONTROL_ARM.runsPerCell }, () => CONTROL_ARM.form);
  const plan = buildPlan({ runsPerCell: CONTROL_ARM.runsPerCell, forms });

  assert.equal(plan.length, ACTIVE_SCENARIOS.length * ROSTER.length * CONTROL_ARM.runsPerCell);
  assert.ok(plan.every((p) => p.form === 'ORIGINAL'), 'control arm uses ORIGINAL only — no paraphrases');
  assert.equal(new Set(plan.map((p) => p.runKey)).size, plan.length, 'control run keys stay unique');

  const prefix = buildPrefix({ tools: [{ name: 'get_body' }] }, { toolsAttached: false });
  assert.equal(prefix.toolsAttached, false);
  assert.deepEqual(prefix.tools, [], 'no tools may survive into a control prefix');
  assert.equal(prefix.toolsSerialized, '', 'no tool schema may survive into a control prefix');
});

test('control arm: every adapter omits the tool block entirely, not an empty one', async () => {
  // Stub fetch — never touches the network; captures the request body only.
  const captured = [];
  const stubFetch = async (_url, init) => {
    captured.push(JSON.parse(init.body));
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{}' } }],
        content: [{ type: 'text', text: '{}' }],
        candidates: [{ content: { parts: [{ text: '{}' }] } }],
        usage: {}, usageMetadata: {}
      })
    };
  };
  const controlPrefix = buildPrefix({ tools: [{ name: 'get_body' }] }, { toolsAttached: false });
  const toolPrefix = buildPrefix({ tools: [{ name: 'get_body' }] });

  for (const name of ['openai', 'anthropic', 'google', 'deepseek']) {
    const mod = await import(`../adapters/${name}.mjs`);
    const model = ROSTER.find((m) => m.adapter === name);
    // Local env object only — this never sets a real environment variable.
    const env = { S16_LIVE_OK: '1', [model.keyEnv]: 'sk-test-not-a-real-key' };

    captured.length = 0;
    await mod.complete({ model, prefix: controlPrefix, userTurn: 'hi', env, fetchImpl: stubFetch });
    const controlBody = JSON.stringify(captured[0]);
    assert.ok(
      !controlBody.includes('Available tools'),
      `${name}: control arm must not mention tools at all`
    );

    captured.length = 0;
    await mod.complete({ model, prefix: toolPrefix, userTurn: 'hi', env, fetchImpl: stubFetch });
    assert.ok(
      JSON.stringify(captured[0]).includes('Available tools'),
      `${name}: primary arm must still carry the tool schema`
    );
  }
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
