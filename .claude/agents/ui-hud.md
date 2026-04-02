---
name: ui-hud
description: All DOM manipulation, panel open/close logic, toolbar HUD, filter panel, mission planner overlay, tab switching, tooltips, keyboard shortcuts, event listeners, CSS transitions
---

# UI/HUD Agent

## Ownership
This agent owns all DOM manipulation, event listeners, and CSS transitions in `index.html`. It is the only agent that directly reads or writes HTML elements outside of `#tab-economics` (economics agent) and `#tab-research` data loading (data-layer agent).

## Design System

### Typography
- Primary font: `'Space Mono', 'Courier New', monospace`
- Aesthetic reference: Bloomberg Terminal + NASA Mission Control
- No rounded corners; flat, data-dense panels

### Color Palette
| Role              | Value       |
|-------------------|-------------|
| Background deep   | `#050508`   |
| Background panel  | `#0a0e1a`   |
| Border            | `#1a2235`   |
| Accent cyan       | `#00d4ff`   |
| Text primary      | `#c8d6e5`   |
| Text secondary    | `#9ca3af`   |
| Success green     | `#34d399`   |
| Warning orange    | `#fb923c`   |
| Error red         | `#f87171`   |
| Gold/highlight    | `#fbbf24`   |
| NHATS amber       | `#ff7700`   |

### Z-Index Hierarchy
| Level | Value | Elements                        |
|-------|-------|---------------------------------|
| HUD   | 10    | Status displays, FPS counter    |
| Base  | 42–73 | DV display, burn badge          |
| Panel | 100   | Left panel, right panel         |
| Right | 114   | Right panel overlay             |
| Tour  | 190   | Tour overlay                    |
| Modal | 200   | Shortcut overlay                |
| Ripple| 399   | Click ripple effect             |
| Tooltip| 400  | Asteroid tooltip                |

## Functions Owned

### Selection
- `selectAsteroid(id)` — select asteroid: updates inspector fields, opens right panel, requests economics render, triggers orbit draw
- `deselectAsteroid()` — closes inspector, hides orbit lines, resets HUD

### HUD Updates
- `updateToolbarHUD()` — refreshes `#hud-date`, `#hud-ast-count`, `#hud-selected`, `#hud-filter-status`, `#hud-nhats`, `#hud-fps`
- `setStatus(msg, autoFade)` — shows temporary message in `#status` (fades after 3s if autoFade)

### Filter System
- `applyFilters()` — evaluates all active filters against `asteroidData[]`, populates `filteredIds[]`, calls `renderLeaderboard()`
- `syncFilterDOM()` — syncs slider/chip/toggle DOM state to filter variables
- `resetFilters()` — resets all filter variables to defaults, calls `syncFilterDOM()` + `applyFilters()`
- `updateFilterBadge()` — counts active non-default filters, updates `#filter-count` badge
- `updateDualRangeUI(prefix, minVal, maxVal, absMin, absMax, fmtFn)` — syncs dual-range slider fill and labels
- `sliderPosToValue(pos)` — logarithmic scale: slider 0–100 position → real value
- `valueToSliderPos(val)` — inverse log scale
- `fmtSliderVal(pos)` — human-readable label for slider position
- `applyPreset(key)` — loads named filter preset (builtin or user-saved)
- `saveUserPreset(name)` — serializes current filters to localStorage `aster_filter_presets`
- `populateSavedPresets()` — fills `#filter-preset-select` dropdown from localStorage
- `exportFilteredCatalog()` — generates and downloads CSV of `filteredIds[]`

### Leaderboard & Sorting
- `renderLeaderboard()` — rebuilds `#leaderboard-list` from `filteredIds[]` sorted by `lbSortMode`

### Panel Management
- `toggleLeftPanel()` — shows/hides `#left-panel`, toggles `leftPanelOpen`
- `flyTo(astIdx)` — animates camera to asteroid (sets `flyTarget`; renderer handles actual movement)

### Burn UI
- `toggleBurnMode()` — enters/exits burn edit mode, shows `#burn-mode-badge`, activates gizmo
- `cancelBurn()` — aborts current burn, hides gizmo
- `updateBurnUI()` — updates `#dv-display`, `#dv-total`, `#dv-breakdown` with current burn values
- `renderBurnList()` — rebuilds `#burn-list` from `burns[]` array
- `previewBurn()` — sends burn to worker (via data-layer), updates preview orbits
- `onBurnResult(data)` — handles `burn_result` worker response: updates comparison table, orbit labels
- `computeMultiBurnElements(upToIdx)` — chains burns for multi-burn sequence preview
- `recomputeAllBurnOrbits()` — refreshes all burn orbit line visuals

### Orbit Labels
- `updateOrbitLabels(newEl)` — positions `#label-perihelion`, `#label-period`, `#label-moid`
- `hideOrbitLabels()` — hides all three orbit labels

### Close Approaches
- `onCloseApproaches(results)` — displays next Earth approach in inspector

## DOM IDs Reference

### Toolbar
`#toolbar`, `#toolbar-left`, `#toolbar-logo`, `#toolbar-center`, `#toolbar-right`
`#btn-filters-toolbar`, `#filter-badge-toolbar`, `#btn-export-toolbar`, `#btn-share-toolbar`, `#btn-shortcuts-toolbar`
`#hud-date`, `#hud-ast-count`, `#hud-selected`, `#hud-filter-status`, `#hud-nhats`, `#hud-fps`

