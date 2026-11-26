# N3 - selection objective census

This is a leads-grade Slice 20 Overnight 2 measurement. It does not change a DEC,
source fixture, test, or production page.

## Method

The worker is a copied production-path census: the compiled Aster Kepler
propagator, the fixture Earth series with cubic Hermite interpolation, and
`lambertMultiRev` for M=0 and M=1. The grid is 50 departure samples by 25 TOF
samples, departure JD 2461041.500800741 through 2466154.500800741, and TOF
182.5 through 1826.25 days. The seeded order is seed 20261125 and contains all
41,906 catalog bodies. Fifteen workers checkpoint every 500 bodies.

For every shown grid cell, the worker first applies the production candidate
rule: the converged, non-Sun-refused branch with minimum asteroid-departure
`|v_inf|`; exact ties retain the first M=0 branch. Objectives A-D then select
among those per-cell candidates. This makes B's screen restriction comparable
to ON4's `shownScreen` population.

- A: minimum asteroid-departure `|v_inf|`.
- B: A restricted to `v_EI <= 12 km/s`.
- C: minimum `|v_inf_dep| + max(0, |v_inf_arr| - v_inf_at_12)`.
- D: minimum `|v_inf_arr|`.

The measured model-B constant is `v_inf_at_12 = 4.627403920578161 km/s`, using
`mu_E = 398600.43550702266 km^3/s^2` and `r_EI = 6503.1366 km`. The committed
NHATS report states: "NHATS's control dV (`vrel_arr_earth`) equals v-inf minus
v-inf(v_EI = 12 at 125 km)." The N3 C formula uses that same bookkeeping.

Production interpretation references are the ON4 README, the ON4 worker, and
the compiled modules named in that README. The NHATS sanity check uses only the
committed `nhats/n1-sample/n1-sample.json`; it makes no network requests.

## Outputs

- `summary.json`: aggregate objective results and the 100-body NHATS sanity check.
- `body-table.part1of8.jsonl.gz` through `body-table.part8of8.jsonl.gz`: all
  41,906 body records. Each objective record contains its grid indices, JD and
  date label, TOF, M, branch, departure and arrival `v_inf`, `v_EI`, screen,
  support, entry-control dV, and C cost. Each compressed part is below 10 MB.
- `census.mjs`, `worker.mjs`, `summarize.mjs`: rerunnable harness and reducer.

The objective is comparative pricing only. It does not establish which
objective is correct, does not validate a production-resolution grid, and does
not make the NHATS subset an oracle for the full catalog.
