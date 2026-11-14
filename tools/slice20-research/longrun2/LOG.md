# S20_LONGRUN2 real-time log

One agent, zero sub-agents, zero workflows. Host pre-waived by the dispatch (laptop or cloud).

## XR0 Phase 0
- 2026-11-14T07:01:54Z host: Linux 6.18.44-fc-v470 x86_64; node v22.23.4; npm 10.9.9; python3 3.13.18; 4 cores; 15 GB RAM; free disk 24G. Cloud Linux container (the same one the first long run used).
- canonical tree C:\Users\hudso\asteroid-mining-planner: ABSENT on this host (expected; recorded per the dispatch).
- pwd (container clone): /home/user/asteroid-mining-planner; remote https://github.com/hudsonclavin-cloud/asteroid-mining-planner
- origin/main at start: 75606da39d4a6a0bb7022b3457e0e06ed7f6a8dd
- CONTEXT MISMATCH (recorded, not a halt): the dispatch expects Front A's sweep fix and six protected hand-commits on main. origin/main holds exactly 7 commits past 0d31cda: the six s20-longrun-research commits and merge 75606da (PR #13). No path outside tools/slice20-research/longrun/ differs from 0d31cda. So src/ is still the 0d31cda tree.
- worktree: /tmp/claude-0/-home-user-asteroid-mining-planner/76d3aa99-c371-5f08-8711-bae4d2219800/scratchpad/aster-longrun2 (branch s20-longrun2-research, HEAD 75606da); scratch: /tmp/claude-0/-home-user-asteroid-mining-planner/76d3aa99-c371-5f08-8711-bae4d2219800/scratchpad/aster-longrun2-scratch
- npm ci exit 0; core.hooksPath .githooks
- poliastro venv ~/.aster-slice11-venv: present from the first run (python 3.12.3, poliastro 0.17.0); nothing installed in this run so far.
- tools/slice20-research/longrun/ present on main (first long run merged).

