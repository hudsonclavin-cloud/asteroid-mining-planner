# Slice 9 A.2b Derived-Field Staleness Diagnostic

**Status:** COMPLETE (Tue 2026-05-19). Data only. No fixture mutation, no fix.
**Input fixture:** `tests/fixtures/v2/nea-catalog-slice9.json` in its completed-but-uncommitted A.2b state.

## Q1 — The 4 failing test cases

All four current red tests fail on the **same first inconsistent body**, not four different bodies. Each test invokes Slice 9 ingestion, and ingestion aborts on the first derived-field mismatch it encounters.

| # | Test case | Location | First failing body | SPK-ID | anchorSource | Stored e | Stored band | Expected band |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Slice 9 boundary ingestion preserves the full catalog and tier counts | tests/v2-boundary-slice9.test.mjs:98 | 2006 TB7 | 50348471 | horizons-reanchor | 0.200359250152 | B | C |
| 2 | Slice 9 boundary spot-checks preserve Bennu, Apophis, Eros, Atira-class, flagged, and anomaly-tail bodies | tests/v2-boundary-slice9.test.mjs:115 | 2006 TB7 | 50348471 | horizons-reanchor | 0.200359250152 | B | C |
| 3 | Slice 9 quality metadata and anchor semantics stay internally consistent | tests/v2-boundary-slice9.test.mjs:158 | 2006 TB7 | 50348471 | horizons-reanchor | 0.200359250152 | B | C |
| 4 | Slice 9 browser loader fetches and ingests the NEA catalog fixture | tests/v2-boundary-slice9.test.mjs:205 | 2006 TB7 | 50348471 | horizons-reanchor | 0.200359250152 | B | C |

Interpretation:
- Current red window = **1 underlying body encountered 4 times by 4 test entries**.
- That first failing body is `2006 TB7`, and it is **already re-anchored correctly** at the raw-elements level.
- The failure is its **stored derived eccentricity band**, not its raw orbital state.

## Q2 — Full-catalog derived-field consistency audit

The full 41,906-body fixture was audited using the same derivation logic as the original A.2 fixture builder:
- `eccentricityBand` recomputed from stored `elements.e`
- `qualityRank` recomputed from stored `conditionCode` + `dataArcDays`, including the original A.2 `round6` serialization
- `estimatedRadiusM` recomputed from stored `H`

| Derived field | Total mismatches | sbdb | horizons-reanchor | stale-unanchored |
| --- | --- | --- | --- | --- |
| eccentricityBand | 10 | 0 | 10 | 0 |
| qualityRank | 0 | 0 | 0 | 0 |
| estimatedRadiusM | 0 | 0 | 0 | 0 |

Headline:
- **Only one derived field is stale: `eccentricityBand`.**
- Mismatch count = **10 total**, and **all 10 are `horizons-reanchor` bodies**.
- `qualityRank` is **not stale** anywhere once recomputed with the original A.2 rounding rule.
- `estimatedRadiusM` is **not stale** anywhere.

Anchor-source distribution context:
- `sbdb`: 30,101
- `horizons-reanchor`: 11,747
- `stale-unanchored`: 58

Population impact:
- Re-anchored bodies with stale derived fields: **10 / 11,747**
- SBDB-source bodies with stale derived fields: **0**
- Stale-unanchored bodies with stale derived fields: **0**

This is the decisive scope result: **the bug is confined to a tiny re-anchored subset, not the whole catalog and not base A.2 ingestion.**

### All 10 eccentricityBand mismatches

| Designation | SPK-ID | anchorSource | Stored e | Stored band | Expected band | Nearest threshold | Delta |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2006 TB7 | 50348471 | horizons-reanchor | 0.200359250152 | B | C | 0.2 | 0.000359250152 |
| 2008 TC3 | 50430314 | horizons-reanchor | 0.059711056320 | D | A | 0.1 | 0.040288943680 |
| 2009 VA | 50474880 | horizons-reanchor | 0.209740208064 | D | C | 0.2 | 0.009740208064 |
| 2014 AA | 50655753 | horizons-reanchor | 0.176237654639 | C | B | 0.2 | 0.023762345361 |
| 2020 KV4 | 54017245 | horizons-reanchor | 0.199915806119 | C | B | 0.2 | 0.000084193881 |
| 2020 PR2 | 54051043 | horizons-reanchor | 0.300037111513 | C | D | 0.3 | 0.000037111513 |
| 2022 FB21 | 54499711 | horizons-reanchor | 0.191421421337 | C | B | 0.2 | 0.008578578663 |
| 2024 FQ5 | 54432475 | horizons-reanchor | 0.223401527255 | B | C | 0.2 | 0.023401527255 |
| 2024 GN6 | 54434764 | horizons-reanchor | 0.300113974426 | C | D | 0.3 | 0.000113974426 |
| 2024 SX1 | 54482413 | horizons-reanchor | 0.298649146722 | D | C | 0.3 | 0.001350853278 |

