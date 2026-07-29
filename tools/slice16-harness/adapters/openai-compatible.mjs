// Slice 16 harness — shared OpenAI-compatible Chat Completions core.
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// !!! UNVERIFIED-ADAPTER-CONTRACT — see each concrete adapter's header. !!!
//
// API SURFACE: Chat Completions (`POST /v1/chat/completions`) with the `tools` /
// `tool_calls` function-calling contract.
//
// WHY Chat Completions rather than the Responses API (A4-1 requires the choice
// be documented): DeepSeek exposes an OpenAI-COMPATIBLE Chat Completions
// endpoint, so choosing this surface lets two of the four providers share one
// implementation byte-for-byte. That maximises transport symmetry, which is
// exactly what A4-2 asks us to preserve where we can — every divergence we do
// not need is a confound we do not have to disclose. The Responses API would
// have forced a second, provider-specific code path for no measurement gain.

import { assertLiveAllowed, SAMPLING } from '../config.mjs';
import { toOpenAITools } from '../tool-schema.mjs';

/**
 * Builds an adapter over the Chat Completions surface.
 * The returned object is the provider-agnostic interface the runner drives:
 * startSession / buildRequestBody / step / appendToolResult.
 */
export function createOpenAICompatibleAdapter({ provider, endpoint, apiSurface, unverified }) {
  /** Opens a conversation. Tools are attached natively, never as system text. */
  function startSession({ model, prefix, userTurn, mcpTools }) {
    return {
      provider,
      model,
      prefix,
      // Control arm (A4-5): `tools` must be ABSENT, not an empty array.
      tools: prefix.toolsAttached === false ? null : toOpenAITools(mcpTools ?? prefix.tools ?? []),
      messages: [
        { role: 'system', content: prefix.system },
        { role: 'user', content: userTurn }
      ]
    };
  }

  /** Pure — no network. Exposed so Task 4 can capture the exact wire body. */
  function buildRequestBody(session) {
    const body = {
      model: session.model.id,
      messages: session.messages,
      temperature: SAMPLING.temperature,
      top_p: SAMPLING.top_p,
      max_tokens: SAMPLING.maxOutputTokens
    };
    if (SAMPLING.seed !== undefined) body.seed = SAMPLING.seed;
    if (session.tools !== null) body.tools = session.tools;
    return body;
  }

  async function step(session, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
    assertLiveAllowed(session.model, env); // hard spend guard, before any I/O

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env[session.model.keyEnv]}`
      },
      body: JSON.stringify(buildRequestBody(session))
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '<unreadable>');
      throw new Error(`${provider} ${response.status}: ${detail.slice(0, 500)}`);
    }

    const json = await response.json();
    const message = json?.choices?.[0]?.message ?? {};
    // The assistant turn (including its tool_calls) MUST be appended before any
    // tool results, or the follow-up request is malformed.
    session.messages.push(message);

    const toolCalls = (message.tool_calls ?? []).map((call) => ({
      id: call.id,
      name: call.function?.name,
      args: safeParseArgs(call.function?.arguments)
    }));

    return {
      text: message.content ?? '',
      toolCalls,
      stopReason: json?.choices?.[0]?.finish_reason ?? null,
      usage: normalizeUsage(json?.usage),
      raw: json
    };
  }

  /** Native tool-result turn: a `tool` role message keyed by tool_call_id. */
  function appendToolResult(session, toolCall, resultText) {
    session.messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: typeof resultText === 'string' ? resultText : JSON.stringify(resultText)
    });
  }

  /** Used when the tool-call cap is hit: ask for the final answer, no more tools. */
  function appendCapNotice(session, text) {
    session.messages.push({ role: 'user', content: text });
  }

  return {
    PROVIDER: provider,
    API_SURFACE: apiSurface,
    UNVERIFIED_CONTRACT: unverified,
    ENDPOINT: endpoint,
    startSession,
    buildRequestBody,
    step,
    appendToolResult,
    appendCapNotice
  };
}

function safeParseArgs(raw) {
  if (raw === null || raw === undefined) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    // A malformed argument string is the model's failure, not ours. Surface it
    // rather than silently substituting {} — the tool call will fail loudly.
    return { __unparseable_arguments__: String(raw).slice(0, 500) };
  }
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { reported: false };
  return {
    reported: true,
    inputTokens: usage.prompt_tokens ?? null,
    outputTokens: usage.completion_tokens ?? null,
    totalTokens: usage.total_tokens ?? null,
    cachedInputTokens: usage.prompt_tokens_details?.cached_tokens ?? usage.prompt_cache_hit_tokens ?? null
  };
}
