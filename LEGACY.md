# Legacy Runtime Freeze

This document freezes the current Aster runtime and defines the rules for the `v2` migration.

## Scope

The following are legacy:

- [index.html](/Users/hudsonclavin/asteroid-mining-planner/index.html)
- [docs/index.html](/Users/hudsonclavin/asteroid-mining-planner/docs/index.html)
- [physics.worker.js](/Users/hudsonclavin/asteroid-mining-planner/physics.worker.js)
- Any code path whose runtime authority depends on the inline module inside `index.html`

The current legacy app remains the shipped product until a `v2` slice meets its cutover bar.

## Allowed Changes

- Production bug fixes that preserve current behavior
- Security fixes
- Deploy fixes
- Data-source breakage repairs
- Explicit source-provenance and honesty-label fixes

## Forbidden Changes

- New features in the legacy runtime
- New visualization systems
- New scale modes
- New local-frame hacks
- Any code that increases coupling between physical truth and presentation
- Any new dependency from `src/v2/` back into legacy code

## V2 Wall

`src/v2/` is a hard boundary.

Rules:

- `src/v2/` may not import from legacy runtime files.
- Legacy runtime may not mutate `src/v2/` state.
- Shared data must cross the boundary only through explicit adapters.
- No shared mutable globals across the boundary.

If a migration task cannot satisfy these rules, the task is blocked and must be redesigned.

## Migration Policy

- Build one validated vertical slice at a time.
- Cut over only when numeric criteria are met.
- Delete legacy code for a slice after cutover.
- Do not start the next slice until the current one is shipped and verified.

## Reusable Utility Rule

When `v2` needs functionality that already exists in legacy:

- Preferred: rewrite it in `src/v2/` with `v2` invariants enforced
- Acceptable: copy the legacy code into `src/v2/`, then validate it under `v2` tests and invariants
- Forbidden: import from legacy runtime code into `src/v2/`, even for a single utility

The `v2` wall fails the moment convenience imports are allowed.

## Phase 9 Disposition

- Horizons integration is built in `src/v2/boundary/` from day one; it does not receive new feature work in legacy
- Feasibility Index is built in `src/v2/mission/` after Slice 1 cutover; it remains frozen until then
- Legacy patched-conic logic stays frozen with known limitations documented; new patched-conic work happens in `v2` only
- New honesty / uncertainty presentation work belongs in `v2` only

## Immediate Priority

First `v2` slice:

- Earth + Moon
- Honest mode only
- No mission features
- No readable-scale overrides in core
- Full validation against external truth data
