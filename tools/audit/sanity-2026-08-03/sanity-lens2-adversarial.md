# Lens 2 — adversarial repository-state audit

**Pass:** 2 only (steps 2.1–2.6)  
**Repository:** `/Users/hudsonclavin/asteroid-mining-planner`  
**Observed HEAD:** `c6c0c522aec00c5d8ddc4b659feb4f899dbc01fd` (`git rev-parse HEAD`)  
**Independence:** I did not read any other lens or reconciliation output. No repo file was edited, staged, committed, built, or fetched from the network.

The adversarial conclusion is that important work is not simply “missing.” A more dangerous mix exists: (1) a previously declared lost Slice 9 sample has reappeared locally but is silently ignored and still has zero Git history; (2) several decision-closing reports were transient or external and are absent; and (3) the mandatory routing document, `STATUS.md`, describes a pre-archive/pre-push state that Git directly refutes.

## 2.1 Dangling tracked-Markdown references

I extracted 795 `tools/`, `docs/`, `src/`, `strategy/`, `mcp/`, and `tests/` path-like matches ending in `.md/.json/.ts/.mjs/.png` from tracked Markdown, then tested the literal paths. Templates and globs are separated below so that a literal `test -e` failure is not misreported as a missing artifact.

### Literal nonexistent paths

1. `tools/slice15-research/data/slice16-anchor-cells.json` — `HANDOFF.md:73` explicitly calls it “the stale path.” It is absent/untracked. This is intentional negative guidance, not an accidental assertion.
2. `src/v2/vendor/pykep-lambert/UPSTREAM.md` — `src/v2/SLICE_10_FOUNDING.md:262` says it “will be updated in a subsequent dispatch”; it still does not exist. This is an unfulfilled planned path.
3. `tests/fixtures/v2/horizons-inner-solar-system-2026-2040.json` — asserted as an extended/storage fixture at `src/v2/SLICE_10_FOUNDING.md:347` and `src/v2/boundary/slice10-fixture-spec.md:9`, but absent/untracked. The actual fixture is `src/v2/data/horizons-inner-solar-system-2026-2040.json` (`AGENTS.md:143`). This is a materially wrong evidence route.
4. `tests/v2-lambert-izzo.test.mjs` — `src/v2/SLICE_10_FOUNDING.md:99` says implementation/tests “will live” there; it is absent. This is a historical proposed path, not a current test location.
5. `src/v2/launch-vehicles.ts` — cited at `src/v2/SLICE_15_FOUNDING.md:62,134`; absent. The same locked document corrects itself at `src/v2/SLICE_15_FOUNDING.md:212`: “That path has never existed” and identifies `src/v2/porkchop/launch-vehicles.ts`.
6. `src/v2/render/planet-textures.ts` — planned as a “New file” at `src/v2/SLICE_V1_FOUNDING.md:386` and repeated at `src/v2/SLICE_V1_STATUS.md:37`; absent. It is an unexecuted plan presented by a stale status document.
7. `strategy/ASTER_PRODUCT_VISION.md` — `tools/audit/REPO_AUDIT_2026-07-31.md:553` cites it, but `strategy/` does not contain it; the tracked file is root `ASTER_PRODUCT_VISION.md` (`ASTER_PRODUCT_VISION.md:1`).
8. `tools/slice8-ingestion/data/validation-50.json` — absent; cited as a command output at `tools/slice8-ingestion/README.md:66,75,85`.
9. `tools/slice8-ingestion/checkpoint-validation.json` — absent; cited as a command output at `tools/slice8-ingestion/README.md:67,76,86`.

### Templates/globs that are not literal dangling files

