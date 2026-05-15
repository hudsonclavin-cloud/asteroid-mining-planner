import * as THREE from 'three';
import {
  hasOrbitLineForBody,
  type AsteroidBody,
  type AsteroidBodyId,
} from '../core/constants/asteroids.js';
import { propagateKeplerianState } from '../core/propagators/keplerian.js';
import { AsteroidCellRenderer, type AsteroidCellStats } from './asteroid-cell-renderer.js';
import {
  ASTEROID_CURATED_NEA_COLOR_HEX,
  createAsteroidPointsShaderMaterial,
  getAsteroidPointColor,
} from './asteroid-points-shader.js';
import {
  ASTEROID_ORBIT_HIGH_DETAIL_SEGMENTS,
  ASTEROID_ORBIT_MAIN_BELT_SEGMENTS,
  ASTEROID_ORBIT_BASE_OPACITY,
  createAsteroidOrbitBatch,
  createFocusedAsteroidOrbitLine,
  type AsteroidOrbitBatch,
  type AsteroidOrbitRange,
} from './asteroid-orbits.js';
import { sampleOrbitEllipse } from '../core/propagators/keplerian.js';

export const ASTEROID_POINTS_TO_INSTANCE_EXIT_DIAMETER_PX = 1.5;
export const ASTEROID_POINTS_TO_INSTANCE_ENTER_DIAMETER_PX = 2;
export const ASTEROID_INSTANCE_TO_MESH_EXIT_DIAMETER_PX = 28;
export const ASTEROID_INSTANCE_TO_MESH_ENTER_DIAMETER_PX = 32;
export const ASTEROID_ORBIT_FADE_START_DIAMETER_PX = ASTEROID_INSTANCE_TO_MESH_ENTER_DIAMETER_PX;
export const ASTEROID_ORBIT_FADE_END_DIAMETER_PX = 100;

export type AsteroidRenderMode = 'points' | 'instanced' | 'mesh';

export interface AsteroidRendererViewport {
  readonly width: number;
  readonly height: number;
}

export interface AsteroidRendererUpdateInput {
  readonly anchorPositionM: { x: number; y: number; z: number };
  readonly camera: THREE.PerspectiveCamera;
  readonly tdbSeconds: number;
  readonly viewport: AsteroidRendererViewport;
}

export function propagateAsteroidBodyState(
  asteroid: AsteroidBody,
  tdbSeconds: number,
): ReturnType<typeof propagateKeplerianState> {
  return propagateKeplerianState(asteroid.elements, tdbSeconds, {
    radiusM: asteroid.estimatedRadiusM,
  });
}

