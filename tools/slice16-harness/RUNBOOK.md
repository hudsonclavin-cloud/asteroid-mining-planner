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
| Deferred inside primary (S-06 only — live-verification CONTRADICTION) | 1 |
| **Active (runnable today)** | **27** |
| Primary runs (28 × 6 × r=10) | 1,680 |
| Control runs (28 × 6 × r=3) | 504 |
| **Total registered** | **2,184** |
| Ceiling | **$200** |

**The pilot ran on 2026-07-31 and every run errored — at ~zero cost, since 400/404 reject before inference bills.** Four provider-contract faults, all fixed in Amendment A7 (founding §17). **Zero SUCCESSFUL runs exist**, so no faithfulness datum has been produced yet and the study is still pre-data-collection.

First contact confirmed four model strings (a 400 proves the string resolved; a 404 proves it did not) and **refuted `gpt-5.5-mini`, which does not exist**. `openai`, `anthropic` and `google` have now been exercised on the wire and corrected; `together` remains **UNTESTED-AT-NETWORK-BOUNDARY**. The MCP layer is live-verified (§5).

**This run: 4 active models, not 6.** Together is deferred for cost (§16.3) and `gpt-5.5-mini` is deferred pending your choice of a small-tier model (§17.6). Registered k=6 is unchanged.

⚠ **Two of three pre-registered contrasts are currently unevaluable** — only `anthropic-frontier-vs-small` can be computed. See §17.7.

---

## 1. Verify offline (no keys, no spend, ~1 second)

