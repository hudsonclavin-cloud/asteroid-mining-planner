---
PROVENANCE (added 2026-08-04 — not part of the Perplexity answer)
Query: [P2 — Earth orientation, texture alignment, site rendering]
Prompt source: [tools/slice21-research/literature/PERPLEXITY_PRERESEARCH_LIVING_SKY.md, P2]
Fired: [2026-08-02] · standard Perplexity
Recovered from Perplexity thread history: 2026-08-04
  (transcript-side copy was lost — environment stored a pointer, not content)
Status: LEADS, not facts. verify-before-lock before any DEC / invariant /
  founding-doc use. Contradictions between follow-up levels are findings — log,
  don't resolve.
--- RAW PERPLEXITY ANSWER BELOW ---

For a browser-based, visualization-grade Earth, the clean model chain is: use **WGS84** geodetic coordinates for sites, convert to ECEF on the oblate ellipsoid, then rotate ECEF into inertial with an Earth-orientation model built around Earth Rotation Angle (ERA) and a precession-nutation model of date; for a viewer, the CIO/ERA chain is the modern primary formulation, while GMST is acceptable mainly when you stay in the equinox-based legacy formulation or need compatibility with older code/data products. If your goal is “looks right now” in a Three.js scene rather than geodesy-grade reduction, an IAU 2006/2000A-or-B style orientation with UTC converted to UT1 as available, but possibly omitting EOP corrections, is usually enough; the dominant visible errors from omitting UT1−UTC are longitudinal texture/site shifts, while omitting polar motion adds only meter-scale to low-tens-of-meters surface displacement.[1][2][3][4]

## Earth orientation The authoritative modern chain is the IERS/IERS Conventions form \[ \mathrm{GCRS}=Q(t)\,R(t)\,W(t)\,\mathrm{ITRS}, \] where \(Q(t)\) is precession-nutation / celestial pole motion, \(R(t)=R_3(-\mathrm{ERA})\) is Earth spin about the CIP, and \(W(t)\) is polar motion. IERS Technical Note 36 states explicitly that ERA is the angle between the CIO and TIO on the CIP equator, and gives the conventional linear UT1 relation \(\mathrm{ERA}=2\pi(0.7790572732640+1.00273781191135448\,T_u)\), with \(T_u\) in UT1 days from JD 2451545.0.[2][3] ERA is the better primitive when your internal chain is CIO/CIP-based, because it cleanly separates Earth spin from precession-nutation and is the formulation the IAU 2000/2006 system was designed around. GMST is still legitimate, but it is a derived equinox-based quantity: IERS says Greenwich sidereal quantities relate to ERA through the equation of the origins, and the polynomial part of that relation gives the IAU 2006 GMST expression. For a new engine, that means: use ERA if you are building the transform yourself; use GMST mostly for legacy equinox pipelines, TEME-adjacent interoperability, or when matching older astronomy references.[3][5][2] For precession-nutation, the formal recommendation is IAU 2006 precession with IAU 2000A nutation for high precision, or IAU 2000B where 1 mas-class nutation is enough. IERS notes IAU 2000A is for users needing about 0.2 mas level, while IAU 2000B is for users needing about 1 mas level. For a viewer, that means a pragmatic hierarchy: best is IAU 2006/2000A; next is IAU 2006/2000B; a simpler “mean obliquity + precession of date + Earth spin” model will still look visually correct at globe scale, but it will not be frame-rigorous if you also care about inertial overlays and long-horizon consistency.[2]

