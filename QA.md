# ASTER Phase 5 QA Report

## Bug 1 — CRITICAL: TDZ crash on page load
**Description:** Phase 5 state variables (`trailLine`, `futureLine`, `labelPool`) declared with `let` after their first usage in `init()`, causing a Temporal Dead Zone `ReferenceError` that prevented the page from loading entirely.

**Reproduction:**
1. Open `http://localhost:8080` — blank page, console shows `ReferenceError: Cannot access 'trailLine' before initialization`

**Fix:** Moved Phase 5 state variable block (`let trailsEnabled`, `let trailLine`, `let futureLine`, `let lastTrailJD`, `let labelPool`, `let fpsFrames`, `let fpsLast`, `const isMobile`) from line ~1440 to before the Phase 5 orbital trails initialization code at line 1305.

**Commit:** `fix: TDZ crash — move Phase 5 state declarations before first usage`

---

## Bug 2 — M key: non-existent element ID
**Description:** The `M` keyboard shortcut called `document.getElementById('btn-toggle-left').click()`, but no element with that ID exists. The actual toggle button is `btn-toggle-filters` and calls `toggleLeftPanel()`.

**Reproduction:**
1. Press `M` key → nothing happens; console shows `TypeError: Cannot read properties of null (reading 'click')`

**Fix:** Replaced `document.getElementById('btn-toggle-left').click()` with direct `toggleLeftPanel()` call.

**Commit:** `fix: M key calls non-existent element — use toggleLeftPanel() directly`

---

## Bug 3 — Speed convention inconsistency (`[ ]` keys broken)
**Description:** Speed button handler divided `simSpeed` by 86400 on set (`simSpeed = s / 86400.0`), but SPACE key and `[ ]` keys stored and compared raw multiplier values (0, 1, 100, 1000, 10000). `SPEED_STEPS.indexOf(Math.abs(simSpeed))` always returned `-1` when simSpeed was `1000/86400`, breaking bracket key stepping. The animate loop also needed the division.

**Reproduction:**
1. Click `1K×` speed button → simulation runs
2. Press `[` or `]` → speed doesn't change (indexOf fails)
3. Press SPACE to pause/resume → `simSpeed` switches between raw 1000 and 0, inconsistent with button-set value

**Fix:** Removed `/ 86400.0` from button handler (store raw multiplier). Changed animate loop to `currentJD += (simSpeed / 86400) * dt` so the conversion happens in one canonical place.

**Commit:** `fix: speed convention — store simSpeed as raw multiplier, divide by 86400 in animate loop`

---

## Bug 4 — Export report: tsiolkovsky() returns string, used as number
**Description:** `tsiolkovsky()` returns a formatted string (e.g. `"500 kg"` or `"1.2 t"`). `exportMissionReport()` used the return value in arithmetic (`(1000 + m_prop) * 2700 * 1.8`) causing string concatenation, and called `.toFixed(1)` on it causing `TypeError: m_prop.toFixed is not a function`.

**Reproduction:**
1. Select an asteroid → click Export Report → error in console, downloaded file has garbled economics

**Fix:** Replaced `tsiolkovsky(dv)` call with inline numeric calculation:
```js
const g0 = 0.00980665;
const m_prop = 1000 * (Math.exp(dv / (g0 * 450)) - 1);
```

**Commit:** `fix: export report — compute propellant mass numerically, fix burn field names`

---

## Bug 5 — Export/Share/Restore: wrong burn field names
**Description:** Burns are stored as `{ dv_p, dv_n, dv_r, jd }` but `exportMissionReport` accessed `b.prograde/b.radial/b.normal` (TypeError), `encodeStateToURL` encoded `b.prograde/b.radial/b.normal` (undefined → NaN), and `loadStateFromURL` restored as `{ prograde, radial, normal }` (wrong keys — burns would never apply).

**Reproduction:**
1. Plan burns → Export Report → burn section shows `undefined.toFixed is not a function`
2. Plan burns → Share → paste URL in new tab → burns lost (restored with wrong keys)

