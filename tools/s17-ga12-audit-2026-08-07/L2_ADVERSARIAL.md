# L2 — ADVERSARIAL LENS + G-A1 TABLE

Marker: S-S17-GA12-AUDIT-2026-08-07-A
Lens: L2 — adversarial + G-A1 evidence table
Session: fresh; auditor did not write the module or the tests
Repo HEAD at audit: `94e1dac`
Under audit:
- `src/v2/porkchop/segment-windows.ts` (280 lines, committed `e8182e4`, working tree clean)
- `tests/v2-segment-windows.test.mjs` (446 lines, committed `e8182e4`, working tree clean)
- `tools/slice17-research/data/s17-structure-7day.json` (added `806745c`, never modified since, working tree clean)
- `SLICE_17_FOUNDING.md` §3 (DEC-17-1/-2/-3/-8), §8 AMENDMENT A2

Method constraint honored: READ-ONLY. No TypeScript executed, no tests run, no build.
The only execution was `node -e` read-only parsing/printing of the committed JSON
artifact plus pure arithmetic, per the explicit dispatch exception. All commands and
raw output are reproduced verbatim in the Evidence appendix.

---

## Verdict summary

**0 HIGH / 7 MED / 5 LOW**

**G-A1 VERDICT: ALL MATCH.** 160 field-level comparisons between the test file's
pasted expectations and the committed artifact `s17-structure-7day.json`. **Zero
mismatches.** The INV-033 failure mode (fabricated or mis-copied fixture constants)
is **DISPROVEN** for this test file, and disproven by the strongest available means:
all 19 component records were regenerated from the artifact into the test file's exact
literal syntax and compared with `diff`, which reported the two blocks **byte-for-byte
identical** (Evidence E4). No transcription by this auditor is load-bearing anywhere in
the table.

Three further anti-fabrication facts, established independently:

1. **The tests draw from `conn8`, and `conn8` is materially different from `conn4`.**
   `stored.conn8` at `tests/v2-segment-windows.test.mjs:424`. For 433 @Δ=5 conn4 has 3
   components (extra singleton, and the lead component is 23 cells / 13 breadth-cells
   instead of 24 / 14); for 99942 @Δ=2 conn4 has 16 components and 7 practical instead
   of 12 and 4. If the fixtures had been taken from the wrong array, every one of those
   numbers would be wrong. They are not. This is **consistent with the conn8 lock**,
   which lives in **DEC-17-1** (`SLICE_17_FOUNDING.md:103-108`), not DEC-17-2 as the
   dispatch stated — a dispatch-side citation slip, recorded here for the record, not a
   repo defect.
2. **The stored thresholds are float-exactly `liveMin + Δ`** for all three cases
   (`===`, not approximate), so `resolveThreshold` and the artifact agree bit-for-bit
   and the tests' double assertion at `tests:355-356` is not vacuous.
3. **The test's runtime cross-check (`tests:401-434`) is real and load-bearing.** It
   re-reads the committed JSON and `deepEqual`s the entire mapped `conn8` array against
   the pasted block. Regeneration of the artifact cannot silently strand the constants.
   This is exactly the guard INV-033 lacked.

The 7 MED findings are **not** fixture-integrity failures. They are (a) input-validation
gaps in the module that turn out-of-contract-but-type-legal inputs into silent wrong
refusals or opaque crashes, and (b) coverage gaps in the test suite — most importantly
a property test whose entire invariant set is blind to connectivity regressions.

---

## G-A1 FIXTURE-EXPECTATION TABLE

Legend: `MATCH` = test constant equals the artifact value under `===` (or, for the
component records, byte-identical decimal expansion). `n/a — synthetic` = the test
constant has no stored counterpart in the artifact. Every row is marked.

### A. Grid geometry and epoch anchor

| body | quantity | test asserts | artifact says | MATCH? |
|---|---|---|---|---|
| — | `grid.departureCellDays` | `7.004109589041096` (`tests:60` `DEP_CELL_DAYS`; cross-checked `tests:409`) | `j.grid.departureCellDays = 7.004109589041096` | **MATCH** |
| — | `grid.tofCellDays` | `16.603535353535353` (`tests:61`; cross-checked `tests:410`) | `j.grid.tofCellDays = 16.603535353535353` | **MATCH** |
| — | departure epoch anchor (JD TDB) | `2461041.500800741` (`tests:62` `DEP_START_JD`; cross-checked `tests:411`) | `j.span.requested.start.jdTdb = 2461041.500800741` | **MATCH** |
| — | epoch anchor as ISO date | `'2026-01-01'` (`tests:213`, via module `jdToIsoDate`) | `j.span.requested.start.isoUtc = "2026-01-01T00:00:00.000Z"`; `jdToIsoDate(2461041.500800741)` → `2026-01-01T00:01:09.184Z` → `'2026-01-01'` | **MATCH** |
| — | `grid.nDep` | **NOT ASSERTED** — the constant `731` appears nowhere in the test file | `j.grid.nDep = 731` | n/a — no test constant (coverage gap, L2-12) |
| — | `grid.nTof` | **NOT ASSERTED** — the constant `100` appears nowhere in the test file | `j.grid.nTof = 100` | n/a — no test constant (coverage gap, L2-12) |
| — | `TOF_MIN_DAYS` | `182.5` (`tests:63`) | **n/a — INFERRED, not stored.** Derivation is stated at `tests:57-59` ("inferred from minimum observed argmin tofDays"). Independent corroboration: min `argmin.tofDays` over the **entire** artifact (5 bodies × 4 modes × conn4+conn8) = `182.5` exactly; 0 of the argmin TOFs are off the lattice `182.5 + k·tofCellDays` (max fractional residual 3.55e-15, max k = 30 ≤ nTof−1 = 99); and `182.5 + 99 × 16.603535353535353 = 1826.25` exactly (= 5.0 yr). | n/a — inferred; **derivation stated in test; corroboration MATCHES** |
| — | grid self-consistency | (not asserted) | `(2466154.500800741 − 2461041.500800741) / (731 − 1) = 7.004109589041096` `=== departureCellDays` → confirms the (N−1) convention of AMENDMENT A2 in the artifact's own geometry | **MATCH** (self-consistent) |
| — | span END (`2040-01-01` / `2466154.500800741`) | **NOT ASSERTED** | `j.span.requested.end.jdTdb = 2466154.500800741`, `isoUtc = 2040-01-01T00:00:00.000Z` | n/a — no test constant (coverage gap, L2-12) |

### B. 433 — `bodies[2].structure.liveMinPlus5.conn8`

| body | quantity | test asserts | artifact says | MATCH? |
|---|---|---|---|---|
| 433 | `body.id` | `'433'` (string) (`tests:413,418`) | `"433"` (string) | **MATCH** |
| 433 | `body.spkId` | `20000433` (number) (`tests:413,419`) | `20000433` (number) | **MATCH** |
| 433 | liveMin (`body.live.minC3`) | `1.6396903345121228` (`tests:311`, checked `tests:422`) | `1.6396903345121228` | **MATCH** |
| 433 | stored `thresholdKm2S2` | `6.639690334512123` (`tests:312`, checked `tests:355,423`) | `6.639690334512123` | **MATCH** |
| 433 | `liveMin + 5 === stored threshold` (float-exact) | asserted `tests:356` | `true` (`1.6396903345121228 + 5 = 6.639690334512123`) | **MATCH** |
| 433 | component count | `2` (fixture length; pinned by `deepEqual` `tests:432` and `all.length === 19` `tests:389`) | `conn8.length = 2` (conn4 would be 3) | **MATCH** |
| 433 | conn8[0] 7-tuple | `minC3 1.6396903345121228 · dateIso '2032-06-11' · tofDays 265.5176767676768 · breadthDays 91.05342465778813 · breadthCells 14 · cellCount 24 · tofSpanDays 83.01767676767673` (`tests:314`) | identical 7-tuple (`argmin.date` → `dateIso`; `breadthCells` derived) — byte-identical, Evidence E4 | **MATCH** |
| 433 | conn8[1] 7-tuple | `minC3 2.3672122595483507 · dateIso '2039-05-28' · tofDays 298.72474747474746 · breadthDays 84.04931506840512 · breadthCells 13 · cellCount 23 · tofSpanDays 66.4141414141414` (`tests:315`) | identical 7-tuple — byte-identical, Evidence E4 | **MATCH** |
| 433 | practical count @ B_min=2 | `2` (`tests:358`) | 2 of 2 (breadthCells 14, 13 — both ≥ 2) | **MATCH** |
| 433 | `bestPractical.c3` | `1.6396903345121228` (`tests:359`) | `1.6396903345121228` (min over practical) | **MATCH** |
| 433 | `bestPractical.argmin.dateIso` | `'2032-06-11'` (`tests:360`) | `'2032-06-11'` | **MATCH** |
| 433 | (corroboration) argmin = global live argmin | (not asserted) | `body.live.minC3Date = 2032-06-11`, `minC3TofDays = 265.5176767676768` — matches conn8[0].argmin exactly | **MATCH** (self-consistent) |

