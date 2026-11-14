# S20_LONGRUN real-time log

Environment note: CLOUD RUN. Dispatch targets Hudson's Windows laptop; this run is in a cloud Linux container.
Hudson waived tripwire (a) in-session (2026-11-14), authorized creating the poliastro venv, and chose
git-bundle delivery (no push). Zero sub-agents, zero workflows.

## LR0 Phase 0
- 2026-11-14T01:13:32Z pwd (primary clone): /home/user/asteroid-mining-planner
- remote: https://github.com/hudsonclavin-cloud/asteroid-mining-planner
- origin/main: 0d31cda3d1dca81d29f45092be26b94bb44294c1
- worktree: /tmp/claude-0/-home-user-asteroid-mining-planner/76d3aa99-c371-5f08-8711-bae4d2219800/scratchpad/aster-longrun (branch s20-longrun-research, HEAD 0d31cda)
- scratch: /tmp/claude-0/-home-user-asteroid-mining-planner/76d3aa99-c371-5f08-8711-bae4d2219800/scratchpad/aster-longrun-scratch
- free disk: 29G available
- cpu: 4 cores, RAM 15 GB
- node v22.23.4, npm 10.9.9, python3 3.13.18 (3.11 and 3.12 also present)
- os: Linux 6.18.44-fc-v470
- poliastro venv ~/.aster-slice11-venv: ABSENT at start (to be created per Hudson's answer)
- core.hooksPath after npm ci: .githooks
- founding doc: src/v2/SLICE_20_FOUNDING.md header line 3 still reads DRAFT; §9.1 lock record dated 2026-11-04 present (append-only convention) -> treated as LOCKED, consistent with dispatch
- 01:17:56Z venv created at ~/.aster-slice11-venv (outside repo): python 3.12.3, poliastro 0.17.0, astropy 5.3.4, numpy 1.26.4, scipy 1.17.1, numba 0.68.1. First attempt refused by pip (poliastro 0.17.0 Requires-Python <3.11); installed with --ignore-requires-python and the laptop's pins (S20_01 R6 records python 3.12.10 / poliastro 0.17.0 / astropy 5.3.4 / numpy 1.26.4 / scipy 1.17.1 there).
- 01:19:12Z npm run verify baseline in worktree: exit 0, files 109/109, tests 363 passed / 0 failed, wall 317.1 s; git status --porcelain empty afterwards. (Laptop record in AGENTS.md is 74 files/256 tests as of 2026-08-13; the count here is what origin/main 0d31cda discovers today on Node 22.)

## LR1 K1 oracle dataset
- 01:35:12Z lib/build.mjs: tsc into scratch build-v2, status 0 (15 production modules, 1.2 s).
- build-cells.mjs: 40 bodies (L0 4 / L1 18 / L2 18; 2015 D1 skipped, not propagatable), 150 cells each, M=0 and M=1; 14,124 converged branches (M0 6,000; M1 left 4,062; M1 right 4,062). Grid refusals (Earth arrival after fixture end): 9,329 of 73,100 (matches S20_01 R1). Kernel magnitude vs recomputed vector mismatches: 0.
- oracle_driver.py first run failed on an import name (poliastro exports farnocchia_rv as "farnocchia" from core.propagation); fixed to import from core.propagation.farnocchia; second run 185 s, 0 crashes.
- First report showed closure tail: farnocchia max 1.40 km, cowell max 32.5 km. Probed 7 cells in scratch (probe_outliers.py, not committed): the outliers are near-rectilinear transfer orbits (e ~0.99999, perihelion ~1,500 km from the Sun's centre); the two poliastro propagators and scipy DOP853 disagree with each other there. Added transferOrbit (a, e, q, revolutions) and propagatorDisagreementKm to the driver output and reran (180 s).
- report.mjs: izzo max |dv-inf,E| 1.614e-12 km/s (RMS 3.02e-14) over 14,124; vallado M=0 tight max 1.875e-10 (5,986 solved, 14 'max iterations' errors), default max 3.420e-7 (5,994 solved, 6 errors); closure farnocchia max 1.399 km overall, 1.055e-4 km for transfer perihelion >= 0.1 AU (11,596 branches); energy rel diff max 4.49e-13; h rel diff max 3.26e-14.
- 219 of 14,124 sampled converged branches (1.55%) fly an arc that passes inside the Sun (transfer perihelion < 695,700 km and the arc passes perihelion); the kernel has no perihelion check. Smallest asteroid-departure v-inf among them: 9.307 km/s.

## LR2 catalog-wide symmetric-return error
- 01:39:15Z verify-lookup.mjs: indexed (bisection) Earth lookup vs production over 10,485 epochs (5,000 seeded random + both endpoints + 4 edge epochs + all 5,479 sample epochs): max abs diff 0, same object returned on every exact sample, both throw out of range. Gate PASS.
- lib/common.mjs: build stamp now keyed to the src/v2 tree hash and a clean src/ (the first version keyed to HEAD, which every evidence commit moves; caught when verify-lookup refused to run after the LR1 commit).
- run-shard.mjs trial (10 bodies): ~0.12 s outbound + up to 0.10 s return per body.
- Spot check against S20_01 R3 (--only "433,99942,2000 SG344", M=0): all six rows reproduce. Five match to the printed digits (433 min-C3 6.905/3.034; 433 best stack 1.146/2.254; 99942 5.841/1.092 and 0.103/1.972; 2000 SG344 min-C3 1.389/0.148). 2000 SG344 best stack gives 0.2427 against S20_01's 0.2244: S20_01's return window started at arrival, this one starts at arrival + 8 d (DEC-20-2 S_min).
- Added a SECONDARY window per body (outbound cell minimizing the production sample-return dV stack, S20_01 R3's second definition). Beyond the dispatch's stated procedure; labelled secondary throughout.
- Launched 3 shard processes (seeded shuffle 2026111302, positions p % 3), detached, time box 28,000 s each.

## LR4 fresh-clone build reproducibility (run while LR2 computes)
- 01:41:06Z fresh clone of origin/main (0d31cda, not shallow) into scratch aster-clean; npm ci exit 0; npm run build -- --outDir <scratch>/lr4/out --emptyOutDir exit 0 (4.87 s). Node v22.23.4, vite 5.4.21.
- compare-build.mjs: 55/55 tracked docs/ files byte-identical; 51 emitted into the scratch outDir, 4 written by hard-coded writeBundle plugin paths into the clone's own docs/ (physics.worker.js, lambert-screen-cache.json, tier-sizing-per-body.json, .nojekyll), all four rewritten by the build and identical. git status clean in the clone after the build.

## LR3 mutation campaign (clock started 01:43Z)
- 01:43Z throwaway copies under scratch aster-mutants/w0..w3 (plain copies of the LR4 fresh clone incl. its own .git and node_modules; marker file .lr3-throwaway-copy; mutate.mjs refuses to run without it).
- mutate.mjs enumerate: 48 production .ts files under src/v2/core and src/v2/porkchop, 2,364 mutants (1,660 inside exported functions, 704 inside module-private helpers). By operator: arithmetic-swap 836, argument-swap 671, constant-nudge 394, guard-removal 192, relational-swap 154, sign-flip 36, loop bound -1 / +1 / start +1 27 each.
- First baseline pass stopped on purpose at 25/109: each test file compiles 25-35 modules, so the import graph alone would run ~100 test files per surviving core mutant. Added function-level selection from Node's NODE_V8_COVERAGE (no new dependency) and restarted.
- 02:07:19Z baseline with coverage: 109/109 test files pass unmutated in the copy (sum of per-file wall 1,148 s, inflated by coverage and by LR2 using 3 of 4 cores). Per mutant, tests that import the module AND execute the function: 0 for 28 mutants, 1-3 for 1,643, 4-10 for 482, 11-30 for 168, 31+ for 43.
- plan.mjs: six priority tiers (honesty exported 120, math exported 911, plumbing exported 53, honesty+math private helpers 472, view exported 576, plumbing+view private 232), seeded shuffle inside each.
- Worker 0 started on the one free core (max 10,200 s). Workers 1-3 start when LR2 frees its cores.

## LR2 result (logged 02:41:48Z)
- 02:40Z all three shards complete: 13,969 + 13,969 + 13,968 = 41,906 bodies in 3,604 / 3,713 / 3,734 s (one run, no restart needed).
- Status: ok 39,993; all-return-cells-refused 1,451; no-practical-window 461; outbound-refused:not-propagatable 1.
- PRIMARY (compare best practical window): median |error| 8.972 km/s, p90 17.838, p99 28.362, overcharge share 97.3%. 81.0% of measured bodies are above the 5.1 km/s top of the DEC-20-7 interim range.
- SECONDARY (best sample-return stack cell, beyond dispatch scope): median |error| 0.775 km/s, p90 3.194, overcharge 33.7% / undercharge 66.3%; 87.3% inside 0.08-5.1.
- Refusals: primary 792,784,488 of 2,996,401,200 return cells refused (26.5%); 19,234 bodies lose at least one cell; 1,451 lose all.
- Noticed in the extremes table: the largest undercharges are all windows with ~72,2xx of 72,300 cells refused. Added a split by refusal share to summarize.mjs. Complete windows only: primary n 22,210, median 9.453, overcharge 99.7%; secondary n 20,019, median 0.612, p99 3.920, overcharge 40.3%.
- Support (primary, 9,875 L1 measured): chosen return departs at/after the support date for 8,389; 7,796 L1 bodies have no supported converged return cell.
- 02:08Z worker 0 first results; hand-checked one compile-kill in spare copy w1 (argument swap of ('INV-001', message) rejected by tsc with TS2345): classification correct.
- 02:39-02:41Z workers 1-3 started as the LR2 shards finished. Throughput 13-19 mutants/min on 4 workers.
- 02:56Z honesty tier (120) complete: 80 killed (44 by compile), 39 survived in executed functions, 1 in a function no test executes (boundaryTofDaysAtDeparture). Read all 40 by hand; notes in survivor-notes.json. JavaScript facts used in the notes (toFixed/toPrecision/toExponential truncation, String(null), the 1e-4 and 1e5 switch points, sqrt of a negative radicand) verified in node before writing them down.
- ~03:14Z kernel OOM kill (dmesg): one node test process, 13.0 GB anonymous RSS, memory cgroup limit. One process only; the four workers kept running. A 13 GB process is a mutant making the code run away, so its test failing is a kill by the mutant, not an infrastructure false kill. Recorded as killed.
- 03:19:13Z partial checkpoint commit: 779 of 2,364 mutants run.
