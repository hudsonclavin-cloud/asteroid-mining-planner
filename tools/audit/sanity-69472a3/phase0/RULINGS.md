# Slice 19.5 — RULING table + Front B sizing (Nova, 2026-10-13)

Input: Phase 0 `TRIAGE.md` (%TEMP%\s19-5-p0\), HEAD 6575d0d. Status: PROPOSED — Hudson rules each row; the ruled table goes into the founding doc §9 (protected hand-commit) in the A+B batch.

## 0. Read this first — what the triage is and is not

- **Most dispositions are unverified hypotheses.** Only the 21 HIGHs were re-checked by command. Almost every MEDIUM/LOW FIX-USER row says `evidence: audit only (unverified)`. Those rows *could not* come out ALREADY-FIXED or REFUTED, so 3 ALREADY-FIXED / 0 REFUTED / 0 BACKLOG / 0 WONTFIX shows what the method could do, not what the codebase is like. [Likely] Several Front B rows are already fixed by Slice 19 (grid labels 6dbefd1/2393959, ΔV stack fbe8e89/e0c3447).
  → **Rule for the batch:** every Front B item starts with a verification step at HEAD. If the defect is absent, the commit becomes an ALREADY-FIXED record, not a fix. If the defect differs from the description, tripwire.
- **FIX-USER was used as the default bucket.** 60 rows are routed to B, but only 33 can be seen by a visitor (30 firm, 3 conditional). The other 27 are internal docs, latent core bugs, evidence or payload. They are reclassified in §2 and none are dropped: 86 in, 86 out (checked by script).

## 1. RULING table (20 rows → 15 rulings; duplicates merged)

Rule I applied: **a LOCKED text wins over a stale line in the same doc. A "must" invariant is never weakened to match drift. A doc is amended only when the code is right and the doc claims a mechanism that was never built.**

