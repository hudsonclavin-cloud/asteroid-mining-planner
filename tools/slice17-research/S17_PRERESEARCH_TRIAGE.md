# SLICE 17 PRE-RESEARCH TRIAGE — Target Compare
# 2026-08-03 · Nova (Fable) · input for the founding-doc session (Opus)
#
# Sources: S-S17-RECON-2026-08-03-A (repo recon, Claude Code) · S17-Q1
# (accessibility metrics, Perplexity) · S17-Q2 (trade-study presentation,
# Perplexity). All Perplexity content is LEADS per
# recursive-research-elicitation; verification queue at bottom.
# Raw chains → tools/slice17-research/literature/ when the slice ingests.

═══════════════════════════════════════════════════════════════════════════
§1. STATE OF PLAY (from the recon, [Certain] unless noted)
═══════════════════════════════════════════════════════════════════════════
- Slice 17 is assembly, not construction. Headline columns (minC3 +
  minC3Date + minC3TofDays) are READ from the tracked 34 MB
  lambert-screen-cache.json for all 41,906 bodies — zero computation.
- computePorkchopGrid is a pure function with injected deps, already driven
  headlessly by the worker and the MCP server. N-target invocation is clean.
- Genuine builds: multi-select (additive signal-set on the existing signals
  store) and discrete-window extraction (nothing anywhere finds local
  minima; cached bestWindows = top-5 cells by C3, which cluster — 433's
  five rows ≈ 2-3 real opportunities).
- conditionCode, sigmaA/sigmaE, dataArcDays, nObsUsed, qualityRank,
  inv014Tier all present per body → NO catalog regen for orbit-quality
  columns. Regen only if albedo / orbit_id / soln_date wanted (skip v1).
- The undisclosed HIGH/LOW boundary (25 km²/s²) is readable at runtime
  from metadata.feasibleC3MaxKm2S2 — disclosure is a UI read.
- Vehicle curves: 8 vehicle/configs, NASA LSP elvperf anchors (as-of
  2024-02-29, queried 2026-07-02), no extrapolation, CI golden guard on
  9+1 values, DEC-13-4 no-injection-double-count.
