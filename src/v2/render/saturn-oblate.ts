import * as THREE from 'three';
import { BODY_CONSTANTS } from '../core/constants/bodies.js';

const SATURN_RADII_M = BODY_CONSTANTS.saturn.radiiM;

if (!SATURN_RADII_M) {
  throw new Error('Saturn triaxial radii are required for oblate render geometry.');
}

export const SATURN_EQUATORIAL_RADIUS_M = SATURN_RADII_M.a;
export const SATURN_POLAR_RADIUS_M = SATURN_RADII_M.c;
export const SATURN_POLAR_SCALE = SATURN_POLAR_RADIUS_M / SATURN_EQUATORIAL_RADIUS_M;

export interface SaturnOblateMeshOptions {
  readonly widthSegments?: number;
  readonly heightSegments?: number;
  readonly material?: THREE.Material;
}

export function createSaturnOblateMesh(
  options: SaturnOblateMeshOptions = {},
): THREE.Mesh<THREE.SphereGeometry, THREE.Material> {
  const geometry = new THREE.SphereGeometry(
    SATURN_EQUATORIAL_RADIUS_M,
    options.widthSegments ?? 64,
    options.heightSegments ?? 32,
  );

  const material =
    options.material ??
    new THREE.MeshLambertMaterial({ color: BODY_CONSTANTS.saturn.vizColor });

  const mesh = new THREE.Mesh(geometry, material);
  // Render-only convention for this helper: local Y is the polar axis.
  // This local mesh convention does not claim FRAME_SATURN_J2000_ICRF orientation.
  mesh.scale.set(1, SATURN_POLAR_SCALE, 1);
  mesh.updateMatrixWorld();

  return mesh;
}
