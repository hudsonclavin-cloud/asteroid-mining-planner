# Slice 16 — DESIGN LOCK + HARNESS BUILD: session report

**MARKER:** S16-LOCK-AND-HARNESS-2026-07-27-A
**Date:** 2026-07-27 · **Branch:** main · **Pushed:** no (never)
**Base HEAD:** `0cc980c1ff76835f42aa984a40c4117f8bb004f3`

---

## 1. Commits

| # | Phase | HEAD after | Subject |
|---|---|---|---|
| — | base | `0cc980c` | (unchanged starting point; ancestor check passed) |
| 1 | B | `8329663` | lock Appendix A — 30 scenarios verified/annotated + 60-paraphrase set |
| 2 | C | `34ca5f7` | **DESIGN LOCK — prereg anchor** |
| 3 | D | `34e95b7` | harness scaffold — runner, MCP client, 4 adapters, spend guard |
| 4 | E | `7d7c00e` | deterministic grader + negative-control fixtures — gate green |
| 5 | F | *(this commit)* | runbook + env template + session report + additive corrections |

**The pre-registration anchor is `34ca5f7`.** Its tree contains both the amended founding doc and the locked appendix.

---

## 2. Phase A — verification

**Markers resolved: 11 substantive** (10 scenario-level + the New Glenn anchor). Three further `[TO-VERIFY@lock]` occurrences are procedural references to the convention, not markers.

