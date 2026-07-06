# Slice 14 Founding Document — Packaging & Showcase

**Status:** LOCKED (Hudson, 2026-07-06). Additive/annotation-only from here.
**Author:** Hudson Clavin (drafted by Nova, 2026-07-05)
**Prior slice:** Slice 13 (mission cost card, two-regime dogleg pricing; founding doc `3be2ae4`; closed 2026-07-03; live bundle `porkchopV2-CiQFCFdl`, run #251 green)
**Next slice (planned):** Slice 15 (candidates from the OQ-14-6 triage table)
**Target path in repo:** `src/v2/SLICE_14_FOUNDING.md`

---

## §1. Slice intent

Slice 14 ships zero new physics. It packages evidence that already exists so that each cold-visit persona finds, within their first 90 seconds, the thing that establishes credibility *for them*:

- **Front 1 — Methodology surface** (Persona B, Anthropic Fellows / technical reviewers). An "About this tool" page whose spine is a table of links to real committed repo artifacts — founding docs, audit reports, validation data — each framed in plain English by what it demonstrates. Evidence links, not marketing claims. Headline feature of the slice.
- **Front 2 — Validation card** (Persona C, industry). A compact card beside the porkchop: data source + as-of date, coverage, validation method, measured error bounds. Every number rendered from a single committed provenance artifact.
- **Front 3 — FK3 guided narrative** (Persona A, admissions-adjacent). An on-load, dismissible walkthrough of the default showcase body (2020 FK3): cheap-looking cell → DLA overlay → RED verdict → "this is what the tool refused to endorse." Unblocked by the pre-slice copy pass (DLA on by default, `b8370f1`).

Slice 14 also locks the **anti-porting invariant** — the permanent rejection of the Perplexity Progress Part 4 recommendation to port poliastro/adam_core physics (`d781a4e`, quarantined) — and decides the minimal-CI question (OQ-14-5).

Slice 14 does NOT touch the math layer: no solver, propagator, frame, pricing-model, or default-state changes beyond what the pre-slice copy pass already shipped. No pre-research shortlist feature beyond the three fronts is implemented (see §7, OQ-14-6).

---

## §2. Inherited invariants

INV-001 through INV-023 remain operative. **Numbering ground truth (overnight brief, 2026-07-06):** INV-022 (provenance) and INV-023 (no extrapolation) are defined in `SLICE_13_FOUNDING.md:25-26`; **INVARIANTS.md is behind** — its index is missing the INV-022 and INV-023 rows and the INV-016e row (cited in body text, absent from the §6 index). This sync debt is repaired as a gated additive micro-commit in Phase C, *before* INVARIANTS.md is surfaced as an About-page artifact — a visibly stale index on the credibility exhibit defeats the exhibit.

Specifically load-bearing in this slice:

- **INV-016 family (honesty layer, as amended through Slice 13):** the validation card and the guided narrative are new honesty-layer surfaces and inherit the disclosure discipline. Slice 14 extends the pattern from *model honesty* (what the numbers assume) to *process honesty* (how the tool was built) — the About page is that extension.
- **INV-022 (provenance — the invariant the reverted C3=5 anchor failed, `bcf1738`):** every number displayed on the validation card and About page must trace to a committed, verified artifact. Front 2 is INV-022 made user-visible.
- **INV-023 (no extrapolation):** the card's coverage copy inherits it — stated C3 ranges are the published-curve bounds, nothing implied beyond them.
- **Copy discipline shipped in the pre-slice pass (`fc76441`):** no internal-taxonomy strings user-facing without plain-English framing. Promoted to a standing invariant in §3 (INV-025) so it cannot regress.

---

## §3. Architectural invariants new in this slice

Numbered **INV-024/025/026** — settled by the overnight brief (2026-07-06): INV-022 (provenance) and INV-023 (no extrapolation) already exist in `SLICE_13_FOUNDING.md:25-26`; the draft's earlier 022/023/024 numbering would have collided.

- **INV-024 (anti-porting):** Aster's physics and orbital-mechanics layer is re-derived in-repo. External astrodynamics libraries (poliastro, adam_core, or successors) serve as **validation oracles only** — their code is never imported, ported, or transcribed into Aster's math layer.
  *Rationale:* Aster's core credibility signal is an independent implementation validated *against* a trusted reference. Porting deletes the signal. Source: Perplexity Progress Part 4 recommendation REJECTED and quarantined (`d781a4e`; recon confirmed the in-file header "⚠️ REJECTED, DO NOT ACT" and quarantine note).
  *Wording decision (Hudson, 2026-07-05):* narrowed scope to the physics/astrodynamics layer is approved, so the invariant does not ban infrastructure libraries (Preact, Three.js, vite). The handoff's broader "external libraries" phrasing is superseded by the wording above.

- **INV-025 (public-copy taxonomy rule):** User-facing copy never exposes internal taxonomy identifiers (slice/DEC/INV numbers, dispatch names) without plain-English framing. Artifacts linked on the About page are introduced by *what they demonstrate*, never by bare internal ID.
  *Rationale:* cold-visit finding (`9dc2ce0`) — "INV-016d as amended by Slice 13" read as an invented internal citation and cost trust. The copy pass fixed the instances; this invariant prevents the class.

- **INV-026 (trust-surface provenance):** Every numeric claim on a public validation/trust surface renders from a single committed provenance artifact (JSON), never from literals in component code.
  *Rationale:* the `df3225f` lesson — a data change wearing a hygiene costume shipped through UI literals. One provenance file makes the audit surface one file, and makes any future change to a public validation number an explicit, gated data commit. Extends INV-022 (provenance) to the rendering layer.

---

## §4. Open Questions (OQs)

**OQ-14-1: Which committed repo artifacts are reviewer-legible enough to surface on the About page, and what is the current top INV number?**
**Status: CLOSED 2026-07-05 (Phase 0 recon, `/tmp/slice14-phase0-recon.md`, HEAD `ed56f32`).**
Top defined INV = INV-021 (single, not a family); only lettered family is INV-016 (016c/d/e). ~24 SURFACE-AS-IS artifacts: 4 root process docs (AGENTS/STATUS/INVARIANTS/DEVLOG), 8 of 11 founding docs, ~12 research write-ups. **Strongest AI-directed-process exhibits: the Slice 12 and Slice 13 founding docs** — both carry explicit "drafted by Nova… locked by Hudson" authorship lines, which is exactly the process claim Front 1 makes. 109 raw ephemeris JSON dumps → DO-NOT-SURFACE. **Gap found:** no committed `*audit*` file exists — audits ran but their outputs were never committed as standalone artifacts (they live in-chat / founding-doc §8 records). This directly constrains DEC-14-2 (the About page cannot link "audit reports" as files) — see OQ-14-7.

**OQ-14-2: Which validation numbers are canonical for the Front 2 card, and what artifact does each trace to?**
**Status: CLOSED 2026-07-05 (Phase 0 recon). All four RESOLVED with commit evidence; none unresolved.** The drafting-time contradiction is settled — 3.6e-12 and 3.43e-14 are different artifacts validating different code paths, confirming the [Likely] hypothesis.

| # | Number (as it should display) | What it measures | Solver / config | Artifact | Commit |
|---|---|---|---|---|---|
| a | max rel **3.43e-14** | poliastro agreement | `lambert()` **M=0**, 50×50 grid, Apophis/Bennu/Itokawa | `poliastro-validation.json` | `3d5f1cd` (orig `bf177dd`) |
| b | max rel **3.60e-12** | poliastro agreement, **magnitude only** | `lambertMultiRev()` **M∈{1,2}** | `multi-rev-poliastro-validation.json` | `3560ff8` |
| b′ | (M=1 vectors / DLA validated separately) | vector + DLA agreement | M=1 oracle | `dla-oracle-m1-vectors.json` | `830a4d9` |
| c | max **1.18%** / RMS **0.55%** | cost-curve oracle, **STRICT class** | STRICT (sibling OBSERVED class = 3.11% / 2.10%) | `oracle-report.md` | `808e709` |
| d | source **NASA LSP elvperf**, as-of **2024-02-29** (queried 2026-07-02) | vehicle performance data | — | `launch-vehicles.ts:57-58` | `bcf1738` |

**Two labeling requirements this closure imposes on the card (both are honesty-layer, non-optional):** (1) the 3.60e-12 figure is **magnitude-only** — the card must not present it as validating the full M=1 solution including DLA; the DLA/vector validation is the separate `830a4d9` artifact. (2) The oracle 1.18%/0.55% is the **STRICT** class; an OBSERVED class 3× worse (3.11%/2.10%) exists. Displaying only the flattering number on a "we don't overstate" card is the exact failure mode this slice exists to prevent — see OQ-14-8.

**OQ-14-3: Does the guided tour run only on the default FK3 landing, or also on deep links to other bodies?**
**Status: OPEN — closes at the Phase D copy gate.**
Recommendation: FK3 default landing only. The narrative's claims (cheap cell → RED verdict) are true of FK3 specifically; a generic tour would either lie or go vague. Deep links with `?body=` ≠ FK3 get no tour.

**OQ-14-4: Final walkthrough copy (step count and wording).**
**Status: OPEN — closes at the Phase D copy gate (Hudson approves copy before the implementation dispatch runs).**
Four steps proposed in DEC-14-4. Copy is trust-critical per the cold-visit findings — it gets its own STOP gate, separate from code.

**OQ-14-5: Minimal CI — in or out of Slice 14?**
**Status: RESOLVED → IN (Hudson, 2026-07-05).** CI ships in Slice 14 as Phase A: `tsc --noEmit` + the existing golden-numbers test, in a workflow file separate from the Pages deploy, with a 2-dispatch descope tripwire (DEC-14-5). Formal lock with the rest of the doc.
Decision rationale on record — FOR: a tsc + golden-numbers gate would have caught the `df3225f` class; the handoff's precondition ("only after the pipeline stays stable") is now met (three consecutive green deploys #247/#250/#251 as of 2026-07-05); scope is small; landing it early gates the slice's own commits. AGAINST (retained, mitigated): scope addition to a packaging slice; Windows-dev vs Linux-CI friction ([Likely] not applicable — the `process.execPath` lesson was local `spawnSync`; Actions runners invoke tsc natively); a flaky gate is worse than none — hence the descope tripwire, and CI never blocks the fronts.

**OQ-14-6: Which pre-research shortlist items become Slice 15+ candidates?**
**Status: OPEN — not blocking; closes at slice close.** Recon extracted **25 council candidates** (IMPROVE 5 / ADD 4 / EMPHASIZE 4 / NOT-CONSIDERED 7 / consensus-5) + **5 progress-review features**, all verbatim with blank disposition slots, into the recon report. Triage table folds in here at close; dispositions are Hudson's.

**OQ-14-7: How does Front 1 evidence audit rigor, given no committed audit-report file exists?**
**Status: RESOLVED (Hudson, 2026-07-06).**
**Resolution: option (a) — link the founding-doc audit sections directly** (anchor exhibit: Slice 10 §OQ-8), optionally plus one curated "b-lite" exhibit. The overnight investigation reversed the Phase 0 recommendation of (b): the committed §OQ-8/§5a/AMD records are *substantive* — they name findings, severities, and remediation commits, not bare "audit ran" assertions — so they stand as evidence on their own. Meanwhile (b) can't be done honestly at full scope: the raw audit reports were transient and live outside the repo; a full retrospective reconstruction would be partly from memory, which fails verify-before-lock on the exact page built to demonstrate rigor. B-lite (a single curated exhibit transcribed from a surviving record) is optional at the Phase C copy gate, not required.

**OQ-14-8: Does the validation card show the STRICT oracle number only, or STRICT + OBSERVED?**
**Status: RESOLVED (Hudson, 2026-07-06).**
**Resolution: headline STRICT (class named) + OBSERVED one expand away — never STRICT-only.** The overnight read of `oracle-report.md` sharpened why: STRICT excludes exactly New Glenn's steep curve segment, where the tool is *knowingly* ~3% optimistic — OBSERVED max is **3.11% (New Glenn @ C3=25)**, RMS **2.10%**. Hiding the known-worst region under a credibility headline is survivorship bias enacted on the honesty card; a reviewer opening the linked report finds the worse number and the card's premise inverts. Card copy carries a one-line definition of each class.

**OQ-14-9: What does the golden-numbers test pin?**
**Status: RESOLVED (Hudson, 2026-07-06); golden rows approved as folded.**
**Resolution: pin production outputs of `payloadAtC3` / `deliveredMassKg` — not validation bounds.** Ground truth traced: `df3225f` changed a New Glenn curve literal that only moves `payloadAtC3`; the four OQ-14-2 error bounds never read that function, so a bounds-pinning golden set would miss the entire class. **Golden set (captured from production via /tmp probe, HEAD `ed56f32`): 9 `payloadAtC3` rows + 1 end-to-end `deliveredMassKg` case** — New Glenn C3 0→7180 / **5→6055** / 20→2365; Falcon Heavy Exp 0→15010 / 5→13677.5 / 20→10115; Vulcan VC6 0→10850 / 5→9990 / 20→7630 (Vulcan substituted for the assumed SLS-class vehicle, which doesn't exist in config); delivered-mass case →3494.511538898568 kg. The **New Glenn @ C3=5 → 6055** row is the literal `df3225f` catcher: re-adding the reverted 6360 anchor flips it red. *Known consequence, by design:* the planned, verified re-land of that anchor (the elvperf-screenshot micro-task) will legitimately flip this golden row — the test then forces an explicit, gated golden-set update in the same commit as the data change. That friction is the feature. Test implementation constraints: correct tsc spawn per INVARIANTS §5 (`process.execPath` + full bin path — never the `.bin/tsc` shim), and widen the `npm test` glob to `tests/**/*.test.mjs`.

**OQ-14-5: Minimal CI — in or out, and at what scope?**
**Status: IN (Hudson, 2026-07-05); scope SETTLED by overnight brief 2026-07-06.**
CI is Phase A. Recon + overnight facts that shaped it: (1) no `.github/` exists — Pages deploys from committed `docs/` via built-in branch-deploy, so `ci.yml` is the repo's first workflow, zero collision risk; (2) `tsc --noEmit` is **GREEN** on `ed56f32`; (3) `npm test` is **RED locally (33 pass / 135 fail) but the failure is environmental, not a defect** — 59 pre-existing test files spawn the `.bin/tsc` shim that INVARIANTS §5 forbids, which returns `status:null` under Windows `spawnSync`. Expected GREEN on a Linux runner; **must be verified there, not assumed** (Phase A gate). Consequence worth stating plainly: until the 59-file shim fix lands (cleanup queue, out of slice), the Linux CI runner is the *only* environment where the suite actually runs — which strengthens the case for Phase A. tsc-only is honest value (gates the fronts' new UI code) but is not `df3225f` protection; the golden test (OQ-14-9) is.

---

## §5. Locked DECs

*All entries LOCKED by Hudson, 2026-07-06. Amendments are additive-only (14.x), never in-place deletion.*

**DEC-14-1 (LOCKED) — Scope: three fronts + anti-porting invariant + minimal CI.**
Each front maps to exactly one persona gap identified by the cold-visit synthesis (`9dc2ce0`). Nothing else from the pre-research shortlists is implemented in Slice 14. Scope growth mid-slice splits into 14.x per slice discipline; it is not absorbed.

**DEC-14-2 (LOCKED) — Front 1: About page architecture.**
- Entry point: persistent "About this tool" link visible from both the catalog and porkchop surfaces (header or footer — placement at visual gate).
- Surface: static route `/v2/about/` (new vite entry), following the Slice 11 dedicated-route pattern — bookmarkable and shareable per INV-020. Rejected alternative: modal — not linkable, and reviewers arrive by shared URL.
- Content spine: (1) what Aster is — one paragraph; (2) how it was built — the AI-directed process, one paragraph, every claim evidence-linked; (3) the artifact table from OQ-14-1, each row framed per INV-025; (4) validation summary sourcing the same provenance JSON as Front 2; (5) repo link.
- **Anchor exhibits (from OQ-14-1):** the Slice 12 and Slice 13 founding docs are the strongest process evidence (explicit Nova-drafts / Hudson-locks authorship). Lead the artifact table with them.
- **Audit evidence (OQ-14-7 resolution):** the "adversarial audit before deploy" claim links the founding-doc audit sections directly — anchor exhibit Slice 10 §OQ-8, plus the other substantive §OQ-8/§5a/AMD records (named findings, severities, remediation commits). Optional b-lite single curated exhibit decided at the Phase C copy gate. No claim ships without its linked artifact (claims rule below).
- Link strategy: pinned-commit GitHub blob URLs for evidence artifacts (provenance semantics — the reviewer sees exactly the artifact that existed at publication) plus one "browse the repository (main)" link. Rejected alternative: main-branch links for everything — they rot when files move and weaken the provenance claim.
- **Claims rule (the anti-marketing enforcement):** every process claim on the page must have an adjacent artifact link. A claim with no artifact doesn't ship.

**DEC-14-3 (LOCKED) — Front 2: validation card.**
- Placement: compact card in the dedicated porkchop route's side panel; visible by default, expandable for detail.
- Fields, populated from the OQ-14-2 closure (each labeled with what it measures and which solver/config):
  - **Data source:** NASA LSP elvperf, as-of 2024-02-29 (`launch-vehicles.ts`, `bcf1738`).
  - **Lambert vs poliastro (M=0):** max rel 3.43e-14 — machine precision (`poliastro-validation.json`, `3d5f1cd`).
  - **Lambert vs poliastro (multi-rev M=1/2), magnitude:** max rel 3.60e-12 (`multi-rev-poliastro-validation.json`, `3560ff8`). **Must be labeled "magnitude only"**; the M=1 vector/DLA validation is the separate `dla-oracle-m1-vectors.json` (`830a4d9`).
  - **Cost-curve oracle (STRICT):** max 1.18% / RMS 0.55% (`oracle-report.md`, `808e709`). **Class named "STRICT"**; OBSERVED class — max 3.11% (New Glenn @ C3=25), RMS 2.10% — disclosed in expandable detail with a one-line definition of each class, per OQ-14-8. STRICT excludes New Glenn's steep segment where the tool is knowingly ~3% optimistic; the card says so plainly.
  - **Headline:** max observed error across surfaces, with the surface named.
- Data path: card renders exclusively from a single committed provenance JSON (target `src/v2/data/validation-provenance.json`; exact path at dispatch), whose rows are the table above, per INV-026. No numeric literals in component code.
- Copy: plain English per INV-025. **Honesty constraint:** no number appears without its class/config label; the STRICT and magnitude-only qualifiers are not optional footnotes — they are part of each number's meaning.

**DEC-14-4 (LOCKED) — Front 3: FK3 guided narrative mechanism.**
- Four-step dismissible walkthrough (coach-mark/spotlight overlay) on the dedicated porkchop route when it loads on the default showcase body (per INV-025, no internal IDs in tour copy): (1) this cell looks cheap — pin the global-minimum cell; (2) the DLA overlay — why declination constrains it, one sentence; (3) the RED verdict — the feasibility call; (4) the point — the tool surfaces what the cheaper-looking answer hides.
- First visit only: localStorage flag suppresses repeats; "Skip tour" available at every step; a discoverable "Replay tour" affordance so it isn't one-shot.
- Purely additive UI: touches no defaults, no math; intercepts no clicks outside its own UI once dismissed; behavior on non-FK3 deep links per OQ-14-3.
- **Truth constraint:** every claim in the tour must be true of the live rendered state at the step where it's made (e.g., the RED verdict is actually visible when step 3 fires). Verified at the Phase D visual gate.

**DEC-14-5 (LOCKED) — Minimal CI, two-part per Phase 0 recon.**
Separate `.github/workflows/ci.yml` — the repo's first committed workflow; no collision with Pages (Pages uses GitHub's built-in branch-deploy from `docs/`, not a workflow file). Trigger: push to main. Two parts:
- **A1 — tsc gate (ships now):** `tsc --noEmit` against the root `tsconfig.json` (only tsconfig; includes `src/**/*`). Gates the new front UI code against type regressions. Honest scope: this does *not* catch the `df3225f` data-literal class.
- **A2 — golden-numbers gate (`df3225f` guard):** the actual protection, now concrete per OQ-14-9: pin the 9 `payloadAtC3` rows + 1 `deliveredMassKg` case captured from production at `ed56f32` (values in OQ-14-9; Hudson approves rows at lock). Implementation constraints: the test must NOT spawn the `.bin/tsc` shim (INVARIANTS §5 — use `process.execPath` + full bin path, or avoid spawning tsc entirely); widen the `npm test` glob to `tests/**/*.test.mjs` so `tests/v2-lambert/` actually runs. Known consequence: the future verified re-land of the New Glenn C3=5 anchor flips the 6055 golden row red by design, forcing the golden update into the same gated commit as the data change.
- **Green-start facts (overnight brief):** `tsc --noEmit` GREEN on `ed56f32`; `npm test` RED locally for environmental reasons only (59 pre-existing files spawn the forbidden shim → Windows `status:null`). Phase A gate is therefore **green on the Linux runner**, verified in the Actions UI — local Windows red does not block, but runner green must be seen, not assumed.
- Descope tripwire: A1 not green on the runner within 2 dispatches → cut CI from the slice, log in §8, proceed (CI never blocks the fronts). A2 is cuttable independently to Slice 14.x if implementation balloons — but A2 is the part that earns "CI catches the df3225f class," so cutting it means dropping that claim, not keeping it hollow.

