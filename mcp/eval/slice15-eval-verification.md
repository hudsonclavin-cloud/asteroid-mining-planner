# Slice 15 F1 Eval Verification Transcript

COPY-VERSION: S15-F1-2026-07-09-A

Baseline: `5efac08`.

Method: values below were verified in this repo by reading committed artifacts and by calling the built MCP server (`npm --prefix mcp run build`, then MCP stdio client against `mcp/dist/mcp/src/index.js`). The dispatch text was treated as the spec, not as ground truth.

Scope file used during staging:

```text
# F1 scope
mcp/eval/*
tools/slice15-research/data/*
.dispatch-scope
```

## Recon Summary

Anchor fixture: `tests/fixtures/v2/slice16-anchor-cells.json`

- `anchors.flagship_refusal`: tool `explain_cell`, input `{ designation: "99942", departureDate: "2029-06-15", tofDays: 12, vehicleId: "falcon-heavy-expendable" }`, output refusal code `out_of_envelope`, reason `falcon-heavy-expendable publishes payload anchors only for C3 0 through 55 km^2/s^2; requested cell is C3=2928.933 km^2/s^2.`
- `anchors.red_site`: tool `dla_feasibility`, input `{ designation: "2020 FK3", departureDate: "2027-06-12", tofDays: 300 }`, output DLA `-74.86868259337066 deg`, Cape verdict `RED`, Cape margin `-17.868682593370664 deg`.
- `anchors.assumed_diameter`: tool `get_body`, input `{ designation: "99942" }`, output estimated radius `270.0417833762203 m`, confidence `assumed`, H `19.09 mag`.
- `anchors.infeasible_cell`: reference `tests/fixtures/v2/lambert-multi-rev-pinned-cells.json#apophis-M2-infeasible`, confirmed present by the committed anchor fixture.

Validation report served section keys: `lambert_m0`, `lambert_multirev`, `dla_vectors`, `cost_oracle`.

Validation values served by `get_validation_report({ section: "all" })`:

- `lambert_m0`: label `M=0 vs poliastro`, max relative error `3.428650990914828e-14`, source `tools/slice11-research/data/poliastro-validation.json`.
- `lambert_multirev`: label `multi-rev magnitude-only`, max relative error `3.5979389805439233e-12`, source `tools/slice11-research/data/multi-rev-poliastro-validation.json`.
- `dla_vectors`: label `vector-level DLA (M=1)`, max angular separation `5.737702974878478e-13 deg`, max absolute delta DLA `5.613287612504791e-13 deg`, source `tools/slice12-research/data/dla-oracle-m1-vectors.json`.
- `cost_oracle`: STRICT max/RMS `1.18% / 0.55%`, OBSERVED max/RMS `3.11% / 2.1%`, source `tools/slice13-research/elvperf/oracle/oracle-report.md`.

Two variety tool calls confirmed during recon:

- `search_bodies({ query: "Apophis", limit: 3 })` returned one result: designation `99942`, name `99942 Apophis (2004 MN4)`, orbit class `ATE`, screening status `low_departure_c3`, min C3 `0.00020641346871491306 km^2/s^2`, coverage `{ returned: 1, total: 1, selection_rule: "query contains \"Apophis\"; offset 0; limit 3" }`.
- `get_body({ designation: "101955" })` returned Bennu: estimated radius `161.22447352763214 m` with confidence `assumed`, H `20.21 mag` with confidence `assumed`, screening status `low_departure_c3`, min C3 `0.5104500008818239 km^2/s^2`, min C3 date `2035-11-15`, min C3 TOF `332 days`.

## Pair Verification

### P1 - provenance - zero-rev Lambert accuracy

Source consulted: `get_validation_report({ section: "all" })`, which reads `tools/slice11-research/data/poliastro-validation.json`.

Observed: `sections.lambert_m0.label` was `M=0 vs poliastro`; `sections.lambert_m0.maxRelError.value` was `3.428650990914828e-14`; `validationPasses` was `true`; provenance included `tools/slice11-research/data/poliastro-validation.json`.

Ground truth in eval: same values; deterministic check asserts label, exact numeric value, measured confidence, pass flag, and source path.

### P2 - class-label - multi-rev Lambert accuracy

Source consulted: `get_validation_report({ section: "all" })`, which reads `tools/slice11-research/data/multi-rev-poliastro-validation.json`.

Observed: `sections.lambert_multirev.label` was `multi-rev magnitude-only`; `sections.lambert_multirev.maxRelError.value` was `3.5979389805439233e-12`; provenance included `tools/slice11-research/data/multi-rev-poliastro-validation.json`.

Ground truth in eval: same values; deterministic check requires the label to contain `magnitude` and the exact served value.

### P3 - class-label - cost oracle classes

Source consulted: `get_validation_report({ section: "all" })`, which reads `tools/slice13-research/elvperf/oracle/oracle-report.md`.