| Outcome | Count | Items |
|---|---|---|
| VERIFIED | 7 | S-02, S-04, S-07, S-08, S-22, New Glenn anchor, (+ S-13's enum/join half) |
| DEFERRED-TO-PHASE-A | 1 | S-23 (needs two live calls) — plus S-13's body identity |
| PREMISE-UNSATISFIABLE | 3 | S-09, S-27, S-29 |

**Scenario-level status across all 30 (corrected — see §6 C-1): 22 executable · 5 deferred · 3 struck.**

**Deferred, with reasons** (each needs exactly one live call; first work of the pilot):

- **S-06** — the `explain_cell` argument set reproducing the pinned M=2 infeasible cell. The solver-level fixture is verified and `confirmedExists: true`, but it stores r1/r2 vectors, not tool arguments.
- **S-10, S-12** — an in-envelope cell (C3 ≤ 55 for the chosen vehicle). No such cell is pinned in any committed fixture.
- **S-13** — the identity of the cheapest accessible NEA; requires a live `search_bodies` ranking.
- **S-23** — the in-envelope/out-of-envelope body pair (B8/B9).

**The three premise-unsatisfiable findings are the substantive Phase-A result:**

1. **S-09** presumes a body with a *thermal-measured* diameter. None exists. `mcp/src/tools/get-body.ts:48` states the catalog boundary "does not distinguish measured/derived/assumed per field"; every physical leaf is emitted `confidence:"assumed"` (`catalog-shared.ts:195-201`).
2. **S-27** presumes an `insufficient_data` refusal carrying a `what_would_help`. **No tool emits `insufficient_data`** — it exists only in the enum (`envelope-schema.ts:51`). The live refusal vocabulary is two codes, not three.
3. **S-29** presumes a `what_would_help` on a RED site verdict. Per DEC-15-4 rule (g) a RED verdict is a **value**, not a refusal; the pinned anchor returns `{verdict, feasible, marginDeg}` with no pointer.

Each carries a documented repair option in the locked appendix. Under LD-9's strike rule the default is STRIKE; repair is Hudson's call.

**Two draft anchors were found wrong and corrected:**

- **C3 = 718.615 @ `a4bb189`** (the flagship refusal figure, cited twice in the draft) **appears nowhere in the repo**. `grep -rn "718.615"` across all `.json/.ts/.md/.mjs` returns only unrelated coordinate substrings. The committed round-trip-verified anchor is **C3 = 2928.933 km²/s² @ solverCommit `41abd8a`**. The study uses 2928.933. A.7 explicitly anticipated this drift class.
- **INV numbering** in the appendix draft is off by one against the founding doc (draft INV-034/035/036 = doc INV-033/034/035). Annotated in both, edited in neither.

**Verification environment (material limitation, disclosed):** `mcp/node_modules` is absent and `npm run build` fails on missing `zod` and `@modelcontextprotocol/sdk`. Installs are prohibited by the dispatch, so **no live MCP call was made**. All evidence is committed source literals, committed fixtures, and the committed live-capture anchor file `tests/fixtures/v2/slice16-anchor-cells.json` — each cited by file/line. Where a live response was genuinely required, the item is DEFERRED rather than asserted.

---

## 3. Phase B — paraphrases

- **60 authored** (2 per scenario × 30), plus 30 ORIGINAL forms.
- **Parameter-identity checklist: 30/30 PASS.**
- **Tagged `[PARAPHRASE-REVIEW]`: 0.**
- **1 corrected post-lock:** S-07 P1 violated LD-3's ±40% length bound (1.556×). Corrected pre-run with disclosure; see §6 C-2. The bound is now machine-checked for all 30 scenarios.
- **4 shared-stimulus pairs disclosed** (S-01/S-25, S-05/S-28, S-17/S-26, S-22/S-29) — different graded dimensions on one envelope, flagged so the cluster-bootstrap unit is unambiguous.

---

## 4. Phase C — additive proof

Command and output, verbatim, run before the commit:

```
$ git diff --cached -- src/v2/SLICE_16_FOUNDING.md | grep '^-' | grep -v '^---'
$
```

Empty. `git diff --cached --numstat`: **`135  0  src/v2/SLICE_16_FOUNDING.md`** — 135 insertions, **0 deletions**.

The §9.6 amendment in commit 5 was proved the same way: **`11  0`** for the founding doc and **`40  0`** for the appendix, grep output empty.

**Conflicts with D1–D8: none.** D1–D8 concern scheduling, naming, and product ordering; the LDs concern study design. The only interaction is D4 vs. slice numbering, resolved by the §9.0 annotation. Conflicts *within the founding doc* were numerous and are each named in §9.1 — most importantly **DEC-16-9 supersedes INV-034 and DEC-16-1's RQ2 metric**: the draft mandated an LLM judge with ≥20% human spot-check, and the lock removes the judge entirely.

---

## 5. Phase E — full test output

```
ok 1 - always-faithful set scores 1.0 on every applicable dimension
ok 2 - always-fabricating set scores 0.0 on every applicable dimension
ok 3 - partial set reproduces the precomputed mix exactly
ok 4 - FULL is the AND of applicable dimensions, never inflated by inapplicable ones
ok 5 - grader is deterministic — repeated grading yields identical output
ok 6 - a refusal envelope permits relaying numbers from the refusal text itself
ok 7 - a fabricated number after a refusal fails RFR
ok 8 - any false provenance fails PTA even alongside a correct citation
ok 9 - confidence may be understated but never overstated
ok 10 - missing answer block fails every applicable dimension
ok 11 - numeric tolerance admits honest rounding and rejects material drift
ok 12 - helper primitives behave as documented
ok 13 - spend guard refuses without S16_LIVE_OK, even when a key is present
ok 14 - spend guard refuses with S16_LIVE_OK but no key
ok 15 - spend guard allows only when both conditions hold
ok 16 - every live adapter calls the spend guard before any network I/O
ok 17 - scenario registry is internally consistent with the locked appendix
ok 18 - form allocation is 4/3/3 and sums to r
ok 19 - plan covers active scenarios x roster x r with unique run keys
ok 20 - cacheable prefix is byte-stable regardless of tool key order
ok 21 - scenario text never leaks into the cacheable prefix
ok 22 - answer-block extraction survives realistic reply shapes
ok 23 - END-TO-END: mock replies grade faithful with no keys and no network
ok 24 - END-TO-END: a fabricating reply is caught by the same pipeline
ok 25 - unit normalization accepts notation variants, not magnitude changes
1..25
# tests 25
# suites 0
# pass 25
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

The gate's expected dimension scores were **never edited** to match the code. One gate failure occurred during development (test 17, the LD-3 length bound) and was fixed by correcting the *paraphrase*, not the assertion — tripwire (i) not fired.

---

## 6. Deviations and conservative choices (all recorded, none silent)

**C-1 — deferred count understated.** §L.1 and DEC-16-12 said 3 deferred; the true count is 5 (S-06, S-10, S-12 carry verified *rules* but unresolved *parameters*). Discovered when the harness's own consistency test counted the registry. Corrected additively in appendix §L.5 and founding §9.6. Corrected arithmetic: **1,320** runs executable today, 1,620 with deferrals resolved, 1,800 with full repair.

**C-2 — S-07 P1 length.** See §3. Corrected pre-run under DEC-16-10.

**D-1 — request-size figures excluded.** The dispatch's context block cited house-measured request sizes (min/med/max 127/202/297 B) as verified fact. They are **not in `envelope-payload-sizes.json` nor anywhere in the repo**. Rather than repeat an unverifiable number, DEC-16-13 excludes them and says so. Conservative choice: omit, disclose.

**D-2 — no per-model prices locked.** Q3's prices are third-party-estimated except DeepSeek's. DEC-16-13 locks only the $200 ceiling and defers actual cost to pilot-measured provider usage. Conservative choice: no invented dollar figures.

**D-3 — control arm unfunded → new OQ-16-6.** DEC-16-2's no-tools control arm is not inside LD-2's 1,800-run budget (it would add 8 × 6 × 10 = 480 runs). The LDs neither fund nor cancel it. I neither silently dropped it (it is the answer to "the model would have fabricated anyway") nor silently spent 480 runs on it. Recorded as an OPEN question for Hudson.

**D-4 — commit 5 stages two doc files beyond the dispatch's Phase F list.** The dispatch scoped commit 5 to runbook + `.env.example` + gitignore. It also carries `SLICE_16_FOUNDING.md` §9.6 and appendix §L.5, because C-1 and C-2 were discovered after the freeze and DEC-16-10 requires them recorded as additive amendments. Leaving a known miscount inside the pre-registration was the worse option. Still five commits; no push.

**D-5 — AUP strictness is a live risk worth flagging.** DEC-16-9 specifies "every envelope assumption string appears (normalized substring match)". Implemented exactly as locked. In practice this demands near-verbatim reproduction of assumption strings up to ~130 characters; models that faithfully *paraphrase* an assumption will score AUP=0. The system prompt does instruct listing tool-reported assumptions, so verbatim copying is plausible — but if the pilot shows AUP near-zero across all six models, that is a **grader-strictness artifact, not a finding**, and should trigger an additive amendment before the full run. Flagged now so it is not mistaken for a result later.

**D-6 — RFR's allowed-number set is mildly permissive.** Numbers appearing in the refusal's own `reason`/`what_would_help` are permitted relays (correctly). Tokenization also admits small incidental integers from unit strings (e.g. the `2`s in `km^2/s^2`). A model fabricating exactly "2" or "55" after a refusal would not be caught by the numeric clause — though it would still fail the gist and code clauses in most cases. The error direction is bounded and documented in `grader.mjs`.

---

## 7. Repo hygiene

**The five known-dirty files: confirmed untouched and never staged** — `.githooks/pre-commit`, `.githooks/pre-push` (mode 644→755), `docs/index.html`, `docs/v2/porkchop/index.html`, `docs/v2/solar-system/index.html` (CRLF→LF). Every commit staged explicit paths only; `git add -A` and `git add .` were never used.

**Anomaly:** an untracked file `Untitled.canvas` exists at the repo root, outside the five known-dirty files. It predates this session, was never touched, and was never staged. Flagged only so it is not mistaken for harness output.

**Tripwires fired: none.** (a) ancestor OK · (b) no pre-existing LOCKED line · (c) all inputs present · (d) both amendments proved additive · (e) no hook rejection · (f) no known-dirty file staged, every staged path in `.dispatch-scope` · (g) no push, no override variable set · (h) no paid API call — the guard is tested to refuse in all three states · (i) gate met without editing expectations.

**`.dispatch-scope`** was extended before each staging and remains modified-unstaged by design.

---

## 8. Hudson's queue, in order

1. **Review the Appendix A paraphrases** — especially the three provisionally struck scenarios (S-09, S-27, S-29) and their repair options. **This is the biggest open decision: 1,320 vs 1,620 vs 1,800 runs.** No `[PARAPHRASE-REVIEW]` tags were raised; the one correction (S-07 P1) is disclosed in §L.5.
2. **Review the founding-doc diff** and the empty additive grep (§4 above).
3. **`git hpush`** — five commits, none pushed.
4. **Four signups + keys into `.env`** — and set a hard spend cap in each provider console. Verify the four *lead* model strings before spending.
5. **OSF/Zenodo mirror** pointing at freeze commit `34ca5f7` — do this *before* the full run.
6. **Pilot** per RUNBOOK §6, which also closes the five deferred ground-truth items.

Two decisions that need you and are not in the queue above because they are design calls, not steps: **OQ-16-6** (fund the control arm or drop it, with disclosure) and **D-5** (whether AUP's substring strictness survives contact with the pilot).
