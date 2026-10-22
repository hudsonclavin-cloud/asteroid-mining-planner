VERIFY RUN: COMPLETE | STOPPED(None)
MUTATION: 11 FAIL-as-required / 1 CANNOT-FAIL / 0 NOT-ISOLABLE (of 12)
C1 B2 EVIDENCE: CHANGED (8 values)
C5 PROTECTED: ADDITIVE
CANONICAL TREE: unchanged

# S19.5 A+B independent verification

Repository: `C:\Users\hudso\asteroid-mining-planner`  
Canonical branch/HEAD: `s19-5-ab` / `bd9d6f5`  
Remote: `https://github.com/hudsonclavin-cloud/asteroid-mining-planner.git`

## Tripwires and runner

- Canonical status before and after checks: exactly the two protected unstaged edits.
- Detached worktree: `%TEMP%\s19-5-verify\wt`.
- `npm ci`: PASS.
- One-file command: `node --test --test-timeout=120000 <test-file>`.

## Mutation results

- V1 `4a098fb`: `tests/v2-validation-provenance.test.mjs`; undone fix FAIL-as-required — `AssertionError [ERR_ASSERTION]: The "string" argument must be of type string. Received type undefined (undefined)`; restored PASS.
- V2 `c7b9ef8`: `tests/v2-catalog-empty.test.mjs`; undone fix FAIL-as-required — `TypeError: empty.catalogEmptyReason is not a function` at `tests/v2-catalog-empty.test.mjs:25:22`; restored PASS.
- V3 `446e3a7`: `tests/v2-derived-span-labels.test.mjs`; undone fix FAIL-as-required — strictEqual actual `2026–2040`, expected `2026-01-01–2040-12-31`; restored PASS.
- V4 `c9a7476`: `tests/v2-coorbital-disclosure.test.mjs`; undone fix FAIL-as-required — input did not match `/patched-conic-versus-patched-conic comparison/`; restored PASS.
- V5 `40dc994`: `tests/v2-stack-assumptions.test.mjs`; undone fix FAIL-as-required — input did not match `/Assumptions: ${MISSION_MODE_LABELS[selectedMode]}; impulsive, patched-conic, no gravity assists, no SEP; 200 km circular LEO/`; restored PASS.
- V6 `07e1670`: `tests/v2-about-evidence.test.mjs`; undone fix FAIL-as-required — input did not match `/anchor: '8-engineering-record-running-log'/`; restored PASS.
- V7 `ab61d82`: `tests/v2-shortcut-and-method.test.mjs`; undone fix FAIL-as-required — input did not match `/['right-drag / middle-drag / Shift+drag', 'pan the view']/`; restored PASS.
- V8 `f77d947`: `src/v2/app/catalog-list/row.test.mjs`; undone fix FAIL-as-required — `The expression evaluated to a falsy value`; restored PASS.
- V9 `6e069ff`: `tests/v2-dla-display.test.mjs`; undone fix FAIL-as-required — input was expected not to match `/showDlaContours\s*\?/`; restored PASS.
- V10 `52cdcd1`: `tests/v2-public-copy.test.mjs`; undone fix FAIL-as-required — input was expected not to match `/Slice\s+\d/`; restored PASS.
- V11 `c60595b`: `tests/v2-golden/launch-vehicles.golden.test.mjs`; undone fix FAIL-as-required — `The expression evaluated to a falsy value`; restored PASS.
- V12 `b3a1ea5`: source revert against `tests/v2-dla-display.test.mjs` FAIL-as-required — input did not match `/effective ceiling is only ~39 deg/`; restored PASS. The separately named `tests/v2-fk3-guided-tour.test.mjs` stayed PASS with the source reverted: CANNOT-FAIL.

All source reverts were isolated and restored in the temporary worktree; no canonical files were mutated.

## C1 — B2 evidence edit

`git show --stat b25acdc` reported 4 files changed: `tier-disclosure.ts`, its test, `tier-sizing-per-body.json`, and `tier-sizing.mjs`.

JSON comparison via a Node UTF-8 script using `git show`:

- added keys: `[]`
- removed keys: `[]`
- changed existing values (8):
  - `generatedAtUtc`: `2026-09-21T05:53:06.567Z` → `2026-10-14T14:25:01.864Z`
  - `records.105140.subReason`: `unmeasured` → `measured-but-unbounded`
  - `records.1979 XB.subReason`: `unmeasured` → `measured-but-unbounded`
  - `records.2010 KD.subReason`: `unmeasured` → `measured-but-unbounded`
  - `records.2021 CG6.subReason`: `unmeasured` → `measured-but-unbounded`
  - `records.2024 BB8.subReason`: `unmeasured` → `measured-but-unbounded`
  - `records.2025 KP4.subReason`: `unmeasured` → `measured-but-unbounded`
  - `records.433.subReason`: `unmeasured` → `measured-but-unbounded`

