# Slice 11 Founding Document — Porkchop Plot Visualization + ΔV Stack

**Status:** LOCKED 2026-06-03
**Author:** Hudson Clavin
**Prior slice:** Slice 10 (Lambert-based Earth-departure screening, deployed at https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/)
**Next slice (planned):** Slice 11.5 (full-catalog M=1 re-screen + cache schemaVersion 2 + UI refit)

---

## §1. Slice intent

Slice 11 delivers two coordinated visualization surfaces — a compact in-context **overlay porkchop** for fast inspection and a full-featured **dedicated porkchop route** for deep analysis — that surface the full per-body Lambert grid (departure date × time-of-flight → C3 / v∞ / ΔV) computed on-demand from the existing Slice 10 substrate. Slice 11 also surfaces the ΔV stack model per Query 3 Section 10, transforming raw C3 values into operationally meaningful mission cost estimates.

Slice 11 also conducts a **light M=1 sampling extension** (500 bodies stratified by orbit class) that scopes the eventual Slice 11.5 full-catalog re-screen.

Slice 11 does NOT modify the Slice 10 screening cache. Cache stays at schemaVersion 1, M=0 only. M=1 visualization is computed on-demand at porkchop view time and is therefore not subject to the audited cache contract.

---

## §2. Inherited invariants from Slice 10

INV-001 through INV-015 (orbital mechanics, frame, propagation policy) remain operative.

INV-016 (patched-conic honesty layer) is extended in Slice 11:

- **INV-016a (preserved):** Co-orbital criteria remain `e ≤ 0.1 AND i ≤ 5° AND |a - 1 AU| ≤ 0.05 AU`. Co-orbital bodies receive cyan tint in 3D view and "co-orbital" tag in all porkchop UI surfaces.
- **INV-016b (new):** Porkchop views must visually distinguish M=0 and M=1 solution branches. Users must be able to identify which solution branch each visible window belongs to. The dedicated view exposes an explicit M=0/M=1 toggle; the overlay shows both with distinct visual encoding.
- **INV-016c (new):** ΔV stack values displayed in porkchop views must include the underlying assumption (impulsive, patched-conic, simplified rendezvous model per Query 3 Section 10) in a discoverable disclosure. Same honesty pattern as Slice 10's INV-016 disclosure footer + popover.

---

## §3. Architectural invariants new in Slice 11

- **INV-017:** The shared porkchop renderer is one component, consumed by two surfaces (overlay modal and dedicated route). Renderer must function identically in both — no surface-specific rendering forks.
- **INV-018:** Lambert grid computation runs on a Web Worker, never the main thread. Validated by Measurement 1 (98.5 ms median per body); enforces UI responsiveness.
- **INV-019:** M=1 solutions computed at porkchop view time use the Slice 10 audited Lambert math layer. The local multi-rev extension from `tools/slice11-research/measurements/lambert-multi-rev-local.mjs` is the design reference, but production code must live in `src/v2/core/lambert/` and pass its own audit-quality testing before integration. Slice 10's existing `lambert()` function continues to reject M ≠ 0; a new `lambertMultiRev()` function is introduced for Slice 11's needs.
- **INV-020:** Dedicated porkchop route is bookmarkable and shareable. URLs of form `/v2/porkchop/?body=<bodyId>` must render the same view as if reached from the overlay's "open detailed view" navigation.

---

## §4. Open Questions (OQs)

Slice 11 carries five OQs. Three are pre-research-informed (closeable with measurement results); two will close during Slice 11 implementation.

**OQ-1: Does on-demand per-body Lambert grid computation hit acceptable interactive latency?**
**STATUS: CLOSED 2026-06-02.**
**Resolution:** Measurement 1 (`tools/slice11-research/data/lambert-grid-timing.json`, commit `d4dc4ef`) measured 98.5 ms median per body across 10 stratified test bodies on a Web Worker, with worst case 117 ms. This is at the lower boundary of "feels instant" but acceptable for the per-click interaction model. Reusing a long-lived worker (rather than spawning per click) is required by INV-018 to keep the per-click overhead consistent. A brief loading indicator (~150 ms target) is required for visible feedback.

**OQ-2: At population scale, does M=1 produce meaningfully better windows than M=0 frequently enough to justify integration in the screening cache (Slice 11.5)?**
**Status: SCOPING — measurement extension in Slice 11.**
Measurement 2 (100-body sample, commit `265585f`) showed 28/100 = 28% meaningful wins. Distribution by class: ATE 2/25 (8%), APO 8/25 (32%), AMO 11/25 (44%), IEO 7/25 (28%). The OQ asks whether this holds at larger sample. Slice 11 includes a 500-body stratified extension (Phase E) that closes this OQ definitively. If the 25-30% win rate holds, Slice 11.5 re-screens the full catalog with M=0 + M=1. If the win rate drops below 10% at larger sample, Slice 11.5 is descoped to a documentation update instead.

**OQ-3: Does our Lambert solver agree with poliastro at porkchop-grid scale?**
**STATUS: CLOSED 2026-06-02.**
**Resolution:** Measurement 3 (`tools/slice11-research/data/poliastro-validation.json`, commit `bf177dd`) measured max relative error of 3.43e-14 across (50×50) grids on three reference bodies (Apophis, Bennu, Itokawa) — machine-precision agreement. Validation passes. The Slice 11 porkchop renderer can be trusted to display correct C3, v∞_dep, and v∞_arr values from our solver.

**OQ-4: What is the right level of detail for the ΔV stack disclosure?**
**Status: OPEN — closes during Slice 11 implementation.**
Query 3 Section 10 gives a minimum viable ΔV stack model: `injection + 2×√C3 + 150 m/s overhead + 10% margin`. Slice 11 displays this in the dedicated view. The honest disclosure of its assumptions (impulsive, patched-conic, no gravity assists, no SEP support, no body-specific stationkeeping budget) is required per INV-016c. The form factor of this disclosure (footer text, inline tooltips, expandable section, popover modal) is a UX decision that closes after the first implementation pass and user-facing review.

**OQ-5: Should the dedicated route support multi-body comparison (e.g., two porkchops side by side for selecting between candidate targets)?**
**Status: OPEN — deferred to Slice 11 Phase D, may be cut.**
Multi-body comparison is a natural feature for mission designers choosing between candidates. But it's out of scope for the first version of Slice 11; the dedicated route ships with single-body view in Slice 11. OQ-5 captures the deliberate deferral and the design space for a later addition.

