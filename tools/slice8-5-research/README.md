# Slice 8.5 Star Catalog Prep

Offline preprocessing for the Slice 8.5 Tycho-2 star background asset.

## Source

- Catalog: Tycho-2 main catalog (`I/259/tyc2`) via VizieR/CDS
- Query fields: `TYC1`, `TYC2`, `TYC3`, `HIP`, `VTmag`, `BTmag`, `_RAJ2000`, `_DEJ2000`
- Magnitude filter at acquisition: `VTmag <= 7.5`

## Important note

The `VT <= 7.5` VizieR subset returns about `20,000` rows, which is materially larger than the rough scoping estimate in the Slice 8.5 founding doc. The shipped asset therefore keeps the brightest `10,000` stars after the `VT <= 7.5` filter so the runtime asset stays within the intended startup budget while preserving the visual thesis of a magnitude-limited bright-star background.

## Raw source acquisition

Raw Tycho-2 source files are transient and intentionally ignored:

```bash
mkdir -p tools/slice8-5-research/data
curl -L --fail \
  'https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=I/259/tyc2&-out=TYC1,TYC2,TYC3,HIP,VTmag,BTmag,_RAJ2000,_DEJ2000&VTmag=<7.5&-out.max=20000' \
  -o tools/slice8-5-research/data/tycho2-mag75.tsv
curl -L --fail \
  'https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=I/259/suppl_1&-out=TYC1,TYC2,TYC3,HIP,VTmag,BTmag,_RAJ2000,_DEJ2000&VTmag=<7.5&-out.max=20000' \
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

## Binary format

See:

- `tests/fixtures/v2/star-catalog-tycho2-mag75.spec.md`
