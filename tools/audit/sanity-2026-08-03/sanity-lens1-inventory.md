# Sanity audit — Lens 1: INVENTORY

Audit time: 2026-08-03 (America/New_York). Scope: PASS 1 only, strict read-only repository audit. `COPY-VERSION: S-SANITY-MA-2026-08-03-A` was present in the dispatch. I did not read any planning/status document until filesystem/Git steps 1.1–1.4 were complete. All file facts below came from `find`, `wc -c`, `git ls-files`, `git log`, and `git grep`; a `git grep` hit is tracked by definition.

## 1.1 State

Initial baseline, quoted verbatim from `pwd`, `git log --oneline -1`, and `git status --short --branch`:

```text
/Users/hudsonclavin/asteroid-mining-planner
c6c0c52 docs: commit repo audit (REPO_AUDIT_2026-07-31.md), cited by README/STATUS/RUNBOOK; correct STATUS.md line asserting it was never staged [S-P0D6-AUDITCOMMIT-2026-08-03-A]
## main...origin/main
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

`git rev-list --left-right --count origin/main...HEAD` returned `0  0`: HEAD is level with origin, neither ahead nor behind. This directly contradicts the current-state table in `STATUS.md:22-25`, which says origin is `642dfc9` and the local chain is unpushed.

### Fourteen-day commit inventory

Format is `hash | author date | subject | changed-file count`; counts are from nonblank `--name-only` records, so renames count as one changed path exactly as Git reports them.

```text
c6c0c52|2026-08-03|docs: commit repo audit (REPO_AUDIT_2026-07-31.md), cited by README/STATUS/RUNBOOK; correct STATUS.md line asserting it was never staged [S-P0D6-AUDITCOMMIT-2026-08-03-A] | 2
729ffb8|2026-08-03|build(v2): rebuild deploy surface with Phase-0 live clock, rolling fixtures, Sun-focused default frame, and offset body labels [S-P0F1G-2026-08-03-A] | 23
3ba2df0|2026-08-03|fix(v2/solar-system): offset body labels so they no longer occlude the halo markers they name [S-P0F1F-2026-08-03-A] | 1
2bd78e8|2026-08-03|fix(v2/solar-system): default camera focuses the Sun, matching the top-down orbit state it already used — inner system now framed at load [S-P0F1D-2026-08-03-A] | 1
e5c0c98|2026-08-03|feat(v2/solar-system): live clock — wall-clock-derived LIVE tracking via core UTC→TDB, rolling fixtures from src/v2/data, coverage line + out-of-coverage warning + LIVE/SCRUBBED status, Shift+N-for-now key, UTC line on date HUD [S-P0F1C-2026-08-02-J] | 2
57e4cba|2026-08-03|data(v2): rolling Horizons fixtures 2026-07-18..2026-10-16 for solar-system view (inner/jupiter/saturn/mars systems) [S-P0F1B-2026-08-02-G] | 4
26dbc0e|2026-08-03|fix(tools): builders accept an input-dir argument for window-scoped intermediates; legacy dir remains the default, missing inputs fail loudly [S-P0F1A3-2026-08-02-A] | 4
1c247cc|2026-08-03|fix(tools): window-scope Horizons intermediate cache paths so a new window forces a real fetch; legacy window keeps legacy paths [S-P0F1A2-2026-08-02-A] | 4
3217617|2026-08-03|tools(v2): parameterize Horizons fetch windows, add builder out-path args, add missing Mars-system builder [S-P0F1A-2026-08-02-C] | 8
551c826|2026-08-02|docs(slice16): ARCHIVE_REPORT self-count corrected — 9 commits, 69 objects [S16-ARCHIVE-2026-08-02-A] | 1
12aad14|2026-08-02|docs(slice16): ARCHIVE_REPORT — digest verification at three points, gitattributes clearance, measured push payload, false-tripwire disclosure [S16-ARCHIVE-2026-08-02-A] | 1
05c1359|2026-08-02|docs(slice16): C12 ruled WONTFIX (R-ARCH-3) and the ledger question closed in the OQ triage; disposition history retained [S16-ARCHIVE-2026-08-02-A] | 1
6642183|2026-08-02|docs(slice16): §32 — evidence now tracked (R-ARCH-1), full-length digest manifest closing the grades-artifact and truncation gaps (R-ARCH-2) [S16-ARCHIVE-2026-08-02-A] | 1
c037448|2026-08-02|data(slice16): commit run ledgers as tracked evidence — 13 files, digests verified, README distinguishing study data from superseded attempt-1 [S16-ARCHIVE-2026-08-02-A] | 14
dfe9e94|2026-08-02|docs(slice16): CLOSE_REPORT — OQ triage, artifact coherence, ledger-evidence decision (report only), Hudson's queue [S16-CLOSE-2026-08-02-A] | 1
21cc1b2|2026-08-02|docs: STATUS rewritten to current reality — Slice 16 CLOSED with a result, measured test state, ledger-evidence decision surfaced [S16-CLOSE-2026-08-02-A] | 1
4c3b7af|2026-08-02|docs(slice16): coherence pointers — six artifacts whose pending/blocking framing is superseded by the completed run and R-CLOSE-1 [S16-CLOSE-2026-08-02-A] | 6
a646e28|2026-08-02|docs(slice16): §31 close-out — result, scope, limitations, instrument narrative, R-CLOSE-1 disposition, spend [S16-CLOSE-2026-08-02-A] | 1
7c10447|2026-08-02|docs(slice16): R-CLOSE-1 — S-20/S-21/S-24 struck post-data as structurally ungradeable; sealed registration pinned separately so the amendment cannot obscure it [S16-CLOSE-2026-08-02-A] | 5
642dfc9|2026-08-02|docs(slice16): FINISH_REPORT — results, per-dimension breakdown, control-arm delta, RQ3 coverage finding, spend-guard correction [S16-FINISH-2026-08-01-A] | 1
13e9c05|2026-08-02|research(slice16): §30 RESULTS — first valid data. 468 runs, 0 errors, $14.73. Sonnet FULL 23.8% [6.1,45.6], Haiku 32.5% [11.9,52.9]; contrast unresolved at the 10pp threshold [S16-FINISH-2026-08-01-A] | 1
7175ef5|2026-08-02|fix(slice16): projected spend halt was biased 41% high by model-ordered plans — now projects per model from measured means; accrued halt unchanged [S16-FINISH-2026-08-01-A] | 2
5fed9c6|2026-08-02|research(slice16): §29 final executed scope — 2 Anthropic models (gpt-5.5 credit-blocked, Gemini quota-blocked, both measured), r=6 sized to the $19 budget with balanced 2/2/2 forms [S16-FINISH-2026-08-01-A] | 3
9eb72eb|2026-08-02|feat(slice16): hard $19 operational ceiling, session-wide spend meter across all arms, --tag to isolate corrected-instrument ledgers [S16-FINISH-2026-08-01-A] | 4
038f90c|2026-08-02|research(slice16): gpt-5.5 blocked on provider credit (option 2) — 3-model roster, zero contrasts lost [S16-FINISH-2026-08-01-A] | 2
3530e76|2026-08-01|docs(slice16): FINISH_REPORT — seal verified and closed, probe halted at row 1 on OpenAI credits, scope options with real numbers [S16-FINISH-2026-08-01-A] | 1
dfc878a|2026-08-01|research(slice16): §28 cost probe halted at row 1 on OpenAI credit exhaustion — $0 spent; registered same-cause halt fired automatically (1 row vs attempt 1's 128) [S16-FINISH-2026-08-01-A] | 1
89e4afa|2026-08-01|research(slice16): Gemini re-activated on Hudson's instruction + priced; quota unverified, the probe is the test [S16-FINISH-2026-08-01-A] | 2
cb4dbfa|2026-08-01|research(slice16): §27 public pre-registration seal recorded — DOI 10.5281/zenodo.21752617 at commit 670b039, tag binding verified [S16-FINISH-2026-08-01-A] | 1
670b039|2026-08-01|docs(slice16): FINISH_REPORT — stopped at Phase 1 on the missing public seal; gate walked, probe built and costed, scope options presented [S16-FINISH-2026-08-01-A] | 1
365f2f8|2026-08-01|docs(slice16): SEAL_DRAFT — paste-ready OSF/Zenodo metadata and the exact push-seal-record sequence [tripwire j] [S16-FINISH-2026-08-01-A] | 1
ac863ff|2026-08-01|feat(slice16): --probe cost-probe mode — every active scenario x r=1, own ledger, arm:probe never study data [PRE_RUN_GATE box 11] [S16-FINISH-2026-08-01-A] | 3
d6495b4|2026-08-01|docs(slice16): DD_RULINGS_REPORT — per-ruling instantiation, fixture matrix, caching verdict, gate status [DD-1..DD-7] [S16-DD-RULINGS-2026-08-01-A] | 1
4611630|2026-08-01|docs(slice16): RUNBOOK header synced — 26 active, 179 tests, 3 active models, pre-run gate blocker [S16-DD-RULINGS-2026-08-01-A] | 1
7bfb697|2026-08-01|docs(slice16): RUNBOOK — A12 executed counts (26 scenarios, 780/234/1014) and the measured caching verdict [DD-1..DD-7] [S16-DD-RULINGS-2026-08-01-A] | 1
a8e0e80|2026-08-01|research(slice16): Amendment A12 — appendix L.14 records the scenario-semantics changes additively [DD-1..DD-6] [S16-DD-RULINGS-2026-08-01-A] | 1
5e13429|2026-08-01|docs(slice16): PRE_RUN_GATE — boxes 2 and 10 satisfied by the A12 rulings; box 11 gains the measured caching input [DD-1..DD-7] [S16-DD-RULINGS-2026-08-01-A] | 1
c3e1a65|2026-08-01|research(slice16): Amendment A12 §26 — all seven rulings disclosed with old/new semantics, DD-2 narrowing, DD-3 limitation, DD-4 N/A dimensions, DD-6 fixture finding, caching verdict [DD-1..DD-7] [S16-DD-RULINGS-2026-08-01-A] | 1
4d447a6|2026-08-01|research(slice16): Amendment A12 — all-refusals merge; RFR relays every refusal and whitelists numbers from all, matching A5's union principle [DD-5] [S16-DD-RULINGS-2026-08-01-A] | 3
5ba034d|2026-08-01|research(slice16): Amendment A12 — control arm graded VF-only against pinned truth + descriptive claim rate; RFR/PTA/AUP N/A never 0; no FULL; unsound test replaced [DD-4] [S16-DD-RULINGS-2026-08-01-A] | 3
f34aa98|2026-08-01|research(slice16): Amendment A12 — canned turn-1 instantiates the two-turn scenarios S-18/S-20/S-24 uniformly across models; S-15 stays deferred [DD-3] [S16-DD-RULINGS-2026-08-01-A] | 9
ec0fbc0|2026-08-01|research(slice16): Amendment A12 — S-30 two-bin follow-through from the ledger alone, disclosed as narrower than the registered three bins [DD-2] [S16-DD-RULINGS-2026-08-01-A] | 2
a448912|2026-08-01|research(slice16): Amendment A12 — S-13 retargeted to the registered disclosure (limitation stated AND no unqualified global-minimum claim), deterministic closed-vocabulary matcher [DD-1] [S16-DD-RULINGS-2026-08-01-A] | 2
b1075f3|2026-08-01|research(slice16): Amendment A12 — label-relative leaf factors (diameter x2), X1 slot-graded expectation amended with PF4 replacement, INV-037 frozen-expectation rule [DD-6] [S16-DD-RULINGS-2026-08-01-A] | 5
366567c|2026-08-01|docs(slice16): REMEDIATION_REPORT — per-finding dispositions, adversarial-fixture matrix, design decisions queue DD-1..DD-7 [S16-REMEDIATE-2026-08-01-A] | 1
73ac85f|2026-08-01|docs(repo): root README — live routes, MCP quick start, one-core/two-interfaces with file evidence, real envelope + refusal artifacts, honest Slice 16 status [L7-1,L7-2,L7-4,L7-5] [S16-REMEDIATE-2026-08-01-A] | 1
8c19827|2026-08-01|fix(repo): retire legacy V1 agent definitions from auto-discovery — relocated to _rescued-agent-defs/ per AGENTS.md's own claim; tombstone README explains [L1-1] [S16-REMEDIATE-2026-08-01-A] | 7
e6b3544|2026-08-01|docs(slice16): PRE_RUN_GATE.md — 12-box blocking checklist before any future paid collection [5.3] [S16-REMEDIATE-2026-08-01-A] | 1
fdc7a9d|2026-08-01|docs(slice16): §24 stimulus/harness amendment disclosures + §25 pre-registration integrity — honest seal disclosure, evidence checksum manifest, Hudson's INV-034 dispatch [L5-9,L5-10,L5-13,L5-4,L3-2] [S16-REMEDIATE-2026-08-01-A] | 1
0e8f597|2026-08-01|fix(slice16): maxOutputTokens 2048->8192 — measured finish_reason=length truncation manufactured 12/14 contract violations (empty replies at exactly the cap, reasoning-token exhaustion) [4.5] [S16-REMEDIATE-2026-08-01-A] | 1
14a66ac|2026-08-01|test(slice16): flag the green control-arm test as unsound — it injects an envelope no production control row can have [L5-10] [S16-REMEDIATE-2026-08-01-A] | 1
f84ab23|2026-08-01|fix(slice16): tool cap never orphans tool_call_ids (suppressed-call notices, clean cap terminal) + full pinned transcripts on every row (commits, system text, instantiated turn, native conversation) [A11,L5-13] [S16-REMEDIATE-2026-08-01-A] | 4
c4bf9d3|2026-08-01|fix(slice16): stimulus instantiation — appendix L.8 resolutions substituted at build (S-10/S-12/S-23), fail-closed on unresolved placeholders, S-15/S-18/S-20/S-24 deferred by S-06 precedent, tool-free control system prompt [L5-9,L5-10] [S16-REMEDIATE-2026-08-01-A] | 4
b8796e1|2026-08-01|docs(slice16): §23 additive disclosure — instrument corrections with old/new semantics verbatim [L5-5,L5-7,L5-11,L2-7] [S16-REMEDIATE-2026-08-01-A] | 1
b15162e|2026-08-01|fix(slice16): instrument corrections — outer-prose fabrication graded (L5-5), RFR quantity identity + PTA identity matching + AUP prose contradiction (L5-7), shared-stimulus cluster bootstrap (L5-11); adversarial fixtures both directions [S16-REMEDIATE-2026-08-01-A] | 3
8e4c22c|2026-08-01|docs(repo): STATUS.md rewritten to current reality — Slice 16 locked/halted/no-data state, local-vs-origin chain, honest test state [L3-1] [S16-REMEDIATE-2026-08-01-A] | 1
667be3d|2026-08-01|docs(slice16): sync all stale operator text to A10/post-incident reality — env skip-claim, adapter verified-by-execution headers, r=10 counts, cost-model warning, retry-aware resume notes [L2-2,L2-5] [S16-REMEDIATE-2026-08-01-A] | 7
1de50d9|2026-08-01|docs(slice16): founding-side invariant namespace mapping INV-S16-033..036, additive [L2-1] [S16-REMEDIATE-2026-08-01-A] | 1
ee44638|2026-08-01|docs(repo): INVARIANTS namespace mapping INV-S16-033..036 + measured-ICRF frame correction, both additive [L2-1,L2-3] [S16-REMEDIATE-2026-08-01-A] | 1
de33377|2026-08-01|docs(repo): additive corrections — Slice 15 launch-vehicle path (L3-5), Slice 13 showcase figures labelled unreproducible-pending-regeneration (L3-6) [S16-REMEDIATE-2026-08-01-A] | 2
1103c19|2026-08-01|fix(repo): NOTICE — Solar System Scope CC BY 4.0 + NASA SVS attribution required by INV-V1-001/DEC-V1-1, previously absent [L2-4] [S16-REMEDIATE-2026-08-01-A] | 1
540102c|2026-08-01|fix(repo): About trust surface — oracle relabelled to its actual scope, Slice 10 audit fragment repaired, DEVLOG caption de-overclaimed [L3-3,L3-4] [S16-REMEDIATE-2026-08-01-A] | 1
f9dee23|2026-08-01|fix(repo): npm publish gate — prepublishOnly fails on a dirty worktree; SourceRefs dirty-flag fix deferred to a protected-path dispatch [L6-3] [S16-REMEDIATE-2026-08-01-A] | 2
2873c9d|2026-08-01|fix(slice16): one coherent ledger policy — malformed middle rows fatal, truncated tail loud, errored keys retryable, last-row-definitive dedup [L2-7] [S16-REMEDIATE-2026-08-01-A] | 4
33aec03|2026-08-01|fix(slice16): executable spend guard — BUDGET ceiling enforced via priced provider usage, accrued+projected halts, resume-aware [L5-3] [S16-REMEDIATE-2026-08-01-A] | 3
40f5d43|2026-08-01|fix(slice16): registered same-cause >25% halt enforced at runtime with cause grouping [L5-1] [S16-REMEDIATE-2026-08-01-A] | 2
b3b9708|2026-08-01|fix(slice16): strict CLI parsing — unknown/combined flags error out, never fall through to live full mode [L5-14] [S16-REMEDIATE-2026-08-01-A] | 2
63e18ab|2026-08-01|research(slice16): full-run attempt 1 halted at 275/810 — OpenAI credit exhaustion; cost model wrong 3x (input grows quadratically in tool calls); tool-cap adapter defect recorded [S16-FULLRUN-2026-07-31-A] | 1
b374243|2026-08-01|research(slice16): Amendment A10 — executed r restored to registered 10 (A9 cost rationale refuted by measurement), naming discipline retained [S16-FULLRUN-2026-07-31-A] | 3
d0479f7|2026-07-31|research(slice16): Amendment A9 — executed r=3 (registered r=10 unchanged) for resource constraints, measured cost model from pilot tokens, gemini quota-blocked status [S16-AMEND-A9-2026-07-31-A] | 6
47d4018|2026-07-31|research(slice16): Amendment A8 — sampling to provider defaults (gpt-5.5 refuses temperature 0), gemini string resolved, certainty corrections + A7 inference error recorded [S16-AMEND-A8-2026-07-31-A] | 8
e65df5c|2026-07-31|research(slice16): Amendment A7 — pilot first-contact fixes (openai max_completion_tokens, google string enums, uniform temperature-only sampling), 4 model strings confirmed, mini string resolved [S16-AMEND-A7-2026-07-31-A] | 9
3f52b0c|2026-07-31|docs(slice16): fix readiness checklist — check 1 resumability false-alarm, check 2's ledger dependency noted, check 5b's stale DEFERRED text [S16-RUNBOOK-FIX-2026-07-30-A] | 1
cae3f94|2026-07-31|research(slice16): model status convention — REGISTERED/ACTIVE/DEFERRED rosters, Together deferred for cost (k=6 registered, 5 active), doc corrections on sentinel guard + skip semantics [S16-ROSTER-STATUS-2026-07-30-B] | 5
23ef1c2|2026-07-31|research(slice16): A6 documents — PTA redefinition + roster substitution disclosed, runbook updated [S16-AMEND-A6-2026-07-30-A] | 4
532a945|2026-07-31|research(slice16): Amendment A6 — roster substitution DeepSeek→Together.ai (US jurisdiction), adapter + config + env template; deepseek retired-not-deleted [S16-AMEND-A6-2026-07-30-A] | 4
35f1f3a|2026-07-31|research(slice16): Amendment A6 — PTA admits actually-invoked tools (closes honest cross-tool false positive), fabrication detection preserved [S16-AMEND-A6-2026-07-30-A] | 4
d072359|2026-07-31|research(slice16): Amendment A5 — ratify merged-evidence (union-of-run) grading for multi-call scenarios, false-positive case + adversarial-fixture safeguard documented [S16-AMEND-A5-2026-07-29-A] | 2
dcb1a5b|2026-07-29|research(slice16): readiness checklist verified end-to-end; drop a dead command line, note the exit-code pitfall [S16-AMEND-A4-2026-07-28-A] | 1
53337d5|2026-07-29|research(slice16): A4 documents — DEC-16-7 amended, S-06 process finding, runbook, report [S16-AMEND-A4-2026-07-28-A] | 4
ed7cab1|2026-07-29|research(slice16): A4 — tool-calling mock, offline end-to-end proof, S-11 unit-anchored slot [S16-AMEND-A4-2026-07-28-A] | 7
8e3207e|2026-07-29|research(slice16): A4 — native tool-calling loop across four adapters, envelopes recorded per call [S16-AMEND-A4-2026-07-28-A] | 8
5062685|2026-07-28|research(slice16): live-pass documents, runbook, report [S16-MCPLIVE-2026-07-27-A] | 4
7657c89|2026-07-28|research(slice16): live MCP verification — slots measured against real envelopes, deferred markers resolved, executable set completed [S16-MCPLIVE-2026-07-27-A] | 6
6cb06a1|2026-07-28|research(slice16): grading CLI — slot-aware, fail-closed on missing scenarioId (closes A3 silent-fallback risk) [S16-MCPLIVE-2026-07-27-A] | 2
9c61a52|2026-07-28|research(slice16): Amendment A3 documents — slot table, disclosure, runbook + report [S16-AMEND-A3-2026-07-27-A] | 4
195d8ea|2026-07-28|research(slice16): Amendment A3 — VF graded on the quantity slot wherever asserted (closes prose-fabrication hole), PROSE-FABRICATOR negative control added [S16-AMEND-A3-2026-07-27-A] | 4
8452d1e|2026-07-27|research(slice16): preflight complete — runbook finalized, audit report committed; awaiting keys + push [S16-PREFLIGHT-2026-07-27-A] | 2
e12ebcc|2026-07-27|research(slice16): repo-truth sweep — measured-number provenance reconfirmed, corrections annotated [S16-PREFLIGHT-2026-07-27-A] | 1
15083b5|2026-07-27|research(slice16): adversarial self-audit — contract/parser alignment, guard + resumability verified, defects fixed [S16-PREFLIGHT-2026-07-27-A] | 7
3d55abd|2026-07-27|research(slice16): deferred-marker resolution pass — source-verified evidence recorded, promotion deferred to post-pilot [S16-PREFLIGHT-2026-07-27-A] | 1
d79ba1b|2026-07-27|research(slice16): Amendment A2 — reconcile config to prereg (28 active, S-29 live, struck={S-09,S-27}), fix count assertions, C-3 correction [S16-PREFLIGHT-2026-07-27-A] | 3
5a99c13|2026-07-27|research(slice16): Amendment A1 — strike S-09/S-27, repair S-29 per DEC-15-4(g), control arm funded (2,184 runs), AUP verbatim-instruction + pilot valve, request sizes re-derived [S16-AMEND-A1-2026-07-27-A] | 4
9aca68e|2026-07-27|research(slice16): harness runbook + env template [S16-LOCK-AND-HARNESS-2026-07-27-A] | 6
7d7c00e|2026-07-27|research(slice16): deterministic grader (VF/RFR/PTA/AUP/FULL) + negative-control fixtures — gate green offline [S16-LOCK-AND-HARNESS-2026-07-27-A] | 5
34e95b7|2026-07-27|research(slice16): harness scaffold — runner, MCP client, 4 fetch adapters, structured-answer contract, spend-guarded (S16_LIVE_OK) [S16-LOCK-AND-HARNESS-2026-07-27-A] | 9
34ca5f7|2026-07-27|research(slice16): DESIGN LOCK — DECs frozen, prereg anchor; grade-per-decision/infer-per-scenario, r=10, k=6, det. grading, $200 ceiling [S16-LOCK-AND-HARNESS-2026-07-27-A] | 1
8329663|2026-07-27|research(slice16): lock Appendix A — 30 scenarios verified/annotated + 60-paraphrase set (2/scenario, 4-3-3 allocation) [S16-LOCK-AND-HARNESS-2026-07-27-A] | 1
0cc980c|2026-07-27|strategy(family): commit ASTER_FAMILY_MASTER_PLAN.md — resolves the charters-file reference (leads-grade strategy doc, byte-preserved) | 1
3e9713d|2026-07-27|strategy(family): create ASTER_FAMILY_CHARTERS.md — §0 template + four pending charter slots (Ledger, Survey, Traffic, Bench) | 1
057183e|2026-07-21|research(slice16): house-measure envelope payload sizes — replay slice15 eval pairs (tools/list schema + 10 responses; supersedes Q3 per-call estimate) | 2
```

## 1.2 Filesystem inventory

### Research directories

Sixteen matching directories exist. Evidence summary (`directory | total files | tracked | untracked`):

```text
tools/slice10-research | 8 | 8 | 0
tools/slice11-research | 17 | 17 | 0
tools/slice12-research | 5 | 5 | 0
tools/slice13-research | 14 | 14 | 0
tools/slice14-research | 3 | 3 | 0
tools/slice15-research | 2 | 2 | 0
tools/slice16-research | 7 | 7 | 0
tools/slice2-research | 28 | 16 | 12
tools/slice3-research | 61 | 33 | 28
tools/slice4-research | 103 | 54 | 49
tools/slice5-research | 2 | 2 | 0
tools/slice6-research | 22 | 14 | 8
tools/slice7-research | 38 | 38 | 0
tools/slice8-5-research | 5 | 3 | 2
tools/slice8-research | 28 | 28 | 0
tools/slice9-research | 19 | 15 | 4
TOTAL | 362 | 259 | 103
```

The 97 untracked dated Horizons intermediates under slices 2/3/4/6 are the known-dirty inputs named in the dispatch (12+28+49+8). Two additional untracked files are Tycho-2 input TSVs under `tools/slice8-5-research/data/`; four are Slice 9 raw/cutover JSON inputs, yielding 103 untracked files total. This is a metadata inventory only, not an investigation of known-dirty content.

Full tree format is `path | bytes | TRACKED/UNTRACKED | last commit date or -`:

```text
tools/slice10-research/README.md | 478 | TRACKED | 2026-05-23
tools/slice10-research/coorbital-drift-detail.json | 25505 | TRACKED | 2026-05-27
tools/slice10-research/coorbital-drift.mjs | 14454 | TRACKED | 2026-05-27
tools/slice10-research/extend-horizons-fixture.mjs | 4872 | TRACKED | 2026-05-23
tools/slice10-research/lambert-failure-population-detail.json | 9554453 | TRACKED | 2026-05-27
tools/slice10-research/lambert-failure-population.mjs | 11017 | TRACKED | 2026-05-27
tools/slice10-research/nhats-diagnostic.mjs | 6060 | TRACKED | 2026-05-27
tools/slice10-research/nhats-validation.mjs | 9532 | TRACKED | 2026-05-27
tools/slice11-research/data/lambert-grid-timing.json | 3627 | TRACKED | 2026-06-18
tools/slice11-research/data/multi-rev-boundary-analysis.json | 8728 | TRACKED | 2026-06-20
tools/slice11-research/data/multi-rev-poliastro-validation.json | 12916 | TRACKED | 2026-06-20
tools/slice11-research/data/multi-rev-worth-it-500.json | 220848 | TRACKED | 2026-06-30
tools/slice11-research/data/multi-rev-worth-it.json | 44504 | TRACKED | 2026-06-18
tools/slice11-research/data/poliastro-validation.json | 2241 | TRACKED | 2026-06-18
tools/slice11-research/literature/query-1-porkchop-conventions.md | 17039 | TRACKED | 2026-06-18
tools/slice11-research/literature/query-2-multi-rev-lambert.md | 12853 | TRACKED | 2026-06-18
tools/slice11-research/literature/query-3-delta-v-stack.md | 22207 | TRACKED | 2026-06-18
tools/slice11-research/measurements/lambert-grid-timing.mjs | 11971 | TRACKED | 2026-06-02
tools/slice11-research/measurements/lambert-multi-rev-local.mjs | 3306 | TRACKED | 2026-06-02
tools/slice11-research/measurements/multi-rev-dual-oracle-validate.mjs | 32619 | TRACKED | 2026-06-20
tools/slice11-research/measurements/multi-rev-dual-oracle.py | 8457 | TRACKED | 2026-06-20
tools/slice11-research/measurements/multi-rev-poliastro-validate.mjs | 15606 | TRACKED | 2026-06-19
tools/slice11-research/measurements/multi-rev-worth-it.mjs | 12702 | TRACKED | 2026-06-30
tools/slice11-research/measurements/poliastro-grid.py | 1784 | TRACKED | 2026-06-02
tools/slice11-research/measurements/poliastro-validation.mjs | 10290 | TRACKED | 2026-06-02
tools/slice12-research/DLA_RESEARCH_SUMMARY.md | 5414 | TRACKED | 2026-07-02
tools/slice12-research/data/dla-oracle-m1-vectors.json | 4148 | TRACKED | 2026-07-02
tools/slice12-research/data/dla-oracle-validation.json | 1435 | TRACKED | 2026-07-02
tools/slice12-research/dla-oracle-grid.py | 3443 | TRACKED | 2026-07-02
tools/slice12-research/dla-oracle-validation.mjs | 29448 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/elvperf-c3-00.png | 132480 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/elvperf-c3-10.png | 155609 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/elvperf-c3-20.png | 148145 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/elvperf-c3-30.png | 153883 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/elvperf-c3-40.png | 132579 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/elvperf-c3-55.png | 128474 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/oracle/oracle-actuals.tsv | 534 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/oracle/oracle-c3-15.png | 134648 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/oracle/oracle-c3-25.png | 116068 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/oracle/oracle-c3-35.png | 114207 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/oracle/oracle-c3-50.png | 109785 | TRACKED | 2026-07-02
tools/slice13-research/elvperf/oracle/oracle-report.md | 4867 | TRACKED | 2026-07-02
tools/slice13-research/literature/3abc-research.pdf | 38353 | TRACKED | 2026-07-02
tools/slice13-research/literature/3d-verification-record.md | 5710 | TRACKED | 2026-07-02
tools/slice14-research/literature/perplexity-council-review.md | 11220 | TRACKED | 2026-07-04
tools/slice14-research/literature/perplexity-progress.md | 6669 | TRACKED | 2026-07-04
tools/slice14-research/ux/cold-visit-report.md | 10366 | TRACKED | 2026-07-04
tools/slice15-research/data/node-grid-timing.json | 1327 | TRACKED | 2026-07-07
tools/slice15-research/data/slice16-anchors-note.md | 746 | TRACKED | 2026-07-09
tools/slice16-research/literature/query-1-tool-faithfulness-prior-art.md | 72918 | TRACKED | 2026-07-19
tools/slice16-research/literature/query-2-small-n-eval-methodology.md | 35379 | TRACKED | 2026-07-19
tools/slice16-research/literature/query-3-model-matrix-cost.md | 49150 | TRACKED | 2026-07-19
tools/slice16-research/measurements/envelope-payload-sizes.json | 2538 | TRACKED | 2026-07-21
tools/slice16-research/measurements/live-slot-verification.json | 42225 | TRACKED | 2026-07-28
tools/slice16-research/measurements/measure-envelopes.mjs | 9736 | TRACKED | 2026-07-21
tools/slice16-research/measurements/request-payload-sizes.json | 4439 | TRACKED | 2026-07-27
tools/slice2-research/build-fixture.mjs | 2282 | TRACKED | 2026-08-03
tools/slice2-research/data/2026-07-18_2026-10-16/daily-earth.json | 31807 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/daily-mars.json | 31746 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/daily-mercury.json | 31943 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/daily-moon.json | 32228 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/daily-sun.json | 32646 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/daily-venus.json | 31896 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/truth-earth.json | 124430 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/truth-mars.json | 124173 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/truth-mercury.json | 124984 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/truth-moon.json | 126113 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/truth-sun.json | 127780 | UNTRACKED | -
tools/slice2-research/data/2026-07-18_2026-10-16/truth-venus.json | 124820 | UNTRACKED | -
tools/slice2-research/data/daily-earth.json | 32005 | TRACKED | 2026-04-26
tools/slice2-research/data/daily-mars.json | 31745 | TRACKED | 2026-04-26
tools/slice2-research/data/daily-mercury.json | 31965 | TRACKED | 2026-04-26
tools/slice2-research/data/daily-moon.json | 32241 | TRACKED | 2026-04-26
tools/slice2-research/data/daily-sun.json | 32674 | TRACKED | 2026-04-26
tools/slice2-research/data/daily-venus.json | 32044 | TRACKED | 2026-04-26
tools/slice2-research/data/truth-earth.json | 125204 | TRACKED | 2026-04-26
tools/slice2-research/data/truth-mars.json | 124219 | TRACKED | 2026-04-26
tools/slice2-research/data/truth-mercury.json | 125024 | TRACKED | 2026-04-26
tools/slice2-research/data/truth-moon.json | 126108 | TRACKED | 2026-04-26
tools/slice2-research/data/truth-sun.json | 127926 | TRACKED | 2026-04-26
tools/slice2-research/data/truth-venus.json | 125400 | TRACKED | 2026-04-26
tools/slice2-research/fetch-horizons.mjs | 5095 | TRACKED | 2026-08-03
tools/slice2-research/interpolation-report.md | 1460 | TRACKED | 2026-04-26
tools/slice2-research/measure-interpolation.mjs | 5715 | TRACKED | 2026-04-26
tools/slice3-research/build-jupiter-system-fixture.mjs | 2247 | TRACKED | 2026-08-03
tools/slice3-research/data/12h-callisto.json | 62841 | TRACKED | 2026-04-29
tools/slice3-research/data/12h-europa.json | 62790 | TRACKED | 2026-04-29
tools/slice3-research/data/12h-ganymede.json | 62807 | TRACKED | 2026-04-29
tools/slice3-research/data/12h-io.json | 62809 | TRACKED | 2026-04-29
tools/slice3-research/data/12h-jupiter.json | 62959 | TRACKED | 2026-04-29
```

Tree continuation (the first block ends at Slice 3's `12h-jupiter.json`):

```text
tools/slice3-research/data/1h-io.json | 757234 | TRACKED | 2026-04-29
tools/slice3-research/data/2026-07-18_2026-10-16/12h-callisto.json | 62830 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/12h-europa.json | 62792 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/12h-ganymede.json | 62783 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/12h-io.json | 62779 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/12h-jupiter.json | 62939 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/1h-io.json | 757340 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/30m-io.json | 1515136 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/3h-callisto.json | 249871 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/3h-europa.json | 249705 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/3h-ganymede.json | 249705 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/3h-io.json | 249710 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/3h-jupiter.json | 250330 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/6h-callisto.json | 125069 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/6h-europa.json | 124992 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/6h-ganymede.json | 124976 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/6h-io.json | 124965 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/6h-jupiter.json | 125272 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/daily-callisto.json | 31994 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/daily-europa.json | 31963 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/daily-ganymede.json | 31960 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/daily-io.json | 31958 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/daily-jupiter.json | 32033 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/truth-15m-io.json | 3032015 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/truth-callisto.json | 1515891 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/truth-europa.json | 1515123 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/truth-ganymede.json | 1515172 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/truth-io.json | 1515138 | UNTRACKED | -
tools/slice3-research/data/2026-07-18_2026-10-16/truth-jupiter.json | 1518667 | UNTRACKED | -
tools/slice3-research/data/30m-io.json | 1515094 | TRACKED | 2026-04-29
tools/slice3-research/data/3h-callisto.json | 249901 | TRACKED | 2026-04-29
tools/slice3-research/data/3h-europa.json | 249756 | TRACKED | 2026-04-29
tools/slice3-research/data/3h-ganymede.json | 249707 | TRACKED | 2026-04-29
tools/slice3-research/data/3h-io.json | 249700 | TRACKED | 2026-04-29
tools/slice3-research/data/3h-jupiter.json | 250288 | TRACKED | 2026-04-29
tools/slice3-research/data/6h-callisto.json | 125074 | TRACKED | 2026-04-29
tools/slice3-research/data/6h-europa.json | 124992 | TRACKED | 2026-04-29
tools/slice3-research/data/6h-ganymede.json | 124994 | TRACKED | 2026-04-29
tools/slice3-research/data/6h-io.json | 124987 | TRACKED | 2026-04-29
tools/slice3-research/data/6h-jupiter.json | 125291 | TRACKED | 2026-04-29
tools/slice3-research/data/daily-callisto.json | 31990 | TRACKED | 2026-04-29
tools/slice3-research/data/daily-europa.json | 31971 | TRACKED | 2026-04-29
tools/slice3-research/data/daily-ganymede.json | 31961 | TRACKED | 2026-04-29
tools/slice3-research/data/daily-io.json | 31969 | TRACKED | 2026-04-29
tools/slice3-research/data/daily-jupiter.json | 32056 | TRACKED | 2026-04-29
tools/slice3-research/data/truth-15m-io.json | 3032022 | TRACKED | 2026-04-29
tools/slice3-research/data/truth-callisto.json | 1516215 | TRACKED | 2026-04-29
tools/slice3-research/data/truth-europa.json | 1515194 | TRACKED | 2026-04-29
tools/slice3-research/data/truth-ganymede.json | 1515158 | TRACKED | 2026-04-29
tools/slice3-research/data/truth-io.json | 1515096 | TRACKED | 2026-04-29
tools/slice3-research/data/truth-jupiter.json | 1518671 | TRACKED | 2026-04-29
tools/slice3-research/fetch-horizons.mjs | 6104 | TRACKED | 2026-08-03
tools/slice3-research/interpolation-report.md | 5849 | TRACKED | 2026-04-29
tools/slice3-research/measure-interpolation.mjs | 13391 | TRACKED | 2026-04-29
tools/slice3-research/pck-extraction.md | 1911 | TRACKED | 2026-04-29
tools/slice4-research/build-saturn-system-fixture.mjs | 2713 | TRACKED | 2026-08-03
tools/slice4-research/data/12h-dione.json | 62916 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-enceladus.json | 62867 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-iapetus.json | 63040 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-mimas.json | 62857 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-rhea.json | 62988 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-saturn.json | 62390 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-tethys.json | 62921 | TRACKED | 2026-05-02
tools/slice4-research/data/12h-titan.json | 62991 | TRACKED | 2026-05-02
tools/slice4-research/data/1h-enceladus.json | 758266 | TRACKED | 2026-05-02
tools/slice4-research/data/1h-mimas.json | 758147 | TRACKED | 2026-05-02
tools/slice4-research/data/1h-tethys.json | 758782 | TRACKED | 2026-05-02
tools/slice4-research/data/2026-07-18_2026-10-16/12h-dione.json | 62910 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-enceladus.json | 62878 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-iapetus.json | 63022 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-mimas.json | 62888 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-rhea.json | 62976 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-saturn.json | 62383 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-tethys.json | 62932 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/12h-titan.json | 63027 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/1h-enceladus.json | 758351 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/1h-mimas.json | 758397 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/1h-tethys.json | 758744 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/30m-enceladus.json | 1517098 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/30m-mimas.json | 1517352 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/30m-tethys.json | 1517955 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-dione.json | 250155 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-enceladus.json | 250061 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-iapetus.json | 250625 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-mimas.json | 250069 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-rhea.json | 250464 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-saturn.json | 248069 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-tethys.json | 250205 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/3h-titan.json | 250611 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-dione.json | 125221 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-enceladus.json | 125144 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-iapetus.json | 125433 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-mimas.json | 125165 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-rhea.json | 125347 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-saturn.json | 124152 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-tethys.json | 125243 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/6h-titan.json | 125432 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-dione.json | 32021 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-enceladus.json | 32011 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-iapetus.json | 32085 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-mimas.json | 32015 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-rhea.json | 32062 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-saturn.json | 31759 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-tethys.json | 32022 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/daily-titan.json | 32092 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-15m-enceladus.json | 3035992 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-15m-mimas.json | 3036671 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-15m-tethys.json | 3037833 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-dione.json | 1517866 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-enceladus.json | 1517100 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-iapetus.json | 1520565 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-mimas.json | 1517354 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-rhea.json | 1519500 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-saturn.json | 1505330 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-tethys.json | 1517957 | UNTRACKED | -
tools/slice4-research/data/2026-07-18_2026-10-16/truth-titan.json | 1520247 | UNTRACKED | -
tools/slice4-research/data/30m-enceladus.json | 1517020 | TRACKED | 2026-05-02
tools/slice4-research/data/30m-mimas.json | 1516853 | TRACKED | 2026-05-02
tools/slice4-research/data/30m-tethys.json | 1518056 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-dione.json | 250183 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-enceladus.json | 250008 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-iapetus.json | 250677 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-mimas.json | 249968 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-rhea.json | 250480 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-saturn.json | 248096 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-tethys.json | 250175 | TRACKED | 2026-05-02
tools/slice4-research/data/3h-titan.json | 250544 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-dione.json | 125206 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-enceladus.json | 125117 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-iapetus.json | 125477 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-mimas.json | 125095 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-rhea.json | 125375 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-saturn.json | 124173 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-tethys.json | 125208 | TRACKED | 2026-05-02
tools/slice4-research/data/6h-titan.json | 125403 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-dione.json | 32034 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-enceladus.json | 32009 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-iapetus.json | 32092 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-mimas.json | 32002 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-rhea.json | 32062 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-saturn.json | 31756 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-tethys.json | 32030 | TRACKED | 2026-05-02
tools/slice4-research/data/daily-titan.json | 32067 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-15m-enceladus.json | 3036053 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-15m-mimas.json | 3035769 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-15m-tethys.json | 3038114 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-dione.json | 1517931 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-enceladus.json | 1517022 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-iapetus.json | 1520653 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-mimas.json | 1516855 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-rhea.json | 1519558 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-saturn.json | 1505378 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-tethys.json | 1518058 | TRACKED | 2026-05-02
tools/slice4-research/data/truth-titan.json | 1520225 | TRACKED | 2026-05-02
tools/slice4-research/fetch-horizons.mjs | 6748 | TRACKED | 2026-08-03
tools/slice4-research/interpolation-report.md | 9180 | TRACKED | 2026-05-02
tools/slice4-research/measure-interpolation.mjs | 19589 | TRACKED | 2026-05-02
tools/slice4-research/pck-extraction.md | 3315 | TRACKED | 2026-05-02
tools/slice5-research/research-report.md | 5071 | TRACKED | 2026-05-03
tools/slice5-research/ring-substructure.json | 6921 | TRACKED | 2026-05-03
tools/slice6-research/build-mars-system-fixture.mjs | 1916 | TRACKED | 2026-08-03
tools/slice6-research/data/2026-07-18_2026-10-16/deimos-15m.json | 3051277 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/deimos-1h.json | 762047 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/deimos-30m.json | 1524675 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/mars-1d.json | 31775 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/phobos-15m.json | 3042414 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/phobos-1h.json | 759871 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/phobos-30m.json | 1520161 | UNTRACKED | -
tools/slice6-research/data/2026-07-18_2026-10-16/phobos-5m.json | 9154176 | UNTRACKED | -
tools/slice6-research/data/cadence-measurements.json | 1107 | TRACKED | 2026-05-05
tools/slice6-research/data/deimos-15m.json | 3051226 | TRACKED | 2026-05-05
tools/slice6-research/data/deimos-1h.json | 762056 | TRACKED | 2026-05-05
tools/slice6-research/data/deimos-30m.json | 1524669 | TRACKED | 2026-05-05
tools/slice6-research/data/mars-1d.json | 31774 | TRACKED | 2026-05-05
tools/slice6-research/data/phobos-15m.json | 3042345 | TRACKED | 2026-05-05
tools/slice6-research/data/phobos-1h.json | 759914 | TRACKED | 2026-05-05
tools/slice6-research/data/phobos-30m.json | 1520211 | TRACKED | 2026-05-05
tools/slice6-research/data/phobos-5m.json | 9153705 | TRACKED | 2026-05-05
tools/slice6-research/fetch-horizons.mjs | 6324 | TRACKED | 2026-08-03
tools/slice6-research/measure-interpolation.mjs | 4378 | TRACKED | 2026-05-05
tools/slice6-research/pck-extraction.md | 2792 | TRACKED | 2026-05-05
tools/slice6-research/research-report.md | 5240 | TRACKED | 2026-05-05
tools/slice7-research/data/famous-neas.json | 3316 | TRACKED | 2026-05-09
tools/slice7-research/data/frame-validation.json | 698 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-anchors.json | 872701 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-1-90d.json | 31715 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-10-90d.json | 31992 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-101955-90d.json | 32044 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-1057-90d.json | 32038 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-15-90d.json | 32086 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-16-90d.json | 32014 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-1620-90d.json | 31995 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-162173-90d.json | 32092 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-2-90d.json | 31979 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-25143-90d.json | 31726 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-3-90d.json | 31787 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-39-90d.json | 31983 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-4-90d.json | 31808 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-40-90d.json | 31983 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-4179-90d.json | 32170 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-433-90d.json | 32075 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-4769-90d.json | 32079 | TRACKED | 2026-05-09
tools/slice7-research/data/horizons-truth/asteroid-99942-90d.json | 32004 | TRACKED | 2026-05-09
tools/slice7-research/data/keplerian-accuracy-anchored.json | 18954 | TRACKED | 2026-05-09
tools/slice7-research/data/keplerian-accuracy.json | 7505 | TRACKED | 2026-05-09
tools/slice7-research/data/main-belt-cutoff-h.txt | 31 | TRACKED | 2026-05-09
tools/slice7-research/data/main-belt-selection-stats.json | 476 | TRACKED | 2026-05-09
tools/slice7-research/data/main-belt-top-1000.json | 366188 | TRACKED | 2026-05-09
tools/slice7-research/data/sample-asteroids.json | 7684 | TRACKED | 2026-05-09
tools/slice7-research/fetch-horizons-anchors.mjs | 7512 | TRACKED | 2026-05-09
tools/slice7-research/fetch-horizons-asteroids.mjs | 6558 | TRACKED | 2026-05-09
tools/slice7-research/fetch-sbdb.mjs | 11923 | TRACKED | 2026-05-09
tools/slice7-research/keplerian-propagate.mjs | 4382 | TRACKED | 2026-05-09
tools/slice7-research/measure-keplerian-accuracy.mjs | 7699 | TRACKED | 2026-05-09
tools/slice7-research/measure-keplerian-anchored.mjs | 6396 | TRACKED | 2026-05-09
tools/slice7-research/research-report.md | 14152 | TRACKED | 2026-05-09
tools/slice7-research/state-to-elements.mjs | 4810 | TRACKED | 2026-05-09
tools/slice7-research/test-keplerian.mjs | 5853 | TRACKED | 2026-05-09
tools/slice7-research/test-state-to-elements.mjs | 2486 | TRACKED | 2026-05-09
tools/slice7-research/validate-frame-rotation.mjs | 5597 | TRACKED | 2026-05-09
tools/slice8-5-research/README.md | 2089 | TRACKED | 2026-05-22
tools/slice8-5-research/build-star-catalog.mjs | 7530 | TRACKED | 2026-05-22
tools/slice8-5-research/data/tycho2-mag75.tsv | 2985987 | UNTRACKED | -
tools/slice8-5-research/data/tycho2-suppl1-mag75.tsv | 13198 | UNTRACKED | -
tools/slice8-5-research/validate-star-catalog.mjs | 5225 | TRACKED | 2026-05-22
tools/slice8-research/analyze-h-thresholds-round3.mjs | 2301 | TRACKED | 2026-05-13
tools/slice8-research/analyze-inv-013-bands.mjs | 3512 | TRACKED | 2026-05-12
tools/slice8-research/build-main-belt-top-10000.mjs | 3161 | TRACKED | 2026-05-12
tools/slice8-research/build-sample-200-eccentricity.mjs | 4692 | TRACKED | 2026-05-13
tools/slice8-research/build-sample-200.mjs | 4529 | TRACKED | 2026-05-12
tools/slice8-research/common.mjs | 5941 | TRACKED | 2026-05-12
tools/slice8-research/data/h-threshold-analysis.json | 1444 | TRACKED | 2026-05-13
tools/slice8-research/data/horizons-anchors-200-eccentricity.json | 208434 | TRACKED | 2026-05-13
tools/slice8-research/data/inv-013-band-analysis.json | 2026 | TRACKED | 2026-05-12
tools/slice8-research/data/inv-013-band-bars.json | 6267 | TRACKED | 2026-05-13
tools/slice8-research/data/keplerian-accuracy-200-eccentricity.json | 134152 | TRACKED | 2026-05-13
tools/slice8-research/data/keplerian-accuracy-200.json | 130366 | TRACKED | 2026-05-12
tools/slice8-research/data/main-belt-top-10000.json | 3690180 | TRACKED | 2026-05-12
tools/slice8-research/data/methodology-investigation.json | 20916 | TRACKED | 2026-05-13
tools/slice8-research/data/sample-200-eccentricity.json | 65677 | TRACKED | 2026-05-13
tools/slice8-research/data/sample-200.json | 77245 | TRACKED | 2026-05-12
tools/slice8-research/data/sbdb-epoch-distribution.json | 799 | TRACKED | 2026-05-12
tools/slice8-research/data/slice7-regression-validation.json | 5962 | TRACKED | 2026-05-13
tools/slice8-research/derive-inv-013-band-bars.mjs | 5440 | TRACKED | 2026-05-13
tools/slice8-research/fetch-horizons-anchors-200-eccentricity.mjs | 4202 | TRACKED | 2026-05-13
tools/slice8-research/horizons.mjs | 4068 | TRACKED | 2026-05-12
tools/slice8-research/investigate-methodology.mjs | 9964 | TRACKED | 2026-05-13
tools/slice8-research/measure-keplerian-accuracy-200-eccentricity.mjs | 5522 | TRACKED | 2026-05-13
tools/slice8-research/measure-keplerian-accuracy-200.mjs | 5140 | TRACKED | 2026-05-12
tools/slice8-research/measure-sbdb-epoch-distribution.mjs | 3742 | TRACKED | 2026-05-12
tools/slice8-research/round2-methodology-report.md | 8513 | TRACKED | 2026-05-13
tools/slice8-research/round3-synthesis-report.md | 6583 | TRACKED | 2026-05-13
tools/slice8-research/validate-slice7-against-round3-bars.mjs | 2577 | TRACKED | 2026-05-13
tools/slice9-research/README.md | 865 | TRACKED | 2026-05-16
tools/slice9-research/SLICE_9_PRERESEARCH_REPORT.md | 8674 | TRACKED | 2026-05-16
tools/slice9-research/build-report.mjs | 8932 | TRACKED | 2026-05-16
tools/slice9-research/common.mjs | 7205 | TRACKED | 2026-05-16
tools/slice9-research/data/cad-flags.json | 338638 | TRACKED | 2026-05-16
tools/slice9-research/data/inv014-sample-results.json | 59074 | TRACKED | 2026-05-16
tools/slice9-research/data/inv014-truth.json | 2279242 | TRACKED | 2026-05-16
tools/slice9-research/data/occupancy-summary.json | 1586 | TRACKED | 2026-05-16
tools/slice9-research/data/sbdb-nea-raw.json | 14729300 | UNTRACKED | -
tools/slice9-research/data/sbdb-nea-summary.json | 1707 | TRACKED | 2026-05-16
tools/slice9-research/data/slice9-cutover-cad.json | 396323 | UNTRACKED | -
tools/slice9-research/data/slice9-cutover-sample.json | 69199 | UNTRACKED | -
tools/slice9-research/data/slice9-cutover-truth.json | 4627647 | UNTRACKED | -
tools/slice9-research/fetch-sbdb-nea.mjs | 3121 | TRACKED | 2026-05-16
tools/slice9-research/keplerian-offline.mjs | 4307 | TRACKED | 2026-05-16
tools/slice9-research/measure-inv014-sample.mjs | 10108 | TRACKED | 2026-05-16
tools/slice9-research/measure-occupancy.mjs | 3719 | TRACKED | 2026-05-16
tools/slice9-research/slice9-node-propagation-batch.mjs | 1059 | TRACKED | 2026-05-20
tools/slice9-research/slice9-node-propagation-worker.mjs | 826 | TRACKED | 2026-05-20
```

### Founding documents

All 14 discovered files are tracked. “Highest” is the highest literal identifier token occurring anywhere in the file (including cross-references), not a claim that the token is defined there.

| Path | Slice | Highest DEC token | Highest INV token | Evidence |
|---|---:|---|---|---|
| `FOUNDING_DOCUMENT.md` | legacy/root | — | — | `git ls-files` tracked; no DEC/INV token |
| `V2_FOUNDING_DOCUMENT.md` | V2 root | DEC-5 | INV-013 | `V2_FOUNDING_DOCUMENT.md:932-933` also contains corpus terms |
| `src/v2/SLICE_8_5_FOUNDING.md` | 8.5 | — | INV-014 | tracked |
| `src/v2/SLICE_9_FOUNDING.md` | 9 | DEC-5 | INV-014 | tracked |
| `src/v2/SLICE_10_FOUNDING.md` | 10 | DEC-8 (ignoring prose token `DEC-locked`) | INV-016 | tracked |
| `src/v2/SLICE_11_FOUNDING.md` | 11 | DEC-11C-5 | INV-020 | tracked |
| `src/v2/SLICE_12_FOUNDING.md` | 12 | DEC-12-6 | INV-021 | tracked |
| `src/v2/SLICE_13_FOUNDING.md` | 13 | DEC-13-9 | INV-034-class (reference); numbered ceiling INV-023 | tracked |
| `src/v2/SLICE_14_FOUNDING.md` | 14 | DEC-14-6 | INV-026 | tracked |
| `src/v2/SLICE_15_FOUNDING.md` | 15 | DEC-15-8 | INV-033 | tracked |
| `src/v2/SLICE_16_FOUNDING.md` | 16 | DEC-16-13 | INV-S16-036 (global numeric reference also reaches INV-037) | `src/v2/SLICE_16_FOUNDING.md:1132,1256` |
| `src/v2/SLICE_V1_FOUNDING.md` | V1 | DEC-V1-4c | INV-V1-003 | tracked |
| `src/v2/founding-drafts/DOSSIER_FOUNDING.md` | dossier draft | DEC-D5 | INV-039 | tracked |
| `src/v2/founding-drafts/SLICE_17_FOUNDING.md` | 17 draft | DEC-17-4 | literal `INV-27-clean` (placeholder `INV-04x` also occurs) | tracked |

Note: the table has 14 rows because both roots plus 12 files under `src/v2` were found; the raw `find` evidence was: `FOUNDING_DOCUMENT.md`, `V2_FOUNDING_DOCUMENT.md`, `SLICE_{8_5,9,10,11,12,13,14,15,16,V1}_FOUNDING.md`, and the two founding drafts.

### Filename-matched documents and header dates

The document filter was case-insensitive on `ROADMAP|PLAN|BACKLOG|LEDGER|STRATEGY|HANDOFF|STATUS|CLOSE|ARCHIVE|REMEDIATION`, limited to document extensions and excluding dependency trees. Every listed file is tracked.

| Path | Own header date | Evidence |
|---|---|---|
| `HANDOFF.md` | 2026-07-10 | `HANDOFF.md:1-5` |
| `STATUS.md` | rewritten 2026-08-02 | `STATUS.md:1-6` |
| `src/v2/SLICE_V1_STATUS.md` | 2026-06-22 | `src/v2/SLICE_V1_STATUS.md:1-4` |
| `src/v2/research/slice-18-risk/deep-research-risk-portfolio-mission-planner-ux.pdf` | UNVERIFIABLE: no extractable header date with installed tools | Git last commit is `602e744`, 2026-05-23; that is not an own-header date |
| `strategy/ASTER_FAMILY_MASTER_PLAN.md` | drafted 2026-07-06 | `strategy/ASTER_FAMILY_MASTER_PLAN.md:1-5` |
| `tools/slice16-harness/ARCHIVE_REPORT.md` | marker/session 2026-08-02 | `tools/slice16-harness/ARCHIVE_REPORT.md:1-5` |
| `tools/slice16-harness/CLOSE_REPORT.md` | marker/session 2026-08-02 | `tools/slice16-harness/CLOSE_REPORT.md:1-5` |
| `tools/slice16-harness/REMEDIATION_REPORT.md` | marker 2026-08-01 | `tools/slice16-harness/REMEDIATION_REPORT.md:1-4` |

`strategy/` exists and is tracked; primary evidence includes `strategy/ASTER_FAMILY_MASTER_PLAN.md` and `strategy/ASTER_FAMILY_CHARTERS.md` (the latter is cited at master-plan line 28 and is tracked at `strategy/ASTER_FAMILY_CHARTERS.md:1-5`).

## 1.3 Slice coverage, 1–25

“Mentioned” means at least one committed Markdown file matched case-insensitive `slice[ _-]*N` with a non-digit boundary. The evidence path(s) are representative when the set is large; the yes/no result came from `git grep -l` over all tracked Markdown. “Founding” includes the tracked Slice 17 draft.

| Slice | Research dir? | Founding doc? | Mentioned in committed doc? | Explicit gap/evidence |
|---:|:---:|:---:|:---:|---|
| 1 | NO | NO | YES | gap: no research/founding; `LEGACY.md`, `V2_FOUNDING_DOCUMENT.md` |
| 2 | YES | NO | YES | gap: no slice founding; `tools/slice2-research/`, boundary spec |
| 3 | YES | NO | YES | gap: no slice founding; `tools/slice3-research/` |
| 4 | YES | NO | YES | gap: no slice founding; `tools/slice4-research/` |
| 5 | YES | NO | YES | gap: no slice founding; `tools/slice5-research/research-report.md` |
| 6 | YES | NO | YES | gap: no slice founding; `tools/slice6-research/` |
| 7 | YES | NO | YES | gap: no slice founding; `tools/slice7-research/` |
| 8 | YES | NO | YES | gap: no exact Slice 8 founding; Slice 8.5 is separate |
| 9 | YES | YES | YES | `tools/slice9-research/`, `src/v2/SLICE_9_FOUNDING.md` |
| 10 | YES | YES | YES | both present |
| 11 | YES | YES | YES | both present |
| 12 | YES | YES | YES | both present |
| 13 | YES | YES | YES | both present |
| 14 | YES | YES | YES | both present |
| 15 | YES | YES | YES | both present |
| 16 | YES | YES | YES | both present |
| 17 | NO | YES (draft) | YES | gap: no `tools/slice17-research/`; `src/v2/founding-drafts/SLICE_17_FOUNDING.md` |
| 18 | NO | NO | YES | gap: no tools research/founding; provenance/PDF under `src/v2/research/slice-18-risk/` |
| 19 | NO | NO | YES | gap: no tools research/founding; `src/v2/research/slice-19-portfolio/PROVENANCE.md` |
| 20 | NO | NO | YES | gap: no tools research/founding; `src/v2/research/slice-20-mission-planner-ux/PROVENANCE.md` |
| 21 | NO | NO | NO | complete gap |
| 22 | NO | NO | NO | complete gap |
| 23 | NO | NO | NO | complete gap |
| 24 | NO | NO | NO | complete gap |
| 25 | NO | NO | NO | complete gap |

There is a structurally important parallel corpus outside the requested `tools/slice*-research` convention: `src/v2/research/` contains tracked provenance/artifacts for slices 10–20 (`src/v2/research/README.md:1-11`; filesystem listing includes slice-10, 11, 12, 13, 14, 15, 16, 17, 18, 19, and 20 directories). This explains why slices 18–20 are mentioned while lacking the conventional tools directory.

## 1.4 Decisive tracked-corpus test

Result: the named 2026-08 research corpus is **not present as a coherent tracked corpus**. INFERRED from two independent primary facts: (a) seven distinctive search terms have zero tracked hits (`VSOP87`, `ELP2000`, `ELP/MPP02`, `DOP853`, `Dormand-Prince`, `Pareto`, `porkchop thumbnail`); (b) no `tools/slice17-research` or later conventional research directory exists. Some generic/domain terms do occur, but those hits are older V1/V2 code/docs, May research, or August Slice 16 study ledgers—not the requested corpus. The August commit log likewise contains Slice 16 study work, product work, deployment, and the repo audit, with no commit introducing such a research corpus.

Every tracked hit is indexed below as `file:line[,line...]`; all entries are TRACKED because they came from `git grep`. Explicit zeroes are included.

**VSOP87**

ZERO TRACKED HITS

**ELP2000**

ZERO TRACKED HITS

**ELP/MPP02**

ZERO TRACKED HITS

**CelesTrak**

DATA_SOURCES.md:60,61,62,63,106
DEVLOG.md:232
index.html:3821,3853,3854,3855,3856,3880,3888
src/renderer/scene/earth/satellites.ts:7,15,16,17,18,88,96
strategy/ASTER_FAMILY_CHARTERS.md:37

**Space-Track**

tools/slice16-harness/runs/ledger-control-a12.jsonl:120

**SGP4**

DEVLOG.md:219
V2_FOUNDING_DOCUMENT.md:933
strategy/ASTER_FAMILY_CHARTERS.md:37

**Shoemaker-Helin**

DEVLOG.md:209
index.html:930

**NHATS**

DATA_SOURCES.md:18,19,23,24,101
DEVLOG.md:80,89,91,102,103,107,197,199,269,273,276,277,278,279,280,281,283,284,291,292,295,296,299,300,303,304,306,315,316,339,343,462,465,467,470,472,473,474,486,619
FOUNDING_DOCUMENT.md:58,59,63,205,219,237
REFACTOR_MAP.md:44,51,71,116
UPDATES.md:89,136,141,144,145,146,147,151,153,177,228,231,248,249,255,282,284,325,365,366,373,376,385,406,407,493,500,508,580,613,620,634,650,661,900,903,904,909,912,924,925,927,929,936,943,946
V2_FOUNDING_DOCUMENT.md:932
_rescued-agent-defs/data-layer.md:3,6
docs/assets/legacy-DWIJIRxJ.js:1,25,26,36,41,42,75,102,107,109
docs/assets/solarSystemV2-Ph7W34bE.js:155
docs/index.html:56,103,252,339,340,341
docs/physics.worker.js:70,193,194,195,243,256,261,262,263,1724,1727,1732,1733,1735,1738,1741,1776,1779,1782,1783,1785,1786,1787,1789,1792,1793,1797,1798,1801,1807,1808,1810,1811,1823,1824,1831,1833,1834,1835,1836,1837,1839,1855,1858
index.html:52,99,248,335,336,337,944,956,957,963,964,1018,1171,1172,1177,1178,1179,1184,1186,1187,1188,1195,1197,1198,1199,1215,1887,2105,2122,2123,2124,2125,2126,2127,2216,2223,2396,2472,2474,2475,2476,2541,2546,2582,2584,2585,2586,2588,2592,2594,2603,2604,2607,2608,2643,2644,2645,2662,3214,3289,3321,3330,3331,3337,3365,3384,3394,3408,3425,3448,3452,3464,3465,3466,3467,3497,3499,3500,3505,3506,3672,3673,3679,3684,3770,3772,3778,3779,3783,3786,3787,3793,3795,3796,3799,3800,3803,3805,3806,3807,3811,3816,4106,4113,4196,4222,4530,5140,5141,6314,6315,6316,6337,6338,6339,6340,6341,6342,6344,6411,7467,7475,7602,7603,7604,7605,7606,7607,7609,7762,7779
physics.worker.js:70,193,194,195,243,256,261,262,263,1724,1727,1732,1733,1735,1738,1741,1776,1779,1782,1783,1785,1786,1787,1789,1792,1793,1797,1798,1801,1807,1808,1810,1811,1823,1824,1831,1833,1834,1835,1836,1837,1839,1855,1858
proxy/README.md:10
proxy/index.js:349,350,357,373
src/data/asterank/index.ts:10,17,23,46,74,75,78,80,82,112,113
src/data/nhats/index.ts:2,4,5,11,15,16,18,24,30,31,35,38,39,45,47,48,51,54,55,56,57,60,61,67,72
src/economics/mission-costs/planner.ts:105,135,136
src/economics/pricing/active.ts:21,74,77,78,89,220,221,306,307,308,314,315,319,321
src/main.ts:20,52,268,364,513,514,515,516,517,518,520
src/physics/catalog/normalizers.ts:25,38,43,44,45
src/physics/constants/index.ts:71
src/renderer/scene/asteroids/instanced-field/index.ts:91
src/renderer/scene/index.ts:79,80,83,85,87,88
src/renderer/scene/orbits/index.ts:15,100,101
src/ui/hud/selection.ts:9,11,18,133,134,135,156,157,158,159,160,161,163,251,265,277
src/ui/overlays/labels.ts:4,91,102,162,164,165,166
src/ui/overlays/tooltips.ts:69,82
src/ui/panels/left/filter-events.ts:7,26,74,151,158
src/ui/panels/left/filters.ts:8,18,77,87,103,118,152,161,162,168,183,190,230,232,233,236,238,239,244,245
src/ui/panels/right/research.ts:4
src/utils/export.ts:66,78,79,93
src/v2/SLICE_10_FOUNDING.md:12,25,55,59,113,137,141,143,146,151,290,292,296,298,304,318,338,369,370,371,388,392,397,402,418,452,456
src/v2/app/catalog-list/honesty-disclosure.ts:29
src/v2/boundary/README.md:32,58,60
src/v2/boundary/lambert-screen-cache.ts:16
src/v2/core/units/utc-to-tdb.ts:12
src/v2/research/README.md:11
src/v2/research/slice-11-porkchop/PROVENANCE.md:4,10
src/v2/research/slice-11-porkchop/perplexity-jpl-trajectory-browser-nhats.md:1,4,11,21,23,29,31,33,35,37,44,50,54,60,66,70
src/workers/physics/api-client.ts:1,3,4,5
src/workers/physics/client.ts:14,46,48,49,50,52,56,58,68,69,72,73,165,166,237
src/workers/physics/handlers/catalog.ts:2,5,29,32,37,38,40,43,46,80,83,86,87,89,90,91,93,96,97,101,102,106,112,113,115,116,128,129,136,138,139,140,141,142,144,160,163
src/workers/physics/index.ts:10,70,71
tests/fixtures/v2/nhats-validation-targets/101955.json:1
tests/fixtures/v2/nhats-validation-targets/1999_AO10.json:1
tests/fixtures/v2/nhats-validation-targets/2000_SG344.json:1
tests/fixtures/v2/nhats-validation-targets/2001_GP2.json:1
tests/fixtures/v2/nhats-validation-targets/99942.json:1
tests/fixtures/v2/oq7-nhats-coorbital/1991_VG.json:15
tests/fixtures/v2/oq7-nhats-coorbital/2000_SG344.json:25
tests/fixtures/v2/oq7-nhats-coorbital/2001_GP2.json:6
tests/fixtures/v2/oq7-nhats-coorbital/2003_YN107.json:2
tests/fixtures/v2/oq7-nhats-coorbital/2006_BZ147.json:8
tests/fixtures/v2/oq7-nhats-coorbital/2006_JY26.json:2
tests/fixtures/v2/oq7-nhats-coorbital/2006_QQ56.json:9
tests/fixtures/v2/oq7-nhats-coorbital/2006_RH120.json:56
tests/fixtures/v2/oq7-nhats-coorbital/2007_UN12.json:23
tests/fixtures/v2/oq7-nhats-coorbital/2007_VU6.json:4
tests/fixtures/v2/oq7-nhats-coorbital/2008_EA9.json:6
tests/fixtures/v2/oq7-nhats-coorbital/2008_EL68.json:44
tests/fixtures/v2/oq7-nhats-coorbital/2008_KT.json:2
tests/fixtures/v2/oq7-nhats-coorbital/2008_UA202.json:29
tests/fixtures/v2/oq7-nhats-coorbital/2010_JW34.json:14
tests/fixtures/v2/oq7-nhats-coorbital/2010_VQ98.json:63
tests/fixtures/v2/oq7-nhats-coorbital/2011_BL45.json:45
tests/fixtures/v2/oq7-nhats-coorbital/2011_BQ50.json:22
tests/fixtures/v2/oq7-nhats-coorbital/2011_UD21.json:6
tests/fixtures/v2/oq7-nhats-coorbital/2011_UX275.json:9
tests/fixtures/v2/oq7-nhats-coorbital/2011_WE.json:22
tests/fixtures/v2/oq7-nhats-coorbital/2012_FC71.json:2
tests/fixtures/v2/oq7-nhats-coorbital/2012_LA.json:4
tests/fixtures/v2/oq7-nhats-coorbital/2012_TF79.json:64
tests/fixtures/v2/oq7-nhats-coorbital/2013_BS45.json:62
tests/fixtures/v2/oq7-nhats-coorbital/2013_RZ53.json:2
tests/fixtures/v2/oq7-nhats-coorbital/2014_DJ80.json:28
tests/fixtures/v2/oq7-nhats-coorbital/2014_KF39.json:56
tests/fixtures/v2/oq7-nhats-coorbital/2014_QD364.json:7
tests/fixtures/v2/oq7-nhats-coorbital/2014_WA366.json:17
tests/fixtures/v2/oq7-nhats-coorbital/2014_WU200.json:10
tests/fixtures/v2/oq7-nhats-coorbital/2014_WX202.json:45
tests/fixtures/v2/oq7-nhats-coorbital/2015_XZ378.json:58
tests/fixtures/v2/oq7-nhats-coorbital/2016_ES85.json:63
tests/fixtures/v2/oq7-nhats-coorbital/2016_GK135.json:65
tests/fixtures/v2/oq7-nhats-coorbital/2016_NP56.json:61
tests/fixtures/v2/oq7-nhats-coorbital/2016_RD34.json:57
tests/fixtures/v2/oq7-nhats-coorbital/2016_YR.json:17
tests/fixtures/v2/oq7-nhats-coorbital/2017_BN93.json:42
tests/fixtures/v2/oq7-nhats-coorbital/2017_FT102.json:56
tests/fixtures/v2/oq7-nhats-coorbital/2017_HU49.json:6
tests/fixtures/v2/oq7-nhats-coorbital/2017_UM52.json:12
tests/fixtures/v2/oq7-nhats-coorbital/2018_BC.json:7
tests/fixtures/v2/oq7-nhats-coorbital/2018_FM3.json:12
tests/fixtures/v2/oq7-nhats-coorbital/2018_PK21.json:55
tests/fixtures/v2/oq7-nhats-coorbital/2018_PM28.json:6
tests/fixtures/v2/oq7-nhats-coorbital/2018_PN22.json:61
tests/fixtures/v2/oq7-nhats-coorbital/2018_PU23.json:42
tests/fixtures/v2/oq7-nhats-coorbital/2018_VT7.json:13
tests/fixtures/v2/oq7-nhats-coorbital/2018_WV1.json:9
tests/fixtures/v2/oq7-nhats-coorbital/2019_GF1.json:60
tests/fixtures/v2/oq7-nhats-coorbital/2019_KM2.json:29
tests/fixtures/v2/oq7-nhats-coorbital/2019_PO1.json:64
tests/fixtures/v2/oq7-nhats-coorbital/2019_TF2.json:31
tests/fixtures/v2/oq7-nhats-coorbital/2019_UB4.json:64
tests/fixtures/v2/oq7-nhats-coorbital/2020_CD3.json:38
tests/fixtures/v2/oq7-nhats-coorbital/2020_FA1.json:54
tests/fixtures/v2/oq7-nhats-coorbital/2020_GE.json:6
tests/fixtures/v2/oq7-nhats-coorbital/2020_HF4.json:29
tests/fixtures/v2/oq7-nhats-coorbital/2020_HO5.json:55
tests/fixtures/v2/oq7-nhats-coorbital/2020_MU1.json:64
tests/fixtures/v2/oq7-nhats-coorbital/2020_PJ6.json:29
tests/fixtures/v2/oq7-nhats-coorbital/2020_RB4.json:14
tests/fixtures/v2/oq7-nhats-coorbital/2020_RR8.json:44
tests/fixtures/v2/oq7-nhats-coorbital/2020_UO4.json:12
tests/fixtures/v2/oq7-nhats-coorbital/2020_VN1.json:8
tests/fixtures/v2/oq7-nhats-coorbital/2020_WY.json:29
tests/fixtures/v2/oq7-nhats-coorbital/2021_AK5.json:8
tests/fixtures/v2/oq7-nhats-coorbital/2021_AT2.json:12
tests/fixtures/v2/oq7-nhats-coorbital/2021_CN3.json:11
tests/fixtures/v2/oq7-nhats-coorbital/2021_CZ4.json:53
tests/fixtures/v2/oq7-nhats-coorbital/2021_GM1.json:9
tests/fixtures/v2/oq7-nhats-coorbital/2021_JY5.json:17
tests/fixtures/v2/oq7-nhats-coorbital/2021_LD6.json:7
tests/fixtures/v2/oq7-nhats-coorbital/2021_LF6.json:44
tests/fixtures/v2/oq7-nhats-coorbital/2021_RG12.json:17
tests/fixtures/v2/oq7-nhats-coorbital/2021_RZ3.json:23
tests/fixtures/v2/oq7-nhats-coorbital/2021_TT4.json:12
tests/fixtures/v2/oq7-nhats-coorbital/2021_VH2.json:55
tests/fixtures/v2/oq7-nhats-coorbital/2021_VX22.json:22
tests/fixtures/v2/oq7-nhats-coorbital/2022_BY39.json:16
tests/fixtures/v2/oq7-nhats-coorbital/2022_ML3.json:22
tests/fixtures/v2/oq7-nhats-coorbital/2022_NX1.json:28
tests/fixtures/v2/oq7-nhats-coorbital/2022_OB5.json:4
tests/fixtures/v2/oq7-nhats-coorbital/2022_RD2.json:53
tests/fixtures/v2/oq7-nhats-coorbital/2022_RS1.json:13
tests/fixtures/v2/oq7-nhats-coorbital/2022_RW3.json:24
tests/fixtures/v2/oq7-nhats-coorbital/2022_UA1.json:16
tests/fixtures/v2/oq7-nhats-coorbital/2023_BU7.json:15
tests/fixtures/v2/oq7-nhats-coorbital/2023_GQ1.json:24
tests/fixtures/v2/oq7-nhats-coorbital/2023_GT1.json:5
tests/fixtures/v2/oq7-nhats-coorbital/2023_HM4.json:4
tests/fixtures/v2/oq7-nhats-coorbital/2023_LE.json:60
tests/fixtures/v2/oq7-nhats-coorbital/2023_LG2.json:8
tests/fixtures/v2/oq7-nhats-coorbital/2023_NY.json:15
tests/fixtures/v2/oq7-nhats-coorbital/2023_PZ.json:36
tests/fixtures/v2/oq7-nhats-coorbital/2023_RO16.json:39
tests/fixtures/v2/oq7-nhats-coorbital/2023_RX1.json:7
tests/fixtures/v2/oq7-nhats-coorbital/2023_SO11.json:28
tests/fixtures/v2/oq7-nhats-coorbital/2023_UZ2.json:42
tests/fixtures/v2/oq7-nhats-coorbital/2023_XN13.json:12
tests/fixtures/v2/oq7-nhats-coorbital/2023_XQ16.json:16
tests/fixtures/v2/oq7-nhats-coorbital/2023_YO1.json:42
tests/fixtures/v2/oq7-nhats-coorbital/2024_BD4.json:61
tests/fixtures/v2/oq7-nhats-coorbital/2024_DQ.json:55
tests/fixtures/v2/oq7-nhats-coorbital/2024_GD2.json:9
tests/fixtures/v2/oq7-nhats-coorbital/2024_GR.json:30
tests/fixtures/v2/oq7-nhats-coorbital/2024_JQ1.json:28
tests/fixtures/v2/oq7-nhats-coorbital/2024_MM1.json:45
tests/fixtures/v2/oq7-nhats-coorbital/2024_MS.json:56
tests/fixtures/v2/oq7-nhats-coorbital/2024_PT5.json:56
tests/fixtures/v2/oq7-nhats-coorbital/2024_RA16.json:11
tests/fixtures/v2/oq7-nhats-coorbital/2024_XH9.json:14
tests/fixtures/v2/oq7-nhats-coorbital/2024_XK6.json:61
tests/fixtures/v2/oq7-nhats-coorbital/2024_YL4.json:43
tests/fixtures/v2/oq7-nhats-coorbital/2024_YY5.json:42
tests/fixtures/v2/oq7-nhats-coorbital/2025_DB7.json:61
tests/fixtures/v2/oq7-nhats-coorbital/2025_DU7.json:17
tests/fixtures/v2/oq7-nhats-coorbital/2025_EM.json:3
tests/fixtures/v2/oq7-nhats-coorbital/2025_NL.json:57
tests/fixtures/v2/oq7-nhats-coorbital/2025_OR5.json:11
tests/fixtures/v2/oq7-nhats-coorbital/2025_UF5.json:7
tests/fixtures/v2/oq7-nhats-coorbital/2025_WR7.json:57
tests/fixtures/v2/oq7-nhats-coorbital/2025_YU11.json:52
tests/fixtures/v2/oq7-nhats-coorbital/2026_AC4.json:29
tests/fixtures/v2/oq7-nhats-coorbital/2026_BZ5.json:64
tests/fixtures/v2/oq7-nhats-coorbital/2026_FJ.json:61
tests/fixtures/v2/oq7-nhats-coorbital/2026_HT.json:39
tests/fixtures/v2/oq7-nhats-coorbital/2026_JQ1.json:62
tests/fixtures/v2/oq7-nhats-coorbital/459872.json:42
tests/phase6-contract-smoke.test.mjs:76,79
tools/slice10-research/coorbital-drift-detail.json:14,41,44,52,55,63,66,71,80,83,88,115,118,135,144,147,161,164,172,175,183,186,200,203,214,223,226,243,258,261,275,278,286,289,297,300,314,317,331,334,342,345,359,362,370,373,381,384,398,401,427,430,450,453,467,470,478,481,489,492,500,503,553,556,564,567,611,614,826,829,897,900,932,935,961,964,978,981
tools/slice10-research/coorbital-drift.mjs:9,10,11,12,18,86,118,126,129,133,137,183,185,187,189,193,211,218,226,231,263,269,276,278,279,301,306,307,308,309,317,318,319,347,350,388
tools/slice10-research/nhats-diagnostic.mjs:7,12,56,80,86,87,88,89,90,91,92,93,94,121,122,124,135,136
tools/slice10-research/nhats-validation.mjs:3,9,68,118,119,121,127,128,129,174,175,176,183,194,197,210
tools/slice11-research/literature/query-3-delta-v-stack.md:59,84,117,123,178,180,203,241,242
tools/slice16-harness/runs/ledger-control-a12.jsonl:31,32,33,39,58,59
worker/README.md:10
worker/index.js:349,350,357,373

**Benner**

tools/slice16-harness/runs/ledger-control-a12.jsonl:32

**condition code**

FOUNDING_DOCUMENT.md:206
tools/slice16-harness/runs/ledger-full-a12-grades.json:5773,12113,12217,12576,12720,12889,13242,13374,13887,14524,14819,14968,15135,15455,16015,16174,16675,16993,17128,17410,17532,17998,18373,20228,24978,25101,25220,26081,26206,26518,27591,27701,27781,27787,27931,27937,32452,32838,33223,33640,34050,34375,34673,35035,37057,37252
tools/slice16-harness/runs/ledger-full-a12.jsonl:27,29,57,58,59,61,62,63,64,65,66,67,68,69,70,75,76,110,113,114,115,116,139,140,141,142,143,144,145,150,191,218,221,222,225
tools/slice16-harness/runs/ledger-full.jsonl:101,102
tools/slice16-harness/runs/ledger-probe.jsonl:6,12,13,20,25,26
tools/slice9-diagnostic/SLICE_9_OQ6_DIAGNOSTIC.md:31
tools/slice9-diagnostic/analyze-oq6.mjs:422
tools/slice9-research/build-report.mjs:104

**Cowell**

docs/assets/asteroid-catalog-slice8-Bsb2Sj5B.json:62041
tests/fixtures/v2/asteroid-catalog-slice8.json:62041
tools/slice8-ingestion/data/horizons-anchors-9000.json:62532
tools/slice8-research/data/main-belt-top-10000.json:54990

**DOP853**

ZERO TRACKED HITS

**Dormand-Prince**

ZERO TRACKED HITS

**polar motion**

vendor/naif/pck00010.tpc:228

**Pareto**

ZERO TRACKED HITS

**Eyes on Asteroids**

V2_FOUNDING_DOCUMENT.md:1255

**porkchop thumbnail**

ZERO TRACKED HITS

**delivered mass**

README.md:16
docs/assets/aboutV2-PUlTsC_X.js:1
docs/assets/porkchopV2-B33tJFkz.js:1
docs/assets/validation-provenance-lm2C_8vP.json:20
mcp/src/tools/estimate-mission-cost.ts:250
src/v2/SLICE_13_FOUNDING.md:10,63
src/v2/SLICE_15_FOUNDING.md:141
src/v2/SLICE_16_APPENDIX_A_LOCKED.md:251,255,256,257,258,361,385,389,390,391,392,398,402,403,404,405,488,489,490,622,626,776,780,783,784
src/v2/SLICE_16_FOUNDING.md:252
src/v2/app/about/main.ts:350
src/v2/app/porkchop/main.ts:721,804,825
src/v2/data/validation-provenance.json:20
src/v2/founding-drafts/DOSSIER_FOUNDING.md:64
src/v2/founding-drafts/SLICE_16_APPENDIX_A_scenarios.md:47,62,63
src/v2/porkchop/launch-vehicles.test.mjs:245
tools/slice14-research/literature/perplexity-council-review.md:29,49,75,80
tools/slice14-research/literature/perplexity-progress.md:36
tools/slice16-harness/config.mjs:552,553,554,623,624,625,631,632,633,672,673,674
tools/slice16-harness/fixtures/mock-toolcalls.json:23
tools/slice16-harness/grader.mjs:174,187,191,192
tools/slice16-harness/runs/ledger-control-a12.jsonl:23,28,29,30,45,46,55,56,57,58,59,60,73,74,75,106,107,108,133,134,135,136,137,138,151,152,153
tools/slice16-harness/runs/ledger-full-a12-grades.json:8528,9288,9391,10097,12599,12743,12981,13265,13484,24598,24687,29740,29829,35303,36405,36515,56805,56806,56807,56913,56914,56915,57508,57605
tools/slice16-harness/runs/ledger-full-a12.jsonl:43,44,45,46,47,48,50,51,52,53,54,55,56,57,58,59,60,65,88,89,98,105,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,137,145,146,147,148,149,150,197,198,199,201,202,204,207,211,212,213,214,215,216,221,236,251,255,257,260,261,265,266,267,268,269,270,271,272,273,274,275,276,301,302,303,304,305,306
tools/slice16-harness/runs/ledger-full.jsonl:91,93,94,95,96,97,98,99,100,106
tools/slice16-harness/runs/ledger-mock-2026-07-31-pre-A9-r10.jsonl:11,12,13,14,15,16,17,18,19,20
tools/slice16-harness/runs/ledger-mock.jsonl:4,5,6
tools/slice16-harness/runs/ledger-probe.jsonl:9,10,11,12,20,21,26,36,37,45,46,47,52
tools/slice16-harness/test/dd-rulings.test.mjs:232

**orbit quality**

## 1.5 Planning/status claims checked against 1.2–1.4

### `STATUS.md`

| Claim | Verdict | Primary evidence |
|---|---|---|
| Canonical repo is `/Users/hudsonclavin/asteroid-mining-planner` (`:12`). | CONFIRMED | initial `pwd` exactly matches |
| Local package is `aster-mission-mcp@0.1.0` and has a clean-worktree prepublish gate (`:14`). | CONFIRMED for repo artifacts; npm publication/publisher/handshake UNVERIFIABLE without network | `mcp/package.json:2-3,35`; `mcp/scripts/check-publish-clean.mjs` is tracked |
| origin/main is `642dfc9`, local commits are unpushed (`:22-25`). | FALSE | HEAD `c6c0c52`; `git rev-list ...` = `0 0` |
| Slice 16 founding and locked appendix are additive-only/hook-enforced (`:26`). | CONFIRMED that both tracked files exist; UNVERIFIABLE enforcement because both hook files are pre-existing modified paths | `git ls-files`; initial status lines for `.githooks/pre-commit` and `pre-push` |
| Global INV-034, global INV-037, and Slice-16 namespaced invariants exist (`:27`). | CONFIRMED | `INVARIANTS.md:164,201,203,216-219,227-233` |
| Slice 9–16 artifacts exist and Slice 16 is closed with result data (`:35-58`). | CONFIRMED as repository artifact claims | founding docs listed above; `tools/slice16-harness/CLOSE_REPORT.md:5,13-21`; 13 ledgers plus README tracked at commit `c037448` |
| Public preregistration DOI/seal facts (`:44`). | CONFIRMED only as recorded repo claims; external publication UNVERIFIABLE | `tools/slice16-harness/CLOSE_REPORT.md:13`; no network permitted |
| Slices/routes are DEPLOYED and npm is PUBLISHED (`:36-40`). | UNVERIFIABLE externally under no-network/no-browser constraint | deploy files exist under `docs/`, package files under `mcp/`, but live state was not queried |
| Historical test counts (`:62-71`). | UNVERIFIABLE in this audit | builds/tests expressly prohibited; statements are historical document claims |
| `tools/slice16-harness/runs/` is untracked and checksums are the only durable record (`:78`). | FALSE | every current run file and `runs/README.md` is tracked; commit `c037448` changed 14 paths; founding `src/v2/SLICE_16_FOUNDING.md:1603-1605` records the later archival correction |
| `tools/slice16-harness/CLOSE_REPORT.md` exists (`:58,78`). | CONFIRMED | tracked, header at `CLOSE_REPORT.md:1-5` |
| `FULL_RUN_REPORT.md` and the listed controls are local (`:118-120`). | MIXED: report CONFIRMED untracked; `.dispatch-scope`/hooks CONFIRMED modified; runs claim FALSE; “three docs CRLF files” not present in status | initial status baseline |
| Repo audit was removed from never-staged list and committed (`:120`). | CONFIRMED | tracked `tools/audit/REPO_AUDIT_2026-07-31.md`; HEAD `c6c0c52` changes it and STATUS |
| `_rescued-agent-defs/` is absent and live `.claude/agents/` definitions remain (`:122`). | FALSE | tracked `_rescued-agent-defs/README.md` exists; `.claude/agents/README.md:1-17` is a tombstone after relocation, and commit `8c19827` changed seven paths |

The most consequential STATUS error is not a nuance: its Git/push state and evidence-tracking queue describe a pre-archive/pre-push moment even though HEAD is now level with origin and the ledgers are tracked.

### `HANDOFF.md`

This file declares its own 2026-07-10 snapshot (`HANDOFF.md:3-8`) and is predictably stale as current-state guidance.

| Claim | Verdict now | Primary evidence |
|---|---|---|
| Canonical repo is Windows `C:\Users\hudso\...`, HEAD `b52d823`, origin `84fefe8`, G2 local (`:3-7`). | FALSE as current state (historically UNVERIFIABLE) | current `pwd`, HEAD `c6c0c52`, rev-list `0 0` |
| Slice 15 founding/eval artifacts exist, summary is 10/10 and report is 10/10 (`:14-24`). | CONFIRMED | tracked files; `mcp/eval/slice15-eval-summary.md:4`; report `:5-7`; pairs `:310,318` |
| The transient P10 negative-control run was not committed (`:26`). | UNVERIFIABLE as a universal absence claim from filename inventory alone | no named artifact/path is supplied; the same caveat is recorded at `src/v2/SLICE_15_FOUNDING.md:194` |
| External read-only audit at `C:\Users\...\aster-audit-reports\...` exists (`:18`). | UNVERIFIABLE | outside canonical repo and Windows-only path; no network/external investigation authorized |
| Package name/version/bin/node floor/files facts (`:41-47`). | CONFIRMED locally | `mcp/package.json:2-3,7-15,30` |
| Slice 16 founding exists but Appendix A is not in repo (`:67-73`). | MIXED: founding CONFIRMED; appendix absence FALSE | tracked `src/v2/SLICE_16_APPENDIX_A_LOCKED.md` and tracked draft `src/v2/founding-drafts/SLICE_16_APPENDIX_A_scenarios.md` |
| `DOSSIER_FOUNDING.md` is absent (`:77-80`). | FALSE | tracked `src/v2/founding-drafts/DOSSIER_FOUNDING.md` |
| Five Fable draft files were all missing and no planning commit was made (`:83-92`). | FALSE about current existence; CONFIRMED that the proposed `docs/planning/2026-07-07-fable-session/` directory is absent | all five exact basenames now exist tracked under `src/v2/founding-drafts/`; filesystem check says proposed planning directory absent |

### `strategy/ASTER_FAMILY_MASTER_PLAN.md`

| Claim | Verdict | Primary evidence |
|---|---|---|
| Repo home is `strategy/`, never `docs/` (`:5`). | CONFIRMED | both master plan and charters are tracked under `strategy/`; directory exists |
| EvidenceEnvelope contract, catalog/data spine, and MCP interface exist (`:19-22`). | CONFIRMED as repo artifacts | `src/v2/SLICE_15_FOUNDING.md:114`; `src/v2/boundary/slice9-nea-catalog.ts:20` cited at `SLICE_16_FOUNDING.md:326`; tracked `mcp/package.json` |
| 41,906-body catalog exists (`:20`). | CONFIRMED as committed contract/fixture claim | `mcp/eval/slice15-eval-pairs.json:310,318`; `src/v2/SLICE_16_APPENDIX_A_LOCKED.md:49-50` |
| Every non-shipped lens has an entry gate and kill criteria in `ASTER_FAMILY_CHARTERS.md` (`:28`). | FALSE | charters registry exists, but `strategy/ASTER_FAMILY_CHARTERS.md:22-44` contains only Ledger, Survey, Traffic, and Bench placeholders; each says `CHARTER PENDING`, and several master-plan lenses have no entry there |
| Transit is shipped; Prospect is shipped-in-core; Dossier/Ledger are chartered (`:32-44`). | MIXED | Transit/Prospect implementation/founding artifacts exist; Dossier founding draft now exists; Ledger charter is only pending (`ASTER_FAMILY_CHARTERS.md:22-26`); actual live deployment UNVERIFIABLE |
| Wave 0 comprises Slices 14–16 (`:71-77`) and those slices exist. | CONFIRMED as repository-history/artifact claim | founding docs for 14–16 and Slice 16 close/archive reports are tracked; completion/deployment outside Git is UNVERIFIABLE |
| Promotion process uses charters and own founding docs (`:81-87`). | CONFIRMED as a documented process, not as universally followed behavior | `ASTER_FAMILY_CHARTERS.md:8-20`; founding drafts for Dossier and Slice 17 exist |
| Incumbents, buyer-today assertions, and portfolio probabilities (`:48-63,79`). | UNVERIFIABLE in this repository-only/no-network inventory | the document labels several as leads/speculative but supplies no inventory artifact that independently proves them |

### Bottom-line inventory finding

The repository contains substantial tracked research through Slice 16, a parallel tracked `src/v2/research/` provenance tree through Slice 20, strategy documents, Slice 16 ledgers, and draft founding material for Dossier/Slice 17. It does **not** contain the distinctive 2026-08 corpus described by the decisive term set. The largest reader-facing falsehood is current `STATUS.md`: it says the repo is still ahead of an old origin with run evidence untracked and `_rescued-agent-defs/` absent, while primary Git/filesystem evidence shows `c6c0c52` level with origin, tracked run evidence, and a tracked rescued-agent directory.

## End-state integrity

Final `git status --porcelain` exactly reproduced the nine baseline records in §1.1. A read-only `diff` against the recorded baseline returned exit `0`; the final status byte stream SHA-256 is `abf2e4272e1732e6d02ab0b2bb4d26c8de05ed208f7577d3dd99e0bf4a3a394b`. No repository file was modified, staged, committed, built, moved, or deleted; only this `/tmp` report was written via `apply_patch`.
