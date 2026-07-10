# aster-mission-mcp

Aster Mission MCP exposes Aster's validated V2 mission-planning core over stdio for agents that need closed-world asteroid catalog lookup, bounded porkchop screening, DLA feasibility, delivered-mass estimates, and validation evidence. Every numerical answer is returned as a provenance envelope; known negative results are explicit values or structured refusals instead of extrapolations.

## Run

```powershell
npm install
npm --prefix mcp run build
node mcp/dist/mcp/src/index.js
```

When installed from the package tarball, the executable is:

```powershell
aster-mission-mcp
```

## Tools

| Tool | What it does | Structured refusals |
| --- | --- | --- |
| `search_bodies` | Search the closed-world Slice 9 NEA catalog by designation, name, orbit class, and Lambert screening status. | none |
| `get_body` | Return one full Slice 9 catalog body record with Lambert screening status and quantity leaves. | `not_found` |
| `porkchop_scan` | Run a bounded Lambert grid and return the lowest-C3 feasible cells. | `not_found`, `out_of_envelope` |
| `explain_cell` | Return the ordered derivation trail for one departure/TOF cell. | `not_found`, `out_of_envelope` |
| `dla_feasibility` | Return DLA and launch-site screening verdicts for one Lambert cell. | `not_found`, `out_of_envelope` |
| `estimate_mission_cost` | Return the Slice 13 delivered-mass screening chain for one Lambert cell and vehicle. | `not_found`, `out_of_envelope` |
| `get_validation_report` | Read the committed solver-validation artifacts without recomputing them. | none |

## Reference Resources

| URI | Contents |
| --- | --- |
| `aster://reference/launch-vehicles` | Launch vehicle C3 payload curves and provenance. |
| `aster://reference/dla-site-bands` | Launch-site DLA screening bands. |
| `aster://reference/catalog-schema` | Slice 9 catalog and screening-cache field schema. |
| `aster://reference/dv-stack-model` | Delta-v and delivered-mass screening model constants. |

## Validation Evidence

The catalog contains 41,906 closed-world NEA records. The committed Earth ephemeris used by the compute tools spans 2025-12-31 through 2040-12-30.

Validation figures are pulled from committed artifacts: M=0 Lambert max relative error `3.428650990914828e-14`; multi-rev magnitude-only max relative error `3.5979389805439233e-12`; DLA vector max angular separation `5.737702974878478e-13` degrees and max DLA delta `5.613287612504791e-13` degrees; cost oracle STRICT max/RMS `1.18%`/`0.55%`, OBSERVED max/RMS `3.11%`/`2.10%`.

Behavioral eval: `Result: 10/10 PASS`.

## Limits And Refusals

The server does not extrapolate outside committed catalogs, ephemerides, or launch-vehicle payload curves. For example, the pinned flagship refusal for an impossible Falcon Heavy cell is:

```json
{
  "code": "out_of_envelope",
  "reason": "falcon-heavy-expendable publishes payload anchors only for C3 0 through 55 km^2/s^2; requested cell is C3=2928.933 km^2/s^2.",
  "what_would_help": "choose a vehicle whose curve covers C3=2928.933, or a cell with lower C3"
}
```
