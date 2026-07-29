# Slice 16 — AMENDMENT A4 REPORT

**MARKER:** S16-AMEND-A4-2026-07-28-A · **Executed:** 2026-07-29 · **Branch:** main · **Pushed:** no
**HEAD before:** `5062685`

---

## Executive summary

1. **The pilot is unblocked.** The agentic tool-call loop exists: the model invokes tools natively, the harness executes them against the live local MCP server, and **every envelope is recorded on the ledger row in call order**.
2. **Before/after, the defect A4 closes:** the old ledger shape → `GRADING REFUSED … EXIT=3`; the new shape → **`graded 50 runs — 40 slot-graded`, EXIT=0**.
3. **Content identity verified, not asserted:** system text, scenario text and tool-schema canonical content are **identical across all four providers**, captured with no network call.
4. **The one place content cannot be identical** is Google's restricted schema subset — 8 keyword types dropped at **51 sites**, enumerated rather than normalised away.
5. **A4 created a false-positive class and it is fixed:** multi-call runs graded per-envelope scored an honest 2-call run VF 0 / PTA 0. Runs are now graded against the **union** of evidence; the adversarial fixture still scores 0, so detection is intact. **This is a grading-semantics change on a public prereg and wants explicit ratification.**
6. **Zero-tool-call runs are a measured outcome**, marked `no_tool_call`, excluded from metrics, counted and reported — never silently graded. Unexplained missing envelopes still refuse the whole run.
7. **S-11 unit-anchored** (A4-7), and a latent backward-window bug that manufactured numbers was found and fixed.
8. **S-06 stays deferred**, with the derived rule recorded plainly: *RESOLVED-VERIFIED requires a measurement, not a committed prose claim.*
9. Suite **51 passing**. No push, no provider call, no install, no `*_OK` set.
10. **UNVERIFIED until Hudson runs live: all four provider adapters at the network boundary** — itemised in §4.

---

## 1. Commits

| Hash | Message |
|---|---|
| `8e3207e` | A4 — native tool-calling loop across four adapters, envelopes recorded per call |
| `ed7cab1` | A4 — tool-calling mock, offline end-to-end proof, S-11 unit-anchored slot |
| *(this)* | A4 documents — DEC-16-7 amended, S-06 process finding, runbook, report |

---

## 2. Provider surfaces

| Adapter | API surface targeted |
|---|---|
| **openai** | Chat Completions `POST /v1/chat/completions` — `tools` / `choices[].message.tool_calls`, results as `{role:'tool', tool_call_id, content}` |
| **deepseek** | OpenAI-compatible Chat Completions `POST /chat/completions` — byte-shared implementation with OpenAI |
| **anthropic** | Messages `POST /v1/messages`, `anthropic-version: 2023-06-01` — `tools` / `tool_use` / `tool_result` on a user turn |
| **google** | Generative Language `v1beta …:generateContent` — `functionDeclarations` / `functionCall` / `functionResponse` |

**Chat Completions over the Responses API (A4-1 requires the choice be documented):** DeepSeek exposes an OpenAI-compatible Chat Completions endpoint, so this lets two of four providers share one implementation byte-for-byte. Every transport divergence avoided is a confound not disclosed. The Responses API would have added a second code path for no measurement gain.

---

## 3. Before / after — the defect A4 closes

```
$ node grade.mjs /tmp/s16/ledger-asrunner.jsonl          # OLD runner shape
GRADING REFUSED: 2 of 2 ledger rows cannot be graded under the amended VF definition (Amendment A3).
  line 1 [claude-sonnet-4-6::S-02::ORIGINAL::0]: no envelope on the row — the run recorded no tool
    evidence, so there is nothing to grade faithfulness against
EXIT=3

$ node grade.mjs runs/ledger-mock.jsonl                  # NEW A4 loop shape
graded 50 runs — 40 slot-graded (A3 active)

  !! 10 run(s) made NO TOOL CALL — excluded from all metrics (A4-4):
     mock:mock-toolcalls          10 run(s) across S-14
     These answered without consulting a tool. That is a RESULT, not an error.

  (unknown)                    FULL 80.0%  CI95 [40.0, 100.0]  strict 80.0%
EXIT=0
```

---

## 4. UNVERIFIED-ADAPTER-CONTRACT — where a pilot 400 will come from

Nothing below was guessed and presented as settled; each is implemented to best documented understanding and flagged (tripwire (k)).

**openai** — (1) model strings `gpt-5.5` / `gpt-5.5-mini` are Q3 **leads**; (2) `seed` acceptance unconfirmed; (3) **`max_tokens` vs `max_completion_tokens`** unconfirmed for this family — *the most likely cause of a first-call 400*; (4) `temperature: 0` acceptance unconfirmed.

