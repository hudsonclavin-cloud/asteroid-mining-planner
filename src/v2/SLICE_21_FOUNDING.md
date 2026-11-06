# SLICE 21 — HORIZON & PROPULSION SCAFFOLDS — FOUNDING DOCUMENT

STATUS: DRAFT — pending Hudson review and lock. Every §3 entry is PROPOSED. Hudson rules and locks with a dated line in §9.
Repo home when committed: `src/v2/SLICE_21_FOUNDING.md`. Additive-only once committed.
Written by Claude Code (execution agent, AGENTS §3 amendment DEC-20-13) on 2026-11-06 at main = `cec19e7`,
branch `infra/next-slice-scaffold-20261106`, from Hudson's dispatch of 2026-11-06.

## §1. Purpose and scope

Slice 21 extends the Earth ephemeris past 2040-12-31 and lays the flag-gated groundwork for low-thrust (ion-only)
transfers and for live orbital-element sources — without changing any number a user sees until each part is ruled,
audited and enabled.

Where this intent comes from, in order of authority:
- **Slice 20 (locked 2026-11-04) routes two items to Slice 21 by name** (`src/v2/SLICE_20_FOUNDING.md` §1 OUT OF SCOPE):
  "Extending the Earth ephemeris past 2040-12-31: Slice 21 H0, which already owns fixture regeneration and
  `horizonsFixtureSha256` (DEC-20-3)" and "A catalog-wide return screening cache, and the catalog's supported-window
  filter: Slice 21 (DEC-20-6)". OQ-20-3 asks how far the span extends (2044-12-31, 2049-12-31 or 2052-01-01) and
  OQ-20-5 defaults the return screening cache to this slice.
- **Hudson's stated priorities** (`strategy/INTAKE_2026-09-11_EXTERNAL_AI_SESSION.md:138-139`): data past 2040,
  low-thrust modelling (ion engines only; no solar sails), true live data, better visuals.
- No locked founding document assigns low-thrust or live data to any slice (`SLICE_11_FOUNDING.md:364` and
  `SLICE_13_FOUNDING.md:80` defer SEP without a destination). Their presence here rests on the priorities line above,
  not on a prior lock — recorded in §8.

IN SCOPE (PROPOSED):
- **H0 — ephemeris horizon extension.** Regenerate the long-span inner-system Horizons fixture to a Hudson-ruled end
  date (OQ-21-1) at daily cadence, with provenance (`horizonsFixtureSha256`, generator hash) recorded on the committed
  blob basis.
- **Inherited from DEC-20-6 / OQ-20-5:** the catalog-wide return screening cache and the supported-window filter.
- **Low-thrust scaffold (ion only):** data shapes for a thrust/coast leg and an analytic Edelbaum screening estimate,
  flag-gated OFF, no UI.
- **Live-data scaffold:** an `OrbitSource` adapter interface with a committed-fixture implementation and a mocked
  SBDB implementation, flag-gated OFF, no UI.

OUT OF SCOPE (each with its destination or reason):
- Deploy. Hudson builds, verifies in the browser, commits `docs/`, pushes (AGENTS §9).
- Any change to a porkchop or compare NUMBER. Slice 21 may change labels only until a math-layer audit passes.
- Solar sails (Hudson, Sep 2026: too untested). Multi-body gravity assists. Anything that needs a server.
- Precision-per-tier policy and planetary axes: Slice 22 (SLICE_20 §1). Catch / Momentum Bank (K2): Slice 26.
- Turning any flag ON. A flag flips only by a §9 entry citing the audit that cleared it.

## §2. Inputs and pre-research

- Phase 0 recon of this dispatch (HEAD `cec19e7`, clean, baseline tsc clean, 109/109 files, 360 tests, 0 failed).
- `tools/slice21-research/ephemeris-coverage/` — measurement of the current series boundary and the grid columns
  that fall past it (committed in this branch; see §8 for the commit).
- Existing pre-research under `tools/slice21-research/literature/` (P1_EPHEMERIS, P2_EARTH_ORIENTATION, P3_PROPAGATION,
  P4_SATELLITES, P5_CATALOG_FRESHNESS, QOL_UX, LIVING_SKY): leads only, none verified against a primary source here.
- Slice 20 pre-research that bears on H0: S20_01 R1 (span candidates), DEC-20-3 (Earth-span refusal), OQ-20-3.
- The production ephemeris loader is `ingestSlice2Fixture` (`src/v2/boundary/horizons.ts`); the grid span constants
  live in `src/v2/porkchop/grid-span.ts`; `GRID_PARAMS` (nDep 200 × nTof 100, TOF 182.5–1826.25 d) in
  `src/v2/app/porkchop/main.ts`.

