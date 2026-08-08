# Aster capability and user-surface inventory

**Marker:** `S-CONTEXT-AUDIT-2026-08-07-A`

**Audited HEAD:** `1a1df13`

**Date:** `2026-08-07`

**Compiled by read-only audit; every claim cites file:line or SHA; UNKNOWNs are labeled.**

This inventory describes the three production V2 entries `/v2/solar-system/`, `/v2/porkchop/`, and `/v2/about/` wired into the build at audited HEAD `1a1df13`. (`vite.config.ts:17-20`)

## A1. Viewer: `/v2/solar-system/`

### Time behavior — read this before advising a user

- **[A1-T01] Live time source and rate.** Live time is `Date.now() / 1000 + TDB_AT_UNIX_EPOCH`, so it follows wall-clock time at one simulated second per wall-clock second; the render loop samples it on each animation frame while `tracking` is true. (`src/v2/app/solar-system/runtime.ts:202-206`; `src/v2/app/solar-system/runtime.ts:1876-1889`)
- **[A1-T02] Initial state.** The scene initializes at the common fixture lower bound with `tracking = true`; the first live frame replaces that value with wall-clock-derived time clamped to fixture coverage. (`src/v2/app/solar-system/runtime.ts:831-836`; `src/v2/app/solar-system/runtime.ts:1142-1144`; `src/v2/app/solar-system/runtime.ts:1876-1881`)
- **[A1-T03] What stops live tracking.** Left/right scrubbing sets `tracking = false` and changes time by 1,800 seconds; Home and End also set `tracking = false` but jump to the coverage bounds. The clock then remains non-live; subsequent time-control keys can change it, and Shift+N resumes tracking. (`src/v2/app/solar-system/runtime.ts:76`; `src/v2/app/solar-system/runtime.ts:1535-1539`; `src/v2/app/solar-system/runtime.ts:1810-1836`)
- **[A1-T04] What resumes it.** Uppercase `N` (normally Shift+N) sets `tracking = true`; the next animation frame returns to wall-clock-derived time. (`src/v2/app/solar-system/runtime.ts:1834-1836`; `src/v2/app/solar-system/runtime.ts:1876-1881`)
- **[A1-T05] No pause-at-current-time and no rate scaling.** There is no pause binding/control that freezes the current live instant: the only paths out of live mode also scrub or jump. The live calculation contains no time-rate multiplier, and the exhaustive keyboard handler contains no pause/rate/reverse branch. (`src/v2/app/solar-system/runtime.ts:202-206`; `src/v2/app/solar-system/runtime.ts:1535-1539`; `src/v2/app/solar-system/runtime.ts:1800-1874`)

### Keyboard bindings (L9 verified and extended)

L9 audited the older HEAD `1b42e78` and listed the handler order and bindings then present; every row in its viewer binding table still matches current source, and current source additionally binds `k` to Titan. (`tools/overnight-2026-08-05/L9_KEYBINDINGS.md:10-75`; `src/v2/app/solar-system/runtime.ts:154-177`; `src/v2/app/solar-system/runtime.ts:1800-1874`)

| ID | Key | Effect at HEAD `1a1df13` | Handler |
|---|---|---|---|
| A1-K01 | `ArrowRight` | Cancel camera-orbit tween; scrub +1,800 s; leave live tracking. | `src/v2/app/solar-system/runtime.ts:1810-1813` |
| A1-K02 | `ArrowLeft` | Cancel camera-orbit tween; scrub −1,800 s; leave live tracking. | `src/v2/app/solar-system/runtime.ts:1815-1818` |
| A1-K03 | `Home` | Cancel tween, leave live tracking, jump to common fixture start. | `src/v2/app/solar-system/runtime.ts:1820-1825` |
| A1-K04 | `End` | Cancel tween, leave live tracking, jump to common fixture end. | `src/v2/app/solar-system/runtime.ts:1827-1832` |
| A1-K05 | `N` (uppercase / Shift+N) | Resume live wall-clock tracking. | `src/v2/app/solar-system/runtime.ts:1834-1836` |
| A1-K06 | `1` | Focus Sun. | `src/v2/app/solar-system/runtime.ts:154-155`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K07 | `2` | Focus Mercury. | `src/v2/app/solar-system/runtime.ts:156`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K08 | `3` | Focus Venus. | `src/v2/app/solar-system/runtime.ts:157`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K09 | `4` | Focus Earth. | `src/v2/app/solar-system/runtime.ts:158`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K10 | `5` | Focus Moon. | `src/v2/app/solar-system/runtime.ts:159`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K11 | `6` | Focus Mars (legacy numeric alias). | `src/v2/app/solar-system/runtime.ts:160`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K12 | `m` | Focus Mars. | `src/v2/app/solar-system/runtime.ts:161`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K13 | `p` | Focus Phobos. | `src/v2/app/solar-system/runtime.ts:162`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K14 | `x` | Focus Deimos. | `src/v2/app/solar-system/runtime.ts:163`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K15 | `7` | Focus Jupiter. | `src/v2/app/solar-system/runtime.ts:164`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K16 | `8` | Focus Io. | `src/v2/app/solar-system/runtime.ts:165`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K17 | `9` | Focus Europa. | `src/v2/app/solar-system/runtime.ts:166`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K18 | `0` | Focus Ganymede. | `src/v2/app/solar-system/runtime.ts:167`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K19 | `-` | Focus Callisto. | `src/v2/app/solar-system/runtime.ts:168`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K20 | `s` | Focus Saturn. | `src/v2/app/solar-system/runtime.ts:169`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K21 | `k` | Focus Titan; this is the post-L9 addition. | `src/v2/app/solar-system/runtime.ts:150-152`; `src/v2/app/solar-system/runtime.ts:170` |
| A1-K22 | `r` | Focus Rhea. | `src/v2/app/solar-system/runtime.ts:171`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K23 | `i` | Focus Iapetus. | `src/v2/app/solar-system/runtime.ts:172`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K24 | `y` | Focus Tethys. | `src/v2/app/solar-system/runtime.ts:173`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K25 | `d` | Focus Dione. | `src/v2/app/solar-system/runtime.ts:174`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K26 | `n` (lowercase) | Focus Mimas; this differs from uppercase `N`, which resumes live time. | `src/v2/app/solar-system/runtime.ts:175`; `src/v2/app/solar-system/runtime.ts:1834-1840` |
| A1-K27 | `e` | Focus Enceladus. | `src/v2/app/solar-system/runtime.ts:176`; `src/v2/app/solar-system/runtime.ts:1839-1849` |
| A1-K28 | `t` | One-second cubic-ease camera-orbit tween to an 8 AU top-down Sun-centered preset. | `src/v2/app/solar-system/runtime.ts:89-91`; `src/v2/app/solar-system/runtime.ts:341-349`; `src/v2/app/solar-system/runtime.ts:1852-1867` |
| A1-K29 | `=` | Cancel camera tween and focus the 7 AU Jupiter/Saturn outer-system overview. | `src/v2/app/solar-system/runtime.ts:65-67`; `src/v2/app/solar-system/runtime.ts:1309-1318`; `src/v2/app/solar-system/runtime.ts:1870-1873` |

