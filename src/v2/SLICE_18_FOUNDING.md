# Slice 18 Founding Document — Screening Fidelity

# STATUS: LOCKED (2026-09-02). ADDITIVE-ONLY from this commit forward: never delete or reword a DEC, an invariant, an OQ, or a history line. Corrections and amendments are appended, marked, and dated.

Seated 2026-08-24. Drafted 2026-09-02 by Nova, retroactively: the slice ran dispatch-first and its decisions were recorded in STATUS, which is the living file and is rewritten each session. Locked decisions do not belong there. This document is the permanent record.

Where this document and STATUS disagree, this document governs for decisions; STATUS governs for current state.

**Verification note (Claude Code, 2026-09-09).** Every factual claim below was checked against the repo and the committed evidence before this document was created, not against the prose reports the draft was written from. Corrections made during that pass are marked inline as `[CORRECTED]` with the old value and the source; claims that could not be verified against a repo artifact are marked `[UNVERIFIED-IN-REPO]`. Section conventions follow the other `SLICE_*_FOUNDING.md` files; the deviations are recorded in §8.

---

## §1. PURPOSE

Aster publishes C3 and ΔV numbers screened across 2026–2040 using pure two-body Keplerian propagation from a single element epoch, and had never measured how wrong that is. This slice measures the product's own arithmetic against JPL-integrated truth, and then says what it found on the surface.

It is the honesty layer turned inward. Previous slices disclosed what the data assumes; this one discloses what the computation costs.

---

## §2. WHY THIS SLICE DISPLACED MISSION VIEW

Mission View (animated transfer arc with an uncertainty envelope) was the standing recommendation at seating. Its stated rationale was that the envelope IS the honesty.

Measurement removed the envelope. The along-track phase sensitivity derived from the catalog's σ_a is ~1.3 km at a 10-year horizon; the measured two-body model drift is **4.6e5–3.3e8 km** for real near-Earth asteroids (15 of 17 sampled bodies at or above 10⁶ km). A ribbon drawn from element sigmas would have been **between five and eight orders of magnitude** narrower than the error containing it — a false precision claim wearing an honesty costume, which is the exact failure this product exists to prevent.

`[CORRECTED]` The draft read "10⁶–10⁸ km" and "six to eight orders of magnitude". The measured NEA-band range in `tools/slice18-research/nea-drift-results.json` runs from 2010 KD at 4.6e5 km to 99942 at 3.3e8 km — two of seventeen bodies sit below 10⁶ — and the span against 1.3 km is 5.6 to 8.4 orders. The argument is unaffected; the floor was overstated.

`[UNVERIFIED-IN-REPO]` The ~1.3 km σ_a figure is *derived*, not measured in this arc: σ_a = 1.5722e-10 AU for 433 Eros from the committed catalog, a = 218,150,587.7 km, n = 1.1306e-7 rad/s, via the standard along-track relation 1.5·n·δa·t, independently re-derived at 1.259 km. No committed results artifact produces it.

See DEC-18-2 and DEC-18-4.

---

## §3. INVARIANTS RELIED ON

- **INV-016** (`src/v2/SLICE_10_FOUNDING.md`) — "Patched-conic honesty layer: every C3/ΔV carries a fidelity tag." Front C's disclosure is an instance of this, not a new invariant.
- **INV-024** (`src/v2/SLICE_14_FOUNDING.md`) — "Anti-porting: the physics / orbital-mechanics layer is re-derived in-repo; external astrodynamics libraries (poliastro, adam_core, or successors) serve as validation oracles only — never imported, ported, or transcribed." All physics in this slice is re-derived in-repo; poliastro appears only as an oracle.
- **INV-026** (`src/v2/SLICE_14_FOUNDING.md`) — "Trust-surface provenance: every numeric claim on a public validation/trust surface renders from a single committed provenance artifact (JSON), never from literals in component code." Every threshold and count in Front C is subject to this.
- **INV-033** (`src/v2/SLICE_15_FOUNDING.md`) — "Anti-fabrication: no SourceRef path, commit, count, or URL enters any envelope, fixture, or provenance artifact unless confirmed to exist and match."
- **INV-034** (`src/v2/SLICE_9_FOUNDING.md` amendment) — "Evidence-artifact tracking: any file claimed as committed evidence by a founding doc, INVARIANTS.md, or a test must be git-tracked; ignored evidence directories require explicit `!` exceptions and `git check-ignore -v <path>` must return nothing."

`[CORRECTED]` The draft characterised INV-033/034 jointly as "provenance verified by a different check than the one that produced it". That is the **verification discipline this slice practised**, not what the invariants say — INV-033 is anti-fabrication and INV-034 is evidence-artifact tracking, quoted verbatim above. The discipline itself is real and was applied throughout, including to agents' verification of their own output; it is recorded here as practice rather than misattributed to an invariant.

INV-034 is load-bearing for this document: §6's evidence claims are why the math-layer audit artifacts were landed in the same commit that created this file.

---

## §4. DECISIONS

### DEC-18-1 — Endpoint states are recomputed, never retained. LOCKED.

The screening layer's endpoint states (r1, v1, r2, v2) are discarded: the live worker strips v1/v2 and `lambert-screen-cache.json` holds only derived scalars. They are deterministically recomputable from stored inputs, and this was demonstrated — the cached Eros cell (minC3 1.6244339770173506, 2032-06-10, TOF 272 d) was recomputed from stored inputs to 4.101e-16 relative on C3, 1.742e-16 on vInfDep, exact on vInfArr. Five bodies' full-grid argmins matched cached minC3 below 1e-9 relative.

