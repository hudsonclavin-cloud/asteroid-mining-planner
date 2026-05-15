# Aster — Product Vision

*Written 2026-05-15. Personal clarity doc.*

## What this is

Aster is the project I'm building toward "browser-based asteroid mining mission planner." This document is for me — to articulate what I'm actually doing, separate what's built from what's planned, and be honest about the open questions.

## The thesis in one paragraph

The economic value of asteroid mining depends on a fact most people don't know how to compute: which specific asteroids are actually accessible. Among ~35,000 catalogued NEAs and a million catalogued main-belt bodies, only some fraction have Δv requirements low enough that a redirect-and-capture mission is feasible. Of those, only some fraction have compositions worth mining. Aster's purpose is to make that fraction computable in a browser — to take honest orbital data, run real mission cost calculations, layer in composition estimates and economic modeling, and produce a credible feasibility ranking. Nobody else has built this as a free, browser-based, interactive tool. The professional tools (JPL Trajectory Browser, NASA Eyes) either solve narrower problems or don't expose the actual computation.

## Why I'm building it

Three honest reasons, in roughly the order they emerged:

**I wanted to know if asteroid mining is actually real.** The popular framing oscillates between "trillion-dollar industry" and "fantasy hype." Both feel wrong. The actual answer requires running the numbers — which nobody seems to do publicly with rigor. Building Aster forces me to do them.

