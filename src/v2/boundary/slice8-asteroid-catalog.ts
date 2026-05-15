import { ingestSlice8Fixture, type Slice8CanonicalFixture, type Slice8Fixture } from './horizons.js';

const slice8AsteroidCatalogFixtureUrl = new URL(
  '../../../tests/fixtures/v2/asteroid-catalog-slice8.json',
  import.meta.url,
);

export async function loadSlice8AsteroidCatalogFixture(): Promise<Slice8CanonicalFixture> {
  const response = await fetch(slice8AsteroidCatalogFixtureUrl);
  if (!response.ok) {
    throw new Error(`Failed to load Slice 8 asteroid catalog fixture: ${response.status} ${response.statusText}`);
  }

  const fixture = await response.json() as Slice8Fixture;
  return ingestSlice8Fixture(fixture);
}
