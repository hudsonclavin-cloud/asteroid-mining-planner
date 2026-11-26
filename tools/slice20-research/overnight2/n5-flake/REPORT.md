# N5 report

## Result

Verdict: `NOT REPRODUCED (5 runs)`.

All five repetitions were identical:

| Repetition | Files | Passed files | Failed files | Load timeouts | Tests passed | Tests failed | Skipped | Todo |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 112 | 112 | 0 | 0 | 371 | 0 | 1 | 0 |
| 2 | 112 | 112 | 0 | 0 | 371 | 0 | 1 | 0 |
| 3 | 112 | 112 | 0 | 0 | 371 | 0 | 1 | 0 |
| 4 | 112 | 112 | 0 | 0 | 371 | 0 | 1 | 0 |
| 5 | 112 | 112 | 0 | 0 | 371 | 0 | 1 | 0 |

The two sequential `npm run verify` runs each reported 112/112 files, 371/371 tests, 0 failures, 0 load timeouts, and accounting `112 == 112 + 0 + 0 OK`.

## Repetition comparison

No file changed status or parsed counts between repetitions, so there are no differing files or summary lines to list. No first-match parser count differed from the last summary `pass` count.

## A-cache comparison

The Linux Node 24 TSV contains 111 files. Every one of those files matched the current per-file `pass`, `fail`, `skipped`, and `todo` counts. The sole added current file is:

`tests/v2-screen-cache-provenance.test.mjs` — current `pass 1`, `fail 0`, `skipped 0`, `todo 0`; absent from the A-cache TSV.

The expected one-file delta therefore explains 112 current files versus 111 in the A-cache reference. The retired Slice 9 test accounts for the one skipped test in the current totals.
