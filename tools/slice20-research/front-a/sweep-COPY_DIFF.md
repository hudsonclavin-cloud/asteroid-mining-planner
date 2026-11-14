# Slice 20 text sweep COPY_DIFF

Workstream copy diffs will be recorded as each item lands.

## W8 catalog copy

- CK-12 FIXED: catalog C3 values use the existing shared three-significant-figure
  formatter through `C3Value`; render coverage includes plain and exponential ranges.
- CK-13 FIXED: the catalog legend discloses the cache metadata threshold as
  `LOW C3: below 25.0 km²/s² (the screening threshold)`.
- CK-14 FIXED: every rendered catalog, compare, and porkchop input/select control
  has an explicit id and name; the porkchop page has a fake-DOM coverage check.
- CK-15 ALREADY FIXED / NON-TEXT: the footer spacing is fixed by `footerText` plus
  the separate click hint; the patched-conic and ephemeris wording is already
  distinguished in the catalog disclosure; significant figures are covered by CK-12.
  Orbit-line contrast, NEA bloom, sidebar media-query/layout handling, and Titan's
  focus key are non-text backlog items and are logged only, per dispatch scope.

## W1-W7 copy and scope

- W1 FIXED: margin sentences name the mode-owned base, the Delta-V stack
  explains its vehicle-agnostic injection accounting, and m/s values use the
  existing grouped formatter.
- W2 FIXED: duplicate payload refusal copy is removed, pending-cell state does
  not expose stale numbers, the porkchop target uses the catalog display label,
  and near-zero C3 mass/payload lines carry the existing caveat.
- W3 FIXED: the four compare/porkchop display sites use typed C3Value grids.
- W4 FIXED: production porkchop end-date literals use the shared span constant.
- W5 FIXED: Vandenberg says that no direct-declination ceiling exists because
  direct launches reach every declination.
- W6 FIXED: the solar-system HUD discloses Earth-to-body light time with
  inherited tier caveats and explicit refusal states. The exact SI constant is
  pending Hudson's protected hand-commit.
- W7 READ-ONLY: payload files were classified in the report; no asset was
  deleted or rewritten.

## W9 documentation copy

- D-1 PENDING: additive invariant-index corrections remain unstaged.
- D-2 FIXED/PENDING: non-core GM_SUN labels are corrected in `cca4f24`; the
  core correction comment remains unstaged.
- D-3 PENDING: founding-document date, anchor, thesis-ranking, and tier-count
  corrections are additive and remain unstaged.
- D-4 FIXED: research folder names are documented as historical citation labels.
- D-5 FIXED: the workflow header comment matches the four actual jobs.
- D-6 FIXED: DEVLOG records the Moon accuracy/implementation correction.

## W10-W12 state

- W10 FIXED: STATUS records the 2026-11-13 branch pin and checked-in bundle
  names; commit `5001a0b`.
- W11 PARTIAL: verify halted after two attempts because CK-13 violates both
  the src/v2 import wall and the C3Value ownership guard. No build was run.
- W12 COMPLETE: REPORT, LOG, and COPY_DIFF are copied byte-for-byte into
  `tools/slice20-research/front-a/`. There are no `[UNGATED COPY]` strings.

## W10 STATUS copy

- STATUS now records the 2026-11-13 Slice 20 text-sweep branch state, the
  `0d31cda` origin/main pin, the `1691d96` pre-STATUS tip, and the current
  checked-in entry bundle names. Slice 20 remains IN PROGRESS pending W11/W12.
