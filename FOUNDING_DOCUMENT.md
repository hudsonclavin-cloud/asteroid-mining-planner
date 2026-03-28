# Aster — Asteroid Mining Mission Planner
## Founding Document v1.0 | 2026-03-27

---

## 1. Project Name, Vision, and Mission Statement

**Name:** Aster

**Vision:** The Bloomberg Terminal of space resource extraction.

**Mission Statement:**
Aster is a real-time 3D asteroid mining mission planning tool that gives engineers, researchers, and space entrepreneurs a single interface to identify high-value asteroid targets, simulate orbital mechanics, calculate mission economics, and optimize launch windows — all running in the browser with no installation required. Where other space tools are academic visualizers, Aster is a decision-support system: every pixel on screen exists to answer the question "which rock, launched when, for how much, returns what value?"

---

## 2. Tech Stack with Justification

| Component | Choice | Justification |
|---|---|---|
| Application shell | Single `index.html` | Zero-friction deployment to GitHub Pages; no build pipeline to maintain; entire app is one URL |
| Physics worker | `physics.worker.js` | Web Workers cannot be inlined in HTML without a Blob URL hack that degrades debuggability; this is the one intentional exception to the single-file rule |
| 3D rendering | Three.js r128 (CDN) | Mature WebGL abstraction, large community, r128 is stable and well-documented; CDN delivery means zero local dependencies |
| Language | Vanilla JavaScript | No transpiler, no framework churn, no dependency tree — the entire codebase is auditable in a browser DevTools session |
| Hosting | GitHub Pages | Free, SSL, CDN-backed, deploys on `git push` |
| Physics concurrency | Web Worker | Keeps the render thread free; orbital propagation for 10k+ objects is CPU-intensive; Worker ↔ main thread communicate via `postMessage` with transferable ArrayBuffers |

**No npm. No webpack. No React. No build step.** If it requires `node_modules`, it doesn't belong here.

---

## 3. Data Sources

### 3.1 Asterank API (Primary — asteroid economics + orbital elements)
```
https://www.asterank.com/api/asterank?query={...}&limit=2000
```
**Fields used:**
- `full_name` — display name
- `a`, `e`, `i`, `om`, `w`, `ma` — orbital elements (semi-major axis AU, eccentricity, inclination deg, RAAN deg, argument of periapsis deg, mean anomaly deg)
- `epoch` — elements epoch (MJD)
- `price` — estimated resource value (USD)
- `profit` — estimated net profit after mission cost (USD)
- `delta_v` — minimum ΔV to rendezvous (km/s)
- `spec` — spectral type (C, S, M, etc.)
- `diameter` — estimated diameter (km)
- `moid` — minimum orbit intersection distance with Earth (AU)

### 3.2 NHATS API (Human-Accessible NEAs with ΔV budgets)
```
https://ssd-api.jpl.nasa.gov/nhats.api
```
**Fields used:**
- `des` — designation (cross-reference key to SBDB)
- `min_dv` — minimum total ΔV (km/s) for round trip
- `n_via_points` — number of viable trajectory options
- `min_stay` — minimum stay time at target (days)
- `obs_start`, `obs_end` — observation opportunity window

### 3.3 JPL SBDB (Single-object deep dives)
```
https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={des}&cov=1&phys-par=1
```
**Fields used:**
- Full orbital solution with covariance
- Physical parameters: `H` (absolute magnitude), `diameter`, `albedo`, `spec_T`, `spec_B`
- Close-approach data
- Discovery circumstances

### 3.4 JPL Close Approach Data (Launch windows)
```
https://ssd-api.jpl.nasa.gov/cad.api?body={des}&date-min={start}&date-max={end}
```
**Fields used:**
- `cd` — close approach date (calendar)
- `dist` — nominal approach distance (AU)
- `v_rel` — relative velocity at approach (km/s)
- `v_inf` — V-infinity (km/s)

### 3.5 CelesTrak (Earth satellites + debris)
```
https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json
```
**Fields used:** Full OMM JSON set for TLE propagation in Phase 4.

