# Slice 16 run ledgers — evidence directory

**Committed 2026-08-02 under ruling R-ARCH-1 (`S16-ARCHIVE-2026-08-02-A`).** These files were previously untracked, existing on one workstation. No invariant was violated — founding §25.3 disclosed the untracked state honestly rather than claiming otherwise — but INV-034's *purpose* was unmet: a $28.55 dataset backing a DOI-sealed study should be recoverable by someone other than its author, and a checksum proves a file unaltered while being unable to reconstruct it.

> ## ⚠️ ONLY 4 OF THESE 13 FILES ARE STUDY DATA
>
> Nine files are pilots, mocks, a cost probe, or the **halted first attempt**. They are committed because they are the incident and development record and must not be hidden for being superseded — **not** because they are results. Every published figure in founding §30 comes from the four files in the first table below and from nothing else.
>
> **The 114 successful rows in `ledger-full.jsonl` are NOT study data.** They were collected under the pre-A12 instrument, before the public seal, and are a plan-order-biased subset of a halted run. They are excluded from every reported number (founding §21, §30.9, §31.3). Do not aggregate them. Do not compare them. Do not quote them.

Files are stored **byte-identical**; every digest below was verified before and after staging, and no `.gitattributes` rule, filter, or line-ending conversion applies to this directory (`core.autocrlf=false`, all attributes unspecified).

---

## STUDY DATA — 4 files

Instrument: **A12** (the corrected, publicly pre-registered instrument). Collection began **after** the seal — DOI `10.5281/zenodo.21752617`, commit `670b039`, published `2026-08-01T23:44:23Z`. Zero provider errors across all 468 runs.

| File | Bytes | Rows | Arm | Contents |
|---|---|---|---|---|
| `ledger-full-a12.jsonl` | 11,210,666 | 312 | `primary` | The primary arm. 2 models × 26 scenarios × r=6, forms balanced 104/104/104. 0 errored. `2026-08-02T04:44:29Z` → `06:18:31Z`. |
| `ledger-control-a12.jsonl` | 1,791,375 | 156 | `control` | The no-tools control arm (DEC-16-2 arm b / DD-4). 0 errored. `2026-08-02T06:19:07Z` → `06:55:42Z`. |
| `ledger-full-a12-grades.json` | 2,054,100 | — | derived | Grades for the primary arm. `ledgerRows: 312`, `runs: 258` — the 54-row difference is the A4-4 no-tool-call exclusion (founding §30.6). Backs every primary figure in §30. |
| `ledger-control-a12-grades.json` | 11,765 | — | derived | Grades for the control arm. **`runs: 0`** — see the known gap below. Its `aggregates.controlArm` block is the source of §30.5's figures. |

```
c72de26bafcbda8d5693483ef36dfb09cca0113db0594c8b4fb5559d6d349493  ledger-full-a12.jsonl
43d61a1154228651218663baaaaf636cfb3e96cf0ffc769c5f4ea9fb44d068ef  ledger-control-a12.jsonl
8c7cc53a74a1a3a013dac924db1aa2d1ab4cc9ae71b88098e48777d01c5770d3  ledger-full-a12-grades.json
8a5f8bba6546b39f607d1d8fea165d2bd560f7d31909c5210102728a3f3ea297  ledger-control-a12-grades.json
```

**Known gap in `ledger-control-a12-grades.json`:** `grade.mjs` serializes `result.graded` (primary only), so `runs` is an empty array while `ledgerRows` reads 156. The **reported control figures are correct** — they are read from the aggregate, which is present — but per-row control grades are not in this artifact. They are reproducible by re-running the grader against `ledger-control-a12.jsonl`. Tracked as a backlog item in `CLOSE_REPORT.md` §2; it changes no published number.

---

## NOT STUDY DATA — 9 files

**None of these may be quoted as a result.** Committed as the development and incident record.

