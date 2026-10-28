# S19.5 tail 2 - copy diff (before -> after)

Routes: /v2/porkchop/ (F1-F3, F5), /v2/ catalog panel (F4), /v2/solar-system HUD+help (F6), /v2/about/ and /v2/compare/ (F7).

## F1 (A6) AMBER wording - aeef9ae
- src/v2/porkchop/porkchop-view.ts:1505 (pinned readout, /v2/porkchop/)
  before: Advisory: Raised-inclination injection - plane-matching handled by launch geometry at negligible ΔV (below screening error bars); a vehicle payload penalty still applies (vehicle-dependent).
  after:  Advisory: Raised-inclination injection - plane-matching is absorbed by launch geometry: zero added ΔV in this model (below screening error bars); a payload penalty for this launch site and vehicle still applies.
- src/v2/app/porkchop/main.ts:873 (cost card row, unit m/s as in neighbouring rows)
  before: ~0 (launch-geometry, AMBER)
  after:  0 m/s (modelled; launch-geometry, AMBER)
## F2 (B4) delivered-mass caveat - aeef9ae (same commit as F1; the two share one test file)
- src/v2/app/porkchop/main.ts:820
  before: Delivered mass excludes the launch-site payload penalty named above; Aster does not model it.
  after:  Delivered mass excludes that payload penalty; Aster does not model it.
  REVERSAL (Nova catches Nova): copy-table entry C-6 ("launch-site payload penalty named above") was wrong. The advisory names a vehicle payload penalty; the noun is now "payload penalty" in both places.
## F3 (A10) Replay-tour tooltip - 4c79fc0
- src/v2/app/porkchop/main.ts:634
  before: Restores FK3, Cape Canaveral, and DLA-on before replaying. First-visit flag: aster.fk3TourSeen
  after:  Restores FK3, Cape Canaveral, and DLA-on before replaying.
- Sweep of title/aria-label/placeholder/alt text under src/v2/app/** and v2/**/index.html for aster\., localStorage, sessionStorage, OQ-, DEC-, INV-, AMD-, "Slice \d" (single-line and multi-line forms): the Replay tooltip was the only hit. The unused FK3_TOUR_STORAGE_KEY import in porkchop/main.ts was removed.
## F4 (B5) catalog footer - e2bca8f
- src/v2/app/catalog-list/honesty-disclosure.ts:30-34 (footerText; click hint unchanged)
  before: Patched-conic screen · 2026-01-01–2040-12-31 · click for details
  after:  Patched-conic screen — cached departures through 2040-12-31; the porkchop grid ends 2040-01-01. · click for details
  Derived: 2040-12-31 from the cache metadata screeningWindow.endUtc; 2040-01-01 from the new shared constant src/v2/porkchop/grid-span.ts PORKCHOP_DEPARTURE_END_UTC, which porkchop/main.ts GRID_PARAMS now also uses. The cache start date is no longer shown. Not changed: overlay.ts, porkchop-smoke and compare still carry their own '2040-01-01' literals.
## F5 (B6) launch-site ceiling - d5d9b8d
- src/v2/porkchop/porkchop-view.ts:1376
  Cause: Vandenberg dlaCeilingDeg = 90 in committed core data (src/v2/core/lambert/feasibility.ts:49), so the legend took the "no ceiling" branch and printed a different sentence; there was no "ceiling" line. By design, not a defect.
  before: no dogleg band - corridor covers all declinations from Vandenberg SFB
  after:  max direct declination (ceiling): none from Vandenberg SFB; no dogleg band, corridor covers all declinations from Vandenberg SFB
## F6 (B7, B8) outside ephemeris coverage - 69d6481
What Shift+N does (runtime.ts:2230-2233, 2284-2286): sets tracking; each frame sets time = clamp(wall clock, timeMin, timeMax). Past coverage it lands on the END of coverage and stays labelled NOT LIVE.
- src/v2/app/solar-system/runtime.ts:1134 (help panel, derived at open from the wall clock)
  inside coverage: Shift+N resume live time (unchanged)
  after coverage:  Shift+N jump to the end of coverage (live time is outside it)
  before coverage: Shift+N jump to the start of coverage (live time is outside it)   [added for symmetry; the clamp does the same]
- src/v2/app/solar-system/runtime.ts:1821 (HUD UTC line)
  before: 2026-10-16 ... UTC
  after (tracking and wall clock outside coverage): <UTC line> (clamped, not now)
## F7 (B9, B10) - 1641ddd
- src/v2/app/about/main.ts:326,331 (/v2/about/)
  before: Launch-feasibility overlay - founding document ⭐ ; Mission cost card - founding document ⭐
  after:  same text without the star
  A scan of src/v2/app/** and v2/**/index.html for pictographs found no other emoji.
- src/v2/app/compare/main.ts:835 (/v2/compare/)
  before: 13 meet the breadth qualifier
  after:  13 meet the breadth qualifier (a window at least 2 departure cells wide, 7.00 d)
  Derived: 2 from B_MIN_CELLS (compare/main.ts:123, DEC-17-8); days = (B_MIN_CELLS - 1) * echo.depCellDays, the same breadthDays convention as segment-windows.ts:271.
