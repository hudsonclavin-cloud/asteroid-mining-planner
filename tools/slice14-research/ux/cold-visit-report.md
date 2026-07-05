# Aster — Cold-Visit UX Report (Slice 14 pre-research artifact)

**Provenance:** Claude-in-Chrome cold-visit protocol, 2026-07-03. Ingested verbatim
by dispatch (content embedded, no parse).

**Status — READ BEFORE USING:** Pre-research LEAD material. Findings drove the
pre-Slice-14 copy pass (three string defects, DLA-on-by-default) and the three
Slice 14 fronts. Not verified facts about the *current* site.

**⚠️ BUNDLE CAVEAT:** This test ran against bundle porkchopV2-CNuQ5IWX (the pre-fix
deploy, since replaced). **COPY findings still hold** — no user-facing copy changed
between that bundle and current. **NUMERIC findings do NOT apply** to the current
live bundle porkchopV2-D8hFp-Wd (New Glenn C3=5 anchor was reverted; interp now
gives ~6055 at C3=5). Re-verify any specific finding against the current bundle
before citing it as still-open.

**Protocol:** three independent 90-second cold visits, three personas, context
reset between each. Personas answered (a) what is this, (b) do you trust it,
(c) what landed, (d) what confused, (e) another 60s?, (f) signal of ability sent,
(g) signal the author wanted to send that didn't land.

---

## PERSONA A — University admissions reviewer

**a. What is this?** — A tool that plots trajectory options (a "porkchop plot") for
sending a spacecraft to a specific asteroid, and estimates the fuel/velocity cost of
different launch date and flight-time combinations.

**b. Do you trust it?** — Somewhat. The chart and numbers look plausible and there's
real astrodynamics vocabulary (C3, TOF, DLA), but I have no way to judge accuracy in
90 seconds, and a phrase like "Beyond published curve" reads more like marketing than
science.

**c. First thing that landed** — The chart itself: colorful, structured, clearly the
result of a real calculation grid, not a mockup.

**d. First thing that confused you** — "Beyond published curve" with a green "GREEN"
badge — I don't know what curve is being referenced or why it's good that this point
exceeds it.

**e. Would you spend another 60 seconds on it?** — Yes, mildly — enough polish and
specificity that it looks like real engineering effort, worth a bit more time to see
if it explains itself.

**f. What signal of ability did the tool send you?** — Domain knowledge — the labels
and structure suggest genuine familiarity with trajectory design, more than it
signals raw coding volume.

**g. What signal do you think the author wanted to send that didn't land?** — I
suspect they wanted to show rigorous, validated engineering judgment (calibrated
confidence, sourced assumptions), but in a fast skim it reads as "impressive-looking
dashboard" rather than "I understand and can defend every number here."

---

## PERSONA B — AI-lab fellowship reviewer

**a. What is this?** — A trajectory-planning calculator for asteroid rendezvous
missions that lets you inspect cost/fuel tradeoffs across launch dates; unclear yet
what part of this was AI-directed versus hand-built.

**b. Do you trust it?** — Somewhat — the "Assumptions & sources" panel cites a
specific NASA source with a query date, which is a good technical-rigor signal, but I
found zero information anywhere on the page about how this was built or what role AI
played in producing it.

**c. First thing that landed** — The "Assumptions & sources" expandable actually had
real content (named source, interpolation method, margin policy) rather than being a
dead placeholder — that's a positive, unexpected level of care.

**d. First thing that confused you** — There is no About/methodology/GitHub link
anywhere on the page. As a reviewer specifically looking for the "process story," I
found no place that tells that story at all.

**e. Would you spend another 60 seconds on it?** — No, at least not on this page —
I'd want to go find a separate repo or writeup, since this page itself doesn't
contain any process narrative to dig into.

**f. What signal of ability did the tool send you?** — Domain rigor (the
sourcing/assumptions panel) more than process discipline — it shows the output is
careful, but tells me nothing about how AI was directed to get there.

**g. What signal do you think the author wanted to send that didn't land?** — I'd
guess they wanted to demonstrate disciplined AI-agent direction (specs, verification,
iteration) but that story is entirely absent from this page — it reads as a finished
artifact with no visible trace of process, so that signal never reaches this persona.

---

## PERSONA C — Space-industry professional

**a. What is this?** — A screening-level porkchop/ΔV tool that grids Earth-departure
trajectories to a named NEA and layers on a launch-vehicle performance curve and a
rough launch-azimuth (DLA) feasibility check.

**b. Do you trust it?** — Somewhat, leaning no — the C3/TOF/contour math looks
structurally right, but the DLA panel cites something called "the two-regime
screening model (INV-016d as amended by Slice 13)," which reads like an invented
internal-standard citation dressed up to sound authoritative, and that's exactly the
kind of overclaiming I watch for.

