# Repository-state sanity audit — reconciliation

**Dispatch:** `COPY-VERSION: S-SANITY-MA-2026-08-03-A`  
**Repository:** `/Users/hudsonclavin/asteroid-mining-planner`  
**Audited HEAD:** `c6c0c522aec00c5d8ddc4b659feb4f899dbc01fd`  
**Method:** Three sequential, independent read-only lenses, followed by this reconciliation. Only the reconciliation read all three reports.

## 4.1 One ranked, deduplicated findings list

### HIGH

#### H1 — The exact input behind the completed Slice 9 quality-axis diagnostic is lost

The completed diagnostic calls `tests/fixtures/v2/nea-catalog-slice9.json.tmp` a preserved Path-A post-run state (`tools/slice9-diagnostic/SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md:3-4`) and reports derived population results such as 41,558 bodies (`:13`). The input is absent, has no Git history, and `.gitignore:33` would hide it if recreated. The analyzer still names that path (`tools/slice9-diagnostic/analyze-quality-axis.mjs:24`), but the old-state measurement cannot be independently rerun from the repository.

Four-generation root cause:

1. **Why the gap exists:** a `.tmp` fixture was treated as preserved evidence while remaining outside Git and under an ignore rule.
2. **Why review missed it:** reviewers could validate the committed report and analyzer without verifying `git ls-files --error-unmatch` for the asserted input.
3. **Why process allowed it:** INV-034-style artifact tracking was not enforced when this diagnostic closed; report acceptance did not require an evidence manifest.
4. **Structural prevention:** every decision-closing report should carry a machine-checkable manifest of exact inputs and hashes, and closure should fail unless each non-secret input is tracked and not ignored.

#### H2 — Slice 13 closes decisions with recon/audit reports that are absent and partly unreproducible

`src/v2/SLICE_13_FOUNDING.md:39` cites `aster-audit-reports/slice13-showcase-recon.md` for a 41,866-body scan, FK3 values, 4,641 RED cheapest windows, and rankings. The same founding document concedes at `:112` that the report is untracked, no committed generator reproduces the full result, and the figures are unreproducible from the repo. `aster-audit-reports/slice13-recon-3e.md` and `slice13-phaseF-audit.md`, cited at `:84,98`, are also absent. Supporting PDFs, a verification record, and screenshots are tracked, but not the reports that closed the decisions.

Four-generation root cause:

1. **Why the gap exists:** decision evidence was produced in an external report location and summarized into a founding document without ingesting the reports or a reproducer.
2. **Why review missed it:** the founding record retained convincing numerical conclusions and references, so the missing repository artifacts were not surfaced as a closure blocker.
3. **Why process allowed it:** chat/external audit output had no mandatory intake step tying a decision amendment to tracked source artifacts.
4. **Structural prevention:** prohibit an OQ/DEC closure from naming an out-of-repo report unless the same change ingests the report, records provenance and hashes, and commits a deterministic generator or explicitly marks the conclusion non-reproducible and provisional.

#### H3 — Several decision-closing audit records existed only in transient or external locations and are now gone

Slice 10 names `/tmp/slice10-multiagent-audit-report.md` and `/tmp/finding-1-verification.md` as transient (`src/v2/SLICE_10_FOUNDING.md:439-443`); Slice 14 closes OQs using `/tmp/slice14-phase0-recon.md` and `/tmp/slice14-decision-brief.md` and acknowledges that no committed audit exists (`src/v2/SLICE_14_FOUNDING.md:57-58,188-189`). All four `/tmp` files are absent. `HANDOFF.md:18` also cites a Windows-only `S15_PREPUBLISH_AUDIT_2026-07-10.md` outside this repo. Conclusions survive as prose, but the independent reasoning/evidence records do not.

Four-generation root cause:

1. **Why the gap exists:** `/tmp`, chat, and a machine-local audit folder were used as final evidence locations.
2. **Why review missed it:** the founding documents explicitly summarized the results, making transient source retention appear optional.
3. **Why process allowed it:** there was no repository-wide rule that decision-closing agent reports must be ingested before the decision is considered closed.
4. **Structural prevention:** add a single canonical audit-intake path and a closure gate requiring tracked reports or a tracked reproducibility recipe; `/tmp` may be a working location only, never the durable citation target.

