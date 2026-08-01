#!/usr/bin/env node
// Slice 16 harness — run driver.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// Loop order: scenario -> prompt form -> repetition. Every run appends one JSONL
// row to the ledger. Resumable: on restart, rows already present (keyed by
// runKey) are skipped, so a crashed or rate-limited batch costs only the runs it
// did not complete.
//
// Usage:
//   node runner.mjs --preflight            # report readiness; never spends
//   node runner.mjs --pilot                # DEC-16-11 pilot (needs S16_LIVE_OK=1 + keys)
//   node runner.mjs --full                 # primary matrix (needs S16_LIVE_OK=1 + keys)
//   node runner.mjs --control              # control arm: no tools, ORIGINAL only, r=3
//   node runner.mjs --mock <fixture.json>  # offline end-to-end, no keys, no spend
//
// The harness NEVER sets S16_LIVE_OK or any API key. Both are Hudson's act.

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  ACTIVE_SCENARIOS, CONTROL_ARM, DEFERRED_SCENARIOS, PRIMARY_SCENARIOS,
  STRUCK_SCENARIOS, SCENARIOS,
  ACTIVE_ROSTER, EXCLUDED_MODELS, EXCLUSION_KINDS, REGISTERED_ROSTER,
  EXECUTED_PRIMARY_RUN_COUNT, EXECUTED_CONTROL_RUN_COUNT, EXECUTED_TOTAL_RUN_COUNT,
  REGISTERED_PRIMARY_RUN_COUNT, REGISTERED_CONTROL_RUN_COUNT, REGISTERED_TOTAL_RUN_COUNT,
  BUDGET, estimateRowCostUsd,
  CAP_NOTICE, MAX_MODEL_TURNS, TOOL_CALL_CAP,
  MARKER, PATHS, PILOT, REGISTERED_RUNS_PER_CELL, EXECUTED_RUNS_PER_CELL,
  SpendGuardError, assertLiveAllowed, expandForms, liveReadiness, modelById
} from './config.mjs';
import { connectMcp, extractEnvelope, McpServerUnavailableError } from './mcp-client.mjs';
import { buildPrefix, buildUserTurn, extractAnswerBlock, prefixFingerprint } from './prompt.mjs';
import { createMockAdapter, loadCannedSet } from './mock-adapter.mjs';

const ADAPTER_MODULES = {
  openai: () => import('./adapters/openai.mjs'),
  anthropic: () => import('./adapters/anthropic.mjs'),
  google: () => import('./adapters/google.mjs'),
  // A6 added adapters/together.mjs and swapped the roster, but never registered
  // it here — so the Together adapter was unreachable by the runner. Found while
  // wiring the status convention; harmless while Together is deferred, but it
  // would have failed on re-activation with "no adapter module for together".
  together: () => import('./adapters/together.mjs'),
  // Retired-not-deleted (A6): unreferenced by the roster, kept so the DeepSeek
  // substitution stays reversible.
  deepseek: () => import('./adapters/deepseek.mjs')
};

export function runKey({ modelId, scenarioId, form, rep }) {
  return `${modelId}::${scenarioId}::${form}::${rep}`;
}

// ---------------------------------------------------------------------------
// Pinned-transcript provenance — 4.2 remediation (audit L5-13,
// S16-REMEDIATE-2026-08-01-A).
//
// INV-S16-033 pins one server commit per run set; INV-S16-036 makes every
// transcript an artifact "the reader can check". The old row recorded a
// fingerprint and an absolute server path — proof of SAMENESS within a run,
// but nothing a reader could RECONSTRUCT the conversation from: no commits,
// no system text, no instantiated user turn, no intermediate turns, no
// provider-native conversation. Every row now carries all of it.
// ---------------------------------------------------------------------------