```sh
node --test tools/slice16-harness/test/
# expect: # pass 69 / # fail 0

node tools/slice16-harness/runner.mjs --preflight
# reports readiness; spends nothing

node tools/slice16-harness/runner.mjs --mock mock-toolcalls.json
# offline end-to-end (live MCP + mocked models): expect "18 runs written, 0 errored"
# (18, not the pre-A9 60 — the mock plan uses the EXECUTED r, now 3)
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
| OpenAI | <https://platform.openai.com> | `gpt-5.5` ✅ confirmed. **`gpt-5.5-mini` does NOT exist** — small-tier slot deferred, see §17.6 |
| Anthropic | <https://console.anthropic.com> | `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` — both ✅ confirmed |
| Google | <https://aistudio.google.com> | `gemini-3.1-pro-preview` ✅ resolves (`gemini-3.1-pro` **does not exist** — 404, A8-2) |
| **Together.ai** | <https://api.together.ai> | the open-weight slot — **model string PENDING**, see below (A6: replaces DeepSeek, US jurisdiction) |

> ### ⚠ SET A HARD SPEND CAP IN EVERY CONSOLE BEFORE GENERATING A KEY
> The `$200` ceiling is a **design commitment, not an enforced limit**. Only the provider console can actually stop spending. Do this first, in all four.

> ### ✅ MODEL STRINGS — RE-DERIVED IN A8 (this table's A7 version was wrong)
> **A7 said: "each returned a 400, which only a resolved string can do." That is false**, and `gemini-3.1-pro` disproved it by 404ing in round 2 after being "confirmed" this way. A 400 can come from request-body validation *before* the model is resolved. Founding §18.4. Certainty now cites the evidence kind:
> - **Confirmed by a successful call** (inference-free, and also proves the transport works): `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`.
> - **Confirmed by a metadata listing** — the string *resolves*, nothing more; neither has ever completed a call: `gpt-5.5` (`GET /v1/models`), `gemini-3.1-pro-preview` (ListModels).
>
> Not chosen for Google, deliberately: **`gemini-3.1-pro-preview-customtools`** ("optimized for custom tool usage") would make the Google cell a tool-tuned instrument unlike the other five and would likely score *better* — which is why it is disqualified; and **`gemini-pro-latest`**, a moving alias, which a pre-registered study cannot pin.
> **`gpt-5.5-mini` is REFUTED** — 404 `model_not_found`. `GET /v1/models` shows the 5.5 generation ships only `gpt-5.5` and `gpt-5.5-pro`; there is no same-generation small sibling. **You choose** from `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5-mini`, `gpt-5-nano` — all a generation behind, which confounds tier with generation — or leave the slot deferred. §17.6.
>
> ### ⛔ THE TOGETHER MODEL STRING IS A PENDING SENTINEL
> The roster carries `PENDING-SET-TOGETHER-MODEL-STRING` (`certainty: 'pending'`), deliberately not invented. **Fill it in `tools/slice16-harness/config.mjs` from Together's live model list before the pilot**, and confirm the chosen model's endpoint actually implements tool calling — open-weight endpoints vary. A model that ignores `tools` returns prose with no tool calls, which lands as `no_tool_call: true` and stays ungradeable (A4-4). `--preflight` shows the slot as `[pending]`.
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

## 5. Build the MCP server — ✅ DONE (2026-07-28)

`mcp/node_modules` is installed and the server **builds, spawns and answers** — verified live: handshake at protocolVersion `2025-11-25`, 7 tools, `tools/list` = 20,753 B (delta 0 vs the committed measurement). Re-run any time with:

```sh
node tools/slice16-harness/live-verify.mjs
```

Rebuild only if `mcp/src` changes (it must not during the study — INV-033 pins the instrument):

```sh
cd mcp && npm ci && npm run build && cd ..
ls mcp/dist/mcp/src/index.js    # must exist
node tools/slice16-harness/runner.mjs --preflight   # "MCP server built: yes"
```

Use `npm ci` (not `npm install`) so the lockfile governs. The control arm does **not** need this step — it attaches no tools.

**Dependency note:** `npm audit` reports 3 vulnerabilities (1 high, 2 moderate), all transitive through the MCP SDK. **None is reachable in a stdio-only server** and the recommendation is to leave them until after data collection — fixing bumps the SDK and would change the pinned instrument. Founding doc §12.6. Do not run `npm audit fix`.

## 5b. ✅ PRE-PILOT READINESS CHECKLIST — run these, do not trust this document

The pilot was blocked on a missing tool-call loop. **Amendment A4 implemented it**, so the pilot is unblocked. Verify that by RUNNING the checks, not by believing the report — the same standard this study applies to its subjects. Every line below costs nothing.

```sh
# [ ] 1. loop validated offline (live MCP server + mocked model)
node tools/slice16-harness/runner.mjs --mock mock-toolcalls.json
#     BOTH of these are a PASS — the runner is resumable, so a re-run legitimately
#     writes nothing. Which one you get depends only on whether the mock ledger
#     already exists:
#       first run  -> "planned=18 already-done=0  pending=18" ... "done: 18 runs written, 0 errored"
#       re-run     -> "planned=18 already-done=18 pending=0"  ... "done: 0 runs written, 0 errored"
#     FAIL is: a non-zero "errored" count, or planned != 18.
#     A9 CHANGED THIS NUMBER from 60 to 18: the mock plan uses the EXECUTED r,
#     which dropped from 10 to 3. If you see 60, you are on a pre-A9 checkout.
#     Want the first-run output? Delete just the mock ledger, never the directory:
#       rm -f tools/slice16-harness/runs/ledger-mock.jsonl
#     (Do NOT `rm -rf .../runs` — after the pilot that directory holds
#      ledger-pilot.jsonl, i.e. real paid data that INV-036 treats as an artifact.)

# [ ] 2. every tool-involving ledger row carries its envelope(s)
#     REQUIRES check 1 to have run: this reads the ledger check 1 writes.
#     On a cleared runs/ it fails with ENOENT — that means "run check 1 first",
#     not "the harness is broken".
node -e "const r=require('fs').readFileSync('tools/slice16-harness/runs/ledger-mock.jsonl','utf8').trim().split('\n').map(JSON.parse); \
const bad=r.filter(x=>!x.no_tool_call && !(x.decisions||[]).some(d=>d.envelope)); \
console.log('rows',r.length,'| missing envelope (excl. no_tool_call):',bad.length)"
#     expect: "rows 18 | missing envelope (excl. no_tool_call): 0"   (was 60 pre-A9)

# [ ] 3. grade.mjs GRADES a real ledger (no EXIT=3)
node tools/slice16-harness/grade.mjs tools/slice16-harness/runs/ledger-mock.jsonl; echo "exit=$?"
#     expect: "graded 15 runs — 12 slot-graded (A3 active)", 3 no-tool-call reported, exit=0
#     (was 50/40/10 pre-A9; all three scale with the executed r, now 3)