### MEDIUM

#### M1 — The recovered Slice 9 cutover corpus is still a one-disk, ignored single point of failure

The founding correction says the sample was never committed, no generator exists, recovery found nothing, and exact values cannot honestly be regenerated (`src/v2/SLICE_9_FOUNDING.md:426-438`). A local copy now exists at `tools/slice9-research/data/slice9-cutover-sample.json`; it is 69,199 bytes, names seed 9031 and the 2026-05-01→2026-07-30 window, and hashes to `a5574aef880cccb4de0722ec2ed6434c22f3eab0179f150efd1a839cc31dd3c9`. It has no Git history and is ignored by `.gitignore:19`. Companion truth/CAD/SBDB snapshots are also locally present and ignored. This is not currently lost, so the reconciliation applies the dispatch’s MEDIUM “untracked single copy” definition, while preserving Lens 2’s HIGH classification in §4.3.

Four-generation root cause:

1. **Why the gap exists:** a blanket `tools/slice9-research/data/*` ignore rule swallowed the original and now swallows the recovered artifacts.
2. **Why review missed it:** normal status output omits ignored files, and the founding correction froze the earlier “not recovered” state.
3. **Why process allowed it:** research data directories default to ignored with a small allowlist, while evidence review did not enumerate ignored files.
4. **Structural prevention:** invert the policy for conventional evidence directories—track by default, ignore only named reproducible bulk/raw classes—and add a periodic check for ignored files cited by tracked documents.

#### M2 — Exact external-source and run-provenance inputs remain ignored and clone-unrecoverable

Two Tycho-2 TSV inputs named at `tools/slice8-5-research/README.md:41-42` exist only as ignored files under `.gitignore:16`; their headers retain VizieR timestamps and request URLs. Slice 9 raw ingestion/query products and run logs are hidden by `.gitignore:30`, including `build-summary.json`, `cad-window-raw.json`, two reanchor logs, and `sbdb-nea-raw.json`. Slice 8’s completed-run checkpoint and fetch log are hidden by `.gitignore:12-15`, although the final 9,000-anchor product is tracked. Products survive, but exact acquisition provenance does not survive a fresh clone.

Four-generation root cause:

1. **Why the gap exists:** broad data/log ignore patterns classified external snapshots and provenance as disposable generation output.
2. **Why review missed it:** reviewers saw tracked derived fixtures and summaries, while ignored raw inputs were invisible to ordinary worktree review.
3. **Why process allowed it:** the repository lacks an explicit split between secret/huge/reproducible cache data and evidence-bearing raw snapshots.
4. **Structural prevention:** define evidence classes with retention rules; commit request metadata, hashes, summaries, and non-secret raw snapshots where feasible, and use a tracked external-storage manifest where size/licensing prevents Git storage.

#### M3 — Ninety-seven dated Horizons outputs are valuable local-only work with no tracked route

The known-dirty directories under `tools/slice{2,3,4,6}-research/data/2026-07-18_2026-10-16/` contain 97 JSON files, approximately 66.8 MiB allocated. No tracked file mentions that date-range directory. Per the dispatch they were reported but not inspected. INFERRED from names and placement: they are external-query or measurement outputs whose loss would cost query time and may encounter upstream drift.

Four-generation root cause:

1. **Why the gap exists:** a rolling-fixture workflow generated a sizable intermediate corpus without a tracked manifest or disposition record.
2. **Why review missed it:** the directories were owner-declared known-dirty and intentionally excluded from content inspection; Git records only their untracked directory roots.
3. **Why process allowed it:** the workflow distinguishes final fixtures from intermediates but does not require a documented retain/discard decision for expensive source outputs.
4. **Structural prevention:** every external-query run should immediately emit a small tracked manifest with query parameters, file count, hashes, cost/time, reproducibility class, and intended archival disposition.

#### M4 — `FULL_RUN_REPORT.md` is an untracked standalone incident record

