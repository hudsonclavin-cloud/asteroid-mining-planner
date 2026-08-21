# SLICE 17 FOUNDING DOCUMENT — Target Compare + Viewer QOL
# STATUS: LOCKED rev B (2026-08-04). ADDITIVE-ONLY from this commit forward:
# never delete a DEC, invariant, finding, or history line; mark amendments as
# dated entries in §8; prove additivity with `git diff <file> | grep '^-'`.
# 2026-08-04 · drafted by Nova (Fable/Opus) from Hudson's rulings and the
# committed measurement record.
#
# rev B supersedes the uncommitted rev A draft in full (rev A never entered
# git; this is a clean write, not an amendment). Changes: all four
# PROVISIONAL parameters LOCKED from measurement · DEC-17-2 gains span and
# reconciliation clauses · new DEC-17-10 (bounds validation) · DEC-17-4
# copy blocks UNBLOCKED by V6/V7 · findings F1–F4 recorded · a superseded
# analytical hypothesis recorded in §11.
#
# Evidence base (all committed):
#   S17_PRERESEARCH_TRIAGE.md · recon/S17_RECON_REPORT.md
#     (S-S17-RECON-2026-08-03-A, HEAD c6c0c52)
#   data/s17-cache-live-structure.json    [S-S17-MEASURE-2026-08-04-D] d8dffd0
#   data/s17-structure-7day.json          [S-S17-MEASURE-2026-08-04-E] 806745c
#   strategy/SLICE21_QOL_BACKLOG_TRIAGED.md
#   literature/V6_H_TO_DIAMETER_VERIFIED.md   [S-RESEARCH-SWEEP-2026-08-04-A] efd6409
#   literature/V7_CONDITION_CODE_VERIFIED.md  [S-RESEARCH-SWEEP-2026-08-04-A] efd6409
#   literature/PERPLEXITY_V6_*/V7_* (prompts) [S-RESEARCH-SWEEP-2026-08-04-A] aebca4a
#   Read-only diagnostics: S-S17-MEASURE-DIAG-2026-08-04-B,
#     S-S17-EPHEM-COVERAGE-2026-08-04-C (not committed; findings in §11)

═══════════════════════════════════════════════════════════════════════════
§0. STATUS & PROVENANCE
═══════════════════════════════════════════════════════════════════════════
M10 = A (2026-08-04): Target Compare owns Slice 17. Supersedes any prior
use of "Slice 17" for economic-feasibility ranking (§10).

Every number in this document is one of: repo-verified (file:line cited),
house-measured (artifact + commit cited), or primary-source-verified (V6/V7
citation). No number here rests on a research lead. Research content
remains LEADS until a named verification pass clears it.

═══════════════════════════════════════════════════════════════════════════
§1. MISSION & THESIS
═══════════════════════════════════════════════════════════════════════════
Ship /v2/compare/: select up to 5 asteroids and compare them as mission
targets on structure-aware numbers — distinct launch opportunities and
window breadth, not minimum-only ranking — with every number carrying its
method, resolution, and provenance. Simultaneously convert the 3D viewer's
hidden capability into visible capability (full QOL backlog), because a
credibility artifact must survive its first sixty seconds.

The thesis is not abstract. Body 163693 (Atira) is in our five-body
measurement sample. It has the second-best minimum C3 of the five
(6.756 km²/s²) and, at 7-day departure resolution, **zero components wider
than a single departure cell at Δ=2 and Δ=5** — no practical launch window
at all. Rank on minimum alone and Atira looks like a top target. That is
the documented comparison failure (S17-Q2, ARRM precedent), demonstrated in
our own data, and fixing it is what this slice is for.

Two fronts, separate gates:
- FRONT A — Target Compare. Math-layer (window extraction) → full
  multi-agent audit before deploy. Assembly elsewhere (recon Q10).
- FRONT B — Viewer QOL, full backlog. UI-layer, visual gates, no math
  audit. Phased with an explicit cut line (§5).

═══════════════════════════════════════════════════════════════════════════
§2. SCOPE
═══════════════════════════════════════════════════════════════════════════
IN (Front A): multi-select (cap 5) · live 731×100 grid per selected body ·
sublevel-set window extraction (new math) · compare table (§DEC-17-4) ·
small-multiple porkchop thumbnails from the same grids · dominance badge ·
method badge + provenance surface incl. 25 km²/s² disclosure ·
two-threshold opportunity model with toggles · fixture-bounds validation ·
shareable ?bodies= URL · /v2/compare/ entry.

IN (Front B): SLICE21_QOL_BACKLOG_TRIAGED.md in full — Tiers 1–4 plus the
Clome small-fix sweep — under its corrections C1–C3, phased B0–B5 (§5).

OUT (both fronts):
- Element-only accessibility proxies (Benner / Shoemaker-Helin) — triage
  §2.1; V5 deferred indefinitely.
- Composite/weighted scoring, interactive weight sliders — Slice 19
  territory (triage T1). Deferral is a decision, not an omission.
- Any NHATS number displayed verbatim — pattern adopted, numbers never
  (triage §2.4); V8 dormant.
- Catalog regeneration — recon Q7 confirms every needed field present.
- MCP exposure of compare/window tools — the math lands MCP-ready (pure,
  injected deps) but no tool ships here.
- True porkchop refinement (continuous optimization near minima) —
  screening fidelity only; the method badge says so.
