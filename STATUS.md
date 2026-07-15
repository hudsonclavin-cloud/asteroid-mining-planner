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
| **Current HEAD before this STATUS commit** | `d690562` | RR wave close stack through CI full-tests + Node 24 unification |
| **origin/main before this close stack push** | `89f492a` | Cross-platform test-runner watchdog kill; RR1I commits local until Hudson pushes |
| **RR1I overlay fix** | `8892af7` | fake-DOM finite layout metrics; NaN signal loop closed; convergence guard added |
| **RR1I CI** | `6cab3fb`, `d690562` | full-tests job live on Node 24; A1/A2/build/full-tests all Node 24 |
| **Slice 15 G1 final** | `84fefe8` | README aligned with Phase G skeleton |
| **Slice 15 eval gate** | `c8a139a` | `mcp/eval/slice15-eval-summary.md`: `Result: 10/10 PASS` |
| **Slice 16 pre-registration anchor** | `7cd761b1` | `src/v2/SLICE_16_FOUNDING.md` DRAFT committed |

**Push state:** RR1I close stack is local until Hudson reviews and pushes.
**Active founding doc:** `src/v2/SLICE_16_FOUNDING.md` is the next draft fork; RR wave work is maintenance/hardening.
**Invariant ceiling:** `INV-034`.

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

## RR Wave Status

**State:** CLOSED locally through `d690562`; waiting for Hudson push and first Actions run.

**Closed chain:**
- RR1 external review response verified the broad test-runner problem.
- RR1D made the suite truthful across 59 files.
- RR1E guarded `BASE_URL` and preserved bundle byte identity.
- RR1F added the per-file watchdog and count accounting; `v2-ui-overlay` became an honest `LOAD-TIMEOUT` instead of vanishing.
- S9DISP retired the unrecoverable Slice 9 A.3 sample harness with an explicit skip and added `INV-034` evidence-artifact tracking.
- RR1H proved the overlay mechanism: fake-DOM layout reads returned `undefined`; `Math.max(0, undefined)` produced `NaN`; `NaN !== NaN` rewrote `viewportHeightSignal` every render. This supersedes RR1F's shim-invariant hypothesis while preserving the same production `NONE` verdict.
- RR1I fixed the test shim with finite layout metrics, added a convergence stress guard, ran the scaled adversarial audit, and added CI full-tests.

**Current suite:** `node tools/run-tests.mjs` measured `files discovered: 71`, `files passed: 71`, `files failed: 0`, `files LOAD-TIMEOUT: 0`, `tests passed: 210`, `tests failed: 0`, wall clock `252.4s`, accounting `71 == 71 + 0 + 0 OK`. One Slice 9 retired harness remains an intentional node:test skip with reason.

**Production caveat verdict:** CLOSED. `src/v2/app/catalog-list/panel.ts` uses a guarded `scrollContainerEl` and then plain `scrollContainerEl.clientHeight`; there is no optional-chained nullable layout read. Browser `clientHeight` is numeric, so production NaN loop blast radius is `NONE [Certain]`.

**Audit artifacts:** `C:\Users\hudso\aster-audit-reports\rr1i-audit\findings.md` and `hostile-overlay-probes.mjs`; no HIGH or MEDIUM repo fixes found.

---

## Next Session

1. **Hudson review/push RR1I close stack.** After push, watch the first Actions run; the `full-tests` job is the Linux field test for the POSIX process-group kill path.
2. **RR2 renderer wave.** A7 evidence is ready; this is visual-gated work.
3. **Next fork A - Dossier founding-doc lock.** Ungated; can dogfood the shipped MCP.
4. **Next fork B - Slice 16 design lock.** Gated by O1: API keys + budget for the multi-model study.
5. **Appendix A / Fable draft ingestion.** Appendix A is not in-repo yet; the expected Fable draft filename is `SLICE_16_APPENDIX_A_scenarios.md` if Hudson supplies the draft set.

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