Verdict: `CHANGED (8 values)`.

## C2 — B5-F06 refutation prints

The following are verbatim numbered prints; no judgment is added here.

`rg -n "B5-F06"`:

```text
831:| B5-F06 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The shipped '~1 m/s-per-degree (JPL DESCANSO Vol. 12 evidence)' figure is not in the committed evidence, which forbids that lift | src/v2/app/porkchop/main.ts:879 (user-facing); also INVARIANTS.md:120 and src/v2/SLICE_13_
```

`tools/slice13-research/literature/3d-verification-record.md` lines 1–60 (file ends at line 34):

```text
1: # Slice 13 — 3d Verification Record (verify-before-lock)
2: 
3: Date: 2026-07-02
4: Passes merged: (1) Perplexity 3d run (strict-format, corrective-line rule); (2) chat direct pass against primary sources (elvperf, Spaceflight Now, JPL DESCANSO, ULA published table via prior session); (3) computation where the claim is arithmetic.
5: Status: research phase CLOSED except items 1–4, 6, 7, which convert to a manual elvperf.ksc.nasa.gov browser query (primary source; public, interactive-only). Query results to be committed as their own measurement artifact.
6: 
7: ## Meta-finding
8: 
9: The Perplexity pass returned UNVERIFIABLE on 12 of 14 items and claimed the NASA LSP query tool is not publicly accessible. That claim is REFUTED: https://elvperf.ksc.nasa.gov is public and maintained (page updated 10 Feb 2026) with a Performance Query page; it requires an interactive browser session, which is why search-based tools cannot read it. Lesson recorded: search-based verification bottoms out at interactive tools and paywalled/offline documents; the residue converts to manual primary-source queries, not more search passes.
10: 
11: ## Per-item outcomes
12: 
13: 1. FH Expendable anchors (15,010 / 12,345 / 10,115 / 6,640 / 4,690 kg at C3 = 0/10/20/40/55) — OPEN → elvperf manual query. Supporting cross-check: Europa Clipper flew FH-Expendable at C3 ≈ 41 with ~6,065 kg vs the claimed 6,640 @ C3=40 (consistent).
14: 2. FH ASDS-Recovery anchors — OPEN → elvperf manual query.
15: 3. Vulcan VC2 anchors — C3=20 point (~3,600–3,700 kg) CONFIRMED against ULA's published TMI figure (TMI defined as C3 = +20 km²/s²; Cutaway Poster / 2023 User's Guide). Remaining points OPEN → elvperf.
16: 4. Vulcan VC6 anchors — C3=20 → 7,600 kg CONFIRMED (same ULA source, exact match). Remaining points OPEN → elvperf.
17:    3/4 note: an earlier verification attempt reported VC2 8,300 / VC4 11,600 / VC6 14,400 kg "at ≈C3=20" — REFUTED: those are ULA's GTO column values (GTO is a bound orbit, C3 ≈ −16), mislabeled as C3=+20. Recorded as this slice's canonical example of orbit-regime mislabeling.
18: 5. Vulcan provenance (RL10C vs RL10E Centaur) — OPEN → note the config labels the elvperf query offers.
19: 6. New Glenn anchors (7,100 / 4,900 / 2,300 at C3 = 0/10/20; →0 near C3 ≈ 25–30; claimed LSP late-2022 estimate) — OPEN → elvperf manual query.
20: 7. Falcon 9 payload-vs-C3, any official public source — OPEN → check whether F9 appears in the elvperf query vehicle list. The current SpaceX Falcon User's Guide (falcon-users-guide-2025-05-09.pdf) is public but is not known to publish C3 anchor tables.
21: 8. IXPE dogleg — CONFIRMED WITH CORRECTION (Spaceflight Now, Dec 2021, Tim Dunn interview): due-east Cape ascent = 28° inclination, removed by second-stage dogleg; >14 t capacity to similar altitude without the plane change; capacity WITH the dogleg and ASDS-recovery propellant reserve ≈ "a little more than a ton." The 330 kg figure is IXPE's spacecraft mass, NOT the post-dogleg capacity — the 3a research PDF conflated them. Corrected anchor: 28° ascent dogleg + recovery reserve ≈ 14 t → ~1 t (≈93% capacity loss).
22: 9. JPL per-degree figure — CONFIRMED, SOURCE IDENTIFIED: JPL DESCANSO Book Series Vol. 12, Low-Energy Lunar Trajectory Design (Parker & Anderson), Ch. 6 (Operations): per-degree-of-inclination-change transfer ΔV cost; establishing a 21-day launch period from a 28.5° LEO parking orbit costs ≈ 71.7 ± 29.7 m/s (1σ) total. The figure is transfer ΔV accommodated via launch/trajectory geometry — NOT an impulsive plane change at LEO speed. Applicability caveat: derived for low-energy lunar transfers; treat as evidence for the two-regime cost structure, not as a liftable formula for interplanetary DLA pricing.
23: 10. Impulsive formula Δv = 2v·sin(Δi/2), costed at the injection burn — CONFIRMED (Perplexity pass; standard astrodynamics texts, Vallado/SMAD class).
24: 11. AIAA S-120 / GSFC gold rules margin clauses — UNVERIFIED at clause level (documents not publicly searchable). Disposition: margin DEC anchors to the confirmed ECSS convention (item 12) instead; S-120/GSFC cited only qualitatively if at all.
25: 12. ECSS margin convention (5% on analytically-derived trajectory maneuvers; 100% on generic stationkeeping/attitude ΔV) — CONFIRMED (Perplexity pass, ECSS margin/contingency guidance).
26: 13. Screening Isp classes (300–350 s storable bipropellant; 2,000–3,000 s SEP) — UNVERIFIED at table level; [Likely] correct as textbook-standard. Disposition: the DEC that fixes the screening Isp discloses it as an assumption; SMAD-class citation attached at commit time or the disclosure says "representative class."
27: 14. LEO 200 km → C3=0 injection ΔV ≈ 3.2 km/s — CONFIRMED BY COMPUTATION: v_circ = √(398600.4418/6578.137) = 7.784 km/s; v_esc = √2·v_circ = 11.008 km/s; Δv = 3.224 km/s. Matches the shipped vis-viva injection line at C3=0. No external source required; the constant is GM_Earth.
28: 
29: ## Two-regime dogleg synthesis (input to the pricing DEC)
30: 
31: - Regime 1 (plane-matching, |DLA| within site azimuth capability — AMBER): cost is launch-geometry accommodation, ~1 m/s-per-degree class per DESCANSO evidence; screening model = small disclosed derate, possibly calibrated against elvperf's own declination handling if the query tool exposes a DLA input (check during the manual query).
32: - Regime 2 (brute-force ascent dogleg — RED): IXPE anchor ≈ 93% capacity loss at 28°; screening-honest treatment is "infeasible at screening fidelity" rather than a precise-looking 2v·sin(Δi/2) charge at LEO speed, which would misprice Regime 1 by ~3 orders of magnitude.
33: - Exact formulation: PROPOSED DEC in the Slice 13 founding doc; Hudson locks.
34: 
```