## §3. Decisions

Status per DEC: PROPOSED (needs Hudson). None is RULED in this draft.

### DEC-21-1 — Ephemeris end date and regeneration basis. PROPOSED.
- Extend `src/v2/data/horizons-inner-solar-system-2026-2040.json` (renamed to carry the new end year) to the end date
  Hudson rules under OQ-21-1, same six bodies, daily cadence, same tuple schema, TDB.
- Provenance recorded against `git cat-file blob` bytes, never a working copy (STATUS Slice 19 item 5; S19-D04).
- Every consumer that names the span (`grid-span.ts`, compare's `DEPARTURE_WINDOW_END_UTC`, the overlay, the smoke
  page) derives it from one constant; no page carries a literal year.

### DEC-21-2 — Flags are the only switch. PROPOSED.
- `src/v2/flags.ts` holds every scaffold flag, all default `false`. A flag flips only with a §9 entry naming the audit
  or ruling that cleared it. Nothing under `src/v2/app` reads a flag until that entry exists.

### DEC-21-3 — Low-thrust baseline method is Hudson's call (OQ-21-2); the scaffold admits all three. PROPOSED.
- Ion engines only. `src/v2/lowthrust/types.ts` defines the leg/segment shapes that any of Edelbaum, Sims-Flanagan or
  direct integration can populate. `src/v2/lowthrust/edelbaum.ts` ships the analytic coplanar estimate as a
  screening-grade reference, labelled "not a trajectory".
- Math-layer code: multi-agent audit (`.claude/skills/multi-agent-audit`) before any flag turns it on.

### DEC-21-4 — Live data: adapter first, source second. PROPOSED.
- `src/v2/livedata/adapter.ts` fixes the contract: every element set carries `asOf`, `source` and `elementsFrame`.
  The committed fixture source is the offline default on GitHub Pages; the SBDB source is a mocked-only scaffold until
  OQ-21-4 is ruled and its response shape verified against a live capture committed as a fixture.

### DEC-21-5 — Honesty-layer rule for everything above. PROPOSED.
- No number from H0, low-thrust or live data ships without its provenance and limits stated next to it (INV-016 family,
  INV-026). A scaffold that is off contributes nothing visible; a test guards that (`src/v2/__tests__`).

## §4. Open questions

All OPEN unless a measurement in §2 closes one.

- **OQ-21-1** — Where exactly does the current ephemeris series end, and what is the cheapest way to extend to 2050
  without exceeding the GitHub Pages size budget? The first half is MEASURED (not closed — the end date is a ruling):
  `tools/slice21-research/data/ephemeris-coverage.json`, produced by `tools/slice21-research/ephemeris-coverage/measure.mjs`
  through the production loader: six bodies (sun, mercury, venus, earth, moon, mars), 5,479 daily samples each,
  JD 2461041.5 → 2466519.5 TDB (2026-01-01 → 2040-12-31 TDB midnight; the page's UTC convention renders the last
  instant as 2040-12-30), 7,214,102 bytes on disk = the committed blob, sha256 `b278dd55…`, ≈1,317 bytes/day.
  Porkchop grid (200 × 100, TOF 182.5–1826.25 d, departures 2026-01-01 → 2040-01-01, body-independent): no
  outbound departure and no minimum-TOF arrival falls past coverage; the maximum-TOF arrival first falls past
  coverage at departure column 143 (2036-01-23), so columns 143–199 (57 of 200) have arrivals the series cannot serve —
  the return leg's exposure. Linear bytes/day ESTIMATES for the extension: to 2044-12-31 ≈ +1.92 MB (≈9.14 MB total),
  to 2049-12-31 ≈ +4.33 MB (≈11.54 MB), to 2050-12-31 ≈ +4.81 MB (≈12.02 MB), to 2052-01-01 ≈ +5.29 MB (≈12.51 MB).
  The END DATE is Hudson's ruling (OQ-20-3's candidates: 2044-12-31, 2049-12-31, 2052-01-01). OPEN.
- **OQ-21-2** — Which low-thrust propagation method is the screening-grade baseline: Edelbaum analytic, Sims-Flanagan
  impulsive segments, or direct integration? Hudson's call at lock; the scaffold interface admits all three. OPEN.
