# S20_02 — Asteroid → Earth return-leg pre-research (Perplexity)

- **Source:** Perplexity (Research mode), prompt `S20_02_PERPLEXITY_RETURN_LEG.md` with the follow-up chain directive.
- **Retrieved:** 2026-11-03 by Hudson. Transcribed by Nova, 2026-11-03.
- **Status:** UNVERIFIED LEADS. Nothing here enters a DEC, invariant or founding doc until the independent verification pass (`S20_03_VERIFY_RETURN_LEG.md`) confirms it.
- **Transcription note:** the response's math rendered as broken KaTeX text. The formulas below are reconstructed in plain notation, and the prose is otherwise unchanged. Citation links did not survive the copy; the sources are named in the text where Perplexity named them. The response's closing question about committing the file is recorded at the end and was not acted on: an agent commits this file.

---

## Summary

The return-leg screen should independently solve asteroid → Earth transfers and export the Earth-relative incoming asymptotic velocity vector, its encounter epoch, and enough provenance to reproduce the solution. It should not equate that vector with an atmospheric-entry state or a skyhook-intercept state. OSIRIS-REx provides a particularly useful operational precedent: its navigation team targeted an Earth encounter in the B-plane, then delivered a finite-radius capsule state and dispersed states to a separate entry simulation.

Status: UNVERIFIED research leads for S20_03, not DEC-ready requirements. "Chain" below means the requested sourced follow-up question-and-answer tree.

## Evidence labels and important limitations

Numerical labels used throughout:

- **OP**: official-published. Explicitly reported by an agency, mission team or official mission-study publication. This does not necessarily mean flight-measured; nominal, predicted, reconstructed and requirement values remain distinct.
- **PP**: primary-research-published. Reported by the researchers conducting an investigation, but not established here as an official programme requirement.
- **TE**: third-party-estimated. A secondary estimate, or an analytical inference made for this report, not a mission-published value.
- **U**: unverified. A supplied or proposed number that the retrieved primary evidence does not establish.

The strongest retrieved evidence concerns Stardust, Hayabusa, OSIRIS-REx, NHATS, Horizons conventions, and the architecture of the Keck retrieval study. Gaps remain in:

- official Hayabusa2 interface-specific flight-path-angle data;
- mission-published arrival v∞ values;
- a universal low-v∞ cutoff;
- empirical error statistics for the symmetric-return approximation.

Do not fill these gaps by treating an approximate entry speed as an exact inertial speed at an unspecified radius.

## 1. Conventions and the downstream interface

### Define the return asymptote explicitly

For a heliocentric Lambert transfer terminating at Earth's centre at the encounter epoch t_E, define

```
v∞,E(screen) = v_Lambert,arrival(t_E) − v_E(t_E)
```

This is the patched-conic approximation to the incoming Earth-relative asymptotic velocity, expressed in the axes used by the heliocentric states.

It is not:
- the capsule velocity at atmospheric entry;
- the velocity at a finite sphere-of-influence boundary;
- a geocentric position/velocity state that already includes Earth's gravitational bending;
- a vector pointing outward toward the apparent incoming radiant.

Implementation recommendation: explicitly define the sign as "spacecraft velocity relative to Earth, in the direction of inbound motion". Preserve the original Lambert endpoint states as well as the difference vector. NHATS establishes the relevant screening precedent: separate Lambert trajectories to and from the asteroid using Horizons ephemerides.

### Frame, centre and time scale

Use explicit metadata rather than the label "J2000" alone:

```text
quantity: incoming Earth-relative asymptotic velocity approximation
axes: ICRF equatorial
ephemeris source: JPL Horizons
ephemeris corrections: geometric / none
Earth target: Earth center, not Earth-Moon barycenter
encounter epoch: explicitly tagged TDB
velocity units: km/s
```

Horizons distinguishes the reference system from the reference plane. Its primary frame is ICRF, but a vector product can be expressed in the ecliptic plane rather than the equatorial plane. Geometric states must not be mixed with apparent, light-time-corrected observing quantities.

ICRF and Earth-mean-equator/equinox conventions should not be silently treated as identical labels. At screening fidelity, choose one documented representation and record transformations when another tool requires its own J2000/EME2000 convention. OSIRIS-REx's published encounter plots explicitly identify an Earth-centred Earth-Mean-Equator and Equinox of J2000 B-plane.

