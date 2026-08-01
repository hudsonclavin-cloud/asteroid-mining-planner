# Slice 15 Founding Document — aster-mcp: the Agent Interface to Aster

**Status:** LOCKED (Hudson, 2026-07-07). Every §5 entry is LOCKED; post-lock changes to a locked DEC are amendments (marked, not overwritten). Envelope schema changes are Opus-tier.
**COPY-VERSION:** S15-FOUNDING-LOCKED-2026-07-07-B  ← verify this marker via Select-String after copying to the repo (standing Slice 14 handoff rule).
**Author:** Hudson Clavin (drafted by Nova/Fable 5, 2026-07-06)
**Prior slice:** Slice 14 (packaging/showcase — methodology surface, validation card, FK3 guided narrative)
**Next slice (planned):** Slice 16 (agent-honesty study, run against this server)

---

## §1. Slice intent

Slice 15 ships an MCP server, in this repo, that exposes Aster's validated astrodynamics core to AI agents over stdio. Every tool result is wrapped in an **evidence envelope** — units, frame, provenance, confidence class, assumptions, validity envelope — and every refusal is a **structured first-class result** with a reason and a "what would resolve this" pointer. The server is Aster's honesty layer made machine-readable: the same discipline that puts a validation card next to the porkchop puts a `SourceRef[]` next to every number an agent consumes.

The reviewer-runnable story is `npx <package>` (name per DEC-15-7): a Fellows reviewer or mission engineer runs one command, connects an agent, asks for a transfer window, and watches the tool refuse to extrapolate beyond a sourced launch curve — with the refusal explaining itself. The refusal is the demo.

Slice 15 ends at **publish-ready**: build green, Inspector STOP gate passed, 10-pair eval gate passed with repo-verified answers. `npm publish` itself is Hudson's manual act and is out of every dispatch.

Slice 15 does NOT: run the agent-honesty study (Slice 16); add remote transport (Slice 17, gated on its own OQ); build any Lens UI; add or modify any math; touch the catalog or the screening cache; modify any audited solver file (see DEC-15-6 tripwire).

---

## §2. Inherited invariants

- **INV-001 through INV-021** (orbital mechanics, frames, propagation, Slice 10–12 contracts) remain operative and untouched — this slice adds no math.
- **INV-016 family (honesty layer):** extended, not merely preserved. The envelope is INV-016's semantics ported from pixels to schema. Every disclosure the UI makes (patched-conic assumptions, ΔV stack model, oracle classes) must have a corresponding envelope field or assumption string — an agent must never receive a number with *less* disclosure than a human viewing the site.
- **INV-022 (no numbers beyond a published or validated curve):** operative verbatim. `estimate_mission_cost` and `explain_cell` refuse out-of-curve C3 with `out_of_envelope`, exactly as the UI does since the copy pass.
- **INV-024 (anti-porting), locked wording verbatim [per Slice 14 handoff, VERIFIED]:** "Aster's physics and orbital-mechanics layer is re-derived in-repo. External astrodynamics libraries (poliastro, adam_core, or successors) serve as validation oracles only — their code is never imported, ported, or transcribed into Aster's math layer." Inherited by number; no restating needed. Note the narrowed scope is load-bearing for THIS slice: the ban covers *astrodynamics* libraries specifically, so infrastructure dependencies (@modelcontextprotocol/sdk, Zod) are clean by construction. The server *exposes* Aster's math; it never wraps poliastro or anyone else's.
- **NUMBERING CONFIRMED [Slice 14 handoff B2, VERIFIED 2026-07-06 via Select-String]:** INVARIANTS.md index ceiling = 026 (index synced b651519). §3's INV-027..032 numbering is safe. INV-025 (public-copy taxonomy) and INV-026 (trust-surface provenance) also inherit — INV-026 especially: any future public surface rendering this server's outputs renders from committed provenance artifacts, never component literals.

---

## §3. Architectural invariants new in this slice (provisional numbers, verify per §2 note)