- Fixing the cache/view span mismatch or the precompute path break (F2/F4,
  §11) — recorded, deliberately not absorbed. Separate work.

═══════════════════════════════════════════════════════════════════════════
§3. DECISIONS
═══════════════════════════════════════════════════════════════════════════
DEC-17-1  Window extraction = live-grid sublevel-set segmentation. LOCKED
  (Hudson 2026-08-04; option b).
  An "opportunity" is a connected component of grid cells where the
  selected branch is converged AND its c3 ≤ T (threshold per DEC-17-8).
  Non-converged cells are holes: excluded from membership, may split
  components. Ties at T inclusive (c3 ≤ T).
  Per component: min c3 · argmin (departure date, tofDays) · breadth =
  departure-date span in DEPARTURE CELLS (day-value derived, never quoted
  at finer precision than the cell) · cell count · TOF span. Sorted by
  min c3.
  CONNECTIVITY = 8. LOCKED from measurement (806745c): 8-connectivity
  produces materially fewer spurious splits than 4 at every body and
  threshold, and collapses single-cell components — 99942 at Δ=5 has 7
  singletons under conn4 vs 3 under conn8; 433 has zero conn8 singletons at
  every threshold. 4-connectivity splits diagonally-adjacent cells of one
  basin.
  NO separate minimum-component-size rule. B_min (DEC-17-8) already
  excludes single-cell components from ranking, so a second noise filter
  would be redundant machinery. Recorded deliberately.
  Rationale: breadth is unrecoverable from cached bestWindows (top-5-by-C3
  discards the surface; recon Q5 verbatim); 433's record proves clustering;
  recon Q5 explicitly scoped this as math-layer work. Segmentation over
  8-neighbor minima detection: yields count AND breadth in one bounded
  auditable pass; minima detection is noise-brittle and yields no breadth.
  Consequence: new core-math module → multi-agent audit (gate G-A2) before
  any UI consumes it.

DEC-17-2  Source of truth = live grid, view-span-matched. LOCKED.
  Every compare-view number comes from a live grid over the SAME departure
  window the porkchop view uses: 2026-01-01 → 2040-01-01
  (main.ts:180). Consistency with the porkchop the user opens next holds by
  construction. Thumbnails are visual downsamples of the SAME per-body
  result — one computation, one answer.
  RESOLUTION: nDep 731, nTof 100 → departure cell 7.004109589041096 d, TOF
  cell 16.603535353535353 d (measured, 806745c). 731 columns matches the
  screening cache's 7-day departure spacing; measured serial cost for five
  bodies is 1431.52 ms on Hudson's M1 (median 243.42 ms/body), inside the
  ~2 s budget. The view's own 200-column grid is NOT used for compare —
  at 25.69 d/cell it returns systematically worse minima (rev D, d8dffd0:
  live above cached on all five bodies, up to +1.256 km²/s²).
  SPAN CLAUSE: the screening cache covers 2026-01-01 → 2040-12-31 — eleven
  months LONGER than the view's departure window. A cached minimum falling
  in that tail is invisible to both the porkchop and the compare view.
  Measured incidence in the five-body sample: 0 bodies (both passes). The
  compare view must flag any such row rather than silently disagree; the
  underlying mismatch is F2 (§11), not fixed here.
  RECONCILIATION COPY: residual live-vs-cached differences on three bodies
  (+0.0126, +0.0153, +0.0137 km²/s²; 0.9–2.5% of each minC3) are SAMPLING
  PHASE, not error — the 7.0041 d live spacing drifts ~3 days against the
  cache's exact 7.000 d over 730 steps, so the grids sample different
  points. Copy says "sampling phase," never "error" or "disagreement."
  Two bodies came out BETTER than cached (99942 −0.00015; 163693 −0.4353,
  a 6.05% improvement at 2563 days from the cached argmin) — the cache's
  30-day TOF spacing is the limiting factor. See F3 (§11): the catalog
  currently overstates difficulty for some bodies.

DEC-17-3  Ranking = transparent single metric + dominance badge; no
  composite. LOCKED (Hudson 2026-08-04).
  Default sort: BEST PRACTICAL WINDOW C3 = min c3 among opportunities with
  breadth ≥ B_min, at the active segmentation threshold.
  NO-PRACTICAL-WINDOW STATE (required, not optional): a body with no
  qualifying opportunity displays "no practical window at Δ=5" — never a
  number, never a blank. 163693 hits this immediately in our sample and it
  is the correct answer for that body. A row in this state sorts last and
  is never ranked by its global minimum.
  Global minimum displays subordinate, labeled "global minimum (731×100
  grid)" — NHATS two-tier presentation pattern, numbers ours (triage §2.4).
  Per-row dominance badge: dominated / nondominated / insufficient-data, at
  N≤5, over {best practical window C3 (lower better), max window breadth
  cells (higher better), delivered mass @ selected vehicle (higher
  better)}. Metric-set finalization = OQ-17-3.
  User-weighted ranking + sensitivity: DEFERRED to Slice 19, by decision.

