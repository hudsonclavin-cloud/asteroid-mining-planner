# MEASUREMENT — NEA two-body propagation drift vs JPL-integrated truth (Front B, Phase 3)

Slice 18 (Screening Fidelity), Front B · executed 2026-09-06 by Claude Code against repo HEAD `0d927e4` · repo READ-ONLY; all scripts and results live outside the repo.

**Reproduce:**
`node C:\Users\hudso\Documents\aster-slice18\nea-drift-measure.mjs` (drift, anchors, CAs, verifications → `nea-drift-results.json`)
`node C:\Users\hudso\Documents\aster-slice18\nea-argmin-consequence.mjs` (step 10 → `nea-argmin-consequence-results.json`)

Truth: `tests/fixtures/v2/nea-drift-truth-2026-2046.json` (committed `0d927e4`; ICRF, Sun body-center, TDB, km, km/s, verified per body from the response headers). Math: the repo's own `propagateKeplerianStateVectors`, `cartesianToElements`, `computePorkchopGrid`, `compositeGrids`, `interpolateBodyStateSeries`. No external astrodynamics library. No frame rotation introduced anywhere.

---

## ⚠️ LIMITATIONS — read first

1. **20 bodies against 41,906 (0.048%), deliberately selected** to span condition code, orbit class, eccentricity, encounter geometry, and anchor source. Distributions here are **not catalog rates** and must never be quoted as such.
2. **Comets (12P, 3D, 323P) are a separate band and are never averaged with the NEAs.** INV-014 already tags them not-kepler-safe.
3. **The truth is JPL's orbit *solution*, numerically integrated.** This measurement captures **model error** (two-body vs full dynamics on the same solution). It **cannot** measure *solution* error — how far JPL's orbit is from the real object — which is exactly what condition code U claims to bound. Worse, the catalog's `horizons-reanchor` step derived its elements *from* Horizons states, the same source as this truth, so solution-error differences between bodies were erased before this measurement began. Statements about U below are statements about model error only.
4. **Interpolation floor (step 10 only).** The truth cadence is 7 days; hermite interpolation of near-perihelion motion is poor for the three smallest-perihelion bodies. Measured leave-one-out (14-day-gap, an upper bound; production 7-day error ≈ 16× smaller): 105140 ≤ 7.3M km, 2025 KP4 ≤ 13.3M km, 323P ≤ 22.2M km near perihelion; everything else ≤ ~0.3M km and mostly ≤ ~50k km. **Step-10 fine-scale numbers for 105140 and 2025 KP4 are below their noise floor and are reported as unresolved.** The drift measurement itself (A/B) evaluates at exact truth epochs and is unaffected.
5. **The 2029-04-13 Apophis encounter distance in this fixture is the nominal JPL solution** (38,011 km). Post-encounter two-body drift is extraordinarily sensitive to the encounter geometry; the numbers are for the nominal orbit.
6. Anchor-dependence results (§6) are a **methodological control**: 41,539 of 41,906 catalog bodies share the single element epoch JD 2461161.5 (2026-05-01). Anchor variation is not a property the catalog actually has.

## 1. Sanity gate — PASSED (blocking, run first)

Elements derived from each body's first truth record, propagated to that same epoch, differenced: worst **8.9e-5 km (9 cm, body 2017 UR52)**; every other body ≤ 6.7e-6 km. All sub-metre → element derivation, units, and frames are sound. (Anchor round-trip at the primary and mid anchors also sub-metre.)

## 2. Measurement A — two-body drift from truth-derived elements @ 2026-04-30 anchor (km)

Anchor = truth sample JD 2461160.5, one day before the catalog's mass element epoch. "2040" = last-departure horizon (sample 2040-12-27); "2046" = last consumed arrival (2046-01-01). Backward column = propagated *backward* to 2026-01-01 (−120 d), the direction every early-window departure requires. **First measurement of backward two-body drift on asteroids:** it is benign — 1.3k–36k km, comparable to 4 months of forward drift; forward/backward asymmetry at these horizons is unremarkable.

