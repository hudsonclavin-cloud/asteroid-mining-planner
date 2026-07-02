# Slice 12 (DLA overlay) — Research Summary

Pre-research captured for a future DLA / launch-feasibility porkchop overlay, deferred from Slice 11 (§7 — required launch-site assumptions out of Slice 11 scope).

---

## 1. The physical constraint

- **DLA = Declination of Launch Asymptote** = angle between the Earth-departure hyperbolic excess velocity vector (v∞) and Earth's equatorial plane.
- **Hard rule:** |DLA| ≥ |launch-site latitude| for any DIRECT (no-dogleg) prograde launch. Derivation: spherical trig gives cos(i) = cos(φ)·sin(A), where i = orbit inclination, φ = site latitude, A = launch azimuth from north. Minimum inclination is at due-east launch (A=90°) → i = φ. DLA equals departure-trajectory inclination, so |DLA| ≥ |φ|.

  > **ERRATUM (2026-07-02):** The inequality above is INVERTED. A parking orbit of
  > inclination i contains asymptote declinations |DLA| <= i (RAAN chosen at launch),
  > so LOW declinations are the free/optimal side and the constraint is
  > i >= |DLA| with i bounded by the site's azimuth corridor. Verified model and
  > sources: SLICE_12_FOUNDING.md OQ-12-2 + AMD-12-1 (NASA Trajectory Browser guide;
  > NASA shuttle-era azimuth limits; DART screening gate |DLA| < 28.5 deg).
  > This wrong line propagated three times before being contained - do not cite it.
- **Cape Canaveral:** φ = 28.5°N → cannot directly reach |DLA| < 28.5°. Azimuth corridor 40°–115°.
- **Vandenberg:** φ = 34.4°N → cannot directly reach |DLA| < 34.4°.

  > **ERRATUM (2026-07-02):** The two site bullets above inherit the same inverted
  > inequality. Low |DLA| is not the unreachable side for Cape; the sourced band model
  > is recorded in SLICE_12_FOUNDING.md OQ-12-2 + AMD-12-1.

---

## 2. Dogleg cost (why infeasibility is a HARD constraint)

- Plane-change Δv ≈ 2·V·sin(Δi/2), V ≈ 7.8 km/s at LEO.
- Δi=5° → ~0.68 km/s (~14% payload loss); Δi=10° → ~1.36 km/s (~26% loss); Δi=15° → ~2.04 km/s (~37% loss).
- Implication: a DLA outside the site band isn't "slightly worse," it's a major payload penalty. Treat |DLA| > achievable as effectively infeasible for the overlay's purpose.

---

## 3. Computing DLA from the existing Lambert output

- **Formula:** DLA = arcsin(v∞,Z / |v∞|), where v∞,Z is the Earth-EQUATORIAL-frame z-component.
- **CRITICAL frame note:** Aster's Lambert solver outputs v∞ in heliocentric ECLIPTIC frame (per AMD-7's locked convention: r1=Earth@departure, r2=asteroid@arrival, vInfDep = departure excess velocity). The DLA formula needs Earth-EQUATORIAL frame. So ONE rotation is required: rotate v∞ by the obliquity ε ≈ 23.44° about the X-axis (ecliptic→equatorial) BEFORE extracting z.

  Rotation: Rx(−ε) = [[1,0,0],[0,cosε,sinε],[0,−sinε,cosε]], giving:

  ```
  v∞,Z_equatorial = v∞,Y_ecliptic · sin(ε) + v∞,Z_ecliptic · cos(ε)
  ```

- **Cost:** this is cheap per-cell algebra on the worker's EXISTING vInfDep output — same category as the Phase D ΔV stack (no new Lambert solves). Zero added Lambert cost.
- **Origin shift (Sun→Earth) does NOT affect v∞ as a free vector** — only the obliquity rotation matters.

---

## 4. Feasibility check (per cell, per site)

- S = cos(DLA) / cos(φ). If |S| ≤ 1, a direct launch azimuth exists: A = arcsin(S). If |S| > 1 (equivalently |DLA| < |φ|), no direct solution — dogleg required.

---

## 5. Overlay approach (reuses existing Slice 11 machinery)

- DLA is a scalar field over the (departure-date × TOF) grid, exactly like C3. Reuse the EXISTING marching-squares contour code from the porkchop — different scalar field, same algorithm.
- **NASA/JPL precedent:** porkchops show DLA as contour OVERLAYS (dashed/colored lines), NOT shaded infeasibility bands. Designers compare contour value against site latitude manually.
- **Proposed contour levels:** 0°, ±15°, ±28.5° (Cape), ±30°, ±34.4° (Vandenberg), ±45° — site latitudes as meaningful reference lines.
- **Site-selector UI:** pick Cape / Vandenberg / custom latitude. Changes only the feasibility INTERPRETATION (which DLA band reads as reachable), not the DLA computation.

---

## 6. Disclosed assumption (INV-016c style, for the future founding doc)

"Direct prograde launch only; doglegs not modeled. DLA computed in J2000 mean equator (obliquity ε=23.44°, precession/nutation neglected for overlay-grade accuracy)." Same disclosure pattern as the ΔV stack's 200km-LEO / 150m/s-stationkeeping / 10%-margin.

---

## 7. Open questions to resolve in the Slice 12 founding doc (NOT now)

- Where exactly does the obliquity rotation live (worker, or post-process like the ΔV stack)?
- Does DLA go in the modal, the dedicated route, or both? (cf. DEC-6 scoping for the ΔV stack)
- Static obliquity constant vs per-epoch — is J2000 mean obliquity sufficient, or does the departure-date variation matter at overlay resolution? (Likely static is fine; confirm.)

---

## Sources

Note: these are research-grade (Perplexity threads + two compiled research PDFs), NOT yet verified against an external oracle. The DLA formula + obliquity rotation should be validated (e.g. against poliastro or a known mission's published DLA) before locking, per verify-before-lock discipline. NASA Trajectory Browser, NASA Earth-to-Mars design handbook (2010), Atchison et al. ISSFD 2007 (porkchop DLA annotations) are the cited primary sources.
