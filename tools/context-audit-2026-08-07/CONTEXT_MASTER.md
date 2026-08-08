# Aster advisor orientation

- **Marker:** `S-CONTEXT-AUDIT-2026-08-07-A`
- **HEAD audited:** `1a1df13`
- **Date:** 2026-08-07

Compiled by read-only audit; every claim cites file:line or SHA; UNKNOWNs are labeled.

## Project in one paragraph

Aster is an asteroid mission-planning project with three built browser surfaces—a solar-system/catalog viewer, a porkchop planner, and an About/validation page—and a seven-tool stdio MCP package that wraps the same canonical V2 math and evidence sources (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:11`, `tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:70-77`). The viewer is visualization-grade and fixture-backed; the porkchop route performs patched-conic Lambert screening with C3, DLA/site feasibility, ΔV, and delivered-mass readouts; MCP answers use evidence envelopes and structured refusals (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:113-153`, `mcp/README.md:34-54`). `src/v2/` is canonical; legacy V1 directories are not valid implementation sources (`INVARIANTS.md:9-17`).

## Current state and next gate

Audited HEAD is deploy rebuild `1a1df13`, which followed Slice 17 amendment A2 at `d204cea` and closed the prior 12-commit `src/v2/`/`docs/` deployment gap (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:92-97`). `STATUS.md` is stale: it names `1a1b987`, says Front A is at A1, and says Front B has not started, while git shows A1 code committed at `e8182e4`, A3 preparation committed at `51516bd`/`52ee0c8`, and seven B0 commits landed (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:80-90`).

Slice 17 is open and owns two fronts: Target Compare and the full viewer-QOL backlog (`SLICE_17_FOUNDING.md:39-73`). The immediate recorded Front-A phase is **A2/G-A2**, a mathematician/adversarial/architect/reconciliation audit of the pure A1 `segmentWindows` module; nothing may consume that module until zero HIGH findings remain (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:62-67`). G-A1's Hudson fixture-expectation verification is **UNKNOWN** because no additive close record was found (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:64-65`). The `/v2/compare/` page is planned, not built or registered in Vite at this HEAD; A3 owns data orchestration/bounds validation and A4 owns the UI (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:77`).

## Five facts most likely to prevent advisory error

1. **There is no pause-at-current-time control.** Live viewer time is wall-clock-derived at 1×. Arrow keys leave live mode by changing time ±30 minutes; Home/End leave it by jumping to a fixture boundary; Shift+N resumes live tracking. There is no play/pause button or key, time-rate control, reverse playback, or date slider (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:17-21`, `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:93-98`).
2. **Do not advise users to open Target Compare yet.** The prepared selected-body store and URL codec exist, but the catalog has no multi-select control and Vite has no compare entry; the current porkchop “comparison” link merely switches between two targets (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:105`, `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:129-130`, `tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:77`).
3. **A green GitHub Actions run is not a deployment confirmation.** CI builds and tests without writing/deploying `docs/`; Pages serves committed `docs/`, and the release gate requires Hudson's browser/live-bundle verification and manual push (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:18-23`).
4. **The viewer and porkchop use different time-series products.** The viewer interpolates four rolling Horizons fixtures, while porkchop uses the long 2026–2040 inner-system fixture; this two-span split is measured architecture, not accidental duplication (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:84-93`, `src/v2/SLICE_11_FOUNDING.md:420`).
5. **Planned capability and raw research are not present capability or locked fact.** The August P1–P5/QOL/EXPLAINER files label themselves LEADS, V6/V7 are verified-with-citations but not LOCKED, and DEC-17-9 selectively binds the QOL backlog with corrections (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:39-67`). Use founding DECs, current source, committed measurement artifacts, and explicit UNKNOWNs—not roadmap prose or plausible extrapolation (`AGENTS.md:117`, `INVARIANTS.md:200`).

## What Hudson can use now

### Solar-system viewer and catalog

The viewer supports keyboard time steps/bounds/live resume, keyboard focus for the Sun through Saturn and named moons, top-down and outer-system presets, drag orbit, wheel/pinch zoom, asteroid click focus, planet hover tooltips, a date/status HUD, and a catalog overlay (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:23-87`). The catalog supports designation/name search, orbit-class filtering, designation/class/H sorts, starfield and label toggles, a star-brightness slider, row focus, per-row PC modal, layout toggle, cache-derived footer disclosure, and virtual scrolling (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:184-207`).

