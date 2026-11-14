SWEEP: PARTIAL (W11 verify/build halted after two CK-13 architecture-guard failures)
COMMITS: 15 on s20-text-sweep, tip 5001a0b (W12 evidence commit is the final step)
VERIFY: 109/111 files, 368/370 tests (baseline 109/109 files, 363/363 tests)
K2 FINDING: 50 m/s is the 5% deterministic margin on the 1000 m/s reference rendezvous, src/v2/app/compare/main.ts:158
PROTECTED PENDING: src/v2/core/constants/physical.ts
src/v2/core/propagators/keplerian.ts
INVARIANTS.md
SLICE_17_FOUNDING.md
src/v2/SLICE_13_FOUNDING.md
src/v2/SLICE_18_FOUNDING.md
Additive proof: yes.

# Slice 20 text sweep report

Run date: 2026-11-13. Branch: `s20-text-sweep`. No push, merge, sub-agent,
or ASTER override was used. The canonical repository was clean at Phase 0;
the kept stash was left untouched. The baseline was taken before the sweep.

## Result

W1-W10 completed. W11 was attempted twice and halted as required after the
same import-wall failure reproduced and the design architecture guard also
failed. W12 evidence is complete. W11 build was not run, so there is no W11
docs rebuild commit and the pre-W10 checked-in bundle names remain the last
verified names. The branch is intentionally PARTIAL, not green.

The two W11 failures are:

- `tests/v2-architecture.test.mjs:60:1`: `src/v2/app/catalog-list/threshold-disclosure.test.mjs`
  imports `../../../../tests/helpers/run-tsc.mjs`, crossing the `src/v2`
  import wall.
- `tests/v2-design-architecture.test.mjs:9:1`: `src/v2/app/catalog-list/threshold-disclosure.ts:5`
  imports `formatC3` directly, outside the C3Value owner.

The final runner summary on attempt 2 was 111 discovered, 109 passed, 2
failed, 0 load-timeouts; 368 tests passed and 2 failed. The exact failure
evidence is also in `sweep-LOG.md`.

## Commits in order

1. `ee92047 fix(porkchop): close W1 mission-copy residuals` - W1 K1/K3/K4.
2. `a5e4149 refactor(porkchop): centralize mode budget policy` - W1 mode-owned margin policy.
3. `e861e7e refactor(grid): centralize porkchop departure span` - W3/W4 typed-grid wiring, shared departure end, and W4 guard.
4. `4e3e910 refactor(design): route C3 displays through typed grid value` - W3 typed C3 display routing and guard coverage.
5. `ef883e2 fix(porkchop): disclose near-zero cells and refresh pins` - W2 K5-K9.
6. `51b3f4c test(porkchop): lock mode-owned spacecraft budget totals` - W1/K2 budget identity and mode coverage.
7. `74813a0 feat(solar): add Earth-to-body light-time HUD chip` - W6 non-core K4 logic, chip, and tests; core constant remains unstaged.
8. `846136c test(catalog): lock shared C3 display precision` - W8 CK-12.
9. `60091b4 docs(catalog): disclose cache-derived LOW C3 threshold` - W8 CK-13; full verify exposed its architecture defects.
10. `c93cb8c fix(a11y): identify Slice 20 form controls` - W8 CK-14.
11. `9a83ff0 docs(research): preserve historical folder labels` - W9 D-4.
12. `0b0d07d ci: align workflow gate comment with jobs` - W9 D-5.
13. `cca4f24 docs: correct GM_SUN provenance label` - W9 D-2 non-core labels.
14. `1691d96 docs(devlog): correct legacy Moon accuracy claim` - W9 D-6.
15. `5001a0b docs(status): record Slice 20 text sweep state` - W10 STATUS.
16. W12 evidence commit `docs(research): Slice 20 text sweep run evidence` - final step after this report snapshot.

No commits were reverted. Revert map: W1 = 1-2 and 6; W2 = 5; W3/W4 =
3-4; W6 = 7; W8 = 8-10; W9 = 11-14; W10 = 15; W11 = no commit; W12 = 16.

## Test and mutation proofs

