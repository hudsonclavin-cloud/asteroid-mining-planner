# XR1 — shipped screening cache: provenance, reproducibility, solver drift

**LEADS-grade research evidence. Nothing here enters a DEC, a test, a fixture or the site.**

**Provenance: DRIFT (precomputeScript).** **Reproducibility: the recomputed cache differs from the shipped one for 1,787 bodies in minC3.** Bodies the catalog would show differently: **0**.

## 1. Provenance check (done before the recompute started)
| Check | Verdict | Now | Recorded in the cache |
| --- | --- | --- | --- |
| sha256 of `tests/fixtures/v2/nea-catalog-slice9.json` | MATCH | `f88028d2839842299b7aae20644d15fef265b19e3bbca576c5dd0faf7d231418` | `f88028d2839842299b7aae20644d15fef265b19e3bbca576c5dd0faf7d231418` |
| sha256 of `src/v2/data/horizons-inner-solar-system-2026-2040.json` | MATCH | `b278dd5567f30266593c49bf4fef203e7570d3613187fd112dc7015109a39c15` | `b278dd5567f30266593c49bf4fef203e7570d3613187fd112dc7015109a39c15` |
| sha256 of `tools/build/precompute-lambert-screen.mjs` | **DRIFT** | `124637322914b33e388a362ee96e87cde40718c2366c93f21b355afe2995c780` | `44d9443500cb280a625fc99cfd12756c2928430390cda8c46d7b55763f6db4f7` |
| `docs/` cache byte-identical to `tests/fixtures/v2/` cache | MATCH | `bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206` (34,499,477 bytes) | `bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206` (34,499,477 bytes) |

**solverCommit `8471659`** (2026-05-29, "fix(v2): Slice 10 regenerate Phase C.1 screening cache after initial-guess fix (audit Finding 1)"): IS an ancestor of HEAD `75606da`; 647 commits later.

What the script hash drift is:
- The recorded hash 44d94435... is the script as committed in 9e93ffc (2026-05-30, "refactor(v2): Slice 10 cache contract overhaul (audit Findings 2, 3, 4, 5)"), the commit that last changed the cache file. So the cache was written by that version of the script, run in a tree whose HEAD was still 8471659; the recorded solverCommit is the parent of the commit that carries the cache.
- 8471659 -> 9e93ffc changed nothing under src/v2/core, so the recorded commit does identify the solver source the cache was built with.
- Two later commits changed the script: be5ef60 (2026-08-05, repoint the Horizons fixture path from tests/fixtures to src/v2/data) and 6d9b8bc (2026-08-05, invoke tsc through process.execPath instead of the .bin shim). Neither touches the grid, the solver call or the output (script-diff-9e93ffc..HEAD.patch).
- Nothing in the repo recomputes these hashes or compares them with the files beside the cache (the drift went unnoticed from 2026-08-05 until this run).

