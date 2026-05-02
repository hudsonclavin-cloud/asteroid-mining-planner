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

#### INV-010: Per-Body Interpolation Error Bound (Slice 4)

Slice 4 introduces `FRAME_SATURN_J2000_ICRF` and per-body cadence for the Saturn system, with three independent `1h`-cadence bodies (Mimas, Enceladus, Tethys). Interpolation error is bounded per body at each body's own cadence:

| Body      | Cadence | Cutover bar |
|-----------|---------|-------------|
| Saturn    | 1d      | 1 km        |
| Titan     | 12h     | 20 km       |
| Rhea      | 3h      | 5 km        |
| Iapetus   | 1d      | 2 km        |
| Tethys    | 1h      | 1 km        |
| Dione     | 3h      | 50 km       |
| Mimas     | 1h      | 20 km       |
| Enceladus | 1h      | 5 km        |

Bars validated at 15-minute (Mimas, Enceladus, Tethys) and 30-minute (others) Horizons truth cadence. See `src/v2/core/invariants/INV-010.md` for the full specification.

INV-008 (Slice 2 bars) and INV-009 (Slice 3 bars) remain in force unchanged. INV-010 is additive.

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

INV-010 (Per-Body Interpolation Error Bound for Saturn system) is additive. INV-001 through INV-009 continue to apply unchanged. Slice 4's three independent `1h`-cadence bodies validate that the per-body cadence pattern from Slice 3 extends to multiple fast-orbit bodies in a single slice; SPK ingestion remains a Slice 5+ candidate per §12.

See `src/v2/core/invariants/README.md` for INV-001 through INV-007 and `src/v2/core/invariants/INV-008.md` for the interpolation bound.

### 3.7 Interpolation Policy

Cubic Hermite interpolation is the canonical method for recovering body state between fixture samples in `core/` paths. The implementation uses both position and velocity vectors provided by the JPL Horizons API to form the Hermite basis; no numerical differentiation is performed.

Rules:

- Linear interpolation is **forbidden** in any `core/` path
- Linear interpolation is **allowed** in `render/` for screen-only effects (e.g., halo position smoothing between frames)
- Per-body interpolation error must remain below the cutover bars in §3.4 when validated against Horizons truth at 6-hour cadence between daily fixture samples
- The runtime assertion is `assertInterpolationError(estimate, truth, bodyId)` — throws in dev, structured log in prod
- This policy is codified as INV-008 (Slice 2 bodies), INV-009 (Slice 3 bodies), and INV-010 (Slice 4 bodies). The runtime check signature is unified across all three invariants; per-body cadence is read from the constants module rather than passed at call time.

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

### 3.11 Frame Graph Extension (Slice 4)

Slice 4 introduces `FRAME_SATURN_J2000_ICRF` as a child of `FRAME_HELIO_J2000_ICRF`, mirroring the `FRAME_JUPITER_J2000_ICRF` pattern from §3.8.

- Origin: Saturn's center of mass.
- Orientation: J2000/ICRF aligned (axes parallel to parent heliocentric frame).
- Parent: `FRAME_HELIO_J2000_ICRF`.
- All seven Saturnian moon states (Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus) live in this frame.
- Saturn's own state lives in the parent heliocentric frame.
- Frame transform from Saturn-centered to heliocentric: add Saturn's heliocentric state vector. Inverse transform: subtract Saturn's heliocentric state.
- Saturn's ring system also lives in `FRAME_SATURN_J2000_ICRF`, axis-aligned with Saturn's equatorial plane (Z-axis).

Slice 4 confirms that the planet-centered inertial frame pattern from §3.8 extends cleanly. The heliocentric root frame is now parent to two planet-centered frames (Jupiter, Saturn). Slice 5+ planet systems extend the same pattern.

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

**Status: shipped at `/v2/solar-system` on 2026-05-01.**

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

### Slice 4: Saturn System Honest Mode

Status: in implementation (clock starts at Slice 4 implementation dispatch).

This slice extends honest mode to Saturn, seven major moons, and the ring system. It introduces `FRAME_SATURN_J2000_ICRF` as the second planet-centered inertial frame and validates the planet-frame pattern across multiple instances.

#### Included