| # | Rows | Locked vs shipped | Nova position | Route / cost | Confidence |
|---|---|---|---|---|---|
| R1 | A2-F05, B2-F03 | INV-008..011 say core/interpolators enforce "on every interpolated state"; no runtime path exists | **AMEND** additively: enforcement is test-time, naming the tests that enforce it (the INV-012/013 precedent). If a named test does not exist → FIX-TEST in Slice 20 E. Do not add hot-path runtime guards in core (math layer, perf, audit). | 19.5 C (protected: INVARIANTS + `src/v2/core/invariants/*.md`) · 0.5 h | [Likely] right; strongest counter: the runtime guard was the point. But nothing has run it for 10+ slices and the tests carried it |
| R2 | A2-F07, C1-F05 | INV-014 means two things (8.5 star background vs 9 three-gate tier), and live tests cite both | **AMEND** with a namespace: INVARIANTS index stays the authority (INV-014 = three-gate tier); the 8.5 rule is recorded as INV-014a / the tier rule as INV-014b (INV-016a precedent); test comments updated. No renumbering. | 19.5 C · 0.3 h | [Likely] |
| R3 | A2-F19 | SLICE_17 reserves PROPOSED-INV-035/036; the index skipped 035/036 | **AMEND** SLICE_17 additively: proposals get the next free IDs at promotion; 035/036 stay skipped. | 19.5 C · 0.1 h | [Certain] the index is the authority |
| R4 | B3-F16, B4-F03 | SLICE_11:63 (OQ text: 2×√C3) vs DEC-7 (2×v∞_arr) in the same doc; code follows DEC-7 | **ANNOTATE** :63 as superseded by DEC-7. No code change: the code matches the LOCKED DEC. | 19.5 C · 0.1 h | [Certain] |
| R5 | B5-F07 | DEC-12-4: toggle default OFF; shipped `useState(true)` | **AMEND to ON — your call.** For: ON shows the constraint by default, which is what a front door should do. Against: OFF may have been locked to keep colour reserved for C3 on the porkchop. **Read DEC-12-4's rationale first.** If the rationale is colour reservation → fix the code to OFF. | 19.5 B/C · 0.2 h | [Speculative] until the rationale is read |
| R6 | B5-F11 | INV-016d: the feasibility display must disclose site/band model/dogleg; shipped hides the disclosure behind the contour toggle while the verdict stays visible | **FIX CODE.** Disclosure + site + band legend render whenever a feasibility verdict renders, independent of the contour toggle. Behavioural test: toggle OFF + verdict visible ⇒ disclosure present. | 19.5 B · 1 commit | [Certain] the invariant is a "must" |
| R7 | B5-F22 | INV-022 needs "official-published vs estimated" on each of 38 anchors; the field doesn't exist | **FIX CODE**, derived mechanically from each anchor's existing source comment (vendor guide = official; digitized/interpolated/densified = estimated). Tripwire: any anchor that cannot be classified from its committed source → STOP, list it; never guess. Render it next to the number where anchor provenance already renders. | 19.5 B (last item) · 1 commit | [Likely] it is mechanical; unknown how many anchors are ambiguous |
| R8 | C3-F04 | §9 binding: DEC-17-4 quality copy may not ship before the MPC spot check; it shipped, no waiver recorded | **DO THE CHECK NOW**, then record a retroactive §9 entry with the result (not a waiver). If the check fails → the copy changes in B. A waiver written after the fact is rationalizing. | 19.5 B research (you or Clome) · ~1 h | [Certain] on process |
| R9 | C3-F05 | DEC-17-5 persistent method/grid/quality fields are absent on /v2/compare/ | **FIX CODE inside F2** (compare migrates to the shared HonestyChips/EvidenceBadge components). **Fallback:** if F2 is cut (cut rule F3→F2→F1), C3-F05 moves into B as a hand-rolled fix. It must not slip with F2. | 19.5 F2 (or B) | [Likely] |
| R10 | C4-F22 | INVARIANTS says atmospheres are spherical; the locked DEC and the code make three shells oblate, and none is tilted | **AMEND** INV-001 additively: "an atmosphere shell shares its body's figure and orientation" (flattening from BODY_CONSTANTS). Implement in Front G alongside the axes (tilt is broken for every body anyway). | Ruling now, code in Slice 22 G | [Likely] |
| R11 | C4-F33 | INVARIANTS: never camera-relative; earth-moon uses camera-relative positions | **RECON before ruling** (Slice 22 G). If it is a consistent floating origin (a legitimate precision technique) → amend with a documented exception. If it is mixed frames → fix. The packet's quoted line (`cameraPosition = …`) is only camera placement, so [Speculative] partly a false positive. | Slice 22 G | [Speculative] |
| R12 | C4-F35 | `prototypes/renderer-test/rings.ts` invents a ring profile procedurally | **ANNOTATE** the prototype header as procedural, unsourced and not shipped. Front A adds one check: grep `docs/` to confirm no prototype code ships. If it does ship → becomes a Front A fix. | 19.5 A check + annotate · 0.2 h | [Likely] not shipped |
| R13 | C5-F15, C5-F17 | INV-025 bare internal IDs in copy; INV-026 two trust-surface numbers from literals | **FIX CODE.** Plain-English framing; derive both numbers from the provenance JSON. No amendment: these are this project's honesty core. | 19.5 B · 2 commits | [Certain] |
| R14 | D1-F04, D1-F05 | DEC-15-8: unknown id → not_found refusal (dla_feasibility throws instead). INV-027: no math in mcp/ (the adapter recomputes v∞/DLA and invents `marginDeg`) | **FIX CODE in Slice 20.** Move classifyFeasibility/marginDeg into core (protected, math layer, four-lens audit; `marginDeg` has never been audited). Unify the refusal path; if the MCP eval pins the old error → an eval amendment per the 0052ecb precedent. Pairs with K1, which adds v∞ vector math to core anyway. | Slice 20 (carried, added to E as E-MCP) | [Likely] |
| R15 | D2-F05 | DEC-16-8 registered contrast (CI on the difference vs 10 pp, Holm) was never computed; §30.3 substitutes overlapping marginal CIs | **FIX, never amend.** Amending a pre-registration after the results are known is the one move that destroys the credibility of the Slice 16 result. Compute the registered contrast from the committed ledgers (deterministic, no new runs) as an additive §. If the ledgers lack paired per-item data → record a registered-analysis deviation openly. Front A's README Slice 16 line says "registered contrast analysis pending" until then. | Slice 21 D · ~1–2 h agent | [Certain] on principle; [Speculative] that the ledgers are paired |