Files under `src/v2/core` and `src/v2/porkchop` that differ between `8471659` and HEAD: **35** (30 added, 5 modified). Full list in `provenance-git-facts.json`. Of the modules the precompute script actually compiles:
| Module | Changed since the recorded commit | Lines +/- | Commits that touched it |
| --- | --- | --- | --- |
| `src/v2/boundary/horizons.ts` | no |  |  |
| `src/v2/boundary/slice9-nea-catalog.ts` | **yes** | +7 / -0 | 41b560b 2026-07-07 Slice 14 Phase E: About catalog count renders from real source (INV-026) |
| `src/v2/core/constants/asteroids.ts` | no |  |  |
| `src/v2/core/constants/bodies.ts` | no |  |  |
| `src/v2/core/constants/index.ts` | **yes** | +4 / -0 | b214e26 2026-10-10 feat(core): near-zero C3 degeneracy threshold + predicate (DEC-19-1) |
| `src/v2/core/constants/near-zero-c3.ts` | **yes** | +10 / -0 | b214e26 2026-10-10 feat(core): near-zero C3 degeneracy threshold + predicate (DEC-19-1) |
| `src/v2/core/frames/ids.ts` | no |  |  |
| `src/v2/core/frames/index.ts` | no |  |  |
| `src/v2/core/frames/transform.ts` | no |  |  |
| `src/v2/core/index.ts` | no |  |  |
| `src/v2/core/interpolators/hermite.ts` | no |  |  |
| `src/v2/core/interpolators/index.ts` | no |  |  |
| `src/v2/core/invariants/assertions.ts` | no |  |  |
| `src/v2/core/invariants/index.ts` | no |  |  |
| `src/v2/core/invariants/round-trip.ts` | no |  |  |
| `src/v2/core/invariants/runtime.ts` | no |  |  |
| `src/v2/core/lambert/householder.ts` | **yes** | +3 / -1 | b7d3329 2026-07-11 docs(core): unify Lambert provenance wording — clean-room per DEC-1 Rev 2 / INV-015, poliastro as oracle per INV-024 (comment-only diff, 3 files) |
| `src/v2/core/lambert/hyp2f1b.ts` | **yes** | +11 / -13 | f455697 2026-05-30 docs(v2): Slice 10 narrow hyp2f1b documented domain to [0, 0.5] (audit Finding 8) |
| `src/v2/core/lambert/initial-guess.ts` | **yes** | +4 / -1 | b7d3329 2026-07-11 docs(core): unify Lambert provenance wording — clean-room per DEC-1 Rev 2 / INV-015, poliastro as oracle per INV-024 (comment-only diff, 3 files) |
| `src/v2/core/lambert/izzo.ts` | **yes** | +18 / -2 | b7d3329 2026-07-11 docs(core): unify Lambert provenance wording — clean-room per DEC-1 Rev 2 / INV-015, poliastro as oracle per INV-024 (comment-only diff, 3 files); dbf8f42 2026-05-30 feat(v2): Slice 10 lambert() rejects M != 0 explicitly (audit Finding 7) |
| `src/v2/core/lambert/tof.ts` | no |  |  |
| `src/v2/core/lambert/vec3.ts` | no |  |  |
| `src/v2/core/propagators/index.ts` | no |  |  |
| `src/v2/core/propagators/keplerian.ts` | no |  |  |
| `src/v2/core/state.ts` | no |  |  |
| `src/v2/core/types.ts` | no |  |  |
| `src/v2/core/units.ts` | no |  |  |
| `src/v2/core/units/utc-to-tdb.ts` | no |  |  |

Not imported by the script (so they cannot affect the cache): `src/v2/core/lambert/dla.ts`, `src/v2/core/lambert/feasibility.ts`, `src/v2/core/lambert/lambert-multi-rev.ts`. They were added after the recorded commit.

## 2. Recompute
`node tools/build/precompute-lambert-screen.mjs`, unedited, no arguments, in a throwaway full-history clone at `75606da`; it wrote to its hard-coded path inside that clone and the result was copied to scratch. Exit 0. Precompute complete in 2760.3s. Total solves: 1804638825 (shipped metadata: 1,804,638,825 solves in 3137.744173 s). Co-orbital bodies tagged: 130.

|  | Shipped | Recomputed |
| --- | --- | --- |
| sha256 | `bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206` | `7225df829c41f1ab9e13a5360931000680f7592e9073ad321d88517c514fd9e5` |
| bytes | 34,499,477 | 34,499,447 |
| generatedAt | 2026-05-30T04:43:31.918Z | 2026-11-14T07:52:30.975Z |
| provenance.solverCommit | `8471659` | `75606da` |
| provenance.precomputeScriptSha256 | `44d9443500cb...` | `124637322914...` |

Whole file identical: no (the metadata block necessarily differs: generatedAt, wallTimeSeconds, provenance). **Bodies section (everything after the metadata) byte-identical: NO.** The recomputed file: recomputed-lambert-screen-cache.json.gz (8250979 bytes gzip).

## 3. Diff, all bodies
| Measure | Value |
| --- | ---: |
| Bodies shipped / recomputed | 41,906 / 41,906 |
| Same body order | yes |
| Missing from / extra in the recompute | 0 / 0 |
| Status changes | 0 |
| isCoOrbital changes | 0 |
| Bodies whose minC3 changes at all | 1,787 |
| max relative minC3 difference | 2.117e-13 |
| median relative difference among changed | 3.908e-15 |
| minC3Date / minC3TofDays changes | 0 (0 with the same C3) |
| Different top window in bestWindows | 0 |
| Different top-5 set | 0 |
| Same five cells, different stored values | 6,795 |
| Metadata differences other than generatedAt, wallTimeSeconds, totalSolves, provenance | 0 |

