---
PROVENANCE (added 2026-08-04 — not part of the Perplexity answer)
Query: [QOL — QOL features + UX conventions for a 3D orbital/solar-system viewer]
Prompt source: [tools/slice21-research/literature/PERPLEXITY_ASTER_EXPLAINER_AND_QOL.md, QOL]
Fired: [2026-08-03] · standard Perplexity
Recovered from Perplexity thread history: 2026-08-04
  (transcript-side copy was lost — environment stored a pointer, not content)
Status: LEADS, not facts. verify-before-lock before any DEC / invariant /
  founding-doc use. Contradictions between follow-up levels are findings — log,
  don't resolve.
--- RAW PERPLEXITY ANSWER BELOW ---

The strongest pattern across successful 3D astronomy, orbital, and CAD tools is not “better camera math,” but **recoverability plus legibility**: they make movement modes visible, provide a constant way home, keep orientation anchored with a reference widget or grid, and treat labels/selection as a disambiguation system rather than simple text drawn near objects.[1][2][3][4] For your current state, the highest-value changes are: add pan, add a persistent home/reset affordance, surface shortcuts in-context, add a frame-of-reference widget, and make labels/selectability obey a strict priority model. Those are the patterns repeatedly visible in Blender, Fusion-style navigation bars, Stellarium, and Celestia, while “professional” tools mainly differ by exposing more explicit reference frames and overlays rather than inventing different UX primitives.[2][3][4][1]

## Camera recovery Well-regarded 3D tools almost always expose orbit, pan, and zoom as first-class visible controls, not just hidden mouse behavior; Blender documents all three explicitly and also exposes a navigation gizmo, while Fusion-style interfaces place orbit/pan/zoom/fit/home in a persistent navigation bar. Your no-pan camera is therefore below the normal affordance baseline for serious 3D tools, because users cannot reframe composition without changing target lock or zoom depth.[3][4] The standard “I’m lost” recovery stack is layered: “frame selected,” “frame all/fit,” and “home/default view.” Blender explicitly distinguishes “Frame Selected” from “Frame All,” and Fusion-style workflows include both Fit and Home; Celestia also has a literal “Go home (Sol)” concept. For your backlog, that maps cleanly to three separate actions: Recenter on selection, Show whole system, and Return to saved home view; bundling all recovery into one reset button is weaker because users lose the distinction between “find the thing” and “return to a known scene state.”[1][4][5][3] **Backlog items**
- Add mouse/touch pan with the same visual status as orbit/zoom. Small/isolated.[4][3]
- Add persistent Home button in the nav chrome. Small/isolated.[6][4]
- Add “Frame selected” and “Frame all” as separate commands/buttons. Medium, depending on bounding-volume plumbing.[3]
- Add user-saveable home/default camera state later, after basic reset exists. Medium.[6]

## Shortcut discovery Stellarium and Celestia both rely heavily on keyboard commands, but they also expose searchable menus, help windows, quick references, and explicit toggles for display layers like labels, grids, and orbits. The lesson is not “show all 20 shortcuts all the time”; it is “make the existence of accelerators visible through a small persistent hint plus a larger reference surface.”[1][2][5] The most standard unobtrusive pattern is a corner hint or help affordance that says “?” or “Press ? for shortcuts,” paired with tooltips that include shortcut badges and a full overlay/palette listing commands by category. That convention is especially aligned with your product because your current power-user features already exist but are undiscoverable, so the cheapest win is exposure rather than invention. A mixed-audience product should start with a tiny persistent hint, then let users open a categorized cheat sheet: Navigation, Focus, Time, View, Labels, and Recovery.[2][4][1] **Backlog items**
- Add persistent “?” button and “Press ? for shortcuts” microcopy until dismissed. Small/isolated.[2]
- Add full shortcut overlay grouped by task, not alphabetically. Small/isolated.[1]
- Show shortcut badges inside tooltips and menu items. Small/isolated.[4]
- Add first-session coach marks only for 3 core moves: orbit, pan, home. Medium, but still mostly UI-layer work.[3][4]

