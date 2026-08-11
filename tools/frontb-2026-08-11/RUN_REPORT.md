# FRONT B BATCH RUN REPORT — S-S17-FRONTB-BATCH-2026-08-11-A

Branch: `front-b/2026-08-11`, cut from `main @ 352fd06` (verified at Phase 0).
Actor: Claude Code, sole writer. Recon lenses (Phases B, C) ran as fresh
read-only sessions; their reports are transcribed unedited into this dir.
Known-dirty baseline preserved throughout (`.dispatch-scope` + two `.githooks`
mode diffs; untracked `Untitled.canvas` + `tools/` dirs). Nothing pushed.
`main` never touched.

## Commit ledger (branch, in order)

| SHA | Phase | What |
|---|---|---|
| `7593616` | A1 | Orbit contrast (color `0x8ea0b8`→`0xaebbd0`, opacity `0.12`→`0.18`; focused 0.6 unchanged) + NEA haze (opacity `0.4`→`0.3`, scale `1.5e12`→`1.25e12`, fragment mix core `0.7`→`0.8` / halo `0.3`→`0.2`) |
| `7a3622d` | A2 | Sidebar `400px`→`clamp(320px, 42vw, 400px)`; overlay `380px`→`clamp(300px, 40vw, 380px)`; footer `flexWrap: wrap` + left span `minWidth: 0` |
| `4daa199` | A3 | `isPorkchopModalOpen()` accessor exported from ui-overlay; scene `onKeyDown` early-returns while modal open (Escape untouched — modal's own listener); cost-card C3 strings carry `km²/s²` (both sites; 6-decimal hover/pin readouts untouched) |
| `525cd48` | D1 | DEC-17-3 dominance badge: dominated / nondominated / insufficient-data over the three DEC metrics, Pareto, no composite; plain-English legend line in method badge |
| `82996ee` | D2 | DEC-17-8 mode toggle (relative Δ=5 \| absolute, both labeled with values); load/compute split so toggling recomputes without refetching; busy state; method-badge mode + recompute disclosure |

Per-phase `.dispatch-scope` was rewritten before each staging; every commit
staged explicit paths only. Typecheck exit 0 after every commit and at run
end. All A-phase "before" values were verified against the live tree before
editing — every one matched the pre-approved recon.

## Phase A notes

- **A2 wrap-vs-ellipsis call (dispatch asked which):** WRAP. The "Loaded …"
  numbers are the footer's payload; the existing hint span was already built
  (inline-block + nowrap, panel.ts footer comment) to move to its own row
  whole. `minWidth: 0` on the left span lets the flex child actually shrink so
  that designed wrap engages instead of overflowing. Ellipsis would have eaten
  the data at the 320px floor.
- **A1 planet orbit curves:** correctly none exist in V2; none created
  (recon finding stands — out of scope).

## Phase B — C2 frame verdict (full report: `C2_FRAME_VERDICT.md`)

**Verdict (i) — shippable on T2-1 chips:**

> **Frame: "Heliocentric J2000 equatorial (ICRF) axes — Horizons vectors
> passed through unrotated; no ecliptic rotation applied to any rendered
> position; scene +Z = ICRF/celestial north."**

Every clause cited to file:line in the full report (fixtures declare
`"ICRF/J2000"`; ingestion's only rotation branch is gated on an `ECLIPTIC`
frame hint that never fires; all core frame transforms are translation-only;
no swizzle at `root.position.set`; `camera.up` never set). The constant
`TOP_DOWN_ECLIPTIC_NORMAL_ICRF` (now runtime.ts:335-339, not :447) is a
camera-preset direction only — correctly named, and its very existence
(rotating ecliptic north INTO ICRF) confirms the scene axes are equatorial.
One chip-honesty footnote: the Sun body itself is SSB-centered in the fixture;
orientation claims are unaffected.

## Phase C — OQ-17-8 answer (full report: `OQ_17_8_CONDITION_CODE.md`)

**CANNOT-REACH.** Source is JPL SBDB (`condition_code`), not MPCORB — E/D/F
letters are not in the pipeline. Generator's `parseNumber`
(tools/slice9-research/common.mjs:52-58) nulls any non-finite value (never
NaN, never a string pass-through; body kept). Runtime loader
(slice9-nea-catalog.ts:372,174-179,166-172) passes null through and throws
fail-loud on any other non-finite. Committed catalog: 41,906 `conditionCode`
occurrences — all bare numerals 0–9 except **10 nulls**; no letters, no quoted
strings. **Premise correction:** at this HEAD no v2 UI consumes conditionCode
at all (compare page reads only name/designation/elements); the only renderer
is v1's detail panel, which shows null as 'unknown'. Residual soft spot noted:
a numeric *string* would silently coerce — numerically correct, type-unsafe.
Report-only; no code change made or proposed.

## Phase D notes — DEC-vs-dispatch divergences (DEC wins, per dispatch rule)

1. **Badge semantics.** Dispatch paraphrase said "per-metric leader marks";
   DEC-17-3:160 specifies the badge states outright: **dominated /
   nondominated / insufficient-data**. Implemented the DEC's three-state
   Pareto badge (no composite; ties on all three dominate neither way).
2. **S3/refusal rows.** Dispatch said "no badge"; the DEC's third state
   exists precisely for rows that can't supply all three metrics. Those rows
   render the **insufficient data** chip (explicitly captioned as "not
   compared", never a losing badge). Rows with a sentinel (non-numeric)
   delivered mass — beyond-curve / invalid-input — also take
   insufficient-data rather than a fabricated ordering.
3. **OQ-17-3 is still OPEN at this HEAD** ("lock at A3", SLICE_17_FOUNDING
   :382-383). The metric set implemented is DEC-17-3's own currently-named
   three. If OQ-17-3 closes on a different set, D1 is one function to edit
   (`computeDominance`).
4. **D2 URL persistence** of the mode: not required by the DEC, not built;
   possible follow-up.
5. Expected tie note for the gate URL set: none anticipated among the three
   participating bodies (433 / 99942 / and 68348 if it computes), but ties
   mark both rows nondominated by construction — report if observed (gate g).

No tripwire (c) questions were left unanswered — the two judgment points
above were resolvable from the DEC text itself and are recorded here rather
than skipped.

## Phase E — verification

- `node tools/run-tests.mjs` (single licensed run): **74 files, 72 passed,
  245 tests passed, 2 files failed.**
  - `tests/v2-golden/launch-vehicles.golden.test.mjs` — **the §9.1 named
    environmental exception** (STATUS.md:78: `ERR_UNKNOWN_FILE_EXTENSION` on
    local Node 20; passes CI Node 24). Expected; allowed by the dispatch.
  - `tests/v2-render-asteroid-renderer.test.mjs` — **caused by this run's A1
    commit.** Line 189 asserts `getMainOrbitOpacity() === 0.12`, hard-coding
    the pre-A1 value instead of referencing `ASTEROID_ORBIT_BASE_OPACITY`;
    A1's pre-approved `0.12 → 0.18` breaks it. Ordinary behavioral pin — NOT
    an INV-037 frozen expectation (no frozen/negative-control marker). Per
    Phase E ("any other failure ⇒ STOP, report, do not chase") no fix was
    made. **Hudson's options at the end gate:** (a) authorize the one-line
    test update (0.18, or better, import the constant so the test tracks the
    source of truth) as a follow-up commit; (b) `git revert 7593616` if A1
    fails the visual gate anyway, which also restores the test.
- Final typecheck: **exit 0**.
- Concurrency tripwire: **clean** — no file/index/.dispatch-scope change
  appeared that this session did not make.

## END-GATE CHECKLIST (Hudson, once, dev server on the BRANCH)

/v2/solar-system/:
 a. orbit lines readable at default zoom, wide + focused; not neon
 b. NEA cloud reads as data plot; no haze bleed onto planets/labels
 c. narrow to ~900px and ~768px: no sidebar/footer overlap or clipping
 d. porkchop modal open: focus/time keys dead; close: keys live
 e. 50%-zoom squint: nothing newly garish
/v2/compare/?bodies=asteroid-433,asteroid-163693,asteroid-99942,asteroid-68348:
 f. cost-card strings show km²/s² (porkchop page too)
 g. dominance badge: per-metric marks match the table's own numbers;
    163693 + any refusal rows show NO badge  «as built: they show the
    DEC's "insufficient data" chip — see Phase D note 2; judge against
    DEC-17-3's three-state spec, which outranks this letter's phrasing»
 h. toggle: both modes labeled with values; switching recomputes with
    visible busy state; numbers change coherently; 163693 row honest in
    BOTH modes  «expected: relative Δ=5 → "5 windows found, none wide
    enough"; absolute 25 → threshold well above its 6.76 floor, so more
    cells join — whatever it renders, the row must name its own binding
    constraint»

Any failed letter ⇒ `git revert <sha>` on the branch, keep the rest. Then:
merge --ff-only → clean-tree check (`git status --porcelain -- src/ tests/`
empty — NOTE: currently NOT empty until the renderer-test decision above is
made, since reverting nothing leaves a red test, not a dirty tree; the tree
itself is clean) → `npm run build` → docs/ commit (scope `docs/*`) →
`ASTER_PUSH_OK=1 git hpush` → CI GREEN required → STATUS refresh pinning the
new HEAD + B0/A4b close lines.

## Deviations & surprises, verbatim

1. The dispatch's Phase D paraphrase and DEC-17-3's text disagreed twice
   (badge form; S3/S4 treatment). The dispatch's own rule — DEC text outranks
   paraphrase — decided both without a stop.
2. The renderer test pinning a raw `0.12` was the only collision the
   pre-approved B0b values had with the test suite, and it was invisible to
   typecheck. A batch run that changes shipped constants should probably
   grep the test tree for the old literals as part of recon; recorded here
   as a process note for the next batch dispatch.
3. C2 came back verdict (i) — shippable label — with the useful negative
   result that the "top-down" preset looks down the *ecliptic* pole while
   scene axes stay *equatorial*; T2-1 chip copy should not conflate the two.
4. OQ-17-8's premise ("compare page renders condition code U") is false at
   this HEAD — nothing in v2 consumes it yet. The answer arrived anyway and
   is future-proof: the pipeline nulls letters, the loader throws on
   anything else, and the committed catalog carries 10 real nulls.
