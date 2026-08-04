# CLOME GATE REPORT — F1c revJ console/HUD re-gate
# INTAKE PROVENANCE (added at recovery, 2026-08-04): Claude-in-Chrome verification pass, 2026-08-03 ~05:29 UTC, localhost:5173 solar-system view. Source PDF: Untitled_document__10_.pdf (sha256:f1553ab75d20dc49). P0 gate evidence.
# Body below is verbatim pdftotext -layout extraction of the source PDF.
# Treat per recursive-research-elicitation: LEADS, not facts; verify-before-lock.
# ---------------------------------------------------------------------------

Setup note: I could not open Chrome's own DevTools window, but I attached the console reader
to the tab and cleared it BEFORE issuing the page load, so all load-time console output was
captured. The viewport was 735x967 CSS px; a "NEA Catalog" sidebar occupies the left ~400
CSS px and overlays the 3D canvas, which is full-window.

(a) On the very first load the HUD read:​
 2026 Aug 03 05:29 TDB​
 2026-08-03 05:28 UTC​
 On the instrumented reload (the session I kept, with console capture active) the same HUD
read:​
 2026 Aug 03 05:30 TDB​
 2026-08-03 05:29 UTC​
 Those are the only two lines in that HUD box. Directly below it, in a separate box, were:​
 Ephemeris coverage 2026-07-18 – 2026-10-16 TDB​
 LIVE

(b) CANNOT DETERMINE — no Moon was observable. The scene's DOM label set contained
exactly seven entries: Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn. There was no "Moon"
or "Luna" element anywhere in the page at any point. Additionally, the projected screen
positions of the bodies placed most of them outside the canvas: Sun at CSS (-112, 899),
Mercury (-74, 887), Venus (-136, 1005), Earth (-18, 1013), Mars (13, 718), Jupiter (-595, 263),
Saturn (1227, 673) in a 735x967 viewport, so Earth itself was off-screen (left and below the
bottom edge). A zoomed inspection of the exposed canvas area showed only starfield, no
planet disks. Mouse drag on the canvas and mouse-wheel scroll on the canvas produced no
change in any label position, so I could not pan or zoom the view to bring Earth on-screen. No
Earth-Moon distance text appears anywhere in the page text. I could not click or hover the Moon
because no Moon exists in the scene, so no data panel could be produced. I make no judgment
about the expected 135-degree / 378,500 km / north-of-ecliptic values.

(c) The displayed time did advance on its own with no input. At the start of the wait the HUD
read:​
 2026 Aug 03 05:31 TDB​
 2026-08-03 05:30 UTC​
 After roughly 70 seconds of no interaction it read:​
 2026 Aug 03 05:33 TDB​
 2026-08-03 05:32 UTC

(d) After pressing Right Arrow three times:​
 2026 Aug 03 07:04 TDB​
 2026-08-03 07:03 UTC​
 After then pressing Left Arrow three times:​
 2026 Aug 03 05:34 TDB​
 2026-08-03 05:33 UTC​
 After pressing Home:​
 2026 Jul 18 00:00 TDB​
 2026-07-17 23:58 UTC​
 After pressing End:​
 2026 Oct 16 00:00 TDB​
 2026-10-15 23:58 UTC​
 At Home the TDB line shows calendar date Jul 18 while the UTC line shows Jul 17 —
DIFFERENT calendar dates. At End the TDB line shows Oct 16 while the UTC line shows Oct
15 — DIFFERENT calendar dates. After pressing End I waited 30 seconds without input; the
HUD still read exactly "2026 Oct 16 00:00 TDB" / "2026-10-15 23:58 UTC", i.e. the time stayed
fixed and did not continue advancing.

(e) The line is:​
 Ephemeris coverage 2026-07-18 – 2026-10-16 TDB​
 (the separator between the two dates is an en dash). It was visible on load and it was still
visible after all the key presses in (d), unchanged. Note that its left portion is partly hidden
behind the catalog sidebar on screen; the reading above is taken from the page's text content,
and the visible-on-screen fragment was "emeris coverage 2026-07-18 – 2026-10-16 TDB".

(e2) On load the status indicator read:​
 LIVE​
 After pressing End it read:​
 SCRUBBED — press Shift+N for now​
 (on screen only the fragment "UBBED — press Shift+N for now" is visible, the start being
behind the sidebar).​
 I then sent Shift+N as a modifier keypress: nothing changed — the indicator still read
"SCRUBBED — press Shift+N for now" and the HUD still read "2026 Oct 16 00:00 TDB" /
"2026-10-15 23:58 UTC". I then sent an uppercase "N" as typed text, and that did take effect:
the indicator changed to "LIVE" and the HUD read:​
 2026 Aug 03 05:30 TDB​
 2026-08-03 05:29 UTC​
 At that same moment the browser's own clock (new Date().toISOString()) read
2026-08-03T05:35:02.736Z, i.e. the restored "now" was about six minutes behind actual current
time. The 3D view also changed at this point: a large dark disc/limb with a thin bright edge
appeared in the canvas, and all body labels except Saturn vanished from the DOM, with
Saturn's label projected to CSS (1487, -3201).​
 I then pressed lowercase "n" by itself. The camera did NOT visibly move — the two
screenshots before and after are indistinguishable, and no small moon was brought into focus.
No data or focus panel appeared. The HUD did not jump: it went from "2026 Aug 03 05:30 TDB"
/ "2026-08-03 05:29 UTC" to "2026 Aug 03 05:31 TDB" / "2026-08-03 05:29 UTC", consistent
with ordinary one-minute ticking rather than a jump.

(e3) I never saw any warning text about being outside coverage, and never saw any text about
a current time not being available, at any point in the session. Stating that explicitly: no such text
appeared.
(f) Text labels do exist next to bodies. Early in the session, with the default view, the labels
"Mars" and "Mercury" were rendered visibly on screen (faintly, drawn over the sidebar area); the
remaining labels were projected outside the viewport as listed in (b). There is a control labelled
"Labels on" in the Display section. Clicking it changed its text to "Labels off", and clicking again
changed it back to "Labels on"; the DOM check showed that in the "Labels off" state all seven
body labels had zero-size bounding boxes, and in the "Labels on" state Saturn's label had a real
bounding box again. I CANNOT DETERMINE visually whether labels disappear and reappear
on screen, because by the time I exercised the toggle the camera was in the post-"N" close-up
state where no body label was on screen in either position of the toggle.

(g) Console messages logged during the session, in full:​
 [vite] connecting...​
 [vite] connected.​
 Both were DEBUG level, from http://localhost:5173/asteroid-mining-planner/@vite/client (lines
494:8 and 617:14). There were no warnings and no errors. No message contained the word
"invariant".

(h) Navigation timing for the instrumented load reports domContentLoadedEventEnd at 113 ms
and loadEventEnd at 115 ms, but first-paint and first-contentful-paint both at 2548 ms. So there
was a blank period of roughly 2.5 seconds before anything was painted; after that the starfield
and HUD were present in my first screenshot. Between that first screenshot and the next one
the sidebar changed from "Loading screening data..." to "NEA Catalog (41,906)", a gap of
roughly a second. I observed no jank or stutter after the initial blank period, though I note the 3D
scene never showed any planet body in the visible area, only stars.