`tools/slice16-harness/FULL_RUN_REPORT.md` is a 10,067-byte untracked report describing a halted paid attempt, $13.82 spend, 275/810 stopping point, 58.5% same-cause failure, and token-growth diagnosis (`:1-16`). The essential facts and underlying ledgers are duplicated in tracked `src/v2/SLICE_16_FOUNDING.md:1084-1101` and commit `c037448`, so losing it would remove the consolidated narrative, not the experiment’s sole evidence.

Four-generation root cause:

1. **Why the gap exists:** the report was produced after or alongside closure but never passed through explicit artifact intake.
2. **Why review missed it:** key facts were already copied into the founding record and ledgers, reducing urgency to preserve the standalone report.
3. **Why process allowed it:** there is no rule distinguishing redundant scratch narration from a durable incident postmortem.
4. **Structural prevention:** require an explicit disposition—track, superseded-by with exact citations, or delete-by-owner—for every final-looking report left untracked at dispatch close.

#### M5 — `STATUS.md`, the mandatory session router, materially misstates current Git and evidence state

`STATUS.md:20-25` says origin is `642dfc9` with local unpushed commits; Git reports `HEAD == origin/main == c6c0c52` and `git rev-list --left-right --count origin/main...HEAD` is `0 0`. It says Slice 16 runs are untracked (`STATUS.md:78,120`), but Git lists 14 tracked paths and commit `c037448` archived them (`src/v2/SLICE_16_FOUNDING.md:1597-1607`). It lists three dirty `docs/` files not present in status and says `_rescued-agent-defs/` is absent (`STATUS.md:122`), while tracked rescued files exist. Because `AGENTS.md:57` routes sessions through STATUS and says to stop on a HEAD mismatch, this can halt or misdirect work.

Four-generation root cause:

1. **Why the gap exists:** state-changing commits and the eventual push did not atomically refresh every operational line in STATUS.
2. **Why review missed it:** STATUS was updated incrementally as a session log; later commits corrected source records but left earlier current-state prose intact.
3. **Why process allowed it:** mutable current state and historical narrative share one document without freshness checks.
4. **Structural prevention:** generate or validate the volatile Git/status block from commands at commit time, separate current snapshot from history, and make stale HEAD/origin/evidence assertions a failing documentation check.

#### M6 — Other prominent orientation documents are materially stale or mix historical and current state

`HANDOFF.md:3-8` presents a July 10 Windows repo and old heads without a superseded banner, says Appendix A is absent (`:71`) although it is tracked, and says later drafts are missing (`:83-92`) although five are tracked under `src/v2/founding-drafts/`. `tools/audit/REPO_AUDIT_2026-07-31.md:9-13` says there is no external seal, ledgers are untracked, and no root README exists; current repository evidence refutes those claims, and `:553` cites nonexistent `strategy/ASTER_PRODUCT_VISION.md` instead of the root file. `src/v2/SLICE_V1_STATUS.md:13-28` describes tracked prototype/textures as untracked or blocked. Slice 16 close/archive reports preserve obsolete push and ledger instructions inside otherwise useful reports (`CLOSE_REPORT.md:73-75,109-155`; `ARCHIVE_REPORT.md:19,150-153`).

Four-generation root cause:

1. **Why the gap exists:** dated handoffs, audits, and close reports remained discoverable without a uniform archival/supersession header.
2. **Why review missed it:** each file is historically accurate within some boundary, and additive-history norms discouraged rewriting old text.
3. **Why process allowed it:** the repository has several STATUS-like surfaces but no authority/supersession metadata that tools or readers can follow mechanically.
4. **Structural prevention:** require every state-bearing document to declare `snapshot-as-of`, `superseded-by`, and whether instructions remain actionable; index only the current router from README/AGENTS.

#### M7 — Research has two canonical-looking homes and current placement/commit conventions are not consistently enforced

The stated convention puts literature, data, and scripts under `tools/sliceN-research/{literature,data,measurements}/` with one artifact per commit. Lens 3 found a parallel 22-file, 1,368-KiB `src/v2/research/` library whose README calls it the Slice 10–20 research library (`src/v2/research/README.md:1-15`); commit `602e744` ingested 19 files in one commit. It also found 85 tracked `tools/slice*-research/` entries outside the three prescribed subtrees and a three-artifact Slice 11 literature commit `6fbc79b`. Newer Slice 11/13/14/16 artifacts do follow the new placement more often. No committed migration or legacy exception was found.

