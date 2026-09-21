# INTAKE 2026-09-11 — External-AI Session Audit (Google AI Mode)

Status: STRATEGY RECORD · LEADS-GRADE. Nothing here locks a DEC, amends an invariant, or authorizes code.
Additive-only by convention: later findings append in §9; nothing is deleted.
Repo home: `strategy/` (never `docs/`, which deploys).
Companion: `strategy/IDEA_KERNELS_2026-09.md` (what survives from the brainstorm).

## §0. Provenance and reading rule

- Source: one brainstorming session with Google Search "AI Mode" that Hudson pasted to Nova on 2026-09-11, plus three
  files that assistant generated: `Aster_V2_Full_Chat_Log.txt`, `Aster_V2_Full_Chat_Log.pdf`,
  `Aster_V2_Grand_Vision_Blueprint.pdf`.
- Reading rule: all of it is **external-AI output**, the same rank as `Downloads/fable-drafts/*`. It is a source of
  leads only, never authority, and never gets written into the repo verbatim. Code in it is a hypothesis. Its numbers
  are unverified until re-measured here or in a later verification pass.
- The raw artifacts are **not committed**. They belong in the private vault. The repo README says it "states only what
  is verified in this repository", and committing an unaudited "Grand Vision" beside that line would contradict it.
- Every verdict below cites how it was checked. Checks were run by Nova in a sandbox on 2026-09-11. Primary sources:
  the JPL Horizons API docs and NAIF ID docs, both fetched 2026-09-11. The sandbox scripts were Nova's own; they
  imported no Aster code.

## §1. Verdict (lead with this)

1. **Do not hand the chat log to an execution agent as a spec.** Of its 4 code artifacts, 2 are non-functional
   stubs. The one that touches the data spine would bring back the exact frame error DEC-12-2 exists to prevent. [Certain, §3]
2. **The "past 2040" problem is an honesty problem, not a data-file problem.** Horizons can supply planet states to
   2060 in minutes. The hard parts are (a) regenerating the screening cache and (b) the fact that NEA two-body drift
   past the Front B truth fixture's end (2046) is unmeasured, and DEC-18-3 requires measured or qualitative
   disclosure. [Likely, §4]
3. **Chebyshev compression is a real technique, but the session sold it badly.** It is *more accurate per number*
   than Aster's daily Hermite fixtures (measured on a synthetic orbit, §3.4). The session's size claim is false by
   about 38×, and the technique is not required to extend the horizon. Treat it as an optional fixture-format
   experiment, not a fix. [Likely]
4. **The low-thrust RK4 is correct math but covers perhaps 10% of the problem.** It is 2D, has no dry-mass floor, and
   has no guidance law or optimizer. It is a propagator, not a planner. [Certain on the defects; Speculative on the 10%]
5. **Of the 25 "grand" ideas, 12 reduce to real, on-brand engineering kernels, and several are strong.** 2 go to
   backlog, 1 is thesis-only, and 10 are killed. See `IDEA_KERNELS_2026-09.md`.

## §2. Out of scope (not filed, not verified)

Navier–Stokes / OpenAI proof claims, the Millennium Problems summary, the "2030s Centennial Problems" list, and the
Dyson-swarm timeline. None of it bears on Aster. Nova did not verify the Navier–Stokes claims, and they must not be
quoted from this record.

## §3. Code audit

### §3.1 `evaluateChebyshev` (proposed `src/v2/core/ephemeris/chebyshev.ts`)

| Check | Result |
|---|---|
| Clenshaw recurrence correctness (txt version, scalar `t`) | **Correct.** Max abs diff vs `numpy.polynomial.chebyshev.chebval` over 2,000 random cases = 1.4e-14. |
| In-chat version | Typed `t_normalized: number[]` and read `t[0]`, a signature bug. The txt "full log" silently fixed it. The two artifacts disagree. |
| Domain guard | None. `t = 1.5` evaluates silently (returned 14.5 for `[1,2,3]`). A value outside [-1,1] must be a refusal, not a number. |
| Velocity | Missing. The porkchop worker needs Earth *velocity* (`vInfDep = v1 − vEarth`). Either position-derivative evaluation or separate velocity coefficients is required, and the error amplification from differentiation must be measured. |
| Segment lookup / epoch mapping | Missing. |
| Placement | `src/v2/core/` is protected surface and ships inside `aster-mission-mcp`. Any addition is math-layer, so it needs the multi-agent audit before deploy. |

### §3.2 `propagateStepRK4` (proposed `src/v2/core/dynamics/lowThrustPropagator.ts`)

