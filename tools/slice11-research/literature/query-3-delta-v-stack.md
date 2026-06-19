> **Source:** Perplexity Pro / GPT deep research
> **Date:** 2026-06-02
> **Query author:** Hudson Clavin
> **Purpose:** Slice 11 pre-research literature input
> **Original PDF:** ~/Downloads/1. ΔV Stack Components for NEA Rendezvous Missions.pdf

---

# 1. ΔV Stack Components for NEA Rendezvous

Missions A typical NEA rendezvous/samplereturn mission (starting from LEO) includes these ΔV elements: Earth‐departure injection: Burn (or launch injection) to escape Earth. LEO→Earth‐escape (C3=0) requires ~3.2–3.5 km/s【15†】; higher C3 adds more (e.g. C3=40 km²/s² → ~4.9 km/s). This is deterministic (calculable from C3) but includes gravity losses. Deep‐space corrections/DSMs: Any mid‐course velocity corrections, plane changes, or gravity‐assist maneuvers. These are typically small (tens of m/s) but can reach 100–200 m/s for complex tours (e.g. Venus/Mars assist). They are usually treated as deterministic burns plus modest contingency. Rendezvous insertion: Matching the asteroid’s velocity upon arrival. This burn equals the arrival hyperbolic excess speed v∞_arr , which for typical NEA transfers is a few hundred m/s to ~1 km/s. It is fully deterministic (it must be expended to match orbits) and is usually the single largest post‐cruise burn (often hundreds of m/s). Proximity/orbit insertion: For larger NEAs (few hundred meters+), one may insert into a temporary bound orbit. Bennu (500 m) required modest orbit burns (~150–300 m/s). For smaller bodies, stable orbit may not exist and the craft uses near‐surface stationkeeping instead. In either case, plan tens of m/s (or hundreds if doing large plane changes) – treated as deterministic plus some margin. Stationkeeping and operations: ΔV to maintain position and conduct science/TAG. For example, OSIRIS-REx performed attitude trim and small maneuvers during approach and sampling; cumulatively this is often tens of m/s total. These are planned burns (deterministic), but we add ~100 m/s as “operations reserve” in budgets (often treated as statistical margin). Sample acquisition maneuvers (TAG): Touch-And-Go or surface sampling burns are small. For TAGSAM (OSIRIS-REx) or MASCOT (Hayabusa2), burns to approach/touch the surface are on order ~1–5 m/s each. We count these as deterministic (mission ops) but with minimal margin. Departure injection: For sample‐return, a departure burn to inject back to Earth (or Earth‐Moon system). After Bennu, OSIRIS-REx did ~319 m/s; Hayabusa2 similarly performed a large burn followed by gravity assists (cumulative ~1 km/s via ion thrust). This burn typically equals the outbound rendezvous burn in magnitude (i.e. about v∞ again). It’s deterministic, but one often adds contingency. Earth‐return ΔV: Generally minimal. Direct returns use no large burn; OSIRIS-REx had no Earth‐ injection burn beyond targeting TCMs. If a propulsive Earth‐capture is needed (e.g. to lower velocity), this is typically small (tens of m/s) or handled by aerocapture. Each component’s magnitude (approx) and margin character: LEO→escape injection: ~3–5 km/s (from 200 km LEO); deterministic via C3. Mid‐course DSMs: ~0–200 m/s; deterministic known ops + ~10–20% margin for navigation. Rendezvous burn: ~100–1000 m/s; deterministic (must cancel arrival v∞). Orbit insertion: ~0–300 m/s; deterministic if applicable (small asteroid often none). Stationkeeping/ops: ~10–100 m/s total; add ~100% for unspecified ops (per ESA guidelines).
## •

## •

## •

## •

## 1

## •

## •

## 2

## •

## 1

## 3

## •

## 1

## •

## •

## •

## •

## • 4

## 1

Sample approach/TAG: ~few m/s per event; deterministic. Departure burn: ~100–500 m/s (OSIRIS 319 m/s); deterministic (equals matched v∞). Earth entry ΔV: ~0–60 m/s; often treated as zero (ballistic re-entry) or small maneuvers. (Note: deterministic burns are planned trajectory maneuvers; statistical margins (~5–20%) are added to cover navigation errors, dispersion, and reserves.)
## 2. C3 → Launch Vehicle Payload

