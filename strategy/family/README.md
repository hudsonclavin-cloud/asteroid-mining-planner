# Aster family — hub (branch `aster-family`)

**Status:** PROPOSAL, leads-grade, written 2026-10-26. This directory is the hub for Hudson Clavin's five space-engineering repositories under one house name. It proposes structure, records a measured review, and ships one small working thing: a script-generated Proof Sheet. Nothing here locks a DEC, amends an invariant, renames a repo, or changes any member repo. Strategy lives in `strategy/` and never in `docs/` (which deploys), per `ASTER_FAMILY_MASTER_PLAN.md`.

## The idea in four sentences

Space operations run on decisions made under uncertainty with fragmented evidence, and every one of these five repos answers that in the same voice: a number is not a result unless it carries its source, its confidence class, and a refusal when the data is absent. Aster is the product (a mission planner that shows its sources); Skyhook is the physical program (a tether whose economics are modelled honestly, including the case that does not close); PartForge is the fabrication tool that measures what it makes; Idea-Bank is the sandbox where agents build and grade their own work. The family's job is not to bundle them under a brand but to apply their shared rule to the family itself: one public page where each member makes one claim an outsider can check in three minutes, and every claim not yet true is rendered as a structured refusal that says what would help. Today that page reads **0 of 5 answered**, which is the honest starting line.

## What is in this directory

| File | Kind | What it is |
|---|---|---|
| `PROOF_SHEET.md` | **generated** | The family's one public claim per member, each ANSWERED or a structured refusal, with the command that re-runs it, the HEAD it was checked at, and the date. Regenerate with `node tools/family/family-index.mjs --siblings <dir of clones>`. |
| `MANIFEST.json` | **generated** | Facts per member (HEAD, dates, privacy, licence, Pages, CI, branches, open PRs) read from the GitHub API and local git, plus the sheet rows and the editorial opinions passed through, labelled. |
| `site/index.html` | **generated data, hand-written shell** | A self-contained landing page (not deployed) rendering the manifest: five cards, the Proof Sheet, the connections, the shared conventions. Facts are injected between `family:data` markers by the script. |
| `MEMBERS_EDITORIAL.json` | written | Opinions, kept separate from facts on purpose: each member's role, one-liner, completion estimate with label, verdict, and the five connections. |
| `REVIEW_2026-10-26.md` | written from measured cards | The deep-dive review: per repo, what was run and what it printed, claims vs measured, shipped / unmerged / open items, strengths, weaknesses, risks, the hidden assumption, dependencies, next three moves, time to v1, doc rot; then the cross-repo picture. Each first-pass card was re-checked by an adversarial second pass whose refutations are recorded. |
| `IDEAS.md` | written from the panel | The one thing (the Proof Sheet), the recommended family structure, ideas ranked with effort and labels, what to stop or merge, the hidden assumption Hudson is making, the strongest case against a conglomerate, biases to watch, and the five competing proposals with the judges' scores and the blind spot all five shared. |
| `ROADMAP.md` | written from the panel | Six- and twelve-month sequencing in Hudson-hours, next actions in order, calibrated probabilities, risks with failure modes, the cut rule, and the information that would most improve the plan. |
| `CONVENTIONS.md` | written | The ten conventions the repos already share, with evidence, the five places they disagree, what not to centralize, and an adoption record. |
| `NAME_AND_TRADEMARK.md` | written | Why "Aster" is a trademark question and not a copyright one; who else uses the name (a Minnesota aerospace firm selling orbit software; a live federal Class 9 registration); ranked name forms; the free first step (a law-school clinic). |
| `../ASTER_FAMILY_MASTER_PLAN.md` §9 | appended | Five PROPOSED amendments to the July blueprint: Lenses and Works; Rev A constants by hash-pinned snapshot only; the missed Wave-1 target; generated-not-typed sibling facts; the name. |

Tooling: `tools/family/family-index.mjs` (generator; needs `gh` authenticated and, optionally, local clones) and `tools/family/family-index.check.mjs` (asserts every row has a sha, a date, a command and a complete status, and that the "N of M" header equals the computed count).

