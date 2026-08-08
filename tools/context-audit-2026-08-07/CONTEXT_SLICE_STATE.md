# Aster slice state and decision inventory

Marker: S-CONTEXT-AUDIT-2026-08-07-A  
Audited HEAD: 1a1df13  
Date: 2026-08-07  
Compiled by read-only audit; every claim cites file:line or SHA; UNKNOWNs are labeled.

## B1. Slice ledger, 10 through 17

**Slice 10 — Lambert solver + Earth-departure screening.** Founding doc: `src/v2/SLICE_10_FOUNDING.md` (`src/v2/SLICE_10_FOUNDING.md:1`). It built the clean-room TypeScript Izzo Lambert solver, full-catalog Earth-departure screening cache, catalog UI, per-body screening colors, and patched-conic/co-orbital disclosure; its own close section says Phase D and Phase E are complete and the slice is deployed (`src/v2/SLICE_10_FOUNDING.md:479-500`). The opening `SKELETON` status is historical, not current (`src/v2/SLICE_10_FOUNDING.md:3`; `src/v2/SLICE_10_FOUNDING.md:498-504`). Key commits: solver `70a97fa`; cache contract `9e93ffc`; catalog UI `eeebf40`; deploy `205099a`; close record `42fecf3` (`src/v2/SLICE_10_FOUNDING.md:456-457`; `src/v2/SLICE_10_FOUNDING.md:481-494`; commits `42fecf3`, `9e93ffc`).

**Slice 11 — porkchop visualization + ΔV stack.** Founding doc: `src/v2/SLICE_11_FOUNDING.md` (`src/v2/SLICE_11_FOUNDING.md:1`). It built one shared porkchop renderer for a catalog modal and bookmarkable dedicated route, on-demand M=0/M=1 grids from the audited Lambert substrate, and the disclosed ΔV stack (`src/v2/SLICE_11_FOUNDING.md:10-16`; `src/v2/SLICE_11_FOUNDING.md:32-37`). The project ledger marks Slice 11 complete and deployed (`STATUS.md:36-38`); deployment commit `da3c520` shipped the route, modal entry, and log colormap. Key commits: multi-revolution Lambert `9fc8bc4`; worker/grid compute `916417e`; modal `d0aa1d7`; dedicated route `e871297`; ΔV stack `0f5961d`; deploy `da3c520`; 500-body M=1 measurement/deferral `b85f9b9` and `50b3b68` (`src/v2/SLICE_11_FOUNDING.md:354-362`; `src/v2/SLICE_11_FOUNDING.md:405-420`; `src/v2/SLICE_11_FOUNDING.md:430-445`; commits `da3c520`, `50b3b68`).

**Slice 12 — DLA / launch-feasibility overlay.** Founding doc: `src/v2/SLICE_12_FOUNDING.md` (`src/v2/SLICE_12_FOUNDING.md:1`). It added validated per-cell declination of the launch asymptote, launch-site feasibility classification, a toggleable overlay, and DLA/feasibility in the selected-cell readout, without changing Lambert (`src/v2/SLICE_12_FOUNDING.md:10-18`). The engineering record says Phases A–E completed, audit findings were resolved, and the slice closed/deployed on 2026-07-02 (`src/v2/SLICE_12_FOUNDING.md:167-170`). Key commits: DLA worker field `f3471f4`; readout `31e4fcd`; overlay `61bce2d`; site picker `7ce065c`; M=1 vector oracle `830a4d9`; deploy/close `946afed` (`src/v2/SLICE_12_FOUNDING.md:167-170`; commit `946afed`).

**Slice 13 — mission cost card.** Founding doc: `src/v2/SLICE_13_FOUNDING.md` (`src/v2/SLICE_13_FOUNDING.md:1`). It turned a selected porkchop cell into a sourced vehicle/payload/delivered-mass decision card, integrated the two-regime dogleg treatment, and added the mission-mode toggle while leaving Lambert, propagation, worker schema, and catalog untouched (`src/v2/SLICE_13_FOUNDING.md:8-14`). The record says all nine DECs delivered, all five OQs resolved, audit remediated, and the slice deployed at `1accf9d`; later hygiene also closed (`src/v2/SLICE_13_FOUNDING.md:98-100`). Key commits: substrate/math `7180593`; card, dogleg, and mode `5486be5`; FK3 showcase `625b882`; deploy `1accf9d`; post-close hygiene `8fc6f32` (commits `7180593`, `5486be5`, `625b882`, `1accf9d`, `8fc6f32`).