/** Harness worktree commit + dirty flag, computed once per invocation. */
export function harnessProvenance() {
  try {
    const cwd = dirname(new URL(import.meta.url).pathname);
    const commit = execFileSync('git', ['log', '-1', '--format=%H'], { cwd, encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' }).trim().length > 0;
    return { commit, dirty };
  } catch {
    return { commit: null, dirty: null, note: 'git unavailable — provenance unrecorded, disclosed rather than invented' };
  }
}

/** The MCP server build's own baked provenance (commit + dirty at build time). */
export function serverBuildProvenance() {
  try {
    const baked = resolve(dirname(PATHS.mcpServer), 'generated', 'baked-provenance.json');
    return JSON.parse(readFileSync(baked, 'utf8'));
  } catch {
    return { commit: null, dirty: null, note: 'baked-provenance.json unreadable — server build commit unrecorded' };
  }
}

// ---------------------------------------------------------------------------
// Strict CLI parsing — L5-14 remediation (S16-REMEDIATE-2026-08-01-A)
//
// The previous parser checked each recognized flag independently and FELL
// THROUGH TO FULL for anything else. With credentials deliberately armed for a
// run, a typo (`--ful`), `--help`, or a contradictory pair (`--preflight
// --full`) silently became a LIVE FULL RUN. The audit rated this CRITICAL: the
// two-factor spend gate protects the unarmed operator, not the armed one.
//
// Policy now: exactly ONE mode, every token must be recognized, anything else
// errors out BEFORE any filesystem or network side effect. There is no
// fallback mode. Full mode is reachable only by the exact token `--full`.
// ---------------------------------------------------------------------------

export class UsageError extends Error {}

export const USAGE = `usage: node runner.mjs <MODE>
  --preflight            report readiness; never spends (also the no-args default)
  --pilot                DEC-16-11 pilot (needs S16_LIVE_OK=1 + keys)
  --full                 primary matrix (needs S16_LIVE_OK=1 + keys)
  --control              control arm: no tools, ORIGINAL only, r=3
  --mock <fixture.json>  offline end-to-end, no keys, no spend
  --help                 print this text and exit
Exactly one mode per invocation. Unknown or combined flags are an error,
never a fallback — a typo must not be able to start a paid run.`;

/** Strict parse. Throws UsageError on anything unrecognized or contradictory. */
export function parseCliMode(argv) {
  if (argv.length === 0) return { mode: 'preflight', fixture: null };
  const modes = [];
  let fixture = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') modes.push('help');
    else if (arg === '--preflight') modes.push('preflight');
    else if (arg === '--pilot') modes.push('pilot');
    else if (arg === '--full') modes.push('full');
    else if (arg === '--control') modes.push('control');
    else if (arg === '--mock') {
      modes.push('mock');
      const next = argv[i + 1];
      if (!next || next.startsWith('-')) throw new UsageError('--mock requires a fixture filename under fixtures/');
      fixture = next;
      i += 1;
    } else {
      throw new UsageError(`unknown argument: ${arg}`);
    }
  }
  if (modes.length !== 1) {
    throw new UsageError(`exactly one mode required, got: ${modes.join(' + ') || 'none'}`);
  }
  return { mode: modes[0], fixture };
}

// ---------------------------------------------------------------------------
// Ledger policy — L2-7 remediation (S16-REMEDIATE-2026-08-01-A)
//
// The old loader had two silent incoherences the audit called a recovery trap:
// ANY malformed line was skipped (a corrupt middle row vanished from the done
// set and was silently RE-BILLED on resume), while every parseable row counted
// as done EVEN WHEN it recorded an error (a failed attempt was never retried —
// the halted run's 161 errored rows would have been permanently skipped).
//
// ONE policy now, enforced here and mirrored by grade.mjs:
//   1. A malformed line that is NOT the final line is FATAL (LedgerCorruptError)
//      — the ledger is damaged and no run proceeds over it.
//   2. A malformed FINAL line is a hard-kill truncation artifact: tolerated for
//      resume, but REPORTED loudly, never silently.
//   3. A runKey is done ⟺ at least one row with that key has no error.
//      Errored-only keys are retried on resume — matching this file's own
//      header promise that an interrupted batch "costs only the runs it did
//      not complete".
//   4. Retries append; they never modify. Where a key has several rows, the
//      LAST row is definitive (grade.mjs applies the same rule); earlier rows
//      are preserved history.
// ---------------------------------------------------------------------------

export class LedgerCorruptError extends Error {}

/**
 * Parses a ledger file under the policy above.
 * Returns { rows, truncatedTail } — truncatedTail is the raw fragment of a
 * malformed final line, or null.
 */
export function parseLedgerFile(ledgerPath) {
  if (!existsSync(ledgerPath)) return { rows: [], truncatedTail: null };
  const lines = readFileSync(ledgerPath, 'utf8').split('\n');
  const nonEmpty = [];
  lines.forEach((line, index) => {
    if (line.trim() !== '') nonEmpty.push({ line: line.trim(), lineNo: index + 1 });
  });
  const rows = [];
  let truncatedTail = null;
  nonEmpty.forEach(({ line, lineNo }, i) => {
    try {
      rows.push({ ...JSON.parse(line), _line: lineNo });
    } catch {
      if (i === nonEmpty.length - 1) {
        truncatedTail = line.slice(0, 120);
      } else {
        throw new LedgerCorruptError(
          `ledger ${ledgerPath} line ${lineNo} is not valid JSON and is not the final line — ` +
          `the file is damaged, not merely truncated. Refusing to run over it: a silently skipped ` +
          `middle row would be re-billed on resume. Resolve the damage (Hudson) before re-running.`
        );
      }
    }
  });
  return { rows, truncatedTail };
}

/** Done keys under policy rule 3: only keys with at least one successful row. */
export function loadLedger(ledgerPath) {
  const { rows, truncatedTail } = parseLedgerFile(ledgerPath);
  if (truncatedTail !== null) {
    console.error(
      `  !! ledger has a truncated final line (hard-kill artifact): "${truncatedTail}..." — ` +
      'tolerated for resume; that interrupted run will be re-attempted.'
    );
  }
  const done = new Set();
  for (const row of rows) {
    if (row?.runKey && !row.error) done.add(row.runKey);
  }
  return done;
}

function appendLedger(ledgerPath, row) {
  appendFileSync(ledgerPath, `${JSON.stringify(row)}\n`, 'utf8');
}

// ---------------------------------------------------------------------------
// Same-cause halt — L5-1 remediation (S16-REMEDIATE-2026-08-01-A)
//
// The registered condition, quoted verbatim from SLICE_16_FOUNDING.md §20.6:
//   "Mid-run halt condition: >25% of attempted runs in an arm failing for the
//    same cause. A systematic fault must not be paid for repeatedly."
//
// Until now this existed only as prose: the run loop counted failures and
// ground on. In the halted full run the threshold was crossed at row 147
// (37/147 = 25.17% same-cause) and the harness allowed 128 MORE paid attempts
// before a human stopped it. This implements the registered condition as an
// actual runtime halt, checked after every attempted run.
//
// Two operationalizations the registered text leaves open, decided here and
// disclosed rather than hidden:
//   * "same cause" — grouped by the error's provider/status head, i.e. the text
//     before the first `{` (provider JSON body), whitespace-normalized. The 160
//     identical `openai 429` errors in the halted run group to ONE cause under
//     this key; errors from different providers or with different statuses do
//     not group together.
//   * no minimum-attempt floor — the registered text has none, so none is
//     added (adding one would be a re-interpretation). The condition is
//     therefore deliberately eager at small n: one failure in the first
//     attempted run is 100% > 25% and halts. That is the fail-SAFE direction —
//     a false halt is resumable and costs nothing; a missed halt burns budget.
// ---------------------------------------------------------------------------

export const SAME_CAUSE_HALT_THRESHOLD = 0.25;

/** Stable cause key: everything before the provider's JSON error body. */
export function errorCauseKey(error) {
  const s = String(error);
  const brace = s.indexOf('{');
  const head = brace > 0 ? s.slice(0, brace) : s;
  return head.replace(/\s+/g, ' ').trim().slice(0, 160) || 'unknown-cause';
}

/**
 * Returns the halting cause {cause, count, attempted} when any single cause
 * exceeds the registered threshold of attempted runs, else null.
 */
export function sameCauseHalt(failuresByCause, attempted) {
  if (attempted <= 0) return null;
  for (const [cause, count] of failuresByCause) {
    if (count / attempted > SAME_CAUSE_HALT_THRESHOLD) return { cause, count, attempted };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Spend halt — L5-3 remediation (S16-REMEDIATE-2026-08-01-A)
//
// Halts the arm when ACCRUED spend crosses the ceiling, or when PROJECTED
// spend (accrued scaled to the full plan at the observed per-run average)
// crosses it. Projection is the early-warning half: the halted full run's
// per-run cost was 2.94x its projection because 4-5-call scenarios resend the
// whole conversation per turn — a projection halt catches that class of
// surprise while most of the budget is still unspent. A projection halt is
// resumable and costs nothing extra; an accrued halt means the ceiling is
// genuinely exhausted.
// ---------------------------------------------------------------------------

/**
 * Pure predicate.
 *   priorUsd   — priced spend already in the ledger before this invocation
 *                (a resumed run must not restart the meter at $0)
 *   thisRunUsd — priced spend accrued by this invocation
 *   attempted  — rows attempted this invocation
 *   planTotal  — rows this invocation set out to run (pending at start)
 * Accrued halt: prior + this-run spend crosses the ceiling.
 * Projected halt: prior + (this invocation's per-run average x its full plan)
 * crosses the ceiling — the early warning while budget remains.
 * Returns {kind:'accrued'|'projected', accruedUsd, projectedUsd, ceilingUsd} or null.
 */
export function spendHalt({ priorUsd = 0, thisRunUsd, attempted, planTotal, ceilingUsd = BUDGET.ceilingUsd }) {
  const accruedUsd = priorUsd + thisRunUsd;
  if (accruedUsd > ceilingUsd) {
    return { kind: 'accrued', accruedUsd, projectedUsd: accruedUsd, ceilingUsd };
  }
  if (attempted > 0 && planTotal > attempted) {
    const projectedUsd = priorUsd + (thisRunUsd / attempted) * planTotal;
    if (projectedUsd > ceilingUsd) return { kind: 'projected', accruedUsd, projectedUsd, ceilingUsd };
  }
  return null;
}

/** Prices every row already in a ledger — the resume seed for the guard. */
export function priorLedgerSpendUsd(ledgerPath) {
  // Shares parseLedgerFile so a damaged ledger blocks HERE too (L2-7 rule 1),
  // not just at the done-set stage.
  const { rows } = parseLedgerFile(ledgerPath);
  return rows.reduce((usd, row) => usd + estimateRowCostUsd(row).usd, 0);
}

/** Builds the plan without executing anything — used by --preflight and tests. */
export function buildPlan({ scenarioIds = null, runsPerCell = EXECUTED_RUNS_PER_CELL, models = ACTIVE_ROSTER, forms: formsOverride = null } = {}) {
  const pool = scenarioIds
    ? SCENARIOS.filter((s) => scenarioIds.includes(s.id))
    : ACTIVE_SCENARIOS;
  // Control arm (A1 §10.2) uses ORIGINAL only, r=3 — not the 4/3/3 split.
  const forms = formsOverride ?? expandForms(runsPerCell);
  const plan = [];
  for (const model of models) {
    for (const scenario of pool) {
      forms.forEach((form, index) => {
        plan.push({
          runKey: runKey({ modelId: model.id, scenarioId: scenario.id, form, rep: index }),
          modelId: model.id,
          scenarioId: scenario.id,
          form,
          rep: index
        });
      });
    }
  }
  return plan;
}

async function resolveAdapter(model) {
  const load = ADAPTER_MODULES[model.adapter];
  if (!load) throw new Error(`no adapter module for ${model.adapter}`);
  return load();
}

/**
 * Executes one run. `tools` is the live MCP session (or null in mock mode).
 * Returns the ledger row; never throws for provider errors — a failed run is
 * recorded as a row with `error` set, so the ledger stays a complete census.
 */
export async function executeRun({ model, scenario, form, rep, prefix, adapter, mcp, arm = 'primary', provenance = null }) {
  const startedAt = new Date().toISOString();
  const row = {
    marker: MARKER,
    // 4.2 (L5-13): commit-pinned provenance on EVERY row.
    harnessCommit: provenance?.harness?.commit ?? null,
    harnessDirty: provenance?.harness?.dirty ?? null,
    serverBuildCommit: provenance?.server?.commit ?? null,
    serverBuildDirty: provenance?.server?.dirty ?? null,
    runKey: runKey({ modelId: model.id, scenarioId: scenario.id, form, rep }),
    // Which arm produced this row. Control rows are excluded from the primary
    // faithfulness metrics (A1 §10.2) and must be separable at analysis time.
    arm,
    toolsAttached: prefix.toolsAttached !== false,
    startedAt,
    model: model.id,
    lab: model.lab,
    tier: model.tier,
    scenario: scenario.id,
    rq: scenario.rq,
    expectedTool: scenario.tool,
    path: scenario.path,
    form,
    rep,
    prefixFingerprint: prefix.fingerprint,
    serverPath: mcp?.serverPath ?? null
  };

  try {
    const userTurn = buildUserTurn(scenario, form);
    const session = adapter.startSession({ model, prefix, userTurn, mcpTools: prefix.tools, scenario, form });

    const decisions = [];   // envelopes, in call order — what the grader reads
    const toolCallLog = []; // full call record, including failures
    const usageTurns = [];
    let calls = 0;
    let capSuppressed = 0;  // 4.4: issued-but-not-executed calls beyond the cap
    let finalText = '';
    let stopReason = null;
    let cappedAt = null;

    for (let turn = 0; turn < MAX_MODEL_TURNS; turn += 1) {
      const step = await adapter.step(session, {});
      usageTurns.push(step.usage ?? { reported: false });
      stopReason = step.stopReason ?? stopReason;

      if (!step.toolCalls || step.toolCalls.length === 0) {
        finalText = step.text ?? '';
        break;
      }

      // REMEDIATION 4.4 (audit A11 carryover, S16-REMEDIATE-2026-08-01-A):
      // the cap check used to `break` INSIDE this loop, abandoning the rest of
      // the turn's tool_calls without tool messages — and OpenAI then rejected
      // the next request with 400 "An assistant message with 'tool_calls' must
      // be followed by tool messages responding to each 'tool_call_id'"
      // (observed live on gpt-5.5::S-13::ORIGINAL::3, the 4-5-call scenario;
      // unreachable in the 1-2-call pilot). Now EVERY issued tool_call_id
      // receives a tool message: calls beyond the cap are answered with an
      // explicit not-executed notice instead of being executed — the hard cap
      // holds, the protocol contract holds, and the suppressed attempts are
      // recorded (`capSuppressed`) as a distinct, clean terminal state.
      for (const call of step.toolCalls) {
        if (calls >= TOOL_CALL_CAP) {
          capSuppressed += 1;
          toolCallLog.push({ index: null, id: call.id, tool: call.name, args: call.args, capSuppressed: true });
          adapter.appendToolResult(session, call, JSON.stringify({
            isError: true,
            error: { message: 'tool-call cap reached for this task; this call was not executed' }
          }));
          continue;
        }
        calls += 1;
        let raw;
        let envelope = null;
        let callError = null;
        try {
          raw = await mcp.callTool(call.name, call.args);
          envelope = extractEnvelope(raw);
        } catch (error) {
          callError = error instanceof Error ? error.message : String(error);
          raw = { isError: true, error: { message: callError } };
        }
        // Every envelope is recorded verbatim, in call order (A4-3).
        decisions.push({ index: calls, tool: call.name, args: call.args, envelope, mcpError: Boolean(raw?.isError), callError });
        toolCallLog.push({ index: calls, id: call.id, tool: call.name, args: call.args, mcpError: Boolean(raw?.isError), callError });
        adapter.appendToolResult(session, call, JSON.stringify(raw));
      }

      if (calls >= TOOL_CALL_CAP) {
        cappedAt = calls;
        adapter.appendCapNotice(session, CAP_NOTICE);
        const closing = await adapter.step(session, {});
        usageTurns.push(closing.usage ?? { reported: false });
        finalText = closing.text ?? '';
        stopReason = closing.stopReason ?? stopReason;
        break;
      }
    }

    const extracted = extractAnswerBlock(finalText);

    row.replyText = finalText;
    row.toolCallCount = calls;
    row.toolCalls = toolCallLog;
    row.decisions = decisions;
    row.cappedAt = cappedAt;
    row.capSuppressedCalls = capSuppressed; // 4.4: distinct cap-hit terminal state
    row.stopReason = stopReason;
    row.usageTurns = usageTurns;
    row.usage = sumUsage(usageTurns);
    row.answerBlock = extracted.block;
    row.answerBlockOk = extracted.ok;
    row.answerBlockReason = extracted.reason;
    // 4.2 (L5-13): the FULL pinned transcript — system text, instantiated user
    // turn, and the provider-native conversation including every intermediate
    // assistant turn and tool result, exactly as the adapter accumulated it.
    // A reader can now reconstruct what was said, not merely verify sameness.
    row.systemText = prefix.system;
    row.userTurnText = userTurn;
    row.transcript = {
      provider: session.provider ?? adapter.PROVIDER ?? null,
      system: session.system ?? null,
      messages: session.messages ?? session.contents ?? null
    };
    row.finishedAt = new Date().toISOString();
    row.error = null;

    // A4-4 FAIL-LOUD: a run that never called a tool is marked, not swallowed
    // and not quietly graded as though evidence existed. With no `decisions`,
    // grade.mjs leaves the row UNGRADEABLE — which is the intended outcome.
    if (calls === 0 && prefix.toolsAttached !== false) {
      row.no_tool_call = true;
      row.no_tool_call_reason =
        `model produced a final answer without requesting any tool (stopReason=${stopReason ?? 'null'}); ` +
        'no envelope was obtained, so this run carries no evidence and is not gradeable';
    }
  } catch (error) {
    // A spend-guard refusal is NOT a per-run error to be logged and stepped
    // over — it means the whole invocation is unauthorized. Rethrow so the
    // caller aborts. (Recording it as a row is how an earlier version ground
    // through an entire plan writing hundreds of junk rows and exiting 0.)
    if (error instanceof SpendGuardError) throw error;
    row.finishedAt = new Date().toISOString();
    row.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    row.replyText = null;
    row.answerBlock = null;
    row.answerBlockOk = false;
  }

  return row;
}

/** Adds up per-turn provider usage so the ledger carries a run total. */
function sumUsage(turns) {
  const reported = turns.filter((u) => u && u.reported);
  if (reported.length === 0) return { reported: false, turns: turns.length };
  const add = (key) => reported.reduce((acc, u) => acc + (Number(u[key]) || 0), 0);
  return {
    reported: true,
    turns: turns.length,
    inputTokens: add('inputTokens'),
    outputTokens: add('outputTokens'),
    totalTokens: add('totalTokens'),
    cachedInputTokens: add('cachedInputTokens')
  };
}

/**
 * Fails the whole invocation before a single row is written unless every model
 * in the plan is authorized. Cheap, and it means a mis-invocation costs nothing
 * and leaves no ledger residue.
 */
function assertPlanAuthorized(models, env = process.env) {
  for (const model of models) assertLiveAllowed(model, env);
}

function reportPreflight() {
  const readiness = liveReadiness();
  console.log(`Slice 16 harness preflight — ${MARKER}`);
  console.log(`  S16_LIVE_OK=1 : ${readiness.liveOk ? 'YES' : 'NO  (no live call is possible)'}`);
  console.log(`  Roster: registered k=${REGISTERED_ROSTER.length}, ACTIVE k=${ACTIVE_ROSTER.length}` +
    (EXCLUDED_MODELS.length ? `, excluded ${EXCLUDED_MODELS.length}` : ''));
  // r is displayed on BOTH sides so a reader never has to infer which one a
  // count used. L2-2 sync: the old suffix still said "A9-1, reduced for
  // resource constraints" after A10-1 had restored r=10 — preflight text was
  // contradicting the executable values it sat next to.
  console.log(`  Repetitions r: REGISTERED ${REGISTERED_RUNS_PER_CELL} / EXECUTED ${EXECUTED_RUNS_PER_CELL}  (A10-1: restored to the registered value — founding §20)`);
  console.log('  Provider keys:');
  for (const m of readiness.models) {
    const state = m.status === 'active' ? (m.keyPresent ? 'present' : 'ABSENT') : m.status.toUpperCase();
    console.log(`    ${m.id.padEnd(34)} ${m.keyEnv.padEnd(18)} ${state.padEnd(9)} [${m.certainty}]`);
  }
  // A9-3: three exclusion kinds, never collapsed — what it takes to reverse each
  // is different, and that is the whole point of keeping them apart.
  for (const m of EXCLUDED_MODELS) {
    console.log(`    ^ ${m.id} is ${m.status.toUpperCase()} — excluded from every run.`);
    console.log(`      kind:   ${EXCLUSION_KINDS[m.status] ?? 'UNKNOWN EXCLUSION KIND'}`);
    console.log(`      reason: ${String(m.exclusionReason).slice(0, 160)}...`);
  }
  console.log('  Scenario set:');
  console.log(`    primary (pre-registered) : ${PRIMARY_SCENARIOS.length}  -> ${REGISTERED_PRIMARY_RUN_COUNT} REGISTERED primary runs (${PRIMARY_SCENARIOS.length} x k=${REGISTERED_ROSTER.length} x r=${REGISTERED_RUNS_PER_CELL})`);
  console.log(`    active  (runnable now)   : ${ACTIVE_SCENARIOS.length}  -> ${EXECUTED_PRIMARY_RUN_COUNT} EXECUTED primary runs (${ACTIVE_SCENARIOS.length} x k=${ACTIVE_ROSTER.length} x r=${EXECUTED_RUNS_PER_CELL})`);
  console.log(`    deferred (inside primary): ${DEFERRED_SCENARIOS.length}  (${DEFERRED_SCENARIOS.map((s) => s.id).join(', ')})`);
  console.log(`    struck  (outside primary): ${STRUCK_SCENARIOS.length}  (${STRUCK_SCENARIOS.map((s) => s.id).join(', ')})`);
  console.log(`  Control arm: ${REGISTERED_CONTROL_RUN_COUNT} REGISTERED / ${EXECUTED_CONTROL_RUN_COUNT} EXECUTED (r=${CONTROL_ARM.runsPerCell} both — A9 did not reduce the control arm, it was already 3)`);
  console.log(`  Totals: ${REGISTERED_TOTAL_RUN_COUNT} registered / ${EXECUTED_TOTAL_RUN_COUNT} executed  (${(100 * EXECUTED_TOTAL_RUN_COUNT / REGISTERED_TOTAL_RUN_COUNT).toFixed(1)}% of the registered design)`);
  console.log(`  MCP server built: ${existsSync(PATHS.mcpServer) ? 'yes' : 'NO — cd mcp && npm install && npm run build'}`);
  if (!readiness.liveOk) {
    console.log('\nNo spend is possible in this state. This is the default and is correct.');
  }
}

export async function main(argv = process.argv.slice(2)) {
  // L5-14: strict parse BEFORE any side effect. A UsageError here means the
  // invocation was malformed; nothing has been created, spawned, or spent.
  let cli;
  try {
    cli = parseCliMode(argv);
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`${error.message}\n\n${USAGE}`);
      return 2;
    }
    throw error;
  }

  if (cli.mode === 'help') {
    console.log(USAGE);
    return 0;
  }
  if (cli.mode === 'preflight') {
    reportPreflight();
    return 0;
  }

  const wantsPilot = cli.mode === 'pilot';
  const wantsControl = cli.mode === 'control';
  const wantsMock = cli.mode === 'mock';

  mkdirSync(PATHS.ledgerDir, { recursive: true });

  const mode = cli.mode;
  const runsPerCell = wantsControl
    ? CONTROL_ARM.runsPerCell
    // The full run uses EXECUTED_RUNS_PER_CELL — whatever the amendment chain
    // currently sets it to (A10-1 restored it to the registered 10). Never a
    // literal here: the constant is the single source of truth.
    : wantsPilot ? PILOT.runsPerCell : EXECUTED_RUNS_PER_CELL;
  const scenarioIds = wantsPilot ? PILOT.scenarioIds : null;
  // Control arm: ORIGINAL form only, repeated r=3 times.
  const formsOverride = wantsControl
    ? Array.from({ length: CONTROL_ARM.runsPerCell }, () => CONTROL_ARM.form)
    : null;
  const ledgerPath = resolve(PATHS.ledgerDir, `ledger-${mode}.jsonl`);
  let alreadyDone;
  try {
    alreadyDone = loadLedger(ledgerPath);
  } catch (error) {
    if (error instanceof LedgerCorruptError) {
      console.error(`\n${error.message}\n`);
      return 7;
    }
    throw error;
  }

  let mcp = null;
  let prefix = null;
  let adapterFor = null;
  let models = ACTIVE_ROSTER;   // deferred models never enter a plan
  let mockScenarioIds = null;

  if (wantsMock) {
    const canned = loadCannedSet(cli.fixture);
    const mockAdapter = createMockAdapter(canned);
    adapterFor = async () => mockAdapter;
    models = [{ id: `mock:${canned.name}`, lab: 'mock', tier: 'mock', adapter: 'mock', keyEnv: 'NONE' }];
    mockScenarioIds = Object.keys(canned.scripts ?? {});
    // A4: the mock emits REAL tool calls, so mock mode now spawns the local MCP
    // server too. Only the model text is canned; every envelope is genuine.
    try {
      mcp = await connectMcp();
    } catch (error) {
      if (error instanceof McpServerUnavailableError) {
        console.error(error.message);
        return 3;
      }
      throw error;
    }
    const mockToolsList = await mcp.listTools();
    prefix = buildPrefix(mockToolsList, { toolsAttached: !canned.controlArm });
    prefix.fingerprint = prefixFingerprint(prefix);
    // fall through to planning
  } else if (wantsControl) {
    // Refuse the entire invocation before writing anything.
    try {
      assertPlanAuthorized(models);
    } catch (error) {
      if (error instanceof SpendGuardError) { console.error(`\n${error.message}\n`); return 4; }
      throw error;
    }
    // Control arm attaches NO tools, so the MCP server is not spawned at all —
    // there is nothing for the model to call. This also means the control arm
    // runs without `cd mcp && npm ci`.
    prefix = buildPrefix({ tools: [] }, { toolsAttached: false });
    prefix.fingerprint = prefixFingerprint(prefix);
    adapterFor = resolveAdapter;
  } else {
    // Refuse before spawning the server or writing anything.
    try {
      assertPlanAuthorized(models);
    } catch (error) {
      if (error instanceof SpendGuardError) { console.error(`\n${error.message}\n`); return 4; }
      throw error;
    }
    try {
      mcp = await connectMcp();
    } catch (error) {
      if (error instanceof McpServerUnavailableError) {
        console.error(error.message);
        return 3;
      }
      throw error;
    }
    const toolsList = await mcp.listTools();
    prefix = buildPrefix(toolsList);
    prefix.fingerprint = prefixFingerprint(prefix);
    adapterFor = resolveAdapter;
  }

  const plan = buildPlan({
    scenarioIds: mockScenarioIds ?? scenarioIds,
    runsPerCell,
    models,
    forms: formsOverride
  });
  const pending = plan.filter((p) => !alreadyDone.has(p.runKey));

  console.log(`mode=${mode} planned=${plan.length} already-done=${plan.length - pending.length} pending=${pending.length}`);
  console.log(`ledger: ${ledgerPath}`);
  console.log(`prefix fingerprint: ${prefix.fingerprint}`);

  // 4.2 (L5-13): computed once per invocation, stamped on every row.
  const provenance = {
    harness: harnessProvenance(),
    server: mcp !== null ? serverBuildProvenance() : { commit: null, dirty: null, note: 'no-tools arm: server not spawned' }
  };

  let completed = 0;
  let failed = 0;
  let thisRunUsd = 0;
  let unpricedRows = 0;
  const priorUsd = priorLedgerSpendUsd(ledgerPath); // cannot throw here: loadLedger above already validated the file
  if (priorUsd > 0) console.log(`prior spend already in this ledger: $${priorUsd.toFixed(2)} (counts toward the $${BUDGET.ceilingUsd} ceiling)`);
  const failuresByCause = new Map();

  try {
    for (const item of pending) {
      const model = wantsMock ? models[0] : modelById(item.modelId);
      const scenario = SCENARIOS.find((s) => s.id === item.scenarioId);
      const adapter = await adapterFor(model);

      let row;
      try {
        row = await executeRun({
          model, scenario, form: item.form, rep: item.rep, prefix, adapter, mcp,
          arm: wantsControl ? 'control' : 'primary', provenance
        });
      } catch (error) {
        if (error instanceof SpendGuardError) {
          console.error(`\n${error.message}\n`);
          return 4;
        }
        throw error;
      }

      appendLedger(ledgerPath, row);
      completed += 1;

      // L5-3: price this row from provider-reported usage and halt if the
      // budget ceiling is crossed — accrued or projected.
      const cost = estimateRowCostUsd(row);
      thisRunUsd += cost.usd;
      if (cost.unpriced) {
        unpricedRows += 1;
        console.error(`  !! row for ${row.model} has reported usage but NO price entry — spend guard is undercounting (${unpricedRows} such rows)`);
      }
      const budgetHalt = spendHalt({ priorUsd, thisRunUsd, attempted: completed, planTotal: pending.length });
      if (budgetHalt) {
        console.error(
          `\nSPEND HALT (${budgetHalt.kind}): accrued $${budgetHalt.accruedUsd.toFixed(2)}` +
          (budgetHalt.kind === 'projected'
            ? `, projected $${budgetHalt.projectedUsd.toFixed(2)} over the full plan of ${pending.length}`
            : '') +
          ` crosses the $${budgetHalt.ceilingUsd} ceiling (DEC-16-7, BUDGET.ceilingUsd).\n` +
          `Prices are third-party-estimated — verify against console billing. The ledger is preserved; ` +
          `a resumed run re-prices only NEW rows, so raising the ceiling (a config change, Hudson's call) ` +
          `and re-issuing the command continues from here.\n`
        );
        return 6;
      }

      if (row.error) {
        failed += 1;
        const cause = errorCauseKey(row.error);
        failuresByCause.set(cause, (failuresByCause.get(cause) ?? 0) + 1);
        const halt = sameCauseHalt(failuresByCause, completed);
        if (halt) {
          console.error(
            `\nSAME-CAUSE HALT (registered, SLICE_16_FOUNDING.md §20.6): ` +
            `${halt.count}/${halt.attempted} attempted runs in this arm failed for one cause ` +
            `(${(100 * halt.count / halt.attempted).toFixed(1)}% > ${100 * SAME_CAUSE_HALT_THRESHOLD}%).\n` +
            `  cause: ${halt.cause}\n` +
            `A systematic fault must not be paid for repeatedly. The ledger is preserved ` +
            `(${completed} rows this invocation); fix the cause, then re-issue the same command — ` +
            `the runner resumes from the ledger.\n`
          );
          return 5;
        }
      }

      if (completed % 25 === 0 || completed === pending.length) {
        console.log(`  ${completed}/${pending.length} complete (${failed} errored)`);
      }
    }
  } finally {
    if (mcp) mcp.close();
  }

  console.log(`done: ${completed} runs written, ${failed} errored`);
  return failed > 0 ? 1 : 0;
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
