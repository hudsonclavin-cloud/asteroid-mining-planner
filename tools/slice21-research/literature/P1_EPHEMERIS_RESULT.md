---
PROVENANCE (added 2026-08-04 — not part of the Perplexity answer)
Query: [P1 — Browser-side planetary + lunar ephemeris]
Prompt source: [tools/slice21-research/literature/PERPLEXITY_PRERESEARCH_LIVING_SKY.md, P1]
Fired: [2026-08-02] · standard Perplexity
Recovered from Perplexity thread history: 2026-08-04
  (transcript-side copy was lost — environment stored a pointer, not content)
Status: LEADS, not facts. verify-before-lock before any DEC / invariant /
  founding-doc use. Contradictions between follow-up levels are findings — log,
  don't resolve.
--- RAW PERPLEXITY ANSWER BELOW ---

For a browser-based 2026–2045 ephemeris stack, the practical design split is: use an in-house re-derivation of a **compact analytic planetary model** for the 3D solar-system view, and treat the **Moon as a separate, higher-fidelity track** because “correct to the hour” is cheap for planets but quickly becomes expensive at Earth–Moon scale. If you eventually want cislunar mission work, a **JPL DE subset with interpolation** is the cleanest end-state for the Moon and likely also the long-term planetary oracle/reference path, while a VSOP/Meeus-style model is still attractive for the lightweight production renderer.[1][2][3][4]

## Option survey

### Full analytic theories **VSOP87** is the canonical published analytic planetary theory family for Mercury through Neptune, distributed as coefficient tables through the CDS/VizieR catalogue VI/81; its appeal is zero runtime data fetches, deterministic implementation, and a literature-backed closed-form series you can re-derive directly from the published tables. The trade is payload and implementation mass: the fuller variants carry large coefficient sets, and re-deriving the exact series bookkeeping, coordinate conventions, and truncation strategy is significantly more work than implementing a compact truncated algorithm.[3][5] For the Moon, **ELP2000-class theories** are the analogous full analytic route; the upside is that the full theory can be extremely accurate, but the raw series is large enough that practical browser use usually means a truncation strategy rather than a literal full implementation. A recent summary comparing truncated lunar series against JPL ephemerides reports that a truncated ELP/MPP02 series can stay within about 5 arcseconds in longitude, 1.26 arcseconds in latitude, and 2.43 km in range over 0–3000 AD, whereas much shorter Meeus-style truncations are materially worse.[6][7][8]

### Compact algorithm sets A **Meeus-style planetary/lunar implementation** is the lowest-complexity path when you want positions “good enough for display” with very small payload and code footprint. The planetary side is usually easy to keep visually convincing at solar-system scale, but the lunar side is the weak link: Meeus’s own truncated ELP-based lunar algorithm is commonly described as having about 10 arcseconds maximum geocentric longitude error, and third-party validation over roughly 50-year windows around J2000 found worst-case errors around 15–19 arcseconds in longitude and about 5 arcseconds in latitude.[8][9] That means compact algorithms are often **excellent for planets, acceptable for casual Moon rendering, and risky for cislunar design work**. In your policy model, they are attractive because the published equations are easy to re-derive in-house, the runtime cost is tiny, and the coefficient payload is effectively embedded source text rather than a large external data product.[9][8]

### JPL DE subsets with interpolation A **JPL DE table subset** stored as Chebyshev coefficients gives you the highest-confidence route for both planets and the Moon over a fixed mission horizon like 2026–2045. NAIF documents that SPK Type 2 stores position-only Chebyshev polynomials and Type 3 stores position-and-velocity Chebyshev polynomials, which is exactly the structure you would mimic if you extract only the bodies and span you need for a browser payload.[2][1] This approach shifts complexity from celestial mechanics to **offline preprocessing plus interpolation infrastructure**. In production, the browser only evaluates low-order polynomials in the correct segment, so runtime is simple; the hard part is building a legally clean, documented subset from official kernels or ASCII ephemerides, preserving time-scale semantics, and choosing segment cadence and coefficient order that hit your error budget without bloating download size.[1][2]