`INVARIANTS.md` lines 110–125:

```text
110: |----------------|---------------|--------|
111: | `texture.encoding = THREE.sRGBEncoding` | `texture.colorSpace` | Added in r152 |
112: | `texture.encoding = THREE.LinearEncoding` | (same) | Normal/specular maps |
113: | Manual camera controls | `THREE.OrbitControls` from CDN | Not in r128 bundle |
114: | CylinderGeometry + SphereGeometry | `THREE.CapsuleGeometry` | Added in r142 |
115: 
116: ### Launch-feasibility disclosure (INV-016d, `src/v2/SLICE_12_FOUNDING.md` §3)
117: 
118: **INV-016d (honesty extension):** Any launch-feasibility display must disclose, in a discoverable surface, (i) the launch site assumed and its parameters, (ii) the band model used to classify feasibility, and (iii) that dogleg/plane-change costs are advisory and NOT included in the displayed ΔV stack. Same disclosure pattern as INV-016c.
119: 
120: **AMENDED (Slice 13, DEC-13-3 — clause (iii) superseded; clauses (i)–(ii) unchanged):** dogleg cost is now a labeled line in the mission cost card, priced per the two-regime screening model — GREEN: none; AMBER: zero added ΔV with an explicit disclosure that plane-matching is launch-geometry class (~1 m/s-per-degree, JPL DESCANSO evidence), below screening error bars; RED: a "not feasible at screening fidelity" verdict panel, never a fabricated number. The INV-016e disclosure surface states the regime applied to each cell. The vehicle-agnostic ΔV stack panel remains unpriced physics; the two shipped advisory strings were updated in the same commit as this amendment (`src/v2/app/porkchop/main.ts` INV-016d disclosure text, `src/v2/porkchop/porkchop-view.ts` RED advisory). See `src/v2/SLICE_13_FOUNDING.md` §2 / DEC-13-3.
121: 
122: ---
123: 
124: ## §4. Math-layer validation oracles
125: 
```

