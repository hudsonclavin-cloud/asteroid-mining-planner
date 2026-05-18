# Slice 9 A.2b — Repo Fence (Suspended Invariant During Re-Anchor Run)

**Active:** Sun 2026-05-17, while Phase A.2b re-anchor runs (PID 88577).
**Lifts when:** A.2b completes and the hybridized fixture is verified +
recommitted clean.

## What is happening

Phase A.2b (Horizons re-anchor of the ~11,805 stale NEA subset) is a ~10h
unattended job. By a KNOWN SPEC FLAW (see below), the A.2b runner mutates
tracked, test-validated files IN PLACE rather than writing a side file and
atomic-swapping at completion:
- tests/fixtures/v2/nea-catalog-slice9.json (the validated fixture)
- tools/slice9-ingestion/data/reanchor-stale-checkpoint.json
- tools/slice9-ingestion/data/reanchor-stale-summary.json

## Consequence (EXPECTED — NOT a regression)

For the entire duration of the A.2b run:
- `git status` is DIRTY (those files mid-write)
- `npm test` is RED (the suite reads a half-mutated fixture; e.g.
  asteroid-2006 TB7 eccentricity-band expected C found B is a body whose
  elements are re-anchored but whose partial-state derived band differs)

This is a temporary, bounded, expected condition. It is NOT a bug in the
fixture, the tests, or the propagator. Do NOT debug it. Do NOT "fix" the
failing test. Do NOT widen any band. The red clears when A.2b completes and
the fixture is whole.

## THE FENCE — rules until A.2b completes

1. NOTHING commits to the repo. No dispatch, no doc, no code. This fence note
   is the last commit until A.2b is done.
2. NOTHING reads or acts on tests/fixtures/v2/nea-catalog-slice9.json — it is
   mid-mutation; any work against it is against garbage intermediate state.
3. NO `git add -A` / `git add .` ever — the mutating files must never be
   staged in partial state. If anything must be committed in an emergency,
   explicit pathspec only, and never the three files above.
4. Red `npm test` and dirty `git status` are EXPECTED. They are not signals
   to investigate. The ground-truth signal "149/149 green + clean" is
   SUSPENDED, not broken, for this window.
5. A.2b's checkpoint (reanchor-stale-checkpoint.json) is the durable progress
   record. If the runner dies, RESUME from checkpoint (proven pattern, resumed
   clean twice). Do not restart from zero. Do not hand-edit the fixture.

## When the fence lifts

A.2b completes → verify the completed fixture (3 diagnostic-offender spot
checks: 2009 DN45 / 2010 FS / 2024 AL6 must show millions→thousands km) →
npm test returns to green on the WHOLE fixture → commit the completed
hybridized fixture clean → THEN Phase A.3 (two-gate cutover harness). Only
after that clean recommit is the invariant restored and normal work resumes.

## Root cause (spec flaw — fix is forward-looking, NOT applied to this run)

The A.2b dispatch specified resume-safe checkpointing (correct, working) but
did NOT specify side-file + atomic-swap for the fixture write. Slice 8's 9k
ingestion used side-file+swap; A.2b should have too. CORRECTION: any future
long-running job that writes a tracked validated file MUST write to a side
file and atomic-swap at completion, never mutate in place. This correction is
folded into the Phase A.3 / future-ingestion spec. It is NOT retrofitted into
the currently-running A.2b — the run is healthy (~97% re-anchor rate), the
checkpoint makes it recoverable, and stopping a working unattended job to
re-architect its write path carries more risk than accepting the documented
red window.
