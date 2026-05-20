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
(Slice 7/8 pattern) is the WRONG mechanism at 42k scale. AMENDED Sun 2026-05-17
(post Phase-A.3 diagnostic, commit c5ca25b): SBDB bulk remains the source for
catalog MEMBERSHIP and METADATA at 42k scale (DEC-3's volume reasoning holds).
However, SBDB osculating ELEMENTS carry an epoch-staleness accuracy hole —
bodies with old element epochs propagate to million-km errors despite being
dynamically quiet. RESOLUTION: HYBRID ingestion. SBDB bulk for membership/
metadata/fresh-element bodies; Horizons RE-ANCHOR for the stale subset (element
epoch staleness beyond threshold T, T set in OQ-6 amendment); second-gate as
honest backstop for any stale body that cannot be re-anchored. This does not
overturn DEC-3 — it adds the Horizons-anchored accuracy layer that Slices 7/8
already established as the project's accuracy foundation, applied only where
staleness demands it. Bounded re-anchor (~12k bodies at >180d, not all 42k)
uses the Slice 8 9k-ingestion fail-closed/resume-safe/overnight pattern.

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

AMENDED Sun 2026-05-17 — STALENESS AXIS (orthogonal second failure mode).
Phase A.3 validated the encounter-flag classifier on the production fixture:
6/6 encounter-flagged → not-Kepler-safe, zero mis-tiered. The encounter-flag
classifier STANDS for dynamical failure. BUT 21 of 67 not-flagged sample bodies
exceeded the 50,000 km viz envelope (worst 15.4M km) — a ~400× discrepancy vs
Task 3 (which Horizons-anchored its sample). Diagnostic verdict (commit c5ca25b):
root cause (a) SBDB-epoch/quality gap, NOT non-Keplerian dynamics, NOT an
ingestion bug (Q3 audit clean). Q2 reproduction was decisive: Horizons re-anchor
collapses every worst offender to Task-3-regime error.
- Q1 separator: epoch staleness, Spearman rho 0.611 vs error (clearest; ecc
  0.387, condition_code 0.206, data_arc -0.192). Not perfectly disjoint like
  the encounter-flag was, but the clearest single predictor.
- Q4 population impact (full 41,775 viz-tier): staleness >180d: 11,804;
  >365d: 11,259; >730d: 9,968; >1460d: 7,924.
REVISED OQ-6 TIER STRUCTURE — TWO orthogonal gates, both must pass for viz-tier:
* Gate 1 (dynamical, UNCHANGED): NOT CAD encounter-flagged. Flagged →
  not-Kepler-safe. (Validated 6/6 on production fixture.)
* Gate 2 (data freshness, NEW): element epoch staleness within threshold T,
  OR the body was Horizons re-anchored during ingestion (hybrid path). Stale-
  and-not-re-anchored → not-Kepler-safe (the second-gate backstop).
* visualization-tier = passes BOTH gates.
* planning-tier: unchanged (named UI/policy label, semantics deferred to S10).
STALENESS THRESHOLD T: set at 180 days as the working value (Q1 within-envelope
max was 46,324 km; the clean ~40 bodies cluster below ~180d staleness; >180d is
where the over-envelope population concentrates). T is the re-anchor trigger AND
the second-gate trigger. T is revisitable if Phase A re-anchor measurement shows
a cleaner cut, same measure-then-confirm discipline as every other threshold.
The ~50,000 km benchmark remains a VALIDATION backstop in the cutover harness
(post-re-anchor, the re-anchored bodies must fall within it — that's how the
harness proves the hybrid worked), NOT a primary per-body classifier.

AMENDED Tue 2026-05-19 — SECOND AMENDMENT (post Phase A.3 cutover-sample validation).
Phase A.3 cutover harness construction surfaced two specific failure modes the
hybrid (first amendment) did not catch on production-scale stratified sampling.

Finding 1 — T=180d is too lenient.
162-body stratified sample (commit 8c33760 fixture): 12 of 15 viz-tier
backstop failures were sbdb-source bodies at 161d staleness (just under the
180d gate), errors 50k–690k km. The cliff is below 180d.
RESOLUTION: tighten T to 90d (working value, half of the original threshold,
clearly below the observed failure cluster). The stale subset expands
accordingly; bodies between 90d and 180d are now re-anchor candidates.
Same measure-then-confirm posture as every threshold this session — T=90d is
the working value, revisitable if Phase A.3 surfaces a cleaner cut.

Finding 2 — anomaly-tail bodies are not Keplerian-safe by class.
3 of 15 viz-tier failures were JFC bodies (Jupiter-family comets), all
horizons-reanchor at 0d staleness, errors 55–80k km. The two-body Keplerian
approximation does not model non-gravitational forces (outgassing, jets,
YORP/Yarkovsky-amplified for cometary nuclei) that affect cometary bodies
over any meaningful window. The anomaly tail (ETC + HTC + JFC, 208 bodies
per A.1 ingestion) is dynamically distinct from asteroid NEAs and the 50k km
envelope was derived from asteroid Task 3 data, not comet data.
RESOLUTION: classify ALL 208 anomaly-tail bodies (orbital class in
{ETC, HTC, JFC}) as not-Kepler-safe, regardless of encounter-flag or
freshness. A third orthogonal classifier, by CLASS. This is physics-grounded
(cometary dynamics), not curve-fit. The anomaly tail was already excluded
from default UI view per the OQ resolution; this aligns the INV-014 tier
with the UI exclusion — neither the renderer nor the planner should treat
these as Keplerian-safe.

REVISED OQ-6 TIER STRUCTURE (replacing the first amendment's two-gate
structure, three orthogonal classifiers now):
- Gate 1 (dynamical, UNCHANGED): NOT CAD encounter-flagged. Flagged →
  not-Kepler-safe.
- Gate 2 (freshness, AMENDED): staleness within T=90d OR anchorSource ==
  "horizons-reanchor". Stale-not-re-anchored → not-Kepler-safe.
- Gate 3 (class, NEW): orbital class NOT in {ETC, HTC, JFC}. Anomaly-tail
  cometary body → not-Kepler-safe.
- visualization-tier = passes ALL THREE gates.
- planning-tier: unchanged (named UI/policy label, semantics deferred to S10).

AMENDED Wed 2026-05-20 — THIRD AMENDMENT (post Phase A.3 cutover-sample
validation + quality-axis diagnostic 6f26d23).

Finding: Phase A.3 cutover-sample re-check after Path A re-anchor surfaced
ONE viz-tier failure (2026 GG: APO, sbdb, 25d staleness, conditionCode=8,
dataArcDays=13, max error 91,315 km). The three existing gates all pass it
through; the body propagates badly anyway. Hypothesis was a fourth gate by
orbit-determination quality (condition_code + data_arc, DEC-4's named risk
axis).

Diagnostic 6f26d23 result: graded distribution, NOT a clean cliff.
- 168-body stratified sample across the quality-risk subpopulation
- 2/168 (1.2%) over the 50k km envelope
- Median 3,110 km, p90 10,903 km, p95 14,952 km, max 91,315 km
- Every candidate Gate 4 threshold would crater viz-tier from 99.35% to
  47-75% to capture only 2-5% measured in-band over-envelope rate
- APO is the most quality-sensitive class (2/59, 3.4%); other classes
  showed zero in-sample over-envelope failures
- No million-km failures; no fifth orthogonal failure mode

RESOLUTION: accept-and-document, NOT Gate 4. Gate 4 at any candidate
threshold would impose massive coverage loss for a small measured capture
rate — the residual quality-driven failure is graded and rare enough that
it cannot be classified without curve-fit thresholds that under-deliver the
full-catalog thesis worse than the residual itself does.

REDEFINED viz-tier CONTRACT (replacing the prior "every viz-tier body has
max propagation error within 50k km" assertion):

viz-tier = body passes all three orthogonal classifier gates:
  Gate 1: NOT CAD encounter-flagged (dynamical)
  Gate 2: element-epoch staleness <= T=90d OR anchorSource ==
          "horizons-reanchor" (freshness)
  Gate 3: orbital class NOT in {ETC, HTC, JFC} (non-cometary)

The three-gate pass is the contract. The 50,000 km propagation envelope
is now a STATISTICAL EXPECTATION over the viz-tier population, not a
per-body assertion. The measured residual envelope-exceedance rate from
quality-driven failures is ~1-2% of viz-tier population, documented
here as a known limitation. This is honest given the alternative is
pretending the catalog is more accurate than it is, or excluding ~25%+
of the catalog to chase a 1-2% residual.

Affected bodies are disproportionately APO class with conditionCode >= 7
and dataArcDays < 30 (recently-discovered or poorly-observed Earth-crossers).
Slice 10 mission-target heuristics SHOULD consider these quality fields
as targeting risk signals even if they don't affect rendering tier.

This third amendment is the LAST. The classifier-based INV-014 architecture
has converged: three gates capture the dominant failure modes, residual is
measured and small. Further "gates" would be curve-fit and net-negative.

## §4 Phase structure

- Phase A — NEA catalog, HYBRID ingestion: (A.1 SBDB bulk pull — DONE, commit
  5620669) → (A.2 fixture builder — DONE, commit 72793d8, reused as-is) →
  (A.2b NEW: Horizons re-anchor the stale subset, staleness >T=180d, fail-closed/
  resume-safe/overnight per Slice 8 9k pattern; re-anchored elements replace SBDB
  elements in the fixture; non-stale bodies keep SBDB elements) → (A.3 cutover
  harness, REVISED: validates BOTH OQ-6 gates — every encounter-flagged →
  not-Kepler-safe AND every viz-tier body (post-re-anchor) within the 50k km
  envelope AND every stale-not-re-anchored body → not-Kepler-safe). A.3 was
  blocked by the OQ-6 invalidation; it unblocks once A.2b lands and the revised
  harness is written against the two-gate structure.
  Tue 2026-05-19 second amendment tightened T 180d→90d; A.2b re-anchor
  extended via incremental run to cover the 90-180d subset on top of existing
  180d+ coverage.
  Wed 2026-05-20 third amendment redefined viz-tier contract as three-gate
  pass + documented statistical residual. The A.3 harness asserts gate-pass
  classifications hard; the 50k km envelope is asserted as a population-level
  expectation with documented residual rate, not as a per-body STOP condition.
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

Sun 2026-05-17: OQ-6 amended (staleness axis, two-gate structure). DEC-3
amended (hybrid ingestion). Phase A.1/A.2 valid and committed. Phase A.2b
(Horizons re-anchor stale subset) is the next implementation dispatch. A.3
unblocks after A.2b. Scoping is complete again — the amendment resolves the
only open item (the A.3 OQ-6 invalidation).

Wed 2026-05-20: PHASE A CLOSED.
Path A executed (29,792/29,792 re-anchored, zero unresolved).
Anomaly-tail Gate 3 applied (208 cometary bodies → not-Kepler-safe).
Phase A.3 three-gate cutover harness committed, all gates passing.
Viz-tier contract redefined per third amendment as three-gate pass +
documented statistical residual (1/61 = 1.6% envelope exceedance in the
committed cutover sample, quality-driven and predominantly APO).

Final inv014Tier distribution across 41,906 NEAs (from committed
post-swap fixture):
- visualization-tier: 41,558 (99.17%)
- not-Kepler-safe: 348 (0.83%)
  * encounter-flagged: 131
  * stale-unanchored: 58 (A.2b residue, all from initial run; A.2b-extension had 0)
  * anomaly-tail: 208
- planning-tier: 0 (UI/policy label, semantics deferred to S10)

Measured residual envelope-exceedance rate (viz-tier sample):
1/61 = 1.6% (2026 GG at 91,315 km; APO, conditionCode=8, dataArcDays=13).
This is documented per the third amendment as a known limitation rather than
a fourth classifier gate.

By-class staleness/quality sensitivity insight (for Slice 10 reference):
APO is the most quality-sensitive class along both axes (72% over-envelope at
90-180d staleness; 3.4% over-envelope in the quality-risk sample). Slice 10
mission-target scoring should treat APO conditionCode + dataArc as targeting
risk signals even though they don't affect rendering tier.

Phase A is closed. Ready for Phase B implementation against the committed
Phase B spec (c444609).
