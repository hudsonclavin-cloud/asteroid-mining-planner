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

**Status: CLOSED 2026-05-27.**

**Question (original):** What fraction of the 41,906 NEA catalog fails Lambert convergence under DEC-1 + DEC-3 + DEC-4 + DEC-5 settings? Is the failure population systematic or random?

**Resolution:** Measured via catalog-wide diagnostic ([tools/slice10-research/lambert-failure-population.mjs](/Users/hudsonclavin/asteroid-mining-planner/tools/slice10-research/lambert-failure-population.mjs)).

**Measurement parameters:**
- Departure date: 2030-01-01 UTC (mid-window of Slice 10 2026-2040 screening range)
- TOF sweep: 182-1826 days (0.5-5.0 years) at 30-day step → 55 TOFs per body
- Catalog: 41,906 NEAs from Slice 9 with osculating elements at epoch 2026-04-30
- Total solver calls: 2,304,830

**Aggregate convergence:**
- Successful Lambert solves: 2,304,775 (99.998%)
- Failed solves: 55 (0.002%)

**Failure mode breakdown:**
- no_convergence: 0
- invalid_geometry: 0
- propagator_error: 55

**Per-body classification:**
- All TOFs converge: 41,905 bodies (99.998%)
- Mixed (some OK, some failed): 0 bodies
- No TOFs converge (all-failed): 1 body (0.002%)
- High-failure-rate (>50% fail but some OK): 0 bodies

**Orbit-class distribution of all-failed bodies:**
- JFC: 1

**Findings:**

The Lambert solver is effectively fully robust across the Slice 10 catalog window. There were zero true Lambert failures: no `no_convergence` cases and no `invalid_geometry` cases across 2.30 million solves. The only all-failed body was 2015 D1 (SOHO), a JFC cometary object with `a < 0`, `e > 1`, `maRad = null`, and Slice 9 tier `not-kepler-safe`; it fails in the Keplerian propagator before Lambert is even called.

So OQ-2 resolves cleanly: the failure population is not a solver problem. DEC-8's `lambert-unconvergeable` tag remains a valid rare-edge-case handler, but the measured baseline says it is effectively dormant under the current catalog and screening window. The practical exclusion path today is the pre-existing Slice 9 `not-kepler-safe` / anomaly-tail gating, not Lambert non-convergence.

**Implications for Phase C integration:**

- DEC-8 `lambert-unconvergeable` tag is adequate as a defensive edge-case handler; no refinement is required from this measurement.
- Web Worker pipeline (Phase C.1) handles true Lambert failures by tagging them if they ever occur; propagator-domain failures remain covered by Slice 9's existing `not-kepler-safe` treatment.
- UI display (Phase C.3) does not need a common visible class for Lambert failure. If such a body ever appears, surface it explicitly; otherwise the category should be operationally invisible.

**Engineering record:**

Detailed per-body statistics archived at:
- [tools/slice10-research/lambert-failure-population-detail.json](/Users/hudsonclavin/asteroid-mining-planner/tools/slice10-research/lambert-failure-population-detail.json)

This data forms the baseline for future regression checks. If a solver change shifts the failure population materially from this near-zero baseline, that is a real signal.

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

**Resolution:** OQ-4 tolerance is defined on ABSOLUTE v_infinity_dep deviation, not relative C3. A target passes INV-015 validation if Aster v2's computed v_infinity_dep agrees with NHATS's min_dv_traj v_dep_earth value within **0.1 km/s** for stable-orbit targets and within **2.0 km/s** for Earth co-orbital targets. These bounds reflect the observed safe envelope across the measured NHATS-comparable subset of 5 reference targets (OQ-4) and 36 in-window co-orbital targets (OQ-7). They are calibrated to the measured maxima with margin, NOT derived from a theoretical error model. Targets exceeding these bounds warrant investigation, but the bounds themselves should be re-measured if the catalog or solver materially changes.

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

**Status: CLOSED 2026-05-27.**

**Question (original):** What is the population of catalog NEAs affected by Keplerian-propagation drift? What's the maximum drift observed across the population?

**Resolution:** Measured via co-orbital diagnostic ([tools/slice10-research/coorbital-drift.mjs](/Users/hudsonclavin/asteroid-mining-planner/tools/slice10-research/coorbital-drift.mjs)).

**Co-orbital subset definition (INV-016 Amendment):**
- e ≤ 0.1 AND inclination ≤ 5° AND |a - 1 AU| ≤ 0.05 AU

