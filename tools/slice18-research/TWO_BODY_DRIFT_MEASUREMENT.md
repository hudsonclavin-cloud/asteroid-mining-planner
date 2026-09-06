# MEASUREMENT — Two-body Keplerian propagation drift vs JPL Horizons truth (2026–2040)

Dispatch: 2026-08-24 "TWO-BODY PROPAGATION DRIFT vs HORIZONS" · Assembled by Claude Code against repo HEAD `46ff00f` · Repo READ-ONLY; all outputs outside the repo.

**Reproduce:** `node C:\Users\hudso\Documents\aster-slice18\measure-two-body-drift.mjs`
(script compiles the repo's own propagator with the repo's own tsc into `C:\Users\hudso\Documents\aster-slice18\build-v2\` — outside the repo — and writes `two-body-drift-results.json` alongside).

---

## ⚠️ LIMITATION — read first

**The truth fixture contains PLANETS, not near-Earth asteroids.** Planets are better-behaved than NEAs: lower eccentricity, no close planetary encounters, exquisitely determined orbits. Every drift number below is therefore a **FLOOR on the model error Aster incurs when two-body-propagating asteroids across the screening window — not an estimate of it.** NEA drift can be expected to be worse, by an amount this measurement cannot bound. Nothing in this file should be read as "the asteroid error is ~10⁴–10⁵ km."

A second scope caveat: in the live screening path, **Earth is not two-body-propagated** — the screen interpolates Earth from this same Horizons series (recon: `porkchop.worker.ts:138-139`), and only **asteroids** are two-body-propagated (`porkchop.worker.ts:140-141`). The Earth row below therefore does **not** describe a screening-path error; it demonstrates anchor-state sensitivity (see §6).

---

## 1. What was measured, with what

- **Truth:** `src/v2/data/horizons-inner-solar-system-2026-2040.json` (7,510,022 bytes) — `source: "NASA/JPL Horizons API"`, `frame: "ICRF/J2000"`, `timeScale: "TDB"`, `units: {position: "km", velocity: "km/s", time: "TDB Julian Date"}` (all stated in the file's own header block). 6 targets (sun, mercury, venus, earth, moon, mars), **5,479 records each, daily cadence (verified min=max=1 day), JD 2461041.5 → 2466519.5** (2026-01-01 → 2040-12-31).
- **Bodies measured:** mercury, venus, earth, mars — the four with heliocentric centers (`center: "@sun"`). **Excluded:** `sun` (center `@ssb`, barycentric) and `moon` (center `500@399`, geocentric) — heliocentric two-body propagation is a category error for both.
- **Repo functions used (no reimplementation, INV-024 / dispatch C3):**
  - `propagateKeplerianStateVectors` — `src/v2/core/propagators/keplerian.ts:195` (pure two-body, no perturbations; Newton Kepler solve keplerian.ts:106-133; compiled out-of-repo with the repo's tsc, per the `tools/build/precompute-lambert-screen.mjs` precedent and AGENTS.md §2.2's process.execPath + full-tsc-bin rule).
  - `cartesianToElements` — `tools/slice7-research/state-to-elements.mjs:65` (the repo's Cartesian→osculating-elements function, already used by slice7/8/9 tools).
  - Method precedent: `tools/slice7-research/measure-keplerian-anchored.mjs` (anchor → derive elements → propagate → |Δr| vs truth).
- **Constants (verified identical across the two layers):** GM_SUN = 1.32712440018e20 m³/s² (`keplerian.ts:9`) = 1.32712440018e11 km³/s² (`keplerian-propagate.mjs:3-4`); J2000 obliquity 84381.448″ (`keplerian-propagate.mjs:5-8` and `src/v2/core/units.ts:4-5`); J2000 epoch JD 2451545.0 and 86400 s/day (`units.ts:1-2`).
- **Frames (dispatch 2.4 — no transform of our own):** the fixture is equatorial ICRF; `cartesianToElements` itself rotates equatorial→ecliptic before deriving elements (state-to-elements.mjs:55-81 — its comment: elements "round-trip through the existing propagator unchanged"), and `propagateKeplerianStateVectors` rotates ecliptic→equatorial exactly once, returning `FRAME_HELIO_J2000_ICRF` (keplerian.ts:146-158, 270). Comparison is therefore ICRF-vs-ICRF by the repo's own paired transforms.
- **Procedure:** per body — take the state at an anchor epoch as initial condition → `cartesianToElements` → convert to propagator input (`aM = a_km × 1000`; angles already rad; `epochTdbSeconds = (JD − 2451545.0) × 86400`) → propagate to every fixture epoch → `|r_twobody − r_horizons|` with propagator output converted m → km (÷1000). **All drift values in kilometres.** "+1 year" = +365 daily records (365-day convention; the final epoch is +5,478 d ≈ 15.0 y).

## 2. Sanity check (dispatch 3.6) — PASSED, gate open

Drift at the anchor epoch itself (must be ≈0 for the round-trip to be trusted):

| body | drift at anchor epoch |
|---|---|
| mercury | 7.42e-8 km (≈ 0.07 mm) |
| venus | 1.48e-7 km (≈ 0.15 mm) |
| earth | 5.54e-4 km (≈ 0.55 m) |
| mars | 4.71e-7 km (≈ 0.47 mm) |

All sub-meter — floating-point round-trip noise. The element derivation, unit conversions, and frame pairing are sound; the drift numbers below stand on a verified baseline.

## 3. Drift vs Horizons — anchor at FIRST epoch (2026-01-01, JD 2461041.5)

All values **kilometres** (fixture km vs propagated m÷1000).

| body | +1 y | +5 y | +10 y | final (+5478 d ≈ 15.0 y) | max over span | max at |
|---|---|---|---|---|---|---|
| mercury | 1,563 | 18,974 | 45,346 | 42,020 | **71,364** | 2040-10-30 (+5,416 d) |
| venus | 3,715 | 47,680 | 115,561 | 173,336 | **173,767** | 2040-12-20 (+5,467 d) |
| earth (geocenter 399 — see §6) | 1,154,008 | 5,737,233 | 11,486,568 | 17,210,425 | **17,215,899** | 2040-12-24 (+5,471 d) |
| mars | 31,823 | 107,640 | 74,500 | 89,425 | **120,455** | 2040-05-25 (+5,258 d) |

(Dates are calendar labels for TDB JDs — display-only conversion, TDB−UTC ≈ 69 s is immaterial at daily cadence.)

## 4. Drift-growth shape (described from the data; no model fitted)

Yearly at-mark samples (km, year 0→15) and the shape they show:

- **mercury** — 0, 1.6k, 4.9k, 14.3k, 22.4k, 19.0k, 14.7k, 12.6k, 17.5k, 29.4k, 45.3k, 46.5k, 35.4k, 28.4k, 27.6k, 38.8k → **oscillates with a growing envelope** (rises to ~22k, dips to ~13k, peaks ~46.5k, dips, rises again; span max 71.4k sits between year-marks). Not monotonic, not quadratic.
- **venus** — 0, 3.7k, 31.6k, 35.5k, 47.8k, 47.7k, 55.5k, 85.3k, 86.3k, 83.6k, 115.6k, 117.0k, 130.0k, 130.3k, 137.2k, 173.5k → **stepwise/oscillatory growth with a roughly linearly growing envelope** (~11–12k km/yr envelope slope); plateaus and jumps suggest a synodic beat superposed on secular growth.
- **earth (399)** — 0, 1.154M, 2.295M, 3.435M, 4.591M, 5.737M, 6.889M, 8.046M, 9.190M, 10.342M, 11.487M, 12.621M, 13.783M, 14.926M, 16.062M, 17.214M → **almost exactly linear** (yearly increments 1.140–1.157M km — constant slope). This is the signature of a constant mean-motion (period) offset, not accumulating perturbations — see §6.
- **mars** — 0, 31.8k, 90.8k, 89.1k, 106.7k, 107.6k, 48.7k, 94.0k, 20.5k, 79.7k, 74.5k, 34.3k, 35.2k, 67.7k, 85.0k, 87.3k → **strong oscillation with a roughly flat-to-slowly-growing envelope** (swings 20k↔108k; span max 120.5k at +5,258 d).

## 5. Anchor dependence (dispatch Step 4) — YES, drift is NOT a function of elapsed time alone

Second anchor at the fixture midpoint (index 2739, JD 2463780.5 ≈ 2033-07-01), propagated forward AND backward. Sanity at the mid anchor also ≈0 for all bodies. Same-elapsed-time comparison (km):

| body · elapsed | first-anchor fwd | mid-anchor fwd | mid-anchor bwd |
|---|---|---|---|
| mercury · 1 y | 1,563 | 3,979 | 2,971 |
| mercury · 5 y | 18,974 | 7,996 | 10,022 |
| venus · 1 y | 3,715 | 6,931 | 5,922 |
| venus · 5 y | 47,680 | 16,745 | 4,057 |
| venus · 7 y | 85,279 | 10,020 | 7,717 |
| earth · 1 y | 1,154,008 | 627,762 | 640,978 |
| earth · 5 y | 5,737,233 | 3,135,305 | 3,152,081 |
| mars · 5 y | 107,640 | 120,399 | 44,971 |
| mars · 7 y | 94,010 | 99,267 | 105,803 |

Findings: (a) drift at a given elapsed time varies **up to ~12×** with anchor choice (venus 5 y: 47,680 vs 4,057 km); (b) forward vs backward from the same anchor also differ (venus 5 y fwd 16.7k vs bwd 4.1k; mars 5 y 120.4k vs 45.0k); (c) Earth's slope halves between anchors (1.154M vs 0.628M km/yr) — explained in §6. Consequence for generalization: **the osculating-element snapshot at the anchor epoch materially determines multi-year drift; elapsed time alone does not predict it.** Aster's asteroid elements come from one fixed SBDB epoch per body (`tools/slice9-ingestion/build-nea-catalog.mjs:245,261` — "SBDB osculating elements propagated at element epoch"), so this anchor sensitivity applies to the screening path's model class directly.

## 6. The Earth outlier, explained by measurement (not adjudication)

Earth's drift is 2–3 orders of magnitude above the other planets and perfectly linear. The fixture's `earth` is **targetId "399" — the geocenter**, not the Earth-Moon barycenter (fixture `targets.earth.targetId`). The geocenter's instantaneous velocity carries the Moon-induced wobble (~12.5 m/s), which contaminates the osculating elements derived at a single instant:

- derived a at anchor 0 = 149,477,893.6 km = **0.998198 AU** → period **364.818 d** (−0.432 d vs 365.25)
- derived a at mid anchor = 149,665,395.5 km = **1.000451 AU** → period **365.504 d** (+0.254 d)
- venus control: derived a stable to ~4e-6 AU across the same two anchors (0.72333620 vs 0.72333222 AU)

A −0.432 d/orbit period error × Earth's ~2.57M km/day orbital speed ≈ **1.11M km/yr** predicted along-track divergence — matching the measured 1.154M km/yr, the linear shape, and the ~2× slope change between anchors (|−0.432| vs |+0.254| d). **Interpretation boundary:** this row demonstrates that anchoring two-body elements on one instantaneous state of a wobbling target bakes a mean-motion error into everything downstream. It does NOT describe the live screening's Earth error (screening Earth is interpolated from this same Horizons series, not propagated).

## 7. Assumptions and everything not determinable

Assumptions made (all stated in-line above):
1. "+1 year" = +365 daily records (365-day convention; the fixture is exactly daily).
2. Calendar labels for JDs use the display-only JD→Unix conversion; TDB≈UTC for labeling.
3. The mid anchor is fixture index 2739 (the integer midpoint).
4. Bodies limited to the four `@sun`-centered targets; sun/moon excluded as category errors for heliocentric two-body.
5. The repo's own paired frame transforms (equatorial→ecliptic in `cartesianToElements`, ecliptic→equatorial in the propagator) are treated as exact inverses; the sub-meter sanity residuals confirm this to floating-point precision.

Not determinable from this measurement:
- **The actual NEA drift magnitude** — the fixture has no asteroid truth series; planets are a floor only. Bounding NEA error would need integrated truth for representative NEAs (higher e, Earth-encounter geometries), which the repo does not contain for the 2026-2040 window (the slice7 `horizons-truth` data used by `measure-keplerian-anchored.mjs` is 90-day, not 15-year — `tools/slice7-research/measure-keplerian-anchored.mjs:17,20`).
- Whether Earth-Moon-barycenter anchoring would remove the Earth outlier (no EMB series exists in the fixture to test against; the wobble explanation rests on the 399 targetId plus the derived-period arithmetic above).
- How drift maps to screening C3 error — this measured position drift, not the C3 sensitivity to endpoint error; that is a separate measurement.

## 8. Artifacts

- Script: `C:\Users\hudso\Documents\aster-slice18\measure-two-body-drift.mjs`
- Raw results: `C:\Users\hudso\Documents\aster-slice18\two-body-drift-results.json`
- Out-of-repo build of the repo propagator: `C:\Users\hudso\Documents\aster-slice18\build-v2\`
- This file: `C:\Users\hudso\Documents\aster-slice18\TWO_BODY_DRIFT_MEASUREMENT.md`

No file inside the repository was created or modified; no network call was made (every input is a committed repo file).
