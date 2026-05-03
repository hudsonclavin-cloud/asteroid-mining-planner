import * as THREE from 'three';
import {
  BODY_CONSTANTS,
  SATURN_A_RING_OUTER_RADIUS_M,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  SATURN_C_RING_INNER_RADIUS_M,
  SATURN_D_RING_INNER_RADIUS_M,
} from '../core/constants/bodies.js';

export {
  SATURN_A_RING_OUTER_RADIUS_M,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  SATURN_C_RING_INNER_RADIUS_M,
  SATURN_D_RING_INNER_RADIUS_M,
};

export const SATURN_RING_DEFAULT_INNER_RADIUS_M = SATURN_D_RING_INNER_RADIUS_M;
export const SATURN_RING_FALLBACK_INNER_RADIUS_M = SATURN_C_RING_INNER_RADIUS_M;
export const SATURN_RING_OUTER_RADIUS_M = SATURN_A_RING_OUTER_RADIUS_M;
export const SATURN_RING_C_OUTER_RADIUS_M = 91_975_000;
export const SATURN_RING_B_OUTER_RADIUS_M = 117_570_000;
export const SATURN_RING_A_INNER_RADIUS_M = SATURN_CASSINI_DIVISION_OUTER_RADIUS_M;
export const SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD = -Math.PI / 2;
export const SATURN_RING_TEXTURE_SIZE = 256;
export const SATURN_CASSINI_TEXTURE_SIZE = 128;

export const SATURN_RING_REGION_OPACITY = {
  d: 0.12,
  c: 0.28,
  b: 0.72,
  a: 0.42,
} as const;

export const SATURN_CASSINI_DIVISION_OPACITY = {
  edge: 0.10,
  center: 0.22,
} as const;

export interface SaturnRingsOptions {
  readonly omitDRing?: boolean;
  readonly thetaSegments?: number;
  readonly phiSegments?: number;
  readonly ringColor?: number;
  readonly cassiniColor?: number;
}

