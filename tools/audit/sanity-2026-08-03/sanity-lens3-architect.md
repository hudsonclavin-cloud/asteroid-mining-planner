# PASS 3 — LENS 3: ARCHITECT (convention, containment, drift)

Audit target: `/Users/hudsonclavin/asteroid-mining-planner` at HEAD `c6c0c52` (`git log --oneline -1`: `c6c0c52 docs: commit repo audit ...`). Scope was strictly read-only; the only write is this `/tmp` report. I did not read either other lens file. The dispatch marker was content-verified as `COPY-VERSION: S-SANITY-MA-2026-08-03-A` (dispatch line 1).

## 3.1 Convention compliance

### Research placement

The stated convention is explicit: research output belongs in `tools/sliceN-research/literature/`, measurement output in `.../data/`, scripts in `.../measurements/`, with one commit per artifact (dispatch lines 19–23).

The repo follows that layout for the newer Slice 11/13/14/16 literature set. For example, Git history shows one-file commits `f455489` (`tools/slice13-research/literature/3d-verification-record.md`), `d781a4e` (`tools/slice14-research/literature/perplexity-progress.md`), and `564ebbf` (`tools/slice16-research/literature/query-3-model-matrix-cost.md`).

It does not follow the convention uniformly:

- A parallel 22-file, 1,368-KiB research library remains under `src/v2/research/`. Its own index calls itself the “Aster v2 Slice 10-20 Research Library” and maps ChatGPT/Perplexity source artifacts there (`src/v2/research/README.md:1-15`). The ingest commit is `602e744`, which added 19 files in one commit, including four PDFs/Perplexity outputs plus provenance stubs and the index (`git show --stat 602e744`). This violates both the current path and one-artifact-per-commit conventions.
- Slice 11 batched three independent literature outputs in one commit: `6fbc79b` added `query-1-porkchop-conventions.md`, `query-2-multi-rev-lambert.md`, and `query-3-delta-v-stack.md` (`git log --diff-filter=A -- tools/slice11-research/literature/*`).
- There are 85 tracked entries under `tools/slice*-research/` outside all three prescribed subtrees. The complete `git ls-files` deviation set is quoted below. This includes 15 non-README Markdown research/report outputs, 53 scripts outside `measurements/`, and 17 other README/data/image/oracle entries outside the prescribed containers:

```text
tools/slice10-research/{README.md,coorbital-drift-detail.json,coorbital-drift.mjs,extend-horizons-fixture.mjs,lambert-failure-population-detail.json,lambert-failure-population.mjs,nhats-diagnostic.mjs,nhats-validation.mjs}
tools/slice12-research/{DLA_RESEARCH_SUMMARY.md,dla-oracle-grid.py,dla-oracle-validation.mjs}
tools/slice13-research/elvperf/{elvperf-c3-00.png,elvperf-c3-10.png,elvperf-c3-20.png,elvperf-c3-30.png,elvperf-c3-40.png,elvperf-c3-55.png,oracle/oracle-actuals.tsv,oracle/oracle-c3-15.png,oracle/oracle-c3-25.png,oracle/oracle-c3-35.png,oracle/oracle-c3-50.png,oracle/oracle-report.md}
tools/slice14-research/ux/cold-visit-report.md
tools/slice2-research/{build-fixture.mjs,fetch-horizons.mjs,interpolation-report.md,measure-interpolation.mjs}
tools/slice3-research/{build-jupiter-system-fixture.mjs,fetch-horizons.mjs,interpolation-report.md,measure-interpolation.mjs,pck-extraction.md}
tools/slice4-research/{build-saturn-system-fixture.mjs,fetch-horizons.mjs,interpolation-report.md,measure-interpolation.mjs,pck-extraction.md}
tools/slice5-research/{research-report.md,ring-substructure.json}
tools/slice6-research/{build-mars-system-fixture.mjs,fetch-horizons.mjs,measure-interpolation.mjs,pck-extraction.md,research-report.md}
tools/slice7-research/{fetch-horizons-anchors.mjs,fetch-horizons-asteroids.mjs,fetch-sbdb.mjs,keplerian-propagate.mjs,measure-keplerian-accuracy.mjs,measure-keplerian-anchored.mjs,research-report.md,state-to-elements.mjs,test-keplerian.mjs,test-state-to-elements.mjs,validate-frame-rotation.mjs}
tools/slice8-5-research/{README.md,build-star-catalog.mjs,validate-star-catalog.mjs}
tools/slice8-research/{analyze-h-thresholds-round3.mjs,analyze-inv-013-bands.mjs,build-main-belt-top-10000.mjs,build-sample-200-eccentricity.mjs,build-sample-200.mjs,common.mjs,derive-inv-013-band-bars.mjs,fetch-horizons-anchors-200-eccentricity.mjs,horizons.mjs,investigate-methodology.mjs,measure-keplerian-accuracy-200-eccentricity.mjs,measure-keplerian-accuracy-200.mjs,measure-sbdb-epoch-distribution.mjs,round2-methodology-report.md,round3-synthesis-report.md,validate-slice7-against-round3-bars.mjs}
tools/slice9-research/{README.md,SLICE_9_PRERESEARCH_REPORT.md,build-report.mjs,common.mjs,fetch-sbdb-nea.mjs,keplerian-offline.mjs,measure-inv014-sample.mjs,measure-occupancy.mjs,slice9-node-propagation-batch.mjs,slice9-node-propagation-worker.mjs}
```

