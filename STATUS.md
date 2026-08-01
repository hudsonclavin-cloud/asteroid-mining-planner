# STATUS.md - Aster Project Current State

> Updated at the end of each session. Keep entries short; agents read this before acting.
> Rewritten 2026-08-01 (S16-REMEDIATE, audit L3-1): the previous STATUS was 38 commits and a
> full study phase stale, which forced a session-start stop-gate waiver. If you are reading
> this and HEAD does not match, update this file before believing it.

---

## Identity

**Canonical repo:** `/Users/hudsonclavin/asteroid-mining-planner` (macOS; the old Windows path in earlier STATUS versions is historical)
**Live site:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/
**About route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/
**Porkchop route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/
**MCP package:** `aster-mission-mcp@0.1.0` - PUBLISHED on npm, publisher `hudsoclavin`, handshake-verified 2026-07-10. Note: 0.1.0 was baked from a dirty worktree (audit L6-3); a `prepublishOnly` clean-worktree gate now blocks a repeat for the next release.

---

## Git State (as of the 2026-08-01 remediation session)

| Item | Commit | State |
|------|--------|-------|
| origin/main | `d0479f7` | Amendment A9 — the last commit Hudson pushed |
| A10 (r restored to 10) | `b374243` | LOCAL, unpushed |
| Full-run incident record | `63e18ab` | LOCAL, unpushed |
| Remediation chain | `b3b9708`..HEAD | LOCAL, unpushed — one commit per audit finding, marker `S16-REMEDIATE-2026-08-01-A` |

**Push state:** everything after `d0479f7` is local until Hudson reviews and pushes.
**Active founding doc:** `src/v2/SLICE_16_FOUNDING.md` — LOCKED + amendments A1–A10 + incident §21 + remediation sections; additive-only, hook-enforced.
**Invariant ceiling:** global `INV-034` + `INV-V1-001`; Slice 16's four local invariants are namespaced `INV-S16-033..036` (INVARIANTS.md amendment 2026-08-01).

---

## Slice Status

| Track | Slice | State |
|-------|-------|-------|
| Mission planning | Slice 9 (catalog) | COMPLETE |
| Mission planning | Slice 10 (Lambert, C3 screen) | COMPLETE |
| Mission planning | Slice 11 (porkchop + dV) | COMPLETE + DEPLOYED |
| Mission planning | Slice 12 (DLA overlay) | COMPLETE + DEPLOYED |
| Mission planning | Slice 13 (mission cost card) | COMPLETE + DEPLOYED (showcase figures labelled unreproducible-pending-regeneration, L3-6) |
| Packaging / demo | Slice 14 (About + validation card + FK3 tour + CI) | CLOSED + DEPLOYED |
| MCP / agent surface | Slice 15 | PUBLISHED + VERIFIED (`aster-mission-mcp@0.1.0`, 2026-07-10) |
| Agent-honesty study | Slice 16 | **DESIGN LOCKED, NO DATA.** See below — this line is the one that was dangerously stale. |

## Slice 16 — honest current state (2026-08-01)

- **Locked** 2026-07-27 with appendix `SLICE_16_APPENDIX_A_LOCKED.md`; amendments A1–A10 all additive; harness under `tools/slice16-harness/`.
- **Full-run attempt 1 (2026-08-01) HALTED** at 275/810 rows on OpenAI credit exhaustion; $13.82 spent; control arm never started (founding §21). **The 114 successful rows are NOT study data** — plan-order-biased subset, and the audit found instrument defects that predate them.
- **Post-incident audit** (`tools/audit/REPO_AUDIT_2026-07-31.md`, marker ASTER-REPO-AUDIT-2026-07-31-A): grader false passes/failures (outer-prose fabrication ignored, S-02 radius/diameter inversion, RFR/PTA/AUP false-pass paths), six scenarios not instantiated as registered, control arm ungradeable, A10 committed locally but never publicly sealed, ledgers untracked.
- **Remediation session 2026-08-01** (marker `S16-REMEDIATE-2026-08-01-A`): runtime guards implemented (strict CLI, registered same-cause halt, executable $200 spend guard, coherent ledger/retry policy), public-claim corrections landed, instrument/stimulus fixes and design-decision STOPs recorded in `tools/slice16-harness/REMEDIATION_REPORT.md`.
- **There is no faithfulness result.** No grades exist; grade.mjs correctly refuses the halted ledger. Never present anything from attempt 1 as an outcome.
- **Before any future paid run:** every item in `tools/slice16-harness/PRE_RUN_GATE.md` must pass, including a fresh public seal of the corrected instrument (the pre-incident A10 seal never existed publicly — local commit only, 74 s before data).