- W1 focused tests passed 29/29. K1 mutation failed
  `tests/v2-dla-render.test.mjs:452:12` because the old wording left the
  one-way cost-card sentence incorrectly naming departure. K2 mutation failed
  `tests/v2-compare-data.test.mjs:346:1`, assertion `1150 !== 1250`. K3
  mutation failed `tests/v2-dla-render.test.mjs:345:1` at line 452 for the
  missing injection disclosure. K4 mutation failed the same test at line 457
  because the rendered value lacked comma-separated m/s.
- W2 K7 mutation failed `tests/v2-porkchop-honesty.test.mjs:428:1`, assertion
  `1.2 !== 1.1` while replacement computation was pending. K8 mutation failed
  `tests/v2-dla-render.test.mjs:345:1` at line 431 because it rendered
  `Target: (2020 FK3)`. K9 mutation failed
  `tests/v2-compare-honesty.test.mjs:108:1` because the near-zero mass caveat
  sentence was absent.
- W3 architecture mutation failed `tests/v2-design-architecture.test.mjs:9:1`
  on a temporary `formatC3ValueText(` marker in porkchop main.
- W4 mutation failed `tests/v2-architecture.test.mjs:126:1` with
  `literal 2040-01-01 outside grid-span.ts/tests: src/v2/app/ui-overlay/overlay.ts`.
- W5 mutation failed `tests/v2-dla-render.test.mjs:345:1` at line 530 because
  the approved Vandenberg ceiling wording was absent.
- W6 mutation failed `tests/v2-light-time.test.mjs:28:1` at line 33 with
  `74798935350` versus `499.00478383615643` after replacing division by the
  speed-of-light constant with `/ 2`.
- W8 CK-12 mutation failed `src/v2/app/catalog-list/row.test.mjs:307:1` with
  `55.5 must render as 55.5`; CK-13 mutation failed
  `src/v2/app/catalog-list/threshold-disclosure.test.mjs:11:1` because actual
  `LOW C3: below 25.0 km2/s2` did not equal the expected text containing
  `(the screening threshold)`; CK-14 mutation failed
  `tests/v2-dla-render.test.mjs:345:1` at line 425 with
  `CK-14 input must have an id`.
- W8 focused tests passed 12/12 before the full architecture guards were run.
- W11 attempt 1 and attempt 2 both failed the import-wall guard. Attempt 2 also
  failed the C3 ownership guard. No test failure was hidden or reclassified.

## Copy and scope results

No `[UNGATED COPY]` strings were introduced. W1 changed mode-aware margin
copy, injection accounting disclosure, and m/s grouping. W2 removed duplicate
payload refusal copy, prevented stale-cell display, fixed the target label, and
added the existing near-zero caveat. W3 routed four display sites through the
typed C3Value boundary. W4 replaced the three production date literals with
`PORKCHOP_DEPARTURE_END_UTC`. W5 changed only the Vandenberg ceiling wording.
W6 added the light-time disclosure and refusals. W8 added the catalog
precision/threshold/a11y copy and attributes. W9 corrected only the requested
historical/documentation surfaces.

### K2 finding

The 50 m/s is not stationkeeping. `src/v2/app/compare/main.ts:154-160` sets
`REFERENCE_RENDEZVOUS_MPS = 1000`, then calls
`deterministicMarginMps(REFERENCE_RENDEZVOUS_MPS)` at line 158. The imported
constant is `DETERMINISTIC_MARGIN_FRACTION = 0.05` at
`src/v2/porkchop/launch-vehicles.ts:59`, and the helper multiplies its sum by
that constant at lines 203-207. Thus 50 m/s is the 5% rendezvous margin; the
150 m/s stationkeeping allocation is separate and not margined.

### CK-10 code quote

The production feasibility path states that the Vandenberg corridor has no
ceiling when direct launches reach every declination. The test-backed wording
landed as `max direct declination (ceiling): none - direct launches from
Vandenberg SFB reach every declination (minimum inclination 70.0 deg)`.

### W3 site list and W4 literal list

W3 sites before the sweep were the two compare and two porkchop display sites
using `formatC3ValueText`; after the sweep they use `C3Value` with a derived
`GridDescriptor`. The architecture guard was widened to reject both old helper
forms outside the pure formatter/design owner.