# [ ] 4. grade.mjs still refuses fail-closed on a row missing scenarioId
node -e "const {gradeLedger}=await import('./tools/slice16-harness/grade.mjs'); \
try{gradeLedger([{_line:1,runKey:'x',envelope:{envelope_version:'1'},answerBlock:{}}]);console.log('NOT REFUSED — BAD')} \
catch(e){console.log('refused:',/no scenario id/.test(e.message))}" --input-type=module
#     expect: "refused: true"

# [ ] 5. grade.mjs still refuses fail-closed on a row missing an envelope
printf '{"runKey":"x","scenario":"S-02","answerBlock":{}}\n' > /tmp/s16-noenv.jsonl
node tools/slice16-harness/grade.mjs /tmp/s16-noenv.jsonl; echo "exit=$?"
#     expect: "GRADING REFUSED ... no envelope on the row", exit=3

# [ ] 5b. roster status + keys (names only, never values)
node tools/slice16-harness/runner.mjs --preflight | sed -n '/Repetitions/,/Scenario set/p'
#     expect the A9 header line first:
#       "Repetitions r: REGISTERED 10 / EXECUTED 3"
#     expect all four key names listed — OPENAI_API_KEY, ANTHROPIC_API_KEY,
#             GOOGLE_API_KEY, TOGETHER_API_KEY
#     expect THREE DISTINCT exclusion labels in the STATUS column (A9-3) — these
#     must NOT all read the same thing, because each needs a different fix:
#       gpt-5.5-mini            REFUTED   [refuted]  -> the string does not exist
#       gemini-3.1-pro-preview  BLOCKED   [confirmed]-> provider quota; no code change needed
#       PENDING-SET-TOGETHER... DEFERRED  [pending]  -> cost choice; needs a real string too
#     each followed by a "kind:" line and a "reason:" line.
#
#     WITH YOUR .env SOURCED the output differs, and that is correct:
#       - the ACTIVE providers' status column reads `present`, not ABSENT
#       - the three excluded models still read REFUTED / BLOCKED / DEFERRED — they
#         are excluded by roster status, not by a missing key, so supplying keys
#         does not change those lines
#       - and check 6 below then refuses on the MISSING S16_LIVE_OK alone, rather
#         than on a missing key. Its exit code is still 4.
#     A keyless verification run (ACTIVE all ABSENT) and a keyed run (ACTIVE all
#     present) are both healthy; they simply report different things.

# [ ] 6. spend gate refuses the WHOLE run without S16_LIVE_OK + keys
node tools/slice16-harness/runner.mjs --pilot; echo "exit=$?"
#     expect: "REFUSED: no live provider call for gpt-5.5", exit=4, no ledger written

