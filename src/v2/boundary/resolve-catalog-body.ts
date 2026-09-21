// Shared catalog-body resolution (Slice 18 close-out, Item 2).
//
// One rule for every page that takes a body identifier from a URL: the
// canonical bodyId ('asteroid-433') first, then the bare designation ('433').
// The compare page has resolved this way since 22d4fa7 (its ?bodies= list is
// designation-based); the porkchop page looked up the canonical key only, so
// /v2/porkchop/?body=433 answered "Body not found" while
// /v2/compare/?bodies=433 worked. Both pages now call this — the rule lives
// here once, not in each entry.
//
// Designations are unique across the catalog (the colocated test proves it),
// so the fallback is unambiguous. No normalisation is applied: the caller's
// string is looked up as given.

import type { AsteroidBodyId } from '../core/constants/asteroids.js';
import type { Slice9CanonicalFixture, Slice9NeaBody } from './slice9-nea-catalog.js';

export function resolveSlice9CatalogBody(
  catalog: Pick<Slice9CanonicalFixture, 'asteroids'>,
  requested: string,
): Slice9NeaBody | undefined {
  return (
    catalog.asteroids[requested as AsteroidBodyId] ??
    Object.values(catalog.asteroids).find((candidate) => candidate.designation === requested)
  );
}
