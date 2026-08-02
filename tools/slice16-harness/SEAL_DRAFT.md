# Public pre-registration seal — paste-ready draft

**Marker:** `S16-FINISH-2026-08-01-A` · **Status: NOT YET SEALED — this is the blocking item.**

An agent cannot create this registration; it needs your OSF or Zenodo account.
Everything below is prepared so the step is copy-paste, not authorship.

---

## Do these four things in order

The order matters: **seal a commit that is already public**, or the seal points at
something a reader cannot fetch — which is the exact §25.1 defect.

```sh
# 1. Push. (My probe-mode commits are local-only, so HEAD is ahead of origin again.)
git hpush
git rev-parse HEAD          # <- SEAL THIS HASH; call it <SEALED_HASH>

# 2. Create the registration (OSF or Zenodo — either satisfies "external immutable
#    timestamp"). Metadata to paste is below.

# 3. Record it additively in the founding doc — replace the two placeholders:
cat >> src/v2/SLICE_16_FOUNDING.md <<'EOF'

# §27 — Public pre-registration seal (2026-08-01)

**Marker:** `S16-FINISH-2026-08-01-A` · **Additive.**

DEC-16-10's OSF/Zenodo mirror, registered PENDING since lock and still pending
through the halted first attempt (§25.1), is now **DONE**.

| | |
|---|---|
| Registration URL / DOI | `<PASTE_URL_OR_DOI>` |
| Sealed commit | `<SEALED_HASH>` |
| Sealed at | `<PASTE_TIMESTAMP_UTC>` |
| Instrument | Amendment A12 (§26) — corrected grader, corrected stimulus, runtime guards |

This seal is **external and immutable**, and it precedes the first collection
run under the corrected instrument. It is what §25.2 required before any
further data collection, and it closes PRE_RUN_GATE box 1. The seal covers the
revised pre-registration; the original 2026-07-27 lock commit remains the
first-registration anchor, and the amendment chain between them is public.
EOF

# 4. Commit and push the seal record, then reply "go".
git add src/v2/SLICE_16_FOUNDING.md
git commit -m "research(slice16): §27 public pre-registration seal recorded [S16-FINISH-2026-08-01-A]"
git hpush
```

---

## Metadata to paste into OSF / Zenodo

**Title**
```
Aster Slice 16 — Do LLM agents faithfully transmit tool evidence? A pre-registered, judge-free study
```

**Authors / Contributors**
```
Hudson Clavin
```

**Keywords**
```
LLM agents; tool use; faithfulness; hallucination; Model Context Protocol; MCP;
pre-registration; evidence provenance; astrodynamics; deterministic grading
```

**License**
```
MIT (code) — see LICENSE in the repository
```

**Description** *(paste verbatim; it is accurate as of `<SEALED_HASH>`)*
```
Pre-registered study of whether LLM agents faithfully transmit tool-returned
evidence — values, refusals, provenance, and assumptions — into their answers.

Agents are given a Model Context Protocol server exposing seven validated
astrodynamics tools. Each tool returns an EvidenceEnvelope carrying typed
Quantity leaves with per-leaf confidence class and source binding, structured
refusals, and repository provenance (path + commit). Answers are graded
DETERMINISTICALLY against those envelopes on four binary dimensions — value
fidelity, refusal fidelity, provenance transmission, and assumption/uncertainty
preservation — with FULL as their conjunction. There is no LLM judge: an
honesty study graded by an LLM inherits the failure mode it measures.

Registered design: 30 frozen scenarios (2 struck, 28 primary), 6 models across
4 labs, 10 repetitions per cell in 3 prompt forms, plus a no-tools control arm
at 3 repetitions. Primary outcome is the per-model mean run-level
full-faithfulness rate with scenario-clustered bootstrap confidence intervals;
minimum meaningful effect 10 percentage points, interpreted CI-versus-threshold
and reported as tiers, never rankings.

THIS REGISTRATION SEALS A REVISED INSTRUMENT, AND THE REVISION IS PART OF THE
RECORD. A first collection attempt on 2026-08-01 halted at 275 of 810 runs on
provider credit exhaustion. A subsequent read-only audit established that the
run could not have produced a defensible result even with unlimited credit:
the grader ignored prose outside the structured answer block, inverted
radius/diameter semantics on one scenario, penalised the honest answer another
scenario's own specification required, admitted several false-pass paths in
refusal and provenance checking, resampled shared-stimulus scenario pairs as
independent, and left the control arm ungradeable by construction; six
registered scenarios were not instantiated as registered. All of it is
documented additively in the founding document (sections 21 through 26) rather
than rewritten, including the errors, their corrections, and the reasoning.

NO FAITHFULNESS RESULT HAS EVER BEEN PRODUCED. The 114 successful rows from the
halted attempt are explicitly NOT study data — they are a plan-order-biased
subset collected under the superseded instrument — and are excluded from all
analysis. Data collection under the corrected instrument begins after this
registration.

Executed scope differs from the registered scope and both are reported
separately throughout: 26 of 28 scenarios are runnable (one has a live
ground-truth contradiction, one has an under-specified prior turn) and 3 of 6
models are funded and reachable (one model string does not exist, one is
quota-blocked, one is unfunded). Consequently only one of the three
pre-registered model contrasts is currently evaluable; that limitation is
declared rather than worked around.

Everything needed to reproduce or refute the study is in the repository at the
sealed commit: the frozen scenario appendix, the deterministic grader with its
adversarial negative-control fixtures, the run harness with its spend and
same-cause halt guards, and the complete amendment chain.
```

**Related identifiers**
```
Repository: https://github.com/hudsonclavin-cloud/asteroid-mining-planner
Sealed commit: <SEALED_HASH>
Package:    https://www.npmjs.com/package/aster-mission-mcp  (v0.1.0)
```

---

## What the seal covers, at the sealed commit

| Artifact | Path | Size |
|---|---|---|
| Pre-registration + full amendment chain (A1–A12) | `src/v2/SLICE_16_FOUNDING.md` | 1,327 lines, 20 sections |
| Locked 30-scenario appendix | `src/v2/SLICE_16_APPENDIX_A_LOCKED.md` | 984 lines |
| Harness, grader, guards, fixtures, tests | `tools/slice16-harness/` | 36 tracked files |
| Deterministic grader | `tools/slice16-harness/grader.mjs` | — |
| Fail-closed grading CLI | `tools/slice16-harness/grade.mjs` | — |
| Negative-control fixtures | `tools/slice16-harness/fixtures/grader-cases.json` | — |
| Offline test suite | `tools/slice16-harness/test/` | **183 tests, 183 passing** |
| Pre-run gate | `tools/slice16-harness/PRE_RUN_GATE.md` | 12 boxes |
| Standing invariants incl. INV-037 | `INVARIANTS.md` | — |

**Not covered, deliberately:** `tools/slice16-harness/runs/` is untracked. The
run ledgers are checksummed in founding §25.3 instead. If you want them inside
the deposit, upload them as a Zenodo file set and record the per-file checksums
additively — founding §25.3 already carries the dispatch for that.

---

> **SEALED — 2026-08-01 (`S16-FINISH-2026-08-01-A`).** The "NOT YET SEALED — this is the blocking item" status line at the top is **historical**. The deposit exists: DOI `10.5281/zenodo.21752617`, sealed commit `670b039`, published `2026-08-01T23:44:23.499178+00:00`, recorded in founding **§27**. Collection began only after it.
