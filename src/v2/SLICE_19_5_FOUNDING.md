# SLICE 19.5 — HONEST FRONT DOOR — FOUNDING DOCUMENT

STATUS: DRAFT — not locked. Hudson locks with a dated line in §9 after Phase 0.
Repo home when committed: `src/v2/SLICE_19_5_FOUNDING.md` (precedent: SLICE_8_5).
Additive-only once committed. §2.3's disposition table is filled in by Phase 0,
not by this draft.

## §1. Purpose and scope

Slice 19.5 implements two inputs:
1. The independent repository sanity audit at `69472a3` ("the audit"): 326 surviving
   findings (21 HIGH · 124 MEDIUM · 181 LOW), plus its §11 action list.
2. The Aster Design System artifact (https://claude.ai/artifact/6SLvf2chPcY9fodg8BDN2Y,
   re-synced to main@c185c33).

Its subject is the gap between what Aster claims and what a visitor, an agent or a
re-runner actually meets:
- the front door serves a different product;
- shipped strings contradict each other;
- evidence cannot be re-run;
- tests cannot fail;
- the agent control plane is stale;
- the honesty rules exist as copies scattered across surfaces rather than as shared
  components.

"Implement everything" means **every finding receives exactly one disposition**
(§2.3 rules). It does not mean every finding becomes a code change. About 90 findings
are STALE prose, and 22 sit in a legacy runtime that LEGACY.md freezes.

IN SCOPE: Fronts A–G (§6).

OUT OF SCOPE:
- K1/K4/H0 and the payload per-body record path (Slice 20+).
- Precision-per-tier policy (Slice 21).
- Fixing legacy V1 economics: quarantine, don't repair (DEC-19.5-1, LEGACY.md).
- New features.

## §2. Inputs and pre-research

### §2.1 The audit (lead-grade until re-verified)
- Ran at `69472a3`, which predates Slice 19 Fronts B/C, D10 and the CI fix. Some findings
  are already fixed:
  - the ΔV stack mode bug: fbe8e89, e0c3447;
  - the CRLF fixture hash: D04 fixed the fixture, but `earth-vz-span-max.json` still pins
    the CRLF hash;
  - STATUS staleness: partly fixed by 2983ef7 and c185c33.
- Verification depth varies:
  - 80 findings got adversarial two-lens verification; 4 were refuted.
  - 204 of the MED/LOW rows show "checked 0", meaning single-source.
  - The legacy-economics and honesty-surface HIGHs were reproduced by the orchestrator.
- Rule: **audit prose is a hypothesis.** Every fix dispatch re-verifies its finding
  against the repo before changing anything (Slice 18 lesson: five errors came from
  inherited prose).

Nova spot-verified at c185c33, 2026-10-12:
- **FK3 tour, still live.** Its AMBER step still says "flies only with a dogleg"
  (`fk3-guided-tour.ts:36`). Since fe61ef9 the badge on the same screen says
  "Raised inclination".
- **Hooks don't install from a clone.** `.githooks/*` are mode 100644 and nothing sets
  `core.hooksPath`.
- **Legacy root confirmed.** Root `index.html` is the legacy entry
  (`vite.config.ts` input `legacy`), with og:description "The Bloomberg Terminal of
  space resource extraction … calculate your ROI".

### §2.2 The design system (artifact; repo is NOT yet bound to it)
- **Center:** the honesty contract. The components are C3Value, NearZeroC3Badge,
  StatusBadge (tier), FeasibilityBadge, EvidenceBadge with Panel source line, and
  HonestyChips. The rule: **no number without its unit, fidelity, grid/provenance and a
  refusal state.**
- **Meaning colours are fixed:** screening status, tier, feasibility, evidence class,
  viridis, and cyan = co-orbital.
- **Dialect:** it records two surface dialects with no decision between them, and
  recommends slate for new surfaces.
