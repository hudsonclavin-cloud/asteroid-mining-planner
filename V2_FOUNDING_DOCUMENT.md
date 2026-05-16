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

#### INV-011: Per-Body Interpolation Error Bound (Slice 6)

Slice 6 introduces `FRAME_MARS_J2000_ICRF` and per-body cadence for the Mars system. Phobos at `7.65-hour` orbital period requires the densest cadence in V2 to date (`30 minutes`). Interpolation error is bounded per body at each body's own cadence:

| Body   | Cadence | Cutover bar |
|---|---|---|
| Phobos | 30m | 5 km |
| Deimos | 1h | 0.5 km |

Mars's INV-008 bar of `0.05 km` at `1d` carries forward unchanged.

Bars validated at `5-minute` (Phobos) and `15-minute` (Deimos) Horizons truth cadence. See `src/v2/core/invariants/INV-011.md`.

INV-008, INV-009, and INV-010 remain in force unchanged. INV-011 is additive.

#### INV-012: Keplerian Propagation Position Bound (Slice 7)

Slice 7 introduces a second propagation method in `core/`: asteroid catalog bodies propagate via Keplerian two-body math from a uniform Horizons anchor epoch, while Slice 1-6 bodies continue using Hermite interpolation. Position error is bounded at visualization grade:

| Body class | Cadence | Cutover bar |
|---|---|---|
| Asteroid | `1d` propagation | `100,000 km` |

Bars were validated against daily Horizons truth across the `2026-05-01` to `2026-07-30` window for an `18-body` representative sample spanning the main belt and all `8` curated NEAs. Worst sampled round-2 body was Hygiea at `35,313 km`, leaving `2.83×` margin. See `src/v2/core/invariants/INV-012.md`.

INV-008, INV-009, INV-010, and INV-011 remain in force unchanged. INV-012 is additive for Slice 7 and remains the historical Slice 7 asteroid cutover artifact after Slice 8.

#### INV-013: Stratified Keplerian Propagation Position Bound (Slice 8)

Slice 8 extends the asteroid catalog from `1,008` to `10,008` bodies and replaces Slice 7's single asteroid bar with eccentricity-stratified bars derived from a re-anchored `200`-body sample:

| Eccentricity band | Cadence | Cutover bar |
|---|---|---:|
| Band A (`e < 0.1`) | `1d` propagation | `35,612.872 km` |
| Band B (`0.1 ≤ e < 0.2`) | `1d` propagation | `52,970.092 km` |
| Band C (`0.2 ≤ e < 0.3`) | `1d` propagation | `37,688.076 km` |
| Band D (`e ≥ 0.3`) | `1d` propagation | `43,757.550 km` |

These bars come from Slice 8 pre-research Round 3 (`tools/slice8-research/round3-synthesis-report.md` and `tools/slice8-research/data/inv-013-band-bars.json`). INV-013 supersedes INV-012 for asteroid bodies starting in Slice 8. All `18` Slice 7 sampled bodies remain backward-compatible under INV-013; Hygiea is the tightest case at `0.6667×` its Band B bar. See `src/v2/core/invariants/INV-013.md`.

### 3.5 Rendering Truth

- Honest mode reads directly from canonical `core/` state
- Readable mode is a one-way visual transform applied at render time
- A readable transform may not leak back into `core/` or `mission/`
- Slice 8 extends asteroid rendering by adding spatial-index-driven visibility culling; this remains a render-only optimization and may not alter propagated truth state

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

Slice 5 introduces no new invariants. INV-001 through INV-010 continue to apply unchanged. Slice 5 is render-layer only and does not touch `core/` data, frames, or interpolation; the existing Slice 4 invariants fully cover the rendering work.

INV-011 (Per-Body Interpolation Error Bound for Mars system) is additive. INV-001 through INV-010 continue to apply unchanged. Slice 6 introduces V2's densest cadence to date (Phobos at `30m`) and validates that the per-body Hermite + Horizons fixture pattern from Slices 3-4 extends to bodies with sub-10-hour orbital periods. Slice 7 asteroid pre-research later confirmed that SPK ingestion was still not forced: Keplerian-from-anchor cleared the visualization-grade bar with measured margin.

INV-012 (Keplerian Propagation Position Bound for asteroid catalog bodies) is additive for Slice 7. INV-001 through INV-011 continue to apply unchanged. Slice 7 is the first slice where `core/` supports two propagation methods in parallel: Hermite for sampled planetary and moon bodies, Keplerian for a many-body asteroid catalog anchored from uniform Horizons vectors.

INV-013 (Stratified Keplerian Propagation Position Bound for catalog-scale asteroid bodies) supersedes INV-012 for asteroid bodies starting in Slice 8. The frame graph remains unchanged; the architectural extension from Slice 7 to Slice 8 is scale, culling architecture, and per-eccentricity validation bars, not a new propagation method.

See `src/v2/core/invariants/README.md` for INV-001 through INV-007 and `src/v2/core/invariants/INV-008.md` for the interpolation bound.

### 3.7 Interpolation Policy

Cubic Hermite interpolation remains the canonical method for recovering state between stored fixture samples for Slice 1-6 planetary and moon bodies. Slice 7 adds a parallel Keplerian propagation path for asteroid catalog bodies anchored from a recent Cartesian state. Slice 8 retains that Keplerian path but drops the attempted smart-staleness shortcut: all asteroid propagation anchors are Horizons re-anchors at `2026-05-01 TDB`. The Hermite path and the Keplerian path coexist; asteroid work does not replace Hermite.

Rules:

- Linear interpolation is **forbidden** in any `core/` path
- Linear interpolation is **allowed** in `render/` for screen-only effects (e.g., halo position smoothing between frames)
- Hermite-using bodies must remain below the cutover bars in §3.4 when validated against Horizons truth at the cadence specified by each invariant: INV-008 at 6-hour cadence; INV-009, INV-010, and INV-011 at 5-min, 15-min, or 30-min cadence depending on body
- Keplerian-using asteroid bodies must remain below the applicable cutover bar at `1d` truth cadence: INV-012 for Slice 7's `1,008`-body catalog, INV-013 for Slice 8's `10,008`-body catalog
- Assertion helpers are `assertInterpolationError(estimate, truth, bodyId)` for Hermite paths and `assertKeplerianError(estimate, truth, bodyId)` for asteroid Keplerian paths. They are exercised where truth is available (tests, cutover harnesses, report-mode validation), not inside Slice 7's runtime hot propagation path.
- This policy is codified as INV-008 (Slice 2 bodies), INV-009 (Slice 3 bodies), INV-010 (Slice 4 bodies), INV-011 (Slice 6 bodies), INV-012 (Slice 7 asteroid catalog), and INV-013 (Slice 8 catalog-scale asteroid bars). The Hermite path keeps per-body cadence in the constants module; the Keplerian path keeps a uniform anchor epoch plus derived osculating elements per asteroid.

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
- Saturn's ring system also lives in `FRAME_SATURN_J2000_ICRF`, with a render-only `26.7°` tilt from the frame `Z` axis so the rendered ring plane matches Saturn's equatorial plane.

Slice 4 confirms that the planet-centered inertial frame pattern from §3.8 extends cleanly. The heliocentric root frame is now parent to two planet-centered frames (Jupiter, Saturn). Slice 5+ planet systems extend the same pattern.

### 3.12 Frame Graph Extension (Slice 6)

Slice 6 introduces `FRAME_MARS_J2000_ICRF` as a child of `FRAME_HELIO_J2000_ICRF`, mirroring the `FRAME_JUPITER_J2000_ICRF` (§3.8) and `FRAME_SATURN_J2000_ICRF` (§3.11) patterns.

- Origin: Mars's center of mass.
- Orientation: J2000/ICRF aligned (axes parallel to parent heliocentric frame).
- Parent: `FRAME_HELIO_J2000_ICRF`.
- Phobos and Deimos states live in this frame.
- Mars's own state lives in the parent heliocentric frame.
- Frame transform from Mars-centered to heliocentric: add Mars's heliocentric state vector. Inverse transform: subtract Mars's heliocentric state.
- Pure subtraction transform; mathematically reversible to floating-point precision (matches Jupiter and Saturn frame round-trip behavior).

Slice 6 confirms that the planet-centered inertial frame pattern from §3.8 extends to a third planet system. The heliocentric root frame is now parent to three planet-centered frames (Jupiter, Saturn, Mars).

### 3.13 Asteroid Catalog Architecture (Slice 7)

Slice 7 introduces the first many-body catalog in V2 and the first propagation method that does not depend on a stored time-series fixture per body.

