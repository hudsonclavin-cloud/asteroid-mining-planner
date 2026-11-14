FIX: COMPLETE
COMMITS: 3, tip 968e463 (evidence commit is the final step)
VERIFY: 111/111 files, 370/370 tests
BUNDLES: aboutV2-DL_Fcx9X.js, compareV2-Cp2qYnlC.js, porkchopV2-CFFmNnms.js, solarSystemV2-Bn5gSTtQ.js
PROTECTED PENDING: same six files as Phase 0; all byte hashes unchanged

# S20 sweep fix report

Run date: 2026-11-13. Branch: `s20-text-sweep`. No push, merge, override,
sub-agent, or additional session was used. The six protected working-tree
files were not edited, staged, stashed, or restored.

## Fixes

1. `f786b13 test(catalog): move threshold-disclosure test inside the import wall`
   moved `src/v2/app/catalog-list/threshold-disclosure.test.mjs` to
   `tests/v2-catalog-threshold-disclosure.test.mjs`, preserving every
   assertion. The test now uses the permitted `tests/helpers/run-tsc.mjs` path.
2. `289f19c fix(catalog): render LOW C3 threshold through the C3 display owner`
   replaced the direct `formatC3` import with `C3Value` and a typed descriptor;
   `includeGrid: false` preserves the exact visible sentence:
   `LOW C3: below 25.0 km²/s² (the screening threshold)`.
3. `968e463 build(docs): rebuild after Slice 20 text sweep` rebuilt only the
   changed `docs/` payload.
4. W12 evidence commit, after this report snapshot:
   `docs(research): Slice 20 sweep fix run evidence`.

## Guard mutation proofs

- Import wall: a temporary in-wall probe importing
  `../../../../tests/helpers/run-tsc.mjs` caused
  `node --test tests/v2-architecture.test.mjs` to fail at
  `tests\\v2-architecture.test.mjs:60:1` with
  `src\\v2\\app\\catalog-list\\threshold-disclosure.guard-probe.test.mjs -> ../../../../tests/helpers/run-tsc.mjs (tests\\helpers\\run-tsc.mjs)`.
  The guard showed that probe in `actual` and `expected: []`; the probe was
  removed. The moved test then passed the unchanged guard.
- C3 owner: with the pre-fix direct `formatC3` call, the unchanged
  `tests/v2-design-architecture.test.mjs:9:1` guard failed with actual
  `[ 'C:\\Users\\hudso\\asteroid-mining-planner\\src\\v2\\app\\catalog-list\\threshold-disclosure.ts:5' ]`
  and expected `[]`. The fix routes through `C3Value`; no architecture guard
  exception or weakened assertion was added.
- Focused post-fix run passed 6/6, including the CK-13 render test and both
  architecture guards.

## Full verification and build

`npm run verify` passed 111/111 files, 370/370 tests, 0 failures, and 0
load-timeouts. The corrected test ran from `tests/v2-catalog-threshold-disclosure.test.mjs`.

`npm run build` passed with Vite 5.4.21. Entry bundles are:

- `aboutV2-DL_Fcx9X.js`
- `compareV2-Cp2qYnlC.js`
- `porkchopV2-CFFmNnms.js`
- `solarSystemV2-Bn5gSTtQ.js`

## Protected hash proof

| File | Phase-0 SHA-256 | After build SHA-256 |
|---|---|---|
| `src/v2/core/constants/physical.ts` | `045849e87162e163ea5bf8cb318acff621720aed2b63eaa0472bbbf7259c6ef6` | same |
| `src/v2/core/propagators/keplerian.ts` | `857ec82e4829776e3b4136c41c47f5319afb47c525d8948279ed52e2aed0c9d8` | same |
| `INVARIANTS.md` | `e7709d69504d7d6d84df09f84ef47d26c9d863cb6d70e3b161c2eecd05af7fe2` | same |
| `SLICE_17_FOUNDING.md` | `039d0ae6efe8f5852de3bb494d200b6b6b50522466bc6ad5069496cbf5752489` | same |
| `src/v2/SLICE_13_FOUNDING.md` | `552800ffd7a6adfc72bf6bc79fd50934b737f7220eb736a6c694290b19bdcfe4` | same |
| `src/v2/SLICE_18_FOUNDING.md` | `d97fc26153344943777b04f66d869d0f986c66a58ac7299e0d30bae94c316e31` | same |

Current status is intentionally the same six protected entries and no staged
files. Hudson's hand-commit blocks are printed in the final handoff; they are
not executed by this run.
