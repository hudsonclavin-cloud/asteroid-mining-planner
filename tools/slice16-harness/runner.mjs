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

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ACTIVE_SCENARIOS, CONTROL_ARM, CONTROL_RUN_COUNT, DEFERRED_SCENARIOS,
  PRIMARY_RUN_COUNT, PRIMARY_SCENARIOS, STRUCK_SCENARIOS, SCENARIOS, TOTAL_RUN_COUNT,
  CAP_NOTICE, MAX_MODEL_TURNS, TOOL_CALL_CAP,
  MARKER, PATHS, PILOT, ROSTER, RUNS_PER_CELL,
  SpendGuardError, assertLiveAllowed, expandForms, liveReadiness, modelById
} from './config.mjs';
import { connectMcp, extractEnvelope, McpServerUnavailableError } from './mcp-client.mjs';
import { buildPrefix, buildUserTurn, extractAnswerBlock, prefixFingerprint } from './prompt.mjs';
import { createMockAdapter, loadCannedSet } from './mock-adapter.mjs';

const ADAPTER_MODULES = {
  openai: () => import('./adapters/openai.mjs'),
  anthropic: () => import('./adapters/anthropic.mjs'),
  google: () => import('./adapters/google.mjs'),
  deepseek: () => import('./adapters/deepseek.mjs')
};

export function runKey({ modelId, scenarioId, form, rep }) {
  return `${modelId}::${scenarioId}::${form}::${rep}`;
}

export function loadLedger(ledgerPath) {
  const done = new Set();
  if (!existsSync(ledgerPath)) return done;
  const text = readFileSync(ledgerPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      const row = JSON.parse(trimmed);
      if (row?.runKey) done.add(row.runKey);
    } catch {
      // A truncated final line from a hard kill is expected; skip it.
    }
  }
  return done;
}

function appendLedger(ledgerPath, row) {
  appendFileSync(ledgerPath, `${JSON.stringify(row)}\n`, 'utf8');
}

/** Builds the plan without executing anything — used by --preflight and tests. */
export function buildPlan({ scenarioIds = null, runsPerCell = RUNS_PER_CELL, models = ROSTER, forms: formsOverride = null } = {}) {
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
async function executeRun({ model, scenario, form, rep, prefix, adapter, mcp, arm = 'primary' }) {
  const startedAt = new Date().toISOString();
  const row = {
    marker: MARKER,
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

      for (const call of step.toolCalls) {
        if (calls >= TOOL_CALL_CAP) break;
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
    row.stopReason = stopReason;
    row.usageTurns = usageTurns;
    row.usage = sumUsage(usageTurns);
    row.answerBlock = extracted.block;
    row.answerBlockOk = extracted.ok;
    row.answerBlockReason = extracted.reason;
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
  console.log('  Provider keys:');
  for (const m of readiness.models) {
    console.log(`    ${m.id.padEnd(30)} ${m.keyEnv.padEnd(18)} ${m.keyPresent ? 'present' : 'ABSENT'}  [${m.certainty}]`);
  }
  console.log('  Scenario set:');
  console.log(`    primary (pre-registered) : ${PRIMARY_SCENARIOS.length}  -> ${PRIMARY_RUN_COUNT} primary runs at r=${RUNS_PER_CELL}, k=${ROSTER.length}`);
  console.log(`    active  (runnable now)   : ${ACTIVE_SCENARIOS.length}  -> ${ACTIVE_SCENARIOS.length * ROSTER.length * RUNS_PER_CELL} runs executable today`);
  console.log(`    deferred (inside primary): ${DEFERRED_SCENARIOS.length}  (${DEFERRED_SCENARIOS.map((s) => s.id).join(', ')})`);
  console.log(`    struck  (outside primary): ${STRUCK_SCENARIOS.length}  (${STRUCK_SCENARIOS.map((s) => s.id).join(', ')})`);
  console.log(`  Control arm: ${CONTROL_RUN_COUNT} runs (r=${CONTROL_ARM.runsPerCell}, ${CONTROL_ARM.form} only, no tools) -> total registered ${TOTAL_RUN_COUNT}`);
  console.log(`  MCP server built: ${existsSync(PATHS.mcpServer) ? 'yes' : 'NO — cd mcp && npm install && npm run build'}`);
  if (!readiness.liveOk) {
    console.log('\nNo spend is possible in this state. This is the default and is correct.');
  }
}

export async function main(argv = process.argv.slice(2)) {
  const wantsPreflight = argv.includes('--preflight') || argv.length === 0;
  const wantsPilot = argv.includes('--pilot');
  const wantsFull = argv.includes('--full');
  const wantsControl = argv.includes('--control');
  const mockIndex = argv.indexOf('--mock');
  const wantsMock = mockIndex !== -1;

  if (wantsPreflight && !wantsPilot && !wantsFull && !wantsControl && !wantsMock) {
    reportPreflight();
    return 0;
  }

  mkdirSync(PATHS.ledgerDir, { recursive: true });

  const mode = wantsMock ? 'mock' : wantsControl ? 'control' : wantsPilot ? 'pilot' : 'full';
  const runsPerCell = wantsControl
    ? CONTROL_ARM.runsPerCell
    : wantsPilot ? PILOT.runsPerCell : RUNS_PER_CELL;
  const scenarioIds = wantsPilot ? PILOT.scenarioIds : null;
  // Control arm: ORIGINAL form only, repeated r=3 times.
  const formsOverride = wantsControl
    ? Array.from({ length: CONTROL_ARM.runsPerCell }, () => CONTROL_ARM.form)
    : null;
  const ledgerPath = resolve(PATHS.ledgerDir, `ledger-${mode}.jsonl`);
  const alreadyDone = loadLedger(ledgerPath);

  let mcp = null;
  let prefix = null;
  let adapterFor = null;
  let models = ROSTER;
  let mockScenarioIds = null;

  if (wantsMock) {
    const fixtureName = argv[mockIndex + 1];
    if (!fixtureName) {
      console.error('--mock requires a fixture filename under fixtures/');
      return 2;
    }
    const canned = loadCannedSet(fixtureName);
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

  let completed = 0;
  let failed = 0;

  try {
    for (const item of pending) {
      const model = wantsMock ? models[0] : modelById(item.modelId);
      const scenario = SCENARIOS.find((s) => s.id === item.scenarioId);
      const adapter = await adapterFor(model);

      let row;
      try {
        row = await executeRun({
          model, scenario, form: item.form, rep: item.rep, prefix, adapter, mcp,
          arm: wantsControl ? 'control' : 'primary'
        });
      } catch (error) {
        if (error instanceof SpendGuardError) {
          console.error(`\n${error.message}\n`);
          return 4;
        }
        throw error;
      }

      appendLedger(ledgerPath, row);
      if (row.error) failed += 1;
      completed += 1;

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
