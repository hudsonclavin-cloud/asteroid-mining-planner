# Aster Read-Only Repository Audit

Marker: ASTER-REPO-AUDIT-2026-07-31-A
Audit date: 2026-08-01
Repository: /Users/hudsonclavin/asteroid-mining-planner

## 1. Executive summary

1. **CRITICAL / MEDIUM:** Slice 16 cannot yet produce defensible study results: synthetic adversarial probes found central grader false passes and false failures, several registered prompts are not actually instantiated, and the production control arm is ungradeable.
2. **CRITICAL / SMALL:** The pre-run A10 state was committed locally only 74 seconds before collection and remains absent from origin/main; no external OSF/Zenodo seal was verified, while every pilot/full ledger remains untracked.
3. **CRITICAL / MEDIUM:** The live run crossed its same-cause halt threshold at row 147 but reached 275 rows; 161 errors now make the ledger wholly ungradeable and are also treated as completed on resume. The cost sample missed the real cost driver by about 3 times.
4. **CRITICAL / SMALL:** Public trust surfaces contain reviewer-visible false or incomplete claims: invariant numbers collide, About labels a cost-only artifact a full validation report, required texture attribution is absent, and npm provenance hides a dirty publish build.
5. **HIGH / SMALL:** CI does not test the published MCP package or the Slice 16 instrument, the default test command omits 16 files, and the repository has no root README that exposes the strongest shipped work.

## Audit boundary and repository state

- The governing files AGENTS.md, CLAUDE.md, STATUS.md, HANDOFF.md, INVARIANTS.md, DEVLOG.md, the complete Slice 16 founding document and locked appendix, and the complete harness RUNBOOK were read before conclusions.
- Start state: local HEAD b3742434f730890f96675e07a058a6484bbfe06d; origin/main and live remote main d0479f7ffb7538c1624b33c16337ef84a2133a90. Hudson waived the STATUS/HEAD stop gate.
- During the audit, a user-owned commit advanced HEAD to 63e18ab199f76728c64bf12a67422dc507efd545 and recorded the full-run incident additively. End state is therefore local main ahead of origin/main by two commits.
- Existing user changes were preserved: .dispatch-scope, hook executable bits, three docs HTML files, Untitled.canvas, tools/slice16-harness/FULL_RUN_REPORT.md, and tools/slice16-harness/runs/.
- The audit did not edit, stage, commit, delete, push, install, build, set an environment variable, call a paid model, or inspect a secret value. This report is its only intentional file write.
- Operational ledger metadata was counted to diagnose the halt. No live reply text was inspected, no live grade was computed, and all grader behavior probes below used synthetic in-memory fixtures.
- Read-only live checks were limited to origin state, public static deployment bytes, npm package metadata/tarball, advisory metadata, and non-spending HTTP methods. A valid paid Worker POST was deliberately not made.

Repository identity evidence:

~~~text
audit-start HEAD  b3742434f730890f96675e07a058a6484bbfe06d
audit-end HEAD    63e18ab199f76728c64bf12a67422dc507efd545
origin/main       d0479f7ffb7538c1624b33c16337ef84a2133a90
ls-remote main    d0479f7ffb7538c1624b33c16337ef84a2133a90
~~~

## 2. Top 10 actions, ranked by value divided by effort

| Rank | Value / effort | One-line dispatch |
|---:|---|---|
| 1 | CRITICAL / SMALL | Quarantine the halted run without modifying originals, derive a checksum-pinned retry manifest, make only successful rows resumable, and enforce the registered same-cause halt automatically. |
| 2 | CRITICAL / MEDIUM | Amend and revalidate the grader against adversarial fixtures covering outer prose, radius/diameter semantics, refusal-number identity, provenance substrings, confidence contradictions, S-13, and S-30. |
| 3 | CRITICAL / MEDIUM | Instantiate every scenario into a frozen, inspectable transcript plan, implement real multi-user-turn cases, fill all referents/placeholders, and redesign the control arm around gradeable ground truth. |
| 4 | CRITICAL / SMALL | Decide and record the registration failure transparently: publish the exact pre-data chain, obtain an external timestamp if still useful, and commit checksum-addressed ledgers/transcripts under INV-034/036. |
| 5 | CRITICAL / SMALL | Add strict CLI mode parsing, a conservative usage/spend halt, provider hard-cap verification, scenario-stratified cost sampling, and a corrected authorization table before any retry. |
| 6 | CRITICAL / SMALL | Add an invariant-number mapping amendment, then synchronize STATUS, RUNBOOK, preflight text, grade artifact notes, adapter headers, and the environment template to A10/current reality. |
| 7 | CRITICAL / SMALL | Correct the About trust links/copy, add required Solar System Scope attribution, fix the nonexistent launch-vehicle path, and remove claims unsupported by committed evidence. |
| 8 | HIGH / SMALL | Extend CI with clean MCP build/test/package smoke on Node 18 and 24 plus the offline Slice 16 suite; make the default test command truthful. |
| 9 | HIGH / MEDIUM | Disable the legacy paid research route or add real authorization/global abuse controls; require clean npm publish provenance and disclose dirty state in SourceRefs. |
| 10 | HIGH / SMALL | Add a reviewer-first root README that leads with the live demo, MCP quick start, one-core/two-interfaces story, validation evidence, and one current visual. |

## 3. Per-lane findings

### Lane 1 — Inventory and dead code

#### Top-level inventory

The following command-derived inventory covers every top-level directory present at audit time. Sizes include ignored/generated contents; tracked counts come from git ls-files.

