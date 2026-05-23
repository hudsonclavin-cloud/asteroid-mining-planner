# Slice 10 research tooling

## extend-horizons-fixture.mjs

Builds the long-window inner-solar-system Horizons fixture for Slice 10 under:

`tests/fixtures/v2/horizons-inner-solar-system-2026-2040.json.new`

It matches the existing Slice 2 Horizons query pattern and output schema, extending the date window to `2026-01-01` through `2040-12-31` at `1d` cadence with `TIME_TYPE=TDB`.

Run from the repo root:

```bash
node tools/slice10-research/extend-horizons-fixture.mjs
```