### 3.6 Planetary Orbital Elements (Hardcoded — JPL Standish 1992)
No API. Elements hardcoded directly in JavaScript for Mercury through Neptune.
Mean elements valid for 1800–2050 with first-order secular rates (Standish et al. 1992, "Keplerian Elements for Approximate Positions of the Major Planets").

---

## 4. Physics Pipeline

### 4.1 Coordinate System
- **Frame:** Heliocentric Ecliptic J2000
- **Position:** AU
- **Velocity:** km/s
- **Time:** Julian Date (JD)
- **GM_sun:** 1.327124400×10²⁰ m³/s²
- **1 AU:** 1.496×10¹¹ m
- **J2000 epoch:** JD 2451545.0
- **T (centuries past J2000):** `(JD - 2451545.0) / 36525.0`

### 4.2 Keplerian Propagator: Elements → Cartesian

```
kep2cart(a, e, i, Ω, ω, M₀, epoch_JD, t_JD) → {x, y, z, vx, vy, vz}
```

**Step 1 — Mean anomaly at epoch t:**
```
n = sqrt(GM / a³)          // mean motion (rad/s)
M = M₀ + n·(t - epoch)    // mean anomaly at time t
```

**Step 2 — Eccentric anomaly via Newton-Raphson (ε < 1×10⁻¹⁰):**
```
E₀ = M
Eₙ₊₁ = Eₙ - (Eₙ - e·sin(Eₙ) - M) / (1 - e·cos(Eₙ))
repeat until |Eₙ₊₁ - Eₙ| < 1e-10
```

**Step 3 — True anomaly:**
```
ν = 2·atan2(sqrt(1+e)·sin(E/2), sqrt(1-e)·cos(E/2))
```

**Step 4 — Orbital plane position and velocity:**
```
r = a·(1 - e·cos(E))
x_orb = r·cos(ν)
y_orb = r·sin(ν)
vx_orb = -(sqrt(GM·a)/r)·sin(E)
vy_orb =  (sqrt(GM·a)/r)·sqrt(1-e²)·cos(E)
```

**Step 5 — Rotate to ecliptic frame (3-1-3 Euler rotation: Ω, i, ω):**
```
[x]   = R_z(-Ω) · R_x(-i) · R_z(-ω) · [x_orb]
[y]                                      [y_orb]
[z]                                      [0    ]
```
(same rotation matrix applied to velocity vector)

### 4.3 Burn Simulator: RK4 + ΔV Application

```
simulateBurn(state₀, dv_vec, t_start, t_end, dt) → trajectory[]
```

**ΔV application (impulsive burn):**
```
v_new = v_old + dv_vec    // add delta-v vector to velocity state
```

**RK4 integrator for each timestep:**
```
k1 = f(t,      y)
k2 = f(t+h/2,  y + h/2·k1)
k3 = f(t+h/2,  y + h/2·k2)
k4 = f(t+h,    y + h·k3)
y(t+h) = y(t) + h/6·(k1 + 2k2 + 2k3 + k4)
```
where `f(t, [r,v]) = [v, -GM·r/|r|³]` (Newtonian gravity, Sun only)

**Adaptive step size:**
```
dt = dt_base / (1 + k_adapt · (a_perihelion / r_current)²)
```
Smaller steps near perihelion where acceleration is highest.

**Backward integration:** negate timestep `h → -h`. Same RK4, same physics, reversed time direction.

### 4.4 Elements ↔ Cartesian Round-trip

`cart2kep(x, y, z, vx, vy, vz) → {a, e, i, Ω, ω, ν}` via angular momentum vector and eccentricity vector. Used after burn application to display resulting orbital elements.

### 4.5 Worker Architecture

```
Main thread                    physics.worker.js
     │                               │
     │── { cmd: 'propagate',         │
     │     elements: [...],          │
     │     jd: float }  ──────────▶  │
     │                               │  kep2cart() for each object
     │◀── { positions: Float32Array }│
     │     (transferable buffer)     │
     │                               │
     │── { cmd: 'simulate_burn',     │
     │     state: [...],             │
     │     dv: [...],                │
     │     t_span: [...] } ────────▶ │
     │                               │  RK4 integration
     │◀── { trajectory: Float32Array }
```

---

## 5. Economics Model

