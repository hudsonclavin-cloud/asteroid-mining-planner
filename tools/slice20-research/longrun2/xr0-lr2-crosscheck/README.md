# XR0 — independent cross-check of LR2's symmetric-return measurement

LR2 (`tools/slice20-research/longrun/lr2-symmetric/`) was labelled UNVALIDATED until checked by a
different path than the one that wrote it. This is that check, for LR2's primary column.

`crosscheck.mjs` imports nothing from the first long run. It loops over the outbound and return grids
itself, calls the production solver directly, reads Earth with the production linear-scan lookup, and
refuses late arrivals by an epoch test. Its header lists what is different and what is shared on purpose.

```bash
export LONGRUN2_SCRATCH=<a directory outside the repo>
node tools/slice20-research/longrun2/xr0-lr2-crosscheck/crosscheck.mjs run      # resumable
node tools/slice20-research/longrun2/xr0-lr2-crosscheck/crosscheck.mjs report   # writes the files below
```

- Bodies: the three S20_01 R3 bodies (the gate), the first 500 in catalog order, every body in LR2's
  extremes tables.
- Gate: the three R3 min-C3 rows must reproduce to the printed digits, or the run halts.
- Comparison precision: LR2 committed its rows rounded to 6 decimals, so "agree" means equal after the
  same rounding, field by field. `report --lr2-full <dir>` adds a full-precision comparison against LR2's
  uncommitted working file when a host still has it; that part is labelled as not committed evidence.

Files: `REPORT.md` (verdict first), `xr0-summary.json`, `xr0-rows.json` (both sides, per body).
