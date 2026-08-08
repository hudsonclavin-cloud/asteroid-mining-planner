# L1 — MATHEMATICIAN LENS

Marker: S-S17-GA12-AUDIT-2026-08-07-A
Module under audit: `src/v2/porkchop/segment-windows.ts` (280 lines, introduced e8182e4)
Spec: `SLICE_17_FOUNDING.md` §3 (DEC-17-1, DEC-17-2, DEC-17-3, DEC-17-8), §8 AMENDMENT A2
Method: static reading only. No execution, no build, no tests run, no edits outside this file.
Fresh session; no author claims consulted.

---

## Verdict summary (0 HIGH / 3 MED / 5 LOW)

All seven audited property groups hold **as written against the module's own stated
contract**. The core math is correct: membership, 8-connectivity, threshold resolution,
the A2 (N-1) breadth derivation, order-independent classification, flat-index arithmetic,
and every named numerical edge case check out. I found no locked-DEC violation and no
input the module itself mishandles.

The three MED findings are all *contract-boundary* defects — places where the module is
internally right but hands a trap to its first consumer (A3) or to a direct caller of an
exported helper. L1-01 is the one that matters: the module's declared flat-index
convention is the exact **transpose** of the convention the existing porkchop pipeline
already uses two files away, and the module's own shape validator provably cannot detect
the mistake on the locked 731×100 grid.

G-A2 recommendation: **PASS from this lens** (0 HIGH). L1-01 should be converted into a
binding A3 entry condition rather than left as advice — see its reasoning.

---

## Findings

| ID | SEVERITY | One-line | file:line |
|----|----------|----------|-----------|
| L1-01 | MED | Declared flat-index convention is the exact transpose of the existing porkchop pipeline's; a naive A3 adapter silently swaps the departure and TOF axes and passes the shape check | `src/v2/porkchop/segment-windows.ts:33` vs `src/v2/porkchop/porkchop-view.ts:265` |
| L1-02 | MED | `classifyComponents` bestPractical is input-order-dependent under an exact `minC3` tie, contradicting its own doc claim "input order does not matter" | `src/v2/porkchop/segment-windows.ts:142-143,152-158` |
| L1-03 | MED | Absolute mode silently falls back to the literal `25` that the module's own comment says must never ship, instead of refusing | `src/v2/porkchop/segment-windows.ts:86-91,133` |
| L1-04 | LOW | `nDepIdx`/`nTofIdx` (neighbour index) collide by naming convention with `nDep`/`nTof` (counts) inside the one bounds check that guards wraparound | `src/v2/porkchop/segment-windows.ts:248-253` |
| L1-05 | LOW | `jdToIsoDate` treats a TDB JD as UTC (documented), and throws a raw `RangeError` on a non-finite `depStartJd`/`depCellDays` that the shape validator never checks | `src/v2/porkchop/segment-windows.ts:94-96,182-192` |
| L1-06 | LOW | `ResolvedThreshold` carries neither the live minimum nor the Δ used, so a DEC-17-5-compliant consumer cannot derive the disclosed Δ from the result and is pushed toward a literal | `src/v2/porkchop/segment-windows.ts:68-73,123-135` |
| L1-07 | LOW | Membership narrows DEC-17-1 by excluding converged cells with non-finite c3 (notably −Infinity); the narrowing is correct and documented in-module but is not absorbed into the founding doc | `src/v2/porkchop/segment-windows.ts:10-11,197-207` |
| L1-08 | LOW | `deltaKm2S2` / `bMinCells` are unvalidated; a NaN in either silently yields zero components or a spurious NO-PRACTICAL-WINDOW instead of a refusal | `src/v2/porkchop/segment-windows.ts:128,193` |

### L1-01 — MED — flat-index convention is the transpose of the existing pipeline's

`segment-windows.ts:33` declares, in the `SegmentGrid` interface:

```
/** Row-major, departure varies fastest: index = depIdx + nDep * tofIdx. */
```

The existing porkchop pipeline uses the opposite. `grid-compute.ts:175-221` fills `cells`
with the **departure loop outer and the TOF loop inner** (`for (const depJD of depGridJd)
{ for (const tofDays of tofGridDays) { cells[cellIndex] = …; cellIndex += 1; } }`), i.e.
TOF varies fastest. Two consumers confirm and depend on that ordering explicitly:
`porkchop-view.ts:265` (`cells[depIndex * gridParams.nTof + tofIndex]`) and
`porkchop-view.ts:629` (same arithmetic). `PorkchopGridResult`
(`grid-compute.ts:52-55`) carries only `cells` and `compute_ms` — it does **not** carry
`nDep`/`nTof`, and it documents no ordering at all, so the convention is implicit on the
producer side and stated only on the consumer side.

`index = depIdx + nDep * tofIdx` and `index = depIdx * nTof + tofIdx` are exact
transposes of one another. DEC-17-2 locks the compare view's source of truth to a live
grid at 731×100, and A3 (§4) is specified as "serial N-grid orchestration at 731×100 with
the worker seam's reduced cell transfer" — meaning A3's job is precisely to convert
`PorkchopCell[]` into `SegmentGridCell[]`. The obvious implementation of that conversion
is an element-wise `cells.map(c => ({ c3: …, converged: … }))`, which preserves the
producer's ordering and therefore feeds `segmentWindows` a transposed grid.