| body | class·U | bwd→Jan26 | +1y | +5y | +10y | 2040 | 2046 | max (when) |
|---|---|---|---|---|---|---|---|---|
| 433 | AMO·0 | 1.3k | 22.7k | 67.8k | 238k | 263k | 266k | 620k (2045-06) |
| 99942 | ATE·0 | 2.2k | 47.9k | 292.1M | 130.0M | 71.4M | 307.8M | **325.8M** (2042-08) |
| 105140 | ATE·0 | 3.5k | 26.7k | 44.0k | 79.0k | 78.6k | 105k | 1.05M (2043-12) |
| 163693 | IEO·0 | 3.1k | 9.0k | 356k | 920k | 1.81M | 1.64M | 2.83M (2045-08) |
| 1979 XB | APO·9 | 5.1k | 16.4k | 433k | 2.84M | 4.93M | 11.5M | 26.8M (2043-03) |
| 2017 UR52 | AMO·6 | 10.9k | 91.5k | 1.87M | 3.94M | 4.37M | 8.04M | 8.04M (end) |
| 2025 VP | APO·5 | 4.5k | 61.4k | 3.23M | 10.2M | 19.8M | 42.0M | 42.0M (end) |
| 2022 BG4 | AMO·7 | 11.8k | 110k | 2.80M | 7.70M | 13.3M | 28.1M | 28.1M (end) |
| 2014 PP69 | AMO·5 | 11.3k | 95.0k | 1.94M | 4.00M | 4.70M | 8.68M | 8.68M (end) |
| 2021 CG6 | APO·1 | 35.6k | 354k | 730k | 578k | 1.73M | 5.50M | 5.50M (end) |
| 2010 KD | AMO·0 | 3.0k | 19.2k | 204k | 140k | 71.0k | 253k | 462k (2032-04) |
| 2019 SE9 | APO·5 | 7.4k | 101k | 912k | 1.69M | 1.62M | 6.68M | 6.68M (end) |
| 2024 BB8 | AMO·9 | 3.6k | 56.1k | 231k | 959k | 2.35M | 4.48M | 5.71M (2045-07) |
| 2025 KP4 | ATE·9 | 5.8k | 10.8k | 30.6k | 1.20M | 1.07M | 9.40M | 10.6M (2045-03) |
| 2012 UE34 | APO·0 | 2.3k | 86.2k | 1.53M | 6.68M | 14.3M | 164.4M | 164.4M (end) |
| 2025 HH | ATE·5 | 3.0k | 65.3k | 81.1k | 1.18M | 3.77M | 18.4M | 18.4M (end) |
| 2026 BX8 | APO·8 | 9.7k | 160k | 15.7M | 38.7M | 67.8M | 71.9M | 269.4M (2044-12) |
| — comet band — |
| 12P | HTC·0 | 9.2k | 78.8k | 1.70M | 4.57M | 5.71M | 10.3M | 10.3M (end) |
| 3D | JFC·– | 7.2k | 64.3k | 2.44M | 2.96M | 2.32M | 1.43M | 17.2M (2038-07) |
| 323P | JFC·– | 94.0k | 6.84M | 6.62M | 37.8M | 91.2M | 365.9M | 396.5M (2045-12) |

**Growth shapes** (from the data): near-linear-with-oscillation for quiet bodies (433, 105140, 2010 KD — the planet-like signature); monotonic steepening for high-e large-a bodies (2025 VP, 2022 BG4, 2014 PP69, 2017 UR52 — aphelion perturbation accumulation); **step-then-saturate/oscillate for encounter bodies** (99942: 48k → 292M across 2029, then phase-lapping oscillation between ~70M and ~326M — two orbits with different periods lapping each other; the sanity ceiling is the ~2 AU maximum separation of two ~1 AU orbits, and 326M km ≈ 2.2 AU sits exactly there).

## 3. Measurement B (ADDED) — the catalog's own elements: the shipped screen's actual error

For `horizons-reanchor` bodies (16 of 17 NEAs), **B ≈ A within ~1%** and B at the anchor epoch is 0.1–3.5 km — expected, because the catalog's elements were derived from a Horizons state at 2026-05-01, the same source as this truth. The A results above therefore ARE the shipped screen's error for 99.1% of the catalog. Differences that matter:

| body | anchorSource | B @window start | B max | note |
|---|---|---|---|---|
| 2026 BX8 | **sbdb** | 2.3k | 270.4M | SBDB fit differs from Horizons truth by **3.7 km at its own epoch** — provenance is a negligible initial offset; the drift is dynamics (aphelion 5.22 AU, Jupiter-crossing; [Likely] Jupiter-driven — the 0.1 AU CAD cutoff would not label a Jupiter approach). n=1: suggestive, not generalizable. |
| 12P | stale (2023) | 207k | 7.0M | 2.6 years of pre-window propagation |
| 323P | stale (2021) | 1.27M | 409.2M | ~5 years pre-window + q=0.039 AU sungrazer |
| 3D | stale (**1832**) | **253.3M** | 389.7M | 194 years of pre-window propagation: the screen's 3D positions are ~1.7 AU wrong **at the window's first day**. Historical note [not measured here]: 3D/Biela disintegrated in the 1840s–50s; Horizons still integrates the 1832 orbit, so even "truth" here is the ghost of a destroyed object. |

## 4. Close approaches — the decisive driver