| Check | Result |
|---|---|
| RK4 blending and mass flow `ṁ = −T/(g0·Isp)` | Correct. |
| Zero-thrust circular orbit, 10 revolutions | 1 au, dt = 1 d: \|ΔE/E\| = 2.6e-9, radius drift 0.39 km. **0.387 au (Mercury), dt = 1 d: \|ΔE/E\| = 3.3e-6, radius drift 188 km.** dt = 0.25 d: 0.18 km. A fixed step size does not transfer across heliocentric distance. Needs adaptive step-size control or a validated dt with a stated bound. |
| Dry-mass floor | **Absent.** The guard is `mass > 0`. Test: 500 kg dry + 100 kg propellant, 0.5 N, Isp 3000 s. Propellant runs out on day 68, and after 136 days of thrusting the mass is 400.3 kg, meaning the structure was "burned." |
| Dimensionality | **2D.** Aster is 3D, heliocentric J2000 equatorial ICRF. NEA targets are inclined (Mercury's orbit is inclined 7° to the ecliptic). A 2D model cannot represent an out-of-plane rendezvous. [Certain] |
| Constant | Hard-codes `G_SUN = 1.32712440018e20`, which is [Likely] the DE405-era value, while Aster's Horizons data is DE44x. The numerical impact is negligible (~1e-10 relative). **The provenance impact is not:** it would add a second GM to the core. The rule is to import the core's existing constant. |
| Units | Meters and SI, which matches the worker convention (INVARIANTS §2: m, m/s, TDB s since J2000). Fixtures are km, so the conversion boundary must be explicit. |
| Scope | Takes `thrustAngle` as an input. No control law, no optimizer, no boundary-value solve. It cannot produce a porkchop cell. |

### §3.3 `fetch_horizons.py` (proposed `tools/ephemeris-compressor/`)

| Check | Result |
|---|---|
| Runs end to end | **No.** `parse_horizons_vectors` body is `pass` and returns `[]`. `main()` never calls `fetch_body_vectors`: the in-chat version had it commented out, and the txt version only prints. No file is written. |
| `CENTER '500@0'` | **Solar System Barycenter**, not heliocentric (NAIF ID 0 = SSB, 10 = Sun; NAIF docs fetched 2026-09-11). Metadata says "Heliocentric." Label and value disagree. INVARIANTS §2 defines r1 as Earth's *heliocentric* position. The Sun–SSB offset is [Likely] on the order of 10⁶ km. |
| `REF_PLANE` | **Omitted, so it defaults to `ECLIPTIC`** (Horizons API docs, verified 2026-09-11). Metadata says "ICRF." DEC-12-2 measured the porkchop fixture as equatorial (Earth vZ reaching 11.715 km/s) and applies **no rotation**. Ecliptic data dropped into that path would **silently corrupt DLA by up to ~23.4°**, the exact failure INVARIANTS §2 warns about. |
| `VEC_TABLE '1'` | **Position only** (docs: "1: Position components only"). The worker and Hermite interpolation need velocity (`'2'` = state vector). |
| Body map | `399` labeled "Earth-Moon_Barycenter" (399 = Earth; EMB = 3). `499` labeled "Mars_Barycenter" (499 = Mars; Mars barycenter = 4). Two more label/value mismatches. |
| Other | `datetime.utcnow()` is deprecated as of Python 3.12. The in-chat version used URL `https://nasa.gov`. |
| Right move regardless | Aster already has a generator for `horizons-inner-solar-system-2026-2040.json`. **Extend that generator's span with identical parameters. Do not write a new pipeline.** Recon Q1 locates it. |

### §3.4 `compress.py` + the Chebyshev claims

| Claim in session | Measured |
|---|---|
| "Evaluates at Chebyshev nodes to avoid Gibbs edge distortion" | Not implemented. It is least-squares on `linspace` samples. That is technically fine with dense sampling, but it isn't what the text says. |
| Compression loop | Body is `pass`. It returns empty segments. |
| "A century of planetary data under 100 KB" | **False.** At the session's own settings (14 coeffs, 16-day segments, 5 bodies, 3 position components), 100 years comes to 479,430 numbers: **3.84 MB as float64 binary** (~38× over) and ~10 MB as JSON. |
| 2026–2060 at DE-style settings | 777 segments → 163,170 numbers ≈ 1.31 MB binary / ~3.4 MB JSON, compared with daily Hermite pos+vel for the same span: 372,540 numbers ≈ 2.98 MB / ~7.8 MB JSON. **About 2.3× fewer numbers, not 100×.** |
| Accuracy (synthetic two-body orbits, worst segment over one orbit) | Mercury: 16 d / 14 coeffs → 0.008 km; 32 d / 14 → 16 km; 8 d / 11 → 0.0009 km. Venus/Mars 32 d / 11 → ≤1e-5 km. **Compare the measured daily-Hermite Mercury max of 20.05 km** (`tools/slice2-research/interpolation-report.md`, per CONTEXT_RESEARCH_CORPUS C1). |
| Caveat on the synthetic test | Real Earth geocenter (NAIF 399) wobbles around the EMB with a ~27-day period and an amplitude of thousands of km [Likely]. That is why JPL fits EMB and Moon separately. The synthetic results are **optimistic for Earth** and must be re-measured on real Horizons vectors, including velocity-from-derivative error. |

Net: Chebyshev is a legitimate **accuracy-per-byte** upgrade candidate, following the pattern of the Slice 2 Hermite
cadence study. It is not on the critical path for the horizon extension.

### §3.5 Other code-adjacent claims

- A proposed `confidence: "live"` value: EvidenceEnvelope v1's classes are observed / derived / assumed. A new class
  requires a DEC. The honest shape for "live" data is a snapshot date plus freshness fields (master plan S1; Aster Ops
  L10), not a new confidence value.
- A proposed leaf with `"commit"` inside a Quantity: in the README example, commits live in `provenance[]` entries and
  leaves carry `sourceIds`. The proposal mixes the two layers. [Likely a schema mismatch; confirm against the v1 schema.]
- The session's "QOL features from pro tools" mostly rediscover what Aster already has or plans: refusal explanations
  (the `explain_cell` tool and structured refusals already ship), porkchop↔3D sync (that is Mission View, DEC-18-4
  deferred), and a target-centric frame (a Mission View candidate). Its "ΔV breakdown into plane-change / phasing /
  capture" does not decompose a single Lambert arc that way. The honest kernel is the departure v∞ (already via
  C3/DLA) and arrival v∞ split, which is already computed as `vInfArr`.

