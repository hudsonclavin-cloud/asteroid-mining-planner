ROLL: COMPLETE
COMMITS: 5 on s20-eph-roll, tip = the evidence commit "docs(research): ephemeris roll run evidence" (parent ce4dece; its sha is in git log, it cannot appear inside the file it commits)
VERIFY: 107/107 files, 356/356 tests (baseline 107/107 files, 355/355 tests)
COVERAGE: 2026-11-01 .. 2027-03-31 TDB (all 22 series equal: yes)
PAYLOAD: 4223359 -> 7033962 bytes across the four rolling fixtures

# S20_00 ephemeris roll report

Run 2026-11-03, Claude Code on Hudson's laptop. Branch `s20-eph-roll` from main `ab03126`
(== origin/main after `git pull --ff-only`), rollback tag `s20-pre-eph-roll` -> `ab03126`.
No tripwire fired. No push, merge, override, or sub-agent.

## Commits and revert map

| # | SHA | Message | Revert effect |
|---|---|---|---|
| a | `6cc5d9b` | data(v2): roll solar-system ephemeris window to 2026-11-01..2027-03-31 TDB | restores the 2026-07-18..2026-10-16 fixtures and test pins (revert d first, then c, then b, then a) |
| b | `f2fc1c0` | feat(solar-system): coverage-ends notice 14 days before expiry | removes the notice; coverage line back to the static mount-time string |
| c | `33461b1` | build(docs): rebuild after ephemeris roll | restores the previous deploy payload (`solarSystemV2-kik0u_mV.js`) |
| d | `ce4dece` | docs(status): record ephemeris window and refresh date | removes the STATUS line |
| e | (tip) | docs(research): ephemeris roll run evidence | removes roll-REPORT.md / roll-LOG.md |

Full rollback: `git switch main` (branch is unmerged), or `git revert` the five in reverse order.

.dispatch-scope per commit (each LF, written with [IO.File]::WriteAllText, confirmed ' M', restored with `git checkout -- .dispatch-scope` after commit):

```text
a: src/v2/data/horizons-inner-system-rolling.json
   src/v2/data/horizons-jupiter-system-rolling.json
   src/v2/data/horizons-mars-system-rolling.json
   src/v2/data/horizons-saturn-system-rolling.json
   tests/v2-ephemeris-hud.test.mjs
   tools/slice20-research/ephemeris-roll/MANIFEST.md
b: src/v2/app/solar-system/ephemeris-status.ts
   src/v2/app/solar-system/runtime.ts
   tests/v2-ephemeris-hud.test.mjs
c: docs/*
d: STATUS.md
e: tools/slice20-research/ephemeris-roll/roll-REPORT.md
   tools/slice20-research/ephemeris-roll/roll-LOG.md
```

## Fixtures (old = `57e4cba`, identical at `ab03126`)

| Fixture | Old bytes / SHA-256 | New bytes / SHA-256 | Ratio vs old x 151/91 |
|---|---|---|---:|
| inner | 120380 `d731a7ec326100be803a876f27f6805baffc10316ccf1a05294a082e69661ce4` | 200060 `686aa629b7ab62b5b5db5fd04cbb25d2019897bb72d32f3164729b43db5c63a8` | 1.0015 |
| jupiter | 778272 `62c1f4693d0b7d992be81564838143e0e898357a101190bc1de035cccc006f45` | 1295812 `31793c57a1d8ebcba91d2dfbb2719123cde251c55da18adfed2cee55962448b2` | 1.0034 |
| mars | 1477959 `d199bfea58b1747e7251e54d222d05d55d8762e787f09e9bb324f94b01423a26` | 2463346 `406534ce0c09b8c8e28440a66233e01e7bfb2ac13f68601ce5b8533ffc65d174` | 1.0044 |
| saturn | 1846748 `58aab9cb94451d44882a2178d260e148de53b282405686b4a3b3a901856f3cae` | 3074744 `679aa36e6493536665fd835e979d98e974895a5067cbb68472493270aabc3b81` | 1.0034 |

Row counts (old -> new; cadence unchanged; every series JD 2461345.5..2461495.5):

- inner: sun, mercury, venus, earth, moon, mars 91 -> 151 (1 d)
- jupiter: jupiter 91 -> 151 (1 d); io 2161 -> 3601 (1 h); europa 721 -> 1201 (3 h); ganymede 361 -> 601 (6 h); callisto 181 -> 301 (12 h)
- mars: mars 91 -> 151 (1 d); phobos 4321 -> 7201 (30 m); deimos 2161 -> 3601 (1 h)
- saturn: saturn 91 -> 151 (1 d); titan 181 -> 301 (12 h); rhea 721 -> 1201 (3 h); iapetus 91 -> 151 (1 d); tethys 2161 -> 3601 (1 h); dione 721 -> 1201 (3 h); mimas 2161 -> 3601 (1 h); enceladus 2161 -> 3601 (1 h)

Frame `ICRF/J2000`, timeScale `TDB`, source `NASA/JPL Horizons API`, and units are unchanged in all four
files. Fetch: 97 Horizons requests, every one at the expected rows ((END - START)/step + 1) with uniform
spacing; no chunking. Request URLs and per-intermediate SHA-256 are in MANIFEST.md.

## Step 6 test evidence (`node --test tests/v2-ephemeris-hud.test.mjs`)

```text
logic present:  tests 4  pass 4  fail 0
logic removed (notice return replaced by the base string):
  ✖ coverage line gains a refresh-due notice in the last 14 days of coverage only
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
    actual: 'View ephemeris coverage 2026-11-01 – 2027-03-31 TDB',
  tests 4  pass 3  fail 1
restored (byte-identical file):  tests 4  pass 4  fail 0
```

