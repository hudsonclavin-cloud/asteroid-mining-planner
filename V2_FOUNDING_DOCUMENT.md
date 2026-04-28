# Aster V2 — Truth/Core Refactor
### Founding Document v0.2 | 2026-04-27

---

## 1. Purpose

Aster V2 is not a new product. It is a new internal architecture for the same product.

The goal is to separate:

- `core/` — physical truth
- `render/` — presentation and readability transforms
- `mission/` — planning math and screening heuristics
- `boundary/` — ingestion, export, and conversions at system edges

V2 exists because the current runtime mixes physical truth, visual exaggeration, and UI convenience in the same state graph.

---

## 2. Architectural Rule

Truth must never depend on presentation.

That means:

- `core/` contains real radii, real distances, real time, and explicit reference frames
- `render/` may exaggerate or compress visuals, but only as a pure transform on top of validated truth
- `mission/` reads truth from `core/` and never writes presentation hacks back into it

---

## 3. Physical Invariants

These invariants are mandatory runtime assertions in development builds.

### 3.1 Units

- Heliocentric and local position vectors are stored in meters
- Velocities are stored in meters per second
- Time in `core/` is TDB seconds since J2000
- Body radii in `core/` are real radii in meters

### 3.1.1 Precision Strategy

- Core state precision uses JavaScript `number` values as IEEE-754 `f64`
- At `1 AU = 1.495978707e11 m`, `f64` epsilon is about `3.3e-5 m`; this is acceptable for canonical state storage and propagation in Slice 1
- Render precision uses Three.js / GPU `f32`
- At `1 AU`, `f32` epsilon is about `1.8e4 m`; absolute heliocentric coordinates are therefore forbidden at the GPU boundary
- Rule: `core/` stores absolute positions in `f64` meters
- Rule: `render/` receives camera-relative positions computed in `f64`
- Rule: downcast to `f32` happens only at the final GPU upload boundary
- Rule: floating origin is mandatory for rendering; it is not an optional optimization

### 3.2 Frames

- Reference frames are explicit values, never implicit globals
- Frame transforms are pure functions:

```text
transform(state, fromFrame, toFrame, tdbSeconds) -> state
```

- Round-trip frame transforms must satisfy:
  - `||transform(transform(s, A, B, t), B, A, t) - s|| / max(||s||, 1) < 10 * Number.EPSILON` for one round-trip
  - chained round-trips across ten transforms must stay under `100 * Number.EPSILON`

Slice 2 introduces no new reference frames. The heliocentric ICRF root frame and GCRS Earth-centered frame established in Slice 1 are sufficient for all six Slice 2 bodies: Sun, Mercury, Venus, Earth, Moon, and Mars. Adding ECEF, body-fixed, or topocentric frames is a deliberate deferral to a future slice where mission-planning or surface-relative work demands them.

### 3.3 State Integrity

- `core/` never stores readable-scale radii
- `core/` never stores camera-derived positions
- `core/` never stores UI state
- `render/` never mutates canonical physical state

### 3.4 Propagation and Interpolation Checks

#### INV-005: Propagation Drift Bounds (deferred — applies when a propagator is introduced)

- Relative specific-orbital-energy drift must stay below `1e-9` per orbit for two-body Keplerian propagators
- Relative angular-momentum drift must stay below `1e-9` per orbit for two-body Keplerian propagators
- Future n-body integrators must stay below `1e-6` per orbit across the declared validation window unless a stricter bound is specified
- Invalid states fail loudly in dev mode

#### INV-008: Interpolation Error Bound (Slice 2)

Slice 2 introduces interpolation, not propagation. Slice 2 body states (Sun, Mercury, Venus, Earth, Moon, Mars) are recovered between daily Horizons fixture samples using cubic Hermite interpolation. Interpolation error is bounded per-body and must remain below the following cutover bars when validated at 6-hour cadence against Horizons truth:

| Body    | Cutover bar |
| ------- | ----------- |
| Sun     | 0.00002 km  |
| Mercury | 100 km      |
| Venus   | 1 km        |
| Earth   | 0.5 km      |
| Moon    | 20 km       |
| Mars    | 0.05 km     |