## Accuracy, size, complexity, licensing | Approach | Bodies | Achievable accuracy over 2026–2045 | Payload size | Re-derivation complexity | Coefficient/data licensing |
|---|---|---|---|---|---| | Full VSOP87-family analytic theory | Planets | Typically far better than needed for hour-level solar-system display; practical error depends on chosen VSOP87 variant and your truncation, but the theory is intended as a high-accuracy planetary solution rather than a rough visual approximation.[3][5] | Large coefficient tables, usually much larger than Meeus-style code-only solutions but often still smaller than carrying dense sampled states; exact size depends on chosen variant and truncation.[3] | High, because you must implement the published series structure, time powers, coordinate variants, and truncation policy correctly.[3] | The coefficients are published through CDS/VizieR; the catalogue page exposes a license field, so you need to read and preserve the specific catalogue terms for redistribution in your packaged app rather than assuming public domain.[3] |
| ELP2000/ELP-truncated analytic theory | Moon | Full theory can reach very high precision; a documented truncated ELP/MPP02 implementation is reported within 5 arcseconds in longitude, 1.26 arcseconds in latitude, and 2.43 km in range over 0–3000 AD, with older comparisons to DE405/406 around 2.4 arcseconds, 0.5 arcseconds, and 1.4 km for some truncations.[6][7] | Potentially large if you keep many terms; can be reduced aggressively by truncation.[6][7] | High to very high, because lunar analytic theory is much more intricate than planetary compact series.[6][7] | Depends on the publication/distribution source of the coefficient tables; do not assume public domain without checking the exact repository or paper terms.[6] |
| Meeus-style compact series | Planets + Moon | Planets are usually visually adequate at solar-system scale; Moon is around 10 arcseconds class by book claim, with third-party tests showing roughly 15–19 arcseconds max longitude and about 5 arcseconds max latitude over about 1949.5–2051.6.[8][9] | Very small, often just code plus small embedded tables.[8] | Low, best option for in-house re-derivation from published text.[8] | The book text is copyrighted, so you can re-derive from the published theory but should not copy protected source text or derivative coefficient dumps wholesale.[8] |
| JPL DE subset + Chebyshev interpolation | Planets + Moon | Oracle-grade relative to your display needs if extracted from official DE kernels; practical error is set mainly by your subset compression choices rather than the underlying DE integration.[1][2] | Can be moderate and very tunable; browser payload depends on span, bodies, cadence, coefficient order, and whether you keep position only or position+velocity.[2] | Medium overall: low online runtime complexity, higher offline tooling complexity.[2] | Official JPL/NAIF products are distributed with specific use/distribution terms; you need to carry those terms through your subset pipeline and should verify redistribution of repackaged coefficients explicitly from the official source you choose.[2][1] |

## Time scales

### UTC, TT, TDB For solar-system ephemerides, the important rule is that **UTC is not the evaluation time scale**. SOFA documents the normal path as UTC \(\rightarrow\) TAI \(\rightarrow\) TT, and provides separate routines for TT/TDB conversion because ephemeris arguments are tied to dynamical time scales rather than civil time.[4][10] SOFA states that TT is offset from TAI by 32.184 seconds, and that converting from UTC to TT also requires the leap-second-dependent \(\Delta AT = \mathrm{TAI}-\mathrm{UTC}\). It also states the practical relation \(\Delta T = \mathrm{TT}-\mathrm{UT1} = 32.184\,\mathrm{s} + \Delta AT
- \Delta UT1\), which is useful when reasoning about Earth rotation versus inertial ephemerides.[4]

### Δ T treatment For an inertial 3D solar-system renderer, **Δ T mostly matters when you are mixing civil time, Earth rotation, or apparent topocentric quantities** rather than pure barycentric/geocentric body positions. If you convert UTC to TT correctly using leap seconds and then use a reasonable TT↔TDB approximation, your body positions will usually be far better than the display requires; if you skip time-scale conversion entirely and feed UTC-like times into a dynamical theory, you inject a timing bias of order tens of seconds, not hours.[10][4] The loss from ignoring TT ↔ TDB specifically is usually very small for display purposes, because TDB−TT is a small periodic correction and SOFA treats it as a separate fine adjustment rather than a first-order scale split. By contrast, ignoring UTC→TT leap-second handling creates a much larger fixed timing error because TT differs from UTC by 32.184 seconds plus accumulated leap seconds.[4]

