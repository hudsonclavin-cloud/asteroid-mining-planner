import { ingestSlice7Fixture, type Slice7CanonicalFixture, type Slice7Fixture } from './horizons.js';

const slice7AsteroidCatalogFixtureUrl = new URL(
  '../../../tests/fixtures/v2/asteroid-catalog-slice7.json',
  import.meta.url,
);

export async function loadSlice7AsteroidCatalogFixture(): Promise<Slice7CanonicalFixture> {
  const response = await fetch(slice7AsteroidCatalogFixtureUrl);
  if (!response.ok) {
    throw new Error(`Failed to load Slice 7 asteroid catalog fixture: ${response.status} ${response.statusText}`);
  }

  const fixture = await response.json() as Slice7Fixture;
  return ingestSlice7Fixture(fixture);
}
