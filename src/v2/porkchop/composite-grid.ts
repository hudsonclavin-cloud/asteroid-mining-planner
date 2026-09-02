/**
 * DEC-5 "both" composite: merge the M=0 and M=1 grids into the single grid the
 * dedicated view renders in its default state.
 *
 * DEC-5 (`src/v2/SLICE_11_FOUNDING.md:105`): "Dedicated view: M=0/M=1 toggle is
 * prominent. Selecting M=1 replaces the heatmap with the M=1 grid; selecting
 * "both" overlays them (semi-transparent layers). Default state is "both" so the
 * 28% gap is visible immediately."
 *
 * Selection rule (per cell):
 *   - both families solve  -> strictly lower selected-branch C3 wins; an EXACT tie
 *                             goes to M=0 (the family the screening cache screens,
 *                             and the shorter mission at equal departure energy).
 *   - one family solves    -> that family's cell.
 *   - neither solves       -> no_solution, EXCEPT that a `stall` is preserved:
 *                             SLICE_11_FOUNDING.md:207 rules "`stall` — a branch
 *                             failed to converge though a solution should exist;
 *                             render distinctly, never collapse silently into
 *                             `no_solution`."
 *
 * AMD-2 (`:213-215`) is honored by construction: the per-cell C3 compared here is
 * the worker's own `selectedBranch` C3 — the departure-C3-selected branch — not a
 * heliocentric-energy choice. This module never re-selects a branch.
 *
 * Provenance: each cell already carries its own `M` (`grid-compute.ts:47`), so the
 * composited cell IS the winning family's cell and `cell.M` names the family that
 * produced it. That is what INV-016b's "users must be able to identify which
 * solution branch each visible window belongs to" needs the UI to surface.
 */

/** The minimum cell shape this module reads. Both `PorkchopCell` and `PorkchopWorkerCell` satisfy it. */
export interface CompositableCell {
  readonly depJD: number;
  readonly tofDays: number;
  readonly status: 'ok' | 'no_solution' | 'stall';
  readonly M: number;
  readonly selectedBranch: number | null;
  readonly branches: readonly { readonly c3: number }[];
}

export interface CompositeCounts {
  readonly total: number;
  /** Cells taken from the M=0 grid because it solved and won (or tied). */
  readonly fromM0: number;
  /** Cells taken from the M=1 grid because it solved and won. */
  readonly fromM1: number;
  /** Cells where both families solved and M=0's C3 was strictly lower. */
  readonly m0Won: number;
  /** Cells where both families solved and M=1's C3 was strictly lower. */
  readonly m1Won: number;
  /** Cells where both families solved to the SAME float64 C3. Expected ~0; a real count is a signal, not a pass. */
  readonly exactTies: number;
  /** Cells only M=0 solved — the measured defect: previously rendered no_solution. */
  readonly onlyM0: number;
  /** Cells only M=1 solved. */
  readonly onlyM1: number;
  /** Cells neither family solved. */
  readonly neither: number;
  /** Of `neither`, cells preserved as `stall` rather than collapsed to `no_solution` (:207). */
  readonly neitherStall: number;
}

export interface CompositeGridResult<C extends CompositableCell> {
  readonly cells: readonly C[];
  readonly counts: CompositeCounts;
}

/** Selected-branch C3 for a cell, or null when the cell has no converged selection. */
export function selectedC3(cell: CompositableCell): number | null {
  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return null;
  }
  const c3 = cell.branches[cell.selectedBranch]?.c3;
  return typeof c3 === 'number' && Number.isFinite(c3) ? c3 : null;
}

/**
 * Composite the two family grids. The grids must be index-aligned — same length,
 * same (depJD, tofDays) per index — which holds when both were computed from the
 * same `gridParams`. A mismatch throws rather than silently mis-pairing cells.
 */
