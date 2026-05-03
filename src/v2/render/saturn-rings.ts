import * as THREE from 'three';
import {
  BODY_CONSTANTS,
  SATURN_A_RING_OUTER_RADIUS_M,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  SATURN_C_RING_INNER_RADIUS_M,
  SATURN_D_RING_INNER_RADIUS_M,
  SATURN_ENCKE_GAP_INNER_RADIUS_M,
  SATURN_ENCKE_GAP_OUTER_RADIUS_M,
  SATURN_HUYGENS_GAP_INNER_RADIUS_M,
  SATURN_HUYGENS_GAP_OUTER_RADIUS_M,
  SATURN_HUYGENS_RINGLET_INNER_RADIUS_M,
  SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M,
  SATURN_KEELER_GAP_INNER_RADIUS_M,
  SATURN_KEELER_GAP_OUTER_RADIUS_M,
  SATURN_LAPLACE_GAP_INNER_RADIUS_M,
  SATURN_LAPLACE_GAP_OUTER_RADIUS_M,
  SATURN_LAPLACE_RINGLET_INNER_RADIUS_M,
  SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M,
  SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
  SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
} from '../core/constants/bodies.js';

export {
  SATURN_A_RING_OUTER_RADIUS_M,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  SATURN_C_RING_INNER_RADIUS_M,
  SATURN_D_RING_INNER_RADIUS_M,
  SATURN_ENCKE_GAP_INNER_RADIUS_M,
  SATURN_ENCKE_GAP_OUTER_RADIUS_M,
  SATURN_HUYGENS_GAP_INNER_RADIUS_M,
  SATURN_HUYGENS_GAP_OUTER_RADIUS_M,
  SATURN_HUYGENS_RINGLET_INNER_RADIUS_M,
  SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M,
  SATURN_KEELER_GAP_INNER_RADIUS_M,
  SATURN_KEELER_GAP_OUTER_RADIUS_M,
  SATURN_LAPLACE_GAP_INNER_RADIUS_M,
  SATURN_LAPLACE_GAP_OUTER_RADIUS_M,
  SATURN_LAPLACE_RINGLET_INNER_RADIUS_M,
  SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M,
  SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
  SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
};

/*
 * Saturn ring hierarchy after Slice 5:
 *   saturn-rings
 *     ├── saturn-rings-main
 *     ├── saturn-rings-cassini-division
 *     ├── saturn-rings-huygens-gap
 *     ├── saturn-rings-huygens-ringlet
 *     ├── saturn-rings-laplace-gap
 *     ├── saturn-rings-laplace-ringlet
 *     ├── saturn-rings-encke-gap
 *     ├── saturn-rings-keeler-gap
 *     └── saturn-rings-roche-division
 */

export const SATURN_RING_DEFAULT_INNER_RADIUS_M = SATURN_D_RING_INNER_RADIUS_M;
export const SATURN_RING_FALLBACK_INNER_RADIUS_M = SATURN_C_RING_INNER_RADIUS_M;
export const SATURN_RING_OUTER_RADIUS_M = SATURN_A_RING_OUTER_RADIUS_M;
export const SATURN_RING_C_OUTER_RADIUS_M = 91_975_000;
export const SATURN_RING_B_OUTER_RADIUS_M = 117_570_000;
export const SATURN_RING_A_INNER_RADIUS_M = SATURN_CASSINI_DIVISION_OUTER_RADIUS_M;
export const SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD = -Math.PI / 2;
export const SATURN_RING_TEXTURE_SIZE = 256;
export const SATURN_CASSINI_TEXTURE_SIZE = 128;
export const SATURN_ROCHE_DIVISION_TEXTURE_SIZE = 128;
export const SATURN_RING_MAIN_RENDER_ORDER = 0;
export const SATURN_RING_CASSINI_RENDER_ORDER = 1;
export const SATURN_RING_GAP_RENDER_ORDER = 2;
export const SATURN_RING_RINGLET_RENDER_ORDER = 3;

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