- Saturn, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus at honest scale
- `FRAME_SATURN_J2000_ICRF`: new planet-centered inertial frame, child of `FRAME_HELIO_J2000_ICRF` (see §3.11)
- Per-body fixture cadence: Saturn `1d`, Titan `12h`, Rhea `3h`, Iapetus `1d`, Tethys `1h`, Dione `3h`, Mimas `1h`, Enceladus `1h` (see §3.9 and `src/v2/boundary/slice4-fixture-spec.md`)
- Cubic Hermite interpolation per body at its own cadence
- Saturn rendered as oblate ellipsoid using all three `pck00010` axes (~9.8% flattening, more pronounced than Jupiter's 6.5%) — see `src/v2/render/saturn-oblate.md`
- Seven Saturnian moons rendered as spheres using each body's `a` axis (deliberate triaxial simplification per Galilean precedent)
- Saturn ring system rendered as semi-transparent disk + visible Cassini Division at `117,500-122,050 km` from Saturn center (see `src/v2/render/saturn-rings.md`)
- Halo overlays unchanged from Slice 2 — 3-pixel apparent diameter threshold
- Default camera reframes to outer-system overview showing both Jupiter and Saturn systems
- Time scrubbing by densest cadence (1h for Slice 4, same as Slice 3) per §3.10
- Route: `/v2/solar-system` extends; no new route per §3.11

#### Excluded

- Hyperion, Phoebe, and Saturn's other ~270 minor moons
- E ring, F ring, and other diffuse outer rings
- Cassini Division substructure (Huygens Gap, Encke Gap, individual ringlets)
- B ring spokes
- Particle-level ring rendering or any particle dynamics
- Ring shadows (Saturn onto rings, rings onto Saturn)
- Anisotropic phase scattering (forward-scattering vs back-scattering)
- Ring tilt evolution as Saturn moves through its 29.5-year heliocentric orbit (the visual ring-opening / closing cycle observable from Earth)
- Body-fixed rotation animation
- Triaxial rendering of Mimas, Enceladus, Tethys, Iapetus (intentionally simplified to spherical despite measurable triaxiality)
- Outer planets beyond Saturn (Uranus, Neptune)
- All Slice 3 non-goals carry forward

#### Why Slice 4

Saturn is the smallest planet system that:

- Validates the planet-centered inertial frame pattern (§3.8) across a second instance, confirming it as canonical for Slice 5+
- Forces three independent fast-orbit bodies into a single slice (Mimas `0.94d`, Enceladus `1.37d`, Tethys `1.89d`), pressure-testing the per-body cadence pattern beyond Slice 3's single-fast-body Io case
- Introduces ring rendering as a new render-layer architectural concern, establishing the pattern for any future ringed-body work (Jupiter's faint rings, Uranus's rings, Neptune's rings)
- Renders an oblate body more pronounced than Jupiter, validating that the oblate pattern (§3.8 sibling discussion in `src/v2/render/jupiter-oblate.md`) generalizes across flattening ratios

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

### Slice 3 Measured Results

Slice 3 cleared all five per-body interpolation bars across the 90-day validation window with the following margins:

| Body | Cutover bar | Measured max | Margin |
|------|-------------|--------------|--------|
| Jupiter | 50 km | 7.142806 km | 7.0× |
| Io | 5 km | 0.544296 km | 9.2× |
| Europa | 20 km | 4.504309 km | 4.4× |
| Ganymede | 20 km | 6.610469 km | 3.0× |
| Callisto | 50 km | 7.016665 km | 7.1× |

Frame round-trip error: FRAME_HELIO_J2000_ICRF ↔ FRAME_JUPITER_J2000_ICRF measured zero relative error across one round-trip and ten-chain — the transform is implemented as pure subtraction/addition of Jupiter's heliocentric state with no intermediate matrix multiplications, making it mathematically reversible to floating-point precision.

INV-001 through INV-009 passed with zero violations across the validation window. Slice 1 and Slice 2 cutover harnesses continue to pass (regression check).

Manual browser verification on the target machine class (Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display) confirmed: 60 fps during continuous zoom from heliocentric overview through Jupiter system to 400 km altitude above any of the eleven body surfaces; default Jupiter-centered camera frames all four Galileans on initial paint; halo system active for sub-pixel bodies; oblate Jupiter visible at sufficient zoom; redirects from /v2/inner-solar-system and /v2/earth-moon resolve to /v2/solar-system.

Note: The cutover bars are calibrated at 3-9× measured max with honest per-body margins (per src/v2/core/invariants/INV-009.md). Margins of 3-9× indicate substantial headroom; the bars are correctly calibrated, not artificially tight.

### Saturn System Slice Bar (Slice 4)

- Per-body interpolated position error stays below the bars defined in §3.4 (Saturn `1 km` at `1d`, Titan `20 km` at `12h`, Rhea `5 km` at `3h`, Iapetus `2 km` at `1d`, Tethys `1 km` at `1h`, Dione `50 km` at `3h`, Mimas `20 km` at `1h`, Enceladus `5 km` at `1h`) across the full `2026-05-01` to `2026-07-30` validation window. Bars are codified as INV-010.
- Default outer-system camera renders Saturn as visible oblate ellipsoid with ring system visible (Cassini Division resolved at sufficient zoom). All seven moons findable (visible directly or via halo).
- Continuous zoom from heliocentric overview through Saturn system to `400 km` altitude above any of Saturn, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus, no precision artifacts.
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display.
- Frame round-trips: `FRAME_HELIO_J2000_ICRF` ↔ `FRAME_SATURN_J2000_ICRF` stays below `10 × Number.EPSILON` for one round-trip and `100 × Number.EPSILON` across a chain of ten transforms. Slice 1, 2, 3 round-trip bounds remain in force.
- Development invariants INV-001 through INV-010 pass with zero violations.
- Slice 4 ships at `/v2/solar-system`. `/v2/inner-solar-system` and `/v2/earth-moon` redirects remain in place.
- Saturn renders as oblate ellipsoid, ring system renders as tilted semi-transparent disk with Cassini Division visible.

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

### Slice 4 Truth Source

JPL Horizons vectors remain the truth authority. Slice 4 uses the API parameters defined in `tools/slice4-research/fetch-horizons.mjs`. Saturnian moon queries use `CENTER='500@699'` (explicit Saturn geocenter ID, mirroring Slice 3's Galilean `CENTER='500@599'` pattern). `CENTER='500@699'` was confirmed working for all seven moons in pre-research without center-ambiguity workaround.

`STEP_SIZE` values must be quoted (`'1 d'` not `1 D`) per the implementation note inherited from Slice 3.

See `src/v2/boundary/slice4-fixture-spec.md` for the full fixture contract.

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

### Slice 4 Ownership

| Agent | Owns |
|---|---|
| `orbital-mechanics` | INV-010, `FRAME_SATURN_J2000_ICRF` transforms, interpolation extensions for Saturn-system per-body cadence (three `1h` bodies), Saturn system body constants |
| `data-layer` | Horizons fetcher extension to Saturn system, Slice 4 fixture ingestion (`ingestSlice4Fixture`), `saturn-centered` frame inference |
| `renderer` | Scene composition extension to Saturn system, oblate Saturn rendering per `src/v2/render/saturn-oblate.md`, ring system rendering per `src/v2/render/saturn-rings.md`, default outer-system camera, halo continuity for new bodies |
| `ui-hud` | Frozen |
| `economics` | Frozen |
| orchestrator | Enforces v2 wall, reviews cutover, resolves cross-agent conflicts |

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

### Non-Goals For Slice 4

All Slice 3 non-goals carry forward. Additionally:

- Hyperion, Phoebe, and Saturn's other minor moons beyond the seven majors in scope
- E ring, F ring, and other diffuse outer rings
- Cassini Division substructure (Huygens Gap, Encke Gap, ringlets)
- B ring spokes
- Particle-level ring rendering or particle dynamics
- Ring shadows (Saturn onto rings, rings onto Saturn)
- Anisotropic phase scattering for ring brightness
- Ring tilt evolution over Saturn's 29.5-year heliocentric orbit (rings render at fixed tilt to Saturn's equator, structurally correct; ring-opening/closing visual cycle as observed from Earth is render-only and deferred)
- Body-fixed rotation animation for Saturn or any moon
- Triaxial rendering of Saturnian moons — intentionally simplified to spherical (Galilean precedent), even where `pck00010` has measurable triaxiality
- Uranus, Neptune systems

---

## 11. Failure Condition

### Slice 1

If the Earth + Moon honest-mode slice cannot be validated and shipped within `4 focused weekends` from start, then the architecture plan must be re-evaluated before proceeding further.

The project must not continue into additional slices on hope alone.

### Slice 2

The Slice 2 tripwire is **4 focused weekends from the start of the Slice 2 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all six per-body INV-008 cutover bars are not met by the end of Weekend 4, the interpolation approach and fixture cadence are re-evaluated before Slice 3 work starts.

### Slice 3

The Slice 3 tripwire is **4 focused weekends from the start of the Slice 3 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all five per-body INV-009 cutover bars are not met by end of weekend 4, the per-body cadence approach and Hermite interpolation are re-evaluated before Slice 4. SPK ingestion becomes a candidate at that point.

### Slice 4

The Slice 4 tripwire is **4 focused weekends from the start of the Slice 4 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all eight per-body INV-010 cutover bars are not met by end of weekend 4, the per-body cadence approach and Hermite interpolation are re-evaluated before Slice 5. SPK ingestion becomes a stronger candidate at that point. Slice 4 also tripwires the ring rendering architectural pattern: if the single-disk + Cassini-Division approach proves visually unacceptable at cutover review, the rendering scope is re-evaluated before declaring cutover.

---

## 12. Open Questions

### Resolved at Slice 3 planning

- **ECEF / body-fixed frames** — confirmed deferred; planet-centered inertial pattern (§3.8) is sufficient for Slices 3+ without surface-relative work.
- **Planet-centered frame pattern validation** — Slice 3 demonstrates the pattern; Slice 4+ reuses it.

### Resolved at Slice 4 planning

- **Multi-instance planet-frame validation** — Slice 4 confirms the §3.8 pattern extends cleanly to a second planet-centered frame (Saturn), with three independent fast-orbit bodies pressure-testing per-body cadence.
- **Ring rendering architectural pattern** — established in `src/v2/render/saturn-rings.md` as a separate render-layer module. Generalization to a `PlanetRing` primitive is deferred until a second ringed-body slice actually needs it.

### Open

- **Star background** — deferred to a later visual-polish slice
- **Body axial tilt static rendering** — deferred
- **Light-time correction** — deferred until needed for precision astrometry
- **Asterism overlays and planet orbit traces** — deferred until trajectory rendering slice
- **Body rotation animation** — deferred to a future visual-polish slice
- **SPK ingestion** — Slice 4's three independent `1h`-cadence bodies validated per-body Hermite, but Mars-system Phobos at `7.65h` orbital period is predicted to require sub-hourly cadence (likely `30-minute` or denser). SPK ingestion remains a Slice 5+ candidate, with stronger pressure now that Slice 4 has shown fixture size growing 2-3× per slice (Slice 2 `~250 KB` → Slice 3 `~780 KB` → Slice 4 `~1.85 MB`).
- **Uranus and Neptune rings** — both have ring systems (Uranus's rings discovered 1977, Neptune's confirmed by Voyager 2 in 1989). The `saturn-rings.md` pattern should generalize, but Uranus's rings are nearly opaque dark particles and Neptune's are partial arcs — different visual character from Saturn. Revisit at Slice 6+ planning.
- **Ring tilt evolution rendering** — Saturn's rings cycle from edge-on to fully open over ~15 years from Earth's viewpoint. This is rendered correctly at any single epoch (rings are tilted to Saturn's equator, which is fixed in `FRAME_SATURN_J2000_ICRF`), but the visual cycle as Saturn moves through its heliocentric orbit is not animated. Honest at any snapshot; not animated across multi-year scrubs.

---

## 13. Known Limitations

These are limitations of the shipped Slice 2 and Slice 3 deliverables, recorded for transparency and to inform future-slice scoping. They are not bugs and do not affect cutover.

- **Camera body focus:** the default camera orbits a fixed point in heliocentric space. There is currently no UI to retarget the camera to Mercury, Venus, Mars, or any specific body for close-up zoom. Earth and Moon are reachable from the default camera orientation. Body focus selection is planned as a Slice 2 polish commit.

- **Test infrastructure gap:** the cutover test suite did not catch the BodyId type re-export bug because `tsc` with full type graph silently strips type-only re-exports, while esbuild (the Vite dev server transform) does not. The fix landed `--isolatedModules` across all v2 test `tsc` invocations, which mirrors esbuild's single-file behavior. A more durable fix would add a Vite build smoke test that fails CI when the dev server cannot import the v2 entry point. This is deferred to a future infrastructure pass.

- **Planet systems and outer planets:** Slice 2 covers Sun, Mercury, Venus, Earth, Moon, and Mars only. Mars's moons (Phobos, Deimos), the outer planets (Jupiter, Saturn, Uranus, Neptune), and any of their moons are out of scope. These are planned as Slices 3+, scoped one planet system at a time per the architecture pattern proven in Slice 2.

- **No mission planning or trajectory rendering:** Slice 2 is rendering and validation only. The `src/v2/mission/` folder remains scaffolded but unimplemented. Mission planning slice timing is not yet scoped.

### Slice 3

- Per-body fixture cadence is introduced; Slice 2 bodies remain at uniform daily cadence and do not need migration. Existing Slice 2 fixtures continue to work unchanged.
- Jupiter renders as oblate ellipsoid; Galileans render as spheres using their `a` axis. Io's and Europa's minor triaxial variation is intentionally simplified.
- Body rotation (Io tidal lock, Europa tidal lock, Jupiter ~10-hour rotation) is not animated.
- Time scrubbing advances by the densest cadence in the current slice (1h for Slice 3); slower-cadence bodies are interpolated to the current time per §3.10.
- Cutover test data path gap: the Slice 3 cutover harness validates frame transforms on raw fixture samples in heliocentric-norm scale, where INV-004's `<10·ε` bound holds by floating-point arithmetic. The runtime evaluates frame transforms on native-frame (GCRS or Jupiter-centered) interpolated states, where translate-by-large-vector cancellation produces relative errors ~10-100× the INV-004 bound — not a transform bug, but a fundamental property of IEEE 754. The Slice 3 implementation surfaced this as a runtime AssertError that the test suite did not catch (see commit `5a03c09` fix). Future cutover harnesses should mirror the runtime's actual data path (interpolated states, native frames) where applicable, not just verify transforms in their best-case input regime. Same shape of test/runtime gap as the BodyId import bug from Slice 2 — the test suite tests the right thing, but not the input distribution that the runtime exercises.

### Slice 4

- Per-body fixture cadence with three independent `1h`-cadence bodies (Mimas, Enceladus, Tethys). Slice 2 and Slice 3 fixtures continue to work unchanged.
- Saturn renders as oblate ellipsoid (~9.8% flattening); seven major moons render as spheres using each body's `a` axis. Mimas's triaxial spread (`208/197/191 km`, ~8% variation) is larger than Io's (~0.8%) and may be visibly noticeable at close zoom. Slice 4 ships with spherical Mimas as a deliberate simplification per Galilean precedent; revisit at Slice 4 polish if visual artifact reports surface.
- Saturn rings render as a single semi-transparent disk with explicit Cassini Division at `117,500-122,050 km`. Substructure within the A and B rings, B-ring spokes, the E and F rings, ring shadows, and anisotropic phase scattering are all deferred.
- Ring tilt is fixed to Saturn's equator in `FRAME_SATURN_J2000_ICRF`, structurally correct at any snapshot. The visual ring-opening / closing cycle observed from Earth over Saturn's ~29.5-year orbit is not animated.
- Body rotation (Saturn ~10.66h, tidal locks for moons) is not animated. Same deferral pattern as Slice 3.
- Time scrubbing advances by the densest cadence in the current slice (1h for Slice 4, unchanged from Slice 3); Iapetus at `79d` barely moves per scrub step while Mimas sweeps visibly.
- Fixture size growth is accelerating: Slice 2 `~250 KB`, Slice 3 `~780 KB`, Slice 4 `~1.85 MB`. Slice 5 (Mars system, predicted `30-minute` cadence for Phobos) may force the SPK ingestion path open.
