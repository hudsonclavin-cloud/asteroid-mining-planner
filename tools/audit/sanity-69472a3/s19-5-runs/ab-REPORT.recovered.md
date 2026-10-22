RUN: COMPLETE
COMMITS: 25 on s19-5-ab (base 6575d0d), tip bd9d6f5
VERIFY: 96/96 (baseline 87/87)
HALTED ITEMS: none
PROTECTED PENDING: P1/P2

RESULT
- npm run verify: PASS, 96 test files, 336 tests, 0 failures, 0 load timeouts. The 9-file/15-test increase over baseline is from the Front B and A1 guards added during this run.
- npm run build: PASS. Build command: vite build. Vite outDir: docs.
- No push, merge, stash, or protected commit performed.
- Final working tree intentionally has only the two protected founding-document edits, unstaged.

PER-COMMIT REVERT MAP
Each line names the single commit to revert; use coupled reverts where noted.
- 761346f · W0 Phase 0 evidence · tools/audit/sanity-69472a3/phase0/{PHASE0_LOG,RECON_A,RECON_G,RULINGS,TRIAGE}.md · git revert 761346f
- e6d4f7f · B1 FK3 AMBER copy · src/v2/app/porkchop/fk3-guided-tour.ts; tests/v2-fk3-guided-tour.test.mjs · git revert e6d4f7f
- b25acdc · B2 measured/unbounded tier disclosure · src/v2/porkchop/tier-disclosure.ts; tests/v2-tier-disclosure.test.mjs; tools/slice18-research/{tier-sizing-per-body.json,tier-sizing.mjs} · git revert b25acdc
- bde1f29 · B3 derived compare albedo factors · src/v2/app/compare/main.ts; tests/v2-compare-honesty.test.mjs · git revert bde1f29
- 4a098fb · B4 validation scope/provenance · src/v2/app/{about/main.ts,porkchop/validation-card.ts}; src/v2/data/validation-provenance.json; tests/v2-validation-provenance.test.mjs · git revert 4a098fb
- c7b9ef8 · B5 tier-load failure state · src/v2/app/catalog-list/{empty.ts,panel.ts}; tests/v2-catalog-empty.test.mjs · git revert c7b9ef8
- 446e3a7 · B6 derived span labels · src/v2/app/{catalog-list/honesty-disclosure.ts,porkchop/main.ts}; tests/v2-derived-span-labels.test.mjs · git revert 446e3a7
- e49933b · B7a non-finite C3 colormap refusal · src/v2/porkchop/{colormap.ts,colormap.test.mjs} · git revert e49933b
- 4535df9 · B7b non-finite C3 structured input refusal · src/v2/app/{compare/main.ts,porkchop/main.ts}; src/v2/porkchop/{launch-vehicles.ts,launch-vehicles.test.mjs} · git revert 4535df9
- b3a1ea5 · B8a MGS effective-ceiling wording · src/v2/app/porkchop/main.ts; tests/v2-dla-display.test.mjs · git revert b3a1ea5
- c9a7476 · B8b co-orbital attribution · src/v2/app/catalog-list/honesty-disclosure.ts; tests/v2-coorbital-disclosure.test.mjs · git revert c9a7476
- 40dc994 · B9 Dv-stack assumptions disclosure · src/v2/app/porkchop/main.ts; tests/v2-stack-assumptions.test.mjs · git revert 40dc994
- 07e1670 · B10 About fragment and invariant pin · src/v2/app/about/main.ts; tests/v2-about-evidence.test.mjs · git revert 07e1670
- ab61d82 · B11a/B11b pan and compare method copy · src/v2/app/{compare/main.ts,solar-system/runtime.ts}; tests/v2-shortcut-and-method.test.mjs · git revert ab61d82
- f77d947 · B11c close-approach marker · src/v2/app/catalog-list/{row.ts,row.test.mjs} · git revert f77d947
- 6e069ff · B11d/R6 DLA context when toggle is off · src/v2/{app/porkchop/main.ts,porkchop/porkchop-view.ts}; tests/v2-dla-display.test.mjs · git revert 6e069ff
- 52cdcd1 · R13 Earth-Moon public copy · v2/earth-moon/index.html; tests/v2-public-copy.test.mjs · git revert 52cdcd1
- c60595b · R7 launch-anchor basis field · src/v2/porkchop/launch-vehicles.ts; tests/v2-golden/launch-vehicles.golden.test.mjs · git revert c60595b
- 601d09b · A1 legacy move and path repair · legacy/{index.html,physics.worker.js}; vite.config.ts; tests/phase6-contract-smoke.test.mjs · git revert 601d09b
- 41f3b01 · A2 V2 root front door · index.html; vite.config.ts · git revert 41f3b01
- 317c4ae · A3 V2 redirect font cleanup · v2/index.html · git revert 317c4ae
- 7edee98 · A4 README front-door/status copy · README.md · git revert 7edee98
- 0f2a9a0 · A1 legacy freeze banner/noindex · legacy/index.html; tests/phase6-contract-smoke.test.mjs · git revert 0f2a9a0
- b29d89a · A1 additive LEGACY.md record · LEGACY.md · git revert b29d89a
- bd9d6f5 · W4 generated deployment build · docs/ · git revert bd9d6f5
Coupled reverts: A1 move 601d09b, A2 root 41f3b01, and W4 docs build bd9d6f5 are structurally coupled. B7 is the two-commit pair e49933b + 4535df9. Reverting a later build may require rebuilding after source reverts.

