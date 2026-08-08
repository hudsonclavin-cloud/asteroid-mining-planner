# RECONCILIATION — G-A2 / G-A1 (S-S17-GA12-AUDIT-2026-08-07-A)

Lens: L4 — RECONCILIATION. Fresh session. This auditor has **not read**
`src/v2/porkchop/segment-windows.ts`, `tests/v2-segment-windows.test.mjs`, or
`tools/slice17-research/data/s17-structure-7day.json`, and did not execute anything.
Sources read: `L1_MATH.md`, `L2_ADVERSARIAL.md`, `L3_ARCHITECT.md`,
`SLICE_17_FOUNDING.md`. Independence is in judging the **arguments**, not the artifact.

Nothing was edited except this file.

---

## VERDICT

**G-A2: PASS.**

Post-merge counts: **0 HIGH / 11 MED / 9 LOW** (28 raw lens findings → 20 merged;
every raw finding is accounted for and cross-referenced below).

The gate condition is "0 HIGH findings open" (`SLICE_17_FOUNDING.md:297-299`). No merged
finding meets the binding HIGH bar. I examined the four HIGH-shaped candidates directly
(R-01 transpose, R-02 TDB-as-UTC date, R-08 A2 copy rule / `depCellDays`, R-11 B_min test
coverage) and each fails the bar for a stated, non-hand-waving reason — set out in full in
ESCALATION REASONING. I did **not** manufacture a HIGH to look rigorous, and I did not
suppress one: I escalated four findings above the severity their originating lens assigned
(R-02, R-04, R-05, R-07), all L1 LOW → MED under the conflict rule.

**G-A1: ALL MATCH.** Quoting L2's verdict line verbatim: *"**G-A1 VERDICT: ALL MATCH.**
160 field-level comparisons between the test file's pasted expectations and the committed
artifact `s17-structure-7day.json`. **Zero mismatches.**"* The INV-033 failure mode
(fabricated or mis-copied fixture constants) is disproven by mechanized means — all 19
component records regenerated from the artifact and `diff`ed byte-for-byte against the test
file's literals (L2 Evidence E4).

**PASS is conditional on nothing.** But three MED findings must become binding **A3 entry
conditions** rather than advice, because each converts to HIGH at the commit that lands A3:
R-01 (transpose), R-03 (absolute-25 injection), R-07/R-08 (return-shape echo). That is a
disposition, not a gate condition; see DISPOSITION.

---

## FINDINGS TABLE

