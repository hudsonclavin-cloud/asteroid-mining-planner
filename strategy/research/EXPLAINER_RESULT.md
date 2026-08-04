---
PROVENANCE (added 2026-08-04 — not part of the Perplexity answer)
Query: [EXPLAINER — What is Aster / outside framing / comparables]
Prompt source: [tools/slice21-research/literature/PERPLEXITY_ASTER_EXPLAINER_AND_QOL.md, EXPLAINER]
Fired: [2026-08-03] · standard Perplexity
Recovered from Perplexity thread history: 2026-08-04
  (transcript-side copy was lost — environment stored a pointer, not content)
Status: LEADS, not facts. verify-before-lock before any DEC / invariant /
  founding-doc use. Contradictions between follow-up levels are findings — log,
  don't resolve.
--- RAW PERPLEXITY ANSWER BELOW ---

Aster is a browser-based tool that lets you explore “how would we actually fly from Earth to specific asteroids or around the Earth–Moon system?” using the same math and visualizations professionals use for real missions. It crunches the trajectories for tens of thousands of near‑Earth asteroids, shows how much launch energy you’d need and when launch windows are best, and displays the solar system in live 3D based on NASA/JPL data. Under the hood it independently re‑derives and checks the astrodynamics against a trusted library, then exposes that math to AI agents in a way that’s explicitly honest about where it’s valid and where it isn’t. People would care because it gives them a credible, inspectable “mission design sandbox” in a browser, plus an auditable math engine for AI, without needing to install heavyweight space‑agency software.[1][2][3][4][5][6][7][8]

## What this project actually does, in plain language
- It’s an online app where you can pick from ~42,000 known near ‑ Earth asteroids and ask “what would it take to go there from Earth, and when is that easiest?” using standard mission‑design techniques.[7][9]
- The app calculates transfer orbits between Earth and each asteroid with Lambert solvers and patched‑conic approximations, then reports launch energy (C3) and shows porkchop plots so you can visually see good and bad launch windows over time.[3][6][10][1]
- It includes a live 3D solar ‑ system view driven by JPL Horizons ephemeris data, so the positions of planets and asteroids you’re planning against match real‑world solar‑system geometry at the current time.[2][4][5][8]
- All the underlying orbital math is re ‑ implemented and cross ‑ checked against a reference library, and that validated math core is also exposed to AI agents via MCP, with structured provenance and explicit “this is out of scope” refusals when someone asks for something beyond the validated regime.[6][8][7]

## Closest existing tools and categories This sits at the intersection of several existing tool categories:
- Mission ‑ planning and trajectory ‑ design software
- Agency/commercial tools: NASA and ESA use internal trajectory design environments and SPICE/Horizons‑driven mission design tools; porkchop plots and Lambert solvers are standard in these environments. Commercial tools and in‑house codes support similar capabilities but aren’t typically browser‑based or publicly accessible.[5][8][2][6][7]
- Academic tools: Many university labs have custom asteroid mission ‑ design tools and scripts (e.g., tools described in papers on “asteroid mission design software tool” and “Near Earth Asteroid trajectory opportunities”), which generate C3/porkchop plots and search NEO catalogs, but are usually MATLAB/Python desktop workflows rather than interactive web apps.[6][7]
- Astrodynamics/open ‑ source libraries
- Libraries like poliastro, Orekit, GMAT, and related toolchains provide Lambert solvers, orbital propagation, and porkchop plot generation, but they are code libraries or desktop apps, not integrated, large‑catalog browser frontends.[10][11][1][3][6]
- Orbital visualization and public outreach tools
- NASA’s “Eyes on Asteroids” is a web ‑ accessible interactive visualization of NEO orbits and close approaches, driven by JPL data, but it focuses on visualizing and exploring objects rather than doing user‑driven trajectory optimization with C3 and porkchop plots.[4][12]
- Various citizen ‑ science projects like Zooniverse’s Daily Minor Planet let volunteers help identify asteroids, but they don’t provide mission‑design tooling.[12][13] In short, Aster looks most like a hybrid of an academic mission ‑ design code (porkchops, Lambert, NEO catalog) and an outreach visualization tool like Eyes on Asteroids, but implemented as a self‑contained browser app with an AI‑friendly math core.[8][4][7][6]

### Rough comparison table | Dimension | Typical tools (agency/academic) | Public visual tools (e.g. Eyes on Asteroids) | Aster (your project) |
|--------------------------|---------------------------------------------------------------|--------------------------------------------------------|-----------------------------------------------------------| | Platform | Desktop, in ‑ house environments, scripts[6][7] | Web + GPU‑accelerated visualizer[4] | Pure browser, static hosting via GitHub Pages |
| Capabilities | Trajectory search, porkchops, Lambert, full mission design[6][7] | Orbit visualization, close‑approach exploration[4][12] | NEO catalog + trajectory screening + porkchops + 3D view |
| Data source | SPICE/Horizons and internal catalogs[5][8] | Horizons/NEO survey data[4][5] | Horizons ephemerides + NEO orbital catalog |
| User audience | Professional mission designers, grad students[6][7] | Public, STEM outreach audiences[4][12] | Astrodynamics‑literate engineers, students, reviewers |
| AI integration | Rare, mostly external scripts | None | MCP server exposing validated math core to AI agents |

