LONGRUN2: COMPLETE (XR0, XR1, XR2, XR3 all ran to the end; one container reboot mid-run, resumed from checkpoints)
HOST: Linux x86_64 node v22.23.4 | 4 cores | COMMITS: 6 on s20-longrun2-research before the commit that adds this file, tip fddf452 (a file cannot hold its own commit hash)
XR0 LR2 CROSS-CHECK: 540 bodies | agree 540 | differ 0 | max |Δerror| 0 km/s | VALIDATES LR2
XR1 CACHE: provenance DRIFT: precomputeScriptSha256 | bodies recomputed 41,906 | status changes 0 | minC3 max rel diff 2.117e-13 (1,787 bodies differ in a stored digit) | screening-colour changes 0
XR2 VALIDITY: outbound cells swept 1,804,638,825 (COMPLETE) | through-Sun converged cells 5,563,614 (0.308%) | bodies with >=1 39,920 | affecting a shipped best window 0
XR3 M=1 RETURNS: 41,906 of 41,906 bodies (39,993 measured) | median |error| 9.262 km/s (M=0+M=1) against 8.972 (M=0 only) | overcharge share 97.4%

# S20_LONGRUN2 final report

**XR1 PROVENANCE DRIFT: precomputeScriptSha256.** The shipped screening cache records a sha256 for the script that built it, and that script has been edited twice since (2026-08-05). Both input fixtures still match, and the recomputed cache changes nothing the catalog displays, but it is not bit-identical to the shipped file.

Everything below is LEADS-grade research evidence. **No XR number is validated, with one exception: XR0's verdict about LR2, which is what XR0 is for.** Nothing here enters a DEC, a test, a fixture or the site.

## 0. Host, base and rules kept

| Item | Value |
| --- | --- |
| Host | Cloud Linux container (Claude Code on the web), the same container the first long run used; rebooted once at about 08:27Z during this run |
| OS / arch / node / npm / python | Linux / x86_64 / v22.23.4 / 10.9.9 / 3.13.18 |
| Cores / RAM / free disk | 4 / 16 GB / 23 GB free at the end (lowest seen 23 GB; floor 5 GB) |
| Canonical tree `C:\Users\hudso\asteroid-mining-planner` | does not exist on this host (expected by the dispatch); nothing to touch |
| pwd / remote | `/home/user/asteroid-mining-planner` / `https://github.com/hudsonclavin-cloud/asteroid-mining-planner` |
| origin/main at start | `75606da39d4a6a0bb7022b3457e0e06ed7f6a8dd` |
| Worktree / branch | `<scratch>/aster-longrun2` / `s20-longrun2-research` |
| Throwaway clone for the recompute | `<scratch>/aster-tmp-xr1`, full history, never committed from |
| poliastro venv | present from the first run (python 3.12.3, poliastro 0.17.0); not needed and not used; nothing installed in this run |
| `npm run verify` at start | exit 0 — 109/109 files, 363 tests passed, 0 failed |
| `npm run verify` at end | exit 0 — 109/109 files, 363 tests passed, 0 failed |

- **Context mismatch, recorded, no XR halted by it.** The dispatch expects main to carry Front A's sweep fix and six protected hand-commits, and to verify at 111 files / 370 tests. origin/main at start holds exactly seven commits past `0d31cda`: the six first-long-run commits and their merge. No path outside `tools/slice20-research/longrun/` differs from `0d31cda`, and verify is 109 files / 363 tests, the same as the first run. Everything here was therefore measured against the `0d31cda` source tree.
- One agent. No sub-agent, swarm, workflow or second session. Long work ran as background processes with checkpoints.
- No push, no merge, no ASTER_* override, no package added. Every committed path is under `tools/slice20-research/longrun2/`. The precompute script and every shipped fixture were read only; the script ran unedited in the throwaway clone.
- Each commit carries one trailer line (`Claude-Session: ...`) after the dispatch's subject line.

## 1. XR0 — independent cross-check of LR2

**VERDICT: this VALIDATES LR2's primary column** on the 540 bodies compared.