interface RadialTextureOptions {
  readonly size: number;
  readonly innerRadiusM: number;
  readonly outerRadiusM: number;
  readonly opacityAtRadius: (radiusM: number) => number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function createRingGeometry(
  innerRadiusM: number,
  outerRadiusM: number,
  thetaSegments: number,
  phiSegments: number,
): THREE.RingGeometry {
  const geometry = new THREE.RingGeometry(
    innerRadiusM,
    outerRadiusM,
    thetaSegments,
    phiSegments,
  );
  // Render-local contract: ring plane normal is +Y before any external tilt group.
  geometry.rotateX(SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD);
  return geometry;
}

function createRadialDataTexture(options: RadialTextureOptions): THREE.DataTexture {
  const { size, innerRadiusM, outerRadiusM, opacityAtRadius } = options;
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;
  const invCenter = center === 0 ? 0 : 1 / center;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - center) * invCenter;
      const dy = (y - center) * invCenter;
      const radialNorm = Math.hypot(dx, dy);
      const radiusM = radialNorm * outerRadiusM;
      const alpha =
        radiusM < innerRadiusM || radiusM > outerRadiusM
          ? 0
          : clamp(opacityAtRadius(radiusM), 0, 1);

      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = Math.round(alpha * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.generateMipmaps = false;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  return texture;
}

export function getSaturnRingInnerRadiusM(options: SaturnRingsOptions = {}): number {
  return options.omitDRing
    ? SATURN_RING_FALLBACK_INNER_RADIUS_M
    : SATURN_RING_DEFAULT_INNER_RADIUS_M;
}

export function sampleSaturnRingOpacity(radiusM: number): number {
  if (radiusM < SATURN_RING_DEFAULT_INNER_RADIUS_M || radiusM > SATURN_RING_OUTER_RADIUS_M) {
    return 0;
  }
  if (radiusM < SATURN_C_RING_INNER_RADIUS_M) {
    return SATURN_RING_REGION_OPACITY.d;
  }
  if (radiusM < SATURN_RING_C_OUTER_RADIUS_M) {
    return SATURN_RING_REGION_OPACITY.c;
  }
  if (radiusM < SATURN_CASSINI_DIVISION_INNER_RADIUS_M) {
    return SATURN_RING_REGION_OPACITY.b;
  }
  if (radiusM < SATURN_CASSINI_DIVISION_OUTER_RADIUS_M) {
    return 0;
  }
  return SATURN_RING_REGION_OPACITY.a;
}

export function sampleSaturnCassiniDivisionOpacity(radiusM: number): number {
  if (
    radiusM < SATURN_CASSINI_DIVISION_INNER_RADIUS_M ||
    radiusM > SATURN_CASSINI_DIVISION_OUTER_RADIUS_M
  ) {
    return 0;
  }

  const midRadiusM =
    (SATURN_CASSINI_DIVISION_INNER_RADIUS_M + SATURN_CASSINI_DIVISION_OUTER_RADIUS_M) / 2;
  const halfWidthM =
    (SATURN_CASSINI_DIVISION_OUTER_RADIUS_M - SATURN_CASSINI_DIVISION_INNER_RADIUS_M) / 2;
  const distanceFromMid = Math.abs(radiusM - midRadiusM);
  const edgeBlend = smoothstep(0, halfWidthM, distanceFromMid);

  return THREE.MathUtils.lerp(
    SATURN_CASSINI_DIVISION_OPACITY.center,
    SATURN_CASSINI_DIVISION_OPACITY.edge,
    edgeBlend,
  );
}

export function createSaturnRingTexture(
  innerRadiusM: number = SATURN_RING_DEFAULT_INNER_RADIUS_M,
  outerRadiusM: number = SATURN_RING_OUTER_RADIUS_M,
  size: number = SATURN_RING_TEXTURE_SIZE,
): THREE.DataTexture {
  return createRadialDataTexture({
    size,
    innerRadiusM,
    outerRadiusM,
    opacityAtRadius: sampleSaturnRingOpacity,
  });
}

export function createSaturnCassiniDivisionTexture(
  size: number = SATURN_CASSINI_TEXTURE_SIZE,
): THREE.DataTexture {
  return createRadialDataTexture({
    size,
    innerRadiusM: SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    outerRadiusM: SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
    opacityAtRadius: sampleSaturnCassiniDivisionOpacity,
  });
}

export function createSaturnRingsGroup(
  options: SaturnRingsOptions = {},
): THREE.Group {
  const innerRadiusM = getSaturnRingInnerRadiusM(options);
  const outerRadiusM = SATURN_RING_OUTER_RADIUS_M;
  const thetaSegments = options.thetaSegments ?? 128;
  const phiSegments = options.phiSegments ?? 4;

  const ringGeometry = createRingGeometry(innerRadiusM, outerRadiusM, thetaSegments, phiSegments);
  const cassiniGeometry = createRingGeometry(
    SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
    thetaSegments,
    phiSegments,
  );

  const ringTexture = createSaturnRingTexture(innerRadiusM, outerRadiusM);
  const cassiniTexture = createSaturnCassiniDivisionTexture();

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: options.ringColor ?? BODY_CONSTANTS.saturn.vizColor,
    map: ringTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
  const cassiniMaterial = new THREE.MeshBasicMaterial({
    color: options.cassiniColor ?? 0x4d463d,
    map: cassiniTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });

  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.name = 'saturn-rings-main';
  ringMesh.userData = {
    role: 'main-ring',
    innerRadiusM,
    outerRadiusM,
  };

  const cassiniMesh = new THREE.Mesh(cassiniGeometry, cassiniMaterial);
  cassiniMesh.name = 'saturn-rings-cassini-division';
  cassiniMesh.userData = {
    role: 'cassini-division',
    innerRadiusM: SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    outerRadiusM: SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  };

  // Keep rings in an identity-scale group. This render-only artifact must remain a sibling
  // of any non-uniformly scaled Saturn body mesh, not a child beneath it.
  const group = new THREE.Group();
  group.name = 'saturn-rings';
  group.userData = {
    innerRadiusM,
    outerRadiusM,
    omitDRing: options.omitDRing ?? false,
    localPlaneNormalAxis: 'Y',
    renderOnly: true,
  };
  group.add(ringMesh, cassiniMesh);

  return group;
}
