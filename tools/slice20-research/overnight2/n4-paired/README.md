# N4 - paired-return census

This is a leads-grade Slice 20 Overnight 2 measurement. It does not change a
DEC, source fixture, test, or production page.

## Method

The seeded order is run1's seed 20261125 and contains all 41,906 catalog
bodies. The outbound best window is computed with the compiled production
`computePorkchopGrid` kernel at 50 departure samples by 25 TOF samples over
JD 2461041.500800741 through 2466154.500800741 and TOF 182.5 through 1826.25
days, for M=0 and M=1. AMD-2 selects the minimum departure C3 branch inside
each production grid and the global minimum retains M=0 on exact ties.

For that outbound arrival `t_a`, the paired return uses 40 asteroid-departure
samples in `[t_a + 8 d, t_a + 730.5 d]` and 25 TOF samples in
`[182.5 d, 1826.25 d]`, with M=0 and M=1. The asteroid is propagated at return
departure and Earth is read at return arrival. A return cell arriving after the
last Earth fixture sample is refused under DEC-20-3; it is not clamped or
extrapolated. A converged branch with perihelion below 695,700 km while the
arc passes perihelion is refused under DEC-20-14. L1 support is flagged by the
asteroid departure epoch under DEC-20-5; L2 has no boundary.

Each unique return grid cell first applies the production candidate rule: the
converged, non-refused branch with minimum asteroid-departure `|v_inf|`, with
M=0 retained on exact ties. The paired A pick minimizes that candidate
`|v_inf_dep|`; C minimizes candidate `|v_inf_dep| + entry-control dV`, using
the model-B `max(0, |v_inf_arr| - v_inf_at_12)` bookkeeping from N3. Screen,
support, mission duration, outbound C3, return `|v_inf_dep|`, and the crude
outbound-plus-return `v_inf` sum are recorded for both picks.

## Outputs

- `summary.json`: catalog totals, refusal comparison, objective A/C results,
  and outbound-arrival-year buckets.
- `body-table.part1of9.jsonl.gz` through `body-table.part9of9.jsonl.gz`: all
  body rows; every compressed part is below 10 MB.
- `census.mjs`, `worker.mjs`, `summarize.mjs`: resumable harness and reducer.

The earlier 26.5% refusal measurement used a 723 x 100, M=0 return grid and a
different outbound window. This run uses the dispatch's 40 x 25, M=0/M=1
paired grid, so the refusal condition matches but the measured share is not
expected to be identical.

This run prices paired-return availability and two objectives. It does not
decide which objective is correct, establish a production-resolution result, or
claim that a screen-passing return is an atmospheric or recovery solution.