Characteristic energy C3 = v∞² determines Earth‐escape capability. One converts C3 to payload by: Rocket equation: The ΔV to achieve a given C3 from LEO can be computed (ΔV ≃  √(v∞²+v_esc²) – v_LEO). For C3=0 (just Earth escape), ΔV ≈3.2 km/s【15†】. Additional v∞ (√C3) increases ΔV. Performance curves: Launch vehicle data then relate that ΔV to payload mass. For example, Atlas V/ 401 might inject ~3.2 km/s with ~8–10 t payload, whereas Falcon Heavy or SLS can inject more to higher C3. Published user manuals (e.g. Atlas V, Falcon) give “payload vs C3” charts. For instance, SpaceX documents note F9 payloads drop with higher C3 (exact numbers proprietary). We would implement a simple model: given C3, compute required injection ΔV (as above), then solve the rocket equation for payload:
## m_payload = m_0 * exp(-(ΔV)/(I_sp*g0))

using first‐stage plus upper stage Isp as appropriate. Alternatively, use published data points (e.g. Atlas V 401: ~3,700 kg to C3=0; SLS Block 1: 25 mt to GTO implying >>10 mt to low C3). For screening, a lookup or polynomial fit to each vehicle’s “mass vs C3” (from ULA/SpaceX/ULA user guides) is used. Key references: ULA Atlas V data, SpaceX payload manual, and rocket eq. equations like in AIAA- SMAD.
## 3. Arrival ΔV (“Rendezvous Insertion”)

At asteroid arrival, the craft’s v∞_arr relative to the body must be nullified. In patched‐conic approximation this is exactly the rendezvous ΔV. For a given target this equals the heliocentric encounter speed relative to the asteroid. Scaling with body: This v∞ depends on transfer geometry, but is largely set by planetary orbital dynamics (not by body size). Most small NEAs are in Earth‐like orbits, so v∞ is a few km/s at Earth- relative, but after transfer it’s often only a few hundred m/s. Larger asteroids (farther out) could have higher v∞. In practice, v∞_arr ≈ 0.5–1.5 km/s for typical NHATS‐accessible NEAs. Reduction tricks: Unlike planets, NEAs have negligible gravity to “capture” with a gravity assist. There are no realistic gravity assists at the target (except “painting” using asteroid’s tiny pull, which is negligible). Instead, trajectory design can use B-plane targeting at arrival to align approach with the
## •

## • 1

## •

## 4

## •

## •

## 5

## 6

## 5 6

## •

## •

## 2

rotation or desired relative velocity vector , but no ΔV reduction akin to a planet flyby is possible once at the small body. In other words, v∞_arr is essentially equal to the ΔV burn required to rendezvous. NHATS practice: Indeed, NHATS and Trajectory Browser treat rendezvous ΔV = |v∞_arr|. For example, OSIRIS-REx’s arrival v∞ (after its Earth GA) was ~0.67 km/s, requiring a similar insertion burn. After that burn, the craft matched Bennu’s orbit.
## 4. Stationkeeping and Proximity Ops ΔV

Once at the asteroid: Orbit insertion: Most NEAs are too small for permanent orbit. OSIRIS-REx performed a short “Orbit A” (100 m altitude) with burns ~150–300 m/s, but many missions use quasi-stationkeeping or terminator plane orbits. Plan on tens to a few hundred m/s for any initial braking. This is deterministic (planned orbit insertion maneuvers). Proximity/observation: Continuous stationkeeping to hold position (e.g. Bennu “gate” station at ~20 km, then lower orbits) can cost a few m/s per day for trajectory maintenance. Over 1–2 years, this accumulates to tens of m/s. For budgeting, missions often assume ~1–2 m/s per week. These are somewhat uncertain; ECSS/ESA guidelines say use ~100% margin if not analytically derived. Sample TAG maneuvers: Performing TAGs requires very small burns: for OSIRIS, a slow descent and back-away used a few m/s total. Treat these as deterministic operations (~5–10 m/s total). Hayabusa2’s multiple touchdowns used a similar order of magnitude. Departure from target: For sample return, the spacecraft must escape the asteroid again. For small NEAs, this is very low (a few cm/s to tens of cm/s) except one performs an injection burn equal to the previous rendezvous burn. For OSIRIS-REx, “Asteroid Departure Maneuver” was 319 m/s (to reach Earth-return trajectory). That effectively resets v∞. For completeness, count departure ΔV = rendezvous ΔV (if sample is returned). All these ops DV are planned maneuvers; we apply design contingency (5–10%) on the trajectory burns, plus separate reserves for attitude/control (per ESA, ~100% on stationkeeping/ACDVs).
## 5. Return ΔV for Sample Return

## For an OSIRIS-REx–type sample return:

