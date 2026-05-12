export const FRAME_HELIO_J2000_ICRF = 'FRAME_HELIO_J2000_ICRF' as const;
export const FRAME_HELIO_J2000_ECLIPTIC = 'FRAME_HELIO_J2000_ECLIPTIC' as const;
export const FRAME_GCRS_EARTH = 'FRAME_GCRS_EARTH' as const;
export const FRAME_JUPITER_J2000_ICRF = 'FRAME_JUPITER_J2000_ICRF' as const;
export const FRAME_SATURN_J2000_ICRF = 'FRAME_SATURN_J2000_ICRF' as const;
export const FRAME_MARS_J2000_ICRF = 'FRAME_MARS_J2000_ICRF' as const;

export const FRAME_IDS = [
  FRAME_HELIO_J2000_ICRF,
  FRAME_HELIO_J2000_ECLIPTIC,
  FRAME_GCRS_EARTH,
  FRAME_JUPITER_J2000_ICRF,
  FRAME_SATURN_J2000_ICRF,
  FRAME_MARS_J2000_ICRF,
] as const;

export type FrameId = (typeof FRAME_IDS)[number];

export function isFrameId(value: unknown): value is FrameId {
  return (
    value === FRAME_HELIO_J2000_ICRF ||
    value === FRAME_HELIO_J2000_ECLIPTIC ||
    value === FRAME_GCRS_EARTH ||
    value === FRAME_JUPITER_J2000_ICRF ||
    value === FRAME_SATURN_J2000_ICRF ||
    value === FRAME_MARS_J2000_ICRF
  );
}
