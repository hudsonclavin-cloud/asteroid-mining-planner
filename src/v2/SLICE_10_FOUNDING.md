# Slice 10 Founding Document — Lambert Solver + Earth-Departure Screening

**Status:** SKELETON. DECs locked where research supports the choice; OQs open pending measurement or pre-research diagnostic.
**Date opened:** 2026-05-22
**Inherits invariants from:** Slice 8 (INV-001 through INV-013), Slice 9 (INV-014 three-gate)
**Research library:** src/v2/research/slice-10-lambert/, slice-11-porkchop/, slice-12-deltav-propulsion/, slice-13-spacecraft-sizing/

---

## 1. Thesis

The mission planner begins here. For every catalog body, compute the Lambert problem from Earth's orbit to that body for a representative transfer window. Surface C3 (characteristic energy at Earth departure), v∞ at arrival, and time-of-flight. Filter the catalog by mission-feasible C3 ceiling. Validate against JPL Trajectory Browser / NHATS records on a fixed set of reference targets.

This is the first slice that turns the catalog from "things to look at" into "things to evaluate." Lambert is the unit of trajectory computation; every slice above this depends on it.

## 2. Scope

### In scope for Slice 10

- Lambert solver integration (Izzo 2014, single-revolution)
- Earth-departure screening across the full 41,906 NEA catalog
- Per-body computation of C3, arrival v∞, time-of-flight for a chosen transfer window
- C3 ceiling filter (configurable, default value DEC-locked below)
- Catalog list UI badge: each body tagged with departure C3 and feasibility status
- Validation harness: 5 reference targets benchmarked against NHATS detail-mode records
- Honesty layer: every per-body C3/Δv displayed carries a fidelity tag (patched-conic limitation surfaced)

### Out of scope for Slice 10 (deferred to later slices)

