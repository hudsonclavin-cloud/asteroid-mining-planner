# OQ-17-8 — CONDITION CODE PATH — S-S17-FRONTB-BATCH-2026-08-11-A

(Observed at checkout front-b/2026-08-11, HEAD 7a3622d. Read-only recon by a fresh-session lens, grep/Read only — no node execution; transcribed unedited by the orchestrator. Report-only; no code change proposed.)

## Verdict
**CANNOT-REACH — a non-numeric U value cannot reach the UI as a letter, string, or NaN.** Three independent barriers, plus one premise correction:

1. The catalog's source is **JPL SBDB Query API, not MPCORB** (`sb-group=neo`, field `condition_code` — `tools/slice9-ingestion/build-nea-catalog.mjs:49,284-289`), so MPCORB's E/D/F letters are not in the pipeline at all.
2. Even if a letter or empty value did arrive, the generator's `parseNumber` converts it to **null** (never NaN, never a pass-through string; the body is kept, not filtered).
3. The runtime loader (`src/v2/boundary/slice9-nea-catalog.ts:372,174-179,166-172`) passes null through as `null` and **throws (fail-loud, whole catalog load aborts)** on any non-null value that isn't Number()-finite — a letter string in the committed JSON could never render; it would break the load. One residual coercion gap: a numeric *string* like `"3"` would silently coerce to number 3 and survive — cosmetically type-unsafe but numerically correct.
4. **Premise correction:** at this HEAD, **no v2 UI consumes conditionCode at all**. `src/v2/app/compare/main.ts` reads only `name`/`designation`/`elements` from the catalog (lines 523-531); grep for `conditionCode|qualityRank|uncertaint|MPC` across `src/v2/app` (including `catalog-list/`) returns zero hits, and no "MPC" copy exists anywhere in `src/v2` or `index.html`. The only condition-code renderer in the repo is the **v1** detail panel `index.html:6285` (plain "COND CODE" row, id `ast-cond-code` at line 311 — no MPC-warning copy), fed by a different path (`src/physics/catalog/normalizers.ts:109` `parseFiniteOrNull`, which likewise nulls letters). The degenerate case reaches UI **as null**, rendered `'unknown'` by v1 (line 6285) and consumed by nothing in v2.

## Ingestion path (file:line chain)
- Generator: `tools/slice9-ingestion/build-nea-catalog.mjs` — writes the committed fixture at `FIXTURE_PATH` = `tests/fixtures/v2/nea-catalog-slice9.json` (line 26, written at line 304).
- Source query: SBDB Query API, `SBDB_FIELDS` includes `'condition_code'` (line 49); URL built lines 284-289 with `'sb-group': 'neo'`.
- Mapping: `normalizeSbdbRowsWithPha` → `conditionCode: parseNumber(entry.condition_code)` (line 89); carried into the fixture record at line 230 and into `qualityRank` input at line 237.
- Parser function: `parseNumber` in `tools/slice9-research/common.mjs:52-58`.
- The four other fixture-rewriting scripts in `tools/slice9-ingestion/` (`reanchor-stale-subset.mjs`, `reanchor-stale-90d-subset.mjs`, `retag-anomaly-tail.mjs`, `backfill-derived-eccentricity-band.mjs`) contain zero references to `conditionCode`/`condition_code` (grep exit 1) — only `build-nea-catalog.mjs` sets it.

## Parser behavior on E/D/F/empty (quoted)
`tools/slice9-research/common.mjs:52-58`:
```js
export function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}
```
- `"E"`, `"D"`, `"F"` → `Number("E")` = NaN → `Number.isFinite` false → **null**.
- `""` / whitespace → **null** (line 55).
- Never NaN in output, never string pass-through, never a throw, and the body is **not** filtered out (it lands in the fixture with `conditionCode: null`; `derived-fields.mjs:18` treats null as 0 quality contribution).

## Runtime validation
`src/v2/boundary/slice9-nea-catalog.ts`:
- Line 372: `conditionCode: assertFiniteNullableNumber(asteroid.conditionCode, ...)`.
- Lines 174-179: null/undefined → returns `null`; otherwise delegates to `assertFiniteNumber` (lines 166-172): `Number(value)`; if `!Number.isFinite(numeric)` → `throw new Error('Slice 9 ingestion expected finite ...')`.
- Declared types: fixture record `conditionCode: number | null` (line 54); loaded body `readonly conditionCode: number | null` (line 125).
- Consequences: **null survives** to the loaded record (legal, declared). A **letter string throws**, aborting the entire catalog load. A **numeric string is silently coerced** to a number and survives — the one soft spot, but it cannot produce a non-numeric render.

## Committed-catalog observation (the grep numbers)
Against `tests/fixtures/v2/nea-catalog-slice9.json` (`grep -o '"conditionCode":[^,}]*' | sort | uniq -c`):
- Total occurrences: **41,906** — exactly `SLICE9_NEA_CATALOG_TOTAL_BODIES` (slice9-nea-catalog.ts:20).
- Distinct forms (all bare JSON numbers, none quoted): `7`×9587, `8`×8958, `0`×8470, `6`×5110, `9`×3281, `5`×2468, `1`×1705, `4`×1189, `2`×651, `3`×477, **`null`×10**. Sum = 41,906.
- **No letter, no quoted-string, no non-0-9 numeric value present.** The 10 nulls corroborate that the parseNumber null path is exercised in production data and passes the loader (which is what the E/D/F case would also produce).