INFERRED: most root-level entries predate the present three-subdirectory convention, but no committed migration/legacy exception was found. The current structure therefore cannot tell a new contributor whether these locations remain permitted.

### Founding-document additive history

Current policy is unambiguous and recent: `AGENTS.md:98-114` says the hook-enforced rule was added 2026-07-09 and forbids line deletions in `src/v2/*_FOUNDING.md`; README now calls all per-slice founding records “additive-only, hook-enforced” (`README.md:127-135`, introduced by `73ac85f` on 2026-08-01).

`git log -p -- '*FOUNDING*.md'` found 16 commits that removed at least one line containing `DEC-`, `INV-`, or an engineering/history marker. This is the exhaustive matching set; the count is the number of matching removed lines, not total deleted lines:

| Commit | Date | Matching removed lines | Quoted Git evidence |
|---|---:|---:|---|
| `6784ade` | 2026-07-07 | 5 | `-**DEC-15-1 (PROPOSED): Same repo, mcp/ workspace...**` (the patch similarly rewrote DEC-15-3/6/7/8 labels) |
| `8fcddb6` | 2026-07-05 | 10 | `-INV-001 through INV-022 remain operative...`; it also deleted proposed DEC-14-1 through DEC-14-6 while replacing the mis-committed draft |
| `978104f` | 2026-07-02 | 6 | `-**DEC-12-1 (proposed): DLA definition and computation point.**` (same label rewrite for all six DECs) |
| `c3e31bc` | 2026-07-02 | 1 | `-**DEC-12-3 (proposed, conditional on OQ-12-2): Feasibility classification.**` |
| `8e2322a` | 2026-06-25 | 1 | removed the OQ-11C-1 resolution paragraph beginning `The overlay-scoped client (DEC-11C-2) needs...` |
| `f00cfee` | 2026-06-25 | 1 | removed the prior version of that same `DEC-11C-2` paragraph |
| `e559082` | 2026-06-12 | 96 | `-#### INV-005: Propagation Drift Bounds...`; numstat records deletions of 1,406/514/191 lines from V2/Slice10/Slice11 founding docs. Commit `3d5f1cd` later reverted this staging operation. |
| `1b6cd26` | 2026-05-30 | 1 | removed the prior OQ-4 resolution line containing `passes INV-015 validation...` |
| `2776694` | 2026-05-27 | 2 | removed `The honesty layer (INV-016) must surface...` and the prior INV-016 closure paragraph |
| `37c8bb4` | 2026-05-27 | 2 | removed the OQ wording `under DEC-1 + DEC-3 + DEC-4 + DEC-5 settings` and its DEC-8 rationale |
| `513f704` | 2026-05-23 | 1 | removed the prior OQ-5 paragraph containing `DEC-3 × DEC-4 (~730 dates)` |
| `601b899` | 2026-05-17 | 1 | removed `INV-014 cutover harness (encounter-flag-primary...)` |
| `d6aabee` | 2026-05-13 | 2 | removed `INV-008, INV-009, INV-010, and INV-011 remain... INV-012 is additive` and its expanded successor paragraph |
| `104ce95` | 2026-05-11 | 1 | removed `Round-2 pre-research established the refined DEC-2 split...` |
| `63faaaa` | 2026-05-11 | 1 | removed the Slice 7 tripwire paragraph containing `If INV-012 is not met...` |
| `e915dbd` | 2026-05-09 | 1 | removed the prior `INV-011 ... additive` carry-forward paragraph |

