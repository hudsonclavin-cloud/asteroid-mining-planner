# Slice 16 — ARCHIVE REPORT

**Marker:** `S16-ARCHIVE-2026-08-02-A` · **Session:** `dfe9e94` → `05c1359`, 3 commits · **NO push, NO spend, NO provider call.**

**The study's data is now recoverable by someone other than Hudson.** All 13 ledger files are git-tracked, byte-identity proven at three separate points, with a README that makes it impossible to mistake a pilot, a mock, a probe, or the halted first attempt for a result. Slice 16 is complete.

---

## 1. Session state

| Point | HEAD | vs origin |
|---|---|---|
| Session start | `dfe9e94` | ahead 5 |
| After R-ARCH-1 evidence commit | `c037448` | ahead 6 |
| After R-ARCH-2 founding §32 | `6642183` | ahead 7 |
| After R-ARCH-3 C12 ruling | `05c1359` | **ahead 8** |

`origin/main` remains `642dfc9`. Nothing pushed.

---

## 2. Conflicts between CLOSE_REPORT §5's prepared dispatch and these rulings

Reported rather than silently resolved, per tripwire (i). **Three differences, none substantive; one judgment call.**

| # | Prepared dispatch (§5) | This dispatch | Resolution |
|---|---|---|---|
| 1 | Commit message `evidence(slice16): commit all 13 run ledgers + grade artifacts per INV-034…` | Task 7 specifies `data(slice16): commit run ledgers as tracked evidence — 13 files, digests verified, README… [S16-ARCHIVE-2026-08-02-A]` | **Used the task's message.** It is the explicit instruction and carries the session marker, which §5's draft predates. |
| 2 | `git add tools/slice16-harness/runs/` (directory-level) | Task 6: "Stage the 13 ledgers + the README explicitly"; standing rule forbids `-A` / `.` | **Staged 14 paths by name.** A directory add would also have swept `README.md` implicitly and anything else later dropped there. |
| 3 | Step 4 pins "the five full-length digests" (the files absent from §25.3) | R-ARCH-2 additionally requires correcting §30.9's 24-char truncation | **Superset, not a conflict.** §32.2 pins all **13** at full length. |

**Judgment call, flagged.** R-ARCH-1 says *"Append the tracked status additively to founding §25.3."* §25.3 sits mid-document, and the founding doc is append-at-end by unbroken convention (§27–§31). Inserting text into §25.3 would satisfy the `^-`-empty proof yet interleave a 2026-08-02 statement into a 2026-08-01 section — the kind of quiet retrofit the additive rule exists to prevent. **I appended §32, which names §25.3 as superseded on the state question and explicitly preserves it on the reasoning question.** If you intended a literal in-place insertion, say so and it can be redone.

---

## 3. Digest verification — 13 files, three passes

Recorded values are from founding §25.3 (8 files) and CLOSE_REPORT §5 (5 files). **Every comparison was made at full 64 characters; digests are abbreviated below only for display.**

| File | Recorded | Pre-stage | Staged blob | Committed blob |
|---|---|---|---|---|
| `ledger-full-a12.jsonl` | `c72de26bafcb` | OK | MATCH | `c72de26bafcb` |
| `ledger-control-a12.jsonl` | `43d61a115422` | OK | MATCH | `43d61a115422` |
| `ledger-full-a12-grades.json` | `8c7cc53a74a1` | OK | MATCH | `8c7cc53a74a1` |
| `ledger-control-a12-grades.json` | `8a5f8bba6546` | OK | MATCH | `8a5f8bba6546` |
| `ledger-probe.jsonl` | `2a79ca8fdd14` | OK | MATCH | `2a79ca8fdd14` |
| `ledger-full.jsonl` (attempt 1) | `416f189d8b1b` | OK | MATCH | `416f189d8b1b` |
| `ledger-pilot.jsonl` | `ee9ada7fbe8b` | OK | MATCH | — |
| `…round2-QUARANTINED-pre-A8-sampling.jsonl` | `48cf1d51a3d5` | OK | MATCH | — |
| `…first-contact-ERRORED.jsonl` | `92e5fe7fc5bf` | OK | MATCH | — |
| `ledger-mock.jsonl` | `ade105a54d97` | OK | MATCH | — |
| `ledger-mock-2026-07-31-pre-A9-r10.jsonl` | `9a87193b40c7` | OK | MATCH | — |
| `ledger-mock-grades.json` | `c879484e3c49` | OK | MATCH | — |
| `ledger-mock-grades-2026-07-31-pre-A9-r10.json` | `d880fa606695` | OK | MATCH | — |

