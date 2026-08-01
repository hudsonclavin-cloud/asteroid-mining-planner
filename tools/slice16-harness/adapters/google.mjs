// Slice 16 harness — Google (Gemini) adapter (native tool calling).
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// !!! UNVERIFIED-ADAPTER-CONTRACT  !!!
//
// API SURFACE TARGETED: Generative Language API,
// `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`,
// key in the `x-goog-api-key` header. Tools declared as
// `tools: [{functionDeclarations: [{name, description, parameters}]}]`; the model
// requests a call via a `functionCall: {name, args}` part; results are returned
// as a part `{functionResponse: {name, response}}`.
//
// THIS IS THE ONE ADAPTER WHERE TOOL-SCHEMA CONTENT CANNOT BE HELD IDENTICAL.
// Google's `parameters` follows a restricted OpenAPI-3.0 Schema subset, so the
// MCP server's draft-07 schema is PROJECTED DOWN (see tool-schema.mjs). Every
// dropped keyword is enumerated in the A4 report rather than normalised away.
// Semantic content — tool name, description, parameter names, types, enums and
// the required-set — is preserved and asserted identical across all providers.
//
// SPECIFIC UNCERTAINTIES (tripwire (k)):
//   1. MODEL STRING — RESOLVED BY A8-2. `gemini-3.1-pro` was REFUTED (round-2
//      pilot 404; absent from ListModels). The string is now
//      `gemini-3.1-pro-preview`, version `3.1-pro-preview-01-2026`, taken from a
//      live ListModels response that shows it supports `generateContent`.
//
//      WHY NOT THE OTHER CANDIDATES, all of which were present and would have
//      worked — the choice is a measurement decision, not a convenience one:
//        * `gemini-3.1-pro-preview-customtools` — described by the provider as
//          "optimized for custom tool usage". REJECTED: this study measures how
//          faithfully a model carries TOOL EVIDENCE into its answer. A variant
//          specifically tuned for tool use would make the Google cell a
//          different instrument from the other five, confounding the primary
//          contrast with a tuning difference. It would likely have SCORED
//          BETTER, which is exactly why it must not be chosen.
//        * `gemini-pro-latest` — REJECTED: a moving alias. A pre-registered study
//          needs a frozen instrument; an alias can be repointed mid-run and the
//          ledger would not show it.
//        * `gemini-3-pro-preview` / `gemini-2.5-pro` — REJECTED: earlier
//          generations. The registered slot is the Google FRONTIER model, and
//          3.1-pro-preview is the current frontier of that line.
//
//      WHAT THIS EVIDENCE DOES *NOT* ESTABLISH: presence in ListModels with
//      `generateContent` proves the string RESOLVES. It does not prove function
//      calling works, nor that the schema projection, the functionResponse role
//      or the response shape below are right. Those still need one live call.
//   2. functionResponse ROLE. The tool-result part is sent on a `user` turn.
//      Some versions of this API document/accept a `function` role instead.
//      WHICH ONE THIS VERSION WANTS IS UNCONFIRMED — if the pilot 400s on an
//      invalid role, this is the first thing to change.
//   3. `response` SHAPE. `functionResponse.response` is sent as an OBJECT
//      (`{result: <envelope JSON string>}`) because the field is documented as a
//      struct, not a bare string. Whether a bare string is also accepted is
//      unconfirmed.
//   4. SCHEMA SUBSET BOUNDARY. Exactly which draft-07 keywords this version
//      rejects is unconfirmed; the projection keeps only the documented subset
//      (type, format, description, nullable, enum, properties, required, items).
//      If it turns out to accept more, the projection is merely conservative —
//      it never adds meaning, only removes constraints.
//   5. API VERSION. `v1beta` is targeted because function calling has lived
//      there; whether this model requires `v1` is unconfirmed.
// What would confirm all five: one successful pilot call.

import { assertLiveAllowed, SAMPLING } from '../config.mjs';
import { toGoogleTools } from '../tool-schema.mjs';