- **Accessibility gaps** (source pairs kept as-is, flagged):
  - white on `status-low-c3`: 4.1:1;
  - white on `tier-l1`: 4.0:1;
  - `text-catalog-hint` on `surface-sidebar`: 3.3:1;
  - no focus style exists anywhere.
- **Not adopted:** the repo has no tokens, no shared components and no font files. The
  design system says "Until [a slice charters adoption], the code is the authority."

### §2.3 Disposition table (filled by Phase 0; Hudson rules)

Every finding gets exactly ONE disposition:

| Disposition | Meaning |
|---|---|
| ALREADY-FIXED | Fixed after 69472a3. Cite the SHA and the command that proves it |
| REFUTED | Re-verification at c185c33 does not reproduce it. Cite the evidence |
| FIX-USER | A user-visible string, number, state or visual on a v2 surface is wrong. Front B, any severity |
| RULING | Spec and code disagree (a locked DEC vs shipped behaviour). Hudson rules: amend the DEC additively, or fix the code |
| FIX-EVIDENCE | An evidence artifact or script is unrunnable or wrong. Front D |
| FIX-TEST | A test cannot fail or doesn't prove what it's cited for. Front E |
| FIX-CONTROL | Agent control plane: STATUS/AGENTS/README/HANDOFF/hooks/CI/INVARIANTS index. Front C |
| DOC-ANNOTATE | Stale prose in a guarded or historical doc. An additive annotation, never an edit |
| LEGACY-QUARANTINE | Any finding in the legacy V1 runtime (`index.html` inline module, `src/economics/**`, `physics.worker.js`, `src/{physics,renderer,state,ui,utils,workers,data,styles}`). Resolved by DEC-19.5-1's banner and disclosure. No code repair |
| BACKLOG | A real issue below this slice's bar. Appended to `strategy/SLICE21_QOL_BACKLOG_TRIAGED.md` |
| WONTFIX | Stated reason required |

## §3. Decisions

Status per DEC: RULED (Hudson has decided) · PROPOSED (needs Hudson).

### DEC-19.5-1 — Product cutover: v2 at the root; V1 at /legacy/. RULED (Hudson, 2026-10-12: "legacy").
Proposed mechanics:
- **Build:** the legacy entry moves from `index.html` to `legacy/index.html`, and the
  vite input key `legacy` points there. Built output lands at `docs/legacy/index.html`.
  Repair the relative references: `./src/styles/main.css`, `./physics.worker.js`, and
  the worker copy plugin target.
- **New root `index.html`:** v2-owned. It redirects to `v2/solar-system/` (meta refresh
  plus a visible link) and carries v2 title, description and og tags. No ROI or
  "Bloomberg" language.
- **Legacy banner:** fixed, non-dismissible, at the top of /legacy/. It says this is the
  original 2026 prototype and is frozen, that its economic and value figures are
  unsourced and known to be wrong, and links to the v2 tool. Add a `noindex` meta tag.
- **Policy:** LEGACY.md permits "Explicit source-provenance and honesty-label fixes" and
  "Deploy fixes", so no legacy code is otherwise touched. LEGACY.md gets an additive
  section recording this product-level cutover, which the per-slice cutover bars did not
  contemplate.
- **Links:** external links to the root now land on v2. That's intended.

### DEC-19.5-2 — Audit disposition rule. PROPOSED.
§2.3 is the rule. Every finding is dispositioned before the slice locks. Every fix
re-verifies its finding first. A finding that turns out to be refuted is recorded, not
fixed.

### DEC-19.5-3 — Canonical visual dialect: slate. PROPOSED.
Slate text on near-black, sky `accent` as the single interface accent, 8–12 px radii.
- **Evidence for:** it's on the newer surfaces (About, porkchop, compare), and the accent
  already crosses into the catalog.
- **Against:** the catalog sidebar is the most-used surface and restyling it is a visual
  change with regression risk. Mitigation: F4 is cuttable.