- **INV-027 — No math in the mcp/ layer.** Adapters only. If an adapter needs more than unit formatting and envelope assembly, the function belongs in `src/v2/core/` and receives math-layer treatment (multi-agent audit before deploy). Rationale: the server's credibility IS the audited core; a second math surface would fork the trust chain.
- **INV-028 — Evidence envelope on every tool result; refusal is a result.** No bare numbers, no thrown exceptions for domain limits, no silent interpolation. Rationale: this is the product.
- **INV-029 — Tool budget: hard cap 8.** A ninth tool is a founding-doc amendment, never a dispatch. Rationale: scope-creep tripwire; small tool sets are also better agent ergonomics.
- **INV-030 — The browser app builds green after every extraction commit.** Both `tsc` targets (site + server) run in every extraction dispatch's verify step. Rationale: site and server share the core; drift is the failure mode.
- **INV-031 — Eval gate before publish.** The 10-pair eval passing, with answers verified against the repo (never model memory), is a precondition for `npm publish` — same standing as the multi-agent audit before a math deploy.
- **INV-032 — No non-finite numbers cross the wire.** Any NaN/Infinity reaching an envelope's value path is a bug-class refusal or error, never serialized. Rationale: `JSON.stringify` silently converts NaN/Infinity to `null` — a silent honesty failure. Guarded at the envelope constructor.
- **INV-033 — Anti-fabrication (inherited from the Slice 14 incident, made architectural here).** No SourceRef path, commit, count, or URL enters any envelope, fixture, or provenance artifact unless confirmed to exist and match — truthful source or STOP. Every provenance row is verified by a different check than the one that wrote it; every agent-claimed commit/push/deploy is verified in the canonical repo before it is believed. Rationale: during Slice 14 an execution agent fabricated a provenance row (invented path+commit+URL) and reported sandbox-only commits as real. A server whose entire product is emitted provenance is maximally exposed to exactly that failure; this invariant is the reason the eval's answer-verification transcripts are committed artifacts.

---

## §4. Open Questions (OQs)

**OQ-15-1: Is `src/v2/core/` import-graph pure for Node?**
**Status: CLOSED → PURE (2026-07-07).** Dispatch 0: zero offenders across all 29 core files and the 6-file Lambert transitive graph (no HARD, no SOFT, no DOM types in signatures). Dispatch 0.5 supplied the dynamic proof Dispatch 0 couldn't run: `lambertMultiRev` compiled and executed under **Node 24.18.0**, reproducing all pinned cells within 1e-9 and returning `null` for the infeasible case (commit d726f3d, solverCommit de5c4ee). Both PURE conditions met — static-clean graph + dynamic execution proof. Scope note: the dynamic proof covers the Lambert math entry; porkchop/DLA/cost paths are static-clean (zero offenders) and get dynamic confirmation as their adapters land in Phase D — a runtime browser-global the static scan missed there would be a Phase D finding, not a re-litigation of this verdict.

**OQ-15-2: Final tool set within the cap of 8.**
**Status: OPEN — Hudson's call at lock.** DEC-15-5 proposes 7 named tools + 1 deliberately empty slot. Parked candidates for the slot, now including the OQ-14-6 triage's interpretability shortlist (council NOT-CONSIDERED-2: interpretability, not more physics, is the next real capability — which this server IS): `compare_bodies` (= P-4 target-compare, 3–5 asteroids), `sensitivity` (= C-ADD-2/C-NC-5 "what flips the answer" — perturb one assumption, report which verdicts change), `propagate_state`, `list_vehicles`-as-tool. Note P-2 "explain this cell" is already tool #4 and the what-breaks-first/bad-assumptions items (P-1, P-5) are site-surface renderings of `sensitivity`, not separate tools. All stay parked unless Hudson pulls one in at lock.

**OQ-15-3: Envelope schema finalization.**
**Status: RESOLVED (Fable review, 2026-07-07; formalizes at lock).** Quantity-leaf structure ratified; refusal enum ratified as complete given commitment (g) (infeasibility-as-value removes the pressure for a fourth code). Three review additions under the truth criterion: mixed-provenance rule (f), infeasibility convention (g), `as_of` (h). One proposal REJECTED at review: structuring `validity_envelope` — enforcement lives in the refusal boundary, so consumer-parsable bounds are gold-plating for v1 (string retained; revisit only if a consumer ever needs to reason about bounds without calling the tool). Post-lock schema changes remain Opus-tier amendments.

**OQ-15-4: Eval ground-truth pin set.**
**Status: OPEN — closes in Phase F.** Candidate anchors, per the Slice 14 handoff's verified honesty-surface table (**class labels are mandatory on every cited figure — M=0 vs multi-rev-magnitude vs vectors; STRICT vs OBSERVED — conflation was a caught near-miss in Slice 14**):
- Lambert vs poliastro, M=0: max rel 3.43e-14 — `tools/slice11-research/data/poliastro-validation.json` @ 3d5f1cd.
- Lambert vs poliastro, M=1/2, **magnitude only**: 3.60e-12 — `multi-rev-poliastro-validation.json` @ 3560ff8.
- DLA vector oracle, M=1 both branches, 25×25: 5.74e-13° angle / 5.61e-13° DLA diff (bar 1e-6°) — `dla-oracle-m1-vectors.json` @ 830a4d9.
- Cost oracle: STRICT 1.18%/0.55% (screened segments) and OBSERVED 3.11%/2.10% (all points; max = New Glenn @ C3=25) — `tools/slice13-research/elvperf/oracle/oracle-report.md` @ 808e709.
- Vehicle data: NASA LSP elvperf as-of 2024-02-29 — `src/v2/launch-vehicles.ts` @ bcf1738.
- Catalog count 41,906 via `SLICE9_NEA_CATALOG_TOTAL_BODIES` (`src/v2/boundary/slice9-nea-catalog.ts`) @ 41b560b.
- FK3 delivered-mass headline + RED at DCA +82.4°; Apophis comparison; New Glenn C3=7.7 → 5,448 kg (live-verified 2026-07-04).
Requirement: **≥3 of the 10 pairs must be refusal-path questions** (correct answer = the structured refusal), because relaying refusals is the product — and these pairs double as Slice 16 pilot scenarios.

