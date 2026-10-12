# SLICE 19 — FIRST CONTACT — FOUNDING DOCUMENT

STATUS: DRAFT — not locked. Hudson locks with a date line.
Written AFTER the slice's cleanup tier shipped; §2 records that honestly.
Additive-only once locked: amendments append in §9, never edit above.

## §1. Purpose and scope

Slice 19 is a consistency-and-honesty slice, not a capability slice. Its
subject is the gap between what Aster SAYS about itself and what it DOES:
advertised spans that do not match accepted spans, dead weight shipped to
users, provenance hashes that disagree for byte-identical files, and a stated
screening rule that no code enforces.

IN SCOPE: live honesty defects; deployed dead weight; line-ending/provenance
hygiene; the near-zero-C3 degeneracy rule; grid labelling on C3 surfaces; the
K4 light-time chip as the QOL slot.

OUT OF SCOPE, explicitly:
- Horizon extension past 2040 (H0). Own slice; own pre-research.
- Payload restructuring / data-shape change. Measured in §2.4 and chartered
  separately. Deferring a fetch is not in scope either — see DEC-19-4.
- C3 display-precision policy (Q7). A design ruling, deferred to Slice 21.
- Root-URL routing (root serves the legacy app). Decision, not defect.

## §2. Pre-research and measurement

### §2.1 Process note (recorded honestly)
This slice ran recon → dispatches and did NOT produce a founding doc before
implementation. That was acceptable for the cleanup tier, where nothing
architectural was decided. It stopped being acceptable at DEC-19-1, which
creates a shared constant and a display rule. This document is written at that
boundary and records what already shipped rather than pretending it was
chartered first.

