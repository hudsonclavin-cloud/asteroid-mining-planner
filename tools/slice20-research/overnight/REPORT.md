OVERNIGHT: COMPLETE | host Windows 10.0.26200 x64 | node v26.7.0 | python 3.12.10 oracle / 3.14.2 host | poliastro 0.17.0 | origin/main b25a37b
ON1 GM: suite observes Earth GM no (control B) | tests failing under patch A 0: none | max dV change 6.25868210590852e-8 km/s | visible at display precision no
ON2 M=2: cells 480000 | existence disagreements 0 | max |dv_inf_arr| izzo M0/M1/M2 2.0164021072024496e-12 / 2.016414626268222e-12 / 2.015391718802059e-12 km/s | vallado M0 6.018206580500975e-7 km/s default, 9.531501341892306e-9 km/s tight | closure max (>=0.1 AU) 0.00014576278753497868 km | LR1 DIFFERS
ON3 INDEX: nonzero differences 0 of 1,021,915 | speed-up per call 42.105730393004656x | return grid 200x100 linear/index 12.605558099999994/0.2045069000000076 s
ON4 CENSUS: bodies 41906 of 41,906 | zero shown 0.000023862931322483654 | zero shown+screen 0.0741659905502792 | zero shown+support 0.000023862931322483654 | zero shown+both 0.09874480981243736 | best fails screen 0.9628922562939983 | coarse vs full bias 0.046 pp shown+screen and 0.064 pp shown+both

# Slice 20 overnight research report

## Phase 0 and build

The session ran on the Windows laptop because the dispatch pre-waived the cloud-host requirement. The canonical root and origin were verified, `origin/main` was fetched at `b25a37b`, and its first parent matched the STATUS gate. A fresh `s20-overnight-research` worktree was created at `C:\Users\hudso\s20-overnight-store\aster-overnight`. `npm ci` succeeded and `npm run verify` passed 112/112 files, 371/371 tests, 0 failures, and 0 load timeouts. The requested Python 3.12 oracle environment installed poliastro 0.17.0, numpy 1.26.4, astropy 5.3.4, scipy 1.17.1, and numba 0.68.1.

The production research build command was:

```text
node tools/slice20-research/overnight/lib/build.mjs C:\Users\hudso\s20-overnight-store\aster-overnight C:\Users\hudso\s20-overnight-store\build\origin-main
```

The build used the repository's `node_modules/typescript/bin/tsc` through `process.execPath`, compiled 11 entries, and returned `tscStatus=0`. Compiled-entry SHA-256 values from `build-stamp.json` were:

```text
boundary/horizons.ts d2694fe3ec6f509196c6fbc6253ac5b94cbc2db3e1f488c577119835ea8def41
boundary/slice9-nea-catalog.ts 531148a40dcfda9405505158292efa3d7acc98e99f6403d037ebe205ab9a45b4
core/constants/bodies.ts c5aaf892070cc81bf1d26b07f467504edf61340c1f584afe96d4a7e96572a05f
core/units.ts 9b8d9cfea834cdfe34ec38cce77bab5687a60f57d6106bc83dd1edb25f7d5d1d
core/interpolators/hermite.ts 1c2200bd3bdc5b2d1ae4119946fc6e2c0d8e60f2e8b43378e32acf48adc18571
core/propagators/keplerian.ts 7f9db53620104a30d02592974adf5ee141d893e74ffa9c291495ba468863d40d
core/lambert/lambert-multi-rev.ts 7d403bf9bb3242eea539ffd0901c5eee2d414618926f5f728bb8736cb2489a38
porkchop/grid-compute.ts fb593b0df3decbd3ebd68a657d5f02d22eedfd83435feadec325a9f19ef33b1e
porkchop/delta-v.ts 5659836cab260b84c6bd98f1c36d43fe5c3a80b9d0dcf44248dec957fae39f4a
porkchop/support-boundary.ts 9cad89a8706709bd4b811cca69357c28d566806e5e266e77087b69b773364a60
porkchop/propagation-guard.ts 6bdebf2dbcee2259ef351d594a20def0cca0bbf6bc4c0a7d420d8e561e69e565
```

## ON1 — Earth GM

The literal inventory found the V2 constant in `src/v2/porkchop/delta-v.ts:3,20`, legacy Earth-GM literals in `src/physics/constants/index.ts:11`, `src/physics/orbital/patched-conic/index.ts:11,34-35`, and `src/renderer/scene/earth/satellites.ts:46,138`, plus the V2 import/return in `mcp/src/resources/reference.ts:5,141`.