**Rulings that need you specifically:** R5 (read DEC-12-4's rationale), R8 (who runs the MPC check), R15 (OK to put a "pending" line on the README). The rest I'd lock as written.

## 2. FIX-USER reclassification (86 rows)

### 2a. Front B — what a visitor can see (19.5, not cuttable): 30 firm + 3 conditional → 14 commits

| # | Commit | Rows | Notes |
|---|---|---|---|
| B1 | FK3 tour AMBER copy | B3-F01, C5-F01 (+B3-F02, B5-F19 if same locus) | AMBER = zero added ΔV (DEC-13-3); dogleg is RED. B3-F02/B5-F19 fold in only if rendered; if they are comments only, fix the comment in the same commit |
| B2 | L2 tier text split | C5-F02 | measured-unbounded vs not-measured; 7 of 17 measured bodies currently say "not measured" |
| B3 | Catalog "tiers not loaded" state | C5-F03, C2-F07 | distinct state for artifact-failed / late-arrival; never "No bodies match" |
| B4 | Albedo factor derived | C3-F02, C5-F08, C3-F10, C3-F03 | Verified: D ∝ p^-½; 0.14→0.60 gives ×2.07; the 0.07→0.60 span is ×2.93. Derive from constants and delete the literals; fix the false "cannot drift" claim |
| B5 | About multi-rev claims | C5-F06, C5-F07 | restore the "magnitude only" caveat; "within 1.18%" scoped to the segments where it is true |
| B6 | OBSERVED provenance row scope | C5-F09 | |
| B7 | Derived span labels | B4-F02 | DEC-19.5-8; the grid ends 2040-01-01; 8.11% of cached best windows fall outside it |
| B8 | Unsourced figures | B5-F06 (~1 m/s/deg), C5-F10 (~34–39°), B5-F17 (site numbers), C5-F05 (co-orbital 4-yr horizon) | **Default ruling: remove or reduce to the committed-evidence value, with a refusal/qualitative wording. No new sourcing in 19.5** (verify-before-lock costs hours; sourcing goes to backlog) |
| B9 | ΔV stack model assumptions | B3-F06, C5-F11 | INV-016c: impulsive, patched-conic, no GA, no SEP. The INVARIANTS index-line correction rides in C (protected) |
| B10 | Non-finite C3 refuses everywhere | A2-F16, B3-F13, B3-F14, B5-F20 | NaN → `plot-no-solution` pixel; payloadAtC3(NaN) → refusal, not BEYOND_CURVE. Behavioural tests |
| B11 | About anchor + exhibit pin | C5-F12, C5-F13 | |
| B12 | Shortcut overlay + compare single-rev badge | C5-F18, C5-F19 | |
| B13 | Degeneracy caveat visible inline | C5-F20 | 3,163 rows show a green "low C3" badge with the caveat in a popover only. Minimal inline marker now; the full treatment comes via NearZeroC3Badge in F2 |
| B14 | RULING-derived | R6 (B5-F11), R13 (C5-F15, C5-F17), R7 (B5-F22), R5 if code | B5-F22 goes last (most likely to STOP) |
| — | Conditional (verify first) | C2-F12 (Apophis 0.257 AU), C2-F08 (DE430→DE405 label), C5-F16 (smoke harness expected C3) | In B only if rendered on a deployed route; otherwise → Slice 24 doc hygiene |

### 2b. Moved out of B (27 B-routed + 26 G-routed)

| Destination | Rows | Why |
|---|---|---|
| 19.5 C (control plane) | C4-F05 (SLICE_V1_STATUS supersession banner), A4-F20 (absorbed by the STATUS rewrite) | already in the C1 banner/STATUS work |
| WONTFIX + lesson | A3-F08 (69472a3 mixed src + docs rebuild) | pushed history is never rewritten; the lesson is already standing |
| Slice 20 E (core latent, before K1) | B1-F01 (parabolic 0/0), B1-F09 + B3-F07 (`lw` consumed as `prograde`), B3-F08 (izzo no tof>0 guard), B3-F15 (grid params unvalidated) | Math layer, protected `src/v2/core`. K1 runs Lambert in a new direction (asteroid→Earth), so the `lw`/prograde trap and the negative-tof guard bear directly on it. Tests that fail first |
| Slice 21 D (evidence/data) | B3-F10 + C1-F04 (null→0 ingestion; 2015 D1 mean anomaly fabricated as 0), C1-F01, C1-F02, C1-F15 (CRLF-era sha256), C1-F16 | The validator fix changes the catalog, so it lands when 21 regenerates. Interim: add a §9 known-issue line naming 2015 D1 |
| Slice 22 G (render) | C4-F01, F02, F06, F11, F12, F13, F19, F20, F28, F31 (visual) + C4-F07, F08, F10, F17, F18, F23, F24, F25, F26, F27, F30, F34 (render-doc annotations) | Already routed G by the triage; axes need the Recon G pole data |
| Slice 24 payload | C4-F14, C4-F15 (cloud texture fetched, never rendered), C4-F16 (8.5 MB staging in docs/), B3-F09 (worker error paths) | Lean Payload owns the deploy weight and the porkchop data path |
| Slice 24 doc hygiene (C5–C9) | B3-F03, B3-F12, B5-F13, C1-F06, C1-F07, C1-F08, C1-F09, C1-F11, C2-F03, C2-F04, C2-F10, C2-F11, C5-F14 | Internal docs/comments; additive errata on founding docs |

Bias check: the pull to keep all 60 in B is the availability bias of the "every FIX-USER row" phrase in the timeline. That phrase assumed the bucket meant "visitor-visible". It didn't, so the timeline text gets an additive clarification in §11, not a silent reinterpretation.

## 3. Sizing (your hours, not agent hours) — [Speculative]

| Work | Your time |
|---|---|
| Rulings (this doc) + reading DEC-12-4 rationale | 0.5–1 h |
| Front A (legacy move, banner, root, README) gates | 2–3 h |
| Front B 14 commits: copy gate on ~25 strings, browser gate, Clome cold read, commits | 5–7 h |
| R8 MPC spot check | ~1 h |
| C rulings R1–R4 hand-commits (fold into C1–C4) | 0.5 h |
| **A+B total** | **~9–12 h ≈ 1.5 weeks** of 19.5's 22–25 h budget |

Most likely failure mode: B8 (unsourced figures) and B14/R7 (anchor classification) turn into research holes. Mitigation is already in the rulings: remove rather than source, and STOP on any unclassifiable anchor.

## 4. DEC-19.5-2…-8

Lock as drafted, with one amendment to **-2 (disposition rule):** "A disposition on a row marked *audit only (unverified)* is a hypothesis. The fixing dispatch verifies at HEAD first and may reclassify to ALREADY-FIXED/REFUTED with evidence. Reclassification across fronts requires Hudson's ruling."

## Addendum 1 (2026-10-14) — Nova catches Nova + recommended answers to the three reserved rulings

**Correction, B8 / B5-F06.** INVARIANTS.md's INV-016d amendment (DEC-13-3) itself quotes "~1 m/s-per-degree, JPL DESCANSO evidence". So the shipped string matches a LOCKED amended invariant, and B5-F06 is a RULING row rather than a removable copy item. Proposed: the agent first checks whether committed evidence supports the figure. If not → additive INV-016d note ("figure not in committed evidence; qualitative wording 'below screening error bars' stands"), and the UI string drops the number in the same commit. Hudson rules.

**R10 confidence up.** INVARIANTS gives the reason the atmosphere "must be spherical": shells are scene siblings so they don't *inherit* the body's non-uniform Y-scale. That is a rule against accidental inheritance, not a physics claim. A deliberate shell that matches the body's own figure is consistent with it. [Certain] that the stated reason is inheritance; the amend ruling moves from [Likely] to strongly supported.

**R11 update.** V2 founding §3.1.1 sanctions camera-relative positions *at the GPU upload boundary* (floating origin). The forbidden case is scene children positioned camera-relative (the halo bug). The Slice 22 recon question is therefore exact: on earth-moon, are `scene.add()` children fed `worldPos − anchor − cameraPos`?

**R5 (recommended):** Yes, the rationale decides it, by this rule. If DEC-12-4's OFF default exists to keep porkchop colour reserved for C3 or to avoid visual clutter → **amend to ON**, because later locked work was built on ON: the Slice 13 guided tour's Replay explicitly restores "DLA-on", and B5-F11 makes the disclosure independent of the toggle anyway. If the rationale is a correctness concern (e.g., DLA not yet validated at lock time) → check that the INV §4 DLA validation has since passed; if it has, amend to ON; if not, set the code to OFF. Default if nobody reads it: amend to ON.

**R8 (recommended):** Three different hands. (1) An agent produces a stratified sample of 10 bodies from the repo: each body's quality band plus the source fields the DEC-17-4 copy rests on. (2) Clome looks up those 10 on the MPC site, read-only, and records the values it sees. (3) Hudson compares (≈15 min) and the result lands in §9. Pass = every band matches MPC. Any mismatch → the copy changes in Front B.

**R15 (recommended):** Yes, worded so the marginal CIs are not read as the test: "Slice 16 reports descriptive per-condition results with confidence intervals. The pre-registered contrast analysis (DEC-16-8: difference vs 10 pp, Holm-corrected) has not been computed yet; it is scheduled for Slice 21." Nothing may claim a significant or non-significant difference until then.
