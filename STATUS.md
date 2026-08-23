# STATUS.md — Aster Project Current State

> Updated at the end of each session. Keep it short; agents read this before acting.
> **Rewritten 2026-08-02 (`S16-CLOSE-2026-08-02-A`); current state corrected 2026-08-04 (`S-STATUS-TRUTHFIX-2026-08-04-A`); truth-refreshed 2026-08-07 (`S-HYGIENE-2026-08-07-A`); truth-refreshed 2026-08-10 after Front A close; truth-refreshed 2026-08-12 after the Front B batch run (`S-S17-FRONTB-BATCH-2026-08-11-A`); truth-refreshed 2026-08-13 after Batch 2 ship (`S-S17-BATCH2-2026-08-12-A`).** If HEAD does not match the table below,
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
| origin/main | `5a00907` | current main, per 2026-08-13 truth refresh |
| Local HEAD | `5a00907` | Batch 2 shipped; deploy surface rebuilt |

**Structural one-commit lag (expected, not rot):** This file is edited after `5a00907`; any later STATUS commit will necessarily pin the previous commit, accepted (a STATUS file cannot pin its own commit).
**Push state:** Main is recorded at `5a00907`. No agent pushes, ever.
**Deploy boundary:** `docs/` was rebuilt at `5a00907` on 2026-08-13, carrying Batch 2 (A4c size-range + orbit-quality columns, B2 scale/frame chips + axis triad + HUD, B1 pan/reset/discoverability). Live bundles: `solarSystemV2-C60RP1nx.js`, `compareV2-BPtoAvbN.js`, `porkchopV2-C8hMf2EQ.js`, `store-BAStm0cU.js`.
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
| Mission planning | **17** (Target Compare + viewer QOL) | **FOUNDING LOCKED rev B 2026-08-04** (`SLICE_17_FOUNDING.md`, repo root; §8 amendments A1 + A2, with A2 the DEC-17-8 breadth erratum at `d204cea`) — Front A: **CLOSED**, A4b residuals closed. Front B: **Batch 2 SHIPPED** (B0 closed, B1/B2 shipped, A4c partial shipped); B3-B5 remain cuttable per §5. Remaining close-out is docs-layer/laptop-compatible. Backlog: `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`. See the Slice 17 section below. |

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

## Slice 17 — Front A closed, Front B Batch 2 shipped

**Front A residuals CLOSED (A4b).** DEC-17-3 dominance badge at `525cd48` — three-state Pareto (dominated / nondominated / insufficient-data) over the DEC's three metrics, **no composite score**; rows lacking any metric take insufficient-data, never a losing badge. DEC-17-8 threshold toggle at `82996ee` — relative Δ=5 | absolute 25, **both labeled with their values**, the absolute read from `metadata.feasibleC3MaxKm2S2` at runtime rather than a literal.

**Front B B0 CLOSED.** Orbit contrast, responsive panel widths + footer wrap, porkchop-modal hotkey gating, cost-card C3 units (`7593616`, `7a3622d`, `4daa199`).

**NEA point legibility — FIXED STRUCTURALLY (`358d379`).** Root cause was never brightness: the point shader was missing the pixel-ratio term the starfield shader has, a **2× linear / 4× area** disadvantage on a DPR-2 display. Minimum point size raised; maximum capped — the driver's `ALIASED_POINT_SIZE_RANGE` had been overriding the 64 px constant and permitting ~255 px halos. Screening colors resaturated so green separates from white/grey by hue. **All brightness/opacity values reverted to their originals** — two earlier retunes moved the wrong variable. Verified by the cold-reader gate: legibility survives the 100 %-starfield stress test, so the 65 % starfield default (`dc19cbd`) is **optional, not load-bearing**.

**C2 frame verdict LANDED** (`tools/frontb-2026-08-11/`, `c90b4f6`): *"Heliocentric J2000 equatorial (ICRF) axes; scene +Z = ICRF/celestial north."* **B2 entry gate SATISFIED.** Chip caveat, binding on copy: the top-down preset views down the **ecliptic** pole while scene axes remain **equatorial** — copy must not conflate the two.