Retention would duplicate a derivable number and invite drift. Recomputation makes drift structurally impossible rather than merely tested against.

*Verified: `4.100713382012564e-16` and `1.742164633264959e-16` appear in `tools/slice18-research/c3-drift-sensitivity-results.json` and `multirev-consistency-results.json`.*

### DEC-18-2 — No quantitative uncertainty geometry ships in Slice 18. LOCKED.

An uncertainty envelope derived from the catalog's element sigmas is REJECTED as indefensible. σ_a phase sensitivity ~1.3 km at 10 years against measured drift of 4.6e5–3.3e8 km. `[CORRECTED]` — same floor correction as §2.

Condition code renders as its raw MPC category and is NEVER converted to kilometres — it is an ordinal longitude-runoff band, not a Cartesian uncertainty. Superseded only by a real state covariance plus perturbed propagation, neither of which the repo has.

### DEC-18-3 — Disclosure is per-object and measured, or qualitative. LOCKED.

Two-body drift depends on the anchor epoch, not on elapsed time alone: up to ~12× difference for identical elapsed time on planets (Venus at 5 y: 47,680 km first-forward vs 4,057 km mid-backward, 11.8×), and forward propagation differs from backward. No global "±X km at N years" claim is defensible.

**Annotation (2026-09-02): the disclosure unit is a DATE, not a distance.** Measurement established that screening is honest for arrivals before a body's first materially perturbing encounter and degrades sharply after it — Apophis's drift growth rate goes ~44k km/yr to ~226M km/yr across its 2029 encounter, ~5,200×. This refines the unit; it does not reverse the ruling.

*Verified: 44k → 225.6M km/yr, ratio 5,181×, from the yearly array in `nea-drift-results.json`.*

### DEC-18-4 — Mission View is DEFERRED, not cancelled. LOCKED.

Re-enters as a later slice once Front C establishes what an arc would be drawn on top of. Recorded so the deferral is legible rather than reading as drift.

Retrospective note: animating a post-2029 Apophis arrival would have rendered a trajectory to a position that does not exist. The deferral was correct for a reason not available at the time it was made.

### DEC-18-5 — Non-existent objects are RENDERED and FLAGGED, never suppressed. LOCKED 2026-09-02.

Ten catalog entries do not exist: **nine** near-Earth objects whose Horizons ephemerides terminate at a verified Earth impact (2018 LA, 2019 MO, 2022 EB5, 2022 WJ1, 2023 CX1, 2024 BX1, 2024 RW1, 2024 UQ, 2024 XA1), plus 3D/Biela, which disintegrated in the 1840s–50s and is 253M km wrong on the screening window's first day. Aster currently computes 2026–2040 transfer windows to all ten.

They are rendered with an explicit flag, not removed.

Reasoning: suppression hides a fact the user should have and silently changes the catalog count (41,906), which appears on screen and throughout the committed record. A destroyed object is also *informative* — "this catalog contains ten objects that no longer exist, and here they are" demonstrates the honesty layer more effectively than any disclaimer.

The set is provably bounded: `anchorSource: stale-unanchored` on an NEA-class body is already a non-existence signal, because re-anchoring requires a Horizons state at the 2026-05-01 epoch that a destroyed object cannot supply. Any object destroyed before that epoch could not have re-anchored, so nine is the complete NEA-class set. [Likely] — the mechanism is inferred from a perfect correlation plus pipeline design; the ingestion path has not been traced.

*Verified: the nine terminations and their timestamps are recorded per body in `tests/fixtures/v2/nea-drift-truth-2026-2046.json` under `findings.S_nonExistentCatalogBodies`, with `allTerminate: true`, H range 29.12–33.58, and `countVerified: 9`. 3D's 253.34M km first-day error is in `nea-drift-results.json`.*

`[UNVERIFIED-IN-REPO]` 3D/Biela's **disintegration** is historical fact carried from outside the repo; it is not established by the ephemeris-termination method that verifies the other nine. Horizons still integrates its 1832 orbit. The 253M km figure is verified; the reason for it is not.

OPEN, not decided here: whether flagged objects remain eligible for ranking surfaces (minC3 sort, best-window lists). See **OQ-18-1**. `[CORRECTED]` — the draft cross-referenced OQ-18-5, which is the GM_SUN item; the ranking question is OQ-18-1.

### DEC-18-6 — The materiality threshold is 10⁶ km, and the instrument is computed δv. LOCKED 2026-09-02.

A body's screening is treated as materially degraded when its predicted drift exceeds **10⁶ km** — the regime where the C3-sensitivity measurement found argmins actually move (3 of 15 at 10⁶; 0 of 15 at 10⁵).

10⁵ km is rejected as a threshold: it marks 36.9% of the catalog for an effect nothing has been measured to move. Unearned caution is its own dishonesty.

The instrument is **computed δv, not distance.** δv = 2·v·sin(θ/2) with tan(θ/2) = μ/(d·v²), derived in-repo from CAD's `dist` and `v_rel` and the perturber's GM. Distance alone is the wrong instrument: it ignores time remaining, and a modest kick early in a 19-year window carries the whole way. Using distance produced a scope estimate of 6.3%; using δv × time-remaining gives 24.3%.

