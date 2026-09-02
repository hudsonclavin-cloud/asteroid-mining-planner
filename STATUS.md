# STATUS.md — Aster Project Current State

> Updated at the end of each session. Keep it short; agents read this before acting.
> **Rewritten 2026-08-02 (`S16-CLOSE-2026-08-02-A`); current state corrected 2026-08-04 (`S-STATUS-TRUTHFIX-2026-08-04-A`); truth-refreshed 2026-08-07 (`S-HYGIENE-2026-08-07-A`); truth-refreshed 2026-08-10 after Front A close; truth-refreshed 2026-08-12 after the Front B batch run (`S-S17-FRONTB-BATCH-2026-08-11-A`); truth-refreshed 2026-08-13 after Batch 2 ship (`S-S17-BATCH2-2026-08-12-A`).** If HEAD does not match the table below,
> update this file before believing it. A stale STATUS forced a session-start stop-gate once
> already (audit L3-1) — that is why this section exists.

---

## Identity

**Canonical repo:** `/Users/hudsonclavin/asteroid-mining-planner` (macOS)
**Live site:** https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/ · [about](https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/) · [porkchop](https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/)
**MCP package:** `aster-mission-mcp@0.1.0` — published on npm, publisher `hudsoclavin`, handshake-verified 2026-07-10. 0.1.0 was baked from a dirty worktree (audit L6-3); a `prepublishOnly` clean-worktree gate now blocks a repeat.

---

## Git State

| Item | Commit | State |
|---|---|---|
| origin/main | `67c4c18` | Slice 18 Front A implementation was pushed 2026-09-02 (`22774cc..67c4c18`); verified via `git fetch` |
| Local HEAD | `a3a900e` | pinned as the previous commit — the Slice 11 founding-doc annotations; STATUS lags HEAD by this 2026-09-02 Front-A-close-out commit — see the lag note |

**Structural one-commit lag (expected, not rot):** This file is edited after `a3a900e` (the DEC-5 founding-doc annotations); this 2026-09-02 Front-A-close-out STATUS commit pins that previous commit and therefore lags HEAD by exactly one, accepted (a STATUS file cannot pin its own commit).
**Push state:** origin/main is at `67c4c18` — everything through the grid-extremes readout was pushed 2026-09-02. Local-only and unpushed: `a3a900e` (founding-doc annotations) and this STATUS commit. No agent pushes, ever.
**Deploy boundary:** `docs/` was rebuilt at `5a00907` on 2026-08-13, carrying Batch 2 (A4c size-range + orbit-quality columns, B2 scale/frame chips + axis triad + HUD, B1 pan/reset/discoverability). Live bundles: `solarSystemV2-C60RP1nx.js`, `compareV2-BPtoAvbN.js`, `porkchopV2-C8hMf2EQ.js`, `store-BAStm0cU.js`.
**Additive-only, hook-enforced:** `src/v2/SLICE_16_FOUNDING.md`, `src/v2/SLICE_16_APPENDIX_A_LOCKED.md`. This file is the documented exception and may be rewritten.
**Invariants:** global `INV-034` + `INV-V1-001`; Slice 16's four local invariants are namespaced `INV-S16-033..036`. Global `INV-037` (frozen-expectation amendment rule) added 2026-08-01.

---

## Slice Status

