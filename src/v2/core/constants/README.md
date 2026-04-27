# V2 Core Constants

This folder owns physical body constants consumed by `core/` and `render/`. It is a contract document first; implementation follows.

## Source of truth

All body radii are extracted from `vendor/naif/pck00010.tpc`, downloaded 2026-04. The mean equatorial radius for each body is the first (equatorial semi-axis `a`) value from the `BODY*_RADII` triplet in that file.

## Unit invariant

Body radii stored in `core/` **must always be in meters** (§3.1 of the Founding Document). The km values below are the raw PCK source values for auditability. Code must use the meter values.

## Visualization colors

The hex colors in this table are `render/` defaults. They are honest approximations, not physically derived values. Visualization colors **must not appear in `core/` modules** — they belong exclusively in `render/` layer code.

## Body table

| NAIF ID | Body    | PCK line | a (km)      | b (km)      | c (km)      | Mean equatorial radius (km) | Mean equatorial radius (m) | Viz color  | Slice 2 fixture frame                     |
|--------:|---------|:--------:|------------:|------------:|------------:|----------------------------:|---------------------------:|:----------:|------------------------------------------|
| 10      | Sun     | 3313     | 696000.0    | 696000.0    | 696000.0    | 696000.0                    | 696 000 000.0              | `0xFFF5E0` | SSB-relative (`CENTER='@ssb'`) — heliocentric origin at Solar System Barycenter |
| 199     | Mercury | 3328     | 2439.7      | 2439.7      | 2439.7      | 2439.7                      | 2 439 700.0                | `0xB5B5B5` | Heliocentric ICRF J2000 (`CENTER='@sun'`) |
| 299     | Venus   | 3343     | 6051.8      | 6051.8      | 6051.8      | 6051.8                      | 6 051 800.0                | `0xE8C98A` | Heliocentric ICRF J2000 (`CENTER='@sun'`) |
| 399     | Earth   | 3362     | 6378.1366   | 6378.1366   | 6356.7519   | 6378.1366                   | 6 378 136.6                | `0x4B9CD3` | Heliocentric ICRF J2000 (`CENTER='@sun'`) |
| 301     | Moon    | 3497     | 1737.4      | 1737.4      | 1737.4      | 1737.4                      | 1 737 400.0                | `0xB0B0B0` | Geocentric GCRS (`CENTER='500@399'`)      |
| 499     | Mars    | 3390     | 3396.19     | 3396.19     | 3376.20     | 3396.19                     | 3 396 190.0                | `0xC1440E` | Heliocentric ICRF J2000 (`CENTER='@sun'`) |

### PCK source lines

```
BODY10_RADII  = ( 696000.      696000.      696000.    )   -- line 3313
BODY199_RADII = (   2439.7       2439.7       2439.7   )   -- line 3328
BODY299_RADII = (   6051.8       6051.8       6051.8   )   -- line 3343
BODY399_RADII = (   6378.1366    6378.1366    6356.7519 )  -- line 3362
BODY499_RADII = (   3396.19      3396.19      3376.20  )   -- line 3390
BODY301_RADII = (   1737.4       1737.4       1737.4   )   -- line 3497
```

Note: `BODY399_RADII` appears at lines `555`, `562`, `831`, and `3362` in `pck00010.tpc`. All four occurrences define the same triplet `(6378.1366, 6378.1366, 6356.7519)`. Line `3362` is the canonical reference cited above. The duplication is a `pck00010` file structure artifact and does not affect the loaded value, since SPICE applies last-definition semantics and all definitions agree.

Reference: `vendor/naif/pck00010.tpc`, downloaded 2026-04.

## Rules for implementors

1. Convert km → m by multiplying by 1000. Never store a km value in a `core/` export.
2. Visualization colors live in `render/` only. They are sourced from this table but must not appear in any `core/` module.
3. The `b` and `c` values (minor semi-axes) are provided for completeness. Unless a module explicitly models oblateness, use the mean equatorial radius `a`.
4. Earth is oblate: `a = 6378.1366 km`, `c = 6356.7519 km`. WGS-84 flattening must be sourced from this table and documented at point of use.
