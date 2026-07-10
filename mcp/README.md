# aster-mission-mcp

An MCP server exposing a validated asteroid-mission astrodynamics core — with evidence-carrying outputs and structured refusals. Every numeric result carries per-leaf confidence and provenance; when a request falls outside validated ground, the server refuses with the reason and what would help, instead of extrapolating.

## Install / run

```
npx aster-mission-mcp
```

Node >= 18. Speaks MCP over stdio (spec 2025-11-25, SDK 1.29.0).

## Tools (7)

| Tool | What it does | Structured refusals |
| --- | --- | --- |
| `search_bodies` | Search the closed-world Slice 9 NEA catalog by designation, name, orbit class, and Lambert screening status. | none |
| `get_body` | Return one full Slice 9 catalog body record with Lambert screening status and quantity leaves. | `not_found` |
| `porkchop_scan` | Run a bounded Lambert grid and return the lowest-C3 feasible cells. | `not_found`, `out_of_envelope` |
| `explain_cell` | Return the ordered derivation trail for one departure/TOF cell. | `not_found`, `out_of_envelope` |
| `dla_feasibility` | Return DLA and launch-site screening verdicts for one Lambert cell. | `not_found`, `out_of_envelope` |
| `estimate_mission_cost` | Return the Slice 13 delivered-mass screening chain for one Lambert cell and vehicle. | `not_found`, `out_of_envelope` |
| `get_validation_report` | Read the committed solver-validation artifacts without recomputing them. | none |

## Resources (4)

| URI | Contents |
| --- | --- |
| `aster://reference/launch-vehicles` | Launch vehicle C3 payload curves and provenance. |
| `aster://reference/dla-site-bands` | Launch-site DLA screening bands. |
| `aster://reference/catalog-schema` | Slice 9 catalog and screening-cache field schema. |
| `aster://reference/dv-stack-model` | Delta-v and delivered-mass screening model constants. |

## The Honesty Model

Outputs are evidence envelopes (envelope_version 1): every Quantity leaf carries confidence and resolving source IDs; freshness is explicit via as_of; infeasibility is a value, not an error. Refusals are structured results — code, reason, what_would_help — not exceptions. Example (a real one, pinned as a committed fixture):

```json
{
  "code": "out_of_envelope",
  "reason": "falcon-heavy-expendable publishes payload anchors only for C3 0 through 55 km^2/s^2; requested cell is C3=2928.933 km^2/s^2.",
  "what_would_help": "choose a vehicle whose curve covers C3=2928.933, or a cell with lower C3"
}
```

## Validation

Lambert core validated against poliastro 0.17.0 as external oracle: M=0 max relative error `3.428650990914828e-14`; multi-rev magnitude-only max relative error `3.5979389805439233e-12`; DLA vector max angular separation `5.737702974878478e-13` degrees and max DLA delta `5.613287612504791e-13` degrees; cost oracle STRICT max/RMS `1.18%`/`0.55%`, OBSERVED max/RMS `3.11%`/`2.10%`. Behavioral eval: `Result: 10/10 PASS` across provenance, class-labeling, refusal, and boundary categories — committed at mcp/eval/.

## Limits

- Catalog: 41,906 near-Earth asteroids; searches are paged, coverage fields say so.
- Ephemeris span: 2025-12-31 through 2040-12-30 — requests outside it refuse rather than extrapolate.
- Provenance hashes: live per-path git hashes in a checkout; build-baked package commit under npx (granularity loss disclosed in the envelope note).

Part of the Aster mission-planning project.
