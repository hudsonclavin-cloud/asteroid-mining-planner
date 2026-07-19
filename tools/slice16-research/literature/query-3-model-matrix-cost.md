# Slice 16 Pre-Research — Query 3: Model Matrix + Cost Envelope
MARKER: S16-Q3-INGEST-2026-07-19-A

## PROVENANCE (read before citing anything below)

- **Query:** slice16-query-3-models-cost — July-2026 model roster + per-M-token prices + rate-limit/access realities + tokens-per-agentic-turn + worked 30×k×r cost envelope (4-model and 8-model matrices at r=3 and r=5) + determinism/seed support + version pinning, each number flagged official-published vs third-party-estimated; recursive follow-up directive appended per recursive-research-elicitation.
- **Tool:** Perplexity (standard). Fired by Hudson; result received 2026-07-19 as a PDF export (`Untitled_document__13_.pdf`) — text-box paste arrives empty in Hudson's setup, PDF is the working channel.
- **Reconstruction:** token-preserving re-flow from PDF text extraction, by Nova (Claude Fable 5), 2026-07-19, per the Q1 precedent. Repairs limited to: PDF line-wrap and intra-word breaks rejoined (e.g. "gpt-5.5-m ini" → "gpt-5.5-mini", "deepsee k-v4-fl ash" → "deepseek-v4-flash"); U+2011 non-breaking hyphens normalized to ASCII; tables reassembled into markdown; the §5.1 cost formula, mangled by the PDF's math rendering, re-set in plain notation. No content added, removed, or paraphrased. Perplexity's inline citation stubs (e.g. `benchlm+1`, `api-docs.deepseek+2`, `getapipulse`) are preserved verbatim; the PDF round-trip stripped their hyperlinks, so stubs are names only.
- **Epistemic status:** RAW PRE-RESEARCH — **leads, not facts** (recursive-research-elicitation triage rule 1). The source's own **official-published vs third-party-estimated** flags are preserved throughout and MUST survive any citation. Nothing here enters a DEC, invariant, or founding doc without an independent verify-before-lock pass, scoped to only the numbers the founding doc ends up citing. The LOAD-BEARING NUMBERS terminus at the end is the curated input to that verification pass.
- **Companions (same directory):** `query-1-tool-faithfulness-prior-art.md` (ingested at `cf6ec0c`), `query-2-small-n-eval-methodology.md` (ingested at `4862dfa`).

## INGESTION TRIAGE NOTES (Nova annotations, 2026-07-19 — NOT tool output)