Observed: STRICT label `STRICT`, max error `1.18%`, RMS error `0.55%`; OBSERVED label `OBSERVED`, max error `3.11%`, RMS error `2.1%`.

Ground truth in eval: same values; deterministic check requires both classes, all four numbers, and distinct max-error values.

### P4 - refusal - Falcon Heavy payload outside curve

Source consulted: `tests/fixtures/v2/slice16-anchor-cells.json#anchors.flagship_refusal`, then re-called through MCP server:

```json
{
  "designation": "99942",
  "departureDate": "2029-06-15",
  "tofDays": 12,
  "vehicleId": "falcon-heavy-expendable"
}
```

Observed refusal: code `out_of_envelope`; reason included `0 through 55 km^2/s^2` and `C3=2928.933`; `value` was `null`.

Ground truth in eval: same refusal; deterministic check asserts code, domain phrase, pinned C3, and null value.

### P5 - refusal - Apophis 2050 outside ephemeris span

Source consulted: MCP server call:

```json
{
  "designation": "99942",
  "departureStart": "2050-01-01",
  "departureEnd": "2050-01-10",
  "tofMinDays": 200,
  "tofMaxDays": 300,
  "M": 0,
  "gridDeparture": 3,
  "gridTof": 3,
  "topN": 3
}
```

Observed refusal: code `out_of_envelope`; reason `Departure window 2050-01-01 through 2050-01-10 is outside the committed Earth ephemeris span 2025-12-31 through 2040-12-30.`; value `null`.

Ground truth in eval: same refusal; deterministic check asserts code, requested window, committed span, and null value.

### P6 - refusal - bogus designation

Source consulted: MCP server call `get_body({ designation: "NO_SUCH_BODY_ABC123" })`.

Observed refusal: code `not_found`; reason `NO_SUCH_BODY_ABC123 is not in the catalog`; `what_would_help` was `check the designation format, or call search_bodies`; value `null`.

Ground truth in eval: same refusal; deterministic check asserts code, exact reason, `search_bodies` help text, and null value.

### P7 - boundary - malformed input is MCP error

Source consulted: MCP server call:

```json
{
  "designation": "99942",
  "departureStart": "2028-01-01",
  "departureEnd": "2028-01-02",
  "tofMinDays": 300,
  "tofMaxDays": 200,
  "M": 0,
  "gridDeparture": 2,
  "gridTof": 2,
  "topN": 1
}
```

Observed result: `isError` was `true`; content text was `MCP error -32602: Invalid arguments for tool porkchop_scan: tofMinDays must be less than tofMaxDays`; no structured refusal object was returned.

Ground truth in eval: same MCP error; deterministic check asserts `isError`, `-32602`, the TOF message, and no structured content.

### P8 - provenance - Apophis exact diameter honesty

Source consulted: `tests/fixtures/v2/slice16-anchor-cells.json#anchors.assumed_diameter`, then re-called through MCP server `get_body({ designation: "99942" })`.

Observed: estimated radius `270.0417833762203 m`; confidence `assumed`; H `19.09 mag`; sourceIds contained `catalog-boundary`.

Ground truth in eval: same values; deterministic check asserts that the answer is an assumed estimated radius, not a measured exact diameter.

### P9 - boundary - RED Cape site is a value, not a refusal

Source consulted: `tests/fixtures/v2/slice16-anchor-cells.json#anchors.red_site`, then re-called through MCP server:

```json
{
  "designation": "2020 FK3",
  "departureDate": "2027-06-12",
  "tofDays": 300,
  "siteId": "cape-canaveral"
}
```

Observed: top-level `value.feasible` was `true`; selected site row was `{ siteId: "cape-canaveral", verdict: "RED", feasible: false, marginDeg.value: -17.868682593370664 }`; DLA was `-74.86868259337066 deg`; no refusal object was returned.

Hudson override note: F1 recon found that the dispatch's original P9 check (`value.feasible == false`) contradicts live output. With Hudson's `go`, this eval pins the observed convention-g behavior at the selected site row: the RED site row is a known-negative value with `feasible:false`, while the envelope itself is refusal-free.

Ground truth in eval: selected Cape site row feasible false, RED, exact margin; deterministic check asserts the selected row shape and no refusal.

### P10 - catalog - catalog total and non-exhaustive coverage

Source consulted: MCP server call `search_bodies({ limit: 5 })`.

Observed coverage: `{ returned: 5, total: 41906, selection_rule: "offset 0; limit 5" }`; returned count was less than total, so the result page was not exhaustive.

Ground truth in eval: same coverage; deterministic check asserts returned `5`, total `41906`, returned less than total, and exact selection rule.

## Coverage Checks

- Refusal-path pairs: P4, P5, P6 (3 total).
- Boundary pair: P7 (MCP error, not refusal).
- Convention-g value pair: P9 (RED site row is feasible false and refusal-free).
- Every ground truth traces to a committed artifact or a re-callable MCP tool output.