- House timings (other boxes, not Hudson's Mac): ~95-120 ms/target at the
  view's 200×100; ~9 ms at the MCP's 80×50.

═══════════════════════════════════════════════════════════════════════════
§2. WHAT THE RESEARCH CHANGES (the decisions it forces or reshapes)
═══════════════════════════════════════════════════════════════════════════

2.1 DROP element-only accessibility proxies from v1. [decision-ready]
    Q1 could not verify Benner's formula/bounds/failure-regimes from
    primary sources (honest refusal, stated plainly) and explicitly
    advised not making it load-bearing unverified. The recon shows real
    Lambert minima exist for every body — the proxies approximate what we
    already have. Shoemaker-Helin at most a future "idealized
    accessibility" explainer column, after its own verification pass, with
    the ARRM-style disclosure "screening metric only; not a verified
    transfer."

2.2 Window structure is the honesty core, not a nicety. [reshapes DEC-17-1]
    Convergence of three independent sources:
    - Recon: cached bestWindows cluster within opportunities (433 proof).
    - Q1: separate "global minimum" from "best practical constrained
      window"; synodic recurrence is distorted by e/i/ω/phasing — never
      imply uniform recurrence.
    - Q2 failure mode #2: minimum-only display hides window brittleness;
      broad-window targets can beat sharp-minimum targets
      programmatically (ARRM ranks partly on slip robustness).
    Consequence: the compare view MUST express distinct opportunities and
    window breadth, or it commits the field's documented comparison
    failure. This upgrades window extraction from cosmetic dedup to the
    slice's honesty requirement.

2.3 No composite score. Dominance yes; weights no (v1). [reshapes ranking]
    Q2: weighted sums only recover Pareto points under convexity; NEA
    trades are almost certainly non-convex; ARRM's own ranking parameter
    disclaims itself ("does not represent a real mission opportunity …
    phasing"). Default = transparent single-metric sort (e.g. min verified
    C3 or delivered mass at a fixed vehicle) + a dominance badge per row
    (dominated / nondominated / insufficient-data — trivial at N≤5).
    Interactive user-weighted ranking with sensitivity display is SCOPE
    BLEED → defer (it is Slice 19's territory arriving early).

2.4 NHATS: adopt the pattern, never the numbers. [guardrail]
    Its cutoffs (450 d round-trip, ≥8 d stay, reentry ≤12 km/s, C3≤60,
    ΔV≤12 from 400 km LEO) are HUMAN ROUND-TRIP constraints; Aster screens
    one-way rendezvous. The transferable idea is the two-tier
    presentation: "global best found" (subordinate) vs "best practical
    window" (primary). Any NHATS number displayed verbatim would be wrong
    for our mission model and must not ship.

2.5 Condition code: display raw, never convert. [locks UI copy shape]
    U is a logarithmic 10-year mean-anomaly-runoff class (0-9), with an
    explicit source warning that it must NOT predict future NEA motion
    uncertainty. So: show raw code + qualitative label ("well determined"
    / "usable with caution" / "poorly constrained") + the warning line.
    Use as ranking penalty + visibility flag; never a kill switch; never
    a derived "position uncertainty over 2026-2040" number. The 0-9 band
    thresholds need verify-before-lock before any UI copy quotes them
    (V7 below).

2.6 Delivered-mass card: provenance surface, mostly already built.
    Q2's required disclosures map onto launch-vehicles.ts almost 1:1
    (elvperf anchors + as-of dates + no-extrapolation + DEC-13-4).
    Gaps (all INV-025/026 surface work, cheap):
    - label values "derived from official-published curve" when
      interpolated, exposing the two bracketing anchor points;
    - NASA-NLS-contract-context caveat (official for NLS, not generic
      market truth);
    - keep the NG C3=21-29 interior-optimistic caveat visible (already
      in the source comment, never surfaced).

2.7 Small multiples: same axes, same color scale, same contour quantity
    across all target thumbnails — mixing scales visually overstates
    narrow-window targets. At the MCP's measured ~9 ms/target (80×50,
    other box), N=5 thumbnails are computationally trivial; resolution
    for thumbnails is a founding-doc parameter, not a risk.

2.8 Method badge is persistent metadata. Every compare surface carries:
    dynamics model ("Lambert patched-conic screen"), grid resolution
    ("7 d × 30 d" for cached values), ephemeris source/epoch, and
    screening-vs-refined status. Footnotes, not columns, for launch-site
    and propulsion assumptions. This also finally discloses the 25 km²/s²
    threshold (rider, kills a known reviewer complaint).

═══════════════════════════════════════════════════════════════════════════
§3. DEC SKELETON FOR THE FOUNDING DOC
═══════════════════════════════════════════════════════════════════════════
DEC-17-1  Window extraction scope. Options: (a) render-layer clustering
          of cached bestWindows by (launchDate, tofDays) proximity — no
          core/ touch, no audit; (b) true local-minima extraction over a
          grid — new core/ math, full audit; (c) hybrid: cluster cached
          for the table, live-grid minima only in a detail view.
          Research adds: whatever ships must express distinct
          opportunities + breadth (§2.2). Nova lean [Likely]: (a) for
          v1 with the 5-cell ceiling disclosed; (b) deferred until a
          consumer needs true minima.
DEC-17-2  Source of truth: cached (7 d × 30 d) vs live grid (200×100).
          BLOCKED on the cheap measurement: recompute ~5 bodies at view
          resolution, diff cached minC3/date. Trust-surface consistency
          is the deciding criterion (compare row must not contradict the
          porkchop the user opens next).
DEC-17-3  Ranking model: default sort metric + dominance badge; no
          composite; user weights deferred (§2.3).
DEC-17-4  Column set. Headline: minC3 (+date, TOF), distinct-window
          count/breadth, delivered mass @ chosen vehicle. Context: H +
          albedo-assumed size range, orbit class, a/e/i. Quality: U +
          label + warning, dataArcDays, nObsUsed, sigmaA/sigmaE.
          (All present in catalog per recon Q7; size-range copy blocked
          on V6.)
DEC-17-5  Provenance surface: method badge, grid-resolution disclosure,
          25 km²/s² threshold rider, delivered-mass source-class labels
          + bracketing anchors (§2.6, §2.8).
DEC-17-6  Multi-select mechanism: additive selectedBodySet signal, cap
          (5?), URL encoding for shareable comparisons (?bodies=…).
DEC-17-7  Entry surface: /v2/compare/ via compareV2 vite entry (recon Q9
          pattern; do NOT template from the redirect stubs).

═══════════════════════════════════════════════════════════════════════════
§4. PRE-FOUNDING MEASUREMENT (one, cheap, blocking DEC-17-2)
═══════════════════════════════════════════════════════════════════════════
Cache-vs-live diff: recompute ~5 bodies (spanning orbit classes, reuse the
slice11 timing body list) at 200×100 over the same 2026-2040 span; diff
live minC3 + argmin date against cached values. Output: max |ΔC3|, max
|Δdate|, per body. Doubles as the local-box timing measurement the recon
flagged as CANNOT DETERMINE #1 (run on Hudson's Mac). Small scripted
dispatch, writes only under tools/slice17-research/.

═══════════════════════════════════════════════════════════════════════════
§5. VERIFICATION QUEUE (extends ledger V1-V4)
═══════════════════════════════════════════════════════════════════════════
V5  Benner primary source (formula, bounds, failure regimes) — ONLY if a
    proxy column is ever wanted. Deferred indefinitely by §2.1.
V6  H→D conversion + albedo-class uncertainty ranges, primary source —
    required before any size-range column ships.
V7  Condition-code U band thresholds (the 0-9 runoff table) — required
    before any UI copy quotes bands. (The "not a predictor" warning
    itself should be quoted from the primary source at that pass.)
V8  If any NHATS number is ever displayed: verify against the NHATS
    primary publication first (currently none planned — §2.4).

═══════════════════════════════════════════════════════════════════════════
§6. TENSIONS / FINDINGS LOG (per triage rules — logged, not resolved)
═══════════════════════════════════════════════════════════════════════════
T1  Q2's full recommendation set (Pareto scatter + interactive weights +
    rank-instability display) exceeds the slice's scope. Right-sized in
    §2.3; the founding doc should state the deferral explicitly so it
    reads as a decision, not an omission.
T2  Research says "don't show a single best window" while our cheapest
    reuse IS a single global min per body. Resolution: show it, labeled
    "global minimum (7 d × 30 d screen)", alongside window structure —
    the label carries the honesty.
T3  Q1 retrieval gaps (Benner, H→D uncertainty ranges, post-2015
    refinement survey) are logged as V5/V6, not as blockers — v1's
    design avoids depending on any of them.
