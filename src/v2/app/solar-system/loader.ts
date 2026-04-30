import { ingestSlice2Fixture, ingestSlice3Fixture } from '../../boundary/horizons.js';
import type { CanonicalStateSample, HorizonsFixture } from '../../boundary/horizons.js';
import type { BodyId } from '../../core/constants/bodies.js';

export const SLICE3_EPOCH_TDB = 830_865_600;

const slice2FixtureUrl = new URL(
  '../../../../tests/fixtures/v2/horizons-inner-system-90d.json',
  import.meta.url,
);

const slice3FixtureUrl = new URL(
  '../../../../tests/fixtures/v2/horizons-jupiter-system-90d.json',
  import.meta.url,
);

async function fetchFixture(fixtureUrl: URL, label: string): Promise<HorizonsFixture> {
  const response = await fetch(fixtureUrl);
  if (!response.ok) {
    throw new Error(`Failed to load ${label}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as HorizonsFixture;
}

export async function loadSolarSystemStatesBrowser(): Promise<Record<BodyId, CanonicalStateSample[]>> {
  const [slice2Fixture, slice3Fixture] = await Promise.all([
    fetchFixture(slice2FixtureUrl, 'Slice 2 inner-system fixture'),
    fetchFixture(slice3FixtureUrl, 'Slice 3 Jupiter-system fixture'),
  ]);

  const slice2States = ingestSlice2Fixture(slice2Fixture);
  const slice3States = ingestSlice3Fixture(slice3Fixture);

  return {
    ...(slice2States as Record<BodyId, CanonicalStateSample[]>),
    ...(slice3States as Record<BodyId, CanonicalStateSample[]>),
  };
}
