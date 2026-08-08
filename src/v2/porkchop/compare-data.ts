// A3 compare data layer (S-S17-A3-2026-08-08-A).
//
// Pure module: no imports from app/ or view code. Given up to 5 selected
// bodies, orchestrates the EXISTING serial grid-compute path (DEC-17-6: serial,
// no workers — parallel measured slower at this scale; perf retired at
// 1431.52 ms for N=5) and the AUDITED segmentWindows module (G-A2 closed at
// fecbcbb, 0 HIGH), producing per-body {grid, segmentation, deliveredMass}.
//
// This module ORCHESTRATES; it does not reimplement compute or segmentation.
//
// The four entry conditions the G-A2 audit made binding (SLICE_17_FOUNDING.md
// §8, 2026-08-08 gate-closure record) are implemented here:
//   D-01  index-order lock — see toSegmentGrid() below.
//   D-02  departure epoch comes from span.requested.start, never
//         span.fixtureBounds.first; see CompareDataParams.depStartJdTdb.
//   D-03  absoluteKm2S2 is INJECTED from the DEC-17-5(a) runtime read of
//         metadata.feasibleC3MaxKm2S2; this module never defaults it.
//   D-04  each result echoes liveMin, Δ, the injected absolute, and the grid
//         geometry so A4's provenance copy and the AMENDMENT A2 breadth copy
//         rule read from the computation, never from literals.
// DEC-17-10 bounds validation refuses out-of-span departure windows as a
// VALUE, never a throw and never a clamp.

import { computePorkchopGrid } from './grid-compute.js';
import type {
  PorkchopCell,
  PorkchopEphemerisDependencies,
} from './grid-compute.js';
import { liveGridMin, segmentWindows } from './segment-windows.js';
import type {
  SegmentGrid,
  SegmentGridCell,
  SegmentWindowsResult,
} from './segment-windows.js';
import { deliveredMassKg } from './launch-vehicles.js';
import type {
  DeliveredMassResult,
  LaunchVehicle,
  MissionMode,
  SpacecraftDvBudget,
} from './launch-vehicles.js';
import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';

/** DEC-17-6 compare multi-select cap. Mirrors COMPARE_BODIES_CAP in
 * compare-url.ts and SELECTED_BODY_SET_CAP in app/ui-store/store.ts. */
export const COMPARE_BODY_CAP = 5;

export interface CompareBodyInput {
  readonly bodyId: string;
  readonly bodyElements: AsteroidOrbitalElements;
}

export interface CompareDataParams {
  /**
   * D-02 — departure epoch anchor. MUST be the artifact's
   * `span.requested.start.jdTdb` (2461041.500800741 = 2026-01-01T00:00:00Z),
   * NEVER `span.fixtureBounds.first.jdTdb` (2461041.5).
   *
   * The two differ by 69.184 s and are one field apart in the same artifact.
   * segmentWindows' jdToIsoDate (segment-windows.ts:94-96) formats a TDB
   * Julian date as if it were UTC, dropping that offset. Over the DEC-17-2
   * locked grid the requested.start anchor yields 0 flipped dates of 731
   * columns (closest approach column 243, 118.356 s before midnight, a
   * 49.172 s margin); the fixtureBounds.first anchor flips columns 0 and 730
   * immediately. Verified by re-derivation in the G-A2 audit
   * (tools/s17-ga12-audit-2026-08-07/ORCHESTRATOR_VERIFICATION.md, U-2).
   */
  readonly depStartJdTdb: number;
  readonly depEndJdTdb: number;
  readonly nDep: number;
  readonly nTof: number;
  readonly tofMinDays: number;
  readonly tofMaxDays: number;
  readonly M: number;
  readonly thresholdMode: 'relative' | 'absolute';
  /** Δ above the live grid minimum; 5 km²/s² per DEC-17-8. Injected, not defaulted. */
  readonly deltaKm2S2: number;
  /**
   * D-03 — the disclosed feasibility boundary, read at runtime from
   * LambertScreenCacheMetadata.feasibleC3MaxKm2S2 (DEC-17-5 rider (a)).
   * Required, so the segment-windows DEFAULT_ABSOLUTE_KM2S2 literal — which
   * that module's own header says must never ship — can never be reached
   * through this layer.
   */
  readonly absoluteKm2S2: number;
  /** Ranking qualifier B_min in departure cells; 2 per DEC-17-8. Injected. */
  readonly bMinCells: number;
  /**
   * DEC-17-10 — Earth ephemeris fixture bounds, READ at runtime from the
   * loaded series, never hardcoded. Only the DEPARTURE window is validated:
   * computePorkchopGrid reads the Earth series solely at departure
   * (grid-compute.ts:177) and propagates the target analytically from orbital
   * elements at arrival (grid-compute.ts:186), touching no fixture. Arrival
   * epochs legitimately exceed the last sample.
   */
  readonly earthSpanJdTdb: {
    readonly firstSample: number;
    readonly lastSample: number;
  };
  readonly vehicle: LaunchVehicle;
  readonly dvBudget: SpacecraftDvBudget;
  readonly missionMode?: MissionMode;
}

