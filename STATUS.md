# STATUS.md — Aster Project Current State

> Updated at the end of each session. Keep it short; agents read this before acting.
> **Rewritten 2026-08-02 (`S16-CLOSE-2026-08-02-A`); current state corrected 2026-08-04 (`S-STATUS-TRUTHFIX-2026-08-04-A`); truth-refreshed 2026-08-07 (`S-HYGIENE-2026-08-07-A`); truth-refreshed 2026-08-10 after Front A close.** If HEAD does not match the table below,
> update this file before believing it. A stale STATUS forced a session-start stop-gate once
> already (audit L3-1) — that is why this section exists.

---

## Identity

**Canonical repo:** `/Users/hudsonclavin/asteroid-mining-planner` (macOS)
**Live site:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/ · [about](https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/) · [porkchop](https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/)
**MCP package:** `aster-mission-mcp@0.1.0` — published on npm, publisher `hudsoclavin`, handshake-verified 2026-07-10. 0.1.0 was baked from a dirty worktree (audit L6-3); a `prepublishOnly` clean-worktree gate now blocks a repeat.

---

## Git State

| Item | Commit | State |
|---|---|---|
| origin/main | `ed80996` | current main, per 2026-08-10 truth refresh |
| Local HEAD | `ed80996` | Front A closed; deploy rebuild and AGENTS.md §9.1 hygiene rule landed |

**Structural one-commit lag (expected, not rot):** This file is edited after `ed80996`; any later STATUS commit will necessarily pin the previous commit, accepted (a STATUS file cannot pin its own commit).
**Push state:** Main is recorded at `ed80996`. No agent pushes, ever.
**Deploy boundary:** `docs/` was rebuilt at `5222810` on 2026-08-10, carrying A4 copy fixes (`77cbc10`) and the test-fixture repair (`88b9133`). Live bundles: `compareV2-C-fL9GZc.js`, `solarSystemV2-DnPXdNDE.js`.
**Additive-only, hook-enforced:** `src/v2/SLICE_16_FOUNDING.md`, `src/v2/SLICE_16_APPENDIX_A_LOCKED.md`. This file is the documented exception and may be rewritten.
**Invariants:** global `INV-034` + `INV-V1-001`; Slice 16's four local invariants are namespaced `INV-S16-033..036`. Global `INV-037` (frozen-expectation amendment rule) added 2026-08-01.

---

## Slice Status

| Track | Slice | State |
|---|---|---|
| Mission planning | 9 (catalog) · 10 (Lambert, C3) | COMPLETE |
| Mission planning | 11 (porkchop + ΔV) · 12 (DLA overlay) | COMPLETE + DEPLOYED |
| Mission planning | 13 (mission cost card) | COMPLETE + DEPLOYED (showcase figures labelled unreproducible-pending-regeneration, L3-6) |
| Packaging / demo | 14 (About, validation card, FK3 tour, CI) | CLOSED + DEPLOYED |
| MCP / agent surface | 15 | PUBLISHED + VERIFIED (`aster-mission-mcp@0.1.0`) |
| Agent-honesty study | **16** | **CLOSED 2026-08-02 — HAS A RESULT** |
| Mission planning | **17** (Target Compare + viewer QOL) | **FOUNDING LOCKED rev B 2026-08-04** (`SLICE_17_FOUNDING.md`, repo root; §8 amendments A1 + A2, with A2 the DEC-17-8 breadth erratum at `d204cea`) — Front A: **CLOSED** (shipped, source-reconciled, test-true, CI-green). Front B: QOL backlog remains open in `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`; B0 partially landed in seven commits (`fbdd8da`, `c0b578f`, `1b42e78`, `63ca402`, `4d483e5`, `a3a1981`, `8d6bdf8`). |

## Slice 16 — closed, with data

**Publicly pre-registered before collection:** DOI `10.5281/zenodo.21752617`, sealed commit `670b039`, published 2026-08-01T23:44Z (founding §27).

**Result** (founding §30; 468 runs, **zero provider errors**): FULL faithfulness `claude-sonnet-4-6` **23.8%** [6.1, 45.6], `claude-haiku-4-5` **32.5%** [11.9, 52.9]. Per-dimension: VF 23.1% · RFR 32.5% · PTA 55.5% · AUP 75.9%. Control arm (no tools): numeric-claim rate 73.1% / 41.0%, and **0/6** checkable values correct.

