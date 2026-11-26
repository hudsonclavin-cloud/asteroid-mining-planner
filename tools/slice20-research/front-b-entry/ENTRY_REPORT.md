# Slice 20 Front B entry gate report

Read-only recon for OQ-20-8, DEC-20-8, DEC-20-9, and DEC-20-1. This report does not lock a GM value, choose a mechanism, or change source code.

## Host and versions

- Host: Windows laptop, worktree `C:\Users\hudso\aster-b0`, branch `s20-b0`, from `b25a37b`.
- Node: `v26.7.0`; npm: `11.19.0`.
- `npm ci`: exit 0. It installed only the repository's normal Node dependencies in the worktree.
- Python: `Python 3.13.12`; executable `C:\Users\hudso\AppData\Local\Programs\Python\Python313\python.exe`.
- pip: `26.2.1`.
- Current interpreter package inventory: `poliastro` not installed; `hapsira` not installed; `astropy` not installed; `numpy 2.5.0` at `C:\Users\hudso\AppData\Local\Programs\Python\Python313\Lib\site-packages`; `scipy 1.18.1` at the same location.
- Existing external oracle environment, not installed in the repository: `C:\Users\hudso\.aster-slice11-venv\Scripts\python.exe`, Python 3.12.10, poliastro 0.17.0, astropy 5.3.4, numpy 1.26.4, scipy 1.17.1.

## GM_EARTH: three routes

| Route | URL | Retrieved UTC | Status | Bytes | SHA-256 | Quoted evidence | Value km³/s² | Value m³/s² | Ephemeris named |
|---|---|---:|---:|---:|---|---|---:|---:|---|
| NAIF kernel | `https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/gm_de440.tpc` | 2026-11-22T05:37:07.712Z | 200 | 12,406 | `924ddf4fb9ead9fe8a1aa55780bcabde40b09d00065d58226e24b68d8092f140` | `BODY399_GM = ( 3.9860043550702266D+05 )` | 398600.43550702266 | 398600435507022.7 | DE440 |
| SSD parameters | `https://ssd.jpl.nasa.gov/astro_par.html` | 2026-11-22T05:43:45.406Z | 200 | 22,489 | `168f48b94ae3a65f31c96f081d08e7ca91ecc9e65678fdc57353821b492b313e` | “These data are from the JPL planetary ephemeris DE440 (ref. 4, below).” Earth row: `Earth` / `398600.435507`; table units: `GM (km³ s⁻²)` | 398600.435507 | 398600435507000 | DE440 |
| DE440 paper, JPL PDF | `https://ssd.jpl.nasa.gov/doc/Park.2021.AJ.DE440.pdf` | 2026-11-22T05:38:10.701Z | 200 | 5,501,569 | `96c3945deb12e0f0843c2bf0703d3542d950cf85ff903b1fe11a501634f68ee0` | Page 5, Table 2 caption: `Planetary Masses Used in DE440 and DE441`. Earth row: `GMEarth 398600.435507 km3 s−2 (estimated from DE440)` | 398600.435507 | 398600435507000 | DE440 / DE441 table; Earth estimate from DE440 |

Supporting raw files are committed under `tools/slice20-research/front-b-entry/raw/`: `gm_de440.tpc`, `ssd-astro-par.html`, `de440-paper.html`, `de440-jpl-page.html`, and `Park.2021.AJ.DE440.pdf`.

Route 1 kernel header/source lines, quoted from `raw/gm_de440.tpc`:

> their DE440 values from gm_de440.pck, and comments reduced to keep just
> "Sources" and "Modification history" sections.
>
> gm_Horizons.pck and gm_de440.pck PCKs were provided Jon Giorgini, SSD/JPL

The JPL publication page at `https://ssd.jpl.nasa.gov/doc/de440_de441.html` was also fetched independently (200, 18,784 bytes, SHA-256 `f10eaeefd62bbabfae26a641233389f5eb93113cf3e5225a840839eccfffa1be`, retrieved 2026-11-22T05:37:57.614Z) and supplied the PDF link. The DOI publisher URL redirected to IOP and returned 403 after the prescribed retry; the JPL-hosted paper PDF is the successful paper route. Its raw 403 response is retained as `raw/de440-paper.html`.

