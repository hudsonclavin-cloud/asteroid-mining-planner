# S20_00 ephemeris roll LOG

## Phase 0 (2026-11-03T17:19:52.8111185-05:00)
- pwd C:\Users\hudso\asteroid-mining-planner; origin https://github.com/hudsonclavin-cloud/asteroid-mining-planner.git
- fetch: origin/main fa821cb..ab03126; local main fast-forwarded to ab03126 (== origin/main)
- git status --porcelain: empty; stash list: stash@{0} 'skill drift, pre-0.5' (left untouched)
- note: AGENTS §3 says Claude Code does not build/test; this dispatch explicitly assigns executor steps to Claude Code; following dispatch (§4 executor rules).

- baseline npm run verify: 107/107 files, 355 tests passed, 0 failed (wall 614.3s), exit 0
- tag s20-pre-eph-roll at ab03126; branch s20-eph-roll created

## Step 1 (2026-11-03T17:31:14.7750465-05:00)
- recon doc read: tools/audit/sanity-69472a3/s19-5-runs/close-EPHEMERIS_RECON.md (heading 'Committed generation path' present)
- scripts read: slice2 fetch-horizons/build-fixture; slice3 fetch-horizons/build-jupiter-system-fixture; slice4 fetch-horizons/build-saturn-system-fixture; slice6 fetch-horizons/build-mars-system-fixture
- HEAD copies of the four fixtures are identical to 57e4cba (git diff --stat empty)
- all four: source 'NASA/JPL Horizons API', frame 'ICRF/J2000', timeScale 'TDB', units km, km/s, TDB Julian Date
- inner 120380 B d731a7ec326100be803a876f27f6805baffc10316ccf1a05294a082e69661ce4; 6 series sun/mercury/venus/earth/moon/mars all 1440 min x 91 rows
- jupiter 778272 B 62c1f4693d0b7d992be81564838143e0e898357a101190bc1de035cccc006f45; jupiter 1440x91, io 60x2161, europa 180x721, ganymede 360x361, callisto 720x181
- mars 1477959 B d199bfea58b1747e7251e54d222d05d55d8762e787f09e9bb324f94b01423a26; mars 1440x91, phobos 30x4321, deimos 60x2161
- saturn 1846748 B 58aab9cb94451d44882a2178d260e148de53b282405686b4a3b3a901856f3cae; saturn 1440x91, titan 720x181, rhea 180x721, iapetus 1440x91, tethys 60x2161, dione 180x721, mimas 60x2161, enceladus 60x2161
- all 22 series first JD 2461239.5 last JD 2461329.5 (2026-07-18..2026-10-16 TDB)
- finding: intermediate dated dirs tools/slice*-research/data/<S>_<E>/ are NOT gitignored; plan: move them to %TEMP%\s20-eph-roll\intermediates after build so the tree stays clean (no .gitignore edit; out of scope)
- finding: fetchers do not persist raw HTTP bodies; they persist parsed JSON intermediates. 'raw response file' sha256 = sha256 of those intermediates.

## Step 2 (2026-11-03T17:31:14.7770477-05:00)
- GET https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=399&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2026-11-02&STEP_SIZE=%271+d%27
- HTTP 200, error none, signature {source NASA/JPL Horizons API, version 1.2}; 2 samples JD 2461345.5, 2461346.5. PASS.

## Step 3 fetches
- target window START 2026-11-01 (JD 2461345.5) END 2027-03-31 (JD 2461495.5), 151 days inclusive
- expected rows: 1d 151, 12h 301, 6h 601, 3h 1201, 1h 3601, 30m 7201, 15m 14401, 5m 43201- fetch order slice2 -> slice6 -> slice3 (+--io-extension) -> slice4 (+--mimas/--enceladus/--tethys-extension); 97 requests total, every one HTTP OK, no API error, row count == expected, uniform cadence, first JD 2461345.5 last JD 2461495.5 (per-file tables in check-slice*.md, copied into MANIFEST)

## Step 4 build (2026-11-03T17:34:04.2300391-05:00)
- builders: slice2 build-fixture, slice6 build-mars-system-fixture, slice3 build-jupiter-system-fixture, slice4 build-saturn-system-fixture; all exit 0
inner: 120380 -> 200060 B (expected ~199751, ratio 1.0015) sha256 686aa629b7ab62b5b5db5fd04cbb25d2019897bb72d32f3164729b43db5c63a8
  sun: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  mercury: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  venus: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  earth: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  moon: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  mars: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
jupiter: 778272 -> 1295812 B (expected ~1291418, ratio 1.0034) sha256 31793c57a1d8ebcba91d2dfbb2719123cde251c55da18adfed2cee55962448b2
  jupiter: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  io: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
  europa: 721 -> 1201 rows (exp 1201), step 180 min (old 180), 2461345.5..2461495.5 OK
  ganymede: 361 -> 601 rows (exp 601), step 360 min (old 360), 2461345.5..2461495.5 OK
  callisto: 181 -> 301 rows (exp 301), step 720 min (old 720), 2461345.5..2461495.5 OK
mars: 1477959 -> 2463346 B (expected ~2452437, ratio 1.0044) sha256 406534ce0c09b8c8e28440a66233e01e7bfb2ac13f68601ce5b8533ffc65d174
  mars: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  phobos: 4321 -> 7201 rows (exp 7201), step 30 min (old 30), 2461345.5..2461495.5 OK
  deimos: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
