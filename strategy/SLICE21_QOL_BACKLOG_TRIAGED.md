# Slice 21 (Living Sky) — QOL backlog, triaged
Source: Perplexity research 2026-08-03, cross-checked against this session's
browser evidence (Clome general-looks pass, F1d/F1e recons, pixel analysis).

STATUS: LEADS, not locked facts. Nothing here enters a DEC or founding doc
without independent verification. Two items already carry known corrections
(see CORRECTIONS below) — treat every number in the source as suspect until
measured against the repo.

## CORRECTIONS to the source material

C1. Minimum marker size is 8 CSS px, NOT 6.
    Source proposed a chip reading "Markers: min 6 px visibility aid".
    Measured: DEFAULT_MIN_HALO_DIAMETER_PX = 8 (halos.ts:9); 6 px is the
    Saturn-moon base floor only (getMinimumHaloDiameterPx). Browser
    measurement 2026-08-03 confirmed 14-15 device px at dPR 2 = 7-7.5 CSS
    px rendered (shortfall is the radial texture's alpha decay at the rim).
    Any honesty chip must state the real number. INV-026 applies: numbers
    on a trust surface come from a verified source.

C2. Frame convention is UNVERIFIED.
    Source proposed "Frame: heliocentric ecliptic / Up: +Z ecliptic north".
    Neither the P0-R2 nor P0-F1d recon established which frame the view
    actually uses. TOP_DOWN_ECLIPTIC_NORMAL_ICRF appears in runtime.ts:447,
    which suggests ICRF is involved, but that is not the same claim.
    BLOCKED on a recon that reads the transform chain before any frame
    label ships.

C3. Source's competitive claims (prompt 1) are unverified.
    "Existing tools rarely run entirely client-side", "unusual for a single
    student developer", agency-tool characterizations — plausible but
    unsourced comparative superlatives. Do NOT put any of these in the
    README or About page without independent verification. The one solid
    named comparable is NASA's Eyes on Asteroids; verify its actual
    capabilities before positioning against it.

## Convergent evidence (two independent passes agreed)

These were flagged by BOTH the Clome general-looks pass (which had no
knowledge of the research) and the Perplexity research (which had no
knowledge of the codebase). Higher confidence than either alone:
- No pan is below the affordance baseline for serious 3D tools.
- No discoverable home/reset; twenty-plus keybindings with zero on-screen
  hint.
- Click priority: clicking a labeled planet selects a nearby asteroid
  point. (Observed concretely: clicking "Earth" selected 2019 UJ15.)
- Labels occluding markers. FIXED in P0-F1f (screen-space offset); the
  remaining half — collision suppression and priority tiers — is not.

## Backlog, ranked

Tier 1 — converts existing hidden capability into visible capability
  T1-1  Pan (mouse/touch), same visual status as orbit/zoom.  MEDIUM
        Input model + camera rig change. Currently target-locked orbiter
        with zoom along the camera-target line only; a user cannot reframe
        composition at all.
  T1-2  Persistent Home button in nav chrome.  SMALL
        't' and '=' presets already exist and work — this is exposure, not
        new capability.
  T1-3  "?" affordance + shortcut overlay, grouped by task (Navigate,
        Focus, Time, Display, Recover) not alphabetically.  SMALL
        The full key map is already documented in the P0-F1f report.
  T1-4  Shortcut badges in tooltips.  SMALL

Tier 2 — honesty surface (highest fit with Aster's existing thesis)
  T2-1  Scale/frame disclosure chips.  SMALL, but BLOCKED on C1 + C2.
        Separates physical truth from display aid, which is exactly the
        INV-025/INV-026 taxonomy already in use:
          "Orbital distances: true scale"
          "Body radii: true scale"
          "Small-body markers: enlarged to <N> px for visibility"
          "Frame: <verified frame>"
        Do not ship any line whose number or frame is unverified.
  T2-2  Axis triad / orientation gizmo.  SMALL
        Clome called the absence of any frame-of-reference indicator a
        hard miss for a mission-planning artifact.
  T2-3  Target/frame readout in HUD (target, distance, frame, sim time).
        MEDIUM

Tier 3 — selection and label correctness
  T3-1  Click-priority model: highest semantic rank within a hit aperture,
        not nearest primitive. Proposed ranking — label owner > major body
        > orbit curve > minor-body point.  MEDIUM
  T3-2  Label collision suppression + priority tiers.  MEDIUM
  T3-3  Disambiguation picker when candidates score close.  MEDIUM-LARGE
        Defer; only worth it after T3-1 is measured.

Tier 4 — larger scene work (natural Slice 21 core)
  T4-1  Ecliptic plane / heliocentric reference grid toggle.  MEDIUM
  T4-2  Frame Selected / Frame All as distinct commands.  MEDIUM
        Needs scene bounds + target-aware camera solve.
  T4-3  Layered novice/pro information architecture.  LARGE
        Probably not worth it; Aster's audience is uniformly technical.

## Also carried from the Clome general-looks pass (not in the research)
  - Orbit line contrast too low to read without magnification.
  - Green NEA cloud bloom reads as a game effect, not a data plot.
  - Footer concatenation bug: "2026-2040· click for details" (missing
    space).
  - "Patched-conic screen · 2026-2040" vs "Ephemeris coverage 2026-07-18 –
    2026-10-16 TDB" read as contradictory. Consider relabeling the
    coverage line "View ephemeris coverage" to distinguish the two spans.
  - Inconsistent significant figures in the C3 column (55.5 / 2.234 /
    19.2 / 0.106).
  - HIGH/LOW C3 threshold is never disclosed.
  - Sidebar has no media queries; overlay mode is 380 px at left:16px.
    Narrow viewports are unhandled.
  - Form field missing id/name (Chrome a11y lint, benign, one-line fix).
  - Titan renders but has no focus key; every other named moon has one.

## Open strategic question (for Hudson, not for a dispatch)
Roadmap order is 17 Target Compare → 18 Explain This Cell → 19 Sensitivity
→ 20 Mission View → 21 Living Sky. This session produced evidence that a
reviewer's first sixty seconds currently hit: no pan, no home, invisible
shortcuts, hostile click behaviour. Tier 1 + T2-1/T2-2 is roughly one
slice and converts existing capability into visible capability.

Case for pulling it forward: Aster is a credibility artifact; its job is to
survive the first minute, and adding capability to a tool whose capability
is invisible optimizes the wrong variable.

Case against: Slices 17-20 are the interpretability thesis from the
OQ-14-6 triage — Aster's actual differentiation. Polish work has no natural
stopping point and is easy to rationalize indefinitely.

Decision rule: if a specific reviewer, application, or deadline is
imminent, discoverability wins. If the next milestone is months out, ship
interpretability first and keep QOL in 21 as planned.