Neither fetched GM source prints an IAU 2015 nominal Earth GM. The SSD page says its otherwise-unqualified data are from the 1994 IAU file of current best estimates; that is context only, not an IAU 2015 nominal value.

## Agreement and sensitivity

Node computed the following using `r_EI = 6,503,136.6 m` and `v_EI = sqrt(v_inf² + 2μ/r_EI)`. Pairwise relative difference below is symmetric: `abs(a-b) / ((a+b)/2)`.

| Pair | Absolute difference km³/s² | Symmetric relative difference |
|---|---:|---:|
| kernel vs SSD | `2.264278009533882e-8` | `5.680570836942936e-14` |
| kernel vs paper | `2.264278009533882e-8` | `5.680570836942936e-14` |
| SSD vs paper | 0 | 0 |

The SSD and paper agree exactly to their printed digits. The kernel agrees with those six decimal places and supplies additional digits. No value is selected here.

| v_inf km/s | v_EI with kernel m/s | v_EI with SSD/paper rounded value m/s | Change m/s | Relative effect |
|---:|---:|---:|---:|---:|
| 0.5 | 11083.191460757947 | 11083.191460757633 | `-3.1468516681343317e-10` | `-2.839301007544922e-14` |
| 3 | 11471.143489461627 | 11471.143489461323 | `-3.0377123039215803e-10` | `-2.6481338209327454e-14` |
| 10 | 14919.35430760386 | 14919.354307603628 | `-2.3283064365386963e-10` | `-1.5605946400455425e-14` |

Maximum relative effect across the requested speeds is `2.839301007544922e-14` in magnitude. This is a sensitivity result, not a ruling.

## Oracle environment

Existing drivers found by searching `tools/slice11-research`, `tools/slice12-research`, and `tools/slice20-research`:

- `tools/slice11-research/measurements/poliastro-grid.py`: reads one JSON payload from stdin and writes JSON to stdout; calls `poliastro.iod.izzo.lambert` with `M=0`, `prograde=True`, `lowpath=True`; no file output in the driver.
- `tools/slice11-research/measurements/multi-rev-dual-oracle.py`: reads JSON from stdin and writes JSON to stdout; its `bulk` mode solves both lowpath branches for the supplied `M`, and its `boundary` mode computes the dense T-min scan and poliastro gate. It uses `DENSE_SCAN_POINTS = 1_000_001` and scipy root/minimum helpers.
- `tools/slice12-research/dla-oracle-grid.py`: reads JSON from stdin and writes JSON to stdout; its `mode` selects the M=0 or multi-revolution path and it calls `poliastro.iod.izzo.lambert`.
- `tools/slice20-research/longrun/lr1-oracle/oracle_driver.py`: header command is `python -I oracle_driver.py <cells.json> <oracle-results.json>`; writes only the caller-supplied results path; runs izzo vectors, vallado M=0, and endpoint closure. No run was made here.
- `tools/slice11-research/measurements/poliastro-validation.mjs`: orchestrates the Slice 11 grid and writes under its `TEMP_OUT_DIR = <repo>/.tmp-tests/slice11-m3`; it points at `~/.aster-slice11-venv/bin/python`, which is not the Windows `Scripts/python.exe` path found here. It was not run.
- `tools/slice12-research/README.md`: MISSING (looked at the requested path; the directory has the driver directly).

Pinned fixture `tests/fixtures/v2/lambert-multi-rev-pinned-cells.json`: 4 cells total, 2 with `M=2`.

The smallest existing mode was run once in scratch space, with no repository output:

```text
Get-Content -Raw -LiteralPath "$env:TEMP\s20-b0\poliastro-m0-input.json" | & "C:\Users\hudso\.aster-slice11-venv\Scripts\python.exe" "tools\slice11-research\measurements\poliastro-grid.py"
exit code: 0
{"ok": true, "cells": [{"depDate": "2028-01-31", "tofDays": 834.8214285714287, "c3": 657.2089709836094, "vInfDep": 25.63608727913855, "vInfArr": 23.35826174984181}]}
```

Positive control: this reproduced the pinned `apophis-M0` Aster values `c3 = 657.208970983609`, `vInfDep = 25.636087279138543`, and `vInfArr = 23.35826174984181` to the printed precision. M=1, M=2, and vallado were not run in this dispatch.