DEC-17-4  Column set. LOCKED. Both former copy blocks UNBLOCKED by V6/V7.
  Headline: best practical window C3 (+ date, TOF) · distinct-opportunity
  count at active Δ · max window breadth (cells, day-value derived) ·
  delivered mass @ selected vehicle · global min C3 (subordinate, labeled).
  Context: H · size range · orbit class · a / e / i.
    SIZE RANGE — UNBLOCKED (V6, primary sources). D(km) = (1329/√p_V) ×
    10^(−H/5); K = 1329 km (Fowler & Chillemi 1992; corroborated by JPL
    CNEOS log form 10^3.1236 = 1329.23 and by Pravec & Harris 2007's
    derivation K ≡ 2 AU × 10^(V_sun/5) = 1329 ± 10 km). Albedo classes
    (Mainzer et al. 2011, ApJ 741, 90 — which explicitly endorses this use):
    C-complex p_V = 0.053, S-complex 0.166, X-complex 0.07–>0.6. NEA default
    when taxonomy unknown p_V = 0.14 ± 0.02 (Stuart & Binzel 2004).
    Copy MUST state the uncertainty: factor ≈1.77 between C and S medians,
    ≈2.93 across the unconstrained X range. Displaying a single diameter
    without that factor is an overclaim.
  Quality: condition code U displayed RAW + qualitative label + the MPC
  warning line · dataArcDays · nObsUsed · sigmaA / sigmaE.
    U COPY — UNBLOCKED (V7, MPC primary). Bands (arcsec/decade runoff):
    0 <1.0 · 1 <4.4 · 2 <19.6 · 3 <86.5 · 4 <382 · 5 <1692 · 6 <7488 ·
    7 <33121 · 8 <146502 · 9 >146502.
    Warning ships VERBATIM: "The U value should not be used as a predictor
    for the uncertainty in the future motion of NEAs." It names NEAs
    specifically, and our catalog is 41,906 NEAs — the primary source's
    caveat is about exactly our population.
    Top qualitative tier ANCHORS on JPL's published cutoff: condition_code
    ≥ 7 → "orbit solution is highly uncertain" (Small-Body Mission Design
    API v1.2). Any lower boundary is ours and must be labeled as ours.
    U is ranking-penalty + visibility flag; never a kill switch; never
    converted to a derived future-uncertainty number (triage §2.5).
  All quality/context fields repo-present per recon Q7 — zero catalog regen.

DEC-17-5  Provenance surface. LOCKED.
  Persistent method badge on every compare surface: dynamics model
  ("Lambert patched-conic screen") · grid resolution (731×100; 7.004 d ×
  16.604 d) · departure window (2026-01-01 → 2040-01-01) · ephemeris source
  + epoch · screening-vs-refined status. Footnotes (not columns) for
  launch-site and propulsion assumptions.
  Riders: (a) 25 km²/s² feasibility threshold disclosed — runtime read of
  metadata.feasibleC3MaxKm2S2, zero regeneration (recon Q2); (b)
  delivered-mass values labeled "derived from official-published curve"
  when interpolated, exposing the two bracketing elvperf anchors; (c)
  NASA-NLS-contract-context caveat; (d) NG C3=21–29 interior-optimistic
  caveat surfaced from the source comment (triage §2.6). DEC-13-4
  no-double-count guard untouched.
  Compare-surface labels are DERIVED, never literal constants — F1/F4
  (§11) show what literals cost. Any span or resolution shown is read from
  the computation that produced the numbers.

DEC-17-6  Multi-select. LOCKED. Cap = 5.
  Additive selectedBodySet signal beside the existing scalar
  (ui-store/store.ts, recon Q8) — no rewrite of single-select consumers.
  Shareable URL ?bodies=<id,id,...> on /v2/compare/.
  Cap 5 confirmed by measurement: 1431.52 ms serial for five bodies at
  731×100 on Hudson's M1, inside the ~2 s budget.
  SERIAL, no workers. LOCKED, resolves OQ-17-2: rev D measured parallel
  five at 423.76 ms vs serial 386.92 ms — worker spawn overhead exceeds the
  gain at this scale.

DEC-17-7  Entry surface. LOCKED.
  compareV2: v2/compare/index.html per the vite entry convention (recon
  Q9). Real page. The earth-moon / inner-solar-system entries are redirect
  stubs and MUST NOT be used as templates (recon Q9).

DEC-17-8  Two-threshold opportunity model. LOCKED, parameters included.
  - SEGMENTATION (structure): body-relative T = liveMin + Δ, Δ = 5 km²/s².
    LOCKED from measurement (806745c). Δ=2 is too tight (163693 → 1
    component; structure disappears); Δ=10 over-merges (1566: 24 → 35
    components under conn4 while singletons rise). Δ=5 keeps structure
    legible across all five bodies. Δ is DISCLOSED in UI copy.
  - FEASIBILITY (viability tag): absolute 25 km²/s², the existing
    now-disclosed screen boundary. Displayed as tag + toggleable
    alternative segmentation mode.
  - RANKING qualifier: B_min = 2 DEPARTURE CELLS = 14.008219178082192 days
    at the locked resolution. LOCKED. Stated in cells because breadth is
    quantized at the cell width — every measured breadth in both passes is
    an exact cell multiple, and day-precision copy would overclaim
    resolution the grid does not carry. B_min ≥ 2 also excludes single-cell
    components, which is why DEC-17-1 needs no separate noise rule.
  UI: mode toggle (relative Δ=5 | absolute 25), both labeled with values.
  Rationale: segmentation and feasibility are different questions; a single
  absolute threshold hides structure on high-C3 bodies, a single relative
  threshold hides viability (Hudson "mix of everything", 2026-08-04).