### B-plane definition

A usable, explicitly declared convention is

```
Ŝ = v∞,in / ‖v∞,in‖
T̂ = (Ŝ × k̂) / ‖Ŝ × k̂‖
R̂ = Ŝ × T̂
```

where k̂ is the declared reference pole. Then

```
B_T = B · T̂
B_R = B · R̂
```

Here B is the impact-parameter vector from Earth's centre to the incoming asymptote's intersection with the plane perpendicular to Ŝ.

The operational point is not that every tool uses these exact signs. It is that the reference pole, cross-product order, incoming/outgoing convention and coordinate frame must accompany B_R and B_T. The FreeFlyer vendor guide documents the S, T, R construction; it is implementation documentation, not an agency standard. OSIRIS-REx supplies the primary mission precedent for reporting and targeting B·T and B·R.

Handle the reference-pole singularity explicitly when Ŝ is parallel to k̂.

A centre-targeted heliocentric Lambert solve does not determine an operational B-plane aimpoint. Do not report its zero miss distance as a designed capsule entry corridor. A downstream targeter must choose the Earth-centred approach geometry.

### Entry interface is mission-specific

Do not hard-code one universal "top of atmosphere". Examples from primary mission publications:

- **Stardust:** interface radius 6503.14 km, OP. The paper reports a nominal inertial entry speed and inertial flight-path angle at that radius.
- **OSIRIS-REx:** interface radius 6503.142 km, OP. Its navigation paper describes this as approximately 133 km above mean sea level, OP, in the targeted entry geometry.
- **Hayabusa observation analysis:** the trajectory input datum was at 202.03 km altitude, OP, while a separate entry-interface crossing was defined at 121.9 km, OP. These are different events in the same analysis.

The user-supplied example of 125 km is U as a universal convention: the retrieved evidence does not establish it as a standard applicable across these missions.

Export the geocentric interface radius where possible, together with any altitude's reference surface and definition.

### Convert asymptotic speed to entry speed carefully

Under an unpowered Earth-centred two-body approximation,

```
v_EI,inertial = sqrt( v∞² + 2·μ_E / r_EI )
C3,E = v∞²
```

These are analytical screening relations, not mission-specific acceptance criteria.

Atmosphere-relative velocity additionally requires position and Earth rotation:

```
v_rel,atm = v_inertial − ω_E × r − v_wind
```

with all terms expressed consistently.

That distinction is consequential: OSIRIS-REx's navigation requirement explicitly constrained atmosphere-relative entry speed, whereas its entry flight-path angle was specified inertially.

Do not insert an atmosphere-relative published speed into the inertial energy relation and label the result "official arrival v∞".

### Minimum screening handoff

Recommended export contract, inferred from the mission-navigation/EDL separation and Horizons conventions:

| Field | Purpose |
|---|---|
| Asteroid departure epoch and Earth encounter epoch, with time scales | Reconstruct endpoint geometry |
| Incoming Earth-relative v∞ vector | Preserve approach direction |
| v∞ magnitude and arrival C3 | Energy screening and consistency checks |
| Lambert departure/arrival velocity vectors | Reproduce the solve |
| Earth and asteroid endpoint states | Detect frame, epoch and ephemeris mismatches |
| Revolution count and branch/orientation metadata | Identify which solution was selected |
| Solar and planetary gravitational parameters used | Reproduce dynamics |
| Horizons query/provenance and asteroid solution information | Track catalog changes |
| Model limitations and uncertainty status | Prevent operational overinterpretation |

Optional derived outputs include equatorial asymptote right ascension/declination and a clearly labelled two-body entry-speed estimate.

Leave B-plane coordinates, entry flight-path angle, entry location and catch state null unless a separate encounter-targeting stage actually computes them.

## 2. Real return-leg numbers and capsule ceilings

### Published mission values

"Not established" means not securely recovered from the primary material examined here, not that the quantity is unknowable.

