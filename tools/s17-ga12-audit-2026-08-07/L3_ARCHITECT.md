# L3 — ARCHITECT LENS

Marker: S-S17-GA12-AUDIT-2026-08-07-A
Module under audit: `src/v2/porkchop/segment-windows.ts` (280 lines)
Tests: `tests/v2-segment-windows.test.mjs` (446 lines)
Doc authority: `SLICE_17_FOUNDING.md` §3, §4, §8 AMENDMENT A2
Session: fresh; the auditor did not write the code under audit.
Mode: READ-ONLY. No repo code was executed — no tsc, no `node --test`, no build.
The one computation performed (§4) is standalone floating-point arithmetic over
two published constants, run in `python3`; it touches no repo module.

---

## Verdict summary

**0 HIGH / 5 MED / 3 LOW.**

No finding blocks G-A2 under the stated bar (0 HIGH open). The module is
genuinely pure, the quarantine is intact, and the segmentation core is correct
under every input the compare view is locked to produce.

The one thing I want on the record above all others: **L3-01 is a MED only
because DEC-17-2 locks `nDep = 731` and locks the span to
2026-01-01 → 2040-01-01.** The module's date conversion is wrong in convention
and produces the right answer on that grid by a **49.172-second margin**. Change
the span start by one hour, or change `nDep`, and it emits a calendar date that
is one day later than the porkchop view shows for the same departure epoch. That
margin is not defended by a test, an assertion, or a DEC. See §4 for the
arithmetic.

---

## 1. PURITY

**VERIFIED CLEAN on all four sub-questions.**

