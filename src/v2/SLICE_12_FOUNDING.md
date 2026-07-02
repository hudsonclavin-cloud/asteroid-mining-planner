# Slice 12 Founding Document — DLA / Launch-Feasibility Overlay

**Status:** LOCKED 2026-07-02
**Author:** Nova (Fable 5 draft) for Hudson Clavin
**Prior slice:** Slice 11 (porkchop visualization + ΔV stack, deployed at https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/?body=asteroid-99942) + visual-fix track (top-down default, labels, halo frame fix, deployed dc44751)
**Next slice (candidates):** Slice 13 (ΔV budget stack extension — dogleg cost integration lands there)

---

## §1. Slice intent

Slice 12 adds launch feasibility to the porkchop. For every converged grid cell, compute the **Declination of the Launch Asymptote (DLA)** — the angle of the departure v∞ vector relative to Earth's equatorial plane — and classify the cell against launch-site constraints. A low-C3 window that demands a launch declination the site cannot reach directly is not a launchable window; today the porkchop cannot tell the user that. Slice 12 closes that credibility gap.

Deliverables: (a) a validated per-cell DLA value derived from the existing vInfDep vectors, (b) a per-cell feasibility classification against a parameterized launch site (Cape Canaveral initially), (c) a toggleable DLA overlay on the dedicated porkchop route, and (d) DLA + feasibility in the selected-cell readout.

Slice 12 does NOT modify the Lambert math layer, the screening cache, or the ΔV stack model. The worker message schema gains exactly one additive scalar field (`dlaDeg` per branch — see revised DEC-12-5; the vector components needed for DLA never cross the worker boundary, a fact established by the OQ-12-1 recon). Dogleg ΔV *cost integration into the stack* is explicitly deferred to Slice 13; Slice 12 classifies and advises, it does not re-price.

Slice 11's DEC-4 deferred this exact overlay to Slice 12 ("requires launch-site assumptions out of Slice 11 scope"). Those assumptions are made here.

---

## §2. Inherited invariants

INV-001 through INV-020 remain operative. Specifically load-bearing for this slice:

- **INV-016 family (honesty layer):** extended again — see INV-016d below.
- **INV-017 (one renderer, two surfaces):** the DLA overlay, where rendered, must not fork the renderer.
- **INV-018 (worker-only grid compute):** *reinforced* — DLA is computed inside the worker where the vector components live (see revised DEC-12-5); the payload gains one additive scalar per branch. The compute-on-worker principle is preserved; the message schema change is additive-only.
- **INV-019 (audited Lambert layer untouched):** DLA consumes Lambert output; it does not modify Lambert code.
- Verify-before-lock, side-file + atomic-swap, atomic commits, never-push-from-dispatch (AGENTS.md §2).

---

## §3. Architectural invariants new in Slice 12

- **INV-016d (honesty extension):** Any launch-feasibility display must disclose, in a discoverable surface, (i) the launch site assumed and its parameters, (ii) the band model used to classify feasibility, and (iii) that dogleg/plane-change costs are advisory and NOT included in the displayed ΔV stack. Same disclosure pattern as INV-016c.
- **INV-021 (frame-by-measurement):** Any quantity derived from the *components* (not magnitude) of a Lambert output vector must have its reference frame established by numerical measurement at the consuming boundary before first use — never inferred from a label or doc comment. Rationale: magnitudes are frame-invariant, so all prior validation (OQ-3, machine-precision C3 agreement) says nothing about component frames; and the 2026-07-01 halo bug demonstrated that frame-labeling errors survive multiple recons while producing plausible-looking output.

---

## §4. Open Questions (OQs)