- **[A1-K30] Keyboard guard.** Inputs, textareas, selects, and content-editable targets are ignored, as are Meta/Ctrl/Alt-modified events; Shift is not filtered, which is why `n` and `N` differ. (`src/v2/app/solar-system/runtime.ts:263-278`; `src/v2/app/solar-system/runtime.ts:1800-1803`)
- **[A1-K31] Modal passthrough defect.** The porkchop modal adds a separate window handler for Escape only; it does not stop propagation, and the scene handler has no modal-open guard. Thus scene focus/time bindings still operate behind an open modal. (`src/v2/app/ui-overlay/overlay.ts:342-357`; `src/v2/app/solar-system/runtime.ts:1800-1803`; `tools/overnight-2026-08-05/L9_KEYBINDINGS.md:98-101`)
- **[A1-K32] Remaining L9 rows cross-checked.** Outside the requested solar-system route, L9's current-source rows still match: inner-solar-system has arrows/Home/End, `1`–`6`, and `0`; earth-moon has arrows/Home/End and `0`; the renderer prototype has `1`–`7`; the overlay has Escape as described above. (`tools/overnight-2026-08-05/L9_KEYBINDINGS.md:111-119`; `src/v2/app/inner-solar-system/runtime.ts:468-509`; `src/v2/app/earth-moon/runtime.ts:288-314`; `src/v2/prototypes/renderer-test/scene.ts:321-326`; `src/v2/app/ui-overlay/overlay.ts:342-357`)

### Canvas mouse/pointer interactions

| ID | Interaction | Actual behavior | Handler |
|---|---|---|---|
| A1-M01 | Pointer hover over Sun, Mercury, Venus, Earth, Mars, Jupiter, or Saturn | Shows a name tooltip offset from the projected body position; update is throttled to 33 ms. | `src/v2/app/solar-system/runtime.ts:207-218`; `src/v2/app/solar-system/runtime.ts:1630-1654` |
| A1-M02 | Pointer hover over a pickable asteroid | Cursor changes from grab to pointer; picking compares point/mesh/cell hits and rejects asteroid hits occluded by an opaque planet mesh. | `src/v2/app/solar-system/runtime.ts:1585-1617`; `src/v2/app/solar-system/runtime.ts:1656-1663` |
| A1-M03 | Pointer down + drag at least 4 px | Captures the pointer and orbits the camera; horizontal movement changes azimuth and vertical movement changes clamped polar angle. | `src/v2/app/solar-system/runtime.ts:78`; `src/v2/app/solar-system/runtime.ts:1665-1717` |
| A1-M04 | Click (pointer up without a 4 px drag) on an asteroid | Starts focus transition to that asteroid and selects it in the catalog; clicking empty space or a planet does not focus it. | `src/v2/app/solar-system/runtime.ts:1728-1749`; `src/v2/app/solar-system/runtime.ts:1372-1410` |
| A1-M05 | Wheel | Exponential zoom, clamped to the focused body's minimum and 15 AU maximum, with a Sun-clearance clamp; default scrolling is prevented only after the tween-lock guard. | `src/v2/app/solar-system/runtime.ts:71-75`; `src/v2/app/solar-system/runtime.ts:1766-1798` |
| A1-M06 | Pointer leave/cancel | Releases active interaction, hides planet tooltip, and restores the grab cursor. | `src/v2/app/solar-system/runtime.ts:1752-1764` |
| A1-M07 | Pointer/scroll during top-down tween | Pointer and wheel handlers return while controls are locked; the known wheel-during-tween `preventDefault` leak remains parked because the return precedes `preventDefault`. | `src/v2/app/solar-system/runtime.ts:354-359`; `src/v2/app/solar-system/runtime.ts:1665-1668`; `src/v2/app/solar-system/runtime.ts:1766-1770`; `STATUS.md:114-116` |

### Viewer HUD and overlays

