# ASTER RESEARCH LEDGER — 2026-08 session
# Suggested commit path: strategy/RESEARCH_LEDGER_2026-08.md
# Commit alongside strategy/ASTER_ROADMAP_2026-08.md (rev B — also still uncommitted).

Every Perplexity result from the 2026-08-02/03 session, in one place, with
status. Everything here is LEADS unless marked VERIFIED — nothing enters a
DEC, invariant, or founding doc without an independent verify-before-lock
pass. Full chains live in the session transcript; adopted chains land in
tools/sliceN-research/literature/ when a slice ingests them.

STATUS KEY:
  ACTED     — consumed by shipped work or a locked design record
  ROUTED    — triaged into a roadmap decision (D-A..D-E) or slice seat;
              no work done yet
  OPEN      — nobody has touched it
  BLOCKED-V — usable only after a named verification
  MOOT      — overtaken by events

═══════════════════════════════════════════════════════════════════════════
1. P1 — Browser-side planetary + lunar ephemeris (2026-08-02)
═══════════════════════════════════════════════════════════════════════════
ACTED   Horizons-table + Hermite validated as the DE-subset pattern (P1's
        highest-confidence route). Consumed implicitly by P0-F1b/F1c: the
        rolling-fixture design kept the architecture P1 endorsed.
ACTED   Time-scale floor (UTC→TT leap seconds ~69 s is the error that
        matters; TT↔TDB secondary). Consumed by F1c: core converter is now
        the app's single time authority; HUD shows both scales.
ROUTED  getNativeState/CanonicalState is the swap-friendly interface →
        D-D. No work needed until Slice 21/22.
ROUTED  Moon is the expensive body — Meeus-class ~10–19 arcsec [3p-est]
        display-only; truncated ELP/MPP02 (~5 arcsec / ~2.4 km [3p-est])
        or DE-subset before cislunar zoom → Slice 22.
OPEN    VSOP-class analytic re-derivation as unbounded-coverage planetary
        path — decide at Slice 21/22 with verified numbers.

═══════════════════════════════════════════════════════════════════════════
2. P2 — Earth orientation, texture, sites (2026-08-02)
═══════════════════════════════════════════════════════════════════════════
ROUTED  Entire chain → Slice 21: ERA/CIO internally (GMST legacy-only);
        UT1 deferred with disclosed ≤~0.4 km equatorial bound [3p-derived,
        ≤0.9 s civil bound official]; polar motion negligible; WGS84
        ellipsoidal site math (a=6,378,137 m, f≈1/298.257223563 official);
        single audited texture rotation + three-truth-point check.
OPEN    Site coordinate sources shortlist (NASA DSN, LROC/Wagner 2016
        Apollo coords, operator pages) — gather at Slice 21 pre-research.

═══════════════════════════════════════════════════════════════════════════
3. P3 — Numerical propagation architecture (2026-08-02)
═══════════════════════════════════════════════════════════════════════════
ROUTED  Entire chain → D-B / Slice 22 founding seed: frame-agnostic Cowell
        core, forces as a(t,r,v,params) callbacks, central body as
        metadata; DP5(4) interactive + DOP853-class refinement (GMAT
        defaults official: acc 1e-11, step 60 s init / 0.001 s min /
        2700 s max; poliastro Cowell rtol 1e-11 DOP853); oracle family =
        GMAT forward/backward closure + poliastro matched-force +
        regime-separation cases. Cislunar shapes the core NOW.
        No work done; nothing blocked.

═══════════════════════════════════════════════════════════════════════════
4. P4 — Live satellite data + propagator (2026-08-02)
═══════════════════════════════════════════════════════════════════════════
ROUTED  Data path → D-A′ (lockable early): same-origin CI-published GP/OMM
        snapshots; no runtime CelesTrak fetch (no CORS contract); no
        Space-Track (account-gated, non-transfer terms). Hudson could lock
        D-A′ any time — it needs no further research.
ROUTED  Propagator → D-A, lock at Slice 23. Lean: house Kepler+J2 display
        propagator; conjunction-grade SGP4 → Aster Traffic.