## What’s genuinely unusual or differentiated
- **Fully browser ‑ based, static ‑ hosted mission design**: Existing mission ‑ planning and trajectory tools are overwhelmingly desktop applications, heavy in dependencies, or internal agency systems; they rarely run entirely client‑side in a browser with no backend. Doing serious Lambert/porkchop/NEA catalog work in that environment, at comparable fidelity, is unusual.[7][6]
- **Scale plus interactivity**: Screening tens of thousands of NEAs with mission‑relevant metrics and porkchop plots, while driving a live 3D Horizons‑based visualization, gives you a “mission browser” feel that’s more comprehensive and interactive than the single‑target scripts and offline plots common in academic workflows.[4][8][6][7]
- **Credibility focus and math provenance**: Many public visual tools are designed for outreach and don’t emphasize mathematical auditability; conversely, research tools assume the user is inside the code. Aster’s “independently re‑derived math validated against a reference library, plus MCP‑exposed functions with structured evidence and explicit refusal modes” is a very modern, AI‑aware twist that goes beyond typical tool design.[8][6][7]
- **Solo/student origin at professional scope**: It’s rare for a single student developer to produce a browser‑native tool that spans catalog management, numerical astrodynamics, visual rendering, and AI integration in a way that resembles institutional tooling; most similar projects are either narrow (one visualization) or course assignments, not an end‑to‑end mission‑planning artifact.[14][6][7]

## Realistic audience and use cases beyond “credibility artifact” The project could land well in several communities and contexts:
- University coursework and labs
- Orbital mechanics and mission design courses often want hands ‑ on tools for students to explore porkchop plots, Lambert transfers, and NEO missions without wrestling with installs; instructors and students could use a browser‑based tool for assignments and demonstrations.[1][3][10][6]
- Student competitions and hackathons
- Space ‑ focused hackathons, university rocketry/space design competitions, and events oriented around asteroid missions or cislunar exploration could use Aster as a common analysis/visualization environment or as part of an AI‑powered mission design challenge.[6][7]
- Citizen science and enthusiast communities
- NEO/asteroid ‑ watching communities and people following projects like Zooniverse’s Daily Minor Planet or NASA’s public asteroid programs might appreciate a tool that lets them go beyond “is this asteroid real?” to “what would it take to go there?”, especially if coupled with educational material.[13][12][4]
- Small research groups, startups, and indie devs
- Small aerospace teams or indie researchers who don’t have access to full agency toolchains could use a browser‑native mission‑design sandbox as a lightweight starting point for trade studies or for integrating AI agents into early‑stage concept exploration.[7][8][6] If you had to prioritize one “external” audience to design around beyond reviewers, do you care more about university/students, indie space startups, or citizen‑science/enthusiast users?

Sources
[1] Porkchop plots
- PySTK https://stk.docs.pyansys.com/version/stable/examples/porkchop-plots.html
[2] Horizons System
- NASA https://ssd.jpl.nasa.gov/horizons/app.html
[3] Porkchop plots and Lambert's Problem https://forum.kerbalspaceprogram.com/topic/156655-porkchop-plots-and-lamberts-problem/
[4] Nasa's near-earth asteroids and comets tracker https://www.facebook.com/groups/marspioneers/posts/2119202095088540/
[5] JPL Horizons On-Line Ephemeris System https://en.wikipedia.org/wiki/JPL_Horizons_On-Line_Ephemeris_System
[6] Development of an Asteroid Mission Design Software Tool ... https://iaaspace.org/wp-content/uploads/iaa/Scientific%20Activity/conf/pdc2013/IAA-PDC13-04-19.pdf
[7] Near Earth Asteroid Trajectory Opportunities in 2020-2024 https://nap.nationalacademies.org/reports/13117/App%20G%20Tech%201%20Decadal_NEO%20Target%20Assessment.pdf
[8] About Ephemeris · EphemerisSources.jl https://juliaastro.org/EphemerisSources.jl/docs/dev/
[9] Near-Earth Asteroids: Tracking Potential Catastrophes | AMNH https://www.amnh.org/explore/videos/space/tracking-asteroids
[10] Porkchop Plot Generator https://jeremyengels.com/interplanetary-porkchop.html
[11] Pork chop plot generator and Lambert solver test cases https://space.stackexchange.com/questions/20669/pork-chop-plot-generator-and-lambert-solver-test-cases
[12] How Does NASA Spot a Near-Earth Asteroid? https://www.youtube.com/watch?v=53Js-_vo3mo
[13] Daily Minor Planet Volunteers Spot an Asteroid Passing ... https://science.nasa.gov/get-involved/citizen-science/daily-minor-planet-volunteers-spot-an-asteroid-passing-close-to-earth/
[14] I figured out how to plan interplanetary missions without orbital ... https://www.reddit.com/r/AerospaceEngineering/comments/1rvnoc2/i_figured_out_how_to_plan_interplanetary_missions/
[15] Retrieving data from the JPL Horizons Web Side https://www.apastrosoftware.com/help/apcc-pro/retrieving_data_from_the_jpl_h.htm
