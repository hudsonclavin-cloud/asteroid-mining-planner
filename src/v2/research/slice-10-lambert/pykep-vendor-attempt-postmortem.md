# PyKEP Vendor Attempt — Postmortem

**Date:** 2026-05-23
**Status:** Abandoned. Decision recorded; reasoning preserved here.

## What was attempted

Slice 10 DEC-1 originally specified vendoring PyKEP's Lambert solver source (lambert_problem.cpp) and compiling it to WebAssembly via Emscripten. The plan was to import a battle-tested reference implementation of Izzo 2014 rather than write our own.

## How it failed

The vendor attempt proceeded through two iterations:

1. **First compile (Dispatch 6):** revealed the actual upstream PyKEP v3.0.0 license is MPL-2.0, not GPL-2.0-or-later as Nova had assumed during the original OQ-3 close. License correction landed in commit c0dc334 (Aster v2 relicensed to MIT, vendored PyKEP documented as MPL-2.0 island).

2. **Second compile (Dispatch 7c):** before stubbing fmt headers, the dependency-scan step surfaced that PyKEP v3 also depends on `xtensor` and `xtensor-blas` — heavy header-only tensor libraries used for the Lambert algorithm's internal linear algebra. These cannot be trivially stubbed; the Lambert math uses xtensor array operations throughout.

## Why we abandoned the path

Three viable continuations were considered:

- (A) Vendor xtensor and xtensor-blas — adds several megabytes of header-only source, complicates the build, and the complexity-to-value ratio is poor for a single algorithm.
- (B) Switch to PyKEP v2.x (pre-xtensor) — but v2.x is GPL-2.0-or-later, which would reopen the licensing question we just resolved.
- (C) Switch to poliastro's Izzo implementation as a source — MIT-licensed, much smaller dependency footprint.
- (D) Clean-room TypeScript implementation from arXiv:1403.2705 with poliastro as validation reference.

Investigation of poliastro's source (`poliastro/core/iod.py`) confirmed Izzo's algorithm is implementable in ~300-500 lines of straight-line scalar and 3-vector math: norms, dot products, cross products, plus a small Householder iteration and a few special function helpers (Stumpff series, Gauss hypergeometric). No matrix decompositions, no heavy linear algebra dependencies.

Options C and D effectively collapse: we write Izzo in TypeScript drawing the math from the paper, with poliastro serving as the high-quality reference for validation test vectors rather than a source to port literally. The output is MIT-licensed throughout.

## What was preserved

This decision is the third revision of DEC-1 in Slice 10. The reopen-and-correct pattern follows the OQ-6 discipline applied to design decisions: when new information arrives that contradicts a prior close, reopen with corrected facts and preserve the prior text as record.

## Lessons

1. **Verify upstream license from source, not from documentation.** The original GPL assumption came from older PyKEP docs; v3.0.0 source headers say MPL-2.0.
2. **Verify dependency tree before committing to vendoring.** The xtensor dependency wasn't visible from PyKEP's documentation; it surfaced only when the compile failed on third-party includes.
3. **The OQ-6 four-failure-mode discipline applies to design decisions, not just measurements.** Each compile failure surfaced a new constraint; each constraint produced a new decision; each decision was recorded rather than papered over.
