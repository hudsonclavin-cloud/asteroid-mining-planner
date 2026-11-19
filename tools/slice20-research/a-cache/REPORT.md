# Slice 20 A-cache run evidence

Prepared during the resumed S20_CHAIN run on Hudson's Windows laptop. Source branch: s20-a-cache. Origin main baseline: da27cb5.

## Phase 0 facts

| Run | Node | npm | OS |
|---|---|---|---|
| Prior A-cache run | v26.7.0 | 11.19.0 | Windows 11 Home, 64-bit, version/build 10.0.26200 |
| Resumed chain run | v26.7.0 | 11.19.0 | Windows 11 Home, 64-bit, version/build 10.0.26200 |

Both runs used origin/main da27cb5.

## K2 proxy equivalence

PASS. The v1 cache SHA-256 was bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206, schemaVersion 1, c3MaxKm2S2 25. The old vinf proxy and minC3 proxy matched on all seven checks: bin width 0.25 km/s, all 32 bins, overflow 0, counted 41,422, noWindow 484, catalogSize 41,906, and the lowest-sample list. The K2 equivalence JSON records pass=true.

## Regeneration

The completed retry started 2026-11-17T22:19:56.020Z and finished 2026-11-17T22:57:02.242Z. End-to-end elapsed time from those log timestamps was 2,226.222 seconds (about 37m 6s); cache metadata wallTimeSeconds was 2,222.1609335 (precompute complete in 2,222.2 seconds). totalSolves was 1,804,638,825. The generator reported 41,422 low_departure_c3, 483 high_departure_c3, 0 lambert_unconvergeable, 1 propagator_failed, and 130 co-orbital bodies tagged.

Cache provenance: solverCommit d3f20885adcd8c0074bcf1423b28e09354fedb69; catalogFixtureSha256 f88028d2839842299b7aae20644d15fef265b19e3bbca576c5dd0faf7d231418; horizonsFixtureSha256 b278dd5567f30266593c49bf4fef203e7570d3613187fd112dc7015109a39c15; precomputeScriptSha256 60f3a3fca9728d4f0bfc83d97a8ea1b686ffda3baf471a806b4a3ea7c14daa37.

Generator block from the v2 cache metadata:
{"node":"v26.7.0","platform":"win32","arch":"x64","osRelease":"10.0.26200","treeClean":true}

## Acceptance diff

v1 SHA-256: bd27b9bd882a65343399f772e37218b5fb05644bea5a822aafcb65e81e750206  
v2 SHA-256: 961bd7af7d6dfdea6936b10882302f750860f6d0534d7b425db685e28ac55469

| Check | Result |
|---|---:|
| Both caches validate | true |
| Schema version | 1 -> 2 |
| Body count | 41,906 -> 41,906 |
| Body order differences | 0 |
| Status matrix | high_departure_c3 483; low_departure_c3 41,422; propagator_failed 1; all off-diagonal cells 0 |
| Status off-diagonal changes | 0 |
| isCoOrbital changes | 0 |
| Displayed C3 text changes | 0 |
| Near-zero flag changes | 0 |
| Screening color changes | 0 |
| minC3 finite pairs | 41,905 |
| minC3 mismatched null/non-finite values | 0 |
| minC3 maximum relative difference | 2.1173720492082248e-13 |
| minC3 median relative difference | 0 |
| minC3 date changes | 0 |
| minC3 TOF-day changes | 0 |
| v2 bestWindows bodies | 0 |
| Unexpected metadata differences | none |
| Overall acceptance | PASS |

Status-matrix detail:

| v1 status | v2 high_departure_c3 | v2 low_departure_c3 | v2 propagator_failed |
|---|---:|---:|---:|
| high_departure_c3 | 483 | 0 | 0 |
| low_departure_c3 | 0 | 41,422 | 0 |
| propagator_failed | 0 | 0 | 1 |

All recorded acceptance criteria were true, including unchanged body order, co-orbital classification, displayed C3, near-zero flags, screening colors, minC3 null handling, and absence of bestWindows in schemaVersion 2.

## Cache size

| Version | Raw bytes | gzip -9 bytes | brotli -11 bytes |
|---|---:|---:|---:|
| v1 | 34,499,477 | 8,251,154 | 6,342,245 |
| v2 | 8,081,586 | 1,054,003 | 760,328 |

## Provenance mutation checks

| Mutation | Result |
|---|---|
| Altered one Horizons fixture byte | Expected provenance test failed: horizonsFixtureSha256 mismatch; mutated actual 784e89c7be995ec3b8b97adf0fe51e52c312f630d029205146ed396111d5da46, expected b278dd5567f30266593c49bf4fef203e7570d3613187fd112dc7015109a39c15 |
| Appended one space to the generator | Expected provenance test failed: precomputeScriptSha256 mismatch; mutated actual e623f9c0420451bee8b0e02ad4f23d0372cea6efcf576ee5c203aa1f67ae68b3, expected 60f3a3fca9728d4f0bfc83d97a8ea1b686ffda3baf471a806b4a3ea7c14daa37 |
| Restored both inputs | Expected provenance test passed |

