# S19.5 FIX1 report

FIX1: COMPLETE | STOPPED(None)
COMMITS: 3, tip a697963
VERIFY: 96/96
F2 BRANCH: (a) tests/fixtures/v2/nea-catalog-slice9.json (catalog.totalBodies)
PROTECTED PENDING: P1, P2, P3 (additive proof: yes)

## Commits

- `5a2f9b2 fix(v2/porkchop): drop unsourced per-degree plane-matching figure (B5-F06)`
- `20fb6ce fix(v2/about): bind catalog count to committed data (C5-F17)`
- `a697963 build(docs): rebuild after S19.5 FIX1`

No push, merge, or override was performed.

## Verification

- Baseline before FIX1: `npm run verify` passed 96/96 files, 336 tests, 0 failures, and 0 load timeouts.
- F1 mutation proof: `tests/v2-dla-display.test.mjs` failed before the source fix because the rendered string matched `/m\/s[- ]per[- ]degree/`; after the fix it passed 2/2.
- F2 mutation proof: `tests/v2-public-copy.test.mjs` failed before the source fix because About did not match `/loadSlice9NeaCatalogFixture/`; after the fix it passed 2/2.
- F3 `npm run verify`: passed 96/96 files, 337 tests, 0 failures, and 0 load timeouts (`VERIFY_EXIT=0`). The count increased by one for the new F2 guard.
- F3 `npm run build`: passed (`BUILD_EXIT=0`).
- F4 `git diff --check`: clean. The protected minus-line tripwire showed only the three `--- a/...` headers; no HEAD content was removed or changed.

## F1 search classification

Search: `rg -n -i 'per-degree|m/s-per|DESCANSO' src/v2 v2`

- `src/v2/SLICE_13_FOUNDING.md`: founding text; left for the protected founding-text correction.
- `src/v2/SLICE_19_5_FOUNDING.md`: founding text; corrected in P1.
- `src/v2/app/porkchop/main.ts:899`: rendered UI; corrected in F1.
- `src/v2/research/slice-16-redirect-capture/perplexity-cislunar-orbit-tradeoffs.csv`: research capture, not rendered; left unchanged.

The F1 UI now says `launch-geometry class; below screening error bars` and does not present the unsourced numeric per-degree figure. Copy evidence is recorded in `%TEMP%\\s19-5-fix1\\COPY_DIFF.md`.

## F2 implementation

The About page now imports `loadSlice9NeaCatalogFixture()` and renders `catalog.catalog.totalBodies` from the committed `tests/fixtures/v2/nea-catalog-slice9.json` artifact. It shows `the committed catalog` until the loader resolves rather than carrying a duplicated literal.

## Docs rebuild

New generated bundle names:

- `aboutV2-C7aAKTpm.js`
- `compareV2-ChD57Qk-.js`
- `loader-0pYr7Ryi.js`
- `porkchop-view-CyUIMKrU.js`
- `porkchopV2-C9ZO7rAw.js`
- `solarSystemV2-C923eaKO.js`
- `store-DB8kCCWo.js`
- `tier-assignments-DxW11nAj.js`

The prior hashed bundles were removed/replaced by the build, and the four affected HTML entrypoints were updated. The docs commit contained only `docs/` paths; the two pre-existing founding files were not staged.

## Protected pending text

### P1 — `src/v2/SLICE_19_5_FOUNDING.md`

```text
- B5-F06 "~1 m/s-per-degree": CONFIRMED (the audit is right). The committed
  evidence (tools/slice13-research/literature/3d-verification-record.md:22)
  gives no per-degree number and says the DESCANSO lunar result is "not a
  liftable formula for interplanetary DLA pricing"; the figure appears only in
  the project's own synthesis (:31). The batch's REFUTED verdict cited the
  figure's existence, not its applicability; overturned by the independent
  verify run (S19_5_AB_VERIFY). UI number removed (5a2f9b2); INVARIANTS note
  appended.
- R13 INV-025: the bare "(OQ-7)" identifier removed (c9a7476). INV-026: the
  porkchop span literal is derived (446e3a7); the About catalog count is
  bound to the committed catalog by loader (`tests/fixtures/v2/nea-catalog-slice9.json`
  `catalog.totalBodies`) (20fb6ce).
- Evidence correction (B2, b25acdc): tools/slice18-research/tier-sizing.mjs
  labelled 7 measured bodies (105140, 1979 XB, 2010 KD, 2021 CG6, 2024 BB8,
  2025 KP4, 433) "unmeasured"; the generator was fixed and the JSON
  regenerated. No keys were added or removed, and the only other changed value
  is generatedAtUtc, so every measured value reproduced exactly. Slice 18 text
  citing the old counts is DOC-ANNOTATE (Slice 24).
- Process record: the A+B batch report attributed B8a's test proof to
  tests/v2-fk3-guided-tour.test.mjs, which cannot fail for B8a; the real guard
  is tests/v2-dla-display.test.mjs. An independent mutation run proved all 12
  guards the batch left unproven (V1-V12).
```

### P2 — `src/v2/SLICE_12_FOUNDING.md`

```text
is presentation (base-heatmap legibility). Under ruling R5 a presentation
rationale maps to ON: showing the launch constraint by default outweighs
heatmap legibility, and the toggle still clears the overlay.
```

### P3 — `INVARIANTS.md`

```text
NOTE (Slice 19.5, 2026-10-14; audit B5-F06): the committed evidence
(tools/slice13-research/literature/3d-verification-record.md:22) gives no
per-degree figure and states that the DESCANSO lunar result is not a liftable
formula for interplanetary DLA pricing. The "~1 m/s-per-degree" figure above
is therefore unsourced. The shipped AMBER disclosure states the qualitative
claim only (launch-geometry class, below screening error bars).
```

These three files remain unstaged and intentionally pending for the next merge step.

## Surprises

- The full verify harness emits existing browser-test warnings for root-relative `/lambert-screen-cache.json` and `/tier-sizing-per-body.json`, plus a Phase C fetch fallback; all affected tests passed and the final accounting was green.
- Vite reports the existing large-chunk warning for chunks over 500 kB; the production build still passed.
- The required `.dispatch-scope` file is tracked in the repository; it was restored to its HEAD content after the docs commit and is clean in the final status.
