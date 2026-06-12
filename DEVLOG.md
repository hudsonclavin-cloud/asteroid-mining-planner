# Aster Physics Approximations — DEVLOG

## Phase 6 — Docs / Hygiene / Zero-Build Smoke Checks (2026-04-21)

This pass intentionally avoided renderer and worker code changes. The goal was to put
lightweight guardrails around the current Phase 6 surface using plain Node only.

### Added checks
- `tests/phase6-contract-smoke.test.mjs`
  - verifies every `./textures/...` asset referenced by `index.html` exists on disk
  - verifies `worker/README.md` route docs still match the routes implemented in `worker/index.js`
  - verifies every environment variable used by `worker/index.js` is documented
  - verifies the README's local-dev allowed origins include the currently supported ports
  - verifies `.gitignore` covers local Worker secrets and Wrangler state

[Content truncated for brevity - full content from file retrieval above]