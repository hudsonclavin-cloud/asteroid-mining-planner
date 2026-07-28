// Slice 16 harness — DeepSeek provider adapter.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// Never executed against the live API in this session (paid calls prohibited).
// DeepSeek exposes an OpenAI-compatible Chat Completions surface; shapes follow
// that contract but are unconfirmed on the wire. The model string
// `deepseek-v4-flash` is a Q3 LEAD — confirm before spending. (DeepSeek pricing
// was the one official-published set in Q3; the model string was not.)
//
// Dependencies: none. Uses global fetch (Node >= 18).

import { assertLiveAllowed, SAMPLING } from '../config.mjs';

export const PROVIDER = 'deepseek';
export const ENDPOINT = 'https://api.deepseek.com/chat/completions';

export async function complete({ model, prefix, userTurn, priorTurns = [], env = process.env, fetchImpl = globalThis.fetch }) {
  assertLiveAllowed(model, env); // hard spend guard — throws before any network I/O

  const messages = [
    { role: 'system', content: prefix.system },
    { role: 'system', content: `Available tools (JSON schema):\n${prefix.toolsSerialized}` },
    ...priorTurns,
    { role: 'user', content: userTurn }
  ];

  const body = {
    model: model.id,
    messages,
    temperature: SAMPLING.temperature,
    top_p: SAMPLING.top_p,
    max_tokens: SAMPLING.maxOutputTokens,
    stream: false
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
    throw new Error(`deepseek ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  return { text, usage: normalizeUsage(json?.usage), raw: json };
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { reported: false };
  return {
    reported: true,
    inputTokens: usage.prompt_tokens ?? null,
    outputTokens: usage.completion_tokens ?? null,
    totalTokens: usage.total_tokens ?? null,
    cachedInputTokens: usage.prompt_cache_hit_tokens ?? null
  };
}
