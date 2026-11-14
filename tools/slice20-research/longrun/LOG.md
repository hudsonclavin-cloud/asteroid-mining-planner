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