### DEC-19.5-4 — Design system authority. PROPOSED.
- The repo becomes the authority for the code. A snapshot of the design system's
  `tokens.json` is committed at `src/v2/app/design/tokens.json`, with provenance: artifact
  URL, version id, sha256.
- `src/v2/app/design/tokens.ts` is GENERATED from it by `tools/design/gen-tokens.mjs`. A
  test fails if the two disagree.
- The artifact is re-synced FROM the repo after changes, never edited first. This avoids
  two sources of truth.
- Token values that encode meaning are imported, never re-typed (same rule as core
  constants).

### DEC-19.5-5 — Honesty components are shared modules. PROPOSED.
- C3Value, NearZeroC3Badge, StatusBadge, FeasibilityBadge and EvidenceBadge live once,
  in `src/v2/app/design/components/`.
- C3Value requires value, unit, grid and refusal state at the type level. A C3 display
  without a grid does not compile.
- Every C3 display on catalog, compare and porkchop routes through C3Value. A source-scan
  test forbids C3 formatting outside it.
- Behavioural tests render each component. No source-regex tests stand in for behaviour
  (K4 lesson, 2026-10-12).
- Pure refactor: rendered text must be byte-identical on all three surfaces before and
  after, proven by DOM-text snapshots.

### DEC-19.5-6 — Accessibility floor. PROPOSED.
- **Contrast:** text 4.5:1, or 3:1 at 24 px and above. Control borders, focus rings and
  icons 3:1. Measured by a script against the tokens.
- **Focus:** a visible 2 px `accent` focus outline, offset 2 px, on every focusable
  element.
- **Meaning colours** may shift in lightness to pass. They may not change hue family, and
  feasibility stays distinguishable by label (Direct / Raised inclination / Dogleg req.).
- **Sizes:** the 8 px halo floor and the 2.5 px point floor are NOT changed; the honesty
  chip states them.

### DEC-19.5-7 — Enforcement must exist where agents run. PROPOSED.
- `.githooks/*` are committed 100755, and a `prepare` script runs
  `git config core.hooksPath .githooks`, so hooks install on `npm ci` in every clone,
  including cloud agent sessions.
- AGENTS §2.1 is corrected additively to state exactly what is and isn't mechanically
  enforced.
- AGENTS gains a rule: no agent creates cloud or sibling sessions unless the dispatch
  authorizes it. The audit's test reader spawned six sessions, about $71, unplanned.

### DEC-19.5-8 — Date and span labels are derived from the computation that produced the numbers. PROPOSED.
Reverses recon S19-R1 Q1's ruling that "Grid spans 2026–2040" was acceptable nominal
copy. The same words mean "through end of 2040" on the catalog (screening cache) and
"up to 2040-01-01" on the porkchop page. 8.11% of cached best windows fall outside the
porkchop grid (audit §4). Every span label is derived from its grid's own parameters.
DEC-17-5 and DEC-19-2 precedent.

## §4. Open questions

- **OQ-19.5-1** — The 2026-08-04 sweep cites nine HIGH findings (R-03…R-17) that are
  stated nowhere in the repo. Recover the report from outside the repo, or strike the
  reference explicitly. Carrying nine unknowable HIGHs is worse than either.
- **OQ-19.5-2** — F4, migrating every remaining inline style to tokens and restyling the
  catalog to slate: this slice or Slice 21 (Living Sky)?
- **OQ-19.5-3** — Front G, planetary axes: this slice, or Living Sky with an interim
  on-screen disclosure ("planet axis orientations are not yet modelled")?
- **OQ-19.5-4** — Wording for the L2 tier split. "Measured, error unbounded" vs
  "not measured" goes through the copy gate.
- **OQ-19.5-5** — The RULING rows from Phase 0. Candidates already visible in the audit:
  - DEC-12-4 locks the DLA toggle default OFF; production ships it ON (B5-F07).
  - DEC-17-5 clauses are not implemented on compare (C3-F05).
  - INV-016d disclosures are hidden behind the DLA toggle (B5-F11).
  - INV-008…011 claim runtime enforcement that the code doesn't perform.