DEC-17-9  Front B = full QOL backlog, phased, corrections binding. LOCKED
  (Hudson 2026-08-04).
  Scope = SLICE21_QOL_BACKLOG_TRIAGED.md Tiers 1–4 + Clome sweep, under:
  C1: marker-size chip states the repo floor 8 CSS px
  (DEFAULT_MIN_HALO_DIAMETER_PX, halos.ts:9) — never the research's 6. The
  ~7–7.5 CSS px rendered rim-decay shortfall is a logged finding, not
  silently "fixed" by lying in the chip.
  C2: NO frame label ships until a read-only transform-chain recon verifies
  the actual frame (TOP_DOWN_ECLIPTIC_NORMAL_ICRF at runtime.ts:447
  suggests ICRF involvement; suggestion ≠ verification). Recon is B2's
  entry gate.
  C3: no competitive superlative from the research reaches a public surface
  without independent verification.
  Phasing + cut rule §5. Roadmap consequence: Slice 21 rescopes to its
  Living Sky core = OQ-17-4.

DEC-17-10  Compare view validates against ephemeris fixture bounds and
  refuses. LOCKED. NEW in rev B.
  Before computing any grid, the compare view compares its requested
  departure window against the Earth series' first/last sample and refuses
  with a legible message if outside — the MCP's withinEarthSpan semantics
  (compute-shared.ts:138), validation not clamping.
  Rationale: F1 (§11) — the MCP validates and refuses; the live porkchop
  view has no comparison, validation, or clamping at all and works only
  because GRID_PARAMS happens to end inside the fixture. Same math core,
  one consumer guarded, one guarded by luck. Our own rev A measurement died
  on exactly this class (69.184 s past the last sample). The compare view
  does not inherit the unguarded pattern.
  Fixture bounds, verified: JD TDB 2461041.5 → 2466519.5
  (2025-12-31T23:58:50Z → 2040-12-30T23:58:50Z UTC), 5,479 samples, 1-day
  spacing. Bounds are READ at runtime, never hardcoded.

═══════════════════════════════════════════════════════════════════════════
§4. FRONT A — PHASES & GATES
═══════════════════════════════════════════════════════════════════════════
Perf budget: N=5 compare computation ≤ ~2 s serial on Hudson's Mac.
MEASURED 1431.52 ms — budget met before code exists.

A0  Parameter lock. COMPLETE — all four parameters locked in §3 from
    d8dffd0 + 806745c. No separate phase remains; recorded for lineage.
