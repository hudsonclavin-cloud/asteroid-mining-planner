# STATUS.md - Aster Project Current State

> Updated at the end of each session. Keep entries short - agents read this before acting.
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
| **HEAD (local)** | `local-only H1 housekeeping stack` | `/v2/` redirect commit landed locally; docs line-ending normalization + this STATUS refresh are also local until Hudson pushes |
| **origin/main** | `142f8cc` | Slice 15 Phase D complete: 7 MCP tools + 4 resources live in-repo |
| **Deployed live site** | `142f8cc` | Live app routes work at `/v2/solar-system/`, `/v2/porkchop/`, `/v2/about/`; bare `/v2/` redirect is not live until H1 is pushed |

**Current built bundles (from committed `docs/v2/*/index.html`):**
- About: `aboutV2-DftM0n-e.js`
- Porkchop: `porkchopV2-Cxwkeql6.js`
- Solar system: `solarSystemV2-VhE9zmmW.js`
- Shared Slice 9 catalog chunk: `slice9-nea-catalog-DpR-rPTv.js`
- Validation provenance asset: `validation-provenance-lm2C_8vP.json`
- Local docs tree also includes `docs/v2/index.html` redirecting to `/v2/solar-system/` (push pending)

---

## §Slice status

| Track | Slice | State |
|-------|-------|-------|
| Mission planning | Slice 9 (catalog) | COMPLETE |
| Mission planning | Slice 10 (Lambert, C3 screen) | COMPLETE |
| Mission planning | Slice 11 (porkchop + dV) | COMPLETE + DEPLOYED |
| Mission planning | Slice 11.5 (500-body M=1) | COMPLETE |
| Visualization | Slice V1 (textures + shader + atmosphere) | COMPLETE + DEPLOYED |
| Visualization | Visual fixes (top-down, starfield ctrl, labels, halo frame) | COMPLETE + DEPLOYED |
| Mission planning | Slice 12 (DLA overlay) | COMPLETE + DEPLOYED |
| Mission planning | Slice 13 (mission cost card) | COMPLETE + DEPLOYED |
| Packaging / demo | Slice 14 (About + validation card + FK3 tour + CI) | CLOSED + DEPLOYED (`b7532eb`, 2026-07-07) |
| MCP / agent surface | Slice 15 (workspace + envelope + 7-tool set) | OPEN - Phases A-D COMPLETE at `origin/main` (`142f8cc`) |

**Active founding doc:** `src/v2/SLICE_15_FOUNDING.md` (LOCKED; Slice 15 active)  
**Next phase:** Slice 15 Phase E - Hudson-driven Inspector session across the 7-tool set  
**Invariant ceiling:** `INV-033` (active ceiling from `src/v2/SLICE_15_FOUNDING.md`; `INVARIANTS.md` index is behind)

**Slice 15 landed so far:**
- Phase A/B foundation: `3be36bb`, `c5d1173`, `32d2801`
- Phase C catalog tools + reference resources: `0a76f39`
- Phase D1 compute tools I: `a4bb189`
- Phase D2 compute tools II / 7-tool cap reached: `142f8cc`

---

## §Next session - priority order

**1. Push H1 and live-check `/v2/`.** Hudson pushes the local housekeeping stack, then verifies that bare `/v2/` resolves to `/v2/solar-system/` instead of a GitHub Pages 404.

**2. Slice 15 Phase E Inspector session.** Run the full Hudson-driven black-box pass over all 7 MCP tools.

**3. Slice 15 Phase F eval gate.** Build the verified QA-pair artifact and run the publish gate after Phase E is clean.

---

## §Queued dispatches

None queued.

---

## §Parked issues

### Visual bugs (Claude-in-Chrome audit 2026-06-30, revised 2026-07-01)

| # | Severity | Status | Notes |
|---|----------|--------|-------|
| 1 | (was SEVERE) | CLOSED | Fixed by Sun-clearance clamp (`5f7994c`); root cause was custom orbit-state math, not OrbitControls as originally hypothesized |
| 2 | Medium | OPEN | Straight green line artifact on Bennu (101955) / asteroid 100926 - orbit polyline with too few segments |
| 3 | Low | CLOSED (explained) | NEA "cloud shift" is expected floating-origin behavior; not a bug |
| 4 | Low | OPEN | NEA cloud vanishes at high zoom-in (point sprite culling) |
| new | Aesthetic | OPEN | Starfield density / brightness tuning (slider added, defaults may need adjustment) |
| Slice 12 audit LOWs | Low | PARKED | 8 LOW findings - see `C:\Users\hudso\aster-audit-reports\slice12-phaseE-audit.md` |

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
| C1 | Add the missing Slice 14 founding-doc §8 close entry + OQ-14-6 disposition table in a docs-only cleanup pass |
| C2 | Fix the Windows `.bin/tsc` shim violation noted in Slice 14 |
| C3 | Re-land New Glenn C3=5 anchor only with elvperf screenshot + oracle row + DEC-13-1 amendment |
| C4 | MCP publish-time fallback for repo-hash provenance when `.git` is unavailable (Phase G note) |

---

## §OQ register

| OQ | Slice | State |
|----|-------|-------|
| OQ-1 | Slice 10 | CLOSED - Lambert M=1 in production |
| OQ-2 | Slice 11 | CLOSED - full-catalog M=1 re-screen DEFERRED (see `50b3b68`) |
| OQ-3 | Slice 10 | CLOSED - MIT clean-room throughout (DEC-1 Rev 2) |
| OQ-14-6 | Slice 14 | OPEN/PENDING DISPOSITION - candidate list extracted; post-close triage still open |
| OQ-15-8 | Slice 15 | CLOSED - Node-side grid timing measured and defaults set in `a4bb189` |

---

## §Stale clone cleanup (housekeeping, not urgent)

| Clone | State |
|-------|-------|
| `asteroid-mining-planner` | CANONICAL |
| `asteroid-mining-planner-codex-first-run` | Old canonical naming; verify before deletion |
| `asteroid-mining-planner-1` | Stale Slice 8.5; bundled to `C:\Users\hudso\slice3-research-rescue.bundle` |

---

## §Uncommitted / untracked items

- `_rescued-agent-defs/` - intentionally untracked, local only; V1-era prior art for reference.
- Local `.claude/skills/*.md` edits may appear in Hudson's working tree; they are not project state.
- No tracked project file changes expected at session start. If this section and `git status` disagree, trust `git status` and update STATUS.md.
