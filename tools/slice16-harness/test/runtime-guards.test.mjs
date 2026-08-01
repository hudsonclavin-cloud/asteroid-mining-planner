// Slice 16 harness — runtime guard tests.
// MARKER: S16-REMEDIATE-2026-08-01-A
//
// Covers the audit's Phase-1 safety findings:
//   L5-14  strict CLI parsing (a typo must never start a paid run)
//   L5-1   registered same-cause >25% halt
//   L5-3   spend-guard accumulator with a hard ceiling
//   L2-7   coherent malformed-ledger / resume policy
//
// None of these tests touches the network, a ledger under runs/, or any
// existing fixture expectation. Synthetic rows only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  main, parseCliMode, UsageError,
  errorCauseKey, sameCauseHalt, SAME_CAUSE_HALT_THRESHOLD,
  spendHalt, priorLedgerSpendUsd,
  loadLedger, parseLedgerFile, LedgerCorruptError,
  executeRun, harnessProvenance, serverBuildProvenance
} from '../runner.mjs';
import { definitiveRows, gradeLedger, LedgerRefusedError } from '../grade.mjs';
import { ACTIVE_ROSTER, BUDGET, PRICES_USD_PER_MTOK, estimateRowCostUsd } from '../config.mjs';

// ---------------------------------------------------------------------------
// L5-14 — strict CLI
// ---------------------------------------------------------------------------

test('L5-14: a misspelled flag ERRORS OUT instead of falling through to full', async () => {
  // The audit's exact scenario: credentials armed, operator types --ful.
  // The old parser resolved this to LIVE FULL MODE. It must now be exit 2
  // before any side effect.
  assert.throws(() => parseCliMode(['--ful']), UsageError);
  const code = await main(['--ful']);
  assert.equal(code, 2, 'unknown flag must exit 2, never run');
});

test('L5-14: --help is safe and never selects a live mode', async () => {
  assert.deepEqual(parseCliMode(['--help']), { mode: 'help', fixture: null });
  const code = await main(['--help']);
  assert.equal(code, 0, 'help prints usage and exits cleanly');
});

test('L5-14: contradictory modes are rejected, not resolved by precedence', async () => {
  assert.throws(() => parseCliMode(['--preflight', '--full']), UsageError);
  const code = await main(['--preflight', '--full']);
  assert.equal(code, 2, 'combined modes must exit 2 — the old parser ran preflight and hid the contradiction');
});

test('L5-14: unknown positional arguments are rejected', async () => {
  assert.throws(() => parseCliMode(['fullrun']), UsageError);
  assert.equal(await main(['banana']), 2);
});

test('L5-14: --mock still requires its fixture argument', () => {
  assert.throws(() => parseCliMode(['--mock']), UsageError);
  assert.throws(() => parseCliMode(['--mock', '--full']), UsageError, 'a flag is not a fixture');
  assert.deepEqual(parseCliMode(['--mock', 'mock-toolcalls.json']), { mode: 'mock', fixture: 'mock-toolcalls.json' });
});

test('L5-14: no arguments still defaults to preflight (the safe mode)', () => {
  assert.deepEqual(parseCliMode([]), { mode: 'preflight', fixture: null });
});

test('L5-14: every documented mode parses to itself and nothing else', () => {
  for (const mode of ['preflight', 'pilot', 'full', 'control']) {
    assert.deepEqual(parseCliMode([`--${mode}`]), { mode, fixture: null });
  }
});

// ---------------------------------------------------------------------------
// L5-1 — registered same-cause halt (>25% of attempted runs, one cause)
// ---------------------------------------------------------------------------

test('L5-1: the halted run\'s actual crossing point triggers the halt', () => {
  // The audit measured the real run: threshold crossed at row 147 with 37
  // same-cause failures (25.17%). The harness then allowed 128 more attempts.
  // This pins the exact registered predicate at the exact observed crossing.
  const causes = new Map([['Error: openai 429:', 37]]);
  const halt = sameCauseHalt(causes, 147);
  assert.ok(halt, '37/147 = 25.17% > 25% must halt');
  assert.equal(halt.count, 37);
  assert.equal(halt.cause, 'Error: openai 429:');
});

