# S20_00 ephemeris roll manifest

Solar-system view rolling Horizons fixtures regenerated for a new window on 2026-11-03.
Run: Claude Code on Hudson's laptop, branch `s20-eph-roll` from `ab03126` (tag `s20-pre-eph-roll`).

## Window

- START 2026-11-01 TDB (JD 2461345.5), END 2027-03-31 TDB (JD 2461495.5), 151 days inclusive.
- Previous window: 2026-07-18..2026-10-16 TDB (JD 2461239.5..2461329.5), 91 days inclusive, committed at `57e4cba`.
- Format, cadences, frame (ICRF/J2000), time scale (TDB), source (NASA/JPL Horizons API) and units are unchanged.
- Next refresh is due before 2027-03-31.

## Ruling (Nova, 2026-11-03; Hudson accepted by launching)

- Window: START = 2026-11-01, END = 2027-03-31 TDB (151 days inclusive).
  Payload estimate ~7.0 MB vs 4.2 MB today (+~2.8 MB on the front page). A longer window in
  this format scales linearly (2030: ~72 MiB; 2060: ~557 MiB per the S19.5 recon), so it is
  not an option. The real fix (per-body coverage: planets long, moon systems rolling) is
  Slice 22 Living Sky. Next refresh is due before 2027-03-31.
- Tests that pin the production coverage dates are DATA-DERIVED pins: update their literal
  endpoints in the same commit as the data (S19.5 recon recommendation). Do NOT touch the
  *-90d test fixtures under tests/fixtures/v2/.

## Commands (run from the repo root, in this order)

```text
node tools/slice2-research/fetch-horizons.mjs 2026-11-01 2027-03-31
node tools/slice6-research/fetch-horizons.mjs 2026-11-01 2027-03-31
node tools/slice3-research/fetch-horizons.mjs 2026-11-01 2027-03-31
node tools/slice3-research/fetch-horizons.mjs 2026-11-01 2027-03-31 --io-extension
node tools/slice4-research/fetch-horizons.mjs 2026-11-01 2027-03-31
node tools/slice4-research/fetch-horizons.mjs 2026-11-01 2027-03-31 --mimas-extension
node tools/slice4-research/fetch-horizons.mjs 2026-11-01 2027-03-31 --enceladus-extension
node tools/slice4-research/fetch-horizons.mjs 2026-11-01 2027-03-31 --tethys-extension

node tools/slice2-research/build-fixture.mjs src/v2/data/horizons-inner-system-rolling.json tools/slice2-research/data/2026-11-01_2027-03-31
node tools/slice6-research/build-mars-system-fixture.mjs src/v2/data/horizons-mars-system-rolling.json tools/slice6-research/data/2026-11-01_2027-03-31
node tools/slice3-research/build-jupiter-system-fixture.mjs src/v2/data/horizons-jupiter-system-rolling.json tools/slice3-research/data/2026-11-01_2027-03-31
node tools/slice4-research/build-saturn-system-fixture.mjs src/v2/data/horizons-saturn-system-rolling.json tools/slice4-research/data/2026-11-01_2027-03-31
```

Before the fetches, one reachability request (Earth, 2026-11-01..2026-11-02, 1 d) returned HTTP 200,
no API error, signature version 1.2, and two samples (JD 2461345.5 and 2461346.5).

## Intermediates

Intermediates are not committed; re-run with the commands above. They total 113,033,070 bytes across 97 files and are
excluded because of their size. The fetchers write a parsed JSON document per request (sample
list plus request params), not the raw HTTP body, so the SHA-256 values below are those
intermediate files as written on 2026-11-03. A re-fetch writes a new `fetchedAtUtc`, so the
intermediate hashes will differ even when the samples are identical. After the build the
intermediate directories were moved out of the working tree, because `tools/slice*-research/data/`
is not gitignored.

All 97 requests returned the expected number of rows ((END - START) / step + 1), uniform spacing,
and first/last JD 2461345.5/2461495.5. No request was chunked or truncated.

### slice2 (inner system)

