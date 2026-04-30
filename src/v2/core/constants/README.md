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

## Jupiter System Bodies

These constants extend the body table above for Slice 3. Physical radii remain `core/` data; cadence policy belongs in `src/v2/boundary/slice3-fixture-spec.md`.

### Jupiter

- NAIF body ID: `599`
- Triaxial radii (m): `a = 71,492,000`, `b = 71,492,000`, `c = 66,854,000`
- Mean equatorial radius for sphere mesh reference: `71,492,000 m`
- Render note: Jupiter render uses all three axes per `src/v2/render/jupiter-oblate.md`; the `a` value is not sufficient for the honest Jupiter mesh
- `pck00010` line: `3406`
- Color reference: `0xD9C3A3` — tan / cream banded, intentionally muted
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Io

- NAIF body ID: `501`
- Triaxial radii (m): `a = 1,829,400`, `b = 1,819,400`, `c = 1,815,700`
- Mean equatorial radius for sphere mesh: `1,829,400 m`
- Render note: Slice 3 uses the `a` value only; Io renders as a sphere
- `pck00010` line: `3555`
- Color reference: `0xC9A15A` — muted yellow-orange
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Europa

- NAIF body ID: `502`
- Triaxial radii (m): `a = 1,562,600`, `b = 1,560,300`, `c = 1,559,500`
- Mean equatorial radius for sphere mesh: `1,562,600 m`
- Render note: Slice 3 uses the `a` value only; Europa renders as a sphere
- `pck00010` line: `3556`
- Color reference: `0xD8D3C5` — white / cream, lightly desaturated
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Ganymede

- NAIF body ID: `503`
- Triaxial radii (m): `a = 2,631,200`, `b = 2,631,200`, `c = 2,631,200`
- Mean equatorial radius for sphere mesh: `2,631,200 m`
- Render note: Slice 3 uses the `a` value only; Ganymede renders as a sphere
- `pck00010` line: `3557`
- Color reference: `0x9A8F7A` — tan-grey, intentionally subdued
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Callisto

- NAIF body ID: `504`
- Triaxial radii (m): `a = 2,410,300`, `b = 2,410,300`, `c = 2,410,300`
- Mean equatorial radius for sphere mesh: `2,410,300 m`
- Render note: Slice 3 uses the `a` value only; Callisto renders as a sphere
- `pck00010` line: `3558`
- Color reference: `0x5E5851` — dark grey, low saturation
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

## Rules for implementors

1. Convert km → m by multiplying by 1000. Never store a km value in a `core/` export.
2. Visualization colors live in `render/` only. They are sourced from this table but must not appear in any `core/` module.
3. The `b` and `c` values (minor semi-axes) are provided for completeness. Unless a module explicitly models oblateness, use the mean equatorial radius `a`.
4. Earth is oblate: `a = 6378.1366 km`, `c = 6356.7519 km`. WGS-84 flattening must be sourced from this table and documented at point of use.
