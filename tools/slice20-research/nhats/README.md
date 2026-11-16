# S20_NHATS_CROSSCHECK — Aster against NASA's NHATS round-trip designs (tools-only research)

Dispatch: S20_NHATS_CROSSCHECK (Nova, 2026-11-15; reviewed by Nova 2026-11-15). Everything here is
LEADS-grade. Nothing in this folder enters a DEC, a test, a fixture or the site.

Results: `REPORT.md`, with numeric tables in `report-tables.md`, which `report-tables.mjs` generates from the
per-workstream JSON. Per-workstream JSON sits in each workstream folder. `SCOPES.md` holds the exact `.dispatch-scope`
contents of every commit.

Run status: N0 REPRODUCED (bit-identical to the pilot). N1 100 of 100 bodies. N2 200 of 200 trajectories.
- N2's first Earth request carried 100 epochs. It returned HTTP 502 through the full back-off and was halted.
- N2b (`n2-agreement/fetch-earth-12.mjs`, authorised by Hudson) then fetched the missing 402 Earth epochs in 34 batches of up to 12. All returned 200.
- 76 trajectories use the Earth fixture's nodes, which are bit-identical to Horizons at every node checked.

N3 covers 400 epochs; its cost covers 200 of 200. N4 covers 200 of 200. N5 is complete.

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
| `n1-sample/`, `n2-agreement/`, `n3-position-error/`, `n4-entry-convention/`, `n5-earth-2046/` | One folder per workstream. Each has its script(s) and JSON output. `n2-agreement/horizons-states.json` holds the parsed Horizons states that N2 and N3 share. |
| `phase0/verify-final-summary.txt` | `npm run verify` at the end of the run, for comparison with the Phase 0 baseline. |
| `manifest.ndjson` | One line per HTTP request: seq, url, label, retrievedAtUtc, status, bytes, sha256 (of the uncompressed body), file, attempt. |
| `raw/` | Every raw response, gzipped. Includes the failed attempts: a 503 and a "No matches found" answer. |

## Rerun

Use a store directory outside the repo. Every script reads saved copies first and only fetches what is
missing.

```bash
export NHATS_STORE=/path/to/scratch/store
node tools/slice20-research/nhats/lib/build.mjs
node tools/slice20-research/nhats/n0-gate/gate.mjs
node tools/slice20-research/nhats/n1-sample/sample.mjs
node tools/slice20-research/nhats/n2-agreement/fetch-states.mjs
node tools/slice20-research/nhats/n2-agreement/fetch-earth-12.mjs
node tools/slice20-research/nhats/n2-agreement/agreement.mjs
node tools/slice20-research/nhats/n3-position-error/position-error.mjs
node tools/slice20-research/nhats/n4-entry-convention/fetch-caveats.mjs
node tools/slice20-research/nhats/n4-entry-convention/convention.mjs
node tools/slice20-research/nhats/n5-earth-2046/earth-2046.mjs
node tools/slice20-research/nhats/report-tables.mjs
```

`fetch-states.mjs` stops with an error at its 100-epoch Earth batch, which Horizons rejects. That is expected: `fetch-earth-12.mjs` fetches the Earth states the 123 out-of-span trajectories need, in batches of 12. `agreement.mjs` uses the labelled fixture-node Earth wherever no Horizons Earth state exists, which applies only to trajectories that lie entirely inside 2026–2040.

To rerun from this folder's raw copies alone, gunzip `raw/*.gz` into `$NHATS_STORE/raw/` (dropping the
`.gz` suffix) and copy `manifest.ndjson` to `$NHATS_STORE/`. Every request is then served from those
copies.