- `tests/*.test.mjs` has 68 tracked matches; `tests/**/*.test.mjs` has 13; `src/v2/*_FOUNDING.md` has 12; `tools/slice6-research/data/*.json` has 9; `tools/slice7-research/data/horizons-truth/*.json` has 18 (`git ls-files <pattern>`).
- The README route is semantically incomplete: `README.md:53-56` says both single- and multi-revolution poliastro records live under `tools/slice11-research/data/*-poliastro-validation.json`. That pattern has only one match, `multi-rev-poliastro-validation.json`; the separately tracked single-revolution file is `poliastro-validation.json`, which the stated glob excludes. The evidence exists, but the route does not enumerate what the prose claims.
- `src/v2/SLICE_N_FOUNDING.md`, `src/v2/path/to/file.ts`, and `src/v2/another/file.ts` at `AGENTS.md:225,245,247` are explicit dispatch-template placeholders, not artifact assertions.

## 2.2 INV-034 sweep — assertions whose evidence is untracked or absent

### HIGH — the lost Slice 9 cutover sample exists locally again, but Git still cannot preserve it

The additive correction says the artifact “was NEVER COMMITTED,” that no generator exists, and that recovery found nothing (`src/v2/SLICE_9_FOUNDING.md:426-435`). Current filesystem evidence contradicts only the “found nothing” state: `tools/slice9-research/data/slice9-cutover-sample.json:2-9` is a 69,199-byte sample generated `2026-05-20T00:45:05.067Z`, seed `9031`, for the 2026-05-01→2026-07-30 validation window. But Git still cannot recover it:

```text
git ls-files --error-unmatch tools/slice9-research/data/slice9-cutover-sample.json
error: pathspec ... did not match any file(s) known to git
git check-ignore -v ...
.gitignore:19:tools/slice9-research/data/*  tools/slice9-research/data/slice9-cutover-sample.json
git log --all -- ...
[no output]
sha256 a5574aef880cccb4de0722ec2ed6434c22f3eab0179f150efd1a839cc31dd3c9
```

This is the highest-loss-exposure finding: a repo document already records that the exact values cannot honestly be regenerated (`src/v2/SLICE_9_FOUNDING.md:430-438`), yet the recovered local copy is still under the ignore trap that caused the original loss. The related external-query products `slice9-cutover-truth.json`, `slice9-cutover-cad.json`, and `sbdb-nea-raw.json` are also present and ignored by `.gitignore:19`; their first lines identify JPL state/CAD/SBDB data (`slice9-cutover-truth.json:2-19`, `slice9-cutover-cad.json:2-20`, `sbdb-nea-raw.json:2-20`).

### HIGH — a completed Slice 9 diagnostic cites a preserved input that is now absent

`tools/slice9-diagnostic/SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md:3-4` says the diagnostic is COMPLETE and measured `tests/fixtures/v2/nea-catalog-slice9.json.tmp`, calling it a “preserved Path A post-run state.” The file is absent, has no Git history, and `.gitignore:33` would hide it if recreated. The tracked analyzer names the same input (`tools/slice9-diagnostic/analyze-quality-axis.mjs:24`), but cannot reproduce the old-state measurement without that old-state fixture. The report’s derived population claims (for example 41,558 bodies at `SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md:13`) therefore lack their exact input artifact.

### HIGH — Slice 13 closes decisions with reports that are outside Git and absent

- The showcase resolution cites `aster-audit-reports/slice13-showcase-recon.md` and reports a 41,866-body scan, FK3 values, 4,641 RED cheapest windows, and rankings (`src/v2/SLICE_13_FOUNDING.md:39`). The locked doc itself later concedes that the report is not tracked, no committed generator reproduces the full result, and the figures are unreproducible from the repo (`src/v2/SLICE_13_FOUNDING.md:112`). The named report is absent locally.
- The engineering record also asserts a recon report and a clean three-lens Phase-F audit at `src/v2/SLICE_13_FOUNDING.md:84,98`; `aster-audit-reports/slice13-recon-3e.md` and `aster-audit-reports/slice13-phaseF-audit.md` are both absent/untracked. The accompanying PDF, verification record, and elvperf screenshots are tracked (`tools/slice13-research/literature/3abc-research.pdf`, `3d-verification-record.md`, and six `elvperf-c3-*.png` files), so the gap is specifically the recon/audit outputs.