/** D-04 — provenance echo. Every field is read from the computation that
 * produced the numbers, so A4 never prints a literal. `liveMin` is required
 * by BOTH the DEC-17-5 relative-threshold provenance line and the AMENDMENT A2
 * breadth copy rule; grid geometry alone is insufficient. */
export interface CompareEcho {
  /** Live grid minimum C3 over converged finite cells; null when none exists. */
  readonly liveMin: number | null;
  readonly deltaKm2S2: number;
  readonly absoluteKm2S2: number;
  readonly nDep: number;
  readonly nTof: number;
  /** (depEnd - depStart) / (nDep - 1) — the A2 sampling interval. */
  readonly depCellDays: number;
}

export interface CompareBodyOk {
  readonly ok: true;
  readonly bodyId: string;
  readonly grid: {
    readonly cells: readonly PorkchopCell[];
    readonly computeMs: number;
  };
  readonly segmentation: SegmentWindowsResult;
  /** Delivered mass at bestPractical.c3; null on NO-PRACTICAL-WINDOW — never a
   * fabricated number for a body with no practical window. */
  readonly deliveredMass: DeliveredMassResult | null;
  readonly echo: CompareEcho;
}

export type CompareRefusalReason =
  | 'out-of-bounds'
  | 'no-convergence'
  | 'cap-exceeded';

export interface CompareBodyRefusal {
  readonly ok: false;
  readonly bodyId: string;
  readonly reason: CompareRefusalReason;
  /** Human-readable specifics. A4 renders PER REASON; this is supporting
   * detail, not the rendered message. */
  readonly detail: string;
}

export type CompareBodyResult = CompareBodyOk | CompareBodyRefusal;

/**
 * D-01 — INDEX-ORDER LOCK.
 *
 * The two layouts are TRANSPOSES of each other, and the transpose is invisible
 * to segmentWindows' own validator because it checks only
 * `cells.length === nDep * nTof`, and at the DEC-17-2 locked resolution
 * 731 * 100 === 100 * 731.
 *
 *   grid-compute.ts:175-221  departure loop OUTER, TOF loop INNER, single
 *                            sequential cellIndex  =>  index = depIdx * nTof + tofIdx
 *                            (TOF varies fastest; confirmed by its consumers at
 *                            porkchop-view.ts:265 and :629)
 *   segment-windows.ts:33    "departure varies fastest: index = depIdx + nDep * tofIdx"
 *
 * Both are row-major, but of transposed matrices — grid-compute is row-major
 * over [dep][tof], segment-windows is row-major over [tof][dep]. Feeding one
 * to the other element-wise leaves minC3 and cellCount CORRECT (both invariant
 * under any relabelling that preserves the member set) while silently
 * corrupting breadthCells, breadthDays, tofSpanDays and argmin.dateIso — i.e.
 * everything Slice 17 exists to produce. A spot-check of the global minimum
 * would pass.
 *
 * This function performs the remap explicitly. tests/v2-compare-data.test.mjs
 * locks it with an ASYMMETRIC grid (nDep !== nTof) whose single component spans
 * departure columns only; under a transpose that test reports breadthCells 1
 * instead of 4 and fails.
 */
export function toSegmentGrid(
  cells: readonly PorkchopCell[],
  geometry: {
    readonly nDep: number;
    readonly nTof: number;
    readonly depStartJd: number;
    readonly depCellDays: number;
    readonly tofMinDays: number;
    readonly tofCellDays: number;
  },
): SegmentGrid {
  const { nDep, nTof } = geometry;
  if (cells.length !== nDep * nTof) {
    throw new Error(
      `grid shape mismatch: nDep ${nDep} × nTof ${nTof} != cells.length ${cells.length}`,
    );
  }
  const out = new Array<SegmentGridCell>(nDep * nTof);
  for (let depIdx = 0; depIdx < nDep; depIdx += 1) {
    for (let tofIdx = 0; tofIdx < nTof; tofIdx += 1) {
      // read grid-compute layout            write segment-windows layout
      out[depIdx + nDep * tofIdx] = toSegmentCell(cells[depIdx * nTof + tofIdx]);
    }
  }
  return {
    nDep,
    nTof,
    depStartJd: geometry.depStartJd,
    depCellDays: geometry.depCellDays,
    tofMinDays: geometry.tofMinDays,
    tofCellDays: geometry.tofCellDays,
    cells: out,
  };
}

/** A cell is a hole unless it solved AND has a selected branch. Non-finite c3
 * is left as-is: segmentWindows applies its own finiteness rule (DEC-17-1). */