| Track | Slice | State |
|---|---|---|
| Mission planning | 9 (catalog) · 10 (Lambert, C3) | COMPLETE |
| Mission planning | 11 (porkchop + ΔV) · 12 (DLA overlay) | COMPLETE + DEPLOYED |
| Mission planning | 13 (mission cost card) | COMPLETE + DEPLOYED (showcase figures labelled unreproducible-pending-regeneration, L3-6) |
| Packaging / demo | 14 (About, validation card, FK3 tour, CI) | CLOSED + DEPLOYED |
| MCP / agent surface | 15 | PUBLISHED + VERIFIED (`aster-mission-mcp@0.1.0`) |
| Agent-honesty study | **16** | **CLOSED 2026-08-02 — HAS A RESULT** |
| Mission planning | **17** (Target Compare + viewer QOL) | **CLOSED 2026-08-13** (`S-S17-CLOSE-2026-08-13-A`; founding `SLICE_17_FOUNDING.md`, repo root; §8 amendments A1 + A2, plus this dispatch's cut entry + OQ dispositions + D-07 erratum). Front A **CLOSED** (A4b residuals closed). Front B tiers **B0-B2 shipped**, **B3-B5 CUT** per the §5 CUT RULE → carried by `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`. OQ-17-3/-4/-5/-8/-9 disposed; residual non-blocking items in the Slice 17 section below. |
| Mission planning | **18** (Screening Fidelity) | **SEATED 2026-08-24** — DEC-18-1..4 locked. **Front A CLOSED 2026-09-02**: DEC-5 implemented on the dedicated view (`765f8fd`, `bda0ee2`, `a7670c4`) and the grid-extremes readout shipped (`c0a8b9b`, `67c4c18`); annotated on the founding doc at `a3a900e`. Front B (NEA drift measurement) OPEN and gates Front C (per-object fidelity surface). Mission View DEFERRED per DEC-18-4. See the Slice 18 section below. |

## Slice 16 — closed, with data

**Publicly pre-registered before collection:** DOI `10.5281/zenodo.21752617`, sealed commit `670b039`, published 2026-08-01T23:44Z (founding §27).

**Result** (founding §30; 468 runs, **zero provider errors**): FULL faithfulness `claude-sonnet-4-6` **23.8%** [6.1, 45.6], `claude-haiku-4-5` **32.5%** [11.9, 52.9]. Per-dimension: VF 23.1% · RFR 32.5% · PTA 55.5% · AUP 75.9%. Control arm (no tools): numeric-claim rate 73.1% / 41.0%, and **0/6** checkable values correct.

**How to quote it — three hard limits.** (1) **Single-lab.** Two Anthropic models is not a claim about labs at any confidence. (2) The one evaluable contrast is **unresolved** (8.7 pp against a registered 10 pp threshold, overlapping intervals) — tiers, never a ranking. (3) **RQ3 is under-covered** (43 graded runs); do not compare it with the other RQs.

**The 114 successful rows from halted attempt 1 are NOT study data** and are excluded from every figure.

**Scope executed vs registered:** 28→25 scenarios, 6→**2** models, r=10→**6**, 2,184→**468** runs. Two model losses were external and measured, not assumed, and cost $0 (gpt-5.5 credit-exhausted, Gemini quota-exhausted). Founding §29, §31.3.

**R-CLOSE-1 (2026-08-02):** S-20/S-21/S-24 struck post-data as structurally ungradeable — the primary set is **25** for any future run. The sealed registration's counts are pinned separately in `tools/slice16-harness/config.mjs` (line 728) as `SEALED_AT` so the amendment cannot obscure what the DOI archived. Founding §31.6, appendix §L.15.

**Spend:** $13.82 (pilots + attempt 1) + $14.73 (final session, of a $19 budget) = **$28.55 total**.

**Close-out:** founding **§31**. Open-item triage: `tools/slice16-harness/CLOSE_REPORT.md`.

---

## Slice 17 — CLOSED 2026-08-13 (Front A closed; Front B B0-B2 shipped, B3-B5 cut)

**Front A residuals CLOSED (A4b).** DEC-17-3 dominance badge at `525cd48` — three-state Pareto (dominated / nondominated / insufficient-data) over the DEC's three metrics, **no composite score**; rows lacking any metric take insufficient-data, never a losing badge. DEC-17-8 threshold toggle at `82996ee` — relative Δ=5 | absolute 25, **both labeled with their values**, the absolute read from `metadata.feasibleC3MaxKm2S2` at runtime rather than a literal.

**Front B B0 CLOSED.** Orbit contrast, responsive panel widths + footer wrap, porkchop-modal hotkey gating, cost-card C3 units (`7593616`, `7a3622d`, `4daa199`).

**NEA point legibility — FIXED STRUCTURALLY (`358d379`).** Root cause was never brightness: the point shader was missing the pixel-ratio term the starfield shader has, a **2× linear / 4× area** disadvantage on a DPR-2 display. Minimum point size raised; maximum capped — the driver's `ALIASED_POINT_SIZE_RANGE` had been overriding the 64 px constant and permitting ~255 px halos. Screening colors resaturated so green separates from white/grey by hue. **All brightness/opacity values reverted to their originals** — two earlier retunes moved the wrong variable. Verified by the cold-reader gate: legibility survives the 100 %-starfield stress test, so the 65 % starfield default (`dc19cbd`) is **optional, not load-bearing**.

**C2 frame verdict LANDED** (`tools/frontb-2026-08-11/`, `c90b4f6`): *"Heliocentric J2000 equatorial (ICRF) axes; scene +Z = ICRF/celestial north."* **B2 entry gate SATISFIED.** Chip caveat, binding on copy: the top-down preset views down the **ecliptic** pole while scene axes remain **equatorial** — copy must not conflate the two.

**Batch 2 SHIPPED (`S-S17-BATCH2-2026-08-12-A`).** A4c size-range + orbit-quality columns landed at `60a6fb6`: albedo `0.14` verified in the generator, and display calls the same core function as the catalog so it cannot drift. B2 scale/frame chips + axis triad + HUD landed at `325c115`: both true-scale claims were verified before being chipped, and the frame label follows the C2 wording verbatim with the ecliptic-vs-equatorial caveat. B1 pan landed at `1e99aca` as camera-target offset with PAN-SAFE verified — the `dcdb494` anchor path remains untouched — and the Home-key naming collision is resolved as **"⌂ Reset view"**. B1 discoverability landed at `3a7c686` with the `?` overlay and tooltip badges. Run report + OQ-17-5 evidence are in `tools/batch2-2026-08-12/` (`953c096`).

**OQ-17-8 ANSWERED — CANNOT-REACH.** Source is JPL SBDB, not MPCORB, so no E/D/F letters are possible; the committed catalog carries 41,906 values, all numerals 0-9 plus 10 nulls.

**CLOSE-OUT (`S-S17-CLOSE-2026-08-13-A`, 2026-08-13).** Slice 17 is CLOSED. §8 close entries: the B3-B5 cut (authority = §5 CUT RULE, quoted verbatim); OQ dispositions — OQ-17-3 CLOSED by the A4b badge `525cd48` (three metrics, no composite; locked at A4b not A3, a phase-label note); OQ-17-5 RULED (b), accept the ~7-7.5 CSS px rim shortfall with the chip stating the 8 px code floor; OQ-17-9 DISPOSED, albedo `0.14` (Stuart & Binzel 2004, V6-verified); OQ-17-4 rescoped to Slice 21; and the D-07 erratum (DEC-17-8 Δ=2 count 1→2, both single-cell). B3-B5 carry forward in `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md`.

**Carried forward, OPEN and non-blocking:** A4c residual DEC-17-4 columns unbuilt — orbit class, a/e/i, `dataArcDays`, `nObsUsed`, sigmas (fields loaded, rendering not built). Touch pan needs per-`pointerId` tracking before touch support is honest. `MAX_CAMERA_DISTANCE_M` has a one-line zoom-out headroom lever, not pre-approved. Orbit-class tabs (ATE/APO/AMO/IEO) do not filter the 3D point cloud (detail below). Live gate letter (f) — CONFIRMED 2026-08-23 (see live-verification block). Environment: laptop-only, Windows, Node v24.18.0.

**NEW FINDING (B1/B2 discoverability):** the orbit-class tabs (ATE / APO / AMO / IEO) do **not** filter the 3D point cloud — a screening class cannot be isolated visually.

**Live-site verification 2026-08-23 — Hudson, manual, foreground Chrome, deployed `/v2/solar-system/`.** Measured personally; not agent- or Clome-reported. Where these observations and the three prior Clome runs disagree, the manual observation governs.

**Live gate letter (f) — CONFIRMED 2026-08-23.** Pan is available and functional on the deployed build; two hands-off 10-second no-flicker watches at two different camera offsets showed no discontinuity in the focused object's marker, label, or orbit line, console clean across the full sequence. Method: target selected from the catalog list (not the viewport, which resolves unreliably — see the B3 cut item), asteroid 10145 (1994 CK1). The `dcdb494` anchor path is verified PAN-SAFE on the live bundle, not merely asserted.

**Overlay states a false control binding (open, 2026-08-23).** Input-layer / honesty-surface defect. The in-app "?" overlay NAVIGATE section states, verbatim: `drag` = orbit the camera · `right-drag / Shift+drag` = pan the view · `scroll` = zoom in/out · `⌂ Reset view (button)` = top-down overview, clears pan. Measured behavior: Shift+left-drag PANS (starfield holds, near body translates) — matches the overlay; middle-drag PANS — works, but is ABSENT from the overlay; right-drag ORBITS (starfield rotates) — CONTRADICTS the overlay, which documents it as pan. The overlay asserts a control binding that does not exist. On a product whose thesis is a strict honesty layer, a false statement on the help surface is the same defect class as a wrong frame label. No remedy chosen; not scheduled. Open cause question, unresolved: no binding vs. a browser-level right-button intercept (context-menu / preventDefault gap) — same symptom, different fixes; whether a context menu appears on right-drag release was not recorded.

**Shift+mousedown fires click-focus (open, 2026-08-23).** Initiating a Shift+left-drag pan also triggers the click-to-focus handler, reselecting the asteroid under the cursor at gesture start; a drag should suppress the click. Independent of the overlay defect; same subsystem. No remedy chosen.

**Cold-load black screen, 30+ seconds (open, 2026-08-23).** Measured in Chrome DevTools Network panel, cache disabled, hard refresh. A cold-cache first load of `/v2/solar-system/` shows a fully black page with an empty `#app` for 30+ seconds: no loading indicator, no partial UI, no console errors, all requests eventually 200 (a `github.io/favicon.ico` 404 is unrelated). From the capture: `nea-catalog-slice9-*` 8,979 kB / 32.87 s; Finish 34.89 s · 24 requests · 9.0 MB transferred. [Likely] root cause: the single uncached ~9 MB NEA catalog fetch gates the entire mount, with no loading state to signal liveness. Audience impact: a first-time reviewer on a cold cache sees 30+ seconds of black with no indication the app is working; Hudson's warm-cache machine masked this. `Content-Encoding: gzip` present (Fastly/GitHub Pages; brotli offered via `Accept-Encoding` and not returned — unavailable on this host). Wire 8,973,203 bytes gzipped; raw 52,969,826 bytes; ratio ~5.9:1. The recorded hypothesis that compression was absent is RESOLVED FALSE — the encoding lever is closed. Remaining levers are on the payload itself (leaner format, fewer bodies, lazy or progressive load) and on a loading indicator to signal liveness. ~1,264 bytes per object across 41,906 objects; [Speculative] the payload may embed per-object precomputed screening across the 2026–2040 window, which would mean it scales with the screen grid rather than object count — unverified, requires inspecting the JSON record shape. JSON.parse cost of the 52.97 MB raw payload has NOT been measured and is a separate potential contributor to the 34.89 s finish. [Speculative] the capture showed two `nea-catalog-slice9` rows (32.87 s and 1.45 s); whether this is a genuine duplicate fetch or a cache-hit replay is unconfirmed. No remedy chosen; not scheduled.

**Precomputed-screening hypothesis — RESOLVED FALSE 2026-08-24.** Read-only inspection of `docs/assets/nea-catalog-slice9-BkYibDG0.json` found that the 52,969,826-byte asset contains 41,906 records as objects-with-named-keys (not columnar), under the `asteroids` container keyed by `asteroid-<designation>`; each record has 24 fields and the file is pretty-printed, not minified. Field order as emitted: `designation`, `spkId`, `name`, `class`, `orbitClass`, `isCuratedNea`, `neo`, `pha`, `H`, `G`, `estimatedRadiusM`, `anchor{epochTdbJd, positionKm[3], velocityKmPerS[3]}`, `elements{aKm, e, iRad, omRad, wRad, maRad, epochTdbJd}`, `elementsFrame`, `eccentricityBand`, `conditionCode`, `dataArcDays`, `nObsUsed`, `sigmaA`, `sigmaE`, `inv014Tier`, `qualityRank`, `anchorSource`, `reanchorEpochTdbJd`. No screening arrays and no per-departure data are present. The payload does NOT scale with the 2026–2040 screen grid; it scales with body count and per-record field cost. The first record (`asteroid-433`) measures 1,242 bytes.

**[Likely] Where the catalog wire bytes actually are (2026-08-24).** The gzipped wire payload is dominated by float digit entropy, not by whitespace or repeated key names. Reasoning: ~13 floats per record × 41,906 records at up to 17 significant digits is on the order of 9M digit characters, against a measured wire size of 8,973,203 bytes; gzip's measured ~5.9:1 ratio is consistent with indentation and 41,906 repetitions of identical key names compressing to near-nothing. Consequence, if true: minification and key shortening would cut the RAW file substantially while moving the WIRE size very little. Numeric precision reduction would move both. **MEASUREMENT NOT TAKEN**, and it is cheap: minify one copy of the asset, re-gzip it, and compare the result against 8,973,203 bytes. Until that is done this remains [Likely], not established.

**Constant-valued and duplicated fields — single-record observations (2026-08-24).**
- `inv014Tier: "visualization-tier"` on the inspected record. If this value is uniform across all 41,906 records it costs approximately 1.3 MB raw as a repeated constant. Uniformity NOT verified.
- `epochTdbJd` appears three times per record (`anchor.epochTdbJd`, `elements.epochTdbJd`, `reanchorEpochTdbJd`), identical in the inspected record (`2461161.5`). Whether this holds across all records is NOT verified.
- `class` and `orbitClass` both read `"AMO"` in the inspected record. Whether they ever diverge is NOT verified.
- `anchor` (position + velocity) and `elements` (six orbital elements) describe the same body at the same epoch in the inspected record. UNRESOLVED and requiring Hudson's ruling: whether this redundancy is intentional (e.g. preserving the Horizons-sourced state vector alongside derived elements for provenance) or incidental. Do not treat it as duplication to be removed.

All four are observations from a SINGLE record. No remedy chosen.

**False precision in generated catalog data, observed 2026-08-24 (honesty layer; separate from payload size).** `estimatedRadiusM: 14839.899761463936` — approximately 16 significant figures — is derived from `H: 10.39` (4 significant figures) and an assumed geometric albedo of `0.14` (Stuart & Binzel 2004, disclosed per OQ-17-9 / A4c). The emitted value states a precision the inputs cannot support. Related: `positionKm` values such as `-184294550.5137226` carry sub-millimetre precision on a heliocentric position in a record tagged `inv014Tier: "visualization-tier"`. The in-app disclosure box already states that asteroid radii are estimated from brightness, so the UI's claim is honest; the finding is that the generated data file itself asserts more precision than its inputs justify. Scope of the finding: the generated asset. Whether any consumer (screening, Lambert, display) depends on digits beyond a defensible cutoff is NOT verified. No remedy chosen; not scheduled.

**Blank-page incident 2026-08-23 — rAF-gated-boot hypothesis REJECTED (first recorded here, not a restoration).** A blank page with an empty `#app` and no console error was observed on 2026-08-23 and self-resolved. The rAF-gated-boot hypothesis — that the mount awaited an animation frame, which browsers pause in hidden tabs — was TESTED and REJECTED: a background-born tab (opened via Alt+Enter, unfocused 20 s) rendered normally on focus. The permanent black screen Clome reported across three runs was an artifact of its own harness (its automation tab runs `document.hidden = true`; a 3.4 s `requestAnimationFrame` probe fired zero frames), not site behavior. [Likely] the incident was the cold-load catalog fetch recorded above, which explains every symptom including the self-resolution. The recurrence trigger changes accordingly: an init-race recon on `runtime.ts` is no longer the indicated first move; a recurrence should first be checked against the cold-load path.

---

## Slice 18 — SEATED 2026-08-24 (Screening Fidelity)

**Seated as Screening Fidelity (2026-08-24).** Mission View (animated transfer arc + uncertainty envelope) was evaluated and **DEFERRED, not cancelled** — see DEC-18-4. Three fronts: **Front A** — solver/revolution consistency on the shipped screening surfaces; **Front B** — closing the NEA propagation-drift measurement gap; **Front C** — a per-object fidelity surface built from Front B's results. **Front C is gated on Front B.**

All measurements below were produced by read-only local runs with **no network**, using only committed fixtures and the repo's own math. Artifacts are named per measurement and are **NOT in version control**; they live in `C:\Users\hudso\Documents\aster-slice18\`.

### DECs locked for Slice 18

**DEC-18-1 — Endpoint states are recomputed, never retained.** The screening layer's endpoint states (r1, v1, r2, v2) are discarded: the live worker strips v1/v2 and `lambert-screen-cache.json` holds only derived scalars. They are deterministically recomputable from stored inputs, and this was demonstrated: the cached Eros cell (minC3 `1.6244339770173506`, 2032-06-10, TOF 272 d) was recomputed from stored inputs to **4.101e-16 relative on C3, 1.742e-16 on vInfDep, exact on vInfArr** — machine epsilon. Five bodies' full-grid argmins matched their cached minC3 below 1e-9 relative. Retention would duplicate a derivable number and invite drift; recomputation makes drift structurally impossible. Measured 2026-08-24, local, no network.

**DEC-18-2 — No quantitative uncertainty geometry ships in Slice 18.** An uncertainty envelope derived from the catalog's element sigmas is **REJECTED as indefensible**. Evidence: the along-track phase sensitivity from `sigmaA` for 433 Eros at a 10-year horizon is **~1.3 km** (derived, not measured in this arc: `sigmaA` 1.5722e-10 AU from the committed catalog, a = 218,150,587.7 km, n = 1.1306e-7 rad/s, via the standard along-track relation 1.5·n·δa·t; independently re-derived at 1.259 km during this commit's verification), while the repo's own two-body propagator drifts from JPL-integrated truth by **~10⁵ km** over the screening window for well-behaved planets — five orders of magnitude. A ribbon drawn from `sigmaA` would depict an error bar far narrower than the model error containing it. Condition code renders as its raw MPC category and is **NEVER** converted to kilometres; it is an ordinal longitude-runoff band, not a Cartesian uncertainty. Superseded only by a real state covariance plus perturbed propagation.