What makes this a finding against the audited module rather than a hypothetical A3 bug is
that the module's own guard **cannot catch it**. The shape validator at lines 182-192
tests `cells.length !== nDep * nTof`. Under a transposed feed the caller still passes
`nDep = 731, nTof = 100` and still passes 73,100 cells, and `731 * 100 === 100 * 731`, so
the check passes. The module then decodes `depIdx = idx % 731` on an array whose stride is
100, silently reinterpreting the TOF axis as the departure axis. Every downstream number
is wrong in a way that still looks plausible: `breadthCells` would measure extent along
TOF instead of departure, `breadthDays` would multiply that by `depCellDays`,
`tofSpanDays` would multiply a departure extent by `tofCellDays`, and `argmin.depJd` /
`argmin.dateIso` would be a TOF index rendered as a calendar date. `minC3` and
`cellCount` would be unaffected (they are order-invariant over the member set — see the
VERIFIED note under property 6), so a spot check of the global minimum against the
committed artifact would **pass** while breadth, the entire point of Slice 17 per §1,
would be garbage. Since B_min filters on `breadthCells`, the practical/no-practical
classification and therefore the default sort of the compare table would be wrong too.

Severity call: MED, not HIGH, because the module is correct against its own explicitly
documented contract (line 33), the misuse lives in code that does not yet exist, and no
locked DEC is violated. But it is the highest-value finding in this lens, and I recommend
it be treated as a binding A3 entry condition rather than advice: either (a) A3's adapter
carries an explicit transpose plus a test that asserts a known asymmetric fixture
(nDep ≠ nTof, with a deliberately non-square component) round-trips with breadth on the
departure axis, or (b) the module is hardened to take the ordering as an explicit
discriminated field so a mismatch is a type error rather than a silent transpose. If A3
lands an element-wise adapter with no transpose, this becomes HIGH at that commit.

### L1-02 — MED — `classifyComponents` is order-dependent under an exact minC3 tie

Lines 142-143 state: "bestPractical is the true minimum-C3 practical component (DEC-17-3),
found by scan — input order does not matter." The scan at lines 153-158 uses a strict
comparison:

```
if (best === null || component.minC3 < best.minC3) { best = component; }
```

Strict `<` means that among practical components sharing the **same** `minC3`, the one
that appears **first in the input array** wins, and its `argmin` (departure date and TOF)
is what `bestPractical` reports. The claim in the doc comment is therefore false for exact
ties. Permuting the input changes `bestPractical.argmin` — the reported launch date — even
though `bestPractical.c3` is unchanged.

Inside `segmentWindows` this is harmless and DEC-17-3 is satisfied, because line 277 sorts
`components` with `compareByMinC3` **before** classification, and `compareByMinC3`
(lines 99-107) is a total order on distinct components: it breaks minC3 ties on
`argmin.depJd` and then on `argmin.tofDays`, and two distinct components cannot share an
argmin cell, so the sort is deterministic and independent of the DFS discovery order.
`bestPractical` is then necessarily the first practical element, matching the interface
doc at line 80.

The exposure is the **exported** helper. Lines 137-140 state the function was deliberately
separated "so the artifact's component summaries can exercise it directly — the committed
measurement artifact stores summaries, not per-cell grids", and
`tests/v2-segment-windows.test.mjs:12-17` confirms the artifact-fixture tests operate on
summaries. A caller feeding unsorted summaries — or, more realistically, summaries whose
`minC3` was **rounded** on its way into a JSON artifact, which makes exact ties go from
essentially impossible to merely uncommon — gets an order-dependent argmin from a function
that documents itself as order-independent. Fix is one character (`<` → a tie-break on
`compareByMinC3`, or sort inside the helper); the doc claim should not be left overstating
the guarantee either way.

### L1-03 — MED — absolute mode silently ships the literal it says must never ship

Lines 86-91 carry an unusually explicit warning on `DEFAULT_ABSOLUTE_KM2S2`:

```
 * Fallback only. DEC-17-5 rider (a): the compare surface must disclose the
 * feasibility boundary from a runtime read of metadata.feasibleC3MaxKm2S2 —
 * the post-audit consumer MUST inject that value, never ship this literal.
export const DEFAULT_ABSOLUTE_KM2S2 = 25;
```

Line 133 then does `params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2`. A consumer that
forgets to inject gets the literal, silently, with no signal in the returned
`ResolvedThreshold` distinguishing "injected 25" from "defaulted to 25". DEC-17-5 states
"Compare-surface labels are DERIVED, never literal constants — F1/F4 (§11) show what
literals cost", and F1 (§11) is precisely the finding that the live porkchop view "works
because GRID_PARAMS happens to end inside the fixture" — a correct result guarded by luck.
This default is the same pattern: today `tests/fixtures/v2/lambert-screen-cache.json`
carries `"feasibleC3MaxKm2S2":25`, so a forgotten injection is invisible; if that metadata
value ever changes, the compare surface tags feasibility against a stale boundary while
labelling it as a runtime read.

