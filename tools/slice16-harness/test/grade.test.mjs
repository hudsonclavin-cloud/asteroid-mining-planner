// Slice 16 harness — grading CLI gate.
// MARKER: S16-MCPLIVE-2026-07-27-A
//
// The A3 landmine: slot grading engages only when gradeDecision gets a
// scenarioId. These tests prove the CLI can never quietly grade without one.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BOOTSTRAP_SEED, LedgerRefusedError, auditRow, clusterBootstrapCI,
  gradeLedger, mergeEvidence, passAtK
} from '../grade.mjs';
import { gradeDecision } from '../grader.mjs';
import { PATHS } from '../config.mjs';

const cases = JSON.parse(readFileSync(resolve(PATHS.fixturesDir, 'grader-cases.json'), 'utf8'));
const E1 = cases.envelopes.E1_value_get_body;
const PF1 = cases.sets.prose_fabricator.cases.find((c) => c.id === 'PF1');

function row(overrides = {}) {
  return {
    _line: 1,
    runKey: 'm::S-02::ORIGINAL::0',
    arm: 'primary',
    model: 'claude-sonnet-4-6',
    scenario: 'S-02',
    form: 'ORIGINAL',
    rep: 0,
    envelope: E1,
    answerBlock: PF1.block,
    error: null,
    ...overrides
  };
}

test('FAIL-CLOSED: a row with no scenarioId refuses the whole grading run', () => {
  const rows = [row(), row({ scenario: undefined, scenarioId: undefined, runKey: 'm::?::ORIGINAL::1' })];
  assert.throws(
    () => gradeLedger(rows),
    (err) => {
      assert.ok(err instanceof LedgerRefusedError);
      assert.match(err.message, /GRADING REFUSED/);
      assert.match(err.message, /no scenario id/);
      assert.match(err.message, /no fallback/i);
      return true;
    },
    'a missing scenarioId must refuse everything, not grade in fallback mode'
  );
});

test('FAIL-CLOSED: a row with no envelope refuses the whole grading run', () => {
  const rows = [row(), row({ envelope: undefined, runKey: 'm::S-02::P1::0' })];
  assert.throws(
    () => gradeLedger(rows),
    (err) => {
      assert.ok(err instanceof LedgerRefusedError);
      assert.match(err.message, /no envelope on the row/);
      return true;
    },
    'grading an answer against no evidence must be refused'
  );
});

test('FAIL-CLOSED: refusal is all-or-nothing — one bad row blocks all good ones', () => {
  const rows = [row(), row(), row({ scenario: undefined })];
  try {
    gradeLedger(rows);
    assert.fail('should have refused');
  } catch (error) {
    assert.ok(error instanceof LedgerRefusedError);
    assert.equal(error.problems.length, 1, 'exactly the offending row is reported');
    assert.match(error.message, /1 of 3 ledger rows/);
  }
});

test('FAIL-CLOSED: a scenario with no slot declaration (e.g. struck) is refused', () => {
  assert.throws(
    () => gradeLedger([row({ scenario: 'S-09' })]), // struck by A1
    (err) => {
      assert.match(err.message, /no slot declaration/);
      return true;
    }
  );
});

test('unparseable ledger lines are refused, never skipped', () => {
  const rows = [row(), { _line: 2, _unparseable: '{broken' }];
  assert.throws(() => gradeLedger(rows), LedgerRefusedError);
});

test('CLI grading matches direct gradeDecision-with-scenarioId on PROSE-FABRICATOR', () => {
  const direct = gradeDecision({ envelope: E1, block: PF1.block, scenarioId: 'S-02' });
  const { graded } = gradeLedger([row()]);

  assert.equal(graded.length, 1);
  const viaCli = graded[0].decisions[0];
  assert.equal(viaCli.VF.score, direct.VF.score, 'VF must agree');
  assert.equal(viaCli.FULL, direct.FULL, 'FULL must agree');
  assert.equal(viaCli.VF.score, 0, 'PF1 is a prose fabrication and must score 0');
  assert.equal(graded[0].FULL, 0);
  assert.ok(graded[0].slotModes.includes('slot-graded'), 'A3 slot grading must be active');
});

test('slotMode is recorded per run so fallback grading is detectable after the fact', () => {
  const { graded } = gradeLedger([row()]);
  assert.deepEqual(graded[0].slotModes, ['slot-graded']);
});

test('auditRow accepts both a single envelope and a decisions array', () => {
  assert.deepEqual(auditRow(row()).problems, []);
  assert.deepEqual(
    auditRow(row({ envelope: undefined, decisions: [{ envelope: E1, tool: 'get_body' }] })).problems,
    []
  );
});

test('passAtK is the unbiased C(c,k)/C(n,k) estimator', () => {
  assert.equal(passAtK(10, 10, 3), 1);
  assert.equal(passAtK(0, 10, 3), 0);
  assert.equal(passAtK(2, 10, 3), 0, 'fewer successes than k is 0');
  assert.equal(passAtK(5, 5, 3), 1);
  assert.equal(passAtK(2, 2, 3), null, 'n < k is undefined, not 0');
  // C(5,3)/C(10,3) = 10/120
  assert.ok(Math.abs(passAtK(5, 10, 3) - 10 / 120) < 1e-12);
});

