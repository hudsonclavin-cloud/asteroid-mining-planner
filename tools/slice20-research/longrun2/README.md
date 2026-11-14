# S20_LONGRUN2 — second overnight research run (Nova dispatch, 2026-11-14)

LEADS-grade research evidence. Tools-only: nothing under `src/`, `tests/`, `docs/` or any protected path
was changed. Nothing here enters a DEC, a test, a fixture or the site.

| Folder | What it measures |
|---|---|
| `xr0-lr2-crosscheck/` | An independent re-derivation of LR2's primary symmetric-return column, by a different code path. |
| `xr1-cache-repro/` | Whether the shipped screening cache reproduces from the code beside it; provenance; solver drift. |
| `xr2-validity/` | How many outbound and return cells fly an arc through the Sun, and whether any shown window does. |
| `xr3-m1-returns/` | LR2's measurement with M=1 returns admitted. |
| `lib/` | Shared build and definitions for XR1-XR3 (XR0 uses none of it). |

`REPORT.md` is the run report (status block in its first six lines); `LOG.md` is the real-time log.
Every script takes its scratch directory from `LONGRUN2_SCRATCH` (XR3 from `LONGRUN_SCRATCH`, because it
reuses the first run's pipeline) and writes large intermediates there, outside the repo.