| ID | Element | What drives it |
|---|---|---|
| A1-H01 | Focused-asteroid HUD, top-left | Visible only for an asteroid focus; text is `designation · class`. | `src/v2/app/solar-system/runtime.ts:875-890`; `src/v2/app/solar-system/runtime.ts:572-584`; `src/v2/app/solar-system/runtime.ts:1286-1290` |
| A1-H02 | Date HUD, top-right | Every visible-state update writes a TDB date/time plus a UTC date/time derived from `currentTdbSeconds`. | `src/v2/app/solar-system/runtime.ts:892-907`; `src/v2/app/solar-system/runtime.ts:613-635`; `src/v2/app/solar-system/runtime.ts:1514-1516` |
| A1-H03 | Ephemeris coverage line | Shows the intersection of the first/last samples across every loaded body series. | `src/v2/app/solar-system/runtime.ts:831-836`; `src/v2/app/solar-system/runtime.ts:927-931` |
| A1-H04 | Out-of-coverage warning | Shows when *wall-clock* TDB, not scrubbed display time, is outside the common fixture range; live display itself is clamped. | `src/v2/app/solar-system/runtime.ts:933-939`; `src/v2/app/solar-system/runtime.ts:1517-1520`; `src/v2/app/solar-system/runtime.ts:1876-1880` |
| A1-H05 | Tracking-status line | Reads `LIVE` or `SCRUBBED — press Shift+N for now` from the `tracking` boolean. | `src/v2/app/solar-system/runtime.ts:941-944`; `src/v2/app/solar-system/runtime.ts:1520` |
| A1-H06 | Planet hover tooltip | Displays the names of the seven hover-enabled major bodies; it is hidden on misses, drag, leave, and cancel. | `src/v2/app/solar-system/runtime.ts:210-218`; `src/v2/app/solar-system/runtime.ts:653-668`; `src/v2/app/solar-system/runtime.ts:1630-1654` |
| A1-H07 | Body labels | CSS2D labels exist for Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, plus the focused asteroid; the catalog `Labels` button controls the whole label renderer. | `src/v2/app/solar-system/runtime.ts:129-137`; `src/v2/app/solar-system/runtime.ts:861-872`; `src/v2/app/solar-system/runtime.ts:1023-1036` |
| A1-H08 | Catalog panel and porkchop modal | A Preact overlay is mounted above the Three.js canvas; its interactive catalog and modal are detailed in A4. | `src/v2/app/solar-system/runtime.ts:873`; `src/v2/app/ui-overlay/overlay.ts:392-432` |
| A1-H09 | Browser tab title | Updated from current display time as `Aster V2 — Solar System — <TDB label>`. | `src/v2/app/solar-system/runtime.ts:1522` |

### Explicit negative capability list

These absences are verified against the complete scene keyboard handler and catalog control render at HEAD `1a1df13`, not inferred from screenshots. (`src/v2/app/solar-system/runtime.ts:1800-1899`; `src/v2/app/catalog-list/panel.ts:493-753`)

- **[A1-N01] No pause/play button or pause key.** Shift+N resumes live time; scrubbing/jumping is the only way to leave live mode. (`src/v2/app/solar-system/runtime.ts:1535-1539`; `src/v2/app/solar-system/runtime.ts:1810-1836`)
- **[A1-N02] No time-rate control** (no 2×/10× rate, rate slider, or rate key). Live time directly uses wall time with no multiplier. (`src/v2/app/solar-system/runtime.ts:202-206`; `src/v2/app/solar-system/runtime.ts:1876-1881`)
- **[A1-N03] No reverse-time playback control.** ArrowLeft is a discrete −1,800 s scrub, not continuous reverse playback. (`src/v2/app/solar-system/runtime.ts:76`; `src/v2/app/solar-system/runtime.ts:1815-1818`)
- **[A1-N04] No date/time slider or date picker.** Time control is keyboard-only and bounded by fixture coverage. (`src/v2/app/solar-system/runtime.ts:1535-1539`; `src/v2/app/solar-system/runtime.ts:1810-1836`; `src/v2/app/catalog-list/panel.ts:493-753`)
- **[A1-N05] No orbit-line visibility toggle.** The catalog display controls expose only starfield visibility, labels visibility, and starfield brightness; asteroid orbit visibility/opacity is automatic. (`src/v2/app/catalog-list/panel.ts:605-702`; `src/v2/render/asteroid-renderer.ts:458-487`)
- **[A1-N06] No label-size control.** The UI has only a labels on/off toggle; label font size is fixed at 12 px. (`src/v2/app/catalog-list/panel.ts:655-671`; `src/v2/app/solar-system/runtime.ts:295-315`)
- **[A1-N07] No asteroid-size or point-size control.** Asteroid point size is shader-derived and capped from the WebGL point-size range. (`src/v2/render/asteroid-points-shader.ts:25-31`; `src/v2/app/solar-system/runtime.ts:1074-1077`)
- **[A1-N08] No planet-click focus.** Canvas click handling invokes focus only when asteroid picking returns a body ID; planets support hover labels, not click focus. (`src/v2/app/solar-system/runtime.ts:1728-1749`)
- **[A1-N09] No free-pan control.** Drag changes spherical azimuth/polar around the current focus anchor; the camera always looks at scene origin. (`src/v2/app/solar-system/runtime.ts:1709-1715`; `src/v2/app/solar-system/runtime.ts:1493-1494`)
- **[A1-N10] No FOV control.** The camera is constructed at 45 degrees and resize changes only aspect ratio. (`src/v2/app/solar-system/runtime.ts:968-973`; `src/v2/app/solar-system/runtime.ts:1525-1533`)
- **[A1-N11] No explicit camera near/far controls.** Both planes are recomputed from orbit radius on every visible-state update. (`src/v2/app/solar-system/runtime.ts:1425-1431`)
- **[A1-N12] No user-selectable asteroid propagation model or cadence.** The runtime always constructs one module worker and sends the fixed normalized catalog body set to it. (`src/v2/app/solar-system/runtime.ts:1086-1132`)
- **[A1-N13] No multi-asteroid compare selector on the current catalog panel.** The store contains a prepared capped selection set, but the rendered row has only the scalar focus button and PC button. (`src/v2/app/ui-store/store.ts:41-44`; `src/v2/app/ui-store/store.ts:147-160`; `src/v2/app/catalog-list/row.ts:64-184`)
- **[A1-N14] No user toggle for logarithmic depth buffering.** The viewer creates `WebGLRenderer` with only `{ antialias: true }`; `logarithmicDepthBuffer` is not configured. (`src/v2/app/solar-system/runtime.ts:853-858`)