### 5.1 Primary Inputs (from Asterank)
- `price` — estimated gross resource value (USD), computed by Asterank from spectral type, diameter, and commodity prices (water, platinum-group metals, iron, nickel)
- `profit` — Asterank's net profit estimate = `price` minus estimated mission cost
- `delta_v` — total ΔV budget (km/s) for minimum-energy rendezvous

### 5.2 Aster Economics Layer

**Resource Value (override or supplement Asterank):**
```
V_gross = Σ (mass_i × composition_fraction_i × spot_price_i)
```
Where composition is inferred from spectral class:
- C-type: 10% water ice (electrolysis → H₂ + O₂ propellant), trace metals
- S-type: 17% iron, 1.5% nickel, 0.0006% platinum-group
- M-type: 77% iron, 10% nickel, 0.0007% platinum-group

**Mission Cost Model:**
```
C_mission = C_fixed + C_dv · ΔV²
```
- `C_fixed` = $500M baseline (launch vehicle, spacecraft bus, operations — adjustable)
- `C_dv` = cost per (km/s)² scaling factor (default: $50M per (km/s)²)
- ΔV penalized quadratically (propellant mass scales with Tsiolkovsky's equation)

**ROI:**
```
ROI = (V_gross - C_mission) / C_mission × 100%
```

**Accessibility Score (0–100):**
```
score = 100 · (1 - ΔV/ΔV_max) · (1 - e) · (MOID_bonus)
```
Where `ΔV_max` = 10 km/s cutoff, and `MOID_bonus` gives preference to Earth-approachers.

**Composite Mining Score (displayed in leaderboard):**
```
mining_score = 0.4 · normalized(profit) + 0.4 · accessibility_score + 0.2 · normalized(1/diameter)
```
(smaller diameter → easier to redirect; large weight on profit and accessibility)

### 5.3 Display Outputs
- Gross resource value (USD, human-formatted: $2.4T)
- Mission cost estimate (USD)
- Estimated ROI (%)
- ΔV budget (km/s, total round-trip)
- Composition breakdown (% by mass, by element)
- Spectral class interpretation

---

## 6. Aesthetic Specification

### 6.1 Color Palette
| Token | Hex | Use |
|---|---|---|
| Background | `#050508` | Canvas, panel backgrounds |
| Primary accent | `#4af7c4` | Selected objects, key data, active controls |
| Secondary accent | `#60a5fa` | Labels, secondary data, orbit lines |
| Warning | `#fb923c` | High ΔV cost, caution states |
| Danger | `#f87171` | Unviable missions, collision risk |
| Dim text | `#4b5563` | Less important labels, grid |
| White | `#e5e7eb` | Primary readable text |

### 6.2 Typography
- **Font stack:** `'JetBrains Mono', 'Courier New', monospace`
- **No system sans-serif anywhere.** Every character is monospaced.
- Data values: 14–16px, bright (`#e5e7eb`)
- Labels: 11–12px, dimmed (`#4b5563` or `#60a5fa`)
- Headers: 13px, uppercase, letter-spacing: 0.1em, primary accent

### 6.3 UI Philosophy
- **No rounded cards.** 1px solid borders, `#1f2937`.
- **No gradients on interactive elements.** Flat color or transparent.
- **No icons from icon libraries.** ASCII/Unicode glyphs only (`▶`, `⬡`, `◈`, `△`).
- **Data density is a feature.** Panels are information-rich by default.
- **Panels are overlaid on the 3D canvas**, not beside it. Canvas is full-screen.
- **Reference aesthetic:** Bloomberg Terminal + NASA mission control + Kerbal Space Program map view.
- Hover states: primary accent border glow (`box-shadow: 0 0 6px #4af7c4`)

### 6.4 Layout
- Full-screen Three.js canvas (100vw × 100vh)
- Left panel: target list / leaderboard (collapsible, 320px)
- Right panel: selected object inspector (collapsible, 340px)
- Bottom bar: time scrubber + playback controls (full width, 60px)
- Top bar: filter controls + mission mode toggle (full width, 48px)

---

## 7. Build Phase Roadmap

### Phase 1 — Solar System + Asteroid Render + Time Scrubber
**Deliverables:**
- `index.html` + `physics.worker.js`
- Sun, 8 planets rendered with correct orbits (Standish 1992 elements)
- 2,000 asteroids loaded from Asterank API, positioned via `kep2cart()`
- Time scrubber: play/pause/fast-forward/rewind, JD display
- Click any asteroid → right panel shows orbital elements + Asterank economics
- 60fps with all objects rendered

**Success criteria:** I can click play, watch planets orbit the Sun in correct relative periods, click an asteroid, and see its name, orbital elements, and estimated value.

---

### Phase 2 — Burn Simulator (ΔV Gizmo + Porkchop Plot)
**Deliverables:**
- Select an asteroid → "Plan Mission" button activates burn mode
- ΔV gizmo: drag arrows in 3D to set prograde/retrograde/radial/normal components
- RK4 integrator shows resulting trajectory deviation as a ghost orbit
- Porkchop plot: 2D launch window optimization grid (departure date × TOF → C3)
- "Apply burn" commits the new trajectory

**Success criteria:** I can select an asteroid, apply a simulated burn, see the orbit change in real-time, and identify an optimal launch window from the porkchop plot.

---

### Phase 3 — Mining Intelligence (Scores + Filters + Economics)
**Deliverables:**
- Left panel leaderboard: top asteroids ranked by composite mining score
- Filter bar: spectral type, ΔV budget, min profit, diameter range
- Full economics panel: gross value, mission cost, ROI, composition breakdown
- Spectral-class color coding on asteroid dots
- NHATS integration: badge for human-accessible targets

**Success criteria:** I can filter to M-type asteroids under 5 km/s ΔV with >$1T estimated value, and the leaderboard updates instantly.

---

### Phase 4 — Earth Layer (Satellites + Debris)
**Deliverables:**
- Toggle: "Earth View" zooms to geocentric frame
- Active satellites + debris loaded from CelesTrak (OMM/JSON)
- SGP4 propagation for LEO/MEO/GEO objects
- Orbital shell visualization (LEO/MEO/GEO density heat rings)
- Click satellite → TLE data, orbital parameters, decay estimate

**Success criteria:** I can switch to Earth view, see the real satellite constellation orbiting, click the ISS, and see its current TLE elements.

---

### Phase 5 — Polish (Labels + Trails + Export + Sharing)
**Deliverables:**
- Orbital trail rendering (configurable length, fades with time)
- Billboard labels with LOD (visible at appropriate zoom)
- Export: current view as PNG, mission plan as JSON
- Shareable URL: encode selected asteroid + time + camera into URL hash
- Mobile degradation: reduce asteroid count to 500, disable trails

**Success criteria:** I can share a URL that opens Aster with a specific asteroid selected at a specific time, and it looks correct on mobile.

---

## 8. Definition of Done — v1.0

Aster v1.0 is complete when all five phases pass their success criteria **and**:

1. **Performance:** Stable 60fps on a modern laptop (Chrome, no GPU flag) with 2,000 asteroids + 8 planets rendered and time running at 10× speed.

2. **Data fidelity:** Planet positions are visually accurate vs. NASA Horizons spot-checks (within ~0.5° for inner planets). Asteroid positions are consistent with Asterank-reported elements.

3. **Physics correctness:** Newton-Raphson converges in <10 iterations for all non-hyperbolic orbits. RK4 integrator conserves energy to <0.1% over a 1-year integration with nominal step size.

4. **No silent failures:** Every API call has an error handler that logs to console with full context. Failed loads degrade gracefully (use cached/hardcoded fallback where possible).

5. **Zero dependencies installed locally:** The repo contains only `index.html`, `physics.worker.js`, and `FOUNDING_DOCUMENT.md`. Opening `index.html` directly in a browser (or via GitHub Pages) is the complete deployment.

6. **Usable by a mission planner:** A user who understands orbital mechanics can open Aster, identify the top 10 most profitable accessible asteroids, simulate a rendezvous burn, and extract an ROI estimate — without reading any documentation.

---

*Aster Founding Document — authored 2026-03-27. This document is the ground truth for all engineering decisions. When in doubt, refer back here.*