| File | STEP_SIZE | Rows (got/expected) | JD first..last | Cadence | Bytes | SHA-256 | Check |
|---|---|---|---|---|---:|---|---|
| daily-earth.json | 1d | 151/151 | 2461345.5..2461495.5 | uniform=true | 52620 | 636a3c223a387a2faab1f9cfa15be9b6ef9463205b74983dc8f1132b02209877 | OK |
| daily-mars.json | 1d | 151/151 | 2461345.5..2461495.5 | uniform=true | 52720 | c122dc0fae2b8b017be84edf0234ac4f4aceae05d99861732f6f795ec7f23c35 | OK |
| daily-mercury.json | 1d | 151/151 | 2461345.5..2461495.5 | uniform=true | 52666 | 44255acfc45c663b6686dd756185b87403e2e13a50e8e7326f4cff2d6112786f | OK |
| daily-moon.json | 1d | 151/151 | 2461345.5..2461495.5 | uniform=true | 53096 | c1b76a7054b7ef62ad02157a03c7cc26fede22273a21670b67b390a0d72ca510 | OK |
| daily-sun.json | 1d | 151/151 | 2461345.5..2461495.5 | uniform=true | 53893 | 727dc53bffcec0ad85db123cb69389abc95e551af5cb664ec09fc5787668fbd1 | OK |
| daily-venus.json | 1d | 151/151 | 2461345.5..2461495.5 | uniform=true | 52677 | 026f98111b89dfd89619f3015dcf1900fd5ded8819a3598666602c42cd03311a | OK |
| truth-earth.json | 6h | 601/601 | 2461345.5..2461495.5 | uniform=true | 207656 | dc23d10ded2f47e109e23c11fdf80190b73dc4deb517e8f09d5114543d4b288d | OK |
| truth-mars.json | 6h | 601/601 | 2461345.5..2461495.5 | uniform=true | 208080 | 148b80190352fdcdb934a773851fe7ded12f621615ed6f5b45e3ab6f9614a3ad | OK |
| truth-mercury.json | 6h | 601/601 | 2461345.5..2461495.5 | uniform=true | 207853 | cdd396207b171a5b28141506a15af321be431d53765799404f8dcf50c0085cb5 | OK |
| truth-moon.json | 6h | 601/601 | 2461345.5..2461495.5 | uniform=true | 209569 | cdee782bc18b12884c5c4d48e750c648cc7b7399c6eaaa1e1618569163f5063e | OK |
| truth-sun.json | 6h | 601/601 | 2461345.5..2461495.5 | uniform=true | 212760 | 8e3bc4488e7df1c75c9d62fb5c8a9daf626fb312afe9108064a80d9374dba5dd | OK |
| truth-venus.json | 6h | 601/601 | 2461345.5..2461495.5 | uniform=true | 207936 | d735650788f9e8dddf89ddd345360da4c4119b7c1a0bc2a8093bb9d2fe90c3b8 | OK |

Request URLs (no secrets; the API takes none):

- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=399&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=1d
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=499&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=1d
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=199&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=1d
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=301&CENTER=500%40399&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=1d
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=10&CENTER=%40ssb&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=1d
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=299&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=1d
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=399&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=6h
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=499&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=6h
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=199&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=6h
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=301&CENTER=500%40399&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=6h
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=10&CENTER=%40ssb&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=6h
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=299&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=6h

### slice6 (Mars system)

