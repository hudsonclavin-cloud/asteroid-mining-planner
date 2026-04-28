export type BodyId = 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars';

export interface BodyConstants {
  naifId: number;
  radiusM: number;
  vizColor: number;  // render/ layer reads this; core/ must not use it for physics
}

export const BODY_CONSTANTS: Record<BodyId, BodyConstants> = {
  sun:     { naifId: 10,  radiusM: 696_000_000.0, vizColor: 0xFFF5E0 },
  mercury: { naifId: 199, radiusM:   2_439_700.0, vizColor: 0xB5B5B5 },
  venus:   { naifId: 299, radiusM:   6_051_800.0, vizColor: 0xE8C98A },
  earth:   { naifId: 399, radiusM:   6_378_136.6, vizColor: 0x4B9CD3 },
  moon:    { naifId: 301, radiusM:   1_737_400.0, vizColor: 0xB0B0B0 },
  mars:    { naifId: 499, radiusM:   3_396_190.0, vizColor: 0xC1440E },
};

// INV-008 cutover bars in meters (km values from founding doc × 1000)
export const INV008_BARS_M: Record<BodyId, number> = {
  sun:      0.02,      // 0.00002 km
  mercury: 100_000,    // 100 km
  venus:    1_000,     // 1 km
  earth:      500,     // 0.5 km
  moon:    20_000,     // 20 km
  mars:        50,     // 0.05 km
};
