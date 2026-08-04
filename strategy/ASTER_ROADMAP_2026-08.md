# ASTER ROADMAP — Post-Slice-16 (2026-08-02) · rev B

**Status:** DRAFT — strategy leads, not locked. Slice-level DECs lock in each
slice's founding doc per slice-discipline. Nothing here is a DEC.
**Author:** Nova (Fable), from Hudson's 2026-08-02 direction + S16 handoff.
**rev B (2026-08-02, later):** adds §9 research triage (P1–P5 returned),
P0-F1 design record, D-A adjustments, backlog additions. Additive over rev A.
**Suggested commit path:** `strategy/ASTER_ROADMAP_2026-08.md`

---

## §0. Reframe (what changed 2026-08-02)

- **No hard deadline.** Fellows is next cycle at earliest; a tritium-producer
  internship may take the near-term seat. Aster's audience is long-horizon:
  SpaceX-class employers, next-cycle Fellows, future investors. Implication:
  quality over speed, no compressed slices, and the *live demo* is the first
  thing every one of those reviewers sees.
- **Trunk vs branch, named.** Slices 9–15 built a mission-planning platform
  (trunk). Slice 16 built an honesty-research instrument (branch — sealed,
  published, DOI'd, doesn't decay). 17+ returns to the trunk.
- **Slice 20 is not a terminus.** The capability quartet completes a *product*;
  the Living Sky arc (21+) makes it *alive and accurate*. More slices after
  that as the project earns them.
