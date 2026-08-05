// UNAUDITED — Slice 17 G-A2 multi-agent audit PENDING.
// Per SLICE_17_FOUNDING.md §4, nothing outside tests may import
// this module until G-A2 closes with 0 HIGH findings.
//
// A1 window-extraction module (DEC-17-1, DEC-17-8; S-S17-A1-2026-08-05-A).
// Pure module: no imports from app/ or view code — the compare view is the
// intended consumer AFTER audit; unit tests are the only consumer now.
//
// An "opportunity" is a connected component (8-connectivity, LOCKED) of grid
// cells whose selected branch is converged AND whose c3 <= T, ties at T
// inclusive (DEC-17-1). Non-converged cells and null-c3 cells are holes:
// excluded from membership, and they may split components. There is NO
// separate minimum-component-size rule — B_min (DEC-17-8, default 2 cells)
// excludes single-cell components from the practical set, deliberately.
// Breadth is quantized at the departure cell: breadthCells is measured on the
// grid, breadthDays is DERIVED as (breadthCells - 1) * depCellDays and never
// carries finer precision than the cell (DEC-17-1 / DEC-17-8).

export interface SegmentGridCell {
  /** Selected-branch departure C3 in km²/s²; null = no value (hole). */
  c3: number | null;
  converged: boolean;
}

export interface SegmentGrid {
  nDep: number;
  nTof: number;
  /** JD (TDB) of departure column 0. */
  depStartJd: number;
  depCellDays: number;
  tofMinDays: number;
  tofCellDays: number;
  /** Row-major, departure varies fastest: index = depIdx + nDep * tofIdx. */
  cells: SegmentGridCell[];
}

export interface SegmentParams {
  thresholdMode: 'relative' | 'absolute';
  /** Relative-mode delta above the live grid minimum. Default 5 (DEC-17-8). */
  deltaKm2S2?: number;
  /** Absolute-mode threshold. Default 25, the disclosed screen boundary. */
  absoluteKm2S2?: number;
  /** conn8 is LOCKED (DEC-17-1); 4-connectivity is not implemented. */
  connectivity?: 8;
  /** Ranking qualifier B_min in departure cells. Default 2 (DEC-17-8). */
  bMinCells?: number;
}

export interface WindowArgmin {
  depJd: number;
  /** UTC calendar date derived from the TDB JD; the ~69 s TDB−UTC offset can
   * shift dates only within 69 s of midnight. */
  dateIso: string;
  tofDays: number;
}

export interface WindowComponent {
  minC3: number;
  argmin: WindowArgmin;
  breadthCells: number;
  /** Derived: (breadthCells - 1) * depCellDays. */
  breadthDays: number;
  cellCount: number;
  /** Derived: (tof-index span) * tofCellDays. */
  tofSpanDays: number;
}

export interface ResolvedThreshold {
  mode: 'relative' | 'absolute';
  /** The T actually used. In relative mode on a grid with no eligible cell
   * this is Infinity (no live minimum exists; nothing is a member). */
  valueKm2S2: number;
}

export interface SegmentWindowsResult {
  /** All components, sorted ascending by minC3. */
  components: WindowComponent[];
  /** components with breadthCells >= bMinCells, order preserved. */
  practical: WindowComponent[];
  /** First practical component, or null = NO-PRACTICAL-WINDOW (DEC-17-3). */
  bestPractical: { c3: number; argmin: WindowArgmin } | null;
  threshold: ResolvedThreshold;
}

export const DEFAULT_DELTA_KM2S2 = 5;
/**
 * Fallback only. DEC-17-5 rider (a): the compare surface must disclose the
 * feasibility boundary from a runtime read of metadata.feasibleC3MaxKm2S2 —
 * the post-audit consumer MUST inject that value, never ship this literal.
 */
export const DEFAULT_ABSOLUTE_KM2S2 = 25;
export const DEFAULT_B_MIN_CELLS = 2;

function jdToIsoDate(jd: number): string {
  return new Date((jd - 2440587.5) * 86_400_000).toISOString().slice(0, 10);
}

/** Ascending minC3; deterministic tie-break on earlier departure, then TOF. */
export function compareByMinC3(a: WindowComponent, b: WindowComponent): number {
  if (a.minC3 !== b.minC3) {
    return a.minC3 - b.minC3;
  }
  if (a.argmin.depJd !== b.argmin.depJd) {
    return a.argmin.depJd - b.argmin.depJd;
  }
  return a.argmin.tofDays - b.argmin.tofDays;
}

/**
 * The live grid minimum: min c3 over converged, finite, non-null cells.
 * Infinity when no such cell exists.
 */
export function liveGridMin(cells: readonly SegmentGridCell[]): number {
  let min = Infinity;
  for (const cell of cells) {
    if (cell.converged && cell.c3 !== null && Number.isFinite(cell.c3) && cell.c3 < min) {
      min = cell.c3;
    }
  }
  return min;
}

