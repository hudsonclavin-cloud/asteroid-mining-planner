<!-- DRAFT — NOT LOCKED. Authored 2026-07-07 (Fable session,
pre-Slice-15-publish). Ingested 2026-07-18 per S16-PRE-INGEST
dispatch; body text byte-preserved from the authored draft.
Slice NUMBERING in this file may be stale — reconciled at
design-lock, not here. Additive-only rules apply AFTER lock; until
lock this file is a working draft. -->

# Aster Dossier — Founding Document (family product · Wave 1)

**Status:** DRAFT — pending Hudson review and lock. Every §5 entry is PROPOSED. Only Hudson converts PROPOSED → LOCKED.
**COPY-VERSION:** DOSSIER-FOUNDING-DRAFT-2026-07-07-A
**Author:** Nova (draft) for Hudson Clavin
**Charter basis:** ASTER_FAMILY_CHARTERS.md L3 (CHARTERED, Wave 1, priority-upgraded; first pick per DECISIONS_2026-07-07 D4)
**Prior work:** Slice 15 Phases A–D1 (envelope core shipped @ c5d1173, 16/16 tests; explain_cell derivation trail live @ a4bb189)
**Slice number:** assigned at build entry (OQ-D4, Hudson's call)

## §1. Intent

Dossier answers one decision question: **"can we hand this analysis to a skeptic?"** It ships a generator that turns an Aster analysis — target, transfer window, vehicle, site — into a **self-contained, print-grade evidence packet**: every number carrying its SourceRef and confidence class, assumptions enumerated, validity envelopes stated, **refusals shown in the record**, a validation summary appended, and the generation commit + reproduction pointer embedded. The packet showing what the tool *declined* to claim is the spine of its credibility — a dossier with a visible `out_of_envelope` refusal in it is more trustworthy than one scrubbed clean, and that inversion is the product.

Dossier is the family thesis made concrete: **a Lens is a renderer of envelopes.** It computes nothing, sources nothing new, and imports no domain. ~90% substrate reuse is not an estimate anymore — the adapter layer it renders from exists and is tested (Slice 15 Phases B–D1).

Dossier explicitly does NOT: add or modify math; touch the catalog or screening; introduce any number lacking an envelope; build a general document platform (one dossier type in v1); require hosting (static output).

## §2. Inherited invariants

- **INV-024 (anti-porting)** — inherited by number; no astrodynamics libraries anywhere near this (it renders, it doesn't compute).
- **INV-026 (trust-surface provenance)** — EXTENDED here to generated documents: a dossier is a trust surface; every rendered figure derives from a committed envelope, never a literal in template code.
- **INV-027 (no math in adapters)** — inherited transitively: Dossier consumes the same tool-layer envelopes the MCP server emits; if a wanted number doesn't exist in an envelope, the dossier shows its absence — it never computes one.
- **INV-032 (no non-finite on the wire)** / **INV-033 (anti-fabrication)** — inherited; the generator refuses to render an envelope that fails validation, and every SourceRef it prints is the envelope's, verbatim.
- **NUMBERING NOTE (tonight's lesson, stated loudly):** §3 numbers are provisional **INV-038/039, contingent on Slice 16 locking INV-034..037 first**. Verify the INVARIANTS.md ceiling at this doc's lock; renumber if the S16 lock hasn't landed.

## §3. New invariants (provisional numbers per §2 note)

- **INV-038 — Refusals are rendered, never removed.** Any refusal encountered while assembling a dossier appears in the packet as a first-class entry (code, reason, what_would_help). Styling or "readability" pressure to drop one is the charter's kill-tripwire: stop, don't ship.
- **INV-039 — A dossier is reproducible from its own header.** Every packet embeds: generator version, server/repo commit, envelope `as_of` values, and the exact regeneration command. A packet whose numbers can't be regenerated is not a Dossier artifact.

## §4. Open Questions

**OQ-D1: Does static HTML + print CSS meet "hand to a skeptic" grade?**
STATUS: OPEN — Phase A spike: render one section with the v2 design system + a print stylesheet, browser print-to-PDF, Hudson eyeballs it (his visual verdict is the instrument, per standing pattern). Fallback if it fails: a PDF pipeline becomes a Phase E decision, not a v1 blocker — HTML packet alone already satisfies the charter's core output.

**OQ-D2: What does a technical diligence reader check first?**
STATUS: OPEN, NON-BLOCKING — charter pre-research item. Shapes section *order*, not content. Opportunistic: one conversation when available; the default order in DEC-D3 stands until then.

**OQ-D3: Where do generated dossiers live so the site build doesn't destroy them?**
STATUS: OPEN — TRIPWIRE-GRADE recon before any commit. Pages serves committed `docs/`; if `npm run build` regenerates/cleans `docs/`, hand-committed dossiers there get wiped or churned. Likely answer: the app's static-passthrough dir (`public/dossiers/` → copied into `docs/dossiers/` at build), but VERIFY the build's actual behavior first — this is exactly the class of assumption that bites. **Related prerequisite: the parked docs/ CRLF-churn fix graduates from cleanup-queue to blocking** — Dossier is the first work that legitimately commits generated content through the docs pipeline; the churn must be fixed at the source before Phase C, or every dossier commit carries phantom diffs.

**OQ-D4: Entry timing + slice number (Hudson's call).**
STATUS: OPEN — recommendation: Phase A (recon + print spike) may start now — the charter's entry gate ("envelope shipped") is **already satisfied** (Phase B, 16/16). Phases C–D need the D2 tools (`estimate_mission_cost`, `get_validation_report`) for sections 6–7, so full build entry follows Slice 15 D2. Slice number assigned then.

**OQ-D5: Flagship dossier target.**
STATUS: OPEN, Hudson's call at lock — default per D4 rationale: **the 2020 FK3 analysis** (self-dogfooding; the packet doubles as application/pitch material). Confirm or substitute.

## §5. Decisions (all PROPOSED)

**DEC-D1 (PROPOSED): Dossier is a pure envelope renderer, same repo.**
Input: EvidenceEnvelope JSON produced by the SAME tool-layer functions the MCP server uses (search_bodies/get_body/porkchop_scan/explain_cell + D2's cost/validation tools). Output: one self-contained HTML file. Zero math, zero new data sources, zero new domains. Rationale: the charter's ~90%-reuse claim is now literal — D1 proved the full derivation trail composes in Node with no new accessors.

**DEC-D2 (PROPOSED): Generation path = Node generator script, static output.**
A generator under the mcp-adjacent layer (e.g. `mcp/src/dossier/` or `tools/dossier/`) composes envelopes and emits static HTML with a print stylesheet (PDF = browser print, per OQ-D1). NOT in v1: an in-app "Export" button (v1.1 candidate once the generator exists), server-side rendering, or any hosted component. Rationale: reuses the just-built no-DOM adapter layer; produces a durable, committable, URL-shareable artifact; zero infrastructure. The charter's open trade (print-CSS vs server-side) is half-resolved by facts on the ground — Node adapters exist — leaving only the print-quality spike (OQ-D1).

**DEC-D3 (PROPOSED): v1 = ONE dossier type — the Mission Feasibility Dossier.**
For (body, departure cell, vehicle, site). Sections: 1 Header (title, generated-at, commit, regeneration command — INV-039); 2 Target summary (get_body: physical parameters with per-leaf confidence states — measured vs assumed rendered distinctly); 3 Transfer selection (porkchop context: coverage statement + the chosen cell, selection rule verbatim); 4 Derivation trail (explain_cell stages with per-stage provenance); 5 Site feasibility (DLA verdict, frame stated); 6 Delivered mass & cost (estimate_mission_cost, weakest-link confidence displayed); 7 Validation appendix (get_validation_report: oracle classes with their class labels — STRICT vs OBSERVED, M=0 vs magnitude-only, per the standing conflation rule); 8 **Assumptions & Refusals register** (every assumption string; every refusal verbatim — INV-038).

**DEC-D4 (PROPOSED): First artifact = the FK3 flagship dossier** (pending OQ-D5), generated, committed, live-verified on Pages, linked from the About page's artifact list (which extends INV-026's blob-URL provenance pattern to it).

**DEC-D5 (PROPOSED): Visual identity = the existing v2 design system + a print stylesheet.** No new design language; the dossier should look like Aster because it IS Aster's output.

## §6. Phase breakdown

- **A — Recon + spikes (1–2 dispatches, can start now):** OQ-D3 build-behavior recon (read-only); OQ-D1 print spike (one section, Hudson-eyes STOP gate); confirm the docs/ CRLF fix lands first.
- **B — Generator core (1–2 dispatches):** envelope→HTML engine + sections 1, 2, 8 (header/target/refusals — the honesty spine ships first); unit tests asserting INV-038 (a refusal in input MUST appear in output) and the no-literal rule (INV-026 extension).
- **C — Full sections (1–2 dispatches, gated on Slice 15 D2):** sections 3–7 wired to the remaining tools.
- **D — Flagship (1 dispatch):** generate the FK3 dossier, commit via the OQ-D3-verified path, deploy, **live-verify by bundle/content check** (a green build is not deploy confirmation — standing rule), link from About.
- **E — Polish + v1.1 decision:** typography/print pass (Hudson-eyes gate); decide the in-app Export button.

## §7. Out of scope (v1)

Multiple dossier types; comparison dossiers (compare_bodies territory — parked with the reserved MCP slot); any hosted generation; PDF pipelines beyond print CSS unless OQ-D1 fails; editing/annotation features; any Lens beyond this one.

## §8. Engineering record

- 2026-07-07 — Drafted (Nova, Opus session) from the L3 charter after D4 delegated the Wave-1 pick. Draft-time facts: entry gate ("envelope shipped") already satisfied (Phase B @ c5d1173, 16/16); the charter's print-vs-server pre-research question is half-resolved by the existence of the Node adapter layer (D1 @ a4bb189) — logged as a charter→reality delta, not a contradiction. Two hazards surfaced at draft time and encoded: the docs/-wipe question (OQ-D3, tripwire-grade) and the CRLF-churn cleanup item promoted to a Dossier prerequisite. Numbering contingency on S16's INV-034..037 stated in §2. No fake locks: every DEC is PROPOSED; OQ-D4/D5 are Hudson's calls.