Audit report lines ±15 around `B5-F06` (lines 816–846):

```text
816: | B4-F01 | Slice 10-11 docs vs code | FACTUAL_ERROR | 4 | "The M=0-only view reproduces cached minC3 within 7.631e-11" was measured on the cache's grid, not the view's; real divergence reaches ~1.8 km^2/s^2 | src/v2/SLICE_11_FOUNDING.md:488 |
817: | B4-F02 | Slice 10-11 docs vs code | FACTUAL_ERROR | 2 | Shipped porkchop page claims "Grid spans 2026-2040 departures" but the grid ends 2040-01-01; 8.11% of the catalog's cached best windows fall outside it | src/v2/app/porkchop/main.ts:637 (and src/v2/SLICE_11_FOUNDING.md:88) |
818: | B4-F03 | Slice 10-11 docs vs code | CONTRADICTION | 0 | OQ-4 states a delta-V stack formula (2 x sqrt(C3)) that contradicts DEC-7 and the shipped code (2 x vInfArr); the two differ by 12.8 km/s on Apophis's best cell | src/v2/SLICE_11_FOUNDING.md:63 vs :113-118 and src/v2/porkchop/delta-v.ts:26-42 |
819: | B4-F04 | Slice 10-11 docs vs code | CONTRADICTION | 0 | Slice 10 Section 7 lists Phase C.2/C.3/C.4 as PENDING two lines above Phase D/E recording them verified and deployed; the audit's own F9 "Phase C status text drift - Refreshed" was | src/v2/SLICE_10_FOUNDING.md:455,475-477 vs :479-487,490-496; audit record :424 |
820: | B4-F05 | Slice 10-11 docs vs code | CONTRADICTION | 0 | Slice 10's close note claims "All eight measurement OQs are closed (OQ-1 through OQ-8)"; OQ-1 is open, OQ-6 does not exist in the slice, and two of the rest are not measurements | src/v2/SLICE_10_FOUNDING.md:500 (vs :165-171 and :453) |
821: | B4-F06 | Slice 10-11 docs vs code | FUNDAMENTALLY_FALSE | 0 | DEC-6's locked evidence ("dv=6 km/s ⇒ C3≈25, benchmark-compatible with NHATS's accessible-target population") is contradicted by the repo's own NHATS cache and was never amended af | src/v2/SLICE_10_FOUNDING.md:137 |
822: | B4-F07 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | DEC-4's performance arithmetic understates the screening solve count by ~180x and quotes a WASM per-solve time for a path that was never built | src/v2/SLICE_10_FOUNDING.md:123 |
823: | B4-F08 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | AMD-7 records the wrong units for the worker's solver zone and contradicts AMD-1 | src/v2/SLICE_11_FOUNDING.md:257 vs :200 |
824: | B4-F09 | Slice 10-11 docs vs code | STALE | 0 | SLICE_11 Section 8 still reports the overlay's fixed M:1 divergence as OPEN; the overlay now passes M:0 with the DEC-5 contour toggle | src/v2/SLICE_11_FOUNDING.md:492 |
825: | B4-F10 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | The live Slice 10 fixture spec, NOTICE and research README all point the long-span Horizons fixture at a path that no longer exists | src/v2/boundary/slice10-fixture-spec.md:9 (also src/v2/SLICE_10_FOUNDING.md:347, NOTICE:41 |
826: | B4-F11 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | DEC-11C-5's span requirement ("Earth samples must extend to ~2045") is wrong, and the fixture adopted to satisfy it stops at 2040-12-31 | src/v2/SLICE_11_FOUNDING.md:161 and :168 (amendment) |
827: | B5-F01 | Slice 12-13 DLA & launch vehicles | FUNDAMENTALLY_FALSE | 2 | DLA research summary still instructs the obliquity rotation DEC-12-2 forbids, with no erratum | tools/slice12-research/DLA_RESEARCH_SUMMARY.md:39-48 (also :69, :75) |
828: | B5-F02 | Slice 12-13 DLA & launch vehicles | FUNDAMENTALLY_FALSE | 0 | The inverted feasibility inequality survives uncorrected in §4 of the DLA research summary (fourth resurrection) | tools/slice12-research/DLA_RESEARCH_SUMMARY.md:54 (and :30-32) |
829: | B5-F03 | Slice 12-13 DLA & launch vehicles | CODE_BUG | 0 | measure-earth-vz.mjs compares m/s against km/s, so the committed per-year table is each year's last sample, not its maximum | tools/slice12-research/measure-earth-vz.mjs:130 (artifact: tools/slice12-research/data/ear |
830: | B5-F04 | Slice 12-13 DLA & launch vehicles | STALE | 0 | SLICE_13_FOUNDING records the New Glenn C3=5 anchor as landed and 'Parked: nothing'; it was reverted and is parked as Cleanup C8 | src/v2/SLICE_13_FOUNDING.md:100 |
831: | B5-F06 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The shipped '~1 m/s-per-degree (JPL DESCANSO Vol. 12 evidence)' figure is not in the committed evidence, which forbids that lift | src/v2/app/porkchop/main.ts:879 (user-facing); also INVARIANTS.md:120 and src/v2/SLICE_13_ |
832: | B5-F07 | Slice 12-13 DLA & launch vehicles | CONTRADICTION | 0 | DEC-12-4 locks the DLA toggle default OFF; production ships it ON with no §5a amendment | src/v2/SLICE_12_FOUNDING.md:91 vs src/v2/app/porkchop/main.ts:313 |
833: | B5-F08 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The M=1 artifact claims the dead branch counter was removed in schemaVersion 2; the committed file is still schemaVersion 1 with the counter present | tools/slice12-research/data/dla-oracle-m1-vectors.json:99 (deadCounterNote); target tools/ |
834: | B5-F09 | Slice 12-13 DLA & launch vehicles | FACTUAL_ERROR | 0 | The 3d verification record dates the elvperf page '10 Feb 2026'; every committed screenshot says 29 February 2024 | tools/slice13-research/literature/3d-verification-record.md:9 |
835: | B5-F10 | Slice 12-13 DLA & launch vehicles | PROCESS_VIOLATION | 0 | Decision-closing audit reports cited by both founding docs are untracked and never existed on any ref (INV-034) | src/v2/SLICE_13_FOUNDING.md:84 and :98; src/v2/SLICE_12_FOUNDING.md:110 and :168 |
836: | B5-F11 | Slice 12-13 DLA & launch vehicles | PROCESS_VIOLATION | 0 | The INV-016d disclosure, site picker and band legend are hidden behind the DLA toggle while the feasibility verdict is not | src/v2/app/porkchop/main.ts:669-703 vs src/v2/porkchop/porkchop-view.ts:1319, :1418-1431, |
837: | B5-F12 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The fixture sha256 cited by the 2026-09-22 vZ correction cannot be reproduced from the repository | src/v2/SLICE_12_FOUNDING.md:172; tools/slice12-research/data/earth-vz-span-max.json (fixtu |
838: | C1-F06 | catalog & data boundary | STALE | 2 | Slice 8 fixture spec describes field names and an example record that do not match the fixture and would fail ingestion | src/v2/boundary/slice8-fixture-spec.md:253-277,296-298,359-365 |
839: | C1-F07 | catalog & data boundary | STALE | 2 | Slice 7 fixture spec requires conditionCode/dataArcDays (absent from the fixture), omits fields ingestion requires, and names loader.ts as the consumer (no longer true) | src/v2/boundary/slice7-fixture-spec.md:14,74-99,112-124 |
840: | C2-F06 | Slice 18 fidelity tiers | STALE | 2 | STATUS's Slice 18 row and git-state table still describe the close-out branch as unmerged and list bundle names no longer in docs/ | STATUS.md:45 (Slice 18 row), :26, :28 |
841: | C2-F07 | Slice 18 fidelity tiers | CODE_BUG | 2 | Catalog list renders 'No bodies match the current filters.' when the tier artifact fails to load or arrives after the screen cache | src/v2/app/catalog-list/panel.ts:79-81, :86-100, :539-548 |
842: | C3-F01 | Slice 17 compare & QOL | FUNDAMENTALLY_FALSE | 4 | The §1 thesis sentence misstates the measured sample: 163693 has the WORST minimum C3 of the five, not the second-best | SLICE_17_FOUNDING.md:48-51 |
843: | C3-F04 | Slice 17 compare & QOL | PROCESS_VIOLATION | 2 | The founding doc's §9 binding "DEC-17-4's quality copy may not ship without [the MPC spot check]" was violated by the A4c ship, and no §8 entry records a waiver | SLICE_17_FOUNDING.md:673-677 (also :668 and §8:417-418) |
844: | C3-F05 | Slice 17 compare & QOL | PROCESS_VIOLATION | 2 | DEC-17-5 (LOCKED) clauses are not implemented on /v2/compare/ and were not recorded as residuals when Front A was declared CLOSED | SLICE_17_FOUNDING.md:197-209 (DEC-17-5), §4:305-310; STATUS.md:44 |
845: | C4-F02 | renderer & physical constants | FUNDAMENTALLY_FALSE | 2 | 25.19 deg and 26.7 deg are obliquities to the orbital plane, used as angles from the ICRF Z axis; the repo's own kernel pole data is never read | src/v2/render/saturn-rings.md:24; src/v2/render/mars-oblate.md:9; src/v2/app/solar-system/ |
846: | C4-F04 | renderer & physical constants | FUNDAMENTALLY_FALSE | 2 | The 'explicit renderOrder=0 breaks transparent rendering' mechanism is impossible in three.js, and two tests enforce a source ban derived from it | V2_FOUNDING_DOCUMENT.md:1422; enforced at tests/v2-slice5-cutover.test.mjs:119-126 and tes |
```