**OQ-12-1: What frame are vInfDep's components actually in at the porkchop-worker boundary — heliocentric ecliptic J2000, or heliocentric ICRF (equatorial-aligned) J2000?**
**STATUS: CLOSED 2026-07-01.**
**Resolution:** ICRF/equatorial, measured. The frame-recon probe sampled Earth's velocity from the worker's own long-span fixture (`src/v2/data/horizons-inner-solar-system-2026-2040.json`, fixture frame hint `ICRF/J2000`, 5,479 samples) at four epochs across 2027: |vZ| reached **11.715 km/s** (2027-10-01), matching the predicted equatorial-frame seasonal amplitude of ~11.8 km/s; an ecliptic frame would show vZ ≈ 0 at every epoch. The asteroid path matches: Slice 9 elements are stored ecliptic, but `propagateKeplerianStateVectors` (`src/v2/core/propagators/keplerian.ts:146-158, 249-251`) rotates position AND velocity to canonical heliocentric ICRF before Lambert — both Lambert operands share the frame. Therefore vInfDep's Z-component is already the equatorial Z, DLA = arcsin(vZ/|v∞|) directly, and **applying the research summary's Rx(ε) rotation would have introduced up to ~23° of silent error**. The AMD-7 "heliocentric ecliptic" label is wrong for the component frame and should be corrected as a Slice 11 doc erratum in this slice's lock commit.
**Second finding from the same recon (drives DEC-12-5 revision):** the worker's `stripBranch` (`src/v2/porkchop/porkchop.worker.ts:71-77`) posts only scalar magnitudes — vInfDep *vector components never cross the worker boundary*. They exist only inside `grid-compute.ts:111-117`. DLA must therefore be computed in-worker (one line where vInfDepZ already lives) and shipped as an additive scalar payload field.

**OQ-12-2: What is the correct feasibility band model, and what are the site thresholds?**
**STATUS: CLOSED 2026-07-02.**
**Resolution:** The band model is confirmed against primary sources; the 2026-06-30 handoff / SLICE_12_PLAN inequality (|DLA| >= latitude) was inverted and is rejected. Physical basis: |DLA| equals the minimum Earth parking-orbit inclination required for injection, which the launch site's latitude bounds from below (NASA Ames Trajectory Browser User Guide, trajbrowser.arc.nasa.gov/user_guide.php). Verified bands for Cape Canaveral (latitude 28.5 deg):
- GREEN (direct, optimal): |DLA| <= 28.5 deg. Minimum-inclination direct injection; matches the DART screening gate |DLA| < 28.5 deg already cited in query-1-porkchop-conventions.md.
- AMBER (direct, penalized): 28.5 deg < |DLA| <= 57 deg. Reachable by raising parking-orbit inclination up to the azimuth-limited ceiling. Cape azimuths are range-safety-limited to 35-120 deg; Az=35 deg yields i=57 deg (NASA, history.nasa.gov/shuttleoverview1988/part1.htm). Performance penalty ~500 lb payload per degree of inclination raise between 28.5 and 57 deg (same source, shuttle-era figure, used as an order-of-magnitude advisory only).
- RED (dogleg required): |DLA| > 57 deg. Beyond the northerly azimuth ceiling. Sources span 57-59 deg for the ceiling (satobs.org Ch.9: 28.5-59; astronautix.com Cape entry: max 57.0); adopt 57 deg (NASA figure), disclosed.
Honesty caveat carried into INV-016d disclosure: the band model is a screening simplification. Daily launch-window geometry can bind tighter than the band edges - Mars Global Surveyor performed a dogleg at DLA = 36.5 deg (inside our AMBER band) because its window required the southerly azimuth side, where the ceiling is only ~39 deg (MGS Mission Plan Section 3, msss.com). The overlay classifies screening feasibility, not day-specific launch geometry.
Canonical reference for the full azimuth-vs-DLA constraint region: JPL Publication 82-43, Interplanetary Mission Design Handbook Vol I Part 2 (Sergeyevsky et al.), Fig. 13 "Permissible regions of azimuth vs asymptote declination launch space for Cape Canaveral" (ntrs.nasa.gov/api/citations/19840010158).

