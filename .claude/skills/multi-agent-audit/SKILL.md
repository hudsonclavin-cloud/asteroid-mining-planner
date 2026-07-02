---
name: multi-agent-audit
description: "Use before deploying ANY new or modified math-layer code in Aster (Lambert solver, propagators, frame transforms, DLA computation, ΔV models, numerical methods) — the audit runs BEFORE deploy, never after. Also use when Hudson says 'audit this', 'run the three-prior pattern', or when a founding-doc phase names a multi-agent audit gate. Contains ready-to-paste lens prompts so the audit is runnable by any model tier plus Codex, without needing top-tier reasoning to reconstruct the pattern."
---

# Multi-Agent Audit (math layer)

The single highest-value dispatch type in Aster. Slice 10's Dispatch 21 caught
the initial-guess middle-branch bug that every existing test had missed
(because the tests froze the wrong values). Slice 11's Dispatches 37–39 audited
lambertMultiRev to 3.6e-12 against poliastro. The 2026-07-01 Sun-clearance
clamp audit caught two edge-case bugs (sphere-behind-ray, origin-inside) in
freshly written camera math before commit. Run it every time; it pays.

## When it fires

Any change to `src/v2/core/` math (solvers, propagators, frame transforms,
new derived quantities like DLA), any new numerical method anywhere, and any
"small algebra" — the Sun-clearance clamp was ~20 lines and had two real bugs.
Size does not exempt code from the audit.

## Structure (one dispatch, read-only, output to /tmp)

Three parallel priors review the SAME code with different lenses, then a
reconciliation pass merges findings. In Claude Code, run the three as
subagents; in Codex, run them as three sequential passes with the outputs kept
separate until reconciliation (do not let pass 2 read pass 1's findings —
independence is the point).

### Lens 1 — Mathematician (paste-ready)

> Re-derive the algorithm independently from its source definition before
> reading the implementation. Source: <paper / formula / founding-doc DEC>.
> Write your own derivation first. THEN read the code line by line and compare
> against your derivation. Report every divergence, including sign
> conventions, angle ranges, branch selection, units at each boundary, and
> frame assumptions. For each divergence: verbatim code, your derivation's
> version, and whether the divergence is a bug or an equivalent formulation
> (prove equivalence if you claim it).

### Lens 2 — Adversarial reviewer (paste-ready)

> Hunt failure modes the tests do not cover. For each function: enumerate the
> domain edges (zero-magnitude inputs, values at ±1 for asin/acos arguments,
> denominators approaching zero, negative discriminants, both roots negative,
> origin-inside-region cases, branch crossings, convergence limits, NaN/Inf
> propagation). For each edge: does the code guard it, and what does it return
> if hit? Check the guard's return value is CORRECT, not just present — a
> guard that returns the wrong fallback is a bug with a seatbelt on. Report a
> concrete triggering input for every unguarded or wrongly-guarded edge.

### Lens 3 — Architect (paste-ready)

> Review the API surface and containment. Does the new code touch audited
> prior code (it must not — INV-019)? Is the frame/unit decision centralized
> in one function with the measurement that justifies it cited in a comment,
> or scattered across call sites? Are types enforcing the contract or is
> anything passing through `any`? Do both consumers (worker/renderer,
> solar-system/inner-solar-system) use the same code path, or has a parallel
> near-copy appeared that will drift?

### Reconciliation

Dedupe the three findings lists into one ranked list: HIGH (wrong answer
possible in production), MEDIUM (wrong answer on inputs we don't currently
generate), LOW (style/robustness). For every HIGH and MEDIUM: a **4-generation
root cause** — why the bug exists, why review missed it, why tests missed it,
why the process allowed it. (Slice 10's canonical bug was self-reinforcing:
tests were written against the wrong implementation, so they froze the error.)

## Tolerance bars (state them in the dispatch, per audit)

- Machine precision (~1e-14 relative) where the code should match a reference
  exactly: closed-form algebra, rotations, single-rev Lambert vs poliastro.
- A looser bar (e.g. ≤1e-6) only where genuinely justified (multi-rev series
  convergence), with the justification written into the audit report.
- External-tool end-to-end comparisons may carry a domain-justified bar
  (e.g. ≤0.5° for DLA vs another ephemeris stack) — the justification names
  the sources of legitimate divergence (ephemeris, epoch conventions).

## Non-negotiables

- Read-only; never mutates the repo. Findings go to /tmp, never committed.
- Runs BEFORE deploy. An audit after deploy is an incident report.
- Findings are resolved as separate, individually verified fix dispatches —
  finding → verification → fix commit, traceable — then re-audited if HIGH.
- Time-boxed. If the audit is sprawling, the scope was wrong: audit one
  function cluster per dispatch.