export function computeApparentDiameterPx(
  radiusM: number,
  distanceM: number,
  viewportHeightPx: number,
  fovRad: number,
): number {
  if (!Number.isFinite(radiusM) || radiusM <= 0) {
    throw new RangeError('radiusM must be a finite positive number');
  }
  if (!Number.isFinite(distanceM) || distanceM <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  if (!Number.isFinite(viewportHeightPx) || viewportHeightPx <= 0) {
    throw new RangeError('viewportHeightPx must be a finite positive number');
  }
  if (!Number.isFinite(fovRad) || fovRad <= 0) {
    throw new RangeError('fovRad must be a finite positive number');
  }

  return 2 * Math.atan(radiusM / distanceM) * (viewportHeightPx / fovRad);
}

export function classifyAsteroidRenderMode(
  apparentDiameterPx: number,
  previousMode: AsteroidRenderMode | null,
  isFocused: boolean,
): AsteroidRenderMode {
  if (isFocused) {
    if (previousMode === 'mesh') {
      return apparentDiameterPx >= ASTEROID_INSTANCE_TO_MESH_EXIT_DIAMETER_PX
        ? 'mesh'
        : 'instanced';
    }
    return apparentDiameterPx >= ASTEROID_INSTANCE_TO_MESH_ENTER_DIAMETER_PX
      ? 'mesh'
      : 'instanced';
  }

  if (previousMode === 'instanced') {
    return apparentDiameterPx >= ASTEROID_POINTS_TO_INSTANCE_EXIT_DIAMETER_PX
      ? 'instanced'
      : 'points';
  }

  return apparentDiameterPx >= ASTEROID_POINTS_TO_INSTANCE_ENTER_DIAMETER_PX
    ? 'instanced'
    : 'points';
}

export class AsteroidRenderer {
  readonly root = new THREE.Group();
  readonly orbitBatch: AsteroidOrbitBatch;
  readonly pointsGeometry: THREE.BufferGeometry;
  pointsMaterial: THREE.Material;
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.Material>;
  readonly cellRenderer: AsteroidCellRenderer;
  readonly focusedGeometry: THREE.SphereGeometry;
  readonly focusedMaterial: THREE.MeshLambertMaterial;
  readonly focusedMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial>;

  private readonly asteroids: readonly AsteroidBody[];
  private readonly asteroidById = new Map<AsteroidBodyId, AsteroidBody>();
  private readonly modeByBodyId = new Map<AsteroidBodyId, AsteroidRenderMode>();
  private readonly worldPositionByBodyId = new Map<AsteroidBodyId, THREE.Vector3>();
  private readonly canonicalPositionByBodyId = new Map<
    AsteroidBodyId,
    { x: number; y: number; z: number }
  >();
  private readonly pointBodyIds: AsteroidBodyId[] = [];
  private readonly instancedBodyIds: AsteroidBodyId[] = [];
  private readonly pointPositions: Float32Array;
  private readonly pointColors: Float32Array;
  private readonly pointBaseColors: Float32Array;
  private readonly pointSizes: Float32Array;
  private readonly pointPositionAttribute: THREE.BufferAttribute;
  private readonly pointColorAttribute: THREE.BufferAttribute;
  private readonly pointSizeAttribute: THREE.BufferAttribute;
  private readonly pointsBoundingSphere = new THREE.Sphere(new THREE.Vector3(), Number.POSITIVE_INFINITY);
  private readonly canonicalPositionsM: THREE.Vector3[] = [];
  private focusedAsteroidBodyId: AsteroidBodyId | null = null;
  private focusedMeshBodyId: AsteroidBodyId | null = null;
  private focusedOrbitLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
  private focusedOrbitBodyId: AsteroidBodyId | null = null;

  constructor(asteroids: readonly AsteroidBody[]) {
    if (asteroids.length === 0) {
      throw new Error('AsteroidRenderer requires at least one asteroid body');
    }

    this.asteroids = asteroids.slice();
    this.root.name = 'asteroid-renderer-root';
    this.orbitBatch = createAsteroidOrbitBatch(
      this.asteroids.filter((asteroid) => asteroid.hasOrbitLine ?? hasOrbitLineForBody(asteroid.H)),
    );
    this.orbitBatch.lineSegments.frustumCulled = false;
    this.root.add(this.orbitBatch.lineSegments);

    const maxBodies = asteroids.length;
    this.pointPositions = new Float32Array(maxBodies * 3);
    this.pointColors = new Float32Array(maxBodies * 3);
    this.pointBaseColors = new Float32Array(maxBodies * 3);
    this.pointSizes = new Float32Array(maxBodies);

    for (const [asteroidIndex, asteroid] of asteroids.entries()) {
      this.asteroidById.set(asteroid.bodyId, asteroid);
      this.modeByBodyId.set(asteroid.bodyId, 'points');
      this.worldPositionByBodyId.set(asteroid.bodyId, new THREE.Vector3());
      this.canonicalPositionByBodyId.set(asteroid.bodyId, { x: 0, y: 0, z: 0 });

      const color = getAsteroidPointColor(asteroid);
      const colorBase = asteroidIndex * 3;
      this.pointBaseColors[colorBase] = color.r;
      this.pointBaseColors[colorBase + 1] = color.g;
      this.pointBaseColors[colorBase + 2] = color.b;
    }

    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointPositionAttribute = new THREE.BufferAttribute(this.pointPositions, 3);
    this.pointColorAttribute = new THREE.BufferAttribute(this.pointColors, 3);
    this.pointSizeAttribute = new THREE.BufferAttribute(this.pointSizes, 1);
    this.pointPositionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.pointColorAttribute.setUsage(THREE.DynamicDrawUsage);
    this.pointSizeAttribute.setUsage(THREE.DynamicDrawUsage);
    this.pointsGeometry.setAttribute('position', this.pointPositionAttribute);
    this.pointsGeometry.setAttribute('color', this.pointColorAttribute);
    this.pointsGeometry.setAttribute('aSize', this.pointSizeAttribute);
    this.pointsGeometry.setDrawRange(0, 0);
    this.pointsGeometry.boundingSphere = this.pointsBoundingSphere;
    this.pointsMaterial = createAsteroidPointsShaderMaterial();
    this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    this.points.name = 'asteroid-points-layer';
    this.root.add(this.points);

    this.cellRenderer = new AsteroidCellRenderer(this.asteroids);
    this.root.add(this.cellRenderer.getRootGroup());

    this.focusedGeometry = new THREE.SphereGeometry(1, 24, 24);
    this.focusedMaterial = new THREE.MeshLambertMaterial({
      color: ASTEROID_CURATED_NEA_COLOR_HEX,
    });
    this.focusedMesh = new THREE.Mesh(this.focusedGeometry, this.focusedMaterial);
    this.focusedMesh.name = 'asteroid-focused-mesh';
    this.focusedMesh.visible = false;
    this.root.add(this.focusedMesh);
  }

  setFocusedAsteroid(bodyId: AsteroidBodyId | null): void {
    if (bodyId !== null && !this.asteroidById.has(bodyId)) {
      throw new Error(`Unknown asteroid body id "${bodyId}"`);
    }
    this.focusedAsteroidBodyId = bodyId;
  }

  getFocusedAsteroidBodyId(): AsteroidBodyId | null {
    return this.focusedAsteroidBodyId;
  }

  getFocusedMeshBodyId(): AsteroidBodyId | null {
    return this.focusedMeshBodyId;
  }

  getFocusedOrbitBodyId(): AsteroidBodyId | null {
    return this.focusedOrbitBodyId;
  }

  get instancedMesh(): THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshLambertMaterial> {
    return this.cellRenderer.getPrimaryMesh();
  }

  getMainOrbitOpacity(): number {
    return this.orbitBatch.material.opacity;
  }

  getAsteroidRenderMode(bodyId: AsteroidBodyId): AsteroidRenderMode {
    const mode = this.modeByBodyId.get(bodyId);
    if (!mode) {
      throw new Error(`Unknown asteroid body id "${bodyId}"`);
    }
    return mode;
  }

  getAsteroidWorldPosition(bodyId: AsteroidBodyId): THREE.Vector3 {
    const world = this.worldPositionByBodyId.get(bodyId);
    if (!world) {
      throw new Error(`Unknown asteroid body id "${bodyId}"`);
    }
    return world.clone();
  }

  getAsteroidCanonicalPosition(bodyId: AsteroidBodyId): { x: number; y: number; z: number } {
    const position = this.canonicalPositionByBodyId.get(bodyId);
    if (!position) {
      throw new Error(`Unknown asteroid body id "${bodyId}"`);
    }
    return { ...position };
  }

  getPointBodyIds(): readonly AsteroidBodyId[] {
    return this.pointBodyIds.slice();
  }

  getInstancedBodyIds(): readonly AsteroidBodyId[] {
    return this.instancedBodyIds.slice();
  }

  getCellStats(): AsteroidCellStats {
    return this.cellRenderer.getCellStats();
  }

  getRaycastTargets(): readonly THREE.Object3D[] {
    return [this.focusedMesh, this.points];
  }

  setPointsMaterial(material: THREE.Material): void {
    this.points.material = material;
    this.pointsMaterial.dispose();
    this.pointsMaterial = material;
  }

  resolveIntersection(intersection: THREE.Intersection): AsteroidBodyId | null {
    if (intersection.object === this.focusedMesh) {
      return this.focusedMeshBodyId;
    }

    if (intersection.object === this.points && typeof intersection.index === 'number') {
      return this.pointBodyIds[intersection.index] ?? null;
    }

    return null;
  }

  raycastIntersectCells(ray: THREE.Ray): AsteroidBodyId | null {
    const hit = this.cellRenderer.raycastIntersectCells(ray);
    if (!hit) {
      return null;
    }
    return this.asteroids[hit.bodyIndex]?.bodyId ?? null;
  }

  update(input: AsteroidRendererUpdateInput): void {
    const { anchorPositionM, camera, tdbSeconds, viewport } = input;
    const fovRad = (camera.fov * Math.PI) / 180;
    let pointCount = 0;
    let instanceCount = 0;
    let hasFocusedMesh = false;
    let focusedApparentDiameterPx = 0;
    let focusedRenderMode: AsteroidRenderMode | null = null;
    const instancedBodyIndices: number[] = [];
    this.pointBodyIds.length = 0;
    this.instancedBodyIds.length = 0;

    for (const [asteroidIndex, asteroid] of this.asteroids.entries()) {
      const propagated = propagateAsteroidBodyState(asteroid, tdbSeconds);
      if (!this.canonicalPositionsM[asteroidIndex]) {
        this.canonicalPositionsM[asteroidIndex] = new THREE.Vector3();
      }
      this.canonicalPositionsM[asteroidIndex].set(
        propagated.positionM.x,
        propagated.positionM.y,
        propagated.positionM.z,
      );
      const canonicalPosition = this.canonicalPositionByBodyId.get(asteroid.bodyId)!;
      canonicalPosition.x = propagated.positionM.x;
      canonicalPosition.y = propagated.positionM.y;
      canonicalPosition.z = propagated.positionM.z;

      const world = this.worldPositionByBodyId.get(asteroid.bodyId)!;
      world.set(
        propagated.positionM.x - anchorPositionM.x,
        propagated.positionM.y - anchorPositionM.y,
        propagated.positionM.z - anchorPositionM.z,
      );

      const distM = Math.hypot(
        world.x - camera.position.x,
        world.y - camera.position.y,
        world.z - camera.position.z,
      );
      const apparentDiameterPx = computeApparentDiameterPx(
        asteroid.estimatedRadiusM,
        distM,
        viewport.height,
        fovRad,
      );

      const nextMode = classifyAsteroidRenderMode(
        apparentDiameterPx,
        this.modeByBodyId.get(asteroid.bodyId) ?? null,
        asteroid.bodyId === this.focusedAsteroidBodyId,
      );
      this.modeByBodyId.set(asteroid.bodyId, nextMode);
      if (asteroid.bodyId === this.focusedAsteroidBodyId) {
        focusedApparentDiameterPx = apparentDiameterPx;
        focusedRenderMode = nextMode;
      }

      if (nextMode === 'points') {
        const pointBase = pointCount * 3;
        const sourceBase = asteroidIndex * 3;
        this.pointPositions[pointBase] = Math.fround(world.x);
        this.pointPositions[pointBase + 1] = Math.fround(world.y);
        this.pointPositions[pointBase + 2] = Math.fround(world.z);
        this.pointColors[pointBase] = this.pointBaseColors[sourceBase];
        this.pointColors[pointBase + 1] = this.pointBaseColors[sourceBase + 1];
        this.pointColors[pointBase + 2] = this.pointBaseColors[sourceBase + 2];
        this.pointSizes[pointCount] = Math.max(1, Math.log10(asteroid.estimatedRadiusM + 10));
        this.pointBodyIds[pointCount] = asteroid.bodyId;
        pointCount += 1;
        continue;
      }

      if (nextMode === 'instanced') {
        this.instancedBodyIds[instanceCount] = asteroid.bodyId;
        instancedBodyIndices[instanceCount] = asteroidIndex;
        instanceCount += 1;
        continue;
      }

      this.focusedMesh.position.copy(world);
      this.focusedMesh.scale.setScalar(asteroid.estimatedRadiusM);
      this.focusedMesh.visible = true;
      this.focusedMeshBodyId = asteroid.bodyId;
      hasFocusedMesh = true;
    }

    this.pointsGeometry.setDrawRange(0, pointCount);
    this.pointPositionAttribute.needsUpdate = true;
    this.pointColorAttribute.needsUpdate = true;
    this.pointSizeAttribute.needsUpdate = true;
    this.instancedBodyIds.length = instanceCount;
    this.cellRenderer.setAnchorPositionM(anchorPositionM);
    this.cellRenderer.setInstancedBodyIndices(instancedBodyIndices);
    this.cellRenderer.update(this.canonicalPositionsM, camera, viewport);

    if (!hasFocusedMesh) {
      this.focusedMesh.visible = false;
      this.focusedMeshBodyId = null;
    }

    this.orbitBatch.lineSegments.position.set(-anchorPositionM.x, -anchorPositionM.y, -anchorPositionM.z);
    const orbitOpacity =
      focusedRenderMode === 'mesh'
        ? ASTEROID_ORBIT_BASE_OPACITY * (1 - clamp01(
          (focusedApparentDiameterPx - ASTEROID_ORBIT_FADE_START_DIAMETER_PX) /
            (ASTEROID_ORBIT_FADE_END_DIAMETER_PX - ASTEROID_ORBIT_FADE_START_DIAMETER_PX),
        ))
        : ASTEROID_ORBIT_BASE_OPACITY;
    this.orbitBatch.material.opacity = orbitOpacity;
    this.orbitBatch.lineSegments.visible = orbitOpacity > 0;

    if (this.focusedAsteroidBodyId !== this.focusedOrbitBodyId) {
      this.disposeFocusedOrbitLine();
      if (this.focusedAsteroidBodyId) {
        const asteroid = this.asteroidById.get(this.focusedAsteroidBodyId)!;
        const range = this.orbitBatch.rangesByBodyId.get(this.focusedAsteroidBodyId)
          ?? buildFocusedOrbitRange(asteroid);
        const focusedOrbitColor = getAsteroidPointColor(asteroid);
        this.focusedOrbitLine = createFocusedAsteroidOrbitLine(asteroid, range, focusedOrbitColor);
        this.focusedOrbitLine.frustumCulled = false;
        this.root.add(this.focusedOrbitLine);
        this.focusedOrbitBodyId = this.focusedAsteroidBodyId;
      }
    }

    if (this.focusedOrbitLine) {
      this.focusedOrbitLine.position.set(-anchorPositionM.x, -anchorPositionM.y, -anchorPositionM.z);
      this.focusedOrbitLine.visible = true;
    }

    this.root.updateMatrixWorld(true);
  }

  dispose(): void {
    this.disposeFocusedOrbitLine();
    this.orbitBatch.geometry.dispose();
    this.orbitBatch.material.dispose();
    this.pointsGeometry.dispose();
    this.pointsMaterial.dispose();
    this.cellRenderer.dispose();
    this.focusedGeometry.dispose();
    this.focusedMaterial.dispose();
  }

  private disposeFocusedOrbitLine(): void {
    if (!this.focusedOrbitLine) {
      this.focusedOrbitBodyId = null;
      return;
    }

    this.root.remove(this.focusedOrbitLine);
    this.focusedOrbitLine.geometry.dispose();
    this.focusedOrbitLine.material.dispose();
    this.focusedOrbitLine = null;
    this.focusedOrbitBodyId = null;
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function buildFocusedOrbitRange(asteroid: AsteroidBody): AsteroidOrbitRange {
  const segmentCount = asteroid.isCuratedNea || asteroid.elements.e >= 0.35
    ? ASTEROID_ORBIT_HIGH_DETAIL_SEGMENTS
    : ASTEROID_ORBIT_MAIN_BELT_SEGMENTS;
  const samples = sampleOrbitEllipse(asteroid.elements, segmentCount);
  return {
    bodyId: asteroid.bodyId,
    vertexOffset: 0,
    vertexCount: segmentCount * 2,
    segmentCount,
    samples,
  };
}
