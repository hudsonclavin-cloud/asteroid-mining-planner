export interface Vec3LikeF64 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CameraPositionF64 extends Vec3LikeF64 {}

export interface CanonicalPositionF64 extends Vec3LikeF64 {}

export interface CameraRelativePositionF64 extends Vec3LikeF64 {}

export interface RenderPositionF32 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface RenderProjectionResult {
  readonly relativeF64: CameraRelativePositionF64;
  readonly renderF32: RenderPositionF32;
}