### MEDIUM — decision-closing `/tmp` evidence was intentionally transient and is gone

- `src/v2/SLICE_10_FOUNDING.md:439-443` names `/tmp/slice10-multiagent-audit-report.md` and `/tmp/finding-1-verification.md`, labels both transient, and says they are reproducible by old dispatches. Both are currently absent.
- `src/v2/SLICE_14_FOUNDING.md:57,188-189` closes OQs using `/tmp/slice14-phase0-recon.md` and `/tmp/slice14-decision-brief.md`; both are absent. That doc openly records the process defect: “no committed audit file exists” and audits lived in chat/founding summaries (`src/v2/SLICE_14_FOUNDING.md:57-58`).
- `HANDOFF.md:18` cites a Windows-only `C:\Users\hudso\aster-audit-reports\S15_PREPUBLISH_AUDIT_2026-07-10.md`; that report is not tracked in this repo and the current canonical repo is macOS (`STATUS.md:13`).

These are not concealed failures—the documents say “transient” or “out-of-repo”—but the resulting closures cannot be independently re-audited from repository artifacts alone.

### MEDIUM — raw inputs are asserted and present, but deliberately ignored

`tools/slice8-5-research/README.md:41-42` names the two Tycho-2 TSV inputs. Both exist only as ignored local files under `.gitignore:16`. Their headers preserve a VizieR retrieval date and full request URL (`tycho2-mag75.tsv:2-13`, `tycho2-suppl1-mag75.tsv:2-13`), and their derived catalog fixture is tracked, so loss is recreatable but the exact retrieved inputs are not clone-recoverable.

`tools/slice9-research/README.md:23-25` is explicit that its committed Markdown report is synthesized from ignored data artifacts. Current ignored matches include the 14.7 MB SBDB raw query and the three cutover artifacts above. This is disclosed, but disclosure does not make the evidence recoverable.

### Control result — Slice 16 ledgers are not an active INV-034 gap

Several tracked documents still say the ledgers are untracked, but Git proves the evidence itself is now preserved. `git ls-files tools/slice16-harness/runs` returns 14 paths (README plus 13 artifacts), and `git log -1 -- tools/slice16-harness/runs` identifies `c0374481169d8324ac2534c598d8ae9b27359f1d` (“commit run ledgers as tracked evidence”). The additive authoritative correction is `src/v2/SLICE_16_FOUNDING.md:1597-1607`. Thus this is now a staleness defect, not an evidence-loss defect.

## 2.3 Untracked-but-valuable work

### Visible untracked set

`git ls-files --others --exclude-standard` returned 99 files: `Untitled.canvas`, `tools/slice16-harness/FULL_RUN_REPORT.md`, and 97 JSON files in the four explicitly carved-out dated Horizons directories (12 Slice 2 + 28 Slice 3 + 49 Slice 4 + 8 Slice 6). Per the audit context, I reported but did not inspect the dated directories or `Untitled.canvas`.

- **`tools/slice16-harness/FULL_RUN_REPORT.md` — work product, one local copy, but core facts duplicated.** Its first 20 lines identify the halted paid attempt, $13.82 spend, 275/810 stopping point, 58.5% same-cause failure, and the token-growth diagnosis (`FULL_RUN_REPORT.md:1-16`). The file is 10,067 bytes and untracked. Loss would remove the standalone incident narrative, but not the underlying evidence: the same marker and key measurements are committed in `src/v2/SLICE_16_FOUNDING.md:1015,1084-1101`, and the ledgers are tracked at `c037448`. Valuable, but not the sole copy of the result.
- **Four dated Horizons directories — external-query work product, one local copy.** They total 97 JSON files and approximately 66.8 MiB allocated. No tracked file mentions the directory name `2026-07-18_2026-10-16` (`git grep` returned zero relevant hits). **INFERRED:** the filenames (`truth-*`, cadence variants) and placement under research data make them query/measurement outputs; loss would cost API time and may not reproduce identical source responses. Inspection was prohibited by the dispatch’s known-dirty carve-out.
- **`Untitled.canvas` — genuine scratch.** It is 2 bytes and explicitly known-dirty; no content inspection was performed.

