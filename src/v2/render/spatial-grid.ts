import * as THREE from 'three';

export interface SpatialGridCellIndex {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

// Phase A2.0 (May 2026): the original 8 AU planning guess collapsed 10,007 of
// the 10,008 Slice 8 asteroids into one central cell. The real fixture needed
// a finer grid before cell-as-mesh culling had any leverage, so the measured
// production choice is 1 AU cells over the same +-28 AU heliocentric cube.
export const SPATIAL_GRID_CELL_SIZE_AU = 1;
export const SPATIAL_GRID_BOUNDS_AU = 28;

const AU_KM = 149_597_870.7;
const SPATIAL_GRID_CELL_SIZE_KM = SPATIAL_GRID_CELL_SIZE_AU * AU_KM;
const SPATIAL_GRID_BOUNDS_KM = SPATIAL_GRID_BOUNDS_AU * AU_KM;
const SPATIAL_GRID_DIMENSION = (SPATIAL_GRID_BOUNDS_AU * 2) / SPATIAL_GRID_CELL_SIZE_AU;
const SPATIAL_GRID_MIN_INDEX = -SPATIAL_GRID_BOUNDS_AU / SPATIAL_GRID_CELL_SIZE_AU;
const SPATIAL_GRID_MAX_INDEX = SPATIAL_GRID_MIN_INDEX + SPATIAL_GRID_DIMENSION - 1;

if (!Number.isInteger(SPATIAL_GRID_DIMENSION) || SPATIAL_GRID_DIMENSION <= 0) {
  throw new Error('Spatial grid dimensions must resolve to a positive integer');
}
if (!Number.isInteger(SPATIAL_GRID_MIN_INDEX) || !Number.isInteger(SPATIAL_GRID_MAX_INDEX)) {
  throw new Error('Spatial grid index bounds must resolve to integers');
}

function coordinateToIndex(coordinateKm: number): number | null {
  if (!Number.isFinite(coordinateKm)) {
    return null;
  }
  if (coordinateKm < -SPATIAL_GRID_BOUNDS_KM || coordinateKm >= SPATIAL_GRID_BOUNDS_KM) {
    return null;
  }

  const zeroBasedIndex = Math.floor((coordinateKm + SPATIAL_GRID_BOUNDS_KM) / SPATIAL_GRID_CELL_SIZE_KM);
  return zeroBasedIndex + SPATIAL_GRID_MIN_INDEX;
}

export function cellIndexForPositionKm(positionKm: THREE.Vector3): SpatialGridCellIndex | null {
  const x = coordinateToIndex(positionKm.x);
  const y = coordinateToIndex(positionKm.y);
  const z = coordinateToIndex(positionKm.z);
  if (x === null || y === null || z === null) {
    return null;
  }
  return { x, y, z };
}

export function cellKeyForIndex(index: SpatialGridCellIndex): string {
  return `${index.x}_${index.y}_${index.z}`;
}

export function cellBoundsKmForIndex(index: SpatialGridCellIndex): THREE.Box3 {
  if (
    index.x < SPATIAL_GRID_MIN_INDEX || index.x > SPATIAL_GRID_MAX_INDEX ||
    index.y < SPATIAL_GRID_MIN_INDEX || index.y > SPATIAL_GRID_MAX_INDEX ||
    index.z < SPATIAL_GRID_MIN_INDEX || index.z > SPATIAL_GRID_MAX_INDEX
  ) {
    throw new RangeError(`Spatial grid index ${cellKeyForIndex(index)} is outside the configured bounds`);
  }

  const min = new THREE.Vector3(
    -SPATIAL_GRID_BOUNDS_KM + (index.x - SPATIAL_GRID_MIN_INDEX) * SPATIAL_GRID_CELL_SIZE_KM,
    -SPATIAL_GRID_BOUNDS_KM + (index.y - SPATIAL_GRID_MIN_INDEX) * SPATIAL_GRID_CELL_SIZE_KM,
    -SPATIAL_GRID_BOUNDS_KM + (index.z - SPATIAL_GRID_MIN_INDEX) * SPATIAL_GRID_CELL_SIZE_KM,
  );
  const max = min.clone().addScalar(SPATIAL_GRID_CELL_SIZE_KM);
  return new THREE.Box3(min, max);
}

export function* iterateAllPossibleCells(): IterableIterator<SpatialGridCellIndex> {
  for (let x = SPATIAL_GRID_MIN_INDEX; x <= SPATIAL_GRID_MAX_INDEX; x += 1) {
    for (let y = SPATIAL_GRID_MIN_INDEX; y <= SPATIAL_GRID_MAX_INDEX; y += 1) {
      for (let z = SPATIAL_GRID_MIN_INDEX; z <= SPATIAL_GRID_MAX_INDEX; z += 1) {
        yield { x, y, z };
      }
    }
  }
}
