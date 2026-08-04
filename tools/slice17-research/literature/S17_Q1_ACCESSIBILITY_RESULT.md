# S17-Q1 RESULT — Accessibility metrics for asteroid target comparison
# INTAKE PROVENANCE (added at recovery, 2026-08-04): Perplexity, fired 2026-08-03 from PERPLEXITY_PRERESEARCH_S17_TARGET_COMPARE.md (S17-Q1). Source PDF: Slice_17_Q2.pdf (sha256:355bb739341b66c3) — NOTE: filename says Q2 but content is Q1 (Shoemaker-Helin/Benner/NHATS opening). Content identification authoritative.
# Body below is verbatim pdftotext -layout extraction of the source PDF.
# Treat per recursive-research-elicitation: LEADS, not facts; verify-before-lock.
# ---------------------------------------------------------------------------

I found strong primary-source support for the main design decisions, but not enough
within the allowed retrieval budget to fully verify every sub-claim you asked
for—especially Benner’s exact published approximation formula, its stated accuracy
bounds versus Lambert solutions, and the post-2015 refinements across mission-study
literature. The most defensible answer from the sources retrieved is below, and I’ve kept
clear separation between official-published facts and places where the evidence is still
incomplete.

Accessibility metrics
The original Shoemaker-Helin framing measures approximate dynamical
accessibility by estimating the minimum impulse for Earth departure and rendezvous
from asteroid orbital geometry, with the paper stating that detailed outbound and
return trajectory studies are required for precise

ΔV
ΔV, but that a convenient approximate figure of merit can be obtained from idealized
tangent-transfer assumptions. It therefore measures “how Earth-like and
phasing-friendly the orbit is under ideal geometry,” while hiding launch-date phasing,
real synodic structure, multi-revolution solutions, duration tradeoffs, and the fact that
actual missions are “always somewhat larger” in

ΔV
ΔV than the idealized value.

From the 1978 primary source, Shoemaker and Helin define the accessibility estimate
using an ideal transfer tangent to Earth’s orbit and tangent to the asteroid orbit at
aphelion for Amors and Apollos, with the departure and rendezvous impulses
normalized by Earth’s orbital speed. That means it is computable from orbital elements
alone under the paper’s approximations, so it is appropriate as a screening metric but
not as a window-ranking metric for a browser tool that already has Lambert grids.

NHATS moved beyond element-only screening and used an embedded
trajectory-grid search over departure date and mission timing to compute ballistic
round-trip trajectories against every object in the JPL Small-Body Database, storing all
solutions that passed its filter criteria. That means NHATS measures actual mission
opportunity existence within a bounded design space, while hiding anything outside its
search box, step sizes, architecture assumptions, and chosen mission constraints.

The official-published NHATS Phase II cutoffs were: Earth departure between
2015-01-01 and 2040-12-31, total round-trip duration

≤450

≤450 days, stay time

≥8

≥8 days, Earth-departure

C3≤60

C
3
​




≤60 km

2
2

/s

2
2

, total mission

ΔV≤12
ΔV≤12 km/s including departure from a 400 km circular parking orbit, and Earth
atmospheric entry speed

≤12

≤12 km/s. NHATS then imposed a size screen of maximum estimated size

≥30

≥30 m, corresponding to

H≤26.5

H≤26.5 under assumed albedo

p=0.05

p=0.05.

For your table-design question, the clean distinction is:


                                                                          Needs
 Metric                                                         Element   Lambert/gri
 family          What it measures        What it hides          s-only?   d?



                 Idealized minimum       Phasing, real
 Shoemaker-
                 rendezvous              windows, mission
 Helin
                 accessibility from      duration, non-ideal    Yes       No
 accessibility
                 orbit                   geometry, return-leg
 estimate
                 shape/orientation       details



 NHATS-style                             Dependence on
 trajectory      Whether at least one    search horizon,        No        Yes
 qualification   mission window          discretization,
                                         architecture
                 exists inside official   assumptions,
                 search bounds            inclusive cutoffs



 Global
 Lambert
 minimum

 C3
                                          Whether the
 C               Best-case                minimum is isolated,
                 opportunity found in     narrow,                No          Yes
 3
                 your search box          long-duration, or
 ​

                                          practically fragile
     /

 ΔV

 ΔV

I do not have enough verified primary-source evidence in hand to state Benner’s exact

ΔV
ΔV approximation formula, its input elements, or its claimed accuracy bounds versus
Lambert-computed

