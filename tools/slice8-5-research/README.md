# Slice 8.5 Star Catalog Prep

Offline preprocessing for the Slice 8.5 Tycho-2 star background asset.

## Source

- Catalog: Tycho-2 main catalog (`I/259/tyc2`) via VizieR/CDS
- Query fields: `TYC1`, `TYC2`, `TYC3`, `HIP`, `VTmag`, `BTmag`, `_RAJ2000`, `_DEJ2000`
- Magnitude filter at acquisition for the current shipped asset: `VTmag <= 8.1`

## Important note

The current shipped asset keeps the brightest `40,000` stars after a complete `VT <= 8.1` acquisition filter. The fixture filename remains `star-catalog-tycho2-mag75.bin` for compatibility even though the current subset is deeper than the original Slice 8.5 `mag75` asset.

## Raw source acquisition

Raw Tycho-2 source files are transient and intentionally ignored:

```bash
mkdir -p tools/slice8-5-research/data
curl -L --fail \
  'https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=I/259/tyc2&-out=TYC1,TYC2,TYC3,HIP,VTmag,BTmag,_RAJ2000,_DEJ2000&VTmag=<8.1&-out.max=50000' \
  -o tools/slice8-5-research/data/tycho2-mag75.tsv
curl -L --fail \
  'https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=I/259/suppl_1&-out=TYC1,TYC2,TYC3,HIP,VTmag,BTmag,_RAJ2000,_DEJ2000&VTmag=<8.1&-out.max=50000' \
  -o tools/slice8-5-research/data/tycho2-suppl1-mag75.tsv
```

## Build

```bash
node tools/slice8-5-research/build-star-catalog.mjs
```

Default output:

- `tests/fixtures/v2/star-catalog-tycho2-mag75.bin`

Default inputs:

- `tools/slice8-5-research/data/tycho2-mag75.tsv`
- `tools/slice8-5-research/data/tycho2-suppl1-mag75.tsv`

## Validate

```bash
node tools/slice8-5-research/validate-star-catalog.mjs
```

Validation checks:

- binary header + version
- star count in expected runtime range
- unit-length direction vectors
- magnitude and RGB value ranges
- Polaris present at the expected polar direction
- Sirius present and sorted first as the brightest star

Notes:

- `VT <= 8.2` and above hit VizieR row truncation in this acquisition shape, so
  `VT <= 8.1` is the deepest complete all-sky subset used for the current asset.

## Binary format

See:

- `tests/fixtures/v2/star-catalog-tycho2-mag75.spec.md`
