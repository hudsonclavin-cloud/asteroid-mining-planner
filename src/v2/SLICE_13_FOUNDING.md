# Slice 13 Founding Document — Mission Cost Card

**Status:** LOCKED 2026-07-02 — locked at Hudson's direction after data verification (all 40 vehicle anchors re-checked against elvperf screenshots)
**Author:** drafted by Nova (chat) from pre-research; locked by Hudson
**Prior slice:** Slice 12 (DLA launch-feasibility overlay — closed, deployed at 946afed)
**Next slice (planned):** Slice 14 (packaging / demo)

## §1. Slice intent

Slice 13 turns every porkchop cell into a mission you can price. Today a cell reports physics: C3, v-infinity, DLA, and a ΔV stack with a flat margin. This slice adds the decision half: pick a cell and a launch vehicle, and the mission cost card shows payload-at-C3 interpolated from officially sourced vehicle curves, the plane-change question actually priced into the stack when DLA demands it (paying the debt DEC-12-6 deferred), a margin policy upgraded from flat 10% to a citable ECSS-anchored split, and the headline number: delivered mass at the asteroid.

The vehicle data is the slice's foundation and it is fully primary-sourced: NASA Launch Services Program performance queries (elvperf.ksc.nasa.gov, page dated 2024-02-29), run manually on 2026-07-02 and committed as screenshot measurement artifacts. Eight vehicle configurations carry official anchor curves. Every number on the card traces to a source; every assumption is disclosed per the INV-016 family.

This slice does NOT touch the Lambert solver, the worker boundary (recon 3e confirmed zero worker changes needed — the per-branch payload already carries c3, vInfArr, dlaDeg), the propagators, or the NEA catalog. It adds one data module, pure math functions, and one sidebar card.

## §2. Inherited invariants

- INV-016, INV-016c operative and unchanged.
- **INV-016d — AMENDED BY THIS SLICE.** Clause (iii) currently reads that dogleg/plane-change costs are "advisory and NOT included in the displayed ΔV stack." Slice 13's purpose makes that clause false. The amendment is made by marking (per slice-discipline: no silent rewrite), in the SAME commit that lands dogleg pricing, together with the two shipped advisory strings (view.ts:974, main.ts:291). Three artifacts, one commit — otherwise the honesty layer contradicts the stack.
- INV-021 (frame-by-measurement) operative. Not newly exercised: the card consumes dlaDeg and vInfArr magnitudes already established under it.
- INV-020-class guard invariants: the M-A residual closure (non-finite guards on dlaDegFromVInf / stripBranch) is a pre-slice dependency; if not yet landed when Phase A starts, Phase A absorbs it as its first commit.

## §3. Architectural invariants new in this slice

- **INV-022 (sourced vehicle data):** Every launch-vehicle anchor point carries provenance — source, as-of date, official-published vs estimated — as a comment adjacent to the number. No anchor enters the data module without a source. Rationale: mirrors the LaunchSite pattern that survived the Slice 12 audit; adding a vehicle later is data, not code.
- **INV-023 (no extrapolation):** Payload is computed only by interpolation between published anchors. A cell whose C3 exceeds a vehicle's last anchor yields an explicit "beyond published curve" state, never an extrapolated number. Rationale: extrapolated payload under a credibility headline is exactly the fake precision the tool exists to avoid.
- **INV-016e (cost-card honesty):** The mission cost card discloses, in a discoverable surface: (i) vehicle curve source and as-of date, (ii) interpolation method, (iii) the screening Isp assumption and mission mode, (iv) the margin policy, (v) the dogleg cost regime applied to the cell. Same disclosure pattern as INV-016c/d.

## §4. Open Questions (OQs)

**OQ-13-1 — Mission mode: one-way rendezvous, sample-return, or a toggle? STATUS: CLOSED 2026-07-02 — resolved at lock: two-state toggle, default one-way rendezvous; departure line conditional on sample-return mode; mode disclosed per INV-016e(iii).**
Recon 3e (Q1) settled what shipped: the departure ΔV line (= v∞_arr) is always-on (delta-v.ts:30-42), so the current stack total is a sample-return model — the handoff's four-line description was wrong. The delivered-mass headline forces the choice: the two modes differ by an entire exp(v∞_arr-term) factor. PROPOSAL: a two-state toggle, default one-way rendezvous (matches NASA Trajectory Browser's "rendezvous" mission type for NEA screening); the departure line becomes conditional; mode disclosed per INV-016e(iii).

