import * as THREE from 'three';
import { METERS_PER_KILOMETER, type AsteroidBody } from '../core/index.js';
import { ASTEROID_MAIN_BELT_COLOR_HEX } from './asteroid-points-shader.js';
import {
  SPATIAL_GRID_BOUNDS_AU,
  SPATIAL_GRID_CELL_SIZE_AU,
  cellBoundsKmForIndex,
  cellIndexForPositionKm,
  cellKeyForIndex,
  type SpatialGridCellIndex,
} from './spatial-grid.js';

export interface AsteroidCellRendererViewport {
  readonly width: number;
  readonly height: number;
}

export interface AsteroidCellIntersection {
  readonly bodyIndex: number;
  readonly distance: number;
}

export interface AsteroidCellStats {
  readonly totalCells: number;
  readonly occupiedCells: number;
  readonly visibleCells: number;
  readonly visibleBodies: number;
}

interface AsteroidCellEntry {
  readonly index: SpatialGridCellIndex;
  readonly key: string;
  readonly mesh: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
  readonly boundsCanonicalM: THREE.Box3;
  readonly boundsRelativeM: THREE.Box3;
  readonly bodyIndices: number[];
  readonly visibleBodyIndices: number[];
}

const SPATIAL_GRID_TOTAL_CELLS =
  ((SPATIAL_GRID_BOUNDS_AU * 2) / SPATIAL_GRID_CELL_SIZE_AU) ** 3;
const AU_M = 149_597_870_700;
const GRID_MIN_KM = -SPATIAL_GRID_BOUNDS_AU * 149_597_870.7;
const GRID_MAX_KM = SPATIAL_GRID_BOUNDS_AU * 149_597_870.7;
const REASSIGNMENT_INTERVAL_FRAMES = 60;
const FRUSTUM_CULL_MARGIN_M = SPATIAL_GRID_CELL_SIZE_AU * AU_M * 0.05;

function isIndexWithinGrid(index: SpatialGridCellIndex): boolean {
  const minIndex = -SPATIAL_GRID_BOUNDS_AU / SPATIAL_GRID_CELL_SIZE_AU;
  const maxIndex = minIndex + (SPATIAL_GRID_BOUNDS_AU * 2) / SPATIAL_GRID_CELL_SIZE_AU - 1;
  return (
    index.x >= minIndex && index.x <= maxIndex &&
    index.y >= minIndex && index.y <= maxIndex &&
    index.z >= minIndex && index.z <= maxIndex
  );
}

function intersectRayWithGridKm(ray: THREE.Ray): { tMin: number; tMax: number } | null {
  let tMin = -Infinity;
  let tMax = Infinity;

  const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
  for (const axis of axes) {
    const origin = ray.origin[axis];
    const direction = ray.direction[axis];
    const min = GRID_MIN_KM;
    const max = GRID_MAX_KM;

    if (Math.abs(direction) < 1e-12) {
      if (origin < min || origin > max) {
        return null;
      }
      continue;
    }

    const inv = 1 / direction;
    let axisT0 = (min - origin) * inv;
    let axisT1 = (max - origin) * inv;
    if (axisT0 > axisT1) {
      [axisT0, axisT1] = [axisT1, axisT0];
    }
    tMin = Math.max(tMin, axisT0);
    tMax = Math.min(tMax, axisT1);
    if (tMax < tMin) {
      return null;
    }
  }

  return { tMin, tMax };
}

export class AsteroidCellRenderer {
  private readonly asteroids: readonly AsteroidBody[];
  private readonly root = new THREE.Group();
  private readonly instancedGeometry = new THREE.SphereGeometry(1, 16, 16);
  private readonly instancedMaterial = new THREE.MeshLambertMaterial({
    color: ASTEROID_MAIN_BELT_COLOR_HEX,
  });
  private readonly cellsByKey = new Map<string, AsteroidCellEntry>();
  private readonly occupiedCells: AsteroidCellEntry[] = [];
  private readonly instancedBodyMask: boolean[];
  private readonly currentAnchorPositionM = new THREE.Vector3();
  private readonly frustum = new THREE.Frustum();
  private readonly projectionMatrix = new THREE.Matrix4();
  private readonly instanceMatrix = new THREE.Matrix4();
  private readonly instancePosition = new THREE.Vector3();
  private readonly instanceQuaternion = new THREE.Quaternion();
  private readonly instanceScale = new THREE.Vector3();
  private readonly frustumTranslation = new THREE.Vector3();
  private readonly canonicalRay = new THREE.Ray();
  private readonly canonicalRayOriginKm = new THREE.Vector3();
  private readonly canonicalRayDirectionKm = new THREE.Vector3();
  private readonly raycastHelper = new THREE.Raycaster();
  private readonly traversalPositionKm = new THREE.Vector3();
  private readonly lastCanonicalPositionsM: THREE.Vector3[];
  private readonly cellKeyByBodyIndex: string[];
  private frameCounter = 0;
  private visibleCells = 0;
  private visibleBodies = 0;

