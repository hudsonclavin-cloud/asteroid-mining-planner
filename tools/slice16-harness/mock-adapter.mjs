// Slice 16 harness — offline tool-calling mock adapter.
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// Implements the same session interface as the four live adapters
// (startSession / buildRequestBody / step / appendToolResult / appendCapNotice),
// but the "model" is a committed script instead of a provider. Tool calls it
// emits are executed by the runner against the LIVE local MCP server, so the
// envelopes flowing back are real — only the model text is canned.
//
// This is the substitute for live testing (A4-3 proof): it exercises the whole
// loop — tool-call emission, real envelope capture, ledger recording, grading —
// with no keys, no network, and no spend.
//
// It deliberately does NOT call assertLiveAllowed: it never reaches a provider,
// so gating it would only make the offline proof impossible to run.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PATHS } from './config.mjs';
import { extractEnvelope } from './mcp-client.mjs';

export const PROVIDER = 'mock';
export const API_SURFACE = 'offline script (no provider)';
export const UNVERIFIED_CONTRACT = [];

export function loadCannedSet(fileName) {
  return JSON.parse(readFileSync(resolve(PATHS.fixturesDir, fileName), 'utf8'));
}

/**
 * Script shape, per scenario and prompt form:
 *   { toolCalls: [{name, args}], finalMode: 'faithful'|'prose-fabricate'|'verbatim',
 *     final?: "<literal reply>", fabricate?: {label, value, units} }
 * `finalMode: 'faithful'` builds the answer FROM the envelopes actually received,
 * so a fixture never hard-codes a value that could drift from the live server.
 */
export function createMockAdapter(cannedSet) {
  function scriptFor(scenarioId, form) {
    const perScenario = cannedSet?.scripts?.[scenarioId];
    if (perScenario === undefined) {
      throw new Error(`mock-adapter: no script for scenario ${scenarioId} in set "${cannedSet?.name}"`);
    }
    const script = perScenario[form] ?? perScenario.ANY;
    if (script === undefined) {
      throw new Error(`mock-adapter: no script for ${scenarioId}/${form} in set "${cannedSet?.name}"`);
    }
    return script;
  }

  function startSession({ model, prefix, userTurn, scenario, form }) {
    return {
      provider: PROVIDER,
      model,
      prefix,
      userTurn,
      scenarioId: scenario.id,
      form,
      script: scriptFor(scenario.id, form),
      // Control arm: the mock honours toolsAttached exactly as a live adapter would.
      toolsAttached: prefix.toolsAttached !== false,
      results: [],
      emitted: false,
      capped: false
    };
  }

  function buildRequestBody(session) {
    return { mock: true, scenario: session.scenarioId, form: session.form, toolsAttached: session.toolsAttached };
  }

  async function step(session) {
    const wantsTools = session.toolsAttached && Array.isArray(session.script.toolCalls) && session.script.toolCalls.length > 0;
    if (wantsTools && !session.emitted) {
      session.emitted = true;
      return {
        text: '',
        toolCalls: session.script.toolCalls.map((call, index) => ({
          id: `mock-${session.scenarioId}-${index}`,
          name: call.name,
          args: call.args ?? {}
        })),
        stopReason: 'tool_calls',
        usage: { reported: false, mock: true },
        raw: { mock: true }
      };
    }
    return {
      text: buildFinal(session),
      toolCalls: [],
      stopReason: 'stop',
      usage: { reported: false, mock: true },
      raw: { mock: true }
    };
  }

  function appendToolResult(session, toolCall, resultText) {
    let parsed = null;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      parsed = null;
    }
    session.results.push({ toolCall, envelope: parsed ? extractEnvelope(parsed) : null });
  }

  function appendCapNotice(session) {
    session.capped = true;
  }

  return {
    PROVIDER, API_SURFACE, UNVERIFIED_CONTRACT,
    startSession, buildRequestBody, step, appendToolResult, appendCapNotice
  };
}

// ---------------------------------------------------------------------------
// Final-answer construction
// ---------------------------------------------------------------------------

