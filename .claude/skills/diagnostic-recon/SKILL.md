---
name: diagnostic-recon
description: "Use whenever a bug, visual anomaly, unexpected behavior, or 'something looks wrong' report surfaces in Aster — BEFORE writing any fix dispatch. Also use when a recon result seems to contradict what Hudson observes, when a symptom cluster has multiple possible causes, or when deciding whether a behavior is a defect or correct-but-unintuitive. Encodes the hypothesis-discipline and decisive-discriminator method that cracked the halo frame bug and the vInfDep frame question."
---

# Diagnostic Recon

How Aster diagnoses before fixing. The week of 2026-06-30 produced three wrong
hypotheses in a row (OrbitControls clamp, label attachment, CSS offset) — every
one caught by a recon before code shipped, and the real bug (halo sprites fed
camera-relative coordinates while parented to the scene) found only after the
discipline below was followed. This skill exists so a weaker model repeats the
discipline, not the wrong hypotheses.

## The loop (non-negotiable order)

1. **Symptoms, plural and separated.** List every reported symptom as its own
   line. Do NOT assume one cause. Expect some symptoms to be correct behavior
   (e.g. the NEA cloud "shifting" on selection was floating-origin working as
   designed). Classify each: `defect | correct-but-unintuitive | needs-runtime-check`.
2. **Hypotheses, ranked, confidence-labeled.** For each symptom, write the
   plausible mechanisms with [Certain]/[Likely]/[Speculative] labels. If there
   is only one hypothesis, that is a warning sign — generate an alternative.
3. **Read-only recon targeting the discriminating question.** The recon asks
   the ONE question whose answer differs between hypotheses — not "scan
   everything." Verbatim code + file/line in the report, never paraphrase.
4. **Decisive discriminator.** Design a single observable whose value differs
   *qualitatively* between hypotheses, then measure it. Worked examples:
   - Frame question: Earth's velocity Z-component from the worker's own fixture
     is ~0 km/s in an ecliptic frame vs ±11.8 km/s seasonal in equatorial. Four
     epochs, one printout, unambiguous (closed OQ-12-1).
   - Phantom dots: toggle the starfield `visible=false` — dots gone means they
     were stars, dots persist means real defect. Then hide bodies too to fully
     isolate the asteroid cloud.
   - Halo frame bug: Hudson's observation "labels align at polar=π/3 but not
     top-down" — a consistent offset would mean bad anchor; a view-dependent
     offset means two systems rendering in different frames.
5. **Verdict sentence, then fix.** One sentence: "X is positioned in frame A;
   Y expects frame B; the missing/extra transform is Z at location W." Only
   after the verdict is written does a fix dispatch get drafted.

## Rules

- **Never write a fix from an unverified hypothesis.** If the recon refutes
  the hypothesis, the fix dispatch is wrong by construction. Re-recon.
- **Labels are not measurements.** Doc comments, variable names, type names,
  and founding-doc labels can be wrong (AMD-7 said "heliocentric ecliptic";
  measurement said ICRF). Any quantity derived from vector *components* has
  its frame established numerically at the consuming boundary (INV-021).
  Magnitudes are frame-invariant — magnitude-level validation proves nothing
  about component frames.
- **Static reading cannot prove runtime values.** If the question is "does a
  bad value actually occur" (NaN positions, epoch lag, precision loss),
  instrument with a throwaway probe; do not keep re-reading source. Probes
  live in /tmp or carry `// TEMP DIAGNOSTIC — remove before commit` markers,
  and the tree MUST end clean (revert is part of the dispatch, not an
  afterthought — a forgotten diagnostic line tripwired two later dispatches).
- **Isolation by subtraction.** Temporarily hide/disable scene components one
  at a time until the anomaly is isolated. Cheap, decisive, reversible.
- **Trust human perception as data.** When Hudson reports a visual
  misalignment and a recon says "code looks correct," the recon is asking the
  wrong question, not Hudson seeing wrong. The halo bug survived multiple
  recons that verified attachment was "correct" — because the sprite's
  *coordinates* were in the wrong frame. Perceived-vs-computed mismatch means
  two systems disagree; find the second system.
- **Two independent recon passes before concluding root cause** on subtle
  bugs. One recon confirming your favorite hypothesis is not confirmation.
- **Scope the swarm.** Multi-agent recon is for parallel *lenses* on one
  defined question, not "scan every file." An unscoped swarm re-discovers
  known facts at 3× token cost and still misses runtime-only defects.

## Report format

Per finding: file + exact line numbers, verbatim code, one-line
interpretation. Then a symptom→verdict table mapping each original symptom to
`confirmed defect | correct behavior | needs-runtime-check` with the single
most likely root cause. Confidence labels on every causal claim.