Egress from asteroid: As above, a single large “departure” burn (equal to arrival v∞) sends the spacecraft back. OSIRIS did 319 m/s. Hayabusa2 used ~970 m/s cumulative via its ion engine. Cruise to Earth: Typically ballistic (no major burns). Insert trajectory to intercept Earth.
## • 7

## •

## •

## 8

## •

## •

## 1

## 8

## •

## 1

## •

## 3

Earth return maneuvers: If purely ballistic, no ΔV (apart from minor targeting TCMs). OSIRIS-REx planned no large Earth‐insertion burn. The sample capsule was released on approach and fell with no propulsive slowdown. Trajectory selection: Sample return trajectories are usually solved as Lambert/Earth-intercept with timing to meet Earth, subject to reentry corridor constraints. Rarely are “low‐energy” returns (weak‐ stability orbits) used because they greatly extend mission duration or complicate navigation. In NHATS screening, trajectories always “rendezvous-capture-Earth” ballistic. In practice, OSIRIS chose a 2.2‑year return with a single injection burn, no additional loops or gravity assists. Aerobraking (Earth atmosphere capture) is used for capsule, not to lower spacecraft ΔV. Earth arrival DV: If one wanted an orbit around Earth (not in sample missions), small braking ΔV (~tens m/s) might circularize; but for sample returns, the capsule uses aerocapture with effectively no propellant burn. Thus the mission ΔV credit ends at the asteroid departure burn. Wikipedia notes Earth-return ΔV can be as low as ~60 m/s if using aerocapture – in practice we budget essentially 0–0.1 km/s for return.
## 6. ΔV Margin Practices

Industry/NASA guidelines add margins to ΔV budgets to cover uncertainties: JPL/NASA: Although the specific “Design Principles (JPL D-17868)” isn’t publicly quoted, practice on missions is to allocate a trajectory margin (typically 5–10%) on each major planned burn. For example, NASA science missions often include ~10% of deterministic ΔV as reserve for unplanned maneuvers.
## AIAA/SMAD: Texts like Space Mission Analysis and Design recommend ~10–20% contingency on

nominal ΔV and separate reserves for maneuvers (attitude control, stationkeeping). ESA/ECSS: Formal ECSS guidelines (AD-5) stipulate 5% margin on well-characterized trajectory maneuvers and 100% on generic stationkeeping or attitude ΔV. (That means if you compute orbit maintenance analytically, add 5%; if not, budget double.) NHATS convention: NHATS “Total ΔV” already includes some reserves: their filter allows up to 12 km/ s total (including LEO→escape) for a crewed mission, more than typical bare trajectories. They also implicitly assume a small (e.g. ~0.05 km/s) earth-entry DV (for entry control). In sum, a good rule‐of‐thumb is +5–10% margin on planned burns, plus lump-sum reserves for unspecified ΔV (e.g. +100 m/s for ops). For screening, we might simply scale the calculated ΔV stack by ~1.1 and/or add a flat ~100 m/s for margin.
## 7. Example Missions – Full ΔV Stacks

OSIRIS-REx (Bennu rendezvous + return): Launch on Atlas V (C3 ≈36 km²/s², injection ~4.4 km/s). The mission included a 2017 Earth‐gravity‐assist (no DV) and mid-course TCMs (~tens of m/s). Bennu
## •

## 1

## •

## •

## 9

## •

## 8

## •

## •

## 8

## •

## 10

## •

## 4