| ID | SEVERITY | One-line | file:line | Source lens/es |
|---|---|---|---|---|
| R-01 | MED | Declared flat-index convention (`depIdx + nDep*tofIdx`) is the exact transpose of the existing porkchop pipeline's (`depIdx*nTof + tofIdx`); the shape validator provably cannot detect a transposed feed because `731*100 === 100*731`, and the corruption hits breadth/dates while leaving `minC3` and `cellCount` correct | `src/v2/porkchop/segment-windows.ts:33`, `:182-192`, `:230-231` vs `src/v2/porkchop/porkchop-view.ts:265`, `src/v2/porkchop/grid-compute.ts:175-221` | L1-01 |
| R-02 | MED | `jdToIsoDate` formats a TDB Julian date as UTC, dropping the 69.184 s offset that both `main.ts` and the artifact harness apply; the only such implementation in the repo. Correct on the locked 731-column grid — 0 of 731 columns flip — by a **49.172 s margin**, and no DEC pins the time scale | `src/v2/porkchop/segment-windows.ts:94-96`, `:267` (cf. `src/v2/app/porkchop/main.ts:152-156`; `tools/slice17-research/measurements/s17-cache-vs-live.mjs:80-88`) | L3-01 (MED); L1-05 (LOW) — **ESCALATED** |
| R-03 | MED | `params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2` silently ships the 25 km²/s² literal the module's own header says "MUST … never ship"; `ResolvedThreshold` carries no flag distinguishing an injected 25 from a defaulted 25, defeating DEC-17-5 rider (a) at the seam with no signal and no test | `src/v2/porkchop/segment-windows.ts:131-134` (cf. `:86-91`, `SLICE_17_FOUNDING.md:203-205`) | L1-03, L2-04 (H1), L3-02 |
| R-04 | MED | Injected threshold scalars are unvalidated: `NaN` Δ or `NaN` absolute (the canonical result of `Number(missingMetadataField)`, which `??` does not catch) makes every membership test false and returns a NO-PRACTICAL-WINDOW **bit-identical to a correct one**; `NaN bMinCells` does the same via the practical filter; Δ≤0 collapses every body to argmin-only or empty | `src/v2/porkchop/segment-windows.ts:127-134`, `:193-194`, `:201-207` | L2-01 (H2), L2-06 (H3) (MED); L1-08 (LOW) — **ESCALATED** |
| R-05 | MED | The four grid-geometry floats are never validated. `tofMinDays: NaN` **returns normally with `argmin.tofDays = NaN`** — a wrong user-facing number emitted silently; `depStartJd: NaN` throws an opaque `RangeError` from inside `toISOString` after the full 73,100-cell pass, instead of the module's own legible refusal | `src/v2/porkchop/segment-windows.ts:182-192`, `:94-96`, `:262-274` | L2-05 (H5), L3-05 (MED); L1-05 (LOW) — **ESCALATED** |
| R-06 | MED | The shape validator checks cell **count** but not cell **contents**: a sparse or partially-filled `cells` array (exactly A3's "worker seam with reduced cell transfer") passes validation and dies as an unlabelled `TypeError` inside `liveGridMin` | `src/v2/porkchop/segment-windows.ts:113-121`, `:182-192` | L2-07 (H4) |
| R-07 | MED | The live grid minimum is computed then discarded and Δ is never echoed, so DEC-17-3/-4's mandatory subordinate "global minimum (731×100 grid)" column and DEC-17-8's "Δ is DISCLOSED" copy cannot be derived from the result — pushing the consumer toward a recompute or a literal | `src/v2/porkchop/segment-windows.ts:68-73`, `:75-83`, `:194` (cf. `SLICE_17_FOUNDING.md:158-159,169,234`) | L3-03 (MED); L1-06 (LOW) — **ESCALATED** |
| R-08 | MED | `depCellDays` (the sampling interval) is absent from both `WindowComponent` and `SegmentWindowsResult`, and is **unrecoverable** for singleton components because `breadthDays/(breadthCells-1)` divides by zero — 13 of the 19 fixture components are singletons, so AMENDMENT A2's binding copy rule cannot be met from a component alone | `src/v2/porkchop/segment-windows.ts:57-66`, `:75-83` (cf. `SLICE_17_FOUNDING.md:474-480`) | L3-04 |
| R-09 | MED | The **exported** `classifyComponents` picks `bestPractical` with a strict `<`, so under an exact `minC3` tie the first input element wins and the reported launch date is input-order-dependent — contradicting its own doc claim "input order does not matter"; the adjacent `SegmentWindowsResult` comment "First practical component" is likewise true only because `segmentWindows` pre-sorts | `src/v2/porkchop/segment-windows.ts:142-143`, `:152-158`, `:80-81` | L1-02 (MED), L2-11 (LOW) |
| R-10 | MED | All six property-test invariants are **partition-agnostic**: they pass unchanged against a segmenter that emitted every member cell as its own component, or that silently used conn4. The suite's entire defense against a connectivity regression is two hand-built cases totalling four member cells | `tests/v2-segment-windows.test.mjs:266-305` (vs `:110-117`, `:163-171`) | L2-02 |
| R-11 | MED | `bMinCells` appears **zero times** in the 446-line test file; hardcoding B_min at `:193` would leave all 15 tests green — the one half of §4-A1's "Δ and B_min injected not hardcoded" that no test pins (Δ and `absoluteKm2S2` injection both are pinned) | `src/v2/porkchop/segment-windows.ts:193` / `tests/v2-segment-windows.test.mjs` (absent) | L2-03 |
| R-12 | LOW | Neither tie-break is pinned by a test: no component anywhere has two cells sharing the minimum c3 (intra-component argmin), and no test asserts ordering for two components sharing a `minC3` (`compareByMinC3`'s depJd/tofDays branches never execute). Both reasoned correct by two lenses independently; neither protected against regression | `src/v2/porkchop/segment-windows.ts:234-241`, `:99-107` | L2-09 |
| R-13 | LOW | Membership additionally requires `Number.isFinite(c3)`, narrowing DEC-17-1's two-class hole definition (a converged `c3 === -Infinity` cell is admitted by the DEC's letter, excluded by the code). The narrowing is correct, load-bearing for the all-`Infinity`/`T=Infinity` case, and documented in-module — but not absorbed into the locked DEC | `src/v2/porkchop/segment-windows.ts:10-11`, `:197-207` (vs `SLICE_17_FOUNDING.md:95-98`) | L1-07 |
| R-14 | LOW | In the one bounds check that prevents flat-index row wraparound, the `n` prefix means "neighbour" (`nDepIdx`/`nTofIdx`/`nIdx`) and "number of" (`nDep`/`nTof`) four symbols apart. Code is correct; the naming is the shape in which the classic wraparound bug gets reintroduced | `src/v2/porkchop/segment-windows.ts:248-253` | L1-04 |
| R-15 | LOW | API-shape drift: §4 A1 specifies `segmentWindows(cells, params)`; the code is `segmentWindows(grid, params)`. **The code is right** — `(cells, params)` is not implementable, since four of DEC-17-1's six per-component fields need grid geometry. Doc-side, and §8 A2 already implicitly ratified the grid-shaped module | `SLICE_17_FOUNDING.md:290` vs `src/v2/porkchop/segment-windows.ts:171-174` | L3-06 |
| R-16 | LOW | Returned structures alias: `practical` shares element references with `components`, and `bestPractical.argmin` is the same object as the component's `argmin`. Nothing is frozen or `readonly`-typed, so an in-place sort or annotation by A4 mutates `components` too. Normal JS convention, but an undeclared contract in a module that declares everything else | `src/v2/porkchop/segment-windows.ts:152`, `:161`, `:75-83` | L3-07 |
| R-17 | LOW | The quarantine is advisory only — no hook or lint enforces it. `.githooks/pre-commit`, `.githooks/pre-push` and `AGENTS.md §2.1` contain no import guard; the sole barrier is a three-line comment. Holding today on discipline | `src/v2/porkchop/segment-windows.ts:1-3`; `AGENTS.md:98-125` | L3-08 |
| R-18 | LOW | The test file cites `tools/overnight-2026-08-05/L3_A1_FIXTURES.md` as its fixture-derivation authority; that file is **untracked**. The derivation record the tests name as their provenance is not in git. Mitigated, not eliminated, by the runtime cross-check at `tests:401-434` | `tests/v2-segment-windows.test.mjs:5-6` | L2-10 |
| R-19 | LOW | DEC-17-2's locked resolution (`nDep = 731`, `nTof = 100`) and the span **end** (`2466154.500800741` / `2040-01-01`) are asserted nowhere in the suite; the runtime cross-check pins only the two cell widths and the span start | `tests/v2-segment-windows.test.mjs:409-411` | L2-12 |
| R-20 | LOW | DEC-17-8's Δ-lock rationale states "163693 → 1 component" at Δ=2 and attributes the lock to measurement `806745c`, but L2 reads `806745c` (rev E) as giving **2** components (both singletons); the figure `1` appears only in the superseded rev D artifact `d8dffd0`. The lock's conclusion is unaffected. **Artifact half UNADJUDICATED by this lens** — see UNADJUDICATED U-1 | `SLICE_17_FOUNDING.md:230-232` | L2-08 |

Raw-finding accounting (all 28 mapped, none dropped):
L1-01→R-01 · L1-02→R-09 · L1-03→R-03 · L1-04→R-14 · L1-05→**R-02 + R-05** (L1-05 bundled
two distinct defects) · L1-06→R-07 · L1-07→R-13 · L1-08→R-04 ·
L2-01→R-04 · L2-02→R-10 · L2-03→R-11 · L2-04→R-03 · L2-05→R-05 · L2-06→R-04 · L2-07→R-06 ·
L2-08→R-20 · L2-09→R-12 · L2-10→R-18 · L2-11→R-09 · L2-12→R-19 ·
L3-01→R-02 · L3-02→R-03 · L3-03→R-07 · L3-04→R-08 · L3-05→R-05 · L3-06→R-15 · L3-07→R-16 ·
L3-08→R-17.

---

## ESCALATION REASONING

The binding bar, restated so every call below can be checked against it:

- **HIGH** = the module can emit a wrong number, wrong classification, or wrong refusal
  **under inputs the compare view will ACTUALLY produce**; OR it violates a locked DEC.
- **MED** = correctness risk only under adversarially constructed inputs, or a spec
  ambiguity the code resolved silently.
- **LOW** = wording, naming, doc drift.

Note the structure of the HIGH bar: it is disjunctive, and the first arm is explicitly
indexed to *actual* compare-view inputs. DEC-17-2 **LOCKS** those inputs — span
2026-01-01 → 2040-01-01, `nDep 731`, `nTof 100` (`SLICE_17_FOUNDING.md:120-132`). That
lock is what several of these calls turn on, and I state it once here rather than
re-arguing it four times.

### 2a. R-01 — flat-index transpose (L1-01). Considered HIGH. **Held at MED.**

L1's argument is the strongest single piece of reasoning in the three reports, and I want
its force on the record before I decline to escalate it. The module declares
`index = depIdx + nDep * tofIdx` (`:33`). The existing pipeline fills TOF-fastest and its
two consumers read `cells[depIndex * nTof + tofIndex]` (`porkchop-view.ts:265,629`). Those
are exact transposes. A3's job is precisely to convert `PorkchopCell[]` → `SegmentGridCell[]`,
and the obvious implementation — an element-wise `.map` — preserves the producer's ordering
and feeds `segmentWindows` a transposed grid. The module's own validator **cannot** catch
it: it tests `cells.length !== nDep * nTof`, and `731 * 100 === 100 * 731`. Downstream,
`minC3` and `cellCount` stay correct (they are invariant under any relabelling that
preserves the member set), so the number most likely to be spot-checked against the
committed artifact would *pass* while `breadthCells`, `breadthDays`, `tofSpanDays` and
`argmin.dateIso` — i.e. everything Slice 17 exists to produce per §1 — would be garbage,
and B_min filtering on a garbage `breadthCells` would corrupt the default sort.

**Why it is nonetheless not HIGH.** Three independent reasons, any one sufficient:

1. **The defect is not in the audited artifact.** The module is correct against its own
   explicitly documented contract at `:33`. A caller that violates a documented invariant
   is not a defect in the callee. G-A2's scope is `segmentWindows` and its tests
   (`SLICE_17_FOUNDING.md:297-299`, "MULTI-AGENT AUDIT of A1"). Grading a hazard-to-code-
   that-does-not-exist as HIGH would make the gate un-passable by construction: the module
   cannot be made safe against every misuse a future adapter might commit, and no amount of
   work on A1 would close it. A gate that cannot be closed by working on its own subject is
   not a gate.
2. **No locked DEC specifies an index ordering.** I read §3 in full. DEC-17-1 specifies
   membership, connectivity, per-component outputs and sort order; DEC-17-2 specifies the
   grid's span and resolution. Neither names a flattening convention. The second arm of the
   HIGH bar does not fire.
3. **The first arm does not fire either**, because "inputs the compare view will actually
   produce" is presently the empty set — §4 A1's quarantine holds (confirmed independently
   by L1 note 3, L2 Evidence E0, and L3 §2 with a printed grep, plus L3's deploy-surface
   and `vite.config` checks). There is no consumer to produce a wrong number.