### Relevant ignored set

`git ls-files --others --ignored --exclude-standard` returned 8,165 files. Most are dependencies or generated scratch: 3,517 `mcp/node_modules/`, 2,357 root `node_modules/`, 2,202 `.tmp-tests/`, 67 `mcp/dist/`, five `.obsidian/` metadata files, and one `.claude/settings.local.json`. Those are reproducible/generated/local configuration, not unique research work.

The relevant ignored artifacts were inspected at their first ~20 lines:

- **Slice 9 recovered cutover corpus (four files): unreproducible/high value.** See 2.2. The sample has a fixed seed but no tracked generator; truth/CAD/raw files embody external-source snapshots. Loss would recreate the documented “lost sample” condition.
- **Slice 9 ingestion raw/logs (five files): costly work product, partially superseded.** `cad-window-raw.json:2-20` identifies a JPL CAD API query; `sbdb-nea-raw.json:2-20` identifies JPL SBDB; `reanchor-stale-run.log:1-20` records an 11,805-row run; `reanchor-90d-run.log:1-20` records a 29,792-row run; `build-summary.json:2-20` records a 41,906-body build. Tracked checkpoints/summaries and the production fixture retain the product, but the full raw/run provenance is one-disk only.
- **Tycho-2 TSVs (two files): valuable exact-source snapshots, recreatable with caveat.** The headers record VizieR server version, timestamps, and complete request URLs (`tycho2-mag75.tsv:2-13`, `tycho2-suppl1-mag75.tsv:2-13`). No paid rerun is indicated, but a later server/catalog response need not be byte-identical.
- **Slice 8 full-run checkpoint/log/PID: scratch-to-provenance.** `checkpoint.json:2-17` records a completed 9,000-object, 3-second-rate-limit run with nine retries; `full-run.log:1-20` records the fetch; the final `tools/slice8-ingestion/data/horizons-anchors-9000.json` is tracked. Losing logs/checkpoint loses operational provenance, not the dataset.
- **`tools/slice16-harness/.env`: appropriate secret-bearing local config.** It was not read. Its ignore is intentional; `src/v2/SLICE_16_FOUNDING.md:1080` already records the relevant guard-property finding without exposing values.

## 2.4 `.gitignore` traps

Patterns with a direct ability to swallow data, research, measurements, fixtures, or reports are:

| Pattern evidence | Current matches | Risk |
|---|---|---|
| `.gitignore:12` `tools/slice8-ingestion/checkpoint.json` | that 527-byte completed-run checkpoint | Silently hides fetch progress/retry provenance. |
| `.gitignore:13` `tools/slice8-ingestion/full-run.log` | 312,460-byte 9,000-fetch log | Silently hides a run report/log. |
| `.gitignore:14` `tools/slice8-ingestion/caffeinate.log` | one empty file | Low current value; pattern is report-shaped. |
| `.gitignore:15` `tools/slice8-ingestion/full-run.pid` | one 5-byte PID | Scratch only. |
| `.gitignore:16` `tools/slice8-5-research/data/*` | two Tycho-2 TSV external-query inputs | **Convention trap:** every future artifact under that research data directory is swallowed. |
| `.gitignore:19` `tools/slice9-research/data/*` | `sbdb-nea-raw.json`, `slice9-cutover-cad.json`, `slice9-cutover-sample.json`, `slice9-cutover-truth.json` | **Highest-risk trap:** it currently hides the recovered artifact whose prior loss created INV-034. Five `!` exceptions at lines 20-24 protect named outputs only; every new filename is ignored by default. |
| `.gitignore:30` `tools/slice9-ingestion/data/*` | `build-summary.json`, `cad-window-raw.json`, `reanchor-90d-run.log`, `reanchor-stale-run.log`, `sbdb-nea-raw.json` | Silently hides raw external queries, measurements, and run logs; only two named exceptions at lines 31-32 are trackable by default. |
| `.gitignore:33` `tests/fixtures/v2/nea-catalog-slice9.json.tmp` | no current match | Already swallowed the exact “preserved” diagnostic input cited at `SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md:4`; future recreation would again be invisible to normal status. |

