# STATUS.md — Aster Project Current State

> Updated at the end of each session. Keep it short; agents read this before acting.
> **Rewritten 2026-08-02 (`S16-CLOSE-2026-08-02-A`).** If HEAD does not match the table below,
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
| origin/main | `642dfc9` | last pushed |
| Local chain | `642dfc9`..HEAD | **UNPUSHED** — marker `S16-CLOSE-2026-08-02-A` |

**Push state:** everything after `642dfc9` is local until Hudson pushes. No agent pushes, ever.
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

## Slice 16 — closed, with data

**Publicly pre-registered before collection:** DOI `10.5281/zenodo.21752617`, sealed commit `670b039`, published 2026-08-01T23:44Z (founding §27).

**Result** (founding §30; 468 runs, **zero provider errors**): FULL faithfulness `claude-sonnet-4-6` **23.8%** [6.1, 45.6], `claude-haiku-4-5` **32.5%** [11.9, 52.9]. Per-dimension: VF 23.1% · RFR 32.5% · PTA 55.5% · AUP 75.9%. Control arm (no tools): numeric-claim rate 73.1% / 41.0%, and **0/6** checkable values correct.

**How to quote it — three hard limits.** (1) **Single-lab.** Two Anthropic models is not a claim about labs at any confidence. (2) The one evaluable contrast is **unresolved** (8.7 pp against a registered 10 pp threshold, overlapping intervals) — tiers, never a ranking. (3) **RQ3 is under-covered** (43 graded runs); do not compare it with the other RQs.

**The 114 successful rows from halted attempt 1 are NOT study data** and are excluded from every figure.

**Scope executed vs registered:** 28→25 scenarios, 6→**2** models, r=10→**6**, 2,184→**468** runs. Two model losses were external and measured, not assumed, and cost $0 (gpt-5.5 credit-exhausted, Gemini quota-exhausted). Founding §29, §31.3.

**R-CLOSE-1 (2026-08-02):** S-20/S-21/S-24 struck post-data as structurally ungradeable — the primary set is **25** for any future run. The sealed registration's counts are pinned separately in `config.mjs` as `SEALED_AT` so the amendment cannot obscure what the DOI archived. Founding §31.6, appendix §L.15.

**Spend:** $13.82 (pilots + attempt 1) + $14.73 (final session, of a $19 budget) = **$28.55 total**.

**Close-out:** founding **§31**. Open-item triage: `tools/slice16-harness/CLOSE_REPORT.md`.

---

## Test State (measured 2026-08-02, Node v20.19.6)

| Suite | Command | Result |
|---|---|---|
| Slice 16 harness | `node --test tools/slice16-harness/test/*.test.mjs` | **191 / 191 pass** |
| Root recursive | `node tools/run-tests.mjs` | 71 files, **70 pass / 1 fail** |
| Default | `npm test` (`tests/*.test.mjs` only) | 173 pass / 1 skip — reaches a subset |

The single failure is the documented **Node-version false-red** in `tests/v2-golden/launch-vehicles.golden.test.mjs` (needs Node ≥22.18; CI pins Node 24). Not a math regression (audit L4-2).
**CI gap, still open (L4-1):** CI runs neither the MCP package tests nor the Slice 16 suite, and the default `npm test` is not truthful about coverage.

---

## Next Session

1. **Hudson: review + `git hpush`** the local chain from `642dfc9`.
2. **Work HUDSON'S QUEUE** in `tools/slice16-harness/CLOSE_REPORT.md` — including the ledger-evidence decision (INV-034: `tools/slice16-harness/runs/` is untracked; the checksums in founding §25.3 and §30.9 are currently the only durable record).
3. **Slice 17 opens on §31.** Its first design input is R-CLOSE-1: an instrument that cannot grade the behaviour its own scenarios were written to elicit.
4. CI hardening (L4-1/L4-3): MCP + Slice 16 suites into Actions; truthful default `npm test`.

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

---

## Uncommitted / Local Notes

Known-dirty, user-owned, **never staged**: `.dispatch-scope` (modified per active dispatch), two `.githooks` mode changes, three `docs/` CRLF files, `Untitled.canvas`, `tools/slice16-harness/FULL_RUN_REPORT.md`, and `tools/slice16-harness/runs/` — the run ledgers, which are **evidence** (checksums pinned in founding §25.3 and §30.9). **P0-D6 amendment (2026-08-03):** `tools/audit/REPO_AUDIT_2026-07-31.md` was removed from this never-staged list and committed because README.md, STATUS.md, RUNBOOK.md, and the Slice 16 remediation report cite it.

`_rescued-agent-defs/` is claimed by AGENTS.md but ABSENT (audit L1-1); the live `.claude/agents/` definitions are the stale-routing hazard. Local `.claude/skills/*.md` edits are not project state.