**How to quote it — three hard limits.** (1) **Single-lab.** Two Anthropic models is not a claim about labs at any confidence. (2) The one evaluable contrast is **unresolved** (8.7 pp against a registered 10 pp threshold, overlapping intervals) — tiers, never a ranking. (3) **RQ3 is under-covered** (43 graded runs); do not compare it with the other RQs.

**The 114 successful rows from halted attempt 1 are NOT study data** and are excluded from every figure.

**Scope executed vs registered:** 28→25 scenarios, 6→**2** models, r=10→**6**, 2,184→**468** runs. Two model losses were external and measured, not assumed, and cost $0 (gpt-5.5 credit-exhausted, Gemini quota-exhausted). Founding §29, §31.3.

**R-CLOSE-1 (2026-08-02):** S-20/S-21/S-24 struck post-data as structurally ungradeable — the primary set is **25** for any future run. The sealed registration's counts are pinned separately in `tools/slice16-harness/config.mjs` (line 728) as `SEALED_AT` so the amendment cannot obscure what the DOI archived. Founding §31.6, appendix §L.15.

**Spend:** $13.82 (pilots + attempt 1) + $14.73 (final session, of a $19 budget) = **$28.55 total**.

**Close-out:** founding **§31**. Open-item triage: `tools/slice16-harness/CLOSE_REPORT.md`.

---

## Test State (measured 2026-08-10)

| Suite | Command | Result |
|---|---|---|
| CI | GitHub Actions run #73 | **green** at `5222810` |
| Root recursive | `node tools/run-tests.mjs` | 74 files discovered; **73 pass / 1 environmental load failure**; 246 tests pass / 1 fail |
| Focused compare data | `node --test tests/v2-compare-data.test.mjs` | **17 / 17 pass** after fixture repair at `88b9133` |
| Slice 16 harness | `node --test tools/slice16-harness/test/*.test.mjs` | **191 / 191 pass** when last measured |

**Test-file inventory (audited 2026-08-07):** 70 files under `tests/`, 3 colocated under `src/v2/`, and 3 MCP tests. This is an inventory, not a test result.

**CI history:** Runs #70-72 were red, root-caused to two **false test-fixture premises** in `tests/v2-compare-data.test.mjs`, not source defects. The earlier diagnosis (fabricated delivered-mass, back-derived `liveMin`) was **retracted** after adjudication against `compare-data.ts:303-308` and `compare-data.ts:330-335`, which were already correct. Fixtures repaired at `88b9133`.

**Known environmental exception (AGENTS.md §9.1 rule 1):** `tests/v2-golden/launch-vehicles.golden.test.mjs` fails to load on local Node 20 with `ERR_UNKNOWN_FILE_EXTENSION` on a `.ts` import; it passes in CI on Node 24. Retire this exception when the Node-version unify (Node 20 -> 24 locally) lands.
**CI gap, still open (L4-1):** CI runs neither the MCP package tests nor the Slice 16 suite, and the default `npm test` is not truthful about coverage.

**Front A commit ledger (Slice 17):**

| Commit | Change |
|---|---|
| `873e7ef` | A3 compare data layer |
| `b551bda` | A4 `/v2/compare/` page |
| `0516848` | deploy rebuild (source/artifact order inversion — noted, resolved by `dcdb494`) |
| `dcdb494` | flicker fix (focused-asteroid anchor epoch consistency) |
| `77cbc10` | A4 copy fixes (solver-time footnote, window-count labels) |
| `88b9133` | test-fixture repair, fabrication diagnosis retracted |
| `5222810` | deploy rebuild carrying `77cbc10` + `88b9133` |
| `ed80996` | AGENTS.md §9.1 — N/N-or-not-green, red-CI-blocks-push, build-only-from-clean-tree |

---

## Next Session

