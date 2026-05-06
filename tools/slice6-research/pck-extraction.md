# Slice 6 PCK Extraction: Mars System Bodies

## Methodology

The Mars-system body constants below were extracted directly from the vendored NAIF planetary constants kernel:

- Source file: `vendor/naif/pck00010.tpc`
- Line lookup:

```sh
grep -n "BODY499_RADII\|BODY401_RADII\|BODY402_RADII" vendor/naif/pck00010.tpc
```

- Occurrence counts:

```sh
grep -c "BODY499_RADII" vendor/naif/pck00010.tpc
grep -c "BODY401_RADII" vendor/naif/pck00010.tpc
grep -c "BODY402_RADII" vendor/naif/pck00010.tpc
```

Actual line lookup output:

```text
3390:        BODY499_RADII       = ( 3396.19   3396.19   3376.20 )
3516:        BODY401_RADII     = ( 13.0    11.4    9.1 )
3517:        BODY402_RADII     = (  7.8     6.0    5.1 )
```

Actual occurrence counts:

```text
BODY499_RADII 1
BODY401_RADII 1
BODY402_RADII 1
```

## Extracted Radii

| Body | NAIF ID | PCK line | Radii a/b/c (km) | Occurrences | Duplicate note |
| --- | ---: | ---: | --- | ---: | --- |
| Mars | 499 | 3390 | 3396.19 / 3396.19 / 3376.20 | 1 | No duplicates |
| Phobos | 401 | 3516 | 13.0 / 11.4 / 9.1 | 1 | No duplicates |
| Deimos | 402 | 3517 | 7.8 / 6.0 / 5.1 | 1 | No duplicates |

## Mars Alignment Check

Slice 2's current Mars documentation already aligns with the canonical PCK source:

- `src/v2/core/constants/README.md` Mars row lists `3396.19 / 3396.19 / 3376.20`
- `src/v2/core/constants/README.md` also cites `BODY499_RADII = (   3396.19      3396.19      3376.20  )   -- line 3390`

Cross-check against the NASA Mars fact sheet:

- NASA equatorial radius: `3396.2 km`
- NASA polar radius: `3376.2 km`

These agree with `pck00010.tpc` to the expected hundredth/tenth-place rounding. No Mars radii discrepancy is surfaced by pre-research.

## Shape Notes

- Mars is modestly oblate:
  - `a = b = 3396.19 km`
  - `c = 3376.20 km`
  - flattening `(a - c) / a ≈ 0.00589` (`0.589%`)
- Phobos is strongly triaxial:
  - `a = 13.0 km`, `b = 11.4 km`, `c = 9.1 km`
  - `(a - c) / a = 0.30` (`30%` spread from longest to shortest axis)
- Deimos is also strongly triaxial:
  - `a = 7.8 km`, `b = 6.0 km`, `c = 5.1 km`
  - `(a - c) / a ≈ 0.346` (`34.6%` spread from longest to shortest axis)

## Notes

- All three Mars-system `BODY*_RADII` entries appear exactly once in `pck00010.tpc`.
- Mars already aligns with the canonical PCK source, so Slice 6 does not need the kind of constants-cleanup commit that Slice 5 needed for Saturn's A-ring outer radius.
- Both Phobos and Deimos are far more triaxial than the spherical simplification Slice 6 will use in rendering. That simplification remains a deliberate product decision, not a data limitation.
- Mars is only mildly oblate compared with Jupiter and Saturn, but the PCK radii still justify the oblate render path once Slice 6 replaces Slice 2's simple Mars body.