export const SATURN_RING_SUBSTRUCTURE_OPACITY = {
  cassiniGap: 0.28,
  aRingGap: 0.34,
  ringlet: 0.62,
  rocheInner: 0.16,
  rocheOuter: 0.02,
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

interface RingSubstructureFeature {
  readonly name: string;
  readonly meshName: string;
  readonly featureType: 'gap' | 'ringlet' | 'division';
  readonly innerRadiusM: number;
  readonly outerRadiusM: number;
  readonly renderOrder: number;
  readonly color: number;
  readonly opacity?: number;
  readonly textureFactory?: () => THREE.Texture;
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

function createTransparentRingMaterial(options: {
  readonly color: number;
  readonly opacity?: number;
  readonly map?: THREE.Texture;
}): THREE.MeshBasicMaterial {
  const materialOptions: THREE.MeshBasicMaterialParameters = {
    color: options.color,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  };

  if (options.map) {
    materialOptions.map = options.map;
  }
  if (options.opacity !== undefined) {
    materialOptions.opacity = options.opacity;
  }

  return new THREE.MeshBasicMaterial(materialOptions);
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

export function createSaturnRocheDivisionTexture(
  size: number = SATURN_ROCHE_DIVISION_TEXTURE_SIZE,
): THREE.DataTexture {
  const widthM = SATURN_ROCHE_DIVISION_OUTER_RADIUS_M - SATURN_ROCHE_DIVISION_INNER_RADIUS_M;
  return createRadialDataTexture({
    size,
    innerRadiusM: SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
    outerRadiusM: SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
    opacityAtRadius: (radiusM) => {
      const t = clamp((radiusM - SATURN_ROCHE_DIVISION_INNER_RADIUS_M) / widthM, 0, 1);
      return THREE.MathUtils.lerp(
        SATURN_RING_SUBSTRUCTURE_OPACITY.rocheInner,
        SATURN_RING_SUBSTRUCTURE_OPACITY.rocheOuter,
        smoothstep(0, 1, t),
      );
    },
  });
}

function createRingSubstructureMesh(
  feature: RingSubstructureFeature,
  thetaSegments: number,
  phiSegments: number,
): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
  const geometry = createRingGeometry(
    feature.innerRadiusM,
    feature.outerRadiusM,
    thetaSegments,
    phiSegments,
  );
  const material = createTransparentRingMaterial({
    color: feature.color,
    opacity: feature.opacity,
    map: feature.textureFactory?.(),
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = feature.meshName;
  mesh.renderOrder = feature.renderOrder;
  mesh.userData = {
    role: 'ring-substructure',
    feature: feature.name,
    featureType: feature.featureType,
    innerRadiusM: feature.innerRadiusM,
    outerRadiusM: feature.outerRadiusM,
    renderOnly: true,
  };
  return mesh;
}

export const SATURN_RING_SUBSTRUCTURE_FEATURES: readonly RingSubstructureFeature[] = [
  {
    name: 'Huygens Gap',
    meshName: 'saturn-rings-huygens-gap',
    featureType: 'gap',
    innerRadiusM: SATURN_HUYGENS_GAP_INNER_RADIUS_M,
    outerRadiusM: SATURN_HUYGENS_GAP_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_GAP_RENDER_ORDER,
    color: 0x352f2a,
    opacity: SATURN_RING_SUBSTRUCTURE_OPACITY.cassiniGap,
  },
  {
    name: 'Huygens Ringlet',
    meshName: 'saturn-rings-huygens-ringlet',
    featureType: 'ringlet',
    innerRadiusM: SATURN_HUYGENS_RINGLET_INNER_RADIUS_M,
    outerRadiusM: SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_RINGLET_RENDER_ORDER,
    color: 0xd8cfba,
    opacity: SATURN_RING_SUBSTRUCTURE_OPACITY.ringlet,
  },
  {
    name: 'Laplace Gap',
    meshName: 'saturn-rings-laplace-gap',
    featureType: 'gap',
    innerRadiusM: SATURN_LAPLACE_GAP_INNER_RADIUS_M,
    outerRadiusM: SATURN_LAPLACE_GAP_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_GAP_RENDER_ORDER,
    color: 0x3a332d,
    opacity: SATURN_RING_SUBSTRUCTURE_OPACITY.cassiniGap,
  },
  {
    name: 'Laplace Ringlet',
    meshName: 'saturn-rings-laplace-ringlet',
    featureType: 'ringlet',
    innerRadiusM: SATURN_LAPLACE_RINGLET_INNER_RADIUS_M,
    outerRadiusM: SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_RINGLET_RENDER_ORDER,
    color: 0xd9d1bc,
    opacity: SATURN_RING_SUBSTRUCTURE_OPACITY.ringlet,
  },
  {
    name: 'Encke Gap',
    meshName: 'saturn-rings-encke-gap',
    featureType: 'gap',
    innerRadiusM: SATURN_ENCKE_GAP_INNER_RADIUS_M,
    outerRadiusM: SATURN_ENCKE_GAP_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_GAP_RENDER_ORDER,
    color: 0x3b352f,
    opacity: SATURN_RING_SUBSTRUCTURE_OPACITY.aRingGap,
  },
  {
    name: 'Keeler Gap',
    meshName: 'saturn-rings-keeler-gap',
    featureType: 'gap',
    innerRadiusM: SATURN_KEELER_GAP_INNER_RADIUS_M,
    outerRadiusM: SATURN_KEELER_GAP_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_GAP_RENDER_ORDER,
    color: 0x342f29,
    opacity: SATURN_RING_SUBSTRUCTURE_OPACITY.aRingGap,
  },
  {
    name: 'Roche Division',
    meshName: 'saturn-rings-roche-division',
    featureType: 'division',
    innerRadiusM: SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
    outerRadiusM: SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
    renderOrder: SATURN_RING_GAP_RENDER_ORDER,
    color: 0xb7aa94,
    textureFactory: () => createSaturnRocheDivisionTexture(),
  },
] as const;

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
  ringMesh.renderOrder = SATURN_RING_MAIN_RENDER_ORDER;
  ringMesh.userData = {
    role: 'main-ring',
    innerRadiusM,
    outerRadiusM,
  };

  const cassiniMesh = new THREE.Mesh(cassiniGeometry, cassiniMaterial);
  cassiniMesh.name = 'saturn-rings-cassini-division';
  cassiniMesh.renderOrder = SATURN_RING_CASSINI_RENDER_ORDER;
  cassiniMesh.userData = {
    role: 'cassini-division',
    innerRadiusM: SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    outerRadiusM: SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  };

  const substructureMeshes = SATURN_RING_SUBSTRUCTURE_FEATURES.map((feature) =>
    createRingSubstructureMesh(feature, thetaSegments, phiSegments),
  );

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
    substructureFeatureNames: SATURN_RING_SUBSTRUCTURE_FEATURES.map((feature) => feature.name),
  };
  group.add(ringMesh, cassiniMesh, ...substructureMeshes);

  return group;
}
