# ON4 — Return-leg census

## Method and DEC definitions

The census used the one seeded random order in `order.json` for all 41,906 catalog bodies (`20261125`). Each coarse body used 50 departures × 25 TOF samples over the ON2 spans, and both M=0 and M=1. The first 500 bodies in the same order were repeated at 200 × 100 for the full-resolution control. Fifteen worker processes were used on the 16-core Windows host.

The worker uses the compiled production Keplerian propagator, the production Earth series with Hermite interpolation, and `lambertMultiRev(r1, earthAtArrival, tof, MU_SUN, M, true)`. For return geometry, the asteroid is propagated at departure. Branch selection minimizes asteroid-departure `|v_inf|`, with M=0 retained on exact ties. Earth-arrival-after-2040 cells are `refusedEarth`. A converged transfer with perihelion below 695,700 km and an arc passing perihelion is `refusedSun` at branch level. The support flag follows the dispatch definition: an L1 departure after its encounter date is unsupported, while L2 has no boundary; it is counted, not refused. The Earth-interface screen is `v_EI <= 12` km/s with `r_EI=6503.1366` km and `mu_E=398600.43550702266` km^3/s^2. Recounting with `398600.4418` changed zero cells.

The source contracts used for interpretation are `src/v2/core/lambert/lambert-multi-rev.ts:276-335` for M and branch solving, `src/v2/porkchop/support-boundary.ts:29-50` for tier boundary behavior, and `src/v2/porkchop/grid-compute.ts:175-194` for the production Lambert argument order. `census.mjs` checkpoints every 500 bodies and resumes from the JSONL result file. `summarize.mjs` writes the aggregate and independently gzip-compressed per-body table parts.

## Coarse results

- Bodies: `41906`; cells: `52382500`; `refusedEarth`: `7081945` (`0.1351967737316852` of all cells); branch-level `refusedSun`: `1593817`.
- Zero shown bodies: `0.000023862931322483654`; zero shown+screen: `0.0741659905502792`; zero shown+support: `0.000023862931322483654`; zero shown+both: `0.09874480981243736`.
- The selected best return failed the screen for `0.9628922562939983` of bodies with a selected best (`41905` bodies). The distribution of per-body shown-cell screen share had median `0.011152416356877323`, p95 `0.0841813135985199`, min `0`, and max `0.3348751156336725`.
- The old/new Earth-GM recount changed `0` cells.
- One catalog body, `2015 D1` (`bodyIndex=7092`, L0), was recorded with `propagationRefused: RangeError: aM must be > 0 for elliptical Kepler propagation`; it has no shown cell and is retained in the per-body table rather than being silently dropped.

By tier, the zero shown / zero shown+screen / zero shown+support / zero shown+both shares were:

- L2 (`31745` bodies): `0 / 0.09100645770987557 / 0 / 0.09100645770987557`; best fails screen `0.983493463537565`.
- L1 (`10150` bodies): `0 / 0.021477832512315272 / 0 / 0.12295566502463054`; best fails screen `0.898423645320197`.
- L0 (`11` bodies): `0.09090909090909091 / 0.09090909090909091 / 0.09090909090909091 / 0.09090909090909091`; best fails screen `1`.

## Full-resolution control

For the same first 500 bodies, coarse versus full zero-body shares were:

- shown: `0` versus `0`;
- shown+screen: `0.054` versus `0.008`;
- shown+support: `0` versus `0`;
- shown+both: `0.078` versus `0.014`.

The full-minus-coarse selected-best `v_EI` difference distribution over 500 paired bodies had min `-11.521796799207745`, median `-0.011579499295132578`, p95 `1.2273370067419158`, and max `4.68414400510126` km/s. The control shows a substantial coarse-grid bias for narrow screen-passing regions; it is not a replacement for a production-resolution result.

## REPORT section text

ON4 CENSUS: bodies **41906 of 41,906**; zero shown **0.000023862931322483654**; zero shown+screen **0.0741659905502792**; zero shown+support **0.000023862931322483654**; zero shown+both **0.09874480981243736**; best fails screen **0.9628922562939983**; coarse vs full bias **0.054−0.008 = 0.046 (4.6 percentage points) for shown+screen, and 0.078−0.014 = 0.064 (6.4 percentage points) for shown+both** on the first 500 bodies. Standalone-grid Earth refusal was `0.1351967737316852` of cells; this is not the earlier paired-return `26.5%` measurement because the grid and refusal population differ by design.