`.tmp-tests/` (`.gitignore:10`) and `mcp/dist/` (`mcp/.gitignore:2`) currently match generated test/build output, not house-convention evidence paths. They would swallow a carelessly placed report, but are not the active research trap; the `tools/.../data/*` patterns are.

## 2.5 Single points of failure

1. **Recovered Slice 9 cutover sample and companion truth/CAD snapshot — one disk, no Git history.** The sample is locally present and ignored; the founding correction says its exact expected values cannot be regenerated without faking continuity (`src/v2/SLICE_9_FOUNDING.md:426-438`). Recreation cost: potentially impossible byte-/semantics-identically because the old sample/generator history is absent; external truth queries also age.
2. **Slice 9 diagnostic old-state tmp fixture — no local copy, no Git history.** Only the derived report remains (`SLICE_9_QUALITY_AXIS_DIAGNOSTIC.md:3-13`). Recreation cost: unknown; the tracked analyzer exists, but the exact input state does not.
3. **Slice 13 showcase/recon/audit reports — no local repo copy and no Git history.** The most important showcase figures are explicitly unreproducible (`SLICE_13_FOUNDING.md:39,112`). Recreation cost: a new deterministic full-catalog scan plus comparison to every historical number; the founding doc itself requires that remedy.
4. **Transient Slice 10/14 recon reports — no remaining `/tmp` copy.** Their conclusions survive in founding records (`SLICE_10_FOUNDING.md:430-445`; `SLICE_14_FOUNDING.md:57-61,188-189`), but the standalone evidence/reasoning does not. Recreation cost: rerun old prompts/dispatches against a changed repo and external source environment; result equivalence is not guaranteed.
5. **Ignored raw Slice 9 ingestion and Tycho-2 query snapshots — one disk.** Re-querying is likely free of direct monetary charge, but it costs time and may return changed upstream state. The derived production artifacts are tracked, so this is provenance exposure rather than total product loss.
6. **Four dated Horizons query directories — one disk.** **INFERRED** recreation cost is provider-query time and possible upstream drift; 97 files/≈66.8 MiB exist only locally. Their purpose is undocumented in tracked files.
7. **Untracked Slice 16 full-run report — one disk, but not sole evidence.** The incident data and analysis are duplicated in committed founding text and tracked ledgers (`SLICE_16_FOUNDING.md:1084-1101`; commit `c037448`), so recreation is editorial rather than another paid run.

No current single-point exposure exists for the completed Slice 16 study ledgers: all 14 paths under `tools/slice16-harness/runs/` are tracked at `c037448`.

## 2.6 Staleness ranked by reader harm

### 1 — HIGH: `STATUS.md` (mandatory session router) is materially false now

- It says `origin/main` is `642dfc9` and everything after it is unpushed (`STATUS.md:20-25`). Git says `HEAD == origin/main == c6c0c522...` and `git rev-list --left-right --count origin/main...HEAD` returns `0 0`.
- It tells Hudson to push the local chain (`STATUS.md:77`) even though there is no ahead commit.
- It says `tools/slice16-harness/runs/` is untracked and checksums are the only durable record (`STATUS.md:78,120`). Git lists 14 tracked paths, and founding §32 says they were committed at `c037448` (`src/v2/SLICE_16_FOUNDING.md:1597-1607`).
- It includes “three `docs/` CRLF files” in the current known-dirty set (`STATUS.md:120`), but current `git status --porcelain=v1 -uall` contains no `docs/` paths.