### Known viewer defects recorded at HEAD

- **[A1-D01]** The parked list records: straight green Bennu/100926 artifact, NEA cloud disappearing at high zoom, starfield density/brightness tuning, focus-transition `camera.far` clipping, wheel-during-tween `preventDefault` leak, same-row refocus zoom behavior, point pop at LOD transition, and picking near/far desynchronization. (`STATUS.md:107-118`)
- **[A1-D02]** The modal key-passthrough defect is independently visible in current handlers: Escape closes the modal, but all other unmodified scene keys remain eligible for the scene handler. (`src/v2/app/ui-overlay/overlay.ts:342-357`; `src/v2/app/solar-system/runtime.ts:1800-1874`)

## A2. Porkchop view: `/v2/porkchop/`

### Entry, fixed computation, and controls

- **[A2-C01] Target query.** `?body=<catalog bodyId>` selects the target; without it, the route defaults to `asteroid-2020 FK3`. (`src/v2/app/porkchop/main.ts:61-65`; `src/v2/app/porkchop/main.ts:190-193`)
- **[A2-C02] Fixed grid.** The dedicated page actually requests 200 departure samples × 100 TOF samples, departures from 2026-01-01 to 2040-01-01 converted to JD TDB, TOF 182.5–1826.25 days, and `M=1`. (`src/v2/app/porkchop/main.ts:169-188`; `src/v2/app/porkchop/main.ts:908-922`)
- **[A2-C03] Modal grid parity.** The viewer modal uses the same 200×100, 2026-01-01→2040-01-01, 182.5→1826.25-day, `M=1` parameters. (`src/v2/app/ui-overlay/overlay.ts:146-169`; `src/v2/app/ui-overlay/overlay.ts:322-329`)
- **[A2-C04] Heatmap hover.** Pointer movement selects the underlying cell and positions a transient tooltip; leaving clears it. (`src/v2/porkchop/porkchop-view.ts:719-746`)
- **[A2-C05] Heatmap click.** Clicking pins the underlying cell and redraws the white pin marker; hover has its own green marker. (`src/v2/porkchop/porkchop-view.ts:700-717`; `src/v2/porkchop/porkchop-view.ts:675-698`)
- **[A2-C06] C3 contour checkbox.** `Show contours` independently toggles fixed 10, 30, 100, and 300 km²/s² iso-C3 contours; it starts off. (`src/v2/porkchop/porkchop-view.ts:186-191`; `src/v2/porkchop/porkchop-view.ts:551-560`; `src/v2/porkchop/porkchop-view.ts:861-872`)
- **[A2-C07] DLA feasibility checkbox.** Dedicated view starts with DLA contours on; the checkbox toggles them. (`src/v2/app/porkchop/main.ts:273-278`; `src/v2/app/porkchop/main.ts:597-625`)
- **[A2-C08] Launch-site picker.** It appears only while DLA contours are on and offers Cape Canaveral and Vandenberg SFB; changing it recomputes contour thresholds and cell feasibility readouts. (`src/v2/app/porkchop/main.ts:626-650`; `src/v2/core/lambert/feasibility.ts:28-52`; `src/v2/porkchop/porkchop-view.ts:561-569`; `src/v2/porkchop/porkchop-view.ts:763-778`)
- **[A2-C09] Launch-vehicle picker.** Options are Falcon Heavy Expendable, Falcon Heavy Recovery, Vulcan VC2/VC4/VC6, New Glenn Standard, Falcon 9 FT ASDS, and Falcon 9 FT RTLS. (`src/v2/app/porkchop/main.ts:672-691`; `src/v2/porkchop/launch-vehicles.ts:60-179`)
- **[A2-C10] Mission-mode picker.** Offers `One-way rendezvous` and `Sample return`; sample return adds the departure burn to the spacecraft budget. (`src/v2/app/porkchop/main.ts:130-133`; `src/v2/app/porkchop/main.ts:367-415`; `src/v2/app/porkchop/main.ts:693-710`)
- **[A2-C11] Replay tour.** Restores FK3, Cape Canaveral, and DLA-on, then starts the four-step guided tour; on a different target it navigates back to the default-body route first. (`src/v2/app/porkchop/main.ts:417-431`; `src/v2/app/porkchop/main.ts:573-582`)
- **[A2-C12] Guided-tour controls.** Each step exposes `Skip tour` and `Next`, with `Close` replacing Next on step 4. (`src/v2/app/porkchop/fk3-guided-tour.ts:164-201`)
- **[A2-C13] Navigation links.** The sidebar links to About and toggles a comparison link between FK3 and Apophis; this is target navigation, not a simultaneous compare view. (`src/v2/app/porkchop/main.ts:565-590`)
- **[A2-C14] Native disclosure controls.** `Assumptions & sources` expands mission-cost provenance/assumptions, and `Worst case & full disclosure` expands observed validation evidence. (`src/v2/app/porkchop/main.ts:818-843`; `src/v2/app/porkchop/validation-card.ts:159-180`)

### Readouts