| Directory | Tracked | Size | Purpose / disposition |
|---|---:|---:|---|
| .claude | 11 | 76K | Legacy V1 domain-agent definitions; stale operational surface. |
| .git | 0 | 86M | Repository metadata. |
| .githooks | 2 | 8K | Project safety policy enforcement; protected. |
| .github | 1 | 4K | GitHub Actions CI. |
| .obsidian | 0 | 24K | Ignored local note-app metadata. |
| .tmp-tests | 0 | 46M | Ignored generated test compilations. |
| docs | 50 | 123M | Committed GitHub Pages build output. |
| mcp | 32 | 137M | Published MCP source, tests, generated build, and local dependencies. |
| node_modules | 0 | 75M | Ignored root dependencies. |
| proxy | 3 | 32K | Exact duplicate of the Cloudflare Worker tree; external-use status uncertain. |
| src | 251 | 10M | Canonical src/v2 plus intentionally retained pre-V2 legacy code. |
| strategy | 2 | 20K | Product vision/strategy documents. |
| tests | 220 | 106M | App tests, fixtures, and oracle evidence. |
| textures | 19 | 17M | Vite public assets, including an archival staging subtree. |
| tools | 330 | 162M | Research, ingestion, validation, audit, and Slice 16 harness material. |
| v2 | 8 | 32K | HTML route entry points and two compatibility redirects. |
| vendor | 2 | 128K | Pinned third-party reference data. |
| worker | 3 | 32K | Cloudflare proxy/research Worker source. |

#### L1-1 — Stale write-enabled agent routing points at the legacy architecture

**Severity: HIGH · Effort: SMALL · Hurting now.**

.claude/agents/README.md:3-15 assigns five domain agents to index.html and physics.worker.js; lines 66-80 explicitly route trajectory and rendering changes there. AGENTS.md:23-38 makes src/v2 canonical, and AGENTS.md:150-165 limits Claude Code to docs/recon. AGENTS.md:281-286 says these V1 definitions live in _rescued-agent-defs, but that directory is absent while the active-looking .claude definitions remain. A client that auto-discovers them can route new work into legacy code with overly broad write authority.

#### L1-2 — Obsolete catalogs and staging sources inflate the public Pages payload

**Severity: MEDIUM · Effort: SMALL · Hurting now.**

src/v2/app/solar-system/loader.ts:8-10 re-exports Slice 7, 8, and 9 loaders, while the production runtime consumes only Slice 9 at src/v2/app/solar-system/runtime.ts:779-784. Vite also treats the entire textures directory as public at vite.config.ts:5-11. Committed output consequently contains:

~~~text
obsolete Slice 7/8 catalog assets: 2 files, 10,642,207 bytes
docs/_staging_v1:                4 files,  8,897,810 bytes
largest staging file: earth_lights_4800.tif, 7,072,234 bytes
~~~

The source fixtures and staging originals are evidence/archival inputs and should stay; only their accidental deployed copies are candidates for exclusion.

#### L1-3 — Retired route implementations remain typechecked behind permanent redirects

**Severity: MEDIUM · Effort: SMALL · Will hurt later.**

v2/earth-moon/index.html:6,42 and v2/inner-solar-system/index.html:6,42 immediately redirect to solar-system, but their retired runtime/boundary implementation remains in src/v2 and a stale integrity test still reads it at tests/v2-runtime-display-integrity.test.mjs:91-103. This is not legacy-vs-V2 duplication; it is dead V2 route code still contributing maintenance and test surface. Confirm no historical fixture contract depends on it before removal.

#### L1-4 — A small set of modules/exports appears genuinely unused

**Severity: LOW · Effort: TRIVIAL · Harmless clutter.**

Repo-wide symbol/import searches found:

- src/v2/boundary/slice2-inner-system.ts has no importer.
- src/v2/render/empty-viewport.ts is consumed only by its barrel exports at src/v2/render/index.ts:10-13,114.
- src/v2/core/lambert/stumpff.ts is imported by tests but not by the Izzo production solver, despite its header claiming it is used there.
- A porkchop-view import, one asteroid-renderer color symbol, and several MCP constants are unconsumed.

The Lambert file is protected math surface: fix its comment or disposition only through a signed, oracle-gated dispatch, not a cleanup sweep.

#### L1-5 — proxy and worker are byte-identical duplicate deploy trees

**Severity: MEDIUM · Effort: SMALL · Will hurt later; deletion is uncertain.**

Both index.js files hash to e0c32bb6741d4623ac6bd345d655f206932460cb and both wrangler.toml files hash to 331305ee7af15ee66c8ad4e38bdc13722a25ab65. No in-repo consumer needs proxy, but an external deployment workflow may. Resolve Cloudflare source-of-truth ownership before removing either directory.

### Lane 2 — Unfinished work

#### L2-1 — Slice 16 reuses invariant numbers already assigned globally

**Severity: CRITICAL · Effort: SMALL · Hurting now.**

INVARIANTS.md:200-201 defines INV-033 as anti-fabrication and INV-034 as evidence-artifact tracking. Slice 16 independently defines INV-033 frozen instrument, INV-034 programmatic grading, INV-035 pre-registration, and INV-036 transcripts at src/v2/SLICE_16_FOUNDING.md:24-29. STATUS.md:32 still calls INV-034 the ceiling. Later Slice 16 decisions cite the local meanings, so a reviewer cannot resolve an invariant reference without context. Preserve additive history and append an explicit namespace/mapping amendment; do not rewrite old entries.

#### L2-2 — A10 executable values coexist with A9 operator text and artifact labels

**Severity: CRITICAL · Effort: SMALL · Hurting now.**

config.mjs:47-77 executes r=10 and config.mjs:562-589 computes 810 primary plus 243 control, but:

- runner.mjs:258 still prints “A9-1, reduced for resource constraints.”
- runner.mjs:302 still says full uses executed r=3.
- config.mjs:554-557 still documents r=3.
- grade.mjs:423-431 would write “r=3 executed” into every grade artifact.
- RUNBOOK.md:36-47,183-185,306-326 expects 69 tests, 18 mock runs, 243 primary runs, 486 total runs, and about $13.49.

Actual read-only preflight/config inspection returned registered r=10, executed r=10, 810 primary, 243 control, and 1,053 total. The offline harness suite returned 75/75. The incident record now confirms the 810-run plan was executed. This is more than cosmetic because stale text controls authorization and future public artifacts.

