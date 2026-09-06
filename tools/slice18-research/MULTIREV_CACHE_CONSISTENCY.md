# MEASUREMENT — Front A: multi-rev solver consistency (cache M=0 vs live porkchop M=1)

Dispatch 2026-08-24 "FRONT A MEASUREMENT: MULTI-REV SOLVER CONSISTENCY" + Hudson ruling 2026-08-26 (run Step 1.2, then Q1 scoped to the porkchop's own grid; skip Q2/Q3) · executed against repo HEAD `46ff00f` · Repo READ-ONLY; outputs outside the repo.

**Reproduce:** `node C:\Users\hudso\Documents\aster-slice18\multirev-consistency.mjs`
(compiles the repo's own modules with the repo's tsc into `build-v2m\` outside the repo; writes `multirev-consistency-results.json` alongside).

---

## 1. Premise confirmation (Step 1.1) — (a) and (b) TRUE, (c) FALSE

**(a) izzo `lambert` is single-revolution only — TRUE.** `src/v2/core/lambert/izzo.ts:67` `const M = opts.M ?? 0;`, then izzo.ts:77-82 verbatim:
```ts
    if (M !== 0) {
        return {
            ok: false,
            reason: 'multi_rev_not_supported',
        };
    }
```
Comment izzo.ts:72-76: *"Slice 10 supports single-revolution transfers only (DEC-2). Multi-rev support (M >= 1) is deferred to Slice 11+."*

**(b) The cache generator uses izzo, not `lambertMultiRev` — TRUE.** `tools/build/precompute-lambert-screen.mjs:72` `const { lambert } = await importJs('core/lambert/izzo.js');`; call at :257-262 passes **four arguments** (no `opts`), so `M = 0`.

**(c) "live porkchop worker uses `lambertMultiRev` with M in {0,1,2}" — FALSE as stated; this is the tripwire that halted the original dispatch.**
- It uses `lambertMultiRev`: true (`grid-compute.ts:163` default solver; call `grid-compute.ts:187-194`).
- `lambertMultiRev` *validates* `M ∈ {0,1,2}` and throws `RangeError` otherwise (`lambert-multi-rev.ts:284-286`) — an accepted domain, **not an iteration**.
- **The live porkchop page passes `M: 1`, a fixed constant** (`src/v2/app/porkchop/main.ts:916`), forwarded unchanged by `porkchop-view.ts:583`. M is never iterated. The page discloses it: *"M=1 transfer search…"* (`porkchop/main.ts:594`) and the chart title renders `(M=${props.M})` (`porkchop-view.ts:846-847`).
- **Consequence — disjoint families.** With `M=1`, `lambertMultiRev` skips the `if (M === 0)` early-return block entirely (`lambert-multi-rev.ts:298-313`) and computes only the left/right **1-revolution** branches (:324-330). The cache sees only M=0; the porkchop sees only M=1. Neither is a superset of the other.
- **Branch-selection clarification.** The 6th parameter is *named* `lw` but is *consumed* as `prograde` (`lambert-multi-rev.ts:276-291` → `buildGeometry(r1, r2, prograde)` at :50, :83-87); `grid-compute.ts:193` hardcodes `true`. izzo also defaults `prograde = true` (izzo.ts:68). Long-way/short-way is never selected anywhere; the multi-rev "branches" are **left/right** (the two x-roots for a given M).

**Surface → data-source map.**

| surface | source | solver | revolutions | grid |
|---|---|---|---|---|
| catalog-list badge + minC3 (`row.ts:145`, `panel.ts:66-68`) | `lambert-screen-cache.json` | izzo | **M=0 only** | dep 7 d, 2026-01-01→2040-12-31; TOF 182–1826 step 30 d |
| `/v2/porkchop/` | live compute | `lambertMultiRev` | **M=1 only** | 200×100, dep 2026-01-01→**2040-01-01**, TOF 182.5–1826.25 |
| `/v2/compare/` | live compute (+ cache for the DEC-17-5a threshold read) | `lambertMultiRev` | **M=0** (`compare/main.ts:895`) | 731×100 per DEC-17-2 (not re-verified in code) |

## 2. Step 1.2 — cross-solver agreement at M=0: **BIT-IDENTICAL**

Eros (`asteroid-433`) cached best cell — dep 2032-06-10, TOF 272 d — solved by both solvers at M=0 on identical endpoint states:

| | izzo `lambert` | `lambertMultiRev` (M=0) |
|---|---|---|
| C3 (km²/s²) | 1.62443397701735 | 1.62443397701735 |
| vInfDep (km/s) | 1.2745328465823664 | 1.2745328465823664 |
| vInfArr (km/s) | 6.655866629635761 | 6.655866629635761 |
| root x | −0.23940178501453757 | −0.23940178501453757 |
| branch | (single-rev) | `'single'`, 1 branch |

**Differences: ΔC3 = 0 exactly; Δv1 = [0,0,0]; Δv2 = [0,0,0]; relative diff 0.000e+0 on every quantity.** The two solvers are numerically indistinguishable where their domains overlap (both take the `initial_guess_single_rev` + `householder` path at M=0). No tripwire.

**Therefore: solver identity is NOT a source of divergence between the surfaces.** Any divergence comes from the revolution family (M=0 vs M=1) and the grid, not from which solver is used.

## 3. Reproduction gate (stated BEFORE comparison numbers) — PASSED

Gate A, cache reproduction on the **cache's** parameters (izzo, M=0), against the committed cached record for `asteroid-433`:

| quantity | recomputed | cached | relative diff |
|---|---|---|---|
| minC3 | 1.62443397701735 km²/s² | 1.6244339770173506 | **4.101e-16** |
| vInfDep | 1.2745328465823664 km/s | 1.2745328465823667 | 1.742e-16 |
| vInfArr | 6.655866629635761 km/s | 6.655866629635761 | **0 (exact)** |

**Tolerance achieved: ≤ 4.1e-16 relative (machine epsilon).** (The prior dispatch additionally verified full-grid argmin reproduction < 1e-9 for five bodies.)

## 4. Sample (n = 13) — selection criteria and list

Pool: cache bodies with a solved status, non-null minC3, present in the catalog, and `e < 1` (the propagator requires elliptical elements, `keplerian.ts:59-61`). Criteria per the Front A dispatch Step 2.2: prior-measurement continuity, cached TOF near the upper end, HIGH-C3 badges, and a semi-major-axis spread. Ties broken deterministically by bodyId.

| body | e | a (AU) | U | cached minC3 (km²/s²) | cached badge | cached TOF (d) | why selected |
|---|---|---|---|---|---|---|---|
| 433 (Eros) | 0.2229 | 1.458 | 0 | 1.6244 | low | 272 | prior-measurement continuity |
| 163693 (Atira) | 0.3222 | 0.741 | 0 | 7.1914 | low | 182 | continuity |
| 2017 UR52 | 0.9964 | 353.30 | 6 | 1462.95 | high | 1802 | continuity |
| 1979 XB | 0.7109 | 2.225 | 9 | 2.4063 | low | 242 | continuity |
| 99942 (Apophis) | 0.1911 | 0.922 | 0 | 0.00020641 | low | 212 | continuity |
| 12P | 0.9546 | 17.185 | 0 | 164.25 | high | 1802 | cached TOF near upper end |
| 2025 VP | 0.8827 | 8.607 | 5 | 168.21 | high | 1802 | cached TOF near upper end |
| 2022 BG4 | 0.8877 | 9.988 | 7 | 169.81 | high | 1802 | cached TOF near upper end |
| 2018 AB13 | 0.4837 | 2.517 | 0 | 25.044 | high | 632 | HIGH badge, lowest above threshold |
| 2021 CG6 | 0.7156 | 2.119 | 1 | 37.737 | high | 302 | HIGH badge, median |
| 2014 PP69 | 0.9409 | 21.429 | 5 | 1993.3 | high | 1802 | HIGH badge, highest |
| 2021 PH27 | 0.7115 | 0.462 | 2 | 6.1271 | low | 182 | a: minimum in pool |
| 2024 UQ6 | 0.3720 | 1.683 | 8 | 0.91627 | low | 302 | a: median in pool |

Grid used (the live porkchop's own, `porkchop/main.ts:181-188`): dep **2026-01-01 → 2040-01-01**, step **25.693 d** (nDep 200); TOF **182.5–1826.25 d**, step **16.604 d** (nTof 100) — **20,000 cells per body per family**. Computed with the production `computePorkchopGrid` (`grid-compute.ts:157`) and the worker's own dependency wiring (`porkchop.worker.ts:138-141`).

## 5. Per-body results — M=0 vs M=1 on the porkchop grid

All C3 in km²/s². "M1 blank" = cells `no_solution` under M=1 that have a valid (`ok`) M=0 solution.

| body | cached (badge) | M=0 minC3 | M=1 minC3 | winner | M1 blank / 20,000 | M=0 implies | M=1 implies |
|---|---|---|---|---|---|---|---|
| 433 | 1.6244 low | 1.75219 | 2.20863 | **M0** | 4,781 (23.9%) | low | low |
| 163693 | 7.1914 low | 8.44757 | 8.50891 | **M0** | 2,035 (10.2%) | low | low |
| 2017 UR52 | 1463.0 high | 1486.34 | **none** | M0 (M1 empty) | 20,000 (100%) | high | **no solution** |
| 1979 XB | 2.4063 low | 3.15148 | **0.709863** | **M1 (4.44× better)** | 12,090 (60.5%) | low | low |
| 99942 | 0.00020641 low | 0.00117489 | 0.00277833 | **M0** | 2,523 (12.6%) | low | low |
| 12P | 164.25 high | 172.261 | **none** | M0 (M1 empty) | 20,000 (100%) | high | **no solution** |
| 2025 VP | 168.21 high | 205.954 | **none** | M0 (M1 empty) | 20,000 (100%) | high | **no solution** |
| 2022 BG4 | 169.81 high | 187.900 | **none** | M0 (M1 empty) | 20,000 (100%) | high | **no solution** |
| 2018 AB13 | 25.044 high | 24.9662 | **11.5389** | **M1 (2.16×)** | 12,010 (60.1%) | **low** ✳ | **low** ✳ |
| 2021 CG6 | 37.737 high | 39.5449 | **21.1986** | **M1 (1.87×)** | 11,569 (57.8%) | high | **low** ✳ |
| 2014 PP69 | 1993.3 high | 1979.35 | **none** | M0 (M1 empty) | 20,000 (100%) | high | **no solution** |
| 2021 PH27 | 6.1271 low | 7.25354 | **5.67624** | **M1 (1.28×)** | 1,447 (7.2%) | low | low |
| 2024 UQ6 | 0.91627 low | 0.873020 | **0.534322** | **M1 (1.63×)** | 6,326 (31.6%) | low | low |

✳ = implied feasibility differs from the cached badge.

Supporting facts: **0 cells** anywhere in the sample were `ok` under M=1 but not under M=0 — M=1's cell coverage is a strict subset of M=0's here. **0 stall cells** in either family. Mechanism for the blanks: `lambertMultiRev` returns `null` when `T < TMin` for M=1 (`lambert-multi-rev.ts:319-322`) — the TOF cannot fit an extra revolution — and `computePorkchopGrid` marks such cells `no_solution` (`grid-compute.ts:196-207`).

## 6. Counts and largest improvement (Step 4)

Of **13** bodies tested:
- **5 (38.5%)** — `2017 UR52`, `12P`, `2025 VP`, `2022 BG4`, `2014 PP69` — have **no M=1 solution in any of the 20,000 cells**: the live porkchop grid is entirely empty while the catalog badge shows a cached HIGH-C3 value from M=0. All five are high-eccentricity (0.88–0.996), large-semi-major-axis (8.6–353 AU) bodies.
- **5 (38.5%)** — M=1 finds a **lower** minC3 than M=0 on the same grid.
- **3 (23.1%)** — M=0 lower.
- **Implied feasibility differs from the cached badge: 7 of 13 (53.8%) for the M=1 grid** (5 "no solution" + 2 high→low flips), and **1 of 13 (7.7%) for the M=0 grid** (`2018 AB13`, a threshold straddle: cached 25.044 vs grid 24.966 against the 25 km²/s² line — same solver and same family as the cache, so this one is a *grid-sampling* difference, not a revolution-family effect).
- Blank-cell fraction where M=1 solves at all: **7.2%–60.5%** of the grid.

**Largest improvement: `asteroid-1979 XB` — M=1 minC3 0.7098626241284557 km²/s² vs M=0 3.151477050001412 km²/s² (4.44× lower; ΔC3 = −2.4416144258729564).**
- M=0 optimum: dep **2029-03-02** (JD 2462197.706830892), TOF **248.914 d**, vInfDep 1.775239997859842 km/s, vInfArr 26.39196811750089 km/s, branch `single`; 20,000/20,000 cells `ok`.
- M=1 optimum: dep **2028-04-02** (JD 2461863.6917555146), TOF **580.985 d**, vInfDep 0.8425334557917897 km/s, vInfArr 24.863714606185546 km/s, branch `left`; 7,910/20,000 cells `ok`.

Note the two optima are **different missions**, not a refinement of one: they differ by ~11 months in departure and ~332 days in flight time, and the M=1 solution's lower departure energy comes with a still-very-high arrival v∞ (24.86 km/s). (Full per-cell optima for every body are in `multirev-consistency-results.json` under `bodies.<id>.M0.at` / `.M1.at`.)

**Badge-flipping case worth naming: `asteroid-2021 CG6`** — cached badge HIGH (37.737); the M=0 grid agrees (39.545, HIGH); the M=1 grid the porkchop actually renders finds **21.199 — below the 25 km²/s² feasibility threshold**.

## 7. Limitations

1. **Sample coverage: 13 of 41,906 bodies (0.031%).** The counts above are properties of this sample, chosen deliberately to span extremes — **they are not catalog-wide rates and must not be quoted as such.** The 38.5% "empty M=1 grid" figure in particular is inflated by design: four of the five empty bodies were selected *because* their cached TOF sat at the upper end or their badge was HIGH.
2. **The porkchop grid is not the cache grid.** It differs in departure step (25.693 d vs 7 d), TOF step (16.604 d vs 30 d) and span (ends 2040-01-01 vs 2040-12-31). M=0-grid vs cached differences therefore measure **grid sampling only** — the solver and revolution family are identical (§2) — consistent with DEC-17-2's recorded finding that the 200-column view grid returns systematically worse minima. Most M=0 grid minima here are indeed worse than cached; `2018 AB13` and `2024 UQ6` are better, attributable to the porkchop's finer TOF sampling.
3. **The TOF range bounds which multi-rev solutions are reachable by construction.** M=1 requires TOF ≥ T_min for one full extra revolution; for large-a/high-e bodies no TOF in 182.5–1826.25 d qualifies, which is exactly why five grids are empty. A different TOF ceiling would change these results.
4. **M=2 was not tested.** `lambertMultiRev` accepts it, but no shipped surface passes M=2, so it is outside what either surface displays.
5. **"Implied feasibility" is a comparison, not a shipped computation.** No shipped surface recomputes a badge from a live grid; the badge is cache-only. The `low`/`high` columns apply the 25 km²/s² threshold (`precompute:90`, cache metadata) to the grid minima to answer the dispatch's question — they do not describe a badge any code emits.
6. **No perturbed or integrated truth is involved.** This measures self-consistency between two repo code paths, not accuracy against reality.

## 8. Assumptions and everything not determinable

Assumptions: minC3 per family = the minimum over `status === 'ok'` cells of the selected branch's `c3` (mirroring `resolveSelectedBranch`, `grid-compute.ts:139-155`); `utcMidnightToJdTdb` was **mirrored verbatim** from `porkchop/main.ts:169-179` rather than imported because it is page-local with no export (a date helper, not astrodynamics math); calendar labels are display-only conversions of TDB JDs.

Not determinable from this measurement:
- What fraction of the **full 41,906-body catalog** has an entirely empty M=1 porkchop grid, or a badge-vs-porkchop feasibility disagreement. A full sweep is computationally feasible (13 bodies × 2 families × 20,000 cells ran in well under a minute) but was out of scope for this ruling.
- What the porkchop page **renders** when the grid is entirely empty (blank chart, an empty-state message, or an error) — the empty-state rendering path was not inspected.
- Whether the compare page's 731×100 M=0 grid reproduces the cache's M=0 minima (that was Q2, explicitly skipped).
- Whether any M=2 solution would beat both families.

## 9. Artifacts

- Script: `C:\Users\hudso\Documents\aster-slice18\multirev-consistency.mjs`
- Raw results: `C:\Users\hudso\Documents\aster-slice18\multirev-consistency-results.json`
- Out-of-repo build: `C:\Users\hudso\Documents\aster-slice18\build-v2m\`
- This file: `C:\Users\hudso\Documents\aster-slice18\MULTIREV_CACHE_CONSISTENCY.md`

No file inside the repository was created or modified; no network call was made (every input is a committed repo file).