- **[A2-R01] Grid identity.** Sidebar displays target label/body ID, `200×100`, M=1, the date/TOF span, and a short instruction to click a cell. (`src/v2/app/porkchop/main.ts:562-603`)
- **[A2-R02] Heatmap axes and legend.** Departure runs early→late left-to-right, TOF short→long bottom-to-top, and C3 uses a logarithmic 1–1000 viridis scale; no-solution is dark gray and stall is magenta. (`src/v2/porkchop/porkchop-view.ts:856-860`; `src/v2/porkchop/porkchop-view.ts:909-987`; `src/v2/porkchop/colormap.ts:4-7`; `src/v2/porkchop/colormap.ts:60-67`)
- **[A2-R03] Hover tooltip.** Shows status, departure date, TOF to three decimals, and selected-branch C3 to six decimals or `n/a`. (`src/v2/porkchop/porkchop-view.ts:923-939`)
- **[A2-R04] Pinned-cell panel.** Shows status, departure, arrival, TOF, M, branch label/index, C3, signed DLA, feasibility badge and site, screening advisory, plus departure/arrival v-infinity; C3 and both v-infinity values use six decimals. (`src/v2/porkchop/porkchop-view.ts:990-1065`)
- **[A2-R05] DLA legends.** With DLA on, dashed green marks the site's minimum direct inclination and dashed red the maximum direct-declination ceiling; Vandenberg instead says its corridor covers all declinations. (`src/v2/porkchop/porkchop-view.ts:958-985`; `src/v2/core/lambert/feasibility.ts:36-50`)
- **[A2-R06] Mission-cost card.** For a valid pin it shows either delivered mass with GREEN/AMBER badge or a RED `Not feasible at screening fidelity` verdict, plus vehicle/mode/date/TOF, payload at C3, rendezvous, optional sample-return departure, stationkeeping, dogleg regime, 5% deterministic margin, delivered mass, and injection-is-in-payload disclosure. (`src/v2/app/porkchop/main.ts:711-816`)
- **[A2-R07] Cost assumptions.** Expanded details show the selected vehicle source/as-of, interpolation/no-extrapolation policy, Isp/model scope, margin policy, dogleg regime, and an extra New Glenn steep-segment warning when applicable. (`src/v2/app/porkchop/main.ts:818-843`)
- **[A2-R08] ΔV stack.** A converged pin shows total, injection, rendezvous, departure, stationkeeping, subtotal, margin, pinned C3, pinned arrival v-infinity, and 200 km LEO/stationkeeping/margin assumptions; no pin and unconverged pins have distinct empty messages. (`src/v2/app/porkchop/main.ts:846-901`)
- **[A2-R09] Validation card.** Runtime-loaded provenance supplies a headline, STRICT-class definition, detailed non-OBSERVED rows with source artifact/commit, and an expandable OBSERVED worst-case/disclosure; load failure says the summary is temporarily unavailable. (`src/v2/app/porkchop/validation-card.ts:96-141`; `src/v2/app/porkchop/validation-card.ts:143-180`)
- **[A2-R10] Guided tour.** Four dialog steps explain the globally cheapest FK3 window, DLA geometry, the verdict, and the tool's stated lesson; the exact step copy and variant-specific step 3 are source literals. (`src/v2/app/porkchop/fk3-guided-tour.ts:15-38`; `src/v2/app/porkchop/fk3-guided-tour.ts:164-201`)
- **[A2-R11] Loading/error states.** Route initialization shows a dedicated loading screen or an unavailable card with the error; the grid itself separately shows `Loading screening data…` or the client error; the viewer modal can show `Initializing porkchop client…`. (`src/v2/app/porkchop/main.ts:529-553`; `src/v2/porkchop/porkchop-view.ts:899-905`; `src/v2/app/ui-overlay/overlay.ts:311-321`)

### C3 formatting and honest refusal/validation behavior

- **[A2-F01] Shared display rule.** Catalog and mission-cost display sites use `formatC3`: three significant figures; plain notation for `1e-4 <= |C3| < 1e5`, exponential with two fractional digits outside that range; null is an em dash and non-finite input is stringified. (`src/v2/porkchop/format-c3.ts:1-27`; `src/v2/app/catalog-list/row.ts:145`; `src/v2/app/porkchop/main.ts:773-815`)
- **[A2-F02] Precision readout exception.** Hover, pinned-cell, and ΔV-stack precision readouts intentionally retain six decimals; the shared formatter's source comment explicitly excludes them. (`src/v2/porkchop/format-c3.ts:7-10`; `src/v2/porkchop/porkchop-view.ts:929-937`; `src/v2/porkchop/porkchop-view.ts:1013-1014`; `src/v2/app/porkchop/main.ts:888-891`)
- **[A2-F03] Unknown target refusal.** A body ID absent from the catalog throws `Body not found for ?body=...`; the page renders `Porkchop page unavailable` plus the error. (`src/v2/app/porkchop/main.ts:301-333`; `src/v2/app/porkchop/main.ts:541-553`)
- **[A2-F04] Cell-level refusal.** `no_solution` and `stall` cells have no selected branch; pinned values become `n/a`/em dashes and both cost and ΔV cards say no converged branch is available. (`src/v2/porkchop/grid-compute.ts:196-218`; `src/v2/porkchop/porkchop-view.ts:319-355`; `src/v2/app/porkchop/main.ts:711-720`; `src/v2/app/porkchop/main.ts:852-859`)
- **[A2-F05] Pricing refusal.** Past a vehicle's published C3 curve the card says it will not extrapolate; invalid cell data gets a separate em-dash/`invalid cell data`; RED DLA gets a feasibility verdict and no delivered-mass number. (`src/v2/porkchop/launch-vehicles.ts:198-208`; `src/v2/app/porkchop/main.ts:724-760`; `src/v2/app/porkchop/main.ts:773-810`)
- **[A2-F06] Fixture-bounds validation is absent.** The live porkchop route does not compare its requested departure span against actual Earth-series bounds and does not clamp/refuse it; it works because its fixed end lies within the fixture. DEC-17-10 locks validation/refusal for the future compare view and explicitly records the current view as unfixed. (`SLICE_17_FOUNDING.md:265-276`; `SLICE_17_FOUNDING.md:545-551`; `src/v2/app/porkchop/main.ts:181-188`; `src/v2/app/porkchop/main.ts:301-323`)

