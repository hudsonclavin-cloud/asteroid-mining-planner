FRONT-A: COMPLETE
COMMITS: 17 on s20-front-a, tip adda2ab
VERIFY: 360/360 (baseline 356/356)
FINDINGS: none
PROTECTED PENDING: AGENTS.md (additive proof: yes)

# Slice 20 Front A run report

## Commits in order

1. `b4d1bce` W1-1: disclose the derived compare breadth minimum and cell width.
2. `6bf2cfc` W1-2: explain that compare grids are recomputed live for the selection.
3. `8ff32f1` W1-3: use the em dash in the solar-system refresh notice.
4. `cd02dab` W1-4: add the exploratory six-window symmetric-return error disclosure.
5. `5ad9a9b` W1-5: refresh STATUS.md with live bundle names.
6. `6a8b3b4` W2-E1: enforce the V2 import wall for relative, alias, and src/ specifiers.
7. `0078621` W2-E2: count Slice 9 tiers independently from catalog records.
8. `4f6c0e0` W2-E3: independently reimplement the encounter support boundary.
9. `3bf8349` W2-E4: assert the independently derived canonical orbit orientation.
10. `bf0c539` W2-E5/E6: make colormap and copy guards execute production code.
11. `4ce6ee4` W4-1: require typed C3 grid provenance descriptors.
12. `6f08d6f` W4-2 compare: adopt the shared near-zero badge.
13. `a680954` W4-1 compatibility: preserve the characterization fixture with typed descriptors.
14. `4f5e24a` W4-2 porkchop: route feasibility, near-zero, and validation badges through design components.
15. `3fac375` W4-2 catalog: route status and tier badges through the design system.
16. `4bd3244` W4-3: guard badge ownership across V2 surfaces.
17. `adda2ab` W5: rebuild the generated docs assets for Slice 20 Front A.

W6 is the final evidence commit made after this report is copied. Reverting a
workstream means reverting its listed commits in reverse order; W3 is protected
and unstaged, so it has no commit to revert. W1, W2, W4, and W5 are independently
revertible by their listed commit groups. W6 is documentation-only evidence.

## Verification and mutation proofs

- Baseline before work: `npm run verify` passed 107/107 files, 356/356 tests,
  0 failures, and 0 load-timeouts.
- After the porkchop surface: `npm run verify` passed 109/109 files and 359/359
  tests, with 0 failures and 0 load-timeouts.
- Final `npm run verify`: 109/109 files, 360/360 tests, 0 failures, 0
  load-timeouts. The added test is the badge-architecture guard.
- W1-4 mutation: changing `maxAbsErrorKmS` from 5.1 to 5.2 failed
  `tests/v2-symmetric-return.test.mjs:15` with strict deep-equality mismatch
  (`actual ... 5.1`, `expected ... 5.2`). Restored.
- W1-1 mutation: restoring the old breadth expression failed
  `tests/v2-compare-honesty.test.mjs:263:10` with `AssertionError [ERR_ASSERTION]`.
- W1-2 mutation: restoring the cached-grids wording failed
  `tests/v2-compare-honesty.test.mjs:257:10` with `AssertionError [ERR_ASSERTION]`.
- W1-3 mutation: restoring the ASCII hyphen failed
  `tests/v2-ephemeris-hud.test.mjs:114:10` with `AssertionError [ERR_ASSERTION]`.
- W2-E1 mutation: an alias import outside V2 was rejected with the resolved
  `src\\legacy\\outside-v2.js` offender.
- W2-E2 mutation: changing one catalog record to planning changed the expected
  count from 41558/0/348 to 41557/1/348 and failed the test.
- W2-E3 mutation: changing the production boundary from `>=` to `>` failed the
  exact-boundary assertion at `src/v2/porkchop/support-boundary.test.mjs:137`
  with `false !== true`.
- W2-E4 mutation: flipping the obliquity y sign failed 3 of 4 orientation
  assertions.
- W2-E5 mutation: changing `C3_COLOR_MIN` to 2 failed the anchor assertion with
  actual `[59,78,136]` versus expected `[52,98,139]`.
- W2-E6 mutation: changing co-orbital copy to `N-body comparison` failed the
  production-import assertion at `tests/v2-coorbital-disclosure.test.mjs`.
- W4-1 type proof: `tests/v2-c3-value-type.test.mjs` passes a missing-grid
  `// @ts-expect-error` case and tsc succeeds only while the required property
  remains required.
- W4-2 porkchop mutation: returning `MUTATED BADGE` from `FeasibilityBadge`
  failed `tests/v2-design-components.test.mjs:52` with actual `MUTATED BADGE`
  and expected `AMBER`.
- W4-2 catalog mutation: appending `(mutated)` to object-form `StatusBadge`
  labels failed 6 of 9 row tests; for example, the 2018 LA test failed its
  `the tier badge stays` assertion.
- W4-3 architecture mutation: adding `CARD_BADGE_STYLE` to compare failed
  `tests/v2-design-architecture.test.mjs` with the exact offender
  `src/v2/app/compare/main.ts:451: CARD_BADGE_STYLE`.
