# Slice 14 Founding Document — Packaging & Showcase

**Status:** DRAFT — pending Hudson review and lock
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

INV-001 through INV-022 remain operative (top number to be confirmed against `INVARIANTS.md` in Phase 0 recon — INV-022 is the highest ID cited in current session records).

Specifically load-bearing in this slice:

- **INV-016 family (honesty layer, as amended through Slice 13):** the validation card and the guided narrative are new honesty-layer surfaces and inherit the disclosure discipline. Slice 14 extends the pattern from *model honesty* (what the numbers assume) to *process honesty* (how the tool was built) — the About page is that extension.
- **INV-022 (provenance — the invariant the reverted C3=5 anchor failed, `bcf1738`):** every number displayed on the validation card and About page must trace to a committed, verified artifact. Front 2 is effectively INV-022 made user-visible.
- **Copy discipline shipped in the pre-slice pass (`fc76441`):** no internal-taxonomy strings user-facing without plain-English framing. Promoted to a standing invariant in §3 (INV-B) so it cannot regress.

---

## §3. Architectural invariants new in this slice

Numbering provisional (INV-023/024/025) pending Phase 0 confirmation of the current top ID.

- **INV-A (anti-porting):** Aster's physics and orbital-mechanics layer is re-derived in-repo. External astrodynamics libraries (poliastro, adam_core, or successors) serve as **validation oracles only** — their code is never imported, ported, or transcribed into Aster's math layer.
  *Rationale:* Aster's core credibility signal is an independent implementation validated *against* a trusted reference. Porting deletes the signal. Source: Perplexity Progress Part 4 recommendation REJECTED and quarantined (`d781a4e`).
  *Wording decision (Hudson, 2026-07-05):* narrowed scope to the physics/astrodynamics layer is approved, so the invariant does not ban infrastructure libraries (Preact, Three.js, vite). The handoff's broader "external libraries" phrasing is superseded by the wording above.

- **INV-B (public-copy taxonomy rule):** User-facing copy never exposes internal taxonomy identifiers (slice/DEC/INV numbers, dispatch names) without plain-English framing. Artifacts linked on the About page are introduced by *what they demonstrate*, never by bare internal ID.
  *Rationale:* cold-visit finding (`9dc2ce0`) — "INV-016d as amended by Slice 13" read as an invented internal citation and cost trust. The copy pass fixed the instances; this invariant prevents the class.

- **INV-C (trust-surface provenance):** Every numeric claim on a public validation/trust surface renders from a single committed provenance artifact (JSON), never from literals in component code.
  *Rationale:* the `df3225f` lesson — a data change wearing a hygiene costume shipped through UI literals. One provenance file makes the audit surface one file, and makes any future change to a public validation number an explicit, gated data commit. Extends INV-022 to the rendering layer.

---

## §4. Open Questions (OQs)

**OQ-14-1: Which committed repo artifacts are reviewer-legible enough to surface on the About page, and what is the current top INV number?**
**Status: OPEN — closes via Phase 0 read-only recon (Claude Code).**
Deliverable: an inventory table — artifact, repo path, commit, one-line "what this demonstrates," legibility verdict (surface as-is / needs framing paragraph / do not surface). Also returns the top INV ID so §3 numbering finalizes. Recommendation: run this recon **pre-lock** (read-only, tree untouched, per the pre-lock-closure rules) so the locked doc carries real numbers instead of provisionals.

