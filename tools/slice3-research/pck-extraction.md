# Slice 3 PCK Extraction: Jupiter System Bodies

## Methodology

The Jupiter-system body constants below were extracted directly from the vendored NAIF planetary constants kernel:

- Source file: `vendor/naif/pck00010.tpc`
- Line lookup:

```sh
grep -n "BODY599_RADII\|BODY501_RADII\|BODY502_RADII\|BODY503_RADII\|BODY504_RADII" vendor/naif/pck00010.tpc
```

- Occurrence counts:

```sh
grep -c "BODY599_RADII" vendor/naif/pck00010.tpc
grep -c "BODY501_RADII" vendor/naif/pck00010.tpc
grep -c "BODY502_RADII" vendor/naif/pck00010.tpc
grep -c "BODY503_RADII" vendor/naif/pck00010.tpc
grep -c "BODY504_RADII" vendor/naif/pck00010.tpc
```

Actual line lookup output:

```text
3406:        BODY599_RADII     = ( 71492   71492   66854 )
3555:        BODY501_RADII     = ( 1829.4   1819.4   1815.7  )
3556:        BODY502_RADII     = ( 1562.6  1560.3    1559.5  )
3557:        BODY503_RADII     = ( 2631.2  2631.2    2631.2  )
3558:        BODY504_RADII     = ( 2410.3  2410.3    2410.3  )
```

Actual occurrence counts:

```text
BODY599_RADII 1
BODY501_RADII 1
BODY502_RADII 1
BODY503_RADII 1
BODY504_RADII 1
```

## Extracted Radii

| Body | NAIF ID | PCK line | Radii a/b/c (km) | Occurrences | Duplicate note |
| --- | ---: | ---: | --- | ---: | --- |
| Jupiter | 599 | 3406 | 71492 / 71492 / 66854 | 1 | No duplicates |
| Io | 501 | 3555 | 1829.4 / 1819.4 / 1815.7 | 1 | No duplicates |
| Europa | 502 | 3556 | 1562.6 / 1560.3 / 1559.5 | 1 | No duplicates |
| Ganymede | 503 | 3557 | 2631.2 / 2631.2 / 2631.2 | 1 | No duplicates |
| Callisto | 504 | 3558 | 2410.3 / 2410.3 / 2410.3 | 1 | No duplicates |

## Notes

- All five Jupiter-system `BODY*_RADII` entries appear exactly once in `pck00010.tpc`.
- Jupiter is oblate: `a = b = 71492 km`, `c = 66854 km`, so `a != c`.
- Io and Europa are mildly triaxial in the kernel.
- Ganymede and Callisto are spherical in the kernel entries provided here (`a = b = c`).
