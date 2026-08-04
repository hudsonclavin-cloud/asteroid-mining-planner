# RESEARCH RECOVERY MANIFEST — 2026-08 corpus
# 2026-08-04 · Nova (Fable) · companion to DISPATCH_RESEARCH_INGEST_revA.md
#
# Ground truth from transcript + disk forensics (2026-08-04):
# - Transcripts store attachment POINTERS only, never attachment content.
# - Transcript 1 (…05-52-17…) turn 4: "all of the perplexity results and the
#   claude result" = 6 attachments → P1–P5 raw results + the P0-R2 recon
#   report are NOT recoverable from this environment.
# - Transcript 2 (…23-03-37…) ends 21:32 UTC; the explainer/QOL result
#   pastes, S17 results, and sanity audit all postdate it. S17 results +
#   recon survive as PDFs in uploads; explainer/QOL results were text
#   pastes → lost verbatim (distillates survive).
# - Sanity-audit Lens 1 decisive test: ZERO tracked hits for any 2026-08
#   research term → none of this corpus is in the repo yet.

═══════════════════════════════════════════════════════════════════════════
§1. RECOVERED — download from this chat, place in ~/aster-intake-2026-08/
═══════════════════════════════════════════════════════════════════════════
File (as delivered)                          → repo target
---------------------------------------------------------------------------
PERPLEXITY_PRERESEARCH_LIVING_SKY.md         → tools/slice21-research/literature/
  P1–P5 prompts, fired 2026-08-02. Verbatim original (survived in outputs).
PERPLEXITY_ASTER_EXPLAINER_AND_QOL.md        → tools/slice21-research/literature/
  Explainer + QOL prompts, fired 2026-08-03. Verbatim original.
PERPLEXITY_PRERESEARCH_S17_TARGET_COMPARE.md → tools/slice17-research/literature/
  S17-Q1/Q2 prompts, fired 2026-08-03. Verbatim original.
S17_Q1_ACCESSIBILITY_RESULT.md               → tools/slice17-research/literature/
  Perplexity result. pdftotext of Slice_17_Q2.pdf (sha256 head in file
  header). ⚠ FILENAME SWAP: the PDF named "Q2" contains Q1.
S17_Q2_PRESENTATION_RESULT.md                → tools/slice17-research/literature/
  Perplexity result. pdftotext of Untitled_document__13_.pdf. ⚠ Was
  mislabeled Q1 in session notes; content is Q2.
S17_RECON_REPORT.md                          → tools/slice17-research/recon/
  S-S17-RECON-2026-08-03-A full findings (Claude Code, HEAD c6c0c52).
  pdftotext of Untitled_document__12_.pdf.
S17_PRERESEARCH_TRIAGE.md                    → tools/slice17-research/
  Nova synthesis: DEC-17-1..7 skeleton, V5–V8, tensions T1–T3.
CLOME_GATE_F1C_REVJ_CONSOLE.md               → tools/audit/p0-2026-08/
  Clome console/HUD gate evidence, F1c revJ (pdftotext of
  Untitled_document__10_.pdf).
CLOME_EVAL_FIRST_VISITOR_UX.md               → tools/audit/p0-2026-08/
  Clome first-visitor UX pass (pdftotext of Untitled_document__11_.pdf).
  Convergence partner of the lost QOL Perplexity result.
ASTER_ROADMAP_2026-08_revB.md                → strategy/ASTER_ROADMAP_2026-08.md
  Post-S16 roadmap incl. §9 P1–P5 triage (the highest-fidelity surviving
  digest of the lost P1–P5 results). revA superseded; do not commit revA.
RESEARCH_LEDGER_2026-08.md                   → strategy/
  All 7 threads status-flagged, V1–V4 verification queue.
SLICE21_QOL_BACKLOG_TRIAGED.md               → strategy/
  Distillate of the lost QOL result + Clome eval; C1–C3 corrections; Tiers.
RESEARCH_RECOVERY_MANIFEST_2026-08-04.md     → tools/audit/sanity-2026-08-03/
  This file — the loss/recovery record itself.

Also ingested by the dispatch (already on your box, not from chat):
/tmp/sanity-lens1-inventory.md, /tmp/sanity-lens2-adversarial.md,
/tmp/sanity-lens3-architect.md, /tmp/sanity-reconciliation.md
                                             → tools/audit/sanity-2026-08-03/

═══════════════════════════════════════════════════════════════════════════
§2. LOST VERBATIM — re-export from your Perplexity history (7 threads)
═══════════════════════════════════════════════════════════════════════════
Open each thread → copy the full answer (incl. follow-up chain + LOAD-
BEARING NUMBERS) → save as the exact filename below → drop into
~/aster-intake-2026-08/. The ingest dispatch picks them up on re-run.

  P1 (ephemeris)          → P1_EPHEMERIS_RESULT.md
  P2 (Earth orientation)  → P2_EARTH_ORIENTATION_RESULT.md
  P3 (propagation)        → P3_PROPAGATION_RESULT.md
  P4 (satellites)         → P4_SATELLITES_RESULT.md
  P5 (catalog freshness)  → P5_CATALOG_FRESHNESS_RESULT.md
  Explainer (what is Aster / comparables) → EXPLAINER_RESULT.md
  QOL (3D-viewer UX conventions)          → QOL_UX_RESULT.md

Targets: P1–P5 + QOL → tools/slice21-research/literature/;
EXPLAINER → strategy/research/.
Until re-fetched, the surviving digests are: roadmap §9 (P1–P5),
SLICE21_QOL_BACKLOG_TRIAGED.md (QOL+Clome), ledger C3 note (explainer).
House rule stands: digests are pointers, not substitutes — nothing from a
digest enters a DEC without the raw chain landing first or an independent
verify pass.

═══════════════════════════════════════════════════════════════════════════
§3. ACCEPTED LOSSES (findings embedded elsewhere; no re-fetch)
═══════════════════════════════════════════════════════════════════════════
- P0-R2 recon full report (the 6th attachment): findings fully recorded in
  roadmap §8 and realized in shipped F1a–F1g code.
- Earlier Clome/Codex gate-report attachments (transcript-2 turns 3,5,27,
  34,38,44,46): verification evidence whose verdicts are embedded in the
  committed gate outcomes; Untitled_10/11 (recovered above) are the two
  with standalone value.
- P0-R1 report: recorded in roadmap §8.

═══════════════════════════════════════════════════════════════════════════
§4. BLOCKING NOTE
═══════════════════════════════════════════════════════════════════════════
tools/slice17-research/ paths presuppose the M10 ruling (Target Compare
owns Slice 17). The dispatch skips-and-reports S17 artifacts if you
haven't ruled; everything else ingests regardless.
