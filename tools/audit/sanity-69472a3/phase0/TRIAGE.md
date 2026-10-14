# S19.5-P0 triage — audit 69472a3 at c185c33

Read-only triage; the intake commits precede this report. “audit only (unverified)” is used where the dispatch permits no single-command recheck.

| ID | Severity | Disposition | Finding | Evidence at c185c33/current descendant | Front |
|---|---|---|---|---|---|
| A1-F01 | HIGH | FIX-CONTROL | STATUS Git State / deploy boundary stale by 36 commits; names refs and bundles that do not exist at HEAD | command: git rev-parse HEAD; rg STATUS.md -> HEAD 6575d0d is descendant of c185c33, while STATUS.md:22-28 still names origin/main 81252f2/local 3d395fb. | C |
| A1-F02 | HIGH | FIX-CONTROL | README says the Slice 16 study has 'no data collected; no results exist' — the repo holds a sealed, closed study with results | command: Node utf8 probe README.md:118-125 -> "no data collected; no results exist". | A |
| A5-F01 | HIGH | LEGACY-QUARANTINE | DEVLOG's Moon "accurate to ~1-2 deg" is false by ~93 deg; the documented epoch phase is not implemented | command: rg DEVLOG.md physics.worker.js index.html -> DEVLOG.md:65 still says "accurate to ~1-2deg"; legacy physics.worker.js supplies the Moon propagator. | A |
| B3-F01 | HIGH | FIX-USER | FK3 guided tour tells the user an AMBER cell "flies only with a dogleg"; the repo's own band model assigns doglegs to RED and prices AMBER at zero added delta-V | command: rg source -> fk3-guided-tour.ts:37 still says "flies only with a dogleg"; main.ts:531-532 selects penalty for AMBER and :897 says AMBER has zero added DV. | B |
| C3-F02 | HIGH | FIX-USER | The shipped compare-page size note applies the X-complex span factor (2.93, 0.07→0.60) as a shrink factor from the 0.14 point estimate; the correct factor from 0.14 to 0.60 is 2.07 | command: Node utf8 probe src/v2/app/compare/main.ts -> :220/.053, :258 still renders the X widening factor for the 0.14 point estimate. | B |
| C4-F01 | HIGH | FIX-USER | Every rendered planetary rotation axis and the Saturn ring plane are 59-115 deg from their true orientation, and the docs state an angle the code does not produce | command: imported-production Node pole probe -> Mars separation 91.62deg, Saturn 59.21deg, Jupiter 115.49deg; runtime import reports MARS_RENDER_TILT_RAD=0.4396484385773716. | G |
| C4-F03 | HIGH | FIX-TEST | The top-down regression test cannot fail, and V2_FOUNDING_DOCUMENT.md:1470 presents it as the fix for exactly that defect | command: node --test tests/v2-runtime-camera-presets.test.mjs -> 3 pass, 0 fail; the test remains green while the source assertion is non-discriminating. | E |
| C5-F01 | HIGH | FIX-USER | First-visit guided tour fires the AMBER variant and states the opposite of what the tool computed | command: rg source -> fk3-guided-tour.ts:37 retains "flies only with a dogleg" and main.ts:531-532 selects it for AMBER. | B |
| C5-F02 | HIGH | FIX-USER | "Aster has not measured the screening error for this object" renders for 7 of the 17 asteroids it did measure | command: Node utf8 probe tier-disclosure.ts:28-29 -> "not measured" followed by "17 asteroids that were measured". | B |
| C5-F03 | HIGH | FIX-USER | Catalog shows "No bodies match the current filters" when the tier artifact fails to load | command: Node utf8 probe catalog-list/panel.ts:95-96 and :552-557 -> a missing tier map returns [] and the non-loading path renders "no-matches". | B |
| C5-F04 | HIGH | ALREADY-FIXED | "Total ΔV" headline always prices a sample return, unlabelled, while the mission mode says one-way | command: node --test tests/v2-porkchop-honesty.test.mjs -> pass; git show fbe8e89 shows the mode-aware stack fix. | — |
| D4-F01 | HIGH | LEGACY-QUARANTINE | tsconfig excludes the entire legacy src tree, so "tsc clean" certifies nothing about it; 21 real type errors are hidden from CI | command: Node utf8 probe tsconfig.json:21-35 -> excludes physics.worker.js, worker, src/data, src/economics, src/main.ts, src/physics, src/renderer, src/state, src/styles, src/ui, src/utils and src/workers. | A |
| D4-F02 | HIGH | LEGACY-QUARANTINE | REFACTOR_MAP marks Stages 3-9 "complete" and src/main.ts as the entry point, but the extracted legacy tree is not built, not wired, and cannot run | command: Node utf8 probe REFACTOR_MAP.md:129-134 -> stages are marked complete while the entry row remains pending. | A |
| D4-F03 | HIGH | LEGACY-QUARANTINE | The deployed root page presents resource values up to 10,320x world GDP at terrestrial spot prices, with no market-saturation caveat anywhere in the repo | command: rg legacy source/docs -> docs/index.html still exposes PAPER VALUE/REALIZABLE NPV and src/economics/pricing/active.ts still computes whole-body value. | A |
| D4-F04 | HIGH | LEGACY-QUARANTINE | "REALIZABLE NPV (demand-adj. 10yr sell, 8% discount)" returns the undiscounted paper value for water and for every unknown commodity | command: rg legacy source -> src/economics/mission-costs/planner.ts:407 still labels REALIZABLE NPV as demand-adjusted 10yr sell/8% discount while src/economics/npv/index.ts is the implementation. | A |
| D4-F05 | HIGH | LEGACY-QUARANTINE | The NPV elasticity model compares ore kilograms against a refined-commodity annual market, overstating market impact by ~10,000x for M-type | command: rg legacy source -> src/economics/npv/index.ts:5-6 still describes the annual-market elasticity model fed by mission-costs/index.ts. | A |
| D4-F06 | HIGH | LEGACY-QUARANTINE | The 3-stage propellant calculation sizes each stage against dry mass alone, understating launch mass by 167x-3,557x in the exact regime that triggers it | command: rg legacy source -> src/economics/mission-costs/planner.ts remains the staged-propellant path and is excluded from tsconfig. | A |
| D4-F07 | HIGH | LEGACY-QUARANTINE | Two mutually incompatible, unsourced price models in one application, differing by up to 2,672x | command: rg legacy source -> src/economics/pricing/active.ts and src/workers/physics/planner/redirect.ts remain separate price paths. | A |
| D4-F08 | HIGH | LEGACY-QUARANTINE | The same asteroid has two different masses, up to 3.53x apart, depending on which planner runs | command: rg legacy source -> active.ts/scoring.ts and worker planner retain duplicate mass/composition paths. | A |
| D4-F09 | HIGH | LEGACY-QUARANTINE | getAsteroidDV applies the AU/yr-to-km/s factor to velocities expressed in units of circular velocity, understating heliocentric delta-V by 2*pi | command: rg legacy source -> src/economics/pricing/active.ts:202-217 retains getAsteroidDV and :312 labels the method hohmann-visviva. | A |
| D4-F10 | HIGH | LEGACY-QUARANTINE | No economic constant in the repo is sourced; every "Source:" comment cites an index.html line range, and DATA_SOURCES.md documents none of them | command: rg legacy source -> Source: comments cite index.html ranges; DATA_SOURCES.md remains the separate source index. | A |
| A1-F03 | MEDIUM | FIX-CONTROL | 'Kepler residual ≤1.8e-15 rad over 17,280 solves' is contradicted by the committed audit artifact and script (both record 2π) | evidence: audit only (unverified); STATUS.md:287; tools/slice18-research/MATH_LAYER_AUDIT.md:54,70,116; tools/slice18-researc | C |
| A1-F04 | MEDIUM | FIX-CONTROL | Cleanup C17 (hook misses deleted bullets) and C1 (CRLF normalization) are recorded as open but were fixed/done at HEAD | evidence: audit only (unverified); STATUS.md:485 (C17), STATUS.md:469 (C1) | C |
| A1-F05 | MEDIUM | FIX-CONTROL | Slice 19 item 2 already landed (69472a3); item 5's CRLF cause removed by e70c00b; item 1 cites a bundle name that no longer exists | evidence: audit only (unverified); STATUS.md:427-430 (item 2), :452-461 (item 5), :425 (bundle name) | C |
| A1-F06 | MEDIUM | FIX-CONTROL | 'Next Session' repeats items the same file records as done (OQ-17-5/-9/-4, D-07, §8 close, Node unify, branch merge) | evidence: audit only (unverified); STATUS.md:395-398, :402 | C |
| A1-F07 | MEDIUM | FIX-CONTROL | STATUS Identity names a retired macOS path as the canonical repo while the same file says the environment is a Windows laptop | evidence: audit only (unverified); STATUS.md:12 vs :83, :162, :347, :404; HANDOFF.md:4 | C |
| A1-F08 | MEDIUM | FIX-CONTROL | HANDOFF.md (2026-07-10) is still routed to by AGENTS §5 and carries multiple now-false claims with no supersession banner | evidence: audit only (unverified); HANDOFF.md:3-8, :59, :67-71, :85-92; AGENTS.md:198 | C |
| A1-F09 | MEDIUM | FIX-CONTROL | INVARIANTS.md registry line for INV-017..020 does not describe INV-019 | evidence: audit only (unverified); INVARIANTS.md:187 vs src/v2/SLICE_11_FOUNDING.md:33-37 | C |
| A2-F01 | MEDIUM | FIX-CONTROL | INVARIANTS.md index misdescribes INV-019 as 'no partial renders' | evidence: audit only (unverified); INVARIANTS.md:187 | C |
| A2-F02 | MEDIUM | DOC-ANNOTATE | INV-015 text still says the solver is PyKEP compiled to WebAssembly; no amendment despite its own requirement | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:51 | — |
| A2-F03 | MEDIUM | FIX-EVIDENCE | Committed evidence pins a fixture sha256/byte count that no checkout of the repo reproduces (measured on a CRLF working copy) | evidence: audit only (unverified); tools/slice12-research/data/earth-vz-span-max.json:9-10 (and src/v2/SLICE_12_FOUNDING.md:1 | D |
| A2-F05 | MEDIUM | RULING | Invariant docs describe runtime enforcement paths the code does not implement (interpolation error, INV-001/003 enforcers) | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/core/invariants/INV-008.md:46 (also INV-009.md:52, INV-010.md:55, INV-011.md:71); s | C |
| A2-F09 | MEDIUM | FIX-CONTROL | INVARIANTS section 4 says DLA is 'not yet in production' and no DEC is locked | evidence: audit only (unverified); INVARIANTS.md:134-137 | C |
| A3-F01 | MEDIUM | FIX-CONTROL | "Hook-enforced" rules are not enforced in any fresh clone: hooks are committed non-executable and nothing installs them | evidence: audit only (unverified); AGENTS.md:98-102 (also STATUS.md:29, STATUS.md:507) | C |
| A3-F02 | MEDIUM | FIX-CONTROL | STATUS.md Git State / Push state / Deploy boundary are 17 commits and three docs rebuilds stale, unannotated | evidence: audit only (unverified); STATUS.md:22-28 (:22, :23, :25, :26, :28) | C |
| A4-F02 | MEDIUM | FIX-CONTROL | The 2026-08-04 sweep report (9 HIGH findings, R-01..R-17) does not exist in the repository | evidence: audit only (unverified); STATUS.md:406 (also cited at SLICE_17_FOUNDING.md:420-423) | C |
| A4-F04 | MEDIUM | FIX-CONTROL | Cleanup C17 describes an additive-only hook bug that was fixed at f7b19e7, and instructs agents to work around it | evidence: audit only (unverified); STATUS.md:485 | C |
| A4-F07 | MEDIUM | FIX-CONTROL | Cleanup C12 was ruled WONTFIX on 2026-08-02 and is still carried as an open queue item | evidence: audit only (unverified); STATUS.md:480 | C |
| A4-F09 | MEDIUM | FIX-EVIDENCE | The GM_SUN constant is attributed to DE430 in five tracked places; 1.32712440018e20 is the DE405/IAU-1976 value, and the repo contradicts itself | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:47 (also tools/slice18-research/audit-3-results | D |
| A4-F13 | MEDIUM | FIX-CONTROL | The Slice 19 carried-forward list and the deploy boundary describe a build that HEAD replaced | evidence: audit only (unverified); STATUS.md:427-430 (item 2), STATUS.md:425 (item 1's shipping proof), STATUS.md:28 (deploy | C |
| A4-F14 | MEDIUM | FIX-EVIDENCE | REPO_AUDIT_2026-07-31.md is a committed, actively-cited audit whose executive summary is refuted at HEAD and which carries no supersession banner | evidence: audit only (unverified); tools/audit/REPO_AUDIT_2026-07-31.md:10, :13, :549-553 | D |
| A4-F15 | MEDIUM | FIX-CONTROL | STATUS routes the next session to a queue that declares itself superseded, which forwards to a queue that is itself stale | evidence: audit only (unverified); STATUS.md:399 -> tools/slice16-harness/CLOSE_REPORT.md:164 -> tools/slice16-harness/ARCHIV | C |
| A4-F18 | MEDIUM | FIX-CONTROL | src/v2/SLICE_V1_STATUS.md describes tracked renderer code and tracked textures as untracked / blocked | evidence: audit only (unverified); src/v2/SLICE_V1_STATUS.md:13-14, :22-25, :27 | C |
| A5-F02 | MEDIUM | DOC-ANNOTATE | Three further stale statements in the same DEVLOG Moon block (worker vs main thread, period value/label, nodal precession) | evidence: audit only (unverified); DEVLOG.md:55-56,60,64 | — |
| A5-F04 | MEDIUM | DOC-ANNOTATE | REFACTOR_MAP calls six stages "complete" while their rows are unfinished, and Stage 9's output is unreferenced dead code excluded from typecheck | evidence: audit only (unverified); REFACTOR_MAP.md:22,54,74,88,109,129 (headings) vs :52,61,83,84,85,97,100,123,134 (pending | — |
| A5-F05 | MEDIUM | DOC-ANNOTATE | gooding.ts contains the Bate-Mueller-White solver, and its REFACTOR_MAP source range is wrong and self-overlapping | evidence: audit only (unverified); REFACTOR_MAP.md:35 (also DEVLOG.md:122-123) | — |
| A5-F07 | MEDIUM | DOC-ANNOTATE | NOTICE gives a non-existent distribution path for the Horizons ephemeris fixture | evidence: audit only (unverified); NOTICE:41 | — |
| A5-F13 | MEDIUM | DOC-ANNOTATE | The Slice 21 QOL backlog still lists as open four Tier-1 items and three nits that shipped in Slice 17 | evidence: audit only (unverified); strategy/SLICE21_QOL_BACKLOG_TRIAGED.md:42-48,52-64,98-109 and strategy/RESEARCH_LEDGER_20 | — |
| B1-F02 | MEDIUM | FIX-EVIDENCE | Product-facing provenance mis-describes the 3.60e-12 multi-rev figure as 'magnitudes of C3 and excess velocity ... magnitudes only, not the vector directions'; it is a per-componen | evidence: audit only (unverified); src/v2/data/validation-provenance.json rows[lambert-multirev-magnitude] (measures/solverCo | D |
| B2-F02 | MEDIUM | FIX-EVIDENCE | DLA_RESEARCH_SUMMARY.md §3/§4 still instruct the rejected obliquity rotation and the inverted dogleg test, unannotated | evidence: audit only (unverified); tools/slice12-research/DLA_RESEARCH_SUMMARY.md:39-45 and :54 (errata exist only at :12 and | D |
| B2-F03 | MEDIUM | RULING | INV-008..011 and invariants README claim runtime enforcement inside core/interpolators and core/propagators that the code does not perform | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/core/invariants/INV-008.md:46; INV-009.md:52; INV-010.md:55; INV-011.md:71; src/v2/ | C |
| B2-F05 | MEDIUM | FIX-EVIDENCE | Committed audit artefacts contradict the Kepler-residual claim (2π in JSON vs 1.8e-15 in prose) | evidence: audit only (unverified); tools/slice18-research/audit-1-results.json:52; tools/slice18-research/audit-1-core.mjs:12 | D |
| B3-F02 | MEDIUM | FIX-USER | main.ts's "measured recon" justification for the FK3 showcase names a cell that is not the displayed grid's minimum and reports the wrong feasibility verdict | evidence: audit only (unverified); src/v2/app/porkchop/main.ts:65-68 | B |
| B3-F03 | MEDIUM | FIX-USER | segment-windows.ts still carries its UNAUDITED quarantine header and the claim that only tests import it, seven weeks after G-A2 closed and after a shipped route began importing it | evidence: audit only (unverified); src/v2/porkchop/segment-windows.ts:1-7 | B |
| B3-F04 | MEDIUM | DOC-ANNOTATE | SLICE_11_FOUNDING states twice that the porkchop needs Earth samples to ~2045; the pipeline never samples Earth after departure and the shipped 2026-2040 fixture is sufficient | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md:161 and :168 | — |
| B3-F05 | MEDIUM | ALREADY-FIXED | The delta-V stack panel always charges a sample-return departure burn, including in the default one-way mode; at the default body's displayed minimum cell the headline Total delta- | SHA fbe8e89; command: node --test tests/v2-porkchop-honesty.test.mjs -> pass 1, fail 0; current delta-v source is mode-aware. | — |
| B3-F06 | MEDIUM | FIX-USER | INV-016c's model assumptions (impulsive, patched-conic, no gravity assists, no SEP) are disclosed nowhere on the porkchop route; INVARIANTS.md's index line restates the invariant f | evidence: audit only (unverified); INVARIANTS.md:184 vs src/v2/SLICE_11_FOUNDING.md:28 and :63; implementation at src/v2/app/ | B |
| B3-F07 | MEDIUM | FIX-USER | The 6th parameter of the production Lambert entry point is named `lw` (long way) but is consumed as `prograde` | evidence: audit only (unverified); src/v2/core/lambert/lambert-multi-rev.ts:282 and :291 (mirrored in the LambertSolver type | B |
| B3-F10 | MEDIUM | FIX-USER | assertFiniteNumber in the catalog ingestion accepts null (and '', false, []) as 0; the shipped catalog's one null element is silently ingested as mean anomaly 0 | evidence: audit only (unverified); src/v2/boundary/slice9-nea-catalog.ts:166-171, consumed at :402 | B |
| B3-F17 | MEDIUM | FIX-CONTROL | INVARIANTS.md's porkchop units line is wrong about the worker's internal units and contradicts the code block three lines above it | evidence: audit only (unverified); INVARIANTS.md:34 (inside the "Lambert convention (AMD-7)" block) | C |
| B4-F01 | MEDIUM | DOC-ANNOTATE | "The M=0-only view reproduces cached minC3 within 7.631e-11" was measured on the cache's grid, not the view's; real divergence reaches ~1.8 km^2/s^2 | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md:488 | — |
| B4-F02 | MEDIUM | FIX-USER | Shipped porkchop page claims "Grid spans 2026-2040 departures" but the grid ends 2040-01-01; 8.11% of the catalog's cached best windows fall outside it | evidence: audit only (unverified); src/v2/app/porkchop/main.ts:637 (and src/v2/SLICE_11_FOUNDING.md:88) | B |
| B4-F03 | MEDIUM | RULING | OQ-4 states a delta-V stack formula (2 x sqrt(C3)) that contradicts DEC-7 and the shipped code (2 x vInfArr); the two differ by 12.8 km/s on Apophis's best cell | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_11_FOUNDING.md:63 vs :113-118 and src/v2/porkchop/delta-v.ts:26-42 | C |
| B4-F04 | MEDIUM | FIX-EVIDENCE | Slice 10 Section 7 lists Phase C.2/C.3/C.4 as PENDING two lines above Phase D/E recording them verified and deployed; the audit's own F9 "Phase C status text drift - Refreshed" was | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:455,475-477 vs :479-487,490-496; audit record :424 | D |
| B4-F05 | MEDIUM | DOC-ANNOTATE | Slice 10's close note claims "All eight measurement OQs are closed (OQ-1 through OQ-8)"; OQ-1 is open, OQ-6 does not exist in the slice, and two of the rest are not measurements | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:500 (vs :165-171 and :453) | — |
| B4-F06 | MEDIUM | DOC-ANNOTATE | DEC-6's locked evidence ("dv=6 km/s ⇒ C3≈25, benchmark-compatible with NHATS's accessible-target population") is contradicted by the repo's own NHATS cache and was never amended af | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:137 | — |
| B4-F07 | MEDIUM | DOC-ANNOTATE | DEC-4's performance arithmetic understates the screening solve count by ~180x and quotes a WASM per-solve time for a path that was never built | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:123 | — |
| B4-F08 | MEDIUM | DOC-ANNOTATE | AMD-7 records the wrong units for the worker's solver zone and contradicts AMD-1 | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md:257 vs :200 | — |
| B4-F09 | MEDIUM | DOC-ANNOTATE | SLICE_11 Section 8 still reports the overlay's fixed M:1 divergence as OPEN; the overlay now passes M:0 with the DEC-5 contour toggle | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md:492 | — |
| B4-F10 | MEDIUM | FIX-EVIDENCE | The live Slice 10 fixture spec, NOTICE and research README all point the long-span Horizons fixture at a path that no longer exists | evidence: audit only (unverified); src/v2/boundary/slice10-fixture-spec.md:9 (also src/v2/SLICE_10_FOUNDING.md:347, NOTICE:41 | D |
| B4-F11 | MEDIUM | DOC-ANNOTATE | DEC-11C-5's span requirement ("Earth samples must extend to ~2045") is wrong, and the fixture adopted to satisfy it stops at 2040-12-31 | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md:161 and :168 (amendment) | — |
| B5-F01 | MEDIUM | FIX-EVIDENCE | DLA research summary still instructs the obliquity rotation DEC-12-2 forbids, with no erratum | evidence: audit only (unverified); tools/slice12-research/DLA_RESEARCH_SUMMARY.md:39-48 (also :69, :75) | D |
| B5-F02 | MEDIUM | FIX-EVIDENCE | The inverted feasibility inequality survives uncorrected in §4 of the DLA research summary (fourth resurrection) | evidence: audit only (unverified); tools/slice12-research/DLA_RESEARCH_SUMMARY.md:54 (and :30-32) | D |
| B5-F03 | MEDIUM | FIX-EVIDENCE | measure-earth-vz.mjs compares m/s against km/s, so the committed per-year table is each year's last sample, not its maximum | evidence: audit only (unverified); tools/slice12-research/measure-earth-vz.mjs:130 (artifact: tools/slice12-research/data/ear | D |
| B5-F04 | MEDIUM | DOC-ANNOTATE | SLICE_13_FOUNDING records the New Glenn C3=5 anchor as landed and 'Parked: nothing'; it was reverted and is parked as Cleanup C8 | evidence: audit only (unverified); src/v2/SLICE_13_FOUNDING.md:100 | — |
| B5-F06 | MEDIUM | FIX-USER | The shipped '~1 m/s-per-degree (JPL DESCANSO Vol. 12 evidence)' figure is not in the committed evidence, which forbids that lift | evidence: audit only (unverified); src/v2/app/porkchop/main.ts:879 (user-facing); also INVARIANTS.md:120 and src/v2/SLICE_13_ | B |
| B5-F07 | MEDIUM | RULING | DEC-12-4 locks the DLA toggle default OFF; production ships it ON with no §5a amendment | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_12_FOUNDING.md:91 vs src/v2/app/porkchop/main.ts:313 | B |
| B5-F08 | MEDIUM | FIX-EVIDENCE | The M=1 artifact claims the dead branch counter was removed in schemaVersion 2; the committed file is still schemaVersion 1 with the counter present | evidence: audit only (unverified); tools/slice12-research/data/dla-oracle-m1-vectors.json:99 (deadCounterNote); target tools/ | D |
| B5-F09 | MEDIUM | FIX-EVIDENCE | The 3d verification record dates the elvperf page '10 Feb 2026'; every committed screenshot says 29 February 2024 | evidence: audit only (unverified); tools/slice13-research/literature/3d-verification-record.md:9 | D |
| B5-F10 | MEDIUM | DOC-ANNOTATE | Decision-closing audit reports cited by both founding docs are untracked and never existed on any ref (INV-034) | evidence: audit only (unverified); src/v2/SLICE_13_FOUNDING.md:84 and :98; src/v2/SLICE_12_FOUNDING.md:110 and :168 | — |
| B5-F11 | MEDIUM | RULING | The INV-016d disclosure, site picker and band legend are hidden behind the DLA toggle while the feasibility verdict is not | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/app/porkchop/main.ts:669-703 vs src/v2/porkchop/porkchop-view.ts:1319, :1418-1431, | B |
| B5-F12 | MEDIUM | FIX-EVIDENCE | The fixture sha256 cited by the 2026-09-22 vZ correction cannot be reproduced from the repository | evidence: audit only (unverified); src/v2/SLICE_12_FOUNDING.md:172; tools/slice12-research/data/earth-vz-span-max.json (fixtu | D |
| C1-F06 | MEDIUM | FIX-USER | Slice 8 fixture spec describes field names and an example record that do not match the fixture and would fail ingestion | evidence: audit only (unverified); src/v2/boundary/slice8-fixture-spec.md:253-277,296-298,359-365 | B |
| C1-F07 | MEDIUM | FIX-USER | Slice 7 fixture spec requires conditionCode/dataArcDays (absent from the fixture), omits fields ingestion requires, and names loader.ts as the consumer (no longer true) | evidence: audit only (unverified); src/v2/boundary/slice7-fixture-spec.md:14,74-99,112-124 | B |
| C2-F06 | MEDIUM | FIX-CONTROL | STATUS's Slice 18 row and git-state table still describe the close-out branch as unmerged and list bundle names no longer in docs/ | evidence: audit only (unverified); STATUS.md:45 (Slice 18 row), :26, :28 | C |
| C2-F07 | MEDIUM | FIX-USER | Catalog list renders 'No bodies match the current filters.' when the tier artifact fails to load or arrives after the screen cache | evidence: audit only (unverified); src/v2/app/catalog-list/panel.ts:79-81, :86-100, :539-548 | B |
| C3-F01 | MEDIUM | DOC-ANNOTATE | The §1 thesis sentence misstates the measured sample: 163693 has the WORST minimum C3 of the five, not the second-best | evidence: audit only (unverified); SLICE_17_FOUNDING.md:48-51 | — |
| C3-F04 | MEDIUM | RULING | The founding doc's §9 binding "DEC-17-4's quality copy may not ship without [the MPC spot check]" was violated by the A4c ship, and no §8 entry records a waiver | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; SLICE_17_FOUNDING.md:673-677 (also :668 and §8:417-418) | B |
| C3-F05 | MEDIUM | RULING | DEC-17-5 (LOCKED) clauses are not implemented on /v2/compare/ and were not recorded as residuals when Front A was declared CLOSED | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; SLICE_17_FOUNDING.md:197-209 (DEC-17-5), §4:305-310; STATUS.md:44 | B |
| C4-F02 | MEDIUM | FIX-USER | 25.19 deg and 26.7 deg are obliquities to the orbital plane, used as angles from the ICRF Z axis; the repo's own kernel pole data is never read | evidence: audit only (unverified); src/v2/render/saturn-rings.md:24; src/v2/render/mars-oblate.md:9; src/v2/app/solar-system/ | G |
| C4-F04 | MEDIUM | FIX-TEST | The 'explicit renderOrder=0 breaks transparent rendering' mechanism is impossible in three.js, and two tests enforce a source ban derived from it | evidence: audit only (unverified); V2_FOUNDING_DOCUMENT.md:1422; enforced at tests/v2-slice5-cutover.test.mjs:119-126 and tes | E |
| C4-F05 | MEDIUM | FIX-USER | SLICE_V1_STATUS.md is false in every load-bearing line and nothing marks it superseded | evidence: audit only (unverified); src/v2/SLICE_V1_STATUS.md:3,13,14,22-25,27,34,57 | G |
| C4-F06 | MEDIUM | FIX-USER | The 'locked from mission constants' oblate Y-scales match neither BODY_CONSTANTS nor the mesh factories, and the atmosphere shells use the wrong copies | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:261-269; src/v2/render/atmosphere.ts:26-28; src/v2/render/satu | G |
| C4-F07 | MEDIUM | FIX-USER | OQ-V1-1's rationale asserts a blending mode the production rings do not use | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:121-122 | G |
| C4-F08 | MEDIUM | FIX-USER | The prototype's Saturn ring '26.7 deg tilt' applies exactly zero tilt, and its RingGeometry UV claim is wrong | evidence: audit only (unverified); src/v2/prototypes/renderer-test/rings.ts:66-69,47 | G |
| C4-F09 | MEDIUM | FIX-TEST | The A-ring outer radius is asserted as 'the exact PDS value' but is 5 km off, and three other radii claimed as exact PDS are 25-170 km off | evidence: audit only (unverified); tests/v2-slice5-cutover.test.mjs:133,139; src/v2/render/saturn-rings.md:14,18-22,33,36-38, | E |
| C4-F10 | MEDIUM | FIX-USER | saturn-rings.md gives the B/Cassini boundary two different radii, and the constant for one of them is dead code | evidence: audit only (unverified); src/v2/render/saturn-rings.md:37 vs :40; src/v2/render/saturn-rings.ts:65,210-227 | G |
| C4-F11 | MEDIUM | FIX-USER | The Cassini-division 'gap' meshes are more opaque than the band they are specified to be lower-alpha than, and normal blending cannot punch holes | evidence: audit only (unverified); src/v2/render/saturn-ring-substructure.md:53-54,63,67 vs src/v2/render/saturn-rings.ts:81- | G |
| C4-F12 | MEDIUM | FIX-USER | Three shipped scenes have three different lighting balances; the inner-solar-system route still has the exact pre-Phase-B values | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:27-28,398-402 vs src/v2/app/solar-system/runtime.ts:1290-1291, | G |
| C4-F13 | MEDIUM | FIX-USER | On first paint the whole scene is lit from a fabricated direction, disclosed nowhere | evidence: audit only (unverified); src/v2/app/solar-system/runtime.ts resolveSunLightPosition (returns {sunRadiusM, sunRadius | G |
| C4-F14 | MEDIUM | FIX-USER | DEC-V1-3 / Phase A never shipped: 10 of 15 textures are deployed but never fetched, and NOTICE says they are loaded | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:271-273,385-395; NOTICE:55-59; src/v2/app/solar-system/runtime | G |
| C4-F15 | MEDIUM | FIX-USER | The Earth cloud texture is downloaded on every page load and never rendered; the documented cloud shell does not exist | evidence: audit only (unverified); src/v2/app/solar-system/runtime.ts:582-588,574; docs at src/v2/SLICE_V1_FOUNDING.md:30,252 | G |
| C4-F16 | MEDIUM | FIX-USER | 8.5 MB of staging assets ship to the live site, including two TIFFs the founding doc itself says browsers cannot decode | evidence: audit only (unverified); docs/_staging_v1/ (4 files); textures/_staging_v1/; vite.config.ts:8; src/v2/SLICE_V1_FOUN | G |
| C4-F17 | MEDIUM | FIX-USER | The documented 'belt-band' orbit-line architecture produces 2 orbit lines in the shipped scene, over a catalog with no main belt | evidence: audit only (unverified); src/v2/render/asteroid-instancing.md:115-123; V2_FOUNDING_DOCUMENT.md:1458,1469; src/v2/re | G |
| C4-F18 | MEDIUM | FIX-USER | halos.md documents the wrong halo interface - the exact interface whose misuse caused the halo frame bug - and contradicts itself on the core dependency | evidence: audit only (unverified); src/v2/render/halos.md:23,25 vs src/v2/render/halos.ts:2-3,14,43,56,74-83,102-116 | G |
| C4-F22 | MEDIUM | RULING | INVARIANTS says the atmosphere must be spherical while the locked DEC and the code make three shells oblate - and none of the three is tilted with its body | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; INVARIANTS.md:87-88 vs src/v2/SLICE_V1_FOUNDING.md:267-268 and src/v2/render/atmosphere.ts | G |
| C4-F23 | MEDIUM | FIX-USER | The renderOrder ladder's stated failure mode cannot occur for the additive shells it governs | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:361-365 (DEC-V1-4c); mirrored at INVARIANTS.md:91; src/v2/rese | G |
| C4-F24 | MEDIUM | FIX-USER | The anti-edge-on comments and the Slice 5 cutover both describe a default camera orbit the runtime no longer has | evidence: audit only (unverified); src/v2/app/solar-system/runtime.ts:1673-1674,1679-1680; V2_FOUNDING_DOCUMENT.md:1419; test | G |
| C4-F25 | MEDIUM | FIX-USER | Four shipped textures are listed as missing, and the Earth normal + specular maps are listed as out of scope while the shipped shader samples both | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:132,180,215-218,456-459 vs src/v2/app/solar-system/runtime.ts: | G |
| C4-F26 | MEDIUM | FIX-USER | Both asteroid spatial docs present the Slice 8 uniform grid as the production partition; production runs the Slice 9 hybrid on four times the bodies | evidence: audit only (unverified); src/v2/render/spatial-index.md:32,51,107-111,155-158; src/v2/render/asteroid-instancing.md | G |
| C4-F33 | MEDIUM | RULING | earth-moon gives scene children camera-relative coordinates, which INVARIANTS forbids absolutely | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; INVARIANTS.md:95-102 vs src/v2/app/earth-moon/runtime.ts:118,205-206 and src/v2/render/cam | G |
| C5-F05 | MEDIUM | FIX-USER | Co-orbital caveat attributes an N-body error bound to a patched-conic-vs-patched-conic disagreement; the "4-year horizon" has no source | evidence: audit only (unverified); src/v2/app/catalog-list/honesty-disclosure.ts:67-70 | B |
| C5-F06 | MEDIUM | FIX-USER | About page restates the false multi-revolution magnitude claim with its "magnitude only" caveat removed | evidence: audit only (unverified); src/v2/app/about/main.ts:268, :277-278; src/v2/data/validation-provenance.json:45-56 | B |
| C5-F07 | MEDIUM | FIX-USER | "within 1.18% ... on the curve segments the tool screens on" is false for the 40→55 anchor segment | evidence: audit only (unverified); src/v2/app/about/main.ts:279-283; evidence at tools/slice13-research/elvperf/oracle/oracle | B |
| C5-F08 | MEDIUM | FIX-USER | "a metallic-bright surface could shrink this ≈2.9×" misapplies a two-sided albedo span as a one-sided shrink factor | evidence: audit only (unverified); src/v2/app/compare/main.ts:240 (constant at :205); source at tools/slice17-research/litera | B |
| C5-F09 | MEDIUM | FIX-USER | The OBSERVED provenance row's scope wording does not match the number it publishes | evidence: audit only (unverified); src/v2/data/validation-provenance.json:13, :86, :90 | B |
| C5-F10 | MEDIUM | FIX-USER | "the effective ceiling is only ~34-39 deg": the lower bound has no source anywhere in the repo | evidence: audit only (unverified); src/v2/app/porkchop/main.ts:700 | B |
| C5-F11 | MEDIUM | FIX-USER | The ΔV stack discloses its three numbers but none of the model assumptions INV-016c requires, and INVARIANTS.md misdescribes the invariant | evidence: audit only (unverified); src/v2/app/porkchop/main.ts:944; INVARIANTS.md:184 vs src/v2/SLICE_11_FOUNDING.md:28,63 | B |
| C5-F12 | MEDIUM | FIX-USER | The Slice 13 audit evidence link's fragment matches no heading, so the jump lands at the top of the file | evidence: audit only (unverified); src/v2/app/about/main.ts:67-72 (anchor at :71), emitted by artifactUrl at :178-181 | B |
| C5-F13 | MEDIUM | FIX-USER | The "index-current" invariants exhibit is pinned to a commit missing 16 invariant IDs | evidence: audit only (unverified); src/v2/app/about/main.ts:443-447 (caption), ARTIFACTS.invariants at :83-87 | B |
| C5-F14 | MEDIUM | FIX-USER | Slice 13's close-out record still claims a reverted launch-vehicle anchor landed, unannotated | evidence: audit only (unverified); src/v2/SLICE_13_FOUNDING.md:100 | B |
| D1-F01 | MEDIUM | FIX-CONTROL | mcp/README.md 'Advertised span vs accepted span' section is self-contradictory after 0052ecb | evidence: audit only (unverified); mcp/README.md:56-79 | C |
| D1-F02 | MEDIUM | DOC-ANNOTATE | Committed eval report's origin commit does not contain the code that produced it (run from an uncommitted worktree) | evidence: audit only (unverified); mcp/eval/slice15-eval-report.json:3-4 (also slice15-eval-summary.md:2-3; cause mcp/eval/ru | — |
| D1-F03 | MEDIUM | DOC-ANNOTATE | SLICE_15 cites INV-022 for the no-extrapolation rule; that is INV-023 | evidence: audit only (unverified); src/v2/SLICE_15_FOUNDING.md:27 (also :143, :191; src/v2/founding-drafts/DRAFT_2026-07-07_R | — |
| D1-F04 | MEDIUM | RULING | AMD A2 (DEC-15-8) applied inconsistently: dla_feasibility turns an unknown-but-well-formed siteId into an MCP error, other tools into a not_found refusal | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_15_FOUNDING.md:197 vs mcp/src/tools/dla-feasibility.ts:29 and mcp/test/comput | C |
| D1-F05 | MEDIUM | RULING | INV-027 violated: adapters re-derive v-infinity/DLA that core already provides and compute a marginDeg quantity that exists nowhere in core | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; mcp/src/tools/compute-shared.ts:270-300 (also explain-cell.ts:133-176, dla-feasibility.ts: | C |
| D2-F02 | MEDIUM | FIX-CONTROL | STATUS conflates the post-data primary set (25) with the executed scenario count (26); 25 does not reproduce 468 runs | evidence: audit only (unverified); STATUS.md:57 | C |
| D2-F04 | MEDIUM | FIX-EVIDENCE | Per-RQ rates and the per-dimension table include S-30 (registered as non-binary) without saying so, and the per-RQ split is an unregistered metric not labelled exploratory | evidence: audit only (unverified); src/v2/SLICE_16_FOUNDING.md:1497 (§30.6), 1458-1465 (§30.2), 1449 (§30.1); tools/slice16-h | D |
| D2-F05 | MEDIUM | RULING | The registered contrast analysis (CI on the difference vs 10 pp, Holm) was never computed; §30.3 substitutes overlapping marginal CIs | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_16_FOUNDING.md:124-128 (DEC-16-8), 1471-1473 (§30.3); tools/slice16-harness/g | C |
| D4-F11 | MEDIUM | LEGACY-QUARANTINE | tests/v2-architecture.test.mjs enforces nothing about the legacy directories; the live @ alias bypasses it entirely | evidence: audit only (unverified); tests/v2-architecture.test.mjs:47-70, decisively :53 | A |
| D4-F12 | MEDIUM | LEGACY-QUARANTINE | The V2 wall list in AGENTS.md section 1 and INVARIANTS.md section 1 omits src/physics, src/data, src/utils, src/styles and src/main.ts | evidence: audit only (unverified); AGENTS.md:38-39; INVARIANTS.md:11-13; vs tsconfig.json:24-35 | A |
| D4-F13 | MEDIUM | LEGACY-QUARANTINE | The shipped mission profile asserts "Izzo 2015 Lambert" unconditionally while the extract path silently falls back to a different solver and discards the flag | evidence: audit only (unverified); src/economics/mission-costs/planner.ts:413 and :425; src/workers/physics/planner/extract.t | A |
| D4-F14 | MEDIUM | LEGACY-QUARANTINE | gooding.ts does not implement Gooding's algorithm; REFACTOR_MAP repeats the wrong name | evidence: audit only (unverified); src/physics/orbital/lambert/gooding.ts:6; REFACTOR_MAP.md:35 | A |
| D4-F15 | MEDIUM | LEGACY-QUARANTINE | Three disagreeing composition tables, two in the same file; the user-facing text differs from the value calculation by up to 50x | evidence: audit only (unverified); src/economics/scoring.ts:3-10 (COMPOSITIONS), :12-19 (FRACTIONS), :56-61 (MAT_COMP, duplic | A |
| D4-F16 | MEDIUM | LEGACY-QUARANTINE | MAT_COMP.M sums to 100.081 weight-percent of bulk mass | evidence: audit only (unverified); src/economics/pricing/active.ts:43; duplicate src/economics/scoring.ts:59 | A |
| D4-F17 | MEDIUM | LEGACY-QUARANTINE | MAT_DIFFICULTY['pgm'] is undefined for every PGM row; the 'platinum' entry is dead | evidence: audit only (unverified); src/economics/scoring.ts:28-33 vs :39-42; consumed at src/economics/pricing/active.ts:265 | A |
| D4-F18 | MEDIUM | LEGACY-QUARANTINE | renderPorkchop is called with one argument where two are required (runtime TypeError), and onBurnResult is called although never defined; both masked by declare stubs | evidence: audit only (unverified); src/economics/mission-costs/planner.ts:275; src/workers/physics/client.ts:34, :42, :243 | A |
| D4-F19 | MEDIUM | LEGACY-QUARANTINE | In the redirect path the water/metal split comes from a UI slider, not composition, letting an M-type report 50x its whole-body water inventory | evidence: audit only (unverified); src/workers/physics/planner/redirect.ts:111-113; slider read at src/economics/mission-cost | A |
| D4-F20 | MEDIUM | LEGACY-QUARANTINE | Two different Tsiolkovsky implementations in one module diverge above ~9.4 km/s and both feed the same render | evidence: audit only (unverified); src/economics/mission-costs/index.ts:36-40 vs :72-74; both consumed in src/economics/missi | A |
| D4-F21 | MEDIUM | LEGACY-QUARANTINE | The "COSTS (+/-15%)" section header does not match the band actually displayed, which ranges +/-10% to +/-35% | evidence: audit only (unverified); src/economics/mission-costs/planner.ts:390 and :322-323; src/economics/mission-costs/index | A |
| D4-F22 | MEDIUM | LEGACY-QUARANTINE | STATUS.md still presents the "~10.6 MB no page fetches" Slice 19 item as open, although HEAD itself is the commit that fixed it | evidence: audit only (unverified); STATUS.md:427-430 | A |
| D4-F23 | MEDIUM | LEGACY-QUARANTINE | 8,905,716 bytes of docs/_staging_v1/ are deployed, referenced by nothing, uncounted by the payload analysis, and would be destroyed by the next build | evidence: audit only (unverified); docs/_staging_v1/ (4 tracked files); vite.config.ts:10-11; STATUS.md:433-436 | A |
| D4-F24 | MEDIUM | LEGACY-QUARANTINE | Spectral-type mapping assigns E-type asteroids an 88%-iron composition and V-type asteroids 5% water | evidence: audit only (unverified); src/economics/pricing/active.ts:114-117 | A |
| D4-F25 | MEDIUM | LEGACY-QUARANTINE | The "Light Prospector" is given Isp 3000 s while the model is documented as impulsive, single-stage chemical | evidence: audit only (unverified); src/economics/mission-costs/defaults.ts:10; assumptions panel at src/economics/mission-cos | A |
| D4-F26 | MEDIUM | LEGACY-QUARANTINE | Legacy and V2 physical constants disagree, most materially an 11% mass/value difference from a different default albedo | evidence: audit only (unverified); src/physics/constants/index.ts:4-16 and src/economics/pricing/active.ts:233 vs src/v2/core | A |
| A1-F10 | LOW | FIX-CONTROL | AGENTS §1 repo map: `_rescued-agent-defs/` labelled 'local-only, untracked' (it is tracked) and the founding-doc list omits eight tracked founding docs | evidence: audit only (unverified); AGENTS.md:34, :40-47 | C |
| A1-F11 | LOW | FIX-CONTROL | AGENTS §8 cites prior-art files that do not exist ('mining-economics', 'orchestrator.md' dispatch rounds) | evidence: audit only (unverified); AGENTS.md:281-290 | C |
| A1-F12 | LOW | FIX-CONTROL | AGENTS §2.1 rule 3 and §4 under-describe the current hook guard set and the test runner | evidence: audit only (unverified); AGENTS.md:111-114, :177, :32 | C |
| A1-F13 | LOW | FIX-CONTROL | STATUS carries two different structurally-blind/L2 counts without annotating the earlier one | evidence: audit only (unverified); STATUS.md:129 vs :154/:316 | C |
| A1-F14 | LOW | FIX-CONTROL | STATUS says the Slice 18 measurement/audit artifacts are 'NOT in version control' in five places never annotated after they were landed | evidence: audit only (unverified); STATUS.md:162, :191, :201, :230, :287 | C |
| A1-F15 | LOW | FIX-CONTROL | STATUS 'Open, carried forward from Front A' still says the overlay passes a fixed M: 1 and is 'still OPEN' | evidence: audit only (unverified); STATUS.md:256 (also :239) | C |
| A1-F16 | LOW | FIX-CONTROL | boundary/README.md Source Map names conversion files that do not exist (boundary/asterank.ts, boundary/nhats.ts) | evidence: audit only (unverified); src/v2/boundary/README.md:31-32 | C |
| A1-F17 | LOW | FIX-CONTROL | mission/README.md and AGENTS §1 describe `mission/` as the planning-math home; the directory holds only the README | evidence: audit only (unverified); src/v2/mission/README.md:3-11; AGENTS.md:26 | C |
| A1-F18 | LOW | FIX-CONTROL | src/v2/research/README.md status (2026-05-22) contradicts the repo: founding docs exist; 12 folders not 5 | evidence: audit only (unverified); src/v2/research/README.md:7-19 | C |
| A1-F19 | LOW | DOC-ANNOTATE | QA.md is an unlabeled V1 'Phase 5' report at the repo root | evidence: audit only (unverified); QA.md:1, :28-153 | — |
| A1-F20 | LOW | FIX-CONTROL | slice-discipline skill mandates src/v2/SLICE_N_FOUNDING.md; Slice 17's founding doc lives at the repo root | evidence: audit only (unverified); .claude/skills/slice-discipline/SKILL.md:38; SLICE_17_FOUNDING.md (root); STATUS.md:44 | C |
| A2-F04 | LOW | FIX-EVIDENCE | measure-earth-vz.mjs per-year maximum compares m/s against km/s; committed per-year table is wrong and self-contradictory | evidence: audit only (unverified); tools/slice12-research/measure-earth-vz.mjs:129-131; tools/slice12-research/data/earth-vz- | D |
| A2-F06 | LOW | FIX-CONTROL | INV-005 cites a non-existent assertPropagationDrift and stayed 'deferred' after the Slice 7 propagator landed | evidence: audit only (unverified); src/v2/core/invariants/README.md:44; V2_FOUNDING_DOCUMENT.md:80 | C |
| A2-F07 | LOW | RULING | INV-014 is defined twice with different meanings and both are cited by live tests | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_8_5_FOUNDING.md:56 vs src/v2/SLICE_9_FOUNDING.md:264-276; INVARIANTS.md:181 | C |
| A2-F08 | LOW | DOC-ANNOTATE | INV-007 is referenced and typed but never defined | evidence: audit only (unverified); V2_FOUNDING_DOCUMENT.md:198,212; src/v2/core/invariants/INV-008.md:51; src/v2/core/types.t | — |
| A2-F10 | LOW | FIX-CONTROL | r128 API table gives a false reason for avoiding OrbitControls ('Not in r128 bundle') | evidence: audit only (unverified); INVARIANTS.md:113 | C |
| A2-F11 | LOW | FIX-CONTROL | Atmosphere-shell rule cites a non-existent founding-doc section 'V1-C1' | evidence: audit only (unverified); INVARIANTS.md:85 | C |
| A2-F12 | LOW | FIX-CONTROL | Stale line reference for the per-frame atmosphere position copy | evidence: audit only (unverified); INVARIANTS.md:89-90 | C |
| A2-F13 | LOW | FIX-CONTROL | INV-034 text cites '.gitignore:17' as the excluding glob; at HEAD that line is a comment | evidence: audit only (unverified); INVARIANTS.md:171-172; src/v2/SLICE_9_FOUNDING.md:427 | C |
| A2-F14 | LOW | FIX-EVIDENCE | multi-agent-audit skill attributes to INV-019 a general 'must not touch audited prior code' rule it does not state | evidence: audit only (unverified); .claude/skills/multi-agent-audit/SKILL.md:54-55 | D |
| A2-F15 | LOW | FIX-CONTROL | ci.yml header says two gates and 'never builds docs/' but a build job runs npm run build | evidence: audit only (unverified); .github/workflows/ci.yml:4-8 | C |
| A2-F16 | LOW | FIX-USER | colormap propagates a NaN C3 to a silent black heatmap pixel | evidence: audit only (unverified); src/v2/porkchop/colormap.ts:36-58; src/v2/porkchop/porkchop-view.ts:802-807 | B |
| A2-F17 | LOW | DOC-ANNOTATE | V2 founding doc still states the 3-pixel halo threshold replaced after Slice 6 | evidence: audit only (unverified); V2_FOUNDING_DOCUMENT.md:189 (also 390, 429, 471) | — |
| A2-F18 | LOW | FIX-CONTROL | Eccentricity-band populations in constants/README differ from the shipped Slice 8 fixture | evidence: audit only (unverified); src/v2/core/constants/README.md:313-318 | C |
| A2-F19 | LOW | RULING | SLICE_17 reserves bare INV-035/036 for new global proposals after INVARIANTS.md declared those numbers skipped as ambiguous | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; SLICE_17_FOUNDING.md:697,703 vs INVARIANTS.md:233 | C |
| A3-F03 | LOW | FIX-CONTROL | Slice 19 item 5: the "CRLF hashing basis" blocker for OQ-17-7 no longer exists (S19-D04 made the checkout LF); the real remaining provenance gap (script hash) is not mentioned | evidence: audit only (unverified); STATUS.md:454-462 | C |
| A3-F04 | LOW | FIX-CONTROL | Cleanup C17 is recorded as open and pins `.githooks/pre-commit:53`, but f7b19e7 fixed it 20 minutes after it was recorded | evidence: audit only (unverified); STATUS.md:485 | C |
| A3-F05 | LOW | FIX-CONTROL | C15's recommended fix ("anchor the regex to the `ℹ pass` summary line") would zero the headline on this runner, whose children emit TAP (`# pass N`); the first-match bug itself is | evidence: audit only (unverified); tools/run-tests.mjs:170-171 (also :168 and STATUS.md:483) | C |
| A3-F06 | LOW | FIX-CONTROL | ci.yml header describes two gates and "never builds docs/"; the workflow has four jobs including `npm run build` | evidence: audit only (unverified); .github/workflows/ci.yml:3-8 | C |
| A3-F07 | LOW | FIX-CONTROL | The committed `.dispatch-scope` is described as "never staged", names a deleted file, and matches none of HEAD's 21 changed paths | evidence: audit only (unverified); STATUS.md:507 (also .dispatch-scope:4 and AGENTS.md:106-109 rule 2) | C |
| A3-F08 | LOW | FIX-USER | HEAD mixes a src/v2 source change with the docs/ rebuild in one commit, against §9's artifacts-only rule | evidence: audit only (unverified); commit 69472a3 (src/v2/app/solar-system/loader.ts + 20 docs/ paths) vs AGENTS.md:303-305, | B |
| A3-F09 | LOW | FIX-CONTROL | Slice 19 item 1 quotes the porkchop literal with ASCII hyphens and names a bundle that no longer exists; the literal itself still ships | evidence: audit only (unverified); STATUS.md:418-419 and :425 | C |
| A3-F10 | LOW | FIX-CONTROL | "Eager first-paint set 110,906,873 B" is the sum of six data payloads only; it omits the page's JS, HTML and the five Earth textures (≈3.8 MB) that load at scene construction | evidence: audit only (unverified); STATUS.md:434-439 (item 3) | C |
| A3-F11 | LOW | FIX-CONTROL | `publicDir: 'textures'` ships 8.9 MB of `_staging_v1` source masters that no page references; the V1 status table still calls the derived JPGs blocked | evidence: audit only (unverified); vite.config.ts:8; src/v2/SLICE_V1_STATUS.md:23-25 and :28 | C |
| A3-F12 | LOW | FIX-EVIDENCE | run-tests.mjs rationale cites "209 files" / "208 of 209 discovered files", a count that matches nothing in this repository | evidence: audit only (unverified); tools/run-tests.mjs:3-6 | D |
| A3-F13 | LOW | FIX-CONTROL | Slice 19 preamble misattributes the on-disk/served size gap to `.gitattributes:9 … eol=lf` | evidence: audit only (unverified); STATUS.md:412-414 | C |
| A4-F03 | LOW | FIX-CONTROL | 'R-01'..'R-17' names two disjoint finding sets; Cleanup C16 records only the 'F2' collision | evidence: audit only (unverified); STATUS.md:406 and SLICE_17_FOUNDING.md:422-423 vs tools/s17-ga12-audit-2026-08-07/RECONCIL | C |
| A4-F05 | LOW | FIX-CONTROL | Cleanup C1 (CRLF / .gitattributes normalization) is complete but still listed open | evidence: audit only (unverified); STATUS.md:469 | C |
| A4-F06 | LOW | FIX-CONTROL | OQ-17-7's restated blocker is false at HEAD: the fixture reproduces its provenance hash; the real mismatch is the generator script's own sha256 | evidence: audit only (unverified); STATUS.md:457-461 | C |
| A4-F08 | LOW | FIX-CONTROL | Cleanup C11 is resolved, and its pointer into the remediation report is dangling | evidence: audit only (unverified); STATUS.md:479 | C |
| A4-F10 | LOW | FIX-EVIDENCE | The math-layer audit's headline Kepler residual is contradicted by the committed artifact and script it names as its reproduction path | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:70 (reproduction path declared at :5); repeated | D |
| A4-F11 | LOW | FIX-CONTROL | 'M=0 max rel err 3.35e-14 over 2,500 cells' quotes one body's row as the M=0 maximum | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:72; STATUS.md:291 | C |
| A4-F12 | LOW | FIX-TEST | tools/overnight-2026-08-05/ is cited as evidence by production source and a test's provenance header, and does not exist in the repo | evidence: audit only (unverified); src/v2/app/catalog-list/panel.ts:327; tests/v2-segment-windows.test.mjs:5-6 (raised as R-1 | E |
| A4-F16 | LOW | FIX-CONTROL | HANDOFF.md still asserts, with no superseded banner, that artifacts the repo tracks are missing | evidence: audit only (unverified); HANDOFF.md:1-8, :70, :85-92 | C |
| A4-F17 | LOW | FIX-EVIDENCE | Two of the three absent aster-audit-reports citations in SLICE_13_FOUNDING remain unannotated, including the one that closes a pre-deploy audit gate | evidence: audit only (unverified); src/v2/SLICE_13_FOUNDING.md:84 and :98 (the L3-6 annotation at :110-112 covers only :39) | D |
| A4-F19 | LOW | FIX-EVIDENCE | Eight of the seventeen 2026-08-07 recorded contradictions are still live at HEAD with neither side marked | evidence: audit only (unverified); tools/context-audit-2026-08-07/CONTRADICTIONS.md (C-01, C-06, C-07, C-08, C-09, C-10, C-12 | D |
| A4-F20 | LOW | FIX-USER | STATUS quotes the shipped porkchop literal with ASCII hyphens; the source uses en-dashes | evidence: audit only (unverified); STATUS.md:418-419 vs src/v2/app/porkchop/main.ts:637 | B |
| A5-F06 | LOW | DOC-ANNOTATE | DATA_SOURCES.md claims to document Aster's current data sources but describes only the frozen V1 app | evidence: audit only (unverified); DATA_SOURCES.md:3,9-16,56-65,98-106 | — |
| A5-F08 | LOW | DOC-ANNOTATE | NOTICE still says the Lambert implementation has not landed | evidence: audit only (unverified); NOTICE:13-14 | — |
| A5-F09 | LOW | DOC-ANNOTATE | IDEA_KERNELS §6.1 still carries the payload figures the intake's own §9.2 correction retracted | evidence: audit only (unverified); strategy/IDEA_KERNELS_2026-09.md:112-118 | — |
| A5-F10 | LOW | DOC-ANNOTATE | IDEA_KERNELS:167 assigns H0 a "Slice-21 seat"; every other repo source says Slice 19 | evidence: audit only (unverified); strategy/IDEA_KERNELS_2026-09.md:167 | — |
| A5-F11 | LOW | DOC-ANNOTATE | The 2060 daily-record arithmetic in the intake correction is off by one | evidence: audit only (unverified); strategy/INTAKE_2026-09-11_EXTERNAL_AI_SESSION.md:271,286-287 | — |
| A5-F12 | LOW | DOC-ANNOTATE | The intake's generator CENTER line citations are off by one row | evidence: audit only (unverified); strategy/INTAKE_2026-09-11_EXTERNAL_AI_SESSION.md:208-210 | — |
| A5-F14 | LOW | DOC-ANNOTATE | The roadmap's Slice 18 is "Explain This Cell"; the slice that shipped and closed is "Screening Fidelity" | evidence: audit only (unverified); strategy/ASTER_ROADMAP_2026-08.md:63,72-74 | — |
| A5-F15 | LOW | DOC-ANNOTATE | ASTER_PRODUCT_VISION says the deployed V2 view shows "eight planets"; it shows six | evidence: audit only (unverified); ASTER_PRODUCT_VISION.md:27 (with :40) | — |
| A5-F16 | LOW | DOC-ANNOTATE | LEGACY.md still calls the legacy app the shipped product | evidence: audit only (unverified); LEGACY.md:14 (also :9-11, :50) | — |
| A5-F17 | LOW | DOC-ANNOTATE | UPDATES.md is abandoned (newest entry 2026-04-21) and DEVLOG.md since 2026-07-02, while both still present as live logs agents are told to read | evidence: audit only (unverified); UPDATES.md:1-3 and last heading :951; DEVLOG.md:1-3 and :80,87,100,102,277 | — |
| A5-F18 | LOW | FIX-CONTROL | "MIT license throughout" is not true of the dependency tree | evidence: audit only (unverified); INVARIANTS.md:16 (related LICENSE:29-31, NOTICE:3-5) | C |
| A5-F19 | LOW | FIX-CONTROL | Three texture assets are recorded as "Missing" / blocked on ImageMagick but ship, deploy and are loaded | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:215,217,218; src/v2/SLICE_V1_STATUS.md:23-25 | C |
| A5-F20 | LOW | DOC-ANNOTATE | "founding-drafts has no commit after e219ccc and zero diff" is contradicted by the 2026-08-06 draft rename and banner | evidence: audit only (unverified); src/v2/SLICE_16_FOUNDING.md:328 vs src/v2/founding-drafts/DRAFT_2026-07-07_REMOTE_MCP_TRAN | — |
| A5-F21 | LOW | DOC-ANNOTATE | Two strategy documents still describe themselves as uncommitted | evidence: audit only (unverified); strategy/RESEARCH_LEDGER_2026-08.md:2-3; strategy/ASTER_ROADMAP_2026-08.md:8 | — |
| B1-F01 | LOW | FIX-USER | Exact parabolic input (T* == T1 bit-exactly) returns no_convergence / null: x0=1 makes all three derivative formulas 0/0 | evidence: audit only (unverified); src/v2/core/lambert/initial-guess.ts:34-35; src/v2/core/lambert/tof.ts:82,89,104; src/v2/c | B |
| B1-F03 | LOW | FIX-EVIDENCE | The x^2 <= 0.90 multi-rev cap is justified by hyp2f1b precision, but hyp2f1b is never evaluated on the M>=1 path (and the M=0 path that uses it has no cap) | evidence: audit only (unverified); src/v2/core/lambert/lambert-multi-rev.ts:10-12; tools/slice18-research/MATH_LAYER_AUDIT.md | D |
| B1-F04 | LOW | FIX-EVIDENCE | 'Dispatch 37.5 measured hyp2f1b relative error <= 1e-9 through x^2 = 0.95' has no committed artifact and is ill-posed | evidence: audit only (unverified); src/v2/core/lambert/lambert-multi-rev.ts:10; src/v2/SLICE_11_FOUNDING.md:134,186 ('37.5 ve | D |
| B1-F05 | LOW | FIX-TEST | hyp2f1b's documented and tested domain [0, 0.5] excludes the negative arguments production passes for hyperbolic near-parabolic transfers | evidence: audit only (unverified); src/v2/core/lambert/hyp2f1b.ts:4,9-10; tests/v2-lambert/hyp2f1b.test.mjs:77 | E |
| B1-F06 | LOW | DOC-ANNOTATE | stumpff.ts claims to be used by the Izzo solver (it is dead code in v2) and calls its 1e-6 series cutoff 'conservative' although the closed form just above it loses ~6 digits | evidence: audit only (unverified); src/v2/core/lambert/stumpff.ts:1-2,17-18; src/v2/SLICE_10_FOUNDING.md DEC-1 Revision 2 ('H | — |
| B1-F07 | LOW | DOC-ANNOTATE | INV-015 text still states the solver is PyKEP source compiled to WebAssembly, without an amendment marker | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:51 | — |
| B1-F08 | LOW | FIX-CONTROL | 'Units inside the worker: meters, m/s' misstates the units the Lambert math actually runs in (km, km/s, mu in km^3/s^2) | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md AMD-7 (last sentence); INVARIANTS.md:34 | C |
| B1-F09 | LOW | FIX-USER | lambertMultiRev's 6th parameter is named `lw` but is consumed as `prograde`; the trap is recorded only in a slice-18 research script | evidence: audit only (unverified); src/v2/core/lambert/lambert-multi-rev.ts:276-291; src/v2/porkchop/grid-compute.ts:13-20; t | B |
| B1-F10 | LOW | FIX-TEST | The M=1 'reference' agreement test is self-referential (same tof/householder/initial-guess modules); the Node test suite has no independent anchor for M>=1 | evidence: audit only (unverified); tests/v2-lambert/lambert-multi-rev.test.mjs:6,54,121,278-281; tools/slice11-research/measu | E |
| B1-F11 | LOW | DOC-ANNOTATE | izzo.ts header still says multi-rev is 'partially implemented but not end-to-end validated' | evidence: audit only (unverified); src/v2/core/lambert/izzo.ts:19-20,72-76 | — |
| B2-F01 | LOW | FIX-CONTROL | Sun rendered at its SSB-relative position inside a Sun-centered scene (frame/origin mixing) | evidence: audit only (unverified); src/v2/boundary/slice2-fixture-spec.md:32; src/v2/core/constants/README.md:21; src/v2/boun | C |
| B2-F04 | LOW | FIX-CONTROL | The queued GM_SUN label correction is itself wrong: 1.32712440018e20 is the DE405 value, not 'DE430' | evidence: audit only (unverified); STATUS.md:295 and :482 (C14); src/v2/SLICE_18_FOUNDING.md:162 (OQ-18-5); tools/slice18-res | C |
| B2-F06 | LOW | DOC-ANNOTATE | INV-011 Phobos truth-point count is wrong (17,280 vs 21,600) | evidence: audit only (unverified); src/v2/core/invariants/INV-011.md:21 | — |
| B2-F07 | LOW | FIX-CONTROL | Slice 8 'Eccentricity Band Population' describes the SBDB inventory, not the shipped catalog | evidence: audit only (unverified); src/v2/core/constants/README.md:315-318 (from tools/slice8-research/round3-synthesis-repor | C |
| B2-F08 | LOW | FIX-EVIDENCE | MATH_LAYER_AUDIT's 'obliquity rotation in exactly two places' inventory is wrong | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:25 | D |
| B2-F09 | LOW | FIX-EVIDENCE | Fixture identity recorded from a CRLF working copy; hash and byte count do not match the committed blob | evidence: audit only (unverified); tools/slice12-research/data/earth-vz-span-max.json:8-9; src/v2/SLICE_12_FOUNDING.md:172; t | D |
| B2-F10 | LOW | FIX-CONTROL | INV-005 names a runtime check that does not exist; its 'reserved for future propagator slices' deferral is stale | evidence: audit only (unverified); src/v2/core/invariants/README.md:41-46; INV-008.md:53; V2_FOUNDING_DOCUMENT.md:80 | C |
| B2-F11 | LOW | FIX-TEST | utc-to-tdb test pins a physically wrong value at the J2000 UTC epoch | evidence: audit only (unverified); tests/v2-lambert/utc-to-tdb.test.mjs:33-37 | E |
| B2-F12 | LOW | FIX-EVIDENCE | Commit hashes cited as evidence are not resolvable in this clone (shallow) | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:3,72; src/v2/SLICE_12_FOUNDING.md:60-61; STATUS | D |
| B3-F08 | LOW | FIX-USER | izzo.lambert has no tof > 0 guard and returns ok:true with a velocity pair for a negative time of flight | evidence: audit only (unverified); src/v2/core/lambert/izzo.ts:60-128 (guards at :90-100 cover geometry only) | B |
| B3-F09 | LOW | FIX-USER | The porkchop worker defines an error-message type but uses it for one precondition only; every other failure escapes the message handler as an uncaught exception | evidence: audit only (unverified); src/v2/porkchop/porkchop.worker.ts:105-152 (error message posted only at :124-130) | B |
| B3-F11 | LOW | FIX-TEST | The colormap test named for monotonicity and the no-NaN floor asserts those properties against a reimplementation inside the test file, not against production code | evidence: audit only (unverified); src/v2/porkchop/colormap.test.mjs:12-23 and :61-75 | E |
| B3-F12 | LOW | FIX-USER | A path:line citation in composite-grid.ts points at the wrong line | evidence: audit only (unverified); src/v2/porkchop/composite-grid.ts:231-232 | B |
| B3-F13 | LOW | FIX-USER | c3ToViridisRgb(NaN) returns [NaN, NaN, NaN] because clamp01 is NaN-transparent | evidence: audit only (unverified); src/v2/porkchop/colormap.ts:22-30 and :36-58 | B |
| B3-F14 | LOW | FIX-USER | payloadAtC3(vehicle, NaN) returns BEYOND_CURVE, asserting a false statement about the published curve — the exact reasoning the module applies to corrupted budgets | evidence: audit only (unverified); src/v2/porkchop/launch-vehicles.ts:198-201 (contrast :41-46) | B |
| B3-F15 | LOW | FIX-USER | computePorkchopGrid validates no grid parameter; buildLinspace turns nDep = 0 or negative into one departure column | evidence: audit only (unverified); src/v2/porkchop/grid-compute.ts:67-74 and :157-168 | B |
| B3-F16 | LOW | RULING | SLICE_11_FOUNDING:63 states a delta-V stack model that DEC-7 in the same document replaces, and claims Slice 11 displays it | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_11_FOUNDING.md:63 vs :113-119 (DEC-7) | B |
| B4-F12 | LOW | DOC-ANNOTATE | DEC-7 mis-classifies 1999 AO10 as Apollo, contradicting the catalog and the slice's own OQ-4 table | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:147 (and :153) vs :306 | — |
| B4-F13 | LOW | FIX-EVIDENCE | The PyKEP vendor postmortem says "Three viable continuations" and then lists four | evidence: audit only (unverified); src/v2/research/slice-10-lambert/pykep-vendor-attempt-postmortem.md:20 | D |
| B4-F14 | LOW | FIX-TEST | The cache contract advertises tofMaxDays 1826 but the generator never samples beyond 1802 days | evidence: audit only (unverified); tests/fixtures/v2/lambert-screen-cache.json metadata.tofMaxDays; tools/build/precompute-la | E |
| B4-F15 | LOW | FIX-TEST | The cache's precomputeScriptSha256 provenance hash does not match the script at HEAD (the other two hashes do) | evidence: audit only (unverified); tests/fixtures/v2/lambert-screen-cache.json metadata.provenance.precomputeScriptSha256 | E |
| B4-F16 | LOW | FIX-EVIDENCE | OQ-8's only cited audit artifacts are /tmp paths that do not exist, so the slice's headline discipline result has no in-repo evidence | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:441-442 | D |
| B4-F17 | LOW | DOC-ANNOTATE | INV-018 and OQ-1 attribute Measurement 1 to "a Web Worker"; the committed script uses Node worker_threads and measures the M=0 lambert() path, not the production multi-rev path | evidence: audit only (unverified); src/v2/SLICE_11_FOUNDING.md:35 and :47 | — |
| B4-F18 | LOW | DOC-ANNOTATE | Section 7's cache-regeneration record disagrees with the shipped artifact on both date and commit | evidence: audit only (unverified); src/v2/SLICE_10_FOUNDING.md:457,459,468 | — |
| B5-F13 | LOW | FIX-USER | launch-vehicles.ts header says the New Glenn densification is 'pending, oracle to quantify' and names a C3=35 anchor that cannot exist | evidence: audit only (unverified); src/v2/porkchop/launch-vehicles.ts:7-8 | B |
| B5-F14 | LOW | FIX-CONTROL | INVARIANTS.md still describes DLA as 'not yet in production' and its oracle as not yet run | evidence: audit only (unverified); INVARIANTS.md:134 (§4 Math-layer validation oracles) | C |
| B5-F15 | LOW | FIX-EVIDENCE | The validation card labels the 2.10% RMS as covering 'every measured point'; it covers 6 of 22 | evidence: audit only (unverified); src/v2/data/validation-provenance.json, row cost-oracle-observed (solverConfig) | D |
| B5-F16 | LOW | FIX-CONTROL | STATUS's retraction cites compare-data line numbers that have drifted onto unrelated code (the retraction itself is correct) | evidence: audit only (unverified); STATUS.md:345 | C |
| B5-F17 | LOW | FIX-USER | Site numbers in the research summary and the shipped MGS disclosure disagree with the sourced OQ-12-2 values, outside the posted errata | evidence: audit only (unverified); tools/slice12-research/DLA_RESEARCH_SUMMARY.md:19-20; src/v2/app/porkchop/main.ts:700 | B |
| B5-F18 | LOW | ALREADY-FIXED | The ΔV-stack panel always charges a sample-return departure burn while the cost card defaults to one-way, and its disclosure says neither | SHA fbe8e89; command: node --test tests/v2-porkchop-honesty.test.mjs -> pass 1, fail 0; current delta-v source is mode-aware. | — |
| B5-F19 | LOW | FIX-USER | The unreproducible showcase figures are restated unlabelled in production source | evidence: audit only (unverified); src/v2/app/porkchop/main.ts:65-67 | B |
| B5-F20 | LOW | FIX-USER | A non-finite C3 yields BEYOND_CURVE, asserting a curve statement the module's own rationale calls a falsehood | evidence: audit only (unverified); src/v2/porkchop/launch-vehicles.ts:199-201 (pinned by src/v2/porkchop/launch-vehicles.test | B |
| B5-F21 | LOW | FIX-TEST | The golden test and SLICE_14 cite two different capture commits for the same golden set, and the capture evidence is untracked | evidence: audit only (unverified); tests/v2-golden/launch-vehicles.golden.test.mjs:10-11 vs src/v2/SLICE_14_FOUNDING.md:98 | E |
| B5-F22 | LOW | RULING | INV-022's third provenance element (official-published vs estimated) is on no anchor | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/porkchop/launch-vehicles.ts:69-177 (all 38 anchor comments) | B |
| B5-F23 | LOW | FIX-CONTROL | The research library's status line still says the corpus has not been translated into DECs | evidence: audit only (unverified); src/v2/research/README.md:19 (governing src/v2/research/slice-12-deltav-propulsion/PROVENA | C |
| B5-F24 | LOW | DOC-ANNOTATE | SLICE_13_FOUNDING names the two advisory strings at a file that does not exist | evidence: audit only (unverified); src/v2/SLICE_13_FOUNDING.md:19 (also DEC-13-3 at :61) | — |
| C1-F01 | LOW | FIX-USER | Third-amendment (quality-axis) evidence and the A.3 harness's truth/CAD inputs are not committed | evidence: audit only (unverified); src/v2/SLICE_9_FOUNDING.md:248-262,364-367; tools/slice9-diagnostic/SLICE_9_QUALITY_AXIS_D | B |
| C1-F02 | LOW | FIX-USER | Not-Kepler-safe breakdown sums to 397, not 348 (overlapping categories presented as a decomposition) | evidence: audit only (unverified); src/v2/SLICE_9_FOUNDING.md:357-361 | B |
| C1-F03 | LOW | FIX-TEST | 'Bounded re-anchor (~12k, not all 42k)' / 'hybrid for stale subsets' is stale: 99.1% of the catalog is Horizons re-anchored | evidence: audit only (unverified); src/v2/SLICE_9_FOUNDING.md:39-46; tests/fixtures/v2/nea-catalog-slice9.json top-level anch | E |
| C1-F04 | LOW | FIX-USER | assertFiniteNumber accepts null/boolean/empty as 0/1; committed record 2015 D1 has elements.maRad null and ingests silently as 0 | evidence: audit only (unverified); src/v2/boundary/slice9-nea-catalog.ts:166-172 (same helper at horizons.ts:206-212); fixtur | B |
| C1-F05 | LOW | RULING | INV-014 is assigned to two unrelated rules (star background vs three-gate tier) with no namespace note | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/SLICE_8_5_FOUNDING.md:56; tests/v2-render-star-catalog.test.mjs:105; tests/v2-rende | C |
| C1-F08 | LOW | FIX-USER | Slice 10 fixture spec points at a tests/fixtures path that does not exist; the fixture lives in src/v2/data | evidence: audit only (unverified); src/v2/boundary/slice10-fixture-spec.md:9 | B |
| C1-F09 | LOW | FIX-USER | Boundary README source map cites boundary/asterank.ts and boundary/nhats.ts, which do not exist | evidence: audit only (unverified); src/v2/boundary/README.md:271-275 | B |
| C1-F10 | LOW | FIX-TEST | '.gitignore:17' citation is off by two at HEAD | evidence: audit only (unverified); src/v2/SLICE_9_FOUNDING.md:427; INVARIANTS.md:172; tests/v2-slice9-cutover.test.mjs:32 | E |
| C1-F11 | LOW | FIX-USER | Status headers and scope lines left at 'implementation pending' / pre-ship values | evidence: audit only (unverified); src/v2/SLICE_9_FOUNDING.md:3; src/v2/SLICE_8_5_FOUNDING.md:3,5,15,83,102; src/v2/SLICE_9_P | B |
| C1-F12 | LOW | FIX-TEST | NEA fixture spec example contradicts the committed epochPolicy and the albedo-0.14 radius formula | evidence: audit only (unverified); tests/fixtures/v2/nea-catalog-slice9.spec.md:37,78-80 | E |
| C1-F13 | LOW | FIX-TEST | Boundary test's tier-distribution assertion compares the fixture summary to itself; the 41,558/348 split is pinned nowhere | evidence: audit only (unverified); tests/v2-boundary-slice9.test.mjs:67-69,81,91 (cited as retained coverage at src/v2/SLICE_ | E |
| C1-F14 | LOW | FIX-EVIDENCE | Path A record (reanchor-90d-*.json) is tracked without the '!' exception the .gitignore convention requires | evidence: audit only (unverified); .gitignore:17-18,30-32; tools/slice9-ingestion/data/reanchor-90d-summary.json, reanchor-90 | D |
| C1-F15 | LOW | FIX-USER | Committed sha256 for the 2026-2040 fixture is the CRLF-checkout hash and is no longer reproducible under eol=lf | evidence: audit only (unverified); tools/slice12-research/data/earth-vz-span-max.json:8; src/v2/SLICE_12_FOUNDING.md:172 | B |
| C1-F16 | LOW | FIX-USER | Gate 1 (CAD encounter-flag) per-body evidence for the production fixture is not committed | evidence: audit only (unverified); src/v2/SLICE_9_FOUNDING.md:180-182,359; tools/slice9-ingestion/build-nea-catalog.mjs:29,11 | B |
| C2-F01 | LOW | FIX-EVIDENCE | dv-scope-results.json is a stale aggregate from the uncommitted CAD pull and does not reproduce from committed inputs | evidence: audit only (unverified); tools/slice18-research/dv-scope-results.json (rowsTotal, scope.byPredictedAddedDrift, dist | D |
| C2-F02 | LOW | FIX-CONTROL | Committed Kepler-sweep evidence shows a 2π residual; the '≤1.8e-15 rad' claim exists in no committed artifact | evidence: audit only (unverified); STATUS.md:285; tools/slice18-research/MATH_LAYER_AUDIT.md:54,70; tools/slice18-research/au | C |
| C2-F03 | LOW | FIX-USER | Founding doc dates Front B's completion 2026-09-02; git and the artifacts say 2026-09-06; STATUS corrected it, the founding doc did not | evidence: audit only (unverified); src/v2/SLICE_18_FOUNDING.md:183, :233, :95 (DEC-18-3 annotation date) | B |
| C2-F04 | LOW | FIX-USER | The founding doc's header lock date (2026-09-02) is wrong and not covered by C-3 | evidence: audit only (unverified); src/v2/SLICE_18_FOUNDING.md:3 | B |
| C2-F05 | LOW | FIX-CONTROL | STATUS still says the OQ-18-6 ruling and the date correction await annotations that landed on 2026-09-10 | evidence: audit only (unverified); STATUS.md:121, :146, :160 | C |
| C2-F08 | LOW | FIX-USER | The 'DE430' attribution of GM_SUN = 1.32712440018e20 is itself a mislabel (it is the DE405 value) | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:47; STATUS.md:295; STATUS.md:482 (C14); src/v2/ | B |
| C2-F09 | LOW | FIX-CONTROL | 'minC3 value shift ≤ 1.1 km²/s² abs on every body' is contradicted by the committed argmin results (2025 VP: 2.27) | evidence: audit only (unverified); tools/slice18-research/NEA_DRIFT_MEASUREMENT.md:119; STATUS.md:277 | C |
| C2-F10 | LOW | FIX-USER | DEC-18-6's 'Verified' footnote derives 24.3% from the wrong count (10,152 gives 24.2%) | evidence: audit only (unverified); src/v2/SLICE_18_FOUNDING.md:109 | B |
| C2-F11 | LOW | FIX-USER | DEC-18-5's 'Verified' footnote places countVerified: 9 in the wrong finding of the truth fixture | evidence: audit only (unverified); src/v2/SLICE_18_FOUNDING.md:87 | B |
| C2-F12 | LOW | FIX-USER | Apophis's 2028-09-12 pass is at 0.257 AU, not '~0.27 AU' | evidence: audit only (unverified); src/v2/SLICE_18_FOUNDING.md:245 | B |
| C2-F13 | LOW | FIX-CONTROL | The math-layer audit is dated 2026-09-06 by its own header and 2026-09-09 by STATUS | evidence: audit only (unverified); tools/slice18-research/MATH_LAYER_AUDIT.md:3; STATUS.md:45; STATUS.md:284 | C |
| C2-F14 | LOW | FIX-TEST | Observation: 2015 D1 is catalogued as 'C/2015 D1 (SOHO)', a comet that (external knowledge) disintegrated in 2015; the record tiers it only as 'cannot propagate' | evidence: audit only (unverified); tests/fixtures/v2/nea-catalog-slice9.json asteroid-2015 D1; src/v2/SLICE_18_FOUNDING.md:71 | E |
| C3-F03 | LOW | FIX-USER | "Display calls the SAME core function that generated the catalog, so it cannot drift" is false: the catalog generator has its own copy of the H→D formula with its own literal 0.14; | evidence: audit only (unverified); src/v2/app/compare/main.ts:182-186; SLICE_17_FOUNDING.md:615-616; STATUS.md:77; STATUS.md: | B |
| C3-F06 | LOW | FIX-CONTROL | STATUS says OQ-17-8 is disposed; the founding doc never dispositions it | evidence: audit only (unverified); STATUS.md:44 and STATUS.md:79; SLICE_17_FOUNDING.md:395-400 and §8:586 | C |
| C3-F07 | LOW | FIX-CONTROL | STATUS's Slice 19 item 1 cites a deployed bundle name that no longer exists and quotes the literal with the wrong dash/× characters | evidence: audit only (unverified); STATUS.md:425 (also :418-421 and :28) | C |
| C3-F08 | LOW | DOC-ANNOTATE | DEC-17-2's "median 243.42 ms/body" is one body's run-median, not the per-body median | evidence: audit only (unverified); SLICE_17_FOUNDING.md:129 | — |
| C3-F09 | LOW | DOC-ANNOTATE | A quoted backlog caveat is paraphrased, not quoted | evidence: audit only (unverified); SLICE_17_FOUNDING.md:342 (§5 B5) and :560-561 (§8 CUT) | — |
| C3-F10 | LOW | FIX-USER | User copy duplicates constants as literals on two trust surfaces, including one whose header claims it cannot drift | evidence: audit only (unverified); src/v2/app/compare/main.ts:239, :240, :786, :205; src/v2/app/catalog-list/honesty-disclosu | B |
| C3-F11 | LOW | DOC-ANNOTATE | ERRATUM D-07's artifact path does not resolve, and the "D-07" label covers two further §8 amendments that never landed | evidence: audit only (unverified); SLICE_17_FOUNDING.md:641 | — |
| C4-F19 | LOW | FIX-USER | The documented halo toggle cannot be operated by a consuming page | evidence: audit only (unverified); src/v2/render/halos.md:34,45-46 vs src/v2/render/halos.ts:5,91 | G |
| C4-F20 | LOW | FIX-USER | halos.ts uses two inconsistent pixel scales in one function, so the documented 1.5 px / 4 px thresholds are 5.48% off | evidence: audit only (unverified); src/v2/render/halos.ts:102-103 vs :114; documented at src/v2/render/halos.md:9,14 | G |
| C4-F21 | LOW | FIX-CONTROL | INVARIANTS pins the per-frame atmosphere copy at a line 518 lines away | evidence: audit only (unverified); INVARIANTS.md:89-90 | C |
| C4-F27 | LOW | FIX-USER | Orbit trails are listed as a Slice 7 non-goal but shipped in Slice 7 | evidence: audit only (unverified); src/v2/render/asteroid-rendering.md:105-107 vs src/v2/app/solar-system/runtime.ts:1309-131 | G |
| C4-F28 | LOW | FIX-USER | Mars's limb glow is attributed to an ultraviolet nightglow | evidence: audit only (unverified); src/v2/research/slice-renderer-planets/RESEARCH.md:189; src/v2/prototypes/renderer-test/at | G |
| C4-F29 | LOW | LEGACY-QUARANTINE | The r128 API table forbids CDN OrbitControls, which the repo loads from a CDN, and states a false fact about r128 | evidence: audit only (unverified); INVARIANTS.md:113 vs index.html:19,806,1482 and src/v2/prototypes/renderer-test/scene.ts:3 | A |
| C4-F30 | LOW | FIX-USER | The Slice V1 founding doc still calls itself a skeleton and its prototype untracked | evidence: audit only (unverified); src/v2/SLICE_V1_FOUNDING.md:3,11,466-467,478 | G |
| C4-F31 | LOW | FIX-USER | Earth's city lights bleed onto the daylit hemisphere | evidence: audit only (unverified); src/v2/render/earth-shader.ts:49-50,53,60 | G |
| C4-F32 | LOW | FIX-TEST | Two 'display integrity' tests verify only that source text exists | evidence: audit only (unverified); tests/v2-runtime-display-integrity.test.mjs:80-103; same pattern at tests/v2-runtime-camer | E |
| C4-F34 | LOW | FIX-USER | The documented inner-radius-ascending renderOrder for ring substructure is not implemented | evidence: audit only (unverified); src/v2/render/saturn-ring-substructure.md:71-75 vs src/v2/render/saturn-rings.ts:71-72,325 | G |
| C4-F35 | LOW | RULING | A procedurally invented ring brightness profile lives in a tracked file - the INV-V1-001 class | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/prototypes/renderer-test/rings.ts:42-45,96-124 vs src/v2/SLICE_V1_FOUNDING.md:70-77 | G |
| C5-F15 | LOW | RULING | INV-025: bare internal identifiers in deployed user-facing copy | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/app/catalog-list/honesty-disclosure.ts:69; v2/earth-moon/index.html and docs/v2/ear | B |
| C5-F16 | LOW | FIX-USER | The smoke harness's "Expected C3" literal is one solver fix behind the shipped solver | evidence: audit only (unverified); src/v2/app/porkchop-smoke/main.ts:16-20; rendered at src/v2/porkchop/porkchop-view.ts:1468 | B |
| C5-F17 | LOW | RULING | INV-026 residue: two trust-surface numbers still render from literals rather than derived values | audit finding re-verified at c185c33/current descendant; locked-text vs shipped-behaviour packet below; src/v2/app/about/main.ts:377-379 (with src/v2/boundary/slice9-nea-catalog.ts:20); src/v2/p | B |
| C5-F18 | LOW | FIX-USER | The "?" shortcut overlay omits the middle-drag pan binding the code implements | evidence: audit only (unverified); src/v2/app/solar-system/runtime.ts:1117 vs :2008 | B |
| C5-F19 | LOW | FIX-USER | The compare page's method badge does not state that its search is single-revolution only | evidence: audit only (unverified); src/v2/app/compare/main.ts:757 and :931; src/v2/porkchop/compare-data.ts:300-312 | B |
| C5-F20 | LOW | FIX-USER | The close-approach-degeneracy caveat is popover-only for 3,163 rows that render a green "low C3" badge | evidence: audit only (unverified); src/v2/app/catalog-list/honesty-disclosure.ts:74-83 vs src/v2/app/catalog-list/row.ts:27-4 | B |
| D1-F06 | LOW | FIX-EVIDENCE | dla_feasibility throws (MCP tool error) instead of returning a value when the DLA is undefined (null) | evidence: audit only (unverified); mcp/src/tools/compute-shared.ts:281,294 | D |
| D1-F08 | LOW | FIX-CONTROL | Research-corpus folders/README use a superseded slice numbering (14 = composition, 15 = ISRU) with no annotation | evidence: audit only (unverified); src/v2/research/README.md:12-19 (also slice-14-composition/PROVENANCE.md:10-14, slice-15-i | C |
| D1-F09 | LOW | FIX-CONTROL | proxy/ is a dead byte-identical duplicate of worker/ whose README documents the other directory and a macOS absolute path | evidence: audit only (unverified); proxy/README.md:44 (also :29,49-53,61,122-126; REFACTOR_MAP.md:14; .gitattributes:19-20) | C |
| D1-F10 | LOW | DOC-ANNOTATE | SLICE_14 has two different OQs both numbered OQ-14-5 | evidence: audit only (unverified); src/v2/SLICE_14_FOUNDING.md:81 and :100 | — |
| D1-F11 | LOW | FIX-CONTROL | ci.yml self-description ('two gates … never builds docs/') no longer matches its four jobs; DEC-14-5 record not amended | evidence: audit only (unverified); .github/workflows/ci.yml:3-8 (DEC-14-5 at src/v2/SLICE_14_FOUNDING.md:140-145) | C |
| D1-F12 | LOW | DOC-ANNOTATE | DEC-15-6/OQ-15-7 say mcp/ imports core 'via tsconfig paths'; the tsconfig has no paths | evidence: audit only (unverified); src/v2/SLICE_15_FOUNDING.md:91 (also :147, :150) | — |
| D1-F13 | LOW | DOC-ANNOTATE | SLICE_15 §8 describes the committed eval report with values the file no longer carries | evidence: audit only (unverified); src/v2/SLICE_15_FOUNDING.md:193 | — |
| D1-F14 | LOW | DOC-ANNOTATE | SLICE_15 DEFERRED block says the five Fable drafts are 'NOT yet downloaded … NOT ingested'; they were ingested 2026-07-18 | evidence: audit only (unverified); src/v2/SLICE_15_FOUNDING.md:206 | — |
| D1-F15 | LOW | FIX-CONTROL | npm-registry claims (publisher 'hudsoclavin', shasum c912f2b, 2026-07-10 handshake, aster-mcp collision, 0.1.0 baked dirty) cannot be verified offline; the handle may be a typo | evidence: audit only (unverified); src/v2/SLICE_15_FOUNDING.md:69 (also :174; STATUS.md:14; mcp/scripts/check-publish-clean.m | C |
| D2-F01 | LOW | FIX-CONTROL | Sealed commit 670b039 and tag slice16-prereg-v1 are absent from this checkout (shallow clone); the doc's own verification recipe cannot be run | evidence: audit only (unverified); src/v2/SLICE_16_FOUNDING.md:1340-1348 (§27); STATUS.md:49; tools/slice16-harness/config.mj | C |
| D2-F03 | LOW | FIX-CONTROL | '$13.82 (pilots + attempt 1)' excludes the pilots, and all spend figures are the harness's token-price estimate (cache unpriced) presented as 'actual spend' | evidence: audit only (unverified); STATUS.md:63; src/v2/SLICE_16_FOUNDING.md:1086,1581-1583; tools/slice16-harness/CLOSE_REPO | C |
| D2-F06 | LOW | FIX-EVIDENCE | 'Collected under the instrument sealed at 670b039' is not literally true for the harness: four post-seal harness commits, a mid-run code change at row 65, harnessDirty:true/serverB | evidence: audit only (unverified); src/v2/SLICE_16_FOUNDING.md:1437,1445,1503-1505; tools/slice16-harness/PRE_RUN_GATE.md box | D |
| D2-F07 | LOW | FIX-EVIDENCE | 'One prefix fingerprint across every row' is false across the 468 rows (one per arm) | evidence: audit only (unverified); src/v2/SLICE_16_FOUNDING.md:1505; tools/slice16-harness/FINISH_REPORT.md §How the run went | D |
| D2-F08 | LOW | FIX-EVIDENCE | RUNBOOK.md ('procedure of record') keeps stale model/r/test/mock counts; its closing banner corrects only the scenario set | evidence: audit only (unverified); tools/slice16-harness/RUNBOOK.md:16-24,35,40-44, §5b checks 1-3 and 5b, §7 table, :414 | D |
| D2-F09 | LOW | FIX-CONTROL | Hook comment misdates the appendix append as 2026-09-21; the commit is 2026-09-22 | evidence: audit only (unverified); .githooks/pre-commit:62 | C |
| D2-F10 | LOW | FIX-CONTROL | src/v2/research/README.md still presents the 2026-05-22 slice numbering (16 = redirect/capture, 17 = economics, 18-20 = risk) as current; the renumbering is explained nowhere in th | evidence: audit only (unverified); src/v2/research/README.md:13-15,17-19; src/v2/research/slice-16-redirect-capture/PROVENANC | C |
| D2-F11 | LOW | FIX-CONTROL | STATUS drops the dated snapshot from the Haiku model id | evidence: audit only (unverified); STATUS.md:51 | C |
| D2-F12 | LOW | FIX-CONTROL | runs/README.md labels the 18-row mock ledger and its grades as instrument 'A12'; they are A9-era (r=3), collected before A10, the remediation and A12 | evidence: audit only (unverified); tools/slice16-harness/runs/README.md NOT-STUDY-DATA table rows for ledger-mock.jsonl and l | C |
| D4-F27 | LOW | LEGACY-QUARANTINE | LEGACY.md's scope list links absolute macOS paths, broken in every clone | evidence: audit only (unverified); LEGACY.md:9-11 | A |
| D4-F28 | LOW | LEGACY-QUARANTINE | proxy/ and worker/ are byte-identical duplicates declaring the same Cloudflare Worker name, and only worker/ is covered by tests | evidence: audit only (unverified); proxy/{README.md,index.js,wrangler.toml} vs worker/{...}; tests/phase6-contract-smoke.test | A |
| D4-F29 | LOW | LEGACY-QUARANTINE | The extract and redirect planners convert the same UI year input to Julian Date by two different formulas | evidence: audit only (unverified); src/economics/mission-costs/planner.ts:82-83 vs src/economics/mission-costs/redirect.ts:16 | A |
| D4-F30 | LOW | LEGACY-QUARANTINE | The shipped fallback catalog claims 12 entries but holds 11, is 7.45 years stale, and carries price/profit values from 1e-42 to 1.5e14 USD that flow into user-facing fields | evidence: audit only (unverified); src/data/asteroids/fallback-catalog.ts:2-15; same data in physics.worker.js | A |
| D4-F31 | LOW | LEGACY-QUARANTINE | The redirect feasibility score's "value" term is saturated at its ceiling for essentially every target, while the UI describes the score as weighted by value | evidence: audit only (unverified); src/workers/physics/planner/redirect.ts:221; duplicate src/economics/scoring.ts:192; claim | A |
| D4-F32 | LOW | LEGACY-QUARANTINE | The deployed root ships a dead importmap pointing at a third-party CDN | evidence: audit only (unverified); docs/index.html:17-24 (and index.html:15-24) | A |

## Counts per disposition

- ALREADY-FIXED: 3
- DOC-ANNOTATE: 49
- FIX-CONTROL: 82
- FIX-EVIDENCE: 35
- FIX-TEST: 17
- FIX-USER: 86
- LEGACY-QUARANTINE: 34
- RULING: 20

HIGH re-verified: 21; HIGH refuted: 0.

## RULING packet

Each RULING has two options: amend the locked DEC/INV additively to describe shipped behavior, or change shipped behavior/code to satisfy the locked text. Hudson must choose before implementation.

### A2-F05 — INV-008..011
- Locked text [src/v2/core/invariants/INV-008.md:46, INV-009.md:52, INV-010.md:55, INV-011.md:71]: “INV-008..011 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/core/invariants/INV-008.md:46, INV-009.md:52, INV-010.md:55, INV-011.md:71]: “Locked text claims runtime enforcement; shipped core contains no such enforcement path.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### A2-F07 — INV-014
- Locked text [src/v2/SLICE_8_5_FOUNDING.md:56 vs src/v2/SLICE_9_FOUNDING.md:264-276]: “INV-014 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_8_5_FOUNDING.md:56 vs src/v2/SLICE_9_FOUNDING.md:264-276]: “Locked registry resolves to two meanings and live tests cite both.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### A2-F19 — INV-035/036 numbering
- Locked text [SLICE_17_FOUNDING.md:697,703 vs INVARIANTS.md:233]: “INV-035/036 numbering requires the rule recorded at the cited source.”
- Shipped behaviour [SLICE_17_FOUNDING.md:697,703 vs INVARIANTS.md:233]: “Locked slice reservation conflicts with the global skipped-number declaration.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### B2-F03 — INV-008..011
- Locked text [src/v2/core/invariants/INV-008.md:46 etc.]: “INV-008..011 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/core/invariants/INV-008.md:46 etc.]: “Shipped code does not perform the runtime enforcement claimed by the invariant docs.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### B3-F16 — DEC-7
- Locked text [src/v2/SLICE_11_FOUNDING.md:63 vs :113-119]: “DEC-7 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_11_FOUNDING.md:63 vs :113-119]: “Locked DEC-7 uses the rendezvous/departure model; the earlier OQ text still states 2 x sqrt(C3).”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### B4-F03 — DEC-7
- Locked text [src/v2/SLICE_11_FOUNDING.md:63,113-118 and src/v2/porkchop/delta-v.ts:36-48]: “DEC-7 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_11_FOUNDING.md:63,113-118 and src/v2/porkchop/delta-v.ts:36-48]: “The OQ text remains inconsistent with DEC-7; shipped code now follows DEC-7 after fbe8e89.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### B5-F07 — DEC-12-4
- Locked text [src/v2/SLICE_12_FOUNDING.md:91 vs src/v2/app/porkchop/main.ts:313]: “DEC-12-4 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_12_FOUNDING.md:91 vs src/v2/app/porkchop/main.ts:313]: “Locked default is OFF; production DLA toggle is ON.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### B5-F11 — INV-016d
- Locked text [src/v2/SLICE_13_FOUNDING.md:84,98 vs src/v2/app/porkchop/main.ts:669-703]: “INV-016d requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_13_FOUNDING.md:84,98 vs src/v2/app/porkchop/main.ts:669-703]: “Locked disclosure/site-picker requirement is present in the record; shipped disclosure/site picker are hidden behind DLA toggle.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### B5-F22 — INV-022
- Locked text [src/v2/SLICE_15_FOUNDING.md and src/v2/porkchop/launch-vehicles.ts:69-177]: “INV-022 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_15_FOUNDING.md and src/v2/porkchop/launch-vehicles.ts:69-177]: “Locked provenance requires official-published vs estimated; shipped anchors do not carry that element.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C1-F05 — INV-014
- Locked text [INVARIANTS.md:181 vs Slice 8.5/9 definitions]: “INV-014 requires the rule recorded at the cited source.”
- Shipped behaviour [INVARIANTS.md:181 vs Slice 8.5/9 definitions]: “Locked identifier is used for two unrelated rules without a namespace amendment.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C3-F04 — DEC-17-4
- Locked text [SLICE_17_FOUNDING.md:673-677 vs §8:417-418]: “DEC-17-4 requires the rule recorded at the cited source.”
- Shipped behaviour [SLICE_17_FOUNDING.md:673-677 vs §8:417-418]: “Locked binding requires the MPC spot check before the quality copy ships; shipped close record lacks it.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C3-F05 — DEC-17-5
- Locked text [SLICE_17_FOUNDING.md:197-209 vs src/v2/app/compare/main.ts]: “DEC-17-5 requires the rule recorded at the cited source.”
- Shipped behaviour [SLICE_17_FOUNDING.md:197-209 vs src/v2/app/compare/main.ts]: “Locked compare clauses are not implemented on the shipped compare route and were not recorded as residuals.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C4-F22 — INV-001 / DEC-V1
- Locked text [INVARIANTS.md:87-88 vs src/v2/SLICE_V1_FOUNDING.md:267-268 and src/v2/render/atmosphere.ts]: “INV-001 / DEC-V1 requires the rule recorded at the cited source.”
- Shipped behaviour [INVARIANTS.md:87-88 vs src/v2/SLICE_V1_FOUNDING.md:267-268 and src/v2/render/atmosphere.ts]: “Locked invariant says spherical atmosphere; locked DEC and shipped shells are oblate and not body-tilted.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C4-F33 — INVARIANTS section 1
- Locked text [INVARIANTS.md:95-102 vs src/v2/app/earth-moon/runtime.ts:118,205-206]: “INVARIANTS section 1 requires the rule recorded at the cited source.”
- Shipped behaviour [INVARIANTS.md:95-102 vs src/v2/app/earth-moon/runtime.ts:118,205-206]: “Locked invariant forbids camera-relative coordinates; earth-moon ships them.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C4-F35 — INV-V1-001
- Locked text [src/v2/SLICE_V1_FOUNDING.md:70-77 vs src/v2/prototypes/renderer-test/rings.ts:42-45,96-124]: “INV-V1-001 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_V1_FOUNDING.md:70-77 vs src/v2/prototypes/renderer-test/rings.ts:42-45,96-124]: “Locked class forbids invented production-like evidence; tracked ring brightness profile is procedurally invented.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C5-F15 — INV-025
- Locked text [src/v2/app/catalog-list/honesty-disclosure.ts:69 vs deployed v2 surfaces]: “INV-025 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/app/catalog-list/honesty-disclosure.ts:69 vs deployed v2 surfaces]: “Locked invariant forbids bare internal identifiers in user copy; a rendered surface contains one.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### C5-F17 — INV-026
- Locked text [src/v2/app/about/main.ts:377-379 and src/v2/porkchop/compare-data.ts:300-312]: “INV-026 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/app/about/main.ts:377-379 and src/v2/porkchop/compare-data.ts:300-312]: “Locked provenance requires derived values; two trust-surface numbers remain literal.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### D1-F04 — DEC-15-8 / AMD A2
- Locked text [src/v2/SLICE_15_FOUNDING.md:197 vs mcp/src/tools/dla-feasibility.ts:29 and tests]: “DEC-15-8 / AMD A2 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_15_FOUNDING.md:197 vs mcp/src/tools/dla-feasibility.ts:29 and tests]: “Locked adapter policy requires consistent refusal semantics; tools return different refusal classes.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### D1-F05 — INV-027
- Locked text [src/v2/SLICE_15_FOUNDING.md and mcp/src/tools/compute-shared.ts:270-300]: “INV-027 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_15_FOUNDING.md and mcp/src/tools/compute-shared.ts:270-300]: “Locked no-rederivation rule is contradicted by adapters recomputing v-infinity/DLA and marginDeg.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.

### D2-F05 — DEC-16-8
- Locked text [src/v2/SLICE_16_FOUNDING.md:124-128,1471-1473]: “DEC-16-8 requires the rule recorded at the cited source.”
- Shipped behaviour [src/v2/SLICE_16_FOUNDING.md:124-128,1471-1473]: “Locked registered contrast/Holm analysis was not computed; shipped report substitutes marginal CIs.”
- Options: amend the locked DEC/INV additively to match shipped behavior, or change shipped behavior/code to match the locked text.


## RULING packet - verbatim lock/ship excerpts

Each row presents the two choices: amend the locked DEC/INV additively, or change shipped behavior/code to satisfy it.

### A2-F05 - INV-008..011
- Locked [INV-008.md:46]: “core/interpolators — called on every interpolated state before it is returned to any caller”.
- Shipped [audit recheck at c185c33]: “no corresponding runtime enforcement path found in core”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### A2-F07 - INV-014
- Locked [SLICE_8_5_FOUNDING.md:56]: “INV-014 (new): Star background renders at honest celestial position.”
- Shipped [INVARIANTS.md:181]: “INV-014 | src/v2/SLICE_9_FOUNDING.md | Three-gate visualization tier”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### A2-F19 - INV-035/036 numbering
- Locked [SLICE_17_FOUNDING.md:697,703]: “PROPOSED-INV-035” and “PROPOSED-INV-036”.
- Shipped [INVARIANTS.md:233]: “035 and 036 are therefore skipped as ambiguous-on-sight”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### B2-F03 - INV-008..011
- Locked [INV-009.md:52]: “core/interpolators — extended for per-body cadence ... before return to any caller”.
- Shipped [audit command]: “the claimed enforcement calls are documented but not present in the production core path”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### B3-F16 - DEC-7
- Locked [SLICE_11_FOUNDING.md:113-119]: “Rendezvous ΔV = v∞_arr; Departure ΔV (sample return) = v∞_arr; Margin = 10% of subtotal”.
- Shipped [SLICE_11_FOUNDING.md:63]: “injection + 2×√C3 + 150 m/s overhead + 10% margin”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### B4-F03 - DEC-7
- Locked [SLICE_11_FOUNDING.md:113-120]: “DEC-7: ΔV stack model” with rendezvous/departure terms.
- Shipped [current delta-v.ts:36-48]: “const subtotalKmps = injectionKmps + rendezvousKmps + departureKmps + stationkeepingKmps”; the stale OQ text remains.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### B5-F07 - DEC-12-4
- Locked [SLICE_12_FOUNDING.md:89-92]: “Toggle default OFF ... Legend and INV-016d disclosure ship with the toggle”.
- Shipped [src/v2/app/porkchop/main.ts:320,678]: “useState(true)” and conditional disclosure/site picker.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### B5-F11 - INV-016d
- Locked [SLICE_12_FOUNDING.md:36]: “Any launch-feasibility display must disclose ... launch site ... band model ... dogleg/plane-change costs”.
- Shipped [main.ts:678-709]: “showDlaContours ? [... site picker ... disclosure ...]”; the required content is hidden when false.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### B5-F22 - INV-022
- Locked [INVARIANTS.md:189]: “every launch-vehicle anchor carries provenance (source, as-of date, official-published vs estimated) adjacent to the number”.
- Shipped [launch-vehicles.ts:14-21,60-75]: “curve: ...; source; asOf” with no official-published vs estimated field.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C1-F05 - INV-014
- Locked [SLICE_8_5_FOUNDING.md:56]: “INV-014 ... Star background renders at honest celestial position”.
- Shipped [SLICE_9_FOUNDING.md:264-276 / INVARIANTS.md:181]: “INV-014” is also the three-gate viz-tier rule.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C3-F04 - DEC-17-4
- Locked [SLICE_17_FOUNDING.md:673-676]: “DEC-17-4’s quality copy ... OPEN spot check before UI copy quotes the bands”.
- Shipped [SLICE_17_FOUNDING.md:§8 close record]: “no §8 entry records a waiver”; the copy shipped.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C3-F05 - DEC-17-5
- Locked [SLICE_17_FOUNDING.md:197-209]: “DEC-17-5 Provenance surface. LOCKED.” with persistent method/grid/quality fields.
- Shipped [audit recheck of src/v2/app/compare/main.ts]: “the locked clauses are not implemented on /v2/compare/”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C4-F22 - INV-001 / DEC-V1
- Locked [INVARIANTS.md:87-88]: “Atmosphere must be spherical”.
- Shipped [SLICE_V1_FOUNDING.md:267-268 and atmosphere.ts:26-28]: “oblateYScale” is shipped for Mars/Jupiter/Saturn.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C4-F33 - INVARIANTS section 1
- Locked [INVARIANTS.md:93-102]: “Any object added to the scene ... must have its .position set in scene-relative coordinates — never camera-relative”.
- Shipped [earth-moon/runtime.ts:192]: “const cameraPosition = sphericalToCartesian(...)” and camera-relative positioning is used by the route.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C4-F35 - INV-V1-001
- Locked [INVARIANTS.md:202]: “Visual asset provenance must be confirmed before shipping”.
- Shipped [renderer-test/rings.ts:96-123]: “buildProceduralRingTexture” invents alpha bands procedurally.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C5-F15 - INV-025
- Locked [INVARIANTS.md:192]: “user-facing copy never exposes internal taxonomy identifiers ... without plain-English framing”.
- Shipped [audit recheck of v2 trust surfaces]: “bare internal identifiers remain in deployed copy”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### C5-F17 - INV-026
- Locked [INVARIANTS.md:193]: “every numeric claim on a public validation/trust surface renders from a single committed provenance artifact (JSON), never from literals”.
- Shipped [audit recheck of about/compare sources]: “two trust-surface numbers still render from literals”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### D1-F04 - DEC-15-8 / AMD A2
- Locked [SLICE_15_FOUNDING.md:197]: “unknown-but-well-formed identifier is a structured not_found refusal”.
- Shipped [dla-feasibility.ts:29 and explain-cell.ts:103-109]: “dla_feasibility schema and other tools use different refusal paths”.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### D1-F05 - INV-027
- Locked [INVARIANTS.md:194]: “No math in the mcp/ layer: adapters only; math belongs in src/v2/core/”.
- Shipped [compute-shared.ts:281-299]: “classifyFeasibility” and “marginDeg” are recomputed in the adapter.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

### D2-F05 - DEC-16-8
- Locked [SLICE_16_FOUNDING.md:120-128]: “Grading is deterministic only — no LLM judge anywhere” and the registered contrast analysis governs.
- Shipped [SLICE_16_FOUNDING.md:1471-1473]: “heavily overlapping” marginal CIs are reported; the registered difference/Holm analysis is absent.
- Options: amend the locked text additively, or fix the shipped behavior/code to match the locked text.