function toSegmentCell(cell: PorkchopCell | undefined): SegmentGridCell {
  if (!cell || cell.status !== 'ok' || cell.selectedBranch === null) {
    return { c3: null, converged: false };
  }
  const branch = cell.branches[cell.selectedBranch];
  if (!branch) {
    return { c3: null, converged: false };
  }
  return { c3: branch.c3, converged: branch.converged };
}

/** Cell widths use the (N-1) convention — AMENDMENT A2, and the same convention
 * grid-compute's buildLinspace uses (grid-compute.ts:72). */
function cellWidth(start: number, end: number, count: number): number {
  return count <= 1 ? 0 : (end - start) / (count - 1);
}

/**
 * Serial, cap-enforced compare data layer. Input order is preserved in the
 * output, and computation is strictly sequential (DEC-17-6) — the result is
 * deterministic for a given input.
 *
 * Bodies beyond COMPARE_BODY_CAP are refused individually with
 * 'cap-exceeded' rather than throwing, so a caller bug degrades to a
 * renderable refusal instead of losing the work already done on the first 5.
 */
export function computeCompareData(
  bodies: readonly CompareBodyInput[],
  params: CompareDataParams,
  deps: PorkchopEphemerisDependencies,
): readonly CompareBodyResult[] {
  const depCellDays = cellWidth(params.depStartJdTdb, params.depEndJdTdb, params.nDep);
  const tofCellDays = cellWidth(params.tofMinDays, params.tofMaxDays, params.nTof);
  const results: CompareBodyResult[] = [];

  for (const [index, body] of bodies.entries()) {
    if (index >= COMPARE_BODY_CAP) {
      results.push({
        ok: false,
        bodyId: body.bodyId,
        reason: 'cap-exceeded',
        detail:
          `compare is capped at ${COMPARE_BODY_CAP} bodies (DEC-17-6); ` +
          `'${body.bodyId}' is selection ${index + 1} of ${bodies.length}`,
      });
      continue;
    }

    // DEC-17-10: validate the DEPARTURE window against the runtime-read Earth
    // series bounds and refuse. Validation, not clamping.
    if (
      params.depStartJdTdb < params.earthSpanJdTdb.firstSample ||
      params.depEndJdTdb > params.earthSpanJdTdb.lastSample
    ) {
      results.push({
        ok: false,
        bodyId: body.bodyId,
        reason: 'out-of-bounds',
        detail:
          `requested departure window JD TDB ${params.depStartJdTdb}–${params.depEndJdTdb} ` +
          `falls outside the Earth ephemeris span ` +
          `${params.earthSpanJdTdb.firstSample}–${params.earthSpanJdTdb.lastSample}`,
      });
      continue;
    }

    const gridResult = computePorkchopGrid(
      body.bodyElements,
      {
        depStartJD: params.depStartJdTdb,
        depEndJD: params.depEndJdTdb,
        tofMinDays: params.tofMinDays,
        tofMaxDays: params.tofMaxDays,
        nDep: params.nDep,
        nTof: params.nTof,
      },
      params.M,
      deps,
    );

    const segmentGrid = toSegmentGrid(gridResult.cells, {
      nDep: params.nDep,
      nTof: params.nTof,
      depStartJd: params.depStartJdTdb,
      depCellDays,
      tofMinDays: params.tofMinDays,
      tofCellDays,
    });

    // D-04: liveMin is measured directly rather than back-derived as
    // (threshold - Δ). The forward identity liveMin + Δ === threshold is
    // float-exact on the fixture bodies, but the inverse is not guaranteed to
    // round-trip, and this value is displayed.
    const measuredLiveMin = liveGridMin(segmentGrid.cells);
    const liveMin = Number.isFinite(measuredLiveMin) ? measuredLiveMin : null;

    if (liveMin === null) {
      results.push({
        ok: false,
        bodyId: body.bodyId,
        reason: 'no-convergence',
        detail:
          `no converged cell with a finite C3 in the ${params.nDep}×${params.nTof} grid; ` +
          `no live minimum exists, so no threshold can be resolved`,
      });
      continue;
    }

    const segmentation = segmentWindows(segmentGrid, {
      thresholdMode: params.thresholdMode,
      deltaKm2S2: params.deltaKm2S2,
      absoluteKm2S2: params.absoluteKm2S2,
      connectivity: 8,
      bMinCells: params.bMinCells,
    });

    const deliveredMass: DeliveredMassResult | null =
      segmentation.bestPractical === null
        ? null
        : deliveredMassKg(
            params.vehicle,
            segmentation.bestPractical.c3,
            params.dvBudget,
            params.missionMode ?? 'one-way',
          );

    results.push({
      ok: true,
      bodyId: body.bodyId,
      grid: { cells: gridResult.cells, computeMs: gridResult.compute_ms },
      segmentation,
      deliveredMass,
      echo: {
        liveMin,
        deltaKm2S2: params.deltaKm2S2,
        absoluteKm2S2: params.absoluteKm2S2,
        nDep: params.nDep,
        nTof: params.nTof,
        depCellDays,
      },
    });
  }

  return results;
}