test('L5-1: at or below the registered threshold there is no halt', () => {
  // 36/147 = 24.49% — under. And exactly 25% is NOT >25%: the registered text
  // says "more than", so the boundary itself does not halt.
  assert.equal(sameCauseHalt(new Map([['Error: openai 429:', 36]]), 147), null);
  assert.equal(sameCauseHalt(new Map([['x', 1]]), 4), null, '1/4 = exactly 25% is not >25%');
});

test('L5-1: the literal condition is eager at small n — and that is disclosed, not a bug', () => {
  // The registered text has no minimum-attempts floor, so none was added.
  // 1/1 = 100% > 25% halts. Fail-safe: a false halt is resumable and free.
  const halt = sameCauseHalt(new Map([['Error: anthropic 500:', 1]]), 1);
  assert.ok(halt);
});

test('L5-1: failures spread across DIFFERENT causes do not halt', () => {
  // 3 causes x 10 failures in 60 attempts = 50% total failure rate but only
  // 16.7% per cause — the registered condition is per-cause, so no halt.
  const causes = new Map([['a', 10], ['b', 10], ['c', 10]]);
  assert.equal(sameCauseHalt(causes, 60), null);
});

test('L5-1: cause grouping strips the provider JSON body, keeping the status head', () => {
  const a = errorCauseKey('Error: openai 429: { "error": { "message": "You have no credits remaining. Add credits..." } }');
  const b = errorCauseKey('Error: openai 429: { "error": { "message": "Rate limit reached for gpt-5.5 on tokens" } }');
  const c = errorCauseKey('Error: anthropic 429: { "error": {} }');
  assert.equal(a, 'Error: openai 429:');
  assert.equal(a, b, 'same provider+status groups together regardless of body detail');
  assert.notEqual(a, c, 'different providers never group');
});

test('L5-1: the threshold constant is the registered 25%', () => {
  assert.equal(SAME_CAUSE_HALT_THRESHOLD, 0.25);
});

// ---------------------------------------------------------------------------
// L5-3 — spend guard (synthetic usage only; no network, no live pricing calls)
// ---------------------------------------------------------------------------

test('L5-3: every ACTIVE model has a price entry — the guard cannot silently undercount the roster', () => {
  for (const m of ACTIVE_ROSTER) {
    assert.ok(PRICES_USD_PER_MTOK[m.id], `${m.id} must be priced for the spend guard`);
  }
});

test('L5-3: a row is priced from provider-reported usage at the flagged Q3 prices', () => {
  // gpt-5.5 at $5/M in, $30/M out: 1M input + 100k output = $5 + $3 = $8.
  const { usd, unpriced } = estimateRowCostUsd({
    model: 'gpt-5.5',
    usage: { reported: true, inputTokens: 1_000_000, outputTokens: 100_000 }
  });
  assert.equal(unpriced, false);
  assert.ok(Math.abs(usd - 8) < 1e-9, `expected $8, got $${usd}`);
});

test('L5-3: rows without reported usage cost 0; unknown priced models are flagged, not ignored', () => {
  assert.deepEqual(estimateRowCostUsd({ model: 'gpt-5.5', usage: { reported: false } }), { usd: 0, unpriced: false });
  assert.deepEqual(estimateRowCostUsd({ model: 'mock:x', usage: { reported: false } }), { usd: 0, unpriced: false });
  const unknown = estimateRowCostUsd({ model: 'not-in-table', usage: { reported: true, inputTokens: 10, outputTokens: 10 } });
  assert.equal(unknown.usd, 0);
  assert.equal(unknown.unpriced, true, 'reported usage with no price entry must be flagged loudly');
});

test('L5-3: ACCRUED crossing the ceiling halts', () => {
  const halt = spendHalt({ priorUsd: 0, thisRunUsd: 201, attempted: 100, planTotal: 810, ceilingUsd: 200 });
  assert.equal(halt?.kind, 'accrued');
});

