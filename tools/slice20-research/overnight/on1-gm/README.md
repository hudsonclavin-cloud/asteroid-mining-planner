# ON1 — Earth GM unification impact

## Method

This workstream ran in the throwaway clone `aster-tmp-on1`, based on `origin/main` at `b25a37b`. The inventory was made with a literal search across `src/` and `mcp/`. Patch A changed only `src/v2/porkchop/delta-v.ts:3` from `398600.4418` to the proposed DE440 value `398600.43550702266` km^3/s^2. Control B changed the same constant to `398600.4418 * 1.01`.

Both patched trees ran `npm run verify`, the V2 golden launch-vehicle test, `npm --prefix mcp ci`, `npm --prefix mcp test`, and `npm --prefix mcp run eval`. Patch A and control B were green. The control therefore establishes a HOLD: the tested suite does not observe this Earth GM constant, so Patch A's green result does not pin Earth GM behavior.

Production modules were compiled with the overnight `lib/build.mjs` helper. The numeric comparison used the outbound delta-v stack returned by `delta-v.ts` for the pinned 2020 FK3 showcase, every cell in `tests/fixtures/v2/lambert-multi-rev-pinned-cells.json`, and 2,000 seeded random converged outbound cells (`20261125`). Full numeric output is in `results.json`.

## Inventory

- `src/v2/porkchop/delta-v.ts:3,20` — V2 `EARTH_MU_KM3_PER_S2` declaration and use.
- `src/physics/constants/index.ts:11` — legacy `GM_earth = 3.986004418e14` m^3/s^2.
- `src/physics/orbital/patched-conic/index.ts:11,34-35` — legacy `398600.4418` km^3/s^2.
- `src/renderer/scene/earth/satellites.ts:46,138` — legacy `3.986e14` m^3/s^2.
- `mcp/src/resources/reference.ts:5,141` — imports and returns the V2 constant; no separate literal.

## Measured results

For the 2,004 records (showcase, pinned cells, and seeded random cells), the maximum absolute changes in the one-way stack were: injection `5.689702220479376e-8` km/s, subtotal `5.689707904821262e-8` km/s, margin `5.689713589163148e-9` km/s, and total `6.25868210590852e-8` km/s. The sample-return total maximum was `6.258676421566634e-8` km/s. Rendezvous, departure, and stationkeeping were unchanged.

The pinned 2020 FK3 showcase total changed from `14.379876825911262` to `14.379876798174184` km/s (one-way), and from `25.014862254542813` to `25.014862226805736` km/s (sample-return). The UI renders stack values with `.toFixed(3)` in `src/v2/app/porkchop/main.ts:1034-1048`; no measured change is visible at that display precision.

## REPORT section text

ON1 GM: suite observes Earth GM **no (control B was also green; HOLD)**; tests failing under Patch A **0**; max dV change **6.25868210590852e-8 km/s**; visible at display precision **no**. The result is a sensitivity measurement, not evidence that the current suite pins the constant.