| File | STEP_SIZE | Rows (got/expected) | JD first..last | Cadence | Bytes | SHA-256 | Check |
|---|---|---|---|---|---:|---|---|
| deimos-15m.json | '15 m' | 14401/14401 | 2461345.5..2461495.5 | uniform=true | 5084782 | c5573a1512ef7bc3d3d22455a70a9977a38efb3824cd2fe1249c7612ce0bed73 | OK |
| deimos-1h.json | '1 h' | 3601/3601 | 2461345.5..2461495.5 | uniform=true | 1269483 | 99dd15db67fc61a2df2951f4575d44754de3160e4ddda8eb0fcb196482065e37 | OK |
| deimos-30m.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2540454 | 82746c53c779cb677e01b216905ac641a2770319845589a6dd74ee7e0b93e183 | OK |
| mars-1d.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52749 | 08f9903e2967181763b316964bf62dd21b67018cd482e062d6f6fbddd92f320a | OK |
| phobos-15m.json | '15 m' | 14401/14401 | 2461345.5..2461495.5 | uniform=true | 5070529 | 2dfa8b6a6c2aad687f90d832783e20b37bb7af4f93195a5db704eb5848fbffb2 | OK |
| phobos-1h.json | '1 h' | 3601/3601 | 2461345.5..2461495.5 | uniform=true | 1265928 | 332c05c417368b9a4797c53306b4af758255ccb2e226e599cd7680cfd9531bf5 | OK |
| phobos-30m.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2533399 | 759955952d8b4ab4eaf3d31f4d9a693b19b4f91823eb0d7877c36e56adaede91 | OK |
| phobos-5m.json | '5 m' | 43201/43201 | 2461345.5..2461495.5 | uniform=true | 15257147 | f082228ecb85b6fa6f926e1594b71ad7c34e0b7afb05101989614e01ee67583b | OK |

Request URLs (no secrets; the API takes none):

- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=402&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2715+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=402&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=402&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=499&CENTER=500%4010&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=401&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2715+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=401&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=401&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=401&CENTER=500%40499&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%275+m%27

### slice3 (Jupiter system, including --io-extension)

| File | STEP_SIZE | Rows (got/expected) | JD first..last | Cadence | Bytes | SHA-256 | Check |
|---|---|---|---|---|---:|---|---|
| 12h-callisto.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104055 | bbe0580b3f22f4b54adcb5b43f5060625f2d2fb28143866253eda32a786e5745 | OK |
| 12h-europa.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104021 | 27be93ce8bf5445055fe24c2c40cdad12aa1f9d85a6f1c60763c805d97117377 | OK |
| 12h-ganymede.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104021 | 969f749a14678bf53521887acc9b7b99451913295df5e29eda121391b55b9779 | OK |
| 12h-io.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104039 | 7e9b06c1f6108316ae499fee60afafb17ba50689df63a5f3bceaa0cd1959ab61 | OK |
| 12h-jupiter.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104186 | 033a8f8306d34bf5f3f9214c491990086cd7f3fae77e369393915cce1d83a86c | OK |
| 1h-io.json | '1 h' | 3601/3601 | 2461345.5..2461495.5 | uniform=true | 1261520 | 54802a3c2511b8bf993e24e660cf4cbd8e6b2d5783afee7fbb893704c31593b3 | OK |
| 30m-io.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2524520 | 49dfb7e3d442f7404fb65d0c0e74b7b7b0135fb91f21ae3d4c4f2a9106dd2c15 | OK |
| 3h-callisto.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 415810 | 81688c60ef2f5b636ffe11fe1c541a527503d336f706d018687635120e5198d8 | OK |
| 3h-europa.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 415633 | e4920105c3be7acc067bff78491889ca4346ffd1e19bb8ef374ff6e6b5f47ddc | OK |
| 3h-ganymede.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 415590 | c89529f5b828a84a1e1ffbd8f4d1e353711f29e6a6cc6f41726c96976fe7ac95 | OK |
| 3h-io.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 415574 | 05164998cade469aefecf425da496ba667ddee041c63eae6b48f73df713c96c6 | OK |
| 3h-jupiter.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 416345 | 2345c531e41ff6a0dc319ffc0575a23733c22c617c72fce4f90318cd2ab87245 | OK |
| 6h-callisto.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207785 | 4736e4d7c4f421e37e286f3daee61180f55010a3b59106516cde2ecd13a3018a | OK |
| 6h-europa.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207696 | f97467e93bae07bf46750bbed71a84bd64a75335a27383d1c32e0d528a421a2f | OK |
| 6h-ganymede.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207668 | 89931b75b2a4fcc5d636dd6b8d80140c2f81e361b32f846796a9ab966213edfa | OK |
| 6h-io.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207674 | 899c01ea0686bf24bdd7ac6d58dba7f8e825978e09fdba7dff0cbdca7307ed11 | OK |
| 6h-jupiter.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 208030 | 8a7736c79cb374b0d8f08ebb686a2d3c7a0387121f242b735f21799b4378c66b | OK |
| daily-callisto.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52651 | 08f2dfcec324c0c1ba3621c8bcf397673fcc9a73b161c623bfce43fba54a20d1 | OK |
| daily-europa.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52639 | 65ed3e95d14bbd437491eb639fb97fffa7cc90aa4d54153e7afb7a7c8d63222e | OK |
| daily-ganymede.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52643 | 97714818dd2613787cd6bb4b73ad897ccb3262d397c30c0b3056f3ac4f3ffd37 | OK |
| daily-io.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52651 | 8b6d104d56b6cdfa6f8a9ee89a6ede86d93a713dcdac09bf138e3466124f15f6 | OK |
| daily-jupiter.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52730 | 65555482b169d54a2ca3f9a0e8ae73cb5f7a4ec82bd5d76c6c22e744f67f9b41 | OK |
| truth-15m-io.json | '15 m' | 14401/14401 | 2461345.5..2461495.5 | uniform=true | 5052853 | fb092d9be675daeed961447039a433f571ac324aa5f6198249ca318da4ca4918 | OK |
| truth-callisto.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2525960 | 111650239056f1e82a837cc53dea3ee5d5959e7a768c77886200b109e8cadcb1 | OK |
| truth-europa.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2524677 | a840a92deba38567ede7007aa5a92c92d90c4e4465073975a1cbec59e64218ad | OK |
| truth-ganymede.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2524875 | 455dcbc5fdd7e3df04e483ad27041f3558bbcbdf342f468012128bccf48d1546 | OK |
| truth-io.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2524522 | 3504e6820457d3597c086c6ec481390e8fc7bde09c5a3e75b086f516a9d13a55 | OK |
| truth-jupiter.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2529235 | 957c899aa40a396ee989bc896286e5957194d9dac06e28f36865e4c332fb0018 | OK |

