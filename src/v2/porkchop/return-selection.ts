import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../core/units.js';
import type { SupportBoundary } from './support-boundary.js';
import type { PorkchopReturnBranch, PorkchopReturnGridParams } from './grid-compute.js';

export const RETURN_STAY_MIN_DAYS = 8;
/** Screening choice, not a sourced value (DEC-20-2 / OQ-20-2). */
export const RETURN_STAY_MAX_DAYS = 730.5;
export const RETURN_TOF_MIN_DAYS = 182.5;
export const RETURN_TOF_MAX_DAYS = 1826.25;

/** DEC-20-2: rank return branches by asteroid-departure |v_inf|, ties to M=0. */
export function selectReturnBranch(
  branches: readonly Pick<PorkchopReturnBranch, 'converged' | 'refusalReason' | 'vInfAsteroidDepartureKmps' | 'M'>[],
): number | null {
  let selectedIndex: number | null = null;
  let selectedSpeed = Number.POSITIVE_INFINITY;
  let selectedM = Number.POSITIVE_INFINITY;
  for (let index = 0; index < branches.length; index += 1) {
    const branch = branches[index];
    if (!branch.converged || branch.refusalReason !== undefined) continue;
    if (
      branch.vInfAsteroidDepartureKmps < selectedSpeed ||
      (branch.vInfAsteroidDepartureKmps === selectedSpeed && branch.M < selectedM)
    ) {
      selectedIndex = index;
      selectedSpeed = branch.vInfAsteroidDepartureKmps;
      selectedM = branch.M;
    }
  }
  return selectedIndex;
}

/** Return support is a flag at asteroid departure, never a refusal (DEC-20-5/6). */
export function isReturnDepartureUnsupported(
  departureJd: number,
  boundary: SupportBoundary | undefined,
): boolean | null {
  return boundary === undefined ? null : departureJd > boundary.encounterJd;
}

/** Paired return window for one outbound arrival. S_max is a screening choice, not a sourced value. */
export function pairedReturnGridParams(
  outboundArrivalTdbSeconds: number,
  options: { readonly nDep?: number; readonly nTof?: number; readonly earthMaxTdbSeconds?: number } = {},
): PorkchopReturnGridParams {
  const departureStartTdbSeconds = outboundArrivalTdbSeconds + RETURN_STAY_MIN_DAYS * SECONDS_PER_DAY;
  const departureEndTdbSeconds = outboundArrivalTdbSeconds + RETURN_STAY_MAX_DAYS * SECONDS_PER_DAY;
  return {
    depStartJD: J2000_TDB_JULIAN_DATE + departureStartTdbSeconds / SECONDS_PER_DAY,
    depEndJD: J2000_TDB_JULIAN_DATE + departureEndTdbSeconds / SECONDS_PER_DAY,
    tofMinDays: RETURN_TOF_MIN_DAYS,
    tofMaxDays: RETURN_TOF_MAX_DAYS,
    nDep: options.nDep ?? 2,
    nTof: options.nTof ?? 2,
    ...(options.earthMaxTdbSeconds === undefined ? {} : { earthMaxTdbSeconds: options.earthMaxTdbSeconds }),
  };
}
