// Slice 16 harness — OpenAI adapter (native tool calling).
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// !!! STILL UNTESTED-AT-NETWORK-BOUNDARY — no SUCCESSFUL call yet !!!
//
// API SURFACE TARGETED: OpenAI Chat Completions, `POST /v1/chat/completions`,
// function calling via the `tools` request field and `choices[].message.tool_calls`
// in the response; tool results returned as `{role:'tool', tool_call_id, content}`.
// Rationale for this surface over the Responses API: see openai-compatible.mjs.
//
// STATUS OF THE FOUR REGISTERED UNCERTAINTIES after two pilot rounds. Each is
// marked with the evidence that settled it — and NOT settled further than the
// evidence reaches, which is the A8-3 lesson (a 400 only tells you about the
// parameter it names; everything validated AFTER it is still untested):
//
//   1. MODEL STRING `gpt-5.5` — CONFIRMED, two independent ways: present in
//      GET /v1/models (A7 metadata call), and round 2's 400 read "does not
//      support 0 WITH THIS MODEL", which requires the model to have been
//      resolved and its capabilities consulted. `gpt-5.5-mini` — REFUTED,
//      404 model_not_found; deferred in the roster, not silently swapped.
//   2. `seed` SUPPORT — STILL UNCONFIRMED. Neither 400 mentioned it, but that
//      is NOT acceptance: a 400 returns on the first fault found, so every
//      parameter validated after the named one remains untested. Kept, because
//      determinism is already disclosed as best-effort and repetitions are the
//      real variance control. If round 3 400s on `seed`, drop it.
//   3. `max_tokens` vs `max_completion_tokens` — RESOLVED. Round 1 rejected
//      `max_tokens` and named `max_completion_tokens` as the replacement; round 2
//      sent that and the complaint moved on to a different parameter.
//   4. TEMPERATURE — REFUTED, and the reason this adapter's header was right to
//      list it. Round 2: 400 "Unsupported value: 'temperature' does not support
//      0 with this model". A8-1 drops temperature for the WHOLE roster rather
//      than only here, so the sampling config stays uniform and the cross-model
//      contrast stays unconfounded. See SAMPLING in config.mjs.
//
// What is still needed: ONE SUCCESSFUL CALL. Nothing below the temperature fault
// has ever been exercised on this provider — tools, tool_calls, the tool-result
// turn shape and the answer contract are all still unproven here.

import { createOpenAICompatibleAdapter } from './openai-compatible.mjs';

const adapter = createOpenAICompatibleAdapter({
  provider: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiSurface: 'Chat Completions /v1/chat/completions (tools / tool_calls)',
  unverified: [
    'seed acceptance STILL UNCONFIRMED — no 400 named it, but a 400 stops at the first fault, so later-validated params remain untested',
    'tools / tool_calls / tool-result turn shape NEVER EXERCISED — every pilot call failed before reaching them'
  ]
});

export const PROVIDER = adapter.PROVIDER;
export const API_SURFACE = adapter.API_SURFACE;
export const UNVERIFIED_CONTRACT = adapter.UNVERIFIED_CONTRACT;
export const ENDPOINT = adapter.ENDPOINT;
export const { startSession, buildRequestBody, step, appendToolResult, appendCapNotice } = adapter;
