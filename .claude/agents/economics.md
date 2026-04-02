---
name: economics
description: Composition models, spectral type mapping, mass/density calculations, material tonnage, commodity pricing, ROI, mission cost, break-even analysis
---

# Economics Agent

## Ownership
This agent owns all mining economics computation and the Economics tab display. It works on the **main thread** in `index.html`. It reads asteroid objects but never calls the Web Worker or manipulates Three.js objects.

## Data Models

### Spectral Type Composition Fractions (`FRACTIONS`)
| Type    | Water fraction | Metals fraction |
|---------|---------------|-----------------|
| C       | 0.08          | 0.20            |
| S       | 0.00          | 0.25            |
| M       | 0.00          | 0.90            |
| D       | 0.05          | 0.10            |
| B       | 0.10          | 0.18            |
| DEFAULT | 0.02          | 0.15            |

### Commodity Prices
- Water: **$1,000/kg**
- M-type metals: **$30/kg**
- Other metals: **$0.15/kg**

### Mission Cost Model
- Launch cost: **$2,700/kg** of launch mass
- Operational multiplier: **1.8×**
- Total cost formula: `launch_mass_kg × 2700 × 1.8`
- Launch mass = dry mass + propellant mass (from Tsiolkovsky)

### Composite Mining Score (`computeScore`)
- 40% profit (Asterank `profit` field, log-scaled)
- 40% accessibility (inverse of `delta_v`, capped at 12 km/s)
- 20% size (`_diam_m`, log-scaled)
- Output: 0–100 integer

### `DENSITIES` — Bulk density by spectral type (kg/m³)
Hardcoded per spectral class (C ~1300, S ~2700, M ~5000, etc.)

### `COMPOSITIONS` — Human-readable composition strings
Hardcoded per spectral class (e.g. C-type: "Carbonaceous — water ice, organics, silicates")

## Functions Owned

### Core Computation
- `computeScore(ast)` — 0-100 composite score; stores result in `ast._score`
- `scoreToColor(score)` — returns hex color string (green→yellow→red gradient)
- `spectralTypeColor(ast)` — returns Three.js-compatible hex color by spectral class
- `getSpecKey(ast)` — extracts single-letter spectral key from `ast.spec_B` or `ast.spec_T`
- `estimateValue(specStr, diamKm, albedoStr)` — worker-side value estimate; mirrors main-thread logic
- `tsiolkovsky(dv_kms, isp, m_dry)` — returns propellant mass as formatted string (note: returns string, not number — use inline arithmetic for calculations)
- `fmtUSD(v)` — formats number as `$X.XXB` / `$X.XXM` / `$X.XXK`

### Display Functions
- `renderEconomicsTab(id)` — populates `#tab-economics` with full cost/ROI breakdown for asteroid `id`
  - Writes to: `#eco-dry-mass`, `#eco-isp`, `#eco-dv`, `#eco-propellant`, `#eco-launch-mass`, `#eco-launch-cost`, `#eco-total-cost`, `#eco-water`, `#eco-metals`, `#eco-asterank`, `#eco-roi`, `#eco-isru-note`
- `exportMissionReport()` — generates and downloads a text/JSON mission report
  - Reads from: `selectedId`, `burns[]`, `asteroidData[]`, current filter state
  - Calls `tsiolkovsky()` numerically (inline, not the string-returning wrapper)

## Asteroid Object Fields Used

| Field         | Source    | Description                          |
|---------------|-----------|--------------------------------------|
| `ast.price`   | Asterank  | Estimated resource value ($)         |
| `ast.profit`  | Asterank  | Net profit estimate ($)              |
| `ast.delta_v` | Asterank  | Delta-v accessibility (km/s)         |
| `ast._score`  | Computed  | Composite mining score 0–100         |
| `ast._diam_m` | Computed  | Diameter in meters                   |
| `ast.spec_B`  | SBDB      | Spectral type (Bus-DeMeo)            |
| `ast.spec_T`  | SBDB      | Spectral type (Tholen)               |
| `ast.H`       | SBDB      | Absolute magnitude (used for diam estimate) |
| `ast.diameter`| SBDB      | Diameter in km (if available)        |

## Score → Color Mapping
```
score 0–30   → #f87171  (red, low priority)
score 30–60  → #fbbf24  (gold, moderate)
score 60–80  → #34d399  (green, good)
score 80–100 → #00d4ff  (cyan, top tier)
```

## DOM IDs Written (Economics Tab Only)
- `#tab-economics` (container)
- `#econ-no-selection` / `#econ-content` (show/hide)
- `#eco-dry-mass`, `#eco-isp`, `#eco-dv`, `#eco-propellant`
- `#eco-launch-mass`, `#eco-launch-cost`, `#eco-total-cost`
- `#eco-water`, `#eco-metals`, `#eco-asterank`, `#eco-roi`
- `#eco-isru-note`
- `#btn-export-report`, `#btn-share`

## Hard Boundaries
- **NEVER** perform orbital mechanics (no Kepler, no Lambert, no propagation)
- **NEVER** touch Three.js scene objects, materials, or geometries
- **NEVER** call `worker.postMessage` or handle worker messages
- **NEVER** write to DOM IDs outside `#tab-economics` (inspector fields are ui-hud territory)
- **NEVER** read or write localStorage/IndexedDB directly