Four-generation root cause:

1. **Why the gap exists:** conventions evolved after substantial earlier research had already landed under root-level slice directories and `src/v2/research/`.
2. **Why review missed it:** each local hierarchy has an internally plausible index and is cited by founding docs, so deviations look intentional in isolation.
3. **Why process allowed it:** the new convention was not accompanied by a compatibility statement, migration map, or lintable path rule.
4. **Structural prevention:** publish one canonical research-placement policy with explicit grandfathered paths, mark the older index superseded/read-only, and lint new research additions for destination and commit atomicity.

#### M8 — Chat-produced artifact intake exists, but its instructions conflict and draft promotion is undefined

The tracked dispatch-writer skill documents verification, canonical folders, provenance, staging, and commit steps (`.claude/skills/dispatch-writer/SKILL.md:185-239`); Slice 15 requires filename/COPY-VERSION content verification (`src/v2/SLICE_15_FOUNDING.md:164-171`); strategy artifacts arrive via mothership dispatches (`strategy/ASTER_FAMILY_CHARTERS.md:3-6`). These processes have been followed in commits `602e744`, `4862dfa`, and `e219ccc`. However, the skill still calls `src/v2/research/` canonical and batches artifacts, conflicting with the current `tools/.../literature/` and one-artifact convention. No committed rule reconciles acquisition, provenance, destination, atomic commits, and promotion from `src/v2/founding-drafts/` to an active founding record.

Four-generation root cause:

1. **Why the gap exists:** intake rules accumulated in a skill, slice founding text, and strategy docs at different times.
2. **Why review missed it:** each successful ingest followed one valid precedent, so cross-document incompatibility was not exercised.
3. **Why process allowed it:** there is no single owner or versioned canonical intake specification.
4. **Structural prevention:** consolidate intake into one current policy and checker covering marker verification, provenance, canonical destination, one-artifact commit policy, evidence tracking, and draft promotion/retirement.

#### M9 — The invariant surface contains one undefined slot, one unresolved duplicate, and context-sensitive remapped IDs

INV-007 is asserted and included in a TypeScript union but has no statement (`V2_FOUNDING_DOCUMENT.md:198,212`; `src/v2/core/types.ts:32`; `src/v2/core/invariants/README.md:12-53`). INV-014 independently means honest star positions in `src/v2/SLICE_8_5_FOUNDING.md:54-58` and the Slice 9 three-gate visualization contract in `src/v2/SLICE_9_FOUNDING.md:141-164,270-288`; `INVARIANTS.md:181` selects the latter without mapping the former. Slice 16’s bare INV-033..036 were additively remapped to `INV-S16-033..036` (`INVARIANTS.md:207-219`), leaving bare references context-sensitive in historical text. The locked global ceiling is INV-037 (`INVARIANTS.md:227-233`); INV-038/039 occur only in an unlocked Dossier draft (`src/v2/founding-drafts/DOSSIER_FOUNDING.md:31-36`).

Four-generation root cause:

1. **Why the gap exists:** invariant numbers were allocated independently across slice documents without a single enforced registry at creation time.
2. **Why review missed it:** local slice review validated meanings, while duplicate/global numbering was checked only later.
3. **Why process allowed it:** identifiers were free-form prose tokens; the registry documented collisions after the fact rather than reserving IDs beforehand.
4. **Structural prevention:** make a machine-readable invariant registry authoritative, reserve IDs before use, lint definitions/references, and require explicit alias/supersession records for every historical collision.

#### M10 — “Slice 17” has three competing semantic claims even though the filesystem pattern is clear

The active path pattern would be `src/v2/SLICE_17_FOUNDING.md`, `tools/slice17-research/literature/`, `.../measurements/`, and `.../data/` (`AGENTS.md:216-226` and the house convention). But the tracked draft claims Slice 17 for Remote Transport (`src/v2/founding-drafts/SLICE_17_FOUNDING.md:8-17`), STATUS says Slice 17 opens from the Slice 16 instrument/grading failure (`STATUS.md:75-80`), and an older provenance stub calls Slice 17 economics (`src/v2/research/slice-17-economics/PROVENANCE.md:1-7`). Which work owns the number requires Hudson’s judgment.

