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
//   node runner.mjs --full                 # full matrix (needs S16_LIVE_OK=1 + keys)
//   node runner.mjs --mock <fixture.json>  # offline end-to-end, no keys, no spend
//
// The harness NEVER sets S16_LIVE_OK or any API key. Both are Hudson's act.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ACTIVE_SCENARIOS, DEFERRED_SCENARIOS, STRUCK_SCENARIOS, SCENARIOS,
  MARKER, PATHS, PILOT, ROSTER, RUNS_PER_CELL,
  SpendGuardError, expandForms, liveReadiness, modelById
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
export function buildPlan({ scenarioIds = null, runsPerCell = RUNS_PER_CELL, models = ROSTER } = {}) {
  const pool = scenarioIds
    ? SCENARIOS.filter((s) => scenarioIds.includes(s.id))
    : ACTIVE_SCENARIOS;
  const forms = expandForms(runsPerCell);
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
async function executeRun({ model, scenario, form, rep, prefix, adapter, mcp }) {
  const startedAt = new Date().toISOString();
  const row = {
    marker: MARKER,
    runKey: runKey({ modelId: model.id, scenarioId: scenario.id, form, rep }),
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
    const reply = await adapter.complete({ model, prefix, userTurn, scenario, form });
    const extracted = extractAnswerBlock(reply.text);

    row.replyText = reply.text;
    row.usage = reply.usage ?? { reported: false };
    row.answerBlock = extracted.block;
    row.answerBlockOk = extracted.ok;
    row.answerBlockReason = extracted.reason;
    row.finishedAt = new Date().toISOString();
    row.error = null;
  } catch (error) {
    row.finishedAt = new Date().toISOString();
    row.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    row.replyText = null;
    row.answerBlock = null;
    row.answerBlockOk = false;
  }

  return row;
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
  console.log(`    active   : ${ACTIVE_SCENARIOS.length}  -> ${ACTIVE_SCENARIOS.length * ROSTER.length * RUNS_PER_CELL} runs at r=${RUNS_PER_CELL}, k=${ROSTER.length}`);
  console.log(`    deferred : ${DEFERRED_SCENARIOS.length}  (${DEFERRED_SCENARIOS.map((s) => s.id).join(', ')})`);
  console.log(`    struck   : ${STRUCK_SCENARIOS.length}  (${STRUCK_SCENARIOS.map((s) => s.id).join(', ')})`);
  console.log(`  MCP server built: ${existsSync(PATHS.mcpServer) ? 'yes' : 'NO — cd mcp && npm install && npm run build'}`);
  if (!readiness.liveOk) {
    console.log('\nNo spend is possible in this state. This is the default and is correct.');
  }
}

export async function main(argv = process.argv.slice(2)) {
  const wantsPreflight = argv.includes('--preflight') || argv.length === 0;
  const wantsPilot = argv.includes('--pilot');
  const wantsFull = argv.includes('--full');
  const mockIndex = argv.indexOf('--mock');
  const wantsMock = mockIndex !== -1;

  if (wantsPreflight && !wantsPilot && !wantsFull && !wantsMock) {
    reportPreflight();
    return 0;
  }

  mkdirSync(PATHS.ledgerDir, { recursive: true });

  const mode = wantsMock ? 'mock' : wantsPilot ? 'pilot' : 'full';
  const runsPerCell = wantsPilot ? PILOT.runsPerCell : RUNS_PER_CELL;
  const scenarioIds = wantsPilot ? PILOT.scenarioIds : null;
  const ledgerPath = resolve(PATHS.ledgerDir, `ledger-${mode}.jsonl`);
  const alreadyDone = loadLedger(ledgerPath);

  let mcp = null;
  let prefix = null;
  let adapterFor = null;
  let models = ROSTER;

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
    // Offline: no server, so the prefix carries an empty tool list. The prefix
    // fingerprint still proves stability across the mock run.
    prefix = buildPrefix({ tools: [] });
    prefix.fingerprint = prefixFingerprint(prefix);
  } else {
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

  const plan = buildPlan({ scenarioIds, runsPerCell, models });
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
        row = await executeRun({ model, scenario, form: item.form, rep: item.rep, prefix, adapter, mcp });
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