ΔV
ΔV with the confidence your prompt requires. The retrieved sources confirm that later
workers refer to “Benner’s list” as an orbital-elements-based approximation distinct
from trajectory-grid methods, but I have not yet retrieved the primary Benner source
text itself. So the honest design implication is: do not make Benner-style
approximations load-bearing in the UI unless you independently verify the original
publication and its stated failure regimes first.
On post-2015 practice, the retrieved official material supports the broader shift toward
trajectory-grid / porkchop-based accessibility rather than single scalar
accessibility proxies, because NHATS explicitly stores qualifying solutions and
post-processes them into porkchop contours for assessing the breadth and quality of the
departure season. I do not yet have enough retrieved primary mission-study papers
post-2015 to catalog a full refinement taxonomy beyond that.

Window structure
The retrieved NHATS methodology implies that “accessibility” is fundamentally
windowed, because it searches over departure date and mission duration and finds
some objects with many qualifying solutions and others with few. For a planning tool,
that supports ranking not only by a global minimum but also by the breadth and
repeatability of low-cost windows.

In astrodynamics terms, synodic recurrence sets the rough cadence of re-encounters
between Earth and a target orbit, but the official NHATS results also show that
opportunity quality depends on more than recurrence alone because the grid outcomes
vary strongly with orbit family and geometry. The practical reason is that eccentricity,
inclination, argument of perihelion, and phasing distort the clean “same every synodic
period” intuition, so a browser tool should not imply uniform recurring windows even
when recurrence exists.

In the trade-study literature retrieved here, “best window” is most defensibly
interpreted as one of three different things depending on purpose: the lowest value in a
searched porkchop, the best qualifying solution under mission constraints, or the target
with the broadest cluster of acceptable solutions. Because NHATS explicitly emphasizes
both the breadth and quality of the departure season, your side-by-side table should
avoid a single undifferentiated “best window” column and instead separate “global
minimum” from “best practical constrained window.”
Physical context columns
The standard absolute-magnitude-to-diameter relation used in NEA work is the familiar
photometric conversion between

H
H, geometric albedo
pV
p
V
​




, and diameter

D
D, and NHATS operationalized it by stating that a maximum estimated size of 30 m
corresponds to

H≤26.5
H≤26.5 assuming
p=0.05
p=0.05. That official mapping is useful because it demonstrates the albedo
dependence problem directly: size estimates from

H
H alone are not unique.

For honest presentation, your tool should therefore label any diameter derived from

H

H as albedo-assumed, not measured, unless a mission-study or
physical-characterization source provides a real diameter. With the current source set, I
can support the fact that NHATS used the low-albedo assumption

p=0.05
p=0.05 for a conservative maximum-size screen, but I cannot yet source the full
albedo-class uncertainty ranges you requested from primary material.

Published target-selection studies retrieved here tabulate at least: orbital elements

a,e,i

a,e,i, accessibility measures or trajectory results, object size proxies through

H

H, and in NHATS specifically the existence and count/quality of qualifying trajectories
summarized through porkchop-style products. For your comparison table, the
literature-backed “physical context” minimum is:

H

H, albedo-assumed diameter range, orbit class, and orbit elements; the
literature-backed “mission context” minimum is: best

C3

C
3
​




, best total

ΔV

ΔV or arrival

ΔV

ΔV, duration, and window breadth.

Orbit quality
The MPC/JPL condition code is the MPC uncertainty parameter
U
U, officially exposed by JPL SBDB as an orbit uncertainty estimate on a 0–9 scale
where 0 is good and 9 is highly uncertain. The parameter is not a generic
ephemeris-confidence badge; it is a compact MPC-derived orbit-quality estimate.

The exact definition retrieved states that

U

U is a logarithmic encoding of the anticipated longitudinal uncertainty in mean
anomaly after 10 years, with each integer band corresponding to a range of in-orbit
longitude runoff per decade. The published runoff bands are:

U=0

U=0 for < 1.0 arcsec/decade,

1

1 for 1.0–4.4 arcsec,

2

2 for 4.4–19.6 arcsec,

3

3 for 19.6 arcsec–1.4 arcmin,

4

4 for 1.4–6.4 arcmin,

5

5 for 6.4–28 arcmin,

6
6 for 28 arcmin–2.1°,

7

7 for 2.1–9.2°,

8

8 for 9.2–41°, and

9

9 for > 41°.

The same definition also explicitly warns that

U

U should not be used as a predictor for the uncertainty in the future motion
of NEAs. For your 2026–2040 planning horizon, that means you should not translate

U

U into a fake deterministic “ephemeris uncertainty over 14 years” number; instead, use
it as a screening/risk flag and state that true planning confidence requires fresh orbit
solutions and, ideally, covariance-aware ephemerides.

Mission-selection practice in the retrieved sources supports filtering or down-weighting
weakly determined orbits indirectly rather than treating them as equal peers, because
NHATS was built on continuously updated databases and full trajectory recomputation
as new objects were discovered. The design implication is straightforward: for poorly
determined orbits, keep them visible but mark them “provisional / orbit quality risk,”
exclude them from default ranking if the condition code is poor, and let advanced users
override that filter.