## Viewer-grade simplification If you do not want the full IAU 2006/2000A stack in-browser, the viewer-grade simplification is: precess the Earth pole from J2000 to date, apply mean obliquity of date, rotate by ERA or GMST-equivalent spin, and skip nutation/polar motion unless you are co-rendering precise spacecraft geometry or ground tracks. That is adequate because the user-visible failure mode in a globe viewer is usually not pole modeling but wrong UT1 handling, wrong texture prime-meridian convention, or using a spherical instead of ellipsoidal Earth for site placement.[1][2][3] Ignoring EOP breaks into two very different error scales. Polar motion is typically only a few tenths of an arcsecond, so the surface displacement is on the order of \(R_\oplus \theta\), i.e. a few meters per 0.1 arcsec and roughly low-tens of meters for larger excursions; that is visually negligible for most web viewers.
[2] By contrast, ignoring UT1−UTC shifts the whole Earth in longitude by Earth spin rate times time error, so 1 second of UT1 error corresponds to about 15 arcseconds, which at the equator is about 465 m; 0.1 s is about 46.5 m, and the worst-case civil bound from leap-second practice, \(|\mathrm{UT1}-\mathrm{UTC}|<0.9\) s, implies about 418 m at the equator.
[3] Those are third-party-derived surface-distance conversions from the official angular/time definitions; the official-published number in the standard is the linear ERA-UT1 relation, not the meter conversion itself.
[3] Nutation-scale angular effects are much smaller in viewer terms. IERS states IAU 2000B is about 1 mas level, and 1 mas on Earth’s surface is roughly 3 cm; even 0.2 mas is millimetric. So if your only question is “will named sites visibly stick to the right place on the globe texture,” nutation fidelity is not the limiting factor; UT1 handling and seam/alignment conventions are.[2][3]

## Surface placement Use WGS84 geodetic latitude \(\phi\), longitude \(\lambda\), ellipsoidal height \(h\), semi-major axis \(a\), and first eccentricity squared \(e^2\), with prime-vertical radius \[ N(\phi)=\frac{a}{\sqrt{1-e^2\sin^2\phi}}. \] Then compute ECEF as \[ x=(N+h)\cos\phi\cos\lambda,\quad y=(N+h)\cos\phi\sin\lambda,\quad z=(N(1-e^2)+h)\sin\phi. \] This is the standard WGS84 ellipsoidal chain from the NGA/NIMA WGS84 definition.[1] That flattening term is visually significant for true site placement and horizon geometry, even if it is subtle in a rendered globe. WGS84’s semi-major axis is 6,378,137 m and flattening is approximately \(1/298.257223563\), so the equatorial-polar radius difference is about 21.4 km; that is official-published from WGS84 parameters plus a straightforward subtraction. For a surface marker system, using a sphere instead of the ellipsoid can bias geocentric position by kilometers at mid/high latitudes, even though the marker may still “look close” on a planet-sized mesh.[1] From there, rotate ECEF/ITRS into inertial using your Earth orientation matrix of date. In practice for rendering, many engines treat “ECEF-like fixed Earth” as the native world frame and only compute inertial transforms for spacecraft trajectories; that is fine, but then your Earth texture, atmosphere, and site markers must all share the exact same fixed-frame convention.[2][4]

## Texture conventions The most common texture bug is a 180 degree or seam-offset longitude mistake, not a bad astronomy model. In an equirectangular map, the horizontal axis usually runs longitude from \(-180^\circ\) to \(+180^\circ\) or from \(0^\circ\) to \(360^\circ\), and the seam is usually the antimeridian; the prime meridian is then at the texture center, not at the seam. This is a convention issue, not a standard mandated by IERS or WGS84, so the number here is third-party-estimated from common engine practice rather than official-published.[1] Engine axis conventions then stack on top of that. In many real-time engines, a sphere UV seam lies on the mesh’s local \(-X\) or \(+Z\) great circle depending on generator, while the “north pole” may be \(+Y\) in engine space; if you map lon/lat directly assuming seam = Greenwich, you will shift every site by 180 degrees or rotate east/west. This is third-party-estimated implementation guidance rather than official-published coordinate law. A robust rule is: first define your mathematical Earth-fixed axes explicitly, for example \(+Z\) through the ITRS north pole, \(+X\) through lat \(0^\circ\), lon \(0^\circ\), \(+Y\) through lat \(0^\circ\), lon \(90^\circ E\); then make the mesh and texture conform to that frame by a single audited constant rotation.[2][1] If you use Three.js with a standard sphere geometry, treat the UV layout as an art asset convention and verify with three test points: \((0^\circ,0^\circ)\), \((0^\circ,90^\circ E)\), and \((90^\circ N,\text{any})\). This number-free recommendation is third-party-estimated, but it is the fastest way to catch seam and handedness mistakes before layering Earth orientation on top. No official standard specifies Three.js UV seam placement.[1]

