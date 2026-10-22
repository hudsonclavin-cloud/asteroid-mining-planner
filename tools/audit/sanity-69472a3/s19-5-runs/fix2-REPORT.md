FIX2: COMPLETE | STOPPED(None)
COMMITS: 5, tip 5e880e0
VERIFY: 336/336
ABOUT PAYLOAD: catalog-free | STILL LOADS aboutV2-BvErNums.js, modulepreload-polyfill-B5Qt9EMX.js, slice9-nea-catalog-00URi76F.js, validation-provenance-BkAPLf5w.json
PROTECTED PENDING: P1, P2, P3 (additive proof: yes)

## Commit sequence

- `001c87d` — `fix(v2/porkchop): tidy AMBER plane-matching copy (B5-F06 follow-up)`
- `42e917d` — `fix(v2/about): render catalog count from bound constant, no catalog fetch (C5-F17)`
- `148b003` — `test(v2/porkchop): render-level guard for INV-016d disclosure with DLA off (R6)`
- `79ab05e` — `test(v2/porkchop): render-level guard for ΔV-stack assumptions (B9, INV-016c)`
- `5e880e0` — `build(docs): rebuild after S19.5 FIX2`

## Required fail/pass proofs

- G0: the updated copy guard failed before the production string change at `tests/v2-dla-display.test.mjs:23:10` (`G0_PREFIX_EXIT=1`); after the AMBER copy fix it passed 2/2 (`G0_POSTFIX_EXIT=0`).
- G1: changing `SLICE9_NEA_CATALOG_TOTAL_BODIES` from 41,906 to 41,905 failed `tests/v2-catalog-count-binding.test.mjs:38:10` (`G1_PREFIX_EXIT=1`); after restoration, the binding and public-copy tests passed 2/2 (`G1_POSTFIX_EXIT=0`).
- G2: wrapping the DLA disclosure/site-picker/legend in the old `showDlaContours` condition failed `tests/v2-dla-render.test.mjs:427:12` (`G2_PREFIX_EXIT=1`); after restoration, the render test passed 1/1 (`G2_POSTFIX_EXIT=0`).
- G3: deleting the rendered `stack-assumptions` block failed `tests/v2-dla-render.test.mjs:446:12` (`G3_PREFIX_EXIT=1`); after restoration, the render test passed 1/1 (`G3_POSTFIX_EXIT=0`).

## G4 inventory: tests changed or added in `6575d0d..HEAD`

Source-text and static-copy guards:

| Test file and line(s) | Assertion | Render/import equivalent |
|---|---|---|
| `tests/v2-about-evidence.test.mjs:11-18` | About source pins the Slice 13 heading anchor and invariant exhibit commit; founding-text heading and invariant IDs are checked against files. | About render/import is feasible; route to Slice 20 E. |
| `tests/v2-public-copy.test.mjs:11-14` | Disclosure has no bare taxonomy IDs; earth-moon HTML has no Slice label; About validation copy does not duplicate trust figures. | Disclosure/About import or render is feasible; the HTML entry is an acceptable rendered-copy guard; route to Slice 20 E. |
| `tests/v2-shortcut-and-method.test.mjs:9-12` | Runtime source names middle-drag pan and compare source names the M=0 method. | Compiled import/render is feasible; route to Slice 20 E. |
| `tests/v2-derived-span-labels.test.mjs:26-29` | Porkchop source derives the full date span and does not carry the old literal span. | Render/import with changed grid parameters is feasible; route to Slice 20 E. |
| `tests/v2-coorbital-disclosure.test.mjs:11-14` | Disclosure source says patched-conic-versus-patched-conic and excludes the old horizon and numeric claim. | Import the disclosure function and assert returned copy; route to Slice 20 E. |
| `tests/v2-dla-display.test.mjs:12-27` | Source copy names AMBER as Raised inclination, retains the effective-ceiling disclosure, and excludes the old range and m/s-per-degree wording. | Render/import is feasible; R6 behavior is now covered by `v2-dla-render`, while this copy guard routes to Slice 20 E. |
| `tests/phase6-contract-smoke.test.mjs:24,40-46,76-107` | Legacy HTML, worker README/route/environment documentation, worker URL removals, and gitignore entries are checked as static contract artifacts. | These are HTML/documentation/worker contracts rather than a Preact render; semantic route/import checks are feasible; route to Slice 20 E. |
| `tests/v2-compare-honesty.test.mjs:36,133-140` | Emitted compare mount exists; source ordering uses `bestPractical.c3` and does not use the hide flag. | The same file already has compiled import/render coverage; the residual source ordering/mount checks route to Slice 20 E. |

