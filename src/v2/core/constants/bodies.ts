export type BodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'io'
  | 'europa'
  | 'ganymede'
  | 'callisto';

export interface TriaxialRadiiM {
  a: number;
  b: number;
  c: number;
}

export type InterpolationInvariantId = 'INV-008' | 'INV-009';

export interface BodyConstants {
  naifId: number;
  radiusM: number;
  radiiM?: TriaxialRadiiM;
  vizColor: number;  // render/ layer reads this; core/ must not use it for physics
}

export const BODY_CONSTANTS: Record<BodyId, BodyConstants> = {
  sun:       { naifId: 10,  radiusM: 696_000_000.0, vizColor: 0xFFF5E0 },
  mercury:   { naifId: 199, radiusM:   2_439_700.0, vizColor: 0xB5B5B5 },
  venus:     { naifId: 299, radiusM:   6_051_800.0, vizColor: 0xE8C98A },
  earth:     { naifId: 399, radiusM:   6_378_136.6, vizColor: 0x4B9CD3 },
  moon:      { naifId: 301, radiusM:   1_737_400.0, vizColor: 0xB0B0B0 },
  mars:      { naifId: 499, radiusM:   3_396_190.0, vizColor: 0xC1440E },
  jupiter:   {
    naifId: 599,
    radiusM: 71_492_000.0,
    radiiM: { a: 71_492_000.0, b: 71_492_000.0, c: 66_854_000.0 },
    vizColor: 0xD9C3A3,
  },
  // Io and Europa are mildly triaxial in pck00010, but Slice 3 renders all
  // Galileans as spheres using their a-axis radius by deliberate policy.
  io:        { naifId: 501, radiusM:    1_829_400.0, vizColor: 0xC9A15A },
  europa:    { naifId: 502, radiusM:    1_562_600.0, vizColor: 0xD8D3C5 },
  ganymede:  { naifId: 503, radiusM:    2_631_200.0, vizColor: 0x9A8F7A },
  callisto:  { naifId: 504, radiusM:    2_410_300.0, vizColor: 0x5E5851 },
};

// INV-008 cutover bars in meters (km values from founding doc × 1000)
export const INV008_BARS_M: Record<
  'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars',
  number
> = {
  sun:      0.02,      // 0.00002 km
  mercury: 100_000,    // 100 km
  venus:    1_000,     // 1 km
  earth:      500,     // 0.5 km
  moon:    20_000,     // 20 km
  mars:        50,     // 0.05 km
};

// Unified interpolation bars across Slice 2 (INV-008) and Slice 3 (INV-009).
export const INTERPOLATION_ERROR_BARS_M: Record<BodyId, number> = {
  ...INV008_BARS_M,
  jupiter:   50_000,  // 50 km
  io:         5_000,  // 5 km
  europa:    20_000,  // 20 km
  ganymede:  20_000,  // 20 km
  callisto:  50_000,  // 50 km
};

export const BODY_CADENCE_SECONDS: Record<BodyId, number> = {
  sun:      86_400,
  mercury:  86_400,
  venus:    86_400,
  earth:    86_400,
  moon:     86_400,
  mars:     86_400,
  jupiter:  86_400,
  io:        3_600,
  europa:   10_800,
  ganymede: 21_600,
  callisto: 43_200,
};

export const BODY_INTERPOLATION_INVARIANTS: Record<BodyId, InterpolationInvariantId> = {
  sun: 'INV-008',
  mercury: 'INV-008',
  venus: 'INV-008',
  earth: 'INV-008',
  moon: 'INV-008',
  mars: 'INV-008',
  jupiter: 'INV-009',
  io: 'INV-009',
  europa: 'INV-009',
  ganymede: 'INV-009',
  callisto: 'INV-009',
};

export function getBodyCadence(bodyId: BodyId): number {
  return BODY_CADENCE_SECONDS[bodyId];
}

export function getInterpolationErrorBarM(bodyId: BodyId): number {
  return INTERPOLATION_ERROR_BARS_M[bodyId];
}

export function getInterpolationInvariantId(bodyId: BodyId): InterpolationInvariantId {
  return BODY_INTERPOLATION_INVARIANTS[bodyId];
}
