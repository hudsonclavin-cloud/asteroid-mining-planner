import type { CanonicalState } from '../types.js';
import type { FrameId } from '../frames/index.js';
import { transformCanonicalState } from '../frames/index.js';
import { assertCanonicalState } from './assertions.js';
import { failInvariant } from './runtime.js';

export const FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR = 10 * Number.EPSILON;
export const FRAME_ROUND_TRIP_CHAIN10_MAX_RELATIVE_ERROR = 100 * Number.EPSILON;

function sixAxisNorm(state: CanonicalState): number {
  return Math.hypot(
    state.positionM.x,
    state.positionM.y,
    state.positionM.z,
    state.velocityMps.x,
    state.velocityMps.y,
    state.velocityMps.z
  );
}

function sixAxisDiffNorm(left: CanonicalState, right: CanonicalState): number {
  return Math.hypot(
    left.positionM.x - right.positionM.x,
    left.positionM.y - right.positionM.y,
    left.positionM.z - right.positionM.z,
    left.velocityMps.x - right.velocityMps.x,
    left.velocityMps.y - right.velocityMps.y,
    left.velocityMps.z - right.velocityMps.z
  );
}

export function computeFrameRoundTripRelativeError(
  sample: CanonicalState,
  from: FrameId,
  to: FrameId,
  tdbSeconds: number
): number {
  assertCanonicalState(sample);

  const forward = transformCanonicalState(sample, from, to, tdbSeconds);
  const roundTripped = transformCanonicalState(forward, to, from, tdbSeconds);

  return sixAxisDiffNorm(roundTripped, sample) / Math.max(sixAxisNorm(sample), 1);
}

export function assertFrameRoundTrip(
  sample: CanonicalState,
  from: FrameId,
  to: FrameId,
  tdbSeconds: number
): void {
  const relativeError = computeFrameRoundTripRelativeError(sample, from, to, tdbSeconds);

  if (relativeError >= FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR) {
    failInvariant('INV-004', 'Frame round-trip relative error exceeded Slice 1 bound', {
      from,
      to,
      tdbSeconds,
      relativeError,
      maxRelativeError: FRAME_ROUND_TRIP_MAX_RELATIVE_ERROR,
    });
  }
}