**DEC-18-3 — Disclosure is per-object and measured, or qualitative.** Two-body drift depends strongly on the **anchor epoch**, not on elapsed time alone: up to ~12× difference for the same elapsed time depending on which epoch anchored the elements, and forward propagation differs from backward. Aster's asteroids each carry one fixed SBDB element epoch, so every body has its own error curve. **No global "± X km at N years" claim is defensible.** Each object gets a measured number or an honest refusal.

**DEC-18-4 — Mission View is DEFERRED, not cancelled.** Its stated rationale was that the uncertainty envelope IS the honesty. DEC-18-2 removes the envelope. What remains is an animated arc labeled screening-grade — a legitimate feature, but no longer a distinctive contribution to the honesty thesis. It re-enters as a later slice once Front B establishes what an arc would be drawn on top of. Recorded so the deferral is legible rather than looking like drift.

### Measurement: two-body drift vs Horizons (2026-08-24)

Local, no network, using only committed fixtures (`horizons-inner-solar-system-2026-2040.json`: 6 targets, 5,479 daily records, ICRF/J2000, TDB, km) and the repo's own propagator plus `cartesianToElements`. **Sanity check passed before any drift numbers:** drift at the anchor epoch was sub-metre for every body. Position drift, two-body propagation from a single-epoch anchor vs JPL-integrated truth, **kilometres**:

| body | +1 y | +5 y | +10 y | final (~15 y) | max |
|---|---|---|---|---|---|
| mercury | 1,563 | 18,974 | 45,346 | 42,020 | 71,364 |
| venus | 3,715 | 47,680 | 115,561 | 173,336 | 173,767 |
| earth (geocenter 399) | 1,154,008 | 5,737,233 | 11,486,568 | 17,210,425 | 17,215,899 |
| mars | 31,823 | 107,640 | 74,500 | 89,425 | 120,455 |

**LIMITATION, prominent: these are PLANETS.** Near-Earth asteroids are worse behaved — higher eccentricity, planetary close approaches. This is a **FLOOR** on the error the screening layer incurs for asteroids, **not an estimate of it**.

**Earth note:** the fixture's `earth` is targetId 399, the **geocenter**, not the Earth-Moon barycenter. Deriving elements from the wobbling geocenter's instantaneous state yields a = 0.998198 AU, a period error of −0.432 d, which accounts for the nearly linear ~1.15M km/yr growth. The screening layer **interpolates** Earth rather than propagating it, so this row is anchor-sensitivity evidence, **not a screening-path error**.

**Anchor dependence:** up to ~12× drift difference for identical elapsed time (venus at 5 y: 47,680 first-forward vs 16,745 mid-forward vs 4,057 mid-backward km); forward ≠ backward (mars at 5 y: 120,399 vs 44,971 km).