- Body set: `1,008` asteroids (`1,000` main-belt by `H` plus `8` curated famous NEAs)
- Frame: all propagated asteroid states remain in `FRAME_HELIO_J2000_ICRF`; stored classical elements are labeled `FRAME_HELIO_J2000_ECLIPTIC`; Slice 7 introduces no new scene-graph frame constant
- Inventory source: JPL SBDB is canonical for body selection and metadata (`designation`, `name`, `H`, `G`, class, `condition_code`, `data_arc`, `neo`, `pha`)
- Anchor source: JPL Horizons VECTORS is canonical for one recent Cartesian state per body at a uniform anchor epoch of `2026-05-01 00:00:00 TDB`
- Propagation seed: each Horizons anchor state is converted to ecliptic-derived osculating elements, then propagated continuously via Keplerian two-body math and rotated into canonical heliocentric ICRF
- Render ownership: `render/` selects between Points, InstancedMesh, and focused Mesh representations; `core/` owns the propagated heliocentric truth state only

The anchor-epoch discipline is part of the architecture, not an implementation convenience. Pre-research round 1 showed the failure mode directly: Bennu's stale SBDB epoch (`2011-01-01`) produced multi-million-kilometer drift across the Slice 7 window, while round 2's uniform Horizons anchor reduced Bennu's day-90 error to `4,236 km`. If the fixture window moves materially, Slice 7 anchors must be re-fetched at the new window start.

See `src/v2/core/asteroid-catalog.md`, `src/v2/boundary/slice7-fixture-spec.md`, and `src/v2/render/asteroid-rendering.md`.

Slice 8 extends this architecture without changing its truth model:

- Catalog scale increases from `1,008` to `10,008` bodies
- Anchor policy hardens to "always Horizons re-anchor at `2026-05-01 TDB`" after Slice 8 Round 2 invalidated smart-staleness
- INV-012's single asteroid bar is replaced by INV-013's eccentricity-stratified bars
- Orbit-line rendering becomes adaptive with threshold `H < 10.98`, preserving the Slice 7 belt-band visual for the brightest `~1,000` bodies inside the larger catalog
- Spatial indexing is added for frustum culling and click-to-focus broad-phase, while Points / InstancedMesh / focused Mesh remain the same render modes

See `src/v2/core/invariants/INV-013.md`, `src/v2/boundary/slice8-fixture-spec.md`, `src/v2/render/asteroid-instancing.md`, and `src/v2/render/spatial-index.md`.

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

Status: shipped at `/v2/solar-system` on 2026-05-02.

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

### Slice 5: Saturn Ring Substructure Polish

Status: shipped at `/v2/solar-system` on 2026-05-03.

This slice extends Slice 4's single-disk + Cassini Division band ring rendering with seven visible substructure features. It is render-layer only — no new frames, no new invariants, no new fixtures.

#### Included

- Huygens Gap and Huygens Ringlet (inside Cassini Division, significance `2/3`)
- Laplace Gap and Laplace Ringlet (inside Cassini Division, significance `3/3`)
- Encke Gap (inside A ring, shepherd moon Pan, significance `2`)
- Keeler Gap (inside A ring near outer edge, shepherd moon Daphnis, significance `4` but visually distinctive)
- Roche Division (between A ring outer and F ring inner, significance `2`, rendered as visual fade-out)
- Each feature renders as a separate Three.js `RingGeometry` sibling mesh under the existing `saturnRingsGroup` (GPT-5 Option B pattern)
- All features inherit the Slice 4 render-only `26.7°` tilt via the existing `saturnTiltGroup`
- Route: `/v2/solar-system` extends; no new route

#### Excluded

- Herschel Gap, Herschel Ringlet, Russell Gap, Jeffreys Gap, Kuiper Gap, Bessel Gap, Barnard Gap (the narrow Cassini Division features — significance `4-5`, sub-pixel at moderate zoom, deferred to polish-of-polish)
- F ring (separate ring beyond the A ring outer edge, deferred)
- E ring (diffuse ring near Enceladus, deferred)
- B ring spokes (transient radial features)
- Ring shadows (Saturn onto rings, rings onto Saturn)
- Anisotropic phase scattering (forward-scattering vs back-scattering)
- Ring particle dynamics
- All Slice 4 non-goals carry forward

#### Why Slice 5

Slice 5 is the smallest slice that:

- Validates the GPT-5 Option B architectural pattern (multiple concentric `RingGeometry` instances) for ring substructure work, establishing the pattern Slice 6+ ring polish or Uranus/Neptune ring slices can reuse
- Adds the highest-visual-significance features (significance `2-3`) that distinguish a moderately-zoomed Saturn from a low-zoom Saturn — Huygens Gap, Encke Gap, Roche Division
- Refreshes Saturn rendering while Slice 4's ring context is fresh in the codebase, validating the additive sibling-mesh pattern under `saturnRingsGroup` before introducing a new planet system in Slice 6

### Slice 6: Mars System Honest Mode

Status: shipped 2026-05-08. Cutover commit `481292d` (Phase G hierarchy fix). Six bug-find loops during cutover (Phases D, E, F, G, D-round-2) surfaced the cross-frame body rendering architectural class — see §13 Slice 6 limitations for codified lessons.