**DEC-14-6 (LOCKED) — Verification and audit.**
Three-lens audit before deploy per the multi-agent-audit skill, lenses adapted for a copy/UI slice:
- *Provenance lens* (mathematician seat): every card and About-page number vs its committed artifact, exact match.
- *Cold-reviewer lens* (adversarial seat): overclaim/trust audit of all new copy through Persona B's eyes — the cold-visit failure mode at higher stakes.
- *Architect lens:* additive-only verified (`git diff | grep '^-'` on protected docs), zero math-layer diffs, INV-024/025/026 compliance.
Reconciliation into HIGH/MED/LOW; HIGHs block deploy. Deploy per standing rule: build `docs/`, Hudson pushes, browser-verify the live bundle hash in the Network tab — a green Actions run is not deploy confirmation.

---

## §6. Phase breakdown

Every commit in every phase: recon-before-edit, explicit file whitelist, class tripwires, objective-evidence verify. **No hygiene exception** — the Slice 13 lesson is that every HIGH/MED came from work labeled "hygiene" that skipped gates.

- **Phase 0 — Recon (Claude Code, read-only, 1 dispatch).** Closes OQ-14-1 and OQ-14-2; extracts OQ-14-6 lists; confirms INV numbering; locates test entry points for CI. Tree untouched, findings to report. STOP: Hudson folds findings into this doc, then locks. *Recommended to run pre-lock.*
- **Phase A — CI (1–2 dispatches).** STOP gate: green run on a no-op commit, verified in Actions UI. Descope tripwire per DEC-14-5.
- **Phase B — Provenance JSON + validation card (2–3 dispatches).** JSON commit first with its own STOP gate (Hudson verifies each row against its artifact); then card UI. Visual gate. Class tripwire: STOP if any diff hunk outside the provenance JSON touches a numeric data literal.
- **Phase C — About page (2–3 dispatches).** First: INVARIANTS.md sync micro-commit (additive rows for INV-022, INV-023, INV-016e index — the file is a surfaced exhibit and must not display a stale index; gated like everything else). Then: copy gate BEFORE implementation (Hudson approves page copy + artifact table, incl. the optional b-lite audit exhibit); implementation; link-resolution check (every pinned URL returns 200); visual gate.
- **Phase D — FK3 guided tour (2–3 dispatches).** Copy gate first (closes OQ-14-3/14-4); implementation; visual gate covering dismiss-persistence, replay, deep-link behavior, and the truth constraint — browser checks via Claude-in-Chrome or Hudson (Codex has no browser surface).
- **Phase E — Audit + deploy (2–3 dispatches).** Three lenses + reconciliation; findings fixed as separate gated dispatches; build; Hudson pushes; bundle-hash verify; close doc (§8 + OQ-14-6 disposition).

