# Slice 15 Phase C Inspector Checklist

Run from the repo root after `npm --prefix mcp run build`:

```powershell
npx @modelcontextprotocol/inspector node mcp/dist/mcp/src/index.js
```

## Tools

A. `search_bodies` schema renders in Inspector.

B. `search_bodies` happy path:

```json
{ "query": "Eros", "limit": 5 }
```

Expected: result envelope in `structuredContent`, `envelope_version` is `"1"`, `value.results` is an array, and `coverage` is present.

C. `search_bodies` malformed input:

```json
{ "limit": "abc" }
```

Expected: Zod/MCP input error, not a refusal envelope.

D. `get_body` schema renders in Inspector.

E. `get_body` happy path:

```json
{ "designation": "433" }
```

Expected: result envelope in `structuredContent`, `value.designation` is `"433"`, physical numeric leaves are Quantity objects, and no `refusal` is present.

F. `get_body` refusal path:

```json
{ "designation": "NOT-A-CATALOG-BODY" }
```

Expected: `structuredContent.refusal.code` is `"not_found"` and this is not an MCP/Zod error.

## Resources

G. `aster://reference/launch-vehicles` resolves and content carries a provenance note with `src/v2/porkchop/launch-vehicles.ts` plus `asOf: "2024-02-29"`.

H. `aster://reference/dla-site-bands` resolves and content carries a provenance note with `src/v2/core/lambert/feasibility.ts`.

I. `aster://reference/catalog-schema` resolves and content carries provenance notes for `src/v2/boundary/slice9-nea-catalog.ts` and `src/v2/boundary/lambert-screen-cache.ts`.

J. `aster://reference/dv-stack-model` resolves and content carries provenance notes for `src/v2/porkchop/delta-v.ts` and `src/v2/porkchop/launch-vehicles.ts`.