Four-generation root cause:

1. **Why the gap exists:** slice numbers were assigned in multiple planning streams without a shared reservation/promotion ledger.
2. **Why review missed it:** each artifact was a draft, status note, or research stub rather than an active founding doc, so none independently triggered a collision gate.
3. **Why process allowed it:** draft naming and promotion have no canonical lifecycle or ownership record.
4. **Structural prevention:** maintain a tracked slice registry with reserved number, title, owner, state, canonical draft, research roots, and explicit renumber/supersession history.

#### M11 — Several tracked documents route readers to nonexistent evidence or implementation paths

Material examples are the absent storage fixture `tests/fixtures/v2/horizons-inner-solar-system-2026-2040.json` cited by `src/v2/SLICE_10_FOUNDING.md:347` and `src/v2/boundary/slice10-fixture-spec.md:9` while the actual file is `src/v2/data/horizons-inner-solar-system-2026-2040.json`; absent Slice 8 validation outputs cited at `tools/slice8-ingestion/README.md:66-86`; and the incomplete README glob for Slice 11 poliastro evidence (`README.md:53-56`). Some other nonexistent paths are clearly historical proposals or explicitly corrected, so they are LOW below.

Four-generation root cause:

1. **Why the gap exists:** files moved, planned outputs never landed, or path prose was not updated when implementation settled elsewhere.
2. **Why review missed it:** Markdown path references are not resolved in normal test/build gates.
3. **Why process allowed it:** the repo has no link/path existence checker that distinguishes assertions from templates and historical negative examples.
4. **Structural prevention:** add a documentation path audit with an allowlisted syntax for templates, historical/nonexistent examples, and explicitly superseded routes.

#### M12 — Family strategy overstates charter coverage and has unverifiable market assertions

`strategy/ASTER_FAMILY_MASTER_PLAN.md:28` says every non-shipped lens has an entry gate and kill criteria in `ASTER_FAMILY_CHARTERS.md`, but `ASTER_FAMILY_CHARTERS.md:22-44` contains only Ledger, Survey, Traffic, and Bench placeholders, all `CHARTER PENDING`, and omits several master-plan lenses. Transit/Prospect artifacts and a Dossier draft exist, but live deployment, incumbents, buyer-today assertions, and portfolio probabilities are not independently verifiable in this repository-only audit (`ASTER_FAMILY_MASTER_PLAN.md:32-63,79`).

Four-generation root cause:

1. **Why the gap exists:** the master plan describes the intended governance end state while the charter registry remains partially scaffolded.
2. **Why review missed it:** both files exist at the promised location, so existence checks pass even though coverage/content checks do not.
3. **Why process allowed it:** there is no completeness rule joining the lens list in the master plan to charter entries and required fields.
4. **Structural prevention:** define the family registry once in structured data or a single table and validate that every non-shipped lens has a non-placeholder gate, kill criteria, and current status.

### LOW

1. **Explicitly corrected historical paths/state remain searchable.** Examples: the old `src/v2/launch-vehicles.ts` references are corrected at `src/v2/SLICE_15_FOUNDING.md:212`; `SEAL_DRAFT.md:162` marks its top “NOT YET SEALED” line historical. Additive history is working, but snippets can surface the stale line first.
2. **Historical founding documents were not additive-only before the rule existed.** Lens 3 found 16 commits before 2026-07-09 removing DEC/INV/history lines, including the reverted wholesale deletion `e559082`; from 2026-07-09 through HEAD it found zero founding-document deletions (`AGENTS.md:98-114`). This is historical characterization drift, not a current breach.
3. **Tracked, unreferenced documentation exists.** `LEGACY.md`, `REFACTOR_MAP.md`, `src/v2/SLICE_V1_STATUS.md`, `SLICE_9_A2B_FENCE.md`, `SLICE_9_PHASE_B_SPEC.md`, and `SLICE_8_5_FOUNDING.md` had zero inbound committed-document references in Lens 3’s exact path/basename scan. “Orphan” means unindexed, not necessarily valueless.
4. **Generated/local clutter is unindexed.** `.tmp-tests/` is about 47,468 KiB/2,202 ignored files, `.obsidian/` has five ignored files, and `Untitled.canvas` is owner-known scratch. No loss-bearing claim was found for these.
5. **Some old planned paths never materialized.** `src/v2/vendor/pykep-lambert/UPSTREAM.md`, `tests/v2-lambert-izzo.test.mjs`, and `src/v2/render/planet-textures.ts` are cited as future/planned locations, not reliable present-tense evidence.
6. **Research atomicity deviations are mostly legacy.** The current convention is followed by several newer one-file commits; the age boundary is not formally documented, which is covered by M7 rather than treated as 85 separate defects.

