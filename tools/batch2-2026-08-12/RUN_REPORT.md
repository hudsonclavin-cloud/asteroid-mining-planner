# BATCH 2 RUN REPORT — S-S17-BATCH2-2026-08-12-A

Branch: `batch2/2026-08-12`, cut from `main @ 0feffb4` (verified at Phase 0).
Actor: Claude Code, sole writer; three fresh read-only recon lenses ran in
parallel (A4c-1, B2-1, B1-1), transcripts held by the orchestrator, findings
below. Known-dirty baseline preserved. Nothing pushed; `main` untouched.
All three workstreams completed — no phase stopped.

## Commit ledger

| SHA | Workstream | What |
|---|---|---|
| `60a6fb6` | A4c | Size (range + disclosed albedo) and Orbit-quality (raw U + label + verbatim MPC caveat) columns on /v2/compare/ |
| `325c115` | B2 | Scale/frame chips, axis triad (new `src/v2/render/axis-triad.ts`), HUD readout (target · distance · frame; sim time already present) |
| `1e99aca` | B1 | Pan as camera-target offset (anchor path untouched); Reset-view button sharing the 't'-preset code path |
| `3a7c686` | B1 | '?' shortcut overlay grouped by task; hover-tooltip focus-key badges |
| (Phase Z) | docs | this report + `OQ_17_5_EVIDENCE.md` |

Typecheck exit 0 after every commit and at run end. Per-phase
`.dispatch-scope` rewritten before each staging; explicit paths only.

## Verification (Phase Z)

- `node tools/run-tests.mjs` (single licensed run): **74 files, 73 passed;
  246 tests passed, 1 failed** — the failure is
  `tests/v2-golden/launch-vehicles.golden.test.mjs`, the §9.1 named
  environmental exception (local Node 20; passes CI Node 24). **Zero other
  failures; no test edits were needed this batch.**
- Final typecheck: exit 0.
- Concurrency tripwire: clean throughout.

## A4c — recon findings (file:line) and what shipped

- Catalog fields verified: `H: number | null` (slice9-nea-catalog.ts:46/:120),
  `conditionCode: number | null` (:54/:125), `estimatedRadiusM` generated at
  build time (build-nea-catalog.mjs:191-192), all loader-validated. The
  compare page previously read only name/designation/elements — facts
  plumbing added.
- **Albedo claim VERIFIED in code**: every `estimatedRadiusM` = D(km) =
  (1329/√0.14)·10^(−H/5)·500 m (derived-fields.mjs:26-31, default albedo
  0.14; `ASTEROID_DEFAULT_ALBEDO = 0.14` at core/constants/asteroids.ts:9).
  Spot-checked numerically (Eros: formula reproduces the stored
  14839.899761463936 m). Caveat: **no in-code citation** for 0.14 — the
  Stuart & Binzel 2004 attribution rests on V6 item 4; the shipped copy
  cites the artifact, and the display derivation calls the SAME core
  function that generated the catalog, so display and data cannot drift.
- Committed catalog at this HEAD: 41,906 conditionCode values, **10 nulls**
  (distribution 0→8470 … 9→3281); `"H": null` count **210** (those bodies
  render "no H on file"). **52.1% of the catalog is U≥7**, so the JPL
  "highly uncertain" label is common, not an edge case.
- V6/V7 read verbatim; all claimed items present; nothing shipped uncited.
  Both artifacts are **VERIFIED-WITH-CITATIONS, not LOCKED**, and each
  recommends a Hudson-side spot check before UI copy quotes them (V6: the
  CNEOS 10^3.1236 constant + Mainzer Table 1; V7: the MPC UValue page).
  That recommendation remains **outstanding** — the dispatch authorized
  shipping from the artifacts as-is.