| Mission/study | Earth-arrival v∞ or C3 | Entry speed | Entry angle and interface | Evidence status |
|---|---|---|---|---|
| Stardust | No directly published value established here | 12.9 km/s, OP; nominal inertial design value | −8.2°, OP, at geocentric radius 6503.14 km, OP | Mission reconstruction paper states flight was close to prediction; do not relabel nominal values as directly measured. |
| Hayabusa | No directly published value established here | 12.2 km/s, OP; nominal inertial trajectory value | −12.3°, OP; paper describes a nominal input state near 200 km altitude, OP, and gives the specific datum as 202.03 km, OP | Do not silently associate these speed/angle values with the separate 121.9 km interface crossing, OP. |
| Hayabusa2 | No directly published value established here | 12 km/s, OP; rounded JAXA capsule description | Approximately 12° downward, PP, in observation-campaign literature; exact interface/frame-specific operational EFPA not established | Approximate observation geometry is not an official entry-corridor requirement. |
| OSIRIS-REx | No directly published value established here | 12.38 km/s, OP; navigation paper's pre-entry compliance value, atmosphere-relative | Nominal inertial EFPA −8.2°, OP, at radius 6503.142 km, OP | Published requirement: atmosphere-relative speed no greater than 12.4 km/s, OP. |
| NHATS | Trajectory-dependent; no universal arrival value | Screening constraint ≤ 12 km/s, OP | No universal entry angle established here | Human-mission accessibility screen, not a robotic-capsule qualification. |
| Keck asteroid retrieval | No comparable direct-entry value established here | Not applicable to its intended delivered asteroid | Not an atmospheric-entry architecture | Solar-electric transport to the Earth–Moon vicinity/high lunar orbit; the study describes connection to an Earth–Moon libration-region manifold. |

### What is an acceptable entry-speed ceiling?

There is no defensible mission-independent capsule ceiling in this evidence. The useful source-backed examples are:

- **NHATS:** 12 km/s, OP, as a study constraint for human round trips. Its total mission Δv can include a manoeuvre to reduce entry speed when necessary. Thus "NHATS compliant" does not necessarily mean the unbraked Lambert return naturally meets that limit.
- **OSIRIS-REx:** no greater than 12.4 km/s atmosphere-relative, OP, as a mission requirement. The EDL paper relates its trajectory-speed constraint to inherited Stardust thermal/load capability and a heavier capsule.
- **Stardust:** 12.9 km/s nominal inertial entry speed, OP, demonstrates a particular flown design regime, not a general allowable maximum for arbitrary capsules.

Tool recommendation: capsule acceptance must be an architecture-specific downstream profile with an explicit velocity convention, interface radius, flight-path-angle corridor, and thermal/load assumptions.

### Contradictions and convention traps to preserve

Do not silently resolve these in a DEC:

- The Stardust reconstruction paper gives 12.9 km/s, OP, as its nominal inertial interface speed; the OSIRIS-REx EDL paper refers to Stardust using 12.8 km/s, OP. Different rounding, trajectory references or conventions may explain the difference, but this pass has not established which explanation applies.
- The OSIRIS-REx navigation paper's abstract contains a return-year typo; its body and independent EDL paper identify the actual return consistently. Treat this as evidence that official publication status is not a substitute for verification.
- Hayabusa's analysis datum and its separately defined atmospheric interface are not the same altitude.

## 3. What the screening tool should refuse, or qualify

The literature supports a hierarchy of claims, not a universal list of forbidden Lambert computations. NHATS itself warns that its target list is not a complete list of viable missions and that further architecture, safety, target and schedule constraints must be applied.

### Arrival declination, lighting and landing-site access

A heliocentric encounter solution can provide an asymptote direction. It cannot, by itself, establish landing-site access, acceptable entry azimuth, recovery lighting, range approval or a safe landing ellipse.

OSIRIS-REx explicitly combined navigation targeting with EDL predictions and range constraints. Its published requirements included a direct posigrade entry and a specified landing range.

Recommended behaviour:
- Compute and label the asymptote direction.
- Decline to label a result "capsule-return feasible" until an encounter/entry targeter has checked the selected capsule and landing conditions.
- Do not substitute asymptote declination for entry latitude or local flight-path angle.

### Earth–Moon capture and weak arrivals

A Sun-only Lambert leg plus an isolated Earth hyperbola does not demonstrate ballistic capture, lunar capture, or insertion into a libration-region orbit.

The Keck study is a clear counterexample to treating Earth return as one universal endpoint: its architecture uses solar-electric propulsion and Earth–Moon dynamical structures to deliver material to a lunar destination.