## Frame and scale cues Astronomy tools repeatedly expose explicit overlays for what world you are in: Celestia has grids, orbit toggles, markers, and field-of-view controls, while Stellarium exposes panning/zooming plus settings around view and marking layers. Professional mission viewers differ from education-facing tools mainly by making reference frames and guides more explicit, not less, because orientation ambiguity is costly.[1][2] For your viewer, the missing minimum set is: axis triad, reference plane, distance/scale disclosure, and camera/target state. Blender’s navigation gizmo shows the value of a persistent orientation object, and Celestia’s toggled grids show the value of optional reference layers when users need to reason about spatial context. Because Aster cares about scientific honesty, your “true scale” claim should not be a vague badge; it should be paired with a visible disclosure that bodies are rendered at physical size while tiny bodies may receive a minimum screen marker for visibility.[3][1] The standard treatment in mixed-fidelity tools is to separate physical truth from display aids: one line says what is physically accurate, another line says what is visually exaggerated or clamped. That is the missing pattern in your current viewer, and it matches your existing “honesty layer” principle exactly. A clean implementation is a status chip cluster like: “Distances: true scale,” “Body radii: true scale,” “Markers: min 6 px visibility aid,” “Frame: heliocentric ecliptic,” “Up: +Z ecliptic north.”[1] **Backlog items**
- Add axis triad/navigation gizmo in a corner. Small/isolated.[3]
- Add optional ecliptic plane or heliocentric reference grid toggle. Medium.[1]
- Add scale/status chips disclosing true scale vs visibility exaggeration. Small/isolated.
- Add target/frame readout in HUD: target, distance, frame, simulation time. Medium.[1]

## Labels and selection Celestia’s display model strongly suggests labels, markers, grids, and object classes should be independently toggleable because labels are not just annotation; they are a separate visual layer with their own clutter budget. Your recent fix for label-on-marker occlusion points to a broader rule used implicitly in good viewers: labels should anchor to objects, but never cover the object core, and should yield under crowding.[1][5] The best-practice label stack for dense orbital scenes is:
- Screen-space offset labels, not centered on the marker.
- Leader line or subtle tether when offset becomes non-obvious.
- Priority tiers, so selected/hovered/major bodies win.
- Collision avoidance, fade, or suppression for lower-priority labels.
- Separate toggles by class: planets, moons, asteroids, spacecraft, annotations.[5][1] Selection should follow the same priority logic. In tools with dense overlays, the clicked object is usually not “nearest rendered primitive” but “highest-priority eligible target within a hit aperture.” For your case, clicking near a labeled planet should strongly prefer: selected label’s owner, then major body marker, then hovered orbit/path, then minor-body points; otherwise users experience the scene as hostile because semantic intent loses to point density.[3][1] A strong click model for your viewer would be: 1. If cursor intersects a visible label hitbox, select that label’s owner. 2. Else choose highest semantic rank within an aperture, not smallest world-distance. 3. Bias by apparent screen size and current focus context. 4. If multiple candidates remain, show a tiny disambiguation picker near cursor.[1][3] **Backlog items**
- Offset labels with radial placement and no-overlap padding around marker core. Small/isolated.[1]
- Add label collision suppression and semantic priority tiers. Medium.[1]
- Add click-priority model favoring label owner and major bodies over dense points. Medium.
- Add cursor-near ambiguity popover when candidates are close. Medium to large, depending on picking architecture.[3]

## Mixed-audience mode split Education-facing planetarium tools tend to expose more obvious named toggles and approachable discovery surfaces, while mission/pro CAD tools assume terminology literacy and lean harder on frames, fit commands, and visible orientation controls. Because your audience is mixed, the right pattern is not one compromise UI but a layered UI: approachable defaults with progressively exposable engineering detail.[1][2][3][4] That means defaults such as Home, Frame Selected, axis triad, a scale honesty badge, and visible Labels/Orbits/Grid toggles should always be present, while advanced frame controls, fidelity disclosures, and dense shortcut sets can live behind expandable panels. This preserves Aster’s engineering character without forcing novice users to infer invisible capabilities from memory.[4][1]

## Follow-up chain

###
1) What is the standard persistent shortcut hint? The common convention is a low-noise persistent hint in a corner or toolbar, usually “?” or “Press ? for help,” backed by a fuller overlay or searchable command surface. Stellarium and Celestia show that shortcut-heavy systems still expose explicit help/reference surfaces rather than expecting pure memorization.[1][2]