Cases: END - 10 d shows `View ephemeris coverage 2026-11-01 – 2027-03-31 TDB (coverage ends 2027-03-31 TDB - refresh due)`
with LIVE; END - 30 d shows the base line only; END + 1 d shows the existing
`NOT LIVE · clamped to 2027-03-31 TDB` text plus warning, with no notice.

## Verify runs

| When | Result |
|---|---|
| baseline (ab03126) | 107/107 files, 355/355 tests, 614.3 s |
| after data + test literals (before commit a) | 107/107 files, 355/355 tests, 631.2 s |
| after step 6, run 1 | NOT green: 105/107 files, 2 LOAD-TIMEOUT (`tests/v2-lambert/tof.test.mjs`, `tests/v2-lambert/utc-to-tdb.test.mjs`, killed at 180 s), 356 passed, 0 failed, 3298.6 s |
| the two files alone | 2/2 pass in 3.1 s |
| after step 6, run 2 (same tree) | 107/107 files, 356/356 tests, 659.3 s; commit b made on this |

Step 8 verify: not re-run; the committed tree at `f2fc1c0` is the tree run 2 tested (no file changed between).

## Bundle

- New entry: `docs/assets/solarSystemV2-GybKye0-.js` (102490 B; was `solarSystemV2-kik0u_mV.js`, 102053 B). Contains the string `refresh due`.
- Root `docs/index.html` (unchanged) redirects to `v2/solar-system/`, whose index.html now loads `solarSystemV2-GybKye0-.js`.
- Rolling JSON chunks (old -> new):
  - `horizons-inner-system-rolling-hYQXEY95.json` 120380 -> `horizons-inner-system-rolling-COKYn11o.json` 200060 (gzip 57.97 kB)
  - `horizons-jupiter-system-rolling-CkHsTalt.json` 778272 -> `horizons-jupiter-system-rolling-D7NnnMbz.json` 1295812 (gzip 370.43 kB)
  - `horizons-mars-system-rolling-CsFLRAhS.json` 1477959 -> `horizons-mars-system-rolling-BbEEuyA2.json` 2463346 (gzip 693.43 kB)
  - `horizons-saturn-system-rolling-BMF0hDy-.json` 1846748 -> `horizons-saturn-system-rolling-d_v3Lj_T.json` 3074744 (gzip 873.07 kB)
- Other renamed chunks: `tier-assignments` (C97LqoPk -> DMGWdJct), `store` (Cht8rmuF -> CdXWXbb_), `grid-span` (DnymItRv -> BJn8uMFn),
  `porkchopV2` (BB3lF6Vp -> 4fKCXVgU), `compareV2` (CF7ZIRAI -> CGn7MKlJ); compare/porkchop/solar-system index.html updated.

## Post-session self-check (run after commit d, before commit e)

```text
git diff --stat s20-pre-eph-roll..HEAD  -> 27 files changed, 568132 insertions(+), 340940 deletions(-)
  (STATUS.md 1+, 10 docs/assets renames/replacements, 3 docs html, ephemeris-status.ts, runtime.ts,
   4 src/v2/data fixtures, tests/v2-ephemeris-hud.test.mjs, MANIFEST.md)
git diff s20-pre-eph-roll..HEAD -- '*.md' | Select-String '^-[^-]'  -> no lines
git status --porcelain  -> empty
```

Commit e adds only two new .md files, so it adds no '-' lines.

## Surprising (list only)

1. AGENTS §3 says Claude Code does not build, test, or write TypeScript; this dispatch assigned those steps to Claude Code. Followed the dispatch.
2. `tools/slice*-research/data/<S>_<E>/` is not gitignored; the 97 intermediates (113,033,070 B) were moved to `%TEMP%\s20-eph-roll\intermediates\` after the build. `.gitignore` not touched.
3. Fetchers persist parsed JSON documents, not raw HTTP bodies; the "raw response" SHA-256 values are of those files.
4. The fetchers pull every research cadence (97 requests); the builders use 22 of them.
5. I edited the step-6 TS while the first post-data verify was running; stopped that run, set the edits aside, restored the files, and reran on the data-only tree.
6. One step-6 verify run had 2 LOAD-TIMEOUTs at 3298.6 s wall (about 5x normal, machine likely slept); the files pass alone and the rerun was green. Not counted as green.
7. Rebuild churn beyond solarSystemV2: `loader.ts` sits in the shared `tier-assignments` chunk and embeds the four rolling-asset URLs, so new data -> new asset hashes -> that chunk changes (5 B from minifier renaming) -> importers (`store`, `grid-span`, `porkchopV2`, `compareV2`) change only in import hashes. Checked by diffing old vs new.
8. The existing HUD tests pass JD values where the function expects TDB seconds; harmless for their relative comparisons, but the 14-day threshold is in seconds, so the new test converts to seconds. The existing tests do not assert `coverageText`.
9. The notice is wall-clock based and also shows while scrubbed (not only when tracking).
10. The notice uses an ASCII " - " exactly as the dispatch writes it; the HUD uses an em dash and a middle dot elsewhere.
11. STATUS.md line 42 still lists the old entry bundle names (`solarSystemV2-kik0u_mV.js`, `porkchopV2-BB3lF6Vp.js`, `compareV2-CF7ZIRAI.js`); left as-is (one-line scope).
12. `node -v` is v26.7.0; AGENTS §9.1 records v24.18.0.
13. After deploy the notice first appears at 2027-03-17 00:00 TDB (END - 14 d), and NOT LIVE returns after 2027-03-31 00:00 TDB, the last sample.