**Slice 14 — packaging and showcase.** Founding doc: `src/v2/SLICE_14_FOUNDING.md` (`src/v2/SLICE_14_FOUNDING.md:1`). It deliberately shipped no new physics; it packaged evidence as the About page, provenance-driven validation card, FK3 guided narrative, anti-porting rule, and minimal CI (`src/v2/SLICE_14_FOUNDING.md:11-21`; `src/v2/SLICE_14_FOUNDING.md:110-151`). Current project state marks it closed and deployed (`STATUS.md:39`). Key commits: CI `3ba985c` plus golden-number gate `4837bbc`; validation card `6cdebfd`; About page `1463023`; guided tour `6c9d7f9`; Phase-E deploy rebuild `b7532eb`; state refresh `de5c4ee` (commits `3ba985c`, `4837bbc`, `6cdebfd`, `1463023`, `6c9d7f9`, `b7532eb`, `de5c4ee`).

**Slice 15 — `aster-mission-mcp` agent interface.** Founding doc: `src/v2/SLICE_15_FOUNDING.md` (`src/v2/SLICE_15_FOUNDING.md:1`). It built a stdio MCP server around Aster's existing core, with evidence envelopes, structured refusals, seven tools, a clean-room/package boundary, Inspector gate, and a repo-verified 10-pair eval (`src/v2/SLICE_15_FOUNDING.md:11-19`; `src/v2/SLICE_15_FOUNDING.md:136-160`; `src/v2/SLICE_15_FOUNDING.md:191-199`). It is published and handshake-verified as `aster-mission-mcp@0.1.0` (`src/v2/SLICE_15_FOUNDING.md:69`; `STATUS.md:40`). Key commits: MCP scaffold `3be36bb`; envelope core `c5d1173`; catalog tools `0a76f39`; seven-tool completion `142f8cc`; eval `c8a139a`; publish close `c4e53a9` (commits `3be36bb`, `c5d1173`, `0a76f39`, `142f8cc`, `c8a139a`, `c4e53a9`).

**Slice 16 — agent-honesty study.** Founding doc: `src/v2/SLICE_16_FOUNDING.md` (`src/v2/SLICE_16_FOUNDING.md:1`). It measured whether agents preserve values, refusals, provenance, and assumptions from MCP evidence envelopes; the operative design was locked additively in §9, superseding the historical top-of-file `DRAFT` marker (`src/v2/SLICE_16_FOUNDING.md:12-18`; `src/v2/SLICE_16_FOUNDING.md:83-100`). It delivered a publicly sealed instrument and 468 real runs, then closed on 2026-08-02; the evidence ledgers were subsequently committed and full digests recorded (`src/v2/SLICE_16_FOUNDING.md:1517-1525`; `src/v2/SLICE_16_FOUNDING.md:1591-1605`). Key commits: design lock `34ca5f7`; public seal record `cb4dbfa` binding DOI to `670b039`; results `13e9c05`; close `a646e28`; evidence archive `6642183` (commits `34ca5f7`, `670b039`, `cb4dbfa`, `13e9c05`, `a646e28`, `6642183`).

**Slice 17 — Target Compare + viewer QOL.** Founding doc: root `SLICE_17_FOUNDING.md`, locked rev B on 2026-08-04 (`SLICE_17_FOUNDING.md:1-13`; commit `237c42e`). Front A is a `/v2/compare/` surface for up to five asteroids using live 731×100 grids, connected-component opportunity structure, a transparent ranking, thumbnails, provenance, and shareable state; Front B absorbs the full phased viewer-QOL backlog (`SLICE_17_FOUNDING.md:39-60`; `SLICE_17_FOUNDING.md:63-73`). The slice is open: A1's pure `segmentWindows` module and tests landed but the commit labels it unaudited pending G-A2; selected-set and URL-codec A3 preparation also landed, and part of B0 landed (`e8182e4`, `51516bd`, `52ee0c8`, `fbdd8da`, `c0b578f`, `1b42e78`, `63ca402`, `4d483e5`, `a3a1981`, `8d6bdf8`). The current next gate is A2/G-A2, before any consumer may use `segmentWindows` (`SLICE_17_FOUNDING.md:287-304`; commit `e8182e4`).

