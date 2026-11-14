# S20 sweep fix log - 2026-11-13

- Phase 0 passed: canonical repo `C:\Users\hudso\asteroid-mining-planner`,
  expected remote, branch `s20-text-sweep`, HEAD `7064cbe`, and status showed
  exactly the six protected working-tree files. The kept stash was untouched.
- Protected SHA-256 baseline:
  - `src/v2/core/constants/physical.ts` `045849e87162e163ea5bf8cb318acff621720aed2b63eaa0472bbbf7259c6ef6`
  - `src/v2/core/propagators/keplerian.ts` `857ec82e4829776e3b4136c41c47f5319afb47c525d8948279ed52e2aed0c9d8`
  - `INVARIANTS.md` `e7709d69504d7d6d84df09f84ef47d26c9d863cb6d70e3b161c2eecd05af7fe2`
  - `SLICE_17_FOUNDING.md` `039d0ae6efe8f5852de3bb494d200b6b6b50522466bc6ad5069496cbf5752489`
  - `src/v2/SLICE_13_FOUNDING.md` `552800ffd7a6adfc72bf6bc79fd50934b737f7220eb736a6c694290b19bdcfe4`
  - `src/v2/SLICE_18_FOUNDING.md` `d97fc26153344943777b04f66d869d0f986c66a58ac7299e0d30bae94c316e31`

## CK-13 guard proof 1

- A temporary probe under `src/v2/app/catalog-list/` imported
  `../../../../tests/helpers/run-tsc.mjs`.
- `node --test tests/v2-architecture.test.mjs` failed at
  `tests\\v2-architecture.test.mjs:60:1` with:
  `src\\v2\\app\\catalog-list\\threshold-disclosure.guard-probe.test.mjs -> ../../../../tests/helpers/run-tsc.mjs (tests\\helpers\\run-tsc.mjs)`.
- The assertion reported `src/v2 import wall violations` with the probe in
  `actual` and `expected: []`. The probe was removed.

## CK-13 guard proof 2

- With the pre-fix direct `formatC3` call still present,
  `node --test tests/v2-design-architecture.test.mjs` failed at
  `tests\\v2-design-architecture.test.mjs:9:1`.
- Exact guard evidence: `C3 formatting is owned by C3Value outside the pure formatter`;
  actual was `[ 'C:\\\\Users\\\\hudso\\\\asteroid-mining-planner\\\\src\\\\v2\\\\app\\\\catalog-list\\\\threshold-disclosure.ts:5' ]`,
  expected was `[]`.
- The fix routes threshold formatting through `C3Value` with grid metadata
  hidden from this prose via `includeGrid: false`; no guard was weakened.

- Focused proof after the fix passed 6/6: the import-wall guard, CK-13 render
  test, C3 ownership guard, and their companion assertions.

## Commits

- `f786b13 test(catalog): move threshold-disclosure test inside the import wall`
- `289f19c fix(catalog): render LOW C3 threshold through the C3 display owner`

## Full verification

- `npm run verify` passed: 111/111 files, 370/370 tests, 0 failures, 0
  load-timeouts. The corrected CK-13 test ran as
  `tests\\v2-catalog-threshold-disclosure.test.mjs`; both architecture guards
  passed in the full run.

## Build

- `npm run build` passed with Vite 5.4.21.
- Entry bundles after build: `aboutV2-DL_Fcx9X.js`,
  `compareV2-Cp2qYnlC.js`, `porkchopV2-CFFmNnms.js`, and
  `solarSystemV2-Bn5gSTtQ.js`.
- Only build output under `docs/` was selected for the build commit; the six
  protected files remained unstaged.

## Protected hash check

- After both commits and the docs build, all six protected SHA-256 values equal
  their Phase-0 values. The current porcelain is exactly the same six entries:
  five tracked modifications and the untracked `physical.ts`.
