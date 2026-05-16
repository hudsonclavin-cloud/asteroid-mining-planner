export interface CameraOrbitState {
  radiusM: number;
  polarRad: number;
  azimuthRad: number;
}

export interface CameraOrbitTween {
  from: CameraOrbitState;
  to: CameraOrbitState;
  startMs: number;
  durationMs: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function cubicEaseOut(progress: number): number {
  const clamped = clamp(progress, 0, 1);
  return 1 - Math.pow(1 - clamped, 3);
}

export function sampleCameraOrbitTween(
  tween: CameraOrbitTween,
  nowMs: number,
): { state: CameraOrbitState; completed: boolean } {
  const rawProgress = (nowMs - tween.startMs) / Math.max(tween.durationMs, 1);
  const progress = cubicEaseOut(rawProgress);
  const completed = rawProgress >= 1;

  return {
    state: {
      radiusM: lerp(tween.from.radiusM, tween.to.radiusM, progress),
      polarRad: lerp(tween.from.polarRad, tween.to.polarRad, progress),
      azimuthRad: lerp(tween.from.azimuthRad, tween.to.azimuthRad, progress),
    },
    completed,
  };
}