## B2. Slice 17 decision inventory

Every §3 decision is locked; the lock record says no provisional numeric values remain (`SLICE_17_FOUNDING.md:409-413`).

| DEC | One-line ruling | Locked? | Citation |
|---|---|---:|---|
| DEC-17-1 | Define opportunities as 8-connected live-grid components at `c3 <= T`; non-converged cells are holes; report component minimum, argmin, departure-cell breadth, cell count, and TOF span; apply no separate minimum-component-size rule. | Yes | `SLICE_17_FOUNDING.md:93-118` |
| DEC-17-2 | All compare numbers and thumbnails derive from one view-span-matched live 731×100 grid over 2026-01-01 through 2040-01-01; flag cache-tail minima and describe residual cache/live differences as sampling phase, not error. | Yes | `SLICE_17_FOUNDING.md:120-147` |
| DEC-17-3 | Rank by best practical-window C3, render an explicit no-practical-window state, keep global minimum subordinate, and add a three-metric dominance badge rather than a composite score. | Yes | `SLICE_17_FOUNDING.md:149-164` |
| DEC-17-4 | Ship the fixed comparison/context/quality column set, with H-derived size shown as a range and condition code U shown raw with qualitative label and MPC warning. | Yes | `SLICE_17_FOUNDING.md:166-195` |
| DEC-17-5 | Put a persistent, computation-derived method/provenance badge on compare surfaces and disclose the 25 km²/s² threshold, interpolation anchors, NASA-NLS context, and New Glenn caveat. | Yes | `SLICE_17_FOUNDING.md:197-212` |
| DEC-17-6 | Multi-select is additive beside scalar selection, capped at five, shareable as `?bodies=`, and computed serially without workers. | Yes | `SLICE_17_FOUNDING.md:214-222` |
| DEC-17-7 | The entry surface is a real `/v2/compare/` Vite page, not one of the redirect-stub entries. | Yes | `SLICE_17_FOUNDING.md:224-227` |
| DEC-17-8 | Use relative `liveMin + 5 km²/s²` for structural segmentation, absolute 25 km²/s² for viability, and `B_min = 2` verified departure cells for practical ranking; offer both labeled threshold modes. | Yes | `SLICE_17_FOUNDING.md:229-247` |
| DEC-17-9 | Front B owns the entire QOL backlog, phased under corrections C1–C3 and the §5 cut rule. | Yes | `SLICE_17_FOUNDING.md:249-263` |
| DEC-17-10 | Validate requested departure span against runtime ephemeris fixture bounds and refuse out-of-bounds work; never clamp or rely on coincidental coverage. | Yes | `SLICE_17_FOUNDING.md:265-279` |

### Open questions

| OQ | State at audited HEAD | Citation |
|---|---|---|
| OQ-17-1 | RESOLVED: cache/live reconciliation copy is the DEC-17-2 sampling-phase explanation. | `SLICE_17_FOUNDING.md:379-380` |
| OQ-17-2 | RESOLVED: serial computation, no workers. | `SLICE_17_FOUNDING.md:381`; `SLICE_17_FOUNDING.md:214-222` |
| OQ-17-3 | OPEN: finalize the dominance metric set at A3. | `SLICE_17_FOUNDING.md:382-383` |
| OQ-17-4 | OPEN roadmap/mothership call: after Front B absorbs QOL, rescope Slice 21 to the Living Sky ephemeris core. | `SLICE_17_FOUNDING.md:384-386`; `SLICE_17_FOUNDING.md:417-418` |
| OQ-17-5 | OPEN: decide at B2 whether the measured marker rim-decay shortfall warrants a texture fix. | `SLICE_17_FOUNDING.md:387-389` |
| OQ-17-6 | OPEN, explicitly outside this slice: audit literal-versus-derived label provenance across existing trust surfaces. | `SLICE_17_FOUNDING.md:390-391` |
| OQ-17-7 | OPEN, separate dispatch: screening-cache reproducibility. | `SLICE_17_FOUNDING.md:392-394` |
| OQ-17-8 | OPEN: check whether catalog condition-code ingestion loses MPCORB letter values E/D/F by converting them to null. | `SLICE_17_FOUNDING.md:395-400` |
| OQ-17-9 | OPEN: identify and source the albedo assumption behind catalog `estimatedRadiusM`. | `SLICE_17_FOUNDING.md:401-404` |

