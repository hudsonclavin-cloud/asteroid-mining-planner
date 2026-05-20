import { deriveAsteroidRadiusMFromAbsoluteMagnitude } from '../../src/v2/core/constants/asteroids.js';
import { propagateKeplerianStateVectors } from '../../src/v2/core/propagators/keplerian.js';

export interface Slice9PerfBody {
  readonly bodyId: string;
  readonly designation: string;
  readonly orbitClass: string;
  readonly anchorSource: string;
  readonly inv014Tier: string;
  readonly renderRadiusM: number;
  readonly anchorPositionM: readonly [number, number, number];
  readonly elements: {
    readonly aM: number;
    readonly e: number;
    readonly iRad: number;
    readonly omRad: number;
    readonly wRad: number;
    readonly maRad: number;
    readonly epochTdbSeconds: number;
  };
}

export interface Slice9PerfPropagationBatch {
  readonly positionsM: Float64Array;
  readonly fallbackBodyCount: number;
}

const RENDER_RADIUS_FALLBACK_M = 250;

export function resolveSlice9PerfRenderRadiusM(
  estimatedRadiusM: number | null,
  absoluteMagnitudeH: number | null,
): number {
  if (typeof estimatedRadiusM === 'number' && Number.isFinite(estimatedRadiusM) && estimatedRadiusM > 0) {
    return estimatedRadiusM;
  }
  if (typeof absoluteMagnitudeH === 'number' && Number.isFinite(absoluteMagnitudeH)) {
    return deriveAsteroidRadiusMFromAbsoluteMagnitude(absoluteMagnitudeH);
  }
  return RENDER_RADIUS_FALLBACK_M;
}

export function isSlice9PerfEllipticBody(body: Slice9PerfBody): boolean {
  return (
    Number.isFinite(body.elements.aM) &&
    body.elements.aM > 0 &&
    Number.isFinite(body.elements.e) &&
    body.elements.e >= 0 &&
    body.elements.e < 1
  );
}

export function propagateSlice9PerfBodies(
  bodies: readonly Slice9PerfBody[],
  targetTdbSeconds: number,
): Slice9PerfPropagationBatch {
  const positionsM = new Float64Array(bodies.length * 3);
  let fallbackBodyCount = 0;

  for (let bodyIndex = 0; bodyIndex < bodies.length; bodyIndex += 1) {
    const body = bodies[bodyIndex];
    const offset = bodyIndex * 3;

    if (isSlice9PerfEllipticBody(body)) {
      const propagated = propagateKeplerianStateVectors(body.elements, targetTdbSeconds, {
        radiusM: body.renderRadiusM,
      });
      positionsM[offset] = propagated.positionM.x;
      positionsM[offset + 1] = propagated.positionM.y;
      positionsM[offset + 2] = propagated.positionM.z;
      continue;
    }

    fallbackBodyCount += 1;
    positionsM[offset] = body.anchorPositionM[0];
    positionsM[offset + 1] = body.anchorPositionM[1];
    positionsM[offset + 2] = body.anchorPositionM[2];
  }

  return {
    positionsM,
    fallbackBodyCount,
  };
}