### C. 163693 — `bodies[4].structure.liveMinPlus5.conn8`

| body | quantity | test asserts | artifact says | MATCH? |
|---|---|---|---|---|
| 163693 | `body.id` | `'163693'` (`tests:414,418`) | `"163693"` | **MATCH** |
| 163693 | `body.spkId` | `20163693` (`tests:414,419`) | `20163693` | **MATCH** |
| 163693 | liveMin | `6.7561195189011825` (`tests:321`, checked `tests:422`) | `6.7561195189011825` | **MATCH** |
| 163693 | stored `thresholdKm2S2` | `11.756119518901183` (`tests:322`, checked `tests:366,423`) | `11.756119518901183` | **MATCH** |
| 163693 | `liveMin + 5 === stored threshold` (float-exact) | implied by `tests:365-366` | `true` | **MATCH** |
| 163693 | component count | `5` (fixture length; pinned `tests:432`, `tests:389`) | `conn8.length = 5` (conn4 also 5 — identical here) | **MATCH** |
| 163693 | conn8[0] 7-tuple | `6.7561195189011825 · '2034-05-19' · 182.5 · 0 · 1 · 1 · 0` (`tests:324`) | identical — byte-identical, Evidence E4 | **MATCH** |
| 163693 | conn8[1] 7-tuple | `7.003143991119908 · '2027-05-13' · 182.5 · 0 · 1 · 1 · 0` (`tests:325`) | identical — Evidence E4 | **MATCH** |
| 163693 | conn8[2] 7-tuple | `9.323484296870058 · '2034-05-05' · 199.10353535353536 · 0 · 1 · 1 · 0` (`tests:326`) | identical — Evidence E4 | **MATCH** |
| 163693 | conn8[3] 7-tuple | `9.450073703487464 · '2027-04-29' · 199.10353535353536 · 0 · 1 · 1 · 0` (`tests:327`) | identical — Evidence E4 | **MATCH** |
| 163693 | conn8[4] 7-tuple | `11.619994558375424 · '2036-04-19' · 182.5 · 0 · 1 · 1 · 0` (`tests:328`) | identical — Evidence E4 | **MATCH** |
| 163693 | practical count @ B_min=2 | `0` (`tests:368`) | 0 of 5 (all `cellCount = 1`, all `breadthCells = 1`) | **MATCH** |
| 163693 | `bestPractical` | `null` — NO-PRACTICAL-WINDOW (`tests:369`) | `null` (no component with breadthCells ≥ 2) | **MATCH** |
| 163693 | (corroboration) `componentCellCounts.conn8` | (not asserted) | `[1,1,1,1,1]` — the artifact's own independent tally confirms five singletons | **MATCH** (self-consistent) |

### D. 99942 — `bodies[0].structure.liveMinPlus2.conn8`

