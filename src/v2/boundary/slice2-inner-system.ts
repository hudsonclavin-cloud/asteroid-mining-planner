import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestSlice2Fixture } from './horizons.js';
import type { CanonicalStateSample, HorizonsFixture } from './horizons.js';
import type { BodyId } from '../core/constants/bodies.js';

const fixtureUrl = new URL(
  '../../../tests/fixtures/v2/horizons-inner-system-90d.json',
  import.meta.url,
);

function loadFixtureData(): HorizonsFixture {
  const filePath = fileURLToPath(fixtureUrl);
  const text = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(text) as HorizonsFixture;
}

export function loadSlice2States(): Record<BodyId, CanonicalStateSample[]> {
  const fixture = loadFixtureData();
  return ingestSlice2Fixture(fixture) as Record<BodyId, CanonicalStateSample[]>;
}

// tdbSeconds of the first record: (first_jdTdb - 2451545.0) * 86400
// first_jdTdb = 2461161.5  (2026-May-01 00:00 TDB)
export const SLICE2_EPOCH_TDB: number = 830865600;
