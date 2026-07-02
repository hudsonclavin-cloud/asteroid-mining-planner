export type LaunchSite = { name: string; latitudeDeg: number; iMaxDeg: number };
export type FeasibilityClass = 'GREEN' | 'AMBER' | 'RED' | null;

export const CAPE_CANAVERAL: LaunchSite = {
  name: 'Cape Canaveral',
  latitudeDeg: 28.5,
  iMaxDeg: 57,
};

export const VANDENBERG_SFB: LaunchSite = {
  name: 'Vandenberg SFB',
  latitudeDeg: 34.7,
  // Vandenberg azimuth range 158-201 covers inclinations ~65-~115;
  // practical prograde interplanetary ceiling is debated, so use 100.4
  // (complement of 79.6 retrograde minimum) as a conservative upper bound.
  // INV-016d disclosure covers edge cases.
  iMaxDeg: 100.4,
};

export const LAUNCH_SITES: ReadonlyArray<LaunchSite> = [CAPE_CANAVERAL, VANDENBERG_SFB];

/**
 * Classify a DLA value against a launch site's constraints.
 * GREEN: |DLA| <= latitudeDeg (direct, minimum-inclination injection)
 * AMBER: latitudeDeg < |DLA| <= iMaxDeg (direct but penalized - higher parking orbit)
 * RED: |DLA| > iMaxDeg (dogleg required - beyond azimuth-limit ceiling)
 * null: DLA is null (non-converged cell or near-zero |vInf|)
 *
 * Source: Cape azimuth limits 35-120 deg -> inclination 28.5-57 deg.
 * See src/v2/SLICE_12_FOUNDING.md OQ-12-2 / DEC-12-3.
 * INV-016d: callers must surface a disclosure that this classifies screening
 * feasibility only, not day-specific launch geometry.
 */
export function classifyFeasibility(dlaDeg: number | null, site: LaunchSite): FeasibilityClass {
  if (dlaDeg === null) {
    return null;
  }
  const absDla = Math.abs(dlaDeg);
  if (absDla <= site.latitudeDeg) {
    return 'GREEN';
  }
  if (absDla <= site.iMaxDeg) {
    return 'AMBER';
  }
  return 'RED';
}
