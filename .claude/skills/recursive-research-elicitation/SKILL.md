---
name: recursive-research-elicitation
description: "Use whenever drafting or refining an EXPLORATORY research prompt for Perplexity (or any external research tool) — slice pre-research queries, literature questions, sourcing hunts, 'what does the field say about X' prompts. Appends Hudson's recursive follow-up-chain directive so the tool answers the root question, then poses and answers its own most decision-relevant follow-ups three levels deep, surfacing information we didn't know to ask for. Do NOT apply to verification passes (verify-before-lock prompts want one-line verdicts, not expansion), quick fact lookups, or audit prompts. Also use when triaging the returned follow-up tree — its rules for what the chained output is (leads) and is not (locked facts) live here."
---

# Recursive Research Elicitation

Exploratory research prompts leave value on the table: the answer to the root
question raises follow-ups we would have asked next session, or never. This
skill makes the research tool run that loop itself — answer, generate the
follow-ups the answer raises, answer those, repeat — three levels deep, inside
one response. The point is surfacing unknown unknowns during pre-research,
when they are cheapest to act on.

Origin: Hudson established the pattern in a Perplexity session (2026-07-02)
and directed that all exploratory research prompts use it from then on.

## When it applies

- Slice pre-research literature prompts (the 3a/3b-class queries)
- Any "what does the field / industry / literature say about X" prompt
- Sourcing hunts (vehicle data, cost models, standards, mission histories)
- Deep-research prompts to other tools (ChatGPT Deep Research) — adapt wording,
  same structure

## When it does NOT apply (hard exemptions)

- **Verification passes** (verify-before-lock, 3d-style prompts). These want
  confirm / refute / unverifiable, one line per number. Expansion there is
  anti-signal — it buries the verdicts the pass exists to produce.
- Quick fact lookups where a wrong answer is cheap.
- Audit-lens prompts (multi-agent-audit skill governs those).
- Any prompt where the reading budget is the constraint and the question is
  already sharply scoped.

If unsure whether a prompt is exploratory or verificatory, ask which phase it
serves: pre-DEC discovery → apply; pre-lock checking → exempt.

## Corrective-line rule for verification passes (added 2026-07-02)

Verification passes stay exempt from the chain, but adopt one bounded element
of its spirit — the only place a verification pass leaves value on the table
is a refuted number, where a naked REFUTE forces a fresh research round.
Verification prompts therefore specify:

- CONFIRM → one verdict line, nothing more.
- REFUTE → verdict line + exactly ONE corrective line: correct value + primary
  source.
- UNVERIFIABLE → verdict line + ONE line naming the specific document/tool
  that would settle it (a source, not a search suggestion).
- Terminus: end with NEW LOAD-BEARING NUMBERS — a flat list of corrected
  values the REFUTE lines introduced, one source each ("none" if none). This
  feeds the founding doc directly.
- No other expansion. No follow-up questions. Depth stays zero.

## The directive block (append verbatim to the research prompt)

```
FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 — State the 3 most decision-relevant follow-up questions your answer
raises for this tool, and answer each with sources.

LEVEL 2 — For each Level-1 answer that materially affects a design decision,
pose and answer the single most important follow-up it raises, with sources.

LEVEL 3 — Repeat once more for any Level-2 answer that still carries open
decision weight.

BUDGET: no more than 10 follow-up answers total across all levels. Prune by
decision-relevance, not curiosity — drop branches that only add color.

For EVERY follow-up answer:
(a) open with one line stating why this follow-up matters for the tool,
(b) cite primary sources,
(c) flag each number as official-published vs third-party-estimated.

END with a section titled LOAD-BEARING NUMBERS: a flat list of every number
in this entire response that a design decision might rest on — one line per
number, with its source. This list feeds an independent verification pass.
```

Adapt "for this tool" to name the actual tool/context in the prompt (e.g.
"for an interplanetary mission-planning tool") so relevance pruning has a
target.

## Why the guardrails exist (do not strip them)

- **The budget** exists because an unconstrained depth-3 tree fans out to
  15+ answers and the reading/verification budget is the scarce resource,
  not the generation.
- **The relevance line** exists because chained follow-ups drift off the
  load-bearing question toward whatever the tool finds interesting.
- **The LOAD-BEARING NUMBERS terminus** exists because verify-before-lock is
  non-negotiable and tripled volume makes error-hunting harder, not easier —
  the Slice 12 inequality inversion survived a normal-volume research pass.
  The terminus list is the direct input to the verification prompt.
- **The official-vs-estimated flag** matches the house sourcing style (see
  Slice 13 prompt 3a) and keeps provenance attached through the chain.

## Triage rules for the returned tree (chat-side)

1. **Follow-up content is leads, not facts.** Nothing from Level 1–3 enters a
   DEC, invariant, or founding doc without the independent verification pass.
   Root-answer content follows the same rule it always did.
2. The LOAD-BEARING NUMBERS list is pasted (curated, not wholesale) into the
   verification prompt. If the tool failed to produce the list, extract it
   manually before anything locks.
3. Contradictions between levels (a Level-2 answer undercutting the root) are
   findings — log them in the founding doc's engineering record at draft time,
   per slice-discipline. Do not silently pick a side.
4. Committed artifact convention unchanged: output lands in
   tools/sliceN-research/literature/ per the one-commit-per-measurement
   pattern, chain included.

## Retrofit onto an already-fired prompt

If the root prompt already ran without the directive, paste the directive
block as a follow-up message in the same research thread, prefixed with:
"Apply the following to your previous answer:" — the chain runs off the
existing root answer. No need to re-fire the root.