Important chronology: every deletion above predates the 2026-07-09 hard rule. A separate numstat sweep from 2026-07-09 through HEAD found zero founding-document deletions. Thus current enforcement is being followed, but the blanket description of the documents as historically additive-only is false. Several entries above are label/status rewrites with replacement text in the same patch rather than semantic loss; `e559082` is the clear wholesale containment breach, albeit reverted.

## 3.2 Structural drift

### Parallel hierarchies likely to diverge

1. **Research has two canonical-looking homes.** `src/v2/research/README.md:1-15` indexes Slice 10–20 ChatGPT/Perplexity research, while the current house convention points to `tools/sliceN-research/literature/` (dispatch lines 21–23). Both are tracked and both are cited by founding docs: Slice 10 calls `src/v2/research/slice-10-lambert/` its research library (`src/v2/SLICE_10_FOUNDING.md:6,71`), while later slices cite `tools/...`. There is no supersession marker.

2. **The old research index is materially stale.** It says its artifacts are “NOT YET TRANSLATED INTO DECs or founding docs” and that Slice 10 drafting is next (`src/v2/research/README.md:17-23`), while active founding docs exist through Slice 16 (`git ls-files '*FOUNDING*.md'`) and STATUS says Slices 9–16 are complete/closed (`STATUS.md:34-40`).

3. **Current-state documents compete and disagree.** Root `STATUS.md`, root `HANDOFF.md`, `README.md`, and `src/v2/SLICE_V1_STATUS.md` all state operational status. `HANDOFF.md:3-7` is dated 2026-07-10 at HEAD `b52d823`; it says Appendix A and all five Fable drafts were missing (`HANDOFF.md:65-92`), but `git ls-files src/v2/founding-drafts` contains all five and ingest commit `e219ccc` records them. README says “no data collected; no results exist” (`README.md:118-125`), while STATUS says Slice 16 closed with 468 runs and published results (`STATUS.md:40-56`).

4. **STATUS itself is stale against HEAD.** It says `tools/slice16-harness/runs/` is untracked (`STATUS.md:118-120`), but `git ls-files tools/slice16-harness/runs` lists 14 tracked files and `CLOSE_REPORT.md:73-75` says all 13 evidence files were committed at `c037448` (the 14th is README). It says `_rescued-agent-defs/` is absent (`STATUS.md:122`), while `git ls-files _rescued-agent-defs` lists six tracked files. These are current-state contradictions inside the nominated authority.

5. **Founding/planning has three levels with no promotion protocol.** Locked/current records live at `src/v2/SLICE_N_FOUNDING.md` (AGENTS dispatch template, `AGENTS.md:216-226`); byte-preserved drafts live under `src/v2/founding-drafts/` (`SLICE_17_FOUNDING.md:1-10`); family strategy lives under root `strategy/` (`ASTER_FAMILY_MASTER_PLAN.md:1-5`). The distinction is understandable, but no committed rule says how a draft is promoted or retired, leaving the current Slice 17 collision unresolved (3.4).

6. **Legacy and V2 founding/status surfaces coexist.** Root `FOUNDING_DOCUMENT.md`, `V2_FOUNDING_DOCUMENT.md`, per-slice founding docs, and `src/v2/SLICE_V1_STATUS.md` are all tracked. AGENTS names V2 and selected slice docs as authoritative (`AGENTS.md:37-47`) but does not disposition the root legacy founding document or Slice V1 status, so search-driven readers can land on inactive guidance.

## 3.3 Orphans

I tested candidate documentation/artifact paths by exact path and basename with `git grep` over tracked `*.md`, `*.ts`, `*.mjs`, and `*.js`, excluding self-matches, and checked sizes with `wc -c`/`du -sk`. I did not classify implicit package-manager/build inputs such as `package-lock.json` as orphans merely because code does not import them.