saturn: 1846748 -> 3074744 B (expected ~3064384, ratio 1.0034) sha256 679aa36e6493536665fd835e979d98e974895a5067cbb68472493270aabc3b81
  saturn: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  titan: 181 -> 301 rows (exp 301), step 720 min (old 720), 2461345.5..2461495.5 OK
  rhea: 721 -> 1201 rows (exp 1201), step 180 min (old 180), 2461345.5..2461495.5 OK
  iapetus: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  tethys: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
  dione: 721 -> 1201 rows (exp 1201), step 180 min (old 180), 2461345.5..2461495.5 OK
  mimas: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
  enceladus: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
RESULT: all OK
- trailing-newline parity: git diff shows 0 'No newline' markers (inner has none before/after; others end LF)
- intermediates moved out of tree to %TEMP%\s20-eph-roll\intermediates\slice{2,3,4,6}-2026-11-01_2027-03-31 (not committed)
- surprise: an ad-hoc check using 'git show' via execFileSync hit ENOBUFS; abandoned (rule: no piped blob bytes); used git diff markers instead
- node -v: v26.7.0 (AGENTS §9.1 records v24.18.0)

## Test literals
- tests/v2-ephemeris-hud.test.mjs: '2026-07-18' -> '2026-11-01' (1), '2026-10-16' -> '2027-03-31' (5). No other edits.
## Step 5 manifest (2026-11-03T17:48:12.3917960-05:00)
- tools/slice20-research/ephemeris-roll/MANIFEST.md generated by node (LF, no BOM), 46898 bytes; intermediates measured 97 files, 113033070 bytes (not committed)

## Verify incident
- I edited ephemeris-status.ts/runtime.ts while the first post-data verify (task b4vgqxatr) was running -> stopped that run (contaminated); saved edits to scratchpad\step6, restored the 2 files with git checkout, confirmed no orphaned node processes, reran
- post-data verify (data + test literals only): 107/107 files, 355 tests, 0 failed, wall 631.2s, exit 0 -> tripwire (e) clear

## Commit a
- .dispatch-scope = 4 fixtures + tests/v2-ephemeris-hud.test.mjs + MANIFEST.md (LF, ' M' confirmed); commit 6cc5d9b; .dispatch-scope restored

## Step 6 (2026-11-03T17:48:12.3947764-05:00)
- ephemeris-status.ts: COVERAGE_ENDING_NOTICE_SECONDS = 14*86400; coverageLineText(); ephemerisStatusHud returns coverageText on every branch
- runtime.ts: coverage line built from coverageLineText at mount and updated every frame from ephemerisStatus.coverageText (it was a static string before)
- notice text uses ASCII ' - ' exactly as the dispatch writes it
- new test in tests/v2-ephemeris-hud.test.mjs uses tdbSeconds-consistent args (JD -> (jd-2451545)*86400): 10 d before END notice, 30 d before none, END+1 d existing NOT LIVE text + no notice
- PASS with logic: 4/4
- FAIL with notice return replaced by base:

✔ tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning (3826.8262ms)
✔ tracking inside coverage mounts LIVE without a warning (3773.7709ms)
✔ outside coverage the HUD date line is marked clamped and Shift+N help tells the truth (3761.5968ms)
✖ coverage line gains a refresh-due notice in the last 14 days of coverage only (3739.9873ms)
ℹ tests 4
ℹ pass 3
ℹ fail 1
✖ failing tests:
✖ coverage line gains a refresh-due notice in the last 14 days of coverage only (3739.9873ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected
    actual: 'View ephemeris coverage 2026-11-01 – 2027-03-31 TDB',


- PASS restored (byte-identical file restore): 4/4
- LF/no BOM confirmed on all edited files
## Verify after step 6
- run 1: 105/107 files, 2 LOAD-TIMEOUT (tests/v2-lambert/tof.test.mjs, tests/v2-lambert/utc-to-tdb.test.mjs killed at 180000 ms), 356 tests passed, 0 failed, wall 3298.6s (vs ~620s normal) -> NOT green, not committed on it
- the two files run alone: 2/2 pass in 3.1s -> environmental stall (machine likely slept), no code change
- run 2 (same tree): 107/107 files, 356 tests, 0 failed, wall 659.3s, exit 0

## Commit b
- .dispatch-scope = ephemeris-status.ts, runtime.ts, tests/v2-ephemeris-hud.test.mjs; commit f2fc1c0

## Build (2026-11-03T18:58:11.9175918-05:00)
- npm run build exit 0; new entry solarSystemV2-GybKye0-.js (102490 B, contains 'refresh due'); churn explained (tier-assignments embeds rolling asset URLs; importers change only in import hashes)
- commit c 33461b1 (docs/*, 18 paths)

## STATUS
- one inserted line under Deploy boundary; numstat 1/0; commit d ce4dece

## Self-check (after d)
- diff --stat: 27 files, 568132+/340940-; md '-' lines: none; porcelain: empty

## Evidence
- REPORT.md and LOG.md copied byte-verbatim to tools/slice20-research/ephemeris-roll/roll-REPORT.md / roll-LOG.md (this line is the last LOG entry before the copy)