export function compositeGrids<C extends CompositableCell>(
  m0Cells: readonly C[],
  m1Cells: readonly C[],
): CompositeGridResult<C> {
  if (m0Cells.length !== m1Cells.length) {
    throw new RangeError(
      `compositeGrids: grid length mismatch (M=0 has ${m0Cells.length}, M=1 has ${m1Cells.length})`,
    );
  }

  const cells = new Array<C>(m0Cells.length);
  let fromM0 = 0;
  let fromM1 = 0;
  let m0Won = 0;
  let m1Won = 0;
  let exactTies = 0;
  let onlyM0 = 0;
  let onlyM1 = 0;
  let neither = 0;
  let neitherStall = 0;

  for (let index = 0; index < m0Cells.length; index += 1) {
    const a = m0Cells[index];
    const b = m1Cells[index];

    if (a.depJD !== b.depJD || a.tofDays !== b.tofDays) {
      throw new RangeError(
        `compositeGrids: grid misalignment at index ${index} ` +
          `(M=0 depJD ${a.depJD} tof ${a.tofDays}; M=1 depJD ${b.depJD} tof ${b.tofDays})`,
      );
    }

    const c0 = selectedC3(a);
    const c1 = selectedC3(b);

    if (c0 !== null && c1 !== null) {
      if (c0 === c1) {
        exactTies += 1;
      }
      // Strictly lower wins; an exact tie goes to M=0.
      if (c0 <= c1) {
        if (c0 < c1) {
          m0Won += 1;
        }
        cells[index] = a;
        fromM0 += 1;
      } else {
        m1Won += 1;
        cells[index] = b;
        fromM1 += 1;
      }
      continue;
    }

    if (c0 !== null) {
      onlyM0 += 1;
      cells[index] = a;
      fromM0 += 1;
      continue;
    }

    if (c1 !== null) {
      onlyM1 += 1;
      cells[index] = b;
      fromM1 += 1;
      continue;
    }

    // Neither family solved. Preserve a `stall` over a `no_solution` (:207).
    neither += 1;
    if (a.status === 'stall') {
      neitherStall += 1;
      cells[index] = a;
      fromM0 += 1;
    } else if (b.status === 'stall') {
      neitherStall += 1;
      cells[index] = b;
      fromM1 += 1;
    } else {
      cells[index] = a;
      fromM0 += 1;
    }
  }

  return {
    cells,
    counts: {
      total: m0Cells.length,
      fromM0,
      fromM1,
      m0Won,
      m1Won,
      exactTies,
      onlyM0,
      onlyM1,
      neither,
      neitherStall,
    },
  };
}

/** Minimum selected-branch C3 over a grid, with the cell that produced it. Null when nothing solved. */
export function minSelectedC3<C extends CompositableCell>(
  cells: readonly C[],
): { readonly c3: number; readonly cell: C } | null {
  let best: { c3: number; cell: C } | null = null;
  for (const cell of cells) {
    const c3 = selectedC3(cell);
    if (c3 === null) {
      continue;
    }
    if (best === null || c3 < best.c3) {
      best = { c3, cell };
    }
  }
  return best;
}

/** One extreme of a grid: the cell, its selected-branch C3, and the array index that broke ties. */
export interface GridExtremeEntry<C extends CompositableCell> {
  readonly c3: number;
  readonly cell: C;
  readonly index: number;
}

/**
 * Facts about a displayed grid. The empty case is its own variant rather than null
 * fields, so a consumer cannot render a blank or a fabricated value by forgetting a
 * check: in the `extremes` variant both entries are always present.
 */
export type GridExtremes<C extends CompositableCell> =
  | { readonly kind: 'no-solvable-cells'; readonly okCount: 0 }
  | {
      readonly kind: 'extremes';
      readonly okCount: number;
      readonly minimum: GridExtremeEntry<C>;
      readonly maximum: GridExtremeEntry<C>;
    };

/**
 * Lowest and highest selected-branch C3 over a grid.
 *
 * Only `ok` cells participate — `no_solution` and `stall` are excluded, via the same
 * `selectedC3` filter used everywhere else in this module.
 *
 * Ties: strict `<` / `>` means the LOWEST ARRAY INDEX wins. Index is
 * `depIdx * nTof + tofIdx`, so an exact C3 tie resolves to the earliest departure and
 * then the shortest TOF.
 *
 * NOTE — a second minimum implementation exists: `findGlobalMinimumCell` in
 * `porkchop-view.ts:468`, which feeds the tour anchor and the `onGlobalMinimumCellChange`
 * contract. It is deliberately NOT refactored away (tour-critical path, zero functional
 * gain). Both are ok-only and both use strict `<`, so both pick the same cell; this
 * comment exists so the duplication is recorded rather than silently grown to a third.
 */
export function gridExtremes<C extends CompositableCell>(cells: readonly C[]): GridExtremes<C> {
  let minimum: GridExtremeEntry<C> | null = null;
  let maximum: GridExtremeEntry<C> | null = null;
  let okCount = 0;

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const c3 = selectedC3(cell);
    if (c3 === null) {
      continue;
    }
    okCount += 1;
    if (minimum === null || c3 < minimum.c3) {
      minimum = { c3, cell, index };
    }
    if (maximum === null || c3 > maximum.c3) {
      maximum = { c3, cell, index };
    }
  }

  if (minimum === null || maximum === null) {
    return { kind: 'no-solvable-cells', okCount: 0 };
  }
  return { kind: 'extremes', okCount, minimum, maximum };
}