Status matrix, shipped (rows) to recomputed (columns):
| from \ to | low_departure_c3 | high_departure_c3 | lambert_unconvergeable | propagator_failed |
| --- | ---: | ---: | ---: | ---: |
| low_departure_c3 | 41,422 | 0 | 0 | 0 |
| high_departure_c3 | 0 | 483 | 0 | 0 |
| lambert_unconvergeable | 0 | 0 | 0 | 0 |
| propagator_failed | 0 | 0 | 0 | 1 |

totalSolves: shipped 1,804,638,825, recomputed 1,804,638,825. Co-orbital bodies: shipped 130, recomputed 130.

Largest minC3 differences:
| Body | shipped | recomputed | relative |
| --- | ---: | ---: | ---: |
| 2004 TD18 | 0.023611689120174573 | 0.023611689120169574 | 2.117e-13 |
| 2025 YG2 | 0.02954995262411882 | 0.029549952624125058 | 2.111e-13 |
| 367789 | 0.003195179553984123 | 0.00319517955398471 | 1.836e-13 |
| 2025 HA19 | 0.0007717787174555122 | 0.0007717787174553732 | 1.801e-13 |
| 2008 VM | 0.00966949036949314 | 0.009669490369491605 | 1.588e-13 |
| 2015 TJ | 0.03884260538544474 | 0.03884260538545084 | 1.570e-13 |
| 2019 TX | 0.002713517363852585 | 0.0027135173638521944 | 1.440e-13 |
| 2025 UU7 | 0.037431531621525085 | 0.03743153162152016 | 1.316e-13 |
| 2022 FA | 0.051990186361905374 | 0.05199018636191158 | 1.193e-13 |
| 2017 KG5 | 0.2987156422150467 | 0.2987156422150119 | 1.165e-13 |
| 247360 | 0.19786101899823103 | 0.19786101899820813 | 1.157e-13 |
| 2017 YQ1 | 0.06496251343228211 | 0.06496251343227481 | 1.124e-13 |
| 2024 YO | 0.021090072823899606 | 0.02109007282390172 | 1.002e-13 |
| 2013 UR1 | 0.04695163200410645 | 0.04695163200411088 | 9.429e-14 |
| 2011 UD21 | 0.022914651314776092 | 0.022914651314778243 | 9.387e-14 |
| 2021 TX2 | 0.24493950679381346 | 0.24493950679379053 | 9.360e-14 |
| 2022 KU4 | 0.010615259176297355 | 0.010615259176296367 | 9.315e-14 |
| 2011 WN46 | 0.3964060494304886 | 0.3964060494304519 | 9.270e-14 |
| 2017 YC6 | 0.041851847788737975 | 0.04185184778874173 | 8.970e-14 |
| 2020 VO3 | 0.39873476644510963 | 0.3987347664450747 | 8.757e-14 |
| 2009 WR52 | 0.004725366819166099 | 0.004725366819165694 | 8.554e-14 |
| 2005 KA | 0.15198728096310013 | 0.15198728096308722 | 8.492e-14 |
| 2024 DP1 | 1.221875513771594 | 1.2218755137716901 | 7.869e-14 |
| 2021 JC1 | 0.1929139541397601 | 0.192913954139745 | 7.827e-14 |
| 2025 TS1 | 0.28716091221000534 | 0.2871609122099836 | 7.578e-14 |


### Why the last digits differ: the source, or the machine?
The cache does not record which machine or Node version built it. This recompute ran on v22.23.4, linux x64. What can be measured here:
- Both input fixtures hash-match the recorded values, so the inputs are the same bytes.
- Compiled with the same tsc, the six solver modules at the recorded commit and at HEAD differ only in comments and in one new guard in `izzo.js` (`if (M !== 0) return ...`, never taken by the script); `tof.js` and `vec3.js` are byte-identical.
- Check (`old-solver-check.mjs`): the recorded commit's solver and today's solver were both run on this host over 100 bodies (4,306,500 cells). They agree **bit for bit on 4,306,500 of 4,306,500 cells**. The old solver run here reproduces the shipped minC3 for 0 of the 25 most-changed bodies, 0 of 50 other changed bodies, and 25 of 25 unchanged ones.
- So the committed source changes since the recorded commit are not what moved the values: the same old source, run here, lands on the recomputed digits, not the shipped ones.
- The computation calls `Math.sin`, `Math.cos` (propagator), `Math.pow`, `Math.exp`, `Math.log`, `Math.acos` (initial guess) and `Math.asinh` (time-of-flight equation). ECMAScript leaves these implementation-approximated, unlike + - * / and `Math.sqrt`, so a different V8 build or CPU architecture can legitimately change last bits. The shipped file is dated 2026-05-30; the machine that built it is not recorded.
- Reading: [Likely] the runtime or machine that did the arithmetic differs. The alternative this run cannot exclude: a solver change that was present, uncommitted, when the shipped cache was built and was never committed. The provenance pattern makes that possible (the script itself was uncommitted at the time; see section 1). Two ways to settle it: rerun the unedited script on the machine and Node version that built the May cache, or record host and Node version in future cache metadata.