**OQ-12-3: What is the oracle and tolerance bar for DLA validation?**
**STATUS: CLOSED 2026-07-02.**
**Resolution:** Oracle validation extends the Slice 11 poliastro harness pattern against Apophis (`99942`) on a 25x25 grid over the standard 2026-2032 departure / 182.5-1095.75 day TOF window, using the production long-span Earth fixture (`src/v2/data/horizons-inner-solar-system-2026-2040.json`) and the same state vectors as our solver. Bar locked: max |delta DLA| <= 1e-6 deg for cells with |vInf| >= 0.1 km/s; this is tighter than the pre-lock candidate because the comparison uses identical states and frame, so only Lambert-vector and closed-form arcsin differences remain. Result (`tools/slice12-research/data/dla-oracle-validation.json`, commit `3926d54`): compared 625 cells, skipped-low-vInf 0, branch mismatches 0, max |delta DLA| = 1.7053025658242404e-13 deg, RMS = 1.6758652100217005e-14 deg. PASS.

**OQ-12-4: What visual form does the DLA overlay take?**
**STATUS: OPEN — closes during Phase C against rendered density (Slice 11 OQ-4/M=1-loci precedent).**
Candidate forms: contour lines at |DLA| = φ_site (and ± i_max if the band model locks), a hatched or desaturated mask over RED cells, or a discrete three-color tint layer. Constraint: must coexist legibly with the existing C3 heatmap + contours + M-branch encodings without turning the plot into noise. Decide against the real rendered grid, not in the abstract.

**OQ-12-5: Site model scope for this slice — Cape-only or site picker?**
**STATUS: CLOSED 2026-07-02.**
**Resolution:** Picker this slice; site constraints are implemented as parameter objects per DEC-12-3, so additional sites are data, not code. Phase D expands to include the site picker UI and initial site list.

---

## §5. Locked DECs