test('L5-3: PROJECTED crossing the ceiling halts while most budget is unspent', () => {
  // The halted run's actual class of surprise: per-run cost 2.94x projection.
  // $30 spent over 100 of 810 runs projects to $243 > $200 — halt NOW, with
  // $170 still unspent, instead of discovering it at exhaustion.
  const halt = spendHalt({ priorUsd: 0, thisRunUsd: 30, attempted: 100, planTotal: 810, ceilingUsd: 200 });
  assert.equal(halt?.kind, 'projected');
  assert.ok(Math.abs(halt.projectedUsd - 243) < 1e-9);
});

test('L5-3: within budget on both measures, no halt', () => {
  assert.equal(spendHalt({ priorUsd: 0, thisRunUsd: 20, attempted: 100, planTotal: 810, ceilingUsd: 200 }), null,
    '$20/100 projects to $162 < $200');
});

test('L5-3: a resumed run counts prior ledger spend toward the ceiling', () => {
  // $190 already in the ledger + $11 this run = $201 accrued > $200.
  const halt = spendHalt({ priorUsd: 190, thisRunUsd: 11, attempted: 5, planTotal: 500, ceilingUsd: 200 });
  assert.equal(halt?.kind, 'accrued');
  // And projection includes the prior as a constant, not scaled:
  // prior $100 + ($1/run x 500 planned) = $600 > $200.
  const proj = spendHalt({ priorUsd: 100, thisRunUsd: 5, attempted: 5, planTotal: 500, ceilingUsd: 200 });
  assert.equal(proj?.kind, 'projected');
});

