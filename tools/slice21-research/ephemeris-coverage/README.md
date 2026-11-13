# Slice 21 pre-research — ephemeris coverage boundary

**What was measured.** The end of the long-span inner-system Horizons series the porkchop, compare and overlay pages
load (`src/v2/data/horizons-inner-solar-system-2026-2040.json`), through the PRODUCTION loader
`ingestSlice2Fixture` (`src/v2/boundary/horizons.ts`) — not a reimplementation. Per body: sample count, first/last
JD (TDB) and calendar date, cadence. For the file: bytes on disk, sha256, and the committed blob size. For the porkchop
grid (`GRID_PARAMS`, nDep × nTof, TOF range; departure span from `src/v2/porkchop/grid-span.ts`): the first departure
column whose arrival epoch falls past coverage, reported for 433, 99942 and 101955. The grid is body-independent, so
the three answers are identical and the JSON says so.

**Result.** `tools/slice21-research/data/ephemeris-coverage.json` (written by side-file + atomic rename). The verbatim
JSON is also in the execution agent's out-of-repo dispatch report of 2026-11-06 (AGENTS.md §4 "final report").

**How to re-run** (repo root). The script compiles into the gitignored `.tmp-tests/` and then REWRITES the tracked JSON;
with the fixture unchanged only `generatedAtUtc` and `headCommit` differ, so `git diff` on it is the reproducibility
check. Either `git restore` the file afterwards or write elsewhere with `--out`:

```bash
node tools/slice21-research/ephemeris-coverage/measure.mjs                 # rewrites the tracked JSON
node tools/slice21-research/ephemeris-coverage/measure.mjs --out /tmp/x.json  # leaves the tree clean
```

**What a 2050 extension would cost in bytes — an estimate.** The JSON's `extensionEstimates` extrapolate the measured
bytes/day linearly to each candidate end date (OQ-20-3's 2044-12-31 / 2049-12-31 / 2052-01-01, plus 2050-12-31) at the
same daily cadence and six-body set. Label it an estimate: record length varies with digit count, and a regenerated
fixture may change precision or body set. The real number is measured only by regenerating (Slice 21 Front A, H0).

**Conventions.** Fields suffixed `UtcPageConvention`, and every grid departure/arrival date, use the page's own convention
(`jdTdbToUtcDateString` in `src/v2/app/porkchop/main.ts`: TDB − 69.184 s rendered as a UTC date). Fields suffixed `DateTdb`
are the TDB calendar day of the JD itself (a JD ending in .5 is TDB midnight of that date); the two differ by one calendar
day at the series ends, and `coverage.dateConventionNote` says so. The page's date helpers and the worker's linspace are
copied into the script because they are not exported; each copy's comment names its original so the two can be
diffed by eye. `GRID_PARAMS` lives in the page module, which boots a DOM on import, so its four
numbers are read from source text and the JSON records that (`grid.readFrom`).
