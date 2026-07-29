// Slice 16 harness — DeepSeek adapter (native tool calling).
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// !!! UNVERIFIED-ADAPTER-CONTRACT  !!!
//
// API SURFACE TARGETED: DeepSeek's OpenAI-compatible Chat Completions endpoint,
// `POST https://api.deepseek.com/chat/completions`, with the same `tools` /
// `tool_calls` contract as OpenAI. Implementation is byte-shared with the
// OpenAI adapter via openai-compatible.mjs — deliberately, so two of the four
// providers contribute zero transport divergence (A4-2).
//
// SPECIFIC UNCERTAINTIES (tripwire (k)):
//   1. MODEL STRING. `deepseek-v4-flash` is a Q3 LEAD. Q3's DeepSeek PRICING was
//      official-published; the model string was not.
//   2. TOOL-CALLING SUPPORT ON THIS MODEL. DeepSeek documents function calling
//      on its chat models, but whether this specific string supports `tools` is
//      unconfirmed. A model that ignores `tools` will silently return prose with
//      no tool_calls — which the runner records as `no_tool_call: true` and the
//      grader leaves UNGRADEABLE (A4-4). That is the designed outcome: it will
//      show up as a loud gap in the pilot, not as a fabricated pass.
//   3. `seed` ACCEPTANCE. Sent for parity with OpenAI; unconfirmed here.
// What would confirm: one successful pilot call, or DeepSeek's current API
// reference for the exact string.

import { createOpenAICompatibleAdapter } from './openai-compatible.mjs';

const adapter = createOpenAICompatibleAdapter({
  provider: 'deepseek',
  endpoint: 'https://api.deepseek.com/chat/completions',
  apiSurface: 'OpenAI-compatible Chat Completions /chat/completions (tools / tool_calls)',
  unverified: [
    'model string deepseek-v4-flash is a Q3 lead, not confirmed',
    'tool-calling support on this specific model string is unconfirmed',
    'seed acceptance unconfirmed'
  ]
});

export const PROVIDER = adapter.PROVIDER;
export const API_SURFACE = adapter.API_SURFACE;
export const UNVERIFIED_CONTRACT = adapter.UNVERIFIED_CONTRACT;
export const ENDPOINT = adapter.ENDPOINT;
export const { startSession, buildRequestBody, step, appendToolResult, appendCapNotice } = adapter;
