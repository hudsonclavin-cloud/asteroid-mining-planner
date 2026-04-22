# Aster Data Sources

This file documents the current runtime data sources and APIs used by Aster.

## Browser -> Cloudflare Worker

These are the browser-facing routes served by `aster-proxy.hudsonclavin.workers.dev` or an explicitly configured `apiBase`.

### `GET /api/asterank`
- Upstream: `https://www.asterank.com/api/asterank`
- Purpose: primary asteroid catalog
- Used by: `physics.worker.js`
- Notes:
  - near-Earth asteroid query
  - primary screening catalog
  - falls back to local `FALLBACK_CATALOG` if unavailable

### `GET /api/nhats`
- Upstream: `https://ssd-api.jpl.nasa.gov/nhats.api`
- Purpose: accessibility screening
- Used by: `physics.worker.js`
- Notes:
  - provides NHATS mission accessibility rows
  - surfaced in UI as NHATS status / accessible-target enrichment

### `GET /api/horizons`
- Upstream: `https://ssd.jpl.nasa.gov/api/horizons.api`
- Purpose: ephemerides
- Used by: worker route exists for current/future higher-fidelity state lookup
- Notes:
  - documented and proxied
  - currently underused in the app compared with the two-body propagator

### `GET /api/cad`
- Upstream: `https://ssd-api.jpl.nasa.gov/cad.api`
- Purpose: close-approach data
- Used by: worker route exists for close-approach lookups

### `GET /api/prices`
- Upstream: `https://metals-api.com/api/latest`
- Purpose: commodity pricing
- Used by: `index.html`
- Notes:
  - only used when `METALS_API_KEY` is configured in the worker
  - otherwise returns worker-side static commodity pricing
  - browser also has a static local fallback if the route fails

### `POST /api/research`
- Upstream: `https://api.openai.com/v1/chat/completions`
- Purpose: AI asteroid research briefings
- Used by: `index.html`
- Notes:
  - OpenAI key stays server-side in Cloudflare
  - fallback UI points users to JPL SBDB lookup when unavailable

## Browser Direct Fetches

These are fetched directly by the browser rather than through the worker.

### CelesTrak satellite feeds
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json`
- Purpose: Earth-layer satellite visualization
- Used by: `index.html`

## Static / Local Fallback Data

### `FALLBACK_CATALOG`
- Location: `physics.worker.js`
- Purpose: backup asteroid catalog if live Asterank fetch fails
- Notes:
  - small hardcoded set of known objects
  - marked as fallback/static in the app flow

### `STATIC_PRICES_EARTH`
- Location: `index.html`
- Purpose: backup commodity prices if `/api/prices` is unavailable
- Notes:
  - used for cached/static pricing mode

## External Reference Links (Not Integrated APIs)

These are linked in the UI but are not part of the app's primary runtime API ingestion.

### JPL SBDB Lookup
- URL: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html`
- Purpose: external asteroid reference / fallback lookup

### JPL Horizons web app
- URL: `https://ssd.jpl.nasa.gov/horizons/`
- Purpose: external validation / higher-fidelity manual lookup

### Asterank website
- URL: `http://asterank.com`
- Purpose: source reference link

## Source Map Summary

- Asteroid catalog: Asterank via `/api/asterank`
- Accessibility: JPL NHATS via `/api/nhats`
- Ephemerides: JPL Horizons via `/api/horizons`
- Close approaches: JPL CAD via `/api/cad`
- Commodity prices: Metals API via `/api/prices`, with worker/static fallbacks
- AI research summaries: OpenAI via `/api/research`
- Satellite layer: CelesTrak direct browser fetches