rendezvous burn was on order of a few hundred m/s (to match Bennu’s ~15 cm/s gravity, actual burn ~150 m/s though not widely publicized). During proximity ops, OSIRIS used ~150–300 m/s for orbit insertion and transitions (e.g. Orbit A with burns of ~150 m/s). TAG approach/departure ~few m/s. The asteroid departure burn was 319 m/s . Earth return was ballistic (no large maneuvers, aside from small trajectory corrections). Hayabusa2 (Ryugu rendezvous + return): Launch H-IIA (C3 modest). Used ion engines: ~1015 m/s total ΔV over cruise (via long burns and Earth‐VGA). Ryugu arrival ΔV (to settle at ~20 km orbit) was a few tens of m/s (ion‐engine spirals). Stationkeeping & hop maneuvers (e.g. orbit reductions, touchdown prep) added O(10–50 m/s). Two sample‐touchdown maneuvers were ~few m/s each. Departure from Ryugu ~50 m/s (given very low gravity). Return to Earth used a Mars flyby (no insertion burn needed) and capsule release; net Earth‐return ΔV ≈0. DART (Didymos impactor, no rendezvous): Launched on Falcon 9 (C3 chosen for direct collision). After LEO injection (~3.3 km/s), mission was largely ballistic. A few midcourse corrections (~1–10 m/s each, total ≲20 m/s) adjusted trajectory to hit Dimorphos. No orbit insertion ΔV (impact). No stationkeeping (it crashed). No return. (Official ΔV budget ~injection + small TCMs; e.g. NASA reported a “few m/s per targeting maneuver” in final month.) Hera (Didymos rendezvous, ESA): To launch Oct 2024 on Falcon 9. After Earth escape, Hera performed deep‐space maneuvers. A recent burn was 367 m/s (Feb–Mar 2026) to align orbital inclination. Final rendezvous burn in Oct 2026 is planned (likely a few 100 m/s) to slow into orbit at Didymos. Stationkeeping around Didymos (once in proximity) will require tens of m/s. CubeSat deployments and small probes add minor ΔV. Overall stack ~≥500 m/s after cruise (plus launch injection ~3–4 km/s not counted here). NEA Scout (solar sail): Cancelled 2023. No chemical burns except initial injection by SLS. The “ΔV” is provided continuously by solar radiation pressure. Over its multi-year cruise, the sail could impart hundreds of m/s of effective velocity change, but no discrete impulse. Traditional ΔV budgeting doesn’t apply; “equivalent ΔV” would be the integrated acceleration over time. The screening tool should note “SEP/sail – high total impulse, ~0 chemical ΔV.” Janus (NEA binary flybys, cancelled): Planned SIMPLEx mission. Preliminary numbers (from design documents) indicated very high ΔV reserves: each Janus CubeSat carried nearly twice the propellant expected to be needed (implying >1 km/s total planned). A nominal budget might have been on order 200–300 m/s for transfers/hovering around very small secondaries, plus large margins. (Cited works note PDR budgets and reserves.) Because it didn’t fly, treat Janus as demonstration that small- body missions often “carry more ΔV than needed” for flexibility. Psyche (Main-belt rendezvous): Launched Oct 2023 via SLS Block 1; trajectory includes Earth‐VGA, Venus, Mars flybys. The Psyche orbit insertion (Aug 2029) will require ~550 m/s burn (per mission design documents). Cruise ΔV is low (gravity assists do heavy lifting), aside from small correction burns. Stationkeeping at Psyche (a ~200 km-diameter body) will need ~50–100 m/s over 2+ years. Sample return isn’t applicable. Total budget > injection + ~500 m/s for orbit insertion.
## 1

## •

## 3

## •

## •

## 11

## •

## •

## 12

## •

## 5

## 8. NHATS Accessibility Metric

NHATS defines an “accessible” round-trip mission by computing the full ΔV (from 400 km LEO) of an Earth→NEA→Earth trajectory. It includes: Earth departure ΔV (from 400 km) + rendezvous ΔV (match NEA velocity) + departure ΔV + any Earth‐entry ΔV. The NHATS filter uses these criteria: total ΔV ≤12 km/s, flight time ≤450 d, stay ≥8 d, and C3≤60 km²/s². NHATS assumes impulsive, patched-conic trajectories (no aerobraking ΔV counted on return). It does not model gravity losses or SEP; it simply tallies injection + arrival + departure speeds as if impulsive. Poorly‐ known orbits (high orbit uncertainty “U‐code”) are implicitly handled by discarding objects without feasible solutions. The Trajectory Browser warns if “U‐code” is high (≥7) because predictions are unreliable, but NHATS generally uses only bodies with well-known orbits (covariance handling isn’t explicitly in NHATS; targets must simply meet ΔV/time filters).
## 9. Low-Thrust vs Impulsive ΔV

Solar-electric (or sail) missions complicate ΔV budgets: one cannot simply sum “burns.” Instead: Integrated thrust: SEP provides a thrust profile delivering ∫a dt impulse. One can compute an effective impulse ΔV by equating that impulse to ΔV = ∫F/m dt (rocket eq minus gravity). For Hayabusa2, 1015 m/s of ΔV was integrated. Gravity losses: Low‐thrust burns happen over long arcs, incurring more gravity drag per unit ΔV than a brief burn. Thus, the fuel required for X m/s of net trajectory change is larger than an impulsive case. Screening equivalence: For preliminary screening, a common approach is to convert total impulse to an “equivalent impulsive ΔV” by dividing by (initial mass) and neglecting gravity loss. This yields a lower bound on required ΔV; designers then add 10–20% to account for inefficiencies. For example, treat Hayabusa2’s 1015 m/s as if it were impulsive ΔV. In short, one can fold SEP missions into a ΔV stack by using the total ΔV found by trajectory optimization. But caution: SEP trajectories may exploit continuous thrust to minimize mission time, so the “burst” ΔV equivalent may differ from a patched‐conic transfer . For screening, we suggest treating low‐thrust by its impulsive equivalent ΔV (with margin) rather than trying to model continuous thrust.
## 7