### §8 amendments

- **A1, 2026-08-04 — evidence-header provenance correction.** The recon SHA `c6c0c52` was the HEAD audited, not the introducing commit; the triage artifact was introduced by `56149d8`, the recon report by `c64ce1d`, and the latter's full repo-root path is recorded. The amendment establishes that future evidence headers must distinguish “executed against” from “introduced by” (`SLICE_17_FOUNDING.md:420-435`; commits `1a1b987`, `56149d8`, `c64ce1d`).
- **A2, 2026-08-06 — breadth day-value convention.** Breadth uses `(N - 1) * departureCellDays`, so two verified departure epochs span 7.004109589041096 days, not 14.008219178082192; ranking is unchanged because it uses cell count. UI copy must keep breadth cells and sampling interval adjacent, display day spans at three significant figures, and never imply continuous feasibility between sampled epochs (`SLICE_17_FOUNDING.md:437-483`; commit `d204cea`).

### Gates and next phase

- **G-A1 requires** green unit tests over the committed 433 fixture and named edge cases, plus Hudson verification of fixture expectations against `s17-structure-7day.json` (`SLICE_17_FOUNDING.md:289-296`).
- **G-A1 current completion status: UNKNOWN.** The module and tests exist in commit `e8182e4`, but no additive §8 entry records Hudson's fixture-expectation verification; no tests were run in this read-only audit (`e8182e4`; `SLICE_17_FOUNDING.md:289-296`).
- **G-A2 requires** a mathematician/adversarial/architect/reconciliation audit with zero HIGH findings open; nothing may consume `segmentWindows` before that gate (`SLICE_17_FOUNDING.md:297-299`).
- **Current/next phase:** A1 implementation is committed and explicitly marked “UNAUDITED pending G-A2”; therefore A2, the multi-agent audit, is the next recorded Front-A phase. Two A3-preparation commits exist, but the full A3 orchestration/bounds-validation gate is not recorded as complete (`e8182e4`, `51516bd`, `52ee0c8`; `SLICE_17_FOUNDING.md:297-304`).

## B3. Advisor-relevant invariant index

- **Current global ceiling: INV-037.** The index's highest global entry is INV-037; 035 and 036 were deliberately skipped globally because those bare numbers remain Slice-16-local aliases inside Slice 16 documents (`INVARIANTS.md:203`; `INVARIANTS.md:207-219`; `INVARIANTS.md:227-233`).
- **Namespace rule.** In Slice 16 documents, bare INV-033..036 mean the Slice-16-local frozen-instrument/grading/pre-registration/transcript rules; outside Slice 16, global INV-033 and INV-034 retain their meanings, and new prose should use `INV-S16-033..036` for the local family (`INVARIANTS.md:207-219`).
- **INV-024 — anti-porting.** Re-derive astrodynamics in-repo; external packages such as poliastro/adam_core are validation oracles only, never imported, ported, or transcribed (`INVARIANTS.md:191`).
- **INV-025 — public-copy taxonomy.** Do not expose bare slice/DEC/INV/dispatch identifiers in user copy; frame artifacts by what they demonstrate in plain English (`INVARIANTS.md:192`).
- **INV-026 — trust-surface provenance.** Every numeric public trust/validation claim renders from one committed provenance artifact, not component literals (`INVARIANTS.md:193`).
- **INV-033 — anti-fabrication.** No SourceRef path, SHA, count, or URL enters provenance unless it has been verified to exist and match (`INVARIANTS.md:200`).
- **INV-034 — evidence-artifact tracking.** Anything claimed as committed evidence by a founding doc, invariant, or test must actually be git-tracked, including explicit un-ignore treatment where needed (`INVARIANTS.md:201`).
- **INV-037 — frozen-expectation amendment.** A frozen negative-control expectation changes only after proving the fixture, not the subject, is defective; Hudson must authorize it, and the old expectation, demonstrated defect, and equal-or-stronger replacement coverage must be recorded additively (`INVARIANTS.md:203`; `INVARIANTS.md:227-237`).

## B4. `STATUS.md` claims versus actual git at audit

`STATUS.md` itself warns not to believe its table when HEAD does not match (`STATUS.md:3-6`).