**OQ-11C-1 — Earth-state provisioning in the app overlay (INTEGRATION RISK, STOP gate).**
The overlay-scoped client (DEC-11C-2) needs the long-window (14-year, 2026-2040) Earth state series to compute grids — the same series the smoke harness hand-builds via the validated fixture path (ingestSlice2Fixture → earthSeries → interpolateBodyStateSeries). This has been proven in the smoke harness but NEVER exercised in the actual app overlay. This is the same class of risk as the 2a Earth-fixture-span surprise: a data-provisioning assumption true in the smoke page but unverified in-app. RESOLUTION: the Phase C implementation dispatch MUST include a STOP gate that builds Earth-state in the overlay and verifies a computed grid reproduces a known cell value BEFORE wiring the modal UI — do not assume the smoke-harness Earth path transfers to the overlay unchanged. Where Earth-state is built (overlay mount) and how it's handed to the client must be read from current overlay code, not assumed. RESOLVED 2026-06-22 for the tests-fixture Earth path (overlay-style probe reproduced 1781.2916629949357, 5479 Earth samples). NOTE: DEC-11C-5 changes the production source to runtime's earthSeries, which carries its OWN verification obligation (span + C3) before modal wiring — OQ-11C-1's resolution covers the fixture path, not yet runtime's source. DEC-11C-5 amended (2026-06-22) to a two-span split after measurement falsified one-source; the long-fixture path OQ-11C-1 proved is now the production porkchop Earth source, pending its move to a production data path.

**OQ-11C-2 — Row trigger injection mechanism.**
DEC-11C-1 requires a porkchop trigger separate from the hardwired row-click. Recon showed two viable mechanisms: (a) add a callback prop to renderRow, or (b) wrap/extend row-click handling at the panel level. The choice must be made at dispatch time against current row.ts/panel.ts structure (read first), preserving existing selectBody + requestFocus semantics exactly. Not locked here because it depends on the row component's current prop surface.

---

## §5. Locked DECs

**DEC-1: Visualization surfaces — overlay + dedicated, shared renderer.**
- Overlay modal opens from catalog list row click, dismissible via ESC/X/backdrop  *(SUPERSEDED by DEC-11C-1: opens from a separate trigger, not row-click; row-click keeps selectBody+requestFocus. ESC/X/backdrop dismissal retained per DEC-11C-3.)*
- Dedicated route at `/v2/porkchop/?body=<bodyId>`, bookmarkable, shareable
- Shared porkchop renderer component (Preact) consumed by both surfaces
- INV-017 enforces renderer parity

**DEC-2: Axes convention.**
- X-axis: departure date in calendar format (e.g., "Jan 2027", "Apr 2030")
- Y-axis: time-of-flight in days (with year markers at 365, 730, 1095, 1460 days)
- Grid extent: departure 2026-01-01 to 2040-01-01 (matches existing cache window); TOF 0.5 to 5 years (matches existing cache range)
- Default grid resolution: 200 × 100 cells (matches Measurement 1's timing target; ~98 ms compute)

**DEC-3: Color scheme and contours.**
- Heatmap: C3 in km²/s², perceptually-uniform colormap (viridis, magma, or similar — finalize during Phase A implementation)
- Iso-contours overlaid: C3 = 0, 5, 10, 20, 30 km²/s² (matches Query 1 conventions)
- Color of contour lines: light gray or white for contrast against the heatmap
- Contour labels: placed at line edges, units displayed

**DEC-4: Auxiliary overlays.**
- TOF iso-lines at 365 / 730 / 1095 / 1460 days (year markers), light dashed
- Type-1 vs Type-2 boundary curve visible as a distinct line on the grid
- Arrival v∞ contours available as a toggleable overlay (dedicated view only)
- DLA / launch-site declination overlay: **deferred to Slice 12** (requires launch-site assumptions out of Slice 11 scope)

**DEC-5: M=0 / M=1 handling.**
- Overlay view: shows M=0 by default. Small M=1 toggle in the overlay header — checking the toggle adds a second contour layer (different color, e.g., orange) for the M=1 minimum-energy locus. Compact info, not full grid.
- Dedicated view: M=0/M=1 toggle is prominent. Selecting M=1 replaces the heatmap with the M=1 grid; selecting "both" overlays them (semi-transparent layers). Default state is "both" so the 28% gap is visible immediately.
- Both branches of M=1 (left/right) are computed; the lower-energy one is used for display per Query 2 recommendation.

**DEC-6: Selected-cell readout.**
- Click on a cell in either view "pins" it as the selected window
- Readout shows: departure date, arrival date, TOF, C3, v∞_dep, v∞_arr, M (rev count), branch, full ΔV stack breakdown (dedicated view only)
- Selected cell remains pinned until user clicks a different cell or dismisses

**DEC-7: ΔV stack model (Query 3 Section 10).**
- For each pinned cell, compute and display:
  - Injection ΔV from C3 (LEO → Earth escape with v∞_dep)
  - Rendezvous ΔV = v∞_arr
  - Departure ΔV (sample return) = v∞_arr (matches outbound)
  - Stationkeeping / ops overhead = 150 m/s constant
  - Margin = 10% of subtotal
- Total ΔV displayed as primary mission-cost number
- All assumptions disclosed per INV-016c

**DEC-8: Worker architecture.**
- One long-lived Web Worker for porkchop grid computation, instantiated at app boot
- Worker receives `{bodyElements, gridParams, M}` messages, returns `{cells: [{dep, tof, c3, vInfDep, vInfArr}], compute_ms}`
- Per-click flow: user clicks body → main thread sends message → worker computes 200×100 grid (~98ms M=0 + ~98ms M=1 = ~200ms total when both branches requested) → returns result → renderer draws
- Loading indicator visible during the ~200ms compute window

**DEC-9: lambertMultiRev() production code.**
- New function in `src/v2/core/lambert/` that accepts M ∈ {0, 1, 2} and returns lower-energy branch
- Audited via the same pattern that audited Slice 10's `lambert()`: test against poliastro across a (50×50) grid for each M value, max relative error must be ≤ 1e-6 (more generous than Slice 10's machine-precision bar because M=1 series convergence is genuinely harder)
- Existing `lambert()` continues to reject M ≠ 0 per Slice 10 audit Finding 7; new code path is separate

DEC-9 Amendment (2026-06-19, post-Dispatch-37 Finding 4 + 37.5 verification): lambertMultiRev() returns all solution branches with raw velocities and converged x — one branch for M=0, both left/right for M≥1 — rather than pre-selecting a "lower-energy branch." Branch selection by departure C3 (min |v1 − v_earth|²) is performed by the consuming layer (the porkchop worker per DEC-8), which carries the Earth ephemeris the core solver deliberately does not. Rationale: "lower-energy branch" was ambiguous between heliocentric specific energy and Earth-relative departure C3; the mission-relevant metric is C3, and computing it inside the core solver would be a layering violation. Verified: Finding 4 (heliocentric-vs-C3 ordering can diverge) + 37.5 (poliastro confirms both M≥1 branches are real solutions).

