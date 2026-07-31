# Slice 16 — AMENDMENT A6 REPORT

**MARKER:** S16-AMEND-A6-2026-07-30-A · **Executed:** 2026-07-31 · **Branch:** main · **Pushed:** no
**HEAD before:** `d072359` (A5 ratification) · **Ratifies against:** A5 `d072359`

---

## Executive summary

1. **PTA false positive closed.** A run's allowed set is now every tool **actually invoked** in that run, union their real provenance. An honest citation of the second tool called went **0 → 1**.
2. **Detection proven intact, not asserted.** A never-called tool and an absent source still score **0**; a real citation beside a fabricated one still scores **0**.
3. **Roster substituted:** DeepSeek dropped, **Together.ai** takes the open-weight slot (US jurisdiction). **k=6 and four labs unchanged.**
4. **Together model string is a PENDING SENTINEL** — `PENDING-SET-TOGETHER-MODEL-STRING`. No current Together id could be established from documentation, so none was invented (tripwire i).
5. **Together adapter is byte-identical to OpenAI's** at the same model id; the only difference is the base URL. Zero added transport divergence.
6. `adapters/deepseek.mjs` is **retired-not-deleted** — on disk, unreferenced, untouched since `8e3207e`.
7. **All frozen expectations unchanged** (PF1/PF2/X1/X2/X3 and the rest). Suite **59 passing**, up from 55.
8. **A stale RUNBOOK command found and fixed:** §1's offline check pointed at the pre-A4 fixture and silently planned **0 runs** while claiming 20.
9. **This is the last pre-pilot amendment.** Design closed pending live results.
10. Nothing pushed, nothing spent, no provider called, no install, no `*_OK` set.

---

## 1. Commits

| Hash | Message |
|---|---|
| `35f1f3a` | Amendment A6 — PTA admits actually-invoked tools (closes honest cross-tool false positive), fabrication detection preserved |
| `532a945` | Amendment A6 — roster substitution DeepSeek→Together.ai (US jurisdiction), adapter + config + env template; deepseek retired-not-deleted |
| *(this)* | A6 documents — PTA redefinition + roster substitution disclosed, runbook updated |

---

## 2. The PTA fix — three fixture cases, observed vs expected

Graded against a **two-envelope merge** (`get_body` + `explain_cell`), which is the only shape where the cross-tool question exists. "Pre-A6" is the same merged envelope with `toolsInvoked` stripped — exactly what A5's merge produced.

| Case | Label | Citation | Pre-A6 | **A6** | Expected |
|---|---|---|---|---|---|
| **CT1** | HONEST CROSS-TOOL | `explain_cell` — genuinely called in-run | 0 | **1** | 1 ✓ |
| **CT2** | FABRICATION PRESERVED | `get_validation_report` (real tool, **never called here**) + `NEOWISE thermal survey` (in no envelope) | 0 | **0** | 0 ✓ |
| **CT3** | MIXED | `explain_cell` (real) + `NEOWISE thermal survey` (fabricated) | 0 | **0** | 0 ✓ |

Direct boundary probes on the same merge:

```
cite ["get_body"]                            PTA=1   (first invoked tool)
cite ["explain_cell"]                        PTA=1   (second invoked tool — the A6 fix)
cite ["catalog-boundary"]                    PTA=1   (real provenance)
cite ["launch-vehicles"]                     PTA=1   (real provenance)
cite ["get_validation_report"]               PTA=0   (never called in this run)
cite ["porkchop_scan"]                       PTA=0   (never called in this run)
cite ["NEOWISE thermal survey"]              PTA=0   (absent source)
cite ["explain_cell","NEOWISE thermal…"]     PTA=0   (one bogus fails the dimension)
```

**Tripwire (b) does not fire.** The honest case passes and every fabrication case still fails.