**What ran.** A standalone script that imports nothing from the first long run: its own loops over the outbound and return grids with direct calls to the production solver, the production linear-scan Earth lookup, an epoch test for the DEC-20-3 refusal. LR2 used `computeCompareData`, the grid kernel with swapped providers, a NaN sentinel and its own bisection lookup. Clock: 07:09-07:42Z (1,917 s for the full run, one process), inside the 1.5 h box.

**How much.** COMPLETE: 540 bodies (3 gate, 498 first-500, 39 lr2-extreme). Gate first: the three S20_01 R3 min-C3 rows reproduced (433 6.9049 / 3.0337; 99942 5.8407 / 1.0916; 2000 SG344 1.3891 / 0.1476).

**Headline.** 540 of 540 bodies agree on every compared field (status, window, assumed burn, refused-cell count, computed minimum and its cell, error) after LR2's own 6-decimal rounding; 0 differ; max |Δerror| 0 km/s. LR2's full-precision working file was still on this host (it is not committed evidence): against it, 503 of 503 bodies with an error on both sides are bit-identical.

**Outliers.** None: no disagreeing body.

**What it does not cover.** LR2's secondary (best-stack) column; the other 41,366 bodies; anything both paths share by definition (the production solver, propagator, `segmentWindows`, the 723 x 100 return grid). The sample is not random: all 498 non-gate bodies from the first 500 are numbered objects, plus LR2's own extreme rows.

**Needs Nova's ruling.** Whether 540 bodies with bit-identical results from an independent path is enough to lift LR2's "UNVALIDATED" label for the primary column, and whether the secondary column needs the same treatment before DEC-20-7 leans on it.

## 2. XR1 — shipped screening cache: provenance, reproducibility, solver drift

**Provenance check (reported before the recompute started).**
| Check | Verdict | Now | Recorded |
| --- | --- | --- | --- |
| catalog fixture sha256 | MATCH | `f88028d283984229...` | `f88028d283984229...` |
| horizons fixture sha256 | MATCH | `b278dd5567f30266...` | `b278dd5567f30266...` |
| precompute script sha256 | **DRIFT** | `124637322914b33e...` | `44d9443500cb280a...` |
| docs/ cache = tests/ cache | MATCH | `bd27b9bd882a6534...` | `bd27b9bd882a6534...` |

- solverCommit `8471659` **is** an ancestor of HEAD, 647 commits back. 35 files under `src/v2/core` and `src/v2/porkchop` differ since (30 added, 5 modified).
- Of the 28 modules the script actually compiles, 7 changed: `boundary/slice9-nea-catalog.ts`, `core/constants/index.ts`, `core/constants/near-zero-c3.ts`, `core/lambert/householder.ts`, `core/lambert/hyp2f1b.ts`, `core/lambert/initial-guess.ts`, `core/lambert/izzo.ts`. Read from the diff: the executable changes are a catalog-size assertion, an `M != 0` guard in `izzo.ts` the script never takes, and a new unused constant; the rest is comments. Of the seven solver files Nova listed, the script compiles four (`izzo.ts`, `householder.ts`, `hyp2f1b.ts`, `initial-guess.ts`) and only `izzo.ts` changed executable code; `lambert-multi-rev.ts`, `dla.ts` and `feasibility.ts` were added later and are not imported by the script.
- The drifted script hash is explained: the recorded value is the script as committed in `9e93ffc`, one commit after the recorded solverCommit (whose own script hashes differently). [Likely] the cache was built in a tree whose HEAD was `8471659` with the new script not yet committed. Two later commits (fixture path, tsc invocation) changed the script without changing what it computes.

**Recompute.** The unedited script, no arguments, in a throwaway clone: exit 0, Precompute complete in 2760.3s, 1,804,638,825 solves (shipped: 1,804,638,825 in 3137.7 s).