## Built entry bundles

New entry bundles: compareV2-Cdr7Y37T.js and solarSystemV2-DMCzKWJd.js. Updated shared bundle: store-DURZ-68X.js.

## Commits

Steps 1-11 on s20-a-cache, chronological order:

| SHA | Commit |
|---|---|
| 0d00b54 | build(cache): precompute writes schemaVersion 2 - no bestWindows, refuses a dirty tree, records generator |
| d61c94d | refactor(cache): boundary accepts schemaVersion 1 or 2; bestWindows leaves the contract (DEC-20-15) |
| 9b2f4ae | test: drop bestWindows from two screen-result literals (field removed by DEC-20-15) |
| d3f2088 | chore(k2): vinf proxy from minC3 (identical to the min over best windows, since C3 = vinf^2) |
| b75129c | build(cache): regenerate screening cache at schemaVersion 2 (DEC-20-15; display unchanged) |
| 9ddf7dc | build(docs): rebuild after the schemaVersion 2 cache |
| 89eea53 | test(cache): recompute the screening cache's three provenance hashes (DEC-20-15) |

FIX1: ca27cb7, one-way mission-cost handling for non-finite C3.  
FIX2: 6ace68c, MCP CI job and eval-report gate.  
MERGE: 87631ae6bb4fee10fd32362cbdad6c4e1aba2cb5, second parent 6ace68c.  
Evidence commit: this REPORT.md and its evidence files; commit message is docs(research): Slice 20 A-cache run evidence. Its SHA is recorded in the final execution report.

## Step 12 stop and resume

The earlier Step 12 MCP run in the A-cache worktree had no prior npm --prefix mcp ci, so MCP dependencies were missing; it also exposed the TS2322 compile break at mcp/src/tools/compute-shared.ts:262, present since 4535df9. The original output included the missing-package errors and that TS2322. The resumed chain installed MCP dependencies in both worktrees, then fixed and gated the issue.

- FIX1 ca27cb7: non-finite C3 in the one-way mission-cost budget now throws instead of becoming a curve-domain null.
- FIX2 6ace68c: adds the MCP CI job and eval-report assertion gate.
- MERGE 87631ae: merged FIX1 and FIX2 into s20-a-cache.
- Stage 2.2 on the merged A-cache tree: MCP npm ci exit 0; 29 tests passed, 0 failed; eval 10/10 PASS; fresh-report assertion exit 0. The only eval-file diff was generatedAt/origin in JSON and Generated/Origin in the summary; both generated files were restored.
- Stage 2.3 root verify: 112 files passed, 0 failed, 0 LOAD-TIMEOUT; 371 tests passed, 0 failed; accounting 112 == 112 + 0 + 0 OK. Wall clock 776.5 seconds. The dispatch expected 370 tests; actual was 371 (SOFT count difference).

## Test counts, Windows vs Linux

| Run/reference | Runner | Files | Tests passed | Failed | Skipped | Load timeouts |
|---|---|---:|---:|---:|---:|---:|
| Stage 0.7 Windows baseline | Node v26.7.0 / win32 | 111 | 369 | 0 | 1 retired test | 0 |
| Stage 1.3 Windows after FIX1 | Node v26.7.0 / win32 | 111 | 370 | 0 | 1 retired test | 0 |
| Stage 2.3 Windows on merged A-cache | Node v26.7.0 / win32 | 112 | 371 | 0 | 1 retired test | 0 |
| Nova Linux reference TSV | Node 24 / Linux | 111 | 370 | 0 | 1 | n/a |

Stage 0.8 was skipped at its soft ceiling: elapsed 27m26s versus a 20-minute ceiling; last observed file running was src/v2/porkchop/colormap.test.mjs. The background parent was stopped and no --test child remained. Its stdout and stderr files were empty.

MISSING: Windows counts-windows.tsv and the 0.8 PARSE/DIFF lines (looked in %TEMP%\s20-chain\counts-windows.tsv and counts-run.log; R3 skipped before producing them). This is a HOLD. No 0.8 DIFF lines are available to reproduce; do not infer them from the aggregate totals.

## Evidence copies and remaining holds

The byte-verbatim copies in this directory include a-cache-LOG.md, chain-LOG.md, diff-v1-v2.mjs, diff-v1-v2.json, linux-node24-counts.tsv, and write-status.mjs. The Windows counts TSV is absent because Stage 0.8 was skipped at its ceiling; this is recorded above as MISSING and HOLD.

No uncommitted drafts were present in the A-cache worktree at the Stage 0.5 check.

HOLD: Stage 1.3 test count was 370 versus the 369 Stage 0.7 baseline. Stage 2.3 was the dispatch-defined SOFT difference (371 actual versus 370 expected). The missing per-file Windows comparison is a separate HOLD.