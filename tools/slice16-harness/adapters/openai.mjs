// Slice 16 harness — OpenAI provider adapter.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// No request in this file has ever been executed against the live API. The
// request/response shapes below are written from the documented Chat Completions
// contract but have NOT been confirmed on the wire, because this session was
// prohibited from making paid calls. The pilot (DEC-16-11) is what tests it.
// Treat any 4xx from this adapter as an adapter bug first, a model-string
// problem second.
//
// Dependencies: none. Uses global fetch (Node >= 18).

import { assertLiveAllowed, SAMPLING } from '../config.mjs';

export const PROVIDER = 'openai';
export const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * @param {{model: object, prefix: object, userTurn: string, priorTurns?: Array, env?: object, fetchImpl?: Function}} args
 * @returns {Promise<{text: string, usage: object, raw: object}>}
 */
export async function complete({ model, prefix, userTurn, priorTurns = [], env = process.env, fetchImpl = globalThis.fetch }) {
  assertLiveAllowed(model, env); // hard spend guard — throws before any network I/O

  const messages = [
    { role: 'system', content: prefix.system },
    // Tool schemas are carried in the system position as a stable text block so
    // the cacheable prefix is byte-identical across providers. The study grades
    // answer faithfulness, not native tool-calling ergonomics.
    // Control arm attaches no tools: omit the block entirely rather than
    // sending an empty one, so the model is never told tools exist (A1 §10.2).
    ...(prefix.toolsAttached === false
      ? []
      : [{ role: 'system', content: `Available tools (JSON schema):\n${prefix.toolsSerialized}` }]),
    ...priorTurns,
    { role: 'user', content: userTurn }
  ];

  const body = {
    model: model.id,
    messages,
    temperature: SAMPLING.temperature,
    top_p: SAMPLING.top_p,
    max_tokens: SAMPLING.maxOutputTokens,
    seed: SAMPLING.seed
  };

  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env[model.keyEnv]}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '<unreadable>');
    throw new Error(`openai ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  return {
    text,
    usage: normalizeUsage(json?.usage),
    raw: json
  };
}

/** Provider-reported usage — replaces the chars/4 est-tok heuristic (DEC-16-13). */
function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { reported: false };
  return {
    reported: true,
    inputTokens: usage.prompt_tokens ?? null,
    outputTokens: usage.completion_tokens ?? null,
    totalTokens: usage.total_tokens ?? null,
    cachedInputTokens: usage.prompt_tokens_details?.cached_tokens ?? null
  };
}
