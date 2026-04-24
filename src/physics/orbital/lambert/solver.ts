import { izzoLambert } from './izzo.js';
import { lambert } from './gooding.js';
import { cart2kep } from '../keplerian/elements.js';
import { isPlausiblePlannerOrbit } from '../validation.js';

export function solveLambertWithOrbitGuard(r1: number[], r2: number[], tof_days: number, originState: { x: number; y: number; z: number }, epoch_JD: number) {
  let lam: { v1: number[]; v2: number[] } | null = null;
  let orbit_el: any = null;
  let usedFallback = false;
  let suspiciousIzzo = false;

  try { lam = izzoLambert(r1, r2, tof_days); } catch(e) {}
  if (lam && lam.v1 && lam.v2 && lam.v1.every(Number.isFinite) && lam.v2.every(Number.isFinite)) {
    try {
      orbit_el = cart2kep(originState.x, originState.y, originState.z, lam.v1[0], lam.v1[1], lam.v1[2], epoch_JD);
    } catch(e) {}
    if (!isPlausiblePlannerOrbit(orbit_el)) {
      lam = null;
      orbit_el = null;
      suspiciousIzzo = true;
    }
  } else {
    lam = null;
  }

  if (!lam) {
    try { lam = lambert(r1, r2, tof_days); usedFallback = true; } catch(e) {}
    if (lam && lam.v1 && lam.v2 && lam.v1.every(Number.isFinite) && lam.v2.every(Number.isFinite)) {
      try {
        orbit_el = cart2kep(originState.x, originState.y, originState.z, lam.v1[0], lam.v1[1], lam.v1[2], epoch_JD);
      } catch(e) {}
      if (!isPlausiblePlannerOrbit(orbit_el)) {
        lam = null;
        orbit_el = null;
      }
    } else {
      lam = null;
    }
  }

  return { lam, orbit_el, usedFallback, suspiciousIzzo };
}
