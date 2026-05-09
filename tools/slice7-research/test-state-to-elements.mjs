import test from 'node:test';
import assert from 'node:assert/strict';

import { propagateKeplerian } from './keplerian-propagate.mjs';
import {
  cartesianToElements,
  elementsRadiansKmToPropagationInput,
} from './state-to-elements.mjs';

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function assertRoundTripMeters(elements, label) {
  const epochState = propagateKeplerian(elements, elements.epoch_tdb);
  const derived = cartesianToElements({
    position_km: [
      epochState.position_km.x,
      epochState.position_km.y,
      epochState.position_km.z,
    ],
    velocity_km_per_s: [
      epochState.velocity_km_per_s.x,
      epochState.velocity_km_per_s.y,
      epochState.velocity_km_per_s.z,
    ],
    epoch_tdb_jd: elements.epoch_tdb,
  });
  const rebuilt = propagateKeplerian(
    elementsRadiansKmToPropagationInput(derived),
    derived.epoch_tdb_jd,
  );

  const positionErrorMeters =
    vectorErrorKm(epochState.position_km, rebuilt.position_km) * 1000;
  const velocityErrorMetersPerSecond =
    vectorErrorKm(epochState.velocity_km_per_s, rebuilt.velocity_km_per_s) * 1000;

  assert.ok(
    positionErrorMeters < 1,
    `${label} position round-trip exceeded 1 meter: ${positionErrorMeters}`,
  );
  assert.ok(
    velocityErrorMetersPerSecond < 1e-6,
    `${label} velocity round-trip exceeded tolerance: ${velocityErrorMetersPerSecond}`,
  );
}

test('cartesianToElements round-trips an inclined eccentric orbit within 1 meter', () => {
  assertRoundTripMeters(
    {
      a: 2.3615413,
      e: 0.09016765,
      i: 7.14406,
      om: 103.7023,
      w: 151.53715,
      ma: 26.8096722,
      epoch_tdb: 2461161.5,
    },
    'inclined-eccentric',
  );
});

test('cartesianToElements handles an equatorial orbit', () => {
  assertRoundTripMeters(
    {
      a: 1.85,
      e: 0.22,
      i: 0,
      om: 0,
      w: 47,
      ma: 133,
      epoch_tdb: 2461161.5,
    },
    'equatorial',
  );
});

test('cartesianToElements handles a circular inclined orbit', () => {
  assertRoundTripMeters(
    {
      a: 2.8,
      e: 0,
      i: 18,
      om: 93,
      w: 0,
      ma: 125,
      epoch_tdb: 2461161.5,
    },
    'circular-inclined',
  );
});

test('cartesianToElements handles a high-e orbit', () => {
  assertRoundTripMeters(
    {
      a: 1.4,
      e: 0.9,
      i: 23,
      om: 120,
      w: 35,
      ma: 15,
      epoch_tdb: 2461161.5,
    },
    'high-e',
  );
});
