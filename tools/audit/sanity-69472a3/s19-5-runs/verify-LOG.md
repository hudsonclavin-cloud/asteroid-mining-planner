# S19.5 A+B independent verification log

## 0. Canonical tripwires

- `pwd`: `C:\\Users\\hudso\\asteroid-mining-planner`
- `origin`: `https://github.com/hudsonclavin-cloud/asteroid-mining-planner.git`
- branch: `s19-5-ab`
- HEAD: `bd9d6f5 build(docs): rebuild for Slice 19.5 Fronts A+B`
- status: exactly ` M src/v2/SLICE_12_FOUNDING.md` and ` M src/v2/SLICE_19_5_FOUNDING.md`
- verification directory created: `%TEMP%\\s19-5-verify`

## 1. Worktree and test runner

- detached worktree: `%TEMP%\\s19-5-verify\\wt` at `bd9d6f5`
- `npm ci`: completed successfully (20 packages added; npm reported 5 audit vulnerabilities)
- one-file command: `node --test --test-timeout=120000 <test-file>`
- source of command: `tools/run-tests.mjs` invokes Node test with `--test-timeout=120000` per file

## 2. Mutation checks V1–V4

- V1 `4a098fb`; SRC: `src/v2/app/about/main.ts`, `src/v2/app/porkchop/validation-card.ts`, `src/v2/data/validation-provenance.json`; TEST: `tests/v2-validation-provenance.test.mjs`; undone: FAIL-as-required, assertion: `AssertionError [ERR_ASSERTION]: The "string" argument must be of type string. Received type undefined (undefined)`; restored: PASS.
- V2 `c7b9ef8`; SRC: `src/v2/app/catalog-list/empty.ts`, `src/v2/app/catalog-list/panel.ts`; TEST: `tests/v2-catalog-empty.test.mjs`; undone: FAIL-as-required (failing assertion output to be captured precisely); restored: PASS.
- V3 `446e3a7`; SRC: `src/v2/app/catalog-list/honesty-disclosure.ts`, `src/v2/app/porkchop/main.ts`; TEST: `tests/v2-derived-span-labels.test.mjs`; undone: FAIL-as-required, assertion: strictEqual actual `2026–2040`, expected `2026-01-01–2040-12-31`; restored: PASS.
- V4 `c9a7476`; SRC: `src/v2/app/catalog-list/honesty-disclosure.ts`; TEST: `tests/v2-coorbital-disclosure.test.mjs`; undone: FAIL-as-required, assertion: input did not match `/patched-conic-versus-patched-conic comparison/`; restored: PASS.
- After each restore, worktree status was clean.

## 4. Claim checks at bd9d6f5

- C1: `git show --stat b25acdc` and `git diff b25acdc~1 b25acdc --output=%TEMP%\\s19-5-verify\\C1.diff -- tools/slice18-research/` completed. The first Node comparison hit `ENOBUFS`, then the required Node UTF-8 comparison was rerun with a larger `maxBuffer` and iterative traversal. Result: added `[]`, removed `[]`, 8 changed existing values; verdict `CHANGED (8 values)`.
- C2: ran `rg -n "B5-F06"` and Node UTF-8 numbered prints for the complete 3d verification record, `INVARIANTS.md` 110-125, and audit ±15 lines. No judgment applied in the quoted section.
- C3: printed every New Glenn/Vulcan R7 anchor row, `launch-vehicles.ts` lines 1-60, and the requested keyword scan. All printed anchors have `basis=official`.
- C4: traced C5-F15 to `c9a7476`; the About catalog count is unchanged since `6575d0d` and uses `SLICE9_NEA_CATALOG_TOTAL_BODIES`; the porkchop grid-span literal was changed by `446e3a7` to derived labels.
- C5: in the canonical repository, `git diff -- src/v2/SLICE_19_5_FOUNDING.md src/v2/SLICE_12_FOUNDING.md | Select-String '^-` returned only the two `--- a/` headers; numstat was 6 and 38 additions, 0 deletions. Full added text was written to `REPORT.md`.
- Report written: `%TEMP%\\s19-5-verify\\REPORT.md`; C1 diff artifact: `%TEMP%\\s19-5-verify\\C1.diff`; C5 diff artifact: `%TEMP%\\s19-5-verify\\C5.diff`.

## 5. Cleanup

- Removed temporary worktree `%TEMP%\\s19-5-verify\\wt` with `git worktree remove --force`.
- Ran `git worktree prune`.
- Final canonical status exactly: ` M src/v2/SLICE_12_FOUNDING.md` and ` M src/v2/SLICE_19_5_FOUNDING.md`.
- Final worktree list contains only the canonical `s19-5-ab` worktree at `bd9d6f5`.

## 3. Mutation checks V5–V8

- V5 `40dc994`; SRC: `src/v2/app/porkchop/main.ts`; TEST: `tests/v2-stack-assumptions.test.mjs`; undone: FAIL-as-required, assertion: input did not match `/Assumptions: ${MISSION_MODE_LABELS[selectedMode]}; impulsive, patched-conic, no gravity assists, no SEP; 200 km circular LEO/`; restored: PASS.
- V6 `07e1670`; SRC: `src/v2/app/about/main.ts`; TEST: `tests/v2-about-evidence.test.mjs`; undone: FAIL-as-required, assertion: input did not match `/anchor: '8-engineering-record-running-log'/`; restored: PASS.
- V7 `ab61d82`; SRC: `src/v2/app/compare/main.ts`, `src/v2/app/solar-system/runtime.ts`; TEST: `tests/v2-shortcut-and-method.test.mjs`; undone: FAIL-as-required, assertion: input did not match `/['right-drag / middle-drag / Shift+drag', 'pan the view']/`; restored: PASS.
- V8 `f77d947`; SRC: `src/v2/app/catalog-list/row.ts`; TEST: `src/v2/app/catalog-list/row.test.mjs`; undone: FAIL-as-required, assertion: `The expression evaluated to a falsy value`; restored: PASS.
- After each restore, worktree status was clean.
