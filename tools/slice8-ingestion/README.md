# Slice 8 Ingestion

Build-time Horizons anchor ingestion for Slice 8's additional `9,000` main-belt asteroids.

## Scope

- reads the Top `10,000` main-belt inventory from `tools/slice8-research/data/main-belt-top-10000.json`
- reuses the existing `1,008` Slice 7 anchors from `tools/slice7-research/data/horizons-anchors.json`
- fetches only the `9,000` new main-belt bodies at the uniform Slice 8 anchor epoch `JD 2461161.5`
- writes schema-compatible output for the new `9,000` anchors only

## Files

- `fetch-anchors.mjs`: main ingestion script
- `data/`: output directory for anchor payloads
- `checkpoint.json`: default full-run checkpoint path

## Default Output

- output file: `tools/slice8-ingestion/data/horizons-anchors-9000.json`
- checkpoint file: `tools/slice8-ingestion/checkpoint.json`

The output document preserves the Slice 7 `horizons-anchors.json` body schema:

```json
{
  "source": "NASA/JPL Horizons API",
  "generatedAtUtc": "2026-05-13T00:00:00.000Z",
  "anchor_epoch_tdb_jd": 2461161.5,
  "anchor_time_label": "2026-05-01 00:00:00 TDB",
  "bodyCountExpected": 9000,
  "bodies": [
    {
      "designation": "29",
      "spk_id": 29,
      "name": "Amphitrite",
      "class": "MBA",
      "H": 5.9,
      "epoch_tdb_jd": 2461161.5,
      "timestamp_tdb": "2026-May-01 00:00:00.0000",
      "position_km": [0, 0, 0],
      "velocity_km_per_s": [0, 0, 0],
      "position_magnitude_km": 0,
      "velocity_magnitude_km_per_s": 0,
      "params": {}
    }
  ]
}
```

## Usage

Full run:

```bash
node tools/slice8-ingestion/fetch-anchors.mjs
```

50-body validation run:

```bash
node tools/slice8-ingestion/fetch-anchors.mjs \
  --limit=50 \
  --output=tools/slice8-ingestion/data/validation-50.json \
  --checkpoint=tools/slice8-ingestion/checkpoint-validation.json
```

Simulated interruption after 25 fetched bodies:

```bash
node tools/slice8-ingestion/fetch-anchors.mjs \
  --limit=50 \
  --output=tools/slice8-ingestion/data/validation-50.json \
  --checkpoint=tools/slice8-ingestion/checkpoint-validation.json \
  --stop-after=25
```

Resume after interruption:

```bash
node tools/slice8-ingestion/fetch-anchors.mjs \
  --limit=50 \
  --output=tools/slice8-ingestion/data/validation-50.json \
  --checkpoint=tools/slice8-ingestion/checkpoint-validation.json
```

## Checkpoint Format

Checkpoint files are JSON and are written after every chunk flush and at intentional stop points:

```json
{
  "version": 1,
  "generatedAtUtc": "2026-05-13T00:00:00.000Z",
  "anchorEpochTdbJd": 2461161.5,
  "requestedLimit": 50,
  "chunkSize": 1000,
  "outputPath": "/abs/path/to/output.json",
  "nextFetchIndex": 25,
  "fetchedCount": 25,
  "expectedCount": 50,
  "completedChunks": 0,
  "retryCount": 0,
  "lastCompletedDesignation": "12345",
  "status": "running"
}
```

Checkpoint semantics:

- `nextFetchIndex`: index in the filtered `9,000`-body delta inventory to fetch next
- `fetchedCount`: number of bodies already written to the output document
- `completedChunks`: fully validated chunk count
- `status`: `running`, `complete`, or `stopped`

Resume correctness depends on keeping the same `--limit`, `--output`, and filtered inventory source.
