LONGRUN: COMPLETE (LR0, LR1, LR2, LR3, LR4 all ran to the end; cloud container, tripwire (a) waived by Hudson in-session)
COMMITS: 5 on s20-longrun-research before the commit that adds this file, tip 50496bf (a file cannot contain the hash of its own commit; the final tip is in the chat summary and in git log)
LR1 ORACLE: 14,124 converged branches compared (6,000 M=0 cells and 4,062 M=1 cells x 2 branches, 40 bodies) | max |Δv∞| izzo 1.614e-12 km/s · vallado(M=0) 1.875e-10 km/s tight, 3.420e-7 km/s at poliastro defaults · closure 1.399 km worst, 1.055e-4 km where the transfer perihelion is >= 0.1 AU | no threshold was set, numbers only; the closure tail is propagator-limited on near-rectilinear transfer orbits
LR2 SYMMETRIC: 41,906/41,906 bodies, 39,993 measured | median |error| 8.972 km/s · p90 17.838 km/s · overcharge share 97.3% (at the compare-path best window; UNVALIDATED until LR1 passes review)
LR3 MUTATION: 2,364 of 2,364 mutants run | killed 1,413 | SURVIVED 951 (porkchop/porkchop-view.ts 560, core/lambert/lambert-multi-rev.ts 92, core/propagators/keplerian.ts 28, core/lambert/stumpff.ts 26, porkchop/segment-windows.ts 26)

# S20_LONGRUN final report

Everything below is LEADS-grade research evidence. **No LR2 or LR3 number is validated.** Nothing here enters a DEC, a test or the site.

## 0. Read first: this did not run where the dispatch says

- **Cloud container, not the laptop.** Linux x64, Node v22.23.4, 4 cores, 15 GB. The dispatch says "Run in CLAUDE CODE on Hudson's laptop" and STATUS.md names the Windows checkout as canonical, so tripwire (a) "pwd wrong" fired by the letter at Phase 0. Hudson waived it in-session on 2026-11-14 with three answers: run here with paths adapted; create the poliastro venv here; deliver by git bundle with no push.
- **Paths.** Worktree `<session scratchpad>/aster-longrun` on branch `s20-longrun-research` off origin/main `0d31cda`; scratch `<session scratchpad>/aster-longrun-scratch`; LR4 clone `aster-clean`; LR3 throwaway copies `aster-mutants/w0..w3`. The canonical tree at `C:\Users\hudso\asteroid-mining-planner` does not exist in this container and was not touched. The container's own clone (`/home/user/asteroid-mining-planner`) had no file edited; its `.git` holds the worktree's commits.
- **One agent, zero sub-agents, zero workflows.** The session had a standing multi-agent mode switched on. The dispatch and AGENTS.md §2.1.7 forbid it, so it was not used. Long computations ran as background processes.
- **No push, no merge, no ASTER_* override, no package added to package.json.** Every staged path is under `tools/slice20-research/longrun/`. Each commit used an exact-path `.dispatch-scope` (contents pasted in section 8) and the scope file was restored afterwards.
- **Installed outside the repo:** a Python 3.12.3 venv at `~/.aster-slice11-venv` with poliastro 0.17.0, astropy 5.3.4, numpy 1.26.4, scipy 1.17.1, numba 0.68.1. pip refused poliastro 0.17.0 on Python 3.12 (`Requires-Python <3.11`); it was installed with `--ignore-requires-python`, which is how the same pins can exist on the laptop's Python 3.12.10 (S20_01 R6).
- **What does not transfer to the laptop without a re-run:** LR3 (test behaviour) and LR4 (build output) were measured on Node 22; the laptop runs Node 24. LR1 and LR2 are IEEE-754 arithmetic on the same inputs, but they too were measured here, not there.
- **Commit messages** carry one trailer line (`Claude-Session: ...`) after the dispatch's subject line.

