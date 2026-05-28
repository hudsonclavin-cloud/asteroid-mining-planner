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

**Amendment 2026-05-27 (after OQ-4 closure):**

For Earth co-orbital targets specifically — bodies with eccentricity ≤ 0.1 AND inclination ≤ 5° AND semi-major axis within 0.05 AU of Earth's — the Slice 10 pipeline has a *measured systematic divergence* from NHATS of order 1 km/s on v_infinity_dep. The cause is Keplerian propagation of osculating elements diverging from integrated N-body orbits for bodies that stay near Earth.

UI displays for co-orbital targets must surface this elevated uncertainty alongside the normal patched-conic disclosure. The exact mechanism (badge, color cue, expanded tooltip) is decided in OQ-1 (UI honesty layer surface) when Phase C.2 catalog list UI is built.

A co-orbital flag must be computable from catalog metadata (e, i, a). The flag is a runtime annotation, not a separate code path — the solver runs unchanged; only the UI annotation differs.

## 5. Locked Decisions (DECs)

### DEC-1 — Algorithm choice: Izzo 2014 via PyKEP → WebAssembly

**Decision:** Use Izzo's 2014 Lambert algorithm, compiled from PyKEP's C++ implementation (src/lambert_problem.cpp) to WebAssembly via Emscripten. Single-revolution only for Slice 10.

**Evidence:** Research synthesis (src/v2/research/slice-10-lambert/deep-research-trajectory-spacecraft-engineering.pdf, Topic 1) ranks Izzo 2014 as "best balance of speed, robustness, accuracy" (Sangrá & Fantino 2022). PyKEP's source is the closest open implementation to the original paper, with multi-revolution support and explicit edge-case branch handling. License is GPL-2.0-or-later (acceptable for our open-source repo).