**Imports.** The file contains **zero `import` statements**. Lines 1–17 are
comments; line 19 begins the first `export interface`. There is nothing from
`app/`, nothing from view code, nothing from V1 (`AGENTS.md:38`, "V2 code must
not import from them"), and nothing from `src/v2/core/**`. The header's own
claim at `src/v2/porkchop/segment-windows.ts:6-7` ("Pure module: no imports from
app/ or view code") is accurate.

**Module-load side effects — none.** Everything at module scope is inert:

| Line | Construct | Effect at import |
|---|---|---|
| `segment-windows.ts:19-83` | six `export interface` | type-only, erased |
| `segment-windows.ts:85` | `DEFAULT_DELTA_KM2S2 = 5` | numeric literal |
| `segment-windows.ts:91` | `DEFAULT_ABSOLUTE_KM2S2 = 25` | numeric literal |
| `segment-windows.ts:92` | `DEFAULT_B_MIN_CELLS = 2` | numeric literal |
| `segment-windows.ts:165-169` | `NEIGHBOR_OFFSETS_8` | one array literal |
| `segment-windows.ts:94,99,113,123,145,171` | function declarations | no invocation |

No top-level call, no I/O, no registration, no `globalThis` write.

**Ambient / global state — none.** The only global identifier referenced in the
whole file is `Date`, at `segment-windows.ts:95`. It is used as
`new Date(ms).toISOString()`, which is fixed to UTC by spec and therefore
**immune to the host `TZ`** — the module's output does not change with the
machine's timezone. (`toISOString` has a separate defect; that is §4, not a
purity defect.) There is no `Math.random`, no `Date.now`, no mutable
module-scope binding. The module is deterministic: same inputs, same output,
every run, every machine.

**Hidden mutation of the caller's cell array — none. VERIFIED.** I traced every
access to `grid` and `grid.cells`:

- `liveGridMin` (`segment-windows.ts:113-121`) — `for…of` read, writes only its
  local `min`.
- Membership pass (`segment-windows.ts:201-207`) — reads `cells[i]`, writes only
  to the local `Uint8Array member` allocated at line 201.
- DFS (`segment-windows.ts:228-259`) — reads `cells[idx].c3` at line 233; the
  only writes are to the local `visited` (lines 217, 255) and the local `stack`.
- Component assembly (`segment-windows.ts:261-274`) — reads
  `grid.depStartJd`, `grid.depCellDays`, `grid.tofMinDays`, `grid.tofCellDays`;
  writes into a freshly-built object literal.
- `components.sort(compareByMinC3)` (`segment-windows.ts:277`) — `sort` mutates
  in place, but `components` is the module's own array, allocated at
  `segment-windows.ts:211`. **The caller's array is never sorted.** This is the
  one place a purity bug would most plausibly hide, and it is clean.
- `classifyComponents` (`segment-windows.ts:152`) — `.filter`, non-mutating,
  returns a new array. Its parameter is correctly typed
  `readonly WindowComponent[]` (`segment-windows.ts:146`).

There is one **aliasing** property worth stating precisely, because it is not
mutation but a consumer can turn it into mutation — recorded as **L3-07 (LOW)**:
`practical` shares element object references with `components`
(`segment-windows.ts:152`, `.filter` copies references), and
`bestPractical.argmin` is the **same object** as that component's `argmin`
(`segment-windows.ts:161`), not a copy. Nothing returned is frozen, and
`SegmentWindowsResult` (`segment-windows.ts:75-83`) types the arrays as mutable
`WindowComponent[]`. If A4 sorts or annotates `result.practical` in place it
also reorders/annotates `result.components`, and writing to
`bestPractical.argmin` writes into the component. This is a normal JS return
convention, not a defect — but it is an undeclared contract, and the module
declares everything else it does.

---

## 2. QUARANTINE

**Header: PRESENT and well-formed. VERIFIED.**

`src/v2/porkchop/segment-windows.ts:1-3`:

```
// UNAUDITED — Slice 17 G-A2 multi-agent audit PENDING.
// Per SLICE_17_FOUNDING.md §4, nothing outside tests may import
// this module until G-A2 closes with 0 HIGH findings.
```

It is the **first three lines of the file** — nothing precedes it. It is exact
against its authority: `SLICE_17_FOUNDING.md:297-299` reads "A2 MULTI-AGENT
AUDIT of A1 (mathematician · adversarial · architect · reconciliation). GATE
G-A2: 0 HIGH findings open. Nothing consumes segmentWindows before G-A2." The
header names the gate (`G-A2`), the authority (`SLICE_17_FOUNDING.md §4`), the
release condition (`0 HIGH findings`), and the permitted consumer (`tests`). All
four match the doc. No drift.

**Repo-wide importer grep. This is the required evidence.**

Literal command:

```
grep -rn "segment-windows" \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' \
  --include='*.cjs' --include='*.jsx' --include='*.html' --include='*.json' . \
  | grep -v '/node_modules/' | grep -v '/tests/' | grep -v '/\.git/'
```

Full output:

```
tests/v2-segment-windows.test.mjs:27:const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-segment-windows');
tests/v2-segment-windows.test.mjs:40:    path.join(repoRoot, 'src', 'v2', 'porkchop', 'segment-windows.ts');
tests/v2-segment-windows.test.mjs:50:      pathToFileURL(path.join(tempOutDir, 'porkchop', 'segment-windows.js')).href
```

Note on reading that output: the three surviving lines are **from
`tests/v2-segment-windows.test.mjs` itself** — the `-v '/tests/'` filter matches
the substring `/tests/`, and grep emitted these paths without a leading `./`, so
they were not filtered. They are the sanctioned test consumer, i.e. **the
exclusion list is what leaked, not the quarantine.** After discounting them,
**the set of non-test files referencing `segment-windows` is empty.**

I ran the unfiltered sweep as a cross-check (all file types, excluding `.git/`
and `node_modules/`). Every additional hit is prose, not code:
`SLICE_17_FOUNDING.md:290,299,439,451` · `STATUS.md:43,84` ·
`tools/context-audit-2026-08-07/*.md` (4 files) ·
`tools/overnight-2026-08-05/MORNING_REPORT.md:21,71,94,95,160,181,210,212` ·
and `src/v2/porkchop/segment-windows.ts:171` (its own declaration). **Zero
executable importers.**

Two further confirmations:

- **Deploy surface clean.**
  `grep -rl "conn8 is LOCKED\|breadthCells\|bestPractical" docs/ dist/` returns
  **no files**. No built bundle on the committed deploy surface contains this
  module. (Relevant given the deploy-surface rule added at `aaf74a4` and the
  twelve-undeployed-commits incident at `AGENTS.md:296`.)
- **No entry point exists yet.** `vite.config` declares `porkchopV2` at
  `vite.config.*:19` and has **no `compareV2` entry**, consistent with
  DEC-17-7 (`SLICE_17_FOUNDING.md:224-227`) being unbuilt.

**VERDICT: the quarantine is HOLDING, in source and in the deploy surface.**

**L3-08 (LOW).** The quarantine is **advisory only**. I grepped
`.githooks/pre-commit` and `.githooks/pre-push` for `segment-windows`,
`UNAUDITED`, and `quarant` — **no matches**. `AGENTS.md §2.1` (lines 98–125)
lists the hook-enforced hard rules and contains no import-quarantine rule; the
only mechanical import rule in AGENTS.md is the V1 one at line 38. So the sole
thing standing between A3 and an illegal import is a comment at the top of the
file. It is holding today; it is holding on discipline, not on machinery. If G-A2
closes with findings open, or if A3 is written by a fresh agent, a one-line
`--include='*.ts'` grep in the pre-commit hook would make it structural. Noting,
not prescribing — hook edits are protected (`AGENTS.md:112`).

---

## 3. API SHAPE vs DOC

**The drift is real. Severity: LOW. The code is right; the doc is loose.**

**What the doc says** — `SLICE_17_FOUNDING.md:289-291`:

```
A1  Window-extraction module. New pure module in src/v2/porkchop/
    (side-file; nothing edited in place): segmentWindows(cells, params) →
    components per DEC-17-1, conn8, Δ and B_min injected not hardcoded.
```

**What the code says** — `src/v2/porkchop/segment-windows.ts:171-174`:

```ts
export function segmentWindows(
  grid: SegmentGrid,
  params: SegmentParams,
): SegmentWindowsResult {
```

where `SegmentGrid` (`segment-windows.ts:25-35`) is
`{ nDep, nTof, depStartJd, depCellDays, tofMinDays, tofCellDays, cells }`.

**Classification: LOW — wording/naming drift, no behavioural consequence.**

**The code's shape is the correct one, and `(cells, params)` is not
implementable as written.** This is the load-bearing part of the finding, and it
is why the resolution must go doc-side. A bare `cells` array cannot produce four
of the six fields DEC-17-1 requires per component
(`SLICE_17_FOUNDING.md:99-102`):

- `argmin.dateIso` and `argmin.depJd` need `depStartJd` + `depCellDays`
  (`segment-windows.ts:262,267`);
- `argmin.tofDays` needs `tofMinDays` + `tofCellDays` (`segment-windows.ts:268`);
- `breadthDays` needs `depCellDays` (`segment-windows.ts:271`);
- `tofSpanDays` needs `tofCellDays` (`segment-windows.ts:273`);

and the 2-D component walk itself needs `nDep`/`nTof` to decode the row-major
index and bound the neighbourhood (`segment-windows.ts:230-231,250`). A flat
`cells` array carries no shape. `(cells, params)` was shorthand in a phase
description, not a signature specification.

Note also that the doc's own §8 AMENDMENT A2 already cites the real module and
its real derivation rule (`SLICE_17_FOUNDING.md:451-452`), so the founding
document is internally inconsistent with its own §4 line — A2 implicitly
ratified the `grid`-shaped module.

This was already flagged pre-audit and queued as G-A2 input:
`tools/overnight-2026-08-05/MORNING_REPORT.md:212` records "signature wording
`segmentWindows(cells, params)` vs `(grid, params)`".

**RECOMMENDATION — doc-side erratum. No change made.**

Minimal truthful resolution: a **§8 additive amendment (A3)** in
`SLICE_17_FOUNDING.md`, in the same form as A1 and A2 — the §4 line stands as
written, the amendment is the correction of record. Suggested substance: the §4
A1 phrase `segmentWindows(cells, params)` names the conceptual input; the
implemented signature is `segmentWindows(grid: SegmentGrid, params:
SegmentParams)`, because the per-component quantities DEC-17-1 mandates
(argmin date, TOF, breadth days, TOF span) are only derivable from the grid
geometry that accompanies the cells. The `(N-1)×cell` lesson from A2 applies
here too: a doc that names a function must name the argument it actually needs.

**Explicitly NOT recommended: a code-side rename.** Renaming `grid` → `cells`
would make the parameter name lie about its type, and restructuring to
`(cells, geometry, params)` to satisfy a shorthand phrase would be the doc
driving a worse API. `SLICE_17_FOUNDING.md:2-4` binds the doc to additive-only
amendment, which is exactly the mechanism for this case.

---

## 4. DATE CONVENTION

### 4.1 What the code actually does

`src/v2/porkchop/segment-windows.ts:94-96`:

```ts
function jdToIsoDate(jd: number): string {
  return new Date((jd - 2440587.5) * 86_400_000).toISOString().slice(0, 10);
}
```

Called at `segment-windows.ts:267`, on `depJd` computed at
`segment-windows.ts:262` as `grid.depStartJd + argDep * grid.depCellDays`.

`grid.depStartJd` is documented **"JD (TDB) of departure column 0"**
(`segment-windows.ts:28`), and the fixture confirms it: `DEP_START_JD =
2461041.500800741` (`tests/v2-segment-windows.test.mjs:62`), cross-checked at
runtime against `artifact.span.requested.start.jdTdb`
(`tests/v2-segment-windows.test.mjs:411`) — the field name is literally `jdTdb`.

2440587.5 is the JD of the **Unix epoch, 1970-01-01T00:00:00 UTC**. So the
expression `(jd − 2440587.5) × 86400000` converts a JD to milliseconds since the
Unix epoch **on the assumption that the JD's time scale is UTC**. It is not — it
is TDB. **CONFIRMED: a TDB Julian date is being formatted as if it were UTC.**
The `TDB − UTC` offset (currently 69.184 s = 37 s of TAI−UTC + 32.184 s of
TT−TAI) is silently dropped.

The module's own docstring states this accurately and without evasion
(`segment-windows.ts:51-53`): *"UTC calendar date derived from the TDB JD; the
~69 s TDB−UTC offset can shift dates only within 69 s of midnight."* The author
knew. This was a documented choice, not an oversight — which is why it is a
convention finding rather than a bug finding.

### 4.2 The repo already has the correct conversion — twice

This is the part that moves the finding from cosmetic to structural. Two other
places in this repo convert the same quantity, and **both apply the offset**:

**The shipped porkchop view** — `src/v2/app/porkchop/main.ts:152-156`:

```ts
function jdTdbToUtcDateString(jdTdb: number): string {
  const tdbSecondsSinceJ2000 = (jdTdb - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
  const utcMillis = (tdbSecondsSinceJ2000 - 69.184 + 946_728_000) * 1000;
  return new Date(utcMillis).toISOString().slice(0, 10);
}
```

**The harness that produced the audit artifact** —
`tools/slice17-research/measurements/s17-cache-vs-live.mjs:80-88`, applied to
every stored argmin at line 308 (`date: jdTdbToUtcDateString(argminCell.depJD)`).

So `segment-windows.ts` is the **only** implementation of this conversion in the
repo that omits the offset, and it disagrees by **exactly +69.184 s** with both
the view the user opens next and the artifact the tests are pinned to. Note the
direction: the module reports the epoch **69.184 s later** than it is, so its
error mode is rendering the **next** calendar day, never the previous one.

### 4.3 Does a DEC pin the convention? NO.

I grepped `SLICE_17_FOUNDING.md` for `UTC | TDB | 69.184 | leap | ISO | dateIso |
calendar | timezone | midnight`. **Three hits, all inside DEC-17-10, none of
them a pin:**

`SLICE_17_FOUNDING.md:275-279`:

```
  on exactly this class (69.184 s past the last sample). The compare view
  ...
  Fixture bounds, verified: JD TDB 2461041.5 → 2466519.5
  (2025-12-31T23:58:50Z → 2040-12-30T23:58:50Z UTC), 5,479 samples, 1-day
```

**No DEC pins the time convention for `argmin.dateIso`.** DEC-17-1 says "argmin
(departure date, tofDays)" (`SLICE_17_FOUNDING.md:99`) and stops there — it never
says which time scale "departure date" is expressed in. DEC-17-4 requires a date
in the headline (`SLICE_17_FOUNDING.md:167`) without naming a scale. **This is a
spec gap the code resolved silently**, which is precisely the MED clause.

But note what DEC-17-10 does do, unintentionally: it is the founding doc's own
**worked example of the correct conversion**. JD TDB 2461041.5 is rendered
`2025-12-31T23:58:50Z UTC` — 69.184 s *earlier* than the naive
`2026-01-01T00:00:00` the module's formula would produce, and rounding to the
date it gives **2025-12-31, a different calendar day**. The doc converts TDB→UTC
correctly, and rounds to a different day than this module would, on the very
first JD it quotes. And DEC-17-10's rationale records that a 69.184 s error
already killed one measurement run (`SLICE_17_FOUNDING.md:274-276`, "Our own rev
A measurement died on exactly this class (69.184 s past the last sample)"). This
repo has been bitten by this exact quantity before.

### 4.4 Largest error, and whether it matters — the arithmetic

**Largest possible error: exactly one calendar day**, and only when the true UTC
instant falls in the 69.184-second window `[23:58:50.816, 24:00:00)`. Outside
that window the rendered date is correct. This is a boundary defect, not a drift
defect — it cannot accumulate.

I computed whether the **locked** grid ever lands in that window. Inputs, both
from published constants, not from executing the module:
`depStartJd = 2461041.500800741` (`tests/v2-segment-windows.test.mjs:62`),
`depCellDays = 7.004109589041096` and `nDep = 731` (DEC-17-2,
`SLICE_17_FOUNDING.md:126-127`). I evaluated both conversions —
`(jd − 2440587.5) × 86400000` and the repo's `− 69.184 s` form — for all 731
columns:

| Result | Value |
|---|---|
| Columns where the two conventions give different dates | **0 of 731** |
| Closest any column comes to midnight from below | **118.356 s** (column 243) |
| Safety margin over the 69.184 s offset | **49.172 s** |
| Time-of-day advance per column | 355.068 s (`0.004109589041096 d`) |

Column 0 sits at exactly `2026-01-01T00:00:00.000 UTC` — the *start* of a day —
so the module's `+69.184 s` is absorbed harmlessly there, and each subsequent
column advances the time-of-day by 355.068 s, cycling the full day roughly three
times across the span. **None of those 731 residues lands in the 69.184-second
danger window.** Every one of the 19 artifact argmin dates asserted in
`tests/v2-segment-windows.test.mjs:310-350` therefore agrees under both
conventions.

**On the locked grid the module emits the correct date. It is correct by 49.172
seconds of luck.**

How fragile that luck is, same arithmetic:

| Perturbation | Flipped columns |
|---|---|
| span start `+1 h` | **1 of 731** |
| span start `+6 h` | **1 of 731** |
| `nDep = 1461` (daily-ish sampling, same span) | **1** |
| `nDep ∈ {200, 365, 500, 731}` | 0 |

A one-hour change in the departure-window start, or a resolution change, is
enough to make the module print a wrong calendar date. Both are live risks, not
hypotheticals: DEC-17-2's own SPAN CLAUSE flags the cache/view span mismatch as
unresolved (`SLICE_17_FOUNDING.md:133-138`, and F2 at
`SLICE_17_FOUNDING.md:552-555`), and DEC-17-2 explicitly contemplates that the
view's 200-column grid exists alongside the compare grid
(`SLICE_17_FOUNDING.md:130-132`).

**Does it matter for the UI copy the DECs require? Yes, when it fires.** DEC-17-4
puts the date in the headline: "best practical window C3 (+ date, TOF)"
(`SLICE_17_FOUNDING.md:167`). DEC-17-2 promises "Consistency with the porkchop
the user opens next holds by construction"
(`SLICE_17_FOUNDING.md:124-125`) — and `main.ts:152` is that porkchop, using the
other convention. A flipped column produces a compare table and a porkchop
disagreeing by one day about the same departure epoch, on a surface whose entire
DEC-17-5 thesis is that its labels are derived and trustworthy. That is the
failure this slice was designed to prevent.

### 4.5 Severity: MED (I considered HIGH; here is why it does not reach it)

The HIGH bar is "can emit a wrong number **under inputs the compare view will
actually produce**, OR violates a locked DEC." DEC-17-2 **locks** both the span
(2026-01-01 → 2040-01-01) and the resolution (`nDep 731, nTof 100`,
`SLICE_17_FOUNDING.md:126`). At those locked parameters the flip count is
measured **0**, so no wrong date reaches the user and DEC-17-2's consistency
promise is not observably broken. The wrong-number arm does not fire.

It lands squarely on both MED clauses: correctness risk only under inputs
outside the locked set, and a spec ambiguity (no DEC pins the time scale) that
the code resolved silently — and resolved *differently from the two existing
implementations in the same repo*.

**This is the finding I would most want re-checked if any locked grid parameter
ever moves.** It converts to HIGH on that day with no code change.

### 4.6 Why G-A1 did not catch it

Worth recording, because it explains the survival path. `dateIso` is asserted
**exactly once** in the whole 446-line suite:
`tests/v2-segment-windows.test.mjs:213`, `assert.equal(one.components[0].argmin.dateIso,
'2026-01-01')` — at **column 0**, which is the single column in the grid where
the `+69.184 s` offset provably cannot change the date, because column 0 sits at
midnight exactly and the error direction is forward. The artifact-fixture tests
(`tests/v2-segment-windows.test.mjs:352-434`) never invoke `segmentWindows` at
all — they exercise `resolveThreshold` and `classifyComponents` only, and the
artifact's `date` values are compared against **pasted constants**
(`tests/v2-segment-windows.test.mjs:424-432`), never fed through the module's
`jdToIsoDate`. So the module's date conversion has never been compared against
the harness's, despite both being in the same test file. The test file's own
header is honest that it asserts against summaries and does not fabricate grids
(`tests/v2-segment-windows.test.mjs:12-17`) — the gap is real but it is a
declared scope boundary, not a concealment.

---

## 5. CONSUMER-READINESS

Read against DEC-17-3 (`SLICE_17_FOUNDING.md:149-164`), DEC-17-4
(`166-195`), DEC-17-5 (`197-212`), and §8 AMENDMENT A2's binding copy rule
(`474-483`).

**Overall: the return shape is close, and the segmentation payload is complete.
Three named gaps will bite A3.**

### 5.1 What the return shape DOES carry — VERIFIED

| DEC requirement | Carried? | Evidence |
|---|---|---|
| DEC-17-3 best practical window C3 | YES | `bestPractical.c3`, `segment-windows.ts:81,161` |
| DEC-17-3 NO-PRACTICAL-WINDOW state (null, never a number, never blank) | YES | `bestPractical: … \| null`, `segment-windows.ts:80-81`; scan returns `null` when `practical` is empty, `segment-windows.ts:153-158,161` |
| DEC-17-3 "never ranked by its global minimum" | YES | `best` is scanned over `practical` only (`segment-windows.ts:154`), so a singleton global min can never become `bestPractical`; pinned by `tests/v2-segment-windows.test.mjs:146-147` |
| DEC-17-4 headline date | YES (see §4) | `argmin.dateIso`, `segment-windows.ts:52,267` |
| DEC-17-4 headline TOF | YES | `argmin.tofDays`, `segment-windows.ts:54,268` |
| DEC-17-4 distinct-opportunity count at active Δ | YES | `components.length`, `segment-windows.ts:77` (and `practical.length` if the count is meant to be qualified — both are available, so the ambiguity is harmless) |
| DEC-17-4 max window breadth (cells) | YES | max over `components[].breadthCells`, `segment-windows.ts:59` |
| DEC-17-3 dominance-badge input "max window breadth cells" | YES | same field, `segment-windows.ts:59` |
| TOF span | YES | `tofSpanDays`, `segment-windows.ts:65,273` |
| A2 breadth pair — `breadthCells` AND `breadthDays` | YES, both | `segment-windows.ts:59,62` populated at `271` |
| A2 `(N-1) × cell` convention | YES | `breadthDays = (breadthCells - 1) * grid.depCellDays`, `segment-windows.ts:271`; matches `SLICE_17_FOUNDING.md:451-452` verbatim and is asserted at `tests/v2-segment-windows.test.mjs:297` |
| Threshold echo — mode | YES | `threshold.mode`, `segment-windows.ts:69` |
| Threshold echo — **resolved numeric value** | YES | `threshold.valueKm2S2`, `segment-windows.ts:71-72`, set at `129`/`133`. This is the resolved `liveMin + Δ` in relative mode, not the mode/delta — the question's specific concern is satisfied. |

The A2 breadth pair specifically is present, correct, and correctly derived.
That part of the copy rule is served.

### 5.2 GAP 1 — the live grid minimum is computed and thrown away
**L3-03, MED.**

`segment-windows.ts:194` calls `liveGridMin(cells)` and passes the result
straight into `resolveThreshold`. The value is never stored and never returned.
`SegmentWindowsResult` (`segment-windows.ts:75-83`) has no field for it.

DEC-17-3 requires it on screen:
`SLICE_17_FOUNDING.md:158-159` — *"Global minimum displays subordinate, labeled
'global minimum (731×100 grid)'"*. DEC-17-4 repeats it as a column:
`SLICE_17_FOUNDING.md:169` — *"global min C3 (subordinate, labeled)"*.

**What A3 hits:** to render a mandatory column, it must call the exported
`liveGridMin` (`segment-windows.ts:113`) a second time over the same 73,100-cell
array — a full redundant pass per body, five bodies per compare load, inside a
~2 s budget that measured 1431.52 ms (`SLICE_17_FOUNDING.md:284-285`). Not fatal,
and the function *is* exported so nothing is blocked. But a module that computes
a DEC-mandated display value and discards it is inviting the consumer either to
recompute or — worse — to reach for a literal, which DEC-17-5 forbids outright
(`SLICE_17_FOUNDING.md:210-212`, "labels are DERIVED, never literal constants").

**Second-order consequence: Δ is not recoverable from the result.** DEC-17-3
mandates the copy *"no practical window at Δ=5"* (`SLICE_17_FOUNDING.md:154`)
and DEC-17-8 states *"Δ is DISCLOSED in UI copy"* (`SLICE_17_FOUNDING.md:234`)
and *"mode toggle (relative Δ=5 | absolute 25), both labeled with values"*
(`244`). `ResolvedThreshold` carries `mode` and the **resolved** `valueKm2S2` —
never Δ itself. Δ is recoverable only as `valueKm2S2 − liveMin`, and `liveMin`
is exactly the field that was discarded. A3 can of course echo back the Δ it
passed in — but if it omitted `deltaKm2S2` and took the default, it must reach
for `DEFAULT_DELTA_KM2S2` (`segment-windows.ts:85`) to know what to print. That
works, and it is a legitimate derived read, but it is a second source of truth
for a number that DEC-17-8 says must be disclosed.

**Recommendation (no change made):** add `liveMinKm2S2: number` to
`SegmentWindowsResult`, and `deltaKm2S2 | absoluteKm2S2` (whichever applied,
post-default-resolution) to `ResolvedThreshold`. Both are already in hand at
`segment-windows.ts:128,133,194`; this is an echo, not a computation.

### 5.3 GAP 2 — the A2 copy rule cannot be satisfied from the result alone
**L3-04, MED. This is the A2-specific answer the question asks for.**

A2's binding copy rule (`SLICE_17_FOUNDING.md:474-480`) is explicit about what
must appear together:

> a breadth day-span is NEVER displayed alone. Every display of breadthDays
> carries, adjacent and in the same visual unit, **the cell count and the
> sampling interval**. […] Compliant pattern:
> `"7.00 d window - 2 verified departures, 7.00 d sampling"`

Three quantities are required adjacent: the day span, the cell count, and **the
sampling interval**. `WindowComponent` (`segment-windows.ts:57-66`) carries the
first two. **It does not carry `depCellDays`, and neither does
`SegmentWindowsResult`** (`segment-windows.ts:75-83`) — the grid geometry is
consumed at `segment-windows.ts:262,268,271,273` and never echoed.

**Why that is not merely cosmetic:** the interval is *usually* recoverable as
`breadthDays / (breadthCells − 1)` — but that expression **divides by zero for
every singleton component**, and singletons are not an edge case in this data
set. They are the dominant case in the very fixtures A3 will render: 163693 is
**5 singletons out of 5** (`tests/v2-segment-windows.test.mjs:324-328`, the
NO-PRACTICAL-WINDOW body DEC-17-3 names explicitly at
`SLICE_17_FOUNDING.md:155`), and 99942 is **8 singletons out of 12**
(`tests/v2-segment-windows.test.mjs:340-348`). For all thirteen of those, a
component object alone cannot tell a renderer what the sampling interval is.

**What A3 hits:** the sampling interval must be threaded separately from the
input `SegmentGrid` alongside every component, all the way to the cell that
renders it. Any code path that passes a `WindowComponent` without its grid — a
sort helper, a badge formatter, a small-multiple caption, a serialized URL state
— is structurally incapable of emitting A2-compliant copy, and the failure mode
is a **bare day count**, which A2 names as "never to ship"
(`SLICE_17_FOUNDING.md:481-483`). The module makes the compliant path require
extra care and the non-compliant path the path of least resistance. That is the
wrong gradient for a rule the doc marks binding.

The same omission touches DEC-17-5's provenance badge, which requires "grid
resolution (731×100; 7.004 d × 16.604 d)" read from the computation that
produced the numbers (`SLICE_17_FOUNDING.md:199-200,210-212`): the result object
is not self-describing, so A3 must re-attach `nDep`/`nTof`/`depCellDays`/
`tofCellDays` from the input grid.

**Recommendation (no change made):** echo the geometry on the result — e.g.
`geometry: { nDep, nTof, depStartJd, depCellDays, tofMinDays, tofCellDays }` on
`SegmentWindowsResult`, or `depCellDays` directly on `WindowComponent` so a
component is independently renderable. The latter is what the A2 copy rule
actually implies: if the day value and the interval must always appear together
in the UI, they should travel together in the data.

### 5.4 GAP 3 — the 25 km²/s² literal can ship silently
**L3-02, MED.**

`segment-windows.ts:131-134`:

```ts
  return {
    mode: 'absolute',
    valueKm2S2: params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2,
  };
```

DEC-17-5 rider (a) is unambiguous (`SLICE_17_FOUNDING.md:203-205`): the 25 km²/s²
feasibility threshold must be *"disclosed — runtime read of
metadata.feasibleC3MaxKm2S2, zero regeneration"*. The module's own header says
the same thing, forcefully (`segment-windows.ts:86-91`): *"Fallback only. […]
the post-audit consumer MUST inject that value, never ship this literal."*

The code does not enforce its own instruction. If A3 calls
`segmentWindows(grid, { thresholdMode: 'absolute' })` and forgets
`absoluteKm2S2`, `??` substitutes the literal **silently**, the result reports
`threshold.valueKm2S2 = 25` with `mode: 'absolute'` — indistinguishable from a
correct runtime read — and the compare surface displays a hardcoded constant
while satisfying every type check and every existing test. Indeed
`tests/v2-segment-windows.test.mjs:245-247` exercises exactly that call shape and
asserts the literal comes back, so the suite *ratifies* the silent-default path.

This is the failure class DEC-17-5 was written against, with F1/F4 as its cited
precedent (`SLICE_17_FOUNDING.md:210-211`, "F1/F4 (§11) show what literals
cost") — and F1 (`SLICE_17_FOUNDING.md:547-551`) is precisely a case of one
consumer guarded and one "guarded by luck."

Severity is MED, not HIGH: the module is quarantined, no consumer exists yet, and
the header comment is an explicit warning. It becomes HIGH the moment A3 lands
with the parameter omitted.

**Recommendation (no change made):** make `absoluteKm2S2` **required** when
`thresholdMode === 'absolute'` (a discriminated union on `SegmentParams` costs
nothing and moves this to compile time), or have `resolveThreshold` return a
provenance flag (`source: 'injected' | 'default'`) so the surface can refuse to
disclose a defaulted boundary. The compile-time option is strictly better and is
in keeping with §4 A1's own requirement that parameters be *"injected not
hardcoded"* (`SLICE_17_FOUNDING.md:291`) — which the module honours for Δ and
B_min in spirit but weakens here by defaulting the one value a DEC says must
come from runtime metadata.

### 5.5 GAP 4 — geometry finiteness is unvalidated
**L3-05, MED.**

`segment-windows.ts:182-192` validates the grid **shape** carefully — integer
`nDep`/`nTof`, non-negative, `cells.length === nDep * nTof` — and throws a
legible message. It validates **none of the six geometry numbers**. A
non-finite `depStartJd` or `depCellDays` reaches `jdToIsoDate`
(`segment-windows.ts:95`), where `new Date(NaN).toISOString()` throws
`RangeError: Invalid time value` from inside a stdlib call, with no mention of
the grid, the field, or the module.

This matters more here than it would elsewhere because DEC-17-10 makes *legible
refusal* the house style for exactly this input class
(`SLICE_17_FOUNDING.md:265-270`, "refuses with a legible message […] validation
not clamping"), and the module already demonstrates it knows how — the conn4 and
shape errors at `segment-windows.ts:177-179,189-191` are model refusals naming
the offending values. The geometry fields are the gap in an otherwise
consistently-guarded boundary. DEC-17-10's bounds check sits upstream in A3 and
validates the *span against fixture bounds*; it does not guarantee finite cell
widths.

MED under the adversarial-input clause: reachable only from malformed input, and
the consequence is an opaque crash rather than a wrong number.

### 5.6 Not gaps — recorded so they are not re-raised

- **`cellCount`** is present (`segment-windows.ts:64`) and correct: `visited` is
  set at push time (`segment-windows.ts:217,255`), so no cell is counted twice;
  conservation is asserted at `tests/v2-segment-windows.test.mjs:299`.
- **Δ and B_min are injected, not hardcoded**, per §4 A1
  (`SLICE_17_FOUNDING.md:291`): `segment-windows.ts:128,133,193`. The defaults
  are exported named constants, not inline magic numbers.
- **Delivered mass / dominance badge** are out of this module's scope by design
  (DEC-17-3 `SLICE_17_FOUNDING.md:160-163` places them at the row level, and
  OQ-17-3 leaves the metric set open until A3). Not a gap.
- **Sort order** is DEC-17-3-compliant and deterministic: ascending `minC3` with
  a total tie-break on `(depJd, tofDays)` (`segment-windows.ts:99-107`, applied
  at `277`).

---

## Findings table

| ID | SEVERITY | One-line | file:line |
|---|---|---|---|
| L3-01 | MED | `jdToIsoDate` formats a TDB Julian date as UTC, dropping the 69.184 s offset that both `main.ts` and the artifact harness apply; correct on the locked 731-column grid only by a 49.172 s margin, and no DEC pins the convention | `src/v2/porkchop/segment-windows.ts:94-96` (cf. `src/v2/app/porkchop/main.ts:152-156`, `tools/slice17-research/measurements/s17-cache-vs-live.mjs:80-88`) |
| L3-02 | MED | `params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2` silently ships the 25 km²/s² literal that DEC-17-5(a) requires be read from runtime metadata; the module's own header forbids it but nothing enforces it | `src/v2/porkchop/segment-windows.ts:131-134` (cf. `:86-91`, `SLICE_17_FOUNDING.md:203-205`) |
| L3-03 | MED | The live grid minimum is computed then discarded, so DEC-17-3/-4's mandatory subordinate "global minimum" display and the Δ echo are absent from the return shape | `src/v2/porkchop/segment-windows.ts:194`, `:75-83` (cf. `SLICE_17_FOUNDING.md:158-159,169`) |
| L3-04 | MED | The sampling interval (`depCellDays`) is absent from both `WindowComponent` and `SegmentWindowsResult`, and is unrecoverable for singleton components (13 of 19 in the fixtures), so A2's binding copy rule cannot be met from the result alone | `src/v2/porkchop/segment-windows.ts:57-66`, `:75-83` (cf. `SLICE_17_FOUNDING.md:474-480`) |
| L3-05 | MED | Grid **shape** is validated and refused legibly, but grid **geometry** finiteness is not; a NaN `depStartJd` surfaces as an opaque `RangeError` from `toISOString` instead of a legible refusal | `src/v2/porkchop/segment-windows.ts:182-192`, `:95` |
| L3-06 | LOW | API shape drift: §4 A1 specifies `segmentWindows(cells, params)`; the code is `segmentWindows(grid, params)` — the code is right, `(cells, params)` is not implementable | `SLICE_17_FOUNDING.md:290` vs `src/v2/porkchop/segment-windows.ts:171-174` |
| L3-07 | LOW | Returned structures alias: `practical` shares element references with `components`, and `bestPractical.argmin` is the same object as the component's `argmin`; nothing is frozen or `readonly`-typed | `src/v2/porkchop/segment-windows.ts:152`, `:161`, `:75-83` |
| L3-08 | LOW | The quarantine is advisory only — no hook or lint enforces it; `.githooks/pre-commit`, `.githooks/pre-push` and `AGENTS.md §2.1` contain no import guard. Currently holding on discipline | `src/v2/porkchop/segment-windows.ts:1-3`; `AGENTS.md:98-125` |

---

## VERIFIED list

Things I checked and found clean. Stated so they are not re-audited.

- **V1 — Zero imports.** The file contains no `import` statement of any kind.
  Nothing from `app/`, view code, V1 (`AGENTS.md:38`), or `src/v2/core/**`.
  `src/v2/porkchop/segment-windows.ts:1-280`.
- **V2 — No module-load side effects.** Module scope holds only interfaces
  (`:19-83`), three numeric constants (`:85,91,92`), one array literal
  (`:165-169`), and function declarations (`:94,99,113,123,145,171`). Nothing
  executes at import.
- **V3 — No ambient or global state.** The single global referenced is `Date`
  (`:95`), used via `toISOString`, which is UTC-fixed by spec — module output is
  independent of the host `TZ`. No `Math.random`, no `Date.now`, no mutable
  module-scope binding. Deterministic.
- **V4 — No mutation of caller inputs.** `grid.cells` is read-only across
  `liveGridMin` (`:113-121`), the membership pass (`:201-207`) and the DFS
  (`:228-259`); all writes go to locally-allocated `Uint8Array`s and the local
  stack. `components.sort` (`:277`) sorts the module's own array allocated at
  `:211`, never the caller's. `classifyComponents` uses `.filter` (`:152`) and
  types its input `readonly` (`:146`).
- **V5 — Quarantine header present, exact, well-formed.** `:1-3`, first three
  lines of the file; names gate G-A2, authority §4, the 0-HIGH release
  condition, and tests as sole permitted consumer — all four matching
  `SLICE_17_FOUNDING.md:297-299`.
- **V6 — Quarantine holding: zero importers outside tests/.** Printed grep in §2;
  the only executable references in the repo are the three lines of
  `tests/v2-segment-windows.test.mjs` that compile and load it.
- **V7 — Deploy surface clean.** No built artifact under `docs/` or `dist/`
  contains the module's distinctive strings; `vite.config` has no `compareV2`
  entry.
- **V8 — argmin is order-independent.** The tie-break at `:234-241` is a strict
  lexicographic minimum over `(c3, depIdx, tofIdx)`, so the DFS visit order
  cannot change the selected argmin. It matches `compareByMinC3`'s
  `(minC3, depJd, tofDays)` ordering at `:99-107` — the two tie-break rules are
  consistent, which is the kind of thing that is usually inconsistent.
- **V9 — Both span derivations use the A2 `(N-1) × cell` convention.**
  `breadthDays` at `:271` and `tofSpanDays` at `:273`. Matches
  `SLICE_17_FOUNDING.md:451-452` verbatim, and asserted at
  `tests/v2-segment-windows.test.mjs:297`.
- **V10 — DEC-17-3's ranking rule holds.** `bestPractical` scans only `practical`
  (`:154`), so a lower-C3 singleton can never be ranked; `null` is returned for
  NO-PRACTICAL-WINDOW (`:161`), never a number and never a blank
  (`SLICE_17_FOUNDING.md:153-157`).
- **V11 — Degenerate grids do not emit garbage.** Relative mode on an empty or
  all-hole grid resolves `T = Infinity` (`:129` over `liveGridMin`'s `Infinity`
  at `:114`), and the `Number.isFinite` guard at `:204` keeps membership empty —
  matching the documented contract at `:70-72`.
- **V12 — Δ and B_min are injected, not hardcoded**, per §4 A1
  (`SLICE_17_FOUNDING.md:291`): `:128`, `:133`, `:193`, with exported named
  defaults rather than inline literals. (The `absoluteKm2S2` default is the
  exception, and is L3-02.)
- **V13 — On the locked grid, all 19 artifact argmin dates agree under both time
  conventions.** 0 of 731 departure columns differ; closest approach to the
  boundary is 118.356 s (column 243), a 49.172 s margin. This is what holds
  L3-01 at MED rather than HIGH.
- **V14 — `cellCount` cannot double-count.** `visited` is set at push time
  (`:217`, `:255`), not at pop time; conservation is independently asserted at
  `tests/v2-segment-windows.test.mjs:299`.
- **V15 — Connectivity lock is enforced, not just documented.** `connectivity !== 8`
  throws a legible error naming DEC-17-1 (`:176-180`).

---

## Recommendations (advisory only — nothing was changed)

Nothing in this report was applied. Ranked by what I would fix first:

1. **L3-01** — align `jdToIsoDate` with `src/v2/app/porkchop/main.ts:152-156`
   (subtract 69.184 s), and add a DEC or a §8 amendment pinning the time
   convention for `argmin.dateIso` so the next module does not re-decide it.
   One-line code change; the doc pin is the durable part.
2. **L3-02** — make `absoluteKm2S2` required under `thresholdMode: 'absolute'`
   via a discriminated union, moving the DEC-17-5(a) obligation to compile time.
3. **L3-04 + L3-03** — echo the grid geometry and the live minimum on
   `SegmentWindowsResult`. Both values are already in hand; this is an echo, not
   a computation, and it is what makes A2-compliant copy the easy path.
4. **L3-06** — §8 AMENDMENT A3, doc-side, additive: the §4 A1 line stands, the
   amendment records that the implemented signature is `(grid, params)` and why
   `(cells, params)` is not implementable.
5. **L3-05, L3-07, L3-08** — geometry finiteness guard; `readonly` result types;
   a pre-commit import guard for quarantined modules (hook edits are protected
   under `AGENTS.md §2.1(3)` — Hudson's call, not an agent's).
