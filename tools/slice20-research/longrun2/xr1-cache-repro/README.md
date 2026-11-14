# XR1 — shipped screening cache: provenance, reproducibility, solver drift

`docs/lambert-screen-cache.json` (copied at build time from `tests/fixtures/v2/lambert-screen-cache.json`)
decides every body's screening status and colour in the catalog. This folder asks whether that file can
still be reproduced from the code that ships beside it.

1. **Provenance** — the three sha256 values in the cache's metadata against the files now; whether the
   recorded solver commit is an ancestor of HEAD; what changed since. The git-history answers were taken
   by hand in a full-history clone (`provenance-git-facts.json`); no script here reads git history.
2. **Recompute** — `tools/build/precompute-lambert-screen.mjs`, unedited and with no arguments, run in a
   throwaway clone because it writes to a hard-coded path inside the tree. `recompute.log` is its output.
3. **Diff** — shipped against recomputed, all 41,906 bodies (`diff-cache.mjs` -> `xr1-cache-diff.json`).
4. **Displayed** — what the catalog would show differently, derived from the production consumers
   (status badge, `formatC3`, co-orbital tag, near-zero flag, `getScreeningColor`).
5. **Second mechanism** — the same grid solved with `lambert-multi-rev.ts` at M=0 (the porkchop page's
   solver) for a seeded sample (`second-solver.mjs` -> `xr1-second-solver.json`).

```bash
export LONGRUN2_SCRATCH=<a directory outside the repo>
node tools/slice20-research/longrun2/lib/build.mjs
# in a THROWAWAY clone:  node tools/build/precompute-lambert-screen.mjs   (then copy its output to scratch)
node tools/slice20-research/longrun2/xr1-cache-repro/diff-cache.mjs <recomputed.json> <git-facts.json> <recompute.log>
node tools/slice20-research/longrun2/xr1-cache-repro/second-solver.mjs <recomputed.json>
node tools/slice20-research/longrun2/xr1-cache-repro/report.mjs
```

The recomputed cache is committed (gzipped) only if its bodies differ from the shipped file; otherwise
its sha256 and byte count are recorded and the shipped file stands in for it.