function block(obj) {
  return `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
}

function collectLeaves(value, out = []) {
  if (value === null || typeof value !== 'object') return out;
  if (typeof value.value === 'number' && typeof value.units === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) value.forEach((v) => collectLeaves(v, out));
  else Object.values(value).forEach((v) => collectLeaves(v, out));
  return out;
}

function buildFinal(session) {
  const script = session.script;
  if (script.finalMode === 'verbatim') return script.final ?? '';

  const envelopes = session.results.map((r) => r.envelope).filter(Boolean);
  const first = envelopes[0] ?? null;
  const sources = [...new Set(envelopes.flatMap((e) => (e.provenance ?? []).map((p) => p.id).filter(Boolean)))];
  const assumptions = [...new Set(envelopes.flatMap((e) => e.assumptions ?? []))];
  // An honest answer states the WEAKEST link across the evidence it used
  // (DEC-15-4 (b)), not the first envelope's class.
  const order = { assumed: 0, derived: 1, measured: 2 };
  const confidence = envelopes
    .map((e) => e.confidence)
    .filter(Boolean)
    .reduce((min, c) => (min === null || (order[c] ?? 99) < (order[min] ?? 99) ? c : min), null) ?? 'derived';

  if (script.finalMode === 'prose-fabricate') {
    // The A3/PF2 class: relay the refusal faithfully, then invent a number in
    // the narrative only. values_used stays empty.
    const refusal = envelopes.find((e) => e.refusal)?.refusal ?? null;
    const f = script.fabricate ?? { label: 'payload', value: 1200, units: 'kg' };
    const prose = refusal
      ? `The tool declined with ${refusal.code}: ${refusal.reason} ${refusal.what_would_help} ` +
        `That said, the ${f.label} would be about ${f.value} ${f.units}.`
      : `The ${f.label} is about ${f.value} ${f.units}.`;
    return `${prose}\n\n${block({
      answer: prose,
      values_used: [],
      refusal_status: refusal
        ? { present: true, code: refusal.code, what_would_help: refusal.what_would_help }
        : { present: false, code: null, what_would_help: null },
      sources_cited: sources,
      assumptions_acknowledged: assumptions,
      confidence_stated: confidence
    })}`;
  }

  // finalMode: 'faithful' — answer built FROM the real envelopes received.
  const refusal = envelopes.find((e) => e.refusal)?.refusal ?? null;
  if (refusal) {
    const prose = `The tool declined with ${refusal.code}: ${refusal.reason} ${refusal.what_would_help}`;
    return `${prose}\n\n${block({
      answer: prose,
      values_used: [],
      refusal_status: { present: true, code: refusal.code, what_would_help: refusal.what_would_help },
      sources_cited: sources,
      assumptions_acknowledged: assumptions,
      confidence_stated: confidence
    })}`;
  }

  const wanted = new Set(script.reportLeaves ?? []);
  const values = [];
  const sentences = [];
  for (const envelope of envelopes) {
    for (const [key, node] of walkNamed(envelope.value)) {
      if (wanted.size > 0 && !wanted.has(key)) continue;
      values.push({ name: key, value: node.value, units: node.units });
      sentences.push(`The ${script.labels?.[key] ?? key} is ${node.value} ${node.units}.`);
    }
  }
  const prose = sentences.length > 0 ? sentences.join(' ') : 'The tool returned a record with no numeric leaf requested.';
  return `${prose}\n\n${block({
    answer: prose,
    values_used: values,
    refusal_status: { present: false, code: null, what_would_help: null },
    sources_cited: sources,
    assumptions_acknowledged: assumptions,
    confidence_stated: confidence
  })}`;
}

/** Yields [leafName, quantityNode] for every Quantity leaf in an envelope value. */
function* walkNamed(value, name = null) {
  if (value === null || typeof value !== 'object') return;
  if (typeof value.value === 'number' && typeof value.units === 'string') {
    if (name) yield [name, value];
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) yield* walkNamed(item, name);
    return;
  }
  for (const [key, child] of Object.entries(value)) yield* walkNamed(child, key);
}

export { collectLeaves };
