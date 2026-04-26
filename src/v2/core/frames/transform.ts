import type { CanonicalState } from '../types.js';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  type FrameId,
} from './ids.js';
import { assertCanonicalState } from '../invariants/assertions.js';
import { failInvariant } from '../invariants/runtime.js';

export type EarthHeliocentricStateProvider = (tdbSeconds: number) => CanonicalState;

export interface FrameTransformHooks {
  readonly earthHeliocentricStateProvider: EarthHeliocentricStateProvider;
}

let earthHeliocentricStateProvider: EarthHeliocentricStateProvider | null = null;

function subtractVec3(
  left: CanonicalState['positionM'],
  right: CanonicalState['positionM']
): CanonicalState['positionM'] {
  return {
    x: left.x - right.x,
    y: left.y - right.y,
    z: left.z - right.z,
  };
}

function addVec3(
  left: CanonicalState['positionM'],
  right: CanonicalState['positionM']
): CanonicalState['positionM'] {
  return {
    x: left.x + right.x,
    y: left.y + right.y,
    z: left.z + right.z,
  };
}

function resolveEarthHeliocentricState(tdbSeconds: number): CanonicalState {
  if (!earthHeliocentricStateProvider) {
    failInvariant(
      'INV-004',
      'Earth heliocentric anchor provider is not configured for frame transforms',
      { tdbSeconds }
    );
    throw new Error('unreachable');
  }

  const earthState = earthHeliocentricStateProvider(tdbSeconds);
  assertCanonicalState(earthState);

  if (earthState.frame !== FRAME_HELIO_J2000_ICRF) {
    failInvariant('INV-004', 'Earth anchor state must be tagged as FRAME_HELIO_J2000_ICRF', {
      frame: earthState.frame,
    });
  }

  return earthState;
}

function assertSupportedTransform(from: FrameId, to: FrameId): void {
  const supported =
    (from === FRAME_HELIO_J2000_ICRF && to === FRAME_GCRS_EARTH) ||
    (from === FRAME_GCRS_EARTH && to === FRAME_HELIO_J2000_ICRF);

  if (!supported) {
    failInvariant('INV-004', 'Unsupported Slice 1 frame transform pair', { from, to });
  }
}

export function configureFrameTransformHooks(
  hooks: Partial<FrameTransformHooks>
): void {
  if (hooks.earthHeliocentricStateProvider) {
    earthHeliocentricStateProvider = hooks.earthHeliocentricStateProvider;
  }
}

export function resetFrameTransformHooks(): void {
  earthHeliocentricStateProvider = null;
}

export function getEarthHeliocentricStateProvider():
  | EarthHeliocentricStateProvider
  | null {
  return earthHeliocentricStateProvider;
}

export function transformCanonicalState(
  state: CanonicalState,
  fromFrame: FrameId,
  toFrame: FrameId,
  tdbSeconds: number
): CanonicalState {
  assertCanonicalState(state);

  if (state.frame !== fromFrame) {
    failInvariant('INV-004', 'State frame does not match requested transform source frame', {
      stateFrame: state.frame,
      fromFrame,
      toFrame,
    });
  }

  if (!Number.isFinite(tdbSeconds)) {
    failInvariant('INV-004', 'Frame transform requires a finite explicit TDB seconds value', {
      tdbSeconds,
    });
  }

  if (fromFrame === toFrame) {
    return {
      ...state,
      frame: toFrame,
    };
  }

  assertSupportedTransform(fromFrame, toFrame);

  const earthState = resolveEarthHeliocentricState(tdbSeconds);

  if (fromFrame === FRAME_HELIO_J2000_ICRF && toFrame === FRAME_GCRS_EARTH) {
    return {
      ...state,
      positionM: subtractVec3(state.positionM, earthState.positionM),
      velocityMps: subtractVec3(state.velocityMps, earthState.velocityMps),
      frame: FRAME_GCRS_EARTH,
    };
  }

  return {
    ...state,
    positionM: addVec3(state.positionM, earthState.positionM),
    velocityMps: addVec3(state.velocityMps, earthState.velocityMps),
    frame: FRAME_HELIO_J2000_ICRF,
  };
}