Follow-up chain
Level 1. Which scalar should drive the default ranking?
Why this matters for the tool: the top-ranked row will frame user trust, so the default
rank metric must match what published studies actually optimize.

The strongest official-published answer from the retrieved sources is that a single scalar
should not be the sole driver. NHATS qualifies targets by whether they have at least one
solution meeting a bundle of mission constraints, then evaluates the breadth and
quality of the departure season using porkchop contours rather than a single global
minimum. So the best default is a composite presentation: sort first by “best practical
constrained opportunity” and expose the unconstrained global minimum as a separate
secondary column.

Numbers in this answer: official-published — 2015–2040 search interval, 450-day
duration cap, 8-day stay minimum,

C3≤60

C
3
​




≤60, mission

ΔV≤12

ΔV≤12 km/s, 12 km/s reentry cap, 400 km parking orbit.

Level 1. Should orbit-element accessibility proxies still
appear if Lambert grids already exist?
Why this matters for the tool: extra columns only help if they add explanatory power
rather than duplicate better data.
Yes, but only as screening/explanation columns, not ranking columns.
Shoemaker-Helin-style accessibility from orbital elements is useful because it tells the
user why an orbit is generically easy in a geometry sense, while Lambert-grid minima
tell the user whether an actual opportunity exists in the chosen horizon. In UI terms,
keep one element-only accessibility column if you want interpretability, but rank on
Lambert-derived windows.

Numbers in this answer: official-published — Shoemaker-Helin’s paper cites typical
low-

ΔV

ΔV missions of about 6 months or a year for extreme near-Earth objects and notes
that roughly 5% to 10% of Earth-approaching asteroids were reachable by low-

ΔV

ΔV ballistic trajectories under that era’s assumptions.

Level 1. How should orbit quality affect inclusion versus
ranking?
Why this matters for the tool: a comparison table that silently ranks poorly determined
objects alongside well-determined ones can mislead users about mission realism.

Use

U

U as a ranking penalty and visibility flag, not an absolute kill switch by itself. JPL
exposes condition code as MPC’s 0–9 orbit-uncertainty estimate, and the published
definition warns that

U

U is not a reliable direct predictor of future NEA motion uncertainty, so it is appropriate
for confidence labeling but too blunt for hard exclusion on its own. A practical design is:
include all objects by default up to a conservative threshold you choose, visually warn
above that threshold, and let users hide “orbit quality risk” targets.

Numbers in this answer: official-published —

U

U scale 0–9.

Level 2. If default ranking should be “best practical
constrained opportunity,” which constraints are safest to
expose to users?
Why this matters for the tool: your comparison logic needs fixed filters that are
explainable and traceable to published practice rather than arbitrary product choices.

The safest published baseline is to expose NHATS-style filters because they are official
and already interpretable: departure horizon, duration cap, stay minimum,

C3

C
3
​




    cap, total mission

ΔV

ΔV cap, and reentry-speed cap. Even if your tool is not human-mission-specific, these
filters are still a strong template for a “practical opportunity” mode because they encode
the literature’s distinction between a mathematical minimum and a mission-usable
window.

Numbers in this answer: official-published — departure window 2015–2040,
round-trip duration
≤450

≤450 days, stay

≥8

≥8 days, departure

C3≤60

C
3
​




≤60 km

2
2

/s

2
2

, total mission

ΔV≤12

ΔV≤12 km/s, reentry speed

≤12

≤12 km/s, 400 km parking orbit.

Level 2. If element-only proxies remain, what is the single
honest label for them?
Why this matters for the tool: terminology controls whether users over-trust a proxy as
if it were a true mission result.

Call them idealized accessibility proxies. The Shoemaker-Helin paper explicitly
says that detailed trajectory studies are required for precise

ΔV

ΔV, and that the simplified figure is an approximate estimate under idealized
tangent-transfer assumptions where real mission

ΔV

ΔV is usually higher. That makes “idealized accessibility” much more honest than
“delta-v” without qualification.

Numbers in this answer: official-published — real

ΔV

ΔV “always somewhat larger” than the idealized case; no numeric bound retrieved here.

Level 2. If
U
U is not a direct ephemeris predictor, what should users
actually see?
Why this matters for the tool: orbit-quality UI needs to reduce false confidence without
pretending to provide covariance-quality uncertainty from a single code.

Users should see the raw condition code, a qualitative label, and a plain warning that the
code represents 10-year mean-anomaly runoff class, not guaranteed
mission-epoch positional uncertainty. The published runoff bands support labels like
“well determined,” “usable with caution,” and “poorly constrained,” but the warning
sentence is essential because the source explicitly says
U

