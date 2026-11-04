# Slice 20 Front A COPY_DIFF

## W1-1 CA-1

Before (`src/v2/app/compare/main.ts:839`):

```text
(a window at least ${B_MIN_CELLS} departure cells wide, ${formatDays((B_MIN_CELLS - 1) * echo.depCellDays)} d)
```

After:

```text
(a window at least ${B_MIN_CELLS} departure cells wide: ${formatDays(B_MIN_CELLS * echo.depCellDays)} days; one cell is ${formatDays(echo.depCellDays)} days)
```

The render test proves the derived 14.0-day minimum and 7.00-day cell width,
and rejects the old minimum wording. Restoring the old production expression
failed `tests/v2-compare-honesty.test.mjs:263:10`.

## W1-2 CA-2 [UNGATED COPY]

Recon found no in-session memo of comparison grids: `loadLambertScreenCacheAsync()`
loads a precomputed screening artifact, while `computeCompareData()` calls
`computePorkchopGrid()` for each selected body. The prior `< 1 ms (cached grids)`
badge was false.

Before (`src/v2/app/compare/main.ts:194,917`):

```text
< 1 ms (cached grids)
Computed live in this browser - ${formatComputeTime(props.totalComputeMs)} of solver time for this comparison.
```

After:

```text
Computed live in this browser - live grids recomputed for this selection; solver timing is not instrumented here.
```

The render test asserts the mechanism; restoring the cached-grids wording failed
`tests/v2-compare-honesty.test.mjs:257:10`.

## W1-3 CA-3

Before (`src/v2/app/solar-system/ephemeris-status.ts:37`):

```text
(coverage ends ${args.coverageEndDate} TDB - refresh due)
```

After:

```text
(coverage ends ${args.coverageEndDate} TDB \u2014 refresh due)
```

The existing ephemeris HUD test asserts the visible em dash. Restoring the ASCII
hyphen failed `tests/v2-ephemeris-hud.test.mjs:114:10`.

## W1-4 symmetric-return disclosure

Added `src/v2/data/symmetric-return-error.json` with the six R3 rows and
`status: "exploratory, unvalidated"`. Added
`tools/slice20-research/derive-symmetric-error.mjs`; output:

```json
{"minAbsErrorKmS":0.08,"maxAbsErrorKmS":5.1}
```

The porkchop loads this committed artifact and renders the sample-return notice
from its derived values. `tests/v2-symmetric-return.test.mjs` checks script and
artifact equality and rejects the derived range in `src/v2/app/**`.
Changing `maxAbsErrorKmS` to 5.2 failed at line 15 with strict deep-equality
mismatch (`actual ... 5.1`, `expected ... 5.2`); the artifact was restored.

## W1-5 STATUS

The live bundle line was refreshed to the built V2 names in commit `5ad9a9b`.

## W4 F2 copy/result

`tests/fixtures/v2/f2-rendered-text.json` passed unchanged. The shared design
components now own the meanings formerly constructed inline:

- `EvidenceBadge`: validation STRICT/OBSERVED.
- `FeasibilityBadge`: porkchop DLA and mission-card bands.
- `StatusBadge`: catalog status and L0/L1/L2 tier chips.
- `NearZeroC3Badge`: catalog, compare, porkchop, and porkchop-view near-zero chips.
- `C3Value`: requires a typed descriptor derived from the producing grid.

W4-0 found 9 badge/color construction sites, 2 C3Value calls, and 4 raw C3
formatter sites, below the 40-site halt threshold. The W4-3 architecture guard
rejects the old badge helper/style patterns outside
`src/v2/app/design/components/`.
