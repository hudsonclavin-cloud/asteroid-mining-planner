import { BODY_CONSTANTS } from '../core/constants/bodies.js';
import { GM_EARTH_M3_S2 } from '../core/constants/physical.js';

export const EARTH_MU_KM3_PER_S2 = GM_EARTH_M3_S2 / 1_000_000_000;
export const NHATS_ENTRY_ALTITUDE_KM = 125;
export const NHATS_ENTRY_SPEED_LIMIT_KMPS = 12;
export const EARTH_ENTRY_RADIUS_KM = BODY_CONSTANTS.earth.radiusM / 1_000 + NHATS_ENTRY_ALTITUDE_KM;
export const NHATS_ENTRY_VINF_LIMIT_KMPS = Math.sqrt(
  NHATS_ENTRY_SPEED_LIMIT_KMPS ** 2 - (2 * EARTH_MU_KM3_PER_S2) / EARTH_ENTRY_RADIUS_KM,
);

export const ENTRY_SPEED_METHOD_LABEL = 'entry-speed screen (two-body, inertial)';
export const NHATS_ENTRY_SPEED_LABEL = 'NHATS: \u2264 12 km/s at 125 km';
export const EARTH_MOON_CAPTURE_LABEL = 'Earth\u2013Moon capture not evaluated';

export interface EntrySpeedScreen {
  readonly vInfEarthKmps: number;
  readonly naturalEntrySpeedKmps: number;
  readonly exceedsLimit: boolean;
}

export function naturalEntrySpeedKmps(vInfEarthKmps: number): number {
  return Math.sqrt(vInfEarthKmps ** 2 + (2 * EARTH_MU_KM3_PER_S2) / EARTH_ENTRY_RADIUS_KM);
}

export function screenEntrySpeed(vInfEarthKmps: number): EntrySpeedScreen {
  const naturalEntrySpeed = naturalEntrySpeedKmps(vInfEarthKmps);
  return {
    vInfEarthKmps,
    naturalEntrySpeedKmps: naturalEntrySpeed,
    exceedsLimit: naturalEntrySpeed > NHATS_ENTRY_SPEED_LIMIT_KMPS,
  };
}

export function entryControlDvModelBKmps(vInfEarthKmps: number): number {
  return Math.max(0, Math.abs(vInfEarthKmps) - NHATS_ENTRY_VINF_LIMIT_KMPS);
}