These bars are codified as INV-008. The INV-005 propagation drift bounds above are not exercised by Slice 2 and remain reserved for future propagator slices.

### 3.5 Rendering Truth

- Honest mode reads directly from canonical `core/` state
- Readable mode is a one-way visual transform applied at render time
- A readable transform may not leak back into `core/` or `mission/`

#### Halo Overlay Policy

Halo overlays are `render/`-only screen-space artifacts that keep physically honest bodies findable at heliocentric scales.

- Honest mode renders bodies at physically true size and position from `core/` state; halos do not alter this
- A halo appears when a body's apparent diameter falls below 3 pixels
- Halos do not modify, mask, or shadow the underlying body geometry
- Halos may not read from or write to `core/` state; they consume already-projected screen-space data
- Halos are toggleable; default is on
- Linear interpolation is permitted for halo screen-position smoothing between frames; Hermite is not required for render-only artifacts
- See `src/v2/render/halos.md` for the full overlay specification

### 3.6 Invariant Continuity

INV-001 through INV-007 apply to all canonical state values in Slice 2 unchanged. INV-008 (Interpolation Error Bound) is additive — it adds a constraint on the interpolation layer without relaxing any prior invariant.

See `src/v2/core/invariants/README.md` for INV-001 through INV-007 and `src/v2/core/invariants/INV-008.md` for the interpolation bound.

### 3.7 Interpolation Policy

Cubic Hermite interpolation is the canonical method for recovering body state between fixture samples in `core/` paths. The implementation uses both position and velocity vectors provided by the JPL Horizons API to form the Hermite basis; no numerical differentiation is performed.

Rules:

- Linear interpolation is **forbidden** in any `core/` path
- Linear interpolation is **allowed** in `render/` for screen-only effects (e.g., halo position smoothing between frames)
- Per-body interpolation error must remain below the cutover bars in §3.4 when validated against Horizons truth at 6-hour cadence between daily fixture samples
- The runtime assertion is `assertInterpolationError(estimate, truth, bodyId)` — throws in dev, structured log in prod
- This policy is codified as INV-008

---

## 4. V2 Modes

### Honest Mode

Honest mode is the validation harness and the physically truthful view.

Properties:

- real radii
- real distances
- explicit frame transitions
- no readable overrides
- no fake Earth-local layer
- Honest mode must be built, validated against external truth, and shipped before any readable-mode work begins

### Readable Mode

Readable mode is a presentation layer for interpretation, not truth.

Properties:

- may enlarge bodies
- may compress distances if explicitly labeled
- must read from validated `core/`
- must preserve source provenance and honesty labels
- Readable mode is a presentation transform layered on top of already-validated honest-mode state

---

## 5. First Vertical Slice

### Slice 1: Earth + Moon Honest Mode

**Status: shipped at `/v2/earth-moon` (now redirected to `/v2/inner-solar-system` per DEC-5).**

This was the mandatory first slice.

Included:

- heliocentric frame support
- Earth-centered inertial frame support
- Moon state and transforms
- camera-relative floating-origin rendering
- continuous zoom from about `1 AU` to low Earth orbit scale

Excluded:

- asteroids
- mission planner
- economics
- readable mode
- major moons beyond Earth-Moon
- Earth satellites

### Why Slice 1

Earth + Moon is the smallest slice that forces the architecture to solve:

- multiscale rendering
- frame composition
- local detail without fake scale hacks
- physically honest validation against trusted external data

---

### Slice 2: Inner Solar System Honest Mode

**Status: shipped at `/v2/inner-solar-system` on 2026-04-27.**

This slice extends honest mode to the full inner solar system using fixture-based interpolation.

#### Included

- Sun, Mercury, Venus, Earth, Moon, and Mars at honest scale
- Heliocentric ICRF root frame and GCRS Earth-centered frame — no new frames introduced (see §3.2)
- Cubic Hermite interpolation between daily Horizons fixture samples, using Horizons-provided velocities to form the Hermite basis
- Halo overlays that appear when apparent body diameter drops below 3 pixels — render-only, toggleable, default on
- Default heliocentric overview camera approximately 5 AU from the Sun, looking inward at the inner system
- Route: `/v2/inner-solar-system`

