SALVAGE: COMPLETE
COMMITS: 14 on s20-a-salvage, tip a05fb52
VERIFY: 363/363 (baseline 360/360)
T1 MASS: compare now renders `<delivered> kg delivered after <budget> km/s ΔV budget`, followed by launch payload at selected C3 with its interpolation bracket and the official-published curve basis.
PROTECTED PENDING: none expected

# Slice 20 Front A salvage report

Phase 0 passed: the canonical repository was clean on `main`, the remote was
the expected GitHub repository, and `origin/main` was `b902c59`. The kept
stash was left untouched. The salvage branch is `s20-a-salvage`.

The scaffold branch resolved to `b1f3f8796852c48a611148ec05c9e9fd988f6f11`,
which satisfies the required `b1f3f87` prefix. The nine scaffold commits were
cherry-picked in order, with these local SHAs:

```text
ec6cb8f -> f48e539
76bdc86 -> 2e678a9
026be58 -> 6c6d14b
575925c -> ae33608
3faae37 -> ca8f501
e2d8e55 -> 6b48f28 (salvaged with the existing compare test; missing scaffold hunk dropped)
24d3f19 -> 21946af
95d06e1 -> 0464673
73d9758 -> 0f0fd3a
```

Baseline and post-scaffold verification both passed at 109/109 files and
360/360 tests. The four Front A implementation commits were:

```text
9ebe7a3  fix(porkchop): AMBER copy per copy rules (no caps, no promise)
d451db3  fix(compare): reconcile delivered mass with payload and delta-v budget
b1a2a2a  fix(compare): report measured solver timing in method badge
15d89e0  fix(ui): keep internal asteroid slugs out of visible copy
```

CS-1 passed its focused DLA render test, and its mutation proof restored the
forbidden `NOT modelled` and `modelled yet` copy; the test failed at
`tests/v2-dla-render.test.mjs:436:12` with an assertion that the required
lowercase/no-promise regex did not match.

T1 passed the focused compare data/render tests, 26/26 combined. Its mutation
proof nulled the result payload-at-C3 field and failed at
`tests/v2-compare-data.test.mjs:355` with:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: null !== 9250
```

The T1 production trace is data-owned: `src/v2/porkchop/compare-data.ts:359-362`
selects the best C3, payload, and ΔV budget; `src/v2/porkchop/compare-data.ts:382`
returns the payload result; and `src/v2/app/compare/main.ts:756-763` renders
the delivered-mass summary. `src/v2/app/compare/main.ts:857-863` renders the
payload interpolation bracket and official-published curve basis.

T7 passed the injected-clock timing tests. `grid-compute.ts` already exposes
the dependency-injected timing hook; `src/v2/app/compare/main.ts:1092` passes
`performance.now`, `:1112-1114` records timing availability, and
`:877-880` retains the refusal copy when timing is unavailable. Its mutation
proof restored the refusal formatter and made W3b and T7 fail: W3b expected
`1.0 ms of solver time for this selection`, while T7 expected
`30.0 ms of solver time for this selection`.

T5 passed the focused DLA and compare render tests, 8/8 combined. Its mutation
proof restored the visible slug spans/labels and made W3a and DLA render fail
at their no-visible-slug assertions; the observed bad text included
`Apophisasteroid-99942` and
`Porkchop Analysis(2020 FK3)asteroid-2020 FK3`. Internal IDs remain in URLs
and keys, but not in visible copy.

The final clean verification retry passed: 109/109 files, 363/363 tests,
0 failures, and 0 load-timeouts. An earlier clean-process attempt had four
environmental per-file load-timeouts and no assertion failures; the retry was
green. `npm run build` passed with Vite 5.4.21 and updated the three V2 HTML
entrypoints plus the generated About, Compare, Porkchop, and validation-
provenance assets. The docs build commit is `a05fb52`.

No Slice 21 document, flags, low-thrust/live-data work, `src/v2/core` changes,
or fixture regeneration was included. No push or merge was performed. This
report records the implementation tip; the evidence-copy commit follows it.
