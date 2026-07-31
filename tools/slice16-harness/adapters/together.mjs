// Slice 16 harness — Together.ai adapter (native tool calling).
// MARKER: S16-AMEND-A6-2026-07-30-A
//
// !!! UNTESTED-AT-NETWORK-BOUNDARY !!!
// !!! UNVERIFIED-ADAPTER-CONTRACT  !!!
//
// ROSTER SUBSTITUTION (A6 / R-A6-3): this adapter replaces DeepSeek in the
// open-weight slot. DeepSeek is dropped for jurisdiction reasons; Together.ai
// hosts open-weight models in US jurisdiction. k=6 is unchanged — six models,
// four labs — with this slot's "lab" becoming Together-hosted-open-weight.
// `adapters/deepseek.mjs` is RETIRED-NOT-DELETED: it remains on disk and
// unreferenced so the substitution stays reversible and the record complete.
//
// API SURFACE TARGETED: Together's OpenAI-COMPATIBLE Chat Completions endpoint,
// `POST https://api.together.xyz/v1/chat/completions`, bearer auth, with the
// same `tools` / `tool_calls` function-calling contract as OpenAI. The
// implementation is byte-shared with the OpenAI adapter through
// openai-compatible.mjs, deliberately: an OpenAI-compatible provider should
// contribute zero transport divergence beyond its base URL (A4-2).
//
// SPECIFIC UNCERTAINTIES (tripwire (k)):
//   1. MODEL STRING IS **PENDING** — see below. This is the blocking one.
//   2. TOOL-CALLING SUPPORT IS PER-MODEL on Together. Open-weight models vary in
//      whether the served endpoint implements `tools`/`tool_calls` at all. A
//      model that ignores `tools` returns prose with no tool calls, which the
//      runner records as `no_tool_call: true` and the grader leaves UNGRADEABLE
//      (A4-4) — loud, never a fabricated pass. Confirm tool support for the
//      chosen model before the full run.
//   3. `seed` acceptance unconfirmed on this surface.
//   4. Whether Together requires or ignores `max_tokens` vs any alternative
//      field for the chosen model is unconfirmed.
//
// MODEL STRING — **PENDING, DELIBERATELY NOT INVENTED** (tripwire (i)):
// Together model ids take the form `org/Model-Name`, e.g. the historically
// documented `meta-llama/Llama-3.3-70B-Instruct-Turbo`,
// `Qwen/Qwen2.5-72B-Instruct-Turbo`, `deepseek-ai/DeepSeek-V3`. Those are cited
// ONLY to show the id FORMAT — none is verified as current, and no current
// Together model string could be established from documentation available here.
// The roster therefore carries the sentinel below. Hudson fills it from
// Together's live model list; the sentinel is chosen to fail loudly rather than
// silently call something wrong.

import { createOpenAICompatibleAdapter } from './openai-compatible.mjs';

/** Sentinel — replace with a real id from Together's model list before the pilot. */
export const MODEL_STRING_PENDING = 'PENDING-SET-TOGETHER-MODEL-STRING';

const adapter = createOpenAICompatibleAdapter({
  provider: 'together',
  endpoint: 'https://api.together.xyz/v1/chat/completions',
  apiSurface: 'OpenAI-compatible Chat Completions /v1/chat/completions (tools / tool_calls)',
  unverified: [
    'MODEL STRING IS PENDING — sentinel in place, must be filled from Together\'s live model list before the pilot',
    'tool-calling support is per-model on Together; unconfirmed for the model finally chosen',
    'seed acceptance unconfirmed on this surface',
    'max_tokens field acceptance unconfirmed for the model finally chosen'
  ]
});

export const PROVIDER = adapter.PROVIDER;
export const API_SURFACE = adapter.API_SURFACE;
export const UNVERIFIED_CONTRACT = adapter.UNVERIFIED_CONTRACT;
export const ENDPOINT = adapter.ENDPOINT;
export const { startSession, buildRequestBody, step, appendToolResult, appendCapNotice } = adapter;
