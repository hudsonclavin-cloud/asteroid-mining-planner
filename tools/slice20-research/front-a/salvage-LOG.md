# S20 A salvage log - 2026-11-11

- Phase 0 passed: canonical repo, remote, clean `main`, and current `origin/main` `b902c59`.
- `origin/infra/next-slice-scaffold-20261106` resolves to `b1f3f879...`, satisfying the required `b1f3f87` prefix.
- Baseline `npm run verify`: 109/109 files, 360/360 tests, 0 failures, 0 load-timeouts.
- Branch created: `s20-a-salvage`.
- Post-cherry-pick `npm run verify`: 109/109 files, 360/360 tests, 0 failures, 0 load-timeouts.
- CS-1 committed as `9ebe7a3` (`fix(porkchop): AMBER copy per copy rules (no caps, no promise)`).
- CS-1 focused test passed: `node --test tests/v2-dla-render.test.mjs` (1/1).
- CS-1 mutation proof passed: restoring `NOT modelled` and `modelled yet` made the focused test fail at
  `tests/v2-dla-render.test.mjs:436:12` with `AssertionError [ERR_ASSERTION]: The input did not match the regular expression /Dogleg penalty0 m\\/s ΔV \\(plane-matching absorbed by launch geometry — AMBER\\); the launch-site payload penalty is not modelled/`.
- T1 committed as `d451db3` (`fix(compare): reconcile delivered mass with payload and delta-v budget`).
- T1 focused render/data tests passed: `tests/v2-compare-honesty.test.mjs` and `tests/v2-compare-data.test.mjs` (26/26 combined).
- T1 mutation proof passed: nulling the result payload-at-C3 field made `tests/v2-compare-data.test.mjs` fail at line 355 with
  `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: null !== 9250`.
- T7 committed as `b1a2a2a` (`fix(compare): report measured solver timing in method badge`).
- T7 focused timing tests passed in the same 26/26 combined run: injected clock 10→40 produced 30 ms; missing timing produced the refusal copy.
- T7 mutation proof passed: restoring the refusal formatter made W3b and T7 fail; W3b expected `1.0 ms of solver time for this selection`, and T7 expected `30.0 ms of solver time for this selection`.
- T5 committed as `15d89e0` (`fix(ui): keep internal asteroid slugs out of visible copy`).
- T5 render tests passed: `tests/v2-dla-render.test.mjs` and `tests/v2-compare-honesty.test.mjs` (8/8 combined).
- T5 mutation proof passed: restoring both compare row slug spans and both porkchop slug labels made W3a and DLA render fail at their `assert.doesNotMatch(..., /asteroid-[0-9A-Z]/)` assertions; W3a input included `Apophisasteroid-99942`, and DLA input included `Porkchop Analysis(2020 FK3)asteroid-2020 FK3`.
- Final `npm run verify` retry passed: 109/109 files, 363/363 tests, 0 failures, 0 load-timeouts. The preceding clean-process attempt had four environmental load-timeouts; no assertion failures occurred.
- `npm run build` passed. Generated bundle names: `aboutV2-DL_Fcx9X.js`, `compareV2-F3OpNprt.js`,
  `porkchopV2-V_mxVt_g.js`, and `validation-provenance-DUvzvU-t.json`; the three V2 HTML entrypoints were updated.
- Evidence copies were made byte-verbatim. Initial SHA-256 matches: REPORT
  `A5F20BC0F1E7E58A224032F0FBB7001B84F7AF035C941D1DC4562186DDE105F0`, COPY_DIFF
  `130574E2B47618F5DF96010487AE14A08534B4B09004852F4C3D03EACAB70419`, and
  the pre-hash LOG `809EAA03F83DD935CCEDA121BDBD1713AFB105FDAB4F2F1DDBEA7F1BEE91727E`.
