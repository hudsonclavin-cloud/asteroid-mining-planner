import type { FrameId } from './frames/ids.js';

export interface Vec3F64 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CanonicalPositionM extends Vec3F64 {}

export interface CanonicalVelocityMps extends Vec3F64 {}

export interface CanonicalState {
  readonly positionM: CanonicalPositionM;
  readonly velocityMps: CanonicalVelocityMps;
  readonly frame: FrameId;
  readonly tdbSeconds: number;
  readonly radiusM?: number;
}

export interface EarthFrameAnchorState extends CanonicalState {
  readonly frame: FrameId;
}

export type InvariantId =
  | 'INV-001'
  | 'INV-002'
  | 'INV-003'
  | 'INV-004'
  | 'INV-005'
  | 'INV-006'
  | 'INV-007'
  | 'INV-008'
  | 'INV-009'
  | 'INV-010';
