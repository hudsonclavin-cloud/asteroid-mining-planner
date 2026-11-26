# N5 Windows test-count flake

This workstream ran the repository's two search roots, `tests` and `src/v2`, with one Node child per test file. Each child used `process.execPath`, `--test`, and `--test-timeout=120000`; the runner used a 180000 ms per-file watchdog and six concurrent children. The reporter summary parser records the last summary line for each of `tests`, `pass`, `fail`, `skipped`, and `todo`, and also records the first `/\bpass (\d+)\b/` match.

The five valid repetitions and two sequential `npm run verify` runs are summarized in `REPORT.md`. Full per-file JSON repetitions and the analysis JSON are in `C:\Users\hudso\s20-overnight2-store\n5` and are outside the repository bundle.
