---
name: dispatch-writer
description: >
  Use when Hudson asks to write a Codex dispatch, draft instructions for the
  execution agent, or produce a new dispatch for any Slice N task. Outputs a
  correctly-structured dispatch block ready to paste into Codex.
---

# Dispatch Writer

Generates dispatches for Aster's Codex-based execution workflow. A dispatch is
a plain-text instruction block handed to Codex (the execution agent) to run
against the repo. Hudson writes the dispatch; Codex executes it; Hudson reviews
and pushes manually.

---

## Dispatch structure

Use this template. Every section is required unless marked optional.

```
Goal: <One sentence — the atomic deliverable. No compound goals.>

CONTEXT:
- Repo HEAD: <commit hash> on <branch> (<what was just completed>)
- <Any other state Codex needs to know before reading the steps>

CRITICAL — <HEADING if there's a non-obvious gotcha>: (optional)
<Mapping, warning, or invariant that must be understood before the steps.
State this explicitly; don't bury it in the steps.>

STEPS:

1. <Verification or read step — confirm state before mutating anything>

   <exact shell command>

2. <Next step>
   <exact shell command>

   …

N-1. Verify:

   <objective evidence commands — see rules below>

N. Commit:

   git add <specific file or dir>
   git add <second specific file or dir>        # repeat for each staged path
   git status                                   # verify only expected files staged
   git commit -m "<conventional commit message>"

   DO NOT PUSH. Hudson pushes after review.

N+1. Report:
   - <metric 1 — objective, verifiable>
   - <metric 2>
   - Git status (clean expected)
   - Last commit hash
   - Any anomalies

CONSTRAINTS:
- <What NOT to do — scope limits, banned commands, side-effect prohibitions>
```

---

## Non-negotiable rules

**Atomic commits.** One logical change per commit. If a dispatch does two
separable things, split it into two dispatches or two commits.

**Explicit staging only.** Always `git add <specific path>`. Never `git add -A`
or `git add .`. Accidental inclusion of cache files, binaries, or secrets has
happened before.

**STOP gates before commit.** Any step that mutates files must be followed by a
manual-verification gate before the commit runs. Phrase them as:

> STOP. Verify <what to check> before continuing. Report if unexpected.

**Never push from a dispatch.** The last step is always `git commit`. Hudson
reviews the diff and pushes manually. Do not add `git push` to any dispatch.

**Side-file + atomic-swap for long-running file mutations.** If a dispatch
generates a large file (catalog, cache, fixture), write to a `.tmp` side-file
first, then `mv` it to the final path atomically. Do not write directly to the
target path while it may be partially written.

**STOP and report rather than guess.** If a step produces unexpected output
(wrong file count, mismatched hash, missing file, surprising diff), STOP and
surface the anomaly in the report. Do not proceed by guessing.

**Objective evidence in the verify step.** Any dispatch that mutates files must
print verifiable output so the report is checkable, not trusted:

```
wc -l <file>
git diff --stat
git show --stat HEAD
find <dir> -name "*.json" | wc -l
```

A malfunctioning agent once claimed a "read-only copy" while silently deleting
5 000+ lines. Verification-in-the-dispatch is the catch.

**Don't run the build or test suite unless the dispatch requires it.** Don't add
`npm test` or `npm run build` unless explicitly scoped. Builds are slow and
may fail for reasons unrelated to the dispatch's change.

---

## Worked example (condensed from Dispatch 1 — research ingestion)

```
Goal: Ingest 7 research PDFs and Perplexity outputs into src/v2/research/,
write PROVENANCE.md files, create README.md, commit.

CONTEXT:
- Repo HEAD abc1234 on main (Slice 9 closed and deployed)
- Source files confirmed in ~/Downloads

CRITICAL — PROMPT-TO-FILE MAPPING:
PDF filenames do NOT map to prompts in order. Verified mapping:
  Executive_Summary.pdf    → Prompt 4 (Risk/Portfolio/UX) → slices 18-20
  Executive_Summary__1_.pdf → Prompt 2 (Resource Science) → slices 14-15
  …
If a PDF's first page doesn't match the expected opening line, STOP.

STEPS:

1. Verify source files present:

   ls -lh ~/Downloads/Executive_Summary.pdf ~/Downloads/Executive_Summary__1_.pdf …

   STOP if any file is missing.

2. Create directory structure:

   mkdir -p src/v2/research/{slice-10-lambert,slice-11-porkchop,…}

3. Copy files to canonical locations:

   cp ~/Downloads/Executive_Summary__3_.pdf src/v2/research/slice-10-lambert/deep-research-trajectory-spacecraft-engineering.pdf
   …

4. Write PROVENANCE.md in each folder — use verbatim content below:
   …

5. Verify:

   ls -la src/v2/research/          # expect 11 subdirs + README.md
   find src/v2/research/ -name "PROVENANCE.md" | wc -l   # expect 11
   find src/v2/research/ -name "*.pdf" | wc -l            # expect 4

6. Commit:

   git add src/v2/research/
   git status                        # verify only research/ is staged
   git commit -m "research(v2): ingest Slice 10-20 research artifacts (Deep Research + Perplexity, 2026-05-22)"

   DO NOT PUSH.

7. Report:
   - File count by folder
   - Total bytes ingested
   - Git status (clean expected)
   - Last commit hash
   - Any anomalies

CONSTRAINTS:
- No analysis or summarization — pure ingestion
- Don't edit source files; copy verbatim
- Don't run npm test or npm build
```

---

## Dispatch scope guidance

| Situation | Guidance |
|---|---|
| Two separable changes | Two dispatches or two commits |
| Long-running file generation | Side-file + atomic-swap; verify byte count before swap |
| Validation / measurement | One dispatch per measurement; close the OQ in the founding doc separately |
| Refactor touching many files | Split into (a) copy/extract, (b) wire-up, (c) delete-dead-code dispatches |
| Uncertainty about expected output | Add a STOP gate with a specific check; don't guess |
