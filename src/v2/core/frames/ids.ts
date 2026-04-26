export const FRAME_HELIO_J2000_ICRF = 'FRAME_HELIO_J2000_ICRF' as const;
export const FRAME_GCRS_EARTH = 'FRAME_GCRS_EARTH' as const;

export const FRAME_IDS = [
  FRAME_HELIO_J2000_ICRF,
  FRAME_GCRS_EARTH,
] as const;

export type FrameId = (typeof FRAME_IDS)[number];

export function isFrameId(value: unknown): value is FrameId {
  return (
    value === FRAME_HELIO_J2000_ICRF ||
    value === FRAME_GCRS_EARTH
  );
}
