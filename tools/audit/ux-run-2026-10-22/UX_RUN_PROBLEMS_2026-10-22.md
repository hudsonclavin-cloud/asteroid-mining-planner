# Oct 22 User Experience Run — Problems

Marker: ASTER-UX-RUN-2026-10-22-A
Run date: 2026-10-22
Requested by: Hudson ("commit a fresh new document … on its flaws")
Author: Claude Code (cloud session). Read-only on product code, tests and builds (AGENTS.md §3);
this file and `evidence/` are the only writes.

Confidence labels: **[Certain]** = observed or measured in this run, with the evidence named ·
**[Likely]** = supported by what was observed, not proven · **[Speculative]** = UX judgment.
Live-site parity is **UNVERIFIED** throughout (see Run boundary).

---

## Run boundary

| Item | Value |
|---|---|
| Repo state | `main` at `6575d0d` (`docs(slice19.5): founding document (DRAFT)`); `origin/main` = `6575d0d` in this clone. The clone is shallow (50 commits), so file histories older than `4d3267c` are not visible here. |
| Web app tested | Committed `docs/` at `6575d0d`, served locally with `http-server` under the `/asteroid-mining-planner/` base path. Entry bundle `docs/assets/porkchopV2-C402DrAR.js`. |
| Browser | Headless Chromium (Playwright 1.56.1, chromium-1194, SwiftShader GL) at 1440×900 and 390×844. FPS numbers from software GL are not representative and are not reported. |
| Live site | `hudsonclavin-cloud.github.io` was **not reachable** from the sandbox (proxy 403). Nothing below claims the live site's behavior. |
| MCP | `aster-mission-mcp@0.1.0` installed from the npm registry, driven by an `@modelcontextprotocol/sdk@1.29.0` stdio client. |
| Persona | A first-time visitor who wants to know "which asteroids are easiest to reach?" and then a mission analyst asking the same question through MCP (prototyping a Skyhook × Aster departure screen). |

---

## Summary

| # | Problem | Surface | Severity | Confidence | Already tracked? |
|---|---|---|---|---|---|
| P1 | Published MCP package lacks the web app's honesty layer: no fidelity tier, no near-zero-C3 flag | MCP | HIGH | Certain | No (registry facts close audit D1-F15) |
| P2 | Cost card shows GREEN delivered mass for a cell the L1 tier says is invalidated | Porkchop | HIGH | Certain | No |
| P3 | Solar-system ephemeris expired 2026-10-16; the landing view opens with a warning and frozen date | Solar system | HIGH | Certain (HEAD build) | No |
| P4 | Targets can't be ranked by reachability, in the catalog list or over MCP | Catalog, MCP | MEDIUM | Certain | No |
| P5 | "LOW C3" and min-C3 don't tell targets apart; Compare's defaults make five very different targets look equal | Catalog, Compare | MEDIUM | Certain (counts) / Likely (impact) | Partly: OQ-19-1, OQ-19-2 |
| P6 | STATUS.md Git State table and `.dispatch-scope` are stale | Agent control plane | MEDIUM | Certain | Partly: Slice 19.5 §1 |
| P7 | Site root still serves the legacy app | Front door | MEDIUM | Certain | Yes: OQ-19-3 |
| P8 | Literal "Grid spans 2026–2040" label still ships | Porkchop | LOW–MEDIUM | Certain | Yes: STATUS Slice 19 carried item 1 |
| P9 | Phone layout: catalog panel covers the scene; class and C3 text run together | Solar system (390 px) | LOW | Certain | No |
| P10 | First-contact density on porkchop | Porkchop | LOW | Speculative | No |
| I1 | No way to express a non-launch-site departure stage | MCP scope | INFO | Certain | n/a |

---

## P1 — The published MCP package is behind the web app's honesty layer  ·  HIGH  ·  [Certain]

**What an agent sees.** `porkchop_scan` for `2000 SG344` (departures 2027-01-01 → 2030-12-31, TOF 60–400 d)
returns `bestCell` departure **2027-08-29**, TOF **261.2 d**, C3 **0.00302 km²/s²**, `vInfArr` 1.358 km/s.
The envelope has no fidelity-tier field and no warning. Its top-level keys are exactly
`envelope_version, tool, value, confidence, provenance, assumptions, validity_envelope, coverage`.
`validity_envelope` reads only: "Departure dates limited to 2025-12-31 through 2040-12-30; grid bounded to 20000 cells."