test('L5-3: priorLedgerSpendUsd prices an existing ledger file (synthetic)', () => {
  const dir = mkdtempSync(join(tmpdir(), 's16-spend-'));
  const p = join(dir, 'ledger.jsonl');
  writeFileSync(p, [
    JSON.stringify({ runKey: 'a', model: 'gpt-5.5', usage: { reported: true, inputTokens: 1_000_000, outputTokens: 0 } }),
    JSON.stringify({ runKey: 'b', model: 'claude-haiku-4-5-20251001', usage: { reported: true, inputTokens: 0, outputTokens: 1_000_000 } }),
    JSON.stringify({ runKey: 'c', model: 'gpt-5.5', error: 'x', usage: { reported: false } })
  ].join('\n') + '\n');
  try {
    // $5 (1M in at gpt-5.5) + $5 (1M out at haiku) + $0 (no reported usage) = $10
    assert.ok(Math.abs(priorLedgerSpendUsd(p) - 10) < 1e-9);
    assert.equal(priorLedgerSpendUsd(join(dir, 'absent.jsonl')), 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('L5-3: the configured ceiling default is the registered $200', () => {
  assert.equal(BUDGET.ceilingUsd, 200);
  assert.equal(spendHalt({ priorUsd: 0, thisRunUsd: 199, attempted: 10, planTotal: 10 }), null,
    'defaults to BUDGET.ceilingUsd when no ceiling is passed');
});

// ---------------------------------------------------------------------------
// L2-7 — one coherent ledger policy (synthetic files; runs/ is never touched)
// ---------------------------------------------------------------------------

function withLedger(lines, fn) {
  const dir = mkdtempSync(join(tmpdir(), 's16-ledger-'));
  const p = join(dir, 'ledger.jsonl');
  writeFileSync(p, lines.join('\n') + '\n');
  try { return fn(p); } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('L2-7 rule 3: errored rows do NOT count as done — the recovery trap is closed', () => {
  withLedger([
    JSON.stringify({ runKey: 'ok-key', error: null }),
    JSON.stringify({ runKey: 'err-key', error: 'Error: openai 429: no credits' })
  ], (p) => {
    const done = loadLedger(p);
    assert.ok(done.has('ok-key'), 'a successful run is done');
    assert.ok(!done.has('err-key'), 'a failed attempt is NOT done — it must be retried on resume');
  });
});

test('L2-7 rule 3: a key succeeds if ANY attempt succeeded (retry-after-error)', () => {
  withLedger([
    JSON.stringify({ runKey: 'k', error: 'first attempt failed' }),
    JSON.stringify({ runKey: 'k', error: null })
  ], (p) => {
    assert.ok(loadLedger(p).has('k'));
  });
});

test('L2-7 rule 1: a malformed MIDDLE line is FATAL, never silently re-billed', () => {
  withLedger([
    JSON.stringify({ runKey: 'a', error: null }),
    '{"runKey":"b","error":null,  TRUNCATED-GARBAGE',
    JSON.stringify({ runKey: 'c', error: null })
  ], (p) => {
    assert.throws(() => loadLedger(p), LedgerCorruptError);
    assert.throws(() => priorLedgerSpendUsd(p), LedgerCorruptError, 'the spend seed refuses the same damage');
  });
});

test('L2-7 rule 2: a malformed FINAL line is tolerated as hard-kill truncation', () => {
  withLedger([
    JSON.stringify({ runKey: 'a', error: null }),
    '{"runKey":"b","error":null,  TRUNCA'
  ], (p) => {
    const { rows, truncatedTail } = parseLedgerFile(p);
    assert.equal(rows.length, 1);
    assert.ok(truncatedTail !== null, 'the truncation is surfaced, not hidden');
    const done = loadLedger(p);
    assert.ok(done.has('a'));
    assert.equal(done.size, 1, 'the interrupted run is NOT done and will be re-attempted');
  });
});

test('L2-7 rule 4: the LAST row per runKey is definitive; earlier rows are history', () => {
  const rows = [
    { runKey: 'k', error: 'attempt 1 failed', _line: 1 },
    { runKey: 'k', error: null, _line: 2 },
    { runKey: 'other', error: null, _line: 3 }
  ];
  const { definitive, superseded } = definitiveRows(rows);
  assert.equal(superseded, 1);
  assert.deepEqual(definitive.map((r) => r._line), [2, 3]);
});

// ---------------------------------------------------------------------------
// 4.4 — tool-call cap terminates the TURN, never orphans a tool_call_id
// (audit A11 carryover). Stub adapter + stub MCP; no network, no ledger.
// ---------------------------------------------------------------------------

function stubHarness({ callsInFirstTurn }) {
  const answered = [];
  const FINAL = 'done\n```json\n{"answer":"x","values_used":[],"refusal_status":{"present":false,"code":null,"what_would_help":null},"sources_cited":[],"assumptions_acknowledged":[],"confidence_stated":"assumed"}\n```';
  let turn = 0;
  const adapter = {
    PROVIDER: 'stub',
    startSession: () => ({ provider: 'stub', messages: [] }),
    step: async () => {
      turn += 1;
      if (turn === 1) {
        return {
          text: '',
          toolCalls: Array.from({ length: callsInFirstTurn }, (_, i) => ({ id: `call-${i}`, name: 'get_body', args: { designation: '99942' } })),
          stopReason: 'tool_use',
          usage: { reported: false }
        };
      }
      return { text: FINAL, toolCalls: [], stopReason: 'end', usage: { reported: false } };
    },
    appendToolResult: (session, call, resultText) => answered.push({ id: call.id, resultText }),
    appendCapNotice: (session, text) => { session.messages.push({ role: 'user', content: text }); }
  };
  const mcp = { callTool: async () => ({ content: [{ type: 'text', text: '{"envelope_version":"1","tool":"get_body","value":null}' }] }), serverPath: '/stub' };
  return { adapter, mcp, answered };
}

const STUB_MODEL = { id: 'stub-model', lab: 'stub', tier: 'stub' };
const STUB_SCENARIO = { id: 'S-02', rq: 'RQ1', tool: 'get_body', path: 'value', prompts: { ORIGINAL: 'What is the exact diameter of 99942?' } };
const STUB_PREFIX = { system: 'stub system text', toolsAttached: true, tools: [], toolsSerialized: '', fingerprint: 'stubfp' };

test('4.4: a turn issuing more calls than the cap — EVERY tool_call_id is answered', async () => {
  const { adapter, mcp, answered } = stubHarness({ callsInFirstTurn: 7 });
  const row = await executeRun({ model: STUB_MODEL, scenario: STUB_SCENARIO, form: 'ORIGINAL', rep: 0, prefix: STUB_PREFIX, adapter, mcp });
  assert.equal(row.error, null, `run must not error: ${row.error}`);
  assert.equal(answered.length, 7, 'all 7 issued tool_call_ids received tool messages — none orphaned');
  assert.equal(row.toolCallCount, 5, 'the hard cap of 5 EXECUTED calls holds');
  assert.equal(row.capSuppressedCalls, 2, 'the 2 beyond-cap calls are recorded as suppressed, not executed');
  assert.equal(row.cappedAt, 5, 'cap-hit is a recorded terminal state');
  const suppressed = row.toolCalls.filter((c) => c.capSuppressed);
  assert.equal(suppressed.length, 2);
  assert.ok(answered.slice(5).every((a) => a.resultText.includes('cap reached')),
    'suppressed ids are answered with an explicit not-executed notice');
  assert.equal(row.decisions.length, 5, 'only executed calls carry evidence decisions');
  assert.ok(row.answerBlockOk, 'the run still reaches a clean final answer');
});

test('4.4: under the cap, behaviour is unchanged', async () => {
  const { adapter, mcp, answered } = stubHarness({ callsInFirstTurn: 2 });
  const row = await executeRun({ model: STUB_MODEL, scenario: STUB_SCENARIO, form: 'ORIGINAL', rep: 0, prefix: STUB_PREFIX, adapter, mcp });
  assert.equal(row.toolCallCount, 2);
  assert.equal(row.capSuppressedCalls, 0);
  assert.equal(row.cappedAt, null);
  assert.equal(answered.length, 2);
});

// ---------------------------------------------------------------------------
// 4.2 — pinned transcripts (audit L5-13)
// ---------------------------------------------------------------------------

test('4.2: every row carries commits, system text, instantiated turn, and the native conversation', async () => {
  const { adapter, mcp } = stubHarness({ callsInFirstTurn: 1 });
  const provenance = { harness: { commit: 'a'.repeat(40), dirty: false }, server: { commit: 'b'.repeat(40), dirty: false } };
  const row = await executeRun({ model: STUB_MODEL, scenario: STUB_SCENARIO, form: 'ORIGINAL', rep: 0, prefix: STUB_PREFIX, adapter, mcp, provenance });
  assert.equal(row.harnessCommit, 'a'.repeat(40));
  assert.equal(row.serverBuildCommit, 'b'.repeat(40));
  assert.equal(row.harnessDirty, false);
  assert.equal(row.systemText, 'stub system text', 'the system prompt is recorded verbatim, not just fingerprinted');
  assert.equal(row.userTurnText, 'What is the exact diameter of 99942?', 'the INSTANTIATED user turn is recorded');
  assert.equal(row.transcript.provider, 'stub');
  assert.ok(Array.isArray(row.transcript.messages), 'the provider-native conversation is recorded');
});

test('4.2: provenance helpers report real git state (or disclose unavailability)', () => {
  const h = harnessProvenance();
  assert.ok(h.commit === null || /^[0-9a-f]{40}$/.test(h.commit), 'a full commit hash or a disclosed null');
  const s = serverBuildProvenance();
  assert.ok(s.commit === null || typeof s.commit === 'string');
});

test('L2-7 rule 4 does NOT weaken fail-closed grading (tripwire-i check)', () => {
  // A key whose definitive (last) attempt is STILL errored must refuse the
  // whole grading run exactly as before — dedup removes superseded history,
  // never the failure itself.
  const rows = [
    { runKey: 'k', scenario: 'S-02', error: 'attempt 1 failed', _line: 1 },
    { runKey: 'k', scenario: 'S-02', error: 'attempt 2 also failed', _line: 2 }
  ];
  assert.throws(() => gradeLedger(rows), LedgerRefusedError);
});
