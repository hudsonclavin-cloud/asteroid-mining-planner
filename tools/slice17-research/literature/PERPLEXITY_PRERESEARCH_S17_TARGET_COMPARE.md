# Perplexity Pre-Research — Slice 17: Target Compare
# 2026-08-03 · standard Perplexity · one prompt per session, paste whole block
#
# Slice 17: 3–5 asteroids side by side, best windows ranked by ΔV /
# delivered mass. Answers "should I go to X or Y". Reuses the porkchop
# engine; the 41,906-body catalog becomes useful rather than decorative.
#
# TRIAGE RULES (per recursive-research-elicitation):
# - Everything returned is LEADS, not facts. Nothing enters a DEC,
#   invariant, or founding doc without an independent verify-before-lock
#   pass on its LOAD-BEARING NUMBERS list.
# - Contradictions between levels are findings — log them, don't pick a side.
# - Adopted output lands in tools/slice17-research/literature/.
#
# The third leg of this pre-research is a REPO RECON (what Aster already
# computes per target), which Perplexity cannot answer — that dispatch is
# separate: DISPATCH_S17_RECON_revA.md.

═══════════════════════════════════════════════════════════════════════════
QUERY S17-Q1 — NEA accessibility metrics: what belongs in a comparison
═══════════════════════════════════════════════════════════════════════════

CONTEXT: I'm building Aster, a client-side asteroid mission-planning tool
(TypeScript, GitHub Pages, no server; all astrodynamics re-derived in-house
and validated against external oracles). It already screens 41,906 near-Earth
asteroids with a Lambert-solver patched-conic pipeline, producing per-target
C3 minima and full porkchop grids over 2026–2040. The next capability is a
side-by-side comparison of 3–5 user-selected targets, ranking their best
transfer windows. I need to choose which metrics the comparison table shows,
and how to present orbit-quality uncertainty honestly.

QUESTION: With primary sources throughout: (1) Survey the accessibility
metrics used in NEA mission-target selection — the Shoemaker-Helin
accessibility formulation, Benner's ΔV approximation (state the formula, its
input elements, its published accuracy bounds vs Lambert-computed ΔV, and
its known failure regimes), the NHATS selection criteria and its published
ΔV/duration cutoffs, and any post-2015 refinements used by mission studies.
For each: what it measures, what it hides, and whether it can be computed
from orbital elements alone or needs a Lambert grid. (2) Window structure:
how synodic period sets the recurrence of transfer opportunities for NEAs;
how eccentric/inclined NEA orbits break the clean synodic pattern; what
"best window" typically means in the trade-study literature (global C3
minimum vs per-synodic-cycle minima vs duration-constrained minima). (3)
Physical context columns: the H-magnitude → diameter conversion (formula,
the albedo assumption problem, honest uncertainty ranges per albedo class),
and which physical/orbital columns published NEA trade studies actually
tabulate when comparing candidate targets. (4) Orbit quality: the MPC/JPL
condition code (U parameter) — its exact definition, its scale, what each
band means for ephemeris uncertainty over a 2026–2040 planning horizon, and
how mission studies treat poorly-determined orbits in target lists.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based asteroid mission-planning comparison tool, and
answer each with sources.

LEVEL 2 — For each Level-1 answer that materially affects a design decision,
pose and answer the single most important follow-up it raises, with sources.

LEVEL 3 — Repeat once more for any Level-2 answer that still carries open
decision weight.

BUDGET: no more than 10 follow-up answers total across all levels. Prune by
decision-relevance, not curiosity — drop branches that only add color.

For EVERY follow-up answer:
(a) open with one line stating why this follow-up matters for the tool,
(b) cite primary sources,
(c) flag each number as official-published vs third-party-estimated.

END with a section titled LOAD-BEARING NUMBERS: a flat list of every number
in this entire response that a design decision might rest on — one line per
number, with its source. This list feeds an independent verification pass.

═══════════════════════════════════════════════════════════════════════════
QUERY S17-Q2 — Multi-target trade-study presentation: practice and pitfalls
═══════════════════════════════════════════════════════════════════════════

CONTEXT: Same tool as above. The comparison view will show 3–5 asteroid
targets side by side — per-target best windows, ΔV/C3, transfer time,
delivered-mass estimates against vehicle performance curves, physical
context, and orbit-quality caveats — for a technical audience (engineers,
researchers, reviewers). I want the presentation conventions that
mission-design practice actually uses, and the known ways comparison tables
mislead.

QUESTION: With primary sources: (1) How do published mission trade studies
and target-selection papers present multi-candidate comparisons — table
conventions, which quantities get a column vs a footnote, how per-candidate
porkchop thumbnails or window timelines are used alongside tables, and any
standard small-multiples pattern for launch-window comparison across
targets. (2) Ranking pitfalls: the documented problems with collapsing
multi-objective trades (ΔV, duration, window date, target size, orbit
quality) into a single score — dominance vs weighted-sum vs Pareto-front
presentation, and what the decision-analysis literature says a tool should
show when objectives conflict. (3) Delivered-mass honesty: when converting
C3 to delivered mass via a launch-vehicle performance curve, what the
published curves actually represent (contract values vs marketing vs
computed), the standard caveats trade studies attach, and the known error
introduced by interpolating between published C3 points. (4) Comparison-
table failure modes: documented cases or critiques where accessibility
rankings misled target selection (e.g. Benner-ΔV-ranked lists vs
Lambert-verified reality), and what disclosures the better tools attach.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based asteroid mission-planning comparison tool, and
answer each with sources.

LEVEL 2 — For each Level-1 answer that materially affects a design decision,
pose and answer the single most important follow-up it raises, with sources.

LEVEL 3 — Repeat once more for any Level-2 answer that still carries open
decision weight.

BUDGET: no more than 10 follow-up answers total across all levels. Prune by
decision-relevance, not curiosity — drop branches that only add color.

For EVERY follow-up answer:
(a) open with one line stating why this follow-up matters for the tool,
(b) cite primary sources,
(c) flag each number as official-published vs third-party-estimated.

END with a section titled LOAD-BEARING NUMBERS: a flat list of every number
in this entire response that a design decision might rest on — one line per
number, with its source. This list feeds an independent verification pass.
