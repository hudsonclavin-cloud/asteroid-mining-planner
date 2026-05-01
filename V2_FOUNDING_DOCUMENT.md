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
- INV-004 applies to round-trips evaluated in the heliocentric frame, or another frame where the input state's position magnitude is comparable to the translation vector magnitude. Applying INV-004 to a small-norm native-frame state through a translate-by-large-vector round-trip violates the bound by IEEE 754 floating-point cancellation, not by transform error; this is by design of the bound, not a permission to relax it. Native-frame interpolation accuracy is governed by INV-008 and INV-009.

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

#### INV-009: Per-Body Interpolation Error Bound (Slice 3)

Slice 3 introduces per-body fixture cadence and a new planet-centered inertial frame for Jupiter's moon system. Interpolation error is bounded per body at each body's own cadence:

| Body     | Cadence | Cutover bar |
|----------|---------|-------------|
| Jupiter  | 1d      | 50 km       |
| Io       | 1h      | 5 km        |
| Europa   | 3h      | 20 km       |
| Ganymede | 6h      | 20 km       |
| Callisto | 12h     | 50 km       |

Bars validated at 15-minute (Io) and 30-minute (others) Horizons truth cadence. See `src/v2/core/invariants/INV-009.md` for the full specification.

INV-008 (Slice 2 bars) remains in force unchanged. INV-009 is additive.

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

INV-009 (Per-Body Interpolation Error Bound) is additive. INV-001 through INV-008 continue to apply unchanged. The per-body cadence pattern introduced by INV-009 is the canonical fixture pattern from Slice 3 forward.

See `src/v2/core/invariants/README.md` for INV-001 through INV-007 and `src/v2/core/invariants/INV-008.md` for the interpolation bound.

### 3.7 Interpolation Policy

Cubic Hermite interpolation is the canonical method for recovering body state between fixture samples in `core/` paths. The implementation uses both position and velocity vectors provided by the JPL Horizons API to form the Hermite basis; no numerical differentiation is performed.

Rules:

- Linear interpolation is **forbidden** in any `core/` path
- Linear interpolation is **allowed** in `render/` for screen-only effects (e.g., halo position smoothing between frames)
- Per-body interpolation error must remain below the cutover bars in §3.4 when validated against Horizons truth at 6-hour cadence between daily fixture samples
- The runtime assertion is `assertInterpolationError(estimate, truth, bodyId)` — throws in dev, structured log in prod
- This policy is codified as INV-008 (Slice 2 bodies) and INV-009 (Slice 3 bodies). The runtime check signature is unified across both invariants; per-body cadence is read from the constants module rather than passed at call time.

### 3.8 Frame Graph Extension (Slice 3)

Slice 3 introduces `FRAME_JUPITER_J2000_ICRF` as a child of `FRAME_HELIO_J2000_ICRF`.

- Origin: Jupiter's center of mass.
- Orientation: J2000/ICRF aligned (axes parallel to parent heliocentric frame).
- Parent: `FRAME_HELIO_J2000_ICRF`.
- Galilean states (Io, Europa, Ganymede, Callisto) live in this frame.
- Jupiter's own state lives in the parent heliocentric frame.
- Frame transform from Jupiter-centered to heliocentric: add Jupiter's heliocentric state vector. Inverse transform: subtract Jupiter's heliocentric state.

This pattern — one new planet-centered inertial frame per planet system, child of heliocentric root, J2000/ICRF aligned, origin at planet center of mass — is the canonical approach for Slice 4+ planet systems. Deviation requires explicit justification in the slice founding doc.

### 3.9 Per-Body Cadence Policy (Slice 3+)

Slice 2's fixture format used uniform daily cadence across all bodies. Slice 3 introduces per-body cadence: each body's `records` array carries its own timestamp grid based on the body's orbital period and measured Hermite interpolation error.