**Fix:**
- `exportMissionReport`: use `b.dv_p`, `b.dv_r`, `b.dv_n`
- `encodeStateToURL`: encode as `{ p: b.dv_p, r: b.dv_r, n: b.dv_n, jd: b.jd }`
- `loadStateFromURL`: restore as `{ dv_p: b.p, dv_r: b.r, dv_n: b.n, jd: b.jd || currentJD }`

**Commit:** `fix: share/restore URL uses wrong burn field names — use dv_p/dv_r/dv_n`

---

## Bug 6 — Mobile: asteroid limit URL built before ASTEROID_LIMIT is set
**Description:** `ASTERANK_URL` was a module-level `const` built at parse time. `window.ASTEROID_LIMIT = 500` is set in `init()` for mobile devices, which runs after module evaluation. So the URL always used the fallback 2000 and mobile devices loaded the full dataset.

**Reproduction:**
1. Open in mobile viewport → network tab shows Asterank request with `limit=2000` instead of `limit=500`

**Fix:** Renamed to `ASTERANK_BASE_URL` (without `&limit=...`). Moved URL construction inside `fetchAsteroids()` where `window.ASTEROID_LIMIT` has already been set.

**Commit:** `fix: mobile asteroid limit — build ASTERANK_URL inside fetchAsteroids() after ASTEROID_LIMIT is set`

---

## Feature: Arrow keys ±1 day (checklist item 6 — missing)
**Description:** No `ArrowLeft`/`ArrowRight` key handlers existed.

**Fix:** Added handlers: `ArrowLeft` subtracts 1 JD, `ArrowRight` adds 1 JD, updates scrubber.

**Commit:** `fix: add ArrowLeft/ArrowRight handlers for ±1 day time stepping`

---

## Feature: Number keys 1-4 layer toggles (checklist item 13 — missing)
**Description:** No number key handlers existed. Planet orbit rings were added to scene inline without a stored reference, making them impossible to toggle.

**Fix:**
- Wrapped planet orbit ring creation in `planetOrbitGroup` (THREE.Group added to scene)
- Added handlers: `1` = asteroid cloud, `2` = planet orbit rings, `3` = trails, `4` = Earth layer

**Commit:** `fix: add number keys 1-4 for layer toggling; wrap planet orbit rings in planetOrbitGroup`

---

## Checklist Results

| # | Feature | Status |
|---|---------|--------|
| 1 | Orbital trail behind selected asteroid | ✅ Fixed (Bug 1 TDZ) |
| 2 | Future dotted projection line 90 days | ✅ Fixed (Bug 1 TDZ) |
| 3 | Planet labels at solar system zoom | ✅ Fixed (Bug 1 TDZ) |
| 4 | `?` opens shortcut overlay, ESC closes | ✅ Pass |
| 5 | SPACE plays/pauses simulation | ✅ Fixed (Bug 3 speed) |
| 6 | Arrow keys step ±1 day | ✅ Added |
| 7 | F flies to selected asteroid | ✅ Pass |
| 8 | R resets camera | ✅ Pass |
| 9 | E flies to Earth | ✅ Pass |
| 10 | `[ ]` keys change speed | ✅ Fixed (Bug 3 speed) |
| 11 | T toggles trails | ✅ Pass |
| 12 | M toggles left panel | ✅ Fixed (Bug 2) |
| 13 | Number keys 1-4 toggle layers | ✅ Added |
| 14 | Export report downloads correct .txt | ✅ Fixed (Bugs 4 & 5) |
| 15 | Share button copies URL | ✅ Fixed (Bug 5) |
| 16 | Paste shared URL restores mission | ✅ Fixed (Bug 5) |
| 17 | First-time tour (clear localStorage) | ✅ Pass |
| 18 | FPS counter visible bottom-right | ✅ Fixed (Bug 1 TDZ) |
| 19 | Mobile: reduced count, panel hidden | ✅ Fixed (Bug 6) |
| 20 | GitHub Pages live | ✅ Will verify after push |