#### Excluded

- Outer planets (Jupiter, Saturn, Uranus, Neptune)
- Asteroids
- Mission planning
- Axial tilt rendering
- Earth-fixed frames (ECEF, topocentric)
- Star background
- Light-time correction
- Terrain
- N-body propagation
- UI controls (`ui-hud` remains frozen)

#### Why Slice 2

The inner solar system is the smallest extension that forces the architecture to validate Hermite interpolation accuracy across bodies with widely different orbital periods and distances, confirm that the two-frame pair from Slice 1 generalizes cleanly to all six bodies without new frame machinery, and establish per-body cutover bars as the pattern for future slices.

#### Route Migration (DEC-5)

Slice 2 ships at `/v2/inner-solar-system`. `/v2/earth-moon` permanently redirects to `/v2/inner-solar-system` on Slice 2 cutover. The Earth-Moon view is reachable inside Slice 2 by zooming in.

---

## 6. Cutover Criteria

A slice is not complete when it looks good. A slice is complete when it clears numeric bars.

### Earth + Moon Slice Bar (Slice 1)

- Earth/Moon position error vs. JPL Horizons vectors stays under `1 km` across a `30 day` validation window
- Slice 1 Earth and Moon states are sourced from Horizons fixtures at each validated timestep; no two-body propagator is exercised, and `INV-005` propagation drift bounds apply only when a propagator is introduced in Slice 2+
- Frame round-trip error stays below `10 * Number.EPSILON` for one round-trip and `100 * Number.EPSILON` across a chain of ten transforms
- Honest mode runs at `60 fps` during zoom from `1 AU` to `400 km` altitude on an Apple Silicon Mac with integrated GPU, Chrome stable, single 4K display
- Development invariants pass with zero violations
- Slice 1 user-facing cutover ships at `/v2/earth-moon`; the main legacy app remains the default route
- After cutover, any legacy code whose only purpose was to provide the Earth+Moon slice may be deleted

If those criteria are not met, the slice does not ship.

### Inner Solar System Slice Bar (Slice 2)

- Interpolated position error for each body stays below the per-body bars defined in §3.4 (Sun `0.00002 km`, Mercury `100 km`, Venus `1 km`, Earth `0.5 km`, Moon `20 km`, Mars `0.05 km`) across the full `2026-05-01` to `2026-07-30` validation window at 6-hour cadence. Bars are codified as INV-008.
- Default heliocentric overview camera (~5 AU from Sun) renders all six bodies findable: Sun visible at honest scale, all others reachable via halo overlays
- Continuous zoom from heliocentric overview to `400 km` altitude above any of the six body surfaces shows no floating-origin precision artifacts
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display
- Frame round-trip error stays below `10 * Number.EPSILON` for one round-trip and `100 * Number.EPSILON` across a chain of ten transforms for all six bodies
- Development invariants INV-001 through INV-008 pass with zero violations
- Slice 2 ships at `/v2/inner-solar-system`

If those criteria are not met, the slice does not ship.

---

## 7. Validation Strategy

### Truth Sources

- JPL Horizons vectors are the primary truth source for all slices
- App-facing ingress uses `/api/horizons`
- Upstream truth source is `https://ssd.jpl.nasa.gov/api/horizons.api`
- Slice 1 fixtures are stored locally under `tests/fixtures/v2/horizons-earth-moon-30d.json`
- NHATS/Asterank remain boundary data sources, not truth authorities
- SPICE and SGP4 are explicitly deferred to Slice 2+

#### Slice 2 Truth Source

JPL Horizons vectors remain the truth authority. Slice 2 uses the API parameters defined in `tools/slice2-research/fetch-horizons.mjs`: `EPHEM_TYPE='VECTORS'`, `REF_SYSTEM='ICRF'`, `REF_PLANE='FRAME'`, `TIME_TYPE='TDB'`, `OUT_UNITS='KM-S'`, `VEC_TABLE='2'`. The request window is `2026-05-01` to `2026-07-30` at `1d` step size.