  constructor(catalogBodies: readonly AsteroidBody[]) {
    if (catalogBodies.length === 0) {
      throw new Error('AsteroidCellRenderer requires at least one asteroid body');
    }

    this.asteroids = catalogBodies.slice();
    this.root.name = 'asteroid-cell-renderer-root';
    this.instancedBodyMask = new Array(catalogBodies.length).fill(true);
    this.cellKeyByBodyIndex = new Array(catalogBodies.length).fill('');
    this.lastCanonicalPositionsM = catalogBodies.map((asteroid) => new THREE.Vector3(
      asteroid.anchorState.positionM.x,
      asteroid.anchorState.positionM.y,
      asteroid.anchorState.positionM.z,
    ));
    this.rebuildCells(this.lastCanonicalPositionsM);
  }

  setAnchorPositionM(anchorPositionM: { x: number; y: number; z: number }): void {
    this.currentAnchorPositionM.set(anchorPositionM.x, anchorPositionM.y, anchorPositionM.z);
  }

  setInstancedBodyIndices(bodyIndices: readonly number[]): void {
    this.instancedBodyMask.fill(false);
    for (const bodyIndex of bodyIndices) {
      if (bodyIndex < 0 || bodyIndex >= this.asteroids.length) {
        throw new RangeError(`Asteroid body index ${bodyIndex} is outside the renderer catalog`);
      }
      this.instancedBodyMask[bodyIndex] = true;
    }
  }

  update(
    propagatedPositionsM: readonly THREE.Vector3[],
    camera: THREE.Camera,
    _viewport: AsteroidCellRendererViewport,
  ): void {
    if (propagatedPositionsM.length !== this.asteroids.length) {
      throw new Error(
        `AsteroidCellRenderer expected ${this.asteroids.length} propagated positions, received ${propagatedPositionsM.length}`,
      );
    }

    this.frameCounter += 1;
    if (this.frameCounter % REASSIGNMENT_INTERVAL_FRAMES === 0) {
      this.rebuildCellsIfAssignmentsChanged(propagatedPositionsM);
    }

    const canFrustumCull =
      camera.projectionMatrix instanceof THREE.Matrix4 &&
      camera.matrixWorldInverse instanceof THREE.Matrix4;
    if (canFrustumCull) {
      this.projectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      this.frustum.setFromProjectionMatrix(this.projectionMatrix);
    }
    this.frustumTranslation.set(
      -this.currentAnchorPositionM.x,
      -this.currentAnchorPositionM.y,
      -this.currentAnchorPositionM.z,
    );

    let visibleCells = 0;
    let visibleBodies = 0;

    for (const cell of this.occupiedCells) {
      cell.boundsRelativeM
        .copy(cell.boundsCanonicalM)
        .translate(this.frustumTranslation)
        .expandByScalar(FRUSTUM_CULL_MARGIN_M);
      const inFrustum = canFrustumCull ? this.frustum.intersectsBox(cell.boundsRelativeM) : true;
      if (!inFrustum) {
        cell.mesh.visible = false;
        cell.mesh.count = 0;
        cell.visibleBodyIndices.length = 0;
        continue;
      }

      let instanceCount = 0;
      for (const bodyIndex of cell.bodyIndices) {
        if (!this.instancedBodyMask[bodyIndex]) {
          continue;
        }

        const canonical = propagatedPositionsM[bodyIndex];
        this.instancePosition.set(
          canonical.x - this.currentAnchorPositionM.x,
          canonical.y - this.currentAnchorPositionM.y,
          canonical.z - this.currentAnchorPositionM.z,
        );
        this.instanceScale.setScalar(this.asteroids[bodyIndex].estimatedRadiusM);
        this.instanceMatrix.compose(
          this.instancePosition,
          this.instanceQuaternion,
          this.instanceScale,
        );
        cell.mesh.setMatrixAt(instanceCount, this.instanceMatrix);
        cell.visibleBodyIndices[instanceCount] = bodyIndex;
        instanceCount += 1;
      }

      cell.visibleBodyIndices.length = instanceCount;
      cell.mesh.count = instanceCount;
      cell.mesh.visible = instanceCount > 0;
      cell.mesh.instanceMatrix.needsUpdate = instanceCount > 0;

      if (instanceCount > 0) {
        visibleCells += 1;
        visibleBodies += instanceCount;
      }
    }

    this.visibleCells = visibleCells;
    this.visibleBodies = visibleBodies;
    this.root.updateMatrixWorld(true);
  }