| body | quantity | test asserts | artifact says | MATCH? |
|---|---|---|---|---|
| 99942 | `body.id` | `'99942'` (`tests:415,418`) | `"99942"` | **MATCH** |
| 99942 | `body.spkId` | `20099942` (`tests:415,419`) | `20099942` | **MATCH** |
| 99942 | liveMin | `0.00005501593238631661` (`tests:334`, checked `tests:422`) | `0.00005501593238631661` (`=== 5.501593238631661e-5`, verified) | **MATCH** |
| 99942 | stored `thresholdKm2S2` | `2.000055015932386` (`tests:335`, checked `tests:375,423`) | `2.000055015932386` | **MATCH** |
| 99942 | `liveMin + 2 === stored threshold` (float-exact) | implied by `tests:374-375` | `true` | **MATCH** |
| 99942 | component count | `12` (fixture length; pinned `tests:432`, `tests:389`) | `conn8.length = 12` (conn4 would be 16) | **MATCH** |
| 99942 | conn8[0] | `0.00005501593238631661 · '2028-08-24' · 232.31060606060606 · 168.0986301372759 · 25 · 42 · 166.03535353535352` (`tests:337`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[1] | `0.09938818519513135 · '2036-05-24' · 315.3282828282828 · 161.0945205478929 · 24 · 38 · 149.4318181818182` (`tests:338`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[2] | `0.6700687457041004 · '2035-06-09' · 331.9318181818182 · 84.04931506840512 · 13 · 24 · 99.62121212121212` (`tests:339`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[3] | `0.8802187693069754 · '2035-04-27' · 381.74242424242425 · 0 · 1 · 1 · 0` (`tests:340`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[4] | `1.0609756270535315 · '2027-06-03' · 348.5353535353535 · 49.028767123352736 · 8 · 15 · 66.41414141414145` (`tests:341`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[5] | `1.1529863739374495 · '2027-05-06' · 381.74242424242425 · 0 · 1 · 1 · 0` (`tests:342`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[6] | `1.270250046776918 · '2027-04-22' · 398.3459595959596 · 0 · 1 · 1 · 0` (`tests:343`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[7] | `1.457605227533293 · '2036-04-19' · 348.5353535353535 · 0 · 1 · 1 · 0` (`tests:344`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[8] | `1.6050369796531911 · '2029-05-31' · 282.1212121212121 · 0 · 1 · 1 · 0` (`tests:345`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[9] | `1.647029680075459 · '2029-05-10' · 298.72474747474746 · 0 · 1 · 1 · 0` (`tests:346`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[10] | `1.6921359064521835 · '2029-06-21' · 265.5176767676768 · 0 · 1 · 1 · 0` (`tests:347`) | identical — Evidence E4 | **MATCH** |
| 99942 | conn8[11] | `1.945475873216996 · '2029-07-12' · 248.9141414141414 · 0 · 1 · 1 · 0` (`tests:348`) | identical — Evidence E4 | **MATCH** |
| 99942 | **B_min classification: practical count** | **`4` of `12`** (`tests:377`) | **4 of 12** — components with breadthCells ≥ 2 are indices 0 (bc 25), 1 (bc 24), 2 (bc 13), 4 (bc 8); the other 8 are singletons | **MATCH** |
| 99942 | practical `minC3` list, in order | `[0.00005501593238631661, 0.09938818519513135, 0.6700687457041004, 1.0609756270535315]` (`tests:378-381`) | `[0.00005501593238631661, 0.09938818519513135, 0.6700687457041004, 1.0609756270535315]` | **MATCH** |
| 99942 | `bestPractical.c3` | `0.00005501593238631661` (`tests:382`) | `0.00005501593238631661` | **MATCH** |
| 99942 | `bestPractical.argmin.dateIso` | `'2028-08-24'` (`tests:383`) | `'2028-08-24'` | **MATCH** |
| 99942 | (corroboration) `componentCellCounts.conn8` | (not asserted) | `[1,1,1,1,1,1,1,1,15,24,38,42]` — sorted tally, multiset-identical to the 12 fixture `cellCount` values | **MATCH** (self-consistent) |
| 99942 | (corroboration) argmin = global live argmin | (not asserted) | `body.live.minC3Date = 2028-08-24`, `minC3TofDays = 232.31060606060606` | **MATCH** (self-consistent) |

### E. Derived / synthetic constants and cross-cutting rules

| body | quantity | test asserts | artifact says | MATCH? |
|---|---|---|---|---|
| all 3 | `breadthCells` | present in every fixture record | **n/a — synthetic (derived).** `breadthCells` is NOT a stored field. The derivation rule `round(breadthDays / depCellDays) + 1` is stated explicitly at `tests:6-8` and re-applied at `tests:428`. | n/a — synthetic; **derivation stated in test** |
| all 3 | derivation-rule closure: `breadthCells === round(breadthDays/depCell)+1` | `tests:394` over all 19 | holds for 19/19 | **MATCH** |
| all 3 | `\|(breadthCells−1)·depCell − breadthDays\| < 1e-6` | `tests:395` over all 19 | holds; **max residual 2.8961721909581684e-10** | **MATCH** |
| all 3 | `tofSpanDays` is an exact multiple of `tofCellDays` (< 1e-6) | `tests:396-397` over all 19 | holds; **max residual 4.263256414560601e-14** | **MATCH** |
| all 3 | total fixture record count | `19` (`tests:389`) | 2 + 5 + 12 = **19** | **MATCH** |
| all 3 | source connectivity array | `stored.conn8` (`tests:424`) | `conn8` exists alongside `conn4` and `componentCellCounts`; conn4 **differs** for 433 (3 comps) and 99942 (16 comps) | **MATCH** — conn8, correct per **DEC-17-1** conn8 lock |
| all 3 | sort order (ascending minC3) | `tests:436-446` | all three stored `conn8` arrays are already ascending by `minC3` | **MATCH** |
| all 3 | practical counts / bestPractical | `2 / 0 / 4`; best `1.6396903345121228`, `null`, `0.00005501593238631661` | **n/a — not stored.** These are the *module's* classification applied to stored summaries. Independently re-derived by this auditor from the artifact (Evidence E5): `2 / 0 / 4`, best `1.6396903345121228 @ 2032-06-11`, `null`, `0.00005501593238631661 @ 2028-08-24` | **MATCH** (independent re-derivation) |

**One circularity noted and closed.** The runtime cross-check at `tests:428` derives
`breadthCells` with the *same* formula the fixture block used, so that assertion alone
could not detect an error in the *rule* (only in transcription). The rule itself is
independently validated against the artifact's stored `breadthDays` at `tests:394-395`,
and against AMENDMENT A2's (N−1) convention by the property test at `tests:297`. The
circularity is therefore closed. Worth stating because it is the one place a naive
reading would over-credit the cross-check.

---

## 2b — Test-suite adequacy

### DEC semantics that ARE pinned

| DEC clause | Pinned by | Adequate? |
|---|---|---|
| DEC-17-1 — membership requires `converged` | `tests:110-117` (hole splits a strip), `tests:180-192` (non-converged low-c3 cell excluded from liveMin *and* from membership) | Yes — and the hole's `c3 = 0.25` is deliberately below every threshold used, so `converged` is genuinely load-bearing |
| DEC-17-1 — **ties at T inclusive** (`c3 ≤ T`) | `tests:119-130` — cell at exactly `6.0` joins; cell at `6.0 + 1e-9` does not | Yes — both sides of the boundary, exact-equality case included |
| DEC-17-1 — **hole splits a component** | `tests:110-117` (5×1, `[m m][HOLE][m m]` → 2 components of 2) | Yes for the 1-D case |
| DEC-17-1 — **null-c3 is a hole even when converged** | `tests:173-178` | Yes |
| DEC-17-1 — non-finite c3 is a hole | `tests:191` (`liveGridMin([{Infinity,true}]) === Infinity`), `tests:194-202` (all-Infinity relative grid → no garbage component) | Yes for `Infinity`. **`NaN` c3 with `converged: true` is never tested** — it shares the `Number.isFinite` path (`segment-windows.ts:116,204`) so the risk is low, but it is not pinned |
| DEC-17-1 — **conn8 diagonal join** | `tests:163-171` — 2×2, members at (0,0) and (1,1) only, asserts 1 component of 2 cells | **Weakly.** One 2-cell case is the entire conn8 evidence in the suite (see L2-02) |
| DEC-17-1 — conn4 not implemented | `tests:255-262` (throws) | Yes |
| DEC-17-1 — per-component outputs (minC3, argmin date+TOF, breadth cells, cell count, TOF span) | `tests:204-225` (1×1 anchor + 4×3 with unique interior minimum) | Yes for the unique-minimum case |
| DEC-17-1 — no separate minimum-component-size rule | `tests:132-148`, `tests:150-161` — singletons DO appear in `components`, only excluded from `practical` | Yes (implicitly but soundly) |
| DEC-17-3 — **ranking never falls back to the global minimum** | `tests:146-147` (singleton at c3 2.0 is the global min; `bestPractical.c3` is 3.0), `tests:369` (163693) | Yes — this is the sharpest test in the suite |
| DEC-17-3 — **unsorted-input classification invariance** | `tests:227-235` (`classifyComponents` on reversed-priority input finds the true minimum) | Yes |
| DEC-17-3 — NO-PRACTICAL-WINDOW is `null`, not a number or blank | `tests:159-160`, `tests:368-369` | Yes at the module boundary |
| DEC-17-8 — **relative T = liveMin + Δ, default Δ = 5** | `tests:240-242` (`3.25 + 5`), `tests:243-244` (Δ=2), `tests:187-188` (Δ=1) | Yes, including Δ injection |
| DEC-17-8 — **absolute mode default 25, injectable** | `tests:245-247` (default), property test `tests:283` uses `absoluteKm2S2: 12` and validates membership against 12 | Yes — the injection path is genuinely exercised with a non-default value |
| DEC-17-8 — **threshold-mode resolution (relative vs absolute)** | `tests:237-253`, incl. direct `resolveThreshold` deepEqual | Yes |
| DEC-17-8 — B_min = 2 default excludes singletons from `practical` | `tests:132-148`, `tests:150-161` (defaults used, singleton excluded) | Default yes; **injection no** (L2-03) |
| AMENDMENT A2 — breadthDays = **(N−1)** × cell | `tests:297` (property test, all trials), `tests:394-395` (against the artifact's independently measured breadthDays) | Yes — this is well pinned from two directions |
| §4-A1 — nothing consumes the module before G-A2 | Verified by this auditor: `grep -rn "segmentWindows\|segment-windows" src tests app` returns only the module and its own test | Yes |

### DEC clauses with NO test pinning them — explicit list

1. **DEC-17-1, argmin determinism within a component.** DEC-17-1 requires a per-component
   argmin. `segment-windows.ts:234-241` implements a lexicographic tie-break
   (lowest c3 → lowest depIdx → lowest tofIdx). **No test contains a component with two
   or more cells sharing the minimum c3.** Every argmin test (`tests:204-225`) uses a
   unique minimum. Because the DFS is LIFO (`:229` `stack.pop()`), traversal order is
   not the grid order, so a broken tie-break would produce *traversal-order-dependent*
   argmin dates — a nondeterministic user-facing departure date. I reasoned the current
   implementation through by hand and believe it is correct (it updates only on strict
   lexicographic improvement, and any cell examined before `minC3` reached its final
   value necessarily had a strictly greater c3, so it is not in the tie set) — but
   *reasoned correct* is not *pinned*. → **L2-09**
2. **DEC-17-1, cross-component sort tie-break.** `compareByMinC3` (`:99-107`) breaks
   minC3 ties on `argmin.depJd`, then `tofDays`. `tests:436-446` sorts the 99942 fixture,
   whose 12 `minC3` values are all distinct, so **only the first branch is ever
   executed**. `tests:110-117` produces two components with equal `minC3 = 2.0` but
   asserts only `cellCount` (`[2,2]`), which is tie-insensitive. → **L2-09**
3. **DEC-17-8, B_min injection.** The identifier `bMinCells` **does not appear once** in
   the 446-line test file. `segment-windows.ts:193` reads `params.bMinCells ?? 2`; if
   that line were replaced by the hardcoded constant, **all 15 tests still pass**.
   §4-A1 explicitly requires "Δ and B_min injected not hardcoded". Δ is pinned;
   `absoluteKm2S2` is pinned; **B_min is not.** → **L2-03**
4. **DEC-17-2, locked resolution.** `nDep = 731` and `nTof = 100` appear nowhere in the
   test file, and the cross-check (`tests:409-411`) checks the two cell widths and the
   span **start** but never `grid.nDep`, `grid.nTof`, or the span **end**
   (`2466154.500800741` / `2040-01-01`). Arguably A3's gate, but the G-A1 coverage list
   names them. → **L2-12**
5. **DEC-17-3, "a row in this state sorts last."** Not implemented in A1 and not tested.
   The module returns `bestPractical: null`; nothing encodes row ordering. Correctly
   out of A1 scope — named here so it is not assumed covered at G-A3.
6. **DEC-17-3, dominance badge / metric set.** Entirely absent from A1. Out of scope,
   named for completeness.
7. **DEC-17-10, bounds validation.** Not in A1 (A3 phase). Named for completeness.
8. **AMENDMENT A2, binding copy rule.** No user-facing copy exists in A1. But note that
   the module hands `breadthDays` out as a bare number with no adjacent `breadthCells`
   obligation encoded in the type — a consumer can trivially display a bare day span.
   A `WindowComponent` that carried the sampling interval alongside would make the copy
   rule structurally enforceable rather than merely documented. Advisory.
9. **NaN c3 with `converged: true`.** Not tested (see table above).

### Property test (`tests:266-305`) — invariant set assessment

Invariants present: (1) `comp.minC3 >= globalMin − 1e-9`; (2) components non-decreasing
in `minC3`; (3) cell conservation `Σ cellCount === |member cells|`; (4)
`breadthDays === (breadthCells − 1) × depCellDays`; (5) `practical ⊆ components` by
**reference identity** (`includes`, which is the right check — it also pins that
`practical` holds the same objects, not copies); (6) every practical component has
`breadthCells >= 2`.

**Sufficient? No — and the gap is structural, not incremental.**

**Every one of those six invariants is partition-agnostic.** Consider a hypothetical
regression in which `segmentWindows` emitted each member cell as its own singleton
component. Then: (1) holds (each minC3 ≥ globalMin); (2) holds after the sort; (3) holds
(Σ of 1s = member count); (4) holds trivially (`(1−1)×cell = 0 = breadthDays`); (5)
holds (`practical` would be empty); (6) holds vacuously. **The property test would pass
all 40 trials against a completely broken segmenter.** The same is true of a silent
switch from conn8 to conn4, of a union-find that failed to union across a row boundary,
and of an off-by-one in the neighbor-offset table that dropped one of the eight offsets.

The suite's *entire* defense against a connectivity regression is therefore two
hand-built cases totaling four member cells: `tests:110-117` (holes split) and
`tests:163-171` (one diagonal join). Nothing tests conn8 on a grid where a diagonal
join and an orthogonal join interact, nothing tests a component that wraps around a
hole, and nothing tests a component that is 8-connected but not 4-connected in more
than one place. Given that DEC-17-1 locks conn8 *from measurement* and that the whole
distinction between 12 and 16 components on 99942 rides on it, this is the single most
important test to add. → **L2-02**

Additional property-test gaps, each cheap to close:
- **All 40 trials use `thresholdMode: 'absolute'`.** Relative mode — the *locked
  segmentation mode* per DEC-17-8 — is never exercised under randomized input, including
  the interesting case of a random grid with zero converged cells (`T = Infinity`).
- `nDep, nTof ∈ [2, 7]` always: the 1×N, N×1, and 0-length degenerate shapes never
  appear randomly (only as the two hand cases at `tests:91` and `tests:113`).
- No invariant on `bestPractical` (e.g. "equals the minimum `minC3` over `practical`, or
  null iff `practical` is empty").
- No invariant on `argmin` at all (e.g. "argmin.depJd lies within the component's
  departure span", "argmin is on the grid lattice").
- No invariant that `breadthCells` equals the true departure-index span of the component.
- The LCG seed is fixed (`0xC0FFEE`) and the corpus is 40 small grids — excellent for
  regression, weak for discovery. Not a defect; worth stating so it is not over-credited.

**Recommended single highest-value addition:** an independent reference segmenter in the
test (a naive O(n²) 8-neighbor flood fill written directly in the `.mjs`) compared against
the module's component partition on every property-test trial. That one assertion closes
gaps 1 (connectivity), plus the argmin and breadth-span gaps if extended to compare
per-component summaries. Equivalent cheaper alternative: assert that for every pair of
8-adjacent member cells, both land in a component with the same identity — which
requires the module to expose cell→component labels, so the reference segmenter is the
cleaner route.

---

## 2c — Hostile inputs

All five are reasoned, not executed. Each states the grid, walks the code, and names the
DEC exposure.

### H1 — `absoluteKm2S2` absent from the DEC-17-5 runtime metadata read
**Grid:** any real body grid (e.g. 99942 at 731×100). **Params:**
`{ thresholdMode: 'absolute', absoluteKm2S2: undefined }` — the shape produced when
DEC-17-5 rider (a)'s "runtime read of `metadata.feasibleC3MaxKm2S2`" finds the field
missing, renamed, or `null`.

**Reasoning.** `:175` connectivity defaults to 8, passes. `:182-192` shape validation
passes. `:193` `bMinCells = 2`. `:194` → `resolveThreshold` → `:131-134` returns
`{ mode: 'absolute', valueKm2S2: params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2 }` =
**25**. Segmentation proceeds normally and the result is indistinguishable from a
correctly-injected 25.

**Exposure.** The module's own header at `:86-91` states: *"the post-audit consumer MUST
inject that value, never ship this literal."* The `??` at `:133` makes shipping that
literal the **silent default**. The compare surface then discloses "25 km²/s²" as a
runtime-read boundary when it is in fact a hardcoded fallback — precisely the F1/F4
literal-vs-derived failure class DEC-17-5 was written to prevent. No throw, no flag on
`ResolvedThreshold`, no test.
**Severity: MED.** Not a DEC violation *by the module* (it documents itself as a
fallback), but it defeats DEC-17-5 rider (a) at the seam with no signal.
**Fix:** make `absoluteKm2S2` required in absolute mode, or add
`usedFallback: boolean` to `ResolvedThreshold` so a surface cannot label a fallback as a
runtime read. → **L2-04**

### H2 — Non-finite threshold: a false NO-PRACTICAL-WINDOW
**Grid:** 99942 at 731×100, thousands of converged cells, ~21 real components at
absolute 25. **Params:** `{ thresholdMode: 'absolute', absoluteKm2S2: NaN }`.
Realistic path: `Number(metadata.feasibleC3MaxKm2S2)` where the field is missing or a
malformed string — `Number(undefined) === NaN`, and **`??` does not catch `NaN`**
(only `null`/`undefined`). `NaN` is also a type-legal `number`, so TypeScript cannot
exclude it at the seam.

**Reasoning.** `:194` `T = NaN`. `:201-207` membership test `cell.c3 <= T` — every
comparison against `NaN` is `false`, so `member` stays all-zero for all 73,100 cells.
`:213-275` the seed loop never enters a component. Returns
`{ components: [], practical: [], bestPractical: null, threshold: { mode: 'absolute', valueKm2S2: NaN } }`.

**Exposure.** The consumer sees exactly the DEC-17-3 NO-PRACTICAL-WINDOW state — the state
DEC-17-3 defines as *"the correct answer for that body"* — for a body that has 21 real
opportunities. It is a **wrong refusal that is bit-identical to a correct one**. There is
no finiteness guard at `:123-135`, `:194`, or `:201-207`, and no test.
The same applies to relative mode with `deltaKm2S2: NaN`.
**Severity: MED**, not HIGH, only because no consumer exists yet (nothing imports the
module — verified). **This becomes HIGH the moment A3 wires the DEC-17-5 rider (a)
runtime read**, because that seam is specified to produce a number from external
metadata. Recommend fixing at G-A2, not deferring to G-A3.
**Fix:** in `resolveThreshold`, throw if the resolved `valueKm2S2` is `NaN`; a refusal is
legible, a false NO-PRACTICAL-WINDOW is not. → **L2-01**

### H3 — Δ ≤ 0 in relative mode
**Grid:** any real body grid. **Params:** `{ thresholdMode: 'relative', deltaKm2S2: 0 }`,
and separately `deltaKm2S2: -1`. Realistic path: a UI Δ control (DEC-17-8 mandates the
mode toggle and says Δ is disclosed) whose lower bound is not clamped.

**Reasoning.** `:127-130` returns `T = liveMin + 0 = liveMin` with no validation.
`:204` membership `c3 <= liveMin` admits **only** the argmin cell(s) — ties inclusive, so
normally exactly one cell. One component, `breadthCells = 1`, `:152` filters it out,
`bestPractical = null`. **Every body in the compare table simultaneously reports
NO-PRACTICAL-WINDOW.** With `deltaKm2S2: -1`, `T` sits *below* the live grid minimum, so
`member` is all-zero and `components` is empty for every body — a relative threshold
below the minimum it is defined relative to, which is semantically meaningless and is
accepted silently.

**Exposure.** Same false-refusal class as H2, reachable from a plain UI control rather
than a metadata glitch. No validation, no test (the lowest Δ any test uses is 1, at
`tests:187`).
**Severity: MED.** **Fix:** reject `deltaKm2S2 < 0` in `resolveThreshold`; document Δ=0
as the degenerate argmin-only case if it is to be permitted at all. → **L2-06**

### H4 — Sparse / partially-filled `cells` array
**Grid:** `{ nDep: 2, nTof: 1, depStartJd: …, depCellDays: …, tofMinDays: …, tofCellDays: …, cells: new Array(2) }`.
Realistic path: A3's "worker seam with reduced cell transfer" (recon Q3) pre-allocates a
result array and a transfer or index error leaves entries unset; or a `.map` over a
sparse source.

**Reasoning.** `:182-188` — `Number.isInteger(2)` ✓, `Number.isInteger(1)` ✓, neither
negative, **`cells.length (2) === nDep * nTof (2)` ✓ — validation PASSES.** Control
reaches `:194` `resolveThreshold(liveGridMin(cells), params)`. Inside `liveGridMin`,
`:115` `for (const cell of cells)` — `for…of` on a sparse array yields `undefined` for
holes — then `:116` `cell.converged` → **`TypeError: Cannot read properties of undefined
(reading 'converged')`, thrown from line 116.**

**Exposure.** The module has a purpose-built legible refusal at `:189-191`
("grid shape mismatch: …") which gives the impression that malformed grids are handled.
It validates the **count** and never the **contents**, so the actual failure surfaces as
an unlabelled `TypeError` from a helper, with no grid context, no body id, and nothing
pointing at the real cause. Not a DEC violation (DEC-17-10's refusal clause is about
ephemeris bounds), but it is a refusal-quality regression relative to the module's own
stated standard, and it is untested.
**Severity: MED.** **Fix:** in the shape validator, reject any non-object entry, or at
minimum guard `liveGridMin`/the membership loop with `cell == null → hole`. Note the
latter is the *safer* semantic: an unset cell is exactly a hole. → **L2-07**

### H5 — Unvalidated grid geometry floats
**Grid A:** a valid 4×3 member grid but `depStartJd: NaN` (e.g. an ephemeris epoch that
failed to parse).
**Grid B:** the same grid but `tofMinDays: NaN` (note: `tofMinDays` is the one geometry
field the *artifact does not store* — the test infers it at `tests:63`, so A3 must
compute it, which is exactly where a NaN can enter).

**Reasoning, Grid A.** `:182-192` validates only `nDep`, `nTof`, `cells.length` — the
four geometry floats are **never checked**. Segmentation runs normally. `:262`
`depJd = NaN + argDep * depCellDays = NaN`. `:267` `jdToIsoDate(NaN)` → `:95`
`new Date(NaN).toISOString()` → **`RangeError: Invalid time value`**, thrown from line 95
after the entire 73,100-cell segmentation has completed. Opaque error, no grid context.

**Reasoning, Grid B.** `:268` `tofDays = NaN + argTof * tofCellDays = NaN`. **No throw.**
The function returns successfully with `argmin.tofDays = NaN` on every component. `NaN`
propagates into `bestPractical.argmin`, and the compare view renders a transfer time of
`NaN` days — **a wrong number emitted silently**, which is the top line of the HIGH
definition, reachable without any refusal or warning. (Likewise `depCellDays: NaN` →
`breadthDays: NaN`; `tofCellDays: NaN` → `tofSpanDays: NaN`.)

**Exposure.** Grid B is the sharper case: it is the only hostile input in this set where
the module *returns normally with a wrong user-facing number*. It stays MED rather than
HIGH only because no consumer exists and the input is out-of-contract in spirit (though
type-legal — `NaN` is a `number`). Untested; the suite never passes a malformed geometry
float.
**Severity: MED.** **Fix:** extend the `:182-192` validator to require
`Number.isFinite` on `depStartJd`, `depCellDays`, `tofMinDays`, `tofCellDays`. Four
predicates, and it converts a silent NaN date and an opaque `RangeError` into the
module's existing legible refusal. → **L2-05**

**Hostile cases reasoned through and found CLEAN** (recorded so the absence of a finding
is deliberate rather than an omission):
- *Stack exhaustion on the largest real component.* `:210` uses an explicit array stack,
  not recursion, and `:254-256` marks `visited` **at push time**, so each cell is pushed
  at most once and stack length is bounded by `cells.length` = 73,100. No overflow, no
  double-count. The push-time marking is also what makes the `cellCount` at `:225`
  correct — marking at pop time would double-count. Correct as written.
- *`nDep = 0, nTof = 100, cells = []`.* Passes validation (`0 === 0 × 100`), `liveGridMin`
  returns `Infinity`, `T = Infinity`, the seed loop never runs, returns an empty result.
  The `idx % nDep` division by zero at `:230` is **unreachable** because no cell can be a
  member. No crash, no wrong number — only the same "degenerate grid is indistinguishable
  from an empty answer" ambiguity already captured by H2. LOW, folded in.
- *`c3 = -Infinity`, converged.* `Number.isFinite` excludes it from both `liveGridMin`
  (`:116`) and membership (`:204`), so it is a hole — consistent with the `+Infinity` and
  `null` treatment. Correct and coherent.
- *Duplicate minima inside one component.* Hand-traced four configurations (equal minima
  in the same row; in different rows; where the DFS reaches the later column first). The
  `:234-241` tie-break returned the lexicographically earliest (dep, tof) in all four.
  Correct — but unpinned, hence L2-09 rather than a correctness finding.
- *Integer index round-trip `(idx − depIdx) / nDep` at `:231`.* Exact in IEEE-754 for all
  indices below 2^53; at 73,100 cells there is no precision risk.

---

## Findings table

| ID | SEVERITY | One-line | file:line |
|---|---|---|---|
| L2-01 | MED | A `NaN` threshold (the canonical result of `Number(missingMetadataField)`, which `??` does not catch) makes every cell fail membership, returning a NO-PRACTICAL-WINDOW that is bit-identical to a correct one on a body with real components; no finiteness guard, no test. | `src/v2/porkchop/segment-windows.ts:194`, `:204`, `:127-134` |
| L2-02 | MED | The property test's six invariants are all partition-agnostic — they pass unchanged if the module emitted every member cell as its own component, or silently used conn4 — so the suite's entire defense against a connectivity regression is two hand-built cases totaling four member cells. | `tests/v2-segment-windows.test.mjs:266-305` (vs `:110-117`, `:163-171`) |
| L2-03 | MED | `bMinCells` appears zero times in the 446-line test file; hardcoding B_min at `:193` would leave all 15 tests green, contradicting §4-A1's "Δ and B_min injected not hardcoded" (Δ and `absoluteKm2S2` injection *are* pinned). | `src/v2/porkchop/segment-windows.ts:193` / `tests/v2-segment-windows.test.mjs` (absent) |
| L2-04 | MED | `absoluteKm2S2 ?? 25` silently ships the literal that the module's own header declares must never ship, defeating DEC-17-5 rider (a) with no flag on `ResolvedThreshold` and no test. | `src/v2/porkchop/segment-windows.ts:133` (vs `:86-91`) |
| L2-05 | MED | The four grid-geometry floats are never validated: `tofMinDays: NaN` returns normally with `argmin.tofDays = NaN` (a wrong user-facing number, silently), and `depStartJd: NaN` throws an opaque `RangeError` from `jdToIsoDate` after the full segmentation. | `src/v2/porkchop/segment-windows.ts:94-96`, `:182-192`, `:262-274` |
| L2-06 | MED | Relative mode accepts `deltaKm2S2 ≤ 0` with no validation: Δ=0 reduces every body to a single argmin cell (⇒ NO-PRACTICAL-WINDOW for the whole table), Δ<0 puts T below the live minimum it is defined relative to. | `src/v2/porkchop/segment-windows.ts:127-130` |
| L2-07 | MED | The shape validator checks cell **count** but not cell **contents**, so a sparse/partially-filled `cells` array (A3's reduced-transfer seam) passes validation and dies as an unlabelled `TypeError` inside `liveGridMin` instead of the module's own legible refusal. | `src/v2/porkchop/segment-windows.ts:113-121`, `:182-192` |
| L2-08 | LOW | DEC-17-8's rationale cites "163693 → 1 component" at Δ=2 and attributes the lock to `806745c`, but `806745c`/rev E gives **2** components; the figure `1` comes from the superseded rev D artifact `s17-cache-live-structure.json` (`d8dffd0`). Conclusion ("structure disappears", 0 practical) is unaffected — but this is the wrong-artifact-constant class the audit exists to catch, found in the founding doc rather than the tests. | `SLICE_17_FOUNDING.md:231-232` |
| L2-09 | LOW | Neither tie-break is pinned: no component in any test has two cells sharing the minimum c3 (intra-component argmin, `:234-241`), and no test asserts ordering for two components sharing a `minC3` (`compareByMinC3` depJd/tofDays branches, `:103-106`) — both reasoned correct here, neither protected against regression. | `src/v2/porkchop/segment-windows.ts:234-241`, `:99-107` |
| L2-10 | LOW | The fixture-provenance citation points at `tools/overnight-2026-08-05/L3_A1_FIXTURES.md`, which is **untracked** — the derivation record the test names as its authority is not in git. Mitigated (not eliminated) by the runtime cross-check at `tests:401-434`. | `tests/v2-segment-windows.test.mjs:5-6` |
| L2-11 | LOW | `SegmentWindowsResult.bestPractical` is documented as "First practical component", but `classifyComponents` scans for the minimum (correct per DEC-17-3); the comment is true only because `segmentWindows` pre-sorts, and is false for the direct `classifyComponents` entry point the artifact tests use. | `src/v2/porkchop/segment-windows.ts:80-81` (vs `:153-158`) |
| L2-12 | LOW | DEC-17-2's locked resolution (`nDep = 731`, `nTof = 100`) and the span **end** (`2466154.500800741` / `2040-01-01`) are asserted nowhere in the suite; the cross-check pins only the two cell widths and the span start. | `tests/v2-segment-windows.test.mjs:409-411` |

---

## Evidence appendix

All commands were run from the repo root `/Users/hudsonclavin/asteroid-mining-planner`
at HEAD `94e1dac`. Output is raw and unedited.

### E0 — Provenance and working-tree state

```
$ git log --oneline --diff-filter=A -- tools/slice17-research/data/s17-structure-7day.json
806745c research(s17): opportunity structure at 7-day departure spacing — aliasing control vs rev D [S-S17-MEASURE-2026-08-04-E]

$ git log --oneline -- tools/slice17-research/data/s17-structure-7day.json
806745c research(s17): opportunity structure at 7-day departure spacing — aliasing control vs rev D [S-S17-MEASURE-2026-08-04-E]
        (single entry ⇒ the artifact has never been modified since it was added)

$ git status --porcelain tools/slice17-research/data/s17-structure-7day.json src/v2/porkchop/segment-windows.ts tests/v2-segment-windows.test.mjs
        (no output ⇒ all three files clean and tracked)

$ git log --oneline -1 -- src/v2/porkchop/segment-windows.ts
e8182e4 feat(s17): A1 segmentWindows — sublevel-set opportunity extraction, UNAUDITED pending G-A2 [S-S17-A1-2026-08-05-A]

$ git log --oneline -1 -- tests/v2-segment-windows.test.mjs
e8182e4 feat(s17): A1 segmentWindows — sublevel-set opportunity extraction, UNAUDITED pending G-A2 [S-S17-A1-2026-08-05-A]

$ git ls-files --error-unmatch tools/overnight-2026-08-05/L3_A1_FIXTURES.md
L3_A1_FIXTURES.md: UNTRACKED (not in git)            [basis for L2-10]

$ grep -rn "segment-windows\|segmentWindows" src tests app | grep -v <the module and its own test>
        (no output ⇒ §4-A1 "nothing consumes segmentWindows before G-A2" HOLDS)
```

### E1 — Artifact shape, per-case values, and independent classification

```
$ node -e '
const j=JSON.parse(require("fs").readFileSync("tools/slice17-research/data/s17-structure-7day.json","utf8"));
const DEP=j.grid.departureCellDays;
const cases=[["2","liveMinPlus5","433"],["4","liveMinPlus5","163693"],["0","liveMinPlus2","99942"]];
for(const [k,mode,label] of cases){
  const b=j.bodies[k];
  console.log("=== "+label+" body["+k+"] "+mode+" ===");
  console.log("  body.id="+JSON.stringify(b.id)+"  spkId="+JSON.stringify(b.spkId));
  console.log("  live.minC3      = "+b.live.minC3);
  console.log("  live.minC3Date  = "+b.live.minC3Date+"   live.minC3TofDays = "+b.live.minC3TofDays);
  const st=b.structure[mode];
  console.log("  modeKeys        = "+JSON.stringify(Object.keys(st)));
  console.log("  thresholdKm2S2  = "+st.thresholdKm2S2);
  const delta = mode==="liveMinPlus2"?2:5;
  console.log("  liveMin+"+delta+" === stored threshold ? "+((b.live.minC3+delta)===st.thresholdKm2S2)+"   (liveMin+d = "+(b.live.minC3+delta)+")");
  console.log("  conn8.length="+st.conn8.length+"  conn4.length="+st.conn4.length);
  console.log("  componentCellCounts = "+JSON.stringify(st.componentCellCounts));
  for(const which of ["conn8","conn4"]){
    const comps=st[which];
    const practical=comps.filter(c=>Math.round(c.breadthDays/DEP)+1>=2);
    let best=null; for(const c of practical) if(best===null||c.minC3<best.minC3) best=c;
    console.log("  ["+which+"] n="+comps.length+" practical="+practical.length+" best="+(best?best.minC3+" @ "+best.argmin.date:"null"));
  }
}
'
=== 433 body[2] liveMinPlus5 ===
  body.id="433"  spkId=20000433
  live.minC3      = 1.6396903345121228
  live.minC3Date  = 2032-06-11   live.minC3TofDays = 265.5176767676768
  modeKeys        = ["thresholdKm2S2","conn4","conn8","componentCellCounts"]
  thresholdKm2S2  = 6.639690334512123
  liveMin+5 === stored threshold ? true   (liveMin+d = 6.639690334512123)
  conn8.length=2  conn4.length=3
  componentCellCounts = {"conn4":[1,23,23],"conn8":[23,24]}
  [conn8] n=2 practical=2 best=1.6396903345121228 @ 2032-06-11
  [conn4] n=3 practical=2 best=1.6396903345121228 @ 2032-06-11
=== 163693 body[4] liveMinPlus5 ===
  body.id="163693"  spkId=20163693
  live.minC3      = 6.7561195189011825
  live.minC3Date  = 2034-05-19   live.minC3TofDays = 182.5
  modeKeys        = ["thresholdKm2S2","conn4","conn8","componentCellCounts"]
  thresholdKm2S2  = 11.756119518901183
  liveMin+5 === stored threshold ? true   (liveMin+d = 11.756119518901183)
  conn8.length=5  conn4.length=5
  componentCellCounts = {"conn4":[1,1,1,1,1],"conn8":[1,1,1,1,1]}
  [conn8] n=5 practical=0 best=null
  [conn4] n=5 practical=0 best=null
=== 99942 body[0] liveMinPlus2 ===
  body.id="99942"  spkId=20099942
  live.minC3      = 0.00005501593238631661
  live.minC3Date  = 2028-08-24   live.minC3TofDays = 232.31060606060606
  modeKeys        = ["thresholdKm2S2","conn4","conn8","componentCellCounts"]
  thresholdKm2S2  = 2.000055015932386
  liveMin+2 === stored threshold ? true   (liveMin+d = 2.000055015932386)
  conn8.length=12  conn4.length=16
  componentCellCounts = {"conn4":[1,1,1,1,1,1,1,1,1,2,2,2,15,24,36,37],"conn8":[1,1,1,1,1,1,1,1,15,24,38,42]}
  [conn8] n=12 practical=4 best=0.00005501593238631661 @ 2028-08-24
  [conn4] n=16 practical=7 best=0.00005501593238631661 @ 2028-08-24
```

**Reads:** all three stored thresholds are float-exactly `liveMin + Δ`. The
`conn4`/`conn8` divergence for 433 (3 vs 2) and 99942 (16 vs 12, 7 vs 4 practical)
proves the tests' 2/5/12 and 2/0/4 could only have come from `conn8`. The artifact's
independent `componentCellCounts` tally is multiset-identical to the fixture cellCounts.

### E2 — Grid geometry, epoch anchor, and the TOF_MIN_DAYS inference

```
$ node -e '
const fs=require("fs");
const j=JSON.parse(fs.readFileSync("tools/slice17-research/data/s17-structure-7day.json","utf8"));
const DEP=j.grid.departureCellDays, TOF=j.grid.tofCellDays;
console.log("grid:",JSON.stringify(j.grid));
console.log("DEP===7.004109589041096 ?",DEP===7.004109589041096,"  TOF===16.603535353535353 ?",TOF===16.603535353535353);
console.log("span.requested.start.jdTdb =",j.span.requested.start.jdTdb,"  ===2461041.500800741 ?",j.span.requested.start.jdTdb===2461041.500800741);
console.log("span.requested.start.isoUtc =",j.span.requested.start.isoUtc);
const jd=j.span.requested.start.jdTdb;
console.log("jdToIsoDate(depStartJd) =",new Date((jd-2440587.5)*86400000).toISOString(),"-> slice(0,10) =",new Date((jd-2440587.5)*86400000).toISOString().slice(0,10));
const span=j.span.requested.end.jdTdb-j.span.requested.start.jdTdb;
console.log("span days =",span," /(nDep-1) =",span/(j.grid.nDep-1)," equals DEP ?",span/(j.grid.nDep-1)===DEP);
let mn=Infinity;
for(const b of j.bodies) for(const m of Object.keys(b.structure)) for(const w of ["conn4","conn8"]) for(const c of b.structure[m][w]){ if(c.argmin.tofDays<mn) mn=c.argmin.tofDays; }
console.log("min argmin.tofDays over entire artifact =",mn,"  ===182.5 ?",mn===182.5);
let bad=0,maxerr=0,maxk=0;
for(const b of j.bodies) for(const m of Object.keys(b.structure)) for(const w of ["conn4","conn8"]) for(const c of b.structure[m][w]){ const k=(c.argmin.tofDays-182.5)/TOF; if(Math.abs(k-Math.round(k))>1e-9) bad++; maxerr=Math.max(maxerr,Math.abs(k-Math.round(k))); maxk=Math.max(maxk,Math.round(k)); }
console.log("argmin tofDays off-lattice count =",bad,"  max frac err =",maxerr,"  max k =",maxk,"  (nTof-1 =",j.grid.nTof-1,")");
console.log("182.5 + 99*TOF =",182.5+99*TOF);
'
grid: {"nDep":731,"nTof":100,"departureCellDays":7.004109589041096,"tofCellDays":16.603535353535353}
DEP===7.004109589041096 ? true   TOF===16.603535353535353 ? true
span.requested.start.jdTdb = 2461041.500800741   ===2461041.500800741 ? true
span.requested.start.isoUtc = 2026-01-01T00:00:00.000Z
jdToIsoDate(depStartJd) = 2026-01-01T00:01:09.184Z -> slice(0,10) = 2026-01-01
span days = 5113  /(nDep-1) = 7.004109589041096  equals DEP ? true
min argmin.tofDays over entire artifact = 182.5   ===182.5 ? true
argmin tofDays off-lattice count = 0   max frac err = 3.552713678800501e-15   max k = 30   (nTof-1 = 99 )
182.5 + 99*TOF = 1826.25
```

**Reads:** `TOF_MIN_DAYS = 182.5` is not stored, but every argmin TOF in the artifact
lies exactly on `182.5 + k · tofCellDays` with `k ≤ 30 ≤ 99`, and the lattice top is
exactly `1826.25 d` (5.00 yr). The inference is sound. The `(N−1)` convention of
AMENDMENT A2 is confirmed in the artifact's own geometry (`5113 / 730`).

### E3 — Derivation-rule closure over all 19 fixture components

```
$ node -e '
const j=JSON.parse(require("fs").readFileSync("tools/slice17-research/data/s17-structure-7day.json","utf8"));
const DEP=j.grid.departureCellDays,TOF=j.grid.tofCellDays;
const all=[];
for(const [k,m] of [["2","liveMinPlus5"],["4","liveMinPlus5"],["0","liveMinPlus2"]]) all.push(...j.bodies[k].structure[m].conn8);
console.log("all.length =",all.length,"(test asserts 19)");
let worstB=0,worstT=0,fail=0;
for(const c of all){
  const bc=Math.round(c.breadthDays/DEP)+1;
  const eB=Math.abs((bc-1)*DEP-c.breadthDays); if(eB>worstB)worstB=eB;
  const tc=Math.round(c.tofSpanDays/TOF); const eT=Math.abs(tc*TOF-c.tofSpanDays); if(eT>worstT)worstT=eT;
  if(eB>=1e-6||eT>=1e-6)fail++;
}
console.log("max |(bc-1)*DEP - breadthDays| =",worstB," max |tc*TOF - tofSpanDays| =",worstT," failures@1e-6 =",fail);
'
all.length = 19 (test asserts 19)
max |(bc-1)*DEP - breadthDays| = 2.8961721909581684e-10  max |tc*TOF - tofSpanDays| = 4.263256414560601e-14  failures@1e-6 = 0
```

**Reads:** the `tests:389` count assertion (19) and the `tests:394-397` derivation
assertions all hold, with four orders of magnitude of margin on the breadth tolerance.

### E4 — THE DECISIVE CHECK: regenerate the fixture literals from the artifact and `diff`

This regenerates all 19 component records **from the artifact** in the test file's exact
literal syntax, extracts the corresponding 19 lines **from the test file**, and diffs
them. No transcription by the auditor is involved.

```
$ SP=<scratchpad>
$ node -e '
const fs=require("fs");
const j=JSON.parse(fs.readFileSync("tools/slice17-research/data/s17-structure-7day.json","utf8"));
const DEP=j.grid.departureCellDays;
for(const [k,mode] of [["2","liveMinPlus5"],["4","liveMinPlus5"],["0","liveMinPlus2"]]){
  for(const c of j.bodies[k].structure[mode].conn8){
    const bc=Math.round(c.breadthDays/DEP)+1;
    console.log("    { minC3: "+c.minC3+", argmin: { dateIso: \x27"+c.argmin.date+"\x27, tofDays: "+c.argmin.tofDays+" }, breadthDays: "+c.breadthDays+", breadthCells: "+bc+", cellCount: "+c.cellCount+", tofSpanDays: "+c.tofSpanDays+" },");
  }
}
' > $SP/from_artifact.txt
$ sed -n '314,315p;324,328p;337,348p' tests/v2-segment-windows.test.mjs > $SP/from_test.txt
$ echo "artifact lines: $(wc -l < $SP/from_artifact.txt)  test lines: $(wc -l < $SP/from_test.txt)"
--- artifact lines:       19  test lines:       19
$ diff $SP/from_test.txt $SP/from_artifact.txt && echo "DIFF: IDENTICAL (19/19 component literals match conn8 byte-for-byte)"
DIFF: IDENTICAL (19/19 component literals match conn8 byte-for-byte)
```

**Reads:** `diff` produced no output and exited 0. All 19 pasted component records —
133 field values including every 17-significant-figure float and every ISO date — are
**byte-for-byte identical** to the values regenerated from the committed artifact under
the stated shape mapping (`argmin.date → dateIso`) and the stated `breadthCells`
derivation. **This is the disproof of the INV-033 hypothesis.**

### E5 — Independent re-derivation of the classification claims

```
$ node -e '
const j=JSON.parse(require("fs").readFileSync("tools/slice17-research/data/s17-structure-7day.json","utf8"));
const DEP=j.grid.departureCellDays;
const bc=c=>Math.round(c.breadthDays/DEP)+1;
for(const [k,m,lab,d] of [["2","liveMinPlus5","433",5],["4","liveMinPlus5","163693",5],["0","liveMinPlus2","99942",2]]){
  const s=j.bodies[k].structure[m], comps=s.conn8;
  const prac=comps.filter(c=>bc(c)>=2);
  let best=null; for(const c of prac) if(best===null||c.minC3<best.minC3) best=c;
  console.log(lab+" (delta "+d+"): components="+comps.length+"  practical="+prac.length);
  console.log("   practical minC3 list = ["+prac.map(c=>c.minC3).join(", ")+"]");
  console.log("   bestPractical.c3 = "+(best?best.minC3:null)+"   bestPractical.argmin.date = "+(best?best.argmin.date:"n/a"));
  console.log("   sorted ascending by minC3 ? "+comps.every((c,i)=>i===0||comps[i-1].minC3<=c.minC3));
}
console.log("\n0.00005501593238631661 === 5.501593238631661e-5 ? "+(0.00005501593238631661===5.501593238631661e-5));
'
433 (delta 5): components=2  practical=2
   practical minC3 list = [1.6396903345121228, 2.3672122595483507]
   bestPractical.c3 = 1.6396903345121228   bestPractical.argmin.date = 2032-06-11
   sorted ascending by minC3 ? true
163693 (delta 5): components=5  practical=0
   practical minC3 list = []
   bestPractical.c3 = null   bestPractical.argmin.date = n/a
   sorted ascending by minC3 ? true
99942 (delta 2): components=12  practical=4
   practical minC3 list = [0.00005501593238631661, 0.09938818519513135, 0.6700687457041004, 1.0609756270535315]
   bestPractical.c3 = 0.00005501593238631661   bestPractical.argmin.date = 2028-08-24
   sorted ascending by minC3 ? true

0.00005501593238631661 === 5.501593238631661e-5 ? true
```

**Reads:** every classification claim in the three artifact-fixture tests
(`tests:352-384`) reproduces exactly, derived from the artifact by an implementation
written independently of the module: 2/2, 5/0, 12/4; best-practical `1.6396903345121228
@ 2032-06-11`, `null`, `5.501593238631661e-5 @ 2028-08-24`. The dispatch's stated
best-practical values (`433: 1.6396903345121228`, `99942: 5.501593238631661e-5`) are
confirmed, and the `e-5` / decimal forms are the same IEEE-754 double.

### E6 — Basis for L2-08 (founding-doc rationale sourced from the superseded artifact)

Component counts across all five bodies, all four threshold modes, both connectivities,
with singleton counts in parentheses — read from **rev E** (`s17-structure-7day.json`,
`806745c`), the artifact DEC-17-8 cites:

```
$ node -e '
const j=JSON.parse(require("fs").readFileSync("tools/slice17-research/data/s17-structure-7day.json","utf8"));
for(const b of j.bodies){
  const out=[];
  for(const m of ["liveMinPlus2","liveMinPlus5","liveMinPlus10","absolute25"]){
    const s=b.structure[m];
    const sing=w=>s[w].filter(c=>c.cellCount===1).length;
    out.push(m+": n4="+s.conn4.length+"(s"+sing("conn4")+") n8="+s.conn8.length+"(s"+sing("conn8")+")");
  }
  console.log(b.id.padEnd(7),out.join("  "));
}
'
99942   liveMinPlus2: n4=16(s9) n8=12(s8)  liveMinPlus5: n4=24(s7) n8=16(s3)  liveMinPlus10: n4=23(s5) n8=18(s2)  absolute25: n4=26(s4) n8=21(s1)
101955  liveMinPlus2: n4=16(s8) n8=11(s6)  liveMinPlus5: n4=26(s11) n8=19(s8)  liveMinPlus10: n4=22(s6) n8=15(s1)  absolute25: n4=34(s10) n8=28(s5)
433     liveMinPlus2: n4=4(s1) n8=2(s0)  liveMinPlus5: n4=3(s1) n8=2(s0)  liveMinPlus10: n4=6(s2) n8=4(s0)  absolute25: n4=18(s1) n8=16(s0)
1566    liveMinPlus2: n4=12(s10) n8=12(s10)  liveMinPlus5: n4=24(s13) n8=20(s13)  liveMinPlus10: n4=35(s15) n8=27(s14)  absolute25: n4=50(s19) n8=36(s18)
163693  liveMinPlus2: n4=2(s2) n8=2(s2)  liveMinPlus5: n4=5(s5) n8=5(s5)  liveMinPlus10: n4=11(s6) n8=7(s3)  absolute25: n4=16(s7) n8=11(s5)
```

Same tally read from **rev D** (`s17-cache-live-structure.json`, `d8dffd0`, the
superseded pass):

```
99942   liveMinPlus2: n4=18 n8=6  liveMinPlus5: n4=27 n8=14  liveMinPlus10: n4=19 n8=16  absolute25: n4=25 n8=21
101955  liveMinPlus2: n4=10 n8=4  liveMinPlus5: n4=26 n8=12  liveMinPlus10: n4=21 n8=15  absolute25: n4=30 n8=23
433     liveMinPlus2: n4=4 n8=3  liveMinPlus5: n4=5 n8=2  liveMinPlus10: n4=6 n8=4  absolute25: n4=18 n8=17
1566    liveMinPlus2: n4=6 n8=5  liveMinPlus5: n4=11 n8=7  liveMinPlus10: n4=24 n8=12  absolute25: n4=47 n8=19
163693  liveMinPlus2: n4=1 n8=1  liveMinPlus5: n4=2 n8=2  liveMinPlus10: n4=6 n8=6  absolute25: n4=12 n8=8
```

**Cross-check of DEC-17-1 and DEC-17-8's measured claims against rev E:**

| Founding-doc claim | Location | rev E says | Verdict |
|---|---|---|---|
| "99942 at Δ=5 has 7 singletons under conn4 vs 3 under conn8" | `:105-106` | conn4 24(s**7**), conn8 16(s**3**) | ✔ CORRECT |
| "433 has zero conn8 singletons at every threshold" | `:106-107` | s0 at all four modes | ✔ CORRECT |
| "Δ=10 over-merges (1566: 24 → 35 components under conn4 while singletons rise)" | `:232-233` | 1566 conn4 Δ=5 → **24**, Δ=10 → **35**; singletons 13 → 15 | ✔ CORRECT |
| "Δ=2 is too tight (163693 → **1** component; structure disappears)" | `:231-232` | 163693 @Δ=2 conn4 = **2**, conn8 = **2** — the value `1` appears only in **rev D** (`d8dffd0`) | ✘ **MISMATCH → L2-08** |

The DEC states its lock is "LOCKED from measurement (806745c)". Three of its four
supporting figures come from `806745c`; the fourth comes from the superseded `d8dffd0`.
The lock's *conclusion* survives — at Δ=2 both of 163693's components are singletons, so
zero practical windows and "structure disappears" holds either way — hence LOW. Recorded
because it is the same wrong-artifact-constant failure mode this audit was chartered to
hunt, found in the founding document rather than in the test file.

---

## Auditor's bottom line

The suspicion that motivated this lens — that the test file's constants were fabricated
or copied from the wrong place — is **disproven with mechanized evidence** (E4: 19/19
records byte-identical; E5: every classification claim independently re-derived; E1: the
conn4/conn8 divergence rules out an array mix-up). The fixture block is honest, it is
guarded at runtime against artifact regeneration, and its one derived quantity
(`breadthCells`) has its rule independently validated. **G-A1: ALL MATCH.**

What is weak is elsewhere, and it is worth Hudson's attention before A3 wires a consumer:
the module accepts several type-legal inputs that produce a **silent false
NO-PRACTICAL-WINDOW** or a **silently emitted NaN**, and the property test cannot see a
connectivity regression at all. Neither is a HIGH today because nothing imports the
module. Both become expensive the moment something does.