Artifacts (not in version control): `measure-two-body-drift.mjs`, `TWO_BODY_DRIFT_MEASUREMENT.md`, `two-body-drift-results.json`.

### Measurement: C3 robustness under drift-scale perturbation (2026-08-24)

Reproduction gate passed at machine epsilon before any sensitivity numbers. At the 10⁵ km planet-floor drift scale, perturbing the arrival state along-track, radially, and cross-track: worst-direction ΔC3 ranged **1.4e-3 to 5.2e-2 km²/s²** — at most **1.11%** of nominal for every body except near-zero-C3 Apophis, whose 657% is a near-zero-denominator artifact (absolute Δ 1.4e-3 km²/s²). An along-track 10⁵ km displacement equals **0.7–3.7 hours** of phase against a **168-hour** departure cell. |ΔC3| at 10⁵ km is **10×–250× smaller than one grid-cell step** (smallest adjacent step per body) and 450×–10,000× smaller than the mean step. The optimal cell **did not move in any of 15 cases at 10⁵ km**; at 10⁶ km, **3 of 15 moved**. Zero solver failures across ~2.7M solves.

**Conclusion recorded:** at the drift scale the repo can currently establish, the published screening quantities are **robust**, and no screening-honesty correction is required on that basis.

**[Speculative]** real NEA drift is not bounded by the planet floor; the argmin begins moving at 10⁶ km, and where real NEAs sit between those regimes is exactly what the repo cannot presently answer — **this is Front B**.

Artifacts (not in version control): `c3-drift-sensitivity.mjs`, `C3_DRIFT_SENSITIVITY.md`, `c3-drift-sensitivity-results.json`.

### FRONT A FINDING — the shipped porkchop diverges from DEC-5

**The two Lambert solvers are BIT-IDENTICAL where their domains overlap.** On the Eros cell at M=0, izzo `lambert` and `lambertMultiRev` returned identical C3 (`1.62443397701735`), identical vInfDep, identical vInfArr, identical root x; ΔC3 exactly 0, Δv1 and Δv2 exactly [0,0,0]. **Every divergence below is STRUCTURAL — disjoint revolution families — not numerical.**

| surface | solver | revolutions |
|---|---|---|
| catalog badge / minC3 (cache) | izzo `lambert` | M=0 only |
| `/v2/compare/` | `lambertMultiRev` | M=0 only |
| `/v2/porkchop/` (dedicated view) | `lambertMultiRev` | **M=1 only, fixed** |

The dedicated view passes `M: 1` as a fixed literal (`app/porkchop/main.ts:916`), forwarded unchanged (`porkchop/porkchop-view.ts:583`). **M is never iterated.** At M=1, `lambertMultiRev` skips the M=0 early-return path entirely and returns null for TOF below T_min, which `grid-compute` converts to `no_solution` — even where a valid M=0 transfer exists.

**THIS DIVERGES FROM A LOCKED DEC.** `SLICE_11_FOUNDING.md:103-106`, DEC-5, verbatim: *"Dedicated view: M=0/M=1 toggle is prominent. Selecting M=1 replaces the heatmap with the M=1 grid; selecting "both" overlays them (semi-transparent layers). Default state is "both" so the 28% gap is visible immediately."* And INV-016b, `SLICE_11_FOUNDING.md:27`, verbatim: *"Porkchop views must visually distinguish M=0 and M=1 solution branches. Users must be able to identify which solution branch each visible window belongs to. The dedicated view exposes an explicit M=0/M=1 toggle; the overlay shows both with distinct visual encoding."* AMD-1 (`:198`) specifies the mechanism: *"'Both' display mode (DEC-5) issues two messages (M=0 and M=1); the renderer composites."*

No toggle and no second `computeGrid` message exist in the shipped code. The introducing commit is `e871297` (2026-06-25, *"feat(slice11): Phase D1 dedicated porkchop route"*), which cites no DEC or OQ; no later commit has modified the value. **No test binds the page's M — no test imports `app/porkchop` at all** — so nothing would fail if it changed. DEC-5's first two bullets were never amended; AMD-2 (`:213-215`) amends only its third bullet (branch selection).

