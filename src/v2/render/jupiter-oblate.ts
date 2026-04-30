import * as THREE from 'three';
import { BODY_CONSTANTS } from '../core/constants/bodies.js';

const JUPITER_RADII_M = BODY_CONSTANTS.jupiter.radiiM;

if (!JUPITER_RADII_M) {
  throw new Error('Jupiter triaxial radii are required for oblate render geometry.');
}

export const JUPITER_EQUATORIAL_RADIUS_M = JUPITER_RADII_M.a;
export const JUPITER_POLAR_RADIUS_M = JUPITER_RADII_M.c;
export const JUPITER_POLAR_SCALE = JUPITER_POLAR_RADIUS_M / JUPITER_EQUATORIAL_RADIUS_M;

export interface JupiterOblateMeshOptions {
  readonly widthSegments?: number;
  readonly heightSegments?: number;
  readonly material?: THREE.Material;
}

export function createJupiterOblateMesh(
  options: JupiterOblateMeshOptions = {},
): THREE.Mesh<THREE.SphereGeometry, THREE.Material> {
  const geometry = new THREE.SphereGeometry(
    JUPITER_EQUATORIAL_RADIUS_M,
    options.widthSegments ?? 64,
    options.heightSegments ?? 32,
  );

  const material =
    options.material ??
    new THREE.MeshLambertMaterial({ color: BODY_CONSTANTS.jupiter.vizColor });

  const mesh = new THREE.Mesh(geometry, material);
  // Render-only oblateness: Y is the visual up / spin axis for Slice 3.
  mesh.scale.set(1, JUPITER_POLAR_SCALE, 1);
  mesh.updateMatrixWorld();

  return mesh;
}