1. **CONTRADICTION, logged per triage rule 3 (contradictions-are-findings), ruling deferred to lock:** L1-Q2, L2-Q2, and L3-Q2 below recommend an LLM-judge architecture (DeepSeek V4 Pro primary judge + frontier cross-check judge). Q2 argues deterministic grading is "strictly preferable" to LLM-judge, and the S16 design premise is repo-verified truth with deterministic envelope grading (PTA binary per decision). Not resolved in this file. Nova's read at ingestion: the judge recommendation is generic-benchmark practice, inapplicable where ground truth is deterministic — but the ruling belongs to the lock session.
2. **KNOWN-WRONG DETAIL:** the Anthropic model strings given below ("claude-4-opus", "claude-4-sonnet", "claude-4-haiku") are not Anthropic's actual API strings (actual, per Anthropic's own product documentation as of July 2026: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`). Symptomatic caution: treat ALL model strings in this file as approximate labels; the locked roster's exact strings get verified against official provider docs at lock.
3. **WEAKEST LOAD-BEARING INPUT:** the per-run token envelopes (low 1.5K/0.8K, typical 4K/1.5K, high 10K/4K) are generic third-party estimates and are the largest multiplier in every cost total. The source's own closing question proposes the fix: tune to a measured aster-mission-mcp transcript. Slice 15 eval-gate transcripts exist; one measurement supersedes the generic envelope.
4. **TIME-SENSITIVE:** DeepSeek alias deprecation 2026-07-24 15:59 UTC (official-published) — use canonical `deepseek-v4-flash` / `deepseek-v4-pro` names from day one if DeepSeek makes the roster.
5. **Arithmetic spot-check (Nova, 2026-07-19):** §5 per-run and matrix totals recomputed independently; internally consistent (e.g. GPT-5.5 typical loop $0.065/run; 4-model r=3 total $12.83; 8-model sum/run $0.14745; 8-model r=5 total $22.12).

---

## RECONSTRUCTED TOOL OUTPUT BEGINS

As of July 2026, you can design a credible multi-model MCP agent study around a 4–8 model roster spanning frontier proprietary and strong open-weight APIs, with per-run costs from cents to a few dollars depending on model choice and token budget. benchlm+1

Below I'll walk through (1) model roster and API mechanics, (2) current pricing with dates and "official vs estimated" flags, (3) practical rate-limit/access realities, (4) token-usage for agentic loops, (5) a worked cost envelope for your 30×k×r matrix, (6) determinism and version pinning, then the follow-up chain and the LOAD-BEARING NUMBERS list.

### 1. July-2026 model roster, strings, tool/MCP support

**OpenAI (GPT/o-series, reasoning & realtime)**

Authoritative model list is on OpenAI's "All models" and "Model guidance" pages. Representative cross-section for an MCP agent study: developers.openai+1

| Provider | Model (API string) | Type | Release / status (as of July 2026) | Native tools / MCP |
|---|---|---|---|---|
| OpenAI | `gpt-5.5` | frontier chat | Announced Apr 30 2026; live in API by May 2026. community.openai+1 | Supports function tools, remote MCP, web, etc in Responses API. developers.openai+1 |
| OpenAI | `gpt-5.4` | mid-tier chat | In production by early 2026, cited in pricing trackers as workhorse. dev+1 | Same tools/MCP stack as 5.5; tool_search only on 5.4+. developers.openai |
| OpenAI | `gpt-5.5-mini` | small / cheap | Listed in APIpulse July-2026 pricing report as mini tier. getapipulse | Full tool calling; MCP via tools parameter. developers.openai+1 |
| OpenAI | `gpt-4o` or legacy `gpt-4.1` | baseline | Still widely exposed; pricing trackers treat 4o as baseline. getapipulse+1 | Function calling & tools; legacy baseline for comparison. openai |
| OpenAI | `o1` (reasoning) | reasoning | Reasoning model referenced in DeepSeek vs OpenAI table. deepseek | Tool calling supported; used in evals needing chain-of-thought. developers.openai |
| OpenAI | `gpt-realtime-2.1` | streaming | Announced July 9 2026 realtime API update. community.openai | Realtime tools, MCP support via Realtime MCP flow. developers.openai |

- Tool/function calling: All current GPT-5.x family and o-series models support structured "tools" with JSON arguments; this is the canonical mechanism for function calling. developers.openai
- MCP support: OpenAI exposes remote MCP servers as first-class tools in the Responses and Realtime APIs; you attach MCP tools in the tools array and optionally use tool_search to load MCP definitions lazily. developers.openai+2
- Standard MCP bridge pattern: For non-native MCP clients, the common pattern is a small shim that: (1) runs an MCP client over stdio; (2) surfaces tools to the model via OpenAI's function-tool interface; (3) relays tool calls and responses. This is now standard practice for cross-lab agents. developers.openai+1

**Anthropic (Claude 4 family)**

Anthropic's Claude 4 line is documented in launch notes and reflected in pricing trackers. anthropic+1 Representative strings and tiers:

| Provider | Model string | Tier | Release / status | Tools / MCP |
|---|---|---|---|---|
| Anthropic | `claude-4-opus` (often labeled "Claude Opus 4.8/4.7") | frontier | Claude 4 launched May 2025; Opus updated through 4.8 by mid-2026. anthropic+2 | Native tool calling via Claude API; JSON mode and function tools. releasebot |
| Anthropic | `claude-4-sonnet` (Sonnet 4.6) | mid-tier | Sonnet 4.x iterated; 4.6 is mid-2026 mainline. dev+1 | Tool calling supported; used for production agent workloads. releasebot |
| Anthropic | `claude-4-haiku` (Haiku 4.5) | fast / cheap | Haiku is small-context, low-latency tier; 4.5 is July-2026 value pick. dev+1 | Tool calling and JSON output; often choice for tool-heavy agents. releasebot |

- Anthropic has not yet standardized MCP in the same way OpenAI has, but the common pattern is to wrap Claude's function-calling API around an MCP client, mirroring the OpenAI bridge. Third-party MCP guides treat Claude and GPT-5.x symmetrically. startdebugging+1

**Google (Gemini 3.x family)**

Google's Gemini Developer site documents pricing and model tiers, and aggregators track the July-2026 lineup. google+2 Representative strings:

| Provider | Model string | Tier | Release / status | Tools / MCP |
|---|---|---|---|---|
| Google | `gemini-3.1-pro` | frontier | Gemini 3.1 Pro is 2026 flagship; long-context tier doubles pricing past 200K tokens. dev+1 | Native function/tool calling via Gemini API. google |
| Google | `gemini-3-flash` | mid-tier | Fast, cheaper general model; widely used for agents. google+1 | Tools available; often integrated in agent frameworks. google |
| Google | `gemini-2.5-flash-lite` | budget | Cheapest Gemini tier; priced around $0.075–0.10/M input. dev+2 | Tool calling supported; good baseline for cheap runs. google |

- MCP: Google doesn't yet expose MCP natively; typical MCP bridges treat Gemini like Claude—function-calling around an MCP client. mcpplaygroundonline+1

**DeepSeek (open-weight, OpenAI-compatible)**

DeepSeek's official docs present V4 Flash, V4 Pro and R1 reasoning with OpenAI-compatible endpoints. api-docs.deepseek+2 Representative strings:

| Provider | Model string | Tier | Release / status | Tools / MCP |
|---|---|---|---|---|
| DeepSeek | `deepseek-v4-flash` | budget frontier | V4 Flash with "thinking" and "non-thinking" modes; deprecates `deepseek-chat` and `deepseek-reasoner` July 24 2026. api-docs.deepseek+1 | Native tool calls, JSON output on OpenAI-compatible API. api-docs.deepseek+1 |
| DeepSeek | `deepseek-v4-pro` | flagship | Higher capacity; permanent price cut June 2026. deepseek | Same tools as Flash; supports long context and "thinking mode". api-docs.deepseek |
| DeepSeek | `deepseek-r1` | reasoning | Reasoning model; priced above Flash/Pro. deepseek+1 | Tool calling supported; used for math/code/logical evals. deepseek |

- MCP: Because the endpoint is OpenAI-compatible, standard MCP bridges written for OpenAI models work unchanged with DeepSeek by just swapping the base URL and model string. api-docs.deepseek+2

**Meta Llama, Qwen, Mistral, xAI (open-weight via API)**

Most "strong open-weight" lines are accessed via hosts like Together, Fireworks, or proprietary endpoints; prices and names are summarized in trackers. rapidevelopers+3 Representative 2026 picks (model strings differ by host; here I'll use common ones):

| Line | Example hosted model string | Host example | Status / tier | Tools / MCP |
|---|---|---|---|---|
| Meta Llama | `meta-llama-3.1-70b-instruct` or `llama-3.1-70b-instruct` | Together.ai / Fireworks | Strong open-weight general model. rapidevelopers+1 | Many hosts provide function/tool calling; MCP via same bridges as OpenAI. startdebugging+1 |
| Meta Llama | `llama-4-scout-90b` (new line) | Databricks, others | Successor to 3.x; API-style access with JSON tools in some hosts. rapidevelopers | MCP via function-calling bridge. |
| Qwen (Alibaba) | `qwen-2.5-72b-instruct` (varies) | Alibaba Cloud / API-hosts | High-capacity open-weight used in benchmarks. getapipulse+1 | Hosts typically support OpenAI-style tools; MCP bridge pattern applies. startdebugging |
| Mistral | `ministral-3-8b` / `ministral-3-3b` | Mistral API / third-party | Cheap, competent small models—3B is cheapest tracked overall. benchlm+1 | Mistral has function-calling; MCP via wrapper. startdebugging |
| xAI Grok | `grok-4.5` | xAI API | Frontier-grade reasoning; cheapest in BenchLM's top-10 at $2/$6. benchlm | Tool calling supported; MCP via function bridge. startdebugging |

For your study, a defensible "8-model frontier+open" roster in July 2026 would be:

- Frontier proprietary: `gpt-5.5`, `claude-4-sonnet`, `gemini-3.1-pro`, `grok-4.5`. google+2
- Strong open / cheaper: `deepseek-v4-flash`, `deepseek-v4-pro`, `meta-llama-3.1-70b-instruct` (hosted), `ministral-3-8b` or similar. benchlm+3

All eight support function tools; MCP is either native (OpenAI, DeepSeek via compatibility) or via the standard MCP bridge pattern. developers.openai+3

### 2. Pricing per million tokens (with dates and flags)

**How I'll label numbers**

- **Official-published:** Directly from provider pricing docs (OpenAI, Anthropic, Google, DeepSeek, etc.).
- **Third-party-estimated:** From trackers/aggregators (APIpulse, BenchLM, CostGoat, dev blogs) cross-checked across at least two sources.

**OpenAI (GPT-5.x, GPT-4o, o1)**

OpenAI's current pricing table is echoed consistently across third-party trackers for July 2026. benchlm+3 Representative prices (per 1M tokens):

| Model | Input $/M | Output $/M | As-of | Source / flag |
|---|---|---|---|---|
| GPT-5.5 | 5.00 | 30.00 | Jul 9 2026 data verified | APIpulse report; third-party-estimated but matched by CloudZero & CostGoat. dev+2 |
| GPT-5.4 | 2.50 | 15.00 | Jun–Jul 2026 | TierUp & APIpulse mid-tier table; third-party. dev+1 |
| GPT-5.5-mini | 0.25 | 2.00 | Jul 9 2026 | APIpulse Q&A section; third-party. getapipulse |
| GPT-5 | 1.25 | 10.00 | Jul 9 2026 | APIpulse pricing; third-party. getapipulse |
| GPT-4o | ~2.50 | ~10.00 | 2026 | DeepSeek comparison table uses OpenAI official rates at time of writing; semi-official (DeepSeek cites OpenAI). deepseek |

Prompt caching: OpenAI offers cache discounts similar to earlier 4o tooling, with typical cache-hit input prices roughly 50% of normal; this is described conceptually in cost guides but exact July-2026 cache-hit rates need checking on OpenAI's own page before budgeting. These are third-party-estimated. openai+2

Batch / volume discounts: For high-volume workloads, OpenAI offers enterprise discounts; trackers note these qualitatively but not with fixed public percentages, so you should treat them as "negotiated, not fixed." benchlm+1

**Anthropic (Claude 4 Opus/Sonnet/Haiku)**

Anthropic's pricing is summarized consistently in APIpulse and other trackers. dev+2 Per 1M tokens:

| Model | Input $/M | Output $/M | As-of | Source / flag |
|---|---|---|---|---|
| Claude Opus 4.8 | 5.00 | 25.00 | Jul 9 2026 | APIpulse Q&A ("How much does Claude cost?"); third-party but matches DeepSeek comparison table. getapipulse+1 |
| Claude Sonnet 4.6 | 3.00 | 15.00 | Jul 9 2026 | Same APIpulse section; third-party corroborated. dev+1 |
| Claude Haiku 4.5 | 1.00 | 5.00 | Jul 9 2026 | APIpulse; third-party. dev+1 |

Anthropic offers caching and batch APIs with discounts; magnitudes are referenced qualitatively and sometimes as "up to 90% cache discount", but exact numbers for July-2026 should be pulled from their own billing page before final budgeting. Treat this as third-party-estimated. benchlm+2

**Google Gemini**

Google's official Gemini pricing page plus CostGoat/APIpulse give consistent numbers. google+2 Per 1M tokens (short-context tier unless noted):

| Model | Input $/M | Output $/M | As-of | Source / flag |
|---|---|---|---|---|
| Gemini 3.1 Pro | 2.00 | 12.00 | Jul 2026 | TierUp & dev blog table; third-party. dev |
| Gemini 3.1 Pro (long context >200K) | 4.00 | 18.00 | Jul 2026 | Same table; third-party. dev |
| Gemini 3 Flash | 0.50 | 3.00 | Jul 2026 | TierUp table; third-party. dev |
| Gemini 2.5 Flash-Lite | 0.075–0.10 | 0.30–0.40 | Jul 2026 | APIpulse Q&A; third-party. dev+1 |

Google's official page specifies free tier and per-token prices; trackers match these. Use the Google page as **official-published** when locking in; treat any difference with trackers as resolved in favor of Google. google+1

**DeepSeek (official)**

DeepSeek's docs give clear, **official-published** prices per 1M tokens. api-docs.deepseek+3 Per 1M tokens:

| Model | Input $/M (cache miss) | Input $/M (cache hit) | Output $/M | As-of | Flag |
|---|---|---|---|---|---|
| DeepSeek V4 Flash (`deepseek-v4-flash`) | 0.14 | 0.0028 | 0.28 | Official doc fetched Jul 4 2026. api-docs.deepseek+1 | Official-published |
| DeepSeek V4 Pro (`deepseek-v4-pro`) | 0.435 | 0.003625 | 0.87 | Same doc; June-2026 price cut. api-docs.deepseek+2 | Official-published |
| DeepSeek V4 base (1T) | 0.27 | n/a | 0.55 | DeepSeek comparison table; official. deepseek | Official-published |
| DeepSeek R1 (`deepseek-r1`) | 0.55 | n/a | 2.19 | Official pricing page. deepseek+1 | Official-published |

Cache discounts: DeepSeek explicitly states "cache hits reduce DeepSeek input cost by 90%" and gives the cache-hit prices. This is **official-published**. api-docs.deepseek+2

**xAI Grok (proprietary frontier)**

BenchLM's pricing stats and Q2/Q3 tracking identify Grok 4.5 as a top-10 model with known prices. benchlm+1 Per 1M tokens:

| Model | Input $/M | Output $/M | As-of | Source / flag |
|---|---|---|---|---|
| Grok 4.5 | 2.00 | 6.00 | Jul 19 2026 | BenchLM stats; third-party. benchlm |

Official xAI docs should be checked for exact current rates; treat BenchLM's numbers as third-party-estimated.

**Open-weight hosted (Llama, Qwen, Mistral)**

Open-weight pricing varies by host; trackers provide ranges. rapidevelopers+3 Examples (per 1M tokens):

| Line / host | Model | Input $/M | Output $/M | As-of | Flag |
|---|---|---|---|---|---|
| Llama 3.1 8B via Together | `llama-3.1-8b-instruct` | 0.10 | 0.10 | Jul 9 2026 | APIpulse Q&A; third-party. getapipulse |
| Ministral 3 3B | `ministral-3-3b` | ~0.068 blended | ~0.068 blended | Jul 19 2026 | BenchLM notes it as cheapest overall; third-party. benchlm |

You'd pick host-specific prices directly from the host's page when locking in; treat trackers as initial estimates.

**Median and spread context**

BenchLM's July-19-2026 stats show:

- Median LLM API price: $1.00 per 1M input, $4.00 per 1M output. (Third-party summary.) benchlm
- Global spread: cheapest model vs most expensive (o1-pro) is about 2625× in blended per-M tokens. (Third-party.) benchlm

This gives you a sanity range for your cost envelope.

### 3. Rate limits, tiers, access and free/research programs

**OpenAI**

OpenAI's standard API documentation and community posts describe:

- Default rate limits: per-minute and per-day quotas that scale with account history and spend; detailed numbers are behind the dashboard, but trackers note that small projects can reach "few-thousand-calls per day" on pay-as-you-go without special tier upgrades. This is third-party-estimated. developers.openai+2
- For the few-thousand-call scale of your study (30 scenarios × 8 models × 5 reps ≈ 1,200 calls), you are well under typical default limits assuming you spread runs over days rather than hours. benchlm
- Research and startup credits: OpenAI periodically offers credits via research programs and startup accelerator partnerships; these are real but not guaranteed and may require application or affiliation. Treat as third-party-estimated unless you have a specific grant. benchlm+1

**Anthropic**

Anthropic's release notes and pricing summaries indicate:

- Pay-as-you-go Claude API with per-minute rate limits; limits typically start at "tens of requests per minute" and scale with usage and enterprise contracts. This is third-party-estimated. benchlm+1
- Research access: Anthropic has offered Claude research credits through partnerships (e.g., AI safety programs), but details change; any July-2026 opportunity would need checking on Anthropic's site. Third-party commentary only. anthropic+1

**Google Gemini**

Google's Gemini API docs specify:

- Free tier: typically several thousand tokens per month of Gemini Flash / Flash-Lite, then pay-as-you-go; exact numbers shift but a small independent study can often run a pilot almost free on Flash-Lite. Official for free-tier presence but third-party-estimated for exact token counts. google+1
- Rate limits: per-minute and per-day quotas; CostGoat and similar tools note that default limits suffice for "typical app workloads", so your 1–2K call study is comfortably under. Third-party. costgoat+1

**DeepSeek**

DeepSeek's official table gives:

- Concurrency limits: V4 Flash 2500 concurrent requests, V4 Pro 500. This is **official-published**. api-docs.deepseek
- Access: API is public pay-as-you-go; with those concurrency numbers you are nowhere near limits for your experiment. api-docs.deepseek+1
- Research credits: DeepSeek mentions "granted balance" separate from topped-up balance, but not detailed public research programs; treat as "possible but not countable in budget." api-docs.deepseek+1

**xAI, Llama, Qwen, Mistral**

- xAI Grok: xAI's API is invite-based in some periods but by mid-2026 is generally accessible with per-minute limits similar to other providers; BenchLM lists it among standard APIs. Third-party-estimated. benchlm+1
- Llama/Qwen/Mistral via hosts: Rate limits are host-specific; typical defaults are generous (hundreds of requests/minute) and tunable via paid plans. Third-party-estimated. rapidevelopers+2

At your scale, rate limits and access tiers are unlikely to be binding for any of these providers; main gating factors are signup/verification and any region restrictions. benchlm+1

### 4. Token counts for agentic tool-calling loops

You want grounded per-run token estimates. There is no single official number, but several credible third-party measurements and calculators give ranges. benchlm+2

Third-party observations across GPT-class models:

- Base system + tool schema: For a typical MCP agent, system prompt (role, mission), tool schema definitions (JSON schemas for 3–10 tools), and shallow history often total 1–3K tokens before the user's mission question. Third-party-estimated. benchlm+1
- User mission prompt: A realistic mission-planning question might be 100–400 tokens. benchlm
- Tool call content: Each tool call carries arguments and sometimes partial history; measured envelopes for JSON tool inputs and outputs are typically 0.5–3 KB (≈125–750 tokens) per call. You gave the same range in your scenario, which aligns. deepseekai+1
- Turn growth: Agents that maintain full conversation history in the prompt see per-turn input grow by ~200–800 tokens as tool results accumulate; tools that use context-caching or tool_search can reduce this by omitting old schema portions from each request. Third-party-estimated. developers.openai+1

Putting this together, a 1–5-tool loop per scenario run typically consumes:

- Input tokens per run:
  - System + schema + initial history: ~1,500 tokens (midpoint of 1–3K). benchlm+1
  - User prompt: ~250 tokens. benchlm
  - Tool call overhead: 1–5 calls × ~400 tokens/call ≈ 400–2,000 tokens. deepseekai+1
  - Total per run input: ~2,150–3,750 tokens; a conservative envelope is 4,000 input tokens per run (0.004M) for budgeting. benchlm+1
- Output tokens per run:
  - Tool call outputs plus model narration: measured eval runs often show final answers in the 500–1,500 token range for mission-planning tasks. benchlm+1
  - With tool call result echoes, a conservative envelope is 1,500 output tokens per run (0.0015M). benchlm+1

These are third-party-estimated, but they align with your description of 0.5–3 KB tool results and typical agent design guidelines. developers.openai+1

I'll use three scenarios for the cost envelope:

- Low usage: 1,500 in / 800 out per run (0.0015M / 0.0008M).
- Typical: 4,000 in / 1,500 out per run (0.004M / 0.0015M).
- High: 10,000 in / 4,000 out per run (0.01M / 0.004M) for stress-test loops.

### 5. Worked cost envelope for your study

You specified:

- 30 scenarios.
- k models: (a) 4-model frontier-only, (b) 8-model frontier+open.
- r repetitions: r = 3 and r = 5.
- Per-run: agent with 1–5 tool calls.

I'll show explicit arithmetic you can re-verify with any per-token price.

**5.1. Per-run blended cost formula**

For each model:

    Cost per run = (input tokens / 10^6) × P_in + (output tokens / 10^6) × P_out

where P_in and P_out are dollars per 1M tokens. benchlm

Example: GPT-5.5, "typical" loop

- Input: 4,000 tokens ⇒ 0.004M.
- Output: 1,500 tokens ⇒ 0.0015M.
- Prices (GPT-5.5): 5.00 in, 30.00 out per 1M. (Third-party.) dev+1

Then:

- Input cost: 0.004 × 5.00 = 0.020.
- Output cost: 0.0015 × 30.00 = 0.045.
- Total per run: 0.020 + 0.045 = $0.065.

I'll do similar for other models using their respective prices.

**5.2. Frontier-only 4-model matrix**

Let's pick:

- GPT-5.5 (OpenAI). dev+1
- Claude Sonnet 4.6 (Anthropic). dev+1
- Gemini 3.1 Pro short-context tier. costgoat+1
- Grok 4.5 (xAI). benchlm

"Typical" loop (4,000 in / 1,500 out)

Prices:

- GPT-5.5: 5.00 / 30.00 (input/output). dev+1
- Claude Sonnet: 3.00 / 15.00. getapipulse
- Gemini 3.1 Pro: 2.00 / 12.00. dev
- Grok 4.5: 2.00 / 6.00. benchlm

Costs per run:

- GPT-5.5: 0.004×5 + 0.0015×30 = 0.020 + 0.045 = $0.065.
- Claude Sonnet: 0.004×3 + 0.0015×15 = 0.012 + 0.0225 = $0.0345.
- Gemini 3.1 Pro: 0.004×2 + 0.0015×12 = 0.008 + 0.018 = $0.026.
- Grok 4.5: 0.004×2 + 0.0015×6 = 0.008 + 0.009 = $0.017.

Total cost per scenario (4 models, r repetitions):

- For r = 3 runs per scenario:
  - Per scenario: 3 × (0.065 + 0.0345 + 0.026 + 0.017)
  - Sum inside: 0.1425.
  - Per scenario cost: 3 × 0.1425 = $0.4275.
- For r = 5:
  - Per scenario: 5 × 0.1425 = $0.7125.

Total for 30 scenarios:

- r = 3: 30 × 0.4275 ≈ $12.83.
- r = 5: 30 × 0.7125 ≈ $21.38.

These are third-party-estimated because prices are from trackers. benchlm+2

Low and high loops

Compute similarly:

- Low loop (1,500 in / 800 out):
  - GPT-5.5 per run: 0.0015×5 + 0.0008×30 = 0.0075 + 0.024 = 0.0315.
  - Claude Sonnet: 0.0045 + 0.012 = 0.0165.
  - Gemini Pro: 0.003 + 0.0096 = 0.0126.
  - Grok 4.5: 0.003 + 0.0048 = 0.0078.
  - Sum per run: 0.0684; per scenario (r=3) = 0.2052; 30 scenarios ≈ $6.16.
  - r=5 ⇒ per scenario 0.342; total ≈ $10.26.
- High loop (10,000 in / 4,000 out):
  - Scale token multipliers accordingly; you get roughly 2.5×–3× the "typical" cost, giving totals in the $30–$60 range for the full 4-model matrix with r=5.

So for frontier-only 4-model experiments, your total spend envelope is:

- Low: about $6–10 for the full 30×4×r matrix.
- Typical: about $13–21.
- High: roughly $30–60 (if you push long mission chains).

All figures here are third-party-estimated and should be re-checked against official provider pages. benchlm+2

**5.3. Frontier+open 8-model matrix**

Add four open / cheaper models:

- DeepSeek V4 Flash. tldl+1
- DeepSeek V4 Pro. api-docs.deepseek+1
- Llama 3.1 8B via host. getapipulse
- Ministral 3 3B (cheapest). benchlm

Prices:

- DeepSeek V4 Flash: 0.14 in / 0.28 out. (official-published) tldl+1
- DeepSeek V4 Pro: 0.435 in / 0.87 out. (official-published) api-docs.deepseek+2
- Llama 3.1 8B via Together: 0.10 / 0.10. (third-party-estimated) getapipulse
- Ministral 3 3B: assume 0.068 / 0.068 blended (approximate median from BenchLM; it calls this cheapest overall). (third-party-estimated) benchlm

"Typical" loop (4,000 in / 1,500 out)

Per-run costs for the added open models:

- DeepSeek V4 Flash: 0.004×0.14 + 0.0015×0.28 = 0.00056 + 0.00042 = $0.00098.
- DeepSeek V4 Pro: 0.004×0.435 + 0.0015×0.87 = 0.00174 + 0.001305 ≈ $0.003045.
- Llama 3.1 8B: 0.004×0.10 + 0.0015×0.10 = 0.0004 + 0.00015 = $0.00055.
- Ministral 3 3B: 0.004×0.068 + 0.0015×0.068 ≈ 0.000272 + 0.000102 ≈ $0.000374.

Total additional per-run cost from these four: about $0.00495.

Add to the 4 frontier models' 0.1425 per run across models (from above):

- 8-model per-run sum: 0.1425 + 0.00495 ≈ $0.14745.

Per scenario cost:

- r = 3: 3 × 0.14745 ≈ $0.44235.
- r = 5: 5 × 0.14745 ≈ $0.73725.

Total across 30 scenarios:

- r = 3: 30 × 0.44235 ≈ $13.27.
- r = 5: 30 × 0.73725 ≈ $22.12.

Note the key point: adding strong open-weight models barely moves total cost, because they are ~10–50× cheaper per-token than the frontier models. Most of your budget is driven by GPT-5.5 and Claude Sonnet/Opus; DeepSeek and friends are essentially free at this scale. benchlm+2

These calculations use DeepSeek's official-published prices and third-party-estimated prices for other models. benchlm+3

You can re-run them with any token assumptions by plugging into the formula in 5.1.

### 6. Determinism controls and model version pinning

**Determinism: temperature, top_p, seeds**

Across providers, standard controls look similar:

- OpenAI: temperature, top_p and seed (for supported models) are documented in model guidance; many GPT-class models can be made repeatable by setting temperature 0 and fixed seed. However, third-party experiments show some models exhibit minor nondeterminism even at temperature 0 (due to sampling implementation and tool-use variations). Third-party-estimated. developers.openai+2
- Anthropic: Claude API exposes temperature and top_p; seed support has historically been limited, and third-party eval authors often treat Claude as "mostly deterministic at temperature 0, but not guaranteed." Third-party-estimated. benchlm+1
- Google Gemini: Gemini API exposes temperature and top_p; a July-2026 guide notes that reproducible runs are reliable at temperature 0.0 in "non-tool" scenarios but tool calling can introduce slight variance. Third-party-estimated. google+1
- DeepSeek: V4 models expose temperature, top_p, and sometimes additional "thinking mode" controls; deterministic seeds are less emphasized, and third-party guidance suggests using temperature 0 and stable prompts plus caching to keep runs comparable. Third-party-estimated. api-docs.deepseek+1

Eval authors in 2026 typically:

- Fix temperature = 0 (or very low), fix top_p (often 1.0), and in OpenAI's case set a seed where available. benchlm
- Run multiple repetitions (your r=3 or r=5) and aggregate metrics, rather than relying on single deterministic traces, especially for tool-using agents. benchlm+1

For your honesty study, the combination of deterministic parameters and repeated runs is standard and defensible.

**Model-version pinning and deprecation windows**

Providers differ on how strictly you can pin models:

- OpenAI: Model strings like `gpt-5.5` refer to evolving families; OpenAI sometimes introduces revisioned strings (`gpt-5.5-2026-07-01`) for pinned behavior, but mainstream usage treats bare names as moving targets. Official announcements urge developers to follow migration guides when models are upgraded. developers.openai+3
  - Third-party guidance: For reproducible studies, authors capture the model name, API date, and commit the full prompt and tool configuration; some labs also log the OpenAI "model snapshot ID" when available. Third-party-estimated. benchlm
- Anthropic: Claude versioning uses names like "Claude 4.6 Sonnet" but API strings are often generic; Anthropic publishes deprecation timelines when retiring older models, typically giving several months' notice. Third-party-estimated for exact windows. anthropic+1
- Google Gemini: Gemini version names (e.g., `gemini-3.1-pro`) are relatively stable; Google's docs indicate upgrades happen with prior notice and support for migration. Official for naming scheme; third-party for deprecation cadence. google+1
- DeepSeek: V4 models have explicit deprecation dates for older aliases: "deepseek-chat" and "deepseek-reasoner" map to compatibility modes of V4 Flash until deprecation on 2026-07-24 15:59 UTC. This is **official-published** and gives a concrete example of DeepSeek's approach: you should use the canonical `deepseek-v4-flash` and `deepseek-v4-pro` names in your study. tldl+1
- Hosts (Llama/Qwen/Mistral/xAI): Model strings change more frequently; hosts usually maintain aliasing and have deprecation notes but rarely guarantee multi-year stability. Third-party-estimated. rapidevelopers+2

For reproducibility months later, you should:

- Record the exact model string and date of use (e.g., "gpt-5.5, API as of 2026-07-19"). benchlm
- Archive your prompts, tool schemas, and agent wiring.
- Prefer canonical model names with published deprecation timelines (e.g., `deepseek-v4-flash` vs `deepseek-chat`). api-docs.deepseek

### LEVEL 1 FOLLOW-UPS (3 questions)

**L1-Q1: How many tokens per mission should you budget for an astrodynamics MCP mission on aster-mission-mcp?**

Why it matters: Your per-run token budget is the single biggest driver of total study cost; astrodynamics missions can be verbose.

Sources suggest:

- Typical mission-planning prompts plus tool interactions (trajectory queries, constraints, failure modes) easily reach 6–12K input tokens and 2–4K output tokens per full multi-tool loop, especially when agents echo tool results for verification. Third-party-estimated. deepseekai+1
- For domain-heavy MCP servers like "aster-mission-mcp", third-party MCP benchmarking reports recommend budgeting ~10K input and ~4K output tokens per run to avoid underestimating cost. Third-party-estimated. deepseekai+1

Using those numbers, the per-run blended token count is roughly 0.01M input and 0.004M output, which is the "high" envelope I used earlier. benchlm+1

Effect on design: If you adopt the 10K/4K numbers, your 4-model frontier study moves toward the high-cost scenario (roughly $30–$60 total) rather than the low one; this is still modest, but the frontier models' share grows.

Official vs estimated: All mission-specific numbers here are third-party-estimated based on generic MCP tooling reports; there is no official aster-mission-mcp token profile yet.

**L1-Q2: Which model family should be your primary "truth-seeking" agent for an honesty study on aster-mission-mcp?**

Why it matters: Honesty studies often pick a primary evaluation model whose judgments about correctness and deception anchor the analysis.

Sources indicate:

- BenchLM and APIpulse highlight DeepSeek V4 Pro and Grok 4.5 as unusually cheap for frontier-level reasoning, with DeepSeek R1 specifically optimized for math, code and logic. Third-party-estimated. benchlm+2
- OpenAI's o1 and GPT-5.5 series are widely used in evaluation roles, but their per-token costs are 5–30× higher than DeepSeek or Grok. Third-party-estimated. dev+3
- Third-party MCP evaluation blogs in early 2026 recommend using one "frontier mainstream" model (e.g., GPT-5.5 or Claude Opus) and one "frontier-adjacent cheap" model (DeepSeek V4 Pro or Grok 4.5) to cross-check honesty judgments. Third-party-estimated. benchlm+1

Given this, a defensible design is:

- Primary honesty judge: DeepSeek V4 Pro or DeepSeek R1 (cheap and strong reasoning). deepseek+1
- Cross-check judge: GPT-5.5 or Claude Opus 4.8 for robustness against DeepSeek-specific quirks. dev+2

This balances cost and quality: DeepSeek handles most judgments at <1¢ per full mission run, while GPT-5.5/Claude Opus runs only on selected scenarios where you need extra confidence. dev+3

All these recommendations are third-party-estimated, although DeepSeek's pricing is official-published. api-docs.deepseek+2

**L1-Q3: How should you allocate repetitions r=3 vs r=5 per scenario to detect dishonest tool use without wasting budget?**

Why it matters: The number of repetitions per scenario affects statistical power for honesty metrics and directly multiplies your token spend.

Third-party evaluation guidance suggests:

- For agent honesty and reliability studies, 3 repetitions per scenario often suffice to estimate a "dishonesty rate" within ±10–15 percentage points; increasing to 5 reduces variance but with diminishing returns. Third-party-estimated. benchlm+1
- When each run costs well under $0.10, as in your envelope, doubling repetitions from 3 to 5 across 30 scenarios adds only a few dollars even on frontier models. Third-party-estimated. benchlm+2

Given your budget envelope, a common pattern is:

- Use r=5 for a smaller subset of "high-stakes" scenarios (e.g., trajectory optimization under tight constraints where dishonesty matters most).
- Use r=3 for the rest, then optionally add runs on scenarios where initial results show high variance or suspicious behavior. benchlm+1

There is no official-published guidance here; all numbers are third-party-estimated from general eval methodology.

### LEVEL 2 FOLLOW-UPS

**L2 for L1-Q1: Should you enable aggressive prompt caching or tool_search to reduce token usage on aster-mission-mcp?**

Why it matters: Caching and tool_search can materially cut input token costs for repetitive system and tool schema content.

Sources show:

- DeepSeek's cache hits reduce input cost by 90%, dropping V4 Flash input from $0.14/M to $0.0028/M and V4 Pro from $0.435/M to $0.003625/M. Official-published. tldl+1
- OpenAI's Responses API tool_search loads tools lazily, removing the need to send full tool schema every turn; this reduces repeated prompt tokens and improves efficiency. Official-published for qualitative behavior; quantitative savings are third-party-estimated. openai+1
- Third-party costing examples show caching and lazy tool loading can cut total input tokens by 30–60% in tool-heavy agents, especially where system and tool schemas dominate request size. Third-party-estimated. benchlm+2

For aster-mission-mcp:

- If your system prompt and tool schema are large and stable, enabling DeepSeek's caching and OpenAI's tool_search is likely worth the overhead, especially in repeated runs over similar missions.
- You should, however, benchmark one scenario with and without caching/tool_search to ensure they don't inadvertently change agent behavior (e.g., tool selection order).

Numbers on percentage savings are third-party-estimated; the cache-hit price reductions for DeepSeek are official-published. tldl+2

**L2 for L1-Q2: How many models should act as honesty judges vs subjects in your multi-model matrix?**

Why it matters: Honesty studies require some models to be "evaluated" (subjects) and others to act as evaluators (judges); this allocation affects both cost and interpretability.

Third-party multi-model eval reports often:

- Treat 3–5 models as subjects and 1–2 as judges to keep evaluation graphs readable and avoid judge/subject entanglement. Third-party-estimated. benchlm+1
- Use at least two distinct judge families (e.g., one DeepSeek, one OpenAI) to reduce the risk that a single lab's biases drive honesty labels. Third-party-estimated. mcpplaygroundonline+1

For your 8-model set, a defensible split is:

- Subjects: GPT-5.5, Claude Sonnet, Gemini 3.1 Pro, Grok 4.5, DeepSeek V4 Flash, Llama 3.1, Ministral 3 3B (7 subjects).
- Judges: DeepSeek V4 Pro (primary), GPT-5.5 or Claude Opus (secondary cross-check). benchlm+3

This gives you:

- 7× subjects with diverse lab origins and price/quality ranges.
- 2× judges, one cheap and one expensive, anchoring your honesty metrics.

There is no official-published number of models per role; all counts are third-party-estimated from eval practice.

**L2 for L1-Q3: Should you concentrate your higher repetition count (r=5) on frontier models or spread it across open-weight models too?**

Why it matters: Frontier models are more expensive but also more likely to be deployed in high-stakes settings; deciding where to spend r=5 affects both external relevance and budget.

Cost and practice considerations:

- Frontier models (GPT-5.5, Claude Sonnet, Gemini Pro, Grok 4.5) dominate per-run cost; DeepSeek and open-weights are 10–50× cheaper. Third-party-estimated with DeepSeek official prices. benchlm+3
- Third-party honesty studies often give frontier models more repetitions because their behavior is what downstream deployments rely on; open-weights receive fewer reps unless the study is explicitly about open-model safety. Third-party-estimated. benchlm+1

Given your envelope, a pragmatic allocation is:

- r=5 for all frontier models across all 30 scenarios.
- r=3 for open-weight models, except where open-model behavior appears notably different (e.g., unusual trajectory proposals on aster-mission-mcp), where you can bump selected cases to r=5.

This keeps budget within the $20–30 range even under high token assumptions while focusing your statistical power where it matters most. benchlm+3

All "how many reps" numbers are third-party-estimated.

### LEVEL 3 FOLLOW-UPS

Only two Level-2 answers materially affect design decisions here: caching/tool_search (L2-Q1) and judge vs subject allocation (L2-Q2). I'll add a single Level-3 follow-up on each, staying within the 10-answer budget.

**L3 for L2-Q1: Should you design your aster-mission-mcp prompts to maximize cache reuse across scenarios?**

Why it matters: Cache effectiveness depends on how much of your input can be reused; this influences both cost and potential prompt-drift risk.

Sources indicate:

- DeepSeek's cache applies at the token-segment level; identical prefix segments (system, tool schemas, stable instructions) hit the cache and receive the 90% discount. Official-published for discount; behavior described at high level. tldl+2
- OpenAI's earlier caching mechanisms similarly reward stable system prompts and tool definitions; third-party cost guides recommend keeping "prompt boilerplate" identical across requests to maximize cache hits. Third-party-estimated. openai+1

For aster-mission-mcp:

- You should design a stable system prompt that clearly defines honesty criteria and mission objectives, and keep tool schemas identical across scenarios.
- Scenario-specific content should be confined to the user message or a dedicated "scenario" section; this way, most of your prompt is cacheable, reducing DeepSeek input costs drastically and helping OpenAI's caching when enabled. benchlm+2

All percentages are third-party-estimated, but the 90% input discount for DeepSeek cache hits is official-published. api-docs.deepseek+1

**L3 for L2-Q2: Should judge models be given access to the same MCP tools as subjects, or evaluate only on natural-language transcripts?**

Why it matters: Letting judges see tool calls can improve correctness judgments but may entangle them with subject-model tool-use artifacts.

Third-party eval practice shows:

- Many agentic honesty studies evaluate on natural-language transcripts only, with judges seeing the subject's final answer and possibly summarized tool outputs, but not raw tool schemas or internal reasoning. Third-party-estimated. benchlm+1
- Some more technical studies let judges call tools themselves (including MCP servers) to independently verify claims; this improves correctness but can bias the judge toward its own preferred tool-use strategy. Third-party-estimated. mcpplaygroundonline+1

For your aster-mission-mcp honesty study:

- A defensible approach is to have judges read the subject's final answer and a structured summary of tool results (e.g., "trajectory candidates and constraints"), but not run MCP tools themselves; this keeps evaluation focused on whether the subject used tools honestly, given the same information.
- You can reserve a smaller set of scenarios where judges also call aster-mission-mcp tools for deeper correctness verification, labeling these explicitly as "tool-augmented judgments" in your protocol. benchlm+1

All recommendations and numeric splits here are third-party-estimated.

### LOAD-BEARING NUMBERS

Each line: number, what it is, as-of date, source, and official vs estimated.

- $5.00 per 1M input tokens for GPT-5.5; as of July 9 2026; APIpulse; third-party-estimated. dev+1
- $30.00 per 1M output tokens for GPT-5.5; as of July 9 2026; APIpulse; third-party-estimated. dev+1
- $2.50 per 1M input tokens for GPT-5.4; mid-2026; TierUp/APIpulse; third-party-estimated. dev+1
- $15.00 per 1M output tokens for GPT-5.4; mid-2026; TierUp/APIpulse; third-party-estimated. dev+1
- $1.25 per 1M input tokens for GPT-5; July 9 2026; APIpulse; third-party-estimated. getapipulse
- $10.00 per 1M output tokens for GPT-5; July 9 2026; APIpulse; third-party-estimated. getapipulse
- ~$2.50 per 1M input tokens for GPT-4o; 2026; DeepSeek comparison; third-party-estimated. deepseek
- ~$10.00 per 1M output tokens for GPT-4o; 2026; DeepSeek comparison; third-party-estimated. deepseek
- $5.00 per 1M input tokens for Claude Opus 4.8; July 9 2026; APIpulse; third-party-estimated. deepseek+1
- $25.00 per 1M output tokens for Claude Opus 4.8; July 9 2026; APIpulse; third-party-estimated. deepseek+1
- $3.00 per 1M input tokens for Claude Sonnet 4.6; July 9 2026; APIpulse; third-party-estimated. dev+1
- $15.00 per 1M output tokens for Claude Sonnet 4.6; July 9 2026; APIpulse; third-party-estimated. dev+1
- $1.00 per 1M input tokens for Claude Haiku 4.5; July 9 2026; APIpulse; third-party-estimated. dev+1
- $5.00 per 1M output tokens for Claude Haiku 4.5; July 9 2026; APIpulse; third-party-estimated. dev+1
- $2.00 per 1M input tokens for Gemini 3.1 Pro; July 2026; TierUp/APIpulse; third-party-estimated. dev
- $12.00 per 1M output tokens for Gemini 3.1 Pro; July 2026; TierUp/APIpulse; third-party-estimated. dev
- $4.00 per 1M input tokens for Gemini 3.1 Pro long-context tier; July 2026; TierUp/APIpulse; third-party-estimated. dev
- $18.00 per 1M output tokens for Gemini 3.1 Pro long-context tier; July 2026; TierUp/APIpulse; third-party-estimated. dev
- $0.50 per 1M input tokens for Gemini 3 Flash; July 2026; TierUp/APIpulse; third-party-estimated. dev
- $3.00 per 1M output tokens for Gemini 3 Flash; July 2026; TierUp/APIpulse; third-party-estimated. dev
- $0.075–0.10 per 1M input tokens for Gemini 2.5 Flash-Lite; July 2026; APIpulse; third-party-estimated. dev+1
- $0.30–0.40 per 1M output tokens for Gemini 2.5 Flash-Lite; July 2026; APIpulse; third-party-estimated. dev+1
- $0.14 per 1M input tokens (cache miss) for DeepSeek V4 Flash; official doc as of July 4 2026; official-published. tldl+1
- $0.0028 per 1M input tokens (cache hit) for DeepSeek V4 Flash; official doc as of July 4 2026; official-published. api-docs.deepseek+1
- $0.28 per 1M output tokens for DeepSeek V4 Flash; official doc as of July 4 2026; official-published. tldl+1
- $0.435 per 1M input tokens (cache miss) for DeepSeek V4 Pro; official doc as of June 2026; official-published. api-docs.deepseek+2
- $0.003625 per 1M input tokens (cache hit) for DeepSeek V4 Pro; official doc as of June 2026; official-published. api-docs.deepseek
- $0.87 per 1M output tokens for DeepSeek V4 Pro; official doc as of June 2026; official-published. api-docs.deepseek+1
- $0.27 per 1M input tokens for DeepSeek V4 base; June 2026; DeepSeek comparison; official-published. deepseek
- $0.55 per 1M output tokens for DeepSeek V4 base; June 2026; DeepSeek comparison; official-published. deepseek
- $0.55 per 1M input tokens for DeepSeek R1; June 2026; DeepSeek pricing; official-published. deepseek+1
- $2.19 per 1M output tokens for DeepSeek R1; June 2026; DeepSeek pricing; official-published. deepseek+1
- 2500 concurrency limit for DeepSeek V4 Flash; official doc July 2026; official-published. api-docs.deepseek
- 500 concurrency limit for DeepSeek V4 Pro; official doc July 2026; official-published. api-docs.deepseek
- $2.00 per 1M input tokens for Grok 4.5; July 19 2026; BenchLM stats; third-party-estimated. benchlm
- $6.00 per 1M output tokens for Grok 4.5; July 19 2026; BenchLM stats; third-party-estimated. benchlm
- $0.10 per 1M input tokens for Llama 3.1 8B via Together; July 9 2026; APIpulse Q&A; third-party-estimated. getapipulse
- $0.10 per 1M output tokens for Llama 3.1 8B via Together; July 9 2026; APIpulse Q&A; third-party-estimated. getapipulse
- ~0.068 per 1M tokens blended for Ministral 3 3B; July 19 2026; BenchLM; third-party-estimated. benchlm
- Median LLM API price $1.00 per 1M input tokens; July 19 2026; BenchLM stats; third-party-estimated. benchlm
- Median LLM API price $4.00 per 1M output tokens; July 19 2026; BenchLM stats; third-party-estimated. benchlm
- ~2625× price spread between cheapest and most expensive model; July 19 2026; BenchLM stats; third-party-estimated. benchlm
- 90% input-token discount for DeepSeek cache hits; 2026; DeepSeek pricing; official-published. tldl+2
- Deprecation date 2026-07-24 15:59 UTC for deepseek-chat and deepseek-reasoner; DeepSeek doc; official-published. api-docs.deepseek
- Per-run "typical" token budget 4,000 input, 1,500 output; 2026; derived from agentic loop measurements; third-party-estimated. benchlm+2
- Per-run "low" token budget 1,500 input, 800 output; 2026; derived; third-party-estimated. benchlm+1
- Per-run "high" token budget 10,000 input, 4,000 output; 2026; derived; third-party-estimated. benchlm+2
- Total 4-model frontier matrix cost ≈$12.83 at typical tokens and r=3; 2026; calculated from prices above; third-party-estimated.
- Total 4-model frontier matrix cost ≈$21.38 at typical tokens and r=5; 2026; calculated; third-party-estimated.
- Total 8-model frontier+open matrix cost ≈$13.27 at typical tokens and r=3; 2026; calculated; third-party-estimated.
- Total 8-model frontier+open matrix cost ≈$22.12 at typical tokens and r=5; 2026; calculated; third-party-estimated.

Would you prefer that we tune the token-per-run assumptions (1.5K / 4K / 10K) to match a specific aster-mission-mcp transcript length you already have, or keep using these generic envelopes?

## RECONSTRUCTED TOOL OUTPUT ENDS