- **OQ-21-3** — Are the visible "asteroid-NNNN" slugs (`asteroid-99942`, `asteroid-433`, `asteroid-2020 FK3`, rendered
  from `pageState.bodyId` in the porkchop Grid section and present in compare URLs) a user-facing identifier or an
  internal ID that should be hidden? Hudson's call at lock. Left untouched by this dispatch (Phase 1.6). OPEN.
- **OQ-21-4** — What is the live-data source of truth (JPL SBDB, Horizons, MPC) and what is the fallback when offline on
  GitHub Pages? This dispatch scaffolds the adapter interface only. Note: the repo's existing SBDB client
  (`tools/slice7-research/fetch-sbdb.mjs`) uses the Query API (`sbdb_query.api`, `{fields, data}` rows); the
  single-object `sbdb.api` response shape has no committed capture, so the scaffold targets the verified shape. OPEN.
- **OQ-21-5** — Does Slice 21 also carry the strategy-doc "Living Sky" / "Planets & Sites" visuals work
  (`strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`, `strategy/ASTER_ROADMAP_2026-08.md:95`), or does that remain parked while
  SLICE_20 routes planetary axes to Slice 22? Hudson's call at lock. OPEN.

## §5. Cut rule

Cut in this order if hours run out, recording each cut in §9: live-data SBDB source (keep the adapter and fixture) →
low-thrust Edelbaum (keep the types) → the return screening cache (keep the supported-window filter) → never H0.

## §6. Fronts

- **Front A — H0 horizon extension.** Hudson rules OQ-21-1; regenerate the fixture; re-run the screening cache;
  provenance on blob bytes. Gate: `npm run verify` green; coverage measurement re-run shows no grid column past
  coverage for the outbound AND return legs.
- **Front B — Return screening cache and supported-window filter** (DEC-20-6, OQ-20-5).
- **Front C — Low-thrust baseline.** Rule OQ-21-2; multi-agent audit of `src/v2/lowthrust`; only then a §9 entry may
  flip `LOW_THRUST_ENABLED`.
- **Front D — Live data.** Rule OQ-21-4; capture a live SBDB response as a committed fixture; only then a §9 entry may
  flip `LIVE_DATA_ENABLED`.

## §7. Acceptance

- `npm run verify` N/N green on every commit; CI green before merge; no `docs/` in any commit of this branch.
- With every flag at its default, the porkchop cost card, the compare method block and the catalog render exactly the
  Phase 1 text and nothing from `src/v2/lowthrust` or `src/v2/livedata` (guarded by `src/v2/__tests__`).
- Every new exported function has a unit test; no `any` in new TypeScript.
- Every new module opens with a fidelity statement naming what is NOT modelled.

## §8. Entry / exit and engineering record

- **ENTRY (2026-11-06):** branch `infra/next-slice-scaffold-20261106` from `cec19e7`. Dispatch: Hudson, 2026-11-06,
  "land the four verified fixes from the 2026-11-04 live review, draft the next slice's founding doc as DRAFT, scaffold
  the infrastructure … behind feature flags, with tests". No COPY-VERSION marker on the dispatch (AGENTS §2.2 asks for
  one); Hudson authored it directly, recorded here rather than treated as a stop.
- **Slice number:** NEXT = 21 because Slices 19 (locked 2026-10-12), 19.5 (2026-10-14) and 20 (2026-11-04) are all
  locked by dated §9 lines; their headers keep "DRAFT" under the additive rule. `SLICE_21_FOUNDING.md` did not exist.
- **Intent provenance:** SLICE_20 names Slice 21 for H0 and the return screening cache; the strategy docs label 21
  "Living Sky" / "Planets & Sites" (older, pre-Slice-20); low-thrust and live data come from Hudson's Sep 2026
  priorities, not a locked plan. The founding doc wins where it speaks (H0, return cache); OQ-21-5 carries the rest.
- **Phase 1 commits (wording only, one per fix):**
  - `ec6cb8f` fix(porkchop): reconcile AMBER dogleg-penalty vs delivered-mass wording
  - `76bdc86` fix(porkchop): label DLA-band badge as launch geometry when delivered mass is unavailable
  - `026be58` fix(porkchop): clarify payload-lookup C3 label
  - `575925c` fix(validation): align New Glenn caveat with OBSERVED 3.11% max
  - `3faae37` fix(compare): distinguish cached boundary constant from live-recomputed grids
- **Phase 3 scaffolds** are recorded by commit in the dispatch report and must be cited here by Hudson at lock.
- **EXIT:** Fronts A–D shipped or cut per §5 with §9 entries; the lock record appended in §9 by Hudson.

## §9. Amendments and corrections
(Append only. Never edit above this line.)