**OQ-15-5: npm package name.**
**Status: OPEN — Hudson's call.** VERIFIED 2026-07-05: `aster-mcp` is taken (unrelated Android MCP server, v0.1.14). Free at check: `asteroid-mcp`, `aster-mission-mcp`, `aster-planner-mcp`; a scoped `@<npm-username>/aster-mcp` is available once the scope is confirmed. Re-verify availability immediately before publish. Internal directory stays `mcp/` regardless.
OQ-15-5 → CLOSED (published): aster-mission-mcp@0.1.0 live on npm, publisher hudsoclavin, tarball shasum c912f2b, handshake-verified 2026-07-10 (initialize → serverInfo name/version match, protocolVersion 2025-11-25). Registry-check gate — the last open sub-gate — satisfied. Slice 15 build+publish complete.

**OQ-15-6: Node version floor and npx cold-start UX.**
**Status: RESOLVED (Query A, 2026-07-07).** SDK floor at v1.29.0 = **Node >=18** (`engines.node`). Package floor set to match: **Node >=18**. **Forced deduction (research left build-guidance UNVERIFIABLE, but Q4+Q5 combine to force it): ship COMPILED JS, not TypeScript.** Node 18 has no stable type-stripping (that is Node 22.6+/24 only) — a Node-18 consumer literally cannot run shipped `.ts`, so `tsc`→JS for publish is mandatory regardless of the SDK's silence on the matter. The dev box's Node 24 type-stripping is a dev convenience, never a distribution assumption. Note: v2-beta raises the SDK floor to Node >=20 — when the v2 migration slice happens, bump the package floor with it. Remaining Phase-G sub-item: `npm pack` size + no-postinstall check (unchanged).

**OQ-15-7: Browser↔server core-sharing mechanism.**
**Status: OPEN — closes in Phase B.** PURE branch default: server imports `src/v2/core/*` via tsconfig paths; the drift guard is INV-030's dual-build verify step plus the existing CI (A1 tsc + A2 golden-numbers) extended with the server build. If CI extension is deferred, the dispatch-level dual build stands alone.

**OQ-15-8: What does `porkchop_scan` cost on Node, and what is the bounded-grid default?**
**Status: SCOPING — Measurement M-2 after OQ-15-1 closes.** Browser baseline is now provenance-verified: Measurement 1 (`tools/slice11-research/data/lambert-grid-timing.json`, commit d4dc4ef) — **98.5 ms median per body, 200×100 grid, M=0, Web Worker; min 94 / max 117 ms**. Known caveat from Slice 11 records: M=1 both-branches measured ~255 ms at the same grid — per-M scaling is NOT linear; do not extrapolate. M-2 measures Node directly and sizes the default grid + a `max_cells` input bound.

---

## §5. DECs (ALL PROPOSED — Hudson converts at lock)

**DEC-15-1 (LOCKED 2026-07-07 — label corrected in amendment A1): Same repo, `mcp/` workspace. No new repository.**
The server lives at `mcp/` inside `asteroid-mining-planner`, sharing `src/v2/core/` by direct import. Justification: (a) provenance — envelope `SourceRef`s and eval ground truth cite commits; one history keeps every citation resolvable; (b) INV-030 is only enforceable when both builds live in one tree; (c) the reviewer story is stronger — one repo shows site + server + evals as one system; (d) solo-dev sync cost of a split repo is pure loss. Reversibility: extracting `mcp/` to its own repo later is cheap; merging histories back is not — same-repo is the reversible choice. **The first genuinely new repo in the portfolio appears only if/when a Lens ships as its own product (post-envelope, per the complements skill).**

**DEC-15-2 (LOCKED 2026-07-07 — Query A): Stack pin.**
TypeScript; **`@modelcontextprotocol/sdk` pinned at 1.29.0** (current stable; `registerTool` + the four annotations confirmed stable API, no breaking change since mid-2025); **MCP spec 2025-11-25** pinned; Zod input schemas; **`structuredContent` + `outputSchema` confirmed STABLE in the 2025-11-25 schema — the envelope rides in `structuredContent`, contingency below NOT triggered**; published artifact is compiled JS (see OQ-15-6). **v2 decision [Query-A-informed]:** the SDK `main` branch is an unreleased v2-beta targeting the 2026-07-28 spec, expected stable ~2026-07-28. Do NOT pin against `main`/v2-alpha (explicit research warning). Rationale for v1: "expected stable" is a target, not a commitment — betas slip; a credibility artifact ships on stable, not on someone else's schedule. The envelope schema (DEC-15-4) is transport-agnostic — it rides in `structuredContent` regardless of SDK major, so a future v1→v2 migration is a transport swap handled by side-file/atomic-swap, not an envelope redesign. v2 migration is a tracked future slice, not a Slice 15 blocker. Contingency (now dormant, retained for the record): had `structuredContent`/`outputSchema` been unstable, envelope JSON would ride in `content[0].text` as canonical with structured output as progressive enhancement — the envelope shape never changes either way.