Request URLs (no secrets; the API takes none):

- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=504&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=502&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=503&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=599&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=504&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=502&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=503&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=599&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=504&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=502&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=503&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=599&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=504&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=502&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=503&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=599&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2715+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=504&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=502&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=503&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=501&CENTER=500%40599&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=599&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27

### slice4 (Saturn system, including the mimas, enceladus and tethys extensions)

| File | STEP_SIZE | Rows (got/expected) | JD first..last | Cadence | Bytes | SHA-256 | Check |
|---|---|---|---|---|---:|---|---|
| 12h-dione.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104197 | 1b719804c5d173c07c9be98770392ef60c9274e34b4fcad17ab228cc60afabdd | OK |
| 12h-enceladus.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104137 | 052b0866dba13076faa1511b8413b499b524d5c03018d3734d62e55adf32c215 | OK |
| 12h-iapetus.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104466 | ea198b3fd1d78f35ddd1626d84779583e5269afa7a31e46e06cc41e97bafbeef | OK |
| 12h-mimas.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104084 | 65d9426cc6a6e06a308c78330faed2fb2f53acf6183ae02c8aad2a7a962a8703 | OK |
| 12h-rhea.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104337 | 2f7a14dc6cf5ef34ca4532a4f9179cbf1997d157390955c3f7c78cc14f24d7ba | OK |
| 12h-saturn.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 103303 | 4e4aac96bb847fc66b7c0040d0bab7d6282251963e71c649af593612cad7686b | OK |
| 12h-tethys.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104173 | cf9d444487dc2e24f7b4433f532846af8aa81a6a2482b9e3747174359f8786fe | OK |
| 12h-titan.json | '12 h' | 301/301 | 2461345.5..2461495.5 | uniform=true | 104370 | 81b9ee528c47db5a5911c50df6712c28ed3f8a456d4a6ed9007061141c2b836c | OK |
| 1h-enceladus.json | '1 h' | 3601/3601 | 2461345.5..2461495.5 | uniform=true | 1263153 | 3bfc2f46673c8321d69ba951f4cad3a23ab0a527e4afb355eef506f5b99810b9 | OK |
| 1h-mimas.json | '1 h' | 3601/3601 | 2461345.5..2461495.5 | uniform=true | 1262603 | a9da9072afd2952d2c81fc7435ee61d75d72cdfb17a8221a67c5455a60c9c884 | OK |
| 1h-tethys.json | '1 h' | 3601/3601 | 2461345.5..2461495.5 | uniform=true | 1263650 | b80c07994ceb9a8fef5b86fcb35ed48441aad1841210a01fbb8a87c9a6f30a68 | OK |
| 30m-enceladus.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2527817 | dcebc7e5c2f61e9a7e24833bc4e7561e0be941819d4bac772cbf05d51f3fe8a1 | OK |
| 30m-mimas.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2526656 | ed44b99bc0ea4e478f8a6945af31e64f392437971214810139741970298a3413 | OK |
| 30m-tethys.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2528745 | 14fa54afac1b349a24320540318370ee0960c828da96cdd37bcfec3229c8a690 | OK |
| 3h-dione.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 416331 | 96beed278a3b5c24558f0d11126f77efad76a39e37da23a7cc519e02b997b677 | OK |
| 3h-enceladus.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 416079 | a2c703ecee3314108ea2bfb58287c5f8bc9adef3874445805738f757f6e80813 | OK |
| 3h-iapetus.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 417345 | 256e3814037dc93e1174e2b829aab602d3c21cfcd0036c14d4f69cb641281368 | OK |
| 3h-mimas.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 415908 | f6c3ac5753beb5a2b289bf77f6205416eef52e29be274f9b5654ddf3e4bb91e2 | OK |
| 3h-rhea.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 416772 | 56a755fdd7b713f435307bca75ab0fb17a834654616b9538f2b822ffefc9ef69 | OK |
| 3h-saturn.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 412735 | 67a9685f3932ba68cf08dfa34c03c59f42c71df3cf384e3d9648b6a3ecdb9416 | OK |
| 3h-tethys.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 416242 | a7f9f7b2d5f3c414a4347f59dd259d417ab03fd6cb584fa14ba92801dc920ee7 | OK |
| 3h-titan.json | '3 h' | 1201/1201 | 2461345.5..2461495.5 | uniform=true | 417007 | 46a648bb4013d544f9afa7b0aada1f4d22b8035f5d9f7b5dcecabeba4b63e239 | OK |
| 6h-dione.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 208051 | c7862fd6389c943b66a23875257e00d709a27a756cd555ab2929f14d1d2e2faf | OK |
| 6h-enceladus.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207915 | 12e5710c42b43d88344916f7519c70874be35e3808db14873f0787648e360b39 | OK |
| 6h-iapetus.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 208553 | f21dbdbfd0440378ceac9f8ea4b35b27a2e386e61e091d2a55fe3ac9404ff68d | OK |
| 6h-mimas.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207807 | 65773f9586fcef7e00b29cca7713a9ef1f01d49700706addbfbd3bac51400dbd | OK |
| 6h-rhea.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 208279 | 5c1215970097d659e48379f8209811cbdc72587829bef3f34f66b03fcc729ee3 | OK |
| 6h-saturn.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 206191 | cdb37dd11c5f3ad6ac6abe3dfc7bd265510b5d0da2f95f7703791605b31fe2b0 | OK |
| 6h-tethys.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 207991 | a596297daa05068f89603360e3e38233b949ddb7d741716688494da2c6776cb1 | OK |
| 6h-titan.json | '6 h' | 601/601 | 2461345.5..2461495.5 | uniform=true | 208382 | 3020cdde0765460b50314949b6886869a5eb9d1a76f5933c95716c7fdb3276bb | OK |
| daily-dione.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52731 | ad57126925d6d04c9c13510601269f445c01a692a3859b576838f711bc159dff | OK |
| daily-enceladus.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52687 | 8448146ed2f9691da1a554399e9d08bc7805b8156eccd6bf09ba24d39e7ddaf7 | OK |
| daily-iapetus.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52865 | 8bcf20161bebf47236d88103e7694d854659f1cc3d9b63c23b6d9075c6e6d888 | OK |
| daily-mimas.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52678 | 23dc9553bcdf9e4c96cabb97730be5c55dc7cab8e83bec3a7cea9d7cf4a5a666 | OK |
| daily-rhea.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52795 | 65cd0b92f3460390c16693101239f610750eeb61aea0455b10239d68eb1dda26 | OK |
| daily-saturn.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52278 | 28b2614aff1ed28d2c98fa4b5892a16391eb11a44a3948e957fe23644f0a2818 | OK |
| daily-tethys.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52712 | 3eec74a267b5970556310aee51536423c2758e8ad67d384f67c272df0b7fc0d6 | OK |
| daily-titan.json | '1 d' | 151/151 | 2461345.5..2461495.5 | uniform=true | 52804 | 00064b0d71a9883dd064623c0c684321f150856d3518e68cff339f1a840e7a1d | OK |
| truth-15m-enceladus.json | '15 m' | 14401/14401 | 2461345.5..2461495.5 | uniform=true | 5059467 | 3445c4cc2ce877a30079b527af5627ea3b6895bb93d609bbb3fee7832f5224c1 | OK |
| truth-15m-mimas.json | '15 m' | 14401/14401 | 2461345.5..2461495.5 | uniform=true | 5057228 | ec7152b76999bd57b127572daaf61b2246def131f2ed98de106078eb81bc74bc | OK |
| truth-15m-tethys.json | '15 m' | 14401/14401 | 2461345.5..2461495.5 | uniform=true | 5061292 | 57d644b54aa2e9583e2e367f7394fa6f62cf3f96bb36b39136da2994a1991c0a | OK |
| truth-dione.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2529277 | 6e3031d00fc41b229025fa56df28e85bca371a1676675899cf793efe3b2720fb | OK |
| truth-enceladus.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2527819 | 4d22fedf2e96ff77c11f73659e3b7fe1a92fc38027a9137219c120231419b7a5 | OK |
| truth-iapetus.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2535066 | 4f122b1fdc62b42b6aa6fabab6cc4222bdad5200e07cd540805217d45be6cdec | OK |
| truth-mimas.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2526658 | 64aab8d4bfaef3c070f49a992633025e961a0914f890ff5cff87599383c4ff13 | OK |
| truth-rhea.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2532024 | 5512b2c80aad61c126380b4b5bda1d43c8cf51dbf7421f337409431a06f778e3 | OK |
| truth-saturn.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2507975 | 3e30e973466ce0d16b74f1e9c292d561eb5094e34c1e45f0e397a216e377b50e | OK |
| truth-tethys.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2528747 | cb2672caafbb8ab6d40de6025902df392356ca8467b0e8fb8a030dd344b039e7 | OK |
| truth-titan.json | '30 m' | 7201/7201 | 2461345.5..2461495.5 | uniform=true | 2533088 | 0209e16d9ff0ec8b962da12a75f28384405159004e46f2b9327486a67dde9d2d | OK |