---

## Test State

- Slice 16 harness suite: **103/103 pass** (measured this session; includes new runtime-guard and adversarial-fixture tests).
- Root recursive suite (`node tools/run-tests.mjs`): audit-measured 71 files / 70 pass / 1 fail on Node v20 — the single failure is the documented Node-version false-red in `tests/v2-golden/launch-vehicles.golden.test.mjs` (needs Node ≥22.18; CI pins Node 24). Not a math regression (audit L4-2).
- Known CI gaps (audit L4-1): CI does not run the MCP package tests or the Slice 16 suite; default `npm test` reaches 55/71 app files. Unremediated as of this session — candidates for a follow-up dispatch.

---

## Next Session

1. **Hudson: work the DESIGN DECISIONS QUEUE** in `tools/slice16-harness/REMEDIATION_REPORT.md` — several instrument questions are STOPPED awaiting research-design rulings (S-13, S-30 bins, multi-turn scenarios, control-arm grading, merged-refusal semantics).
2. **Hudson: review + push** the local chain (`b374243`..HEAD).
3. **Public seal** (OSF/Zenodo) of the corrected instrument BEFORE any collection — DEC-16-10 is still PENDING and the A10 lesson is recorded in founding §23.
4. **PRE_RUN_GATE.md** must pass end-to-end before any `S16_LIVE_OK=1` command.
5. CI hardening dispatch (L4-1/L4-3): MCP + Slice 16 suites into Actions; truthful default `npm test`.

---

## Cleanup Queue

| ID | Item |
|----|------|
| C1 | CRLF / `.gitattributes` normalization pass. |
| C2 | Windows npm test shim cleanup: use `process.execPath` + TypeScript bin, not `.bin` shims. |
| C3 | G0 LOW L-1: `insufficient_data` refusal code is defined but unused; okay for v1, do not imply it is emitted. |
| C4 | G0 LOW L-2: `explain_cell` refusal envelopes carry `assumptions: []`; optional polish. |
| C5 | G0 LOW L-3: `as_of` absent on `get_validation_report`; optional polish. |
| C6 | G0 LOW L-4: always `cd mcp` for `npm pack`; `npm --prefix mcp pack` is misleading on Windows. |
| C7 | F2 negative-control transcript was performed in-session but no committed artifact was found; do not cite it as repo evidence unless a future artifact records it. |
| C8 | Re-land New Glenn C3=5 anchor only with elvperf screenshot + oracle row + DEC-13-1 amendment. |
| C9 | Slice 9 replacement propagation-accuracy guard from committed Horizons truth only. |
| C10 | (audit L6-3 second half) Propagate baked `dirty` into MCP SourceRefs — protected-path dispatch, next package release. |
| C11 | (audit L1-1) `.claude/agents` legacy routing — see remediation report Phase 6 disposition. |
| C12 | (audit L5-2/top-10 #1) Signed recovery dispatch for the halted ledger: checksum-pinned retry manifest; originals immutable. |

---

## Parked Visual Issues

| ID | Issue |
|----|-------|
| V1 | Straight green line artifact on Bennu / asteroid 100926. |
| V2 | NEA cloud vanishes at high zoom-in. |
| V3 | Starfield density / brightness tuning. |
| V4 | Focus-transition camera.far clipping during tween. |
| V5 | Wheel-during-tween preventDefault leak. |
| V6 | Same-row refocus zoom behavior. |
| V7 | Point pop at LOD transition. |
| V8 | Picking near/far desync from render camera. |

---

## Uncommitted / Local Notes

- `.dispatch-scope` may be modified for the active dispatch and intentionally left unstaged.
- Known-dirty, user-owned, never staged: two `.githooks` mode changes, three `docs/` CRLF files, `Untitled.canvas`, `tools/slice16-harness/runs/` (evidence — see checksum manifest in founding §23), `tools/slice16-harness/FULL_RUN_REPORT.md`, `tools/audit/`.
- `_rescued-agent-defs/` was claimed by AGENTS.md but is ABSENT (audit L1-1); the live `.claude/agents/` definitions are the stale-routing hazard.
- Local `.claude/skills/*.md` edits may appear in Hudson's working tree; they are not project state.