**Population:**
- Co-orbital bodies in catalog: 130 of 41,906 (0.31%)
- In NHATS with min_dv_traj record and launch inside Slice 10 Earth-ephemeris window: 36
- Not in NHATS: 5
- NHATS launch outside 2026-2040 Earth ephemeris window: 89
- Errors: 0

**Deviation distribution (absolute v_inf_dep, km/s):**
- Median: 0.0487
- Max: 1.1250
- Bodies exceeding 0.1 km/s (stable bound): 6/36
- Bodies exceeding 1.0 km/s: 1/36
- Bodies exceeding 2.0 km/s (co-orbital bound): 0/36

**Orbit-class distribution of co-orbital subset:**
- APO: 84
- ATE: 43
- AMO: 3

**Findings:**

Co-orbital drift is real but bounded across the Slice 10-comparable population. Among the 36 co-orbital bodies with NHATS records inside the 2026-2040 Earth-ephemeris window, the median departure-v_infinity deviation is only 0.0487 km/s, and only one body exceeds 1.0 km/s: 2000 SG344 at 1.1250 km/s. No measured co-orbital target exceeds the 2.0 km/s co-orbital tolerance bound established in OQ-4.

So the 2000 SG344 result from OQ-4 is a genuine long-tail outlier, but not evidence of an unbounded failure mode. The current Slice 10 architecture is adequate: Keplerian propagation plus the INV-016 honesty-layer co-orbital tag is enough for patched-conic catalog screening. N-body propagation is not required to close Slice 10, though it remains a plausible future upgrade for Slice 16+ if mission-design work wants tighter fidelity on the most accessible targets.

The 89 NHATS records outside the Earth ephemeris window are not a blocker for Slice 10 closure. They fall outside the 2026-2040 screening interval that Slice 10 actually supports, so they are unmeasured here by design rather than by tooling failure.

**Implications:**

- The 130 co-orbital NEAs are tagged for UI honesty-layer treatment per INV-016 Amendment.
- The co-orbital tolerance bound holds across the measured in-window NHATS population; Keplerian propagation + honesty tag is adequate for Slice 10 use. Sample coverage caveat: this conclusion rests on 36 in-window NHATS-comparable co-orbital bodies of the 130 total. The remaining 94 (89 with NHATS launches outside the 2026-2040 Earth ephemeris window, plus 5 not in NHATS) are uncharacterized. A future slice that extends the Earth ephemeris backward to 2020 would close the coverage gap; for Slice 10's scope this is acceptable.
- Future Slice 16+ work may still choose N-body propagation for best-in-class co-orbital targets, but this is an optimization decision, not a blocker surfaced by OQ-7.

**Engineering record:**
- Detailed per-body results: [tools/slice10-research/coorbital-drift-detail.json](/Users/hudsonclavin/asteroid-mining-planner/tools/slice10-research/coorbital-drift-detail.json)
- NHATS responses cached: `tests/fixtures/v2/oq7-nhats-coorbital/`

### OQ-8 — Multi-agent audit cycle (engineering record)

**Status: CLOSED 2026-05-29.**

**Question (retrospective):** Did the discipline patterns built into Slice 10 (verify-before-lock, surface-and-document, reference-anchored testing) catch their own failure modes when applied as an external audit?

**Resolution:** Yes, demonstrably. A multi-agent audit (three parallel subagents with independent priors: Mathematician, Adversarial Reviewer, Architect) was run against Slice 10 at HEAD ff92d16. It produced 9 deduplicated findings across HIGH/MEDIUM/LOW severity. Each finding was resolved via independent verification followed by surgical fixes.

**Audit summary:**