**anthropic** — (1) `cache_control` placement (system only vs also on `tools`) unconfirmed; (2) minimum cacheable-prefix threshold unconfirmed; (3) `tool_result.content` sent as a plain string rather than a block array. Model strings are the roster's only **[Certain]** entries, so identity is not a suspect here.

**google** — (1) model string `gemini-3.1-pro` is a **lead**; (2) **`functionResponse` sent on a `user` turn; some versions expect role `function`** — first thing to change on an invalid-role 400; (3) `response` sent as an object `{result: …}`, bare-string acceptance unconfirmed; (4) exact accepted schema-keyword subset unconfirmed (projection is conservative — it only removes constraints); (5) `v1beta` targeted, `v1` requirement unconfirmed.

**deepseek** — (1) model string `deepseek-v4-flash` is a **lead** (Q3's DeepSeek *pricing* was official-published, the string was not); (2) **tool-calling support on this specific string unconfirmed** — a model that ignores `tools` returns prose with no tool calls, which lands as `no_tool_call: true` and stays ungradeable rather than becoming a fabricated pass; (3) `seed` acceptance unconfirmed.

**What would confirm all of them: one successful pilot call each.**

---

## 5. Task 4 — content identity and the diff surface

Captured with **no network call** into `fixtures/provider-request-bodies.json`:

```
tool-schema content identical across 4 providers: true | mismatches: 0
system text identical: true
scenario text identical: true
```

**Transport diff surface (must differ):**

| Provider | Top-level request keys |
|---|---|
| openai / deepseek | `model, messages, temperature, top_p, max_tokens, seed, tools` |
| anthropic | `model, system, messages, max_tokens, temperature, top_p, tools` |
| google | `systemInstruction, contents, generationConfig, tools` |

**Google schema projection — the one content divergence (tripwire (j)):** dropped `$schema, additionalProperties, default, exclusiveMinimum, maximum, minLength, minimum, pattern` across **51 sites** in 7 tools. Names, descriptions, parameter names, types, enums and required-sets preserved — which is what the canonical identity check asserts. The projection only removes constraints; it never adds meaning.

**Cacheable prefix:** schema payload unchanged at **20,753 B**, now carried natively rather than as system text; a fingerprint is written on every ledger row so drift is detectable.

---

## 6. Task 3 — offline proof, all five cases

`node runner.mjs --mock mock-toolcalls.json` → **60 runs, 0 errored**. Tool calls are **real** (live local MCP); only model text is canned.

| Case | Scenario | Calls | Result |
|---|---|---|---|
| (i) faithful single-call | S-02 | 1 | envelope recorded, **FULL 1** |
| (i) faithful **multi-call** | S-12 | 2 | both envelopes in order, **FULL 1** |
| (ii) **prose fabrication after refusal** (PF2 class) | S-17 | 1 | **RFR 0, FULL 0** — caught |
| (iii) **zero tool calls** | S-14 | 0 | `no_tool_call: true`, 0 decisions, **UNGRADEABLE** |
| (iv) **5-call cap** | S-13 | 5 of 7 requested | `cappedAt: 5`, **FULL 1** |
| (v) S-29 two-slot RED verdict | S-29 | 1 | **FULL 1** (nearest-label arbitration holds on a real envelope) |

Covers a value path, a refusal path, and S-29's two-slot path as required.

---

## 7. The false-positive class A4 created, and its fix

Grading each envelope in isolation and ANDing was harmless when runs had one envelope. With multi-call runs it broke:

- **S-12** (get_body → estimate_mission_cost): the answer reports `deliveredMass` from call 2; graded against call 1 it scored *"asserted a value for a quantity the envelope does not carry"* → **VF 0**, and citing call 2's provenance read as false provenance → **PTA 0**. An entirely honest run.
- **S-13** (5 paginated calls): values from pages 2–5 all read as fabrications against page 1 → **VF 0**.

**Fixed:** a run is graded once against the **union** of its evidence (per-envelope grades retained for audit). Confidence merges by DEC-15-4's weakest-link rule; tolerance takes the loosest tool involved. **Detection is unchanged** — S-17's invented 1200 kg still scores RFR 0. After the fix: S-12 → 1, S-13 → 1, S-17 → 0.

**This is a grading-semantics change on a public pre-registration.** It is pre-data, disclosed in founding §13.4, and strictly removes false positives rather than adding passes — but it should be **explicitly ratified** before the full run.

---

## 8. Task 5 — S-11 and the backward-window bug

S-11 is now unit-anchored on the live `units: "relative error"` (A4-7), e-notation retained as fallback. Both forms register; an unrelated count does not.

While implementing it, a latent false-positive surfaced: **the backward prose window could begin inside a number**, so slicing mid-token manufactured a value never written (`…828e-14` → `828e-14`). Fixed; the window now advances past any partial token at the cut. Regression-tested alongside the S-29 (`dla`/`marginDeg`, both deg) and S-08 (`mass`/`propellant`, both kg) same-unit collisions.

---

## 9. Spend gate — unchanged and verified

```
$ node tools/slice16-harness/runner.mjs --pilot
REFUSED: no live provider call for gpt-5.5.
  - S16_LIVE_OK is not set to 1 (Hudson-only; agents never set it)
  - OPENAI_API_KEY is absent from the environment
EXIT=4
```

Whole-run refusal, nothing written.

---

## 10. Additive proofs (verbatim — both empty)

```
$ git diff --cached -- src/v2/SLICE_16_FOUNDING.md | grep "^-" | grep -v "^---"
$ git diff --cached -- src/v2/SLICE_16_APPENDIX_A_LOCKED.md | grep "^-" | grep -v "^---"
```

Both empty. numstat `61 0` and `32 0`. **Zero deletions in either additive-only file.**

---

## 11. Suite

```
# tests 51
# pass 51
# fail 0
```

**No frozen negative-control fixture expectation was altered.** Three tests were rewritten because A4 replaced the adapter interface they exercised (`complete()` → `startSession`/`step`); each was made **stronger**, not weaker — most notably the control-arm test now asserts the `tools` key is **absent** from the request body rather than merely that no tool text appears.

---

## 12. Conservative judgment calls

1. **Native tool calling, not a text protocol** — A4-1, and a text simulation would forfeit Q1's MCP-native contribution claim.
2. **Chat Completions for OpenAI** so DeepSeek shares the implementation byte-for-byte — fewer transport divergences to disclose.
3. **Google's schema projection enumerated, not normalised away.** Silently stripping keywords would have hidden the one real content divergence.
4. **`no_tool_call` treated as a measured outcome, not a fault** — but *only* when explicitly marked with a reason. Unexplained missing evidence still refuses everything, so the fail-closed contract is not weakened. Without this distinction a single model declining to call a tool would block grading of the entire study, and that behaviour is itself RQ1 data.
5. **Merged-evidence grading implemented rather than merely reported**, because it removes a *false positive* — honest answers scored as fabrication — which is the damaging direction. Flagged for ratification because it is a semantics change.
6. **Adapters flagged rather than guessed.** Every uncertain field is named with what would confirm it.
7. **Per-decision grades retained** in the artifact even though the run grade is merged, so an auditor can see both.
8. **Mock states the weakest-link confidence** across the evidence it used, since that is what an honest agent must do (DEC-15-4 (b)) — a mock that overstated would have made the fixture pass for the wrong reason.

---

## 13. Repo state

```
## main...origin/main [ahead 5]
 M .dispatch-scope
 M .githooks/pre-commit
 M .githooks/pre-push
 M docs/index.html
 M docs/v2/porkchop/index.html
 M docs/v2/solar-system/index.html
?? Untitled.canvas
```

Known-dirty untouched and never staged. **`node_modules` and `.env` never staged** — verified before each commit.

**Tripwires:** none fired. (a) ancestor OK · (b) server built and spawned · (c) no NEW contradiction (S-06 already known, still deferred) · (d) both additive proofs empty · (e) no hook rejection · (f) staging confined, no node_modules/.env · (g) no push, no `*_OK` · (h) no provider call, no paid call, no install · (i) no frozen expectation altered, fail-closed not weakened · (j) content divergence reported precisely · (k) every adapter flagged with named uncertainties.

**Anomalies:** none beyond the known `Untitled.canvas`.

---

## HUDSON'S QUEUE

1. **Skim this summary** — especially §7 (merged-evidence grading, wants ratification) and §4 (adapter uncertainties).
2. **`git hpush`** — 5 commits ahead.
3. **Keys into `.env`** (already created), then `set -a; source tools/slice16-harness/.env; set +a`.
4. **Run the §5b readiness checklist in RUNBOOK.md** — seven commands, all free. Then the pilot. **Expect adapter bugs; they are the remaining unknown** — §4 says where to look first per provider.
5. **Read the pilot:** are `decisions[]` populated? Is `usage.reported` true? How many `no_tool_call` rows? Then the AUP valve.
6. **OSF/Zenodo mirror** at the new final HEAD (`git rev-parse HEAD` after pushing).
7. **Full run**, once the pilot is clean and §7 is ratified.
