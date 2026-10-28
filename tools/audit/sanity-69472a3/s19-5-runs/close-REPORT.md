CLOSE: COMPLETE
COMMITS: 27 on s19-5-close, tip W10 pending
VERIFY: 351/351 (baseline 336/336)
F-FRONTS: F1 done · F3 done · F2 done
PROTECTED PENDING: P1-P6 (additive proof: yes)

# S19.5 close-batch report

Run started 2026-10-25 on branch `s19-5-close` from `62ddb17`.

## W0

- Baseline: `npm run verify` passed 97/97 files and 336/336 tests.
- Safety refs: tag `s19-5-pre-close`; branch `backup/s19-5-pre-close`.
- Binding design source: `src/v2/SLICE_19_5_FOUNDING.md` DEC-19.5-3..6 because no `claude/DESIGN_RECOMMENDATIONS.md` exists.

## W1

- T1: rendered on the deployed root catalog panel. Shared L2 disclosure text now supplies the two distinct legend phrases. FAIL: `tests/v2-tier-legend-render.test.mjs:46`; PASS: 11/11 targeted tests.
- [UNGATED COPY] T1 legend: `measured, exceeds certified bound / not measured`.
- T2: deployed catalog loading, failed, and empty-after-filter states are distinct. FAIL: `tests/v2-catalog-empty.test.mjs:33`; PASS: 1/1 plus typecheck.
- T3 outcome: the delivered-mass computation excludes the launch-site payload penalty named by the AMBER advisory. Evidence: `main.ts:453`, `launch-vehicles.ts:281-288`. C-6 now renders beside AMBER mass. FAIL: `tests/v2-dla-render.test.mjs:419`; PASS: 1/1.
- T4: deployed iMin/ceiling legend entries now derive and display the selected launch-site name. FAIL: `tests/v2-dla-render.test.mjs:444`; PASS after switching Cape Canaveral -> Vandenberg SFB: 1/1.
- T5: deployed catalog disclosure and About audit exhibits now use public-facing wording rather than internal slice/decision/storage identifiers. FAIL: `tests/v2-public-copy-render.test.mjs:50,59`; PASS: 2/2 plus typecheck.
- T6: at <=480 px the porkchop orders the plot before full-width panels; the plot preserves its 2:1 aspect and the page uses vertical scrolling without horizontal overflow. No layout harness exists, so this is visual-gate only. Compare/About/catalog static inspection found no fixed-width page container requiring a scoped overflow fix; browser end-gate remains pending because no in-app browser target was available.
- T7: the solar-system time/frame HUD now always shows C-3 beside the frame readout. The imperative runtime HUD has no mount harness, so this is visual-gate only; typecheck passed.

## W2

- Runtime coverage is the intersection of all loaded body-state series. All 22 series tie at 2026-07-18 through 2026-10-16 TDB; no single series ends first.
- The cold-read Jul 18 date is the common coverage start shown by the coverage line, not another clamp of now and not an asteroid epoch. The wall-clock clamp uses the common Oct 16 end.
- Tracking outside coverage now renders C-1/C-2 and never `LIVE`; tracking inside coverage still renders `LIVE`. FAIL: `tests/v2-ephemeris-hud.test.mjs:38`; PASS: 2/2 plus typecheck.
- Recon: `%TEMP%/s19-5-close/EPHEMERIS_RECON.md` (four fixture hashes, committed generation path, 2030/2060 commands and size projections, affected tests).
- [UNGATED COPY] Before-start counterpart: `Current time is before this view's ephemeris coverage (starts <date> TDB). Positions are shown for <date>, not now.`

## W3

- W3a: compare already carries each body's committed tier assignment, and each best window carries departure JD + TOF, so `supportBoundaryFor` and `isArrivalAfterEncounter` were reused without new computation. Apophis renders C-5 for its 2029-04-13 arrival after its 2028-09-12 support boundary. Rendering does not mutate results or ranking inputs. FAIL: `tests/v2-compare-honesty.test.mjs:212`; PASS: 4/4 compare-honesty tests plus typecheck.

## W3b

