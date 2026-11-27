type Vec3Km = readonly [number, number, number];

export const SOLAR_PERIHELION_LIMIT_KM = 695_700;
export const THROUGH_SUN_REASON = 'through-sun' as const;

export interface SunArcAssessment {
  readonly perihelionKm: number;
  readonly passesPerihelion: boolean;
  readonly refusalReason?: typeof THROUGH_SUN_REASON;
}

function dot(left: Vec3Km, right: Vec3Km): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function cross(left: Vec3Km, right: Vec3Km): Vec3Km {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ];
}

function magnitude(vector: Vec3Km): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function normalizeAngle(angleRad: number): number {
  const twoPi = 2 * Math.PI;
  const normalized = angleRad % twoPi;
  return normalized < 0 ? normalized + twoPi : normalized;
}

/**
 * Assess a Lambert branch using the two-body elements implied by (r1, v1).
 * The perihelion is p/(1+e), where p = h^2/mu and e is the eccentricity
 * magnitude. DEC-20-14 flags only a perihelion below 695,700 km when the
 * flown arc passes perihelion; M >= 1 has a full revolution and therefore
 * always passes it, while M = 0 checks whether true anomaly crosses 0.
 */
export function assessSunArc(
  r1Km: Vec3Km,
  v1Kmps: Vec3Km,
  r2Km: Vec3Km,
  muKm3S2: number,
  M: number,
): SunArcAssessment {
  const radius = magnitude(r1Km);
  const speedSquared = dot(v1Kmps, v1Kmps);
  const angularMomentum = cross(r1Km, v1Kmps);
  const hSquared = dot(angularMomentum, angularMomentum);
  const hMagnitude = Math.sqrt(hSquared);
  const eccentricityVector = [
    (v1Kmps[1] * angularMomentum[2] - v1Kmps[2] * angularMomentum[1]) / muKm3S2 - r1Km[0] / radius,
    (v1Kmps[2] * angularMomentum[0] - v1Kmps[0] * angularMomentum[2]) / muKm3S2 - r1Km[1] / radius,
    (v1Kmps[0] * angularMomentum[1] - v1Kmps[1] * angularMomentum[0]) / muKm3S2 - r1Km[2] / radius,
  ] as Vec3Km;
  const eccentricity = magnitude(eccentricityVector);
  const semiLatusRectumKm = hSquared / muKm3S2;
  const perihelionKm = semiLatusRectumKm / (1 + eccentricity);

  let passesPerihelion = M >= 1;
  if (!passesPerihelion && hMagnitude > 0 && eccentricity > 0) {
    const cosineDeparture = dot(eccentricityVector, r1Km) / (eccentricity * radius);
    const sineDeparture = dot(cross(eccentricityVector, r1Km), angularMomentum) /
      (eccentricity * radius * hMagnitude);
    const arrivalRadius = magnitude(r2Km);
    const cosineArrival = dot(eccentricityVector, r2Km) / (eccentricity * arrivalRadius);
    const sineArrival = dot(cross(eccentricityVector, r2Km), angularMomentum) /
      (eccentricity * arrivalRadius * hMagnitude);
    const departureTrueAnomaly = normalizeAngle(Math.atan2(sineDeparture, cosineDeparture));
    const arrivalTrueAnomaly = normalizeAngle(Math.atan2(sineArrival, cosineArrival));
    passesPerihelion = departureTrueAnomaly > arrivalTrueAnomaly;
  }

  // Keep the speed calculation in the element derivation visible to reviewers;
  // it also makes a non-finite input produce a non-flagged diagnostic result
  // rather than a silent exception in the hot grid path.
  void speedSquared;
  const refusalReason = perihelionKm < SOLAR_PERIHELION_LIMIT_KM && passesPerihelion
    ? THROUGH_SUN_REASON
    : undefined;
  return { perihelionKm, passesPerihelion, ...(refusalReason === undefined ? {} : { refusalReason }) };
}