- Multi-revolution Lambert (Slice 10.1 if measurement shows we're missing windows)
- Pork-chop visualization (Slice 11)
- Δv stack decomposition beyond Earth-departure (Slice 12)
- Spacecraft sizing and propulsion mass-ratio (Slice 13)
- Composition-weighted scoring (Slice 14)
- Economic feasibility ranking (Slice 17)

## 3. Inherited Invariants

Slice 10 inherits and does not modify:

- **INV-001 through INV-013** from Slice 8 (f64 core, f32 GPU, floating-origin rendering, frame conventions, etc.)
- **INV-014** from Slice 9 (three-gate visualization-tier contract: encounter-flag, staleness, anomaly-tail; documented residual envelope-exceedance)
- **Side-file + atomic-swap** for any long-running tracked-file mutation
- **Verify-before-lock** discipline (measure before threshold-locking, diagnostic-before-decision-from-one-body)
- **Combinable-vs-split dispatch criterion** (combinable if mechanical from prior step's output)

## 4. New Invariants

### INV-015 — Lambert solver provenance

The Lambert solver used in Slice 10 and beyond must be traceable to a peer-reviewed algorithm with open-source reference implementation. The current implementation is Izzo 2014 (arXiv:1403.2705) via PyKEP source code, compiled to WebAssembly. Any future replacement requires a new INV-015 amendment with measured comparison against the current implementation on the validation harness.

### INV-016 — Patched-conic honesty layer

Every per-body departure-C3 or arrival-Δv value computed by Slice 10's Lambert pipeline must carry a fidelity tag indicating it is patched-conic (Sun-only dynamics, impulsive maneuvers, no planetary perturbations). This tag must be surfaced in the UI alongside the numerical value. The user should never see a Slice 10 Δv number presented as higher-fidelity than NHATS Trajectory Browser equivalents.

## 5. Locked Decisions (DECs)

### DEC-1 — Algorithm choice: Izzo 2014 via PyKEP → WebAssembly

**Decision:** Use Izzo's 2014 Lambert algorithm, compiled from PyKEP's C++ implementation (src/lambert_problem.cpp) to WebAssembly via Emscripten. Single-revolution only for Slice 10.

**Evidence:** Research synthesis (src/v2/research/slice-10-lambert/deep-research-trajectory-spacecraft-engineering.pdf, Topic 1) ranks Izzo 2014 as "best balance of speed, robustness, accuracy" (Sangrá & Fantino 2022). PyKEP's source is the closest open implementation to the original paper, with multi-revolution support and explicit edge-case branch handling. License is GPL-2.0-or-later (acceptable for our open-source repo).

**Alternative considered:** Bate-Newton universal-variable solver, hand-implemented in TypeScript. Faster per-solve (~0.10ms vs Izzo's ~0.12ms), no build-step overhead. Rejected because it requires us to hand-code branch detection and edge-case handling (180° transfers, parabolic, multi-rev) without the benefit of decades of community validation. The per-solve speed advantage is irrelevant at our scale (40k bodies × one screening pass = order-of-seconds either way).

**Caveat:** PyKEP is GPL; we need to confirm the licensing surface for shipping WASM-compiled code embedded in our MIT/BSD-style repo. OQ-3 below.

### DEC-2 — Single-revolution only for Slice 10

**Decision:** Slice 10 uses single-revolution Lambert (M=0). Multi-revolution branches are not computed.

**Evidence:** Research consensus (slice-10-lambert PDF, Topic 1) is that multi-revolution rarely matters for NEAs at typical mission timescales. Empirically, NEA transfers with practical Δv budgets use M=0 or rarely M=1.

**Accept-and-document:** If post-Slice-10 measurement reveals we're missing meaningful launch windows on a subset of bodies due to multi-rev branches, that becomes Slice 10.1 (OQ-6 pattern — extend, don't curve-fit).

### DEC-3 — Departure window: 2026-01-01 through 2040-12-31

**Decision:** Default Earth-departure date range is 2026-01-01 through 2040-12-31. This is the screening window for the catalog-wide pass.

**Evidence:** NHATS API documentation (slice-11-porkchop/perplexity-jpl-trajectory-browser-nhats.md) currently uses 2020-2045. We adopt a narrower window centered on the present epoch (~14 years forward) for performance and relevance. Wider than necessary but cheaper to narrow than to expand later.

**Configurable:** UI exposes the window as a tunable parameter. Default is the locked range; user can override per-target for deep-dive.

### DEC-4 — Date grid spacing: 7 days screening, 1 day deep-dive

**Decision:** Catalog-wide screening pass uses 7-day departure date spacing. Per-target deep-dive UI exposes 1-day spacing as a refinement.

**Evidence:** Research synthesis (slice-10-lambert PDF, Topic 2) notes typical grid spacing is "a few days to ~1 week; finer (~1-5 days) for high resolution, coarser (~10 days) for initial surveys." 7-day spacing for screening is the standard initial-survey resolution; 1-day for per-target is the standard high-resolution refinement.

**Performance implication:** Catalog (41,906) × Departure dates (14 years × 52 weeks ≈ 730) × Arrival sweep (per body, see DEC-5) = order 10^7 Lambert solves catalog-wide. At ~0.12ms per solve in WASM, that's roughly 20 minutes single-threaded. Web Worker parallelism brings it to minutes. Cache the result; re-screen only when the catalog or window changes.

### DEC-5 — Arrival date sweep: 0.5 to 5.0 year time-of-flight, per-departure

**Decision:** For each departure date, sweep arrival dates corresponding to time-of-flight in the range 0.5 to 5.0 years (182 days to 1826 days). 30-day spacing in TOF for screening.

**Evidence:** Research synthesis (Topic 2) gives "flight time 0.5-5 years for NEAs" as the canonical screening range. 30-day TOF spacing balances coverage against compute cost.

**Per-target deep-dive:** Refined to 1-day TOF spacing.

### DEC-6 — C3 ceiling: 25 km²/s² for "feasible" tag (default)

**Decision:** Default C3 ceiling for the "feasible" tag is 25 km²/s². Bodies with min-C3 above this in the screening window are tagged "high-C3" (not "infeasible" — they exist, they're just expensive).

**Evidence:** NHATS standard filter is dv=6 km/s total mission, which for chemical missions corresponds roughly to C3≈25. We adopt this as benchmark-compatible with NHATS's accessible-target population.

**Configurable:** UI exposes ceiling as a tunable parameter. Bodies are never hidden by the ceiling; only their feasibility tag changes.

### DEC-7 — Validation harness: 5 reference targets vs NHATS

**Decision:** Validation harness for INV-015 compliance compares Slice 10's Lambert output against NHATS detail-mode records for 5 reference targets:

1. **99942 Apophis** — Aten, well-documented, high public interest
2. **2000 SG344** — Aten, accessible, NHATS-classic example
3. **1999 AO10** — Apollo, accessible, varied orbit type
4. **2001 GP2** — Apollo, low-Δv accessible target
5. **101955 Bennu** — Apollo, ground-truth from OSIRIS-REx sample return

For each: compare our min-Δv-trajectory C3 and arrival v∞ against NHATS API's min_dv_traj record. Tolerance threshold TBD by measurement (OQ-5).

**Why 5:** Slice 9's three-gate INV-014 validated on a population sample; a small reference set is enough for solver-level validation. Single-target validation is insufficient (one-body inference fails). Five targets across orbit classes (Aten, Apollo) catches class-dependent regressions.

### DEC-8 — Failure mode for bodies that fail Lambert convergence

**Decision:** Bodies for which the Lambert solver fails to converge within branch-detection iterations are tagged "lambert-unconvergeable" and excluded from the feasible/high-C3 partitioning. They are not dropped from the catalog; they're tagged.

**Evidence:** Even Izzo's algorithm has documented edge cases (near-180° transfers, parabolic flight times). Research consensus is that "modern solvers explicitly implement branch switches" but a small fraction of cases require careful handling. We accept-and-document the failure rate rather than papering over it.

**Measurement gate:** OQ-2 below — characterize the failure population before any production deploy.

## 6. Open Questions (OQs)

### OQ-1 — Patched-conic honesty layer surface

**Question:** How exactly do we surface the patched-conic limitation in the UI?

**Why open:** INV-016 says we must surface it; the *how* depends on the catalog list UI design from Slice 9 Phase C.2 (not yet built). Could be a badge, an info tooltip, a per-body confidence indicator, or a global "About this tool" disclosure that all Slice 10 numbers reference.

**Resolution criterion:** UI design decision, locked when Phase C.2 catalog list UI is in flight.

### OQ-2 — Lambert convergence failure population

**Question:** What fraction of the 41,906 NEA catalog fails Lambert convergence under DEC-1 + DEC-3 + DEC-4 + DEC-5 settings? Is the failure population systematic (e.g., specific orbit classes) or random?

**Why open:** Required for honest accept-and-document treatment per DEC-8. Need to measure before locking how to handle. The OQ-6 discipline applied here: do a pre-research diagnostic pass before deciding whether to extend the solver, drop the bodies, or just tag them.

**Resolution criterion:** Run the screening pass on the full catalog, characterize the failure population by orbit class and by failure mode (e.g., near-180° transfer, parabolic, max-iter exceeded). Document. Then decide.

### OQ-3 — PyKEP GPL licensing surface for WASM-compiled solver

**Status: CLOSED 2026-05-23.**

**Question (original):** When we compile PyKEP's GPL-2.0-or-later Lambert C++ source to WASM and ship it embedded in the Aster v2 repo, what licensing obligations does that create?

**Resolution:** GPL-2.0-or-later accepted for the Aster v2 repository. PyKEP's Lambert solver is compiled to WebAssembly and embedded; the combined work distributes under GPL-2.0-or-later.

**Rationale:**
- PyKEP is the closest open-source implementation of Izzo 2014 to the reference paper, with battle-tested edge-case handling.
- Re-implementing Izzo clean-room or porting poliastro's MIT-licensed Python implementation to TypeScript is achievable but adds engineering work and lifetime maintenance burden without proportionate benefit at this project's scale.
- Aster v2 is an open-source research project where GPL is a normal and accepted license. The Cornell LOCI / Anthropic Fellows narrative is unaffected.
- Hudson (sole copyright holder of Aster v2's original contributions) retains the ability to dual-license his own work in the future if commercialization arises.

**Actions taken:**
- LICENSE file added at repo root declaring GPL-2.0-or-later.
- NOTICE file added at repo root attributing PyKEP (and Tycho-2, NEA catalog from JPL).
- This OQ closed as resolved.

**Downstream implications:**
- Forks of Aster v2 inherit GPL-2.0-or-later for the combined work.
- Deployed bundle (docs/) must make source available; the GitHub repo URL satisfies this.
- Future trajectory-layer dependencies should prefer GPL-compatible or more-permissive licenses; nothing more restrictive than GPL can be added without re-evaluation.

### OQ-4 — Validation tolerance for INV-015

**Question:** What numerical tolerance defines a "pass" for the 5-target NHATS comparison?

**Why open:** NHATS itself uses a Lambert solver and is documented as "low fidelity" (Trajectory Browser FAQ explicitly says this). Some difference between our output and NHATS's is expected even with identical algorithms because of ephemeris source, parking-orbit assumptions, and integration-detail differences. Need to measure the natural spread before locking a tolerance.

**Resolution criterion:** Run the 5-target comparison against NHATS detail-mode. Characterize the natural spread (median offset, max offset, distribution shape). Lock a tolerance threshold that's neither so tight it false-fails on benign differences nor so loose it papers over real bugs.

### OQ-5 — Earth ephemeris source for Lambert r1/r2

**Status: CLOSED 2026-05-23.**

**Question (original):** Which Earth-state ephemeris do we use for the Lambert problem's r1 (Earth state at departure)?

**Resolution:** Extend the existing Slice 2 Horizons fixture pattern (tabulated JPL Horizons vectors + cubic Hermite interpolation) to cover Slice 10's full 2026-01-01 through 2040-12-31 screening window. Use the same source pattern for all 5 inner-solar-system bodies (Sun, Mercury, Venus, Earth, Mars), at daily cadence.

**Rationale:**
- JPL Horizons tabulated vectors are truth-grade at the precision Lambert needs at the patched-conic level. Sub-meter position accuracy at decade timescales.
- Reusing the validated Slice 8/9 Hermite-interpolation code path eliminates an entire class of integration risk. No new code path needed beyond the fixture extension.
- The alternative (analytic Keplerian Earth propagator from src/v2/core/propagators/keplerian.ts) would introduce a new validation surface for a precision gain we don't need. Keplerian Earth at 14-year timescales would deviate from Horizons truth by sub-km — well below NHATS Trajectory Browser's documented "low fidelity" patched-conic noise floor.
- Decision principle: don't invent diagnostic work that won't change the answer. The OQ-6 discipline of "measure before locking" applies when the lock could plausibly go either way. Here the lock is dominated by one option.

**Validation method:**
- Per-sample agreement with existing Slice 2 fixture at the 2026-05-01 → 2026-07-30 overlap window: required ≤ 1e-3 km position, ≤ 1e-9 km/s velocity.
- Spot-check against fresh Horizons queries at 10 dates spanning 2026-2040: same tolerance.
- Both gates must pass before fixture replaces the existing narrow-window file.

**Actions taken:**
- Extended fixture at tests/fixtures/v2/horizons-inner-solar-system-2026-2040.json
- Generator script at tools/slice10-research/extend-horizons-fixture.mjs
- Fixture spec documented at src/v2/boundary/[slice10-fixture-spec.md or updated slice2-fixture-spec.md]
- Existing narrow-window fixture preserved in place; code migration to the new fixture is a follow-on dispatch.

**Downstream implications:**
- Slice 10 Lambert pipeline uses earthHeliocentricStateProvider exactly as Slice 9 does, just with the wider-window fixture loaded.
- Slice 11 (pork-chops), Slice 12 (Δv), Slice 16 (cislunar staging — Mars and Venus needed for gravity assists) all read from the same extended fixture. No per-slice ephemeris work needed.

## 7. Status

**Phase A (research):** COMPLETE. Research library at src/v2/research/slice-10-lambert/ and adjacent slice folders. DECs 1-8 locked from research synthesis where evidence is clear. OQs 1-5 surfaced for pre-implementation diagnostic.

**Phase B (pre-implementation diagnostic):** PENDING.
- Resolve OQ-3 (PyKEP licensing) before any code is written that depends on the choice.
- Resolve OQ-5 (Earth ephemeris source) via a measurement pass.
- Resolve OQ-2 (Lambert convergence failure population) via a screening diagnostic on the full catalog (can run with a placeholder Earth model; the failure population is intrinsic to the solver, not to ephemeris precision).
- Resolve OQ-4 (validation tolerance) via the 5-target NHATS comparison once Earth ephemeris is locked.

**Phase C (implementation):** PENDING.
- Solver integration (PyKEP WASM build into the v2 toolchain).
- Earth-departure screening pipeline (Web Worker, parallel across the catalog).
- Catalog list UI integration: per-body badges, feasibility tag, fidelity tag per INV-016.
- Honesty-layer UI surfacing per OQ-1 resolution.

**Phase D (verification):** PENDING.
- INV-015 validation harness against 5 reference targets within OQ-4 tolerance.
- Localhost eyes-on verification of badge rendering, tag clarity, fidelity-layer surface.
- Regression sweep against Slice 9 + 8.5 behavior.

**Phase E (cutover + deploy):** PENDING.
- Founding-doc close note.
- Deploy decision per Hudson.

## 8. Architectural Notes (Forward-Looking)

These are informational, not binding for Slice 10. They flag dependencies that Slice 11+ will pick up.

- Slice 11 (pork-chops) reuses Slice 10's Lambert pipeline. The grid-search structure that produces a per-body min-C3 in Slice 10 is the same grid-search structure that visualizes the full 2D pork-chop in Slice 11. Architect Slice 10 with this reuse in mind.
- Slice 12 (Δv stack) needs Earth-departure C3 from Slice 10 as the first stack item. The data structure Slice 10 emits per body should be extensible to additional Δv-stack line items without re-screening.
- Slice 14+ (composition, ISRU, economics) reads per-body Slice 10 results as inputs. The "feasibility" tag from DEC-6 is the gate that downstream slices filter on. Don't bury this tag in the rendering layer; expose it in the catalog data model.

## 9. Deferred items at Slice 10 open

Carrying forward from earlier slices:
- Star catalog filename rename (still "mag75.bin", contains 40k @ V_T ≤ 8.1)
- NEA catalog binary format (51MB JSON → ~12-15MB binary estimate)
- Phase C.2 catalog list UI (Slice 9 deferred)
- Phase C.3 quality down-rank visual treatment (Slice 9 deferred)
- GitHub Actions deploy automation
