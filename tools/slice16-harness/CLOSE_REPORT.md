# Slice 16 — CLOSE REPORT

**Marker:** `S16-CLOSE-2026-08-02-A` · **Session:** `642dfc9` → HEAD, 5 commits · **NO push, NO spend, NO provider call, NO ledger touched** (attempt-1 checksums re-verified identical: `416f189d8b1bdb7e…`, `ee9ada7fbe8b1e5c…`).

**Slice 16 is CLOSED.** Slice 17 can open on accurate state: founding **§31** is the close-out entry, `STATUS.md` is rewritten to reality, and every open item is triaged below.

---

## 1. What closed, and on what evidence

| | |
|---|---|
| Pre-registered publicly **before** collection | DOI `10.5281/zenodo.21752617`, commit `670b039`, published 2026-08-01T23:44Z — founding §27 |
| Data collected | **468 runs, zero provider errors** (312 primary + 156 control) — §30 |
| Result | FULL faithfulness: Sonnet **23.8%** [6.1, 45.6] · Haiku **32.5%** [11.9, 52.9] — §30 |
| Weakest dimension | **VF 23.1%** — under a quarter of applicable value assertions carried the envelope's numbers — §30.2 |
| Control arm | numeric-claim rate 73.1% / 41.0% with **0/6** checkable values correct — §30.5 |
| Spend | $13.82 + $14.73 = **$28.55** — §21, §30 |
| Close-out record | founding **§31** (§31.1–§31.8), appendix **§L.15** |

**One ruling was recorded this session.** **R-CLOSE-1** — S-20, S-21 and S-24 struck post-data as structurally ungradeable (`struckPostData: true`). Of 312 primary runs, 54 made no tool call, clustered here: **S-21 0/12, S-24 0/12, S-20 1/12**. The primary set moves 28 → **25** for any future run.

Two safeguards make that strike non-corrosive:
1. **The sealed registration is pinned separately.** `config.mjs` now exports `SEALED_AT` (28 primary / 1,680 / 504 / 2,184) with a test asserting it, so an amendment can never quietly overwrite what the DOI archived. §30's results were collected under the sealed numbers.
2. **The strike cannot be outcome-driven.** For S-21 and S-24 no outcome existed to influence it. Collected results are reported flagged, not removed (DEC-16-10), and slot declarations are retained so the collected ledgers stay gradeable by their own instrument.

---

## 2. Open-question triage

**RESOLVED — 6**

| Item | Disposition |
|---|---|
| **OQ-16-1** model matrix | Closed by DEC-16-6 as a *registration* question. Executed 2 of 6 (§31.3). The breadth loss is carried below, not re-opened here. |
| **OQ-16-2** replication vs novelty | Closed as first-measurement-**to our knowledge**, on Q1's three differentiators. Positioning statement, never a literature-completeness claim. |
| **OQ-16-3** runs per cell | Closed by DEC-16-5 (r=10 registered). Executed r=6, disclosed with its reason (§29.2). Registered and executed are never conflated. |
| **OQ-16-4** harness | Closed by the Phase-D scaffold: thin driver, MCP stdio, no agent framework. It ran 468 rows with zero errors. |
| **OQ-16-6** control arm unfunded | Closed **funded** (§10.2) and **executed** — 156 runs, and it produced the study's sharpest single finding (0/6). |
| **DD-1…DD-6** | Ruled, instantiated as Amendment A12, adversarially fixtured both directions (§26). |

**CARRIED TO SLICE 17 — 3.** These are design inputs, not chores.

| Item | Why it goes to design, not backlog |
|---|---|
| **RQ3 redesign** (R-CLOSE-1) | *An instrument can be unable to grade the behaviour its own scenarios were written to elicit.* Asking whether a model holds a refusal under pressure means the honest response fetches nothing — and grading requires an envelope the honest response has no reason to fetch. **No pre-run review would have surfaced this**; it took real data. Slice 17 must decide how to grade a refusal-holding answer that legitimately makes no tool call. §31.6. |
| **The unresolved contrast** | 8.7 pp against a registered 10 pp minimum, intervals heavily overlapping. **Not fixable by re-analysis** — it needs more repetitions or more models, i.e. a budget-and-scope decision at the front of Slice 17, not a patch to Slice 16. |
| **OQ-16-5** harness distortion | Remains **addressed-not-closed**, by design. The structured answer contract (DEC-16-9) is a disclosed trade of ecological validity for deterministic grading. It is a standing threat-to-validity that any successor study inherits and must restate. |

**CARRIED TO BACKLOG — 9.** Real, tracked, none blocking.