**Inspector [Query A CONFIRMED]:** Phase E uses `npx @modelcontextprotocol/inspector`; no Windows-specific stdio-testing caveat exists (the only Windows note concerns developing the Inspector itself, not testing servers with it).

**DEC-15-3 (LOCKED 2026-07-07 — label corrected in amendment A1): stdio-only for v1.**
Zero hosting surface, zero auth surface, reviewer-runnable offline. Remote transport (streamable HTTP, stateless JSON, Cloudflare) is Slice 17 behind its own OQ (Workers CPU-ms vs the M-2 measurement — measured on-platform, never assumed).

**DEC-15-4 (LOCKED 2026-07-07 — schema finalized under the truth criterion; Opus-tier to amend): Evidence envelope v1.**

```ts
type Confidence = "measured" | "derived" | "assumed";
// Aggregation order: assumed < derived < measured. Envelope-level confidence = MIN across cited sources.

type SourceRef =
  | { id?: string; kind: "repo"; path: string; commit: string; confidence: Confidence; note?: string }
  | { id?: string; kind: "external"; name: string; url?: string; retrieved: string; confidence: Confidence; note?: string }
  | { id?: string; kind: "computation"; method: string; code: { path: string; commit: string }; confidence: "derived"; note?: string };

interface Quantity {
  value: number;              // finite always — INV-032 guarded at the quantity() factory
  units: string;              // explicit, always
  frame?: string;             // required for any vector component or angle
  confidence?: Confidence;    // leaf-level class — mixed-provenance rule (f)
  sourceIds?: string[];       // refs into provenance[].id — mixed-provenance rule (f)
}

interface EvidenceEnvelope<T> {
  envelope_version: "1";
  tool: string;
  as_of?: string;             // ISO8601 — the DATA's effective date (catalog snapshot, elvperf as-of),
                              // distinct from provenance[].retrieved
  value: T | null;            // null iff refusal present. Numeric leaves inside T are Quantity, never bare number.
  confidence: Confidence;     // MIN across provenance — the summary; leaves carry the distinctions
  provenance: SourceRef[];    // non-empty when value non-null; entries carry id when leaves reference them
  assumptions: string[];
  validity_envelope: string;  // human-readable string in v1, deliberately — enforcement lives in the
                              // refusal boundary, not in consumer parsing (see §8 rationale)
  coverage?: { returned: number; total: number; selection_rule: string };
  refusal?: {
    code: "insufficient_data" | "out_of_envelope" | "not_found";
    reason: string;
    what_would_help: string;
  };
}
```

Design commitments: (a) **Quantity leaves, not a top-level units string** — composites declare units/frame per leaf. (b) **Weakest-link top-level confidence** as the conservative summary. (c) **Refusal enum of exactly three**; `not_found` distinct because the agent's remedy differs. (d) **Input-validation failures are MCP errors, never refusals** (DEC-15-8). (e) **INV-032 finite guard at the `quantity()` factory** — the single choke point; a bare number in a result type is a review-catchable smell. (f) **Mixed-provenance rule [added at review]:** leaf `confidence` + `sourceIds` are REQUIRED on every Quantity whenever the envelope cites more than one source OR sources of differing confidence; single-source, uniform-confidence results may omit them. Rationale: a top-level min alone says a weakest link exists but not *which number it is* — omission is truthful only when there is no distinction to lose. This leaf→source binding is also what makes Slice 16 RQ2 (provenance survival) measurable per-number on composites. (g) **Infeasibility is a value, not a refusal [added at review]:** a confidently-known negative ("no M=2 transfer exists at this TOF"; "DLA outside the site band") returns *inside* T (e.g. `{feasible: false, reason}`) with normal confidence and provenance. Refusal codes are reserved for epistemic limits — *can't* answer — never for negative answers — *can* answer: no. The adapter maps solver `null` → `feasible:false` (translation, not computation; INV-027-clean), and the committed fixture's `apophis-M2-infeasible` cell is the pinned reference for this mapping. All three feasibility-touching tools (`porkchop_scan`, `explain_cell`, `dla_feasibility`) use this convention identically. (h) **`as_of` carries data age [added at review]:** static data is not timeless, it is dated — the vehicle curves are literally "as-of 2024-02-29" in `src/v2/launch-vehicles.ts`, and the catalog is a dated snapshot. Omitting the date hides age rather than avoiding speculation; the field has real values to carry on day one.

