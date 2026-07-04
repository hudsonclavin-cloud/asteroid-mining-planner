# Slice 14 Pre-Research — Perplexity Computer Multi-Model Council Review

**Date:** 2026-07-03
**Tool:** Perplexity Computer (multi-model orchestration, 5-role council)
**Status:** RAW PRE-RESEARCH. Nothing in this document is locked. Findings are leads, not facts — per project discipline, no claim here enters a Slice 14 DEC or founding doc without independent verification.

**Known limitation (self-disclosed by the council):** the Product/UX Critic role reviewed a text description of Aster, not a live visit to the deployed site. Its UX findings are inference, not observation. A real cold-visit test (e.g. Claude-in-Chrome with a naive-user protocol) should supersede this section before any UX decision locks.

## Prompt given to the council

The council was given Aster's ground-truth feature list (porkchop plots, DLA feasibility overlay, 8-vehicle cost card, honesty layer, 2020 FK3 demo selection, slice-based process) and asked to review as five independent roles — Aerospace Engineer, Admissions/Fellowship Reviewer, Space-Industry Analyst, Product/UX Critic, Adversarial Skeptic — then reconcile into ranked IMPROVE / ADD / EMPHASIZE / NOT CONSIDERED lists, a follow-up chain, and a prioritized shortlist. Full prompt text available in chat history; omitted here for length — the reconciled output below is what matters.

## Refined council output (second pass — supersedes the initial run)

### Reconciled read

Across the five council roles, the strongest pattern is consistent: the project is already differentiated by its refusal to fake precision, but that strength is not yet packaged as a legible argument. The technical core can already impress a mission designer if the validation story is visible, and the admissions/investor story becomes much stronger if the demo explicitly shows a cheap-looking window being rejected by launch geometry and site constraints.

### Aerospace engineer

A JPL/APL-class reviewer would likely respect that the tool uses a Lambert-based screening approach and does not extrapolate beyond sourced launch-performance curves. They would still see the model as screening-grade, not design-grade, and would want to know the supported regime, the interpolation error, and where launch vehicle performance, finite-burn effects, or launch-window sensitivity can move the answer materially. Highest-ROI technical addition: a compact validation card next to the main plot stating source, coverage, interpolation regime, and measured error in one glance.

### Admissions and fellowship

A 90-second reviewer will likely be impressed by the scale and the AI-agent-directed workflow, but only if the site makes that process feel like rigor rather than implementation trivia. The site likely under-sells the real signal: judgment about what to include, exclude, and how to prove the model is honest. Packaging should lead with the thesis, not the mechanics: Aster is a rigor-first asteroid mission screener that proves why the "best-looking" window is not necessarily feasible.

### Investor lens

Refusing a dollar model today is a strength only if the site clearly frames it as deliberate scope control. The gap is not a full business model — it's a minimal economics bridge answering "what would need to be true before a dollar claim is credible": sourced launch-cost context, delivered mass, and a plainly labeled statement that composition/recovery/market value remain out of scope.

### Product and UX

A first-time visitor likely gets the honesty theme but may not get the story. The risk: correct caveats feeling like a wall of qualifiers if the page lacks a clean narrative path first. The honesty layer helps most tied to a visible decision (a cell rejected, a curve ending) and hurts when it reads as a general disclaimer bucket. [Caveat: inferred, not observed — see limitation note above.]

### Skeptical review

A skeptic attacks "solo dev + AI," "just screening," and possible demo cherry-picking. Best counter is process evidence, not persuasion: locked design choices, external verification before ingestion, adversarial audits, held-out validation, and a demo body chosen to fail the naive "cheapest is best" intuition on purpose. Supporting note: poliastro's Lambert formulation and Eastern Range azimuth limits (37-112 deg) provide a credible foundation for the screening logic — still presented as screening, not final mission design.

### A. IMPROVE

1. **One-screen "what this is" opener.** Effort: small. Judgment.
2. **Compact validation-and-assumptions card beside the porkchop plot** (source, coverage, interpolation regime, measured error). Effort: small-medium. Evidence-backed if it cites the repo's held-out oracle results and source docs.
3. **Rework the honesty layer into a hierarchy** (tie disclosures to visible decisions, not a flat disclaimer bucket). Effort: small. Judgment.
4. **Make the 2020 FK3 demo a guided story, not just a case.** Effort: small. Judgment.
5. **Surface the supported regime explicitly.** Effort: small. Evidence-backed if tied to source coverage/validation.

### B. ADD