Recommended behaviour: return "capture not evaluated" rather than a favourable capture claim based on low arrival C3.

### The proposed low-speed threshold

The proposed v∞ < 1.5 km/s warning threshold is U as a literature-backed universal boundary. This pass did not find authoritative support for that exact cutoff.

The qualitative concern remains sound as a model limitation: as the encounter becomes weak, solar and lunar dynamics and the choice of patching geometry become increasingly important. The Keck architecture illustrates why the Earth–Moon problem can require a different model, but does not establish that specific speed boundary.

Recommended behaviour: a configurable "weak-arrival/high-fidelity review required" warning, explicitly marked as engineering policy pending calibration, not an official physical discontinuity.

### Long-duration and multi-revolution returns

Multi-revolution Lambert solutions are legitimate mathematical solutions, not automatically invalid trajectories. Izzo's formulation addresses Lambert solution classes and compares numerical performance with Gooding's procedure. Numerical solver validity does not establish the fidelity of a Sun-only mission model.

Recommended disclosures:
- selected revolution count and solution branch;
- no deliberate gravity assists or midcourse manoeuvres modelled;
- no demonstrated avoidance of intermediate planetary encounters;
- no demonstrated correction budget under a higher-fidelity force model.

Do not adopt NHATS's short-mission rationale as evidence that gravity assists and midcourse manoeuvres are unimportant for arbitrary long returns. Its cited study specifically bounded total mission duration by 450 days, OP.

### Arrival far from the asteroid's orbit-determination epoch

Distance in time from an osculating epoch is not, by itself, a calibrated uncertainty metric. The relevant issues include observational arc, covariance, close encounters, nongravitational effects and the propagation model.

NASA's NHATS description explicitly warns that updated asteroid orbits change viable targets and mission parameters.

Recommended behaviour:
- Preserve orbit-solution provenance.
- Distinguish a nominal trajectory from a robust opportunity.
- If covariance is absent, say "uncertainty not evaluated".
- Do not invent a universal maximum number of years from the orbital epoch.
- If catalog ephemerides are generated by two-body propagation of osculating elements rather than the specified Horizons product, disclose that additional approximation.

### Hard refusal versus qualified output

| Condition | Recommended response |
|---|---|
| Unknown/mixed frame, centre, units or time scale | Refuse the affected calculation |
| No converged Lambert solution | Report solver outcome, not a feasibility verdict |
| No B-plane targeting | Do not invent an operational B-plane aimpoint |
| No finite-radius entry state | Do not report exact EFPA or landing coordinates |
| Weak arrival | Retain nominal screen with a high-fidelity warning |
| No covariance | Retain nominal result; decline probability/confidence claims |
| No Earth–Moon model | Decline capture certification |
| No tether state/phase | Decline catch certification |

These are proposed software policies, not quoted agency requirements.

## 4. The symmetric-return assumption

### Does NHATS use it?

The retrieved NHATS description does not support the equality

```
Δv(asteroid departure) = v∞(outbound, asteroid arrival)
```

It explicitly identifies asteroid arrival and asteroid departure as separate manoeuvres and computes trajectories to and from the asteroid using Lambert solutions and Horizons ephemerides.

For the impulsive, negligible-small-body-gravity model, use

```
Δv_A,departure = ‖ v_return,departure(t_d) − v_A(t_d) ‖
```

The outbound rendezvous mismatch is evaluated at a different epoch, on a different transfer:

```
Δv_A,arrival = ‖ v_outbound,arrival(t_a) − v_A(t_a) ‖
```

Equality is not a general consequence of patched conics.

### Is it a Benner-style published rule?

Not established in this pass. Accessibility or rendezvous-Δv estimates should not be reinterpreted as a validated round-trip return estimator without the exact originating formula and assumptions.

The retrieved JPL Nereus page discusses rendezvous accessibility, but does not establish the proposed symmetric-return rule or its return-leg error distribution.

### How large is the error, and in which direction?

No defensible "typical NEA" numerical error or universal bias direction was established.

Analytically, either direction is possible because outbound arrival and return departure sample different endpoint geometry, epochs and time-of-flight constraints. A prescribed return window can make the true return departure more expensive; a favourable later window can make it cheaper.

A useful error metric is