- Cadence is set per body, not globally.
- Cubic Hermite remains the canonical interpolation method (no SPK ingestion in Slice 3).
- Per-body cutover bars per INV-009 reflect that each body is interpolated at its own cadence.
- Slice 4+ planet-system slices set cadence per body based on orbital period; the densest cadence in any slice is dictated by the fastest-orbiting body in that slice.

### 3.10 Time Scrubbing Policy (Slice 3+)

With per-body cadence, "advance fixture by one timestep" is no longer well-defined. Slice 3 commits to:

Keyboard time-scrubbing advances by the densest cadence in the current slice (1h for Slice 3). Slower-cadence bodies are interpolated to the current scrub time at their own cadence.

Implication: fast-orbit bodies (Io) sweep visibly between scrub steps; slow-orbit bodies (Callisto) barely move per step. This asymmetry is honest — it reflects actual orbital periods.

Slice 4+ inherits this policy. The densest cadence in the current scene determines the scrub step.

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

### Slice 3: Jupiter System Honest Mode

**Status: in implementation (clock starts at Slice 3 implementation dispatch).**

This slice extends honest mode to Jupiter and the four Galilean moons, introducing the first planet-centered inertial frame and the per-body cadence pattern.

#### Included

- Jupiter, Io, Europa, Ganymede, Callisto at honest scale
- `FRAME_JUPITER_J2000_ICRF`: new planet-centered inertial frame, child of `FRAME_HELIO_J2000_ICRF` (see §3.8)
- Per-body fixture cadence: Jupiter `1d`, Io `1h`, Europa `3h`, Ganymede `6h`, Callisto `12h` (see §3.9 and `src/v2/boundary/slice3-fixture-spec.md`)
- Cubic Hermite interpolation per body at its own cadence
- Jupiter rendered as oblate ellipsoid using all three `pck00010` axes (see `src/v2/render/jupiter-oblate.md`)
- Galileans rendered as spheres using each body's `a` axis
- Halo overlays unchanged from Slice 2 — 3-pixel apparent diameter threshold
- Default Jupiter-centered camera framing all four Galileans on initial paint
- Time scrubbing by densest cadence (1h for Slice 3) per §3.10
- Route: `/v2/solar-system` (consolidated; Slice 2's `/v2/inner-solar-system` permanently redirects)

#### Excluded

- Amalthea and other Jovian moons beyond the four Galileans (deferred to Slice 3 polish or Slice 4)
- Jupiter's rings (deferred)
- Galilean surface features (Io's volcanism, Europa's chaos terrain, Ganymede's grooves) (deferred)
- Body-fixed rotation animation (deferred)
- Io and Europa triaxial rendering (intentionally simplified to spherical)
- Outer planets beyond Jupiter (Saturn, Uranus, Neptune) — Slice 4+
- All Slice 2 non-goals carry forward

#### Why Slice 3

Jupiter is the smallest planet system that forces the architecture to:

- Add a planet-centered inertial frame (`FRAME_JUPITER_J2000_ICRF`) — the pattern Slice 4+ planet systems will reuse
- Solve per-body cadence (Io's 1.77-day orbital period requires 1h sampling; Callisto's 16.7-day period works at 12h)
- Render an oblate body honestly (Jupiter's 6.5% flattening is the first body where single-radius simplification loses meaningful visual truth)

### Route Migration (Slice 3)

Slice 3 ships at `/v2/solar-system`. `/v2/inner-solar-system` permanently redirects to `/v2/solar-system` on Slice 3 cutover. `/v2/earth-moon`'s existing redirect (currently pointing to `/v2/inner-solar-system`) is updated at Slice 3 cutover to point directly to `/v2/solar-system`. All future planet-system slices extend `/v2/solar-system`; no per-planet routes.

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

### Measured Results

Slice 2 cleared all per-body interpolation bars with 4–6× margin against Horizons truth at 6-hour cadence across the 90-day validation window:

| Body    | Cutover bar | Measured max | Margin |
| ------- | ----------- | ------------ | ------ |
| Sun     | 0.00002 km  | 3.5e-6 km    | 5.7×   |
| Mercury | 100 km      | 20.1 km      | 5.0×   |
| Venus   | 1 km        | 0.18 km      | 5.5×   |
| Earth   | 0.5 km      | 0.09 km      | 5.5×   |
| Moon    | 20 km       | 5.0 km       | 4.0×   |
| Mars    | 0.05 km     | 0.009 km     | 5.6×   |

Frame round-trip error remained within bounds across all six bodies. INV-001 through INV-008 passed with zero violations across the validation window. 60 fps held during continuous zoom from heliocentric overview to 400 km altitude on the target machine class. Console clean on first load after the BodyId type-export fix.

Note: The bar is set at 3× measured max with rounding for cleanliness (per `tools/slice2-research/interpolation-report.md`). The 4–6× margins observed indicate substantial headroom — the bars are correctly calibrated, not artificially tight.

### Jupiter System Slice Bar (Slice 3)

- Per-body interpolated position error stays below the bars defined in §3.4 (Jupiter `50 km` at `1d`, Io `5 km` at `1h`, Europa `20 km` at `3h`, Ganymede `20 km` at `6h`, Callisto `50 km` at `12h`) across the full `2026-05-01` to `2026-07-30` validation window. Bars are codified as INV-009.
- Default Jupiter-centered camera renders Jupiter as visible oblate ellipsoid with all four Galileans findable (visible directly or via halo).
- Continuous zoom from heliocentric overview into Jupiter system, then to `400 km` altitude above any of Jupiter, Io, Europa, Ganymede, or Callisto, shows no precision artifacts.
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display.
- Frame round-trips: `FRAME_HELIO_J2000_ICRF` ↔ `FRAME_JUPITER_J2000_ICRF` stays below `10 × Number.EPSILON` for one round-trip and `100 × Number.EPSILON` across a chain of ten transforms. Slice 1 and 2 round-trip bounds remain in force.
- Development invariants INV-001 through INV-009 pass with zero violations.
- Slice 3 ships at `/v2/solar-system`. `/v2/inner-solar-system` permanently redirects.
- Jupiter renders as an oblate ellipsoid (visible at sufficient zoom).

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

#### Slice 3 Truth Source

JPL Horizons vectors remain the truth authority. Slice 3 uses the API parameters defined in `tools/slice3-research/fetch-horizons.mjs`. Galilean queries use `CENTER='500@599'` (explicit Jupiter geocenter ID, mirroring Slice 2's Moon `CENTER='500@399'` pattern). `@jupiter` was not tested but is presumed similarly ambiguous in VECTORS mode.

`STEP_SIZE` values must be quoted (`'1 d'` not `1 D`) per the fetcher implementation note from pre-research.

See `src/v2/boundary/slice3-fixture-spec.md` for the full fixture contract.

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

### Slice 3 Ownership

| Agent | Owns |
|---|---|
| `orbital-mechanics` | INV-009, `FRAME_JUPITER_J2000_ICRF` transforms, interpolation extensions for per-body cadence, Jupiter system body constants |
| `data-layer` | Horizons fetcher extension to Jupiter system, Slice 3 fixture ingestion (`ingestSlice3Fixture`), per-body cadence handling |
| `renderer` | Scene composition extension to `/v2/solar-system`, oblate Jupiter rendering per `src/v2/render/jupiter-oblate.md`, route consolidation, halo continuity, default Jupiter-centered camera |
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

### Non-Goals For Slice 3

All Slice 2 non-goals carry forward. Additionally:

- Amalthea and other Jovian moons beyond the four Galileans
- Jupiter's rings
- Galilean surface features (Io's volcanism, Europa's chaos terrain, Ganymede's grooves)
- Body-fixed rotation animation
- Io and Europa triaxial rendering — intentionally simplified to spherical (sub-pixel variation at any zoom)
- Saturn, Uranus, Neptune systems

---

## 11. Failure Condition

### Slice 1

If the Earth + Moon honest-mode slice cannot be validated and shipped within `4 focused weekends` from start, then the architecture plan must be re-evaluated before proceeding further.

The project must not continue into additional slices on hope alone.

### Slice 2

The Slice 2 tripwire is **4 focused weekends from the start of the Slice 2 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all six per-body INV-008 cutover bars are not met by the end of Weekend 4, the interpolation approach and fixture cadence are re-evaluated before Slice 3 work starts.

### Slice 3

The Slice 3 tripwire is **4 focused weekends from the start of the Slice 3 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all five per-body INV-009 cutover bars are not met by end of weekend 4, the per-body cadence approach and Hermite interpolation are re-evaluated before Slice 4. SPK ingestion becomes a candidate at that point.

---

## 12. Open Questions

### Resolved at Slice 3 planning

- **ECEF / body-fixed frames** — confirmed deferred; planet-centered inertial pattern (§3.8) is sufficient for Slices 3+ without surface-relative work.
- **Planet-centered frame pattern validation** — Slice 3 demonstrates the pattern; Slice 4+ reuses it.

### Open

- **Star background** — deferred to a later visual-polish slice
- **Body axial tilt static rendering** — deferred
- **Light-time correction** — deferred until needed for precision astrometry
- **Asterism overlays and planet orbit traces** — deferred until trajectory rendering slice
- **Body rotation animation** — deferred to a future visual-polish slice
- **SPK ingestion** — candidate for Slice 5+ if Mars-system Phobos cadence requirements (likely 30-minute or denser) prove burdensome at scale
- **Saturn oblate rendering** — Saturn is more oblate than Jupiter (~10% flattening); the oblate pattern from `src/v2/render/jupiter-oblate.md` should be reused for Saturn (Slice 4+)

---

## 13. Known Limitations

These are limitations of the shipped Slice 2 deliverable and the planned Slice 3 deliverable, recorded for transparency and to inform future-slice scoping. They are not bugs and do not affect cutover.

- **Camera body focus:** the default camera orbits a fixed point in heliocentric space. There is currently no UI to retarget the camera to Mercury, Venus, Mars, or any specific body for close-up zoom. Earth and Moon are reachable from the default camera orientation. Body focus selection is planned as a Slice 2 polish commit.

- **Test infrastructure gap:** the cutover test suite did not catch the BodyId type re-export bug because `tsc` with full type graph silently strips type-only re-exports, while esbuild (the Vite dev server transform) does not. The fix landed `--isolatedModules` across all v2 test `tsc` invocations, which mirrors esbuild's single-file behavior. A more durable fix would add a Vite build smoke test that fails CI when the dev server cannot import the v2 entry point. This is deferred to a future infrastructure pass.

- **Planet systems and outer planets:** Slice 2 covers Sun, Mercury, Venus, Earth, Moon, and Mars only. Mars's moons (Phobos, Deimos), the outer planets (Jupiter, Saturn, Uranus, Neptune), and any of their moons are out of scope. These are planned as Slices 3+, scoped one planet system at a time per the architecture pattern proven in Slice 2.

- **No mission planning or trajectory rendering:** Slice 2 is rendering and validation only. The `src/v2/mission/` folder remains scaffolded but unimplemented. Mission planning slice timing is not yet scoped.

### Slice 3

- Per-body fixture cadence is introduced; Slice 2 bodies remain at uniform daily cadence and do not need migration. Existing Slice 2 fixtures continue to work unchanged.
- Jupiter renders as oblate ellipsoid; Galileans render as spheres using their `a` axis. Io's and Europa's minor triaxial variation is intentionally simplified.
- Body rotation (Io tidal lock, Europa tidal lock, Jupiter ~10-hour rotation) is not animated.
- Time scrubbing advances by the densest cadence in the current slice (1h for Slice 3); slower-cadence bodies are interpolated to the current time per §3.10.
