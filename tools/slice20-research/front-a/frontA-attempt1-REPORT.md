FRONT-A: STOPPED(a)
COMMITS: 1 on s20-phase0 (this run's evidence only; its sha is the branch tip, since a file cannot contain its own commit hash); s20-front-a was not created
VERIFY: not run (stopped in W0 before the baseline; last known green on main 674b5b9: 107/107 files, 356/356 tests)
FINDINGS: none (no test, copy or production work was started)
PROTECTED PENDING: src/v2/SLICE_20_FOUNDING.md lock record (uncommitted, unstaged, awaiting Hudson's commit); AGENTS.md not touched (additive proof: not applicable)

# S20_A_BATCH (Slice 20 Front A): stopped at Phase 0

## Why it stopped

Global tripwire (a) fired on both of its conditions at once. Nothing past the first check was run.

1. **Main does not contain the LOCKED Slice 20 doc.** `origin/main` is `d2f7f68` ("Merge pull request #8 ... s20-phase0"). Its
   `src/v2/SLICE_20_FOUNDING.md` (338 lines) has no "LOCKED as of 2026-11-04" line and no `### §9.1` section.
   `git log --all -S"LOCKED as of 2026-11-04" -- src/v2/SLICE_20_FOUNDING.md` prints nothing: no commit anywhere holds the lock.
2. **The tree is not clean at start.** `git status --porcelain` = ` M src/v2/SLICE_20_FOUNDING.md`. That modification is the S20_05
   lock record: 25,640 bytes, sha256 `c16e10beb656e2e93faf83d8701838e5820a02a3ede252e5ea5deaf3b8a74afe`, 33 lines added and 0 deleted
   against HEAD. It was left unstaged for Hudson's hand-commit, and PR #8 (the DRAFT) merged before that commit happened.

I did not resolve it. Committing the lock needs `ASTER_PROTECTED_OK`, which agents never set; the dispatch also forbids a protected
path being staged. Carrying an uncommitted protected edit through ~20 commits on a branch was the other option and it would
make the "LOCKED" precondition false for the whole run.

## What I did and did not do

- Did: fetch; read-only checks of main and the working tree; read-only preflight (below); `git fetch origin main:main`, which
  fast-forwarded the local `main` ref 674b5b9 -> d2f7f68 without checking it out (nothing pushed); this report, LOG.md and
  COPY_DIFF.md; W6.
- Did not: run the baseline verify; create the tag `s20-pre-front-a`, the branch `backup/s20-pre-front-a` or the branch `s20-front-a`;
  touch any source, test, fixture, doc or AGENTS.md; stage the founding doc; push, merge or set an override.
- The stash (`stash@{0}: On main: skill drift, pre-0.5`) is untouched.

## What Hudson needs to do before a relaunch

Commit the lock, get it onto main, then relaunch. The commands from S20_05 still apply as written, on `s20-phase0` (where the
modification lives; the evidence commit is also on this branch, so one push and one PR carries both):

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "src/v2/SLICE_20_FOUNDING.md`n")
git add -- src/v2/SLICE_20_FOUNDING.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(slice20): lock record; founding doc LOCKED"; Remove-Item Env:\ASTER_PROTECTED_OK
$env:ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
git status --porcelain
```

Then push `s20-phase0`, merge the PR, and rerun S20_A_BATCH; its W0 (`git switch main; git pull --ff-only; status empty`) will then pass.

## Read-only preflight (found while stopped; nothing was changed)

The dispatch's assumptions about the repo hold. A relaunch should not hit a mismatch:

- CA-1 string: `src/v2/app/compare/main.ts:839`, built from `B_MIN_CELLS` and `echo.depCellDays`.
- CA-2 strings: "(cached grids)" at `compare/main.ts:194`; "Switching modes recomputes every grid live in this browser." at `:904`.
- CA-3 string: `src/v2/app/solar-system/ephemeris-status.ts:37` currently uses an ASCII hyphen (`TDB - refresh due`; my choice on
  2026-11-03, following that dispatch's wording); it is pinned by `tests/v2-ephemeris-hud.test.mjs:114`. CA-3 will change both to an em dash.
- CA-4 sentence: inside the Assumptions template literal at `src/v2/app/porkchop/main.ts:1004`.
- E-files all exist: `tests/v2-architecture.test.mjs`, `tests/v2-boundary-slice9.test.mjs`, `src/v2/porkchop/support-boundary.test.mjs`,
  `tests/v2-core-orbit-sampling.test.mjs`, `src/v2/porkchop/colormap.test.mjs`. (For E3, the "independent re-implementation" test is
  not identified yet; `support-boundary.test.mjs` is the nearest candidate.)
- The eight FIX2 G4 rows are at `tools/audit/sanity-69472a3/s19-5-runs/fix2-REPORT.md:28-35` and list exactly the dispatch's eight files.
- AGENTS.md: `## §3. Claude Code role` at line 156 and `## §4. Codex role` at line 175 (the W3 append point is directly before line 175).
- E1 alias config to read: `tsconfig.json` `paths` (line 16) and `vite.config.ts` `alias` (line 27).
- `tests/fixtures/v2/f2-rendered-text.json` exists (1,238 bytes).
- Names free for a relaunch at the time of the stop: no branch `s20-front-a`, no `backup/s20-pre-front-a`, no tag `s20-pre-front-a`,
  no `tools/slice20-research/front-a/`.
- W1-4's expected range can be checked now from the recon's own R3 rows (`|assumed - computed min|`, both M families): the
  smallest is |1.146 - 1.223| = 0.077 and the largest is |6.905 - 1.795| = 5.110, which rounds to the expected 0.08-5.1 km/s.
  That is arithmetic on the report's rounded values, not the committed script's output.

## Evidence naming

W6 copied this run's files to `tools/slice20-research/front-a/` as `frontA-attempt1-REPORT.md`, `frontA-attempt1-LOG.md` and
`frontA-attempt1-COPY_DIFF.md`. The `attempt1` infix departs from the dispatch's `frontA-<name>.md` on purpose, so a relaunch's W6 does
not find its create targets already present.

## Commits, FAIL/PASS proofs, W2/W3/W4 tables, bundle names

None. No work item started.

## Surprising

- PR #8 merged the DRAFT before the lock was committed, so the "LOCKED as of 2026-11-04" precondition was false by the time this
  dispatch launched. The S20_05 step 5 commands were printed for Hudson but not yet run.
- `git switch main` would have failed in this state (the founding doc is tracked on `s20-phase0` and absent from the old local `main`),
  which is why main was advanced with `git fetch origin main:main` instead.