1. **2026-08 corpus recovery: CLOSED (verified 2026-08-04).** All seven Perplexity re-fetches are tracked: `tools/slice21-research/literature/{P1_EPHEMERIS,P2_EARTH_ORIENTATION,P3_PROPAGATION,P4_SATELLITES,P5_CATALOG_FRESHNESS,QOL_UX}_RESULT.md` + `strategy/research/EXPLAINER_RESULT.md`. The four V6/V7 verification artifacts also landed: prompts at `aebca4a`, results at `efd6409`. The previously-cited `DISPATCH_RESEARCH_INGEST_revA` exists nowhere in the repo (it lives only in the local intake dir `~/aster-intake-2026-08/`); the re-run instruction is removed because the recovery it drove is complete.
2. **Open next:** Front B QOL backlog in `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`.
3. **Node local-version unify:** align local Node 20 -> 24 to retire the `tests/v2-golden/launch-vehicles.golden.test.mjs` environmental exception.
4. **Work HUDSON'S QUEUE** in `tools/slice16-harness/CLOSE_REPORT.md`; all 14 paths under `tools/slice16-harness/runs/` are tracked evidence.
5. CI hardening (L4-1/L4-3): MCP + Slice 16 suites into Actions; truthful default `npm test`.

**2026-08-04 · sweep record:** `S-REPO-SWEEP-2026-08-04-A` (independent read-only multi-lens sweep, 9 HIGH findings) ran. This refresh addresses only the STATUS falsehoods and the S17 evidence-header provenance (R-01/R-02). Remaining findings OPEN and deliberately not addressed here: UI copy R-04/R-13 · build reproducibility R-03/R-05/R-16 · label drift R-17.

---

## Cleanup Queue

| ID | Item |
|---|---|
| C1 | CRLF / `.gitattributes` normalization pass. |
| C2 | Windows npm test shim cleanup: `process.execPath` + TypeScript bin, not `.bin` shims. |
| C3 | G0 LOW L-1: `insufficient_data` refusal code defined but unused; do not imply it is emitted. |
| C4 | G0 LOW L-2: `explain_cell` refusal envelopes carry `assumptions: []`; optional polish. |
| C5 | G0 LOW L-3: `as_of` absent on `get_validation_report`; optional polish. |
| C6 | G0 LOW L-4: always `cd mcp` for `npm pack`; `npm --prefix mcp pack` misleads on Windows. |
| C7 | F2 negative-control transcript was performed in-session with no committed artifact; do not cite it as repo evidence. |
| C8 | Re-land New Glenn C3=5 anchor only with elvperf screenshot + oracle row + DEC-13-1 amendment. |
| C9 | Slice 9 replacement propagation-accuracy guard from committed Horizons truth only. |
| C10 | Propagate baked `dirty` into MCP SourceRefs — protected-path dispatch, next package release (= DD-7, founding §26.7). |
| C11 | `.claude/agents` legacy routing (audit L1-1) — see remediation report Phase 6 disposition. |
| C12 | Signed recovery dispatch for the halted attempt-1 ledger: checksum-pinned retry manifest; originals immutable. |

---

## Parked Visual Issues

| ID | Issue |
|---|---|
| V1 | Straight green line artifact on Bennu / asteroid 100926. |
| V2 | NEA cloud vanishes at high zoom-in. |
| V3 | Starfield density / brightness tuning. |
| V4 | Focus-transition `camera.far` clipping during tween. |
| V5 | Wheel-during-tween `preventDefault` leak. |
| V6 | Same-row refocus zoom behavior. |
| V7 | Point pop at LOD transition. |
| V8 | Picking near/far desync from render camera. |
| V9 | CLOSED at `dcdb494`: focused-asteroid anchor epoch consistency fixed the live-time flicker. |

---

## Uncommitted / Local Notes

Known-dirty, user-owned, **never staged**: `.dispatch-scope` (modified per active dispatch), two `.githooks` mode changes (100644→100755, content-identical), `Untitled.canvas`, `tools/slice16-harness/FULL_RUN_REPORT.md`, and untracked `tools/slice{2,3,4,6}-research/data/2026-07-18_2026-10-16/`. The "three `docs/` CRLF files" previously listed here are gone — `git status --porcelain -- docs/` is clean (verified 2026-08-04); claim removed. **P0-D6 amendment (2026-08-03):** `tools/audit/REPO_AUDIT_2026-07-31.md` was removed from this never-staged list and committed because README.md, STATUS.md, RUNBOOK.md, and the Slice 16 remediation report cite it.

`_rescued-agent-defs/` is TRACKED — 6 files (`git ls-files` verified 2026-08-04: README + 5 V1-era domain agent defs); audit L1-1's "absent" claim is superseded. AGENTS.md §1 still labels the directory "local-only, untracked" — that description is now stale, but AGENTS.md is protected and out of this refresh's scope. `.claude/agents/` now contains only a README.md. Local `.claude/skills/*.md` edits are not project state.
