---
name: orbital-mechanics
description: Kepler solver, orbit propagation, Lambert solver, patched conics, n-body integration, coordinate transforms, delta-v/burn application
---

# Orbital Mechanics Agent

## Ownership
This agent owns all orbital physics computation. It works **exclusively in `physics.worker.js`** on the Web Worker thread.

## Functions Owned

### Vector Primitives
- `mag(v)` — vector magnitude
- `dot(a, b)` — dot product
- `cross(a, b)` — cross product (returns 3-element array)
- `vscale(v, s)` — scalar multiplication
- `vsub(a, b)` — vector subtraction

### Kepler & Coordinate Transforms
- `solveKepler(M, e)` — Newton-Raphson eccentric anomaly solver (10 iterations, tolerance 1e-10)
- `kep2cart(a_AU, e, i_rad, Om_rad, w_rad, M0_rad, epoch_JD, t_JD)` — Keplerian elements → Cartesian (position AU, velocity km/s)
- `kep2cartJS(a, e, i_rad, Om_rad, w_rad, M0_rad, epoch_JD, t_JD)` — main-thread mirror of kep2cart
- `cart2kep(x, y, z, vx_kms, vy_kms, vz_kms, t_JD)` — Cartesian state → Keplerian elements (a, e, i, Ω, ω, M0, ν)
- `cart2kepJS(x, y, z, vx_kms, vy_kms, vz_kms, t_JD)` — main-thread mirror of cart2kep

### Propagation
- `propagatePlanet(pIdx, jd)` — planet position via Standish 1992 secular elements (indices 0–7: Mercury → Neptune)
- `propagateAsteroid(ast, jd)` — asteroid position from stored MJD epoch
- `propagateElements(el, jd)` — propagate pre-computed Keplerian elements (radians)
- `keplerPosAU(ast, jd)` — returns heliocentric position [x, y, z] in AU
- `propagateSatellite(omm, jd)` — simplified TLE/OMM mean-motion propagator (omits J2/drag; LEO error ~10 km/day)

### Burn & Maneuvers
- `applyBurn(ast_or_el, jd, dv_p, dv_n, dv_r)` — apply impulsive ΔV (prograde/normal/radial, km/s), return new Keplerian elements
- `applyBurnJS(ast_or_el, dv_p, dv_r, dv_n, jd)` — synchronous main-thread version
- `tsiolkovsky(dv_kms, isp, m_dry)` — Tsiolkovsky rocket equation; returns propellant mass (string)

### Lambert & Transfer
- `stumpff(z)` — Stumpff C(z)/S(z) functions for universal variable Lambert solver (handles elliptic/parabolic/hyperbolic)
- `lambert(r1v, r2v, tof_days)` — Bate-Mueller-White universal variable Lambert solver; returns `{v1, v2}` or `null` (fails near 180° geometry)

### MOID & Close Approaches
- `moidApprox(el, jd_ref, nPts)` — Monte Carlo MOID estimate (120 points, accuracy ±0.01 AU; not the exact Gronchi solution)
- `closeApproachScan(el, jd_start, years, n)` — find top-3 Earth close approaches over time interval; returns `[{jd, dist}, ...]`

### Time Utilities
- `dateToJD(year, month, day)` — calendar date → Julian Date
- `jdToDate(jd)` — Julian Date → `{year, month, day}`
- `getAsteroidDV(ast)` — accessibility delta-v metric from orbital elements
- `kmToAU(km)` — unit conversion

## Worker Message Handlers (physics.worker.js)

| `cmd`                 | Payload fields                              | Response type        |
|-----------------------|---------------------------------------------|----------------------|
| `init`                | `{ data: [] }`                              | (none)               |
| `propagate`           | `{ jd }`                                    | `positions` (Float32Array transferable) |
| `get_state`           | `{ idx, jd }`                               | `state` (elements + Cartesian) |
| `apply_burn`          | `{ idx, jd, dv_p, dv_n, dv_r }`            | `burn_result`        |
| `close_approach_scan` | `{ idx, jd_start, years }`                  | `close_approaches`   |
| `porkchop`            | `{ idx, jd_start, jd_end, tof_min, tof_max, nx, ny }` | `porkchop` (Float32Array grid) |
| `fetch_nhats`         | `{}`                                        | `nhats_result`       |
| `fetch_catalog`       | `{ limit }`                                 | `catalog_ready` + `load_progress` |

