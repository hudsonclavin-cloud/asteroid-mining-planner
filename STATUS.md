# STATUS.md — Aster Project Current State

> Updated at the end of each session. Keep entries short — agents read this before acting.
> **Target: < 1 minute to update.**

---

## §Identity

**Canonical repo:** `C:\Users\hudso\asteroid-mining-planner`
**Live site:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/
**About route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/
**Porkchop route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/

---

## §Git state

| | Commit | Description |
|-|--------|-------------|
| **HEAD (local)** | `b7532eb` | Slice 14 Phase E: rebuild docs/ (About copy + count fix into live bundle) |
| **origin/main** | `b7532eb` | Same as local HEAD |
| **Deployed bundle in `docs/`** | `b7532eb` | Slice 14 Phase E bundle: About + validation card + FK3 tour + CI-era docs output |

**Current built bundles (from committed `docs/v2/*/index.html`):**
- About: `aboutV2-DftM0n-e.js`
- Porkchop: `porkchopV2-Cxwkeql6.js`
- Solar system: `solarSystemV2-VhE9zmmW.js`
- Shared Slice 9 catalog chunk: `slice9-nea-catalog-DpR-rPTv.js`
- Validation provenance asset: `validation-provenance-lm2C_8vP.json`

---

## §Slice status

| Track | Slice | State |
|-------|-------|-------|
| Mission planning | Slice 9 (catalog) | COMPLETE |
| Mission planning | Slice 10 (Lambert, C3 screen) | COMPLETE |
| Mission planning | Slice 11 (porkchop + ΔV) | COMPLETE + DEPLOYED |
| Mission planning | Slice 11.5 (500-body M=1) | COMPLETE |
| Visualization | Slice V1 (textures + shader + atmosphere) | COMPLETE + DEPLOYED |
| Visualization | Visual fixes (top-down, starfield ctrl, labels, halo frame) | COMPLETE + DEPLOYED |
| Mission planning | Slice 12 (DLA overlay) | COMPLETE + DEPLOYED |
| Mission planning | Slice 13 (mission cost card) | COMPLETE + DEPLOYED |
| Packaging / demo | Slice 14 (About + validation card + FK3 tour + CI) | **CLOSED + DEPLOYED** (`b7532eb`, 2026-07-07) |

**Active founding doc (mission planning):** `src/v2/SLICE_14_FOUNDING.md` (CLOSED)
**Next slice:** Slice 15 candidates come from the OQ-14-6 triage table.
**Invariant ceiling:** `INV-026` (`INVARIANTS.md` index-current).

**Slice 14 shipped fronts and gates:**
- Front 1: About page `/v2/about/` (`1463023`, rebuilt into `aboutV2-DftM0n-e.js` at `b7532eb`).
- Front 2: validation card on `/v2/porkchop/` (`6cdebfd`, provenance asset `validation-provenance-lm2C_8vP.json`).
- Front 3: FK3 guided tour (`6c9d7f9`, rebuilt into `porkchopV2-Cxwkeql6.js` at `b7532eb`).
- CI: `.github/workflows/ci.yml` with A1 `tsc --noEmit` and A2 golden-numbers guard (`4837bbc`).

**Verified nuance:** `src/v2/SLICE_14_FOUNDING.md` in `b7532eb` does not contain a final §8 close-entry line yet. The closed/deployed state above is grounded in the Phase E source/docs commits and committed build output.

---

## §Next session — priority order

**1. Push/review coordination** — Hudson pushes or verifies `b7532eb` and this STATUS refresh together as appropriate.

**2. Slice 14 close-record cleanup** — if desired, add the missing `SLICE_14_FOUNDING.md` §8 close entry and OQ-14-6 disposition table in a separate docs-only dispatch.

**3. Slice 15 selection** — triage OQ-14-6 candidates into Slice 15 / later / rejected.

---

## §Queued dispatches

None queued.

This section exists because the M-A guards near-miss showed that a written dispatch can survive multiple quota shuffles unrun and only be caught later by audit; queued work should be visible at session start.

---

## §Parked issues

### Visual bugs (Claude-in-Chrome audit 2026-06-30, revised 2026-07-01)

| # | Severity | Status | Notes |
|---|----------|--------|-------|
| 1 | (was SEVERE) | **CLOSED** | Fixed by Sun-clearance clamp (`5f7994c`); root cause was custom orbit-state math, not OrbitControls as originally hypothesized |
| 2 | Medium | OPEN | Straight green line artifact on Bennu (101955) / asteroid 100926 — orbit polyline with too few segments |
| 3 | Low | **CLOSED (explained)** | NEA "cloud shift" is expected floating-origin behavior; not a bug. See §S2 diagnosis in engineering record |
| 4 | Low | OPEN | NEA cloud vanishes at high zoom-in (point sprite culling) |
| new | Aesthetic | OPEN | Starfield density / brightness tuning (slider added, defaults may need adjustment) |
| Slice 12 audit LOWs | Low | PARKED | 8 LOW findings — see `C:\Users\hudso\aster-audit-reports\slice12-phaseE-audit.md` |

### Architecture follow-up items

| # | Issue |
|---|-------|
| 5 | Focus-transition camera.far clipping during tween |
| 6 | Wheel-during-tween: preventDefault leak |
| 7 | Same-row refocus zoom (double-click same row in catalog) |
| 8 | Point pop at LOD transition |
| 9 | Picking near/far desync from render camera |
| 10 | Sun-clearance threshold applies to scroll wheel only, not all zoom paths |

### Cleanup queue

| # | Issue |
|---|-------|
| C1 | Add missing Slice 14 founding-doc §8 close entry + OQ-14-6 disposition table, if Hudson wants the founding doc to mirror the STATUS close state |
| C2 | Fix the 59-test-file Windows `.bin/tsc` shim violation noted in Slice 14 §7 |
| C3 | Re-land New Glenn C3=5 anchor only with elvperf screenshot + oracle row + DEC-13-1 amendment |

---

## §OQ register

| OQ | Slice | State |
|----|-------|-------|
| OQ-1 | Slice 10 | CLOSED — Lambert M=1 in production |
| OQ-2 | Slice 11 | CLOSED — full-catalog M=1 re-screen DEFERRED (see `50b3b68`, 11.5 engineering record) |
| OQ-3 | Slice 10 | CLOSED — MIT clean-room throughout (DEC-1 Rev 2) |
| OQ-14-6 | Slice 14 | OPEN/PENDING DISPOSITION — candidate list extracted; Slice 15 triage remains |

---

## §Stale clone cleanup (housekeeping, not urgent)

| Clone | State |
|-------|-------|
| `asteroid-mining-planner` | **CANONICAL** |
| `asteroid-mining-planner-codex-first-run` | Old canonical naming; verify before deletion |
| `asteroid-mining-planner-1` | Stale Slice 8.5; bundled to `C:\Users\hudso\slice3-research-rescue.bundle` |

Delete stale clones by hand when not under time pressure.

---

## §Uncommitted / untracked items

- `_rescued-agent-defs/` — intentionally untracked, local only; V1-era prior art for reference.
- Local `.claude/skills/*.md` edits may appear in Hudson's working tree; they are not Slice 14 source/docs state.
- No tracked project file changes expected at session start. If this section and `git status` disagree, trust `git status` and update STATUS.md.