Behavioral/data/import/render tests in the same range (no source-text guard):

| Test file | Coverage classification |
|---|---|
| `tests/v2-catalog-count-binding.test.mjs:33-39` | Imports the real count constant and binds it to fixture `totalBodies` and record count; this is the G1 data proof. |
| `tests/v2-catalog-empty.test.mjs` | Compiled import behavior for empty/filter-load states. |
| `tests/v2-dla-render.test.mjs:343-455` | Compiled dedicated-page render proof for DLA disclosure off/on and one-way/sample-return ΔV assumptions; fixture reads are data boundaries, not source-text assertions. |
| `tests/v2-fk3-guided-tour.test.mjs` | Compiled/imported tour behavior. |
| `tests/v2-golden/launch-vehicles.golden.test.mjs` | Imported launch-vehicle behavior and locked numeric anchors. |
| `tests/v2-tier-disclosure.test.mjs` | Committed JSON artifacts and imported disclosure functions. |
| `tests/v2-validation-provenance.test.mjs` | Committed validation JSON fields and wording. |

## About payload proof

The built `docs/v2/about/index.html` asset links are exactly:

- `aboutV2-BvErNums.js`
- `modulepreload-polyfill-B5Qt9EMX.js`
- `slice9-nea-catalog-00URi76F.js` (shared code containing the bound count; it is not the catalog JSON)

There is no About HTML link to `loader-*.js`, `store-*.js`, or `nea-catalog-*.json`. The About entry's only runtime JSON URL/fetch is `validation-provenance-BkAPLf5w.json`. The shared boundary chunk contains an unused catalog-loader function for other routes, but About does not import or call that loader, so the full catalog JSON is not requested on `/about/`.

New generated bundle names in the docs commit:

`aboutV2-BvErNums.js`, `compareV2-BS2LahKC.js`, `porkchop-view-C3RRaFF7.js`, `porkchopV2-CeMrUCV7.js`, `slice9-nea-catalog-00URi76F.js`, `solarSystemV2-eFven3Lq.js`, `store-DfTWpS4r.js`, and `tier-assignments-BPJow_i-.js`.

## Final §9.1 text

### §9.1 Phase 0 ruling record — 2026-10-14 (Hudson)
- Ruling packet: tools/audit/sanity-69472a3/phase0/RULINGS.md (Nova, 2026-10-13, with
  Addendum 1 of 2026-10-14), accepted in full by Hudson 2026-10-14.
- Dispositions: tools/audit/sanity-69472a3/phase0/TRIAGE.md, as reclassified by
  RULINGS.md §2. In §6, "Front B: every FIX-USER row" means the visitor-visible rows
  (RULINGS.md §2a: 30 firm + 3 conditional). The other 27 B-routed and 4 G-routed
  rows are re-routed per RULINGS.md §2b; none are dropped (86 in, 86 out).
- Unverified rows: any disposition on a row marked "audit only (unverified)" is a
  hypothesis; fixing dispatches verify at HEAD first.
- R1 INV-008..011: amend to test-time enforcement (Front C, INVARIANTS [P]).
- R2 INV-014: namespace 014a (8.5 star background) / 014b (9 three-gate tier); the
  index stays authority (Front C).
- R3 INV-035/036: proposals take the next free IDs; 035/036 stay skipped (Front C).
- R4 SLICE_11:63: annotated superseded by DEC-7; code matches DEC-7 (Front C).
- R5 DEC-12-4 default: AMEND-ON; rationale quoted in the S19.5 A+B batch log.
- R6 INV-016d: code fixed; disclosure renders whenever a verdict renders.
- R7 INV-022: basis field added to all 38 anchors.
- R8 DEC-17-4 MPC spot check: to be run (sample → Clome → Hudson); result appended
  to SLICE_17_FOUNDING.md §9. Not a waiver.
