import {
  ingestSlice1EarthMoonFixture,
  type Slice1EarthMoonCanonicalFixture,
  type HorizonsFixture,
} from './horizons.js';

const slice1EarthMoonFixtureUrl = new URL(
  '../../../tests/fixtures/v2/horizons-earth-moon-30d.json',
  import.meta.url,
);

export async function loadSlice1EarthMoonFixture(): Promise<Slice1EarthMoonCanonicalFixture> {
  const response = await fetch(slice1EarthMoonFixtureUrl);
  if (!response.ok) {
    throw new Error(`Failed to load Slice 1 Earth/Moon fixture: ${response.status} ${response.statusText}`);
  }

  const fixture = await response.json() as HorizonsFixture;
  return ingestSlice1EarthMoonFixture(fixture);
}