- **OQ-19.5-6** — The audit §12 structural fix: a script that generates STATUS's git-state
  block, plus a CI job that fails when a cited path, commit or count doesn't resolve.
  This slice (C12) or backlog?

## §5. Cut rule

Cut in this order if hours run out, recording each cut in §9:
1. F4 (full style migration).
2. G (axes → Living Sky, with the interim disclosure shipped in this slice; the
   disclosure itself is not cuttable).
3. C12 (STATUS generator / citation CI).
4. D4.

Not cuttable: Front A; every FIX-USER row; C1–C4; E1–E4; F1–F3.

## §6. Fronts

Order is by consequence; the riskiest front runs last. Gate types:
- [V] visual gate: Hudson in the browser, plus a Clome cold read;
- [C] copy gate: Hudson approves the wording before the implementation dispatch;
- [M] math gate: multi-agent audit before deploy;
- [P] protected path: unstaged, Hudson hand-commits.

**Phase 0 — intake and triage (read-only plus two non-code commits)**
- P0-1: commit the audit report as evidence at `tools/audit/sanity-69472a3/ASTER_AUDIT_REPORT.md`.
- P0-2: commit this founding doc DRAFT [P].
- P0-3: triage all 326 findings into §2.3 dispositions. Re-verify all 21 HIGH at c185c33.
  List every RULING row.
- P0-4: recons that the fronts depend on:
  - A: legacy move paths;
  - G: pole data in `vendor/naif/pck00010.tpc` and the oblate/ring modules.
- GATE: Hudson rules the dispositions, the RULING rows and the PROPOSED DECs, then
  locks §9.

**Front A — Front door [V]**
- A1: move legacy to /legacy/, add the banner and noindex, repair paths. LEGACY.md
  additive section.
- A2: new v2-owned root `index.html`: redirect, title, og.
- A3: `v2/index.html` redirect page still uses Space Mono. Move it to the system stack.
- A4: README front-door lines: what the site is, where v2 lives. This includes the audit
  HIGH A1-F02: README says Slice 16 has "no results exist".
- Deploy point 1, together with Front B.

**Front B — User-visible honesty (every FIX-USER row) [V][C]**

Known from the audit; Phase 0 adds the rest:
- B1: FK3 tour AMBER "penalty" step copy [C] (B3-F01, C5-F01).
- B2: L2 disclosure says "has not measured" for 7 of the 17 measured asteroids. Split the
  sub-reasons [C] (C5-F02).
- B3: compare size note.
  - The albedo factor is 2.93 where 2.07 is correct (C3-F02, C5-F08). Verify-before-lock
    the factor, then derive it from constants.
  - Check the inverse direction too: the darker-albedo factor is √(0.14/0.07) = 1.41.
- B4: validation card.
  - The multi-rev row describes a vector comparison as "magnitude only", and the next
    row's narrative rests on it (V4) [C]. Fixed in the provenance JSON (INV-026).
  - The About page restatement (C5-F06).
  - The OBSERVED row scope (C5-F09).
  - The 1.18% segment claim (C5-F07).
- B5: catalog empty state when tiers are missing or late: "tiers not loaded" vs "no
  matches" (C2-F07, C5-F03).
- B6: derived span labels per DEC-19.5-8. Porkchop "Grid spans", catalog footer.
- B7: `c3ToViridisRgb(NaN)` paints black. Route non-finite values to `plot-no-solution`
  (A2-F16, B3-F13).
- B8: unsourced shipped figures. Source them, or remove them with a refusal:
  - "~34–39 deg effective ceiling" (C5-F10);
  - "~1 m/s-per-degree" (B5-F06);
  - the co-orbital caveat's "4-year horizon" and error attribution (C5-F05).
