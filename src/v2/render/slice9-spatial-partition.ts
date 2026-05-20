export interface Slice9SpatialPointKm {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Slice9SpatialCellIndex {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Slice9SpatialBoundsKm {
  readonly min: Slice9SpatialPointKm;
  readonly max: Slice9SpatialPointKm;
}

export interface Slice9UniformPartitionCell {
  readonly key: string;
  readonly index: Slice9SpatialCellIndex;
  readonly boundsKm: Slice9SpatialBoundsKm;
  readonly bodyIndices: readonly number[];
}

export interface Slice9UniformPartitionSummary {
  readonly totalBodies: number;
  readonly occupiedCellCount: number;
  readonly maxBodiesPerCell: number;
}

export interface Slice9UniformPartitionResult {
  readonly strategy: 'uniform';
  readonly cellSizeAu: number;
  readonly cellSizeKm: number;
  readonly cells: readonly Slice9UniformPartitionCell[];
  readonly cellsByKey: ReadonlyMap<string, Slice9UniformPartitionCell>;
  readonly summary: Slice9UniformPartitionSummary;
}

export interface Slice9HybridPartitionSubCell {
  readonly key: string;
  readonly localIndex: Slice9SpatialCellIndex;
  readonly boundsKm: Slice9SpatialBoundsKm;
  readonly bodyIndices: readonly number[];
}

export interface Slice9HybridPartitionCoarseCell {
  readonly key: string;
  readonly index: Slice9SpatialCellIndex;
  readonly boundsKm: Slice9SpatialBoundsKm;
  readonly bodyIndices: readonly number[];
  readonly isSubPartitioned: boolean;
  readonly subCells: readonly Slice9HybridPartitionSubCell[];
}

export interface Slice9HybridPartitionSummary {
  readonly totalBodies: number;
  readonly coarseCellCount: number;
  readonly subPartitionedCoarseCellCount: number;
  readonly subCellCount: number;
  readonly leafCellCount: number;
  readonly maxLeafBodiesPerCell: number;
}

export interface Slice9HybridPartitionResult {
  readonly strategy: 'hybrid';
  readonly coarseCellSizeAu: number;
  readonly coarseCellSizeKm: number;
  readonly fineCellSizeAu: number;
  readonly fineCellSizeKm: number;
  readonly densityTrigger: number;
  readonly coarseCells: readonly Slice9HybridPartitionCoarseCell[];
  readonly coarseCellsByKey: ReadonlyMap<string, Slice9HybridPartitionCoarseCell>;
  readonly leafCells: readonly (Slice9HybridPartitionCoarseCell | Slice9HybridPartitionSubCell)[];
  readonly summary: Slice9HybridPartitionSummary;
}

const AU_KM = 149_597_870.7;

function assertFiniteCoordinate(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Slice 9 spatial partition expected finite ${label}`);
  }
}

function assertPoint(point: Slice9SpatialPointKm, label: string): void {
  assertFiniteCoordinate(point.x, `${label}.x`);
  assertFiniteCoordinate(point.y, `${label}.y`);
  assertFiniteCoordinate(point.z, `${label}.z`);
}

function cellIndexForCoordinate(coordinateKm: number, cellSizeKm: number): number {
  return Math.floor(coordinateKm / cellSizeKm);
}

function boundsForIndex(index: Slice9SpatialCellIndex, cellSizeKm: number): Slice9SpatialBoundsKm {
  return {
    min: {
      x: index.x * cellSizeKm,
      y: index.y * cellSizeKm,
      z: index.z * cellSizeKm,
    },
    max: {
      x: (index.x + 1) * cellSizeKm,
      y: (index.y + 1) * cellSizeKm,
      z: (index.z + 1) * cellSizeKm,
    },
  };
}

export function slice9SpatialCellKeyForIndex(index: Slice9SpatialCellIndex): string {
  return `${index.x}_${index.y}_${index.z}`;
}

export function slice9SpatialCellIndexForPositionKm(
  positionKm: Slice9SpatialPointKm,
  cellSizeAu: number,
): Slice9SpatialCellIndex {
  assertPoint(positionKm, 'positionKm');
  if (!Number.isFinite(cellSizeAu) || cellSizeAu <= 0) {
    throw new Error(`Slice 9 spatial partition expected positive cellSizeAu, received ${cellSizeAu}`);
  }

  const cellSizeKm = cellSizeAu * AU_KM;
  return {
    x: cellIndexForCoordinate(positionKm.x, cellSizeKm),
    y: cellIndexForCoordinate(positionKm.y, cellSizeKm),
    z: cellIndexForCoordinate(positionKm.z, cellSizeKm),
  };
}

export function partitionSlice9UniformPositions(
  positionsKm: readonly Slice9SpatialPointKm[],
  cellSizeAu: number,
): Slice9UniformPartitionResult {
  const cellSizeKm = cellSizeAu * AU_KM;
  if (!Number.isFinite(cellSizeAu) || cellSizeAu <= 0) {
    throw new Error(`Slice 9 uniform partition expected positive cellSizeAu, received ${cellSizeAu}`);
  }

  const buckets = new Map<string, { index: Slice9SpatialCellIndex; bodyIndices: number[] }>();

  for (const [bodyIndex, positionKm] of positionsKm.entries()) {
    const index = slice9SpatialCellIndexForPositionKm(positionKm, cellSizeAu);
    const key = slice9SpatialCellKeyForIndex(index);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.bodyIndices.push(bodyIndex);
    } else {
      buckets.set(key, { index, bodyIndices: [bodyIndex] });
    }
  }

  const cells = [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      index: bucket.index,
      boundsKm: boundsForIndex(bucket.index, cellSizeKm),
      bodyIndices: Object.freeze(bucket.bodyIndices.slice()),
    }))
    .sort((left, right) => left.key.localeCompare(right.key, 'en', { numeric: true }));

  const cellsByKey = new Map(cells.map((cell) => [cell.key, cell]));
  const maxBodiesPerCell = cells.reduce(
    (maxBodies, cell) => Math.max(maxBodies, cell.bodyIndices.length),
    0,
  );

  return {
    strategy: 'uniform',
    cellSizeAu,
    cellSizeKm,
    cells,
    cellsByKey,
    summary: {
      totalBodies: positionsKm.length,
      occupiedCellCount: cells.length,
      maxBodiesPerCell,
    },
  };
}

function localSubIndexForCoordinate(
  coordinateKm: number,
  minCoordinateKm: number,
  fineCellSizeKm: number,
  divisionsPerAxis: number,
): number {
  const rawIndex = Math.floor((coordinateKm - minCoordinateKm) / fineCellSizeKm);
  if (rawIndex < 0) return 0;
  if (rawIndex >= divisionsPerAxis) return divisionsPerAxis - 1;
  return rawIndex;
}

export function partitionSlice9HybridPositions(
  positionsKm: readonly Slice9SpatialPointKm[],
  options: {
    readonly coarseCellSizeAu: number;
    readonly fineCellSizeAu: number;
    readonly densityTrigger: number;
  },
): Slice9HybridPartitionResult {
  const { coarseCellSizeAu, fineCellSizeAu, densityTrigger } = options;
  if (!Number.isFinite(coarseCellSizeAu) || coarseCellSizeAu <= 0) {
    throw new Error(`Slice 9 hybrid partition expected positive coarseCellSizeAu, received ${coarseCellSizeAu}`);
  }
  if (!Number.isFinite(fineCellSizeAu) || fineCellSizeAu <= 0) {
    throw new Error(`Slice 9 hybrid partition expected positive fineCellSizeAu, received ${fineCellSizeAu}`);
  }
  if (!Number.isFinite(densityTrigger) || densityTrigger <= 0) {
    throw new Error(`Slice 9 hybrid partition expected positive densityTrigger, received ${densityTrigger}`);
  }

  const coarseCellSizeKm = coarseCellSizeAu * AU_KM;
  const fineCellSizeKm = fineCellSizeAu * AU_KM;
  const divisionsPerAxis = coarseCellSizeAu / fineCellSizeAu;
  if (!Number.isInteger(divisionsPerAxis) || divisionsPerAxis <= 0) {
    throw new Error(
      `Slice 9 hybrid partition requires coarseCellSizeAu / fineCellSizeAu to be a positive integer; received ${coarseCellSizeAu} / ${fineCellSizeAu}`,
    );
  }

  const coarseBuckets = new Map<string, { index: Slice9SpatialCellIndex; bodyIndices: number[] }>();

  for (const [bodyIndex, positionKm] of positionsKm.entries()) {
    const index = slice9SpatialCellIndexForPositionKm(positionKm, coarseCellSizeAu);
    const key = slice9SpatialCellKeyForIndex(index);
    const bucket = coarseBuckets.get(key);
    if (bucket) {
      bucket.bodyIndices.push(bodyIndex);
    } else {
      coarseBuckets.set(key, { index, bodyIndices: [bodyIndex] });
    }
  }

  const coarseCells: Slice9HybridPartitionCoarseCell[] = [];
  const leafCells: Array<Slice9HybridPartitionCoarseCell | Slice9HybridPartitionSubCell> = [];
  let subPartitionedCoarseCellCount = 0;
  let subCellCount = 0;

  for (const [key, bucket] of [...coarseBuckets.entries()].sort(([left], [right]) =>
    left.localeCompare(right, 'en', { numeric: true }),
  )) {
    const coarseBoundsKm = boundsForIndex(bucket.index, coarseCellSizeKm);
    const isSubPartitioned = bucket.bodyIndices.length > densityTrigger;
    const subCells: Slice9HybridPartitionSubCell[] = [];

    if (isSubPartitioned) {
      subPartitionedCoarseCellCount += 1;
      const localBuckets = new Map<string, { localIndex: Slice9SpatialCellIndex; bodyIndices: number[] }>();

      for (const bodyIndex of bucket.bodyIndices) {
        const positionKm = positionsKm[bodyIndex];
        const localIndex = {
          x: localSubIndexForCoordinate(
            positionKm.x,
            coarseBoundsKm.min.x,
            fineCellSizeKm,
            divisionsPerAxis,
          ),
          y: localSubIndexForCoordinate(
            positionKm.y,
            coarseBoundsKm.min.y,
            fineCellSizeKm,
            divisionsPerAxis,
          ),
          z: localSubIndexForCoordinate(
            positionKm.z,
            coarseBoundsKm.min.z,
            fineCellSizeKm,
            divisionsPerAxis,
          ),
        };
        const localKey = `${localIndex.x}_${localIndex.y}_${localIndex.z}`;
        const localBucket = localBuckets.get(localKey);
        if (localBucket) {
          localBucket.bodyIndices.push(bodyIndex);
        } else {
          localBuckets.set(localKey, { localIndex, bodyIndices: [bodyIndex] });
        }
      }

      for (const [localKey, localBucket] of [...localBuckets.entries()].sort(([left], [right]) =>
        left.localeCompare(right, 'en', { numeric: true }),
      )) {
        const subCell = {
          key: `${key}::${localKey}`,
          localIndex: localBucket.localIndex,
          boundsKm: {
            min: {
              x: coarseBoundsKm.min.x + localBucket.localIndex.x * fineCellSizeKm,
              y: coarseBoundsKm.min.y + localBucket.localIndex.y * fineCellSizeKm,
              z: coarseBoundsKm.min.z + localBucket.localIndex.z * fineCellSizeKm,
            },
            max: {
              x: coarseBoundsKm.min.x + (localBucket.localIndex.x + 1) * fineCellSizeKm,
              y: coarseBoundsKm.min.y + (localBucket.localIndex.y + 1) * fineCellSizeKm,
              z: coarseBoundsKm.min.z + (localBucket.localIndex.z + 1) * fineCellSizeKm,
            },
          },
          bodyIndices: Object.freeze(localBucket.bodyIndices.slice()),
        } satisfies Slice9HybridPartitionSubCell;
        subCells.push(subCell);
        leafCells.push(subCell);
      }
      subCellCount += subCells.length;
    } else {
      leafCells.push({
        key,
        index: bucket.index,
        boundsKm: coarseBoundsKm,
        bodyIndices: Object.freeze(bucket.bodyIndices.slice()),
        isSubPartitioned: false,
        subCells: Object.freeze([]),
      } satisfies Slice9HybridPartitionCoarseCell);
    }

    coarseCells.push({
      key,
      index: bucket.index,
      boundsKm: coarseBoundsKm,
      bodyIndices: Object.freeze(bucket.bodyIndices.slice()),
      isSubPartitioned,
      subCells: Object.freeze(subCells),
    });
  }

  const maxLeafBodiesPerCell = leafCells.reduce((maxBodies, cell) => {
    const bodyCount = cell.bodyIndices.length;
    return Math.max(maxBodies, bodyCount);
  }, 0);

  const coarseCellsByKey = new Map(coarseCells.map((cell) => [cell.key, cell]));

  return {
    strategy: 'hybrid',
    coarseCellSizeAu,
    coarseCellSizeKm,
    fineCellSizeAu,
    fineCellSizeKm,
    densityTrigger,
    coarseCells,
    coarseCellsByKey,
    leafCells,
    summary: {
      totalBodies: positionsKm.length,
      coarseCellCount: coarseCells.length,
      subPartitionedCoarseCellCount,
      subCellCount,
      leafCellCount: leafCells.length,
      maxLeafBodiesPerCell,
    },
  };
}
