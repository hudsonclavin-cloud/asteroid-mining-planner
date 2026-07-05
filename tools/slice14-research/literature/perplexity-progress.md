# Slice 14 Pre-Research — Perplexity Progress Review

**Provenance:** Perplexity (Progress PDF export), Hudson's own session, received
2026-07-04 in chat. Ingested verbatim by dispatch (content embedded, no PDF parse).

**Status — READ BEFORE USING:** This is pre-research LEAD material — candidate
ideas, not verified facts. Nothing here enters a DEC or invariant without
independent verification (verify-before-lock). Perplexity output is treated as
*residue*, not a primary source (founding-doc ruling).

**⚠️ ANTI-PORTING NOTICE:** The final section of this artifact contains a
recommendation to reuse / port open-source physics code (poliastro, adam_core)
into Aster, including a repo-mining list. **This recommendation is REJECTED and
must not be acted on.** Aster's credibility depends on its *re-derived* Lambert
solver validated *against* poliastro — porting external physics code deletes that
signal. See the anti-porting invariant (Slice 14 founding doc):
"External libraries are used only as validation oracles. Aster's math
implementations are re-derived, not imported." The porting section is preserved
below for an honest record of what was considered and rejected — not as a to-do.

---

## Part 1 — Five candidate features (Perplexity's suggestions)

Framing: additions that deepen credibility without violating the no-fake-precision
philosophy; bias toward diagnostic structure over packaging.

1. **Feasibility heatmap of "what breaks first."** For each candidate trajectory,
   show which constraint fails first: DLA/site limit, launch-vehicle C3 ceiling,
   time-of-flight, or delivered-mass floor. Teaches *why* a window is bad, not just
   that it is. Effort: medium; evidence-backed if derived from existing screening
   outputs + sourced vehicle curves, otherwise judgment.

2. **One-click "explain this cell."** Click any porkchop cell → compact derivation
   trail: departure date, TOF, Lambert branch, C3, DLA, launch-vehicle payload at
   that C3, delta-V stack, final delivered mass. Makes the model auditable at the
   point of interest. Effort: medium; evidence-backed if values come from existing
   model state, not invented summaries.

3. **"Trust badge" provenance panel.** A block showing the chain source →
   model → screen: NASA LSP curve screenshot → digitized/interpolated payload curve →
   browser validation check → displayed result. Makes disciplined sourcing visible
   in seconds. Effort: small-medium; evidence-backed if it points to committed
   source artifacts + validation logs.

4. **Target-compare mode for 3-5 asteroids.** Pin a few bodies, compare side by
   side on the same window + vehicle settings. Shows Aster is a reusable framework,
   not a one-off. Effort: medium; judgment unless comparison uses only
   already-sourced mission outputs.

5. **"Bad assumptions" simulator.** Toggle that intentionally breaks one assumption
   at a time (no launch-site constraint, optimistic Isp, extrapolated vehicle curve,
   ignoring margin) and shows how the answer changes. Reinforces the honesty
   philosophy — each broken assumption clearly labeled as counterfactual, not
   recommendation. Effort: medium-large; judgment.

**Perplexity's suggested order (credibility gain per unit effort):**
explain-this-cell → trust badge → what-breaks-first → target-compare →
bad-assumptions. Rationale: immediate auditability, then stronger narrative, then
richer analytical depth.

---

## Part 2 — Competitive landscape (what exists in the world)

Closest analogs:

- **JPL Small-Body Mission-Design Tool** — public mission-design interface for
  small-body transfers; nearest institutional analogue in spirit.
- **Asteroid Institute ADAM::Trajectory Optimizer** — public trajectory-planning
  service; porkchop-style analysis + 3D trajectory views.
- **poliastro** — open-source astrodynamics library (Lambert solving, trajectory
  plotting); a likely math-layer reference point, not a planning product.
- **OSIRIS-REx planning toolkit / J-Asteroid** — closer to mission-operations than
  a public planner; shows how real teams assemble multi-tool planning stacks.

**What makes Aster different:** it's a screening + credibility artifact, not a
generic calculator. It fuses porkchop analysis with launch-site feasibility, live
refusal to extrapolate beyond sourced launch data, and a deliberate demo proving
the best-looking window can still be infeasible. That honesty layer is not what
most public tools foreground.

**Writeup framing (for the methodology surface):** Aster sits at the intersection
of — trajectory math: poliastro; mission-design tooling: JPL SBMD + ADAM;
operational-planning seriousness: OSIRIS-REx / J-Asteroid — while being different
because it is explicitly designed to reject unsupported certainty.

---

## Part 3 — Open-source status of the analogs

- **poliastro** — open source, MIT-licensed Python astrodynamics library.
- **ADAM Core** (B612 Asteroid Institute) — appears open-source oriented,
  Python foundation library.
- **JPL Small-Body Mission-Design Tool / API** — public and documented, but not
  clearly presented as open source.
- **OSIRIS-REx toolkit / J-Asteroid** — mission-ops toolkit; open-source status
  unknown from the evidence.

---

## Part 4 — Open-source reuse recommendation — ⚠️ REJECTED, DO NOT ACT

**This section is quarantined.** It records a porting recommendation that was
considered and rejected. It is NOT a to-do list. Acting on it violates the
anti-porting invariant and destroys Aster's core credibility signal (the
re-derived solver). Preserved verbatim only so the research record is honest about
what was tempting and why it was refused.

Perplexity's recommendation was to reuse open-source physics/validation/plotting
material from poliastro (poliastro/poliastro), adam_core
(B612-Asteroid-Institute/adam_core), and precovis
(B612-Asteroid-Institute/precovis) — specifically to "mine" the physics core
(orbit propagation, Lambert solving, reference frames, coordinate transforms),
validation assets, and plotting/visualization patterns, following a "read license
→ copy idea not code → keep a source log → re-verify" workflow.

**Why rejected:** Aster's value is not functionality — it is the disciplined,
re-derived math validated against poliastro as an external oracle. Porting
poliastro's or adam_core's physics would replace the signal (independent
re-derivation) with a wrapper, and no amount of attribution recovers that. The
repos remain useful as **validation oracles and study references only** — never as
code sources. Locked as an invariant in Slice 14.