#### 1.1) What should the overlay contain? It should be task-grouped and action-oriented: Navigate, Focus, Time, Display, Recover, not “A–Z keys.” Celestia’s quick-reference structure is effectively grouped this way already, which makes it a better model than a raw key dump.[1]

##### 1.1.1) What should be visible even when the overlay is closed? Only the smallest discovery breadcrumb: a “?” button, one-line hint, and shortcut badges in relevant tooltips. Everything else can stay hidden until summoned, because permanent giant legends create clutter and stop being read.[2][4]

###
2) How should true scale vs visibility exaggeration be disclosed? The standard pattern in scientifically grounded viewers is to separate simulation truth from display aids, using toggles or HUD text for layers such as labels, markers, grids, and orbits rather than pretending every pixel is physically literal. Celestia’s independent display toggles are evidence that these visual aids are treated as separate user-controlled layers.[1][5]

#### 2.1) What exact language should you use? Use explicit declarative language, not marketing phrasing: “Orbital distances: true scale,” “Body radii: true scale,” “Small-body markers enlarged for visibility.” That matches your honesty-layer principle and makes the engineering choice legible to non-experts.

##### 2.1.1) Should this be a modal explanation or always-on? Always-on as compact status chips, with a tooltip or details drawer for explanation. The chip is the important part because users cannot interpret a one-time onboarding note after they start zooming around.

###
3) What is the standard “I’m lost” pattern? The pattern is a stack, not a single reset: Home, Fit All, Frame Selected, and sometimes named preset views. Blender and Fusion-style tools both encode this distinction, and Celestia adds “go home” at the domain level.[1][3][4]

#### 3.1) Which one should be primary? For your tool, primary should be Home plus Frame Selected. “Fit All” is useful but less frequent in a solar-system scene because the whole system may be too large to be meaningful; Home and selection recentering are the faster cognitive recovery tools.[3][1]

##### 3.1.1) What should Home actually do? It should restore a saved canonical state: target = Sun or current primary context, camera orientation = canonical ecliptic view, zoom = meaningful overview, time = unchanged unless user explicitly chooses “Now.” Recovery should not unexpectedly mutate simulation time.[1]

###
4) Is there a common convention for click priority in dense overlap? Yes: semantic ranking beats raw geometry proximity whenever labels or annotations are involved. The presence of independent label/marker classes in astronomy tools implies those layers have meaning beyond pure rendering, so selection should respect that semantic layering.[1][5]

#### 4.1) What ranking is most defensible for your viewer? A reasonable default is: selected item’s descendants/metadata targets, explicit label owners, major bodies, mission objects, orbit curves, then minor-body points. That hierarchy matches user intent better than a flat nearest-point algorithm in a dense asteroid field.

##### 4.1.1) When should you show a disambiguation picker? Only when top candidates are close in score and the system lacks confidence. This keeps normal picking fast while still preventing “I clicked Earth and got asteroid 2001 AB” failures.

## Architecture sizing | Feature | Effort | Why |
|---|---|---| | Home button | Small | Pure UI plus existing preset hookup. [4][6] |
| “?” shortcut overlay | Small | UI-layer only, no scene architecture shift. [2][1] |
| Tooltip shortcut badges | Small | Metadata/rendering only. [4] |
| Axis triad | Small | Independent overlay widget. [3] |
| Scale honesty chips | Small | HUD text plus existing state exposure. |
| Pan capability | Medium | Input model and camera rig change, but conceptually standard. [3][4] |
| Frame Selected / Fit All | Medium | Needs scene bounds and target-aware camera solve. [3] |
| Label offset and occlusion rules | Medium | Screen-space layout pass. [1] |
| Click-priority model | Medium | Picking pipeline needs semantic scoring. |
| Disambiguation picker | Medium-Large | New interaction layer plus candidate ranking UI. |
| Ecliptic plane/grid | Medium | New render layer, toggles, and frame plumbing. [1] |
| Layered novice/pro modes | Large | Information architecture and state management, not just components. | My prioritization would be: 1. Home + Frame Selected + pan.[3][4] 2. “?” overlay + tooltip shortcut badges.[1][2] 3. Axis triad + scale honesty chips.[3] 4. Label offset/collision + click-priority model.[1] 5. Reference grid/frame panel and audience-mode layering.[1] Would you like a second pass that turns this into a concrete implementation spec with UI copy, component states, and event/picking logic for each backlog item?