**Batch 2 SHIPPED (`S-S17-BATCH2-2026-08-12-A`).** A4c size-range + orbit-quality columns landed at `60a6fb6`: albedo `0.14` verified in the generator, and display calls the same core function as the catalog so it cannot drift. B2 scale/frame chips + axis triad + HUD landed at `325c115`: both true-scale claims were verified before being chipped, and the frame label follows the C2 wording verbatim with the ecliptic-vs-equatorial caveat. B1 pan landed at `1e99aca` as camera-target offset with PAN-SAFE verified — the `dcdb494` anchor path remains untouched — and the Home-key naming collision is resolved as **"⌂ Reset view"**. B1 discoverability landed at `3a7c686` with the `?` overlay and tooltip badges. Run report + OQ-17-5 evidence are in `tools/batch2-2026-08-12/` (`953c096`).

**OQ-17-8 ANSWERED — CANNOT-REACH.** Source is JPL SBDB, not MPCORB, so no E/D/F letters are possible; the committed catalog carries 41,906 values, all numerals 0-9 plus 10 nulls.

**OPEN ITEMS from Batch 2.** OQ-17-5 ruling is pending; agent recommendation is (b) accept the shortfall, with the chip stating the code-enforced floor. A4c still has residual DEC-17-4 columns unbuilt: orbit class, a/e/i, `dataArcDays`, `nObsUsed`, and sigmas — fields are loaded, rendering is not. Touch pan still needs per-`pointerId` tracking before touch support is honest. `MAX_CAMERA_DISTANCE_M` has a one-line headroom lever, not pre-approved.

**NEW FINDING (B1/B2 discoverability):** the orbit-class tabs (ATE / APO / AMO / IEO) do **not** filter the 3D point cloud — a screening class cannot be isolated visually.

---

## Test State (measured 2026-08-13)

| Suite | Command | Result |
|---|---|---|
| CI | GitHub Actions run #78 | **green** at `5a00907` |
| Root recursive | `node tools/run-tests.mjs` | **74/74 files pass; 256 tests pass / 0 fail** (Hudson, 2026-08-13, Windows / Node v24.18.0 — the golden-numbers loader test now loads under Node 24; the 246→256 delta is that test. Prior Node-20 record: 73/74 files, 246 pass / 1 load failure, 2026-08-12) |
| Focused compare data | `node --test tests/v2-compare-data.test.mjs` | **17 / 17 pass** after fixture repair at `88b9133` |
| Slice 16 harness | `node --test tools/slice16-harness/test/*.test.mjs` | **191 / 191 pass** when last measured |

**Test-file inventory (audited 2026-08-07):** 70 files under `tests/`, 3 colocated under `src/v2/`, and 3 MCP tests. This is an inventory, not a test result.

**CI history:** Runs #70-72 were red, root-caused to two **false test-fixture premises** in `tests/v2-compare-data.test.mjs`, not source defects. The earlier diagnosis (fabricated delivered-mass, back-derived `liveMin`) was **retracted** after adjudication against `compare-data.ts:303-308` and `compare-data.ts:330-335`, which were already correct. Fixtures repaired at `88b9133`.

**Environmental exception registry: EMPTY (retired 2026-08-13).** The former AGENTS.md §9.1 rule 1 exception — `tests/v2-golden/launch-vehicles.golden.test.mjs` failing to load on local Node 20 with `ERR_UNKNOWN_FILE_EXTENSION` on a `.ts` import — is RETIRED: the laptop runs Node v24.18.0, the file loads and passes, and the full suite is **74/74 · 256 · 0** (Hudson, 2026-08-13). The last Node-20 machine (the iMac) is retired; the Node-version unify is effectively complete for the local environment.
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
| `525cd48` | A4b dominance badge (DEC-17-3, three-state Pareto, no composite) |
| `82996ee` | A4b threshold mode toggle (DEC-17-8, both modes labeled with values) |

**Front B commit ledger (Slice 17, batch `S-S17-FRONTB-BATCH-2026-08-11-A`):**

