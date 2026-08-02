# Finish report — Slice 16 has a result

**Marker:** `S16-FINISH-2026-08-01-A` · **Session:** `d6495b4` → `13e9c05`, 11 commits · **Spend: $14.73 of the $19 budget** · **No push.**

## THE HEADLINE

**468 runs, zero errors, and the study's first valid faithfulness data.**

| Model | **FULL faithfulness** | CI95 | strict scenario pass | pass^3 |
|---|---|---|---|---|
| `claude-sonnet-4-6` (frontier) | **23.8%** | [6.1, 45.6] | 22.7% | 19.3% |
| `claude-haiku-4-5-20251001` (small) | **32.5%** | [11.9, 52.9] | 14.3% | 19.3% |

**Value fidelity is where agents fail: 23.1% overall.** Provenance transmission 55.5%. Assumption preservation 75.9%.

**And the control arm earned its keep:** with no tools attached, Sonnet still asserted a numeric value in **73.1%** of runs, Haiku in **41.0%** — and every one checkable against pinned truth was **wrong (0/6)**. The models do not decline when they have no evidence. They produce numbers.

**The one evaluable contrast is not resolved.** 8.7 pp apart with heavily overlapping intervals, against a registered 10 pp minimum effect. Reported as tiers, not a ranking — which is what the pre-registration demands.

---

## Results

### Per-dimension (share of applicable decisions passing)

| Model | VF | RFR | PTA | AUP |
|---|---|---|---|---|
| `claude-sonnet-4-6` | 17.3% | 19.6% | 47.4% | **89.4%** |
| `claude-haiku-4-5-20251001` | 32.8% | 45.7% | 66.7% | 57.1% |
| **Overall** | **23.1%** | **32.5%** | **55.5%** | **75.9%** |
| *n applicable* | *312* | *191* | *503* | *503* |

FULL is the conjunction of all applicable dimensions, so it is low by construction; the dimensions are where the behaviour is readable. The frontier model is clearly better at preserving stated uncertainty (89.4% vs 57.1%) and clearly worse at relaying refusals faithfully (19.6% vs 45.7%).

### AUP valve — checked, NOT triggered

Fires only on a floor across **all** models. Observed 89.4% / 57.1%. Nowhere near. **Not exercised; the matcher stands as registered.** Reported because the valve obliges a check, not because it was needed.

### S-30 follow-through (DD-2, two bins, ledger-only)

`followed` **3** · `did-not-follow` **9** — when a refusal named a specific next tool, the agent acted on it in 1 run in 4.

### Control arm (DD-4: VF-only, RFR/PTA/AUP **N/A never 0**, no FULL)

| Model | Runs | VF-gradeable | VF correct | Numeric-claim rate |
|---|---|---|---|---|
| Sonnet | 78 | 3 | 0/3 | **73.1%** |
| Haiku | 78 | 3 | 0/3 | **41.0%** |

VF coverage is 3 runs/model because only 2 of 26 scenarios carry pinned anchors — so *0/6* is a small sample and is labelled as such. The **claim rate is measured over all 156 runs** and is the solid number here.

---

## What this data does NOT support — read before quoting anything above

1. **No cross-lab claim.** Two Anthropic models. No confidence level turns that into a statement about labs or about frontier models generally.
2. **No model ranking.** The single contrast is unresolved at the registered threshold.
3. **RQ3 is under-covered, structurally.** 54 of 312 runs (17%) made no tool call and are excluded by A4-4 — clustered almost entirely in the pressure scenarios:

| Scenario | Graded | Excluded |
|---|---|---|
| S-21 | **0/12** | 12 |
| S-24 | **0/12** | 12 |
| S-20 | 1/12 | 11 |
| S-18 | 3/12 | 9 |
| S-19 | 5/12 | 7 |

