# S17-Q2 RESULT — Trade-study presentation & ranking honesty
# INTAKE PROVENANCE (added at recovery, 2026-08-04): Perplexity, fired 2026-08-03 from PERPLEXITY_PRERESEARCH_S17_TARGET_COMPARE.md (S17-Q2). Source PDF: Untitled_document__13_.pdf (sha256:ae33ee0d97895e03) — NOTE: was mislabeled Q1 in session notes; content is Q2 (opens 'Published asteroid trade studies...').
# Body below is verbatim pdftotext -layout extraction of the source PDF.
# Treat per recursive-research-elicitation: LEADS, not facts; verify-before-lock.
# ---------------------------------------------------------------------------

Published asteroid trade studies generally do not collapse targets into one headline score; they
present a compact comparison table plus target-specific window graphics, then attach caveats
on observability, orbit uncertainty, and model fidelity because accessibility changes materially
with trajectory model and mission assumptions. NASA and peer-reviewed NEA studies
repeatedly warn that first-cut rankings based only on orbital elements or simplified accessibility
proxies are for screening, not final selection, and that launch-vehicle payload numbers from
public curves are contract- and assumption-dependent rather than mission
guarantees.[elvperf.ksc.nasa +3]
Presentation patterns
Published target-selection studies usually put stable, target-level attributes in the main table and
keep opportunity-specific quantities either as ranges, “best case within assumptions,” or in
adjacent graphics. In NASA ARRM work, candidate tables are paired with narrative caveats and
then supported by target-specific trajectory results from broader Lambert or low-thrust searches,
rather than pretending one scalar captures the whole decision. NHATS likewise publishes an
accessible-target table but explicitly says the list should not be read as a complete list of viable
mission targets, signaling that table rows are screening outputs conditioned on the study
assumptions rather than mission-ready rankings.[ntrs.nasa +2]
In practice, the main table tends to carry: designation, absolute magnitude or size proxy, orbit
class and elements, one or more accessibility metrics, mission duration or stay constraints, and
observability/orbit-quality fields when those affect confidence. ARRM is explicit that Lambert
results were combined with known physical characteristics to identify candidates, which is a
strong cue for your tool: physical context belongs in the same comparison surface as trajectory
accessibility, but model-specific caveats should stay visible as notes, not buried. The newer
low-energy NEO literature also frames results as large collections of opportunities with “wide
temporal flexibility” rather than a single best date, which supports showing per-target windows
as distributions or timelines next to the table instead of only one “best launch” cell.[arxiv +1]
For window visualization, the literature most often uses porkchop-style date-vs-duration maps,
target-specific opportunity plots, or timeline views showing feasible departure/arrival bands.
Even when a paper’s exact graphic differs, the analytic purpose is the same: reveal where
minima occur, how broad the low-cost basin is, and whether the candidate is robust to schedule
slip; ARRM explicitly discusses robustness to launch and return date slips as a differentiator
among targets, so a comparison table without a companion window graphic would omit a
decision-critical dimension. For a browser tool, the most mission-design-faithful small-multiples
pattern is one thumbnail per target with the same axes, same color scale, and the chosen
contour quantity fixed across all targets; mixing scales would visually overstate narrow-window
targets and understate broad-window ones.[mdpi +1]
What belongs in a footnote rather than a column is anything assumption-heavy or not
comparable across all rows: exact propulsion model, launch-site assumption,
ephemeris/solution epoch, observability model, and whether the number is Lambert screening,
patched-conics, or fully optimized low-thrust. NASA’s launch-performance site makes the same
point from the vehicle side: underlying vehicle configuration and mission-design assumptions
materially affect performance, and mission-unique requirements require further analysis. So for
your comparison view, “method used” and “confidence/caveat badge” should be persistent
metadata, even if the detailed assumptions expand in a side panel.[elvperf.ksc.nasa]
Ranking pitfalls
The central pitfall is that weighted sums can hide conflict structure. Decision-analysis literature
treats nondominance or Pareto optimality as the right first filter when objectives conflict,
because a weighted sum only returns all Pareto-optimal solutions under convex conditions; for
non-convex fronts, some valid trade options are missed entirely. That matters here because
NEA trades are almost certainly non-convex once you mix launch date, trip time, C3, delivered
mass, target size, and orbit quality; a single weighted score can make a target disappear simply
because the frontier bends the wrong way.[arxiv]
Mission studies also show a domain-specific version of this mistake: simplifying to one
accessibility score based on orbital elements can correlate with good opportunities, but it does
not encode phasing and therefore does not represent an actual mission opportunity. ARRM says
its three-burn ranking parameter “does not represent a real mission opportunity since it does not
take into consideration the phasing of the orbits,” even while being useful as a quick measure
for screening. That is exactly the disclosure your tool should attach whenever you surface any
proxy rank: “screening metric only; not a verified transfer.”[ntrs.nasa]
A better presentation sequence is: first remove dominated options, then show the surviving set
as a Pareto view or filtered scatter, then let users apply weights interactively if they want a
context-specific ordering. The multi-objective literature emphasized in the human-in-the-loop
design paper treats the Pareto front as the representation of trade-offs and the subsequent
“preferred design” step as a separate value judgment by the human, not a property inherent in
the data. In other words, the tool should distinguish “physics says these are nondominated” from
“under your current priorities, this one ranks first”.[mdpi +1]
For a technical audience, the cleanest pattern is:
•​        Default sort by one transparent metric, like minimum verified launch C3 or delivered
mass at fixed vehicle assumption.
•​        Show dominance state explicitly: dominated, nondominated, or insufficient-data.
•​        Keep alternate metrics visible in columns, not hidden behind a composite score.
•​        If a composite score is offered, require visible weights and show how the ranking
changes when weights move.
These patterns are more defensible than publishing a fixed global score because the
decision-analysis literature treats conflicting objectives as preference-sensitive, not reducible to
one universal ranking.[arxiv +1]
Delivered-mass honesty
Public C3-to-payload curves are not all the same thing. NASA’s Launch Services Program says
its performance site reflects performance available via the NASA Launch Services contract and
warns that the terms, performance, and services can differ from what providers advertise or
offer under commercial or other contracts. That means an “official-published” NASA curve is
official for the NASA NLS context, but not necessarily a generic market truth for that
rocket.[elvperf.ksc.nasa]
By contrast, a provider user’s guide is an official-published provider document for preliminary
mission planning, not a contract guarantee for your mission. The Atlas V user’s guide says it is
for preliminary mission planning and preliminary spacecraft design, giving first-order
compatibility and being subject to change and revision periodically. So your tool should label
these sources separately: “official-published NASA contract performance,” “official-published
provider planning guide,” and “third-party-estimated curve digitization/model” when
applicable.[ulalaunch +1]
The standard caveats attached in better studies are:
•​       Vehicle configuration matters.
•​       Mission design assumptions matter.
•​       Launch site and injection conditions matter.
•​       Mission-unique requirements reduce usable performance.
•​       Preliminary curves are for screening/pre-phase-A style use, not final performance
commitment.
NASA states all of these in substance on its performance site, and the Atlas guide states the
preliminary-planning role directly.[ulalaunch +1]
On interpolation error, the literature and official sites are more cautious than quantitative. The
official sources here do not publish a universal interpolation error bound; instead they warn that
assumptions and updated information change the curves, which means interpolation error is
only one part of the uncertainty budget. For a tool, the honest position is: linear interpolation
between official-published C3 points is a third-party-estimated approximation unless the source
itself specifies interpolation; the number should be flagged “third-party-estimated from
official-published curve,” and the UI should expose the bracketing published points used for
interpolation.[ulalaunch +1]
A robust delivered-mass card should therefore show:
•​       Mass value.
•​       Vehicle/source type: official-published NASA, official-published provider, or
third-party-estimated.
•​       Bracketing C3 points used.
•​       Whether the curve is digitized, tabulated, or directly queried.
•​       A caveat that mission-specific performance analysis can differ.
That is consistent with the published caveats on both NASA and provider
sources.[elvperf.ksc.nasa +1]
Failure modes
A documented failure mode is treating low-order accessibility proxies as if they were verified
transfer results. ARRM’s own text is unusually clear: its orbit-elements-based ranking parameter
is useful for quickly estimating potential performance, but it is not a real mission opportunity
because phasing is absent. That is the same family of problem that affects Benner-style
low-\Delta V lists and similar Shoemaker-Helin approximations: good for coarse screening,
dangerous for final selection when phasing, launch window width, and return geometry
matter.[planet4589 +1]
A second failure mode is displaying only the minimum value and hiding window brittleness.
ARRM explicitly compares targets partly on robustness to launch and return date slips, which
means a target with a slightly worse best-case \Delta V but a broad feasible window can be
programmatically better than a target with a sharp, fragile minimum. Any table that shows only
“best \Delta V” without window width or slip sensitivity will systematically mislead reviewers
about schedule risk.[ntrs.nasa]
A third failure mode is suppressing model-fidelity provenance. The newer low-energy NEO
literature contrasts patched-conics-style survey methods with more complex dynamical models
and notes that trajectory representation influences target ranking, especially for low-thrust or
libration-point-enabled architectures. Better tools should therefore disclose at least: dynamics
model, propulsion model, search resolution, ephemeris source/epoch, and whether the value
shown is screening, refined, or validated.[arxiv +1]
LEVEL 1
1) Which comparison primitive should be primary: ranked table, Pareto scatter, or window
thumbnails?
Why this matters for the tool: it determines the default cognitive frame users adopt, and the
wrong primary view encourages false precision.
For a technical asteroid-planning tool, the primary comparison primitive should be a table with
persistent nondominance status and a synchronized Pareto scatter, while per-target window
thumbnails sit beside or below it as supporting small multiples rather than the sole comparison
surface. Mission studies still rely on tables for target metadata and screening outputs, but both
ARRM and the decision-analysis literature show that real decisions depend on conflicting
objectives and robustness, which a table alone cannot represent cleanly. The most defensible
default is therefore “table + Pareto + aligned window thumbnails,” not “single ranked list”.[mdpi
+1]
Numbers in this answer:
•​       “3 views” is a design recommendation, not a published number.
2) Should the tool ever publish a single overall rank?
Why this matters for the tool: a single rank is tempting for usability, but it can become the de
facto decision even when it is analytically unjustified.
It should not publish a universal overall rank by default. Weighted-sum methods depend on user
preferences and can miss Pareto-optimal points on non-convex fronts, while mission-specific
proxy scores can fail to represent real trajectories because phasing and window structure are
omitted. If a rank is offered, it should be explicitly user-weighted, reversible, and accompanied
by dominance status plus a warning when the underlying values are proxy-based or
mixed-fidelity.[arxiv +1]
Numbers in this answer:
•​       No load-bearing published number used.
3) What should be the minimum provenance disclosure for delivered-mass numbers?
Why this matters for the tool: delivered mass is likely to dominate decisions, and a polished but
provenance-free number invites overtrust.
Every delivered-mass value should disclose at least source class, vehicle configuration context,
whether the payload number is directly published or interpolated, and that mission-unique
analysis can change the result. NASA states that its performance information is tied to the NLS
contract context and may differ from provider advertising or other contracts, while provider
guides frame their numbers as preliminary planning data subject to change. So the minimum
provenance badge should separate official-published from third-party-estimated and keep the
caveat visible at point of use, not hidden in documentation.[ulalaunch +1]
Numbers in this answer:
•​       No load-bearing published number used.
LEVEL 2
1A) How should nondominance be shown without overwhelming users?
Why this matters for the tool: Pareto concepts are correct but can be unusable if the interface
turns into a methods lecture.
Show nondominance as a simple categorical state in the table and let the scatter plot carry the
geometry. Decision-analysis literature treats the Pareto front as the natural representation of
conflicting objectives, but it does not require every user to inspect a full optimization workflow; a
practical UI can mark rows as nondominated while preserving expert access to the frontier view.
For mission-design use, that means a row badge plus an interactive scatter with selectable axes
is enough to preserve the analysis structure without burying users in formalism.[mdpi +1]
Numbers in this answer:
•​       “2 display elements” is a design recommendation, not a published number.
2A) If user-weighted ranking is allowed, what guardrail matters most?
Why this matters for the tool: once weights exist, users will overread the resulting order unless
the system actively resists false certainty.
The most important guardrail is sensitivity visibility: when weights change slightly, the tool
should show whether the top-ranked targets are stable or flip quickly. The human-in-the-loop
multi-objective literature separates Pareto generation from preference articulation precisely
because preference-sensitive rankings are not intrinsic truths, and weighted-sum literature
warns that scalarization can hide the frontier’s structure. So the UI should never present a
weighted rank without also showing nearby alternatives and rank instability under small
preference changes.[arxiv +1]
Numbers in this answer:
•​       No load-bearing published number used.
3A) Should interpolation be done at all when only sparse official-published C3 points exist?
Why this matters for the tool: refusing interpolation may make the tool feel incomplete, but silent
interpolation can fabricate confidence.
Yes, but only as a third-party-estimated convenience layer over official-published source points,
never as an unflagged “official” value. NASA’s and ULA’s published materials support
preliminary mission planning and explicitly warn that mission assumptions and updates matter,
so interpolation is acceptable for screening only when the underlying source points remain
visible and the estimate is clearly labeled as derived rather than published. If the bracketing
points are wide apart or sourced from a plotted graphic rather than a native table, the UI should
elevate the caveat because digitization and interpolation uncertainty
compound.[elvperf.ksc.nasa +1]
Numbers in this answer:
•​       No official-published interpolation error bound found in the cited primary sources.
LEVEL 3
2A-i) What is the single best way to communicate rank instability to reviewers?
Why this matters for the tool: reviewers often remember only the top line, so instability has to be
made visible in one glance.
The best single device is to pair any weighted rank with a neighboring nondominated set and a
visible “rank changed under nearby weights” indicator. That preserves the decision-analysis
separation between feasible trade space and preference choice, and it directly counters the
false impression that a weighted first place is structurally superior rather than locally preferred.
In mission-design terms, this is the UI equivalent of keeping alternate feasible trajectories on the
table instead of declaring one universally best.[ntrs.nasa +2]
Numbers in this answer:
•​       No load-bearing published number used.
LOAD-BEARING NUMBERS
•​       “2010 to 2040” — ARRM Lambert scan search span for NEAs in the screening
database; official-published in NASA conference paper.[ntrs.nasa]
•​       “Every 30 days” — ARRM outbound and inbound departure-window sampling cadence;
official-published in NASA conference paper.[ntrs.nasa]
•​       “Up to 5 years” — ARRM flight-time search increment range ceiling; official-published in
NASA conference paper.[ntrs.nasa]
•​       “Less than 10 km/s” — ARRM one-way \Delta V recording threshold for mission
opportunities in the database; official-published in NASA conference paper.[ntrs.nasa]
•​       “100 m or larger” — ARRM Option B target-body scale for candidate NEAs;
official-published in NASA conference paper.[ntrs.nasa]
•​       “2 to 4 meter” — ARRM boulder return size range; official-published in NASA conference
paper.[ntrs.nasa]
•​       “2000 to 3000 s” — ARRM cited SEP specific impulse range; official-published in NASA
conference paper.[ntrs.nasa]
•​       “40 to 50 kW” — ARRM cited SEP power range; official-published in NASA conference
paper.[ntrs.nasa]
•​       “Less than 2 N” — ARRM cited low-thrust capability scale; official-published in NASA
conference paper.[ntrs.nasa]
•​       “Over one year” — ARRM required asteroid stay duration described for characterization
and planetary-defense operations; official-published in NASA conference paper.[ntrs.nasa]
•​       “Over 60 asteroids” — ARRM count of asteroids with radar observation opportunity
before 2020 likely larger than 100 m; official-published in NASA conference paper.[ntrs.nasa]
•​       “1.3 au” — NEO perihelion threshold quoted in the 2026 low-energy round-trip paper;
official-published in peer-reviewed preprint.[arxiv]
•​       “5.2 au” — sphere radius associated with Jupiter-orbit limit in the same paper’s
introductory definition context; official-published in peer-reviewed preprint.[arxiv]
•​       “2026-03-29” / “29 Mar 2026” — arXiv submission date for the low-energy round-trip
paper version read here; official-published.[arxiv]
•​       “March 2010” — Atlas V user guide revision date read here; official-published provider
document.[ulalaunch]
•​       “Revision 11” — Atlas V user guide revision identifier; official-published provider
document.[ulalaunch]