### What happens if you ignore them For **planets in a solar-system view**, an error of tens of seconds is usually visually negligible over an hour-scale correctness requirement because orbital motion is slow and the rendered scene is coarse relative to sub-arcminute errors. For the **Moon at Earth–Moon scale**, the same timing sloppiness matters more because the Moon moves much faster on the sky and in space, so a tens-of-seconds clock error maps to a visibly larger along-track offset than it does for outer planets; this is one reason lunar work stops being “free” well before interplanetary work does.[6][8][1][4]

## What “correct to the hour” really demands

### Solar-system scale planets At a heliocentric 3D overview scale, “position correct to the hour” is a **very weak requirement** for Mars outward and still fairly weak for Mercury and Venus. The slow movers make hourly correctness almost trivial with compact analytic models, while Mercury is the most demanding planet only because its apparent angular and heliocentric motion are fastest among the planets you care about.[3][1] In practice, that means **planetary hourly accuracy is cheap**: Meeus-class or modest VSOP truncations are usually enough for visual truthfulness, and a DE subset is mainly justified if you want one oracle-grade path, exact reproducibility against JPL, or seamless transition from rendering into trajectory design.[8][1][3]

### Moon at Earth–Moon scale For the Moon, “correct to the hour” is a **much stronger requirement** because an hour of lunar motion is large both angularly and in kilometers. A compact truncation can still look good, but if the camera ever zooms to cislunar scale, the tolerable error drops fast enough that Meeus-class lunar positions move from “fine” to “questionable,” and an ELP truncation or DE subset becomes the safer engineering choice.[9][6][8] So the cheap bodies are **outer planets first, then Earth/Venus/Mars, then Mercury**, while the **expensive body is the Moon**. That asymmetry is the core architecture insight for Aster: do not let the Moon ride along on the same fidelity assumptions as the planetary renderer.[1][3][6]

## Recommended architecture For your stated constraints, the best staged plan is:
- **Phase 1 production renderer:** in-house compact planetary theory for all planets, with strict UTC→TT handling and a lightweight TT↔TDB approximation.[8][4]
- **Phase 1 Moon:** either a stronger lunar truncation than the basic Meeus set or an extracted DE lunar subset from the start, depending on how soon you need Earth–Moon zoom fidelity.[6][9]
- **Validation/oracle path:** official JPL DE kernels or ASCII ephemerides offline, never imported as production code, but used to generate test vectors and eventually browser-ready Chebyshev subsets.[2][1]
- **Phase 2 cislunar/interplanetary convergence:** a unified DE-subset interpolation stack for Moon + planets if you want one ephemeris truth source across rendering and mission design.[2][1]

## Follow-up chain

### Level 1.1 — Should Aster use one ephemeris stack for both rendering and mission design, or split them? Why this matters for the tool: this choice determines whether your renderer can mature into the mission-planning backbone or must later be replaced.[1][2] A split stack is the safer near-term design: use a compact analytic renderer now, but validate against and architect toward a DE-subset oracle because JPL DE products are the official high-accuracy reference and SPK/Chebyshev delivery is designed for efficient state evaluation. The numbers that support this are mostly **third-party-estimated** on the analytic side, such as Moon errors of about 10 arcseconds from Meeus-style truncation or about 15–19 arcseconds max longitude in one validation study, versus **official-published** NAIF/JPL descriptions of DE/SPK as the kernelized ephemeris standard.[9][2][8][1]

#### Level 2.1 — If split now, what interface should stay load-bearing so replacement is cheap later? Why this matters for the tool: a bad state interface locks rendering assumptions into mission logic.[2][4] The load-bearing interface should be **state-from-time in an inertial frame**, ideally returning barycentric or heliocentric position and velocity at TT/TDB-tagged epochs, not “screen-oriented orbital elements” or UTC-indexed display positions. That is aligned with NAIF’s state-vector model and lets you swap a compact analytic backend for DE/Chebyshev later without changing consumers; the key numbers here are **official-published** Type 2 position-only and Type 3 position+velocity SPK segment definitions, and **official-published** TT’s 32.184-second offset from TAI that argues for explicit time-scale tagging in the API.[4][2]