**DEC-12-1: DLA definition and computation point.**
- DLA = arcsin(v∞,Z_equatorial / |v∞|), in degrees for display, computed per cell from the **selectedBranch** vInfDep (consistent with Slice 11's selected-branch convention for C3).
- Cells with no converged selected branch, or |v∞| below a guard epsilon (proposed 1 m/s), carry DLA = null and are skipped by overlays — mirroring the existing "cells without a valid selected-branch C3 are skipped" contour rule.
- Justification: matches the JPL Trajectory Browser definition ("angle of v∞ to the equatorial plane," per Query 1) and DART-study usage.

**DEC-12-2 (updated per OQ-12-1 closure): Frame handling — no rotation; the decision lives in one documented function.**
- Per the measured OQ-12-1 result, vInfDep components are already heliocentric ICRF (equatorial-aligned): DLA = arcsin(vInfDepZ / |vInfDep|) with **no rotation**. The DLA computation (`dlaDegFromVInf()` or equivalent) carries a doc comment citing the OQ-12-1 probe as the reason no obliquity rotation appears — so a future reader who "knows" a rotation is needed finds the measurement before reintroducing the bug.
- Unit tests pin the convention with constructed fixtures: a vector in the equatorial plane → DLA = 0; a pure +Z vector → DLA = +90°; a known 45° case; the |v∞| < ε guard → null.
- Approximations disclosed per INV-016d: ICRF vs Earth mean equator/equinox of J2000 differ by the ~17 mas frame bias (negligible at degree-scale DLA); DLA is computed against the **J2000** equator, not equator-of-date — precession drift over the 2026–2040 window is ≤ ~0.2°, well inside the OQ-12-3 tolerance bar, and stated in the disclosure rather than corrected.
- Justification: INV-021 satisfied by measurement (probe output in OQ-12-1); centralizing the frame decision in one commented function is the direct lesson of the halo bug.

**DEC-12-3: Feasibility classification.**
- Three-state per-cell classification per the GREEN/AMBER/RED band model in OQ-12-2, parameterized by site `{latitudeDeg, iMaxDeg}`.
- Initial site: Cape Canaveral, latitudeDeg 28.5, iMaxDeg 57 (per OQ-12-2 closure; sources span 57-59, NASA figure adopted).

**DEC-12-4: Rendering surface and precedence.**
- DLA overlay ships on the **dedicated route first** (matches Slice 11 DEC-4's pattern of putting auxiliary overlays dedicated-only); the compact overlay modal gains at most the per-cell readout field, no overlay layer, to preserve its compactness. Extending the overlay modal is a later decision.
- Toggle default OFF (matches contour-overlay precedent) so the base heatmap stays unobscured.
- Legend and INV-016d disclosure ship with the toggle, not after.

**DEC-12-5 (revised pre-lock per OQ-12-1 recon): Computation locus — in-worker, one additive payload scalar.**
- The original proposal (main-thread computation from returned vectors) is **invalidated by measurement**: `stripBranch` posts only scalar magnitudes; vInfDep components never leave the worker. DEC-8's payload field `vInfDep` is the magnitude, not the vector.
- Revised: compute `dlaDeg` inside the worker at `grid-compute.ts` (~line 111-117), where `vInfDepX/Y/Z` already exist — one `Math.asin(vInfDepZ / vInfDep)` per converged branch — and add `dlaDeg` as an **additive scalar field** to the branch payload through `stripBranch`. Feasibility classification (band comparison against site parameters) stays main-thread at render/readout time, since site selection is a UI concern.
- The worker message schema change is additive-only (one optional number per branch); existing consumers are unaffected. This touches grid assembly, not `lambert()` — INV-019 (audited Lambert layer untouched) holds. Alternative rejected: shipping the 3-component vectors per branch would grow the payload ~3× more for no benefit, since DLA is the only component-derived quantity this slice needs.
- Justification: computing where the data already lives is the minimal-surface change; INV-018 (worker-only grid compute) is if anything better served.

**DEC-12-6: ΔV stack separation.**
- The displayed ΔV stack (DEC-7 / Query 3 §10 model) is NOT modified this slice. RED cells show an *advisory* dogleg-cost note (order-of-magnitude, per verified OQ-12-2 sources) clearly marked as excluded from the stack total, per INV-016d. AMBER advisory may cite the ~500 lb/deg shuttle-era gradient as order-of-magnitude context, clearly labeled as vehicle-dependent.
- Justification: pricing plane changes correctly belongs with the Slice 13 ΔV-stack extension; folding an unverified cost model into the audited stack now would trade honesty for completeness.

---

## §6. Phase breakdown

**Phase A — Formula verification (≈2 dispatches). STOP-gated.**
- ~~Frame recon~~ **DONE pre-lock** — OQ-12-1 closed 2026-07-01 by measurement (ICRF/equatorial; no rotation).
- Verify OQ-12-2's inequality/band model against sources; correct SLICE_12_PLAN.md's inverted line in the closure commit; record the AMD-7 "ecliptic" label erratum.
- Implement `dlaDegFromVInf()` (no rotation, per DEC-12-2) with unit tests: equatorial-plane vector → 0°, pure +Z → +90°, known 45° fixture, |v∞| guard → null.
- Oracle validation per OQ-12-3. STOP gate: end-to-end disagreement beyond the locked tolerance halts before any UI work.

**Phase B — In-worker computation + readout (≈1-2 dispatches).**
- Add `dlaDeg` computation at `grid-compute.ts` where components exist; extend `stripBranch` payload additively (revised DEC-12-5).
- Feasibility classification main-thread against site parameters.
- Selected-cell readout gains: DLA (deg), feasibility class, advisory dogleg note on RED.

**Phase C — Overlay rendering (≈2-3 dispatches).**
- Implement the OQ-12-4 form decided against the live grid; toggle, legend, INV-016d disclosure.
- Hudson visual gate before commit (UI STOP-gate rule, AGENTS.md §2).

**Phase D — Site parameterization (≈1 dispatch, may fold into C).**
- Site object per DEC-12-3/OQ-12-5 resolution; Cape values wired as default; picker UI and initial site list included per Hudson lock decision.

**Phase E — Audit + deploy (≈2 dispatches).**
- Multi-agent audit on the Phase A functions (mathematician re-derives the rotation + arcsin from the frame definitions; adversarial hunts edge cases: |v∞|→0, polar asymptotes DLA→±90°, branch-selection interaction, sign conventions at the equinoxes; architect confirms the single-pure-function containment). Cheap because the surface is small; run the full pattern anyway — it is the discipline, and frame math is exactly where it has paid off.
- Batched build + deploy + live verification.

---

## §7. Out of scope (Slice 12)

- Dogleg ΔV integrated into the stack total (Slice 13).
- RLA (right ascension of launch asymptote) overlay — cheap to add to the readout later; deliberately excluded to keep this slice's validation surface minimal.
- Arrival-side declination (DAP) and arrival-geometry constraints.
- Launch-vehicle performance curves (payload vs C3) — Slice 13 territory per the candidate roadmap.
- Launch-site catalog breadth beyond the initial picker list.
- Daily launch-window geometry (RLA-vs-GST timing, two-window structure) — mission-ops depth beyond a screening tool this slice.

---

## §8. Engineering record (running log)

- **2026-06-30:** Pre-research committed — `8081c0b` docs(slice12): DLA research summary (deferred from Slice 11 per DEC-4). Query 1 (`query-1-porkchop-conventions.md`) already carried the DART DLA convention from Slice 11 pre-research.
- **2026-07-01:** Founding doc drafted by Nova (Fable 5) — DRAFT status, pending Hudson review/lock. **Two verify-before-lock catches recorded at drafting time:** (1) the feasibility inequality in the 2026-06-30 handoff and SLICE_12_PLAN.md is inverted relative to the committed Query 1 pre-research (Query 1/DART: |DLA| < site latitude is the feasible side); OQ-12-2 verifies and the plan doc gets corrected at closure. (2) The "one Rx(ε) rotation" premise assumes vInfDep is ecliptic-frame; the 2026-07-01 render-pipeline recon proved ingestion rotates to ICRF, so the porkchop-worker frame must be measured (OQ-12-1) before DEC-12-2's function body can be written — magnitude-level poliastro validation (OQ-3) cannot settle component frames.
- **2026-07-01 (later):** OQ-12-1 CLOSED by read-only frame recon + numerical probe, pre-lock. Verdict: ICRF/equatorial (max Earth |vZ| = 11.715 km/s from the worker's own fixture; ecliptic frame would show ~0). Two draft revisions recorded: DEC-12-2 becomes a no-rotation function with the measurement cited in-code; DEC-12-5 revised from main-thread to in-worker computation after the recon showed `stripBranch` discards vector components at the worker boundary. AMD-7 "heliocentric ecliptic" label flagged as a Slice 11 erratum to correct at lock.
- **2026-07-02:** OQ-12-2 CLOSED by primary-source verification (NASA Trajectory Browser guide, NASA shuttle reference for Cape azimuth/inclination limits, MGS Mission Plan dogleg example, JPL Pub 82-43 Fig. 13). Handoff's inverted inequality rejected; three-band model GREEN/AMBER/RED locked into DEC-12-3 with Cape {28.5, 57}. Measurement/source OQs blocking lock are now closed; OQ-12-4 (overlay form) remains open by design for Phase C, and OQ-12-5 remained pending Hudson's lock call.
- **2026-07-02: FOUNDING DOC LOCKED.** Six DECs locked (DEC-12-5 as revised pre-lock). OQ-12-1, OQ-12-2 closed pre-lock by measurement/sources; OQ-12-5 closed at lock (Hudson's call); OQ-12-3 closes in Phase A, OQ-12-4 in Phase C. AMD-7 erratum recorded in SLICE_11_FOUNDING.md. Phase A implementation dispatches may now be written against this contract.
- **2026-07-02:** OQ-12-3 CLOSED by DLA oracle validation against poliastro (`3926d54`). Apophis 25x25 grid, compared 625 cells; max |delta DLA| = 1.7053025658242404e-13 deg, RMS = 1.6758652100217005e-14 deg, branch mismatches 0, skipped-low-vInf 0. Data: `tools/slice12-research/data/dla-oracle-validation.json`.
- *(Lock entry, remaining phase completions, and OQ closures to be appended.)*