Contrast with `DEFAULT_DELTA_KM2S2 = 5` (line 85), where a default is entirely appropriate
— Δ=5 is locked by DEC-17-8 from measurement 806745c, so the constant *is* the spec. The
asymmetry is the tell: the module already knows one of its two defaults is illegitimate
and provides it anyway. The consistent resolution is to make `absoluteKm2S2` required when
`thresholdMode === 'absolute'` (the discriminated-union form of `SegmentParams` makes this
a compile-time obligation), or to throw in absolute mode when it is absent — matching the
validate-and-refuse posture the module already takes for connectivity (176-180) and grid
shape (182-192), and matching DEC-17-10's stated philosophy ("validation not clamping").

Severity: MED, not HIGH — the module cannot emit a wrong number on its own, and DEC-17-5
binds the consumer surface rather than this module. But the wrong number it enables is a
feasibility tag, which is a trust-surface number under INV-025/026.

### L1-04 — LOW — neighbour-index names collide with count names in the wraparound guard

Lines 248-253:

```
const nDepIdx = depIdx + dDep;
const nTofIdx = tofIdx + dTof;
if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) { continue; }
const nIdx = nDepIdx + nDep * nTofIdx;
```

Here the `n` prefix means "neighbour" in `nDepIdx`/`nTofIdx`/`nIdx` but "number of" in
`nDep`/`nTof` — two different meanings of the same prefix, four symbols apart, inside the
single expression whose correctness prevents flat-index wraparound across a row boundary.
The code is correct as written (see property 6 VERIFIED), but `nDepIdx >= nDep` reads as
though it compares two members of the same family, and a future edit that reaches for the
"wrong" one of a same-prefixed pair is exactly how the classic 8-neighbour wraparound bug
is introduced. `neighborDepIdx` / `neighborTofIdx` / `neighborIdx`, or `depCount`/
`tofCount`, removes the hazard at zero behavioural cost.

### L1-05 — LOW — JD→ISO conversion: documented TDB/UTC conflation, undocumented throw

`jdToIsoDate` (lines 94-96) computes `new Date((jd - 2440587.5) * 86_400_000)
.toISOString().slice(0, 10)`. Two observations.

First, 2440587.5 is the **UTC** Unix epoch as a Julian Date, while `SegmentGrid.depStartJd`
is documented as "JD (TDB)" (line 28). The conversion therefore treats a TDB instant as
UTC, an offset of roughly 69 s at the current epoch. This is disclosed at lines 51-54
("the ~69 s TDB−UTC offset can shift dates only within 69 s of midnight"), and the bound is
correct: the rendered calendar date is wrong only when the argmin departure falls within
~69 s of midnight UTC. At the locked 7.004109589041096 d cell width the argmin epochs are
effectively arbitrary within the day, so the incidence is ~69/86400 ≈ 0.08 % of argmins.
Recorded as accepted-and-disclosed, not as a defect.

Second, `Date.prototype.toISOString` **throws** `RangeError: Invalid time value` for a NaN
or out-of-range time value. `depJd = grid.depStartJd + argDep * grid.depCellDays`
(line 262) is not validated: the shape validator (182-192) checks `nDep`, `nTof` and
`cells.length` only, and never checks that `depStartJd`, `depCellDays`, `tofMinDays` or
`tofCellDays` are finite. A caller passing a NaN `depStartJd` therefore gets a raw
`RangeError` from deep inside a date formatter rather than the module's own legible
`grid shape mismatch: …` style refusal. Low likelihood (the compare view's grid params
come from real JDs), zero-cost fix (extend the existing validator), and it fits the
module's established refuse-loudly posture.

### L1-06 — LOW — `ResolvedThreshold` cannot support the DEC-17-5 disclosure it enables

`ResolvedThreshold` (lines 68-73) carries `mode` and `valueKm2S2` and nothing else. In
relative mode `valueKm2S2 = liveMin + delta` (line 129) — the two inputs are added and
then discarded. DEC-17-8 requires "Δ is DISCLOSED in UI copy", and DEC-17-5 requires
"Any span or resolution shown is read from the computation that produced the numbers", with
"Compare-surface labels are DERIVED, never literal constants". A consumer holding only a
`SegmentWindowsResult` cannot recover either Δ or the live minimum from it, so the only
way to render "no practical window at Δ=5" (DEC-17-3's required copy, quoted verbatim in
§3) is to re-state the 5 as a literal in the view — precisely the literal-vs-derived
pattern OQ-17-6 flags and F1/F4 cost. Surfacing `liveMinKm2S2` and `deltaKm2S2` (and, per
L1-03, whether the absolute value was injected or defaulted) on `ResolvedThreshold` makes
the compliant consumer the easy one to write. This is an API-completeness observation
against a downstream DEC, not a math defect.

### L1-07 — LOW — membership narrows DEC-17-1 for non-finite c3; correct, but not in the doc

