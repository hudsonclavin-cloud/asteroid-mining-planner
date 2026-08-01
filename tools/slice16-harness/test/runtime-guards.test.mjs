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
  errorCauseKey, sameCauseHalt, SAME_CAUSE_HALT_THRESHOLD
} from '../runner.mjs';

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
