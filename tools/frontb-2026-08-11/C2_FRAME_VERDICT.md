# C2 FRAME VERDICT — S-S17-FRONTB-BATCH-2026-08-11-A

Recon at HEAD `7a3622d` on `front-b/2026-08-11` (one B0 layout commit ahead of `352fd06`; no `src/v2` frame-path files touched by it). All paths below are under `/Users/hudsonclavin/asteroid-mining-planner/`. Strictly read-only; produced by a fresh-session recon lens, transcribed unedited by the orchestrator.

## Verdict

**(i) Frame: "Heliocentric J2000 equatorial (ICRF) axes — Horizons vectors passed through unrotated; no ecliptic rotation applied to any rendered position; scene +Z = ICRF/celestial north."**

Clause by clause:
- **"Heliocentric"** — render positions are `FRAME_HELIO_J2000_ICRF` states rebased by subtracting the focus anchor (`src/v2/app/solar-system/runtime.ts:1467-1472`); non-heliocentric native states are converted by pure translation (`runtime.ts:1170-1222` → `src/v2/core/frames/transform.ts:184-301`).
- **"J2000 equatorial (ICRF) axes"** — all four shipped fixtures declare `"frame": "ICRF/J2000"` (line 3 of each `src/v2/data/horizons-*-rolling.json` and `horizons-inner-solar-system-2026-2040.json`); ingestion tags them `FRAME_HELIO_J2000_ICRF` / planet-centered ICRF / GCRS (`src/v2/boundary/horizons.ts:270-291`, applied at 320, 342).
- **"passed through unrotated"** — the only ingestion rotation branch is gated on the frame hint containing `ECLIPTIC` (`horizons.ts:293-296`, 332-339), which `"ICRF/J2000"` does not trigger; positions get unit scaling only (`horizons.ts:321-330`).
- **"no ecliptic rotation applied to any rendered position"** — repo-wide grep for `84381` hits only the constant definition `src/v2/core/units.ts:5`; `23.4` hits only a comment in `src/v2/core/lambert/dla.ts:11`; `0.409` hits nothing. The three call sites of the obliquity all either rotate INTO ICRF or aim the camera (see hop table and §TOP_DOWN).
- **"scene +Z = ICRF/celestial north"** — canonical (x,y,z) maps component-identical to scene (x,y,z) with no swizzle (`runtime.ts:1472`), the scene and body roots carry no rotation (`runtime.ts:962`, 1020-1021), and `camera.up` is never set anywhere in `src/v2` (grep: zero `camera.up`/`up.set` hits), so THREE's default +Y up is a camera-rig convention only.

**Name consistency:** `TOP_DOWN_ECLIPTIC_NORMAL_ICRF` is **consistent and correctly named** — it is the ecliptic north direction *expressed in ICRF scene coordinates*, used solely to aim the camera; the very fact that it must rotate (0,0,1) by the obliquity before use is itself confirmation that the scene axes are equatorial ICRF, not ecliptic.

Chip-honesty footnote (does not change the label): "heliocentric" is exact for planets (fixture `center: "@sun"`, `origin: "heliocentric"`), while the Sun body itself is SSB-centered (`center: "@ssb"`, `origin: "ssb"` in the fixture, tagged heliocentric by the default branch at `horizons.ts:290`); the per-frame anchor rebase (`runtime.ts:1468-1471`) makes the on-screen origin the focus body regardless. Orientation — the chip's claim — is unaffected.

## Chain (hop table)