| Diff, all 41,906 bodies | Count |
| --- | ---: |
| Status changes | 0 |
| isCoOrbital changes | 0 |
| minC3Date / minC3TofDays changes | 0 |
| Different top window / different top-5 set | 0 / 0 |
| Bodies whose stored minC3 differs at all | 1,787 |
| ... max / median relative difference | 2.117e-13 / 3.908e-15 |
| Bodies with the same five windows but a different stored digit | 6,795 |
| Metadata differences beyond generatedAt, wallTimeSeconds, totalSolves, provenance | 0 |
| **Bodies the catalog would show differently** | **0** |
| ... status badge / LOW-HIGH class / C3 text / co-orbital tag / near-zero flag / 3D colour | 0 / 0 / 0 / 0 / 0 / 0 |
| A stored value changes but nothing displayed does | 1,787 |

**The question that matters: 0 bodies would be shown differently.** The mapping was read from the code that consumes the cache (status badge labels, `formatC3` to three significant figures, the co-orbital tag, the near-zero flag, `getScreeningColor`). The recomputed file is nonetheless **not byte-identical**: bodies section differs, sha256 `7225df829c41f1ab...` against `bd27b9bd882a6534...`.

**Why the digits differ.** Not the committed source changes. The recorded commit's solver and today's solver, both run on this host, agree bit for bit on 4,306,500 of 4,306,500 cells (100 bodies); the old solver run here reproduces the shipped minC3 for 0 of 75 changed bodies and 25 of 25 unchanged ones. The computation calls `Math.sin`, `cos`, `pow`, `exp`, `log`, `acos` and `asinh`, which ECMAScript leaves implementation-approximated, so a different V8 build or CPU can legitimately change last bits. [Likely] that is the cause; the cache records no host or Node version. Not excluded: a solver edit present but uncommitted when the May cache was built and never committed since.

**Second mechanism: can the catalog and the porkchop page disagree about a body?** Not on this evidence. Over 300 seeded bodies (12,919,500 cells) `izzo.ts` and `lambert-multi-rev.ts` at M=0 converge on exactly the same cells (0 / 0 one-sided) and the largest per-cell relative C3 difference is exactly 0. No body straddles 25 km²/s², including the 25 nearest the threshold (21 of them outside the sample). Against the shipped cache the multi-rev minimum differs by at most 1.736e-14 relative: the shipped-versus-recomputed difference above, which is the same for either solver.

**Outliers.** The 25 largest relative minC3 differences are listed in xr1-cache-repro/REPORT.md. 16 of the 25 have C3 below 0.1 km²/s² and the largest C3 among them is 1.22, as expected when a last-bit difference in v∞ is divided by a small C3. The largest relative difference, 2.117e-13, is on 2004 TD18 at C3 0.02361 km²/s².

**Needs Nova's ruling.**
1. What to do about the stale script hash. Regenerating the cache would refresh the provenance and change stored digits for 1,787 bodies while changing nothing displayed; leaving it means the recorded hash describes a script version that no longer exists on main.
2. Whether "the cache reproduces" should mean byte-identical. On this evidence it does not across hosts today: the same committed source gives different last digits here than in the shipped file. "Reproduces to every displayed value" does hold.
3. Whether the cache should record its host and Node version, and whether something should check the three hashes (a hash-only check needs no git history).
4. The recorded solverCommit is the parent of the commit that carries the cache, and [Likely] the script was uncommitted when it ran. That is the same pattern STATUS.md records for the MCP package (built from a dirty worktree).
5. Nothing on the site reads `bestWindows`; `minC3Date` and `minC3TofDays` are read only by the MCP tool. `bestWindows` is about 26 MB of the 34.5 MB shipped file (re-serialised without it, the cache is 8.0 MB). Is it still wanted there?

## 3. XR2 — physical-validity census