| Finding | Severity | Resolution | Commit |
|---|---|---|---|
| F1: Initial-guess middle-branch formula bug | HIGH | Verified vs poliastro source (Dispatch 22), fixed (Dispatch 23a), downstream re-validated (Dispatch 23b/c) | d8ace7a + 8471659 |
| F2: Cache rounding artifacts (Apophis minC3 = 0) | HIGH | Cache stores f64 precision; UI handles display rounding | 9e93ffc |
| F3: "feasible" overstates NHATS-style accessibility | HIGH | Renamed status enum: feasible → low_departure_c3, high_c3 → high_departure_c3 | 9e93ffc |
| F4: Cache lacks schemaVersion and provenance | MEDIUM | Added schemaVersion: 1 + SHA256 hashes of solver/catalog/Horizons/script | 9e93ffc |
| F5: bestWindows policy-coupled (high_c3 bodies had empty arrays) | MEDIUM | Decoupled; all converged-solve bodies now get bestWindows | 9e93ffc |
| F6: OQ-4/OQ-7 tolerance language | MEDIUM | Tolerances reframed as observed envelopes with sample-coverage caveats | (this commit) |
| F7: lambert() exposed M ≠ 0 but didn't support it | MEDIUM | Top-level guard rejects M ≠ 0 with 'multi_rev_not_supported' reason | dbf8f42 |
| F8: hyp2f1b standalone contract false near x → 1 | LOW | Documented domain narrowed to [0, 0.5], breakdown tests added at 0.99 and 0.999 | f455697 |
| F9: Phase C status text drift | LOW | Refreshed | (this commit) |

**Key verification pattern: independent reproduction before action.**

For Finding 1, the Mathematician subagent claimed 106 no-convergence cases with a corrected starter. Dispatch 22 verified this against poliastro's actual source code (fresh clone, independent Python implementation), reproduced the bug behavior on the current TypeScript solver, and identified the specific minimum failure case (T=1.302, λ=-0.98). Only after independent verification was the fix applied. This is the same discipline that caught wrong hyp2f1b reference values, MPL/GPL licensing confusion, and FP cancellation antipatterns earlier in Slice 10 development.

The audit didn't tell us we were wrong; it gave us hypotheses, which were then verified or refuted against external authoritative sources before any committed change.

**Findings that did NOT reproduce exactly:**

