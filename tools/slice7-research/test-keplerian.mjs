import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AU_KM,
  GM_SUN_KM3_S2,
  J2000_ECLIPTIC_OBLIQUITY_RAD,
  SECONDS_PER_DAY,
  propagateKeplerian,
  rotateEclipticToEquatorial,
  solveKeplerEquation,
} from './keplerian-propagate.mjs';

function vectorNorm(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function multiplyMatrix3(matrix, vector) {
  return {
    x: matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z,
    y: matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z,
    z: matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z,
  };
}

function buildPerifocalToEclipticMatrix(elements) {
  const om = (elements.om * Math.PI) / 180;
  const inc = (elements.i * Math.PI) / 180;
  const w = (elements.w * Math.PI) / 180;
  const cosOm = Math.cos(om);
  const sinOm = Math.sin(om);
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  return [
    [cosOm * cosW - sinOm * sinW * cosI, -cosOm * sinW - sinOm * cosW * cosI, 0],
    [sinOm * cosW + cosOm * sinW * cosI, -sinOm * sinW + cosOm * cosW * cosI, 0],
    [sinW * sinI, cosW * sinI, 0],
  ];
}

function buildStateAtEpochDirectly(elements) {
  const aKm = elements.a * AU_KM;
  const e = elements.e;
  const meanAnomalyRad = (elements.ma * Math.PI) / 180;
  const eccentricAnomalyRad = solveKeplerEquation(meanAnomalyRad, e);
  const cosE = Math.cos(eccentricAnomalyRad);
  const sinE = Math.sin(eccentricAnomalyRad);
  const sqrtOneMinusESquared = Math.sqrt(1 - e * e);
  const perifocalPositionKm = {
    x: aKm * (cosE - e),
    y: aKm * sqrtOneMinusESquared * sinE,
    z: 0,
  };
  const meanMotion = Math.sqrt(GM_SUN_KM3_S2 / (aKm * aKm * aKm));
  const perifocalVelocityKmPerSec = {
    x: (-aKm * meanMotion * sinE) / (1 - e * cosE),
    y: (aKm * meanMotion * sqrtOneMinusESquared * cosE) / (1 - e * cosE),
    z: 0,
  };
  const matrix = buildPerifocalToEclipticMatrix(elements);
  return {
    position: rotateEclipticToEquatorial(multiplyMatrix3(matrix, perifocalPositionKm)),
    velocity: rotateEclipticToEquatorial(multiplyMatrix3(matrix, perifocalVelocityKmPerSec)),
  };
}

function shiftedEpochElements(elements, deltaDays) {
  const aKm = elements.a * AU_KM;
  const meanMotionDegPerDay =
    (Math.sqrt(GM_SUN_KM3_S2 / (aKm * aKm * aKm)) * SECONDS_PER_DAY * 180) / Math.PI;
  return {
    ...elements,
    epoch_tdb: elements.epoch_tdb + deltaDays,
    ma: elements.ma + meanMotionDegPerDay * deltaDays,
  };
}

const TEST_ELEMENTS = {
  a: 2.361541280084789,
  e: 0.09016764504738634,
  i: 7.144060599543863,
  om: 103.7022980342142,
  w: 151.5371488873794,
  ma: 26.80967220901607,
  epoch_tdb: 2461000.5,
};

test('propagateKeplerian reproduces the epoch state implied by the elements', () => {
  const propagated = propagateKeplerian(TEST_ELEMENTS, TEST_ELEMENTS.epoch_tdb);
  const direct = buildStateAtEpochDirectly(TEST_ELEMENTS);
  const positionErrorKm = vectorNorm(subtract(propagated.position_km, direct.position));
  const velocityErrorKmPerSec = vectorNorm(
    subtract(propagated.velocity_km_per_s, direct.velocity),
  );

  assert.ok(positionErrorKm <= 1e-6, `expected <=1 meter position error, got ${positionErrorKm} km`);
  assert.ok(
    velocityErrorKmPerSec <= 1e-9,
    `expected <=1e-9 km/s velocity error, got ${velocityErrorKmPerSec} km/s`,
  );
});

test('forward-then-backward epoch shift returns to the initial state within 1 meter', () => {
  const shifted = shiftedEpochElements(TEST_ELEMENTS, 30);
  const propagatedBack = propagateKeplerian(shifted, TEST_ELEMENTS.epoch_tdb);
  const initial = propagateKeplerian(TEST_ELEMENTS, TEST_ELEMENTS.epoch_tdb);
  const errorKm = vectorNorm(subtract(propagatedBack.position_km, initial.position_km));
  assert.ok(errorKm <= 1e-6, `expected <=1 meter round-trip error, got ${errorKm} km`);
});

test('angular momentum and specific orbital energy remain conserved over 90 days', () => {
  const checkpoints = [0, 30, 60, 90].map((days) =>
    propagateKeplerian(TEST_ELEMENTS, TEST_ELEMENTS.epoch_tdb + days),
  );
  const baselineH = cross(checkpoints[0].position_km, checkpoints[0].velocity_km_per_s);
  const baselineHNorm = vectorNorm(baselineH);
  const baselineEnergy =
    0.5 * dot(checkpoints[0].velocity_km_per_s, checkpoints[0].velocity_km_per_s) -
    GM_SUN_KM3_S2 / vectorNorm(checkpoints[0].position_km);

  for (const state of checkpoints.slice(1)) {
    const h = cross(state.position_km, state.velocity_km_per_s);
    const energy =
      0.5 * dot(state.velocity_km_per_s, state.velocity_km_per_s) -
      GM_SUN_KM3_S2 / vectorNorm(state.position_km);
    const relativeHError = vectorNorm(subtract(h, baselineH)) / baselineHNorm;
    assert.ok(
      relativeHError <= 1e-12,
      `expected angular momentum conservation, got relative |Δh|=${relativeHError}`,
    );
    assert.ok(
      Math.abs(energy - baselineEnergy) <= 1e-12,
      `expected energy conservation, got ΔE=${energy - baselineEnergy}`,
    );
  }
});

test('high-e solver converges for e=0.9 within iteration cap', () => {
  const eccentricAnomaly = solveKeplerEquation(2.4, 0.9, { maxIterations: 50 });
  assert.ok(Number.isFinite(eccentricAnomaly));
});

test('obliquity constant matches the V2 boundary rotation convention', () => {
  const expected = (84_381.448 / 3600) * (Math.PI / 180);
  assert.ok(
    Math.abs(J2000_ECLIPTIC_OBLIQUITY_RAD - expected) <= 1e-15,
    `expected obliquity ${expected}, got ${J2000_ECLIPTIC_OBLIQUITY_RAD}`,
  );
});