## Kernel code map

### 5.1 Endpoint state providers

- `src/v2/porkchop/grid-compute.ts:57-65` defines injected `getEarthStateAtTdbSeconds(tdbSeconds)` and `propagateTargetStateAtTdbSeconds(bodyElements, tdbSeconds)` providers, plus an injectable Lambert solver.
- `src/v2/porkchop/grid-compute.ts:175-194` fixes the current outbound roles: Earth is read at `departureTdbSeconds` (`:176-179`), the asteroid is propagated at `arrivalTdbSeconds` (`:181-186`), and Lambert receives Earth position as `r1` and asteroid position as `r2` (`:187-194`). The providers are injected, but their semantic roles are not direction-neutral in this implementation.

### 5.2 Per-cell and per-branch velocity data

- `src/v2/porkchop/grid-compute.ts:31-41` keeps both endpoint velocity vectors `v1` and `v2` in each in-memory branch, as well as scalar `vInfDep`, `vInfArr`, and `c3`.
- `src/v2/porkchop/grid-compute.ts:113-132` forms departure v-infinity as `v1 - Earth velocity` and arrival v-infinity as `v2 - asteroid velocity`; it retains both vectors in the returned branch.
- `src/v2/porkchop/porkchop.worker.ts:40-45` changes the message shape to omit `v1`, `v2`, and `dlaDeg` from the worker branch type. `stripBranch` at `:73-85` retains `c3`, `vInfDep`, `vInfArr`, branch, convergence, and `x`; the worker message carries magnitudes, not endpoint or v-infinity vectors.

### 5.3 Worker message contract

- Inbound `init` is `PorkchopWorkerInitMessage` with `earthStateSeries` (`src/v2/porkchop/porkchop.worker.ts:13-16`). Inbound `compute-grid` carries `bodyId`, `bodyElements`, `gridParams`, and one numeric `M` (`:18-24`).
- Outbound messages are `ready`, `error`, and `grid-result`; `grid-result` carries `bodyId`, `M`, stripped cells, and `compute_ms` (`src/v2/porkchop/porkchop.worker.ts:30-58`). There is no direction or endpoint-role field.
- The client initializes with the Earth series (`src/v2/porkchop/porkchop-client.ts:27-30`, `:87-92`) and posts only the current four compute fields plus `M` (`:95-112`).
- Dual-family orchestration sends exactly M=0 then M=1, sequentially (`src/v2/porkchop/dual-m-compute.ts:48-64`).

### 5.4 Earth lookup and bounds

- The worker calls `interpolateBodyStateSeries('earth', earthStateSeries, tdbSeconds)` at `src/v2/porkchop/porkchop.worker.ts:138-139`.
- `src/v2/core/interpolators/hermite.ts:96-107` first checks exact sample equality, then linearly scans adjacent samples for a bracketing interval. `:110-121` fails the interpolation invariant when the requested time is outside the first/last sample range; there is no bisection index.
- `src/v2/porkchop/compare-data.ts:275-289` separately validates the requested outbound departure window against runtime-read `firstSample`/`lastSample` and returns an `out-of-bounds` value rather than clamping. Its own comment at `:92-97` says the current grid reads Earth only at departure.
- The committed Earth fixture has 5,479 Earth records, first JD TDB `2461041.5` and last JD TDB `2466519.5` (the 2026-01-01 through 2040-12-31 span). The current grid does not hardcode `2040-12-31`; the interpolation range check is the runtime guard. The return-leg 2040-12-31 arrival refusal is proposed in `src/v2/SLICE_20_FOUNDING.md:115-120`, not implemented here.

### 5.5 Support-boundary epoch

- `src/v2/porkchop/support-boundary.ts:24-27` models a cell as `depJD` plus `tofDays`; `arrivalJd` at `:44-46` returns their sum.
- `isArrivalAfterEncounter` at `:48-50` compares that arrival epoch with the encounter. `boundaryTofDaysAtDeparture` at `:53-55` solves the arrival boundary curve. This is arrival-based today; the return-leg support rule would need the asteroid departure epoch instead, as proposed by `src/v2/SLICE_20_FOUNDING.md:131-133`.

