# ON3 — Indexed Earth lookup

## Method

The production lookup is the linear scan in `src/v2/boundary/horizons.ts`, with the Earth fixture access path used by the production porkchop route. The benchmark's indexed implementation preserves the production behavior: exact-node lookup returns that node, otherwise the same strict bracket is selected and the same cubic Hermite evaluator is called; the same `INV-008` bounds refusal is retained at both ends.

The identity run covered every one of the 5,479 fixture nodes, every midpoint, node ±1e-6 day, both endpoints, and 1,000,000 seeded in-span epochs (`20261125`). The timing run used five warm repetitions and reports the median. The return grid used 20 seeded bodies, 200 × 100 cells, and M=0 plus M=1; Earth-arrival refusals were skipped in the Lambert portion. An outbound production-shaped grid over the same body set is included for reference.

## Results

- Identity cases: `1,021,915`; nonzero six-component differences: `0`; maximum absolute difference: `0`.
- The two endpoint-outside probes and the two ±1e-6-day outside probes produced the same `AssertError` and the exact message `INV-008: Requested interpolation time is outside available sample range for body 'earth'` from both implementations.
- One million lookup timing medians: linear `15446.9672` ms, indexed `366.8613999999943` ms, a `42.105730393004656x` per-call speed-up.
- Return grid (400,000 cells × 2 families): linear `12.605558099999994` s, indexed `0.2045069000000076` s, speed-up `61.63879116058933x`.
- Outbound reference grid: linear `13.093658299999996` s, indexed `0.14941570000001228` s, speed-up `87.63241279195506x`.

## REPORT section text

ON3 INDEX: nonzero differences **0 of 1,021,915**; speed-up per call **42.105730393004656x**; return grid 200x100 linear/index **12.605558099999994/0.2045069000000076 s**. The indexed lookup was bit-identical for the measured identity cases and retained the production outside-span error behavior.