**Measured user-visible consequences**, 13-body sample, on the porkchop's own grid parameters (20,000 cells, dep step 25.693 d, TOF step 16.604 d):
- **5 of 13 bodies render an ENTIRELY EMPTY porkchop grid** (no M=1 solution in any of the 20,000 cells) while the catalog badges a finite C3 for the same body. All five are high-eccentricity (0.88–0.996), large-a (8.6–353 AU).
- `asteroid-2021 CG6`: cached badge **HIGH C3 (37.737)**; the M=1 grid the porkchop actually renders finds **21.199 km²/s²**, **below the 25 km²/s² feasibility threshold**. The two surfaces disagree on feasibility for the same body.
- `asteroid-1979 XB`: M=1 minC3 `0.7098626241284557` vs M=0 `3.151477050001412` km²/s² — **4.44× better, and a different mission**: departure 2028-04-02 vs 2029-03-02, TOF 580.985 d vs 248.914 d.
- Blank-cell fraction on bodies where M=1 solves at all: **7.2%–60.5%**.
- **0** cells were solvable under M=1 but not M=0 in this sample; **0** solver stalls.

**SAMPLE CAVEAT, mandatory: 13 of 41,906 bodies is 0.031%, and the bodies were DELIBERATELY SELECTED** to span eccentricity, condition code, and C3. **The percentages above are NOT catalog rates and must never be quoted as such.**

**Independent corroboration already in the repo:** `SLICE_11_FOUNDING.md:53-55`, OQ-2 CLOSED (2026-06-30), 500-body measurement, meaningfulWinFraction = **0.242 (121/500)**, orbit-class dependent — AMO 41.6%, IEO 26.3%, APO 23.6%, ATE 7.2%.

Artifacts (not in version control): `multirev-consistency.mjs`, `MULTIREV_CACHE_CONSISTENCY.md`, `multirev-consistency-results.json`.

### Two documentation defects (separate from the Front A finding)

- **INV-016b is unregistered.** It is declared "(new)" at `SLICE_11_FOUNDING.md:27` but does **not** appear in `INVARIANTS.md`, which carries INV-016 (`:183`), INV-016c (`:184`), INV-016d (`:185`), INV-016e (`:186`). The gap in the sequence is itself evidence registration was intended. Whether an unregistered invariant is in force is not addressed by any text found. **UNRESOLVED — requires Hudson's ruling.**
- **DEC-5's rationale figure is stale.** DEC-5 cites *"the 28% gap"*; OQ-2 subsequently closed at meaningfulWinFraction = 0.242 (24.2%). **The ruling stands**; the number in its justification predates the measurement that followed. Recorded for additive annotation on the founding doc, not a rewrite.

### Scope note

The ui-overlay porkchop **also** passes `M: 1` (`app/ui-overlay/overlay.ts:339`), and DEC-5 rules it separately (M=0 default with a small M=1 toggle adding a contour layer). Recorded as a known second surface with the same class of divergence. **Front A scope is the dedicated view; the overlay is not in Front A scope.**

### FRONT A CLOSED — 2026-09-02

