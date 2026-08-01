# Finish report — stopped at Phase 1 on the public seal

**Marker:** `S16-FINISH-2026-08-01-A` · **Session:** `d6495b4` → `365f2f8`, 2 commits · **NO push, NO spend, $0.00 spent this session.**

## THE HEADLINE

**No faithfulness numbers. Stopped at Phase 1 because the public pre-registration seal does not exist — tripwire (j), a hard blocker on spending.**

Everything Phase 1 does not block is done: state verified, 183/183 tests green, the entire 12-box gate walked with evidence, the missing `--probe` mode built and committed, the probe preflight computed, and the scope options costed from measured per-scenario data. **The seal is one paste away** — `SEAL_DRAFT.md` holds the metadata and the exact command sequence. After it lands, the run is two words from you: `go`, then a scope choice.

**The good news in the numbers:** the probe is **~$4.19** and the *full* 26×3×r=10 run is **~$41.89** (~$36 with the measured OpenAI cache credit) — comfortably inside the $60 ceiling. The feared "full run is unaffordable" outcome did not materialise.

---

## Phase 0 — state verification

| Check | Result |
|---|---|
| HEAD at session start | `d6495b4` |
| `origin/main` | `d6495b4` — **matched**, Hudson's push confirmed |
| `d6495b4` ancestor of HEAD | yes |
| Offline suite | **183 tests, 183 pass, 0 fail** (≥ the 179 after A12; +4 from the new probe tests) |
| Working tree | only the known-dirty set; nothing staged |

**Read from `config.mjs` directly, not from memory:**