export function resolveThreshold(
  liveMin: number,
  params: SegmentParams,
): ResolvedThreshold {
  if (params.thresholdMode === 'relative') {
    const delta = params.deltaKm2S2 ?? DEFAULT_DELTA_KM2S2;
    return { mode: 'relative', valueKm2S2: liveMin + delta };
  }
  return {
    mode: 'absolute',
    valueKm2S2: params.absoluteKm2S2 ?? DEFAULT_ABSOLUTE_KM2S2,
  };
}

/**
 * B_min classification (DEC-17-8), separated from segmentation so the
 * artifact's component summaries can exercise it directly — the committed
 * measurement artifact stores summaries, not per-cell grids.
 *
 * bestPractical is the true minimum-C3 practical component (DEC-17-3), found
 * by scan — input order does not matter. `practical` preserves input order.
 */
export function classifyComponents(
  components: readonly WindowComponent[],
  bMinCells: number,
): {
  practical: WindowComponent[];
  bestPractical: { c3: number; argmin: WindowArgmin } | null;
} {
  const practical = components.filter((c) => c.breadthCells >= bMinCells);
  let best: WindowComponent | null = null;
  for (const component of practical) {
    if (best === null || component.minC3 < best.minC3) {
      best = component;
    }
  }
  return {
    practical,
    bestPractical: best === null ? null : { c3: best.minC3, argmin: best.argmin },
  };
}

const NEIGHBOR_OFFSETS_8: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

export function segmentWindows(
  grid: SegmentGrid,
  params: SegmentParams,
): SegmentWindowsResult {
  const connectivity = params.connectivity ?? 8;
  if (connectivity !== 8) {
    throw new Error(
      `connectivity ${connectivity} not implemented: conn8 is LOCKED (DEC-17-1)`,
    );
  }
  const { nDep, nTof, cells } = grid;
  if (
    !Number.isInteger(nDep) ||
    !Number.isInteger(nTof) ||
    nDep < 0 ||
    nTof < 0 ||
    cells.length !== nDep * nTof
  ) {
    throw new Error(
      `grid shape mismatch: nDep ${nDep} × nTof ${nTof} != cells.length ${cells.length}`,
    );
  }
  const bMinCells = params.bMinCells ?? DEFAULT_B_MIN_CELLS;
  const threshold = resolveThreshold(liveGridMin(cells), params);
  const T = threshold.valueKm2S2;

  // Membership mask: converged AND c3 finite non-null AND c3 <= T (ties
  // inclusive). Non-finite c3 (NaN/Infinity) is a hole like null — otherwise
  // an all-Infinity grid under relative mode (T = Infinity) would emit a
  // garbage component instead of no members.
  const member = new Uint8Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.converged && cell.c3 !== null && Number.isFinite(cell.c3) && cell.c3 <= T) {
      member[i] = 1;
    }
  }

  const visited = new Uint8Array(cells.length);
  const stack: number[] = [];
  const components: WindowComponent[] = [];

  for (let seed = 0; seed < cells.length; seed++) {
    if (!member[seed] || visited[seed]) {
      continue;
    }
    visited[seed] = 1;
    stack.push(seed);
    let minC3 = Infinity;
    let argDep = -1;
    let argTof = -1;
    let minDep = Infinity;
    let maxDep = -Infinity;
    let minTof = Infinity;
    let maxTof = -Infinity;
    let cellCount = 0;

    while (stack.length > 0) {
      const idx = stack.pop() as number;
      const depIdx = idx % nDep;
      const tofIdx = (idx - depIdx) / nDep;
      cellCount += 1;
      const c3 = cells[idx].c3 as number;
      if (
        c3 < minC3 ||
        (c3 === minC3 && (depIdx < argDep || (depIdx === argDep && tofIdx < argTof)))
      ) {
        minC3 = c3;
        argDep = depIdx;
        argTof = tofIdx;
      }
      if (depIdx < minDep) minDep = depIdx;
      if (depIdx > maxDep) maxDep = depIdx;
      if (tofIdx < minTof) minTof = tofIdx;
      if (tofIdx > maxTof) maxTof = tofIdx;

      for (const [dDep, dTof] of NEIGHBOR_OFFSETS_8) {
        const nDepIdx = depIdx + dDep;
        const nTofIdx = tofIdx + dTof;
        if (nDepIdx < 0 || nDepIdx >= nDep || nTofIdx < 0 || nTofIdx >= nTof) {
          continue;
        }
        const nIdx = nDepIdx + nDep * nTofIdx;
        if (member[nIdx] && !visited[nIdx]) {
          visited[nIdx] = 1;
          stack.push(nIdx);
        }
      }
    }

    const breadthCells = maxDep - minDep + 1;
    const depJd = grid.depStartJd + argDep * grid.depCellDays;
    components.push({
      minC3,
      argmin: {
        depJd,
        dateIso: jdToIsoDate(depJd),
        tofDays: grid.tofMinDays + argTof * grid.tofCellDays,
      },
      breadthCells,
      breadthDays: (breadthCells - 1) * grid.depCellDays,
      cellCount,
      tofSpanDays: (maxTof - minTof) * grid.tofCellDays,
    });
  }

  components.sort(compareByMinC3);
  const { practical, bestPractical } = classifyComponents(components, bMinCells);
  return { components, practical, bestPractical, threshold };
}