##### Level 3.1 — Should velocity be first-class in the browser ephemeris API from day one? Why this matters for the tool: porkchops, Lambert seeds, patched-conic displays, and continuity tests all get simpler if velocity is native.[2] Yes, velocity should be first-class from day one even if the first renderer only needs position, because NAIF’s own high-fidelity ephemeris structures already treat state as position+velocity and because numerical differencing of compact position models adds avoidable noise and time-step policy debt. The strongest supporting number is **official-published**: SPK Type 3 stores six coefficient sets, three for position and three for velocity, while Type 2 stores position only; that official distinction exists because velocity is operationally important, not cosmetic.[2]

### Level 1.2 — Is the Moon special enough to justify a separate pipeline immediately? Why this matters for the tool: this is the biggest fidelity trap for a cislunar-capable planner.[6][8] Yes. The lunar error spread between compact and stronger models is much larger in mission-planning terms than the planetary spread at solar-system display scale: **third-party-estimated** Meeus-class lunar longitude error is about 10 arcseconds by book claim and about 15–19 arcseconds max in one validation window, while **third-party-estimated** truncated ELP/MPP02 can be around 5 arcseconds longitude, 1.26 arcseconds latitude, and 2.43 km range over 0–3000 AD.[8][9][6]

#### Level 2.2 — For a browser Moon, is truncated ELP worth doing before DE-subset interpolation? Why this matters for the tool: it decides whether to spend engineering effort on theory implementation or on offline coefficient tooling.[6][2] If your near-term goal is a **production Moon without offline build infrastructure**, truncated ELP is worth it because it buys a clear accuracy jump while preserving your “re-derived from published theory” rule. If your medium-term goal is a single ephemeris truth source for cislunar planning, DE-subset interpolation is the more strategic investment because it eliminates the gap between oracle and production; the key numbers here are **third-party-estimated** truncated-ELP errors of 5 arcseconds, 1.26 arcseconds, and 2.43 km, versus **official-published** NAIF support for direct Chebyshev state evaluation from SPK-style data structures.[6][2]

##### Level 3.2 — What is the minimum Moon quality threshold before cislunar UI becomes misleading? Why this matters for the tool: it sets the “don’t ship below this” bar for Earth–Moon zoom views.[9][6] A practical minimum is to avoid the basic short lunar truncations once the UI is used for Earth–Moon geometry judgments rather than just pretty rendering, because **third-party-estimated** 10–19 arcseconds-class lunar longitude error and multi-kilometer range error can accumulate into visibly wrong Earth–Moon relative geometry at close zoom. A stronger truncation around the **third-party-estimated** few-arcseconds / few-kilometers class is a more credible floor until you move to DE interpolation.[8][9][6]

### Level 1.3 — How much time-scale rigor is actually required for a browser ephemeris? Why this matters for the tool: overbuilding time handling wastes effort, but underbuilding it creates silent position bias.[10][4] The required minimum is: store times internally as Julian dates, convert UTC to TT using leap seconds, and keep TT/TDB explicit at the ephemeris boundary. The key numbers are **official-published**: TT = TAI + 32.184 seconds, and \(\Delta T = \mathrm{TT}-\mathrm{UT1} = 32.184\,\mathrm{s} + \Delta AT
- \Delta UT1\); those are enough to show why using raw UTC directly in ephemeris formulas is the main error to avoid, whereas TT↔TDB approximations are secondary at display scale.[4]

#### Level 2.3 — Can Aster ignore UT1 and Earth-rotation details until topocentric observation features exist? Why this matters for the tool: it separates inertial ephemeris work from observer-on-Earth features.[10][4] Yes, for a heliocentric/geocentric inertial mission-planning view you can defer UT1-dependent Earth-rotation rigor until you add sidereal pointing, ground tracks, rise/set, or observatory-local sky views. The supporting numbers are **official-published**: leap seconds are inserted to keep UT1−UTC within ±0.9 seconds, and SOFA explicitly distinguishes UTC/UT1 from TT/TDB because they serve different physical roles.[10][4]