Band-threshold clustering:
- Near `e = 0.1`: 1
- Near `e = 0.2`: 6
- Near `e = 0.3`: 3

Most are threshold-crossers around the `0.2` / `0.3` band boundaries, which is exactly the failure mode expected when the raw eccentricity is refreshed but the stored band is left behind. Two notable cases are farther from the nearest boundary:
- `2008 TC3`: stored `D` but re-anchored `e = 0.0597` ⇒ expected `A`
- `2009 VA`: stored `D` but re-anchored `e = 0.2097` ⇒ expected `C`

That pattern is stronger than simple rounding noise; it is stale-band carryover from pre-re-anchor values.

## Q3 — Code-path audit: where the drift comes from

Fresh A.2 ingestion computes and stores the derived fields during fixture build:
- `tools/slice9-ingestion/build-nea-catalog.mjs:89-92` computes `qualityRankForRow(...)`
- `tools/slice9-ingestion/build-nea-catalog.mjs:231-261` writes the per-body record
- specifically:
  - `build-nea-catalog.mjs:254` writes `eccentricityBand: eccentricityBandForBody(row.e)`
  - `build-nea-catalog.mjs:261` writes `qualityRank: qualityRankForRow(row)`

Boundary ingestion re-validates `eccentricityBand` from stored raw eccentricity:
- `src/v2/boundary/slice9-nea-catalog.ts:300-305`

But the A.2b runner's re-anchor path bypasses that fresh-ingestion derivation step:
- `tools/slice9-ingestion/reanchor-stale-subset.mjs:265-283` (`applyReanchor(...)`) replaces:
  - `record.anchor`
  - `record.elements`
  - `record.anchorSource`
  - `record.reanchorEpochTdbJd`
- It does **not** recompute:
  - `record.eccentricityBand`
  - `record.qualityRank`
  - `record.estimatedRadiusM`

Confirmed mechanism:
- The runner updates **raw elements + epoch + anchor tags**
- The runner does **not** invoke the A.2 derived-field path afterward
- Therefore any derived field that depends on refreshed raw elements can drift

In practice, only `eccentricityBand` drifted, because:
- `qualityRank` depends on `conditionCode` + `dataArcDays`, which A.2b never changes
- `estimatedRadiusM` depends on `H`, which A.2b never changes

## Q4 — Full derived-field list and impact

Per-body derived fields present in the Slice 9 schema:
1. `estimatedRadiusM` — derived from `H`
2. `eccentricityBand` — derived from `elements.e`
3. `qualityRank` — derived from `conditionCode` + `dataArcDays`

Audit result by field:
- `estimatedRadiusM`: **0 mismatches**
- `eccentricityBand`: **10 mismatches**
- `qualityRank`: **0 mismatches**

Top-level catalog summary fields were also spot-audited:
- `catalog.totalBodies`: matches body count
- `catalog.inv014TierDistribution`: matches body records
- `catalog.missingAbsoluteMagnitudeCount`: matches body records
- `catalog.anomalyTailCount`: matches body records
- `catalog.classDistribution`: count-equivalent to body records

So the only production inconsistency surfaced by A.2b is the **10-body `eccentricityBand` drift inside the re-anchored subset**.

## Root Cause Verdict

**ROOT CAUSE:** derived-field recomputation was bypassed in the A.2b runner for the re-anchor path.

Evidence:
- Boundary validates `eccentricityBand` from stored `elements.e` (`slice9-nea-catalog.ts:300-305`)
- Fresh A.2 build computes derived fields during record construction (`build-nea-catalog.mjs:231-261`)
- A.2b re-anchor replaces raw fields without invoking that derived-field path (`reanchor-stale-subset.mjs:265-283`)
- Full-catalog audit shows mismatch scope is:
  - **10 re-anchored bodies**
  - **0 sbdb bodies**
  - **0 stale-unanchored bodies**

This is **not** a base A.2 ingestion bug, and **not** an OQ-6 / hybrid-accuracy failure.

## Fix Scope Recommendation (Hudson decision)

Recommended fix scope:
- Bodies requiring backfill: **10 re-anchored bodies**
- Derived fields requiring backfill: **eccentricityBand only**
- No evidence that `qualityRank` or `estimatedRadiusM` need backfill

Recommended repair shape:
1. Backfill the completed fixture's stale `eccentricityBand` values
2. Patch the A.2b runner so future re-runs recompute derived fields after replacing elements

Not recommended:
- Re-running the 10-hour Horizons fetch. The raw fixture output is already correct; the issue is a local post-fetch derived-field carryover bug.

## Status

Diagnostic complete. Fence stays. Phase A not closed. Fix scope is Hudson's decision from the surfaced evidence.
