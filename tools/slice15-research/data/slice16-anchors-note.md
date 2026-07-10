# Slice 16 study-anchor cells — generation record

- **Fixture:** `tests/fixtures/v2/slice16-anchor-cells.json`
- **Method:** live MCP tool calls over stdio (`mcp/dist/mcp/src/index.js`); anchors are verbatim tool-response slices, never hand-authored.
- **solverCommit:** `41abd8a`
- **Round-trip:** re-called each anchor; pinned output == re-called output before commit.
- **Anchors:** flagship_refusal (explain_cell out_of_envelope past FH C3 domain), red_site (dla_feasibility cape RED value), assumed_diameter (get_body H-derived size leaf, confidence assumed), infeasible_cell (reference to the Lambert fixture, not duplicated).
- **provenanceClass:** `tool-output-pinned` for the three generated anchors; `reference` for infeasible_cell.