BLOCKED-V  Drift bounds for Kepler+J2 vs SGP4 (6 h/24 h/7 d per regime):
        NO published table exists — must be HOUSE-MEASURED against
        python-sgp4 / satellite.js (both MIT, oracle-only under INV-024)
        before any UI copy states a bound. Mandatory Slice 23 pre-research
        regardless of D-A outcome.
ROUTED  Viewer staleness practice (disclose element epoch + refresh +
        model; dim/freeze stale LEO) → Slice 23 honesty layer.
ROUTED  Findings shared with Aster Traffic's standing verification leads
        (CelesTrak terms/CORS, SGP4 scope). Wave-2 gates unchanged.

═══════════════════════════════════════════════════════════════════════════
5. P5 — Catalog freshness on a static site (2026-08-02)
═══════════════════════════════════════════════════════════════════════════
ROUTED  Entire chain → D-E: SBDB has no delta queries — own the diffing
        (orbit_id / soln_date / condition_code tiers); CI cron → build
        artifact → Pages deploy; do NOT accumulate multi-MB regenerated
        data in mainline history (bloat anecdote 220→15 MB [3p-est]).
        NHATS docs frozen 2019; Asterank stale — reference-only, v2
        already clean of both.
OPEN    First customer of the D-E pipeline: CI cron regeneration of the
        rolling sky fixtures. Manual regen due ~2026-10-01 until built.
        (The 7-invocation manual recipe is recorded in the F1b rev-G
        report; a single regenerate-sky-fixtures.mjs is backlogged.)

═══════════════════════════════════════════════════════════════════════════
6. Aster explainer / positioning (2026-08-03, prompt 1)
═══════════════════════════════════════════════════════════════════════════
OPEN    Plain-language framing usable as README/About raw material — but
        only after verification (below).
BLOCKED-V  ALL comparative claims ("existing tools rarely run fully
        client-side", "unusual for a single student developer", agency-tool
        characterizations) — unverified superlatives; none may appear in
        README/About until independently checked. One solid named
        comparable to verify first: NASA Eyes on Asteroids.
OPEN    Audience question (university/students vs indie space startups vs
        citizen-science) — unanswered; owns README emphasis. Strategy-chat
        item, not a slice item.

═══════════════════════════════════════════════════════════════════════════
7. QOL / 3D-viewer UX research (2026-08-03, prompt 2)
═══════════════════════════════════════════════════════════════════════════
Fully triaged in SLICE21_QOL_BACKLOG_TRIAGED.md (commit alongside this
ledger, suggested path strategy/). Summary of statuses:
ACTED   Label-occlusion finding → fixed by P0-F1f (screen-space offset),
        live-verified 2026-08-03.
MOOT    Label on/off toggle — already existed; Hudson's original ask
        satisfied by inspection.
BLOCKED-V  Scale-honesty chips: C1 (marker floor is 8 px, not the source's
        6 — measured) and C2 (frame convention unverified; do not ship
        "ecliptic north" until the transform chain is read).
OPEN    Tier 1 (pan, Home button, "?" overlay, shortcut badges), Tier 2
        (axis triad, HUD readout), Tier 3 (click priority, label
        collision), Tier 4 (reference grid, Frame Selected/All).
OPEN    Strategic question: does Tier 1 + T2-1/T2-2 jump ahead of Slice
        17? Decision rule recorded: imminent reviewer/deadline →
        discoverability first; months out → interpretability (17) first.
        DEFAULT IN EFFECT: Slice 17 proceeds (this ledger accompanies its
        pre-research).

═══════════════════════════════════════════════════════════════════════════
8. Cross-cutting verification queue (everything BLOCKED-V, one place)
═══════════════════════════════════════════════════════════════════════════
V1  Kepler+J2 vs SGP4 drift table — house measurement, Slice 23 pre-work.
V2  Explainer comparative claims — check before README/About use.
V3  Frame convention of the solar-system view — read transform chain
    (TOP_DOWN_ECLIPTIC_NORMAL_ICRF at runtime.ts:447 is a hint, not an
    answer) before any frame chip ships.
V4  P1–P5 LOAD-BEARING NUMBERS lists — each chain's list gets its curated
    verify-before-lock pass when its slice ingests it; none run yet.