| Item | Note |
|---|---|
| Cross-lab breadth: **gpt-5.5** credit-blocked | External. Needs provider funding, not code. 109 successful runs prove the string and adapter work. |
| Cross-lab breadth: **Gemini** quota-blocked | External. A 429 proves the string resolves; needs quota. Cost **$0** to establish. |
| Cross-lab breadth: **Together** unfunded | The slot was never funded; adapter exists. |
| Remaining budget **≈ $4.27** ($19 − $14.73) | Would buy roughly r=6→8 on both models, tightening very wide intervals. **Would not fix RQ3.** Hudson's call; no agent spends it. |
| **Control-grades per-row detail gap** | `grade.mjs` persists `result.graded` (primary only); `gradedControl` is aggregated but not serialized. Reported control figures are correct — they come from the aggregate. Offline wiring fix, zero spend, **changes no published number**. |
| **DD-7** SourceRefs dirty-flag propagation (= C10) | Deferred to the next package release, bundled with the MCP SDK upgrade — a protected-path edit to the frozen instrument, and npm 0.1.0 is immutable regardless. The `prepublishOnly` clean-worktree gate already prevents recurrence, which is the stronger guarantee. §26.7. |
| **MCP SDK upgrade** | Bundled with DD-7 above. |
| **Audit MEDIUM/LOW residue** (C1–C12) | Carried verbatim in `STATUS.md`'s cleanup queue. |
| **CI gap L4-1** | CI runs neither the MCP package tests nor the Slice 16 suite; default `npm test` reaches a subset. Confirmed still true today; commands and their real coverage are tabulated in `STATUS.md`. |

**CLOSED — WONTFIX — 1**

| Item | Reason |
|---|---|
| **`gpt-5.5-mini`** | Refuted by A7: the model does not exist. The `openai-frontier-vs-small` contrast died with it. Re-open only if OpenAI ships a small sibling — this is not a defect to fix. |

**ONE ITEM I AM NOT DISPOSING OF — Hudson's call**

**C12, the signed recovery dispatch for the halted attempt-1 ledger.** Its original purpose — make the 114 successful rows resumable — is moot: the study ran to completion on separately `--tag`ged ledgers, and those rows are permanently excluded as non-data. The only remaining value is archival, which the checksum manifest already covers. **My recommendation is WONTFIX**, but retiring a queued safety artifact is your decision, not mine, so it stays open.

---

## 3. Artifact coherence

Six artifacts framed work as pending or blocking that is now complete. Each received **one appended pointer** — no rewriting, additive proof empty (commit `4c3b7af`).

| Artifact | Was misleading because | Pointer says |
|---|---|---|
| `PRE_RUN_GATE.md` | "no paid collection until every box is checked" | Gate walked and passed; run complete; record, not checklist |
| `REMEDIATION_REPORT.md` | DESIGN DECISIONS QUEUE presented as open | Queue closed by A12; seal, gate and collection all done |
| `SEAL_DRAFT.md` | "**Status: NOT YET SEALED — this is the blocking item**" | Sealed 2026-08-01; DOI and commit recorded |
| `DD_RULINGS_REPORT.md` | next-actions listed the seal and gate as pending; "1,014 runs" scope | Complete; 1,014 was **not** what executed — see §29 |
| `FINISH_REPORT.md` | its scope table predates R-CLOSE-1; queue item 1 stale | Primary set now 25; **every result figure stands as collected** |
| `RUNBOOK.md` | reads as a pending instruction | Procedure of record; primary set is 25, not 28 |

`SLICE_16_APPENDIX_A_LOCKED.md` needed nothing — §L.15 already points to §31.
**Not touched:** `FULL_RUN_REPORT.md` is untracked and on the never-stage list; it describes attempt 1 accurately for its own date. `AMENDMENT_A3/A4/A6`, `PREFLIGHT`, `MCPLIVE`, `SESSION_REPORT` are dated historical records that make no current-state claim.

---

## 4. Verification

- **Slice 16 suite: 191 / 191 pass** (`node --test tools/slice16-harness/test/*.test.mjs`).
- **Root recursive: 71 files, 70 pass / 1 fail** — the documented Node-version false-red in `tests/v2-golden/launch-vehicles.golden.test.mjs` (measured on Node v20.19.6; needs ≥22.18, CI pins 24). Not a math regression.
- **Additive proofs empty** on every commit touching `SLICE_16_FOUNDING.md`, `SLICE_16_APPENDIX_A_LOCKED.md`, and the six pointer artifacts.
- **No ledger read or written this session** beyond `shasum`/`wc`; attempt-1 checksums re-verified identical.
- **`S16_LIVE_OK` never set. Nothing pushed. No provider contacted.**

**One correction worth recording:** `npm test` from inside `tools/slice16-harness/` silently walks up to the repo root and runs the **v2** suite (174 tests), not the harness suite — there is no `package.json` in the harness directory. I reported 173/1-skip as the harness result for one turn before catching it. The harness suite requires the explicit `node --test tools/slice16-harness/test/*.test.mjs`. `STATUS.md` now names all three commands and what each actually covers, so the next reader cannot repeat it.

---

## 5. Ledger artifact decision — REPORT ONLY, NOT ACTED ON

`tools/slice16-harness/runs/` — **13 files, 25 MB**, untracked. Full SHA-256:

