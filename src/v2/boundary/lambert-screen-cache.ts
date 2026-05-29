/**
 * Boundary loader for the Lambert screening cache fixture.
 *
 * The cache is generated offline by tools/build/precompute-lambert-screen.mjs
 * and shipped as tests/fixtures/v2/lambert-screen-cache.json.
 *
 * Downstream consumers:
 *   - Slice 10 Phase C UI: per-body badge/feasibility tag rendering
 *   - Slice 11 (pork-chops): seed initial focus from best windows
 *   - Slice 12 (delta-v stack): read min-C3 as the first stack item
 *   - Slice 14+ (composition, economics): filter on feasibility status
 */

import lambertScreenCacheJson from '../../../tests/fixtures/v2/lambert-screen-cache.json' with { type: 'json' };

export type LambertScreenStatus =
  | 'feasible'
  | 'high_c3'
  | 'lambert_unconvergeable'
  | 'propagator_failed';

export interface LambertScreenWindow {
  launchDate: string;
  tofDays: number;
  c3: number;
  vInfDep: number;
  vInfArr: number;
}

export interface LambertScreenResult {
  bodyId: string;
  spkId: number;
  designation: string;
  status: LambertScreenStatus;
  minC3: number | null;
  minC3Date: string | null;
  minC3TofDays: number | null;
  bestWindows: LambertScreenWindow[];
  isCoOrbital: boolean;
}

export interface LambertScreenCacheMetadata {
  generatedAt: string;
  catalogSize: number;
  screeningWindow: { startUtc: string; endUtc: string };
  departureGridSpacingDays: number;
  tofGridSpacingDays: number;
  tofMinDays: number;
  tofMaxDays: number;
  feasibleC3MaxKm2S2: number;
  coorbitalCriteria: {
    eMax: number;
    iMaxRad: number;
    aDeltaKm: number;
  };
  totalSolves: number;
  wallTimeSeconds: number;
}

export interface LambertScreenCache {
  metadata: LambertScreenCacheMetadata;
  bodies: LambertScreenResult[];
}

/**
 * Load the precomputed Lambert screening cache.
 *
 * This is a synchronous JSON import resolved at build time.
 */
export function loadLambertScreenCache(): LambertScreenCache {
  return lambertScreenCacheJson as LambertScreenCache;
}

/**
 * Build O(1) lookup indexes for repeated UI and pipeline queries.
 */
export function createLambertScreenIndex(cache: LambertScreenCache): {
  bySpkId: Map<number, LambertScreenResult>;
  byDesignation: Map<string, LambertScreenResult>;
  byBodyId: Map<string, LambertScreenResult>;
} {
  const bySpkId = new Map<number, LambertScreenResult>();
  const byDesignation = new Map<string, LambertScreenResult>();
  const byBodyId = new Map<string, LambertScreenResult>();

  for (const result of cache.bodies) {
    bySpkId.set(result.spkId, result);
    byDesignation.set(result.designation, result);
    byBodyId.set(result.bodyId, result);
  }

  return { bySpkId, byDesignation, byBodyId };
}