## Engines compared CesiumJS is the clearest documented case. Its `Transforms.computeIcrfToFixedMatrix` and inverse are documented as Earth-fixed \( \leftrightarrow \) ICRF/GCRF transforms, and the docs state the source is IAU 2006 XYS data for the transformation; that indicates a modern precession-nutation-based chain rather than a simple GMST spin. The docs do not state a simple end-user “meters on surface” accuracy claim on that page, so the orientation-model accuracy is documented by method and source, not by a published app-level surface error budget.[4][6] Celestia is much harder to source authoritatively from the retrieved material here. I did not obtain a primary Celestia technical source in this pass that states its exact Earth orientation chain or accuracy claim, so I cannot responsibly assert more than that Celestia historically exposes sidereal/planet orientation concepts and is not usually presented as a geodetic-accuracy Earth-reduction tool. That statement is conservative and source-limited; no additional claim here is made without primary documentation.[5] NASA Eyes material retrieved here describes real-time Earth and mission visualization, but not a primary technical note detailing its Earth orientation reduction chain. NASA’s public “Eyes on the Earth” pages describe it as a 3D real-time visualization tool for missions and Earth science, but I did not retrieve a primary technical accuracy statement for ERA/GMST/EOP handling in this pass. So for NASA Eyes, the responsible answer is: it is a visualization product, but from the sources retrieved here I cannot cite a formal published Earth-orientation algorithm or meter-level claim.[7][8][9]

## Coordinate sources For Earth launch and landing sites, use official operator or agency geodesy pages where available, or authoritative mission documentation; there is no single universal “all launchpads” standard source in the retrieved set. For NASA Deep Space Network stations, NASA’s DSN site is authoritative for the three complexes, while precise antenna reference coordinates are generally published in DSN or geodetic operational documents beyond the high-level page retrieved here. For lunar landing and impact sites, NASA HQ’s Apollo landing-site coordinate table is an official NASA source for Apollo sites, and the LROC 2016 coordinate compilation is a strong authoritative scientific source for crewed and robotic lunar surface hardware with quoted uncertainties, typically around ±15 m network-scale context and site-specific tabulated uncertainties from sub-meter to tens of meters.[10][11][12] The strongest source list from the retrieved material is:
- WGS84 Earth figure and geodetic formulas: NIMA/NGA TR8350.2.[1]
- Earth orientation and ERA/GMST/CIO/TIO chain: IERS Technical Note 36 and IAU resolutions summary.[2][3]
- DSN complexes: NASA DSN official page.[10]
- Apollo landing sites: NASA HQ Apollo Lunar Surface Journal coordinate table.[11]
- Broader lunar landed hardware coordinates, with uncertainties: LROC / Wagner et al. 2016.[12]

## Level 1

### 1) Should Aster use ERA/CIO internally, or GMST/equinox, for Earth rotation? Why this matters for the tool: this choice determines whether your Earth frame stays cleanly compatible with modern inertial transforms and future high-accuracy overlays.[2][3] Use ERA/CIO internally. The IAU 2000/2006 framework and IERS Conventions are built around CIP + CIO/TIO + ERA, and GMST is treated as a derived equinox-based quantity retained for conventional continuity. Official-published numbers: ERA uses the official linear UT1 relation \(2\pi(0.7790572732640 + 1.00273781191135448\,T_u)\). Third-party-estimated design implication: using ERA now reduces future pain if you later add Moon/planet inertial overlays, DSN look angles, or SPICE-driven spacecraft states.[3][2]

