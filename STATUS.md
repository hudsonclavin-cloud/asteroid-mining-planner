# STATUS.md - Aster Project Current State

> Updated at the end of each session. Keep entries short; agents read this before acting.
> Target: under 1 minute to update.

---

## Identity

**Canonical repo:** `C:\Users\hudso\asteroid-mining-planner`
**Live site:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/
**About route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/
**Porkchop route:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/
**MCP package:** `aster-mission-mcp@0.1.0` - PUBLISHED on npm, publisher `hudsoclavin`, handshake-verified 2026-07-10

---

## Git State

| Item | Commit | State |
|------|--------|-------|
| **Current HEAD before this STATUS commit** | `c4e53a9` | OQ-15-5 published disposition + deferred-items log |
| **origin/main before this close stack push** | `c6438df` | Publish fix: removed `private` from `mcp/package.json`; root remains private |
| **Slice 15 G1 final** | `84fefe8` | README aligned with Phase G skeleton |
| **Slice 15 eval gate** | `c8a139a` | `mcp/eval/slice15-eval-summary.md`: `Result: 10/10 PASS` |
| **Slice 16 pre-registration anchor** | `7cd761b1` | `src/v2/SLICE_16_FOUNDING.md` DRAFT committed |

**Push state:** this paper-close stack is local until Hudson reviews and pushes.
**Active founding doc:** `src/v2/SLICE_15_FOUNDING.md` (LOCKED; OQ-15-5 publish disposition appended additively in `c4e53a9`).
**Invariant ceiling:** `INV-033`.

---

## Slice Status

| Track | Slice | State |
|-------|-------|-------|
| Mission planning | Slice 9 (catalog) | COMPLETE |
| Mission planning | Slice 10 (Lambert, C3 screen) | COMPLETE |
| Mission planning | Slice 11 (porkchop + dV) | COMPLETE + DEPLOYED |
| Mission planning | Slice 12 (DLA overlay) | COMPLETE + DEPLOYED |
| Mission planning | Slice 13 (mission cost card) | COMPLETE + DEPLOYED |
| Packaging / demo | Slice 14 (About + validation card + FK3 tour + CI) | CLOSED + DEPLOYED |
| MCP / agent surface | Slice 15 | PUBLISHED + VERIFIED (`aster-mission-mcp@0.1.0`, 2026-07-10) |
| Agent-honesty study | Slice 16 | PRE-REGISTERED DRAFT at `7cd761b1`; not locked |

**Slice 15 shipped repo surface:**
- 7 MCP tools: `search_bodies`, `get_body`, `porkchop_scan`, `explain_cell`, `dla_feasibility`, `estimate_mission_cost`, `get_validation_report`.
- 4 MCP resources: `aster://reference/launch-vehicles`, `aster://reference/dla-site-bands`, `aster://reference/catalog-schema`, `aster://reference/dv-stack-model`.
- Evidence envelopes with Quantity leaves, structured refusals, convention-(g) infeasibility-as-value, and baked provenance fallback for no-git package installs.
- Eval gate: `10/10 PASS` in `mcp/eval/slice15-eval-summary.md` and `mcp/eval/slice15-eval-report.json` (`c8a139a`).
- npm publish: `aster-mission-mcp@0.1.0`, publisher `hudsoclavin`, tarball shasum `c912f2b`, handshake-verified 2026-07-10 (`serverInfo` name/version match, protocolVersion `2025-11-25`).

**Slice 15 phase anchors:**
- A/B: `3be36bb`, `c5d1173`, `32d2801`
- C: `0a76f39`
- D1: `a4bb189`
- D2: `142f8cc`
- E fix: `41abd8a`
- F1/F2: `5d4f896`, `c8a139a`
- G1: `2a1357f`, `7b9eda3`, `2b0c751`, `cb62ab9`, `2cf7526`, `202bae9`, `50b9ad9`, `84fefe8`
- G2 close record: `b52d823`
- Publish fix: `c6438df`
- Published OQ-15-5 paper seal: `c4e53a9`

---

## Next Session

1. **Review/push paper-close docs stack.** Hudson reviews `c4e53a9` plus this STATUS commit, then pushes.
2. **Next fork A - Dossier founding-doc lock.** Ungated; can dogfood the shipped MCP.
3. **Next fork B - Slice 16 design lock.** Gated by O1: API keys + budget for the multi-model study.
4. **Appendix A / Fable draft ingestion.** Appendix A is not in-repo yet; the expected Fable draft filename is `SLICE_16_APPENDIX_A_scenarios.md` if Hudson supplies the draft set.

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
- `_rescued-agent-defs/` is intentionally local-only prior art.
- Local `.claude/skills/*.md` edits may appear in Hudson's working tree; they are not project state.