## A3. About page: `/v2/about/`

### Sections and navigation

- **[A3-S01] Top navigation/hero.** Links back to Aster's solar-system viewer and to the porkchop route, above an `About Aster` heading. (`src/v2/app/about/main.ts:357-373`)
- **[A3-S02] `What this is`.** Describes Aster as a browser asteroid mission-planning tool that computes Earth-departure porkchops from a re-derived Lambert solver, screens DLA/site geometry, prices delivered mass from published curves, covers 41,906 NEAs, and claims to disclose assumptions/out-of-range results. (`src/v2/app/about/main.ts:374-385`; `src/v2/boundary/slice9-nea-catalog.ts:20`)
- **[A3-S03] `How it was built`.** Claims a Nova-drafted, human-reviewed slice process in fixed pre-research→decisions→founding→execution→multi-agent-audit→deploy order, followed by `The decision record`. (`src/v2/app/about/main.ts:387-399`)
- **[A3-S04] Audit/verification/operating-system subsections.** Claims three independent math-review lenses with findings resolved before deploy; no external number enters a decision before independent checking; and repository rules make the agent process repeatable. (`src/v2/app/about/main.ts:400-460`)
- **[A3-S05] `Validation`.** Claims poliastro comparison without importing it into the math layer, separately validated multi-revolution direction, measured vehicle-curve error bounds, and source-file/commit provenance in the live validation panel/report; its numeric strings come from runtime-loaded validation provenance. (`src/v2/app/about/main.ts:266-306`; `src/v2/app/about/main.ts:309-329`)

### Artifact links rendered by the page

The page builds GitHub blob URLs pinned to the literal commit field and optionally a heading fragment. (`src/v2/app/about/main.ts:178-193`)

| ID | Rendered artifact target | Pinned ref in UI source |
|---|---|---|
| A3-L01 | `src/v2/SLICE_12_FOUNDING.md` | `946afed` (`src/v2/app/about/main.ts:36-41`) |
| A3-L02 | `src/v2/SLICE_13_FOUNDING.md` | `8fc6f32` (`src/v2/app/about/main.ts:42-46`) |
| A3-L03 | `src/v2/SLICE_10_FOUNDING.md` | `3d5f1cd` (`src/v2/app/about/main.ts:47-51`) |
| A3-L04 | `src/v2/SLICE_14_FOUNDING.md` | `8fcddb6` (`src/v2/app/about/main.ts:52-56`) |
| A3-L05 | Slice 10 OQ-8 heading in `src/v2/SLICE_10_FOUNDING.md` | `3d5f1cd` plus heading fragment (`src/v2/app/about/main.ts:57-66`) |
| A3-L06 | Slice 13 §8 in `src/v2/SLICE_13_FOUNDING.md` | `8fc6f32` plus heading fragment (`src/v2/app/about/main.ts:67-72`) |
| A3-L07 | `tools/slice13-research/elvperf/oracle/oracle-report.md` | `808e709` (`src/v2/app/about/main.ts:73-77`) |
| A3-L08 | `tools/slice13-research/literature/3d-verification-record.md` | `f455489` (`src/v2/app/about/main.ts:78-82`) |
| A3-L09 | `INVARIANTS.md` | `b651519` (`src/v2/app/about/main.ts:83-87`) |
| A3-L10 | `AGENTS.md` | `78a1dcb` (`src/v2/app/about/main.ts:88-92`) |
| A3-L11 | `DEVLOG.md` | `946afed` (`src/v2/app/about/main.ts:93-98`) |
| A3-L12 | Repository root | Unpinned repository URL (`src/v2/app/about/main.ts:34`; `src/v2/app/about/main.ts:463-467`) |

## A4. Catalog sidebar/overlay