- R9 DEC-17-5 on compare: fixed in F2; moves to Front B if F2 is cut.
- R10 INV-001 atmosphere: amend to "shares its body's figure and orientation";
  implemented in Front G (Slice 22).
- R11 earth-moon camera-relative: recon in Front G before ruling.
- R12 prototype ring profile: annotate as procedural/unsourced/not shipped;
  docs/ check result: no hits.
- R13 INV-025: the bare "(OQ-7)" identifier removed (c9a7476). INV-026: the
  porkchop span literal is derived (446e3a7); the About catalog count is
  rendered from SLICE9_NEA_CATALOG_TOTAL_BODIES, bound by a data test to
  the committed catalog's totalBodies and record count (42e917d); the FIX1 loader
  approach (20fb6ce) was reversed because it fetched the full catalog on /about/.
  Whether a test-bound constant satisfies INV-026's 'never from literals' is a
  Front C clarification.
- R14 DEC-15-8 / INV-027 (MCP): fix in Slice 20 (math layer, audited).
- R15 DEC-16-8: compute the registered contrast in Slice 21 D; never amend the
  pre-registration; README carries the pending sentence.
- B5-F06 "~1 m/s-per-degree": CONFIRMED (the audit is right). The committed
  evidence (tools/slice13-research/literature/3d-verification-record.md:22)
  gives no per-degree number and says the DESCANSO lunar result is "not a
  liftable formula for interplanetary DLA pricing"; the figure appears only in
  the project's own synthesis (:31). The batch's REFUTED verdict cited the
  figure's existence, not its applicability; overturned by the independent
  verify run (S19_5_AB_VERIFY). UI number removed (5a2f9b2); INVARIANTS note
  appended.
- Evidence correction (B2, b25acdc): tools/slice18-research/tier-sizing.mjs
  labelled 7 measured bodies (105140, 1979 XB, 2010 KD, 2021 CG6, 2024 BB8,
  2025 KP4, 433) "unmeasured"; the generator was fixed and the JSON
  regenerated. No keys were added or removed, and the only other changed value
  is generatedAtUtc, so every measured value reproduced exactly. Slice 18 text
  citing the old counts is DOC-ANNOTATE (Slice 24).
- Process record: the A+B batch report attributed B8a's test proof to
  tests/v2-fk3-guided-tour.test.mjs, which cannot fail for B8a; the real guard
  is tests/v2-dla-display.test.mjs. An independent mutation run proved all 12
  guards the batch left unproven (V1-V12). Nova's verify run checked only that
  guards can fail, not that they test rendered behaviour. FIX2 converted the R6
  and B9 guards to render tests (148b003, 79ab05e); the remaining source-text
  guards (FIX2 G4 list) route to Slice 20 E.
- DEC-19.5-2 LOCKED as amended: "A disposition on a row marked audit only
  (unverified) is a hypothesis. The fixing dispatch verifies at HEAD first and may
  reclassify to ALREADY-FIXED/REFUTED with evidence. Reclassification across fronts
  requires Hudson's ruling."
- DEC-19.5-3, -4, -5, -6, -7, -8: LOCKED as drafted in §3.
- STATUS: this founding document is LOCKED as of 2026-10-14. This line supersedes
  the DRAFT header, which stays unedited under the additive rule.

## Surprises / non-blocking warnings

- `npm run verify` printed the existing fake-DOM invalid-URL warnings for `/lambert-screen-cache.json` and `/tier-sizing-per-body.json`, plus the existing unimplemented network warning in the Phase C overlay tests; all affected tests passed.
- `npm run build` printed the existing Vite warning about chunks larger than 500 kB; the build passed.

## Final safeguards

- `git diff --check`: PASS.
- Protected minus-line tripwire emitted only the three `--- a/...` headers for `INVARIANTS.md`, `src/v2/SLICE_12_FOUNDING.md`, and `src/v2/SLICE_19_5_FOUNDING.md`; no removed content.
- Final status is exactly those three protected files, all unstaged. No push, merge, or override was performed.