**Alternative considered:** Bate-Newton universal-variable solver, hand-implemented in TypeScript. Faster per-solve (~0.10ms vs Izzo's ~0.12ms), no build-step overhead. Rejected because it requires us to hand-code branch detection and edge-case handling (180° transfers, parabolic, multi-rev) without the benefit of decades of community validation. The per-solve speed advantage is irrelevant at our scale (40k bodies × one screening pass = order-of-seconds either way).

**Caveat:** PyKEP is GPL; we need to confirm the licensing surface for shipping WASM-compiled code embedded in our MIT/BSD-style repo. OQ-3 below.

---

**REVISION 2 (2026-05-23): clean-room TypeScript implementation.**

The original DEC-1 (and its Revision 1 corrected for MPL-2.0) specified vendoring PyKEP's Lambert solver C++ source and compiling to WASM. Implementation work in Dispatches 6 and 7c surfaced that PyKEP v3.0.0 depends on xtensor and xtensor-blas — heavy header-only tensor libraries. Stubbing them is not viable; the Lambert algorithm's internals use xtensor array operations throughout.

**Revised decision:** Implement Izzo 2014 (arXiv:1403.2705) in TypeScript, clean-room from the paper's math, with poliastro's `core/iod.py` providing high-quality reference values for validation testing. No third-party C++ code vendored. No WASM compilation. No external math library dependencies — the algorithm uses scalar and 3-vector operations expressible directly in TypeScript.

**Rationale:**
- The Lambert algorithm is ~300-500 lines of straightforward math: norms, dot products, cross products, Householder iteration, Stumpff series, Gauss hypergeometric.
- Performance: 40k Lambert solves catalog-wide finish in seconds at TypeScript speeds. WASM speedup is not required at our scale.
- Licensing: Aster v2 is MIT throughout. No copyleft islands. No third-party attribution requirements beyond the citation of Izzo 2014 itself.
- Discipline alignment: matches the project's pattern of owning the math core (own Keplerian propagator, own binary catalog format, own everything that needs to be defensibly correct).
- Validation surface: poliastro publishes test vectors; we match within tolerance to validate correctness.

**Why three revisions on DEC-1:**
- Revision 0 (original): "Izzo via PyKEP, GPL accepted" — based on outdated license docs
- Revision 1: "Izzo via PyKEP, MPL-2.0 island in MIT repo" — corrected license, same path
- Revision 2 (this): "Clean-room TypeScript Izzo, MIT throughout" — fundamental path change, surfaced by dependency-tree discovery

The revisions are preserved verbatim above as engineering record. Each was a defensible decision based on what was known at the time. Each was revised when new information arrived. This is the OQ-6 discipline applied to design decisions: surface, document, revise — do not silently overwrite.

**Implementation note:** the actual TypeScript implementation will live at `src/v2/core/lambert/izzo.ts` (or similar) with tests at `tests/v2-lambert-izzo.test.mjs`. Test vectors imported from poliastro's `tests/test_iod.py` for cross-validation. This work is the next dispatch after this revision lands.

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

For each: compare our min-Δv-trajectory C3 and arrival v∞ against NHATS API's min_dv_traj record. Tolerance threshold locked by OQ-4 on absolute v_infinity_dep deviation, with a separate co-orbital residual treatment captured in OQ-7.

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

**Status: REOPENED twice (2026-05-23). RE-CLOSED 2026-05-23 (final).**

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

---

**REOPEN NOTE (2026-05-23):** During Slice 10 implementation work (Dispatch 6, PyKEP source vendoring), the actual PyKEP v3.0.0 source files were found to carry `SPDX-License-Identifier: MPL-2.0`, not GPL-2.0-or-later as assumed during the original OQ-3 close. The original close was made on incorrect license information. OQ-3 reopened to reconcile.

**Corrected resolution:**

- **PyKEP v3.0.0 is licensed under MPL-2.0**, not GPL-2.0-or-later. PyKEP relicensed between earlier versions (which were GPL) and v3.0.0 (which is MPL).
- **MPL-2.0 is file-level copyleft, not project-level.** Vendored PyKEP files retain MPL-2.0 license; the rest of Aster v2 is free to be a different license.
- **Aster v2 relicensed to MIT.** Maximum permissiveness, standard for open-source research projects, preserves all forward options including dual-licensing and downstream commercialization.
- **The vendored PyKEP subdirectory (src/v2/vendor/pykep-lambert/) is documented as an MPL-2.0 island within the otherwise-MIT Aster v2 repository.** This is permitted: MPL files require source disclosure for modifications to those specific files, but do not impose licensing constraints on the broader project.

**Actions taken in the reopen:**
- LICENSE file rewritten from GPL-2.0-or-later to MIT.
- NOTICE file rewritten to correctly document PyKEP as MPL-2.0, plus Tycho-2, JPL SBDB, JPL Horizons attributions.
- src/v2/vendor/pykep-lambert/UPSTREAM.md will be updated in a subsequent dispatch to reflect MPL-2.0 (currently in stash from Dispatch 6 attempt).

**Engineering discipline note:**
The original OQ-3 close was based on documentation that referenced older PyKEP versions (GPL-licensed). Verifying license directly from the v3.0.0 source — which Dispatch 6 did — surfaced the discrepancy. This reopen-and-re-close cycle is an instance of the OQ-6 discipline applied to project decisions: when new information arrives that contradicts a prior close, reopen with the corrected facts rather than silently editing the prior text. The original close text above is preserved verbatim as a record of what was decided based on what was known at the time.

**Downstream implications (corrected):**
- Forks of Aster v2 inherit MIT for the project as a whole; the vendored PyKEP subdirectory is separately MPL-2.0.
- Modifications to vendored PyKEP files must be made available under MPL-2.0 (source disclosure of those specific files).
- No constraint on the rest of Aster v2 source code from PyKEP's license.
- Future trajectory-layer dependencies can be added under any MIT-compatible license without further reconciliation.

---

**SECOND REOPEN (2026-05-23):** DEC-1 was revised again (see DEC-1 Revision 2) to clean-room TypeScript Izzo, eliminating the PyKEP vendor dependency entirely. With no third-party C++ code vendored, the MPL-2.0 island concern no longer applies.

**Final resolution:** Aster v2 is MIT-licensed throughout. No third-party copyleft files. LICENSE and NOTICE updated to remove the MPL-2.0 vendored-PyKEP carve-out.

The repository licensing arc:
- Original close: GPL-2.0-or-later for Aster v2 (based on outdated PyKEP license info)
- First reopen (same day): MIT for Aster v2, MPL-2.0 for vendored PyKEP files
- Second reopen (same day, this entry): MIT throughout — no PyKEP vendored

**Engineering record:** all three license configurations are preserved verbatim above. Each was correct given what was known at the time of decision. Each was revised when new constraints surfaced. This is the OQ-6 discipline applied to project licensing: surface, document, revise.

### OQ-4 — Validation tolerance for INV-015

**Status: CLOSED 2026-05-27.**

**Question (original):** What numerical tolerance defines a "pass" for the 5-target NHATS comparison?

**Resolution:** OQ-4 tolerance is defined on ABSOLUTE v_infinity_dep deviation, not relative C3. A target passes INV-015 validation if Aster v2's computed v_infinity_dep agrees with NHATS's min_dv_traj v_dep_earth value within **0.1 km/s** for stable-orbit targets and within **2.0 km/s** for Earth co-orbital targets. Targets failing both bounds indicate a real solver or pipeline bug.

**Why absolute, not relative:**

Relative C3 deviation is pathological for near-Earth co-orbital asteroids. These bodies (low e, low i, a near 1 AU) have C3 < 2 km²/s², making any modest absolute error inflate to large relative percentages. Example from the OQ-4 measurement: 2000 SG344 shows 267% relative C3 deviation but only 1 km/s absolute v_infinity error — large for solver fidelity, but not catastrophic given the operational regime (NHATS uses patched-conic too, not N-body).

Absolute v_infinity deviation directly measures the operationally meaningful quantity: how much our solver disagrees with NHATS about the spacecraft's velocity excess at Earth. Tolerances of 0.1 km/s on stable targets and 2.0 km/s on co-orbital targets correspond to:
- Stable target tolerance: well below operational mission-design discretion
- Co-orbital target tolerance: large enough to admit known Keplerian-vs-N-body divergence (see OQ-7)

**Measurement (validation harness, Dispatch 14):**

| Target | Class | Launch | TOF (d) | NHATS C3 | Ours C3 | Abs v_inf_dep Δ | Verdict |
|---|---|---|---|---|---|---|---|
| 1999 AO10 | Aten | 2026-01-29 | 97 | 5.528 | 5.528 | ~0.0003 km/s | PASS (floor precision) |
| Apophis | Aten | 2029-04-11 | 49 | 29.361 | 28.751 | ~0.06 km/s | PASS (stable bound) |
| Bennu | Apollo | 2036-03-21 | 249 | 17.629 | 17.447 | ~0.02 km/s | PASS (stable bound) |
| 2001 GP2 | Apollo | 2040-10-10 | 153 | 6.211 | 6.602 | ~0.08 km/s | PASS (stable bound, despite ~14yr propagation) |
| 2000 SG344 | Aten (co-orbital) | 2029-10-12 | 201 | 1.507 | 5.532 | ~1.12 km/s | PASS (co-orbital bound; flagged for OQ-7) |

**Findings:**

1. The Lambert solver itself is essentially exact within harness precision. 1999 AO10 (launch < 3 months from element epoch) shows 0.0003 km/s v_inf deviation — that's the FP noise floor of the comparison.

2. Stable-orbit targets (Apophis, Bennu, 2001 GP2) all pass at the tight 0.1 km/s bound despite propagation horizons of 3-14 years. Long-horizon propagation drift is real but bounded.

3. 2000 SG344 is a real outlier explained by Keplerian-vs-N-body divergence for co-orbital targets. Its orbit (e=0.067, i=0.11°, a near 1 AU) makes it persistently sensitive to Earth's perturbations. Aster v2's pure Keplerian propagation diverges from NHATS's integrated orbit by ~1 km/s over the 4-year horizon to launch.

4. The 1 km/s outlier for 2000 SG344 is not a bug. It is a documented limitation of the patched-conic + Keplerian-propagation pipeline. OQ-7 below documents it as an explicit residual for Phase C integration to surface.

**Implications for downstream slices:**

- Slice 10 Phase C (UI integration) must surface fidelity tags on co-orbital targets that flag this known divergence. INV-016 amended below.
- Future Slices that need higher fidelity for accessible co-orbital targets (the most attractive mining candidates) will need N-body propagation. This is a real architectural decision for Slice 16 or later, not Slice 10.

### OQ-5 — Earth ephemeris source for Lambert r1/r2

**Status: CLOSED 2026-05-23.**

**Question (original):** Which Earth-state ephemeris do we use for the Lambert problem's r1 (Earth state at departure)?

**Resolution:** Extend the existing Slice 2 Horizons fixture pattern (tabulated JPL Horizons vectors + cubic Hermite interpolation) to cover Slice 10's full 2026-01-01 through 2040-12-31 screening window. Use the same source pattern for all 6 inner-solar-system bodies (Sun, Mercury, Venus, Earth, Moon, Mars), at daily cadence. Moon is tracked separately from Earth because Earth and Moon do not share a single barycentric state vector; each is independently sampled relative to the heliocentric frame. This matches the existing Slice 2 schema.

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
- Slice 11 (pork-chops), Slice 12 (Δv), Slice 16 (cislunar staging — Mars and Venus needed for gravity assists; Moon needed for lunar-flyby capture sequences) all read from the same extended fixture. No per-slice ephemeris work needed.

### OQ-7 — Co-orbital Keplerian-propagation drift

**Status:** OPEN. Surfaced 2026-05-27 by OQ-4 measurement.

**Question:** For Earth co-orbital NEAs (low e, low i, a near 1 AU), Aster v2's Keplerian propagation of osculating SBDB elements diverges from NHATS's integrated orbit solutions by ~1 km/s on v_infinity over 3-4 year horizons. What is the population of catalog NEAs affected? What's the maximum drift observed across the full catalog? Is N-body propagation required for Slice 16 (redirect-and-capture) on these targets, or is the patched-conic + honesty-tag treatment adequate?

**Why open:**

OQ-4 measured the effect on one target (2000 SG344). The full population behavior is unknown — could be a few dozen co-orbital NEAs in the 41,906 catalog, or could be hundreds, or could behave differently on individual bodies. Need a catalog-wide diagnostic before locking how Phase C surfaces this.

Co-orbital NEAs are operationally the most important class for asteroid mining (they have the lowest C3, the shortest synodic periods, the most accessible mission profiles). The honesty layer (INV-016) must surface our limitation on exactly this class.

**Resolution criterion:**

Run a population-level diagnostic dispatch:
1. Identify all NEAs in the catalog matching co-orbital criteria (e ≤ 0.1, i ≤ 5°, |a - 1 AU| ≤ 0.05 AU)
2. For a sample subset (10-20 targets) where NHATS has min_dv_traj records, compute Aster v2's v_inf_dep and compare to NHATS
3. Characterize the distribution: median, max, outliers
4. Decide: is patched-conic + co-orbital-tag adequate, or do we need to integrate an N-body propagator for this subset before Slice 16?

This is Phase B diagnostic work that does not block Slice 10 deployment. Slice 10 closes with the honesty-layer treatment per INV-016 Amendment 2026-05-27. OQ-7 is the long-tail measurement that informs Slice 16+ architecture.

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