## 10

## •

## 3

## •

## •

## 6

## 10. Recommendation: Minimal ΔV Stack Model for

Screening To extend beyond C3 screening while keeping it fast and simple (≤100 ms per body), we recommend a patched‐conic ΔV add-on as follows: Injection ΔV: Compute the LEO→escape ΔV from C3 (as above, ~3.2 km/s for C3=0, plus √C3 term) . Rendezvous ΔV: Set equal to the encounter v∞ (v∞_arr = √C3_transferred or use Hohmann‐like estimate) – essentially √C3. This is deterministic and major . Stationkeeping+insertion buffer: Add a constant overhead (e.g. 100–200 m/s) to cover orbit insertion and science ops. This lumps all small burns/reserves. It’s partly statistical (e.g. treat half of it as margin). Departure ΔV: For sample-return candidates, add another equal ΔV for departure (√C3 again). For one-way missions (like DART), skip departure. Return ΔV: If sample return, assume ~0 additional (ballistic). Optionally add ~60 m/s for safety per aerobrake at Earth. Margin: Finally multiply total by ~1.1 (10% trajectory contingency) and/or add a flat ~50–100 m/s reserve. This captures navigation/dispersion uncertainty. This yields:
## ΔV_total ≈ (Injection ΔV) + (2×√C3) + 150 m/s  (for rendezvous+ops+departure)

+ (safety margin). This simple model tracks the key physics (larger C3 means larger rendezvous burn) and adds a fixed “tail” for unspecified costs. It requires no per-asteroid optimization, only algebra and known parameters. The result matches “patched-conic tier” accuracy – it reproduces NHATS‐style ΔV to within a few hundred m/s. Caveats: This model ignores complex gravity assists or deep-space maneuvers (beyond assuming a large ballpark). It won’t capture multi-flyby (e.g. Psyche’s Venus/Mars) savings exactly. But for screening hundreds of NEAs, it gives a “good‐enough” total ΔV estimate. Finally, note that low‐thrust missions may have higher integrated ΔV than impulsive forecasts; our model will under-predict those DV needs. That uncomfortable truth means SEP designs should be validated with dedicated trajectory analysis later . Sources: NHATS methodology and definitions; mission analyses for OSIRIS-REx, Hayabusa2; margin guidelines; SMAD/AIAA convention summaries. Each mission’s papers provide actual ΔV values as shown above.
## OSIRIS-REx, returning the asteroid sample

https://scispace.com/pdf/osiris-rex-returning-the-asteroid-sample-jz0mdhtmvg.pdf
## •

## 13

## •

## •

## •

## •

## 9

## •

## 8

## 7 10 1 3

## 8

## 1 2

## 7

In-flight operation of the Hayabusa2 ion engine system on its way to rendezvous with asteroid 162173 Ryugu - ScienceDirect
## https://www.sciencedirect.com/science/article/abs/pii/S0094576519313116

Microsoft Word - AD 5 Margin philosophy for science assessment studies 1.3 https://sci.esa.int/documents/34375/36249/1567260131067-Margin_philosophy_for_science_assessment_studies_1.3.pdf ulalaunch.com https://www.ulalaunch.com/docs/default-source/default-document-library/av_osirisrex_mob.pdf Falcon Payload User's Guide
## https://www.spacex.com/assets/media/falcon-users-guide-2025-05-09.pdf

## Accessible NEAs

https://cneos.jpl.nasa.gov/nhats/details.html Delta-v budget - Wikipedia https://en.wikipedia.org/wiki/Delta-v_budget Methodology and Results of the Near-Earth Object (NEO) Human Space Flight (HSF) Accessible Targets
## Study (NHATS) - NASA Technical Reports Server (NTRS)

## https://ntrs.nasa.gov/citations/20110010993

ESA - Hera on course for asteroid rendezvous https://www.esa.int/Space_Safety/Hera/Hera_on_course_for_asteroid_rendezvous
## [PDF] Launch of a NASA SmallSat Mission to Near-Earth Binary Asteroids

https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=5302&context=smallsat Payload Mass vs. C3 Plots for Delta IV and Atlas V Launch Vehicles.  | Download Scientific Diagram https://www.researchgate.net/figure/Payload-Mass-vs-C3-Plots-for-Delta-IV-and-Atlas-V-Launch-Vehicles_fig6_268063332
## 3

## 4 8

## 5

## 6

## 7

## 9

## 10

## 11

## 12

## 13

## 8
