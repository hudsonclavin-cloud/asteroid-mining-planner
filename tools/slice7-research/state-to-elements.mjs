import {
  AU_KM,
  GM_SUN_KM3_S2,
  J2000_ECLIPTIC_OBLIQUITY_RAD,
  propagateKeplerian,
} from './keplerian-propagate.mjs';

const TWO_PI = 2 * Math.PI;
const EPSILON = 1e-12;

function normalizeAngleRad(value) {
  return ((value % TWO_PI) + TWO_PI) % TWO_PI;
}

function dot(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

function cross(left, right) {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function scale(vector, scalar) {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  };
}

function subtract(left, right) {
  return {
    x: left.x - right.x,
    y: left.y - right.y,
    z: left.z - right.z,
  };
}

function magnitude(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function normalize(vector) {
  const length = magnitude(vector);
  if (length <= EPSILON) {
    throw new Error('Cannot normalize near-zero vector');
  }
  return scale(vector, 1 / length);
}

export function rotateEquatorialToEcliptic(vector) {
  const cosObliquity = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RAD);
  const sinObliquity = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RAD);
  return {
    x: vector.x,
    y: vector.y * cosObliquity + vector.z * sinObliquity,
    z: -vector.y * sinObliquity + vector.z * cosObliquity,
  };
}

export function cartesianToElements(state, gmSunKm3S2 = GM_SUN_KM3_S2) {
  const rEquatorial = {
    x: state.position_km[0],
    y: state.position_km[1],
    z: state.position_km[2],
  };
  const vEquatorial = {
    x: state.velocity_km_per_s[0],
    y: state.velocity_km_per_s[1],
    z: state.velocity_km_per_s[2],
  };

  // propagateKeplerian expects classical elements in the ecliptic frame, then rotates
  // the resulting Cartesian state into equatorial ICRF. Invert that here so the
  // returned elements round-trip through the existing propagator unchanged.
  const r = rotateEquatorialToEcliptic(rEquatorial);
  const v = rotateEquatorialToEcliptic(vEquatorial);

  const rMag = magnitude(r);
  const vMag = magnitude(v);
  const h = cross(r, v);
  const hMag = magnitude(h);
  const hHat = normalize(h);
  const kHat = { x: 0, y: 0, z: 1 };
  const n = cross(kHat, h);
  const nMag = magnitude(n);
  const nHat = nMag > EPSILON ? scale(n, 1 / nMag) : null;

  const eccentricityVector = subtract(scale(cross(v, h), 1 / gmSunKm3S2), scale(r, 1 / rMag));
  const eccentricity = magnitude(eccentricityVector);
  const semiMajorAxisKm = 1 / ((2 / rMag) - (vMag * vMag) / gmSunKm3S2);
  const inclinationRad = Math.acos(Math.max(-1, Math.min(1, h.z / hMag)));

  const ascendingNodeRad =
    nMag > EPSILON ? normalizeAngleRad(Math.atan2(n.y, n.x)) : 0;

  let argumentOfPerihelionRad = 0;
  let trueAnomalyRad = 0;

  if (eccentricity > EPSILON) {
    const eHat = scale(eccentricityVector, 1 / eccentricity);
    const qHat = cross(hHat, eHat);

    if (nMag > EPSILON) {
      argumentOfPerihelionRad = normalizeAngleRad(
        Math.atan2(dot(cross(nHat, eHat), hHat), dot(nHat, eHat)),
      );
    } else {
      argumentOfPerihelionRad = normalizeAngleRad(Math.atan2(eHat.y, eHat.x));
    }

    const rHat = scale(r, 1 / rMag);
    trueAnomalyRad = normalizeAngleRad(Math.atan2(dot(rHat, qHat), dot(rHat, eHat)));
  } else if (nMag > EPSILON) {
    const rHat = scale(r, 1 / rMag);
    const qHat = cross(hHat, nHat);
    trueAnomalyRad = normalizeAngleRad(Math.atan2(dot(rHat, qHat), dot(rHat, nHat)));
  } else {
    trueAnomalyRad = normalizeAngleRad(Math.atan2(r.y, r.x));
  }

  let eccentricAnomalyRad = trueAnomalyRad;
  let meanAnomalyRad = trueAnomalyRad;
  if (eccentricity > EPSILON) {
    const sqrtFactor = Math.sqrt((1 - eccentricity) / (1 + eccentricity));
    eccentricAnomalyRad = 2 * Math.atan(sqrtFactor * Math.tan(trueAnomalyRad / 2));
    if (eccentricAnomalyRad < 0) {
      eccentricAnomalyRad += TWO_PI;
    }
    meanAnomalyRad = normalizeAngleRad(
      eccentricAnomalyRad - eccentricity * Math.sin(eccentricAnomalyRad),
    );
  }

  return {
    a: semiMajorAxisKm,
    e: eccentricity,
    i: inclinationRad,
    om: ascendingNodeRad,
    w: argumentOfPerihelionRad,
    ma: meanAnomalyRad,
    epoch_tdb_jd: state.epoch_tdb_jd,
  };
}

export function elementsRadiansKmToPropagationInput(elements) {
  return {
    a: elements.a / AU_KM,
    e: elements.e,
    i: (elements.i * 180) / Math.PI,
    om: (elements.om * 180) / Math.PI,
    w: (elements.w * 180) / Math.PI,
    ma: (elements.ma * 180) / Math.PI,
    epoch_tdb: elements.epoch_tdb_jd,
  };
}

export function elementsToCartesianAtEpoch(elements) {
  const propagationInput = elementsRadiansKmToPropagationInput(elements);
  return propagateKeplerian(propagationInput, elements.epoch_tdb_jd);
}
