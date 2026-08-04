# CLOME EVALUATION — First-time-visitor UX pass, solar-system view
# INTAKE PROVENANCE (added at recovery, 2026-08-04): Claude-in-Chrome single-pass evaluation, 2026-08-03, localhost:5173. Source PDF: Untitled_document__11_.pdf (sha256:dbeab87d4828f1f9). Convergence partner of the (lost-verbatim) QOL Perplexity result; distillate of both = SLICE21_QOL_BACKLOG_TRIAGED.md.
# Body below is verbatim pdftotext -layout extraction of the source PDF.
# Treat per recursive-research-elicitation: LEADS, not facts; verify-before-lock.
# ---------------------------------------------------------------------------

EVALUATION OF http://localhost:5173/asteroid-mining-planner/v2/solar-system/ — single pass,
first-time-visitor perspective. Viewport 1114x765 (initial capture 1214x815), devicePixelRatio 2.

   1.​ INITIAL FRAME

DESCRIPTION: On load, the right ~64% of the window (x≈400 to 1114) is the 3D canvas. It
shows a starfield and nothing else. No Sun, no planets, no orbit lines, no Milky Way band, no
grid. I waited 3 seconds and re-captured; identical. I zoomed into four separate regions of the
canvas at 2x and found only point stars. The canvas element is full-window (1214x815 CSS,
2428x1630 backing store), so the left catalog panel is drawn over the top of it. I queried the
DOM positions of the in-scene body labels, which do exist in the DOM ("Sun", "Mercury",
"Venus", "Earth", "Mars", "Jupiter", "Saturn"). At load their screen positions were: Sun at (200,
756), Mercury (231, 746), Mars (305, 604) — all three behind the opaque left panel; Venus (178,
845) and Earth (279, 852) — both below the bottom edge of the window; Jupiter (-209, 220) —
off the left edge entirely; Saturn (1327, 566) — off the right edge entirely. So the entire solar
system is either occluded by the sidebar or outside the viewport at t=0. The Sun is not centered;
it is off-canvas-left and below the fold. Camera attitude is an oblique view (once rotated, the
orbits render as tilted ellipses, not concentric circles), but you cannot tell that from the default
frame because nothing is visible.

ASSESSMENT: This is the worst possible first frame. A technical reviewer opening this URL
sees a black rectangle with stars and a spreadsheet next to it. The framing is not "a bad choice"
— it is broken. Whatever fit-to-view logic exists is computing bounds against the full window
rather than the unobstructed canvas region, and is not centering on the Sun or on the
barycentre of the drawn set. Nothing is "cut off at the edges"; everything is cut off. Zero seconds
of the sixty-second budget produce a solar system.

   2.​ LEGIBILITY AT REST

DESCRIPTION: Without interacting you cannot tell what you are looking at. There is no title in
the view, no legend, no key. The only cues that this is a solar-system view are the page title in
the tab bar and the two text boxes at top right. Orbits are drawn — but I only established that
after rotating the camera, and even then they render as very dark grey/desaturated arcs that
required a 2x zoom to see at all against the black background. Bodies are not distinguishable
from background stars because bodies are not visible at all at system scale. Two of the three
faint things I could find in the panel area at load were the "Sun" and "Mercury" labels bleeding
through the sidebar: at (100,670)-(400,764) magnified, the words "Mercury" and "Sun" are
legibly visible as ghosted grey text sitting behind the semi-transparent catalog list, overlapping
the row "101869 (1999 MM) / APO / LOW C3 / C3 0.106 km²/s²" and the footer. Unexplained on
screen: "PC" (a button on every catalog row; its accessible name is "Open porkchop view", but
the visible glyph is just "PC"), "H ↑" and "H ↓", "ATE / APO / AMO / IEO", "C3", "TDB", "LIVE",
and "Patched-conic screen".
ASSESSMENT: Nothing here is legible at rest. The label-through-panel bleed is a straight
layering bug — HTML labels are being positioned in window space with no clipping to the
canvas viewport and no z-order below the sidebar, and they are not culled when occluded. It
looks unfinished. The orbit line contrast is far too low; on a reviewer's laptop in a lit room those
arcs will be invisible. The jargon is defensible for the stated audience (C3, TDB,
APO/AMO/ATE/IEO are standard), but "PC" as a bare two-letter button on 41,906 rows is a poor
abbreviation choice, and "H ↑ / H ↓" has no expansion anywhere on screen.

   3.​ VISUAL QUALITY