## postMessage Response Shapes

```js
// positions — transferable
{ type: 'positions', buffer: Float32Array }
// Layout: [p0x,p0y,p0z, p1x,..., p7z,  ast0x,ast0y,ast0z, ast1x,...]

// state
{ type: 'state', x,y,z,vx,vy,vz, a,e,i,Om,w,M0,epoch_JD,nu }

// burn_result (success)
{ type: 'burn_result', elements:{a,e,i,Om,w,M0,epoch_JD}, period_days, orig_period_days, moid_approx }
// burn_result (failure)
{ type: 'burn_result', error: 'Singular state' }

// close_approaches
{ type: 'close_approaches', results: [{jd, dist}, ...] }  // max 3

// porkchop — transferable
{ type: 'porkchop', grid: Float32Array, nx, ny, jd_start, jd_end, tof_min, tof_max }

// nhats_result
{ type: 'nhats_result', ok: true, data: [...] }
{ type: 'nhats_result', ok: false, error: string }

// load_progress
{ type: 'load_progress', source: 'sbdb'|'asterank'|'nhats', status: 'ok'|'error', count?, error? }

// catalog_ready
{ type: 'catalog_ready', data: [...], nhatsRows: [...] }
```

## Physical Constants

| Constant      | Value                    | Units       |
|---------------|--------------------------|-------------|
| `GM_sun`      | `1.327124400e20`         | m³/s²       |
| `AU`          | `1.496e11`               | m           |
| `J2000`       | `2451545.0`              | JD          |
| `TWO_PI`      | `2 * Math.PI`            | rad         |
| `DEG`         | `Math.PI / 180`          | rad/deg     |
| `GM_AU3_S2`   | `3.964e-14`              | AU³/s²      |
| `MOON_SMA`    | `0.00257`                | AU          |
| `MOON_PERIOD` | `27.321582`              | days        |
| `MOON_L0`     | `218.316°` (in radians)  | rad         |
| `MOON_INC`    | `5.145°` (in radians)    | rad         |

Planet semi-major axes (AU): Mercury 0.387, Venus 0.723, Earth 1.000, Mars 1.524, Jupiter 5.203, Saturn 9.537, Uranus 19.19, Neptune 30.07

## Unit Conventions

- **Positions:** heliocentric ecliptic J2000, AU
- **Velocities:** km/s
- **Time:** Julian Date (JD); asteroid epochs stored as MJD (subtract 2400000.5 to get JD)
- **Angles:** internally radians; input elements from catalog in degrees (converted at parse time)
- **ΔV components:** prograde (along velocity), normal (orbit-normal), radial (toward Sun)

## Performance Constraints

- `propagate` response must be delivered within **16ms** (one frame at 60 fps)
- Use `Float32Array` transferable buffers for `positions` and `porkchop` to avoid copying
- Porkchop grid: `nx × ny` Float32Array; typical size 60×60 = 3600 elements
- `closeApproachScan` and `porkchop` are slow ops — run only on explicit user trigger, never in the animation loop

## Known Limitations

- MOID: ±0.01 AU error (sampled, not exact Gronchi solution)
- Lambert: fails at near-180° transfer geometry (returns null)
- Satellite propagator: omits J2 and atmospheric drag — LEO error ~10 km/day
- Keplerian asteroid positions accumulate ~0.5°/year secular drift

## Hard Boundaries

- **NEVER** touch DOM elements, CSS classes, or `document.*`
- **NEVER** import or reference Three.js
- **NEVER** read or write economic pricing tables
- **NEVER** call `localStorage` or `IndexedDB` directly (data-layer agent owns caching)