| # | from | to | transform | file:line |
|---|------|----|-----------|-----------|
| 1 | Horizons fixture JSON (km, km/s, JD TDB, "ICRF/J2000") | `CanonicalStateSample` (m, m/s, TDB s) | unit scaling only; ecliptic→ICRF rotation branch NOT taken (hint = "ICRF/J2000") | `src/v2/boundary/horizons.ts:309-357` (gate 332-339, rotation fn 298-307) |
| 2 | fixture frame/origin hints | canonical frame tag (`FRAME_HELIO_J2000_ICRF`, `FRAME_GCRS_EARTH`, `FRAME_{JUPITER,SATURN,MARS}_J2000_ICRF`) | string match, tag only, no coordinate change | `horizons.ts:270-291`; hints passed at 388-390 |
| 3 | fixture files | browser state series | fetch + ingest, no transform | `src/v2/app/solar-system/loader.ts:42-61` |
| 4 | state series | state at time t | per-component interpolation, no rotation (grep of `src/v2/core/interpolators` finds none) | `runtime.ts:1164-1168` |
| 5 | native frame (GCRS / planet-ICRF) | `FRAME_HELIO_J2000_ICRF` | **translation only** — add/subtract heliocentric anchor state; no matrix, no quaternion | `runtime.ts:1170-1222` → `src/v2/core/frames/transform.ts:184-301` (vec add/sub 30-50); hooks wired `runtime.ts:838-851` |
| 6 | heliocentric position | scene-relative position | subtract focus-anchor position (translation) | `runtime.ts:1467-1471`; sun 1494-1497 |
| 7 | scene-relative (x,y,z) | THREE root position | identity component mapping — **no swizzle** | `runtime.ts:1472` (`root.position.set(relX, relY, relZ)`) |
| 8 | root | world | no rotation on scene or position-bearing groups; Mars/Saturn tilt groups are mesh-geometry-only siblings | `runtime.ts:962`, 1020-1021; tilts 83, 85, 677, 984; sibling rule 685-692 |
| 9 | world | camera | spherical rig around scene origin (+Y polar convention), default up (0,1,0) — `camera.up` never set — `lookAt(0,0,0)` | `runtime.ts:382-393`, 1440-1446, 1508; camera created 968-973 |
| A1 | asteroid elements (`FRAME_HELIO_J2000_ECLIPTIC` tag, `horizons.ts:523-531`) | heliocentric **ICRF** state | perifocal→ecliptic→equatorial, one obliquity rotation INTO ICRF | `src/v2/core/propagators/keplerian.ts:146-158`, 251, frame tag 270 |
| A2 | asteroid canonical ICRF | scene | subtract anchor only; identity instance quaternion; orbit-line batch offset by −anchor; worker buffer copied verbatim | `runtime.ts:701-720`, 722-740, update call 1521-1528; `src/v2/render/asteroid-renderer.ts:387-389`, 458, 485; `src/v2/render/asteroid-cell-renderer.ts:257-268`; orbit vertices `src/v2/render/asteroid-orbits.ts:55-67` from `keplerian.ts:161-193` |

## TOP_DOWN_ECLIPTIC_NORMAL_ICRF analysis

