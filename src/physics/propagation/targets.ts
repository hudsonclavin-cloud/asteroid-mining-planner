import { R_moon, R_mars, EM_L1_RADIUS_KM, EM_L2_RADIUS_KM, DEFAULT_REDIRECT_CAPTURE } from '../constants/index.js';
import { propagatePlanet } from './planets.js';
import { propagateMoonState, propagateEarthMoonLagrangeState } from './moon.js';

export function resolveMissionTarget(destination: string, jd: number, r_park_km: number) {
  switch (destination) {
    case 'geo':
      return {
        key: 'geo',
        label: 'GEO',
        body: 'earth',
        state: propagatePlanet(2, jd),
        orbitRadiusKm: 42164,
        captureExtraDv: 0,
        captureBasis: 'patched-conic Earth capture',
      };
    case 'lunar':
      return {
        key: 'lunar',
        label: 'Lunar Surface',
        body: 'moon',
        state: propagateMoonState(jd),
        orbitRadiusKm: R_moon + 100,
        captureExtraDv: 1.6,
        captureBasis: 'patched-conic Moon capture + landing adder',
      };
    case 'l1':
      return {
        key: 'l1',
        label: 'Earth-Moon L1',
        body: 'eml1',
        state: propagateEarthMoonLagrangeState(jd, 'l1'),
        orbitRadiusKm: EM_L1_RADIUS_KM,
        captureExtraDv: 0.5,
        captureBasis: 'screening-grade Earth-Moon L1 insertion',
      };
    case 'l2':
      return {
        key: 'l2',
        label: 'Earth-Moon L2',
        body: 'eml2',
        state: propagateEarthMoonLagrangeState(jd, 'l2'),
        orbitRadiusKm: EM_L2_RADIUS_KM,
        captureExtraDv: 0.5,
        captureBasis: 'screening-grade Earth-Moon L2 insertion',
      };
    case 'mars':
      return {
        key: 'mars',
        label: 'Mars Orbit',
        body: 'mars',
        state: propagatePlanet(3, jd),
        orbitRadiusKm: R_mars + 400,
        captureExtraDv: 0.0,
        captureBasis: 'patched-conic Mars orbit insertion',
      };
    case 'leo':
    default:
      return {
        key: 'leo',
        label: 'LEO',
        body: 'earth',
        state: propagatePlanet(2, jd),
        orbitRadiusKm: r_park_km,
        captureExtraDv: 0,
        captureBasis: 'patched-conic Earth capture',
      };
  }
}

export function resolveRedirectCaptureTarget(captureProfile: any, jd: number) {
  const key = captureProfile?.key || DEFAULT_REDIRECT_CAPTURE.key;
  if (key === 'el4' || key === 'el5') {
    return {
      key,
      label: captureProfile.label,
      body: key,
      state: propagateEarthMoonLagrangeState(jd, key),
      orbitRadiusKm: captureProfile.orbitRadiusKm,
      captureExtraDv: captureProfile.captureExtraDv || 0,
      captureBasis: `screening-grade Earth-Moon ${key.toUpperCase()} insertion`,
    };
  }
  return {
    key: 'lunar_orbit',
    label: captureProfile.label,
    body: 'moon',
    state: propagateMoonState(jd),
    orbitRadiusKm: captureProfile.orbitRadiusKm || DEFAULT_REDIRECT_CAPTURE.orbitRadiusKm,
    captureExtraDv: captureProfile.captureExtraDv || 0,
    captureBasis: 'patched-conic Moon orbit insertion',
  };
}
