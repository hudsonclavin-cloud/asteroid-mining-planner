// Slice 16 harness — Anthropic adapter (native tool calling).
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// !!! UNVERIFIED-ADAPTER-CONTRACT  !!!
//
// API SURFACE TARGETED: Messages API, `POST https://api.anthropic.com/v1/messages`,
// header `anthropic-version: 2023-06-01`. Tools declared as
// `tools: [{name, description, input_schema}]`; the model requests a call via a
// `{type:'tool_use', id, name, input}` block in `content` with
// `stop_reason: 'tool_use'`; results are returned as a USER message containing
// `{type:'tool_result', tool_use_id, content}` blocks.
//
// SPECIFIC UNCERTAINTIES (tripwire (k)):
//   1. `cache_control` PLACEMENT. Prompt caching is a DEC-16-7 design default, so
//      the system block is marked `{type:'ephemeral'}`. Whether the tools array
//      should ALSO carry a cache_control breakpoint (and whether marking both is
//      accepted) is unconfirmed. If the pilot rejects it, drop cache_control —
//      caching is an economy, not a measurement, and losing it costs money but
//      not validity.
//   2. MINIMUM CACHEABLE PREFIX. Caching has a minimum token threshold; whether
//      our system block alone clears it is unconfirmed. A cache that never hits
//      is a cost surprise, not a correctness problem.
//   3. TOOL-RESULT CONTENT TYPE. `content` is sent as a plain string. The API
//      also accepts an array of content blocks; the string form is the simpler
//      documented shape and is what is used here.
// The two Anthropic MODEL STRINGS are the only [Certain] entries in the roster,
// so unlike the other three adapters, model identity is not a suspect here.

import { assertLiveAllowed, SAMPLING } from '../config.mjs';
import { toAnthropicTools } from '../tool-schema.mjs';

export const PROVIDER = 'anthropic';
export const ENDPOINT = 'https://api.anthropic.com/v1/messages';
export const API_VERSION = '2023-06-01';
export const API_SURFACE = 'Messages API /v1/messages (tools / tool_use / tool_result)';
export const UNVERIFIED_CONTRACT = [
  'cache_control placement on the tools array (vs system only) unconfirmed',
  'minimum cacheable-prefix token threshold unconfirmed for this prefix size',
  'tool_result content sent as a plain string rather than a content-block array'
];

export function startSession({ model, prefix, userTurn, mcpTools }) {
  return {
    provider: PROVIDER,
    model,
    prefix,
    // Control arm (A4-5): `tools` ABSENT, not empty.
    tools: prefix.toolsAttached === false ? null : toAnthropicTools(mcpTools ?? prefix.tools ?? []),
    // Anthropic takes the system prompt out-of-band, so it never occupies a turn.
    system: [{ type: 'text', text: prefix.system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userTurn }]
  };
}

/** Pure — no network. Exposed so Task 4 can capture the exact wire body. */
export function buildRequestBody(session) {
  const body = {
    model: session.model.id,
    system: session.system,
    messages: session.messages,
    max_tokens: SAMPLING.maxOutputTokens
    // A8-1: NO temperature, NO top_p — provider defaults. This API rejected the
    // PAIR at A7-3; gpt-5.5 then rejected temperature 0 itself, so rather than
    // give OpenAI a different sampling config from everyone else, both params are
    // dropped roster-wide. Anthropic's runs were succeeding under temperature 0,
    // so this change is made for CROSS-MODEL COMPARABILITY, not because this
    // provider required it — the alternative confounds the primary contrast.
    // No seed parameter on this API; determinism is best-effort and disclosed
    // (DEC-16-7). Repetitions, not seeds, are the variance control.
  };
  if (session.tools !== null) body.tools = session.tools;
  return body;
}

export async function step(session, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  assertLiveAllowed(session.model, env); // hard spend guard, before any I/O

  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env[session.model.keyEnv],
      'anthropic-version': API_VERSION
    },
    body: JSON.stringify(buildRequestBody(session))
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '<unreadable>');
    throw new Error(`anthropic ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const content = Array.isArray(json?.content) ? json.content : [];

  // The assistant turn must be echoed back before tool results.
  session.messages.push({ role: 'assistant', content });

  const toolCalls = content
    .filter((block) => block?.type === 'tool_use')
    .map((block) => ({ id: block.id, name: block.name, args: block.input ?? {} }));

  return {
    text: content.filter((b) => b?.type === 'text').map((b) => b.text).join(''),
    toolCalls,
    stopReason: json?.stop_reason ?? null,
    usage: normalizeUsage(json?.usage),
    raw: json
  };
}

/**
 * Anthropic returns tool results inside a USER message. Consecutive results are
 * merged into one user turn, which is the documented shape when a single
 * assistant turn requested several tools at once.
 */
export function appendToolResult(session, toolCall, resultText) {
  const block = {
    type: 'tool_result',
    tool_use_id: toolCall.id,
    content: typeof resultText === 'string' ? resultText : JSON.stringify(resultText)
  };
  const last = session.messages[session.messages.length - 1];
  if (last?.role === 'user' && Array.isArray(last.content)) last.content.push(block);
  else session.messages.push({ role: 'user', content: [block] });
}

export function appendCapNotice(session, text) {
  session.messages.push({ role: 'user', content: text });
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { reported: false };
  return {
    reported: true,
    inputTokens: usage.input_tokens ?? null,
    outputTokens: usage.output_tokens ?? null,
    totalTokens:
      usage.input_tokens !== undefined && usage.output_tokens !== undefined
        ? usage.input_tokens + usage.output_tokens
        : null,
    cacheCreationInputTokens: usage.cache_creation_input_tokens ?? null,
    cachedInputTokens: usage.cache_read_input_tokens ?? null
  };
}
