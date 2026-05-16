# Slice 9 Pre-Research

This folder holds data-only Slice 9 scoping research.

Scope:

- live SBDB NEO catalog pull
- occupancy measurements at multiple candidate grid sizes
- bounded CAD + Horizons validation sample for future INV-014 tier design

Non-scope:

- no fixture generation
- no `src/v2/` changes
- no renderer code
- no deploy or cutover work

Primary scripts:

- `fetch-sbdb-nea.mjs` — pulls the full current SBDB `sb-group=neo` set and writes raw + summary data
- `measure-occupancy.mjs` — propagates the live SBDB set to a common epoch and measures grid occupancy
- `measure-inv014-sample.mjs` — builds a bounded CAD/Horizons validation sample and measures 90-day Keplerian error
- `build-report.mjs` — synthesizes the committed Markdown report from the ignored data artifacts

Ignored data outputs land under `tools/slice9-research/data/`.