### 2) Is it worth carrying UT1 and polar motion in a browser viewer? Why this matters for the tool: this decides whether you need live EOP ingestion infrastructure or can ship a simpler UTC-based globe.[2][3] Yes for UT1, usually no for polar motion, if your promise is “accurate Earth now.” Official-published number: \(|\mathrm{UT1}-\mathrm{UTC}|<0.9\) s by civil-time convention.
[3] Third-party-estimated surface effect from that official bound: up to about 418 m at the equator; 0.1 s is about 46.5 m; polar motion is generally only meter-to-tens-of-meters class on the surface, so often not worth runtime complexity for a browser viewer. [3][2]

### 3) Should surface sites be stored/rendered geodetically on WGS84, or can a sphere/geocentric lat-lon suffice? Why this matters for the tool: this controls whether launch pads, landing sites, and DSN stations are self-consistent with real coordinates and with any future line-of-sight analysis.[1] Use WGS84 geodetic storage and ellipsoidal ECEF conversion. Official-published numbers: WGS84 semi-major axis is 6,378,137 m and the official flattening is about \(1/298.257223563\). Third-party-estimated significance: the equator-to-pole radius difference is about 21.4 km, large enough that spherical shortcuts can move sites by kilometers in Cartesian space, even if the error is visually subtle on a textured globe.[1]

## Level 2

### 1) If ERA/CIO is internal, do you need full IAU 2006/2000A, or is a lighter model enough? Why this matters for the tool: this is the main complexity/performance trade between “browser-simple” and “future-rigorous.”[2][4] For a viewer-first mission planner, a lighter model is enough if you keep the architecture ERA/CIO-shaped. Official-published numbers: IAU 2000A is for about 0.2 mas needs and IAU 2000B for about 1 mas needs. Third-party-estimated design conclusion: choose an IAU 2006 precession + reduced nutation approach now, but preserve a pluggable interface for full XYS/EOP later; the user-visible benefit of 2000A over 2000B is negligible compared with seam or UT1 mistakes.[6][2]

### 2) If UT1 matters, how should a browser app obtain it? Why this matters for the tool: this determines whether “current Earth” is reproducible offline and whether you need network dependencies.[2][3] Best design: ship a cached UT1−UTC value table or periodically refresh from IERS-derived data, then fall back gracefully to UTC when stale. Official-published number: the civil bound keeps \(|\mathrm{UT1}-\mathrm{UTC}|<0.9\) s.
[3] Third-party-estimated decision rule: if stale/no UT1 data, you can still render, but disclose “Earth rotation may be off by up to ~0.4 km at equator” rather than silently presenting it as exact. [3]

### 3) If sites are geodetic, should the Earth render mesh itself be ellipsoidal? Why this matters for the tool: it affects globe shaders, atmosphere shells, ray intersections, and whether visual geometry matches coordinate math.[1] Usually yes if you already support accurate surface points; otherwise you create a silent mismatch between coordinates and rendered surface normals/horizons. Official-published numbers: WGS84 ellipsoid parameters define a non-spherical Earth with flattening about \(1/298.257223563\). Third-party-estimated design call: for a planet-scale browser viewer, an ellipsoidal mesh or ellipsoidal surface math under a nearly spherical visual mesh is preferable to pure spherical math if you expect DSN, launch azimuth, or low-altitude trajectory visuals.[1]

## Level 3

### 1) If you use a lighter ERA/CIO model now, what single upgrade path should be preserved? Why this matters for the tool: this prevents a rewrite when you later add higher-fidelity Earth-pointing or tracking products.[4][6] Preserve an interface that accepts \(Q(t)\), \(R(t)\), and \(W(t)\) separately, even if the first release simplifies \(Q\) and sets \(W=I\). Cesium’s documented ICRF/fixed transform based on IAU 2006 XYS data is a good architectural north star for that separation. Official-published number: Cesium docs explicitly reference IAU 2006 XYS data, though they do not publish a single app-level meter claim on that page.[6][4]

### 2) If the Earth mesh becomes ellipsoidal, what is the minimum consistency rule for sites and texture? Why this matters for the tool: without one fixed convention, “correct” coordinates still produce visibly wrong landmarks and pads.[1][2] Define one canonical Earth-fixed frame and audit all assets against three truth points before shipping: Greenwich equator, 90°E equator, and north pole. Official-published numbers in play are the geodetic axes implied by WGS84 and the Earth-orientation frame definitions in IERS. Third-party-estimated rule: keep texture alignment as a single constant asset rotation on top of the mathematical Earth, never bury that offset inside site coordinates or time rotation.[2][1]

