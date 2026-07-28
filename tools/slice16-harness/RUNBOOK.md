# Slice 16 Honesty-Study Harness — Runbook

**MARKER:** S16-PREFLIGHT-2026-07-27-A
**Audience:** Hudson, executing cold. Every step that spends money or touches the network is yours; the harness cannot do any of it on its own.

Work top to bottom. Steps 1–2 spend nothing.

---

## 0. State of the world

Pre-registration is **locked and reconciled**. Registered scope:

| | Count |
|---|---|
| Frozen scenarios | 30 |
| Struck (S-09, S-27) | 2 |
| **Primary (pre-registered)** | **28** |
| Deferred inside primary (S-06, S-10, S-12, S-13, S-23) | 5 |
| **Active (runnable today)** | **23** |
| Primary runs (28 × 6 × r=10) | 1,680 |
| Control runs (28 × 6 × r=3) | 504 |
| **Total registered** | **2,184** |
| Ceiling | **$200** |

**No run has ever occurred.** No model API has been called. The four provider adapters are **UNTESTED-AT-NETWORK-BOUNDARY** — written from documented contracts, never exercised on the wire.

---

## 1. Verify offline (no keys, no spend, ~1 second)

```sh
node --test tools/slice16-harness/test/
# expect: # pass 36 / # fail 0

node tools/slice16-harness/runner.mjs --preflight
# reports readiness; spends nothing

node tools/slice16-harness/runner.mjs --mock mock-faithful.json
# offline end-to-end: expect "20 runs written, 0 errored"
```

Confirm the guard actually refuses:

```sh
node tools/slice16-harness/runner.mjs --control ; echo "exit=$?"
# expect a REFUSED message and exit=4, with no ledger file created
```

## 2. Review, then push

Review order — later items depend on earlier ones:

1. `git show d79ba1b` — A2 reconciliation (S-29 live, struck = {S-09, S-27}, 28 primary).
2. `git show 3d55abd -- src/v2/SLICE_16_APPENDIX_A_LOCKED.md` — §L.8, the deferred-marker evidence. **All five resolved from committed sources.**
3. `git show e12ebcc` — §10.7 preflight sweep, including the three harness defects found and fixed, and the **known VF limitation in §10.7.4 that needs your decision**.
4. `tools/slice16-harness/PREFLIGHT_REPORT.md` — the full audit.

Then push. The pre-push hook blocks everything without `ASTER_PUSH_OK=1`; use your alias:

```sh
git hpush
```

No agent has pushed, set `ASTER_PUSH_OK`, or touched `core.hooksPath`.

## 3. Four signups

Chat subscriptions are **not** API keys. Each needs a developer account with billing.

| Provider | Console | Unlocks |
|---|---|---|
| OpenAI | <https://platform.openai.com> | `gpt-5.5`, `gpt-5.5-mini` |
| Anthropic | <https://console.anthropic.com> | `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` |
| Google | <https://aistudio.google.com> | `gemini-3.1-pro` |
| DeepSeek | <https://platform.deepseek.com> | `deepseek-v4-flash` |

> ### ⚠ SET A HARD SPEND CAP IN EVERY CONSOLE BEFORE GENERATING A KEY
> The `$200` ceiling is a **design commitment, not an enforced limit**. Only the provider console can actually stop spending. Do this first, in all four.

> ### ⚠ FOUR OF SIX MODEL STRINGS ARE UNVERIFIED LEADS
> Only `claude-sonnet-4-6` and `claude-haiku-4-5-20251001` are marked [Certain]. `gpt-5.5`, `gpt-5.5-mini`, `gemini-3.1-pro`, `deepseek-v4-flash` come from Q3 research and are **leads**. Check each against official provider docs before the pilot.
> **Substitution rule (DEC-16-6, pre-registered):** if a provider is inaccessible or a string is wrong, substitute the same-lab alternative named in Q3; if none exists, **drop that model with disclosure** in the write-up. Never silently swap.

## 4. `.env`

```sh
cp tools/slice16-harness/.env.example tools/slice16-harness/.env
$EDITOR tools/slice16-harness/.env
```

Fill the four keys. Leave `S16_LIVE_OK` **empty** until the moment you intend to spend.

- `.env` is ignored by the root `.gitignore` (`.env`, `.env.*`); only `.env.example` is exempted.
- **Never commit a filled `.env`. Never create one for an agent.**
- The harness does not auto-load it (no dotenv dependency). Load it per command:

```sh
set -a; source tools/slice16-harness/.env; set +a
```

## 5. Build the MCP server — ⚠ STILL PENDING as of 2026-07-28

**Checked this session: `mcp/node_modules` is ABSENT and the server is NOT built.** Every verification to date has therefore been source-and-fixture based, and **no live MCP tool response has ever been observed by any agent**. This step is yours and nothing downstream of it can run without it.

```sh
cd mcp && npm ci && npm run build && cd ..
ls mcp/dist/mcp/src/index.js    # must exist
node tools/slice16-harness/runner.mjs --preflight   # "MCP server built: yes"
```

Use `npm ci` (not `npm install`) so the lockfile governs. Agents are barred from installing, which is why this has stayed pending. The control arm does **not** need this step — it attaches no tools.