  raycastIntersectCells(ray: THREE.Ray): AsteroidCellIntersection | null {
    const anchorKm = this.currentAnchorPositionM.clone().divideScalar(METERS_PER_KILOMETER);
    this.canonicalRayOriginKm.copy(ray.origin).divideScalar(METERS_PER_KILOMETER).add(anchorKm);
    this.canonicalRayDirectionKm.copy(ray.direction);
    this.canonicalRay.set(this.canonicalRayOriginKm, this.canonicalRayDirectionKm);

    const intersectionRange = intersectRayWithGridKm(this.canonicalRay);
    if (!intersectionRange) {
      return null;
    }

    const startT = Math.max(intersectionRange.tMin, 0);
    this.traversalPositionKm.copy(this.canonicalRayDirectionKm).multiplyScalar(startT).add(this.canonicalRayOriginKm);
    const startIndex = cellIndexForPositionKm(this.traversalPositionKm);
    if (!startIndex) {
      return null;
    }

    const stepX = Math.sign(this.canonicalRayDirectionKm.x);
    const stepY = Math.sign(this.canonicalRayDirectionKm.y);
    const stepZ = Math.sign(this.canonicalRayDirectionKm.z);

    let currentIndex = { ...startIndex };
    let currentT = startT;
    let bestHit: AsteroidCellIntersection | null = null;
    const boundsKm = cellBoundsKmForIndex(currentIndex);
    let nextBoundaryX = stepX > 0 ? boundsKm.max.x : boundsKm.min.x;
    let nextBoundaryY = stepY > 0 ? boundsKm.max.y : boundsKm.min.y;
    let nextBoundaryZ = stepZ > 0 ? boundsKm.max.z : boundsKm.min.z;
    let tMaxX = stepX === 0 ? Number.POSITIVE_INFINITY : currentT + (nextBoundaryX - this.traversalPositionKm.x) / this.canonicalRayDirectionKm.x;
    let tMaxY = stepY === 0 ? Number.POSITIVE_INFINITY : currentT + (nextBoundaryY - this.traversalPositionKm.y) / this.canonicalRayDirectionKm.y;
    let tMaxZ = stepZ === 0 ? Number.POSITIVE_INFINITY : currentT + (nextBoundaryZ - this.traversalPositionKm.z) / this.canonicalRayDirectionKm.z;
    const tDeltaX = stepX === 0 ? Number.POSITIVE_INFINITY : (SPATIAL_GRID_CELL_SIZE_AU * 149_597_870.7) / Math.abs(this.canonicalRayDirectionKm.x);
    const tDeltaY = stepY === 0 ? Number.POSITIVE_INFINITY : (SPATIAL_GRID_CELL_SIZE_AU * 149_597_870.7) / Math.abs(this.canonicalRayDirectionKm.y);
    const tDeltaZ = stepZ === 0 ? Number.POSITIVE_INFINITY : (SPATIAL_GRID_CELL_SIZE_AU * 149_597_870.7) / Math.abs(this.canonicalRayDirectionKm.z);

    this.raycastHelper.ray.copy(ray);

    for (let steps = 0; steps < SPATIAL_GRID_TOTAL_CELLS && currentT <= intersectionRange.tMax; steps += 1) {
      const cell = this.cellsByKey.get(cellKeyForIndex(currentIndex));
      if (cell && cell.mesh.visible && cell.mesh.count > 0) {
        const intersections = this.raycastHelper.intersectObject(cell.mesh, false);
        for (const intersection of intersections) {
          if (typeof intersection.instanceId !== 'number') {
            continue;
          }
          const bodyIndex = cell.visibleBodyIndices[intersection.instanceId];
          if (typeof bodyIndex !== 'number') {
            continue;
          }
          if (!bestHit || intersection.distance < bestHit.distance) {
            bestHit = {
              bodyIndex,
              distance: intersection.distance,
            };
          }
        }
        if (bestHit) {
          return bestHit;
        }
      }

      if (tMaxX <= tMaxY && tMaxX <= tMaxZ) {
        currentIndex = { ...currentIndex, x: currentIndex.x + stepX };
        currentT = tMaxX;
        tMaxX += tDeltaX;
      } else if (tMaxY <= tMaxX && tMaxY <= tMaxZ) {
        currentIndex = { ...currentIndex, y: currentIndex.y + stepY };
        currentT = tMaxY;
        tMaxY += tDeltaY;
      } else {
        currentIndex = { ...currentIndex, z: currentIndex.z + stepZ };
        currentT = tMaxZ;
        tMaxZ += tDeltaZ;
      }

      if (!isIndexWithinGrid(currentIndex)) {
        break;
      }
    }

    return bestHit;
  }

  getRootGroup(): THREE.Group {
    return this.root;
  }

