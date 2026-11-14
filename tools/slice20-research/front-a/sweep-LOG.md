# S20 text sweep log — 2026-11-13

- Phase 0 passed: canonical repository was clean on `main`, remote was the expected GitHub repository, `main` fast-forwarded to `origin/main` at `0d31cda`, and the kept stash was left untouched.
- Baseline `npm run verify` passed: 109/109 files, 363/363 tests, 0 failures, 0 load-timeouts.
- Created tag `s20-pre-text-sweep` and branch `s20-text-sweep`.
- W1 K1-K4 production changes are in the working tree: mode-owned margin copy,
  shared spacecraft budget total, injection accounting disclosure, and grouped
  m/s formatting. Focused tests passed 29/29 after the test expectation update.
- K1 mutation proof: restoring both margin sentences to the old always-
  rendezvous-and-departure wording failed `tests/v2-dla-render.test.mjs:452:12`
  because the one-way cost-card sentence was absent; the captured assertion
  showed the rendered one-way sentence still incorrectly named departure.
- Focused W2/W3 run initially exposed a missing `useCallback` import in the
  K7 pin callback; the import was restored before further verification.
- W4 mutation proof: a temporary `2040-01-01` comment in
  `src/v2/app/ui-overlay/overlay.ts` failed `tests/v2-architecture.test.mjs:126:1`
  with `literal 2040-01-01 outside grid-span.ts/tests: src/v2/app/ui-overlay/overlay.ts`;
  the probe was removed.
- Committed W4 at `e861e7e` (`refactor(grid): centralize porkchop departure span`).
  `src/v2/app/compare/main.ts` also carries the already-prepared typed-grid
  display wiring because that file is shared by W3 and W4; the W3 test guard
  remains in the working tree for its own commit.
- W3 architecture mutation proof: a temporary `formatC3ValueText(` marker in
  `src/v2/app/porkchop/main.ts` failed `tests/v2-design-architecture.test.mjs:9:1`
  with the offending location at `main.ts:2`; the probe was removed.
- K7 mutation proof: removing the direct parent callback from `pinCell` failed
  `tests/v2-porkchop-honesty.test.mjs:428:1`; the assertion was `1.2 !== 1.1`
  at line 471 while the replacement computation was still pending. The callback
  was restored.
- K9 mutation proof: removing the compare near-zero mass caveat failed
  `tests/v2-compare-honesty.test.mjs:108:1`; line 120 reported the missing
  `C3 is near zero here: the payload and delivered mass are mathematically valid but operationally meaningless.`
  sentence. The caveat was restored.
- K8 mutation proof: replacing `displayBodyLabel(body.name, body.designation)`
  with the raw name in `src/v2/app/porkchop/main.ts` failed
  `tests/v2-dla-render.test.mjs:345:1`, assertion line 431, because the render
  contained `Target: (2020 FK3)` instead of `Target: 2020 FK3`. The helper use was restored.
- K2 mutation proof: removing the 100 m/s deterministic margin from the shared
  compare budget failed `tests/v2-compare-data.test.mjs:346:1` at line 356 with
  `1150 !== 1250`; the shared helper and margin were restored.
- K3 mutation proof: replacing the launch-injection accounting disclosure with
  `mutation probe` failed `tests/v2-dla-render.test.mjs:345:1` at line 452;
  the added assertion required the verbatim injection disclosure. The line was restored.
- K4 mutation proof: replacing the rendezvous `formatMps` call with
  `toFixed(0)` failed `tests/v2-dla-render.test.mjs:345:1` at line 457 because
  the rendered line lacked the comma-separated m/s value; the formatter was restored.
- W5 mutation proof: restoring the old Vandenberg legend wording failed
  `tests/v2-dla-render.test.mjs:345:1` at line 530 because the expected
  `max direct declination (ceiling): none - direct launches from Vandenberg SFB reach every declination (minimum inclination 70.0°)` was absent. The wording was restored.
- K4 mutation proof: replacing the pure model's division by
  `SPEED_OF_LIGHT_M_PER_S` with `/ 2` failed
  `tests/v2-light-time.test.mjs:28:1` at line 33 (`74798935350` versus
  `499.00478383615643`); the exact constant division was restored.