**What a browser user sees for the same body.** The porkchop side panel shows
"FIDELITY TIER L1 — Screening for this object is supported through 2027-05-16 … Arrivals after it are computed from
an orbit the encounter invalidates." The MCP best cell departs after that boundary.

**Two different gaps.**
1. *Near-zero-C3 flag — a republish gap.* At HEAD, `mcp/src/tools/near-zero-c3.ts` exists and
   `mcp/src/tools/porkchop-scan.ts:143` emits `nearZeroC3`. The published package's `dist/mcp/src/tools/`
   has no `near-zero-c3.js`, and its responses carry no `nearZeroC3` field.
2. *Fidelity tiers — a source gap.* A grep of `mcp/src` at HEAD finds no L0/L1/L2 fidelity handling (only the
   unrelated `inv014Tier`). Republishing alone would **not** bring Slice 18's tiers to agents.

**Registry facts (closes audit 69472a3 finding D1-F15, which was UNVERIFIABLE offline).** `npm view` on 2026-10-22:
only version `0.1.0` exists; created/published `2026-07-10T21:26:23Z`; maintainer `hudsoclavin`;
`dist.shasum c912f2bf1b02a237d2a350eb6eacf73904ec6f18`. Envelope provenance reads
`84fefe88… (build-baked package commit … baked 2026-07-10T19:59:49.784Z)`. These match STATUS.md:14.

**Why it matters.** README §"One core, two interfaces" says validation evidence for one interface is evidence for the
other. The math is shared; the *disclosures* are not. Agents get fewer caveats than browser users, and that is the
exact failure the Slice 16 study measured.

---

## P2 — The cost card certifies a cell the fidelity tier says is invalid  ·  HIGH  ·  [Certain]

**Repro.** `/v2/porkchop/?body=asteroid-2000%20SG344`, skip the tour, click the lower-left region of the plot.
Pinned cell: departure **2027-08-14 + 598 d** (arrival in 2029).

**What the card says.** "9,329 kg delivered to (2000 SG344) **GREEN** Falcon Heavy — Expendable · One-way
rendezvous · 2027-08-14 + 598 d", followed by the full ΔV stack (total 5.118 km/s) and the validation block.

**What it doesn't say.** A text search of the card's span (from "Mission cost" to the start of "Validation") finds
**zero** occurrences of `encounter`, `invalidat`, `Tier L1`, `2027-05-16` or `supported through`. The L1 warning
appears only in the side panel and in the plot's hover/caption text. The hover for a neighbouring cell reads
"Arrival is after this object's 2027-05-16 encounter. This cell is computed from an orbit that encounter invalidates."

**Why it matters.** The most quotable number on the page, a GREEN delivered mass, sits beside a caveat that
voids it, and the card never mentions the caveat. Evidence: `evidence/03-porkchop-sg344-costcard-green.jpg`.

---

## P3 — The solar-system view's ephemeris expired on 2026-10-16  ·  HIGH  ·  [Certain for the HEAD build]

**What a visitor sees on 2026-10-22.** The landing view freezes at "2026 Oct 16 00:00 TDB" with the amber line
"Current time is outside ephemeris coverage — showing nearest available date."
(string at `src/v2/app/solar-system/runtime.ts:959`). Evidence: `evidence/01-solar-system-expired-ephemeris.jpg`.

**Cause.** All four rolling series end on the same day:

| File | Span |
|---|---|
| `src/v2/data/horizons-inner-system-rolling.json` | 2026-07-18 → 2026-10-16 (91 daily records per target) |
| `src/v2/data/horizons-mars-system-rolling.json` | 2026-07-18 → 2026-10-16 |
| `src/v2/data/horizons-jupiter-system-rolling.json` | 2026-07-18 → 2026-10-16 |
| `src/v2/data/horizons-saturn-system-rolling.json` | 2026-07-18 → 2026-10-16 |

They are loaded at `src/v2/app/solar-system/loader.ts:12`. `.github/workflows/` contains only `ci.yml`. Outside the
loader, the only reference found in `tools/` is `tools/slice9-perf/main.ts`. **[Likely]** the refresh is manual, so
the view will expire again roughly every 90 days after each refresh.

**Why it matters.** The first screen is honest but reads as broken, and the planets are drawn at a date that
isn't today.

---

## P4 — No way to rank targets by reachability  ·  MEDIUM  ·  [Certain]

