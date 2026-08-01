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
  ACTIVE_SCENARIOS, CONTRASTS, CONTROL_ARM, DEFERRED_SCENARIOS,
  FORM_ALLOCATION, PATHS, PRIMARY_SCENARIOS, PROMPT_FORMS,
  SCENARIOS, STRUCK_SCENARIOS,
  REGISTERED_RUNS_PER_CELL, EXECUTED_RUNS_PER_CELL,
  ACTIVE_ROSTER, EXCLUDED_MODELS, EXCLUSION_KINDS, REGISTERED_ROSTER, EVALUABLE_CONTRASTS,
  EXECUTED_PRIMARY_RUN_COUNT, EXECUTED_CONTROL_RUN_COUNT, EXECUTED_TOTAL_RUN_COUNT,
  REGISTERED_PRIMARY_RUN_COUNT, REGISTERED_CONTROL_RUN_COUNT, REGISTERED_TOTAL_RUN_COUNT,
  SAMPLING,
  SpendGuardError, assertLiveAllowed, expandForms, normalizeUnit
} from '../config.mjs';
// Namespace import so a test can assert a name is ABSENT (A9-1's removed bare r).
import * as CONFIG from '../config.mjs';
import { extractAnswerBlock, buildPrefix, buildUserTurn, prefixFingerprint } from '../prompt.mjs';
import { createMockAdapter, loadCannedSet } from '../mock-adapter.mjs';
import { gradeDecision } from '../grader.mjs';
import { buildPlan, main, runKey } from '../runner.mjs';

const graderCases = JSON.parse(readFileSync(resolve(PATHS.fixturesDir, 'grader-cases.json'), 'utf8'));

test('spend guard refuses without S16_LIVE_OK, even when a key is present', () => {
  const model = ACTIVE_ROSTER[0];
  assert.throws(
    () => assertLiveAllowed(model, { [model.keyEnv]: 'sk-test-not-a-real-key' }),
    SpendGuardError,
    'a key alone must not authorize spending'
  );
});

test('spend guard refuses with S16_LIVE_OK but no key', () => {
  const model = ACTIVE_ROSTER[0];
  assert.throws(
    () => assertLiveAllowed(model, { S16_LIVE_OK: '1' }),
    SpendGuardError,
    'the flag alone must not authorize spending'
  );
});

test('spend guard allows only when both conditions hold', () => {
  const model = ACTIVE_ROSTER[0];
  assert.equal(
    assertLiveAllowed(model, { S16_LIVE_OK: '1', [model.keyEnv]: 'sk-test-not-a-real-key' }),
    true
  );
});