The following have zero inbound committed-document references and zero code imports:

| Orphan | Size | Tracked state | Evidence/assessment |
|---|---:|---|---|
| `LEGACY.md` | 3,646 B | tracked | basename search: 0 other files |
| `REFACTOR_MAP.md` | 9,362 B | tracked | basename search: 0 other files |
| `src/v2/SLICE_V1_STATUS.md` | 4,129 B | tracked | exact basename search: 0; its own header is last updated 2026-06-22 (`:1-4`) |
| `src/v2/SLICE_9_A2B_FENCE.md` | 4,326 B | tracked | exact basename search: 0 |
| `src/v2/SLICE_9_PHASE_B_SPEC.md` | 9,261 B | tracked | exact basename search: 0 |
| `src/v2/SLICE_8_5_FOUNDING.md` | 6,718 B | tracked | exact basename search: 0; this is consequential because it contains the competing INV-014 definition (`:54-58`) |
| `.tmp-tests/` | 47,468 KiB / 2,202 files | 0 tracked | exact-path search: 0; INFERRED generated scratch, but it is a large unindexed local subtree |
| `.obsidian/` | 24 KiB / 5 files | 0 tracked | exact-path search: 0; INFERRED editor-local configuration |
| `Untitled.canvas` | 4 KiB | untracked, owner-known | exact-path search: 0; not inspected per dispatch’s known-dirty restriction |

I did **not** classify `tools/slice14-research/` as orphaned despite zero path-string hits: its artifact commits `0667def`, `d781a4e`, and `9dc2ce0` are cited in `src/v2/SLICE_14_FOUNDING.md:19,43,47,111,183`. Likewise, several Slice 9 diagnostic commits are cited by hash in `SLICE_9_FOUNDING.md:141-177,239-248`; path-only scanning would have produced false positives.

## 3.4 Exact Slice 17 placement

Under the current stated structure, a newly opened Slice 17 should use:

- active founding record: `src/v2/SLICE_17_FOUNDING.md` (the dispatch template requires `src/v2/SLICE_N_FOUNDING.md`, `AGENTS.md:216-226`);
- raw/literature research: `tools/slice17-research/literature/<one-artifact-per-file>`;
- measurement scripts: `tools/slice17-research/measurements/`;
- measurement outputs: `tools/slice17-research/data/`;
- slice-specific implementation under the appropriate canonical `src/v2/` architectural layer, not a new generic `src/v2/slice17/` directory (AGENTS repo map, `AGENTS.md:20-33`).

Placement is mechanically clear but **semantic ownership requires a Hudson judgment call**:

- A tracked draft already claims Slice 17 for “Remote Transport (aster-mission-mcp on Cloudflare Workers)” (`src/v2/founding-drafts/SLICE_17_FOUNDING.md:8-17`).
- STATUS says “Slice 17 opens on §31” and its first design input is the Slice 16 instrument/grading failure (`STATUS.md:75-80`).
- An older research stub names Slice 17 “economics” and cross-references the mission-architecture/economics PDF (`src/v2/research/slice-17-economics/PROVENANCE.md:1-7`).

Therefore the exact filesystem destinations above are unambiguous, but which body of work is entitled to the name “Slice 17,” whether the remote-transport draft is superseded/renumbered, and which pre-existing research belongs to it are not.

## 3.5 Invariant surface

### Enumerated definitions

