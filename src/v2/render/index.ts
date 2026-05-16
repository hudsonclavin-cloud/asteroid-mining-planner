export type {
  CameraPositionF64,
  CameraRelativePositionF64,
  CanonicalPositionF64,
  RenderPositionF32,
  RenderProjectionResult,
  Vec3LikeF64,
} from './types.js';

export type {
  EmptyViewportHandle,
  EmptyViewportOptions,
} from './empty-viewport.js';

export {
  projectCanonicalPositionToRenderF32,
  subtractCameraRelativeF64,
  writeCameraRelativePositionsToF32Buffer,
} from './camera-relative.js';

export {
  createJupiterOblateMesh,
  JUPITER_EQUATORIAL_RADIUS_M,
  JUPITER_POLAR_RADIUS_M,
  JUPITER_POLAR_SCALE,
} from './jupiter-oblate.js';

export {
  createMarsOblateMesh,
  MARS_EQUATORIAL_RADIUS_M,
  MARS_POLAR_RADIUS_M,
  MARS_POLAR_SCALE,
} from './mars-oblate.js';

export {
  createSaturnOblateMesh,
  SATURN_EQUATORIAL_RADIUS_M,
  SATURN_POLAR_RADIUS_M,
  SATURN_POLAR_SCALE,
} from './saturn-oblate.js';

export {
  createSaturnCassiniDivisionTexture,
  createSaturnRingTexture,
  createSaturnRingsGroup,
  getSaturnRingInnerRadiusM,
  sampleSaturnCassiniDivisionOpacity,
  sampleSaturnRingOpacity,
  SATURN_CASSINI_DIVISION_OPACITY,
  SATURN_CASSINI_TEXTURE_SIZE,
  SATURN_RING_A_INNER_RADIUS_M,
  SATURN_RING_B_OUTER_RADIUS_M,
  SATURN_RING_C_OUTER_RADIUS_M,
  SATURN_RING_DEFAULT_INNER_RADIUS_M,
  SATURN_RING_FALLBACK_INNER_RADIUS_M,
  SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD,
  SATURN_RING_OUTER_RADIUS_M,
  SATURN_RING_REGION_OPACITY,
  SATURN_RING_TEXTURE_SIZE,
} from './saturn-rings.js';

export {
  ASTEROID_CURATED_NEA_COLOR_HEX,
  ASTEROID_MAIN_BELT_COLOR_HEX,
  ASTEROID_POINTS_DEFAULT_OPACITY,
  ASTEROID_POINTS_DEFAULT_SCALE,
  ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX,
  createAsteroidPointsShaderMaterial,
  getAsteroidPointColor,
  resolveAliasedPointSizeRange,
  setAsteroidPointsMaxSize,
} from './asteroid-points-shader.js';

export type {
  AsteroidRenderMode,
  AsteroidRendererUpdateInput,
  AsteroidRendererViewport,
} from './asteroid-renderer.js';

export {
  ASTEROID_INSTANCE_TO_MESH_ENTER_DIAMETER_PX,
  ASTEROID_INSTANCE_TO_MESH_EXIT_DIAMETER_PX,
  ASTEROID_POINTS_TO_INSTANCE_ENTER_DIAMETER_PX,
  ASTEROID_POINTS_TO_INSTANCE_EXIT_DIAMETER_PX,
  AsteroidRenderer,
  classifyAsteroidRenderMode,
  computeApparentDiameterPx,
  propagateAsteroidBodyState,
} from './asteroid-renderer.js';

export type { SpatialGridCellIndex } from './spatial-grid.js';

export {
  SPATIAL_GRID_BOUNDS_AU,
  SPATIAL_GRID_CELL_SIZE_AU,
  cellBoundsKmForIndex,
  cellIndexForPositionKm,
  cellKeyForIndex,
  iterateAllPossibleCells,
} from './spatial-grid.js';

export type {
  AsteroidCellIntersection,
  AsteroidCellRendererViewport,
  AsteroidCellStats,
} from './asteroid-cell-renderer.js';

export { AsteroidCellRenderer } from './asteroid-cell-renderer.js';

export { StarRenderer } from './star-renderer.js';
export type { CameraOrbitState, CameraOrbitTween } from './camera-tween.js';
export { cubicEaseOut, sampleCameraOrbitTween } from './camera-tween.js';

export { mountEmptyViewportCanvas } from './empty-viewport.js';
