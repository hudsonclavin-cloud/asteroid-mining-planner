# Slice 5 Saturn Ring Substructure Research Report

## Methodology

- Primary source: NASA PDS Ring-Moon Systems Node, "Vital Statistics for Saturn's Rings"
- Additional provenance: NASA Cassini imaging archive, Cassini Division survey literature, Iess et al. 2019 for system-mass continuity with the Slice 4 ring contract
- This dispatch does not run a Horizons fetch and does not measure interpolation error
- Ring substructure is static structural geometry: inner and outer radii are published truth data, not time-series samples
- Output artifacts:
  - `tools/slice5-research/ring-substructure.json`
  - `tools/slice5-research/research-report.md`

## Cassini Division Substructure

| Feature | Inner km | Outer km | Width km | Visual significance | In Slice 5 |
| --- | ---: | ---: | ---: | ---: | --- |
| Huygens Gap | 117500 | 117930 | 430 | 2 | yes |
| Huygens Ringlet | 117806 | 117824 | 18 | 3 | yes |
| Herschel Gap | 118188 | 118284 | 96 | 4 | no |
| Herschel Ringlet | 118234 | 118263 | 29 | 4 | no |
| Russell Gap | 118590 | 118628 | 38 | 4 | no |
| Jeffreys Gap | 118930 | 118967 | 37 | 4 | no |
| Kuiper Gap | 119402 | 119406 | 4 | 5 | no |
| Laplace Gap | 119845 | 120086 | 241 | 3 | yes |
| Laplace Ringlet | 120037 | 120078 | 41 | 3 | yes |
| Bessel Gap | 120231 | 120244 | 13 | 4 | no |
| Barnard Gap | 120304 | 120316 | 12 | 4 | no |

## A-Ring Gaps

| Feature | Inner km | Outer km | Width km | Visual significance | In Slice 5 |
| --- | ---: | ---: | ---: | ---: | --- |
| Encke Gap | 133423 | 133745 | 322 | 2 | yes |
| Keeler Gap | 136487 | 136522 | 35 | 4 | yes |

## Roche Division

| Feature | Inner km | Outer km | Width km | Visual significance | Note |
| --- | ---: | ---: | ---: | ---: | --- |
| Roche Division | 136770 | 139380 | 2610 | 2 | Tenuous outer-edge transition between the A ring and the out-of-scope F ring |

## Slice 5 Scope Summary

Rendered in Slice 5:
- `Huygens Gap`: significance 2 and wide enough to change the visible structure of the Cassini Division beyond a single dark band.
- `Huygens Ringlet`: significance 3 and necessary so the Huygens Gap does not render as an unrealistically empty hole.
- `Laplace Gap`: significance 3 and broad enough to add a second visible subdivision inside the Cassini Division.
- `Laplace Ringlet`: significance 3 and visually coupled to the Laplace Gap, giving the gap internal structure rather than a flat cutout.
- `Encke Gap`: significance 2 and already familiar from telescopic and spacecraft imagery as a major A-ring interruption.
- `Keeler Gap`: significance 4 but visually distinctive because the gap is narrow, sharp, and strongly associated with Daphnis-driven edge structure.
- `Roche Division`: significance 2 and useful as the visual fade-out beyond the main A ring even though the F ring remains out of scope.

Deferred to polish:
- `Herschel Gap`: significance 4 and too fine to justify another dedicated mesh in Slice 5's first substructure pass.
- `Herschel Ringlet`: significance 4 and dependent on a narrower Cassini-division polish pass than Slice 5 needs.
- `Russell Gap`: significance 4 and structurally real, but too narrow for the first visible-substructure cut.
- `Jeffreys Gap`: significance 4 and similar in architectural cost to Russell Gap without comparable visible payoff.
- `Kuiper Gap`: significance 5 and effectively Cassini-only at this scale.
- `Bessel Gap`: significance 4 and too narrow for the first-pass renderer extension.
- `Barnard Gap`: significance 4 and too narrow for the first-pass renderer extension.

## Implementation Hints For Renderer

Option B pattern for Slice 5:
- Each feature renders as a separate Three.js `RingGeometry` mesh under the existing `saturnRingsGroup`.
- Each mesh gets its own material with opacity and color tuned to the feature type rather than reusing one flat-alpha annulus.
- Gap features render as transparent or near-transparent annuli that punch through the existing C/B/A density gradient.
- Ringlet features (`Huygens Ringlet`, `Laplace Ringlet`) render as slightly brighter narrow annuli nested inside their parent gaps.
- `Encke Gap` and `Keeler Gap` render as narrow transparent annuli inside the A ring.
- `Roche Division` renders as the visual outer-edge transition beyond the main A ring; because exact PDS values are locked, use the `136770 km` inner edge from the structured data and fade toward `139380 km`. The F ring at the outer Roche Division edge remains out of Slice 5 scope.

## Notes / Source Provenance

- Structured dataset: `tools/slice5-research/ring-substructure.json`
- Primary source: PDS Ring-Moon Systems Node — `https://pds-rings.seti.org/saturn/saturn_rings_table.html`
- Additional sources retained for provenance continuity:
  - NASA Cassini imaging archive
  - Cassini Division survey paper (peer-reviewed Icarus/Science source family)
  - Iess et al. 2019, *Science* 364, doi:`10.1126/science.aat2965`
- Ring radii here are static structural truth data. No Horizons request, cadence selection, or interpolation experiment is needed for this Slice 5 pre-research pass.
