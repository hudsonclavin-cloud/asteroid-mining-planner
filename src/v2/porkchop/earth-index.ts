import type { CanonicalState } from '../core/types.js';
import { failInvariant } from '../core/invariants/runtime.js';
import {
  getBodyCadence,
  getInterpolationInvariantId,
  type BodyId,
} from '../core/constants/bodies.js';
import {
  interpolateBodyState,
  interpolateBodyStateSeries,
} from '../core/interpolators/hermite.js';

/**
 * Indexed Earth lookup for the porkchop layer (DEC-20-4).
 *
 * The linear production lookup first returns an exact node, then selects the
 * strict bracket and calls the same Hermite evaluator (hermite.ts:90-107).
 * This bisection changes only bracket discovery; endpoint refusal and the
 * interpolation operation remain the production behavior.
 */
export function interpolateIndexedBodyStateSeries(
  bodyId: BodyId,
  samples: readonly CanonicalState[],
  tdbSeconds: number,
): CanonicalState {
  if (samples.length === 0) {
    return interpolateBodyStateSeries(bodyId, samples, tdbSeconds);
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!(tdbSeconds >= first.tdbSeconds && tdbSeconds <= last.tdbSeconds)) {
    failInvariant(
      getInterpolationInvariantId(bodyId),
      `Requested interpolation time is outside available sample range for body '${bodyId}'`,
      {
        bodyId,
        tdbSeconds,
        minTdbSeconds: first.tdbSeconds,
        maxTdbSeconds: last.tdbSeconds,
        expectedCadenceSeconds: getBodyCadence(bodyId),
      },
    );
    throw new Error('unreachable');
  }

  let low = 0;
  let high = samples.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const sample = samples[middle];
    if (sample.tdbSeconds === tdbSeconds) {
      return sample;
    }
    if (sample.tdbSeconds < tdbSeconds) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  // At this point high is the strict left bracket and low is the strict right
  // bracket. The bounds check above guarantees that both indices exist.
  return interpolateBodyState(samples[high], samples[low], tdbSeconds);
}
