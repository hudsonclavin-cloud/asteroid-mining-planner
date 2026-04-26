import type {
  CameraPositionF64,
  CameraRelativePositionF64,
  CanonicalPositionF64,
  RenderPositionF32,
  RenderProjectionResult,
  Vec3LikeF64,
} from './types.js';

function assertFiniteVec3(label: string, value: Vec3LikeF64): void {
  if (
    !Number.isFinite(value.x) ||
    !Number.isFinite(value.y) ||
    !Number.isFinite(value.z)
  ) {
    throw new Error(`${label} must contain only finite f64 coordinates`);
  }
}

function toF32Relative(relative: CameraRelativePositionF64): RenderPositionF32 {
  return {
    x: Math.fround(relative.x),
    y: Math.fround(relative.y),
    z: Math.fround(relative.z),
  };
}

/**
 * Compute camera-relative coordinates in f64.
 * Canonical positions remain untouched; this is the floating-origin step.
 */
export function subtractCameraRelativeF64(
  canonicalPosition: CanonicalPositionF64,
  cameraPosition: CameraPositionF64
): CameraRelativePositionF64 {
  assertFiniteVec3('canonicalPosition', canonicalPosition);
  assertFiniteVec3('cameraPosition', cameraPosition);

  return {
    x: canonicalPosition.x - cameraPosition.x,
    y: canonicalPosition.y - cameraPosition.y,
    z: canonicalPosition.z - cameraPosition.z,
  };
}

/**
 * Project one canonical f64 position to a GPU-safe f32 render position.
 * The only downcast happens after the camera-relative subtraction.
 */
export function projectCanonicalPositionToRenderF32(
  canonicalPosition: CanonicalPositionF64,
  cameraPosition: CameraPositionF64
): RenderProjectionResult {
  const relativeF64 = subtractCameraRelativeF64(canonicalPosition, cameraPosition);

  return {
    relativeF64,
    renderF32: toF32Relative(relativeF64),
  };
}

/**
 * Fill a GPU-facing Float32Array with camera-relative coordinates only.
 * No absolute canonical positions are ever written to the target buffer.
 */
export function writeCameraRelativePositionsToF32Buffer(
  canonicalPositions: readonly CanonicalPositionF64[],
  cameraPosition: CameraPositionF64,
  target?: Float32Array
): Float32Array {
  assertFiniteVec3('cameraPosition', cameraPosition);

  const requiredLength = canonicalPositions.length * 3;
  const out = target ?? new Float32Array(requiredLength);

  if (out.length !== requiredLength) {
    throw new Error(
      `target buffer length mismatch: expected ${requiredLength}, received ${out.length}`
    );
  }

  for (let i = 0; i < canonicalPositions.length; i++) {
    const relative = subtractCameraRelativeF64(canonicalPositions[i], cameraPosition);
    const base = i * 3;
    out[base] = Math.fround(relative.x);
    out[base + 1] = Math.fround(relative.y);
    out[base + 2] = Math.fround(relative.z);
  }

  return out;
}