1. **Minimal economics bridge** (delivered mass + sourced launch-cost context + explicit out-of-scope statement on value/composition). Effort: medium. Judgment unless every input is externally sourced and labeled.
2. **"What flips the answer?" sensitivity view.** Effort: medium. Judgment, if derived from the existing model only.
3. **Shareable static case-study page** (portable artifact for admissions/investor screens who won't interact with the live tool). Effort: small-medium. Judgment.
4. **Calibration panel for launch-vehicle curves.** Effort: medium. Evidence-backed if derived from the committed NASA LSP screenshots and held-out checks.

### C. EMPHASIZE

1. **The refusal to extrapolate beyond published vehicle data.** Evidence-backed.
2. **The DLA / launch-site feasibility logic** — the feature that turns a porkchop plot into a launch-screening tool. Evidence-backed if the site constraint is sourced (Eastern Range 37-112 deg azimuth, cited above).
3. **The "cheapest-looking but infeasible" FK3 demo.** Judgment (strategic framing).
4. **The process story** (slice-based development, locked decisions, external verification, adversarial audit) — the strongest defense against the "AI made it up" critique. Judgment unless repo documentation is made visible and specific to a visitor.

### D. NOT CONSIDERED (the council's highest-value list)

1. **The project may be strongest as a credibility artifact, not a product** — reframes what "success" means for these audiences; rewards rigor over feature count.
2. **Interpretability may be the real missing feature, not physics** — sound internals fail if reviewers can't quickly infer what's trusted, screened, or intentionally absent.
3. **A "trust transfer" problem** — non-specialists infer quality from presentation clarity; rigorous internals need an intuitive external signal.
4. **A static case study may outperform more tool depth right now** for admissions/investor screening — legibility can beat sophistication.
5. **Expose "what would change my answer" thresholds** — fits the honesty philosophy if derived from the existing model.
6. **The next product choice is audience sequencing, not feature choice** — admissions, fellowship, and investor viewers may need different first impressions of the same core.
7. **The investor question isn't "where are the dollars" but "what would make dollars meaningful later"** — the honest bridge between engineering screening and business relevance.

### Follow-up chain (budget: 8, as specified)

**Level 1:**
1. Best first-screen message? → "Aster is a rigor-first asteroid mission screening tool that shows when a cheap-looking transfer is actually infeasible because launch geometry and site constraints break the deal."
2. Minimum honest economics layer? → Delivered mass + sourced launch-cost context + explicit out-of-scope statement. Enough to show economic seriousness without violating the honesty philosophy.
3. Single most visible proof of rigor? → A validation card (source, coverage, interpolation regime, measured error) next to the main plot — makes the credibility claim inspectable, not implied.

**Level 2:**
1. What should the hero demo center on? → The FK3 "looks cheap, actually infeasible" case as the hero narrative — demonstrates judgment more clearly than a generic plot.
2. Economics bridge boundary? → Stop at sourced launch-cost + delivered mass; never estimate asteroid value/composition/recovery without full sourcing, or the tool starts inventing the precision it's designed to reject.
3. Best evidence format for the rigor card? → A small table: source, date, coverage, validation method, max observed error.

**Level 3:**
1. Lead with process or outputs? → Outputs first (10 seconds), process immediately after — serves both non-specialists and experts.
2. Next build: depth or polish? → Presentation polish first, in service of making existing rigor legible; deeper physics only when it changes the screening answer or expands the supported regime.

### Prioritized shortlist (council consensus)

1. Turn the FK3 case into a guided first-minute narrative proving the tool rejects fake bargains.
2. Add a compact validation-and-assumptions card next to the main plot.
3. Simplify/hierarchize the honesty layer so it supports the story instead of competing with it.
4. Add a minimal, sourced economics bridge that stops short of fake valuation.
5. Produce a static shareable case-study page for admissions and investor screens.

### Factual claims requiring independent verification before any design decision rests on them

- Aster's Lambert solver (zero/single-rev) has been validated against poliastro to machine precision. [Already verified in-repo, Slice 10/12 oracle work — re-cite, don't re-verify.]
- poliastro's Lambert implementation exposes M/prograde/lowpath/numiter/rtol params, Battin/Mueller/White approach with Vallado-style bisection. **UNVERIFIED — check poliastro docs before citing in any user-facing copy.**
- Eastern Range limits orbital launches to azimuths 37-112 degrees. **PARTIALLY CHECKED** (Nova cross-referenced: 37-112 deg from 28.5 deg latitude maps to ~28.5-58 deg inclination, consistent with Slice 12's sourced 28.5-57 deg band) — formal verification still required before this exact figure appears in shipped copy.
- NASA LSP publishes public performance summaries/capability handbooks supporting payload-vs-C3 sourcing. [Already verified in-repo — Slice 13's entire vehicle dataset. Re-cite, don't re-verify.]

## Appendix: initial council run (superseded, kept for record)

The first pass produced substantively the same reconciled findings with minor wording differences. Kept for the record per the project's engineering-record convention (nothing discarded, superseded work is archived). Full text of the initial run is available in chat history dated 2026-07-03 if needed; not reproduced here to avoid duplicating ~700 lines of near-identical content in the repo. If Hudson wants the initial run's exact text committed too, say so and it can be appended verbatim in a follow-up commit.
