# S17 RECON REPORT — S-S17-RECON-2026-08-03-A
# INTAKE PROVENANCE (added at recovery, 2026-08-04): Claude Code read-only recon at HEAD c6c0c52, executed 2026-08-03 from DISPATCH_S17_RECON_revA.md. Source PDF: Untitled_document__12_.pdf (sha256:00b00abf5a28154c).
# Body below is verbatim pdftotext -layout extraction of the source PDF.
# Treat per recursive-research-elicitation: LEADS, not facts; verify-before-lock.
# ---------------------------------------------------------------------------

S-S17-RECON-2026-08-03-A — Findings
COPY-VERSION: S-S17-RECON-2026-08-03-A

HEAD: c6c0c52 — "docs: commit repo audit (REPO_AUDIT_2026-07-31.md)…
[S-P0D6-AUDITCOMMIT-2026-08-03-A]" (HEAD has advanced past the P0-F1f commit; the audit triaged last
session was committed).
Headline: Slice 17 is far more reuse than build. A ranked, per-body window list already exists on disk for
all 41,906 targets — and the compare view's core columns can be read, not computed. The two genuine
gaps are discrete window extraction and multi-select.




Q1 — Per-target screening output
Artifact: tests/fixtures/v2/lambert-screen-cache.json — 34,499,477 bytes (~34 MB), TRACKED in
git, 41,906 body records.
Per-body schema (src/v2/boundary/lambert-screen-cache.ts:41-59):

export interface LambertScreenWindow {

    launchDate: string;      // "YYYY-MM-DD" UTC

    tofDays: number;

    c3: number;              // km²/s²

    vInfDep: number;         // km/s

    vInfArr: number;         // km/s

}




export interface LambertScreenResult {

    bodyId: string; spkId: number; designation: string;

  status: LambertScreenStatus;      // low_departure_c3 | high_departure_c3 |
lambert_unconvergeable | propagator_failed

    minC3: number | null;                   // km²/s²

    minC3Date: string | null;               // ← departure date IS stored

    minC3TofDays: number | null;            // ← and its TOF

    bestWindows: LambertScreenWindow[];
    isCoOrbital: boolean;

}