## 4.2 Root-cause synthesis

The four-generation analysis above repeats one systemic chain: durable evidence and current-state metadata are produced as side effects of sessions, while closure review validates conclusions more often than artifact recoverability. Because ignored files, `/tmp` reports, external audit folders, and chat attachments are invisible to ordinary Git review, missing evidence can coexist with persuasive founding prose. The repository later introduced INV-034, COPY-VERSION checks, additive history, explicit staging, and research conventions, but those controls are distributed across documents and do not mechanically validate citations, external-query retention, current STATUS facts, invariant allocation, or draft promotion. The preventive change is therefore not another narrative reminder; it is a small set of machine-checkable registries/manifests and closure gates.

## 4.3 Conflicts and interpretive tensions between lenses

There were no direct factual disagreements on the central Git facts: all lenses observed HEAD `c6c0c52`, the same dirty path set, tracked Slice 16 ledgers, stale STATUS claims, and missing/out-of-Git evidence. The following differences must not be collapsed because they answer different questions or apply different classifications:

| Topic | Lens position A | Lens position B | Reconciliation status |
|---|---|---|---|
| Recovered Slice 9 sample severity | Lens 2 labels it **HIGH** because the exact values have already been declared unrecoverable and the recovered copy remains under the original ignore trap (`SLICE_9_FOUNDING.md:426-438`; `.gitignore:19`). | The dispatch’s ranking definition says untracked/single-copy work is **MEDIUM** while lost work is HIGH; the file does exist locally with hash `a557…`. Lens 1 inventories the four ignored Slice 9 inputs without assigning severity. | Both are retained: M1 uses the dispatch rubric; Lens 2’s stronger loss-history interpretation remains explicit. |
| Is the 2026-08 research corpus present? | Lens 1 concludes the *named coherent 2026-08 corpus* is absent: zero tracked hits for VSOP87, ELP2000, ELP/MPP02, DOP853, Dormand-Prince, Pareto, and “porkchop thumbnail,” and no `tools/slice17-research/` or later conventional directory. | Lens 3 finds a substantial tracked Slice 10–20 research library under `src/v2/research/` and treats that parallel hierarchy as drift (`src/v2/research/README.md:1-15`). | These are not equivalent corpora. The old/parallel library exists; the distinctive corpus tested by Lens 1 does not appear as a coherent tracked ingest. |
| Founding docs “additive-only” | Lens 1 confirms all discovered founding files are tracked but calls hook enforcement **UNVERIFIABLE** because both hook files are pre-existing modified paths. | Lens 3’s Git-history audit finds 16 pre-rule commits with removals, but zero founding deletions after the 2026-07-09 hard rule (`AGENTS.md:98-114`). | Current compliance is supported by history; current hook behavior was not tested and historical blanket additivity is false. Neither claim substitutes for the other. |
| Invariant ceiling | Lens 1 reports highest *literal tokens per file*, including INV-039 in the Dossier draft and `INV-27-clean`/placeholder `INV-04x` in the Slice 17 draft. | Lens 3 defines the *locked global registry ceiling* as INV-037 and classifies INV-038/039 as provisional draft-only (`INVARIANTS.md:227-233`; Dossier `:31-36`). | Both measurements are retained; literal maximum and operative global ceiling are different concepts. |
| Untracked file counts | Lens 2 reports 99 visible untracked files from `git ls-files --others --exclude-standard`: 97 Horizons files plus `Untitled.canvas` and `FULL_RUN_REPORT.md`. | Lens 1 reports 103 untracked files within enumerated research trees because its tracked-status inventory also counts six ignored research inputs (two Tycho-2 plus four Slice 9 files), while `Untitled.canvas` is outside the research-tree count. | Counts use different universes. They do not evidence mutation or omission. |
| Status-stream hash | Lens 1 records SHA-256 `abf2e427…` for default `git status --porcelain`, whose directory entries are collapsed. | Lens 2 records `1f9c4d87…` for `git status --porcelain=v1 -uall`, which expands every untracked file. | Different command byte streams explain the different hashes; each lens compared like with like. The required final comparison uses Lens 1’s default porcelain stream. |
| Research deviations | Lens 1 describes substantial tracked research through Slice 16 and the parallel `src/v2/research/` tree through Slice 20 without declaring old placement invalid. | Lens 3 treats the same parallel tree, 85 off-subtree entries, and batched commits as deviations from the convention supplied in this dispatch. | Whether old artifacts are “violations” depends on whether the current convention is retroactive. No committed migration/legacy exception answers that. |
| Slice 17 placement | Lens 1 records a tracked Slice 17 founding draft but no conventional `tools/slice17-research/` directory. | Lens 3 says the filesystem destinations are mechanically unambiguous, but semantic ownership of “Slice 17” requires Hudson judgment because Remote Transport, instrument remediation, and economics all claim it. | No path conflict is resolved here; ownership/renumbering remains open. |