**DEC-15-5 (LOCKED 2026-07-07 — slot ruled EMPTY): Tool set v1 — 7 named + 1 reserved-EMPTY; static reference data ships as MCP *resources*, not tools.**
**Slot ruling:** the 8th slot stays EMPTY for v1. Truth criterion doesn't demand a new tool — it demands the seven existing ones carry honest envelopes; `sensitivity` and `compare_bodies` remain the strongest parked candidates (first claim on Slice 15.5/Wave-1), and filling the slot now would spend the anti-scope-creep margin the cap exists to hold.
1. `search_bodies` — catalog query (designation/name/orbit-class/screening-color filters), paginated. Provenance: repo catalog.
2. `get_body` — one body's full record incl. screening color, data-quality flags, measured-vs-assumed physical parameters.
3. `porkchop_scan` — bounded grid (defaults + `max_cells` per OQ-15-8), returns summary + best-N cells with `coverage`. Never full grids: token budgets are real.
4. `explain_cell` — the derivation trail for one (departure, TOF) cell: dates, Lambert branch, C3, v∞, DLA, site verdict, vehicle payload at that C3, ΔV stack, delivered mass — each leaf a Quantity with its own provenance. Pre-validated as the highest-credibility feature by the Slice 14 council/Perplexity work; the honesty study's richest surface.
5. `dla_feasibility` — DLA + launch-site band verdict for a cell/body/site.
6. `estimate_mission_cost` — Slice 13 model over a chosen cell + vehicle; refuses out-of-curve C3 (`out_of_envelope`, INV-022 live).
7. `get_validation_report` — the poliastro validation summaries as envelopes; the credibility tool, and a stable eval anchor.
8. *(reserved — empty by design; anti-scope-creep + Hudson's slot.)*
Resources (not tools): vehicle configs + curve domains, launch-site DLA bands, catalog field schema, ΔV stack model description. Rationale: MCP resources exist for static reference data; spending tool slots on lookups wastes both the budget and agent attention. All v1 tools annotate `readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false` (closed-world catalog).

**DEC-15-6 (LOCKED 2026-07-07 — label corrected in amendment A1): Extraction strategy.**
**Verdict: PURE** (OQ-15-1 closed via Dispatch 0 + 0.5). `mcp/` imports `src/v2/core/*` via tsconfig paths — no extraction, no shims, no fixture-mode. The three branches below are retained for the record; only PURE is live. Path correction folded from the 0.5 run: the Earth ephemeris is `src/v2/data/horizons-inner-solar-system-2026-2040.json` (NOT under `tests/fixtures/`) — any Phase B/D dispatch touching ephemeris uses this path.
- **PURE →** no extraction at all: `mcp/` imports `src/v2/core/*` via tsconfig paths. Cheapest, likeliest.
- **SHIMMABLE →** side-file + atomic-swap seams for each listed offender (e.g., `performance.now` → injected clock), browser build green every commit (INV-030). **Tripwire: if shimming requires touching >5 core files or ANY audited solver file, treat as COUPLED** — solver edits trigger re-audit, and re-audit for a transport project is the wrong trade.
- **COUPLED →** v1 ships **fixture mode**: tools serve from committed, pinned artifacts (Slice 13 showcase numbers, validation JSONs) with honest `kind:"repo"` provenance; `porkchop_scan` drops from the v1 tool set (slot stays empty) and live compute becomes Slice 15.5. Honest and shippable beats coupled and stalled.

**DEC-15-7 (LOCKED 2026-07-07 — FULFILLED same day): Package name policy.**
Name chosen by Hudson from the verified-free set (`asteroid-mcp`, `aster-mission-mcp`, `aster-planner-mcp`, or scoped). Availability re-verified immediately before publish via Node fetch (PowerShell curl is aliased). `package.json` carries `"private": true` until the publish decision; repo directory is `mcp/` regardless of the public name.

FULFILLED (2026-07-07, Hudson's choice per this DEC's own delegation): public name = aster-mission-mcp. Re-verified free (registry 404) same day. Open sub-item: confirm npm account/username before Phase G. Publish-time re-verification stands.

**DEC-15-8 (LOCKED 2026-07-07 — label corrected in amendment A1): Error/refusal boundary.**
Transport failures and schema-invalid input → MCP errors with actionable messages. Domain limits → envelope refusals. A tool implementation may never convert one into the other; the eval includes at least one pair verifying the boundary.

---

## §6. Phase breakdown

- **Phase A — Pre-research close (2 dispatches + 3 queries).** Dispatch 0 purity probe (STOP: verdict + offender list reviewed → closes OQ-15-1). M-2 Node timing (closes OQ-15-8). Queries A/B/C triaged; LOAD-BEARING NUMBERS verified. *Gate: founding doc locks here.*
- **Phase B — Workspace + envelope core (2–3 dispatches).** `mcp/` scaffold (package.json private, tsconfig, dual-build wiring per OQ-15-7); envelope module (types, constructor with INV-032 guard, SourceRef helpers) + unit tests incl. NaN-rejection and weakest-link aggregation. STOP: both builds green. **Inherited Slice 14 rules apply to B–D throughout:** any phase touching shippable `src/v2/` code ends with docs/ rebuild+commit (Pages serves committed docs/; a green Actions run is not deploy confirmation); every chat-produced file an agent must read carries a version-marked filename + COPY-VERSION marker, content-verified by Select-String in dispatch Step 1; test files use `process.execPath` + full tsc path, never the `.bin` shim (the 59-file shim violation is a known open defect — do not add file #60).
- **Phase C — Catalog tools (2 dispatches).** `search_bodies`, `get_body`, resources. STOP: Inspector spot-check on schemas.
- **Phase D — Compute tools (2–3 dispatches).** `porkchop_scan` (bounded, coverage), `explain_cell`, `dla_feasibility`, `estimate_mission_cost`, `get_validation_report`. Refusal paths implemented alongside happy paths, never after.
- **Phase E — Inspector STOP gate (1 session, Hudson drives).** Lettered checklist per tool: schema renders / happy path / refusal path / malformed input. Findings → fix dispatches before F.
- **Phase F — Eval (2 dispatches).** F1 builds the 10 QA pairs (answers verified against the repo — the verification transcript is a committed artifact; closes OQ-15-4). F2 runs them read-only against the built server, output to /tmp, pass/fail per pair with transcript paths. *Gate: INV-031.*
- **Phase G — Publish-prep (1 dispatch).** README (links the Slice 14 methodology surface; novelty claim worded per Query B), `npm pack` dry-run (size, files whitelist, no postinstall), LICENSE. **Publish is Hudson's manual act. No dispatch publishes.**

Estimated 11–13 dispatches. STOP-gate carve-outs from tripwire mode: Inspector session (Phase E) and every honesty-surface number check — same two exceptions as always.

## §7. Out of scope

Slice 16 execution (design doc ships separately, in parallel). Remote transport/Cloudflare (Slice 17). Any Lens UI. Any new or modified math. Catalog/cache changes. CI redesign beyond adding the server build to the existing A1/A2 workflow. `npm publish` from any dispatch. A ninth tool.

## §8. Engineering record (running log)

- 2026-07-05 — npm collision found and verified: `aster-mcp` taken (Android MCP server, v0.1.14, modified 2026-02-06); three alternatives verified free. Prior design's `npx aster-mcp` assumption corrected → DEC-15-7.
- 2026-07-06 — 98.5 ms/body provenance CLOSED against `lambert-grid-timing.json` (commit d4dc4ef per Slice 11 §4): median 98.5 / min 94 / max 117 ms, 200×100 grid, M=0, browser Web Worker. Caveat carried: Slice 11 records show M=1 both-branches ≈ 255 ms at the same grid — per-M scaling nonlinear; Node timing still open (OQ-15-8 / M-2).
- 2026-07-06 — Poliastro M=0 numbers re-verified from `poliastro-validation.json`: max rel 3.43e-14, three bodies, 50×50, zero cells > 0.1%. M≥1 figure (3.6e-12) carried from Slice 11 records pending artifact re-check.
- 2026-07-06 — Drafting-time contradiction logged: the operating-instructions block circulating in chat (dated 2026-07-05 state) lists Slice 14 founding doc as NEXT, while later session records show Slice 14 Phases A–B shipped with INV-024/025/026 claimed. §2's numbering-verification note exists because of this fork; resolve against `INVARIANTS.md` at lock.
- 2026-07-06 — Doc drafted BEFORE Queries A–C returned, under DRAFT/PROPOSED discipline. Standing rule: query findings override draft text; contradictions are logged here, not silently absorbed. Anchoring risk named at draft time.
- 2026-07-07 — Slice 14 handoff folded. B3 correction applied: §2 now carries INV-024's locked verbatim (the draft had quoted superseded pre-lock wording). Non-obvious consequence surfaced: INV-024's narrowing to *astrodynamics* libraries is what makes this slice's infrastructure dependencies (MCP SDK, Zod) unambiguously legal — the correction was load-bearing, not cosmetic. B2: INV-027..032 numbering confirmed safe (ceiling 026 @ b651519). INV-033 (anti-fabrication) added, elevating the Slice 14 incident's tripwire to architectural status for provenance-emitting code. OQ-15-4 anchors replaced with the handoff's verified table (artifacts + commits + mandatory class labels). OQ-15-2 slot candidates extended with the OQ-14-6 interpretability shortlist. Slice 14 confirmed CLOSED 2026-07-07 (founding doc 8fcddb6; origin/main b7532eb) — the Wave-0 sequencing gate ahead of this slice is cleared.
- 2026-07-07 — Dispatch 0.5 landed (commit d726f3d, Node 24.18.0, solverCommit de5c4ee). OQ-15-1 CLOSED → PURE; DEC-15-6 RESOLVED → PURE branch (direct core import, no shims). Smoke PASS on all cells within 1e-9; null case returns null. **Oracle upgrade succeeded** — poliastro 0.17.0 via the live venv; M0/M1/M2 cells are `oracle-anchored` (per-cell poliastro cross-check committed), the infeasible cell `aster-self-consistent` (correct — no oracle "no-solution" analogue). Best-case provenance outcome: shipped self-consistency-first as the safe default AND the oracle upgrade landed, so the fixture carries external validation where feasible — a verified OQ-15-4 eval anchor and Slice 16 ground-truth seed in one artifact. Ephemeris path correction recorded (src/v2/data/, not tests/fixtures/). **Lock status: all mechanical blockers closed. Only DEC-15-4 (envelope schema) + DEC-15-5 (tool set/slot) remain — both Fable-tier judgment, the lock session.**
- 2026-07-07 — Lock session (Fable). DEC-15-4 finalized under Hudson's stated criterion ("most truthful"): (f) mixed-provenance rule added — leaf confidence+sourceIds required exactly when omission would lose a distinction (>1 source or mixed classes); (g) infeasibility-as-value convention — refusals are epistemic limits, never negative answers; fixture's infeasible cell pinned as the adapter-mapping reference; (h) `as_of` added — flipped from deferrable to day-one after finding a concrete present-tense value to carry (elvperf as-of 2024-02-29, catalog snapshot date). REJECTED at same review: structured validity_envelope (gold-plating; enforcement lives in the refusal boundary). OQ-15-3 RESOLVED. DEC-15-5 slot ruled EMPTY (anti-scope-creep margin held; sensitivity/compare_bodies first-claim on 15.5). **Every §5 entry LOCKED — doc marker S15-FOUNDING-LOCKED-2026-07-07-B.**
- 2026-07-07 — AMENDMENT A1 (post-lock, tracked — not a silent edit). (1) Label-lag corrected: DEC-15-1/3/6/8 carried pre-lock labels under a LOCKED header; the header governs, labels now match. No DEC content changed. (2) DEC-15-7 FULFILLED: name = aster-mission-mcp (Hudson, re-verified free same day). (3) Marker → -B
- 2026-07-10 — Phase D2 landed (commit 142f8cc): `dla_feasibility`, `estimate_mission_cost`, and `get_validation_report` completed the seven-tool v1 surface. The commit also kept convention-(g) site verdicts as values, shared the INV-022 launch-vehicle curve boundary, and preserved class labels in validation output.
- 2026-07-10 — Phase E Inspector repair record: the Inspector pass surfaced the E3-a schema-rendering issue in `porkchop_scan`; E3FIX commit 41abd8a moved cross-field checks from `superRefine` into handler code so the input schema renders as a plain object. No committed Inspector transcript carrying the 39/40→40/40 counts was found in-repo, so this record cites the repair commit only.
- 2026-07-10 — Phase F1 landed (commit 5d4f896): the 10-pair eval set and verification transcript were committed at `mcp/eval/slice15-eval-pairs.json` and `mcp/eval/slice15-eval-verification.md`. P9 is intentionally pinned to the selected Cape Canaveral site row (`feasible:false`, `verdict:"RED"`, `marginDeg.value:-17.868682593370664`) while the top-level value remains refusal-free; the file carries Hudson's override note for that row-vs-top-level distinction.
- 2026-07-10 — Phase F2 landed (commit c8a139a): the eval runner and committed report landed at `mcp/eval/run-eval.ts`, `mcp/eval/slice15-eval-report.json`, and `mcp/eval/slice15-eval-summary.md`. The committed report says `totalPairs: 10`, `passed: 10`, `failed: 0`, generated 2026-07-10T04:03:40.164Z from origin 5d4f8966ef504f5e1f0ccbc2fc5d4adc4097d183. The transient P10 41906→41907 negative-control run was not found as a committed artifact, so no founding-doc claim is made for it under INV-033.
- 2026-07-10 — G0 pre-publish audit completed as read-only input (no commit), report path `C:\Users\hudso\aster-audit-reports\S15_PREPUBLISH_AUDIT_2026-07-10.md`. Findings verified from the report: 3 HIGH, 6 MED, 4 LOW. HIGHs: H-1 no `bin` field, so `npx` could not launch; H-2 runtime `git` dependency in provenance paths would fail outside a checkout; H-3 root `package.json` was not `private`, so accidental root publish could ship the repo.
- 2026-07-10 — Phase G1 publish-prep landed as the local/pushed stack through 84fefe8. Commits: 2a1357f root `private:true` (H-3); 7b9eda3 package identity `aster-mission-mcp`, `bin`, files whitelist, MIT license copy (H-1, M-1, M-3, M-4); 2b0c751 build-time baked provenance fallback (H-2); cb62ab9 DEC-15-8 conformance for `estimate_mission_cost` unknown well-formed identifiers; 2cf7526 README rewritten from committed evidence (M-2, NOTE-1); 202bae9 `get_body` not_found metadata disclosure (M-5); 50b9ad9 suppressed expected git-probe stderr during baked fallback; 84fefe8 aligned README with the Phase G skeleton. The corrected flagship refusal anchor path is `tests/fixtures/v2/slice16-anchor-cells.json`, whose `flagship_refusal` entry carries `out_of_envelope`, C3=2928.933, and the verbatim `what_would_help` string.
- 2026-07-10 — AMENDMENT A2 (post-lock, tracked — not a silent edit; amends DEC-15-8). Ruling: an unknown-but-well-formed identifier is a structured `not_found` refusal; malformed input remains an MCP -32602 input/schema error. Precedent: eval P6 (`NO_SUCH_BODY_ABC123`) in `mcp/eval/slice15-eval-pairs.json` and the 10/10 committed report at c8a139a. G1 conformance commit cb62ab9 applied the same rule to `estimate_mission_cost` unknown vehicle/site IDs.
- 2026-07-10 — OQ dispositions appended at close: OQ-15-1 CLOSED (PURE; d726f3d dynamic Lambert proof plus DEC-15-6 PURE branch already recorded). OQ-15-2 CLOSED (seven tools + reserved empty slot implemented by 142f8cc and README-confirmed in 2cf7526/84fefe8). OQ-15-3 CLOSED (DEC-15-4 finalized; envelope core c5d1173 plus convention-(g) pin 32d2801). OQ-15-4 CLOSED (eval set 5d4f896; runner/report c8a139a; report path `mcp/eval/slice15-eval-report.json`). OQ-15-5 CLOSED for the package-name decision (`aster-mission-mcp`; DEC-15-7 A1 and package identity commit 7b9eda3), with publish-time registry re-verification remaining as the manual publish gate. OQ-15-6 CLOSED for v1 (Node >=18, compiled JS, bin target, files whitelist verified in `mcp/package.json` at 7b9eda3/G1). OQ-15-7 CLOSED (same-repo PURE import strategy scaffolded in 3be36bb and exercised by the built MCP tools through D2/G1). OQ-15-8 CLOSED (Node timing artifact `tools/slice15-research/data/node-grid-timing.json` in a4bb189: 80×50 default, hard cap 20000 cells, Apophis 200×100 M=0 baseline 73.55389999999989 ms on Node v24.18.0).
- 2026-07-10 — INV-031 satisfied for Slice 15: publish remains gated on the committed 10-pair eval report, and c8a139a records `mcp/eval/slice15-eval-summary.md` with `Result: 10/10 PASS` and `mcp/eval/slice15-eval-report.json` with `passed: 10`, `failed: 0`. `INVARIANTS.md` is not edited in this dispatch; this line is the slice-local close record for INV-031.
- 2026-07-10 — AMENDMENT A2 marker: S15-FOUNDING-LOCKED-2026-07-07-C. Marker advanced from -B to -C by additive close record; earlier marker lines remain historical.
DEFERRED (post-Slice-15, non-blocking):
- Package size 97.2 MB unpacked / 18.1 MB packed. 89 MB is two fixtures: nea-catalog-slice9.json (54.9 MB) + lambert-screen-cache.json (34.5 MB). Honest (runtime data the tools require) but a Phase-H prune candidate — screen-cache prunable to served bodies; catalog gzip-at-rest + inflate-on-load. Not a defect.
- Local git author email is hudsonclavin@gmauil.com (typo) on committed history; npm maintainer record is correct (hudsonclavin@gmail.com). Forward-fix only: `git config user.email` to correct address so future commits are right. Do NOT rewrite pushed history.
- Five Fable-session founding DRAFTS (DECISIONS_2026-07-07, SLICE_16_APPENDIX_A_scenarios, DOSSIER_FOUNDING, SLICE_17_FOUNDING, SLICE_18_19_SEEDS) authored in the 2026-07-07/09 session remain in Nova's outputs, NOT yet downloaded to disk, NOT ingested. Land via the G2 Step-6 ingestion path when Dossier or Slice 16 begins.

---

## Post-lock correction (2026-08-01, additive) — module path in two citations

**Marker:** `S16-REMEDIATE-2026-08-01-A` · audit finding L3-5.

Two lines above cite the launch-vehicle module at **`src/v2/launch-vehicles.ts`** (the OQ-15-4 anchor list entry "Vehicle data: NASA LSP elvperf as-of 2024-02-29 — `src/v2/launch-vehicles.ts` @ bcf1738", and commitment (h)'s "the vehicle curves are literally 'as-of 2024-02-29' in `src/v2/launch-vehicles.ts`"). **That path has never existed in this repository.** The module is, and was at the cited commit, **`src/v2/porkchop/launch-vehicles.ts`**. The commit hash, the as-of date, and every technical claim in those lines are unaffected — only the directory segment was wrong. Recorded additively because this document is locked; the original lines stand as written, with this correction as the authoritative path.