Patch A (`398600.43550702266`) and control B (`398600.4418 * 1.01`) both passed the requested V2, golden, MCP test, and MCP eval commands. The control is a HOLD: the suite does not observe the V2 Earth GM. Across 2,004 records, the one-way total maximum change was `6.25868210590852e-8` km/s and the sample-return total maximum was `6.258676421566634e-8` km/s. The showcase one-way total changed by `2.773707841186024e-8` km/s. The UI renders the stack with `.toFixed(3)` at `src/v2/app/porkchop/main.ts:1034-1048`, so the measured change is not visible.

This workstream does not prove that changing the constant is safe for untested legacy consumers; it measures the V2 outbound stack and records suite observability.

## ON2 — M=0, M=1, M=2 return oracle

The new harness used 100 bodies, 40 × 40 return cells, and the production Sun GM. It compared Aster vectors with poliastro izzo and M=0 Vallado at default and LR1-tight settings. The branch mapping was fixed from Aster's x-sign source and poliastro's `low_path` initial-root selection: left → `lowpath=False`, right → `lowpath=True`.

There were 480,000 generated cells, zero Aster/izzo existence disagreements, and max arrival `v_inf` differences of `2.0164021072024496e-12`, `2.016414626268222e-12`, and `2.015391718802059e-12` km/s for M=0, M=1, and M=2. The independent universal-variable closure covered 295,291 branches; the largest closure miss in the >=0.1-AU bin was `0.00014576278753497868` km. M=2 through-Sun share was `0.028588519727823336`.

The LR1 re-derivation was Aster-bit-identical for 5,920 M=0 and 8,050 M=1 records, with max Aster differences `1.4210854715202004e-14` and `5.684341886080802e-14` km/s. The new izzo maxima were `1.4495071809506044e-12` and `1.5170087408478139e-12` km/s, so the required verdict is **LR1 DIFFERS** against the `1e-12` line. This does not show a production defect; it records a cross-path re-derivation result and keeps the existing oracle comparison visible.

## ON3 — indexed Earth lookup

The indexed implementation retained exact-node, strict-bracket, Hermite, and `INV-008` endpoint behavior. Across 1,021,915 identity cases, all six state components matched exactly (`0` nonzero differences). The four outside-span probes produced identical `AssertError` names and messages. The median warm timing improved from `15446.9672` ms to `366.8613999999943` ms per million calls, `42.105730393004656x`. The 200 × 100 × 20-body × 2-family return reference was `12.605558099999994` s linear versus `0.2045069000000076` s indexed.

This does not measure browser-worker scheduling or a production deployment; it measures the lookup and the specified research grids.

## ON4 — return census

The one seeded order covered all 41,906 bodies. Coarse coverage was 52,382,500 cells with `7,081,945` Earth refusals (`0.1351967737316852`) and `1,593,817` branch-level Sun refusals. The selected best return failed the screen for `0.9628922562939983` of 41,905 bodies with a selected best. The old/new Earth-GM screen recount changed zero cells.

The first 500 bodies were repeated at full resolution. For shown+screen, zero-body share was `0.054` coarse versus `0.008` full, a 4.6 percentage-point difference. For shown+both, it was `0.078` versus `0.014`, a 6.4 percentage-point difference. The full-minus-coarse best-cell `v_EI` difference had median `-0.011579499295132578` km/s and range `-11.521796799207745` to `4.68414400510126` km/s.

This is a screening census, not a locked threshold or a production filter decision. The standalone-grid Earth-refusal share is not comparable to the earlier paired-return 26.5% figure because the population and grid differ by design.

## Held items

- **ON1 Earth GM observability HOLD:** the control B suite was green, so the current tests do not pin the V2 Earth GM constant. Contained in `on1-gm/README.md` and `on1-gm/results.json`; no source change was made.
- **ON2 LR1 re-derivation HOLD:** the requested new-path verdict is `LR1 DIFFERS` because izzo's recorded maxima exceed `1e-12` km/s. Contained in the ON2 summary and dataset; no DEC or threshold was changed.

## Not done

Nothing in the dispatch's four workstreams was skipped. No source, tests, fixtures, founding docs, STATUS, or site files were changed. No push, merge, or deployment was performed.

## Anything surprising

- The first ON4 attempt did not produce evidence because the worker restored Lambert debug logging before computation and indexed the order JSON object instead of its `.order` array. Both defects were diagnosed, corrected, and the full ON4 run was repeated from the same seeded order.
- The catalog contains one elliptical-propagation refusal: `2015 D1` (`bodyIndex=7092`) has `aM <= 0` and was recorded as `RangeError: aM must be > 0 for elliptical Kepler propagation`, not silently discarded.
- `npm run verify` emitted benign runtime fetch warnings for optional cache files and the UI overlay fetch while still passing 112/112 files and 371/371 tests; these were recorded as soft environment noise, not failures.