**Study evidence, NOT in founding §25.3** (§25.3 was written 2026-08-01, before these existed):

| File | sha256 | Bytes | Rows |
|---|---|---|---|
| `ledger-full-a12.jsonl` (primary) | `c72de26bafcbda8d5693483ef36dfb09cca0113db0594c8b4fb5559d6d349493` | 11,210,666 | 312 |
| `ledger-control-a12.jsonl` (control) | `43d61a1154228651218663baaaaf636cfb3e96cf0ffc769c5f4ea9fb44d068ef` | 1,791,375 | 156 |
| `ledger-probe.jsonl` (cost probe) | `2a79ca8fdd1400ee571cae0e44fa1ca297296cbfece8235ff3a9c82e896411b1` | 2,013,432 | 71 |
| `ledger-full-a12-grades.json` | `8c7cc53a74a1a3a013dac924db1aa2d1ab4cc9ae71b88098e48777d01c5770d3` | 2,054,100 | — |
| `ledger-control-a12-grades.json` | `8a5f8bba6546b39f607d1d8fea165d2bd560f7d31909c5210102728a3f3ea297` | 11,765 | — |

The remaining 8 files (attempt-1, pilots, mocks) are already checksummed in founding §25.3 and were re-verified identical today.

### Does §25.3's manifest satisfy INV-034?

**It satisfies the letter and defuses the violation. It does not achieve the invariant's purpose.**

Global INV-034 binds *"any file referenced… as **committed evidence**"* and verifies via `git check-ignore -v` returning nothing. Precisely:

- **No violation exists.** §25.3 states outright that `runs/` is untracked and that the manifest is the durable record *until* a decision is made; §30.9 and §31.8 repeat "ledgers are untracked". Nothing in the repo claims these files are committed evidence, so the invariant's trigger never fires. §25.3 converted a latent violation into an honest disclosure — that was its job, and it did it.
- **`git check-ignore -v` returns nothing for `runs/`** — confirmed today. The files are **not ignored, merely un-added**. Committing them needs no `!` exception; it needs `git add`.
- **But the evidence still exists on exactly one workstation.** The invariant was born from the Slice 9 cutover sample described as committed and absent. A 25 MB directory holding the only copy of a $28.55 dataset, backing a DOI-sealed study, is one disk failure from unreproducible. A checksum proves a file is unaltered; **it cannot reconstruct it.**
- **Two narrower gaps.** (a) The **grades artifacts have no checksum anywhere in the repo** — §30.9 lists only the three `.jsonl` ledgers, so the derived results backing §30's published numbers are the least-protected files of the set. (b) §30.9 records digests **truncated to 24 hex characters**; §25.3 uses the full 64. Truncation is fine against accident, weak as a tamper record.

**Size is not an obstacle.** 25 MB total, largest file 11.2 MB — well under GitHub's 50 MB warning and 100 MB block. No LFS needed.

### The exact dispatch you would run

Ledger paths are outside every agent's authority without a signed recovery dispatch, so this is written, not executed.

```
# 1. Verify nothing has drifted — must reproduce §25.3 and §5 of this report exactly
cd tools/slice16-harness && shasum -a 256 runs/*.jsonl runs/*.json

# 2. Authorize the paths
echo 'tools/slice16-harness/runs/*' >> .dispatch-scope

# 3. Commit the evidence
git add tools/slice16-harness/runs/
git commit -m "evidence(slice16): commit all 13 run ledgers + grade artifacts per INV-034; checksums pinned in founding §25.3 and CLOSE_REPORT §5"

# 4. Close the manifest gap, additively, in SLICE_16_FOUNDING.md:
#    a new subsection carrying the five full-length digests from §5 of this report
#    (the grades artifacts especially — they back §30's numbers and are currently unchecksummed).
```

**If you would rather not track them:** upload the 13 files to the existing Zenodo deposit as a file set and record the per-file checksums additively in the founding doc. That satisfies the invariant's purpose better than git does, because it puts the evidence beside the registration. Either path closes it; **leaving both undone is the only outcome that does not.**

---

## HUDSON'S QUEUE

1. **`git hpush`** — 5 commits from `642dfc9`. Nothing after `642dfc9` is public yet, including §31.
2. **Decide the ledger question (§5).** Commit the 13 files, or attach them to the Zenodo deposit. Either is fine; the status quo is one disk away from an unreproducible sealed study. **This is the highest-value item in this report.**
3. **Read §31.4 before quoting any figure.** Single-lab is absolute, the contrast is unresolved, RQ3 is under-covered.
4. **C12 needs a yes or no** — I recommend WONTFIX and did not act (§2).
5. **Slice 17 opens on §31.6.** The RQ3 finding — an instrument that cannot grade what its own scenarios elicit — is the strongest thing this slice produced after the instrument itself, and it is a design input, not a bug report.
6. **≈$4.27 remains.** It buys tighter intervals, not a new contrast, and not an RQ3 fix.