## How the five repos map (recommended; Hudson rules)

| Repo | Role | Why |
|---|---|---|
| asteroid-mining-planner | **MEMBER + HUB** | The product and the substrate (evidence envelope, data spine, MCP surface, validation discipline). Carries the name Aster™ because it already uses it (npm 2026-07-10). |
| skyhook | **MEMBER (Works)** | The physical program. Lens L9 Momentum is the planning lens over it, not a rename. Private today; public only after a LICENSE and the branch reconcile. |
| Partforge | **MEMBER (Works)** | Fabrication tool and the family's measurement authority. Keeps its own name and Apache-2.0. |
| Idea-Bank | **LAB** | Linked as the sandbox once it is licensed, CI-gated and its process disclosed; otherwise frozen at 75. Its tooling (phone-width smoke test, words tests, generated ledger) is the most reusable in the family. |
| suborbital-leg-cost-model | **ARCHIVED** | Folded into skyhook the day it was created; one pointer commit, carry its decision-record template, then GitHub archive. |

What the family does **not** centralize: code, deploys, id schemes, test runners, hooks, finance modelling, Idea-Bank's content decisions, and the brand on surfaces that have not earned it. Full list in `CONVENTIONS.md`.

## Where each repo stands (measured 2026-10-26; toward its own definition of done)

| Repo | Completion | Label | One line |
|---|---|---|---|
| Aster | 82% | [Likely] | Real, reproducible product (97/97 test files; byte-identical rebuild) whose agent surface has not compiled since 2026-10-14 and sits outside CI. |
| Skyhook | 12% | [Likely] | Deepest physics in the family (73 passed / 1 skipped), zero physical data, 46 unreviewed agent commits on six branches no file mentions. |
| PartForge | 55% | [Speculative] | Every software claim re-ran true (733 + 20 + 27 checks); no part has ever been cut; no CI. |
| Idea-Bank | 90% | [Likely] | 75/75 deposits meet their contract when run uncontended; no LICENSE, no CI, half the ideas never independently reviewed. |
| suborbital-leg-cost-model | 0% | [Certain] | One commit, no code; superseded. |

The full basis for each figure, including what was run and what it printed, is in `REVIEW_2026-10-26.md`.

## The first three moves (never reorder)

1. **Hygiene weekend** (6–8 h): archive the stub with a pointer; LICENSE in skyhook and Idea-Bank (the one irreversible choice); one-job CI in PartForge and Idea-Bank; bump PartForge's two HIGH-advisory pins; write the per-repo push-policy ruling; Aster™ on the planner only. Plus one hour of GitHub branch protection on `main` in all four live repos, which no proposal had and every judge called the missing gate.
2. **Make Aster's agent surface true again** (6–12 h): route the non-finite-C3 sentinel into an `out_of_envelope` refusal, add an `mcp` job to CI, carry the fidelity tier into the envelope, publish `aster-mission-mcp@0.2.0`. Row 1 flips.
3. **Reconcile skyhook's remote** (two weekends): PR the base branch so CI runs on it, read it, rule the Earth-radius deviation, park the five creative branches with DECISION_LOG entries, rewrite `handoff.md` dated today, add a LICENSE, then flip public.

Then the two physical rows: ST-001 over winter break (needs no lab and no email; ~$120; buy a ≥500 kg scale or pre-register a saturation rule) and one calipered PartForge part when shop or printer access exists.

## Provenance and limits of this hub

- Written by a Claude Code session on 2026-10-26 at Hudson's request, on a branch, with explicit staging and no change to `main`. The repo's standing rule that agents never push was overridden for this branch by Hudson's own session hook ("commit and push these changes to the remote branch"); the deviation is recorded here so the push policy can be ruled on.
- The review ran repo test suites read-only; `git status` was clean in every repo afterwards. Live GitHub Pages content could not be fetched from the sandbox; deployment facts come from the Actions API.
- The hub's first draft stated four sibling facts from inference that the review refuted the same day (skyhook public with Pages; VM-002 in the repo; 97 test files; a deploy run read as Pages enabled). They are fixed, and the fix is structural: sibling facts are now generated, not typed.
