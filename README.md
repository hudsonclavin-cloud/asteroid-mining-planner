# Aster — asteroid mission planning with evidence-carrying answers

Aster plans asteroid missions in the browser and answers mission-analysis
questions over MCP — and every number it produces carries its source, its
confidence class, and the commit it was computed from.

*(This README states only what is verified in this repository; claims below
cite their evidence. No study outcomes are reported — see the honest status
section.)*

## Live

| Surface | URL |
|---|---|
| Solar system + NEA catalog (41,906 bodies) | https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/ |
| Porkchop planner (C3, ΔV, DLA, delivered mass) | https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/ |
| About / validation evidence | https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/ |

The 2026-08-01 read-only repository audit byte-compared the live pages and
their JS assets against committed `docs/` and found them identical
(`tools/audit/REPO_AUDIT_2026-07-31.md`, finding L6-6).

## MCP package

```sh
npx aster-mission-mcp        # aster-mission-mcp@0.1.0 on npm (stdio MCP server)
```

Seven tools (`search_bodies`, `get_body`, `porkchop_scan`, `explain_cell`,
`dla_feasibility`, `estimate_mission_cost`, `get_validation_report`), four
reference resources, structured refusals, and baked provenance so the package
answers with commits even when installed outside a git checkout. Quick start:
`mcp/README.md`.

## One core, two interfaces

The browser app and the MCP server run the **same math** — the MCP package
does not port or re-implement it:

- `mcp/package.json` ships `dist/src` — the compiled **`src/v2` core itself**
  (Lambert solver, DLA, launch-vehicle interpolation) — alongside the thin
  MCP surface in `dist/mcp/src`.
- `mcp/tsconfig.json` compiles the server against `../src/v2` sources; the
  audit confirmed no V2 import from legacy paths and no external
  astrodynamics library anywhere (finding L3-8).

So a browser porkchop cell and an MCP `explain_cell` answer are the same
computation, and validation evidence for one is validation evidence for the
other.

## Validation, briefly and honestly

- Lambert (Izzo, clean-room TypeScript) validated against **poliastro** test
  vectors — single-revolution to machine precision, multi-revolution
  magnitudes to a measured bound, recorded in
  `tools/slice11-research/data/*-poliastro-validation.json`.
- DLA components validated by **measurement at the consuming boundary**
  (INV-021): the frame is ICRF/equatorial because the numbers say so, not
  because a label did (`INVARIANTS.md`, DEC-12-2 — including the 2026-08-01
  correction of a stale "ecliptic" label).
- Launch-vehicle delivered-mass interpolation validated against published
  performance in `tools/slice13-research/elvperf/oracle/oracle-report.md` —
  that report covers **cost interpolation only** and is labelled accordingly
  on the About page.

## What an answer looks like

A real `estimate_mission_cost` **refusal**, captured live from the pilot run
ledger (2026-07-31, `tools/slice16-harness/runs/ledger-pilot.jsonl`,
sha256 `ee9ada7f…` pinned in `SLICE_16_FOUNDING.md` §25.3), abbreviated to its
shape — note the refusal is a first-class result with provenance, not an
error:

```json
{
  "envelope_version": "1",
  "tool": "estimate_mission_cost",
  "as_of": "2024-02-29",
  "value": null,
  "confidence": "derived",
  "provenance": [
    { "id": "catalog-boundary",  "kind": "repo", "path": "src/v2/boundary/slice9-nea-catalog.ts", "commit": "41b560b4ee6c…" },
    { "id": "earth-ephemeris",   "kind": "repo", "path": "src/v2/data/horizons-inner-solar-system-2026-2040.json", "commit": "197adfd8ae42…" },
    { "id": "grid-compute",      "kind": "repo", "path": "src/v2/porkchop/grid-compute.ts", "commit": "f3471f423b6b…" }
  ],
  "refusal": {
    "code": "out_of_envelope",
    "reason": "falcon-heavy-expendable publishes payload anchors only for C3 0 through 55 km^2/s^2; requested cell is C3=2928.933 km^2/s^2.",
    "what_would_help": "choose a vehicle whose curve covers C3=2928.933, or a cell with lower C3"
  }
}
```

And a **value** answer's leaves each carry their own binding — from the same
ledger, `get_body("99942")`:

```json
"estimatedRadius": {
  "value": 270.0417833762203,
  "units": "m",
  "confidence": "assumed",
  "sourceIds": ["catalog-boundary"]
}
```

`confidence: "assumed"` is load-bearing: the catalog derives that radius from
absolute magnitude under an assumed albedo, and the envelope says so instead
of rounding up to certainty.

## The Slice 16 agent-honesty study — honest status

This repository also contains a pre-registered study of whether LLM agents
faithfully transmit tool evidence (values, refusals, provenance, assumptions)
into their answers: design and amendment chain in
`src/v2/SLICE_16_FOUNDING.md`, locked 30-scenario appendix, deterministic
grader, and run harness under `tools/slice16-harness/`.

**Status: designed; instrument corrected; no data collected; no results
exist.** The first full-run attempt (2026-08-01) halted on provider credit
exhaustion, and the post-incident audit found instrument defects that predated
it — all recorded, not erased, in founding §21 and §23–§25. Remediation is in
`tools/slice16-harness/REMEDIATION_REPORT.md`; no future paid run happens
until `tools/slice16-harness/PRE_RUN_GATE.md` passes, including a public
pre-registration seal. The study's transparency record — including its own
failures — is deliberately part of the artifact.

## Repository orientation

| Where | What |
|---|---|
| `src/v2/` | canonical application + math core (`src/v2/core/` is protected surface) |
| `mcp/` | published MCP server, evals, provenance baking |
| `tools/slice16-harness/` | study harness, grader, runbook, gates |
| `src/v2/SLICE_*_FOUNDING.md` | per-slice design records — additive-only, hook-enforced |
| `INVARIANTS.md`, `AGENTS.md`, `STATUS.md` | standing rules, agent rules, current state |
| `NOTICE` | third-party attribution (Izzo/poliastro, JPL SBDB/Horizons, Tycho-2, Solar System Scope CC BY 4.0, NASA SVS) |