- F1's failure count was 106 in the audit and 18 in Dispatch 22's verification — different grid resolutions on the same parameter space. The QUALITATIVE finding reproduced (our starter fails materially more than poliastro's on the same grid); the EXACT count is grid-dependent and not a useful invariant.
- F8's relative error at x=0.99 was framed as ">1e-3" in the audit but measured as 1.58e-4 in Dispatch 27. The test threshold was calibrated to measured reality, not the audit's approximate framing.

Both cases were treated honestly in the engineering record rather than retrofitted to match the audit's numbers.

**Engineering record:**

- Audit report: /tmp/slice10-multiagent-audit-report.md (transient; reproducible via Dispatch 21's multi-agent prompt)
- Verification report: /tmp/finding-1-verification.md (transient; reproducible via Dispatch 22)
- Resolution commits: see table above

The multi-agent audit pattern is documented for reuse in future slices' close-out.

## 7. Status

**Phase A (research):** COMPLETE. Research library at src/v2/research/slice-10-lambert/ and adjacent slice folders. DECs 1-8 locked from research synthesis where evidence is clear. OQs 1-5 surfaced for pre-implementation diagnostic; OQ-7 added during Phase B as a measured residual surfaced by OQ-4.

**Phase B (pre-implementation diagnostic):** COMPLETE for Slice 10 blocking work.
- Closed OQ-3 (licensing), OQ-5 (Earth ephemeris source), OQ-4 (NHATS validation tolerance), OQ-2 (catalog-wide Lambert failure population), and OQ-7 (co-orbital drift population).
- OQ-1 remains open as a Phase C UI-surface decision, not a measurement blocker.

**Phase C (implementation):** IN PROGRESS.
- Solver integration: DONE. Clean-room TypeScript Izzo at src/v2/core/lambert/ (commits 70a97fa, 864993b, 4f5d847, bc57304, 569a6d8). Validation harness at tools/slice10-research/nhats-validation.mjs (commit 7347b88). DEC-1 Revision 2 replaced the original PyKEP/WASM path with clean-room TypeScript; see DEC-1 history above.
- Phase C.1 Lambert screening cache: DONE. Initial build-time precompute committed at ff92d16, regenerated after the initial-guess fix at 8471659, and contract-overhauled to schemaVersion 1 with full-f64 storage and provenance metadata at 9e93ffc.

**Cache regenerated 2026-05-29 (post-fix):** The screening cache was regenerated after Dispatch 23a corrected the initial-guess middle-branch formula bug surfaced by the multi-agent audit (Finding 1). Pre-fix cache committed at HEAD ff92d16; post-fix cache regenerated at HEAD d8ace7a and committed in this follow-up update. Aggregate count delta:
- low_departure_c3: 41422 -> 41422 (0 bodies)
- high_departure_c3: 483 -> 483 (0 bodies)
- lambert_unconvergeable: 0 -> 0 (unchanged)
- propagator_failed: 1 -> 1 (unchanged)
- co-orbital tagged: 130 -> 130 (unchanged)

The pre-fix cache's aggregate measurements stand as the engineering record at HEAD ff92d16; this regeneration supersedes the shipped cache artifact but produced no numerical change in body statuses, minC3 values, or best-window selections.

**Cache contract overhauled 2026-05-29 (Dispatch 24, post-fix):** The cache schema was updated to address audit Findings 2, 3, 4, and 5:
- Numeric values now stored at full f64 precision (Finding 2 resolved)
- Status enum renamed: feasible → low_departure_c3, high_c3 → high_departure_c3 (Finding 3 resolved; departure-energy semantics now explicit)
- Cache metadata includes schemaVersion: 1 and SHA256 provenance hashes for solver commit, input fixtures, and precompute script (Finding 4 resolved)
- bestWindows now stored for ALL bodies with at least one converged solve, not just those below the screening threshold (Finding 5 resolved)

Aggregate counts unchanged. The cache contract is now stable for Slice 11+ consumption.
- Phase C.2 catalog list UI integration: PENDING. This is the deferred Slice 9 list-surface work that will consume the screening cache.
- Phase C.3 per-body badges, departure-energy tag, and fidelity tag per INV-016: PENDING.
- Phase C.4 honesty-layer UI surfacing per OQ-1 resolution: PENDING.

**Phase D (verification): COMPLETE 2026-06-02.**

- Math layer audit cycle complete (OQ-8, multi-agent audit Dispatch 21, 9 deduplicated findings resolved).
- Per-body screening cache regenerated post-fix and post-overhaul (8471659, 9e93ffc); schemaVersion 1 with provenance hashes.
- Phase C.2 catalog list UI verified in browser (eeebf40): search, filter, sort, virtualized 41,906 rows, sidebar/overlay layout toggle, click-to-focus selection.
- Phase C.3 per-body screening colors verified in 3D view (e350034): green gradient for low_departure_c3, muted slate for high_departure_c3, cyan tint blend for co-orbital bodies, magenta/red for solver/propagator edge cases.
- Phase C.4 honesty disclosure footer + popover verified (d0fdec9): always-visible "Patched-conic screen · 2026–2040" footer, click-to-open popover with three plain-language sections (patched-conic scope, co-orbital drift, close-approach degeneracy).
- Async cache architecture verified (b6b7f92): 32 MB cache fetched at runtime via module-level memoized Promise; loading state surfaced; renderer recolors via setScreeningIndex() when cache resolves.
- tsc --noEmit passes cleanly across the v2 surface; legacy non-v2 sources explicitly excluded.
- npx vite build succeeds with appropriately-sized bundle (~625 KB minified JS + 33 MB static cache served async).

**Phase E (cutover + deploy): COMPLETE 2026-06-02.**

- Build output committed in 205099a.
- vite plugin added to preserve .nojekyll across builds (prevents GitHub Pages Jekyll mangling).
- Pushed to origin/main; GitHub Pages serves from docs/ on main.
- Live site: https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/
- Slice 10 publicly visible.

**Founding-doc close note:**

Slice 10 lands a complete patched-conic Earth-departure screening pipeline over the full 41,906-NEA catalog with the math layer audited end-to-end against poliastro and scipy. All eight measurement OQs are closed against measured data (OQ-1 through OQ-8). The 32 MB screening cache is served as a runtime static asset rather than bundled into JS, keeping initial page load fast (~625 KB minified bundle, ~167 KB gzipped). The UI surfaces both the visual encoding (status colors, co-orbital cyan tint) and the textual disclosure (always-visible footer + click-to-open popover with three specific limitation sections).

The single multi-agent audit run (Dispatch 21, OQ-8 record) surfaced 9 deduplicated findings; all 9 were resolved via the verify-before-lock pattern. Finding 1 (initial-guess middle-branch formula bug) was independently verified against poliastro source before the one-line fix landed, breaking the self-reinforcing test pattern that allowed the bug to ship originally. This event is the strongest single artifact of the slice's discipline.

Slice 11 (pork-chops) and Slice 12 (Δv stack) can consume the cache via the documented schemaVersion 1 contract. The cache includes per-body best-5 windows regardless of feasibility status, so downstream slices have planning seeds without re-screening. INV-016 honesty-layer requirements for co-orbital targets are surfaced in both rendering and disclosure layers.

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