**But the disposition escalates.** L1 recommends this become a binding A3 entry condition
rather than advice, and I agree and go slightly further: L1's own escalation trigger — "if
A3 lands an element-wise adapter with no transpose, this becomes HIGH at that commit" — is
correct, and the cheapest way to prevent that is a test A3 must pass *before* its adapter is
written: an asymmetric fixture (`nDep ≠ nTof`, deliberately non-square component) that
round-trips with breadth on the **departure** axis. A shape check that passes on a square
product is not a check. See DISPOSITION D-01.

**Caveat on premise.** L1 is the only lens that examined the existing pipeline; L2 and L3
did not. The transpose claim rests entirely on L1's reading of `grid-compute.ts:175-221` and
`porkchop-view.ts:265,629`. See UNADJUDICATED U-3.

### 2b. R-02 — TDB Julian date formatted as UTC (L3-01, L1-05). Considered HIGH. **Held at MED. Escalated from L1's LOW.**

Two moves here, in order.

**First, the escalation (L1 LOW → MED), under the conflict rule.** L1 graded this LOW and
wrote "Recorded as accepted-and-disclosed, not as a defect", reasoning that the incidence is
"~69/86400 ≈ 0.08 % of argmins" because "at the locked 7.004 d cell width the argmin epochs
are effectively arbitrary within the day." L3 graded it MED and brought three pieces of
evidence L1 did not have:

- The repo already contains the **correct** conversion twice — `main.ts:152-156` and the
  harness `s17-cache-vs-live.mjs:80-88`, both subtracting 69.184 s — so this module is the
  *only* implementation in the repo that omits it, and it disagrees with **the porkchop the
  user opens next**, which DEC-17-2 promises consistency with by construction
  (`SLICE_17_FOUNDING.md:124-125`).
- No DEC pins the time scale for `argmin.dateIso`. DEC-17-1 says "argmin (departure date,
  tofDays)" (`:99`) and stops; DEC-17-4 requires a date in the headline (`:167`) without
  naming a scale. **That is a spec ambiguity the code resolved silently — the MED clause,
  verbatim.**
- Ironically, DEC-17-10 is the founding doc's own worked example of the *correct*
  conversion: it renders JD TDB 2461041.5 as `2025-12-31T23:58:50Z`
  (`SLICE_17_FOUNDING.md:277-279`) — a **different calendar day** than this module's formula
  would give for the same JD. And DEC-17-10's rationale records that this exact 69.184 s
  quantity already killed a measurement run (`:274-276`).

Under the conflict rule the higher argued severity wins unless the arguing lens's own
evidence contradicts it. L3's evidence does not contradict MED; it establishes it. Moreover
L1's own probabilistic argument is *superseded* by L3's exact enumeration: the 731 departure
columns are not "effectively arbitrary within the day", they are a deterministic lattice
advancing 355.068 s per column, and L3 enumerated all 731. L1's 0.08 % estimate was the
right instinct applied to the wrong model. **MED.**

**Second, why it does not reach HIGH.** This is the "correct today on the locked grid, wrong
if a parameter moves" question, and the answer follows the bar mechanically:

- *Arm 1 — wrong number under actual compare-view inputs.* DEC-17-2 locks the span and the
  resolution. L3 evaluated both conventions for all 731 locked columns and found **0
  differences**; the closest any column comes to midnight from below is 118.356 s (column
  243), against a 69.184 s offset — a **49.172 s margin**. Column 0 sits at exactly
  `2026-01-01T00:00:00.000Z` (the artifact's `depStartJd = 2461041.500800741` is exactly
  69.184 s of JD past that instant, which is *why* the naive formula returns
  `2026-01-01T00:01:09.184Z`), and the error direction is forward, so the boundary is never
  approached from the dangerous side at column 0. Under the inputs the compare view will
  actually produce, **no wrong date reaches the user**. Arm 1 does not fire.
- *Arm 2 — violates a locked DEC.* L3 grepped the founding doc for the time-scale
  vocabulary and found no pin; I re-read §3 and confirm: no DEC names a time scale for
  `argmin.dateIso`. DEC-17-2's consistency promise is the closest candidate, and it is not
  observably broken, precisely because 0 of 731 columns flip. Arm 2 does not fire.

So: **"correct today on the locked grid, wrong if a parameter moves" does not meet HIGH under
this bar, because the bar is indexed to actual inputs and the inputs are locked.** I want to
be explicit that this is a bar-application decision, not a judgement that the finding is
minor. It is the finding I would fix first. Two things make the margin less comfortable than
"49 seconds" sounds: (i) L3 measured that a **one-hour** change in span start, or
`nDep = 1461`, flips a column — and DEC-17-2's own SPAN CLAUSE flags the cache/view span
mismatch as unresolved (`SLICE_17_FOUNDING.md:133-138`, F2 at `:552-555`), while DEC-17-2
explicitly contemplates the view's 200-column grid existing alongside the compare grid
(`:130-132`); (ii) the margin is defended by no test, no assertion and no DEC — it is a
property of two constants that any future dispatch could change without noticing. L3's
sentence "correct by 49.172 seconds of luck" is the accurate description. **This finding
converts to HIGH, with no code change, on the day any locked grid parameter moves** — which
is the single most important line in this report for whoever writes A3.

Sanity note on L3's arithmetic, since it is load-bearing and I could not execute: 731
columns spaced 355.068 s around an 86400 s circle equidistribute at ~118.2 s mean spacing,
so a measured minimum approach of 118.356 s is exactly what the geometry predicts, and
118.356 − 69.184 = 49.172 ✓. The claim is internally consistent. It is still single-sourced
— see UNADJUDICATED U-2.

**Why G-A1 did not catch it** (recorded because it explains the survival path and it also
bears on the G-A1 caveat below): `dateIso` is asserted **exactly once** in the 446-line
suite, at `tests:213`, on **column 0** — the one column where a forward-only 69.184 s error
provably cannot change the date. And the artifact-fixture tests never invoke
`segmentWindows` at all; they exercise `resolveThreshold` and `classifyComponents` only, and
compare the artifact's `date` values against pasted constants, never feeding them through
`jdToIsoDate`. The module's date conversion has never been compared against the harness's,
despite both living in the same test file.

### 2c. R-08 — `depCellDays` absent from the return shape, vs AMENDMENT A2's binding copy rule. Considered HIGH. **Held at MED.**

The question is precise: does an incomplete return shape **violate** the locked DEC, or
merely fail to help a consumer meet it? A2 answers it in its own words. Quoting
`SLICE_17_FOUNDING.md:474-483` verbatim:

> Binding copy rule, effective immediately and applying to A3 and every
> later surface: a breadth day-span is NEVER displayed alone. Every display
> of breadthDays carries, adjacent and in the same visual unit, the cell
> count and the sampling interval. Day values display at 3 significant
> figures (7.00 d); full precision lives in the data layer and in this
> document, never in user-facing copy. Compliant pattern:
>   "7.00 d window - 2 verified departures, 7.00 d sampling"
> Non-compliant, and never to ship: any bare day count, any phrasing that
> implies continuous feasibility across the span, and specifically the
> words "two-week window" for a two-cell component.

Three textual facts decide it:

