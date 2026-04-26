import { assertCanonicalState } from './invariants/index.js';
import type {
  CanonicalPositionM,
  CanonicalState,
  CanonicalVelocityMps,
  EarthFrameAnchorState,
  InvariantId,
  Vec3F64,
} from './types.js';
import type { FrameId } from './frames/index.js';

export type {
  CanonicalPositionM,
  CanonicalState,
  CanonicalVelocityMps,
  EarthFrameAnchorState,
  InvariantId,
  Vec3F64,
  FrameId,
};

export interface CanonicalStateInit {
  readonly positionM: CanonicalPositionM;
  readonly velocityMps: CanonicalVelocityMps;
  readonly frame: FrameId;
  readonly tdbSeconds: number;
  readonly radiusM?: number;
}

export function createCanonicalState(init: CanonicalStateInit): CanonicalState {
  const state: CanonicalState = {
    positionM: { ...init.positionM },
    velocityMps: { ...init.velocityMps },
    frame: init.frame,
    tdbSeconds: init.tdbSeconds,
    ...(typeof init.radiusM === 'number' ? { radiusM: init.radiusM } : {}),
  };
  assertCanonicalState(state);
  return state;
}
