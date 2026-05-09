export const AU_KM = 149_597_870.7;
export const SECONDS_PER_DAY = 86_400;
export const GM_SUN_M3_S2 = 1.32712440018e20;
export const GM_SUN_KM3_S2 = GM_SUN_M3_S2 / 1e9;
export const J2000_ECLIPTIC_OBLIQUITY_ARCSEC = 84_381.448;
export const J2000_ECLIPTIC_OBLIQUITY_DEG = J2000_ECLIPTIC_OBLIQUITY_ARCSEC / 3600;
export const J2000_ECLIPTIC_OBLIQUITY_RAD =
  (J2000_ECLIPTIC_OBLIQUITY_DEG * Math.PI) / 180;

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function normalizeAngleRad(value) {
  const tau = 2 * Math.PI;
  const wrapped = ((value % tau) + tau) % tau;
  return wrapped > Math.PI ? wrapped - tau : wrapped;
}

function rotatePerifocalToEcliptic(vector, cosOm, sinOm, cosI, sinI, cosW, sinW) {
  const q11 = cosOm * cosW - sinOm * sinW * cosI;
  const q12 = -cosOm * sinW - sinOm * cosW * cosI;
  const q21 = sinOm * cosW + cosOm * sinW * cosI;
  const q22 = -sinOm * sinW + cosOm * cosW * cosI;
  const q31 = sinW * sinI;
  const q32 = cosW * sinI;

  return {
    x: q11 * vector.x + q12 * vector.y,
    y: q21 * vector.x + q22 * vector.y,
    z: q31 * vector.x + q32 * vector.y,
  };
}

export function rotateEclipticToEquatorial(vector) {
  const cosObliquity = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RAD);
  const sinObliquity = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RAD);
  return {
    x: vector.x,
    y: vector.y * cosObliquity - vector.z * sinObliquity,
    z: vector.y * sinObliquity + vector.z * cosObliquity,
  };
}

export function solveKeplerEquation(meanAnomalyRad, eccentricity, options = {}) {
  const tolerance = options.toleranceRad ?? 1e-12;
  const maxIterations = options.maxIterations ?? 50;
  const M = normalizeAngleRad(meanAnomalyRad);

  let eccentricAnomaly =
    eccentricity < 0.8 ? M : (M >= 0 ? Math.PI : -Math.PI);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - M;
    const fp = 1 - eccentricity * Math.cos(eccentricAnomaly);
    const delta = f / fp;
    eccentricAnomaly -= delta;
    if (Math.abs(delta) <= tolerance) {
      return eccentricAnomaly;
    }
  }

  throw new Error(
    `Kepler solver failed to converge for e=${eccentricity} M=${meanAnomalyRad}`,
  );
}

export function propagateKeplerian(elements, targetJdTdb) {
  const aKm = elements.a * AU_KM;
  const eccentricity = elements.e;
  const inclinationRad = degToRad(elements.i);
  const ascendingNodeRad = degToRad(elements.om);
  const argumentOfPerihelionRad = degToRad(elements.w);
  const meanAnomaly0Rad = degToRad(elements.ma);
  const deltaSeconds = (targetJdTdb - elements.epoch_tdb) * SECONDS_PER_DAY;
  const meanMotionRadPerSec = Math.sqrt(GM_SUN_KM3_S2 / (aKm * aKm * aKm));
  const meanAnomalyRad = meanAnomaly0Rad + meanMotionRadPerSec * deltaSeconds;

  const eccentricAnomalyRad = solveKeplerEquation(meanAnomalyRad, eccentricity);
  const cosE = Math.cos(eccentricAnomalyRad);
  const sinE = Math.sin(eccentricAnomalyRad);
  const sqrtOneMinusESquared = Math.sqrt(1 - eccentricity * eccentricity);
  const radiusKm = aKm * (1 - eccentricity * cosE);

  const perifocalPositionKm = {
    x: aKm * (cosE - eccentricity),
    y: aKm * sqrtOneMinusESquared * sinE,
    z: 0,
  };
  const perifocalVelocityKmPerSec = {
    x: (-aKm * meanMotionRadPerSec * sinE) / (1 - eccentricity * cosE),
    y:
      (aKm * meanMotionRadPerSec * sqrtOneMinusESquared * cosE) /
      (1 - eccentricity * cosE),
    z: 0,
  };

  const cosOm = Math.cos(ascendingNodeRad);
  const sinOm = Math.sin(ascendingNodeRad);
  const cosI = Math.cos(inclinationRad);
  const sinI = Math.sin(inclinationRad);
  const cosW = Math.cos(argumentOfPerihelionRad);
  const sinW = Math.sin(argumentOfPerihelionRad);

  const eclipticPositionKm = rotatePerifocalToEcliptic(
    perifocalPositionKm,
    cosOm,
    sinOm,
    cosI,
    sinI,
    cosW,
    sinW,
  );
  const eclipticVelocityKmPerSec = rotatePerifocalToEcliptic(
    perifocalVelocityKmPerSec,
    cosOm,
    sinOm,
    cosI,
    sinI,
    cosW,
    sinW,
  );

  return {
    position_km: rotateEclipticToEquatorial(eclipticPositionKm),
    velocity_km_per_s: rotateEclipticToEquatorial(eclipticVelocityKmPerSec),
    metadata: {
      radius_km: radiusKm,
      mean_motion_rad_per_s: meanMotionRadPerSec,
      mean_anomaly_rad: meanAnomalyRad,
      eccentric_anomaly_rad: eccentricAnomalyRad,
    },
  };
}