### 5.6 Earth-specific assumptions

- `src/v2/porkchop/grid-compute.ts:113-128` labels `v1 - Earth velocity` as departure v-infinity and `v2 - asteroid velocity` as arrival v-infinity; `c3` is always the departure v-infinity magnitude squared.
- `src/v2/porkchop/delta-v.ts:3-25` uses an Earth-specific `EARTH_MU_KM3_PER_S2 = 398_600.4418` and LEO parking radius. `:36-56` treats `vInfArr` as rendezvous delta-v and adds a symmetric-return departure burn from the same `vInfArr` for sample-return.
- `src/v2/core/lambert/dla.ts:4-19` computes DLA directly from the departure v-infinity components. The math is vector-generic, but the porkchop naming and UI input make the current use Earth-departure-specific.
- `src/v2/app/porkchop/main.ts:447-451` passes the pinned readout's `vInfArr` into the delta-v stack. The current page therefore assumes the outbound arrival quantity for its rendezvous/return card.

### 5.7 Decisive mechanism question

**PARTLY — HOLD for Hudson.** `src/v2/core/lambert/lambert-multi-rev.ts:276-335` is generic in `r1`, `r2`, `tof`, `mu`, `M`, and `lw`, and no edit under `src/v2/core/lambert/*` is indicated. However, the current grid and worker wiring hard-code Earth at departure and asteroid at arrival at `src/v2/porkchop/grid-compute.ts:175-194` and `src/v2/porkchop/porkchop.worker.ts:132-142`. A production return path needs the porkchop/worker boundary to express the swapped endpoint roles, plus return-aware support/bounds and readout semantics; this is not achieved by merely changing a caller's current four-field worker message. Hudson must rule the mechanism before Front B implementation.

Protected files that would change on the evidence currently found: **none**. The core Lambert function already accepts generic endpoints; the likely changes are outside `src/v2/core/**`.

### 5.8 Recon-derived implementation touch set, no design

- Protected: none identified for the current mechanism; inspected `src/v2/core/lambert/lambert-multi-rev.ts`, `src/v2/core/lambert/dla.ts`, and `src/v2/core/interpolators/hermite.ts`. `src/v2/core/lambert/index.ts` is MISSING (looked in `src/v2/core/lambert/`; no index file exists).
- Porkchop layer: `src/v2/porkchop/grid-compute.ts`, `compare-data.ts`, `support-boundary.ts`, `delta-v.ts`, `dual-m-compute.ts`, `composite-grid.ts`, `segment-windows.ts`, and `porkchop-view.ts`.
- Worker/client: `src/v2/porkchop/porkchop.worker.ts` and `src/v2/porkchop/porkchop-client.ts`.
- App surfaces: `src/v2/app/porkchop/main.ts`; the existing compare caller is `src/v2/app/compare/main.ts`.
- Tests to extend or add: `src/v2/porkchop/grid-compute.test.mjs`, `propagation-guard.test.mjs`, `dual-m-compute.test.mjs`, `delta-v.test.mjs`, `support-boundary.test.mjs`, `tests/v2-symmetric-return.test.mjs`, and the relevant porkchop honesty/runtime tests. No tests were changed in this recon.

## Held items

- **HOLD:** Kernel mechanism is PARTLY injection-capable but current worker/grid semantics are outbound-only; Hudson must rule this before an implementation dispatch.
- **HOLD:** No GM value was selected or locked. The existing `delta-v.ts` Earth constant `398600.4418` differs from all three fetched source values and was not changed.
- The current Python interpreter lacks poliastro, hapsira, and astropy. The only oracle run used the already-existing external Windows venv; no package was installed.
- The DOI publisher route returned HTTP 403 after retry. The official JPL-hosted paper page and its 5.5 MB PDF succeeded and supply the Table 2 evidence.
- `tools/slice12-research/README.md` and `src/v2/core/lambert/index.ts` were not found at the requested/inspected paths.

## Not evaluated

- No M=1 or M=2 oracle execution, no vallado execution, and no full-grid comparison were performed.
- No implementation, source edit, math-layer audit, build, test suite, browser verification, deployment, push, PR, or merge was performed.
- No GM value, tolerance, DEC, or OQ was locked.
