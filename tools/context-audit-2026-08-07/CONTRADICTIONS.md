# Aster context contradictions and staleness traps

- **Marker:** `S-CONTEXT-AUDIT-2026-08-07-A`
- **HEAD audited:** `1a1df13`
- **Date:** 2026-08-07

Compiled by read-only audit; every claim cites file:line or SHA; UNKNOWNs are labeled.

This ledger states both sides and does not choose one silently. Some disagreements are historical text preserved inside additive documents; they remain listed because an advisor can quote the older side as though it described HEAD (`AGENTS.md:117`).

## C-01 — Viewer pause/time controls

- **Existing Project `DEVLOG.md`:** describes a time scrubber, a paused simulation, and a `simSpeed === 0` state (`DEVLOG.md:49-52`, `DEVLOG.md:73-76`, `DEVLOG.md:515-538`).
- **Current capability lane:** the V2 viewer follows wall time at 1×, has discrete ±30-minute scrubs and boundary jumps, and has no pause-at-current-time, play/pause, rate, or reverse-playback control (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:17-21`, `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:93-96`).

## C-02 — `STATUS.md` HEAD/origin state

- **Existing `STATUS.md`:** says local HEAD is `1a1b987`, local `origin/main` is `237c42e`, and HEAD is ahead of it (`STATUS.md:20-26`).
- **Git lane:** actual local HEAD and local `origin/main` are both `1a1df13`, with ahead/behind 0/0 at audit (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:84-88`; commit `1a1df13`).

## C-03 — Slice 17's next Front-A phase

- **Existing `STATUS.md`:** says Front A is at A1 and the next execution step is A1 (`STATUS.md:42`, `STATUS.md:81`).
- **Git/founding lane:** A1 implementation landed at `e8182e4`, is marked unaudited, and the next recorded phase is A2/G-A2; A3-preparation commits also exist (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:24`, `tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:62-67`; commits `e8182e4`, `51516bd`, `52ee0c8`).

## C-04 — Whether Slice 17 Front B started

- **Existing `STATUS.md`:** says Front B is not started (`STATUS.md:42`).
- **Git lane:** seven B0 commits already landed for cache-window copy, About/C3 formatting, Titan key, search accessibility, coverage copy, and footer spacing (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:89-90`; commits `fbdd8da`, `c0b578f`, `1b42e78`, `63ca402`, `4d483e5`, `a3a1981`, `8d6bdf8`).

## C-05 — MCP publication certainty

- **Slice-state lane / existing `STATUS.md`:** states `aster-mission-mcp@0.1.0` is published and handshake-verified (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:20`; `STATUS.md:14`).
- **Infrastructure lane:** verifies the local package declaration and committed publication record only; because this dispatch prohibited network access, current npm-registry publication/handshake state is **UNKNOWN** (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:71-75`).

## C-06 — V2 camera retargeting

- **Existing Project `V2_FOUNDING_DOCUMENT.md`:** its limitations section says there is no UI to retarget the camera to a planet or specific body and that body focus is planned (`V2_FOUNDING_DOCUMENT.md:1381-1385`).
- **Current capability lane:** the viewer has keyboard focus bindings for the Sun, planets, moons, and Titan, plus row/canvas asteroid focus (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:34-57`, `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:200-202`).

## C-07 — Asteroid search/discovery

- **Existing Project `V2_FOUNDING_DOCUMENT.md`:** says asteroid discovery is click-to-focus only and search remains deferred (`V2_FOUNDING_DOCUMENT.md:1367`, `V2_FOUNDING_DOCUMENT.md:1446`).
- **Current capability lane:** the catalog has case-insensitive designation/name search, class filters, five sorts, virtual scrolling, row selection/focus, and a per-row porkchop button (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:188-207`).

## C-08 — Whether mission planning exists