1. **The rule is scoped, by its own words, to "A3 and every later surface."** A1 is neither
   A3 nor a surface. The rule binds *displays* ("a breadth day-span is NEVER **displayed**
   alone", "Every **display** of breadthDays", "never in **user-facing copy**", "never to
   **ship**"). This module displays nothing and ships nothing — §4 A1 defines it as a pure
   side-file module and §4 A2 forbids anything consuming it. A module with no display
   surface cannot violate a display rule.
2. **A2's other binding clause — the one that *does* reach A1 — is satisfied.** A2 names
   `src/v2/porkchop/segment-windows.ts breadthDays = (breadthCells - 1) * depCellDays`
   (`:451-452`) and rules "The (N - 1) convention is CORRECT and stands" (`:453`). All three
   lenses verified this independently: L1 enumerated every cell-width multiplication in the
   module and found no `N * cellDays` form anywhere; L3 confirmed both `breadthDays` and
   `tofSpanDays` use `(N-1)`; L2 confirmed the artifact's own geometry is `(N-1)`
   (`5113 / 730 = 7.004109589041096`) and that the property test pins it at `tests:297` plus
   the artifact check at `tests:394-395` with a max residual of 2.9e-10. **The locked A2
   convention is not violated; it is honoured and doubly pinned.**
3. A2 also carries the `breadthCells` **and** `breadthDays` pair on `WindowComponent`
   (`:59,:62`) — two of the copy rule's three required quantities. The gap is the third.

So this is **failing to help the consumer meet the rule**, not violating it. MED.

**But L3's argument for why it is a strong MED is correct and I am adopting it in full.**
The sampling interval is *usually* recoverable as `breadthDays / (breadthCells − 1)` — and
that expression **divides by zero for every singleton component**. Singletons are not an
edge case in this data: 163693 is 5 of 5 singletons (the very body DEC-17-3 names at
`SLICE_17_FOUNDING.md:155` as the NO-PRACTICAL-WINDOW case) and 99942 is 8 of 12 — **13 of
the 19 fixture components**. For those thirteen, a `WindowComponent` alone is *structurally
incapable* of producing A2-compliant copy, and the failure mode is a **bare day count**,
which A2 names in terms as "never to ship". The module makes the non-compliant path the path
of least resistance for a rule the doc marks binding. That is the wrong gradient, and it is
exactly the shape of defect A2 itself was written to correct. Hence: MED severity, **A3
entry condition** disposition (D-04), not "advisory".

The same omission touches DEC-17-5's provenance badge, which requires "grid resolution
(731×100; 7.004 d × 16.604 d)" *read from the computation that produced the numbers*
(`:199-200`, `:210-212`) — the result object is not self-describing, so A3 must re-attach the
geometry from the input grid. Same class, same fix (echo the geometry on the result).

### R-11 / L2-03 — B_min never injected in any test, vs §4-A1's "injected not hardcoded". **Held at MED.**

Weighed explicitly, as asked. The chain is: §4 A1 requires "Δ and B_min injected not
hardcoded" (`SLICE_17_FOUNDING.md:291`); `bMinCells` appears **zero times** in the 446-line
test file; if `:193` were replaced by a hardcoded `2`, all 15 tests still pass.

**Is missing test coverage of a spec requirement a HIGH?** No, and the reason is not a
technicality:

- **The requirement is satisfied in the code.** L3-V12 verified it directly: `:128`, `:133`,
  `:193` all read from `params` with exported named defaults rather than inline magic
  numbers. So §4 A1's obligation is *met*; what is missing is a regression guard on it. A
  finding that the spec requirement is unmet would be HIGH-shaped; a finding that it is met
  but unpinned is not.
- **No wrong number, classification or refusal follows.** The module today filters on
  `breadthCells >= bMinCells` with the DEC-17-8 value of 2, which L1 verified against
  DEC-17-8's "B_min = 2 DEPARTURE CELLS" (`:238`) and L2 verified end-to-end against the
  artifact (99942: 4 of 12 practical; 163693: 0 of 5). Neither arm of the HIGH bar fires.
- **§4 is a phase/gate section, not a DEC.** The locked decisions are §3. §4 A1's phrasing
  is a build instruction. Even read strictly, it is an instruction to the *implementation*,
  which complied.

MED is the right grade: it is a real gap in the gate that is supposed to protect the
requirement (G-A1 is "tests green, Hudson verifies fixture expectations against the
artifact" — neither clause reaches B_min injection), and it is one test to close. I note the
asymmetry L2 found is itself the tell: Δ injection *is* pinned (`tests:243-244`, `:187-188`)
and `absoluteKm2S2` injection *is* pinned with a non-default value (`tests:283`, using 12).
Only B_min, of the three, is unpinned — which reads as an oversight rather than a decision.

### Other escalations performed

- **R-04 (L1-08 LOW → MED).** L1 graded unvalidated `deltaKm2S2`/`bMinCells` LOW; L2 graded
  the same class MED with a sharper articulation: the output is a NO-PRACTICAL-WINDOW that
  is **bit-identical to a correct one**, on a body with real components, and DEC-17-3 makes
  that state a *displayed claim about the body* ("no practical window at Δ=5" — never a
  number, never a blank, `SLICE_17_FOUNDING.md:153-157`). A garbage input therefore produces
  a confident false statement about an asteroid rather than an error. Higher argued severity
  wins; L1's own evidence (it describes exactly the same mechanism) supports rather than
  contradicts MED. **MED.** I merged L2-01, L2-06 and L1-08 into one finding because they
  are one defect — no finiteness/range validation on injected scalars — with three entry
  points.
- **R-05 (L1-05 LOW → MED).** L1 called the geometry-float gap "low likelihood, zero-cost
  fix". L2 (H5, Grid B) and L3 (§5.5) both graded MED, and L2 supplied the fact L1 missed:
  `tofMinDays: NaN` does **not** throw — the module returns normally with
  `argmin.tofDays = NaN` on every component, i.e. a wrong user-facing number emitted
  silently. L2 also notes `tofMinDays` is the one geometry field the artifact does **not**
  store (the test infers 182.5 at `tests:63`), so A3 must *compute* it — which is precisely
  where a NaN can enter. Higher argued severity wins, and the added evidence strengthens it.
  **MED.**
- **R-07 (L1-06 LOW → MED).** L1 called the missing `liveMin`/Δ echo "an API-completeness
  observation"; L3 graded MED and tied it to two mandatory displays rather than one
  convenience: DEC-17-3's "Global minimum displays subordinate, labeled 'global minimum
  (731×100 grid)'" (`:158-159`) and DEC-17-4's "global min C3 (subordinate, labeled)"
  (`:169`), plus DEC-17-8's "Δ is DISCLOSED in UI copy" (`:234`). The consumer must either
  re-run `liveGridMin` over 73,100 cells per body inside a 1431.52 ms budget, or reach for a
  literal — which DEC-17-5 forbids outright (`:210-212`). Higher argued severity wins. **MED.**
- **R-09 (L2-11 LOW absorbed into L1-02 MED).** Same defect from two angles: the strict `<`
  in `classifyComponents` and the `SegmentWindowsResult` comment that describes it as "First
  practical component". L1's evidence is decisive on both directions — inside
  `segmentWindows` the pre-sort makes the comment true and DEC-17-3 satisfied, but the helper
  is *deliberately exported* for the artifact tests to call directly on summaries, and
  summaries whose `minC3` was rounded through JSON make exact ties go from essentially
  impossible to merely uncommon. **MED.**

### De-escalations considered and rejected

None. I checked each MED for over-grading and found none that should drop to LOW. I
specifically re-examined **R-13** (the `Number.isFinite` narrowing of DEC-17-1) as a possible
*escalation* to MED-or-higher, since it is the one finding that touches the letter of a
LOCKED DEC: DEC-17-1 defines membership as "converged AND its c3 ≤ T" and names exactly two
hole classes, while the code adds a third. I held it at LOW because (i) the divergence bites
only for a converged `c3 === -Infinity` cell, which no Lambert screen can produce, so no
actual compare-view input distinguishes the two readings; (ii) in the one case where the
guard *is* load-bearing (all-`Infinity` grid, relative mode, `T = Infinity`) it prevents a
garbage grid-sized component — i.e. it makes the module *more* DEC-17-1-faithful in spirit,
not less; and (iii) it is documented in-module at `:10-11` and `:197-200`, so it is not a
*silent* resolution and the MED clause's second limb does not apply. Failing a gate on a
documented, protective narrowing that is unreachable in practice would be pedantry. The
correct disposition is the round trip L1 identifies: a short §8 amendment making "non-finite
c3 is a hole, equivalent to null" the convention of record, so code and locked DEC agree on
the page and not only in a comment.

---

## G-A1 FIXTURE-EXPECTATION TABLE (verbatim from L2)

Reproduced exactly as written in `tools/s17-ga12-audit-2026-08-07/L2_ADVERSARIAL.md`,
lines 59–163. Not re-derived, not abridged.

> ## G-A1 FIXTURE-EXPECTATION TABLE
>
> Legend: `MATCH` = test constant equals the artifact value under `===` (or, for the
> component records, byte-identical decimal expansion). `n/a — synthetic` = the test
> constant has no stored counterpart in the artifact. Every row is marked.
>
> ### A. Grid geometry and epoch anchor
>
> | body | quantity | test asserts | artifact says | MATCH? |
> |---|---|---|---|---|
> | — | `grid.departureCellDays` | `7.004109589041096` (`tests:60` `DEP_CELL_DAYS`; cross-checked `tests:409`) | `j.grid.departureCellDays = 7.004109589041096` | **MATCH** |
> | — | `grid.tofCellDays` | `16.603535353535353` (`tests:61`; cross-checked `tests:410`) | `j.grid.tofCellDays = 16.603535353535353` | **MATCH** |
> | — | departure epoch anchor (JD TDB) | `2461041.500800741` (`tests:62` `DEP_START_JD`; cross-checked `tests:411`) | `j.span.requested.start.jdTdb = 2461041.500800741` | **MATCH** |
> | — | epoch anchor as ISO date | `'2026-01-01'` (`tests:213`, via module `jdToIsoDate`) | `j.span.requested.start.isoUtc = "2026-01-01T00:00:00.000Z"`; `jdToIsoDate(2461041.500800741)` → `2026-01-01T00:01:09.184Z` → `'2026-01-01'` | **MATCH** |
> | — | `grid.nDep` | **NOT ASSERTED** — the constant `731` appears nowhere in the test file | `j.grid.nDep = 731` | n/a — no test constant (coverage gap, L2-12) |
> | — | `grid.nTof` | **NOT ASSERTED** — the constant `100` appears nowhere in the test file | `j.grid.nTof = 100` | n/a — no test constant (coverage gap, L2-12) |
> | — | `TOF_MIN_DAYS` | `182.5` (`tests:63`) | **n/a — INFERRED, not stored.** Derivation is stated at `tests:57-59` ("inferred from minimum observed argmin tofDays"). Independent corroboration: min `argmin.tofDays` over the **entire** artifact (5 bodies × 4 modes × conn4+conn8) = `182.5` exactly; 0 of the argmin TOFs are off the lattice `182.5 + k·tofCellDays` (max fractional residual 3.55e-15, max k = 30 ≤ nTof−1 = 99); and `182.5 + 99 × 16.603535353535353 = 1826.25` exactly (= 5.0 yr). | n/a — inferred; **derivation stated in test; corroboration MATCHES** |
> | — | grid self-consistency | (not asserted) | `(2466154.500800741 − 2461041.500800741) / (731 − 1) = 7.004109589041096` `=== departureCellDays` → confirms the (N−1) convention of AMENDMENT A2 in the artifact's own geometry | **MATCH** (self-consistent) |
> | — | span END (`2040-01-01` / `2466154.500800741`) | **NOT ASSERTED** | `j.span.requested.end.jdTdb = 2466154.500800741`, `isoUtc = 2040-01-01T00:00:00.000Z` | n/a — no test constant (coverage gap, L2-12) |
>
> ### B. 433 — `bodies[2].structure.liveMinPlus5.conn8`
>
> | body | quantity | test asserts | artifact says | MATCH? |
> |---|---|---|---|---|
> | 433 | `body.id` | `'433'` (string) (`tests:413,418`) | `"433"` (string) | **MATCH** |
> | 433 | `body.spkId` | `20000433` (number) (`tests:413,419`) | `20000433` (number) | **MATCH** |
> | 433 | liveMin (`body.live.minC3`) | `1.6396903345121228` (`tests:311`, checked `tests:422`) | `1.6396903345121228` | **MATCH** |
> | 433 | stored `thresholdKm2S2` | `6.639690334512123` (`tests:312`, checked `tests:355,423`) | `6.639690334512123` | **MATCH** |
> | 433 | `liveMin + 5 === stored threshold` (float-exact) | asserted `tests:356` | `true` (`1.6396903345121228 + 5 = 6.639690334512123`) | **MATCH** |
> | 433 | component count | `2` (fixture length; pinned by `deepEqual` `tests:432` and `all.length === 19` `tests:389`) | `conn8.length = 2` (conn4 would be 3) | **MATCH** |
> | 433 | conn8[0] 7-tuple | `minC3 1.6396903345121228 · dateIso '2032-06-11' · tofDays 265.5176767676768 · breadthDays 91.05342465778813 · breadthCells 14 · cellCount 24 · tofSpanDays 83.01767676767673` (`tests:314`) | identical 7-tuple (`argmin.date` → `dateIso`; `breadthCells` derived) — byte-identical, Evidence E4 | **MATCH** |
> | 433 | conn8[1] 7-tuple | `minC3 2.3672122595483507 · dateIso '2039-05-28' · tofDays 298.72474747474746 · breadthDays 84.04931506840512 · breadthCells 13 · cellCount 23 · tofSpanDays 66.4141414141414` (`tests:315`) | identical 7-tuple — byte-identical, Evidence E4 | **MATCH** |
> | 433 | practical count @ B_min=2 | `2` (`tests:358`) | 2 of 2 (breadthCells 14, 13 — both ≥ 2) | **MATCH** |
> | 433 | `bestPractical.c3` | `1.6396903345121228` (`tests:359`) | `1.6396903345121228` (min over practical) | **MATCH** |
> | 433 | `bestPractical.argmin.dateIso` | `'2032-06-11'` (`tests:360`) | `'2032-06-11'` | **MATCH** |
> | 433 | (corroboration) argmin = global live argmin | (not asserted) | `body.live.minC3Date = 2032-06-11`, `minC3TofDays = 265.5176767676768` — matches conn8[0].argmin exactly | **MATCH** (self-consistent) |
>
> ### C. 163693 — `bodies[4].structure.liveMinPlus5.conn8`
>
> | body | quantity | test asserts | artifact says | MATCH? |
> |---|---|---|---|---|
> | 163693 | `body.id` | `'163693'` (`tests:414,418`) | `"163693"` | **MATCH** |
> | 163693 | `body.spkId` | `20163693` (`tests:414,419`) | `20163693` | **MATCH** |
> | 163693 | liveMin | `6.7561195189011825` (`tests:321`, checked `tests:422`) | `6.7561195189011825` | **MATCH** |
> | 163693 | stored `thresholdKm2S2` | `11.756119518901183` (`tests:322`, checked `tests:366,423`) | `11.756119518901183` | **MATCH** |
> | 163693 | `liveMin + 5 === stored threshold` (float-exact) | implied by `tests:365-366` | `true` | **MATCH** |
> | 163693 | component count | `5` (fixture length; pinned `tests:432`, `tests:389`) | `conn8.length = 5` (conn4 also 5 — identical here) | **MATCH** |
> | 163693 | conn8[0] 7-tuple | `6.7561195189011825 · '2034-05-19' · 182.5 · 0 · 1 · 1 · 0` (`tests:324`) | identical — byte-identical, Evidence E4 | **MATCH** |
> | 163693 | conn8[1] 7-tuple | `7.003143991119908 · '2027-05-13' · 182.5 · 0 · 1 · 1 · 0` (`tests:325`) | identical — Evidence E4 | **MATCH** |
> | 163693 | conn8[2] 7-tuple | `9.323484296870058 · '2034-05-05' · 199.10353535353536 · 0 · 1 · 1 · 0` (`tests:326`) | identical — Evidence E4 | **MATCH** |
> | 163693 | conn8[3] 7-tuple | `9.450073703487464 · '2027-04-29' · 199.10353535353536 · 0 · 1 · 1 · 0` (`tests:327`) | identical — Evidence E4 | **MATCH** |
> | 163693 | conn8[4] 7-tuple | `11.619994558375424 · '2036-04-19' · 182.5 · 0 · 1 · 1 · 0` (`tests:328`) | identical — Evidence E4 | **MATCH** |
> | 163693 | practical count @ B_min=2 | `0` (`tests:368`) | 0 of 5 (all `cellCount = 1`, all `breadthCells = 1`) | **MATCH** |
> | 163693 | `bestPractical` | `null` — NO-PRACTICAL-WINDOW (`tests:369`) | `null` (no component with breadthCells ≥ 2) | **MATCH** |
> | 163693 | (corroboration) `componentCellCounts.conn8` | (not asserted) | `[1,1,1,1,1]` — the artifact's own independent tally confirms five singletons | **MATCH** (self-consistent) |
>
> ### D. 99942 — `bodies[0].structure.liveMinPlus2.conn8`
>
> | body | quantity | test asserts | artifact says | MATCH? |
> |---|---|---|---|---|
> | 99942 | `body.id` | `'99942'` (`tests:415,418`) | `"99942"` | **MATCH** |
> | 99942 | `body.spkId` | `20099942` (`tests:415,419`) | `20099942` | **MATCH** |
> | 99942 | liveMin | `0.00005501593238631661` (`tests:334`, checked `tests:422`) | `0.00005501593238631661` (`=== 5.501593238631661e-5`, verified) | **MATCH** |
> | 99942 | stored `thresholdKm2S2` | `2.000055015932386` (`tests:335`, checked `tests:375,423`) | `2.000055015932386` | **MATCH** |
> | 99942 | `liveMin + 2 === stored threshold` (float-exact) | implied by `tests:374-375` | `true` | **MATCH** |
> | 99942 | component count | `12` (fixture length; pinned `tests:432`, `tests:389`) | `conn8.length = 12` (conn4 would be 16) | **MATCH** |
> | 99942 | conn8[0] | `0.00005501593238631661 · '2028-08-24' · 232.31060606060606 · 168.0986301372759 · 25 · 42 · 166.03535353535352` (`tests:337`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[1] | `0.09938818519513135 · '2036-05-24' · 315.3282828282828 · 161.0945205478929 · 24 · 38 · 149.4318181818182` (`tests:338`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[2] | `0.6700687457041004 · '2035-06-09' · 331.9318181818182 · 84.04931506840512 · 13 · 24 · 99.62121212121212` (`tests:339`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[3] | `0.8802187693069754 · '2035-04-27' · 381.74242424242425 · 0 · 1 · 1 · 0` (`tests:340`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[4] | `1.0609756270535315 · '2027-06-03' · 348.5353535353535 · 49.028767123352736 · 8 · 15 · 66.41414141414145` (`tests:341`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[5] | `1.1529863739374495 · '2027-05-06' · 381.74242424242425 · 0 · 1 · 1 · 0` (`tests:342`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[6] | `1.270250046776918 · '2027-04-22' · 398.3459595959596 · 0 · 1 · 1 · 0` (`tests:343`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[7] | `1.457605227533293 · '2036-04-19' · 348.5353535353535 · 0 · 1 · 1 · 0` (`tests:344`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[8] | `1.6050369796531911 · '2029-05-31' · 282.1212121212121 · 0 · 1 · 1 · 0` (`tests:345`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[9] | `1.647029680075459 · '2029-05-10' · 298.72474747474746 · 0 · 1 · 1 · 0` (`tests:346`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[10] | `1.6921359064521835 · '2029-06-21' · 265.5176767676768 · 0 · 1 · 1 · 0` (`tests:347`) | identical — Evidence E4 | **MATCH** |
> | 99942 | conn8[11] | `1.945475873216996 · '2029-07-12' · 248.9141414141414 · 0 · 1 · 1 · 0` (`tests:348`) | identical — Evidence E4 | **MATCH** |
> | 99942 | **B_min classification: practical count** | **`4` of `12`** (`tests:377`) | **4 of 12** — components with breadthCells ≥ 2 are indices 0 (bc 25), 1 (bc 24), 2 (bc 13), 4 (bc 8); the other 8 are singletons | **MATCH** |
> | 99942 | practical `minC3` list, in order | `[0.00005501593238631661, 0.09938818519513135, 0.6700687457041004, 1.0609756270535315]` (`tests:378-381`) | `[0.00005501593238631661, 0.09938818519513135, 0.6700687457041004, 1.0609756270535315]` | **MATCH** |
> | 99942 | `bestPractical.c3` | `0.00005501593238631661` (`tests:382`) | `0.00005501593238631661` | **MATCH** |
> | 99942 | `bestPractical.argmin.dateIso` | `'2028-08-24'` (`tests:383`) | `'2028-08-24'` | **MATCH** |
> | 99942 | (corroboration) `componentCellCounts.conn8` | (not asserted) | `[1,1,1,1,1,1,1,1,15,24,38,42]` — sorted tally, multiset-identical to the 12 fixture `cellCount` values | **MATCH** (self-consistent) |
> | 99942 | (corroboration) argmin = global live argmin | (not asserted) | `body.live.minC3Date = 2028-08-24`, `minC3TofDays = 232.31060606060606` | **MATCH** (self-consistent) |
>
> ### E. Derived / synthetic constants and cross-cutting rules
>
> | body | quantity | test asserts | artifact says | MATCH? |
> |---|---|---|---|---|
> | all 3 | `breadthCells` | present in every fixture record | **n/a — synthetic (derived).** `breadthCells` is NOT a stored field. The derivation rule `round(breadthDays / depCellDays) + 1` is stated explicitly at `tests:6-8` and re-applied at `tests:428`. | n/a — synthetic; **derivation stated in test** |
> | all 3 | derivation-rule closure: `breadthCells === round(breadthDays/depCell)+1` | `tests:394` over all 19 | holds for 19/19 | **MATCH** |
> | all 3 | `\|(breadthCells−1)·depCell − breadthDays\| < 1e-6` | `tests:395` over all 19 | holds; **max residual 2.8961721909581684e-10** | **MATCH** |
> | all 3 | `tofSpanDays` is an exact multiple of `tofCellDays` (< 1e-6) | `tests:396-397` over all 19 | holds; **max residual 4.263256414560601e-14** | **MATCH** |
> | all 3 | total fixture record count | `19` (`tests:389`) | 2 + 5 + 12 = **19** | **MATCH** |
> | all 3 | source connectivity array | `stored.conn8` (`tests:424`) | `conn8` exists alongside `conn4` and `componentCellCounts`; conn4 **differs** for 433 (3 comps) and 99942 (16 comps) | **MATCH** — conn8, correct per **DEC-17-1** conn8 lock |
> | all 3 | sort order (ascending minC3) | `tests:436-446` | all three stored `conn8` arrays are already ascending by `minC3` | **MATCH** |
> | all 3 | practical counts / bestPractical | `2 / 0 / 4`; best `1.6396903345121228`, `null`, `0.00005501593238631661` | **n/a — not stored.** These are the *module's* classification applied to stored summaries. Independently re-derived by this auditor from the artifact (Evidence E5): `2 / 0 / 4`, best `1.6396903345121228 @ 2032-06-11`, `null`, `0.00005501593238631661 @ 2028-08-24` | **MATCH** (independent re-derivation) |
>
> **One circularity noted and closed.** The runtime cross-check at `tests:428` derives
> `breadthCells` with the *same* formula the fixture block used, so that assertion alone
> could not detect an error in the *rule* (only in transcription). The rule itself is
> independently validated against the artifact's stored `breadthDays` at `tests:394-395`,
> and against AMENDMENT A2's (N−1) convention by the property test at `tests:297`. The
> circularity is therefore closed. Worth stating because it is the one place a naive
> reading would over-credit the cross-check.

### G-A1 VERDICT LINE (verbatim from L2)

> **G-A1 VERDICT: ALL MATCH.** 160 field-level comparisons between the test file's
> pasted expectations and the committed artifact `s17-structure-7day.json`. **Zero
> mismatches.**

Mismatch list: **none.** Three rows are marked `n/a` rather than `MATCH` because they have
no stored counterpart in the artifact (`nDep`, `nTof`, span end — not asserted at all;
`TOF_MIN_DAYS` — inferred, with the derivation stated in the test and independently
corroborated; `breadthCells` — synthetic, with its rule independently validated). Those are
coverage gaps (R-19), not mismatches.

### What this table does and does NOT prove

**It proves** that every constant pasted into the test file's fixture block is a faithful
copy of the committed artifact `s17-structure-7day.json` (806745c, never modified since it
was added), and that the classification claims layered on top of them reproduce exactly when
re-derived independently: 19 of 19 component records are byte-for-byte identical under the
stated shape mapping, all three stored thresholds are float-exactly `liveMin + Δ`, and the
conn4/conn8 divergence (433: 3 vs 2; 99942: 16 vs 12) rules out the fixtures having been
taken from the wrong array. The INV-033 failure mode — fabricated or mis-copied fixture
constants — is disproven for this test file.

**It does NOT prove that the module computes these values.** Two limits, both from L3, and
both carried forward here: (i) the artifact-fixture tests (`tests:352-434`) **never invoke
`segmentWindows`** — they exercise `resolveThreshold` and `classifyComponents` only, on
stored per-component *summaries*, so the segmentation core, the flood fill, the breadth
measurement and the date conversion are untouched by this table; (ii) `dateIso` is asserted
**exactly once in the whole 446-line suite** (`tests:213`), at column 0 — the single column
where a forward-only 69.184 s error provably cannot change the calendar date. So G-A1
establishes fixture *honesty*, not module *correctness*, and in particular it could not have
caught R-02. The test file's own header is candid that it asserts against summaries and does
not fabricate grids; the gap is a declared scope boundary, not a concealment.

---

## DISPOSITION — MED / LOW

No action was taken on any item. Queue targets only.

### MED

| ID | Disposition | Target |
|---|---|---|
| R-01 | **A3 spec entry-condition (binding).** A3's `PorkchopCell[] → SegmentGridCell[]` adapter must carry an explicit transpose **and** ship a test using an asymmetric fixture (`nDep ≠ nTof`, deliberately non-square component) asserting breadth lands on the departure axis. A shape check that passes on a square product is not a check. Alternative accepted form: harden the module to take the ordering as an explicit discriminated field so a mismatch is a type error. | D-01 → A3 entry condition |
| R-02 | **Doc-side §8 amendment + code dispatch.** Amendment pins the time convention for `argmin.dateIso` (the durable part — so the next module does not re-decide it); dispatch aligns `jdToIsoDate` with `src/v2/app/porkchop/main.ts:152-156` (subtract 69.184 s) and adds a `dateIso` assertion at a column that is **not** column 0. Standing tripwire: **re-open at HIGH if any DEC-17-2 grid parameter moves.** | D-02 → §8 amendment + fix dispatch |
| R-03 | **A3 spec entry-condition + code dispatch.** Entry condition: A3 must inject `absoluteKm2S2` from the runtime `metadata.feasibleC3MaxKm2S2` read per DEC-17-5(a); shipping the default is a gate failure at G-A3. Dispatch (preferred, cheaper): make `absoluteKm2S2` **required** under `thresholdMode: 'absolute'` via a discriminated union, moving the obligation to compile time. | D-03 → A3 entry condition + hardening dispatch |
| R-04 | **Future dispatch — input-validation hardening** (one commit with R-05, R-06). Throw on non-finite resolved `valueKm2S2`, non-finite/negative Δ, non-finite/non-integer/`<1` `bMinCells`. A legible refusal beats a false NO-PRACTICAL-WINDOW. | D-05 → hardening dispatch |
| R-05 | **Future dispatch — same commit as R-04.** Extend the existing `:182-192` validator with `Number.isFinite` on `depStartJd`, `depCellDays`, `tofMinDays`, `tofCellDays`. Four predicates; converts a silent NaN TOF and an opaque `RangeError` into the module's existing legible refusal. | D-05 → hardening dispatch |
| R-06 | **Future dispatch — same commit as R-04.** Validate cell **contents**, not just count: reject non-object entries, or (safer semantics) treat `cell == null` as a hole. Note this is A3's reduced-transfer seam, so it is not hypothetical. | D-05 → hardening dispatch |
| R-07 | **A3 spec entry-condition + code dispatch.** Echo `liveMinKm2S2` on `SegmentWindowsResult` and the applied Δ / absolute value (post-default-resolution) on `ResolvedThreshold`. Both values are already in hand — an echo, not a computation. Entry condition: A3 must not re-derive the global-minimum column by a second `liveGridMin` pass, and must not print Δ from a literal. | D-04 → A3 entry condition + return-shape dispatch |
| R-08 | **A3 spec entry-condition + code dispatch.** Echo the grid geometry on the result (`depCellDays` at minimum; preferably the full `{nDep, nTof, depStartJd, depCellDays, tofMinDays, tofCellDays}`, which also serves DEC-17-5's provenance badge). Entry condition: no A3 code path may pass a `WindowComponent` to a renderer without its sampling interval — A2's copy rule needs three quantities and the component carries two, and the missing one is uncomputable for the 13-of-19 singleton case. | D-04 → A3 entry condition + return-shape dispatch |
| R-09 | **Future dispatch (bundle with D-05).** One-character fix: tie-break `classifyComponents`' scan on `compareByMinC3`, or sort inside the helper. Correct the two doc comments either way — a function must not document a guarantee it does not provide. | D-05 → hardening dispatch |
| R-10 | **Future dispatch — test-hardening.** Add an independent reference segmenter (naive O(n²) 8-neighbour flood fill written directly in the `.mjs`) compared against the module's partition on every property-test trial. Closes connectivity, and the argmin/breadth-span gaps if extended to per-component summaries. Also: exercise **relative** mode under randomized input (all 40 trials are currently absolute), and include 1×N / N×1 shapes. | D-06 → test dispatch |
| R-11 | **Future dispatch — test-hardening (same commit as R-10).** One test injecting a non-default `bMinCells` (e.g. 3) and asserting the practical set changes. Closes the last third of §4-A1's "Δ and B_min injected not hardcoded". | D-06 → test dispatch |

### LOW

| ID | Disposition | Target |
|---|---|---|
| R-12 | Future dispatch — same test commit as R-10/R-11: one component with two cells sharing the minimum c3 (pins the intra-component lexicographic tie-break), and two components sharing a `minC3` (pins `compareByMinC3`'s depJd/tofDays branches, which currently never execute). | D-06 → test dispatch |
| R-13 | **Doc-side §8 amendment.** Record "non-finite c3 is a hole, equivalent to null" as the convention of record, in the additive form of A1/A2, so DEC-17-1's two-class hole definition and the code agree on the page and not only in a comment. | D-07 → §8 amendment |
| R-14 | **Accept as-is.** Code is verified correct. Rename `nDepIdx`/`nTofIdx`/`nIdx` → `neighborDepIdx`/`neighborTofIdx`/`neighborIdx` opportunistically **if** the file is opened for D-05; not worth a commit of its own. | accept as-is |
| R-15 | **Doc-side §8 amendment** (fold into D-02 or D-07 to avoid amendment sprawl). Records that §4 A1's `segmentWindows(cells, params)` names the conceptual input and the implemented signature is `(grid, params)`, because four of DEC-17-1's six per-component fields are only derivable with grid geometry. Explicitly **not** a code rename — that would make the parameter name lie about its type. | D-07 → §8 amendment |
| R-16 | **Accept as-is**, with a one-line contract note in the module header declaring the aliasing (`practical` shares element references with `components`; `bestPractical.argmin` is the component's own `argmin`). Optional `readonly` result types if D-05 opens the file. Revisit only if A4 sorts or annotates results in place. | accept as-is |
| R-17 | **Self-retiring at this gate for this module** — G-A2 PASS lifts the quarantine, so the unenforced barrier no longer guards anything here. The general question (should quarantined modules be hook-enforced?) is **Hudson's call only**: hook edits are protected under `AGENTS.md §2.1`. Queue as a standalone proposal, not an agent action. | future dispatch (Hudson-authorized) |
| R-18 | **Future dispatch.** Either commit `tools/overnight-2026-08-05/L3_A1_FIXTURES.md` or re-point `tests:5-6` at a tracked authority. Independently corroborated by this session's own git-status snapshot, which lists `?? tools/overnight-2026-08-05/`. A test that names its provenance should name something in git. | D-08 → provenance dispatch |
| R-19 | Future dispatch — same test commit as R-10/R-11 — or fold into G-A3's headless N=5 test, where `nDep`/`nTof` are the live values rather than fixture constants. Add `grid.nDep === 731`, `grid.nTof === 100`, and the span end. | D-06 → test dispatch (or G-A3) |
| R-20 | **Doc-side §8 erratum — PENDING human verification.** If U-1 confirms, an additive §8 entry correcting DEC-17-8's Δ-rationale figure from "163693 → 1 component" to the rev E value, and recording that the figure came from the superseded rev D pass. The Δ=5 lock itself is **not** disturbed: its other three supporting figures are confirmed against rev E, and the Δ=2 conclusion ("structure disappears", zero practical windows) holds under either count because both of 163693's Δ=2 components are singletons. | D-07 → §8 erratum, gated on U-1 |

---

## UNADJUDICATED

Claims I could not settle without reading code or artifacts I am scope-barred from. Each is
stated as a precise check a human can run, not as a guess.

**U-1 — L2-08: is DEC-17-8's "163693 → 1 component" sourced from the superseded rev D?**
*Doc half: CONFIRMED by me directly.* `SLICE_17_FOUNDING.md:230-232` reads: "SEGMENTATION
(structure): body-relative T = liveMin + Δ, Δ = 5 km²/s². **LOCKED from measurement
(806745c).** Δ=2 is too tight (**163693 → 1 component**; structure disappears)". So the doc
does attribute the lock to 806745c and does state the figure 1, exactly as L2 reports.
*Artifact half: UNADJUDICATED.* L2's claim — that 806745c (rev E) gives **2** components for
163693 at Δ=2, and that the figure 1 appears only in the superseded d8dffd0 (rev D) — rests
entirely on L2's Evidence E6 `node` output, which I may not re-run and which no other lens
checked. Two things weakly support L2: (i) L2's method was independently validated elsewhere
in the same report by a mechanized `diff` (E4), and (ii) §1 of the founding doc, which
describes the same rev E pass, phrases 163693's Δ=2 result in terms of *breadth* ("zero
components wider than a single departure cell at Δ=2 and Δ=5", `:50-51`) rather than a count
of one — consistent with, though not proof of, two singletons.
**What a human needs to check:** one read of
`tools/slice17-research/data/s17-structure-7day.json` →
`bodies[4].structure.liveMinPlus2.conn4.length` and `.conn8.length` (L2 says both are 2),
compared against the same path in `tools/slice17-research/data/s17-cache-live-structure.json`
at `d8dffd0` (L2 says both are 1). If confirmed → R-20 as written (LOW, doc erratum). If L2
is wrong → R-20 is withdrawn entirely. **Either way the Δ=5 lock stands**, so this cannot
become a gate item.

**U-2 — L3's "0 of 731 columns flip, 49.172 s margin" (load-bearing for R-02's MED).**
This single computation is the only thing holding R-02 below HIGH. It was performed by one
lens, in standalone `python3` arithmetic over two published constants, and no other lens
reproduced it. I checked it for internal consistency and it passes: 731 columns spaced
355.068 s around an 86400 s day equidistribute at ~118.2 s mean spacing, so a measured
closest approach of 118.356 s is exactly what the geometry predicts, and
118.356 − 69.184 = 49.172 ✓. But internal consistency is not reproduction.
**What a human needs to check:** for `k` in 0..730, compute
`t = ((2461041.500800741 + k*7.004109589041096) − 2440587.5) * 86400` seconds and confirm
that no `t mod 86400` falls in `[86400 − 69.184, 86400)`. Five lines. If any column does
fall in that window, **R-02 escalates to HIGH immediately** — arm 1 of the bar would fire on
a locked-grid input — and G-A2 flips to FAIL. I judge this unlikely given the consistency
check above, but it is the one arithmetic fact on which the verdict turns, so it should be
re-run rather than trusted.

**U-3 — L1-01's premise: does the existing porkchop pipeline really fill TOF-fastest?**
R-01's entire force rests on L1's reading of `src/v2/porkchop/grid-compute.ts:175-221`
(departure loop outer, TOF loop inner) and `src/v2/porkchop/porkchop-view.ts:265,629`
(`cells[depIndex * nTof + tofIndex]`). Neither L2 nor L3 examined the existing pipeline, and
I may not. If that premise is wrong — if the pipeline is already departure-fastest — R-01
evaporates and D-01 is unnecessary.
**What a human needs to check:** one grep for the cell-fill loop nesting in
`grid-compute.ts` and the index arithmetic at `porkchop-view.ts:265`. Cheap, and it decides
whether A3 carries a binding entry condition.

**U-4 — L1-03's supporting fact: does `tests/fixtures/v2/lambert-screen-cache.json` still
carry `"feasibleC3MaxKm2S2":25`?** This is load-bearing for R-03's severity, not just its
narrative: it is *why* a forgotten injection is invisible today and therefore why R-03 is MED
rather than something sharper. If that metadata value is ever anything other than 25, a
defaulted `absoluteKm2S2` immediately tags feasibility against a stale boundary while
labelling it a runtime read — a wrong classification on a trust surface. Single-sourced (L1
only).
**What a human needs to check:** one grep for `feasibleC3MaxKm2S2` in
`tests/fixtures/v2/lambert-screen-cache.json`. If it is 25, R-03 stays MED and D-03 stands.
If it is not, R-03 should be re-graded before A3 lands.

**U-5 — non-conflict, recorded so it is not mistaken for one.** L3-V12 states "Δ and B_min
are injected, not hardcoded" (verifying `:128`, `:133`, `:193` — a claim about the **code**),
while L2-03 states B_min injection is never exercised (a claim about the **tests**). Both are
true and they do not contradict; a reader skimming the two findings tables could easily read
them as a conflict. Merged finding R-11 states the code-vs-test split explicitly for exactly
this reason.

**No other cross-lens evidence conflicts were found.** Where the lenses differed, they
differed on *grading*, not on facts — and in every such case (R-02, R-04, R-05, R-07) the
lower-grading lens's evidence was consistent with the higher grade, so the conflict rule
applied cleanly and no lens had to be overruled against its own evidence.

---

*End of reconciliation. Prepared under marker S-S17-GA12-AUDIT-2026-08-07-A. Nothing in this
report was applied; no file was edited except this one.*