- **Pre-stage:** `shasum -a 256 -c` against the recorded manifest — **13/13 OK**, and no file present in `runs/` was absent from the manifest.
- **Staged blob:** the check that actually matters — `git cat-file -p :<path>` hashed and compared to the working file, proving **what git stored**, not merely what sits on disk. **13/13 MATCH.**
- **Committed blob:** re-hashed from `HEAD:` after commit (spot-checked on the 6 files that carry study or incident weight). **All match.**
- **Working tree re-verified after commit:** 13/13 still OK. The commit altered nothing on disk.

**Tripwire (b): not fired.** No digest differed from its recorded value at any point.

---

## 4. `.gitattributes` finding — tripwire (c) cleared

**No rule, filter, or encoding setting can touch `runs/`.**

- Root `.gitattributes` contains one line-ending rule — `docs/** linguist-generated text eol=lf` — scoped to `docs/`. No pattern mentions `tools/`, `slice16`, or `runs`.
- `git check-attr text eol crlf filter working-tree-encoding` on **all 13 files**: every attribute resolves **`unspecified`**. No `clean`/`smudge` filter applies.
- `core.autocrlf` unset (⇒ `false`); `core.eol` unset and inert without a `text` attribute. There is no `* text=auto` anywhere, so git performed no normalization.
- The only other `.gitattributes` in the tree is `mcp/node_modules/fast-uri/.gitattributes` — vendored, out of scope, matches nothing here.

Static analysis and the empirical staged-blob comparison in §3 agree: **stored byte-identical.**

**Tripwire (d): not fired.** Largest file `ledger-full-a12.jsonl` at 11,210,666 bytes — 10.7 MB against GitHub's 50 MB warning and 100 MB block.

---

## 5. `runs/README.md`

Written per R-ARCH-1 so no reader can mistake superseded evidence for results. Structure:

- **A warning block first:** *only 4 of these 13 files are study data*, and the 114 successful attempt-1 rows are explicitly not among them.
- **Two tables, separated by status.** STUDY DATA (4 files: the A12 primary and control ledgers plus their two grades artifacts) with arm, rows, timestamps, and error counts. NOT STUDY DATA (9 files) with instrument version and what each actually is — `ledger-full.jsonl` is headed **"HALTED ATTEMPT 1 … this is the incident, not a result."**
- **Full 64-char digests** in copy-pasteable `shasum -c` blocks under each table.
- **Provenance notes**, including two field-naming traps found while writing it (§7 below) and the known `runs: 0` gap in the control grades artifact.
- **A standing instruction not to edit any file in the directory** — frozen evidence under INV-S16-036; corrections are new artifacts plus additive notes, never in-place edits.

One verifiable ordering fact worth surfacing: `ledger-probe.jsonl`'s first row is stamped `2026-08-01T23:49:23Z`, **five minutes after** the seal was published at `23:44:23Z`. The pre-registration-before-collection claim is checkable from the evidence itself, not only from the narrative.

---

## 6. R-ARCH-2 — the two checksum gaps