**OQ-14-2: Which validation numbers are canonical for the Front 2 card, and what artifact does each trace to?**
**Status: OPEN — closes via Phase 0 recon (targeted, in-repo; no external research).**
Contradiction logged at drafting time: the session handoff cites "poliastro 3.6e-12"; the committed Slice 11 Measurement 3 (`tools/slice11-research/data/poliastro-validation.json`, `bf177dd`) records **max rel 3.43e-14** (M=0, 50×50 grids, Apophis/Bennu/Itokawa). [Likely] 3.6e-12 is the Slice 11 `lambertMultiRev` audit result (DEC-9 bar was ≤1e-6) — a different artifact validating a different code path. The oracle figures (max 1.18% / RMS 0.55%) and the elvperf as-of date are cited from Slice 13 records and likewise need file+commit confirmation. Closure = a row per card number: {number, what it measures, artifact path, commit}. **No card copy locks until this closes.** Card copy must label which solver/configuration each number describes — a card that conflates M=0 machine precision with multi-rev tolerance is an honesty-layer violation on the surface built to demonstrate honesty.

**OQ-14-3: Does the guided tour run only on the default FK3 landing, or also on deep links to other bodies?**
**Status: OPEN — closes at the Phase D copy gate.**
Recommendation: FK3 default landing only. The narrative's claims (cheap cell → RED verdict) are true of FK3 specifically; a generic tour would either lie or go vague. Deep links with `?body=` ≠ FK3 get no tour.

**OQ-14-4: Final walkthrough copy (step count and wording).**
**Status: OPEN — closes at the Phase D copy gate (Hudson approves copy before the implementation dispatch runs).**
Four steps proposed in DEC-14-4. Copy is trust-critical per the cold-visit findings — it gets its own STOP gate, separate from code.

**OQ-14-5: Minimal CI — in or out of Slice 14?**
**Status: RESOLVED → IN (Hudson, 2026-07-05).** CI ships in Slice 14 as Phase A: `tsc --noEmit` + the existing golden-numbers test, in a workflow file separate from the Pages deploy, with a 2-dispatch descope tripwire (DEC-14-5). Formal lock with the rest of the doc.
Decision rationale on record — FOR: a tsc + golden-numbers gate would have caught the `df3225f` class; the handoff's precondition ("only after the pipeline stays stable") is now met (three consecutive green deploys #247/#250/#251 as of 2026-07-05); scope is small; landing it early gates the slice's own commits. AGAINST (retained, mitigated): scope addition to a packaging slice; Windows-dev vs Linux-CI friction ([Likely] not applicable — the `process.execPath` lesson was local `spawnSync`; Actions runners invoke tsc natively); a flaky gate is worse than none — hence the descope tripwire, and CI never blocks the fronts.

**OQ-14-6: Which pre-research shortlist items (council shortlist `0667def`; Perplexity Progress features `d781a4e`) become Slice 15+ candidates?**
**Status: OPEN — not blocking; closes at slice close.**
Phase 0 extracts both lists verbatim into a triage table appended to this section; disposition (Slice 15 candidate / rejected / absorbed-by-front) is recorded at close. The lists are deliberately not reproduced in this draft — the artifacts were not in the drafting context, and paraphrasing them from memory risks confabulation (§8).

---

## §5. Locked DECs

*All entries PROPOSED. Only Hudson converts PROPOSED → locked.*

**DEC-14-1 (PROPOSED) — Scope: three fronts + anti-porting invariant + minimal CI.**
Each front maps to exactly one persona gap identified by the cold-visit synthesis (`9dc2ce0`). Nothing else from the pre-research shortlists is implemented in Slice 14. Scope growth mid-slice splits into 14.x per slice discipline; it is not absorbed.

**DEC-14-2 (PROPOSED) — Front 1: About page architecture.**
- Entry point: persistent "About this tool" link visible from both the catalog and porkchop surfaces (header or footer — placement at visual gate).
- Surface: static route `/v2/about/` (new vite entry), following the Slice 11 dedicated-route pattern — bookmarkable and shareable per INV-020. Rejected alternative: modal — not linkable, and reviewers arrive by shared URL.
- Content spine: (1) what Aster is — one paragraph; (2) how it was built — the AI-directed process, one paragraph, every claim evidence-linked; (3) the artifact table from OQ-14-1, each row framed per INV-B; (4) validation summary sourcing the same provenance JSON as Front 2; (5) repo link.
- Link strategy: pinned-commit GitHub blob URLs for evidence artifacts (provenance semantics — the reviewer sees exactly the artifact that existed at publication) plus one "browse the repository (main)" link. Rejected alternative: main-branch links for everything — they rot when files move and weaken the provenance claim.
- **Claims rule (the anti-marketing enforcement):** every process claim on the page must have an adjacent artifact link. A claim with no artifact doesn't ship.

