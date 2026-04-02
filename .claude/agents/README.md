# Aster Subagent Coordination Guide

Five scoped agents cover the full codebase. Each owns a strict domain — invoke only the agents whose domain is touched by the task.

---

## Agent Ownership

| Agent | File | One-line summary |
|-------|------|-----------------|
| **orbital-mechanics** | `orbital-mechanics.md` | Kepler solver, propagation, Lambert, burns — Web Worker only |
| **renderer** | `renderer.md` | Three.js scene, asteroid cloud, orbit lines, gizmo, animation loop |
| **economics** | `economics.md` | Composition models, pricing, ROI, mission cost, score computation |
| **ui-hud** | `ui-hud.md` | DOM panels, filters, leaderboard, toolbar HUD, keyboard shortcuts |
| **data-layer** | `data-layer.md` | API fetching, caching (IDB/localStorage/session), worker protocol, Cloudflare proxy |

---

## Interface Boundaries

```
                    ┌──────────────────────────────────────┐
                    │              index.html               │
  ┌─────────────┐   │  ┌──────────┐   ┌──────────────────┐ │
  │  data-layer │───┼─▶│ renderer │   │    ui-hud        │ │
  │             │   │  │          │   │                  │ │
  │ fetch/cache │   │  │ Three.js │◀──│ DOM / events     │ │
  │ worker msgs │   │  │ scene    │   │ filter state     │ │
  └──────┬──────┘   │  └────┬─────┘   └────────┬─────────┘ │
         │          │       │                   │           │
         │          └───────┼───────────────────┼───────────┘
         │                  │                   │
         │          ┌───────▼───────────────────▼──────────┐
         └─────────▶│          physics.worker.js            │
                    │       orbital-mechanics agent         │
                    └───────────────────────────────────────┘
                                      │
                    ┌─────────────────▼──────┐
                    │       economics        │
                    │  (pure computation +   │
                    │  #tab-economics DOM)   │
                    └────────────────────────┘
```

### Data Flow Between Agents

| From → To | Mechanism | Payload |
|-----------|-----------|---------|
| data-layer → orbital-mechanics | `worker.postMessage({cmd})` | catalog init, propagate JD, burn params |
| orbital-mechanics → data-layer | `self.postMessage({type})` | positions Float32Array, burn_result, catalog_ready |
| data-layer → renderer | `applyPositions(buf)` called after `positions` message | Float32Array position buffer |
| renderer → ui-hud | raycaster events → `selectAsteroid(id)` | asteroid index |
| ui-hud → data-layer | `previewBurn()` triggers `worker.postMessage` | burn params |
| ui-hud → economics | `renderEconomicsTab(id)` | asteroid index |
| ui-hud → renderer | `flyTo(idx)`, `drawOrbitEllipse(ast)` | asteroid index / elements |

---

## Cross-Domain Feature Recipes

### Adding a new filter
Agents: **ui-hud** + **data-layer** (if filter requires new API field)
1. `ui-hud` — add filter variable, DOM element, event listener, `applyFilters()` clause, `syncFilterDOM()` reset
2. `data-layer` — if field comes from a new source, add to merge pipeline in `catalog_ready` handler

### Fixing trajectory / propagation math
Agent: **orbital-mechanics** only
- All changes in `physics.worker.js`
- Test by verifying `kep2cart` → `propagatePlanet` output against known ephemeris values

### New material / resource type
Agents: **economics** + **data-layer** + **ui-hud**
1. `economics` — add entry to `FRACTIONS`, `DENSITIES`, `COMPOSITIONS`; update `computeScore` weighting if needed
2. `data-layer` — if new field comes from Asterank, add to Asterank-primary merge loop in `fetch_catalog`
3. `ui-hud` — add display row in inspector or filter chip if user-filterable

### New rendering effect (particle, shader, overlay)
Agent: **renderer** only
- All changes in the Three.js section of `index.html`
- Use Three.js r128 API only (no CapsuleGeometry, no WebGPU)

### Changing the color scheme / design tokens
Agent: **ui-hud** only
- Update CSS custom properties and palette constants in design system
- Do not touch `spectralTypeColor()` (economics agent) or Three.js material colors (renderer agent)

### Adding a new external data source
Agent: **data-layer** only
- Add fetch function, cache key + TTL, merge logic in `catalog_ready` or a new worker message
- Update `loadSourceStatus` tracking

### Fixing the Cloudflare Worker proxy
Agent: **data-layer** only
- Edit `worker/index.js`
- Redeploy with `wrangler deploy` from `worker/` directory

### New mission cost parameter
Agents: **economics** + **ui-hud**
1. `economics` — update cost model constants, `renderEconomicsTab()`
2. `ui-hud` — add input field in `#tab-economics` if user-configurable

### Porkchop plot changes
Agents: **orbital-mechanics** + **ui-hud**
1. `orbital-mechanics` — modify `porkchop` handler in worker (grid computation, Lambert calls)
2. `ui-hud` — modify canvas render logic and axis label display

### Shareable URL / scenario save-restore
Agent: **data-layer** + **ui-hud**
1. `data-layer` — encode/decode localStorage `aster_scenario_*` or URL hash
2. `ui-hud` — wire share button, restore state to filter variables and burn sequence

---

## Single-Agent Tasks (no coordination needed)

| Task | Agent |
|------|-------|
| Fix Kepler solver convergence | orbital-mechanics |
| Tune MOID accuracy | orbital-mechanics |
| Change asteroid point cloud color/size | renderer |
| Fix orbit line flicker | renderer |
| Update commodity prices | economics |
| Recalibrate mining score weights | economics |
| Fix filter slider UI | ui-hud |
| Add keyboard shortcut | ui-hud |
| Change cache TTL | data-layer |
| Add CORS origin to Cloudflare Worker | data-layer |
| Fix AI research prompt | data-layer |

---

## Source File Map

| File | Primary agents |
|------|---------------|
| `physics.worker.js` | orbital-mechanics (exclusive) |
| `index.html` — `<style>` block | ui-hud |
| `index.html` — Three.js section | renderer |
| `index.html` — economics functions | economics |
| `index.html` — fetch/cache functions | data-layer |
| `index.html` — DOM event listeners | ui-hud |
| `worker/index.js` | data-layer (exclusive) |
| `worker/wrangler.toml` | data-layer (exclusive) |
