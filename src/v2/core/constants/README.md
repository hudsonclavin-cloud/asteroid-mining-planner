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

## Saturn System Bodies

These constants extend the body table above for Slice 4. Physical radii remain `core/` data; cadence policy belongs in `src/v2/boundary/slice4-fixture-spec.md`.

### Saturn

- NAIF body ID: `699`
- Triaxial radii (m): `a = 60,268,000`, `b = 60,268,000`, `c = 54,364,000`
- Mean equatorial radius for sphere mesh reference: `60,268,000 m`
- Render note: Saturn render uses all three axes per `src/v2/render/saturn-oblate.md`; the `a` value is not sufficient for the honest Saturn mesh
- `pck00010` line: `3422`
- Color reference: `0xD8C3A5` — tan / cream banded, intentionally muted
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Titan

- NAIF body ID: `606`
- Triaxial radii (m): `a = 2,575,150`, `b = 2,574,780`, `c = 2,574,470`
- Mean equatorial radius for sphere mesh: `2,575,150 m`
- Render note: Slice 4 uses the `a` value only; Titan renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3634`
- Color reference: `0x9E8562` — tan-brown haze
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Rhea

- NAIF body ID: `605`
- Triaxial radii (m): `a = 765,000`, `b = 763,100`, `c = 762,400`
- Mean equatorial radius for sphere mesh: `765,000 m`
- Render note: Slice 4 uses the `a` value only; Rhea renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3633`
- Color reference: `0xCFCFD3` — bright grey
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Iapetus

- NAIF body ID: `608`
- Triaxial radii (m): `a = 745,700`, `b = 745,700`, `c = 712,100`
- Mean equatorial radius for sphere mesh: `745,700 m`
- Render note: Slice 4 uses the `a` value only; Iapetus renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3636`
- Color reference: `0xA79884` — tan-grey
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Tethys

- NAIF body ID: `603`
- Triaxial radii (m): `a = 538,400`, `b = 528,300`, `c = 526,300`
- Mean equatorial radius for sphere mesh: `538,400 m`
- Render note: Slice 4 uses the `a` value only; Tethys renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3631`
- Color reference: `0xF0ECE2` — white-bright
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Dione

- NAIF body ID: `604`
- Triaxial radii (m): `a = 563,400`, `b = 561,300`, `c = 559,600`
- Mean equatorial radius for sphere mesh: `563,400 m`
- Render note: Slice 4 uses the `a` value only; Dione renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3632`
- Color reference: `0xE8E0D3` — white-cream
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Mimas

- NAIF body ID: `601`
- Triaxial radii (m): `a = 207,800`, `b = 196,700`, `c = 190,600`
- Mean equatorial radius for sphere mesh: `207,800 m`
- Render note: Slice 4 uses the `a` value only; Mimas renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3629`
- Color reference: `0x9F9B96` — grey-neutral
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Enceladus

- NAIF body ID: `602`
- Triaxial radii (m): `a = 256,600`, `b = 251,400`, `c = 248,300`
- Mean equatorial radius for sphere mesh: `256,600 m`
- Render note: Slice 4 uses the `a` value only; Enceladus renders as a sphere, with triaxial variation intentionally simplified per the Galilean precedent
- `pck00010` line: `3630`
- Color reference: `0xF6F6F2` — near-white
- Source: `vendor/naif/pck00010.tpc`, downloaded 2026-04

### Saturn Rings

- Saturn's rings are not `BODY*_RADII` entries, but they are still physical-truth data that `core/` and `render/` must agree on
- Render policy reference: `src/v2/render/saturn-rings.md`
- D ring inner radius: `66,900,000 m`
- C ring inner radius: `74,491,000 m`
- A ring outer radius: `136,770,000 m`
- Cassini Division inner radius: `117,500,000 m`
- Cassini Division outer radius: `122,050,000 m`
- Frame note: Saturn's rings live in `FRAME_SATURN_J2000_ICRF`, axis-aligned with Saturn's equator
- Source: PDS Ring-Moon Systems Node, "Vital Statistics for Saturn's Rings" — `https://pds-rings.seti.org/saturn/saturn_rings_table.html`

## Rules for implementors

1. Convert km → m by multiplying by 1000. Never store a km value in a `core/` export.
2. Visualization colors live in `render/` only. They are sourced from this table but must not appear in any `core/` module.
3. The `b` and `c` values (minor semi-axes) are provided for completeness. Unless a module explicitly models oblateness, use the mean equatorial radius `a`.
4. Earth is oblate (`a = 6378.1366 km`, `c = 6356.7519 km`). Slices 1 and 2 render Earth as a sphere using `a`; this is acceptable because oblateness is sub-pixel at any zoom that frames Earth in the heliocentric scene. Future slices that render Earth at sufficient zoom for oblateness to matter (Slice 5+ Earth-fixed surface work) must use the triaxial values.