**OQ-13-2 — AMBER plane-matching cost model: what does an AMBER cell pay? STATUS: CLOSED 2026-07-02 — resolved at lock: option (a), zero added cost within site capability, with an explicit INV-016e(v) disclosure that plane-matching cost is launch-geometry class (~m/s-per-degree, DESCANSO evidence) and below screening error bars; an unsourced flat derate was rejected as fake precision.**
Evidence (3d verification record, two-regime synthesis): plane-matching via launch geometry costs ~1 m/s-per-degree class (JPL DESCANSO Vol. 12 Ch. 6: 21-day lunar launch period from 28.5° LEO ≈ 71.7 ± 29.7 m/s total); brute-force ascent doglegs cost ~93% of capacity at 28° (IXPE, corrected figure). elvperf's High Energy query takes no DLA input (measured 2026-07-02), so no official per-declination calibration exists. Options: (a) zero added cost within site capability + explicit disclosure that plane-matching cost is below screening error bars; (b) a flat disclosed derate (e.g. 3–5% payload); (c) an azimuth/rotation-loss model. DRAFT RECOMMENDATION: (a) — option (b) is a number without a source, which violates the house style more than a disclosed approximation does. Hudson locks.

**OQ-13-3 — Which high-inclination NEA is the showcase body? STATUS: CLOSED 2026-07-03 — resolved by measured recon: 2020 FK3 default, Apophis one click away.**
Slice 12's overlay barely moves decisions on Apophis (low-i). Closure plan: a cheap read-only scan (Codex or Claude Code) over the catalog measuring max |DLA| across each body's windows; pick the body where DLA + dogleg honesty visibly kills cheap-looking cells. Phase E wires it. Also the Slice 14 demo shot.
Resolution (measured recon, 41,866/41,906 bodies, two-stage funnel — coarse 100×50 full catalog, finalists at production 200×100; report: `aster-audit-reports/slice13-showcase-recon.md`): winner **2020 FK3** — its globally cheapest cell (C3 = 0.72 km²/s², departure 2026-12-26, TOF 465 d) is **RED at DLA +82.4°**, so the naive best deal in the grid is infeasible: maximal honesty-layer drama, clean grid health (58% converged, no caveats). Default body set to `asteroid-2020 FK3` (id verbatim from the catalog key, embedded space); Apophis (99942) kept one click away via a symmetric compare link (Hudson's option-3 call: drama + credibility, not either/or). Catalog-wide finding: 11.1% of NEAs (4,641) have a RED cheapest window. The closure plan's max-|DLA| metric was superseded by the drama metric (band at the cheapest window, RED-in-cheap-half); the prior smoke-test body 10302 ranked 17,430/41,866 (GREEN at its cheapest cell) and is not the showcase.

**OQ-13-4 — Include Falcon 9 RTLS? STATUS: CLOSED 2026-07-02 — resolved at lock: both F9 configs included; official LSP data, and short curves are honest (they show where the vehicle dies).**
F9 appears in elvperf with official data (reversing the pre-elvperf lean to drop it): ASDS 3,310 / 2,220 kg and RTLS 1,770 / 875 kg at C3 = 0 / 10, both absent by C3=20. PROPOSAL: include both configs — the data is official and a short curve is honest (it shows where the vehicle dies, which is informative in a screening tool).

**OQ-13-5 — Interpolation oracle: what validates the curves? STATUS: SCOPING — closeable pre-lock or in Phase B.**
Protocol (DEC-13-7): four held-out elvperf queries at C3 = 15, 25, 35, 50; compare piecewise-linear interpolated payload per vehicle against the tool's own output; commit max/RMS relative error as the measurement artifact. Hudson can run the four queries pre-lock (≈5 minutes) to close this the strong way.

## §5. Locked DECs (locked 2026-07-02)

- **DEC-13-1 (LOCKED 2026-07-02) — Vehicles are sourced data, not code.** New module `src/v2/porkchop/launch-vehicles.ts` (sibling of feasibility.ts's consumers; NOT under core/lambert, per Slice 12 audit L-3), exporting `LaunchVehicle { name, config, site, fairingM, curve: [{c3, payloadKg}], source, asOf }`. Data (NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02; payload kg at C3 = 0/10/20/30/40/55 km²/s²):
  - Falcon Heavy Expendable (KSC, 5.2 m): 15,010 / 12,345 / 10,115 / 8,225 / 6,640 / 4,670
  - Falcon Heavy Recovery (KSC, 5.2 m): 6,690 / 5,130 / 3,845 / 2,740 / 1,805 / 650
  - Vulcan VC2 (CCSFS, 5.4 m): 5,920 / 4,750 / 3,710 / 2,790 / 1,970 / 945
  - Vulcan VC4 (CCSFS, 5.4 m): 8,550 / 7,140 / 5,880 / 4,780 / 3,800 / 2,555
  - Vulcan VC6 (CCSFS, 5.4 m): 10,850 / 9,130 / 7,630 / 6,310 / 5,150 / 3,685
  - New Glenn (CCSFS, 7 m): 7,180 / 4,930 / 2,365 / 120 / — / —
  - Falcon 9 FT ASDS (CCSFS, 5.2 m): 3,310 / 2,220 / — / — / — / —  [per OQ-13-4]
  - Falcon 9 FT RTLS (CCSFS, 5.2 m): 1,770 / 875 / — / — / — / —  [per OQ-13-4]
  - Vulcan VC0 EXCLUDED: single anchor (2,100 @ C3=0), cannot interpolate.
  Provenance notes carried per INV-022: config labels are LSP's (no Centaur RL10 version stated — disclosed as "LSP, as of Feb 2024"); FH quoted from KSC, others CCSFS; two prior research-PDF anchors corrected by the primary source (FH-Exp C3=55: 4,670 not 4,690; FH-Rec C3=55: 650 not 660).
- **DEC-13-2 (LOCKED 2026-07-02) — Piecewise-linear interpolation in C3**, pure function, no extrapolation (INV-023). Beyond-curve returns a typed state, not a number. Below C3=0 cannot occur (C3 ≥ 0 by construction in the grid).
- **DEC-13-3 (LOCKED 2026-07-02) — Two-regime dogleg model** (cites 3d verification record): GREEN cells pay nothing; AMBER cells pay per OQ-13-2's resolution, disclosed; RED cells are marked "not feasible at screening fidelity" — a badge, not a number — because the only honest RED price is IXPE-class capacity destruction, and a precise-looking 2v·sin(Δi/2) charge at LEO speed would misprice the AMBER regime by ~3 orders of magnitude. INV-016d(iii) amendment + view.ts:974 + main.ts:291 change in the same commit as this pricing.
- **DEC-13-4 (LOCKED 2026-07-02) — Delivered-mass computation and the double-count guard.** m_delivered = m_LV(C3_cell) × exp(−Δv_sc / (g₀ · Isp)), where Δv_sc = rendezvous (= |v∞_arr|) + stationkeeping (150 m/s) + departure (iff sample-return mode, per OQ-13-1) + margin (DEC-13-6). The LEO-injection line is EXCLUDED from Δv_sc: when pricing with a vehicle, injection is embodied in payload-at-C3 — the rocket already did it. The existing ΔV stack remains displayed as the vehicle-agnostic physics view; the card labels the split ("launch vehicle provides injection to C3"). Charging injection to the spacecraft on top of payload-at-C3 is the slice's #1 correctness hazard and the Phase F audit's first look.
- **DEC-13-5 (LOCKED 2026-07-02) — Screening Isp 320 s**, storable bipropellant, disclosed as representative of the 300–350 s class (3d item 13 disposition). No dry-mass-fraction modeling: delivered mass is arrival wet mass, disclosed per INV-016e(iii). SEP stays out (Query-3 §9 deferral stands).
- **DEC-13-6 (LOCKED 2026-07-02) — ECSS-anchored margin** replacing flat 10%: 5% on deterministic maneuver lines (rendezvous, departure); the 150 m/s stationkeeping line kept as the generic allocation consistent with ECSS's 100%-provisioning philosophy for generic budgets (3d item 12, CONFIRMED — the one margin convention we can cite). Disclosed per INV-016e(iv). AIAA S-120 / GSFC cited qualitatively only (3d item 11 unverified at clause level).
- **DEC-13-7 (LOCKED 2026-07-02) — Oracle:** held-out elvperf comparison per OQ-13-5's protocol; tolerance bar max relative error ≤ 5%, tightened to the measured value in the artifact; sign of the error recorded (linear interpolation on these convex-looking curves has a systematic direction — measure it, don't assert it).
- **DEC-13-8 (LOCKED 2026-07-02) — UI placement:** vehicle picker mirrors selectedLaunchSite (main.ts:118) line-for-line; the cost card is a new sidebar section siblinging the ΔV-stack section; disclosure div reuses the INV-016c/d literal style (recon Q4); the L-4 hooks-after-early-returns hoist lands as Phase A's first commit, before any new state (recon Q5 flag).
- **DEC-13-9 (LOCKED 2026-07-02) — Vehicle set** = the eight configs of DEC-13-1, subject to OQ-13-4.

## §6. Phase breakdown

- **Phase A — substrate.** L-4 hoist (own commit); M-A guard closure if not already landed; `launch-vehicles.ts` data module; interpolation + delivered-mass pure functions with unit tests. ~3 dispatches. STOP gates before math commits.
- **Phase B — oracle.** Hudson runs 4 held-out elvperf queries; probe compares; artifact committed; OQ-13-5 closes. 1 dispatch.
- **Phase C — card UI.** Vehicle picker, cost card section, INV-016e disclosures. Visual STOP gate (browser). ~2 dispatches.
- **Phase D — dogleg + mode.** Two-regime pricing, INV-016d amendment + both advisory strings (single commit), mission-mode toggle per OQ-13-1. STOP gate. ~2 dispatches.
- **Phase E — showcase.** OQ-13-3 catalog scan; wire the high-inclination demo body. 1–2 dispatches.
- **Phase F — audit + deploy.** Three-lens audit (multi-agent-audit skill; first look: DEC-13-4's double-count guard), remediation, production build, deploy, close.

## §7. Out of scope

Finite-burn / gravity-loss simulation; SEP low-thrust trajectories (Query-3 §9); cost in dollars (Slice 17 territory); multi-vehicle optimization (user picks, card prices); extrapolation beyond published anchors (INV-023); dry-mass / subsystem modeling; launch-date-dependent vehicle availability or retirement; additional launch sites.

## §8. Engineering record (running log)

- 2026-07-02 — Pre-research corpus: 3a/3b/3c literature (PDF), recon 3e report (aster-audit-reports/slice13-recon-3e.md), 3d verification record, elvperf measurement screenshots (C3 = 0/10/20/30/40/55). Ingestion commit pending.
- 2026-07-02 — Contradiction logged at draft time: the Slice 13 handoff described the shipped ΔV stack as four lines; recon Q1 measured five — the departure line (= v∞_arr) is always-on at delta-v.ts:30-42. DEC-7 is what shipped; the handoff was wrong. Consequence promoted to OQ-13-1.
- 2026-07-02 — Orbit-regime mislabel caught in verification: a research pass reported ULA's GTO column (VC2 8,300 / VC4 11,600 / VC6 14,400 kg) as "C3≈20" values. Refuted against ULA's published table (GTO is C3 ≈ −16; TMI = C3 +20 gives 3,600 / 6,000 / 7,600). Recorded as this slice's canonical inverted premise.
- 2026-07-02 — IXPE conflation corrected: research PDF reported post-dogleg capacity as ≈330 kg; Spaceflight Now primary says capacity was "a little more than a ton" with ASDS reserve — 330 kg was IXPE's spacecraft mass. Corrected anchor: 28° dogleg ≈ 14 t → ~1 t.
- 2026-07-02 — Perplexity claim that elvperf is not publicly accessible: refuted; tool is public, interactive-only (page dated 2024-02-29). Search-based verification residue converted to manual primary-source queries.
- 2026-07-02 — Primary source corrected two research-PDF anchors at C3=55 (FH-Exp 4,670; FH-Rec 650) and supplied the full VC4 curve and both F9 configs the literature pass lacked.
- 2026-07-02 — elvperf High Energy query confirmed to take no DLA input; the AMBER cost model is therefore ours and disclosed, not NASA-calibrated (feeds OQ-13-2).
- 2026-07-02 — Recon SURPRISES(2) imprecision ("index missing rows" vs "entries never ported") caught by dispatch tripwire (c); entries ported at 95b0bd4, STATUS refreshed at 42c726d.

- 2026-07-02 — LOCKED. All 40 DEC-13-1 anchors re-verified against the elvperf screenshots at the lock gate (exact match, including inter-vehicle ordering crossovers). OQ-13-1 (toggle, one-way default), OQ-13-2 (option a, disclosed), OQ-13-4 (both F9 configs) resolved at lock. OQ-13-3 and OQ-13-5 remain SCOPING with in-doc closure plans (Phases E and B). Ingestion commits follow this lock.
- 2026-07-03 — OQ-13-3 CLOSED by showcase recon (2020 FK3 default, Apophis comparison link). The recon also corrected a dispatch-context error: the default body was asteroid-99942, not 10302 (10302 was the smoke-test body); 10302 ranked 17,430/41,866 and is not the showcase.
- 2026-07-03 — OQ-13-5 CLOSED by the Phase B oracle (`808e709`): held-out elvperf comparison STRICT PASS, max relative error 1.18% (RMS 0.55%); New Glenn steep-segment optimism +3.11% measured and disclosed on-card (DEC-13-7).
- 2026-07-03 — **DEC-13-1 anchor-count correction (annotation, original text preserved):** the lock note above and the status line say "all 40 vehicle anchors." The correct count is **38 shipped anchors + 1 excluded config (VC0, single anchor, cannot interpolate) = 39**; the "40" was an arithmetic slip at the lock gate. Source: the DEC-13-1 vehicle list — FH-Exp/Rec + VC2/VC4/VC6 = 5×6 = 30, NG = 4, F9 ASDS/RTLS = 2×2 = 4; 30+4+4 = 38 shipped. Every one of the 38 was verified digit-for-digit against elvperf; the count, not the data, was wrong.
- 2026-07-03 — **Null-band (fourth) display state named:** cells with no DLA value (feasibility null; reachable only at C3 < ~1e-6 km²/s², practically absent from the grid) price with zero dogleg and a "null-band" disclosure. DEC-13-3 defines only GREEN/AMBER/RED; the null-band state is honestly disclosed on-card and acknowledged here rather than folded silently into GREEN. A formal DEC naming is deferred to the next amendment (audit L-h).
- 2026-07-03 — **Phase F pre-deploy audit gates CLOSED** (report: `aster-audit-reports/slice13-phaseF-audit.md`; 3-lens, math bit-exact, containment CLEAN, no HIGH). MED-1 (surface-neutral RED advisory — shared readout renders on cardless surfaces) closed at `5d386ec`. MED-2 (input-hardening: INVALID_INPUT sentinel for corrupted budgets, memo finiteness guards, negative-ΔV rejection, hostile-input tests) closed at `8ab94cf` — which also **fulfills the §2 pre-slice dependency**: the Slice 12 M-A residual finiteness guards on `dlaDegFromVInf` and `stripBranch` are now landed (donor pattern from `classifyFeasibility`). The 10 audit LOWs closed by copy/docs pass in this commit; two LOWs (L-b single-source margin/stationkeeping constants, L-i sentinel-in-state / `!`-assertion / inlined-identity structure trio) are structural and split to a separate follow-up dispatch, recorded here.
- 2026-07-03 — **SLICE CLOSED.** DECs 13-1…13-9 delivered; OQ-13-1/2/3/4/5 all resolved; Phase F audit clean and remediated; deployed at `<pending deploy commit>`. Live: mission cost card with sourced vehicle curves, two-regime dogleg pricing, mission-mode toggle, delivered-mass headline; showcase body 2020 FK3.

## Lock record

Locked 2026-07-02 by Hudson (this chat, data-verification gate passed). DECs 13-1 … 13-9 locked as written. From this point, revisions are tracked amendments, not edits.