DEC-17-1 defines membership as "the selected branch is converged AND its c3 ≤ T", and
names exactly two hole classes: "Non-converged cells are holes". The module additionally
requires `Number.isFinite(cell.c3)` (line 204), and states the rationale at lines 197-200:
without it, "an all-Infinity grid under relative mode (T = Infinity) would emit a garbage
component instead of no members."

That reasoning is sound and I verified the case it names. For `+Infinity` and `NaN` the
extra predicate is mostly redundant — `NaN <= T` is `false` for every `T`, and
`Infinity <= T` is `false` for every finite `T` — so it only bites in the single scenario
the comment describes, where the eligible set is empty, `liveGridMin` returns `Infinity`
(lines 113-121), `T = Infinity + delta = Infinity`, and `Infinity <= Infinity` would
otherwise be `true`. There the guard is load-bearing and correct.

The one genuinely *narrowing* case is a converged cell with `c3 === -Infinity`. Read
literally, DEC-17-1 admits it (`-Infinity <= T` for any `T`); the module makes it a hole in
both modes. Treating a `-Infinity` C3 as garbage rather than as the best window in the grid
is obviously the right answer, and it is documented in-module at lines 10-11 and 197-200 —
so I am not scoring this as a silent resolution. What is missing is the round trip: the
founding doc's membership rule still reads as a two-class hole definition, and DEC-17-1 is
LOCKED. Per the slice's own additive-amendment discipline (the §8 A1 and A2 precedents),
the correct disposition is a short §8 amendment recording "non-finite c3 is a hole,
equivalent to null" as the convention of record, so the code and the locked DEC agree on
the page rather than only in a comment.

### L1-08 — LOW — no validation of the two injected scalars

`params.deltaKm2S2 ?? DEFAULT_DELTA_KM2S2` (line 128) and `params.bMinCells ??
DEFAULT_B_MIN_CELLS` (line 193) both accept whatever they are given. `??` only substitutes
for `null`/`undefined`, so a NaN passes through. NaN Δ makes `T` NaN, every `c3 <= T`
comparison `false`, and the result an empty component list with a NaN threshold — reported
as "this grid has no windows" rather than as a refusal. NaN `bMinCells` makes every
`breadthCells >= bMinCells` test `false`, so `practical` is empty and `bestPractical` is
`null` — indistinguishable from a genuine NO-PRACTICAL-WINDOW state, which DEC-17-3 makes
a *displayed* claim about the body ("no practical window at Δ=5"). A garbage input thus
produces a confident false statement about an asteroid rather than an error. Non-integer
or ≤1 `bMinCells` is a milder version of the same (with `bMinCells <= 1` every component is
practical, since `breadthCells >= 1` always). One `Number.isFinite` check apiece, in the
validator that already exists at lines 182-192.

---

## VERIFIED list

### 1. MEMBERSHIP — VERIFIED

`segment-windows.ts:201-207` builds the mask:

```
if (cell.converged && cell.c3 !== null && Number.isFinite(cell.c3) && cell.c3 <= T) {
  member[i] = 1;
}
```