- **UI.** Catalog sort options are exactly A-Z, Z-A, Class, H↑, H↓ (`src/v2/app/catalog-list/panel.ts:48-54`).
  At default sort the first row is `100004 (1983 VA)`, a HIGH C3 body. A visitor asking "what's easy to reach?" can't
  get the answer from the list.
- **MCP.** The `search_bodies` input schema is `query, orbitClass, screeningStatus, limit (≤200), cursor`, with no
  sort. Ranking the catalog by min C3 took **211 paged calls** (~11.7 s) and client-side sorting.
- Ranking by min C3 alone is itself a trap (P5), so the missing sort should not simply be "sort by min C3".

---

## P5 — "LOW C3" and min-C3 don't tell targets apart  ·  MEDIUM  ·  [Certain on counts; Likely on impact]

**The badge is nearly universal.** Over MCP 0.1.0, `screeningStatus` counts are `low_departure_c3` **41,422** and
`high_departure_c3` **483**, so 98.8% of the 41,905 bodies returned under those two statuses carry LOW C3
(threshold 25 km²/s²). On the first catalog screen, 6 of 10 rows are also tagged L2
("screening error unbounded or unmeasured").

**The lowest min-C3 bodies are mostly near-zero-C3 windows with expensive arrivals.** The lowest catalog min-C3
values are Apophis 2.06e-4, 2022 GA2 2.71e-4 and 2025 UK9 3.46e-4 km²/s². With `porkchop_scan`
(2027–2036, TOF 60–600 d, `topN` 50), even the *lowest* arrival v∞ among each body's 50 lowest-C3 cells is high:
2025 UK9 **7.32 km/s**, 2019 EH1 **11.23**, 2025 HA19 **11.96**. The single lowest-C3 cell is worse
(7.62 / 13.83 / 13.10). Agents that rank by min C3 will recommend these first.

**Compare's defaults teach the wrong lesson.** Using `?bodies=2000 SG344,101955,162173,99942,433` with default
settings (*Hide near-zero-C3 windows* unchecked), the best practical windows are near-zero C3 for three of the five
targets: Apophis 5.50e-5, 2000 SG344 0.00177 and Ryugu 0.0176 km²/s². Delivered mass is nearly flat
(10,240 / 10,240 / 10,237 / 10,145 / 9,942 kg) because the column uses a fixed reference budget of 1000 m/s
rendezvous plus 150 m/s stationkeeping. That is disclosed only in the footer. A newcomer leaves believing Ryugu
is as accessible as Apophis. Evidence: `evidence/02-compare-default-near-zero.jpg`.

**Live instance of OQ-19-1.** In that same view the two near-zero-C3 bodies, Apophis and 2000 SG344, are the
ones marked **nondominated**, while Ryugu, Bennu and Eros are **dominated**. That is the "degenerate window wins
dominance" behavior OQ-19-1 asks about.

---

## P6 — The agent control plane is stale  ·  MEDIUM  ·  [Certain]

- `STATUS.md:22-26` (Git State) says `origin/main` is `81252f2` and the local HEAD is branch
  `claude/s18-close-out` at `3d395fb`. In this clone, `main` = `origin/main` = `6575d0d`. The current state lives
  further down, in "Slice 19 — close-out (2026-10-12)" (`STATUS.md:465`).
- AGENTS.md routes every agent to STATUS.md first and says to update it if HEAD doesn't match, so every session
  start trips that gate.
- `.dispatch-scope` still holds the Slice 18 scope (`src/v2/SLICE_18_FOUNDING.md`, `tools/slice18-research/…`).
  `core.hooksPath` is unset in a fresh clone, so **no hook runs unless an agent turns it on**.
- Slice 19.5 §1 names "the agent control plane is stale" in general. These are the specific lines.

---

## P7 — Site root serves the legacy app  ·  MEDIUM  ·  [Certain; already OQ-19-3]

`docs/index.html` loads `/asteroid-mining-planner/assets/legacy-C6NkCVYx.js`. A visitor sees "2026-MAR-27 ·
8 / 11 ASTEROIDS", a 5-step legacy tour, and header status text ("NHATS: All NHATS URLs failed") running under
the "v2 simulator →" button. The NHATS/Asterank fetch through `aster-proxy.hudsonclavin.workers.dev` failed here,
but the sandbox blocks that host, so **whether it fails live is UNVERIFIED**.
Evidence: `evidence/05-site-root-legacy.jpg`.

---