```
ε_Δv = Δv_A,departure(true screen) − Δv_A,arrival(outbound)
```

That is a proposed experiment, TE, not a published population statistic.

Design conclusion: do not use symmetry in the authoritative return result. If retained as a cheap heuristic, label it an uncalibrated proxy and measure its errors against independent return Lambert solves.

## 5. Validation: separate solver, screen and encounter tests

### Lambert-kernel validation

Izzo's paper is the primary algorithm reference. It compares the method with Gooding's procedure. A strong independent oracle therefore uses a different formulation, not merely a second wrapper around the same Izzo implementation.

Recommended tests:
- Compare full departure and arrival vectors, not only Δv.
- Propagate each returned state under the same two-body dynamics and check endpoint closure.
- Verify energy and angular-momentum consistency.
- Exercise solution-branch boundaries and multi-revolution cases.
- Test frame rotation: the solution vectors should transform consistently while scalar energies remain invariant.

poliastro and pykep can be useful comparison candidates, but verify the installed implementation and version first. Shared algorithm ancestry weakens independence. pagmo is not, by its name alone, a separate Lambert oracle.

No software-version-specific oracle dataset was verified in this pass.

### NHATS round-trip validation

NHATS is the closest retrieved architectural match: impulsive Lambert round trips using Horizons states. Its published description includes separate asteroid departure and Earth-return entry-speed treatment.

Before making an exact numerical fixture, acquire a particular trajectory row and freeze:
- asteroid solution/ephemerides;
- all encounter epochs;
- transfer branch;
- gravitational parameters;
- manoeuvre bookkeeping;
- entry-speed reduction assumptions.

The study's aggregate constraints are validation targets for bookkeeping, not substitutes for a reproducible trajectory row.

### Published encounter and entry cases

| Case | Testable published target | What it validates |
|---|---|---|
| Stardust | 12.9 km/s inertial, −8.2°, radius 6503.14 km; all OP | Interface conventions and an entry-state regression, if the corresponding state is obtained. |
| Hayabusa | 12.2 km/s inertial, −12.3°; both OP, with the paper's high-altitude trajectory datum | State-datum handling; prevents confusing an analysis start state with atmospheric interface. |
| OSIRIS-REx | 12.38 km/s atmosphere-relative compliance value, EFPA target −8.2°, radius 6503.142 km; all OP | Atmosphere-relative versus inertial conventions, B-plane/entry handoff, and interface targeting. |
| NHATS | Entry-speed constraint 12 km/s and total-duration constraint 450 days; both OP | Screening constraints and manoeuvre accounting. |
| Keck retrieval | High lunar orbit/Earth–Moon manifold architecture | Negative scope test: the Lambert screen must not claim to reproduce its low-thrust capture solution. |

A flown mission is not automatically an exact end-to-end Lambert regression. Hayabusa used ion propulsion and corrections; OSIRIS-REx used a departure manoeuvre and later targeting corrections. A single uncorrected Lambert arc should not be required to reproduce every operational quantity exactly.

## Follow-up chain

The following tree contains nine answers, organised by decision relevance.

### Level 1-A — Is the asymptote vector and encounter epoch sufficient for downstream entry or catch work?

*Why this matters for the tool:* it determines whether the return screen exports a complete boundary condition or only an encounter-family descriptor.

Answer: it is sufficient to characterise the screening-level arrival energy and direction, but not a unique Earth-centred encounter. The missing B-plane aimpoint determines the approach's offset and angular momentum. OSIRIS-REx explicitly targeted B-plane conditions and delivered finite-radius entry states to EDL.

Design implication: export the asymptote as an upstream product and keep encounter targeting separate. No new empirical numerical threshold is introduced.

#### Level 2-A — What additional data closes the Earth-centred encounter?

*Why this matters for the tool:* it defines the next module's input/output contract.

Answer: specify a B-plane aimpoint with declared axes and an unambiguous encounter timing convention, or supply a finite-radius geocentric state with its epoch. The latter is the more directly consumable handoff for a numerical propagator. OSIRIS-REx's operational interface supplied capsule states and dispersed states to its EDL simulations.

Design implication: distinguish `asymptoteAvailable`, `encounterTargeted` and `entryStateAvailable`; do not infer later states from the existence of the first.

##### Level 3-A — Can a rotating tether evaluate a catch from the asymptote alone?

