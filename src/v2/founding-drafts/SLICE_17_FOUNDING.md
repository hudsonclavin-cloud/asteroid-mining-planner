<!-- DRAFT — NOT LOCKED. Authored 2026-07-07 (Fable session,
pre-Slice-15-publish). Ingested 2026-07-18 per S16-PRE-INGEST
dispatch; body text byte-preserved from the authored draft.
Slice NUMBERING in this file may be stale — reconciled at
design-lock, not here. Additive-only rules apply AFTER lock; until
lock this file is a working draft. -->

# Slice 17 Founding Document — Remote Transport (aster-mission-mcp on Cloudflare Workers)

**Status:** DRAFT — BARE-BONES by design (Hudson, D5, 2026-07-07). Every §5 entry is PROPOSED **and contingent on the §4 measurements**. Only Hudson locks. No build proceeds past Phase A until both gates pass.
**COPY-VERSION:** S17-FOUNDING-DRAFT-2026-07-07-A
**Prior slice:** Slice 15 (aster-mission-mcp, stdio) — Phases A–D1 shipped.
**Consumer rationale (why this exists at all, updated tonight):** the old default-off gate assumed no remote consumer. Hudson's S18/S19 vision (live data, hosted/visual surfaces) plus any browser-resident agent creates one: a hosted MCP endpoint lets agents and future Lens surfaces use Aster's validated core without local npx. D5 upgraded this to a drafted doc; the *measurement* gates survive intact.

## §1. Intent

Add an OPTIONAL remote transport — streamable HTTP, stateless JSON per MCP spec 2025-11-25 — serving the SAME seven tools and four resources as stdio, deployed on Cloudflare Workers. stdio remains canonical and reviewer-runnable; remote is strictly additive. Does NOT: change any tool, envelope, or refusal; add tools; touch core; replace npx as the primary story.

## §2. Inherited invariants

All of INV-022/024/026/027/032/033 unchanged — the transport is the ONLY new variable. DEC-15-2's own note governs: the envelope is transport-agnostic; a transport addition is a transport project, never an envelope project. New-INV numbering: at most one (§3), provisional pending S16's 034..037 and Dossier's 038/039 — verify the ceiling at lock (standing rule).

## §3. New invariant (provisional)

- **INV-04x — Remote/stdio parity.** The Workers endpoint executes the SAME tool functions and returns byte-equivalent envelopes to stdio for identical inputs (transport framing aside). No remote-only behavior, no remote-only numbers. A parity test (same call, both transports, deep-equal envelopes) is a deploy precondition.

## §4. Open Questions — the gates

**OQ-17-1: Workers CPU-ms vs the measured grid cost.** STATUS: OPEN — **materially improved by M-2 tonight**: Node runs 200×100 M=0 in **73.55 ms** and the 80×50 default in **8.97 ms** (dev box, node-grid-timing.json). That converts the question from "plausible?" to "likely fits; verify on-platform" — but dev-box wall-time ≠ Workers CPU-ms (different hardware, isolate model). Gate: deploy a minimal probe Worker running one real 80×50 grid via the actual core; record CPU-ms. Platform CPU limits are [TO-VERIFY on Cloudflare docs at measurement time — do not design against remembered limits].

**OQ-17-2: Catalog delivery inside a Worker.** STATUS: OPEN — the 41,906-body catalog + screen cache + ephemeris must be available server-side; Worker script/bundle size limits are real. Options: bundle (if it fits), KV/R2/D1 (Cloudflare connector already available). Measure the actual asset sizes first (read-only recon), then pick. This may be the harder gate than CPU.

**OQ-17-3: Public-endpoint abuse surface.** STATUS: OPEN — rate limiting, an access token or open-with-limits, and cost ceiling. Scope minimal: this is a credibility artifact, not a service SLA.

**OQ-17-4: Runtime-hash provenance on Workers.** STATUS: OPEN — no git at runtime (same class as the Phase-G npx bake); the build-time hash bake designed in D1's helper (single swap point) must land before or with this slice.

## §5. Decisions (all PROPOSED, contingent on §4)

- **DEC-17-1:** Platform = Cloudflare Workers (connector in hand; prior Worker experience) — contingent on OQ-17-1 AND OQ-17-2 passing.
- **DEC-17-2:** Transport = streamable HTTP, stateless JSON, spec 2025-11-25 (per mcp-server-discipline; no sessions, no state).
- **DEC-17-3:** Parity by construction: the Worker imports the same compiled tool layer; only the transport adapter is new code (INV-27-clean — the adapter frames, never computes).
- **DEC-17-4:** stdio stays canonical; the README leads with npx; remote is documented as "also available at."

## §6. Phases

- **A — Measure (the gate):** asset-size recon (OQ-17-2) + probe Worker CPU-ms run (OQ-17-1) + Cloudflare limits verified from current docs. STOP: Hudson reviews numbers; the slice proceeds, descopes, or parks HERE.
- **B — Transport adapter + hash bake** (OQ-17-4), parity test green locally.
- **C — Deploy + gates:** parity test against the live endpoint; rate limit in place; live-verify (the deploy-confirmation rule applies to Workers too — a green wrangler run is not verification, a real remote tool call is).
- **D — Docs:** README "also available at," reproduction notes.

## §7. Out of scope

Any UI; auth beyond minimal; multi-region/SLA anything; new tools; Slice 18's live-data fetching (that slice consumes THIS transport, not vice versa).

## §8. Engineering record

- 2026-07-07 — Drafted bare-bones per D5 (Hudson's override of the old default-off, with a real rationale change: S18/S19 create the consumer). M-2 folded: 73.55 ms / 8.97 ms Node baselines cited; gate reframed from viability-unknown to verify-on-platform. OQ-17-2 (catalog delivery) surfaced at draft time as the potentially harder gate. No fake locks; every DEC contingent; Phase A is a hard STOP.