Provenance (:61-84, values read from the artifact's own metadata):


                           Field                                         Value



generatedAt                                             2026-05-30T04:43:31.918Z



catalogSize                                             41,906



screeningWindow                                         2026-01-01 → 2040-12-31



departureGridSpacingDays                                7



tofGridSpacingDays                                      30



tofMinDays / tofMaxDays                                 182 / 1826



feasibleC3MaxKm2S2                                      25



totalSolves                                             1,804,638,825



wallTimeSeconds                                         3,137.74 (~52 min)



provenance.solverCommit                                 8471659bb1c66c7adc6998730e28da31e60b
                                                        367d



+ sha256 of catalog fixture, Horizons fixture,          all pinned
precompute script
Is minC3 a global minimum? Yes — a global minimum over the whole 2026-2040 window, at 7-day
departure × 30-day TOF resolution, TOF 182-1826 d. Not per-window, not per-year. The departure date and
TOF are stored alongside it (minC3Date, minC3TofDays), so a compare row needs no computation for
"best C3 and when."
Sample (433): minC3 1.6244339770173506, minC3Date "2032-06-10", minC3TofDays 272, plus 5
bestWindows.



Q2 — The HIGH/LOW threshold
25 km²/s², and it lives in the build script, not the UI — which is exactly why it is undisclosed to a reviewer.
tools/build/precompute-lambert-screen.mjs:89:

const FEASIBLE_C3_MAX = 25;




Applied at :299-302:

} else if (minC3 <= FEASIBLE_C3_MAX) {

  status = 'low_departure_c3';

} else {

  status = 'high_departure_c3';




and recorded into the artifact at :382 as feasibleC3MaxKm2S2: FEASIBLE_C3_MAX.
The UI never sees the number. It renders the pre-baked status string; the boundary is frozen into a 34
MB artifact at build time. C3 rendering lives in src/v2/app/catalog-list/row.ts and
honesty-disclosure.ts (not panel.ts). The value is recoverable at runtime — it is in
metadata.feasibleC3MaxKm2S2 — so disclosing it is a UI read, not a regeneration.



Q3 — Porkchop engine reuse
Entry point: computePorkchopGrid (src/v2/porkchop/grid-compute.ts:157-162):

export function computePorkchopGrid(

  bodyElements: AsteroidOrbitalElements,

  gridParams: PorkchopGridParams,

  M: number,

  deps: PorkchopEphemerisDependencies,

): PorkchopGridResult
Inputs (:22-29): depStartJD, depEndJD, tofMinDays, tofMaxDays, nDep, nTof — plus target orbital
elements and an injected ephemeris/solver dependency bundle (:57, getEarthStateAtTdbSeconds,
propagateTargetStateAtTdbSeconds, optional solveLambert, nowMs).
Returns (:52-55): { cells: readonly PorkchopCell[], compute_ms: number }, each cell carrying
depJD, tofDays, status, M, branches[], selectedBranch and each branch c3, vInfDep,
vInfArr, dlaDeg?, v1, v2.
Can it be invoked for N targets without the view? YES — cleanly. The seam is sharp:

    ●​ computePorkchopGrid is a pure function in src/v2/porkchop/ with all I/O injected via
       PorkchopEphemerisDependencies. It imports no DOM and no view code.
    ●​ It already has two independent non-view callers, which is the proof: the worker
       (src/v2/porkchop/porkchop.worker.ts, message-based, PorkchopWorkerComputeMessage →
       PorkchopWorkerGridResultMessage) and the MCP server (mcp/src/tools/porkchop-scan.ts,
       headless Node).
    ●​ View-specific concerns (GRID_PARAMS, hover/pick math) sit in
       src/v2/app/porkchop/main.ts:185-186 and src/v2/porkchop/porkchop-view.ts:262-300
       — above the seam.

Notable: the worker transfers a reduced cell type — PorkchopWorkerBranch = Omit<PorkchopBranch,
'v1'|'v2'|'dlaDeg'> & {…} (:40-45) — i.e. it already drops the heavy vectors for postMessage. A
compare view wanting N grids would want that same reduction.


Q4 — Per-target compute cost (house-measured only)
Two committed measurement artifacts. No estimates substituted.
A. tools/slice15-research/data/node-grid-timing.json — measured 2026-07-07, box:
win32/x64, Intel Core Ultra 7 255H, 16 cores, Node v24.18.0, body 99942 Apophis:


          Grid        M median ms



200 × 100 (baseline) 0 73.55



80 × 50               0 8.97



60 × 40               0 5.70



40 × 25               0 3.19

chosenDefault: { gridDeparture: 80, gridTof: 50, hardCapCells: 20000, selectionRule:
"largest candidate with median wall time <= ~2 s on this box" }.
B. tools/slice11-research/data/lambert-grid-timing.json — generated 2026-06-03, grid 200 ×
100, span 2026-01-01→2040-01-01, TOF 182.5-1826.25 d, across 10 bodies spanning orbit classes:

99942 116 ms · 101955 105 · 25143 94 · 1566 98 · 2062 98 · 433 96 · 163693 99 · 459872 97 · 2017 UR52
116 · 2020 AP2 117

summary: min 94 / median 98.5 / max 117 ms; totalRunMs 3,752.
Resolution actually in use: the porkchop view uses 200 × 100
(src/v2/app/porkchop/main.ts:185-186, nDep: 200, nTof: 100, surfaced in the UI at :602). The
MCP tool defaults to the smaller DEFAULT_GRID_DEPARTURE/DEFAULT_GRID_TOF (80×50) with a
20,000-cell cap (mcp/src/tools/porkchop-scan.ts:31-33).
So the two artifacts bracket it: ~95-120 ms per target at the view's 200×100, ~9 ms at 80×50 — both on
their respective measurement boxes, neither on Hudson's.


Q5 — Window extraction
Partially exists — and the distinction matters for the founding doc.
What exists: bestWindows, computed in tools/build/precompute-lambert-screen.mjs. Its header
(:10) states the rule verbatim:
      *    - bestWindows: top-5 windows by C3, regardless of threshold
Implementation :126-137 is a sorted insert keeping the 5 lowest-C3 grid cells:

function maybeInsertBestWindow(bestWindows, candidate) {

  while (insertAt < bestWindows.length && bestWindows[insertAt].c3 <= candidate.c3) {
... }

  bestWindows.splice(insertAt, 0, candidate);

  if (bestWindows.length > 5) { bestWindows.pop(); }




What does NOT exist: local-minima detection / distinct-opportunity separation. These are the five
globally-cheapest grid cells, which cluster inside the same opportunity. The committed 433 record
demonstrates it directly:


# launchDate tofDays       c3



1 2032-06-10    272       1.624



2 2032-06-03    272       1.783
3 2039-05-26    302      2.273



4 2039-05-19    302      2.579



5 2032-07-08    242      2.809

Rows 1-2 are adjacent 7-day cells at identical TOF; rows 3-4 likewise. Five "windows" are really ~2-3
distinct opportunities. A compare view ranking "best windows" per target would show duplicates unless it
de-duplicates.
grep across src/v2 for minima/window/ranking logic returns nothing beyond this build script — no
runtime window-extraction code exists. Discrete-window extraction is new math-layer work and Slice
17's founding doc must scope it, with the audit implications that carries. The cheap alternative — cluster
bestWindows by proximity in (launchDate, tofDays) — is a render-layer post-process over existing data and
would not touch core/.


Q6 — ΔV stack and delivered mass
Curves: src/v2/porkchop/launch-vehicles.ts. Provenance comment verbatim (:1-12):

/**

 * Slice 13 launch-vehicle screening data and pure math.

 *

 * Vehicle payload curves are NASA LSP elvperf primary-source anchors (as-of
2024-02-29,

 * queried 2026-07-02). Curves interpolate only between sourced anchors; no
extrapolation.

 * New Glenn keeps all four sourced anchors, including 120 kg at C3=30 km^2/s^2.

 * NG C3=21-29 interior optimistic (linear across steep segment); densification
anchors

 * at C3=25/35 pending, oracle to quantify.

 *

 * DEC-13-4 double-count guard: deliveredMassKg intentionally has no injection field
in

 * its input budget. Payload-at-C3 already includes the launch vehicle injection to
C3.

 */
Eight vehicle/config pairs (:62-169): Falcon Heavy Expendable · Falcon Heavy Recovery · Vulcan VC2 ·
Vulcan VC4 · Vulcan VC6 · New Glenn Standard · Falcon 9 FT ASDS · Falcon 9 FT RTLS. Every anchor
carries an inline // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02 comment; domain
is C3 0-55 km²/s² with no extrapolation (isBeyondCurve, :181).
Functions: payloadAtC3(vehicle, c3) (:198), deliveredMassKg(vehicle, c3, budget, mode)
(:229), deterministicMarginMps(...) (:191).
What the CI golden guard pins (tests/v2-golden/launch-vehicles.golden.test.mjs) — and why it
exists, from its own header (:5-7):
      "anchor that re-sloped payloadAtC3 across C3 (0,10); it was reverted in bcf1738 …
      payloadAtC3 and deliveredMassKg so that class cannot ship unnoticed again."
It pins 9 payloadAtC3 cases (parameterised, :62-69, each asserting an exact kg value per
vehicle/config/C3) plus 1 deliveredMassKg case (:78-82):

test('deliveredMassKg New Glenn/Standard C3=5 one-way === 3494.511538898568 kg', ...)

// stated inputs (:77): ISP 320 s, g0 9.80665 m/s^2, payloadAtC3 6055 kg




It guards against silent re-sloping of the interpolation between sourced anchors — the exact regression
class that shipped once and was reverted.


Q7 — Catalog metadata for comparison columns
Per-body schema, src/v2/boundary/slice9-nea-catalog.ts:109-144 (Slice9NeaBody):


                 Field                      Present                          Notes



H (absolute magnitude)                 YES (:120)         number | null




G (slope parameter)                    YES (:121)



orbitClass (APO/AMO/ATE/IEO)           YES (:116)         typed AsteroidOrbitClass; also class
                                                          (:115)



conditionCode (U parameter)            YES (:54, :125)    number | null — present, contrary to the
                                                          dispatch's expectation
dataArcDays                            YES (:55, :126)



nObsUsed                               YES (:56, :127)



sigmaA, sigmaE                         YES (:57-58,       1-σ uncertainties — directly usable for an
                                       :128-129)          uncertainty column



estimatedRadiusM                       YES (:122)         H-derived; no separate diameter or albedo
                                                          field



Orbital elements a, e, i               YES (:135-143)     elements.aM, .e, .iRad, plus omRad, wRad,
                                                          maRad



Epoch of elements                      YES (:142)         elements.epochTdbSeconds




eccentricityBand, inv014Tier,          YES (:124,         derived quality bands
qualityRank                            :130-131)



anchorSource, reanchorEpochTdbJd, YES (:132-134)          ingest provenance
anchorState


ABSENT and relevant to a compare view: orbit_id, soln_date, albedo, and a measured diameter (only
H-derived estimatedRadiusM). Also absent: any per-field measured/derived/assumed flag —
mcp/src/tools/get-body.ts:48 states this outright as a standing envelope assumption:
       "Physical-parameter confidence is assumed because the Slice 9 catalog boundary does not
       distinguish measured/derived/assumed per field."
Consequence for the dependency chain: because conditionCode is present, the orbit-quality column
Slice 17 most wanted does not require a catalog regeneration. Regeneration is only needed if the
compare view wants orbit_id/soln_date/albedo. CANNOT DETERMINE from source whether SBDB
was the ingest source for conditionCode specifically — the field names match SBDB conventions, but I
did not trace the ingest script.


Q8 — Selection state
Strictly single-target today.
src/v2/app/ui-store/store.ts:34:
const mutableSelectedBody = signal<string | null>(null);




:45 export const selectedBodySignal = computed(() => mutableSelectedBody.value); · :132
setter assigns a scalar · :92 getter returns the scalar.
src/v2/app/catalog-list/panel.ts (721 lines) reads selectedBodySignal (:9, :210) and contains
no checkbox, no multi-select, no Set<>. No URL param encodes a target set — the porkchop route uses a
single ?body= param.
Multi-select is BUILD, though the store pattern is a signals store, so adding a selectedBodySet signal
alongside is additive rather than a rewrite.


Q9 — Route and entry surface
vite.config.ts:13-20:

input: {

    legacy:                     resolve(__dirname, 'index.html'),

    v2Index:                    resolve(__dirname, 'v2/index.html'),

    earthMoonV2:                resolve(__dirname, 'v2/earth-moon/index.html'),

    innerSolarSystemV2:         resolve(__dirname, 'v2/inner-solar-system/index.html'),

    aboutV2:                    resolve(__dirname, 'v2/about/index.html'),

    porkchopV2:                 resolve(__dirname, 'v2/porkchop/index.html'),

    solarSystemV2:              resolve(__dirname, 'v2/solar-system/index.html'),

}




Convention: v2/<name>/index.html → /v2/<name>/. Adding compareV2: resolve(__dirname,
'v2/compare/index.html') follows the pattern exactly.
The unusual wiring the R2 finding refers to is confirmed: earthMoonV2 and innerSolarSystemV2 are
redirect stubs, not applications —

<meta http-equiv="refresh" content="0; url=../solar-system/" />

<title>Aster V2 — Redirecting To Solar System</title>




Both redirect to ../solar-system/. So 2 of the 7 entries build to stubs; only 5 are real surfaces. A new
compare entry should be a real page, and whoever adds it should not use the
earth-moon/inner-solar-system entries as templates.
Q10 — Reuse vs build

   Capability             Verdict                                Detail



Target            BUILD             signal<string | null> is scalar (ui-store/store.ts:34);
selection                           no checkboxes, no set in panel.ts, no multi-target URL param.
                                    Additive to the existing signals store.



Per-target grid   REUSE             computePorkchopGrid (grid-compute.ts:157) is pure with
                                    injected deps; already driven headlessly by the worker and by
                                    MCP. Seam is clean.



Best-window       REUSE             bestWindows + minC3/minC3Date/minC3TofDays already
data                                stored for all 41,906 bodies in the tracked 34 MB
                                    lambert-screen-cache.json. No computation needed for the
                                    headline columns.



Window            EXTEND            Stored windows are "top-5 by C3"
extraction                          (precompute-lambert-screen.mjs:10), not local minima —
(discrete)                          they cluster (see 433). De-duplication/clustering is missing.
                                    True minima-finding would be new core/ math with audit
                                    implications.



ΔV / delivered    REUSE             payloadAtC3 (:198), deliveredMassKg (:229), 8 vehicle/config
mass                                curves with elvperf provenance, isBeyondCurve domain guard,
                                    CI golden guard on 9+1 values.



Comparison        REUSE (mostly)    H, orbitClass, conditionCode, dataArcDays, nObsUsed,
columns                             sigmaA/sigmaE, a/e/i, epoch all present. EXTEND only if
                                    orbit_id/soln_date/albedo/measured-diameter are wanted
                                    → catalog regeneration.



Uncertainty       REUSE (data) /    sigmaA, sigmaE, conditionCode, qualityRank, inv014Tier
display           BUILD             exist per body; no comparison-oriented uncertainty rendering
                  (presentation)    exists.
Threshold       EXTEND               feasibleC3MaxKm2S2: 25 is in the artifact metadata and
disclosure                           readable at runtime; the UI simply never surfaces it. UI-only
                                     change.



Route/entry     REUSE (pattern)      vite.config.ts:13-20 + v2/<name>/index.html; note 2 of 7
                                     existing entries are redirect stubs.




CANNOT DETERMINE
   1.​ Per-target compute cost on Hudson's machine. Both timing artifacts were measured on other
       boxes — slice15 on win32/x64 Intel Core Ultra 7 255H, Node v24.18.0; slice11's box is
       not recorded in the artifact. Would answer it: re-running
       tools/slice11-research/measurements/lambert-grid-timing.mjs locally.
   2.​ Cost of N simultaneous grids. All measurements are single-target, single-threaded. Whether 5
       targets parallelise across workers or serialise is unmeasured. Would answer it: a timing harness
       over N worker instances.
   3.​ Whether conditionCode originates from SBDB. Field naming matches SBDB, but I did not trace
       the ingest script to confirm the source or its as-of date.
   4.​ Whether the screening cache's 7-day × 30-day grid is fine enough for compare-view ranking.
       The view computes at 200×100 over the same span — materially finer — so minC3 from the cache
       and minC3 from a live grid may disagree. Unquantified. Would answer it: recomputing a few
       bodies at 200×100 and diffing against the cached minC3.
   5.​ How the catalog sidebar renders C3/badges. Located in catalog-list/row.ts and
       honesty-disclosure.ts but not read line-by-line; Q2's threshold answer comes from the build
       script and artifact metadata, which is authoritative regardless.


Read-only confirmation
$ git status --porcelain

 M .dispatch-scope

 M .githooks/pre-commit

 M .githooks/pre-push

?? Untitled.canvas

?? tools/slice16-harness/FULL_RUN_REPORT.md

?? tools/slice2-research/data/2026-07-18_2026-10-16/
?? tools/slice3-research/data/2026-07-18_2026-10-16/

?? tools/slice4-research/data/2026-07-18_2026-10-16/

?? tools/slice6-research/data/2026-07-18_2026-10-16/




Matches the declared known-dirty baseline with no additions. (The three docs/ CRLF files no longer
appear — they were resolved by a commit outside this session; noted, not investigated.) No file was
edited, staged, committed, or moved; no build, dev server, or browser.