| ID | One-line definition / status | Primary evidence |
|---|---|---|
| INV-001 | Canonical core units: m, m/s, m radii, TDB seconds since J2000. | `src/v2/core/invariants/README.md:12-17` |
| INV-002 | Canonical state contains no NaN/Infinity/non-finite components. | same `:19-24` |
| INV-003 | Every canonical state carries an explicit frame tag. | same `:26-31` |
| INV-004 | Frame round trips stay within 10ε (one) / 100ε (ten-chain), in stated scope. | same `:33-39` |
| INV-005 | Keplerian energy/angular-momentum drift <1e-9/orbit; future n-body <1e-6 absent stricter bar. | same `:41-46` |
| INV-006 | No readable-scale/presentation-derived values in core. | same `:48-53` |
| INV-007 | **UNDEFINED GAP.** It is only asserted as existing and included in a type union. | `V2_FOUNDING_DOCUMENT.md:198,212`; `src/v2/core/types.ts:32`; core invariant README ends at INV-006 (`:48-53`) |
| INV-008 | Per-body Slice 2 Hermite interpolation error bars. | `V2_FOUNDING_DOCUMENT.md:87-100` |
| INV-009 | Jupiter-system per-body/cadence interpolation bars. | same `:102-116` |
| INV-010 | Saturn-system per-body/cadence interpolation bars. | same `:118-135` |
| INV-011 | Mars-moon per-body/cadence interpolation bars. | same `:137-150` |
| INV-012 | Slice 7 asteroid Keplerian position error ≤100,000 km. | same `:152-162` |
| INV-013 | Slice 8 eccentricity-stratified Keplerian error bars, superseding 012 for Slice 8 asteroids. | same `:164-175` |
| INV-014 | **DUPLICATE:** (A) honest celestial star positions; (B) Slice 9 three-gate catalog visualization tier. | A: `SLICE_8_5_FOUNDING.md:54-58`; B: `SLICE_9_FOUNDING.md:141-164,270-288`; registry chooses B at `INVARIANTS.md:181` |
| INV-015 | Lambert implementation traceable to peer-reviewed algorithm/open reference. | `SLICE_10_FOUNDING.md:47-51` |
| INV-016 | Every C3/ΔV carries and surfaces patched-conic fidelity. | same `:53-61` |
| INV-017 | One shared porkchop renderer, no surface-specific fork. | `SLICE_11_FOUNDING.md:32-37` |
| INV-018 | Lambert grid compute stays in a Web Worker. | same `:35` |
| INV-019 | Multi-rev uses audited core Lambert code; local tool is reference only. | same `:36` |
| INV-020 | Dedicated porkchop route is bookmarkable/shareable. | same `:37` |
| INV-021 | Component-derived vector quantities require measured frame at consuming boundary. | `SLICE_12_FOUNDING.md:34-37` |
| INV-022 | Every launch-vehicle anchor has adjacent source/as-of/class provenance. | `SLICE_13_FOUNDING.md:23-27` |
| INV-023 | Interpolate within published vehicle anchors; never extrapolate. | same `:26` |
| INV-024 | Anti-porting: external astrodynamics libraries are validation oracles only. | `SLICE_14_FOUNDING.md:38-44` |
| INV-025 | Public copy does not expose internal IDs without plain-English framing. | same `:46-47` |
| INV-026 | Public trust-surface numeric claims render from one committed provenance artifact. | same `:49-50` |
| INV-027 | No math in MCP adapters. | `SLICE_15_FOUNDING.md:33-41` |
| INV-028 | Evidence envelope on every tool result; refusal is a result. | same `:36` |
| INV-029 | Tool hard cap eight; ninth requires founding amendment. | same `:37` |
| INV-030 | Browser build must stay green after core extraction commits. | same `:38` |
| INV-031 | Verified ten-pair eval must pass before publish. | same `:39` |
| INV-032 | No non-finite number crosses the wire. | same `:40` |
| INV-033 | Global anti-fabrication: verify every SourceRef/path/commit/count/URL. | same `:41`; registry `INVARIANTS.md:200` |
| INV-034 | Global evidence-artifact tracking: claimed committed evidence must be tracked/not ignored. | `INVARIANTS.md:164-172,201` |
| INV-035 | No global invariant. Bare form is Slice-16-local “pre-registered metrics only,” now `INV-S16-035`. | `INVARIANTS.md:207-219,233` |
| INV-036 | No global invariant. Bare form is Slice-16-local “transcripts are artifacts,” now `INV-S16-036`. | same |
| INV-037 | Frozen expectation may change only on demonstrated instrument defect, Hudson authorization, and additive old/defect/replacement record. | `INVARIANTS.md:227-235` |
| INV-038 | **Provisional draft only:** Dossier renders refusals, never removes them. | `founding-drafts/DOSSIER_FOUNDING.md:31-36` |
| INV-039 | **Provisional draft only:** Dossier self-header makes it reproducible. | same `:36` |