DESCRIPTION: Background reads as space: a dense, fine, slightly colour-varied starfield (I
could see faint blue and orange point tints at 2x). It is not a flat noise texture and it is not
obviously procedural. Lighting on bodies: after zooming out hard I finally caught a body at (545,
380) rendered as a sphere with a hard terminator and a thin lit crescent — the lit limb is a warm
grey/tan, the night side is pure black with no ambient fill and no rim light. Magnified, it
unambiguously reads as a sphere, not a disc. Earlier, immediately after a click-to-focus, a large
tan/orange banded sphere with a soft terminator appeared at roughly (660, 650) filling ~90px; it
was gone in the next capture two seconds later with the camera stationary. The green NEA
point cloud renders as thousands of soft green blobs with a bloom-like falloff. There is no visible
Sun glare, corona, or light source marker anywhere.

ASSESSMENT: The individual shading model is competent — the terminator and the crescent
are physically sensible and the spheres do not read as billboards. But the scene is unusable
because the night side is rendered at zero luminance with no fallback. At solar-system scale, a
planet is one to two pixels; from an oblique camera most of those pixels are night side; the
result is that the bodies are literally black-on-black. There is no minimum-screen-size point
sprite, no emissive dot, no halo — all the standard tricks that make an orbital viewer readable
are absent. The green NEA cloud is the only thing with any visual punch, and its bloom is heavy
enough to look like a game particle effect rather than an instrument. Overall the scene reads as
a default three.js render that nobody art-directed for the actual viewing distance, not as a
deliberately designed instrument.

   4.​ SCALE AND PROPORTION

DESCRIPTION: When I zoomed out far enough to get Mercury through Saturn in frame, the
label spread was consistent with true orbital proportions — Saturn's label sat far outside the
tight cluster of Mercury/Venus/Earth/Mars labels, which were bunched into roughly a 60x100
pixel area near (480, 550). Body sizes: at that scale no body rendered a visible pixel at all.
When zoomed in to a single body, it rendered at a plausible sphere size. I found no text
anywhere on screen stating whether body radii are exaggerated, true-to-scale, or scaled by any
factor. No AU or km scale bar exists.

ASSESSMENT: Orbital distances appear to be true scale, which is correct for an engineering
tool and is a point in its favour. Body sizes appear to be true scale as well, which is the direct
cause of the invisibility problem — at true scale the inner planets are sub-pixel from any camera
that frames the system. The tool has chosen physical fidelity over legibility and disclosed neither
choice. If sizes are exaggerated at close range, that is also undisclosed. Either way there is
nothing on screen a reviewer could cite to know what they are looking at. "Comically oversized"
is not the failure mode here; "invisibly small" is, universally.

   5.​ INTERACTION

DESCRIPTION: Left-drag from (750,400) to (900,330) rotated the camera about the scene;
motion was smooth with no stutter, and it immediately brought Mars, Mercury, Venus and Earth
labels into the visible area at lower left along with the faint orbit arcs. Scroll wheel up 5 ticks at
(700,500) zoomed in and pushed every body and every label off screen — the frame went back
to pure starfield with nothing to navigate by. Scroll wheel down 10 ticks zoomed out and brought
Mars, Mercury, Venus, Earth and Saturn labels back; Jupiter's label did not reappear. A further
20 ticks of zoom-out revealed one unlabelled crescent body. Zoom appears to have no useful
limits in either direction and no re-framing assist. Clicking at (508, 570), on the "Earth" label, did
not select Earth — it selected a nearby asteroid: a label "2019 UJ15" appeared in the scene and
a readout "2019 UJ15 · APO" appeared at top right. The camera then flew somewhere inside
the NEA cloud; all seven planet labels collapsed to a bounding rect of 0,0 (i.e. culled/behind
camera). A green orbit line for the selected object appeared. Clicking empty space deselected. I
found no way to return to the starting view: no reset button, and "r" and Escape did nothing to
the camera. Pan (right-drag / middle-drag / shift-drag) — CANNOT DETERMINE; not tested.

