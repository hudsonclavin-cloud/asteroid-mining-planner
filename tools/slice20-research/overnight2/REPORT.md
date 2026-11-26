OVERNIGHT2: COMPLETE | host Windows 10.0.26200 x64 | node v26.7.0 | python 3.12.10 oracle / 3.14.2 host | poliastro 0.17.0 | base 3323f79 | origin/main b25a37b
N5 FLAKE: NOT REPRODUCED | totals per repetition 112/112 files, 371/371 tests, 0 failures, 0 load timeouts; repeated 5 times; post-N5 verify repeated twice with the same totals
N1 LR1: LR1 DIFFERS because the original Node 22/V8 run and the Node 26/V8 replay serialize a small number of floating-point Lambert results differently (runtime; LR1 harness line build-cells.mjs:156-169); LR1's headline stands; run 1's ON2 stands.
N2 ON4: REPRODUCED | best fails screen run1/N2 0.969/0.969 | zero passing run1/N2 0.0785/0.0785 | bodies disagreeing 1 of 2,000
N3 OBJECTIVE: B exists 0.9258340094497208 | cost of B over A median/p90 5.755591214742551/13.561295155948056 km/s | C passes screen 0.13525832239589547 | A=C 0.09633695263095096
N4 PAIRED: bodies 41906 of 41906 | zero shown 0.09096549420130769 | zero shown+screen 0.2163174724383143 | DEC-20-3 refused cells 0.3141992840949767 | median total duration 1704.0536858976507 d

# Scope and method

This was the laptop execution of the Slice 20 Overnight 2 research dispatch.
All results are LEADS-grade. No source, test, fixture, founding document,
STATUS file, or site artifact was changed. The copied run1 production build
and Python oracle environment were used from STORE2. No network access was
used by N1-N4 after Phase 0, and no push, merge, PR, stash operation, or agent
session was started.

The copied build positive control reproduced Aster vectors bit-identically for
one M=0 and two M=1 LR1 records, while the izzo comparisons were all below
1e-12 km/s. `npm ci` succeeded. The dependency-backed suite passed 112/112
files and 371/371 tests at Phase 0, and both required sequential post-N5
verification runs passed with the same totals. Benign jsdom fetch warnings
were observed for optional generated assets and unavailable overlay stubs.

## N5 - Windows test-count flake

The five parallel repetitions used the `tests` and `src/v2` search roots, the
repository test flags and timeouts, at most six files at once, and summary-line
parsing. Every repetition was 112/112 files, 371/371 tests, 0 failures, 0
load timeouts. No file varied between repetitions, and the runner's first-match
pass parser did not disagree with the per-file summary count. The comparison
with the committed Linux cache had one expected added file:
`tests/v2-screen-cache-provenance.test.mjs`. Verdict: `NOT REPRODUCED (5 runs)`.

What this does not show: it does not prove that a future Windows run cannot
flake; it records five clean repetitions and two clean sequential verifies.

## N1 - LR1 difference

All 14,124 LR1 input records matched run1's replay inputs exactly: r1, r2,
TOF, and mu had zero maximum difference. Aster was bit-identical for 13,970
records; the 154 differing records were at floating-point serialization scale,
with maximum difference `5.684341886080802e-14` km/s. The current replay's izzo
headline maximum was `1.5170087408478139e-12` km/s versus LR1's recorded
`1.6141992207844764e-12` km/s. An old-head source control produced the same 154
differences, so the decisive mechanism is runtime/harness serialization rather
than a source change between the commits. N1 is committed in `d2ac46d`.

What this does not show: it does not prove that every runtime serialization
path is identical, or replace the committed LR1 data; it explains the replay
difference and leaves both run1's ON2 and LR1 headline standing.

## N2 - independent ON4 census