Request URLs (no secrets; the API takes none):

- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=604&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=608&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=605&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=699&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=606&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2712+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=604&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=608&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=605&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=699&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=606&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%273+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=604&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=608&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=605&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=699&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=606&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%276+h%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=604&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=608&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=605&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=699&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=606&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%271+d%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2715+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2715+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2715+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=604&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=602&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=608&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=601&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=605&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=699&CENTER=%40sun&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=603&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27
- https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=606&CENTER=500%40699&EPHEM_TYPE=VECTORS&REF_SYSTEM=ICRF&REF_PLANE=FRAME&TIME_TYPE=TDB&OUT_UNITS=KM-S&VEC_TABLE=2&START_TIME=2026-11-01&STOP_TIME=2027-03-31&STEP_SIZE=%2730+m%27

## Fixtures: old (`57e4cba`) and new

| Fixture | Old bytes | Old SHA-256 | New bytes | New SHA-256 |
|---|---:|---|---:|---|
| `src/v2/data/horizons-inner-system-rolling.json` | 120380 | `d731a7ec326100be803a876f27f6805baffc10316ccf1a05294a082e69661ce4` | 200060 | `686aa629b7ab62b5b5db5fd04cbb25d2019897bb72d32f3164729b43db5c63a8` |
| `src/v2/data/horizons-jupiter-system-rolling.json` | 778272 | `62c1f4693d0b7d992be81564838143e0e898357a101190bc1de035cccc006f45` | 1295812 | `31793c57a1d8ebcba91d2dfbb2719123cde251c55da18adfed2cee55962448b2` |
| `src/v2/data/horizons-mars-system-rolling.json` | 1477959 | `d199bfea58b1747e7251e54d222d05d55d8762e787f09e9bb324f94b01423a26` | 2463346 | `406534ce0c09b8c8e28440a66233e01e7bfb2ac13f68601ce5b8533ffc65d174` |
| `src/v2/data/horizons-saturn-system-rolling.json` | 1846748 | `58aab9cb94451d44882a2178d260e148de53b282405686b4a3b3a901856f3cae` | 3074744 | `679aa36e6493536665fd835e979d98e974895a5067cbb68472493270aabc3b81` |
| Combined | 4223359 | | 7033962 | |