| File | Bytes | Rows | Instrument | What it is |
|---|---|---|---|---|
| `ledger-full.jsonl` | 1,447,071 | 275 | **pre-A12** | **HALTED ATTEMPT 1.** 275 rows: 114 succeeded, 161 errored, on OpenAI credit exhaustion at 275/810 (founding §21). `gpt-5.5` + `claude-sonnet-4-6`, `2026-08-01T04:05Z` → `04:31Z`. Collected **before the public seal** and under an instrument the subsequent audit found defective. **NOT STUDY DATA — this is the incident, not a result.** |
| `ledger-pilot.jsonl` | 95,180 | 16 | pre-A12 | Pilot round 3 (post-A8 sampling fix). 12 ok / 4 errored. 4 models. |
| `ledger-pilot-2026-07-31-round2-QUARANTINED-pre-A8-sampling.jsonl` | 77,828 | 16 | pre-A12 | Pilot round 2, **QUARANTINED** — collected under the pre-A8 sampling defect. 8 ok / 8 errored. Filename carries its own warning. |
| `ledger-pilot-2026-07-31-first-contact-ERRORED.jsonl` | 17,340 | 20 | pre-A12 | First provider contact. **All 20 rows errored.** 5 models, including the later-refuted `gpt-5.5-mini`. |
| `ledger-probe.jsonl` | 2,013,432 | 71 | A12 | **Cost probe**, `arm: "probe"` — never study data by construction (config `PROBE`). 52 ok / 19 errored: the 19 are the measured provider blocks (gpt-5.5 credit at row 1, Gemini quota over 18 rows), both costing $0. Founding §28–§29. First row `2026-08-01T23:49:23Z` — **5 minutes after the seal was published**. |
| `ledger-mock.jsonl` | 599,784 | 18 | A12 | Offline mock adapter (`mock:mock-toolcalls`). **No provider contacted, no money spent.** Harness self-test. |
| `ledger-mock-2026-07-31-pre-A9-r10.jsonl` | 1,999,328 | 60 | pre-A9 | Offline mock at r=10, pre-A9. No provider contacted. |
| `ledger-mock-grades.json` | 1,116,927 | — | A12 | Grades for `ledger-mock.jsonl`. Mock input ⇒ mock output. |
| `ledger-mock-grades-2026-07-31-pre-A9-r10.json` | 3,710,964 | — | pre-A9 | Grades for the pre-A9 mock run. |

```
416f189d8b1bdb7ed13f53f7098bd1b546076754cd29ad106d6a9a8dd267d5d0  ledger-full.jsonl
ee9ada7fbe8b1e5cd491766ab6918fe1242188aa58d8f13ede38ed7820968f92  ledger-pilot.jsonl
48cf1d51a3d5cdd399306dd3410ea5620995213d2d02fd6c3b94631fe06f8698  ledger-pilot-2026-07-31-round2-QUARANTINED-pre-A8-sampling.jsonl
92e5fe7fc5bf876a1e9f92bb93b76c77a58cb2d25551c5fcde0b3ef90aa7375a  ledger-pilot-2026-07-31-first-contact-ERRORED.jsonl
2a79ca8fdd1400ee571cae0e44fa1ca297296cbfece8235ff3a9c82e896411b1  ledger-probe.jsonl
ade105a54d978ede8a66d12a9fb0b38c957f174dfc1353e26aa70dcea48c959f  ledger-mock.jsonl
9a87193b40c7705894c170c96e2ae1b72bb6424931c7727323a8bac3ba5055bf  ledger-mock-2026-07-31-pre-A9-r10.jsonl
c879484e3c492ce134d1d93c4623256ba7ce9fead46441a918951fd644ef672c  ledger-mock-grades.json
d880fa6066957bdc130e99b054ccb4ebf601615129c6344bab871c98f05ffc97  ledger-mock-grades-2026-07-31-pre-A9-r10.json
```

---

## Reading these files

**Verify integrity:** `shasum -a 256 -c` against the digests above, which also appear in founding §25.3 and §32.

**Row provenance.** Every ledger row carries the harness commit, the MCP server build commit, the system text, the instantiated user turn, and the full provider-native conversation (founding §24.4) — so any published figure is checkable against the transcript that produced it, offline, without re-running anything.

**Two field-naming traps, named so nobody is caught by them:**

1. In the `*-grades.json` artifacts, **`marker` and `harnessMarker` identify the code that produced the artifact, not the session that ran it.** Every grades file reads `marker: "S16-MCPLIVE-2026-07-27-A"` because that is `grade.mjs`'s own build marker. **`gradedAt` is the truthful timestamp.** The A12 grades were produced `2026-08-02T06:56Z`.
2. `ledger-mock-grades-2026-07-31-pre-A9-r10.json` records `ledger: ".../ledger-mock.jsonl"` — its source was renamed to `ledger-mock-2026-07-31-pre-A9-r10.jsonl` *after* grading, for archival. The `ledger` field preserves the path as it was at grading time and was not rewritten, because these artifacts are evidence.

**Do not edit any file in this directory.** They are frozen evidence under INV-S16-036. A correction is a new artifact plus an additive note in the founding doc, never an in-place edit.