## C3 — R7 classification

R7 rows for every New Glenn and Vulcan anchor:

```text
19: | Vulcan | VC2 | 0 | 5920 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
20: | Vulcan | VC2 | 10 | 4750 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
21: | Vulcan | VC2 | 20 | 3710 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
22: | Vulcan | VC2 | 30 | 2790 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
23: | Vulcan | VC2 | 40 | 1970 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
24: | Vulcan | VC2 | 55 | 945 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
25: | Vulcan | VC4 | 0 | 8550 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
26: | Vulcan | VC4 | 10 | 7140 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
27: | Vulcan | VC4 | 20 | 5880 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
28: | Vulcan | VC4 | 30 | 4780 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
29: | Vulcan | VC4 | 40 | 3800 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
30: | Vulcan | VC4 | 55 | 2555 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
31: | Vulcan | VC6 | 0 | 10850 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
32: | Vulcan | VC6 | 10 | 9130 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
33: | Vulcan | VC6 | 20 | 7630 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
34: | Vulcan | VC6 | 30 | 6310 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
35: | Vulcan | VC6 | 40 | 5150 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
36: | Vulcan | VC6 | 55 | 3685 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
37: | New Glenn | Standard | 0 | 7180 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
38: | New Glenn | Standard | 10 | 4930 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
39: | New Glenn | Standard | 20 | 2365 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
40: | New Glenn | Standard | 30 | 120 | NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 | official |
```