## 4.4 The one-paragraph truth

This repository is not empty or generally missing its work: at `c6c0c52`, level with `origin/main`, it contains substantial tracked research through Slice 16, a separate tracked `src/v2/research/` library through Slice 20, founding records for Slices 8.5–16, draft Dossier/Slice 17 material, family strategy documents, deployed build artifacts, the MCP package source, and all 14 Slice 16 run-ledger paths. What it does **not** contain is a coherent tracked copy of the distinctive new 2026-08 research corpus, several exact inputs and audit reports used to close earlier decisions, or Git-preserved copies of multiple external-source snapshots and recent query outputs. The single most significant false belief a reader would take from the repository’s own operational documents is that the repo is still ahead of an old origin with the Slice 16 ledgers untracked and awaiting push; `STATUS.md:20-25,78,120` says that, while Git proves HEAD and origin are both `c6c0c52` and commit `c037448` already tracks the ledgers.

## 4.5 Loss exposure table

| Category outside Git | Untracked local copy exists? | Reproducible? | Cost to recreate |
|---|---|---|---|
| Slice 9 cutover sample | **Yes**, ignored; hash `a5574aef…` | Exact recreation is documented as unavailable: no generator and old expected values cannot honestly be regenerated (`SLICE_9_FOUNDING.md:426-438`) | Potentially impossible exactly; loss would restore the previously recorded lost-sample condition |
| Slice 9 cutover truth/CAD/SBDB companions | **Yes**, ignored by `.gitignore:19` | Re-queryable in principle, not guaranteed byte- or state-identical | External API/query time; upstream-state drift; provenance comparison |
| Slice 9 quality-axis old-state tmp fixture | **No** | Not from current repo state; analyzer survives but exact input does not (`SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md:3-13`) | Unknown and potentially impossible exactly; reconstructing a historical catalog state |
| Slice 13 showcase/recon/Phase-F audit reports | **No repo-local copy found** | Showcase figures explicitly unreproducible from committed artifacts (`SLICE_13_FOUNDING.md:112`) | New deterministic full-catalog scan, audit recreation, and comparison with historical numbers |
| Slice 10 and 14 `/tmp` audit/decision reports | **No** | Authors claim some reruns are possible, but changed repo/prompt/external state may alter results | Repeat multi-agent recon and verification; equivalence not guaranteed |
| Slice 15 Windows-only prep audit and transient P10 negative control | **No canonical-repo copy found** | **UNKNOWN**; the handoff gives an external path but no local artifact (`HANDOFF.md:18,26`) | Access old machine/external audit folder or recreate audit/control run |
| Tycho-2 source TSVs | **Yes**, two ignored files under `.gitignore:16` | Query URL/timestamp preserved locally; later response may differ | VizieR re-query and validation; likely time rather than direct monetary cost |
| Slice 8 checkpoint/fetch log | **Yes**, ignored | Operational run can be repeated; final 9,000-anchor dataset is tracked | Roughly a rate-limited 9,000-object acquisition plus retry/validation time; exact old log impossible after loss |
| Slice 9 ingestion raw queries/run logs | **Yes**, five ignored files under `.gitignore:30` | Derived product/checkpoints survive; exact upstream snapshots/logs may not | JPL re-queries, 11,805/29,792-row reruns, and provenance comparison |
| Four dated Horizons intermediate directories | **Yes**, 97 files, ~66.8 MiB | **UNKNOWN** because inspection was prohibited; INFERRED re-queryable with drift risk | Provider-query time, possible rate limits, validation, and possible upstream differences |
| Slice 16 `FULL_RUN_REPORT.md` | **Yes**, one untracked file | Core facts are reconstructible from tracked founding text and ledgers | Editorial reconstruction; no need to repeat the paid run for the recorded essentials |
| Secret-bearing `tools/slice16-harness/.env` | **Yes**, intentionally ignored; content not read | Configuration values may or may not be recoverable elsewhere | Credential/configuration recovery; should not be committed, but needs an owner-managed secret store |