## 6. Pilot

2 scenarios (`S-02` value path, `S-17` refusal path) × 6 models × r=2 = **24 runs**.

```sh
set -a; source tools/slice16-harness/.env; set +a
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --pilot
```

**What "good" looks like:**

- `mode=pilot planned=24 … pending=24`, then `done: 24 runs written, 0 errored`.
- One `prefix fingerprint` line, and **the same value on every row** — that is the DEC-16-7 audit trail. A fingerprint that varies mid-run invalidates those runs.
- Every row has `usage.reported: true` — provider-reported tokens, which replace the chars/4 est-tok heuristic.
- `answerBlockOk: true` on the large majority of rows. Widespread `false` means models are not honouring the structured-answer contract, which is a harness/prompt problem, not a result.

**What means stop and look:**

- Any 4xx → suspect the **adapter** first (never exercised on the wire), the model string second.
- All six models failing identically → prefix or contract problem, not a model finding.

**Then check the AUP pilot valve.** If **AUP ≈ 0 across all six models**, that is a grader-strictness artifact, not a finding — the pre-registered escape valve (A1 §10.3) applies: the AUP matcher may be amended to normalized-keyword matching **before the full run, with disclosure**. A floor in only one or two models is a real result about those models; leave it alone.

While here, close the five deferred items — §L.8 of the locked appendix already gives each one's resolved inputs and expected ground truth, so this is confirmation, not derivation.

## 7. Full run

Only after the pilot is clean.

```sh
set -a; source tools/slice16-harness/.env; set +a
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --full       # primary arm
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --control    # control arm, no tools
```

Pre-promotion, `--full` executes the **23 runnable** scenarios (1,380 runs), not 28. Promoting the five deferred scenarios after the pilot takes it to the registered 1,680.

**Resumable.** The runner skips any `runKey` already in the ledger, so a rate limit or a crash costs only the incomplete runs — re-issue the same command.

## 8. Where things land

| Output | Path |
|---|---|
| Ledgers (JSONL, one row per run) | `tools/slice16-harness/runs/ledger-{pilot,full,control,mock}.jsonl` |
| Row contents | `arm`, `toolsAttached`, model/lab/tier, scenario, RQ, prompt form, repetition, prefix fingerprint, full reply text, parsed answer block, provider-reported usage, error |
| Grades | produced by `grader.mjs` over a ledger; no CLI wrapper yet — next slice of work |

> ### ⚠ When the grading CLI is written, it MUST pass `scenarioId`
> Amendment A3 grades VF on each scenario's declared quantity slot, and slot grading engages **only** when `gradeDecision` receives a `scenarioId`. Called without one it silently falls back to pre-A3 `values_used`-only behaviour and the amendment does nothing. Every graded result carries `VF.slotMode`; assert `slot-graded` for the 22 prose-matchable scenarios as an acceptance test. See founding doc §11.5.

`runs/` is **not** git-ignored: INV-036 makes transcripts committable artifacts. Commit them deliberately with the report. Control rows are separable by `arm` and are excluded from primary metrics.

## 9. OSF / Zenodo mirror

Recorded **PENDING** in DEC-16-10. Do this **before** the full run so the registration predates the data.

```sh
git rev-parse HEAD    # the anchor to register — run AFTER pushing
```

The pre-registration is the **whole chain**, not one commit: original anchor `34ca5f7` → A1 `5a99c13` → A2 `d79ba1b` → deferred evidence `3d55abd` → self-audit `15083b5` → truth sweep `e12ebcc` → preflight `8452d1e` → **A3 `195d8ea` + this commit**. Register the **current final HEAD** (`git rev-parse HEAD` after pushing) — **not `8452d1e`**, which is now superseded: it carries the pre-A3 VF definition with the prose-fabrication hole still open.

**The amendment log is part of the pre-registration record, not an appendix to it.** `8452d1e` is already public and still shows the flawed VF definition; §11 of the founding doc discloses the defect, the date, that zero runs had occurred, and both definitions verbatim. A reader diffing `8452d1e` against the registered HEAD sees exactly what changed and when — that transparency is the point, so register the chain rather than trying to present a single clean anchor.

Record the DOI back into `SLICE_16_FOUNDING.md` as an additive amendment, never an edit.

## 10. Post-pilot decisions that are yours

1. **Promote the five deferred scenarios?** Evidence is in §L.8; promotion takes runnable 23 → 28 and primary runs 1,380 → 1,680.
2. **AUP valve** — exercise it only on an all-six-model floor (§6).
3. **VF prose-scanning amendment** (§10.7.4) — adopt before the pilot, or state the limitation in Threats to Validity. Not both, not neither.

## 11. Hard rules that still apply

- No agent pushes, ever. No agent sets `ASTER_PUSH_OK`, `ASTER_PROTECTED_OK`, or `S16_LIVE_OK`.
- `SLICE_16_FOUNDING.md` and `SLICE_16_APPENDIX_A_LOCKED.md` are additive-only; the pre-commit hook enforces the founding doc.
- Deviations become additive amendments, never silent edits (DEC-16-10).
- **Never tune a tolerance, prompt, threshold, or fixture expectation to improve a score.** That is the one change that would invalidate the study.