`src/v2/porkchop/launch-vehicles.ts` lines 1–60:

```text
1: /**
2:  * Slice 13 launch-vehicle screening data and pure math.
3:  *
4:  * Vehicle payload curves are NASA LSP elvperf primary-source anchors (as-of 2024-02-29,
5:  * queried 2026-07-02). Curves interpolate only between sourced anchors; no extrapolation.
6:  * New Glenn keeps all four sourced anchors, including 120 kg at C3=30 km^2/s^2.
7:  * NG C3=21-29 interior optimistic (linear across steep segment); densification anchors
8:  * at C3=25/35 pending, oracle to quantify.
9:  *
10:  * DEC-13-4 double-count guard: deliveredMassKg intentionally has no injection field in
11:  * its input budget. Payload-at-C3 already includes the launch vehicle injection to C3.
12:  */
13: 
14: export interface LaunchVehicle {
15:   readonly name: string;
16:   readonly config: string;
17:   readonly site: string;
18:   readonly fairingM: number;
19:   readonly curve: ReadonlyArray<LaunchVehicleAnchor>;
20:   readonly source: string;
21:   readonly asOf: string;
22: }
23: 
24: export interface LaunchVehicleAnchor {
25:   readonly c3: number;
26:   readonly payloadKg: number;
27:   readonly basis: 'official' | 'estimated';
28: }
29: 
30: export type MissionMode = 'one-way' | 'sample-return';
31: 
32: export interface SpacecraftDvBudget {
33:   /** Rendezvous maneuver, m/s. For one-way missions this is |vInf_arr|. */
34:   readonly rendezvousMps: number;
35:   /** Generic stationkeeping allocation, m/s. Slice 13 uses 150 m/s. */
36:   readonly stationkeepingMps: number;
37:   /** ECSS-anchored deterministic margin, m/s. */
38:   readonly marginMps: number;
39:   /** Departure maneuver, m/s. Used only in sample-return mode. */
40:   readonly departureMps?: number;
41: }
42: 
43: export const BEYOND_CURVE = Object.freeze({ kind: 'beyond-curve' } as const);
44: export type BeyondCurve = typeof BEYOND_CURVE;
45: export const NON_FINITE_C3 = Object.freeze({ kind: 'non-finite-c3' } as const);
46: export type NonFiniteC3 = typeof NON_FINITE_C3;
47: export type PayloadAtC3Result = number | BeyondCurve | NonFiniteC3;
48: 
49: // Phase F audit MED-2: a corrupted ΔV budget is NOT a curve statement — returning
50: // BEYOND_CURVE for it would assert a falsehood under INV-023. Distinct sentinel,
51: // same frozen-singleton construction so arithmetic on it is a compile error.
52: export const INVALID_INPUT = Object.freeze({ kind: 'invalid-input' } as const);
53: export type InvalidInput = typeof INVALID_INPUT;
54: export type DeliveredMassResult = number | BeyondCurve | InvalidInput | NonFiniteC3;
55: 
56: // DEC-13-5: representative of 300-350 s storable bipropellant class; disclosed per INV-016e.
57: export const SCREENING_ISP_S = 320;
58: // DEC-13-6: 5% ECSS-anchored margin on deterministic maneuver lines.
59: export const DETERMINISTIC_MARGIN_FRACTION = 0.05;
60: // DEC-13-6: generic stationkeeping allocation, not included in deterministic margin.
```