## §4. The 2040 bound: what "past 2040" actually costs

The bound is encoded in at least four places (per project docs; Recon Q2 inventories them exhaustively):

1. The porkchop worker's long-span Earth fixture, departure window 2026-01-01 → 2040-01-01 (DEC-11C-5: this is a
   separate source from the 3D scene's 90-day fixture, and the two must not be merged).
2. The screening cache, 2026-01-01 → 2040-12-31, with 1,804,638,825 solves and 34.5 MB. That is already eleven months
   longer than the view window (SLICE_17 F2 mismatch, still open). Naive linear scaling to 2060-12-31 gives ~4.2e9
   solves and ~80 MB. [Speculative: linear scaling; the recon measures the real generator.]
3. The DEC-17-5 method badge departure window. It is derived at runtime and not a literal, so it should follow the data.
4. NEA positions. The Front B truth fixture covers 2026–2046. **No measured drift exists past 2046.** Extending the
   window to 2060 without that measurement would put two-body NEA positions 14+ years beyond any measurement onto a
   trust surface. DEC-18-3 (disclosure must be per-object measured, or qualitative) governs this.

**Sequencing:** Front B's drift-vs-time result decides how far the horizon can honestly extend. The planet ephemeris
is the easy part.

## §5. Assistant-behavior notes (for calibrating future intakes)

- Heavy flattery ("world-class," "masterclass," "bulletproof," "absolute privilege") carried no evidential weight,
  and in each case it came right before an unverified technical claim.
- It said "I just checked out your Skyhook repository" and gave no repo-specific content. Treat that as not read.
- It described the txt as "every single line of code … begin implementing without parsing errors." Two of the four
  files are stubs.
- It validated physically unsound items (dark-matter navigation, "quantum gravitational anomaly" surfing) with the
  same enthusiasm as sound ones. Its enthusiasm does not discriminate.

## §6. Hudson's stated direction captured in the session (his words, summarized)

- Aster is ~8 months old. Current wants: data past 2040, low-thrust modeling (**ion engines only**; he considers
  solar sails too untested), true live data, better visuals.
- **Product-first:** "build it then make it cheap." Money comes later.
- Likes color-coded thrust arcs (thrusting vs coasting) with **toggleable** thrust vectors. This is a Mission View-era
  UI note.
- Wants the Cislunar whiplash (Aster → Skyhook momentum exchange) explored. Kernel K1 in the companion file.
- Life-thesis framing from the session: land on asteroids and redirect material to where it is usable; long arc
  toward orbital infrastructure. See the companion file's physics note on moving bodies vs moving product.

## §7. Disposition

| Item | Disposition |
|---|---|
| Raw chat log + 2 PDFs | Vault only. Not committed. |
| Clenshaw evaluator | Reference sketch. Becomes a candidate only inside a fixture-format experiment with measured error vs Hermite on real vectors. |
| RK4 low-thrust | Reference sketch. The low-thrust capability starts at pre-research (method choice, 3D, oracle), not here. |
| fetch_horizons.py / compress.py | Discarded. Extend the existing generator instead. |
| 25 ideas | Triaged in `IDEA_KERNELS_2026-09.md`. |
| Next action | `dispatches/RECON-HORIZON-2060-2026-09-11.txt` (read-only). Its result, together with Front B, feeds the Slice 19 seat decision. |

## §8. Verification bindings

- Horizons `REF_PLANE` default = ECLIPTIC; `VEC_TABLE 1` = position only. VERIFIED: https://ssd-api.jpl.nasa.gov/doc/horizons.html (2026-09-11).
- NAIF IDs 0 SSB · 3 EMB · 4 Mars barycenter · 10 Sun · 399 Earth · 499 Mars. VERIFIED: https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/naif_ids.html (2026-09-11).
- Clenshaw, RK4 drift, dry-mass, and Chebyshev size/accuracy figures: measured by Nova in a sandbox with scratch
  scripts, not Aster code. HOUSE-MEASURED (single actor). Re-measure inside the repo before any DEC cites them.
- DE405 vs DE44x GM_sun: LEAD, unverified. Irrelevant once the rule "import the core constant" is followed.
- Sun–SSB offset magnitude and Earth–EMB wobble amplitude: LEADS, unverified.

## §9. Appended findings

(Append below. Never edit above.)
