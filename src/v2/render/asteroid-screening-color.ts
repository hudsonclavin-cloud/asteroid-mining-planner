import * as THREE from 'three';
import type { LambertScreenResult } from '../boundary/lambert-screen-cache.js';

// INV-016 honesty layer: co-orbital bodies remain visually marked regardless
// of screening status because their propagation quality has known limits.
const LOW_C3_MIN = 0;
const LOW_C3_MAX = 25;

// S-S17-FRONTB-BATCH-2026-08-11-A: saturation raised on the two desaturated
// entries so screened bodies separate from the white/grey starfield by HUE,
// not by brightness (brightness was measured to be the wrong axis — see
// asteroid-points-shader.ts header). The status->hue mapping is unchanged:
// green still means low departure C3, blue still means high, dim still means
// worse within the low-C3 ramp. Only the chroma of the dim/grey ends moves.
//   LOW_C3_DIM  0x206040 -> 0x18a060  (S 0.50 -> 0.74; stays clearly dimmer
//                                      than the bright end, but stops reading
//                                      as near-grey against stars)
//   HIGH_C3     0x6080a0 -> 0x4080c0  (S 0.25 -> 0.50 at the same lightness;
//                                      was a blue-grey nearly indistinguishable
//                                      from a white star)
const COLOR_LOW_C3_BRIGHT = new THREE.Color(0x00ff80);
const COLOR_LOW_C3_DIM = new THREE.Color(0x18a060);
const COLOR_COORBITAL_TINT = new THREE.Color(0x40e0e0);
const COLOR_HIGH_C3 = new THREE.Color(0x4080c0);
const COLOR_LAMBERT_UNCONVERGEABLE = new THREE.Color(0xcc00cc);
const COLOR_PROPAGATOR_FAILED = new THREE.Color(0xcc4040);

const COORBITAL_TINT_WEIGHT = 0.35;

export function getScreeningColor(screen: LambertScreenResult): THREE.Color {
  let base: THREE.Color;

  switch (screen.status) {
    case 'low_departure_c3': {
      const minC3 = screen.minC3 ?? LOW_C3_MAX;
      const clamped = Math.max(LOW_C3_MIN, Math.min(LOW_C3_MAX, minC3));
      const t = (clamped - LOW_C3_MIN) / (LOW_C3_MAX - LOW_C3_MIN);
      base = new THREE.Color().lerpColors(COLOR_LOW_C3_BRIGHT, COLOR_LOW_C3_DIM, t);
      break;
    }
    case 'high_departure_c3':
      base = COLOR_HIGH_C3.clone();
      break;
    case 'lambert_unconvergeable':
      base = COLOR_LAMBERT_UNCONVERGEABLE.clone();
      break;
    case 'propagator_failed':
      base = COLOR_PROPAGATOR_FAILED.clone();
      break;
    default:
      base = COLOR_HIGH_C3.clone();
      break;
  }

  if (screen.isCoOrbital) {
    base.lerp(COLOR_COORBITAL_TINT, COORBITAL_TINT_WEIGHT);
  }

  return base;
}
