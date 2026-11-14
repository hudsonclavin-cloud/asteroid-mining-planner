# XR3 — LR2's symmetric-return measurement with M=1 returns admitted

LR2 admitted M=0 returns only and said so. This repeats its measurement with the return grid solved at
M=0 and M=1 (both branches), taking the minimum asteroid-departure |v∞| over every admissible converged
cell and branch.

**It reuses LR2's committed pipeline on purpose.** `run-shard-m1.mjs` is a copy of
`tools/slice20-research/longrun/lr2-symmetric/run-shard.mjs` with the return leg extended; its header
lists every change. XR3 measures the effect of M=1, not the pipeline (XR0 is the check on the pipeline).
The body order is LR2's seeded shuffle (2026111302), so a partial run is comparable with LR2's.

```bash
export LONGRUN_SCRATCH=<a directory outside the repo>          # LR2's lib reads this name
node tools/slice20-research/longrun/lib/build.mjs
node tools/slice20-research/longrun2/xr3-m1-returns/run-shard-m1.mjs --shard 0 --of 4 &   # and 1, 2, 3
node tools/slice20-research/longrun2/xr3-m1-returns/summarize.mjs
```

`summarize.mjs` compares M=0-only with M=0+M=1 over exactly the same bodies, keeps LR2's primary /
secondary window split and its complete-window split, and checks the M=0 values against LR2's committed
rows for the same bodies. Selection inside a cell and across M follows DEC-20-2 (minimum asteroid-departure
|v∞|; exact ties stay with M=0).