- **ACTIVE scenarios: 26** — S-01…S-05, S-07, S-08, S-10…S-14, S-16…S-26, S-28, S-29, S-30
- **DEFERRED: 2** — S-06 (live ground-truth contradiction), S-15 (prior turn unspecified)
- **STRUCK: 2** — S-09, S-27 · **PRIMARY registered: 28**
- **ACTIVE roster: 3** — `gpt-5.5`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`
- Excluded: `gpt-5.5-mini` refuted · `gemini-3.1-pro-preview` quota-blocked · Together deferred
- r: **10 registered / 10 executed** · executed counts **780 / 234 / 1,014**

---

## Phase 0.3 — PRE_RUN_GATE, all twelve boxes

| # | Box | Status | Evidence |
|---|---|---|---|
| 1 | Public seal exists | ❌ **BLOCKED** | Every mention in the founding doc reads PENDING (lines 141, 214, 1213). **Tripwire (j).** |
| 2 | Design STOPs resolved | ✅ PASS | All seven DD rulings instantiated as A12 (§26). |
| 3 | HEAD == origin/main | ⚠️ **was PASS, now 2 ahead** | My probe-mode and seal-draft commits are local. **Push before sealing** — the seal must name a public commit. |
| 4 | Instrument tests green | ✅ PASS | 183/183. |
| 5 | Strict CLI refuses garbage | ✅ PASS | `--ful` → 2 · `--help` → 0 · `--preflight --full` → 2. |
| 6 | Spend guard halting | ✅ PASS (code) | 9 L5-3 tests pass. **Console hard caps remain yours to confirm.** |
| 7 | Same-cause halt | ✅ PASS | 13 L5-1 tests, pinned at the real 37/147 crossing. |
| 8 | Transcript capture | ✅ PASS | 2 × 4.2 tests: commits, system text, instantiated turn, native conversation. |
| 9 | Scenarios instantiate | ✅ PASS | **ALL 26 ACTIVE SCENARIOS INSTANTIATE CLEANLY**; 9 multi-turn instantiations (S-18/S-20/S-24 × 3 forms). |
| 10 | Control-arm grading | ✅ PASS | DD-4 landed; caveat recorded — 4 pinned anchors vs 26 scenarios, so most control rows are descriptive-only. |
| 11 | Scenario-stratified cost | ⏳ **READY, unrun** | `--probe` built and committed; preflight below. Blocked only by box 1. |
| 12 | Ledger state intentional | ✅ verified | 6 ledgers, all checksums identical to founding §25.3; **no `ledger-probe.jsonl`** — the probe starts clean. |

**Three blockers: box 1 (seal), box 3 (push my 2 commits), box 6's console caps.** Boxes 1 and 3 are the same action sequence.

---

## Phase 1 — TRIPWIRE (j): the seal

The founding doc says PENDING in every place the mirror is mentioned, and §25.2 — written during remediation — makes it explicit:

> *"Before ANY future data collection: the full corrected chain must be pushed to the public remote AND sealed externally (OSF/Zenodo or equivalent), with the registration URL/DOI and the sealed commit hash recorded in this document. A run started before that seal exists would repeat the exact defect this section discloses."*

I cannot create it — it needs your account. **`SEAL_DRAFT.md` (committed) contains:** the four-step push → seal → record → push sequence with copy-paste commands, a paste-ready `§27` block with two placeholders, and full OSF/Zenodo metadata — title, keywords, related identifiers, and a description that states plainly that this seals a *revised* instrument, that the revision is part of the record, and that **no faithfulness result has ever been produced**.

**Nothing in this session's instructions indicated you had already done the seal**, so I did not wait on it — I completed every non-blocked task instead.

---

## Phase 2 — probe preflight (STOP-1, ready to fire)

`--probe` did not exist; the runner had preflight/pilot/full/control/mock only. Built it: **every active scenario × every active model × r=1**, its own `ledger-probe.jsonl`, rows marked `arm: 'probe'` so they can never enter the primary aggregate (which filters on `arm === 'primary'`). Four tests pin it. Verified refusing without `S16_LIVE_OK` (exit 4).

**Planned: 78 runs** = 26 scenarios × 3 models × r=1.

**Projected cost — built from measured per-scenario tokens, not a flat average** (that average is precisely the §21.1 mistake):

| Basis | Projection |
|---|---|
| Guard model (full price on all input) | **$4.19** |
| With the measured OpenAI cache credit (~70% hit, 50% discount) | **~$3.60** |
| Worst case if *every* one of the 14 unmeasured scenarios were S-13-class | $30.27 |

The worst case is a bound, not an expectation: **S-13 is the only enumeration scenario in the set**, and it is 20× the median. But 14 of 26 scenarios have *zero* cost observations — which is the entire reason the probe exists.

### Measured per-scenario cost, gpt-5.5 (12 of 26 scenarios, from the halted run + pilot)

| Scenario | ~calls | input tok | output tok | $/run |
|---|---|---|---|---|
| **S-13** | **5** | **173,495** | **3,102** | **$0.9605** |
| S-05 | 3 | 10,485 | 1,464 | $0.0963 |
| S-11 | 1 | 5,415 | 1,910 | $0.0844 |
| S-08 | 1 | 5,564 | 1,686 | $0.0784 |
| S-04 | 1 | 5,549 | 719 | $0.0493 |
| S-07 | 1 | 5,903 | 620 | $0.0481 |
| S-03 | 1 | 5,539 | 657 | $0.0474 |
| S-02 | 1 | 5,550 | 645 | $0.0471 |
| S-01 | 1 | 3,449 | 290 | $0.0259 |
| S-12 | 0 | 1,404 | 348 | $0.0175 |
| S-10 | 0 | 1,401 | 321 | $0.0166 |

**S-13 alone is 44% of the projected full-run budget** ($18.30 of $41.89 across all three models at r=10). Unmeasured scenarios are estimated at the non-S-13 median (5,539 in / 657 out).

---

## Phase 3 — scope options (STOP-2, pre-probe estimates)

Costs are **pre-probe**; the probe replaces them with measurement. Control arm ≈ **$5.65** on top (r=3, no tools, cheaper — no tool schema in the prefix).

| Option | Scope | Runs | Est. cost | Cache-adj | What you get / lose |
|---|---|---|---|---|---|
| **A — full** | 26 scen × 3 × r=10 | 780 | **$41.89** | ~$36.02 | The registered repetition count. Full power at the registered 10-pp effect size; every scenario represented. |
| **B — r=5** | 26 scen × 3 × r=5 | 390 | $20.94 | ~$18.01 | Half the cost. Wider CIs; `faithfulness-pass^3` gets noisier; strict-scenario-pass loses resolution. Extensible later — the runner resumes and pays only the increment. |
| **C — full minus S-13** | 25 scen × 3 × r=10 | 750 | $23.59 | ~$20.29 | Saves 44% by dropping one scenario. **Loses the basis-laundering probe the appendix calls "stronger than drafted"** — and it is the scenario DD-1 was just retargeted for. |
| **D — r=5 minus S-13** | 25 scen × 3 × r=5 | 375 | $11.80 | ~$10.14 | Cheapest meaningful run; both losses above compound. |

**Recommendation (mine): A — full.** It fits the $60 ceiling with the probe and control included (**$4.19 + $41.89 + $5.65 ≈ $51.73**), it is the registered design rather than a compromise, and after four rounds of instrument correction the thing worth buying is a result that needs no asterisk about repetition count. B is the sensible fallback if the probe reveals unmeasured scenarios are pricier than the median — and B → A later costs only the increment.

**Note:** these totals do not include the $13.82 already spent historically; I read STOP-2's "$60 total including the probe" as covering tonight's spending.

---

## Ledger dispositions

All six preserved, untouched, checksums identical to founding §25.3:

| File | sha256 (16) | Rows |
|---|---|---|
| `ledger-full.jsonl` (halted attempt 1) | `416f189d8b1bdb7e` | 275 |
| `ledger-pilot.jsonl` (round 3) | `ee9ada7fbe8b1e5c` | 16 |
| `ledger-pilot-2026-07-31-round2-QUARANTINED-pre-A8-sampling.jsonl` | `48cf1d51a3d5cdd3` | 16 |
| `ledger-pilot-2026-07-31-first-contact-ERRORED.jsonl` | `92e5fe7fc5bf876a` | 20 |
| `ledger-mock.jsonl` | `ade105a54d978ede` | 18 |
| `ledger-mock-2026-07-31-pre-A9-r10.jsonl` | `9a87193b40c77058` | 60 |

No ledger was created, modified, moved, split, deleted, or graded. `ledger-probe.jsonl` does not exist — the probe starts clean.

## Spend

| | |
|---|---|
| **This session** | **$0.00** |
| Historical (pilots + halted attempt 1) | $13.82 |
| Probe, projected | $4.19 (~$3.60 cache-adjusted) |
| Full run + control, projected | $47.54 (~$41.67 cache-adjusted) |

## Commits

| Commit | What |
|---|---|
| `ac863ff` | `--probe` mode: every active scenario × r=1, own ledger, `arm:'probe'`, 4 tests |
| `365f2f8` | `SEAL_DRAFT.md`: paste-ready OSF/Zenodo metadata + the push→seal→record sequence |

## Anomalies

1. **My own commits re-broke gate box 3.** HEAD is now 2 ahead of origin. Deliberate — probe mode must be committed before collection (design fixed on disk) — but it means **push before sealing**, or the seal names a commit no reader can fetch. Sequenced explicitly in `SEAL_DRAFT.md`.
2. **Google's quota cannot be checked without spending.** A ListModels call confirms the string resolves but says nothing about quota; a 429 only appears on a `generateContent` call, which bills. So `gemini-3.1-pro-preview` **stays excluded with disclosure**. Say the word if you want it probed — it would add a 4th model at ~$1.40 to the probe and restore a second lab to the frontier tier.
3. **The probe's worst-case bound ($30.27) exceeds STOP-1's $10 ceiling**, which is why I would have paused here even without the seal. The realistic figure is $4.19; the gap is entirely "what if all 14 unmeasured scenarios are S-13-class", which is what the probe answers.
4. None others.

---

## HUDSON'S QUEUE

1. **`git hpush`** — 2 commits (`ac863ff`, `365f2f8`).
2. **Seal it.** Open `tools/slice16-harness/SEAL_DRAFT.md`, paste the metadata into OSF or Zenodo, run the four commands, push the `§27` record. *This is the only thing standing between here and data.*
3. **Confirm provider console spend caps** (gate box 6's human half).
4. **Reply `go`** — I run the 78-run probe (~$4.19) and return the measured per-scenario table.
5. **Then pick a scope** — `A` full / `B` r=5 / `C` no-S-13 / `D` both. My recommendation is **A**.

Optional: say so if you want Google probed as a 4th model.