- B9: INV-016c. The ΔV stack must disclose its model assumptions (impulsive,
  patched-conic, simplified rendezvous), not only its three numbers (C5-F11).
- B10: About-page link fragment (C5-F12) and the stale invariants exhibit pin (C5-F13).
- B11: any further FIX-USER rows from Phase 0.
- Deploy point 1.

**Front C — Control plane and enforcement**
- C1: rewrite STATUS.md's git-state, push and deploy-boundary sections from commands.
  Strike completed queue items (C1, C12, C17, the payload item, the branch merge). Fix the
  identity path. Fix the "artifacts not in version control" claims.
- C2: supersession banners on `REPO_AUDIT_2026-07-31.md` and `HANDOFF.md`. Re-route
  AGENTS §5 [P].
- C3: hooks — DEC-19.5-7 [P].
- C4: AGENTS §2.1 wording plus the no-unauthorized-sessions rule [P].
- C5: INVARIANTS.md [P], all additive:
  - the index row for INV-017…020: restore INV-019, drop "no partial renders";
  - resolve the INV-014 double definition;
  - define or retire INV-007;
  - write the INV-015 amendment;
  - reconcile INV-008…011's enforcement wording with INV-012/013 (or a RULING).
- C6: GM_SUN "DE430" attribution in 5 places. The value is the DE405-era figure, so the
  label is wrong, not the number. Any core file touched is [P].
- C7: SLICE_18 Front B date annotation; SLICE_13:100 reverted-anchor annotation;
  SLICE_17 §1 thesis-sample erratum (C3-F01) [P]. All additive.
- C8: annotate the `src/v2/research/` folder names in a README. Do not rename them;
  renaming breaks citations.
- C9: `ci.yml` header comment ("two gates… never builds docs/" vs the four jobs that
  actually run).
- C10: OQ-19.5-1 resolution.
- C11: DEVLOG Moon accuracy correction note (A5-F01).
- C12: STATUS generator and citation-check CI. Cuttable.

**Front D — Evidence that re-runs**
- D1: de-hardcode the 14 `tools/slice18-research/` scripts. Repo root from the script's
  own location; outputs beside themselves; the build tree under the OS temp dir.
- D2: re-run the Kepler sweep with the wrap actually applied. Commit the new artifact
  beside the old one and annotate the old one as the pre-correction pass (additive).
  Fix STATUS's undisclosed figure.
- D3: `measure-earth-vz.mjs`: fix the m/s vs km/s per-year bug, re-emit, re-pin the
  fixture hash on a committed-blob basis (B5-F03, A2-F03).
- D4: other FIX-EVIDENCE rows: M=1 artifact schemaVersion claim (B5-F08), elvperf date
  (B5-F09), DLA research summary errata (B5-F01/F02, additive). Cuttable beyond the
  errata.

**Front E — Tests that can fail**

Each strengthened test that FAILS against production is a defect finding: STOP, report,
and rule. Never weaken the test.
- E1: `v2-architecture.test.mjs` enforces AGENTS §1's wall, including non-relative and
  `@` alias specifiers.
- E2: Slice 9 tier distribution, asserted against an independent count of the records
  (not the fixture against itself).
- E3: the L1 boundary "independent re-implementation". Make it actually independent, or
  relabel it as self-consistency in STATUS and the test.
- E4: orbit-sampling tests. Add orientation (vector) assertions so a wrong rotation fails.
- E5: colormap tests assert against production `colormap.ts`, not a copy (B3-F11).
- E6: Hermite RMS excludes the zero-error anchors.
- E7: Slice 8 tally exact.
- E8: the high-eccentricity test asserts convergence, not only `isFinite`.
- E9: the camera-preset "top-down" test must be able to fail (C4-F03). Paired with G.

**Front F — Design system adoption [V]**
- F1: DS snapshot, generator, `tokens.ts` and sync test (DEC-19.5-4).
- F2: extract the honesty components (DEC-19.5-5). Migrate catalog, compare and porkchop
  to them. Byte-identical rendered text.