*Why this matters for the tool:* a scalar-energy pass must not become a false catch-feasibility result.

Answer: no. A catch requires payload and tether-tip position and velocity at the same epoch. The missing encounter targeting changes the payload's geocentric trajectory; tether orbit and rotational phase add further boundary conditions. This is an analytical inference from the distinction between asymptotic targeting and finite-state handoff demonstrated by OSIRIS-REx, not a verified tether-performance claim.

Design implication: the screening output may initialise a catch-envelope study, but `catchFeasible` must remain unevaluated until a finite-state intercept is solved.

### Level 1-B — Should capsule screening compare v∞ with a universal cutoff?

*Why this matters for the tool:* an incorrectly generalised speed ceiling can reject valid architectures or approve invalid ones.

Answer: no. NHATS's 12 km/s ceiling, OP, and OSIRIS-REx's 12.4 km/s atmosphere-relative ceiling, OP, belong to different architecture and requirement contexts. Neither is an arrival-v∞ ceiling.

Design implication: compare the appropriate derived entry quantity against a named capsule profile, not against a universal catalog constant.

#### Level 2-B — Is entry speed sufficient to qualify a capsule?

*Why this matters for the tool:* thermal survivability depends on the trajectory and vehicle, not only encounter energy.

Answer: no. OSIRIS-REx's release assessment considered heating, integrated heat load, deceleration and landing dispersion. Its nominal inertial EFPA was −8.2°, OP, with an overall reported navigation/entry-angle allowance of ±0.08°, OP, in the cited requirement discussion.

Design implication: call a speed-only result "entry-speed screen", not "capsule survivability". Do not reuse this mission's angle tolerance as a generic capsule corridor.

##### Level 3-B — What is the safest capsule result before a full entry model exists?

*Why this matters for the tool:* it establishes a truthful result vocabulary for the first implementation.

Answer: report the declared two-body inertial entry-speed estimate and, separately, whether it passes an explicitly selected speed criterion. Leave atmosphere-relative speed, heating acceptance, load acceptance, corridor acceptance and landing feasibility unevaluated unless their required models and states exist. The OSIRIS-REx navigation/EDL split supports this separation of responsibilities.

Design implication: avoid one green "Earth return feasible" status.

### Level 1-C — How should weak arrivals and uncertain asteroid orbits affect catalog rankings?

*Why this matters for the tool:* the apparently cheapest trajectory may also be the least robustly modelled.

Answer: keep nominal accessibility and confidence separate. NHATS warns that asteroid orbit updates change mission parameters and target viability. The Keck study demonstrates that Earth–Moon delivery can require dynamics outside a simple Earth hyperbola.

Design implication: maintain a nominal cost ranking alongside model-domain and ephemeris-confidence flags. No universal numerical weak-arrival cutoff is established.

#### Level 2-C — Can low v∞ or elapsed time from orbital epoch alone define reliability?

*Why this matters for the tool:* a simple threshold is attractive for a large catalog but may imply unsupported certainty.

Answer: neither quantity alone establishes trajectory confidence. This pass found no primary-source universal 1.5 km/s validity boundary, U, and no universal age limit for asteroid orbital solutions. NASA's warning is that updated orbits change accessibility; it does not supply those simplified reliability rules.

Design implication: use configurable review flags, preserve the underlying information, and label uncertainty as unevaluated when covariance is unavailable.

##### Level 3-C — What should high-fidelity verification test first?

*Why this matters for the tool:* verification effort should target failures that could reverse a design decision.

Answer: verify frame/centre/time consistency first; then compare the Lambert solution against an independent solver; then propagate representative arrivals with Earth–Moon perturbations and evaluate the downstream finite-state handoff. Izzo supplies the solver-comparison precedent, Horizons supplies state conventions, and OSIRIS-REx supplies the operational handoff precedent.

Design implication: keep numerical correctness, model adequacy and operational feasibility as separate test categories.

## LOAD-BEARING NUMBERS

Feeds `S20_03_VERIFY_RETURN_LEG.md`.