- Shipped semantics: size range spans the C-to-S albedo medians
  (0.053–0.166, factor ≈1.77), with the NEA-default-0.14 point value
  disclosed beneath and the ×≈2.9 X-complex widening named (DEC-17-4:178-180
  — a single diameter is an overclaim). Orbit quality: raw U + band
  (verbatim V7 table values) + label — ≥7 anchors JPL's published threshold
  and says so; ≤2 / 3-6 are labeled "our banding, not an official tier"
  (DEC-17-4:190-192). Null renders "unknown", never a number or blank.
  The MPC caveat ships verbatim on every row: "The U value should not be
  used as a predictor for the uncertainty in the future motion of NEAs."
- Refusal rows keep their refusal message across the compute columns but
  still render the two fact columns — size and quality are catalog facts,
  valid for a body whose grid was refused.

## A4c — scope residual (recorded, not silently absorbed)

DEC-17-4's full context/quality set also mandates: **orbit class, a / e / i,
dataArcDays, nObsUsed, sigmaA / sigmaE** (and H itself as a context field).
This batch shipped the two dispatch-named columns; the remainder stays open
A4c residual debt. (dataArcDays/nObsUsed are already on the loaded record —
slice9-nea-catalog.ts:126-127 — so the residual is rendering work, not
plumbing.)

## B2 — recon findings and what shipped

- **Both true-scale claims VERIFIED** before the chip shipped: distances are
  anchor-subtracted meters, no scale factor (runtime body loop); planet/moon
  geometry at pck radii, Sun at true 696,000 km, oblate planets at true
  polar ratios; asteroid meshes scaled by `estimatedRadiusM` — so the chip
  says asteroid radii are "estimated from brightness", not "true scale".
- Halo floor confirmed `DEFAULT_MIN_HALO_DIAMETER_PX = 8` (halos.ts:9), with
  two caveats the chip respects: Saturn moons use a scaled floor
  (base 6, up to ~21 px for Titan), and the 8 px floor **never governs
  asteroids** — their far-field floor is `ASTEROID_POINTS_MIN_SIZE_PX = 2.5`
  CSS px, a different system. The chip names both numbers, both imported
  from the live constants (INV-026), and states markers are visibility
  aids, not sizes.
- Frame chip and HUD frame line take the C2 verdict label; the chip carries
  the caveat in plain words: the top-down view looks down the ECLIPTIC pole
  while the axes stay EQUATORIAL.
- Axis triad: new side module `src/v2/render/axis-triad.ts` — corner
  scissored viewport, counter-rotated per frame; +Z deliberately NOT
  labeled "up" (it is celestial north; meaning stated on the chip).
- HUD: `Focus <target> · camera <distance>` (orbitRadius, meters → km/AU)
  + static frame line, joined to the existing time-status grid.

## B2-3 — OQ-17-5 (decision is Hudson's)

Evidence in `OQ_17_5_EVIDENCE.md` (this dir): the ~7-7.5 CSS px effective vs
8 px floor measurement **still stands** at 0feffb4 — `git log` shows no halo
commit since the 2026-08-03 measurement; cause is the radial gradient's rim
alpha decay (halos.ts:146-149), quoted in the file. **RECOMMENDATION: option
(b)** — chip states the floor (it does, per DEC-17-9 C1); the sub-perceptual
rim shortfall stays a logged finding; no texture change. Reasoning in the
evidence file. Option (a) remains a one-file dispatch if Hudson rules the
other way.

## B1 — recon verdict and what shipped

- **Verdict (i) PAN-SAFE** — pan lives strictly on the camera side of the
  lookAt line. Implemented exactly per the recon checklist: position =
  camLocal + offset; lookAt(offset) (pure translation — camera orientation
  bit-identical); halo distance measured from the actual camera position;
  sun-clearance clamp call site passes the Sun relative to the pan target;
  far widened by |offset|; |offset| clamped to 2×orbitRadius; points-raycast
  distance proxy widened by |offset| (threshold only grows). The anchor path
  — `getAnchorPosition`'s dcdb494 same-frame canonical-array read,
  `getCurrentOrbitCenter`, every body rebase — is **untouched**.
