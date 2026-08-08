# ORCHESTRATOR VERIFICATION — closes L4's UNADJUDICATED list

Marker: S-S17-GA12-AUDIT-2026-08-07-A
Actor: Claude Code (dispatch orchestrator, not a lens)
Baseline: main @ 94e1dac (Dispatch-A head; the dispatch permitted either this
or 1a1df13 — recording which)

L4 flagged five UNADJUDICATED items, four of them checkable. Because U-2 is by
L4's own statement "the one arithmetic fact on which the verdict turns," none of
these were left open before putting the verdict in front of Hudson. All four
checkable items are now closed. **No item escalates any finding to HIGH; the
G-A2 PASS verdict is unchanged.**

Read-only throughout: `node -e` over the committed JSON and standalone arithmetic
over published constants, plus `sed`/`grep`. No TS execution, no test runs, no
builds, no writes outside this file.

---

## U-1 — DEC-17-8's "163693 → 1 component" at Δ=2 — **CONFIRMED: L2 is right**

Read directly from the cited artifact `tools/slice17-research/data/s17-structure-7day.json`
(marker `S-S17-MEASURE-2026-08-04-E`):

```
liveMinPlus2  thresholdKm2S2: 8.756119518901183
  conn4 componentCount = 2 | cellCounts: 1,1
  conn8 componentCount = 2 | cellCounts: 1,1
```

`SLICE_17_FOUNDING.md:230-232` states "LOCKED from measurement (806745c). Δ=2 is
too tight (163693 → **1** component; structure disappears)". The cited artifact
gives **2**, under both connectivities. L2-08 / R-20 is confirmed as a real doc
error, not a plausible one.

**Disposition unchanged: LOW, doc-side §8 erratum (D-07).** The Δ=5 lock is
undisturbed — both Δ=2 components are singletons (`cellCount 1`, `breadthCells 1`),
so zero are practical under B_min=2 and the rationale's conclusion ("structure
disappears") holds under either count. Verified adjacent: `liveMinPlus5` gives 5
components, all singletons, matching the test fixture at `tests:324-328`.

---

## U-2 — "0 of 731 columns flip, 49.172 s margin" — **CONFIRMED, exactly**

L3's figure is reproduced to the digit, independently, over the anchor the tests
actually use (`tests/v2-segment-windows.test.mjs:62`, `DEP_START_JD = 2461041.500800741`):

```
columns: 731
date flips naive-vs-TDB-corrected: 0
closest column to a flip: col 243 | true time is 118.356 s before next midnight
offset that must be absorbed: 69.184 s
MARGIN: 49.172 s  -> SAFE
```

Column 243 and the 118.356 s / 49.172 s pair match L3 exactly. **R-02 stays MED;
G-A2 PASS holds.**

**One correction to the record, and one strengthening of L4's tripwire.** My first
pass used a risk metric measuring seconds *past* midnight rather than seconds
*before* the next midnight — the wrong side, since the error direction is forward
(+69.184 s). Corrected above; L3's direction was right and mine was wrong.

That first pass did, however, surface a fact worth carrying: the artifact exposes
**two** candidate epoch anchors, and they do not behave alike.

| anchor | source | flips of 731 |
|---|---|---|
| `2461041.500800741` | `span.requested.start.jdTdb` — what the tests use | **0** |
| `2461041.5` | `span.fixtureBounds.first.jdTdb` | **2** (columns 0 and 730) |

`2461041.5` is exactly midnight UTC, so the naive formula pushes it forward across
no boundary but the *corrected* value lands on the previous day — columns 0 and 730
flip. This sharpens L4's D-02 tripwire beyond "if any DEC-17-2 grid parameter
moves": **an anchor of `2461041.5` is present in the same artifact, one field away
from the correct one, and selecting it produces flipped dates immediately.** A3
must take the anchor from `span.requested.start`, not `span.fixtureBounds.first`.
Recommend this sentence be folded into D-02.

---

## U-3 — L1-01's transpose premise — **CONFIRMED**

`src/v2/porkchop/grid-compute.ts:175-221`: the departure loop is outer
(`for (const depJD of depGridJd)`), the TOF loop inner (`for (const tofDays of
tofGridDays)`), and a single `cellIndex` increments once per inner iteration. The
fill is therefore **TOF-fastest**, i.e. `index = depIndex * nTof + tofIndex`.

Both consumers agree: `porkchop-view.ts:265` and `:629` read
`cells[depIndex * gridParams.nTof + tofIndex]`.

`segment-windows.ts:33` declares `index = depIdx + nDep * tofIdx` — the exact
transpose. L1-01's premise holds; **R-01 stays MED and D-01 (the binding A3
entry condition with an asymmetric-fixture test) is necessary, not precautionary.**

---

## U-4 — `feasibleC3MaxKm2S2` in the screen cache — **CONFIRMED at 25**

`grep` over `tests/fixtures/v2/lambert-screen-cache.json` returns
`feasibleC3MaxKm2S2":25`. A forgotten injection is therefore invisible today,
which is exactly why R-03 is MED rather than sharper. **R-03 stays MED; D-03
stands as written.**

---

## U-5 — non-conflict

No action. L4 recorded it as a reader-trap, not a disagreement, and it is one.

---

## Effect on the verdict

None. Four of five UNADJUDICATED items closed, all confirming the lens that
raised them; the fifth was never a conflict. **G-A2: PASS at 0 open HIGH.
G-A1: ALL MATCH.** Counts after merge stand at 0 HIGH / 11 MED / 9 LOW.

One disposition is strengthened (D-02 gains the anchor-selection tripwire from
U-2) and one is upgraded from conditional to confirmed (R-20 / D-07 is a real
doc erratum, no longer "pending human verification"). Neither is a gate item.