- 6503.14 km — OP; Stardust nominal entry-interface geocentric radius; Stardust Entry Reconstruction.
- 12.9 km/s — OP; Stardust nominal inertial speed at that interface, not a universal capsule ceiling or a directly measured value asserted here; Stardust Entry Reconstruction.
- −8.2° — OP; Stardust nominal inertial interface flight-path angle; Stardust Entry Reconstruction.
- 12.8 km/s — OP; Stardust comparison speed quoted in the OSIRIS-REx EDL paper; unresolved difference from the reconstruction paper's nominal 12.9 km/s; verify convention and reference trajectory.
- 6503.142 km — OP; OSIRIS-REx targeted entry-interface geocentric radius; navigation-operations and EDL papers.
- Approximately 133 km above mean sea level — OP; OSIRIS-REx navigation paper's description of the targeted interface; not interchangeable with an arbitrary altitude obtained by subtracting an unspecified Earth radius.
- 12.38 km/s — OP; OSIRIS-REx navigation paper's pre-entry compliance value for atmosphere-relative entry speed; do not use directly as an inertial energy-conversion input.
- 12.4 km/s — OP; OSIRIS-REx maximum atmosphere-relative re-entry-speed requirement.
- −8.2° — OP; OSIRIS-REx nominal inertial entry flight-path angle at its declared interface.
- ±0.08° — OP; OSIRIS-REx overall reported entry-angle allowance in the navigation requirement discussion; not a generic capsule tolerance.
- Nominally 200 km altitude — OP; Hayabusa trajectory-analysis input-state description; not the separate atmospheric entry-interface altitude.
- 202.03 km altitude — OP; specific Hayabusa analysis trajectory datum identified by the NASA observation paper.
- 12.2 km/s — OP; Hayabusa nominal inertial entry-trajectory speed in that paper; verify exact datum before an interface-specific comparison.
- −12.3° — OP; Hayabusa nominal inertial entry-trajectory angle in that paper; verify exact datum before an interface-specific comparison.
- 121.9 km altitude — OP; Hayabusa atmospheric entry-interface crossing used in the NASA observation analysis, distinct from its higher-altitude input-state datum.
- 125 km altitude — U; supplied example, not established here as a universal or cross-mission interface convention.
- 12 km/s — OP; rounded Hayabusa2 capsule entry speed in JAXA's instrument description; insufficiently precise and specified for an exact v∞ reconstruction.
- Approximately 12° downward — PP; Hayabusa2 observation-campaign trajectory description, not verified here as an official interface-specific EFPA or an operational corridor requirement.
- 12 km/s — OP; NHATS atmospheric-entry-speed constraint; the total mission cost may include a manoeuvre to reduce entry speed.
- 450 days — OP; total round-trip duration bound in the cited NHATS description; its rationale concerning omitted midcourse manoeuvres and gravity assists is scoped to that study.
- 1.5 km/s — U; proposed weak-arrival warning threshold, not established by this pass as an official or universal patched-conic validity boundary.
- No verified numerical typical-error bound — symmetric-return departure-Δv approximation; neither a population error magnitude nor a universal bias direction was established. NHATS instead describes separate outbound and return Lambert computations.

## Response's closing question (not acted on)

> To prepare the agent commit without assuming the destination: should this go to hudsonclavin-cloud/asteroid-mining-planner on main, at the requested tools/slice20-research/literature/S20_02_return_leg_perplexity.md path?

Perplexity has no write access to the repository. An agent commits this file at that path on a branch.

## Nova's triage notes (2026-11-03)

- **Consistent with Aster's own measurements:** the recon (`tools/slice20-research/recon/S20_01-REPORT.md`, R3) measured the symmetric-return error at 0.08–5.1 km/s, with the sign flipping between window types. That agrees with §4's analytical conclusion and supplies the population measurement that §4 says is missing.
- **Oracle independence:** Aster's Lambert solver is Izzo, and poliastro's default is also Izzo. Per §5, the Slice 11 poliastro agreement (and the recon's 2e-15 return-cell match) shows implementation agreement, not formulation independence. An endpoint-closure propagation test and a different-formulation solver are needed. S20_03 item 15 checks the latter.
- **Two U values were Nova's own examples in the S20_02 prompt:** 125 km and 1.5 km/s. They were correctly not confirmed.
- **Conflict on file:** the K2 prototype's `K2_LEARNINGS.md` says "NHATS caps entry at 12 km/s at 125 km". This response treats 125 km as unverified. S20_03 item 11 settles it.