- **Existing Project `V2_FOUNDING_DOCUMENT.md`:** says there is no mission planning or trajectory rendering and the mission folder is scaffolded but unimplemented (`V2_FOUNDING_DOCUMENT.md:1389`).
- **Current capability/slice lanes:** `/v2/porkchop/` computes a 200×100 M=1 Lambert grid and exposes DLA, launch-site, vehicle, mission-mode, delivered-mass, ΔV, and validation surfaces; Slices 10–13 are recorded complete/deployed (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:113-153`; `tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:10-16`).

## C-09 — What Slice 17 means

- **Existing Project Slice 10 doc:** its forward scope assigns “Economic feasibility ranking” to Slice 17 (`src/v2/SLICE_10_FOUNDING.md:33-36`).
- **Current Slice 17 founding doc:** assigns Slice 17 to Target Compare plus viewer QOL and says that assignment supersedes the earlier use; economic ranking is unscheduled (`SLICE_17_FOUNDING.md:30-31`, `SLICE_17_FOUNDING.md:41-46`, `SLICE_17_FOUNDING.md:526-531`).

## C-10 — Slice 10 header state

- **Existing Project Slice 10 doc, opening:** labels itself `STATUS: SKELETON` (`src/v2/SLICE_10_FOUNDING.md:1-3`).
- **Same file's later record / slice lane:** says the slice is complete and deployed, with close and deploy commits (`src/v2/SLICE_10_FOUNDING.md:479-504`; `tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:10`).

## C-11 — Slice 11 Earth-series architecture

- **Existing Project Slice 11 doc, original DEC-11C-5 text:** requires one app-wide Earth series shared with the 3D scene (`src/v2/SLICE_11_FOUNDING.md:156-163`).
- **Same additive doc's later amendment / current infrastructure:** says measurement falsified that premise and adopted a two-span split: rolling viewer fixtures versus the dedicated long porkchop fixture (`src/v2/SLICE_11_FOUNDING.md:168-180`, `src/v2/SLICE_11_FOUNDING.md:420`; `tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:93`).

## C-12 — Family-plan maturity states

- **Existing Project `ASTER_FAMILY_MASTER_PLAN.md`:** labels `aster-mcp` FOUNDED, says Wave 0 is “now” and includes Slices 14–16, and says that wave is unchanged (`strategy/ASTER_FAMILY_MASTER_PLAN.md:28-34`, `strategy/ASTER_FAMILY_MASTER_PLAN.md:71-77`).
- **Current slice lane:** records Slice 14 closed/deployed, Slice 15 package work complete, Slice 16 closed with 468 runs archived, and Slice 17 open (`tools/context-audit-2026-08-07/CONTEXT_SLICE_STATE.md:18-24`).

## C-13 — `_rescued-agent-defs/` tracking state

- **`AGENTS.md`:** calls `_rescued-agent-defs/` local-only and untracked (`AGENTS.md:34`).
- **`STATUS.md`:** says six files there are tracked and explicitly calls the AGENTS description stale (`STATUS.md:126`).

## C-14 — Titan's `k` binding

- **Untracked overnight L9 artifact:** at its audited HEAD, says `k` is free/unbound (`tools/overnight-2026-08-05/L9_KEYBINDINGS.md:103-107`).
- **Current capability lane:** current source binds lowercase `k` to Titan after L9 (`tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:25`, `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:49`).

## C-15 — Test-suite inventory presented as project state

- **Existing `STATUS.md`:** its dated 2026-08-02 table says the recursive root run discovered 71 files and that default `npm test` covered a subset (`STATUS.md:64-73`).
- **Current infrastructure lane:** inventory at `1a1df13` finds 70 files under `tests/`, three colocated `src/v2` tests, and three separate MCP tests; the recursive runner discovers `tests/` plus `src/v2`, while default `npm test` remains top-level-only (`tools/context-audit-2026-08-07/CONTEXT_INFRASTRUCTURE.md:48-56`).

## C-16 — Screening-cache clean-checkout reproducibility

- **Overnight L4 historical finding:** identified eight stale input references, one stale output target, nine `.bin/tsc` usages, and a clean-checkout cache failure (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:99-105`).
- **Current research lane:** commits `be5ef60` and `6d9b8bc` repaired the statically identified blockers, but a full post-repair cache regeneration was not run in this audit, so present end-to-end success remains **UNKNOWN** (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:91`, `tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:116`).

## C-17 — Catalog scale/renderer model in `DEVLOG.md`

- **Existing Project `DEVLOG.md`:** describes a 3,000-body interactive `InstancedMesh` cap with overflow rendered as a static point cloud (`DEVLOG.md:95-98`).
- **Current capability/data lanes:** the production boundary loads 41,906 NEAs; current rendering uses worker-propagated positions and point/instance/focused-mesh LOD rather than the stated fixed first-3,000 model (`tools/context-audit-2026-08-07/CONTEXT_RESEARCH_CORPUS.md:90-93`; `tools/context-audit-2026-08-07/CONTEXT_CAPABILITIES.md:213-224`).

## Reconciliation count

Seventeen contradictions or staleness traps are recorded above (`tools/context-audit-2026-08-07/CONTRADICTIONS.md:11-94`). No contradiction is silently resolved here.