The INV-016 family also defines lettered extensions: 016a co-orbital criteria, 016b M=0/M=1 distinction, 016c ΔV assumptions (`SLICE_11_FOUNDING.md:24-28`), 016d launch-site/band disclosure (`SLICE_12_FOUNDING.md:34-37`, amended by Slice 13), and 016e cost-card disclosure (`SLICE_13_FOUNDING.md:18-27`). These are not new numeric slots but are independently operative rules.

### Ceiling, gaps, duplicates

- **Current locked global ceiling: INV-037.** The registry explicitly explains that global 035/036 were skipped to avoid collision with the Slice 16 local names (`INVARIANTS.md:227-233`).
- **Highest exact textual definition: INV-039, but only provisional in an unlocked Dossier draft** (`DOSSIER_FOUNDING.md:31-36`). It must not be treated as the current index ceiling.
- **Gap:** INV-007 has no statement despite “INV-001 through INV-007” claims and a TypeScript union member.
- **Duplicate:** INV-014 has two unrelated definitions; unlike the Slice 16 collision, no mapping or amendment resolves the starfield definition.
- **Mapped duplicates:** Slice 16 originally redefined bare INV-033 through INV-036 (`SLICE_16_FOUNDING.md:24-29`). The additive remedy names them `INV-S16-033..036` and makes bare references file-context-sensitive (`SLICE_16_FOUNDING.md:1128-1132`; `INVARIANTS.md:207-219`). This resolves registry ownership but preserves an interpretation hazard: bare INV-033 and INV-034 mean different things inside vs outside Slice 16 documents.
- **Intentional global numbering gaps:** 035 and 036 are local-only, not missing by accident (`INVARIANTS.md:233`).

## 3.6 Chat-produced artifact intake

**Finding: yes, a documented and demonstrably followed process exists, but it is fragmented, partly obsolete, and not a single current canonical intake rule.**

Documented pieces:

1. The tracked dispatch-writer skill has an end-to-end “research ingestion” worked example: verify source files, validate prompt-to-file mapping with a STOP condition, create canonical folders, copy, write `PROVENANCE.md`, verify counts, stage, commit, and report (`.claude/skills/dispatch-writer/SKILL.md:185-239`).
2. Slice 15 adds a handling rule for any chat-produced file an agent must read: version-marked filename, `COPY-VERSION` marker, and content verification in dispatch Step 1 (`src/v2/SLICE_15_FOUNDING.md:164-171`).
3. Strategy has a narrower cross-project route: charter artifacts “arrive from their Claude Projects as files” and land only via mothership dispatches (`strategy/ASTER_FAMILY_CHARTERS.md:3-6`).

Followed evidence:

- Commit `602e744` exactly implements the skill example’s named batch ingest and creates provenance files plus the research index (`git show --stat 602e744`).
- Slice 16 query artifacts carry explicit source/date/status/ingestion notes; Query 2 says the body was pasted verbatim including UI chrome (`tools/slice16-research/literature/query-2-small-n-eval-methodology.md:1-6`), and it landed alone in commit `4862dfa`.
- The five Fable drafts carry authored/ingested dates, byte-preservation, stale-numbering warning, and COPY-VERSION markers (`founding-drafts/SLICE_17_FOUNDING.md:1-11`); ingest commit `e219ccc` records five files and `Co-Authored-By: Claude Fable 5` (`git show --format=fuller --stat e219ccc`).

Drift in the process:

- The worked example still declares `src/v2/research/` canonical and batches many artifacts (`SKILL.md:185-232`), conflicting with today’s `tools/sliceN-research/literature/` and one-artifact-per-commit convention (dispatch lines 21-23).
- The Fable intake batched five distinct drafts in `e219ccc`; it preserved provenance well but did not use one commit per artifact.
- No single committed current document reconciles source acquisition, provenance/header requirements, canonical destination, one-artifact commit atomicity, and promotion from draft to active founding doc. INFERRED: the repo can reproduce examples of successful intake, but a new chat artifact still requires choosing among inconsistent precedents.

## Final repository-state check

`git status --porcelain=v1` after all read-only inspection was identical to the state captured before writing this `/tmp` report:

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

No repo file was modified, staged, committed, built, moved, deleted, or network-fetched.
