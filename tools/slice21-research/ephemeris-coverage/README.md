# Slice 21 pre-research — ephemeris coverage boundary

**What was measured.** The end of the long-span inner-system Horizons series the porkchop, compare and overlay pages
load (`src/v2/data/horizons-inner-solar-system-2026-2040.json`), through the PRODUCTION loader
`ingestSlice2Fixture` (`src/v2/boundary/horizons.ts`) — not a reimplementation. Per body: sample count, first/last
JD (TDB) and calendar date, cadence. For the file: bytes on disk, sha256, and the committed blob size. For the porkchop
grid (`GRID_PARAMS`, nDep × nTof, TOF range; departure span from `src/v2/porkchop/grid-span.ts`): the first departure
column whose arrival epoch falls past coverage, reported for 433, 99942 and 101955. The grid is body-independent, so
the three answers are identical and the JSON says so.

**Result.** `tools/slice21-research/data/ephemeris-coverage.json` (written by side-file + atomic rename). The verbatim
JSON is also in the dispatch report of 2026-11-06.

**How to re-run** (repo root; compiles into the gitignored `.tmp-tests/`; nothing else is written):

```bash
node tools/slice21-research/ephemeris-coverage/measure.mjs
```

**What a 2050 extension would cost in bytes — an estimate.** The JSON's `extensionEstimates` extrapolate the measured
bytes/day linearly to each candidate end date (OQ-20-3's 2044-12-31 / 2049-12-31 / 2052-01-01, plus 2050-12-31) at the
same daily cadence and six-body set. Label it an estimate: record length varies with digit count, and a regenerated
fixture may change precision or body set. The real number is measured only by regenerating (Slice 21 Front A, H0).

**Conventions.** Calendar dates are the page's own convention (`jdTdbToUtcDateString` in `src/v2/app/porkchop/main.ts`:
TDB − 69.184 s rendered as a UTC date). `GRID_PARAMS` lives in the page module, which boots a DOM on import, so its four
numbers are read from source text and the JSON records that (`grid.readFrom`).