test('cluster bootstrap is deterministic and resamples scenarios, not runs', () => {
  const byScenario = {
    'S-02': { runs: [1, 1, 1, 0] },
    'S-03': { runs: [0, 0, 0, 0] },
    'S-04': { runs: [1, 1, 1, 1] }
  };
  const a = clusterBootstrapCI(byScenario, { resamples: 500, seed: BOOTSTRAP_SEED });
  const b = clusterBootstrapCI(byScenario, { resamples: 500, seed: BOOTSTRAP_SEED });
  assert.deepEqual(a, b, 'same seed must give byte-identical bounds');
  assert.ok(a.low >= 0 && a.high <= 1 && a.low <= a.high);

  const allOnes = clusterBootstrapCI({ x: { runs: [1, 1] }, y: { runs: [1, 1] } }, { resamples: 200 });
  assert.equal(allOnes.low, 1);
  assert.equal(allOnes.high, 1, 'a degenerate all-faithful set has a degenerate interval');
});

test('control-arm rows are graded but kept out of the primary aggregate', () => {
  const rows = [
    row({ runKey: 'a', arm: 'primary' }),
    row({ runKey: 'b', arm: 'control' })
  ];
  const { graded, aggregates } = gradeLedger(rows);
  assert.equal(graded.length, 2);
  assert.equal(aggregates.primaryArm['claude-sonnet-4-6'].runs, 1, 'only the primary row counts');
  assert.ok(aggregates.controlArm['claude-sonnet-4-6'], 'the control row is reported separately');
});

// ---------------------------------------------------------------------------
// AMENDMENT A6 — PTA admits actually-invoked tools (R-A6-1 / R-A6-2)
// ---------------------------------------------------------------------------

const crossTool = cases.sets.cross_tool;

function mergedCrossToolEnvelope() {
  const decisions = crossTool.mergeFrom.map((name, i) => ({
    envelope: cases.envelopes[name],
    tool: crossTool.toolsInvoked[i]
  }));
  return mergeEvidence(decisions);
}

test('A6: merged envelope records EVERY tool invoked, not just the first', () => {
  const m = mergedCrossToolEnvelope();
  assert.deepEqual(m.envelope.toolsInvoked, crossTool.toolsInvoked);
  assert.equal(m.envelope.tool, crossTool.toolsInvoked[0], 'the singular DEC-15-4 tool field is unchanged');
});

test('A6: cross-tool fixture set scores exactly as specified', () => {
  const m = mergedCrossToolEnvelope();
  for (const c of crossTool.cases) {
    const g = gradeDecision({ envelope: m.envelope, block: c.block, tool: m.tool, scenarioId: c.scenarioId });
    assert.equal(
      g.PTA.score, c.expectedPTA,
      `${c.id} (${c.label}): PTA ${g.PTA.score} != expected ${c.expectedPTA}; bogus=${JSON.stringify(g.PTA.bogus ?? [])}`
    );
  }
});

test('A6 BOUNDARY: honest cross-tool passes, never-called tool and absent source still fail', () => {
  const m = mergedCrossToolEnvelope();
  const base = {
    answer: 'x', values_used: [],
    refusal_status: { present: false, code: null, what_would_help: null },
    assumptions_acknowledged: [], confidence_stated: 'assumed'
  };
  const pta = (sources) =>
    gradeDecision({ envelope: m.envelope, block: { ...base, sources_cited: sources }, tool: m.tool, scenarioId: 'S-02' }).PTA;

  // Widened: both actually-invoked tools now count.
  assert.equal(pta(['get_body']).score, 1, 'first invoked tool');
  assert.equal(pta(['explain_cell']).score, 1, 'second invoked tool — the A6 fix');
  // Unchanged: real provenance still counts.
  assert.equal(pta(['catalog-boundary']).score, 1);
  assert.equal(pta(['launch-vehicles']).score, 1);
  // Safeguard: a real tool that was NOT called in this run still fails.
  assert.equal(pta(['get_validation_report']).score, 0, 'never-called tool must fail');
  assert.equal(pta(['porkchop_scan']).score, 0, 'never-called tool must fail');
  // Safeguard: a source in no envelope still fails.
  assert.equal(pta(['NEOWISE thermal survey']).score, 0, 'absent source must fail');
  // Safeguard: one bogus citation fails the dimension even beside a real one.
  assert.equal(pta(['explain_cell', 'NEOWISE thermal survey']).score, 0);
});

test('A6: single-envelope runs are untouched (A5-2 identity guarantee holds)', () => {
  const single = mergeEvidence([{ envelope: cases.envelopes.E1_value_get_body, tool: 'get_body' }]);
  assert.equal(single.envelope, cases.envelopes.E1_value_get_body, 'still identity-equal');
  assert.equal(single.envelope.toolsInvoked, undefined, 'no toolsInvoked injected into a single envelope');
});