## LOAD-BEARING NUMBERS
- 2026–2045 mission horizon — **user-specified**, design horizon stated in the query.[11]
- 5 arcseconds lunar longitude error for truncated ELP/MPP02 over 0–3000 AD — **third-party-estimated** from published comparative summary.[6]
- 1.26 arcseconds lunar latitude error for truncated ELP/MPP02 over 0–3000 AD — **third-party-estimated**.[6]
- 2.43 km lunar range error for truncated ELP/MPP02 over 0–3000 AD — **third-party-estimated**.[6]
- 2.4 arcseconds ecliptic longitude error for one truncated ELP/MPP02 comparison against DE405/406 — **third-party-estimated**.[6]
- 0.5 arcseconds ecliptic latitude error for one truncated ELP/MPP02 comparison against DE405/406 — **third-party-estimated**.[6]
- 1.4 km distance error for one truncated ELP/MPP02 comparison against DE405/406 — **third-party-estimated**.[6]
- 38 arcminutes geocentric longitude error for Jean Meeus lunar calculations over 0 AD to 3000 BC in one summary — **third-party-estimated**.[6]
- 3 arcminutes geocentric latitude error for Jean Meeus lunar calculations over 0 AD to 3000 BC in one summary — **third-party-estimated**.[6]
- 165 km lunar distance error for Jean Meeus lunar calculations over 0 AD to 3000 BC in one summary — **third-party-estimated**.[6]
- About 10 arcseconds estimated maximum geocentric longitude error for Meeus’s truncated ELP-2000/82 lunar position — **third-party-estimated** summary of book claim.[8]
- 18.83 arcseconds max lunar longitude error over 1949.5–2000.0 in one validation table — **third-party-estimated**.[9]
- 15.35 arcseconds max lunar longitude error over 2000.0–2051.6 in one validation table — **third-party-estimated**.[9]
- 4.94 arcseconds max lunar latitude error over 1949.5–2000.0 in one validation table — **third-party-estimated**.[9]
- 5.49 arcseconds max lunar latitude error over 2000.0–2051.6 in one validation table — **third-party-estimated**.[9]
- 8.57 × \(10^{-8}\) au max lunar distance error over 1949.5–2000.0 in one validation table — **third-party-estimated**.[9]
- 7.75 × \(10^{-8}\) au max lunar distance error over 2000.0–2051.6 in one validation table — **third-party-estimated**.[9]
- \(10^{-6}\) default coefficient filter magnitude in one ELP2000 implementation note, associated with a few-kilometer Cartesian Moon error — **third-party-estimated** implementation note, not an official standards number.[7]
- 32.184 seconds for TT−TAI — **official-published** by SOFA.[4]
- ±0.9 seconds bound for UT1−UTC maintained via leap seconds — **official-published** by SOFA/IERS materials.[4]
- 1–2 ms average solar day excess over 86,400 SI seconds in the SOFA explanation of leap-second accumulation — **official-published** explanatory figure.[4]
- 18 months to a few years as the SOFA explanatory timescale for leap-second accumulation to 1 second — **official-published** explanatory figure.[4]
- 15 items/triplets in the JPL internal ephemeris-file item list referenced in DE documentation discussions — **official-published/officially-described** in JPL ephemeris format discussions linked from official materials.[12][2]
- SPK Type 2 = position-only Chebyshev, SPK Type 3 = position+velocity Chebyshev — **official-published** NAIF definitions.[2]
- Six coefficient sets per logical record for SPK Type 3 versus three for Type 2 — **official-published** NAIF definition.[2]
- 164 astronomy routines and 55 utility routines in SOFA version documented in the cited manual — **official-published** SOFA manual metadata.[4]

