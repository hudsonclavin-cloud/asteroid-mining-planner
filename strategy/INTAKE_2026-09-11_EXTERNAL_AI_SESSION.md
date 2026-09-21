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
### §9.1 Correction — Front B had already landed (appended 2026-09-21)

This intake was written without repository access, and its sequencing was stale on the day it was written. Front B's
NEA drift measurement had already completed and been recorded five to six days earlier: the JPL-integrated truth
fixture `tests/fixtures/v2/nea-drift-truth-2026-2046.json` landed at `0d927e4` (2026-09-05); the drift artifacts
under `tools/slice18-research/` (`nea-drift-results.json`, `NEA_DRIFT_MEASUREMENT.md`) landed at `d663e9c`
(2026-09-06); STATUS recorded completion at `6e89131` (2026-09-06, "Front B complete — NEA drift measured, condition
code ruled out, close approaches identified as the mechanism"). All dates are git author dates, not prose dates.

**Citation correction to this amendment's own draft.** The stale sequencing lives in §4 ("Front B's drift-vs-time
result decides how far the horizon can honestly extend") and in §7's next-action row ("Its result, together with
Front B, feeds the Slice 19 seat decision"). The phrase "decide after Front B lands" is from the companion
document's §3, not from this one. §1 point 2 is not a sequencing claim — it states that NEA drift past the truth
fixture's end is unmeasured — and it stands unchanged.

What Front B measured, within the truth fixture's span (its `window` key: start `2026-01-01`, stop `2046-01-01`,
step `7d`):

- Of **17 NEA-band bodies, 15 reached at least 10⁶ km** of two-body drift against JPL-integrated truth. The two
  below the line are `2010 KD` (4.65e5 km) and `433` (6.26e5 km); the maximum is `99942` at 3.258e8 km. Counted
  from the per-body `max_km` fields in `tools/slice18-research/nea-drift-results.json`.
- **Drift is dominated by close approaches, not elapsed time.** `99942`'s drift is 33,477 km immediately before its
  2029-04-13 Earth approach and 1,201,378 km immediately after — a 35.9× step across one encounter
  (`bodies["99942"].closeApproaches[0].drift_before_km` / `.drift_after_km`) — while its first full year of drift
  from the 2026-05-01 anchor is 47,885 km (`A_primaryAnchor.yearly_km`).
- **No drift is measured past the truth fixture's stop date.** This intake's §4 point 4 stands.

**What changed the shape of H0.** Slice 18 Front C shipped per-object fidelity tiers (L0/L1/L2) with disclosure,
including a per-cell boundary on the porkchop for L1 bodies. `src/v2/SLICE_18_FOUNDING.md` §8 records it: "Front C
is CLOSED 2026-09-21 — W1–W3 at `22d4fa7` (per STATUS), disclosure strings at `5926b16`, W4/W5 at `cecbc5b`".
DEC-18-7 governs the boundary (de-emphasize with a visible marker, never suppress); DEC-18-8 governs the blunt
unbounded-error form. The code is `src/v2/porkchop/support-boundary.ts` and `src/v2/porkchop/tier-disclosure.ts`,
wired at `src/v2/app/porkchop/main.ts:973`. Extending past 2040 is therefore no longer honesty-BLOCKED; it is
disclosure-ENABLED but UNVALIDATED beyond the truth fixture's end. Any extension must not claim measured support
past that date.

