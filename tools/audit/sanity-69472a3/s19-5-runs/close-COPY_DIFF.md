# S19.5 close-batch rendered copy diff

- W1-T1 catalog tier legend: `screening error unbounded or unmeasured` -> `measured, exceeds certified bound / not measured` [UNGATED COPY].
- W1-T2 catalog loading: `NEA Catalog (0)` / `No catalog loaded.` -> `Loading the catalog…` (C-4). Failed-state B3 wording and `No bodies match the current filters.` are unchanged.
- W1-T3 AMBER delivered-mass card: added `Delivered mass excludes the launch-site payload penalty named above; Aster does not model it.` (C-6).
- W1-T4 inclination legend: appended ` from <selected launch site name>` to the iMin and ceiling entries (C-7; derived from selected-site state).
- W1-T5 catalog disclosure: `later slices` -> `a future version`.
- W1-T5 About exhibits: `Slice 10 audit cycle` -> `Lambert solver audit cycle`; `Slice 13 audit` -> `Mission-cost audit`; bare founding-file/section labels -> `Multi-agent audit engineering record` and `Mission-cost engineering record`.
- W1-T7 solar-system HUD: added `Planet spin axes and Saturn's ring plane are not oriented correctly yet. Don't read pole or ring directions from this view.` (C-3).
- W2 tracking status past coverage: `LIVE` -> `NOT LIVE · clamped to <coverage end> TDB` (C-1).
- W2 warning past coverage: `Current time is outside ephemeris coverage — showing nearest available date.` -> `Current time is past this view's ephemeris coverage (ends <coverage end> TDB). Positions are shown for <coverage end>, not now.` (C-2).
- W2 warning before coverage: `Current time is outside ephemeris coverage — showing nearest available date.` -> `Current time is before this view's ephemeris coverage (starts <coverage start> TDB). Positions are shown for <coverage start>, not now.` [UNGATED COPY].
- W3a compare best window: added badge `ARRIVES AFTER SUPPORTED DATE` and `This window arrives <arrival YYYY-MM-DD>, after <support YYYY-MM-DD>, the last date Aster's orbit for <body> is supported. Not certified; ranking unchanged.` (C-5; every templated value derived).
- W3b compare delivered-mass rows: generic payload values now identify the official-published curve and exact or bracketing C3 anchors.
- W3b compare method badge: replaced generic contract-context wording with explicit NASA Launch Services contract context and added the New Glenn steep-final-published-anchor interpolation caveat.
- W4: no rendered-copy changes; documentation and hook behavior only.
- W5: no rendered-copy changes; generated design tokens and provenance only.
- W6: repaired low-C3, L1-tier, and catalog-hint colors; added shared keyboard-focus styling and catalog-row keyboard activation.
- W7: shared C3/status/tier/feasibility/evidence components preserve the characterization fixture's rendered text; no intentional copy change beyond the C3 ownership correction.
- W8-W9: no additional rendered-copy changes; evidence-test, build, and protected documentation work only.