- **converged required** — first conjunct, line 204. Matches DEC-17-1 ("the selected branch
  is converged"). Non-converged cells never enter `member`, are never pushed to the stack
  (line 254 gates on `member[nIdx]`), and are never seeds (line 214) — so they are holes in
  the strong sense and **do split components**, as DEC-17-1 requires, because the flood fill
  can only traverse member cells.
- **null c3 is a hole** — second conjunct, line 204, matching the `c3: number | null`
  declaration at line 21 ("null = no value (hole)").
- **ties at T inclusive** — the comparison is `<=`, line 204, not `<`. Matches DEC-17-1
  "Ties at T inclusive (c3 ≤ T)" verbatim. In absolute mode with `absoluteKm2S2: 25` a cell
  with `c3 === 25` is a member with no floating-point ambiguity whatsoever: both operands
  are the exact double 25.
- **holes are never members** — there is exactly one write to `member` (line 205), inside
  the single guarded branch; no later code sets `member[i] = 1`.
- **holes are never dereferenced as numbers** — `cells[idx].c3 as number` (line 233) is only
  reached for popped indices, and every pushed index passed `member[…]` (lines 214, 254), so
  the cast is sound.

The `Number.isFinite` conjunct is an addition beyond DEC-17-1's letter; it is correct and
in-module documented — see L1-07 for the doc-alignment note.

### 2. CONNECTIVITY — VERIFIED

- **8-connectivity** — `NEIGHBOR_OFFSETS_8` (lines 165-169) contains exactly the eight
  offsets `(-1,-1) (0,-1) (1,-1) (-1,0) (1,0) (-1,1) (0,1) (1,1)`. I checked: eight entries,
  all distinct, `(0,0)` correctly absent, all four diagonals present. This is the Moore
  neighbourhood, matching DEC-17-1 "CONNECTIVITY = 8. LOCKED".
- **conn4 throws, does not degrade** — lines 175-180:

```
const connectivity = params.connectivity ?? 8;
if (connectivity !== 8) {
  throw new Error(`connectivity ${connectivity} not implemented: conn8 is LOCKED (DEC-17-1)`);
}
```

  The throw is unconditional for any value other than 8, it precedes all work, and the
  message names the locked DEC. Note the defence is doubled: `SegmentParams.connectivity`
  is typed `?: 8` (line 44), so `connectivity: 4` is a compile-time error *and* a runtime
  throw — the runtime guard survives a JS caller or an `as any` cast. There is no branch
  anywhere in the file selecting a 4-neighbour offset set; `NEIGHBOR_OFFSETS_8` is the only
  offset table and is referenced exactly once (line 247).

### 3. THRESHOLD RESOLUTION — VERIFIED

- **relative** — `resolveThreshold` lines 127-130: `valueKm2S2: liveMin + delta`, with
  `delta = params.deltaKm2S2 ?? DEFAULT_DELTA_KM2S2`.
- **liveGridMin is over converged, finite cells only** — lines 113-121:
  `if (cell.converged && cell.c3 !== null && Number.isFinite(cell.c3) && cell.c3 < min)`.
  The predicate is identical to the membership predicate minus the `<= T` clause, which is
  the correct relationship (the live minimum must be drawn from the same eligible
  population that can become members). Non-converged cells cannot drag the threshold down —
  and `tests/v2-segment-windows.test.mjs:84-89` documents that its hole fixture carries
  `c3: 0.25`, below every test threshold, specifically so the `converged` flag is
  load-bearing in both places.
- **empty eligible set** — `min` initialises to `Infinity` (line 114) and is returned
  unchanged, giving `T = Infinity`, which the `ResolvedThreshold` doc at lines 70-72
  declares as the intended contract.
- **absolute ignores liveGridMin** — lines 131-134 return
  `params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2` with no reference to the `liveMin`
  parameter. Verified by reading: `liveMin` appears exactly once in the function body
  (line 129), inside the relative branch. `liveGridMin(cells)` is still *computed* at
  line 194 in absolute mode — an O(n) waste on 73,100 cells, but semantically inert.
- **defaults** — `DEFAULT_DELTA_KM2S2 = 5` (line 85) matches DEC-17-8 "Δ = 5 km²/s².
  LOCKED from measurement (806745c)". `DEFAULT_ABSOLUTE_KM2S2 = 25` (line 91) matches
  DEC-17-8 "FEASIBILITY (viability tag): absolute 25 km²/s²" and the fixture metadata
  `"feasibleC3MaxKm2S2":25`. See L1-03 on whether the absolute default should exist at all.
- **mode is echoed truthfully** — the returned `mode` (lines 129, 132) always matches the
  branch taken, so a consumer can never mislabel which rule produced the number.

### 4. BREADTH — VERIFIED (AMENDMENT A2 binding satisfied)

- **breadthCells is measured on the grid** — line 261: `const breadthCells = maxDep -
  minDep + 1`, where `minDep`/`maxDep` are accumulated over popped member cells at lines
  242-243 from `depIdx`, the decoded departure column. No day value participates.
- **breadthDays is derived, `(N-1)` form** — line 271:
  `breadthDays: (breadthCells - 1) * grid.depCellDays`. This is exactly the formula
  AMENDMENT A2 names as correct and binds ("src/v2/porkchop/segment-windows.ts
  breadthDays = (breadthCells - 1) * depCellDays … The (N - 1) convention is CORRECT and
  stands", §8 lines 452-453, 457). `breadthDays` is written in exactly one place — this
  literal — and is never read back to compute anything else.
- **no `N * cellDays` formula anywhere in the module.** I enumerated every multiplication
  by a cell width in the file. There are exactly four:
  - line 262 `grid.depStartJd + argDep * grid.depCellDays` — an *offset from column 0*, not
    a span. Correct: `argDep = 0` yields `depStartJd`, matching the interface's "JD (TDB) of
    departure column 0" (line 29).
  - line 268 `grid.tofMinDays + argTof * grid.tofCellDays` — same offset form on the TOF
    axis, correct for the same reason.
  - line 271 `(breadthCells - 1) * grid.depCellDays` — the A2 span form.
  - line 273 `(maxTof - minTof) * grid.tofCellDays` — also `(N-1)` form, since
    `maxTof - minTof` is already `tofSpanCells - 1`. Consistent with the same convention on
    the TOF axis, and matching the interface doc at line 65 ("(tof-index span) *
    tofCellDays").

  A repo-wide grep for `breadthCells`/`breadthDays` returns only this module and
  `tests/v2-segment-windows.test.mjs`; the test file derives cells from days as
  `round(breadthDays/depCellDays)+1` (test header lines 7-8), which is the exact inverse of
  the `(N-1)` rule and therefore concurs rather than conflicting. **No violation of the
  locked A2 convention exists.**
- **`breadthCells` really is "count of distinct departure columns spanned", not merely a
  bounding-box width.** `maxDep - minDep + 1` counts the bounding interval, which in
  general could exceed the number of *occupied* columns. Under 8-connectivity it cannot.
  Proof: every offset in `NEIGHBOR_OFFSETS_8` has `|dDep| <= 1` (lines 166-168), so along
  any path within a component the departure index changes by at most 1 per step. Take a
  cell at column `minDep` and a cell at column `maxDep`; both are in the component, so a
  member path connects them, and by discrete intermediate-value the column sequence along
  that path attains every integer in `[minDep, maxDep]`. Hence every column in the interval
  is occupied and the two quantities coincide. (Worth recording explicitly: this identity
  is a *consequence of conn8 being locked* — it would still hold under conn4, but it is not
  a free property of arbitrary connectivity rules, and DEC-17-1's breadth definition
  silently depends on it.)
- **the degenerate case is right** — a single-cell component gives `breadthCells = 1` and
  `breadthDays = 0`, i.e. zero days spanned between one verified departure and itself. This
  is exactly A2's stated semantics ("N contiguous cells therefore span (N - 1) x cell days
  between the first and last VERIFIED departure"), and `tests/v2-segment-windows.test.mjs:143`
  asserts `breadthCells === 1` for that shape.

### 5. CLASSIFICATION — VERIFIED

- **sorted ascending by minC3** — line 277, `components.sort(compareByMinC3)`, before
  classification at line 278. `compareByMinC3` (lines 99-107) returns `a.minC3 - b.minC3`
  first. Matches DEC-17-1 "Sorted by min c3."
- **practical filter is `breadthCells >= bMinCells`** — line 152. Matches DEC-17-3
  "min c3 among opportunities with breadth ≥ B_min" and DEC-17-8's "RANKING qualifier:
  B_min = 2 DEPARTURE CELLS", stated in **cells**, which is what the code compares.
  Confirms A2's claim that "No ranking or classification result changes: the practical
  filter operates on breadthCells, not on days" — I verified `breadthDays` appears in no
  comparison anywhere in the module.
- **bestPractical is the minimum over practical; null means NO-PRACTICAL-WINDOW** — lines
  153-162. `best` starts `null`, and if `practical` is empty the loop body never runs, so
  `bestPractical` is `null`, matching the interface doc at line 80 ("null =
  NO-PRACTICAL-WINDOW (DEC-17-3)"). A single-cell component under the default
  `bMinCells = 2` is filtered out, which is DEC-17-1's stated reason for having no separate
  minimum-component-size rule — and is precisely 163693's measured shape (§1).
- **classification does not depend on the order of the input cells (DEC-17-3)** — verified
  in three independent layers:
  1. *Per-component accumulators are order-invariant.* `minDep`/`maxDep`/`minTof`/`maxTof`
     (lines 242-245) are min/max reductions — associative and commutative. `cellCount`
     (line 226, incremented at 234) is a count, and each member index is pushed at most once
     because `visited[nIdx] = 1` is set at push time (line 255) under the `!visited[nIdx]`
     guard (line 254), with the seed marked at line 217 before its own push; so `cellCount`
     is exactly the component cardinality regardless of traversal order.
  2. *The argmin tie-break is order-free.* Lines 234-241 accept a cell when
     `c3 < minC3 || (c3 === minC3 && (depIdx < argDep || (depIdx === argDep && tofIdx <
     argTof)))`. This selects the lexicographic minimum over `(c3, depIdx, tofIdx)`, which is
     a total order on the cells of a component (no two cells share a `(depIdx, tofIdx)`), so
     the winner is unique and independent of DFS pop order. The `-1` sentinels (lines
     220-221) never survive: membership guarantees `c3` is finite, so the first popped cell
     satisfies `c3 < Infinity` and initialises the argmin.
  3. *The sort is a total order.* `compareByMinC3` falls through minC3 → `argmin.depJd` →
     `argmin.tofDays` (lines 100-106). Since distinct components have distinct argmin cells
     and `depJd`/`tofDays` are strictly monotone in `argDep`/`argTof` (lines 262, 268,
     assuming positive cell widths), the comparator returns 0 only for a component compared
     with itself. So the sorted order is unique, and `bestPractical` — the first practical
     element under `<` — is likewise unique.

  Component *discovery* order (the `seed` scan, line 213) is deterministic given a grid but
  is fully erased by the total-order sort, so it cannot influence any output.

  The exported-helper caveat is L1-02: `classifyComponents` called directly on unsorted
  input is order-dependent under exact `minC3` ties. Within `segmentWindows`, DEC-17-3 holds.

### 6. ROW-MAJOR INDEXING — VERIFIED (no off-by-one; see L1-01 for the external hazard)

The convention `index = depIdx + nDep * tofIdx` (line 33) appears in exactly three places
and is consistent in all three:

- **decode**, lines 230-231: `const depIdx = idx % nDep; const tofIdx = (idx - depIdx) /
  nDep;` — the exact inverse of the encode for `0 <= idx < nDep*nTof` and `nDep > 0`. The
  `(idx - depIdx) / nDep` form is exact integer division by construction (the numerator is
  a multiple of `nDep`), so no `Math.floor` rounding hazard exists.
- **encode**, line 253: `const nIdx = nDepIdx + nDep * nTofIdx;` — same expression, same
  operand roles.
- **argmin → physical units**, lines 262 and 268 — `argDep` scales `depCellDays` and
  `argTof` scales `tofCellDays`, i.e. the decoded axes are used with the matching cell
  widths. No axis is crossed.

**Edge audit.** The bounds test at line 250 is
`if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) continue;` — it
rejects **in 2-D index space, before the flat index is formed** (line 253 runs only after
the guard). This is the structurally correct form, and it makes the classic row-wraparound
bug impossible rather than merely unlikely:

- *First column* (`depIdx = 0`, offsets with `dDep = -1`): `nDepIdx = -1` → rejected by
  `nDepIdx < 0`. Without the guard the flat index would be `-1 + nDep*nTofIdx`, i.e. the
  **last** column of the row below — the wraparound case. Correctly excluded.
- *Last column* (`depIdx = nDep - 1`, `dDep = +1`): `nDepIdx = nDep` → rejected by
  `nDepIdx >= nDep`. Without the guard this would be `nDep + nDep*nTofIdx =
  0 + nDep*(nTofIdx+1)`, the **first** column of the row above. Correctly excluded.
- *First row* (`tofIdx = 0`, `dTof = -1`): `nTofIdx = -1` → rejected; the flat index would
  be negative or (for `nDepIdx > 0`) would land in no valid row. Correctly excluded.
- *Last row* (`tofIdx = nTof - 1`, `dTof = +1`): `nTofIdx = nTof` → rejected; the flat index
  would be `>= nDep*nTof`, out of bounds. Correctly excluded.
- *Corners* — both conditions fire independently; the `||` chain means either one alone
  rejects, so `(0,0)` with `(-1,-1)` and `(nDep-1, nTof-1)` with `(+1,+1)` are both handled.
- *Interior* — for `1 <= nDepIdx <= nDep-2` and `1 <= nTofIdx <= nTof-2` all eight neighbours
  are in range and all eight are produced; no offset is dropped and none is duplicated.

The `+1` in `breadthCells = maxDep - minDep + 1` (line 261) is the one inclusive-count `+1`
in the module and it is correct: a component confined to a single column has
`maxDep === minDep` and must report 1 cell, not 0. By contrast `tofSpanDays` (line 273)
uses `maxTof - minTof` with **no** `+1`, which is also correct because it is a *span*, not
a count — the two differ deliberately and both match their interface docs (lines 60-65).

Note also that a transposed feed (L1-01) would leave `minC3` and `cellCount` correct while
corrupting everything axis-dependent, because those two are invariant under any
relabelling of the flat indices that preserves the member set — which is why the transpose
would not be caught by checking the global minimum against the committed artifact.

### 7. NUMERICAL TRAPS — VERIFIED

I traced each named case by hand:

- **Empty grid (0 cells).** `nDep = 0, nTof = 0, cells = []` passes the validator (line 187:
  `0 !== 0*0` is false). `liveGridMin` returns `Infinity`; relative `T = Infinity + 5 =
  Infinity`; the mask loop (202) and seed loop (213) do not execute; result is
  `components: [], practical: [], bestPractical: null, threshold: {mode:'relative',
  valueKm2S2: Infinity}` — matching the declared contract at lines 70-72. Note `idx % nDep`
  is never evaluated, so the `nDep = 0` division-by-zero (`% 0 → NaN`) is unreachable: any
  grid with `nDep = 0` has `cells.length = 0` by the validator, hence no seeds. Same for
  `nTof = 0`. `tests/v2-segment-windows.test.mjs:92-93` exercises the 0×0 case.
- **Single-cell grid.** `nDep = 1, nTof = 1`, one converged finite cell. Relative:
  `liveMin = c3`, `T = c3 + 5`, `c3 <= T` → member. All eight neighbour offsets are rejected
  by line 250 (every one moves off a 1×1 grid). Component:
  `minC3 = c3, breadthCells = 1, breadthDays = 0, cellCount = 1, tofSpanDays = 0`; with
  `bMinCells = 2` it is filtered out and `bestPractical` is `null` — the NO-PRACTICAL-WINDOW
  state, which is the *correct* answer per DEC-17-8 ("B_min ≥ 2 also excludes single-cell
  components").
- **All-holes grid.** Relative: no eligible cell → `liveMin = Infinity` → `T = Infinity`; the
  `Number.isFinite` conjunct (line 204) prevents any `Infinity`-valued cell from becoming a
  member, so `member` stays all-zero and the result is empty rather than one grid-sized
  garbage component. Absolute: `T = 25`, and non-converged/null cells fail the earlier
  conjuncts regardless of their c3 — verified against the test fixture's deliberately
  low-c3 hole (`{c3: 0.25, converged: false}`, test line 89), which would join a component if
  the `converged` check were ever dropped.
- **`+Infinity` c3, converged.** Hole. Finite `T`: `Infinity <= T` is false. `T = Infinity`:
  blocked by `Number.isFinite`. Also excluded from `liveGridMin` (line 116), so it cannot
  raise the relative threshold. Consistent in both paths.
- **`NaN` c3.** Hole under every comparison — `NaN <= T` is `false` for all `T`, and
  `Number.isFinite(NaN)` is `false`. Also skipped by `liveGridMin` (`NaN < min` is false, and
  the finite guard). Never becomes a member, never poisons the threshold. Note the two
  guards are independently sufficient here, which is why the mask survives either being
  reordered.
- **`-0`.** Benign throughout. `Number.isFinite(-0)` is `true` and `-0 <= T` behaves as `0`,
  so a `-0` cell is a member exactly when a `+0` cell would be. In `liveGridMin`, `-0 < 0` is
  `false`, so a grid containing both returns `+0` — numerically equal, no observable
  difference. In the argmin tie-break, `-0 < 0` is `false` while `-0 === 0` is `true`, so a
  `-0` cell falls into the `(depIdx, tofIdx)` lexicographic branch rather than being treated
  as strictly smaller — which is the *correct* behaviour (they are equal C3 values) and keeps
  the selection deterministic. The only residue is that `minC3` may be reported as `-0`,
  which `JSON.stringify` renders as `0`. No defect.
- **Tie exactly at threshold.** Absolute mode is exact: `T` is the caller's double and
  `c3 <= T` includes it with no arithmetic in between (line 204). Relative mode is exact in
  the only sense that is achievable — `T = liveMin + delta` is computed **once** (line 129),
  stored (line 195), and compared against every cell with the same `<=` (line 204), so
  membership is a consistent partition with no cell ever compared against a differently
  rounded threshold. The residual caveat is inherent to floating point, not a code defect: a
  value that is *mathematically* `liveMin + delta` may not equal the *rounded* double
  `liveMin + delta`, so the effective boundary is the rounded sum. This is unavoidable
  short of exact arithmetic and matters only for cells within 1 ulp of T (~10⁻¹⁵ km²/s² at
  these magnitudes), far below the physical resolution the method badge discloses.
  `tests/v2-segment-windows.test.mjs:111-118` exercises the absolute tie-at-T case.
- **Not in the brief, checked anyway — stack depth.** The flood fill is iterative
  (`stack: number[]`, lines 210, 228-229), not recursive, so a fully-connected 731×100 grid
  (73,100 members) cannot blow the call stack. `stack.pop() as number` is safe under the
  `stack.length > 0` loop condition (line 228).

---

## Notes / open questions

1. **L1-01 is the finding to act on.** Everything else in this report is hygiene. The
   transpose hazard is invisible to the module's shape validator on the locked 731×100
   grid, silent at runtime, and it corrupts exactly the quantity Slice 17 exists to
   produce (breadth) while leaving the quantity most likely to be spot-checked (`minC3`)
   correct. I recommend the G-A2 close carry an explicit A3 entry condition, in the manner
   of DEC-17-9's C2 recon gate.

2. **Absolute mode recomputes `liveGridMin` for nothing** (line 194 vs lines 131-134): one
   full pass over 73,100 cells per body, five bodies. Immaterial against the measured
   1431.52 ms baseline (DEC-17-6), but worth noting since A3's gate reports wall time
   against that number.

3. **The module is correctly quarantined.** Lines 1-3 carry the UNAUDITED banner per §4,
   and I confirmed by grep that the only importer in the repo is
   `tests/v2-segment-windows.test.mjs` — no `src/` or `v2/` file imports `segment-windows`.
   §4's "Nothing consumes segmentWindows before G-A2" holds at HEAD.

4. **Not in scope for this lens, flagged for L2/L4.** The test file derives `breadthCells`
   from the committed artifact as `round(breadthDays/depCellDays)+1`
   (`tests/v2-segment-windows.test.mjs:7-8`) because the artifact stores days, not cells.
   That inversion is arithmetically the correct inverse of the A2 rule, but it means the
   fixture tests validate breadth against a *reconstructed* cell count rather than a stored
   one. Whether that satisfies G-A1's "Hudson verifies fixture expectations against the
   artifact" is a reconciliation question, not a mathematical one.

5. **`TOF_MIN_DAYS` is inferred, not stored.** `tests/v2-segment-windows.test.mjs:55-61`
   records that the TOF grid minimum is not a field in the committed artifact and was
   inferred from the minimum observed argmin `tofDays`. `argmin.tofDays` is computed as
   `grid.tofMinDays + argTof * grid.tofCellDays` (line 268), so every reported TOF inherits
   that inference. The module is not at fault — it takes `tofMinDays` as an input — but any
   A3 surface quoting TOF should trace where its `tofMinDays` came from. Flagging for the
   reconciliation lens.

6. **Open question for the doc, not the code.** DEC-17-1 says breadth is the
   "departure-date span in DEPARTURE CELLS". I proved above (property 4) that under conn8
   the bounding-box width equals the count of occupied departure columns, so the two
   readings of "span in cells" coincide and the code is unambiguous. If connectivity were
   ever unlocked, that identity would need re-checking — which is one more reason the
   conn4 throw at lines 176-180 is the right shape.
