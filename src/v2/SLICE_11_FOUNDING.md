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

---

## §5. Locked DECs

**DEC-1: Visualization surfaces — overlay + dedicated, shared renderer.**
- Overlay modal opens from catalog list row click, dismissible via ESC/X/backdrop
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

**DEC-10: Light M=1 sampling extension (Phase E).**
- Extend Measurement 2's 100-body sample to 500 bodies stratified by orbit class
- Same RNG seed (11) means original 100 are subset of new 500 (reproducibility)
- Output: `tools/slice11-research/data/multi-rev-worth-it-500.json`
- Closes OQ-2 definitively; informs Slice 11.5 go/no-go

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