**DEC-5 implemented on the dedicated view.** The ruling had been locked in Slice 11 and never shipped: the route passed a fixed `M: 1` from `e871297` (2026-06-25) onward, with no toggle and no second `computeGrid` message. Implemented by `765f8fd` (dual-M compute path, AMD-1's two messages awaited sequentially), `bda0ee2` (composite selection — per-cell winner, exact ties to M=0, `stall` preserved, provenance via `cell.M`), `a7670c4` (three-state toggle Both / M=0 only / M=1 only, default Both; non-colour family encoding; mode-aware copy). Annotated on the founding doc at `a3a900e` — §8 records the divergence and its measured consequence, AMD-9 (§5a) records the deliberate deviation from DEC-5's "semi-transparent layers" wording. Both are additive; the additive-only grep proof returned only the file header.

**Grid extremes readout shipped** (`c0a8b9b` computation, `67c4c18` UI). Names the lowest and highest departure C3 in the displayed grid, per-extreme family, click-to-pin through the existing pin path, circle/square colour-free markers. Framed as facts about the grid, never a recommendation — the rendered qualifier reads: *"Facts about the displayed grid. Lowest departure C3 is not the best mission — a higher-C3 cell with shorter TOF or lower arrival v∞ may suit a given objective better."* Verified against the independent record via a different code path than produced it: `asteroid-433` composite min **1.752189846705813**; `asteroid-2021 CG6` composite min **21.19856534539755**.

**Browser gate closed**; `22774cc..67c4c18` pushed. **`docs/` was NOT rebuilt, so the live site is unaffected by these commits.** Two checks remain **unverified** and are recorded as such rather than assumed: click-to-pin row/panel agreement, and the "No solvable cells in this grid." empty-state string on `asteroid-2017 UR52` in M=1 only.

**JD epoch quantization (finding).** Departure epochs on the JD-based grid differ from the cache generator's seconds-based construction by up to **1.431e-5 s**, below the **4.721e-5 s** float64 ULP of a JD at 2.46e6. Inherent to AMD-1/AMD-7's "departure as JD" message contract, which is ruled and stands. Moves screening C3 by ~1e-11 relative — immaterial at screening fidelity. Consequence recorded: **relative tolerance is the wrong instrument near zero C3** (Apophis's 1.208e-9 relative is 2.493e-13 absolute), so the reproduction gate was ruled as an absolute 1e-9 km²/s² bound.

**False-invariant correction (test scope).** A proposed test asserting *"composite max ≤ M=0 max, always"* was **not** implemented as stated: it holds only when `onlyM1 === 0`, which is an empirical property of the measured grids (M=1 needs longer TOF), not something `compositeGrids` enforces. The true structural property is per-cell — composite ≤ M=0 wherever M=0 solves. Both were tested, plus a boundary counterexample pinning the claim so it is not later strengthened into a false invariant.

**Known duplicate, recorded not fixed.** `findGlobalMinimumCell` (`porkchop-view.ts:468`, tour-critical) and `minSelectedC3`/`gridExtremes` (`composite-grid.ts`) both compute the minimum; both are ok-only with strict `<`, so both select the same cell. Deliberately not unified — refactoring a tour-critical path for zero functional gain is the wrong trade; documented in a source comment so it is not silently grown to a third.

**Open, carried forward from Front A:**
- The ui-overlay porkchop still passes a fixed `M: 1` (`app/ui-overlay/overlay.ts:339`) and diverges from DEC-5's separate overlay ruling. Out of Front A scope by decision; **still OPEN**.
- The r=11 minimum marker's crosshair occludes that cell's stipple dot (both are centred on the same point; the crosshair is 2 px through the centre, the dot 1.667 px). Family is still stated in three text places. Fixing it would edit the shared `drawMarker` used by the pin and hover markers — wider blast radius, deliberately not done.
- The DLA feasibility overlay is on by default and visually dominates the plot; independently noted by two readers. Turning off a Slice 12 default to suit a Slice 18 marker would need its own decision and was not taken.

**Front B remains OPEN and gates Front C.** The repo cannot measure real NEA propagation drift — there is no asteroid truth series beyond 90 days. The planet floor is ~10⁵ km; the argmin begins moving at 10⁶ km, and where real NEAs sit between those regimes is what the repo cannot presently answer.

---

## Test State (measured 2026-08-13)

| Suite | Command | Result |
|---|---|---|
| CI | GitHub Actions run #78 | **green** at `5a00907` |
| Root recursive | `node tools/run-tests.mjs` | **74/74 files pass; 256 tests pass / 0 fail** (Hudson, 2026-08-13, Windows / Node v24.18.0 — the golden-numbers loader test now loads under Node 24; the 246→256 delta is that test. Prior Node-20 record: 73/74 files, 246 pass / 1 load failure, 2026-08-12) |
| Focused compare data | `node --test tests/v2-compare-data.test.mjs` | **17 / 17 pass** after fixture repair at `88b9133` |
| Slice 16 harness | `node --test tools/slice16-harness/test/*.test.mjs` | **191 / 191 pass** when last measured |

**Test-file inventory (audited 2026-08-07):** 70 files under `tests/`, 3 colocated under `src/v2/`, and 3 MCP tests. This is an inventory, not a test result.

**CI history:** Runs #70-72 were red, root-caused to two **false test-fixture premises** in `tests/v2-compare-data.test.mjs`, not source defects. The earlier diagnosis (fabricated delivered-mass, back-derived `liveMin`) was **retracted** after adjudication against `compare-data.ts:303-308` and `compare-data.ts:330-335`, which were already correct. Fixtures repaired at `88b9133`.

**Environmental exception registry: EMPTY (retired 2026-08-13).** The former AGENTS.md §9.1 rule 1 exception — `tests/v2-golden/launch-vehicles.golden.test.mjs` failing to load on local Node 20 with `ERR_UNKNOWN_FILE_EXTENSION` on a `.ts` import — is RETIRED: the laptop runs Node v24.18.0, the file loads and passes, and the full suite is **74/74 · 256 · 0** (Hudson, 2026-08-13). The last Node-20 machine (the iMac) is retired; the Node-version unify is effectively complete for the local environment.
**CI gap, still open (L4-1):** CI runs neither the MCP package tests nor the Slice 16 suite, and the default `npm test` is not truthful about coverage.

**Front A commit ledger (Slice 17):**

| Commit | Change |
|---|---|
| `873e7ef` | A3 compare data layer |
| `b551bda` | A4 `/v2/compare/` page |
| `0516848` | deploy rebuild (source/artifact order inversion — noted, resolved by `dcdb494`) |
| `dcdb494` | flicker fix (focused-asteroid anchor epoch consistency) |
| `77cbc10` | A4 copy fixes (solver-time footnote, window-count labels) |
| `88b9133` | test-fixture repair, fabrication diagnosis retracted |
| `5222810` | deploy rebuild carrying `77cbc10` + `88b9133` |
| `ed80996` | AGENTS.md §9.1 — N/N-or-not-green, red-CI-blocks-push, build-only-from-clean-tree |
| `525cd48` | A4b dominance badge (DEC-17-3, three-state Pareto, no composite) |
| `82996ee` | A4b threshold mode toggle (DEC-17-8, both modes labeled with values) |

**Front B commit ledger (Slice 17, batch `S-S17-FRONTB-BATCH-2026-08-11-A`):**

| Commit | Change |
|---|---|
| `7593616` | B0 orbit contrast + first NEA point toning |
| `7a3622d` | B0 responsive panel widths + footer wrap |
| `4daa199` | B0 porkchop-modal hotkey gating + cost-card C3 units |
| `c90b4f6` | batch run report + C2 frame verdict (`tools/frontb-2026-08-11/`) |
| `13580b1` | NEA point retune (superseded — brightness was the wrong axis) |
| `dc19cbd` | starfield default 100 % → 65 %; focused-orbit opacity 0.6 → 0.75 |
| `358d379` | NEA legibility structural fix — pixel-ratio parity, size floor/cap, hue resaturation |
| `b9d25cf` | orbit-opacity assertions derived from source constants, not literals |
| `90790aa` | deploy rebuild carrying the batch |

**Front B Batch 2 commit ledger (Slice 17, batch `S-S17-BATCH2-2026-08-12-A`):**

| Commit | Change |
|---|---|
| `60a6fb6` | A4c size-range + orbit-quality columns; albedo `0.14` generator-verified; display shares the catalog core function |
| `325c115` | B2 scale/frame chips + axis triad + HUD; true-scale claims verified; C2 frame label carried with ecliptic/equatorial caveat |
| `1e99aca` | B1 pan as camera-target offset + "⌂ Reset view"; PAN-SAFE, `dcdb494` anchor path untouched |
| `3a7c686` | B1 discoverability: `?` overlay + tooltip shortcut badges |
| `953c096` | Batch 2 run report + OQ-17-5 evidence in `tools/batch2-2026-08-12/` |
| `5a00907` | deploy rebuild carrying Batch 2 |

---

## Next Session

1. **2026-08 corpus recovery: CLOSED (verified 2026-08-04).** All seven Perplexity re-fetches are tracked: `tools/slice21-research/literature/{P1_EPHEMERIS,P2_EARTH_ORIENTATION,P3_PROPAGATION,P4_SATELLITES,P5_CATALOG_FRESHNESS,QOL_UX}_RESULT.md` + `strategy/research/EXPLAINER_RESULT.md`. The four V6/V7 verification artifacts also landed: prompts at `aebca4a`, results at `efd6409`. The previously-cited `DISPATCH_RESEARCH_INGEST_revA` exists nowhere in the repo (it lives only in the local intake dir `~/aster-intake-2026-08/`); the re-run instruction is removed because the recovery it drove is complete.
2. **Remaining Slice 17:** **B3-B5** (cuttable per founding §5) plus the docs-layer slice-close ritual: D-07 erratum, OQ-17-9 disposition, OQ-17-4 ruling, and §8 close. Laptop-compatible; no visual gates needed.
3. **Batch 2 open items:** OQ-17-5 ruling pending; A4c residual DEC-17-4 columns (orbit class, a/e/i, `dataArcDays`, `nObsUsed`, sigmas); touch pan prerequisite (per-`pointerId` tracking); `MAX_CAMERA_DISTANCE_M` headroom lever (one line, not pre-approved). Home-key naming collision is already resolved as **"⌂ Reset view"**.
4. **Orbit-class tabs do not filter the 3D point cloud** (ATE/APO/AMO/IEO) — a screening class cannot be isolated visually.
5. **Node local-version unify:** align local Node 20 -> 24 to retire the `tests/v2-golden/launch-vehicles.golden.test.mjs` environmental exception.
6. **Work HUDSON'S QUEUE** in `tools/slice16-harness/CLOSE_REPORT.md`; all 14 paths under `tools/slice16-harness/runs/` are tracked evidence.
7. CI hardening (L4-1/L4-3): MCP + Slice 16 suites into Actions; truthful default `npm test`.

**Hardware constraint (recorded 2026-08-13):** desktop retired today; laptop-only from here.

**2026-08-04 · sweep record:** `S-REPO-SWEEP-2026-08-04-A` (independent read-only multi-lens sweep, 9 HIGH findings) ran. This refresh addresses only the STATUS falsehoods and the S17 evidence-header provenance (R-01/R-02). Remaining findings OPEN and deliberately not addressed here: UI copy R-04/R-13 · build reproducibility R-03/R-05/R-16 · label drift R-17.

---

## Cleanup Queue

| ID | Item |
|---|---|
| C1 | CRLF / `.gitattributes` normalization pass. |
| C2 | Windows npm test shim cleanup: `process.execPath` + TypeScript bin, not `.bin` shims. |
| C3 | G0 LOW L-1: `insufficient_data` refusal code defined but unused; do not imply it is emitted. |
| C4 | G0 LOW L-2: `explain_cell` refusal envelopes carry `assumptions: []`; optional polish. |
| C5 | G0 LOW L-3: `as_of` absent on `get_validation_report`; optional polish. |
| C6 | G0 LOW L-4: always `cd mcp` for `npm pack`; `npm --prefix mcp pack` misleads on Windows. |
| C7 | F2 negative-control transcript was performed in-session with no committed artifact; do not cite it as repo evidence. |
| C8 | Re-land New Glenn C3=5 anchor only with elvperf screenshot + oracle row + DEC-13-1 amendment. |
| C9 | Slice 9 replacement propagation-accuracy guard from committed Horizons truth only. |
| C10 | Propagate baked `dirty` into MCP SourceRefs — protected-path dispatch, next package release (= DD-7, founding §26.7). |
| C11 | `.claude/agents` legacy routing (audit L1-1) — see remediation report Phase 6 disposition. |
| C12 | Signed recovery dispatch for the halted attempt-1 ledger: checksum-pinned retry manifest; originals immutable. |

---

## Parked Visual Issues

| ID | Issue |
|---|---|
| V1 | Straight green line artifact on Bennu / asteroid 100926. |
| V2 | NEA cloud vanishes at high zoom-in. |
| V3 | Starfield density / brightness tuning. Default lowered 100 % → 65 % at `dc19cbd`; the cold-reader gate then showed NEA legibility survives 100 %, so this default is a preference, not a fix. Density untouched. |
| V4 | Focus-transition `camera.far` clipping during tween. |
| V5 | Wheel-during-tween `preventDefault` leak. |
| V6 | Same-row refocus zoom behavior. |
| V7 | Point pop at LOD transition. |
| V8 | Picking near/far desync from render camera. |
| V9 | CLOSED at `dcdb494`: focused-asteroid anchor epoch consistency fixed the live-time flicker. |

---

## Uncommitted / Local Notes

Known-dirty, user-owned, **never staged**: `.dispatch-scope` (modified per active dispatch), two `.githooks` mode changes (100644→100755, content-identical), `Untitled.canvas`, `tools/slice16-harness/FULL_RUN_REPORT.md`, and untracked `tools/slice{2,3,4,6}-research/data/2026-07-18_2026-10-16/`. The "three `docs/` CRLF files" previously listed here are gone — `git status --porcelain -- docs/` is clean (verified 2026-08-04); claim removed. **P0-D6 amendment (2026-08-03):** `tools/audit/REPO_AUDIT_2026-07-31.md` was removed from this never-staged list and committed because README.md, STATUS.md, RUNBOOK.md, and the Slice 16 remediation report cite it.

`_rescued-agent-defs/` is TRACKED — 6 files (`git ls-files` verified 2026-08-04: README + 5 V1-era domain agent defs); audit L1-1's "absent" claim is superseded. AGENTS.md §1 still labels the directory "local-only, untracked" — that description is now stale, but AGENTS.md is protected and out of this refresh's scope. `.claude/agents/` now contains only a README.md. Local `.claude/skills/*.md` edits are not project state.