### §2.2 Recon S19-R1 (read-only, 12 questions)
Refuted three inherited claims: the "Grid spans 2026–2040" label is correct
nominal copy, not a defect; the hook CRLF risk does not exist (both LF and CRLF
hook forms reject correctly); docs/_staging_v1/ has a live Vite publicDir
producer and is not dead output. It also refuted its own premise that no
.gitattributes existed — one did, scoped to docs/** only.

### §2.3 Recon S19-D06 (read-only, 7 questions, production-importing probe)
- ΔV stack arithmetic: NO defect. Six displayed terms (injection, rendezvous,
  departure, stationkeeping, subtotal, margin); probe `difference 0` on two
  independent inputs. A cold reader's apparent mismatch came from summing three
  of six lines.
- Margin split: NO defect. 10% applies to the full stack
  (src/v2/porkchop/delta-v.ts:42-43); 5% applies to deterministic maneuver
  lines only (src/v2/porkchop/launch-vehicles.ts:48-53), with injection absent
  from the cost card by construction per DEC-13-4/DEC-13-6.
- Near-zero C3: DEFECT CONFIRMED. See DEC-19-1.
- C3 precision: shared formatter is 3 significant figures
  (src/v2/porkchop/format-c3.ts); porkchop readouts use a local toFixed(6).
  Not tier-aware. Deferred to Slice 21.

### §2.4 Payload measurement (live, deployed 69472a3, DevTools)
Supersedes the recon's ~22.4 MB / ~110.9 MB figures, which were wrong.

| Route | Requests | Transferred | Resources | Finish |
|---|---|---|---|---|
| /v2/solar-system/ | 26 | 35.5 MB | 168 MB | 6.09 s |
| /v2/porkchop/ | 12 | 12.4 MB | 71.2 MB | 2.09 s |
| /v2/compare/ (bare) | 7 | 35.0 kB | 86.8 kB | 435 ms |

- First non-black frame: 3.2 s. JS heap at end: 173 MB against 168 MB of
  resources — effectively everything fetched is retained live.
- Longest main-thread task: 109.8 ms, attributed to solarSystemV2. Parsing is
  NOT the bottleneck; ~110 ms against a 3.2 s first frame.
- Compression IS working: lambert-screen-cache.json gzip 8,834,297 B (3.9x);
  tier-sizing-per-body.json gzip 1,302,100 B (8.4x); nea-catalog-slice9 gzip
  8,973,203 B. No compression win remains.
- The recorded "~30 s cold black screen" is STALE. Measured 3.2 s to first
  frame, 6.09 s to finish.
- /v2/porkchop/ fetches the full 41,906-body NEA catalog (8,978 kB = 72% of its
  payload) to resolve ONE target, identically with and without ?body=. The
  request list is byte-identical in both cases.

## §3. Decisions (DECs)

### DEC-19-1 — Near-zero C3 windows are FLAGGED, never removed
RULING (Hudson): flag, never discard data; provide an opt-in control to hide.

The honesty disclosure already states the rule verbatim
(src/v2/app/catalog-list/honesty-disclosure.ts:74-82): a minC3 below
0.1 km²/s² is "a flag to inspect the geometry, not a real planning number,"
and names Apophis's 2029 close approach as the canonical case. Recon D06
confirmed the rule is enforced NOWHERE in code.

Confirmed instance: compare's live Apophis argmin, C3 = 5.50e-5 km²/s²,
departure 2028-08-24, TOF 232.31 d, M=0. At the arrival epoch Earth and Apophis
are 89,598.7 km apart, separated by 0.009493° in heliocentric position —
co-location, exactly as the disclosure predicts.

Locked:
1. The threshold is a CORE CONSTANT, imported by every surface that displays or
   ranks a minimum C3. It is never re-typed, and never read from prose.
   (src/v2/core/* is a protected path; the constant lands via an unstaged edit
   that Hudson hand-commits with ASTER_PROTECTED_OK.)
2. The value and its unit trace to the existing disclosure text; the disclosure
   becomes a consumer of the constant, not its source.
3. Degenerate windows REMAIN in all data and all displays, with their real
   values. Nothing is filtered out of the underlying result.
4. A visible badge marks them. The badge carries a tooltip/disclosure stating
   the co-location mechanism in plain language.
5. A user-facing toggle, DEFAULT OFF (i.e. degenerate windows shown by
   default), hides them from view. Hiding is a view state; it never changes the
   computed values or the exported data.
6. The MCP tools surface the flag as a field in the envelope. An agent consumer
   must be able to see the degeneracy without parsing display text.

### DEC-19-2 — Every C3 surface states its grid
Three surfaces sample different lattices and therefore legitimately report
different minima for one body (Eros: 1.62 catalog / 1.752190 porkchop /
1.64 compare). D06 and S19-R1 Q8 both confirm all three are correct FOR THEIR
GRID. The defect is that a reader cannot tell them apart.

Locked: any surface displaying a minimum/extreme C3 states the grid that value
came from, adjacent to the value, not elsewhere on the page. Compare already
does this ("(731×100 grid)"); catalog states nothing; porkchop states
"Grid: 200×100" in a sidebar away from the number.

### DEC-19-3 — The advertised span is derived, never literal
Shipped at 0052ecb. Displayed span bounds are the first and last UTC calendar
dates whose UTC midnight, converted by the tools' own input conversion, is
accepted by withinEarthSpan(). No hardcoded date string in product code
(DEC-17-5). The deterministic eval keeps LITERAL expected strings, because the
span is a semantic endpoint a user reads; importing the constant there would
make the eval pass by construction.

### DEC-19-4 — Payload work is deferred, with a measured charter
Slice 19 ships NO payload change. §2.4 establishes that the bottleneck is
transfer volume and retained heap, not parse and not compression, and that
porkchop's dominant cost is fetching a 41,906-record catalog to read one row.
The fix is a per-body record path, which is a data-shape change. That belongs
to its own slice with its own DEC, not to this slice's tail.

## §4. Open questions

OQ-19-1 — Does the degeneracy flag suppress the "nondominated" marking?
A degenerate window currently wins Pareto dominance on compare. Dominance is a
RECOMMENDATION; displaying a value is not. Recommended ruling: degenerate
windows are excluded from dominance RANKING while remaining fully displayed
with their values and badge, and the legend discloses the exclusion.
STATE: open. If implementation proves non-trivial, it defers to Slice 21 and
the badge ships alone.

OQ-19-2 — Does the catalog's `low_departure_c3` badge interact with the
degeneracy flag? It is a DIFFERENT threshold (D06: at least one window with
C3 <= 25, via feasibleC3MaxKm2S2). A body can be both. STATE: open.

OQ-19-3 — Should the root URL serve v2? Root currently loads the legacy
bundle (legacy-C6NkCVYx.js). First contact for a reviewer is the old app.
STATE: open; out of scope for this slice.

## §5. CUT RULE
If the slice runs past its hours, cut in this order: OQ-19-1 implementation
first, then DEC-19-2's porkchop relabel (compare already complies), then the
K4 light-time chip. DEC-19-1's badge and constant are NOT cuttable — they are
the slice's reason to exist. A cut item is recorded in §9 with its reason.

## §6. Fronts
- Front A (SHIPPED): span derivation + eval amendment (0052ecb); K4 promotion
  appends (440cedf, cc42d05); .gitattributes + renormalize (e70c00b, 59a7dd9);
  dead-weight removal, -10,642,207 B (69472a3).
- Front B: DEC-19-1 — core constant, detection, badge, disclosure, toggle,
  MCP envelope field.
- Front C: DEC-19-2 — grid labels on catalog and porkchop.
- Front D: K4 light-time chip (QOL slot, promoted per kernels §6.2).

## §7. Acceptance
- `npm run verify` green at N/N (NOT `npm run test`, which runs only
  tests/*.test.mjs and under-reports: 233 vs 304).
- No deployed-bundle regression; live bundle hashes browser-verified after
  push.
- A cold-reader pass confirms a first-time viewer can tell why two surfaces
  report different minima for one body, and can see that Apophis's near-zero
  window is flagged.
- Every new displayed number traces to a repo constant or a committed
  measurement (INV-025/026).

## §8. Entry/exit
ENTRY: 59a7dd9 (repo LF-normalized, provenance hashes reconciled).
EXIT: Fronts B and C shipped and pushed; Front D shipped or cut with a §9
entry; CI green; live bundles verified.

## §9. Amendments and corrections
(Append only. Never edit above this line.)

## Proposed Â§9 append â€” Slice 19 Phase B completion

Run completed 2026-10-10 on `s19-batch`. The protected founding document was not edited in this run. Code commits were `2393959`, `4343633`, and `531eb30`; the deployment build commit was `ddafa33`. Test-only commits were `3febf77` and `88e566b`.

### Â§2.5 probe and lattice result

The production-path Eros (433) probe confirmed a lattice offset rather than a solver disagreement. At the cached minimum window (departure `2032-06-10`, TOF `272 d`), cached C3 was `1.6244339770173506 kmÂ²/sÂ²`; live recomputation was `1.6244339770314757 kmÂ²/sÂ²`. The absolute difference was `1.4125145497700942e-11 kmÂ²/sÂ²`, and the relative difference was `8.695426036111575e-12`. Verdict: agree.

The cache uses UTC date labels converted through `utcStringToTdbSeconds` with `TDB_MINUS_UTC_SECONDS = 69.184`; the recovered grid date is therefore the UTC-labelled departure convention. The live path evaluates the corresponding TDB epoch. The derived lattices are:

- Catalog cache: `7 d Ã— 30 d` steps.
- Compare: `731 Ã— 100` cells, approximately `7.004109589041096 d Ã— 16.603535353535353 d` steps.
- Dedicated porkchop: `200 Ã— 100` cells, approximately `25.693467336683415 d Ã— 16.603535353535353 d` steps.

### OQ-19-4 â€” L1 support boundary and a window

The L1 support boundary is applied to arrival, not departure. `src/v2/porkchop/support-boundary.ts:49-50` defines unsupported as `arrivalJd(cell) >= boundary.encounterJd`; `boundaryTofDaysAtDeparture` derives the per-departure TOF boundary at lines 53-55. The committed support-boundary tests independently pin the same rule at `src/v2/porkchop/support-boundary.test.mjs:106-125`.

For Apophis, the earliest material encounter and support boundary is `2028-09-12`; the separate largest-drift observation is `2029-04-13`. The compare display can therefore say â€œsupported through 2028-09-12â€ while its best window departs `2028-08-24` and arrives approximately `2029-04-13`: the departure is before the boundary, but the arrival is past it. The dedicated porkchop marks such cells through its arrival-based support partition. Compare and the overlay do not carry a per-window support marker. This remains observation-only; no support-boundary behavior was changed.

### OQ-19-5 â€” Î”V stack versus mission mode

Verdict: `CONFIRMED [Certain] â€” DISPLAY`.

`buildDeltaVStack(c3Km2PerS2, vInfArrKmps)` has no mission-mode argument and the displayed stack is mode-insensitive. Its displayed terms in both modes are injection, rendezvous, departure, stationkeeping, and margin; its margin is 10% of the full subtotal. The cost card is mode-sensitive:

| Surface | Injection | Rendezvous | Departure | Stationkeeping | Margin |
| --- | --- | --- | --- | --- | --- |
| Displayed stack, both modes | yes | yes | yes | yes | yes, 10% of full subtotal |
| Cost card, one-way | no, embodied in payload-at-C3 | yes | no | yes | yes, 5% maneuver margin |
| Cost card, sample-return | no, embodied in payload-at-C3 | yes | yes | yes | yes, 5% maneuver margin |

For the Eros pinned lowest-C3 cell in one-way rendezvous mode, the displayed stack total was `18.766155025611898 km/s` (`18.766` shown). A mode-consistent one-way stack would have been `11.28258166067245 km/s` (`11.283` shown). The departure term is generated from arrival v-infinity; the user-facing assumptions line does not state that assumption. This was read-only and no D09 fix was made.

### DEC-19-2 amendment

Every displayed C3 grid now states common derived step units: `<departure step> d Ã— <TOF step> d steps`. Compare retains its existing wording and receives an additive parenthetical with the cell dimensions and the same day-step units. The catalog cache, compare, dedicated porkchop lowest-C3 line, pinned C3 line, Î”V stack pinned C3 line, and sidebar now communicate their grids in comparable units. The lattice probe confirmed that minima are sampled on different points, so the existing sampled-minimum disclosure can say that the true minimum is at or below each surface's sampled minimum.

### DEC-19-1 clarification

Near-zero C3 uses the protected core threshold `0.1 kmÂ²/sÂ²` and its finite strict-less-than predicate. The UI toggle is default off. When enabled, a flagged value and its near-zero badge are replaced in place by the exact notice `near-zero-C3 window hidden (N)`. The underlying cells remain in data, computed results, argmin, ranking, dominance, and exports; no recomputation excludes flagged cells, and the porkchop plot is unchanged.

The catalog, compare, dedicated porkchop grid-extreme and pinned readout, and the Î”V stack/cost-card pinned C3 surfaces hide in this view-only way. The existing dominance marking is unchanged and remains adjacent to the badge or notice. The existing `low_departure_c3` badge is unchanged; when both classifications apply, it remains visible alongside the near-zero badge, or alongside the in-place near-zero hidden notice when hiding is enabled. MCP does not hide values: catalog summary/full screening, porkchop-scan best cells, explain-cell Lambert stage output, and estimate-mission-cost root output carry the structured `nearZeroC3` field with `degenerate` and `thresholdKm2S2` members. Per-cell hover remains outside the committed Slice 19 scope.

### Cuts and skips

- The protected founding document was not edited; this file is the proposed additive Â§9 text for Hudson's hand-commit.
- No browser/local production-build gate was run by Codex; that is the final Hudson gate.
- No push, merge, or `ASTER_PROTECTED_OK` setting was performed.
- OQ-19-1 dominance behavior and OQ-19-2 `low_departure_c3` behavior were not changed.
- D09 was intentionally read-only; the mode mismatch was recorded rather than fixed.
- The per-cell hover surface remained out of scope, and MCP received a structured field rather than a UI hide control.

### Verification record

Root verification measured `85` files, `318` tests, `0` failures, and `0` load-timeouts. MCP tests measured `28/28`; MCP eval remained `10/10`. The generated eval report/summary recorded origin `43436338ea790ed551413a57fa3fd1e62fad94ba` (the B2 commit) as the expected one-commit lag.

The original T5 regression was mislabelled as a surface-label change test; it is now named for what it checks: formatter output changes with its grid parameters.

