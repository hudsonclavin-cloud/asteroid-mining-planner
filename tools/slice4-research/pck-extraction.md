# Slice 4 PCK Extraction: Saturn System Bodies

## Methodology

The Saturn-system body constants below were extracted directly from the vendored NAIF planetary constants kernel:

- Source file: `vendor/naif/pck00010.tpc`
- Line lookup:

```sh
grep -n "BODY699_RADII\|BODY601_RADII\|BODY602_RADII\|BODY603_RADII\|BODY604_RADII\|BODY605_RADII\|BODY606_RADII\|BODY608_RADII" vendor/naif/pck00010.tpc
```

- Occurrence counts:

```sh
grep -c "BODY699_RADII" vendor/naif/pck00010.tpc
grep -c "BODY601_RADII" vendor/naif/pck00010.tpc
grep -c "BODY602_RADII" vendor/naif/pck00010.tpc
grep -c "BODY603_RADII" vendor/naif/pck00010.tpc
grep -c "BODY604_RADII" vendor/naif/pck00010.tpc
grep -c "BODY605_RADII" vendor/naif/pck00010.tpc
grep -c "BODY606_RADII" vendor/naif/pck00010.tpc
grep -c "BODY608_RADII" vendor/naif/pck00010.tpc
```

Actual line lookup output:

```text
3422:        BODY699_RADII     = ( 60268   60268   54364 )
3629:        BODY601_RADII     = (  207.8     196.7     190.6   )
3630:        BODY602_RADII     = (  256.6     251.4     248.3   )
3631:        BODY603_RADII     = (  538.4     528.3     526.3   )
3632:        BODY604_RADII     = (  563.4     561.3     559.6   )
3633:        BODY605_RADII     = (  765.0     763.1     762.4   )
3634:        BODY606_RADII     = ( 2575.15    2574.78   2574.47 )
3636:        BODY608_RADII     = (  745.7     745.7     712.1   )
```

Actual occurrence counts:

```text
BODY699_RADII 1
BODY601_RADII 1
BODY602_RADII 1
BODY603_RADII 1
BODY604_RADII 1
BODY605_RADII 1
BODY606_RADII 1
BODY608_RADII 1
```

## Extracted Radii

| Body | NAIF ID | PCK line | Radii a/b/c (km) | Occurrences | Duplicate note |
| --- | ---: | ---: | --- | ---: | --- |
| Saturn | 699 | 3422 | 60268 / 60268 / 54364 | 1 | No duplicates |
| Mimas | 601 | 3629 | 207.8 / 196.7 / 190.6 | 1 | No duplicates |
| Enceladus | 602 | 3630 | 256.6 / 251.4 / 248.3 | 1 | No duplicates |
| Tethys | 603 | 3631 | 538.4 / 528.3 / 526.3 | 1 | No duplicates |
| Dione | 604 | 3632 | 563.4 / 561.3 / 559.6 | 1 | No duplicates |
| Rhea | 605 | 3633 | 765.0 / 763.1 / 762.4 | 1 | No duplicates |
| Titan | 606 | 3634 | 2575.15 / 2574.78 / 2574.47 | 1 | No duplicates |
| Iapetus | 608 | 3636 | 745.7 / 745.7 / 712.1 | 1 | No duplicates |

## Oblateness Comparison: Saturn vs Jupiter

Saturn is significantly more oblate than Jupiter in the PCK entries used for Slice 3 and Slice 4.

- Saturn: `a = 60268 km`, `c = 54364 km`
- Saturn `c / a = 0.9019`
- Saturn flattening: about `9.8%`

For comparison, Slice 3 documented Jupiter at about `6.5%` flattening (`71492 / 66854`, `c / a = 0.9351`).

This confirms that Slice 4 should reuse the Slice 3 oblate-render pattern for Saturn, and that Saturn's oblateness is even more visually significant than Jupiter's.

## Notes

- All eight Saturn-system `BODY*_RADII` entries appear exactly once in `pck00010.tpc`.
- Saturn is strongly oblate: `a = b = 60268 km`, `c = 54364 km`.
- Several major Saturnian moons are measurably triaxial in the kernel, especially Mimas, Enceladus, Tethys, and Iapetus.
- Titan, Rhea, and Dione are much closer to spherical but still not perfectly equal on all three axes.
- Slice 4 follows the Slice 3 simplification policy: moons render as spheres using the `a` axis, while the primary planet reuses the oblate-body render pattern.
