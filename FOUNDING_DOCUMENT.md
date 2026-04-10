# Aster — Asteroid Mission Intelligence Planner
### Founding Document v2.0 | 2026-04-10

---

## 1. Vision and Mission Statement

**Name:** Aster

**Vision:** A high-trust mission intelligence tool for asteroid target screening, accessibility analysis, and preliminary resource-economics trade studies.

**Mission Statement:** Aster is a browser-based 3D planning environment that helps engineers, researchers, and space entrepreneurs identify promising asteroid targets, compare accessibility, inspect orbital dynamics, estimate resource value, and explore first-order mission economics.

Aster is a **decision-support system**, not a profit oracle. Every number on screen is a planning-level estimate. Every pixel should help answer: *"Which object, launched when, at what approximate cost, offers the best mission trade?"*

---

## 2. What Aster Is and Is Not

| Aster IS | Aster IS NOT |
|----------|--------------|
| A target screening tool | A flight-certified mission designer |
| A heuristic economics ranker | A guaranteed profit calculator |
| A planning-level ΔV estimator | A precision navigation system |
| A data provenance layer | A real-time market terminal |
| A decision-support environment | A game or simulation |

Every ΔV value is labeled as a **planning-level estimate**. Every economics figure is labeled as **screening-grade**. No number is presented as mission truth.

---

## 3. Tech Stack

| Component | Choice | Justification |
|-----------|--------|---------------|
| Application shell | Single `index.html` | Simple deployment, easy browser inspection |
| Physics worker | `physics.worker.js` | Keeps orbit propagation off render thread |
| 3D rendering | Three.js r128 via CDN | Stable WebGL abstraction, minimal dependencies |
| Language | Vanilla JavaScript | Auditable, no build chain, low friction |
| Hosting | GitHub Pages | Static hosting, SSL, easy deployment |
| Proxy | Cloudflare Worker (`aster-proxy.hudsonclavin.workers.dev`) | CORS bypass, caching, API key protection |
| Concurrency | Web Worker | Bulk propagation without blocking UI |

**Hard rules:** No local `node_modules`. No webpack. No React. No mandatory build step.

---

## 4. Data Sources

### 4.1 Asterank API (Primary Catalog)
- **URL proxied via:** `/api/asterank` on Cloudflare Worker
- **Query:** `{"neo": "Y"}` — near-Earth asteroids only
- **Fields used:** `full_name, a, e, i, om, w, ma, epoch, H, spec, profit, delta_v, price, closeness, diameter, moid, neo`
- **Caching:** 6 hours at Cloudflare edge
- **Limitation:** Asterank is a third-party aggregator of MPC data. Treat as screening-grade, not authoritative.
- **Fallback:** Static hardcoded set of 10 well-characterized NEAs if fetch fails

### 4.2 NHATS API (Accessibility Screening)
- **URL proxied via:** `/api/nhats`
- **Purpose:** Human-accessible NEA list — min ΔV, min duration, trajectory count
- **Fields:** `des, fullname, H, min_dv, min_dur, n_via_traj`
- **Caching:** 24 hours
- **Failure mode:** Show explicit "NHATS offline" label — never silent failure

### 4.3 JPL Horizons (Ephemerides)
- **URL proxied via:** `/api/horizons`
- **Purpose:** High-quality time-tagged state vectors for selected targets
- **Caching:** 24 hours
- **Status:** Available but underutilized — future integration target

### 4.4 Commodity Prices
- **URL proxied via:** `/api/prices`
- **Fallback:** `STATIC_PRICES_EARTH` hardcoded constants — shown with "cached prices" label

### 4.5 AI Research Tab
- **URL proxied via:** `/api/research` (OpenAI GPT-4o-mini)
- **Fallback:** Link to JPL SBDB lookup tool — never blank

### 4.6 Explicitly Removed
- **mdesign API** — permanently 502, removed. Lambert solver is primary and only trajectory solver.
- **corsproxy.io** — removed. All external fetches go through Cloudflare Worker.

---

## 5. Physics Pipeline

### 5.1 Coordinate System
Heliocentric ecliptic J2000 frame throughout. No SSB correction. No SPICE kernels. Clearly labeled as approximate.

### 5.2 Propagation Model
Two-body Keplerian propagator for visualization and screening. Results labeled **"planning-level estimate"** — not mission-grade navigation solutions.

**Epoch rule:** All epochs are Julian Date (JD, ~2451545 range). Never add `+2400000.5`. Default epoch = J2000 = `2451545.0`.

### 5.3 Lambert Solver
Two implementations:
- **Izzo 2015 Householder** (primary)
- **BMW universal variable** (fallback)

Both return velocities in **km/s**. No unit conversion needed at patched-conic boundary.

### 5.4 Mission Planner Gates (Calibrated)
| Gate | Value | Rationale |
|------|-------|-----------|
| Departure ΔV | ≤ 10.0 km/s | LEO patched-conic departure budget |
| Total round-trip ΔV | ≤ 25.0 km/s | Practical chemical propulsion limit |
| Candidate cap | 200 | Enough coverage without timeout |

### 5.5 Fidelity Labels
- Render-time propagation: **approximate**
- Mission planner output: **planning-level estimate ± uncertainty**
- Hyperbolic/resonance edge cases: **flagged explicitly**
- Mission planner UI state: **extract/return and capture/redirect modes have distinct error panels and preserve selected target identity across catalog reloads**

### 5.6 What Is Not Modeled
The following are absent by design at this stage — not bugs:
- n-body propagation
- Solar radiation pressure
- Maneuver execution errors
- Low-thrust modeling (Edelbaum)
- Covariance / uncertainty propagation
- Anchoring / surface interaction

