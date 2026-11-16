# S20_NHATS_CROSSCHECK — Aster against NASA's NHATS round-trip designs (tools-only research)

Dispatch: S20_NHATS_CROSSCHECK (Nova, 2026-11-15; reviewed by Nova 2026-11-15). Everything here is
LEADS-grade. Nothing in this folder enters a DEC, a test, a fixture or the site.

Results: `REPORT.md` (written last). Per-workstream JSON sits in each workstream folder.

## Layout

| Path | What |
|---|---|
| `lib/jpl.mjs` | Polite recording client. One request at a time, at least 1.1 s apart, descriptive User-Agent. Every response is saved the moment it arrives, with its URL, UTC time and sha256, and is never refetched. On HTTP 429 or 5xx it backs off 30 s, 120 s, then 600 s. Budget 1,500. |
| `lib/apis.mjs` | The exact NHATS and Horizons queries, and their parsers. |
| `lib/aster.mjs`, `lib/build.mjs` | Compiles the production modules with the repo's own tsc into the scratch store, outside the repo. Copied from the longrun2 pattern, not imported across runs. |
| `lib/legs.mjs` | One leg through the unedited kernel `computePorkchopGrid` on a 1 × 1 grid with injected state providers (DEC-20-1), plus NHATS-style round-trip bookkeeping. |
| `lib/export-raw.mjs` | Copies the saved raw responses here as `raw/*.gz` and writes `manifest.ndjson`, verifying each sha256 round trip. |
| `phase0/` | Repository and network proofs, host facts, verify baseline. |
| `n0-gate/` | N0: reproduction of the pilot. |
| `n1-sample/`, `n2-agreement/`, `n3-position-error/`, `n4-entry-convention/`, `n5-earth-2046/` | One folder per workstream. |
| `manifest.ndjson` | One line per HTTP request: seq, url, label, retrievedAtUtc, status, bytes, sha256 (of the uncompressed body), file, attempt. |
| `raw/` | Every raw response, gzipped. Includes the failed attempts: a 503 and a "No matches found" answer. |

## Rerun

Use a store directory outside the repo. Every script reads saved copies first and only fetches what is
missing.

```bash
export NHATS_STORE=/path/to/scratch/store
node tools/slice20-research/nhats/lib/build.mjs
node tools/slice20-research/nhats/n0-gate/gate.mjs
```

To rerun from this folder's raw copies alone, gunzip `raw/*.gz` into `$NHATS_STORE/raw/` (dropping the
`.gz` suffix) and copy `manifest.ndjson` to `$NHATS_STORE/`. Every request is then served from those
copies.