**DEC-10: Light M=1 sampling extension (Phase E).**
- Extend Measurement 2's 100-body sample to 500 bodies stratified by orbit class
- Same RNG seed (11) means original 100 are subset of new 500 (reproducibility)
- Output: `tools/slice11-research/data/multi-rev-worth-it-500.json`
- Closes OQ-2 definitively; informs Slice 11.5 go/no-go

### Phase C DECs

**DEC-11C-1 — Modal trigger: separate affordance, not row-click.**
Plain catalog row-click KEEPS its current behavior: selectBody(bodyId) + requestFocus() (3D selection + focus). It is NOT overloaded to open the porkchop. The porkchop modal opens from a SEPARATE trigger — a dedicated control (icon button) on the row or in the selection-detail area — so opening a heavy modal is always an explicit, deliberate second action. Rationale: opening a compute-bearing modal on every row-click is hostile UX and would couple 3D-focus to porkchop-open. Recon confirmed row-click is hardwired in row.ts (line 78) to selectBody + requestFocus with no callback injection point; the trigger is added alongside, not by hijacking that handler.

**DEC-11C-2 — Worker client lifetime: overlay-scoped, single persistent client.**
PorkchopClient (which owns a Worker; createPorkchopClient @ porkchop-client.ts line 27, dispose() terminates it) is created ONCE when the Phase C overlay mounts, reused across every modal open/close, and disposed EXACTLY ONCE when the overlay tears down. The modal does NOT create or dispose the client on open/close. Rationale: per-open create/dispose churns workers, re-runs grid-compute wastefully, and creates a worker-leak surface if any close path forgets dispose(). One idle worker for the overlay's lifetime is the accepted cost. Constraint: PorkchopClient allows only one in-flight computeGrid() (throws if a request is already in flight) — the modal must guard against overlapping compute requests (e.g. disable recompute controls while a grid is computing).

**DEC-11C-3 — Mount location: inside the existing overlay Preact tree, not a new global root.**
The porkchop modal mounts inside the existing overlay tree (ui-overlay/overlay.ts mountPhaseCOverlay → PhaseCOverlay → renderPanel), reusing the inline modal/backdrop mechanics already present in catalog-list/panel.ts renderPopover (popoverOpenSignal pattern, backdrop-click + × dismissal). It is NOT a separate portal or global route root. ADD an ESC-to-dismiss handler (the existing popover has backdrop + × but no ESC — the modal should support all three). Rationale: the catalog already lives in this overlay tree and the full catalog is in scope there (catalogSignal.value), so the modal can derive its data without a new fetch (see DEC-11C-4). The dedicated full-page route is Phase D, separate from this modal.

**DEC-11C-4 — Modal data is derived from the in-scope catalog, no new fetch.**
PorkchopView needs { client, bodyId, bodyLabel, bodyElements, gridParams, M }. At modal-open time, mounting from the panel tree: bodyId comes from the row; bodyLabel is built from name || designation; bodyElements is looked up from catalogSignal.value (catalog.asteroids[bodyId]) — recon confirmed the row itself only carries a summary (CatalogListRowData) but the full catalog with orbital elements is already in panel scope; gridParams is constructed at open time; M defaults to 1; client is the overlay-scoped singleton from DEC-11C-2. No new network/data fetch for asteroid elements is required.

**DEC-11C-5 — Earth-state source: single app-wide series from runtime, verified before use.**
The production porkchop overlay uses ONE Earth-state source shared with the 3D scene — runtime's earthSeries (built from loadSolarSystemStatesBrowser() in src/v2/app/solar-system/runtime.ts) — NOT a separately-loaded tests/fixtures/ Horizons file. Rationale: the porkchop is a credibility artifact; computing Earth positions from a different source than the rest of the app (and from a tests/ artifact in production) would be a silent provenance divergence. One Earth source app-wide is the honest architecture.

CONSEQUENCE — this trades a PROVEN source for an UNVERIFIED one, so verification is mandatory, not optional. OQ-11C-1 proved the tests-fixture Earth path reproduces the validated C3 (1781.2916629949357) to machine precision. runtime's loadSolarSystemStatesBrowser() Earth series has NOT been verified to do so. The Phase C implementation dispatch MUST, before any modal UI is wired:
  (a) Plumb runtime's earthSeries to ui-overlay/overlay.ts (recon confirmed it is local imperative runtime state, currently NOT exposed to the overlay — it must be exposed/handed over, not duplicated).
  (b) SPAN CHECK: confirm runtime's earthSeries covers the full porkchop departure+TOF window (departure 2026-2040, TOF up to ~5 years → Earth samples must extend to ~2045). The 2a bug was a 90-day-vs-14-year fixture-span mismatch; if runtime's Earth series is a shorter window than the porkchop grid needs, the grid computes against an Earth series that doesn't cover the window. This MUST be checked — do not assume runtime's span matches the fixture's.
  (c) C3 VERIFICATION: compute the Apophis M=1 validated cell (depJD 2461175.500800741, tofDays 1095.75) through a client built on runtime's earthSeries and confirm C3 reproduces 1781.2916629949357 to machine precision — the identical check OQ-11C-1 passed on the fixture path, now proving runtime's source carries correct numbers.
  STOP gate: if the span doesn't cover the window OR the C3 doesn't reproduce, STOP and report — do not wire the modal on an Earth source that fails either check. The fallback if runtime's source fails verification is a documented decision point for Hudson, NOT an automatic revert to the tests fixture in production.

**DEC-11C-5 AMENDMENT (2026-06-22) — one-source premise falsified by measurement; decision updated to documented two-span split.**

