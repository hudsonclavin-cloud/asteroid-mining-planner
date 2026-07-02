# STATUS.md — Aster Project Current State

> Updated at the end of each session. Keep entries short — agents read this before acting.
> **Target: < 1 minute to update.**

---

## §Identity

**Canonical repo:** `C:\Users\hudso\asteroid-mining-planner`
**Live site:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/
**Porkchop route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/?body=asteroid-99942

---

## §Git state

| | Commit | Description |
|-|--------|-------------|
| **HEAD (local)** | `closeout build commit pending push` | build(slice12): deploy DLA launch-feasibility overlay — slice closed |
| **origin/main** | `8c1722c` | fix(slice12): signed-field DLA contours (pre-closeout) |
| **Deployed (gh-pages)** | `closeout build commit pending Hudson push` | Slice 12 DLA overlay build output staged in `docs/` |

---

## §Slice status

| Track | Slice | State |
|-------|-------|-------|
| Mission planning | Slice 9 (catalog) | COMPLETE |
| Mission planning | Slice 10 (Lambert, C3 screen) | COMPLETE |
| Mission planning | Slice 11 (porkchop + ΔV) | COMPLETE + DEPLOYED (`da3c520`) |
| Mission planning | Slice 11.5 (500-body M=1) | COMPLETE (data committed `50b3b68`) |
| Visualization | Slice V1 (textures + shader + atmosphere) | COMPLETE + DEPLOYED (`3211525`) |
| Visualization | Visual fixes (top-down, starfield ctrl, labels, halo frame) | COMPLETE + DEPLOYED (`dc44751`) |
| Mission planning | Slice 12 (DLA overlay) | COMPLETE + DEPLOYED (closeout build commit) |

**Active founding doc (mission planning):** `src/v2/SLICE_12_FOUNDING.md`
**Next founding doc to write:** `src/v2/SLICE_13_FOUNDING.md`

---

## §Next session — priority order

**1. Slice 13 founding doc (ΔV budget stack)** — Fable/Claude Code run.

**2. AGENTS.md operating-system commit** — this session's OS files (AGENTS.md, STATUS.md, INVARIANTS.md) landed; verify the tripwire (§2 HEAD-check) actually fires next session before real work begins.

**3. Parked-issue triage** — before Slice 12 code lands, decide which of the 9 parked issues (see §Parked issues) get addressed and which stay parked.

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

---

## §OQ register

| OQ | Slice | State |
|----|-------|-------|
| OQ-1 | Slice 10 | CLOSED — Lambert M=1 in production |
| OQ-2 | Slice 11 | CLOSED — full-catalog M=1 re-screen DEFERRED (see `50b3b68`, 11.5 engineering record) |
| OQ-3 | Slice 10 | CLOSED — MIT clean-room throughout (DEC-1 Rev 2) |

---

## §Stale clone cleanup (housekeeping, not urgent)

| Clone | State |
|-------|-------|
| `asteroid-mining-planner-codex-first-run` | **CANONICAL** |
| `asteroid-mining-planner-1` | Stale Slice 8.5; bundled to `C:\Users\hudso\slice3-research-rescue.bundle` |
| `asteroid-mining-planner` | Ancient, 427 commits behind |

Delete stale clones by hand when not under time pressure. Rename canonical after deletion.

---

## §Uncommitted / untracked items

- `_rescued-agent-defs/` — intentionally untracked, local only; V1-era prior art for reference
- No tracked file changes expected at session start. If this section and `git status` disagree,
  trust `git status` and update STATUS.md.