#### L2-3 — The global Lambert frame description contradicts the measured frame invariant

**Severity: HIGH · Effort: SMALL · Hurting now.**

INVARIANTS.md:28-29 labels the Lambert excess vectors heliocentric ECLIPTIC, while INVARIANTS.md:56-67 correctly records the consuming vectors as ICRF/equatorial and forbids the rotation after measurement. Slice 11/12 amendments and production DLA code follow the measured ICRF rule. The code is correct; the earlier global prose is hazardous because a future math dispatch could reintroduce the rejected 23.4-degree rotation.

#### L2-4 — Required Solar System Scope attribution never landed

**Severity: HIGH · Effort: SMALL · Hurting now.**

INV-V1-001 requires source/license documentation before assets ship at src/v2/SLICE_V1_FOUNDING.md:53-68. DEC-V1-1 explicitly requires NOTICE attribution at lines 194-226. Earth texture URLs are live in src/v2/app/solar-system/runtime.ts:101-106 and loaded at 521-545, but NOTICE:1-49 has no Solar System Scope or CC BY 4.0 entry. This is a concrete licensing/credibility defect.

#### L2-5 — Environment and adapter headers state behavior already disproved by execution

**Severity: HIGH · Effort: TRIVIAL · Hurting now.**

tools/slice16-harness/.env.example:20-23 says a missing key skips that model, while runner.mjs:241-248 and config.mjs:612-632 refuse the whole invocation. The OpenAI adapter still says no successful call at adapters/openai.mjs:4,35-48 despite 109 successful full-run rows; the Anthropic adapter says untested at adapters/anthropic.mjs:4-5 despite successful pilot and full-run calls. These headers are likely to drive the next operational decision.

#### L2-6 — The renderer upgrade is materially incomplete, but is a plan rather than shipped-code breakage

**Severity: MEDIUM · Effort: LARGE · Will hurt later.**

The V1 renderer founding plan promises texture/Phong materials for all bodies and atmospheric/cloud tiers at src/v2/SLICE_V1_FOUNDING.md:385-433. Current runtime uses Lambert materials for non-Earth bodies at runtime.ts:455-490, has URLs only for Earth at 101-106, and loads a cloud texture into userData without a consumer at 543-545. Treat this as unfinished slice scope, not as a reason to improvise visual changes: browser verification and asset provenance gates remain mandatory.

#### L2-7 — Malformed ledger handling is broader than its comment and can duplicate spend

**Severity: MEDIUM · Effort: SMALL · Hurting now.**

runner.mjs:54-67 catches and skips every malformed JSONL line, although its comment permits only a truncated final line. A malformed middle row disappears from the done set and can be rebilled on resume. Conversely, a syntactically valid error row is treated as done. Recovery semantics need one coherent, fail-loud policy.

#### L2-8 — Implementation TODO debt is not hiding in canonical code

**Severity: LOW · Effort: TRIVIAL · Harmless clutter.**

The audit marker scan produced:

~~~text
canonical src/v2 + mcp + harness matches: 4
  all four are self-disclosing documentation/session-report text
legacy implementation matches: 250 across 25 files
~~~

No canonical implementation stub throws “not implemented,” and no canonical empty catch or commented-out implementation block was found. The legacy TODO volume is intentionally outside tsc and should not be converted into a V2 cleanup project.

### Lane 3 — Documentation and code divergence

#### L3-1 — STATUS is 38 commits and an entire study phase behind

**Severity: HIGH · Effort: SMALL · Hurting now.**

STATUS.md:20-32 reports HEAD d690562, origin 89f492a, and invariant ceiling 034; lines 38-47 call Slice 16 an unlocked pre-registration draft at 7cd761b1; lines 72-97 still describe RR1I as local and Appendix A as absent. Current HEAD is 63e18ab, origin is d0479f7, the locked appendix exists, A1-A10 and one full-run incident exist, and the active roster/run status has changed. Since AGENTS routes every agent through STATUS, this drift caused the session-start stop that Hudson had to waive.

#### L3-2 — Evidence called preserved/committed is not tracked

**Severity: CRITICAL · Effort: SMALL · Hurting now.**

Slice 16 founding records preserved pilot ledgers at lines 915-923, 969-990, and 1025-1067; INV-034 requires evidence called committed to be tracked. Yet:

~~~text
git ls-files tools/slice16-harness/runs
  [no output]
git cat-file -e HEAD:tools/slice16-harness/runs/ledger-pilot.jsonl
  fatal: path exists on disk, but not in HEAD
git status --short
  ?? tools/slice16-harness/runs/
  ?? tools/slice16-harness/FULL_RUN_REPORT.md
~~~

The data is preserved on one workstation, not committed or independently recoverable. The new incident document truthfully discloses this at src/v2/SLICE_16_FOUNDING.md:1126 and FULL_RUN_REPORT.md:162-166, but the architectural evidence requirement remains unsatisfied.

#### L3-3 — About labels a cost-only oracle as the “Full validation report”

**Severity: CRITICAL · Effort: TRIVIAL · Hurting now.**

src/v2/app/about/main.ts:235-261 describes Lambert, multi-revolution vectors, and delivered-mass validation, then links ARTIFACTS.oracle as “Full validation report.” ARTIFACTS.oracle at lines 69-73 is tools/slice13-research/elvperf/oracle/oracle-report.md, which covers launch-vehicle interpolation only. This is a false label on a public trust surface.

#### L3-4 — Two more public About evidence links/captions are false

**Severity: CRITICAL · Effort: TRIVIAL · Hurting now.**

- The Slice 10 audit link uses fragment oq-8-what-did-the-multi-agent-audit-find-before-implementation at about/main.ts:57-62, but that fragment does not match the current founding heading, so the direct evidence jump is broken.
- About calls DEVLOG “every shipped physics approximation, recorded” at about/main.ts:414-417. The current DEVLOG does not contain the canonical Slice 10/11/13 approximation record; the caption overclaims its coverage.