This slice extends honest mode to Mars (replacing Slice 2's simple spherical representation), Phobos, and Deimos. It introduces `FRAME_MARS_J2000_ICRF` as the third planet-centered inertial frame and validates the per-body Hermite cadence pattern at sub-hourly density (Phobos at `30m`).

#### Included

- Mars rendered as oblate ellipsoid (`a=b=3396.19km`, `c=3376.20km`, `~0.59%` flattening) with render-only `25.19°` axial tilt, replacing Slice 2 spherical Mars
- Phobos rendered as sphere using `a=13km` axis, deliberate triaxial simplification per Galilean precedent
- Deimos rendered as sphere using `a=7.8km` axis
- `FRAME_MARS_J2000_ICRF`: new planet-centered inertial frame, child of `FRAME_HELIO_J2000_ICRF` (see §3.12)
- Per-body fixture cadence: Mars `1d`, Phobos `30m`, Deimos `1h` (see §3.9 and `src/v2/boundary/slice6-fixture-spec.md`)
- Cubic Hermite interpolation per body at its own cadence
- Default outer-system overview camera unchanged (Mars now reachable via halo + focus key)
- Default Mars focus camera at non-edge-on orbit angle per the §13 Slice 5 lesson
- Time scrubbing densest cadence is now 30 minutes (Phobos), updated from Slice 5's 1 hour
- Route: `/v2/solar-system` extends; no new route

#### Excluded

- Mars surface terrain (Olympus Mons, Valles Marineris, polar caps) — explicit non-goal
- Mars atmosphere rendering — non-goal
- Body-fixed rotation animation for Mars or moons — non-goal (consistent with Slice 3-5 deferrals)
- Triaxial Phobos rendering — intentionally simplified despite `30%` triaxial spread
- Triaxial Deimos rendering — same simplification despite `34.6%` spread
- Mars's two minor satellites (Phobos and Deimos are the only known natural satellites; no minor moons exist)
- SPK ingestion — explicitly deferred to Slice 7+ candidate
- Asteroid rendering — Slice 7+ scope
- All Slice 5 non-goals carry forward

#### Why Slice 6

Mars + Phobos/Deimos is the smallest planet system that:

- Pressure-tests the per-body Hermite cadence pattern at sub-hourly density (Phobos's `7.65-hour` orbital period requires denser sampling than any prior V2 body)
- Provides empirical measurement of Hermite interpolation accuracy at `30m` cadence, feeding the propagation-method decision for the Slice 7 asteroid catalog
- Validates the planet-centered frame pattern across a third instance, with a planet whose tilt (`25.19°`) is more pronounced than Jupiter (`3.13°`) but less than Saturn (`26.7°`)
- Adds a planet system whose moons have higher triaxial spread than any prior V2 body (Phobos `30%`, Deimos `34.6%`), establishing how V2 handles deliberately simplified spherical rendering at higher visual cost

### Slice 7: Asteroid Catalog Honest Mode

Status: SHIPPED 2026-05-11. Cutover declared after Phase D round 4 manual verification; Phase H's orbit-line MVP produced the belt-band visual between Mars and Jupiter without reopening the Slice 7 scope.

This slice adds a visualization-grade asteroid catalog to `/v2/solar-system`. It does not introduce a new frame. Instead, it introduces a second propagation path in `core/`: Keplerian two-body propagation from a uniform Horizons anchor epoch for `1,008` selected asteroids.

#### Included

- Hybrid asteroid set of `1,008` bodies:
  - Top `1,000` main-belt asteroids by `H` after quality gating
  - `8` curated famous NEAs (Bennu, Apophis, Eros, Itokawa, Ryugu, Toutatis, Geographos, Castalia)
- SBDB as canonical inventory and metadata source
- Horizons VECTORS as canonical anchor-state source at `2026-05-01 00:00:00 TDB`
- Cartesian-to-elements conversion at ingestion, then continuous Keplerian propagation per frame
- Existing `FRAME_HELIO_J2000_ICRF` reused; no new frame
- Three render modes by apparent diameter:
  - `THREE.Points` with additive soft-glow shader
  - `THREE.InstancedMesh` for resolved non-focused bodies
  - individual `Mesh` for the focused body
- Phase H orbit-line MVP:
  - orbit ellipse sampler in `core/`
  - batched orbit geometry in one `THREE.LineSegments` draw (`130,048` vertices)
  - focus-state LOD fade for browse vs. close-inspection camera states
  - focused-orbit highlight on click-to-focus
- Click-to-focus only; route remains `/v2/solar-system`

#### Excluded

- Search UI
- Asteroid labels or name overlays
- Orbit traces
- Full small-body population beyond the curated `1,008`
- SPK ingestion
- Non-gravitational forces and perturbation modeling beyond vanilla two-body propagation
- Photoreal shape models, spin states, or mission-planning fidelity
- All Slice 6 non-goals carry forward

#### Why Slice 7

Slice 7 is the smallest slice that:

- Introduces a many-body catalog large enough to force a render-layer LOD architecture instead of one-mesh-per-body
- Validates a second propagation method in `core/` without disturbing the Slice 1-6 Hermite path
- Resolves the SBDB-vs-Horizons source split honestly: SBDB for inventory, Horizons for recent anchor state
- Establishes the anchor-epoch discipline that future catalog rebuilds must follow

### Slice 8: Catalog-Scale Asteroid Rendering

Status: SHIPPED `2026-05-15`. Cutover declared after Phase D round 2 manual verification confirmed the `10,008`-body cell-as-mesh architecture, preserved belt visual density, and held Slice 1-7 regressions.

Slice 8 scales the asteroid catalog from `1,008` to `10,008` bodies while preserving the Slice 7 truth architecture. It is a scale-and-performance slice, not a propagation-method reboot.

#### Included

- Top `10,000` main-belt asteroids by `H` magnitude
- the existing `8` curated NEAs carried forward from Slice 7
- always-Horizons re-anchor at `2026-05-01 00:00:00 TDB`
- GPU instancing at catalog scale
- frustum culling and spatial indexing bundled as one rendering architecture decision
- `1 AU` uniform spatial grid with `178` occupied cells across the shipped `10,008`-body fixture
- cell-as-mesh frustum culling with hysteresis margin; close-zoom measurement shows `14 / 178` cells visible (`~92%` culled)
- INV-013 stratified asteroid bars by eccentricity band
- adaptive orbit-line threshold `H < 10.98`
- minimal `ui-hud` unfreeze limited to focused-body text in the screen corner
- shipped execution split:
  - Phase A1: data foundation, fixture build, boundary ingestion, INV-013 harness
  - Phase A2: spatial grid, cell-as-mesh culling, picking integration, minimal HUD
  - Phase D round 2: flicker reduction, orbit-line contract enforcement, startup camera tilt, Earth/Jupiter color polish
- Slice 7 carry-forward architecture:
  - Keplerian propagation
  - ecliptic-derived stored elements
  - three-mode LOD
  - anchor-epoch discipline

#### Excluded

- NEA catalog expansion beyond the carried-forward `8`
- mission planner integration
- economics work
- search / filter UI
- per-asteroid metadata panels
- wide-line shader or additive orbit-line blending polish

#### Why Slice 8

Slice 8 is the smallest slice that:

- pressure-tests whether the Slice 7 asteroid architecture survives a `10×` population increase without reopening `core/`
- replaces the single visualization-grade asteroid bar with data-derived stratified bars
- bundles the first explicit broad-phase visibility structure into V2 render architecture
- measures whether catalog-scale asteroid rendering can still hold `60 fps` on the target hardware class

### Slice 8.5: UX Polish

Status: SHIPPED `2026-05-16`. Cutover declared after Slice 8 manual verification plus the follow-on Slice 8.5 polish pass closed the first-impression UX issues that were intentionally deferred out of the architectural slice.

Slice 8.5 is a polish slice, not a new truth-architecture slice. It layers starfield context, a clearer overview camera affordance, lightweight HTML overlays, and body-framing fixes on top of the shipped Slice 8 architecture.

#### Included

- Tycho-2-based star background with `10,000` magnitude-limited stars from the shipped binary asset
- camera-relative star rendering so stars stay effectively at infinity under the floating-origin pipeline, with constant screen-size stars and baked B-V-derived color
- top-down ecliptic preset on key `t`, targeted to the ecliptic normal in the scene's ICRF frame
- planet hover tooltips through the currently rendered planet set
- Earth focus radius widened so the Moon is visible from default Earth focus
- asteroid focus radius adjusted for less aggressive close framing
- Saturn moon halo floors scaled by moon size for better distinguishability
- always-visible date / epoch HUD text overlay with sub-day granularity
- `ui-hud` freeze expanded only for lightweight HTML overlays; no 3D labels, search, or panels

#### Excluded

- asteroid hover labels
- 3D billboard planet labels
- proper motion or epoch drift in the star background
- lighting overhaul / photoreal material work
- residual frustum-edge flicker fine-tuning

#### Why Slice 8.5

Slice 8.5 is the smallest slice that:

- improves the deployed URL's first impression without reopening Slice 8 core architecture
- adds spatial orientation context (stars + top-down preset) before Slice 9 scale-up
- cracks `ui-hud` only as far as needed for usability, while preserving Slice 9 ownership of the full UI unfreeze

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
- Default outer-system camera shows Saturn at honest sub-pixel scale (Saturn's body apparent diameter is roughly `0.5 px` at `1080p` / `1 px` at `4K` from the overview position at `7 AU` from the Jupiter-Saturn midpoint anchor; rings are similarly sub-pixel). Halos make Saturn and all seven moons findable from default camera state. After user-driven focus on Saturn (key `s`) and zoom-in to Saturn-system view, Saturn renders as visible oblate ellipsoid with render-only `26.7°` tilt and ring system visible; Cassini Division resolves as a darker band at moderate zoom.
- Continuous zoom from heliocentric overview through Saturn system to `400 km` altitude above any of Saturn, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus, no precision artifacts.
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display.
- Frame round-trips: `FRAME_HELIO_J2000_ICRF` ↔ `FRAME_SATURN_J2000_ICRF` stays below `10 × Number.EPSILON` for one round-trip and `100 × Number.EPSILON` across a chain of ten transforms. Slice 1, 2, 3 round-trip bounds remain in force.
- Development invariants INV-001 through INV-010 pass with zero violations.
- Slice 4 ships at `/v2/solar-system`. `/v2/inner-solar-system` and `/v2/earth-moon` redirects remain in place.
- Saturn renders as oblate ellipsoid, ring system renders as tilted semi-transparent disk with Cassini Division visible.

If those criteria are not met, the slice does not ship.

### Slice 4 Measured Results

Slice 4 cleared all eight per-body interpolation bars across the 90-day validation window with the following margins:

| Body | Cutover bar | Measured max | Margin |
|------|-------------|--------------|--------|
| Saturn | 1 km | 0.202399 km | 4.9× |
| Titan | 20 km | 6.034246 km | 3.3× |
| Rhea | 5 km | 1.264611 km | 4.0× |
| Iapetus | 2 km | 0.618783 km | 3.2× |
| Tethys | 1 km | 0.284336 km | 3.5× |
| Dione | 50 km | 6.777692 km | 7.4× |
| Mimas | 20 km | 3.359336 km | 6.0× |
| Enceladus | 5 km | 0.857091 km | 5.8× |

Frame round-trip error: `FRAME_HELIO_J2000_ICRF` ↔ `FRAME_SATURN_J2000_ICRF` measured zero relative error across one round-trip and ten-chain — the transform is implemented as pure subtraction/addition of Saturn's heliocentric state with no intermediate matrix multiplications, mathematically reversible to floating-point precision. Moon-native chain measured `6.34e-13` relative error (within the `100·ε` bound; reflects translate-by-large-vector cancellation per the INV-004 scope clarification from Slice 3).

INV-001 through INV-010 passed with zero violations across the validation window. Slice 1, 2, 3 cutover harnesses continue to pass (regression check).

Manual browser verification on the target machine class (Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display) confirmed: Saturn renders as oblate ellipsoid with render-only `26.7°` tilt; ring system renders as tilted semi-transparent disk coplanar with Saturn's equator; Cassini Division resolved as darker band at sufficient zoom; all eight Saturn system bodies findable via focus keys (`s`, `t`, `r`, `i`, `y`, `d`, `m`, `e`); Jupiter system focus keys (`7`, `8`, `9`, `0`, `-`) regression-clean; continuous zoom from heliocentric overview through Saturn system to body close-up shows no precision artifacts. Default heliocentric framing correctly shows Saturn as a small body at honest scale, requiring focus key to resolve detail — this is by design per honest-mode policy. Note on default-camera verification: rings are not visible from the default outer-system overview camera at startup, because Saturn's apparent diameter from that distance (~`7 AU` from the Jupiter-Saturn midpoint anchor) is sub-pixel. Ring visibility verification requires user-driven focus on Saturn via the `s` key and zoom-in to Saturn-system view. This is consistent with honest-mode policy: bodies render at true scale and apparent-size halos make sub-pixel bodies findable, but ring substructure does not have a halo system.

Note: The cutover bars are calibrated at 3-7× measured max with honest per-body margins (per `src/v2/core/invariants/INV-010.md`). Margins of 3-7× indicate substantial headroom; the bars are correctly calibrated, not artificially tight.

### Saturn Ring Substructure Slice Bar (Slice 5)

- All seven Slice 5 features render as visible meshes under `saturnRingsGroup` at `/v2/solar-system`
- Huygens Gap visible as a darker annular band within the Cassini Division at moderate zoom
- Huygens Ringlet visible as a thin brighter annulus within the Huygens Gap at high zoom
- Laplace Gap and Laplace Ringlet similarly visible (gap dark, ringlet bright)
- Encke Gap visible as a thin dark line within the A ring at moderate zoom
- Keeler Gap visible as a thin dark line near the A ring outer edge at high zoom
- Roche Division visible as a faint outer-edge fade extending beyond the A ring outer boundary
- All seven features sit in Saturn's equatorial plane at the existing Slice 4 render-only `26.7°` tilt; no rendering artifacts at the boundaries between sibling meshes
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display
- Continuous zoom from heliocentric overview through Saturn close-up to ring substructure detail shows no precision artifacts and no Z-fighting between sibling ring meshes
- Development invariants INV-001 through INV-010 pass with zero violations (no new invariants introduced)
- Slice 1, 2, 3, 4 cutover harnesses continue to pass (regression check)
- Slice 5 ships at `/v2/solar-system`; existing redirects remain in place

If those criteria are not met, the slice does not ship.

### Slice 5 Measured Results

Slice 5 cleared all visual cutover criteria with seven new ring substructure features rendering correctly:

| Feature | Visual significance | Visibility verification |
|---|---|---|
| Encke Gap | 2 | Visible as thin dark line in outer A ring at Saturn-focused moderate zoom |
| Roche Division | 2 | Visible as faint outer-edge fade beyond A ring outer boundary |
| Huygens Gap | 2 | Visible as darker band within Cassini Division at Saturn-focused moderate zoom |
| Laplace Gap | 3 | Visible as second darker band within outer Cassini Division |
| Huygens Ringlet | 3 | Visible as thin bright line inside Huygens Gap at high zoom |
| Laplace Ringlet | 3 | Visible as thin bright line inside Laplace Gap at high zoom |
| Keeler Gap | 4 | Visible as thin dark line near A ring outer edge at high zoom |

No new invariants introduced. INV-001 through INV-010 continue to pass with zero violations across the validation window. Slice 1, 2, 3, 4 cutover harnesses continue to pass (regression check). `npm test` at `51/51` passing.

Manual browser verification on the target machine class (Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display) confirmed: all seven new substructure features visible from Saturn-focused camera state per the verification protocol established in §11. Rings appear coplanar with Saturn's equator at `26.7°` render-only tilt. No Z-fighting between sibling `RingGeometry` meshes at any zoom or viewing angle. Saturn system, Jupiter system, Earth-Moon, and time scrubbing all regression-clean.

Architectural note: Slice 5 surfaced and resolved a default Saturn-focus camera bug (pre-existing in Slice 4 but undetected at that cutover) where the camera was positioned exactly edge-on to the tilted ring plane (`90.00°` between camera view direction and ring-plane normal, with floating-point error of `1.4e-14°`). The fix (commit `8f3c30e`) adjusted the default Saturn focus orbit angle to `π/3` polar to avoid edge-on viewing. This is the architectural lesson Slice 5 contributed: render-only tilt rotation about the X-axis interacts with default camera orbit positioned along the X-axis to produce mathematical edge-on coincidence; future render-only tilt slices (e.g. Mars `25°`, Uranus `98°`) must explicitly verify default focus camera angles are non-edge-on to the tilted plane.

### Mars System Slice Bar (Slice 6)

- Per-body interpolated position error stays below the bars defined in §3.4 (Mars `0.05 km` at `1d` per INV-008 carry-forward, Phobos `5 km` at `30m`, Deimos `0.5 km` at `1h`) across the full `2026-05-01` to `2026-07-30` validation window. New Phobos and Deimos bars codified as INV-011.
- Default outer-system overview camera shows Mars at honest sub-pixel scale (per §11 default-camera verification protocol; Mars's apparent diameter from `7 AU` is similar to Saturn's at the same distance). Halo makes Mars findable.
- User-driven Mars focus camera at non-edge-on orbit angle shows Mars as visible oblate ellipsoid (oblateness barely visible at `0.59%` flattening; this is honest mode, not a bug).
- Phobos and Deimos visible as halos initially when Mars is focused; resolved as small bodies at high zoom.
- Continuous zoom from heliocentric overview through Mars system to `400 km` altitude above any of Mars, Phobos, Deimos shows no precision artifacts.
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display.
- Frame round-trips: `FRAME_HELIO_J2000_ICRF` ↔ `FRAME_MARS_J2000_ICRF` stays below `10 × Number.EPSILON` for one round-trip and `100 × Number.EPSILON` across a chain of ten transforms. Slice 1, 2, 3, 4 round-trip bounds remain in force.
- Development invariants INV-001 through INV-011 pass with zero violations.
- Slice 1, 2, 3, 4, 5 cutover harnesses continue passing (regression check).
- Slice 6 ships at `/v2/solar-system`. Existing redirects remain in place.

If those criteria are not met, the slice does not ship.

### Asteroid Catalog Slice Bar (Slice 7)

- Asteroid propagated position error stays below `100,000 km` across the full `2026-05-01` to `2026-07-30` validation window at `1d` cadence when compared against Horizons truth for the Slice 7 representative sample. This bar is codified as INV-012.
- The hybrid catalog contains exactly `1,008` bodies: `1,000` main-belt asteroids plus the `8` curated famous NEAs.
- Default heliocentric overview renders the catalog in Points mode without regressing planet and moon visibility or frame precision.
- Click-to-focus on curated asteroids resolves to the same propagated heliocentric state used for rendering; render and focus targets may not diverge.
- LOD transitions (Points → InstancedMesh → Mesh) are driven by apparent diameter and show no disappearance or obvious pop-through during continuous zoom.
- `60 fps` target on Apple Silicon Mac, integrated GPU, Chrome stable, single 4K display.
- Development invariants INV-001 through INV-012 pass with zero violations.
- Slice 1, 2, 3, 4, 5, and 6 cutover harnesses continue passing (regression check).
- Slice 7 ships at `/v2/solar-system`. Existing redirects remain in place.

If those criteria are not met, the slice does not ship.

### Slice 7 Measured Results

Round-2 pre-research re-anchored the full catalog from Horizons at the Slice 7 window start and produced the following representative worst-case sample margins:

| Body | Max error | RMS error | Margin to 100,000 km bar |
|---|---:|---:|---:|
| Hygiea | 35,313 km | 15,843 km | 2.83× |
| Psyche | 22,510 km | 9,934 km | 4.44× |
| Laetitia | 13,854 km | 6,299 km | 7.22× |
| Harmonia | 10,583 km | 4,808 km | 9.45× |
| Bennu | 4,236 km | 1,827 km | 23.60× |
| Apophis | 1,506 km | 624 km | 66.39× |

Worst sampled body was Hygiea at `35,313 km`. All eight curated NEAs remained below `5,000 km` at day 90 after the anchor correction. The locked INV-012 bar of `100,000 km` is therefore empirically supported with `2.83×` margin on the sample set.

### Catalog-Scale Asteroid Slice Bar (Slice 8)

- INV-001 through INV-011 continue to pass unchanged for their existing body classes
- INV-013 replaces INV-012 for asteroid bodies:
  - Band A (`e < 0.1`): `35,612.872 km`
  - Band B (`0.1 ≤ e < 0.2`): `52,970.092 km`
  - Band C (`0.2 ≤ e < 0.3`): `37,688.076 km`
  - Band D (`e ≥ 0.3`): `43,757.550 km`
- Slice 7's `18` sampled asteroid bodies continue to pass their corresponding INV-013 band bars (regression preservation)
- The Slice 8 catalog contains exactly `10,008` bodies: `10,000` main-belt asteroids plus the carried-forward `8` curated NEAs
- `60 fps` holds at:
  - outer-system overview
  - focused close-zoom
  - time-scrub
- Spatial index culls off-screen cells correctly and achieves at least `90%` culling efficiency at outer-system overview based on the chosen cell geometry
- Click-to-focus retargets correctly in Points, InstancedMesh, and focused Mesh modes
- Orbit-line thresholding preserves the Slice 7 belt-band visual while keeping orbit lines limited to bodies with `H < 10.98`
- `ui-hud` minimal crack behaves correctly: focused-body designation/class text appears on focus and disappears on overview
- Slice 8 ships at `/v2/solar-system`; existing redirects remain in place

If those criteria are not met, the slice does not ship.

---

## 7. Validation Strategy

### Truth Sources

- JPL Horizons vectors are the primary truth source for validation across all slices
- App-facing ingress uses `/api/horizons`
- Upstream truth source is `https://ssd.jpl.nasa.gov/api/horizons.api`
- Slice 1 fixtures are stored locally under `tests/fixtures/v2/horizons-earth-moon-30d.json`
- NHATS/Asterank remain boundary data sources, not truth authorities
- SPICE and SGP4 are explicitly deferred to Slice 2+
- Slice 7 adds JPL SBDB as a canonical inventory and metadata source, but not as the propagation truth authority

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

### Slice 6 Truth Source

JPL Horizons vectors remain the truth authority. Slice 6 uses the API parameters defined in `tools/slice6-research/fetch-horizons.mjs`. Phobos and Deimos queries use `CENTER='500@499'` (explicit Mars geocenter ID, mirroring Slice 3's `CENTER='500@599'` Galilean and Slice 4's `CENTER='500@699'` Saturnian patterns). Mars itself queried at `CENTER='500@10'` (heliocentric, matching Slice 2).

`STEP_SIZE` values must be quoted (`'30 m'` not `30 M`) per the inheritance from Slices 3-5.

See `src/v2/boundary/slice6-fixture-spec.md` for the full fixture contract.

### Slice 7 Truth Source

Slice 7 uses two upstream JPL sources with distinct responsibilities:

- JPL SBDB:
  - canonical for asteroid inventory selection and metadata
  - source of `designation`, `name`, `H`, `G`, class, `condition_code`, `data_arc`, `neo`, `pha`
- JPL Horizons VECTORS:
  - canonical for propagation truth and anchor state
  - anchor query parameters match `tools/slice7-research/fetch-horizons-anchors.mjs`: `CENTER='500@10'`, `REF_SYSTEM='ICRF'`, `REF_PLANE='FRAME'`, `TIME_TYPE='TDB'`, `OUT_UNITS='KM-S'`, `VEC_TABLE='2'`, `TLIST='2461161.5'`

Round-2 pre-research established the refined DEC-2 split: SBDB is not used directly as the propagation anchor because epoch freshness is heterogeneous across bodies. The production propagation path derives osculating elements from Horizons anchor vectors at the uniform Slice 7 anchor epoch of `2026-05-01 00:00:00 TDB`, stores those classical elements in heliocentric J2000 ecliptic orientation, then rotates propagated states into canonical heliocentric ICRF for rendering and focus.

See `src/v2/boundary/slice7-fixture-spec.md` for the full fixture contract.

### Slice 8 Truth Source

Slice 8 preserves the Slice 7 source split but revises DEC-2 to the stricter final rule: always Horizons re-anchor at `2026-05-01 00:00:00 TDB`.

- JPL SBDB remains canonical for inventory selection and metadata only
- JPL Horizons VECTORS is canonical for every propagation anchor state
- no Slice 8 body uses SBDB-direct propagation elements

Phase A ingestion reuses the existing Slice 7 `1,008` anchors and fetches the remaining `9,000` main-belt anchors from Horizons. At the enforced `3s` rate limit from pre-research, that remaining work implies an `~8.5 hour` ingestion floor before retries and file-write overhead. Slice 8 accepts this cost explicitly rather than masking it behind stale-anchor exceptions.

See `tools/slice8-research/round2-methodology-report.md`, `tools/slice8-research/round3-synthesis-report.md`, and `src/v2/boundary/slice8-fixture-spec.md`.

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

### Slice 5 Ownership

| Agent | Owns |
|---|---|
| `renderer` | Saturn ring substructure rendering, `saturn-ring-substructure.ts` module extension to `saturn-rings.ts`, sibling `RingGeometry` mesh hierarchy, per-feature material tuning, render order discipline, Z-fighting prevention |
| `orbital-mechanics` | Frozen for Slice 5 (no `core/` changes) |
| `data-layer` | Frozen for Slice 5 (no boundary changes; no new fixture) |
| `ui-hud` | Frozen |
| `economics` | Frozen |
| orchestrator | Enforces v2 wall, reviews cutover, resolves cross-agent conflicts |

### Slice 6 Ownership

| Agent | Owns |
|---|---|
| `orbital-mechanics` | INV-011, `FRAME_MARS_J2000_ICRF` transforms, interpolation extensions for Phobos `30m` and Deimos `1h` cadences, Mars system body constants |
| `data-layer` | Horizons fetcher extension to Mars system, Slice 6 fixture ingestion (`ingestSlice6Fixture`), `mars-centered` frame inference |
| `renderer` | Scene composition extension to Mars system, oblate Mars rendering per `src/v2/render/mars-oblate.md`, default Mars focus camera at non-edge-on orbit angle, halo continuity, replacement of Slice 2 simple Mars |
| `ui-hud` | Frozen |
| `economics` | Frozen |
| orchestrator | Enforces v2 wall, reviews cutover, resolves cross-agent conflicts, enforces default-camera-state verification per §11 |

### Slice 7 Ownership

| Agent | Owns |
|---|---|
| `orbital-mechanics` | INV-012, Keplerian propagation path, Cartesian-state-to-elements conversion, asteroid catalog metadata contract, anchor-epoch discipline |
| `data-layer` | SBDB selection ingestion, Horizons anchor ingestion, Slice 7 fixture contract and validation, dual-source boundary ownership |
| `renderer` | Asteroid Points / InstancedMesh / focused Mesh LOD path, additive soft-glow shader, click-to-focus render/focus continuity |
| `ui-hud` | Frozen |
| `economics` | Frozen |
| orchestrator | Enforces v2 wall, reviews cutover, resolves cross-agent conflicts, ensures SBDB-for-selection / Horizons-for-anchor split is preserved |

### Slice 8 Ownership

| Agent | Owns |
|---|---|
| `orbital-mechanics` | INV-013 cutover logic, eccentricity-band policy, Slice 8 cutover harness |
| `data-layer` | Slice 8 fixture ingestion, `10,008`-body inventory assembly, Horizons anchor reuse + extension strategy |
| `renderer` | asteroid renderer extensions, spatial-index module, frustum-culling integration, adaptive orbit-line thresholding, picking continuity |
| `ui-hud` | minimal unfreeze only: focused-body designation/class text in screen corner |
| `economics` | Frozen |
| `mission` | Frozen |
| orchestrator | Enforces v2 wall, freezes `keplerian.ts` and the Slice 7 fixture, reviews the final spatial-index choice, enforces the 60 fps cutover requirement |

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

### Non-Goals For Slice 5

All Slice 4 non-goals carry forward. Additionally:

- Herschel Gap and Herschel Ringlet (significance `4`, sub-pixel at moderate zoom)
- Russell Gap, Jeffreys Gap, Kuiper Gap, Bessel Gap, Barnard Gap (the narrow Cassini Division features, significance `4-5`)
- F ring (deferred until a future ring polish slice or as a Cassini-imaging-fidelity follow-up)
- E ring, spokes, ring shadows, anisotropic phase scattering, particle-level dynamics (all consistent with Slice 4 deferrals)
- Ring substructure render-layer optimization (LOD transitions, fade-out for distant Saturn views) — deferred until needed
- Generalization to a `PlanetRings` primitive class (deferred until a second ringed-body slice for Uranus or Neptune actually needs it; Slice 5 extends `saturn-rings` module organically)

### Non-Goals For Slice 6

All Slice 5 non-goals carry forward. Additionally:

- Mars surface terrain — Olympus Mons, Valles Marineris, polar ice caps; deferred to future polish slice or possibly a separate "surface rendering" architectural slice if that product direction is pursued
- Mars atmosphere rendering — Mars has thin CO2 atmosphere; visible haze rendering deferred
- Body-fixed rotation animation for Mars (`24h 37m` sidereal period) or moons (tidal locks)
- Triaxial Phobos rendering — intentionally simplified despite `30%` triaxial spread
- Triaxial Deimos rendering — same simplification
- Mars satellite layer (no minor moons exist; explicit clarification only)
- SPK ingestion — Slice 7+ candidate
- Asteroid catalog — deferred to Slice 7
- Surface landing visualization (KSP-style) — explicitly out of scope; revisit as separate slice if pursued
- Sub-30-minute cadence for any body — pre-research showed `30m` is sufficient for Phobos with `6.4×` margin

### Non-Goals For Slice 7

All Slice 6 non-goals carry forward. Additionally:

- asteroid search UI
- asteroid labels or name overlays
- orbit traces
- full small-body catalog beyond the curated `1,008`
- SPK ingestion
- perturbation modeling beyond vanilla two-body propagation
- detailed shape models, spin states, or photoreal surface rendering
- mining gameplay or mission-planning fidelity

### Non-Goals For Slice 8

All Slice 7 non-goals carry forward. Additionally:

- NEA catalog expansion beyond the carried-forward `8` curated bodies
- mission planner integration
- economics work
- search / filter UI
- per-asteroid metadata panels
- 3D floating labels
- additive blending on orbit lines
- wide-line shader / `Line2`
- changes to `src/v2/core/propagators/keplerian.ts`
- changes to `tests/fixtures/v2/asteroid-catalog-slice7.json`

#### Rendering Fidelity Non-Goals (Slices 8-10)

Slices 8 through 10 explicitly prioritize architectural foundation (catalog scale, frustum culling, spatial indexing) and mission-planner integration (Δv analysis, transfer trajectories, economic modeling) over rendering fidelity. The following features are deferred to Slice 11.5+ polish phase or out of scope entirely:

Deferred to Slice 11.5+ polish (if shipped at all):

- PBR shaders for planets (`MeshPhysicalMaterial`, `8K` textures, normal/displacement maps)
- Procedural asteroid shape generation (noise-driven mesh deformation, irregular shapes per radar models)
- Wide-line shaders (`Line2` / `LineMaterial`) for orbit-line thickness
- Additive blending experiments on orbit-line layer
- Sun glow (volumetric god rays, raymarching shaders)
- Earth atmospheric scattering (Rayleigh / Mie shader)
- Saturn ring particle system with Cassini Division substructure modeling
- Jupiter cloud bands and storm rendering
- Body rotation animation (sidereal periods, axial precession, libration)
- 3D body labels (deferred to Slice 9 `ui-hud` unfreeze)

Out of scope for Aster v1:

- Non-spherical gravity perturbations (`J2` oblateness for Earth / Mars)
- Yarkovsky / solar radiation pressure perturbations on NEA trajectories
- True n-body integration (`REBOUND`, Barnes-Hut) — two-body Keplerian is sufficient for mission-planning resolution
- Collision detection / handling between bodies
- Light-time delay corrections (sub-second at solar-system scale, irrelevant to mission planning)
- Tidal locking dynamics, libration modeling
- Relativistic effects: frame-dragging, Shapiro delay, gravitational lensing, Mercury precession
- Doppler-shifted colors, relativistic aberration
- Spacetime curvature visualization

Rationale: Aster's product thesis is asteroid mining mission planning, not visualization fidelity. NASA Eyes on Asteroids, JPL Solar System Visualizer, and similar professional tools do not implement most of these features either. Pursuing rendering completeness would consume months on cosmetic improvements while the mission-planner thesis remains unbuilt. After Slice 11 ships the mission-planner core, Slice 11.5 may revisit selected polish items from this deferral list.

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

### Slice 5

The Slice 5 tripwire is **2 focused weekends from the start of the Slice 5 implementation dispatch**. Weekend 1 is consumed when implementation begins. If all seven features are not rendering visually correctly by end of weekend 2, the multi-`RingGeometry` approach (GPT-5 Option B) is re-evaluated against the alternatives (Option A 1D radial density texture, Option C hybrid) before Slice 6. Slice 5 is intentionally smaller in tripwire window than Slice 4 (`4 weekends`) because the architectural surface is smaller — render-layer extension only, no `core/` work, no new invariants.

### Slice 6

The Slice 6 tripwire is **3 focused weekends from the start of the Slice 6 implementation dispatch**. Slice 6 is intentionally tighter than Slice 4's `4-weekend` tripwire because the architectural pattern is now well-established (third planet-centered frame, third per-body cadence slice). If all three INV-011 cutover bars are not met by end of weekend 3, the per-body Hermite cadence approach is re-evaluated and SPK ingestion becomes a stronger candidate for Slice 7. Slice 6 also tripwires the default-camera verification protocol added in §11: default Mars focus camera must be confirmed non-edge-on at cutover. Manual verification per §11 must include both default-camera-state and focused-camera-state checks.

### Slice 7

The Slice 7 tripwire is **4 focused weekends from the start of the Slice 7 implementation dispatch**. Slice 7 reopens architectural surface area in both `core/` and `render/`: new propagation method, dual-source ingestion, many-body catalog LOD, render/focus continuity for click targets, and the Phase H orbit-line MVP that produces the belt-band visual. If INV-012 is not met, the catalog cannot maintain `60 fps`, or render/focus target agreement is not preserved by end of weekend 4, then the catalog size, propagation strategy, or LOD plan is re-evaluated before Slice 8. Slice 7 also tripwires the anchor-epoch discipline: if cutover requires stale anchors or per-body epoch exceptions, the architecture has failed its own honesty standard and the fixture rebuild strategy must be reconsidered before shipping.

Actual result: cutover declared on `2026-05-11`, within weekend 1 of the 4-weekend window, leaving roughly 3 focused weekends of headroom against the tripwire.

### Slice 8

The Slice 8 tripwire is **5 focused weekends from the start of the Slice 8 implementation dispatch**. Slice 8 is a scale-and-performance slice: `10,008` bodies, `10,000` Horizons re-anchors, INV-013 band enforcement, adaptive orbit-line thresholding, and spatial-index-driven culling / picking. If cutover is not reached by end of weekend 5, scope drops rather than bleeding forward indefinitely. Fallback options are:

- reduce body count to `5,000`
- defer spatial indexing to Slice 9
- accept slower-than-`60 fps` outer-system overview as an explicit descoping decision instead of an unspoken failure

Actual result: Slice 8 implementation started Thursday `2026-05-14` and cutover was declared Friday `2026-05-15`, well inside weekend 1 of the 5-weekend window and leaving essentially the full remaining budget untouched.

### Slice 8.5

The Slice 8.5 tripwire is **2 focused weekends from the start of the Slice 8.5 implementation dispatch**. Slice 8.5 is intentionally constrained to render-layer and lightweight `ui-hud` polish. If the full seven-item scope does not ship by end of weekend 2, the slice decomposes by keeping the star background and body-framing fixes, while pushing tooltip/HUD niceties to Slice 9.

Actual result: Slice 8.5 implementation started Friday `2026-05-15` and shipped Saturday `2026-05-16`, well inside the 2-weekend budget and after an explicit localhost-only verification gate for the star-size and top-down camera fixes.

### Verification Protocol For All Future Slices

Manual cutover verification must explicitly distinguish two camera states:

1. Default camera state at page load (no user input). Criteria here are halo-findability for sub-pixel bodies and viewport composition (which bodies are framed). Ring substructure features and other sub-pixel-resolved geometry are **not** expected to be visible from this state at honest scale.
2. User-focused camera state after pressing focus keys (`1-9`, `s`, `t`, etc.) and zooming in. Criteria here are direct-pixel visibility of the slice's resolved features (e.g. body geometry, oblate ellipsoid shape, ring substructure, Cassini Division).

Each cutover criterion in §6 should specify which camera state it applies to. Cutover criteria that conflate the two states (e.g. claiming a sub-pixel feature is visible from default state) are not honest-mode-consistent and must be rewritten before cutover declaration.

---

## 12. Open Questions

### Resolved at Slice 3 planning

- **ECEF / body-fixed frames** — confirmed deferred; planet-centered inertial pattern (§3.8) is sufficient for Slices 3+ without surface-relative work.
- **Planet-centered frame pattern validation** — Slice 3 demonstrates the pattern; Slice 4+ reuses it.

### Resolved at Slice 4 planning

- **Multi-instance planet-frame validation** — Slice 4 confirms the §3.8 pattern extends cleanly to a second planet-centered frame (Saturn), with three independent fast-orbit bodies pressure-testing per-body cadence.
- **Ring rendering architectural pattern** — established in `src/v2/render/saturn-rings.md` as a separate render-layer module. Generalization to a `PlanetRing` primitive is deferred until a second ringed-body slice actually needs it.

### Resolved at Slice 5 planning

- **Multi-RingGeometry vs single-texture-with-detail** — Slice 5 commits to GPT-5 Option B (multiple sibling `RingGeometry` instances) for ring substructure work. Validated as the right choice for `~7-12` named ring features; if Slice 6+ ring work scales to dozens of features, the 1D density texture approach (Option A) becomes worth revisiting.
- **Ring substructure architectural artifact location** — `saturn-ring-substructure.md` as a sibling to `saturn-rings.md`, both inside `src/v2/render/`. Generalization to a `PlanetRings` primitive deferred per §10.

### Resolved at Slice 6 planning

- **Hermite-vs-SPK at sub-hourly cadence** — Slice 6 pre-research empirically validated Hermite at `30m` for Phobos with `6.4×` margin against `5 km` bar. SPK ingestion was not forced for Slice 6, and Slice 7 later proceeded with Keplerian-from-anchor rather than SPK.
- **Default focus camera edge-on coupling** — Slice 6 applies the §13 Slice 5 lesson (commit `8f3c30e` Saturn camera fix) preemptively to Mars focus orbit angles. The render-only `X`-axis tilt + camera-along-`X` coupling is now a documented constraint that future slices apply automatically rather than discover at cutover.

### Resolved at Slice 7 planning

- **SBDB-vs-Horizons source authority split** — resolved. SBDB is canonical for asteroid inventory and metadata only; Horizons is canonical for propagation anchor state and truth validation.
- **Hermite-vs-Keplerian for asteroid catalog bodies** — resolved. Slice 7 uses Keplerian propagation from uniform Horizons anchors while preserving Hermite unchanged for Slice 1-6 bodies.
- **INV-012 cutover bar** — resolved by round-2 pre-research at `100,000 km` with `2.83×` margin on the representative sample.

### Resolved at Slice 8 planning

- **Smart-staleness optimization** — resolved and rejected. Round 2 methodology investigation showed the apparent benefit was window-dominant rather than source-dominant; Slice 8 always re-anchors at `2026-05-01 TDB`.
- **INV-013 asteroid bars** — resolved by Round 3 with eccentricity-stratified exact values:
  - Band A (`e < 0.1`): `35,612.872 km`
  - Band B (`0.1 ≤ e < 0.2`): `52,970.092 km`
  - Band C (`0.2 ≤ e < 0.3`): `37,688.076 km`
  - Band D (`e ≥ 0.3`): `43,757.550 km`
- **Adaptive orbit-line threshold** — resolved at `H < 10.98`, preserving the Slice 7 belt-band visual for the brightest `~1,000` bodies inside the Slice 8 catalog.

### Open

- **Star background** — deferred to a later visual-polish slice
- **Body axial tilt static rendering** — deferred
- **Light-time correction** — deferred until needed for precision astrometry
- **Asterism overlays and planet orbit traces** — deferred until trajectory rendering slice
- **Body rotation animation** — deferred to a future visual-polish slice
- **SPK ingestion** — Slice 6 validated Hermite for sub-hourly moon cadence and Slice 7 validated Keplerian-from-anchor for a `1,008`-body asteroid catalog. SPK ingestion remains deferred. The next forcing function would be a substantially larger catalog, a longer validated propagation horizon, or higher-than-visualization-grade accuracy requirements.
- **Mars surface terrain rendering** — separate architectural slice if pursued. Surface-relative rendering at meter scale is architecturally supported by V2's camera-relative floating-origin pattern but not implemented. Decision deferred pending product direction (Aster mission planner thesis vs. KSP-style exploration product).
- **Asteroid search / browse UX** — Slice 7 is click-to-focus only. Whether Slice 9 should add search, curated lists, or richer discovery controls remains open.
- **Final spatial-index implementation choice** — resolved in Phase A. Slice 8 uses a uniform grid, and the initial `8 AU` planning guess was corrected to `1 AU` cells after measuring the real `10,008`-body fixture (`8 AU` collapsed `10,007` bodies into one cell, making culling useless).
- **Per-instance repack vs whole-cell visibility submission** — Slice 8 pre-research and docs define both as plausible; Phase A measures which pattern is simpler while still clearing `60 fps`.
- **10,008-body performance on target Apple Silicon integrated GPU** — this is a cutover question, not a pre-research question. Phase A must measure it directly.
- **Triaxial moon rendering** — Phobos's `30%` triaxial spread is the highest of any V2 body. Slice 6 ships spherical; if visual artifact reports surface, polish-of-polish triaxial Phobos is a candidate.
- **Uranus and Neptune rings** — both have ring systems (Uranus's rings discovered 1977, Neptune's confirmed by Voyager 2 in 1989). The `saturn-rings.md` pattern should generalize, but Uranus's rings are nearly opaque dark particles and Neptune's are partial arcs — different visual character from Saturn. Revisit at Slice 6+ planning.
- **Ring tilt evolution rendering** — Saturn's rings cycle from edge-on to fully open over ~15 years from Earth's viewpoint. This is rendered correctly at any single epoch (rings are tilted at the render layer so they match Saturn's equator while `FRAME_SATURN_J2000_ICRF` stays ICRF-aligned), but the visual cycle as Saturn moves through its heliocentric orbit is not animated. Honest at any snapshot; not animated across multi-year scrubs.
- **Ring shadows** — render-layer artifact (Saturn casting on rings, rings casting on Saturn) needs both light source position from heliocentric frame and screen-space shadow rendering. Architecturally separable from current ring substructure work; revisit at Slice 7+ or a polish slice.
- **F ring rendering** — F ring is a thin outer ring with shepherd moons (Prometheus, Pandemos). Different visual character from the main ring system; could ship as a single thin `RingGeometry` sibling to the `saturnRingsGroup`. Deferred until needed.

---

## 13. Known Limitations

These are limitations of the shipped Slice 1 through Slice 8.5 deliverables, recorded for transparency and to inform future-slice scoping. They are not bugs and do not affect cutover.

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
- Ring tilt is fixed to Saturn's equator by a render-only `26.7°` tilt from the `FRAME_SATURN_J2000_ICRF` `Z` axis, structurally correct at any snapshot. The visual ring-opening / closing cycle observed from Earth over Saturn's ~29.5-year orbit is not animated.
- Body rotation (Saturn ~10.66h, tidal locks for moons) is not animated. Same deferral pattern as Slice 3.
- Time scrubbing advances by the densest cadence in the current slice (1h for Slice 4, unchanged from Slice 3); Iapetus at `79d` barely moves per scrub step while Mimas sweeps visibly.
- Fixture size growth is accelerating: Slice 2 `~250 KB`, Slice 3 `~780 KB`, Slice 4 `~1.85 MB`. Slice 6's Mars system did push Phobos to `30-minute` cadence and total fixture size to `~3-4 MB`; SPK ingestion remains deferred but the pressure stays live for Slice 7+.
- Verification protocol clarification: Slice 4 cutover was originally verified by the user after manual camera adjustment to view Saturn close-up. From the default outer-system overview camera at startup, Saturn's body is sub-pixel (apparent diameter ~`0.5 px` at `1080p`, ~`1 px` at `4K`) and the ring system is similarly sub-pixel. Saturn becomes findable from default state via halo overlay; ring system requires user-driven focus on Saturn (`s` key) and zoom-in to become visible. This is honest-mode rendering working as designed, not a rendering bug. Slice 5 and all future slice cutover protocols explicitly require both default-camera state verification (where halo-findability is the criterion for sub-pixel features) and focused-camera state verification (where direct-pixel visibility is the criterion for resolved features). The original Slice 4 cutover declaration's language conflated these two states; the founding-doc text in §6 has been updated to be consistent with honest-mode behavior.

### Slice 5

- Saturn rings now render seven additional substructure features (Huygens Gap, Huygens Ringlet, Laplace Gap, Laplace Ringlet, Encke Gap, Keeler Gap, Roche Division) as sibling `RingGeometry` meshes. Total ring-system mesh count: `~9-10` (existing C/B/A disk + Cassini Division band + 7 Slice 5 features).
- Narrow Cassini Division gaps (Herschel, Russell, Jeffreys, Kuiper, Bessel, Barnard) and Herschel Ringlet remain rendered only as the broader Cassini Division dark band from Slice 4. They are sub-pixel at moderate zoom and deferred to polish-of-polish.
- F ring is not rendered in Slice 5; Roche Division renders as the visual outer-edge fade where the main ring system terminates, with no F ring beyond it.
- Ring substructure renders in the same plane as the rest of the Saturn ring system at Slice 4's render-only `26.7°` tilt. No per-feature tilt variation.
- Render order is explicitly managed via Three.js `renderOrder` to prevent Z-fighting between sibling meshes at the same `Z` position. If Z-fighting artifacts surface at extreme zoom, the `renderOrder` discipline may need refinement.
- No LOD transition for ring substructure: at very low zoom (Saturn small in viewport), all seven features render but are sub-pixel. Performance impact is negligible because each is a small `RingGeometry`, but visual benefit is also negligible at that zoom.
- Shepherd moon dynamics (Pan in Encke Gap, Daphnis in Keeler Gap) are not rendered — moons are not in Slice 4's body set. Adding them is deferred to Slice 5 polish or a Saturn-system completeness slice.
- Render-only tilt + default focus camera coupling: Slice 5 surfaced a non-obvious failure mode where render-only tilt rotation around an axis (Saturn's tilt around `X`) interacts with default focus camera position (Saturn focus also along `X`) to produce exactly edge-on viewing. The bug was undetected at Slice 4 cutover because the original verification protocol did not specify default-camera-state observation. Slice 4's apparent visual correctness during cutover review came from manual camera adjustment that the verification process did not record. Future slices that add render-only tilt to a body must explicitly verify the default focus camera is not edge-on to the tilted plane. Mars (`25°` tilt), Uranus (`98°` tilt), and Neptune (`28°` tilt) are all at risk of similar edge-on coincidence depending on default focus camera positioning.
- Visual regression test gap: this is the third occurrence in V2 history of "automated tests pass but visual rendering broken" failure mode (Slice 2 BodyId import bug, Slice 3 INV-004 runtime gap, Slice 5 edge-on camera + earlier `renderOrder` regression). Each was caught by manual verification, not unit tests. A pixel-diff regression test for ring rendering at default and focused camera states would catch this class of failure but is non-trivial to implement in headless Three.js. Deferred to Slice 7+ infrastructure work.
- Material tuning is first-pass: Slice 5 ships with reasonable but not exhaustively tuned alpha values for the seven substructure features (gaps `~0.28-0.34`, ringlets `~0.62`, Roche Division gradient texture). If significance-3+ features prove difficult to find at typical zoom levels, the material tuning is the polish-of-polish lever.
- Render-order discipline applies only to substructure overlays: the Slice 4 baseline meshes (main disk, Cassini Division band) explicitly do **not** use `renderOrder`, while the seven Slice 5 substructure meshes use `renderOrder ≥ 1`. This asymmetry was forced by a Three.js transparency-rendering quirk (commit `1aaa21f`) where setting explicit `renderOrder=0` on transparent baseline meshes caused them to fail to render. Future ring rendering work must preserve this asymmetry: baseline meshes default-`renderOrder`, overlays explicit-`renderOrder`.
- Roche Division renders as visual outer-edge fade only: F ring is out of scope, so the Roche Division has no outer ring to terminate at; it just fades to transparent at its outer radius. This is structurally honest (the Roche Division is genuinely a tenuous transition zone) but visually ambiguous about what's beyond. F ring rendering is deferred per §10.

### Slice 6

- Phobos at `30-minute` fixture cadence is the densest cadence in V2 to date. Phobos fixture file is approximately `4,320` records over the `90-day` validation window, vs. `~2,160` for prior `1h`-cadence bodies. Total Slice 6 fixture estimated at `3-4 MB` (Slice 5 was `~2 MB`).
- Phobos's `30%` triaxial spread (`13 / 11.4 / 9.1 km`) is the highest of any V2 body. Slice 6 ships spherical Phobos despite this; the visual simplification will be more noticeable at high zoom than for Saturn moons (Mimas's `8%` spread). Polish-of-polish triaxial Phobos rendering is a future candidate.
- Deimos's `34.6%` triaxial spread is even higher in percentage terms but absolute body size is small (`~6 km` mean radius); spherical simplification is less visually impactful.
- Mars's `0.59%` flattening is the lowest of any V2 body rendered as oblate ellipsoid. The visual difference between spherical and oblate Mars at typical zoom is barely distinguishable. Slice 6 maintains the architectural oblate-rendering pattern for consistency despite minimal visual payoff.
- Time scrubbing densest cadence is now `30 minutes` (Phobos), down from Slice 5's `1 hour`. Slower-cadence bodies (Mars at `1d`, Deimos at `1h`) are interpolated to current scrub time per §3.10.
- Default Mars focus camera applies the Slice 5 edge-on lesson (commit `8f3c30e`) preemptively. `orbitPolar` set to `π/3` (`60°`) or other non-edge-on value per the Saturn precedent; exact value chosen at implementation per the `saturnTiltGroup` precedent.
- Render-only axial tilt scope: The render-only tilt pattern (Slice 4 Saturn, Slice 6 Mars) applies to body geometry only, never to a child group containing other bodies in the same frame. Child bodies in a planet-centered ICRF frame are already in canonical ICRF orientation; applying a render tilt to them rotates them out of their canonical positions, causing focus-target anchors and rendered positions to disagree. Phase F surfaced this in Slice 6 implementation when Phobos and Deimos were initially placed under `marsTiltGroup`; corrected in Phase G to siblings of `marsTiltGroup` matching the Saturn precedent. Future planet systems with moons (Uranus `98°` tilt, Neptune `28°` tilt if pursued) must apply this discipline: tilt group contains only the parent body and any tilt-affected child geometry like rings; child bodies remain siblings.
- Phobos surface features (Stickney crater, groove fields) deferred. At `22 km` diameter and `~9.4` Mars radii orbital distance, Phobos is small enough that surface features would require very high zoom to resolve; deferred to future polish.
- Deimos surface features deferred. Smaller and smoother than Phobos.
- Mars rotation (`24h 37m` sidereal period) not animated. Same deferral pattern as Slices 3-5.
- SPK ingestion remains deferred. Slice 6 pre-research empirically justified the deferral (Phobos at `30m` has `6.4×` margin against `5km` bar). Slice 7 later validated Keplerian-from-anchor for a `1,008`-body visualization-grade catalog, so the next SPK forcing function is now a larger catalog, longer propagation horizon, or higher-accuracy requirement.

### Slice 7

- The asteroid catalog is intentionally limited to `1,008` bodies (`1,000` main-belt + `8` curated NEAs). It is not a full small-body population view.
- Slice 7 is visualization-grade. Asteroid propagation uses vanilla two-body Keplerian math with INV-012 bar of `100,000 km` across the validated `90-day` window, not mission-planning fidelity.
- Anchor-epoch discipline is mandatory. The validated accuracy statement assumes anchors were fetched at the Slice 7 window start (`2026-05-01 00:00:00 TDB`). Reusing stale anchors across materially different windows is expected to drift.
- Most asteroids will render in Points mode from heliocentric overview. This is honest-mode behavior, not a bug; the catalog is too dense and too small in apparent size to justify body meshes everywhere.
- Orbit-line MVP uses `THREE.LineSegments` with normal blending and low-opacity `LineBasicMaterial` per Deep Research recommendation. Additive blending, wide-line shader / `Line2`, and any stronger glow polish are explicitly deferred to Slice `7.5`.
- Click-to-focus is the only asteroid discovery path in Slice 7. Search, labels, and richer browse controls remain deferred.
- Asteroid shapes, spin states, and photometric realism are deferred. Focused asteroids are still rendered through simplified geometry rather than mission-grade shape models.
- Continuous per-frame propagation at `1,008` bodies is acceptable at Slice 7 scale. A future multi-10k-body slice may need GPU-assisted propagation or more aggressive batching; Slice 7 does not solve that future scale problem in advance.
- The stored orbit-element frame label drift from Slice 7 cutover (`FRAME_HELIO_J2000_ICRF` label on ecliptic-derived classical elements) is acknowledged here and resolved immediately in Slice `7.1` cleanup Commit 2.
- Runtime click-to-focus integration is verified by manual cutover and code inspection, but there is not yet an end-to-end automated test for Points and InstancedMesh raycasting. Adding that coverage is recommended for Slice `7.5` or Slice `8`.

### Slice 8

- INV-013 supersedes INV-012 for asteroid bodies. INV-012 remains the Slice 7 historical artifact; Slice 8 cutover uses the stratified band bars only.
- Smart-staleness (`DEC-2` v1) is abandoned. No Slice 8 body uses SBDB-direct propagation elements.
- Phase A ingestion is slow by design: `9,000` new Horizons re-anchors at `3s` minimum interval implies roughly `8.5 hours` before retries and file-write overhead.
- The spatial index is intentionally coarse rather than adaptive perfection. Slice 8 prefers the simplest structure that clears `60 fps`, not the most abstractly elegant one.
- Orbit-line rendering remains visually important but intentionally limited to `H < 10.98`; the other `~9,000` bodies rely on Points / InstancedMesh only.
- `ui-hud` remains mostly frozen. Slice 8 permits only focused-body designation/class text; richer overlays and 3D floating labels remain Slice 9 scope.
- Cell-boundary flicker was substantially reduced by the Phase D hysteresis margin, but aggressive zoom can still surface residual oscillation. This is acceptable at Slice 8 cutover and a candidate for Slice `8.5` polish.

### Slice 8.5

- The Tycho-2 background is frozen at J2000. No proper motion, parallax, or epoch drift is modeled in v1.
- Planet hover tooltips cover the currently rendered planet set through Saturn only. Moons, asteroids, and star hover remain out of scope.
- Planet hover UI is HTML-overlay only. 3D billboard labels remain deferred to Slice 9.
- Residual frustum-edge flicker is reduced but not fully eliminated; deeper tuning is deferred to Slice 9's larger revisit of asteroid rendering scale and interaction.
- Top-down preset (`t`) required three implementation passes. Commit `61f4a61` shipped the original preset, commit `4452abc` targeted the wrong layer and produced no visible behavior change, and commit `10f0af3` fixed the real frame mismatch. The root cause was that the preset drove `orbitPolar -> 0` in the runtime's raw spherical basis (`+Y` / ICRF north), while the belt renders in the ecliptic frame rotated into ICRF. The visual miss was therefore the obliquity of the ecliptic (`~23.4°`), not an animation or clamp bug. The final camera math derives from `J2000_ECLIPTIC_OBLIQUITY_RAD` in `src/v2/core/units.ts`, the same source used by the propagator's ecliptic-to-equatorial rotation, so the camera and belt frames now share one source of truth.
- The top-down preset should render the belt ring-like and no longer globally tilted, but not as a perfect circle. The orbit layer is a batch of real Kepler ellipses, not a circular ring primitive. This behavior is correct and should not be re-reported as a camera bug.
- The original green test for top-down was insufficient because it asserted an intermediate spherical variable, not the rendered camera-forward vector. The final regression test now asserts the camera-forward direction against the ICRF-transformed ecliptic normal within `2°`.
- Earth still reads as a saturated blue under the current lighting model. A principled fix is a lighting/material question, not another color-constant tweak; defer to a future render-lighting slice.
- Saturn moon distinguishability improved from roughly `3-4` visible moons to about `5` at default framing. The remainder are still sub-pixel or glow-merged and remain a future polish candidate.
- Reports that stars were inflating into blobs during close asteroid focus were a mixed diagnosis. The real star size-attenuation bug fixed by commit `0c2e355` was valid and remains fixed; some large glowing blobs seen during close asteroid shots were simply near asteroids rendering large at honest close camera range.
