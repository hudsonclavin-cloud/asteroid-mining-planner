import type { CanonicalState } from '../types.js';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  FRAME_JUPITER_J2000_ICRF,
  type FrameId,
} from './ids.js';
import { assertCanonicalState } from '../invariants/assertions.js';
import { failInvariant } from '../invariants/runtime.js';

export type EarthHeliocentricStateProvider = (tdbSeconds: number) => CanonicalState;
export type JupiterHeliocentricStateProvider = (tdbSeconds: number) => CanonicalState;

export interface FrameTransformHooks {
  readonly earthHeliocentricStateProvider: EarthHeliocentricStateProvider;
  readonly jupiterHeliocentricStateProvider: JupiterHeliocentricStateProvider;
}

let earthHeliocentricStateProvider: EarthHeliocentricStateProvider | null = null;
let jupiterHeliocentricStateProvider: JupiterHeliocentricStateProvider | null = null;

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

function resolveHeliocentricAnchorState(
  label: 'Earth' | 'Jupiter',
  frame: FrameId,
  tdbSeconds: number,
  provider: EarthHeliocentricStateProvider | JupiterHeliocentricStateProvider | null
): CanonicalState {
  if (!provider) {
    failInvariant(
      'INV-004',
      `${label} heliocentric anchor provider is not configured for frame transforms`,
      { tdbSeconds, frame }
    );
    throw new Error('unreachable');
  }

  const anchorState = provider(tdbSeconds);
  assertCanonicalState(anchorState);

  if (anchorState.frame !== FRAME_HELIO_J2000_ICRF) {
    failInvariant('INV-004', `${label} anchor state must be tagged as FRAME_HELIO_J2000_ICRF`, {
      frame: anchorState.frame,
    });
  }

  return anchorState;
}

function resolveEarthHeliocentricState(tdbSeconds: number): CanonicalState {
  return resolveHeliocentricAnchorState(
    'Earth',
    FRAME_GCRS_EARTH,
    tdbSeconds,
    earthHeliocentricStateProvider
  );
}

function resolveJupiterHeliocentricState(tdbSeconds: number): CanonicalState {
  return resolveHeliocentricAnchorState(
    'Jupiter',
    FRAME_JUPITER_J2000_ICRF,
    tdbSeconds,
    jupiterHeliocentricStateProvider
  );
}

function assertSupportedTransform(from: FrameId, to: FrameId): void {
  const supported =
    (from === FRAME_HELIO_J2000_ICRF && to === FRAME_GCRS_EARTH) ||
    (from === FRAME_GCRS_EARTH && to === FRAME_HELIO_J2000_ICRF) ||
    (from === FRAME_HELIO_J2000_ICRF && to === FRAME_JUPITER_J2000_ICRF) ||
    (from === FRAME_JUPITER_J2000_ICRF && to === FRAME_HELIO_J2000_ICRF);

  if (!supported) {
    failInvariant('INV-004', 'Unsupported frame transform pair', { from, to });
  }
}

export function configureFrameTransformHooks(
  hooks: Partial<FrameTransformHooks>
): void {
  if (hooks.earthHeliocentricStateProvider) {
    earthHeliocentricStateProvider = hooks.earthHeliocentricStateProvider;
  }
  if (hooks.jupiterHeliocentricStateProvider) {
    jupiterHeliocentricStateProvider = hooks.jupiterHeliocentricStateProvider;
  }
}

export function resetFrameTransformHooks(): void {
  earthHeliocentricStateProvider = null;
  jupiterHeliocentricStateProvider = null;
}

export function getEarthHeliocentricStateProvider():
  | EarthHeliocentricStateProvider
  | null {
  return earthHeliocentricStateProvider;
}

export function getJupiterHeliocentricStateProvider():
  | JupiterHeliocentricStateProvider
  | null {
  return jupiterHeliocentricStateProvider;
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

  const earthState =
    fromFrame === FRAME_GCRS_EARTH || toFrame === FRAME_GCRS_EARTH
      ? resolveEarthHeliocentricState(tdbSeconds)
      : null;
  const jupiterState =
    fromFrame === FRAME_JUPITER_J2000_ICRF || toFrame === FRAME_JUPITER_J2000_ICRF
      ? resolveJupiterHeliocentricState(tdbSeconds)
      : null;

  if (fromFrame === FRAME_HELIO_J2000_ICRF && toFrame === FRAME_GCRS_EARTH) {
    return {
      ...state,
      positionM: subtractVec3(state.positionM, earthState!.positionM),
      velocityMps: subtractVec3(state.velocityMps, earthState!.velocityMps),
      frame: FRAME_GCRS_EARTH,
    };
  }

  if (fromFrame === FRAME_GCRS_EARTH && toFrame === FRAME_HELIO_J2000_ICRF) {
    return {
      ...state,
      positionM: addVec3(state.positionM, earthState!.positionM),
      velocityMps: addVec3(state.velocityMps, earthState!.velocityMps),
      frame: FRAME_HELIO_J2000_ICRF,
    };
  }

  if (fromFrame === FRAME_HELIO_J2000_ICRF && toFrame === FRAME_JUPITER_J2000_ICRF) {
    return {
      ...state,
      positionM: subtractVec3(state.positionM, jupiterState!.positionM),
      velocityMps: subtractVec3(state.velocityMps, jupiterState!.velocityMps),
      frame: FRAME_JUPITER_J2000_ICRF,
    };
  }

  return {
    ...state,
    positionM: addVec3(state.positionM, jupiterState!.positionM),
    velocityMps: addVec3(state.velocityMps, jupiterState!.velocityMps),
    frame: FRAME_HELIO_J2000_ICRF,
  };
}
