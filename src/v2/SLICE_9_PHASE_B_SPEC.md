# Slice 9 Phase B — Spatial-Index Measurement Harness (Design Spec)

**Status:** SPEC (Sun 2026-05-17). Implementation pending Phase A close.
**Contract source:** src/v2/SLICE_9_FOUNDING.md OQ-1 (resolved), OQ-2 (folded in).
**Decision this harness exists to make:** uniform-0.5AU-holds vs go-hybrid, AND
main-thread vs Web-Worker propagation at 42k — in ONE measurement pass, no wasted
second round (the lesson from Slice 8's 8AU→1AU two-pass correction).

This is a SPEC. It defines what the harness measures, how the decision is made
from its output, and the hard split between automatable (Node) and
browser-only-truthful (WebGL) measurement. Implementation is a later dispatch,
written against this committed contract, after Phase A closes.

---

## §1 Why this harness has an unusual shape

OQ-1 locked: uniform grid at 0.5 AU as working hypothesis, with the harness
INSTRUMENTED to evaluate the coarse-grid + sub-partition-dense-cells HYBRID
fallback IN THE SAME PASS. OQ-2 folded in: same harness measures main-thread vs
Web-Worker propagation at 42k. So this is three braided measurements, deliberately,
so the uniform-vs-hybrid and main-vs-worker decisions are made from direct
comparison data, not guess-then-remeasure.

The Slice 8 precedent: its perf harness was explicitly "observational, not a hard
gate" — Node asserted architectural correctness (cell counts, culling ratios),
the real 60fps verification was Hudson in-browser at Phase D. That split worked.
This spec applies the same split to a harder measurement.

---

## §2 The Node/WebGL truthfulness split (the core design constraint)

Frame cost, GPU instancing behavior, and Worker message-passing overhead DO NOT
EXIST in Node. A Node "frame budget" number is a proxy that cannot see the actual
bottleneck. This session has repeatedly been bitten by clean-looking numbers
measured in the wrong context (top-down test asserting an intermediate variable;
star-blob misdiagnosis). The harness MUST NOT repeat that.

**Node side — asserts only what Node can truthfully assert (automatable, runs
every commit, regression-guarded):**
- Partition correctness: for BOTH uniform-0.5AU and the hybrid, sum of per-cell
  body counts == total body count. No body lost, no body double-counted across
  partition boundaries.
- Hybrid structural validity: coarse cells that exceed the density trigger are
  correctly sub-partitioned; sub-cells tile their parent exactly; no gaps/overlaps.
- Body conservation across re-partition: a body that moves between cells (time
  scrub) is in exactly one cell before and after.
- Propagation CPU time, main-thread vs worker, as a PURE JS-EXECUTION measurement
  (Node CAN do this honestly — it's just JS run time for the Keplerian math over
  42k bodies; it is NOT a frame budget, it is a propagation-cost component). Report
  both; do not infer frame cost from it.
- Occupancy reproduction: confirm the harness's partitioner reproduces the
  pre-research Task-2 occupancy numbers at 0.5 AU (2,060 cells, max 1,177/cell)
  as a sanity check that the partitioner is correct before trusting any new numbers.

**Browser side — measures only what the browser can truthfully measure (Hudson
runs it, reads results in-page; NOT automatable, NOT a unit test):**
- Real WebGL frame time at 42k bodies under uniform-0.5AU cell-as-mesh, on the
  representative camera states (§4), against the 60fps bar.
- Real WebGL frame time at 42k under the hybrid partition, SAME camera states,
  SAME run/page so the comparison is apples-to-apples.
- Real Worker propagation: actual main-thread frame time with propagation on the
  main thread vs propagation offloaded to a Worker (message-passing overhead
  included — this is the part Node cannot see).
- All results displayed in-page (the Slice 8 Phase D pattern: Hudson reads numbers
  on real hardware, no autonomous pass/fail on frame cost).

**The uniform-vs-hybrid and main-vs-worker DECISIONS are made from the browser
numbers. The Node side guarantees neither strategy is structurally broken before
the browser measurement is even worth running.**

---

## §3 What "go hybrid" means concretely (so the decision is unambiguous)

Pre-research occupancy at candidate uniform sizes, vs Slice 8 baseline (main belt
1 AU = 178 cells / max 368, cell-as-mesh worked well at 60fps):
- 0.25 AU: 6,893 cells, max 264/cell
- 0.5 AU:  2,060 cells, max 1,177/cell  (working hypothesis)
- 1.0 AU:    540 cells, max 2,652/cell
- 2.0 AU:    171 cells, max 7,267/cell

The hybrid: a coarse uniform grid (candidate 1.0 or 2.0 AU — few cells, few
InstancedMesh objects) where any coarse cell exceeding a density trigger D is
recursively sub-partitioned into finer sub-cells (candidate 0.25 AU sub-grid)
ONLY for that dense cell. NEA distribution is bimodal (dense near-Earth clump +
sparse Amor/Apollo tail), so the hybrid's bet is: most space is sparse and wants
few coarse cells; the dense near-Earth clump wants fine cells; nowhere wants the
uniform-0.5AU compromise that is too-many-objects-everywhere AND still too-dense
in the clump.

Decision rule (made from §4 browser numbers):
- Uniform-0.5AU HOLDS if it sustains 60fps on ALL §4 camera states at 42k. Ship it
  (simplest, lowest code surface).
- GO HYBRID if uniform-0.5AU drops below 60fps on ANY §4 camera state AND the
  hybrid sustains 60fps on that same state in the same run. The instrumentation
  makes this a direct comparison, not a guess.
- If NEITHER sustains 60fps on some state, STOP, surface. That is a real
  architectural problem (42k may need GPU instancing changes or a body-budget cap)
  and a Hudson scoping decision, NOT a "tune D and rerun" loop.

D (the density trigger for sub-partitioning) is a working parameter, not locked
here — the harness measures at a few candidate D values in the same browser pass
so D is chosen from data, same measure-then-confirm discipline as every threshold
this session (8AU→1AU, ~50k km envelope, encounter-flag, T=180d).

---

## §4 Representative camera states (measured for every strategy, same set)

Mirror Slice 8 Phase D's camera-state coverage, adapted for NEA spatial reality
(near-Earth-clustered, not a clean belt):

1. Full-system overview — all 42k in frustum, max draw, the "can it even render
   the whole catalog" state.
2. Near-Earth focus — camera in the dense clump (the bimodal hot zone). This is
   the state uniform-0.5AU is predicted to struggle on (max 1,177/cell lives
   here). The decisive state.
3. Single-asteroid close focus — camera meters from one NEA, most cells
   frustum-culled. Tests culling efficiency at NEA scale.
4. Mid-zoom transit — camera moving through the clump (time-scrub + camera
   motion), the state that exercises per-frame re-partition + transform-write
   churn hardest.

Each strategy (uniform-0.5AU, hybrid at candidate D values) measured on ALL four,
same page, same session, so every comparison is apples-to-apples.

---

## §5 Hard constraints (carried into the implementation dispatch)

- v2 wall absolute. Keplerian propagator frozen. Slice 1-8.5 source frozen.
- Phase A fixture (post-re-anchor) is the body source — implementation is BLOCKED
  until Phase A closes (final body count, final fixture). This SPEC is not blocked;
  implementation is.
- Node assertions run every commit (regression guard). Browser measurement is
  Hudson-run, in-page, observational — NEVER an autonomous pass/fail on frame cost
  (the Slice 8 Phase D discipline).
- The harness MEASURES and the Node side ASSERTS STRUCTURE. It DECIDES NOTHING
  about uniform-vs-hybrid or main-vs-worker. Those are Hudson decisions from the
  browser numbers, same as OQ-6's tier numbers were Hudson's from Task 3 evidence.
- STOP conditions are real STOPs (surface, don't loop): neither strategy hits
  60fps on a state; Node finds a body lost across partition; occupancy
  reproduction fails (partitioner is wrong, every downstream number is suspect).

---

## §6 Why this is safe to design now (not fetch-gated)

The re-anchor (Phase A.2b, running) changes orbital-element FRESHNESS, not body
POSITIONS-in-space-at-a-given-epoch. Spatial occupancy and frame cost are about
where bodies sit and how they render, not about whether their elements came from
SBDB or a Horizons re-anchor. So the harness DESIGN is honestly doable now. Only
the IMPLEMENTATION needs the final fixture (for exact body count and to run
against real catalog data) — and implementation is explicitly the post-Phase-A
dispatch, written against this committed spec.

---

## §7 Status / next

- [x] Phase B harness design locked (Option 3 hybrid Node+browser split, Sun 2026-05-17)
- [ ] Commit this spec to repo as src/v2/SLICE_9_PHASE_B_SPEC.md
- [ ] Phase A.2b re-anchor completes (running, PID 88577) then Phase A.3 two-gate harness then Phase A closes
- [ ] THEN: Phase B implementation dispatch, written against this committed spec
- [ ] Browser measurement run by Hudson then uniform-vs-hybrid + main-vs-worker decided from data

Implementation order is fixed by dependency, not preference: spec commits now,
Phase A closes on its own timeline (10h fetch), Phase B implementation is written
against the committed spec the moment Phase A closes — cold-start eliminated.