## LOAD-BEARING NUMBERS
- 0.7790572732640 — official-published ERA constant in the IAU/IERS ERA formula.[2][3]
- 1.00273781191135448 — official-published UT1 day multiplier in the IAU/IERS ERA formula.[3][2]
- JD 2451545.0 UT1 — official-published ERA reference epoch.[2][3]
- JD 2451545.0 TT / J2000.0 at 2000 Jan 1.5 TT — official-published time reference for precession-nutation arguments in IERS TN36.[2]
- 0.2 mas — official-published accuracy class for IAU 2000A usage in IERS TN36.[2]
- 1 mas — official-published accuracy class for IAU 2000B usage in IERS TN36.[2]
- 2 days — official-published CIP frequency split threshold between celestial and terrestrial motion in IERS TN36.[2]
- \(|\mathrm{UT1}-\mathrm{UTC}|<0.9\) s — official-published civil-time bound referenced by UT1/UTC practice. [3]
- About 465 m per 1 s UT1 error at equator — third-party-estimated from official Earth rotation rate / ERA relation.[3]
- About 46.5 m per 0.1 s UT1 error at equator — third-party-estimated from official Earth rotation rate / ERA relation.[3]
- About 418 m for 0.9 s UT1 error at equator — third-party-estimated from official UT1 civil bound.[3]
- A few meters per 0.1 arcsec polar-motion-like tilt at surface — third-party-estimated from Earth radius times angle.[2]
- Low-tens of meters for several-tenths-arcsecond polar motion — third-party-estimated from Earth radius times angle.[2]
- WGS84 semi-major axis 6,378,137 m — official-published.[1]
- WGS84 flattening \(1/298.257223563\) — official-published WGS84 defining value.[1]
- About 21.4 km equatorial-minus-polar radius difference — third-party-estimated from official WGS84 ellipsoid parameters.[1]
- EGM96 geoid absolute accuracy 1.0 m or better — official-published in TR8350.2 executive summary.[1]
- WGS84 frame refinements negligible at less than 30 cm for mapping/charting/enroute navigation — official-published in TR8350.2 executive summary.[1]
- DSN 70 m antenna diameter — official-published on NASA DSN page.[10]
- DSN 26 m antenna diameter — official-published on NASA DSN page.[10]
- DSN 34 m antenna diameter — official-published on NASA DSN page.[10]
- DSN Now updates every 5 seconds — official-published on NASA DSN page.[10]
- LROC lunar network coordinate uncertainty about ±15 m — official-published on LROC page summarizing the coordinate effort.[12]
- Apollo 11 LM latitude 0.67416°, longitude 23.47314° — official-published on LROC coordinate table.[12]
- Apollo 11 LM uncertainty 0.3 m — official-published on LROC coordinate table.[12]
- Apollo 15 LM latitude 26.13239°, longitude 3.63330° — official-published on LROC coordinate table.[12]
- Apollo 15 LM uncertainty 1.0 m — official-published on LROC coordinate table.[12]
- Apollo 17 LM latitude 20.1911°, longitude 30.7723° — official-published on LROC coordinate table.[12]
- Apollo 17 LM uncertainty 3.5 m — official-published on LROC coordinate table.[12] Would you like a second pass that turns this into an implementation spec for Aster, with exact TypeScript function signatures and a recommended “fast / accurate / exact” mode split?