**DEC-14-3 (PROPOSED) — Front 2: validation card.**
- Placement: compact card in the dedicated porkchop route's side panel; visible by default, expandable for detail.
- Fields: data source + as-of date (elvperf); coverage (vehicle count, C3 range per vehicle); validation rows, one per method — Lambert-vs-poliastro (with grid, bodies, solver configuration) and cost-curve oracle (max / RMS) — each number labeled with what it measures; max observed error as the headline figure.
- Data path: card renders exclusively from a single committed provenance JSON (target `src/v2/data/validation-provenance.json`; exact path finalized at dispatch), populated only from the OQ-14-2 closure rows, per INV-C. No numeric literals in component code.
- Copy: plain English per INV-B.

**DEC-14-4 (PROPOSED) — Front 3: FK3 guided narrative mechanism.**
- Four-step dismissible walkthrough (coach-mark/spotlight overlay) on the dedicated porkchop route when it loads on the default showcase body: (1) this cell looks cheap — pin the global-minimum cell; (2) the DLA overlay — why declination constrains it, one sentence; (3) the RED verdict — the feasibility call; (4) the point — the tool surfaces what the cheaper-looking answer hides.
- First visit only: localStorage flag suppresses repeats; "Skip tour" available at every step; a discoverable "Replay tour" affordance so it isn't one-shot.
- Purely additive UI: touches no defaults, no math; intercepts no clicks outside its own UI once dismissed; behavior on non-FK3 deep links per OQ-14-3.
- **Truth constraint:** every claim in the tour must be true of the live rendered state at the step where it's made (e.g., the RED verdict is actually visible when step 3 fires). Verified at the Phase D visual gate.

**DEC-14-5 (PROPOSED) — Minimal CI.**
Separate `.github/workflows/ci.yml` (never merged into the Pages deploy workflow); jobs: `tsc --noEmit` + golden-numbers test; trigger: push to main. Descope tripwire: not green within 2 dispatches → cut from slice, log in §8, proceed.

**DEC-14-6 (PROPOSED) — Verification and audit.**
Three-lens audit before deploy per the multi-agent-audit skill, lenses adapted for a copy/UI slice:
- *Provenance lens* (mathematician seat): every card and About-page number vs its committed artifact, exact match.
- *Cold-reviewer lens* (adversarial seat): overclaim/trust audit of all new copy through Persona B's eyes — the cold-visit failure mode at higher stakes.
- *Architect lens:* additive-only verified (`git diff | grep '^-'` on protected docs), zero math-layer diffs, INV-A/B/C compliance.
Reconciliation into HIGH/MED/LOW; HIGHs block deploy. Deploy per standing rule: build `docs/`, Hudson pushes, browser-verify the live bundle hash in the Network tab — a green Actions run is not deploy confirmation.

---

## §6. Phase breakdown

Every commit in every phase: recon-before-edit, explicit file whitelist, class tripwires, objective-evidence verify. **No hygiene exception** — the Slice 13 lesson is that every HIGH/MED came from work labeled "hygiene" that skipped gates.