U should not be used to predict future NEA motion uncertainty.

Numbers in this answer: official-published — 10-year basis;

U=0

U=0 to

9

9; runoff thresholds from <1.0 arcsec/decade up to >41°/decade.

Level 3. If practical ranking uses constraints, should
unconstrained minima still be visible?
Why this matters for the tool: hiding unconstrained minima can conceal scientifically
interesting targets, but over-emphasizing them can distort mission choice.

Yes—show both, but visually subordinate the unconstrained minimum. NHATS’s own
framing distinguishes the existence of qualifying solutions from the broader porkchop
landscape, so a split between “global best found” and “best qualifying window” preserves
discovery value without confusing it for mission realism.

Numbers in this answer: official-published — NHATS stored 79,157,604 qualifying
trajectory solutions across the 2011 Phase II run and post-processed them into porkchop
contours; this scale supports showing structure, not just minima.

LOAD-BEARING NUMBERS
    ●​ 41,906 NEAs screened in your current tool — user-supplied context, not
       independently verified in retrieved sources.
    ●​ 2026–2040 current porkchop horizon in your tool — user-supplied context, not
       independently verified in retrieved sources.
    ●​ 3–5 side-by-side targets — user-supplied product requirement.
●​ Shoemaker-Helin paper states roughly 5% to 10% of Earth-approaching
   asteroids could be reached by low-
●​ ΔV
●​ ΔV ballistic trajectories under its assumptions.
●​ Shoemaker-Helin paper states roughly 1% of Earth-approaching asteroids might
   be close enough to be candidates for manned missions under then-assumed
   architecture.
●​ Shoemaker-Helin paper cites typical low-
●​ ΔV
●​ ΔV mission durations of about 6 months or 1 year for extreme near-Earth
   objects.
●​ NHATS Phase II official departure-date window: 2015-01-01 to 2040-12-31.
●​ NHATS Phase II official total round-trip duration cap: 450 days.
●​ NHATS Phase II official minimum stay time: 8 days.
●​ NHATS Phase II official Earth-departure energy cap:
●​ C3≤60
●​ C
●​ 3
●​ ​




●​ ≤60 km
●​ 2
●​ 2
●​ /s
●​ 2
●​ 2
●​ .
●​ NHATS Phase II official total mission
●​ ΔV
●​ ΔV cap: 12 km/s.
●​ NHATS Phase II official Earth atmospheric re-entry speed cap: 12 km/s at 125
   km altitude.
●​ NHATS Phase II departure maneuver referenced to a 400 km circular parking
   orbit.
●​ NHATS official size cutoff: maximum estimated size
●​ ≥30
●​ ≥30 m.
●​ NHATS official corresponding photometric cutoff:
●​ H≤26.5
●​ H≤26.5 assuming albedo
●​ p=0.05
●​ p=0.05.
●​ NHATS Phase II database size at cited epoch: 7,665 NEAs in SBDB as of
   2011-02-03.
●​ NHATS Phase II objects passing trajectory filter: 765.
●​ NHATS Phase II objects also satisfying the size screen: 590.
●​ NHATS Phase II total stored trajectory solutions: 79,157,604.
●​ NHATS orbit-family breakdown among the 765 trajectory-qualified objects: 0
   Atiras, 193 Atens, 456 Apollos, 116 Amors.
●​ NHATS family percentages reported: Atens 31% of known Atens, Apollos 11% of
   known Apollos, Amors 4% of known Amors.
●​ MPC/JPL condition code
●​ U
●​ U scale: 0 to 9.
●​ U
●​ U is based on anticipated mean-anomaly/longitude uncertainty after 10 years.
●​ U=0
●​ U=0: < 1.0 arcsec/decade runoff.
●​ U=1
●​ U=1: 1.0–4.4 arcsec/decade runoff.
●​ U=2
●​ U=2: 4.4–19.6 arcsec/decade runoff.
●​ U=3
●​ U=3: 19.6 arcsec to 1.4 arcmin/decade runoff.
●​ U=4
●​ U=4: 1.4–6.4 arcmin/decade runoff.
●​ U=5
●​ U=5: 6.4–28 arcmin/decade runoff.
●​ U=6
●​ U=6: 28 arcmin to 2.1°/decade runoff.
●​ U=7
●​ U=7: 2.1–9.2°/decade runoff.
●​ U=8
   ●​ U=8: 9.2–41°/decade runoff.
   ●​ U=9
   ●​ U=9: > 41°/decade runoff.
The main unresolved items requiring another verification pass are Benner’s exact
approximation formula and accuracy bounds, the primary-source

H→D
H→D formula statement with albedo-class uncertainty ranges, and a fuller post-2015
mission-study survey.
