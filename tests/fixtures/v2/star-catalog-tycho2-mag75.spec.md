# Slice 8.5 Tycho-2 Star Catalog Binary Spec

Output file:

- `tests/fixtures/v2/star-catalog-tycho2-mag75.bin`

## Header

- bytes `0-7`: ASCII magic `TYC2BIN0`
- bytes `8-11`: `uint32` little-endian version
- bytes `12-15`: `uint32` little-endian star count

Header size: `16` bytes

## Record layout

Each star record is `28` bytes, little-endian:

- bytes `0-3`: `float32` unit direction `x`
- bytes `4-7`: `float32` unit direction `y`
- bytes `8-11`: `float32` unit direction `z`
- bytes `12-15`: `float32` Tycho `V_T` magnitude
- bytes `16-19`: `float32` linear `r` in `[0, 1]`
- bytes `20-23`: `float32` linear `g` in `[0, 1]`
- bytes `24-27`: `float32` linear `b` in `[0, 1]`

## Source and filtering

- source catalogs:
  - Tycho-2 main catalog (`I/259/tyc2`)
  - Tycho-2 supplement-1 (`I/259/suppl_1`) for very bright stars omitted from the main table
- acquisition filter: `V_T <= 7.5`
- runtime asset subset: brightest `10,000` stars after the magnitude filter
- sort order: ascending `V_T` (brightest first)

## Coordinate frame

- positions are unit direction vectors in equatorial J2000 / FK5
- no proper motion is applied in Slice 8.5 v1

## Color mapping

- `B-V = B_T - V_T`
- `B-V` converted to color temperature via Ballesteros' formula
- temperature converted to RGB with a blackbody approximation
- missing `B_T` falls back to near-white `(1.0, 0.95, 0.9)`