**c. First thing that landed** — The contour overlay lining up sensibly with the
color field (real coupled computation, not decoration) — that's a genuine positive
signal of technical competence.

**d. First thing that confused you** — "INV-016d as amended by Slice 13" — I don't
recognize this as any real standard, and unexplained pseudo-official citations are a
red flag, not reassurance.

**e. Would you spend another 60 seconds on it?** — No — the fabricated-sounding
citation cost it my trust faster than the good chart could earn it back in a
90-second pass.

**f. What signal of ability did the tool send you?** — Coding fluency and some domain
vocabulary, but not calibrated engineering judgment — a real screening tool would
flag its own approximations plainly instead of dressing them in invented-sounding
standards language.

**g. What signal do you think the author wanted to send that didn't land?** — I think
they wanted "we know exactly what's validated versus approximate, down to a citable
internal methodology," but instead it reads as manufactured precision, which is worse
than admitting "this is a rough heuristic" outright.

---

## Bugs / technical observations

No console errors surfaced during any of the three visits. No visual breakage
observed — charts, tooltips, dropdowns, and the pinned-cell/assumptions panels all
rendered and updated correctly across reloads. The one recurring oddity across
personas was the "INV-016d as amended by Slice 13" phrasing in the DLA feasibility
disclosure, which functions correctly but reads as an unexplained, invented-sounding
citation rather than a bug per se.

**DLA feasibility checkbox is OFF by default** — every persona missed it in 90
seconds. The 2020 FK3 demo shot (the whole reason FK3 is the default body) only works
if the user finds and ticks this checkbox. Significant packaging bug surfaced by the
test.

Total time per persona: ~90 seconds active exploration. Bundle hash tested:
porkchopV2-CNuQ5IWX (whichever GitHub Pages was serving, confirmed via two fresh
loads after hard refresh).

---

## SYNTHESIS

**Where all three agreed:** the visualization itself earns fast credibility — all
three immediately recognized it as a real, structurally competent porkchop plot with
genuine underlying calculation. And all three flagged something in the sidebar copy
as trust-costing: "Beyond published curve" (A), missing process narrative (B),
"INV-016d... Slice 13" citation (C). The visualization earns trust; the surrounding
text repeatedly loses it.

**Where they diverged:** A was most forgiving (would give another 60s on polish
alone). C was least forgiving and disengaged fastest — domain expertise let them spot
the manufactured-sounding citation immediately. B disengaged for a different reason:
the page has no answer to the question B cares about (AI-direction process). Currently
the site seems designed for an A-like skim; underserving both B (no methodology
surface) and C (no calibration/approximation acknowledgment).

**The single largest gap:** the tool visibly wants to project "rigorous,
source-grounded engineering judgment," but the artifacts that would prove it are
missing (B: no process narrative) or self-defeating (A: "Beyond published curve"
reads as marketing; C: "INV-016d as amended" reads as invented internal-standard
citation). **The gap is between looking rigorous and being legible as rigorous under
scrutiny.**

**Overall honest reaction:** the underlying computation is solid — porkchop grid,
contour math, DLA logic all behave like a real screening tool. But the packaging is
actively working against the author's likely goal. The tool impresses on a shallow
pass and loses credibility on a careful one, which is the opposite of what you want
when the intended reviewers are the careful-pass type.

---

## Actionable findings distilled

Three specific copy defects, three persona gaps, one interaction bug.

**Copy defects (pre-Slice-14 copy pass):**
1. "INV-016d as amended by Slice 13" → plain-language two-regime description, no
   internal-taxonomy references.
2. "Beyond published curve" → "No published payload data past this C3 — not
   extrapolating" (or equivalent refusing-to-extrapolate phrasing).
3. General sweep for any user-facing "INV-", "DEC-", "Slice N" strings.

**Interaction bug:** DLA feasibility checkbox → ON by default. One-line fix, unblocks
the entire FK3 demo shot.

**Slice 14 three-front scope (each front addresses one persona gap):**
- Front 1 — Methodology surface (Persona B): About/methodology page linking to actual
  repo artifacts as evidence, not marketing claims. Headline feature for the
  post-Cornell audience.
- Front 2 — Validation card (Persona C): source + coverage + validation method + max
  error, small table beside porkchop. All numbers already exist.
- Front 3 — FK3 guided narrative (Persona A): on-load walkthrough, cheap-looking cell
  → DLA overlay → RED verdict → what tool refused. One-time, dismissible.

**Anti-porting invariant:** lock in Slice 14 founding doc. "External libraries are
used only as validation oracles. Aster's math implementations are re-derived, not
imported."
