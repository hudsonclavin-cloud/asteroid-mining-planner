import * as THREE from 'three';
import type { AsteroidBody, AsteroidBodyId } from '../core/constants/asteroids.js';
import {
  sampleOrbitEllipse,
  type OrbitSamplePoint,
} from '../core/propagators/keplerian.js';

export const ASTEROID_ORBIT_BASE_COLOR_HEX = 0x8ea0b8;
export const ASTEROID_ORBIT_BASE_OPACITY = 0.12;
export const ASTEROID_ORBIT_FOCUSED_OPACITY = 0.6;
export const ASTEROID_ORBIT_MAIN_BELT_SEGMENTS = 64;
export const ASTEROID_ORBIT_HIGH_DETAIL_SEGMENTS = 128;

export interface AsteroidOrbitRange {
  readonly bodyId: AsteroidBodyId;
  readonly vertexOffset: number;
  readonly vertexCount: number;
  readonly segmentCount: number;
  readonly samples: readonly OrbitSamplePoint[];
}

export interface AsteroidOrbitBatch {
  readonly geometry: THREE.BufferGeometry;
  readonly material: THREE.LineBasicMaterial;
  readonly lineSegments: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  readonly rangesByBodyId: ReadonlyMap<AsteroidBodyId, AsteroidOrbitRange>;
}

export function getAsteroidOrbitSegmentCount(asteroid: Pick<AsteroidBody, 'elements' | 'isCuratedNea'>): number {
  return asteroid.isCuratedNea || asteroid.elements.e >= 0.35
    ? ASTEROID_ORBIT_HIGH_DETAIL_SEGMENTS
    : ASTEROID_ORBIT_MAIN_BELT_SEGMENTS;
}

export function createAsteroidOrbitBatch(
  asteroids: readonly AsteroidBody[],
): AsteroidOrbitBatch {
  if (asteroids.length === 0) {
    throw new Error('Asteroid orbit batch requires at least one asteroid');
  }

  const rangesByBodyId = new Map<AsteroidBodyId, AsteroidOrbitRange>();
  const totalVertexCount = asteroids.reduce(
    (sum, asteroid) => sum + getAsteroidOrbitSegmentCount(asteroid) * 2,
    0,
  );
  const positions = new Float32Array(totalVertexCount * 3);
  let vertexOffset = 0;

  for (const asteroid of asteroids) {
    const segmentCount = getAsteroidOrbitSegmentCount(asteroid);
    const samples = sampleOrbitEllipse(asteroid.elements, segmentCount);
    const orbitVertexOffset = vertexOffset;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const start = samples[segmentIndex];
      const end = samples[segmentIndex + 1];
      const base = vertexOffset * 3;
      positions[base] = Math.fround(start.x);
      positions[base + 1] = Math.fround(start.y);
      positions[base + 2] = Math.fround(start.z);
      positions[base + 3] = Math.fround(end.x);
      positions[base + 4] = Math.fround(end.y);
      positions[base + 5] = Math.fround(end.z);
      vertexOffset += 2;
    }

    rangesByBodyId.set(asteroid.bodyId, {
      bodyId: asteroid.bodyId,
      vertexOffset: orbitVertexOffset,
      vertexCount: segmentCount * 2,
      segmentCount,
      samples,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    color: ASTEROID_ORBIT_BASE_COLOR_HEX,
    opacity: ASTEROID_ORBIT_BASE_OPACITY,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const lineSegments = new THREE.LineSegments(geometry, material);
  lineSegments.name = 'asteroid-orbit-batch';

  return {
    geometry,
    material,
    lineSegments,
    rangesByBodyId,
  };
}

export function createFocusedAsteroidOrbitLine(
  asteroid: Pick<AsteroidBody, 'bodyId' | 'isCuratedNea'>,
  range: AsteroidOrbitRange,
  color: THREE.Color,
): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> {
  const positions = new Float32Array(range.samples.length * 3);
  for (let sampleIndex = 0; sampleIndex < range.samples.length; sampleIndex += 1) {
    const sample = range.samples[sampleIndex];
    const base = sampleIndex * 3;
    positions[base] = Math.fround(sample.x);
    positions[base + 1] = Math.fround(sample.y);
    positions[base + 2] = Math.fround(sample.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    color,
    opacity: ASTEROID_ORBIT_FOCUSED_OPACITY,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const line = new THREE.Line(geometry, material);
  line.name = `asteroid-focused-orbit-${asteroid.bodyId}`;
  return line;
}