- **Phase 0 — Recon (Claude Code, read-only, 1 dispatch).** Closes OQ-14-1 and OQ-14-2; extracts OQ-14-6 lists; confirms INV numbering; locates test entry points for CI. Tree untouched, findings to report. STOP: Hudson folds findings into this doc, then locks. *Recommended to run pre-lock.*
- **Phase A — CI (1–2 dispatches).** STOP gate: green run on a no-op commit, verified in Actions UI. Descope tripwire per DEC-14-5.
- **Phase B — Provenance JSON + validation card (2–3 dispatches).** JSON commit first with its own STOP gate (Hudson verifies each row against its artifact); then card UI. Visual gate. Class tripwire: STOP if any diff hunk outside the provenance JSON touches a numeric data literal.
- **Phase C — About page (2–3 dispatches).** Copy gate BEFORE implementation (Hudson approves page copy + artifact table); implementation; link-resolution check (every pinned URL returns 200); visual gate.
- **Phase D — FK3 guided tour (2–3 dispatches).** Copy gate first (closes OQ-14-3/14-4); implementation; visual gate covering dismiss-persistence, replay, deep-link behavior, and the truth constraint — browser checks via Claude-in-Chrome or Hudson (Codex has no browser surface).
- **Phase E — Audit + deploy (2–3 dispatches).** Three lenses + reconciliation; findings fixed as separate gated dispatches; build; Hudson pushes; bundle-hash verify; close doc (§8 + OQ-14-6 disposition).

Order rationale: CI early so the fronts' commits land gated; card before About because the provenance JSON feeds both; tour last as the highest-UI-risk front.

---

## §7. Out of scope

- Any math-layer change — solver, propagator, frames, pricing model, defaults.
- Every pre-research shortlist feature beyond the three fronts (triaged to Slice 15+ via OQ-14-6).
- Porting external physics code — permanently, per INV-A, not merely deferred.
- Re-landing the New Glenn C3=5 anchor. That is its own micro-task with its own gates: manual elvperf screenshot + oracle row + tracked DEC-13-1 amendment.
- Cleanup-queue MED/LOWs (STATUS/doc drift, M-3 stationkeeping constant duplication, M-4 ΔV-panel NaN guard, author-email config). If one collides with slice work, it ships as its own atomic, fully gated commit — no hygiene exception.
- Real-human reviewer testing. The cold-visit personas were simulated; real-reviewer feedback is a Slice 15+ input, not a Slice 14 deliverable.

---

## §8. Engineering record (running log)

- **2026-07-05 — Draft authored by Nova.** Sources: session handoff (2026-07-05), project-instructions state block, slice-discipline skill, Slice 11 founding doc (house style), `poliastro-validation.json` (`bf177dd`). Pre-research artifacts on record: council review `0667def`, Perplexity Progress `d781a4e` (Part 4 = porting REJECTED, quarantined), cold-visit UX `9dc2ce0` (findings vs the pre-copy-pass bundle; copy findings hold, numeric ones don't).
- **2026-07-05 — Drafting-time contradiction logged** (per AI-draft rules, not silently reconciled): handoff cites poliastro "3.6e-12"; committed Slice 11 Measurement 3 records max rel 3.43e-14 (M=0). [Likely] different artifacts validating different code paths (M=0 `lambert()` vs `lambertMultiRev()`, DEC-9 bar ≤1e-6). OQ-14-2 resolves with file+commit per number before any card copy locks.
- **2026-07-05 — Drafting-time gap logged:** the three pre-research artifacts are committed but were not in the drafting context; front scope drawn from the cold-visit synthesis as captured in the handoff. Shortlist contents deliberately not paraphrased (confabulation risk); Phase 0 extracts them verbatim (OQ-14-6).
- **2026-07-05 — Invariant wording delta logged:** INV-A narrows Hudson's handoff draft from "external libraries" to "external astrodynamics libraries"; original preserved in §3 as the alternative for Hudson's call at lock.
- **2026-07-05 — Two DRAFT decisions recorded (Hudson).** (1) INV-A wording: narrowed "external astrodynamics libraries" phrasing approved; handoff's broader "external libraries" superseded. (2) OQ-14-5 → IN: minimal CI is Phase A; DEC-14-5 de-conditionalized; DEC-14-1 scope updated. Both still PROPOSED — full doc locks once, after Phase 0.
- *(Pending: Phase 0 findings fold-in → OQ-14-1/14-2 closed, INV numbering finalized → Hudson lock.)*