W4 production literals before the sweep were in
`src/v2/app/compare/main.ts`, `src/v2/app/porkchop-smoke/main.ts`, and
`src/v2/app/ui-overlay/overlay.ts`; after the sweep all three read
`PORKCHOP_DEPARTURE_END_UTC` from `src/v2/porkchop/grid-span.ts`. Test and
historical founding-document literals remain permitted by the guard.

## W6 protected core handoff

Untracked protected file `src/v2/core/constants/physical.ts` added text:

```ts
/** Speed of light in vacuum; SI definition of the metre (exact). */
export const SPEED_OF_LIGHT_M_PER_S = 299_792_458;
```

Its working-tree `git diff -- src/v2/core/constants/physical.ts` is empty
because the file is intentionally untracked; `git status --porcelain` shows
`?? src/v2/core/constants/physical.ts`. This is the required pending core
handoff, not a missing change.

Hudson hand-commit block:

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "src/v2/core/constants/physical.ts`n")
git add -- src/v2/core/constants/physical.ts
$env:ASTER_PROTECTED_OK = "1"; git commit -m "feat(core): speed of light constant (exact, SI) for K4 (DEC-20-11)"; Remove-Item Env:\ASTER_PROTECTED_OK
$env:ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
git status --porcelain
```

## W7 payload recon

| File | Bytes | Classification | Request/trace |
|---|---:|---|---|
| `docs/_staging_v1/earth_lights_4800.tif` | 7072234 | UNREFERENCED | No built-page request; historical prototype/research source only. |
| `docs/2k_earth_nightmap.jpg` | 1333492 | REFERENCED | `solarSystemV2-C6dR6zLr.js`; runtime texture URL. |
| `docs/2k_moon.jpg` | 1053869 | REFERENCED | `legacy-C6NkCVYx.js`; legacy renderer texture. |
| `docs/assets/horizons-inner-solar-system-2026-2040-Bl0fvEH3.json` | 7214102 | REFERENCED | Built solar-system, compare, and porkchop bundles; V2 ephemeris import. |
| `docs/assets/horizons-jupiter-system-rolling-D7NnnMbz.json` | 1295812 | REFERENCED | Built tier/solar-system loader path. |
| `docs/assets/horizons-mars-system-rolling-BbEEuyA2.json` | 2463346 | REFERENCED | Built tier/solar-system loader path. |
| `docs/assets/horizons-saturn-system-rolling-d_v3Lj_T.json` | 3074744 | REFERENCED | Built tier/solar-system loader path. |
| `docs/assets/nea-catalog-slice9-BkYibDG0.json` | 52969826 | REFERENCED | Built catalog loader path; catalog asset is requested by the V2 app. |
| `docs/assets/star-catalog-tycho2-mag75-Lh18dL25.bin` | 1120016 | REFERENCED | `solarSystemV2-C6dR6zLr.js`; star catalog loader. |
| `docs/lambert-screen-cache.json` | 34499477 | REFERENCED | Vite `copy-lambert-screen-cache` plugin at `vite.config.ts:47-53`; runtime boundary request. |
| `docs/tier-sizing-per-body.json` | 10880177 | REFERENCED | Vite `copy-fidelity-tier-assignments` plugin at `vite.config.ts:70-76`; runtime tier request. |

No files were deleted. W7 was read-only.

## W8/W9 disposition

| Item | Result | Evidence |
|---|---|---|
| CK-12 | FIXED | `src/v2/app/catalog-list/row.test.mjs`; shared C3Value precision. |
| CK-13 | FIXED but architecture regression exposed | `threshold-disclosure.ts` and its focused test pass; full verify rejects its import choices. |
| CK-14 | FIXED | `tests/v2-dla-render.test.mjs`; every rendered input/select/textarea gets id and name. |
| CK-15 | ALREADY FIXED / NON-TEXT | `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`; text items have source evidence, non-text items logged only. |
| D-1 | PENDING HAND COMMIT | `INVARIANTS.md`, additive index correction. |
| D-2 | FIXED + PENDING CORE HAND COMMIT | `cca4f24` non-core labels; core comment below remains unstaged. |
| D-3 | PENDING HAND COMMIT | root Slice 17 and `src/v2` Slice 13/18 founding annotations. |
| D-4 | FIXED | `9a83ff0`, historical folder-label explanation. |
| D-5 | FIXED | `0b0d07d`, workflow comment only. |
| D-6 | FIXED | `1691d96`, DEVLOG additive correction. |

## Protected pending additions and hand-commit blocks

### `src/v2/core/propagators/keplerian.ts`

Added immediately after the historical comment:

```ts
// Correction (2026-11-13, audit A4-F09/B2-F04): 1.32712440018e20 is the DE405-era
// value; the historical label above is retained, and the numeric constant is unchanged.
```

Additive proof: `git diff -- src/v2/core/propagators/keplerian.ts | Select-String '^-'
` prints only `--- a/src/v2/core/propagators/keplerian.ts`.

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "src/v2/core/propagators/keplerian.ts`n")
git add -- src/v2/core/propagators/keplerian.ts
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(core): annotate GM_SUN DE405-era provenance"; Remove-Item Env:\ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
```

### `INVARIANTS.md`

Added block:

```text
## Index corrections (2026-11-13; audit A2-F01, A2-F07, A2-F08, A2-F14)