**The ruling-critical count: 0.** Flagged = transfer perihelion below one solar radius and the flown arc passes perihelion (LR1's definition, copied with its source cited).

| What the site shows | checked | flagged |
| --- | ---: | ---: |
| The cache's minC3 cell | 41,905 | 0 |
| The cache's bestWindows | 209,525 | 0 |
| Compare's bestPractical argmin | 41,444 | 0 |
| Any cell inside compare's bestPractical window | 1,364,717 cells in 41,444 windows | 0 cells in 0 windows |

**Zero, stated plainly:** no shown minimum, no cached best window and no cell of any compare best-practical window flies through the Sun. A perihelion refusal would be a quiet fix: it would remove cells from the grids and change no number the site shows as a best window today. The closest any compare window comes is a transfer perihelion of 0.477 AU.

**What ran.** The precompute script takes no hooks and may not be edited, so the outbound census is an independent sweep of the same screening grid with the production kernel, plus the compare page's grid through `computeCompareData`, for every body. Clock: outbound census 07:13-08:25Z on three processes, stopped by the container reboot, resumed from checkpoints at 08:28Z and finished 08:39Z; return census 07:43-07:54Z. Inside the 3 h box.

| Grid | state | bodies | cells swept | converged | flagged | share of converged | bodies with >= 1 | perihelion < 1 solar radius | < 0.01 AU | < 0.1 AU |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Outbound, screening grid (783 x 55) | COMPLETE | 41,905 | 1,804,638,825 | 1,804,638,824 | 5,563,614 | 0.308% | 39,920 | 2.414% | 4.145% | 17.13% |
| Outbound, compare grid (731 x 100) | COMPLETE | 41,905 | 3,063,255,500 | 3,063,255,500 | 9,297,858 | 0.304% | 40,237 | 2.417% | 4.150% | 17.15% |
| Return grid (731 x 100), 400 seeded bodies; counts are converged BRANCHES at M=0 and M=1 | COMPLETE | 400 | 25,508,400 admissible cells | 56,805,834 branches | 933,560 | 1.643% |  |  |  |  |

Transfer perihelion over all converged screening cells, deciles in AU: p10 0.0398, p20 0.132, p30 0.263, p40 0.407, p50 0.562, p60 0.708, p70 0.832, p80 0.933, p90 0.977. By tier and orbit class: xr2-validity/REPORT.md.

**Return grid.** 933,560 of 56,805,834 converged branches flagged (1.64%) against LR1's 219 of 14,124 (1.55%). M=0: 79,648 of 25,508,400 (0.31%; LR1 0.28%). M=1: 853,912 of 31,297,434 (2.73%; LR1 2.49%). The smallest asteroid-departure |v∞| on any flagged return branch is 3.974 km/s.

**Bonus from the same sweep.** The kernel's minimum C3 (lambert-multi-rev, M=0) against the shipped izzo value for 41,905 bodies: max relative difference 1.199e-8, median 8.440e-12, same minimum cell for 41,905, a different cell for 0, 0 on opposite sides of 25 km²/s². The kernel reaches its epochs through a Julian date, so its epochs differ from the script's by rounding. [Likely] that rounding, not the solver, accounts for nearly all of this difference: on identical epochs XR1 found the two solvers bit-identical, and shipped against recomputed differ by at most 2.117e-13.

**Outliers.** Flagged cells per body on the screening grid: min 0, median 58, max 6297 of 43,065. Not propagatable (skipped): 2015 D1.

**Needs Nova's ruling.**
1. Whether K1 (and the outbound grids) should refuse or label cells whose arc passes inside the Sun. On this evidence it changes no shown best window.
2. Where the line goes. One solar radius is LR1's definition: 2.41% of converged screening cells have a transfer perihelion below it, 4.14% below 0.01 AU and 17.1% below 0.1 AU. A thermal limit would remove far more grid cells than the solar-radius flag does. No cell of any compare best-practical window has a transfer perihelion below 0.477 AU; for the cache's minC3 cells and best windows this run recorded only the solar-radius flag.
3. Whether a refusal belongs in the kernel (a protected file) or in the layer that displays cells.

## 4. XR3 — LR2 with M=1 returns admitted

**What ran.** A copy of LR2's merged `run-shard.mjs` with the return leg solved at M=0 and M=1 (both branches); nothing else changed. Reusing LR2's pipeline is deliberate: this measures M=1, not the pipeline. Clock: four processes started 08:29-08:39Z as cores freed, finished 10:24-10:37Z (6,898-7,063 s each). Inside the 3 h box.

**How much.** COMPLETE. Status: all-return-cells-refused 1,451; ok 39,993; no-practical-window 461; outbound-refused:not-propagatable 1. The M=0 values equal LR2's committed rows for the same bodies: primary error 41,906 of 41,906, secondary error 41,906 of 41,906.

| Window | bodies (paired) | returns | median \|error\| | p90 \|error\| | overcharge share | inside 0.08-5.1 km/s | M=1 is the minimum | median gain when it is |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Primary: compare-path best window** | 39,993 | M=0 only | 8.972 | 17.838 | 97.3% | 18.8% |  |  |
|  |  | M=0 and M=1 | 9.262 | 18.062 | 97.4% | 16.2% | 20,455 (51.1%) | 0.402 km/s |
| ... complete pairing windows | 22,210 | M=0 only | 9.453 | 18.237 | 99.7% | 13.8% |  |  |
|  |  | M=0 and M=1 | 9.840 | 18.541 | 99.9% | 10.5% | 14,626 (65.9%) | 0.395 km/s |
| Secondary: best sample-return stack cell | 37,842 | M=0 only | 0.775 | 3.194 | 33.7% | 87.3% |  |  |
|  |  | M=0 and M=1 | 0.526 | 3.082 | 47.0% | 84.2% | 22,586 (59.7%) | 0.389 km/s |
| ... complete pairing windows | 20,019 | M=0 only | 0.612 | 2.035 | 40.3% | 91.3% |  |  |
|  |  | M=0 and M=1 | 0.399 | 1.547 | 58.4% | 87.0% | 14,855 (74.2%) | 0.409 km/s |

**Reading.** Admitting M=1 can only lower the computed return burn, so every error moves up (toward overcharge) or stays. When an M=1 cell is the minimum it beats the best M=0 cell by a median 0.402 km/s at the primary window (p90 1.370, max 15.073) and 0.389 km/s at the secondary (p90 1.534, max 14.712). At the secondary window 5,033 bodies flip from undercharge to overcharge; at the primary 52.

**Is an M=1 minimum a through-Sun arc? (beyond the dispatch, using XR2's flag)** Primary window: the overall minimum is flagged for 1 of 39,993 bodies, and M=1 wins only because of a flagged arc for 0; the best M=1 cell taken alone is flagged for 15. Secondary window: 6, 0 and 3. So the M=1 numbers above are not produced by arcs through the Sun.

One finding about LR2 itself: **LR2's own M=0 minimum is a through-Sun arc for 1 primary and 6 secondary rows** (154300 primary, 523822 secondary, 2025 NT1 secondary, 2017 FA102 secondary, 2022 FC2 secondary, 2023 TJ secondary, 2022 GK2 secondary). Every one sits on a pairing window with 71,199 to 72,297 of 72,300 cells refused, so its minimum came from 3 to 1,101 cells. LR2's committed rows are left as recorded; none of these values is shown on the site, so XR2's count of zero is unaffected.

**Outliers.** The ten largest M=1 gains per window are in xr3-m1-returns/REPORT.md, each with its refused-cell count; at the primary window 6 of the ten sit on truncated pairing windows, and the largest gain is 15.073 km/s (2010 UB).

**Needs Nova's ruling.**
1. DEC-20-2 says M=0 only where compare is involved. These numbers show what excluding M=1 changes, per window type.
2. XR2's return census finds every M=1 branch whose orbit has its perihelion inside the Sun does pass it. If M=1 returns are admitted anywhere, the perihelion ruling (section 3) applies to them first.

## 5. Anything surprising - list only

- origin/main did not carry Front A's sweep fix or the six protected hand-commits the dispatch expected; verify was 109 files / 363 tests, not 111 / 370.
- The container rebooted at about 08:27Z and killed every background job; all of them resumed from their checkpoints.
- The precompute-script hash recorded in the cache belongs to commit 9e93ffc, one commit after the cache's recorded solverCommit.
- Nothing in the repo checks the cache's three provenance hashes; the script hash has been stale since 2026-08-05.
- The same committed solver, run here, lands on different last digits from the shipped cache for 1,787 bodies.
- izzo.ts and lambert-multi-rev.ts at M=0 are bit-identical on every one of 13.8 million screening cells compared.
- Exactly one screening cell in the catalog fails both solvers: 2019 XV, a 0.05-degree transfer angle.
- 39,920 of 41,905 bodies have at least one through-Sun cell on the screening grid, yet no shown window touches one; the closest compare window has a transfer perihelion of 0.477 AU.
- Every M=1 return branch whose transfer perihelion is inside the Sun flies through it (853,912 of 853,912 in the 400-body census).
- No non-test module reads bestWindows, which is about 26 MB of the 34.5 MB shipped cache (the cache re-serialised without it is 8.0 MB).
- At compare's window M=1 gives the cheapest return for about half the bodies, and admitting it makes the symmetric charge look worse there, not better.
- LR2's own M=0 minimum is a through-Sun arc for 7 rows, all on pairing windows the fixture end had all but emptied.
- The recompute took 2,760 s here against 3,137 s recorded, with three other jobs sharing the machine.

## 6. Commits on s20-longrun2-research (oldest first)

- `9429f9a` research(slice20): independent cross-check of the LR2 symmetric-return measurement (XR0)
- `553dc5d` research(slice20): shipped screening cache reproducibility and solver drift (XR1)
- `68fe296` research(slice20): physical-validity census of outbound and return grids (XR2)
- `6903c3d` research(slice20): correct two over-strong statements in the XR0 and XR1 reports
- `cf9bb48` research(slice20): M=1 returns in the symmetric-return measurement (XR3, partial checkpoint)
- `fddf452` research(slice20): M=1 returns in the symmetric-return measurement (XR3)
- (the commit that adds this file) docs(research): Slice 20 second long run evidence

Delivery: a git bundle of origin/main..s20-longrun2-research (prerequisite commit 75606da), sent as a file from the session together with the reports. On the laptop: `git fetch <path>/s20-longrun2-research.bundle s20-longrun2-research:s20-longrun2-research`, review, then push. Nothing was pushed from the container.

## 7. .dispatch-scope contents, per commit

### .dispatch-scope for commit "research(slice20): independent cross-check of the LR2 symmetric-return measurement (XR0)" (exit 0)
```
tools/slice20-research/longrun2/README.md
tools/slice20-research/longrun2/REPORT.md
tools/slice20-research/longrun2/LOG.md
tools/slice20-research/longrun2/xr0-lr2-crosscheck/README.md
tools/slice20-research/longrun2/xr0-lr2-crosscheck/REPORT.md
tools/slice20-research/longrun2/xr0-lr2-crosscheck/crosscheck.mjs
tools/slice20-research/longrun2/xr0-lr2-crosscheck/xr0-summary.json
tools/slice20-research/longrun2/xr0-lr2-crosscheck/xr0-rows.json
```

### .dispatch-scope for commit "research(slice20): shipped screening cache reproducibility and solver drift (XR1)" (exit 0)
```
tools/slice20-research/longrun2/lib/build.mjs
tools/slice20-research/longrun2/lib/common2.mjs
tools/slice20-research/longrun2/xr1-cache-repro/README.md
tools/slice20-research/longrun2/xr1-cache-repro/REPORT.md
tools/slice20-research/longrun2/xr1-cache-repro/diff-cache.mjs
tools/slice20-research/longrun2/xr1-cache-repro/second-solver.mjs
tools/slice20-research/longrun2/xr1-cache-repro/old-solver-check.mjs
tools/slice20-research/longrun2/xr1-cache-repro/report.mjs
tools/slice20-research/longrun2/xr1-cache-repro/xr1-cache-diff.json
tools/slice20-research/longrun2/xr1-cache-repro/xr1-second-solver.json
tools/slice20-research/longrun2/xr1-cache-repro/xr1-old-solver-check.json
tools/slice20-research/longrun2/xr1-cache-repro/provenance-git-facts.json
tools/slice20-research/longrun2/xr1-cache-repro/solver-diff-8471659-to-HEAD.patch
tools/slice20-research/longrun2/xr1-cache-repro/script-diff-9e93ffc-to-HEAD.patch
tools/slice20-research/longrun2/xr1-cache-repro/recompute.log
tools/slice20-research/longrun2/xr1-cache-repro/recomputed-lambert-screen-cache.json.gz
tools/slice20-research/longrun2/LOG.md
```

### .dispatch-scope for commit "research(slice20): physical-validity census of outbound and return grids (XR2)" (exit 0)
```
tools/slice20-research/longrun2/xr2-validity/README.md
tools/slice20-research/longrun2/xr2-validity/REPORT.md
tools/slice20-research/longrun2/xr2-validity/census-shard.mjs
tools/slice20-research/longrun2/xr2-validity/return-census.mjs
tools/slice20-research/longrun2/xr2-validity/summarize.mjs
tools/slice20-research/longrun2/xr2-validity/xr2-outbound-0of3.json
tools/slice20-research/longrun2/xr2-validity/xr2-outbound-1of3.json
tools/slice20-research/longrun2/xr2-validity/xr2-outbound-2of3.json
tools/slice20-research/longrun2/xr2-validity/xr2-return-census.json
tools/slice20-research/longrun2/xr2-validity/xr2-summary.json
tools/slice20-research/longrun2/LOG.md
```

### .dispatch-scope for commit "research(slice20): correct two over-strong statements in the XR0 and XR1 reports" (exit 0)
```
tools/slice20-research/longrun2/xr1-cache-repro/report.mjs
tools/slice20-research/longrun2/xr1-cache-repro/REPORT.md
tools/slice20-research/longrun2/xr0-lr2-crosscheck/crosscheck.mjs
tools/slice20-research/longrun2/xr0-lr2-crosscheck/REPORT.md
tools/slice20-research/longrun2/xr0-lr2-crosscheck/xr0-summary.json
tools/slice20-research/longrun2/LOG.md
```

### .dispatch-scope for commit "research(slice20): M=1 returns in the symmetric-return measurement (XR3, partial checkpoint)" (exit 0)
```
tools/slice20-research/longrun2/xr3-m1-returns/README.md
tools/slice20-research/longrun2/xr3-m1-returns/REPORT.md
tools/slice20-research/longrun2/xr3-m1-returns/run-shard-m1.mjs
tools/slice20-research/longrun2/xr3-m1-returns/summarize.mjs
tools/slice20-research/longrun2/xr3-m1-returns/xr3-summary.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-0of4.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-1of4.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-2of4.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-3of4.json
tools/slice20-research/longrun2/LOG.md
```

### .dispatch-scope for commit "research(slice20): M=1 returns in the symmetric-return measurement (XR3)" (exit 0)
```
tools/slice20-research/longrun2/xr3-m1-returns/README.md
tools/slice20-research/longrun2/xr3-m1-returns/REPORT.md
tools/slice20-research/longrun2/xr3-m1-returns/run-shard-m1.mjs
tools/slice20-research/longrun2/xr3-m1-returns/summarize.mjs
tools/slice20-research/longrun2/xr3-m1-returns/xr3-summary.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-0of4.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-1of4.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-2of4.json
tools/slice20-research/longrun2/xr3-m1-returns/xr3-m1-3of4.json
tools/slice20-research/longrun2/LOG.md
```

### .dispatch-scope for commit "docs(research): Slice 20 second long run evidence" (written before the commit; this file is part of it)
```
tools/slice20-research/longrun2/REPORT.md
tools/slice20-research/longrun2/LOG.md
tools/slice20-research/longrun2/final-report.mjs
```

## 8. Not done

- Nothing pushed or merged; the branch exists in this container's clone and in the bundle.
- No test, fixture or production file changed; the precompute script ran unedited in a throwaway clone.
- XR0 re-derived LR2's primary column for 540 of 41,906 bodies; the secondary column was not re-derived.
- XR1: the cause of the last-digit drift is [Likely] the runtime or machine, not proven. Settling it needs the machine and Node version that built the May cache.
- XR2: the outbound census is M=0 only (the porkchop page's M=1 outbound grid was not censused); the precompute script itself was not instrumented.
- XR3: no M=2, no joint objective (OQ-20-1); the return grid resolution is LR2's.
- The laptop was not involved; nothing here checks the laptop's environment.