test('every live adapter calls the spend guard before any network I/O', async () => {
  // fetchImpl throws if reached: proves the guard fires first, in every adapter.
  const exploding = () => { throw new Error('NETWORK REACHED — spend guard did not fire'); };
  const prefix = { system: 's', toolsAttached: true, tools: [] };

  for (const name of ['openai', 'anthropic', 'google', 'together']) {
    const mod = await import(`../adapters/${name}.mjs`);
    const model = REGISTERED_ROSTER.find((m) => m.adapter === name);
    const session = mod.startSession({ model, prefix, userTurn: 'hello', mcpTools: [] });
    await assert.rejects(
      () => mod.step(session, { env: {}, fetchImpl: exploding }),
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
  // S16-REMEDIATE (audit L5-9) deferred S-15/S-18/S-20/S-24 as mis-instantiated.
  // DD-3 then RE-ACTIVATED S-18/S-20/S-24 with a canned turn-1 (Hudson's ruling),
  // instantiating the registered pressure-after-refusal discourse position.
  // S-15 REMAINS DEFERRED: its prior scan turn is specified nowhere, so there is
  // no pinned envelope to derive a canned reply from (S-06 precedent).
  assert.equal(DEFERRED_SCENARIOS.length, 2, 'S-06 (live contradiction) + S-15 (prior turn unspecified)');
  assert.deepEqual(DEFERRED_SCENARIOS.map((s) => s.id), ['S-06', 'S-15']);
  assert.equal(ACTIVE_SCENARIOS.length, 26, 'runnable-now set is primary minus deferred');
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
  // REGISTERED counts are the pre-registered design and must NOT move when a
  // model is deferred — k=6 stays true of the registration.
  assert.equal(REGISTERED_PRIMARY_RUN_COUNT, 1680, '28 primary scenarios x k=6 registered x r=10');
  assert.equal(REGISTERED_CONTROL_RUN_COUNT, 504, '28 x k=6 x r=3, ORIGINAL only');
  assert.equal(REGISTERED_TOTAL_RUN_COUNT, 2184, 'registered primary + registered control');

  // EXECUTED counts reflect what actually runs, along all three dimensions:
  //   scenarios 26 runnable (S-06 contradiction; S-15 prior turn unspecified)
  //   models     4 active   (1 deferred, 1 refuted; Gemini RE-ACTIVATED by
  //                          S16-FINISH on Hudson's instruction)
  //   r         10 executed (A10-1 restored the registered value)
  assert.equal(EXECUTED_PRIMARY_RUN_COUNT, 1040, '26 runnable x k=4 active x r=10 executed');
  assert.equal(EXECUTED_CONTROL_RUN_COUNT, 312, '26 x k=4 x control r=3 (control r is its own constant)');
  assert.equal(EXECUTED_TOTAL_RUN_COUNT, 1352, 'executed primary + executed control');

  // The two must never be equal by accident — that would mean the split collapsed.
  assert.notEqual(REGISTERED_TOTAL_RUN_COUNT, EXECUTED_TOTAL_RUN_COUNT,
    'registered and executed totals must stay distinguishable');
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

test('form allocation is 4/3/3 and sums to the REGISTERED r', () => {
  assert.deepEqual(FORM_ALLOCATION, { ORIGINAL: 4, P1: 3, P2: 3 });
  assert.equal(FORM_ALLOCATION.ORIGINAL + FORM_ALLOCATION.P1 + FORM_ALLOCATION.P2, REGISTERED_RUNS_PER_CELL);

  const slots = expandForms(REGISTERED_RUNS_PER_CELL);
  assert.equal(slots.length, REGISTERED_RUNS_PER_CELL);
  assert.equal(slots.filter((f) => f === 'ORIGINAL').length, 4);
  assert.equal(slots.filter((f) => f === 'P1').length, 3);
  assert.equal(slots.filter((f) => f === 'P2').length, 3);
});

test('A10-4: the EXECUTED r=10 allocation is the registered 4/3/3 (LD-3)', () => {
  // Checked BEFORE spending. A silent imbalance here would corrupt the
  // paraphrase-robustness question across the entire study, and no amount of
  // post-hoc analysis recovers a form that was never run.
  const slots = expandForms(EXECUTED_RUNS_PER_CELL);
  assert.equal(slots.length, 10, 'r=10 must produce exactly 10 slots per cell');
  assert.equal(slots.filter((f) => f === 'ORIGINAL').length, 4, 'ORIGINAL x4');
  assert.equal(slots.filter((f) => f === 'P1').length, 3, 'P1 x3');
  assert.equal(slots.filter((f) => f === 'P2').length, 3, 'P2 x3');
});

test('A10-1: registered and executed r stay SEPARATELY NAMED even when equal', () => {
  assert.equal(REGISTERED_RUNS_PER_CELL, 10, 'the registered design never moved');
  assert.equal(EXECUTED_RUNS_PER_CELL, 10, 'A10-1 restored the executed value to it');

  // NOTE: these are now EQUAL, and this test deliberately does NOT assert they
  // differ. A9 asserted notEqual, which was true then but encoded the wrong
  // invariant: the discipline is that the two are separately NAMED, not that
  // they hold different values. Equality is a fact about today's design, not a
  // collapse of the distinction — the other dimensions still diverge (scenarios
  // 28/27, models 6/3), and either r may move again independently.
  assert.ok('REGISTERED_RUNS_PER_CELL' in CONFIG, 'registered r must remain exported by name');
  assert.ok('EXECUTED_RUNS_PER_CELL' in CONFIG, 'executed r must remain exported by name');

  // The bare name stays GONE: one `r` meaning both is the A2 O-1 error.
  assert.equal(CONFIG.RUNS_PER_CELL, undefined,
    'a bare RUNS_PER_CELL must not exist — it would let a consumer silently mean either r');
});

test('plan covers active scenarios x roster x r with unique run keys', () => {
  const plan = buildPlan();
  assert.equal(plan.length, ACTIVE_SCENARIOS.length * ACTIVE_ROSTER.length * EXECUTED_RUNS_PER_CELL);
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

  assert.equal(plan.length, ACTIVE_SCENARIOS.length * ACTIVE_ROSTER.length * CONTROL_ARM.runsPerCell);
  assert.ok(plan.every((p) => p.form === 'ORIGINAL'), 'control arm uses ORIGINAL only — no paraphrases');
  assert.equal(new Set(plan.map((p) => p.runKey)).size, plan.length, 'control run keys stay unique');

  const prefix = buildPrefix({ tools: [{ name: 'get_body' }] }, { toolsAttached: false });
  assert.equal(prefix.toolsAttached, false);
  assert.deepEqual(prefix.tools, [], 'no tools may survive into a control prefix');
  assert.equal(prefix.toolsSerialized, '', 'no tool schema may survive into a control prefix');
});

test('control arm: every adapter omits the `tools` parameter entirely, not an empty one', async () => {
  // A4-5: the control arm must send NO tools parameter. An empty array would
  // still tell the model tools exist, which destroys the (tools - no-tools) delta.
  const mcpTools = [{ name: 'get_body', description: 'd', inputSchema: { type: 'object', properties: {} } }];

  for (const name of ['openai', 'anthropic', 'google', 'together']) {
    const mod = await import(`../adapters/${name}.mjs`);
    const model = REGISTERED_ROSTER.find((m) => m.adapter === name);

    const control = mod.buildRequestBody(
      mod.startSession({ model, prefix: { system: 's', toolsAttached: false }, userTurn: 'hi', mcpTools })
    );
    assert.ok(!('tools' in control), `${name}: control arm must not carry a tools key at all`);

    const primary = mod.buildRequestBody(
      mod.startSession({ model, prefix: { system: 's', toolsAttached: true }, userTurn: 'hi', mcpTools })
    );
    assert.ok('tools' in primary, `${name}: primary arm must carry tools`);
    assert.ok(JSON.stringify(primary.tools).includes('get_body'), `${name}: primary tools must name the tool`);
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

test('END-TO-END: the tool-calling mock grades faithful on a real envelope shape', async () => {
  const envelope = graderCases.envelopes.E1_value_get_body;
  const canned = {
    name: 'unit',
    scripts: { 'S-02': { ANY: { toolCalls: [{ name: 'get_body', args: { designation: '99942' } }], finalMode: 'faithful', reportLeaves: ['estimatedRadius'], labels: { estimatedRadius: 'estimated radius' } } } }
  };
  const adapter = createMockAdapter(canned);
  const scenario = SCENARIOS.find((s) => s.id === 'S-02');
  const session = adapter.startSession({ model: { id: 'mock' }, prefix: { system: 's', toolsAttached: true }, userTurn: 'q', scenario, form: 'ORIGINAL' });

  const first = await adapter.step(session);
  assert.equal(first.toolCalls.length, 1, 'the mock must request a tool');
  adapter.appendToolResult(session, first.toolCalls[0], JSON.stringify({ structuredContent: envelope }));

  const second = await adapter.step(session);
  assert.equal(second.toolCalls.length, 0, 'second turn is the final answer');

  const extracted = extractAnswerBlock(second.text);
  assert.equal(extracted.ok, true);
  const graded = gradeDecision({ envelope, block: extracted.block, scenarioId: 'S-02' });
  assert.equal(graded.FULL, 1, `faithful mock must grade 1: ${JSON.stringify(graded.VF?.slotFindings)}`);
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

// ---------------------------------------------------------------------------
// AMENDMENT A6 — roster substitution DeepSeek -> Together.ai (R-A6-3)
// ---------------------------------------------------------------------------

test('A6: roster is k=6 across 4 labs, with Together in the open-weight slot', () => {
  assert.equal(REGISTERED_ROSTER.length, 6, 'k=6 is preserved by the substitution');
  assert.equal(new Set(REGISTERED_ROSTER.map((m) => m.lab)).size, 4, 'still four labs');
  assert.ok(!REGISTERED_ROSTER.some((m) => m.adapter === 'deepseek'), 'DeepSeek is dropped from the roster entirely');

  const together = REGISTERED_ROSTER.find((m) => m.adapter === 'together');
  assert.ok(together, 'Together occupies the open-weight slot');
  assert.equal(together.keyEnv, 'TOGETHER_API_KEY');
  assert.equal(together.lab, 'together-open-weight');
  assert.equal(together.certainty, 'pending', 'the model string is a sentinel, not a lead');
});

test('A6: the Together model string is a loud sentinel, never an invented id', () => {
  const together = REGISTERED_ROSTER.find((m) => m.adapter === 'together');
  assert.match(together.id, /^PENDING-/, 'must be visibly pending, not a plausible-looking fake');
  // Every contrast referencing it must reference the same sentinel, so filling
  // the string in one place cannot leave a stale id behind in the other.
  for (const c of CONTRASTS) {
    for (const side of [c.a, c.b]) {
      if (side.startsWith('PENDING-')) assert.equal(side, together.id, `${c.name} must track the roster sentinel`);
    }
  }
});

test('A6: deepseek adapter is retired-not-deleted and unreferenced by the roster', async () => {
  // The file must still load — the substitution is reversible and the record complete.
  const retired = await import('../adapters/deepseek.mjs');
  assert.equal(retired.PROVIDER, 'deepseek');
  assert.ok(!REGISTERED_ROSTER.some((m) => m.adapter === 'deepseek'), 'but nothing in the roster points at it');
});

test('A6: Together request body is structurally identical to OpenAI (same surface)', async () => {
  const openai = await import('../adapters/openai.mjs');
  const together = await import('../adapters/together.mjs');
  const mcpTools = [{ name: 'get_body', description: 'd', inputSchema: { type: 'object', properties: {} } }];
  const prefix = { system: 'SYS', toolsAttached: true };

  const mk = (mod, model) => mod.buildRequestBody(mod.startSession({ model, prefix, userTurn: 'q', mcpTools }));
  const o = mk(openai, { id: 'M', keyEnv: 'OPENAI_API_KEY' });
  const t = mk(together, { id: 'M', keyEnv: 'TOGETHER_API_KEY' });

  // A7-1: the ONE intended body difference is the max-tokens field name —
  // OpenAI's newer families require max_completion_tokens, Together's compatible
  // surface is documented against max_tokens. Everything else stays identical.
  assert.equal(o.max_completion_tokens, SAMPLING.maxOutputTokens, 'openai uses max_completion_tokens');
  assert.equal(t.max_tokens, SAMPLING.maxOutputTokens, 'together uses max_tokens');
  const strip = (b) => { const c = { ...b }; delete c.max_tokens; delete c.max_completion_tokens; return c; };
  assert.deepEqual(strip(t), strip(o), 'apart from the max-tokens field name, the bodies are identical');
  assert.notEqual(together.ENDPOINT, openai.ENDPOINT, 'the endpoint is the one intended difference');
  assert.match(together.ENDPOINT, /api\.together\.xyz/);
});

// ---------------------------------------------------------------------------
// ROSTER STATUS CONVENTION — S16-ROSTER-STATUS-2026-07-30-B
// ---------------------------------------------------------------------------

test('roster models carry a status, mirroring the scenario convention', () => {
  for (const m of REGISTERED_ROSTER) {
    assert.ok(['active', 'deferred', 'refuted', 'blocked'].includes(m.status), `${m.id} must declare a status`);
  }
  assert.equal(REGISTERED_ROSTER.length, 6, 'registered design is k=6 — unchanged by any exclusion');
  assert.equal(ACTIVE_ROSTER.length, 4, 'four models run right now (S16-FINISH re-activated Gemini)');
  assert.equal(EXCLUDED_MODELS.length, 2, 'Together (cost) and gpt-5.5-mini (refuted)');
  assert.equal(
    ACTIVE_ROSTER.length + EXCLUDED_MODELS.length,
    REGISTERED_ROSTER.length,
    'every registered model is either active or excluded — none may vanish'
  );
});

test('A9-3: exclusion reasons stay DISTINGUISHABLE, never collapsed into one label', () => {
  // The point of A9-3: each exclusion needs a DIFFERENT action to reverse, so
  // one label for all of them teaches a reader the wrong thing. Gemini proved
  // the mechanism works — it was 'blocked' (quota; A9-3 predicted "no code
  // change") and S16-FINISH re-activated it with exactly no code change. The
  // 'blocked' KIND stays defined so it can be used again if quota returns.
  const byId = (id) => REGISTERED_ROSTER.find((m) => m.id === id);

  const together = byId('PENDING-SET-TOGETHER-MODEL-STRING');
  assert.equal(together.status, 'deferred', 'Together is a COST CHOICE');
  assert.match(together.exclusionReason, /cost/i);

  const mini = byId('gpt-5.5-mini');
  assert.equal(mini.status, 'refuted', 'gpt-5.5-mini DOES NOT EXIST');
  assert.match(mini.exclusionReason, /404|model_not_found/);

  // Every kind the convention defines stays available and described.
  for (const kind of ['deferred', 'refuted', 'blocked']) {
    assert.ok(EXCLUSION_KINDS[kind], `the '${kind}' exclusion kind must stay defined`);
  }

  // No two excluded models share a kind, and each says why.
  const kinds = new Set(EXCLUDED_MODELS.map((m) => m.status));
  assert.equal(kinds.size, EXCLUDED_MODELS.length, 'each exclusion has its own kind');
  for (const m of EXCLUDED_MODELS) {
    assert.ok(typeof m.exclusionReason === 'string' && m.exclusionReason.length > 40,
      `${m.id}: an exclusion must carry a recorded reason`);
  }

  // A re-activation is as much a part of the record as the exclusion was.
  const gemini = byId('gemini-3.1-pro-preview');
  assert.equal(gemini.status, 'active');
  assert.match(gemini.reactivatedBy, /S16-FINISH/);
});

test('Together is PRESENT-but-EXCLUDED, never deleted', () => {
  // A future deletion must fail here rather than quietly shrink the registration.
  const together = REGISTERED_ROSTER.find((m) => m.adapter === 'together');
  assert.ok(together, 'the Together slot must remain in the REGISTERED roster');
  assert.equal(together.status, 'deferred');
  assert.ok(!ACTIVE_ROSTER.some((m) => m.adapter === 'together'), 'but it does not run');
  assert.ok(EXCLUDED_MODELS.some((m) => m.adapter === 'together'));
});

test('excluded models never enter a run plan', () => {
  const plan = buildPlan();
  assert.equal(plan.length, ACTIVE_SCENARIOS.length * ACTIVE_ROSTER.length * EXECUTED_RUNS_PER_CELL);
  assert.ok(
    !plan.some((p) => EXCLUDED_MODELS.some((m) => m.id === p.modelId)),
    'no excluded model may appear in a plan — for ANY of the three reasons'
  );
});

test('a contrast naming a deferred model is disclosed as not evaluable', () => {
  assert.equal(CONTRASTS.length, 3, 'all three registered contrasts remain declared');
  // A7: with BOTH gpt-5.5-mini and Together deferred, only the Anthropic
  // frontier-vs-small contrast survives. Recorded, not silently dropped.
  assert.equal(EVALUABLE_CONTRASTS.length, 1, 'only Anthropic frontier-vs-small is computable');
  assert.deepEqual(EVALUABLE_CONTRASTS.map((c) => c.name), ['anthropic-frontier-vs-small']);
  for (const name of ['google-vs-together-open-weight', 'openai-frontier-vs-small']) {
    assert.ok(CONTRASTS.some((c) => c.name === name), `${name} stays DECLARED`);
    assert.ok(!EVALUABLE_CONTRASTS.some((c) => c.name === name), `${name} is excluded from evaluable`);
  }
});

test('every roster adapter resolves to a module', async () => {
  // Guards the A6 gap this session found: together.mjs existed but was never
  // registered in ADAPTER_MODULES, so it was unreachable by the runner.
  for (const m of REGISTERED_ROSTER) {
    const mod = await import(`../adapters/${m.adapter}.mjs`);
    assert.equal(typeof mod.startSession, 'function', `${m.adapter} must expose the adapter interface`);
  }
});

// ---------------------------------------------------------------------------
// AMENDMENT A7 — pilot first-contact fixes
// ---------------------------------------------------------------------------

test('A7-1: OpenAI sends max_completion_tokens, never max_tokens', async () => {
  const openai = await import('../adapters/openai.mjs');
  const model = REGISTERED_ROSTER.find((m) => m.id === 'gpt-5.5');
  const body = openai.buildRequestBody(openai.startSession({
    model, prefix: { system: 's', toolsAttached: true }, userTurn: 'q', mcpTools: []
  }));
  assert.ok('max_completion_tokens' in body, 'the pilot 400 was: max_tokens is not supported with this model');
  assert.ok(!('max_tokens' in body), 'max_tokens must not be sent to this family');
  assert.equal(body.max_completion_tokens, SAMPLING.maxOutputTokens);
});

test('A8-1: NO adapter sends temperature OR top_p — provider defaults, uniformly', async () => {
  const mcpTools = [{ name: 'get_body', description: 'd', inputSchema: { type: 'object', properties: {} } }];
  for (const name of ['openai', 'anthropic', 'google', 'together']) {
    const mod = await import(`../adapters/${name}.mjs`);
    const model = REGISTERED_ROSTER.find((m) => m.adapter === name);
    const body = mod.buildRequestBody(mod.startSession({
      model, prefix: { system: 's', toolsAttached: true }, userTurn: 'q', mcpTools
    }));
    const flat = JSON.stringify(body);
    // Substring match, not key match: `temperature` must not appear ANYWHERE,
    // including nested under Google's generationConfig.
    assert.ok(!flat.includes('temperature'), `${name} must not send temperature (A8-1: gpt-5.5 rejects 0)`);
    assert.ok(!flat.includes('top_p'), `${name} must not send top_p (A7-3)`);
    assert.ok(!flat.includes('topP'), `${name} must not send topP (A7-3)`);
  }
});

test('A8-1: retired sampling values stay VISIBLE in config even though unsent', () => {
  // The registered values are part of the pre-registration record. Deleting them
  // would erase the amendment chain; the test pins "kept but unsent".
  assert.equal(SAMPLING.temperature, 0, 'registered temperature must remain in the record');
  assert.equal(SAMPLING.top_p, 1.0, 'registered top_p must remain in the record');
});

test('A8-3: every roster certainty is backed by evidence of the right kind', () => {
  for (const model of REGISTERED_ROSTER) {
    if (model.certainty === 'confirmed') {
      assert.ok(model.confirmedBy, `${model.id}: certainty 'confirmed' requires confirmedBy`);
      // The A7 inference error: a body-validation 400 was read as proof the model
      // string resolved, when such a 400 can be raised BEFORE model resolution.
      // Only a successful call or a metadata listing confirms a string outright.
      const sound = /successful|ListModels|\/v1\/models|listing/i.test(model.confirmedBy);
      assert.ok(sound, `${model.id}: confirmedBy must cite a successful call or a metadata listing, not a bare 400 — got "${model.confirmedBy}"`);
    }
    if (model.certainty === 'refuted' || model.certainty === 'pending') {
      // A9-3 widened this from `=== 'deferred'`: a non-confirmed string must not
      // be ACTIVE, but which non-active status it carries now depends on WHY.
      assert.notEqual(model.status, 'active', `${model.id}: non-confirmed strings must not be active`);
      assert.ok(model.exclusionReason, `${model.id}: excluded entries must say why`);
    }
  }
});

test('A8-2: the refuted gemini string is gone and the resolved one is in place', () => {
  const ids = REGISTERED_ROSTER.map((m) => m.id);
  assert.ok(!ids.includes('gemini-3.1-pro'), 'gemini-3.1-pro was REFUTED by a 404 — must not remain');
  assert.ok(ids.includes('gemini-3.1-pro-preview'), 'the ListModels-resolved string must be in the roster');
  // The tool-tuned variant would confound the construct being measured.
  assert.ok(!ids.some((id) => id.includes('customtools')), 'the tool-optimized variant must not be used — it confounds tool-evidence faithfulness');
});

test('A7-3: seed is unchanged — still sent where the provider supports it', async () => {
  const openai = await import('../adapters/openai.mjs');
  const model = REGISTERED_ROSTER.find((m) => m.id === 'gpt-5.5');
  const body = openai.buildRequestBody(openai.startSession({
    model, prefix: { system: 's', toolsAttached: true }, userTurn: 'q', mcpTools: []
  }));
  assert.equal(body.seed, SAMPLING.seed, 'seed remains on the surfaces that accept it');
});

test('A7-4: Google emits no non-string enum member', async () => {
  const { connectMcp } = await import('../mcp-client.mjs');
  const { toGoogleTools } = await import('../tool-schema.mjs');
  const mcp = await connectMcp();
  const list = await mcp.listTools();
  mcp.close();

  const { tools, dropped } = toGoogleTools(list.tools);
  // The live schemas DO contain numeric enums (M: {type:number, enum:[0,1,2]}),
  // which is what produced the pilot's 400.
  const hadNumeric = list.tools.some((t) =>
    Object.values(t.inputSchema?.properties ?? {}).some((v) => Array.isArray(v.enum) && !v.enum.every((x) => typeof x === 'string')));
  assert.ok(hadNumeric, 'guard the guard: the source schemas must still contain a numeric enum');

  const walk = (node, hit = []) => {
    if (!node || typeof node !== 'object') return hit;
    if (Array.isArray(node.enum)) for (const v of node.enum) if (typeof v !== 'string') hit.push(v);
    for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v, hit);
    return hit;
  };
  assert.deepEqual(walk(tools), [], 'no non-string enum member may reach Google');
  assert.ok(dropped.some((d) => d.includes('enum(non-string')), 'and the drop is RECORDED, not silent');

  // String enums must survive untouched — the fix is targeted, not a blanket strip.
  const flat = JSON.stringify(tools);
  assert.ok(flat.includes('low_departure_c3'), 'string enums are preserved');
  assert.ok(flat.includes('cape-canaveral'), 'string enums are preserved');
});

// SUPERSEDED BY A8-3 — the original A7-5 test asserted, for four strings:
//     assert.equal(by(id).certainty, 'confirmed',
//                  `${id} returned a 400 in the pilot — the string resolved`)
// That message IS the inference error. A 400 can be raised during request-body
// validation, BEFORE the model is resolved, so it proves nothing about the
// string. Round 2 demonstrated it: gemini-3.1-pro, "confirmed" by exactly this
// reasoning, 404'd. The bad inference had been pinned by a passing test, which
// is precisely why it read as verified — a green suite certifying a guess.
// The replacement below asserts the EVIDENCE KIND, not the status code.
test('A8-3 (supersedes A7-5): roster certainty rests on sound evidence only', () => {
  const by = (id) => REGISTERED_ROSTER.find((m) => m.id === id);

  // Confirmed by a SUCCESSFUL CALL — the strongest evidence, and the only kind
  // that also proves the transport contract works end to end. A9 added gpt-5.5
  // here: round 3 completed 4 of its runs, so it is no longer listing-only.
  for (const id of ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'gpt-5.5']) {
    assert.equal(by(id).certainty, 'confirmed');
    assert.match(by(id).confirmedBy, /SUCCESSFUL/, `${id} completed real pilot runs`);
  }

  // Confirmed by a METADATA LISTING only — proves the string resolves, nothing
  // more. Gemini is the last entry in this weaker category, and it must still
  // disclose that no call has ever succeeded.
  const gemini = by('gemini-3.1-pro-preview');
  assert.equal(gemini.certainty, 'confirmed');
  assert.match(gemini.confirmedBy, /ListModels|listing/i, 'gemini rests on a listing');
  assert.match(gemini.confirmedBy, /no successful call/i, 'and must not overclaim');

  const mini = by('gpt-5.5-mini');
  assert.equal(mini.certainty, 'refuted', 'gpt-5.5-mini 404d — the string does not exist');
  assert.equal(mini.status, 'refuted', 'and A9-3 labels the slot by WHY, not a generic deferral');
  assert.match(mini.exclusionReason, /404|model_not_found/, 'with the pilot evidence recorded');
  assert.ok(!/^gpt-5\.5-(mini|nano)$/.test(mini.id) === false, 'the refuted id is preserved, not overwritten');
});
