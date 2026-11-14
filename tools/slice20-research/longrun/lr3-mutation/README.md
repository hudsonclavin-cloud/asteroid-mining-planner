# LR3 — mutation campaign over `src/v2/core` and `src/v2/porkchop`

LEADS-grade research evidence from the S20_LONGRUN dispatch (Nova, 2026-11-13). A surviving mutant is a
lead: a place where the tests that run that code would not notice the change. Some survivors are
equivalent mutants (the change cannot alter any output), so each one needs a human reading before it is
called a gap. No test was written here.

**Where it ran:** a cloud Linux container (Node v22.23.4), not the laptop the dispatch names. Every
mutation was applied in throwaway copies of a fresh clone of origin/main, outside the longrun worktree.
`mutate.mjs` refuses to run unless the copy root holds the marker file `.lr3-throwaway-copy`.

## Files

| File | What |
|---|---|
| `mutate.mjs` | `enumerate` (find mutants with the TypeScript compiler API), `baseline` (unmutated run of every test file, with the import graph and function coverage), `run` (apply, test, restore; resumable). |
| `plan.mjs` | Priority order: honesty and math layers first; seeded shuffle inside each tier. |
| `report.mjs` | Builds the three files below from the scratch results. |
| `lr3-mutation.json` | Every mutant and its outcome, tier and file tables, baseline test list. |
| `REPORT.md` | Counts, tables, and the highest-ranked survivors. |
| `SURVIVORS.md` | Every survivor: diff, module, the tests that ran and still passed, a suggested test. |
| `survivor-notes.json` | Hand-written readings of the top survivors (merged into the two reports). |

## Method

- **Scope.** 48 production `.ts` files. The dispatch says "every exported function"; tiers 1, 2, 3 and 5
  are exactly that. Tiers 4 and 6 add the module-private helpers in the same files, because the exported
  solver functions are thin and most of the arithmetic lives in helpers (`lambert-multi-rev.ts` has 2
  exported functions and 8 helpers). They are labelled "beyond the dispatch scope" in every table.
- **Operators.** Arithmetic swap (`+`/`-`, `*`/`/`, and the compound forms), relational swap (`<`/`<=`,
  `>`/`>=`), sign flip (drop a unary minus), constant nudge (×1.001), loop off-by-one (bound −1, bound +1,
  start +1), guard removal (an `if` with no `else` whose branch ends in `return`/`throw`/`continue`/`break`),
  argument swap (adjacent call arguments). String concatenation is not treated as arithmetic (checked
  with the type checker). Literals used as array indices or object keys are not nudged.
- **Which tests run.** Measured, not parsed: each test file was run once unmutated; the modules it
  compiled into `.tmp-tests/` give the import graph, and Node's built-in `NODE_V8_COVERAGE` gives the
  top-level functions it executed. A mutant runs against the test files that import its module **and**
  executed its function, most specific first, stopping at the first failure. A test that never calls the
  function executes the same instructions with or without the mutant; skipping it cannot change the
  verdict. REPORT.md records a check of that claim on a sample with the pruning switched off.
- **Outcomes.** `killed` (a test file exited non-zero; split into "by a test" and "by the TypeScript
  compile step inside the test"), `timeout`, `survived` (every executing test still passed),
  `not-executed-by-any-test` (tests import the module but none calls the function).
- **Time box.** 4 hours. Tiers run in order; a tier cut short is an unbiased sample of itself.

## Reproduce

```bash
export LONGRUN_SCRATCH=<a directory outside the repo>
git clone <origin> "$LONGRUN_SCRATCH/copy" && (cd "$LONGRUN_SCRATCH/copy" && npm ci) && touch "$LONGRUN_SCRATCH/copy/.lr3-throwaway-copy"
M=tools/slice20-research/longrun/lr3-mutation
node $M/mutate.mjs enumerate --copy "$LONGRUN_SCRATCH/copy" --out "$LONGRUN_SCRATCH/lr3/mutants.json"
node $M/mutate.mjs baseline  --copy "$LONGRUN_SCRATCH/copy" --cov "$LONGRUN_SCRATCH/lr3/cov" --out "$LONGRUN_SCRATCH/lr3/baseline.json"
node $M/plan.mjs "$LONGRUN_SCRATCH/lr3/mutants.json" "$LONGRUN_SCRATCH/lr3/order.json"
node $M/mutate.mjs run --copy "$LONGRUN_SCRATCH/copy" --mutants "$LONGRUN_SCRATCH/lr3/mutants.json" \
  --baseline "$LONGRUN_SCRATCH/lr3/baseline.json" --order "$LONGRUN_SCRATCH/lr3/order.json" \
  --out "$LONGRUN_SCRATCH/lr3/results-w0.ndjson"          # add --worker k --of n and one copy per worker
node $M/report.mjs
```

## Limits

- Function-level, not line-level, selection: a test that calls the function but never reaches the mutated
  line still runs (it costs time; it cannot produce a false kill or a false survivor).
- Tests that read source files as text (source-text guards) are not selected unless they also import the
  module; a mutant they would catch by text match is reported as a survivor.
- One mutation per mutant; no higher-order mutants.
- Timeouts are generous (at least 45 s, or 6× the baseline duration plus 20 s), so a `timeout` means a
  hang or a runaway loop, not a slow machine.