| ID | Control/readout | Behavior |
|---|---|---|
| A4-01 | Layout toggle | Switches between a fixed 400 px sidebar and a 380 px floating overlay; choice persists in `localStorage` under `aster-v2-layout-mode`. (`src/v2/app/catalog-list/panel.ts:433-462`; `src/v2/app/catalog-list/panel.ts:531-548`; `src/v2/app/ui-store/store.ts:24-33`; `src/v2/app/ui-store/store.ts:186-194`) |
| A4-02 | Search input | Case-insensitive substring search across designation and name; typing writes the search signal. (`src/v2/app/catalog-list/panel.ts:106-122`; `src/v2/app/catalog-list/panel.ts:550-570`) |
| A4-03 | Orbit-class filters | `ALL`, `ATE`, `APO`, `AMO`, and `IEO`; one active class or all. (`src/v2/app/catalog-list/panel.ts:43`; `src/v2/app/catalog-list/panel.ts:581-603`) |
| A4-04 | Sort A–Z | Ascending designation; default. (`src/v2/app/catalog-list/panel.ts:44-50`; `src/v2/app/catalog-list/panel.ts:141-145`; `src/v2/app/catalog-list/panel.ts:713-733`) |
| A4-05 | Sort Z–A | Descending designation. (`src/v2/app/catalog-list/panel.ts:44-50`; `src/v2/app/catalog-list/panel.ts:125-128`; `src/v2/app/catalog-list/panel.ts:713-733`) |
| A4-06 | Sort Class | Orbit class ascending, designation as tie-breaker. (`src/v2/app/catalog-list/panel.ts:44-50`; `src/v2/app/catalog-list/panel.ts:129-134`; `src/v2/app/catalog-list/panel.ts:713-733`) |
| A4-07 | Sort H ↑ | Absolute magnitude ascending; missing H sorts last. (`src/v2/app/catalog-list/panel.ts:44-50`; `src/v2/app/catalog-list/panel.ts:135-137`; `src/v2/app/catalog-list/panel.ts:713-733`) |
| A4-08 | Sort H ↓ | Absolute magnitude descending; missing H sorts last. (`src/v2/app/catalog-list/panel.ts:44-50`; `src/v2/app/catalog-list/panel.ts:138-140`; `src/v2/app/catalog-list/panel.ts:713-733`) |
| A4-09 | Starfield toggle | Changes renderer visibility and labels itself `Starfield on/off`. (`src/v2/app/catalog-list/panel.ts:638-654`; `src/v2/app/solar-system/runtime.ts:963-967`) |
| A4-10 | Labels toggle | Shows/hides the entire CSS2D label layer and labels itself `Labels on/off`. (`src/v2/app/catalog-list/panel.ts:655-671`; `src/v2/app/solar-system/runtime.ts:868-872`) |
| A4-11 | Starfield-brightness slider | Range 0–1 in 0.05 steps with percentage readout; store clamps finite values to [0,1] and renderer applies opacity. (`src/v2/app/catalog-list/panel.ts:674-701`; `src/v2/app/ui-store/store.ts:175-180`; `src/v2/render/star-renderer.ts:106-111`) |
| A4-12 | Catalog count | Header shows the post-filter/post-search row count, not total fixture count. (`src/v2/app/catalog-list/panel.ts:106-148`; `src/v2/app/catalog-list/panel.ts:520-530`) |
| A4-13 | Row click | Selects that body and issues a focus request consumed by the scene transition bridge. (`src/v2/app/catalog-list/row.ts:64-91`; `src/v2/app/solar-system/runtime.ts:1545-1564`) |
| A4-14 | Row badges/readouts | Each row shows name-or-designation; status badge `low C3`, `high C3`, `unconv.`, `prop fail`, or raw fallback; orbit class/co-orbital tag; and min C3 via the shared formatter. (`src/v2/app/catalog-list/row.ts:11-39`; `src/v2/app/catalog-list/row.ts:102-146`) |
| A4-15 | PC button | Stops row-click propagation and opens that body's modal; it disables while the client is unavailable/busy or another modal is open. (`src/v2/app/catalog-list/row.ts:148-184`; `src/v2/app/ui-overlay/overlay.ts:192-197`; `src/v2/app/ui-overlay/overlay.ts:384-387`) |
| A4-16 | Modal close controls | Escape, close `×`, and backdrop click close; clicking within the modal panel does not. (`src/v2/app/ui-overlay/overlay.ts:251-268`; `src/v2/app/ui-overlay/overlay.ts:299-308`; `src/v2/app/ui-overlay/overlay.ts:342-357`) |
| A4-17 | Modal `Open detailed view` | Opens `/v2/porkchop/?body=<bodyId>` in a new tab with `noopener,noreferrer`. (`src/v2/app/ui-overlay/overlay.ts:282-298`) |
| A4-18 | Footer | Shows `Patched-conic screen` plus cache-derived screening years when loaded and `click for details`; click opens the limitations popover, while `About this tool` navigates without opening it. (`src/v2/app/catalog-list/honesty-disclosure.ts:24-45`; `src/v2/app/catalog-list/panel.ts:230-293`) |
| A4-19 | Limitations popover | Backdrop click or `×` closes it; it explains low-C3 screening, co-orbital caution, and close-approach degeneracy. (`src/v2/app/catalog-list/panel.ts:295-405`; `src/v2/app/catalog-list/honesty-disclosure.ts:48-84`) |
| A4-20 | Catalog scrolling | Uses a virtualized list with 56 px rows and six-row buffer; scroll position determines which rows render. (`src/v2/app/catalog-list/panel.ts:164-200`; `src/v2/app/catalog-list/panel.ts:421-431`; `src/v2/app/catalog-list/types.ts:17`) |

## A5. Rendering facts relevant to focused-asteroid flicker/drift investigation

The following is pipeline description only; it does **not** diagnose the open visual behavior. (`STATUS.md:107-118`)