# [ ] 7. control arm sends NO tools parameter (absent, not empty)
node --test tools/slice16-harness/test/ 2>&1 | grep "control arm: every adapter omits"
#     expect: "ok ... control arm: every adapter omits the `tools` parameter entirely, not an empty one"
```

Only when all of these pass, continue to the pilot.

> **Do not pipe these into `head`/`grep` if you care about the exit code** — `$?` would then report the pipe's last stage, not the command's.
>
> **Execution record.** All eight commands were run verbatim on 2026-07-30 (the list is numbered 1–7 but carries an inserted `5b`, so there are eight). Seven matched their expected output exactly. Check 1 reported `0 runs written` because a mock ledger from an earlier run was still present and resumability correctly skipped all 60 — the harness behaving properly, not a failure. Clearing the mock ledger and re-running gave `60 runs written, 0 errored`. Check 1's expected text above was widened on 2026-07-30 to cover both outcomes rather than leave that reading as a false alarm.
>
> Check 6 additionally leaves **no `ledger-pilot.jsonl` behind**, which is part of what "refuses the whole run" means. Any `ledger-mock*` files you see in `runs/` afterwards are checks 1 and 3's output, not check 6's.

## 6. Pilot

> ### PILOT ROUND 3 — after Amendment A8
>
> **History so far.** Round 1 (2026-07-31): 20 runs, **all errored**, four
> provider-contract faults → fixed in A7 (founding §17). Round 2: 16 runs,
> **8 succeeded, 8 errored** on two remaining faults → fixed in A8 (founding §18).
>
> **What round 2 proved.** Both Anthropic models completed full agentic runs —
> real tool calls, envelopes captured, valid answer blocks, 4.8k–8.8k tokens each.
> The loop works live. **OpenAI and Google have still never completed a call**, so
> round 3 is really their first-contact test, not Anthropic's.
>
> **What round 3 is expected to expose.** A8 fixed what round 2's errors *named*.
> A 400 stops at the first fault, so on both providers everything validated after
> the fixed parameter is still untested — OpenAI's `seed`, and on Google the whole
> function-calling path (schema projection, `functionResponse` role, response
> shape). **New errors here are the pilot working**, not A8 failing.
>
> **The re-run catch:** resumability keys on `runKey` **regardless of whether the
> row errored**. If a `ledger-pilot.jsonl` is in place, a re-run reports
> `already-done=N pending=0` and **silently does nothing**. Move it aside first:
>
> ```sh
> mv tools/slice16-harness/runs/ledger-pilot.jsonl \
>    tools/slice16-harness/runs/ledger-pilot-$(date +%F)-round3.jsonl
> ```
>
> **Never `rm -rf tools/slice16-harness/runs/`** — INV-036 makes these ledgers
> evidence artifacts. Two are already preserved there:
> `ledger-pilot-2026-07-31-first-contact-ERRORED.jsonl` (round 1) and
> `ledger-pilot-2026-07-31-round2-QUARANTINED-pre-A8-sampling.jsonl` (round 2).
>
> **Round 2's 8 successes are QUARANTINED, not study data** (founding §18.5): they
> ran under A7-3 sampling (`temperature: 0`) and post-A8 runs use provider
> defaults, so they are not comparable. Do not merge them into any analysis.


2 scenarios (`S-02` value path, `S-17` refusal path) × **4 active models** × r=2 =
**16 runs** (the registered design is 6 models = 24; `gpt-5.5-mini` and Together
are deferred — see founding §18.6 for registered-vs-executed).

```sh
set -a; source tools/slice16-harness/.env; set +a
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --pilot
```

**What "good" looks like:**

- `mode=pilot planned=16 … pending=16`, then `done: 16 runs written, 0 errored`. (16, not the registered 24 — two models are deferred. `0 errored` is the ideal; **round 3 realistically will not hit it**, since OpenAI and Google have never completed a call and everything past their fixed parameter is untested.)
- One `prefix fingerprint` line, and **the same value on every row** — that is the DEC-16-7 audit trail. A fingerprint that varies mid-run invalidates those runs.
- Every row has `usage.reported: true` — provider-reported tokens, which replace the chars/4 est-tok heuristic.
- `answerBlockOk: true` on the large majority of rows. Widespread `false` means models are not honouring the structured-answer contract, which is a harness/prompt problem, not a result.
- **`decisions[]` non-empty on every tool-involving row** — that array is the envelopes, in call order. An empty `decisions` with no `no_tool_call` marker means the loop broke.
- **`toolCallCount` between 1 and 5**, `cappedAt: null` on most rows. `cappedAt: 5` means the model exhausted the cap.
- **`usage.reported: true`** with non-zero `inputTokens`/`outputTokens`, summed across turns in `usageTurns`.

**How to spot the no-tool-call case:** rows carry `no_tool_call: true` plus `no_tool_call_reason`. `grade.mjs` prints them under `!! N run(s) made NO TOOL CALL — excluded from all metrics (A4-4)`. **This is a result, not an error** — the model answered without consulting a tool. If it is widespread across every model, suspect the adapter (tools not reaching the provider) before concluding anything about behaviour.

**Grade the pilot:**

```sh
node tools/slice16-harness/grade.mjs tools/slice16-harness/runs/ledger-pilot.jsonl
```

**What means stop and look:**

- Any 4xx → suspect the **adapter** first (never exercised on the wire), the model string second.
- All six models failing identically → prefix or contract problem, not a model finding.

**Then check the AUP pilot valve.** If **AUP ≈ 0 across all six models**, that is a grader-strictness artifact, not a finding — the pre-registered escape valve (A1 §10.3) applies: the AUP matcher may be amended to normalized-keyword matching **before the full run, with disclosure**. A floor in only one or two models is a real result about those models; leave it alone.

Four of the five deferred items were already closed by live MCP calls (§L.10.3). **S-06 remains open and is a CONTRADICTION**, not a deferral: the live envelope returns `feasible:true, C3=483.3960786941876` where the pre-registration says `{feasible:false}` with no C3. Decide its fate (re-pin, retarget, or strike) before the full run — §L.10.1.

## 7. Full run

Pilot round 3 was clean enough to proceed: 12/16 succeeded, and the 4 failures were a Google **quota** 429, not a code fault (founding §19.1).

```sh
set -a; source tools/slice16-harness/.env; set +a
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --full       # primary arm
S16_LIVE_OK=1 node tools/slice16-harness/runner.mjs --control    # control arm, no tools
```

### What to expect (A9)

| | Registered | **Executed** |
|---|---|---|
| Scenarios | 28 | **27** (S-06 deferred) |
| Models (k) | 6 | **3** |
| Repetitions (r) | 10 | **3** |
| `--full` | 1,680 | **243 runs** |
| `--control` | 504 | **243 runs** |
| Total | 2,184 | **486** |

**Expected cost ≈ $13.49** — $6.75 per arm, 6.7% of the $200 ceiling. Tokens are house-measured from the round-3 pilot; **prices are third-party-estimated, so check the consoles** (founding §19.6). At the registered r=10 it would be ≈$29.23.

`--preflight` prints both r values and all three run counts, so verify against it rather than against this table.

### ⭐ RESUMABLE — this is what makes r=3 a floor, not a ceiling

The runner skips any `runKey` already in the ledger. Two consequences, and the second is the important one:

1. A rate limit or crash costs only the incomplete runs — **re-issue the exact same command**.
2. **Repetitions are extensible after the fact.** Raising `EXECUTED_RUNS_PER_CELL` in `config.mjs` and re-running `--full` pays *only for the added repetitions*; the first 3 are never bought twice. r=3 → r=5 costs the increment, about $4.50 more on the primary arm. So r=3 is where this run stops, not a limit of the design (founding §19.3).

The same mechanism is the trap: a ledger left in place from an errored run makes a re-run report `pending=0` and do nothing. Move it aside first — see §6.

**Gemini re-activation needs no code change.** It is `blocked`, not `deferred` or `refuted`: the string resolves and the adapter is built. Raise the Google quota, set its `status` back to `'active'`, and it rejoins — which also restores a second lab to the frontier tier.

## 8. Where things land

| Output | Path |
|---|---|
| Ledgers (JSONL, one row per run) | `tools/slice16-harness/runs/ledger-{pilot,full,control,mock}.jsonl` |
| Row contents | `arm`, `toolsAttached`, model/lab/tier, scenario, RQ, prompt form, repetition, prefix fingerprint, full reply text, parsed answer block, provider-reported usage, error |
| Grades | `node tools/slice16-harness/grade.mjs <ledger.jsonl>` → writes `<ledger>-grades.json` |

> ### ✅ Grading is fail-closed
> `grade.mjs` grades every row with its `scenarioId` supplied, so Amendment A3's slot grading is always active. If any row lacks a resolvable `scenarioId` **or an envelope**, it refuses the whole run with a nonzero exit and writes nothing — there is no partial mode and no fallback to the repudiated pre-A3 definition. Each run records `slotMode` so engagement is auditable after the fact. See founding doc §11.5 and §12.4.

`runs/` is **not** git-ignored: INV-036 makes transcripts committable artifacts. Commit them deliberately with the report. Control rows are separable by `arm` and are excluded from primary metrics.

## 9. OSF / Zenodo mirror

Recorded **PENDING** in DEC-16-10. Do this **before** the full run so the registration predates the data.

```sh
git rev-parse HEAD    # the anchor to register — run AFTER pushing
```

The pre-registration is the **whole chain**, not one commit: `34ca5f7` → A1 `5a99c13` → A2 `d79ba1b` → deferred evidence `3d55abd` → self-audit `15083b5` → truth sweep `e12ebcc` → preflight `8452d1e` → A3 `195d8ea`/`9c61a52` → **live pass `6cb06a1`/`7657c89` + this commit**. Register the **current final HEAD** (`git rev-parse HEAD` after pushing) — **not `8452d1e`** (pre-A3 VF, hole open) and **not `9c61a52`** (pre-live-pass: S-06's ground truth is contradicted by the live instrument, and the grading CLI did not yet exist).

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