Order rationale: CI early so the fronts' commits land gated; card before About because the provenance JSON feeds both; tour last as the highest-UI-risk front.

---

## §7. Out of scope

- Any math-layer change — solver, propagator, frames, pricing model, defaults.
- Every pre-research shortlist feature beyond the three fronts (triaged to Slice 15+ via OQ-14-6).
- Porting external physics code — permanently, per INV-024, not merely deferred.
- Re-landing the New Glenn C3=5 anchor. That is its own micro-task with its own gates: manual elvperf screenshot + oracle row + tracked DEC-13-1 amendment.
- Cleanup-queue MED/LOWs (STATUS/doc drift, M-3 stationkeeping constant duplication, M-4 ΔV-panel NaN guard, author-email config, and the newly found **59-test-file shim violation** — the INVARIANTS §5 fix that would make `npm test` runnable on Windows again; real work, its own future task). If one collides with slice work, it ships as its own atomic, fully gated commit — no hygiene exception.
- Real-human reviewer testing. The cold-visit personas were simulated; real-reviewer feedback is a Slice 15+ input, not a Slice 14 deliverable.

---

## §8. Engineering record (running log)

- **2026-07-05 — Draft authored by Nova.** Sources: session handoff (2026-07-05), project-instructions state block, slice-discipline skill, Slice 11 founding doc (house style), `poliastro-validation.json` (`bf177dd`). Pre-research artifacts on record: council review `0667def`, Perplexity Progress `d781a4e` (Part 4 = porting REJECTED, quarantined), cold-visit UX `9dc2ce0` (findings vs the pre-copy-pass bundle; copy findings hold, numeric ones don't).
- **2026-07-05 — Drafting-time contradiction logged** (per AI-draft rules, not silently reconciled): handoff cites poliastro "3.6e-12"; committed Slice 11 Measurement 3 records max rel 3.43e-14 (M=0). [Likely] different artifacts validating different code paths (M=0 `lambert()` vs `lambertMultiRev()`, DEC-9 bar ≤1e-6). OQ-14-2 resolves with file+commit per number before any card copy locks.
- **2026-07-05 — Drafting-time gap logged:** the three pre-research artifacts are committed but were not in the drafting context; front scope drawn from the cold-visit synthesis as captured in the handoff. Shortlist contents deliberately not paraphrased (confabulation risk); Phase 0 extracts them verbatim (OQ-14-6).
- **2026-07-05 — Invariant wording delta logged:** the anti-porting invariant (now INV-024) narrows Hudson's handoff draft from "external libraries" to "external astrodynamics libraries"; approved by Hudson same day.
- **2026-07-05 — Two DRAFT decisions recorded (Hudson).** (1) anti-porting invariant (now INV-024) wording: narrowed "external astrodynamics libraries" phrasing approved; handoff's broader "external libraries" superseded. (2) OQ-14-5 → IN: minimal CI is Phase A; DEC-14-5 de-conditionalized; DEC-14-1 scope updated. Both still PROPOSED — full doc locks once, after Phase 0.
- **2026-07-05 — Phase 0 recon folded in** (`/tmp/slice14-phase0-recon.md`, HEAD `ed56f32`, repo verified byte-identical). Settled: OQ-14-1 CLOSED (24 SURFACE-AS-IS artifacts; Slice 12/13 founding docs are the anchor exhibits; no committed audit file — gap → OQ-14-7); OQ-14-2 CLOSED (all four numbers traced with commits; the 3.6e-12 vs 3.43e-14 contradiction resolved as multi-rev-magnitude vs M=0, hypothesis confirmed); top INV = 021 so draft provisionally numbered new invariants 022/023/024 — superseded 2026-07-06: real top is INV-023 (SLICE_13_FOUNDING), final numbering 024/025/026. Surfaced three new decisions: OQ-14-7 (audit-evidence gap), OQ-14-8 (STRICT-vs-OBSERVED oracle display), OQ-14-9 (golden-set contents). CI scope re-opened: no golden test exists, tsc-only ≠ df3225f protection; DEC-14-5 split A1/A2.
- **2026-07-06 — Overnight decision brief folded in** (`/tmp/slice14-decision-brief.md`, HEAD `ed56f32`, repo verified untouched). OQ-14-7 RESOLVED → option (a), link founding-doc audit sections (reversed Phase 0's (b) recommendation: raw reports are transient/out-of-repo, full reconstruction would fail verify-before-lock; §OQ-8/§5a/AMD records are substantive). OQ-14-8 RESOLVED → STRICT headline + OBSERVED (3.11% New Glenn @ C3=25 / 2.10% RMS) one expand away; STRICT excludes the segment where the tool is knowingly ~3% optimistic. OQ-14-9 RESOLVED → golden set pins production outputs: 9 `payloadAtC3` rows + 1 `deliveredMassKg` case, incl. the df3225f catcher (New Glenn C3=5 → 6055). INV numbering corrected: INV-022/023 already exist in SLICE_13_FOUNDING.md:25-26 (INVARIANTS.md index is behind — sync micro-commit added to Phase C); new invariants final **024/025/026**; the drafting-time "[Likely] instruction drift" call was wrong-direction, updated openly. CI facts: tsc GREEN; npm test RED locally, environmental only (59-file shim violation, Windows `status:null`); Phase A gate = green on the Linux runner. Vulcan VC6 substituted for the assumed SLS-class vehicle (none exists in config).
- **2026-07-06 — DOC LOCKED (Hudson).** Three overnight resolutions (OQ-14-7/8/9) and the 9+1 golden rows confirmed as folded; DEC-14-1…6 locked; new invariants INV-024/025/026. Founding doc is committed as the first Slice 14 commit; all subsequent writes additive-only. Next: Phase A dispatch (ci.yml A1 + golden test A2).
