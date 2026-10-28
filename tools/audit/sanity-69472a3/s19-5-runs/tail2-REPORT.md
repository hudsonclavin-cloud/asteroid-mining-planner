TAIL2: COMPLETE
COMMITS: 8 code/build (+1 evidence), tip is the evidence commit (see git log)
VERIFY: 355/355 (baseline 351/351)
RECONS: R1 CONSISTENT-BUT-UNEXPLAINED · R2 CONSISTENT · R3 BY DESIGN (one copy gap) · R4 RENDERS (page bottom, unconditional once loaded)
PROTECTED PENDING: none

See COPY_DIFF.md (before -> after), RECONS.md (evidence), LOG.md (FAIL/PASS lines).

Commits and revert map (each reverts independently except where noted):
- aeef9ae F1+F2 AMBER wording and delivered-mass caveat (one commit, shared test file)
- 4c79fc0 F3 Replay-tour tooltip
- e2bca8f F4 catalog footer (adds src/v2/porkchop/grid-span.ts; porkchop/main.ts imports it; revert both together)
- d5d9b8d F5 ceiling line
- 69d6481 F6 clamped HUD + Shift+N help
- 1641ddd F7 About emoji + compare breadth definition
- 7819cb3 build(docs) rebuild (new bundles: aboutV2-ca_cBGJA.js, compareV2-CF7ZIRAI.js, grid-span-DnymItRv.js, porkchopV2-DjpIkekf.js, solarSystemV2-StQUKPFg.js; removed: aboutV2-C_q-vWJ7.js, compareV2-C2FVP3fT.js, porkchop-view-Cbo79LiN.js, porkchopV2-BHkfJah8.js, solarSystemV2-CRIN_Wqq.js)

Reversal recorded: copy-table C-6 ("launch-site payload penalty named above") was wrong; the advisory names a vehicle payload penalty. Fixed in F2 (noun is now "payload penalty").

Surprising / for Hudson:
- F1+F2 are one commit, not two.
- Full verify takes 8-10 min, so items ran targeted tests; one full verify ran on the final tip.
- New/changed strings use literal characters where they replaced existing literal characters (F1 advisory); the other new non-ASCII uses \u escapes.
- F6 help text: also handles "wall clock before coverage" (start of coverage); the status line "SCRUBBED - press Shift+N for now" (ephemeris-status.ts) still says "for now" outside coverage - not changed, out of scope.
- F4 drops the cache start date from the footer; overlay.ts, porkchop-smoke and compare still hold their own '2040-01-01' literals (not unified).
- F6 test covers the pure status/help functions; the runtime composition of the HUD line is covered by typecheck only.
- R1: DEC-13-6 says "replacing flat 10%" but the stack panel and INV-016c still say 10%; no on-page explanation of two margins.
- R3: kg payload-at-C3 shows on RED next to "no delivered-mass number is honest"; spec refuses delivered mass and dogleg price, not that line.
- Phase 0 first stopped on tripwire (a) until PR #3 merged.