- **Direction from Hudson (verbatim intents):** planets accurate to the
  day/hour · label on/off toggle · Earth (and other planets) fidelity →
  landing sites · gravitational dynamics ("means a lot for what we will be
  doing") · live satellite positions (Hudson to send candidate sources) ·
  heavy Perplexity pre-research.

---

## §1. Phase 0 — Shopfront + Clock (this week, pre-semester, $0, NOT a slice)

Semester starts 2026-08-08 → ~6 days of full bandwidth. Phase 0 is the
handoff's reviewer-surface work demoted from slice to close-out block (per
Hudson's call: slice numbers go to capabilities), plus the clock fix — because
the live demo showing a May sky in August undermines every accuracy claim the
new README will make.

| # | Item | Source | Route |
|---|---|---|---|
| P0-R1 | Epoch recon — DONE 2026-08-02, verdict [Certain]: epoch = fixture timeMin (2026-05-01); no wall-clock read; fixtures expired 2026-07-30 | dispatch executed | Claude Code |
| P0-R2 | Long-span/tooling recon — DONE 2026-08-02; see §8 record | dispatch executed | Claude Code |
| P0-F1a | Tooling: parameterize fetcher windows, builder out-paths, write missing Mars builder | R2 Q5/S5 | Codex |
| P0-F1b | Data: four rolling fixtures (now−15d → now+75d) into src/v2/data/; tests/fixtures untouched | R2 S1/S3 + INV-037 risk | Codex, STOP gate |
| P0-F1c | Code: loader repoint, clock seeded from now via core UTC→TDB, 1× auto-advance, edge-clamp disclosure, HUD UTC line, title decoy removed | R1 F1–F7, R2 Q3/S7 | Codex, browser gate |
| P0-D1 | Root README — verified claims only; leads with live demo, oracle-validated math, MCP quick start, S16 honest status | handoff L7-1, HIGH/SMALL | Codex |
| P0-D2 | Surface MCP package on About page | handoff L7-2, HIGH/SMALL | Codex |
| P0-D3 | Slice 16 study index, plain language, instrument-first | handoff §3.3 | Codex |
| P0-D4 | Curated EvidenceEnvelope + structured refusal exhibits from committed `mcp/eval` fixtures | handoff §3.4 | Codex |
| P0-D5 | Current screenshot, post browser-verification gate — AFTER F1c deploys (screenshot shows a current sky) | handoff §3.5 | Hudson + Codex |
| P0-S1 | Retire/rescope stale `.claude/agents` definitions (write authority to legacy code) | handoff L1-1, HIGH/SMALL | Codex |
| P0-S2 | CI covers published MCP package + Slice 16 suite | handoff L4-1, HIGH/SMALL | Codex |
| rider | Label toggle — R1 §6: a label layer + visibility subscription already exist; check the live UI for an existing toggle before scheduling any work | Hudson, 30 s | — |

Exit criterion: a stranger landing on the repo or the live demo sees a front
page and a current sky. Every README claim verified against the repo before
written.

---

## §2. Slices 17–20 — Capability Quartet (approved 2026-08-02, unchanged)

Ship in order; 17 first is firm, 18–20 internal order swappable if a founding
doc surfaces a dependency reason.

- **Slice 17 — Target Compare.** 3–5 asteroids side by side, best windows
  ranked by ΔV / delivered mass. Answers "should I go to X or Y" — the single
  biggest capability gap, and what makes the 41,906-body catalog useful
  rather than decorative. Reuses the porkchop engine directly.
- **Slice 18 — Explain This Cell.** Click a cell → the derivation: Lambert
  solution, C3, DLA vs site limits, vehicle curve, each number with
  provenance. Surfaces the MCP evidence-envelope machinery in the UI.
- **Slice 19 — Sensitivity.** Move assumptions, watch the answer move; what
  flips GREEN→RED. Turns a calculator into a decision instrument.
- **Slice 20 — Mission View.** Animated transfer arc with uncertainty
  envelope in the solar-system view. **rev B note:** this is where the
  long-span-in-scene question returns with an actual product need (arcs
  traverse months–years). Expected shape: async load of the 2026–2040 file
  (house precedent: the 33 MB screening cache) + per-body time domains,
  designed under this slice's founding doc. Slice 11's measured rejection
  of the *eager* swap (4.7→224 ms, 0.23→15.3 MB) stays respected until then.

---

## §3. Slices 21–23 — Living Sky Arc (new, from 2026-08-02 direction)

Proposed order: Planets & Sites → Gravity → Satellites. Rationale: 21 is
frame-chain work (Aster's recurring bug class — do it carefully once, early);
22 is fully in-house with zero external dependencies; 23 carries the external
unknowns (data licensing, the INV-024 tension) so it goes last, and its
groundwork is shared with Aster Traffic.

### Slice 21 — Planets & Sites
Earth orientation done right: ERA/CIO chain per P2 (§9); WGS84 geodetic →
ECEF → inertial site math (ellipsoidal, not spherical — 21.4 km flattening);
texture seam aligned by a single audited constant rotation with the
three-truth-point check (Greenwich equator, 90°E equator, north pole);
launch/landing site markers from authoritative sources (operator pages, NASA
DSN, LROC/Wagner 2016 for lunar, ±15 m network class); Uranus/Neptune added
(absent from the shipped view — R2 premise correction); visual fidelity pass;
the label system (toggleable, decluttered). Frame chain gets audit treatment.
*Known trap: fidelity is a bottomless pit. §7 of its founding doc states the
budget explicitly. UT1: defer EOP ingestion; UTC-only rotation with a
disclosed ≤~0.4 km equatorial bound (P2 lead), pluggable Q/R/W interface
preserved for later rigor.*

### Slice 22 — Gravity
House-derived numerical propagation scoped **with cislunar in mind** — P3's
architecture leads (§9): frame-agnostic Cowell core, Cartesian inertial
state, perturbations as acceleration callbacks, no central-body assumption
baked into the integrator; DP5(4) interactive + DOP853-class refinement dual
mode; GMAT-style forward/backward closure tests + poliastro matched-force
cross-checks as the oracle fixture family. Real lunar ephemeris enters here
(the Moon is the body where "accurate to the hour" costs real work — P1).
Full math-layer discipline: multi-agent audit, oracle validation,
anti-porting.

### Slice 23 — Live Satellites
Data path per D-A′ (locked-early candidate): same-origin mirrored GP/OMM
snapshots refreshed by scheduled CI — no runtime browser fetch of CelesTrak
(no published CORS/redistribution contract), no Space-Track dependence
(account-gated, non-transfer terms). Propagator per D-A. Regime-aware
staleness disclosure (element epoch + catalog refresh + propagation model,
per P4's viewer-practice leads). Instanced rendering per
realtime-3d-performance. Boundary with Aster Traffic per D-C.

### Beyond 23 (unnumbered backlog, in no order)
CR3BP / cislunar lens · catalog freshness pipeline (D-E) · RQ3 redesign ·
Aster Bench · S16 backlog remnants · **rev B additions:** CI cron
regeneration of the rolling sky fixtures (first customer of the D-E
pipeline pattern; manual regen due ~2026-10-01 until then) · retire dead
routes src/v2/app/inner-solar-system/ + earth-moon/ (unreachable, R2 Q4) ·
consolidate six duplicate UTC↔TDB inlines onto the core module (R2 Q3;
F1c adds the first core import, mcp/ duplicates fold at the next package
release with DD-7) · schema-level fetchedAtUtc provenance field for
Horizons fixtures (needs ingest coordination) · measure the Mars
"@sun"-vs-"500@10" center equivalence (INV-021 flag, R2 anomaly) ·
long-span generator's stale output path (R2 S6).

---

## §4. Decisions that must precede founding docs (Hudson's calls; leads only)

- **D-A — Satellite propagator vs INV-024 (anti-porting).** Options: (1)
  re-derive full SGP4/SDP4 (P4: a small numerical subsystem — branch
  fidelity, constants, deep-space path, Vallado verification vectors — not a
  weekend parser); (2) house-derived Kepler+J2 display propagator, honestly
  labeled; (3) amend INV-024 with a display-grade carve-out. **rev B
  adjustment from P4:** no published Kepler+J2-vs-SGP4 error table exists at
  6 h/24 h/7 d per regime — so option 2's disclosed drift bounds MUST be
  house-measured against MIT-licensed oracles (python-sgp4, satellite.js —
  both suitable, both oracle-only under INV-024) before any UI copy states a
  bound. That measurement is a pre-research task of Slice 23 regardless of
  which option wins. Nova's lean unchanged: option 2 for the mothership
  viewer; conjunction-grade SGP4 lives with Aster Traffic. Hudson locks at
  Slice 23 founding doc.
- **D-A′ (new, lockable early) — Satellite data path.** Same-origin mirrored
  snapshots via scheduled CI publish; trimmed catalog (displayed objects
  only) with per-object provenance + epoch; prominent attribution; no
  runtime cross-origin fetch; no Space-Track. Forced by P4's terms/CORS
  findings — little genuine choice remains; proposed for early lock.
- **D-B — What "gravity" ships.** P3 informs (§9); lock at Slice 22.
- **D-C — Mothership satellite view vs Aster Traffic boundary.** Lock at 23.
- **D-D — Planetary + lunar ephemeris long-term source.** P1 (§9): split
  stack now; the existing Horizons-table + Hermite approach IS the
  DE-subset pattern P1 rates highest-confidence; the state-from-time
  inertial interface P1 says to preserve is exactly getNativeState/
  CanonicalState — already in place, so backends can swap under it. Moon:
  Meeus-class insufficient for cislunar zoom (10–19 arcsec class, 3rd-party);
  truncated ELP/MPP02 or DE-subset when the Earth-Moon view matters (Slice
  22). Analytic re-derivation (VSOP-class) remains the unbounded-coverage
  option for planets — decide at Slice 21/22 with verified numbers.
- **D-E — Catalog freshness policy.** P5 (§9): no upstream delta queries —
  own the diffing (orbit_id / soln_date / condition_code tiers); scheduled
  CI regeneration publishing artifacts, NOT committing multi-MB regenerated
  data into mainline history long-term; NHATS (docs frozen 2019) and
  Asterank: reference material, never dependencies — v2 already clean of
  both; note for the legacy app's eventual retirement.

---

## §5. Honesty-layer extension (house style, applies across the arc)

Every "live" or "accurate" claim carries its own disclosure, same pattern as
INV-016's footer/popover: displayed epoch + data age on the sky view (P0-F1c
ships the first piece: coverage-edge disclosure + dual TDB/UTC HUD);
propagator fidelity + drift bounds on satellites (house-measured, per D-A);
element epoch on catalog bodies; "display-grade, not conjunction-grade"
wherever it applies. Live data that silently goes stale is worse than honest
static data.

---

## §6. Family impacts

- **Aster Bench:** blocked on the honesty-track resumption (RQ3 redesign),
  unscheduled backlog. Deliberate: product > paper for this stretch.
- **Aster Traffic:** P4 directly serves its standing verification leads —
  CelesTrak terms/CORS posture and SGP4 re-derivation scope are now
  characterized (leads, not locked). Slice 23 groundwork shared; boundary at
  D-C; Wave-2 gate rules unchanged.
- **Ledger / Survey:** unchanged.

---

## §7. Risks (advisor block)

- **Biggest risk:** the visual arc jumping the queue — a prettier demo that
  still can't compare targets. Mitigation: Phase 0's only visual item is the
  clock; Slice 17 ships before any Living Sky work.
- **Most likely failure mode:** scope bleed inside Slice 21. Mitigation:
  explicit fidelity budget in its founding doc §7.
- **New (rev B):** the rolling-fixture treadmill — coverage ends 2026-10-16;
  if regeneration is forgotten, the sky silently pins to the edge (with
  disclosure, so it degrades honestly, but degrades). Mitigation: regen due
  ~2026-10-01 on the calendar; CI cron in backlog.
- **Opportunity cost:** honesty research goes cold. Acceptable — sealed,
  published, next-cycle timeline.
- **What would change the recommendation:** originally, a no-time-dimension
  finding (resolved — see §8); now, Slice 17 slipping past September with
  Phase 0 still open would argue for cutting P0-D3/D4 to their minimum.

---

## §8. Running record

- 2026-08-02 — Drafted (Nova/Fable) from Hudson's direction + S16 handoff.
  Discrepancy logged: handoff §2 gives repo path
  /Users/hudsonclavin/asteroid-mining-planner (macOS) vs prior record
  C:\Users\hudso (Windows). **Resolved by P0-R1/R2: macOS path confirmed
  live.** Dispatches use ~/asteroid-mining-planner + git grep (portable).
- 2026-08-02 — P0-R1 executed. Verdict [Certain]: view clock = fixture
  timeMin (2026-05-01 TDB); no wall-clock read anywhere in the v2 view;
  fixtures span only to 2026-07-30 — the view is outside its own data;
  interpolator throws out-of-range. Queue-jump trigger partially fired:
  clock and data-span fixes must land together; stays Phase 0. Premise
  corrections: no Uranus/Neptune in the shipped view; SLICE3_EPOCH_TDB is a
  decoy (title-only); labels exist with a visibility subscription.
- 2026-08-02 — P0-R2 executed. Long-span file: 6 inner bodies incl. Moon,
  schema identical to 90d fixtures (drop-in), 6.9 MB. Core UTC↔TDB
  converter exists, tested, zero app imports; six inline duplicates. Sole
  canonical sky route = /v2/solar-system/; inner-solar-system + earth-moon
  are dead code. Tooling: fetcher windows hardcoded; Mars builder missing
  (fixture hand-assembled). S1: timeMax is min-over-all-series — inner
  swap alone is a no-op. S2: Slice 11 measured and declined the eager
  long-file swap (4.7→224 ms, 0.23→15.3 MB).
- 2026-08-02 — **P0-F1 design decision (Nova proposed, pending Hudson):**
  rolling 90-day fixtures (now−15d → now+75d), same cadences/schema,
  generated into src/v2/data/ (SLICE_15 path-correction home); loader
  repointed; tests/fixtures/ untouched (frozen-expectation risk, INV-037
  class); clock seeded from now via the core converter (first app-layer
  import); 1× auto-advance; app-layer clamp + disclosure (core invariant
  stays strict); HUD gains UTC line via offset derived from the core
  function (exact inverse, zero new literals). Slice 11's recorded
  rejection is respected, not reopened; the long-span-in-scene question
  returns at Slice 20 with a product need. Dispatches F1a/F1b/F1c drafted.
- 2026-08-02 — P1–P5 Perplexity chains returned; triage in §9. All content
  = leads; verify-before-lock before anything enters a DEC.

---

## §9. Research triage (P1–P5, 2026-08-02) — leads, not facts

Committed-artifact convention: when a slice adopts a chain, the output lands
in that slice's tools/sliceN-research/literature/ with its LOAD-BEARING
NUMBERS list curated into the verification pass. Until then, this section is
the pointer.

- **P1 (ephemeris) → D-D, Slices 20–22.** Validates the current
  architecture: Horizons-sampled tables + Hermite = the DE-subset pattern
  (highest-confidence route); the recommended load-bearing interface
  (state-from-time, inertial, TT/TDB-tagged, velocity first-class) is
  already what getNativeState/CanonicalState provide. Split-stack guidance:
  compact analytic is a credible future *planetary* renderer path
  (re-derivable, tiny payload); the Moon is the expensive body —
  Meeus-class ~10–19 arcsec [3p-est] is display-only; truncated ELP/MPP02
  (~5 arcsec / ~2.4 km [3p-est]) or DE-subset before cislunar zoom ships.
  Time-scale floor: UTC→TT via leap seconds is the error that matters
  (~69 s); TT↔TDB is secondary — the core converter already embodies
  exactly this, with its leap-count maintenance note.
- **P2 (Earth orientation) → Slice 21.** ERA/CIO internally (official ERA
  constants in the chain); GMST only for legacy interop. UT1 is the
  user-visible term (1 s ≈ 465 m equatorial [3p-derived]; ≤0.9 s civil
  bound official) — defer EOP ingestion, disclose the bound; polar motion
  negligible for a viewer. WGS84 ellipsoidal site math (a=6,378,137 m,
  f≈1/298.257223563 official); single audited texture rotation +
  three-truth-point check. Site sources: NASA DSN, LROC/Wagner 2016
  (Apollo coords with sub-meter–meter uncertainties), operator pages.
- **P3 (propagation) → D-B, Slice 22 founding draft seed.** Frame-agnostic
  Cowell core; forces as a(t,r,v,params) callbacks; ephemeris access
  belongs to the force layer, not the integrator; central body is metadata.
  Dual integrators: DP5(4) interactive, DOP853-class refinement (GMAT
  defaults official: accuracy 1e-11, step 60 s init / 0.001 s min / 2700 s
  max; poliastro Cowell rtol 1e-11 DOP853). Oracle fixture family:
  GMAT-style forward/backward closure + poliastro matched-force
  cross-checks + regime-separation cases (one where patched-conic agrees,
  one where n-body moves arrival, one where CR3BP structure explains
  divergence). Cislunar shapes the core NOW.
- **P4 (satellites) → D-A, D-A′, Slice 23, Traffic.** No published
  J2-vs-SGP4 drift table — house-measure it (mandatory pre-research for
  D-A option 2). CelesTrak: usable upstream, cadence is qualitative
  ("several times a day" LEO … "once or twice a week" official-qualitative)
  — regime-tiered staleness, not one TTL; no CORS contract → same-origin
  snapshots (D-A′). Space-Track: structurally misaligned for a public
  static app. Oracles: python-sgp4 + satellite.js, both MIT. Viewer
  practice: disclose element epoch + refresh time + model; dim/freeze/warn
  stale LEO rather than extrapolate week-old states.
- **P5 (catalog freshness) → D-E.** SBDB: no documented delta queries —
  diff locally on orbit_id/soln_date; tier by condition_code; daily
  upstream additions (official) support weekly regen comfortably.
  Pipeline: CI cron → build artifact → Pages deploy; avoid multi-MB
  regenerated artifacts accumulating in mainline history (bloat anecdote:
  220 MB → 15 MB after orphaned publish history [3p-est]). NHATS/Asterank:
  reference-only. Convergence: this same pipeline pattern serves the
  satellite snapshots (D-A′) and the rolling sky fixtures — one freshness
  mechanism, three customers.
