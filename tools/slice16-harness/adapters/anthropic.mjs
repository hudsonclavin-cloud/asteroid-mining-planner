// Slice 16 harness — Anthropic provider adapter.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// Never executed against the live API in this session (paid calls prohibited).
// Shapes follow the documented Messages API contract but are unconfirmed on the
// wire. The pilot (DEC-16-11) is the first real test.
//
// Dependencies: none. Uses global fetch (Node >= 18).

import { assertLiveAllowed, SAMPLING } from '../config.mjs';

export const PROVIDER = 'anthropic';
export const ENDPOINT = 'https://api.anthropic.com/v1/messages';
export const API_VERSION = '2023-06-01';

export async function complete({ model, prefix, userTurn, priorTurns = [], env = process.env, fetchImpl = globalThis.fetch }) {
  assertLiveAllowed(model, env); // hard spend guard — throws before any network I/O

  // Anthropic takes the system prompt out-of-band. cache_control marks the
  // stable prefix so DEC-16-7's caching default is actually exercised rather
  // than merely intended.
  // Control arm attaches no tools: omit the block entirely rather than sending
  // an empty one, so the model is never told tools exist (A1 §10.2).
  const system = prefix.toolsAttached === false
    ? [{ type: 'text', text: prefix.system, cache_control: { type: 'ephemeral' } }]
    : [
        { type: 'text', text: prefix.system },
        {
          type: 'text',
          text: `Available tools (JSON schema):\n${prefix.toolsSerialized}`,
          cache_control: { type: 'ephemeral' }
        }
      ];

  const messages = [...priorTurns, { role: 'user', content: userTurn }];

  const body = {
    model: model.id,
    system,
    messages,
    max_tokens: SAMPLING.maxOutputTokens,
    temperature: SAMPLING.temperature,
    top_p: SAMPLING.top_p
    // No seed parameter on this API; determinism is best-effort and disclosed
    // (DEC-16-7). Repetitions, not seeds, are the variance control.
  };

  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env[model.keyEnv],
      'anthropic-version': API_VERSION
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '<unreadable>');
    throw new Error(`anthropic ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const text = Array.isArray(json?.content)
    ? json.content.filter((b) => b?.type === 'text').map((b) => b.text).join('')
    : '';

  return { text, usage: normalizeUsage(json?.usage), raw: json };
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