export const PROVIDER = 'google';
export const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const API_SURFACE = 'Generative Language v1beta :generateContent (functionDeclarations / functionCall / functionResponse)';
export const UNVERIFIED_CONTRACT = [
  'model string gemini-3.1-pro-preview resolves (present in ListModels, supports generateContent) but has NEVER completed a call — function-calling support unproven',
  'functionResponse turn sent with role "user"; some versions expect role "function"',
  'functionResponse.response sent as an object {result: "..."}; bare-string acceptance unconfirmed',
  'exact draft-07 keyword subset accepted by this version is unconfirmed (projection is conservative)',
  'v1beta targeted; whether this model requires v1 is unconfirmed'
];

export function startSession({ model, prefix, userTurn, turns = null, mcpTools }) {
  const attached = prefix.toolsAttached === false
    ? { tools: null, dropped: [] }
    : toGoogleTools(mcpTools ?? prefix.tools ?? []);
  // DD-3: `turns` carries the full ordered conversation. This API names the
  // assistant role "model", so roles are mapped rather than copied.
  const conversation = turns ?? [{ role: 'user', content: userTurn }];
  return {
    provider: PROVIDER,
    model,
    prefix,
    // Control arm (A4-5): `tools` ABSENT, not empty.
    tools: attached.tools,
    // Recorded so the A4 report can enumerate exactly what the projection removed.
    droppedSchemaKeywords: attached.dropped,
    systemInstruction: { parts: [{ text: prefix.system }] },
    contents: conversation.map((t) => ({
      role: t.role === 'assistant' ? 'model' : t.role,
      parts: [{ text: t.content }]
    }))
  };
}

/** Pure — no network. Exposed so Task 4 can capture the exact wire body. */
export function buildRequestBody(session) {
  const body = {
    systemInstruction: session.systemInstruction,
    contents: session.contents,
    generationConfig: {
      // A8-1: NO temperature, NO topP — provider defaults, uniformly across the
      // roster. See SAMPLING in config.mjs for the three-step amendment chain.
      maxOutputTokens: SAMPLING.maxOutputTokens
      // No seed on this API; determinism best-effort and disclosed (DEC-16-7).
    }
  };
  if (session.tools !== null) body.tools = session.tools;
  return body;
}

export async function step(session, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  assertLiveAllowed(session.model, env); // hard spend guard, before any I/O

  const url = `${ENDPOINT_BASE}/${encodeURIComponent(session.model.id)}:generateContent`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env[session.model.keyEnv] },
    body: JSON.stringify(buildRequestBody(session))
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '<unreadable>');
    throw new Error(`google ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];

  // Echo the model turn back before appending any functionResponse.
  session.contents.push({ role: 'model', parts });

  const toolCalls = parts
    .filter((part) => part?.functionCall)
    .map((part, index) => ({
      // This API does not issue tool-call ids; synthesise a stable one so the
      // ledger can correlate call -> envelope in order.
      id: `${part.functionCall.name}#${session.contents.length}-${index}`,
      name: part.functionCall.name,
      args: part.functionCall.args ?? {}
    }));

  return {
    text: parts.filter((p) => typeof p?.text === 'string').map((p) => p.text).join(''),
    toolCalls,
    stopReason: json?.candidates?.[0]?.finishReason ?? null,
    usage: normalizeUsage(json?.usageMetadata),
    raw: json
  };
}

export function appendToolResult(session, toolCall, resultText) {
  const part = {
    functionResponse: {
      name: toolCall.name,
      // Documented as a struct, so the envelope JSON is wrapped rather than sent bare.
      response: { result: typeof resultText === 'string' ? resultText : JSON.stringify(resultText) }
    }
  };
  const last = session.contents[session.contents.length - 1];
  if (last?.role === 'user' && Array.isArray(last.parts) && last.parts.some((p) => p.functionResponse)) {
    last.parts.push(part);
  } else {
    session.contents.push({ role: 'user', parts: [part] });
  }
}

export function appendCapNotice(session, text) {
  // 4.4 (S16-REMEDIATE): merge into a trailing user turn rather than emitting
  // consecutive user turns — same protocol-validity reasoning as the Anthropic
  // adapter; the cap path was never exercised on this provider either.
  const last = session.contents[session.contents.length - 1];
  if (last?.role === 'user' && Array.isArray(last.parts)) {
    last.parts.push({ text });
    return;
  }
  session.contents.push({ role: 'user', parts: [{ text }] });
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