| `STATUS.md` claim | Actual git at 2026-08-07 audit |
|---|---|
| `origin/main` is `237c42e`, not re-fetched (`STATUS.md:20-23`). | Local `origin/main` resolves to `1a1df13`, the deploy-rebuild commit (`1a1df13`). |
| Local HEAD is `1a1b987` (`STATUS.md:20-24`). | Local HEAD is `1a1df13`, 17 descendant commits after `1a1b987` (`1a1df13`, `1a1b987`). |
| HEAD is one/two commits ahead of `origin/main` (`STATUS.md:23-26`; the two lines disagree with each other). | HEAD and the local `origin/main` ref both resolve to `1a1df13`; ahead/behind is 0/0 at audit (`1a1df13`). |
| Slice 17 Front A is “at A1”; next step is A1 (`STATUS.md:42`; `STATUS.md:81`). | A1 implementation landed at `e8182e4` and is explicitly pending G-A2; the next recorded phase is A2. A3-prep commits `51516bd` and `52ee0c8` also landed (`e8182e4`, `51516bd`, `52ee0c8`; `SLICE_17_FOUNDING.md:287-304`). |
| Slice 17 Front B is not started (`STATUS.md:42`). | At least part of B0 landed in seven commits: cache-window copy, About formatter, C3 formatter, Titan key, search accessibility, coverage relabel, and footer spacing (`fbdd8da`, `c0b578f`, `1b42e78`, `63ca402`, `4d483e5`, `a3a1981`, `8d6bdf8`; compare `SLICE_17_FOUNDING.md:320-324`). |

## B5. Deployed / undeployed boundary

- The previously committed deploy surface was build commit `729ffb8` on 2026-08-03; the next deploy rebuild was made from the repository state through `d204cea` and committed as `1a1df13` on 2026-08-06 (`729ffb8`, `d204cea`, `1a1df13`).
- `1a1df13` explicitly closes a gap of **12 commits touching `src/v2/`** between `729ffb8` and `d204cea`: `fbdd8da`, `c0b578f`, `1b42e78`, `63ca402`, `4d483e5`, `a3a1981`, `8d6bdf8`, `e8182e4`, `51516bd`, `52ee0c8`, `1da8465`, and `114defe` (commits `1a1df13`, `fbdd8da`, `c0b578f`, `1b42e78`, `63ca402`, `4d483e5`, `a3a1981`, `8d6bdf8`, `e8182e4`, `51516bd`, `52ee0c8`, `1da8465`, `114defe`).
- At audited HEAD, `docs/` is the committed deploy surface rebuilt by `1a1df13`; there is no later commit after that boundary (`1a1df13`; `AGENTS.md:31`).
- Deployment confirmation is a live Network-tab bundle-hash check after Hudson pushes; a green Actions run alone is explicitly insufficient (`SLICE_17_FOUNDING.md:305-312`; `src/v2/SLICE_14_FOUNDING.md:146-151`).

## Lane B audit report

- **Item count:** 50 decision/state items: 8 slice-ledger entries; 25 Slice-17 items (10 DECs, 9 OQs, 2 amendments, 2 gates, current phase, next phase); 8 invariant-index items; 5 STATUS-vs-git comparisons; 4 deploy-boundary facts.
- **UNKNOWN count:** 1 — the G-A1 Hudson fixture-expectation verification is not recorded as complete.
- **Circuit cuts:** 1 — the 1,648-line Slice-16 additive amendment narrative was cut to lock, seal, result, close, and archive facts; the full chain remains authoritative in `src/v2/SLICE_16_FOUNDING.md:83-1645`.
- **Surprises:** (1) `STATUS.md` is 17 commits behind actual HEAD (`1a1b987`, `1a1df13`); (2) its “Front B not started” claim is contradicted by seven B0 commits (`fbdd8da` through `8d6bdf8` as enumerated above); (3) Slice 10's top says `SKELETON` while its own later section says deployed and complete (`src/v2/SLICE_10_FOUNDING.md:3`; `src/v2/SLICE_10_FOUNDING.md:479-500`); (4) Slice 16's top says `DRAFT` while its additive §9 and §31 say locked and closed (`src/v2/SLICE_16_FOUNDING.md:3`; `src/v2/SLICE_16_FOUNDING.md:83-88`; `src/v2/SLICE_16_FOUNDING.md:1517-1591`).