Sources
[1] NIMA TR8350.2 WGS84FIN.pdf https://gis-lab.info/docs/nima-tr8350.2-wgs84fin.pdf
[2] 5 Transformation between the International Terrestrial Refer https://www.iers.org/fileadmin/SharedDocs/Publikationen/EN/IERS/Publications/tn/TechnNote36/tn36_043.pdf
[3] The IAU Resolutions on Astronomical Reference Systems ... https://aa.usno.navy.mil/downloads/Circular_179.pdf
[4] Transforms
- Cesium Documentation https://cesium.com/learn/ion-sdk/ref-doc/Transforms.html
[5] Sidereal time https://en.wikipedia.org/wiki/Sidereal_time
[6] Transforms
- Cesium Documentation https://cesium.com/downloads/cesiumjs/releases/b18/Documentation/Transforms.html
[7] Eyes on the Earth https://eyes.nasa.gov/apps/earth
[8] Tutorial: NASA's Eyes on the Earth on climate.nasa.gov https://www.youtube.com/watch?v=p-6DusnZ1pQ
[9] NASA's Eyes on the Earth Puts the World at Your Fingertips https://www.jpl.nasa.gov/news/nasas-eyes-on-the-earth-puts-the-world-at-your-fingertips/
[10] Deep Space Network https://www.nasa.gov/communicating-with-missions/dsn/
[11] Lunar Landing Site Coordinates · The Apollo 15 Learning Hub https://apollo15hub.org/items/show/190
[12] Spacecraft Related Coordinates
- 2016 Update https://lroc.im-ldi.com/images/938
[13] Glossary https://iers-conventions.obspm.fr/content/iccgl.pdf
[14] Accuracy of ECI (J2000) to ECEF (WGS84) for a LEO ... https://space.stackexchange.com/questions/32146/accuracy-of-eci-j2000-to-ecef-wgs84-for-a-leo-satellite-only-accounting-for
[15] Coordinates and Maps of the Apollo 17 Landing Site https://elib.dlr.de/131963/1/Haase_et_al-2019-Earth_and_Space_Science.pdf
[16] The astronomical reference systems in the framework of ... https://philippelefloch.org/wp-content/uploads/2010/12/2010-december-nicole-capitaine.pdf
[17] Accurate Conversion of Earth-Fixed Earth-Centered ... https://hal.science/hal-01704943v2/document [18] using utc to determine the earth's rotation angle http://hanksville.org/futureofutc/2011/preprints/13_AAS_11-666_McCarthy.pdf
[19] World Geodetic System
- Wikipedia https://en.wikipedia.org/wiki/World_Geodetic_System
[20] THE IAU 2000A AND IAU 2006 PRECESSION-NUTATION ... https://www.agi.com/getmedia/c85a440a-cf71-4e08-ad78-fa73736cee6c/Precession-nutation-Theories-and-their-Implementation.pdf?ext=.pdf
[21] HTDP User Guide (Software Version 3.3.0) https://filelib.wildlife.ca.gov/Public/R3_BDR/apps/python_geo_processing/R3GIS_htdp-generate-grids/HTDP/HTDP_3-3-0/doc/HTDP-user-guide.pdf
[22] Transforms
- Cesium Documentation https://cesium.com/downloads/cesiumjs/releases/b29/Documentation/Transforms.html
[23] ICRF-to-Fixed reference frame transformation returns ... https://groups.google.com/g/cesium-dev/c/e7ykLN18Yjs
[24] 1. The current Earth orientation parameters https://syrte.obspm.fr/iau/iauWGT5/N4/node1.html
[25] Transformation between Celestial and Terrestrial Frames https://gssc.esa.int/navipedia/index.php/Transformation_between_Celestial_and_Terrestrial_Frames
[26] One way to celebrate #EarthDay is to learn about the ... https://www.facebook.com/NASAJPL/videos/how-to-use-nasas-3d-visualization-tool-eyes-on-the-earth/407038247516432/
[27] Transforms
- Cesium Documentation http://osgl.grf.bg.ac.rs/cesium/Build/Documentation/Transforms.html
[28] NASA i Reference ! Publication 1 204 https://ntrs.nasa.gov/api/citations/19890001049/downloads/19890001049.pdf
[29] Displaying the Earth's Rotation
- CesiumJS https://community.cesium.com/t/displaying-the-earths-rotation/55
[30] Forced precession and nutation of Earth https://farside.ph.utexas.edu/teaching/celestial/Celestial/node74.html