- F3: accessibility per DEC-19.5-6. The three contrast pairs plus the global focus ring.
  Keyboard focus on catalog rows and toolbar buttons.
- F4: migrate every remaining inline style in `src/v2/app/**` to tokens. Catalog restyle
  to slate per DEC-19.5-3. Cuttable.
- Deploy point 2.

**Front G — Planetary axes [M][P][V] (riskiest; last)**

All rotation axes and the Saturn ring plane are 59–115° off. The mesh pole sits on local
+Y and is tilted about X in a frame whose north is +Z. The orbital-plane obliquity is
being used as an angle from ICRF Z (C4-F01).
- G1: read pole RA/Dec for each body from the vendored `pck00010.tpc` into core constants
  [P]. Verify-before-lock against the kernel text.
- G2: orient each body's pole from RA/Dec in the scene's ICRF basis, with the texture
  prime meridian if available, else stated as unmodelled. Tests assert the angle from +Z
  per body against pck values; they must be able to fail.
- G3: multi-agent audit (mathematician, adversarial, architect, reconciliation) before
  deploy.
- G4: visual gate. Saturn's rings and Jupiter/Mars poles read correctly against a
  reference image; the top-down preset still works.
- Deploy point 3.

## §7. Acceptance
- `npm run verify` N/N green. MCP test and eval green. CI green on every pushed commit;
  a red CI blocks the next push.
- Every one of the 326 findings has a disposition in §2.3, with its evidence.
- The root URL serves v2. /legacy/ carries the banner and noindex. Live bundle hashes are
  browser-verified.
- A Clome cold read of the root, /legacy/, catalog, compare and porkchop finds no
  contradiction between two shipped strings, and no number without unit, fidelity,
  grid/provenance and refusal state.
- A fresh Linux clone plus `npm ci` installs working hooks. Proof: a guarded-doc
  bullet deletion is rejected.
- Every Slice 18 evidence script runs from a clean clone.

## §8. Entry / exit
- ENTRY: c185c33, CI green, Slice 19 LOCKED.
- EXIT: Fronts A–F shipped, or cut per §5 with §9 entries. G shipped or cut with its
  interim disclosure live. Founding doc LOCKED.
- Size estimate [Likely, ±30%]: about 40–48 hours. That's about 5–6 weeks at 8 h/week,
  larger than Slice 19. Fronts A and B are about 10 h and ship first.

## §9. Amendments and corrections
(Append only. Never edit above this line.)

### §9.1 Phase 0 ruling record — 2026-10-14 (Hudson)
- Ruling packet: tools/audit/sanity-69472a3/phase0/RULINGS.md (Nova, 2026-10-13, with
  Addendum 1 of 2026-10-14), accepted in full by Hudson 2026-10-14.
- Dispositions: tools/audit/sanity-69472a3/phase0/TRIAGE.md, as reclassified by
  RULINGS.md §2. In §6, "Front B: every FIX-USER row" means the visitor-visible rows
  (RULINGS.md §2a: 30 firm + 3 conditional). The other 27 B-routed and 4 G-routed
  rows are re-routed per RULINGS.md §2b; none are dropped (86 in, 86 out).
- Unverified rows: any disposition on a row marked "audit only (unverified)" is a
  hypothesis; fixing dispatches verify at HEAD first.
- R1 INV-008..011: amend to test-time enforcement (Front C, INVARIANTS [P]).
- R2 INV-014: namespace 014a (8.5 star background) / 014b (9 three-gate tier); the
  index stays authority (Front C).
- R3 INV-035/036: proposals take the next free IDs; 035/036 stay skipped (Front C).
- R4 SLICE_11:63: annotated superseded by DEC-7; code matches DEC-7 (Front C).
- R5 DEC-12-4 default: AMEND-ON; rationale quoted verbatim in the SLICE_12 DEC-12-4 amendment.
- R6 INV-016d: code fixed; disclosure renders whenever a verdict renders.
- R7 INV-022: basis field added to all 38 anchors.
- R8 DEC-17-4 MPC spot check: to be run (sample → Clome → Hudson); result appended
  to SLICE_17_FOUNDING.md §9. Not a waiver.