ASSESSMENT: Rotation quality is genuinely good — smooth, correct sensitivity, no jerk.
Everything else about the navigation is hostile. Zoom is unbounded and unassisted, so within
two scroll gestures a first-time user is lost in empty black space with no landmark and no
recovery. Click-to-select has no tolerance model that prioritises named planets over a
41,906-point cloud, so clicking directly on the word "Earth" selects an asteroid instead. There is
no home/reset affordance of any kind, which for a viewer that can strand you is a serious
omission, not a nicety. Focus-on-click flies the camera without any visible transition cue, so the
user does not understand that they moved.

   6.​ CONTROLS AND AFFORDANCES

DESCRIPTION: Every visible control and every piece of instructional text, verbatim. Left panel,
top to bottom: "NEA Catalog (41,906)"; a button reading "overlay" (accessible name "Switch to
overlay"); a text field with placeholder "Search designation or name…"; buttons "ALL", "ATE",
"APO", "AMO", "IEO"; the word "Display"; buttons "Starfield on" and "Labels on"; the label
"Starfield brightness" with value "100%" and a range slider; the word "Sort:" with buttons "A-Z",
"Z-A", "Class", "H ↑", "H ↓". Catalog rows, each with a designation, a class code, a badge and a
"PC" button, e.g. "100004 (1983 VA)" / "APO" / "HIGH C3" / "C3 55.5 km²/s²" / "PC"; "101955
Bennu (1999 RQ36)" / "APO" / "LOW C3" / "C3 0.510 km²/s²"; "103P/Hartley 2" / "JFC" / "LOW
C3" / "C3 9.483 km²/s²". Footer: "Patched-conic screen · 2026–2040", "· click for details", "About
this tool" (a link to ../about/). Top right of the canvas, box one: "2026 Aug 03 05:30 TDB" and
"2026-08-03 05:29 UTC". Box two: "Ephemeris coverage 2026-07-18 – 2026-10-16 TDB" and
"LIVE". A selection readout appears above box one when something is selected: "2019 UJ15 ·
APO". In-scene text labels: "Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", plus
the selected object's designation.

Capabilities I found that have NO visible affordance whatsoever: camera rotate by left-drag;
camera zoom by scroll wheel; click-to-select-and-fly-to a body; the "Home" key, which jumps
simulation time to the start of ephemeris coverage and switches the state readout from "LIVE" to
"SCRUBBED — press Shift+N for now"; the Right arrow key, which steps simulation time
forward by 30 minutes (05:30 → 06:00 pattern confirmed as 00:00 → 00:30); and Shift+N, which
returns to live time. Nothing in the visible UI hints that the keyboard does anything at all. The
Shift+N hint only appears after you have already stumbled into scrubbed mode.

ASSESSMENT: The entire time-scrubbing subsystem — arguably the most important capability
in a mission-planning viewer, and clearly implemented — is invisible. There is no play/pause, no
timeline, no date picker, no "?" help, no keyboard-shortcut list. A reviewer with sixty seconds will
conclude the view is a static render, because from the visible UI it is one. The one hint that
exists, "SCRUBBED — press Shift+N for now", is only shown as a consequence of an action
you had no way to know you could take. "· click for details" in the footer is instructional text with
no indication of what to click. The "overlay" button's visible label communicates nothing about
what it switches to.

   7.​ INFORMATION DISPLAY

DESCRIPTION: Every number, date and unit on screen, verbatim, with a judgment on each.

"NEA Catalog (41,906)" — count of near-Earth asteroids in the catalog. Meaning clear; no units
needed. Fine.

"2026 Aug 03 05:30 TDB" — clear as a date/time; "TDB" is Barycentric Dynamical Time,
standard in the field but unexpanded and unlinked. Acceptable for the stated audience.

"2026-08-03 05:29 UTC" — clear. The pairing with the TDB line is a good touch; the ~69-second
offset is correct and quietly signals the author knows what they are doing.

"Ephemeris coverage 2026-07-18 – 2026-10-16 TDB" — clear, and a genuinely valuable
disclosure of data validity bounds.

"LIVE" / "SCRUBBED — press Shift+N for now" — meaning inferable only after you have
caused the state change. "LIVE" alone is ambiguous on first read (live data? live clock?).

"Starfield brightness" "100%" — clear.

"Sort: A-Z / Z-A / Class / H ↑ / H ↓" — "H" is absolute magnitude. Not explained anywhere on
screen. Not clear without prior knowledge.

"C3 55.5 km²/s²", "C3 2.234 km²/s²", "C3 0.106 km²/s²", "C3 19.2 km²/s²", "C3 0.510 km²/s²", "C3
9.483 km²/s²" — units are stated and correct, which is good. "C3" itself (characteristic energy) is
unexpanded. Note the inconsistent significant figures within one column: "55.5", "2.234", "19.2",
"0.106", "8.252". Some values carry four sig figs and some three.

"HIGH C3" / "LOW C3" — the threshold separating them is never stated. "55.5" is HIGH and
"19.2" is LOW; the cutoff is somewhere in between and undisclosed.

"APO", "AMO", "ATE", "IEO", "JFC" — orbit class codes. Standard, but unexpanded on screen.

"Patched-conic screen · 2026–2040" — the year range is clear as a span; what "screen" means
(a filtering pass) and how 2026–2040 relates to the ephemeris coverage of 2026-07-18 –
2026-10-16 is not clear and the two ranges appear to contradict each other.

ASSESSMENT: The numeric hygiene is the strongest technical signal in the whole page — real
units, TDB/UTC separation, explicit coverage window. It is undermined by the inconsistent sig
figs, the undisclosed HIGH/LOW C3 threshold, and the unexplained conflict between a
"2026–2040" screening range and a three-month ephemeris window. A reviewer who reads
carefully will spot that contradiction and ask about it.

   8.​ ORIENTATION AND FRAME OF REFERENCE

DESCRIPTION: There is no axis triad, no compass, no ecliptic reference plane or grid, no scale
bar, no AU ruler, no north/vernal-equinox indicator, no camera-attitude readout, no "you are
here" inset. After I rotated the camera, nothing on screen told me what the new orientation was
relative to the ecliptic or to any inertial frame. There is also no statement anywhere of which
frame the view is in (ecliptic J2000, equatorial, heliocentric vs barycentric).

ASSESSMENT: For a mission-planning artifact this is a hard miss. A reviewer cannot evaluate a
trajectory plot without knowing the reference frame, and this view declines to state one. Once
rotated, the view is unmoored — there is no way to answer "which way is up" or "how far across
is this frame". A faint ecliptic grid plus a persistent frame label and scale bar would cost almost
nothing and would change how the whole thing reads.

   9.​ FIRST-MINUTE VERDICT

A technical reviewer will conclude, within about five seconds, that the 3D view is broken. They
open the URL and see a black panel with stars and no solar system. Most will not drag. Those
who do will find smooth camera control and then discover that the planets are still invisible, that
clicking the word "Earth" selects an asteroid, and that they cannot get back to where they
started. The catalog panel will read as competent and real — 41,906 objects, correct units,
sensible sort axes, a live TDB/UTC clock, a stated ephemeris validity window. The 3D view will
read as a prototype that was never checked at the default zoom on a normal-sized window.

The single strongest thing is the data layer's numeric discipline: the paired "2026 Aug 03 05:30
TDB" / "2026-08-03 05:29 UTC" readout with the correct offset, the explicit "Ephemeris
coverage 2026-07-18 – 2026-10-16 TDB", and C3 values carrying real units. That is the work of
someone who knows the domain, and it is the only thing that survives the first minute.
The single weakest thing is that the default camera frames nothing. Every body at load is behind
the sidebar, below the fold, or off the left or right edge. Everything else — the invisible bodies,
the missing reset, the hidden keyboard time controls — is downstream damage that a reviewer
never even reaches.

The one change that would most improve the first impression: fix the initial framing so that the
Sun through Mars fill the unobstructed canvas region (accounting for the 400px sidebar), and
give every body a minimum-screen-size emissive marker so it is never sub-pixel. Those two
together turn a black rectangle into a legible orbital diagram, and they are the precondition for
anything else on this list mattering.

   10.​ANYTHING BROKEN

DESCRIPTION and ASSESSMENT of each, marked.

DESCRIPTION: The "Sun" and "Mercury" labels render visibly through the semi-transparent
catalog sidebar at approximately (200, 756) and (231, 746), overlapping the row "101869 (1999
MM)" and the footer line. ASSESSMENT: Definite bug. Labels are positioned in window space,
are not clipped to the canvas region, and are not z-ordered beneath the UI chrome.