- **[A5-01] Planet fixture sources.** The viewer fetches four production rolling fixtures (inner, Jupiter, Saturn, Mars systems), ingests them, and combines their body series. (`src/v2/app/solar-system/loader.ts:13-31`; `src/v2/app/solar-system/loader.ts:42-60`)
- **[A5-02] Planet interpolation.** Each visible update obtains planet/moon state at `currentTdbSeconds`; series interpolation is cubic Hermite between bracketing position/velocity samples and refuses out-of-range time. (`src/v2/app/solar-system/runtime.ts:1158-1215`; `src/v2/app/solar-system/runtime.ts:1440-1477`; `src/v2/core/interpolators/hermite.ts:47-80`; `src/v2/core/interpolators/hermite.ts:82-121`)
- **[A5-03] Planet frames.** Moon, Jupiter-system, Mars-system, and Saturn-system native states are transformed to heliocentric ICRF where needed before scene-relative placement; Phobos/Deimos render from their Mars-centered native positions as siblings under the Mars system group. (`src/v2/app/solar-system/runtime.ts:1164-1215`; `src/v2/app/solar-system/runtime.ts:1440-1465`)
- **[A5-04] Asteroid worker initialization.** The main thread creates one module worker, normalizes the catalog bodies, posts `{type:'init', bodies}`, and the worker replies `{type:'ready', bodyCount}`. (`src/v2/app/solar-system/runtime.ts:1086-1132`; `src/v2/app/solar-system/asteroid-propagation-worker.ts:9-20`)
- **[A5-05] Asteroid request cadence.** `updateVisibleState` calls `requestAsteroidPropagation(currentTdbSeconds)`; the live render loop calls `updateVisibleState` once per animation frame, so requests are frame-driven rather than timer-driven, with duplicate requested/current epochs suppressed. (`src/v2/app/solar-system/runtime.ts:1238-1261`; `src/v2/app/solar-system/runtime.ts:1413-1415`; `src/v2/app/solar-system/runtime.ts:1876-1889`)
- **[A5-06] Worker computation/message shape.** For each body the worker propagates elliptic elements or copies an anchor position into a transferable Float64 buffer, then posts `{type:'propagate-result', requestId, targetTdbSeconds, positionsM}`. (`src/v2/app/solar-system/asteroid-propagation-worker.ts:23-52`)
- **[A5-07] Result acceptance.** Main thread ignores any result whose request ID is not the latest pending ID; an accepted buffer updates canonical positions and epoch, clears pending state, increments partition revision, and requests a visible-state update. (`src/v2/app/solar-system/runtime.ts:1114-1127`)
- **[A5-08] Renderer consumer.** `AsteroidRenderer.update` consumes the latest canonical-position array, subtracts the current focus anchor to form camera-relative world positions, then updates point, instanced, and focused-mesh layers. (`src/v2/app/solar-system/runtime.ts:1501-1513`; `src/v2/render/asteroid-renderer.ts:350-451`)
- **[A5-18] Pre-ready fallback.** Before the worker is ready, a propagation request synchronously rebuilds the full canonical asteroid-position array on the main thread and increments the partition revision. (`src/v2/app/solar-system/runtime.ts:701-720`; `src/v2/app/solar-system/runtime.ts:1238-1243`)
- **[A5-09] Focus-anchor fact.** For a focused asteroid, `getAnchorPosition` uses the renderer's cached canonical position only when the requested time exactly equals the accepted asteroid-position epoch; otherwise it synchronously propagates that one asteroid for the anchor. (`src/v2/app/solar-system/runtime.ts:1226-1235`; `src/v2/app/solar-system/runtime.ts:1321-1331`)
- **[A5-10] Point/instance/mesh policy.** Unfocused asteroids hysteretically switch points→instances at 2 px apparent diameter and instances→points below 1.5 px; only the focused asteroid may switch to a dedicated mesh, entering at 32 px and exiting below 28 px. (`src/v2/render/asteroid-renderer.ts:27-34`; `src/v2/render/asteroid-renderer.ts:88-113`)
- **[A5-11] Focused mesh.** The dedicated focused representation is a 24×24 sphere with Lambert material, positioned from the same world-position calculation and scaled to estimated physical radius; it is hidden whenever focused render mode is not `mesh`. (`src/v2/render/asteroid-renderer.ts:207-214`; `src/v2/render/asteroid-renderer.ts:404-455`)
- **[A5-12] Orbit rendering.** The automatic batched orbit layer contains asteroids that pass the `hasOrbitLine` policy; its opacity fades only when the focused asteroid is in mesh mode from 32 px toward zero at 100 px, while a separate focused-orbit line is created for the focused asteroid and remains visible. (`src/v2/render/asteroid-renderer.ts:31-32`; `src/v2/render/asteroid-renderer.ts:161-165`; `src/v2/render/asteroid-renderer.ts:458-487`)
- **[A5-13] Focus transition/follow.** A focus change captures the old anchor and smoothstep-interpolates it toward the target's position over 650 ms; after transition, each update resolves the target anchor at current time, and the camera remains local to that floating origin looking at `(0,0,0)`. (`src/v2/app/solar-system/runtime.ts:77`; `src/v2/app/solar-system/runtime.ts:1338-1369`; `src/v2/app/solar-system/runtime.ts:1372-1410`; `src/v2/app/solar-system/runtime.ts:1493-1494`)
- **[A5-14] Orbit tween.** The `t` preset separately interpolates radius/polar/azimuth with cubic ease-out for 1,000 ms; pointer/wheel controls are locked during it, while handled time/focus keys cancel it. (`src/v2/render/camera-tween.ts:22-42`; `src/v2/app/solar-system/runtime.ts:354-359`; `src/v2/app/solar-system/runtime.ts:1805-1873`)
- **[A5-15] Camera planes.** Initial perspective camera values are FOV 45°, near 1 m, and far 150 AU; on every visible update near becomes `max(1, orbitRadius×1e-4)` and far becomes `max(orbitRadius×10, 5e8)`. (`src/v2/app/solar-system/runtime.ts:71-72`; `src/v2/app/solar-system/runtime.ts:968-973`; `src/v2/app/solar-system/runtime.ts:1425-1431`)
- **[A5-16] Log-depth setting.** The solar-system renderer constructor passes `{ antialias: true }` only; there is no `logarithmicDepthBuffer` setting in the viewer's renderer construction. (`src/v2/app/solar-system/runtime.ts:853-858`)
- **[A5-17] Facts-only boundary.** Current repository state parks focus-transition clipping, point-pop, and picking-depth issues but does not record a diagnosis for focused-asteroid flicker/drift; this document therefore makes none. (`STATUS.md:107-118`; `1a1df13`)

## Audit accounting

- **Item count:** 155 labeled inventory items (`A1-*` through `A5-*`) against `1a1df13`.
- **UNKNOWN count:** 0; no unverifiable capability claim was retained against `1a1df13`.
- **Circuit-breaker cuts:** 1 — individual enumeration of 41,906 catalog members was cut to decision-relevant catalog behavior and the source-backed total. (`src/v2/boundary/slice9-nea-catalog.ts:20`; `1a1df13`)
- **Surprises:** L9 said `k` was unbound at its audited HEAD, but current source binds lowercase `k` to Titan; and the viewer can enter a static scrubbed state but still has no pause-at-current-time control. (`tools/overnight-2026-08-05/L9_KEYBINDINGS.md:103-107`; `src/v2/app/solar-system/runtime.ts:150-176`; `src/v2/app/solar-system/runtime.ts:1535-1539`; `src/v2/app/solar-system/runtime.ts:1834-1836`)