Keyword scan:

```text
5: * queried 2026-07-02). Curves interpolate only between sourced anchors; no extrapolation.
7: * NG C3=21-29 interior optimistic (linear across steep segment); densification anchors
27:   readonly basis: 'official' | 'estimated';
```

## C4 — R13 accounting

```text
C5-F15
SHA changed it: c9a7476
6575d0d lines 67-72:
67:         'Bodies marked co-orbital (cyan tint in the 3D view) have orbits very similar to ' +
68:         "Earth's — low eccentricity, low inclination, semi-major axis within 0.05 AU of 1 AU. " +
69:         'The Keplerian propagation that drives this screen diverges from full N-body truth for ' +
70:         'these bodies, by up to ~1 km/s on v∞_dep over a 4-year horizon (OQ-7). For most ' +
71:         'co-orbital targets the divergence is small, but the tag is a flag to treat the ' +
72:         'numbers with extra caution and re-validate before committing to a mission profile.',
bd9d6f5 lines 67-72:
67:         'Bodies marked co-orbital (cyan tint in the 3D view) have orbits very similar to ' +
68:         "Earth's — low eccentricity, low inclination, semi-major axis within 0.05 AU of 1 AU. " +
69:         'Both the catalog and comparison screens use patched-conic propagation; this is a ' +
70:         'patched-conic-versus-patched-conic comparison, not an N-body truth run. For co-orbital ' +
71:         'targets the approximation can diverge materially, so the tag is a flag to treat the ' +
72:         'numbers with extra caution and re-validate before committing to a mission profile.',

C5-F17 about number
SHA: unchanged since 6575d0d
6575d0d lines 377-379:
377:           'Aster is a browser-based asteroid mission-planning tool. It computes Earth-departure launch windows as porkchop plots from a re-derived Lambert solver, screens each window against launch-site geometry (the declination of the launch asymptote), and prices delivered mass against published launch-vehicle performance curves — across a catalog of ',
378:           SLICE9_NEA_CATALOG_TOTAL_BODIES.toLocaleString(),
379:           ' near-Earth objects. Where a result depends on an assumption, or falls outside a validated range, the tool states that rather than showing a confident number.',
bd9d6f5 current lines 388-390:
388:           'Aster is a browser-based asteroid mission-planning tool. It computes Earth-departure launch windows as porkchop plots from a re-derived Lambert solver, screens each window against launch-site geometry (the declination of the launch asymptote), and prices delivered mass against published launch-vehicle performance curves — across a catalog of ',
389:           SLICE9_NEA_CATALOG_TOTAL_BODIES.toLocaleString(),
390:           ' near-Earth objects. Where a result depends on an assumption, or falls outside a validated range, the tool states that rather than showing a confident number.',
The imported constant is `src/v2/boundary/slice9-nea-catalog.ts:20`, `SLICE9_NEA_CATALOG_TOTAL_BODIES = 41_906`.

C5-F17 porkchop grid-span literal
SHA changed it: 446e3a7
6575d0d line 645:
645:         `Transfer search from Earth departure to ${pageState.bodyLabel}, over both revolution families — M=0 (direct) and M=1 (one revolution). Grid spans 2026–2040 departures and 182.5–1826.25 day flight times. Use the transfer-family control to switch; click a cell to inspect its family, branch and ΔV stack.`,
bd9d6f5 line 647:
647:         `Transfer search from Earth departure to ${pageState.bodyLabel}, over both revolution families — M=0 (direct) and M=1 (one revolution). Grid spans ${PORKCHOP_DEPARTURE_SPAN_LABEL} departures and ${GRID_PARAMS.tofMinDays}–${GRID_PARAMS.tofMaxDays} day flight times. Use the transfer-family control to switch; click a cell to inspect its family, branch and ΔV stack.`,
```