DESCRIPTION: Planet labels are drawn at negative x (Jupiter at x=-209) and beyond the right
edge (Saturn at x=1327) and below the bottom edge (Earth at y=852 in an 815px window)
rather than being culled. ASSESSMENT: Bug — off-screen labels are not being suppressed,
which is also why the initial fit computes a frame nobody can see.

DESCRIPTION: A large tan banded sphere appeared at roughly (660, 650) in one capture and
was completely absent from a capture taken two seconds later with the camera stationary and
no input in between. ASSESSMENT: A pop-in/pop-out flicker. Cause unclear — possibly an
LOD or frustum-culling threshold oscillating, possibly a near/far clip plane problem. Whatever it
is, a body blinking out of existence while the camera is still is wrong.

DESCRIPTION: A body visible at (545, 380) rendered with no label at all despite the "Labels on"
control being active, while other bodies at the same moment had labels. ASSESSMENT:
Inconsistent labelling; looks like a distance threshold that does not match what is actually on
screen.

DESCRIPTION: The footer reads "Patched-conic screen · 2026–2040· click for details" — there
is no space between "2040" and the following "·". ASSESSMENT: Text concatenation bug.
Small, but it is in the persistent chrome and it is exactly the kind of detail the target audience
notices.

DESCRIPTION: Orbit ellipses are drawn at a grey level that required 2x magnification to detect
at all against the black background. ASSESSMENT: Not necessarily a bug, but effectively
broken — the lines carry no information at the contrast they are drawn at.
DESCRIPTION: The green NEA point cloud renders with a wide soft bloom, producing large
fuzzy green blobs that occupy far more screen area than a point should. ASSESSMENT: Reads
as a game effect rather than a data plot, and at close range it visually swamps everything else
including the planets.

DESCRIPTION: Clicking at (508, 570), squarely on the "Earth" label, selected the asteroid
"2019 UJ15". ASSESSMENT: Hit-testing bug or missing priority ordering. Labels do not appear
to be click targets for their own bodies.

DESCRIPTION: Zooming in five scroll ticks removed every body and every label from the frame
with no recovery control present. ASSESSMENT: Not an artifact but a functional defect — the
viewer can strand the user with no way back.

DESCRIPTION: The console produced no messages matching
error/warn/WebGL/THREE/fail/undefined/NaN, though console capture began after page load.
ASSESSMENT: No evidence of JavaScript errors; the failures above appear to be design and
framing logic, not crashes. I did not test panning, did not click "overlay", "PC", "· click for details"
or "About this tool", and did not resize the window, so behaviour of those is CANNOT
DETERMINE.