Where this run went beyond or beside the dispatch text (each is also labelled where it appears):
1. LR1 adds a second closure propagator (cowell), a tightened vallado setting next to the default one, and the transfer orbit's eccentricity and perihelion per cell.
2. LR2 adds a secondary window per body (the best sample-return ΔV stack cell). The dispatch asks only for the compare-path window.
3. LR3 mutates module-private helpers as well as exported functions (separate tiers), and chooses tests by measured function coverage on top of the import graph.
4. LR4 could not send four files to the scratch outDir: the build config hard-codes their destination.

## 1. LR0 — Phase 0

| Item | Value |
| --- | --- |
| pwd (container clone) | `/home/user/asteroid-mining-planner` |
| remote | `https://github.com/hudsonclavin-cloud/asteroid-mining-planner` |
| origin/main | `0d31cda3d1dca81d29f45092be26b94bb44294c1` |
| worktree / branch | `<scratchpad>/aster-longrun` / `s20-longrun-research` |
| free disk at start | 30 GB (tripwire (e) floor 5 GB; lowest seen 25 GB) |
| node / npm | v22.23.4 / 10.9.9 |
| python | 3.13.18 system; 3.12.3 used for the venv |
| poliastro venv at start | ABSENT; created after Hudson's answer; `import poliastro` prints 0.17.0 |
| `npm run verify` baseline | exit 0 — 109/109 files, 363 tests passed, 0 failed |
| `npm run verify` after the run | exit 0 — 109/109 files, 363 tests passed, 0 failed |
| Founding doc | `src/v2/SLICE_20_FOUNDING.md`: §9.1 lock record dated 2026-11-04 present; its line 3 still reads "STATUS: DRAFT — not locked" |

## 2. LR1 — K1 oracle dataset

**What ran.** 40 bodies (seed 20261113; 4 L0, 18 L1, 18 L2; all six named bodies present, 2000 SG344 included). 150 return cells per body from the 731x100 return grid, M=0 and M=1. Aster side: the unedited `computePorkchopGrid` with swapped providers, one cell at a time, v∞ vectors recomputed. Oracle side: a new poliastro driver that writes only where its two arguments point.

**How much.** 14,124 converged branches compared: 6,000 at M=0 (every sampled cell converged), 4,062 M=1 cells with both branches. Refused before sampling (Earth arrival after 2040-12-31): **9,329 of 73,100** grid cells, the same count S20_01 R1 reports. The kernel's own |v∞| equals the recomputed vector's norm exactly on every branch (0 mismatches).

| Check | n | max | RMS | Note |
| --- | ---: | ---: | ---: | --- |
| (a) izzo, \|Δv∞,E\| km/s | 14,124 | 1.614e-12 | 3.020e-14 | 0 solver errors; branch mapping fixed before comparing |
| (a) izzo, \|Δv∞,asteroid-departure\| km/s | 14,124 | 1.493e-12 | 2.396e-14 |  |
| (b) vallado M=0, poliastro defaults | 5,994 | 3.420e-7 | 4.834e-8 | 6 cells: "Maximum number of iterations reached" |
| (b) vallado M=0, numiter 200 / rtol 1e-12 | 5,986 | 1.875e-10 | 6.720e-12 | 14 cells: same error |
| (c) closure miss km, farnocchia, all cells | 14,124 | 1.399e+0 | 1.196e-2 | median 3.044e-6 |
| (c) closure miss km, farnocchia, transfer perihelion >= 0.1 AU | 11,596 | 1.055e-4 | 8.348e-6 | median 2.287e-6 |
| (c) closure miss km, cowell rtol 1e-13, all cells | 14,124 | 3.249e+1 | 2.974e-1 |  |
| (c) \|ΔE\|/\|E\| between Aster's endpoint states | 14,124 | 4.494e-13 | 4.285e-15 |  |
| (c) \|Δh\|/\|h\| between Aster's endpoint states | 14,124 | 3.263e-14 | 6.022e-16 |  |

