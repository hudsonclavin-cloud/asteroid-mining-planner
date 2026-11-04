RECON: COMPLETE
COMMIT: evidence-only commit "research(slice20): pre-research recon (read-only)" on branch s20-recon (its sha is the branch tip; a file cannot contain the hash of the commit that adds it)
ENDPOINT VERDICT: SWAP+NEW-PATHS (the kernel swaps with zero edits and bit-identical output, but Earth must be read at arrival epochs (fixture ends 2040-12-31, existing lookup ~10x slower), v-inf vectors are stripped at the worker boundary, and selection/segmentation/support are keyed to departure C3 and arrival epoch)
OQ-19-4 IMPACT: 7,400 of 41,905 catalog best windows (17.7%; 72.9% of the 10,150 L1 bodies, the only bodies with a boundary) arrive after support; live compare grid 7,211 of 10,150 L1; compare example set 1 of 3
ORACLE PATH: REUSE-HARNESS (poliastro 0.17 runs here in ~/.aster-slice11-venv and matched 90 return-direction cells to 2e-15; only a thin vector-emitting driver is new)

# S20_01 pre-research recon: Slice 20 (Return Leg)

Read-only on code. Run 2026-11-03 on main at `ab03126` (== origin/main), Claude Code, Hudson's laptop
(Intel Core Ultra 7 255H, 16 cores, node v26.7.0; DEC-17-2's 1.4 s figure was Hudson's M1). Scratch scripts and
compiled output live only in `%TEMP%\s20-recon\scratch\` and are not committed. Compiled with
`process.execPath` + `node_modules/typescript/bin/tsc` into scratch, imported read-only. Nothing was installed.
"Verified" below means I ran it or read the cited line; "UNVERIFIED" means neither.

## R1. Endpoint symmetry

Nova's hypothesis is **confirmed for the kernel and incomplete for the feature.** Test: the unedited
`computePorkchopGrid` was fed swapped providers (asteroid state at departure through `getEarthStateAtTdbSeconds`,
Earth state at arrival through `propagateTargetStateAtTdbSeconds`). The `vInfArr` field then holds the Earth-arrival
|v-inf| and `vInfDep` the asteroid-departure |v-inf|. Minimum values were float-identical to an independent loop for
433, 99942 and 2000 SG344 (`scratch\r2c.mjs`, `r2c-result.json`). Separately, 90 return-direction cells solved by
`lambertMultiRev` and by poliastro 0.17 `izzo.lambert` agree to 1.75e-15 (relative, velocity vectors; R6).

| Where (file:line) | What it assumes | Return leg needs |
|---|---|---|
| `core/lambert/lambert-multi-rev.ts:276-336` | generic `(r1, r2, tof, mu, M, lw)`; no Earth code. `lw` is passed to `buildGeometry` as `prograde` (:291, :50, :83-87). Sense is "counter-clockwise about ICRF +Z" via the `iH[2]` sign (:74-81). `M` in {0,1,2} only (:284-286); x² > 0.90 fails closed (:12, :161-196) | (i) nothing |
| `core/lambert/izzo.ts:60-145` | same; M=0 only (:77-82); `prograde` defaults true (:68). Not used by the grid | (i) |
| `porkchop/grid-compute.ts:57-65, 175-194` | provider names are Earth/target; Earth read at DEPARTURE (:177), target at ARRIVAL (:184); `r1 = Earth, r2 = asteroid` (:187-194), `true` = prograde (:193) | (ii) a direction parameter, or provider injection (tested, zero edits) |
| `grid-compute.ts:104-137` | `vInfDep = v1 - Earth velocity` (:113-115); `vInfArr = v2 - asteroid velocity` (:116-118); DLA from `vInfDep` (:121). Output is magnitudes plus raw `v1`, `v2` (:130-131); the subtracted velocity is not returned | (iii) a vector output field |
| `grid-compute.ts:139-155` | branch selection by `c3 = vInfDep²` (:148) (AMD-2) | (iii) a return selection key |
| `porkchop/porkchop.worker.ts:73-86, 111-118, 138-141` | `stripBranch` drops `v1`, `v2`; Earth series arrives once by `init` and is read with `interpolateBodyStateSeries` | (iii) vectors must cross the worker message |
| `porkchop-client.ts:94-114`, `dual-m-compute.ts:48-65` | message is `{bodyId, bodyElements, gridParams, M}`; no direction field; one compute in flight (:99-101) | (ii) a direction field |
| `composite-grid.ts:69-75, 122-132`; `segment-windows.ts:20-21, 110-118` | per-cell scalar is selected-branch **departure C3**; family chosen by lower C3 | (iii) a return scalar (Earth-arrival v-inf or ΔV) |
| `porkchop/support-boundary.ts:44-51` | unsupported iff `depJD + tofDays >= encounter.jd` | (ii) epoch selector (R4) |
| `porkchop/delta-v.ts:32-34, 43-45` | `departureDvFromVInf(v) = v` (symmetric-return) | (i) untouched by design; K1 reports the real number alongside |
| `boundary/lambert-screen-cache.ts:15-18, 43-49`; `tools/build/precompute-lambert-screen.mjs:184-196, 241` | cache is outbound only; Earth states precomputed at departure dates only | (iii) new artifact if a return screen is wanted |
| `app/compare/main.ts:118-131`; `app/porkchop/main.ts:198-205` | fixed outbound grids (compare M=0, 731x100; porkchop 200x100) | (iii) panel/params |
| `mcp/src/tools/compute-shared.ts:61-99`; `explain-cell.ts:136`, `dla-feasibility.ts:117`, `estimate-mission-cost.ts:161` | same provider shape; Earth read at departure; v-inf vector re-derived as `v1 - Earth velocity` | (iii) tool surface (R8) |
| `core/lambert/dla.ts:19-30` | takes v-inf components, unit-agnostic, ICRF equatorial-aligned (:1-13) | (i) arithmetic; (ii) arrival sign convention |

**Which velocity, at which epoch.** Outbound: `vInfDep` subtracts Earth at the departure epoch; `vInfArr` subtracts
the Keplerian asteroid at the arrival epoch. Swapped: `vInfDep` is the asteroid at departure, `vInfArr` is Earth at
arrival.

**Providers and bounds.** Earth: `interpolateBodyStateSeries` (`core/interpolators/hermite.ts:82-122`) scans
samples linearly (:102-108) and fails an invariant outside the range (:110-121). The fixture
`src/v2/data/horizons-inner-solar-system-2026-2040.json` (7,214,102 B, sha256 `b278dd55…`) holds JD 2461041.5 to
2466519.5 (2026-01-01 to 2040-12-31), 5,479 daily samples; DEC-17-10 (`SLICE_17_FOUNDING.md:265-279`) records the same
bounds. Verified: a return grid over the compare window throws "INV-008 … outside available sample range" and, if
out-of-span cells were skipped instead, 9,329 of 73,100 (12.76%) would be lost. Asteroid: `propagateKeplerianStateVectors`
is analytic and was called at 2026-2035 departure epochs without error. DEC-17-10's premise (Earth read "solely at
departure", `compare-data.ts:91-98`) no longer holds for a return leg: the bounds check there covers only the
departure window (`compare-data.ts:270-286`).

Latest Earth-arrival epoch the return needs (computed, `scratch\r1-epochs.mjs`; fixture end JD 2466519.5):

| Case | Latest Earth arrival | Past fixture end |
|---|---|---|
| A. return-departure window = compare/porkchop window (to 2040-01-01), TOF <= 1826.25 d | 2044-12-31 (JD 2467980.75) | 1,461.25 d (4.00 yr) |
| B. chained: outbound dep <= 2040-01-01, outbound TOF <= 1826.25, stay 0, return TOF <= 1826.25 | 2049-12-31 (JD 2469807.0) | 3,287.5 d (9.00 yr) |
| C. B plus a 730.5 d return-departure window (as R3) | 2052-01-01 (JD 2470537.5) | 4,018 d (11.0 yr) |

Largest return-departure end that keeps TOF 1826.25 inside the fixture: 2035-12-31 (JD 2464693.25).

**DLA analogue.** None is computed today. `dlaDegFromVInf` works on any v-inf components, so the arrival value would
come from `v2 - Earth velocity at arrival` (the Earth velocity must be supplied; the grid does not return it). Sign
convention is open: the incoming asymptote direction is `-v-inf`, so |declination| is unchanged and the signed value
flips. (Reasoning, not measured.)

**Answer: SWAP+NEW-PATHS** (verdict line above): solver and grid kernel are swap-only; the surrounding system needs an
indexed Earth lookup and a longer Earth span, a vector output contract across the worker, a return selection scalar,
and an epoch-selectable support rule.

## R2. Compute budget

Return-direction grid, 731x100, TOF 182.5-1826.25 d, M=0, departures 2026-01-01 to JD 2464693.25 (so every arrival
is inside the Earth fixture), repo solver and repo providers. Medians of 3 unless noted (`r2-result.json`,
`r2b-result.json`, `r2c-result.json`).

| Body | Existing Earth lookup (swapped `computePorkchopGrid`, median of 2 runs, larger shown) | Indexed (bisection) Earth lookup, same function | Outbound baseline (compare window) |
|---|---:|---:|---:|
| 433 Eros | 2714.9 ms | 145.0 ms | 265.5 ms |
| 99942 Apophis | 2735.9 ms | 199.3 ms | 278.6 ms |
| 2000 SG344 | 2685.2 ms | 221.4 ms | 280.3 ms |

- Converged-cell fraction (M=0): 73,100 / 73,100 = 1.000 for all three, both directions.
- Min Earth-arrival v-inf over the whole window: 433 **1.3495** km/s; 99942 **0.1043** km/s; 2000 SG344 **0.0387** km/s
  (M=1: 1.1962 / 0.1218 / 0.0349).
- Five bodies (433, 99942, 2000 SG344, 101955, 163693): outbound 1,363.6 ms on this machine (DEC-17-2 records
  1,431.52 ms on Hudson's M1, `SLICE_17_FOUNDING.md:126-130`); the same five return-direction with the existing
  lookup 13,712 ms (10.1x).
- The cost is the lookup, not the solver. Earth interpolation was 2,432-2,626 ms of 2,587-2,801 ms in a
  hand-written loop; the solver and asteroid propagation are about 100-150 ms. The indexed lookup gives identical
  Earth states (max abs diff 0 over 200 random epochs).
- An allocation-free min-only loop with the indexed lookup: 95.8 / 95.8 / 150.2 ms (M=0), 288-377 ms (M=1). Not
  comparable to `computePorkchopGrid`, which builds cell objects.
- DEC-17-10 check: the compare window itself cannot be used (INV-008 throw; 12.76% of cells past the fixture end).

Budget only; not a validation. **Answer: with an indexed Earth lookup a return grid costs about what an outbound grid
does (145-221 ms/body, M=0); with the existing lookup it costs about 10x (2.7 s/body), i.e. ~13.7 s for compare's five.**

## R3. Symmetric-assumption error (preview)

**Exploratory, unvalidated; for sizing only.** Outbound: `computePorkchopGrid`, compare window, M=0. Two "best"
choices per body: the cell minimizing the sample-return ΔV stack (`buildDeltaVStack(..., 'sample-return')`) and the
min-C3 cell. Return window: outbound arrival to +730.5 d (731 columns, 1 d), TOF 182.5-1826.25 d (100), arrival
clipped at the Earth fixture end (skipped cells counted), M=0 and M=1 (`r3-result.json`). All figures km/s.

Three quantities per row. **Assumed** = what the code charges (`departureDvFromVInf` = outbound `vInfArr`). **Computed
asteroid-departure v-inf** is the like-for-like quantity the assumption stands in for. **Computed Earth-arrival
v-inf** is K1's quantity (not a departure burn).

| Body | Outbound window (dep, TOF d) | Assumed return dep. | Min computed asteroid-dep. v-inf M=0 / M=1 | Min computed Earth-arrival v-inf M=0 / M=1 |
|---|---|---:|---:|---:|
| 433, min-C3 | 2032-06-11, 265.5 | 6.905 | 3.034 / 1.795 | 1.336 / 1.956 |
| 433, best stack | 2035-01-19, 365.1 | 1.146 | 2.254 / 1.223 (17,297 of 73,100 cells span-skipped, biased high) | 2.683 / 1.636 |
| 99942, min-C3 | 2028-08-24, 232.3 | 5.841 | 1.092 / 1.102 | 0.0092 / 0.0074 |
| 99942, best stack | 2029-04-12, 182.5 | 0.103 | 1.972 / 1.565 | 1.004 / 0.540 |
| 2000 SG344, min-C3 | 2027-08-05, 282.1 | 1.389 | 0.148 / 0.131 | 0.0719 / 0.0623 |
| 2000 SG344, best stack | 2028-05-11, 298.7 | 0.0640 | 0.2244 / 0.3084 | 0.1423 / 0.0766 |

Reading: the assumption **overcharges** at min-C3 windows (outbound arrival v-inf is large) and **undercharges** at the
windows sample-return mode would actually pick (low outbound arrival v-inf), because those windows are chosen under the
assumption. The error changes sign. At the cell minimizing Earth-arrival v-inf, the asteroid-departure v-inf is large
(e.g. 99942 min-C3 row: 5.83), so the two minima are not simultaneously reachable; a joint objective is needed. A
minimum stay is not modelled (return window starts at arrival).

**Answer: against the computed asteroid-departure minimum, the symmetric charge is off by 0.08-5.1 km/s across these
six rows (both M families), in both directions; it should be treated as a placeholder, and the 'best sample-return
window' it selects is biased.**

## R4. Support semantics

What it states. `support-boundary.ts:1-11`: an L1 body's screening is supported only up to the close approach that makes
its tier material; unsupported means arrival at or after the encounter. The user sentence is "Arrival is after this
object's … encounter. This cell is computed from an orbit that encounter invalidates." (`:59-64`). It is a statement
about **the asteroid's Keplerian orbit**, because arrival is the one epoch at which `grid-compute.ts:184` evaluates it
(departure reads only Earth, `:177`). It is not about Earth encounters or the Lambert arc.

Governing text. DEC-18-6 (`SLICE_18_FOUNDING.md:95-103`): material = predicted drift > 10^6 km, instrument = computed
δv. DEC-18-7 (`:109-113`): cells arriving after a body's "materially perturbing encounter" are de-emphasized, never
suppressed ("no opportunity" and "not assessed" differ). The artifact's `encounter` is the EARLIEST row after the element
epoch whose own added drift reaches 10^6 km (`boundary/tier-assignments.ts:29-35`; corrected at `d496532`, addendum
`SLICE_18_FOUNDING.md:237`). OQ-19-4 (`SLICE_19_FOUNDING.md:204-206`): "applied to arrival, not departure". X2
(`SLICE_19_5_FOUNDING.md:453-454`): compare flags and does not re-rank. `INVARIANTS.md` has no support text (grep empty).

Compare's flag is inline text at `app/compare/main.ts:744-750, 812-830`; the dedicated page marks cells
(`porkchop-view.ts:848, 870, 1319-1323, 1421, 1489-1495`).

For a return leg the asteroid state is read at **departure**, so the epoch that should govern support is the
**asteroid departure** (and for a chained mission the later of outbound arrival and return departure, which is the
return departure). Earth arrival is governed by the Earth fixture span instead (R1), not by support.

**Answer: support is about the epoch at which the asteroid's elements are evaluated; for a return leg that is asteroid
DEPARTURE, not Earth arrival.**

## R5. OQ-19-4 impact

Data: `tests/fixtures/v2/lambert-screen-cache.json` (41,906 bodies; 41,905 with `bestWindows`; 7 d x 30 d grid,
2026-01-01 to 2040-12-31), tier artifact `docs/tier-sizing-per-body.json` (sha256 `dff569ab…`, identical to
`tools/slice18-research/`; L2 31,745 / L1 10,150 / L0 11; all 10,150 L1 have an `encounter`). Arrival =
`launchDate + tofDays`, same rule as `support-boundary.ts:49-51`.

| Measure | Count |
|---|---:|
| Catalog best window (`bestWindows[0]`) arrives at/after support | **7,400** of 10,150 L1 (72.9%) = 17.7% of 41,905 |
| Any of a body's 5 cached windows arrives after support | 8,867 of 10,150 L1 |
| Of the 7,400: at least one supported window inside the cache's own top 5 | 1,593 |
| Of the 7,400: best window departs in 2040 (outside the compare/porkchop departure window) | 661 |
| Live compare grid (731x100, M=0) for all 10,150 L1: raw min-C3 cell arrives after support | **7,211** (71.0%) |
| ...of those: any supported converged cell exists | 6,655 |
| ...supported minimum C3 <= 25 km²/s² (cache feasibility threshold) | 6,219 |
| ...supported minimum C3 <= live min + 5 (compare's relative threshold) | 4,930 |
| ...no supported cell at all | 556 |
| Cache-affected and live-affected / cache only / live only | 6,962 / 438 / 249 |

Median supported share of converged cells for the 7,211: 4.5%; median extra C3 of the best supported cell over the
unsupported minimum: 1.47 km²/s². Of the 7,400: encounter body Earth 5,676, Venus 1,596, Mars 115, Moon 10, Mercury 3;
arrival minus encounter p10/p25/p50/p75/p90 = 5.4 / 121 / 1,409 / 3,089 / 4,167 d; 1,392 (18.8%) arrive within 30 d
after the encounter. "Any supported cell" is a raw-grid test; compare displays *components* whose argmin must be
supported, which is stricter (see the top-10 table). The live population run is the raw minimum, a proxy for compare's
`bestPractical` (which also needs breadth >= 2 and the threshold).

**Compare example set.** Compare has no default set; an empty `?bodies=` shows a hint with `433,163693,99942`
(`compare/main.ts:1118-1123`). Run through the repo's `computeCompareData` with compare's own arguments
(`compare/main.ts:1053-1090`, Falcon Heavy, relative threshold): 433 is L2, no boundary; 163693 is L1 (encounter
2036-02-29) with **no practical window**; 99942 best practical dep 2028-08-24, arrives 2029-04-13, after 2028-09-12
(**after support**), and a supported practical component exists (dep 2027-06-03, 348.5 d, C3 1.061, breadth 27, arrives
2028-05-16). So 1 of 3 here.

**Top 10 by catalog rank** among the 7,400. "Catalog rank" is not defined in code (the catalog panel sorts only by
designation, class and H, `catalog-list/panel.ts:147-170`); I used the catalog's `qualityRank`
(`boundary/slice9-nea-catalog.ts:60,131`), descending, ties by H ascending. All ten have `qualityRank = 1`
(1,767 of the 7,400 do).

| Designation | H | Cache best (dep + TOF, C3) | Support through | Compare best practical arrives after support? | Alternative supported (compare component / any live cell, min C3) |
|---|---:|---|---|---|---|
| 5143 | 14.04 | 2028-10-05 + 302 d, 2.832 | 2029-05-18 | yes (2029-08-04) | none / 15.635 |
| 1685 | 14.28 | 2039-04-21 + 272 d, 2.703 | 2032-01-20 | **no** (2032-01-18, 2 d margin) | best is supported / 2.705 |
| 66146 | 14.36 | 2032-11-18 + 272 d, 4.750 | 2026-08-26 | yes (2040-08-11) | one non-practical / 7.788 |
| 1917 | 14.38 | 2032-12-30 + 332 d, 1.819 | 2030-10-06 | yes (2033-11-28) | 1 practical / 1.827 |
| 242450 | 14.64 | 2028-11-16 + 242 d, 1.671 | 2029-07-15 | yes (2037-06-10) | 3 practical / 2.027 |
| 5131 | 14.81 | 2038-11-11 + 182 d, 13.662 | 2028-06-26 | yes (2033-06-28) | none / 27.007 |
| 4953 | 14.88 | 2026-09-10 + 272 d, 0.611 | 2027-06-06 | yes (2029-07-03) | one non-practical / 1.139 |
| 11066 | 15.17 | 2032-01-15 + 212 d, 1.656 | 2027-09-08 | yes (2032-08-16) | none / 8.607 |
| 1620 | 15.26 | 2036-11-06 + 332 d, 0.890 | 2026-08-12 | yes (2037-10-03) | none / 3.662 |
| 143947 | 15.36 | 2035-03-01 + 212 d, 2.805 | 2029-04-10 | yes (2035-09-30) | none / 31.588 |

Compare says "after support" for 9 of 10; the catalog says it for all 10. For 1685 the two surfaces pick different
near-tied windows: the cache's best is dep 2039-04-21 at C3 2.703 (arrives 2040-01-17, after support), while the live
grid's minimum is dep 2031-04-11 at C3 2.705 (arrives 2 days before the encounter). Supported practical alternatives
exist for 2 of the 9.

**Answer: excluding after-support windows would change the top window for about 7 in 10 L1 bodies, and for 556 L1
bodies (5.5%) it would leave nothing supported in the grid; "flag, don't exclude" is the only rule that never empties
a result.**

## R6. Oracle path

- **Committed harness.** `tools/slice11-research/measurements/multi-rev-poliastro-validate.mjs` (JS driver) +
  `poliastro-grid.py` (stdin JSON -> `poliastro.iod.izzo.lambert(mu, r0, r, tof, M=0, prograde=True, lowpath=True)`,
  emits `c3`, `vInfDep`, `vInfArr` magnitudes only) + `multi-rev-dual-oracle.py` (M>=1, dense T_min scan). Committed
  result `tools/slice11-research/data/multi-rev-poliastro-validation.json`: solver `6d68b3b`, Apophis/Bennu/Itokawa,
  M 0/1/2, 50x50, `overallMaxRelError` 3.60e-12, target 1e-6 (`:33`).
- **Machine.** System Python 3.13/3.14 has numpy only (`import poliastro` fails). The venv the harness expects exists at
  `C:\Users\hudso\.aster-slice11-venv` (Python 3.12.10, poliastro 0.17.0, astropy 5.3.4, numpy 1.26.4, scipy 1.17.1;
  read-only probe, no install). The driver hard-codes a POSIX interpreter path (`bin/python`, `:23`), which does not exist
  on Windows (`Scripts\python.exe` does), and it writes into the repo (`.tmp-tests`, `tools/.../data`), so I did not
  run it.
- **Swapped endpoints and vectors.** The Python script is endpoint-agnostic (it takes any `r0`, `r`). Scratch probe
  (`scratch\r6.mjs`, `poli-vec.py`, run with the venv interpreter, `-I`): 90 return-direction cells (3 bodies), repo
  `lambertMultiRev` vs poliastro `izzo`, M=0: max relative velocity-vector difference 1.75e-15, max Earth-arrival v-inf
  vector difference 2.47e-15, 0 poliastro errors. Not a validation (same machine, M=0 only). The committed script
  emits magnitudes only; a vector-emitting copy is about ten lines. The JS driver's cell builder is Earth-at-departure.

**Answer: REUSE-HARNESS for the oracle itself (poliastro runs here and handles swapped endpoints); new is a thin driver
that builds return cells, emits vectors, runs on Windows, and writes outside the repo.**

## R7. K2 interface

From `origin/claude/k2-momentum-bank` (`8cb8d54`, read with `git show`, not checked out; README says K2 is "CONCEPT" and
"nothing here authorizes implementation"). What K2 consumes from K1 today:

| Quantity | Unit / frame / form | Source |
|---|---|---|
| `vInf` | Earth-arrival hyperbolic excess, **scalar** km/s | `k2-model.js:112` ("Aster supplies this once K1 exists") |
| `decDeg` | arrival-asymptote declination "with respect to the facility's reference plane", degrees; used as `|dec|` against facility inclination (`:131-134`) | `k2-model.js:113`; `index.html:213` |
| `incDeg`, `tolKms`, `ispS`, masses | K2 inputs, labelled speculative, not K1 outputs | `k2-model.js:114-120` |

Not consumed today, and named as required for a real catch: the **full v-inf vector**, the **encounter epoch**, a
**B-plane target** (`index.html:213`; `K2_LEARNINGS.md:34-36`). Frame is not stated by K2 (ICRF vs ecliptic); Aster's
DLA is ICRF equatorial-aligned (`dla.ts:1-13`). Epoch format and tier/uncertainty: not consumed. Its histogram uses an
outbound proxy, explicitly "NOT return-leg arrival v-inf" (`vinf-proxy.js:2`, `README.md:78-79`), built from
`docs/lambert-screen-cache.json` sha256 `bd27b9bd…` (41,422 counted, 484 no window, bins 0.25 km/s).

External numbers it cites (**as cited; unverified**): Keck 2012 (KISS/ESA-ESTEC slides, slide 31) Earth-arrival C3
1.6-2.1 km²/s² for 2008 HU4, 1998 KY26, 2000 SG344, i.e. v-inf about 1.27-1.45 km/s, lunar-assisted capture not LEO
(`K2_LEARNINGS.md:30-32`; `index.html:482`); NHATS entry <= 12 km/s at 125 km, giving unbraked v-inf <= 4.63 km/s,
"Perplexity's estimate" (`:32`; `index.html:483`); matching burns 0.441/0.583/0.815/1.133/1.528 km/s at v-inf 1-5
(arithmetic agreement only, `README.md:50-51`). Note for context only: this recon's R2 minimum for 2000 SG344 (0.0387
km/s) is a minimum over a 9-year window with no mission constraints and is not comparable with the Keck mission value.

**Answer: K2 needs one scalar v-inf (km/s) and one declination today; a real catch needs the vector, epoch and
B-plane, none of which K2 consumes yet.**

## R8. Surfaces and MCP

**Where a Return-leg panel would live.** Porkchop page: it already has the mission-mode control
(`app/porkchop/main.ts:146, 330, 756-764`), the stack card with the symmetric-return disclosure
(`:406-421, :1004`) and the pinned readout (`porkchop-view.ts:384-415, 1473-1528`); this is where the sample-return
number is shown and replaced. Compare (`app/compare/main.ts`) is outbound-only, M=0, capped at 5 bodies
(`compare-url.ts:12`), so a per-body return grid adds R2's cost per body. The overlay builds its own client
(`ui-overlay/overlay.ts:421`).

**Shared components** (`app/design/components/`): `C3Value.ts` (C3 text with unit/grid/refusal; users
`catalog-list/row.ts:3`, `compare/main.ts:58`, `porkchop/main.ts:29`), `EvidenceBadge.ts`, `FeasibilityBadge.ts`,
`NearZeroC3Badge.ts`, `StatusBadge.ts` (cache status labels). A K1 display needs a v-inf-with-epoch-and-grid formatter
(`C3Value` is C3-specific), an "exploratory/unvalidated" label (`EvidenceBadge` is a bare span), and a vector/declination
readout; there is no component for a support marker (compare's is inline text).

**DEC-15-8 / INV-027 (R14).**
- `classifyFeasibility`: `core/lambert/feasibility.ts:73-85` (protected `src/v2/core/*`). Callers:
  `porkchop/porkchop-view.ts:413`; MCP `compute-shared.ts:215` via `classifyDlaForSite`
  (`explain-cell.ts:247`, `estimate-mission-cost.ts:168`) and `compute-shared.ts:283` via `siteVerdictRows`
  (`dla-feasibility.ts:149`).
- `marginDeg`: only in the adapter, `mcp/src/tools/compute-shared.ts:279, 294` (`activeBandDeg - |DLA|`); nowhere in core.
- Ruling text: `tools/audit/sanity-69472a3/phase0/RULINGS.md:30` ("FIX CODE in Slice 20 … if the MCP eval pins the old
  error → an eval amendment per the 0052ecb precedent"); `SLICE_19_5_FOUNDING.md:409`; INV-027
  (`SLICE_15_FOUNDING.md:35`, `INVARIANTS.md:201`); DEC-15-8 (`SLICE_15_FOUNDING.md:159-160`).
- **Pins.** Eval P9 (`mcp/eval/slice15-eval-pairs.json`) pins `verdict === 'RED'` and
  `marginDeg.value === -17.868682593370664`; P7 pins the MCP `-32602` error for `tofMinDays > tofMaxDays` (the
  schema-error side of DEC-15-8, which should stay). No eval pair pins the old unknown-`siteId` error. The unit test
  `mcp/test/compute-tools.test.ts:364-371` (T19) pins `dla_feasibility` unknown `siteId` as a Zod error, against
  `:429-463` (T21b) pinning the `not_found` refusal on `estimate_mission_cost` (cause: `dla-feasibility.ts:29`,
  `z.enum`). `tests/fixtures/v2/slice16-anchor-cells.json:46` also carries `marginDeg`.
- INV-029 cap is 8 tools; 7 are registered (`dla_feasibility`, `estimate_mission_cost`, `explain_cell`, `get_body`,
  `get_validation_report`, `porkchop_scan`, `search_bodies`).

**Answer: the return panel belongs on the porkchop page beside the sample-return stack; `marginDeg` is pinned by eval
P9 and the unknown-site error by a unit test, so moving them into core means an eval amendment and a test change.**

## Questions this raises for the founding doc

- Which return objective does Slice 20 rank by: Earth-arrival |v-inf|, asteroid-departure |v-inf|, or a joint/ΔV
  scalar? AMD-2's departure-C3 selection does not carry over (R1, R3).
- How far must the Earth span extend (2044-12-31, 2049-12-31 or 2052-01-01, R1), at what cadence, and as an Earth-only
  artifact or by growing the 6-body 7.2 MB inner file? This amends DEC-17-10's departure-only premise.
- Is the indexed Earth lookup a core change (`hermite.ts` is protected) or a local index inside the grid dependency?
- What is the return grid: departure window and TOF range relative to outbound arrival, minimum stay, M families
  (compare ships M=0 only, the porkchop page M=0 and M=1)?
- Support for return: confirm asteroid-DEPARTURE epoch governs (R4); and OQ-19-4 now sizes at 72.9% of L1 catalog
  best windows, so what does "exclude vs flag" do for the 556 bodies with no supported cell?
- Vector contract: frame (ICRF per `dla.ts`), sign of arrival declination, epoch format, and whether `v1`/`v2` or v-inf
  vectors may cross the worker message (`porkchop.worker.ts:73-86` strips them today).
- Does the shipped sample-return number stay symmetric (Nova's proposed DEC) given the error changes sign (R3), and
  does the disclosure (`SLICE_11_FOUNDING.md:117`, `porkchop/main.ts:1004`) change?
- B-plane and epoch: K2 says a real catch needs them; is either in K1 scope?
- Does a return screening cache (all 41,906 bodies) belong in Slice 20, given the existing cache is outbound and 34.5 MB?
- MCP: one tool slot remains (INV-029); a return tool, or extend `porkchop_scan`/`explain_cell`? Eval amendment
  process for P9 (0052ecb precedent) and T19.
- Oracle: accept a new Windows-capable driver that writes outside the repo, and extend the vector-emitting script to
  M>=1 with the dual-oracle?

## Anything surprising

- Swapping the endpoints needs no code change at all in `computePorkchopGrid`: injecting providers gives bit-identical
  return-leg v-inf. The kernel is not the work.
- The cost of a naive swap is entirely the linear-scan Earth lookup (`hermite.ts:102-108`): 10x slower, 2.7 s per body.
- Compare has no default body set; the dispatch's "compare default set" does not exist (an example hint only).
- Catalog and compare disagree about "arrives after support" for 438 bodies (cache only) and 249 (live only); for 1685
  two windows 8 years apart tie within 0.002 km²/s² and the live one clears its encounter by 2 days.
- The symmetric-return charge errs high at min-C3 windows and low at the windows sample-return mode would pick.
- A poliastro environment exists on this machine only in the Slice 11 venv, not on the system Python; the committed
  driver's interpreter path is POSIX-only.
- 163693 (in compare's own example list) has no practical window.
- "Catalog rank" is undefined in code; `qualityRank` is the only rank-named field.
- `node -v` is v26.7.0 (AGENTS §9.1 records v24.18.0).
- This recon ran on `main`; local branch `s20-eph-roll` (the ephemeris roll, 6 unmerged commits) was not part of the
  tree measured here.