The original index rows above remain unchanged. The authoritative additive corrections are:

- The `INV-017..020` row's old summary is incomplete and incorrectly says "no partial renders". `INV-019` is the Slice 11 containment rule: M=1 solutions use the audited Slice 10 Lambert layer, production multi-revolution code lives in `src/v2/core/lambert/`, and it passes its own audit before integration. `INV-017`, `INV-018`, and `INV-020` retain their meanings in `src/v2/SLICE_11_FOUNDING.md`.
- `INV-014` is namespaced by source: `INV-014a` is the Slice 8.5 star-background floor and `INV-014b` is the Slice 9 three-gate visualization tier contract. Both meanings remain live and are not interchangeable.
- `INV-007` is referenced by the inherited V2 material but has no definition in the repository. It is retired as an undefined number; no new rule may cite it.
- The `INV-015` text in `src/v2/SLICE_10_FOUNDING.md` is stale. The shipped solver is a clean-room TypeScript implementation, and `INV-024` forbids porting external astrodynamics source; the old PyKEP/WebAssembly wording is not an implementation claim.

### INV-015 amendment

`INV-015` is amended additively: the operative requirement is that the shipped Lambert solver trace to the peer-reviewed algorithm named by the Slice 10 founding record, while its implementation remains the repository's clean-room TypeScript code. PyKEP source and WebAssembly are not production dependencies.
```

Additive proof: `git diff -- INVARIANTS.md | Select-String '^-'
` prints only `--- a/INVARIANTS.md`.

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "INVARIANTS.md`n")
git add -- INVARIANTS.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(invariants): append Slice 20 audit index corrections"; Remove-Item Env:\ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
```

### `SLICE_17_FOUNDING.md`

Added block:

```text
### D3-3 — §1 thesis sample correction (2026-11-13; audit C3-F01)

The §1 sentence saying that body 163693 has the second-best minimum C3 of the five is incorrect. The committed five-body measurement artifact `tools/slice17-research/data/s17-structure-7day.json` records live minima of 0.00005501593238631661 (99942), 0.5230068387747006 (101955), 0.8314966301088486 (1566), 1.6396903345121228 (433), and 6.7561195189011825 (163693). Therefore 163693 has the highest, worst minimum C3 in that sample. The thesis about minimum-only ranking versus structure is unchanged; this annotation corrects only the rank wording.
```

Additive proof: `git diff -- SLICE_17_FOUNDING.md | Select-String '^-'
` prints only `--- a/SLICE_17_FOUNDING.md`.

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "SLICE_17_FOUNDING.md`n")
git add -- SLICE_17_FOUNDING.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(slice17): append audit thesis-sample correction"; Remove-Item Env:\ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
```

### `src/v2/SLICE_13_FOUNDING.md`

Added block:

```text
## §9. Amendments and corrections

### D3-2 — reverted New Glenn C3=5 anchor (2026-11-13; audit B5-F04/C5-F14)