| Commit | Change |
|---|---|
| `7593616` | B0 orbit contrast + first NEA point toning |
| `7a3622d` | B0 responsive panel widths + footer wrap |
| `4daa199` | B0 porkchop-modal hotkey gating + cost-card C3 units |
| `c90b4f6` | batch run report + C2 frame verdict (`tools/frontb-2026-08-11/`) |
| `13580b1` | NEA point retune (superseded — brightness was the wrong axis) |
| `dc19cbd` | starfield default 100 % → 65 %; focused-orbit opacity 0.6 → 0.75 |
| `358d379` | NEA legibility structural fix — pixel-ratio parity, size floor/cap, hue resaturation |
| `b9d25cf` | orbit-opacity assertions derived from source constants, not literals |
| `90790aa` | deploy rebuild carrying the batch |

**Front B Batch 2 commit ledger (Slice 17, batch `S-S17-BATCH2-2026-08-12-A`):**

| Commit | Change |
|---|---|
| `60a6fb6` | A4c size-range + orbit-quality columns; albedo `0.14` generator-verified; display shares the catalog core function |
| `325c115` | B2 scale/frame chips + axis triad + HUD; true-scale claims verified; C2 frame label carried with ecliptic/equatorial caveat |
| `1e99aca` | B1 pan as camera-target offset + "⌂ Reset view"; PAN-SAFE, `dcdb494` anchor path untouched |
| `3a7c686` | B1 discoverability: `?` overlay + tooltip shortcut badges |
| `953c096` | Batch 2 run report + OQ-17-5 evidence in `tools/batch2-2026-08-12/` |
| `5a00907` | deploy rebuild carrying Batch 2 |

---

## Next Session

1. **2026-08 corpus recovery: CLOSED (verified 2026-08-04).** All seven Perplexity re-fetches are tracked: `tools/slice21-research/literature/{P1_EPHEMERIS,P2_EARTH_ORIENTATION,P3_PROPAGATION,P4_SATELLITES,P5_CATALOG_FRESHNESS,QOL_UX}_RESULT.md` + `strategy/research/EXPLAINER_RESULT.md`. The four V6/V7 verification artifacts also landed: prompts at `aebca4a`, results at `efd6409`. The previously-cited `DISPATCH_RESEARCH_INGEST_revA` exists nowhere in the repo (it lives only in the local intake dir `~/aster-intake-2026-08/`); the re-run instruction is removed because the recovery it drove is complete.
2. **Remaining Slice 17:** **B3-B5** (cuttable per founding §5) plus the docs-layer slice-close ritual: D-07 erratum, OQ-17-9 disposition, OQ-17-4 ruling, and §8 close. Laptop-compatible; no visual gates needed.
3. **Batch 2 open items:** OQ-17-5 ruling pending; A4c residual DEC-17-4 columns (orbit class, a/e/i, `dataArcDays`, `nObsUsed`, sigmas); touch pan prerequisite (per-`pointerId` tracking); `MAX_CAMERA_DISTANCE_M` headroom lever (one line, not pre-approved). Home-key naming collision is already resolved as **"⌂ Reset view"**.
4. **Orbit-class tabs do not filter the 3D point cloud** (ATE/APO/AMO/IEO) — a screening class cannot be isolated visually.
5. **Node local-version unify:** align local Node 20 -> 24 to retire the `tests/v2-golden/launch-vehicles.golden.test.mjs` environmental exception.
6. **Work HUDSON'S QUEUE** in `tools/slice16-harness/CLOSE_REPORT.md`; all 14 paths under `tools/slice16-harness/runs/` are tracked evidence.
7. CI hardening (L4-1/L4-3): MCP + Slice 16 suites into Actions; truthful default `npm test`.

**Hardware constraint (recorded 2026-08-13):** desktop retired today; laptop-only from here.

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
| V3 | Starfield density / brightness tuning. Default lowered 100 % → 65 % at `dc19cbd`; the cold-reader gate then showed NEA legibility survives 100 %, so this default is a preference, not a fix. Density untouched. |
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