  getCellAtKey(key: string): {
    readonly index: SpatialGridCellIndex;
    readonly mesh: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
    readonly bodyIndices: readonly number[];
    readonly visibleBodyIndices: readonly number[];
  } | undefined {
    const cell = this.cellsByKey.get(key);
    if (!cell) {
      return undefined;
    }

    return {
      index: { ...cell.index },
      mesh: cell.mesh,
      bodyIndices: cell.bodyIndices.slice(),
      visibleBodyIndices: cell.visibleBodyIndices.slice(),
    };
  }

  getCellStats(): AsteroidCellStats {
    return {
      totalCells: SPATIAL_GRID_TOTAL_CELLS,
      occupiedCells: this.occupiedCells.length,
      visibleCells: this.visibleCells,
      visibleBodies: this.visibleBodies,
    };
  }

  getOccupiedCellKeys(): readonly string[] {
    return this.occupiedCells.map((cell) => cell.key);
  }

  getPrimaryMesh(): THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshLambertMaterial> {
    if (this.occupiedCells.length === 0) {
      throw new Error('AsteroidCellRenderer has no occupied cells');
    }
    return this.occupiedCells[0].mesh;
  }

  dispose(): void {
    for (const cell of this.occupiedCells) {
      this.root.remove(cell.mesh);
    }
    this.cellsByKey.clear();
    this.occupiedCells.length = 0;
    this.instancedGeometry.dispose();
    this.instancedMaterial.dispose();
  }

  private rebuildCellsIfAssignmentsChanged(positionsM: readonly THREE.Vector3[]): void {
    let changed = false;
    for (let bodyIndex = 0; bodyIndex < positionsM.length; bodyIndex += 1) {
      const positionKm = positionsM[bodyIndex].clone().divideScalar(METERS_PER_KILOMETER);
      const nextIndex = cellIndexForPositionKm(positionKm);
      if (!nextIndex) {
        throw new Error(`Asteroid ${this.asteroids[bodyIndex].bodyId} propagated outside the configured Slice 8 grid`);
      }
      this.lastCanonicalPositionsM[bodyIndex].copy(positionsM[bodyIndex]);
      const currentCell = this.findCellForBodyIndex(bodyIndex);
      const nextKey = cellKeyForIndex(nextIndex);
      if (currentCell !== nextKey) {
        changed = true;
      }
    }

    if (changed) {
      this.rebuildCells(positionsM);
    }
  }

  private rebuildCells(positionsM: readonly THREE.Vector3[]): void {
    for (const cell of this.occupiedCells) {
      this.root.remove(cell.mesh);
    }
    this.cellsByKey.clear();
    this.occupiedCells.length = 0;

    const groupedBodies = new Map<string, { index: SpatialGridCellIndex; bodyIndices: number[] }>();
    for (let bodyIndex = 0; bodyIndex < positionsM.length; bodyIndex += 1) {
      this.lastCanonicalPositionsM[bodyIndex].copy(positionsM[bodyIndex]);
      const positionKm = positionsM[bodyIndex].clone().divideScalar(METERS_PER_KILOMETER);
      const index = cellIndexForPositionKm(positionKm);
      if (!index) {
        throw new Error(`Asteroid ${this.asteroids[bodyIndex].bodyId} is outside the configured Slice 8 spatial grid`);
      }
      const key = cellKeyForIndex(index);
      this.cellKeyByBodyIndex[bodyIndex] = key;
      const existing = groupedBodies.get(key);
      if (existing) {
        existing.bodyIndices.push(bodyIndex);
      } else {
        groupedBodies.set(key, { index, bodyIndices: [bodyIndex] });
      }
    }

    const orderedCells = [...groupedBodies.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [key, grouped] of orderedCells) {
      const mesh = new THREE.InstancedMesh(
        this.instancedGeometry,
        this.instancedMaterial,
        grouped.bodyIndices.length,
      );
      mesh.name = `asteroid-cell-${key}`;
      mesh.count = 0;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const boundsKm = cellBoundsKmForIndex(grouped.index);
      const boundsCanonicalM = new THREE.Box3(
        boundsKm.min.clone().multiplyScalar(METERS_PER_KILOMETER),
        boundsKm.max.clone().multiplyScalar(METERS_PER_KILOMETER),
      );
      const cell: AsteroidCellEntry = {
        index: grouped.index,
        key,
        mesh,
        boundsCanonicalM,
        boundsRelativeM: boundsCanonicalM.clone(),
        bodyIndices: grouped.bodyIndices.slice(),
        visibleBodyIndices: [],
      };
      this.cellsByKey.set(key, cell);
      this.occupiedCells.push(cell);
      this.root.add(mesh);
    }
  }

  private findCellForBodyIndex(bodyIndex: number): string | null {
    return this.cellKeyByBodyIndex[bodyIndex] ?? null;
  }
}
