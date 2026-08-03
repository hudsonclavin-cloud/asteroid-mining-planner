import {
  ingestSlice2Fixture,
  ingestSlice3Fixture,
  ingestSlice4Fixture,
  ingestSlice6Fixture,
} from '../../boundary/horizons.js';
import type { CanonicalStateSample, HorizonsFixture } from '../../boundary/horizons.js';
export { loadSlice7AsteroidCatalogFixture } from '../../boundary/slice7-asteroid-catalog.js';
export { loadSlice8AsteroidCatalogFixture } from '../../boundary/slice8-asteroid-catalog.js';
export { loadSlice9NeaCatalogFixture } from '../../boundary/slice9-nea-catalog.js';
import type { BodyId } from '../../core/constants/bodies.js';

const slice2FixtureUrl = new URL(
  '../../data/horizons-inner-system-rolling.json',
  import.meta.url,
);

const slice3FixtureUrl = new URL(
  '../../data/horizons-jupiter-system-rolling.json',
  import.meta.url,
);

const slice4FixtureUrl = new URL(
  '../../data/horizons-saturn-system-rolling.json',
  import.meta.url,
);

const slice6FixtureUrl = new URL(
  '../../data/horizons-mars-system-rolling.json',
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
  const [slice2Fixture, slice3Fixture, slice4Fixture, slice6Fixture] = await Promise.all([
    fetchFixture(slice2FixtureUrl, 'Slice 2 inner-system fixture'),
    fetchFixture(slice3FixtureUrl, 'Slice 3 Jupiter-system fixture'),
    fetchFixture(slice4FixtureUrl, 'Slice 4 Saturn-system fixture'),
    fetchFixture(slice6FixtureUrl, 'Slice 6 Mars-system fixture'),
  ]);

  const slice2States = ingestSlice2Fixture(slice2Fixture);
  const slice3States = ingestSlice3Fixture(slice3Fixture);
  const slice4States = ingestSlice4Fixture(slice4Fixture);
  const slice6States = ingestSlice6Fixture(slice6Fixture);

  return {
    ...(slice2States as Record<BodyId, CanonicalStateSample[]>),
    ...(slice3States as Record<BodyId, CanonicalStateSample[]>),
    ...(slice4States as Record<BodyId, CanonicalStateSample[]>),
    ...(slice6States as Record<BodyId, CanonicalStateSample[]>),
  };
}
