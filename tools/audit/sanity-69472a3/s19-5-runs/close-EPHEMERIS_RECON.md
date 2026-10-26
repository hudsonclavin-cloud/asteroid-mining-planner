# S19.5 ephemeris coverage recon

Read-only recon on 2026-10-26. No data was fetched, generated, or edited.

## Runtime coverage

`src/v2/app/solar-system/runtime.ts` computes the intersection of every loaded body-state series: the latest first sample is `timeMin` and the earliest last sample is `timeMax`. Every production rolling series currently has the same endpoints, JD 2461239.5 through 2461329.5 TDB, so all 22 series tie as both the start and end binders. The view coverage is therefore 2026-07-18 through 2026-10-16 TDB.

The second date reported by the cold read, 2026-07-18, is not a second clamp bound or an asteroid-elements epoch. It is the common coverage start printed by the existing coverage line. The clamped wall-clock position uses the common end, 2026-10-16.

## Production fixtures

All four files identify NASA/JPL Horizons API as the source, ICRF/J2000 as the frame, and TDB as the time scale. They were committed together at `57e4cba`.

| Fixture | Bytes | SHA-256 | Series / endpoints |
|---|---:|---|---|
| `src/v2/data/horizons-inner-system-rolling.json` | 120380 | `d731a7ec326100be803a876f27f6805baffc10316ccf1a05294a082e69661ce4` | 6; all 2026-07-18..2026-10-16 |
| `src/v2/data/horizons-jupiter-system-rolling.json` | 778272 | `62c1f4693d0b7d992be81564838143e0e898357a101190bc1de035cccc006f45` | 5; all 2026-07-18..2026-10-16 |
| `src/v2/data/horizons-mars-system-rolling.json` | 1477959 | `d199bfea58b1747e7251e54d222d05d55d8762e787f09e9bb324f94b01423a26` | 3; all 2026-07-18..2026-10-16 |
| `src/v2/data/horizons-saturn-system-rolling.json` | 1846748 | `58aab9cb94451d44882a2178d260e148de53b282405686b4a3b3a901856f3cae` | 8; all 2026-07-18..2026-10-16 |

## Committed generation path

The parameterized fetchers and builders are committed under `tools/slice2-research/`, `tools/slice3-research/`, `tools/slice4-research/`, and `tools/slice6-research/`. Window parameters and builder output/input arguments landed in `3217617`; window-scoped intermediate caches were corrected in `1c247cc` and `26dbc0e`. The current dated intermediate inputs are not committed, so exact reproduction from a clean checkout requires a new Horizons fetch.

For an end date `<END>` (`2030-12-31` or `2060-12-31`), the existing command family is:

```text
node tools/slice2-research/fetch-horizons.mjs 2026-07-18 <END>
node tools/slice2-research/build-fixture.mjs src/v2/data/horizons-inner-system-rolling.json tools/slice2-research/data/2026-07-18_<END>

node tools/slice3-research/fetch-horizons.mjs 2026-07-18 <END>
node tools/slice3-research/fetch-horizons.mjs 2026-07-18 <END> --io-extension
node tools/slice3-research/build-jupiter-system-fixture.mjs src/v2/data/horizons-jupiter-system-rolling.json tools/slice3-research/data/2026-07-18_<END>

node tools/slice4-research/fetch-horizons.mjs 2026-07-18 <END>
node tools/slice4-research/fetch-horizons.mjs 2026-07-18 <END> --mimas-extension
node tools/slice4-research/fetch-horizons.mjs 2026-07-18 <END> --enceladus-extension
node tools/slice4-research/fetch-horizons.mjs 2026-07-18 <END> --tethys-extension
node tools/slice4-research/build-saturn-system-fixture.mjs src/v2/data/horizons-saturn-system-rolling.json tools/slice4-research/data/2026-07-18_<END>

node tools/slice6-research/fetch-horizons.mjs 2026-07-18 <END>
node tools/slice6-research/build-mars-system-fixture.mjs src/v2/data/horizons-mars-system-rolling.json tools/slice6-research/data/2026-07-18_<END>
```

The fetches must be performed in a separately ruled data-extension run, with Horizons response limits checked and long high-cadence requests chunked if necessary; the existing builders require the named cadence-specific intermediates.

## Size estimates

Current combined size is 4,223,359 bytes for a 91-day inclusive span. Scaling each existing serialized fixture by inclusive span (an estimate, not a generated result):

| End | Inclusive days | Inner | Jupiter | Mars | Saturn | Combined |
|---|---:|---:|---:|---:|---:|---:|
| 2030-12-31 | 1,628 | ~2.1 MiB | ~13.3 MiB | ~25.2 MiB | ~31.5 MiB | ~72.1 MiB |
| 2060-12-31 | 12,586 | ~15.9 MiB | ~102.7 MiB | ~194.9 MiB | ~243.6 MiB | ~557.1 MiB |

These are storage projections only. They do not establish that one unchunked Horizons request per cadence is accepted or that shipping ~557 MiB to the browser is an acceptable architecture.

## Tests affected by a range extension

`tests/v2-ephemeris-hud.test.mjs` reads the four production rolling artifacts, derives their intersection, and pins the current 2026-07-18 / 2026-10-16 labels. It must be updated in the same ruled data-extension commit. Existing boundary, interpolation, frame, render, and cutover tests named `*-90d*` read separate `tests/fixtures/v2/horizons-*-90d.json` files; they do not pin the production rolling artifacts and should not be rewritten merely because production coverage changes.
