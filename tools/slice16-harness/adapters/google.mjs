// Slice 16 harness — Google (Gemini) provider adapter.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// Never executed against the live API in this session (paid calls prohibited).
// Shapes follow the documented generateContent contract but are unconfirmed on
// the wire. The pilot (DEC-16-11) is the first real test. The model string
// `gemini-3.1-pro` is a Q3 LEAD, not verified — confirm it before spending.
//
// Dependencies: none. Uses global fetch (Node >= 18).

import { assertLiveAllowed, SAMPLING } from '../config.mjs';

export const PROVIDER = 'google';
export const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function complete({ model, prefix, userTurn, priorTurns = [], env = process.env, fetchImpl = globalThis.fetch }) {
  assertLiveAllowed(model, env); // hard spend guard — throws before any network I/O

  const contents = [
    ...priorTurns,
    { role: 'user', parts: [{ text: userTurn }] }
  ];

  const body = {
    systemInstruction: {
      parts: [
        { text: prefix.system },
        { text: `Available tools (JSON schema):\n${prefix.toolsSerialized}` }
      ]
    },
    contents,
    generationConfig: {
      temperature: SAMPLING.temperature,
      topP: SAMPLING.top_p,
      maxOutputTokens: SAMPLING.maxOutputTokens
      // No seed on this API; determinism best-effort and disclosed (DEC-16-7).
    }
  };

  const url = `${ENDPOINT_BASE}/${encodeURIComponent(model.id)}:generateContent`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': env[model.keyEnv]
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '<unreadable>');
    throw new Error(`google ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const parts = json?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p) => p?.text ?? '').join('') : '';

  return { text, usage: normalizeUsage(json?.usageMetadata), raw: json };
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { reported: false };
  return {
    reported: true,
    inputTokens: usage.promptTokenCount ?? null,
    outputTokens: usage.candidatesTokenCount ?? null,
    totalTokens: usage.totalTokenCount ?? null,
    cachedInputTokens: usage.cachedContentTokenCount ?? null
  };
}
