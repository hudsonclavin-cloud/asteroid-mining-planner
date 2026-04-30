import type { CanonicalState } from '../types.js';
import { failInvariant } from '../invariants/runtime.js';
import {
  getBodyCadence,
  getInterpolationInvariantId,
  type BodyId,
} from '../constants/bodies.js';

// Interpolate a single scalar component using cubic Hermite basis functions.
// p0, p1 are endpoint positions; v0, v1 are endpoint velocities; dt is the
// interval length in seconds; u is the normalized parameter in [0, 1].
function hermiteScalar(
  p0: number,
  v0: number,
  p1: number,
  v1: number,
  dt: number,
  u: number,
): number {
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return h00 * p0 + h10 * v0 * dt + h01 * p1 + h11 * v1 * dt;
}

// Analytical time-derivative of hermiteScalar, i.e. d/dt of the interpolated
// position.  d/dt = (d/du) * (1/dt).
function hermiteVelScalar(
  p0: number,
  v0: number,
  p1: number,
  v1: number,
  dt: number,
  u: number,
): number {
  const u2 = u * u;
  const dh00 = 6 * u2 - 6 * u;
  const dh10 = 3 * u2 - 4 * u + 1;
  const dh01 = -6 * u2 + 6 * u;
  const dh11 = 3 * u2 - 2 * u;
  return (dh00 * p0 + dh10 * v0 * dt + dh01 * p1 + dh11 * v1 * dt) / dt;
}

/**
 * Interpolate a body state between two bracketing CanonicalState samples using
 * cubic Hermite interpolation.  Both samples must carry the same frame and
 * bodyId (enforced by convention — no runtime check to keep this hot-path
 * allocation-light).
 *
 * @param s0          Left bracket sample (earlier time).
 * @param s1          Right bracket sample (later time).
 * @param tdbSeconds  Target time in TDB seconds since J2000.
 * @returns           New CanonicalState at the requested time.
 */
export function interpolateBodyState(
  s0: CanonicalState,
  s1: CanonicalState,
  tdbSeconds: number,
): CanonicalState {
  const dt = s1.tdbSeconds - s0.tdbSeconds;
  const u = (tdbSeconds - s0.tdbSeconds) / dt;

  const x = hermiteScalar(s0.positionM.x, s0.velocityMps.x, s1.positionM.x, s1.velocityMps.x, dt, u);
  const y = hermiteScalar(s0.positionM.y, s0.velocityMps.y, s1.positionM.y, s1.velocityMps.y, dt, u);
  const z = hermiteScalar(s0.positionM.z, s0.velocityMps.z, s1.positionM.z, s1.velocityMps.z, dt, u);

  const vx = hermiteVelScalar(s0.positionM.x, s0.velocityMps.x, s1.positionM.x, s1.velocityMps.x, dt, u);
  const vy = hermiteVelScalar(s0.positionM.y, s0.velocityMps.y, s1.positionM.y, s1.velocityMps.y, dt, u);
  const vz = hermiteVelScalar(s0.positionM.z, s0.velocityMps.z, s1.positionM.z, s1.velocityMps.z, dt, u);

  return {
    positionM: { x, y, z },
    velocityMps: { x: vx, y: vy, z: vz },
    frame: s0.frame,
    tdbSeconds,
  };
}

export function interpolateBodyStateSeries(
  bodyId: BodyId,
  samples: readonly CanonicalState[],
  tdbSeconds: number,
): CanonicalState {
  if (samples.length === 0) {
    failInvariant(
      getInterpolationInvariantId(bodyId),
      `Cannot interpolate empty sample series for body '${bodyId}'`,
      { bodyId, tdbSeconds, expectedCadenceSeconds: getBodyCadence(bodyId) }
    );
    throw new Error('unreachable');
  }

  for (const sample of samples) {
    if (sample.tdbSeconds === tdbSeconds) {
      return sample;
    }
  }

  for (let i = 0; i < samples.length - 1; i++) {
    const s0 = samples[i];
    const s1 = samples[i + 1];
    if (tdbSeconds > s0.tdbSeconds && tdbSeconds < s1.tdbSeconds) {
      return interpolateBodyState(s0, s1, tdbSeconds);
    }
  }

  failInvariant(
    getInterpolationInvariantId(bodyId),
    `Requested interpolation time is outside available sample range for body '${bodyId}'`,
    {
      bodyId,
      tdbSeconds,
      minTdbSeconds: samples[0].tdbSeconds,
      maxTdbSeconds: samples[samples.length - 1]?.tdbSeconds ?? samples[0].tdbSeconds,
      expectedCadenceSeconds: getBodyCadence(bodyId),
    }
  );
  throw new Error('unreachable');
}
