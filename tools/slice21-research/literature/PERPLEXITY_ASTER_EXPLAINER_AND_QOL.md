PERPLEXITY PROMPTS — Aster explainer + QOL feature research
Two separate queries. Run them separately.

═══════════════════════════════════════════════════════════════════════════
PROMPT 1 — WHAT IS ASTER (explainer / outside framing)
═══════════════════════════════════════════════════════════════════════════

I'm going to describe a project I'm building and I want you to do two
things: (1) restate it back to me in plain language as if explaining it to
a smart person outside the space industry, in 3-4 sentences, and (2) tell
me how this compares to existing tools in the same space — what's
standard, what's unusual about this approach, and who the comparable
audience/user base looks like for similar tools.

THE PROJECT: Aster is a browser-based mission-planning tool for asteroid
and cislunar (Earth-Moon system) trajectories. It's built by a solo
developer/student as a serious engineering credibility artifact — not a
demo or a game — aimed at technical reviewers: engineers, researchers, and
people evaluating the builder's skills. It runs entirely in a web browser,
deployed via GitHub Pages, no backend server.

Core capabilities:
- A catalog of ~42,000 near-Earth asteroids (NEAs) with orbital data,
  screened for trajectory feasibility using patched-conic approximations
  and Lambert solvers (the standard method for computing transfer orbits
  between two points at two times).
- Trajectory screening reports C3 (characteristic energy, a measure of
  launch energy required) for Earth departure to each asteroid, with
  porkchop plots (the standard visualization for launch-window analysis,
  showing energy cost across a grid of departure/arrival dates).
- A live 3D solar-system view showing real body positions computed from
  JPL Horizons ephemeris data (the standard authoritative source for solar
  system body positions), with the camera's default clock now tracking the
  actual current date/time rather than a fixed snapshot.
- All astrodynamics math (Lambert solvers, orbital propagation, coordinate
  transforms) is independently re-derived and validated against poliastro
  (an established open-source Python astrodynamics library) as an external
  correctness oracle — not just copied or wrapped.
- There is an accompanying MCP (Model Context Protocol) server that exposes
  the validated math core as tools an AI agent can call, with structured
  evidence/provenance in every response and explicit refusals when a
  request falls outside validated bounds, rather than a confident-sounding
  wrong answer.

QUESTIONS TO ANSWER:
1. In plain language, what would you tell someone this project actually
   does and why someone would care?
2. What are the closest existing tools or categories this resembles —
   commercial, open-source, government/agency internal, or academic? Name
   specific tools if you know them (e.g. mission-planning software,
   trajectory optimization tools, orbital visualization tools, amateur
   astrodynamics projects).
3. What's genuinely unusual or differentiated about a solo/student-built
   browser-based version of this, versus the existing tools?
4. Who is the realistic audience for something like this beyond the stated
   purpose (credibility artifact) — are there existing communities,
   competitions, or use cases (e.g. citizen science, NEO tracking hobbyist
   communities, university coursework, hackathons) where a tool like this
   would land well?

═══════════════════════════════════════════════════════════════════════════
PROMPT 2 — QOL FEATURES FOR A 3D ORBITAL/SOLAR-SYSTEM VIEWER (exploratory)
═══════════════════════════════════════════════════════════════════════════

I'm looking for quality-of-life features and UX patterns for a 3D
browser-based solar-system/orbital visualization tool, specifically
patterns that solve navigation and discoverability problems in orbital or
astronomical 3D viewers.

CURRENT STATE, so recommendations are grounded in a real gap rather than
generic 3D-UI advice:
- Camera is a target-locked orbiter (rotate around a fixed point, zoom
  along the camera-target line) with NO pan capability at all.
- ~20 keyboard shortcuts exist (focus on specific planets/moons, jump to
  time-range edges, return to "now", camera presets for top-down and
  outer-system views) but NONE of them have any on-screen indication that
  they exist. A first-time user has no way to discover any of it.
  There is no "?" help overlay, no visible shortcut list, no onboarding.
- There is a "reset to home view" gap: some camera presets exist via
  keyboard but there's no obvious/discoverable button.
- Body labels were, until a recent fix, rendered directly on top of the
  visual marker they named, making the marker invisible — a general class
  of "the UI element meant to identify something occludes the thing it's
  identifying" bug.
- Bodies are rendered at true physical scale (correct for an engineering
  tool) with a minimum-screen-size marker system so sub-pixel bodies stay
  visible; no on-screen indication of what a "true scale" claim even means
  to a non-expert.
- No frame-of-reference indicator (no axis triad, no ecliptic reference
  plane/grid, no scale bar, no orientation compass) — after rotating the
  camera there is no way to tell "which way is up" relative to the solar
  system.
- Click-to-select currently has no priority model, so clicking near a
  labeled planet can select a nearby asteroid point instead.

RESEARCH QUESTION: What UX patterns and specific features do
well-regarded 3D space/orbital/astronomy visualization tools use to solve
these exact problems — camera navigation discoverability, keyboard
shortcut discoverability, "lost in 3D space with no way back" recovery,
scale/frame-of-reference communication, and label/marker occlusion? Look
at tools like: planetarium software (Stellarium, Celestia), orbital
mechanics/mission design tools (GMAT, STK/Systems Tool Kit, ESA's tools),
space simulation games with real navigation UX pressure (Kerbal Space
Program, Universe Sandbox, Space Engine), and general 3D CAD/modeling
tools that solved "camera control affordance" (Blender, Fusion 360,
SketchUp) since the underlying problem — orbiting/panning/zooming a 3D
scene with a keyboard-shortcut-heavy interface — is shared even outside
astronomy.

FOLLOW-UP CHAIN: After answering the root question directly, pose and
answer your own most decision-relevant follow-up questions, three levels
deep, in each direction that surfaces something I didn't know to ask for.
For example (don't limit yourself to only these): what's the standard
convention for a persistent-but-unobtrusive keyboard-shortcut hint (corner
overlay, "press ? for help" convention, contextual tooltips on first
use)? What's the standard treatment for scale/distance disclosure in
tools that mix true-scale distances with exaggerated body sizes or vice
versa? What's the standard "you are lost, here's how to get back" pattern
in free-camera 3D tools? Is there a common convention for click-priority
when a labeled object and a dense point cloud overlap? What do
citizen-science or education-facing astronomy tools do differently from
professional mission-design tools, given this project's audience is
mixed?

Keep the output organized by feature category rather than by tool, so
each recommendation is something I could turn into a discrete backlog
item, and flag anything that would require a significant architecture
change versus something that's a small, isolated addition.
