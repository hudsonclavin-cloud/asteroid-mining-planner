# Finish report — sealed, then halted at row 1 of the probe

**Marker:** `S16-FINISH-2026-08-01-A` · **Session:** `d6495b4` → `dfc878a`, 6 commits · **Spend this session: $0.00** · **No push.**

## THE HEADLINE

**No faithfulness numbers. The seal landed and is verified — then the cost probe halted on its first run: OpenAI has no credits remaining.** Zero dollars spent; a 429 rejects before inference bills.

**The one thing worth taking from tonight:** the same fault that ran 128 wasted attempts on 2026-08-01 was caught in **one row** by the registered halt this time. The remediation is not theoretical any more.

**Your decision is one word.** The study's only evaluable contrast is Anthropic-internal, so **proceeding without OpenAI costs one model and one lab of breadth — and zero contrasts.**

---

## 1. The seal — VERIFIED, gate box 1 CLOSED

| | |
|---|---|
| Version DOI (immutable) | **`10.5281/zenodo.21752617`** |
| Concept DOI | `10.5281/zenodo.21752616` |
| Record | <https://zenodo.org/records/21752617> — `state: published` |
| Sealed commit | `670b039cd6a0e8d2f8a31350f4ecf22524b4a0e2` |
| Via tag | `slice16-prereg-v1` |
| Published (exact) | `2026-08-01T23:44:23.499178+00:00` *(your ~23:44:00Z was close; this is Zenodo's own value)* |
| Deposit | 107,309,820 B — full repository tree |

**Binding checked, not assumed** — three independent facts, because a seal that names the wrong tree is worse than none:
1. The record resolves and reports `state: published`.
2. Its related identifier is `isSupplementTo .../tree/slice16-prereg-v1`.
3. `git tag --points-at 670b039` returns `slice16-prereg-v1` **in this repository**.

And `origin/main` was at `670b039` when the deposit was made — so the sealed tree was **already public at seal time**. The §25.1 defect (local-only commit, 74 seconds before collection) is not repeated. Recorded as founding **§27**.

## 2. Gemini re-activated, as instructed

`gemini-3.1-pro-preview` moved `blocked` → `active`, with a price row added (`$2.00/$12.00` per M, Q3 third-party-estimated) — the spend guard's own test requires every active model to be priced, and it would have failed otherwise. Roster went 3 → **4 models**; executed scope 1,040 primary + 312 control.

Recorded honestly in config: quota state is **not verifiable without spending**, so this re-activation is *a measurement, not a confirmation* — the probe was the test. Roster order puts Google **last**, so a Google quota failure could not cost the other three models' data.

## 3. The probe — halted at row 1

```
mode=probe planned=104 already-done=0 pending=104
prefix fingerprint: 71ec9e6e426337f8

SAME-CAUSE HALT (registered, SLICE_16_FOUNDING.md §20.6):
  1/1 attempted runs in this arm failed for one cause (100.0% > 25%).
  cause: Error: openai 429:
        "You have no credits remaining. Add credits to continue using the API"
  The ledger is preserved (1 rows this invocation); fix the cause, then
  re-issue the same command — the runner resumes from the ledger.
exit 5
```

**Tripwire (b) fired — credit exhaustion. Stopped immediately, no retry, as instructed.**

- Failed run: `gpt-5.5::S-01::ORIGINAL::0`
- **Priced spend: $0.0000** — no `usage` on the row; a 429 rejects before billing
- Row records `harnessCommit 89e4afa` / `serverBuildCommit 9c61a52` (the A12 transcript capture working)
- `loadLedger` → **0 keys done**, so the L2-7 retry fix holds: a re-run after top-up re-attempts this cell rather than skipping it

### The remediation, validated in production

| | Attempt 1 (pre-remediation) | Probe (post-remediation) |
|---|---|---|
| Condition first true at | row 147 — 37/147 = 25.17% | **row 1 — 1/1 = 100%** |
| Harness behaviour | **ran 128 more attempts**, reached 275 rows | **halted immediately**, exit 5 |
| Stopped by | a human watching a monitor | the registered halt, automatically |
| Wasted attempts | 128 | **0** |

Same fault class, same day, opposite outcome. This is the L5-1 fix's first production firing.

### What the probe did NOT establish

- **Anthropic and Google credit status: UNKNOWN.** The halt came before their turn. Provider credit can't be checked without a billing call, so I am not assuming they're funded.
- **Gemini's quota: still unmeasured.** It was re-activated *to be measured*, and the probe never reached it. Status reverts to unmeasured — not "working".
- **Zero per-scenario cost data.** PRE_RUN_GATE box 11 remains open; every cost figure below is still an estimate.

## 4. Gate status

| # | Box | Status |
|---|---|---|
| 1 | Public seal | ✅ **CLOSED tonight** — DOI verified, binding checked |
| 2 | Design STOPs resolved | ✅ A12 |
| 3 | HEAD == origin/main | ⚠️ **6 commits unpushed** (mine, this session) |
| 4 | Tests green | ✅ **183/183** |
| 5 | Strict CLI | ✅ |
| 6 | Spend guard | ✅ code; **console caps still yours** — and OpenAI's balance is the live proof this matters |
| 7 | Same-cause halt | ✅ **and it fired for real tonight** |
| 8 | Transcript capture | ✅ commits recorded on the probe row |
| 9 | Scenarios instantiate | ✅ all 26 |
| 10 | Control-arm grading | ✅ (4-anchor coverage caveat stands) |
| 11 | Scenario-stratified cost | ❌ **BLOCKED — the probe is the blocker** |
| 12 | Ledger state | ✅ 7 ledgers, all checksummed |

## 5. Your options, with real numbers

Projections use measured per-scenario tokens from the halted run + pilot; unmeasured scenarios at the non-S-13 median. Pre-cache-credit, so OpenAI-inclusive figures run ~15–25% under.

| | Scope | Probe | Primary | Control | **Total** |
|---|---|---|---|---|---|
| **1 — top up OpenAI** | 4 models | $5.06 (104) | $50.59 (1,040) | $6.83 (312) | **$62.48** |
| **2 — drop OpenAI** | Anthropic ×2 + Google | $2.88 (78) | $28.83 (780) | $3.89 (234) | **$35.61** |
| **3 — stop tonight** | — | — | — | — | **$0** |

### What dropping OpenAI actually costs

| Contrast | With OpenAI | Without |
|---|---|---|
| `openai-frontier-vs-small` | ✗ *(already dead — `gpt-5.5-mini` does not exist, A7)* | ✗ |
| **`anthropic-frontier-vs-small`** | ✅ | ✅ **survives** |
| `google-vs-together-open-weight` | ✗ *(Together unfunded)* | ✗ |

**Zero contrasts lost.** What you lose is one frontier model and one lab of descriptive breadth — real, but not structural. Option 1 also exceeds the $60 ceiling you set at STOP-2 ($62.48 pre-cache-credit; likely ~$50–55 after).

**Recommendation (mine): option 1 if topping up is quick — the study is stronger with three labs, and OpenAI was its most-exercised model. Option 2 if you'd rather not touch billing tonight; it's cheaper, it keeps the one contrast that matters, and OpenAI can be added later — the runner resumes and pays only the increment.**

## 6. Ledgers — all preserved, none touched

| File | sha256 (16) | Rows |
|---|---|---|
| `ledger-probe.jsonl` **(new)** | `d4d10370a3988f80` | 1 |
| `ledger-full.jsonl` | `416f189d8b1bdb7e` | 275 |
| `ledger-pilot.jsonl` | `ee9ada7fbe8b1e5c` | 16 |
| `ledger-pilot-…-round2-QUARANTINED…` | `48cf1d51a3d5cdd3` | 16 |
| `ledger-pilot-…-first-contact-ERRORED` | `92e5fe7fc5bf876a` | 20 |
| `ledger-mock.jsonl` | `ade105a54d978ede` | 18 |
| `ledger-mock-…-pre-A9-r10.jsonl` | `9a87193b40c77058` | 60 |

Append-by-runner only. Nothing edited, split, moved, or deleted.

## 7. Spend

| | |
|---|---|
| **This session** | **$0.00** |
| Historical (pilots + attempt 1) | $13.82 |
| Every projection tonight | unspent |

## 8. Commits (6, unpushed)

| Commit | What |
|---|---|
| `cb4dbfa` | §27 seal recorded — DOI, commit, tag binding verified |
| `89e4afa` | Gemini re-activated + priced; tests updated for the 4-model roster |
| `dfc878a` | §28 probe incident — halt at row 1, $0, guard validated |
| *(earlier, pushed by you)* | `ac863ff` probe mode · `365f2f8` seal draft · `670b039` finish report |

## 9. Anomalies

1. **I misreported the probe's exit code in my first message after it finished.** The task notification said "exit code 0"; that was the shell wrapper's `echo`, not the harness — the harness exited **5**. I said "exit 0 — zero errors, Gemini's quota is back" and that was wrong on both counts. Corrected within the same turn on reading the actual output, but it was stated before I checked, which is the error.
2. **`harnessDirty: true`** on the probe row — expected, from the known-dirty set (`.dispatch-scope`, hooks, `docs/` CRLF). Worth knowing that a future *sealed* run should be launched from a clean tree so the row's provenance is unambiguous.
3. **Option 1 exceeds the $60 STOP-2 ceiling** at $62.48 pre-cache-credit. Flagged rather than silently absorbed.
4. None others.

---

## HUDSON'S QUEUE

1. **Pick one word:** `1` (top up OpenAI, 4 models, ~$62) · `2` (drop OpenAI, 3 models, ~$36) · `3` (stop tonight).
2. If `1`: add OpenAI credits first — then I re-issue the identical probe command and it resumes from row 1 with nothing lost.
3. **`git hpush`** — 6 commits, including the §27 seal record.
4. Console spend caps (gate box 6's human half) — tonight is the live argument for them.