Per-series check of the new fixtures against the old ones (rows, cadence in minutes, endpoints,
center, and origin; size ratio is new / (old x 151/91)):

```text
inner: 120380 -> 200060 B (expected ~199751, ratio 1.0015) sha256 686aa629b7ab62b5b5db5fd04cbb25d2019897bb72d32f3164729b43db5c63a8
  sun: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  mercury: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  venus: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  earth: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  moon: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  mars: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
jupiter: 778272 -> 1295812 B (expected ~1291418, ratio 1.0034) sha256 31793c57a1d8ebcba91d2dfbb2719123cde251c55da18adfed2cee55962448b2
  jupiter: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  io: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
  europa: 721 -> 1201 rows (exp 1201), step 180 min (old 180), 2461345.5..2461495.5 OK
  ganymede: 361 -> 601 rows (exp 601), step 360 min (old 360), 2461345.5..2461495.5 OK
  callisto: 181 -> 301 rows (exp 301), step 720 min (old 720), 2461345.5..2461495.5 OK
mars: 1477959 -> 2463346 B (expected ~2452437, ratio 1.0044) sha256 406534ce0c09b8c8e28440a66233e01e7bfb2ac13f68601ce5b8533ffc65d174
  mars: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  phobos: 4321 -> 7201 rows (exp 7201), step 30 min (old 30), 2461345.5..2461495.5 OK
  deimos: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
saturn: 1846748 -> 3074744 B (expected ~3064384, ratio 1.0034) sha256 679aa36e6493536665fd835e979d98e974895a5067cbb68472493270aabc3b81
  saturn: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  titan: 181 -> 301 rows (exp 301), step 720 min (old 720), 2461345.5..2461495.5 OK
  rhea: 721 -> 1201 rows (exp 1201), step 180 min (old 180), 2461345.5..2461495.5 OK
  iapetus: 91 -> 151 rows (exp 151), step 1440 min (old 1440), 2461345.5..2461495.5 OK
  tethys: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
  dione: 721 -> 1201 rows (exp 1201), step 180 min (old 180), 2461345.5..2461495.5 OK
  mimas: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
  enceladus: 2161 -> 3601 rows (exp 3601), step 60 min (old 60), 2461345.5..2461495.5 OK
RESULT: all OK
```

## Test pins updated with the data

`tests/v2-ephemeris-hud.test.mjs`: coverage start `2026-07-18` -> `2026-11-01` (1 literal),
coverage end `2026-10-16` -> `2027-03-31` (5 literals). The `*-90d` fixtures under
`tests/fixtures/v2/` were not touched.
