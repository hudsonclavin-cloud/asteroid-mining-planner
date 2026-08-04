# Perplexity Pre-Research — Living Sky Arc (Slices 21–23) + Phase 0 clock
# 2026-08-02 · standard Perplexity · one prompt per session, paste whole block
#
# TRIAGE RULES (chat-side, per recursive-research-elicitation):
# - Everything returned is LEADS, not facts. Nothing enters a DEC, invariant,
#   or founding doc without an independent verify-before-lock pass.
# - Curate each LOAD-BEARING NUMBERS list into the verification prompt.
# - Contradictions between levels are findings — log them, don't pick a side.
# - Adopted outputs land in tools/sliceN-research/literature/ when a slice
#   ingests them, one commit per artifact.

═══════════════════════════════════════════════════════════════════════════
QUERY P1 — Browser-side planetary + lunar ephemeris
═══════════════════════════════════════════════════════════════════════════

CONTEXT: I'm building Aster, a fully client-side asteroid/cislunar
mission-planning tool (TypeScript, GitHub Pages, no server). House policy:
all astrodynamics math is re-derived in-house and validated against external
oracles — external libraries are never imported into production. I need
planetary positions correct to the current date and hour in a 3D solar-system
view, and eventually a real lunar ephemeris for cislunar work.

QUESTION: Survey the options for computing planetary and lunar positions
client-side over 2026–2045: full analytic theories (VSOP87 variants, ELP2000
truncations), compact algorithm sets (Meeus-style truncated series), and
precomputed JPL DE-table subsets with interpolation (e.g. Chebyshev
coefficients). For each: achievable accuracy per body (arcsec / km), payload
size, implementation complexity if re-derived from the published theory, and
licensing status of the underlying coefficient data. Cover time-scale
handling: UTC↔TT/TDB conversion, ΔT treatment, and what accuracy loss comes
from ignoring them at display scale. State specifically what "position
correct to the hour" demands for (a) planets viewed at solar-system scale
and (b) the Moon viewed at Earth-Moon scale — which bodies make hourly
accuracy trivial and which make it expensive.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based interplanetary mission-planning tool, and answer
each with sources.

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
QUERY P2 — Earth orientation, texture alignment, and site rendering
═══════════════════════════════════════════════════════════════════════════

CONTEXT: Aster (client-side TypeScript mission-planning tool, house-derived
math only, Three.js rendering) will render an accurate Earth — correct
rotation for the current time, axial tilt, texture aligned to the real prime
meridian — and place named surface sites (launch/landing sites) at their true
geodetic coordinates.

QUESTION: What is the correct model chain for visualization-grade Earth
orientation and surface-point placement? Cover: Earth Rotation Angle vs GMST
(when each applies, formulas' primary sources), obliquity/precession handling
adequate for a viewer (vs full IAU 2006/2000A), the expected error from
ignoring EOP corrections (UT1−UTC, polar motion) — quantify in surface
meters/km; the geodetic (WGS84) lat/lon → ECEF → inertial chain including
the flattening term's visual significance; and the texture-mapping
convention pitfalls (where the prime meridian sits in an equirectangular
seam, axis conventions in common engines). How do NASA Eyes, Celestia, and
CesiumJS each handle this chain, and what accuracy do they claim? List
authoritative coordinate sources for launch sites, deep-space-network
stations, and historic/planned lunar landing sites.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based interplanetary mission-planning tool, and answer
each with sources.

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
QUERY P3 — Gravity: numerical propagation architecture for a browser tool
═══════════════════════════════════════════════════════════════════════════

CONTEXT: Aster currently uses two-body Kepler propagation plus a validated
Lambert solver (patched-conic screening) for asteroid transfer planning. The
next capability is real gravitational dynamics — numerical propagation with
perturbations — implemented in-house in TypeScript/f64, validated against
poliastro and/or GMAT as oracles, running client-side. Long-term the tool
extends to cislunar mission work (Earth-Moon system), so the architecture
should not dead-end at heliocentric.

QUESTION: What propagation architecture do comparable mission-design tools
use, and what should a browser implementation choose? Cover: integrator
selection (RK4 fixed-step vs Dormand-Prince 5(4)/8(7) adaptive — accuracy vs
cost in double precision, step-size control pitfalls); the perturbation ROI
ladder for (a) heliocentric NEA transfers and (b) cislunar trajectories —
where J2, third-body Sun/Moon, and SRP each start to matter, with magnitude
estimates; when patched-conic breaks down and full n-body or CR3BP becomes
necessary for cislunar; how GMAT, poliastro, and Orekit structure their
propagators and what validation test cases they publish that could serve as
oracle fixtures; and typical accuracy-vs-runtime numbers for JS/WASM-class
numerical propagation of a single spacecraft over months-long arcs.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based interplanetary mission-planning tool, and answer
each with sources.

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
QUERY P4 — Live satellite data: sources, licensing, and propagator cost
═══════════════════════════════════════════════════════════════════════════

CONTEXT: Aster (public, static GitHub Pages site, no backend) will display
live-ish satellite positions in an Earth-vicinity view. House policy: no
external astrodynamics libraries in production — math is re-derived in-house
and external implementations serve as validation oracles only. A separate
future product may need conjunction-grade accuracy; the near-term need is
honest display-grade positions with disclosed drift bounds.

QUESTION: Answer four things with primary sources. (1) Data: CelesTrak GP/OMM
JSON and Space-Track — current terms of use for a public browser app,
CORS behavior for direct client-side fetch, redistribution/caching rules,
and update cadence per orbit regime. (2) SGP4 re-derivation scope: what does
a faithful from-the-papers SGP4/SDP4 implementation actually involve
(Vallado's verification test vectors, known implementation pitfalls,
rough size/effort), and which reference implementations (satellite.js,
python-sgp4) are suitable as oracles — including their licenses. (3) Fidelity
gap: quantified position error of a Kepler + J2 secular display propagator
vs full SGP4 at 6 h / 24 h / 7 d for LEO, MEO, and GEO — how fast does
display-grade become misleading per regime. (4) Practice: how public
satellite viewers (heavens-above, satmap-class sites, KeepTrack) handle data
staleness, attribution, and refresh on static/client-side hosting.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based interplanetary mission-planning tool, and answer
each with sources.

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
QUERY P5 — Asteroid catalog freshness on a static site
═══════════════════════════════════════════════════════════════════════════

CONTEXT: Aster ships a 41,906-body near-Earth-asteroid catalog as a static
precomputed artifact on GitHub Pages, originally ingested from JPL SBDB with
Horizons anchoring. "Live data" for asteroids means keeping orbital elements
and the discovery set current — not real-time positions. The refresh, if any,
would run as a CI regeneration job (e.g. GitHub Actions), not a server.

QUESTION: With primary sources: JPL SBDB Query API current terms of use,
rate limits, and bulk-download guidance; whether it supports incremental /
delta queries (elements changed since date X, objects discovered since X) or
only full pulls; how often NEA orbital elements materially change (typical
update cadence after new observations, fraction of catalog updated per
month); the growth rate of the NEA population in 2025–2026 (new discoveries
per month); status in 2026 of adjacent sources previously used by hobbyist
tools — NHATS API and Asterank — are they maintained; and documented
patterns for scheduled static-site data regeneration pipelines (GitHub
Actions cron → commit artifact → Pages deploy) including pitfalls with
multi-MB artifacts in git history.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for a browser-based interplanetary mission-planning tool, and answer
each with sources.

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
