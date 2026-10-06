# Perplexity pre-research prompt — K2 (asteroid return payloads caught by a LEO rotovator)

Exploratory pre-research for kernel K2. Recursive follow-up directive appended per the
recursive-research-elicitation skill. Output lands next to this file as `PERPLEXITY_RESULT.md`. Every number in it is
a lead until a separate verification pass confirms it.

---

I am designing a planning tool that links an asteroid mission planner to a rotating momentum-exchange tether
(rotovator) in Earth orbit. The tether's center of mass is in a 610 km circular orbit. It has a 320 km half-length and a
2.5 km/s tip speed, so the upper tip moves at about 10.06 km/s inertial at a 7,301 km radius. That is below local
escape speed. Payloads returning from near-Earth asteroids arrive on hyperbolic trajectories with an Earth-arrival
v-infinity. The tether would catch them at the upper tip after a small matching burn, then either release them at the
lower tip for Earth entry, or keep them in orbit. Each inbound catch puts orbital energy back into the tether, offsetting
outbound throws (the "balanced flow" idea from MXER studies).

Answer, with primary sources (NASA/NTRS technical reports, AIAA/JBIS papers, Tethers Unlimited and Boeing study
reports, peer-reviewed papers):

1. What Earth-arrival v-infinity and asymptote-declination ranges do published studies find for returns from
   accessible near-Earth asteroids (e.g., NHATS targets, ARM/ARRM studies, Keck Institute 2012 asteroid retrieval
   study, sample-return missions such as OSIRIS-REx and Hayabusa2)? Give per-mission or per-target values where
   published.
2. What catch relative-velocity tolerance, position tolerance and timing window did MXER, HASTOL or other rotovator
   rendezvous studies assume or demonstrate, and on what basis?
3. In MXER-class designs, what was the total facility mass (tether + central station + ballast), and what
   payload-to-facility mass ratio did they assume? How did they handle the perigee drop after an unbalanced throw?
4. How have published studies modeled inbound "catch and drop" or "catch and hold" traffic restoring tether
   momentum? Did any quantify the fraction of reboost demand that return traffic offsets?
5. For returning payloads, how does aerocapture or direct entry (aeroshell mass fraction, peak heating, peak g)
   compare with propulsive capture at v-infinity of 1–5 km/s? Cite heat-shield mass-fraction data.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a planning tool that decides whether an asteroid return payload should be caught by a LEO rotovator,
and answer each with sources.

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
