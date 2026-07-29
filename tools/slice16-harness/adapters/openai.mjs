// Slice 16 harness — OpenAI adapter (native tool calling).
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// !!! UNVERIFIED-ADAPTER-CONTRACT  !!!
//
// API SURFACE TARGETED: OpenAI Chat Completions, `POST /v1/chat/completions`,
// function calling via the `tools` request field and `choices[].message.tool_calls`
// in the response; tool results returned as `{role:'tool', tool_call_id, content}`.
// Rationale for this surface over the Responses API: see openai-compatible.mjs.
//
// SPECIFIC UNCERTAINTIES (tripwire (k)) — each is a place a 400 could originate:
//   1. MODEL STRING. `gpt-5.5` / `gpt-5.5-mini` come from Q3 research and are
//      LEADS, not confirmed. If either is wrong the call fails before tools
//      matter. Confirm against the models endpoint first.
//   2. `seed` SUPPORT. Sent because Chat Completions has historically accepted
//      it for best-effort determinism (DEC-16-7). If this model family rejects
//      or ignores it, drop the field — determinism is already disclosed as
//      best-effort and repetitions are the real variance control.
//   3. `max_tokens` vs `max_completion_tokens`. Newer OpenAI model families have
//      moved to `max_completion_tokens` and reject `max_tokens`. WHICH ONE
//      `gpt-5.5` WANTS IS UNCONFIRMED. If the pilot 400s on an unknown/unsupported
//      parameter, this is the first thing to change.
//   4. TEMPERATURE. Some newer families accept only the default temperature and
//      reject `temperature: 0`. Unconfirmed for this string.
// What would confirm all four: one successful pilot call, or the provider's
// current model-reference page for the exact string.

import { createOpenAICompatibleAdapter } from './openai-compatible.mjs';

const adapter = createOpenAICompatibleAdapter({
  provider: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiSurface: 'Chat Completions /v1/chat/completions (tools / tool_calls)',
  unverified: [
    'model string gpt-5.5 / gpt-5.5-mini is a Q3 lead, not confirmed',
    'seed acceptance unconfirmed for this model family',
    'max_tokens vs max_completion_tokens unconfirmed for this model family',
    'temperature:0 acceptance unconfirmed for this model family'
  ]
});

export const PROVIDER = adapter.PROVIDER;
export const API_SURFACE = adapter.API_SURFACE;
export const UNVERIFIED_CONTRACT = adapter.UNVERIFIED_CONTRACT;
export const ENDPOINT = adapter.ENDPOINT;
export const { startSession, buildRequestBody, step, appendToolResult, appendCapNotice } = adapter;