A1  Window-extraction module. New pure module in src/v2/porkchop/
    (side-file; nothing edited in place): segmentWindows(cells, params) →
    components per DEC-17-1, conn8, Δ and B_min injected not hardcoded.
    Unit tests: the committed 433 fixture (expectations read from
    s17-structure-7day.json, not assumed) · empty set · all-below-T ·
    hole-splitting · tie-at-T · single-cell component excluded by B_min ·
    a no-qualifying-window body (163693's shape). GATE G-A1: tests green,
    Hudson verifies fixture expectations against the artifact.
A2  MULTI-AGENT AUDIT of A1 (mathematician · adversarial · architect ·
    reconciliation). GATE G-A2: 0 HIGH findings open. Nothing consumes
    segmentWindows before G-A2.
A3  Data layer. selectedBodySet + URL codec · DEC-17-10 bounds validation ·
    serial N-grid orchestration at 731×100 with the worker seam's reduced
    cell transfer (recon Q3) · per-body assembly {grid, segmentation,
    deliveredMass}. GATE G-A3: headless N=5 test; measured wall time
    reported against the 1431.52 ms baseline.
A4  UI. /v2/compare/ entry + table + small multiples (same axes, same color
    scale, same contour quantity across thumbnails — triage §2.7,
    non-negotiable) + dominance badge + no-practical-window state + method
    badge + threshold toggles + provenance riders (a)–(d). GATE G-A4:
    STOP — Hudson browser-verifies against a DEC-17-4/-5 checklist before
    commit.
A5  Deploy + live-bundle verification (Network-tab hash; a green Actions
    run is not deploy confirmation). GATE G-A5: live verify done.

═══════════════════════════════════════════════════════════════════════════
§5. FRONT B — PHASES, GATES, CUT LINE
═══════════════════════════════════════════════════════════════════════════
UI-layer, visual-gated, zero math audit. Interleavable with Front A between
A-gates. Each phase independently shippable.

B0  Small-fix sweep (Clome): footer concatenation · C3 significant-figures
    consistency · coverage-line relabel ("View ephemeris coverage") · form
    field id/name · Titan focus key · orbit line contrast + NEA bloom
    toning (visual gate) · sidebar narrow-viewport handling. (HIGH/LOW
    threshold disclosure is DEC-17-5(a), not duplicated here.)
B1  Tier 1 — hidden→visible: pan (T1-1) · persistent Home (T1-2, exposes
    existing 't'/'=' presets) · "?" affordance + task-grouped shortcut
    overlay (T1-3; key map documented in the P0-F1f report) · tooltip
    shortcut badges (T1-4).
B2  Tier 2 — honesty surface. ENTRY GATE: C2 transform-chain recon
    verifies the frame; then scale/frame chips (T2-1: distances true scale ·
    radii true scale · "small-body markers: ≥8 px visibility floor" per C1 ·
    "Frame: <verified>") · axis triad (T2-2) · HUD readout (T2-3).
    INV-026 applies to every chip number.
B3  Tier 3 — selection/label correctness: click-priority model (T3-1:
    semantic rank within hit aperture — label owner > major body > orbit
    curve > minor-body point; kills the "clicked Earth, got 2019 UJ15"
    class) · label collision suppression + priority tiers (T3-2).
B4  Tier 4: ecliptic/heliocentric reference grid toggle (T4-1) · Frame
    Selected / Frame All as distinct commands (T4-2).
B5  Deferred tail: disambiguation picker (T3-3, only after T3-1 is measured
    in use) · layered novice/pro IA (T4-3 — backlog's own caveat recorded:
    "probably not worth it; audience uniformly technical"; included by
    Hudson's full-backlog ruling, positioned last on purpose).

CUT RULE: cut from the bottom, B5 → B4 → B3. B0–B2 protected (the
first-sixty-seconds fix and the honesty surface). Front A is never cut in
favor of Front B. Any cut is a §8 history entry, not a silent omission.

═══════════════════════════════════════════════════════════════════════════
§6. RISKS & FAILURE MODES
═══════════════════════════════════════════════════════════════════════════
- Biggest risk: two-front scope in semester time (classes 2026-08-08;
  December target 16–17, maybe 18). Mitigation: §5 cut rule; every phase
  independently shippable; Front A phases small and gated.
- Most likely failure mode: segmentation edge cases (ties, holes,
  single-cell components, no-qualifying-window bodies) surviving to UI.
  Mitigation: A1's test matrix names each — including 163693's shape, a
  real measured instance, not a hypothetical; G-A2 gates before
  consumption.
- Perf risk: RETIRED. Measured 1431.52 ms for N=5 against a ~2 s budget.
- Trust-surface risk: cache-vs-live divergence visible across catalog list
  and compare view. Mitigation: DEC-17-2's reconciliation clause, written
  against measured causes (sampling phase; TOF-resolution improvement), not
  guessed ones.
- Bias check recorded: sunk-cost pull toward the 34 MB cache was the
  argument for option (a); rejected on truthfulness grounds. Also §11's
  superseded hypothesis — an analytical prior held against data until the
  data contradicted it.
- Opportunity cost: Slice 18 (Mission View) delayed by Front B's tail;
  accepted by the full-backlog ruling; cut rule bounds it.
- What changes the recommendation: if F3 (catalog overstates difficulty for
  some bodies) proves widespread rather than sample-local, the catalog's
  own labeling becomes the larger honesty problem and a scope rider enters
  via §8 amendment.

═══════════════════════════════════════════════════════════════════════════
§7. OPEN QUESTIONS
═══════════════════════════════════════════════════════════════════════════
OQ-17-1  RESOLVED at rev B — reconciliation copy specified in DEC-17-2
         (sampling phase, not error; both-direction divergence explained).
OQ-17-2  RESOLVED at rev B — serial, no workers (DEC-17-6, measured).
OQ-17-3  Final dominance metric set (currently practical C3, max breadth
         cells, delivered mass). OPEN → lock at A3.
OQ-17-4  Slice 21 rescope after Front B absorbs the QOL backlog: Living Sky
         reduces to the ephemeris/live-sky core (P1–P5 research). Roadmap
         annotation — mothership call.
OQ-17-5  Does the marker rim-decay shortfall (C1: ~7–7.5 CSS px effective
         vs 8 px floor) warrant a halo-texture fix, or does the chip state
         the floor and the finding stand? OPEN → decide at B2.
OQ-17-6  Literal-vs-derived label provenance across existing trust surfaces
         (F3 in the QOL sense; F1 in §11). OPEN → not this slice.
OQ-17-7  Screening-cache reproducibility (F4, §11). OPEN → separate
         dispatch; touching a build script that produced a 34 MB tracked
         artifact is not a casual edit.
OQ-17-8  Does any catalog conditionCode originate from an MPCORB record
         whose U field held E/D/F rather than a digit? Aster types the
         field number|null, so a letter would silently become null —
         rendering "unknown quality" where the truth is "eccentricity was
         assumed," a worse signal than a missing one. Sharpens recon
         CANNOT-DETERMINE #3. OPEN → cheap repo-side check.
OQ-17-9  What albedo does the existing catalog's H-derived
         estimatedRadiusM assume? Recon Q7 shows no albedo field. If 0.14,
         it is citable (Stuart & Binzel 2004); if an undocumented constant,
         a live surface carries an undisclosed assumption. OPEN → one grep.

═══════════════════════════════════════════════════════════════════════════
§8. HISTORY / CLOSE RITUAL (append-only)
═══════════════════════════════════════════════════════════════════════════
2026-08-04 · LOCKED rev B. Every DEC in §3 is locked; every numeric
  parameter derives from a committed measurement (d8dffd0, 806745c) or a
  landed primary-source verification (efd6409). No PROVISIONAL values
  remain. Phase A0 completed before the lock rather than after it — the
  measurement passes ran first, so the doc locks on data instead of taste.
  Preceding drafts: rev A (2026-08-04, never committed, superseded in full
  by rev B — recorded so the absence of a rev A commit is not read as a
  deletion).
  Open at lock, by design: OQ-17-3 (dominance metric set, locks at A3),
  OQ-17-4..9 (§7), and the two V6/V7 spot checks named in §9.

2026-08-04 · AMENDMENT A1 — evidence-header provenance correction
  (additive; the header lines stand as written, this entry is the
  correction of record). Source: S-REPO-SWEEP-2026-08-04-A findings
  R-01/R-02, an independent read-only sweep.
  The rev B evidence-base header associates S17_PRERESEARCH_TRIAGE.md and
  "recon/S17_RECON_REPORT.md" with "HEAD c6c0c52". That SHA records the
  HEAD the recon was EXECUTED AGAINST (S-S17-RECON-2026-08-03-A), NOT the
  commit that introduced either artifact; neither file is in c6c0c52's
  tree. Verified containment:
    tools/slice17-research/S17_PRERESEARCH_TRIAGE.md      added 56149d8
    tools/slice17-research/recon/S17_RECON_REPORT.md      added c64ce1d
  Additionally, the header's "recon/S17_RECON_REPORT.md" is a fragment
  relative to tools/slice17-research/, not a repo-root path. The
  repo-root path is tools/slice17-research/recon/S17_RECON_REPORT.md.
  Lesson recorded: an evidence header must distinguish "executed against
  SHA X" from "introduced by SHA X". Future founding docs state which.

2026-08-06 · AMENDMENT A2 — breadth day-value convention (additive; the
  DEC-17-8 lines stand as written, this entry is the correction of record).
  Source: pre-commit sanity review of the A1 segmentWindows module
  (S-OVERNIGHT-BUILD-2026-08-05-A), which surfaced the conflict and
  correctly declined to self-resolve it.

  DEC-17-8's RANKING qualifier states "B_min = 2 DEPARTURE CELLS =
  14.008219178082192 days at the locked resolution". That day value applies
  an N x cell conversion. Every other part of the system applies
  (N - 1) x cell:
    DEC-17-1                              departure-date SPAN
    measurement artifact 806745c          breadth as span between endpoints
    the locked grid geometry              5113 days / 730 intervals /
                                          731 samples => 7.004109589041096 d
    src/v2/porkchop/segment-windows.ts    breadthDays =
                                          (breadthCells - 1) * depCellDays
  The (N - 1) convention is CORRECT and stands. A departure cell is a
  SAMPLED epoch at which a Lambert solution was actually computed, not an
  integrated bin of departure dates. N contiguous cells therefore span
  (N - 1) x cell days between the first and last VERIFIED departure;
  N x cell would assert feasibility for half a cell beyond the last epoch
  ever evaluated, which is extrapolation presented as measurement. The
  corrected value for B_min = 2 is 7.004109589041096 days.

  No ranking or classification result changes: the practical filter
  operates on breadthCells, not on days. The exposure was UI copy.

  Stronger statement of the underlying truth, which DEC-17-8's own
  rationale already implies: NEITHER 7.004 nor 14.008 days is a verified
  CONTINUOUS window. A two-cell component means two verified departure
  epochs 7.004109589041096 days apart; the dates between them were not
  solved either. The verified quantity is a COUNT OF EPOCHS at a stated
  sampling interval. This is precisely why DEC-17-8 makes cells the primary
  unit -- "day-precision copy would overclaim resolution the grid does not
  carry" -- and the 17-significant-figure day value in the same sentence
  was doing the exact thing that sentence forbids.

  Binding copy rule, effective immediately and applying to A3 and every
  later surface: a breadth day-span is NEVER displayed alone. Every display
  of breadthDays carries, adjacent and in the same visual unit, the cell
  count and the sampling interval. Day values display at 3 significant
  figures (7.00 d); full precision lives in the data layer and in this
  document, never in user-facing copy. Compliant pattern:
    "7.00 d window - 2 verified departures, 7.00 d sampling"
  Non-compliant, and never to ship: any bare day count, any phrasing that
  implies continuous feasibility across the span, and specifically the
  words "two-week window" for a two-cell component.

  Lesson recorded, alongside A1's: a founding doc that states a quantity in
  a primary unit must not also state a derived convenience value in a unit
  it has just argued is less truthful. If a derived value is stated, its
  conversion rule is stated with it. Future DECs quoting a span state the
  conversion.

2026-08-08 · GATE CLOSURES G-A1 + G-A2 (condensed pass, additive
  record; source: S-S17-GA12-AUDIT-2026-08-07-A, Hudson PASS of record).
  G-A1 CLOSED. Green-tests clause: Hudson's own run of 2026-08-06
  (node --test over v2-segment-windows / v2-compare-url /
  v2-runtime-camera-presets; 32/32 pass, his box, post-merge audit).
  Fixture-expectation clause: the audit's adversarial lens read every
  asserted constant directly from the committed
  tools/slice17-research/data/s17-structure-7day.json and tabled it
  against the test file; all rows MATCH; Hudson verified by reading the
  table and issuing PASS. The gate's verification is thereby his, on
  independently re-derived evidence, per INV-033 separation.
  G-A2 CLOSED at ZERO open HIGH findings. Lenses: mathematician,
  adversarial, architect, reconciliation — each a fresh session
  distinct from the module's author; the overnight self-review carried
  no gate weight. Findings: 0 HIGH / 11 MED / 9 LOW — HIGH
  count zero; MED/LOW items queued with dispositions in the audit
  record (tools/s17-ga12-audit-2026-08-07/RECONCILIATION.md, committed
  separately if Hudson elects).
  The gate certifies fixture honesty (G-A1: 160 field-level
  comparisons, zero mismatches; 5 rows n/a in 3 categories — nDep,
  nTof, span-end unasserted, TOF_MIN_DAYS inferred, breadthCells
  synthetic) and the correctness of the module's exported
  classification logic (resolveThreshold, classifyComponents) against
  DEC-17-3 and DEC-17-8. DEC-17-1's membership and conn8 clauses are
  verified by lens reading, not by the fixture tests, though the
  conn4/conn8 divergence check confirms the fixtures derive from the
  conn8 array. It does NOT certify the segmentation core, flood-fill,
  breadth measurement, or date conversion, which the artifact-fixture
  tests do not invoke. Three findings convert to HIGH at the A3 commit
  and are binding A3 entry conditions: D-01 (index-transpose adapter +
  asymmetric-fixture test), D-03 (inject absoluteKm2S2 from the
  DEC-17-5a runtime read), D-04 (echo liveMin/Δ/grid-geometry on the
  result). D-02 (TDB-as-UTC date convention) is a binding
  §8-amendment-plus-fix condition carrying the anchor tripwire: A3 must
  read the epoch from span.requested.start, never
  span.fixtureBounds.first.
  Consequence: the UNAUDITED quarantine on
  src/v2/porkchop/segment-windows.ts is LIFTED. A3 and later phases
  may import the module. The in-file quarantine header is retired by
  the first A3 commit that touches the module's consumers (comment
  edit, cited to this entry), not by this record.

(Subsequent amendments, cut-rule invocations, audit outcomes, and the close
entry append below. Additive only; prove with git diff | grep '^-'.)

2026-08-13 · CUT — Front B tiers B3-B5 descoped; tiers B0-B2 shipped
  [S-S17-CLOSE-2026-08-13-A] · Hudson ruled 2026-08-13. Additive §8 record of
  the cut, per the §5 CUT RULE requirement that a cut be a history entry, not a
  silent omission.

  SHIPPED (Front B tiers 0-2 — the protected scope):
  - B0 small-fix sweep: 7593616 (orbit contrast + NEA point toning), 7a3622d
    (responsive panel widths + footer wrap), 4daa199 (porkchop-modal hotkey
    gating + cost-card C3 units).
  - NEA point legibility structural fix: 358d379 (pixel-ratio parity, size
    floor/cap, hue resaturation) — the load-bearing legibility fix, verified by
    the cold-reader 100%-starfield stress test.
  - B1 Tier 1 (hidden→visible): 1e99aca (pan as camera-target offset,
    "⌂ Reset view"), 3a7c686 (discoverability: "?" overlay + tooltip badges).
  - B2 Tier 2 (honesty surface): 325c115 (scale/frame chips + axis triad + HUD),
    on the C2 frame verdict landed at c90b4f6 — B2 entry gate satisfied.

  CUT (from the bottom, B5 → B4 → B3, per the §5 CUT RULE):
  - B3 Tier 3 — selection/label correctness: click-priority model (T3-1:
    semantic rank within hit aperture — label owner > major body > orbit curve >
    minor-body point; kills the "clicked Earth, got 2019 UJ15" class) · label
    collision suppression + priority tiers (T3-2).
  - B4 Tier 4: ecliptic/heliocentric reference grid toggle (T4-1) · Frame
    Selected / Frame All as distinct commands (T4-2).
  - B5 deferred tail: disambiguation picker (T3-3, only after T3-1 is measured
    in use) · layered novice/pro IA (T4-3 — the backlog's own caveat, "probably
    not worth it; audience uniformly technical").

  AUTHORITY — the §5 CUT RULE, quoted verbatim (§5, lines 345-347):
    "CUT RULE: cut from the bottom, B5 → B4 → B3. B0–B2 protected (the
    first-sixty-seconds fix and the honesty surface). Front A is never cut in
    favor of Front B. Any cut is a §8 history entry, not a silent omission."
  and DEC-17-9 ("Phasing + cut rule §5"). This cut removes B5 → B4 → B3 in the
  mandated bottom-up order, leaves the protected B0-B2 shipped, and does not
  touch Front A (CLOSED). (Dispatch note: the S-S17-CLOSE dispatch cited this
  authority as "AGENTS.md §5/§8"; that was a document-name error — AGENTS.md §5
  is the Nova role and §8 is prior-art notes. The rule lives here, at this
  document's §5/§8, and Hudson confirmed the substitution 2026-08-13.)

  REASON (Hudson, plainly): the slice's protected scope — the first-sixty-
  seconds legibility fix and the honesty surface — shipped. B3-B5 are
  enhancements, not commitments. The work moved to a laptop-only environment
  (desktop retired 2026-08-13); the cut closes Slice 17 at a verified, shipped
  state rather than leaving it open indefinitely.

  WHERE THE CUT WORK GOES: strategy/SLICE21_QOL_BACKLOG_TRIAGED.md already
  carries these as Tier 3 (T3-1/T3-2/T3-3) and Tier 4 (T4-1/T4-2/T4-3); its
  Tier 4 is annotated "larger scene work (natural Slice 21 core)", aligning with
  OQ-17-4's Slice 21 rescope. B3-B5 carry forward there.

═══════════════════════════════════════════════════════════════════════════
§9. VERIFICATION BINDINGS
═══════════════════════════════════════════════════════════════════════════
S-S17-MEASURE-2026-08-04-D (d8dffd0)  → coarse-grid comparison point.
    LANDED.
S-S17-MEASURE-2026-08-04-E (806745c)  → the parameter source for
    connectivity, Δ, B_min, cap, resolution. LANDED.
V6 (H→D constant + albedo ranges)  → gates DEC-17-4 size-range copy.
    VERIFIED-WITH-CITATIONS. LANDED efd6409 →
    tools/slice17-research/literature/V6_H_TO_DIAMETER_VERIFIED.md
    (prompt aebca4a). OPEN spot check before UI copy quotes the constant:
    the CNEOS log-form page (one page, 30 s).
V7 (MPC U bands + warning)  → gates DEC-17-4 quality copy.
    VERIFIED-WITH-CITATIONS. LANDED efd6409 →
    tools/slice17-research/literature/V7_CONDITION_CODE_VERIFIED.md
    (prompt aebca4a). OPEN spot check before UI copy quotes the bands:
    the MPC UValue page (one page). This spot check is the one INV-033 gap
    that cannot close from inside the tool chain — Perplexity both
    retrieved and asserted. A1 may proceed without it; DEC-17-4's quality
    copy may not ship without it.
    Both carry an INV-033 caveat: retrieval and assertion came from the
    same actor.
V5 (Benner)  → deferred indefinitely (out of scope §2).
V8 (NHATS numbers)  → dormant; fires only if a NHATS number is ever
    proposed for display (none planned).
Standing: every chip/badge/label number on a trust surface traces to a repo
constant, a committed measurement, or a verified primary source
(INV-025/026).

═══════════════════════════════════════════════════════════════════════════
§10. ANCESTOR ANNOTATIONS & PROPOSALS (queued, additive-only)
═══════════════════════════════════════════════════════════════════════════
- SLICE_11_FOUNDING.md OQ-5 (multi-body comparison, deferred) → CLOSED by
  this slice; annotation at Front A close.
- Slice 10 founding §2 "Economic feasibility ranking (Slice 17)" →
  annotation: Slice 17 reassigned to Target Compare per M10=A 2026-08-04;
  economic ranking unscheduled. Queue with the Remote Transport
  superseded-marker cleanup.
- Roadmap: Slice 21 rescope note per OQ-17-4.
- PROPOSED-INV-035 (considered at close, not pre-locked): "Any surface that
  ranks or compares transfer opportunities must either express
  distinct-opportunity structure (count + breadth) alongside any minimum,
  or label itself a screening surface whose resolution and selection rule
  are disclosed." Codifies the §1 thesis so the next comparison surface
  cannot regress to minimum-only.
- PROPOSED-INV-036 (considered at close): "Any consumer of a fixture-backed
  ephemeris must validate its requested span against the fixture's actual
  bounds before computing." Codifies DEC-17-10 / F1.
- STATUS.md: untouched here; slice lines fold into the next full refresh.

═══════════════════════════════════════════════════════════════════════════
§11. FINDINGS CARRIED (discovered during S17 preparation; NOT fixed here)
═══════════════════════════════════════════════════════════════════════════
F1  The live porkchop view performs no bounds validation against the Earth
    fixture (S-S17-EPHEM-COVERAGE-C, main.ts:180 + surrounding). The MCP
    validates and refuses (compute-shared.ts:138, porkchop-scan.ts:98).
    The view works because GRID_PARAMS happens to end inside the fixture.
    → DEC-17-10 prevents inheritance; the view itself is unfixed.
F2  Cache and view screen different spans, both labeled "2026–2040": cache
    2026-01-01 → 2040-12-31, view → 2040-01-01. A cached minimum in that
    eleven-month tail is undisplayable. Measured incidence in the five-body
    sample: 0. → DEC-17-2 flags such rows; the mismatch is unfixed.
F3  The screening cache understates achievable performance for some bodies.
    At 7-day departure × 16.6-day TOF, 163693's minimum improves from
    7.191393068210365 to 6.7561195189011825 km²/s² (−6.05%), at an argmin
    2563 days from the cached one; 99942 improves slightly. Cause: the
    cache's 30-day TOF spacing. The catalog therefore shows some targets as
    harder than they are. → Recorded; scope rider only if widespread
    (§6).
F4  The screening cache is not currently reproducible.
    precompute-lambert-screen.mjs:158 points at
    tests/fixtures/v2/horizons-inner-solar-system-2026-2040.json, which
    does not exist — the fixture moved to src/v2/data/ and the build script
    was never updated. Provenance is intact (the cache's recorded
    Horizons SHA-256 matches the production fixture byte-for-byte), but
    re-running the build fails. → OQ-17-7.
SUPERSEDED HYPOTHESIS (recorded, per findings-log discipline): during rev D
    review, Nova argued the high component counts were grid aliasing,
    reasoning from synodic period that ~2 opportunities should appear in 14
    years. rev E disproved it — counts barely moved at 3.7× finer departure
    sampling (99942 Δ=5: 27 → 24). The reasoning error: one synodic
    opportunity produces multiple disconnected components in departure×TOF
    space, because a given departure reaches the target via different
    transfer geometries across a 182–1826 d TOF range. Component count was
    never expected to equal synodic count. rev E remains worth its cost —
    it produced better minima, the singleton counts that settled
    connectivity, and the resolution that settled B_min.
