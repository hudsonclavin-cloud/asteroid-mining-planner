# XR2 — physical-validity census of the outbound and return grids

LR1 found that 1.55% of its sampled converged return branches fly an arc that passes inside the Sun, and
that the kernel has no perihelion check. This folder counts such cells at catalog scale and asks the
question the ruling turns on: does any number the site shows sit on one.

**Flag definition (LR1's, verbatim):** the transfer orbit's perihelion is below one solar radius
(695,700 km) and the flown arc passes perihelion. `lib/common2.mjs` holds the two functions and cites the
LR1 source lines they were copied from.

- `census-shard.mjs` — outbound, every body, two grids: the cache's screening grid (783 x 55, swept with
  the production kernel because the precompute script cannot be instrumented without editing it) and the
  compare page's grid (731 x 100, through `computeCompareData`). For each body it also checks the shipped
  cache's minC3 cell, each cached best window, and every cell of compare's bestPractical window.
- `return-census.mjs` — the return grid, 400 seeded bodies, M=0 and M=1, every converged branch.
- `summarize.mjs` — the committed files and `REPORT.md`.

```bash
export LONGRUN2_SCRATCH=<a directory outside the repo>
node tools/slice20-research/longrun2/lib/build.mjs
node tools/slice20-research/longrun2/xr2-validity/census-shard.mjs --shard 0 --of 3 &   # and 1, 2
node tools/slice20-research/longrun2/xr2-validity/return-census.mjs
node tools/slice20-research/longrun2/xr2-validity/summarize.mjs
```

Perihelion deciles come from a fixed log histogram (0.01 dex bins), because the sweep is billions of
cells; the threshold shares (below 0.1 AU, 0.01 AU, one solar radius) are exact counts.
The bestPractical window's member cells are rebuilt by flood fill from its argmin (8-connectivity, cells
with C3 at or below the resolved threshold), since `segmentWindows` returns summaries only.
