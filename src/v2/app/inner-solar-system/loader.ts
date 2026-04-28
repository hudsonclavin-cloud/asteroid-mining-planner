/**
 * Browser-compatible async loader for the Slice 2 inner-system fixture.
 * Uses fetch + import.meta.url instead of node:fs, so it works in both
 * Vite dev and the production bundle.
 */
import { ingestSlice2Fixture } from '../../boundary/horizons.js';
import type { CanonicalStateSample, HorizonsFixture } from '../../boundary/horizons.js';
import type { BodyId } from '../../core/constants/bodies.js';

// tdbSeconds of the first record — mirrors SLICE2_EPOCH_TDB in slice2-inner-system.ts
export const SLICE2_EPOCH_TDB: number = 830865600;

const fixtureUrl = new URL(
  '../../../../tests/fixtures/v2/horizons-inner-system-90d.json',
  import.meta.url,
);

export async function loadSlice2StatesBrowser(): Promise<Record<BodyId, CanonicalStateSample[]>> {
  const response = await fetch(fixtureUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to load Slice 2 inner-system fixture: ${response.status} ${response.statusText}`,
    );
  }
  const fixture = (await response.json()) as HorizonsFixture;
  return ingestSlice2Fixture(fixture) as Record<BodyId, CanonicalStateSample[]>;
}