---

## 6. Mission Types

### 6.1 Extract & Return (primary)
Classical sample-return architecture. Spacecraft departs LEO, rendezvous with asteroid, extracts material, returns to LEO.

### 6.2 Capture & Redirect (secondary)
Asteroid redirect architecture. Spacecraft attaches propulsion module, redirects asteroid to lunar orbit, mines in-situ. Based on NASA ARM / KISS study reference architecture.

**Safety constraint:** Any asteroid with Sentry impact probability > 0 is flagged `RESTRICTED`. Redirect planning blocked for hazardous objects.

**Redirect physics:**
- Target parking orbit: NRHO or high lunar orbit — never Earth approach
- Propulsion: SEP ion (450s Isp) or nuclear thermal (900s Isp)
- Redirect ΔV applied to asteroid mass, not spacecraft
- Asteroid mass estimated from H magnitude and spectral type

---

## 7. Economics Model

### 7.1 Framing
All economics output is **screening-grade heuristic ranking**, not a profit forecast. Labels used throughout:
- "Screening score" not "profit"
- "Estimated ROI" not "guaranteed return"
- "Mission feasibility index" not "mining score"

### 7.2 Two-Value Display
Every value estimate shows two numbers:

**Paper Value** = returned_mass × spot_price_today
*(labeled: "at today's spot price, ignoring market impact")*

**Realizable NPV** = demand-adjusted, 10-year sell schedule, 8% discount rate
*(labeled: "planning-level estimate under market absorption model")*

### 7.3 Demand Elasticity Model
```text
P(t) = P₀(t) × (Q(t)/Q₀(t))^(1/ε)
NPV = Σ (R(t) - C(t)) / (1+r)^t
```

| Commodity | Elasticity (ε) | Annual Market |
|-----------|----------------|---------------|
| Platinum | -0.4 | 170,000 kg/yr |
| Palladium | -0.5 | 190,000 kg/yr |
| Nickel | -0.3 | 2,500,000,000 kg/yr |
| Iron | -0.2 | 2,000,000,000,000 kg/yr |
| Water | -0.8 | N/A (in-space market) |

### 7.4 Reference Mission Cost Anchors
Displayed in mission cost panel for sanity check:

| Mission | Cost | Type |
|---------|------|------|
| DART | $324M | Kinetic impactor |
| OSIRIS-REx | $1.16B | Sample return |
| KISS capture study | $2.6B | Asteroid capture |
| Psyche | ~$1.0B | Metal asteroid orbiter |

**Warning shown when total cost < $500M:** "First-of-a-kind mining missions historically cost $2B–$10B+"

### 7.5 Extraction Model
- Extraction efficiency: **5%** (conservative — no industrial-scale ISRU demonstrated)
- ISRU split (redirect): 60% Earth-bound, 40% lunar base
- PGM note: Trace elements are ppm-scale, not percent-scale — labeled explicitly

---

## 8. UX and Aesthetic Spec

**Visual language:** NASA mission control — dark navy background, cyan accent (`#00d4ff`), Space Mono monospace font throughout.

**Required on every panel:**
- Source provenance label on every data field
- "Planning-level estimate" badge on every ΔV and cost figure
- Stale-data indicator when API response is cached
- Explicit error message (never silent failure) when API is offline

**Required on every asteroid inspector:**
- Data source (Asterank / NHATS / JPL)
- Condition code (orbit quality 0–9)
- Last observation date
- Spectral type with uncertainty note

---

## 9. Agent Architecture

Five custom subagents in `.claude/agents/`. Each owns a strict file domain.

| Agent | File Ownership | Scope |
|-------|----------------|-------|
| `orbital-mechanics` | `physics.worker.js` — `plan_mission`, Lambert, gates | Trajectory math, ΔV computation |
| `data-layer` | `physics.worker.js` — `fetch_catalog`, NHATS, filtering | Data pipeline, epoch defaults, validation |
| `renderer` | `index.html` — Three.js scene only | 3D visualization, orbits, arcs |
| `ui-hud` | `index.html` — mission planner panel, results UI | Buttons, panels, error states |
| `economics` | Both files — economics functions only | Yield, NPV, cost model |

**Rule:** No two agents edit the same file in the same dispatch without explicit line-range scoping.

---

## 10. Known Limitations (Honest)

| Limitation | User-facing label |
|-----------|-------------------|
| Two-body propagation only | "Keplerian estimate — perturbations not modeled" |
| Asterank data may be stale | "Source: Asterank (MPC aggregator)" |
| Commodity prices are static fallback | "Cached prices — live market data unavailable" |
| Lambert solver is patched-conic only | "Planning-level ΔV — ±15% uncertainty" |
| No covariance propagation | "Nominal trajectory only" |
| NHATS may be offline | "NHATS offline — JPL API unavailable" |

---

## 11. Definition of Done

Aster v2.0 is complete when:
- Asteroid catalog loads reliably with 500+ NEAs
- Mission planner returns results for any target with Asterank `delta_v` < 10 km/s
- Every value estimate shows Paper Value AND Realizable NPV
- Every API failure shows an explicit error — never blank, never silent
- Source provenance is visible on every data field
- A user can rank targets, inspect trajectory accessibility, and export a mission concept without hidden assumptions
- The physics are labeled honestly — no number is presented as more precise than it is

---

## 12. Out of Scope (Forever)

- Flight-certified trajectory design
- Real-time market data feeds
- Guaranteed profit forecasts
- Steering asteroids toward Earth
- Any architecture requiring a build step
