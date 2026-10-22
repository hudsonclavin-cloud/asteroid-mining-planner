REGENERATED: deterministic R8 sample from tests/fixtures/v2/nea-catalog-slice9.json; the original TEMP sample was missing.

Selection rule: sort the shipped catalog by bodyId; classify U/conditionCode as
good (0–2), moderate (3–6), poor (7–9), or unknown; allocate 10 rows as 3/2/4/1
in proportion to band sizes after one required row per band; within each band,
choose midpoint-spaced sorted positions using floor((i + 0.5) × bandSize / sampleSize).
MPC observed and match are intentionally blank for Hudson/Clome read-only completion.

| bodyId | designation | Aster band | conditionCode (U) | dataArcDays | nObsUsed | sigmaA | sigmaE | qualityRank | MPC observed | match |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| asteroid-2008 GS3 | 2008 GS3 | good (U 0–2, ours) | 1 | 5497 | 92 | 2.234e-9 | 8.8966e-7 | 0.933333 |  |  |
| asteroid-2018 RC2 | 2018 RC2 | good (U 0–2, ours) | 0 | 2374 | 380 | 3.9409e-8 | 1.3119e-7 | 1 |  |  |
| asteroid-474163 | 474163 | good (U 0–2, ours) | 0 | 9504 | 351 | 2.1658e-9 | 3.4233e-8 | 1 |  |  |
| asteroid-2017 OO1 | 2017 OO1 | moderate (U 3–6, ours) | 4 | 9 | 101 | 1.9969e-6 | 4.4638e-6 | 0.466647 |  |  |
| asteroid-2023 XX13 | 2023 XX13 | moderate (U 3–6, ours) | 5 | 53 | 24 | 7.5965e-5 | 1.9651e-5 | 0.497619 |  |  |
| asteroid-2012 EZ1 | 2012 EZ1 | poor (U 7–9, JPL threshold) | 8 | 1 | 13 | 7.1794e-3 | 1.606e-3 | 0.106798 |  |  |
| asteroid-2019 GK | 2019 GK | poor (U 7–9, JPL threshold) | 7 | 24 | 46 | 1.5681e-3 | 3.9861e-4 | 0.319698 |  |  |
| asteroid-2022 LF3 | 2022 LF3 | poor (U 7–9, JPL threshold) | 7 | 10 | 16 | 3.5039e-4 | 1.0089e-3 | 0.272166 |  |  |
| asteroid-2025 DP2 | 2025 DP2 | poor (U 7–9, JPL threshold) | 7 | 6 | 36 | 5.8961e-4 | 2.3239e-4 | 0.245997 |  |  |
| asteroid-34D | 34D | unknown (U missing) |  | 47 |  |  |  | 0 |  |  |
