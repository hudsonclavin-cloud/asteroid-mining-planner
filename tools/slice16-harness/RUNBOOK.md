# Slice 16 Honesty-Study Harness — Runbook

**MARKER:** S16-LOCK-AND-HARNESS-2026-07-27-A
**Audience:** Hudson. Every step below that spends money or touches the network is yours; the harness cannot do any of it on its own.

---

## 0. What exists right now

| Artifact | Path |
|---|---|
| Locked scenario set + paraphrases | `src/v2/SLICE_16_APPENDIX_A_LOCKED.md` |
| Design lock / pre-registration | `src/v2/SLICE_16_FOUNDING.md` §9 |
| Config, roster, scenarios, tolerances | `tools/slice16-harness/config.mjs` |
| MCP stdio client (mirrors `mcp/eval/run-eval.ts`) | `tools/slice16-harness/mcp-client.mjs` |
| Prompt prefix + structured answer contract | `tools/slice16-harness/prompt.mjs` |
| Provider adapters (all **UNTESTED-AT-NETWORK-BOUNDARY**) | `tools/slice16-harness/adapters/` |
| Run driver | `tools/slice16-harness/runner.mjs` |
| Deterministic grader | `tools/slice16-harness/grader.mjs` |
| Negative-control fixtures + gate | `tools/slice16-harness/fixtures/`, `tools/slice16-harness/test/` |

**Nothing has ever been run against a live model API.** The adapters are written from documented contracts and are unverified on the wire.

---

## 1. Review order (before anything else)

Review these in order — later items depend on earlier ones being right:

1. **`git show 8329663 -- src/v2/SLICE_16_APPENDIX_A_LOCKED.md`** — the 30 scenarios and 60 paraphrases. Focus on §L.1 (what Phase A verified vs. deferred vs. found unsatisfiable) and the three **provisionally struck** scenarios S-09, S-27, S-29. Each carries a documented repair option. **This is the decision that most changes the study.**
2. **`git show 34ca5f7 -- src/v2/SLICE_16_FOUNDING.md`** — the §9 amendment. Confirm the additive proof: the diff must be `135 insertions(+), 0 deletions(-)`.
3. **`git show 34e95b7`** and **`git show 7d7c00e`** — harness and grader.
4. **`git log --oneline -6`** — five S16 commits on top of `0cc980c`.

Then run the offline gate yourself (no keys, no spend, ~0.1 s):

```sh
node --test tools/slice16-harness/test/
# expect: # pass 25 / # fail 0
```

And the preflight, which reports readiness and spends nothing:

```sh
node tools/slice16-harness/runner.mjs --preflight
```

---

## 2. Push (yours alone)

The pre-push hook blocks every push without `ASTER_PUSH_OK=1`. Use your alias:

```sh
git hpush
```

No agent has pushed, set `ASTER_PUSH_OK`, or touched `core.hooksPath`.

---

## 3. The four API signups

Chat subscriptions are **not** API keys — each of these needs a separate developer account with billing.

| Provider | Console | Models it unlocks |
|---|---|---|
| OpenAI | <https://platform.openai.com> | `gpt-5.5`, `gpt-5.5-mini` |
| Anthropic | <https://console.anthropic.com> | `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` |
| Google | <https://aistudio.google.com> (AI Studio) | `gemini-3.1-pro` |
| DeepSeek | <https://platform.deepseek.com> | `deepseek-v4-flash` |

**Set a hard spend cap in each console** before generating a key. The harness's `$200` ceiling (DEC-16-7) is a design commitment, not an enforced limit — only the provider console can actually stop spending.

**Verify the model strings before the pilot.** Four of the six are Q3 *leads*, not confirmed: `gpt-5.5`, `gpt-5.5-mini`, `gemini-3.1-pro`, `deepseek-v4-flash`. Only the two Anthropic strings are marked [Certain]. A wrong string costs a failed pilot, not money, but check anyway. If a string is wrong, substitute the same-lab alternative per DEC-16-6 and record the substitution.

---

## 4. `.env` layout

```sh
cp tools/slice16-harness/.env.example tools/slice16-harness/.env
$EDITOR tools/slice16-harness/.env
```

Fill in the four keys. Leave `S16_LIVE_OK` **empty** until the moment you intend to spend.