ALREADY-FIXED / REFUTED / REROUTED
- B8c: ALREADY-FIXED. The shipped MGS disclosure already uses the sourced OQ-12-2 values; no change.
- B8d / B5-F06: REFUTED. The ~1 m/s-per-degree figure is supported by INVARIANTS.md:120 and tools/slice13-research/literature/3d-verification-record.md:22,31, which cite JPL DESCANSO Vol. 12 Ch. 6 and the 21-day lunar launch period. No UI removal and no P3.
- R12: read-only check found no docs/ hits for renderer-test or buildProceduralRingTexture.
- B11g: REROUTED to Slice 24 docs hygiene. C2-F12 Apophis 0.257 AU, C2-F08 DE430, and C5-F16 smoke expected C3 were not rendered on a Vite/deployed route; v2/porkchop-smoke is not a Vite input.

RULING OUTCOMES
- R5: AMEND-ON. DEC-12-4 rationale: “Toggle default OFF (matches contour-overlay precedent) so the base heatmap stays unobscured.” Validation is recorded at src/v2/SLICE_12_FOUNDING.md:59-60; P2 was appended accordingly and remains unstaged.
- R6: disclosure, site picker, and DLA band legend remain visible when contour drawing is toggled off.
- R7: all 38 anchors received basis='official'; every committed anchor comment says NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02. Table: C:\Users\hudso\AppData\Local\Temp\s19-5-ab\R7_TABLE.md.
- R8: deterministic MPC sample at C:\Users\hudso\AppData\Local\Temp\s19-5-ab\R8_MPC_SAMPLE.md; 10 bodies selected from the shipped catalog, MPC fields intentionally blank for Clome/Hudson.
- R12: no prototype-ring hits in docs/.
- R13: no rendered bare internal OQ/DEC/INV identifiers; trust-surface values read from committed provenance.

TEST PROOF
Recorded pre-fix failure and post-fix pass where the batch log captured both:
- B1: tests/v2-fk3-guided-tour.test.mjs pre-fix FAIL on AMBER wording; post-fix PASS 1/1.
- B2: tests/v2-tier-disclosure.test.mjs pre-fix FAIL (3 assertions); post-fix PASS 10/10.
- B3: tests/v2-compare-honesty.test.mjs pre-fix FAIL at T3; post-fix PASS 3/3.
- B7a: src/v2/porkchop/colormap.test.mjs pre-fix produced [NaN, NaN, NaN]; post-fix PASS 4/4.
- B7b: src/v2/porkchop/launch-vehicles.test.mjs pre-fix returned BEYOND_CURVE for non-finite C3; post-fix PASS 7/7.
- B8a: tests/v2-fk3-guided-tour.test.mjs pre-fix lacked the supported ceiling wording; post-fix PASS 1/1.
- A1 banner: tests/phase6-contract-smoke.test.mjs pre-fix FAIL with AssertionError at missing `<meta name="robots" content="noindex, nofollow">`; post-fix PASS 7/7.
Post-fix guards for the remaining changed behavior all pass: B4 1/1, B5 1/1, B6 1/1, B8b 1/1, B9 1/1, B10 1/1, B11a/B11b 1/1, B11c row test 9/9, B11d/R6 2/2, R13 1/1, R7 11/11. Their individual pre-fix failure lines were not separately retained in the batch log.

BUILD / STOP GATE HANDOFF
- Preview command: npm run preview.
- Root generated entry: docs/index.html redirects to v2/solar-system/ and carries the V2 title/description/OG/canonical values.
- Legacy generated entries: docs/legacy/index.html has the fixed banner and noindex; docs/legacy/physics.worker.js exists.
- New named bundles: docs/assets/solarSystemV2-eFven3Lq.js; docs/assets/porkchopV2-DrTednCT.js; docs/assets/compareV2-BS2LahKC.js. Other rebuilt assets include aboutV2-BvErNums.js, porkchop-view-C3RRaFF7.js, validation-provenance-BkAPLf5w.json, and tier-assignments-BPJow_i-.js.
- COPY_DIFF: C:\Users\hudso\AppData\Local\Temp\s19-5-ab\COPY_DIFF.md. It has 10 sections and 21 recorded addition/removal lines (12 '-' lines, 9 '+' lines); R7 explicitly records that no user-facing string changed.

FINDINGS
- B6: 8.11% of cached best windows fall outside the displayed grid; routed to Slice 21, not shipped here.
- B3: the catalog generator retains its own literal 0.14; routed to Slice 24, not changed here.
- R12: no prototype ring hits in docs/.
- Generated build output rehashed V2 bundles as expected; no non-docs generated artifacts changed.

PROTECTED HAND-COMMIT BLOCKS (DO NOT RUN IN THIS BATCH)
P1 — src/v2/SLICE_19_5_FOUNDING.md
$paths = @('src/v2/SLICE_19_5_FOUNDING.md')
[IO.File]::WriteAllText("$PWD\.dispatch-scope", ($paths -join "`n") + "`n")
git status --porcelain
git add -- src/v2/SLICE_19_5_FOUNDING.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(slice19.5): lock Phase 0 rulings and Front A+B dispositions"; Remove-Item Env:\ASTER_PROTECTED_OK
$env:ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
git status --porcelain

P2 — src/v2/SLICE_12_FOUNDING.md
$paths = @('src/v2/SLICE_12_FOUNDING.md')
[IO.File]::WriteAllText("$PWD\.dispatch-scope", ($paths -join "`n") + "`n")
git status --porcelain
git add -- src/v2/SLICE_12_FOUNDING.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(slice12): record Slice 19.5 DLA default amendment"; Remove-Item Env:\ASTER_PROTECTED_OK
$env:ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
git status --porcelain

P3 — not applicable: B5-F06 was REFUTED by committed evidence.

FINAL STATUS EXPECTED BEFORE HUDSON HAND-COMMIT
 M src/v2/SLICE_12_FOUNDING.md
 M src/v2/SLICE_19_5_FOUNDING.md
No staged paths. .dispatch-scope clean. Canonical repository remains unpushed.