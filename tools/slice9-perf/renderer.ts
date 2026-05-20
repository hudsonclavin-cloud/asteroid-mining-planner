import * as THREE from 'three';

export interface Slice9PerfPartitionLeafCell {
  readonly key: string;
  readonly boundsKm: {
    readonly min: { readonly x: number; readonly y: number; readonly z: number };
    readonly max: { readonly x: number; readonly y: number; readonly z: number };
  };
  readonly bodyIndices: readonly number[];
}

export interface Slice9PerfRenderableBody {
  readonly bodyId: string;
  readonly renderRadiusM: number;
}

export interface Slice9PerfRendererStats {
  readonly occupiedLeafCells: number;
  readonly visibleLeafCells: number;
  readonly visibleBodies: number;
  readonly maxLeafBodies: number;
}

interface CellEntry {
  readonly key: string;
  readonly boundsCanonicalM: THREE.Box3;
  readonly boundsRelativeM: THREE.Box3;
  readonly bodyIndices: readonly number[];
  readonly mesh: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;
}

const METERS_PER_KILOMETER = 1000;

export class Slice9PerfCellRenderer {
  readonly root = new THREE.Group();

  private readonly bodies: readonly Slice9PerfRenderableBody[];
  private readonly geometry = new THREE.SphereGeometry(1, 14, 14);
  private readonly material = new THREE.MeshLambertMaterial({ color: 0x8fb4d9 });
  private readonly frustum = new THREE.Frustum();
  private readonly projectionMatrix = new THREE.Matrix4();
  private readonly frustumTranslation = new THREE.Vector3();
  private readonly instanceMatrix = new THREE.Matrix4();
  private readonly instancePosition = new THREE.Vector3();
  private readonly instanceQuaternion = new THREE.Quaternion();
  private readonly instanceScale = new THREE.Vector3();
  private readonly cells: CellEntry[] = [];
  private visibleLeafCells = 0;
  private visibleBodies = 0;
  private maxLeafBodies = 0;

  constructor(bodies: readonly Slice9PerfRenderableBody[]) {
    this.bodies = bodies.slice();
    this.root.name = 'slice9-perf-cell-renderer-root';
  }

  rebuild(cells: readonly Slice9PerfPartitionLeafCell[]): void {
    for (const cell of this.cells) {
      this.root.remove(cell.mesh);
    }
    this.cells.length = 0;
    this.maxLeafBodies = 0;

    for (const cell of cells) {
      const mesh = new THREE.InstancedMesh(
        this.geometry,
        this.material,
        cell.bodyIndices.length,
      );
      mesh.name = `slice9-perf-cell-${cell.key}`;
      mesh.count = 0;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const entry: CellEntry = {
        key: cell.key,
        boundsCanonicalM: new THREE.Box3(
          new THREE.Vector3(
            cell.boundsKm.min.x * METERS_PER_KILOMETER,
            cell.boundsKm.min.y * METERS_PER_KILOMETER,
            cell.boundsKm.min.z * METERS_PER_KILOMETER,
          ),
          new THREE.Vector3(
            cell.boundsKm.max.x * METERS_PER_KILOMETER,
            cell.boundsKm.max.y * METERS_PER_KILOMETER,
            cell.boundsKm.max.z * METERS_PER_KILOMETER,
          ),
        ),
        boundsRelativeM: new THREE.Box3(),
        bodyIndices: cell.bodyIndices.slice(),
        mesh,
      };
      this.maxLeafBodies = Math.max(this.maxLeafBodies, entry.bodyIndices.length);
      this.cells.push(entry);
      this.root.add(mesh);
    }
  }

  update(
    positionsM: Float64Array,
    anchorPositionM: { readonly x: number; readonly y: number; readonly z: number },
    camera: THREE.Camera,
  ): void {
    this.projectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projectionMatrix);
    this.frustumTranslation.set(-anchorPositionM.x, -anchorPositionM.y, -anchorPositionM.z);

    let visibleCells = 0;
    let visibleBodies = 0;

    for (const cell of this.cells) {
      cell.boundsRelativeM.copy(cell.boundsCanonicalM).translate(this.frustumTranslation);
      const inFrustum = this.frustum.intersectsBox(cell.boundsRelativeM);
      if (!inFrustum) {
        cell.mesh.visible = false;
        cell.mesh.count = 0;
        continue;
      }

      let instanceCount = 0;
      for (const bodyIndex of cell.bodyIndices) {
        const offset = bodyIndex * 3;
        this.instancePosition.set(
          positionsM[offset] - anchorPositionM.x,
          positionsM[offset + 1] - anchorPositionM.y,
          positionsM[offset + 2] - anchorPositionM.z,
        );
        this.instanceScale.setScalar(this.bodies[bodyIndex].renderRadiusM);
        this.instanceMatrix.compose(
          this.instancePosition,
          this.instanceQuaternion,
          this.instanceScale,
        );
        cell.mesh.setMatrixAt(instanceCount, this.instanceMatrix);
        instanceCount += 1;
      }

      cell.mesh.count = instanceCount;
      cell.mesh.visible = instanceCount > 0;
      cell.mesh.instanceMatrix.needsUpdate = instanceCount > 0;
      if (instanceCount > 0) {
        visibleCells += 1;
        visibleBodies += instanceCount;
      }
    }

    this.visibleLeafCells = visibleCells;
    this.visibleBodies = visibleBodies;
    this.root.updateMatrixWorld(true);
  }

  getStats(): Slice9PerfRendererStats {
    return {
      occupiedLeafCells: this.cells.length,
      visibleLeafCells: this.visibleLeafCells,
      visibleBodies: this.visibleBodies,
      maxLeafBodies: this.maxLeafBodies,
    };
  }

  dispose(): void {
    for (const cell of this.cells) {
      this.root.remove(cell.mesh);
    }
    this.cells.length = 0;
    this.geometry.dispose();
    this.material.dispose();
  }
}