DEC-11C-5's verification gate (Phase C Step 1, this dispatch) did its job and FALSIFIED the gate's own premise. Findings:
- runtime's earthSeries comes from loadSolarSystemStatesBrowser() reading tests/fixtures/v2/horizons-inner-system-90d.json: 91 samples, span 2026-05-01 → 2026-07-30. The porkchop grid needs departure-through-2040 + TOF~5yr = coverage to ~2045. Runtime's source falls short by ~14 years — a hard span fail. (Format was NOT the problem: runtime's earthSeries is the same CanonicalState[] shape createPorkchopClient expects; no adapter needed. Span was the only issue.)
- Switching runtime to the long fixture (horizons-inner-solar-system-2026-2040.json, 5479 samples) to preserve one-source was MEASURED: loader path 4.7ms → 224ms (~48x), retained heap ~0.23MB → ~15.3MB (~67x), multiplied across ALL inner-system bodies (sun/mercury/venus/earth/moon/mars), not Earth alone. The 3D scene does use the loaded span as its scrub domain, but there is no demonstrated product need for a 15-year scene scrub — so the cost buys negligible scene value.

DECISION (supersedes DEC-11C-5's "one Earth source app-wide"): the porkchop loads its OWN long-span Earth fixture, SEPARATE from the 3D scene's 90-day source. This is NOT the provenance divergence DEC-11C-5 guarded against: both fixtures are the SAME Horizons ephemeris over the same underlying source, differing only in SPAN (window length), and are bit-identical where they overlap. The split is forced by genuinely different temporal needs — the scene needs a short window for fast load + smooth animation; the porkchop needs a 14-year window for the departure grid. Recorded as: one Horizons provenance, two spans, by purpose.

This path is ALREADY VERIFIED: OQ-11C-1 proved the long-fixture Earth path (horizons-inner-solar-system-2026-2040.json → createPorkchopClient) reproduces the validated C3 1781.2916629949357 to machine precision with 5479 Earth samples. Option 2/3 promotes the already-proven path to production; the verification debt is paid.

PRODUCTION-PATH REQUIREMENT (addresses DEC-11C-5's tests/ objection): the long fixture must NOT ship from tests/fixtures/ in production. The Phase C implementation moves it to a production data path (e.g. src/v2/data/ or the established production-asset location — to be confirmed against repo structure at dispatch time) and the porkchop loads it from there. Shipping a file literally pathed tests/fixtures/ in a credibility artifact is a reviewer red flag; the move closes it.

CONSEQUENT obligations for the Phase C implementation dispatch (carried from DEC-11C-5's gate, now retargeted to the porkchop's own fixture load):
- (a) The porkchop overlay loads its long Earth fixture from the production data path (post-move), builds the overlay-scoped client (DEC-11C-2) on it.
- (b) C3 re-verify after the move: confirm the Apophis M=1 validated cell (depJD 2461175.500800741, tofDays 1095.75) still reproduces 1781.2916629949357 through the moved-fixture load path — the move must not alter the data. STOP if it doesn't.
- (c) The 3D scene's 90-day source is UNCHANGED — this amendment touches only the porkchop's Earth source, never runtime's scene load.

---

## §5a. Post-Phase-A Amendments (2026-06-20)

Phase A delivered `lambertMultiRev()` with the both-branches API (DEC-9 amended 2026-06-19, commit `fb33487`), audited via the three-subagent-prior pattern (Dispatch 37), remediated (Dispatch 38), and externally validated dual-oracle (Dispatch 39, commit `3560ff8`). These amendments propagate the both-branches decision into the downstream contracts (DEC-8 worker, DEC-5 display) and record audit-target closure. The locked DEC text in §5 is preserved unchanged; this section records the deltas with explicit "amends DEC-X" pointers.

---

**AMD-1 — Worker contract (amends DEC-8).**

Forced by the DEC-9 amendment: the core solver returns all branches; selection by departure C3 happens at the consuming layer. The worker is that layer.

LOCKED:

- **C3 is computed in the worker, never the renderer.** C3 = |v1 − v_earth|² requires Earth state, which the worker resolves via its ephemeris model (the same model used to place departure epochs). The renderer never computes C3 and never holds ephemeris. This is the layering boundary the DEC-9 amendment forces.

- **Worker message (main → worker):** `{ bodyId, bodyElements, gridParams, M }` where `gridParams = { depStartJD, depEndJD, tofMinDays, tofMaxDays, nDep, nTof }`. `M` is a single value per message. "Both" display mode (DEC-5) issues two messages (M=0 and M=1); the renderer composites. The ~200 ms budget in DEC-8 already covers the two computes (~98 ms each).

- **TOF / units boundary.** The message boundary speaks the UI/cache vocabulary: departure as JD, TOF in days. The worker converts to the solver's internal units (seconds; μ in km³/s²) immediately before calling `lambertMultiRev`, and converts results back. The seconds-only zone is strictly internal to the worker — no tof-in-seconds value crosses the worker boundary.

- **Worker result (worker → main):** `{ cells: [ Cell ], compute_ms }`, where each
  Cell = { depJD, tofDays, status: 'ok' | 'no_solution' | 'stall', M, branches: [ Branch ], selectedBranch: <index | null> }
  and Branch = { branch: 'single' | 'left' | 'right', converged: boolean, c3, vInfDep, vInfArr, x }.
  (branches length 1 for M=0, up to 2 for M≥1; selectedBranch is worker-computed min-C3, null if none converged; c3 in km²/s² = |v1 − v_earth|²; vInf in km/s; x is the converged Izzo variable.)

- **status semantics (closes deferred architect finding, null-vs-stall):** `no_solution` — T < T_min for this M (core returned null), render as no-solution cell. `stall` — a branch failed to converge though a solution should exist; render distinctly, never collapse silently into `no_solution`. `ok` — at least one branch converged.

- **Both-branches-full-data + selection-hint (rationale).** The worker returns full data for every branch plus a `selectedBranch` hint, rather than only the winner. This keeps C3 computation/selection in the worker (where v_earth lives) while preserving renderer display flexibility: DEC-5 specifies different M=1 display per surface (overlay compact vs dedicated "both"), and full both-branch data lets either surface render its mode without a worker re-fetch. Payload cost is one extra branch of floats per M≥1 cell — trivial.

---

**AMD-2 — Display branch reconciliation (amends DEC-5 third bullet).**

DEC-5's "Both branches of M=1 (left/right) are computed; the lower-energy one is used for display per Query 2 recommendation" is reconciled with the DEC-9 amendment: the displayed M=1 branch per cell is the **departure-C3-selected** branch (the worker's `selectedBranch`), not heliocentric specific energy. The phrase "lower-energy" is superseded by departure C3 — the mission-relevant metric. The non-selected branch's full data remains per-cell (AMD-1 payload) for the pinned-cell readout (DEC-6) and any dual-branch display mode.

OPEN (framed, not forced — Phase B/D design decision): Whether the dedicated view's M=1 surface renders only the C3-selected branch (one locus) or both left/right branches as distinct loci. Lean: selected branch as the rendered surface, non-selected surfaced only in the pinned-cell readout, to avoid 3–4 overlapping loci (M=0 + M=1-left + M=1-right + contours) on one plot. Closes during Phase B/D against actual rendered density. Not locked here.

---

**AMD-3 — DEC-9 audit target closed (records status; no contract change).**

DEC-9's audit target (max relative error ≤ 1e-6 for M ∈ {0,1,2}) is MET and exceeded. Dispatch 39 (commit `3560ff8`) measured machine-scale agreement vs poliastro 0.17 across full 50×50 grids on Apophis / Bennu / Itokawa for M ∈ {1,2} (bulk max relative error 3.6e-12), with the T_min boundary independently characterized via float64 scan (max divergence 2.2e-4 days, far below one grid cell of 18.64 days). Zero CLASS_POLIASTRO_ONLY cells (the solver never misses a solution poliastro finds); zero stalls. M=0 remains machine-precision validated (Measurement 3). The §6 Phase A STOP gate — "if audit fails for M=2, narrow scope to M ∈ {0,1} and update DEC-9" — did NOT trigger; M=2 passed.

---

**AMD-4 — Phase F audit obligation discharged (amends §6 Phase F).**

§6 Phase F lists a multi-agent audit on `lambertMultiRev` (mathematician + adversarial + architect, Slice 10 Dispatch 21 pattern). This obligation is already met, front-loaded into Phase A: Dispatch 37 ran the three subagent priors + reconciliation (6 findings); Dispatch 38 remediated all findings, each verified against an external reference or measured number; Dispatch 39 externally validated dual-oracle. Phase F's math-audit line is discharged — do NOT re-run a full math audit at Phase F. Phase F reduces to: visual verification of overlay + dedicated route, full vite build + dev-server smoke, production deploy, OQ-4 closure, OQ-5 deferral note.

---

**AMD-5 — Validation-grid vs render-grid resolution (note; no contract change).**

External validation (Measurement 3, Dispatch 39) ran at 50×50; DEC-2's production render grid is 200×100. Correctness is pointwise (per-cell machine-precision agreement), so it transfers to denser sampling of the same continuous (departure, TOF) space — resolution-independent. [Likely] no gap. Residual [Speculative] risk: isolated 200×100 cells landing on near-pathological geometry (exact antipodal, exact T_min) that the coarser 50×50 grid stepped over. Mitigation: when the Phase B worker first renders a real 200×100 grid, smoke-check the `status` counts — confirm zero unexpected `stall` cells and no NaN. Not a blocker; a Phase B smoke-test item.

---

**AMD-6 — Earth-state ownership (amends AMD-1 worker message contract).**

AMD-1 stated the worker "resolves Earth state via its ephemeris model." Phase B Part 1 recon (Dispatch 40) found the existing worker holds asteroid bodies after init but does NOT own Earth ephemeris — Earth/planet state is loaded main-thread via `loader.ts`. Adopted implementation: the Earth state series is injected into the worker in the **init message** (once, at boot), held in worker memory alongside the asteroid bodies, and interpolated per departure column via `interpolateBodyStateSeries` (`hermite.ts`). This supersedes AMD-1's "worker resolves Earth via its ephemeris model" wording.

Rationale: matches the established main-thread-loads / worker-computes split (`loader.ts` owns ephemeris loading); avoids duplicating the Horizons loader inside the worker. Earth state goes in the init message (not per compute message) to match the existing init-then-repeated-messages lifecycle. Committed `916417e`.

---

**AMD-7 — Lambert grid convention (records the validated screening setup as contract).**

The porkchop grid uses the same Earth-departure Lambert convention as the externally-validated Slice 11 scripts (`multi-rev-poliastro-validate.mjs`, `multi-rev-dual-oracle-validate.mjs`), NOT a target-to-target convention. Per cell:

- `r1` = Earth heliocentric position at departure (`depJD`)
- `r2` = asteroid heliocentric position at arrival (`depJD + tofDays`)
- `tof` = arrival − departure
- `vInfDep = v1 − vEarth(dep)`; `vInfArr = v2 − vAsteroid(arr)`; `c3 = |vInfDep|²`
- `selectedBranch` = min-c3 converged branch (per the DEC-9 amendment / AMD-2)

This is recorded as explicit contract because it is not otherwise stated in §5 — it lived only in the research scripts, and a Dispatch 40 drafting error briefly proposed a target-to-target convention before recon caught it. Pinning it here prevents future re-derivation. Units inside the worker: meters, m/s, TDB seconds since J2000; the message boundary uses JD + `tofDays` (per AMD-1). Committed `916417e`.

---

**AMD-8 — DEC-8 timing reality + full-resolution decision (amends DEC-8).**

DEC-8's ~98 ms/M budget was a Measurement-1 extrapolation (M=0 screening compute) that did not hold for M=1 both-branches at 200×100. Measured (Dispatch 40), then optimized (Dispatch 41 — `grid-compute.ts` allocation cleanup: eliminated copied `v1`/`v2` arrays, preallocated cells, scratch-reused km buffers; proven **bit-identical** against the validated baseline `916417e` across Apophis/Bennu/Itokawa, zero cell differences, solver iteration math untouched):

- M=1 (both branches), 200×100: 255 ms → **148 ms** (42% reduction, bit-identical)
- M=0, 200×100: 98 ms
- projected "both" click (M=0 + M=1): ~246 ms

Decision: 200×100 full resolution is used on BOTH surfaces (overlay and dedicated route). Surface-differentiated grid downscaling was considered and **REJECTED** as a non-value-aligned patch that hides cost rather than removing it; the optimization removed real allocation waste instead. The OQ-1 loading indicator (~150 ms target) covers the residual ~246 ms both-click latency, which sits within OQ-1's acceptable per-click band. INV-017 is preserved: resolution is uniform across surfaces, renderer behavior identical. Optimization committed as the `perf(slice11-phase-b)` commit on top of `916417e`.

---

**DEC-3 AMENDMENT (2026-06-27) — log-scale C3 colormap, superseding linear 0→30 and the original contour set (amends DEC-3).**

Forced by measured C3 distribution across Apophis/Bennu/Itokawa M=1 200×100 grids: ok-cell C3 medians ~109-154 km²/s², p90 ~485-729, structure-carrying band ~20-100, long tail beyond. The original linear 0→30 colormap clamped ~77% of cells to flat yellow (correct but uninformative); a linear ceiling of 100 was measured to still clamp ~73% AND compress the feasible belly (0-15) into the bottom 15% of color range. Linear cannot resolve feasible belly + marginal band + tail across 3 orders of magnitude. Log scaling is the correct encoding.

LOCKED:
- Colormap maps log(C3) to viridis: `t = (log(C3_clamped) − log(C3_MIN)) / (log(C3_MAX) − log(C3_MIN))`, clamped [0,1]. Viridis stops unchanged (dark = low C3 / feasible, bright = high C3 / infeasible).
- C3_MIN = 1 km²/s² (DISCLOSED log floor). Rationale: v∞=1 km/s is uniformly excellent; no mission decision turns on C3 0.3 vs 0.8. Flooring here loses no decision information and prevents log(0)=−∞. Cells ≤ 1 clamp to t=0 (darkest).
- C3_MAX = 1000 km²/s² (DISCLOSED log ceiling). Rationale: measured p90 (485-729) sits at t≈0.90-0.95 — visible but near-max, the correct read for "deep tail but not clamped." Spread: feasible belly C3<15 → t<0.39 (vs 15% under linear-100); structure band 20-100 → t≈0.43-0.67; tail 100-1000 → t≈0.67-1.0. Cells > 1000 clamp bright (honestly: deeply infeasible).
- Contours: 10, 30, 100, 300 km²/s² (replacing original 0,5,10,20,30, which under log all stack in the bottom 49% / dark corner). New set maps to t≈0.33/0.49/0.67/0.82, covering all four decision regions: feasible gate (10), marginal boundary (30, preserving the original limit's spirit), band ceiling (100), tail onset (300). These are absolute C3 values, independent of colormap scale.
- Legend: gradient + ticks become LOG-spaced and labeled (e.g. 1, 10, 100, 1000), and the legend must state "logarithmic scale" so the non-linear color↔C3 relationship is explicit, not misleading.

VERIFICATION OBLIGATION (for the implementation dispatch):
- C3=0 / sub-floor handling: a cell with C3 ≤ C3_MIN clamps to t=0 (darkest), never NaN.
- Monotonicity + ordering: low C3 → dark, high C3 → bright, strictly monotonic. Verify three known cells: C3≈8.78 (feasible gate cell) renders clearly dark; C3≈69.5 (marginal sample) renders mid-range; a C3>1000 cell renders clamped-bright. Confirm correct ordering and visible distinction.
- Legend must visually match the heatmap (same log path).

---

## §6. Phase breakdown

**Phase A: lambertMultiRev() implementation + audit (~3-5 dispatches).**
- Implement `lambertMultiRev()` in `src/v2/core/lambert/`
- Audit via poliastro grid validation across (50×50) for M={0,1,2} on 3-5 reference bodies
- Audit target: max relative error ≤ 1e-6
- STOP gate: if audit fails for M=2, narrow scope to M ∈ {0,1} only and update DEC-9

**Phase B: shared porkchop renderer component (~3-5 dispatches).**
- Preact component, h() pattern matching Slice 10
- Inputs: `{cells, gridParams, displayMode, selectedCell}` props
- Renders canvas-based heatmap (canvas perf > SVG for 200×100)
- Contour overlay rendering
- Click-to-pin selection with selected-cell pin marker
- Hover tooltip showing cell values

**Phase C: overlay modal surface (~2-3 dispatches).**
- Modal component opened from catalog list row click
- Wraps porkchop renderer with compact controls (M=1 toggle, dismiss button)
- "Open detailed view" navigation button → navigates to dedicated route
- ESC / X / backdrop dismissal

**Phase D: dedicated route surface (~4-6 dispatches).**
- Add `v2/porkchop/index.html` entry to `vite.config.ts` rollupOptions
- Full-featured page component: porkchop renderer + side panel (body identity, M=0/M=1 toggle, displayed-quantity selector, ΔV stack readout, selected-cell detail)
- URL parameter handling for `?body=<bodyId>`
- Back-navigation behavior
- ΔV stack computation + display + INV-016c disclosure surface

**Phase E: light M=1 sampling extension (~1-2 dispatches).**
- Extend Measurement 2 script to 500 bodies
- Run, commit data
- Update OQ-2 closure with measured population-scale win rate
- Recommend Slice 11.5 go/no-go in the OQ-2 closure body

**Phase F: verification + cutover + deploy (~3-4 dispatches).**
- Multi-agent audit on Phase A's lambertMultiRev (mathematician + adversarial + architect, same pattern as Slice 10 Dispatch 21)
- Visual verification of overlay and dedicated route in dev mode
- Full vite build + dev server smoke + production deploy
- Close OQ-4, defer OQ-5 to a documented "Slice 11.5 or beyond" note

---

## §7. Out of scope (Slice 11)

These belong to Slice 11.5 or later:

- Full-catalog M=1 re-screen
- Cache schemaVersion 2
- Catalog list UI refit to surface M=1-aware status badges
- 3D screening color update to reflect M=1-aware accessibility
- DLA / launch-site declination overlay (Slice 12)
- Multi-body porkchop comparison view (OQ-5, possibly never)
- Low-thrust (SEP) ΔV accounting (Query 3 Section 9, deferred)

---

## §8. Engineering record (running log)

To be populated during Slice 11 dispatches.

**2026-06-02: Pre-research complete. Three measurements landed:**
- `d4dc4ef` measure(slice11): Lambert grid compute time on Worker thread (10 bodies) — 98.5 ms median, validates on-demand per-click feasibility
- `265585f` measure(slice11): M=1 multi-rev worth-it analysis on 100-body stratified sample — 28/100 meaningful wins, scoping data for Slice 11.5
- `bf177dd` validate(slice11): porkchop grid agreement with poliastro on 3 reference bodies — max rel error 3.43e-14, machine precision

**2026-06-03: Founding doc drafted and locked.** All five OQs scoped (three closed by pre-research, two open through implementation). Ten DECs locked. Six phases defined.

2026-06-19/20: Phase A complete. lambertMultiRev() implemented (9fc8bc4); DEC-9 amended to both-branches API (fb33487); audited via 3-subagent-prior pattern (Dispatch 37, 6 findings); remediated (f888201 F4 / 5b26ba9 F1 / dcdeb1c F2 / 6d68b3b F3); externally validated dual-oracle (3560ff8, poliastro bulk + f64 boundary, DEC-9 target met all M at machine scale). Phase F math-audit obligation discharged early. Post-Phase-A amendments AMD-1..5 recorded (§5a).
2026-06-20: Phase B Part 1 complete. Porkchop worker + grid-compute (AMD-1 contract, Earth-from-init, validated Lambert convention) committed 916417e; grid-compute optimization (255->148ms M=1, bit-identical vs validated) committed ee2af8d. §5a amendments AMD-6/7/8 recorded.

**2026-06-22: Phase B Part 2a — porkchop main-thread layer. Smoke gate passed, committed.**

Canvas renderer + viridis colormap + worker client landed in two atomic commits:
- `6c9bf34` feat(slice11): porkchop viridis colormap (0->30 km^2/s^2, clamp above 30)
- `f1ec5e7` feat(slice11): porkchop canvas renderer + worker client (Phase B Part 2a)

Math layer (porkchop.worker.ts, grid-compute.ts, core/lambert/) byte-untouched throughout — git diff against those paths empty at every gate. The renderer colors grid-compute output; it computes no trajectories.

Value-check resolution (verify-before-lock applied to the smoke gate). A deterministic debug aid (smoke-only; the porkchop-smoke mount is untracked and removed at the Phase D dedicated route) auto-pinned the Apophis M=1 validated target. Sequence:
1. Nearest-grid-cell C3 read 1939.48 vs expected 1781.29 — a grid-resolution artifact, not a pipeline error. The validated point falls between grid columns (~25.7 days/cell); nearest cell was ~5.5 days off in departure, and C3 has a steep departure gradient near the window. Nearest-cell-vs-exact-point was a wrong acceptance criterion.
2. Exact-coordinate C3 through the identical Earth/Lambert path reproduces 1781.2916629949357 to machine precision. The 1.63e-5 residual first seen was a rounded-depJD artifact: criterion used 2461175.5 (UTC-style JD); reference case uses 2461175.500800741 (TDB JD), a 69.184 s (= TT-UTC) offset. Feeding identical departureTdbSeconds (832075269.1840142) + tofSeconds (94672800) yields an exact match, branch 1 (right). Renderer carries the validated numbers bit-faithfully.

Provenance note (artifacts kept distinct): the reference 1781.2916629949357 is the grid-compute round-trip case in src/v2/porkchop/grid-compute.test.mjs, NOT a poliastro dual-oracle row. External poliastro cross-checks are separate and prior: bf177dd (pre-research porkchop grid, 3 bodies, 3.43e-14) and Phase A's solver dual-oracle (3.6e-12). The 2a smoke check establishes renderer<->grid-compute fidelity, not a new external result.

Gate checks: tsc --noEmit clean; colormap.test 2/2; grid-compute.test 5/5; Lambert suite 10/10.

Carried forward (neither a 2a blocker; before Phase D dedicated route):
- OQ-2a-1 (lineage): prove production grid-compute.ts is the same path as the bf177dd poliastro-validated grid (one node-aligned cell, bit-identical through grid-compute vs direct lambertMultiRev), so the chain poliastro -> grid-compute -> renderer is on record by lineage, not assertion.
- OQ-2a-2 (time system): pin the porkchop departure-axis time system (UTC vs TDB) as a documented choice. Invisible at 200x100 resolution; the 69.184 s offset is its visible tip.

**2026-06-22: Phase B Part 2b/2c — porkchop interaction + overlay layer. Committed.**

Built the full interaction and overlay surface on the renderer, all in src/v2/porkchop/porkchop-view.ts, committed as one atomic unit (the features interleave in one file and were verified as a unit across five gates):
- `9629d9c` feat(slice11): porkchop hover tooltip, pin/hover markers, viridis legend, iso-C3 contour overlay (Phase B Part 2b/2c)

Math layer (porkchop.worker.ts, grid-compute.ts, core/lambert/) byte-untouched throughout — git diff against those paths empty at every one of five gates. Everything added reads the existing cells array; zero Lambert or worker recomputation.

What landed:
- Hover tooltip: pointermove reuses getCellAtCoordinates(...) — the identical lookup path as click — writing to a SEPARATE hoverCell state. Pin and hover are independent; hovering never disturbs the pinned selection. Verified: hover C3 matches click-pinned C3 on the same cell (the pixel->index mapping is sound).
- Canvas markers: persistent pin marker + transient hover marker, drawn as an overlay pass AFTER the heatmap blit (not baked into ImageData). Index->display-pixel mapping via getDisplayCoordinatesForIndices(...).
- Legend bar: real viridis gradient strip sampled from the same color path as the heatmap, ticks at 0 / 15 / 30 + ">30 clamp" marker, replacing the prior text-only label.
- Contour overlay (2c): marching-squares over cells' selectedBranch.c3 at LOCKED iso-levels [9, 12, 16, 20, 25] km^2/s^2. Toggle, default OFF so the base heatmap is always available un-obscured. Drawn above heatmap, below markers. Cells without a valid selected-branch C3 are skipped. Segments precomputed via useMemo from cells + gridParams.

Locked decision: contour iso-levels are [9, 12, 16, 20, 25] km^2/s^2 — chosen inside the 0->30 colormap range, spacing the feasibility belly readably, 9 near the practical low-C3 floor. Not user-tunable in this slice.

Verification: each of five gates (hover, markers, legend, contour, and the hover<->click C3 match) verified in the smoke page before the next chained. tsc --noEmit clean; math diff empty at every gate.

Smoke-only code (validatedTarget prop, auto-pin, "Pin validated cell" button, expected-C3 line, smoke header) was NOT touched and ships nowhere — it stays in the untracked smoke mount, removed wholesale at the Phase D dedicated route.

Phase B status: the porkchop renderer + its full interaction/overlay layer are complete. Remaining Phase B/C/D/E work per §6: overlay modal surface, dedicated route, light M=1 sampling extension, audit + deploy.

**2026-06-25: Phase C — overlay modal surface. Committed.**

The porkchop now opens as a modal from the catalog list, reusing the validated renderer. Built across DEC-locked architecture (DECs 11C-1..5) with the Earth-source question resolved by measurement. Commits:
- `197adfd` refactor(slice11): move long Earth fixture to production data path (src/v2/data/)
- `131138d` feat(slice11): overlay-scoped porkchop client lifecycle — create-once after catalog load, dispose-once on teardown with async-race guard (DEC-11C-2)
- `d0aa1d7` feat(slice11): Phase C overlay modal — row trigger + PorkchopView modal with ESC/backdrop/× dismiss (DEC-11C-1/3/4)

Architecture (all DECs in §5 Phase C subsection):
- Worker client is OVERLAY-SCOPED (DEC-11C-2): created once in mountPhaseCOverlay after ensureCatalogLoaded, disposed once on teardown. The async create chain (loadPorkchopEarthStateSeries → createPorkchopClient) is guarded against the teardown-before-resolve race via a porkchopClientDisposed flag — if teardown fires mid-load, the resolving client self-disposes rather than leaking a worker. The modal never creates/disposes the client.
- Row trigger is a SEPARATE affordance (DEC-11C-1): an additive onOpenPorkchop callback prop threaded through renderRow, with a PC button inside the row. Row-body click (selectBody + requestFocus) is byte-unchanged — verified verbatim. OQ-11C-2 resolved: callback prop, not panel wrap.
- Modal mounts in the overlay Preact tree (DEC-11C-3) via the renderPopover pattern, closes via ESC + backdrop + × (ESC handler added; the prior popover lacked it).
- Modal data derived from catalogSignal.value (DEC-11C-4): bodyElements from catalog.asteroids[bodyId].elements, bodyLabel = name||designation, gridParams as a stable overlay constant matching the smoke-harness values, M=1. No new fetch.
- Overlap guard: the overlay client is wrapped in a tracked proxy that sets a busy signal around computeGrid; the modal trigger no-ops when the client isn't ready, a compute is in flight, or a modal is already open — and closing the modal before the worker responds keeps reopen blocked until the in-flight request settles.
- "Open detailed view" button present as a STUB; Phase D wires the dedicated route.

Earth-source decision (DEC-11C-5 + amendment): the Phase C Step-1 verification gate FALSIFIED the original "one Earth source app-wide" premise. Runtime's earthSeries (loadSolarSystemStatesBrowser) is the 90-day fixture (91 samples, 2026-05→07); the porkchop grid needs coverage to ~2045. Forcing runtime to the long fixture was measured at ~48x loader time (4.7ms→224ms) and ~67x retained heap (~15MB) across all inner-system bodies, for a scene with no demonstrated 15-year-scrub need. Decision updated to a documented two-span split: the porkchop loads its OWN long-span Earth fixture (same Horizons provenance, different window), moved from tests/fixtures/ to src/v2/data/ for production. The long-fixture path was already proven by OQ-11C-1 (C3 1781.2916629949357 at the Apophis M=1 validated cell), and re-verified after the move. The 3D scene's 90-day source is unchanged.

Verification: tsc --noEmit clean throughout; math layer (porkchop.worker.ts, grid-compute.ts, core/lambert) byte-untouched (diff empty); C3 re-verified after the fixture move; row-click handler confirmed verbatim; in-app modal smoke-tested (opens from row PC button, row-click still selects+focuses, ESC/backdrop/× close, reopen works).

Process note: this phase was the first run under conditional tripwires (run the phase to completion, stop only if a tripwire fires) rather than positional stop-gates. Steps 3–4 (row trigger + modal) ran continuously to a working modal with no tripwire firing.

Open item carried forward: the porkchop smoke render showed a high-C3 field (hover cell ~102 km²/s²) with feasibility only in scattered pockets — to be probed at Phase F visual verification (possible colormap/clamp inversion vs a genuinely sparse M=1 window set for the target). Not a Phase C blocker; the renderer is a separately-committed layer.

Remaining per §6: Phase D (dedicated route + ΔV stack), Phase E (M=1 sampling to 500 bodies), Phase F (visual verification + deploy; math audit discharged early per AMD-4).

**2026-06-26/27: Phase D (dedicated route + ΔV stack) + log-scale colormap. Committed.**

Phase D split into two units, both on the dedicated porkchop route:
- D1 — dedicated route scaffold: `e871297` feat(slice11): Phase D1 dedicated porkchop route — ?body= param, own client, PorkchopView mount. New vite entry (v2/porkchop/), parallels the solar-system route; reads ?body= via URLSearchParams, resolves against the catalog, builds its own Earth series + client from src/v2/data/ (the moved long fixture), mounts PorkchopView. Default body asteroid-99942 when ?body= absent; "body not found" state for unresolvable ids. Build verified (vite emits to docs/).
- D2 — ΔV stack (DEC-7): `0f5961d` feat(slice11): Phase D2 ΔV stack. Patched-conic injection from C3 ported into a v2 helper (src/v2/porkchop/delta-v.ts), NOT importing the tsc-excluded legacy src/physics/. Pinned-cell data reaches the page via an additive onPinnedCellChange callback from PorkchopView (DEC-6: stack is dedicated-view only — confirmed absent from the Phase C modal). Disclosed assumptions: 200 km circular LEO (rp=6578.137 km, μ=398600.4418), stationkeeping 150 m/s, 10% margin (INV-016c). Verified two-cell gate: C3=1781.29 → 35.83 km/s injection (finite, large, edge cell); C3=8.78 → 3.616 km/s (real-mission range — proves the formula physically correct). Smoke: pinned C3=32.16 → injection 4.599, total 28.516 km/s, internally consistent.

Colormap investigation + log-scale fix. The dedicated-route plot rendered ~77% flat yellow, initially suspected a bug. Four read-only diagnostic passes (verify-before-lock):
1. Suspected inverted colormap → traced C3=9 through colormap.ts: produced [54,95,139] dark blue. Colormap math correct. Hypothesis killed.
2. Suspected 'ok'-cell null-C3 fallback (line 63 paints C3_MAX yellow) → instrumented the Apophis M=1 200×100 grid: 0 ok-cells with null C3. Hypothesis killed.
3. Suspected c3 lost crossing the worker postMessage boundary → traced serialization: stripBranch preserves c3 intact; ran the live app and logged painter-side c3 = 69.46 (finite). Hypothesis killed.
4. Counted runtime C3 buckets: 15,352 of 20,000 cells genuinely have C3 > 30. The plot was CORRECT — Apophis M=1 mostly has high-C3 windows in this range. The "bug" was a display-RANGE problem, not a defect.

Resolution: the C3 distribution spans 3 orders of magnitude (medians ~109-154, p90 ~485-729 across Apophis/Bennu/Itokawa) — a linear colormap cannot resolve feasible belly + marginal band + tail. Switched to log-scale per the DEC-3 amendment (`b596f9f`): C3_MIN=1, C3_MAX=1000, contours 10/30/100/300, log-spaced labeled legend. Commits:
- `b596f9f` docs(slice11): amend DEC-3 — log-scale C3 colormap
- `ea5ea6e` feat(slice11): log-scale C3 colormap per DEC-3 amendment — MIN=1 MAX=1000, log legend, contours 10/30/100/300
- `5362e42` test(slice11): update colormap.test to log-scale anchors + Windows-safe tsc invocation

Result: yellow clamp 77% → 3.42%; dark feasible belly with structure visible across the field. Verification gate (monotonic, no NaN): C3=8.78→dark [52,98,139], C3=69.5→mid [61,171,121], C3=300→bright [142,210,80], C3>1000→clamp [253,231,37]. Math layer untouched throughout (display-only change).

Lesson recorded: the four-pass diagnosis prevented "fixing" a non-bug — each wrong hypothesis (inverted colormap, null fallback, worker-boundary drop) was killed by tracing real values rather than trusting the visual impression. The actual issue was an encoding choice, found only by counting the real distribution.

Carried to Phase F: the dedicated route header still shows leftover smoke copy ("Standalone Phase B smoke mount / worker compute Xms") — clean up before deploy. Plus visual verification + production deploy (math audit discharged per AMD-4).

Remaining per §6: Phase E (M=1 sampling to 500 bodies), Phase F (visual verification + deploy).