## C5 — protected founding-document edits

Canonical `git diff -- ... | Select-String '^-` produced only:

```text
--- a/src/v2/SLICE_12_FOUNDING.md
--- a/src/v2/SLICE_19_5_FOUNDING.md
```

Full added text:

`src/v2/SLICE_12_FOUNDING.md`

```text

AMENDMENT (Slice 19.5, 2026-10-14; audit B5-F07; ruling R5): the toggle default
is amended to ON, matching production and the Slice 13 guided tour (Replay
restores DLA-on). DEC-12-4's rationale ("Toggle default OFF (matches contour-overlay precedent) so the base heatmap stays unobscured.") is
correctness satisfied by src/v2/SLICE_12_FOUNDING.md:59-60. The
INV-016d disclosure renders regardless of the toggle (ruling R6).
```

`src/v2/SLICE_19_5_FOUNDING.md`

```text

### §9.1 Phase 0 ruling record — 2026-10-14 (Hudson)
- Ruling packet: tools/audit/sanity-69472a3/phase0/RULINGS.md (Nova, 2026-10-13, with
  Addendum 1 of 2026-10-14), accepted in full by Hudson 2026-10-14.
- Dispositions: tools/audit/sanity-69472a3/phase0/TRIAGE.md, as reclassified by
  RULINGS.md §2. In §6, "Front B: every FIX-USER row" means the visitor-visible rows
  (RULINGS.md §2a: 30 firm + 3 conditional). The other 27 B-routed and 4 G-routed
  rows are re-routed per RULINGS.md §2b; none are dropped (86 in, 86 out).
- Unverified rows: any disposition on a row marked "audit only (unverified)" is a
  hypothesis; fixing dispatches verify at HEAD first.
- R1 INV-008..011: amend to test-time enforcement (Front C, INVARIANTS [P]).
- R2 INV-014: namespace 014a (8.5 star background) / 014b (9 three-gate tier); the
  index stays authority (Front C).
- R3 INV-035/036: proposals take the next free IDs; 035/036 stay skipped (Front C).
- R4 SLICE_11:63: annotated superseded by DEC-7; code matches DEC-7 (Front C).
- R5 DEC-12-4 default: AMEND-ON; rationale quoted in the S19.5 A+B batch log.
- R6 INV-016d: code fixed; disclosure renders whenever a verdict renders.
- R7 INV-022: basis field added to all 38 anchors.
- R8 DEC-17-4 MPC spot check: to be run (sample → Clome → Hudson); result appended
  to SLICE_17_FOUNDING.md §9. Not a waiver.
- R9 DEC-17-5 on compare: fixed in F2; moves to Front B if F2 is cut.
- R10 INV-001 atmosphere: amend to "shares its body's figure and orientation";
  implemented in Front G (Slice 22).
- R11 earth-moon camera-relative: recon in Front G before ruling.
- R12 prototype ring profile: annotate as procedural/unsourced/not shipped;
  docs/ check result: no hits.
- R13 INV-025/INV-026: code fixed.
- R14 DEC-15-8 / INV-027 (MCP): fix in Slice 20 (math layer, audited).
- R15 DEC-16-8: compute the registered contrast in Slice 21 D; never amend the
  pre-registration; README carries the pending sentence.
- B5-F06 "~1 m/s-per-degree": REFUTED (evidence cited in batch log).
- DEC-19.5-2 LOCKED as amended: "A disposition on a row marked audit only
  (unverified) is a hypothesis. The fixing dispatch verifies at HEAD first and may
  reclassify to ALREADY-FIXED/REFUTED with evidence. Reclassification across fronts
  requires Hudson's ruling."
- DEC-19.5-3, -4, -5, -6, -7, -8: LOCKED as drafted in §3.
- STATUS: this founding document is LOCKED as of 2026-10-14. This line supersedes
  the DRAFT header, which stays unedited under the additive rule.
```

## Surprising findings

- V12’s map/revert test fails as required, but the separately named FK3 guided-tour proof test is green with the source fix undone.
- C1’s JSON has no added or removed keys, but `generatedAtUtc` and seven existing `subReason` values changed.
- The canonical protected diff is additive-only and contains no removed content beyond the two diff header lines.