- W8 CK-12 mutation proof: replacing the catalog row's shared `C3Value` path
  with `toFixed(3)` failed `src/v2/app/catalog-list/row.test.mjs:307:1`; the
  assertion was `55.5 must render as 55.5` and the rendered text was
  `C3 55.500 km²/s² (cached screen: 7 d × 30 d steps)`. The shared path was restored.
- W8 CK-13 mutation proof: removing `(the screening threshold)` from the
  cache-derived LOW C3 legend failed `src/v2/app/catalog-list/threshold-disclosure.test.mjs:11:1`;
  the assertion showed actual `LOW C3: below 25.0 km²/s²` versus expected
  `LOW C3: below 25.0 km²/s² (the screening threshold)`. The disclosure was restored.
- W8 CK-14 mutation proof: removing the DLA checkbox id failed
  `tests/v2-dla-render.test.mjs:345:1` at line 425 with `CK-14 input must have an id`.
  The id was restored. The passing fake-DOM check covers every input/select/textarea
  rendered by the porkchop page; all catalog and compare control declarations also
  now carry explicit id and name pairs.
- W8 CK-12/13/14 focused tests pass: 12/12 in
  `src/v2/app/catalog-list/row.test.mjs`,
  `src/v2/app/catalog-list/threshold-disclosure.test.mjs`, and
  `tests/v2-dla-render.test.mjs`.

## W10 — STATUS refresh

- Refreshed `STATUS.md` from command output on 2026-11-13 before the STATUS
  commit: origin/main `0d31cda`; local pre-STATUS tip `1691d96`; measured lag
  `git rev-list --count 0d31cda..1691d96` = 14.
- Refreshed the deploy-boundary entry bundles to `aboutV2-DL_Fcx9X.js`,
  `compareV2-F3OpNprt.js`, `porkchopV2-V_mxVt_g.js`, and
  `solarSystemV2-C6dR6zLr.js`.
- Recorded Slice 20 as in progress, with W6 core and W9 protected edits
  intentionally unstaged. No push or merge was performed.

## W11 — verify attempt 1

- `npm run verify` reached the full test runner but failed in
  `tests/v2-architecture.test.mjs:60:1`.
- Exact assertion: `src/v2 import wall violations:`
  `src\\v2\\app\\catalog-list\\threshold-disclosure.test.mjs -> ../../../../tests/helpers/run-tsc.mjs (tests\\helpers\\run-tsc.mjs)`.
- The test runner reported `✖ src/v2 sources do not import internal modules outside src/v2`;
  actual contained the threshold-disclosure test import and expected was `[]`.
- This is the first W11 verification attempt; no uncommitted work was changed.

## W11 — verify attempt 2 / item halt

- The second `npm run verify` reproduced the same import-wall failure and also
  failed the design architecture guard. Final summary: `files discovered: 111`,
  `files passed: 109`, `files failed: 2`, `files LOAD-TIMEOUT: 0`,
  `tests passed: 368`, `tests failed: 2`.
- Failure 1: `tests\\v2-architecture.test.mjs` — the new
  `src\\v2\\app\\catalog-list\\threshold-disclosure.test.mjs` imports
  `../../../../tests/helpers/run-tsc.mjs`.
- Failure 2: `tests\\v2-design-architecture.test.mjs` —
  `src/v2/app/catalog-list/threshold-disclosure.ts:5` directly imports
  `formatC3`, violating the C3Value ownership guard.
- W11 verify/build is halted after the required two attempts. No build or docs
  commit was made; W12 evidence remains required. Protected work is unchanged.

## W12 — evidence preparation

- Final `REPORT.md` records the partial result, all 15 pre-evidence commits,
  the two W11 guard failures, W7 payload sizes/classifications, W8/W9 status,
  and every pending protected addition with its additive proof and hand-commit
  block.
- Final `COPY_DIFF.md` records W1-W10 copy dispositions and the W11 halt; no
  `[UNGATED COPY]` strings were introduced.
- Evidence copies are staged only after byte/hash equality is checked. No
  protected path is included in the evidence scope.