Sources
[1] Quick Control References
- Celestia User Manual https://celestia360.wordpress.com/quick-control-references/
[2] Stellarium User Guide http://www.astronomia.edu.uy/CTE2/stellarium_user_guide-0.10.2-1.pdf
[3] Navigation — Blender Manual https://docs.blender.org/manual/de/2.81/editors/3dview/navigate/navigation.html
[4] Navigation and display settings https://files.upskill-dev.autodesk.com/public/introduction-to-cad-learn-fusion-360-in-90-minutes/211004_SBS_M4-01_Navigation-and-display-settings.pdf
[5] Celestia User's Guide https://www.centrovisite.ira.inaf.it/riservato/CelestiaUsersGuide-1.3.2.pdf
[6] Fusion 360 Views - (Use The Viewcube) https://www.youtube.com/watch?v=4zwRtw9U2y4
[7] Using Stellarium to Explore the Sky https://www.youtube.com/watch?v=x9cSpKieSkQ
[8] Shortcut Key
- Celestia Wiki
- Fandom https://celestia.fandom.com/wiki/Shortcut_Key
[9] Keyboard mapping and other useful shortcuts https://www.reddit.com/r/KerbalSpaceProgram/comments/1qytkl/keyboard_mapping_and_other_useful_shortcuts/
[10] AST 101: Stellarium Tutorial https://natsci.parkland.edu/ast/101/101stellarium_tutorial.html
[11] Stellarium User Guide 0.21.3 1 | PDF | Astronomy https://www.scribd.com/document/551895475/Stellarium-User-Guide-0-21-3-1
[12] Kerbal Space Program for Dummies: How to Orbit https://www.youtube.com/watch?v=gO65v3S7Tgo [13] user guide https://stellarium.org/guide/
[14] Add Convenient Shortcuts for 3D Navigation (Orbit, Pan ... https://forums.sketchup.com/t/feature-request-add-convenient-shortcuts-for-3d-navigation-orbit-pan-and-zoom/322083
[15] Celestia User's Guide: For Version 161 | PDF https://www.scribd.com/document/561292129/Celestia161-UsersGuide
[16] Is anyone using STK or any other orbit-generating software? https://www.facebook.com/groups/spacehipsters/posts/8164193856958759/
[17] Stellarium Tutorial On Deep-Sky Star-Hopping https://www.youtube.com/watch?v=RIMJlCESq2g
[18] Celestia Guide https://celestiaproject.space/docs/CelestiaGuide.html
[19] Fusion 360 Navigation
- Pan, Zoom, Rotate https://www.youtube.com/watch?v=a5L55B5OCQM
[20] The ESSENTIALS of Navigation in SketchUp (Orbit, Pan ... https://www.youtube.com/watch?v=977h8Oa3c7A
[21] BLENDER BASICS 2: Navigating the 3D View https://www.youtube.com/watch?v=RqfSkU-Hp1A
[22] The Zoom/Orbit/Pan controls are driving me insane (4.2 / ... https://www.reddit.com/r/blenderhelp/comments/1e6ynkd/the_zoomorbitpan_controls_are_driving_me_insane/
[23] Viewing a Model https://help.sketchup.com/en/sketchup/viewing-model
[24] Beginner's Guide to Blender Viewport Navigation https://vagon.io/blog/guide-to-blender-viewport-navigation
[25] How To Use View Cube In Fusion 360 (2026 Easy Guide) https://www.youtube.com/watch?v=T_0C0zWYtGM
[26] Orbit, pan, and zoom, oh my! Here's a ten minute deep dive ... https://www.linkedin.com/posts/sketchup_orbit-pan-and-zoom-oh-my-heres-a-ten-activity-7423070005090709504-QfFo
[27] Blender Basics Tutorial
- Viewport Navigation Keyboard and ... https://www.youtube.com/watch?v=DVDdx3pgVBM
[28] Issue with ViewCube and Zoom Behavior in Fusion https://forums.autodesk.com/t5/fusion-support-forum/issue-with-viewcube-and-zoom-behavior-in-fusion/td-p/13228538
[29] Navigating SketchUp https://condoctools.com/lessons/navigating-sketchup/
[30] Blender 2.7 Tutorial #1 : Navigating in 3D & The Basics #b3d https://www.youtube.com/watch?v=zHdTUJBs7so