- Pan reset: cleared in `startFocusTransition`, which every focus change and
  both presets route through — gate letter (g)'s "Home resets pan" comes
  from the same line.
- Reset-view button: labeled "⌂ Reset view", NOT "Home" — the keyboard Home
  key is bound to jump-to-coverage-start (a TIME action; recon §5), and the
  dispatch's "Home button" naming would have collided with it. The button
  shares one code path with the 't' key (`applyCameraPreset`, factored, not
  duplicated).
- Overlay + badges: the Focus rows and hover badges are GENERATED from the
  live `FOCUS_KEY_TO_BODY` map and the scrub label from
  `TIME_SCRUB_STEP_SECONDS` — they cannot list a dead key or stale number.
  Recon confirmed no documented-but-dead keys at this HEAD (L9 key-map
  report is stale the OTHER way: 'k' is now Titan; the modal leak it logged
  is fixed).

## B1 — findings reported, not built

1. **Touch pan is NOT implemented.** The pointer path is single-pointer
   today (one shared lastPointerX/Y; a second touch pointer corrupts orbit
   deltas — recon §4). Two-finger pan requires per-pointerId tracking
   first; that restructure was out of the "offset only" safety envelope.
   Mouse pan ships (right-drag, middle-drag, Shift+drag). Queue the
   multi-pointer prerequisite if touch pan is wanted.
2. **The zoom-out complaint (Clome) is explained, unfixed** (out of scope):
   wheel zoom exists and works, but the 15 AU max clamp sits only ~2× above
   the 7-8 AU preset radii (~4-5 wheel notches of headroom); contributing:
   the 1000 ms controls lock after 't', and the porkchop-modal backdrop
   swallowing wheel events while open. If "can't zoom out" recurs at the
   gate, the lever is `MAX_CAMERA_DISTANCE_M` (runtime.ts:74), a one-line
   decision that was not pre-approved.
3. Orbit-class tabs still do not filter the 3D cloud (logged in STATUS;
   surface untouched this batch).

## END GATE (Hudson, once, dev server, on the BRANCH)

/v2/compare/?bodies=asteroid-433,asteroid-163693,asteroid-99942,asteroid-68348
 a. SIZE column shows a RANGE, with the albedo assumption disclosed —
    reads as an estimate, not a measurement
 b. CONDITION CODE shows raw value + label + the MPC caveat; nulls read
    "unknown"  «note: all four gate bodies are U = 0, so this URL shows
    only the best tier; the ≥7 label (52% of catalog), mid bands, and the
    null branch need another body if you want them eyeballed — e.g. add
    any body with U 9; the copy paths are code-identical»
/v2/solar-system/
 c. scale/frame chips: numbers match the verified constants (8 px halo
    floor, 2.5 px point floor); frame line is the C2 label; nothing
    conflates ecliptic with equatorial
 d. axis triad present bottom-right, labels match the verified frame
 e. HUD readout shows target · distance · frame · sim time
 f. PAN works (right-drag / middle-drag / Shift+drag; plain drag still
    orbits; touch pan not built — see findings), and focusing a body
    still behaves — NO reintroduced flicker/swim on a focused asteroid
    under live time (watch 10 seconds; this is the regression that
    matters)
 g. "⌂ Reset view" button resets view, including pan offset (so does any
    focus change and both presets)
 h. "?" overlay opens (key or button), grouped by task, every listed key
    works
 i. tooltip shortcut badges present (hover a planet: "Name · key N")
Any failed letter ⇒ git revert that commit on the branch, keep the rest.
Then: merge --ff-only → clean-tree check → npm run build → docs commit
(scope docs/*) → ASTER_PUSH_OK=1 git hpush → CI GREEN → STATUS refresh.

## Tripwire (c) questions

None open — every judgment point was resolvable from the DEC text, the
verified artifacts, or the recon evidence, and is recorded above (the two
notable calls: "Reset view" naming over "Home", and shipping mouse-only pan
rather than restructuring the pointer path inside the risk workstream).
