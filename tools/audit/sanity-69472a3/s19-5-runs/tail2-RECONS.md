# S19.5 tail 2 - read-only recons (no code changed)

Repo state: branch s19-5-tail2 on main 1fce2fc + tail2 copy commits. All file:line refs are at that tree.

## R1 Margin (B1) - verdict: CONSISTENT-BUT-UNEXPLAINED (different quantities)

Two margin conventions render on the porkchop page, in two different panels:

| Panel | String (verbatim) | File:line | Formula | Multiplies | Mode |
|---|---|---|---|---|---|
| Mission cost card (stack grid) | `Margin (5% of deterministic maneuver ΔV; stationkeeping not margined)` | src/v2/app/porkchop/main.ts:878 (value 879) | marginMps = 0.05 * (rendezvous [+ departure]) - launch-vehicles.ts:59 DETERMINISTIC_MARGIN_FRACTION=0.05, :203-208 deterministicMarginMps; assembled main.ts:446-450 | rendezvous m/s, plus departure m/s in sample-return only. Stationkeeping (150 m/s) is NOT margined. Feeds deliveredMassKg (launch-vehicles.ts:282). | one-way: rendezvous only; sample-return: rendezvous + departure |
| Mission cost card, Assumptions & sources | `Margin policy: 5% on deterministic maneuver lines (ECSS-anchored); ...` | main.ts:902 | same constant | same | both |
| ΔV stack panel | `Margin (10% of full ΔV stack)` | main.ts:969 (value 970) | marginKmps = 0.10 * subtotal - delta-v.ts:6 DV_MARGIN_FRACTION=0.10, :47-48 | subtotal = injection + rendezvous + departure + stationkeeping (all four lines) | one-way: departure term is 0 (delta-v.ts:45); sample-return: included |
| ΔV stack panel, Assumptions line | `... ; 10% margin.` ("10% margin") | main.ts:991 | DV_MARGIN_FRACTION | as above | both |
| Compare page reference budget | (no margin string) | compare/main.ts:1072 | deterministicMarginMps(REFERENCE_RENDEZVOUS_MPS) = 5% | rendezvous only | one reference budget |

Spec: INV-016c (INVARIANTS.md:191) discloses "10% margin" for the vehicle-agnostic ΔV stack. DEC-13-6 (SLICE_13_FOUNDING.md:64) sets "ECSS-anchored margin replacing flat 10%: 5% on deterministic maneuver lines", for the delivered-mass budget (Δv_sc, which excludes injection per DEC-13-4).
Not a contradiction: the 5% applies to the spacecraft budget that prices delivered mass; the 10% applies to the physics-view total that includes injection. They multiply different sums. Caveat for Hudson: DEC-13-6's wording "replacing flat 10%" can be read as retiring 10% everywhere, yet the stack panel and INV-016c still say 10%. Nothing on the page says why two margins exist.

## R2 Injection (B2) - verdict: CONSISTENT

Plain English: "Injection" in the ΔV stack panel is the LEO-to-escape burn needed to reach the cell's C3. The stack panel is the vehicle-agnostic physics view: it counts injection in TOTAL. The Mission cost card prices delivered mass from payload-at-C3, where the launch vehicle already performed that injection, so the card's spacecraft budget excludes it ("not a spacecraft ΔV line"). The Assumptions line "no departure burn in one-way mode" is about the return/departure burn (sample-return only), not injection - a vocabulary collision ("departure" vs "injection"), not a model conflict.

Evidence:
- TOTAL: src/v2/porkchop/delta-v.ts:41 injectionKmps = injectionDvFromC3(c3); :47 subtotal = injection + rendezvous + departure + stationkeeping; :48-56 total = subtotal * (1 + 0.10). Rendered main.ts:946 (Total) and :955-956 (Injection line).
- Card: main.ts:436-437 comment "Injection is ABSENT by construction"; budget main.ts:446-453 has no injection; line 889-890 note "Launch vehicle provides injection to C3 = ... not a spacecraft ΔV line."
- Departure only for sample-return: delta-v.ts:45; main.ts:991 string.
- Spec: DEC-13-4 (SLICE_13_FOUNDING.md:62) "The LEO-injection line is EXCLUDED from Δv_sc ... The existing ΔV stack remains displayed as the vehicle-agnostic physics view; the card labels the split." INV-016c (INVARIANTS.md:191) / SLICE_11 D2 (SLICE_11_FOUNDING.md:452) define the stack with injection.
Suggested (not done): label the stack panel "includes injection; the cost card does not" - copy only, Hudson to rule.

## R3 Infeasible numbers (B3) - verdict: BY DESIGN (with one copy gap)

Code path (RED band): src/v2/app/porkchop/main.ts:773-789 renders the verdict headline "Not feasible at screening fidelity" and the sentence "...so no delivered-mass number is honest at screening fidelity." The card's delivered-mass row is suppressed: main.ts:884 `costCardState.band === 'RED' || deliveredKg === null ? '—'`. Dogleg row for RED: "exceeds site capability" (main.ts:874-875). The rest of the grid keeps its layout, dimmed (opacity 0.55, main.ts:833).
What still shows on RED, and why:
- "Payload at C3 ... 14,258 kg" (main.ts:847-855) is the vehicle's published capacity at the cell's C3 (payloadAtC3), not a delivered mass. The code comment at main.ts:773-775 says "layout stays stable, only headline + dogleg line change" (DEC-13-3 / D3).
- "Total ΔV" is in the separate ΔV stack panel, which INV-016d (amended, INVARIANTS.md:120) keeps as "unpriced physics".
Spec quote (DEC-13-3, SLICE_13_FOUNDING.md:61): "RED cells are marked 'not feasible at screening fidelity' - a badge, not a number - because the only honest RED price is IXPE-class capacity destruction". The refusal the spec requires is of a priced dogleg and a delivered-mass number; both are refused. It does not explicitly refuse the payload-at-C3 line or the physics-view total.
Copy gap: a reader sees "no delivered-mass number is honest" next to a kg figure. The payload line carries no "capacity at this C3, not deliverable on this cell" qualifier. Hudson may rule whether to hide or caption it.

## R4 Method badge (A9) - verdict: RENDERS (unconditional once data loads; at the page bottom)

MethodBadge is defined at src/v2/app/compare/main.ts:873 and rendered at :1286 as the LAST child of ComparePage, after the results table and any expanded grid rows. Condition: only `data !== null` (main.ts:1133-1139 returns the "Computing N departure grids..." placeholder while loading, with no badge). No selection-count condition, so it renders for a single body (?bodies=99942) the same as for several. While `echo` is null it omits the Grid/Feasibility/Segmentation lines but still renders. Opening line: "Method - single-revolution (M=0) Lambert patched-conic screen, the same solver the porkchop view uses." To see it: load /v2/compare/?bodies=99942, wait for the grid to finish, scroll past the single result row to the bottom bordered box. It is not a badge near the row, which is likely why the live gate missed it. W3b's PRESENT verdict is consistent with this. Existing test: tests/v2-compare-honesty.test.mjs (MethodBadge text).