## XR1 step 1 - cheap provenance check (logged BEFORE the recompute starts, 07:04:50Z)
- catalog fixture sha256: MATCH (f88028d2...1418 both sides).
- horizons fixture sha256: MATCH (b278dd55...9c15 both sides).
- precompute script sha256: DRIFT. Now 12463732...c780; recorded 44d94435...b4f7. The recorded hash equals the script blob at commit 9e93ffc (2026-05-30, the commit that last changed the cache). Two commits have changed the script since: be5ef60 (repoint the Horizons fixture path) and 6d9b8bc (invoke tsc through process.execPath).
- metadata.provenance.solverCommit 8471659 (2026-05-29): IS an ancestor of HEAD; 647 commits later. 8471659 -> 9e93ffc changed nothing under src/v2/core, so the recorded commit does identify the solver the cache was built with.
- Files under src/v2/core and src/v2/porkchop that differ between 8471659 and HEAD: 35 (30 added, 5 modified). Of the modules the precompute script compiles (izzo.ts and what it imports, keplerian.ts, units, hermite.ts, slice9-nea-catalog.ts, horizons.ts), these changed: core/lambert/izzo.ts (+18/-2), householder.ts (+3/-1), hyp2f1b.ts (+11/-13), initial-guess.ts (+4/-1), boundary/slice9-nea-catalog.ts (+7/-0). tof.ts, vec3.ts, keplerian.ts, units and hermite.ts did not. dla.ts, feasibility.ts and lambert-multi-rev.ts were ADDED after 8471659; the script does not import them.
- docs/lambert-screen-cache.json vs tests/fixtures/v2/lambert-screen-cache.json: MATCH, byte-identical (bd27b9bd...0206, 34,499,477 bytes).
- Throwaway clone for the recompute: /tmp/claude-0/-home-user-asteroid-mining-planner/76d3aa99-c371-5f08-8711-bae4d2219800/scratchpad/aster-tmp-xr1, full history, HEAD 75606da (the container's own clone is shallow and could not answer the ancestry question).
- 2026-11-14T07:06:25Z recompute launched in the throwaway clone: node tools/build/precompute-lambert-screen.mjs, unedited, no arguments (script sha256 12463732...c780, as on main). A first launch one minute earlier died before node started (the wrapper called /usr/bin/time, which this host lacks); nothing ran.
- 07:10:20Z npm run verify baseline: files discovered: 109;files passed: 109;tests passed: 363;tests failed: 0;VERIFY_EXIT 0; (the dispatch expected 111 files / 370 tests after Front A's sweep fix; that fix is not on origin/main, so the real number is the same as the first run's).
- 07:10:39Z XR0 gate: the independent path reproduces the three S20_01 R3 min-C3 rows at M=0 (433: 6.9049 / 3.0337; 99942: 5.8407 / 1.0916; 2000 SG344: 1.3891 / 0.1476). Full XR0 run started: 540 bodies (3 gate, 500 in catalog order, the rest from LR2's extremes tables), one process, production linear-scan Earth lookup, 1.1-2.0 s per body.

## XR2 outbound census (started 07:14:38Z, while the XR1 recompute runs)
- The precompute script takes no hooks and may not be edited, so the census is the dispatch's fallback: an independent sweep of the same screening grid (783 departures x 55 TOF) with the production kernel computePorkchopGrid, plus the compare page's 731 x 100 grid through computeCompareData, per body, in catalog order, 3 shards.
- Validity definition copied from LR1 (lr1-oracle/oracle_driver.py transferOrbit; lr1-oracle/report.mjs perihelionPassages and the band "q < 1 solar radius AND the flown arc passes perihelion"); constants AU 149,597,870.7 km, solar radius 695,700 km.
- Trial on 7 bodies: 265-413 ms per body with the machine busy; every body has flagged cells on the screening grid (4 to 492 of 43,065); the kernel's minimum C3 equals the shipped cache's to 1e-12..6e-11 relative with the same date and TOF.
- Shards 0 and 1 started; shard 2 starts when XR0 frees its core.
- 07:19:30Z XR2 shard 2 started now rather than after XR0 (five processes on four cores for a while; the recompute is at 718k solves/s with ETA well under the script's own 75-minute abort).

## XR3 worker prepared (07:19:30Z); it starts when the census frees the cores
- xr3-m1-returns/run-shard-m1.mjs is a copy of LR2's merged run-shard.mjs with the return leg run at M=0 and M=1 (header lists every change). LR2's lib is reused; its build was made into this run's scratch.
- Trial (--only "433,99942,2000 SG344") against S20_01 R3's M=1 column: 433 min-C3 1.7950 (R3 1.795), 433 best stack 1.2229 (1.223), 99942 min-C3 1.1016 (1.102), 99942 best stack 1.5648 (1.565), 2000 SG344 best stack 0.3084 (0.3084); 2000 SG344 min-C3 0.1424 against R3's 0.131 (R3's window had no 8-day minimum stay). The M=0 values equal LR2's.
- Cost: the M=1 pass costs about 1.5-2.5 times the M=0 pass per return grid; about 1 s per body per core expected.
- Schedule decision: XR3 starts with 4 shards when the XR2 census is done, so its 3 h box gets four full cores; starting it now would spend the box on a shared machine.

## XR0 result (07:43:24Z)
- Run complete: 540 bodies in 1,917 s (3 gate, 498 further bodies from the first 500 in catalog order, 39 from LR2's extremes tables). Status: ok 503; all-return-cells-refused 15; no-practical-window 22.
- Joined to LR2's committed shards: 540 compared; 540 agree on every compared field after LR2's 6-decimal rounding (status, window, assumed, refused count, computed, its cell, error); 0 differ; max |d error| 0.
- LR2's full-precision working file was still in the first run's scratch on this host (not committed evidence): 503 of 503 bodies with an error on both sides are bit-identical in window, assumed, computed and error.
- VERDICT: VALIDATES LR2's primary column on these 540 bodies. LR2's committed numbers were not touched.
- Return census (XR2 step 4) started on the core XR0 freed.

## XR1 recompute and diff (07:56:02Z)
- Recompute ended 07:52:31Z: exit 0, "Precompute complete in 2760.3s", total solves 1,804,638,825 (same as the shipped metadata), 130 co-orbital bodies, status counts 41,422 / 483 / 0 / 1 (same as shipped). The script's 75-minute self-abort was never close.
- Recomputed file copied to scratch: sha256 7225df82...d9e5, 34,499,447 bytes (shipped: bd27b9bd...0206, 34,499,477 bytes). The throwaway clone shows exactly one modified path, the cache it wrote.
- diff-cache.mjs, all 41,906 bodies: 0 status changes, 0 isCoOrbital changes, 0 argmin-cell changes, 0 different top windows, 0 different top-5 sets, 0 metadata differences beyond the expected four. The bodies section is NOT byte-identical: 1,787 bodies differ in minC3 (max relative 2.117e-13, median among changed 3.9e-15) and 6,795 bodies have the same five cells with different stored digits.
- Displayed (production StatusBadge labels, formatC3, co-orbital tag, near-zero flag, getScreeningColor hex): 0 bodies would be shown differently.
- second-solver.mjs, 300 seeded bodies plus the 21 not-already-sampled of the 25 nearest the threshold: izzo.ts and lambert-multi-rev.ts (M=0) converge on exactly the same cells and give bit-identical C3 on every one of 12,876,435 + 904,365 cells; no body straddles 25 km2/s2; this loop's izzo minimum equals the recomputed cache bit for bit for 321 of 321 and the shipped cache for 311 of 321.
- Why the digits differ (old-solver-check.mjs): extracted the six core/lambert files at 8471659 by hand (git show, full-history clone), compiled them with this repo's tsc as ES modules. First attempt compiled them as CommonJS (no package.json in the scratch folder) and made every file look different; fixed by adding {"type":"module"} there. Result: tof.js and vec3.js byte-identical to HEAD's; izzo.js differs by the M != 0 guard; the other three by comments only. Old solver vs current solver on this host: bit-identical on 4,306,500 of 4,306,500 cells (100 bodies). The old solver here reproduces the shipped minC3 for 0 of 75 changed bodies and 25 of 25 unchanged ones. So the machine, not the source, moved the last digits; the cache does not record which machine built it.
- The recomputed cache is committed gzipped (8,250,979 bytes) because its bodies differ from the shipped file.
- 07:59:34Z xr3-autostart.sh running: it starts the four XR3 shards (LR2's seeded order, positions p % 4, --max-seconds 10800 each) as the census shards finish. Measured XR3 cost on an otherwise idle core: 0.63 s per body (21 bodies).
- 08:00:51Z XR3 worker extended BEFORE any XR3 shard started (autostart stopped, edited, re-armed): the return census (400 bodies, complete) shows 2.58% / 2.88% of converged M=1 left / right branches flagged and a flagged branch at 3.974 km/s, so an M=1 minimum could be a through-Sun arc. Each chosen return cell now carries LR1's flag, and the row carries the minimum over unflagged cells (lazy evaluation; a few flag evaluations per grid). The dispatched quantity (minimum over all admissible converged cells and branches) is unchanged; the unflagged variant is an extra, labelled beyond the dispatch. Re-tested on 433, 99942, 2000 SG344: M=0 and M=1 values as before, no flagged minimum.

## Container restart (08:28:49Z)
- The session's worker restarted and the container rebooted (uptime 0 min at 08:28Z). Every background process died: the three XR2 census shards (last checkpoints 08:24:46-08:24:56Z at 12,379 / 12,689 / 11,749 bodies) and the XR3 autostart (no XR3 shard had started). Scratch, worktree and builds survived. The session continues on a different model from here.
- Resume: the census shards restart from their checkpoints (rows after the last checkpoint are dropped and redone, by design). The XR3 autostart is re-armed so that it uses the free fourth core at once.

## XR2 result (08:40:18Z)
- Census complete at 08:39:05Z after the restart (shard wall times this pass 344-603 s; first pass 07:13-08:25Z). All 41,906 bodies: 41,905 swept, 2015 D1 not propagatable.
- Screening grid: 1,804,638,825 cells, 1,804,638,824 converged, 5,563,614 flagged (0.308%); 39,920 of 41,905 bodies have at least one flagged cell.
- The one non-converged screening cell: 2019 XV, departure 2035-11-01, TOF 482 d, transfer angle 0.051 deg. izzo.ts returns no_convergence there and lambert-multi-rev.ts returns null (scratch probe, not committed). The shipped cache's totalSolves counts attempts, so it includes this cell.
- RULING-CRITICAL COUNT: 0. No shipped minC3 cell (41,905 checked), no cached best window (209,525), no compare bestPractical argmin (41,444) and no cell inside any compare bestPractical window (1,364,717 cells) is flagged. Smallest transfer perihelion inside any compare window: 0.477 AU.
- Kernel minimum C3 vs the shipped izzo value, every body: max relative 1.2e-8, same argmin cell for all, none straddle 25.
- Return census, 400 seeded bodies: 933,560 of 56,805,834 converged branches flagged (1.643%; LR1 1.551%). M=0 0.312%, M=1 left 2.576%, M=1 right 2.881%. Every M=1 branch with perihelion inside the Sun passes it. Smallest flagged asteroid-departure v-inf 3.974 km/s.
- 08:42:13Z CORRECTION to the 07:5x XR1 entry above ("So the machine, not the source, moved the last digits"): that was stronger than the evidence. What is shown is that the COMMITTED source changes since 8471659 do not move the values (old solver == current solver bit for bit on this host). The computation uses Math.sin, cos, pow, exp, log, acos and asinh, which ECMAScript leaves implementation-approximated, so a different V8 build or CPU is a plausible cause [Likely]. Not excluded: a solver edit present but uncommitted at build time and never committed. XR1 REPORT.md and the final report now say this.

## XR3 (logged 09:32:32Z)
- XR3 shards started by the autostart at 08:29:01Z, 08:34:51Z, 08:36:11Z and 08:39:12Z (as census shards finished); --max-seconds 10800 each. 0.62-0.77 s per body per shard.
- Interim commit at PARTIAL: 20506 of 41906: M=0 values equal LR2's committed rows for every body so far.
- 10:38:32Z XR3 COMPLETE: four shards finished 10:24:00Z, 10:31:59Z, 10:32:19Z, 10:36:57Z (6,898-7,063 s each), 41,906 of 41,906 bodies inside the 3 h box. M=0 values equal LR2's committed rows for all 41,906 (primary error, primary computed, secondary error, status).
- Primary (39,993 bodies): median |error| 8.972 (M=0) -> 9.262 km/s (M=0+M=1); overcharge 97.3% -> 97.4%; an M=1 cell is the minimum for 20,455 (51.1%); median gain when it is 0.402 km/s.
- Secondary (37,842): median |error| 0.775 -> 0.526 km/s; overcharge 33.7% -> 47.0%; M=1 is the minimum for 59.7%.
- Through-Sun check on the chosen minima (beyond the dispatch): no M=1 minimum is flagged. LR2's OWN M=0 minimum is a flagged arc for 1 primary body (154300) and 6 secondary bodies, all on pairing windows where 71,199-72,297 of 72,300 cells were refused (3 to 1,101 admissible cells). LR2's committed numbers are not touched; XR2's shown-window count (0) is unaffected because LR2 values are not shown on the site.