Because `AGENTS.md:57` routes every Codex session through STATUS and says to stop on mismatch, this is operationally misleading, not archival trivia.

### 2 — HIGH: `HANDOFF.md` presents a July 10 Windows/Slice-15 handoff as current orientation

`HANDOFF.md:3-8` names a Windows canonical repo, old heads, and old push state. It says Appendix A is not in the repo (`HANDOFF.md:71`), while `git ls-files src/v2/SLICE_16_APPENDIX_A_LOCKED.md` succeeds and `STATUS.md:36-58` says Slice 16 is closed with results. It is useful history but lacks a superseded banner at its top.

### 3 — HIGH: the newly committed repository audit is an unlabelled historical snapshot

`tools/audit/REPO_AUDIT_2026-07-31.md:9-13` currently presents as executive summary that there is no external seal, every ledger is untracked, and no root README exists. Current evidence refutes each: the DOI/seal is recorded at `STATUS.md:40`; ledgers are tracked at `c037448`; `git ls-files README.md` succeeds. The audit accurately states its 2026-08-01 boundary at lines 3-5 and old refs at lines 15-31, but a reader treating its ranked findings as current will be badly misled. `tools/audit/REPO_AUDIT_2026-07-31.md:553` also cites the wrong `strategy/ASTER_PRODUCT_VISION.md` path.

### 4 — MEDIUM: `src/v2/SLICE_V1_STATUS.md` no longer describes its own tracked assets/state

It says the prototype is untracked and “never commits” and that no renderer code belongs to Slice V1 (`src/v2/SLICE_V1_STATUS.md:13-14`), while `git ls-files src/v2/prototypes/renderer-test/main.ts` succeeds. It calls Earth clouds uncommitted and three assets blocked on ImageMagick (`SLICE_V1_STATUS.md:22-28`), while all four final textures are tracked (`textures/2k_earth_{clouds,nightmap,normal,specular}.jpg`). Its parked/resume guidance is therefore unsafe without rerecon.

### 5 — MEDIUM: `ASTER_PRODUCT_VISION.md` is a useful dated vision doc but stale as a state description

It labels “What’s built” as Slices 1–9 (`ASTER_PRODUCT_VISION.md:23`) and twice says seven slices shipped (`ASTER_PRODUCT_VISION.md:38,76`). Current `STATUS.md:30-58` records Slices 9–16 through a closed study. Its explicit date (“Written 2026-05-15,” line 3) reduces, but does not eliminate, the risk.

### 6 — MEDIUM: Slice 16 close/archive reports contain superseded state inside otherwise authoritative reports

`tools/slice16-harness/CLOSE_REPORT.md:73-75` correctly says the ledgers are now tracked, but its preserved §5 still calls them untracked and gives an obsolete dispatch (`CLOSE_REPORT.md:109-155`). `ARCHIVE_REPORT.md:19,150-153` says origin is `642dfc9` and asks Hudson to push/confirm; Git now reports origin and HEAD equal at `c6c0c52`. These are dated session reports, so the conflict is less severe than STATUS, but internal current-state/past-state mixing is easy to misread.

### 7 — LOW: explicitly corrected historical records

`SEAL_DRAFT.md:3` still says “NOT YET SEALED,” but its appended pointer at `SEAL_DRAFT.md:162` explicitly says the top line is historical and records the DOI. `src/v2/SLICE_15_FOUNDING.md:62,134` retain the nonexistent launch-vehicle path, but line 212 explicitly corrects it. These preserve additive history with adequate correction, though search snippets can still surface the stale line first.

## Read-only integrity check

Pre-report and post-report worktree-status digests (`git status --porcelain=v1 -uall | shasum -a 256`) were both `1f9c4d87f96506b6a6d5819ec739a044dec6099ec8fc03112e8498b13f437405`. The status stream is byte-identical; the only written file is this report under `/tmp`, outside the repository.