**An encounter changes velocity, not position, so the honest metric is the drift *growth-rate* change across it, not a one-week before/after ratio** (a week-scale jump appears only when pre-encounter drift is small compared to the kick — Apophis; for 2012 UE34 the kick vector initially even *reduced* the 16M km gap by 0.1%).

| body | encounter | rate before | rate after | ratio |
|---|---|---|---|---|
| **99942** | **2029-04-13 Earth, 38,011 km, v_rel 7.42 km/s** | ~44 k/yr | **~226 M/yr** | **~5,200×** |
| 2012 UE34 | 2041-04-08 Earth, 109,649 km, v_rel 6.12 km/s | 2.7 M/yr | 39.9 M/yr | **15×** |
| 2025 HH | 2045-04-18 Earth, 126,825 km (window edge) | ~0.2 M/yr | ≥12 M/yr (one sample) | ≥60× (edge-limited) |

Immediate-bracket numbers for Apophis: 33.5k km at the sample before → 1.20M km at the sample after (**36× in seven days**), consistent with the ~28° nominal deflection (δv ~2–3 km/s × 6 days ≈ 1.3M km). Distant approaches (≥5M km: 163693–Venus, 2019 SE9–Earth, 2012 UE34's 2034 pass) produce **no measurable rate change** (ratios 0.95–1.06). The cliff between "encounter matters" and "doesn't" sits somewhere between ~0.4M km and ~5M km in this sample.

## 5. Band counts (vs the planet floor 10⁵ km and the argmin-moving regime 10⁶ km)

Max drift over the consumed window (2026→2046), **NEA band (17)**:

| band | count | bodies |
|---|---|---|
| stays < 10⁵ km | **0** | — |
| 10⁵–10⁶ km | **2** | 433 (620k), 2010 KD (462k) |
| ≥ 10⁶ km | **15** | everything else; 3 exceed 10⁸ (99942, 2012 UE34, 2026 BX8) |

**Comet band (3):** all ≥ 10⁶ (12P 10.3M; 3D 17.2M model-error / 389.7M as-shipped; 323P 396.5M).

**Answer to Front B's founding question:** real NEAs sit **beyond** the planet floor — every sampled NEA exceeds it, 15/17 reach the 10⁶ regime where synthetic perturbation began moving argmins, and encounter bodies blow through it by two more orders of magnitude. The planet floor was indeed a floor, low by 1–3 orders.

## 6. Anchor dependence — methodological control ONLY

Mid-window anchor (2035-12-24): drift at matched elapsed time differs from the 2026 anchor by up to **~5,200× where an encounter sits between the anchors** (99942 fwd 5y: 55.7k from the post-encounter anchor vs 292.1M from the pre-encounter anchor; 2012 UE34 fwd 5y: 183k vs bwd 5y 4.8M across its 2041 encounter). For encounter-free spans, anchors agree within a factor ~2–8. **Elapsed time does not predict drift; encounter *crossings* do.** Since 99.1% of the catalog anchors at one epoch (2026-05-01), the planet run's 12× anchor sensitivity must not be read as a catalog property — the catalog-relevant statement is: drift is small until the first significant encounter after 2026-05-01 and effectively unbounded after it.

## 7. Q — condition code does NOT track propagation error (the more consequential result)

Matched triple (e 0.193–0.218, a 1.26–1.41 AU, varying only U): 5-year drift **U=0: 204k · U=5: 912k · U=9: 231k** — non-monotonic; the U=9 body drifts like the U=0 body. Added discriminator across all 17 NEAs: **Spearman(U, 5y drift) = 0.03** (nothing), Spearman(U, max drift) = 0.33 (weak), Spearman(dataArc, max drift) = −0.37 (weak, confounded: the two largest drifts are U=0 long-arc encounter bodies 99942 and 2012 UE34).

**Verdict: NO.** Two-body propagation error is driven by encounter geometry and orbit shape, not by orbit-determination quality. A Front C disclosure built on U would be built on the wrong variable. **Deep caveat (limitation 3):** this measurement cannot test U's *actual* claim — solution-vs-reality error — because JPL's solution is the truth source and re-anchoring erased solution differences. U may still be honest about what it measures; it just measures something else.

## 8. R — least-data bodies

2024 BB8 (**2-day arc, 31 obs**): max 5.71M km. 1979 XB (**4-day arc, 18 obs**): max 26.8M km. Both in the ≥10⁶ band even taking JPL's solution as exact. Their *true* risk is this model error **plus** an unknowable solution error that a 2-day arc cannot bound — the part this measurement structurally cannot see. Aster's screening of these bodies rests on 2–4 days of data propagated for up to 19 years.

## 9. Anchor-source control (n=1)

2026 BX8 (sbdb): the SBDB fit differs from Horizons truth by **3.7 km at its own epoch** vs 0.1–3.5 km for re-anchored bodies — provenance contributes a negligible initial offset, and its subsequent 270M km drift is dynamics. n=1 supports "provenance is not the dominant term for this body" and nothing broader.

## 10. THE CONSEQUENCE — measured drift applied to the shipped porkchop (step 10)

Method: for all 17 NEAs, the LIVE porkchop grid (200×100, DEC-5 composite of M=0+M=1) computed twice — arrival states from the shipped propagation vs arrival states hermite-interpolated from the truth fixture. This applies the measured drift **per cell, in magnitude and direction, at every arrival epoch**. Baseline grids reproduce the multirev artifact **exactly** (all five overlap bodies, both families, < 1e-9).

| result | count | detail |
|---|---|---|
| **Argmin moved** | **5 / 17** | 163693 (**+3.0 years, family flips M0→M1**, 8.448→7.988); 1979 XB (−51 d, 0.710→0.533); 2012 UE34 (+206 d, TOF −199 d); 2026 BX8 (+26 d, **minC3 halves** 2.083→1.120); 2025 VP (same dep, TOF −17 d) |
| Argmin same | 12 / 17 | incl. Apophis — see below |
| minC3 value shift | ≤ 1.1 km²/s² abs on every body | headline numbers are mostly robust |
| **Feasibility flips at 25 km²/s²** | **99942: 3,352 cells (16.8% of its grid)** · 2026 BX8: 192 · 2012 UE34: 115 · 2019 SE9: 40 · 1979 XB: 32 · others ≤ 29 | the fiction is concentrated in post-encounter / late-window regions |
| Status changes (solvable↔not) | 0 everywhere | coverage identical |

**The Apophis paradox, stated precisely:** its argmin did not move and its minC3 changed by only 3.8e-4 — because its best window departs 2028, arriving *before* the 2029 encounter. Meanwhile **every cell whose arrival postdates 2029-04-13 is computed on an orbit that no longer exists** (drift 10⁷–10⁸ km), and a sixth of its grid flips feasibility class. The headline number is right by *geometric luck*, not robustness — and 163693 shows what happens without the luck: its true best window is **three years away from the shipped one, in the other revolution family**. Unresolved per limitation 4: fine-scale deltas for 105140 and 2025 KP4 (interpolation floor exceeds signal); their argmin-same results are reported but not certain.

## 11. Self-verification (methods different from the producers)

1. **Quadrature cross-check** (no propagator: osculating-a(t) of the truth series integrated to a phase-error prediction): 433 agrees within ×0.72–1.27 at 1/5/10/15 y; 99942 agrees ×1.31 pre-encounter, then the linear model over-predicts (×2→×19) exactly where the true separation saturates at orbit-geometry scale — the physically correct signature. Shape and magnitude confirmed by an independent path.
2. **Prior-artifact cross-check:** shipped grids reproduce `multirev-consistency-results.json` minima **bit-exactly** on all 5 overlap bodies, both families.
3. **Physical ceilings:** the largest drifts (99942 326M ≈ 2.2 AU, 323P 397M, 2026 BX8 269M) sit at/below the maximum separation two bodies on their orbits can reach — none exceeds its geometric ceiling.
4. **Interpolation floor measured** (limitation 4), not assumed.
5. **Corrected during verification, disclosed:** my initial CA metric (one-week before/after ratio) was physically wrong for bodies with large pre-encounter drift; replaced with the growth-rate metric in §4 and both are reported in the JSON.

**Measured:** every drift/grid number above. **Derived:** rates, ratios, band counts, Spearman coefficients, geometric ceilings. **Inferred (flagged):** the Jupiter attribution for 2026 BX8 [Likely]; the T-mechanism (from Phase 2) remains [Likely]; the 3D/Biela disintegration is historical context, not measured. **Not verifiable here:** solution-vs-reality error (limitation 3) — the central unmeasurable.

## 12. What this measurement cannot conclude

- Catalog-wide rates (0.048% sample, deliberately extreme).
- Anything about the true orbits of high-U bodies (limitation 3 — the one risk U actually names).
- Post-encounter drift for non-nominal encounter geometries (limitation 5).
- Fine-scale step-10 behavior of the three near-perihelion bodies (limitation 4).
- Whether the sbdb-vs-reanchor provenance difference matters beyond n=1.

## Artifacts

`nea-drift-measure.mjs` · `nea-drift-results.json` · `nea-argmin-consequence.mjs` · `nea-argmin-consequence-results.json` · this file — all in `C:\Users\hudso\Documents\aster-slice18\`, none in version control. Truth fixture: committed at `0d927e4`. Repo untouched this phase; zero network calls (everything consumed from the committed fixture and prior caches).