The close-out line at `src/v2/SLICE_13_FOUNDING.md:100` says the New Glenn C3=5 anchor landed and that nothing was parked. That statement predates the documented revert `bcf1738` (`revert: remove unverified New Glenn C3=5 anchor`, reverting `df3225f`). The anchor is not present at HEAD and remains parked pending the provenance evidence named by the revert. This annotation records the correction without changing the locked history line.
```

Additive proof: `git diff -- src/v2/SLICE_13_FOUNDING.md | Select-String '^-'
` prints only `--- a/src/v2/SLICE_13_FOUNDING.md`.

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "src/v2/SLICE_13_FOUNDING.md`n")
git add -- src/v2/SLICE_13_FOUNDING.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(slice13): append reverted-anchor audit correction"; Remove-Item Env:\ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
```

### `src/v2/SLICE_18_FOUNDING.md`

Added blocks:

```text
### D3-1 — Front B completion date correction (2026-11-13; audit C2-F03/C2-F04)

The original Front B date in this document is 2026-09-02. The committed truth fixture landed at `0d927e4` on 2026-09-05, the drift artifacts landed at `d663e9c` on 2026-09-06, and STATUS first recorded Front B completion at `6e89131` on 2026-09-06. The authoritative Front B completion date is therefore **2026-09-06**; 2026-09-02 was Front A's close date. The original text remains unchanged.

### D3-4 — measured-unbounded tier-count correction (2026-11-13; audit C2-F08, evidence `b25acdc`)

The tier-count text above predates `b25acdc` (2026-10-14), which corrected seven measured bodies that had been labelled `unmeasured` in the per-body artifact. Read those records as `measured-but-unbounded`; the unmeasured population excludes them. This annotation records the evidence correction without rewriting the locked counts or prose.

### D2 — GM_SUN provenance correction (2026-11-13; audit A4-F09/B2-F04)

The historical OQ-18-5 wording says the numeric value is a DE430 value. The value `1.32712440018e20` is the DE405-era figure; the numeric constant is unchanged, and the core comment carries the additive correction. The old OQ wording remains as history.
```

Additive proof: `git diff -- src/v2/SLICE_18_FOUNDING.md | Select-String '^-'
` prints only `--- a/src/v2/SLICE_18_FOUNDING.md`.

```powershell
[IO.File]::WriteAllText("$PWD\.dispatch-scope", "src/v2/SLICE_18_FOUNDING.md`n")
git add -- src/v2/SLICE_18_FOUNDING.md
$env:ASTER_PROTECTED_OK = "1"; git commit -m "docs(slice18): append audit corrections"; Remove-Item Env:\ASTER_PROTECTED_OK
git checkout -- .dispatch-scope
```

DEVLOG D-6 was committed in `1691d96` and is not pending. All six files in
the status block are intentionally unstaged; none was staged by W12.

## W10 and W11 state

W10 commit `5001a0b` records origin/main `0d31cda`, pre-STATUS tip
`1691d96`, measured lag 14, and bundle names:
`aboutV2-DL_Fcx9X.js`, `compareV2-F3OpNprt.js`,
`porkchopV2-V_mxVt_g.js`, `solarSystemV2-C6dR6zLr.js`.

W11 did not run `npm run build` because the required verify gate halted after
two attempts. Consequently no new docs bundle names are claimed and no
`build(docs): rebuild after Slice 20 text sweep` commit exists. The branch
also still needs Hudson's W6 core hand-commit before CI can pass; that hand
commit must precede any push.

## Final evidence handoff

W12 copies are byte-verbatim and hash-checked:

- `%TEMP%\\s20-text-sweep\\REPORT.md` -> `tools/slice20-research/front-a/sweep-REPORT.md`
- `%TEMP%\\s20-text-sweep\\LOG.md` -> `tools/slice20-research/front-a/sweep-LOG.md`
- `%TEMP%\\s20-text-sweep\\COPY_DIFF.md` -> `tools/slice20-research/front-a/sweep-COPY_DIFF.md`

The evidence commit message is exactly:
`docs(research): Slice 20 text sweep run evidence`.