**Stated property of the instrument, and a regression criterion:** against the 17 measured bodies it agrees on 7, under-predicts 10, and over-predicts 0. It never calls a body material that measurement says is not. This one-sidedness is a design property, not a statistic. Any future change that permits over-prediction is a regression.

The threshold's provenance renders alongside the threshold wherever it is shown, per INV-026.

*Verified: 0 of 15 at 10⁵ and 3 of 15 at 10⁶ from `c3-drift-sensitivity-results.json`; the 7/10/0 split from `dv-scope-results.json`; 6.3% and 24.3% follow from 2,644 and 10,152 over 41,906.*

### DEC-18-7 — Unsupported cells are de-emphasized with a boundary marker, NEVER suppressed. LOCKED 2026-09-02.

Porkchop cells whose arrival epoch falls after a body's materially perturbing encounter are rendered de-emphasized, with a visible boundary at the transition. They are not hidden, and they are not rendered identically to supported cells.

Reasoning, on the record: suppressing them would recreate the exact defect Front A corrected. The M=1-only grid rendered "no solution" where the truth was "not assessed" — five of thirteen sampled bodies showed an entirely empty porkchop while the catalog badged them with a finite C3. *No opportunity* and *not assessed* are different claims and this product must never conflate them again.

*Verified: exactly 5 of the 13 sampled bodies have an entirely empty M=1 grid — 2017 UR52, 12P, 2025 VP, 2022 BG4, 2014 PP69 — from `multirev-consistency-results.json`. Note one of the five (12P) is a comet; the claim holds for "sampled bodies" and would not hold if worded "NEA-class bodies".*

### DEC-18-8 — Unbounded-error disclosure uses the blunt form. LOCKED 2026-09-02.

Where Aster cannot bound a body's screening error, it says so plainly. "Screening-grade estimate" and equivalent hedges are rejected: they satisfy a lawyer and inform nobody, and they are indistinguishable from the boilerplate every comparable tool ships — which wastes the one property that differentiates this one.

Presentation constraint: the disclosure must read as *screening-grade, error unbounded* — still the best available first cut, honestly labelled — and not as *this tool does not work*. A disclosure that destroys confidence in a correct screening defeats itself.

### DEC-18-9 — The unbounded population distinguishes its two sub-populations. LOCKED 2026-09-02.

"We know why we cannot bound this" (**689** bodies: 482 Jupiter-crossing, 207 comets — structurally beyond the available data) and "we have not measured this" (31,055 bodies) are different epistemic states and render differently.

`[CORRECTED]` The draft read "690 bodies: 482 Jupiter-crossing, 207 comets, 1 hyperbolic". The hyperbolic body (2015 D1, e = 1.0035, which `propagateKeplerianStateVectors` rejects outright) belongs to **L0 — cannot propagate**, not to L2. Counting it here double-counted it: 690 + 31,055 = 31,745, one more than L2's 31,744. The structurally-blind sub-population of L2 is 482 + 207 = **689**, and 689 + 31,055 = 31,744 exactly. The figure 690 remains correct as a whole-catalog count of comet + Jupiter-crossing + hyperbolic, but is not a component of L2. This error originated in the prior session's report and was inherited by the draft.

The difference is actionable: the second population can be promoted out by measurement; the first cannot without a data source Aster does not have. Collapsing them would hide the path forward.

Measured data-source bound, established by probing responses rather than documentation: CAD stores non-Earth approaches only to 0.15 AU (Venus), 0.10 (Mercury), 0.25 (Mars), 0.28 (Jupiter); Saturn returns nothing in-window. Jupiter-crossing bodies are identified from the catalog's own a and e (Q ≥ 4.95 AU), requiring no external data.

### DEC-18-10 — Two fidelity tiers ship; no bounded tier without measurement. LOCKED 2026-09-02.

Front C ships:
- **L0** — does not exist / cannot propagate. **10 bodies (0.024%)** = the 9 verified-destroyed NEA-class objects + 1 hyperbolic body.
- **L1** — degraded from a known date. **10,152 bodies (24.23%)**.
- **L2** — cannot bound. **31,744 bodies (75.75%)** = 689 structurally blind (482 Jupiter-crossing + 207 comets) + 31,055 unmeasured, sub-divided per DEC-18-9.

The three tiers sum to 41,906 exactly.

**Reconciling DEC-18-6 with L1.** DEC-18-6's δv criterion places **10,173** bodies at or above 10⁶ km (24.3% of the catalog). L1 above is **10,152** (24.23%). The 21-body difference is tier precedence, not a disagreement: a body that is both materially degraded *and* non-existent, hyperbolic, a comet, or Jupiter-crossing is counted once, in the stronger tier. The two numbers answer different questions — "how many bodies does the instrument flag" (10,173) versus "how many bodies does L1 render" (10,152).

There is no "bounded / trustworthy throughout" tier, because the evidence cannot support one. Only 2 of 17 measured bodies stayed under 10⁶ km, and no variable separates them from the 5 that did not: 2010 KD (e=0.2176, a=1.354, Q=1.649) drifted 0.46M km while 2024 BB8 (e=0.2173, a=1.409, Q=1.715) drifted 5.71M km — near-identical orbits, 12× apart, on opposite sides of the threshold. A bounded tier would rest on n=2.

A bounded tier requires measurement, not inference. Recorded scoping: at 30-day cadence — sufficient for a threshold verdict, which is all the tier needs, as distinct from the shape characterisation Front B required at 7-day — a 500-body stratified sample is ~14.5 MB and one Horizons request per body. The raw series is evidence; only the per-body verdict and date need reach the browser.

