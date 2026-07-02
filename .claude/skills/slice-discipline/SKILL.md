---
name: slice-discipline
description: "Use when Hudson is planning a new slice of Aster, drafting or reviewing a founding document, structuring open questions (OQs) or decisions (DECs), closing an OQ, amending a locked DEC, correcting an error in a prior slice's doc, or setting up a multi-agent audit. Encodes the slice lifecycle and the founding-doc template so each slice is planned with the same rigor regardless of which model drafts it."
---

Slice Discipline
Aster is built in numbered "slices" — vertical increments that each ship a
working capability. Every slice follows the same lifecycle. This skill encodes
that lifecycle and the artifacts it produces, so planning a new slice never
starts from a blank page.

The slice lifecycle (non-negotiable order)

Pre-research — measure the inputs before deciding anything. External
literature (GPT/Perplexity deep research) AND empirical measurement (scripts
in tools/sliceN-research/ that reuse production code). Outputs land as
committed artifacts (literature/*.md, data/*.json), one commit per
measurement.
DECs locked — architectural decisions, each justified, ideally citing
the pre-research that informs it.
Founding doc — the contract. Written and committed before any
implementation dispatch. Uses the §1–§8 template below.
Dispatches — atomic Codex dispatches executing against the contract,
phase by phase. (See the dispatch-writer skill for their structure.)
Multi-agent audit — on math-layer work, before deploy. Three parallel
priors + reconciliation. (See the multi-agent-audit skill for the full
runnable pattern with paste-ready lens prompts.)
Deploy — production build, commit docs/ output, push, verify live.

Skipping steps produces lower-quality work. The order is the discipline.
Verify-before-lock. Any measurement, external claim, or reference is
independently verified before it is baked into a DEC or invariant. This pattern
caught the highest-value bug in the project (a solver formula error that had
passed every existing test because the tests were written against the wrong
implementation).

Founding-doc template (§1–§8)
Save as src/v2/SLICE_N_FOUNDING.md. Status line at top: DRAFT while in
review, LOCKED <date> once approved.
# Slice N Founding Document — <title>

**Status:** LOCKED <YYYY-MM-DD>
**Author:** Hudson Clavin
**Prior slice:** Slice N-1 (<one line + deploy URL if shipped>)
**Next slice (planned):** Slice N+1 (<one line, if foreseeable>)

## §1. Slice intent
<2–4 paragraphs: what this slice ships, what it explicitly does NOT touch.>

## §2. Inherited invariants
<Which INV-xxx from prior slices remain operative. Note any that this slice
EXTENDS, with the extension spelled out (e.g. INV-016a preserved, INV-016b new).>

## §3. Architectural invariants new in this slice
<New INV-xxx this slice establishes. Numbered, each one sentence + rationale.>

## §4. Open Questions (OQs)
<Each OQ: a question. STATUS: OPEN | SCOPING | CLOSED <date>. If closed by
pre-research, cite the measurement file + commit hash in the resolution.>

## §5. Locked DECs
<Each DEC: bulleted decision, justified. Cite pre-research where it informs.>

## §6. Phase breakdown
<Phase A..F. Each: one line of intent + rough dispatch count + any STOP gate.>

## §7. Out of scope
<Explicit list of what belongs to a later slice. Prevents scope creep.>

## §8. Engineering record (running log)
<Append-only. Pre-research commits, founding-doc lock, phase completions.>

OQ / DEC conventions
OQ (Open Question) — something genuinely unknown that must be resolved.

Phrase as a question.
STATUS: OPEN (unresolved), SCOPING (measurement in progress), or
CLOSED <date> with a resolution paragraph.
An OQ closed by pre-research cites the data file and commit hash. The
resolution states the measured number, not a guess.
An OQ may close during implementation — note that in §4.

DEC (Decision) — an architectural choice that is now locked.

State the decision, then the justification.
If pre-research informs it, cite which (e.g. "per Query 3 §10" or
"Measurement 2, commit 265585f").
Locked DECs do not get silently revised. If new evidence overturns one,
that's a founding-doc amendment with its own commit, not an edit.


Multi-agent audit pattern (math-layer work)
Before deploying new core math (solvers, propagators, numerical methods), run
an adversarial audit. This is the single highest-value dispatch type in the
project. Full runnable pattern with paste-ready lens prompts lives in the
multi-agent-audit skill; the summary:

Three parallel subagent priors (mathematician / adversarial reviewer /
architect), reconciliation into a HIGH/MEDIUM/LOW ranked list, 4-generation
root-cause per real finding, findings resolved as separate dispatches BEFORE
deploy. Read-only, output to /tmp, time-boxed, tolerance bars stated
explicitly per audit.

AI-drafted founding docs (added 2026-07-01)
When a model (not Hudson) drafts a founding doc:

- Status line is **DRAFT — pending Hudson review and lock**, and every §5
  entry is marked **PROPOSED**. Only Hudson converts PROPOSED → locked. A
  model never writes "LOCKED".
- While the doc is DRAFT, revisions are free edits, not amendments. The
  amendment machinery (tracked "amends DEC-X" commits) starts at lock.
- The draft's engineering record logs, at drafting time, any contradiction
  found in the source material — do not silently pick a side (the Slice 12
  draft caught the handoff's feasibility inequality inverted against the
  committed Query 1 pre-research; recording it at draft time is what made the
  catch auditable).
- Judgment calls that are genuinely Hudson's (scope, site pickers, deferral
  boundaries) are framed as OQs marked "Hudson's call at lock", not decided
  by the drafting model.

Pre-lock OQ closure by measurement (added 2026-07-01)
An OQ may close BEFORE the doc locks when a read-only recon or probe settles
it decisively (OQ-12-1 closed pre-lock: the vInfDep frame question, settled by
sampling Earth's velocity Z-component from the worker's own fixture — ~0 km/s
would mean ecliptic, measured 11.7 km/s meant ICRF/equatorial). Rules:

- The recon must be read-only (probes in /tmp, tree untouched).
- The closure records the measured numbers and the discriminator design, not
  just the verdict.
- If the measurement invalidates a PROPOSED DEC, revise the draft and log the
  revision in §8 (free while DRAFT).
- Design discriminators per the diagnostic-recon skill: one observable whose
  value differs qualitatively between hypotheses.

Errata in prior slices' docs (added 2026-07-01)
When new measurement proves a LOCKED prior-slice doc contains a wrong label or
claim (e.g. AMD-7 calling vInfDep "heliocentric ecliptic" when the components
are ICRF), do not silently edit the old doc. Record an erratum: a short
correction note in the old doc citing the measurement, committed alongside the
new slice's lock commit, with the engineering record of the new slice pointing
at it. The history stays honest in both directions.

Anti-patterns to refuse

Drafting a founding doc with TBD in locked DECs — TBDs lock in by accident.
If a DEC needs data, the OQ stays open and pre-research closes it first.
Folding multiple slices into one because "we're on a roll." When scope grows,
split into N.x slices, don't absorb.
Starting implementation before the founding doc is committed.
Running the multi-agent audit AFTER deploy instead of before.
Reversing a locked DEC by silent edit instead of a tracked amendment.
A model locking its own DECs or closing judgment-call OQs that belong to
Hudson.