The constant now lives at `runtime.ts:335-339` (nothing frame-related sits at line 447 anymore — that is `directionToOrbitState`'s RangeError):

```ts
export const TOP_DOWN_ECLIPTIC_NORMAL_ICRF = rotateEclipticDirectionToIcrf({ x: 0, y: 0, z: 1 });
```

with `rotateEclipticDirectionToIcrf` at `runtime.ts:238-246` applying the J2000 obliquity (84381.448″, `src/v2/core/units.ts:5`), yielding (0, −sin ε, cos ε) ≈ (0, −0.3978, 0.9175) — **ecliptic north expressed in ICRF axes**. It is consumed in exactly two places: `TOP_DOWN_ORBIT_STATE` (`runtime.ts:463-466`) and, through that, the initial camera orbit (`runtime.ts:1141-1142`) and the `'t'` preset (`runtime.ts:341-349`). It is a **camera preset direction only** — it never touches body positions, the scene graph, or any geometry. The render frame does NOT follow from it; the scene stays ICRF-equatorial and the preset compensates by pre-rotating its view vector. Consequence worth stating in the chip review: in the "top-down" view the user looks down the *ecliptic* pole while the scene axes remain *equatorial*, so planet orbits appear correctly near-planar but scene +Z is tilted 23.44° from the view axis.

## Scene axes

- Scene basis = canonical ICRF basis: identity mapping at `runtime.ts:1472` on unrotated ICRF data (hops 1-7); `new THREE.Scene()` at `runtime.ts:962` with no `scene.rotation`/`applyMatrix`/`quaternion` anywhere in the file (grep evidence, §Verdict).
- **Scene +Z = ICRF +Z = celestial (equatorial) north; +X = ICRF +X (vernal equinox); +Y completes right-handed.** Nothing rotates by ~23.44° on the position path (obliquity grep exhausted above).
- Camera up: never set — THREE default (0,1,0) = ICRF +Y; orbit rig treats +Y as polar axis (`runtime.ts:382-393`, 458). Rig convention, not a frame statement.
- Render-only exceptions (mesh orientation, never positions): `marsTiltGroup.rotation.x = 25.19°` (`runtime.ts:83`, 677), `saturnTiltGroup.rotation.x = 26.7°` (`runtime.ts:85`, 984); moons ride sibling groups explicitly to keep canonical ICRF positions (`runtime.ts:685-692`, 1005-1008). These are cosmetic tilts about scene +X, not IAU pole orientations — irrelevant to the position frame the chip describes.

## Cross-view comparison

- **inner-solar-system** (`src/v2/app/inner-solar-system/runtime.ts`): identical pattern — Moon GCRS→helio by `transformCanonicalState` (234-235), positions straight to meshes (345), camera set/lookAt (324, ~381). No rotation.
- **earth-moon** (`src/v2/app/earth-moon/runtime.ts`): same axes, Earth-centered origin — helio→GCRS by `transformCanonicalState` (167-176), positions set directly (86). No rotation.
- **Core frame module** (`src/v2/core/frames/ids.ts:1-15`): names `FRAME_HELIO_J2000_ICRF`, `FRAME_HELIO_J2000_ECLIPTIC`, `FRAME_GCRS_EARTH`, `FRAME_{JUPITER,SATURN,MARS}_J2000_ICRF`. `transformCanonicalState` (`transform.ts:184-301`) supports only ICRF-aligned pairs (`transform.ts:120-134`) — all translation-only — and IS invoked on the solar-system render path (`runtime.ts:1177, 1189, 1201, 1213`). `FRAME_HELIO_J2000_ECLIPTIC` appears in no supported transform pair; it exists only as the asteroid element-set tag (`horizons.ts:523-531`, 573) and is consumed at propagation (`keplerian.ts:146-158`). No view applies a transform solar-system lacks; all three render in the same ICRF-axis convention.

## Evidence quotes

- `src/v2/data/horizons-inner-system-rolling.json:3` (identically line 3 of the jupiter/saturn/mars rolling and 2026-2040 fixtures): `"frame": "ICRF/J2000",`
- `src/v2/boundary/horizons.ts:293-295`: `function isEclipticJ2000Frame(frameHint?: string): boolean { const frame = String(frameHint || '').toUpperCase(); return frame.includes('ECLIPTIC');`
- `src/v2/boundary/horizons.ts:332-335`: `const rotatedPositionM = canonicalFrame === FRAME_HELIO_J2000_ICRF && isEclipticJ2000Frame(options?.frame) ? rotateEclipticJ2000ToIcrf(positionM) : positionM;`
- `src/v2/core/units.ts:5`: `export const J2000_ECLIPTIC_OBLIQUITY_RAD = 84381.448 * ARCSECONDS_TO_RADIANS;`
- `src/v2/app/solar-system/runtime.ts:335-339`: `export const TOP_DOWN_ECLIPTIC_NORMAL_ICRF = rotateEclipticDirectionToIcrf({ x: 0, y: 0, z: 1 });`
- `src/v2/app/solar-system/runtime.ts:1467-1472`: `const helio = getHeliocentricState(bodyId, currentTdbSeconds); relX = helio.positionM.x - anchorPosM.x; … root.position.set(relX, relY, relZ);`
- `src/v2/core/frames/transform.ts:232-238` (representative; all branches identical in kind): `if (fromFrame === FRAME_HELIO_J2000_ICRF && toFrame === FRAME_GCRS_EARTH) { return { …state, positionM: subtractVec3(state.positionM, earthState!.positionM), … } }` — translation only.
- `src/v2/core/propagators/keplerian.ts:146-148`: `// Slice 7 stores classical elements in heliocentric J2000 ecliptic orientation. // Propagation returns canonical heliocentric ICRF by rotating the ecliptic result // through the J2000 obliquity exactly once.`
- `src/v2/app/solar-system/runtime.ts:685-689`: `// marsCenteredGroup is a SIBLING of marsTiltGroup, NOT a child. // Render-only tilt applies to body geometry only, never to the child group // containing other bodies in the same frame.`
- Negative-space evidence (greps over `src/v2`, non-test): `84381` → only `core/units.ts:5`; `23.4` → only comment `core/lambert/dla.ts:11`; `0.409` → none; `camera.up` / `up.set` → none; `scene.rotation` / `applyMatrix` / `makeRotation` in `app/solar-system/runtime.ts` → none; only `.rotation.` hits are the Mars/Saturn tilt groups (677, 984).