## 4. How many bodies would the catalog show differently
**0.** Derived from the production code that consumes the cache: production StatusBadge labels (one per status), formatC3, isCoOrbital, isNearZeroC3Degenerate, getScreeningColor(...).getHexString().

| What the site renders from the cache | Bodies that change |
| --- | ---: |
| Status badge (low C3 / high C3 / unconv. / prop fail) | 0 |
| LOW/HIGH C3 classification specifically | 0 |
| C3 text (formatC3: three significant figures) | 0 |
| Co-orbital tag | 0 |
| Near-zero-C3 flag (minC3 < 0.1) | 0 |
| 3D point colour (8-bit hex of getScreeningColor) | 0 |
| A stored value changes but nothing displayed does | 1,787 |

Read from the source, not measured: the V2 site does not show `minC3Date`, `minC3TofDays` or `bestWindows`. `mcp/src/tools/catalog-shared.ts` returns the first two; no non-test module under `src/v2` or `mcp/src` reads `bestWindows`.

## 5. Second mechanism: izzo.ts (catalog) against lambert-multi-rev.ts at M=0 (porkchop page)
300 bodies (seed 20261114; 1 all of status propagator_failed, 150 seeded from status high_departure_c3, 149 seeded from status low_departure_c3; shipped status sizes low_departure_c3 41,422, high_departure_c3 483, propagator_failed 1). Same screening grid, same epochs, same Earth states, same constants; only the solver call differs.

| Measure | Sample (300 bodies) | Extra: 25 nearest the threshold (21 not already sampled) |
| --- | ---: | ---: |
| Cells swept | 12,919,500 | 904,365 |
| Both solvers converge | 12,876,435 | 904,365 |
| Only izzo converges | 0 | 0 |
| Only lambert-multi-rev converges | 0 | 0 |
| Neither converges | 0 | 0 |
| Cells where the propagator refused | 43,065 | 0 |
| max per-cell relative C3 difference | 0.000e+0 | 0.000e+0 |
| minC3, multi-rev vs SHIPPED: max / median relative | 1.736e-14 / 0.000e+0 | 0.000e+0 / 0.000e+0 |
| minC3, multi-rev vs RECOMPUTED: max / median relative | 0.000e+0 / 0.000e+0 | 0.000e+0 / 0.000e+0 |
| Same argmin cell from both solvers | 299 | 21 |
| Bodies where the two solvers straddle 25 km²/s² | 0 | 0 |
| This loop's izzo minC3 bit-equal to the recomputed cache | 300 | 21 |
| This loop's izzo minC3 bit-equal to the shipped cache | 290 | 21 |

No body has the two solvers on opposite sides of the screening threshold, including the 25 bodies closest to it.

XR2's sweep adds the same comparison for every body (kernel epochs differ from the script's by rounding); see `../xr2-validity/REPORT.md`.

## Files
- `diff-cache.mjs` (steps 1, 3, 4), `second-solver.mjs` (step 5), `report.mjs`.
- `xr1-cache-diff.json` — every number in sections 1 to 4; `xr1-second-solver.json` — section 5 with per-body rows.
- `xr1-old-solver-check.json` and `old-solver-check.mjs` — the source-versus-machine check.
- `provenance-git-facts.json` — the answers that needed git history, taken by hand in a full-history clone; `solver-diff-8471659-to-HEAD.patch`, `script-diff-9e93ffc-to-HEAD.patch` — the actual source differences; `recompute.log` — the script's own output.