**Outliers.** Agreement with izzo has none worth the name: the worst cell is 1.614e-12 km/s. The closure check does. Its largest misses (1.399 km analytic, 32.5 km numerical) all sit on cells whose transfer orbit is near-rectilinear, with its perihelion inside the Sun. On those cells the two poliastro propagators land up to 32.4 km from each other, so the miss measures the propagators there, not Aster; energy and angular momentum between Aster's own endpoint states still agree to 4.494e-13 and 3.263e-14. Every listed cell is in lr1-oracle/REPORT.md.

A side finding from the same column: **219 of 14,124 sampled converged branches (1.55%) fly an arc that passes inside the Sun** (transfer perihelion under one solar radius and the flown arc passes perihelion; 17 at M=0, 202 at M=1). The kernel has no perihelion check and reports them as converged. None competes for a minimum in this sample: the smallest asteroid-departure |v∞| among them is 9.307 km/s.

**Needs Nova's ruling.**
1. DEC-20-9(c) asks for closure "within tolerance". One number will not fit every cell: 1.055e-4 km covers every sampled cell with transfer perihelion >= 0.1 AU, while the near-rectilinear cells need a different propagator, an exclusion, or the energy/angular-momentum check instead.
2. Whether K1 should label or refuse cells whose arc passes inside the Sun. DEC-20-1's "not evaluated" list does not mention it.
3. Which vallado setting DEC-20-9(b) means. At poliastro's defaults the agreement is 3.420e-7 km/s (its own rtol 1e-8); tightened it is 1.875e-10 km/s. Either way vallado fails to converge on a few ordinary cells (6 and 14 of 6,000).
4. M=2 was not sampled (the dispatch asks for M=0 and M=1; DEC-20-9 names M=0, 1, 2).
5. Whether oracle evidence produced in a cloud container is admissible for DEC-20-9, or the three scripts should be re-run on the laptop (nothing in them is OS-specific).

## 3. LR2 — catalog-wide symmetric-return error

**UNVALIDATED until LR1 passes review.**