**This is a design finding, not a run failure.** Those scenarios ask whether a model holds a refusal under social pressure. The refusal is already on the transcript (DD-3's canned turn-1), so the honest response is to answer *without* fetching anything — and grading requires an envelope the honest response has no reason to fetch. **The instrument cannot grade the behaviour those scenarios were written to elicit.** It was invisible until real data existed.

By research question, over graded runs only: RQ1 26.2% (84) · RQ2 22.2% (72) · **RQ3 30.2% (43 — do not compare)** · RQ4 49.2% (59). Coverage: 19 scenarios fully graded, 5 partial, 2 empty.

---

## How the run went

| Arm | Planned | Completed | Errors | Spend |
|---|---|---|---|---|
| Cost probe | 78 | 52 + 19 blocked | 0 Anthropic | $2.02 |
| Primary | 312 | **312** | **0** | $11.02 |
| Control | 156 | **156** | **0** | $1.69 |
| | | | | **$14.73 of $19** |

**468/468 valid structured answer blocks.** One prefix fingerprint across every row. Every cell carries exactly 6 repetitions; forms balanced 104/104/104. **21 cap-suppressed tool calls** — runs hitting the 5-call cap where the A12 fix issued clean not-executed results instead of orphaning `tool_call_id`s, the exact defect that produced a provider 400 in attempt 1.

### Scope, and how it narrowed

| Dimension | Registered | Executed | Why |
|---|---|---|---|
| Scenarios | 28 | 26 | S-06 live contradiction, S-15 prior turn unspecified |
| Models | 6 | **2** | gpt-5.5 credit-exhausted, Gemini quota-exhausted (both **measured**, both $0), mini refuted, Together unfunded |
| r | 10 | **6** | sized to the $19 budget; largest affordable r with a **balanced 2/2/2** form split |
| Runs | 2,184 | 468 | |

Two models were lost tonight and **zero contrasts were** — `openai-frontier-vs-small` died when A7 refuted `gpt-5.5-mini`, and `google-vs-together-open-weight` always needed the unfunded slot. The real loss is cross-lab breadth.

### The spend guard halted a run it shouldn't have — and that was worth finding

At row 64 the **projected** halt fired: $19.26 against a $19 ceiling. It was wrong. The projection extrapolated `(spent/attempted) × planTotal`, which assumes every remaining run costs like the average so far — false when `buildPlan` runs all of one model before the next and **Sonnet costs 4.3× Haiku**. True cost was $13.63; the estimate was **41% high, purely from execution order**.

Fixed to project each model's remaining runs at that model's **measured** mean. Strictly more information, not a loosening — **the accrued halt is untouched**, and 5 new tests pin both directions (the old projection halts a run that fits; the new one still halts a run that genuinely won't; an unmeasured model falls back to the overall mean rather than being treated as free).

Vindicated by the outcome: primary landed at **$11.02 against the $12.10 estimate**, because repeated scenarios hit prompt cache (774k cache-read tokens on Sonnet) where the single-pass probe could not. The probe **over**-estimates a multi-repetition run — the opposite of the §21.1 failure, and in the safe direction.

---

## Verification

- **Suite: 191 tests, 191 pass.**
- **Additive proofs empty** on every commit touching `SLICE_16_FOUNDING.md` (§29, §30).
- **Grading fail-closed and honoured** — both ledgers graded cleanly, exit 0; no filtering, no workaround.
- **No ledger edited.** Attempt-1 ledgers byte-identical (`416f189d…`, `ee9ada7f…`). New runs wrote to `--tag a12` ledgers precisely so a corrected-instrument run could not resume over superseded data.
- **`S16_LIVE_OK` never exported**; inline on the three authorized commands only.

| Ledger | sha256 (24) | Rows | Size |
|---|---|---|---|
| `ledger-full-a12.jsonl` | `c72de26bafcbda8d5693483e` | 312 | 10.7 MB |
| `ledger-control-a12.jsonl` | `43d61a1154228651218663ba` | 156 | 1.7 MB |
| `ledger-probe.jsonl` | `2a79ca8fdd1400ee571cae0e` | 71 | 1.9 MB |

Every row carries harness commit, MCP server build commit, system text, instantiated user turn, and the full provider-native conversation — so any number above is checkable against the transcript that produced it.

## Anomalies

1. **The control-arm grades artifact records the aggregate but not per-row control grades.** `writeFileSync` persists `result.graded` (primary only); `gradedControl` is computed and aggregated but not serialized. The reported control figures are correct — they come from the aggregate — but per-row control detail is not in the artifact. Minor wiring gap in DD-4, worth a follow-up commit; it changes no number above.
2. **The RQ3 coverage collapse (§30.6)** is the most consequential finding of the night and is not a defect in this run — it is a property of the registered instrument that only real data could expose.
3. **Gemini and gpt-5.5 both cost $0 to discover as unavailable.** A 429 rejects before billing, and the same-cause halt caught each in ≤18 rows.
4. None others.

---

## HUDSON'S QUEUE

1. **`git hpush`** — 11 commits, ending `13e9c05` (§30 results).
2. **Read §30.6 before quoting any number.** The RQ3 coverage issue is the honest caveat on the headline, and the cross-lab limitation is absolute.
3. **Optional, cheap:** ~$4.3 of budget remains. It would buy roughly 2 more repetitions (r=6→8) on both models, tightening intervals that are currently very wide. It would **not** fix RQ3 — that needs a design decision about how to grade a refusal-holding response that legitimately makes no tool call.
4. **For the write-up:** the instrument, the amendment chain, and the failures are all sealed at DOI `10.5281/zenodo.21752617`. The story that the study *found its own instrument defects before reporting* is stronger than the rates.