**I wanted to make something where the engineering depth matched the ambition of the question.** Most high school projects either pick small questions (model a CO2 sensor) or hand-wave big ones (build a "platform" that doesn't compute anything). Asteroid mining mission planning is genuinely hard — orbital mechanics, mission design, propulsion modeling, economic feasibility — and tractable enough to make real progress on as a solo project.

**I wanted to build something that's actually useful, not impressive-looking-for-applications.** If Aster works it serves people who are seriously thinking about space resources — researchers, investors, policy folks. If it doesn't work it teaches me what I'd need to learn to make it work.

## What's built (Slices 1-9, May 2026)

The current Aster is a browser-based 3D solar system visualization at honest scale. Concretely:

- The sun, eight planets, major moons (Earth-Moon, Galileans, Saturn's major moons, Mars's Phobos and Deimos)
- Saturn's ring substructure including Cassini Division
- 1,008 asteroids rendered with Keplerian propagation from JPL Horizons-anchored orbital elements
- Asteroid belt visible as a glowing band of overlapping orbital ellipses between Mars and Jupiter
- Three-mode LOD rendering (Points → InstancedMesh → individual Mesh) based on apparent diameter
- Click-to-focus on any body with smooth camera retargeting
- Time scrubbing with continuous Keplerian propagation
- Camera-relative floating origin pipeline supporting honest solar-system distances without floating-point precision loss

Slice 8 (in progress) extends this to 10,000+ asteroids with spatial-index-driven frustum culling and GPU instancing at scale.

The architecture has held discipline I'm proud of: invariants enforced via test harnesses (INV-001 through INV-013), pre-research before scope decisions, founding-doc-first design, multi-agent dispatch via Codex with manual verification gates. Seven slices shipped under this pattern.

Deployed at `hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/`.

This is what Aster currently is. It is not yet the mission planner.

## What's planned (Slices 10-14, the mission planner build)

The visualization is infrastructure. The mission planner is the actual product. Concretely, Slices 10-14 (rough scope, will be refined as each slice is reached):

**Slice 10: Lambert solver + Earth-departure screening.** For each NEA, compute the minimum Δv required to reach it from Earth across a launch window. Patched-conic two-body assumption. Output: ranked NEA list by Earth-departure cost. Probably 4-5 weekends. This is where Aster stops being a visualization and starts being a planner.

**Slice 11: Rendezvous and porkchop plots.** Extend Slice 10 to compute both Earth-departure and asteroid-rendezvous Δv. Add interactive porkchop plot drill-down for selected candidates (launch date × transfer duration grid). Output: per-asteroid optimal mission cost across a launch window. 4-5 weekends.

**Slice 12: Redirect-and-capture trajectory + lunar gravity assist.** Model the full mission: rendezvous, attach propulsion, ion-thrust the asteroid back toward Earth-Moon system, use lunar gravity assist to capture into NRHO or DRO. This is the architecturally hardest piece — multi-flyby optimization is its own subfield. Probably 6-8 weekends. May trim scope to "simplified analytical lunar assist" rather than full optimization.

**Slice 13: Composition and economic modeling.** Layer in asteroid composition estimates (spectral class → likely material composition → economic value per ton at Earth surface, accounting for delivery costs vs lunar-base bulk use). Mission feasibility = (composition value × deliverable mass) / mission cost. 4-5 weekends.

**Slice 14: Full UI integration.** Sortable mission cost rankings, 3D scene color-coding by accessibility, porkchop drill-down on click, mission detail panels. The actual product surface. 4-5 weekends.

If these timelines hold, the full mission planner is roughly 22-27 weekends — about 6 months of focused work starting from Slice 8 cutover. Realistically that pushes complete v1 to late 2026 or early 2027, accounting for school transitions and the Anthropic Fellows program if accepted.

## What I'm deferring or saying no to

This is important for clarity. Things I'm explicitly NOT building:

**Rendering fidelity beyond what mission planning requires.** PBR shaders, procedural asteroid surface generation, atmospheric scattering, relativistic corrections, true n-body integration. NASA Eyes doesn't have most of these either. They look cool, they don't change mission cost estimates. Documented in V2 founding doc §10.

**Engine-level features.** Aster is a focused tool, not a general-purpose orbital simulator. No support for non-Sol systems, no spacecraft authoring, no scenario editor. If you want those, use GMAT or Universe Sandbox.

**Real-time observations.** Aster uses fixed orbital element fixtures anchored at known dates. It is not a live telescope feed. Updates come from periodic re-anchoring against JPL Horizons, not streaming data.

**Mobile-first design.** Aster is desktop-browser optimized. Mobile may work; it's not the priority surface.

## The engineering arc and what I've learned

Roughly: V1 (Aster Mar-Apr 2026) was a single-file vanilla-JS prototype that produced impressive screenshots but had no architectural discipline. It worked because it was small. As I added features (mission visualization, multiple asteroid catalogs, complex camera modes), the architecture started failing — bugs were entangled, regressions were silent, debugging required rebuilding mental models for each session.

V2 (April-present) is the disciplined rebuild. Hard invariants enforced via tests. Pre-research before architectural decisions. Founding docs before implementation. Multi-agent dispatch with manual verification gates. Slices that ship cleanly and polish later. Seven slices in, the pattern works. I can ship a slice, polish it in 0.1 cleanup, move to the next slice without dragging legacy decisions forward.

The shape of the discipline isn't unique to Aster — it's a general engineering pattern. But applying it consistently as a solo developer required learning by failure. Slice 3 (Jupiter) had to be redone twice because I scoped it wrong. Slice 4 (Saturn) introduced ring substructure prematurely and had to be split. Slice 6 (Mars) had a marathon five-round debug session that surfaced a render-vs-focus position bug class I now know how to prevent. Slice 7 (asteroids) almost shipped without the belt visual because I tuned the wrong shader parameter; research validation caught it.

What I've learned, in honest order:

1. **Architectural discipline is cheap to skip and expensive to retrofit.** Every shortcut I took in V1 cost more time later than the discipline would have cost upfront.
2. **Test harnesses catch regressions but not visual bugs.** Manual verification at the browser is mandatory, not optional.
3. **Research before architectural decisions is high-leverage.** The cases where I skipped research and committed to designs based on intuition produced wrong designs every time.
4. **Codex multi-agent dispatch is real productivity.** Used carefully — with explicit ownership, frozen subsystems, and manual verification — it ships work substantially faster than solo coding.
5. **Tired-me makes bad architectural decisions.** I've learned to recognize when I'm about to lock something I shouldn't and to push back on myself.

## Open questions I haven't resolved

Things I genuinely don't know yet:

**Whether Slice 10-14 timeline holds.** The visualization slices were predictable in scope. Mission planner slices involve algorithm research (Lambert solvers, gravity-assist optimization) where I don't have direct prior experience. The estimates above are calibrated against Slice 7's actual 4-weekend cost, but with much higher uncertainty.

**Whether the mission planner numbers will be credible to actual aerospace people.** Patched-conic two-body approximations are educational but not what NASA uses. If Aster's outputs are 20% off from JPL Trajectory Browser, that's probably fine. If they're 200% off, the tool isn't useful. I won't know until I can compare.

**Whether the asteroid mining thesis is actually defensible.** Aster's value depends on asteroid mining being plausibly economically viable in some scenario. If the numbers come back showing it's not — that even the best candidates require Δv budgets making them economically infeasible at any plausible commodity price — then Aster's product becomes "the tool that proved asteroid mining doesn't work yet," which is interesting but different from what I'm pitching.

**Whether college timing will let this ship.** I start at NC State engineering in August 2026. Possibly Anthropic Fellows in July 2026 if accepted. Mission planner work (Slices 10-14) overlaps that transition. Realistic question: do I keep building through college, pause Aster for first semester, or hand parts off to collaborators?

**Whether what I'm building is the actual product, or whether I should pivot.** The visualization is impressive engineering but not the asteroid mining tool. If Slice 10 surfaces unexpected difficulty, do I push through or recognize that the actual market need is somewhere adjacent (academic research tool? educational platform? something else)?

## The honest summary

What I have built so far is real engineering — a deployed, working, technically interesting solar system visualization with discipline that produces shippable slices. What I'm planning to build is harder than what I've built so far — algorithmic depth in trajectory optimization, integration of multiple complex computations, real product UI. The execution risk is non-zero. The thesis I'm betting on (that asteroid mining feasibility is computable and the resulting tool is useful) might be wrong. I'm building anyway because the only way to find out is to build it.

If Aster works, it's a real product that serves a real audience. If it doesn't, I'll have spent a year learning orbital mechanics, mission design, real software architecture, and the difference between impressive engineering and actually-useful tools. Both outcomes are worth it.

---

*Document state: written quickly for personal clarity. Likely contains overconfident bits about engineering and underconfident bits about the product thesis. Revise as state changes.*