## P8 — Literal "Grid spans 2026–2040" label still ships  ·  LOW–MEDIUM  ·  [Certain; already tracked]

Still at `src/v2/app/porkchop/main.ts:645` at HEAD, and present in `docs/assets/porkchopV2-C402DrAR.js`.
It's recorded here only because a first visitor reads it in the side panel. Its disposition belongs to STATUS
Slice 19 carried item 1.

---

## P9 — Phone layout (390×844)  ·  LOW  ·  [Certain on observation]

- The catalog panel covers almost the whole 3D scene, leaving a sliver of the view.
- The orbit class and the C3 string run together: "APOC3 55.5 km²/s²", "AMOC3 2.77 km²/s²".
- No horizontal page scroll on solar-system or porkchop.
Evidence: `evidence/04-solar-system-mobile-390.jpg`.

---

## P10 — First-contact density on porkchop  ·  LOW  ·  [Speculative]

- The default target `2020 FK3` means nothing to a newcomer. A well-known body such as Bennu or Apophis would
  anchor the first view.
- The guided tour works ("The cheapest window … On energy alone, it's the obvious answer"), but disclosure prose
  comes before the controls. For 2000 SG344 the L1 explainer runs about nine lines in the side panel before any
  control. Disclosure placement, not disclosure content, is the problem (compare P2, where the caveat is missing
  where it's needed most).

---

## I1 — Scope boundary noticed while prototyping a third-party departure stage  ·  INFO  ·  [Certain]

`dla_feasibility.siteId` accepts only `cape-canaveral` and `vandenberg-sfb`, and `estimate_mission_cost` prices
launch vehicles only. A departure that isn't a launch site, such as a Skyhook upper-tip release in an equatorial
plane, can't be expressed. The caller has to read `dla` and `c3` per cell and screen them itself. This isn't a
defect, only the reason a Skyhook screen has to live outside Aster for now.

---

## What worked (keep)

- Evidence envelopes: every leaf carries units, confidence and source IDs, and provenance names commits.
  `get_body("2000 SG344")` labels the 20.4 m radius `confidence: "assumed"`.
- Structured refusals and coverage objects (`returned / total / selection_rule`).
- MCP ergonomics: `npm i aster-mission-mcp` worked first try. In one session, a `porkchop_scan` plus 50
  `dla_feasibility` calls took ~2.1–2.6 s per body.
- The Compare footer and the guided tour are the strongest explanatory writing in the product.

---

## Suggested order (value ÷ effort; not a dispatch)

1. **P2** — repeat the L1 boundary (or a "cell after tier boundary" refusal) inside the cost card. Small, and it
   protects the most-quoted number.
2. **P3** — scheduled refresh of the rolling series, or fall back to the 2026–2040 inner-system series for planet
   positions. Small to medium.
3. **P1** — bring the fidelity tier into `mcp/src`, then republish as 0.2.0 so `nearZeroC3` ships too. Medium.
4. **P5 + P4** — default *Hide near-zero-C3 windows* to on in Compare, rule on OQ-19-1, and add a
   reachability sort that isn't raw min C3 (for example departure C3 plus arrival v∞, with near-zero windows
   excluded). Medium.
5. **P6** — rewrite the STATUS Git State table, and reset `.dispatch-scope` at the start of each dispatch. Small.

---

## Reproduction

```sh
# web app (from a checkout at 6575d0d)
mkdir -p /tmp/ghroot && ln -s "$PWD/docs" /tmp/ghroot/asteroid-mining-planner
npx http-server /tmp/ghroot -p 8083 -s -c-1
#   /asteroid-mining-planner/v2/solar-system/        (P3, P4, P9)
#   /asteroid-mining-planner/v2/porkchop/?body=asteroid-2000%20SG344   (P2, P8, P10)
#   /asteroid-mining-planner/v2/compare/?bodies=2000%20SG344,101955,162173,99942,433   (P5)
#   /asteroid-mining-planner/                        (P7)

# MCP (published package, not the repo build)
npm i @modelcontextprotocol/sdk@1.29.0 aster-mission-mcp@0.1.0
#   porkchop_scan {"designation":"2000 SG344","departureStart":"2027-01-01","departureEnd":"2030-12-31","tofMinDays":60,"tofMaxDays":400}
#   search_bodies {"screeningStatus":"low_departure_c3","limit":200}  -> page with nextCursor (P4, P5)
npm view aster-mission-mcp name version maintainers time dist.shasum --json   # P1 registry facts
```
