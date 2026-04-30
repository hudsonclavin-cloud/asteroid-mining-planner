import type { CanonicalState, InvariantId, Vec3F64 } from '../types.js';
import { isFrameId } from '../frames/ids.js';
import { failInvariant } from './runtime.js';
import {
  getInterpolationErrorBarM,
  getInterpolationInvariantId,
  type BodyId,
} from '../constants/bodies.js';

const FORBIDDEN_UNIT_KEYS = new Set([
  'positionKm',
  'velocityKms',
  'radiusKm',
  'jd',
  'jdTdb',
  'jdUtc',
  'epochJd',
  'epochJulianDate',
  'positionAu',
  'velocityAuPerDay',
]);

const FORBIDDEN_PRESENTATION_PATTERNS = [
  /readable/i,
  /display/i,
  /cameraRelative/i,
  /^camera/i,
  /render/i,
  /screen/i,
  /compressed/i,
  /^ui/i,
  /pixel/i,
  /zoom/i,
  /visual/i,
] as const;

function invariantObject(
  state: CanonicalState,
  invariantId: InvariantId,
  message: string
): Record<string, unknown> {
  if (state === null || typeof state !== 'object' || Array.isArray(state)) {
    failInvariant(invariantId, message, { receivedType: typeof state });
    throw new Error('unreachable');
  }
  return state as unknown as Record<string, unknown>;
}

function assertFiniteNumber(
  invariantId: InvariantId,
  label: string,
  value: number
): void {
  if (!Number.isFinite(value)) {
    failInvariant(invariantId, `${label} must be a finite number`, { value });
  }
}

function assertFiniteVec3(
  invariantId: InvariantId,
  label: string,
  value: Vec3F64
): void {
  assertFiniteNumber(invariantId, `${label}.x`, value.x);
  assertFiniteNumber(invariantId, `${label}.y`, value.y);
  assertFiniteNumber(invariantId, `${label}.z`, value.z);
}

function walkObjectKeys(
  value: unknown,
  visitor: (path: string, key: string, nestedValue: unknown) => void,
  path = 'state'
): void {
  if (value === null || typeof value !== 'object') {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = `${path}.${key}`;
    visitor(nextPath, key, nestedValue);
    walkObjectKeys(nestedValue, visitor, nextPath);
  }
}

export function assertCanonicalUnits(state: CanonicalState): void {
  const record = invariantObject(
    state,
    'INV-001',
    'Canonical state must be an object with explicit meter/meter-per-second fields'
  );

  if (!('positionM' in record) || !('velocityMps' in record) || !('tdbSeconds' in record)) {
    failInvariant('INV-001', 'Canonical state must expose positionM, velocityMps, and tdbSeconds');
  }

  walkObjectKeys(record, (path, key) => {
    if (FORBIDDEN_UNIT_KEYS.has(key)) {
      failInvariant('INV-001', 'Non-canonical unit field detected in core state', {
        path,
        key,
      });
    }
  });
}

export function assertFiniteState(state: CanonicalState): void {
  invariantObject(state, 'INV-002', 'Canonical state must be an object');
  assertFiniteVec3('INV-002', 'positionM', state.positionM);
  assertFiniteVec3('INV-002', 'velocityMps', state.velocityMps);
  assertFiniteNumber('INV-002', 'tdbSeconds', state.tdbSeconds);

  if (typeof state.radiusM !== 'undefined') {
    assertFiniteNumber('INV-002', 'radiusM', state.radiusM);
  }
}

export function assertFrameTag(state: CanonicalState): void {
  invariantObject(state, 'INV-003', 'Canonical state must be an object');
  if (!isFrameId(state.frame)) {
    failInvariant('INV-003', 'Canonical state frame must be an explicit supported frame ID', {
      frame: state.frame,
    });
  }
}

export function assertPhysicalTruthOnly(state: CanonicalState): void {
  const record = invariantObject(
    state,
    'INV-006',
    'Core state must remain physical-truth-only and presentation-free'
  );

  walkObjectKeys(record, (path, key) => {
    for (const pattern of FORBIDDEN_PRESENTATION_PATTERNS) {
      if (pattern.test(key)) {
        failInvariant('INV-006', 'Presentation-derived field detected in core state', {
          path,
          key,
        });
      }
    }
  });
}

export function assertCanonicalState(state: CanonicalState): void {
  assertCanonicalUnits(state);
  assertFiniteState(state);
  assertFrameTag(state);
  assertPhysicalTruthOnly(state);
}

export function assertInterpolationError(
  estimate: CanonicalState,
  truth: CanonicalState,
  bodyId: BodyId
): void {
  assertCanonicalState(estimate);
  assertCanonicalState(truth);

  const invariantId: InvariantId = getInterpolationInvariantId(bodyId);
  const estimateM = estimate.positionM;
  const truthM = truth.positionM;
  const dx = estimateM.x - truthM.x;
  const dy = estimateM.y - truthM.y;
  const dz = estimateM.z - truthM.z;
  const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const barM = getInterpolationErrorBarM(bodyId);

  if (errorM > barM) {
    failInvariant(invariantId, `Interpolation error exceeded cutover bar for body '${bodyId}'`, {
      errorM,
      barM,
      bodyId,
      tdbSeconds: truth.tdbSeconds,
    }, false);
  }
}