`.env` is ignored by the root `.gitignore` (`.env`, `.env.*`); only `.env.example` is exempted. **Never commit a filled `.env`.** The harness does not auto-load it — load it per command:

```sh
set -a; source tools/slice16-harness/.env; set +a
```

---

## 5. Build the MCP server (required before any live run)

`mcp/node_modules` is not committed, so the server is not built. Phase A could not make a single live tool call for this reason.

```sh
cd mcp && npm install && npm run build && cd ..
ls mcp/dist/mcp/src/index.js   # must exist
```

Then re-run `--preflight`; "MCP server built" should read `yes`.

---

## 6. Pilot (DEC-16-11)

2 scenarios (`S-02` value path, `S-17` refusal path) × 6 models × r=2 = **24 runs**. Purpose: exercise every adapter, confirm the model strings, and capture provider-reported token usage to replace the chars/4 est-tok heuristic.

```sh
set -a; source tools/slice16-harness/.env; set +a
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --pilot
```

Ledger lands at `tools/slice16-harness/runs/ledger-pilot.jsonl`, one JSON row per run.

**Expect adapter bugs on first contact.** These four adapters have never seen a real response. A 4xx is an adapter defect until proven otherwise — check the request shape before blaming the model string.

**Pilot data is excluded from the primary analysis** (DEC-16-11) and reported in an appendix.

While you are here, close the five **deferred** ground-truth items — each needs exactly one live call: `S-06` (explain_cell inputs for the M=2 infeasible cell), `S-10`/`S-12` (an in-envelope cell with C3 ≤ 55), `S-13` (the winning body), `S-23` (the in/out-of-envelope pair).

---

## 7. Full run

Only after the pilot is clean and you have re-read the spend figures.

```sh
set -a; source tools/slice16-harness/.env; set +a
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --full
```

Scale depends on your strike/repair decision (§1 item 1):

| Case | Scenarios | Runs |
|---|---|---|
| Struck as found, deferred unresolved | 22 | 1,320 |
| Struck as found, deferred resolved | 27 | 1,620 |
| All three repaired | 30 | 1,800 |

**Resumable.** The runner skips any `runKey` already in the ledger, so a rate-limit or a crash costs only the incomplete runs. Re-issue the same command to continue.

---

## 8. Where things land

| Output | Path |
|---|---|
| Run ledger (JSONL, one row per run) | `tools/slice16-harness/runs/ledger-{pilot,full,mock}.jsonl` |
| Per-row contents | model, lab, tier, scenario, RQ, prompt form, repetition, prefix fingerprint, full reply text, parsed answer block, provider-reported usage, error (if any) |
| Grades | produced by `grader.mjs` over the ledger; not yet wired to a CLI — that is the next slice of work |

`runs/` is **not** git-ignored: INV-036 makes transcripts committable artifacts, and the ledger is the transcript. Commit them deliberately with the report.

The prefix fingerprint on every row is the audit trail for DEC-16-7 — if it ever varies within a study, the caching and fixed-prompt commitments were broken and the affected runs are invalid.

---

## 9. Offline reproduction (for reviewers — no keys, no spend)

```sh
node --test tools/slice16-harness/test/
node tools/slice16-harness/runner.mjs --mock mock-faithful.json
```

This is the "minimal reproduction script" and the dummy-policy sanity check that answer the harness-bug rebuttal (§9.4).

---

## 10. OSF / Zenodo mirror

Recorded as **PENDING** in DEC-16-10. After pushing:

1. Create the registration on OSF (or a Zenodo deposition).
2. Point it at the freeze commit **`34ca5f7`** — that commit's tree *is* the pre-registration.
3. Record the DOI/URL back into `SLICE_16_FOUNDING.md` as an additive amendment, never an edit.

Do this **before** the full run, so the registration predates the data.

---

## 11. Hard rules that still apply

- No agent pushes, ever. No agent sets `ASTER_PUSH_OK`, `ASTER_PROTECTED_OK`, or `S16_LIVE_OK`.
- `SLICE_16_FOUNDING.md` is additive-only; the pre-commit hook enforces it.
- Design deviations become additive amendments, never silent edits (DEC-16-10).
- Never tune a tolerance, prompt, or grader threshold to improve a score. That is the one change that would invalidate the whole study.
