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

Status: **COMPLETE**

The resumed Task 3 run completed incrementally from the committed caches:

- resume start: `908` CAD classification flags and `59` Horizons truth windows already on disk
- resume end: completed `inv014-sample-results.json`
- no cached CAD flags or truth windows were cleared or refetched unnecessarily

### Sample size and shape

Final bounded sample size: `67`

This is below the original rough `150-250` planning target, but it is still informative because the encounter-positive rows were much rarer than expected inside the bounded first-pass stratum scan (`80` candidates per stratum max, or the whole stratum if smaller). The sample therefore answers the key comparison, even though it is not a balanced matrix.

### Key comparison — encounter flag vs. Keplerian failure

Encounter-flagged split:

- count: `6`
- median max error: `1,340,189.7 km`
- p90: `6,695,807.4 km`
- p95: `7,321,680.8 km`
- max: `7,947,554.1 km`

Not-flagged split:

- count: `61`
- median max error: `2,415.5 km`
- p90: `7,876.6 km`
- p95: `12,715.5 km`
- max: `38,866.6 km`

This is a clean qualitative separation. In this bounded sample, encounter-in-window strongly predicts catastrophic Keplerian error relative to the non-flagged set.

### Stratified distribution notes

- Every encounter-flagged sampled body landed in an `APO` or `ATE` stratum.
- No `AMO` or `IEO` sampled body was encounter-flagged within the bounded scan window.
- The encounter-positive rows dominate the worst-error tail by orders of magnitude.
- The non-flagged rows remain in a much tighter visualization-grade regime: tens of thousands of km at the extreme, low-thousands km in the median case.

### Worst-error bodies

Top six worst-error sampled bodies:

| Designation | Class | E-band | Encounter-flagged | Max error km |
| --- | --- | --- | --- | ---: |
| `2026 JB2` | `ATE` | `>0.7` | yes | `7,947,554.1` |
| `2026 JV3` | `APO` | `0.3-0.5` | yes | `5,444,060.6` |
| `2026 JA` | `ATE` | `e<0.3` | yes | `1,915,307.1` |
| `2026 JQ3` | `APO` | `e<0.3` | yes | `765,072.4` |
| `2026 JB` | `APO` | `0.5-0.7` | yes | `730,590.4` |
| `2026 JW` | `ATE` | `0.3-0.5` | yes | `192,118.4` |

The worst non-flagged body in the completed sample was:

- `2001 HL31` (`APO`, `>0.7`) at `38,866.6 km`

### Evidence for future INV-014 boundary derivation

This dispatch still decides nothing, but the evidence now supports a clear scoping statement:

- an encounter-in-window flag is a strong predictor of "not Kepler-safe" behavior in this sample
- the future visual-grade tier should be derived from the non-flagged error distribution, not from the encounter-positive tail
- the encounter-positive set should be treated as its own caution / exclusion / special-handling tier candidate during scoping

Plainly:

- the data suggests the "viz-tier" regime is in the low-thousands to low-tens-of-thousands of km for non-flagged bodies
- the data suggests encounter-flagged bodies belong in a qualitatively different tier, with errors exploding into the hundreds-of-thousands to multi-million-km range

The numeric INV-014 boundaries are still Hudson's scoping decision.

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

Data is now in hand.

The completed bounded sample gives real evidence for how INV-014 should be derived:

- non-flagged bodies form one coherent lower-error population
- encounter-flagged bodies form a sharply separated catastrophic-error population

What remains open is not the evidence, but the decision:

- exact numeric INV-014 tier boundaries
- whether encounter-flag maps to an exclusion tier, a warning tier, or both
- whether additional sample widening is worth doing before locking the final bars

Those are Slice 9 scoping decisions, not outcomes of this data pass.

### New open question surfaced

The `sb-group=neo` live pull includes `ETC / HTC / JFC` rows. Slice 9 scoping now needs an explicit include / exclude / flag decision for this anomaly tail.

### New scope input surfaced

The live NEO count is `41,902`, not `~32k`. Any Slice 9 sizing, batching, or runtime assumptions based on `32k` should be re-scoped against the real population.

## Notes

- This research commit preserves the CAD and Horizons caches so any future widening pass can continue incrementally rather than starting from zero.
- The large raw dump `sbdb-nea-raw.json` remains gitignored.
- This report decides nothing. It preserves the measured Task 1 / Task 2 / Task 3 evidence and leaves the actual Slice 9 architecture and INV-014 tier numbers to scoping.
