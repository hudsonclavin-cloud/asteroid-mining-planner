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

export { mountEmptyViewportCanvas } from './empty-viewport.js';
