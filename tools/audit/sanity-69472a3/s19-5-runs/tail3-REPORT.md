TAIL3: COMPLETE
COMMITS: 4, tip 7463262
VERIFY: 107/107 (baseline 355/355)
PROTECTED PENDING: none

Slice 19.5 Tail 3 completed on branch s19-5-tail2 from clean baseline 757df49.

Commits in this tail:
- d6a7447 fix(porkchop): explain cost and stack margin bases
- 3880156 fix(porkchop): caption RED payload-at-C3 figure
- b517fb9 fix(solar-system): describe out-of-coverage scrubbed time
- 7463262 build(docs): rebuild after S19.5 tail 3

G1 — margin-base explanation
- Production: `src/v2/app/porkchop/main.ts:164,902-903,1008-1009` derives the displayed percentages from `DETERMINISTIC_MARGIN_FRACTION` and `DV_MARGIN_FRACTION`.
- Test: `tests/v2-dla-render.test.mjs:360-369,435-436,510-511` imports the compiled production constants and checks both one-way and sample-return rendered surfaces.
- `node --test tests/v2-dla-render.test.mjs`: 1 pass, 0 fail.
- Mutation proof: removing the G1 source additions failed the test at the new `assert.ok(pinnedText.includes(costMarginSentence), pinnedText)` assertion with `AssertionError [ERR_ASSERTION]`; restoring the source passed.

G2 — RED payload-at-C3 caption
- Production: `src/v2/app/porkchop/main.ts:860` renders `Vehicle payload at this C3, before any dogleg or launch-site penalty. Not a delivered-mass estimate.` only when `costCardState.band === 'RED'`.
- Test: `tests/v2-dla-render.test.mjs:294,440-452` exercises AMBER, GREEN, and RED cells and checks the caption and the existing honest RED verdict.
- `node --test tests/v2-dla-render.test.mjs`: 1 pass, 0 fail.
- Mutation proof: removing the RED caption failed at `tests/v2-dla-render.test.mjs:451` with `AssertionError [ERR_ASSERTION]` from `assert.ok(redText.includes(redPayloadCaption), redText)`; restoring the source passed.

G3 — outside-coverage scrubbed status
- Production: `src/v2/app/solar-system/ephemeris-status.ts:38-42` derives outside-coverage status from `wallClockTdbSeconds`, `timeMin`, and `timeMax`, and uses `shiftNHelpText(args)` to describe the actual Shift+N destination.
- Test: `tests/v2-ephemeris-hud.test.mjs:87-95` checks past-coverage, before-coverage, and inside-coverage scrubbed text.
- `node --test tests/v2-ephemeris-hud.test.mjs`: 3 pass, 0 fail.
- Mutation proof actual/expected excerpt: actual `SCRUBBED — press Shift+N for now`; expected `SCRUBBED — live time is outside this view's ephemeris coverage; Shift+N will jump to the end of coverage (live time is outside it)`; the mutated test failed, and restoring the source passed.

Verification gates:
- Baseline `npm run verify`: 107/107 files, 355/355 tests, 0 failures.
- After G1 `npm run verify`: 107/107 files, 355/355 tests, 0 failures.
- After G2 `npm run verify`: 107/107 files, 355/355 tests, 0 failures.
- After G3 `npm run verify`: 107/107 files, 355/355 tests, 0 failures.
- `npm run build`: PASS; generated docs-only output. Vite emitted the expected large-chunk warning; no build failure.

Build output changed only docs assets and entrypoints, committed in 7463262. Evidence commit is created after this report and copies this report, the run log, and the copy diff byte-for-byte.

Final pre-evidence tree: clean except the temporary evidence files outside the repository. No push performed.