Sources
[1] The JPL Planetary and Lunar Ephemerides DE440 ... http://ui.adsabs.harvard.edu/abs/2021AJ....161..105P/abstract
[2] SPK Required Reading https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/spk.html
[3] Planetary Solutions VSOP87 : VI/81 http://cdsarc.u-strasbg.fr/viz-bin/cat/VI/81
[4] SOFA Time Scale and Calendar Tools https://starlink.eao.hawaii.edu/star/share/sofa/sofa_ts_c.pdf
[5] Solar Eclipse Predictions with VSOP87 and ELP2000/82 https://eclipse.gsfc.nasa.gov/help/ve82-predictions.html
[6] Lunar Position Calculation Algorithm With Truncated ELP/ ... https://jurnal.umsu.ac.id/index.php/almarshad/article/download/16616/11525
[7] The ELP2000 lunar theory — heyoka.py 7.12. ... https://bluescarni.github.io/heyoka.py/notebooks/elp2000.html
[8] Meeus: Astronomical Algorithms
- Obliquity https://www.obliquity.com/astro/meeus.html
[9] Moon position to within 10 arcsec https://www2.arnes.si/~gljsentvid10/moon3.html [10] tn36.pdf
- IERS Conventions Centre https://iers-conventions.obspm.fr/content/tn36.pdf
[11] What is the exact format of the JPL ephemeris files? https://space.stackexchange.com/questions/12506/what-is-the-exact-format-of-the-jpl-ephemeris-files
[12] TT-TDB with SPICE from ephemerides kernels as 'de440t. ... https://space.stackexchange.com/questions/60218/tt-tdb-with-spice-from-ephemerides-kernels-as-de440t-bsp
[13] How to read the JPL Ephemeris and Perform Barycentering https://asd.gsfc.nasa.gov/Craig.Markwardt/bary/
[14] JPL Planetary and Lunar Ephemerides https://ssd.jpl.nasa.gov/planets/eph_export.html
[15] C source code for JPL DE ephemerides
- Project Pluto https://www.projectpluto.com/jpl_eph.htm
[16] JPL Ephemerides | Celestia Wiki
- Fandom https://celestia.fandom.com/wiki/JPL_Ephemerides
[17] SPK Required Reading — SpiceyPy 8.0.0 documentation https://spiceypy.readthedocs.io/en/v8.0.0/spk.html
[18] Format of the JPL Ephemeris Files https://www.celestialprogramming.com/jpl-ephemeris-format/jpl-ephemeris-format.html
[19] Moon Position
- File Exchange
- MATLAB Central https://www.mathworks.com/matlabcentral/fileexchange/23475-moon-position?s_tid=FX_rc2_behav
[20] Thread: [Stellarium-pubdevel] Ephemeris from the JPL? https://sourceforge.net/p/stellarium/mailman/stellarium-pubdevel/thread/4FAB707F.5070607@imcce.fr/ [21] vsop87/vsop87.txt at master · ctdk/vsop87 https://github.com/ctdk/vsop87/blob/master/vsop87.txt
[22] Timescales · Astrometry.jl https://juliaastro.org/Astrometry/stable/SOFA/timescales/
[23] VSOP87 Multilang https://celestialprogramming.com/vsop87-multilang/index.html
[24] VSOP model https://en.wikipedia.org/wiki/VSOP_model
[25] SPK Tutorial https://pirlwww.lpl.arizona.edu/resources/guide/software/SPICE/old_tutorials/SPK_Tutorial.pdf
[26] VSOP87 Theory Equations Summary https://sourceforge.net/p/gplan/wiki/VSOP87%20Theory%20Equations%20Summary/
[27] Making an SPK File https://spiftp.esac.esa.int/workshops/2016_09_ESAC_BASIC_TRAINING/Tutorials/B11_making_an_spk.pdf
[28] International Earth Rotation and Reference System (IERS) ... https://www.bipm.org/documents/20126/270183862/1-+Stamatakos+BIPM_IERS_v4/08643617-307f-09ee-78ae-2aaa9b043eda
[29] NAIF documents https://www.gb.nrao.edu/ovlbi/spk.req
[30] What's New in SPICE
- FTP Directory Listing
- NASA https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/IDL/info/whatsnew.html