**(i) Grades artifacts, now pinned.** `ledger-full-a12-grades.json` (`8c7cc53a74a1a3a013dac924db1aa2d1ab4cc9ae71b88098e48777d01c5770d3`, 2,054,100 B) and `ledger-control-a12-grades.json` (`8a5f8bba6546b39f607d1d8fea165d2bd560f7d31909c5210102728a3f3ea297`, 11,765 B). These **back every published figure in §30** and had no checksum in any founding document — §30.9 listed only the three `.jsonl` ledgers, leaving the derived results the least-protected files in the set. Now in founding §32.2. *(They were computed into CLOSE_REPORT §5 last session; the ruling's substance is that they now live in the founding manifest, which is the durable record.)*

**(ii) Truncation corrected additively.** §30.9 records three digests **abbreviated to 24 hex characters**. They are correct — each is a true prefix — but partial: adequate against accidental corruption, weak as a tamper record. **§30.9 was not edited**; the doc is additive-only and the values are incomplete rather than wrong. §32.2 publishes all 13 at full 64 characters and states that it supersedes the abbreviated forms for verification purposes. A study whose central claim is verifiability should not leave a partial digest as its most authoritative record.

**Additive proof:** `git diff --cached -- src/v2/SLICE_16_FOUNDING.md | grep '^-' | grep -v '^---'` → **0 lines**. Tripwire (e) not fired.

---

## 7. C12 — WONTFIX (R-ARCH-3)

Recorded in the CLOSE_REPORT OQ triage, which now shows **CLOSED — WONTFIX — 2**. Reason: the signed recovery dispatch's purpose is moot — the study completed on separately `--tag`ged ledgers and the attempt-1 rows are permanently excluded as non-data — and its remaining archival value is now fully served, since that ledger is tracked as of `c037448` and digest-pinned in §32.2.

The triage **retains the record that C12 was left open**, under the heading it originally carried, with a note that the recommendation and the ruling agreed and that their agreeing is not why the decision was Hudson's to make. Retiring a queued safety artifact should leave a trace.

---

## 8. Repo size impact

| | Before | After | Δ |
|---|---|---|---|
| `.git` on disk | 89 MB | 92 MB | **+3 MB** |
| Loose object size | 15.11 MiB | 17.57 MiB | +2.46 MiB |
| Raw content added | — | — | **25 MB** |

**The push is ~2 MB, not ~25 MB.** Measured, not estimated: `git pack-objects --revs` over `origin/main..HEAD` produces **2.0 MB** (1.8 MB thin), across 64 objects. Ledger rows repeat the system text and tool schemas on every line, so JSONL of this shape deltas and compresses roughly **12:1**. The queue item below is corrected accordingly — expect an ordinary push, not a slow one.

---

## 9. Verification

- **Slice 16 suite: 191 / 191 pass, 0 skipped** (`node --test tools/slice16-harness/test/*.test.mjs`).
- **Root recursive: 71 files, 70 passed, 1 failed; 200 tests passed, 1 failed** — the documented Node-version false-red in `tests/v2-golden/launch-vehicles.golden.test.mjs` (Node v20.19.6 here; needs ≥22.18, CI pins 24). **Identical to the pre-session measurement — nothing regressed.**
- **Additive proof empty** on the founding-doc commit.
- **Staging:** exactly 14 paths, all inside the declared set. No known-dirty path staged. Tripwire (g) not fired.
- **`git status`:** `.dispatch-scope`, two `.githooks` mode changes, three `docs/` CRLF files, `Untitled.canvas`, `tools/audit/`, `FULL_RUN_REPORT.md` — the known-dirty set exactly. `runs/` no longer appears: it is tracked and clean.
- **No push, no `*_OK` variable set, no provider contacted, no install, no spend.** Tripwires (f) and (h) not fired.

---

## 10. Anomalies

**1. I fired a false tripwire and am reporting it rather than burying it.** The first post-stage verification used a `while read … < <(…)` process substitution; in this sandboxed zsh the subshell lost `PATH`, so `git`, `shasum`, `cut` and `basename` all failed with *command not found*. With every command dead, the comparison variable was empty and the script printed **`MISMATCH` for all 13 files and `TRIPWIRE FIRED — HARD STOP`**. That output was an artifact of a broken shell, **not a digest event** — no file was ever in question. I re-ran the check without process substitution and all 13 matched. Recorded because a study about whether agents faithfully transmit tool evidence is the wrong place to quietly discard a false alarm of one's own making.

**2. The prepared push-size expectation was wrong in the helpful direction** — ~2 MB actual against the ~25 MB anticipated (§8).

**3. Two provenance traps in the grades artifacts, found while writing the README and documented there.** (a) Every `*-grades.json` reads `marker: "S16-MCPLIVE-2026-07-27-A"` — that is `grade.mjs`'s own build-marker constant, identifying **the code that produced the artifact, not the session that ran it**; `gradedAt` is the truthful timestamp (`2026-08-02T06:56Z` for both A12 files). (b) `ledger-mock-grades-2026-07-31-pre-A9-r10.json` records `ledger: ".../ledger-mock.jsonl"` because its source was renamed for archival *after* grading. Neither was rewritten — these are evidence artifacts.

**4. The control-grades gap is now empirically pinned, not merely asserted:** `ledger-control-a12-grades.json` carries `ledgerRows: 156` with `runs: []`. The published control figures come from its `aggregates.controlArm` block and are correct; per-row control grades are absent and reproducible by re-running the grader. Unchanged as a backlog item; changes no published number.

**5. Nothing else.**

---

## HUDSON'S QUEUE

1. **`git hpush`** — **8 commits** from `642dfc9`. **Measured payload ~2.0 MB, not 25 MB** (§8) — expect an ordinary push. If it does stall, the largest single object is 10.7 MB, well inside every GitHub limit.
2. **Confirm the push landed**, then verify the evidence survived the round trip: `git ls-tree -r origin/main -- tools/slice16-harness/runs/` should list 14 paths, and the digests in founding §32.2 must reproduce from a fresh clone. That last check is the whole point of R-ARCH-1 — recoverability by someone who is not you.
3. **Slice 16 is then complete.** Slice 17 opens on the inheritance list in `CLOSE_REPORT.md` §2: RQ3 redesign (the strongest finding — an instrument that cannot grade what its own scenarios elicit), the unresolved contrast, and OQ-16-5's standing harness-distortion threat.
