# Slice 9 — Full NEA Catalog + Spatial Index at Scale + ui-hud Unfreeze

**Status:** SCOPED COMPLETE (Sat 2026-05-16). Implementation pending.
**Predecessor:** Slice 8.5 (SHIPPED + DEPLOYED 2026-05-16)
**Successor:** Slice 10 (Lambert solver + Earth-departure screening — mission planner thesis begins)

## §1 Thesis

Third architectural slice. Three architecturally distinct pieces:
1. Scale catalog from 10,008 main-belt bodies to the full near-Earth asteroid
   population (live count 41,902 — 31% over the original ~32k planning estimate).
2. Validate/adapt the spatial index for a clustered near-Earth distribution.
3. Introduce Aster's first real interactive UI: search, filter, sort, select.

Last pure-visualization slice. Slice 10 begins the mission planner.

## §2 Locked DECs (Sat 2026-05-16)

DEC-1 — UI stack: Preact + Signals + TanStack Virtual. Scene stays imperative
Three.js. No react-three-fiber, no reconciler-managed scene. Declarative DOM
overlay beside the canvas. Preserves the core/render/UI architectural wall.
Reference architecture: Mozilla Spoke (imperative ThreeJS core + declarative
panel shell, explicitly separated).

DEC-2 — State sync: single external store, unidirectional flow. UI dispatches
domain actions → store. Scene controller subscribes to store slices, mutates
Three.js imperatively. Scene-origin events (pick/hover) → store actions. Fast
per-frame state (camera easing, tween accumulators) stays in scene-local refs,
NOT the reactive graph. Reference convergence: kepler.gl, Spoke, CesiumJS.

DEC-3 — Ingestion: SBDB bulk filtered query (sb-group=neo). Horizons demoted to
validation-only. Quality fields inline (condition_code, data_arc, n_obs_used,
sigma_a, sigma_e). Live count pulled at build time. Per-object Horizons anchoring
(Slice 7/8 pattern) is the WRONG mechanism at 42k scale.

DEC-4 — Quality: ingest all, visually down-rank / flag low-confidence. NEAs are
disproportionately short-arc/uncertain. Matches the honest-astronomy thesis.
Quality fields feed both UI down-rank and INV-014 tier assignment — ingest once,
use twice.

DEC-5 — Accuracy: INV-014 tiered honesty model (viz-tier / planning-tier /
not-Kepler-safe). See OQ-6 resolution for the locked tier structure.

## §3 Resolved Open Questions (Sat 2026-05-16)

OQ-1 — Spatial partition. RESOLVED. Pre-research occupancy (commit acc3ae1) vs
Slice 8 baseline (main belt 1 AU = 178 cells / max 368, cell-as-mesh worked):
- 0.25 AU: 6,893 cells, max 264/cell
- 0.5 AU:  2,060 cells, max 1,177/cell
- 1.0 AU:    540 cells, max 2,652/cell
- 2.0 AU:    171 cells, max 7,267/cell
No uniform size keeps both object-count and max-cell in Slice-8-comfortable
range — NEA distribution is bimodal (dense near-Earth + sparse outer tail).
DECISION: uniform grid at 0.5 AU as working hypothesis; spatial-index
measurement harness MUST instrument the coarse-grid + sub-partition-dense-cells
HYBRID fallback in the SAME pass. One measurement round decides uniform-holds vs
go-hybrid. NOT a full octree (over-engineered for a known static-ish
distribution). Measure-before-lock discipline (cf. Slice 8 8AU→1AU), strengthened
to pre-instrument the fallback.

OQ-2 — Propagation budget at 42k. RESOLVED. ~4× Slice 8's 10k main-thread
propagation. Fold into the OQ-1 measurement harness: same harness measures
main-thread vs Web-Worker propagation cost at 42k. Do not pre-decide worker
offload; instrument it. GPU transform-feedback explicitly out (high variance).

OQ-3 — Quality-flag UI treatment. RESOLVED. Color/opacity down-rank in the 3D
scene (low condition_code / short data_arc → visually de-emphasized) AND quality
badge in the result-list row. Visible everywhere, not list-only — list-only
would render garbage orbits identically to precise ones in 3D, the dishonest
outcome DEC-4 chose against. NO global "hide low-confidence" toggle in Slice 9
(filter = OQ-4 scope-creep, deferred).