- Clause table at HEAD: method/provenance badge PRESENT (`MethodBadge`); 25 km²/s² threshold PRESENT (`MethodBadge`); interpolation anchors MISSING; NASA Launch Services contract context MISSING; New Glenn caveat MISSING.
- W3b closes the three missing disclosure clauses without changing ranking: delivered-mass rows now identify the official-published curve and exact or bracketing anchors; the method badge names the NASA Launch Services contract context; and it states the New Glenn steep-final-anchor interpolation caveat.
- [UNGATED COPY] `derived from official-published curve; ...`, the NASA Launch Services contract sentence, and the New Glenn caveat are rendered disclosure copy.
- FAIL: `tests/v2-compare-honesty.test.mjs:242` (missing official-curve provenance); PASS: 5/5 compare-honesty tests plus `npm run typecheck:v2`.

## W7-0

## W4

- C1 rebuilt `STATUS.md` and the deployment section from repository commands and current docs-bundle names (`93fb929`).
- C2 added supersession banners to the historical 2026-07-31 audit and `HANDOFF.md` (`23aec29`).
- C3 added `tools/setup-hooks.mjs` and the `prepare` hook; outside a worktree it exits silently, and inside a temporary Git worktree it configures `.githooks` (`e5cdc9d`).

## W5

- Copied the supplied design-token source verbatim from `Downloads/aster-ds-tokens.json`: 21,955 bytes, SHA-256 `8c4b3a225e06978f4154a759db8d818b9a8dbef63d0c89ee2387aa2bd80cc2af`; generator `tools/design/gen-tokens.mjs` produces `src/v2/app/design/tokens.ts` (`0e3c446`, `6ae930c`).
- Mutation proofs failed as expected for generated-token drift and source-token corruption; both were restored and the final sync test passed.
- DEC-19.5-6 contrast repairs intentionally ship as app-layer overrides (`#3a8d4a` -> `#378646`, `#9a7a3a` -> `#907236`, and catalog hint `#666666` -> `#7d7d7d`); the token snapshot remains unchanged.

## W6

- Contrast floor repairs and the shared global focus ring landed in `931aa93`; the a11y floor test covers contrast ratios, focus styling, and keyboard activation of catalog rows.
- Measured ratios after repair: low-C3 status 4.506:1, L1 tier 4.520:1, catalog hint 4.587:1, all above the 4.5:1 floor. Narrow visual confirmation remains pending because no in-app browser target was available.

## W7

- Characterization fixture and shared honesty components landed in `9e819b1` and `188914c`; compare, porkchop, and catalog migrated in `3838c1f`, `3a0acc7`, and `ba8bc8b`.
- Architecture guard is a source-scan test and passes. A temporary violation probe failed as expected, then was removed. The catalog rendered-text regression was corrected in `032a6ee`; the catalog row suite passed 9/9.

## W8

- `npm run build` passed. The deployed bundle includes the About route without `nea-catalog`, a catalog loader, or a catalog store in the About payload (`84242f7`).
- The About evidence test was corrected to bind its anchor to `about/audit-copy.ts` and to inspect the current committed invariant rather than reading a historical Git object (`cc41045`). A verify run started before that correction was stale and ended 350/351; a fresh final verify is required.

## W9

- Protected close edits are intentionally unstaged in `AGENTS.md`, `INVARIANTS.md`, and `src/v2/SLICE_19_5_FOUNDING.md`.
- Rulings recorded: hook enforcement is test-time, INV-014 is namespaced 014a/014b, INV-035/036 remain skipped, and INV-026 accepts a committed test binding a constant to its provenance artifact.
- P1/P3/P4 close text was added with an additive proof; P5 required no edit because Slice 11 already matches DEC-7's model.
- Fresh final verify: `npm run verify` passed 106/106 files and 351/351 tests, with one documented retired Slice 9 test skipped.

- Recon count: 6 direct `formatC3(...)` display call sites outside `porkchop/format-c3.ts` (compare 2, porkchop 2, catalog 2); broader independent status/tier/feasibility/evidence search found 25 named display references. This is below the 40-site halt threshold.
- Catalog, compare, and porkchop honesty surfaces are all Preact; a shared component can serve them without restructuring a raw-DOM surface. Characterization proceeds before migration.

## W10

- Final verify passed: 106/106 files, 351/351 tests, 0 failures, 1 documented skip.
- The four close reports are copied byte-verbatim into `tools/audit/sanity-69472a3/s19-5-runs/` after this report is finalized; their source/copy SHA-256 values are printed in the close-out report.