Negative capabilities are load-bearing: no pause/play, rate, reverse playback, date picker, orbit-line toggle, label-size control, asteroid-size control, planet-click focus, free pan, FOV control, camera-plane control, compare selector, propagation-model selector, or log-depth toggle exists (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:89-106`). An open porkchop modal does not guard the scene keyboard handler, so focus/time keys can pass through behind it (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:60-61`, `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:108-111`).

### Porkchop and About

The dedicated porkchop route reads `?body=`, defaults to 2020 FK3, and computes a fixed 200×100, 2026-01-01→2040-01-01, 182.5→1826.25-day, M=1 grid (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:117-120`). Users can hover/pin cells, toggle C3/DLA contours, select Cape or Vandenberg, choose one of eight vehicle/configurations, switch one-way/sample-return mode, replay the FK3 tour, and expand assumptions/validation disclosures (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:121-131`). Invalid bodies, unconverged cells, out-of-curve vehicle requests, and RED DLA cells have explicit empty/refusal behavior, but the route itself still lacks ephemeris-bounds validation; DEC-17-10 prevents the future compare view from inheriting that gap (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:146-153`).

The About page states what the product is, how the slice/audit process works, and what validation evidence exists; it links commit-pinned founding docs, oracle records, invariants, agent rules, and DEVLOG (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:155-182`). Treat its DEVLOG link cautiously because that file mixes current Slice-12 material with legacy V1 capabilities and is a source of the false pause-control inference (`tools/context-audit-2026-08-07/CONTRADICTIONS.md:11-15`).

## Technical truths worth retaining

- Planets/moons come from fixture ingestion plus cubic-Hermite interpolation and frame transforms; asteroids come from a module worker that receives `{type:'init', bodies}` and returns transferable Float64 `{type:'propagate-result', requestId, targetTdbSeconds, positionsM}` buffers (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:213-219`).
- The main thread accepts only the latest asteroid request, while a focused asteroid anchor may synchronously propagate that one body when the cached epoch differs; the renderer then uses one canonical position array for point, instance, and focused-mesh LOD (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:219-224`). These are facts for the open flicker/drift investigation, not a diagnosis (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:229`).
- The global invariant ceiling is INV-037. Daily advisor rules include anti-porting (INV-024), plain-English public taxonomy (INV-025), trust-surface values from one committed provenance artifact (INV-026), verified SourceRefs only (INV-033), tracked claimed evidence (INV-034), and controlled amendment of false frozen expectations (INV-037) (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:69-78`).
- The production data layer includes six `src/v2/data` artifacts plus the 41,906-body catalog and 34.5 MB screening cache. Exact clean-checkout regeneration is not established for the historical catalog or rolling blobs; full post-repair cache regeneration is also UNKNOWN (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:78-95`).
- MCP registers seven tools and four reference resources, compiles selected canonical `src/v2` core/boundary/porkchop modules, and bakes commit/evidence assets into package output (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:70-76`). Current registry/handshake state is UNKNOWN to this no-network audit even though committed project records call 0.1.0 published (`tools/context-audit-2026-08-07/CONTRADICTIONS.md:35-39`).

## How work must be dispatched

Agents never push; Hudson alone browser-verifies UI and pushes (`AGENTS.md:267-275`). Dispatches need exact goal/context/founding doc/locked decisions, measurable verification and tripwires, explicit staged paths, commit messages, and final-report fields (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:39-44`). `.dispatch-scope` is a shell-glob staging allowlist: `docs/` does not match child files while `docs/*` does; protected paths need Hudson authorization, and invariant/founding-doc deletions are mechanically rejected (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:25-32`). TypeScript subprocesses use `process.execPath` plus `node_modules/typescript/bin/tsc`, never `.bin/tsc` shims (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:48-51`).

## Read next

- **Before answering “can I…?”** Read `CONTEXT_CAPABILITIES.md`; it contains 155 positive/negative surface items and the rendering pipeline (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:232-237`).
- **Before advising work order or writing a dispatch:** Read `CONTEXT_SLICE_STATE.md`, then the locked `SLICE_17_FOUNDING.md`; current next gate is A2/G-A2 (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:24-67`).
- **Before quoting research, data provenance, corpus size, or reproducibility:** Read `CONTEXT_RESEARCH_CORPUS.md`; it inventories 68 decision-relevant items and labels four UNKNOWNs (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:111-116`).
- **Before specifying build/test/deploy/MCP/agent steps:** Read `CONTEXT_INFRASTRUCTURE.md`; it separates repository configuration from externally unverified state (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:79-84`).
- **Before trusting any older Project file:** Read `CONTRADICTIONS.md`; it records 17 disagreements/staleness traps without silently resolving them (`tools/context-audit-2026-08-07/CONTRADICTIONS.md:11-94`).
