# N1 report: why LR1 differs

## 1.1 What differed

The LR1 dataset contains 14,124 converged branches: M0/single 6,000, M1/left 4,062, and M1/right 4,062. The comparison uses the same record id, body, departure JD, TOF, M, and branch for every record.

The Aster vector replay was bit-identical for 13,970/14,124 records and differed for 154/14,124 records. By group:

| Group | Records | Aster bit differences | Aster max abs vector difference (km/s) | Aster median among differing cells (km/s) |
|---|---:|---:|---:|---:|
| M0/single | 6,000 | 80 | 1.4210854715202004e-14 | 3.552713678800501e-15 |
| M1/left | 4,062 | 27 | 7.105427357601002e-15 | 3.552713678800501e-15 |
| M1/right | 4,062 | 47 | 5.684341886080802e-14 | 7.105427357601002e-15 |
| All | 14,124 | 154 | 5.684341886080802e-14 | 3.552713678800501e-15 |

The LR1 Aster replay is therefore numerically the same to sub-1e-13 km/s, but not bit-identical. The izzo-side vector comparison was M0 max `1.4495071809506044e-12` km/s, M1/left max `1.2265743976058739e-12` km/s, M1/right max `1.5170087408478139e-12` km/s, and all-record median `3.552713678800501e-15` km/s. The original LR1 summary reports its all-record izzo maximum as `1.6141992207844764e-12` km/s and RMS `3.020e-14` km/s for the Earth-arrival v-infinity field.

The first 20 Aster-differing ids were:

`433|416|11|M0|single`, `433|568|11|M0|single`, `433|709|7|M0|single`, `99942|403|17|M1|right`, `101955|223|7|M0|single`, `101955|228|28|M1|right`, `2000 SG344|683|0|M0|single`, `2000 SG344|455|19|M1|left`, `2008 HU4|260|12|M0|single`, `2008 HU4|103|36|M1|right`, `2008 HU4|337|17|M1|left`, `2008 HU4|393|20|M1|left`, `1998 KY26|550|22|M0|single`, `1998 KY26|37|33|M1|right`, `1998 KY26|245|81|M1|right`, `1998 KY26|323|54|M1|right`, `1998 KY26|590|24|M1|right`, `2024 BX1|323|24|M0|single`, `2024 BX1|615|6|M0|single`, and `2024 BX1|656|20|M0|single`.

## 1.2 Inputs first

For all 14,124 records, including the 154 Aster-differing records and the 20-cell control subset, the computed inputs exactly matched the recorded inputs:

- `r1`: maximum component difference `0` km.
- `r2`: maximum component difference `0` km.
- TOF: maximum difference `0` seconds.
- `mu`: exact equality at `132712440018` km^3/s^2.

The comparison computes Earth arrival with the same arithmetic as the production kernel: departure seconds plus `tofSeconds`. No first differing input exists.

## 1.3 Code second

The requested diff was:

```text
 src/v2/boundary/display-body-label.ts       |     9 +
 src/v2/boundary/lambert-screen-cache.ts     |    36 +-
 src/v2/core/constants/physical.ts           |     2 +
 src/v2/core/propagators/keplerian.ts        |     2 +
 src/v2/porkchop/compare-data.ts              |     8 +-
 src/v2/porkchop/delta-v.test.mjs             |     2 +-
 src/v2/porkchop/launch-vehicles.test.mjs     |    15 +
 src/v2/porkchop/launch-vehicles.ts           |    38 +-
 src/v2/porkchop/near-zero-c3.ts              |     2 +
 src/v2/porkchop/porkchop-view.ts             |    49 +-
 tests/fixtures/v2/lambert-screen-cache.json  | 83814 +++++++++++++-------------
 11 files changed, 42027 insertions(+), 41950 deletions(-)
```

Commits touching those paths, oldest first:

- `ee92047` fix(porkchop): close W1 mission-copy residuals
- `a5e4149` refactor(porkchop): centralize mode budget policy
- `ef883e2` fix(porkchop): disclose near-zero cells and refresh pins
- `51b3f4c` test(porkchop): lock mode-owned spacecraft budget totals
- `c93cb8c` fix(a11y): identify Slice 20 form controls
- `b00b7c0` feat(core): speed of light constant (exact, SI) for K4 (DEC-20-11)
- `7b4956e5` docs(core): annotate GM_SUN DE405-era provenance
- `ed5727f` fix(porkchop): label the cell status as the solver's verdict
- `f2fb69a` fix(ui): name the transfer family beside every best-C3 value
- `d61c94d` refactor(cache): boundary accepts schemaVersion 1 or 2; bestWindows leaves the contract (DEC-20-15)
- `b75129c` build(cache): regenerate screening cache at schemaVersion 2 (DEC-20-15; display unchanged)

None changes the Lambert solver or the numerical asteroid propagator. The only core propagator delta is a comment; the new physical constant is unrelated to this path. The large fixture delta is the screening-cache artifact and is not an LR1 input.

## 1.4 Decisive control

The LR1 summary records Node `v22.23.4` and head `0d31cda3d1dca81d29f45092be26b94bb44294c1`. A throwaway clone was checked out at that commit and compiled with the run-1 build pattern under the laptop's Node `v26.7.0`. The old-head direct Lambert call and the old-head 1x1 `computePorkchopGrid` swapped-provider path both produced the same 154 bit-level differences over the exact LR1 inputs; the first 20 selected differing cells were not bit-identical. The unedited run-1 ON2 harness also completed on the old build: 480,000 cells, 64,449 Earth refusals, 4,800 asteroid-propagation refusals, and the same branch counts as its current run.

The LR1 harness line that fixes the relevant arithmetic is `tools/slice20-research/longrun/lr1-oracle/build-cells.mjs:156-169`: a 1x1 `computePorkchopGrid` call with swapped asteroid/Earth providers. The production kernel then forms arrival seconds as departure seconds plus TOF at `src/v2/porkchop/grid-compute.ts:182-183`. Replaying those exact inputs and the old source does not reproduce Node-22 serialization bit patterns on Node 26.

The decisive explanation supported by these controls is the runtime change: LR1 was generated on Node 22/V8 and the replay on Node 26/V8. There is no input, source-code, or grid-spec difference left in the tested path. This is a sub-ulp floating-point serialization difference, not a physical result change.

## Verdict

`LR1 DIFFERS because the original Node 22/V8 run and the Node 26/V8 replay serialize a small number of floating-point Lambert results differently (runtime; LR1 harness line build-cells.mjs:156-169); LR1's headline stands; run 1's ON2 stands.`

This explains the LR1 bit-level discrepancy and leaves the run-1 ON2 values usable as the measured Node-26 production result. It does not upgrade either run from LEADS-grade research evidence to a DEC or validation fixture.
