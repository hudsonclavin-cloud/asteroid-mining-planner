# Slice 20 Front A COPY_DIFF, attempt 1

No copy was changed. The run stopped in W0 on global tripwire (a) before W1 began.

| Item | Before | After |
|---|---|---|
| CA-1 compare breadth qualifier | not started | not started |
| CA-2 compare method badge | not started | not started |
| CA-3 coverage notice (em dash) | not started | not started |
| CA-4 symmetric-return disclosure | not started | not started |

Strings at HEAD (read-only preflight; unchanged by this run):
- CA-1, `src/v2/app/compare/main.ts:839`: `(a window at least ${B_MIN_CELLS} departure cells wide, ${formatDays((B_MIN_CELLS - 1) * echo.depCellDays)} d)`
- CA-2, `src/v2/app/compare/main.ts:194`: `'< 1 ms (cached grids)'`; and `:904`: `Switching modes recomputes every grid live in this browser.`
- CA-3, `src/v2/app/solar-system/ephemeris-status.ts:37`: `(coverage ends ${args.coverageEndDate} TDB - refresh due)` (ASCII hyphen)
- CA-4, `src/v2/app/porkchop/main.ts:1004`: the `departure = arrival v∞ under the symmetric-return assumption; ` clause inside the Assumptions template literal

No [UNGATED COPY] string was produced.
