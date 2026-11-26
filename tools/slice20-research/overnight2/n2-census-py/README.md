# N2 independent Python census

`independent_census.py` imports only Python standard-library modules, NumPy, Astropy units, and poliastro's `izzo.lambert`. It does not import Aster's compiled build or run-1 code. It implements Kepler propagation, Earth cubic Hermite interpolation, grid construction, Sun-grazing refusal, the Earth-interface screen, and minimum asteroid-departure selection independently.

The separate `aster-validation-bridge.mjs` is used only to produce 20 production-state validation samples. The census compares those samples after the Python implementation has computed them. The external result is `C:\Users\hudso\s20-overnight2-store\n2\summary.json`.

Source contracts read for the implementation: raw catalog element names and epoch are defined at `src/v2/boundary/slice9-nea-catalog.ts:29-35`; the raw Horizons tuple is defined at `src/v2/boundary/horizons.ts:23-31`; cubic Hermite position and derivative formulas are at `src/v2/core/interpolators/hermite.ts:12-46`; the Sun GM, mean motion, Kepler solve, and frame rotations are at `src/v2/core/propagators/keplerian.ts:11-15`, `:109-134`, and `:205-240`.
