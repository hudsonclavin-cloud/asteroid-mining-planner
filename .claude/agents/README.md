# Retired agent definitions — relocated 2026-08-01

**Marker:** `S16-REMEDIATE-2026-08-01-A` · audit finding L1-1.

The five V1 domain-agent definitions that lived here (orbital-mechanics,
renderer, data-layer, ui-hud, economics) routed WRITE authority into the
legacy architecture — `index.html`, `physics.worker.js` — which AGENTS.md
§canonical makes non-canonical: `src/v2` is the codebase, and legacy paths are
retained history, not work surface. A Claude client auto-discovering these
definitions could route new work into legacy code with overly broad write
authority; this session's own agent roster demonstrated exactly that hazard.

They are **retired-not-deleted**, per this repo's convention: relocated to
`_rescued-agent-defs/` — the directory AGENTS.md §281-286 already claimed as
their home — preserving them as prior art while removing them from
auto-discovery. Do not add agent definitions here that grant write access to
legacy paths.