The tiering is designed so bodies can be PROMOTED out of L2 as evidence arrives, without a schema change.

**Noted inconsistency, not resolved here.** DEC-18-5 names **ten** non-existent objects; L0 above contains **ten** bodies — but they are not the same ten. L0 = 9 impactors + 1 hyperbolic; DEC-18-5's ten = 9 impactors + 3D/Biela. 3D is classified into L2's comet sub-population by orbit class (JFC), so the tenth non-existent object is currently tiered as "cannot bound" rather than "does not exist". The matching counts are a coincidence. See **OQ-18-6**.

*Verified: tier counts recomputed by two independent code paths, both giving nonExistent 9, hyperbolic 1, comet 207, jupiterCrossing 482, material 10,152, quiet 31,055, summing to 41,906. The 500-body figure re-derived from the fixture: 129,790 B/body at 1,044 records (7-day) → 244 records at 30-day → ~14.5 MB for 500 bodies.*

---

## §5. OPEN QUESTIONS

- **OQ-18-1** — Do flagged non-existent objects remain eligible for ranking surfaces (minC3 sort, best-window lists)? DEC-18-5 renders them; whether they compete for "best" is undecided.
- **OQ-18-2** — Does the δv instrument's under-prediction concentrate in an identifiable population? 5 of its 10 misses are Jupiter-crossing (covered by DEC-18-9); the other 5 drift secularly with no encounter at all, and are unexplained.
- **OQ-18-3** — Is the [Likely] on DEC-18-5's boundedness claim upgradable by tracing the re-anchor ingestion path?
- **OQ-18-4** — Do F1/F2 (izzo negative-TOF garbage; izzo's failure taxonomy mislabelling invalid input as no_convergence) warrant a hardening fix? Both are LOW and unreachable on every shipped path. Recorded for bundling with the next math-layer change so one audit cycle covers both.
- **OQ-18-5** — Does the GM_SUN comment mislabel ("IAU 2015 nominal" on a DE430 value) get a docs-only correction? Value is fine; label is wrong.
- **OQ-18-6** *(added 2026-09-09 during verification)* — Should 3D/Biela be tiered as L0 "does not exist" rather than L2 "cannot bound"? It is classified by orbit class today. Resolving this also settles whether DEC-18-5's "ten" and L0's "ten" should be reconciled or left as distinct sets.

---

## §6. EVIDENCE

All committed under `tools/slice18-research/`. The measurement artifacts landed at `d663e9c`; the math-layer audit artifacts landed in the same commit as this document, so that every claim below has a git-tracked source as INV-034 requires.

- Two-body drift vs Horizons, planets, 2026–2046.
- C3 sensitivity to endpoint perturbation.
- Multirev cache/live consistency.
- NEA drift measurement, 20 bodies, against `tests/fixtures/v2/nea-drift-truth-2026-2046.json` (`0d927e4`).
- Math-layer audit: conservation to 7.1e-14 (energy) and 3.7e-15 (angular momentum) across 2026–2046; cross-solver bit-identity over 1,296 geometries; BVP three-path residual 9 mm mean; oracle immutability proof over the solvers' transitive import closure.
- Front C scope and tier sizing: δv scope over the CAD 0.3 AU pull, and the catalog-wide aphelion/tier computation.

---

## §7. FRONT STATUS

- **Front A — solver/revolution consistency.** CLOSED 2026-09-02. Commits `765f8fd`, `bda0ee2`, `a7670c4` (DEC-5 implementation), `c0a8b9b`, `67c4c18` (grid extremes). Annotated in `SLICE_11_FOUNDING.md` at `a3a900e`.
- **Front B — NEA drift measurement.** COMPLETE 2026-09-02.
- **Front C — fidelity disclosure.** Designed, unimplemented. L0 is independently shippable.

*Verified: all eight commit SHAs exist and their subjects match the roles described.*

---

## §8. ENGINEERING RECORD (running log; additive)

**2026-09-09 — Document created and verified.** Written from Nova's 2026-09-02 draft. Structural deviations from the other `SLICE_*_FOUNDING.md` files, recorded deliberately: those documents are forward-looking slice plans and carry §6 Phase breakdown / §7 Out of scope; this one is retroactive, written after the slice executed, so §6 is Evidence and §7 is Front status. §8 follows the repo convention as the additive running log, and is where future amendments belong. Location follows the dominant convention — 12 of 13 slice founding documents live under `src/v2/`, and Slice 18 amends Slice 11, whose document is here.

Corrections applied to the draft during verification, each with its source: the L2 sub-population count 690 → 689 (hyperbolic body double-counted; `tier-sizing-results.json`); the INV-033/034 characterisation (verbatim text from `INVARIANTS.md`); DEC-18-5's cross-reference OQ-18-5 → OQ-18-1; the measured drift floor 10⁶ → 4.6e5 km and the resulting "six to eight" → "five to eight" orders of magnitude (`nea-drift-results.json`). Two claims marked `[UNVERIFIED-IN-REPO]`: the derived ~1.3 km σ_a sensitivity, and 3D/Biela's disintegration. One inconsistency recorded rather than silently resolved: DEC-18-5's ten and L0's ten are different sets (OQ-18-6).

Everything else in the draft verified clean against committed evidence: all eight SHAs, the Eros reproduction tolerances, the band counts, the Apophis growth rates, the argmin movers, the 2010 KD / 2024 BB8 counterexample, the scope percentages, the Q distribution, the tier arithmetic, the audit figures, the CAD caps, and the 500-body scoping.

**2026-09-21 — SLICE 18 CLOSED. Close-out run record.** Dates in this entry are git dates (`git log --date=iso-strict`); the run's eight code commits carry author dates 2026-09-21T00:10 through 01:08 (−04:00). Executed as an autonomous run on branch `claude/s18-close-out` from `81252f2` (tag `pre-s18-close-run` and branch `backup/pre-s18-close-run` both at `81252f2`, untouched). Nothing was pushed; `main` was not committed to.

**§3 override, recorded.** For this run only, Hudson's close-out dispatch overrode `AGENTS.md §3`: Claude Code (Fable 5.1) wrote TypeScript implementation code, ran `npm run build`, and ran the test suite — work §3 assigns to Codex. The override expires with the run; §3 itself is unchanged. The independent second-agent audit was replaced by self-verification: every change verified by a method different from the one that produced it, recorded per item below.

**SHIPPED — every commit, in order, each verified before the next began:**

- `d8c4681` — Item 1, hyperbolic propagation guard. `src/v2/porkchop/propagation-guard.ts` mirrors the propagator precondition (`keplerian.ts`: every element finite, aM > 0, 0 ≤ e < 1) as a value-returning predicate; `computeCompareData` refuses a non-propagatable body in place (`not-propagatable`, row never omitted) and `PorkchopView` refuses before compute on both the modal and the dedicated route, rendering the verbatim sentence and making the grid-extremes readout terminal. *Verified:* the guard was checked against the propagator itself over all 41,906 catalog bodies — "propagator threw RangeError" ⇔ "guard refused", exactly one refusal, 2015 D1 (e = 1.0035); sha256 of the full-size compare (731×100) and view (200×100, M=0 and M=1) outputs for 433 and 2018 LA byte-identical before and after, while 2015 D1's compare path went from a RangeError to a refusal value.
- `a9ed4f0` — Item 2, identifier consistency. `src/v2/boundary/resolve-catalog-body.ts` holds the `22d4fa7` rule once (canonical `bodyId`, then bare designation); the compare and porkchop pages both call it. *Verified:* designations are unique across all 41,906 bodies and every key equals `asteroid-<designation>`, so the fallback cannot be ambiguous; both forms resolve to the same body object.
- `c4da66f` — Item 3, the 2018 LA badge (ruled). L0 rows suppress the LOW C3 / HIGH C3 quality badge only; `prop fail` and `unconv.` stay; the numeric C3 stays, de-emphasised, with the visible context "computed from the last known orbit"; a null C3 still renders "—"; non-L0 rows are byte-identical. *Verified:* the full {L0, L1, L2} × {four statuses} matrix pins the rule to exactly {L0} × {low, high}, on rows built from the committed screen cache and tier artifact.
- `cba6e6a` — Item 4, the Jupiter-crossing field defect. `tier-sizing.mjs` compared `r.tier` (an L0/L1/L2 label) with the classification name, so `jupiterCrossingAlsoHasMaterialCadEncounter` was always 0; fixed to `r.classification`, value **9**, confirmed by counting records with `classification === 'jupiterCrossing' && material`. The script now reads only committed inputs and writes `tools/slice18-research/tier-sizing-results.json` beside itself. *Verified:* populations recounted from the regenerated records — **L0 = 11, L1 = 10,150, L2 = 31,745, structurallyBlindL2 = 688, total = 41,906**; all 41,906 per-body records byte-identical to the previous artifact (only `generatedAtUtc` moved).
- `5926b16` — Item 5, full disclosure strings (DEC-18-8). `src/v2/porkchop/tier-disclosure.ts` carries the six sentences verbatim from the dispatch, filled only from the committed artifact, which now records the values: `terminationTdb` for the nine impactors (from `tests/fixtures/v2/nea-drift-truth-2026-2046.json`, `0d927e4`), `firstDayDriftKm` for 3D/Biela (253,342,299.89 km, from `nea-drift-results.json`), and for every L1 body the CAD encounter `{jd, cd, body, dvKmS}` that makes its tier material. Surfaces: catalog badge tooltip = the full sentence (never the slug); compare fidelity cell = short label with the sentence on hover; porkchop page = the sentence as visible text under the title, with L1 adding the criterion and — because it names 10⁶ km — the verbatim threshold provenance; a four-line legend (L0 / L1 / L2 / PROP FAIL) above the catalog footer. *Verified:* all 41,906 bodies yield a sentence (no value was missing, so nothing was omitted); all 10,150 L1 encounters equal `dv-scope-per-body.json` — a different script — with zero mismatches; every pre-existing artifact field byte-identical; populations unchanged.
- `cecbc5b` — Item 6, W4/W5 per-cell L1 boundary (DEC-18-7). No new data was needed: arrival = depJD + tofDays against `encounter.jd`. On the dedicated page, L1 bodies get a 55 % dark wash on cells arriving at or after the encounter (opacity only — colour stays C3; nothing suppressed), a dashed arrival-equals-encounter curve, a caption, the verbatim sentence on hover and pinned readouts, and an extremes readout that says when an extreme falls in the unsupported region. *Verified:* the 99942 partition over the page's 200×100 grid matches a per-column formulation (monotone within a column; departures after the encounter unsupported at every TOF); exactly the 10,150 L1 records yield a boundary; compute paths untouched (hash probe identical).
- `34b707c` — Item 7, overlay M=1 divergence (DEC-5 overlay ruling). The modal now shows M=0 by default with a small toggle that adds the M=1 family as a dashed contour layer, reusing Front A's `computeDualFamilyGrids`; the dedicated view's paths are untouched by construction (opt-in prop). *Verified:* tsc, suite, hash probe; the Preact view itself is not unit-testable and is on the browser checklist in STATUS.
- `4d3bae2` — Item 8, `docs/` rebuilt. Entry bundles `porkchopV2-DPwWKoPv.js`, `solarSystemV2-BM6ai_je.js`, `compareV2-Br2FOkFz.js` (previously `porkchopV2-Ci6r-fmN.js`, `solarSystemV2-DFJ0f0Yh.js`, `compareV2-CEg78aFw.js`). *Verified:* every asset reference in `docs/` (45) resolves to a present file and no file names an old bundle; `docs/_staging_v1/` byte-identical to HEAD by blob id.

**VERIFIED across the run.** `npx tsc --noEmit` clean and the full suite green after every commit: baseline 76 files / 278 tests / 0 failures at `81252f2`, final 81 files / 303 tests / 0 failures at `4d3bae2` (five new test files, 25 new tests, all additive). `row.ts`'s hyperbolic focus guard (`22d4fa7`) untouched. Cross-tier arithmetic held at every regeneration: 11 + 10,150 + 31,745 = 41,906; 206 + 482 = 688; 206 + 482 + 1 = 689 (`cannotBoundTotal`, a whole-catalog count, not an L2 component — C-1).

**CUT: nothing.** All nine items shipped, including the two "attempt" items (6 and 7). Slice 17's precedent governs how a cut would have been recorded — `SLICE_17_FOUNDING.md` §8, "2026-08-13 · CUT — Front B tiers B3-B5 descoped", under its §5 CUT RULE ("Any cut is a §8 history entry, not a silent omission") — and this entry is where it would have appeared. Two things were deliberately NOT done and are carried, not hidden: the ~10.5 MB tier artifact is still fetched eagerly on the solar-system page (and now by the dedicated porkchop page) — Item 5 did not make a lazy load natural because every catalog row's badge needs it; and OQ-18-5's one-line comment fix lives under the protected `src/v2/core/` path and needs its own dispatch.

**CORRECTIONS FOUND DURING THIS RUN (recorded here; §9 is not reworded):**

- C-4 and C-5 cite `tools/slice18-research/tier-sizing-results.json` as the stale artifact. That path had never been git-tracked — the file existed only in the local audit directory. It is committed for the first time at `cba6e6a`, regenerated: `cannotBoundTotal: 689`, `jupiterCrossingAlsoHasMaterialCadEncounter: 9`, tier counts quiet 31,057 / material 10,150 / jupiterCrossing 482 / nonExistent 10 / comet 206 / hyperbolic 1.
- The deploy premise that `docs/_staging_v1/` has "no producer" is wrong: `textures/_staging_v1/` is git-tracked and Vite's `publicDir` copies it into `docs/` on every build, so `emptyOutDir` deletes and the same build restores the four files. The `git checkout` safety net was a no-op; byte-identity holds either way.
- 26 of the 206 structurally-blind comets have Q < 4.95 AU (all JFC; Q from 1.948 AU). For them the verbatim DEC-18-9 sentence names an aphelion inside Jupiter's orbit. The sentence stays true — the close-approach data does not cover beyond 0.28 AU from Jupiter — but its implication is weaker for those 26. Shipped verbatim as ruled; flagged for a wording ruling.
- §7 above reads "Front C — Designed, unimplemented." Superseded, not reworded: Front C is CLOSED 2026-09-21 — W1–W3 at `22d4fa7` (per STATUS), disclosure strings at `5926b16`, W4/W5 at `cecbc5b`.

**OQ DISPOSITIONS (every open OQ-18-N):**

- **OQ-18-1** — DEFERRED, ruling required. This run removed the quality badge from L0 rows (`c4da66f`) but did not change sort or ranking: flagged non-existent objects still compete for "best". Destination: Slice 21's QOL backlog (`strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`, the carry-forward destination Slice 17 established); the backlog file was not edited in this docs-only run — the carry is recorded here and in STATUS.
- **OQ-18-2** — DEFERRED. No new measurement was taken in this run; the five secular-drift misses remain unexplained. No destination slice exists for a further measurement; carried in STATUS open items for Hudson to assign.
- **OQ-18-3** — DEFERRED. The re-anchor ingestion path was not traced in this run; the `[Likely]` stands. Carried with OQ-18-2.
- **OQ-18-4** — DEFERRED, bundled with the next math-layer change per its own text (F1/F2 are LOW and unreachable on every shipped path; `src/v2/core/` is protected). Carried in STATUS's Cleanup Queue.
- **OQ-18-5** — DEFERRED. A docs-only comment correction on a protected path (`src/v2/core/`); needs `ASTER_PROTECTED_OK` and a Hudson dispatch. Carried in STATUS's Cleanup Queue.
- **OQ-18-6** — RESOLVED 2026-09-09 (C-2); implemented at `355fa5f` / `81252f2` and carried through every regeneration in this run (3D/Biela is L0, `historically-destroyed-disintegration`).

**Slice 18 is CLOSED as of 2026-09-21** (git date of the close-out commits `d8c4681` … `4d3bae2` and of this entry). Front A closed 2026-09-02, Front B complete 2026-09-02, Front C closed 2026-09-21. Mission View remains DEFERRED per DEC-18-4.

*Verification of this entry: every SHA was read back from `git log` on the branch before being cited; every population and count was recounted from the committed artifact at `5926b16` rather than copied from prose; the bundle names were read from `docs/assets/` after the build; the Slice 17 precedent was quoted from the repo copy of `SLICE_17_FOUNDING.md` (repo root), not from any draft. Additive-only: `git diff --cached -- src/v2/SLICE_18_FOUNDING.md | grep '^-'` yields the file header only.*

---

## §9. POST-LOCK CORRECTIONS — 2026-09-10 (ADDITIVE)

This section corrects §4 and §5 without altering their locked text. Nothing above this line is modified: per line 2 and `.githooks/pre-commit`, a DEC is never reworded, only annotated. Where a correction below and the original text disagree, **this section governs**.

### C-1 — DEC-18-10 population table and title. CORRECTED.

The population table and the heading contained an error, found during Front C implementation. OQ-18-6's ruling — 3D/Biela moves from L2's comet population into L0, the same tier as the nine impactors, under a different provenance label — was not propagated into DEC-18-10's tier populations when it was recorded.

Corrected populations:

- **L0 = 11** — 9 impactors + 3D/Biela + 2015 D1 (the hyperbolic body), each carrying its own sub-reason.
- **L1 = 10,152** — unchanged.
- **L2 = 31,743** — 206 comets + 482 Jupiter-crossing + 31,055 unmeasured.
- **Total = 41,906**, verified.

The comet count moves 207 → 206 because 3D/Biela leaves that population for L0. L2 therefore moves 31,744 → 31,743, and the structurally-blind sub-population recorded in DEC-18-9 moves 689 → 688 (206 comets + 482 Jupiter-crossing); 688 + 31,055 = 31,743 exactly.

**Title corrected:** DEC-18-10's heading reads "Two fidelity tiers ship; no bounded tier without measurement." It should read **"Three fidelity tiers ship; no bounded tier without measurement."** The body of the DEC always described three tiers (L0, L1, L2); the heading was wrong. The original heading is left in place as the additive-only rule requires — this correction is the authority on its wording.

What is unchanged by this correction: there is still no "bounded / trustworthy throughout" tier, and the reasoning for its absence stands unaltered.

### C-2 — OQ-18-6. RESOLVED 2026-09-09 by Hudson.

OQ-18-6 recorded that DEC-18-5's "ten" (nine impactors + 3D/Biela) and L0's "ten" (nine impactors + the hyperbolic body) were different sets with coincidentally matching counts.

**RULING, carried here verbatim from STATUS.md so it lives in the permanent record and not only in the living file:** 3D/Biela is flagged alongside the nine impactors, in the same tier, with a **DIFFERENT PROVENANCE LABEL**. The user-facing fact is identical — this object does not exist — and orbit class has no bearing on it; tiering by orbit class was a classification accident. The evidence differs and the labels say so: **"verified destroyed — ephemeris terminates"** for the nine; **"historically destroyed — documented disintegration, not ephemeris-verified"** for 3D/Biela.

This preserves the `[UNVERIFIED-IN-REPO]` marker on 3D/Biela's disintegration recorded in DEC-18-5: the ruling changes its tier, not the strength of the evidence behind it. L0 now holds three provenance classes — ephemeris-terminated (9), historically destroyed (1), and mathematically unpropagatable (1).

### C-3 — Heading dates on DEC-18-5 through DEC-18-10. CORRECTED.

Those six headings read `LOCKED 2026-09-02`, the date of Nova's draft prose. **The correct date is 2026-09-09**, the git author and commit date of `2eaf936`, the commit that locked them. Per the standing rule that git dates are authority over prose dates, read all six as **LOCKED 2026-09-09**.

The original headings are left in place, as above. DEC-18-1 through DEC-18-4 are unaffected: they were seated 2026-08-24 and recorded in STATUS before this document existed.

### Verification of this section

Tier arithmetic recomputed from `tools/slice18-research/tier-sizing-results.json`: 9 + 1 + 1 = 11; 207 − 1 = 206; 206 + 482 + 31,055 = 31,743; 11 + 10,152 + 31,743 = 41,906. The git date of `2eaf936` was read from `git log`, not from prose. OQ-18-6's ruling text was copied from STATUS.md, where it is recorded under "OQ-18-6 RULED — 2026-09-09, Hudson", and confirmed to exist before being cited, per INV-033.

### C-4 — Tier populations are snapshot-dependent. CORRECTED 2026-09-13.

DEC-18-10's populations, and C-1's correction of them, were derived from a CAD query that was never committed. Regenerating from the committed snapshot `tools/slice18-research/cad-wide/cad-all-0.3.json` — fetched **2026-09-11T04:27:49Z**, 49,652 rows, sha256 `3273b604…f90517`, provenance in `cad-all-0.3.metadata.json` — yields:

- **L0 = 11** — unchanged.
- **L1 = 10,150** — was 10,152.
- **L2 = 31,745** — was 31,743.
- **Structurally blind = 688** — unchanged (206 comets + 482 Jupiter-crossing).
- **Total = 41,906**, verified.

Four bodies account for the entire difference. Three lost Earth encounters upstream and fell below the 10⁶ km materiality threshold; one gained two and crossed above it:

| body | change in the upstream data | max added drift |
|---|---|---|
| 2023 RZ12 | both Earth rows removed (2026-Aug-12 @ 0.2099 AU; 2029-Aug-05 @ 0.2959 AU) | 5.02M → none |
| 2025 OM3 | Earth row removed (2042-Jul-03 @ 0.1287 AU) | 1.46M → none |
| 444584 | two Earth rows removed (2027-Mar-27; 2028-Nov-02); its three Venus rows also revised below the sixth decimal | 1.24M → 0.68M |
| 2015 RT82 | two Earth rows **added** (2026-Sep-04 @ 0.0176 AU; 2044-Aug-25 @ 0.0263 AU) | none → 32.45M |

Confirmed by direct CAD-row comparison between the two snapshots with the identical criterion code applied to both: these are **JPL orbit-solution revisions, not a computation change**. The rows themselves appear, disappear, and change upstream. Note that the newer snapshot has *more* rows overall (49,652 vs 49,629, +23) yet yields *fewer* material bodies — the revision is not accumulation.

**General finding, and the reason this correction matters more than its two-body magnitude suggests.** Any tier population derived from live upstream close-approach data is **a function of the query date**, not a fixed property of the catalog. The catalog is committed and stable; the encounter data is not. A population figure without a named snapshot is unreproducible, and two honest computations run a week apart will disagree.

Therefore: **every population figure cited anywhere — this document, STATUS, a UI surface, a future slice — must name the snapshot it came from.** The committed snapshot is the authority, not because it is more correct than a fresher one, but because it is the only one that can be reproduced. A fresher query is a different measurement, not a better one.

This applies retroactively to the figures in DEC-18-6, DEC-18-9, DEC-18-10 and C-1: read them as "as of the snapshot then in use", and read the numbers in this C-4 as "as of the 2026-09-11 snapshot". The L0 population and the structurally-blind count are the exception — they derive from the committed catalog's own `anchorSource`, `orbitClass`, `a` and `e`, need no external data, and are therefore snapshot-independent.

*Verification of this section: populations recomputed from the committed snapshot by two independent implementations written separately — one by the author of this section, one by an agent given the criterion but not the expected answers — agreeing exactly on all six figures for both the old and the new snapshot, and identifying the same four bodies. The snapshot's sha256 and row count were checked against its metadata artifact before it was cited, per INV-033. The fetch timestamp is read from `cad-all-0.3.metadata.json`, not from any literal in a script.*

### C-5 — L1 is threshold-fragile as well as snapshot-dependent. RECORDED 2026-09-13.

C-4 established that L1 moves with the CAD snapshot. It also moves with the threshold, and more steeply. Measured from the committed per-body artifact `tools/slice18-research/dv-scope-per-body.json` against the 2026-09-11 snapshot, with tier precedence applied so these are true L1 counts and not raw material-set counts:

| threshold | L1 |
|---|---|
| 0.5 × 10⁶ km | 13,172 |
| **1 × 10⁶ km (DEC-18-6)** | **10,150** |
| 2 × 10⁶ km | 6,469 |

A 4× sweep of the threshold moves L1 by slightly more than 2×. The region around the cutoff is dense: **118 L1-eligible bodies sit within ±1% of 10⁶ km, and 1,063 within ±10%**. L1 is a point on a continuum, not a natural boundary in the data.

**DEC-18-6's threshold choice is unaffected by this.** It was chosen because the C3-sensitivity measurement found argmins actually move at 10⁶ km (3 of 15) and do not at 10⁵ (0 of 15) — it is grounded in measured product-visible behaviour, not in where the population happens to be sparse. A threshold is not better for landing in a gap, and this one does not land in a gap. Nothing here reopens DEC-18-6.

**What it does constrain is citation.** L1's count must never be quoted as a stable fact. It is a function of **two** parameters — the snapshot date (C-4) and the threshold value (here) — and a figure given without both is not reproducible. The full statement is "L1 = 10,150 at 10⁶ km against the 2026-09-11 snapshot". L0 and the structurally-blind count remain exempt, for the reason given in C-4: they derive from the committed catalog alone and are independent of both parameters.

**Artifact status, verified 2026-09-13.** `tools/slice18-research/tier-sizing-results.json` **still carries the stale values** — `cannotBoundTotal: 690` and the pre-OQ-18-6 tiers `nonExistent: 9`, `comet: 207`, `material: 10,152`, generated 2026-09-09. It has not been regenerated. It is **superseded** by `tools/slice18-research/tier-sizing-per-body.json` (landed `355fa5f`), whose `populations` field reads `{L0: 11, L1: 10150, L2: 31745, total: 41906, structurallyBlindL2: 688}` — matching C-4 exactly, and naming the field `structurallyBlindL2` so the definitional ambiguity that produced the 690 / 689 / 688 confusion cannot recur. Where the two artifacts disagree, the per-body artifact governs; the older file should be regenerated or removed rather than left to be cited. Its `jupiterCrossingAlsoHasMaterialCadEncounter: 0` is independently wrong: 9 Jupiter-crossing bodies do carry a material CAD encounter, and 21 material bodies in total are absorbed by higher tiers (12 comet, 9 Jupiter-crossing).

*Verification of this section: the sweep and density figures were computed from the committed per-body artifacts joined by designation, with L0/comet/Jupiter-crossing bodies excluded before counting, and independently reproduced by a separate agent given the criterion but not the expected answers — 13,172 / 10,150 / 6,469 and 118 / 1,063, agreeing exactly. The `populations` field was read from the committed artifact, not recomputed into it. The staleness of `tier-sizing-results.json` was checked directly rather than assumed corrected.*
