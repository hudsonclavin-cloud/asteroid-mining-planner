# Core Invariants

This folder defines development-time assertions that guard physical truth.

All invariants in this folder are runtime-checkable.

Failure policy:

- development: throw `AssertError`
- production: log structured violation data and continue only when the violation is explicitly marked non-fatal

## INV-001: Canonical Units

- Statement: All `core/` positions are in meters, velocities in meters per second, radii in meters, and time in TDB seconds since J2000.
- Runtime check: `assertCanonicalUnits(state: CanonicalState): void`
- Failure mode: throw in dev, structured error log in prod
- Enforced by: `core/units`, called by `core/frames`, `core/propagators`, and all `boundary/` ingestion adapters

## INV-002: Finite Numeric State

- Statement: No canonical state may contain `NaN`, `Infinity`, or non-finite matrix/vector components.
- Runtime check: `assertFiniteState(state: CanonicalState): void`
- Failure mode: throw in dev, structured error log in prod
- Enforced by: `core/state`, called after every transform and propagation step

## INV-003: Explicit Frame Tag

- Statement: Every canonical state carries an explicit frame tag; no transform may assume an implicit current frame.
- Runtime check: `assertFrameTag(state: CanonicalState): void`
- Failure mode: throw in dev, structured error log in prod
- Enforced by: `core/frames`, called at transform entry and exit

## INV-004: Frame Round-Trip Bound

- Statement: `transform(transform(s, A, B, t), B, A, t)` must return the original state within `10 * Number.EPSILON` relative error per round-trip and within `100 * Number.EPSILON` across a chain of ten transforms.
- Scope: INV-004 applies to round-trips evaluated in the heliocentric frame, or another frame where the input state's norm is comparable to the translation vector magnitude. Applying it to a small-norm native-frame state through a translate-by-large-vector round-trip will exceed the bound by IEEE 754 cancellation rather than transform error; that is by design of the bound, not a relaxation of it. Native-frame interpolation accuracy is governed by INV-008 and INV-009.
- Runtime check: frame round-trip assertion helper in `round-trip.ts`
- Failure mode: throw in dev, structured error log in prod
- Enforced by: `core/frames/tests` and targeted V2 slice tests

## INV-005: Propagation Drift Bounds

- Statement: Two-body Keplerian propagators must keep relative specific-energy drift below `1e-9` per orbit and relative angular-momentum drift below `1e-9` per orbit. Any future n-body propagator must stay below `1e-6` per orbit unless a stricter bound is declared.
- Runtime check: `assertPropagationDrift(before: CanonicalState, after: CanonicalState, orbitFraction: number, propagatorId: string): void`
- Failure mode: throw in dev, structured error log in prod
- Enforced by: `core/propagators` and validation benchmarks

## INV-006: No Readable-Scale Contamination

- Statement: `core/` may not store readable-scale radii, compressed distances, camera-relative coordinates, or any other presentation-derived values.
- Runtime check: `assertPhysicalTruthOnly(state: CanonicalState): void`
- Failure mode: throw in dev, structured error log in prod
- Enforced by: `core/state` and `render/` boundary adapters
