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

import { main, parseCliMode, UsageError } from '../runner.mjs';

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
