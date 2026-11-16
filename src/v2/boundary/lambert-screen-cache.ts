/**
 * Boundary loader for the Lambert screening cache fixture.
 *
 * The cache is generated offline by tools/build/precompute-lambert-screen.mjs
 * and shipped as tests/fixtures/v2/lambert-screen-cache.json.
 *
 * Cache contract (schemaVersion: 1 or 2):
 *   schemaVersion 2 drops bestWindows per DEC-20-15; it is unrelated to Slice 11's
 *   deferred M=1 re-screen. Version 1 remains accepted for cached responses during
 *   the Pages cache window; its extra bestWindows field is ignored at runtime.
 *
 * Status meaning:
 *   low_departure_c3:       Best departure C3 <= feasibleC3MaxKm2S2
 *   high_departure_c3:      Solver converged, but best C3 > threshold
 *   lambert_unconvergeable: No Lambert solve converged at any grid point
 *   propagator_failed:      Keplerian propagator failed on this body's elements
 *
 * IMPORTANT: low_departure_c3 is a departure-energy screen ONLY. It does NOT mean
 * the body is "accessible" in the NHATS or full-mission-stack sense, which also
 * depends on arrival delta-v, stay time, and return trajectory terms. Slice 12+
 * adds those dimensions.
 *
 * minC3 values are stored at full f64 precision. Display rounding happens at the UI
 * layer.
 *
 * Downstream consumers:
 *   - Slice 10 Phase C UI: per-body badge / departure-C3 tag rendering
 *   - Slice 11 (pork-chops): seed initial focus from best windows
 *   - Slice 12 (delta-v stack): read min-C3 as the first stack item
 *   - Slice 14+ (composition, economics): filter on departure-energy status
 */

import { isNearZeroC3Degenerate } from '../core/constants/near-zero-c3.js';

export type LambertScreenStatus =
  | 'low_departure_c3'
  | 'high_departure_c3'
  | 'lambert_unconvergeable'
  | 'propagator_failed';

export interface LambertScreenResult {
  bodyId: string;
  spkId: number;
  designation: string;
  status: LambertScreenStatus;
  minC3: number | null;
  minC3Date: string | null;
  minC3TofDays: number | null;
  isCoOrbital: boolean;
  isNearZeroC3Degenerate: boolean;
}

export interface LambertScreenCacheMetadata {
  schemaVersion: 1 | 2;
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
  provenance: {
    solverCommit: string;
    catalogFixtureSha256: string;
    horizonsFixtureSha256: string;
    precomputeScriptSha256: string;
    generator?: {
      node: string;
      platform: string;
      arch: string;
      osRelease: string;
      treeClean: true;
    };
  };
}

export interface LambertScreenCache {
  metadata: LambertScreenCacheMetadata;
  bodies: LambertScreenResult[];
}

export function validateLambertScreenCache(cache: unknown): LambertScreenCache {
  if (!cache || typeof cache !== 'object') {
    throw new Error('Cache is not an object');
  }

  const typedCache = cache as Record<string, unknown>;
  if (!typedCache.metadata || typeof typedCache.metadata !== 'object') {
    throw new Error('Cache missing metadata');
  }

  const metadata = typedCache.metadata as Record<string, unknown>;
  if (metadata.schemaVersion !== 1 && metadata.schemaVersion !== 2) {
    throw new Error(`Cache schemaVersion ${metadata.schemaVersion} not supported (expected 1 or 2)`);
  }

  if (!Array.isArray(typedCache.bodies)) {
    throw new Error('Cache missing bodies array');
  }

  const bodies = (typedCache.bodies as LambertScreenResult[]).map((body) => ({
    ...body,
    isNearZeroC3Degenerate: isNearZeroC3Degenerate(body.minC3),
  }));

  return {
    metadata: typedCache.metadata as LambertScreenCacheMetadata,
    bodies,
  };
}

const CACHE_FILENAME = 'lambert-screen-cache.json';

function resolveCacheUrl(): string {
  const base = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/';
  return base.endsWith('/') ? `${base}${CACHE_FILENAME}` : `${base}/${CACHE_FILENAME}`;
}

let cachedPromise: Promise<LambertScreenCache> | null = null;

/**
 * Asynchronously load the Lambert screening cache.
 *
 * The cache JSON is fetched at runtime rather than bundled into the JS at build
 * time, to keep the bundle small and avoid Node OOM during builds.
 */
export function loadLambertScreenCacheAsync(): Promise<LambertScreenCache> {
  if (cachedPromise !== null) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    const url = resolveCacheUrl();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load Lambert screen cache from ${url}: ${response.status} ${response.statusText}`,
      );
    }
    const raw = await response.json();
    return validateLambertScreenCache(raw);
  })();

  return cachedPromise;
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