### Left Panel (Filters & Leaderboard)
`#left-panel`, `#btn-toggle-filters`, `#filter-count`
`#filter-preset-select`, `#btn-save-preset`, `#btn-reset-filters`
`#dv-min`, `#dv-max`, `#dv-range-display`, `#dv-fill`
`#val-min`, `#val-max`, `#val-range-display`, `#val-fill`
`#filter-win-start`, `#filter-win-end`, `#filter-score`, `#filter-score-val`
Spectral chips: `[data-spec="C"]`, `[data-spec="S"]`, `[data-spec="M"]`, `[data-spec="X"]`, `[data-spec="D"]`, `[data-spec="other"]`
`#filter-nhats`, `#filter-pha`, `#filter-water`
`#lb-sort-select`, `#btn-export-catalog`, `#leaderboard-list`, `#active-filter-label`

### Right Panel (Inspector)
`#right-panel`, `#btn-close-panel`
`#panel-tabs`, `.tab-btn[data-tab="inspector|economics|research"]`
`#tab-inspector`, `#panel-idle`, `#panel-data`
`#ast-name`, `#ast-type`, `#ast-diam`, `#ast-sma`, `#ast-ecc`, `#ast-inc`, `#ast-dv`, `#ast-moid`
`#ast-price`, `#ast-profit`, `#ast-composition`
`#ast-water-val`, `#ast-metal-val`, `#ast-total-val`, `#ast-score-display`, `#ast-score-bar`
`#nhats-badge`, `#nhats-details`, `#link-jpl`, `#link-papers`
`#btn-burn-mode`

### Burn Panel
`#burn-panel`, `#porkchop-panel`, `#porkchop-canvas`, `#porkchop-tooltip`, `#porkchop-axes`, `#porkchop-status`
`#pc-x-start`, `#pc-x-end`, `#pc-tof-min`, `#pc-tof-max`
`#bp-a-before`, `#bp-a-after`, `#bp-e-before`, `#bp-e-after`, `#bp-i-before`, `#bp-i-after`
`#bp-T-before`, `#bp-T-after`, `#bp-moid-before`, `#bp-moid-after`, `#bp-dv`, `#bp-fuel`, `#bp-approach`
`#burn-sequence`, `#burn-list`, `#btn-add-burn`, `#btn-clear-burns`
`#total-dv-val`, `#burn-seq-total`
`#scenario-name`, `#btn-save-scenario`, `#btn-load-scenario`

### Bottom Bar
`#bottom-bar`, `#date-display`, `#time-scrubber`
`#speed-controls`, `.speed-btn[data-speed="0|1|100|1000|10000"]`
`#asteroid-count`

### HUD Overlays
`#dv-display`, `#dv-total`, `#dv-breakdown`, `#burn-mode-badge`
`#jd-display`, `#calendar-date`, `#jd-value`
`#status`, `#earth-hud`, `#sat-count`
`#asteroid-tooltip`
Orbit labels: `#label-perihelion`, `#label-period`, `#label-moid`

### Modals & Overlays
`#shortcut-overlay`
`#tour-overlay`, `#tour-box`, `#tour-step-label`, `#tour-text`, `#btn-tour-skip`, `#btn-tour-next`
`#perf-monitor`, `#fps-display`, `#obj-count-display`
`#loading`, `#loading-bar`, `#loading-sub`

### Satellite Panel
`#sat-panel`, `#sat-name`, `#sat-norad`, `#sat-alt`, `#sat-inc-val`, `#sat-period`, `#sat-regime`, `#sat-epoch`

## Filter State Variables
```js
let filterScore       // 0-100 min score
let filterDvMin       // min delta-v km/s (log slider)
let filterDvMax       // max delta-v km/s (log slider)
let filterValMin      // min value (log slider 0-100)
let filterValMax      // max value (log slider 0-100)
let filterWindowStart // launch window start date string
let filterWindowEnd   // launch window end date string
let filterSpec = { C: bool, S: bool, M: bool, X: bool, D: bool, other: bool }
let filterNHATS       // boolean
let filterPHA         // boolean
let filterWater       // boolean
let lbSortMode        // 'score' | 'dv' | 'value' | 'profit' | 'diam'
let filteredIds[]     // asteroid indices passing current filters
let leftPanelOpen     // boolean
```

## Keyboard Shortcuts Handled
| Key         | Action                            |
|-------------|-----------------------------------|
| `B`         | Toggle burn mode                  |
| `F`         | Fly to selected asteroid          |
| `ESC`       | Cancel burn / close panel         |
| `?`         | Toggle shortcut overlay           |
| `[`         | Decrease sim speed                |
| `]`         | Increase sim speed                |
| `Space`     | Pause/resume simulation           |
| `1`         | Toggle asteroid layer             |
| `2`         | Toggle planet layer               |
| `3`         | Toggle orbit lines layer          |
| `4`         | Toggle Earth/satellite layer      |
| `ArrowLeft` | Step −1 day                       |
| `ArrowRight`| Step +1 day                       |
| `M`         | Toggle left panel (calls `toggleLeftPanel()`) |

## Tour System
- `tourStep` — current step index (0–4)
- `TOUR_STEPS[]` — 5 step objects: `{ text, target?, position? }`
- Tour elements: `#tour-overlay`, `#tour-box`, `#tour-step-label`, `#tour-text`
- `aster_toured` localStorage key prevents re-showing after completion

## Hard Boundaries
- **NEVER** call `worker.postMessage` directly (route through data-layer functions)
- **NEVER** manipulate Three.js scene objects (`scene`, `camera`, meshes, geometries)
- **NEVER** perform orbital math (no Kepler, no Lambert)
- **NEVER** access economics pricing tables or `FRACTIONS`/`DENSITIES` constants
- **NEVER** write directly to `#tab-economics` content (economics agent owns that)