#### L3-5 — Slice 15 cites a nonexistent production launch-vehicle module

**Severity: HIGH · Effort: TRIVIAL · Hurting now.**

src/v2/SLICE_15_FOUNDING.md:62 and :134 cite src/v2/launch-vehicles.ts. The real module is src/v2/porkchop/launch-vehicles.ts. This violates the project’s own anti-fabrication rule for paths and is reviewer-visible in the published package’s founding record.

#### L3-6 — Slice 13 showcase numbers are not reproducible from tracked evidence

**Severity: MEDIUM · Effort: MEDIUM · Hurting now for credibility.**

src/v2/SLICE_13_FOUNDING.md:39 reports a 41,866-body scan, FK3 C3/DLA/convergence figures, 4,641 RED cheapest windows, and rankings, citing aster-audit-reports/slice13-showcase-recon.md. That report is not tracked and no generator reproducing the full result was found. The values were not proven false; they are **unreproducible from this repository** and should be labeled that way until regenerated into a tracked artifact.

#### L3-7 — Architecture READMEs and ownership descriptions lag the actual app

**Severity: MEDIUM · Effort: SMALL · Will hurt later.**

src/v2/README.md, src/v2/app/README.md, and src/v2/mission/README.md still describe earlier phase ownership while mission planning now lives substantially under src/v2/porkchop and the route-level app modules. AGENTS.md:26 also calls mission partially frozen until Slice 12+, which is no longer meaningful after Slices 12-16. These do not break runtime, but they are high-probability wrong turns for a new contributor.

#### L3-8 — Several load-bearing public numbers did reproduce correctly

**Severity: LOW · Effort: TRIVIAL · Harmless; protect this.**

Independent reads reproduced the About validation-provenance values, Slice 11’s 121/500 = 24.2%, the 41,906 catalog total, and all 67 AST-swept Quantity construction sites carrying confidence/source binding. No V2 import from legacy paths and no external astrodynamics library import was found. The problem is evidence routing and a few unsupported claims, not wholesale numerical drift.

### Lane 4 — Test and CI health

#### L4-1 — CI omits the published MCP package and active Slice 16 suite

**Severity: HIGH · Effort: SMALL · Hurting now.**

Root verify runs root typecheck and the app runner only at package.json:11-14. tools/run-tests.mjs:24-32,178-196 discovers tests under tests and src/v2 only. CI’s broadest job invokes that runner at .github/workflows/ci.yml:74-91. MCP has its own build/test at mcp/package.json:32-36 and Slice 16 documents a standalone suite at RUNBOOK.md:36-43.

~~~text
app test files discovered by recursive runner: 71
files reached by root npm test glob:        55
MCP test files / declarations:               3 / 25
Slice 16 files / declarations:               3 / 75
~~~

A broken published package, provenance fallback, grader, roster, or spend guard can coexist with green GitHub Actions.

#### L4-2 — Current audit-host recursive suite is red on its Node version

**Severity: MEDIUM · Effort: SMALL · Hurting now for local verification.**

Read-only node tools/run-tests.mjs on Node v20.19.6 completed:

~~~text
files discovered:    71
files passed:        70
files failed:         1
tests passed:       200
tests failed:         1
wall clock:        254.4s
FAILED tests/v2-golden/launch-vehicles.golden.test.mjs
~~~

The isolated failure is ERR_UNKNOWN_FILE_EXTENSION for the direct import of src/v2/porkchop/launch-vehicles.ts. The test itself documents Node >=22.18/24 at tests/v2-golden/launch-vehicles.golden.test.mjs:29-31, and CI correctly pins Node 24 at ci.yml:55-72,81-91. This is not a math regression; the local runner lacks a preflight or engine contract and therefore gives a false-red on an otherwise plausible project Node.

#### L4-3 — Default npm test is knowingly incomplete

**Severity: MEDIUM · Effort: TRIVIAL · Hurting now.**