**What ran.** Gate first: the tools-only indexed Earth lookup against the production linear scan, 10,485 epochs (5,000 random, both endpoints, every sample epoch), max abs difference exactly 0. Then every catalog body in a seeded shuffle: the production `computeCompareData` for the outbound best window, the production `departureDvFromVInf` for the assumed burn, and the unedited kernel with swapped providers over the DEC-20-2 pairing window (723 x 100 cells, M=0) for the computed minimum asteroid-departure |v∞|. The worker reproduces all six S20_01 R3 rows at M=0 (one differs, 0.2427 against 0.2244 km/s, because DEC-20-2's 8-day minimum stay is now applied).

**How much.** COMPLETE: 41,906 of 41,906 bodies, in 3,604 / 3,713 / 3,734 s on three processes (about 62 minutes wall), one pass, no restart needed, against an 8 h box. Status: ok 39,993; all-return-cells-refused 1,451; no-practical-window 461; outbound-refused:not-propagatable 1.

| Window | measured | median \|error\| | p10 / p90 / p99 \|error\| | overcharge / undercharge | inside 0.08-5.1 km/s | above 5.1 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Primary: compare-path best practical window (the dispatch procedure)** | 39,993 | 8.972 | 3.405 / 17.838 / 28.362 | 97.3% / 2.7% | 18.8% | 81.0% |
| ... complete pairing windows only (no refused cell) | 22,210 | 9.453 | 4.417 / 18.237 / 28.790 | 99.7% / 0.3% | 13.8% | 86.2% |
| Secondary: best sample-return stack cell (beyond the dispatch) | 37,842 | 0.775 | 0.114 / 3.194 / 13.912 | 33.7% / 66.3% | 87.3% | 5.6% |
| ... complete pairing windows only | 20,019 | 0.612 | 0.097 / 2.035 / 3.920 | 40.3% / 59.7% | 91.3% | 0.4% |

error = assumed − computed, km/s; positive means the symmetric assumption overcharges. By tier and by orbit class: lr2-symmetric/REPORT.md.

**What the two rows say.** At the window compare recommends, the outbound arrival |v∞| is large (median 10.810 km/s, because compare ranks by departure C3 alone), while a return departure costing a median 1.401 km/s exists inside the pairing window. So the assumption overcharges for 97.3% of bodies and the size is several km/s. At the window the sample-return stack itself would rank first, the assumed burn is small by construction (median 0.976 km/s) and the error is under 1 km/s for most bodies, more often an undercharge. S20_01 R3 saw both behaviours in six rows; this is the same pattern at catalog scale.

**Refusals, support, convergence (primary).** 792,784,488 of 2,996,401,200 return cells refused under DEC-20-3 (26.5%); 19,234 bodies lose at least one cell and 1,451 lose all of them. Non-converged admissible cells: 1 in total. Of 9,875 measured L1 bodies, the chosen return departs at or after the support date for 8,389, and 7,796 have no supported converged return cell at all.

**Outliers.** The ten largest overcharges run from 43.524 to 65.424 km/s (orbit classes: 3 HTC, 4 APO, 3 JFC). The ten largest undercharges (-36.420 to -25.965 km/s) are an artefact: every one sits on a window where at least 72,200 of 72,300 return cells were refused, so "computed" is the minimum of at most 100 cells. A refused cell cannot be the minimum, which pushes truncated windows toward undercharge; that is why the complete-window rows are shown separately. All forty extreme rows are in lr2-symmetric/REPORT.md.

**Needs Nova's ruling.**
1. Which window the DEC-20-7 interim disclosure should describe. Its "0.08-5.1 km/s" holds for 87.3% of bodies at the best-stack window and for 18.8% at the compare-path best window, where 81.0% are above 5.1. The compare page itself is one-way and charges no return burn; the symmetric charge is applied on the porkchop page to whichever cell the user pins.
2. How truncated pairing windows are reported. 46.4% of bodies with a window lose return cells to the 2040-12-31 fixture end.
3. The return grid's column count (723 over 722.5 days) is this run's choice; DEC-20-2 fixes the window and the TOF range only.
4. Under DEC-20-6's default-on filter, 7,796 of 9,875 measured L1 bodies have no supported return cell at today's (unfiltered) compare-path window. The filter would also change which outbound window ranks first, which this run did not model. A count for Front C/D to plan around, not a recommendation.
5. Whether the secondary-window columns stay in the evidence (they are beyond the dispatch) or are dropped.

## 4. LR3 — mutation campaign

**Not validated. A surviving mutant is a lead; some are equivalent mutants.**

**What ran.** A mutator written on the TypeScript compiler API already in node_modules (no new dependency) listed 2,364 mutants in 48 production files under src/v2/core and src/v2/porkchop: 1,660 inside exported functions (the dispatch scope) and 704 inside module-private helpers (added, labelled). Each ran in a throwaway copy of a fresh clone against the test files that import its module and executed its function at baseline. All 109 discovered test files pass unmutated in the copy.

**How much.** COMPLETE. Clock: 01:43Z to 04:46Z, inside the 4 h box. Four worker processes, each in its own throwaway copy; 7,524 to 7,757 s of mutant runs per worker.

| Tier (run order) | Mutants | Run | Killed | ... by the compile step | Timeout | Survived, function executed | Survived, function never executed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1. honesty layer, exported functions | 120 | 120 | 80 | 44 | 0 | 39 | 1 |
| 2. math layer, exported functions | 911 | 911 | 693 | 46 | 19 | 199 | 0 |
| 3. plumbing, exported functions | 53 | 53 | 33 | 8 | 0 | 20 | 0 |
| 4. honesty + math, module-private helpers (beyond the dispatch scope) | 472 | 472 | 345 | 44 | 1 | 125 | 1 |
| 5. view (porkchop-view.ts), exported functions | 576 | 576 | 214 | 171 | 2 | 360 | 0 |
| 6. plumbing + view, module-private helpers (beyond the dispatch scope) | 232 | 232 | 26 | 5 | 0 | 180 | 26 |
| **All** | 2,364 | 2,364 | 1,391 | 318 | 22 | 923 | 28 |

Dispatch scope only (exported functions, tiers 1, 2, 3 and 5): 1,660 of 1,660 run, 1,041 killed, 619 survived.

**Top files by survivors:** `porkchop/porkchop-view.ts` 560 of 796 run; `core/lambert/lambert-multi-rev.ts` 92 of 263 run; `core/propagators/keplerian.ts` 28 of 140 run; `core/lambert/stumpff.ts` 26 of 53 run; `porkchop/segment-windows.ts` 26 of 77 run.

**Read by hand.** 147 survivors in the honesty and math layers carry an individual written reading (more are covered by a per-function or per-file note). Of those 147: 22 are read as real gaps, 31 as equivalent mutants, and the rest as untested boundaries, untested defensive branches or iteration-path changes that cannot alter a converged answer. The readings that matter most:
- `porkchop/delta-v.ts` `injectionDvFromC3` (5 survivors, lines 23, 24, 25): No test pins the injection ΔV. Dividing by the parking radius can be swapped for multiplying, and the final subtraction for an addition, and both test files that run the function still pass. The stack total survives a flipped margin sign for the same reason.
- `porkchop/grid-compute.ts` `computePorkchopGrid` (2 survivors, lines 164, 165): No test pins the grid's axis direction. Building the departure or the TOF axis from (end, start) reverses the cell order and all three test files that run the kernel still pass.
- `porkchop/propagation-guard.ts` `assessPropagation` (6 survivors, lines 75, 79, 82): The non-finite-element refusal and the eccentricity refusal can each be deleted without a test failing. The one refusal the tests drive through this function is a non-positive semi-major axis.
- `porkchop/tier-disclosure.ts` `fullTierDisclosure` (1 survivor, lines 116): The guard that returns no sentence when the date or the delta-v cannot be formatted can be deleted; the mutant would print a disclosure containing "null".
- `core/invariants/assertions.ts` `assertInterpolationError` (3 survivors, lines 173, 177): A sign error inside the error norm makes the interpolation and Keplerian error-bar assertions unable to fire for z-dominated errors, and no test notices.
- `porkchop/compare-data.ts` `computeCompareData` (7 survivors, lines 259, 270, 278, 279, 364): The TOF cell width can be computed from swapped arguments (it goes negative) and the two test files that run this function still pass.
- `core/lambert/lambert-multi-rev.ts` `solveOneBranch` (24 survivors, lines 160, 161, 166, 175, 177, 179, 191, 192, 195, 198): The fail-closed x² > 0.90 limit is not pinned. Its two checks mask each other as single mutants, so both were deleted together by hand in a spare copy (a second-order check outside the campaign): the only two test files that execute this function still pass.

**Functions no test executes** (measured by V8 function coverage): `core/invariants/runtime.ts` `defaultViolationHandler` (1 mutant); `porkchop/support-boundary.ts` `boundaryTofDaysAtDeparture` (1 mutant, exported); `porkchop/porkchop-view.ts` `getNearestCellForTarget` (26 mutants).

**Check on the test selection.** 12 surviving mutants were re-run against every test file that imports their module, with the function-level selection switched off (142 test-file runs): 12 still survived, 0 were killed only without the selection.

**Other facts.** One process was killed by the kernel for memory during the run (a single test process at 13 GB, about 03:14Z): a mutant making the code run away, recorded as killed. "Killed by the compile step" means the test's own tsc run rejected the mutant, which is a kill by the type system rather than by an assertion.

**Needs Nova's ruling.**
1. Which survivors become Front E work. lr3-mutation/SURVIVORS.md lists every one with its diff, the tests that ran and a suggested test; nothing was written.
2. Whether mutating module-private helpers (tiers 4 and 6) is wanted. Drop those tiers to get exactly the dispatch scope.
3. Whether "killed by the compile step" should count as killed for the project rule "a test that cannot fail".
4. The hand readings are one reader's, made in this run; "equivalent" was checked by execution only where the note says so.

## 5. LR4 — fresh-clone build reproducibility

**55 of 55 files tracked under docs/ at 0d31cda are byte-identical to a fresh-clone build** (sha256; 0 differing, 0 missing, 0 extra). Fresh clone from GitHub, `npm ci`, `npm run build -- --outDir <scratch> --emptyOutDir`, on linux x64, Node v22.23.4.

51 files went to the scratch outDir. The other 4 (`docs/.nojekyll`, `docs/lambert-screen-cache.json`, `docs/legacy/physics.worker.js`, `docs/tier-sizing-per-body.json`) are written by `writeBundle` plugins to a hard-coded `docs/` path in vite.config.ts and ignore `--outDir`; they were rewritten in the clone's own docs/ and are identical too. Anyone building "into scratch" in a tree they care about gets those four files written into that tree. No ruling needed.

## 6. Anything surprising (list only)

- The dispatch was handed to a cloud session; its tripwire (a) fired at Phase 0 and needed a waiver.
- A standing multi-agent mode was on in the session that received a dispatch forbidding sub-agents.
- pip refuses poliastro 0.17.0 on Python 3.12 without `--ignore-requires-python`.
- `npm run verify` discovers 109 test files and 363 tests at 0d31cda; AGENTS.md §9.1 still records 74 files and 256 tests (2026-08-13).
- SLICE_20_FOUNDING.md line 3 still says "DRAFT — not locked" above a §9.1 lock record.
- 1.55% of sampled converged return branches fly through the Sun, and the kernel has no perihelion check.
- Both poliastro propagators lose kilometres on those near-rectilinear orbits, and they disagree with each other.
- poliastro 0.17.0's vallado `prograde` flag selects the short way, not the direction of motion.
- At the compare-path best window the symmetric charge is above the disclosed 5.1 km/s maximum for 81.0% of bodies.
- 26.5% of all paired-return cells are refused by the 2040-12-31 fixture end.
- The largest "undercharges" in LR2 are produced by that truncation, not by the orbits.
- vite.config.ts writes four files to docs/ regardless of --outDir.
- tests/v2-compare-data.test.mjs compiles the Lambert solver but executes none of its functions (function coverage).
- No test pins the numeric value of the injection ΔV formula.
- The grid kernel's axis order can be reversed without a test failing.
- A mutant drove one test process to 13 GB before the kernel killed it.
- The full catalog run finished in about an hour against an 8-hour box.

## 7. Commits on s20-longrun-research (oldest first)

- `1b43033` research(slice20): K1 return-leg oracle dataset (LR1, leads)
- `44bce62` research(slice20): fresh-clone build reproducibility (LR4)
- `0c05b04` research(slice20): catalog-wide symmetric-return error (LR2, leads)
- `fbd5ffb` research(slice20): mutation campaign over core and porkchop (LR3, partial checkpoint)
- `50496bf` research(slice20): mutation campaign over core and porkchop (LR3)
- (the commit that adds this file) docs(research): Slice 20 long run evidence

Delivery: a git bundle of origin/main..s20-longrun-research (prerequisite commit 0d31cda) sent to Hudson as a file from the session, with this report. On the laptop: `git fetch <path-to>/s20-longrun-research.bundle s20-longrun-research:s20-longrun-research`, review, then push. Nothing was pushed from the container.

## 8. .dispatch-scope contents, per commit

### .dispatch-scope for commit "research(slice20): K1 return-leg oracle dataset (LR1, leads)" (exit 0)
```
tools/slice20-research/longrun/lib/common.mjs
tools/slice20-research/longrun/lib/build.mjs
tools/slice20-research/longrun/lr1-oracle/README.md
tools/slice20-research/longrun/lr1-oracle/REPORT.md
tools/slice20-research/longrun/lr1-oracle/build-cells.mjs
tools/slice20-research/longrun/lr1-oracle/oracle_driver.py
tools/slice20-research/longrun/lr1-oracle/report.mjs
tools/slice20-research/longrun/lr1-oracle/lr1-oracle.part1of1.json.gz
tools/slice20-research/longrun/lr1-oracle/lr1-summary.json
tools/slice20-research/longrun/LOG.md
tools/slice20-research/longrun/REPORT.md
```

### .dispatch-scope for commit "research(slice20): fresh-clone build reproducibility (LR4)" (exit 0)
```
tools/slice20-research/longrun/lr4-repro/REPORT.md
tools/slice20-research/longrun/lr4-repro/compare-build.mjs
tools/slice20-research/longrun/lr4-repro/lr4-repro.json
tools/slice20-research/longrun/LOG.md
```

### .dispatch-scope for commit "research(slice20): catalog-wide symmetric-return error (LR2, leads)" (exit 0)
```
tools/slice20-research/longrun/lib/common.mjs
tools/slice20-research/longrun/lr2-symmetric/README.md
tools/slice20-research/longrun/lr2-symmetric/REPORT.md
tools/slice20-research/longrun/lr2-symmetric/lookup-verification.json
tools/slice20-research/longrun/lr2-symmetric/lr2-summary.json
tools/slice20-research/longrun/lr2-symmetric/lr2-symmetric-0of3.json
tools/slice20-research/longrun/lr2-symmetric/lr2-symmetric-1of3.json
tools/slice20-research/longrun/lr2-symmetric/lr2-symmetric-2of3.json
tools/slice20-research/longrun/lr2-symmetric/run-shard.mjs
tools/slice20-research/longrun/lr2-symmetric/summarize.mjs
tools/slice20-research/longrun/lr2-symmetric/verify-lookup.mjs
tools/slice20-research/longrun/LOG.md
tools/slice20-research/longrun/REPORT.md
```

### .dispatch-scope for commit "research(slice20): mutation campaign over core and porkchop (LR3, partial checkpoint)" (exit 0)
```
tools/slice20-research/longrun/lr3-mutation/README.md
tools/slice20-research/longrun/lr3-mutation/REPORT.md
tools/slice20-research/longrun/lr3-mutation/SURVIVORS.md
tools/slice20-research/longrun/lr3-mutation/lr3-mutation.json
tools/slice20-research/longrun/lr3-mutation/mutate.mjs
tools/slice20-research/longrun/lr3-mutation/plan.mjs
tools/slice20-research/longrun/lr3-mutation/report.mjs
tools/slice20-research/longrun/lr3-mutation/survivor-notes.json
tools/slice20-research/longrun/status-block.mjs
tools/slice20-research/longrun/LOG.md
```

### .dispatch-scope for commit "research(slice20): mutation campaign over core and porkchop (LR3)" (exit 0)
```
tools/slice20-research/longrun/lr3-mutation/README.md
tools/slice20-research/longrun/lr3-mutation/REPORT.md
tools/slice20-research/longrun/lr3-mutation/SURVIVORS.md
tools/slice20-research/longrun/lr3-mutation/lr3-mutation.json
tools/slice20-research/longrun/lr3-mutation/mutate.mjs
tools/slice20-research/longrun/lr3-mutation/plan.mjs
tools/slice20-research/longrun/lr3-mutation/pruning-sample.mjs
tools/slice20-research/longrun/lr3-mutation/report.mjs
tools/slice20-research/longrun/lr3-mutation/survivor-notes.json
tools/slice20-research/longrun/LOG.md
```

### .dispatch-scope for commit "docs(research): Slice 20 long run evidence" (written before the commit; this file is part of it)
```
tools/slice20-research/longrun/REPORT.md
tools/slice20-research/longrun/LOG.md
tools/slice20-research/longrun/final-report.mjs
```

## 9. Not done

- Nothing was pushed or merged; the branch exists only in this container's clone and in the bundle.
- No test was written, no production file was changed, no DEC or founding doc was touched.
- LR1: M=2; a closure tolerance. LR2: M=1 returns; any joint objective (OQ-20-1). LR3: higher-order mutants as a campaign (one second-order check was done by hand, section 4); line-level coverage; a second reader for the hand notes.
- The laptop was not involved at any point; nothing here verifies the laptop's environment.