OQ-4 — ui-hud scope boundary. RESOLVED — TIGHT. Scope-sprawl guard for Phase C
(project's first real UI, largest/most novel phase). IN: search-by-designation,
filter-by-orbital-class (APO/ATE/AMO/IEO/Atira + opt-in ETC/HTC/JFC),
sort-by-orbital-params, click-to-focus. EXPLICITLY OUT, deferred to Slice 10+:
single-object detail panels, multi-select, comparison views, bookmarks,
mission-planning controls, trajectory inputs. Tight scope is how Phase C ships
instead of balloons.

OQ-5 — Virtualized list policy. RESOLVED. TanStack Virtual, fixed-row-height
first, stable key by designation/SPK-ID (never index), modest overscan,
filter/sort benchmarked under live scene load. Row: designation, class, H,
quality badge — fixed-height-attainable. Dynamic height deferred with the detail
panel (OQ-4).

ANOMALY TAIL — RESOLVED. Task 1 surfaced 208 non-asteroid bodies through
sb-group=neo (ETC 6, HTC 36, JFC 166). Exclude from default catalog view, but
PRESENT in fixture tagged with real class, available via explicit class-filter
opt-in (same filter mechanism as APO/ATE/AMO/IEO). Honest to source, clean
default, zero extra UI.

OQ-6 — INV-014 tier structure. RESOLVED from Task 3 evidence (commit 9d4964a).
Task 3: encounter-flag was a near-perfect binary classifier. Two disjoint
populations, ~34× gap, zero overlap:
- Not-flagged (n=61): median 2,416 km, p95 12,716 km, WORST 38,867 km
- Encounter-flagged (n=6): median 1,340,190 km, p95 7,321,681 km, max 7,947,554 km
Every worst-error body was encounter-flagged. n=6 flagged bucket thin →
conclusion STRUCTURE solid (34× gap not chance) but flagged percentiles
directional not precise. Classifier is the encounter-flag itself, NOT a
curve-fitted km threshold.
LOCKED TIER STRUCTURE:
- not-Kepler-safe = CAD encounter-flag is PRIMARY classifier (any
  encounter-in-window body → not-Kepler-safe, special handling / visible
  warning). Secondary backstop: benchmark error beyond the not-flagged envelope.
  Grounded in physics + validated by data, not fitted to 6 points.
- visualization-tier = NOT encounter-flagged AND max propagation error within
  ~50,000 km (cleanly contains the observed n=61 not-flagged population, worst
  38,867 km, with margin). Normal Keplerian, honest.
- planning-tier = named UI/policy label between viz and not-safe ("Keplerian
  fine to look at, do NOT trust for mission targeting"). PRODUCT-CLAIM boundary,
  not a data boundary. Precise numeric semantics DEFERRED to when Slice 10
  consumes it. Named now so INV-014 structure is complete; not curve-fit to thin
  data.
Architectural note: primary classifier is the encounter-flag (categorical); the
km benchmark is validation + backstop, NOT the primary bar.

## §4 Phase structure

- Phase A — NEA catalog: SBDB bulk ingestion (41,902), quality fields, fixture
  build, INV-014 cutover harness (encounter-flag-primary tier assignment +
  ~50k km viz backstop).
- Phase B — Spatial index at 42k: ONE measurement pass evaluating uniform 0.5 AU
  vs coarse+sub-partition hybrid AND main-thread vs Web-Worker propagation;
  then rendering integration on whichever the data selects.
- Phase C — ui-hud unfreeze: external store, Preact overlay, virtualized
  searchable/filterable/sortable list, click-to-focus, quality down-rank+badge.
  TIGHT scope per OQ-4.
- Phase D — Manual verification (Hudson + Claude-in-Chrome visual QA).
- Phase E — Cutover + deploy.

Phase C is largest/most novel — first real UI. OQ-4 TIGHT boundary is the guard.

## §5 Tripwire

Biggest slice yet (3 distinct pieces). Estimate 5-6 weekends. If over budget,
decomposition is natural along the three thesis pieces; UI (Phase C) is the most
separable split.

## §6 Research provenance

Perplexity focused prompt Sections 1-4 + Deep Research "Architecture research for
Aster". Pre-research: Tasks 1+2 commit acc3ae1, Task 3 commit 9d4964a. Both
research passes flagged the literature/measurement boundary; all measurement-bound
items (OQ-1, OQ-2, OQ-6) resolved from this project's own fixture data, not
literature. Discarded: the Perplexity run's recursive "three-generation drill"
on uncertainty visualization (out of Slice 9 scope).

## §7 Status

SLICE 9 SCOPING COMPLETE. Every DEC and OQ resolved with data behind each. Next:
Phase A/B/C implementation dispatches written against this contract. Phase A
first (catalog + fixture + INV-014 cutover harness).