- R9 DEC-17-5 on compare: fixed in F2; moves to Front B if F2 is cut.
- R10 INV-001 atmosphere: amend to "shares its body's figure and orientation";
  implemented in Front G (Slice 22).
- R11 earth-moon camera-relative: recon in Front G before ruling.
- R12 prototype ring profile: annotate as procedural/unsourced/not shipped;
  docs/ check result: no hits.
- R13 INV-025: the bare "(OQ-7)" identifier removed (c9a7476). INV-026: the
  porkchop span literal is derived (446e3a7); the About catalog count is
  rendered from SLICE9_NEA_CATALOG_TOTAL_BODIES, bound by a data test to
  the committed catalog's totalBodies and record count (42e917d); the FIX1 loader
  approach (20fb6ce) was reversed because it fetched the full catalog on /about/.
  Whether a test-bound constant satisfies INV-026's 'never from literals' is a
  Front C clarification.
- R14 DEC-15-8 / INV-027 (MCP): fix in Slice 20 (math layer, audited).
- R15 DEC-16-8: compute the registered contrast in Slice 21 D; never amend the
  pre-registration; README carries the pending sentence.
- B5-F06 "~1 m/s-per-degree": CONFIRMED (the audit is right). The committed
  evidence (tools/slice13-research/literature/3d-verification-record.md:22)
  gives no per-degree number and says the DESCANSO lunar result is "not a
  liftable formula for interplanetary DLA pricing"; the figure appears only in
  the project's own synthesis (:31). The batch's REFUTED verdict cited the
  figure's existence, not its applicability; overturned by the independent verify run
  (tools/audit/sanity-69472a3/s19-5-runs/verify-REPORT.md). UI number removed (5a2f9b2); INVARIANTS note
  appended.
- Evidence correction (B2, b25acdc): tools/slice18-research/tier-sizing.mjs
  labelled 7 measured bodies (105140, 1979 XB, 2010 KD, 2021 CG6, 2024 BB8,
  2025 KP4, 433) "unmeasured"; the generator was fixed and the JSON
  regenerated. No keys were added or removed, and the only other changed value
  is generatedAtUtc, so every measured value reproduced exactly. Slice 18 text
  citing the old counts is DOC-ANNOTATE (Slice 24).
- Process record: the A+B batch report attributed B8a's test proof to
  tests/v2-fk3-guided-tour.test.mjs, which cannot fail for B8a; the real guard
  is tests/v2-dla-display.test.mjs. An independent mutation run proved all 12
  guards the batch left unproven (V1-V12). Nova's verify run checked only that
  guards can fail, not that they test rendered behaviour. FIX2 converted the R6
  and B9 guards to render tests (148b003, 79ab05e); the remaining source-text
-  guards (FIX2 G4 list) route to Slice 20 E.
- Evidence: S19.5 run reports are committed at tools/audit/sanity-69472a3/s19-5-runs/
  (01fb28a1ce53db5a1b56d23c6ea201031f0f0215). The A+B batch log was lost from %TEMP% before commit; the batch report is
  a recovered copy. Rule going forward: every run commits its own report and log.
- DEC-19.5-2 LOCKED as amended: "A disposition on a row marked audit only
  (unverified) is a hypothesis. The fixing dispatch verifies at HEAD first and may
  reclassify to ALREADY-FIXED/REFUTED with evidence. Reclassification across fronts
  requires Hudson's ruling."
- DEC-19.5-3, -4, -5, -6, -7, -8: LOCKED as drafted in §3.
- STATUS: this founding document is LOCKED as of 2026-10-14. This line supersedes
  the DRAFT header, which stays unedited under the additive rule.