**The existing generator's parameters — confirmed from repo evidence, not from this intake's inference.**
`tools/slice10-research/extend-horizons-fixture.mjs` produced the long-span fixture over the window `2026-01-01` →
`2040-12-31` (:15-18). Its request block (:32-45) states: **CENTER** per body — `@sun` for mercury/venus/earth/mars
(:24-27), `@ssb` for the Sun (:23), `500@399` for the Moon (:26); **EPHEM_TYPE** `VECTORS`; **REF_SYSTEM** `ICRF`;
**REF_PLANE** `FRAME`; **TIME_TYPE** `TDB`; **OUT_UNITS** `KM-S`; **VEC_TABLE** `2`; **STEP_SIZE** `1d`. The repo's
own parameters refute the session's code on exactly the three points §3.3 flagged: REF_PLANE is stated (`FRAME`,
equatorial) rather than left to default to ECLIPTIC, VEC_TABLE is `2` (full state, not position-only), and CENTER is
heliocentric rather than `500@0` (SSB). §3.3's rule stands: extend this generator with identical parameters.
**One trap for whoever extends it:** the generator writes to
`tests/fixtures/v2/horizons-inner-solar-system-2026-2040.json.new` (:7-13), but the fixture the app actually reads
is `src/v2/data/horizons-inner-solar-system-2026-2040.json` — the path correction is already recorded at
`src/v2/SLICE_15_FOUNDING.md:149`. The output must be moved, not written in place.

**New constraint not visible on 2026-09-11: payload — and the horizon is not its cause.** Measured 2026-09-21 from
the deployed build (`docs/`) and the fetch sites in `src/v2`. Eager first-paint payload, per page: **solar-system
113.3 MB**, **`/v2/compare/` 107.8 MB**, **`/v2/porkchop/` 73.3 MB**. Components, deployed bytes: Slice 9 NEA
catalog 54,897,563; Lambert screening cache 34,541,386; fidelity-tier artifact 10,880,093; long-span Earth fixture
7,510,022; the four rolling solar-system fixtures 4,393,858; star catalog 1,120,016. Nothing waits for a user
action: the screening cache and the tier artifact are fetched at **module scope**
(`src/v2/app/catalog-list/panel.ts:70` and `:79`), and the Earth fixture is fetched when the overlay mounts
(`src/v2/app/ui-overlay/overlay.ts:414-421`, reached from `src/v2/app/solar-system/runtime.ts:896`). The
module-scope placement is deliberate and constrained: the comment at `panel.ts:63-69` records that `b6b7f92` moved
the screening cache out of the bundle graph to fix a vite build OOM, and warns against converting it to a lazy load
without re-checking that footprint.

