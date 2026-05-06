import * as THREE from 'three';
import { BODY_CONSTANTS } from '../core/constants/bodies.js';

const MARS_RADII_M = BODY_CONSTANTS.mars.radiiM;

if (!MARS_RADII_M) {
  throw new Error('Mars triaxial radii are required for oblate render geometry.');
}

export const MARS_EQUATORIAL_RADIUS_M = MARS_RADII_M.a;
export const MARS_POLAR_RADIUS_M = MARS_RADII_M.c;
export const MARS_POLAR_SCALE = MARS_POLAR_RADIUS_M / MARS_EQUATORIAL_RADIUS_M;

export interface MarsOblateMeshOptions {
  readonly widthSegments?: number;
  readonly heightSegments?: number;
  readonly material?: THREE.Material;
}

export function createMarsOblateMesh(
  options: MarsOblateMeshOptions = {},
): THREE.Mesh<THREE.SphereGeometry, THREE.Material> {
  const geometry = new THREE.SphereGeometry(
    MARS_EQUATORIAL_RADIUS_M,
    options.widthSegments ?? 64,
    options.heightSegments ?? 32,
  );

  const material =
    options.material ??
    new THREE.MeshLambertMaterial({ color: BODY_CONSTANTS.mars.vizColor });

  const mesh = new THREE.Mesh(geometry, material);
  // Render-only oblateness: local Y is the visual spin / polar axis, while the
  // core Mars frame remains ICRF-aligned per Slice 6 frame discipline.
  mesh.scale.set(1, MARS_POLAR_SCALE, 1);
  mesh.updateMatrixWorld();

  return mesh;
}