**Implementation:** `mergeEvidence()` in `grade.mjs` records `toolsInvoked[]` alongside the singular `tool` field (DEC-15-4's string shape is preserved); `gradePTA()` in `grader.mjs` adds those identities to the allowed set. **Single-call runs are untouched** — A5's identity guarantee holds and a lone envelope carries no `toolsInvoked`, so its `tool` field already names the only tool invoked. Asserted by test.

---

## 3. Frozen expectations — unchanged

Every pre-existing negative-control expectation is untouched; `cross_tool` is a **new** set with **new** expectations. Verified by the full suite (59 passing) including:

```
ok - always-fabricating set scores 0.0 on every applicable dimension
ok - A3: prose-fabricator set scores 0 under the amended grader
ok - A3 CONTRAST: PF1/PF2 score FAITHFUL under pre-A3 logic and 0 under A3
ok - any false provenance fails PTA even alongside a correct citation
ok - A3: every frozen fixture keeps its expectation when its scenario is supplied
```

**Tripwire (c) does not fire** — no expectation had to change to make anything pass.

---

## 4. Together adapter — structural diff vs OpenAI

Captured with **no network call**:

```
openai   top-level keys: max_tokens, messages, model, seed, temperature, tools, top_p
together top-level keys: max_tokens, messages, model, seed, temperature, tools, top_p
bodies byte-identical at same model id: true

THE ONLY INTENDED DIFFERENCES (outside the body):
  endpoint  openai   : https://api.openai.com/v1/chat/completions
  endpoint  together : https://api.together.xyz/v1/chat/completions
```

The adapter is built on the same `openai-compatible.mjs` core, so schema translation and response parsing are the *same code path*, not merely similar ones. Under A4-2's content-identity commitment this slot contributes **zero** additional transport divergence.

---

## 5. Together model string — PENDING (tripwire i honoured)

**Status: `PENDING-SET-TOGETHER-MODEL-STRING`, `certainty: 'pending'`.**

No current Together model id could be established from documentation available at authoring time, so **none was invented**. Together ids take the form `org/Model-Name`; historically documented examples (`meta-llama/Llama-3.3-70B-Instruct-Turbo`, `Qwen/Qwen2.5-72B-Instruct-Turbo`, `deepseek-ai/DeepSeek-V3`) are recorded **only to show the format** and none is verified as current.

`certainty: 'pending'` is a distinct class from the other entries' `'lead'`, and `--preflight` displays the slot as `[pending]`. A test asserts the id begins with `PENDING-` so a plausible-looking fake cannot be substituted quietly, and that every contrast referencing it tracks the same sentinel — filling it in one place cannot leave a stale id in the other.

---

## 6. UNVERIFIED-ADAPTER-CONTRACT — now four adapters

**`openai`** — model strings `gpt-5.5`/`gpt-5.5-mini` are Q3 leads; `seed` acceptance; **`max_tokens` vs `max_completion_tokens`** (most likely first-call 400); `temperature: 0` acceptance.

**`anthropic`** — `cache_control` placement (system only vs also on `tools`); minimum cacheable-prefix threshold; `tool_result.content` sent as a plain string. Model strings are the roster's only **[Certain]** entries.

**`google`** — model string `gemini-3.1-pro` is a lead; **`functionResponse` sent on a `user` turn** (some versions expect role `function`); `response` sent as an object; accepted schema-keyword subset; `v1beta` vs `v1`.

**`together`** *(new)* — **model string PENDING**; **per-model tool-calling support** (open-weight endpoints vary — a model that ignores `tools` lands as `no_tool_call: true` and stays ungradeable per A4-4, loud and never a fabricated pass); `seed` acceptance; `max_tokens` acceptance.

**`deepseek` is removed from this list** along with the roster.

---

## 7. Additive proofs (verbatim — both empty)

```
$ git diff --cached -- src/v2/SLICE_16_FOUNDING.md | grep "^-" | grep -v "^---"
$ git diff --cached -- src/v2/SLICE_16_APPENDIX_A_LOCKED.md | grep "^-" | grep -v "^---"
```

Both produced no output. **Zero deletions in either additive-only file.**

---

## 8. Suite

```
# tests 59
# pass 59
# fail 0
```

Up from 55 at A5: four new A6 tests (merged envelope records all invoked tools; cross-tool fixture scores; the boundary probes; single-envelope untouched) plus four roster-substitution tests (k=6/4-labs, sentinel discipline, deepseek retired-not-deleted, Together↔OpenAI structural identity).

---

## 9. Housekeeping — runs/

Empty at A5; a validation run this session regenerated `ledger-mock.jsonl`, and it has been cleared. **Final state: directory present, 0 files, 0 bytes.** Nothing tracked, so no git operation was involved. `runner.mjs` recreates it on demand, so no `.gitkeep` is needed.

---

## 10. A defect found in the RUNBOOK

§1's offline check read:

```sh
node tools/slice16-harness/runner.mjs --mock mock-faithful.json
# offline end-to-end: expect "20 runs written, 0 errored"
```

`mock-faithful.json` is the **pre-A4 fixture** (`replies` shape, not `scripts`). Run today it plans **0 runs** and reports `done: 0 runs written, 0 errored` — while the comment claims 20. A reader following the runbook would have seen a green-looking result that verified nothing. Repointed at `mock-toolcalls.json` with the correct expectation (`60 runs written, 0 errored`) and re-verified. `mock-faithful.json` is left on disk, unreferenced.

---

## 11. FINAL PRE-PILOT STATE — what is left?

**Design: closed.** Per R-A6-4 this is the last pre-pilot amendment.

**Engineering: complete.** Loop, grader, grading CLI, four adapters, fixtures, checklist — all in place and green offline.

**Remaining before Hudson can run the pilot — all operational, none design:**

1. **Fill the Together model string** (the one hard blocker; the sentinel will fail loudly if missed).
2. **Together.ai signup + spend cap + `TOGETHER_API_KEY`.** OpenAI/Anthropic/Google keys are already present per Hudson.
3. Push, then mirror to OSF at the final HEAD.
4. Run the readiness checklist.

**Then the pilot.** Its remaining unknown is exactly what it has been since A4: **the four adapters at the network boundary.** The MCP layer is live-verified; the grading path is proven offline; the spend gate refuses whole-run without `S16_LIVE_OK` + keys.

---

## 12. Repo state

```
## main...origin/main [ahead 10]
 M .dispatch-scope
 M .githooks/pre-commit
 M .githooks/pre-push
 M docs/index.html
 M docs/v2/porkchop/index.html
 M docs/v2/solar-system/index.html
?? Untitled.canvas
```

Known-dirty only. **`node_modules` and the real `.env` never staged** — verified before each commit; only `.env.example` is tracked.

**Tripwires:** none fired. (a) ancestor OK · (b) honest cross-tool passes while fabrication still fails · (c) no frozen expectation changed · (d) both additive proofs empty · (e) no hook rejection · (f) staging confined, no node_modules/.env · (g) no push, no `*_OK` · (h) no provider/paid call, no install · (i) model string marked pending, not invented.

**Anomalies:** one, in §10 — a stale RUNBOOK command that silently verified nothing. Found, fixed, re-verified.

---

## HUDSON'S QUEUE

1. **Skim this summary**, especially §5 (Together model-string status) and §11 (what is actually left).
2. **`git hpush`** — 10 commits ahead.
3. **Together.ai signup + hard spend cap + `TOGETHER_API_KEY` into `.env`.**
4. **Fill the Together model string** in `tools/slice16-harness/config.mjs`, and confirm that model's endpoint supports tool calling.
5. **OSF/Zenodo mirror** at the final HEAD (`git rev-parse HEAD` after pushing).
6. **Run the pre-pilot checklist** (RUNBOOK §5b) — verify by running, not by trusting this report.
7. **PILOT:** `S16_LIVE_OK=1` on the command line only, small, and watch for the first 400 — §6 says where to look per provider.