Extending the horizon to 2060 grows **only the Earth fixture**, 7.5 MB → ~17.5 MB (linear in daily samples,
5,479 → 12,785): **+10 MB on a 73–113 MB eager load, i.e. 9–14%.** The screening cache does **not** grow: its
`bestWindows` list is capped at 5 per body (41,905 records carry exactly 5; the single `propagator_failed` record —
the catalog's one hyperbolic body — carries none) and its record count is fixed at the catalog's 41,906. The horizon
multiplies that cache's **compute**, not its bytes: 783 departures × 55 TOFs × 41,905 bodies = 1,804,638,825, which
is exactly the `totalSolves` in its metadata, and at 2060 becomes 1,827 × 55 × 41,905 ≈ 4.21e9 solves — about 2.0 h
against the recorded `wallTimeSeconds` of 3,137.7 (linear estimate, not measured). The tier artifact does not scale
with the horizon either: one record per catalog body, 10,150 of which carry an encounter today. **H0 is therefore
not the payload problem; the payload problem is already shipping.** See the Slice 19 seat decision.

*Verification of this section: Front B's dates were read with `git log --date=iso-strict` on each artifact path, not
from prose. The drift counts, the truth-fixture window and the close-approach figures were recounted from the
committed artifacts. The generator parameters were read from the source lines cited. Every deployed byte size was
read from `docs/` after the build, every fetch site was read at the cited line, and the 1,804,638,825 identity was
derived independently from the cache's own grid and checked against its metadata. Every SHA cited here was confirmed
to exist with `git cat-file -e` before it was written (INV-033). One draft claim was DROPPED rather than published:
that these artifacts load eagerly "over a recorded cold-load problem" — no such cold-load record was found; what the
repo does record is the build-OOM constraint at `panel.ts:63-69` and a measured loader/heap cost for the long
fixture at `src/v2/SLICE_11_FOUNDING.md:169` (4.7 ms → 224 ms, ~0.23 MB → ~15.3 MB retained), neither of which is a
cold-load finding.*
### §9.2 Correction to §9.1 — payload figures were worktree bytes, not served bytes (appended 2026-09-21)

§9.1's payload numbers were labelled "deployed bytes". They were **working-tree** bytes. `.gitattributes:9` declares
`docs/** linguist-generated text eol=lf` (with `-text` exemptions for .jpg/.png/.tif/.bin at :10-13), so the blobs
GitHub Pages serves are **LF**, while the working-tree copies under `docs/` carry CRLF — the Vite build copies them
from CRLF sources, and git normalises on commit, which is why `git status -- docs` is clean while the two sizes
differ. Found by an adversarial re-check of §9.1 and re-verified independently with
`git cat-file -s $(git rev-parse HEAD:<path>)`.

| artifact | §9.1 said (worktree) | served blob (LF) | delta |
|---|---|---|---|
| Slice 9 NEA catalog | 54,897,563 | **52,969,826** | −1,927,737 |
| Lambert screening cache | 34,541,386 | **34,499,477** | −41,909 |
| fidelity-tier artifact | 10,880,093 | **10,880,093** | 0 (already LF) |
| long-span Earth fixture | 7,510,022 | **7,214,102** | −295,920 |
| four rolling fixtures | 4,393,858 | **4,223,359** | −170,499 |
| star catalog (`.bin`) | 1,120,016 | **1,120,016** | 0 (`-text`) |

Corrected eager first-paint totals: **solar-system 110,906,873 B (110.9 MB)** · **`/v2/compare/` 105,563,498 B
(105.6 MB)** · **`/v2/porkchop/` 71,064,021 B (71.1 MB)**. §9.1's 113.3 / 107.8 / 73.3 MB are each ~2.2–2.4 MB high.
**The conclusion is unchanged:** the 2060 Earth fixture grows 7,214,102 → ~16.8 MB, i.e. **+9.6 MB, 8.7% of the
solar-system total and 13.5% of the porkchop total** — still "H0 is not the payload problem."

Two figures §9.1 should have carried, both measured 2026-09-21:

**Wire vs decoded.** Gzipping the served blobs (python `gzip`, level 6) gives **22,448,447 B ≈ 22.4 MB** for the
solar-system eager set against 110.9 MB decoded — ratios 6.3× (NEA catalog), 4.0× (screening cache), 8.8× (tier
artifact), 3.4× (Earth fixture), 1.6× (star catalog `.bin`). *INFERRED:* if the host applies its usual gzip, the
network cost is ~22 MB and the ~111 MB is the decode-and-parse cost. Both matter, for different reasons — the wire
figure is the user's wait on a cold connection, the decoded figure is main-thread parse time and retained heap. A
payload slice should say which one it is optimising.

**A 2060 cache regeneration cannot run against committed data at all.** `tools/build/precompute-lambert-screen.mjs`
interpolates an Earth state at every departure epoch (fixture path built at :159-165; per-epoch interpolation at
:190 via `interpolateBodyStateSeries`) from the same 5,479-record fixture that ends 2040-12-31. A 2026→2060
departure grid needs ~12,785 daily records — **~7,306 are missing** — and the TOF axis reaches a further 1,826 days
beyond the last departure. So the Horizons pull is a *prerequisite* to the cache run, not a parallel task, and it
invalidates `metadata.provenance.horizonsFixtureSha256`. Separately, the generator guards its own runtime:
`MAX_RUNTIME_SECONDS = 75 * 60` (:96), checked every 250 bodies (:97, :330-334). The recorded full run was
3,137.7 s; a 2060 run at the same rate is ~7,321 s, so **the generator would abort itself partway through** and the
guard needs raising deliberately, with a reason, rather than discovered.

*Verification of this section: every served size was read with `git cat-file -s` on the HEAD blob, not from `stat`;
the CR counts were obtained by byte scan (`bytes.count(b'\r')`), never by a shell `grep -c` on `$'\r'`, which is
how §9.1's author first mis-measured this class of thing; the gzip figures were computed over the raw blob bytes;
the missing-record count is (2026-01-01…2060-12-31 daily) − 5,479 read from the fixture itself. The error corrected
here was found by a check run against §9.1 rather than by its author.*