The independent Python/poliastro path sampled the first 2,000 bodies of the
run1 seeded order on the same 50x25 coarse grid. Production propagation and
Hermite validation over 20 cases had maximum position difference
`0.000002636716156766587` km and maximum velocity difference
`5.903121699947708e-13` km/s. Best-selected screen failure was 1938/2000 for
both paths; zero shown cells passing the screen was 157/2000 for both. One
body-level selected-cell disagreement remained (`2021 WZ5`), but its selected
screen verdict and zero-passing verdict agreed. Verdict: `ON4 REPRODUCED`.
N2 is committed in `6241011`.

What this does not show: it does not validate the full 41,906-body census,
production-resolution behavior, or settle the product selection objective.

## N3 - selection objective

The copied production-path census covered 41,906 bodies and 52,382,500 cells
in the run1 seeded order. A per-cell production candidate was selected first
by minimum asteroid-departure `|v_inf|`, with M=0 on exact ties; objectives A-D
were then evaluated over those shown-cell candidates. Objective B existed for
`38798/41906 = 0.9258340094497208` of bodies. On that subset B minus A
departure `|v_inf|` had median `5.755591214742551`, p90
`13.561295155948056`, and maximum `42.59504832998952` km/s. Objective C's
pick passed the screen for `0.13525832239589547` of selected bodies. A and C
matched for `0.09633695263095096` of bodies. The selected departures for all
four objectives spanned the entire 5,113-day coarse launch range.

The committed NHATS N1 sample supplied a sanity subset of 100 bodies. NHATS
min-dV return legs needed model-B control for 0.39 of the sample; their median
natural return `|v_inf|` was `4.493491742974737` km/s. Aster objective A failed
the screen for 0.83 and had median arrival `|v_inf|`
`6.617298438416716` km/s; objective C failed for 0.49 and had median
`4.600246221909481` km/s. These are different populations and objectives, so
there is no verdict. N3 is committed in `8341c7e`.

What this does not show: no objective is established as correct; the grid is
coarse, and the NHATS side-by-side is not a full-catalog oracle.

## N4 - paired-return census

The outbound window used the compiled production `computePorkchopGrid` kernel
on a 50x25 grid, both M families, and AMD-2 minimum-C3 selection. Each selected
outbound arrival was paired with 40 return-departure samples over +8 to
+730.5 days and 25 return TOF samples over 182.5 to 1826.25 days, both M=0 and
M=1. The 41,905 valid outbound bodies produced 41,905,000 unique return cells.

DEC-20-3 refused 13,166,521 cells (`0.3141992840949767`). DEC-20-14 refused
1,012,740 branches; 100,224 unique cells had no converged non-refused branch.
Zero shown paired cells were 3812/41906 (`0.09096549420130769`); zero shown
and screen-passing was 9065/41906 (`0.2163174724383143`). Objective A had
38,094 selected returns and median total mission duration
`1704.0536858976507` days. Objective C had the same selected-body count and
median total duration `1672.6153846153368` days. The earlier 26.5% refusal
condition matches, but its 723x100 M=0 grid and different outbound window make
its share non-comparable to this 40x25 M=0/M=1 measurement. N4 is committed in
`0fd9ca8`.

What this does not show: it does not choose between A and C, validate a
production-resolution grid, or imply that a screen-passing return is an
atmospheric-entry, capture, heating, landing, or recovery solution.

## Held items

- The N1 LR1 difference is explained as runtime/harness serialization; no DEC,
  fixture, test, or source value was changed.
- N4 is a coarse grid measurement. Its refusal share is deliberately not
  substituted for the earlier 26.5% measurement.
- The single `2015 D1` propagation refusal is preserved in both N3 and N4
  body tables rather than silently dropped.

## Not done

No workstream was skipped. No deployment or build artifact was produced by this
dispatch. Hudson remains the sole authority for review, merge, push, and any
future DEC or product decision.

## Anything surprising

- The Windows five-run test-count flake did not reproduce; all five runs were
  green at 371 tests.
- N3's B-exists share is exactly the complement of run1's zero-shown+screen
  share when the production per-cell candidate rule is used.
- N4's 31.41992840949767% refusal share is higher than 26.5% because the grid
  resolution, M families, and outbound selection differ.