## 4.6 What could not be determined

1. **Whether deploy/package/publication claims are live.** `docs/` and `mcp/` artifacts exist, and repository text records a DOI/seal, but deployed routes, npm publication/publisher handshake, and external DOI state were not queried. A network-authorized check against the deployed site, npm registry, and DOI record would answer this.
2. **Whether historical test/build counts still pass.** Builds and tests were prohibited. A separately authorized clean verification dispatch would answer this without changing repository state if commands are known read-only with respect to tracked files.
3. **Whether the missing 2026-08 research corpus exists in chat, attachments, another clone, or another machine.** Git proves it is not a coherent tracked corpus here; only an inventory of those external stores can establish whether it exists elsewhere.
4. **The exact purpose, reproducibility, and acquisition cost of the 97 dated Horizons files.** The dispatch explicitly prohibited investigation. Their generating command, API logs, or a user-provided manifest would answer this.
5. **Whether current modified hooks enforce the documented rules.** `.githooks/pre-commit` and `.githooks/pre-push` are user-owned modified paths and were not executed or altered. Comparing them with HEAD and running a separately authorized non-mutating hook test fixture would answer this.
6. **Whether external/machine-local Slice 13 and Slice 15 audit reports still exist elsewhere.** The canonical repo does not contain them. Checking the cited `aster-audit-reports` locations and old Windows machine would answer this.
7. **Which body of work owns Slice 17.** Repository evidence supports three claims; only Hudson can designate the active slice and whether drafts/research are renumbered or superseded.
8. **Whether every market/incumbent/probability claim in the family plan is current.** They require source-specific research and network access; this audit could only verify repository artifacts.
9. **Whether ignored external-source artifacts may legally or practically be committed.** Size, licensing, privacy, API terms, and secrets were outside scope. An artifact-by-artifact retention review would determine whether Git, release assets, LFS, or a hashed external manifest is appropriate.

## End-state integrity

Lens 1’s baseline `git status --porcelain` contained exactly these nine records:

```text
 M .dispatch-scope
 M .githooks/pre-commit
 M .githooks/pre-push
?? Untitled.canvas
?? tools/slice16-harness/FULL_RUN_REPORT.md
?? tools/slice2-research/data/2026-07-18_2026-10-16/
?? tools/slice3-research/data/2026-07-18_2026-10-16/
?? tools/slice4-research/data/2026-07-18_2026-10-16/
?? tools/slice6-research/data/2026-07-18_2026-10-16/
```

The baseline byte-stream SHA-256 was `abf2e4272e1732e6d02ab0b2bb4d26c8de05ed208f7577d3dd99e0bf4a3a394b`. After writing this report, the final stream had the same SHA-256 and a direct shell string comparison returned `BYTE_IDENTICAL`. `git diff --cached --name-only` returned no paths. No repository file was edited, staged, committed, moved, deleted, built, served, or network-fetched; the four audit reports exist only under `/tmp`.
