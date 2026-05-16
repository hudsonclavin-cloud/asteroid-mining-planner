# Slice 9 Pre-Research Report

## Scope

This pass is data only.

- no `src/v2/` changes
- no fixture build
- no renderer work
- no deploy
- no founding-doc changes

Tasks 1 and 2 completed. Task 3 hit its designed STOP condition and is parked with resume-safe caches.

## Task 1 — Live SBDB NEA Catalog Pull

Live result from `sb-group=neo`:

- NEA count: `41,902`

This is materially above the rough `~32k` planning estimate and should be treated as a Slice 9 scope input. Any scoping assumption that still uses `32k` needs to be revisited.

### Primary class distribution

| Class | Count |
| --- | ---: |
| APO | 23,755 |
| AMO | 14,514 |
| ATE | 3,387 |
| IEO | 38 |

### Anomaly tail through the NEO filter

| Class | Count |
| --- | ---: |
| ETC | 6 |
| HTC | 36 |
| JFC | 166 |

This is an open scoping question, not a measurement-script bug. Slice 9 must decide whether these rows are:

- included
- excluded
- flagged separately

### Class-balance note

`APO + AMO = 38,269`, which is about `91.3%` of the catalog. `IEO` has only `38` rows. Any orbital-class filter or stratification scheme must handle extreme bucket imbalance cleanly.

### Quality distribution

Condition-code histogram:

| condition_code | Count |
| --- | ---: |
| 0 | 8,470 |
| 1 | 1,705 |
| 2 | 651 |
| 3 | 477 |
| 4 | 1,189 |
| 5 | 2,468 |
| 6 | 5,110 |
| 7 | 9,585 |
| 8 | 8,957 |
| 9 | 3,280 |
| missing | 10 |

Data-arc histogram:

| Bucket | Count |
| --- | ---: |
| `<7d` | 10,965 |
| `7-30d` | 12,310 |
| `30-100d` | 5,689 |
| `100-1000d` | 2,279 |
| `>1000d` | 10,242 |
| missing | 417 |

Additional notes:

- rows with missing / degenerate elements: `0`
- rows missing `H`: `210`

Candidate exclusion-count table only. No threshold is chosen here:

| max condition_code | min data_arc | kept | excluded |
| ---: | ---: | ---: | ---: |
| 3 | 7d | 11,273 | 30,629 |
| 3 | 30d | 11,171 | 30,731 |
| 5 | 7d | 14,630 | 27,272 |
| 5 | 30d | 14,109 | 27,793 |
| 7 | 7d | 24,942 | 16,960 |
| 7 | 30d | 18,077 | 23,825 |

## Task 2 — Spatial Occupancy Histogram

All `41,902` rows were propagatable to a common epoch using the offline Keplerian measurement script.

- common epoch: `2026-05-01 TDB`
- total rows: `41,902`
- propagatable rows: `41,902`
- excluded rows at this stage: `0`

Occupancy table:

| Cell size (AU) | Occupied cells | Max bodies / cell | Median / cell | p90 / cell | Fraction of bodies in densest 10 cells |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0.25 | 6,893 | 264 | 2 | 13 | 4.43% |
| 0.5 | 2,060 | 1,177 | 2 | 44 | 16.08% |
| 1.0 | 540 | 2,652 | 4 | 149.1 | 44.60% |
| 2.0 | 171 | 7,267 | 2 | 358 | 78.79% |

### Spatial extent

Heliocentric-distance distribution at the common epoch:

- min: `19,884,771.7 km`
- median: `254,338,922.1 km`
- p90: `511,250,558.2 km`
- p95: `577,639,045.9 km`
- max: `9,472,492,439.2 km`

Axis extents in the renderer's ICRF scene frame:

- X: `-7,382,152,187.1 .. 4,738,628,067.3 km`
- Y: `-7,590,324,910.0 .. 4,521,519,458.9 km`
- Z: `-5,645,848,745.8 .. 3,096,820,623.4 km`

### Slice 8 contrast note

Slice 8 main-belt occupancy at `1 AU` was `178` occupied cells with max `368` bodies per cell. This NEA measurement at `1 AU` is `540` occupied cells with max `2,652` bodies per cell. The NEA population is both denser and more clustered in the relevant inner-system region.

At face value:

- `0.25 AU` is the only measured uniform size that keeps per-cell occupancy in roughly the same regime as Slice 8
- but `6,893` occupied cells is now a scene-graph-object problem

This is the `OQ-1` input. It does **not** decide uniform grid vs octree / BVH. It only gives the real clustering numbers that scoping needs.

## Task 3 — INV-014 Stratified Accuracy Sample

Status: **INCOMPLETE — PARKED**

The bounded Task 3 run hit its designed STOP condition:

- `measure-inv014-sample.mjs` failed on a Horizons network fetch
- no substitute data was fabricated
- no tier boundary was inferred from partial evidence

What completed before the stop:

- `908` CAD classification flags written to `tools/slice9-research/data/cad-flags.json`
- `59` Horizons truth windows written to `tools/slice9-research/data/inv014-truth.json`

What remains unanswered:

- whether encounter-flagged bodies cleanly predict qualitatively bad Keplerian behavior
- the evidence basis for future INV-014 tier boundaries

So `OQ-6` is **not closed** by this dispatch.

## OPEN — FOR SCOPING

### OQ-1

Data now in hand:

- real live NEA count
- occupancy table at `0.25 / 0.5 / 1.0 / 2.0 AU`
- heliocentric spatial extent and density concentration

Decision still open:

- uniform cell size vs octree / BVH / another structure

Current evidence leans toward: uniform-grid assumptions should be treated skeptically at this clustering level, but that is a scoping decision, not an automatic conclusion from the script.

### OQ-6

Blocked.

Task 3 must be resumed incrementally from the cached:

- `tools/slice9-research/data/cad-flags.json`
- `tools/slice9-research/data/inv014-truth.json`

Do **not** set INV-014 numbers from this partial state.

### New open question surfaced

The `sb-group=neo` live pull includes `ETC / HTC / JFC` rows. Slice 9 scoping now needs an explicit include / exclude / flag decision for this anomaly tail.

### New scope input surfaced

The live NEO count is `41,902`, not `~32k`. Any Slice 9 sizing, batching, or runtime assumptions based on `32k` should be re-scoped against the real population.

## Notes

- This partial commit intentionally preserves the resume-safe caches so Task 3 can continue later without redoing the CAD pass or the first `59` Horizons truth windows.
- The large raw dump `sbdb-nea-raw.json` remains gitignored.
- This report decides nothing. It preserves completed measurement output and records exactly what remains blocked.