Moon queries use `CENTER='500@399'` (explicit NAIF numeric ID for Earth geocenter) rather than `CENTER='@earth'`. In VECTORS mode, `@earth` is ambiguous and may resolve to the Earth-Moon barycenter. `500@399` eliminates that ambiguity.

The 90-day Slice 2 fixture will be stored under `tests/fixtures/v2/` when Slice 2 implementation begins. See `src/v2/boundary/slice2-fixture-spec.md` for the full fixture contract.

### Minimum Automated Checks

- unit-conversion tests
- frame transform round-trip tests
- propagator drift tests
- Earth/Moon benchmark tests against reference ephemerides
- camera-origin rebasing stability tests

---

## 8. Folder Ownership

```text
src/v2/
  core/
  render/
  mission/
  boundary/
  app/
```

### Ownership Rules

- `core/` owns truth and frames
- `render/` owns display transforms and scene projection
- `mission/` owns planning and heuristics
- `boundary/` owns adapters to external and legacy systems
- `app/` owns assembly and mount points only

---

## 9. Agent Mapping

### Slice 1

- `orbital-mechanics` owns `src/v2/core/`
- `renderer` owns `src/v2/render/`
- `data-layer` owns `src/v2/boundary/`
- `economics` remains frozen until a validated slice reaches mission scope
- `ui-hud` remains frozen until a validated slice reaches cutover

The orchestrator enforces the wall between `src/v2/` and legacy.

### Slice 2 Ownership

| Agent | Owns |
|-------|------|
| `orbital-mechanics` | Interpolation policy, INV-008, frame validation across six bodies, `src/v2/core/constants/`, `src/v2/core/interpolators/` |
| `data-layer` | Horizons fetcher extension to six bodies, Slice 2 fixture ingestion, `src/v2/boundary/` |
| `renderer` | Scene composition, halo system, default heliocentric camera, route mount at `/v2/inner-solar-system` |
| `ui-hud` | Frozen |
| `economics` | Frozen |
| orchestrator | Enforces the v2 wall, reviews cutover, resolves cross-agent conflicts |

---

## 10. Non-Goals

### Non-Goals For Slice 1

- porting all current features
- preserving legacy internals
- readable mode parity
- Earth satellite parity
- mission planner parity

The point of Slice 1 is not parity. The point is to prove the architecture.

### Non-Goals For Slice 2

- UI chrome, controls, or HUD panels (`ui-hud` frozen)
- Halo-toggle UI (the toggle is a code constant in Slice 2; UI exposure deferred)
- Body labels and name overlays
- Time-display HUD
- Planet axial tilt rendering
- Star background
- Light-time correction
- Asterism overlays or planet orbit traces
- Outer planets (Jupiter, Saturn, Uranus, Neptune)
- Earth satellite layer
- Asteroid field
- Mission planner

---

## 11. Failure Condition

### Slice 1

If the Earth + Moon honest-mode slice cannot be validated and shipped within `4 focused weekends` from start, then the architecture plan must be re-evaluated before proceeding further.

The project must not continue into additional slices on hope alone.

### Slice 2

The Slice 2 tripwire is **4 focused weekends from the start of the Slice 2 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all six per-body INV-008 cutover bars are not met by the end of Weekend 4, the interpolation approach and fixture cadence are re-evaluated before Slice 3 work starts.

---

## 12. Slice 2 Open Questions

These items are deferred but tracked here so they are not lost.

- **Star background** — deferred to a later visual-polish slice; not required for cutover
- **Body axial tilt static rendering** — deferred; the geometry is straightforward but adds no validation value for Slice 2
- **Light-time correction** — deferred until needed for precision astrometry work; current accuracy requirements do not demand it
- **Asterism overlays and planet orbit traces** — deferred until the trajectory rendering slice; not a Slice 2 deliverable
- **ECEF / body-fixed frames** — deferred until mission-planning or surface-relative work requires them; deliberately excluded from Slice 2 (see §3.2)

These are open questions, not decisions. They will be revisited at the Slice 3 planning dispatch.