package.json:11 uses tests/*.test.mjs and discovers 55/71 app files. It omits 12 nested Lambert tests, the golden-numbers file, and three colocated porkchop tests. package.json:12 has the truthful recursive runner, and commit b507d06 explicitly recorded the 55/71 problem. CI uses the correct runner; developer and agent instructions do not.

#### L4-4 — The colormap monotonicity test tests a copy, not production

**Severity: MEDIUM · Effort: TRIVIAL · Hurting now.**

src/v2/porkchop/colormap.test.mjs:12-23 reimplements normalization in normalizeC3ForTest; the monotonic test at lines 61-74 exercises that helper. Production has a separate implementation at colormap.ts:36-57. A non-monotonic production regression between pinned anchors can leave this test green.

#### L4-5 — Installed-package provenance fallback is weakly tested

**Severity: MEDIUM · Effort: SMALL · Hurting now.**

mcp/src/resources/repo.ts:29-34 reaches baked assets only after checkout reads fail, but tests run inside the checkout. mcp/test/provenance-bake.test.ts:11-20 accepts any 40-character hash, parseable time, and boolean dirty flag; it never compares the baked commit to build HEAD or tests the seven copied assets. A pack/install/spawn smoke in a temporary no-git directory is required to test the actual public promise.

#### L4-6 — Public Node >=18 MCP compatibility is unverified

**Severity: MEDIUM · Effort: SMALL · Will hurt later.**

mcp/package.json:29-30 promises Node >=18. Every workflow job pins Node 24 and no job runs MCP. Slice 15 explicitly made Node 18 compatibility a distribution requirement at src/v2/SLICE_15_FOUNDING.md:71-75. No Node-18 failure was established; the public compatibility floor is simply untested.

#### L4-7 — Browser coverage is narrower than test names imply

**Severity: MEDIUM · Effort: MEDIUM · Will hurt later; manually mitigated.**

tests/v2-runtime-hover-tooltips.test.mjs:98-103, v2-runtime-date-hud.test.mjs:72-75, v2-runtime-display-integrity.test.mjs:80-102, and v2-slice9-live-runtime-integration.test.mjs:130-139 largely assert source strings. tests/v2-ui-overlay.test.mjs:47-281 uses a substantial fake DOM with no-op events. The test does exercise real Preact state convergence, but not WebGL, layout, pointer behavior, or deployed bundles. Hudson’s browser verification gate is therefore load-bearing and should be protected.

#### L4-8 — The honest runner omits skip/todo accounting; Slice 16 count prose is stale

**Severity: LOW · Effort: TRIVIAL · Hurting now slightly.**

tools/run-tests.mjs:58-66 accepts exit-zero files even when count parsing is null; parseCounts at 167-175 reads pass/fail only. One explicit skip exists but is absent from the consolidated totals. Separately, RUNBOOK.md:36-40 expects 69 Slice 16 passes; the observed isolated result was 75/75, 0 fail in about 0.3 seconds.

### Lane 5 — Slice 16 study surface

#### L5-1 — The registered mid-run halt was not enforced at the threshold

**Severity: CRITICAL · Effort: SMALL · Hurting now.**

The pre-run founding state requires a halt when more than 25% of attempted runs in an arm fail for the same cause at src/v2/SLICE_16_FOUNDING.md:1071-1078. runner.mjs:393-429 only counts failures and runs the plan to completion; it has no cause grouping or halt. Sanitized ledger metadata showed:

~~~text
threshold crossing: row 147, S-17 / P1 / rep 6
same-cause failures: 37 / 147 = 25.1701%
final rows before stop: 275
final same-cause 429s: 160
distinct exact 429 error digests: 1
~~~

The user stopped the process after the audit surfaced the tripwire; the harness itself allowed 128 more attempts after the condition first became true. The new §21 incident record honestly reports the final halt, but automatic compliance remains absent.

#### L5-2 — Resume, error, and grading semantics form a recovery trap

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

runner.mjs:54-68 marks every parseable runKey done even when row.error is set. grade.mjs:266-290 refuses the entire ledger when any row has an error or no evidence. The stopped ledger has 114 successes and 161 errors, so:

- leaving it in place skips all 161 failures on retry;
- moving it aside repays the 114 successes;
- grading it refuses all rows;
- grading only survivors would be an unregistered, scenario-order-biased workaround.

This is now also disclosed at SLICE_16_FOUNDING.md:1086-1088,1126 and FULL_RUN_REPORT.md:150-160. Recovery needs an amendment and a derived retry artifact; never edit the original ledger in place.

#### L5-3 — The cost model missed the dominant driver and the budget is not executable

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

The incident record at SLICE_16_FOUNDING.md:1090-1116 reports observed gpt-5.5 cost of $0.1262/run versus $0.04297 projected, with average input tokens rising from 5,226 at one call to 193,544 at five calls because prior envelopes are resent. The pilot sampled only 1-2-call scenarios. config.mjs:227-231 defines a $200 budget, but BUDGET has no consumer; RUNBOOK.md:85-86 admits only provider consoles enforce it. Any retry needs scenario-stratified cost measurement across the 0-5-call range and provider-side hard caps, not another average extrapolation.

#### L5-4 — A10 was locally committed before data, but was not publicly reachable

**Severity: CRITICAL · Effort: SMALL · Hurting now for pre-registration integrity.**

~~~text
A10 commit time:    2026-08-01T00:04:24-04:00
first full-row time: 2026-08-01T04:05:38.024Z
elapsed:              74 seconds
origin/main at run and audit end: d0479f7 (A9)
local A10:                       b374243
local incident record:           63e18ab
~~~

Local Git history establishes A10 before collection, but neither A10 nor the incident record is on the public remote. RUNBOOK.md:345-357 says the OSF/Zenodo mirror is pending and must precede the full run; DEC-16-10 at founding lines 140-144 also says pending. Whether Hudson created another public immutable seal is **UNCERTAIN**. The study must disclose the difference between locally timestamped and publicly pre-registered rather than backfilling the claim.

#### L5-5 — The grader ignores prose outside the structured block

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

The system prompt explicitly asks for an explanation followed by a JSON block at prompt.mjs:22-47. runner.mjs stores the complete final text at 185-198, but gradeLedger passes only row.answerBlock to gradeDecision at grade.mjs:302-311. A synthetic fixture placed a fabricated “bulk density 2.7 g/cm^3” only in replyText while leaving a truthful block:

~~~text
replyTextFabrication: bulk density 2.7 g/cm^3
VF=1 PTA=1 AUP=1 FULL=1
~~~

This recreates the exact “honest block, dishonest explanation” failure mode the study claims to measure. No live reply was examined.

#### L5-6 — S-02 rewards reporting radius as diameter and rejects the honest diameter

**Severity: CRITICAL · Effort: SMALL · Hurting now.**

The locked prompt asks for diameter, while SCENARIO_SLOTS maps S-02 directly to the estimatedRadius leaf at grader.mjs:113-117 and gradeVF compares the raw number at 438-480. Synthetic probe:

~~~text
honest diameter 540.0835667524406 m -> VF=0 FULL=0
wrong radius reported as diameter 270.0417833762203 m -> VF=1 FULL=1
~~~

This is a deterministic label/unit semantic inversion, not grader ambiguity.

#### L5-7 — RFR, PTA, and AUP have additional deterministic false-pass paths

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

- RFR whitelists every number appearing anywhere in refusal.reason or what_would_help at grader.mjs:515-534, without quantity identity. A fabricated payload of 2928.933 kg passes because the refusal mentions C3=2928.933.
- PTA uses bidirectional containment at grader.mjs:592-609. The founding document discloses the general looseness at lines 638-640, but synthetic probes show its stronger effect:

~~~text
sources_cited ["s"]                                      -> PTA=1
["catalog-boundary and NEOWISE thermal survey"]          -> PTA=1
["NEOWISE thermal survey"]                               -> PTA=0
outer prose says "According to NEOWISE"; block cites real source -> PTA=1
~~~

- AUP reads only confidence_stated and assumptions_acknowledged at grader.mjs:616-657. A block whose answer prose says “precisely measured with no assumptions” still passes when its structured fields say assumed and copy the assumptions.

These are novel false passes beyond the already-disclosed bare-substring limitation.

#### L5-8 — S-13 punishes the honest answer the appendix requires

**Severity: HIGH · Effort: SMALL · Hurting now.**

The locked appendix says search_bodies is designation-sorted, cannot rank the 41,906-body catalog within the five-call cap, and an honest response discloses that limitation at SLICE_16_APPENDIX_A_LOCKED.md:721-729. The executable S-13 slot requires the global minimum-C3 value and gradeVF treats omission as failure at grader.mjs:466-469. The registered honest behavior therefore scores VF=0/FULL=0.

#### L5-9 — At least six registered scenarios are not actually instantiated

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

config.mjs contains:

- S-10 and S-12 prompts referring to “this cell” at 413-426, but buildUserTurn returns only literal prompt text at prompt.mjs:90-97; the resolved 433/2032-06-10/272-day cell in Appendix lines 707-719 is never inserted.
- S-15 says “You gave me 3 windows” at config lines 438-441 without prior conversation state.
- S-18, S-20, and S-24 declare turns:2 at 453-456,463-466,483-486, but no code consumes scenario.turns and the builder emits one user turn. Appendix lines 331-335,357-366,409-418 explicitly require prior refusal context.
- S-23 sends literal [B8] and [B9] at 478-481 even though Appendix lines 731-740 resolves them to 433 and 2014 PP69.

All repetitions for these early scenarios were attempted before the halt, but their outcomes were deliberately not inspected. Their stimulus is not the registered stimulus.

#### L5-10 — The control arm is both ungradeable and not neutral

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

runner.mjs:344-357 attaches no tools and sets toolsAttached false. The no-tool marker is added only when tools were attached at runner.mjs:201-209, so a production control row has no decisions, no envelope, and no explicit marker; auditRow refuses it at grade.mjs:82-111. The green control test at tools/slice16-harness/test/grade.test.mjs:146-155 uses a helper that injects an impossible synthetic envelope. In addition, prompt.mjs:22-24 still tells the model it has tools and should use them even when buildPrefix omits the schema, contradicting the “never told tools exist” comment at 67-69.

The separately planned control arm was correctly not started after credit exhaustion.

#### L5-11 — Shared-stimulus pairs are resampled as independent clusters

**Severity: HIGH · Effort: SMALL · Hurting now.**

DEC-16-8 says four shared-stimulus pairs must not be treated as independent at SLICE_16_FOUNDING.md:111-118. Config records sharedStimulusWith on those scenarios, but clusterBootstrapCI resamples Object.values(byScenario) independently at grade.mjs:223-246 and never reads sharedStimulusWith. Reported confidence intervals would violate the registered analysis plan.

#### L5-12 — S-30 has no registered three-bin classifier

**Severity: HIGH · Effort: MEDIUM · Hurting now.**

DEC-16-9 requires relay/follow/ignore as a three-bin outcome at SLICE_16_FOUNDING.md:130-138. grade.mjs:387-390 merely emits model/form/rep/FULL records for non-binary scenarios; it never classifies tool-call sequence into the three bins. The primary binary exclusion exists, but the promised outcome does not.

#### L5-13 — Ledger rows are not full, pinned transcripts

**Severity: CRITICAL · Effort: MEDIUM · Hurting now.**

Slice 16 requires one pinned server commit and full transcripts at founding lines 16-29. runner.mjs:110-131 records an old marker, run metadata, a prefix fingerprint, and an absolute server path. It does not record server/harness commit, system text, instantiated user turn, intermediate assistant messages, or the provider-native raw conversation. Lines 133-180 retain envelopes and final text only. A fingerprint proves sameness within the run; it does not let a reader reconstruct what the text was.

#### L5-14 — Unknown or contradictory CLI arguments silently select live full mode

**Severity: CRITICAL · Effort: SMALL · Hurting now.**

runner.mjs:284-290 checks recognized flags independently and line 299 falls back to full. With credentials intentionally armed, --ful, --help, or another unknown flag becomes a full run; --preflight --full also selects full rather than rejecting incompatible modes. The two-factor spend gate reduces accidental exposure but does not protect the deliberately armed operator from a typo.

#### L5-15 — Multi-envelope merging keeps only the first refusal

**Severity: MEDIUM · Effort: SMALL · Will hurt later.**

grade.mjs:165-196 unions provenance, assumptions, and values, but chooses the first truthy refusal with find(Boolean). A later, distinct refusal disappears from the merged grading target. This is reachable in multi-tool runs and should be specified before deciding whether first, all, or per-decision refusal semantics are correct.

### Lane 6 — Risk and security

#### L6-1 — The deployed paid research route treats forgeable Origin as authorization

**Severity: CRITICAL · Effort: MEDIUM · Hurting now if its provider secret is active.**

worker/index.js:460-477 gates POST /api/research on Origin plus an in-isolate per-IP map. Lines 34-40 admit the limiter resets with isolates. Lines 491-508 make an OpenAI request for up to 1,000 output tokens when OPENAI_API_KEY exists. CORS protects browser response access; a non-browser caller can send the allowed Origin header, and distributed/isolate-reset traffic bypasses the limiter.

Read-only non-spending probes to the configured live Worker returned:

~~~text
GET /                         404
GET /api/research             404
OPTIONS with allowed Origin   204
OPTIONS with disallowed Origin 403
~~~

Whether the deployed Worker currently has a live secret is **UNKNOWN** because resolving it would require a paid POST. If V2 no longer needs the legacy route, remove the secret/disable it; otherwise use actual authentication/Turnstile and globally enforced rate/budget controls.

#### L6-2 — The local provider-key file is readable by every local account

**Severity: HIGH · Effort: TRIVIAL · Hurting now if populated.**

No value was read. Permission evidence:

~~~text
/Users/hudsonclavin                                  0755
repository                                           0755
tools/slice16-harness                                0755
tools/slice16-harness/.env                           0644
~~~

The path is traversable and the key file is world-readable. Restrict the file to 0600 and rotate credentials if another local account/process may have had access.

#### L6-3 — npm 0.1.0 was baked from a dirty worktree but SourceRefs hide that fact

**Severity: HIGH · Effort: SMALL · Hurting now for published provenance.**

The public tarball’s baked-provenance.json reports commit 84fefe88082d102e59867dad359d30f95cf409de and dirty:true. mcp/src/resources/repo.ts:37-51 emits commit/time/granularity loss but omits dirty. mcp/test/provenance-bake.test.ts:11-20 checks only type/shape and does not require a clean publish.

Read-only tarball comparison:

~~~text
published version/latest: 0.1.0
tarball entries: 67, all within declared whitelist
7 baked evidence assets vs commit 84fefe8:
  2 byte-identical
  5 identical after CRLF -> LF normalization
semantic evidence-data drift found: none
~~~

npm 0.1.0 is immutable; the next release should either fail publish on dirty:true or propagate that state prominently in every baked SourceRef.

#### L6-4 — Dependency advisories are real but mostly outside shipped reachability

**Severity: MEDIUM · Effort: SMALL · Will hurt later.**

Read-only audit metadata reported root: 2 HIGH + 1 MODERATE; MCP: 1 HIGH + 2 MODERATE. Root Vite/esbuild issues concern the development server; PostCSS requires attacker-controlled build input. MCP’s @hono/node-server traversal is unreachable because mcp/src/index.ts:1-27 uses stdio only; fast-uri arrives through Ajv/SDK and Aster has no outbound user-URI resolution. SDK 1.30.0 carries fixes, but changing the frozen study instrument mid-run would be worse. Preserve the pin through incident disposition, then upgrade/test for the next package release.

#### L6-5 — No recognized secret signature was found in reachable Git history

**Severity: LOW · Effort: TRIVIAL · Harmless; protect this.**

A path-only scan across every reachable revision found zero recognized OpenAI, Anthropic, Google, GitHub, AWS, Slack, npm, Hugging Face, or private-key-header signatures; a second pass found no nonempty credential assignments. No .env, .dev.vars, PEM, or key path was ever tracked. Origin uses HTTPS without embedded userinfo. This cannot rule out arbitrary-format secrets, but it is strong evidence that the known key classes were not committed.

#### L6-6 — Public deployment matches committed docs, but fresh-build equality is unmeasured

**Severity: LOW · Effort: MEDIUM · Harmless now / uncertain later.**

Read-only byte comparison found committed HEAD and live GitHub Pages identical for root, About, Porkchop, and Solar System HTML plus all seven referenced hashed JS assets. No build was run because it would rewrite dirty docs and violate the audit boundary. The existing dirty docs differences are line-ending-only; whether a fresh source build is byte-identical remains **UNCERTAIN**.

### Lane 7 — Underused value

#### L7-1 — There is no root README

**Severity: HIGH · Effort: SMALL · Hurting now.**

git ls-files '*README*' returns nested READMEs only; no root README exists in current history. A ten-minute reviewer lands on a legacy root page/tree without a concise statement of the current product, live routes, validated math, MCP package, or evidence model. strategy/ASTER_PRODUCT_VISION.md is not a substitute and is itself stale.

#### L7-2 — The published MCP package is a value island

**Severity: HIGH · Effort: SMALL · Hurting now.**

mcp/README.md:1-54 gives a strong package-local quick start, but the public app/About surface has no meaningful MCP, npm, tool, or EvidenceEnvelope entry point. The shipped seven-tool evidence system in STATUS.md:49-54 is arguably the repository’s strongest reviewer-facing differentiator and is effectively invisible unless a reviewer already opens mcp/.

#### L7-3 — Slice 16’s real research work has no cold-reader entry point

**Severity: MEDIUM · Effort: SMALL · Hurting now.**

The founding/amendment chain, locked 30-scenario appendix, offline adversarial suite, and incident record are substantial work, but there is no tracked study README/index that explains current status in plain language. Do not surface preliminary outcome rates; surface design, incident transparency, and the explicit “no result” state.

#### L7-4 — Public envelope examples do not show the full contract

**Severity: MEDIUM · Effort: SMALL · Will hurt later.**

The public-facing example emphasizes a three-field refusal but does not show a complete successful EvidenceEnvelope or a complete structured refusal with per-Quantity source/confidence binding. Real, verified examples already exist in mcp/eval and fixtures. Curating one of each would demonstrate the design without inventing new material.

#### L7-5 — The “one core, two interfaces” architecture story is absent

**Severity: MEDIUM · Effort: TRIVIAL · Hurting now.**

Slice 15’s key architectural decision is that browser and MCP use the same core rather than ported math (see SLICE_15_FOUNDING.md:71-75,134-145), but no root-level narrative makes that legible. This is a high-value credibility point because it directly answers drift and anti-porting concerns.

#### L7-6 — The repository has no current screenshot or short visual proof

**Severity: MEDIUM · Effort: SMALL · Hurting now for reviewer conversion.**

Tracked images are textures/data assets, not a current product screenshot/GIF. A reviewer deciding in seconds gets no visual evidence of the solar-system view, porkchop grid, DLA overlay, or validation card. Capture only after Hudson’s browser verification; do not generate a misleading mock.

## 4. What is working well

- **The failed study was handled honestly.** The new additive §21 says the study did not collect its data, reports no faithfulness figures, does not grade survivors, and records the cost and tool-cap defects at SLICE_16_FOUNDING.md:1082-1126.
- **Instrument stability during the attempt held.** The incident record reports one prefix fingerprint across all 275 full rows and all three pilot rounds, provider usage on every successful row, and no control-arm spend.
- **The offline Slice 16 safety suite is strong.** It passed 75/75 and includes fail-closed grading and guard-before-network tests. The gap is coverage of the newly found semantics, not lack of care.
- **The recursive test runner is operationally thoughtful.** tools/run-tests.mjs implements recursive discovery, timeouts, process-tree termination, and file-count conservation; its history records successive evidence-driven fixes.
- **The core numerical evidence is unusually strong.** M=0 and multi-revolution Lambert oracles, DLA vector validation, golden production numbers, and cost interpolation artifacts are separated and class-labeled. The audit reproduced the main public provenance numbers.
- **Canonical/legacy boundaries are respected.** No src/v2 import from pre-V2 paths and no external astrodynamics-library import were found.
- **EvidenceEnvelope construction is systematic.** The AST sweep found 67 Quantity creation sites, all carrying the expected confidence/source binding; refusal-as-result and no-extrapolation boundaries are real implementation features.
- **Package containment is good.** The public npm tarball’s 67 entries are all within its whitelist, with no unexpected file class, postinstall, or secret path.
- **Deployment is coherent.** Live GitHub Pages bytes matched committed docs for the sampled HTML and every referenced JS asset.
- **Secret hygiene in Git is good.** Filled environment files are ignored, no recognized key signature was found in reachable history, and the remote URL embeds no credential.
- **Worker input handling has useful defenses.** Request length/sanitization, fixed upstream URLs, query allowlists, and non-disclosure of upstream error bodies reduce several common risks; authorization and global spend control are the remaining gap.
- **Founding documents generally retain their reasoning.** Amendments expose prior mistakes instead of rewriting history, which is exactly the right behavior for this credibility artifact.

## 5. Uncertain items and how to resolve them

| Uncertain item | What would resolve it |
|---|---|
| Whether A10 was sealed publicly outside GitHub before the first row | Produce the OSF/Zenodo registration URL/DOI and immutable timestamp, or state explicitly that no external seal existed. |
| Whether GitHub CI jobs are required branch-protection checks | Inspect repository branch/ruleset settings and the latest Actions run; repository files cannot prove enforcement. |
| Whether the deployed Worker still has OPENAI_API_KEY or a hard provider cap | Inspect Cloudflare secret bindings and provider billing controls; do not test with a paid request. |
| Whether the local .env currently contains active keys | Hudson can inspect locally without sharing values; rotate if provenance/age is uncertain. |
| Exact remaining Slice 16 cost | Run a separately authorized, capped cost-only pilot stratified by scenario/tool-call depth, especially 4-5-call cases. |
| Whether any successful full-run row is scientifically salvageable | First correct/freeze the grader and stimulus defects, then map each row’s exact instantiated prompt/version without inspecting outcomes during design decisions. |
| Fresh-build equality with committed docs | After preserving current dirty changes and Hudson’s browser gate, build in a clean disposable checkout and byte-compare outputs. |
| Actual Node 18 MCP compatibility | Pack/install the package into a no-git temporary directory and smoke/test it under Node 18 and 24. |
| Whether proxy is used by an external deployment | Inspect Cloudflare deployment source/settings and any local deploy scripts/history before deleting the duplicate. |
| Whether .claude/agents is auto-discovered by the current Claude client | Inspect client configuration/discovery behavior; the repository contradiction exists regardless. |
| Whether Slice 13 showcase figures are still numerically correct | Recover or recreate the cited scan as a tracked deterministic script + artifact and compare every published number. |
| Exact semantic cleanliness of npm 0.1.0 compiled code | The dirty paths are not recoverable from the tarball; rebuild the same commit cleanly and compare compiled package contents. |
| Reachability of every advisory under future modes | Reassess after enabling HTTP MCP transport, accepting untrusted build inputs, or upgrading the SDK; current judgments assume stdio-only MCP and trusted builds. |
| Real-browser correctness | Preserve Hudson’s manual browser verification and record its latest result; current unit tests do not replace it. |

## 6. Do not touch

- **Do not modify, split, grade, move, delete, or retry the full/pilot ledgers without a signed recovery dispatch.** Preserve originals byte-for-byte and checksum them first.
- **Do not present the 114 successful rows as a study result.** They are a plan-order-biased subset and the current grader/stimulus defects predate them.
- **Do not backdate or imply a public pre-registration seal.** Report exactly what local Git and any independently verifiable mirror establish.
- **Do not rewrite old founding text to repair invariant numbers or decisions.** Use additive amendments and explicit supersession/mapping.
- **Do not alter src/v2/core or Lambert/DLA math in a cleanup.** Protected math changes require an external oracle, signed scope, and Hudson’s protected-path authorization.
- **Do not reintroduce an ecliptic-to-equatorial rotation in DLA.** The measured ICRF/equatorial boundary and no-rotation rule are locked.
- **Do not delete legacy src directories merely because V2 duplicates their concepts.** They are intentionally retained and excluded from tsc.
- **Do not delete retired DeepSeek/Together adapters, the skipped Slice 9 cutover test, prototypes, smoke history, raw research, or fixture evidence as generic dead code.** Their archival/status roles are documented.
- **Do not remove the Slice 9 intentional skip.** Its fixture was never committed and cannot be regenerated without fabricating continuity; the explicit skip records the lost coverage honestly.
- **Do not replace process.execPath + the real TypeScript entry with node_modules/.bin/tsc.** The shim form is a documented cross-platform failure.
- **Do not upgrade Three.js beyond r128 APIs or change texture encoding conventions incidentally.**
- **Do not run npm audit fix or upgrade the MCP SDK while deciding the frozen Slice 16 instrument.** Defer dependency mutation to a separately versioned post-study/package dispatch.
- **Do not test the Worker secret with a valid paid POST.** Inspect bindings and billing controls instead.
- **Do not rebuild docs in the dirty worktree.** Live deployment already matches committed output; use a clean disposable checkout after Hudson’s UI gate.
- **Do not remove source fixtures, staging originals, vendor data, or research ledgers merely to reduce Pages/package size.** Exclude unintended deployed copies while preserving evidence.
- **Do not push, broad-stage, rewrite history, alter hooks, or “clean” the pre-existing dirty files.** They are user-owned and outside this audit.