- All mutations were restored. No strengthened test failed against production;
  FINDINGS is none.

## W1 copy and provenance

CA-1 now says `(a window at least 14.0 days wide: 14.0 days; one cell is
7.00 days)` from the B_min and grid cell width. The old minimum wording is
rejected by the render test.

CA-2 is [UNGATED COPY]. The code had no in-session memo of comparison grids;
`loadLambertScreenCacheAsync()` loads a precomputed screening artifact, while
`computeCompareData()` calls `computePorkchopGrid()` for each selected body.
The badge now says exactly: `Computed live in this browser - live grids
recomputed for this selection; solver timing is not instrumented here.`

CA-3 renders `(coverage ends <END> TDB - refresh due)` with the source `\u2014`
em dash and is covered by the ephemeris HUD test.

CA-4 committed `src/v2/data/symmetric-return-error.json` from the six R3 rows
and `tools/slice20-research/derive-symmetric-error.mjs`. The derived output is
`{"minAbsErrorKmS":0.08,"maxAbsErrorKmS":5.1}`. The porkchop disclosure is
rendered from that artifact, and the test rejects typed derived values in
`src/v2/app/**`.

## W2 table

| Test | Before | Now | Mutation |
| --- | --- | --- | --- |
| E1 `v2-architecture` | checked only relative imports | resolves relative, `@/`, and `src/` imports and enforces the V2 wall | alias to legacy rejected |
| E2 `v2-boundary-slice9` | compared fixture-derived counts | independently counts record tiers and checks the locked distribution | one record changed to planning |
| E3 `support-boundary` | mirrored the specification too closely | independently computes arrival `>=` encounter | production `>=` changed to `>` |
| E4 `v2-core-orbit-sampling` | sampled path without independent orientation | checks four independently rotated vector samples | obliquity y sign flipped |
| E5 `colormap` | compared copied colour logic | imports and checks production colormap anchors | production floor changed |
| E6 copy guards | mostly source-text scans | imports/renders production copy where feasible; retained labelled scans only where required | false co-orbital production copy |

The remaining E6 source scans are explicitly labelled architecture guards for
static HTML/worker contracts or imperative WebGL/dynamic-row boundaries.

## W3 protected AGENTS amendment

The additive proof was run as `git diff -- AGENTS.md | Select-String '^- '`
and printed only `--- a/AGENTS.md`. The appended paragraph is:

`§3 amendment (2026-11-04, Slice 20 DEC-20-13): Claude Code is the execution agent whenever Codex is unavailable. When it executes a dispatch it may build, run tests and edit TypeScript, under exactly the same rules as Codex (§2, §2.1, §4): the dispatch's write scope, explicit staging, no push, no merge, no overrides, no sessions. Any sentence above that says otherwise is superseded by this paragraph.`

It supersedes these pre-existing §3 sentences:

- `Claude Code operates directly in the canonical repo (path in STATUS.md §Identity).`
- Under “does”: `Write and update documentation...`, `Read-only recon...`, and
  `Commit and push documentation changes when Hudson explicitly instructs it to.`
- Under “does not”: `Write TypeScript implementation code...`, `Run npm run
  build, npm test, or any build/test script`, `Edit existing source files other
  than documentation...`, and `Make uncommitted code changes without Hudson's
  direction.`

AGENTS.md stayed unstaged and is the only final working-tree modification.

## W4 F2 remainder

W4-0 found 9 status/tier/feasibility/near-zero/evidence badge or colour
construction sites across catalog, compare, porkchop, and validation card, plus
2 `C3Value` calls and 4 raw C3 formatter sites: below the 40-site halt
threshold. The characterization fixture
`tests/fixtures/v2/f2-rendered-text.json` passed unchanged.

W4-1 added the typed `GridDescriptor` containing span start/end, nDep, nTof,
and departure/TOF step labels. Catalog call sites derive it from the screening
grid; requested-grid callers retain their characterization text.

W4-2 migrated compare, porkchop (including validation STRICT/OBSERVED), and
catalog last. Shared `EvidenceBadge`, `FeasibilityBadge`, `StatusBadge`, and
`NearZeroC3Badge` now own those meanings. W4-3's labelled architecture guard
forbids the old inline helper/style patterns outside
`src/v2/app/design/components/` and includes the production porkchop view.

## Build and evidence

`npm run build` passed. Entry main bundles are:

- `docs/v2/about/`: `aboutV2-ca_cBGJA.js`
- `docs/v2/compare/`: `compareV2-DpGmp5zP.js`
- `docs/v2/porkchop/`: `porkchopV2-BuZQKmsX.js`
- `docs/v2/solar-system/`: `solarSystemV2-C6dR6zLr.js`
- `docs/legacy/`: `legacy-C6NkCVYx.js`

Only generated `docs/` paths were staged for `adda2ab`.

The final `git status --porcelain` before the W6 evidence commit was:

```text
 M AGENTS.md
```

No push, merge, override, or subsession was used. The only surprise was one
initial scope-hook rejection caused by listing `src/v2/porkchop/porkchop-view.ts`
under `src/v2/app/porkchop`; the corrected exact scope committed successfully
without an override.
